---
id: T016
title: Make the counts a measurement at a commit too
wave: 11
deps:
  - T013
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
  - research/raw/m045-console-shapes.json
---

# T016 — Make the counts a measurement at a commit too

## Context

Wave 1's cycle-4 review found the one number T013 left unpinned. The correction says "The commands: 16,
`c1`–`c16`" and "15 byte-identical", and at `85208150` the record holds **18**: T015 added `c17` and `c18`
for the case-folded match. Replaying all strings gives 17 identical, `c1` differing only in the short HEAD it
recorded. The count was true of `628bd800` and of nothing later, so the next commit that read the record
falsified it and left two commands unnamed.

This is the same defect T013 fixed for sizes, one layer up: a count of a list that grows is a measurement at a
commit, not a fact.

Two advisories ride with it. The first entry dates a size to `9e95f740`, a commit that does not carry the
record at all (`git cat-file` reports it exists on disk but not in that commit). And the entry at `:119` reads
as timeless when it states the worktree's blob hash, which now points at a later blob.

## Approach

- State the count as a measurement at a named commit, and name the commands a later commit added rather than
  leaving them unnamed: the record's list is `provenance.commands`, and what matters is which commands exist
  at the commit being described.
- Prefer a statement that cannot go stale: say what the list holds at each named commit, so a later append
  adds a line rather than falsifying one. If a prose count must remain, pin it the way the sizes are pinned.
- Correct the `9e95f740` attribution: a commit that does not carry the file cannot be the commit a size was
  measured at. Name the commit that does.
- Make the worktree-hash sentence say which commit it describes, since the hash moves with every append.
- Append all corrections; never rewrite an earlier Log line.

## Acceptance criteria

1. Every count the Log states of the record's commands names the commit it was counted at, and re-running the record at that commit yields that count.
2. Commands added after the last correction are named, so no command in the record is unnamed by the Log.
3. Any commit a size is attributed to actually carries the record at that path, proven with a command whose output is quoted.
4. The worktree-hash sentence names the commit whose bytes it describes, or is restated as a measurement at a commit.
5. Every correction is appended; earlier Log bytes are identical, proven by a prefix hash.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node -e "const fs=require('fs');const b=fs.readFileSync('research/raw/m045-console-shapes.json');console.log('bytes: '+b.length)" && npm run check && npx prettier --check research/raw/m045-console-shapes.json
```

## Log

- Task written at the fourth repair cycle; not started.
