---
id: T003
title: Render the three states and pin the route and loader they add
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-copy-check.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/component-search.test.mjs
---

# T003 — Render the three states and pin the route and loader they add

## Context

T002 produces the join. This task renders it: a panel surface at route `copy-check` that states the
copy is explained, names each string the digest does not explain with the surface that renders it,
and reports `cannot-tell` with its reason when either side is missing. Adding a route stales every
suite that enumerates the route table, so they are declared here.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-copy-check.ts` rendering the three states, a `copy-check`
route, a `copy-check` key in `panel-demo.ts` `LOADERS`, and update every declared suite for the added
route. Prove the route-map assertion reddens when the loader key is removed, then restore it.

## Intent coverage

- SC1
- SC2

## Interface contract

`copyCheck(surfaces, digest)` receives a surfaces record (the shape T001 measured) and a digest
object, and returns `{ state, unexplained, checked, reason }`. `state` is one of `clean`,
`unexplained`, `cannot-tell`; `unexplained` is an array of `{ string, surface }`; `checked` is the
number of strings compared; `reason` is present only when `state` is `cannot-tell` and is one of a
closed set. No other file implements this function, and no caller reads the page to decide what the
copy says.

## Files

  - scripts/component-search.test.mjs
  - apps/angular-ai-devtools/src/app/panel-copy-check.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs

## Acceptance criteria

1. The `copy-check` route renders all three states, and every suite that enumerates the route table names the new route.
2. Removing the `copy-check` loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and writes only sentences the report supports.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-copy-check.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs
```

## Log

- pending.
