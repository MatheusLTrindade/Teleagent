import { Bot, InlineKeyboard, GrammyError } from "grammy";
import type { TeleagentConfig } from "./config.js";
import { saveConfig } from "./config.js";
import {
  answerDecision,
  answerDecisionByMessageId,
  getDecision,
  rememberChatId,
  type DecisionRequest,
} from "./store.js";
import { escapeHtml } from "./util.js";

export type AlertLevel = "info" | "warn" | "error";

const LEVEL_ICON: Record<AlertLevel, string> = {
  info: "ℹ️",
  warn: "⚠️",
  error: "🚨",
};

export function createBot(token: string): Bot {
  return new Bot(token);
}

export function formatAlert(opts: {
  project: string;
  message: string;
  level: AlertLevel;
}): string {
  const icon = LEVEL_ICON[opts.level];
  return [
    `${icon} <b>Teleagent · ${escapeHtml(opts.project)}</b>`,
    "",
    escapeHtml(opts.message),
  ].join("\n");
}

export function formatAsk(decision: DecisionRequest): string {
  const lines = [
    `❓ <b>Teleagent · ${escapeHtml(decision.project)}</b>`,
    "",
    escapeHtml(decision.question),
    "",
    `<code>id: ${escapeHtml(decision.id)}</code>`,
  ];
  if (decision.options?.length) {
    lines.push("", "Opções: " + decision.options.map((o) => `<code>${escapeHtml(o)}</code>`).join(" · "));
  } else {
    lines.push("", "Responda a esta mensagem com sua decisão.");
  }
  return lines.join("\n");
}

export function optionsKeyboard(
  decisionId: string,
  options: string[],
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  options.forEach((option, index) => {
    keyboard.text(option, `decide:${decisionId}:${index}`);
    if ((index + 1) % 2 === 0) keyboard.row();
  });
  return keyboard;
}

export async function sendAlert(
  bot: Bot,
  chatId: string,
  opts: { project: string; message: string; level: AlertLevel },
): Promise<number> {
  const msg = await bot.api.sendMessage(chatId, formatAlert(opts), {
    parse_mode: "HTML",
  });
  return msg.message_id;
}

export async function sendAsk(
  bot: Bot,
  chatId: string,
  decision: DecisionRequest,
): Promise<number> {
  const text = formatAsk(decision);
  const msg = decision.options?.length
    ? await bot.api.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup: optionsKeyboard(decision.id, decision.options),
      })
    : await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
  return msg.message_id;
}

export function wireBotHandlers(
  bot: Bot,
  config: TeleagentConfig,
  onLog: (line: string) => void = console.log,
): void {
  bot.command("start", async (ctx) => {
    const chatId = String(ctx.chat.id);
    rememberChatId(chatId);
    saveConfig({
      botToken: config.botToken,
      chatId,
      port: config.port,
      host: config.host,
    });
    onLog(`chat_id vinculado: ${chatId}`);
    await ctx.reply(
      [
        "Teleagent conectado.",
        "",
        `chat_id: ${chatId}`,
        "",
        "Alertas e pedidos de decisão dos agentes Cursor chegarão aqui.",
        "Responda às mensagens de pergunta, ou use os botões quando houver opções.",
      ].join("\n"),
    );
  });

  bot.command("status", async (ctx) => {
    await ctx.reply("Teleagent online. Bridge local ativo.");
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Comandos:",
        "/start — vincula este chat ao Teleagent",
        "/status — verifica se o bridge está online",
        "/help — esta ajuda",
        "",
        "Para decisões abertas: responda a mensagem do pedido.",
        "Para decisões com opções: toque no botão.",
      ].join("\n"),
    );
  });

  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (!data.startsWith("decide:")) {
      await ctx.answerCallbackQuery();
      return;
    }
    const parts = data.split(":");
    const decisionId = parts[1];
    const optionIndex = Number(parts[2]);
    if (!decisionId || !Number.isFinite(optionIndex)) {
      await ctx.answerCallbackQuery({ text: "Pedido inválido" });
      return;
    }
    const decision = getDecision(decisionId);
    if (!decision || decision.status !== "pending") {
      await ctx.answerCallbackQuery({ text: "Pedido já resolvido ou expirado" });
      return;
    }
    const answer = decision.options?.[optionIndex];
    if (!answer) {
      await ctx.answerCallbackQuery({ text: "Opção inválida" });
      return;
    }
    answerDecision(decisionId, answer);
    await ctx.answerCallbackQuery({ text: `Escolhido: ${answer}` });
    await ctx.editMessageText(
      `${formatAsk(decision)}\n\n✅ Decisão: <b>${escapeHtml(answer)}</b>`,
      { parse_mode: "HTML" },
    );
    onLog(`decisão ${decisionId} = ${answer}`);
  });

  bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;
    const replyTo = ctx.message.reply_to_message?.message_id;
    if (!replyTo) return;
    const decision = answerDecisionByMessageId(replyTo, ctx.message.text);
    if (!decision) return;
    await ctx.reply(`✅ Decisão registrada para ${decision.project}: ${decision.answer}`);
    onLog(`decisão ${decision.id} = ${decision.answer}`);
  });

  bot.catch((err) => {
    if (err.error instanceof GrammyError) {
      onLog(`Telegram API error: ${err.error.description}`);
      return;
    }
    onLog(`Bot error: ${String(err.error)}`);
  });
}
