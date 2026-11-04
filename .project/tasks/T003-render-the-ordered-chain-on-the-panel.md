---
id: T003
title: Render the ordered chain on the panel
wave: 2
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/after-render.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-after-render.test.mjs
---

# T003 — Render the ordered chain on the panel

## Context

M028 explains why an `afterNextRender` read of `offsetWidth` saw 0, from the ordered profiler after-render
events the page agent already records. The profile exists in the extension; the fixture subject must be
created. See `.project/research/evidence-m028-premise.md`.

## Approach

A surface that renders the ordered chain or the `cannot-tell` state from the chain it is given, in the three states the surface contract names. It adds no prose the chain does not support (N4). Register the route and re-pin the route-list assertion.

## Interface contract

None

## Files

- `apps/angular-ai-devtools/src/app/after-render.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/panel-after-render.test.mjs`

## Acceptance criteria

1. The surface renders the chain in emission order, and the `cannot-tell` state when the chain is empty (held-out E4).
2. Rendering an unknown event yields the `unknown` state rather than throwing.
3. The route-list assertion is re-pinned and reddens when the surface route is removed.

## Verify

```bash
npm ci --include=dev; node --test scripts/panel-after-render.test.mjs
```

## Intent coverage

- SC4

## Log

- dispatched
