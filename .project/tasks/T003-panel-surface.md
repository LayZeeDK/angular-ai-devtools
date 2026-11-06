---
id: T003
title: Panel surface for the router finding
wave: 2
status: pending
deps:
  - T002
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-router.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-router.test.mjs
  - scripts/panel-routes.test.mjs
---

# T003 — Panel surface for the router finding

## Context

The four existing panel surfaces render a short fact list and drop anything the facts do not support. M032's surface
learned one extra lesson the hard way: installing a route is not enough, because `panel-demo.ts` owns the loader map
that a demo route resolves through, and a surface with no loader key renders the demo's error branch. This task does
both, and `scripts/panel-routes.test.mjs` already checks that every declared surface has a loader.

## Approach

A surface function that returns `{ state, message, lines, text }` from a fact list, plus a demo loader entry and a
sample fact so `/panel/router` renders a real state. The surface renders the route, the finding and the remedy when
the finding carries them, and the cannot-tell state with its reason and no route otherwise.

The route table is pinned by `chat-entry.component.spec.ts`, so the pin is re-cut in the same task that changes it.

## Interface contract

`routerDiagnostic(messages, facts) -> { state: "finding" | "cannot-tell", segment?, code?, message?, consideredCount?, reason? }` — pure, no DOM.

## Files

- `apps/angular-ai-devtools/src/app/panel-router.ts` — the surface.
- `apps/angular-ai-devtools/src/app/panel-demo.ts` — the loader map and a sample fact.
- `apps/angular-ai-devtools/src/app/app.routes.ts` — the route entry.
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts` — the route pin.
- `scripts/panel-router.test.mjs` — the surface suite.
- `scripts/panel-routes.test.mjs` — every surface has a loader.

## Acceptance criteria

1. Held-out E4: the surface renders the unmatched segment, the statement that none of the configured routes matches it,
   and the code, from a short fact list.
2. The cannot-tell state renders its reason and **no** segment-level claim about why the navigation failed.
3. A fact list carrying a guard verdict, a resolver outcome or a redirect decision renders none of them.
4. `/panel/router` resolves the surface rather than the demo's error branch, and the loader check reddens when the
   `router` key is removed.
5. An empty fact list renders the loading state, never an empty table that reads as "no route is at fault".
6. `npm run check:panel` and the app suite pass.

## Verify

```bash
node --experimental-strip-types --test "scripts/panel-router.test.mjs" "scripts/panel-routes.test.mjs"
```

## Intent coverage

- SC4

## Log

- dispatched
