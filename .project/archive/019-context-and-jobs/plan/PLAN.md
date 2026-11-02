# Plan — Angular AI DevTools (M019 context-and-jobs)

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down: provisional caps, ring buffer, worker read path

Goal: Retire the riskiest unknowns first. T001 lands the provisional caps as one constant file plus the chunking rule (E6). T002 lands the 200-message ring buffer keyed by pageKey with FIFO eviction and page-key scoping (E1, E2). T003 lands the worker read path without growing the panel bundle (AR-1). If any of these fails, the milestone changes here.

Review depth: full

## Wave 2 — jobs, summarizer, clone measurement

Goal: T004 adds JobHandleRegistry with progress and cancellation plus a chunked fact-list job (E3, E4). T005 adds the Summarizer path with the cannot-tell state and the declaration-vs-result distinction. T006 commits the clone measurement artifact (E5).

Review depth: full

## Wave 3 — held-out verification and gates

Goal: T007 owns the held-out edges E1–E6 end-to-end (SC1–SC4). T008 owns the SC5 gates: npm run check, npm test, the 520 KB initial-budget policy as a pinned test, and the untouched registry (E7).

Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1 |
| SC1 | T002 | AC2 |
| SC1 | T002 | AC3 |
| SC1 | T002 | AC4 |
| SC1 | T002 | AC5 |
| SC2 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC2 | T004 | AC3 |
| SC2 | T004 | AC4 |
| SC2 | T004 | AC5 |
| SC2 | T004 | AC6 |
| SC3 | T006 | AC1 |
| SC3 | T006 | AC2 |
| SC3 | T006 | AC3 |
| SC3 | T006 | AC4 |
| SC4 | T001 | AC1 |
| SC4 | T001 | AC2 |
| SC4 | T001 | AC3 |
| SC4 | T001 | AC4 |
| SC4 | T004 | AC6 |
| SC1 | T007 | AC1 |
| SC2 | T007 | AC1 |
| SC3 | T007 | AC1 |
| SC4 | T007 | AC1 |
| SC5 | T008 | AC1 |
| SC5 | T008 | AC2 |
| SC5 | T008 | AC3 |
| SC5 | T008 | AC4 |
| SC5 | T008 | AC5 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T007 | apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts::E1 the 200-message buffer is filled, the panel navigates, and the oldest surviving entry is read back and compared to the entry written first |
| E2 | T007 | apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts::E2 a buffer that has never filled and a buffer with exactly one entry both answer without inventing a missing neighbour |
| E3 | T007 | apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts::E3 cancelling the same job twice reports one cancellation and leaves no partial fact list in the panel store |
| E4 | T007 | apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts::E4 cancellation lands between two chunks and the last completed chunk is not presented as a complete list |
| E5 | T007 | apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts::E5 the clone measurement is a committed artifact with the observed count, not a number restated in prose |
| E6 | T007 | apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts::E6 a fact list over the cap is chunked and the chunk count the panel receives equals the number of chunks the job emitted |

## Dependency notes

**T001 → T004 (data).** The chunked fact-list job caps each chunk at CHUNK_TOKEN_CAP from the constants module.

**T002 → T007 (landed effect).** The held-out read-back runs against the ring buffer module.

**T004 → T007 (landed effect).** Cancellation tests run against the job-handles module.

**T001 is dependency-free.** The constants module has no runtime deps.

**T003 must not grow the bundle.** The worker read path stays off the initial-bundle path where possible and adds no dependency.

**tool-registry.ts is pinned.** No task in this plan modifies it.