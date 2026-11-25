---
id: T004
title: Measure what a form field hosts on the portal
wave: 4
status: done
deps: []
agent: build_T004
base: 706965b7eff2c625244a851f479884ebbdf5d628
worktree: null
task_branch: null
files:
- scripts/field-binder-record.test.mjs
- research/raw/m067-field-binder.json
---

# T004 — Measure what a form field hosts on the portal

## Context

Nothing in this repository reads a form field's hosted control: `grep` over `extension/` and the app finds no form-field reading, and `package.json` declares neither the Angular Material package nor the CDK package. The record this milestone joins is therefore written here, from a page, before any join exists.

## Approach

One opt-in capture reads the portal: for each field it records the field identity the tree reports, the element the field hosts, and the control its record expects. The default run is read-only and asserts the record re-derives; the capture only writes when `M067_CAPTURE=1`.

## Intent coverage

- SC3

## Acceptance criteria

1. The record names, for every field read, the identity the field tree reports, the element the field hosts and the control its record expects, or states which of the three was not read.
2. The default run writes nothing and fails when the committed record differs from what this head derives; only `M067_CAPTURE=1` writes.
3. The field identity in the record is the identity `extension/field-state.js` produces, asserted by a test rather than assumed.

## Files

Every path this task may touch, and nothing else:

- `scripts/field-binder-record.test.mjs`
- `research/raw/m067-field-binder.json`

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
node --test scripts/field-binder-record.test.mjs
```

## Log

- pending
- 2026-11-23: the record carries four portal fields. Identity was read for all four from the field-tree names M066 recorded and asserted against a live run of \xtension/field-state.js\; hosted was read for three (\policyNumber\ input, \insuranceStartOn\ p-datepicker, \customer\ p-select) and is a named absence for \status\, whose element M066 recorded as null; expected was read for none, because no artefact in this checkout names a control a field's record expects, and per INTENT C2 that is a named absence rather than a defect.
- 2026-11-23: armed run writes only what moved and is idempotent; default run is read-only and pins sha256 0ef36615558e3255a948b5d7fd7661d27d4ca2cd160ee73a0385845c308cbe01. Verify 16 tests, 16 pass; armed 17/17.
- 2026-11-23: known and owned by T007 — the new suite needs a \SUITE_DIFF_REASONS\ row and the census record needs re-deriving (\suitesExamined\ 193 to 194). Both paths are declared by T007, which runs the project verify.
- Landed paths: `scripts/field-binder-record.test.mjs`, `research/raw/m067-field-binder.json` — each is read from this tree, ready.
