---
id: T002
title: The corpus gets a script the gate reaches
wave: 1
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - package.json
  - scripts/held-out-corpus.mjs
---

# T002 — The corpus gets a script the gate reaches

## Context

No npm script reaches `tests/held-out/`, so ten red suites survived nine review cycles. A parallel
`node --test` over the corpus collides: the rebuild suite builds the fixture and two others bind ports.

## Approach

1. Add `scripts/held-out-corpus.mjs`, which enumerates `tests/held-out/**/*.test.mjs`, runs each file
   serially with `node --test`, and prints a per-file result plus a total.
2. Exit non-zero when any suite fails, naming the file.
3. Add a `test:held-out` npm script and make `npm test` run it after the existing suites.
4. Fail rather than skip when a suite's prerequisite is absent: name the prerequisite in the message.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `npm run test:held-out` runs every suite under `tests/held-out/` and exits 0 when all pass.
2. `npm test` reaches the corpus; deleting a suite's subject or breaking one makes `npm test` exit non-zero.
3. A suite whose prerequisite is missing fails with a message naming the prerequisite, never a skip reported as pass.
4. The script runs suites one at a time, demonstrated by two suites that both bind a port passing in one run.
5. Acceptance is held-out E1: the script runs every suite under the corpus, and `npm test` reaches it.


```bash
npm ci --include=dev; node scripts/held-out-corpus.mjs
```

## Log

- opened by orchestrator in wave 1
