/** Shared CLI / shell snippets — identical across all doc locales. */
export const BOT_COMMANDS_CODE = `start - Vincula este chat ao Teleagent
status - Verifica se o bridge está online
pending - Lista decisões abertas
help - Como usar alertas e decisões`;

export const INSTALL_CLI_CODE = `git clone https://github.com/MatheusLTrindade/Teleagent.git
cd Teleagent
npm install
npm run build
npm link`;

export const SETUP_SERVE_CODE = `teleagent setup --token <BOT_TOKEN> --allowed-user <SEU_TELEGRAM_USER_ID>
teleagent serve`;

export const FIRST_ASK_CODE = `teleagent ask \\
  --project demo \\
  --question "Tudo certo?" \\
  --options "sim,não" \\
  --json`;

export const CLI_EXAMPLES_CODE = `teleagent alert --project meu-app --level error --message "Deploy falhou" --json

teleagent ask \\
  --project meu-app \\
  --question "Promovo o deploy para produção?" \\
  --options "sim,não" \\
  --default não \\
  --timeout-ms 900000 \\
  --json

teleagent cancel --id ask_xxx`;

export const API_ASK_CODE = `curl -s http://127.0.0.1:3847/v1/ask \\
  -H "content-type: application/json" \\
  -d '{
    "project": "meu-app",
    "question": "Merge o PR?",
    "options": ["sim", "não"],
    "timeoutMs": 900000
  }'`;

export const DESKTOP_DEV_CODE = `npm run desktop:install
npm run desktop:dev
npm run desktop:dist`;

export const DESKTOP_TAG_CODE = `git tag v1.0.1
git push origin v1.0.1`;

export const SKILL_EXAMPLES_CODE = `teleagent alert --project Teleagent --level info --message "Build ok" --json

teleagent ask --project Teleagent \\
  --question "Abro o PR?" --options "sim,não" --json`;

export const ARCHITECTURE_FLOW_CODE = `agent → POST /v1/ask → store (pending)
                 → Telegram (botões)
user → callback → store (answered)
agent (wait) → JSON { status, answer }`;
