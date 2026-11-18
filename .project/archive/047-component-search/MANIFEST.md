# Archive — 047-component-search

Milestone: component-search
Shipped: 2026-11-18
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 4 done / 4 total  Review cycles used: 1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Filtering matches the names the record carries; a mutant that matches a name the record lacks reddens it. | met | extension/component-search.js` · `scripts/component-search.test.mjs |
| An unreadable tree reports cannot-tell naming the absence, never an empty list. | met | extension/component-search.js:48-54` · `apps/angular-ai-devtools/src/app/panel-components.ts:122 |
| A subject that does not match this milestone's premise reports "cannot tell" rather than naming a wrong cause. | met | research/raw/m047-names-and-absences.json |

## Contents

- build/evidence.json
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
- tasks/T001-measure-what-the-page-agent-can-name-and-where-it-can-name-nothing.md
- tasks/T002-filter-the-names-the-record-carries-and-state-every-absence.md
- tasks/T003-render-the-four-states-and-pin-the-route-loader-and-route-tables-they-add.md
- tasks/T004-record-the-surface-and-run-the-project-verify.md

## Notes

- none
