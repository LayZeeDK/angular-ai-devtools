# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 54c23abd2a732c5f9ffc9298882d44a771cb8234

## T001 — Measure the two error records and the join's shape: pass

- ✅ The landing is the measurement and its suite and nothing else: `git show --stat 6291da45` reads
  `.project/tasks/T001-measure-the-two-error-records-and-the-joins-shape.md | 14 +-`,
  `research/raw/m060-record-shapes.json | 60 +++`, `scripts/error-routing-shapes.test.mjs | 391 +++`,
  `3 files changed, 462 insertions(+), 3 deletions(-)`. The suite is green at its capture commit
  (verify ledger entry `9f8e3143`, result pass) and every content assertion is green at the reviewed
  HEAD: re-running `node --test scripts/error-routing-shapes.test.mjs` here prints
  `ℹ tests 9 / ℹ pass 7 / ℹ fail 2` where both failures are the record's own head pin
  (`the record was captured at a head that is not the current HEAD`, pinned `32b384b0` = the commit
  the T005 verify ran at) — the fresh serialization differs from the committed record in the two head
  fields alone, byte for byte identical everywhere else, so no measured fact moved (see the ⚠ below).
- ✅ The two record sections measure the source, not the task's prose, and this review re-opened both
  sites. The listener record's claim — two `addEventListener` calls on `globalThis` reducing each
  arrival through `captureErrorPayload` — is exactly what `extension/agent-main.js:2550-2561` carries
  (`globalThis.addEventListener('error', …)` at `:2550`, `globalThis.addEventListener('unhandledrejection', …)`
  at `:2557`, each body a guarded `captureErrorPayload(…)` call and nothing else). The boundary
  record's claim — `onViewError` hooked on the handler the page already resolved, arrivals in
  `boundaryEntries` capped at 128, two `details` shapes whose absent fields read as null — sits at
  `extension/agent-main.js:1904-1944`, with `var BOUNDARY_ENTRY_LIMIT = 128; // arrivals kept: a
  page-health guard, not a curation` at `:1939` and the absent-field rule stated at `:1913-1915`.
- ✅ The producer is derived, never typed, and the suite proves it: `readListeners(source)`
  (`scripts/error-routing-shapes.test.mjs:60-69`) regex-scans `extension/agent-main.js` for the two
  listener registrations and `readBoundaryEntryLimit` (`:72-79`) reads `BOUNDARY_ENTRY_LIMIT` out of
  the source, and the test `the producer names exactly the listeners and the limit the source states`
  (`:261-274`) holds the record's `producer.listeners = ["error","unhandledrejection"]` and
  `boundaryEntryLimit = 128` against a fresh read of the file — green in this review's run.
- ✅ SC5's no-new-listener edge (E6) is held by a count, not a sentence: the record states
  `this milestone added no listeners (listeners added: 0)` in the listener section's own text, and
  the test `the absence counts the listeners read, and states none were added`
  (`scripts/error-routing-shapes.test.mjs:276-300`) asserts the absence count equals the listener
  count read from the source, equals 2, and that `JSON.stringify(record)` matches `/listeners added: 0/`
  — "a mutant recording added listeners must redden here", green in this review's run.
- ✅ The census map is closed over its own exclusions: `OWN_FILES`
  (`scripts/error-routing-shapes.test.mjs:44-49`) is exactly the milestone's four artefacts, the test
  `the suite's scans exclude this milestone's own files` (`:351-370`) pins that list and asserts each
  own file is absent from its corpus scan, and `the census map lists the measured artefact and names
  the records outside it, each why citing a task` (`:318-349`) requires every `inventory.outsideTheMap`
  `why` to cite a `T00\d` id — green, and the landed record names exactly the two records M060 owes
  (`research/raw/m060-surface.json` → T003, `research/raw/m060-verdict-claims.json` → T004) after
  T004's repair of the map (commit `93864ce4`).
- ✅ The record is a fixed point, and the suite refuses a record whose stated size is a lie: the
  capture iterates the stated byte total to a fixed point
  (`scripts/error-routing-shapes.test.mjs:163-178`, `serializeRecord`) and
  `the verdict states this file's own byte total, and the file is that long` (`:302-316`) holds the
  verdict's `4170 bytes` against `Buffer.byteLength` of the file on disk — green in this review's run.
- ⚠ One declared limit, not a defect: the record pins `head` by equality with `git rev-parse HEAD`
  (`scripts/error-routing-shapes.test.mjs:222-238`), so the two head-pin assertions redden at any
  commit after the capture commit. The capture was re-derived at `32b384b0` (the commit the T005
  project verify ran at) and the landing commit `54c23abd` necessarily moved HEAD past it; the
  assertion diff in this review's run shows the sole delta is the `head` and `commands[].output`
  values (same length, so the stated 4170-byte verdict still matches), with the measurement sections
  byte-identical. The ledger's pass is valid at the verify commit; a future recapture at the shipped
  head would turn the suite green again without touching a measured fact.
- Files the wave touched, read or not read: `scripts/error-routing-shapes.test.mjs` — read (whole
  file, 394 lines), 100%; `research/raw/m060-record-shapes.json` — read via the T001 diff
  (`git show 6291da45`) and via this review's run's assertion dump (whole file), 100%;
  `extension/agent-main.js` — read at `:1900-1959` and `:2540-2567` (both cited sites);
  `.project/build/verify-ledger.jsonl` — read (whole file); `.project/build/verify-T001.log` — not
  read whole; `.project/tasks/T001-…md` — read via `git show --stat` only.

## Intent coverage

### SC1 — An error the global listener recorded, with a resolved `ErrorHandler` in force and no boundary entry carrying the same text, produces a finding naming the message, the code where the message carries one, and `handler-in-force`; a mutant that drops the boundary comparison reports `cannot-tell` and reddens the suite by name.: pass

- ✅ Covered by T001 for the half this task owes: the finding's three named inputs are measured at
  their source — the arrival payload the global listener reduces each error to
  (`extension/agent-main.js:2550-2561`, the `{code, message, component, timestamp}` shape the
  record's first section states), the boundary entries the comparison is made against
  (`extension/agent-main.js:1904-1944`, one entry per handler arrival in arrival order) and the
  resolved-handler hook whose presence is the "in force" half (`:1904-1944`, hooked on the handler
  instance the page already resolved). The record's second section states the two `details` shapes
  and the null rule, so the join T002 builds can compare by text without guessing a field neither
  shape carries.
- ✅ The finding's own behaviour (the state word, the code match, the boundary comparison mutant) is
  T002's deliverable and is judged in wave 2; nothing in this wave's landing contradicts it — the
  suite's OWN_FILES excludes the T002 artefacts precisely so the census cannot read them back into
  this record (`scripts/error-routing-shapes.test.mjs:44-49`, `:351-370`).

### SC5 — The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener.: pass

- ✅ Covered by T001: the record measures the two observables where they already exist — the global
  listener pair at `extension/agent-main.js:2550-2561` (one `error`, one `unhandledrejection`, wired
  beside the `console.error` override, read and confirmed by this review) and M042's boundary record
  at `extension/agent-main.js:1904-1944` — and no third capture is proposed anywhere in the landing:
  `git show --stat 6291da45` touches only the task file, the record and its suite, nothing under
  `extension/` and no capture driver.
- ✅ "No second global listener" is pinned by count in the suite: `readListeners`
  (`scripts/error-routing-shapes.test.mjs:60-69`) answers exactly the two names the source
  registers, the absence count is asserted to be that count and 2
  (`:276-300`), and the record states `listeners added: 0` in prose the suite matches for — so a
  landing that added a listener would flip both the producer list and the absence count and redden
  the suite by name. The diff adds no `addEventListener` anywhere: the only file under `extension/`
  named in the landing is `extension/agent-main.js` as a *read* source (`records[].path`), and
  `git show 6291da45 --stat` shows no extension file changed at all.
