---
id: T002
title: Judge the record for an event whose consequent never arrived, or refuse
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/dead-click.js
  - scripts/dead-click.test.mjs
  - research/raw/m050-chains.json
---

# T002 — Judge the record for an event whose consequent never arrived, or refuse

## Context

T001 measures the three consequence chains, their pairing fields and the window. This task judges the
record with that measurement: an event whose consequent is absent within the window is a finding, and
a record whose window cannot be bounded is `cannot-tell` rather than a list of dangling events.

## Approach

Build `extension/dead-click.js` exporting `deadClick(record)`, returning
`{ state, findings, considered, reason }`. Pairing uses the field T001 measured — never adjacency,
never order. An event belonging to no measured chain is counted in `considered` and never reported.
Extend `scripts/dead-click.test.mjs`: pin the untouched module first, then mutate four ways — a paired
event reported as dangling, a pair matched by adjacency, an unbounded record reported as clean, and a
finding carrying an invented cause. Each mutant reddens naming the defect by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`deadClick(record)` receives the page record and returns `{ state, findings, considered, reason }`.
`state` is one of `findings`, `clean`, `cannot-tell`; `findings` is an array of
`{ chain, event, window }` where `event` carries the record's own fields for the dangling start and
`window` names the bounds the judgement used; `considered` is the number of events that belong to a
measured chain; `reason` is present only when `state` is `cannot-tell` and is a member of a closed set
exported by the module. No other file implements this function, and no caller reads the page or a
clock.

## Files

  - extension/dead-click.js
  - scripts/dead-click.test.mjs
  - research/raw/m050-chains.json

## Acceptance criteria

1. A dangling start is reported with its own fields and the window; a paired start is never reported; a pairing that relies on adjacency rather than the measured field reddens.
2. Held-out E4: one dangling beside one paired event yields exactly one finding, and the same test asserts the all-paired case.
3. An unbounded record is `cannot-tell` with a closed reason, and an event outside every measured chain is counted and not reported.
4. The suite pins the untouched module, each of the four mutants reddens naming the defect by string, and judging the same record twice returns identical findings in identical order.

## Verify

```bash
node --test scripts/dead-click.test.mjs && npx prettier --check extension/dead-click.js scripts/dead-click.test.mjs
```

## Log

- pending.
