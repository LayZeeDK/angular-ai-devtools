# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e117c1d28595cca15716daebaca12acc932d3983
Wave task: T002 (landed `92f92fd`)

Wave 2 is one guard in one function: the epoch map's key is tested before the map is read, so an
identity that cannot be a `WeakMap` key gets no entry instead of throwing out of the frame's
microtask. It carries SC6 and only SC6, and it cannot close SC6 alone — the criterion is the absence
of the extension's error *and* the gate at the head, and the gate closes at wave 6.

## T002 — Stop the page agent throwing into the app's error handler: pass

- ✅ The landing is a guard, not a rewrite: `git show --stat 92f92fd2` reports
  `extension/agent-main.js` 24 lines changed, `extension/agent-main.test.mjs` +415,
  `scripts/navigation-capture.test.mjs` +65 and the task file +8/−1 — no new module, no deleted
  line of the record.
- ✅ The guard sits above the write and nowhere else: `extension/agent-main.js:1018-1020` states the
  property ("the key is tested, not its write wrapped"), `:1021` is `function diffEpochs(instance,
  graph)`, `:1022-1024` computes `keyed` as an object or a function, `:1025` guards the read
  (`var prev = keyed ? prevEpochs.get(instance) : null;`), `:1033` is `if (!keyed) return changed;`
  and the write is still `:1034` (`prevEpochs.set(instance, next);`).
- ✅ `records 0 → 1`, measured both sides of the repair, is quoted at
  `.project/tasks/T002-stop-the-page-agent-throwing.md:82`: before, `TypeError: Invalid value used
  as weak map key` and `records: 0`; after, no throw and `records: 1` with `checks: 3`. At this head
  the same reading is recorded in the recording's repair section —
  `research/raw/m042-error-boundary.json:74-124`, property at `:79`, and each non-keyed identity
  (`undefined`, `null`, `number`, `string`) landing `records: 2` with `firstPass []` and
  `secondPass []` (`:82-112`).
- ✅ The epochs still name their moves, so the absence was not bought by silencing the record: the
  keyed identity's `secondPass` is `["n0"]` and its `thirdPass` is `[]`
  (`research/raw/m042-error-boundary.json:113-123`), the base measurement is unchanged
  (`movedOne ["n0"]` `:529-531`, `movedBoth ["n0","n1"]` `:534-537`, `held []` `:532`), and the
  drive asserts it in `scripts/error-boundary-measure.test.mjs:3038-3039` after asserting that no
  emission threw (`:2997-3002`).
- ✅ The anchors this milestone shares with earlier recordings did not move, checked at this head:
  `extension/agent-main.js:42` (`var prevEpochs = new WeakMap();`), `:1034`
  (`prevEpochs.set(instance, next);`), `:1038` (`function closeCycle() {`), `:1750`
  (`function routerTokenFrom(element, getInjector, getPath, getProviders) {`) and `:1889`
  (`prevEpochs = new WeakMap();`) — and `research/raw/m041-navigation.json:693` still cites
  `extension/agent-main.js:1750-1839`. The edit was line-neutral above `:1889` on purpose
  (`.project/tasks/T002-stop-the-page-agent-throwing.md:82`).
- ✅ The held-out pins are driven, not restated: `extension/agent-main.test.mjs:3819` is the T002
  describe, `:3833` is `held-out E12` (a load and a reload close their frames with no agent-thrown
  error and every changed epoch still named), `:3870` is `held-out E13` (two loads in one session,
  no epoch change crossing a load or an instance), and `:3938` is AC5's guard-is-not-a-silencing pin.
  Observed at this head: `node --experimental-strip-types --test "extension/agent-main.test.mjs"`
  → `ℹ tests 107`, `ℹ suites 23`, `ℹ pass 107`, `ℹ fail 0`.
- ✅ The wave's Verify is recorded passing at its own landing:
  `.project/build/verify-ledger.jsonl:5` — the eight declared suites, `nx run
  angular-ai-devtools:test`, prettier and `npm run check` — `"result": "pass"` at
  `92f92fd25bd1d7f6f074eee8c8648d42f8ff5831`.

## Intent coverage

### SC6 — On every inspected page the extension throws no error of its own: `TypeError: Invalid value used as weak map key` no longer appears from `extension/agent-main.js:1034` (`prevEpochs.set(instance, next)`), the app's `ErrorHandler` receives no entry carrying it, `window.onerror` receives none, no finding attributes an extension-thrown error to the app, and the epoch-change record that line belongs to still names the changed epochs it named before the repair.: pass

- ✅ "No longer appears from `extension/agent-main.js:1034`" is closed at the suite level: for a
  non-object identity the agent records no epoch entry and writes none
  (`extension/agent-main.js:1033` before `:1034`), the frame still lands and no emission throws
  (`scripts/error-boundary-measure.test.mjs:2994-3039`; observed `ℹ tests 32`, `ℹ pass 32`,
  `ℹ fail 0`), and the driven frame carries a `null`, an `undefined` and a component instance with
  `records 1` / `checks 3` (`.project/tasks/T002-stop-the-page-agent-throwing.md:82`).
- ✅ "Still names the changed epochs it named before the repair" is closed in the same place and
  cannot be traded against the first half: the same suite asserts both
  (`scripts/error-boundary-measure.test.mjs:2994` for the skip, `:3042-3053` for
  `movedOne`/`movedBoth`/`held`), E12 asserts it across a reload
  (`extension/agent-main.test.mjs:3833`) and E13 across two loads in one session (`:3870`).
- ✅ The repair is a guard and not a silencing: the map is still written for every object identity
  (`extension/agent-main.js:1034`), cleared only by the reset path (`:1889`), the profiler is still
  installed once and `ɵsetProfiler(null)` is never called (AC5 pin,
  `extension/agent-main.test.mjs:3938`), and the three mutants that would undo the fix redden by
  name: `extension/agent-main.test.mjs:3997` (M1, the lost frame), `:4009` (M2, the emptied
  moved-epoch case) and `:4021` (M3, the restored throw), quoted at
  `.project/tasks/T002-stop-the-page-agent-throwing.md:82`.
- ⚠ **Not closed alone.** Two clauses are not this wave's: "the app's `ErrorHandler` receives no
  entry carrying it / `window.onerror` receives none" is a page observation this wave reaches only
  through the driven load (E12/E13's own frames, `extension/agent-main.test.mjs:3833-3885`), and the
  page-side reading is the milestone's gate at **wave 6** — `research/raw/m042-verdict-claims.json:69-77`
  rules SC6 against the recording and the gate, and `.project/build/verify-ledger.jsonl:9` records
  the `npm run check && npm test` reading at `e117c1d`. Wave 1 measured the defect; this wave removed
  it; wave 6 records the gate that shows it stays removed.
