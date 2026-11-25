---
id: T005
title: Join the hosted control against the control the record expects
wave: 5
status: done
deps: []
agent: build_T005
base: 2dbcdbf23947746c08d21449c19789cf978d300e
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

- SC1
- SC2

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
- 2026-11-23: the join answers all four states from the record and from rows built from its own shape. Verify 22 tests / 22 pass; 
pm run check exit 0.
- 2026-11-23: three mutants redden by name — a mismatch naming only hosted, a host inferred from a field identity, and an answer carrying a remedy — each pinned against the untouched module first, with a fourth test proving the three are distinct defects.
- 2026-11-23: one precedence decision recorded rather than hidden: status hosts nothing and its expected control was not read, so it answers 
o-host / hosts-no-element rather than cannot-tell. AC2 owns that field because the hosting absence is the fact the record states; the three fields that do host an element answer cannot-tell naming the missing expected control, which is AC3.
- 2026-11-23: acts reads exactly two keys (ield, componentsField); any other key — element, label, placeholder, class — is deliberately not consulted, so a host can never be inferred from presentation.
- Landed paths: `extension/field-binder.js`, `scripts/field-binder.test.mjs` — each is read from this tree, ready.
