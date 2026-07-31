---
name: teleagent
description: >-
  Send Telegram alerts and request human decisions via the local Teleagent
  bridge while a Cursor agent works. Use when the agent needs to notify the
  user, pause for approval, or get a choice before continuing.
---

# Teleagent

Local bridge: Cursor agent ↔ Telegram. Requires the bridge online (`teleagent serve` or the Windows tray app). Do **not** start `teleagent serve` yourself inside the agent session — if offline, tell the user to start the app/serve.

## When to use

- Alert the user without blocking (`alert`)
- Ask for a decision and **wait** before continuing (`ask`)
- Cancel a pending ask if the plan changed (`cancel`)

Always pass `--project` with the real repo/project name. Prefer `--json` so you can parse the answer. Quote options: `--options "sim,não"`.

## Alert (non-blocking)

```bash
teleagent alert --project <project> --level info|warn|error --message "<text>" --json
```

## Ask (blocking — wait for Telegram reply)

```bash
teleagent ask --project <project> --question "<text>" --options a,b [--timeout-ms 900000] [--default <answer>] --json
```

On success (`answered`), read `answer` from the JSON. Exit code `2` means timeout/expired/cancelled without a usable default — do not invent a decision; stop or ask again.

Optional async: `--no-wait` then poll is not exposed in CLI beyond `cancel`; prefer blocking `ask` with `--json`.

## Cancel

```bash
teleagent cancel --id <ask_id> --json
```

## Health

```bash
teleagent status
```

If bridge is offline, ask the user to open the Teleagent Windows app (tray) or run `teleagent serve`. Do not guess user intent.

## Rules

- Never block the user with interactive terminal prompts for decisions — use `teleagent ask`
- Always include `--project <name>`
- Keep messages short and actionable
- Include enough context in the question (what happened, what you will do next for each option)
- One decision per `ask`; do not batch unrelated choices
- Levels: `info` (status/announce), `warn`, `error`
- Exit codes: `0` ok, `1` error/offline, `2` ask timeout/expired/cancelled
