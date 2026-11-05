---
id: T003
title: Render the diagnostic and its construct in the panel
wave: 2
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-lint.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-lint.test.mjs
  - apps/angular-ai-devtools/src/app/app.spec.ts
---

# T003 — Render the diagnostic and its construct in the panel

## Context

T002 produces the finding. The panel has no surface for it, and the route table gains an entry, which the chat-entry spec pins.

## Approach

A surface taking a short fact list and rendering the four states the plan's surface contract names, with the route installed through the demo component the panel already uses.

## Interface contract

`lintPanel(result?) -> { state, message, lines, text }` — pure, rendering only what the fact list carries.

## Files

- `apps/angular-ai-devtools/src/app/panel-lint.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/panel-lint.test.mjs`

- `apps/angular-ai-devtools/src/app/app.spec.ts`
## Acceptance criteria

1. E4: a finding renders the construct, the code and the message, and names no cause the message does not state.
2. E4: a "cannot tell" fact renders its reason and no construct.
3. E4: an empty fact list renders the loading state, never an empty table that reads as "nothing was wrong".
4. A mutant reddens: inlining a cause into the rendered text fails the no-invented-cause pin.

## Verify

```bash
npm run check:panel; node --test scripts/panel-lint.test.mjs
```

## Intent coverage

- SC4

## Log

- dispatched
