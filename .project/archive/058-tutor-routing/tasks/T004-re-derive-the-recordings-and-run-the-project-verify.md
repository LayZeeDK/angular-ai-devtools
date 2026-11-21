---
id: T004
title: Re-derive the recordings and run the project verify
wave: 7
status: done
deps: [T003, T005, T006, T007, T008]
agent: build_T004
base: 86cec59eb664c51a2e24a579bff77ab272a94624
worktree: null
task_branch: null
files:
  - research/raw/m058-verdict-claims.json
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
head that ships, and the inventories already excuse this milestone's records through the map T001
wrote and the two inventory suites it edited (PLAN D5, R4). This task does not run the project
verify: its capture is one more recording, so the recording census the shapes record states moves
after this task's capture, and the verify must run after that re-derivation — T009 re-derives the
census and runs the project verify last over the head that ships, with nothing re-derived after it.

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
built from. The build and `npm test` are not this task's: the held-out fixture suite this task's
first leg runs rewrites and restores the route file and bumps its mtime, so the artifact is stale
against the tree this task leaves, and the leg that rebuilds it before `npm test` measures it is
T009's — its Verify leads with the extension build, so the artifact `npm test` measures there is
fresh against the tree the verify runs over.

Then this task's Verify ends with the typecheck and the checkout that discards any working-tree
diff of a build artifact. The project verify's remaining legs are not this task's: the
verdict-claims record this task captures is one more recording, so the census the shapes record
states moves after this task's capture, and the verify must run after that re-derivation, not
before it — T009 re-derives the census and runs the project verify last (PLAN wave 8), with nothing
re-derived after it.

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
   landed deliverables and are re-read here, never re-authored, and the project verify is not this
   task's — T009 runs it last, after the census re-derivation this task's capture forces (SC6).
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
node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs scripts/gate-stability-record.test.mjs scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs scripts/panel-routes.test.mjs scripts/copy-check.test.mjs scripts/component-search.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs && npx prettier --check research/raw/m058-verdict-claims.json research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json scripts/gate-integrity.test.mjs && npm run check && git checkout -- extension/panel/index.html
```

## Log

- pending.
- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `research/raw/m058-verdict-claims.json`, `scripts/gate-integrity.test.mjs`.
- Each recording re-derived by its own command and idempotent on a second armed run: the verdict-claims record first write, 29 847 bytes, sha256 `83c56d00…` (26/26); the gate-shapes record 152 763 bytes, sha256 `36061e36…` (41/41); the stability record 6 568 bytes, sha256 `1f899ce7…`, last, because two of its values are a function of this milestone's logs — `plainRun.milestone` M057 -> M058 and the mention count 88 -> 10.
- The reason table needed three rows rather than the two the plan names: `scripts/prove-skills-audited.test.mjs` (T007, landed after that enumeration was written) is a third suite this milestone added, and without its row the gate reddens at `scripts/gate-integrity.test.mjs:4014`. All three rows are read from their own suites; no earlier row loosened, removed or reworded.
- The Verify's nine-suite leg is 147/147 and `npm run check` is clean, including `fix-record` over twelve declared pins; `git checkout -- extension/panel/index.html` discarded nothing.
- A stash from an earlier attempt (`m058-t004-wip`) was inspected and not applied: it predates T007/T008 and does not carry the verdict-claims record, so everything was re-derived at this head instead.
