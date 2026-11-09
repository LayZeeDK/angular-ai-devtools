# Plan — M042 error-boundary

Milestone: error-boundary
Branch: gsd-path/M042
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — measure the three facts the plan depends on, before any task answers for them

Goal: replace the plan's three inherited premises — the shipped instrument's throw, the hook record the fixture's core yields at this commit, and what a page can say about its own core version — with measurements taken at this head, so that the repair, the record shape and the version obligation are written against readings rather than against the intent's quotations.

Review depth: full

Every later task quotes one of three readings. The throw at `extension/agent-main.js:1034` was measured once, during S10, by observing it happen; that observation says the error appears twice per page but not which emission produces it, and the plan's repair has to know. The hook record's two `details` shapes were measured once in a browser tab that no longer exists, and the record shape T003 writes must be the one this commit's core actually emits. And the version obligation in the intent's scope rests on a caveat that nobody has turned into a discriminator: this repository installs 22.1.8 while the targets run 22.2.2, and the only honest question is whether a page can be asked which of the two it runs. A plan that assumed an answer to any of the three would write a record shape the runtime does not emit, or a version gate nobody can evaluate.

### T001 — Measure the instrument's throw, the hook record and the version discriminator

- Deps: none
- Files: `scripts/error-boundary-measure.test.mjs`, `research/raw/m042-error-boundary.json`
- Intent coverage: SC1, SC6
- Edges: none
- Acceptance: AC1 the throw is reproduced deterministically inside the suite at this head, by driving the shipped agent's own profiler subscriber with the instance shape that provokes it, and the run records the error's constructor and message, the emission that produced it, whether the frame record reached the page's dispatch, and which of the two per-page occurrences the reproduction stands for; AC2 the epoch record the repair must preserve is measured at this head — what `prevEpochs` keys by, what each per-check `changedNodeIds` list contains when a node's epoch moves, and what a reader sees where no record exists — so that a repair which deletes, empties or constant-folds that list is contradicted by the recording rather than by a reviewer's opinion; AC3 the hook record is re-read at this head from the fixture's installed core at 22.2.2 and from this repository's own install at 22.1.8: the two `details` shapes and the fields each carries, the `@error` view's own context keys, and the exact absence of the boundary machinery in the 22.1.8 install, each quoted with its own source anchor; AC4 the page-observable version discriminator is measured by enumeration rather than assumed — the published debug surface's key list, the resolved handler's own keys and its class source, and the injector provider records for the handler token — on both installs, and the recording states whether a page can report its own core version at all and, where it cannot, what evidence is left; AC5 every claim is re-derived by the suite from the installed chunk, the agent's own source or the fixture's install, or is quoted as the recording's own measurement with its source named, and the run writes nothing, adds nothing to any page, and fails by naming a missing install rather than skipping
- Verify: `node --check scripts/error-boundary-measure.test.mjs && node --experimental-strip-types --test "scripts/error-boundary-measure.test.mjs" && npx prettier --check scripts/error-boundary-measure.test.mjs research/raw/m042-error-boundary.json && npm run check`
- Held-out: none; E12 and E13 are T002's and this task must not redden them.

## Wave 2 — stop the instrument throwing into the channel it reads

Goal: give the epoch record a key guard so a check whose identity is not an object is recorded as having no epoch entry instead of throwing out of the frame's microtask, while the record still names every changed epoch it named before the repair.

Review depth: full

T002 is first among the product changes because the defect it removes pollutes the surface the rest of the milestone builds: an agent-thrown `TypeError` lands in the app's own `ErrorHandler` and in the page's error listener, which is exactly where the boundary finding is read from. The repair is a guard on the key and nothing else. The intent's prohibition N6 forbids buying the absence by removing, disabling or emptying the epoch-change record the line protects, so the task carries both halves in one pin: the throw is gone, and a changed epoch is still named. T001 measured the emission and the record's contents, so the assertion can be derived from the recording instead of written to fit whatever the repair turned out to be.

### T002 — Stop the page agent throwing into the app's error handler

- Deps: T001
- Files: `extension/agent-main.js`, `extension/agent-main.test.mjs`, `extension/page-footprint.test.mjs`, `scripts/performance-measure.test.mjs`, `scripts/render-phase-measure.test.mjs`, `scripts/performance-capture.test.mjs`, `scripts/render-phase-capture.test.mjs`, `scripts/navigation-measure.test.mjs`, `scripts/navigation-capture.test.mjs`, `apps/angular-ai-devtools/src/app/companion.spec.ts`, `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`, `research/raw/m042-error-boundary.json`
- Intent coverage: SC6
- Edges: none
- Acceptance: AC1 the throw cannot happen: for a check whose identity is not an object the agent records no epoch entry and never writes one, and the frame record still reaches the page's dispatch, proven by booting the shipped file through the same subscriber drive that reproduced the throw before the repair; AC2 the epoch record still does its work — an object identity whose node epoch moved records that node's id in its own list, a node whose epoch held is not named, and the list is never emptied, skipped or replaced by a constant; AC3 held-out E12: a page load and a reload each record zero agent-thrown TypeErrors, and the epoch record still names every changed epoch id it named before the repair; AC4 held-out E13: two loads captured in one browser session each record zero agent-thrown errors, and no epoch change is attributed to the other page's instance; AC5 the repair is a guard, not a silencing — the map is still written for every object identity, cleared only by the reset path, `ɵsetProfiler(null)` is never called, and the agent still installs exactly one profiler subscriber; AC6 every suite that reads this file's source as its own subject is re-cut where the guard moves what it asserts, each with the failing assertion quoted, or is proven unmoved by running it, and the page footprint suite's bound still holds
- Verify: `node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/performance-measure.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-capture.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-capture.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/performance-measure.test.mjs scripts/render-phase-measure.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts && npm run check`
- Held-out: E12 and E13, both in `extension/agent-main.test.mjs`, each pin proven non-vacuously.

## Wave 3 — carry the boundary hook's record beside the two subscriptions already there

Goal: widen the one page agent to the boundary hook and the after-the-fact view read, additively and beside the profiler and router subscriptions, recording plain data in one entry shape, the route each error arrived by, and the version the surface can work against — and answering a named absence rather than an empty list on a page it cannot confirm.

Review depth: full

The record is the milestone's whole evidence base, so its shape is a design decision and not an implementation detail. Three things decide it. The hook is installed on the resolved handler instance the app already uses, so an app that defines its own `onViewError` must never have it overwritten, and the installation must sit beside the profiler subscription rather than inside its callback. The record is plain data by construction, and the error travels as its own name, message and cause rather than as an instance, because the message boundary is serialized. And a page whose core cannot be confirmed to carry the machinery answers a named absence: the intent's scope makes that an obligation, and T001 measured what evidence a page leaves, so the record says what was observed and never infers a version it could not read.

### T003 — Carry the boundary hook's record beside the profiler and router subscriptions

- Deps: T002
- Files: `extension/agent-main.js`, `extension/agent-main.test.mjs`, `extension/page-footprint.test.mjs`, `scripts/performance-measure.test.mjs`, `scripts/render-phase-measure.test.mjs`, `scripts/performance-capture.test.mjs`, `scripts/render-phase-capture.test.mjs`, `scripts/navigation-measure.test.mjs`, `scripts/navigation-capture.test.mjs`, `apps/angular-ai-devtools/src/app/companion.spec.ts`, `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`, `research/raw/m042-error-boundary.json`
- Intent coverage: SC2, SC5
- Edges: none
- Acceptance: AC1 the hook is installed beside the profiler and router subscriptions and never inside either: one definition on the handler the page resolves, removed by the reset path, an app-declared `onViewError` never overwritten, and `ɵsetProfiler(null)` never called; AC2 a caught error is recorded as its own `name`, `message` and — only where the boundary wrapped a value that is not Error-like — its `cause`, with no text read from the rendered error view and no instance, element, function or renderer object crossing the message boundary; AC3 the record names the route each error arrived by, distinguishing a hook record that carried details from a handler delivery that carried none, and names whether the subject declares the browser global error listeners, so the two outcomes SC5 separates are readable from the record alone; AC4 the record reads the two details shapes by the fields each carries, requires no field the other's shape omits, and travels one entry shape so no surface has to know an event number; AC5 the record carries the version the surface can work against as the constant T001 measured, `coreVersion` is `null` where the page reports none, and a page that cannot be confirmed to carry the machinery answers a named absence rather than an empty boundary list; AC6 a handler that cannot be resolved, or one that refuses the hook, is recorded as its own named absence and never as an empty caught list; AC7 two mutants redden named assertions naming their defects: one installs the hook inside the profiler callback, and one overwrites an app-declared `onViewError`; AC8 every suite that derives an anchor from this file is re-cut where the added code moves what it asserts, each with the failing assertion quoted, or is proven unmoved by running it, the page footprint bound holds, and the held-out E12 and E13 pins stay green
- Verify: `node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/performance-measure.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-capture.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-capture.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/performance-measure.test.mjs scripts/render-phase-measure.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts && npm run check`
- Held-out: none; E12 and E13 are T002's and this task must not redden them.

## Wave 4 — the pure join

Goal: turn a recorded boundary section into findings — the two component types apart, the thrown error's own identity, the route it arrived by, and every named absence including the one no reader can fill — so that each answer is provable without a page and no surface has to interpret a record.

Review depth: full

T004 is one pure function over the record it is handed, which is what makes the seven held-out pins provable against recorded frames rather than against a browser, and what keeps the pane a view. Its hardest criterion is the one that answers nothing: the boundary's replaced subtree is recorded nowhere, so the finding must carry the absence and no node, tag, text or count may appear in any field — a reader that reconstructed a plausible subtree from its own knowledge of the app would be the defect SC4 exists to prevent. The remaining precision lives here too: the two component types are separate facts, the fallback is not the error, and an error that arrived without details never names a boundary.

### T004 — Join a boundary record into its identity, the error and the named absences

- Deps: T003
- Files: `extension/error-boundary.js`, `extension/error-boundary.test.mjs`, `research/raw/m042-error-boundary.json`
- Intent coverage: SC1, SC2, SC3, SC4
- Edges: none
- Acceptance: AC1 a caught record names the component whose template threw from `declarationType` and the component that declares the boundary from `details.boundary.type` as separate facts, with `caughtBy` beside them and a reset reported as available only where the record carries one, and a record whose two types are the same type renders it once with no invented parent — held-out E1; AC2 a subject record with no boundary answers cannot-tell with `no-error-boundary-declared`, naming no boundary, no declaring component and no reset, and never an empty string standing in for a boundary — held-out E2; AC3 the finding reports the thrown value's own `name` and `message`, and its `cause` only where the boundary wrapped a value that is not Error-like, while a fallback whose text differs from the thrown message is reported as fallback content and the rendered text appears in no field of the finding — held-out E4 and E6; AC4 an installed hook that caught nothing in the window answers `no-error-caught`, a view reader holding an error with no rendered error view answers `no-error-view-rendered`, and the two absences stay distinct with neither rendered as zero errors — held-out E5; AC5 an error delivered with no details answers `no-boundary-details` with no boundary and no caught-by mechanism, and a record that also carries a boundary is not overwritten by that absence — held-out E7; AC6 the substituted subtree answers cannot-tell with `no-replaced-subtree`, and no node, tag, text or count from the replaced primary view appears in any field of the finding — held-out E8; AC7 every absence the plan carries is answered from the record alone, one absence per answer with its own name, a state the reader was not written for is passed through rather than coerced, and the reader reads only the record it is handed — no clock, no DOM, no page read and no second tap; AC8 each of the seven held-out pins is proven non-vacuously by a mutant that names its defect by string
- Verify: `node --check extension/error-boundary.js && node --check extension/error-boundary.test.mjs && node --experimental-strip-types --test "extension/error-boundary.test.mjs" && npx prettier --check extension/error-boundary.js extension/error-boundary.test.mjs && npm run check`
- Held-out: E1, E2, E4, E5, E6, E7 and E8, all seven in `extension/error-boundary.test.mjs`, each pin proven non-vacuously.

## Wave 5 — the surface

Goal: render the answer the join produced — the two component types, the error's own identity, the reset, the route and each named absence in its own cell — register the route, and re-cut every pin the registration moves, including the suites that enumerate the route table and the two guards that keep the fixture and the browser compile untouched.

Review depth: full

T005 follows the panel family exactly: one exported function answering state, message, lines and cells, handed the join's answer and rendering only what that answer carried, using the baseline stylesheet's own hooks and adding no global CSS. Its criteria are about a pane that never mints a claim: an absence rendered as an empty string, a boundary named where the record carried none, or a subtree hinted at where the framework kept nothing would each be a finding the record does not support. Registering the route is where earlier milestones lost a gate cycle, so every pin the registration moves is declared here rather than repaired later: the four application specs that enumerate paths, loaders and facts, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, the fixture-table suite that must stay byte-identical, the held-out explainer suite that compiles the panel's route graph, and the panel's initial-bundle baseline, which the one added entry must stay inside.

### T005 — Panel surface for the boundary, the error and the named absences

- Deps: T004
- Files: `apps/angular-ai-devtools/src/app/panel-error-boundary.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-error-boundary.test.mjs`, `scripts/panel-routes.test.mjs`, `scripts/panel-styles.test.mjs`, `scripts/image-budget.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-bundle-budget.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`
- Intent coverage: SC1, SC2, SC4
- Edges: none
- Acceptance: AC1 each state renders its own text and no other's — a caught finding, a cannot-tell answer for each named absence in its own cell, and idle — and a state the pane was not written for renders that state and nothing else; AC2 the caught state renders the declaring and the throwing component types apart, `caughtBy`, the reset only where the answer carried it available, and the error's own name and message, printing nothing the answer did not carry; AC3 the fallback is rendered as fallback content and never as the error, and no rendered error-view text appears anywhere in the pane; AC4 `no-replaced-subtree` renders as its own cell with no node, tag, text or count anywhere in the pane; AC5 each named absence renders its own text in its own cell and never as no errors occurred, as an empty string, or as a boundary; AC6 the route, the demo loader key and the sample fact are added, the sample fact being the join's own answer for the recording rather than a value invented for the demo, and the pane uses the baseline stylesheet's hooks only, adding no global CSS and no DOM to any inspected page; AC7 every pin the registration moves is re-cut with the failing assertion quoted — the app suite's ordered path list, the chat-entry suite's ordered lists, the picker's lazy list, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo suite's loader key and fact — while the fixture's own table stays byte-identical, the held-out explainer suite stays green, and the panel's measured initial total stays at or below the recorded baseline; AC8 a mutant that renders a claim the answer did not carry reddens the pane's pin and names the defect by string
- Verify: `node --check apps/angular-ai-devtools/src/app/panel-error-boundary.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --check scripts/panel-error-boundary.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-error-boundary.test.mjs" "scripts/panel-routes.test.mjs" "scripts/panel-styles.test.mjs" "scripts/image-budget.test.mjs" "scripts/after-render-fixture.test.mjs" "scripts/panel-bundle-budget.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-error-boundary.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-error-boundary.test.mjs scripts/panel-routes.test.mjs && npm run check`
- Held-out: none; E1 to E8 are T004's and the route registration must not redden them.

## Wave 6 — the recordings, the verdict claims and the gate

Goal: make the measurement repeatable behind an opt-in switch, rule the milestone's six claims against the intent's own words, author the archive's required synthesis from artefacts already in the tree, and leave the project gate green at the head the earlier waves leave.

Review depth: full

T006 adds the armed re-capture and the two artefacts the gate and the archive read: without the claim list the claims suite refuses at the milestone it resolves from the bound branch, so the project gate cannot be green without it, and without the synthesis the archive preflight fails. It runs last because its remaining criterion is the gate itself — `npm run check` and `npm test` can only be green once waves one to five have landed — and because the recording it re-derives is the one T004's suite and T005's sample fact both pin, so a re-capture that moved a value is only visible after both exist. It also carries the milestone's SC5 half that no earlier task could prove: the same raw window error taking the handler route on a subject that declares the browser global listeners, and answering the named absence on a subject that declares none.

### T006 — Re-capture behind an opt-in switch, rule the claims and close the gate

- Deps: T004, T005
- Files: `scripts/error-boundary-capture.test.mjs`, `scripts/error-boundary-measure.test.mjs`, `extension/error-boundary.test.mjs`, `scripts/panel-error-boundary.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `extension/agent-main.test.mjs`, `research/raw/m042-error-boundary.json`, `research/raw/m042-verdict-claims.json`, `.project/research/SYNTHESIS.md`
- Intent coverage: SC5, SC6
- Edges: none
- Acceptance: AC1 a default run writes nothing and names every file it would write; AC2 with `M042_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run changes no byte; AC3 no reported value is pinned as a literal — each is re-derived from the installed chunk, the agent's own source or the fixture's install, and a moved source reddens the derivation that names it; AC4 the claim list rules SC1 to SC6, answering each criterion by name and quoting it verbatim from the intent, and every required row names its source page, driver, instance and verdict path; AC5 held-out E10: the same raw window error is reported through the handler on a subject that declares `provideBrowserGlobalErrorListeners()` and as `no-global-error-listeners` on the same throw on a subject that declares none, and neither answer is rendered as no errors occurred; AC6 the project gate is green at the head with the claim list present, and the log names every suite in that gate which skipped for a missing build rather than counting the skip as a measurement; AC7 two mutants redden named assertions naming their defects; AC8 the archive's required synthesis exists at `.project/research/SYNTHESIS.md`, headed as authored at archive time, stating with the record that no research and no decide phase ran, synthesising only artefacts already in the tree, and claiming no independent research
- Verify: `node --check scripts/error-boundary-capture.test.mjs && node --experimental-strip-types --test "scripts/error-boundary-capture.test.mjs" "scripts/error-boundary-measure.test.mjs" "extension/error-boundary.test.mjs" "scripts/panel-error-boundary.test.mjs" && npx prettier --check scripts/error-boundary-capture.test.mjs && npm run check && npm test`
- Held-out: E10 in `scripts/error-boundary-capture.test.mjs`, proven non-vacuously; E12 and E13 remain T002's and this task must not redden them.

## Held-out checks

| Edge | Task | Test                           |
| ---- | ---- | ------------------------------ |
| E1   | T004 | extension/error-boundary.test.mjs |
| E2   | T004 | extension/error-boundary.test.mjs |
| E4   | T004 | extension/error-boundary.test.mjs |
| E5   | T004 | extension/error-boundary.test.mjs |
| E6   | T004 | extension/error-boundary.test.mjs |
| E7   | T004 | extension/error-boundary.test.mjs |
| E8   | T004 | extension/error-boundary.test.mjs |
| E10  | T006 | scripts/error-boundary-capture.test.mjs |
| E12  | T002 | extension/agent-main.test.mjs  |
| E13  | T002 | extension/agent-main.test.mjs  |

## Intent coverage

| Criterion | Task | Acceptance |
| --------- | ---- | ---------- |
| SC1       | T001 | AC3        |
| SC1       | T001 | AC4        |
| SC6       | T001 | AC1        |
| SC6       | T001 | AC2        |
| SC6       | T002 | AC1        |
| SC6       | T002 | AC2        |
| SC6       | T002 | AC3        |
| SC6       | T002 | AC4        |
| SC2       | T003 | AC2        |
| SC2       | T003 | AC4        |
| SC5       | T003 | AC3        |
| SC5       | T003 | AC5        |
| SC1       | T004 | AC1        |
| SC1       | T004 | AC2        |
| SC2       | T004 | AC3        |
| SC3       | T004 | AC5        |
| SC4       | T004 | AC6        |
| SC1       | T005 | AC2        |
| SC2       | T005 | AC3        |
| SC4       | T005 | AC4        |
| SC5       | T006 | AC5        |
| SC6       | T006 | AC4        |
| SC6       | T006 | AC6        |

## Prohibitions

| Prohibition | Criterion | Task |
| ----------- | --------- | ---- |
| N1          | SC1       | T004 |
| N2          | SC2       | T004 |
| N3          | SC3       | T004 |
| N4          | SC4       | T004 |
| N5          | SC5       | T006 |
| N6          | SC6       | T002 |
| N6          | SC6       | T003 |

## Surface contract

The panel is the only surface.

### panel — T005

Criteria: SC1, SC2, SC4

Entry: the pane receives the join's answer for the recorded boundary section, rendered from the demo loader at the panel route the table registers, with the sample fact the recording carries.

States: caught (the declaring component type, the throwing component type, the caught-by mechanism, the reset where the record carried one, the error's own name and message, and the route the error arrived by), cannot-tell (one cell per named absence: no boundary declared, no boundary details, no error caught, no error view rendered, no replaced subtree, no global error listeners, and the version absence a page could not answer), and idle when nothing has arrived.

Walkthrough:

1. `errorBoundaryPanel(answer)` receives the join's `{ state, absence, findings, absences }` and reads no record of its own.
2. A caught finding renders the declaring component type and the throwing component type as two separate lines, in that order, then the caught-by mechanism.
3. The reset renders as available only where the answer carried it available; where it did not, the pane prints nothing for it rather than an empty or unavailable-looking word.
4. The error renders its own name and its own message; the fallback text the boundary rendered is printed under its own label and never as the error.
5. Each named absence the answer carries renders in its own cell with its own name, and no cell renders an empty string for an absence the answer named.
6. The replaced subtree renders as the named absence alone: no node, tag, text or count appears for it anywhere in the pane.
7. Where the answer names a state the pane was not written for, the pane renders that state word and nothing else.

## Dependency notes

- T001 to T002: T001 measures the emission that throws and the epoch record's own contents, so T002's guard is written against a recording that says which instance shape arrives and what a changed epoch looks like — the two halves N6 requires in one pin.
- T002 to T003: both edit the same file, and T003's second insertion is where any remaining anchor drift lands, so T003 depends on T002 rather than racing it and carries the same suite set for the same reason. T003 must not redden E12 and E13, which are T002's.
- T003 to T004: the reader is handed T003's record and reads no page, so the record's field names are the reader's whole input; the interface contract both tasks carry is the text a reviewer compares when they disagree.
- T004 to T005: the pane is handed the join's answer and reads no record, so the answer's field names are the pane's input. The identical pane bullet in both files is what a reviewer checks when the two disagree.
- T004, T005 to T006: T006 re-derives the recording that T004's held-out suite and T005's sample fact both pin, and adds the claim list that lets the claims suite resolve this milestone at all; without T005's sample fact there is no recorded answer for the re-capture to hold the pane to.
- T005 to T006 (bundle): T005 registers the route whose bytes the initial total pays for, and T006's gate reads that total, so the surface must land inside the baseline before the gate is asked to be green.
