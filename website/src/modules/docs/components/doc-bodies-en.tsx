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
				<strong>Teleagent</strong> is a <strong>local-first</strong> bridge
				between AI agents (Cursor, Claude Code, Codex, and similar) and{" "}
				<strong>Telegram</strong>. When the agent needs to notify or request
				approval, the message goes to your chat; you respond; the agent
				continues.
			</p>
			<p>
				There is no public server or webhook. Telegram only talks to the process
				on your machine.
			</p>
			<ul>
				<li>
					CLI + HTTP API on <code>127.0.0.1</code> (default <code>3847</code>)
				</li>
				<li>Windows app with system tray, hub, and auto-update</li>
				<li>Allowlist by Telegram user id</li>
				<li>Ready-made skill for Cursor agents</li>
			</ul>
			<h2>When to use</h2>
			<ul>
				<li>Deploy / migrate / force-push that require human confirmation</li>
				<li>
					CI, error, or completion alerts without blocking the IDE chat
				</li>
				<li>
					Any agentic flow where “inventing user intent” is dangerous
				</li>
			</ul>
		</>
	);
}

function DocQuickstart() {
	return (
		<>
			<h2>1. Create the bot</h2>
			<ol className="list-decimal space-y-2 pl-5 text-[color:var(--muted)]">
				<li>
					Open{" "}
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
					<code>/newbot</code> → name and username
				</li>
				<li>Copy the token</li>
			</ol>
			<p>
				Suggested commands (<code>/setcommands</code>):
			</p>
			<CopyCode code={BOT_COMMANDS_CODE} />

			<h2>2. Install the CLI</h2>
			<CopyCode code={INSTALL_CLI_CODE} />

			<h2>3. Configure and start</h2>
			<CopyCode code={SETUP_SERVE_CODE} />
			<p>
				On Telegram, open the bot and send <code>/start</code> (saves the{" "}
				<code>chat_id</code>). <code>--allowed-user</code> restricts the bot to
				your user id.
			</p>

			<h2>4. First ask</h2>
			<CopyCode code={FIRST_ASK_CODE} />
			<p>
				Or download the Windows app at{" "}
				<a href="/download" className="text-[color:var(--cyan)]">
					/download
				</a>{" "}
				and start the bridge from the hub.
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
						<th>Command</th>
						<th>Usage</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>teleagent setup</code>
						</td>
						<td>token / chat_id / port / allowlist</td>
					</tr>
					<tr>
						<td>
							<code>teleagent serve</code>
						</td>
						<td>long polling + local API</td>
					</tr>
					<tr>
						<td>
							<code>teleagent alert</code>
						</td>
						<td>alert (non-blocking)</td>
					</tr>
					<tr>
						<td>
							<code>teleagent ask</code>
						</td>
						<td>decision and wait</td>
					</tr>
					<tr>
						<td>
							<code>teleagent cancel</code>
						</td>
						<td>cancel pending ask</td>
					</tr>
					<tr>
						<td>
							<code>teleagent status</code>
						</td>
						<td>bridge health</td>
					</tr>
				</tbody>
			</table>

			<h2>Examples</h2>
			<CopyCode code={CLI_EXAMPLES_CODE} />

			<h2>Exit codes</h2>
			<ul>
				<li>
					<code>0</code> — ok
				</li>
				<li>
					<code>1</code> — error / bridge offline
				</li>
				<li>
					<code>2</code> — ask timeout / expired / cancelled (no usable default)
				</li>
			</ul>
			<p>
				<code>ask</code> blocks until response, timeout, or cancellation. With{" "}
				<code>--default</code>, on timeout it uses that response.
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
						<th>Method</th>
						<th>Path</th>
						<th>Usage</th>
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
						<td>Alert</td>
					</tr>
					<tr>
						<td>POST</td>
						<td>
							<code>/v1/ask</code>
						</td>
						<td>Decision request</td>
					</tr>
					<tr>
						<td>GET</td>
						<td>
							<code>/v1/decisions/:id</code>
						</td>
						<td>Query</td>
					</tr>
					<tr>
						<td>POST</td>
						<td>
							<code>/v1/decisions/:id/cancel</code>
						</td>
						<td>Cancel</td>
					</tr>
					<tr>
						<td>POST</td>
						<td>
							<code>/v1/decisions/:id/expire</code>
						</td>
						<td>Expire / default</td>
					</tr>
					<tr>
						<td>GET</td>
						<td>
							<code>/v1/pending</code>
						</td>
						<td>List pending</td>
					</tr>
				</tbody>
			</table>
			<p>
				Optional <code>meta</code>:{" "}
				<code>{`{ "cwd", "gitBranch", "prUrl", "agent" }`}</code>.
			</p>
			<h2>Ask example</h2>
			<CopyCode code={API_ASK_CODE} />
		</>
	);
}

function DocDesktop() {
	return (
		<>
			<p>
				The Windows app lives in the <strong>system tray</strong>, shows
				version/status/logs, and lets you start/stop the bridge, autostart with
				Windows, and auto-update.
			</p>
			<h2>Artifacts</h2>
			<ul>
				<li>
					<code>Teleagent-Setup-*.exe</code> — NSIS installer (supports
					auto-update)
				</li>
				<li>
					<code>Teleagent-Portable-*.exe</code> — portable (no auto-update)
				</li>
			</ul>
			<h2>Development</h2>
			<CopyCode code={DESKTOP_DEV_CODE} />
			<h2>Auto-update</h2>
			<p>
				NSIS builds check GitHub Releases for <code>vX.Y.Z</code> tags. The
				repo must be public (or provide a token in the updater).
			</p>
			<CopyCode code={DESKTOP_TAG_CODE} />
		</>
	);
}

function DocSkill() {
	return (
		<>
			<p>
				Copy <code>skills/teleagent/SKILL.md</code> to{" "}
				<code>~/.cursor/skills/teleagent/</code>.
			</p>
			<h2>Agent rules</h2>
			<ul>
				<li>
					Do not invent user decisions — use <code>ask</code>
				</li>
				<li>
					Always pass <code>--project</code>
				</li>
				<li>
					Prefer <code>--json</code> and read <code>answer</code>
				</li>
				<li>If the bridge is offline, ask the user to start the app</li>
			</ul>
			<CopyCode code={SKILL_EXAMPLES_CODE} />
		</>
	);
}

function DocConfig() {
	return (
		<>
			<p>
				Main file: <code>~/.teleagent/config.json</code>. Desktop preferences:{" "}
				<code>~/.teleagent/desktop.json</code>.
			</p>
			<table>
				<thead>
					<tr>
						<th>Variable</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<code>TELEAGENT_BOT_TOKEN</code>
						</td>
						<td>BotFather token</td>
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
						<td>Allowlist (comma-separated ids)</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_PORT</code>
						</td>
						<td>Local port (default 3847)</td>
					</tr>
					<tr>
						<td>
							<code>TELEAGENT_PROJECT</code>
						</td>
						<td>Project name</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}

function DocArchitecture() {
	return (
		<>
			<p>Three layers:</p>
			<ol className="list-decimal space-y-2 pl-5 text-[color:var(--muted)]">
				<li>
					<strong>CLI / HTTP client</strong> — agents and scripts
				</li>
				<li>
					<strong>Bridge (serve)</strong> — long polling Grammy + local API
				</li>
				<li>
					<strong>Desktop</strong> — Electron tray/hub, bridge spawn, updater
				</li>
			</ol>
			<h2>Ask flow</h2>
			<CopyCode code={ARCHITECTURE_FLOW_CODE} />
		</>
	);
}

function DocSecurity() {
	return (
		<>
			<ul>
				<li>Bind only on localhost</li>
				<li>Telegram user id allowlist</li>
				<li>Token and chat_id out of git</li>
				<li>Do not expose secrets in logs, issues, PRs, or messages</li>
			</ul>
			<p>
				See also{" "}
				<a
					href="https://github.com/MatheusLTrindade/Teleagent/blob/main/SECURITY.md"
					target="_blank"
					rel="noreferrer"
					className="text-[color:var(--cyan)]"
				>
					SECURITY.md
				</a>{" "}
				in the repository.
			</p>
		</>
	);
}

export const DOC_BODIES_EN: Record<string, () => ReactNode> = {
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
