import { loadConfig } from '../config.js';
import { cancelAsk } from '../client.js';
import { flagBool, flagString } from '../util.js';

export async function runCancel(
	flags: Record<string, string | boolean>,
	positionals: string[],
): Promise<number> {
	if (flagBool(flags, 'help', 'h')) {
		console.log(`Usage:
  teleagent cancel --id <ask_id> [--json]

Examples:
  teleagent cancel --id ask_ms93sluo_ix9pzi
`);
		return 0;
	}

	const id = flagString(flags, 'id', 'i') || positionals[0];
	if (!id?.trim()) {
		console.error('Error: informe --id <ask_id>');
		return 1;
	}

	const config = loadConfig();
	const decision = await cancelAsk(config, id.trim());
	if (flagBool(flags, 'json')) {
		console.log(JSON.stringify(decision, null, 2));
	} else {
		console.log(`cancelled ${decision.id}`);
		console.log(`status: ${decision.status}`);
	}
	return decision.status === 'cancelled' ? 0 : 1;
}
