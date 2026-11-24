# Archive — 064-lazy-chunk-failure

Milestone: lazy-chunk-failure
Shipped: 2026-11-24
Final verdict: all criteria met; project verify passed
Waves: 8  Tasks: 8 done / 8 total  Review cycles used: 1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A stubbed import failure produces a finding naming the import specifier, the owning route path and the response status; a mutant that resolves the import turns it off, and the red names the field that moved. | met | .project/review/wave-1.cycle1.md`, `wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md |
| A request that never completed reports `cannot-tell` with its reason, and the answer never names a version drift, a cause or a remedy it did not measure; a mutant that infers a drift from a status reddens it. | met | .project/review/wave-2.cycle1.md`, `wave-4.cycle1.md`, `wave-5.cycle1.md |
| The failure is read from a record this milestone writes, with no new page-side instrumentation and no second read of the network; the record's fields and the join's inputs are the same list, asserted in one place. | met | .project/review/wave-1.cycle1.md |
| The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given. | met | .project/review/wave-3.cycle1.md`, `wave-4.cycle1.md`, `wave-8.cycle1.md |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-T005.log
- build/verify-T006.log
- build/verify-T007.log
- build/verify-T008.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/final-gap-2.md
- review/patch-findings-applied.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- tasks/T001-record-the-import-failures-the-router-produces.md
- tasks/T002-join-the-record-into-four-states-purely.md
- tasks/T003-render-the-answer-and-pin-every-route-table.md
- tasks/T004-write-the-verdict-claims-the-census-derives.md
- tasks/T005-measure-the-failure-on-the-portal-and-record-what-it-showed.md
- tasks/T006-re-derive-the-navigation-and-teardown-recordings.md
- tasks/T007-re-derive-the-style-read-and-webmcp-recordings.md
- tasks/T008-re-derive-the-gate-record-then-run-the-project-verify.md

## Notes

- none
