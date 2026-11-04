---
id: T003
title: Render the fact list and the unattributable state on the panel
wave: 2
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-sanitizer.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-sanitizer.test.mjs
---

# T003 — Render the fact list and the unattributable state on the panel

## Context

T002 produces the finding. The plan's surface contract `### panel — T003` names the four states and what each may say.

## Approach

A standalone surface rendering `loading`, `stripped`, `cannot-tell` and `deliberate` from a fact list it is
given. It adds no prose the facts do not support (N4): no tag, no attribute, no removed substring, no cause.

## Interface contract

None

## Files

- `apps/angular-ai-devtools/src/app/panel-sanitizer.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/panel-sanitizer.test.mjs`

## Acceptance criteria

1. All four states render from the supplied fact list, and `loading` is shown rather than an empty list (held-out E4).
2. The route is registered and the panel's route-list pin is re-cut to include it, proved by renaming the route.
3. No rendered string names a tag, an attribute, a removed substring, or a cause.
4. Mutants redden: rendering `stripped` with a removed tag, and showing `cannot-tell` as an empty pane.

## Verify

```bash
npm ci --include=dev; node --test scripts/panel-sanitizer.test.mjs
```

## Intent coverage

- SC4

## Log

- dispatched
