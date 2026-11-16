---
id: T027
title: Withdraw the third instance the heading miscounted
wave: 20
deps:
  - T026
status: done
agent: build_T027
base: a8ff8e59bdd2805a676e2aeed91b8ed602d6fe2f
worktree: null
task_branch: null
files:
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
---

# T027 — Withdraw the third instance the heading miscounted

## Context

Wave 19's review failed T026 on AC1's "in any form" clause and named the survivor: `:221` still states the
worktree-hash equality in the present tense, while T026's withdrawal entry says the class was stated twice and
promises the Log now states no outcome of that comparison. T020 had classified `:221` as a fixed measurement; it
is not, because the worktree is not a named commit.

## Approach

Apply T026's own rule to the sentence it missed. The sentence is named by line in an appended entry and replaced
by the two commands that print the two hashes separately, so the comparison is run by the reader and never
stated by the Log. No new rule, no number of the Log's own. The append-only property is proven against
`9b39f6ec`, the commit T020's entry landed at.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None — this repairs a review finding inside SC4's subtraction.

## Acceptance criteria

- AC1 The sentence at `:221` is named and withdrawn; no sentence anywhere in the Log states the worktree-hash
  equality in the present tense.
- AC2 The prefix hash of the file at `9b39f6ec` is still a prefix of the current file.
- AC3 `research/raw/m045-console-shapes.json` is byte-identical before and after.
- AC4 No replacement states a count, a live-tree equality or a hash equality.

## Verify

```bash
node --test scripts/console-panel-record.test.mjs && npx prettier --check research/raw .project/tasks/T001-measure-the-capture-and-the-digest.md
```

## Log

- Task written after wave 19's cycle-1 review named the surviving sentence.
