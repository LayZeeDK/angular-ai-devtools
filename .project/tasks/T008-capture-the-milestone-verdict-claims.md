---
id: T008
title: Capture the milestone verdict claims the gate reads
wave: 8
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- research/raw/m067-verdict-claims.json
- scripts/m067-verdict-claims.test.mjs
- scripts/gate-integrity.test.mjs
- research/raw/m044-gate-shapes.json
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
---

# T008 — Capture the milestone verdict claims the gate reads

## Context

`scripts/guard-verdict-claims.test.mjs` requires `research/raw/m067-verdict-claims.json` and reports its absence as
"the list has never been captured". Every milestone in this programme carries one; this one was planned without it,
which is why seven suites are red with a delta of zero.

## Approach

Derive the claim list from this milestone's own artefacts — the intent criteria, the task acceptances and the wave
reviews — write it through an armed capture that is idempotent, and add a reason row for the new suite so the census
does not redden on its first appearance.

## Intent coverage

- SC4

## Acceptance criteria

1. `research/raw/m067-verdict-claims.json` exists, names one claim per intent criterion, and a default run of the capture suite reproduces it byte for byte.
2. An armed run writes only what moved, and a second armed run changes no byte; a default run writes nothing.
3. The new suite carries its `SUITE_DIFF_REASONS` row, and `scripts/gate-integrity.test.mjs` reports zero findings at this head.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m067-verdict-claims.json`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `research/raw/m044-gate-shapes.json`
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
node --test scripts/m067-verdict-claims.test.mjs
```

## Log

- pending
