---
id: T006
title: Re-derive the navigation and teardown recordings
wave: 6
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/tutor-signals-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - research/raw/m057-record-shapes.json
  - research/raw/m059-record-shapes.json
  - scripts/teardown-leak.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/guard-record-shapes.test.mjs
  - scripts/guard-verdict-claims.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/tutor-signals.test.mjs
---

# T006 — Re-derive the navigation and teardown recordings

## Goal

Re-derive `m057` and `m059`, the two recordings whose pins this milestone moves, and leave both green.

## Context

Six suites census `research/raw/`, so six recordings can move and each is declared in the task that re-derives it. Declaring only the records a task pins is what cost M063 three dispatch rounds.

## Approach

Run each suite, re-derive what its record pins from the tree the suite derives, and correct a field only where the tree moved it. Never widen a pin to make a suite pass.

## Interface contract

Each record is that suite's own canonical serialisation of what the tree measures, written by its own armed writer where one exists and corrected field by field where it does not.

## Acceptance criteria

1. SC1: `m059` is re-captured by its armed writer and a second armed run writes nothing; `m057` is corrected only where the tree moved it.
2. SC1: both suites and every declared reader suite are green, and no pin is widened.

## Intent coverage

- SC1

## Verify

```bash
M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/teardown-leak-shapes.test.mjs scripts/tutor-signals-shapes.test.mjs
```

## Log

- pending.
