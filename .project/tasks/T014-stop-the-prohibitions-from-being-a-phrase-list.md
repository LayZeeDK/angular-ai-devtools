---
id: T014
title: Stop the prohibitions from being a phrase list
wave: 9
deps:
  - T009
  - T012
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/console-panel-render.test.mjs
  - scripts/console-panel-record.test.mjs
  - research/raw/m045-console-panel.json
  - apps/angular-ai-devtools/src/app/panel-console.ts
---

# T014 — Stop the prohibitions from being a phrase list

## Context

Wave 3's cycle-3 review found the silence rule is a five-pattern lexicon rather than a rule about the
shape of the sentence. Rewording the `no-diagnostics` state to "the page emitted no diagnostic at all"
leaves every silence pin green, and an armed re-capture blesses it. "the page reported nothing at all"
reddens, so the boundary is the word list and not a dead check — which is how a prohibition quietly stops
prohibiting.

The record suite carries no silence rule at all, so a recording can bless the same sentence even if the
render suite were repaired.

## Approach

- - Replace the phrase list with a property of the sentence: an absence statement may say what was read and
  what it means for the panel, and may never assert what the page did instead — no claim about the page
  emitting, reporting, logging or being silent, in whatever words.
- Apply the same property in the record suite, so a recording cannot bless what the render pins refuse.
- Keep the existing positives working: all three shipped state sentences and the named absences must pass,
  including the one that legitimately says a capture whose own attempt failed also emits nothing.
- Prove it with sentences the lexicon would have missed, in more than one wording, for more than one state.

## Acceptance criteria

1. A claim about the page's own behaviour — emitting, reporting, logging or being silent — reddens in every state and in the record suite, in at least three different wordings, none of which the old lexicon matched.
2. The shipped sentences all pass, including the negation that legitimately mentions emission, so the rule distinguishes a claim from its denial.
3. A pane-written sentence that merely describes what was read passes.
4. The rule is stated once and read by both suites rather than duplicated, or its duplication is pinned by a test that fails when the two drift.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-render.test.mjs scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check scripts
```

## Log

- Task written at the third repair cycle; not started.
