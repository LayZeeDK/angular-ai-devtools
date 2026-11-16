---
id: T017
title: Hold the record's label vocabulary to the pane
wave: 11
deps:
  - T015
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m045-console-panel.json
  - scripts/console-panel-record.test.mjs
---

# T017 — Hold the record's label vocabulary to the pane

## Context

Wave 5's cycle-4 review found the record's own vocabulary had drifted from the pane it describes.
`contract.lineLabels` lists fourteen labels; the shipped pane can write fifteen, because `case-difference:` was
added by the later task that reports a folded match. Recording a line with that label reddens the record's own
pin with "is labelled \"case-difference\", which the record's contract does not carry" — the record refuses a
sentence the pane legitimately renders.

The field is a statement about the pane, not about the recorded subset, and nothing holds it to the module,
which is how it drifted. Five labels in it are rendered by no recorded case, so a test that compared it to the
recording would not have caught this either.

## Approach

- - Add the missing label, and any other the pane can write, so the record's vocabulary describes the pane
  rather than a sample of it.
- Hold the field to the module: a test reads the labels the pane can emit and fails when the record's list
  and the pane disagree in either direction, so drift of this kind reddens at the moment it is introduced.
- Keep the recording's own cases honest: a case that renders the folded-match sentence may be added, but only
  if the pane produces it at this head.
- Do not widen the vocabulary to make a bad sentence pass: the list says which labels the pane writes, not
  which words it may use in them.

## Acceptance criteria

1. The record's label vocabulary equals, in both directions, the set of labels the pane can write, and a test fails when either side gains or loses one.
2. Recording a case that renders the case-difference sentence does not redden the record's own pin.
3. The vocabulary still refuses a label the pane cannot write, proven by a mutant.
4. The record remains idempotent: an unarmed run reads it byte-identically, one armed run writes, a second writes nothing.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check scripts research/raw
```

## Log

- Task written at the fourth repair cycle; not started.
