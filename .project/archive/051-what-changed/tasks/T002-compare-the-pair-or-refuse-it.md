---
id: T002
title: Compare the pair or refuse it
wave: 2
status: done
deps:
  - T001
agent: build_T002
base: f8ab3192f6f8552a48990392eb0e044db9f56c19
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
Diff only the fields T001 recorded, report each difference with its before and after, and refuse a pair the panel cannot bind to one inspected tab. The pair is bound by the panel's own tab, not by a
field of the record — T001 measured that the record carries no page identity (identity.bindingField: null). Pin the untouched module first, then mutate four ways: a differing field reported equal, an equal
field reported as a change, an unbound pair compared as one page, and an invented before or after.

## Interface contract

None

## Files

  - extension/what-changed.js
  - scripts/what-changed.test.mjs

## Acceptance criteria

1. A differing field is reported with its before and after; an equal field is not reported; the mutant that does either wrongly reddens naming the field. Held-out E4 lives here: one field differing renders exactly one finding, and the identical-pair case is asserted in the same suite so "one change" cannot collapse into "no comparison".
2. A pair the panel cannot bind to one tab renders `cannot-tell` naming that the record carries no page identity and that the binding is the panel's, proven by that state and by the mutant that compares it anyway.
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
- Landed paths: `extension/what-changed.js`, `scripts/what-changed.test.mjs`, `research/raw/m051-snapshots.json` — each is read from this tree, ready.
