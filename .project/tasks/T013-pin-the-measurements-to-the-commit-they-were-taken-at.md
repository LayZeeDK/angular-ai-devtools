---
id: T013
title: Pin the measurements to the commit they were taken at
wave: 8
deps:
  - T010
status: in-progress
agent: build_T013
base: 9c955463fbe7f22b1c80fb6b7303490213575d9c
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
  - .project/tasks/T011-stop-the-tail-suffix-resolution-from-pinning-a-path-that-exists-nowhere.md
  - research/raw/m045-console-shapes.json
---

# T013 — Pin the measurements to the commit they were taken at

## Context

Wave 1's cycle-3 review found the Log's size claim stale for the third time. The entry at
`.project/tasks/T001-measure-the-capture-and-the-digest.md:89` states the shapes record is 33,917 bytes with
the measuring command quoted beside it; re-run at `e1ba31fc` that command prints 35,619, because T010's own
append moved the file. A Log whose number contradicts the command printed next to it is exactly the class
this milestone forbids, and the same entry still says "15 recorded commands" when there are 16.

The pattern is not bad arithmetic: it is a timeless claim about a file that every append changes. Three
corrections have now chased it.

Wave 4's cycle-3 review recorded a smaller mismatch of the same kind: T011's accepted criterion said a
`--tasks` argument that is a directory must be "refused", and what shipped reads the directory instead —
correctly, because refusing directories would refuse the gate's own default `.project/tasks`. The acceptance
wording was wrong, not the code.

## Approach

- - Restate the size as a measurement at a named commit with the command that prints it, so the claim cannot
  go stale when a later append lands; keep the historical values as history, labelled with their commits.
- Correct the command count, and say which command is which rather than only counting them.
- Append the correction; never rewrite an earlier Log line.
- Append a correction to T011's Log recording that its accepted criterion 4 overstated the behaviour: the
  reading is correct, the wording was wrong, and the reason is that the gate's own default is a directory.
- Do not change T011's code: the evidence in wave 4 showed the shipped reading is right and that refusing
  directories would break the gate's default path.

## Acceptance criteria

1. Every size the Log states names the commit it was measured at, and the command beside it prints that number at that commit.
2. The command count is correct and says which command is which.
3. Both corrections are appended; earlier Log lines are byte-identical.
4. T011's Log records that its criterion 4 was mis-worded, that the shipped reading is correct, and why refusing directories would break the gate's default input.
5. No product value changes: the shapes record is declared so its size can be measured, and the changed content is the two Logs.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/recording-consistency.test.mjs && npm run check && npx prettier --check research/raw/m045-console-shapes.json
```

## Log

- Task written at the third repair cycle; not started.
