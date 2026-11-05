# Archive — 031-cross-field-validation

Milestone: cross-field-validation
Shipped: 2026-11-05
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 6 done / 6 total  Review cycles used: 1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a form with two validatable fields and a cross-field rule produces a FRM-1 finding naming each field's validity, the field's own errors, and whether submit is disabled. | met | research/raw/m031-field-state.json`; `extension/field-state.js`; T001 `7948945`, T002 `bb8688a |
| The field state is read through the page agent's existing `window.ng` surface, with no second instrumentation path and no patch of the form. | met | extension/field-state.js`; T002 `bb8688a |
| A form whose fields are all individually valid while submit stays disabled reports the form's own cross-field error kind when it carries one, and produces a "cannot tell" state when it carries none — never a rule the finding invents. | met | scripts/field-state.test.mjs`; the gap panel's lens 2 |
| The panel renders the field set, each field's state and the submit state from a short fact list, and shows the "cannot tell" state. | met | apps/angular-ai-devtools/src/app/panel-fields.ts`; T003 `a3f707a`, T005 `b57eede |
| `npm run check` and `npm test` pass at the head. | met | the gap panel's lens 1; `prepare-final` exit 0 in 6m55s |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/m031-forms-evidence.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- tasks/T001-give-the-fixture-a-form-and-record-what-its-field-state-exposes.md
- tasks/T002-read-the-field-states-and-name-the-absence.md
- tasks/T003-render-the-field-set-and-the-absent-rule-on-the-panel.md
- tasks/T004-rerecord-what-the-form-invalidated.md
- tasks/T005-guard-the-indexed-field-the-panel-typecheck-rejects.md
- tasks/T006-record-the-bundle-shape-not-hashes-that-move-with-the-output-path.md

## Notes

- none
