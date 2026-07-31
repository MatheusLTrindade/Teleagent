---
name: teleagent
description: >-
  Send Telegram alerts and request human decisions via the local Teleagent
  bridge while a Cursor agent works. Use when the agent needs to notify the
  user, pause for approval, or get a choice before continuing.
---

# Teleagent

Local bridge: Cursor agent ↔ Telegram. Requires `teleagent serve` running on the machine.

## When to use

- Alert the user without blocking (`alert`)
- Ask for a decision and **wait** before continuing (`ask`)

Always pass `--project` when known. Prefer `--json` on `ask` so you can parse the answer.

## Alert (non-blocking)

```bash
teleagent alert --project <project> --level info|warn|error --message "<text>"
```

Examples:

```bash
teleagent alert --project meu-app --level error --message "CI failed on main"
teleagent alert --project meu-app --message "Migration finished"
```

## Ask (blocking — wait for Telegram reply)

```bash
teleagent ask --project <project> --question "<text>" --options a,b [--timeout-ms 900000] --json
```

Examples:

```bash
teleagent ask --project meu-app --question "Promote deploy to production?" --options sim,não --json
teleagent ask --project meu-app --question "Which target?" --options staging,prod --timeout-ms 600000 --json
```

On success (`answered`), read `answer` from the JSON. Exit code `2` means timeout/expired — do not invent a decision; stop or ask again.

## Health

```bash
teleagent status
```

If bridge is offline:

```bash
teleagent serve
```

Then retry. Do not fall back to guessing user intent.

## Rules

- Never block the user with interactive terminal prompts for decisions — use `teleagent ask`
- Keep messages short and actionable
- Include enough context in the question (what happened, what you will do next for each option)
- One decision per `ask`; do not batch unrelated choices
