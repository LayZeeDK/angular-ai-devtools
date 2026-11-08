---
id: T004
title: Panel surface for the frame's ordered work and its cost
wave: 4
status: pending
deps:
  - T003
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-performance.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-performance.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T004 — Panel surface for the frame's ordered work and its cost

## Context

The narrator answers with ordered intervals, each measured with the identity its own
two events carried and the duration the page measured between them — or with the named
absence that stands where the profiler named nobody, or the unmeasured state where a
start never found its end. The panel's job is to render that answer and nothing beyond
it, in the one shape SC5 requires: the component identity and the cost in separate
columns, so a reader cannot mistake a name for a number or read a duration that was
never measured.

The surface follows `panel-render-phase.ts` and `panel-linked-state.ts`: one exported
panel function answering `{ state, message, lines, text, columns }`, no runtime imports,
handed the narrator's answer and rendering only fields the answer carried. It reads no
clock, joins nothing and never names a component the answer did not name (N5) — an
interval the answer calls cannot-tell renders its absence in the identity cell, and an
unmeasured interval renders no number at all.

The route is lazy for the same reason the fourteen above it are: the panel's initial
bundle is measured, and a route that imports its surface eagerly moves a budget a
surface has no business moving. Registering it appends one entry to the table that five
suites enumerate and one loader key to the demo, so every one of those pins is part of
this task rather than a later repair: the app suite's ordered path list, the chat-entry
suite's two ordered lists and its lazy-path list, the picker's lazy list, the route-table
suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo
spec's loader key and sample fact. The fixture's own route table is not this table and
must not move; the held-out explainer suite compiles the panel's whole route graph, so it
is the regression proof that a new lazy route changes nothing an explainer answers.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders one row per interval the answer carried, in the answer's order and no
other, with exactly two named columns:

- the identity column holds the component name the answer carried, or the absence word
  the answer named for an unnamed interval. It never holds a cost and never invents a
  name, a node index or a position.
- the cost column holds the duration the answer measured, including a measured `0`, or
  the unmeasured word the answer carried for an interval with no matching end. It never
  holds a name and never a number the answer did not carry.
- a row's two cells never repeat one another's text; the state words the answer uses are
  copied, never compared, so a state the pane was not written for still renders as the
  state it was given.
- the pane's own text is assembled from the same values in the same order every time, so
  the same answer rendered twice is byte-identical.

The demo loader gains its own key and its own sample fact, and the sample fact is the
narrator's own answer for the frame the measurement recorded — the demo never invents a
value the recording does not carry, and the demo spec holds the fact to the recording.

The pins are re-cut to the measured values, with the failing assertion quoted in the Log
for each, and the fixture's own route table is checked to be untouched. A mutant that
renders a claim the answer did not carry — a component the answer never named, a
duration it never measured — reddens the pane's own pin and names the defect by string.

## Interface contract

- Frame record: the page agent publishes `events` on the change-detection record, one entry per recorded profiler event in emission order, each `{ type: number, pair: string, end: boolean, at: number, componentName: string | null }`; `at` is the page's own `performance.now()` reading at receipt, and `componentName` is the name the profiler's instance yielded or `null`.
- Narrator answer: `narrate(frame)` answers `{ state, intervals, unresolved }` where each interval is `{ state: 'measured', pair, componentName, startedAt, endedAt, durationMs }`, `{ state: 'cannot-tell', pair, absence: 'no-component-identity', startedAt }` or `{ state: 'unmeasured', pair, startedAt }`, in the order the start events were recorded; `unresolved` lists an end event with no open start by kind, and nothing else.
- Pane answer: `performancePanel(answer)` answers `{ state, message, lines, text, columns }` where `columns` carries one row per interval with the identity cell and the cost cell apart, and a cell holds the text of its own state or the empty string.

## Files

- `apps/angular-ai-devtools/src/app/panel-performance.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/panel-performance.test.mjs`
- `scripts/panel-routes.test.mjs`
- `scripts/after-render-fixture.test.mjs`
- `tests/held-out/fixture-explainers-unchanged.test.mjs`

## Intent coverage

- SC2
- SC3
- SC5

## Acceptance criteria

1. The pane renders one row per interval the answer carried, in the answer's order, with the component identity in one column and the measured cost in another, each column rendering only its own state and neither repeating the other's text — held-out E7.
2. An unnamed interval renders the absence the answer named in its identity cell and an empty cost cell; an unmeasured interval renders its unmeasured word and no number; a measured zero renders `0`, never a blank — held-out E7.
3. The pane prints no component the answer did not carry and no duration the answer did not carry: it derives nothing, joins nothing and reads no clock.
4. The same answer rendered twice is byte-identical — held-out E8.
5. The route, the demo loader key and the sample fact are added, and the sample fact is the narrator's own answer for the recorded frame rather than a value invented for the demo.
6. Every route-table pin is re-cut with the failing assertion quoted: the app suite's ordered path list, the chat-entry suite's ordered lists, the picker's lazy list, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo spec's loader key; the fixture's own route table is unchanged and the held-out explainer suite stays green.
7. A mutant that renders a claim the answer did not carry reddens the pane's pin, naming the defect by string.

## Verify

```bash
node --check scripts/panel-performance.test.mjs && node --check scripts/panel-routes.test.mjs && node --check apps/angular-ai-devtools/src/app/panel-performance.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --experimental-strip-types --test "scripts/panel-performance.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-performance.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-performance.test.mjs scripts/panel-routes.test.mjs && npm run check
```

## Log

- pending
