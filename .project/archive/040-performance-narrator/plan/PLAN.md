# Plan — M040 performance-narrator

Milestone: performance-narrator
Branch: gsd-path/M040
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — measure the identity question before the plan answers it

Goal: replace the intent's two unmeasured premises — that a paired event carries a component identity, and that both ends of a pair are visible in one frame — with a measurement taken at this head, and record the negative where it finds one.

Review depth: full

SC3 is a cannot-tell criterion, so the measurement is what stands behind it: an unnamed bracket nobody measured is a guess pointing the other way. T001 runs alone because every later task quotes what it found, and because a milestone that manufactured an identity from a node index would have to unwind it.

### T001 — Measure the paired work events and the identity they carry

- Deps: none
- Files: `scripts/performance-measure.test.mjs`, `research/raw/m040-work-events.json`, `.project/research/m040-performance-narrator.md`
- Acceptance: AC1 the five pairs are enumerated from both installed builds by one reader; AC2 every emission site's argument list is recorded with the site it read; AC3 whether both ends of a pair are visible in one frame is answered from the sites and from the agent's frame boundary, with any disagreement and the rule the narrator must obey named; AC4 the record answers per pair whether an identity is carried, and names the absence where none is; AC5 every claim is re-derived by the suite from the installed chunk and the recording, the run writes nothing and the page gains no instrumentation
- Verify: `node --check scripts/performance-measure.test.mjs && node --experimental-strip-types --test "scripts/performance-measure.test.mjs" && npx prettier --check scripts/performance-measure.test.mjs && npm run check`
- Held-out expectation: none; E1–E8 are carried by T002, T003 and T004, and this task must not redden them.

## Wave 2 — widen the one profiler subscription to the five pairs

Goal: record the five paired work events additively onto the page agent, with one measured receipt time per event and the component the profiler named or an honest null, without moving what the four existing events mean.

Review depth: full

T002 is the design decision the milestone turns on. The four existing events are load-bearing — `OutputStart` sets the cycle trigger and `TemplateUpdateStart` opens the cycle — so the widening is additive or it is a regression, and the per-event shape is shared so no surface has to know an event's number.

### T002 — Widen the page agent to the five paired work events

- Deps: T001
- Files: `extension/agent-main.js`, `extension/agent-main.test.mjs`, `extension/page-footprint.test.mjs`, `research/raw/m039-render-phase.json`, `scripts/render-phase-measure.test.mjs`, `scripts/render-phase-capture.test.mjs`, `scripts/render-phase.test.mjs`, `scripts/panel-render-phase.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `apps/angular-ai-devtools/src/app/companion.spec.ts`, `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`
- Acceptance: AC1 the five pairs are recorded in one frame-level list in emission order with a measured receipt time and the profiler's name or `null`; AC2 recording stays additive — the trigger and the cycle opener keep their meaning and the per-check list keeps the four bare numbers; AC3 an event with no instance is recorded with no name, never one derived from an index, a position, a neighbour or the fallback word; AC4 held-out E3 — an added event travels the same per-event shape and `OutputStart` still sets the trigger; AC5 the M039 recording's derived agent block is re-cut through its own writer and no M039 assertion was weakened; AC6 two mutants redden named assertions naming their defects
- Verify: `node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --check scripts/render-phase-measure.test.mjs && node --check scripts/render-phase-capture.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/render-phase.test.mjs" "scripts/panel-render-phase.test.mjs" && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/render-phase-measure.test.mjs scripts/render-phase-capture.test.mjs && npm run check`
- Held-out expectation: E3, in `extension/agent-main.test.mjs`, proven non-vacuously.

## Wave 3 — the pure join

Goal: turn a recorded frame into ordered intervals with measured durations, a named absence for an unnamed bracket and an unmeasured state for a start with no matching end, inventing no cost and no identity.

Review depth: full

T003 is one pure function over the frame it is handed, so ordering, absence and the unmatched start are provable without a page. It is also the only place the record's shape is read, which is what keeps the pane a view.

### T003 — Narrate the frame's ordered work with measured durations

- Deps: T002
- Files: `extension/performance-narrator.js`, `scripts/performance-narrator.test.mjs`, `research/raw/m040-work-events.json`
- Acceptance: AC1 ordered, measured intervals with the identity their own events carry and the measured difference between the two receipt times — held-out E1; AC2 an unnamed interval answers cannot-tell with the named absence and names no component — held-out E4; AC3 a start with no matching end is unmeasured and carries no duration — held-out E5; AC4 a start and its end at the same instant answer a measured zero — held-out E6; AC5 an event the frame does not carry contributes no interval — held-out E2; AC6 an end with no open start is unresolved and never paired backwards; AC7 every acceptance is proven non-vacuously, each mutant naming its defect by string
- Verify: `node --check extension/performance-narrator.js && node --check scripts/performance-narrator.test.mjs && node --experimental-strip-types --test "scripts/performance-narrator.test.mjs" && npx prettier --check extension/performance-narrator.js scripts/performance-narrator.test.mjs && npm run check`
- Held-out expectation: E1, E2, E4, E5, E6 — all five in `scripts/performance-narrator.test.mjs`, each pin proven non-vacuously.

## Wave 4 — the surface

Goal: render the frame's ordered work with the identity and the measured cost in separate columns, register the route, and re-cut every pin the registration moves — including the suites that enumerate the route table, which is where earlier milestones lost a gate cycle.

Review depth: full

T004 follows `panel-render-phase.ts` exactly and touches no file T001–T003 writes except through the answer it is handed. Its held-out edges are about the pane rendering only its own state, not about the join.

### T004 — Panel surface for the frame's ordered work and its cost

- Deps: T003
- Files: `apps/angular-ai-devtools/src/app/panel-performance.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-performance.test.mjs`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`
- Acceptance: AC1 identity and cost in separate columns, each rendering only its own state — held-out E7; AC2 an unnamed interval renders its absence and no cost, an unmeasured one renders no number, a measured zero renders `0` — held-out E7; AC3 the pane prints nothing the answer did not carry; AC4 the same answer rendered twice is byte-identical — held-out E8; AC5 the route, loader key and sample fact are added from the recording; AC6 every route-table pin is re-cut with the failing assertion quoted, and the fixture's own table and the held-out explainer suite are unchanged; AC7 a mutant that renders an uncarried claim reddens, naming the defect
- Verify: `node --check scripts/panel-performance.test.mjs && node --check scripts/panel-routes.test.mjs && node --check apps/angular-ai-devtools/src/app/panel-performance.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --experimental-strip-types --test "scripts/panel-performance.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-performance.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-performance.test.mjs scripts/panel-routes.test.mjs && npm run check`
- Held-out expectation: E7 and E8 — both in `scripts/panel-performance.test.mjs`, each pin proven non-vacuously.

## Wave 5 — recordings and the gate

Goal: make the measurement repeatable behind an opt-in switch, rule the milestone's claims against the portal clause, and leave the project gate green at the head.

Review depth: full

T005 adds the armed re-capture and the two recordings the gate itself reads: without `research/raw/m040-verdict-claims.json` the claim-list suite fails by construction, so the gate cannot be green without it.

### T005 — Re-capture behind an opt-in switch and record the milestone's claims

- Deps: T004
- Files: `scripts/performance-capture.test.mjs`, `research/raw/m040-work-events.json`, `research/raw/m040-verdict-claims.json`, `scripts/performance-measure.test.mjs`, `scripts/performance-narrator.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- Acceptance: AC1 a default run writes nothing and names every file it would write; AC2 with `M040_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run changes no byte; AC3 no reported value is pinned as a literal, and a moved source reddens the derivation naming it; AC4 the claim list rules SC1–SC6 answering the portal clause by name and quoting each criterion; AC5 the project gate is green at the head with the claim list present; AC6 mutants redden named assertions naming their defects
- Verify: `node --check scripts/performance-capture.test.mjs && node --experimental-strip-types --test "scripts/performance-capture.test.mjs" "scripts/performance-measure.test.mjs" "scripts/performance-narrator.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/performance-capture.test.mjs && npm run check && npm test`
- Held-out expectation: none; E1–E8 are T002's, T003's and T004's, and the project gate is not a held-out check (E9 is dismissed).

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T003 | scripts/performance-narrator.test.mjs |
| E2 | T003 | scripts/performance-narrator.test.mjs |
| E3 | T002 | extension/agent-main.test.mjs |
| E4 | T003 | scripts/performance-narrator.test.mjs |
| E5 | T003 | scripts/performance-narrator.test.mjs |
| E6 | T003 | scripts/performance-narrator.test.mjs |
| E7 | T004 | scripts/panel-performance.test.mjs |
| E8 | T004 | scripts/panel-performance.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC3 |
| SC3 | T001 | AC4 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC1 | T003 | AC1 |
| SC1 | T003 | AC5 |
| SC3 | T003 | AC2 |
| SC4 | T003 | AC3 |
| SC4 | T003 | AC4 |
| SC2 | T004 | AC6 |
| SC3 | T004 | AC2 |
| SC5 | T004 | AC1 |
| SC5 | T004 | AC4 |
| SC1 | T005 | AC2 |
| SC6 | T005 | AC5 |

## Prohibitions

| Prohibition | Criterion | Task |
|---|---|---|
| N1 | SC1 | T003 |
| N2 | SC2 | T002 |
| N3 | SC3 | T003 |
| N4 | SC4 | T003 |
| N5 | SC5 | T004 |
| N6 | SC6 | T005 |

## Surface contract

The panel is the only surface.

### panel — T004

Entry: the pane receives the narrator's answer for a recorded frame, rendered from the demo loader at `/performance` with the sample fact the recording carries.

States: measured (a named component and its measured cost in separate columns), cannot-tell (an unnamed interval, with the absence in the identity cell and no cost), unmeasured (a start with no matching end, with no number), and idle when nothing has arrived.

Walkthrough:

1. `performancePanel(answer)` receives the narrator's `{ state, intervals, unresolved }`.
2. The pane renders one row per interval, in the answer's order: the identity cell first, the cost cell second.
3. An interval the answer calls cannot-tell renders its absence in the identity cell and leaves the cost cell empty.
4. An interval the answer calls unmeasured renders its unmeasured word and no number; a measured zero renders `0`.
5. Where the answer names a state the pane was not written for, the pane renders that state and nothing else.

Criteria: SC5
