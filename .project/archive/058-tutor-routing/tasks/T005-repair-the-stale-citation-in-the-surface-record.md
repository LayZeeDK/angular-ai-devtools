---
id: T005
title: Repair the stale citation in the surface record
wave: 4
status: done
deps: [T003]
agent: build_T005
base: 1fa50cd5b6c24f4e9eb613bc3bc3c8f21776a1c6
worktree: null
task_branch: null
files:
  - research/raw/m048-surface.json
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T005 — Repair the stale citation in the surface record

## Goal

The copy-check fact `apps/angular-ai-devtools/src/app/panel-demo.ts` carries at this head reads
`checked: 206`, and `research/raw/m048-surface.json` still quotes that line and the comment above it
at their pre-M058 text, so the citation the record holds no longer resolves and
`scripts/copy-check.test.mjs` re-reads it. This task corrects the record's four quoted values from
the lines the file carries at this head, writes nothing else in the record, and runs the copy suite
green with no assertion loosened and no count lowered.

## Context

`research/raw/m048-surface.json` is M048's surface record, and its `copy-check` entry quotes the demo
fact and the comment above it as `path:line` citations, each carrying the cited line's own text.
T003 moved the fact's count when it re-measured the copy record and authored the pane's digest rows,
so the citation no longer matches the file: the fact at `:450` says `checked: 206` where the record
quotes `checked: 201`, and the count-bearing comment at `:444` says `all 206 compared strings` where
the record quotes 201. `scripts/copy-check.test.mjs` re-reads those citations, so the suite is red at
the base this task starts from (29 pass, 1 fail) and green once the four values are this head's.

The record is outside every earlier task's `files:`, and T004 cannot carry the repair: it already
owns three recordings plus its own Log, and the authored ceiling is four (PLAN Wave 4). So the repair is
its own task in the wave before the project verify, and this task authors no second record, no
product source and no suite. It therefore owns no acceptance criterion and claims none: the plan's
`## Intent coverage` table names no row for it, and the criteria whose records it corrects stay with
the tasks that state them.

## Approach

Correct exactly four values in `research/raw/m048-surface.json`, each from the line
`apps/angular-ai-devtools/src/app/panel-demo.ts` carries at this head:

- `sampleFact.lineText` — the fact line at `:450`, which reads
  `'copy-check': { state: 'clean', unexplained: [], checked: 206 },`, in place of the `checked: 201`
  text the record quotes — and `sampleFact.holds`, which becomes `checked: 206`.
- `sampleFactComment`'s count-bearing entry, the second one, at `:444` — its `lineText`, the comment
  whose own parenthesis reads `all 206 compared strings are explained, so the record reads`, in place
  of the `all 201 compared strings` text the record quotes, and its `holds`, which becomes `206`.
  The first entry at `:442` states no count and does not move.

Write nothing else in the record: no line number, no other entry, no other key. The line numbers the
record already carries are this head's — `:450` and `:444` moved nothing — so the repair is the four
quoted strings and nothing beside them. Measured and left alone: the record's `statement` prose also
quotes the pre-M058 count. `scripts/copy-check.test.mjs` reads the four cited values and not that
prose, and this task writes nothing else in the record, so the sentence stays as M048 wrote it and is
recorded here rather than silently reworded.

Then run the copy suite at this head: `node --test scripts/copy-check.test.mjs` green, 30 pass, 0
fail, with no assertion loosened, no count lowered and nothing skipped. No other suite is run here,
no page is opened and no capture is armed — the repair is four citations in one record (PLAN D5).

The copy suite is declared with the record because it pins it: `scripts/copy-check.test.mjs` reads
those four citations, so a record the task changes is a record that moves what the suite asserts.
The pin closure then reaches two more suites and stops: `scripts/gate-integrity.test.mjs` names
`scripts/copy-check.test.mjs` in its reason table, and `scripts/gate-integrity-default-tasks.test.mjs`
names `scripts/gate-integrity.test.mjs`. All three are PLAN R2's class — declared, not edited — so
none of them is written here and none is authored work: the record moves, the suites hold it still,
and the repair is measured by the suite the repair turns green.

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

- research/raw/m048-surface.json
- scripts/copy-check.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. The four quoted values in `research/raw/m048-surface.json` are the lines
   `apps/angular-ai-devtools/src/app/panel-demo.ts` carries at this head: `sampleFact.lineText` and
   `sampleFact.holds` read `checked: 206`, the `sampleFactComment` entry at `:444` reads the same
   count in its text and in its `holds`, and every other value in the record is unwritten.
2. `node --test scripts/copy-check.test.mjs` is green at this head — 30 pass, 0 fail — with no
   assertion loosened, no count lowered and nothing skipped.
3. Nothing but the record moves: the three suites its pin closure reaches —
   `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs` and
   `scripts/gate-integrity-default-tasks.test.mjs` — are declared and edited not at all, and no
   product source, no other suite, no other record and no `extension/panel/index.html` byte changes,
   while the record passes `npx prettier --check` and `npm run check` is green.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npx prettier --check research/raw/m048-surface.json && npm run check
```

## Log

- pending.
- Landed path: `research/raw/m048-surface.json`.
- Four values corrected, each from the line `apps/angular-ai-devtools/src/app/panel-demo.ts` carries at this head: `loader.sampleFact.lineText` and `.holds` (`checked: 201` -> `206`, quoting `:450`), `loader.sampleFactComment[1].lineText` and `.holds` (`201` -> `206`, quoting `:444`). `node --test scripts/copy-check.test.mjs` is 30/30 at this head, against 30/29/1 before the repair, with no assertion loosened and no count lowered.
- Limit recorded, not repaired: the record's own prose still states the old counts — `loader.statement` quotes `checked: 201` and calls this the twenty-eight-surface record with a 193-row digest, `states[0].statement` and `notCaptured[1]` still say 195, `verdict` still says 122, and `head` still names M048's commit. The suite reads none of those, and this task's contract is the four cited values; rewriting prose it does not read would widen the repair beyond what the plan approved.
- Landed paths: `research/raw/m048-surface.json`, `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` — each is read from this tree, ready.
