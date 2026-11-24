---
id: T006
title: Record the two suites this milestone added and restate the pins they moved
wave: 6
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/gate-integrity.test.mjs
- scripts/chunk-failure-claims.test.mjs
- research/raw/m044-gate-shapes.json
- research/raw/m064-verdict-claims.json
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/panel-routes.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
---

# T006 — Record the two suites this milestone added and restate the pins they moved

## Context

Every suite that differs from the M044 measurement base owes a reason row in `SUITE_DIFF_REASONS`, and
`deriveSuiteDiff` throws on a suite that differs from `d94502d1` with no reason read for it. M066 added
`scripts/m066-schema-record.test.mjs` and `scripts/schema-attribution.test.mjs` without those rows, so the derivation died
and nine assertions in `scripts/gate-integrity.test.mjs` reddened as collateral — the armed capture reports instead of
writing because it refuses to write a record that would fail its own check.

The same milestone moved citation lines that `research/raw/m064-verdict-claims.json` pins, and exposed a writer/reader
asymmetry in `captureClaims`: the reader holds the capture-time spelling while the writer emitted the resolved one, so
every armed re-capture after M065's rebind wrote bytes its own default pin refuses.

## Approach

Add the two reason rows at end of file, where the file's own convention puts them, so no pinned reference row shifts. Fix
the writer to emit the form the reader holds. Then re-derive both recordings with their own capture commands and prove
each write is byte-idempotent on a second run.

## Intent coverage

- SC3, SC4

## Acceptance criteria

1. `scripts/gate-integrity.test.mjs` reports 40 pass and 0 fail unarmed, and 41 pass and 0 fail armed, with the armed run writing `research/raw/m044-gate-shapes.json` once and a second armed run leaving it byte-identical.
2. `scripts/chunk-failure-claims.test.mjs` reports 14 pass and 0 fail unarmed and 15 pass and 0 fail armed, and one assertion that pinned the writer's raw output now reads the capture-time form rather than a retuned tolerance.

## Files

Every path this task may touch, and nothing else:

- `scripts/gate-integrity.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `research/raw/m044-gate-shapes.json`
- `research/raw/m064-verdict-claims.json`
- \scripts/gate-integrity-default-tasks.test.mjs\n
- \scripts/guard-verdict-claims.test.mjs\n
- \scripts/outlet-verdict-claims.test.mjs\n
- \scripts/panel-routes.test.mjs\n
- \scripts/navigation-blocking.test.mjs\n
- \scripts/tutor-answer.test.mjs\n
- \scripts/guard-record-shapes.test.mjs\n
- \scripts/outlet-record-shapes.test.mjs\n
- \scripts/teardown-leak-shapes.test.mjs\n
- \scripts/tutor-record-shapes.test.mjs\n
## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/schema-attribution.js — the only reader of a schema attribution
export function schemaAttribution(record, facts) {
  return { state, field, node, input, reason, observed }
}
```

`state` is one of `declared`, `no-node`, `no-record`, `cannot-tell`. `node` and `input` are present only when the record
carries them; `reason` names why the attribution is absent.

## Verify

```bash
node --test scripts/gate-integrity.test.mjs && node --test scripts/chunk-failure-claims.test.mjs
```

## Log

- pending
