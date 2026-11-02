# Review — wave 1, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 3

## T001 — Ship provisional context-budget constants and the chunking rule: pass

- ✅ The module exports CHUNK_TOKEN_CAP, CHAT_PROMPT_CAP, REDUCE_TOKEN_CAP and the 3.6 caps as named constants, each with the provisional value. — `context-budget.ts:30-60` exports all eight caps at the provisional values (2000, 5, 5400, 120, 200, 200, 20, 10); recorded Verify exit 0, 12 tests passed.
- ✅ A fact list over the cap is split into multiple chunks, each at most CHUNK_TOKEN_CAP tokens, and the reported chunk count equals the number of chunks produced. — `chunkFacts` (`context-budget.ts:110-153`) returns `chunkCount === chunks.length` with `chunkTokens` index-aligned; recorded Verify exit 0.
- ✅ No cap is raised to make an oversized fact list fit; the helper never silently truncates. — `CHUNK_TOKEN_CAP` stays 2000 (`context-budget.ts:30`) and an oversized fact throws `RangeError` (`context-budget.ts:130-135`) instead of being split, dropped or fitted; recorded Verify exit 0.
- ✅ The module imports no third-party dependency. — `context-budget.ts` has no import statements; recorded Verify exit 0.

Warnings (non-blocking):
- Junction alias cannot run the target; recorded Verify was run through the canonical worktree path (see task Log).

Contract violations (blocking):
- none

## T002 — Add the 200-message ring buffer keyed by pageKey: pass

- ✅ The buffer holds at most 200 entries and evicts the oldest on overflow (FIFO). — `RING_BUFFER_CAPACITY = 200` (`message-ring-buffer.ts:35`) with FIFO `shift()` in `push` (`message-ring-buffer.ts:136-138`); recorded Verify exit 0, 12 tests passed.
- ✅ After navigation the oldest surviving entry remains readable by position. — `navigate` only moves `currentPageKey` (`message-ring-buffer.ts:110-114`); pruning is lazy on the next write, so `at(position)` still finds it (`message-ring-buffer.ts:148-150`); recorded Verify exit 0.
- ✅ An entry is served as a current-page fact only when its pageKey equals the live currentPageKey. — `factAt` returns null on mismatch (`message-ring-buffer.ts:156-163`); recorded Verify exit 0.
- ✅ An empty buffer and a single-entry buffer answer without inventing a missing neighbour. — `neighboursWithin` returns null on both sides when absent (`message-ring-buffer.ts:180-188`); recorded Verify exit 0.
- ✅ No stale page identity answers for the live panel after navigation. — `factAt` and `currentPageEntries` gate on `pageKey === currentPageKey` (`message-ring-buffer.ts:100-103`, `156-163`); recorded Verify exit 0.

Warnings (non-blocking):
- Junction alias cannot run the target; recorded Verify was run through the canonical worktree path (see task Log).

Contract violations (blocking):
- none

## T003 — Add a reusable worker read path: pass

- ✅ A read can be issued through the worker boundary and resolves off the main thread. — `WorkerReadService.read()` hands the read to the port and returns a promise with `reading()`/`status()` signals (`worker-read.service.ts`); recorded Verify exit 0, 12 tests passed.
- ✅ Supersession cancels a stale read when a newer one is issued. — token protocol answers `cancelled` for stale tokens and drops late replies (`worker-read.worker.ts`, `worker-read.service.ts`); recorded Verify exit 0.
- ✅ No new dependency is added and the panel initial bundle does not grow. — `package.json`/`package-lock.json` untouched; build reports 534.15 kB initial with and without the three files (see task Log); recorded Verify exit 0.
- ✅ The page-read injector capture is preserved. — `read-tools.ts` untouched and the worker module imports no Angular DI; registry-reach guard passes 3/3 (see task Log); recorded Verify exit 0.

Warnings (non-blocking):
- Junction alias cannot run the target; recorded Verify was run through the canonical worktree path (see task Log).

Contract violations (blocking):
- none

## Intent coverage

### SC1 — A 200-message ring buffer survives a navigation, and its oldest entry is still readable after it.: pass
- ✅ held-out E1 and E2 deferred to T007 in wave 3; N3 observed: after navigation `factAt` returns null for any entry whose `pageKey` differs from the live `currentPageKey` (`message-ring-buffer.ts:156-163`) and stale entries are pruned only on the next write (`message-ring-buffer.ts:131-140`), so a stale page identity never answers as a live panel fact while the oldest entry remains readable by position via `at` (`message-ring-buffer.ts:148-150`); recorded Verify exit 0, 12/12 tests passed.

### SC4 — A fact list that exceeds the cap is chunked rather than silently truncated, and the chunk count the panel sees is truthful.: pass
- ✅ held-out E6 deferred to T007 in wave 3; N2 observed: `CHUNK_TOKEN_CAP` remains the provisional 2000 (`context-budget.ts:30`) and `chunkFacts` refuses an oversized fact with a `RangeError` (`context-budget.ts:130-135`) instead of raising the cap, reordering, dropping or shortening facts; `chunkCount === chunks.length` is returned by construction (`context-budget.ts:150`); recorded Verify exit 0, 12/12 tests passed.

## Fixed since last cycle

- none (cycle 1)

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: junction alias cannot run Nx targets; recorded Verify was executed through canonical worktree paths.