# Gap Review — 2: proof strength

Reviewed HEAD: 2a4f6614095d038b85d157559bceea80b00292d2
Gap verdict: pass
Risk: proof strength
Waves checked: 1, 2, 3, 4, 5, 6, 7

## Checked evidence

- **Check**: mutant `gated = route.canActivate[0];` in extension/redirect-chain.js, then `node --test scripts/redirect-chain.test.mjs`
- **Observed**: suite reddened: 8 tests, 6 pass, 2 fail; `reports a guard as presence (gated) without naming a decision` failed with actual `[fn redirectGuard]` vs expected `true`; restored source, suite returns 8/8 pass
- **Reference**: extension/redirect-chain.js

## Finding

- **Found**: The walk reports a guard only as presence (boolean gated) and never its identity or decision; forcing the gated finding to carry the guard function's identity reddens the suite, and panel-redirect.ts renders only "gated: a route is gated" with no decision, so the evidence does not let a reader believe the walk explains why a redirect happened or what a guard decided.
- **Fix direction**: none

## Notes

- mutant printed line: `+ '[fn redirectGuard]'` / `- true`.
- advisory: panel-redirect.ts read for the display half; no guard decision reaches any rendered string.
