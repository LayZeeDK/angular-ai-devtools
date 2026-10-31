---
id: T009
title: Verify interop claim on edge-dev-aion
wave: 3
deps: [T004, T011, T012, T013, T014]
status: done
agent: build_T009
base: 908831b46ec7191b36e8afc8bb72ac2e4dd8fc97
worktree: null
task_branch: null
files:
  - .project/plan/evidence/T009/edge-dev-aion-doctor-1793410475572.json
  - .project/plan/evidence/T009/edge-dev-aion-doctor-1793410535398.json
  - .project/plan/evidence/T009/edge-dev-aion-flags-1793410480642.json
  - .project/plan/evidence/T009/edge-dev-aion-flags-1793410543522.json
  - .project/plan/evidence/T009/edge-dev-aion-info-1793410451958.json
  - .project/plan/evidence/T009/edge-dev-aion-info-1793410514551.json
  - .project/plan/evidence/T009/edge-dev-aion-model-info-1793410485845.json
  - .project/plan/evidence/T009/edge-dev-aion-model-info-1793410551849.json
  - .project/plan/evidence/T009/edge-dev-aion-panel-1793410460281.json
  - .project/plan/evidence/T009/edge-dev-aion-panel-1793410520201.json
  - .project/plan/evidence/T009/interop.json
---

# T009 — Verify interop claim on edge-dev-aion

## Context

SC6 requires a `lars-verify` verdict of verified for the interop claim across four models. This task drives the prepared interop check on the `edge-dev-aion` instance only and retains its per-pair result. The panel must already ship `/panel/interop` (T004) and the extension must be built before `up`.

## Approach

- Run `npx nx run angular-ai-devtools:build-extension` so the instance serves this checkout's build.
- Bring up the counter app with `control-angular-dev-app up --target counter` and `control-ai-browsers up edge-dev-aion`.
- Run the prepared check for this single instance and retain its result artifact.
- Do not run in a git sidecar; state the exact command and retained artifact path.
- This task owns exactly one instance: `edge-dev-aion`.

## Interface contract

- Each pair task retains a per-pair result at `<evidence>/interop.json` produced by `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` for its single instance.
- The assembler cites all four retained per-pair results and writes the `lars-verify` claim record.

## Intent coverage

- None

## Acceptance criteria

1. The prepared interop check runs to completion on `edge-dev-aion` and retains `.project/plan/evidence/T009/interop.json` (SC6 per-pair coverage).
2. The retained result records a pass or a could-not-run/claim failure for that instance, never a silent pass.
3. The instance serves this checkout's built extension folder.

## Verify

```bash
node .commandcode/skills/verify-ai-browsers/checks/interop.mjs --evidence .project/plan/evidence/T009 --url http://localhost:4222/stale-view --extension D:/projects/sandbox/angular-ai-devtools/extension edge-dev-aion && echo retained .project/plan/evidence/T009/interop.json
```

Heavy: no

## Log

- pending
- evidence run (measured): edge-dev-aion, Angular 22.2.2, nodes=1, limits stated, attribution stated, model answer in 5092 ms; retained .project/plan/evidence/T009/interop.json
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T009): pass, exit 0; output tail:
  ```
  retained .project/plan/evidence/T009/interop.json
  ```
