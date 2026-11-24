# Archive — 066-schema-disabled-hidden

Milestone: schema-disabled-hidden
Shipped: 2026-11-24
Final verdict: all criteria met; project verify passed
Waves: 7  Tasks: 7 done / 7 total  Review cycles used: 1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A field whose disabled state a schema node declares produces a finding that names the state, the node and the input that node read; a mutant that reports the node without the input it read reddens it. | met | extension/schema-attribution.js:1`, `scripts/schema-attribution.test.mjs` (mutant `DECLARED`) |
| A field that is disabled by its own binding, with no schema node to name, reports that absence with its reason rather than naming a node the record does not carry; a mutant that infers a schema attribution reddens it. | met | extension/schema-attribution.js` (the `no-node` branch), `research/raw/m066-schema-record.json |
| The state and the attribution are read from a record this milestone writes, alongside the reading `extension/field-state.js` already performs — one source of the field's own state, asserted in one place. | met | extension/schema-attribution.js` (`FIELD_NAMES`), `scripts/schema-attribution.test.mjs` (write trap) |
| The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer carries no remedy, no cause and no node it was not given. | met | apps/angular-ai-devtools/src/app/panel-schema.ts`, `scripts/panel-routes.test.mjs` (E1/E4) |

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
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- tasks/T001-measure-a-schema-disabled-field-on-the-portal-and-record-wha.md
- tasks/T002-join-the-schema-record-into-four-attribution-states-purely.md
- tasks/T003-render-the-attribution-and-pin-every-enumerating-list.md
- tasks/T004-re-derive-the-recordings-then-run-the-project-verify.md
- tasks/T005-re-measure-the-shape-map-for-the-record-the-rebind-un-excused.md
- tasks/T006-record-the-two-suites-this-milestone-added-and-restate-the-pins.md
- tasks/T007-rebuild-the-panel-and-re-derive-the-stability-record.md

## Notes

- none
