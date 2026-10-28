# Archive — 008-tooling

Milestone: tooling
Shipped: 2026-10-28
Final verdict: all criteria met; project verify passed
Waves: 1  Tasks: 3 done / 3 total  Review cycles used: 1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| `npm run check` passes. | met | .project/build/verify-ledger.jsonl — a25e8fe8c340d27a116bc42225eee34ae69362cf; .project/review/wave-1.cycle1.md T003; .project/review/final-gap-1.md |
| `npm test` passes. | met | .project/build/verify-ledger.jsonl — a25e8fe8c340d27a116bc42225eee34ae69362cf; .project/review/wave-1.cycle1.md T002 |
| The skills-mirror parity test passes. | met | .project/review/wave-1.cycle1.md T003; .project/review/final-gap-1.md |
| The moved tests run from `~/.commandcode/scripts/`. | met | .project/review/wave-1.cycle1.md T002 (6 pass, 0 fail); scripts/run-user-scope-tests.mjs (resolveScanDir/findTestFiles) |
| `review_panel.py` resolves the `beam`, `glyph`, `laguna` and `glm` families. | met | .project/review/wave-1.cycle1.md T001; C:/Users/LarsGyrupBrinkNielse/.commandcode/scripts/install-gsd-path-command-code.mjs (patchReviewPanel, REVIEW_PANEL_NEW_FAMILIES) |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-capability-map.md
- research/evidence-codebase.md
- research/evidence-domain-decomposition.md
- research/evidence-stack.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- tasks/T001-add-review-panel-family-patch.md
- tasks/T002-package-test-runner-and-glob.md
- tasks/T003-move-install-scripts-and-repair-tsconfig.md

## Notes

- none
