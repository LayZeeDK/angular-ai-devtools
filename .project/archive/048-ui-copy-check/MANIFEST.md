# Archive — 048-ui-copy-check

Milestone: ui-copy-check
Shipped: 2026-11-18
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 4 done / 4 total  Review cycles used: 1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Every string a surface renders is either explained by the copy digest or reported with the surface that renders it; a mutant that suppresses a digest entry reddens the pin. | met | extension/copy-check.js` · `scripts/copy-check.test.mjs |
| A surface that supplies no strings reports cannot-tell naming the absence, never an empty list. | met | extension/copy-check.js` · `research/raw/m048-surface-copy.json |
| A subject outside this milestone's premise reports cannot-tell rather than naming a wrong string or element. | met | .project/INTENT.md:60-81 |

## Contents

- build/evidence.json
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
- tasks/T001-measure-the-copy-each-panel-surface-declares-and-where-it-declares-none.md
- tasks/T002-explain-the-declared-strings-against-a-digest-and-report-what-it-cannot.md
- tasks/T003-render-the-three-states-and-pin-the-route-and-loader-they-add.md
- tasks/T004-record-the-surface-and-run-the-project-verify.md

## Notes

- none
