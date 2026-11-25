---
id: T007
title: Re-derive the census and the stability record the claims record moved
wave: 7
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity.test.mjs
- research/raw/m044-gate-shapes.json
- research/raw/m056-gate-stability.json
---

# T007 — Re-derive the census and the stability record the claims record moved

## Context

The claims record T006 wrote adds one suite and one record and moves a reference line, so the census counts 382 to 383 files and 198 to 199 suites, and the stability record pins a gate suite that now exits 1 because the census disagrees with it. Both are stale at this head, and both were left red by the project verify T006 ran.

## Approach

Re-derive each through its own arm — `M044_CAPTURE=1` for the census and `M056_CAPTURE=1` for the stability record — capture after the last file-adding landing and before the landing that owns them, then default-run each and confirm zero failures.

## Intent coverage

- SC4

## Acceptance criteria

1. Both recordings are re-derived at this head and their default runs report zero failures.
2. Every value that moved is named with what moved it: the suite and the record this milestone added, and the reference line each of them moved.
3. A second armed run of each writes nothing, and a default run writes nothing.

## Files

Every path this task may touch, and nothing else:

- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/gate-stability-record.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `research/raw/m044-gate-shapes.json`
- `research/raw/m056-gate-stability.json`

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
node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs
```

## Log

- pending
