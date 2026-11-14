# Final review — M043 stability-explainer

Reviewed HEAD: 109e0af88550c2da816537d1204f095baac56a52
Branch: `gsd-path/M043`
Waves reviewed: 1–5, one task per wave, wave verdict `pass` at cycle 1 in
`.project/review/wave-1.cycle1.md` through `.project/review/wave-5.cycle1.md`.
Overall verdict: pass

All six criteria are met, and met where the wave reviews say they close rather than where it
would be convenient to close them: SC1 at wave 2, SC3 at wave 2, SC4 at wave 2, SC5 at wave 3 alone,
and SC6 in two halves — the rendering at wave 3 and the two-subject proof at wave 4. The sixth, SC2, is the one this review refused at `46abef82`,
on the ground that the transition its first clause is written on had been produced by no inspected
page (`transitionProducible: false`, `research/raw/m043-stability.json:208-209`); wave 5 drove one and
the criterion closes there (`research/raw/m043-settle-page.json:1036-1078`).

The gate's grammar has two values, and `pass` requires all six criteria met (`gsd final-check`'s own
rule; `.project/review/wave-4.cycle1.md` refuses to credit SC2). So the overall verdict is `pass`:
the clause wave 4 refused is a reading an inspected page published at wave 5
(`research/raw/m043-settle-page.json:1049-1056`), the build gate is green at this head
(`npm run check` exit 0, `.project/build/verify-ledger.jsonl:5`), the four stability suites are 60/60,
and `npm test` is 1,360 pass / 0 fail over 218 suites
(`.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:90`).
What was blocked was a reading, not a landing.

No wave claimed a criterion its own landing could not carry. Wave 1 is measurement and closes nothing;
wave 2 mints the answers and closes SC1, SC3 and SC4; wave 3 renders them and closes SC5; wave 4
rules all six against the claim list, proves the one clause no pure function could carry (two
subjects), and lands the gate.

## The five landings

| Wave | Task | Commit | What landed | Verify ledger |
| ---- | ---- | ------ | ----------- | ------------- |
| 1 | T001 measure the reach, the subscription's currency, the unstable subject and the record | `113d692c` | `extension/agent-main.js` +218 lines (one additive `stability` section, armed at `:1865`, removed at `:1896`), `scripts/stability-measure.test.mjs` +1,807, `research/raw/m043-stability.json` +517, `extension/agent-main.test.mjs` +12, and two M042 suites re-cut (`scripts/error-boundary-measure.test.mjs` +20/−2, `scripts/error-boundary-capture.test.mjs` +9/−2); no `apps/` path | row 1, `"result": "pass"` at `113d692c` |
| 2 | T002 join the record into the state, the settle reading and the repeated work | `e4421832` | `extension/stability-narrator.js` +534, `extension/stability-narrator.test.mjs` +1,732; no `apps/`, no `extension/agent-main.js`, no `scripts/` change | row 2 at `e4421832` |
| 3 | T003 panel surface, the route entry and every pin the registration moves | `ddb91a1a` | `apps/angular-ai-devtools/src/app/panel-stability.ts` +451, `panel-demo.ts` +28, `app.routes.ts` +10 (one entry, `:167-169`), five app specs re-cut (+397 in `panel-demo.spec.ts`), `scripts/panel-stability.test.mjs` +1,328, `scripts/panel-routes.test.mjs` +45 | row 3 at `ddb91a1a` |
| 4 | T004 re-capture behind an opt-in switch, rule the claims, close the gate | `46abef82` | `scripts/stability-capture.test.mjs` +1,008, `research/raw/m043-verdict-claims.json` +73, `.project/research/SYNTHESIS.md` +267 | row 4 at `46abef82`, the full `npm run check && npm test` |
| 5 | T005 drive a settle on an inspected page, so SC2's transition half rests on a page | `c258d440` | `research/raw/m043-settle-page.json` 38,279 B (`/lazy`, 17.1 ms after attach), `scripts/stability-page-settle.test.mjs` +1,041 (11 read-only tests, four mutants) | row 5 at `c258d440`, the four stability suites at 60/60 |

All five rows of `.project/build/verify-ledger.jsonl` read `"result": "pass"` against the commit they
were recorded at (`:1-5`), and each was re-read at its own head by the wave review that owns it.

## What this milestone actually is

It is one section on the record, one pure function over it, one pane, and one honest inventory of
what a page cannot say.

Wave 1 added a `stability` section of seven fields — `reachedBy`, `absence`, `attachAt`, `reading`,
`settle`, `version`, `coreVersion` — between `boundary` and `checks`, in the frame record and in the
initial snapshot alike (`research/raw/m043-stability.json:334-358`, `:343-344`). It is filled by the
five-step injector walk the agent already performs for `Router` and by no new tap: `ng.getInjector`
(`extension/agent-main.js:2301`), `ɵgetInjectorResolutionPath` (`:2308`), `ɵgetInjectorProviders`
(`:2316`), the record whose `token.name` matches (`:2324`), `injector.get(token)` (`:2381`), all
recorded with their lines at `research/raw/m043-stability.json:40-66`. Three anchors this milestone
would have paid for moved by one or two lines and the moves are declared rather than discovered:
`installRouterEvents` 1845→1844, `uninstallRouterEvents` 1854→1852, `start` 1864→1862, each paid for
by merging a two-line comment, while the six anchors earlier recordings cite — lines 42, 573, 1034,
1038, 1750 and 1889 — did not move (`:444-497`).

Wave 2 is one function over that record: `stability(record)` answers eight keys and reads no clock,
no DOM and no page (`extension/stability-narrator.js:300-314`). The state is the emission's own value
and the record's own absence word (`:180-188`); the settle reading is `settle.at - attachAt` over two
readings the page published (`:194-207`); the repeated work is one pass per start/end pair in the
frame's own `events` list (`:237-271`); the absences are four values with four sentences (`:91-95`,
`:115-123`).

Wave 3 is the pane: three blocks in one order — state, settle, repeats — assembled at
`stabilityPanel` (`apps/angular-ai-devtools/src/app/panel-stability.ts:423-427`), registered at
`/stability` through the shared `loadPanelDemo` loader (`apps/angular-ai-devtools/src/app/app.routes.ts:14`,
`:167-169`), with the demo's sample fact being the join's own answer for the recording
(`apps/angular-ai-devtools/src/app/panel-demo.ts:341-351`).

Wave 4 is the re-capture (armed behind `M043_CAPTURE=1`, a default run writing nothing), the claim
list that quotes each criterion character for character from the intent and rules each `not-required`
with its reason stated (`research/raw/m043-verdict-claims.json:4-15`), the two-page session, the
synthesis, and the gate.

## The premise, narrowed

The roadmap's sentence is "Build the stability explainer: why the app is not stable, and what is
still outstanding" (`.project/intent/INTENT.md:161-163`, quoting `.project/ROADMAP.md:1563`). Three
of its words have no observable, and the milestone says so in the answer rather than in a footnote.

`isStable` is `hasPendingTasksObservable.pipe(map(pending => !pending))`
(`_debug_node-chunk.mjs:13221-13222`, quoted at `research/raw/m043-stability.json:107-115`): a boolean
stream that carries no reason. `PendingTasksInternal.pendingTasks` is a `Set<number>` whose `add()`
takes no descriptor and returns a monotone id (`_pending_tasks-chunk.mjs:2286`, `:2305`, recorded at
`research/raw/m043-stability.json:157-168`), so the outstanding inventory has no count, no kind and
no owner to report. No insertion timestamp and no settle-time field crosses any API, so a per-item
order cannot be read (`:168`, `:173`). The one ownership surface is the application's own opt-in,
`provideStabilityDebugging()`, which console-debugs a creation stack after
`APPLICATION_IS_STABLE_TIMEOUT - 1_000` ms and only for an app that asks — the fixture does not and
the portal does not (`.project/intent/INTENT.md:174-184`).

| The roadmap's question | What this milestone answers | Where |
| ---------------------- | --------------------------- | ----- |
| why the app is not stable | `no-cause-reported` — the getter is a boolean map, so an unstable reading names no task | `research/raw/m043-stability.json:171`, `:504-505`; `extension/stability-narrator.js:118-119` |
| what is still outstanding, its count, its kind, its owner | `no-outstanding-inventory` — ids only, and `add()` takes no descriptor | `research/raw/m043-stability.json:157-168`, `:172`, `:506`; `extension/stability-narrator.js:120-121`; E8 at `extension/stability-narrator.test.mjs:1589` |
| the first item to settle, or any per-item order | `no-settle-order` — insertion order of bare numbers is the only order there is | `research/raw/m043-stability.json:173`, `:507`; `extension/stability-narrator.js:122-123` |
| **whether** the app is stable | the emission's own value, or `no-stability-observable` where no `ApplicationRef` was reached | `research/raw/m043-stability.json:67-94`, `:196`; `extension/stability-narrator.js:180-188` |
| **when** it settled | `settle.at - attachAt`, or `no-settle-observed` with no time and no duration | `extension/stability-narrator.js:194-207`; `research/raw/m043-stability.json:245-288` |
| **which** work ran | one pass per start/end pair in the frame's own `events`, attributed to the component that recorded it | `research/raw/m043-stability.json:290-327`; `extension/stability-narrator.js:237-271` |

So the subject is not "why, and what is outstanding". It is **whether** the app is stable, **when**
it settled and **which work ran** — with the three unanswerable clauses carried as named absences
rather than guessed from a task id, an epoch delta, a signal-graph label, a component name or an
opted-in creation stack (`.project/intent/INTENT.md:65-68`; E7 and E8 at
`extension/stability-narrator.test.mjs:1534`, `:1589`).

## Success criteria

### SC1 — The stability state is reported for each inspected page from that page's own `ApplicationRef.isStable`, reached by the injector read the agent already performs for `Router` and from nothing else: on the counter fixture's `/resource-states`, whose never-settling `resource()` takes a pending task for the page's lifetime (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`; `_resource-chunk.mjs:404`), the finding reports the app unstable and names the emission it read; on a page whose `isStable` has emitted `true` it reports stable from that emission; and a page exposing no reachable `ApplicationRef`, or an `isStable` that cannot be subscribed, is cannot-tell with the named absence `no-stability-observable`, never stable and never a zero count.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/stability-narrator.test.mjs"` for E1 and E2 (the reader's own pins), and `node --experimental-strip-types --test "scripts/stability-measure.test.mjs"` for the reach's five steps held to the agent's own source (waves 1 and 2).
- **Observed**: a record whose emission is `false` answers `unstable` and names the emission it read, `{ value: false, at }`; a record whose emission is `true` answers `stable` from that emission; both verdicts are unchanged by the presence or absence of a record frame beside them (E1, `.project/review/wave-2.cycle1.md`). A record with no reachable `ApplicationRef` and one whose stream could not be subscribed both answer `cannot-tell` with the single named absence `no-stability-observable`, with no state word beside it and no zero standing in for it (E2). The walk itself was driven at this head on two subjects: `reachedBy: "ApplicationRef"`, `absence: null`, `getterReads: 1`, `subscriptions: 1` on one, and `reachedBy: null`, `absence: "no-stability-observable"`, `state: "cannot-tell"`, `getterReads: 0` on the other (`research/raw/m043-stability.json:67-94`), with `/resource-states` unstable from the fixture's own never-settling loader (`:176-204`).
- **Reference**: `extension/stability-narrator.js:166-175` (`readingOf`) and `:180-188` (`stateOf`, the absence word read before anything else); `extension/stability-narrator.test.mjs:1312` (E1), `:1326` (E2); `research/raw/m043-stability.json:33-39` (the token), `:40-66` (the five steps and their lines), `:67-94` (the two subjects); `extension/agent-main.js:2285` (`var STABILITY_TOKEN_NAME = 'ApplicationRef';`), `:2388` (the getter read), `:1052` and `:1442` (the section on both record shapes); `.project/review/wave-2.cycle1.md`.
- **Finding**: closed at wave 2 (`e4421832`). Wave 1 measured the reach, the two subjects and the record's field names and closed no clause, and its review credits it with none (`.project/review/wave-1.cycle1.md`); wave 4 re-rules the same criterion against the claim list and adds no clause (`research/raw/m043-verdict-claims.json:18-25`). The unstable half rests on the fixture's loader rather than on a live `/resource-states`, which is stated below and not hidden in the pin.
- **Fix direction**: none required at this head. What would reopen it is a core that renamed or narrowed the token, or a page whose records carry `ApplicationRef` but whose `isStable` refuses a subscriber — either would need a new measurement, not a re-reading of `research/raw/m043-stability.json:67-94`.

### SC2 — The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/stability-page-settle.test.mjs"` for the page-level transition, its interval, the control's measured `0` and the six-route survey (wave 5), over `node --experimental-strip-types --test "extension/stability-narrator.test.mjs"` for E3's arithmetic and its three absences (wave 2).
- **Observed**: an inspected page produced the change. Route `/lazy` on the counter fixture at `:4222`, loaded through this checkout's unpacked `extension/` (`research/raw/m043-settle-page.json:6-22`, `:9-13`), attached at `attachAt` 112.69999998807907 with `reading {value: false}` and `settle {state: "no-settle-observed"}` (`:1039-1047`; the frame record that carried it at `:328-341`), and settled at 129.79999995231628 with `reading {value: true}` and `settle {state: "settled", at: 129.79999995231628}` (`:1049-1056`) — `sinceAttachMs` 17.099999964237213 (`:1056`), the join's own subtraction of the two readings (`extension/stability-narrator.js:205`). The sequence is the two records the page dispatched, `false@112.699…` → `true@129.799…` (`:1058-1067`), and the drive's own second subscription, taken before the read attached, recorded the same two values (`:391-408`). What held the task is the record's own `routerEvents`: `RouteConfigLoadEnd@123.699…` (`:49-61`) → `NavigationEnd@127.599…` (`:275-287`), both after attach and before the settle, with no task id and no cause claimed (`:1143`). It reproduced three times — 32.299999952316284, 8.900000035762787 and 9.300000011920929 ms (`:409-525`, `:526-641`, `:642-700`) — and the interval is never the record's quiet tail, which is 513.3000000119209 ms at `:1074-1077` (`scripts/stability-page-settle.test.mjs:594-621`). The measured control is the criterion's own `0`: a page already stable at attach was navigated, published `reading {value: false, at: 1093.3999999761581}` (`research/raw/m043-settle-page.json:745-760`) and saw `true` at 1099.5 (`:762-781`), yet its `settle` stayed 265.89999997615814 (`:753-756`), because `onStabilityEmission` locks the first `true` at or after attach (`extension/agent-main.js:2337-2347`) — so a settle later than attach requires attaching while a task is pending — and that measured `0` is still rendered as `0` (`scripts/stability-page-settle.test.mjs:1010`, `:1016-1027`). A six-route survey (`research/raw/m043-settle-page.json:783-1033`) shows only `/lazy` moving: `/`, `/redirect`, `/gated` and `/after-render` are stable at attach with interval `0`, and `/resource-states` attaches `false` and never settles.
- **Reference**: `scripts/stability-page-settle.test.mjs:763-824` (the pin: `settle.at` after `attachAt`, and the two arrivals that held the task), `:812-823` (the `RouteConfigLoadEnd`/`NavigationEnd` assertions), `:594-621` and `:877` (the quiet-tail mutant, reddening by name), `:995-1055` (the control, the measured `0`, and why a navigation after a settle cannot carry the transition), `:1057-1118` (the survey partition), `:1120-1141` (the recording is its own derivation; a drifted byte reddens it); `research/raw/m043-settle-page.json:1036-1078` (derived attach, settle, sequence, transition and quiet tail), `:49-61` and `:275-287` (the two arrivals), `:702-782` (the control), `:783-1033` (the survey), `:1079-1140` (twelve citations held to a `path:line`), `:1141-1146` (the limits, the control's correction at `:1144`); `extension/stability-narrator.js:194-207`; `extension/agent-main.js:2337-2347`; `.project/build/verify-ledger.jsonl:5`; `.project/review/wave-5.cycle1.md`.
- **Finding**: **met, and it was the one criterion this review refused.** At `46abef82` this review answered SC2 `unverifiable`: the subtraction and the absences were proved and the mechanism was measured, but the transition the criterion's first clause is written on had been produced by no inspected page — `transitionProducible: false`, `producedOnAnInspectedPage: false` (`research/raw/m043-stability.json:208-209`) — and the only settling subject was a `node:vm` realm (`scripts/stability-capture.test.mjs:14`; `.project/research/SYNTHESIS.md:222-232`, `:243-249`). Wave 5 exists for that finding and for nothing else: it is the patch wave the refusal called for, it re-cut no answer, and it closed the clause by driving a page (`research/raw/m043-settle-page.json:1036-1078`). The drive also corrected the recording's own hypothesis. Wave 1 named a router navigation on an already stable route as the candidate (`research/raw/m043-stability.json:229-233`), and the control measures that candidate failing: a navigation after a stable attach publishes a `false` and then a second `true`, and the section's `settle` never moves off the attach reading, because `onStabilityEmission` records the first `true` at or after attach and never moves it (`extension/agent-main.js:2337-2347`; `research/raw/m043-settle-page.json:702-782`, `:1144`). So the clause holds for the reason the criterion states rather than by the route the milestone first guessed: a settle later than attach requires a task pending at attach, which the lazy route's own `loadChildren` import supplies, and the record says so in its `routerEvents`.
- **Fix direction**: none for the criterion; the residual is the subject. The reading is one route on one fixture — three runs of one probe, one browser, one page per run (`research/raw/m043-settle-page.json:1145`; `.project/review/wave-5.cycle1.md`) — and the portal's zoneless target was never read, so whether the Insurance Portal reaches a settle at all is still the intent's open question (`.project/intent/INTENT.md:247-249`). A portal drive would widen the reading and would need its own recording; it would not change this verdict, because the clause is a change produced on an inspected page and `/lazy` produced one.

### SC3 — The work that ran while the app was unstable is reported as the frames the page recorded, and repetition is read from the frame's own `events` list and nothing else: two `TemplateUpdate` start/end pairs inside one `checks` row are reported as two passes over that component, a second `ChangeDetection` pair carrying `componentName: null` is reported as a second change-detection pass attributed to no component, and a frame holding one pair reports one; no per-view cycle count, no outstanding-work count and no pass the `events` list does not hold is ever reported.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/stability-narrator.test.mjs"` for E5 and E6, and `node --experimental-strip-types --test "scripts/panel-stability.test.mjs"` for the pane's repeated-work block (waves 2 and 3).
- **Observed**: a driven frame whose one `checks` row holds `[2, 3, 2, 3]` answers `TemplateUpdate app-root: 2 passes`; the same frame's four `ChangeDetection` entries, every one carrying `componentName: null`, answer a second change-detection pass attributed to no component; a frame holding one pair answers one, and a frame that recorded no paired work answers no pass at all rather than a zero (`research/raw/m043-stability.json:290-327`; E5 at `extension/stability-narrator.test.mjs:1413`, E6 at `:1477`). Mutants M6, M7 and M8 — an entry counted as a pass, passes counted from `checks` rows, a pass invented for a frame with none — each redden the pin they name (`.project/tasks/T002-join-a-stability-record.md:84`).
- **Reference**: `extension/stability-narrator.js:212-222` (`readEvent` reads `pair`, `end` and `componentName`), `:226-229` (`eventsOf`), `:237-271` (`repeatsOf`), `:257-260` (attribution falls through to no component); `research/raw/m043-stability.json:303-317` (`inOneCheckRow: 2`, `checkRowEvents [2,3,2,3]`), `:318-325` (`nullComponentNames: 4`, `inAnyCheckRow: false`), `:326` (the entry shape); `apps/angular-ai-devtools/src/app/panel-stability.ts:291-305`; `research/raw/m043-verdict-claims.json:36-44`.
- **Finding**: closed at wave 2 (`e4421832`). Wave 1 measured both shapes from the frame's own `events` at this head and closed no clause (`.project/review/wave-1.cycle1.md`); wave 3 prints the list and adds no clause, because the criterion is stated of the reading; wave 4 re-rules it against the claim list and adds none (`research/raw/m043-verdict-claims.json:36-44`).
- **Fix direction**: none. The standing risk is prohibition N3 and it is held by the module's shape rather than by a pin list: the answer has no field a per-view cycle count or an outstanding-work count could occupy (`extension/stability-narrator.js:300-314`).

### SC4 — Every question the page cannot answer is cannot-tell with its own named absence and no guessed value: the cause is `no-cause-reported`, because `isStable` is a boolean stream (`_debug_node-chunk.mjs:13221-13222`); the outstanding items, their count, their kind and their owner are `no-outstanding-inventory`, because `PendingTasksInternal` holds a `Set<number>` whose `add()` takes no descriptor (`_pending_tasks-chunk.mjs:2304-2312`); the first item to settle and any per-item order are `no-settle-order`, because no timestamp and no settle time crosses any API; and no absence is ever filled from a task id, an epoch delta, a signal-graph label, a component name or a creation stack.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "extension/stability-narrator.test.mjs"` for E7 and E8 (wave 2), driven against the absence anchors wave 1 re-read from the installed chunks in `research/raw/m043-stability.json`.
- **Observed**: `no-cause-reported`, `no-outstanding-inventory`, `no-settle-order` and `no-stability-observable` stay four distinct values, each renders alone in its own sentence, and none renders as zero outstanding items (E7). A record from an app that opted into `provideStabilityDebugging()` contributes no component name, no call site and no task id, and its answer stays `no-outstanding-inventory` (E8). Mutants M10, M12 and M13 — a cause filled from the component name, an owner filled from the component name, an opted-in stack carried as an absence — redden the pins by name (`.project/tasks/T002-join-a-stability-record.md:84`).
- **Reference**: `extension/stability-narrator.js:74-77` (the four names), `:81-86` (the order), `:91-95` (the permanent three), `:115-123` (one sentence each), `:288-295` (`absencesOf`); `extension/stability-narrator.test.mjs:1534` (E7), `:1589` (E8); `research/raw/m043-stability.json:157-168` (the `Set` of ids and the `add()` that takes no descriptor), `:168` and `:173` (no per-item order), `:171-173` and `:504-510` (the absences and the chunk each rests on); `research/raw/m043-verdict-claims.json:45-53`.
- **Finding**: closed at wave 2 (`e4421832`) and ruled at wave 4. The evidence that these three questions have no observable is wave 1's, quoted with the chunk anchors; wave 2 mints the absences as values rather than as missing fields; wave 4 rules them against the recorded block and the claim list adds no clause (`research/raw/m043-verdict-claims.json:45-53`). A fourth absence, `no-stability-observable`, is filled by no page — only by a page that exposes a reachable, subscribable `ApplicationRef` — and is never a zero count.
- **Fix direction**: none for the criterion. Three of these four absences are permanent by construction, so no later task in this milestone could turn them into readings and a later milestone would need a new API from Angular rather than a re-reading of this one (`.project/research/SYNTHESIS.md:251-258`).

### SC5 — The panel surface renders the state, the settle time or its named absence, and the repeated-work reading, each in its own block, and renders nothing else: no sentence names a cause, no list names an outstanding item or its owner, no column orders work by settle time, the surface is registered in the route table that carries no stability route today (`apps/angular-ai-devtools/src/app/app.routes.ts:17-160`), and asked for a page it has no stability answer for it renders `no-stability-observable` rather than an empty table or an em dash.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/panel-stability.test.mjs"` and `node --experimental-strip-types --test "scripts/panel-routes.test.mjs"`, with `npx nx run angular-ai-devtools:test` for held-out E9 (wave 3).
- **Observed**: three blocks in one order — the state and the emission it was read from, the settle reading or its absence, one line per repeated pass — assembled at `stabilityPanel`; each named absence in its own block and its own sentence; a page it has no stability answer for renders `no-stability-observable` as one absence block, never an empty table and never an em dash; a measured `0` prints as `0` and an absent settle prints no time and no duration. The route entry was added once through the shared loader, and six pins the registration moved were re-cut and each proven to bite by removing the entry and running it red (`.project/review/wave-3.cycle1.md`). Nine real mutants in `scripts/panel-stability.test.mjs` and E9's own line and cell assertions hold the pane to the recording's answer.
- **Reference**: `apps/angular-ai-devtools/src/app/panel-stability.ts:404` (`stabilityPanel`), `:129` (`READING_BLOCKS = ['state', 'settle', 'repeats']`), `:423-427` (the assembly), `:440-444` (one block per carried absence), `:390-396` and `:409` (the no-answer pane), `:251-277` (the settle block); `apps/angular-ai-devtools/src/app/app.routes.ts:14` (the shared loader) and `:167-169` (the entry); `apps/angular-ai-devtools/src/app/panel-demo.ts:341-351` (the sample fact); `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1567`, `:1652` (E9); `scripts/panel-routes.test.mjs:330-343`, `:633-651`; `research/raw/m043-verdict-claims.json:54-62`.
- **Finding**: closed at wave 3 (`ddb91a1a`) alone. The criterion is stated of the surface and wave 3 is the surface; no earlier wave renders, and no later wave adds a block — wave 4 rules it and adds no clause, and its reason says the panel is the only surface the intent declares (`research/raw/m043-verdict-claims.json:61`).
- **Fix direction**: none. The residual risk is prohibition N5 — an editorial sentence about the app's health — and it is held by two prose mutants that redden the pins by string, one naming a cause and one asserting "the outstanding item is task 7, owned by AppComponent" (`.project/tasks/T003-panel-surface-for-the-stability-state.md:90`).

### SC6 — Stability is reported as a measurement and never as the absence of a report: a page whose change-detection record has gone silent but whose `isStable` reads `true` reports stable with the reading that says so, a page whose record is silent and whose stability was never read reports `no-stability-observable`, and no surface renders stable on the strength of a quiet interval, an empty finding set or the record's silence — the failure mode the roadmap's own risk line names (`.project/ROADMAP.md:1587`), measured in the agent's shape, which dispatches one snapshot at install and thereafter only frames (`extension/agent-main.js:566,1418-1448,1038-1060`).

- **Verdict**: met
- **Check**: three legs. The states: `node --experimental-strip-types --test "extension/stability-narrator.test.mjs"` for E10 (wave 2). The rendering: `node --experimental-strip-types --test "scripts/panel-stability.test.mjs"` (wave 3). The two subjects: `node --experimental-strip-types --test "scripts/stability-capture.test.mjs"` for E11, and the project gate `npm run check && npm test` at this head (wave 4; ledger row 4).
- **Observed**: `stateOf` reads the record's own absence word first, answers `idle` where no emission was published, and answers `stable` only where `reading.value === true`, so a silent record is never stable (E10 reads the same silent record twice to the same state and the same measurement). The pane renders the no-answer page as `no-stability-observable` rather than as an empty pane. Two pages in one session each answer their own state and their own settle reading, and the mutant that gives both pages one listener list reddens `the page that never emitted true must answer unstable` by name. The unarmed capture prints the recording's sha256 before and after and asserts they are equal — `3b0cfc3a69778cfd6e361eb729130a63c7220f7c95bfd400caa40082c0d8fdfa`, 24,652 bytes, both times — which is the same property read off the file system (`.project/review/wave-4.cycle1.md`).
- **Reference**: `extension/stability-narrator.js:158-161` (`sectionOf`), `:180-188` (`stateOf`), `:91-95` (`PERMANENT_ABSENCES`); `extension/stability-narrator.test.mjs:1639` (E10); `apps/angular-ai-devtools/src/app/panel-stability.ts:390-396`, `:404-427`; `scripts/stability-capture.test.mjs:795-800` (the byte-identity pin), `:996-1005` (E11 and the shared-list mutant); `research/raw/m043-stability.json:422-432` (the silent frame) against `:433-443` (the absent one); `research/raw/m043-verdict-claims.json:63-71`; `.project/build/verify-ledger.jsonl:4`.
- **Finding**: **splits, and no single wave closes it.** The rendering half closes at wave 3 (`ddb91a1a`) on wave 2's states: `stable` is reachable only from an emission whose value is `true`, and the pane prints no verdict a quiet record could produce. The two-subject proof closes at wave 4 (`46abef82`) and nowhere earlier, because a difference between two subjects is not a property a pure function can carry — wave 2 supplied the states, wave 3 rendered them, and only wave 4 drove two subjects and proved that one page's emission never reaches another page's answer.
- **Fix direction**: none for the reading. The residual is the subject rather than the answer: the two "pages" are two `node:vm` contexts in one process, not two browser tabs (`scripts/stability-capture.test.mjs:14`; `.project/research/SYNTHESIS.md:243-249`), so what is proved is a property of two page realms and not of a browser session.

## The T004 takeover, on the record

T004 was dispatched as one task in one wave and did not finish. It wrote all three of its deliverables
— `scripts/stability-capture.test.mjs`, `research/raw/m043-verdict-claims.json` and
`.project/research/SYNTHESIS.md` — and then stalled: 126 turns, its `## Log` untouched for 44 minutes
and no verdict appended. The run was killed, and the orchestrator completed the verification by hand
and appended the `ready` verdict to the Log before landing; the task's front matter records the
takeover as `agent: orchestrator-takeover`, and the Log entry is
`.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:90` (also
`.project/review/wave-4.cycle1.md`).

The verification the orchestrator ran: 56 tests / 56 pass / 0 fail over the four stability suites
(`scripts/stability-capture.test.mjs`, `scripts/stability-measure.test.mjs`,
`extension/stability-narrator.test.mjs`, `scripts/panel-stability.test.mjs`, 16 suites in all);
prettier clean on the two files T004 touched; `npm run check` exit 0 with
`verification gate (structure): pass`; and `npm test` at 1,360 pass / 0 fail / 218 suites, plus user
scope at 60, skills at 628 and the app at 31 files. The app's 31 files are **the run's own reading**:
wave 4's review re-observed the 56/56, the prettier leg and `npm run check` at this head but did not
re-run `npm test`, so 31 files is quoted from the Log rather than watched by a reviewer
(`.project/review/wave-4.cycle1.md`).

Nothing was widened, skipped or re-recorded between the stall and the landing, and the ledger row was
written from that run — `.project/build/verify-ledger.jsonl:4` reads `"result": "pass"` at
`46abef82`.
The three artefacts the stalled run had already written are the ones that landed: `git show --stat
46abef82` reports the same three paths plus the task file, and no fourth.

## Verification

Read at `c258d440`, the head this review is written against; the rows below are the wave-1–4 readings
at the heads they name, and wave 5's own legs — `node --check`, the four stability suites at 60/60 over
16 suites, `prettier --check` and `npm run check` — are recorded in
`.project/review/wave-5.cycle1.md`.

| Reading | Observed | Where |
| ------- | -------- | ----- |
| `npm run check` | exit 0, `verification gate (structure): pass`, `All matched files use Prettier code style!` | re-observed by the wave-4 review; ledger row 4 |
| four stability suites | tests 56 / suites 16 / pass 56 / fail 0 | wave-4 review, re-observed at this head |
| `npm test` — node leg | 1,360 pass / 0 fail / 218 suites | T004 Log `:90` |
| `npm test` — user scope | 60 pass / 9 suites | T004 Log `:90` |
| `npm test` — skills | 628 pass / 0 fail | T004 Log `:90` |
| `npm test` — app | 31 files passed | T004 Log `:90`; the run's own reading, not re-run |
| unarmed capture | sha256 `3b0cfc3a69778cfd6e361eb729130a63c7220f7c95bfd400caa40082c0d8fdfa` before and after, 24,652 bytes | wave-4 review; `scripts/stability-capture.test.mjs:795-800` |
| panel initial total | 535.067 kB measured over 9 eager files against `PRE_MILESTONE_INITIAL_KB = 535.44`, margin 0.373 kB | `.project/tasks/T003-panel-surface-for-the-stability-state.md:88`; `scripts/panel-bundle-budget.test.mjs:81` |

The capture's byte-identity is not an absence of evidence bundled as evidence: a default run prints
the recording's hash at load and after the run, asserts they are equal, names the one file an armed
run would write and proves from its own source that it spawns nothing, writes nothing and names no
browser or port (`scripts/stability-capture.test.mjs:714`, `:795-800`, `:814-828`). Armed, T001's
derivation — which owns every section — was run twice at this head and produced the same bytes both
times (`.project/tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md:85`).

The panel's margin narrowed with the route entry and it is real: 0.373 kB of the 0.44 kB that
remained before it, measured after the entry landed (wave 3), inside the unraised baseline of
535.44 kB (`scripts/panel-bundle-budget.test.mjs:81`, its test at `:441`; the second budget suite at
`scripts/image-budget.test.mjs:92`).

## What a reader should distrust

- **What wave 5 settled is one route on one fixture, not a browser session of subjects.** The
  recording states it in its own limits: one page, one browser, one fixture at this head, and the
  three reproductions are the same drive repeated rather than three pages
  (`research/raw/m043-settle-page.json:1145`). Of the six routes surveyed, `/lazy` is the only one whose
  settle moved after attach (`:783-1033`), so SC1's unstable half and SC2's positive half are measured on
  one fixture and nowhere else, and the page still answers nothing about a cause, an inventory or an
  order (`research/raw/m043-stability.json:511-516`). What the drive does *not* prove is a second page
  producing its own transition in the same session: the two-page E11 proof remains two `node:vm`
  contexts in one process, not two browser tabs (`scripts/stability-capture.test.mjs:14`;
  `.project/research/SYNTHESIS.md:243-249`).
- **The portal's zoneless target may be permanently stable, and nobody has read it.** The intent's
  first open question is unanswered at archive time (`.project/intent/INTENT.md:247-249`;
  `.project/research/SYNTHESIS.md:234-241`). If that target is permanently stable, SC1's unstable half
  is only ever the counter fixture, and a portal drive would return `no-settle-observed` where SC2
  wants a transition — an answer, but not the one SC2's positive half needs. No row of the claim list
  claims a portal drive (`research/raw/m043-verdict-claims.json:27-35`).
- **The two-realm E11 proof is two `node:vm` contexts, not two browser tabs.**
  `scripts/stability-capture.test.mjs` boots the shipped agent twice, in two contexts each with its
  own `ng`, `document`, clock and record list, because that is the two-page session this repository
  can drive with no browser and no port. The suite says so in its header (`:14`) and the synthesis
  names the difference rather than letting the word "session" hide it
  (`.project/research/SYNTHESIS.md:243-249`). A browser-tab drive of the same two subjects is not
  proven.
- **The app's 31 files are a quoted reading, not a watched one.** The takeover run measured them; no
  reviewer re-ran `npm test` at this head (`.project/review/wave-4.cycle1.md`). The other legs of that
  gate were re-observed.
- **The synthesis predates these reviews.** `.project/research/SYNTHESIS.md` was written in wave 4 and
  records that `.project/review/` did not exist at its head (`:3-15`), so its account is drawn from the
  four task files' Logs and the ledger. The wave reviews cited above were written afterwards, and
  where the two disagree on a number the ledger row and the recording's own bytes are what this review
  used.

## Closing

The milestone is landed and its gate is green at `c258d440`, and this review calls it passed:
six criteria are met, and the one wave 4 could not
close was closed at wave 5 by a drive on an inspected page rather than by a wider reading of the same
evidence. What is left behind is narrower than the roadmap's
sentence and more useful than it: a record that carries a stability reading beside the work that ran, a
pure function that turns it into a state, a settle interval and a pass list without reading a clock, a
pane that renders those three and nothing else, three named absences where the roadmap asked for a
cause, an inventory and an order — and a measurement of its own instability that answers `transition-observed` from the
two readings the page published instead of inferring the transition it was asked for.
