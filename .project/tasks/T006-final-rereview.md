---
id: T006
title: Final lars-review re-run and blocker resolution
wave: 3
deps: [T002, T003, T004, T005]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/review/rounds/round-2.md
  - tests/held-out/e1-zero-defects-recorded.test.mjs
  - tests/held-out/e11-rerun-stable.test.mjs
  - tests/held-out/e12-clean-worktree.test.mjs
---

# T006 — Final lars-review re-run and blocker resolution

## Context

SC8: multiple `lars-review` rounds ran over the specifications; every verified blocking finding is fixed or explicitly deferred with a written reason, and checks pass after fixes. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature and no public behavior change. E11: re-running `lars-review` on the same frozen range after fixes reports no new verified blocker, and an unchanged range yields the same verdict set. E12: fixes and reviews are sequenced — `lars-review` runs only on a clean product worktree, and no fix task is open while a review round runs. N8 (SC8): do not average away, silently drop, or defer a verified blocking finding without a written reason. N2 (SC6): no new capability or public behavior change under the label of a fix. N5 (SC1): no defect recorded fixed without a fix commit or written acceptance. N7 (SC7): specs come from frozen SHAs.

## Approach

- This task is the round-2 re-review and blocker-disposition task, not a product-code fix task. It does not declare or edit product files; actual review-sourced fixes land through plan patch waves appended after wave 3, each of which carries its own re-review task that re-runs this task's files to prove E11 after the fixes.
- Re-run `lars-review` over the changed ranges on a clean product worktree; freeze the HEAD SHA.
- Resolve every verified blocking finding from round-1 and round-2 by recording its disposition in `.project/review/rounds/round-2.md`: fixed in a named patch commit, or deferred with a written reason and an acceptor (N8).
- Record the report at `.project/review/rounds/round-2.md` with verified findings, false positives, a provenance table, and the disposition record.
- Confirm no new verified blocker appears on re-run (E11).
- Verify SC6: list every changed public behavior in the Log as an accepted defect or revert it (N2).
- Held-out E1/E11/E12 tests assert the zero-defect recording, re-run stability, and clean-worktree sequencing.

## Interface contract

None

## Intent coverage

- SC1
- SC6
- SC8

## Acceptance criteria

1. `.project/review/rounds/round-2.md` exists with frozen HEAD SHA and reviewed ranges.
2. No new verified blocking finding appears on re-run (E11).
3. Every verified blocking finding from all rounds is fixed or deferred with a written reason and acceptor.
4. `npm run check` and `npm test` pass after the fixes.
5. The held-out E1 test proves a zero-defect review is recorded as "no defects found" with its range and HEAD; the held-out E11 test proves an unchanged range yields the same verdict set with no new verified blocker; the held-out E12 test proves no fix task is open while a review round runs.

## Verify

```bash
npm ci && npm run check && npm test && node --test tests/held-out/e1-zero-defects-recorded.test.mjs tests/held-out/e11-rerun-stable.test.mjs tests/held-out/e12-clean-worktree.test.mjs
```

Heavy: yes

## Log

- created by planner
