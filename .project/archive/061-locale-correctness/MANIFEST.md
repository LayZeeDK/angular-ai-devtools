# Archive — 061-locale-correctness

Milestone: locale-correctness
Shipped: 2026-11-23
Final verdict: all criteria met; project verify passed
Waves: 7  Tasks: 7 done / 7 total  Review cycles used: 1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the provider entry that carries the token, its kind and its import path, and reports the value as `locale-value-not-recorded`; a mutant that matches the entry by position rather than by token reddens the suite by name. | met | .project/review/wave-1.cycle1.md` … `wave-7.cycle1.md |
| A formatted value the record does not carry reports `cannot-tell` with the reason it is missing, and the answer never reads the rendered text, `navigator.language` or any DOM value as its own evidence; a mutant that renders the page's text to fill the gap reddens it. | met | .project/review/wave-1.cycle1.md` … `wave-7.cycle1.md |
| The finding is produced from the observables the agent already holds — the injector walk's provider entries and the formatter the record names — with no new page-side instrumentation and no second read of the inspected page. | met | .project/review/wave-1.cycle1.md` … `wave-7.cycle1.md |
| The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no identity it was not given. | met | .project/review/wave-1.cycle1.md` … `wave-7.cycle1.md |

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
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- tasks/T001-measure-the-provider-record-and-the-formatter-the-page-carries.md
- tasks/T002-answer-from-the-provider-record-purely.md
- tasks/T003-render-the-answer-and-pin-every-route-table.md
- tasks/T004-write-the-verdict-claims-the-census-derives.md
- tasks/T005-re-derive-this-milestone-s-own-records.md
- tasks/T006-re-derive-the-gate-records-and-run-the-project-verify.md
- tasks/T007-re-derive-the-records-the-gate-capture-moved.md

## Notes

- none
