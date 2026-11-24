---
id: T009
title: Measure the records the maps never counted
wave: 9
status: pending
deps: []
agent: null
base: null
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
