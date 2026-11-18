---
id: T002
title: Compare the pair or refuse it
wave: 2
status: pending
deps:
  - T001
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/what-changed.js
  - scripts/what-changed.test.mjs
  - research/raw/m051-snapshots.json
---

# T002 — Compare the pair or refuse it

## Context

T001 measured which fields the record publishes for a snapshot and which field, if any, binds two of them
(`research/raw/m051-snapshots.json`). The comparison reads exactly those fields and no others.

## Approach

Build `extension/what-changed.js`: a pure function from two snapshots to `{ state, changes, compared, reason }`.
Diff only the fields T001 recorded, report each difference with its before and after, and refuse a pair that no
field binds. Pin the untouched module first, then mutate four ways: a differing field reported equal, an equal
field reported as a change, an unbound pair compared as one page, and an invented before or after.

## Interface contract

None — `whatChanged(before, after, binding) -> { state, changes, compared, reason }` with `state` one of
`changes`, `unchanged`, `cannot-tell` is this module's whole surface, and no other task shares it.

## Files

  - extension/what-changed.js
  - scripts/what-changed.test.mjs

## Acceptance criteria

1. A differing field is reported with its before and after; an equal field is not reported; the mutant that does either wrongly reddens naming the field. Held-out E4 lives here: one field differing renders exactly one finding, and the identical-pair case is asserted in the same suite so "one change" cannot collapse into "no comparison".
2. A pair with no binding field renders `cannot-tell` naming the absence, proven by that state and by the mutant that compares it anyway.
3. The comparison reads no file and no clock, asserted by the suite.

## Verify

```bash
node --test scripts/what-changed.test.mjs && npx prettier --check extension/what-changed.js scripts/what-changed.test.mjs
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- pending.
