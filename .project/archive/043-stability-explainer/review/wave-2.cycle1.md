# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 46abef82eef789433557af1868bc7abdf6778870
Wave task: T002 (landed `e4421832`)

Wave 2 is the milestone's whole claim in one pure function: the record T001 published, read as the
state, the settle reading, the repeated work and the absences no page can fill. It carries SC1, SC2,
SC3, SC4 and SC6, and it cannot close SC2 or SC6 alone: SC2's transition half has no page behind it,
and SC6's two-subject half is a capture-suite reading.

## T002 — Join a stability record into the state, the settle reading and the repeated work: pass

- ✅ One module, one suite, no product path beside them: `git show --stat e4421832` reports
  `extension/stability-narrator.js` +534, `extension/stability-narrator.test.mjs` +1,732 and the task
  file +14/−3 — nothing under `apps/`, `extension/agent-main.js` or `scripts/`.
- ✅ The module is one function over the record it is handed: `extension/stability-narrator.js:300-314`
  (`function stability(record)`) reads `sectionOf(record)` (`:158-161`), `readingOf` (`:166-175`),
  `stateOf` (`:180-188`), `settleOf` (`:194-207`), `repeatsOf(record)` (`:237-271`) and
  `absencesOf` (`:288-295`), and no other field — the answer is the eight keys at `:304-313`.
- ✅ The state is the emission and nothing else: `extension/stability-narrator.js:180-188` returns
  `cannot-tell` from the record's own absence word first (`:182-183`), `idle` where no emission was
  published (`:184`), `stable` only where `reading.value === true` (`:185`) and `unstable` only where
  it is `false` (`:186`). The verdict is never read from the frame's presence, its silence or an
  empty list; `readingOf` at `:166-175` copies the page's own `{ value, at }` and mints neither.
- ✅ The settle reading is the difference of two published readings, and a measured `0` survives as a
  number: `extension/stability-narrator.js:194-207` returns `{ state: "no-settle-observed" }` with no
  `at` and no `sinceAttachMs` for every absence (`:195-200`) and otherwise
  `sinceAttachMs: settle.at - attachAt` (`:201-206`). Nothing in the frame's `startedAt`, its last
  event or its quiet tail is read for an interval — `settleOf` takes `section` and no record.
- ✅ The repeated work is one pass per recorded start/end pair, in recorded order, from the frame's
  `events` list only: `extension/stability-narrator.js:226-229` (`eventsOf`) yields the frame's own
  list or an empty one, `:212-222` (`readEvent`) reads only `pair`, `end` and `componentName`, and
  `:237-271` opens a stack per pair, closes the innermost open start of its own pair (`:254-256`) and
  attributes the pass to the start's component or the end's (`:257-260`) — so a `ChangeDetection`
  pair whose entries all carry `componentName: null` is attributed to no component. No per-view cycle
  count and no outstanding-work count exists anywhere in the module.
- ✅ The four absences are four values with four sentences, never a count: constants at
  `extension/stability-narrator.js:74-77`, order at `:81-86`, the three permanent ones at `:91-95`,
  and one sentence each at `:115-123` (`no-stability-observable` `:116-117`, `no-cause-reported`
  `:118-119`, `no-outstanding-inventory` `:120-121`, `no-settle-order` `:122-123`). `absencesOf`
  admits the record's own absence once and the three permanents beside it (`:288-295`), and the pane
  puts each in its own cell (`:477-495`).
- ✅ The reader is pure, and the suite proves it from inside a context where every host global is a
  trap: `extension/stability-narrator.test.mjs:1240` is the `purity` describe, `:1084` the
  `measurement` describe, and the module has no import, no clock, no DOM read and no second tap in its
  source (`extension/stability-narrator.js:41-46` states the property; `:508-533` publishes one
  namespace and nothing else).
- ✅ The eight held-out pins are the suite's own describes and each is driven, not restated:
  `E1` `extension/stability-narrator.test.mjs:1312`, `E2` `:1326`, `E3` `:1351`, `E5` `:1413`,
  `E6` `:1477`, `E7` `:1534`, `E8` `:1589`, `E10` `:1639`.
- ✅ Fifteen mutants, each applied to a copy of the module and each proven to redden its pin by name:
  the machinery is `extension/stability-narrator.test.mjs:325-380` (a mutation that changes no byte is
  a failure at `:332`; a pin that passes on the mutant fails at `:358`), and the fifteen are listed
  with the defect each names in `.project/tasks/T002-join-a-stability-record.md:84` (M1 the verdict
  decided by the frame, M3 the absence dropped from the list, M4 a settle time fabricated from the
  attach reading, M5 a settle at attach presented as a later transition, M6 every entry counted as a
  pass, M7 passes counted from `checks` rows, M8 a pass invented for a frame with none, M9 an unpaired
  end counted, M10 a cause filled from the component name, M11 one absence in another's cell, M12 an
  owner filled from the component name, M13 an opted-in stack carried as an absence, M14 instability
  inferred from a silent record, M15 the verdict read out of the frame's silence).
- ✅ The wave's Verify is recorded passing at its own landing: `.project/build/verify-ledger.jsonl:2`
  — `"result": "pass"` at `e4421832197e77e58c52746106db26ca3e999c74` — and the node leg is re-read at
  this head inside the four-suite command below (`ℹ tests 56`, `ℹ pass 56`, `ℹ fail 0`, `ℹ suites
  16`), `npm run check` → exit 0 with `verification gate (structure): pass`.

## Intent coverage

### SC1 — The stability state is reported for each inspected page from that page's own `ApplicationRef.isStable`, reached by the injector read the agent already performs for `Router` and from nothing else: on the counter fixture's `/resource-states`, whose never-settling `resource()` takes a pending task for the page's lifetime (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`; `_resource-chunk.mjs:404`), the finding reports the app unstable and names the emission it read; on a page whose `isStable` has emitted `true` it reports stable from that emission; and a page exposing no reachable `ApplicationRef`, or an `isStable` that cannot be subscribed, is cannot-tell with the named absence `no-stability-observable`, never stable and never a zero count.: pass

- ✅ "Reports the app unstable and names the emission it read" is closed: the answer carries
  `reading: { value, at }` copied from the record, `state: "unstable"` for `value: false`
  (`extension/stability-narrator.js:166-175`, `:180-188`, `:304-308`) and the pane prints the
  emission beside the state word (`:351-373`). The record it is driven against is T001's
  (`research/raw/m043-stability.json:176-204`), and `E1` pins both values with and without a frame
  beside them (`extension/stability-narrator.test.mjs:1312`).
- ✅ "Cannot-tell with the named absence, never stable and never a zero count" is closed for both
  causes at once: the record's own `absence` word produces `cannot-tell` whatever the emission says
  (`extension/stability-narrator.js:182-183`), and `E2` renders the one absence for a record with no
  reachable `ApplicationRef` and for one whose stream could not be subscribed
  (`extension/stability-narrator.test.mjs:1326`).
- ✅ "From nothing else" is the module's own shape: the state is a function of
  `record.stability.reading.value` and `record.stability.absence`, and no other field of the record is
  read for it (`extension/stability-narrator.js:300-314`).
- ⚠ **Not closed alone.** The reach this criterion rests on is wave 1's measurement
  (`research/raw/m043-stability.json:40-95`), and SC1's "for each inspected page" half is the claim
  list and the gate at **wave 4** (`research/raw/m043-verdict-claims.json:18-25`,
  `.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:90`). This wave closes the
  reading; wave 4 rules it.

### SC2 — The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one.: pass

- ✅ The interval is the difference of the two readings the record carries and of nothing else:
  `extension/stability-narrator.js:201-206`. A measured `0` is a number (`:202-206`), a record whose
  settle names the absence carries no `at` and no `sinceAttachMs` (`:195-200`), and the pane prints
  the reading or the absence and nothing beside either (`:377-392`).
- ✅ A measured `0` is pinned as `0` and never as the absence: `extension/stability-narrator.test.mjs:1351`
  (`E3`) holds the three shapes against the recording's own pairs —
  `research/raw/m043-stability.json:259-271` (settle at attach, `sinceAttachMs: 0`, answer
  `no-transition-observed`), `:246-258` (a reading of `1008` against `attachAt` `1001`) and `:272-287`
  (the absence with no time field) — and `.project/tasks/T002-join-a-stability-record.md:80` records
  the observed rendering, `settle: settled at 1001 ms, 0 ms after attach`.
- ⚠ **SC2 is not fully closed by this wave or by any wave of this milestone.** The criterion's first
  clause is written on "when the stability read emits a change from unstable to stable while the
  surface is attached", and **no page produces that change**: the recording answers
  `no-transition-observed` with `producedOnAnInspectedPage: false`
  (`research/raw/m043-stability.json:208-209`), so what is proved here is the arithmetic and the
  absence, not a transition. Wave 1 measured only the mechanism
  (`research/raw/m043-stability.json:210-228`); wave 2 subtracts two published readings; **wave 4**
  drives a realm whose last pending task ends after attach (`scripts/stability-capture.test.mjs:996`)
  but that subject is a `node:vm` realm, not a browser page. The transition half is therefore
  unproven on a page at this head, and it is recorded as this milestone's first non-settlement at
  `.project/research/SYNTHESIS.md:222-232` with the drives that would produce one named at
  `research/raw/m043-stability.json:229-233`.

### SC3 — The work that ran while the app was unstable is reported as the frames the page recorded, and repetition is read from the frame's own `events` list and nothing else: two `TemplateUpdate` start/end pairs inside one `checks` row are reported as two passes over that component, a second `ChangeDetection` pair carrying `componentName: null` is reported as a second change-detection pass attributed to no component, and a frame holding one pair reports one; no per-view cycle count, no outstanding-work count and no pass the `events` list does not hold is ever reported.: pass

- ✅ Two `TemplateUpdate` pairs in one `checks` row are two passes over that component: the
  recording's row holds `[2, 3, 2, 3]` (`research/raw/m043-stability.json:303-317`) and
  `repeatsOf` counts `passes: 2` for `TemplateUpdate app-root`
  (`extension/stability-narrator.js:237-271`), pinned by `E5` at
  `extension/stability-narrator.test.mjs:1413` and recorded as the observed line
  `TemplateUpdate app-root: 2 passes` at `.project/tasks/T002-join-a-stability-record.md:81`.
- ✅ A second `ChangeDetection` pair carrying `componentName: null` is a pass attributed to no
  component: all four recorded entries carry `null` (`research/raw/m043-stability.json:318-325`) and
  the attribution falls through to `no component` (`extension/stability-narrator.js:257-260`).
- ✅ A frame holding one pair reports one, and a frame holding no pair reports no pass at all — not a
  zero and not an outstanding-work count: `extension/stability-narrator.js:226-229` returns an empty
  list for a frame with no readable `events`, `:396-414` prints the reading it has
  (`repeated work: the frame recorded no paired work`), and `E6` pins it at
  `extension/stability-narrator.test.mjs:1477` including the half-open and unpaired cases.
- ✅ "No per-view cycle count" is enforced by mutants M6, M7 and M9
  (`.project/tasks/T002-join-a-stability-record.md:84`), which redden the pins at
  `extension/stability-narrator.test.mjs:1433`, `:1466` and `:1523` by name.

### SC4 — Every question the page cannot answer is cannot-tell with its own named absence and no guessed value: the cause is `no-cause-reported`, because `isStable` is a boolean stream (`_debug_node-chunk.mjs:13221-13222`); the outstanding items, their count, their kind and their owner are `no-outstanding-inventory`, because `PendingTasksInternal` holds a `Set<number>` whose `add()` takes no descriptor (`_pending_tasks-chunk.mjs:2304-2312`); the first item to settle and any per-item order are `no-settle-order`, because no timestamp and no settle time crosses any API; and no absence is ever filled from a task id, an epoch delta, a signal-graph label, a component name or a creation stack.: pass

- ✅ Four distinct absences, one per unanswered question, each its own name and its own sentence:
  `extension/stability-narrator.js:74-77`, `:91-95`, `:115-123`; `E7` pins that the four stay four
  and render alone (`extension/stability-narrator.test.mjs:1534`).
- ✅ None of them renders as zero outstanding items: `absencesOf` returns names only
  (`extension/stability-narrator.js:288-295`), no count exists anywhere in the module, and the pane's
  cells hold sentences with no number that could be read as an inventory (`:477-495`).
- ✅ Nothing is filled from a task id, an epoch delta, a signal-graph label, a component name or an
  opted-in creation stack: the module reads `record.stability` and `record.events` and no other field
  (`extension/stability-narrator.js:297-314`), and `E8` holds a record from an app that opted into
  `provideStabilityDebugging()` at `no-outstanding-inventory`
  (`extension/stability-narrator.test.mjs:1589`), with mutants M10, M12 and M13 as the counter-proofs
  (`.project/tasks/T002-join-a-stability-record.md:84`).
- ⚠ **Not closed alone.** The evidence that these three questions have no observable is wave 1's
  (`research/raw/m043-stability.json:504-510`, `:157-174`); SC4's ruling against the recorded
  absences is **wave 4**'s (`research/raw/m043-verdict-claims.json:45-53`). This wave mints the
  absences; wave 4 rules them.

### SC6 — Stability is reported as a measurement and never as the absence of a report: a page whose change-detection record has gone silent but whose `isStable` reads `true` reports stable with the reading that says so, a page whose record is silent and whose stability was never read reports `no-stability-observable`, and no surface renders stable on the strength of a quiet interval, an empty finding set or the record's silence — the failure mode the roadmap's own risk line names (`.project/ROADMAP.md:1587`), measured in the agent's shape, which dispatches one snapshot at install and thereafter only frames (`extension/agent-main.js:566,1418-1448,1038-1060`).: pass

- ✅ A silent record never becomes a verdict: `stateOf` reads the absence word before anything else
  and answers `idle` where nothing was emitted (`extension/stability-narrator.js:180-188`), so a
  record with no frames is `idle` and a record with no stability section is `idle` rather than
  `stable` (`:158-161`, `:181`). `E10` reads the same silent record twice to the same state and the
  same measurement (`extension/stability-narrator.test.mjs:1639`), and M14 and M15 are the two mutants
  that would undo it (`.project/tasks/T002-join-a-stability-record.md:84`).
- ✅ `stable` is reachable only from an emission whose value is `true` (`extension/stability-narrator.js:185`),
  and a silent page that could not be read answers `no-stability-observable`
  (`research/raw/m043-stability.json:433-443` against `:422-432`).
- ⚠ **Not closed alone.** The "no surface renders stable on the strength of a quiet interval" and
  "two pages each keep their own" halves are a rendering and a two-subject reading:
  **wave 3** renders the state so that a silent answer cannot print `stable`
  (`apps/angular-ai-devtools/src/app/panel-stability.ts:404-427`, :390-396 for the no-answer pane) and
  **wave 4** drives the two pages (`scripts/stability-capture.test.mjs:996-1005`, with the shared
  listener-list mutant as the proof the attribution pin bites). This wave supplies the states; waves 3
  and 4 render and drive them.
