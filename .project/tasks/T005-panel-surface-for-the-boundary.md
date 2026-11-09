---
id: T005
title: Panel surface for the boundary, the error and the named absences
wave: 5
deps:
  - T004
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-error-boundary.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-error-boundary.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/panel-styles.test.mjs
  - scripts/image-budget.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/panel-bundle-budget.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T005 — Panel surface for the boundary, the error and the named absences

## Context

The join answers with findings: a caught error with the declaring component, the throwing component, the caught-by mechanism, the reset where one was carried and the error's own name and message; and the absences, one named cell each. The panel's job is to render that answer and nothing beyond it, so a reader looking at a subject with no boundary cannot mistake silence for a clearance, fallback text for the error, or a promising-looking absence for a subtree somebody reconstructed.

The surface follows the panel family: one exported function answering state, message, lines and cells, no runtime imports, handed the join's answer and rendering only the fields the answer carried. It reads no record, joins nothing and reads no clock, and it adds no DOM to any inspected page and no global CSS — the baseline stylesheet's hooks are the whole vocabulary, which is what keeps a surface from widening a stylesheet every other surface shares.

The route is lazy for the same reason every route above it is: the panel's initial bundle is measured from the eager references in the built index, and a surface imported eagerly moves a budget no surface has business moving. Registering it appends one entry to the table several suites enumerate, so every one of those pins is part of this task rather than a later repair: the app suite's ordered path list, the chat-entry suite's ordered lists, the picker's lazy list, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo suite's loader key and sample fact. Four guards are declared with them because the registration is exactly what could break them: the fixture's own route table must stay byte-identical, the held-out suite that compiles the panel's whole route graph must stay green, the baseline-stylesheet measurement must still report its computed readings for the surface markup this pane uses, and the image budget must still hold. The last of those is also the budget the entry pays for: its own bytes come out of the panel's measured initial total, which the recorded baseline bounds.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders its states apart. A caught finding prints the declaring component and the throwing component on their own lines, in that order, then the caught-by mechanism, then the reset only where the answer carried it available — where it did not, the pane prints nothing for it rather than a word that reads like a clearance. The error prints its own name and its own message; the fallback the boundary rendered prints under its own label and never as the error, and no rendered error-view text appears anywhere in the pane. Each named absence prints in its own cell with its own name: no absence renders as an empty string, as no errors occurred, or as a boundary. The replaced subtree prints as its own absence and nothing else, because a node, a tag, a text or a count for it would be a claim the framework cannot support.

The demo loader gains its own key and its own sample fact, and the sample fact is the join's own answer for the recording rather than a value invented for the demo, so the demo suite can hold the fact to the recording it came from and hold the pane to the fact.

The pins are re-cut to the measured values with each failing assertion quoted in the log, and the two guard suites are run to show they did not move. A mutant that renders a claim the answer did not carry — a reset where none was recorded, an absence as an empty string, a subtree line where the framework kept nothing — reddens the pane's own pin and names the defect by string.

## Interface contract

- Record: the page agent publishes a boundary section beside its change-detection and router records, each entry `{ route, error: { name, message, cause }, details: { declarationType, declarationInstanceName, caughtBy, boundaryType, boundaryReset }, at }`, where `route` is `hook` or `handler`, every field the record did not carry is `null`, and `cause` is present only where the boundary wrapped a value that is not Error-like.
- Answer: `readErrorBoundary(record)` answers `{ state, absence, findings, absences, version }` where `state` is `caught`, `cannot-tell` or `idle`, `absence` is one of the named absences or `null`, each finding is `{ declaringType, throwingType, caughtBy, reset, errorName, errorMessage, cause, route, replacedSubtree }`, and `absences` lists one named absence per unanswered question.
- Pane answer: `errorBoundaryPanel(answer)` answers `{ state, message, lines, text, cells }` where each cell holds the text of its own state or the empty string, and `lines` carries one line per fact the answer carried.

## Intent coverage

- SC1
- SC2
- SC4

## Edges

None; the edge dispositions this milestone carries are held by T002, T004 and T006, and the route registration must not redden any of them.

## Acceptance criteria

1. Each state renders its own text and no other's — a caught finding, a cannot-tell answer with each named absence in its own cell, and idle — and a state the pane was not written for renders that state and nothing else.
2. The caught state renders the declaring and the throwing component types apart, the caught-by mechanism, the reset only where the answer carried it available, and the error's own name and message, printing nothing the answer did not carry.
3. The fallback is rendered as fallback content and never as the error, and no rendered error-view text appears anywhere in the pane.
4. The replaced-subtree absence renders as its own cell with no node, tag, text or count anywhere in the pane.
5. Each named absence renders its own text in its own cell and never as no errors occurred, as an empty string, or as a boundary.
6. The route, the demo loader key and the sample fact are added, the sample fact being the join's own answer for the recording rather than a value invented for the demo, and the pane uses the baseline stylesheet's hooks only, adding no global CSS and no DOM to any inspected page.
7. Every pin the registration moves is re-cut with the failing assertion quoted — the app suite's ordered path list, the chat-entry suite's ordered lists, the picker's lazy list, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo suite's loader key and fact — while the fixture's own table stays byte-identical, the held-out explainer suite stays green, and the panel's measured initial total stays at or below the recorded baseline.
8. A mutant that renders a claim the answer did not carry reddens the pane's pin and names the defect by string.

## Verify

```bash
node --check apps/angular-ai-devtools/src/app/panel-error-boundary.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --check scripts/panel-error-boundary.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-error-boundary.test.mjs" "scripts/panel-routes.test.mjs" "scripts/panel-styles.test.mjs" "scripts/image-budget.test.mjs" "scripts/after-render-fixture.test.mjs" "scripts/panel-bundle-budget.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-error-boundary.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-error-boundary.test.mjs scripts/panel-routes.test.mjs && npm run check
```

## Held-out

None; E1 to E8 are T004's and the route registration must not redden them.

## Log

- pending
