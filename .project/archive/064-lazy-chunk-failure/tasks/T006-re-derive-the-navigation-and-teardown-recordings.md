---
id: T006
title: Re-derive the navigation and teardown recordings
wave: 6
status: done
deps: [T003]
agent: build_T006
base: aeedcc5748e9e90964b36dcb33159815a805d129
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
  - research/raw/m064-verdict-claims.json
  - scripts/chunk-failure-claims.test.mjs
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
- m057 has no writer: its write-record census gained xtension/import-failure.js:1, and its edge vocabulary went from two records worth to three, because T004's claims record carries the intent's eight-row table. Both were re-derived from the tree; the documented floors (ilesScanned, jsonFilesScanned) were left alone because raising them would be widening a pin.
- m059 was re-captured by its armed writer, which moved exactly the counts the milestone changed; a second armed run wrote nothing.
- m064-verdict-claims.json gained the portal-capture row T005 added, and a second armed run wrote nothing.
- scripts/tutor-answer.test.mjs is red at this head and was red before this task: its self-held list pins two records where the tree now carries three. It is declared in T007 and T008, and the correction belongs with the gate re-capture, because an insertion here would stale that recording a third time.

- Landed paths: `scripts/tutor-signals-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `research/raw/m057-record-shapes.json`, `research/raw/m059-record-shapes.json`, `scripts/teardown-leak.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/gate-integrity.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/tutor-signals.test.mjs`, `research/raw/m064-verdict-claims.json`, `scripts/chunk-failure-claims.test.mjs` — each is read from this tree, ready.
