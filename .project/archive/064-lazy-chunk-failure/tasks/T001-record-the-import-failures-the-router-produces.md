---
id: T001
title: Record the import failures the router produces
wave: 1
status: done
deps: []
agent: build_T001
base: c49cc0bbcf07ca6563d0ac72add8d651edc95701
worktree: null
task_branch: null
files:
  - extension/import-failure.js
  - scripts/import-failure.test.mjs
  - research/raw/m064-import-failure.json
---

# T001 — Record the import failures the router produces

## Goal

Write the observable: one record per dynamic-import attempt, carrying the specifier, the route path, the response status and the content hash when there is one — or the fact that the request never completed.

## Context

Measured before this milestone: `grep -c "chunk" extension/agent-main.js` is 0, and `extension/navigation-narrator.js:26` states that the navigation payloads carry `{ route, type }` and no chunk. Nothing records an import failure, so this task writes the record.

## Approach

Tap the router's dynamic import once, at the single place the content script already observes navigation. Record what the attempt returned, not what it means: no cause, no remedy, no version drift. A request with no response is recorded as never completed with its reason.

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

1. SC1: a stubbed failing import records the specifier, the route path and the status, and a mutant that resolves the import turns the finding off.
2. SC3: the record is the only source of an import specifier — its suite asserts no other module under `extension/` produces one.

## Intent coverage

- SC1
- SC3

## Verify

```bash
node --test scripts/import-failure.test.mjs
```

## Log

- pending.
- Wrote \xtension/import-failure.js\, \scripts/import-failure.test.mjs\ and esearch/raw/m064-import-failure.json\.
- The tap is published rather than installed: \observeImportFailures()\ is exported for the one call site in
  \xtension/agent-main.js\, which is outside this task, and the module wraps nothing itself. Its suite asserts that by
  scanning its own comment-stripped code for \import(\, \etch\, \document\, \window\, \performance\, \chrome\,
  \process\ and equire(\.
- Six mutants, each naming the field that moved: a drift inferred from a status, a hash filled from a chunk filename, a
  dropped route path, a resolved import recorded as a failure, a missing status recorded as a 404, and a counted field in
  the record. The suite reports 18 tests and 798 assertions on a default run.
- \consideredCount\ had no producer in the interface contract; it is now the number of attempts an answer produced from a
  list walked, absent on a single-attempt answer, pinned by three tests.
- esearch/raw/\ is in \.prettierignore\ and prettier reports an explicitly named ignored file as matched, so the
  formatting proof is substantive for the two JS files and the record's shape is held by the suite's canonical-bytes pin.

- Landed paths: `extension/import-failure.js`, `scripts/import-failure.test.mjs`, `research/raw/m064-import-failure.json` — each is read from this tree, ready.
