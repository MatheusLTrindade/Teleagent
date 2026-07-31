import { execSync } from 'node:child_process';
import path from 'node:path';

export type Json =
	| null
	| boolean
	| number
	| string
	| Json[]
	| { [key: string]: Json };

const MAX_BODY_BYTES = 256 * 1024;

export async function readJsonBody(req: {
	on: (event: string, cb: (...args: unknown[]) => void) => void;
}): Promise<Json> {
	const chunks: Buffer[] = [];
	let size = 0;
	await new Promise<void>((resolve, reject) => {
		req.on('data', (chunk) => {
			const buf = Buffer.from(chunk as Buffer);
			size += buf.length;
			if (size > MAX_BODY_BYTES) {
				reject(new Error('payload_too_large'));
				return;
			}
			chunks.push(buf);
		});
		req.on('end', () => resolve());
		req.on('error', (err) => reject(err));
	});
	const raw = Buffer.concat(chunks).toString('utf8').trim();
	if (!raw) return {};
	try {
		return JSON.parse(raw) as Json;
	} catch {
		throw new Error('invalid_json');
	}
}

export function parseArgs(argv: string[]): {
	command?: string;
	flags: Record<string, string | boolean>;
	positionals: string[];
} {
	const [, , command, ...rest] = argv;
	const flags: Record<string, string | boolean> = {};
	const positionals: string[] = [];

	for (let i = 0; i < rest.length; i += 1) {
		const token = rest[i]!;
		if (token === '--') {
			positionals.push(...rest.slice(i + 1));
			break;
		}
		if (token.startsWith('--')) {
			const body = token.slice(2);
			const eq = body.indexOf('=');
			if (eq >= 0) {
				flags[body.slice(0, eq)] = body.slice(eq + 1);
				continue;
			}
			const next = rest[i + 1];
			if (next && !next.startsWith('-')) {
				flags[body] = next;
				i += 1;
			} else {
				flags[body] = true;
			}
			continue;
		}
		if (token.startsWith('-') && token.length === 2) {
			const key = token.slice(1);
			const next = rest[i + 1];
			if (next && !next.startsWith('-')) {
				flags[key] = next;
				i += 1;
			} else {
				flags[key] = true;
			}
			continue;
		}
		positionals.push(token);
	}

	return { command, flags, positionals };
}

export function flagString(
	flags: Record<string, string | boolean>,
	...names: string[]
): string | undefined {
	for (const name of names) {
		const value = flags[name];
		if (typeof value === 'string' && value.length > 0) return value;
	}
	return undefined;
}

export function flagBool(
	flags: Record<string, string | boolean>,
	...names: string[]
): boolean {
	for (const name of names) {
		const value = flags[name];
		if (value === true || value === 'true' || value === '1') return true;
	}
	return false;
}

function detectGitProjectName(cwd: string): string | undefined {
	try {
		const top = execSync('git rev-parse --show-toplevel', {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
		if (top) return path.basename(top);
	} catch {
		/* not a git repo */
	}
	return undefined;
}

export function detectGitBranch(cwd = process.cwd()): string | undefined {
	try {
		return execSync('git rev-parse --abbrev-ref HEAD', {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		return undefined;
	}
}

export function detectProject(explicit?: string): string {
	if (explicit?.trim()) return explicit.trim();
	if (process.env.TELEAGENT_PROJECT?.trim()) {
		return process.env.TELEAGENT_PROJECT.trim();
	}
	const fromGit = detectGitProjectName(process.cwd());
	if (fromGit) return fromGit;
	return pathBasename(process.cwd());
}

function pathBasename(p: string): string {
	const parts = p.replace(/[\\/]+$/, '').split(/[\\/]/);
	return parts[parts.length - 1] || 'unknown';
}

export async function sleep(ms: number): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

export function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

export function truncate(text: string, max: number): string {
	if (text.length <= max) return text;
	return `${text.slice(0, Math.max(0, max - 1))}…`;
}
