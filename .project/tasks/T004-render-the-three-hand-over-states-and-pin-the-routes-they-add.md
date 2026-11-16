---
id: T004
title: Render the three hand-over states and pin the routes they add
wave: 3
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-copy-to-agent.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - scripts/panel-routes.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T004 — Render the three hand-over states and pin the routes they add

## Context

The join from T003 exists and nothing renders it. The panel's other surfaces each own a route and a
`LOADERS` key in `panel-demo.ts`, and `app.spec.ts` pins the route table, so adding a surface without these three is
the omission that has blocked this programme's gate in three milestones.

## Approach

Add the surface component, its route, its `LOADERS` key and its `FACTS` entry, and extend the two route
pins in the same commit. The surface renders three states: `handed-over`, `absence-carried` and `cannot-tell`.

## Intent coverage

- SC1 — AC1, AC3
- SC2 — AC1

## Interface contract

None

## Files

  - apps/angular-ai-devtools/src/app/panel-copy-to-agent.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - scripts/panel-routes.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts

## Acceptance criteria

- AC1 Each of the three states renders its own sentence, and no state names a cause, element or remedy the finding does not carry.
- AC2 `panel-routes.test.mjs` compares every route's `data.surface` against a `LOADERS` key, and a mutant that drops the new key reddens it naming the surface.
- AC3 `app.spec.ts` pins the route table including the new route.

## Verify

```bash
node --test scripts/panel-routes.test.mjs
npm run check
npx prettier --check apps/angular-ai-devtools/src/app/panel-copy-to-agent.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
