---
id: T003
title: Render the field set and the absent rule on the panel
wave: 2
status: done
deps: [T002]
agent: build_T003
base: bb8688a87ec9f45ff4db26934fbd3985b88893b9
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-fields.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-fields.test.mjs
---

# T003 — Render the field set and the absent rule on the panel

## Context

T002 produces the read. The plan's surface contract `### panel — T003` names the four states and what each may say.

## Approach

A standalone surface rendering `loading`, `fields`, `cannot-tell` and `error` from a fact list it is given. It
shows each field's validity and its own errors, the submit state, and the absence state, and adds nothing the list
does not support (N4).

## Interface contract

None

## Files

- `apps/angular-ai-devtools/src/app/panel-fields.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/panel-fields.test.mjs`

## Acceptance criteria

1. Every state renders from the supplied fact list, including the cannot-tell state naming the rule's existence (held-out E4).
2. The route is registered and the panel's route-list pin is re-cut to include it, proved by renaming the route.
3. No rendered string names the cross-field rule, a field's value, or a reason beyond the field's own error.
4. Mutants redden: rendering the cannot-tell state as an empty pane, and naming the rule.

## Verify

```bash
npm ci --include=dev; node --test scripts/panel-fields.test.mjs
```

## Intent coverage

- SC4

## Log

- dispatched
