# Teleagent

Bridge local entre agentes Cursor e Telegram — alertas e decisões humanas no loop, por projeto.

Quando um agent precisa te alertar ou pedir uma decisão, o Teleagent manda mensagem no Telegram, espera sua resposta e devolve o resultado para o agent continuar sozinho.

## Como funciona

```
Cursor agent ──CLI/HTTP──▶ teleagent serve (local)
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
- **1 processo local** (`teleagent serve`) com long polling + API em `127.0.0.1:3847`
- **N projetos** Cursor — cada alerta/pergunta leva o nome do projeto

Não precisa de VPS nem webhook público.

## Setup rápido

### 1. Criar o bot

1. Abra [@BotFather](https://t.me/BotFather)
2. `/newbot` → escolha nome e username
3. Copie o token

### 2. Instalar

```bash
git clone https://github.com/MatheusLTrindade/Teleagent.git
cd Teleagent
npm install
npm run build
npm link
```

### 3. Configurar e subir

```bash
teleagent setup --token <BOT_TOKEN>
teleagent serve
```

No Telegram, abra o bot e envie `/start` (isso grava o seu `chat_id`).

Em outro terminal:

```bash
teleagent status
teleagent alert --message "Bridge ok"
teleagent ask --question "Tudo certo?" --options sim,não
```

## CLI

```text
teleagent setup     # salva token/chat_id/porta
teleagent serve     # long polling + API local
teleagent alert     # alerta (não bloqueia)
teleagent ask       # pede decisão e espera
teleagent status    # health do bridge
```

### Exemplos

```bash
teleagent alert --project meu-app --level error --message "Deploy falhou"

teleagent ask \
  --project meu-app \
  --question "Promovo o deploy para produção?" \
  --options sim,não \
  --timeout-ms 900000

teleagent ask --question "Qual ambiente?" --options staging,prod --json
```

`ask` bloqueia até você responder no Telegram (botão ou reply) ou até o timeout (exit code `2`).

## API local

Base: `http://127.0.0.1:3847`

| Método | Path | Uso |
|--------|------|-----|
| `GET` | `/health` | Status |
| `POST` | `/v1/alert` | Enviar alerta |
| `POST` | `/v1/ask` | Criar pedido de decisão |
| `GET` | `/v1/decisions/:id` | Consultar decisão |
| `GET` | `/v1/pending` | Listar pendentes |

```bash
curl -s http://127.0.0.1:3847/health

curl -s -X POST http://127.0.0.1:3847/v1/alert \
  -H "content-type: application/json" \
  -d '{"project":"meu-app","level":"warn","message":"Fila lenta"}'

curl -s -X POST http://127.0.0.1:3847/v1/ask \
  -H "content-type: application/json" \
  -d '{"project":"meu-app","question":"Seguimos?","options":["sim","não"]}'
```

## Uso com Cursor

Para agents usarem o Teleagent:

1. Mantenha `teleagent serve` rodando na máquina
2. No projeto, o agent pode chamar:

```bash
teleagent alert --project <nome> --message "..."
teleagent ask --project <nome> --question "..." --options sim,não --json
```

Há um skill em [`skills/teleagent/SKILL.md`](./skills/teleagent/SKILL.md) — copie para `~/.cursor/skills/teleagent/` (ou skills do projeto) para o agent descobrir sozinho.

Variáveis úteis:

| Variável | Descrição |
|----------|-----------|
| `TELEAGENT_BOT_TOKEN` | Token do BotFather |
| `TELEAGENT_CHAT_ID` | Seu chat id |
| `TELEAGENT_PORT` | Porta local (default `3847`) |
| `TELEAGENT_PROJECT` | Nome do projeto (senão usa o basename do cwd) |

Config persistente: `~/.teleagent/config.json`

## Desenvolvimento

```bash
npm install
npm run dev -- status
npm run serve
npm run typecheck
npm run build
```

## Licença

MIT
