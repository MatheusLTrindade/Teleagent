import { startBridge } from '../bridge.js';
import { flagBool, flagString } from '../util.js';

export async function runServe(
	flags: Record<string, string | boolean>,
): Promise<number> {
	if (flagBool(flags, 'help', 'h')) {
		console.log(`Usage:
  teleagent serve [--port 3847] [--host 127.0.0.1]

Examples:
  teleagent serve
  teleagent serve --port 3847
`);
		return 0;
	}

	const portRaw = flagString(flags, 'port', 'p');
	const host = flagString(flags, 'host');
	let port: number | undefined;
	if (portRaw) {
		port = Number(portRaw);
		if (!Number.isFinite(port) || port <= 0) {
			console.error('Error: --port inválida');
			return 1;
		}
	}

	const handle = await startBridge({
		port,
		host,
		onLog: (line) => console.log(`[teleagent] ${line}`),
	});

	await new Promise<void>((resolve) => {
		const shutdown = async (signal: string) => {
			console.log(`[teleagent] encerrando (${signal})...`);
			await handle.stop();
			resolve();
		};
		process.once('SIGINT', () => void shutdown('SIGINT'));
		process.once('SIGTERM', () => void shutdown('SIGTERM'));
	});

	return 0;
}
