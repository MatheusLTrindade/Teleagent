import type { Bot } from 'grammy';
import type http from 'node:http';
import {
	loadConfig,
	saveConfig,
	baseUrl,
	type TeleagentConfig,
} from './config.js';
import { createServer, startHttpServer } from './server.js';
import {
	createBot,
	updateDecisionMessage,
	wireBotHandlers,
} from './telegram.js';
import { expireStaleDecisions, rememberedChatId } from './store.js';

export type BridgeHandle = {
	config: TeleagentConfig;
	bot: Bot;
	server: http.Server;
	stop: () => Promise<void>;
};

export type StartBridgeOptions = {
	port?: number;
	host?: string;
	onLog?: (line: string) => void;
};

export async function startBridge(
	opts: StartBridgeOptions = {},
): Promise<BridgeHandle> {
	const log =
		opts.onLog ?? ((line: string) => console.log(`[teleagent] ${line}`));
	const config = loadConfig({ requireToken: true });
	if (opts.port) config.port = opts.port;
	if (opts.host) config.host = opts.host;

	if (!config.chatId) {
		const remembered = rememberedChatId();
		if (remembered) {
			config.chatId = remembered;
			saveConfig(config);
		}
	}

	const bot = createBot(config.botToken);
	wireBotHandlers(bot, config, log);

	const server = createServer({ bot, config, onLog: log });
	await startHttpServer(server, config);
	log(`HTTP em ${baseUrl(config)}`);
	log(
		config.chatId
			? `chat_id=${config.chatId}`
			: 'chat_id ausente — abra o bot e envie /start',
	);
	if (config.allowedUserIds.length) {
		log(`allowlist: ${config.allowedUserIds.join(', ')}`);
	}

	const sweep = async () => {
		const changed = expireStaleDecisions();
		if (!config.chatId) return;
		for (const decision of changed) {
			await updateDecisionMessage(bot, config.chatId, decision);
			log(
				decision.status === 'answered'
					? `timeout default ${decision.id} → ${decision.answer}`
					: `expirou ${decision.id}`,
			);
		}
	};

	const janitor = setInterval(() => {
		void sweep();
	}, 15_000);
	janitor.unref?.();
	void sweep();

	let stopped = false;
	const stop = async () => {
		if (stopped) return;
		stopped = true;
		clearInterval(janitor);
		await bot.stop();
		await new Promise<void>((resolve) => server.close(() => resolve()));
	};

	void bot
		.start({
			onStart: (info) => {
				log(`long polling @${info.username}`);
			},
		})
		.catch((err) => {
			log(`polling error: ${String(err)}`);
		});

	return { config, bot, server, stop };
}
