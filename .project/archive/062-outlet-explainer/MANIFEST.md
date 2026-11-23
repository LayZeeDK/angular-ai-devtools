# Archive — 062-outlet-explainer

Milestone: outlet-explainer
Shipped: 2026-11-23
Final verdict: all criteria met; project verify passed
Waves: 10  Tasks: 10 done / 10 total  Review cycles used: 1/1/1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved. | met | .project/review/wave-1.cycle1.md` … `wave-10.cycle1.md |
| An outlet the router state does not carry reports `cannot-tell` with the reason the name is missing, and the answer never names the nearest outlet in the rendered tree; a mutant that falls back to a DOM-derived name reddens it. | met | .project/review/wave-1.cycle1.md` … `wave-10.cycle1.md |
| The outlet name is read from a record this milestone writes, with no new page-side instrumentation and no second read of the inspected page; the record's shape and the join's inputs are the same list, asserted in one place. | met | .project/review/wave-1.cycle1.md` … `wave-10.cycle1.md |
| The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given. | met | .project/review/wave-1.cycle1.md` … `wave-10.cycle1.md |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-T005.log
- build/verify-T006.log
- build/verify-T007.log
- build/verify-T008.log
- build/verify-T009.log
- build/verify-T010.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/RESEARCH.md
- research/SHIP-BLOCKER.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-10.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- review/wave-9.cycle1.md
- tasks/T001-record-the-outlet-each-route-requests-and-the-name-the-state-matched.md
- tasks/T002-answer-from-the-outlet-record-purely.md
- tasks/T003-render-the-answer-and-pin-every-route-table.md
- tasks/T004-write-the-verdict-claims-the-census-derives.md
- tasks/T005-re-derive-this-milestones-own-records.md
- tasks/T006-re-derive-the-gate-records-and-run-the-project-verify.md
- tasks/T007-re-derive-the-records-the-manifest-line-moved.md
- tasks/T008-re-derive-the-rest-and-run-the-project-verify.md
- tasks/T009-re-capture-the-two-records-the-repair-waves-moved.md
- tasks/T010-add-the-surface-to-the-lazy-route-list-and-run-the-project-verify.md

## Notes

- none
