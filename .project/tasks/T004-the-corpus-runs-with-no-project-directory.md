---
id: T004
title: The corpus runs with no project directory
wave: 2
deps: [T003]
status: in-progress
agent: build_T004
base: 9fe74b42fbafcd7e2c79d2bb2ade0b169e82373c
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - tests/held-out/e7-archive-order.test.mjs
  - scripts/held-out-corpus.mjs
  - scripts/held-out-corpus.test.mjs
---

# T004 — The corpus runs with no project directory

## Context

The wave-1 review found the criterion violated by a suite the measurement missed.
`tests/held-out/e7-archive-order.test.mjs` reads `.project/archive/001-run-unrun-spikes`, so with `.project/`
moved aside it exits 1 with `E7: archive path missing`. SC3 says no suite under `tests/held-out/` reads any path
under `.project/`, and prohibitions N1 repeats it.

T003 proved the *script* runs without `.project/`; nothing yet proves the *corpus* does. That is the gap: the
script's proof used fixture roots, and the real corpus was never run in the state the ship flow creates.

## Approach

1. Re-home E7's claim so the suite carries what it needs: the archive-order fact becomes data the suite owns
   (as an earlier milestone re-homed a declaration into its suite), with the archived path recorded as provenance rather than read.
2. Add a corpus-level proof: run `scripts/held-out-corpus.mjs` over the real `tests/held-out/` with `.project/`
   moved aside, and assert exit 0. Restore in a `finally`.
3. Keep every existing T003 assertion.

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. `node scripts/held-out-corpus.mjs` runs with `.project/` moved aside; every failure it reports is one of the two suites that drive `npm test` (`e3-zero-skipped`, `e4-idempotent-checks`), named as such, and no failure is a held-out suite reading `.project/` itself.
2. `tests/held-out/e7-archive-order.test.mjs` reads no path under `.project/`, and still asserts its ordering claim from data it carries.
3. The corpus-level proof reddens when a held-out suite reads `.project/`: reintroduce such a read temporarily, capture the failure, restore.
4. Acceptance is held-out E3: the corpus runs with no project directory present.

## Verify

```bash
npm ci --include=dev; node --test scripts/held-out-corpus.test.mjs
```

## Ruling on AC1 (delegated, `rulings` grant)

AC1 as first written — *the whole corpus exits 0 with `.project/` moved aside* — is unreachable and was stronger
than the criterion. Evidence from attempt 1: two corpus suites, `e3-zero-skipped` and `e4-idempotent-checks`,
drive `npm test` by design, and three root script suites (`docs-audit-disposition`, `overlay-verdict-claims`,
`retired-suites`) legitimately read `.project/`. With `.project/` absent the corpus therefore reports 20/22 with
those two red, each naming the gate stage that read `.project/`.

SC3's letter is what governs: **no suite under `tests/held-out/` reads any path under `.project/`.** That is now
true and provable by grep. So AC1 becomes: the corpus runs with `.project/` moved aside, and **every** failure it
reports is a suite that invokes the project gate, named as such — no failure may be a held-out suite reading
`.project/` itself.

## Log

- opened by orchestrator after the wave-1 review blocked SC3 on `e7-archive-order`
- E7 re-homed: the ordering claim now rides on archive commit a24cedb6 and retirement commit c3e8f57 as data the suite carries, with .project/archive/001-run-unrun-spikes recorded only as a provenance comment and never read; it passes with .project/ absent and reddens on swapped-commit, nonexistent-commit and restored-spike mutants. Real corpus with .project/ moved aside: 22 suites, 20 passed, 2 failed (e3, e4) - 85 tests, 83 passed, exit 1, 7m35s. Reintroducing a .project/ read in e7 makes that same run report FAIL tests/held-out/e7-archive-order.test.mjs (archive path missing): 22 suites, 19 passed, 3 failed, 86 tests, exit 1.
- NEEDS-ORCHESTRATOR: held-out e3 and e4 shell out to npm test, which reddens with .project/ absent through 17 tests in scripts/docs-audit-disposition.test.mjs, scripts/overlay-verdict-claims.test.mjs and scripts/retired-suites.test.mjs, and none of those paths is in T004 files:, so AC1 and AC3 cannot be met here while the contract Verify stays green (8 tests, exit 0) - readings: (a) a new task makes those three suites .project-independent and T004 is re-dispatched for the corpus-level proof, (b) held-out e3 and e4 are narrowed to the stages that do not read .project/, (c) AC1 is restated to exclude the suites that drive the project gate blocked
