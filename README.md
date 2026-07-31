# Teleagent

Bridge local entre agentes Cursor e Telegram — alertas e decisões humanas no loop, por projeto.

Quando um agent precisa te alertar ou pedir uma decisão, o Teleagent manda mensagem no Telegram, espera sua resposta e devolve o resultado para o agent continuar sozinho.

## Como funciona

```
Cursor agent ──CLI/HTTP──▶ teleagent serve (local / app Windows)
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
- **1 processo local** (`teleagent serve` ou o app Windows) com long polling + API em `127.0.0.1:3847`
- **N projetos** Cursor — cada alerta/pergunta leva o nome do projeto

Não precisa de VPS nem webhook público.

## Setup rápido

### 1. Criar o bot

1. Abra [@BotFather](https://t.me/BotFather)
2. `/newbot` → escolha nome e username
3. Copie o token

Opcional — branding no BotFather:

1. `/setuserpic` → escolha o bot → envie PNG/JPG (ex.: `assets/teleagent-bot-avatar.png`)
2. `/setdescription` e `/setabouttext` → texto curto do bridge
3. `/setcommands`:

```text
start - Vincula este chat ao Teleagent
status - Verifica se o bridge está online
pending - Lista decisões abertas
help - Como usar alertas e decisões
```

### 2. Instalar CLI

```bash
git clone https://github.com/MatheusLTrindade/Teleagent.git
cd Teleagent
npm install
npm run build
npm link
```

### 3. Configurar

```bash
teleagent setup --token <BOT_TOKEN> --allowed-user <SEU_TELEGRAM_USER_ID>
teleagent serve
```

No Telegram, abra o bot e envie `/start` (grava o `chat_id`). O `--allowed-user` trava o bot só no seu user id (veja em `/start`).

### App Windows (bandeja + hub)

```bash
npm run desktop:install
npm run desktop:dev          # desenvolvimento
npm run desktop:dist         # gera instalador + portable em desktop/release
```

O app:

- fica na **bandeja** (itens ocultos) com ícone Teleagent
- abre o **hub** ao clicar (status, logs, start/stop)
- pode **iniciar com o Windows**
- sobe/para o bridge sem terminal

Instale o `Teleagent-Setup-*.exe` ou use o portable. Marque “Iniciar com o Windows” no hub.

## Formato no Telegram

```text
ℹ️ INFO · demo
Bridge ok

❓ DECISÃO · demo
Tudo certo?
[sim] [não]

✅ DECIDIDO · demo
Tudo certo?
→ sim

⏰ EXPIRADO · demo
…

✖️ CANCELADO · demo
…
```

Sempre passe `--project`. Sem isso, tenta o nome do repo git; senão o basename do cwd.

## CLI

```text
teleagent setup     # token / chat_id / porta / allowlist
teleagent serve     # long polling + API local
teleagent alert     # alerta (não bloqueia)
teleagent ask       # pede decisão e espera
teleagent cancel    # cancela ask pendente
teleagent status    # health do bridge
```

### Exemplos

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
teleagent setup --allowed-user 5508763445
```

`ask` bloqueia até resposta, timeout (exit `2`) ou cancelamento. Com `--default`, no timeout usa essa resposta e marca `answered`.

## API local

Base: `http://127.0.0.1:3847`

| Método | Path                       | Uso               |
| ------ | -------------------------- | ----------------- |
| `GET`  | `/health`                  | Status            |
| `POST` | `/v1/alert`                | Alerta            |
| `POST` | `/v1/ask`                  | Pedido de decisão |
| `GET`  | `/v1/decisions/:id`        | Consultar         |
| `POST` | `/v1/decisions/:id/cancel` | Cancelar          |
| `POST` | `/v1/decisions/:id/expire` | Expirar / default |
| `GET`  | `/v1/pending`              | Listar pendentes  |

Payload opcional `meta`: `{ "cwd", "gitBranch", "prUrl", "agent" }`.

## Uso com Cursor

1. Mantenha o bridge online (`teleagent serve` ou app Windows)
2. Agent chama:

```bash
teleagent alert --project <nome> --message "..." --json
teleagent ask --project <nome> --question "..." --options "sim,não" --json
```

Skill: [`skills/teleagent/SKILL.md`](./skills/teleagent/SKILL.md) → copie para `~/.cursor/skills/teleagent/`.

| Variável                     | Descrição                             |
| ---------------------------- | ------------------------------------- |
| `TELEAGENT_BOT_TOKEN`        | Token do BotFather                    |
| `TELEAGENT_CHAT_ID`          | Chat id                               |
| `TELEAGENT_ALLOWED_USER_IDS` | Allowlist (ids separados por vírgula) |
| `TELEAGENT_PORT`             | Porta local (default `3847`)          |
| `TELEAGENT_PROJECT`          | Nome do projeto                       |

Config: `~/.teleagent/config.json`

## Desenvolvimento

```bash
npm install
npm run typecheck
npm run build
npm run serve
npm run desktop:dev
```

## Licença

MIT
