# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 54c23abd2a732c5f9ffc9298882d44a771cb8234

## T002 — Answer from the two error records, purely: pass

- ✅ The landing is the join and its suite and nothing else: `git show --stat 03718448` reads
  `.project/tasks/T002-answer-from-the-two-error-records-purely.md | 14 +-`,
  `extension/error-routing.js | 357 +++`, `scripts/error-routing.test.mjs | 1047 +++`,
  `3 files changed, 1415 insertions(+), 3 deletions(-)`. The suite is green at the reviewed head:
  `node --test scripts/error-routing.test.mjs` prints `ℹ tests 16 / ℹ pass 16 / ℹ fail 0`
  (run by this review), and the module loads and answers in a bare `node:vm` context
  (`scripts/error-routing.test.mjs:36-46`, `createContext(sandbox)` with an empty sandbox).
- ✅ The join reads nothing but the one record it is handed, and the suite proves it rather than
  asserting it: the purity describe runs the module with every host global a trap that throws on
  get/set/has/apply/construct (`scripts/error-routing.test.mjs:62-110`, `tripwire`/`armedContext`/
  `guarded`), first proves the traps bite (`:709-718`, `Date.now()` and `document.title` throw
  `/reached for …/`), then holds the guarded answer equal to the bare-context answer (`:720-724`),
  and token-scans the comment-stripped source for `document`, `window`, `console`, clock reads, DOM
  queries, network calls and the two live-page reads `getOwningComponent`/`ng.getContext`
  (`:725-740`) — green in this review's run.
- ✅ The owner can only ever come from the arrival the finding is about. The single write of
  `owner` in the module is `const owner = textOf(fieldOf(uncaught, 'component'));`
  (`extension/error-routing.js:279`, on the uncaught arrival the scan selected at `:274`), consumed
  once per answer through `answerOf` (`:148-168`); nothing reads a neighbouring arrival's
  `component` (the reached answer reads `firstTexted`'s own field, `:320`, and the cannot-tell
  comparison answer `:336`), and the field is guarded by `fieldOf` (`:68-75`) so a throwing getter
  reads as absent rather than borrowed. The suite holds both halves: two arrivals where only the
  first is uncaught answer `owner: 'AlphaComponent'`, never the last arrival's `ZetaComponent`
  (`scripts/error-routing.test.mjs:208-215`, `:383-394`), and an arrival naming no component answers
  `null` (`:395-401`).
- ✅ The boundary comparison is by text and only by text, and an incomparable record is
  `cannot-tell`, never a decision: `carriedByBoundaries`
  (`extension/error-routing.js:109-117`) returns `true` on the first entry whose text equals the
  arrival's, `false` when no entry carries it, and the join routes every `null`-comparison arrival to
  the `incomparable` branch (`:264-275`, `:330-342` — "a recorded arrival cannot be compared against
  the boundary entries, so an uncaught error cannot be ruled out"), while a missing
  `errors`/`boundaries`/`handler` key is missing-input `cannot-tell` before any comparison
  (`:184-187`, `:231-244`), held by `pinCannotTell` over six inputs
  (`scripts/error-routing.test.mjs:641-678`, green).
- ✅ The seven mutants are real, not decorative. Each `M1`–`M7` block (`:811-1047`) applies an
  in-memory source mutation through `mutate` — which asserts the anchor exists in the shipped source
  (`:112-123`) — shows the mutant produce the intended wrong observable, and requires the pin that
  names the defect to redden: M1 boundary comparison dropped → answers `cannot-tell`, caught by
  `pinUncaughtWithHandler` (`:826-837`); M2 every global error treated as uncaught → caught by
  `pinReachedHandler` (`:856-870`); M3 invented handler name → caught by `pinNoHandlerProvided`
  (`:889-903`); M4 phase mined from the message → caught by `pinPhaseIsTheRecordsOrTheAbsence`
  (`:922-936`); M5 answer key dropped → caught by `pinEveryFieldInEveryState` (`:955-969`); M6 the
  two absences folded → caught by `pinNoBoundaryEntry` (`:999-1010`); M7 owner borrowed from the
  last arrival → caught by the uncaught pin (`:1029-1043`). All seven green in this review's run,
  each failure naming its defect string.
- ✅ SC5's live-page mutant is shown to change the answer before the pin reddens: the mutation swaps
  the owner read for `globalThis.__M060_LIVE_OWNER__` (`:746-750`), answers `null` in a bare context
  (`:751-756`), borrows `LivePageComponent` when the value is handed to it (`:757-764`), and reddens
  `pinUncaughtWithHandler` by name (`:765-774`) — green in this review's run.
- ✅ The eight-field contract is a pin on every answer, not a promise: `pinEveryFieldInEveryState`
  (`scripts/error-routing.test.mjs:242-296`) asserts `Object.keys(answer)` deep-equals the eight
  sorted keys, the state is one of the four words, the detail is a non-empty string and
  `absences`/`claims` are lists, over eight frames spanning all four states plus the degenerate
  inputs — green, and the module's `answerOf` (`extension/error-routing.js:146-168`) is the one place
  an answer is built, so the pin covers every state by construction.
- ⚠ Two stated boundaries, not defects. (a) The join never decides *which* arrival a carried text
  belonged to — two identical messages are indistinguishable in the record, stated in the module's
  own header (`extension/error-routing.js:26-29`) and held by the two-arrivals frame
  (`scripts/error-routing.test.mjs:203-215`); that is the answer being about the text, as the state
  names it, not a gap. (b) `handlerNameOf` echoes the handler record's own `name` into the finding's
  detail (`extension/error-routing.js:100-102`, `:282-298`) — the identity the record carried, never
  a guessed one, and M3 reddens the invention of one (`scripts/error-routing.test.mjs:889-903`).
- Files the wave touched, read or not read: `extension/error-routing.js` — read (whole file, 357
  lines), 100%; `scripts/error-routing.test.mjs` — read (`:1-789` and the mutant describe headers,
  plus the full run output), the pins cited read; `.project/tasks/T002-…md` — read via
  `git show --stat` only; `extension/agent-main.js:2550-2561`, `:1904-1944` — read in wave 1, cited
  here as the record T002's fixtures carry (`scripts/error-routing.test.mjs:142-150`).

## Intent coverage

### SC1 — An error the global listener recorded, with a resolved `ErrorHandler` in force and no boundary entry carrying the same text, produces a finding naming the message, the code where the message carries one, and `handler-in-force`; a mutant that drops the boundary comparison reports `cannot-tell` and reddens the suite by name.: pass

- ✅ Covered by T002: the run's own line `SC1 — an uncaught text beside a handler in force is
  uncaught-with-handler` is green. `pinUncaughtWithHandler`
  (`scripts/error-routing.test.mjs:303-403`) holds, on the shipped module: state
  `uncaught-with-handler`, `message === UNCAUGHT_TEXT`, `code === 'NG0910'` matched out of the
  message's own text (`extension/error-routing.js:54`, `:92-96` — a message with no NG0NNN answers
  `null`, `:374-380`), and the detail naming the handler in force with the handler record's own name
  (`extension/error-routing.js:291-298`, pinned `/in force/` and `/ProxyErrorHandler/` at
  `scripts/error-routing.test.mjs:322-332`).
- ✅ The named mutant reddens: M1 drops the boundary comparison, the mutant answers `cannot-tell`,
  and `pinUncaughtWithHandler` reddens with the failure naming the defect
  (`scripts/error-routing.test.mjs:815-837`) — the run's line `M1 — boundary comparison dropped
  reports cannot-tell and reddens the uncaught pin` is green.
- ✅ E2's ordering edge is held from the join's side: with two arrivals where the first is uncaught
  and the second carried, the finding is the first and its owner is the first arrival's own
  component (`scripts/error-routing.test.mjs:208-215`, `:383-394`); the record says which arrival it
  matched by naming the text, and the module states in its header why nothing finer is decidable
  (`extension/error-routing.js:26-29`).

### SC2 — An error a boundary entry carries produces `reached-handler` and no finding; a mutant that treats every global error as uncaught reddens it.: pass

- ✅ Covered by T002: `pinReachedHandler` (`scripts/error-routing.test.mjs:409-447`) holds state
  `reached-handler` with the detail matching `/no finding/` and the boundary entry cited among the
  claims by its own `artefactPath` — green in the run (`SC2 — a text a boundary entry carries is
  reached-handler, with no finding`), and the join's reached branch names no finding and returns the
  entry-carried message (`extension/error-routing.js:314-328`).
- ✅ The all-uncaught mutant reddens: M2 forces the carried text down the uncaught path, the reached
  pin reddens naming the defect (`scripts/error-routing.test.mjs:840-870`), green in the run.

### SC3 — An error recorded while no `ErrorHandler` resolves reports `no-handler-provided` as a named absence, never a finding and never a handler name; a mutant that names any handler reddens it.: pass

- ✅ Covered by T002: `pinNoHandlerProvided` (`scripts/error-routing.test.mjs:454-519`) drives the
  shipped join with handler `null`, `false`, `0` and `''` and, for each: state
  `no-handler-provided`, the detail matching `/no ErrorHandler resolved/`
  (`extension/error-routing.js:300-311`), no handler name invented (`doesNotMatch
  /"[A-Za-z]*ErrorHandler"/`, `:485-492`) and no `/in force/` anywhere in the answer (`:493-500`) —
  green in the run (`SC3 — no handler resolved is no-handler-provided, and never a handler name`).
- ✅ The invented-handler mutant reddens: M3 names a handler the records never carried and the
  no-handler pin reddens by name (`scripts/error-routing.test.mjs:874-903`), green in the run.

### SC4 — The answer states a phase only where the record states one and reports `phase-not-recorded` otherwise; a mutant that derives a phase from the message reddens it.: pass

- ✅ Covered by T002: `pinPhaseIsTheRecordsOrTheAbsence`
  (`scripts/error-routing.test.mjs:525-588`) holds: the phase is `phase-not-recorded` when no record
  carries a phase, a phase an arrival's own `phase` field carries is echoed
  (`extension/error-routing.js:122-130` — the only read of a phase in the module), a phase a boundary
  entry carries is echoed too, and the message text (which carries `NG0910` and no phase word)
  never becomes a phase (`doesNotMatch /change|construction/`) — green in the run.
- ✅ The message-phase mutant reddens: M4 mines the message text for a phase word and the phase pin
  reddens naming the defect (`scripts/error-routing.test.mjs:906-936`), green in the run. This is
  T001's measured absence (count 2, no record in the tree names a phase) turned into the join's
  ordinary answer.

### SC5 — The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener.: pass

- ✅ Covered by T002: the join is a pure function of `{ errors, boundaries, handler }` — the three
  records T001 measured — and nothing else. Bare-context load with only `angularAiErrorRouting`
  published (`scripts/error-routing.test.mjs:682-703`), every host global a proven-live trap while
  the join runs (`:705-724`), the token scan holding nine forbidden reach patterns out of the
  comment-stripped source including the live-page reads `getOwningComponent` and `ng.getContext`
  (`:725-740`), and a second read of the same record answering identically (`:777-781`) — all green
  in this review's run. The module takes no second tap: `git show 03718448 --stat` adds
  `extension/error-routing.js` and nothing beside it, and the file installs no listener and opens no
  page (its own header, `extension/error-routing.js:4-6`).
- ✅ The live-page owner mutant reddens: the `__M060_LIVE_OWNER__` mutation borrows a value from the
  world when one exists and the purity pin reddens by name
  (`scripts/error-routing.test.mjs:742-774`), proving the guard would catch an instrumentation
  shortcut, not merely that the shipped text lacks one.
