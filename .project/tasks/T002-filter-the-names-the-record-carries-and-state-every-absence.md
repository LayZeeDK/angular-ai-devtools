---
id: T002
title: Filter the names the record carries and state every absence
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
- extension/component-search.js
- scripts/component-search.test.mjs
- research/raw/m047-names-and-absences.json
---

# T002 — Filter the names the record carries and state every absence

## Context

T001 records what the agent can name. This task turns that record into a pure join: the panel asks
for the components a page rendered, filters them by the text a user typed, and reports an absence as
an absence. The filter may match only names the record carries, and an unreadable source is
`cannot-tell` with a closed reason, never a zero-length list.

## Approach

Add `extension/component-search.js` exporting `componentSearch(record, query)`, returning
`{state, rows, matched, reason}` where `state` is `listed`, `empty` or `cannot-tell`. Matching is a
case-insensitive substring test against the recorded name only. Extend
`scripts/component-search.test.mjs` to pin the untouched module first, then mutate it: a mutant that
matches a name the record lacks, one that reports `empty` where the source is unreadable, and one
that invents an absent row. Each mutant must redden with the defect named by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`componentSearch(record, query)` receives `{ components, source }` and returns
`{ state, rows, matched, reason }`. `state` is one of `listed`, `empty`, `cannot-tell`; `rows` is an
array of `{ name, instanceCount }`; `matched` is the number of rows after filtering; `reason` is
present only when `state` is `cannot-tell`, and is one of a closed set. No other file implements this
function, and no caller reads the DOM to build the list.

## Files

- extension/component-search.js
- scripts/component-search.test.mjs
- research/raw/m047-names-and-absences.json

## Acceptance criteria

1. `componentSearch` returns `listed` with only names the record carries, `empty` for a record that states the page rendered none, and `cannot-tell` with a closed reason when the source could not be read.
2. Held-out E4: a record stating the page rendered no components yields `empty` with zero rows, and the same suite asserts `cannot-tell` beside it, so the two states cannot collapse into one.
3. The suite pins the untouched module, segfaults nothing, and each of the three mutants reddens naming the defect by string.
4. Filtering the same text twice returns identical rows in identical order.

## Verify

```bash
node --test scripts/component-search.test.mjs && npx prettier --check extension/component-search.js scripts/component-search.test.mjs
```

## Log

- pending.
