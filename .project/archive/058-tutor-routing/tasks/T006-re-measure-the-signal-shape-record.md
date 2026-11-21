---
id: T006
title: Re-measure the signal-shape record
wave: 6
status: done
deps: [T003]
agent: build_T006
base: af0c5016af4dde95da7b4e17da4e8c114836ce2f
worktree: null
task_branch: null
files:
  - research/raw/m057-record-shapes.json
  - scripts/tutor-signals-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/tutor-signals.test.mjs
---

# T006 — Re-measure the signal-shape record

## Goal

The recording the shapes suite holds to the tree states two tree-derived counts, and the tree has
moved both since M057 re-derived them, so the suite is red twice at the base this milestone
recovered to. This task re-derives the recording's counts from the tree at the head the task runs
at — the M057-T009 remedy — and leaves the suite green with no assertion loosened, no expected
count lowered below what the tree measures and nothing skipped.

## Context

`npm test` at the recovery base measures 1858 pass / 6 fail, and two of the six are this suite's:
`scripts/tutor-signals-shapes.test.mjs` is 21 tests / 19 pass / 2 fail. Both failures are the
suite re-deriving its own measurement and finding the recording stale. The authored-file census
under `extension/` measures 59 where the recording states 58 — the join module wave 2 added under
that directory is one more authored file — and the recording census under `research/raw/` measures
144 where the recording states 142 — the two records this milestone's earlier waves landed are two
more recordings, and the directory holds 145 because the recording excludes itself from its own
scan. The recording that carries both counts is `research/raw/m057-record-shapes.json`, and no
M058 task declared it before this repair: it is M057's measurement, and this task owns it as a
re-derivation, not a rewrite. The task owns no acceptance criterion of its own — it repairs the
tree-consistency of a recording earlier waves read — so the plan's `## Intent coverage` table
names no row for it.

## Approach

Correct exactly two values in `research/raw/m057-record-shapes.json`, each re-derived from the
tree by the suite's own scan and nothing else:

- `negativeMeasurements.writeRecord.filesScanned`: 58 → 59 — the count of authored files under
  `extension/` excluding the build output, re-derived by the walk the first negative performs.
- `negativeMeasurements.effectNodeInARecord.jsonFilesScanned`: 142 → 144 — the count of JSON
  recordings under `research/raw/` excluding the recording itself, re-derived by the scan the
  second measurement performs.

Everything else in the recording is measured unchanged at this head and is not written: the
write-record needle matches are the same five `writes:` lines — the added module matches none of
the five needles — and the second measurement's other derived values are unchanged (8
graph-bearing objects, 16 objects carrying `kind: "effect"`, the same six files carrying an effect
node, the same recorded-shape graph set, and the one effect node in the render-phase record's
`freshRead`). Then run the suite at this head: `node --test scripts/tutor-signals-shapes.test.mjs`
green, 21 pass / 0 fail against 19/2 before the repair, with no assertion loosened, no expected
count lowered and nothing skipped. No capture is armed (PLAN D5): the re-derivation is the suite's
own scan, and a second run of the corrected recording changes no byte.

The five suites beside the recording and the shapes suite are the pin closure the record's change
reaches — `scripts/gate-integrity.test.mjs` and its default-tasks sibling, `scripts/tutor-answer.test.mjs`,
`scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-signals.test.mjs` each read the
recording this task re-derives — and they are declared, not edited: PLAN R2's class, the standing
repair being the counting rule rather than a widened task, so none of them is written here and
none is authored work.

Measured limit, recorded rather than repaired here: the recording census is a function of the
record set, so the verdict-claims record the final wave's task writes lands one more recording and
moves the derived count again. The same one-value re-derivation applies at the head the project
verify runs over — the M057-T009 remedy applied where M057 applied it, at the shipping head — and
this task records the dependency so that landing is read as the recorded dependency and not as
drift.

## Interface contract

T001 publishes the record-shapes field map, whose terminal-class key sets, config five fields,
absence names `no-guard-verdict` and `no-redirect-decision`, attribution rule (by `id` and
`route.path`, never by position) and `reach.readFrom` are the only fields T002's join may read,
and whose `inventory.outsideTheMap` names exactly the surface record T003 writes and the
verdict-claims record T004 writes. T002 publishes the join module T002 creates:
`tutorRouting(records)` on `globalThis.angularAiTutorRouting`, `records` = `{ navigation, config }`,
one object out — `{ state, question, terminal, route, absences, unconfigured, claims, detail }`,
every field present in every state, each `claims[]` entry carrying `artefactPath` — which T003's
pane renders and whose route, loader key and state fields the surface record T003 writes states and
T004's claims record re-derives against. T003 publishes the route `tutor-routing` in
`PANEL_SURFACES` through the shared `loadPanelDemo` closure, the `LOADERS` key `'tutor-routing'`,
the exported `tutorRoutingPanel`, the `PANE_SENTENCES` registry and the digest rows in
`extension/copy-digest.json`.

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; the project verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the
built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension
--skip-nx-cache`, never through an edit.

## Intent coverage

- None

## Files

- research/raw/m057-record-shapes.json
- scripts/tutor-signals-shapes.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-signals.test.mjs

## Acceptance criteria

1. The two tree-derived values in `research/raw/m057-record-shapes.json` are the tree's values at
   this head — `negativeMeasurements.writeRecord.filesScanned` reads 59 and
   `negativeMeasurements.effectNodeInARecord.jsonFilesScanned` reads 144 — every other value in
   the recording is unwritten, and the recording passes `npx prettier --check`.
2. `node --test scripts/tutor-signals-shapes.test.mjs` is green at this head — 21 pass / 0 fail —
   with no assertion loosened, no expected count lowered and nothing skipped, and the suite file
   itself is edited not at all.
3. Nothing else moves: no other recording, no product source, and the five declared suites are
   edited not at all, while `npm run check` is green.

## Verify

```bash
node --test scripts/tutor-signals-shapes.test.mjs && npx prettier --check research/raw/m057-record-shapes.json && npm run check
```

## Log

- pending.
- Landed path: `research/raw/m057-record-shapes.json`.
- Two values re-derived from the record's own stated scans, and nothing else written: `negativeMeasurements.writeRecord.filesScanned` 58 -> 59 (the one added authored file is `extension/tutor-routing.js`, T002) and `negativeMeasurements.effectNodeInARecord.jsonFilesScanned` 142 -> 144 (the two added recordings are `m058-record-shapes.json`, T001, and `m058-surface.json`, T003). `scripts/tutor-signals-shapes.test.mjs` is 21/21 at this head, against 19/21 before, with no assertion loosened.
- The record carries no armed capture: its two `command` fields are the scans themselves, and both were reproduced in a scratch script and cross-checked against the suite's own re-derivation, which is the M057-T009 remedy for a measurement-owned record.
- Reported, not written, because no suite asserts it and the contract fixes the change at two values: `negativeMeasurements.writeRecord.filesExcludedAsBuildOutput` records 49 and the tree measures 50, one more panel output than M057's T009 measured, because this head carries T003's rebuilt panel.
- The declared pin closure measures 90 tests / 80 pass / 10 fail, all ten inside `scripts/gate-integrity.test.mjs` and byte-identical with this change stashed, so they are the suite-diff rows T004 owns in wave 7, not this task's.
- Landed paths: `research/raw/m057-record-shapes.json`, `scripts/tutor-signals-shapes.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-signals.test.mjs` — each is read from this tree, ready.
