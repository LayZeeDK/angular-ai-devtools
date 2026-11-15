---
id: T003
title: Render the join and pin the routes it adds
wave: 3
deps:
  - T002
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/after-render-fixture.test.mjs
  - scripts/console-panel-render.test.mjs
---

# T003 — Render the join and pin the routes it adds

## Context

The surface renders the join and nothing else. Adding a route stales every suite that enumerates the route table, so all of them are declared here rather than discovered at the gate.

## Approach

- Add the panel surface rendering `state` and `findings` only.
- Add its `LOADERS` entry in `panel-demo.ts` and its route in `app.routes.ts`.
- Update the route-count pins in `app.spec.ts`, `page-picker.component.spec.ts` and `scripts/after-render-fixture.test.mjs`.
- Add `scripts/console-panel-render.test.mjs` pinning that the rendered surface carries no cause, element, remedy or unattributed angular wording (E7).

## Acceptance criteria

1. The surface renders the join's findings and state; a fixture whose join reports `captured-nothing` renders that, not an empty list.
2. A finding whose code has no digest entry renders the code, and a rendering that prints a count instead reddens naming the count.
3. The route exists and every suite that enumerates the route table is updated in this task's own diff.
4. Held-out E7 is pinned by the render suite: it reddens when a cause, an element reference or a remedy sentence is added to the surface.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC3
- SC4
- SC5

## Verify

```bash
node --check scripts/console-panel-render.test.mjs && node --test scripts/console-panel-render.test.mjs scripts/after-render-fixture.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts
```

## Log

- Task written at plan approval; not started.
