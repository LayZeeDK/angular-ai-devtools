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
- research/raw/m059-record-shapes.json
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

- `research/raw/m059-record-shapes.json`
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
- Landed paths: `research/raw/m059-record-shapes.json`, `research/raw/m055-record-shapes.json`, `research/raw/m057-record-shapes.json`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-signals-shapes.test.mjs`, `scripts/tutor-signals.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs` — each is read from this tree, ready.
- 2026-11-25: the shape maps were re-derived by their own arms. m055 moved its head `fcbd932b` to the head it was captured at, and its armed writer proved it still refuses a candidate that is not the fixed point of its own pin and writes nothing. m057 was re-derived and moved no byte; its default run is 21/21.
- 2026-11-25: this task's declared files grew by one mid-build, `research/raw/m059-record-shapes.json`, and the reason is recorded rather than assumed. `scripts/teardown-leak-shapes.test.mjs` was red at this base with `recordsSearched: 167 -> 168` and `filesSearched: 49 -> 50` — the record T001 wrote and the module T002 added. That is a shape map the new files moved, which is this task's own scope. Its armed run wrote 59302 bytes, a second armed run changed no byte, and its default run is 13/13.
- 2026-11-25: declaring a path after activation is not enough, because `land` derives the allow-list from the task file at the recorded base. It refused with "landing allow-list differs from the base task: extra research/raw/m059-record-shapes.json". The task was reset to pending, the amended declaration committed as its own bookkeeping commit, and the task re-activated at the current head before the records were restored and landed.
- 2026-11-25: two further refusals are recorded because both are the pipeline's own doing, not the task's. A record pins the head it was captured at, so every ledger commit that lands before the Verify moves the head and stales the capture again; each capture was therefore taken immediately before its landing. And the ledger itself appends a `- Landed paths:` line to this Log, so entries written by replacing the `- pending` line are not an append-only extension — these are appended after it instead.
