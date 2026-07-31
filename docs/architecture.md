# Arquitetura

## Visão geral

O Teleagent é um **bridge local-first**:

1. **CLI / HTTP client** — agents e scripts chamam `teleagent alert|ask|…` ou a API em `127.0.0.1:<port>`.
2. **Bridge (`serve`)** — processo Node que mantém long polling com a Bot API do Telegram e expõe a API local.
3. **Desktop (opcional)** — app Electron que gerencia o bridge, preferências de autostart e auto-update.

Não há servidor público nem webhook. O Telegram fala só com o processo na máquina do usuário.

## Componentes

| Camada | Pasta / artefato | Responsabilidade |
| --- | --- | --- |
| CLI + bridge | `src/` | Comandos, config, store de decisões, Grammy, HTTP server |
| Skill | `skills/teleagent/` | Instruções para agents Cursor |
| Desktop | `desktop/` | Tray, hub UI, spawn do bridge, `electron-updater` |
| Releases | GitHub Actions | Build NSIS/portable em tags `v*` |

## Fluxo de decisão (`ask`)

```text
agent → POST /v1/ask → store (pending)
                 → Telegram (botões)
user → callback → store (answered)
agent (polling/wait) → resposta JSON
```

Timeouts podem aplicar `--default` ou marcar expirado (exit code `2` na CLI).

## Configuração

- Fonte principal: `~/.teleagent/config.json`
- Override por env: `TELEAGENT_*` (ver README)
- Preferências do desktop: `~/.teleagent/desktop.json`

## Segurança

- Bind em localhost
- Allowlist de user ids do Telegram
- Segredos fora do git (ver `SECURITY.md`)

## Auto-update (desktop)

- Provider: GitHub Releases
- Artefato suportado: instalador **NSIS** (`Teleagent-Setup-*.exe`)
- Repo precisa ser público (ou token read-only no updater)
