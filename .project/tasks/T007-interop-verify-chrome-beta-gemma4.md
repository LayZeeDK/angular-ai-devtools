---
id: T007
title: Verify interop claim on chrome-beta-gemma4
wave: 3
deps: [T004, T011, T012]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/plan/evidence/T007/interop.json
---

# T007 — Verify interop claim on chrome-beta-gemma4

## Context

SC6 requires a `lars-verify` verdict of verified for the interop claim across four models. This task drives the prepared interop check on the `chrome-beta-gemma4` instance only and retains its per-pair result. The panel must already ship `/panel/interop` (T004) and the extension must be built before `up`.

## Approach

- Run `npx nx run angular-ai-devtools:build-extension` so the instance serves this checkout's build.
- Bring up the counter app with `control-angular-dev-app up --target counter` and `control-ai-browsers up chrome-beta-gemma4`.
- Run the prepared check for this single instance and retain its result artifact.
- Do not run in a git sidecar; state the exact command and retained artifact path.
- This task owns exactly one instance: `chrome-beta-gemma4`.

## Interface contract

- Each pair task retains a per-pair result at `<evidence>/interop.json` produced by `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` for its single instance.
- The assembler cites all four retained per-pair results and writes the `lars-verify` claim record.

## Intent coverage

- None

## Acceptance criteria

1. The prepared interop check runs to completion on `chrome-beta-gemma4` and retains `.project/plan/evidence/T007/interop.json` (SC6 per-pair coverage).
2. The retained result records a pass or a could-not-run/claim failure for that instance, never a silent pass.
3. The instance serves this checkout's built extension folder.

## Verify

```bash
node .commandcode/skills/verify-ai-browsers/checks/interop.mjs --evidence .project/plan/evidence/T007 --url http://localhost:4200 && echo retained .project/plan/evidence/T007/interop.json chrome-beta-gemma4
```

Heavy: no

## Log

- pending