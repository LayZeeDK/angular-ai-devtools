---
id: T003
title: Panel surface for the render-phase findings
wave: 3
status: pending
deps:
  - T002
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-render-phase.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-render-phase.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Panel surface for the render-phase findings

## Context

The join answers with findings and a phase, and the phase is always an absence. The pane
must render four separate things without a fifth: the effect the graph carries, the
signals its edges say it reads, the phase state, and the change-detection message — and
it must never print the phase inside an effect finding, because that is the one merge SC2
and N6 forbid. It also renders a state it was not written for, because the join owns the
vocabulary and the pane is a view.

The shape follows `panel-linked-state.ts` and `panel-lint.ts`: one exported panel
function answering `{ state, kind, message, lines, text }`, imported lazily by the demo
loader, routed through the demo component with its own name in route data. The route is
lazy for the same reason the ten above it are: the panel's initial bundle is measured, so
a route that imports its surface eagerly moves a budget that a surface has no business
moving.

Four existing suites enumerate the route table and will redden the moment the route is
appended, so they are part of this task rather than a later repair: the app suite and the
chat-entry suite pin the ordered path list, the route-table script suite pins each
surface's block and each demo loader key, and the after-render fixture suite pins the
fixture's own nineteen-route table, which the demo route must leave alone while the panel
table grows. The page-picker suite reads the same table and is re-cut with it.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders blocks in the order the join hands them over:

- an effect finding becomes its own block: the effect's name as the join reported it,
  the word `label` or `recorded-edge` saying how it was named, and one line per signal
  the edges name; an empty read renders as a stated absence, not as a blank line.
- the phase becomes its own block, always saying it cannot tell and naming the absence
  the join published. No other word for a phase is printed anywhere in the pane.
- the change-detection finding becomes its own block carrying its code, its message and
  its provenance, never adjacent to an effect as its cause and never merged with one.
- a fact carrying nothing is idle; a state the pane was not written for is rendered as
  the state it was given, borrowing no field.

The demo loader gains its own key and its own sample fact, and the sample fact is the
join's own answer for the recording T001 made — the demo never invents a value the
recording does not carry.

The pins are re-cut to the measured values and the failing assertion is quoted in the
Log for each, as the milestone's own review asks. A mutant that renders a claim the fact
list does not carry — a phase word, a write, a cause, or a code the fact did not carry —
must redden the pane's pin and name the defect.

## Interface contract

`renderPhase(fact) -> { findings, phase }` where each finding is `{ state: 'effect', effect, namedBy, reads }` or `{ state: 'change-detection', code, message, provenance }` or `{ state: 'cannot-tell', reason }`, and `phase` is always `{ state: 'cannot-tell', absence: 'no-effect-event' }`; both tasks that touch it share this exact line.

## Files

- `apps/angular-ai-devtools/src/app/panel-render-phase.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/panel-render-phase.test.mjs`
- `scripts/panel-routes.test.mjs`
- `scripts/after-render-fixture.test.mjs`
- `tests/held-out/fixture-explainers-unchanged.test.mjs`

## Intent coverage

- SC1
- SC2
- SC3
- SC5

## Acceptance criteria

1. The pane renders the effect's name and one line per signal its edges name, and renders nothing it was not given — no write, no owner, no cause, no phase word.
2. The phase renders as its own block, saying it cannot tell and naming the absence the join published; no state of the pane prints rendering or after-render as a phase an effect ran in.
3. The change-detection finding renders as its own block carrying the code, the message and the provenance it was handed, and is never rendered as an effect's cause or joined to one.
4. **held-out E7:** each state of the pane renders its own text and nothing else, and a state the pane was not written for still renders the state it was given.
5. The route, the demo loader and every count pin are re-cut to the measured values, with the failing assertion quoted for each: the ordered path list in the app suite, the ordered path list in the chat-entry suite, the surface block and loader key in the route-table suite, the picker's lazy-route reading, and the fixture's nineteen-route table left unchanged.
6. A mutant that renders a claim the fact list does not carry reddens the pane's pin, naming the defect by string.

## Verify

```bash
node --check scripts/panel-render-phase.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-render-phase.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/app/panel-render-phase.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-render-phase.test.mjs scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs
```

## Log

- dispatched
