# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 46abef82eef789433557af1868bc7abdf6778870
Wave task: T004 (landed `46abef82`, completed by the orchestrator after a killed dispatch)

Wave 4 is the claim list, the arming switch, the two-page session, the archive's synthesis and the
gate. It re-rules all six criteria against artefacts that were already in the tree and it adds no
answer of its own — except the one no earlier wave could prove (two pages, each with its own state and
its own settle reading).

## T004 — Re-capture behind an opt-in switch, rule the claims and close the gate: pass

- ✅ Four artefacts and one task file, and nothing outside them: `git show --stat 46abef82` reports
  `.project/research/SYNTHESIS.md` +267, `research/raw/m043-verdict-claims.json` +73,
  `scripts/stability-capture.test.mjs` +1,008 and the task file +13/−3.
- ✅ The six claim rows are **read, not retyped**: `research/raw/m043-verdict-claims.json:4-7` records
  that every `criterionText` is produced by `scripts/overlay-verdict-claims.test.mjs`'s own
  `intentCriteria` routine, extracted from that file and run over `.project/intent/INTENT.md`, and the
  six rows are `:18-25` (SC1), `:27-35` (SC2), `:36-44` (SC3), `:45-53` (SC4), `:54-62` (SC5) and
  `:63-71` (SC6) — one row per criterion, each quoting the intent's own character stream.
- ✅ The quotation is counted rather than asserted: `criterionCharacters` is 754, 604, 566, 685, 540 and
  656 at `research/raw/m043-verdict-claims.json:21`, `:30`, `:39`, `:48`, `:57` and `:66` — **3,805
  quoted characters** — and the same figure is carried by the row's own `artefact` and by
  `.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:84`.
- ✅ The ruling is stated rather than left to silence: `research/raw/m043-verdict-claims.json:8-15`
  (`ruling.required: 0`, `ruling.notRequired: 6`) with the reason the charter's portal clause is
  answered by a name and not by a dodge (`:11-14`), and no driver, instance or verdict path named
  because the overlay suite refuses a list that names one without a required row (`:12`).
- ✅ The default (unarmed) capture is byte-identical, and the suite proves it of itself:
  `scripts/stability-capture.test.mjs:86-89` (`sha256Of`), `:714` (the baseline read at load),
  `:795-800` (the pin that prints the hash at load and after and asserts they are equal) and `:814-828`
  (the arming gate that fails if any side effect runs outside `M043_CAPTURE`). Observed at this head,
  unarmed:
  `research/raw/m043-stability.json at load: 24652 bytes, sha256 3b0cfc3a69778cfd6e361eb729130a63c7220f7c95bfd400caa40082c0d8fdfa`
  and `… after the run: sha256 3b0cfc3a6977…dfa` — the same bytes, and the same hash the armed run
  recorded at `.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:85`.
- ✅ Armed, the recording is re-derived and stable across two passes: the armed path runs T001's
  derivation twice and requires identical bytes (`.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:85`,
  `scripts/stability-capture.test.mjs:737-751`), and nothing it checks is a pinned literal — the token
  name, the version constant, the seven section fields, the two record sites and the arming line are
  all read out of `extension/agent-main.js` at run time
  (`.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:88`,
  `scripts/stability-capture.test.mjs:859`).
- ✅ Five mutants, each reddening a named assertion by string:
  `scripts/stability-capture.test.mjs:963-973` (a one-character drift in SC1's `criterionText`, reddening
  `SC1 must quote the INTENT criterion character for character`), `:975-983` (`criterionCharacters` off
  by one, reddening `SC1 records 755 characters and the intent's text is 754`), `:985-993` (no row
  ruling SC6, reddening `SC6 is declared by the intent and ruled by no row`), `:933-947` (a serialisation
  that drifted by one separator, reddening `the recording drifted from its canonical serialisation at
  byte N`) and `:1000-1005` (one listener list shared by both pages, reddening
  `the page that never emitted true must answer unstable`). Recorded at
  `.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:87`.
- ✅ Held-out E11 is the suite's own and runs unarmed: `scripts/stability-capture.test.mjs:996-997`
  drives `driveSession()` (`:544`) — two `node:vm` realms booting the shipped agent with their own
  `ng`, `document`, clock and record list — and asserts each page's own state and own settle reading
  with no emission crossing. The header states what the two realms are not (`:14`), and the shared-list
  mutant at `:376`/`:538` is the proof the attribution pin bites.
- ✅ `SYNTHESIS.md` exists with its four non-settlements stated as the task's Log names them, and with a
  fifth the Log does not name. `.project/research/SYNTHESIS.md:3-15` is the archive-time heading block
  (no research phase and no decide phase ran, nothing independent claimed, only artefacts already in
  the tree synthesised, `git ls-tree` cited). The four are `:222-232` (`transitionProducible: false`,
  SC2's positive half unproven on a page), `:234-241` (the portal's zoneless target may be permanently
  stable and was never read), `:243-249` (two realms, not two browser tabs) and `:251-258` (the absences
  the surface cannot fill, `no-stability-observable` included) — the same four listed at
  `.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:89`. A fifth paragraph,
  `:260-267`, records that no live page was driven and that no `lars-verify` verdict exists for the
  route; it is stated here so the count is not read as four when the document carries five.
- ✅ **The T004 takeover is recorded as it happened, and nothing was widened to make the gate green.**
  The dispatched run wrote all three artefacts and then stalled — **126 turns, its `## Log` untouched
  for 44 minutes**, no verdict — so it was killed, and the orchestrator completed the verification by
  hand and appended the `ready` verdict to the Log before landing.
  `.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:90` is that record in the task's
  own Log (`agent: orchestrator-takeover` in the front matter at `:9`; the Log states the same stall as
  142 tool uses and 44 minutes). The verification was: **56/56 on the four suites** (re-observed by this
  review at this head: `ℹ tests 56`, `ℹ suites 16`, `ℹ pass 56`, `ℹ fail 0`), `prettier` clean
  (re-observed: `All matched files use Prettier code style!`), **`npm run check` exit 0** (re-observed
  here, with `verification gate (structure): pass`), and `npm test` at **1,360 pass / 0 fail / 218
  suites**, plus user-scope 60, skills 628 and app 31 files — the last of these is the Log's own
  reading at `:90` and was not re-run by this review. No file was re-recorded, no suite skipped and no
  assertion widened between the stall and the landing.

## Intent coverage

### SC1 — The stability state is reported for each inspected page from that page's own `ApplicationRef.isStable`, reached by the injector read the agent already performs for `Router` and from nothing else: on the counter fixture's `/resource-states`, whose never-settling `resource()` takes a pending task for the page's lifetime (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`; `_resource-chunk.mjs:404`), the finding reports the app unstable and names the emission it read; on a page whose `isStable` has emitted `true` it reports stable from that emission; and a page exposing no reachable `ApplicationRef`, or an `isStable` that cannot be subscribed, is cannot-tell with the named absence `no-stability-observable`, never stable and never a zero count.: pass

- ✅ Ruled and provable: `research/raw/m043-verdict-claims.json:18-25` quotes the criterion and names
  the artefacts that carry it (`research/raw/m043-stability.json`'s `reach.walk`, `reach.subjects` and
  `page`, with `extension/agent-main.js:2285`, `:2388`, `:2443`, `:1052` and `:1442`), ruling it
  `not-required` with its reason stated (`:25`). The proving commands it names are
  `extension/stability-narrator.test.mjs` (E1, E2) and `scripts/stability-measure.test.mjs`.
- ✅ Wave 1 measured the reach and wave 2 read the emission (`extension/stability-narrator.js:180-188`);
  this wave adds no clause, only the rule and the gate.

### SC2 — The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one.: pass

- ✅ Ruled with its limit stated in the ruling itself: `research/raw/m043-verdict-claims.json:27-35`
  separates the three shapes and names `transitionProducible: false` on a page, and it says plainly
  that a portal drive would return `no-settle-observed` rather than the transition the criterion is
  written on.
- ⚠ **SC2 is not credited as fully closed by this wave.** The claim list rules it; no wave produced the
  transition on a page. Wave 1 measured only the mechanism
  (`research/raw/m043-stability.json:210-228`, `:208-209` `no-transition-observed` /
  `producedOnAnInspectedPage: false`), wave 2 implemented and pinned the interval
  (`extension/stability-narrator.js:194-207`, E3 at `extension/stability-narrator.test.mjs:1351`), and
  this wave's two-page drive has a settling subject — `scripts/stability-capture.test.mjs:996` — but a
  `node:vm` realm is not a browser page (`.project/research/SYNTHESIS.md:243-249`). The transition half
  is unproven on a page at this head and is this milestone's first non-settlement
  (`.project/research/SYNTHESIS.md:222-232`); what would produce one is named at
  `research/raw/m043-stability.json:229-233`.

### SC3 — The work that ran while the app was unstable is reported as the frames the page recorded, and repetition is read from the frame's own `events` list and nothing else: two `TemplateUpdate` start/end pairs inside one `checks` row are reported as two passes over that component, a second `ChangeDetection` pair carrying `componentName: null` is reported as a second change-detection pass attributed to no component, and a frame holding one pair reports one; no per-view cycle count, no outstanding-work count and no pass the `events` list does not hold is ever reported.: pass

- ✅ Ruled against the recording's own shapes: `research/raw/m043-verdict-claims.json:36-44` quotes the
  criterion and names `repeats.templateUpdate` (`inOneCheckRow: 2`, `checkRowEvents: [2,3,2,3]`),
  `repeats.changeDetection` (`nullComponentNames: 4`, `inAnyCheckRow: false`) and the repeat list in
  `extension/stability-narrator.js`, with its reason at `:43`.
- ✅ Waves 1 and 2 prove the reading (`research/raw/m043-stability.json:290-327`,
  `extension/stability-narrator.js:237-271`, E5/E6); this wave rules it and names the proving commands.

### SC4 — Every question the page cannot answer is cannot-tell with its own named absence and no guessed value: the cause is `no-cause-reported`, because `isStable` is a boolean stream (`_debug_node-chunk.mjs:13221-13222`); the outstanding items, their count, their kind and their owner are `no-outstanding-inventory`, because `PendingTasksInternal` holds a `Set<number>` whose `add()` takes no descriptor (`_pending_tasks-chunk.mjs:2304-2312`); the first item to settle and any per-item order are `no-settle-order`, because no timestamp and no settle time crosses any API; and no absence is ever filled from a task id, an epoch delta, a signal-graph label, a component name or a creation stack.: pass

- ✅ Ruled with the chunk anchors it rests on: `research/raw/m043-verdict-claims.json:45-53` names
  `research/raw/m043-stability.json`'s `absences` block, `observable.pendingTasks.noPerItemOrder` and
  `PERMANENT_ABSENCES`/`ABSENCE_ORDER` in `extension/stability-narrator.js`, and records that an
  absence is not a driver's reading (reason at `:52`).
- ✅ Wave 2 mints the four absences (`extension/stability-narrator.js:74-95`, `:115-123`, `:288-295`,
  E7/E8); this wave rules them and the gate re-reads them.

### SC5 — The panel surface renders the state, the settle time or its named absence, and the repeated-work reading, each in its own block, and renders nothing else: no sentence names a cause, no list names an outstanding item or its owner, no column orders work by settle time, the surface is registered in the route table that carries no stability route today (`apps/angular-ai-devtools/src/app/app.routes.ts:17-160`), and asked for a page it has no stability answer for it renders `no-stability-observable` rather than an empty table or an em dash.: pass

- ✅ Ruled against the landed surface: `research/raw/m043-verdict-claims.json:54-62` names
  `apps/angular-ai-devtools/src/app/panel-stability.ts:404`, the route at
  `apps/angular-ai-devtools/src/app/app.routes.ts:167`, the demo's sample fact and E9's own lines
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1567`, `:1652`), with the reason at `:61` — the
  panel is the only surface the intent declares.
- ✅ Wave 3 rendered and registered it; this wave rules it and its gate carries the app suite.

### SC6 — Stability is reported as a measurement and never as the absence of a report: a page whose change-detection record has gone silent but whose `isStable` reads `true` reports stable with the reading that says so, a page whose record is silent and whose stability was never read reports `no-stability-observable`, and no surface renders stable on the strength of a quiet interval, an empty finding set or the record's silence — the failure mode the roadmap's own risk line names (`.project/ROADMAP.md:1587`), measured in the agent's shape, which dispatches one snapshot at install and thereafter only frames (`extension/agent-main.js:566,1418-1448,1038-1060`).: pass

- ✅ The two-subject half is closed here and only here: `scripts/stability-capture.test.mjs:996-1005`
  drives two pages in one session, each answering its own state and its own settle reading, and the
  shared-list mutant at `:1000-1005` reddens the attribution pin by name. Ruled at
  `research/raw/m043-verdict-claims.json:63-71`, which names `idle`/`cannot-tell`/`stable` in
  `extension/stability-narrator.js` and this suite's E11 drive as what carries it.
- ✅ The unarmed capture is the same fact read the other way: a default run prints the recording's
  sha256 before and after and asserts they are equal (`scripts/stability-capture.test.mjs:795-800`),
  observed at this head as `3b0cfc3a6977…dfa` both times — silence in the file system is not a
  measurement either.
- ✅ The gate: `npm run check` → exit 0 with `verification gate (structure): pass` at this head, and
  the milestone's own verify (`npm run check && npm test`) recorded at
  `.project/build/verify-ledger.jsonl:4` — `"result": "pass"` at
  `46abef82eef789433557af1868bc7abdf6778870` — with the `npm test` reading quoted at
  `.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:90`.
