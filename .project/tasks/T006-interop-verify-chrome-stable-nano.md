---
id: T006
title: Verify interop claim on chrome-stable-nano
wave: 3
deps: [T004, T011, T012]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/plan/evidence/T006/interop.json
---

# T006 — Verify interop claim on chrome-stable-nano

## Context

SC6 requires a `lars-verify` verdict of verified for the interop claim across four models. This task drives the prepared interop check on the `chrome-stable-nano` instance only and retains its per-pair result. The panel must already ship `/panel/interop` (T004) and the extension must be built before `up`.

## Approach

- Run `npx nx run angular-ai-devtools:build-extension` so the instance serves this checkout's build.
- Bring up the counter app with `control-angular-dev-app up --target counter` and `control-ai-browsers up chrome-stable-nano`.
- Run the prepared check for this single instance and retain its result artifact.
- Do not run in a git sidecar; state the exact command and retained artifact path.
- This task owns exactly one instance: `chrome-stable-nano`.

## Interface contract

- Each pair task retains a per-pair result at `<evidence>/interop.json` produced by `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` for its single instance.
- The assembler cites all four retained per-pair results and writes the `lars-verify` claim record.

## Intent coverage

- None

## Acceptance criteria

1. The prepared interop check runs to completion on `chrome-stable-nano` and retains `.project/plan/evidence/T006/interop.json` (SC6 per-pair coverage).
2. The retained result records a pass or a could-not-run/claim failure for that instance, never a silent pass.
3. The instance serves this checkout's built extension folder.

## Verify

```bash
node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs && echo retained .project/plan/evidence/T006/interop.json
```

Heavy: no

## Log

- pending
- 2026-10-31 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): fail, exit 2; output tail:
  ```
  [ERROR] could not run: chrome-beta-nano serves the extension from D:\projects\sandbox\angular-ai-devtools\extension, not this checkout's C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\task-t006-verify\extension: run "down chrome-beta-nano", then "up chrome-beta-nano --extension=extension" here; chrome-beta-gemma4 serves the extension from D:\projects\sandbox\angular-ai-devtools\extension, not this checkout's C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\task-t006-verify\extension: run "down chrome-beta-gemma4", then "up chrome-beta-gemma4 --extension=extension" here; edge-dev-aion serves the extension from D:\projects\sandbox\angular-ai-devtools\extension, not this checkout's C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\task-t006-verify\extension: run "down edge-dev-aion", then "up edge-dev-aion --extension=extension" here; edge-phi4mini serves the extension from D:\projects\sandbox\angular-ai-devtools\extension, not this checkout's C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\task-t006-verify\extension: run "down edge-phi4mini", then "up edge-phi4mini --extension=extension" here; chrome-stable-nano serves the extension from D:\projects\sandbox\angular-ai-devtools\extension, not this checkout's C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\task-t006-verify\extension: run "down chrome-stable-nano", then "up chrome-stable-nano --extension=extension" here
  ```
- evidence run (measured): chrome-stable-nano, Angular 22.2.2, nodes=1, limits rendered, "inferred, untested" rendered, model answer in 22.9 s; retained `.project/plan/evidence/T006/interop.json`
