---
id: T003
title: Render the answer and pin every route table
wave: 3
status: done
deps: [T002]
agent: build_T003
base: 6c5e2f8cc5b7443dd7098fad5c2ec71e99d2dedd
worktree: null
task_branch: null
files:
- apps/angular-ai-devtools/src/app/panel-title-input.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- scripts/panel-routes.test.mjs
- scripts/after-render-fixture.test.mjs
- research/raw/m030-router-config.json
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/chunk-failure-claims.test.mjs
- scripts/chunk-failure-copy.test.mjs
- scripts/component-search.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/panel-copy.test.mjs
- scripts/redirect-chain.test.mjs
- apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
- apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-routing-shapes.test.mjs
- scripts/tutor-routing.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
- research/raw/m061-surface.json
---

# T003 — Render the answer and pin every route table

## Context

T002's join returns one object per navigation. The panel renders one object per surface, and
every surface is enumerated by four lists that must move in the same task: the route table
(`apps/angular-ai-devtools/src/app/app.routes.ts`), the `LOADERS` map (`panel-demo.ts`), the ordered route pins in
`app.spec.ts` and `page-picker.component.spec.ts`, and the fixture's route count in
`scripts/after-render-fixture.test.mjs:127`. `scripts/panel-routes.test.mjs` asserts every `data.surface` has a loader.

This is the fourth time in this programme that a route-table suite was omitted from a task's `files:`; `plan-lint`'s
`pinned-file` names them, and they are declared here rather than discovered at the gate.

## Approach

One new surface component rendering exactly the join's object — no field added, none renamed, no remedy and
no cause. Register the route, its loader key and every enumerating suite in the same task. Re-capture
`research/raw/m030-router-config.json`, which enumerates the route table.

## Interface contract

`titleInput(record: object, facts: object) -> { state, strategy?, documentTitle?, impliedTitle?, observedWrites?, reason? }`

## Files

Every path this task may touch, and nothing else:

- apps/angular-ai-devtools/src/app/panel-title-input.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- scripts/panel-routes.test.mjs
- scripts/after-render-fixture.test.mjs
- research/raw/m030-router-config.json
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/chunk-failure-claims.test.mjs
- scripts/chunk-failure-copy.test.mjs
- scripts/component-search.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/panel-copy.test.mjs
- scripts/redirect-chain.test.mjs
- apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
- apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-routing-shapes.test.mjs
- scripts/tutor-routing.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
- research/raw/m061-surface.json

## Acceptance criteria

1. The surface renders the join's object field for field; a mutant that adds a remedy, a cause or a strategy
   the object does not carry reddens `scripts/panel-routes.test.mjs` naming the surface.
2. Every list that enumerates a surface moves in this task: dropping any one of the four reddens by name, and the
   `data.surface` key equals the `LOADERS` key.
3. `node --test scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs && npx nx run angular-ai-devtools:test`
   passes, and the copy record for the surface is written with the same task.

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs && npx nx run angular-ai-devtools:test
```

## Intent coverage

- SC1, SC3, SC4

## Log

- scaffolded

- **Out-of-family audit of the claims-suite repair (GLM-5.3 Flash, read-only) found a hole in
  `atRecordedDocumentLocations`: it compares basenames only** (`scripts/chunk-failure-claims.test.mjs:504-505`), and the
  recorded directory is copied verbatim into the expectation, so a record edited to
  `.project/backup/intent/INTENT.md` and `.project/elsewhere/PLAN.md` — directories that do not exist — passes green,
  where the string comparison it replaced reddened. That makes the two document locations the only stated locations in
  the suite exempt from pointing at a real file, contradicting its own rule 3.
- The verdict is `revert and use the cheaper shape`, and the shape is three lines: derive the capture-time spelling from
  the resolved path (`^`.project/archive/\d{3}-[^/]+/((?:intent|plan)/(?:INTENT|PLAN)\.md)` → `.project/$1`) and rebase
  `derived()` and the `quotes.edges` occurrences with it, so the comparison stays exact `deepEqual`, the record
  contributes nothing to its own expectation, and any mutation of the recorded paths reddens.
- **This must be applied before T003 lands.** It is not a follow-up: the task's own criterion is that the repair does
  not weaken what the suite asserts, and as it stands it does.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-title-input.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `research/raw/m030-router-config.json`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/chunk-failure-claims.test.mjs`, `scripts/chunk-failure-copy.test.mjs`, `scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/panel-copy.test.mjs`, `scripts/redirect-chain.test.mjs`, `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`, `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-routing-shapes.test.mjs`, `scripts/tutor-routing.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `research/raw/m061-surface.json` — each is read from this tree, ready.
