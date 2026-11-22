---
id: T010
title: Give M059 the claims map the census reads
wave: 10
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m059-record-shapes.json
  - scripts/tutor-record-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-signals-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T010 — Give M059 the claims map the census reads

## Goal

M059 writes two records and no claims map, so every census that reads the records under `research/raw/`
reddens: `scripts/tutor-record-shapes.test.mjs` reports eight failures and `scripts/tutor-answer.test.mjs`
two, all from the same subtraction. This task gives M059 the map the census reads, and nothing else.

## Context

The census reads `LATER` — the maps of every milestone after M055 — and subtracts what each map names
outside itself, with the rule that a map may excuse its own two records and never another milestone's
(`scripts/tutor-record-shapes.test.mjs:72-105`). `m058-record-shapes.json` is the working template: it
carries `milestone`, `schema`, `records[]` (each `{ path, carries }`), `inventory.outsideTheMap[]` (each
`{ path, why }`, with a `why` that must name `T004`) and its measurement sections. M059's
`m059-record-shapes.json` carries only measurements, so `M059` appears in neither list and its two records
are unexcusable.

This was ruled and recorded rather than patched: listing M059's paths inside the suite is refused by the
suite's own assertion — "the subtraction is M055's map's own two plus whatever each later map names
outside itself, read from the recordings rather than listed here".

## Approach

Extend `research/raw/m059-record-shapes.json` with the map sections M058's record shows — `milestone`,
`records[]` naming the artefacts this milestone actually measured, `inventory.outsideTheMap` naming
`research/raw/m059-surface.json` and `research/raw/m059-verdict-claims.json` with a `why` citing T003 and
T004 — keeping every measurement section it already carries and re-arming it with its own command. Then add
`research/raw/m059-record-shapes.json` to `LATER` and `M059` to `PINNED_OUTSIDE` in
`scripts/tutor-record-shapes.test.mjs`, and let `scripts/tutor-answer.test.mjs`'s census read the same
subtraction.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5

## Acceptance criteria

1. `m059-record-shapes.json` carries the map sections M058's record shows, every `why` citing the task that
   produced the record it names, and every measurement section it already carried is unchanged.
2. `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs` are green at the landed head,
   and the subtraction is still read from the recordings rather than listed in the suite.
3. No assertion is loosened and no count lowered; the record re-arms idempotently.

## Verify

```bash
node --test scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs scripts/tutor-signals-shapes.test.mjs && npx prettier --check research/raw/m059-record-shapes.json scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs && npm run check
```

## Log

- pending.
