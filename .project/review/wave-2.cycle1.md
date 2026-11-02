# Review — wave 2, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Lens:
Tasks reviewed: 3

## T004 — Add job handles with progress and cancellation: pass

- ✅ JobHandleRegistry is keyed by the handle string and exposes progress and cancel. — job-handles.ts:85 `progress(handle: string): Signal<JobProgress>` and job-handles.ts:120 `cancel(handle: string): void`, both resolving through the private `entry(handle)` map keyed by the handle string (job-handles.ts:130-145); proved by job-handles.spec.ts tests at lines 38-44 (root-provided, keyed, idle answer for unseen handles) and 119-140 (two handles kept apart, one controller and one signal each).
- ✅ The chunked job reports progress through the registry with truthful chunksDone and chunksTotal. — chunked-fact-list-job.ts:163 publishes `chunksTotal = plan.chunkCount` before the first chunk and :174 reports `emitted.length` after each chunk; chunked-fact-list-job.spec.ts:78-99 drives the real registry, takes the signal before the job runs, asserts the precondition through `chunkFacts(facts).chunkCount` (line 84) and reads `chunksDone: 3, chunksTotal: 3` on the same signal afterwards.
- ✅ Cancelling stops the work between chunks and discards any partial fact list. — chunked-fact-list-job.ts:165-181 checks the abort signal at the top of every iteration, suspends on a macrotask boundary (`betweenChunks`, :76-80), and returns a cancelled payload carrying counts only (:181); chunked-fact-list-job.spec.ts:128-152 proves the cancel landed with chunk 1 done (`chunksDone: 1` before and after the cancel) and that the cancelled payload has exactly the keys `status`, `chunksDone`, `chunksTotal` — no chunk list (:150-151).
- ✅ Cancelling the same job twice reports one cancellation and leaves no partial fact list. — job-handles.ts:120-127 sets the flag once and aborts once (`if (!entry.controller.signal.aborted)`), and `report()` preserves the flag (:106); chunked-fact-list-job.spec.ts:155-180 cancels twice around a running job, counts exactly one `abort` event (:173), and the cancelled payload again carries no chunks (:177-179).
- ✅ Cancellation lands between two chunks and the last completed chunk is not presented as a complete list. — chunked-fact-list-job.spec.ts:134-142: the cancel is issued after the job has emitted chunk 1 and suspended (progress read `chunksDone: 1, chunksTotal: 3` before the cancel), so it lands between chunk 1 and chunk 2; the cancelled payload has no chunk list at all (:149-151), so the last completed chunk cannot read as complete.
- ✅ A fact list over the cap is chunked and the chunk count the panel receives equals the number of chunks emitted. — chunked-fact-list-job.ts:184-191 returns `chunkCount: emitted.length` alongside `chunks: emitted` and `tokenCap: CHUNK_TOKEN_CAP` (imported from `../context-budget`, :32; the cap constant is context-budget.ts:30 and is not redefined); chunked-fact-list-job.spec.ts:102-125 asserts `chunkCount === chunks.length`, `chunkCount === registry.progress(handle)().chunksTotal`, `chunkCount > 1`, every fact returns once in order, and `chunkTokens` equal `chunkFacts(facts).chunkTokens`.
- ✅ `JobProgress = { handle: string; chunksDone: number; chunksTotal: number; cancelled: boolean }`. — job-handles.ts:39-44, exactly these four readonly fields; the spec asserts whole values of this shape (job-handles.spec.ts:57, 80, 103).
- ✅ `JobHandleRegistry` exposes `progress(handle: string): Signal<JobProgress>` and `cancel(handle: string): void`, keyed by the handle string the envelope returns, with one AbortController per job. — job-handles.ts:85-87 and :120-127; one `AbortController` per entry, created once and never replaced (job-handles.ts:140, :130-145); idempotent `start()` returns the same signal (job-handles.spec.ts:63-64). The pinned envelope module `tool-registry.ts` is untouched by this landing.
- ✅ The chunked fact-list job caps each chunk at CHUNK_TOKEN_CAP from the context-budget module and reports truthful chunk counts. — chunked-fact-list-job.ts:32 imports `CHUNK_TOKEN_CAP, chunkFacts` from `../context-budget`; the plan comes from `chunkFacts` (:150) and the counts travel with `tokenCap: CHUNK_TOKEN_CAP` (:190); spec lines 84, 119-124 pin the counts to the module's own output.

Recorded Verify (task Log, not re-run): declared command exit 0 — `Test Files 2 passed (2); Tests 12 passed (12)`, plus a fresh `--skip-nx-cache` re-run at 12/12; orchestrator isolate Verify exit 0. Rejected first attempt (4 failing assertions in the Log) predates this landing; the landed retry is what was judged here.

Warnings (non-blocking):
- Nx prints "Nx detected a flaky task" in the recorded orchestrator Verify tail; the result itself is 12/12 passed and the coder re-ran without cache, so no criterion is defeated.
- none

Contract violations (blocking):
- none — the landing touches exactly the four declared product files plus this task file; the task-file diff changes only orchestrator-owned frontmatter (`status`, `agent`, `base`) and appends Log entries.

## T005 — Add the Summarizer path with a cannot-tell state: pass

- ✅ The summarize job builds a deterministic outline in code and summarises only free-text segments. — summarize-job.ts:280-325 echoes `id`/`heading`/`order` from the request and only `summary` comes from the model; summarize-job.spec.ts:224-251 asserts the outline equals the code-decided structure, that exactly the two segment texts reached the Summarizer in order through one session (`createCount` 1), and that no raw free text survives in the serialized payload.
- ✅ When the Summarizer API is unavailable the job returns { status: 'cannot-tell' }. — summarize-job.ts:256-271 answers `{ status: 'cannot-tell' }` for a missing global, a non-`'available'` answer and a throwing `availability()`; spec lines 279-305 (all three availability states, payload equals exactly `{ status: 'cannot-tell' }` with no other keys, no session created, nothing asked), 308-321 (availability throws) and 324-335 (no Summarizer global at all).
- ✅ A test distinguishes summarising the result from summarising the tool declaration. — summarize-job.spec.ts:254-276 feeds a result whose free text shares no distinctive word with the declaration description, asserts the summaries contain result-text markers (`cart.service.ts:412`, `NaN`), that the payload never contains declaration text, and that `controls.asked` never received the description.
- ✅ No fallback to the Prompt API is used. — a `LanguageModel` sentinel counting every touch is installed for every test (spec:124-141, :209-215) and stays at zero across the complete path (spec:250), every cannot-tell path (:304, :320, :334) and the unavailable path; the job source never references a Prompt fallback (summarize-job.ts:20-24).
- ✅ `JobProgress = { handle: string; chunksDone: number; chunksTotal: number; cancelled: boolean }`. — unchanged from T004's product (job-handles.ts:39-44), present at this task's base and untouched by this landing.
- ✅ `JobHandleRegistry` exposes `progress(handle: string): Signal<JobProgress>` and `cancel(handle: string): void`, keyed by the handle string the envelope returns, with one AbortController per job. — satisfied by T004's landed `job-handles.ts` (in the sidecar at this task's base); this landing adds no change to it and consumes it through `JobHandleRegistry` injection (summarize-job.ts:235).
- ✅ The chunked fact-list job caps each chunk at CHUNK_TOKEN_CAP from the context-budget module and reports truthful chunk counts. — satisfied by T004's landed `chunked-fact-list-job.ts` (:150, :184-191); untouched by this landing.

Recorded Verify (task Log, not re-run): coder Verify exit 0 — `Test Files 1 passed (1)`, `Tests 9 passed (9)`; orchestrator isolate Verify exit 0. The spec contains 9 tests (lines 224, 254, 279, 308, 324, 338, 378, 400, 436), matching the recorded count.

Amendment check (per brief): the authoritative failure was `expect(controls.asked).toEqual([STACK_TEXT])` at spec line 355 of the rejected run, inside the progress-and-cancellation test (now at :338-375). The amendment asserts `asked` grows to `[STACK_TEXT, CONSOLE_TEXT]` while the progress read stays at `chunksDone: 1` (in flight, uncommitted), then after cancel and release that `asked` did not grow (:368), that the cancelled payload is `{ status: 'cancelled', segmentsDone: 1, segmentsTotal: 2 }` (:365) and that the post-cancel summary text is absent from the serialized outcome (:369-370). This does not weaken AC3: AC3's dedicated declaration-vs-result test (:254-276) is untouched, and the amendment replaces an impossible expectation with one that proves more — the in-flight summary is provably discarded and no work continues after the cancel (N1), which the original assertion could not show.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none — the landing touches exactly the two declared product files plus this task file; the task-file diff changes only orchestrator-owned frontmatter and appends Log entries.

## T006 — Commit the clone measurement artifact: pass

- ✅ A measurement artifact is committed with the observed clone count. — research/raw/clone-measurement-m019.json is a committed file in the landing (15 lines) carrying `observed: 1` for metric "fresh language-model sessions per prompt", with method, command, samples and base recorded.
- ✅ The count is the observed value, not a number restated in prose. — the spec re-runs the measurement rather than restating it: clone-measurement.spec.ts:118-164 installs counting spies on all five primitives (`lm.create`, `session.prompt`, `session.destroy`, `session.clone`, `globalThis.structuredClone` — including a `session.clone` the real session interface does not declare, so a clone would be counted, not assumed away, :61-94), runs one `service.explain(['fact one','fact two'])` through the real `ExtensionPromptService`, then reads the committed artifact through `import.meta.glob` with a `?raw` eager query (the committed file's bytes, :101-116) and asserts `artifact.observed` equals the measured `lm.create` count and `artifact.samples` equals what the spies saw (:157-161). The file contains no clone-call invention; judged under the INTENT.md `## Corrections` SC3 clone-target ruling (one fresh language-model session per prompt), which is exactly what the artifact records.
- ✅ A test verifies the artifact carries the observed count. — clone-measurement.spec.ts:157-163: `artifact.observed` equals the re-measured count and equals 1; `artifact.samples` equals the measured counts; `artifact.command` names the Verify command.
- ✅ No cap is raised to fit the measurement. — the landing touches only the two declared files; no cap constant or budget module is modified (`CHUNK_TOKEN_CAP` remains 2000 at context-budget.ts:30), and nothing in the artifact or spec tunes a cap.

Recorded Verify (task Log, not re-run): declared command exit 0 — `Test Files 1 passed (1)`, `Tests 1 passed (1)`; orchestrator isolate Verify exit 0; the coder additionally ran `npm run check:panel` (tsc over tsconfig.check.json) exit 0.

Warnings (non-blocking):
- The recorded orchestrator Verify output is an nx cache hit ("Nx read the output from the cache instead of running the command for 1 out of 1 tasks"); the coder's own Verify ran the tests fresh (npm ci then nx test, FULL_VERIFY_EXIT=0), so the criterion is still backed by an uncached run.

Contract violations (blocking):
- none — the landing touches exactly the two declared product files plus this task file; the task-file diff changes only orchestrator-owned frontmatter and appends Log entries.

## Intent coverage

### SC2 — A chunked job reports progress and cancels, and a cancelled job leaves no partial fact list behind.: pass
- ✅ The chunked job publishes the plan and per-chunk counts through `JobHandleRegistry` (chunked-fact-list-job.ts:163, :174) and a cancelled job returns a payload with counts only — no chunk list (chunked-fact-list-job.ts:178-181) — so no partial fact list survives; both properties are proven against the real registry in chunked-fact-list-job.spec.ts:78-99 and :128-152. Recorded isolated Verify: 2 files / 12 tests passed, exit 0.
- Prohibition N1 (cancellation must actually stop the work): pass. The job checks its abort signal at the top of every iteration and between chunks (chunked-fact-list-job.ts:165-176) and stops executing; the spec proves no work continues after the cancel — the cancelled payload's keys are exactly `status`, `chunksDone`, `chunksTotal` (:150-151) and the registry's cancelled flag survives any late report (job-handles.spec.ts:100-104). The promise is not discarded while work runs on.
- Edge E3 (idempotency, held-out): deferred to T007 in wave 3 — no output exists yet; not judged against this wave. The in-wave test at chunked-fact-list-job.spec.ts:155-180 already covers the double-cancel behaviour the edge row describes.
- Edge E4 (concurrency, held-out): deferred to T007 in wave 3 — no output exists yet; not judged against this wave. The in-wave test at chunked-fact-list-job.spec.ts:128-152 already lands the cancel between two chunks with one chunk done.

### SC3 — One fresh clone per prompt is measured, with the measurement committed.: pass
- ✅ research/raw/clone-measurement-m019.json is committed with `observed: 1`, the method, the command and raw samples (`lm.create` 1, `session.prompt` 1, `session.destroy` 1, `structuredClone` 0, `session.clone` 0), and clone-measurement.spec.ts re-measures through the real `ExtensionPromptService` and asserts the committed values equal what the spies saw (clone-measurement.spec.ts:146-163). Recorded isolated Verify: 1 file / 1 test passed, exit 0.
- Applied ruling (INTENT.md `## Corrections`, SC3 clone target): "one fresh clone per prompt" means one fresh language-model session per prompt; judged against that ruling, not against a `LanguageModelSession.clone()` call — none was required, none was invented, and the ruling's raw primitive counts are exactly what the artifact records.
- Prohibition N4 (the count is measured, not asserted from prose): pass. The spec re-derives the count from spies and compares it to the committed artifact bytes; the artifact is the committed file, not a restatement in a doc.
- Edge E5 (encoding, held-out): deferred to T007 in wave 3 — no output exists yet; not judged against this wave. The committed artifact already has the shape that row requires (observed count plus raw samples, not prose).

### SC4 — A fact list that exceeds the cap is chunked rather than silently truncated, and the chunk count the panel sees is truthful.: pass
- ✅ A five-fact list over `CHUNK_TOKEN_CAP` is chunked into three chunks (asserted through `chunkFacts` itself, chunked-fact-list-job.spec.ts:84), nothing is truncated or dropped (`chunks.flat()` equals the input facts, :115), and the count the panel receives equals the chunks emitted (`chunkCount === chunks.length === registry counts`, :110-112) with `tokenCap: CHUNK_TOKEN_CAP` travelling alongside (:119). The cap is not raised (context-budget.ts:30 unchanged). Recorded isolated Verify for the owning task T004: 2 files / 12 tests passed, exit 0.
- Edge E6 (encoding, held-out): deferred to T007 in wave 3 — no output exists yet; not judged against this wave. The in-wave test at chunked-fact-list-job.spec.ts:102-125 already asserts the payload's chunk count equals the emitted chunk count.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none (first review cycle for this wave)
- warnings worth a human eye: the T006 orchestrator Verify record is an nx cache hit (an uncached coder Verify backs the same command, exit 0); Nx flagged the T004 target as flaky in its output tail while reporting 12/12 passed. Held-out edges E3, E4, E5, E6 remain open for T007 in wave 3.
