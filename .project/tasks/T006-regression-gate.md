---
id: T006
title: Regression gate and full verification
wave: 3
deps: [T001, T002, T003, T004, T005]
status: done
agent: orchestrator
base: 49977ad5c457e2c14ada4dc98e2aab272c8a428c
worktree: null
task_branch: null
files:
  - extension/agent-main.test.mjs
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - apps/angular-ai-devtools/src/app/signal-provenance.spec.ts
  - apps/angular-ai-devtools/src/app/anti-pattern-detector.spec.ts
---

# T006 — Regression gate and full verification

## Context

Final verification that N2 introduces no regressions to N1 change-detection causality, extension messaging, tab filtering, or panel-local Prompt API security (Prohibition N4), and that the full gate passes (edge E9). Re-run the feature unit tests plus the project checks and extension build in a clean sidecar.

## Approach

- Confirm N1 tests still pass unchanged (`update-cause-chain.spec.ts`).
- Re-run the N2 unit tests, `npm run check`, `npm test`, and `build-extension`.
- Fix any regression surfaced by the gate without changing N1 behavior; if a fix requires changing N1-tested behavior, escalate rather than silently alter.
- Do not add new feature code here; this task is verification and minimal regression fixes only.

## Interface contract

- None

## Intent coverage

- SC6

## Acceptance criteria

1. `npm run check` passes with no type errors.
2. `npm test` passes with no failures (including N1 tests and N2 unit tests).
3. `npx nx run angular-ai-devtools:build-extension` succeeds.
4. No regression to N1 change-detection causality, extension messaging, tab filtering, or panel-local Prompt API security.

## Verify

```bash
npm run check && npm test && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && node --test extension/agent-main.test.mjs
```

Heavy: yes

## Log

- created by planner
- 2026-10-25 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): fail, exit 1; output tail:
  ```
  error TS2688: Cannot find type definition file for 'node'.
    The file is in the program because:
      Entry point of type library 'node' specified in compilerOptions
      npm notice run check
      npm notice run tsc -p tsconfig.json && npm run check:skills
  ```
- 2026-10-25 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): fail, exit 1; output tail:
  ```
  error TS2688: Cannot find type definition file for 'node'.
    The file is in the program because:
      Entry point of type library 'node' specified in compilerOptions
      npm notice run check
      npm notice run tsc -p tsconfig.json && npm run check:skills
  ```
- 2026-10-25 — verify Verify (sidecar gsd-path-verify/task-t006-verify, deps bridged via sidecar-deps-bridge.mjs): pass, exit 0. npm run check + 522 tests + build-extension + agent-main.test.mjs all pass
- attested: Full verification gate passes: npm run check + 522 tests + build-extension + agent-main tests with sidecar deps bridge fix
