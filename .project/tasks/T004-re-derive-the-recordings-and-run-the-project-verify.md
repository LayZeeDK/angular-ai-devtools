---
id: T004
title: Re-derive the verdict claims and run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m059-verdict-claims.json
  - apps/angular-ai-devtools/src/app/panel-teardown-leak.ts
  - extension/teardown-leak.js
  - research/raw/m059-surface.json
---

# T004 — Re-derive the verdict claims and run the project verify

## Goal

Re-derive every claim this milestone's surface makes against the tree it now sits in, and run the project
verify at the settled head, so that a red build cannot reach the ship gate.

## Context

`research/raw/m059-surface.json` states the surface's route, loader key, states and sentences. The
record-shapes record T001 writes states the record shape the answer reads. A claims record that
re-derives both against the tree is what turns those statements into evidence a reviewer can check
without reading the diff. The project verify's own line is `PLAN.md`'s `Project verify:` line, run
verbatim.

## Approach

Record one claim per surface statement, each carrying `artefactPath` and the value re-derived from the
tree (the route in `app.routes.ts`, the loader key in `panel-demo.ts`, the export in
`panel-teardown-leak.ts`, the join's state names in `extension/teardown-leak.js`). A claim that does not
re-derive is recorded as a mismatch with both values, never rounded. Then run the project verify.

## Interface contract

T001 publishes `research/raw/m059-record-shapes.json`, whose `digest` section names the `NG0205` entry
verbatim with the digest's hash, whose `message` section names the fields a console message carries after
the join, whose `producible` section states whether a post-teardown touch emitted the diagnostic and names
the route tried, and whose `absences` section states the handle record's absence with its counts. T002
publishes `teardownLeak(records)` on `globalThis.angularAiTeardownLeak`, taking `{ console, digest }` and
returning `{ state, code, message, owner, absences, claims, detail }` with every field present in every
state and each `claims[]` entry carrying `artefactPath`. T003 publishes the route `teardown-leak` in
`PANEL_SURFACES`, the `LOADERS` key `'teardown-leak'`, the exported `teardownLeakPanel` and the surface
record `research/raw/m059-surface.json`. T004 publishes `research/raw/m059-verdict-claims.json`, whose
`claims[]` cite those artefacts by `artefactPath` and re-derive each against the tree.

## Intent coverage

- SC5 — AC1: every claim re-derives against the tree, and a claim that does not is a named mismatch.
- SC6 — AC2: the project verify runs at this head and its exit status is recorded.

## Acceptance criteria

1. SC5: every claim in `research/raw/m059-verdict-claims.json` carries `artefactPath` and re-derives to
   the value the tree states; a claim that does not re-derive is recorded as a mismatch with both values.
2. SC6: the project verify's own line from `PLAN.md` runs at this head and its exit status is recorded in
   the Log with the command that produced it.

## Verify

```bash
node --test scripts/teardown-leak.test.mjs scripts/panel-routes.test.mjs && npx prettier --check research/raw/m059-verdict-claims.json && npm run check
```

## Log

- pending.
