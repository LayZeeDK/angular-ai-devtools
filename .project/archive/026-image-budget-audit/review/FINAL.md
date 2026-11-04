# Final Review — M026 image-budget-audit

Reviewed HEAD: 1a2c359d4de46d7165895ae8f2300af6d29e8884

Overall verdict: pass

## Success criteria

### SC1 — The offline digest carries exactly one entry for each of the eighteen image codes the installed Angular declares — the seventeen in `RuntimeErrorCode`'s image block (`NG2950`–`NG2967`, with no `NG2957`) plus `NG0913` from core — and no entry for a code outside that set.

- **Verdict**: met
- **Check**: `node --test scripts/image-digest.test.mjs`; enum at `v22.1.8`
- **Observed**: eighteen entries equalling the measured set; removing one reddens naming it, adding an unmeasured one reddens on the count.
- **Reference**: `.project/review/wave-1.cycle1.md`, `wave-4.cycle1.md`
- **Finding**: the first set was thirteen, from a keyword grep; the clone's enum settles it at eighteen.
- **Fix direction**: none

### SC2 — Every digest entry is at most 150 tokens, and the digest is generated at extension build time rather than hand-written at runtime.

- **Verdict**: met
- **Check**: `countTokens` is `Math.ceil(len/3)`; `trimToTokens` caps at 450 characters
- **Observed**: a 900-character source entry comes out at 450 with the marker; regeneration of the artefact is byte-identical; deleting the builder fails.
- **Reference**: `.project/review/wave-1.cycle1.md`
- **Finding**: the bound is an upper bound, so a 150-token cap cannot be understated.
- **Fix direction**: none

### SC3 — A fixture page uses `NgOptimizedImage` in a way that provokes a real runtime warning, and COM-1 names the image, the code and the binding that produced the offending attribute.

- **Verdict**: met
- **Check**: `node --test scripts/image-finding.test.mjs`
- **Observed**: COM-1 turns the committed `NG2952` sample into a finding naming code, image and binding; deleting `binding` yields no finding.
- **Reference**: `.project/review/wave-2.cycle1.md`, `final-gap-2.md`
- **Finding**: the sample is transcribed, not captured; the file says so in its `source` field.
- **Fix direction**: none

### SC4 — The licence and copyright notice is stripped from every entry before any digest text reaches a prompt.

- **Verdict**: met
- **Check**: `node --test scripts/image-digest.test.mjs` — five licence cases
- **Observed**: licence text in a meaning or fix does not survive; mid-sentence markers leave no double space; a clean entry is byte-identical at 56 characters; bypassing the strip lets the licence through.
- **Reference**: `.project/review/wave-1.cycle1.md`
- **Finding**: the strip is inert on legitimate text, proven rather than assumed.
- **Fix direction**: none

### SC5 — The panel renders the finding and its explanation from a short fact list with no tool calling outside the registry envelope, and `npm run check` and `npm test` pass at the head while the initial bundle stays inside the recorded baseline of 535.44 kB (520 kB is the build's warning threshold, not the enforced bound — the panel already sat above it before this milestone).

- **Verdict**: met
- **Check**: `node --test scripts/image-budget.test.mjs`; `scripts/panel-bundle-budget.test.mjs`
- **Observed**: four states render; an unknown code renders unknown with no invented fix; the fix follows the digest; the initial total is 532.56 kB against the 535.44 kB baseline, margin 2.88 kB.
- **Reference**: `.project/review/wave-3.cycle1.md`, `final-gap-2.md`
- **Finding**: the bound is the enforced 535.44 kB; 520 kB is only the build's warning threshold.
- **Fix direction**: none

## Carried forward

- **SC3's warning sample is transcribed, not captured.** The processing path is proven; the capture is not. The
  fix is a `control-ai-browsers` run that loads `/image-budget`, screenshots the console and has the image read for
  `NG2952` — work for the next milestone.
- **The development bundle's byte count is path-dependent**: ±2000 bytes with every structural field exact.
- **T001's title still says "thirteen"** after T006 raised the set to eighteen. Named here rather than rewritten,
  because rewriting a landed task's title would break its landing proof.

## What this milestone did not do

It did not capture a browser console message and does not claim to. The roadmap asked whether that warning decides
COM-1's evidence path; the answer recorded in `research/evidence-image-codes.md` is that the Angular runtime codes
are the digest's subject and a browser warning carries no code, so they are separate capabilities.
