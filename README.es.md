# Teleagent

**Idioma / Language / Idioma:** [Português](./README.md) · [English](./README.en.md) · [Español](./README.es.md)

[![CI](https://github.com/MatheusLTrindade/Teleagent/actions/workflows/ci.yml/badge.svg)](https://github.com/MatheusLTrindade/Teleagent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/MatheusLTrindade/Teleagent?include_prereleases)](https://github.com/MatheusLTrindade/Teleagent/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

Bridge **local** entre agentes de IA (Cursor, Claude Code, Codex, etc.) y **Telegram** — alertas y decisiones humanas en el loop, por proyecto.

Sitio (divulgación / descarga / docs): [`website/`](./website) — deploy en Vercel con **Root Directory** = `website` (locales: `/pt`, `/en`, `/es`).

Cuando un agent necesita avisarte o pedir aprobación, Teleagent envía el mensaje a Telegram, espera tu respuesta y devuelve el resultado para que el agent continúe.

**Sin VPS. Sin webhook público.** Solo un bot + un proceso en tu máquina.

## Destacados

- CLI + API HTTP en `127.0.0.1` (por defecto `3847`)
- App Windows (bandeja + hub) con start/stop, autostart y auto-update
- Allowlist por Telegram user id
- Skill lista para agentes Cursor
- Releases versionadas (`vX.Y.Z`) con instalador NSIS + portable

## Cómo funciona

```text
Agent (Cursor/…) ──CLI/HTTP──▶ teleagent serve (local / app Windows)
                                    │
                             long polling
                                    │
                                Telegram
                                    │
                              tú respondes
                                    │
                             agent continúa
```

## Setup rápido

1. Crea el bot con [@BotFather](https://t.me/BotFather) y copia el token
2. Instala la CLI:

```bash
git clone https://github.com/MatheusLTrindade/Teleagent.git
cd Teleagent
npm install && npm run build && npm link
```

3. Configura y arranca:

```bash
teleagent setup --token <BOT_TOKEN> --allowed-user <TU_TELEGRAM_USER_ID>
teleagent serve
```

4. Abre el bot en Telegram y envía `/start`

Builds Windows: [Releases](https://github.com/MatheusLTrindade/Teleagent/releases) (`Teleagent-Setup-*.exe` soporta auto-update).

## CLI

| Comando | Uso |
| --- | --- |
| `teleagent setup` | token / chat_id / puerto / allowlist |
| `teleagent serve` | long polling + API local |
| `teleagent alert` | alerta (no bloquea) |
| `teleagent ask` | decisión y espera |
| `teleagent cancel` | cancela ask pendiente |
| `teleagent status` | health del bridge |

Códigos de salida: `0` ok · `1` error/offline · `2` ask timeout/expirado/cancelado.

## API local

Base: `http://127.0.0.1:3847` — consulta el README en portugués o la docs del sitio para la tabla completa.

## Apoyar

Patrocina el desarrollo en [GitHub Sponsors](https://github.com/sponsors/MatheusLTrindade).

## Licencia

[MIT](./LICENSE) © MatheusLTrindade
