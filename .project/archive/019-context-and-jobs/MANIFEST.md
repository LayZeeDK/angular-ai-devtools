# Archive — 019-context-and-jobs

Milestone: context-and-jobs
Shipped: 2026-11-02
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 8 done / 8 total  Review cycles used: 1/1/1
Carried forward: 22 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A 200-message ring buffer survives a navigation, and its oldest entry is still readable after it. | met | apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts:200-240; .project/review/wave-3.cycle1.md |
| A chunked job reports progress and cancels, and a cancelled job leaves no partial fact list behind. | met | apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts:156-205; apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts:225-258; .project/review/wave-3.cycle1.md |
| One fresh clone per prompt is measured, with the measurement committed. | met | apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts:191-242; research/raw/clone-measurement-m019.json; .project/intent/INTENT.md (## Corrections, SC3 clone target) |
| A fact list that exceeds the cap is chunked rather than silently truncated, and the chunk count the panel sees is truthful. | met | apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts:262-296; .project/review/wave-3.cycle1.md |
| `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget. | met | .project/build/verify-ledger.jsonl; scripts/panel-bundle-budget.test.mjs; .project/review/wave-3.cycle1.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-ab331f554a6af39c224f0ba50f564e0e9ff74f1c/review/wave-1.cycle1.md
- plan/build-recovery-ab331f554a6af39c224f0ba50f564e0e9ff74f1c/review/wave-2.cycle1.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-pitfalls.md
- research/evidence-spike-limits.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/final-gap-4.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- tasks/T001-context-budget-constants-and-chunking.md
- tasks/T002-ring-buffer-page-key-scoping.md
- tasks/T003-worker-read-path.md
- tasks/T004-job-handles-progress-cancellation.md
- tasks/T005-summarizer-cannot-tell.md
- tasks/T006-clone-measurement-artifact.md
- tasks/T007-held-out-edge-verification-and-gates.md
- tasks/T008-sc5-gates-bundle-budget.md

## Notes

- none
