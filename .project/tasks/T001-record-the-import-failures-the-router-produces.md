---
id: T001
title: Record the import failures the router produces
wave: 1
status: pending
deps: []
agent: null
base: null
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
