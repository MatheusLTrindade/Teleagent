import type { ReactNode } from "react";
import { CopyCode } from "./copy-code";
import {
	API_ASK_CODE,
	ARCHITECTURE_FLOW_CODE,
	BOT_COMMANDS_CODE,
	CLI_EXAMPLES_CODE,
	DESKTOP_DEV_CODE,
	DESKTOP_TAG_CODE,
	FIRST_ASK_CODE,
	INSTALL_CLI_CODE,
	SETUP_SERVE_CODE,
	SKILL_EXAMPLES_CODE,
} from "./doc-bodies-codes";

function DocIntro() {
	return (
		<>
			<p>
				O <strong>Teleagent</strong> é um bridge <strong>local-first</strong>{" "}
				entre agentes de IA (Cursor, Claude Code, Codex e afins) e o{" "}
				<strong>Telegram</strong>. Quando o agent precisa avisar ou pedir
				aprovação, a mensagem vai para o seu chat; você responde; o agent
				continua.
			</p>
			<p>
				Não há servidor público nem webhook. O Telegram fala só com o processo
				na sua máquina.
			</p>
			<ul>
				<li>
					CLI + API HTTP em <code>127.0.0.1</code> (padrão <code>3847</code>)
				</li>
				<li>App Windows com bandeja, hub e auto-update</li>
				<li>Allowlist por Telegram user id</li>
				<li>Skill pronta para agentes Cursor</li>
			</ul>
			<h2>Quando usar</h2>
			<ul>
				<li>Deploy / migrate / force-push que exigem confirmação humana</li>
				<li>Alertas de CI, erro ou conclusão sem bloquear o chat do IDE</li>
				<li>
					Qualquer fluxo agentic onde “inventar a intenção do usuário” é
					perigoso
				</li>
			</ul>
		</>
	);
}

function DocQuickstart() {
	return (
		<>
			<h2>1. Criar o bot</h2>
			<ol className="list-decimal space-y-2 pl-5 text-[color:var(--muted)]">
				<li>
					Abra{" "}
					<a
						href="https://t.me/BotFather"
						target="_blank"
						rel="noreferrer"
						className="text-[color:var(--cyan)]"
					>
						@BotFather
					</a>
				</li>
				<li>
					<code>/newbot</code> → nome e username
				</li>
				<li>Copie o token</li>
			</ol>
			<p>
				Comandos sugeridos (<code>/setcommands</code>):
			</p>
			<CopyCode code={BOT_COMMANDS_CODE} />

			<h2>2. Instalar a CLI</h2>
			<CopyCode code={INSTALL_CLI_CODE} />

			<h2>3. Configurar e subir</h2>
			<CopyCode code={SETUP_SERVE_CODE} />
			<p>
				No Telegram, abra o bot e envie <code>/start</code> (grava o{" "}
				<code>chat_id</code>). O <code>--allowed-user</code> restringe o bot ao
				seu user id.
			</p>

			<h2>4. Primeiro ask</h2>
			<CopyCode code={FIRST_ASK_CODE} />
			<p>
				Ou baixe o app Windows em{" "}
				<a href="/download" className="text-[color:var(--cyan)]">
					/download
				</a>{" "}
				e inicie o bridge pelo hub.
			</p>
		</>
	);
}

function DocCli() {
	return (
		<>
			<table>
				<thead>
					<tr>
						<th>Comando</th>
						<th>Uso</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>teleagent setup</code>
						</td>
						<td>token / chat_id / porta / allowlist</td>
					</tr>
					<tr>
						<td>
							<code>teleagent serve</code>
						</td>
						<td>long polling + API local</td>
					</tr>
					<tr>
						<td>
							<code>teleagent alert</code>
						</td>
						<td>alerta (não bloqueia)</td>
					</tr>
					<tr>
						<td>
							<code>teleagent ask</code>
						</td>
						<td>decisão e espera</td>
					</tr>
					<tr>
						<td>
							<code>teleagent cancel</code>
						</td>
						<td>cancela ask pendente</td>
					</tr>
					<tr>
						<td>
							<code>teleagent status</code>
						</td>
						<td>health do bridge</td>
					</tr>
				</tbody>
			</table>

			<h2>Exemplos</h2>
			<CopyCode code={CLI_EXAMPLES_CODE} />

			<h2>Códigos de saída</h2>
			<ul>
				<li>
					<code>0</code> — ok
				</li>
				<li>
					<code>1</code> — erro / bridge offline
				</li>
				<li>
					<code>2</code> — ask timeout / expirado / cancelado (sem default
					usável)
				</li>
			</ul>
			<p>
				<code>ask</code> bloqueia até resposta, timeout ou cancelamento. Com{" "}
				<code>--default</code>, no timeout usa essa resposta.
			</p>
		</>
	);
}

function DocApi() {
	return (
		<>
			<p>
				Base: <code>http://127.0.0.1:3847</code>
			</p>
			<table>
				<thead>
					<tr>
						<th>Método</th>
						<th>Path</th>
						<th>Uso</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>GET</td>
						<td>
							<code>/health</code>
						</td>
						<td>Status</td>
					</tr>
					<tr>
						<td>POST</td>
						<td>
							<code>/v1/alert</code>
						</td>
						<td>Alerta</td>
					</tr>
					<tr>
						<td>POST</td>
						<td>
							<code>/v1/ask</code>
						</td>
						<td>Pedido de decisão</td>
					</tr>
					<tr>
						<td>GET</td>
						<td>
							<code>/v1/decisions/:id</code>
						</td>
						<td>Consultar</td>
					</tr>
					<tr>
						<td>POST</td>
						<td>
							<code>/v1/decisions/:id/cancel</code>
						</td>
						<td>Cancelar</td>
					</tr>
					<tr>
						<td>POST</td>
						<td>
							<code>/v1/decisions/:id/expire</code>
						</td>
						<td>Expirar / default</td>
					</tr>
					<tr>
						<td>GET</td>
						<td>
							<code>/v1/pending</code>
						</td>
						<td>Listar pendentes</td>
					</tr>
				</tbody>
			</table>
			<p>
				<code>meta</code> opcional:{" "}
				<code>{`{ "cwd", "gitBranch", "prUrl", "agent" }`}</code>.
			</p>
			<h2>Exemplo ask</h2>
			<CopyCode code={API_ASK_CODE} />
		</>
	);
}

function DocDesktop() {
	return (
		<>
			<p>
				O app Windows fica na <strong>bandeja</strong>, mostra
				versão/status/logs e permite start/stop do bridge, autostart com o
				Windows e auto-update.
			</p>
			<h2>Artefatos</h2>
			<ul>
				<li>
					<code>Teleagent-Setup-*.exe</code> — instalador NSIS (suporta
					auto-update)
				</li>
				<li>
					<code>Teleagent-Portable-*.exe</code> — portable (sem auto-update)
				</li>
			</ul>
			<h2>Desenvolvimento</h2>
			<CopyCode code={DESKTOP_DEV_CODE} />
			<h2>Auto-update</h2>
			<p>
				Builds NSIS consultam GitHub Releases por tags <code>vX.Y.Z</code>. O
				repo precisa ser público (ou token no updater).
			</p>
			<CopyCode code={DESKTOP_TAG_CODE} />
		</>
	);
}

function DocSkill() {
	return (
		<>
			<p>
				Copie <code>skills/teleagent/SKILL.md</code> para{" "}
				<code>~/.cursor/skills/teleagent/</code>.
			</p>
			<h2>Regras do agent</h2>
			<ul>
				<li>
					Não inventar decisão do usuário — usar <code>ask</code>
				</li>
				<li>
					Sempre passar <code>--project</code>
				</li>
				<li>
					Preferir <code>--json</code> e ler <code>answer</code>
				</li>
				<li>Se o bridge estiver offline, pedir para o usuário iniciar o app</li>
			</ul>
			<CopyCode code={SKILL_EXAMPLES_CODE} />
		</>
	);
}

function DocConfig() {
	return (
		<>
			<p>
				Arquivo principal: <code>~/.teleagent/config.json</code>. Preferências
				do desktop: <code>~/.teleagent/desktop.json</code>.
			</p>
			<table>
				<thead>
					<tr>
						<th>Variável</th>
						<th>Descrição</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>TELEAGENT_BOT_TOKEN</code>
						</td>
						<td>Token do BotFather</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_CHAT_ID</code>
						</td>
						<td>Chat id</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_ALLOWED_USER_IDS</code>
						</td>
						<td>Allowlist (ids separados por vírgula)</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_PORT</code>
						</td>
						<td>Porta local (default 3847)</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_PROJECT</code>
						</td>
						<td>Nome do projeto</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}

function DocArchitecture() {
	return (
		<>
			<p>Três camadas:</p>
			<ol className="list-decimal space-y-2 pl-5 text-[color:var(--muted)]">
				<li>
					<strong>CLI / HTTP client</strong> — agents e scripts
				</li>
				<li>
					<strong>Bridge (serve)</strong> — long polling Grammy + API local
				</li>
				<li>
					<strong>Desktop</strong> — Electron tray/hub, spawn do bridge, updater
				</li>
			</ol>
			<h2>Fluxo ask</h2>
			<CopyCode code={ARCHITECTURE_FLOW_CODE} />
		</>
	);
}

function DocSecurity() {
	return (
		<>
			<ul>
				<li>Bind apenas em localhost</li>
				<li>Allowlist de Telegram user ids</li>
				<li>Token e chat_id fora do git</li>
				<li>Não expor secrets em logs, issues, PRs ou mensagens</li>
			</ul>
			<p>
				Veja também{" "}
				<a
					href="https://github.com/MatheusLTrindade/Teleagent/blob/main/SECURITY.md"
					target="_blank"
					rel="noreferrer"
					className="text-[color:var(--cyan)]"
				>
					SECURITY.md
				</a>{" "}
				no repositório.
			</p>
		</>
	);
}

export const DOC_BODIES_PT: Record<string, () => ReactNode> = {
	introducao: DocIntro,
	quickstart: DocQuickstart,
	cli: DocCli,
	api: DocApi,
	desktop: DocDesktop,
	skill: DocSkill,
	configuracao: DocConfig,
	arquitetura: DocArchitecture,
	seguranca: DocSecurity,
};
