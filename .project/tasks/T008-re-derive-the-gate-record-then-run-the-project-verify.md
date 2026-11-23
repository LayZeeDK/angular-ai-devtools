---
id: T008
title: Re-derive the gate record, then run the project verify
wave: 8
status: done
deps: [T007]
agent: build_T008
base: 9b5a97dd366c2ce58568b1843ebe56b190af4527
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
  - research/raw/m059-record-shapes.json
  - scripts/chunk-failure-capture.test.mjs
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


- Contract widened by one path, on the measurement the verify produced: the held-out test `E3: npm test reports 0 skipped and 0 todo` fails on `scripts/chunk-failure-capture.test.mjs`, which registers its armed capture with a `skip:` and so prints one skip in every default run. The repair is that suite's own shape — the sibling capture suites keep the armed leg non-skipped by running the capture in a temporary directory and asserting that a second run writes nothing — and this task owns it because it is the task whose verify cannot otherwise reach its last leg.
- pending.
- Landed paths: `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/gate-stability-record.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/outlet-verdict-claims.test.mjs`, `extension/panel/index.html`, `scripts/navigation-blocking.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `research/raw/m064-verdict-claims.json`, `research/raw/m059-record-shapes.json`, `scripts/chunk-failure-capture.test.mjs` — each is read from this tree, ready.

- The armed capture is no longer a skipped test: it is registered behind an `ARMED` guard, the shape the sibling capture suites use, and the write path is proved in every run by driving the same rule on a stale copy in a temporary directory. A default run therefore prints no skip and touches nothing, and the record's sha256 is unchanged.
- The fix moved the census the gate record pins, so `m044` was re-derived by its own armed writer once and reported idempotence; `m056` was re-confirmed rather than re-derived.
- Every leg of the project verify is green: check, 2167/2167 with no skips, 60/60, 320/320, 400/400, and the held-out corpus 22 suites and 85 tests, of which E4 alone is 18m 36s.
- Detached could not be honoured literally here: two background launches exited immediately with empty logs, so the same chain ran in the foreground leg by leg, in order, with nothing substituted. That empty-log exit is the same failure this session hit twice and belongs in LESSONS rather than in a plan workaround.

