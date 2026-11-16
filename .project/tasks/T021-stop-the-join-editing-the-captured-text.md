---
id: T021
title: Stop the join editing the captured text
wave: 13
deps:
  - T002
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-shapes.json
  - research/raw/m045-console-panel.json
---

# T021 — Stop the join editing the captured text

## Context

Wave 2's cycle-3 review recorded, for the third time, that the join appends " (this message carried no
code)" to the diagnostic's own text before the pane renders it as `text:`. The pane's own docblock says `text:`
is the captured text verbatim, and the pane already states the absence in its own `no-code:` sentence, so the
surface says twice what the capture said once and edits a string it claims to quote.

SC1 asks for one finding per diagnostic "naming the diagnostic's own text". A finding whose text is the
capture's text plus the join's sentence does not name the diagnostic's own text.

## Approach

- - Make `text` byte-identical to the diagnostic's own text, for every state and every finding.
- Keep the absence: the pane's `no-code:` sentence is what states it, and the finding's missing `code` is what
  selects that sentence. Removing the join's parenthetical must lose no information the surface shows.
- Pin it: a test asserts `text` equals the input text for a message with no code, one with a code, one whose
  code the digest lacks, and one with surrounding whitespace if `codeOf` trims (say what happens to whitespace).
- Re-capture the records the change stales, and prove an unarmed run reads them byte-identically.
- Record in the task Log that the interface-contract copies in the landed task files omit `carriedCode`, so
  that gap is visible rather than silent; do not edit the landed task bodies, which are append-only.

## Acceptance criteria

1. Every finding's `text` is byte-identical to the text the capture recorded, proven for a message with a code, one without, one whose code the digest lacks, and one with leading or trailing whitespace.
2. The surface still reports a message that carried no code, through its own sentence, and a test shows that removal of the join's note loses nothing.
3. The records that describe the join's answers are re-captured, and an unarmed run reads them byte-identically.
4. The gap the review found — `carriedCode` absent from the interface-contract copies in the landed task files — is recorded in this task's Log as a known documentation gap.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check extension scripts research/raw
```

## Log

- Task written at the sixth repair cycle; not started.
