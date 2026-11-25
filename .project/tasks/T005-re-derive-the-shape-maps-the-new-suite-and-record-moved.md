---
id: T005
title: Re-derive the shape maps the new suite and record moved
wave: 5
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- research/raw/m055-record-shapes.json
- research/raw/m057-record-shapes.json
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-signals-shapes.test.mjs
- scripts/tutor-signals.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/navigation-blocking.test.mjs
---

# T005 — Re-derive the shape maps the new suite and record moved

## Context

The shape maps count the records and the edge vocabulary under `research/raw/`. The record T001 writes adds a record, and the claims record T006 writes adds an edge table, so both maps move at this head.

## Approach

Re-derive each through its own arm — the m055 map now has a writer that derives and refuses a candidate that is not the fixed point of its pin — and, where a map has no arm, re-derive the value the tree states and name what moved rather than typing it.

## Intent coverage

- SC4

## Acceptance criteria

1. Every shape map this milestone declares is re-derived at this head and its default run reports zero failures.
2. Where a map has no armed writer, the value that moved is stated with the record that moved it, and no value is typed that the tree does not assert.
3. The armed runs are idempotent and the default runs write nothing.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m055-record-shapes.json`
- `research/raw/m057-record-shapes.json`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-signals-shapes.test.mjs`
- `scripts/tutor-signals.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/navigation-blocking.test.mjs`

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
node --test scripts/tutor-record-shapes.test.mjs && node --test scripts/tutor-signals-shapes.test.mjs
```

## Log

- pending
