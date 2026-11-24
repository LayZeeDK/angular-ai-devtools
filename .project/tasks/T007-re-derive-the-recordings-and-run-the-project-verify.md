---
id: T007
title: Re-derive the recordings and run the project verify
wave: 7
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- research/raw/m044-gate-shapes.json
- research/raw/m056-gate-stability.json
- scripts/gate-integrity.test.mjs
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- research/raw/m064-verdict-claims.json
- scripts/panel-routes.test.mjs
- scripts/m067-verdict-claims.test.mjs
- research/raw/m067-verdict-claims.json
- research/raw/m057-record-shapes.json
- scripts/tutor-signals-shapes.test.mjs
---

# T007 — Re-derive the recordings and run the project verify

## Context

A recording that counts the tree is stale the moment the final landing moves it, so the last task re-derives both and runs the project verify, which is the only run that can prove the milestone did not break the build it measures.

## Approach

Re-derive each recording at the final head through its manifest row, then run the project verify command and record its exit and its counts in this task's Log.

## Intent coverage

- SC4

## Acceptance criteria

1. Both recordings are re-derived at the final head and their default runs report zero failures.
2. The project verify runs and its exit code and counts are recorded in this task's Log, with the command that produced them.
3. No recording is written by a default run, and the armed runs leave their files byte-identical on a second pass.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m044-gate-shapes.json`
- `research/raw/m056-gate-stability.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/gate-stability-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `research/raw/m067-verdict-claims.json`
- `research/raw/m057-record-shapes.json`
- `scripts/tutor-signals-shapes.test.mjs`

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
M044_CAPTURE=1 node --experimental-strip-types --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && npm run check && npm test
```

## Log

- pending
