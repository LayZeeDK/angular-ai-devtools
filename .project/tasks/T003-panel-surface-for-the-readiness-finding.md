---
id: T003
title: Panel surface for the readiness finding
wave: 2
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-onpush.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/panel-onpush.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/router-diagnostic.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Panel surface for the readiness finding

## Context

T002 produces the finding. The panel must render it without adding anything the fact list did not carry, and the route
must be reachable through the demo's loader map — the gap that cost M032 an extra task. The three route-table pins and
the router-diagnostic count pin are declared here so the landing cannot be refused for an undeclared file.

## Approach

A surface in the shape the sibling surfaces already use: normalise the fact list, render only the component, the
strategy and the readiness facts, and drop anything else. Register the route with `data.surface` and a sample fact, and
re-cut every count pin the new route moves.

## Interface contract

`onpushReadiness(fact) -> { state: "finding" | "cannot-tell", component?, strategy?, facts?, reason? }` — pure, no DOM.

## Files

- `apps/angular-ai-devtools/src/app/panel-onpush.ts` — the surface
- `apps/angular-ai-devtools/src/app/panel-demo.ts` — the loader and a sample fact
- `apps/angular-ai-devtools/src/app/app.routes.ts` — the `/onpush` route
- the route-table pins — re-cut to the measured count
- `scripts/panel-onpush.test.mjs`, `scripts/panel-routes.test.mjs` — the surface and the surfaces-versus-loaders check

## Acceptance criteria

1. Held-out E4: the surface renders the component, the strategy and the readiness facts from a short fact list, and renders the cannot-tell state with its reason and no blocker.
2. A fact list carrying a blocker, a verdict or an element renders none of the three.
3. The `/onpush` route is registered with `data.surface`, reachable from the demo's loader map, and the surfaces-versus-loaders check names `onpush` when its loader is removed.
4. Every route-table pin this route stales is re-cut to the measured count, and a pin the change does not move is left byte-identical.

## Verify

```bash
node --experimental-strip-types --test "scripts/panel-onpush.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs" && npx tsc -p apps/angular-ai-devtools/tsconfig.check.json
```

## Intent coverage

- SC4

## Log

- dispatched
