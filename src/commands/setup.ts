import { loadConfig, saveConfig, configPath, baseUrl } from '../config.js';
import { health } from '../client.js';
import { flagBool, flagString } from '../util.js';

export async function runSetup(
	flags: Record<string, string | boolean>,
): Promise<number> {
	if (flagBool(flags, 'help', 'h')) {
		console.log(`Usage:
  teleagent setup --token <BOT_TOKEN> [--chat-id <CHAT_ID>] [--port 3847]

Examples:
  teleagent setup --token 123456:ABC...
  teleagent setup --token 123456:ABC... --chat-id 987654321
  teleagent setup --chat-id 987654321
`);
		return 0;
	}

	const token = flagString(flags, 'token', 't');
	const chatId = flagString(flags, 'chat-id', 'chatId', 'c');
	const portRaw = flagString(flags, 'port', 'p');
	const port = portRaw ? Number(portRaw) : undefined;

	if (!token && !chatId && port === undefined) {
		console.error(
			[
				'Error: informe ao menos --token, --chat-id ou --port.',
				'  teleagent setup --token <BOT_TOKEN>',
				'Crie o bot em https://t.me/BotFather',
			].join('\n'),
		);
		return 1;
	}

	if (port !== undefined && (!Number.isFinite(port) || port <= 0)) {
		console.error('Error: --port inválida');
		return 1;
	}

	const saved = saveConfig({
		...(token ? { botToken: token } : {}),
		...(chatId ? { chatId } : {}),
		...(port !== undefined ? { port } : {}),
	});

	console.log(`config salva: ${configPath()}`);
	console.log(`port: ${saved.port}`);
	console.log(`token: ${saved.botToken ? 'ok' : 'ausente'}`);
	console.log(`chat_id: ${saved.chatId || 'ausente (envie /start no bot)'}`);
	return 0;
}

export async function runStatus(
	flags: Record<string, string | boolean>,
): Promise<number> {
	if (flagBool(flags, 'help', 'h')) {
		console.log(`Usage:
  teleagent status

Examples:
  teleagent status
`);
		return 0;
	}

	const config = loadConfig();
	console.log(`config: ${configPath()}`);
	console.log(`api: ${baseUrl(config)}`);
	console.log(`token: ${config.botToken ? 'ok' : 'ausente'}`);
	console.log(`chat_id: ${config.chatId || 'ausente'}`);

	try {
		const h = await health(config);
		console.log(`bridge: online`);
		console.log(`pending: ${h.pending}`);
		console.log(`chat_vinculado: ${h.chatId ? 'sim' : 'não'}`);
		return 0;
	} catch {
		console.log('bridge: offline');
		console.log('  teleagent serve');
		return 1;
	}
}
