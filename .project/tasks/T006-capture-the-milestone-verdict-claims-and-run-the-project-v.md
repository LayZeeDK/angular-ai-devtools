---
id: T006
title: Capture the milestone verdict claims and run the project verify
wave: 6
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/m068-verdict-claims.test.mjs
- research/raw/m068-verdict-claims.json
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

# T006 — Capture the milestone verdict claims and run the project verify

## Context

Every milestone in this programme owes a verdict-claims record; M067 shipped without one and seven suites were red until it was captured. The census also needs a reason row for the new suite, and the project verify is the only run that can prove the milestone did not break the build it measures.

## Approach

Write the claims suite behind its own arm, derive the record from this milestone's own intent and plan, add the `SUITE_DIFF_REASONS` row in the same landing, then run the project verify and record its exit and counts.

## Intent coverage

- SC4

## Acceptance criteria

1. The record names one claim per intent criterion, quoting each verbatim, and a default run reproduces it byte for byte.
2. The new suite carries its `SUITE_DIFF_REASONS` row, and the census reports zero findings at this head.
3. The project verify runs at the final head and its exit code and counts are recorded in this task's Log with the command that produced them.

## Files

Every path this task may touch, and nothing else:

- `scripts/m068-verdict-claims.test.mjs`
- `research/raw/m068-verdict-claims.json`
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
node --test scripts/m068-verdict-claims.test.mjs && npm run check && npm test
```

## Log

- pending
