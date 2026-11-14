# Archive — 043-stability-explainer

Milestone: stability-explainer
Shipped: 2026-11-14
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 5 done / 5 total  Review cycles used: 1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The stability state is reported for each inspected page from that page's own `ApplicationRef.isStable`, reached by the injector read the agent already performs for `Router` and from nothing else: on the counter fixture's `/resource-states`, whose never-settling `resource()` takes a pending task for the page's lifetime (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`; `_resource-chunk.mjs:404`), the finding reports the app unstable and names the emission it read; on a page whose `isStable` has emitted `true` it reports stable from that emission; and a page exposing no reachable `ApplicationRef`, or an `isStable` that cannot be subscribed, is cannot-tell with the named absence `no-stability-observable`, never stable and never a zero count. | met | extension/stability-narrator.js:166-175` (`readingOf`) and `:180-188` (`stateOf`, the absence word read before anything else); `extension/stability-narrator.test.mjs:1312` (E1), `:1326` (E2); `research/raw/m043-stability.json:33-39` (the token), `:40-66` (the five steps and their lines), `:67-94` (the two subjects); `extension/agent-main.js:2285` (`var STABILITY_TOKEN_NAME = 'ApplicationRef';`), `:2388` (the getter read), `:1052` and `:1442` (the section on both record shapes); `.project/review/wave-2.cycle1.md`. |
| The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one. | met | scripts/stability-page-settle.test.mjs:763-824` (the pin: `settle.at` after `attachAt`, and the two arrivals that held the task), `:812-823` (the `RouteConfigLoadEnd`/`NavigationEnd` assertions), `:594-621` and `:877` (the quiet-tail mutant, reddening by name), `:995-1055` (the control, the measured `0`, and why a navigation after a settle cannot carry the transition), `:1057-1118` (the survey partition), `:1120-1141` (the recording is its own derivation; a drifted byte reddens it); `research/raw/m043-settle-page.json:1036-1078` (derived attach, settle, sequence, transition and quiet tail), `:49-61` and `:275-287` (the two arrivals), `:702-782` (the control), `:783-1033` (the survey), `:1079-1140` (twelve citations held to a `path:line`), `:1141-1146` (the limits, the control's correction at `:1144`); `extension/stability-narrator.js:194-207`; `extension/agent-main.js:2337-2347`; `.project/build/verify-ledger.jsonl:5`; `.project/review/wave-5.cycle1.md`. |
| The work that ran while the app was unstable is reported as the frames the page recorded, and repetition is read from the frame's own `events` list and nothing else: two `TemplateUpdate` start/end pairs inside one `checks` row are reported as two passes over that component, a second `ChangeDetection` pair carrying `componentName: null` is reported as a second change-detection pass attributed to no component, and a frame holding one pair reports one; no per-view cycle count, no outstanding-work count and no pass the `events` list does not hold is ever reported. | met | extension/stability-narrator.js:212-222` (`readEvent` reads `pair`, `end` and `componentName`), `:226-229` (`eventsOf`), `:237-271` (`repeatsOf`), `:257-260` (attribution falls through to no component); `research/raw/m043-stability.json:303-317` (`inOneCheckRow: 2`, `checkRowEvents [2,3,2,3]`), `:318-325` (`nullComponentNames: 4`, `inAnyCheckRow: false`), `:326` (the entry shape); `apps/angular-ai-devtools/src/app/panel-stability.ts:291-305`; `research/raw/m043-verdict-claims.json:36-44`. |
| Every question the page cannot answer is cannot-tell with its own named absence and no guessed value: the cause is `no-cause-reported`, because `isStable` is a boolean stream (`_debug_node-chunk.mjs:13221-13222`); the outstanding items, their count, their kind and their owner are `no-outstanding-inventory`, because `PendingTasksInternal` holds a `Set<number>` whose `add()` takes no descriptor (`_pending_tasks-chunk.mjs:2304-2312`); the first item to settle and any per-item order are `no-settle-order`, because no timestamp and no settle time crosses any API; and no absence is ever filled from a task id, an epoch delta, a signal-graph label, a component name or a creation stack. | met | extension/stability-narrator.js:74-77` (the four names), `:81-86` (the order), `:91-95` (the permanent three), `:115-123` (one sentence each), `:288-295` (`absencesOf`); `extension/stability-narrator.test.mjs:1534` (E7), `:1589` (E8); `research/raw/m043-stability.json:157-168` (the `Set` of ids and the `add()` that takes no descriptor), `:168` and `:173` (no per-item order), `:171-173` and `:504-510` (the absences and the chunk each rests on); `research/raw/m043-verdict-claims.json:45-53`. |
| The panel surface renders the state, the settle time or its named absence, and the repeated-work reading, each in its own block, and renders nothing else: no sentence names a cause, no list names an outstanding item or its owner, no column orders work by settle time, the surface is registered in the route table that carries no stability route today (`apps/angular-ai-devtools/src/app/app.routes.ts:17-160`), and asked for a page it has no stability answer for it renders `no-stability-observable` rather than an empty table or an em dash. | met | apps/angular-ai-devtools/src/app/panel-stability.ts:404` (`stabilityPanel`), `:129` (`READING_BLOCKS = ['state', 'settle', 'repeats']`), `:423-427` (the assembly), `:440-444` (one block per carried absence), `:390-396` and `:409` (the no-answer pane), `:251-277` (the settle block); `apps/angular-ai-devtools/src/app/app.routes.ts:14` (the shared loader) and `:167-169` (the entry); `apps/angular-ai-devtools/src/app/panel-demo.ts:341-351` (the sample fact); `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1567`, `:1652` (E9); `scripts/panel-routes.test.mjs:330-343`, `:633-651`; `research/raw/m043-verdict-claims.json:54-62`. |
| Stability is reported as a measurement and never as the absence of a report: a page whose change-detection record has gone silent but whose `isStable` reads `true` reports stable with the reading that says so, a page whose record is silent and whose stability was never read reports `no-stability-observable`, and no surface renders stable on the strength of a quiet interval, an empty finding set or the record's silence — the failure mode the roadmap's own risk line names (`.project/ROADMAP.md:1587`), measured in the agent's shape, which dispatches one snapshot at install and thereafter only frames (`extension/agent-main.js:566,1418-1448,1038-1060`). | met | extension/stability-narrator.js:158-161` (`sectionOf`), `:180-188` (`stateOf`), `:91-95` (`PERMANENT_ABSENCES`); `extension/stability-narrator.test.mjs:1639` (E10); `apps/angular-ai-devtools/src/app/panel-stability.ts:390-396`, `:404-427`; `scripts/stability-capture.test.mjs:795-800` (the byte-identity pin), `:996-1005` (E11 and the shared-list mutant); `research/raw/m043-stability.json:422-432` (the silent frame) against `:433-443` (the absent one); `research/raw/m043-verdict-claims.json:63-71`; `.project/build/verify-ledger.jsonl:4`. |

## Contents

- build/in-flight.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/PATCH-FINDINGS.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-the-stability-surface-and-carry-it-on-the-record.md
- tasks/T002-join-a-stability-record.md
- tasks/T003-panel-surface-for-the-stability-state.md
- tasks/T004-re-capture-rule-the-claims-and-close-the-gate.md
- tasks/T005-drive-a-settle-on-an-inspected-page.md

## Notes

- none
