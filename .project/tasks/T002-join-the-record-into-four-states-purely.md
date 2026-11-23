---
id: T002
title: Join the record into four states, purely
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/chunk-failure.js
  - scripts/chunk-failure.test.mjs
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

- pending.
