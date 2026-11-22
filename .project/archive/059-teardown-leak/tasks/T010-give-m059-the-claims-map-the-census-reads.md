---
id: T010
title: Give M059 the claims map the census reads
wave: 10
status: done
deps: []
agent: build_T010
base: 672534edaa4d3e981e82f88553459b6a1986aa09
worktree: null
task_branch: null
files:
  - research/raw/m059-record-shapes.json
  - scripts/tutor-record-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-signals-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/copy-check.test.mjs
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
- Landed paths: `research/raw/m059-record-shapes.json`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`.
- The map is now derived by the record's own armed run rather than typed: `records[]` names the four artefacts the measurement read, `inventory.outsideTheMap` names this milestone's two records with a `why` citing T003 and T004, and `deriveRecords`/`deriveInventory` put those sections into `DERIVED_SECTIONS` so an armed run cannot silently drop them.
- The census reads the milestone from the recording: `research/raw/m059-record-shapes.json` joined `LATER` and `M059` joined `PINNED_OUTSIDE` in both suites. No path is listed in a suite to excuse a record, which is the rule the earlier attempt broke.
- `scripts/tutor-record-shapes.test.mjs` 8 pass / 8 fail -> 16 pass / 0 fail; `scripts/tutor-answer.test.mjs` 12 pass / 2 fail -> 14 pass / 0 fail, still reporting 34 records, 44 claims answered and 22 rendered as no-artefact-named; `scripts/tutor-signals-shapes.test.mjs` 21 pass / 0 fail.
- The record re-armed to 55,603 bytes, sha256 `e5099499…`, and a second armed run wrote nothing.
- Named, not closed: `scripts/gate-integrity.test.mjs` reddens at this head — `suiteDiff.differing[27].addedLines: 2717 -> 2810` and the stale `tutor-signals-shapes` row — because T010 edited suites the gate record counts. The repair is that record's own armed command writing `research/raw/m044-gate-shapes.json`, a file outside this task's `files:`, and it belongs to the task that lands last.
