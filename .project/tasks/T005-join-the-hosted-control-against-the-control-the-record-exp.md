---
id: T005
title: Join the hosted control against the control the record expects
wave: 5
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- extension/field-binder.js
- scripts/field-binder.test.mjs
---

# T005 — Join the hosted control against the control the record expects

## Context

The record T004 writes carries three facts per field. A join that reports them is worth nothing unless it also distinguishes a field that hosts the expected control from one that hosts another, and refuses to name a host it was not given.

## Approach

One pure join over the record: `bound` when the hosted control is the expected one, `mismatch` when both are present and differ, `no-host` when the field hosts nothing or is not a components field, `cannot-tell` when the record lacks a fact the comparison needs. No remedy, no cause, no inferred host.

## Intent coverage

- SC1, SC2

## Acceptance criteria

1. A field hosting a control other than the expected one is `mismatch` and names both controls; a mutant that reports only the hosted control reddens it by name.
2. A field that is not a components field is `no-host` with its reason, never a control inferred from its label; a mutant that infers a host reddens it by name.
3. A record missing the expected control is `cannot-tell`, and no state names a remedy, a cause or a control the record did not carry.

## Files

Every path this task may touch, and nothing else:

- `extension/field-binder.js`
- `scripts/field-binder.test.mjs`

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
node --test scripts/field-binder.test.mjs
```

## Log

- pending
