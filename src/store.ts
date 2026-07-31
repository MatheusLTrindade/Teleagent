import fs from "node:fs";
import path from "node:path";
import { configDir } from "./config.js";

export type DecisionStatus = "pending" | "answered" | "expired" | "cancelled";

export type DecisionRequest = {
  id: string;
  project: string;
  question: string;
  options?: string[];
  status: DecisionStatus;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
  telegramMessageId?: number;
  timeoutMs: number;
};

export type AlertRecord = {
  id: string;
  project: string;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
  telegramMessageId?: number;
};

type StoreShape = {
  decisions: Record<string, DecisionRequest>;
  chatId?: string;
};

function storePath(): string {
  return path.join(configDir(), "store.json");
}

function readStore(): StoreShape {
  const file = storePath();
  if (!fs.existsSync(file)) return { decisions: {} };
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as StoreShape;
  } catch {
    return { decisions: {} };
  }
}

function writeStore(store: StoreShape): void {
  fs.mkdirSync(configDir(), { recursive: true });
  fs.writeFileSync(storePath(), JSON.stringify(store, null, 2) + "\n", "utf8");
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
  return Object.values(readStore().decisions).filter((d) => d.status === "pending");
}

export function answerDecision(
  id: string,
  answer: string,
): DecisionRequest | undefined {
  const store = readStore();
  const decision = store.decisions[id];
  if (!decision || decision.status !== "pending") return decision;
  decision.status = "answered";
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
    (d) => d.status === "pending" && d.telegramMessageId === telegramMessageId,
  );
  if (!decision) return undefined;
  return answerDecision(decision.id, answer);
}

export function expireStaleDecisions(now = Date.now()): number {
  const store = readStore();
  let changed = 0;
  for (const decision of Object.values(store.decisions)) {
    if (decision.status !== "pending") continue;
    const age = now - Date.parse(decision.createdAt);
    if (age >= decision.timeoutMs) {
      decision.status = "expired";
      store.decisions[decision.id] = decision;
      changed += 1;
    }
  }
  if (changed) writeStore(store);
  return changed;
}

export function rememberChatId(chatId: string): void {
  const store = readStore();
  store.chatId = chatId;
  writeStore(store);
}

export function rememberedChatId(): string | undefined {
  return readStore().chatId;
}
