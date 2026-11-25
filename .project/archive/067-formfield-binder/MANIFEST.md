# Archive — 067-formfield-binder

Milestone: formfield-binder
Shipped: 2026-11-25
Final verdict: all criteria met; project verify passed
Waves: 10  Tasks: 10 done / 10 total  Review cycles used: 1/1/1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A field that hosts a control different from the one its record expects produces a finding naming both the hosted control and the expected one; a mutant that reports only the hosted control reddens it. | met | extension/field-binder.js`, `scripts/field-binder.test.mjs` (mutant `onlyHosted`) |
| A field that is not a components field at all — a plain input, or an element with no hosting field — reports that absence with its reason rather than naming a control it was not given; a mutant that infers a host reddens it. | met | extension/field-binder.js` (the `no-host` branch), `scripts/field-binder.test.mjs` (mutant `inferHost`) |
| The hosted control and the field identity are read from a record this milestone writes, and the field identity is the one `extension/field-state.js` already uses, asserted in one place rather than derived twice. | met | scripts/field-binder-record.test.mjs`, `research/raw/m067-field-binder.json |
| The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no control it was not given. | met | apps/angular-ai-devtools/src/app/panel-field-binder.ts`, `scripts/panel-routes.test.mjs |

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
- plan/build-recovery-aad8545a77a8467bf7e727b2544cd0249da6e33d/review/VERIFICATION.json
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
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
- tasks/T001-isolate-the-missing-reason-row-so-one-assertion-fails-instea.md
- tasks/T002-derive-the-claims-capture-through-the-pin-its-reader-holds.md
- tasks/T003-name-every-recording-and-refuse-a-census-capture-taken-befor.md
- tasks/T004-measure-what-a-form-field-hosts-on-the-portal.md
- tasks/T005-join-the-hosted-control-against-the-control-the-record-exp.md
- tasks/T006-render-the-join-on-one-panel-surface-and-move-every-pin-wi.md
- tasks/T007-re-derive-the-recordings-and-run-the-project-verify.md
- tasks/T008-capture-the-milestone-verdict-claims.md
- tasks/T009-measure-the-records-the-maps-never-counted.md
- tasks/T010-give-the-shape-map-an-armed-capture.md

## Notes

- none
