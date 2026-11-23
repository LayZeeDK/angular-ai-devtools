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
  - apps/angular-ai-devtools/src/app/panel-chunk-failure.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/chunk-failure-copy.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/page-picker.component.spec.mjs
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/guard-verdict-claims.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/panel-copy.test.mjs
  - scripts/tutor-answer.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
  - apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
  - scripts/guard-record-shapes.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - research/raw/m061-surface.json
---

# T003 — Render the answer and pin every route table

## Goal

Render exactly the join's object in one new panel surface, and move every list that enumerates the surface in the same task.

## Context

The route table, the loader map, `app.spec.ts`, the panel route suite, the copy record and the three chat-entry lists all enumerate the surfaces; a surface added without them reddens by name.

## Approach

A standalone panel component with its own template, four states and no remedy. The loader key is the route's `data.surface`, and every list moves with it.

## Interface contract

The join exports exactly this shape, and the surface renders it and nothing else:

```js
{ state, specifier?, routePath?, status?, hash?, consideredCount?, reason? }
```

`state` is one of `missing-import` (the import failed and the record names the specifier), `never-completed` (the
request produced no response status), `resolved` (the import loaded, so there is no failure to report) or
`cannot-tell` (a reason string on its own). No field is synthesised: `hash` is present only when the record carried
one, and `status` only when a response arrived.

## Acceptance criteria

1. SC4: the surface renders each of the four states and nothing else, and a mutant that adds a remedy reddens by string.
2. SC4: a mutant that adds the route without a loader key reddens naming the key, and one that omits it from the fixture route table reddens naming the route.

## Intent coverage

- SC4

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/chunk-failure-copy.test.mjs scripts/after-render-fixture.test.mjs && npx nx run angular-ai-devtools:test
```

## Log

- pending.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-chunk-failure.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/chunk-failure-copy.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/page-picker.component.spec.mjs`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/panel-copy.test.mjs`, `scripts/tutor-answer.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`, `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`, `scripts/guard-record-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `research/raw/m061-surface.json` — each is read from this tree, ready.
