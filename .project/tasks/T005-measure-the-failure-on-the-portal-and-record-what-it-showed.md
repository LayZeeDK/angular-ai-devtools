---
id: T005
title: Measure the failure on the portal, and record what it showed
wave: 5
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m064-portal-capture.json
  - scripts/chunk-failure-capture.test.mjs
---

# T005 — Measure the failure on the portal, and record what it showed

## Goal

Take the verdict on the Insurance Portal, and record the route tried, what the page showed and why a fixture was or was not needed.

## Context

The portal is the verification target; a fixture is a fallback that must name the artefact the portal lacks. The capture is opt-in and read-only by default.

## Approach

One armed capture behind `M064_CAPTURE=1`, one record, one suite that reads the record and never writes it unless armed.

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

1. SC1: the record names the portal route tried, the state the surface showed, and the artefact the portal lacks if a fixture was used.
2. SC2: an unarmed run writes nothing and the record is unchanged; a never-completed request is recorded as such.

## Intent coverage

- SC1
- SC2

## Verify

```bash
node --test scripts/chunk-failure-capture.test.mjs
```

## Log

- pending.
