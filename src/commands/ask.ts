import { loadConfig } from "../config.js";
import { postAsk, waitForDecision } from "../client.js";
import { detectProject, flagBool, flagString } from "../util.js";

function parseOptions(raw?: string): string[] | undefined {
  if (!raw?.trim()) return undefined;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function runAsk(
  flags: Record<string, string | boolean>,
  positionals: string[],
): Promise<number> {
  if (flagBool(flags, "help", "h")) {
    console.log(`Usage:
  teleagent ask --question <text> [--project <name>] [--options a,b,c] [--timeout-ms 900000] [--json]

Examples:
  teleagent ask --question "Promovo o deploy para produção?" --options sim,não
  teleagent ask --project meu-app --question "Qual branch uso?" --timeout-ms 600000
  teleagent ask --question "Seguimos?" --options sim,não --json
`);
    return 0;
  }

  const config = loadConfig();
  const question =
    flagString(flags, "question", "q") || positionals.join(" ");
  if (!question?.trim()) {
    console.error(
      [
        "Error: pergunta ausente.",
        '  teleagent ask --question "Promovo o deploy?" --options sim,não',
      ].join("\n"),
    );
    return 1;
  }

  const project = detectProject(flagString(flags, "project", "p"));
  const options = parseOptions(flagString(flags, "options", "o"));
  const timeoutRaw = flagString(flags, "timeout-ms", "timeout");
  const timeoutMs = timeoutRaw ? Number(timeoutRaw) : 15 * 60 * 1000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    console.error("Error: --timeout-ms inválido");
    return 1;
  }

  const created = await postAsk(config, {
    project,
    question: question.trim(),
    options,
    timeoutMs,
  });

  if (!flagBool(flags, "no-wait")) {
    process.stderr.write(
      `[teleagent] aguardando decisão ${created.id} (timeout ${timeoutMs}ms)...\n`,
    );
  }

  if (flagBool(flags, "no-wait")) {
    if (flagBool(flags, "json")) {
      console.log(JSON.stringify(created, null, 2));
    } else {
      console.log(`asked ${created.id}`);
      console.log(`status: ${created.status}`);
    }
    return 0;
  }

  const decided = await waitForDecision(config, created.id, timeoutMs);
  if (flagBool(flags, "json")) {
    console.log(JSON.stringify(decided, null, 2));
  } else if (decided.status === "answered") {
    console.log(`answered ${decided.id}`);
    console.log(`project: ${decided.project}`);
    console.log(`answer: ${decided.answer}`);
  } else {
    console.error(`status: ${decided.status}`);
    console.error(`id: ${decided.id}`);
    return 2;
  }

  return decided.status === "answered" ? 0 : 2;
}
