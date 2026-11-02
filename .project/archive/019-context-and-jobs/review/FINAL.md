# Final Review — M019 context-and-jobs

<!-- Authorship and evidence reuse follow the ship phase contract. Each INTENT.md success
     criterion appears exactly once and carries checked evidence. INTENT.md declares
     `Surfaces: none` and PLAN.md carries no `## Surface contract`, so no criterion names
     a Surface and every Check is recorded command output or a precise file reference.
     When .project/build/members.json locks members, add one line per locked member after
     Reviewed HEAD: `Member reviewed HEAD: <member> <full SHA>` — no members.json exists
     in .project/build at this head, so no member lines are recorded. -->

Reviewed HEAD: 5982ad03a4959feaca5fa1bc12d03c88782ecb46
Overall verdict: pass

<!-- pass only when every criterion is met; blocked when any criterion is
     not-met or unverifiable.
     A criterion with a held-out edge (E#) or judgment prohibition (N#) in
     INTENT.md is met only when Check, Observed, or Reference cites every such
     id with its evidence; otherwise it is unverifiable with
     `Finding: insufficient spec evidence: <id> ...`. -->

## Success criteria

### SC1 — A 200-message ring buffer survives a navigation, and its oldest entry is still readable after it.

- **Verdict**: met
- **Check**: `none`
- **Observed**: Held-out edge E1 recorded green in the T007 verify (ledger record at `e3a5ebc`, exit 0, 5 test files / 43 tests, message-ring-buffer 14 of them; `.project/review/wave-3.cycle1.md` §T007): `message-ring-buffer.spec.ts:200-240` fills the buffer to exactly the 200 cap, navigates, and reads the oldest surviving entry back by position, asserted identical to the entry written first, with an overflowing variant proving the comparison separates rather than equates. Held-out edge E2 recorded green in the same run: `message-ring-buffer.spec.ts:244-276` shows a never-filled buffer and a single-entry buffer both answering without inventing a missing neighbour (`previous: null` / `next: null` on the sides they do not hold). Judgment prohibition N3 observed: the buffer is keyed by page (`pageKeyFor` over tab + navigation), `factAt` answers null for any entry whose `pageKey` differs from the live `currentPageKey` (`message-ring-buffer.ts:156-163`) and `currentPageEntries` filters on the live key (`message-ring-buffer.ts:100-103`), so no stale page identity answers for the live panel after navigation (`message-ring-buffer.spec.ts:116-151,223-226`).
- **Reference**: apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts:200-240; .project/review/wave-3.cycle1.md
- **Finding**: none
- **Fix direction**: none

### SC2 — A chunked job reports progress and cancels, and a cancelled job leaves no partial fact list behind.

- **Verdict**: met
- **Check**: `none`
- **Observed**: Held-out edge E3 recorded green in the T007 verify (exit 0, 43 tests including job-handles 7 and chunked-fact-list-job 8; `.project/review/wave-3.cycle1.md` §T007): `jobs/job-handles.spec.ts:156-205` runs the real `ChunkedFactListJob` mid-flight through the registry, cancels the same job twice, counts exactly one abort event, and asserts the panel's captured store signal reads `cancelled: true` with the payload `{ status: 'cancelled', chunksDone: 1, chunksTotal: 3 }` carrying no `chunks` key, so no partial fact list is kept. Held-out edge E4 recorded green in the same run: `jobs/chunked-fact-list-job.spec.ts:225-258` lands the cancel strictly between two chunks (progress between 0 and the 3-chunk plan), the cancelled payload carries no fact text anywhere in its JSON, and a later macrotask shows no further chunk emitted. Judgment prohibition N1 observed: the job checks its abort signal at the top of every iteration and stops executing (`chunked-fact-list-job.ts:165-176`), the registry's cancelled flag survives any late `report()` (`job-handles.ts:103-108`, `job-handles.spec.ts:100-104`), and a pre-start cancel stops the job at its first boundary (`jobs/job-handles.spec.ts:120-128`) — the work actually stops rather than resolving into a discarded buffer. Final gap verdict final-gap-3 collected at this HEAD: the registry interface is consumed by the Summarize job; one AbortController per job, double cancel is one cancellation, no bypass.
- **Reference**: apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts:156-205; apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts:225-258; .project/review/wave-3.cycle1.md
- **Finding**: none
- **Fix direction**: none

### SC3 — One fresh clone per prompt is measured, with the measurement committed.

- **Verdict**: met
- **Check**: `none`
- **Observed**: Held-out edge E5 recorded green in the T007 verify (exit 0, 43 tests including clone-measurement 2; `.project/review/wave-3.cycle1.md` §T007): `jobs/clone-measurement.spec.ts:191-242` re-measures one prompt assembly through the real `ExtensionPromptService` with counting spies, then parses the committed bytes of `research/raw/clone-measurement-m019.json` (inlined via `import.meta.glob` `?raw`) and asserts `"observed": 1` as a JSON number with samples equal to the spies and method/command/measuredAt/base recorded — a committed artifact with the observed count, not a number restated in prose. Judgment prohibition N4 observed: the count is read out of the committed bytes and re-runs to itself, so it is reproducible; the spies include a `clone` method the panel session interface does not declare, so an invented `clone()` count would be caught. Applied the INTENT.md `## Corrections` "SC3 clone target" ruling: one fresh clone per prompt means one fresh language-model session per prompt, recorded with raw primitive counts — the artifact records `observed: 1` fresh sessions per prompt with samples `lm.create` 1, `session.prompt` 1, `session.destroy` 1, `structuredClone` 0, `session.clone` 0, exactly the ruling's counts, and no `LanguageModelSession.clone()` count was invented. Final gap verdict final-gap-4 collected at this HEAD: the committed clone measurement is read by wave 3's E5 test; committed bytes, `observed`, and the re-measured count agree.
- **Reference**: apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts:191-242; research/raw/clone-measurement-m019.json; .project/intent/INTENT.md (## Corrections, SC3 clone target)
- **Finding**: none
- **Fix direction**: none

### SC4 — A fact list that exceeds the cap is chunked rather than silently truncated, and the chunk count the panel sees is truthful.

- **Verdict**: met
- **Check**: `none`
- **Observed**: Held-out edge E6 recorded green in the T007 verify (exit 0, 43 tests including chunked-fact-list-job 8; `.project/review/wave-3.cycle1.md` §T007): `jobs/chunked-fact-list-job.spec.ts:262-296` runs two over-cap list sizes through the real job; for each, the payload's chunkCount equals `chunks.length`, the plan's count, and the registry's `chunksTotal`/`chunksDone`; every fact returns whole and in order (`chunks.flat()` equals the input, so nothing was truncated or dropped); and the second count is greater than the first, so the equality is checked against two different plans. Judgment prohibition N2 observed: no cap was raised — the payload carries `tokenCap` asserted equal to the untouched `CHUNK_TOKEN_CAP` with per-chunk token estimates each within the cap (`chunked-fact-list-job.spec.ts:119-124,289`), the cap is a frozen named constant (`context-budget.ts:30`, pinned unchanged after an oversized-single-fact refusal at `context-budget.spec.ts:151-157`), and the waves' diffs touch no cap constant. Final gap verdict final-gap-2 collected at this HEAD: wave 1's cap and `chunkFacts` are consumed by the wave 2 chunked job; the count equals the chunks emitted and no cap is redefined.
- **Reference**: apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts:262-296; .project/review/wave-3.cycle1.md
- **Finding**: none
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget.

- **Verdict**: met
- **Check**: `git diff --stat e0a76d798f24cd641be8c9560110703f0d92d9a6..5982ad03a4959feaca5fa1bc12d03c88782ecb46 -- apps scripts package.json extension`
- **Observed**: The orchestrator's recorded project verify at this HEAD — `npm ci --include=dev && npm run check && npm test && npx nx run angular-ai-devtools:build-extension` — exits 0, covering SC5's `npm run check` and `npm test` and the bundle build; the measured initial total is 535.44 kB, unchanged from the 535.44 kB pre-milestone baseline and inside the policy held by `scripts/panel-bundle-budget.test.mjs` (520 KB warning, 1 MB error, baseline pinned and proven to fail one byte above it). `.project/build/verify-ledger.jsonl` records the same chain (build-extension, bundle pin 4/4, `npm run check` clean, `npm test` green including the two audit gates) with exit 0 at `e0a76d7`; the Check command above returns empty, so the product tree (`apps`, `scripts`, `package.json`, `extension`) is byte-identical between that recorded verify commit and the reviewed HEAD and the recorded result applies to it unchanged. Judgment prohibition N5 observed: the measured 535.44 kB total is the pre-milestone overage INTENT constrains as "must not make it worse" — the pin holds the policy verbatim (`maximumWarning: '520kb'`, `maximumError: '1mb'`, exact-match asserted) and holds the measured total to the 535.44 kB baseline, and no check was weakened to reach green: the wave's audit repair changed `DOCS-AUDIT.md`, not the audit tests, and the bundle pin strengthens rather than loosens the gates (`scripts/panel-bundle-budget.test.mjs:55,65,210-220,226-260,266-289,344-378`; `.project/review/wave-3.cycle1.md` §T008).
- **Reference**: .project/build/verify-ledger.jsonl; scripts/panel-bundle-budget.test.mjs; .project/review/wave-3.cycle1.md
- **Finding**: none
- **Fix direction**: none
