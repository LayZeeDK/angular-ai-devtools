---
id: T009
title: Measure the records the maps never counted
wave: 9
status: done
deps: []
agent: build_T009
base: 076dc77a907aa66e1421ac1aa83e64dc3d5992be
worktree: null
task_branch: null
files:
- research/raw/m059-record-shapes.json
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/chunk-failure-claims.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/teardown-leak.test.mjs
- scripts/navigation-blocking.test.mjs
- research/raw/m055-record-shapes.json
---

# T009 — Measure the records the maps never counted

## Context

Three suites are red for one reason T008 named precisely: no record-shapes map measures
`research/raw/m066-verdict-claims.json`, and `research/raw/m059-record-shapes.json` counts a tree that has since grown by
two records (`recordsSearched` 165 to 167). Neither cause is drift in a product file.

## Approach

Re-derive each map at this head through its own armed flag, and add the row that makes the new verdict-claims records
measured rather than absent. Re-derive, never retune: a count that moved because the tree grew is a reading, and a count
that moved while the tree did not is a defect to be reported rather than absorbed.

## Intent coverage

- SC4

## Acceptance criteria

1. `scripts/teardown-leak-shapes.test.mjs` reports zero failures, and its record states the record count this head actually holds.
2. `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs` report zero failures, and every verdict-claims record the tree holds is measured by the map or named as an exception.
3. `research/raw/m059-record-shapes.json` is written only by its armed run, is idempotent on a second armed pass, and a default run writes nothing.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m059-record-shapes.json`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/teardown-leak.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `research/raw/m055-record-shapes.json`

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
node --test scripts/teardown-leak-shapes.test.mjs scripts/tutor-record-shapes.test.mjs
```

## Log

- pending
- 2026-11-23: esearch/raw/m059-record-shapes.json\ re-derived by its armed run and idempotent: ecordsSearched\ 165 to 167, the quoted line 3250 to 3433 inside m044-gate-shapes, and the handle-absence finding now interpolated from the scan instead of typed.
- 2026-11-23: the two tutor suites went green when T010 gave the m055 map its writer, so this task landed on the far side of that repair rather than retuning anything into the map it cannot write.
- 2026-11-23: Verify 32 tests / 32 pass across teardown-leak-shapes and tutor-record-shapes; pm run check\ exit 0 and prettier clean.
- Landed paths: `research/raw/m059-record-shapes.json`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/chunk-failure-claims.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/teardown-leak.test.mjs`, `scripts/navigation-blocking.test.mjs`, `research/raw/m055-record-shapes.json` — each is read from this tree, ready.
