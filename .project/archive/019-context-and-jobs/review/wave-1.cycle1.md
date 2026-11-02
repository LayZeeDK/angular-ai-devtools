# Review — wave 1, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 3

<!-- Re-review of the same cycle: the previous record was preserved when a plan repair
     changed PLAN.md `## Intent coverage` only. The three landings are unchanged, and the
     product files at this review base f39830ea5b71f13c72e3e1fda5abd309cffc2ba8 are
     byte-identical to each landing's blobs (verified with git diff --stat between the
     review base and each landing commit for every declared product file: empty). So the
     isolated product inspected here is exactly the landed state, and the same rubric was
     applied as in the preserved prior review. -->

## T001 — Ship provisional context-budget constants and the chunking rule: pass

- ✅ The module exports CHUNK_TOKEN_CAP, CHAT_PROMPT_CAP, REDUCE_TOKEN_CAP and the 3.6 caps as named constants, each with the provisional value. — `apps/angular-ai-devtools/src/app/context-budget.ts:30-60` exports all eight caps at the provisional values (CHUNK_TOKEN_CAP 2000, CHAT_PROMPT_CAP 5, REDUCE_TOKEN_CAP 5400, SYSTEM_PROMPT_TOKEN_CAP 120, TOOL_DESCRIPTION_CHAR_CAP 200, RESULT_PAGE_STRING_CHAR_CAP 200, RESULT_ARRAY_ITEM_CAP 20, ERROR_VALID_VALUES_CAP 10), pinned by the spec at `context-budget.spec.ts:28-38`; recorded Verify exit 0, 1 file / 12 tests passed.
- ✅ A fact list over the cap is split into multiple chunks, each at most CHUNK_TOKEN_CAP tokens, and the reported chunk count equals the number of chunks produced. — `chunkFacts` (`context-budget.ts:110-153`) packs greedily and order-preservingly, returns `chunkCount` equal to `chunks.length` (`context-budget.ts:150`), and the spec asserts over-cap splitting with every chunk inside the cap plus count equality at five list sizes (`context-budget.spec.ts:107-139`); recorded Verify exit 0.
- ✅ No cap is raised to make an oversized fact list fit; the helper never silently truncates. — `CHUNK_TOKEN_CAP` stays the provisional 2000 (`context-budget.ts:30`), a single fact that alone exceeds the cap is refused with a `RangeError` naming the index and estimate (`context-budget.ts:130-135`), nothing is dropped or shortened (fan-out equality asserted at `context-budget.spec.ts:141-149`), and the spec pins the cap unchanged after the refusal (`context-budget.spec.ts:151-157`); recorded Verify exit 0.
- ✅ The module imports no third-party dependency. — `context-budget.ts` contains no import statement at all (source-inspected, whole file); the spec asserts the runtime half: only numbers, functions and plain frozen data on the module surface (`context-budget.spec.ts:60-70`); recorded Verify exit 0.

Warnings (non-blocking):
- The task Log records that the `wt\M019-T001` junction alias cannot run this Nx target; the recorded Verify was run through the canonical worktree path and reproduced the failure on an untouched spec, so it is isolation spelling, not this diff.

Contract violations (blocking):
- none

## T002 — Add the 200-message ring buffer keyed by pageKey: pass

- ✅ The buffer holds at most 200 entries and evicts the oldest on overflow (FIFO). — `RING_BUFFER_CAPACITY = 200` (`message-ring-buffer.ts:35`) with FIFO `shift()` eviction in `push` (`message-ring-buffer.ts:136-138`); the spec fills past the cap by five and asserts the five oldest left with positions unrenumbered (`message-ring-buffer.spec.ts:35-54`); recorded Verify exit 0, 1 file / 12 tests passed.
- ✅ After navigation the oldest surviving entry remains readable by position. — `navigate` only moves `currentPageKey` and prunes nothing (`message-ring-buffer.ts:110-114`), pruning is lazy on the next write (`message-ring-buffer.ts:131-140`), so `at(position)` still finds the oldest survivor after navigation (`message-ring-buffer.ts:148-150`); the spec reads back position 13 by `at` and `oldest` after `navigate(1, 2)` (`message-ring-buffer.spec.ts:57-74`); recorded Verify exit 0.
- ✅ An entry is served as a current-page fact only when its pageKey equals the live currentPageKey. — `factAt` returns null on key mismatch (`message-ring-buffer.ts:156-163`) and `currentPageEntries` filters on `entry.pageKey === key` (`message-ring-buffer.ts:100-103`); the spec turns the same positions from facts into nulls across a navigation (`message-ring-buffer.spec.ts:92-114`); recorded Verify exit 0.
- ✅ An empty buffer and a single-entry buffer answer without inventing a missing neighbour. — `neighboursWithin` answers null on the missing side for an absent position (`message-ring-buffer.ts:180-188`); the spec covers the empty buffer including a live page with nothing written (`message-ring-buffer.spec.ts:154-170`) and the single-entry buffer (`message-ring-buffer.spec.ts:173-185`); recorded Verify exit 0.
- ✅ No stale page identity answers for the live panel after navigation. — only `factAt` and `currentPageEntries` may serve a live fact and both gate on the live key (`message-ring-buffer.ts:100-103`, `156-163`), and `push` refuses to write without a live page instead of filing under a guessed key (`message-ring-buffer.ts:123-128`); the spec asserts every stale position answers null after navigation and a post-prune fact list carries only the live key (`message-ring-buffer.spec.ts:117-151`); recorded Verify exit 0.

Warnings (non-blocking):
- The task Log records the same junction-alias isolation note as T001; the recorded Verify ran through the canonical worktree path. The orchestrator's recorded output tail also shows an Nx flaky-task notice on a passing run (exit 0) — informational, not a weakened check.

Contract violations (blocking):
- none

## T003 — Add a reusable worker read path: pass

- ✅ A read can be issued through the worker boundary and resolves off the main thread. — `WorkerReadService.read()` hands the read to the `WORKER_READ_PORT` boundary and returns a promise while `status()`/`reading()` carry the in-flight state (`worker-read.service.ts:270-310`); the spec drives the real worker handler over a recording scope through `boundaryPort` and asserts the call did not block (`reading()` true with `result()` null immediately after `read()`, ready only when the promise settles) (`worker-read.service.spec.ts:324-342`); recorded Verify exit 0, 1 file / 12 tests passed.
- ✅ Supersession cancels a stale read when a newer one is issued. — the worker refuses a stale-on-arrival token without running it and answers a mid-read supersession `cancelled` between chunks with no value posted (`worker-read.worker.ts:315-324`, `341-348`), and the service settles the older caller `cancelled` at the moment a newer read is issued, then drops the late stale reply before it can write `result()` (`worker-read.service.ts:317-330`, `338-360`); the spec observes all three (`worker-read.service.spec.ts:286-320`, `344-371`); recorded Verify exit 0.
- ✅ No new dependency is added and the panel initial bundle does not grow. — the landing commits touch only the three declared files plus the task file (verified with `git show --stat`), so `package.json` and `package-lock.json` are untouched; the task Log records a measured production build at 534.15 kB with a byte-identical main hash with the three files present and moved aside, so the worker path contributes 0 kB to the initial bundle; recorded Verify exit 0.
- ✅ The page-read injector capture is preserved. — `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts` is untouched by any of the three landing commits (verified with `git show --stat`), the worker module imports no Angular DI (source-inspected, `worker-read.worker.ts`), and the spec observes a TestBed with `provideReadTools()` still executing `find_components` in the page-read vocabulary rather than throwing an injection-context error (`worker-read.service.spec.ts:421-444`); the task Log records the registry-reach guard passing 3/3; recorded Verify exit 0.

Warnings (non-blocking):
- The panel tests run in jsdom, which has no `Worker`; the boundary is driven through a documented recording scope that runs the real handler and real supersession code, and the spec asserts the no-`Worker` premise (`worker-read.service.spec.ts:405-418`), so the coverage is honest rather than weakened. The task Log records the same junction-alias isolation note; the recorded Verify ran through the junction's target path.

Contract violations (blocking):
- none

## Intent coverage

### SC1 — A 200-message ring buffer survives a navigation, and its oldest entry is still readable after it.: pass
- ✅ held-out E1/E2 (or E6) deferred to T007 in wave 3. N3 observed (prohibition: let a stale page identity answer for a live panel after navigation — must not): after `navigate`, `factAt` returns null for any entry whose `pageKey` differs from the live `currentPageKey` (`message-ring-buffer.ts:156-163`) and `currentPageEntries` filters on the live key (`message-ring-buffer.ts:100-103`), while stale entries are pruned only on the next write so the oldest entry stays readable by position through `at` (`message-ring-buffer.ts:131-140`, `148-150`) — the spec pins this end to end (`message-ring-buffer.spec.ts:57-74`, `117-151`); the 200-cap and FIFO survival are pinned at `message-ring-buffer.spec.ts:35-54`; recorded Verify exit 0, 1 file / 12 tests passed.

### SC4 — A fact list that exceeds the cap is chunked rather than silently truncated, and the chunk count the panel sees is truthful.: pass
- ✅ held-out E1/E2 (or E6) deferred to T007 in wave 3. N2 observed (prohibition: raise a cap so an oversized fact list fits — must not): every cap is a frozen named constant with `CHUNK_TOKEN_CAP` still the provisional 2000 (`context-budget.ts:30`, pinned unchanged after the refusal at `context-budget.spec.ts:151-157`), and `chunkFacts` refuses an oversized single fact with a `RangeError` (`context-budget.ts:130-135`) instead of raising the cap, splitting, dropping or shortening; `chunkCount` equals `chunks.length` by construction (`context-budget.ts:150`) and the spec asserts count truthfulness and fan-out equality at five list sizes (`context-budget.spec.ts:123-139`); recorded Verify exit 0, 1 file / 12 tests passed.

## Fixed since last cycle

- This is a re-review of cycle 1 after a plan repair that changed only PLAN.md `## Intent coverage`; the preserved prior record passed all three tasks and both owned SCs, and no criterion had failed. The three landings (6c39ae6, fa8cdaf, 1ff4a99) are unchanged and each product file at review base f39830ea is byte-identical to its landing blob (git diff --stat between the review base and each landing commit is empty for every declared product file). All previously passing criteria were re-checked against the same isolated product and the same rubric: all still pass, no regressions.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: the `wt\M019-*` junction aliases cannot run the Nx unit-test targets (recorded in all three task Logs; run Verify through the canonical worktree paths), and the recorded orchestrator Verify tails for T002 and T003 show an Nx flaky-task notice on exiting-0 runs — informational, no check was weakened.
