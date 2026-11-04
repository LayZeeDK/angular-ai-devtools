---
id: T020
title: E1 asserts what is projected
wave: 8
deps: [T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-harness-root-boundary.test.mjs
---

# T020 — E1 asserts what is projected

## Context

A gap reviewer proved that `<ng-content select=".none">` — a projection point that projects nothing —
passes all three cases. They assert the tag's presence, its position before the probe's own list, and the
caller's literal text, but never **what is projected**. E1 says "content inside the component root is included
and content outside is excluded", and inclusion is exactly what is unasserted.

## Approach

1. Name the change that leaves the check green today — the gap review already named it.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. A projection point that projects nothing reddens the suite: replacing `<ng-content>` with `<ng-content select=".none">` fails, and the failure names what was not projected.
2. The suite asserts a marker that is inside the probe root appears in the result, and a marker outside it does not, so inclusion and exclusion are each demonstrated rather than assumed.
3. Moving the projection point still reddens it (the E1 ruling's structural case is preserved).
4. Each new assertion was seen failing under its mutant and passing when reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-harness-root-boundary.test.mjs
```

## Log

- opened by orchestrator (final review blocked on two high-severity proof holes)
