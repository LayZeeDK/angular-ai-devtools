---
id: T004
title: The panel explains the finding from a fact list
wave: 3
status: done
deps: []
agent: build_T004
base: 70139451e34eb5f8de5e4d25578892d353e68c6c
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/image-budget.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - scripts/image-budget.test.mjs
---

# T004 — The panel explains the finding from a fact list

## Context

See `.project/intent/INTENT.md` and `.project/research/evidence-image-codes.md`. The measured image code set is
thirteen codes: `NG0913` plus `NG2952` through `NG2967`. The roadmap's `NG02200` through `NG02800` range does not
exist in Angular 22.2.

## Approach

Render the finding and its explanation in the panel from a short fact list, inside the registry envelope, with no tool calling outside it. The wording names the binding without reading as a layout recommendation.

## Interface contract

None

## Acceptance criteria

1. The panel renders the finding and its explanation from a fact list, with no tool call outside the registry envelope.
2. The wording names the binding and contains no recommendation to change layout.
3. A finding for an unknown code renders the unknown state rather than invented text.
4. Acceptance is held-out E5: an unknown code renders the unknown state rather than invented text.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-budget.test.mjs
```

## Held-out

held-out E5 — an unknown code renders unknown.

## Intent coverage

- SC5

## Log

- created
- T004 ready: image-budget surface with empty/loading/unknown/success states
