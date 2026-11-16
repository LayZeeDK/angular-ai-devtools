---
id: T025
title: State the title only when the row carries one
wave: 18
deps:
  - T015
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - scripts/console-panel-render.test.mjs
  - scripts/console-panel-record.test.mjs
  - research/raw/m045-console-panel.json
---

# T025 — State the title only when the row carries one

## Context

Wave 10's review reproduced an answer the join produces: a case-folded match whose digest entry carries a
code and no title. The pane rendered that answer with two sentences that contradict each other —
`case-difference: … so this finding carries the digest's own spelling and title` and
`no-title: … states no title for it, so no title is rendered`. 86/86 and 78/78 were green on it, because
no pin renders the folded row without a title.

## Approach

The sentence states only what the row carries. `panel-console.ts` already builds each sentence from slots;
the title claim becomes conditional on the finding carrying a title, and the sentence for a folded row
with no title says that instead. The render suite pins both shapes and the record suite keeps the recorded
folded case honest about which one it holds.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None — this repairs a review finding inside SC2's surface honesty: a surface may state what the observable
states and nothing more.

## Acceptance criteria

- AC1 A folded row whose digest entry carries a title still renders the title claim, quoted.
- AC2 A folded row whose digest entry carries no title renders no title claim, and says no title is
  rendered — the two sentences on that surface agree.
- AC3 Each new pin is armed with a mutation of `panel-console.ts`, the failure names the defect by string,
  and the file's sha256 is equal before and after.
- AC4 A default run of the record suite moves no byte; only `M045_CAPTURE=1` writes it.

## Verify

```bash
node --test scripts/console-panel-render.test.mjs scripts/console-panel-record.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app scripts research/raw
```

## Log

- Task written at the wave-18/19 repair plan; not started.
