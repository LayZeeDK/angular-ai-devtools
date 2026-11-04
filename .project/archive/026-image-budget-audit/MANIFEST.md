# Archive — 026-image-budget-audit

Milestone: image-budget-audit
Shipped: 2026-11-04
Final verdict: all criteria met; project verify passed
Waves: 6  Tasks: 8 done / 8 total  Review cycles used: 1/1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The offline digest carries exactly one entry for each of the eighteen image codes the installed Angular declares — the seventeen in `RuntimeErrorCode`'s image block (`NG2950`–`NG2967`, with no `NG2957`) plus `NG0913` from core — and no entry for a code outside that set. | met | .project/review/wave-1.cycle1.md`, `wave-4.cycle1.md |
| Every digest entry is at most 150 tokens, and the digest is generated at extension build time rather than hand-written at runtime. | met | .project/review/wave-1.cycle1.md |
| A fixture page uses `NgOptimizedImage` in a way that provokes a real runtime warning, and COM-1 names the image, the code and the binding that produced the offending attribute. | met | .project/review/wave-2.cycle1.md`, `final-gap-2.md |
| The licence and copyright notice is stripped from every entry before any digest text reaches a prompt. | met | .project/review/wave-1.cycle1.md |
| The panel renders the finding and its explanation from a short fact list with no tool calling outside the registry envelope, and `npm run check` and `npm test` pass at the head while the initial bundle stays inside the recorded baseline of 535.44 kB (520 kB is the build's warning threshold, not the enforced bound — the panel already sat above it before this milestone). | met | .project/review/wave-3.cycle1.md`, `final-gap-2.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-image-codes.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- tasks/T001-the-digest-carries-thirteen-measured-image-codes.md
- tasks/T002-no-licence-text-reaches-a-prompt.md
- tasks/T003-the-fixture-provokes-a-real-image-warning.md
- tasks/T004-the-panel-explains-the-finding-from-a-fact-list.md
- tasks/T005-the-bundle-stays-inside-its-budget.md
- tasks/T006-the-digest-carries-all-eighteen-image-codes.md
- tasks/T007-re-record-the-proofs-the-fixture-change-invalidated.md
- tasks/T008-re-pin-the-panel-route-list-the-image-budget-surface-extends.md

## Notes

- none
