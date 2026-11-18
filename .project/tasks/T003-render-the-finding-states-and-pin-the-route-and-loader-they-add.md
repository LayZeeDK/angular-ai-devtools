---
id: T003
title: Render the finding states and pin the route and loader they add
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-dead-click.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the finding states and pin the route and loader they add

## Context

T002 produces the judgement. This task renders it: a surface at route `dead-click` that names each
event whose consequent never arrived, with the window it was judged over, states `clean` with the
counts compared, and reports `cannot-tell` when the window cannot be bounded.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-dead-click.ts` rendering `findings`, `clean` and
`cannot-tell`, its route, its `dead-click` key in `panel-demo.ts` `LOADERS`, and update every suite
that enumerates the route table. Prove the loader-key mutant reddens naming the surface, then restore
it.

## Intent coverage

- SC1
- SC2

## Interface contract

`deadClick(record)` receives the page record and returns `{ state, findings, considered, reason }`.
`state` is one of `findings`, `clean`, `cannot-tell`; `findings` is an array of
`{ chain, event, window }` where `event` carries the record's own fields for the dangling start and
`window` names the bounds the judgement used; `considered` is the number of events that belong to a
measured chain; `reason` is present only when `state` is `cannot-tell` and is a member of a closed set
exported by the module. No other file implements this function, and no caller reads the page or a
clock.

## Files

  - apps/angular-ai-devtools/src/app/panel-dead-click.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs

## Acceptance criteria

1. The route renders findings, clean and cannot-tell, and every suite that enumerates the route table names it.
2. Removing the loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and names no cause the finding does not state.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-dead-click.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs scripts/component-search.test.mjs scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs
```

## Log

- pending.
