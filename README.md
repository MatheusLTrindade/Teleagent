# Teleagent

[![CI](https://github.com/MatheusLTrindade/Teleagent/actions/workflows/ci.yml/badge.svg)](https://github.com/MatheusLTrindade/Teleagent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/MatheusLTrindade/Teleagent?include_prereleases)](https://github.com/MatheusLTrindade/Teleagent/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

Bridge **local** entre agentes de IA (Cursor, Claude Code, Codex, etc.) e o **Telegram** — alertas e decisões humanas no loop, por projeto.

Site (divulgação / download / docs): pasta [`website/`](./website) — deploy na Vercel com **Root Directory** = `website`.

Quando um agent precisa te avisar ou pedir aprovação, o Teleagent manda a mensagem no Telegram, espera a resposta e devolve o resultado para o agent continuar sozinho.

**Sem VPS. Sem webhook público.** Só um bot + um processo na sua máquina.

## Destaques

- CLI + API HTTP em `127.0.0.1` (padrão `3847`)
- App Windows (bandeja + hub) com start/stop, autostart e auto-update
- Allowlist por Telegram user id
- Skill pronta para agentes Cursor
- Releases versionadas (`vX.Y.Z`) com instalador NSIS + portable

## Como funciona

```text
Agent (Cursor/…) ──CLI/HTTP──▶ teleagent serve (local / app Windows)
                                    │
                             long polling
                                    │
                                Telegram
                                    │
                              você responde
                                    │
                             agent continua
```

- **1 bot** do Telegram  
- **1 processo local** com long polling + API  
- **N projetos** — cada alerta/pergunta leva `--project`

## Setup rápido

### 1. Criar o bot

1. Abra [@BotFather](https://t.me/BotFather)
2. `/newbot` → nome e username
3. Copie o token

Comandos sugeridos no BotFather (`/setcommands`):

```text
start - Vincula este chat ao Teleagent
status - Verifica se o bridge está online
pending - Lista decisões abertas
help - Como usar alertas e decisões
```

Avatar de exemplo: [`assets/teleagent-bot-avatar.png`](./assets/teleagent-bot-avatar.png).

### 2. Instalar a CLI

```bash
git clone https://github.com/MatheusLTrindade/Teleagent.git
cd Teleagent
npm install
npm run build
npm link
```

### 3. Configurar e subir

```bash
teleagent setup --token <BOT_TOKEN> --allowed-user <SEU_TELEGRAM_USER_ID>
teleagent serve
```

No Telegram, abra o bot e envie `/start` (grava o `chat_id`). O `--allowed-user` restringe o bot ao seu user id (mostrado no `/start`).

### App Windows (bandeja + hub)

```bash
npm run desktop:install
npm run desktop:dev          # desenvolvimento
npm run desktop:dist         # instalador + portable em desktop/release
```

Ou baixe o instalador em [Releases](https://github.com/MatheusLTrindade/Teleagent/releases):

- `Teleagent-Setup-*.exe` — instalador NSIS (**suporta auto-update**)
- `Teleagent-Portable-*.exe` — portable (sem auto-update)

O hub:

- fica na **bandeja** com ícone Teleagent
- mostra **versão**, status, logs, start/stop
- pode **iniciar com o Windows**

### Atualizações automáticas

Em builds instalados (NSIS), o hub consulta [GitHub Releases](https://github.com/MatheusLTrindade/Teleagent/releases) por tags `vX.Y.Z`.

Publicar uma versão:

```bash
# versões alinhadas em package.json e desktop/package.json, na main
git tag v0.2.1
git push origin v0.2.1
```

O workflow **Release desktop** gera os artefatos e publica o Release.

> Requer repositório **público** (ou token GitHub no updater). Repo privado sem token → 404 no check de update.

## CLI

| Comando | Uso |
| --- | --- |
| `teleagent setup` | token / chat_id / porta / allowlist |
| `teleagent serve` | long polling + API local |
| `teleagent alert` | alerta (não bloqueia) |
| `teleagent ask` | decisão e espera |
| `teleagent cancel` | cancela ask pendente |
| `teleagent status` | health do bridge |

```bash
teleagent alert --project meu-app --level error --message "Deploy falhou" --json

teleagent ask \
  --project meu-app \
  --question "Promovo o deploy para produção?" \
  --options "sim,não" \
  --default não \
  --timeout-ms 900000 \
  --json

teleagent cancel --id ask_xxx
teleagent setup --allowed-user <SEU_TELEGRAM_USER_ID>
```

`ask` bloqueia até resposta, timeout (exit `2`) ou cancelamento. Com `--default`, no timeout usa essa resposta.

Códigos de saída: `0` ok · `1` erro/offline · `2` ask timeout/expirado/cancelado.

## API local

Base: `http://127.0.0.1:3847`

| Método | Path | Uso |
| --- | --- | --- |
| `GET` | `/health` | Status |
| `POST` | `/v1/alert` | Alerta |
| `POST` | `/v1/ask` | Pedido de decisão |
| `GET` | `/v1/decisions/:id` | Consultar |
| `POST` | `/v1/decisions/:id/cancel` | Cancelar |
| `POST` | `/v1/decisions/:id/expire` | Expirar / default |
| `GET` | `/v1/pending` | Listar pendentes |

`meta` opcional: `{ "cwd", "gitBranch", "prUrl", "agent" }`.

## Uso com Cursor (e outros agents)

1. Bridge online (`teleagent serve` ou app Windows)
2. Agent chama a CLI:

```bash
teleagent alert --project <nome> --message "..." --json
teleagent ask --project <nome> --question "..." --options "sim,não" --json
```

Skill: [`skills/teleagent/SKILL.md`](./skills/teleagent/SKILL.md) → copie para `~/.cursor/skills/teleagent/`.

## Configuração

| Variável | Descrição |
| --- | --- |
| `TELEAGENT_BOT_TOKEN` | Token do BotFather |
| `TELEAGENT_CHAT_ID` | Chat id |
| `TELEAGENT_ALLOWED_USER_IDS` | Allowlist (ids separados por vírgula) |
| `TELEAGENT_PORT` | Porta local (default `3847`) |
| `TELEAGENT_PROJECT` | Nome do projeto |

Arquivo: `~/.teleagent/config.json` (veja [`.env.example`](./.env.example)).

## Desenvolvimento

```bash
npm install
npm run typecheck
npm run build
npm run serve
npm run desktop:dev
```

Arquitetura: [`docs/architecture.md`](./docs/architecture.md).  
Contribuir: [`CONTRIBUTING.md`](./CONTRIBUTING.md).  
Segurança: [`SECURITY.md`](./SECURITY.md).  
Changelog: [`CHANGELOG.md`](./CHANGELOG.md).

## Apoiar

Se o Teleagent te ajudou, você pode patrocinar o desenvolvimento via
[GitHub Sponsors](https://github.com/sponsors/MatheusLTrindade).

## Licença

[MIT](./LICENSE) © MatheusLTrindade
