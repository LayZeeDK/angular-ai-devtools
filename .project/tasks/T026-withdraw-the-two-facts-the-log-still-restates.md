---
id: T026
title: Withdraw the two facts the Log still restates
wave: 19
deps:
  - T020
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
  - research/raw/m045-console-shapes.json
---

# T026 — Withdraw the two facts the Log still restates

## Context

T020 established the rule for T001's Log: state measurements at named commits and name commands; never
restate a count or an equality a later append can move. Wave 14's review then opened the Log at this head
and found two sentences of exactly the class it withdrew elsewhere: one equates the worktree hash with a
blob at a named commit, which is false here, and one says no commit since has touched the file, which
T015's landing falsified. The file also grew after the entry landed.

## Approach

Apply the existing rule to the sentences that were missed. Each goes, replaced by the command that prints
the fact and one sentence about what that command prints at the commit it is given. No new rule, no new
number. The append-only property is proven against the commit the entry landed at, not against a copy.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None — this repairs a review finding inside SC4's subtraction: a record states measurements at named
commits and names commands.

## Acceptance criteria

- AC1 Neither withdrawn sentence remains in any form, and each replacement names a command.
- AC2 The prefix hash of the file at the commit the entry landed at is a prefix of the current file.
- AC3 `research/raw/m045-console-shapes.json` is byte-identical before and after.
- AC4 No replacement states a count, an equality against the live tree, or a hash equality.

## Verify

```bash
node --test scripts/console-panel-record.test.mjs && npx prettier --check research/raw .project/tasks/T001-measure-the-capture-and-the-digest.md
```

## Log

- Task written at the wave-18/19 repair plan; not started.
