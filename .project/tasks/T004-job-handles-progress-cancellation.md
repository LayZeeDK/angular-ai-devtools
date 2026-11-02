---
id: T004
title: Add job handles with progress and cancellation
wave: 2
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/jobs/job-handles.ts
  - apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts
  - apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.ts
  - apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts
---

# T004 — Add job handles with progress and cancellation

## Context

The envelope's async-handle outcome and awaitHandle stay untouched; progress and cancellation need new machinery. This task adds a sidecar registry keyed by the handle string the envelope returns, with an AbortController per job, and a chunked fact-list job that reports progress, cancels between chunks, and discards any partial fact list.

## Approach

- Keep the pinned envelope untouched; do not modify the tool registry module.
- JobHandleRegistry is keyed by the handle string and exposes progress(handle) returning a signal of JobProgress and cancel(handle).
- Each async job gets an AbortController stored in the registry; the chunked job checks the abort signal between chunks and stops, discarding any partial fact list before returning its final outcome.
- Progress is reported only through the registry; the chunked result payload keeps travelling in the outcome's result value.
- A cancelled job leaves no partial fact list behind; cancelling twice reports one cancellation.
- Cancellation must actually stop the work, not discard a promise while work continues.

## Interface contract

- `JobProgress = { handle: string; chunksDone: number; chunksTotal: number; cancelled: boolean }`.
- `JobHandleRegistry` exposes `progress(handle: string): Signal<JobProgress>` and `cancel(handle: string): void`, keyed by the handle string the envelope returns, with one AbortController per job.
- The chunked fact-list job caps each chunk at CHUNK_TOKEN_CAP from the context-budget module and reports truthful chunk counts.

## Intent coverage

- SC2
- SC4

## Acceptance criteria

1. JobHandleRegistry is keyed by the handle string and exposes progress and cancel.
2. The chunked job reports progress through the registry with truthful chunksDone and chunksTotal.
3. Cancelling stops the work between chunks and discards any partial fact list.
4. Cancelling the same job twice reports one cancellation and leaves no partial fact list.
5. Cancellation lands between two chunks and the last completed chunk is not presented as a complete list.
6. A fact list over the cap is chunked and the chunk count the panel receives equals the number of chunks emitted.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts
```

Heavy: no

## Log

- created by planner