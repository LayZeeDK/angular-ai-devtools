---
id: T017
title: Re-run lars-review after the patch wave and dispose all blocking findings
wave: 6
deps: [T009, T010, T011, T012, T013, T014, T015, T016]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/review/rounds/round-3.md
  - tests/held-out/e11-rerun-stable.test.mjs
  - tests/held-out/e12-clean-worktree.test.mjs
---

# T017 — Re-run lars-review after the patch wave and dispose all blocking findings

## Context

SC8: multiple `lars-review` rounds ran over the specifications; every verified blocking finding is fixed or explicitly deferred with a written reason, and checks pass after the fixes. E11: re-running `lars-review` on the same frozen range after fixes reports no new verified blocker, and an unchanged range yields the same verdict set. E12: fixes and reviews are sequenced — `lars-review` runs only on a clean product worktree, and no fix task is open while a review round runs. N8 (SC8): do not average away, silently drop, or defer a verified blocking finding without a written reason. N5 (SC1): no defect recorded fixed without a fix commit or written acceptance.

## Approach

- Re-run `lars-review` over the changed ranges on a clean product worktree; freeze the HEAD SHA.
- Write the next round record (`.project/review/rounds/round-3.md`) with verified findings, false positives, provenance table, and a disposition for every blocking finding: fixed in a named commit, or deferred with a written reason and acceptor (N8).
- Prove E11: an unchanged range yields the same verdict set with no new verified blocker.
- Prove E12: no fix task is open while the review round runs (sequencing).
- Confirm SC6: list every changed public behavior in the Log as an accepted defect or revert it (N2).
- Held-out E11/E12 tests assert re-run stability and clean-worktree sequencing.

## Interface contract

None

## Intent coverage

- SC8

## Acceptance criteria

1. `.project/review/rounds/round-3.md` exists with frozen HEAD SHA and reviewed ranges.
2. Every blocking finding from round-2 is fixed in a named commit or deferred with a written reason and acceptor.
3. No new verified blocking finding appears on re-run (E11).
4. `npm run check` and `npm test` pass after the fixes.
5. Held-out E11 proves an unchanged range yields the same verdict set with no new verified blocker; E12 proves no fix task is open while a review round runs.

## Verify

```bash
npm ci && npm run check && npm test && node --test tests/held-out/e11-rerun-stable.test.mjs tests/held-out/e12-clean-worktree.test.mjs
```

Heavy: yes

## Log

- created by planner