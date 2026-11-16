---
id: T010
title: Correct the control-character count and give every number a command
wave: 7
deps:
  - T008
status: in-progress
agent: build_T010
base: 562de854312a437cd14cc0ffff06d3e30f847112
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - research/raw/m045-console-shapes.json
  - research/raw/m056-gate-stability.json
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
---

# T010 — Correct the control-character count and give every number a command

## Context

Wave 1's cycle-2 review verified the record's corrections and found two numbers that still owe a
command. First, the record carries 69 numeric leaves and 68 are printed by a carried command; the leaf at
`research/raw/m045-console-shapes.json:320`, `"line": 1397`, is the exception. Its value is right — it is
`extension/agent-main.js:1397`, the `dispatch` definition — but the file's own rule says every number is a
command's output.

Second, the T001 Log entry that repairs the corrupted verdict sentence (`.project/tasks/T001-…md:91`) says
that sentence carries `U+000C` at index 9056 **and** `U+000D` at 9064. Measured, the file is LF-only: there
is one control character, `U+000C` at 9056, and index 9064 was the terminating newline. That over-report
originated in wave 1's cycle-1 review and the correction inherited it.

## Approach

- - Print the leaf or remove it. A number the record cannot reproduce is the defect this milestone exists
  to catch, and the honest repair is a carried command whose output contains it.
- Correct the Log entry by appending: state that there is one control character, `U+000C` at index 9056, that
  the file is LF-only, and that the earlier entry's `U+000D` at 9064 was the terminating newline.
- Do not rewrite the earlier Log lines; the correction is an append, as the corrupted entry itself was.
- Re-arm the stability record if the appends move its mention counts, and prove the unarmed read
  byte-identical.

## Acceptance criteria

1. Every numeric leaf in the record is printed by a command the record carries, or is removed; the count of leaves and the count of printed leaves agree.
2. A carried command's output contains the line number the leaf records, and the record cites it.
3. The T001 Log states one control character, U+000C at index 9056, and that the file is LF-only, in an appended entry that does not rewrite earlier lines.
4. The earlier claim about U+000D is named as corrected rather than left standing.
5. The stability record still reads byte-identical on an unarmed run after any re-arm, proven with its sha256.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/recording-consistency.test.mjs scripts/gate-stability-record.test.mjs && npm run check && npx prettier --check research/raw/m045-console-shapes.json research/raw/m056-gate-stability.json
```

## Log

- Task written at the second repair cycle; not started.
