---
id: T001
title: Record the outlet each route requests and the name the state matched
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/outlet-state.js
  - scripts/outlet-state.test.mjs
  - extension/manifest.json
  - scripts/extension-manifest.test.mjs
  - extension/manifest.test.mjs
  - extension/overlay.test.mjs
  - extension/page-footprint.test.mjs
  - scripts/docs-correction.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T001 — Record the outlet each route requests and the name the state matched

## Goal

Record, for the active route, the outlet the route configuration requests, the outlet the router state matched and the route path — as one record the join can read.

## Context

No record in this tree carries an outlet name: `grep -ri "\boutlet\b" extension/` returns 0 matches. The router record M033 joins against carries the configured path set and the unmatched segment only, so this milestone writes the field it needs instead of widening that record. An unnamed outlet and `primary` are the same outlet, which is why the record states what it read rather than normalising it away.

## Approach

Read the router state the agent already holds, reduce each activated route to `{ requested, matched, path }`, and expose the reduction as a pure function plus one reader. Register the reader in the manifest beside the existing ones. Assert in the same suite that the source of a name is this record and nothing else.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. SC3: the record is the only source of an outlet name — its suite asserts no other module under `extension/` produces one, and a second reader reddens it.
2. SC1: the record names the requested and matched outlet for a route that declares a second named outlet; a mutant that renames the outlet in the route configuration reddens it and the red names the field that moved.
3. SC2: an outlet the state does not carry leaves `matched` absent rather than filled from the rendered tree; a mutant that fills it from a DOM query reddens it.

## Verify

```bash
node --test scripts/outlet-state.test.mjs scripts/extension-manifest.test.mjs && npx prettier --check extension/outlet-state.js scripts/outlet-state.test.mjs
```

## Log

- pending.
