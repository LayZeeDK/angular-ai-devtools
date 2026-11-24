---
id: T004
title: Measure what a form field hosts on the portal
wave: 4
status: pending
deps: []
agent: null
base: null
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
