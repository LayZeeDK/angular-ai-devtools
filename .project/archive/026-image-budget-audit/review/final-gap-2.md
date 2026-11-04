# Gap Review — 2: proof strength

Reviewed HEAD: 1a2c359d4de46d7165895ae8f2300af6d29e8884
Gap verdict: pass
Risk: proof strength
Waves checked: 6

## Checked evidence

- **Check**: `node --test scripts/image-finding.test.mjs` after deleting `binding` from `spikes/ng222-app/src/app/image-budget-warning.json` (mutant 3)
- **Observed**: test failed with exact line `✖ COM-1 turns the committed warning sample into a finding naming code, image and binding (1.3939ms)` and `AssertionError [ERR_ASSERTION]: expected a finding from the committed sample` at `scripts/image-finding.test.mjs:40:10` (restored file, `git status --porcelain` clean)
- **Reference**: `spikes/ng222-app/src/app/image-budget-warning.json`, `scripts/image-finding.test.mjs`

## Finding

- **Found**: Mutant 3 (removing `binding`) breaks the committed-sample finding path as expected.
- **Fix direction**: none

## Notes

- Proof layer is sound given the five mutants described (each catches a distinct failure mode across naming, trimming, required fields, fixture freshness, and unknown codes).
- Residual weakness (real but not disqualifying): mutant 3 proves the processing/path logic and required-field enforcement, but the sample itself is transcribed from `node_modules/@angular/common/fesm2022/common.mjs` (`source` says "no browser capture performed"), so the "real warning" is represented by a curated transcription rather than a captured runtime artifact. That’s a provenance/representativeness concern, not a proof-strength failure for the mutation checks run.
RESULT: final-gap-2 pass, mutant 3's exact failure line: `✖ COM-1 turns the committed warning sample into a finding naming code, image and binding (1.3939ms)`, model: Glyph Cluster
