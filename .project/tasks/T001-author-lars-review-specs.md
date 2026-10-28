---
id: T001
title: Author lars-review specifications for M001-M007
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/review/specs/m001.md
  - .project/review/specs/m002.md
  - .project/review/specs/m003.md
  - .project/review/specs/m004.md
  - .project/review/specs/m005.md
  - .project/review/specs/m006.md
  - .project/review/specs/m007.md
  - tests/held-out/e10-spec-present.test.mjs
---

# T001 — Author lars-review specifications for M001-M007

## Context

M009 SC7 requires one `lars-review` specification per shipped milestone M001-M007, each with a frozen base..head range, file scope, focus areas, and acceptance. The frozen ranges are fixed in the milestone facts (M001..M007 `base..head` commits). M002 has no product diff and still needs a spec with a written "no product code" focus (E10). `lars-review` is read-only and needs a clean product worktree (E12).

## Approach

- Write one spec per milestone under `.project/review/specs/`, named by milestone. Each spec opens with its frozen `base..head` SHAs, the files it covers, focus areas, and acceptance. Never write a spec from memory: every range comes from the milestone facts table.
- N7 (SC7): each spec opens with its base..head SHAs and the files it covers.
- E10: M002's spec still gets a frozen range and a written "no product code" focus.
- Do not edit product code. Specs are the only output of this task.
- Held-out E10: a milestone with no product diff still gets a specification; the test asserts all seven spec files exist with a frozen range line.

## Interface contract

None

## Intent coverage

- SC7

## Acceptance criteria

1. Seven spec files exist under `.project/review/specs/` (m001.md through m007.md).
2. Each spec's first section names its frozen `base..head` SHAs exactly as in the milestone facts table.
3. Each spec lists file scope, focus areas, and acceptance criteria.
4. M002's spec states "no product code" in its focus.
5. The held-out E10 test `tests/held-out/e10-spec-present.test.mjs` passes, stating E10's ruling: a milestone with no product diff (M002) still gets a specification with its frozen range and a written "no product code" focus.

## Verify

```bash
node --test tests/held-out/e10-spec-present.test.mjs
```

Heavy: no

## Log

- created by planner