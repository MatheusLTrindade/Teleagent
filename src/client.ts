import type { TeleagentConfig } from './config.js';
import { baseUrl } from './config.js';
import type { DecisionMeta, DecisionRequest } from './store.js';
import type { AlertLevel } from './telegram.js';
import { sleep } from './util.js';

export class BridgeUnavailableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'BridgeUnavailableError';
	}
}

async function requestJson<T>(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
	path: string,
	init?: RequestInit,
): Promise<T> {
	const url = `${baseUrl(config)}${path}`;
	let res: Response;
	try {
		res = await fetch(url, {
			...init,
			headers: {
				'Content-Type': 'application/json',
				...(init?.headers || {}),
			},
		});
	} catch {
		throw new BridgeUnavailableError(
			[
				`Bridge local offline em ${url}`,
				'  teleagent serve',
				'  ou abra o app Teleagent (bandeja do Windows)',
				'Inicie o bridge e tente de novo.',
			].join('\n'),
		);
	}
	const body = (await res.json()) as T & { error?: string; hint?: string };
	if (!res.ok) {
		const extra = body.hint ? `\n  ${body.hint}` : '';
		throw new Error(`${body.error || res.statusText}${extra}`);
	}
	return body;
}

export async function health(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
): Promise<{
	ok: boolean;
	chatId: boolean;
	pending: number;
	allowedUsers?: number;
}> {
	return requestJson(config, '/health');
}

export async function postAlert(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
	payload: {
		project?: string;
		message: string;
		level?: AlertLevel;
		meta?: DecisionMeta;
	},
): Promise<{
	ok: true;
	id: string;
	project: string;
	telegramMessageId: number;
}> {
	return requestJson(config, '/v1/alert', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export async function postAsk(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
	payload: {
		project?: string;
		question: string;
		options?: string[];
		timeoutMs?: number;
		defaultAnswer?: string;
		meta?: DecisionMeta;
	},
): Promise<DecisionRequest> {
	return requestJson(config, '/v1/ask', {
		method: 'POST',
		body: JSON.stringify(payload),
	});
}

export async function getDecision(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
	id: string,
): Promise<DecisionRequest> {
	return requestJson(config, `/v1/decisions/${encodeURIComponent(id)}`);
}

export async function cancelAsk(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
	id: string,
): Promise<DecisionRequest> {
	return requestJson(config, `/v1/decisions/${encodeURIComponent(id)}/cancel`, {
		method: 'POST',
	});
}

export async function expireAsk(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
	id: string,
): Promise<DecisionRequest> {
	return requestJson(config, `/v1/decisions/${encodeURIComponent(id)}/expire`, {
		method: 'POST',
	});
}

export async function listPending(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
): Promise<{ decisions: DecisionRequest[] }> {
	return requestJson(config, '/v1/pending');
}

export async function waitForDecision(
	config: Pick<TeleagentConfig, 'host' | 'port'>,
	id: string,
	timeoutMs: number,
	pollMs = 2000,
): Promise<DecisionRequest> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const decision = await getDecision(config, id);
		if (decision.status === 'answered') return decision;
		if (decision.status === 'expired' || decision.status === 'cancelled') {
			return decision;
		}
		await sleep(Math.min(pollMs, Math.max(250, deadline - Date.now())));
	}
	try {
		return await expireAsk(config, id);
	} catch {
		const last = await getDecision(config, id);
		if (last.status === 'pending') {
			return { ...last, status: 'expired' };
		}
		return last;
	}
}
