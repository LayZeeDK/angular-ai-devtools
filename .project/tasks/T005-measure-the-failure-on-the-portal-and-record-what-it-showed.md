---
id: T005
title: Measure the failure on the portal, and record what it showed
wave: 5
status: done
deps: [T003]
agent: build_T005
base: 3106fad1fcf6e8bd9a98b51032f48abc8654c500
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
- Verdict taken on the Insurance Portal: route contract, its lazy chunk discovered from the navigation rather than typed, intercepted with the browser's own page.route and no page-side edit.
- Both arms measured: an aborted request with no status, and a fulfilled 404. The import rejected, the router stayed on /home, the page text was byte-identical and no page error was raised.
- The surface answer is cannot-tell, derived by running the join in a bare 
ode:vm: the page carries no import record, so the record names 
ecord-unreadable for what it found and 
o-import-recorded for an empty one.
- The portal lacks two artefacts and both are named: the import specifier, because the served bundle calls import on a chunk URL the module refuses as a specifier, and the attempt record itself, because import-failure.js is not in the manifest. No fixture verdict was taken, and the record says a fixture would not supply the specifier either.

- Landed paths: `research/raw/m064-portal-capture.json`, `scripts/chunk-failure-capture.test.mjs` — each is read from this tree, ready.
