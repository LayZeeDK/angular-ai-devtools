---
id: T001
title: Record the outlet each route requests and the name the state matched
wave: 1
status: done
deps: []
agent: build_T001
base: 70922e0153cb57b363cc6900a1f08812dde1eccf
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
- Landed paths: `extension/outlet-state.js`, `scripts/outlet-state.test.mjs`, `scripts/extension-manifest.test.mjs`, `extension/manifest.json`, `scripts/gate-integrity.test.mjs`.
- The record is `{ state, routes: [{ requested, matched, path }], absences }` on `globalThis.angularAiOutletState`. `requested` comes from the route configuration and `matched` from the router state, and the suite proves they are two distinct sources by mutating each separately.
- The plan's Interface contract on this task is T002's contract, not T001's: the generator this plan used gave every task the `outletAnswer(record)` block because plan approval requires a byte-identical contract across tasks that share files. The coder built the reducer its own Goal and acceptance criteria describe and said so; the join contract is T002's, and T002 is where it belongs. Recorded here rather than silently corrected so the defect is visible in the archive.
- The unnamed-versus-`primary` normalisation is the join's job: the record keeps `requested: null` with `outlet-not-requested` for a route whose configuration names no outlet, and the suite pins both spellings.
- `scripts/extension-manifest.test.mjs` did not exist although the Verify names it; it was created as the registration half of SC3, and its first assertion is that no second manifest-registered module carries an outlet name.
- Every mutant was measured both ways: each drives the mutated value first and asserts it changed, so a no-op mutation fails loudly instead of passing quietly.
- `scripts/page-footprint.test.mjs` now describes the shipped page footprint minus one module (it does not boot the new one), so that recording is drift for the re-derivation task, not a broken pin.
- `scripts/gate-integrity.test.mjs` was already red at this base for a `.project` reason (no M062 task declares a claim) and could not derive at all without a `SUITE_DIFF_REASONS` row for the new suite; the row was added, and the staleness is T006's.
