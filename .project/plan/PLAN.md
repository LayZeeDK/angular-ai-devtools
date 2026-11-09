# Plan — M041 navigation-blocking

Milestone: navigation-blocking
Branch: gsd-path/M041
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — measure the navigation stream before the plan answers for it

Goal: replace the intent's two unmeasured premises — that the router's stream can be recorded without a new tap, and that a held navigation is distinguishable from a slow one by the terminal event — with a measurement taken at this head, and record each of the three named absences where it was measured rather than assumed.

Review depth: full

The whole milestone rests on facts the intent measured once, before this plan existed: that `Router` is reachable through the injector path rather than a new tap, that `RouteConfigLoadStart`/`End` carry no navigation id, that no payload names a holder, and that a late load end arrives after its own cancel. Every later task quotes one of those, so a measurement task runs first and alone: a plan that quoted a stale key set would write a record shape the router does not emit, and no later task could tell.

### T001 — Measure the navigation stream, its stages and the three absences

- Deps: none
- Files: `scripts/navigation-measure.test.mjs`, `research/raw/m041-navigation.json`, `.project/research/m041-navigation-blocking.md`
- Intent coverage: SC3, SC4, SC5
- Edges: none
- Acceptance: AC1 every router event class the stream can carry is enumerated from the installed `@angular/router` chunk at this head with each class's own key set and the cancellation codes, and the recording's rows are held to that enumeration; AC2 the reach path is recorded from the agent's own read — `ng.getInjector` then `ɵgetInjectorResolutionPath`, with the third path entry holding the `Router` token as `record.token` and the app injector not the first entry; AC3 the three named absences are measured, not assumed: no payload field and no `currentNavigation()` field names a guard, a resolver, a chunk or a task, and `GuardsCheckEnd` carries only the aggregate `shouldActivate`; AC4 the portal declares zero `canActivate` and zero resolvers while the fixture's one `canActivate` carries the function name `redirectGuard`, so a resolver stage is `no-resolver-configured` and a guard name is available only from configuration; AC5 a held navigation records a start and a stage and no terminal event while a completed one records a terminal event with its own fields, and both render the same stage sequence, so the terminal event is the discriminator; AC6 the two route-config events carry `route` and `type` and no navigation id, and a superseded navigation's load end arrives after its own cancel and before the successor's end; AC7 every claim is re-derived by the suite from the installed chunk, the agent's read path and the fixture's guard file, or is quoted as the recording's own measurement with the recorder named, and the run writes nothing and the page gains no instrumentation
- Verify: `node --check scripts/navigation-measure.test.mjs && node --experimental-strip-types --test "scripts/navigation-measure.test.mjs" && npx prettier --check scripts/navigation-measure.test.mjs && npm run check`
- Held-out: none; E1–E9 are T003's and this task must not redden them.

## Wave 2 — widen the one page agent to `Router.events` behind the additive discipline

Goal: record the router's stream additively beside the one profiler subscription, one entry per emission in arrival order with the page's own receipt time and only the fields that event carried, without moving what the four profiler events mean.

Review depth: full

T002 is the design decision the milestone turns on. The intent measured the page agent recording no navigation at all, and the four profiler events are load-bearing — `OutputStart` sets the cycle trigger and `TemplateUpdateStart` opens the cycle — so the router subscription is added beside them or the widening is a regression. The record carries the event's own class name rather than an event number, so no surface ever branches on a number, and the pair of fields an id-less event lacks is recorded as `null` rather than borrowed from the last navigation seen.

### T002 — Widen the page agent to Router.events beside the profiler subscription

- Deps: T001
- Files: `extension/agent-main.js`, `extension/agent-main.test.mjs`, `extension/page-footprint.test.mjs`, `scripts/render-phase-measure.test.mjs`, `scripts/performance-measure.test.mjs`, `apps/angular-ai-devtools/src/app/companion.spec.ts`, `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`, `research/raw/m041-navigation.json`
- Intent coverage: SC1, SC2, SC5
- Edges: none
- Acceptance: AC1 the router subscription is added beside the profiler subscription and never inside it: `ɵsetProfiler` is still called once with the same subscriber, the trigger and the cycle opener keep their meaning, `reset()` removes both subscriptions, and `ɵsetProfiler(null)` is never called; AC2 every `Router.events` emission is recorded in one flat list in arrival order, one entry per emission, carrying the event's own class name, the page's own receipt time and only the fields that event carried, with nothing dropped, coalesced or reordered; AC3 an event that carries no navigation id is recorded with `id: null`, never with the id of the last event seen; AC4 the record is plain data: no instance, element, function, `UrlTree` or snapshot object crosses the boundary, and a routed snapshot contributes only its own route-config path strings; AC5 an added recorded event travels the same entry shape as every other recorded event, so no surface has to know an event number to read one; AC6 two mutants redden named assertions naming their defects, one borrowing an id and one installing the router subscription inside the profiler callback; AC7 the four suites that read this file's source as their own subject are re-cut where the added code moves what they assert, each with the failing assertion quoted, and the page footprint suite's bound still holds
- Verify: `node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-measure.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/render-phase-measure.test.mjs scripts/performance-measure.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts && npm run check`
- Held-out: none; E1–E9 are T003's and this task must not redden them.

## Wave 3 — the pure join

Goal: turn a recorded stream into navigation findings — the terminal class with only its own fields, the open navigation's stage from its last event, the three named absences — and pair each route-config load with the navigation that was in flight when it started, inventing no id and no cause.

Review depth: full

T003 is one pure function over the record it is handed, so the stage, the terminals, the absences and the late load end are provable without a page, and it is the only place the record's shape is read. That is what keeps the pane a view and what makes E1–E9 provable in one suite against recorded frames rather than against a browser.

### T003 — Join a recorded navigation into its stage, endpoint and absences

- Deps: T002
- Files: `extension/navigation-narrator.js`, `scripts/navigation-blocking.test.mjs`, `research/raw/m041-navigation.json`
- Intent coverage: SC1, SC2, SC3, SC4, SC5
- Edges: E1, E2, E3, E4, E5, E6, E7, E8, E9
- Acceptance: AC1 a navigation that recorded a terminal event answers ended, naming the route it was heading for from that event's own `url`, the terminal class it recorded and only that class's own fields, and no other cause — held-out E1; AC2 the end route is named only where the terminal event carried `urlAfterRedirects`, so a cancel or error record names none — held-out E2; AC3 a navigation that recorded a start and no terminal event answers open at the stage of its last recorded event, never as the reason it is open, and an empty record answers the absence rather than zero navigations — held-out E3; AC4 every stage word answered is derived from an event the record contains and no other stage word appears — held-out E4; AC5 an open navigation's holder answers cannot-tell with `no-holder-recorded` and carries no guard, chunk, task or resolver name — held-out E5; AC6 a navigation whose recognised route is the wildcard reports the wildcard match and never a guard refusal, an anonymous guard yields no name, `shouldActivate` is reported as the aggregate field it is, and a resolve stage on a configuration declaring no resolver answers `no-resolver-configured` — held-out E6 and E7; AC7 a completed navigation with a measured route-config load interval answers ended with that interval, never open or held — held-out E8; AC8 a route-config load start with no id never acquires one and a load end is attributed to the navigation in flight when its start arrived, never to its successor, with every acceptance proven non-vacuously by a mutant that names its defect by string — held-out E9
- Verify: `node --check extension/navigation-narrator.js && node --check scripts/navigation-blocking.test.mjs && node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs" && npx prettier --check extension/navigation-narrator.js scripts/navigation-blocking.test.mjs && npm run check`
- Held-out: E1, E2, E3, E4, E5, E6, E7, E8 and E9, all nine in `scripts/navigation-blocking.test.mjs`, each pin proven non-vacuously.

## Wave 4 — the surface

Goal: render the answer the join produced — the stage, both routes and the end state — register the route, and re-cut every pin the registration moves, including the suites that enumerate the route table, which is where earlier milestones lost a gate cycle.

Review depth: full

T004 follows the panel family exactly and touches no file T001–T003 writes except through the answer it is handed. Its own criteria are about the pane rendering only its own state: an end route where none was carried, a holder named where none was recorded, or a cost for a load the page never closed would each be a finding the record does not support.

### T004 — Panel surface for a recorded navigation's stage, routes and end state

- Deps: T003
- Files: `apps/angular-ai-devtools/src/app/panel-navigation.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-navigation.test.mjs`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `research/raw/m041-navigation.json`
- Intent coverage: SC1, SC2, SC3
- Edges: none
- Acceptance: AC1 the pane renders one block per navigation the answer carried, in the answer's order, and a navigation the answer called ended renders its terminal class and only that class's own fields, with each state rendering its own text and no other's; AC2 the end route appears only where the terminal event carried `urlAfterRedirects` and the heading route is the recorded `url`, so the pane prints nothing the answer did not carry; AC3 an open navigation renders the stage word and the last event's own type the answer carried, and never presents the stage as the reason it is open; AC4 an open navigation renders its holder as cannot-tell with `no-holder-recorded`, a guard verdict and a resolver stage render their own named absences, and no guard, chunk or task name appears; AC5 a measured route-config load interval renders as its own number including a measured zero, a load with no end renders no number, and a wildcard match renders the path the answer carried; AC6 the route, the demo loader key and the sample fact are added and the sample fact is the answer derived from the recording rather than a value invented for the demo; AC7 every route-table pin is re-cut with the failing assertion quoted — the app suite's ordered path list, the chat-entry suite's ordered lists, the picker's lazy list, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo spec's loader key — while the fixture's own table that `scripts/after-render-fixture.test.mjs` pins stays byte-identical and the held-out explainer suite stays green; AC8 a mutant that renders a claim the answer did not carry reddens the pane's pin and names the defect by string
- Verify: `node --check apps/angular-ai-devtools/src/app/panel-navigation.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --check scripts/panel-navigation.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-navigation.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-navigation.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-navigation.test.mjs scripts/panel-routes.test.mjs && npm run check`
- Held-out: none; E1–E9 are T003's and the route registration must not redden them.

## Wave 5 — the recording, the verdict claims and the gate

Goal: make the measurement repeatable behind an opt-in switch, rule the milestone's claims against the portal clause, and leave the project gate green at the head.

Review depth: full

T005 adds the armed re-capture and the two recordings the gate itself reads: without `research/raw/m041-verdict-claims.json` the claim-list suite fails by construction, because it resolves the milestone from the bound branch and refuses a missing list, so the project gate cannot be green without it.

### T005 — Re-capture behind an opt-in switch, rule the claims and close the gate

- Deps: T004
- Files: `scripts/navigation-capture.test.mjs`, `research/raw/m041-navigation.json`, `research/raw/m041-verdict-claims.json`, `scripts/navigation-measure.test.mjs`, `scripts/navigation-blocking.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- Intent coverage: SC6
- Edges: none
- Acceptance: AC1 a default run writes nothing and names every file it would write; AC2 with `M041_CAPTURE=1` every section is re-derived and written in canonical form and a second armed run changes no byte; AC3 no reported value is pinned as a literal, each is re-derived from the installed router chunk and the agent's read path, and a moved source reddens the derivation naming it; AC4 the claim list rules SC1–SC6 answering the portal clause by name and quoting each criterion verbatim, and every required row names its source page, driver, instance and verdict path; AC5 the project gate is green at the head with the claim list present; AC6 two mutants redden named assertions naming their defects
- Verify: `node --check scripts/navigation-capture.test.mjs && node --experimental-strip-types --test "scripts/navigation-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-blocking.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/navigation-capture.test.mjs && npm run check && npm test`
- Held-out: none; E1–E9 are T003's and the project gate is not a held-out check (E10 is dismissed).

## Held-out checks

| Edge | Task | Test                           |
| ---- | ---- | ------------------------------ |
| E1   | T003 | scripts/navigation-blocking.test.mjs |
| E2   | T003 | scripts/navigation-blocking.test.mjs |
| E3   | T003 | scripts/navigation-blocking.test.mjs |
| E4   | T003 | scripts/navigation-blocking.test.mjs |
| E5   | T003 | scripts/navigation-blocking.test.mjs |
| E6   | T003 | scripts/navigation-blocking.test.mjs |
| E7   | T003 | scripts/navigation-blocking.test.mjs |
| E8   | T003 | scripts/navigation-blocking.test.mjs |
| E9   | T003 | scripts/navigation-blocking.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
| --------- | ---- | ---------- |
| SC3       | T001 | AC3        |
| SC4       | T001 | AC4        |
| SC5       | T001 | AC6        |
| SC1       | T002 | AC2        |
| SC2       | T002 | AC5        |
| SC5       | T002 | AC3        |
| SC1       | T003 | AC1        |
| SC1       | T003 | AC2        |
| SC2       | T003 | AC3        |
| SC2       | T003 | AC4        |
| SC3       | T003 | AC5        |
| SC4       | T003 | AC6        |
| SC5       | T003 | AC7        |
| SC5       | T003 | AC8        |
| SC1       | T004 | AC1        |
| SC1       | T004 | AC2        |
| SC2       | T004 | AC3        |
| SC3       | T004 | AC4        |
| SC6       | T005 | AC5        |

## Prohibitions

| Prohibition | Criterion | Task |
| ----------- | --------- | ---- |
| N1          | SC1       | T003 |
| N2          | SC2       | T003 |
| N3          | SC3       | T003 |
| N4          | SC4       | T003 |
| N5          | SC5       | T003 |
| N6          | SC6       | T005 |

## Surface contract

The panel is the only surface.

### panel — T004

Criteria: SC1, SC2, SC3

Entry: the pane receives the join's answer for the recorded stream, rendered from the demo loader at the panel route `/navigation` with the sample fact the recording carries.

States: ended (the terminal class the event recorded, the route it was heading for, the end route only where the terminal event carried it, and the measured route-config load interval), open (the stage of the last recorded event, that event's own type, and the holder as cannot-tell with `no-holder-recorded`), cannot-tell (a guard verdict as `guard-verdict-not-recorded`, a resolve stage as `no-resolver-configured`, and a record that carried no navigation at all, each in its own cell), and idle when nothing has arrived.

Walkthrough:

1. `navigationPanel(answer)` receives the join's `{ state, absence, navigations, unattributed }`.
2. The pane renders one block per navigation, in the answer's order: the state word first, then the route it was heading for.
3. A navigation the answer called ended renders its terminal class and then only the fields that class carried — `urlAfterRedirects` only where the event carried it, `code` and `reason` for a cancel or a skip, the error's own name and message for an error — and prints no end route for a cancel or an error.
4. A navigation the answer called open renders its stage word, the last recorded event's own type, and `holder: cannot-tell (no-holder-recorded)`; no guard, chunk or task is named.
5. A route-config load the answer paired renders its measured interval, including a measured zero; a load with no end renders no number; a matched path the answer carried is printed where it was carried.
6. Where the answer names a state the pane was not written for, the pane renders that state and nothing else.

## Dependency notes

- T001 → T002: T002 records exactly the fields T001 measured for each event class, so T001's enumeration of the installed chunk's classes and key sets is what T002's record shape is held to. A reviewer sees it in T002's assertions quoting the recording's per-class key sets.
- T002 → T003: T003 reads the `routerEvents` list T002 publishes and nothing else; its interface contract bullet is the byte-identical record-shape bullet T002 carries, and its suite feeds recorded entries of that shape into the join with no page.
- T003 → T004: the pane is handed T003's `narrateNavigation` answer and reads no event list, so the answer's field names are the pane's whole input. The identical pane bullet in both files is what a reviewer checks when the two disagree.
- T004 → T005: T005 re-captures the recording that T003's suite and T004's demo fact both pin, and adds the claim list that lets `scripts/overlay-verdict-claims.test.mjs` resolve this milestone at all; without T004's sample fact there is no recorded answer to hold the re-cut to.
