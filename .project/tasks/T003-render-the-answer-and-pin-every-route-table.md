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
  - apps/angular-ai-devtools/src/app/panel-outlet.ts
  - apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/panel-copy.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m048-surface-copy.json
  - research/raw/m061-surface.json
---

# T003 — Render the answer and pin every route table

## Goal

One new panel surface rendering exactly the join object, with every route table and the copy record moved together.

## Context

Five milestones have paid for a route-table pin declared too late: the spec, the fixture route count, the panel-routes census and the copy record all enumerate the table, so this task declares all four up front.

## Approach

Add the surface and its loader key, the route entry, the spec expectation, the fixture route count and the copy record in one commit. Mutant: add the route without a loader key and require the panel-routes census to redden naming the key.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC4

## Acceptance criteria

1. SC4: the surface renders the join object and nothing else; a mutant that renders a remedy reddens.
2. SC4: the route table, loader map, fixture route count and copy record move together; a mutant that adds the route without a loader reddens naming the key.

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs scripts/panel-copy.test.mjs && npx prettier --check apps/angular-ai-devtools/src/app/panel-outlet.ts apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
```

## Log

- Contract amended before this task ran, at the orchestrator's hand: the copy records that carry the surface and its
  spec (`research/raw/m048-surface-copy.json`) and the counts the panel-copy suite pins
  (`research/raw/m061-surface.json`) are now declared, because the first dispatch measured that writing the surface
  without them reddens two suites the contract does not own.
