---
id: T004
title: Panel surface for a recorded navigation's stage, routes and end state
wave: 4
deps:
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-navigation.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-navigation.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - research/raw/m041-navigation.json
---

# T004 — Panel surface for a recorded navigation's stage, routes and end state

## Context

The join answers with navigation findings: a navigation that ended, with the class its
terminal event recorded and only the fields that event carried; a navigation still open,
with the stage its last event named and the holder it cannot name; and the three absences,
each in its own place. The panel's job is to render that answer and nothing beyond it, so
that a reader looking at a navigation that never arrived cannot mistake the stage for the
reason, an aggregate for a guard's verdict, or a load the page never closed for a cost.

The surface follows `panel-performance.ts`, `panel-render-phase.ts` and
`panel-linked-state.ts`: one exported panel function answering state, message, lines, text
and columns, no runtime imports, handed the join's answer and rendering only the fields
the answer carried. It reads no event list, joins nothing, matches nothing and reads no
clock — every value in the pane arrived through the argument, and the join's own rules are
never restated here.

The route is lazy for the same reason every route above it is: the panel's initial bundle
is measured, and a route that imports its surface eagerly moves a budget a surface has no
business moving. Registering it appends one entry to the table that several suites
enumerate and one loader key to the demo, so every one of those pins is part of this task
rather than a later repair: the app suite's ordered path list, the chat-entry suite's
ordered lists and its panel-surface loop, the picker's lazy list, the route-table suite's
surfaces, export map, direct-call list and loader-removal mutant, and the demo spec's
loader key and sample fact. The fixture's own route table is a different table and must
not grow: `scripts/after-render-fixture.test.mjs` pins it, so this task declares that
suite as a guard and proves it stays byte-identical, and the held-out explainer suite
compiles the panel's whole route graph as the regression proof that a new lazy route
changes nothing an explainer answers.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders one block per navigation the answer carried, in the answer's order:

- the state word the answer gave the navigation comes first, copied rather than compared,
  so a state this pane was not written for still renders as the state it was given.
- the route the navigation was heading for is the recorded `url` and nothing else. The
  end route is printed only where the answer carries one, which is the case the terminal
  event recorded it: a cancel or an error prints no end route at all, because printing an
  empty or invented one would report a destination the router never stated.
- an ended navigation prints its terminal class and then only that class's own fields: a
  code and a reason where the answer carried them, the error's own name and message where
  it carried an error. Nothing else is printed for it, and no cause is added.
- an open navigation prints the stage word and the last recorded event's own class that
  the answer carried, then the holder as cannot-tell with `no-holder-recorded`. No guard,
  chunk or task name appears anywhere in the pane.
- a guard verdict and a resolve stage print their own named absences in their own cells, so
  the pane states what was not recorded rather than leaving a reader to read silence as a
  clearance.
- each route-config load the answer paired prints its measured interval as its own number,
  a measured zero included; a load the answer could not close prints no number. A matched
  path the answer carried is printed where it was carried, and only then.

The demo loader gains its own key and its own sample fact, and the sample fact is the
join's own answer for the recorded stream rather than a value invented for the demo: the
demo spec holds the fact to the recording it came from, including that the same answer
rendered twice is byte-identical.

The pins are re-cut to the measured values, with the failing assertion quoted in the Log
for each, and the fixture's own route table is checked to have stayed byte-identical. A
mutant that renders a claim the answer did not carry — an end route where none was
recorded, a holder where none is known, a cost for a load the page never closed — reddens
the pane's own pin and names the defect by string.

## Interface contract

- Router record: the page agent publishes `routerEvents` beside the change-detection record, one entry per `Router.events` emission in arrival order, each `{ type, at, id, url, urlAfterRedirects, route, reason, code, error, shouldActivate, matchedPaths }` where `type` is the event's own class name, `at` is the page's own `performance.now()` reading at receipt, every field the event did not carry is `null`, and `matchedPaths` holds the primary route chain's own config paths in order for an event whose payload carried a route-tree snapshot and is empty otherwise.
- Navigation answer: `narrateNavigation(record)` answers `{ state, absence, navigations, unattributed }` where each navigation is `{ id, state, url, urlAfterRedirects, terminal, code, reason, error, stage, lastEvent, holder, absence, matched, loads }`, `state` is `ended` or `open`, `stage` is one of the four stage words or `null`, `loads` holds one entry per route-config load `{ route, startedAt, endedAt, durationMs, open }`, and `unattributed` lists an id-less load by kind and route.
- Pane answer: `navigationPanel(answer)` answers `{ state, message, lines, text, columns }` where `columns` carries one row per navigation with the route, the end route, the terminal or the stage, the holder and each load apart, and a cell holds the text of its own state or the empty string.

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. The pane renders one block per navigation the answer carried, in the answer's order, and an ended navigation renders its terminal class and only that class's own fields, with each state rendering its own text and no other's.
2. The end route appears only where the answer carries one, the heading route is the recorded `url`, and the pane prints nothing the answer did not carry.
3. An open navigation renders the stage word and the last event's own class the answer carried, and never presents the stage as the reason it is open.
4. An open navigation renders its holder as cannot-tell with `no-holder-recorded`, a guard verdict and a resolve stage render their own named absences, and no guard, chunk or task name appears.
5. A measured route-config load interval renders as its own number including a measured zero, a load with no end renders no number, and a wildcard match renders the path the answer carried.
6. The route, the demo loader key and the sample fact are added, and the sample fact is the answer derived from the recording rather than a value invented for the demo.
7. Every route-table pin is re-cut with the failing assertion quoted — the app suite's ordered path list, the chat-entry suite's ordered lists, the picker's lazy list, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo spec's loader key — while the fixture's own table that `scripts/after-render-fixture.test.mjs` pins stays byte-identical and the held-out explainer suite stays green.
8. A mutant that renders a claim the answer did not carry reddens the pane's pin and names the defect by string.

## Verify

```bash
node --check apps/angular-ai-devtools/src/app/panel-navigation.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --check scripts/panel-navigation.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-navigation.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-navigation.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-navigation.test.mjs scripts/panel-routes.test.mjs && npm run check
```

## Log

- pending
