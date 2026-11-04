---
id: T003
title: Prove the corpus gate bites
wave: 1
deps: [T002]
status: done
agent: build_T003
base: 05f8ed4ed79ccd3810e053d795ded5b7701b5125
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
- T003: added scripts/held-out-corpus.test.mjs — 8 node:test cases driving scripts/held-out-corpus.mjs via --root at fixture corpora under C:\Users\LARSGY~1\AppData\Local\Temp, each removed in finally; no fixture root carries a .project/ directory and the script is unchanged
- T003 mutants: 14 fixture mutations each reddened exactly its target assertion — passing suite made to assert falsely (red: 'a passing suite must be reported as passing'); a passing suite dropped (red: 'the run must find both fixture suites'); failing suite removed (red: 'a corpus with a failing suite must not exit 0'); failing suite renamed (red: 'the failing suite must be named as tests/held-out/fixture-fails.test.mjs'); zero-test group given a test (red: 'a suite that proves nothing must not count as a pass'); zero-test suite swapped for a skip (red: 'the corpus must name the suite and the reason it proved nothing'); skip option removed (red: 'a skipped test must not count as a pass'); skipped suite swapped for a todo (red: 'the corpus must name the suite and the skip it refuses'); todo turned into a test (red: 'a todo test must not count as a pass'); todo suite swapped for a zero-test suite (red: 'the corpus must name the suite and the deferral it refuses'); empty corpus given a suite (red: 'an empty corpus must not exit 0'); absent corpus created (red: 'an absent corpus must not exit 0'); .project/ dropped into the fixture root (red: 'the fixture root must carry no .project directory'); in-root suite made to fail (red: 'the corpus must run green with no .project directory present'). Mutants ran on byte-identical copies in C:\Users\LARSGY~1\AppData\Local\Temp; repository test and script hashes unchanged by the harness
- T003 verify: npm ci --include=dev (exit 0) then node --test scripts/held-out-corpus.test.mjs (exit 0; tests 8, pass 8, fail 0, skipped 0, todo 0) — also green under npm test's own invocation node --experimental-strip-types --test; no fixture root contains .project/ (walk of the built root lists only tests/, tests/held-out/, tests/held-out/alpha.test.mjs, tests/held-out/nested/, tests/held-out/nested/beta.test.mjs); scripts/held-out-corpus.mjs unmodified — ready
