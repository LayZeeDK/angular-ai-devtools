---
id: T003
title: Render the join on one panel surface and move every pin with it
wave: 3
status: done
deps: []
agent: build_T003
base: ed11d120640242d74941f650aa027f35e35f9bd4
worktree: null
task_branch: null
files:
- apps/angular-ai-devtools/src/app/panel-head-state.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- scripts/panel-routes.test.mjs
- research/raw/m061-surface.json
- scripts/gate-integrity.test.mjs
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/chunk-failure-claims.test.mjs
- scripts/chunk-failure-copy.test.mjs
- scripts/component-search.test.mjs
- scripts/copy-check.test.mjs
- scripts/field-binder-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/locale-correctness-shapes.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/panel-copy.test.mjs
- scripts/tutor-answer.test.mjs
- apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts
- apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
- scripts/guard-record-shapes.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the join on one panel surface and move every pin with it

## Context

Every surface this programme adds is one route, one loader key and one ordered path pin, and omitting one of them reddens a suite the task did not name. M067 measured six suites moving for one surface, and the copy record `research/raw/m061-surface.json` moving with them.

## Approach

One surface rendering exactly the object the join returns: the state, the entry, the entry still present, the writing navigation and the reason. The route table, the loader map, the surface record and the ordered path pins move in the same landing.

## Intent coverage

- SC4

## Acceptance criteria

1. The surface renders the five keys the join returns and nothing else; a mutant that adds a remedy reddens it by name.
2. The route, the loader key, the surface record and the ordered path pins are all present, and a mutant that drops any one of them reddens the suite naming it.
3. Every suite that enumerates the route table is declared in this task and re-derived in this landing, and the copy record counts name the new surface.

## Files

Every path this task may touch, and nothing else:

- `apps/angular-ai-devtools/src/app/panel-head-state.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `scripts/panel-routes.test.mjs`
- `research/raw/m061-surface.json`
- `scripts/gate-integrity.test.mjs`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/chunk-failure-copy.test.mjs`
- `scripts/component-search.test.mjs`
- `scripts/copy-check.test.mjs`
- `scripts/field-binder-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/locale-correctness-shapes.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/panel-copy.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `tests/held-out/fixture-explainers-unchanged.test.mjs`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/head-state.js — the only reader of a document head entry's state
export function headState(record, facts) {
  return { state, entry, present, writtenBy, reason, observed }
}
```

`state` is one of `current`, `stale`, `duplicate`, `cannot-tell`. `present` and `writtenBy` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
node --test scripts/panel-routes.test.mjs
```

## Log

- pending
- 2026-11-25: `panel-head-state.ts` renders the join's five keys in order and never the record quote; Verify 4/4, app suite 413/413 across 33 files, `npm run check` exit 0.
- 2026-11-25: every pin moved in this landing and each is a re-derivation: `PANEL_SURFACES` 37 to 38, `LOADERS` 37 to 38, ordered paths 46 to 47, lazy pins 41 to 42, the surface census 37 to 38, and the copy record to 38/38/47. Where an added line would have moved a cited line, a prose fold paid for it, so the seven citations that `m064-verdict-claims.json` resolves kept their numbers.
- 2026-11-25: two mutants proved live. A `remedy` key added to the surface reddens with "it renders [state, entry, present, writtenBy, reason, remedy], and a key the answer does not carry — a remedy, a cause or an inferred navigation — is a line the join never produced". Dropping `head-state` from `PANEL_SURFACES` reddens with "PANEL_SURFACES must carry the head-state entry this surface answers at, and it does not".
- 2026-11-25: the census row owed from T002 landed here as the printed `Object.assign` block, and `T004 AC4` is green with it: 228 suites compared, 76 differ, 203 assertion lines removed of which 203 were re-cut and 0 dropped.
- 2026-11-25: the panel was rebuilt before the bundle pin, which then read 534.67 kB against the 535.44 kB baseline — a fresh build, not a budget change.
- 2026-11-25: three reds are pre-existing and owned elsewhere, measured at the base in a detached worktree: the claims censuses need `research/raw/m068-verdict-claims.json` (T006), `teardown-leak-shapes` needs `m059-record-shapes` re-captured (`recordsSearched` 167 to 168, T005), and the held-out corpus cannot see the new surface until it is tracked, which this landing does.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-head-state.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `scripts/panel-routes.test.mjs`, `research/raw/m061-surface.json`, `scripts/gate-integrity.test.mjs`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/chunk-failure-claims.test.mjs`, `scripts/chunk-failure-copy.test.mjs`, `scripts/component-search.test.mjs`, `scripts/copy-check.test.mjs`, `scripts/field-binder-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/locale-correctness-shapes.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/panel-copy.test.mjs`, `scripts/tutor-answer.test.mjs`, `apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts`, `apps/angular-ai-devtools/src/app/panel-outlet.spec.ts`, `scripts/guard-record-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs` — each is read from this tree, ready.
