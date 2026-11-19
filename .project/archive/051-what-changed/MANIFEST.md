# Archive — 051-what-changed

Milestone: what-changed
Shipped: 2026-11-19
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 4 done / 4 total  Review cycles used: 1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Two recorded page snapshots are compared field by field, and the surface names each field that changed with its before and after. | met | .project/build/verify-T004.log — head 465ad7408d9d9fb8edfa5ada3fdcda546d6dade8 |
| A pair that the record cannot establish as the same page is refused with `cannot-tell` naming what is missing, never compared as if it were the same page. | met | .project/build/verify-T004.log — head 465ad7408d9d9fb8edfa5ada3fdcda546d6dade8 |
| A comparison reads only the two snapshots it was given: no file, no clock, no third record. | met | .project/build/verify-T004.log — head 465ad7408d9d9fb8edfa5ada3fdcda546d6dade8 |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- tasks/T001-measure-what-a-recorded-snapshot-carries-and-what-binds-two-.md
- tasks/T002-compare-the-pair-or-refuse-it.md
- tasks/T003-render-the-states-and-pin-the-route.md
- tasks/T004-record-the-surface-and-run-the-project-verify.md

## Notes

- none
