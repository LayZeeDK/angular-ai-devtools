---
id: T007
title: Verify held-out edges E1-E6
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

# T007 — Verify held-out edges E1-E6

## Context

This task owns the held-out edges E1-E6 end to end and nothing else. The SC5 gates (npm run check, npm test, the bundle-budget policy) belong to T008. It does not modify the pinned tool registry module.

## Approach

- Write the E1-E6 tests into the five declared spec files, one edge per test, and record their results.
- E1 and E2 live in `message-ring-buffer.spec.ts`; E3 and E4 in `job-handles.spec.ts` and `chunked-fact-list-job.spec.ts`; E5 in `clone-measurement.spec.ts`; E6 in `chunked-fact-list-job.spec.ts`.
- Keep every existing test green; add tests, do not rewrite the ones the feature tasks already proved.
- Do not modify the pinned tool registry module.
- Do not weaken any check or test to reach green.

## Interface contract

None

## Intent coverage

- SC1
- SC2
- SC3
- SC4

## Acceptance criteria

1. E1: the 200-message buffer is filled, the panel navigates, and the oldest surviving entry is read back and compared to the entry written first.
2. E2: a buffer that has never filled and a buffer with exactly one entry both answer without inventing a missing neighbour.
3. E3: cancelling the same job twice reports one cancellation and leaves no partial fact list in the panel's store.
4. E4: cancellation lands between two chunks, and the last completed chunk is not presented as a complete list.
5. E5: the clone measurement is a committed artifact with the observed count, not a number restated in prose.
6. E6: a fact list over the cap is chunked, and the chunk count the panel receives equals the number of chunks the job emitted.
7. The pinned tool registry module is unchanged.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
```

Heavy: yes

## Log

- created by planner
- 2026-11-02 — plan repair: the SC5 gate criteria (npm run check, npm test, extension build, registry) moved to the new T008 because verify-weight returned CHUNK for this task at ten acceptance criteria. This task now owns E1-E6 only. Recorded in STATE at build/blocked before the repair.
