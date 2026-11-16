---
id: T015
title: Report a case-folded match as the digest carries it
wave: 10
deps:
  - T002
  - T014
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-panel.json
  - research/raw/m045-console-shapes.json
---

# T015 — Report a case-folded match as the digest carries it

## Context

Wave 4's cycle-3 review found the milestone's held-out criterion E6 unmet by any task: the join compares
codes exactly (`entry.code === code` in `extension/console-join.js`), so a diagnostic carrying `ng01002` is
reported as `code: 'ng01002'` with `reason: 'no-digest-entry'`, and neither the join nor the surface names the
case difference. E6 says a diagnostic whose code matches a digest entry only after case folding is reported as
the digest carries it, and the row names the case difference.

Nothing in the milestone owns this. It is a gap in what shipped, not a defect in a repair, and the honest
response is to implement it rather than to rule it out because no task claimed it.

## Approach

- - Fold case for the match only: the digest entry is found by comparing case-insensitively, and the finding
  carries the digest's own `code` and `title`, not the message's spelling.
- Keep the raw spelling available so the surface can name the difference, and render a sentence that states
  the message carried one spelling and the digest carries another — without a cause, an element or a remedy.
- Do not let folding invent a match: a code that folds to nothing in the digest is still
  `no-digest-entry`, named by the code the message carried.
- Record the shapes this changes, and pin the behaviour with tests that redden if the fold is removed.

## Acceptance criteria

1. A diagnostic carrying a code that differs from a digest code only in case is reported with the digest's code and title, and the finding names the case difference.
2. The surface renders that sentence, and renders no cause, element or remedy with it.
3. A code that folds to nothing in the digest is still reported as an absence named by the code the message carried.
4. Removing the fold reddens a test that names E6; removing the case-difference wording reddens a second.
5. The records that describe the join's matching are re-captured, and an unarmed run reads them byte-identically.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC2

## Verify

```bash
node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check extension scripts research/raw
```

## Log

- Task written at the third repair cycle; not started.
