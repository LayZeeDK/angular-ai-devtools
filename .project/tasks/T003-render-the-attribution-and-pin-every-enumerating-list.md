---
id: T003
title: Render the attribution and pin every enumerating list
wave: 3
status: done
deps: 
- T002
agent: build_T003
base: 126d6a91e38e242189077e1c2952b58be1c76e63
worktree: null
task_branch: null
files:
- apps/angular-ai-devtools/src/app/panel-schema.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/panel-routes.test.mjs
- scripts/after-render-fixture.test.mjs
- research/raw/m030-router-config.json
- spikes/ng222-app/src/app/app.routes.ts
- extension/schema-attribution.js
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- scripts/chunk-failure-claims.test.mjs
- scripts/chunk-failure-copy.test.mjs
- scripts/component-search.test.mjs
- scripts/docs-correction.test.mjs
- scripts/field-state-capture.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/legacy-diagnostic-capture.test.mjs
- scripts/linked-state-capture.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/lint-observability.test.mjs
- scripts/onpush-metadata-capture.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/panel-copy.test.mjs
- apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
- apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
- scripts/navigation-blocking.test.mjs
- scripts/redirect-chain.test.mjs
- scripts/resource-graph-capture.test.mjs
- scripts/router-config-capture.test.mjs
- scripts/router-diagnostic-capture.test.mjs
- scripts/sanitizer-bypass.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-routing-shapes.test.mjs
- scripts/tutor-routing.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
- research/raw/m061-surface.json
---

# T003 — Render the attribution and pin every enumerating list

## Context

A surface that renders one field more than the join returns is the defect every surface milestone in this generation has paid for, so the render is asserted field for field and every list that enumerates the route table moves in this landing.

## Approach

One component that renders only the object the join returns; one `LOADERS` key; one route; the ordered path pins, the surface record and the fixture census in the same landing. A mutant that adds a `remedy` field reddens `panel-demo.spec.ts` naming it.

## Intent coverage

- SC2, SC3, SC4

## Acceptance criteria

- AC1: the task's `## Log` names the command that proved it and the string the mutant produced.
- AC2: the task's `## Log` names the command that proved it and the string the mutant produced.
- AC3: the task's `## Log` names the command that proved it and the string the mutant produced.

## Files

Every path this task may touch, and nothing else:

- `apps/angular-ai-devtools/src/app/panel-schema.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/panel-routes.test.mjs`
- `scripts/after-render-fixture.test.mjs`
- `research/raw/m030-router-config.json`
- `spikes/ng222-app/src/app/app.routes.ts`
- `extension/schema-attribution.js`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/chunk-failure-copy.test.mjs`
- `scripts/component-search.test.mjs`
- `scripts/docs-correction.test.mjs`
- `scripts/field-state-capture.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/legacy-diagnostic-capture.test.mjs`
- `scripts/linked-state-capture.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/lint-observability.test.mjs`
- `scripts/onpush-metadata-capture.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/panel-copy.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`
- `scripts/navigation-blocking.test.mjs`
- `scripts/redirect-chain.test.mjs`
- `scripts/resource-graph-capture.test.mjs`
- `scripts/router-config-capture.test.mjs`
- `scripts/router-diagnostic-capture.test.mjs`
- `scripts/sanitizer-bypass.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/tutor-routing-shapes.test.mjs`
- `scripts/tutor-routing.test.mjs`
- \tests/held-out/fixture-explainers-unchanged.test.mjs\n
## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/schema-attribution.js — the only reader of a schema attribution
export function schemaAttribution(record, facts) {
  return { state, field, node, input, reason, observed }
}
```

`state` is one of `declared`, `no-node`, `no-record`, `cannot-tell`. `node` and `input` are present only when the record
carries them; `reason` names why the attribution is absent.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && node --test scripts/after-render-fixture.test.mjs && npm run check
```

## Log

- pending

- `node --test scripts/panel-routes.test.mjs` reports 4 pass, 0 fail; `node --test scripts/after-render-fixture.test.mjs`
  reports 6 pass, 0 fail; `npm run check` is green through `format:check`; `npx nx run angular-ai-devtools:test` reports
  406 passed across 33 files, with `panel-demo.spec.ts` at 45 tests.
- Remedy mutant: adding `remedy` to the pane's `FIELDS` and `LABELS` reddens with `the schema pane must enumerate the
  join's 6 fields (state, field, node, input, reason, observed) in that order; it enumerates
  ["state","field","node","input","reason","observed","remedy"], and a key the answer does not carry — a remedy, a cause
  or a suggestion — is a line the join never produced`, 1 failed of 45.
- Route mutant: dropping the `schema` entry from `PANEL_SURFACES` reddens with `route schema must exist exactly once in
  PANEL_SURFACES, so exactly one route answers at its path`, 2 failed. Loader mutant: dropping the `schema` key reddens
  with `every app.routes.ts surface must have a panel-demo LOADERS key; missing: schema`, 1 failed.
- The surface record `research/raw/m061-surface.json` moves with this landing: it gains the `schema` row and its three
  counts go from 35/35/44 to 36/36/45, which is what `scripts/copy-check.test.mjs` and `scripts/panel-copy.test.mjs` read
  from the tree. Both pass at 31 and 10 with the record updated.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-schema.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `research/raw/m030-router-config.json`, `spikes/ng222-app/src/app/app.routes.ts`, `extension/schema-attribution.js`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `scripts/chunk-failure-claims.test.mjs`, `scripts/chunk-failure-copy.test.mjs`, `scripts/component-search.test.mjs`, `scripts/docs-correction.test.mjs`, `scripts/field-state-capture.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/legacy-diagnostic-capture.test.mjs`, `scripts/linked-state-capture.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/lint-observability.test.mjs`, `scripts/onpush-metadata-capture.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/panel-copy.test.mjs`, `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`, `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`, `scripts/navigation-blocking.test.mjs`, `scripts/redirect-chain.test.mjs`, `scripts/resource-graph-capture.test.mjs`, `scripts/router-config-capture.test.mjs`, `scripts/router-diagnostic-capture.test.mjs`, `scripts/sanitizer-bypass.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-routing-shapes.test.mjs`, `scripts/tutor-routing.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `research/raw/m061-surface.json` — each is read from this tree, ready.
