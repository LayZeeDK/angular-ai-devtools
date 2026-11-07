# Archive — 035-onpush-readiness

Milestone: onpush-readiness
Shipped: 2026-11-07
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 7 done / 7 total  Review cycles used: 1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a component that explicitly declares eager change detection produces a finding naming the component, the strategy it runs under, and each readiness fact the page can supply, and naming no blocker. | met | extension/onpush-readiness.js:58-75`; `apps/angular-ai-devtools/src/app/panel-onpush.ts:214-271`; |
| The finding is produced from observables the agent already collects — component metadata through the `ng` hooks — with no new page-side instrumentation, no build-log scraping and no dev-server dependency. | met | research/raw/m035-onpush-metadata.json`; `extension/onpush-readiness.js:1-40`; |
| Where a readiness verdict would require mutation evidence the page does not carry, the module reports "cannot tell" with that reason rather than naming a blocker. | met | extension/onpush-readiness.js:58-69`; `research/raw/m035-onpush-metadata.json`; |
| The panel renders the component, the strategy and the readiness facts from a short fact list, and shows the "cannot tell" state, inventing neither a blocker nor a verdict. | met | apps/angular-ai-devtools/src/app/panel-onpush.ts:155-271`; `apps/angular-ai-devtools/src/app/panel-demo.ts:100`; |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl`; `.project/review/wave-5.cycle1.md`; |

## Contents

- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-domain.md
- research/evidence-pitfalls.md
- research/evidence-similar.md
- research/evidence-stack.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-the-metadata.md
- tasks/T002-join-the-strategy.md
- tasks/T003-panel-surface-for-the-readiness-finding.md
- tasks/T004-re-record-everything-the-fixture-change-stales.md
- tasks/T005-correct-the-verified-findings.md
- tasks/T006-make-the-gate-measure-instead-of-remember.md
- tasks/T007-restore-the-unit-test-cache.md

## Notes

- none
