---
id: T001
title: Remove the ten suites that cannot pass
wave: 1
deps: []
status: in-progress
agent: build_T001
base: 62807efd890ffbb576d5df21b551e768f5daf49c
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - .project/plan/RETIRED-SUITES.md
  - tests/held-out/e1-zero-defects-recorded.test.mjs
  - tests/held-out/e5-unverifiable-recorded.test.mjs
  - tests/held-out/e6-portal-dependency.test.mjs
  - tests/held-out/e10-spec-present.test.mjs
  - tests/held-out/e11-rerun-stable.test.mjs
  - tests/held-out/e12-clean-worktree.test.mjs
  - tests/held-out/chrome-beta-gemma4-panel.test.mjs
  - tests/held-out/chrome-beta-nano-panel.test.mjs
  - tests/held-out/chrome-stable-nano-panel.test.mjs
  - tests/held-out/edge-phi4mini-panel.test.mjs
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
- deleted the ten suites: six eN-* that read the untracked .project/review record and four *-panel that need a live browser and model; git status shows the ten deletions and no other product change
- wrote .project/plan/RETIRED-SUITES.md with 10 rows, each carrying the claim, the subject it read or drove, why it could not pass in a fresh checkout, and the successor: the review grammar (gsd review-check / gsd final-check) for the six, verify-ai-browsers check extension-panel plus state for the four; the record resolves from .project/archive/<NNN>/plan after the ship flow moves it
- decision on AC2 scope: the dangling-name check covers every file the walk reaches except .project/plan (the record itself and MEASUREMENT.md), .project/archive (append-only provenance of these suites) and .project/tasks (this task names the ten by construction); MEASUREMENT.md names all ten, so a literal whole-repository scan cannot pass and the exemption is named in the source with its reason
- four mutants captured then restored: a record row removed fails with the row set naming e6-portal-dependency missing; a retired file recreated fails with 'a suite the record lists as retired is still in the corpus'; a scripts/ probe naming e11-rerun-stable fails naming scripts/mutant-probe.mjs; a blanked claim cell fails with 'e12-clean-worktree: no claim', which is held-out E5
- Verify: npm ci --include=dev && node --test scripts/retired-suites.test.mjs -> exit 0, tests 4, pass 4, fail 0; a suite recreated, a row dropped, a claim blanked or a live file naming a retired basename each fails it. ready
