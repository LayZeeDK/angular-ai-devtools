---
id: T003
title: Render the four states and pin the route, loader and route tables they add
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-components.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the four states and pin the route, loader and route tables they add

## Context

T002 produces the join. This task renders it: a panel surface at route `components` that lists the
recorded names, filters them by the typed text, states an empty page as an empty list, and states
`cannot-tell` with its reason when the source could not be read. Adding a route stales every suite
that enumerates the route table, so they are declared here rather than discovered at the gate.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-components.ts` rendering the four states from the join,
a `components` route in `app.routes.ts`, and a `components` key in `panel-demo.ts` `LOADERS`. Update
`app.spec.ts`, `page-picker.component.spec.ts`, `panel-demo.spec.ts` and
`scripts/panel-routes.test.mjs` for the added route, and prove the route-map assertion reddens when
the loader key is removed.

## Intent coverage

- SC1
- SC2

## Interface contract

`componentSearch(record, query)` receives `{ components, source }` and returns
`{ state, rows, matched, reason }`. `state` is one of `listed`, `empty`, `cannot-tell`; `rows` is an
array of `{ name, instanceCount }`; `matched` is the number of rows after filtering; `reason` is
present only when `state` is `cannot-tell`, and is one of a closed set. No other file implements this
function, and no caller reads the DOM to build the list.

## Files

- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- scripts/gate-integrity.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
  - apps/angular-ai-devtools/src/app/panel-components.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs

## Acceptance criteria

1. The `components` route renders all four states, and every suite that enumerates the route table names the new route.
2. Removing the `components` loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and writes only sentences the record supports.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-components.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs
```

## Log

- pending.
