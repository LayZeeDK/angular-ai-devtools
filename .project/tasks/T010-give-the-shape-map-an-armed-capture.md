---
id: T010
title: Give the shape map an armed capture
wave: 10
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- research/raw/m055-record-shapes.json
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
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

# T010 — Give the shape map an armed capture

## Context

`research/raw/m055-record-shapes.json` has no `capture` field, so nothing writes it: it is re-derived by hand at every
rebind, and it has now drifted twice. M066's own archive recorded that this would happen — "the same drift will recur at
the next rebind" — and it recurred at the next rebind, orphaning `m066-verdict-claims.json` and reddening
`tutor-record-shapes` and `tutor-answer`.

## Approach

Give the map the same writer every other record in this programme has: an armed run that derives the map from the tree,
refuses a candidate that is not the fixed point of its own pin, writes only on its arm, and leaves a default run
read-only and authoritative. Then re-derive the map at this head so the row it lacks lands as a reading rather than a
typed value.

## Intent coverage

- SC4

## Acceptance criteria

1. The armed run writes `research/raw/m055-record-shapes.json` from the tree, and a second armed run changes no byte.
2. A default run writes nothing and fails when the committed map differs from what this head derives, naming the record that moved.
3. The map measures every verdict-claims record the tree holds except those its own reader exempts, and `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs` report zero failures with no assertion retuned.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m055-record-shapes.json`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
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
// extension/field-binder.js — the only reader of a field's hosted control
export function fieldBinder(record, facts) {
  return { state, field, hosted, expected, reason, observed }
}
```

`state` is one of `bound`, `mismatch`, `no-host`, `cannot-tell`. `hosted` and `expected` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
node --test scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs
```

## Log

- pending
