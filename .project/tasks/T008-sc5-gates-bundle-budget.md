---
id: T008
title: Hold the SC5 gates with a pinned initial-bundle budget
wave: 3
deps: [T007]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/panel-bundle-budget.test.mjs
---

# T008 — Hold the SC5 gates with a pinned initial-bundle budget

## Context

SC5 aggregates three gates that must hold at the head of the milestone: `npm run check`, `npm test`, and the panel's initial-bundle budget. The panel already sits at 535.44 kB against a 520 kB maximum warning, and INTENT's constraint is that this milestone must not make it worse — so the deliverable is a pin that fails when the budget policy or the measured initial total regresses, plus the recorded evidence that the three gates are green.

## Approach

- Add `scripts/panel-bundle-budget.test.mjs` as a `node:test` + `node:assert/strict` pin, picked up by the `npm test` glob `scripts/**/*.test.mjs`.
- The pin asserts three things: the panel project's `build-extension` target keeps an initial budget with `maximumWarning` 520kb and `maximumError` 1mb; the recorded pre-milestone baseline (535.44 kB) is present as a named constant in the test; and, when the extension build output is present under `extension/panel/`, the summed size of the initial files does not exceed that baseline.
- Measure rather than restate: run `npx nx run angular-ai-devtools:build-extension` in the worktree, read the emitted initial total from its output, and record the number in the Log beside the 535.44 kB baseline.
- `npm run check` and `npm test` must be green at the head. If either is red for a reason outside this task's single declared file, record the exact failing stage and path in the Log and return blocked; do not edit another task's files or weaken a rule.
- Do not modify the pinned tool registry module.

## Interface contract

None

## Intent coverage

- SC5

## Acceptance criteria

1. `npm run check` passes at the head.
2. `npm test` passes at the head.
3. `npx nx run angular-ai-devtools:build-extension` completes, the emitted initial total is recorded in the Log beside the 535.44 kB pre-milestone baseline, and no new initial-budget regression is introduced.
4. `scripts/panel-bundle-budget.test.mjs` pins the `build-extension` initial budget (520kb warning, 1mb error) and the 535.44 kB baseline, and fails when the measured initial total exceeds the baseline.
5. The pinned tool registry module is unchanged.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:build-extension && node --experimental-strip-types --test scripts/panel-bundle-budget.test.mjs && npm run check && npm test
```

Heavy: yes

## Log

- created by planner
- 2026-11-02 — created by the plan repair that split the SC5 gates out of T007 (verify-weight returned CHUNK at ten acceptance criteria). Depends on T007 because the gates run against the finished held-out test set.
