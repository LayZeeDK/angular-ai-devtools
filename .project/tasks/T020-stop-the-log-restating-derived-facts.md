---
id: T020
title: Stop the Log restating derived facts
wave: 14
deps:
  - T016
  - T021
status: pending
agent: null
base: 6a86b6c3d96f9566175306e5d00e40073bc9f1bf
worktree: null
task_branch: null
files:
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
  - research/raw/m045-console-shapes.json
---

# T020 — Stop the Log restating derived facts

## Context

Wave 1's cycle-5 review failed the Log for the fourth time, and each failure has been a different
sentence about the same growing file. `:190` states "17 identical, `c2`–`c18`" and cites a command that reads
the live HEAD, so appending one `c19` makes it print 18. `:162` says "the count at this head is 18", which is
deictic. `:163` and `:181` say no command in the record is unnamed by this Log, which is false as soon as a
command is added. `:201` says the record's history is five commits, which becomes six with the next append.

Three repairs have each corrected one of these. The class is what needs fixing: a derived fact — a count of a
list that grows, a count of replays, a count of commits — restated as prose in an append-only Log will be
falsified by the next append, and correcting it produces the next stale sentence.

## Approach

- - Subtract rather than correct. Replace every count of a growing thing with the command that prints it
  and one sentence saying what that command prints at the commit it is given. Do not restate the output.
- Keep the measurements that cannot decay: a size read from a named commit's tree stays true for ever, so
  those stay. A count read from the live tree does not, so those go.
- Make the rule explicit in the Log, once: this Log states measurements at named commits and names commands;
  it does not restate derived counts.
- Check the result by asking whether a future append could falsify any sentence that remains. If one could,
  it is the same defect again.

## Acceptance criteria

1. The Log states no count of the record's commands, of identical replays, or of commits; each such claim is replaced by the command that prints it.
2. Every number the Log still states either names the commit it was measured at or is printed by a command the Log quotes beside it.
3. A reader with only the Log can reproduce each number it still states, by running the command named beside it.
4. No sentence in the Log could be falsified by appending a command to the record; the task Log says how that was checked.
5. All changes are appended, with a prefix hash proving earlier bytes are identical.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node -e "const fs=require('fs');const b=fs.readFileSync('research/raw/m045-console-shapes.json');console.log('bytes: '+b.length)" && npm run check && npx prettier --check 'research/raw/m045-console-shapes.json'
```

## Log

- Task written at the sixth repair cycle; not started.
