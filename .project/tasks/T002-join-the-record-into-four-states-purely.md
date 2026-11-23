---
id: T002
title: Join the record into four states, purely
wave: 2
status: done
deps: [T001]
agent: build_T002
base: ac08b8e2a276158379f0e547478ef97f142604b4
worktree: null
task_branch: null
files:
  - extension/chunk-failure.js
  - scripts/chunk-failure.test.mjs
  - scripts/import-failure.test.mjs
  - research/raw/m064-import-failure.json
---

# T002 — Join the record into four states, purely

## Goal

Join the failure record into the four states, with no read of the page, no second network read and no attribution the record does not carry.

## Context

The record exists after T001; this task is the join only.

## Approach

One exported function and one observer. A specifier with a status is `missing-import`; one with no status is `never-completed`; a resolved import is `resolved`; anything the record does not settle is `cannot-tell`.

## Interface contract

The join exports exactly this shape, and the surface renders it and nothing else:

```js
{ state, specifier?, routePath?, status?, hash?, consideredCount?, reason? }
```

`state` is one of `missing-import` (the import failed and the record names the specifier), `never-completed` (the
request produced no response status), `resolved` (the import loaded, so there is no failure to report) or
`cannot-tell` (a reason string on its own). No field is synthesised: `hash` is present only when the record carried
one, and `status` only when a response arrived.

## Acceptance criteria

1. SC1: each of the four states is produced by its own input, and eight in-memory mutants each redden by field name.
2. SC2: a request with no status is `never-completed` with a reason, and a mutant that infers a drift from a status reddens naming the field.
3. SC1: both failures of one navigation are named in router order, and a failure attributed to an unattempted route is refused.

## Intent coverage

- SC1
- SC2

## Verify

```bash
node --test scripts/chunk-failure.test.mjs
```

## Log

- Contract amended at dispatch: `scripts/import-failure.test.mjs` and `research/raw/m064-import-failure.json` are declared, because T001's SC3 census asserts its module is the only one under `extension/` that names `specifier`, `importAttempts` or `missing-import` — and a join that reads the record and answers `missing-import` necessarily names all three. The repair is the census's own sentence, not the join's vocabulary: the record is the only *producer* of a specifier, and this join is its single reader. Narrow the rule to say exactly that and re-capture the record's census block.
- pending.
- Wrote xtension/chunk-failure.js (353 lines, four states, five reasons) and scripts/chunk-failure.test.mjs (16 tests, 919 assertions, eight mutants).
- T001's SC3 census asserted its module was the only one under xtension/ naming specifier, importAttempts or missing-import, and this join necessarily names all three. The census now states one producer and one reader, and it was falsified: a planted second producer reddens naming it as a third module.
- The join answers one attempt at a time and one answer per attempt for a list, so E2 is met by answering every row in the order the record holds them rather than by collapsing a navigation to one finding.
- E7 reads the router stream the narrator already publishes: a route the stream never names is dropped from the answer while the failure it does state is kept, and no stream handed over means the record's own path is carried.
- Landed paths: `extension/chunk-failure.js`, `scripts/chunk-failure.test.mjs`, `scripts/import-failure.test.mjs`, `research/raw/m064-import-failure.json` — each is read from this tree, ready.
