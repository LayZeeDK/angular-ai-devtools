---
id: T005
title: Re-measure the shape map for the record the rebind un-excused
wave: 5
status: done
deps: []
agent: build_T005
base: 7acdfbfc06808530d187f88f8b7ac72265eeb6bd
worktree: null
task_branch: null
files:
- research/raw/m055-record-shapes.json
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/navigation-blocking.test.mjs
---

# T005 — Re-measure the shape map for the record the rebind un-excused

## Context

The M044 census excuses exactly one verdict-claims record: the bound branch's, derived from
`research/raw/${milestone}-verdict-claims.json` at `scripts/navigation-blocking.test.mjs:2460`. Binding M066 moved that
excuse onto `m066-verdict-claims.json`, which left `m065-verdict-claims.json` present and named by no map. The M055 shape
map is the catch-all that must then re-measure it, and it has no capture command: its `capture` is `null` and it was
authored by hand with `path:line` citations, so measuring it means deriving every citation and count from the tree.

## Approach

Re-measure `research/raw/m055-record-shapes.json` from the tree rather than typing numbers: every citation found by
search and region-checked, every count re-derived by the suite's own logic, and the writer refuses to write if the shared
prose stops being one template, if an artefact path does not resolve, or if the derived inventory disagrees with the
suite's census. Then restate the two pins that encode the same measurement: `scripts/tutor-record-shapes.test.mjs:1687`
(the pinned `['verdict-claims', 34]`) and `scripts/tutor-answer.test.mjs:1385-1394` (the `selfHeld` list, whose fourth
entry is the bound branch's record).

## Intent coverage

- SC2, SC3

## Acceptance criteria

1. `scripts/tutor-record-shapes.test.mjs` reports 16 pass and 0 fail, up from 8 pass and 8 fail, and no assertion in it was weakened, skipped or retuned.
2. `scripts/tutor-answer.test.mjs` reports 15 pass and 0 fail, up from 13 pass and 2 fail, with the `selfHeld` pin still holding exactly four entries and exactly one of them derived from the template census.
3. The record states the head it was re-measured at and why: the m065 entry is measured because the rebind un-excused it, not because a count was retuned to match.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m055-record-shapes.json`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- \scripts/chunk-failure-claims.test.mjs\n
- \scripts/gate-integrity.test.mjs\n
- \scripts/guard-record-shapes.test.mjs\n
- \scripts/guard-verdict-claims.test.mjs\n
- \scripts/outlet-record-shapes.test.mjs\n
- \scripts/gate-integrity-default-tasks.test.mjs\n
- \scripts/outlet-verdict-claims.test.mjs\n
- \scripts/teardown-leak-shapes.test.mjs\n
- \scripts/navigation-blocking.test.mjs\n
## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/schema-attribution.js — the only reader of a schema attribution
export function schemaAttribution(record, facts) {
  return { state, field, node, input, reason, observed }
}
```

`state` is one of `declared`, `no-node`, `no-record`, `cannot-tell`. `node` and `input` are present only when the record
carries them; `reason` names why the attribution is absent.

## Verify

```bash
node --test scripts/tutor-record-shapes.test.mjs && node --test scripts/tutor-answer.test.mjs
```

## Log

- pending

- Re-measured `research/raw/m055-record-shapes.json` from the tree rather than typing numbers: the derivation read every
  citation it records and re-derived every count, and it refuses to write when the tree disagrees with what it would
  record. It wrote `inventory.vc=35 surface=9 records=44 rows=48`, `sharedProse 38->42 rows over 12 records`, and the
  artefact-path and ruling counts that follow from the new record.
- `scripts/tutor-record-shapes.test.mjs` reports 16 pass, 0 fail, up from 8 pass and 8 fail; `scripts/tutor-answer.test.mjs`
  reports 15 pass, 0 fail, up from 13 pass and 2 fail. No assertion was weakened, skipped or retuned: the two pins that
  encode the measurement now state the value the tree yields — `['verdict-claims', 35]` and a `selfHeld` list whose fourth
  entry is the bound branch's record.
- The reason is recorded in the map itself: `m065-verdict-claims.json` is measured because binding M066 moved the M044
  census's single excuse onto `m066-verdict-claims.json`, which left m065 present and named by no map. The same drift will
  recur at the next rebind.
- Landed paths: `research/raw/m055-record-shapes.json`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs` — each is read from this tree, ready.
