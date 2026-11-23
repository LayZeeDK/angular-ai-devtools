---
id: T008
title: Re-derive the gate record, then run the project verify
wave: 8
status: pending
deps: [T007]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-stability-record.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/outlet-verdict-claims.test.mjs
  - extension/panel/index.html
  - scripts/navigation-blocking.test.mjs
  - scripts/guard-verdict-claims.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/guard-record-shapes.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/chunk-failure-claims.test.mjs
  - research/raw/m064-verdict-claims.json
---

# T008 — Re-derive the gate record, then run the project verify

## Goal

Derive the two gate records in the order the gate requires, then run the project verify until it reaches its last leg.

## Context

Six suites census `research/raw/`, so six recordings can move and each is declared in the task that re-derives it. Declaring only the records a task pins is what cost M063 three dispatch rounds.

## Approach

Run each suite, re-derive what its record pins from the tree the suite derives, and correct a field only where the tree moved it. Never widen a pin to make a suite pass.

## Interface contract

Each record is that suite's own canonical serialisation of what the tree measures, written by its own armed writer where one exists and corrected field by field where it does not.

## Acceptance criteria

1. SC1: both armed captures write only what moved and a second armed run writes nothing.
2. SC4: the project verify reaches `test:app` and the held-out corpus with every leg green, and its counts are reported.

## Intent coverage

- SC1
- SC4

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs
```

## Log

- pending.
