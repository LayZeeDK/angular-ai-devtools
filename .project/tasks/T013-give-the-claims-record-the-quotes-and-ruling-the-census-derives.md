---
id: T013
title: Give the claims record the quotes and ruling the census derives
wave: 13
status: pending
deps: [T012]
agent: null
base: null
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
