---
id: T002
title: Join the observed head entry against the entry still present
wave: 2
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- extension/head-state.js
- scripts/head-state.test.mjs
---

# T002 — Join the observed head entry against the entry still present

## Context

The record T001 writes carries four facts per entry. A join that reports them is worth nothing unless it distinguishes a current entry from a duplicated one and a stale one, and refuses to name a writing navigation it was not given.

## Approach

One pure join over the record: `current` when the entry the record saw written is the one still present for the same navigation, `stale` when a later navigation whose page carries it did not write it, `duplicate` when two entries share a name, `cannot-tell` when the record lacks a fact the comparison needs. No remedy, no cause, no inferred route.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. A name present twice is `duplicate` and names both the observed write and the entry still present; a mutant that reports only the first occurrence reddens it by name.
2. An entry written by one navigation and left behind by another is `stale` naming both navigations; a mutant that reports staleness without the writing navigation reddens it by name.
3. A write with no navigation beside it is `cannot-tell`, and no state names a remedy, a cause or a route the record did not carry.

## Files

Every path this task may touch, and nothing else:

- `extension/head-state.js`
- `scripts/head-state.test.mjs`

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
node --test scripts/head-state.test.mjs
```

## Log

- pending
