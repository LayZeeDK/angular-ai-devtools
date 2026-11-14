# Plan — M043 stability-explainer

Milestone: stability-explainer
Branch: gsd-path/M043
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: full
- finding_skeptics: on

## Success criteria

The six criteria this plan answers, quoted from `.project/intent/INTENT.md` character for character — the same text `research/raw/m043-verdict-claims.json` rules in wave four, parsed from the intent rather than retyped.

### SC1 — The stability state is reported for each inspected page from that page's own `ApplicationRef.isStable`, reached by the injector read the agent already performs for `Router` and from nothing else: on the counter fixture's `/resource-states`, whose never-settling `resource()` takes a pending task for the page's lifetime (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`; `_resource-chunk.mjs:404`), the finding reports the app unstable and names the emission it read; on a page whose `isStable` has emitted `true` it reports stable from that emission; and a page exposing no reachable `ApplicationRef`, or an `isStable` that cannot be subscribed, is cannot-tell with the named absence `no-stability-observable`, never stable and never a zero count.

### SC2 — The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one.

### SC3 — The work that ran while the app was unstable is reported as the frames the page recorded, and repetition is read from the frame's own `events` list and nothing else: two `TemplateUpdate` start/end pairs inside one `checks` row are reported as two passes over that component, a second `ChangeDetection` pair carrying `componentName: null` is reported as a second change-detection pass attributed to no component, and a frame holding one pair reports one; no per-view cycle count, no outstanding-work count and no pass the `events` list does not hold is ever reported.

### SC4 — Every question the page cannot answer is cannot-tell with its own named absence and no guessed value: the cause is `no-cause-reported`, because `isStable` is a boolean stream (`_debug_node-chunk.mjs:13221-13222`); the outstanding items, their count, their kind and their owner are `no-outstanding-inventory`, because `PendingTasksInternal` holds a `Set<number>` whose `add()` takes no descriptor (`_pending_tasks-chunk.mjs:2304-2312`); the first item to settle and any per-item order are `no-settle-order`, because no timestamp and no settle time crosses any API; and no absence is ever filled from a task id, an epoch delta, a signal-graph label, a component name or a creation stack.

### SC5 — The panel surface renders the state, the settle time or its named absence, and the repeated-work reading, each in its own block, and renders nothing else: no sentence names a cause, no list names an outstanding item or its owner, no column orders work by settle time, the surface is registered in the route table that carries no stability route today (`apps/angular-ai-devtools/src/app/app.routes.ts:17-160`), and asked for a page it has no stability answer for it renders `no-stability-observable` rather than an empty table or an em dash.

### SC6 — Stability is reported as a measurement and never as the absence of a report: a page whose change-detection record has gone silent but whose `isStable` reads `true` reports stable with the reading that says so, a page whose record is silent and whose stability was never read reports `no-stability-observable`, and no surface renders stable on the strength of a quiet interval, an empty finding set or the record's silence — the failure mode the roadmap's own risk line names (`.project/ROADMAP.md:1587`), measured in the agent's shape, which dispatches one snapshot at install and thereafter only frames (`extension/agent-main.js:566,1418-1448,1038-1060`).

## Wave 1 — measure what a page can say about its own stability, and put that read on the record before anything answers for it

Goal: replace the plan's inherited premises — that the injector read which resolves `Router` also resolves `ApplicationRef`, that the fixture's `/resource-states` is unstable, and that an unstable-to-stable transition exists to be read — with measurements taken at this head, and carry the stability read on the record the agent already dispatches so that every later task quotes a reading rather than the intent's sentence.

Review depth: full

Three things the milestone depends on are unmeasured, and each one decides a later task's shape. The reach: `ApplicationRef.isStable` is a getter over `hasPendingTasksObservable` (`_debug_node-chunk.mjs:13221-13222`), and the intent says the agent's `Router` read reaches it — but reaching `Router` by token name and reaching `ApplicationRef` by token name are two different walks, and nothing at this head has driven the second. If the walk finds no record, the milestone's only honest answer is a named absence, and the plan has to know that before T002 writes the reader that produces it. The currency of one subscription is the intent's own open question and is still open: the getter builds a fresh `map` pipe per access, so whether one subscription stays current through later `add()`/`remove()` flips is exactly what decides whether the agent subscribes once or reads per record, and a plan that assumed either would write the wrong record. And the transition: `LoadingResource`'s loader returns `new Promise<never>(() => {})` which nothing resolves (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`), so `/resource-states` is unstable for the page's lifetime — the positive half of SC1 is installed already, and the fixture cannot start and end a task on that route. SC2's positive half may therefore have to come from a subject other than `/resource-states`, and whether one exists is a measurement, not a plan decision.

The record is the milestone's only page-side artefact, and no shipped file publishes one: `isStable`, `whenStable`, `PendingTasks` and `ApplicationRef` are absent from all 32 authored scripts under `extension/`, so a reader written against an assumed record would read fields nobody writes — the defect three earlier milestones found at a landing gate. This wave therefore both measures and publishes: it adds one additive `stability` section beside `events`, `routerEvents`, `boundary` and `checks`, reached from the injector read the `Router` reach already performs, and it records at this head what that section carries on each subject it can drive. The edit is kept line-neutral, because `research/raw/m039-render-phase.json`, `m040-work-events.json`, `m041-navigation.json` and `m042-error-boundary.json` cite `extension/agent-main.js` by line and every suite declared here anchors one of those citations; every one of them is declared here and either proven unmoved by running it or re-cut with the failing assertion quoted.

### T001 — Measure the stability surface and carry it on the page agent's record

- Deps: none
- Files: `extension/agent-main.js`, `extension/agent-main.test.mjs`, `extension/page-footprint.test.mjs`, `extension/error-boundary.test.mjs`, `apps/angular-ai-devtools/src/app/companion.spec.ts`, `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`, `scripts/performance-measure.test.mjs`, `scripts/render-phase-measure.test.mjs`, `scripts/performance-capture.test.mjs`, `scripts/render-phase-capture.test.mjs`, `scripts/navigation-measure.test.mjs`, `scripts/navigation-capture.test.mjs`, `scripts/error-boundary-measure.test.mjs`, `scripts/error-boundary-capture.test.mjs`, `scripts/stability-measure.test.mjs`, `research/raw/m043-stability.json`
- Intent coverage: SC1, SC2, SC6
- Edges: none
- Acceptance: AC1 the reach is measured, not assumed: the shipped agent's own walk — `ng.getInjector(host)` → `ɵgetInjectorResolutionPath` → `ɵgetInjectorProviders` → the provider record whose `token.name` is `ApplicationRef` → `injector.get(token)` — is driven on a subject whose provider records carry that token and on one whose records do not, and the recording states what `injector.get` returned in each case and what a page without it can still say; AC2 the subscription's currency is measured rather than assumed: one subscription taken through the `isStable` getter is recorded against the `hasPendingTasksObservable`-backed stream it derives from, with the source anchors for the first `add()` and the last `remove()` flip, so T002 may cite a subscription that stays current or the named absence where the read could not be confirmed, and the recording says which; AC3 the read is carried on the record the agent already dispatches — a `stability` section beside `events`, `routerEvents`, `boundary` and `checks` in both the frame record and the initial snapshot — armed from the install path's own answer and never from inside the profiler callback, removed by the reset path, with the profiler still installed once and `ɵsetProfiler(null)` never called; AC4 `/resource-states` is driven and recorded as SC1's positive case with no fixture change, the recording carrying the page's own emission, the reading it was taken from and the unstable state it produces, and the fixture's never-settling loader quoted with the anchors that make the page unstable for its lifetime; AC5 the settle transition is measured and never assumed: the recording states whether any inspected subject produced an unstable-to-stable change while the read was attached, naming the subject and the two `performance.now()` readings where one did, and answering `no-transition-observed` where none did — so SC2's positive half rests on a measurement and its absence is named rather than inferred; AC6 the repeated-work half is re-derived from the frame's own `events` list at this head — a second `TemplateUpdate` start/end pair in one `checks` row and a second `ChangeDetection` pair carrying `componentName: null`, each recorded as the frame emits it — so T002's passes are read from a recording and not from the intent's quotation; AC7 every claim is re-derived from the installed chunk, the agent's own source or the fixture's install, or is quoted as the recording's own measurement with its source named; a default run writes nothing and adds nothing to any page, `M043_CAPTURE=1` arms the drive, a second armed run at the same head changes no byte, and a missing build or install fails by naming the path it wanted rather than skipping; AC8 every suite that reads `extension/agent-main.js` as its own subject still holds its anchors — `prevEpochs.set(instance, next);` at line 1034, `function closeCycle()` at line 1038 and the router reach at `extension/agent-main.js:1750-1839` among them — or is re-cut where the added section moves what it asserts with the failing assertion quoted, and the page footprint bound still holds
- Verify: `node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --check scripts/stability-measure.test.mjs && node --experimental-strip-types --test "scripts/stability-measure.test.mjs" "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "extension/error-boundary.test.mjs" "scripts/performance-measure.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-capture.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-capture.test.mjs" "scripts/error-boundary-measure.test.mjs" "scripts/error-boundary-capture.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/stability-measure.test.mjs scripts/error-boundary-measure.test.mjs scripts/error-boundary-capture.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts research/raw/m043-stability.json && npm run check`
- Held-out: none; E1 to E11 are T002's, T003's and T004's and this task must not redden them

## Wave 2 — mint the three readings and the four absences from the record, with no page and no clock

Goal: turn one frame — the `stability` section T001 publishes and the `events` list the agent has always dispatched — into the state, the settle reading or its named absence, the repeated-work reading, and the absences no page can answer, so that each answer is provable without a browser and no surface has to interpret a record.

Review depth: full

T002 is the milestone's whole claim, and it is one pure function over the record it is handed: that is what makes the eight held-out pins provable against recorded frames instead of against a page, and what keeps the pane a view. Four answers have to be exactly right. The state is the emission: a boolean stream carries no reason, so a reader that filled a cause from a neighbouring field — a task id, an epoch delta, a signal-graph label, a component name — would be the defect SC4 exists to prevent, and the intent's prohibition says so in the same words. The settle time is the difference of two readings the page published, and a reader holding no clock cannot produce one: a duration taken from the record's quiet tail or from the interval between two frames is exactly what SC2 forbids, and a measured `0` has to survive as `0` rather than be read as falsy. The repeated work is the `events` list and nothing else: two `TemplateUpdate` start/end pairs in one row are two passes over that component, a second `ChangeDetection` pair is a second pass attributed to no component, and a frame holding one pair reports one — never a per-view cycle count and never an outstanding-work count. And the absences are values rather than missing fields, each with its own name, because a reader that answered an empty list where the page has no inventory would be reporting zero outstanding items.

The suite is written against the record T001 wrote, so a reader written for fields the agent does not publish reddens here rather than in a browser. Non-vacuity is the discipline: each held-out pin is proven by a mutant that names its defect by string, so a pin that cannot fail is visible as one.

### T002 — Join a stability record into the state, the settle reading and the repeated work

- Deps: T001
- Files: `extension/stability-narrator.js`, `extension/stability-narrator.test.mjs`
- Intent coverage: SC1, SC2, SC3, SC4, SC6
- Edges: E1, E2, E3, E5, E6, E7, E8, E10
- Acceptance: AC1 held-out E1 — a record whose `isStable` emitted `false` answers unstable and one whose emission was `true` answers stable, both decided by the emission alone, and neither verdict moves with the presence or absence of a record frame; the answer names the emission it read, its value and the page's own reading; AC2 held-out E2 — a record with no reachable `ApplicationRef` and one whose `isStable` could not be subscribed both answer cannot-tell with the single named absence `no-stability-observable`, with no state word beside it and no zero standing in for it, the two causes being one absence rather than a count; AC3 held-out E3 — a page already stable at attach, a transition that happened before attach and a page that never settles each answer `no-settle-observed` carrying no time field, while a settle whose interval is `0` answers a settled reading with `sinceAttachMs: 0` and is never that absence, the interval being the difference of the two readings the record carries and of nothing else; AC4 held-out E5 and E6 — two `TemplateUpdate` start/end pairs in one frame answer two passes over that component, one pair answers one, a second `ChangeDetection` pair carrying `componentName: null` answers a second pass attributed to no component, and a frame that recorded no paired work answers no pass at all, the absence of a frame never becoming a pass count or an outstanding count; AC5 held-out E7 — `no-cause-reported`, `no-outstanding-inventory`, `no-settle-order` and `no-stability-observable` stay four distinct absences, one per unanswered question, each with its own name, and none of them ever answers zero outstanding items; AC6 held-out E8 — a record from an app that opted into `provideStabilityDebugging()` contributes no component name, no call site and no task id, and its answer stays `no-outstanding-inventory`; AC7 held-out E10 and the reader's purity — the same silent record read twice answers the same state and the same measurement, silence alone never turns cannot-tell into stable, a state word the reader was not written for is passed through rather than coerced, and the module reads no clock, no DOM, no page and no second tap, proven from inside a context where each of those is a trap that throws naming itself; AC8 each held-out pin is proven non-vacuously by a mutant that names its defect by string
- Verify: `node --check extension/stability-narrator.js && node --check extension/stability-narrator.test.mjs && node --experimental-strip-types --test "extension/stability-narrator.test.mjs" && npx prettier --check extension/stability-narrator.js extension/stability-narrator.test.mjs && npm run check`
- Held-out: E1, E2, E3, E5, E6, E7, E8 and E10, all eight in `extension/stability-narrator.test.mjs`, each pin proven non-vacuously

## Wave 3 — render the three answers in three blocks, register the route and re-cut every pin the registration moves

Goal: render the answer the join produced — the state and the emission it was read from, the settle time or its named absence, the repeated-work reading and each named absence in its own cell — register the route through the shared loader, and re-cut every pin the registration moves, including the suites that enumerate the route table and the guards that keep the fixture and the initial total untouched.

Review depth: full

T003 follows the panel family exactly: one exported function answering state, message, lines, text, cells and blocks, handed the join's answer and rendering only what that answer carried, using the baseline stylesheet's hooks and adding no global CSS. SC5's criteria are about a pane that renders nothing else: no sentence naming a cause, no list naming an outstanding item or its owner, no column ordering work by settle time, and `no-stability-observable` rather than an empty table or an em dash for a page with no stability answer. A measured settle of `0` prints as `0`; a settle the answer named absent prints the absence and no time and no duration.

Registering the route is where earlier milestones lost a gate cycle, so every pin the registration moves is declared here rather than repaired later. Five tables enumerate the route table in the app's own specs — the app suite's ordered path list, the chat-entry suite's two ordered lists, the picker's lazy list, the demo suite's loader key and sample fact — and `scripts/panel-routes.test.mjs` enumerates the surfaces, the export map, the direct-call list and the loader-removal mutant; `tests/held-out/fixture-explainers-unchanged.test.mjs` pins the same table from outside the app and is declared with them. `scripts/panel-styles.test.mjs` enumerates no route: it measures the baseline stylesheet against the markup the demo already emits, so it is declared as a guard that must be proven unmoved rather than claimed as a pin the registration cuts. The panel measures 535.00 kB against the recorded 535.44 kB baseline, so 0.44 kB of headroom is all one route entry has: the entry must reference the shared `loadPanelDemo` loader and add no second copy of the dynamic import, and the two budget suites are declared with it.

### T003 — Panel surface for the stability state, the settle reading and the repeated work

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-stability.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-stability.test.mjs`, `scripts/panel-routes.test.mjs`, `scripts/panel-styles.test.mjs`, `scripts/panel-bundle-budget.test.mjs`, `scripts/image-budget.test.mjs`, `scripts/after-render-fixture.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`
- Intent coverage: SC5
- Edges: E9
- Acceptance: AC1 held-out E9 — the pane renders its three blocks and every named absence, and asked for a cause, an outstanding item, an owner or an order it renders that absence in its own sentence rather than an empty list or a dash; AC2 each state renders its own text and no other's, a state word the pane was not written for renders as that word and nothing else, and a page it has no stability answer for renders `no-stability-observable` rather than an empty table or an em dash; AC3 a settle measured as `0` renders `0`, a settle the answer named absent renders that absence with no time and no duration, and the pane prints no interval the answer did not carry; AC4 the repeated-work block prints one line per repeated pass the answer carried and nothing beside it — no per-view cycle count, no outstanding-work count and no pass the frame's events do not hold — and a frame with no repeated work prints the reading it has rather than a zero; AC5 the route, the demo loader key and the sample fact are added, the sample fact being the join's own answer for the recording rather than a value invented for the demo, the route installs the shared `loadPanelDemo` loader with no second copy of the dynamic import, and the pane uses the baseline stylesheet's hooks only, adding no global CSS and no DOM to any inspected page; AC6 every pin the registration moves is re-cut with the failing assertion quoted — the app suite's ordered path list, the chat-entry suite's two ordered lists, the picker's lazy list, the route-table suite's surfaces, export map and loader-removal mutant, and the demo suite's loader key and fact — while `scripts/panel-styles.test.mjs`, which enumerates no route, is proven unmoved by running it and is recorded as a guard rather than as a pin the registration cuts; AC7 the fixture's own table stays byte-identical, the held-out explainer suite stays green, and the panel's measured initial total stays at or below the recorded 535.44 kB baseline, of which 0.44 kB remained before this entry; AC8 a mutant that renders a claim the answer did not carry reddens the pane's pin and names the defect by string
- Verify: `node --check apps/angular-ai-devtools/src/app/panel-stability.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --check scripts/panel-stability.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-stability.test.mjs" "scripts/panel-routes.test.mjs" "scripts/panel-styles.test.mjs" "scripts/panel-bundle-budget.test.mjs" "scripts/image-budget.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-stability.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-stability.test.mjs scripts/panel-routes.test.mjs && npm run check`
- Held-out: E9 in `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, proven non-vacuously; E1 to E8 and E10 are T002's and the route registration must not redden them

## Wave 4 — re-capture behind an opt-in switch, rule the six claims and close the gate

Goal: make the measurement repeatable behind an opt-in switch that writes nothing by default, add the claim list the claims suite resolves this milestone through — each criterion quoted character for character from the intent — and leave the project's own gate green at the head the earlier waves leave.

Review depth: full

Two artefacts the gates read do not exist yet. `scripts/overlay-verdict-claims.test.mjs` resolves the milestone from `.project/STATE.md`'s branch and refuses a missing claim list, so `npm run check` cannot be green without `research/raw/m043-verdict-claims.json`; and every row of it has to quote the intent rather than paraphrase it, because the suite compares the two character for character. And the recording is one tracked file that five suites read, so a suite that rewrote it on every `npm test` would move the working tree under a reviewer: the armed path is armed by `M043_CAPTURE=1` alone, a default run prints the recording's sha256 before and after and asserts they are equal, and a second armed run at the same head changes no byte.

This task also carries the milestone's one criterion that no earlier task could prove: two pages in one browser session, each reporting its own state and its own settle reading, with no emission from one page attributed to the other. That difference is a property of two subjects rather than of a pure function, so it belongs in a capture suite. And it runs last because its remaining criterion is the gate itself — `npm run check` and `npm test` can only be green once waves one to three have landed.

### T004 — Re-capture behind an opt-in switch, rule the claims and close the gate

- Deps: T002, T003
- Files: `scripts/stability-capture.test.mjs`, `research/raw/m043-verdict-claims.json`, `.project/research/SYNTHESIS.md`
- Intent coverage: SC1, SC2, SC3, SC4, SC5, SC6
- Edges: E11
- Acceptance: AC1 a default run writes nothing, prints the recording's sha256 before and after and asserts they are equal, and names every file an armed run would write; AC2 with `M043_CAPTURE=1` every section is re-derived and written in canonical form and a second armed run changes no byte; AC3 no reported value is pinned as a literal — each is re-derived from the installed chunk, the agent's own source or the fixture's install, and a moved source reddens the derivation that names it; AC4 the claim list rules SC1 to SC6, answering each criterion by name and quoting it verbatim from the intent, and every row states its ruling and a reason that answers the charter's portal clause by name, naming its source page, driver, instance and verdict path where a row is required; AC5 held-out E11 — two pages in one browser session each report their own state and their own settle reading, and no stability emission from one page is attributed to the other; AC6 the project gate is green at the head with the claim list present, and the log names every suite in that gate which returned early for a missing build output rather than counting the early return as a measurement; AC7 two mutants redden named assertions naming their defects; AC8 the archive's required synthesis exists at `.project/research/SYNTHESIS.md`, headed as authored at archive time, stating with the record that no research and no decide phase ran, synthesising only artefacts already in the tree and claiming no independent research
- Verify: `node --check scripts/stability-capture.test.mjs && node --experimental-strip-types --test "scripts/stability-capture.test.mjs" "scripts/stability-measure.test.mjs" "extension/stability-narrator.test.mjs" "scripts/panel-stability.test.mjs" && npx prettier --check scripts/stability-capture.test.mjs research/raw/m043-verdict-claims.json && npm run check && npm test`
- Held-out: E11 in `scripts/stability-capture.test.mjs`, proven non-vacuously; E1 to E10 remain T002's and T003's and this task must not redden them

## Held-out checks

| Edge | Task | Test                                |
| ---- | ---- | ----------------------------------- |
| E1   | T002 | extension/stability-narrator.test.mjs |
| E2   | T002 | extension/stability-narrator.test.mjs |
| E3   | T002 | extension/stability-narrator.test.mjs |
| E5   | T002 | extension/stability-narrator.test.mjs |
| E6   | T002 | extension/stability-narrator.test.mjs |
| E7   | T002 | extension/stability-narrator.test.mjs |
| E8   | T002 | extension/stability-narrator.test.mjs |
| E9   | T003 | apps/angular-ai-devtools/src/app/panel-demo.spec.ts |
| E10  | T002 | extension/stability-narrator.test.mjs |
| E11  | T004 | scripts/stability-capture.test.mjs    |

## Intent coverage

| Criterion | Task | Acceptance |
| --------- | ---- | ---------- |
| SC1       | T001 | AC1        |
| SC1       | T001 | AC4        |
| SC2       | T001 | AC5        |
| SC3       | T001 | AC6        |
| SC6       | T001 | AC3        |
| SC1       | T002 | AC1        |
| SC1       | T002 | AC2        |
| SC2       | T002 | AC3        |
| SC3       | T002 | AC4        |
| SC4       | T002 | AC5        |
| SC4       | T002 | AC6        |
| SC6       | T002 | AC7        |
| SC5       | T003 | AC1        |
| SC5       | T003 | AC2        |
| SC5       | T003 | AC3        |
| SC5       | T003 | AC4        |
| SC5       | T003 | AC5        |
| SC1       | T004 | AC4        |
| SC2       | T004 | AC5        |
| SC3       | T004 | AC4        |
| SC4       | T004 | AC4        |
| SC5       | T004 | AC4        |
| SC6       | T004 | AC1        |
| SC6       | T004 | AC6        |

## Prohibitions

| Prohibition | Criterion | Task |
| ----------- | --------- | ---- |
| N1          | SC1       | T002 |
| N2          | SC2       | T002 |
| N3          | SC3       | T002 |
| N4          | SC4       | T002 |
| N5          | SC5       | T003 |
| N6          | SC6       | T001 |

## Surface contract

The panel is the only surface.

### panel — T003

Criteria: SC5

Entry: the pane receives the join's answer for the recorded frame, rendered from the demo loader at the panel route the table registers, with the sample fact the recording carries.

States: `idle` before any answer arrives; `unstable` and `stable` from the emission the answer read; `cannot-tell` for a page with no stability answer, carrying `no-stability-observable`; and the three blocks every answered page renders apart — the state, the settle reading or `no-settle-observed`, and the repeated-work reading — with each of `no-cause-reported`, `no-outstanding-inventory`, `no-settle-order` in its own cell.

Walkthrough:

1. `stabilityPanel(answer)` receives the join's `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` and reads no record of its own.
2. The state block prints the state word and the emission it was read from, and no reason for it.
3. The settle block prints the measured interval as its own number, `0` included, or the named absence `no-settle-observed` with no time and no duration beside it.
4. The repeated-work block prints one line per repeated pass the answer carried, and prints nothing where the frame recorded no paired work.
5. Each named absence prints in its own cell with its own name, and no cell renders an empty string, a zero outstanding count or a cause.
6. Where the answer names a state the pane was not written for, the pane renders that state word and nothing else.
7. No block orders work by settle time, and no sentence names an owner, a task id or a stack.

## Wave 5 — drive the settle on an inspected page, so SC2's transition half rests on a page rather than a realm

Patch wave, added at `46abef82` from the blocked final review
(`.project/review/PATCH-FINDINGS.md`, F1). It adds evidence and no behaviour.

Review depth: full

Goal: Produce one inspected-page reading in which the stability read emits a
change from unstable to stable after attach, so SC2's transition half rests on
a page rather than a `node:vm` realm — or, if no page here can produce it,
record that on a page with the measured reason.

### T005 — Drive a settle on an inspected page and record what the page reports

Files: `.project/tasks/T005-drive-a-settle-on-an-inspected-page.md`,
`research/raw/m043-settle-page.json`, `scripts/stability-page-settle.test.mjs`.

Drives an inspected page under an attached stability read, starts and finishes
a pending task after attach — the named candidate is a router navigation on a
stable route — and records what the page emitted in
`research/raw/m043-settle-page.json`, pinned by
`scripts/stability-page-settle.test.mjs`.

Success criteria this wave carries: SC2 alone. Five criteria are met at
`46abef82`; nothing else is re-opened.

Acceptance criteria

1. The recording states either a page-produced transition with both readings
   (`settle.at > attachAt`) or a measured reason it could not be produced.
2. It carries the route, the attach reading, the settle reading and the
   emission sequence, each cited to the source that produced it.
3. The suite pins the reading and carries real mutants: a settle time taken
   from the attach reading, a transition claimed where the page emitted
   nothing, an interval taken from the record's quiet tail.
4. The join's behaviour is proved against the new recording, and the four
   stability suites stay green.
5. No file under `extension/`, `apps/` or `spikes/ng222-app/` changes — this is
   evidence, not behaviour, and no fixture is touched.

## Dependency notes

- T001 to T002: the reader is handed the record T001 publishes, so the record's field names are the reader's whole input; T001's recording is what the held-out pins are driven against, and the interface contract both tasks carry is the text a reviewer compares when they disagree.
- T002 to T003: the pane is handed the join's answer and reads no record, so the answer's field names are the pane's input; the identical pane bullet in both files is what a reviewer checks when the two disagree.
- T002, T003 to T004: T004's capture suite re-derives the recording T002's pins and T003's sample fact both read, and adds the claim list that lets the claims suite resolve this milestone at all; without T003's sample fact there is no recorded answer for the re-capture to hold the pane to.
- T003 to T004 (bundle): T003 registers the route whose bytes the initial total pays for, and T004's gate measures that total, so the surface must land inside the baseline before the gate is asked to be green.
