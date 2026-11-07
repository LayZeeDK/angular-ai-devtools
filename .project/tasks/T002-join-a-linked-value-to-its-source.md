---
id: T002
title: Join a linked value to the source it follows
wave: 2
status: pending
deps:
  - T001
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/linked-state.js
  - scripts/linked-state.test.mjs
---

# T002 — Join a linked value to the source it follows

## Context

T001 establishes which label a linked signal carries and whether its source is
reachable. This task turns that record into a finding: matching, differing, or a
refusal naming why it could not be told.

## Approach

One pure function over the recorded labels. A matching pair and a differing pair
are distinct findings; an unreadable source is cannot-tell with a named reason. No
finding names a write, an owner or a cause, because the graph carries none.

## Interface contract

`linkedState(fact) -> { state, signal?, source?, value?, sourceValue?, reason? }`
where `state` is `finding` or `cannot-tell`, and both tasks that touch it share this
exact line.

## Files

- `extension/linked-state.js`
- `scripts/linked-state.test.mjs`

## Acceptance criteria

1. A signal whose value agrees with its source produces a finding naming the signal, the source and both values. **held-out E1:** a record with no linked signal yields no finding.
2. A signal whose value differs produces a distinct finding, and the two states are never merged. **held-out E3:** equal and unequal values are never merged into one state.
3. An unreadable source produces cannot-tell with a named reason. **held-out E2:** a signal whose source is unreadable yields cannot-tell.
4. No output names a write, an owner or a cause. **held-out E4:** no rendered string names a write, an owner or a cause.
5. **held-out E7:** a fact carrying a field the join does not read changes nothing it reports.
6. Every acceptance above is proven non-vacuously: the untouched module passes the pin first, a mutant reddens it, and the failure names the defect.

## Verify

```bash
node --experimental-strip-types --test "scripts/linked-state.test.mjs" && npx prettier --check extension/linked-state.js scripts/linked-state.test.mjs
```

## Intent coverage

- SC1 — AC1
- SC2 — AC2
- SC3 — AC3
- SC4 — AC4

## Log

- dispatched
