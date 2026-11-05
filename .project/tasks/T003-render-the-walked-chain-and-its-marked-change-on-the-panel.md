---
id: T003
title: Render the walked chain and its marked change on the panel
wave: 2
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-redirect.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-redirect.test.mjs
---

# T003 — Render the walked chain and its marked change on the panel

## Context

T002 produces the walk. The plan's surface contract `### panel — T003` names the four states and what each may say.

## Approach

A standalone surface rendering `loading`, `walked`, `cycle`, `gated` and `cannot-tell` from a chain it is given.
It marks the first route that changed the destination and adds no prose the chain does not support (N4).

## Interface contract

None

## Files

- `apps/angular-ai-devtools/src/app/panel-redirect.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/panel-redirect.test.mjs`

## Acceptance criteria

1. All states render from the supplied chain, and the first destination change is marked and no other (held-out E4).
2. The route is registered and the panel's route-list pin is re-cut to include it, proved by renaming the route.
3. No rendered string names what a guard decided or why a redirect happened.
4. Mutants redden: marking every change, and rendering the cycle state as an empty pane.

## Verify

```bash
npm ci --include=dev; node --test scripts/panel-redirect.test.mjs
```

## Intent coverage

- SC4

## Log

- dispatched
