---
id: T004
title: Re-derive the recordings and run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m058-verdict-claims.json
  - research/raw/m048-surface.json
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - extension/panel/index.html
---

# T004 — Re-derive the recordings and run the project verify

## Goal

Every machine-derived record this milestone's suites move is re-derived with its own command at the
head that ships, the inventories already excuse this milestone's records through the map T001 wrote
and the two inventory suites it edited, and the project verify runs last with nothing re-derived
after it (PLAN D5, R4).

## Context

The surface ships in wave 3, and its records are already landed: the surface record, the copy
record, the digest and the two inventory-suite edits are T003's and T001's deliverables, and this
task re-reads them rather than re-authors them. What this task owns is the machine-derived half:
the milestone's verdict-claims record, which the claims machinery derives from the live intent; the
gate's oracle record, whose suite census, reference table and suite diff are derived from this
tree and so were moved by the suites and records the earlier waves added; and the stability record,
whose derived mention count is a function of this milestone's own task logs (M057 C9's finding), so
it is re-derived after the last Log byte and before the project verify.

## Approach

Re-derive the recordings this change moved, each by its own stated command and no other, a second
armed run of each changing no byte (PLAN D5):

- `research/raw/m058-verdict-claims.json` via
  `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"`
  — the command the record itself states.
- `research/raw/m044-gate-shapes.json` via its own armed capture
  (`set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`).
- `research/raw/m056-gate-stability.json` via
  `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs` — **last**, after
  this milestone's last byte of prose, because one value it derives is a function of this
  milestone's own task logs (PLAN R4).

Edit `scripts/gate-integrity.test.mjs` only where its own derived sections demand it: the
suite-diff reason table gains one declared row per suite this milestone added — the record suite
T001 writes and the join's suite T002 writes — written from the suite's own reading rather than to
reach green, appended after the last line the M044 recording pins. Declare
`scripts/gate-integrity-default-tasks.test.mjs` and edit it not at all, and declare
`scripts/gate-stability-record.test.mjs`, the suite whose record this task re-derives. The two
inventory suites are declared here as readers of the map and the records this milestone already
landed — `research/raw/m058-verdict-claims.json` above, and the surface record T003 wrote — and are
run green at this head with no assertion loosened, no count lowered, nothing skipped.

This task also runs the direct-suite leg T003 left to it — the two route-file suites T003 edits,
the copy suite and the two literal pins that read the route file — in the same `node --test` leg,
so the route T003 landed and the copy it re-measured are proven green at the head this wave leaves
(the M057 C6 pattern). The artifact is freshly landed by T003 and this task edits no source it is
built from, so the builds stay in the Config project verify at ship and `npm test`'s own budget leg
re-proves the artifact fresh here.

The copy suite is red at the base this task starts from, and this task owns the record that makes it
red: `research/raw/m048-surface.json` quotes the copy-check fact and its comment at their pre-M058
lines, so its four recorded values still say `checked: 201` where the fact now says `206`. Correct
those four values in that record — `sampleFact.lineText` and `.holds`, and the two fields of
`sampleFactComment` — from the lines the file carries at this head, re-reading nothing else in it,
and run `scripts/copy-check.test.mjs` green with no assertion loosened. The record is declared for
this purpose alone, and the two records already unresolved at this base (their own milestones') are
not touched here.

Then run the project verify's remaining legs as the last action and re-derive nothing after it:
`npm run check`, `npm test`, and the checkout that discards any working-tree diff of a build
artifact.

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

- SC5
- SC6

## Files

- research/raw/m058-verdict-claims.json
- research/raw/m044-gate-shapes.json
- research/raw/m056-gate-stability.json
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/gate-stability-record.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- extension/panel/index.html

## Acceptance criteria

1. The records the change re-derived are re-derived by their own commands and no other —
   `research/raw/m058-verdict-claims.json` and `research/raw/m044-gate-shapes.json` behind
   `M044_CAPTURE=1`, `research/raw/m056-gate-stability.json` behind `M056_CAPTURE=1` last after
   this milestone's last Log byte — a second armed run of each changes no byte, and the readings
   the answer's artefact paths rest on are this head's and not a stale one (SC5).
2. No page read and no capture beyond what the records state happens anywhere in this task: the
   surface record, the copy record, the digest and the inventory-suite edits are T003's and T001's
   landed deliverables and are re-read here, never re-authored, and the project verify is the last
   action with nothing re-derived after it (SC6).
3. `scripts/gate-integrity.test.mjs` is green at this head with a declared suite-diff reason row for
   each suite this milestone added, written from the suite's own reading, and no earlier row
   loosened, removed or reworded.
4. The two inventory suites are green at this head reading the map beside the earlier maps, the
   direct-suite leg T003 left is green here — `scripts/panel-routes.test.mjs`,
   `scripts/copy-check.test.mjs`, `scripts/component-search.test.mjs` and
   `tests/held-out/fixture-explainers-unchanged.test.mjs` — and nothing else is written: no source
   file, no other record, no other suite.

## Verify

```bash
node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs scripts/gate-stability-record.test.mjs scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs scripts/panel-routes.test.mjs scripts/copy-check.test.mjs scripts/component-search.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs && npx prettier --check research/raw/m058-verdict-claims.json research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json scripts/gate-integrity.test.mjs && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- pending.
