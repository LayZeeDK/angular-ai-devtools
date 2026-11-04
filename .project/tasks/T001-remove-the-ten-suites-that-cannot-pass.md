---
id: T001
title: Remove the ten suites that cannot pass
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/plan/RETIRED-SUITES.md
  - scripts/retired-suites.test.mjs
---

# T001 — Remove the ten suites that cannot pass

## Context

Ten of the thirty-two suites under `tests/held-out/` fail in every fresh checkout. Six read a review-round record under the project directory, a hand-written artifact that was never tracked by git; four are
per-model live-browser proofs that belong to `verify-ai-browsers`. See `MEASUREMENT.md`.

## Approach

1. Delete the six `eN-*` suites and the four `*-panel` suites.
2. Record each claim, where it lives now, and why the suite could not pass. Put the record in
   `.project/plan/RETIRED-SUITES.md`: one row per suite with its claim, its subject and its successor.
3. Add `scripts/retired-suites.test.mjs`, which reads the record and asserts one row per retired suite,
   that the file is gone, and that no remaining file names its basename.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. The ten files are gone and `.project/plan/RETIRED-SUITES.md` names each one with its claim and the thing that now carries it.
2. `scripts/retired-suites.test.mjs` greps the repository for each retired basename and finds it nowhere outside the record.
3. `node --test` over the remaining corpus has no suite failing for a missing `.project/` path.
5. Acceptance is held-out E5: a retired suite with no recorded claim is named by `scripts/retired-suites.test.mjs`.


## Verify

```bash
npm ci --include=dev; node --test scripts/retired-suites.test.mjs
```

## Log

- opened by orchestrator in wave 1
