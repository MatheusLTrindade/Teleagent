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
				<strong>Teleagent</strong> es un bridge <strong>local-first</strong>{" "}
				entre agentes de IA (Cursor, Claude Code, Codex y similares) y{" "}
				<strong>Telegram</strong>. Cuando el agente necesita avisar o pedir
				aprobación, el mensaje va a tu chat; respondes; el agente continúa.
			</p>
			<p>
				No hay servidor público ni webhook. Telegram solo habla con el proceso
				en tu máquina.
			</p>
			<ul>
				<li>
					CLI + API HTTP en <code>127.0.0.1</code> (predeterminado{" "}
					<code>3847</code>)
				</li>
				<li>App Windows con bandeja, hub y auto-update</li>
				<li>Allowlist por Telegram user id</li>
				<li>Skill lista para agentes Cursor</li>
			</ul>
			<h2>Cuándo usar</h2>
			<ul>
				<li>Deploy / migrate / force-push que exigen confirmación humana</li>
				<li>
					Alertas de CI, error o conclusión sin bloquear el chat del IDE
				</li>
				<li>
					Cualquier flujo agéntico donde “inventar la intención del usuario” es
					peligroso
				</li>
			</ul>
		</>
	);
}

function DocQuickstart() {
	return (
		<>
			<h2>1. Crear el bot</h2>
			<ol className="list-decimal space-y-2 pl-5 text-[color:var(--muted)]">
				<li>
					Abre{" "}
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
					<code>/newbot</code> → nombre y username
				</li>
				<li>Copia el token</li>
			</ol>
			<p>
				Comandos sugeridos (<code>/setcommands</code>):
			</p>
			<CopyCode code={BOT_COMMANDS_CODE} />

			<h2>2. Instalar la CLI</h2>
			<CopyCode code={INSTALL_CLI_CODE} />

			<h2>3. Configurar e iniciar</h2>
			<CopyCode code={SETUP_SERVE_CODE} />
			<p>
				En Telegram, abre el bot y envía <code>/start</code> (guarda el{" "}
				<code>chat_id</code>). <code>--allowed-user</code> restringe el bot a
				tu user id.
			</p>

			<h2>4. Primer ask</h2>
			<CopyCode code={FIRST_ASK_CODE} />
			<p>
				O descarga la app Windows en{" "}
				<a href="/download" className="text-[color:var(--cyan)]">
					/download
				</a>{" "}
				e inicia el bridge desde el hub.
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
						<td>token / chat_id / puerto / allowlist</td>
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
						<td>alerta (no bloquea)</td>
					</tr>
					<tr>
						<td>
							<code>teleagent ask</code>
						</td>
						<td>decisión y espera</td>
					</tr>
					<tr>
						<td>
							<code>teleagent cancel</code>
						</td>
						<td>cancela ask pendiente</td>
					</tr>
					<tr>
						<td>
							<code>teleagent status</code>
						</td>
						<td>health del bridge</td>
					</tr>
				</tbody>
			</table>

			<h2>Ejemplos</h2>
			<CopyCode code={CLI_EXAMPLES_CODE} />

			<h2>Códigos de salida</h2>
			<ul>
				<li>
					<code>0</code> — ok
				</li>
				<li>
					<code>1</code> — error / bridge offline
				</li>
				<li>
					<code>2</code> — ask timeout / expirado / cancelado (sin default
					utilizable)
				</li>
			</ul>
			<p>
				<code>ask</code> bloquea hasta respuesta, timeout o cancelación. Con{" "}
				<code>--default</code>, en timeout usa esa respuesta.
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
						<td>Estado</td>
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
						<td>Solicitud de decisión</td>
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
						<td>Listar pendientes</td>
					</tr>
				</tbody>
			</table>
			<p>
				<code>meta</code> opcional:{" "}
				<code>{`{ "cwd", "gitBranch", "prUrl", "agent" }`}</code>.
			</p>
			<h2>Ejemplo ask</h2>
			<CopyCode code={API_ASK_CODE} />
		</>
	);
}

function DocDesktop() {
	return (
		<>
			<p>
				La app Windows vive en la <strong>bandeja</strong>, muestra
				versión/estado/logs y permite start/stop del bridge, autostart con
				Windows y auto-update.
			</p>
			<h2>Artefactos</h2>
			<ul>
				<li>
					<code>Teleagent-Setup-*.exe</code> — instalador NSIS (soporta
					auto-update)
				</li>
				<li>
					<code>Teleagent-Portable-*.exe</code> — portable (sin auto-update)
				</li>
			</ul>
			<h2>Desarrollo</h2>
			<CopyCode code={DESKTOP_DEV_CODE} />
			<h2>Auto-update</h2>
			<p>
				Los builds NSIS consultan GitHub Releases por tags <code>vX.Y.Z</code>.
				El repo debe ser público (o token en el updater).
			</p>
			<CopyCode code={DESKTOP_TAG_CODE} />
		</>
	);
}

function DocSkill() {
	return (
		<>
			<p>
				Copia <code>skills/teleagent/SKILL.md</code> a{" "}
				<code>~/.cursor/skills/teleagent/</code>.
			</p>
			<h2>Reglas del agent</h2>
			<ul>
				<li>
					No inventar decisión del usuario — usar <code>ask</code>
				</li>
				<li>
					Siempre pasar <code>--project</code>
				</li>
				<li>
					Preferir <code>--json</code> y leer <code>answer</code>
				</li>
				<li>
					Si el bridge está offline, pedir al usuario que inicie la app
				</li>
			</ul>
			<CopyCode code={SKILL_EXAMPLES_CODE} />
		</>
	);
}

function DocConfig() {
	return (
		<>
			<p>
				Archivo principal: <code>~/.teleagent/config.json</code>. Preferencias
				del desktop: <code>~/.teleagent/desktop.json</code>.
			</p>
			<table>
				<thead>
					<tr>
						<th>Variable</th>
						<th>Descripción</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>TELEAGENT_BOT_TOKEN</code>
						</td>
						<td>Token de BotFather</td>
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
						<td>Allowlist (ids separados por coma)</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_PORT</code>
						</td>
						<td>Puerto local (default 3847)</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_PROJECT</code>
						</td>
						<td>Nombre del proyecto</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}

function DocArchitecture() {
	return (
		<>
			<p>Tres capas:</p>
			<ol className="list-decimal space-y-2 pl-5 text-[color:var(--muted)]">
				<li>
					<strong>CLI / HTTP client</strong> — agents y scripts
				</li>
				<li>
					<strong>Bridge (serve)</strong> — long polling Grammy + API local
				</li>
				<li>
					<strong>Desktop</strong> — Electron tray/hub, spawn del bridge,
					updater
				</li>
			</ol>
			<h2>Flujo ask</h2>
			<CopyCode code={ARCHITECTURE_FLOW_CODE} />
		</>
	);
}

function DocSecurity() {
	return (
		<>
			<ul>
				<li>Bind solo en localhost</li>
				<li>Allowlist de Telegram user ids</li>
				<li>Token y chat_id fuera del git</li>
				<li>No exponer secrets en logs, issues, PRs o mensajes</li>
			</ul>
			<p>
				Consulta también{" "}
				<a
					href="https://github.com/MatheusLTrindade/Teleagent/blob/main/SECURITY.md"
					target="_blank"
					rel="noreferrer"
					className="text-[color:var(--cyan)]"
				>
					SECURITY.md
				</a>{" "}
				en el repositorio.
			</p>
		</>
	);
}

export const DOC_BODIES_ES: Record<string, () => ReactNode> = {
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
