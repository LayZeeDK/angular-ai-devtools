# Archive — 060-error-routing

Milestone: error-routing
Shipped: 2026-11-22
Final verdict: all criteria met; project verify passed
Waves: 7  Tasks: 7 done / 7 total  Review cycles used: 1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| An error the global listener recorded, with a resolved `ErrorHandler` in force and no boundary entry carrying the same text, produces a finding naming the message, the code where the message carries one, and `handler-in-force`; a mutant that drops the boundary comparison reports `cannot-tell` and reddens the suite by name. | met | .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs |
| An error a boundary entry carries produces `reached-handler` and no finding; a mutant that treats every global error as uncaught reddens it. | met | .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs |
| An error recorded while no `ErrorHandler` resolves reports `no-handler-provided` as a named absence, never a finding and never a handler name; a mutant that names any handler reddens it. | met | .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs |
| The answer states a phase only where the record states one and reports `phase-not-recorded` otherwise; a mutant that derives a phase from the message reddens it. | met | .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs |
| The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener. | met | .project/review/wave-2.cycle1.md, scripts/error-routing.test.mjs |
| The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no handler identity it was not given. | met | .project/review/wave-3.cycle1.md, apps/angular-ai-devtools/src/app/app.spec.ts |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-T005.log
- build/verify-T006.log
- build/verify-T007.log
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
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- tasks/T001-measure-the-two-error-records-and-the-joins-shape.md
- tasks/T002-answer-from-the-two-error-records-purely.md
- tasks/T003-render-the-answer-and-pin-every-route-table.md
- tasks/T004-write-the-verdict-claims-the-census-derives.md
- tasks/T005-re-derive-the-gate-records-and-run-the-project-verify.md
- tasks/T006-pin-the-recorded-head-honestly.md
- tasks/T007-re-derive-the-gate-records-at-the-ship-head.md

## Notes

- none
