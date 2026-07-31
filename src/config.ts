import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

export const DEFAULT_PORT = 3847;
export const DEFAULT_HOST = '127.0.0.1';

export type TeleagentConfig = {
	botToken: string;
	chatId: string;
	/** Se preenchido, só estes Telegram user ids podem /start e decidir */
	allowedUserIds: string[];
	port: number;
	host: string;
};

export function configDir(): string {
	return path.join(os.homedir(), '.teleagent');
}

export function configPath(): string {
	return path.join(configDir(), 'config.json');
}

export function loadEnvFile(): void {
	const candidates = [
		path.join(process.cwd(), '.env'),
		path.join(configDir(), '.env'),
	];
	for (const file of candidates) {
		if (!fs.existsSync(file)) continue;
		const text = fs.readFileSync(file, 'utf8');
		for (const line of text.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq <= 0) continue;
			const key = trimmed.slice(0, eq).trim();
			let value = trimmed.slice(eq + 1).trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			if (!(key in process.env)) process.env[key] = value;
		}
	}
}

function parseIdList(raw: unknown): string[] {
	if (Array.isArray(raw)) {
		return raw
			.map(String)
			.map((s) => s.trim())
			.filter(Boolean);
	}
	if (typeof raw === 'string') {
		return raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
}

function readFileConfig(): Partial<TeleagentConfig> {
	const file = configPath();
	if (!fs.existsSync(file)) return {};
	try {
		const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<{
			botToken: string;
			chatId: string;
			allowedUserIds: string[] | string;
			port: number;
			host: string;
		}>;
		return {
			botToken: raw.botToken,
			chatId: raw.chatId,
			allowedUserIds: parseIdList(raw.allowedUserIds),
			port: raw.port,
			host: raw.host,
		};
	} catch {
		throw new Error(`Config inválida em ${file}`);
	}
}

function writeConfigFile(config: TeleagentConfig): void {
	fs.mkdirSync(configDir(), { recursive: true, mode: 0o700 });
	fs.writeFileSync(configPath(), JSON.stringify(config, null, 2) + '\n', {
		encoding: 'utf8',
		mode: 0o600,
	});
}

export function saveConfig(partial: Partial<TeleagentConfig>): TeleagentConfig {
	const current = readFileConfig();
	const next: TeleagentConfig = {
		botToken: partial.botToken ?? current.botToken ?? '',
		chatId: partial.chatId ?? current.chatId ?? '',
		allowedUserIds: partial.allowedUserIds ?? current.allowedUserIds ?? [],
		port: partial.port ?? current.port ?? DEFAULT_PORT,
		host: partial.host ?? current.host ?? DEFAULT_HOST,
	};
	writeConfigFile(next);
	return next;
}

export function loadConfig(opts?: {
	requireToken?: boolean;
	requireChat?: boolean;
}): TeleagentConfig {
	loadEnvFile();
	const file = readFileConfig();
	const envAllowed = parseIdList(process.env.TELEAGENT_ALLOWED_USER_IDS);
	const config: TeleagentConfig = {
		botToken:
			process.env.TELEAGENT_BOT_TOKEN?.trim() ||
			process.env.TELEGRAM_BOT_TOKEN?.trim() ||
			file.botToken ||
			'',
		chatId:
			process.env.TELEAGENT_CHAT_ID?.trim() ||
			process.env.TELEGRAM_CHAT_ID?.trim() ||
			file.chatId ||
			'',
		allowedUserIds:
			envAllowed.length > 0 ? envAllowed : file.allowedUserIds || [],
		port: Number(process.env.TELEAGENT_PORT || file.port || DEFAULT_PORT),
		host: process.env.TELEAGENT_HOST || file.host || DEFAULT_HOST,
	};

	if (!Number.isFinite(config.port) || config.port <= 0) {
		throw new Error('TELEAGENT_PORT inválida');
	}

	if (opts?.requireToken && !config.botToken) {
		throw new Error(
			[
				'Bot token ausente.',
				'  teleagent setup --token <BOT_TOKEN>',
				'  ou defina TELEAGENT_BOT_TOKEN no .env / ~/.teleagent/config.json',
			].join('\n'),
		);
	}

	if (opts?.requireChat && !config.chatId) {
		throw new Error(
			[
				'chat_id ausente.',
				'  1) Rode: teleagent serve',
				'  2) No Telegram, abra o bot e envie /start',
				'  ou: teleagent setup --chat-id <CHAT_ID>',
			].join('\n'),
		);
	}

	return config;
}

export function isUserAllowed(
	config: Pick<TeleagentConfig, 'allowedUserIds'>,
	userId: string | number | undefined,
): boolean {
	if (!config.allowedUserIds.length) return true;
	if (userId === undefined || userId === null) return false;
	return config.allowedUserIds.includes(String(userId));
}

export function isChatAllowed(
	config: Pick<TeleagentConfig, 'chatId'>,
	chatId: string | number | undefined,
): boolean {
	if (!config.chatId) return true;
	if (chatId === undefined || chatId === null) return false;
	return String(chatId) === String(config.chatId);
}

export function baseUrl(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
): string {
	return `http://${config.host}:${config.port}`;
}
