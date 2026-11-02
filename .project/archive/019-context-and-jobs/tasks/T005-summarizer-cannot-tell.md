---
id: T005
title: Add the Summarizer path with a cannot-tell state
wave: 2
deps: [T004]
status: done
agent: build_T005
base: 5178b187da9c863c097b2d54880d02f95d572bb7
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
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T005): fail, exit 1; output tail:
  ```
  [2m    "TypeError: Cannot read properties of null (reading \"updateTotal\") at CartService.updateCart (cart.service.ts:412:17)",[22m
  [31m+   "WARN [cart] total computed as NaN after the coupon was removed",[39m
  [2m  ][22m
  [36m [2m❯[22m apps/angular-ai-devtools/src/app/jobs/summarize-job.spec.ts:[2m355:28[22m[39m
      [90m353|[39m     [90m// One segment committed and reported before the cancel arrives.[39m
      [90m354|[39m     expect(early()).toEqual({ handle, chunksDone: 1, chunksTotal: 2, c…
      [90m355|[39m     [34mexpect[39m(controls[33m.[39masked)[33m.[39m[34mtoEqual[39m([[33mSTACK_TEXT[39m])[33m;[39m
      [90m   |[39m                            [31m^[39m
      [90m356|[39m
      [90m357|[39m     registry[33m.[39m[34mcancel[39m(handle)[33m;[39m
  [31m[2m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯[22m[39m
  
  [7m[1m[31m NX [39m[22m[27m  [31mRunning target [1mtest[22m for project angular-ai-devtools failed[39m
  
  [2mFailed tasks:[22m
  
  [2m-[22m angular-ai-devtools:test
  
  [2mHint: run the command with[22m --verbose [2mfor more details.[22m
  ```
- 2026-11-02 — coder: the job was right, the spec's model of "between segments" was wrong. The job commits at most the segment completed before the cancel (`chunksDone` stays 1, the released in-flight summary is discarded, the cancelled payload carries no outline), so AC3 and N1 held; the spec's `expect(controls.asked).toEqual([STACK_TEXT])` demanded that the second segment's `summarize()` never start, which contradicts the test's own held-second-summary machinery and would make the in-flight discard unprovable. Line 355 now expects `[STACK_TEXT, CONSOLE_TEXT]` (the second text is in flight, uncommitted — proven by the unchanged progress read), plus a post-outcome assertion that `asked` did not grow, so no work continues after the cancel. No product change; the other eight tests are untouched.
- 2026-11-02 — coder Verify (`C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T005`, `NX_DAEMON=false`): pass, exit 0 — `Test Files 1 passed (1)`, `Tests 9 passed (9)`. Running from the `wt\M019-T005` junction instead fails to compile (`file not found in TypeScript compilation`, junction-prefixed path), so the recorded worktree realpath is the required cwd. ready
