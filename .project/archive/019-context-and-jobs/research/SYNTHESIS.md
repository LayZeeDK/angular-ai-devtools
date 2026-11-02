# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Context budget has no home today → introduced in a new module, not extended from `ExtensionPromptService` (evidence-codebase.md § message/answer state is a single string with no size cap).
- Envelope stays pinned; chunking/progress/cancellation live outside `tool-registry.ts` (evidence-codebase.md § paginated/chunked results need no envelope change; INTENT.md N5).
- Worker read path is greenfield except for `stale-view-worker.js` token/supersession precedent (evidence-codebase.md § no web worker beyond the stale-view scan worker).
- S7/S14/S15/S19 unrun → caps stay provisional; no spike measured a change (evidence-spike-limits.md § S7, S14, S15 and S19 were never run).

## Decisions

### D1 — Chunk size and prompt cap (provisional)

- **Decision**: Ship provisional caps: chunks of at most 2,000 tokens; a chat answer uses at most ~5 prompts; the reduce step stays under Aion's usable ~5,400 tokens; the 3.6 caps (system prompt ~120 tokens, tool descriptions <~200 chars, results 200 chars/page string and 20 items/array, error template ≤10 valid values) are unchanged. All of these live in exactly one new file, `apps/angular-ai-devtools/src/app/context-budget.ts`, exported as named constants (`CHUNK_TOKEN_CAP`, `CHAT_PROMPT_CAP`, `REDUCE_TOKEN_CAP`, plus the 3.6 caps), so a later S15 measurement changes one constant in one place.
- **Runner-up**: Derive the chunk size at runtime from `measureContextUsage()` per model; rejected because no measurement exists and a runtime-derived cap would hide the provisional nature the milestone must keep visible.
- **Evidence**: evidence-spike-limits.md § Provisional numbers the code should use; docs/feature-proposals.md §3.7 "Chunked map-reduce"; INTENT.md N2/N4.
- **Confidence**: medium

### D2 — 200-message ring buffer: location, keying, eviction

- **Decision**: The ring buffer lives in the panel (an Angular store/service), not the worker, so it outlives an inspected-page navigation. Every entry is tagged with `pageKey = ${tabId}:${navigationId}` (the page it was filled from); the store tracks a live `currentPageKey` that updates on navigation. The oldest entry remains readable by position after navigation (SC1/E1), but an entry is only served as a current-page fact when its `pageKey` equals `currentPageKey`, so a stale page identity can never answer for the live panel (N3). Eviction is FIFO at capacity 200; stale-key entries are pruned lazily on the next write rather than on navigation.
- **Runner-up**: Wipe the buffer on navigation; rejected because SC1/E1 requires the oldest surviving entry to remain readable after navigation.
- **Evidence**: evidence-codebase.md § message/answer state is a single string with no size cap; INTENT.md SC1/E1/E2/N3; docs/feature-proposals.md §3.7.
- **Confidence**: high

### D3 — Async-handle progress and cancellation without touching the pinned envelope

- **Decision**: Keep the envelope's `async-handle` outcome and `awaitHandle` untouched; add a sidecar registry in a new file `apps/angular-ai-devtools/src/app/jobs/job-handles.ts` (`JobHandleRegistry`) keyed by the handle string the envelope returns. It exposes `progress(handle): Signal<JobProgress>` (`{handle, chunksDone, chunksTotal, cancelled}`) and `cancel(handle)`. Each async job gets an `AbortController` stored there; the chunked job checks the abort signal between chunks and stops (N1), discarding any partial fact list before returning its final `ToolOutcome` so no partial list is presented (E4). Progress is reported only through this registry; `ToolOutcome.result.value` keeps carrying the chunked result payload.
- **Runner-up**: Add a progress field to `ToolOutcome`; rejected because it edits the pinned envelope and breaks `scripts/registry-envelope-pin.test.mjs`.
- **Evidence**: evidence-codebase.md § no job/progress/streaming mechanism exists; § paginated/chunked results need no envelope change; INTENT.md SC2/E3/E4/N1.
- **Confidence**: high

### D4 — Summarizer "cannot tell" state and declaration-vs-result distinction

- **Decision**: The Summarizer path is a job kind `summarize` in the same jobs module. It builds a deterministic outline in code (headings, order, ids, names, numbers) and passes only free-text segments (stacks, console text, long recordings) to the built-in Summarizer; structural parts are never summarised. If the Summarizer API is unavailable (`availability() !== 'available'`), the job returns `ToolOutcome.result.value = {status: 'cannot-tell'}` — the named "cannot tell" state — and the panel renders "cannot tell" for those segments rather than prose. Tests distinguish "summarised the tool declaration" from "summarised the result" by feeding a result whose free text differs from the tool declaration's description and asserting the summary contains result text and never declaration text.
- **Runner-up**: Fall back to the Prompt API to summarise when Summarizer is unavailable; rejected because it changes the named state the milestone must expose and hides unavailability.
- **Evidence**: evidence-pitfalls.md § A Summarizer must summarise the tool result, not the tool declaration; docs/feature-proposals.md §3.7 "Summarizer with a deterministic outline"; INTENT.md SC4-ish risk.
- **Confidence**: high

### D5 — Task and wave shape

- **Decision**: Seven tasks across three waves. Wave 1 (burn down riskiest assumptions): (1) context-budget constants + chunking rule — retires silent truncation, carries E6; (2) ring buffer + page-key scoping — retires stale page identity leak, carries E1/E2; (3) worker read path — retires bundle-budget regression and panel blocking. Wave 2: (4) async job handles + progress/cancellation — retires un-cancellable jobs, carries E3/E4; (5) Summarizer path with cannot-tell — retires declaration-vs-result quiet failure; (6) clone measurement artifact committed (E5). Wave 3: (7) held-out edge verification task owns E1–E6 end-to-end plus `npm run check`/`npm test` and the 520 KB budget gate (SC5/E7). Each held-out edge is also tagged to its feature task; task 7 is the single owner that runs them all.
- **Runner-up**: One task per success criterion (five tasks); rejected because SC3 (clone measurement) and SC5 (gates) need their own tasks to be independently verifiable, and cancellation needs a dedicated test task.
- **Evidence**: INTENT.md §Edge coverage E1–E6; §Success criteria SC1–SC5; §Risks; evidence-codebase.md § no job/progress/streaming mechanism exists.
- **Confidence**: medium

## For the planner

- **Wave-1 blockers**: unrun S15 (chunk size/prompt cap) — burn down with the provisional constants and a committed measurement hook; stale page identity leak in the ring buffer; worker boundary on the panel's initial-bundle path.
- **Walking skeleton**: context-budget constant file + one chunked job that emits progress through `JobHandleRegistry` and cancels cleanly, proven by a held-out test, with the ring buffer surviving a navigation read-back.
- **Pitfalls → tasks**: too-large chunk → task 1 must cap at `CHUNK_TOKEN_CAP` and never raise it to fit (N2); Summarizer summarising the declaration → task 5 must feed result value only and ship the cannot-tell state; cancellation by discarded promise → task 4 must abort the `AbortController` and discard partial results; stale page identity → task 2 must tag entries with `pageKey` and filter by live key.

## User rulings

- none required (standing grant recorded in INTENT.md §Corrections).

## Still unknown

- none — all five decisions closed; S15 measurement remains a wave-1 spike against the provisional constants, not an open question.
