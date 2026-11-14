# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 46abef82eef789433557af1868bc7abdf6778870
Wave task: T001 (landed `113d692c`)

Wave 1 is measurement, not proof. It replaces the plan's three inherited premises — that the injector
walk which resolves `Router` also resolves `ApplicationRef`, that the fixture's `/resource-states` is
unstable, and that an unstable-to-stable transition exists to be read — with readings taken at this
head, and it publishes the one page-side section every later wave reads. It closes no success
criterion on its own, and this review does not credit it with one: each criterion heading below
records what the wave measured and names the wave that closes the criterion.

## T001 — Measure the stability surface and carry it on the page agent's record: pass

- ✅ One additive section, one suite and one recording, and no product path outside them:
  `git show --stat 113d692c` reports `extension/agent-main.js` 218 lines changed,
  `extension/agent-main.test.mjs` +12, `scripts/stability-measure.test.mjs` +1,807,
  `research/raw/m043-stability.json` +517 and two re-cut M042 suites
  (`scripts/error-boundary-measure.test.mjs` +20/−2, `scripts/error-boundary-capture.test.mjs` +9/−2);
  no `apps/` path appears in the diff.
- ✅ The reach is the agent's own five steps and not a new tap: `research/raw/m043-stability.json:40-66`
  records each step with the line it runs on — `ng.getInjector` at `extension/agent-main.js:2301`,
  `ɵgetInjectorResolutionPath` at `:2308`, `ɵgetInjectorProviders` at `:2316`, the `record.token` read at
  `:2324`, `injector.get(token)` at `:2381` — and the token at
  `research/raw/m043-stability.json:33-39` (`declaredAt: "extension/agent-main.js:2285"`, which at this
  head is `var STABILITY_TOKEN_NAME = 'ApplicationRef';`).
- ✅ The two subjects are driven, not assumed: `research/raw/m043-stability.json:67-94` —
  `withToken` answers `reachedBy: "ApplicationRef"`, `absence: null`, `getterReads: 1`,
  `subscriptions: 1`, `state: "stable"` (`:68-82`); `withoutToken` answers `reachedBy: null`,
  `absence: "no-stability-observable"`, `state: "cannot-tell"`, and `getterReads: 0` (`:83-93`), with
  the page's answer stated at `:95`.
- ✅ One subscription stays current, measured against the installed tracker rather than argued from the
  getter's shape: `research/raw/m043-stability.json:104-156` — `staysCurrent: true`,
  `subscriptionsTaken: 1`, sequence `true → false → true` across subscribe, two adds and the last
  remove (`:116-156`), the getter at `_debug_node-chunk.mjs:13221-13222` (`:107-115`) and the
  `BehaviorSubject` under it at `_pending_tasks-chunk.mjs:2288,2295` (`:112-114`).
- ✅ `/resource-states` is unstable for the page's lifetime with no fixture change:
  `research/raw/m043-stability.json:176-204` — `state: "unstable"` (`:196`), `stateFor: "the page's
  lifetime"` (`:197`), the loader `new Promise<never>(() => {})` at
  `spikes/ng222-app/src/app/resource-states.ts:61` (`:182-188`), the resource's task added at
  `_resource-chunk.mjs:404` and removed only in the load effect's `finally` at `:463` (`:189-195`).
- ✅ The transition is answered as an absence rather than left to inference:
  `research/raw/m043-stability.json:205-233` — `answer: "no-transition-observed"` (`:208`),
  `producedOnAnInspectedPage: false` (`:209`), and the three drives that would produce one named at
  `:229-233`. The mechanism is measured beside it: one subscription, `true → false → true`, a
  recorded settle of `at: 1008`, `sinceAttachMs: 7` (`:210-228`).
- ✅ The repeated-work shapes are re-derived from the frame's own `events` list at this head:
  `research/raw/m043-stability.json:290-327` — two `TemplateUpdate` starts and two ends with
  `inOneCheckRow: 2` and `checkRowEvents: [2, 3, 2, 3]` over `componentNames: ["app-root"]`
  (`:303-317`), two `ChangeDetection` pairs with `nullComponentNames: 4` and `inAnyCheckRow: false`
  (`:318-325`), and the entry shape stated at `:326`.
- ⚠ **SC3 is not this wave's to carry.** The shapes are measured here; the pass count is not, so this
  review credits wave 1 with no part of SC3. It is closed at **wave 2**
  (`repeatsOf` at `extension/stability-narrator.js:237-271`, `E5` at
  `extension/stability-narrator.test.mjs:1413`, `E6` at `:1477`) and re-ruled at **wave 4**
  (`research/raw/m043-verdict-claims.json:36-44`).
- ✅ The absences' evidence is quoted with the chunk anchors each rests on:
  `research/raw/m043-stability.json:504-510` (the boolean getter, the `Set<number>`, `add()`/`remove()`
  and the missing per-item order) and `:170-174` under the observable, plus `:157-168` for the
  tracker's own shape (`idsKind: "Set"`, `addReturns: "number (a monotone id)"`).
- ✅ The read is on the record the agent already dispatches, in both record shapes:
  `research/raw/m043-stability.json:328-363` — `field: "stability"`, `frameFieldAt:
  "extension/agent-main.js:1052"`, `snapshotFieldAt: ":1442"`, `armedAt: ":1865"`,
  `removedAt: ":1896"`, `frameKeys` placing it after `boundary` and before `checks` (`:348-358`).
  At this head those lines are `stability: stabilityField(),` at `:1052` and `:1442`,
  `installStability();` at `:1865`, and `uninstallStability();` at `:1896`.
- ✅ Anchors unmoved, and the three moves declared below the section rather than discovered later:
  `research/raw/m043-stability.json:444-497` — six unmoved anchors at lines 42, 573, 1034, 1038, 1750
  and 1889 (`:445-476`) and exactly three moved ones recorded with their cause
  (`:477-496`: `installRouterEvents` 1845→1844, `uninstallRouterEvents` 1854→1852, `start()`
  1864→1862, each paid for by merging a two-line comment). The profiler is still installed once and
  `ɵsetProfiler(null)` never called (`:96-102`, `:498-502`).
- ✅ The recording is the wave's own evidence and it re-derives: the suite that owns every section
  passes at this head — `node --experimental-strip-types --test "scripts/stability-measure.test.mjs"`
  is one of the four suites observed at `ℹ tests 56`, `ℹ pass 56`, `ℹ fail 0`, `ℹ suites 16` in the
  command below — and the wave's Verify is recorded passing at its own landing at
  `.project/build/verify-ledger.jsonl:1` (`"result": "pass"` at
  `113d692c847ce6eb37bbaf915a494f6ffddaa358`).

Observed commands at this head:

- `npm run check` → exit 0, `verification gate (structure): pass`, `All matched files use Prettier
  code style!`
- `node --experimental-strip-types --test "scripts/stability-capture.test.mjs"
  "scripts/stability-measure.test.mjs" "extension/stability-narrator.test.mjs"
  "scripts/panel-stability.test.mjs"` → `ℹ tests 56`, `ℹ suites 16`, `ℹ pass 56`, `ℹ fail 0`.

## Intent coverage

### SC1 — The stability state is reported for each inspected page from that page's own `ApplicationRef.isStable`, reached by the injector read the agent already performs for `Router` and from nothing else: on the counter fixture's `/resource-states`, whose never-settling `resource()` takes a pending task for the page's lifetime (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`; `_resource-chunk.mjs:404`), the finding reports the app unstable and names the emission it read; on a page whose `isStable` has emitted `true` it reports stable from that emission; and a page exposing no reachable `ApplicationRef`, or an `isStable` that cannot be subscribed, is cannot-tell with the named absence `no-stability-observable`, never stable and never a zero count.: pass

- ✅ Measured: the reach resolves the token on a page whose provider records carry it and answers
  `reachedBy: null` with `no-stability-observable` on one whose records do not
  (`research/raw/m043-stability.json:67-95`), so both halves of SC1's third clause have a reading.
- ✅ Measured: `/resource-states` is `unstable` from the fixture's own never-settling loader
  (`research/raw/m043-stability.json:176-204`), and the emission the state would be read from is
  `{ value: false }` with no reason beside it (`:198-203`).
- ✅ Measured: the section carries `reachedBy`, `absence`, `attachAt`, `reading` and `settle` in both
  the frame record and the initial snapshot (`research/raw/m043-stability.json:328-344`), which is
  the whole input a finding needs.
- ⚠ **Not proved by this wave.** Nothing here reads a record into a finding, so no clause of SC1 is
  closed: this wave supplies the walk, the two subjects and the field names. SC1 is closed at **wave
  2** (T002, landed `e4421832`) — `extension/stability-narrator.js:180-188` (`stateOf`) takes the
  state from the recorded emission's value and from the record's own absence word, and the pins are
  `E1` at `extension/stability-narrator.test.mjs:1312` and `E2` at `:1326`. **Wave 4** re-rules the
  same criterion against the claim list (`research/raw/m043-verdict-claims.json:18-25`) and the gate;
  it adds no clause.

### SC2 — The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one.: pass

- ✅ Measured: the mechanism that would produce the transition is real — one subscription through the
  getter read `true` at subscribe, `false` across two adds and `true` again after the last remove,
  twice over (`research/raw/m043-stability.json:104-156`), and the recording names the two
  `performance.now()` readings a transition would rest on (`:210-228`).
- ✅ Measured: a page already stable at attach settles *at* attach —
  `sinceAttachMs: 0` (`research/raw/m043-stability.json:234-244`) — which is a reading and never a
  transition, and the recording says so rather than presenting the zero as one.
- ✅ Measured: the absences are named per subject — `silent-stream` and `no-application-ref` each
  carry `{ state: "no-settle-observed" }` with no time field
  (`research/raw/m043-stability.json:272-287`), and the record's own snapshot carries the same
  absence (`:380-393`).
- ⚠ **Not proved by this wave, and not proved on a page by any wave of this milestone.** The
  recording answers `no-transition-observed` and `producedOnAnInspectedPage: false`
  (`research/raw/m043-stability.json:208-209`): no inspected subject ends its last pending task after
  attach, so **SC2's transition half is unproven on a page** and only the mechanism is measured.
  Wave 1 measures it; **wave 2** implements the subtraction and pins it (`settleOf` at
  `extension/stability-narrator.js:194-207`, `E3` at `extension/stability-narrator.test.mjs:1351`);
  **wave 4**'s two-page session drives a realm whose last task ends after attach
  (`scripts/stability-capture.test.mjs:996`) but that subject is a `node:vm` realm and not a browser
  page. No wave in this milestone closes the transition half; what would close it is named at
  `research/raw/m043-stability.json:229-233` and recorded as a non-settlement at
  `.project/research/SYNTHESIS.md:222-232`.

### SC3 — The work that ran while the app was unstable is reported as the frames the page recorded, and repetition is read from the frame's own `events` list and nothing else: two `TemplateUpdate` start/end pairs inside one `checks` row are reported as two passes over that component, a second `ChangeDetection` pair carrying `componentName: null` is reported as a second change-detection pass attributed to no component, and a frame holding one pair reports one; no per-view cycle count, no outstanding-work count and no pass the `events` list does not hold is ever reported.: pass

- ✅ Measured: the repeated-work shapes are re-derived from the frame's own `events` list at this
  head — `research/raw/m043-stability.json:290-327` — with `inOneCheckRow: 2` and
  `checkRowEvents: [2, 3, 2, 3]` over `componentNames: ["app-root"]` (`:303-317`), two
  `ChangeDetection` pairs with `nullComponentNames: 4` and `inAnyCheckRow: false` (`:318-325`),
  and the entry shape stated at `:326`, so a row holding two `TemplateUpdate` pairs is two passes
  over that component and not a per-view count.
- ⚠ **Not proved by this wave.** Nothing here renders the reading: SC3 is a statement about what a
  finding reports, and it is closed at **wave 2**, where the join mints the reading from `events`
  alone (`extension/stability-narrator.js`, pinned by the repeated-work mutants) and unchanged at
  **wave 4**, whose claim list adds no clause.

### SC6 — Stability is reported as a measurement and never as the absence of a report: a page whose change-detection record has gone silent but whose `isStable` reads `true` reports stable with the reading that says so, a page whose record is silent and whose stability was never read reports `no-stability-observable`, and no surface renders stable on the strength of a quiet interval, an empty finding set or the record's silence — the failure mode the roadmap's own risk line names (`.project/ROADMAP.md:1587`), measured in the agent's shape, which dispatches one snapshot at install and thereafter only frames (`extension/agent-main.js:566,1418-1448,1038-1060`).: pass

- ✅ Measured: the record now separates silence from stability by construction — a silent page's
  section is `{ reading: null, settle: { state: "no-settle-observed" } }`
  (`research/raw/m043-stability.json:422-432`) and an unreachable page's is
  `{ absence: "no-stability-observable", reading: null }` (`:433-443`), neither of them a verdict.
- ✅ Measured: the section is armed at install and removed by `reset()`, so the initial snapshot at
  `extension/agent-main.js:1442` and the frames at `:1052` are the only places a state can come from
  (`research/raw/m043-stability.json:328-363`, `:394-406` for the post-reset section).
- ⚠ **Not proved by this wave.** SC6 is a statement about a rendering, and this wave renders nothing.
  It is closed at **wave 2** — `idle` and `cannot-tell` are states of their own and `stable` is
  reachable only from an emission whose value is `true` (`extension/stability-narrator.js:180-188`),
  pinned by `E10` at `extension/stability-narrator.test.mjs:1639` — and completed at **wave 4**, whose
  two-stream drive keeps each page's reading its own (`scripts/stability-capture.test.mjs:996-1005`).
