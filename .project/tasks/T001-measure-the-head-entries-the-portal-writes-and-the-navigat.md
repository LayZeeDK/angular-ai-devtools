---
id: T001
title: Measure the head entries the portal writes and the navigations beside them
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/head-record.test.mjs
- research/raw/m068-head-record.json
- scripts/recordings.json
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
---

# T001 — Measure the head entries the portal writes and the navigations beside them

## Context

Nothing in this repository reads a document head entry: `grep -rln "document.head|document.title" extension/*.js` returns no match. M065 installed a MutationObserver on `<title>` and `document.head` in an isolated world and stated `writesSeen: 0` with "the observer names no writer", so the record this milestone joins is one it writes, and the writer it can name is the navigation the record correlates a write with.

## Approach

One opt-in capture writes, per head entry, the name it carries, the navigation index it was first seen at, the entry that remained, and the navigation whose page carries it — or states which of those was not read and why. The default run is read-only and asserts the committed record re-derives; only `M068_CAPTURE=1` writes, and the writer derives through the recorded document and refuses a candidate that is not the fixed point of its own pin.

## Intent coverage

- SC3

## Acceptance criteria

1. The record names, for every head entry read, its name, the navigation it was first seen at, the entry that remained and the navigation whose page carries it, or states which of the four was not read and why.
2. The default run writes nothing and fails when the committed record differs from what this head derives; only `M068_CAPTURE=1` writes, and an armed run is idempotent on a second pass.
3. The recording is named in `scripts/recordings.json` with its suite and its arm, and the new suite carries its `SUITE_DIFF_REASONS` row in `scripts/gate-integrity.test.mjs`.

## Files

Every path this task may touch, and nothing else:

- `scripts/head-record.test.mjs`
- `research/raw/m068-head-record.json`
- `scripts/recordings.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`

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
node --test scripts/head-record.test.mjs
```

## Log

- pending
