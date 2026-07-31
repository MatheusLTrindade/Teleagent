import http from 'node:http';
import type { Bot } from 'grammy';
import type { TeleagentConfig } from './config.js';
import {
	cancelDecision,
	createId,
	expireDecision,
	expireStaleDecisions,
	getDecision,
	listPendingDecisions,
	putDecision,
	type DecisionMeta,
	type DecisionRequest,
} from './store.js';
import {
	sendAlert,
	sendAsk,
	updateDecisionMessage,
	type AlertLevel,
} from './telegram.js';
import { detectProject, readJsonBody } from './util.js';

export type ServerDeps = {
	bot: Bot;
	config: TeleagentConfig;
	onLog?: (line: string) => void;
};

function json(res: http.ServerResponse, status: number, body: unknown): void {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		'Content-Type': 'application/json; charset=utf-8',
		'Content-Length': Buffer.byteLength(payload),
	});
	res.end(payload);
}

function parseMeta(raw: unknown): DecisionMeta | undefined {
	if (!raw || typeof raw !== 'object') return undefined;
	const m = raw as Record<string, unknown>;
	const meta: DecisionMeta = {};
	if (typeof m.cwd === 'string') meta.cwd = m.cwd;
	if (typeof m.gitBranch === 'string') meta.gitBranch = m.gitBranch;
	if (typeof m.prUrl === 'string') meta.prUrl = m.prUrl;
	if (typeof m.agent === 'string') meta.agent = m.agent;
	return Object.keys(meta).length ? meta : undefined;
}

export function createServer(deps: ServerDeps): http.Server {
	const log = deps.onLog ?? console.log;

	return http.createServer(async (req, res) => {
		try {
			const url = new URL(
				req.url || '/',
				`http://${deps.config.host}:${deps.config.port}`,
			);
			const { pathname } = url;

			if (req.method === 'GET' && pathname === '/health') {
				json(res, 200, {
					ok: true,
					service: 'teleagent',
					chatId: Boolean(deps.config.chatId),
					pending: listPendingDecisions().length,
					allowedUsers: deps.config.allowedUserIds.length,
				});
				return;
			}

			if (req.method === 'GET' && pathname === '/v1/pending') {
				expireStaleDecisions();
				json(res, 200, { decisions: listPendingDecisions() });
				return;
			}

			if (
				req.method === 'POST' &&
				pathname.startsWith('/v1/decisions/') &&
				pathname.endsWith('/cancel')
			) {
				const id = pathname.slice('/v1/decisions/'.length, -'/cancel'.length);
				const decision = cancelDecision(id);
				if (!decision) {
					json(res, 404, { error: 'decision_not_found', id });
					return;
				}
				if (decision.status === 'cancelled' && deps.config.chatId) {
					await updateDecisionMessage(deps.bot, deps.config.chatId, decision);
				}
				log(`cancel ${id}`);
				json(res, 200, decision);
				return;
			}

			if (
				req.method === 'POST' &&
				pathname.startsWith('/v1/decisions/') &&
				pathname.endsWith('/expire')
			) {
				const id = pathname.slice('/v1/decisions/'.length, -'/expire'.length);
				const decision = expireDecision(id, { useDefault: true });
				if (!decision) {
					json(res, 404, { error: 'decision_not_found', id });
					return;
				}
				if (deps.config.chatId) {
					await updateDecisionMessage(deps.bot, deps.config.chatId, decision);
				}
				log(`expire ${id} → ${decision.status}`);
				json(res, 200, decision);
				return;
			}

			if (req.method === 'GET' && pathname.startsWith('/v1/decisions/')) {
				expireStaleDecisions();
				const id = pathname.slice('/v1/decisions/'.length);
				const decision = getDecision(id);
				if (!decision) {
					json(res, 404, { error: 'decision_not_found', id });
					return;
				}
				json(res, 200, decision);
				return;
			}

			if (req.method === 'POST' && pathname === '/v1/alert') {
				if (!deps.config.chatId) {
					json(res, 400, {
						error: 'chat_id_missing',
						hint: 'Abra o bot no Telegram e envie /start',
					});
					return;
				}
				let body: {
					project?: string;
					message?: string;
					level?: AlertLevel;
					meta?: unknown;
				};
				try {
					body = (await readJsonBody(req)) as typeof body;
				} catch (err) {
					json(res, 400, { error: String(err) });
					return;
				}
				if (!body.message?.trim()) {
					json(res, 400, {
						error: 'message_required',
						example: {
							project: 'meu-app',
							message: 'Deploy falhou',
							level: 'error',
						},
					});
					return;
				}
				if (
					body.level &&
					body.level !== 'info' &&
					body.level !== 'warn' &&
					body.level !== 'error'
				) {
					json(res, 400, {
						error: 'invalid_level',
						hint: 'use info|warn|error',
					});
					return;
				}
				const project = detectProject(body.project);
				const level: AlertLevel =
					body.level === 'warn' || body.level === 'error' ? body.level : 'info';
				const id = createId('alert');
				const telegramMessageId = await sendAlert(
					deps.bot,
					deps.config.chatId,
					{
						project,
						message: body.message.trim(),
						level,
						meta: parseMeta(body.meta),
					},
				);
				log(`alerta ${id} → ${project}`);
				json(res, 200, { ok: true, id, project, level, telegramMessageId });
				return;
			}

			if (req.method === 'POST' && pathname === '/v1/ask') {
				if (!deps.config.chatId) {
					json(res, 400, {
						error: 'chat_id_missing',
						hint: 'Abra o bot no Telegram e envie /start',
					});
					return;
				}
				let body: {
					project?: string;
					question?: string;
					options?: string[];
					timeoutMs?: number;
					defaultAnswer?: string;
					meta?: unknown;
				};
				try {
					body = (await readJsonBody(req)) as typeof body;
				} catch (err) {
					json(res, 400, { error: String(err) });
					return;
				}
				if (!body.question?.trim()) {
					json(res, 400, {
						error: 'question_required',
						example: {
							project: 'meu-app',
							question: 'Promovo o deploy para produção?',
							options: ['sim', 'não'],
							timeoutMs: 900000,
						},
					});
					return;
				}
				const timeoutMs =
					typeof body.timeoutMs === 'number' && body.timeoutMs > 0
						? body.timeoutMs
						: 15 * 60 * 1000;
				const decision: DecisionRequest = {
					id: createId('ask'),
					project: detectProject(body.project),
					question: body.question.trim(),
					options: body.options?.map((o) => String(o).trim()).filter(Boolean),
					status: 'pending',
					createdAt: new Date().toISOString(),
					timeoutMs,
					defaultAnswer: body.defaultAnswer?.trim() || undefined,
					meta: parseMeta(body.meta),
				};
				putDecision(decision);
				try {
					const telegramMessageId = await sendAsk(
						deps.bot,
						deps.config.chatId,
						decision,
					);
					decision.telegramMessageId = telegramMessageId;
					putDecision(decision);
				} catch (err) {
					cancelDecision(decision.id);
					throw err;
				}
				log(`ask ${decision.id} → ${decision.project}`);
				json(res, 200, decision);
				return;
			}

			json(res, 404, { error: 'not_found' });
		} catch (err) {
			log(`HTTP error: ${String(err)}`);
			json(res, 500, { error: 'internal_error' });
		}
	});
}

export async function startHttpServer(
	server: http.Server,
	config: TeleagentConfig,
): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject);
		server.listen(config.port, config.host, () => resolve());
	});
}
