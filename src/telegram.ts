import { Bot, InlineKeyboard, GrammyError } from 'grammy';
import type { TeleagentConfig } from './config.js';
import { isChatAllowed, isUserAllowed, saveConfig } from './config.js';
import {
	answerDecision,
	answerDecisionByMessageId,
	getDecision,
	listPendingDecisions,
	rememberChatId,
	type DecisionMeta,
	type DecisionRequest,
} from './store.js';
import { escapeHtml, truncate } from './util.js';

export type AlertLevel = 'info' | 'warn' | 'error';

const LEVEL_META: Record<AlertLevel, { icon: string; label: string }> = {
	info: { icon: 'ℹ️', label: 'INFO' },
	warn: { icon: '⚠️', label: 'WARN' },
	error: { icon: '🚨', label: 'ERROR' },
};

export function createBot(token: string): Bot {
	return new Bot(token);
}

function header(icon: string, label: string, project: string): string {
	return `${icon} <b>${label} · ${escapeHtml(project)}</b>`;
}

function formatMeta(meta?: DecisionMeta): string[] {
	if (!meta) return [];
	const bits: string[] = [];
	if (meta.agent) bits.push(meta.agent);
	if (meta.gitBranch) bits.push(meta.gitBranch);
	if (meta.cwd) bits.push(truncate(meta.cwd, 48));
	if (!bits.length && !meta.prUrl) return [];
	const lines: string[] = [];
	if (bits.length) {
		lines.push(`<i>${escapeHtml(bits.join(' · '))}</i>`);
	}
	if (meta.prUrl) {
		lines.push(`<a href="${escapeHtml(meta.prUrl)}">PR</a>`);
	}
	return lines;
}

export function formatAlert(opts: {
	project: string;
	message: string;
	level: AlertLevel;
	meta?: DecisionMeta;
}): string {
	const meta = LEVEL_META[opts.level];
	return [
		header(meta.icon, meta.label, opts.project),
		...formatMeta(opts.meta),
		escapeHtml(truncate(opts.message, 3500)),
	].join('\n');
}

export function formatAsk(decision: DecisionRequest): string {
	const lines = [
		header('❓', 'DECISÃO', decision.project),
		...formatMeta(decision.meta),
		escapeHtml(truncate(decision.question, 3500)),
	];
	if (!decision.options?.length) {
		lines.push('', '<i>Responda a esta mensagem com sua decisão.</i>');
	}
	return lines.join('\n');
}

export function formatDecided(
	decision: Pick<DecisionRequest, 'project' | 'question' | 'meta'>,
	answer: string,
): string {
	return [
		header('✅', 'DECIDIDO', decision.project),
		...formatMeta(decision.meta),
		escapeHtml(truncate(decision.question, 3500)),
		`→ <b>${escapeHtml(answer)}</b>`,
	].join('\n');
}

export function formatExpired(
	decision: Pick<DecisionRequest, 'project' | 'question' | 'meta' | 'answer'>,
): string {
	if (decision.answer) {
		return formatDecided(decision, decision.answer);
	}
	return [
		header('⏰', 'EXPIRADO', decision.project),
		...formatMeta(decision.meta),
		escapeHtml(truncate(decision.question, 3500)),
	].join('\n');
}

export function formatCancelled(
	decision: Pick<DecisionRequest, 'project' | 'question' | 'meta'>,
): string {
	return [
		header('✖️', 'CANCELADO', decision.project),
		...formatMeta(decision.meta),
		escapeHtml(truncate(decision.question, 3500)),
	].join('\n');
}

export function optionsKeyboard(
	decisionId: string,
	options: string[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard();
	options.forEach((option, index) => {
		keyboard.text(truncate(option, 64), `decide:${decisionId}:${index}`);
		if ((index + 1) % 2 === 0) keyboard.row();
	});
	return keyboard;
}

export async function sendAlert(
	bot: Bot,
	chatId: string,
	opts: {
		project: string;
		message: string;
		level: AlertLevel;
		meta?: DecisionMeta;
	},
): Promise<number> {
	const msg = await bot.api.sendMessage(chatId, formatAlert(opts), {
		parse_mode: 'HTML',
		link_preview_options: { is_disabled: true },
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
				parse_mode: 'HTML',
				link_preview_options: { is_disabled: true },
				reply_markup: optionsKeyboard(decision.id, decision.options),
			})
		: await bot.api.sendMessage(chatId, text, {
				parse_mode: 'HTML',
				link_preview_options: { is_disabled: true },
			});
	return msg.message_id;
}

export async function updateDecisionMessage(
	bot: Bot,
	chatId: string,
	decision: DecisionRequest,
): Promise<void> {
	if (!decision.telegramMessageId) return;
	let text: string;
	if (decision.status === 'answered' && decision.answer) {
		text = formatDecided(decision, decision.answer);
	} else if (decision.status === 'cancelled') {
		text = formatCancelled(decision);
	} else if (decision.status === 'expired') {
		text = formatExpired(decision);
	} else {
		return;
	}
	try {
		await bot.api.editMessageText(chatId, decision.telegramMessageId, text, {
			parse_mode: 'HTML',
			link_preview_options: { is_disabled: true },
			reply_markup: { inline_keyboard: [] },
		});
	} catch {
		/* message may already be edited or deleted */
	}
}

export function wireBotHandlers(
	bot: Bot,
	config: TeleagentConfig,
	onLog: (line: string) => void = console.log,
): void {
	const deny = async (
		ctx: { reply: (t: string) => Promise<unknown> },
		reason: string,
	) => {
		await ctx.reply(reason);
	};

	bot.command('start', async (ctx) => {
		const userId = ctx.from?.id;
		if (!isUserAllowed(config, userId)) {
			onLog(`start negado user=${userId}`);
			await deny(ctx, 'Acesso negado. Seu user id não está na allowlist.');
			return;
		}
		const chatId = String(ctx.chat.id);
		config.chatId = chatId;
		rememberChatId(chatId);
		saveConfig({
			botToken: config.botToken,
			chatId,
			allowedUserIds: config.allowedUserIds,
			port: config.port,
			host: config.host,
		});
		onLog(`chat_id vinculado: ${chatId} (user=${userId})`);
		await ctx.reply(
			[
				'Teleagent conectado.',
				'',
				'Alertas e decisões dos agents Cursor chegam aqui.',
				'Toque nos botões ou responda a mensagem do pedido.',
				'',
				`user_id: ${userId}`,
			].join('\n'),
		);
	});

	bot.command('status', async (ctx) => {
		if (!isUserAllowed(config, ctx.from?.id)) {
			await deny(ctx, 'Acesso negado.');
			return;
		}
		const pending = listPendingDecisions();
		await ctx.reply(
			[
				'Teleagent online.',
				`chat: ${config.chatId || 'ausente'}`,
				`pending: ${pending.length}`,
				config.allowedUserIds.length
					? `allowlist: ${config.allowedUserIds.length} user(s)`
					: 'allowlist: aberta (qualquer /start)',
			].join('\n'),
		);
	});

	bot.command('pending', async (ctx) => {
		if (!isUserAllowed(config, ctx.from?.id)) {
			await deny(ctx, 'Acesso negado.');
			return;
		}
		const pending = listPendingDecisions();
		if (!pending.length) {
			await ctx.reply('Nenhuma decisão pendente.');
			return;
		}
		const lines = pending.slice(0, 10).map((d, i) => {
			const q = truncate(d.question, 80);
			return `${i + 1}. <b>${escapeHtml(d.project)}</b> — ${escapeHtml(q)}`;
		});
		await ctx.reply(
			[`Pendentes (${pending.length}):`, '', ...lines].join('\n'),
			{ parse_mode: 'HTML' },
		);
	});

	bot.command('help', async (ctx) => {
		await ctx.reply(
			[
				'Comandos:',
				'/start — vincula este chat',
				'/status — bridge + pending',
				'/pending — lista decisões abertas',
				'/help — esta ajuda',
				'',
				'Com opções: toque no botão.',
				'Sem opções: responda a mensagem do pedido.',
			].join('\n'),
		);
	});

	bot.on('callback_query:data', async (ctx) => {
		const data = ctx.callbackQuery.data;
		if (!data.startsWith('decide:')) {
			await ctx.answerCallbackQuery();
			return;
		}
		if (!isUserAllowed(config, ctx.from?.id)) {
			await ctx.answerCallbackQuery({ text: 'Acesso negado' });
			return;
		}
		if (!isChatAllowed(config, ctx.chat?.id)) {
			await ctx.answerCallbackQuery({ text: 'Chat não autorizado' });
			return;
		}
		const parts = data.split(':');
		const decisionId = parts[1];
		const optionIndex = Number(parts[2]);
		if (!decisionId || !Number.isFinite(optionIndex)) {
			await ctx.answerCallbackQuery({ text: 'Pedido inválido' });
			return;
		}
		const decision = getDecision(decisionId);
		if (!decision || decision.status !== 'pending') {
			await ctx.answerCallbackQuery({
				text: 'Pedido já resolvido ou expirado',
			});
			return;
		}
		const answer = decision.options?.[optionIndex];
		if (!answer) {
			await ctx.answerCallbackQuery({ text: 'Opção inválida' });
			return;
		}
		answerDecision(decisionId, answer);
		await ctx.answerCallbackQuery({ text: `Escolhido: ${answer}` });
		await ctx.editMessageText(formatDecided(decision, answer), {
			parse_mode: 'HTML',
			reply_markup: { inline_keyboard: [] },
		});
		onLog(`decisão ${decisionId} = ${answer}`);
	});

	bot.on('message:text', async (ctx) => {
		if (ctx.message.text.startsWith('/')) return;
		if (!isUserAllowed(config, ctx.from?.id)) return;
		if (!isChatAllowed(config, ctx.chat.id)) return;
		const replyTo = ctx.message.reply_to_message?.message_id;
		if (!replyTo) return;
		const decision = answerDecisionByMessageId(replyTo, ctx.message.text);
		if (!decision) {
			const pending = getDecisionByMessage(replyTo);
			if (pending?.options?.length) {
				await ctx.reply(`Use um dos botões: ${pending.options.join(', ')}`);
			}
			return;
		}
		const text = formatDecided(decision, decision.answer || ctx.message.text);
		try {
			await ctx.api.editMessageText(ctx.chat.id, replyTo, text, {
				parse_mode: 'HTML',
				reply_markup: { inline_keyboard: [] },
			});
		} catch {
			await ctx.reply(text, { parse_mode: 'HTML' });
		}
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

function getDecisionByMessage(
	telegramMessageId: number,
): DecisionRequest | undefined {
	return listPendingDecisions().find(
		(d) => d.telegramMessageId === telegramMessageId,
	);
}
