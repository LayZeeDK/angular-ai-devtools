---
id: T007
title: Verify held-out edges E1-E6 and the SC5 gates
wave: 3
deps: [T001, T002, T003, T004, T005, T006]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/context-budget.spec.ts
  - apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts
  - apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts
  - apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts
  - apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
---

# T007 — Verify held-out edges E1-E6 and the SC5 gates

## Context

This task owns the held-out edges E1-E6 end to end plus the SC5 gates: npm run check, npm test and the 520 KB initial bundle budget. It does not modify the pinned tool registry module.

## Approach

- Run the held-out tests for E1 through E6 and record their results.
- Run npm run check and npm test at the head.
- Run the extension build and confirm the initial bundle stays inside the 520 KB budget; the panel is already 535.44 kB, so no dependency that grows it may be added.
- Do not modify the pinned tool registry module.
- Do not weaken any check or test to reach green.

## Interface contract

None

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5

## Acceptance criteria

1. E1: the 200-message buffer is filled, the panel navigates, and the oldest surviving entry is read back and compared to the entry written first.
2. E2: a buffer that has never filled and a buffer with exactly one entry both answer without inventing a missing neighbour.
3. E3: cancelling the same job twice reports one cancellation and leaves no partial fact list in the panel's store.
4. E4: cancellation lands between two chunks, and the last completed chunk is not presented as a complete list.
5. E5: the clone measurement is a committed artifact with the observed count, not a number restated in prose.
6. E6: a fact list over the cap is chunked, and the chunk count the panel receives equals the number of chunks the job emitted.
7. npm run check passes at the head.
8. npm test passes at the head.
9. The extension build completes with no initial-budget warning inside 520 KB.
10. The pinned tool registry module is unchanged.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts && npm run check && npm test && npx nx run angular-ai-devtools:build-extension
```

Heavy: yes

## Log

- created by planner