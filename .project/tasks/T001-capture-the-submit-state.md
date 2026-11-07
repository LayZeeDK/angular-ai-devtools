---
id: T001
title: Capture the submit state the fact never carried
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/field-state-capture.test.mjs
  - research/raw/m031-field-state.json
  - scripts/field-state.test.mjs
---

# T001 — Capture the submit state the fact never carried

## Context

`research/raw/m031-field-state.json` has zero `disabled` and zero `submit` occurrences, so `extension/field-state.js`
has been defaulting `submit` to `enabled`. The observable exists: `field-form-page.ts:18` binds
`[disabled]="fieldForm().invalid()"`, so the submit element's own `disabled` is readable and the root field's
`invalid` is already in the tree.

## Approach

Extend the armed capture so the fact carries `submitDisabled` and the submit element's id, then re-capture the
recording through that path. Keep the module untouched: it already consumes `submitDisabled` at
`field-state.js:70-75`. Add join tests for the producible cases only -- an enabled submit beside a root error is
impossible in this fixture, because its binding ties disabled to invalid.

## Interface contract

None

## Acceptance criteria

1. held-out E1: a fact without a submit state yields no finding, and the module reports its default rather than a
   guess -- proven by a test that omits the field.
2. held-out E2: a disabled submit with a root error kind names that kind and invents no rule text.
3. held-out E3: a field's own error and the root kind stay in different places and different words.
4. held-out E4: submit-enabled with the root valid is reported as enabled -- the case this fixture can produce.
5. held-out E7: extra fields on the fact change nothing the join reads.
6. The recording is produced by the armed capture and is byte-identical on a default run.

## Verify

```bash
node --experimental-strip-types --test "scripts/field-state.test.mjs" && node --experimental-strip-types --test "scripts/field-state-capture.test.mjs"
```

## Intent coverage

- SC1: AC2
- SC2: AC3
- SC3: AC1
- SC4: AC1

## Log

- dispatched
