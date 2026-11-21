---
id: T008
title: Re-derive the gate shapes the landing staled
wave: 5
status: pending
deps: [T007]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - scripts/gate-integrity.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-signals-shapes.test.mjs
---

# T008 — Re-derive the gate shapes the landing staled

## Context

`research/raw/m044-gate-shapes.json` is red at this head before any M057 byte (PLAN C5): measured at
plan time, `node --test scripts/gate-integrity.test.mjs` is 37 of 40 with three failures whose first
is `the recording disagrees with this run's derivation … claims[5].resolvesTo: 55 row(s) -> 56
row(s)` — M056's ship commit now exists, so the fix-record resolver no longer takes the fallback the
record captured — and whose other two are that suite's own rule-named mutants, which refuse while the
rule they mutate is the ship commit rather than the fallback. The record measures this tree's suites,
its code references and its archive checks, so every suite and recording the earlier waves touched
moves it; it is re-derived after them and before the project verify.

## Approach

Run the capture command armed — `scripts/gate-integrity.test.mjs` behind its own environment flag —
and read back what it wrote before anything else runs: the record carries the suite census, the
reference table, the fix-record section and the suite diff, all derived from this head. A second
armed run changes no byte, which is the idempotence pin the suite carries rather than a comparison
this task makes by eye.

The suite is edited only where its own derived sections demand it, never to reach green: the
suite-diff reason table is an allow-list that refuses a new suite by name, and this milestone adds
three — `scripts/tutor-signals-shapes.test.mjs`, `scripts/tutor-signals.test.mjs` and
`scripts/tutor-signals-graph.test.mjs` — so each gets its declared row here, exactly as M055's third
task did for its own pair. No check is loosened, no reason text is invented for a suite that was not
read, and the two mutants the suite carries are left as they are: the record they guard is what moves.

Declare `scripts/gate-integrity-default-tasks.test.mjs` because its sibling names it (PLAN C4), and
edit neither that suite nor any other.

## Intent coverage

- SC5

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m044-gate-shapes.json
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-signals-shapes.test.mjs

## Acceptance criteria

1. `research/raw/m044-gate-shapes.json` is re-derived by its own capture command at this head, a
   second armed run changes no byte, and `scripts/gate-integrity.test.mjs` is green — the record it
   measured is the tree it derives, so the reading the answer's artefact paths rest on is this head's
   and not a stale one (SC5).
2. The suite-diff reason table carries a declared row for each suite this milestone added, written
   from the suite's own reading rather than to reach green, and no earlier row is loosened or removed.
3. Nothing else is written: no source file, no other record and no other suite.

## Verify

```bash
node --test scripts/gate-integrity.test.mjs && npx prettier --check research/raw/m044-gate-shapes.json scripts/gate-integrity.test.mjs
```

## Log

- pending.
- Landed paths: `research/raw/m044-gate-shapes.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` — each is read from this tree, ready.
