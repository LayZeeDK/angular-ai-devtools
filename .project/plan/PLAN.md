# Plan — M039 render-phase-effect

Milestone: render-phase-effect
Branch: gsd-path/M039
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — measure the page before the plan asserts anything about it

Goal: replace the intent's premises with measurements taken at this head — the profiler's own event list, a live attempt at NG0100, and the effect node with the signals its edges name.

Review depth: full

SC2 is a cannot-tell criterion, so the measurement is what stands behind it: a cannot-tell nobody measured is a guess pointing the other way. T001 runs alone, because every later task quotes what it found.

### T001 — Measure the profiler events, the NG0100 message and the effect's edges

- Deps: none
- Files: `scripts/render-phase-measure.test.mjs`, `research/raw/m039-render-phase.json`, `.project/research/m039-render-phase.md`
- Acceptance: AC1 every `ProfilerEvent` value this Angular declares is enumerated by name and number and the list is shown to hold no effect event; AC2 a live NG0100 attempt is recorded with its provenance, and where the page produces none the negative is recorded with what was tried and its honest substitute named as a substitute; AC3 the effect node the graph carries is recorded — its kind, its label or the fact that it is empty, its edges and the signals those edges name — with whether a node of kind `afterRenderEffectPhase` exists at all; AC4 every recorded claim is re-derived by a test from the installed package and the recording rather than transcribed; AC5 the record carries no write, no owner and no cause, and the page gains no instrumentation
- Verify: `node --check scripts/render-phase-measure.test.mjs && node --experimental-strip-types --test "scripts/render-phase-measure.test.mjs" && npx prettier --check scripts/render-phase-measure.test.mjs`
- Held-out expectation: none; E1-E8 are carried by T002 and T003, and this task must not redden them.

## Wave 2 — the pure join

Goal: turn the recorded graph into a finding per subject, with the phase stated as a named absence and the change-detection message kept as its own finding.

Review depth: full

T002 is one pure function over the graph it is handed, so the phase absence and the empty/unreadable distinction are provable without a page.

### T002 — Join an effect to the signals its edges say it reads

- Deps: T001
- Files: `extension/render-phase.js`, `scripts/render-phase.test.mjs`
- Acceptance: AC1 an effect the graph labels produces a finding naming that label and the signals its edges name; AC2 an unlabelled effect is named by the edge the graph records for it and no name is invented; AC3 an effect whose edges name no producer still produces a finding naming the effect and reporting no read; AC4 no finding carries a phase, and the phase is cannot-tell with its named absence; AC5 a graph with no effect node yields the absence state naming the missing node, and a graph that cannot be read yields cannot-tell naming the unreadable graph; AC6 a recorded NG0100 and an effect from the same read stay two findings; AC7 the same graph read twice produces byte-identical text; AC8 every acceptance is proven non-vacuously — the untouched module pins first, a mutant reddens it, and the failure names the defect by string
- Verify: `node --check extension/render-phase.js && node --check scripts/render-phase.test.mjs && node --experimental-strip-types --test "scripts/render-phase.test.mjs" && npx prettier --check extension/render-phase.js scripts/render-phase.test.mjs`
- Held-out expectation: E1, E2, E3, E4, E5, E6, E8 — all seven in `scripts/render-phase.test.mjs`, each pin proven non-vacuously.

## Wave 3 — the surface

Goal: render the effect, the signals it reads, the phase state and the change-detection finding as four separate things, and register the route without enumerating the route table.

Review depth: full

T003 follows `panel-linked-state.ts` and `panel-lint.ts` exactly, and re-cuts every pin the new route moves — including the app suites that enumerate the table, which is where the last two milestones lost a gate cycle.

### T003 — Panel surface for the render-phase findings

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-render-phase.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-render-phase.test.mjs`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`
- Acceptance: AC1 the pane renders the effect's name and the signals it reads, and nothing it was not given; AC2 the phase renders as cannot-tell with its named absence, as its own block and never inside an effect finding; AC3 the change-detection finding renders as its own block carrying the code and message it was handed; AC4 each state renders its own text and nothing else, and a state the pane was not written for still renders the state it was given; AC5 the route, the demo loader and every count pin are re-cut with the failing assertion quoted for each; AC6 a mutant that renders a claim the fact list does not carry reddens, naming the defect
- Verify: `node --check scripts/panel-render-phase.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-render-phase.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/app/panel-render-phase.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-render-phase.test.mjs scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs`
- Held-out expectation: E7 — each state renders its own text and nothing else, pinned in `scripts/panel-render-phase.test.mjs`.

## Wave 4 — recordings and the gate

Goal: make the measurement repeatable behind an opt-in switch, rule the milestone's claims against the portal clause, and leave the project gate green at the head.

Review depth: full

T004 adds the armed re-capture and the two recordings the gate itself reads: without `research/raw/m039-verdict-claims.json` the claim-list suite fails by construction, so the gate cannot be green without it.

### T004 — Re-capture behind an opt-in switch and record the milestone's verdict claims

- Deps: T003
- Files: `scripts/render-phase-capture.test.mjs`, `research/raw/m039-render-phase.json`, `research/raw/m039-verdict-claims.json`
- Acceptance: AC1 the capture writes nothing by default, names every file it would write, and rewrites the recording only when `M039_CAPTURE=1`; AC2 every value the join and the pane report is derived from the recording, never pinned as a literal in the capture or its suite; AC3 the claim list rules each of SC1-SC6 with a reason that answers the portal clause and quotes each criterion character for character; AC4 the project gate is green at the head — `npm run check` and `npm test`; AC5 a second armed run changes no byte of the recording
- Verify: `node --check scripts/render-phase-capture.test.mjs && node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs" "scripts/render-phase.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/render-phase-capture.test.mjs`
- Held-out expectation: none; E1-E8 are T002's and T003's, and the gate is not a held-out check (E9 is dismissed).

## Wave 5 — the panel's baseline stylesheet

Goal: give the panel a real baseline so this milestone does not ship another unstyled surface, and prove it by measurement rather than by eye.

Review depth: full

T005 is independent of the four above and touches no file they touch. It is last because its measurement is the built output, and the build only carries the new surface once T003 has landed.

### T005 — Give the panel a baseline stylesheet and measure it

- Deps: none
- Files: `apps/angular-ai-devtools/src/styles.css`, `scripts/panel-styles.test.mjs`, `extension/panel/styles.css`
- Acceptance: AC1 the stylesheet carries typography, spacing, state colours, button and select normalisation and a dark-scheme block, each rule reachable from the demo's own markup; AC2 `extension/panel/styles.css` is non-empty after the extension build, its byte size read from the build output; AC3 computed `padding`, `border` and `background` on a heading and on a content row are non-default, measured from the document's computed style rather than scanned from the source; AC4 `font-family` is not a discriminator, because Chrome injects one into `chrome-extension://` documents; AC5 the pin runs against the untouched stylesheet first and a mutant that drops the baseline reddens it naming the property it lost; AC6 `npm run check` and `npm test` pass at the head
- Verify: `npx nx run angular-ai-devtools:build-extension && node --check scripts/panel-styles.test.mjs && node --experimental-strip-types --test "scripts/panel-styles.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/styles.css scripts/panel-styles.test.mjs`
- Held-out expectation: none; E1-E8 are T002's and T003's.

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/render-phase.test.mjs |
| E2 | T002 | scripts/render-phase.test.mjs |
| E3 | T002 | scripts/render-phase.test.mjs |
| E4 | T002 | scripts/render-phase.test.mjs |
| E5 | T002 | scripts/render-phase.test.mjs |
| E6 | T002 | scripts/render-phase.test.mjs |
| E7 | T003 | scripts/panel-render-phase.test.mjs |
| E8 | T002 | scripts/render-phase.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC3 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC4 |
| SC3 | T002 | AC6 |
| SC4 | T002 | AC5 |
| SC1 | T003 | AC1 |
| SC2 | T003 | AC2 |
| SC3 | T003 | AC3 |
| SC5 | T003 | AC4 |
| SC6 | T004 | AC4 |
| SC6 | T005 | AC6 |

## Prohibitions

| Prohibition | Criterion | Task |
|---|---|---|
| N1 | SC1 | T002 |
| N2 | SC2 | T002 |
| N3 | SC3 | T002 |
| N4 | SC3 | T002 |
| N5 | SC4 | T002 |
| N6 | SC5 | T003 |
| N7 | SC6 | T004 |

## Surface contract

The panel is the only surface.

### panel — T003

Entry: the pane receives the join's answer for the page's effects and its captured change-detection message, rendered from the demo loader at `/render-phase`.

States: effect (named by its label or by the edge the graph records), phase cannot-tell with its named absence, change-detection with the code and message it was handed, and idle when nothing has arrived.

Walkthrough:

1. `renderPhasePanel(fact)` receives the join's findings.
2. The pane renders each effect finding as its own block: the effect's name, then one line per signal its edges name.
3. The phase renders as its own block, saying it cannot tell and naming the absence the join published.
4. The change-detection finding renders as its own block, carrying its code and message, never beside the effect as its cause.
5. Where the fact names a state the pane was not written for, the pane renders that state and nothing else.

Criteria: SC5
