import fs from 'node:fs';
import path from 'node:path';
import { configDir } from './config.js';

export type DecisionStatus = 'pending' | 'answered' | 'expired' | 'cancelled';

export type DecisionMeta = {
	cwd?: string;
	gitBranch?: string;
	prUrl?: string;
	agent?: string;
};

export type DecisionRequest = {
	id: string;
	project: string;
	question: string;
	options?: string[];
	status: DecisionStatus;
	answer?: string;
	defaultAnswer?: string;
	createdAt: string;
	answeredAt?: string;
	telegramMessageId?: number;
	timeoutMs: number;
	meta?: DecisionMeta;
};

export type AlertRecord = {
	id: string;
	project: string;
	message: string;
	level: 'info' | 'warn' | 'error';
	createdAt: string;
	telegramMessageId?: number;
	meta?: DecisionMeta;
};

type StoreShape = {
	decisions: Record<string, DecisionRequest>;
	chatId?: string;
};

const MAX_DECISIONS = 200;

function storePath(): string {
	return path.join(configDir(), 'store.json');
}

function readStore(): StoreShape {
	const file = storePath();
	if (!fs.existsSync(file)) return { decisions: {} };
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8')) as StoreShape;
	} catch {
		return { decisions: {} };
	}
}

function writeStore(store: StoreShape): void {
	fs.mkdirSync(configDir(), { recursive: true, mode: 0o700 });
	pruneDecisions(store);
	fs.writeFileSync(storePath(), JSON.stringify(store, null, 2) + '\n', {
		encoding: 'utf8',
		mode: 0o600,
	});
}

function pruneDecisions(store: StoreShape): void {
	const entries = Object.values(store.decisions).sort(
		(a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
	);
	if (entries.length <= MAX_DECISIONS) return;
	const keep = new Set(entries.slice(0, MAX_DECISIONS).map((d) => d.id));
	for (const id of Object.keys(store.decisions)) {
		if (!keep.has(id)) delete store.decisions[id];
	}
}

export function createId(prefix: string): string {
	const rand = Math.random().toString(36).slice(2, 8);
	return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function putDecision(decision: DecisionRequest): DecisionRequest {
	const store = readStore();
	store.decisions[decision.id] = decision;
	writeStore(store);
	return decision;
}

export function getDecision(id: string): DecisionRequest | undefined {
	return readStore().decisions[id];
}

export function listPendingDecisions(): DecisionRequest[] {
	return Object.values(readStore().decisions)
		.filter((d) => d.status === 'pending')
		.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export function answerDecision(
	id: string,
	answer: string,
): DecisionRequest | undefined {
	const store = readStore();
	const decision = store.decisions[id];
	if (!decision || decision.status !== 'pending') return decision;
	decision.status = 'answered';
	decision.answer = answer.trim();
	decision.answeredAt = new Date().toISOString();
	store.decisions[id] = decision;
	writeStore(store);
	return decision;
}

export function answerDecisionByMessageId(
	telegramMessageId: number,
	answer: string,
): DecisionRequest | undefined {
	const store = readStore();
	const decision = Object.values(store.decisions).find(
		(d) => d.status === 'pending' && d.telegramMessageId === telegramMessageId,
	);
	if (!decision) return undefined;
	if (decision.options?.length) {
		const normalized = answer.trim().toLowerCase();
		const match = decision.options.find(
			(o) => o.trim().toLowerCase() === normalized,
		);
		if (!match) return undefined;
		return answerDecision(decision.id, match);
	}
	return answerDecision(decision.id, answer);
}

export function cancelDecision(id: string): DecisionRequest | undefined {
	const store = readStore();
	const decision = store.decisions[id];
	if (!decision || decision.status !== 'pending') return decision;
	decision.status = 'cancelled';
	decision.answeredAt = new Date().toISOString();
	store.decisions[id] = decision;
	writeStore(store);
	return decision;
}

export function expireDecision(
	id: string,
	opts?: { useDefault?: boolean },
): DecisionRequest | undefined {
	const store = readStore();
	const decision = store.decisions[id];
	if (!decision || decision.status !== 'pending') return decision;
	if (opts?.useDefault && decision.defaultAnswer) {
		decision.status = 'answered';
		decision.answer = decision.defaultAnswer;
	} else {
		decision.status = 'expired';
	}
	decision.answeredAt = new Date().toISOString();
	store.decisions[id] = decision;
	writeStore(store);
	return decision;
}

export function expireStaleDecisions(now = Date.now()): DecisionRequest[] {
	const store = readStore();
	const expired: DecisionRequest[] = [];
	for (const decision of Object.values(store.decisions)) {
		if (decision.status !== 'pending') continue;
		const age = now - Date.parse(decision.createdAt);
		if (age < decision.timeoutMs) continue;
		if (decision.defaultAnswer) {
			decision.status = 'answered';
			decision.answer = decision.defaultAnswer;
		} else {
			decision.status = 'expired';
		}
		decision.answeredAt = new Date().toISOString();
		store.decisions[decision.id] = decision;
		expired.push({ ...decision });
	}
	if (expired.length) writeStore(store);
	return expired;
}

export function rememberChatId(chatId: string): void {
	const store = readStore();
	store.chatId = chatId;
	writeStore(store);
}

export function rememberedChatId(): string | undefined {
	return readStore().chatId;
}
