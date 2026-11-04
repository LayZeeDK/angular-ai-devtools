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
  []
---

# T001 — Remove the ten suites that cannot pass

## Context

Ten of the thirty-two suites under `tests/held-out/` fail in every fresh checkout. Six read
`.project/review/rounds/round-2.md`, a hand-written review record that was never tracked by git; four are
per-model live-browser proofs that belong to `verify-ai-browsers`. See `MEASUREMENT.md`.

## Approach

1. Delete the six `eN-*` suites and the four `*-panel` suites.
2. Record each claim, where it lives now, and why the suite could not pass. Put the record in
   `.project/plan/RETIRED-SUITES.md`: one row per suite with its claim, its subject and its successor.
3. Prove the corpus is smaller and no other file referenced them: grep the repo for each deleted basename.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. The ten files are gone and `.project/plan/RETIRED-SUITES.md` names each one with its claim and the thing that now carries it.
2. No remaining file names a deleted suite (grep for each basename returns nothing outside the record).
3. `node --test` over the remaining corpus has no suite failing for a missing `.project/` path.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-harness-ambiguity.test.mjs; test -f .project/plan/RETIRED-SUITES.md
```

## Log

- opened by orchestrator in wave 1
