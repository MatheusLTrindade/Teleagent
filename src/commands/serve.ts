import { Bot } from "grammy";
import { loadConfig, saveConfig, baseUrl } from "../config.js";
import { createServer, startHttpServer } from "../server.js";
import { createBot, wireBotHandlers } from "../telegram.js";
import { expireStaleDecisions, rememberedChatId } from "../store.js";
import { flagBool, flagString } from "../util.js";

export async function runServe(
  flags: Record<string, string | boolean>,
): Promise<number> {
  if (flagBool(flags, "help", "h")) {
    console.log(`Usage:
  teleagent serve [--port 3847] [--host 127.0.0.1]

Examples:
  teleagent serve
  teleagent serve --port 3847
`);
    return 0;
  }

  const config = loadConfig({ requireToken: true });
  const portRaw = flagString(flags, "port", "p");
  const host = flagString(flags, "host") || config.host;
  if (portRaw) {
    const port = Number(portRaw);
    if (!Number.isFinite(port) || port <= 0) {
      console.error("Error: --port inválida");
      return 1;
    }
    config.port = port;
  }
  config.host = host;

  if (!config.chatId) {
    const remembered = rememberedChatId();
    if (remembered) {
      config.chatId = remembered;
      saveConfig(config);
    }
  }

  const bot: Bot = createBot(config.botToken);
  wireBotHandlers(bot, config, (line) => console.log(`[teleagent] ${line}`));

  const server = createServer({
    bot,
    config,
    onLog: (line) => console.log(`[teleagent] ${line}`),
  });

  await startHttpServer(server, config);
  console.log(`[teleagent] HTTP em ${baseUrl(config)}`);
  console.log(
    config.chatId
      ? `[teleagent] chat_id=${config.chatId}`
      : "[teleagent] chat_id ausente — abra o bot e envie /start",
  );

  const janitor = setInterval(() => expireStaleDecisions(), 30_000);
  janitor.unref?.();

  const shutdown = async (signal: string) => {
    console.log(`[teleagent] encerrando (${signal})...`);
    clearInterval(janitor);
    await bot.stop();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  await bot.start({
    onStart: (info) => {
      console.log(`[teleagent] long polling @${info.username}`);
    },
  });
  return 0;
}
