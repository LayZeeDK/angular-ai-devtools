---
id: T005
title: Add the Summarizer path with a cannot-tell state
wave: 2
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/jobs/summarize-job.ts
  - apps/angular-ai-devtools/src/app/jobs/summarize-job.spec.ts
---

# T005 — Add the Summarizer path with a cannot-tell state

## Context

The Summarizer path must summarise the tool result, not the tool declaration. This task adds a job kind that builds a deterministic outline in code and passes only free-text segments to the built-in Summarizer, returning a cannot-tell state when the API is unavailable.

## Approach

- The job kind is summarize, in the same jobs module.
- Headings, order, ids, names and numbers stay in code; only free-text segments (stacks, console text, long recordings) go to the Summarizer.
- If the Summarizer API is unavailable (availability() not available), the job returns a result value of { status: 'cannot-tell' } and the panel renders cannot tell for those segments.
- Tests distinguish summarising the result from summarising the tool declaration by feeding a result whose free text differs from the tool declaration's description and asserting the summary contains result text and never declaration text.
- No fallback to the Prompt API when the Summarizer is unavailable.

## Interface contract

- `JobProgress = { handle: string; chunksDone: number; chunksTotal: number; cancelled: boolean }`.
- `JobHandleRegistry` exposes `progress(handle: string): Signal<JobProgress>` and `cancel(handle: string): void`, keyed by the handle string the envelope returns, with one AbortController per job.
- The chunked fact-list job caps each chunk at CHUNK_TOKEN_CAP from the context-budget module and reports truthful chunk counts.

## Intent coverage

- None

## Acceptance criteria

1. The summarize job builds a deterministic outline in code and summarises only free-text segments.
2. When the Summarizer API is unavailable the job returns { status: 'cannot-tell' }.
3. A test distinguishes summarising the result from summarising the tool declaration.
4. No fallback to the Prompt API is used.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/summarize-job.spec.ts
```

Heavy: no

## Log

- created by planner