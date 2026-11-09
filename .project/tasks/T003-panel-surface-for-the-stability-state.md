---
id: T003
title: Panel surface for the stability state, the settle reading and the repeated work
wave: 3
deps:
  - T002
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-stability.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-stability.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/panel-styles.test.mjs
  - scripts/panel-bundle-budget.test.mjs
  - scripts/image-budget.test.mjs
  - scripts/after-render-fixture.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Panel surface for the stability state, the settle reading and the repeated work

## Context

The join answers with three readings and the absences beside them: the state and the emission it was read from, the settle time or its named absence, and the repeated work the frame recorded. The panel's job is to render that answer and nothing beyond it, so a reader looking at a page that never settles cannot mistake silence for stability, a measured zero for a missing reading, or an absence for a count.

The surface follows the panel family: one exported function answering state, kind, message, lines, text, cells and blocks, no runtime imports, handed the join's answer and rendering only the fields the answer carried. It reads no record, joins nothing and reads no clock, it adds no DOM to any inspected page and no global CSS, and it uses the baseline stylesheet's hooks — the ones `apps/angular-ai-devtools/src/app/panel-error-boundary.ts` and its neighbours already emit — so the demo's own markup renders it unchanged.

The route is lazy for the same reason every route above it is: the panel's initial total is measured from the eager references in the built index, and it stands at 535.00 kB against the recorded 535.44 kB baseline, so 0.44 kB of headroom is all one entry has. The entry therefore references the shared `loadPanelDemo` loader that `apps/angular-ai-devtools/src/app/app.routes.ts` already defines once, and adds no second copy of the dynamic import. Registering it appends to a table several suites enumerate, so every one of those pins is part of this task rather than a later repair: the app suite's ordered path list, the chat-entry suite's two ordered lists, the picker's lazy list, the route-table suite's surfaces, export map and loader mutant, and the demo suite's loader key and sample fact. `scripts/panel-styles.test.mjs` enumerates no route, so it is declared as a guard that must be proven unmoved rather than claimed as a pin the registration cuts, and `tests/held-out/fixture-explainers-unchanged.test.mjs` pins the same table from outside the app and is declared with them. The fixture's own table stays byte-identical, the two budget suites are declared with the entry, and the after-render fixture guard is declared because the demo's markup is what it measures.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders its readings apart. Each of the three readings is its own block with its own lines: the state and the emission it was read from, the settle interval as its own number — a measured `0` printed as `0` — or the absence with no time and no duration beside it, and one line per repeated pass the answer carried. Every named absence renders in its own cell with its own name, and no cell renders an empty string, a zero outstanding count, a cause, an owner or a stack. A state word the pane was not written for renders as that word and nothing else, and a page the answer has no stability reading for renders `no-stability-observable` rather than an empty table or an em dash.

The demo loader gains its own key and its own sample fact, and the sample fact is the join's own answer for the recording rather than a value invented for the demo, so the demo suite can hold the fact to the recording it came from and hold the pane to the fact.

The pins are re-cut to the measured values with each failing assertion quoted in the log, and each guard is run to show it did not move — the stylesheet measurement, the fixture's byte-identical table, the held-out explainer suite and the two budgets. A mutant that renders a claim the answer did not carry — a settle time the answer named absent, a pass the frame did not record, a cause where the answer names `no-cause-reported` — reddens the pane's own pin and names the defect by string.

## Interface contract

- Record: the page agent publishes a `stability` section beside its `events`, `routerEvents`, `boundary` and `checks` fields — `{ reachedBy, absence, attachAt, reading, settle, version, coreVersion }` — where `reachedBy` is the token the injector walk resolved or `null`, `absence` is `null` or `no-stability-observable`, `attachAt` is the page's own `performance.now()` at attach, `reading` is `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when it arrived — or `null`, `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`, `version` is the constant the surface works against, and `coreVersion` is what the page reported, `null` where it reported none.
- Answer: `stability(frame)` answers `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` where `state` is `unstable`, `stable`, `cannot-tell` or `idle`, `settle` is `{ state: "settled", at, sinceAttachMs }` or `{ state: "no-settle-observed" }`, each repeat is `{ pair, componentName, passes }` read from the frame's own `events`, and `absences` lists one named absence per unanswered question.
- Pane answer: `stabilityPanel(answer)` answers `{ state, kind, message, lines, text, cells, blocks }` where each cell holds the text of its own state or the empty string, `lines` carries one line per fact the answer carried, and `blocks` carries one block per reading — the state, the settle reading and the repeated work — each holding its own lines.

## Intent coverage

- SC5

## Edges

E9, held-out and in this task's own demo suite.

## Acceptance criteria

1. Held-out E9: the pane renders its three blocks and every named absence, and asked for a cause, an outstanding item, an owner or an order it renders that absence in its own sentence rather than an empty list or a dash.
2. Each state renders its own text and no other's, a state word the pane was not written for renders as that word and nothing else, and a page it has no stability answer for renders `no-stability-observable` rather than an empty table or an em dash.
3. A settle measured as `0` renders `0`, a settle the answer named absent renders that absence with no time and no duration, and the pane prints no interval the answer did not carry.
4. The repeated-work block prints one line per repeated pass the answer carried and nothing beside it — no per-view cycle count, no outstanding-work count and no pass the frame's events do not hold — and a frame with no repeated work prints the reading it has rather than a zero.
5. The route, the demo loader key and the sample fact are added, the sample fact being the join's own answer for the recording rather than a value invented for the demo, the route installs the shared `loadPanelDemo` loader with no second copy of the dynamic import, and the pane uses the baseline stylesheet's hooks only, adding no global CSS and no DOM to any inspected page.
6. Every pin the registration moves is re-cut with the failing assertion quoted — the app suite's ordered path list, the chat-entry suite's two ordered lists, the picker's lazy list, the route-table suite's surfaces, export map and loader mutant, and the demo suite's loader key and fact — while `scripts/panel-styles.test.mjs`, which enumerates no route, is proven unmoved by running it and is recorded as a guard rather than as a pin the registration cuts.
7. The fixture's own table stays byte-identical, the held-out explainer suite stays green, and the panel's measured initial total stays at or below the recorded 535.44 kB baseline, of which 0.44 kB remained before this entry.
8. A mutant that renders a claim the answer did not carry reddens the pane's pin and names the defect by string.

## Verify

```bash
node --check apps/angular-ai-devtools/src/app/panel-stability.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --check scripts/panel-stability.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-stability.test.mjs" "scripts/panel-routes.test.mjs" "scripts/panel-styles.test.mjs" "scripts/panel-bundle-budget.test.mjs" "scripts/image-budget.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-stability.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-stability.test.mjs scripts/panel-routes.test.mjs && npm run check
```

## Held-out

E9 in `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, proven non-vacuously; E1 to E8 and E10 are T002's and the route registration must not redden them.

## Log

- pending
