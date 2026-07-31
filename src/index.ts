#!/usr/bin/env node
import { parseArgs } from "./util.js";
import { runSetup, runStatus } from "./commands/setup.js";
import { runServe } from "./commands/serve.js";
import { runAlert } from "./commands/alert.js";
import { runAsk } from "./commands/ask.js";

function printRootHelp(): void {
  console.log(`teleagent — bridge local Cursor ↔ Telegram

Usage:
  teleagent <command> [options]

Commands:
  setup     Salva token/chat_id/porta em ~/.teleagent/config.json
  serve     Sobe long polling + API local (127.0.0.1:3847)
  alert     Envia alerta (não bloqueia)
  ask       Pede decisão e espera a resposta no Telegram
  status    Mostra config e se o bridge está online

Examples:
  teleagent setup --token <BOT_TOKEN>
  teleagent serve
  teleagent alert --message "CI falhou" --level error
  teleagent ask --question "Promovo?" --options sim,não

Docs:
  teleagent <command> --help
`);
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "help" || argv[0] === "--help" || argv[0] === "-h") {
    printRootHelp();
    return 0;
  }

  const { command, flags, positionals } = parseArgs(process.argv);

  switch (command) {
    case "setup":
      return runSetup(flags);
    case "serve":
      return runServe(flags);
    case "alert":
      return runAlert(flags, positionals);
    case "ask":
      return runAsk(flags, positionals);
    case "status":
      return runStatus(flags);
    default:
      console.error(`Error: comando desconhecido "${command}"`);
      console.error("  teleagent --help");
      return 1;
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error(String(err?.stack || err));
    process.exitCode = 1;
  });
