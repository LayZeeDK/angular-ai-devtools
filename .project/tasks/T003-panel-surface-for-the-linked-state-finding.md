---
id: T003
title: Panel surface for the linked-state finding
wave: 3
status: pending
deps:
  - T002
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-linked-state.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/panel-linked-state.test.mjs
  - scripts/router-diagnostic.test.mjs
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Panel surface for the linked-state finding

## Context

The join reports matching, differing and cannot-tell. The pane must render each
without inventing a cause, and must not enumerate the states it knows — a state it
was not written for must still render.

## Approach

Follow `panel-lint.ts` and `panel-legacy.ts` exactly. Register the route and the
demo loader, and re-cut every pin the new route moves.

## Interface contract

`linkedState(fact) -> { state, signal?, source?, value?, sourceValue?, reason? }`
where `state` is `finding` or `cannot-tell`, and both tasks that touch it share this
exact line.

## Files

- `apps/angular-ai-devtools/src/app/panel-linked-state.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/panel-routes.test.mjs`
- `scripts/panel-linked-state.test.mjs`
- `scripts/router-diagnostic.test.mjs`

## Acceptance criteria

1. Each of the four states renders its own text, and nothing it was not given. **held-out E5:** each state renders its own text and nothing else.
2. A finding carrying a state the pane was not written for still renders the state it was given.
3. The route, the demo loader and every count pin are re-cut to the measured values, with the failing assertion quoted for each.
4. A mutant that renders a cause the fact list does not carry reddens, naming the defect.

## Verify

```bash
node --experimental-strip-types --test "scripts/panel-linked-state.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/app/panel-linked-state.ts
```

## Intent coverage

- SC5 — AC1

## Log

- dispatched
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `tests/held-out/fixture-explainers-unchanged.test.mjs`
