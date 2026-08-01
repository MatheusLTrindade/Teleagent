# Teleagent

**Idioma / Language / Idioma:** [Português](./README.md) · [English](./README.en.md) · [Español](./README.es.md)

[![CI](https://github.com/MatheusLTrindade/Teleagent/actions/workflows/ci.yml/badge.svg)](https://github.com/MatheusLTrindade/Teleagent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/MatheusLTrindade/Teleagent?include_prereleases)](https://github.com/MatheusLTrindade/Teleagent/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

**Local** bridge between AI agents (Cursor, Claude Code, Codex, etc.) and **Telegram** — alerts and human decisions in the loop, per project.

Marketing site / download / docs: [`website/`](./website) — deploy on Vercel with **Root Directory** = `website` (locales: `/pt`, `/en`, `/es`).

When an agent needs to notify you or ask for approval, Teleagent sends a Telegram message, waits for your reply, and returns the result so the agent can continue.

**No VPS. No public webhook.** Just one bot + one process on your machine.

## Highlights

- CLI + HTTP API on `127.0.0.1` (default `3847`)
- Windows app (tray + hub) with start/stop, autostart, and auto-update
- Allowlist by Telegram user id
- Ready-made Cursor skill
- Versioned releases (`vX.Y.Z`) with NSIS installer + portable

## How it works

```text
Agent (Cursor/…) ──CLI/HTTP──▶ teleagent serve (local / Windows app)
                                    │
                             long polling
                                    │
                                Telegram
                                    │
                              you reply
                                    │
                             agent continues
```

## Quick setup

1. Create a bot with [@BotFather](https://t.me/BotFather) and copy the token
2. Install CLI:

```bash
git clone https://github.com/MatheusLTrindade/Teleagent.git
cd Teleagent
npm install && npm run build && npm link
```

3. Configure and run:

```bash
teleagent setup --token <BOT_TOKEN> --allowed-user <YOUR_TELEGRAM_USER_ID>
teleagent serve
```

4. Open the bot in Telegram and send `/start`

Windows builds: [Releases](https://github.com/MatheusLTrindade/Teleagent/releases) (`Teleagent-Setup-*.exe` supports auto-update).

## CLI

| Command | Use |
| --- | --- |
| `teleagent setup` | token / chat_id / port / allowlist |
| `teleagent serve` | long polling + local API |
| `teleagent alert` | non-blocking alert |
| `teleagent ask` | decision and wait |
| `teleagent cancel` | cancel pending ask |
| `teleagent status` | bridge health |

Exit codes: `0` ok · `1` error/offline · `2` ask timeout/expired/cancelled.

## Local API

Base: `http://127.0.0.1:3847` — see Portuguese README or website docs for the full endpoint table.

## Support

Sponsor development via [GitHub Sponsors](https://github.com/sponsors/MatheusLTrindade).

## License

[MIT](./LICENSE) © MatheusLTrindade
