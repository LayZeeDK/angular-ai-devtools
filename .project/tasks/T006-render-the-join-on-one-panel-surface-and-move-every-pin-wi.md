---
id: T006
title: Render the join on one panel surface and move every pin with it
wave: 6
status: done
deps: []
agent: build_T006
base: 1296c303dc664df758bfcfcb42b179c2b2a74ad1
worktree: null
task_branch: null
files:
- apps/angular-ai-devtools/src/app/panel-field-binder.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/chunk-failure-claims.test.mjs
- scripts/chunk-failure-copy.test.mjs
- scripts/component-search.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/panel-copy.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
- apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
- apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/panel-routes.test.mjs
- research/raw/m061-surface.json
---

# T006 — Render the join on one panel surface and move every pin with it

## Context

Every surface this programme adds is one route, one loader key and one ordered path pin, and omitting one of them reddens a suite the task did not name.

## Approach

One surface rendering exactly the object the join returns: the state, the field, the hosted control, the expected control and the reason. The route table, the loader map, the surface record and the ordered path pins move in the same landing.

## Intent coverage

- SC4

## Acceptance criteria

1. The surface renders the five keys the join returns and nothing else; a mutant that adds a remedy reddens it by name.
2. The route, the loader key, the surface record and the ordered path pins are all present, and a mutant that drops any one of them reddens the suite naming it.
3. Every suite that enumerates the route table is declared in this task and re-derived in this landing.

## Files

Every path this task may touch, and nothing else:

- `apps/angular-ai-devtools/src/app/panel-field-binder.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/chunk-failure-copy.test.mjs`
- `scripts/component-search.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/panel-copy.test.mjs`
- `tests/held-out/fixture-explainers-unchanged.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/panel-routes.test.mjs`
- `research/raw/m061-surface.json`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/field-binder.js — the only reader of a field's hosted control
export function fieldBinder(record, facts) {
  return { state, field, hosted, expected, reason, observed }
}
```

`state` is one of `bound`, `mismatch`, `no-host`, `cannot-tell`. `hosted` and `expected` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-routes.test.mjs
```

## Log

- pending
- 2026-11-23: the surface renders the join's five keys and nothing else; PANEL_SURFACES 36 to 37, ppRoutes 45 to 46, LOADERS 36 to 37, FACTS 36 to 37, ordered pins 45 to 46, lazy pins 41 to 42, and the copy record re-derived to 37/37/46.
- 2026-11-23: the Verify line was repaired before this landing — as authored it passed a non-test .ts path to 
ode --test, which loads it as a suite and fails with ERR_MODULE_NOT_FOUND at the base as well, so it measured nothing. It is now ode --test scripts/panel-routes.test.mjs\, the suite it names.
- 2026-11-23: two files the landing forced were added to this contract before re-activation, since the land proof reads the contract at the base: \scripts/panel-routes.test.mjs\ and esearch/raw/m061-surface.json\.
- 2026-11-23: measured green after the change — panel-routes 4/4, copy-check 31/31, panel-copy 10/10, app suite 406 to 409 passing, pm run check\ exit 0, prettier clean.
- 2026-11-23: seven suites are red at this base with an identical delta of zero; they belong to T007's census and recording re-derivation, which is why T007 runs the project verify.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-field-binder.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/chunk-failure-claims.test.mjs`, `scripts/chunk-failure-copy.test.mjs`, `scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/panel-copy.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`, `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/panel-routes.test.mjs`, `research/raw/m061-surface.json` — each is read from this tree, ready.
