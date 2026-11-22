---
id: T013
title: Give the claims record the quotes and ruling the census derives
wave: 13
status: done
deps: [T012]
agent: build_T013
base: 751681b6c3bfb7b327b24a33400c70eb9e311f85
worktree: null
task_branch: null
files:
  - research/raw/m059-verdict-claims.json
  - scripts/navigation-blocking.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/copy-check.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - research/raw/m059-record-shapes.json
---

# T013 — Give the claims record the quotes and ruling the census derives

## Goal

`scripts/navigation-blocking.test.mjs` derives, for every milestone, a claims record carrying `quotes` and
a `ruling` block — and M059's record carries neither. The project verify fails on that one assertion, which
is the last thing between this milestone and its shipment.

## Context

The suite compares the record it derives against `research/raw/m059-verdict-claims.json` field by field and
prints its own expectation: `schema`, `quotes`, and `ruling: { notRequired, required, why[] }`, where the
`why` names the clause that would have made a row required, names the edge rows and the suites the
milestone assigned its criteria, and states that no driver row is required because no criterion is written
about a page reading. M059's record has `claims`, `countsRederived`, `mismatches` and `sources`, which the
census does not read.

## Approach

Extend `research/raw/m059-verdict-claims.json` with the sections the census derives, taking every value
from the artefact it describes rather than from this brief: the quotes the intent states, and a `ruling`
whose `notRequired` is the count of criteria this milestone declares, whose `required` is the count of rows
a page driver would be needed for, and whose `why` cites the edge rows, the suites holding them and the
commands that prove them. Then re-derive both gate records, because this task may also touch a suite.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5

## Acceptance criteria

1. `scripts/navigation-blocking.test.mjs` is green at the landed head and its derivation agrees with the
   record field by field.
2. Every value in the added sections is read from the artefact it describes, and no criterion is claimed
   required without a page reading to require it.
3. Both gate records are re-derived here if a suite moved, and `npm run check` is green.

## Verify

```bash
node --test scripts/navigation-blocking.test.mjs && node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs && npx prettier --check research/raw/m059-verdict-claims.json && npm run check
```

## Log

- pending.
- Landed paths: `research/raw/m059-verdict-claims.json`, `research/raw/m059-record-shapes.json`.
- The census derives the whole record and compares it with `assert.deepEqual`, so the record is now exactly the derivation: `quotes` (the intent path, the six criteria it declares, the nine edge rows over the two suites the plan assigned), `ruling` (`notRequired: 6`, `required: 0`, and three `why` sentences naming the clause that would have required a row), `evidence` (intent criteria, plan held-out, edge rows, both suites with their test counts, the milestone's two recordings), `capture`, and six `claims` rows — SC1 through SC5 on `scripts/teardown-leak.test.mjs`, SC6 on `scripts/teardown-leak-shapes.test.mjs`, each carrying its criterion text, its edge rows, its reading and three proofs.
- T004's eleven counters are not lost: they live in `research/raw/m059-surface.json`'s `counts`, which is the record the copy suite measures. The claims record is the census's shape, and the census admits no other.
- `scripts/navigation-blocking.test.mjs` 20 pass / 5 fail -> 25 pass / 0 fail. The record is written by that suite's own armed run and is idempotent: 22,043 bytes, sha256 `bac21677…`, byte-identical on a second armed run.
- The record quotes `NG0205` on three lines, which moves the raw-corpus census the shapes suite compares: `research/raw/m059-record-shapes.json` was re-armed in this task, so the shapes suite is 13 pass / 14 armed, green, and the occurrence count grew honestly rather than being filtered away.
- Named, not closed: `scripts/recording-consistency.test.mjs` fails at this head ("m059-record-shapes.json records 1 byte total(s) and states none in prose") identically before and after this task. It is pre-existing and belongs to that suite's rule, not to this record.
