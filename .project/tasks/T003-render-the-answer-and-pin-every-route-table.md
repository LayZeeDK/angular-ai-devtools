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
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-error-routing.ts
  - research/raw/m048-surface-copy.json
  - research/raw/m060-surface.json
  - scripts/after-render-fixture.test.mjs
  - scripts/component-search.test.mjs
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/panel-routes.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the answer and pin every route table

## Goal

Add one panel surface that renders exactly the object T002 returns, and move every enumerating suite in the same
task: the route table, the loader map, the digest row count, the copy record and the fixture route pin.

## Context

The panel carries 29 surfaces and 38 ordered paths after M059. Adding a surface moves each census: the route spec,
the fixture's route pin, the copy record's row count and the surface record. M059 landed this step only after four
refusals, all of them a census left out, which is why they are declared here rather than discovered.

## Approach

`panel-error-routing.ts` exports `errorRoutingPanel`, rendering each of the four states, the message, the code, the
owner and the phase line, or the named absence that replaces it. `panel-demo.ts` gains the loader key; `app.routes.ts`
gains the route; the digest and copy records are re-derived by their own captors; every pin moves in this commit.

## Interface contract

T001 publishes the record-shapes record: its records section lists the artefacts it measured and its inventory names the records outside the map with a why that cites the task; its producer section names the global error listener and the boundary entries with their limits; its absence section names phase-not-recorded with its counts. T002 publishes errorRouting(records) on globalThis.angularAiErrorRouting, taking { errors, boundaries, handler } and returning { state, message, code, owner, phase, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route error-routing in PANEL_SURFACES, the LOADERS key error-routing, the exported errorRoutingPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree, with the quotes and ruling sections the navigation census derives. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC6
- SC1
- SC3

## Acceptance criteria

1. SC6: the surface renders each of the four states and, in every one, the message, the code, the owner or its
   absence, and the phase line or `phase-not-recorded`; a mutant that renders a blank phase line reddens.
2. SC6: the route table, the loader map, the digest row count, the copy record and the fixture route pin move in
   this commit; a surface without a loader key reddens naming it.
3. SC1: the rendered finding contains no remedy, no cause and no handler identity the object did not carry; a
   mutant that renders a schematic reddens.

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/copy-check.test.mjs scripts/after-render-fixture.test.mjs && npx prettier --check apps/angular-ai-devtools/src/app/panel-error-routing.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts research/raw/m060-surface.json && npm run check
```

## Log

- pending.
