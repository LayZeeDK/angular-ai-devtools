---
id: T002
title: Filter the names the record carries and state every absence
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 32f92b092b8c70f46d4f85cd1026a3a046703835
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
- Landed paths: `extension/component-search.js`, `scripts/component-search.test.mjs`, `research/raw/m047-names-and-absences.json` — each is read from this tree, ready.
- pending.
- 2026-11-17 — `extension/component-search.js` lands: an IIFE that publishes `angularAiComponentSearch.componentSearch` (plus `reasons`, `states`) on the realm it runs in, the shape `extension/field-state.js` already uses. `componentSearch(record, query)` reads `{ components, source }` and answers `{ state, rows, matched, reason }`; `reason` is set only for `cannot-tell`. Matching is one lowercased `indexOf` against the recorded `name` and nothing else; the query is trimmed and lowercased once. Rows are one per record entry, in the record's order, carrying the record's name and its non-negative integer `instanceCount` — or `null` where the record states none. No name is completed from framework knowledge, no row is invented, and the module names no `document`.
- 2026-11-17 — the closed reason set is five words: `agent-not-installed`, `no-profiler`, `enumerate-without-getter`, `unreadable-source`, `unreadable-record`. The first three are literal absence ids T001 measured (`extension/agent-main.js:509`, `:531`, `:862`), so no page cause is invented here; the last two are the filter's own because they name the record's unreadability rather than a page's cause. It is closed because `unreadableReason` accepts only a member of `REASONS` and answers `unreadable-source` for anything else — a cause the record invented can never reach `reason`. The agent's own state word `notsupported` is deliberately not translated: it is answered for four different causes (`:518`, `:531`, `:544`, `:552`), so the filter takes causes, not words.
- 2026-11-17 — E4 is one record shape read two ways: `components: []` beside `source: { state: 'read' }` answers `empty` with no `reason`, and the same empty list beside `source: { state: 'unreadable', reason: 'enumerate-without-getter' }` answers `cannot-tell` with that reason. The state is decided by what the record says about the source, never by the length of the list — so the stated empty list cannot collapse into the read that did not happen, and the two are asserted side by side in one test.
- 2026-11-17 — the suite grew from 8 tests to 16 (T001's 8 untouched and still green; 8 for the filter). Every pin runs on the untouched module first, then on a copy mutated at one anchor, and the mutant's failure must carry the defect phrase. Mutants and the string each names: `case-sensitivity` → "matches a case-insensitive substring" (query `APP` keeps app-counter and app); `framework-completion` → "never completes a name from framework knowledge" (a query for `root` keeps nothing, because the record does not carry the framework's app-root); `invented-row` → "emits no row the record does not carry"; `invented-count` → "a count the record does not state is null"; `invented-cause` → "never repeats a cause the record invented" (a source stating `framework-not-detected` answers `unreadable-source`); `empty-for-unreadable` → "an unreadable source is cannot-tell with its reason" (the E4 pin, reddening with "never an empty list presented as a result"); `order-defect` → "identical rows in identical order"; `dom-read` → "the list is read from the record". Two further pins: `componentSearch` is implemented in one file (every other `.js` in `extension/` is read and asserted not to mention it), and the module's `reasons`/`states` equal the record's, in order.
- 2026-11-17 — `research/raw/m047-names-and-absences.json` gains one top-level `search` section: the record shape the filter reads, the three states, the five reasons (three with their absence id and a `path:line` producer, two marked `producer: null` as the filter's own), the E4 pair, the matching rule, the eight mutants with the phrase each failure names, and four `notPinned` statements (the fixture counts are fixture data, no running page was read, the two own reasons have no producer line, idempotency's mutant is the order defect because a pure function's second answer can only differ by mutating the record or its state). T001's suite now also holds this section: its `reasons`/`states`/`mutants` are cross-checked against the module and the suite, and each of its three producer citations is verified against `extension/agent-main.js` by the same `assertCitation` the record's own citations pass.
- 2026-11-17 — commands and their output: `node --test scripts/component-search.test.mjs` → `tests 16`, `pass 16`, `fail 0`, and eight mutant lines naming their defects; `npx prettier --check extension/component-search.js scripts/component-search.test.mjs` → `All matched files use Prettier code style!`; `npx prettier --check research/raw/m047-names-and-absences.json` → the same; `node node_modules/typescript/bin/tsc -p extension/tsconfig.json` → exit 0, so the new file is inside the extension type check the same as every authored script; `node -e` over the module → `document 0`, `querySelector 0`.
- 2026-11-17 — not established: no running page was read, so the filter is proven over records built from the names T001 measured and not over a live answer; the fixture counts (3 and 1) are fixture data, not measurements, because the enumerator deduplicates by class name (`extension/agent-main.js:888`) and states no instance count. Sibling suites outside this task's Verify (`scripts/recording-consistency.test.mjs`, `scripts/gate-integrity.test.mjs`) report failures in this tree, all in other milestones' recordings (M035 ranges, NavigationSkipped entries, `.project` reference classes); neither they nor any other file reads `extension/component-search.js` or the `search` section, and the extension type check that covers the new file exits 0.
- Landed paths: `extension/component-search.js`, `scripts/component-search.test.mjs`, `research/raw/m047-names-and-absences.json`.
