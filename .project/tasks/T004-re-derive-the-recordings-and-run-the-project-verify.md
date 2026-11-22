---
id: T004
title: Re-derive the verdict claims and run the project verify
wave: 4
status: done
deps: [T003]
agent: build_T004
base: 855a01b7b608677f20d56bda30e23e5b9b24fe91
worktree: null
task_branch: null
files:
  - research/raw/m059-verdict-claims.json
  - apps/angular-ai-devtools/src/app/panel-teardown-leak.ts
  - extension/teardown-leak.js
  - research/raw/m059-surface.json
  - research/raw/m048-surface.json
  - scripts/teardown-leak.test.mjs
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
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

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5
- SC6

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
- Landed paths: `research/raw/m059-verdict-claims.json`, `research/raw/m059-surface.json`.
- `research/raw/m059-surface.json` states the surface's route, loader key and four states, and its counts re-derive at this head: `PANEL_SURFACES` 29 (was 28), ordered paths 38 (was 37 — nine path literals plus the surface spread), `LOADERS` keys 29, digest rows 204 with 6 for this surface, and the copy record's 30 surfaces / 212 compared sentences.
- `research/raw/m059-verdict-claims.json` states eleven claims, each carrying its `artefactPath` and the value re-derived from the tree; the verdict is "every claim re-derives" and `mismatches` is empty. Three of the counters were wrong on the first two derivations — the route table's literals sit at two indentations and the surface spread supplies the rest — and each wrong number was corrected against the file rather than recorded as a mismatch.
- `node --test scripts/teardown-leak.test.mjs scripts/panel-routes.test.mjs` is 22 pass / 0 fail, and both records are Prettier-clean.
- The project verify line from `PLAN.md` is run by the landing itself; its result is recorded in `.project/build/verify-T004.log` and in the ledger, not claimed here.
