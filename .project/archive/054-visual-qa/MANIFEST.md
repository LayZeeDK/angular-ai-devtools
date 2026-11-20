# Archive — 054-visual-qa

Milestone: visual-qa
Shipped: 2026-11-20
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 4 done / 4 total  Review cycles used: 1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The panel reports, for a named element it renders in its own document, the computed value and the baseline value of each property it measured, naming the property, and labelling which reading is the element's computed measurement and which is the baseline stylesheet's declared value; neither value is inferred where its side could not be read. A mutant that hides a measured property, prints one value for both sides, or labels a stylesheet declaration as the computed reading reddens. | met | .project/build/verify-ledger.jsonl — project verify pass at 6b7cfac307eedd316b3975ab8d82932679d45ed2; .project/build/verify-T001.log; research/raw/m054-style-read.json (Q2, `properties[].name`) |
| An element that cannot be measured is reported as such, naming which absence holds — no such element in the document the reading reached, no document the panel can read, no baseline to compare against — and that state is rendered as its own, distinct from a measured-unchanged answer; a mutant that renders an absence as a row of matching readings, or names a wrong absence, reddens. | met | .project/build/verify-ledger.jsonl — project verify pass at 6b7cfac307eedd316b3975ab8d82932679d45ed2; scripts/visual-qa-style.test.mjs (E4 pin, SC2 suites); research/raw/m054-surface.json:363-582 (the three absences as recorded states) |
| No reading is invented: every computed value the surface renders is one the measurement produced in the document it ran in and every baseline value is one the stylesheet itself declares, and a run that measured nothing renders no property rows. A mutant that renders rows, or placeholder values, for a measurement that did not run reddens. | met | .project/build/verify-ledger.jsonl — project verify pass at 6b7cfac307eedd316b3975ab8d82932679d45ed2; research/raw/m054-style-read.json (the measurement's own values); research/raw/m054-surface.json:583-589 (`notCaptured`) |

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
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- tasks/T001-measure-the-style-read-and-rule-on-the-relay.md
- tasks/T002-join-the-two-readings-pure.md
- tasks/T003-render-the-style-report-and-pin-the-route.md
- tasks/T004-record-the-verdict-capture-the-claims-run-the-project-verify.md

## Notes

- none
