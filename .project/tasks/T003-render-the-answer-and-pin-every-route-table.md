---
id: T003
title: Render the answer and pin every route table
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-guard-phase.ts
  - apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/panel-copy.test.mjs
  - research/raw/m061-surface.json
  - research/raw/m048-surface-copy.json
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
  - scripts/component-search.test.mjs
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/locale-correctness-shapes.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the answer and pin every route table

## Goal

One new panel surface rendering exactly the join object, with every list that enumerates the route table moved in the same commit.

## Context

M062 paid for this three times: the route table lives in `app.routes.ts` and is enumerated by `app.spec.ts`, `page-picker.component.spec.ts`, three separate lists in `chat-entry.component.spec.ts`, `panel-routes.test.mjs` and the copy records. The chat-entry spec holds the full path list, the loader-map list and the lazy-route list; missing the third cost a whole repair wave.

## Approach

Add the surface, its loader key, the sample fact, the route entry and every pin in one commit. Mutant: add the route without a loader key and require `panel-routes.test.mjs` to redden naming the key.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC4

## Acceptance criteria

1. SC4: the surface renders the join object and nothing else; a mutant that renders a remedy reddens.
2. SC4: the route table, loader map, `app.spec.ts`, all three chat-entry lists and the copy records move together; a mutant that adds the route without a loader reddens naming the key.

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/panel-copy.test.mjs && npx prettier --check apps/angular-ai-devtools/src/app/panel-guard-phase.ts apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
```

## Log

- pending.
