import { loadConfig } from '../config.js';
import { postAlert } from '../client.js';
import { detectProject, flagBool, flagString } from '../util.js';
import type { AlertLevel } from '../telegram.js';

export async function runAlert(
	flags: Record<string, string | boolean>,
	positionals: string[],
): Promise<number> {
	if (flagBool(flags, 'help', 'h')) {
		console.log(`Usage:
  teleagent alert --message <text> [--project <name>] [--level info|warn|error]

Examples:
  teleagent alert --message "Build falhou no CI"
  teleagent alert --project meu-app --level error --message "Deploy abortado"
  echo "algo aconteceu" | teleagent alert --stdin
`);
		return 0;
	}

	const config = loadConfig();
	let message = flagString(flags, 'message', 'm') || positionals.join(' ');
	if (flagBool(flags, 'stdin')) {
		const chunks: Buffer[] = [];
		for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
		message = Buffer.concat(chunks).toString('utf8').trim();
	}

	if (!message?.trim()) {
		console.error(
			[
				'Error: mensagem ausente.',
				'  teleagent alert --message "Build falhou no CI"',
			].join('\n'),
		);
		return 1;
	}

	const project = detectProject(flagString(flags, 'project', 'p'));
	const levelRaw = flagString(flags, 'level', 'l') || 'info';
	const level: AlertLevel =
		levelRaw === 'warn' || levelRaw === 'error' ? levelRaw : 'info';

	const result = await postAlert(config, {
		project,
		message: message.trim(),
		level,
	});

	console.log(`alerted ${result.id}`);
	console.log(`project: ${result.project}`);
	console.log(`telegram_message_id: ${result.telegramMessageId}`);
	return 0;
}
