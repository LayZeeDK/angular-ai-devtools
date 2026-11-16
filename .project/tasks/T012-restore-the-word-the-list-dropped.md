---
id: T012
title: Restore the word the list dropped
wave: 8
deps:
  - T009
status: in-progress
agent: build_T012
base: 9c955463fbe7f22b1c80fb6b7303490213575d9c
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-panel.json
---

# T012 — Restore the word the list dropped

## Context

Wave 5's cycle-3 review failed T009 for following its brief too literally. The brief said to drop words
"subsumed by a more general one", and `fix` was dropped because `remedy` is more general. They are not the
same word in a sentence. A pane whose own joined sentence reads "..., and to fix this, edit the binding" is
blessed by an armed re-capture and then passes both suites — 27 of 27 and 32 of 32 — with a remedy sentence
sitting in the recording. At `2fa589b9` the same line was refused.

The fix is in the list, not in the matching: word-boundary matching is what clears "prefix", and it never
required deleting `fix`. The same question applies to every other word the list carries, so the repair
should re-examine them rather than restore one and leave the rest unexamined.

## Approach

- - Restore `fix` as a prohibited word, matched whole, so "prefix" and "affix" pass and "to fix this" does
  not.
- Re-examine the remaining entries the same way: for each, ask whether a pane could state the thing in a
  word the list does not carry, and either add the word or record why the list is sufficient.
- Prove both directions: a pane-written "to fix this, edit the binding" reddens naming the line, and a
  pane-written "an account of the prefix is not given" passes.
- Keep the exemption for carried values intact, and re-confirm that emptying it still reddens.

## Acceptance criteria

1. A pane-written sentence containing the word "fix" reddens a pin that names the state, the line and the word.
2. A pane-written sentence containing "prefix" or "account" passes, so the matching is by word and not by substring.
3. Every remaining prohibited word is either shown to catch a demonstrably bad sentence, or replaced by one that does, and the reasoning is recorded in the task Log.
4. The carried-value exemption still holds: a recorded digest title and captured text may contain those words and pass, and emptying the exemption reddens a named test.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs && npx prettier --check scripts research/raw
```

## Log

- Task written at the third repair cycle; not started.
