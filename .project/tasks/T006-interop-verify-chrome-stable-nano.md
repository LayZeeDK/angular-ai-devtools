---
id: T006
title: Verify interop claim on chrome-stable-nano
wave: 3
deps: [T004, T011, T012, T013, T014]
status: done
agent: build_T006
base: 02fcd9508730e13f05e3dfc8fce2d95555b7ada9
worktree: null
task_branch: null
files:
  - .project/plan/evidence/T006/chrome-stable-nano-doctor-1793410135219.json
  - .project/plan/evidence/T006/chrome-stable-nano-doctor-1793410206046.json
  - .project/plan/evidence/T006/chrome-stable-nano-flags-1793410145250.json
  - .project/plan/evidence/T006/chrome-stable-nano-flags-1793410212689.json
  - .project/plan/evidence/T006/chrome-stable-nano-info-1793410088849.json
  - .project/plan/evidence/T006/chrome-stable-nano-info-1793410180969.json
  - .project/plan/evidence/T006/chrome-stable-nano-model-info-1793410152773.json
  - .project/plan/evidence/T006/chrome-stable-nano-model-info-1793410218568.json
  - .project/plan/evidence/T006/chrome-stable-nano-panel-1793410116751.json
  - .project/plan/evidence/T006/chrome-stable-nano-panel-1793410191337.json
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
node .commandcode/skills/verify-ai-browsers/checks/interop.mjs --evidence .project/plan/evidence/T006 --url http://localhost:4222/stale-view --extension D:/projects/sandbox/angular-ai-devtools/extension chrome-stable-nano && echo retained .project/plan/evidence/T006/interop.json
```

Heavy: no

## Log

- pending
- evidence run (measured): chrome-stable-nano, Angular 22.2.2, nodes=1, limits stated, attribution stated, model answer in 25469 ms; retained .project/plan/evidence/T006/interop.json
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T006): pass, exit 0; output tail:
  ```
  retained .project/plan/evidence/T006/interop.json
  ```
