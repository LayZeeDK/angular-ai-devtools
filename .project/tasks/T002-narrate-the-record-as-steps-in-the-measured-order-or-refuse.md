---
id: T002
title: Narrate the record as steps in the measured order, or refuse
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/interaction-story.js
  - scripts/interaction-story.test.mjs
  - research/raw/m049-streams.json
---

# T002 — Narrate the record as steps in the measured order, or refuse

## Context

T001 measures the three streams' shapes and whether they share a comparable field. This task turns
the record into steps in the order the measurement supports, quoting each event's own fields, and
refuses to merge what shares no order. A record whose streams are all empty is `cannot-tell`, not an
empty story.

## Approach

Build `extension/interaction-story.js` exporting `interactionStory(record)`, returning
`{ state, steps, cannotTell, reason }`. The order is the one T001 measured: if the streams share a
comparable field the steps interleave on it, and if they do not, the story is per-stream and the
merged answer is the refusal SC3 requires — never a guessed sequence. Extend
`scripts/interaction-story.test.mjs`: pin the untouched module first, then mutate four ways — a step
reordered, a step paraphrased instead of quoted, an invented step, and an all-empty record reported as
an empty story. Each mutant reddens naming the defect by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`interactionStory(record)` receives the page record and returns `{ state, steps, cannotTell, reason }`.
`state` is one of `steps`, `cannot-tell`; `steps` is an array of `{ stream, at, fields }` in the
measured order, where `fields` are the event's own recorded values and never a paraphrase; `at` is the
comparable field when one was measured, and `null` otherwise. `cannotTell` names what was missing — an
empty stream, all streams empty, or streams that share no order — and `reason` is a member of a closed
set exported by the module. No other file implements this function, and no caller reads the page.

## Files

  - extension/interaction-story.js
  - scripts/interaction-story.test.mjs
  - research/raw/m049-streams.json

## Acceptance criteria

1. Steps are in the order T001 measured, and when no comparable field exists the answer is the refusal rather than a merged sequence.
2. Held-out E4: one empty stream beside two populated ones renders the two and names the empty one, in one test that also asserts the all-empty case.
3. The suite pins the untouched module, and each of the four mutants reddens naming the defect by string.
4. Narrating the same record twice returns identical steps in identical order.

## Verify

```bash
node --test scripts/interaction-story.test.mjs && npx prettier --check extension/interaction-story.js scripts/interaction-story.test.mjs
```

## Log

- pending.
