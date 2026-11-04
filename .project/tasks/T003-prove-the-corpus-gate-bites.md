---
id: T003
title: Prove the corpus gate bites
wave: 1
deps: [T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/held-out-corpus.test.mjs
---

# T003 — Prove the corpus gate bites

## Context

T002 adds the script. A script that reports pass without running anything is the defect this
milestone exists to repair, so the script itself needs a proof.

## Approach

1. Add a `node:test` suite that drives `held-out-corpus.mjs` against temporary fixture directories.
2. Prove a passing corpus exits 0 and a failing one exits non-zero naming the file.
3. Prove the script runs with `.project/` absent, by pointing it at a fixture root with no such directory.
4. Prove an empty corpus is an error, not a pass.

## Interface contract

None

## Intent coverage

- SC2
- SC3

## Acceptance criteria

1. A corpus of passing suites exits 0; a corpus containing one failing suite exits non-zero and names that file.
2. The script exits 0 with no `.project/` directory anywhere under its root.
3. An empty corpus is reported as an error and exits non-zero.
4. Each of the three behaviours has a mutant that reddens it, with the failure text recorded.
5. Acceptance is held-out E2, E3 and E4: the named gate condition, the run with no project directory, and the absent-prerequisite failure.


## Verify

```bash
npm ci --include=dev; node --test scripts/held-out-corpus.test.mjs
```

## Log

- opened by orchestrator in wave 1
