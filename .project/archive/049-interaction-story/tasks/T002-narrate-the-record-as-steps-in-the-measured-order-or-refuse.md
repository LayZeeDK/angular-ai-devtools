---
id: T002
title: Narrate the record as steps in the measured order, or refuse
wave: 2
status: done
deps: [T001]
agent: build_T002
base: eed1477990f3dde85ce1f74755bb9843d15e3618
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
- Built `extension/interaction-story.js`: `interactionStory(record)` returns exactly
  `{ state, steps, cannotTell, reason }`. `state` is `steps` or `cannot-tell`; `steps` is the union
  of `record.routerEvents`, `record.events` and `record.boundary.entries`, sorted by the one field
  T001 measured (`at`, read by `nowMs`), each step `{ stream, at, fields }` where `fields` is the
  entry's own keys and values with `at` hoisted and no key added or renamed. Equal `at` is one
  instant: the stable sort emits those steps contiguously in the order the record lists them and
  never compares stream name, type or position. Exported the closed reason set
  (`all-streams-empty`, `stream-empty`, `no-shared-order`, `record-unreadable`), `STREAM_NAMES`,
  `SHARED_FIELD`, `SHARED_READER`, `BOUNDS` (512/64/128) and `BOUNDED_STATEMENT`. All-empty is
  `cannot-tell`; one or two empty streams are a `steps` story with the empties named in
  `cannotTell`; an entry with no measured `at` is `cannot-tell` with `no-shared-order`; a stream
  the record does not carry as a list is `record-unreadable`.
- Extended `scripts/interaction-story.test.mjs`; T001's seven tests stay. T002 adds ten tests:
  measurement vocabulary/bounds, SC1 story order + fields, SC2/E4 empty cases in one test, SC3
  no-`at` refusal, equal-`at` grouping, unreadable refusal, nested-values quoting, idempotency,
  purity under `node:vm` tripwires, and republish-in-place. Seven mutants each redden with the
  defect named by string: M1 reordered step, M2 paraphrased field, M3 invented step, M4 all-empty
  reported as an empty story, M5 no-`at` record ordered anyway, M6 invented stream-name tie-break,
  M7 invented type tie-break.
- One T001 assertion had to be scoped, not weakened: its extension-wide `/interaction/g` count
  asserted 0 across every `extension/*.js`, but T002 adds `interaction-story.js`, a pure reader
  whose mandated name carries the word seven times. The word count now runs over recorder files
  (excluding the narration) while the UI-listener count still runs over every file; both remain 0.
  `research/raw/m049-streams.json` was not changed.
- Verify:
  `node --test scripts/interaction-story.test.mjs && npx prettier --check extension/interaction-story.js scripts/interaction-story.test.mjs`
  → 17 tests, 17 pass, 0 fail; "All matched files use Prettier code style!".
- Landed paths: `extension/interaction-story.js`, `scripts/interaction-story.test.mjs`, `research/raw/m049-streams.json` — each is read from this tree, ready.
