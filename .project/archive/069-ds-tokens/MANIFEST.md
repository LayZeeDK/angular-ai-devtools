# Archive — 069-ds-tokens

Milestone: ds-tokens
Shipped: 2026-11-25
Final verdict: all criteria met; project verify passed
Waves: 8  Tasks: 8 done / 8 total  Review cycles used: 1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| One token block declares the density, colour, type and motion properties, and every value the panel renders resolves through it rather than from a literal at the point of use; a mutant that drops a token reddens naming the property. | met | apps/angular-ai-devtools/src/styles.css`, `scripts/ds-tokens.test.mjs`, `scripts/token-baseline.test.mjs`, `research/raw/m069-token-baseline.json |
| Every token is present under both motion preferences, with the reduced-motion block asserted as a block; a mutant that removes that block reddens naming it. | met | apps/angular-ai-devtools/src/styles.css` (the reduced-motion block), `scripts/token-baseline.test.mjs` (the two motion mutants) |
| No colour, spacing, type or duration literal remains outside the token block, and `scripts/panel-styles.test.mjs` passes **unmodified** — proving the token layer re-expressed the rendered values instead of retuning the assertions. | met | scripts/ds-tokens.test.mjs` (21 tests, both exemption directions), `scripts/panel-styles.test.mjs`, `research/raw/m069-token-baseline.json` (77 rendered readings, 0 moved) |
| The stylesheet stays within the bundle budget its own suite records, and a mutant that duplicates a token block reddens naming both blocks. | met | scripts/panel-bundle-budget.test.mjs` (6 tests), `scripts/image-budget.test.mjs` (16 tests), `scripts/ds-tokens.test.mjs` (the duplicate rule) |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-T005.log
- build/verify-T006.log
- build/verify-T007.log
- build/verify-T008.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-bf3f8fbc8fe30cd5bcf260b4643c1a0819fd4155/review/VERIFICATION.json
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
- review/wave-8.cycle1.md
- tasks/T001-measure-the-panel-values-the-token-layer-must-re-express.md
- tasks/T002-introduce-the-token-block-and-the-reduced-motion-contract.md
- tasks/T003-pin-the-token-layer-with-its-own-suite.md
- tasks/T004-re-derive-the-recordings-the-token-layer-moved.md
- tasks/T005-run-the-project-verify-at-the-final-head.md
- tasks/T006-land-the-census-chain-the-new-suite-and-record-moved.md
- tasks/T007-re-point-the-style-read-record-at-the-sheet-the-tokens-rewro.md
- tasks/T008-pay-the-reds-that-predate-this-milestone.md

## Notes

- none
