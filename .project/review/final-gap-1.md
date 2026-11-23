# Final gap review 1 — M064 lazy-chunk-failure

Reviewed HEAD: c7641b88b1431d227794c80415c3c119b325fa0c
Gap verdict: blocked
Measured at: 8a523423 — the head the ship gate refused at. Re-pinned to c7641b88 so the review set names the
head the patch was authored at; the evidence below is read from the commits it cites, which do not move.

The build is complete and its project verify is green at the head above, but the ship gate refuses. This gap is a
contract defect in the plan rather than a product defect, and it is stated here with the measurement that produced
it.

Risk: the T003 contract declares a path that has never existed, so the gate reads a claim the range cannot carry

## Finding

- **Found**: `scripts/gate-integrity.mjs --check fix-record` refuses with `refusal scripts/page-picker.component.spec.mjs at T003 (claim-absent-from-the-range)`, and `git log --all -- scripts/page-picker.component.spec.mjs` returns no commit: the path has never existed in this repository. The file T003 actually changed is `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`. The declaration entered the contract when the `pinned-file` closure was absorbed mechanically, and a declaration is what turns a Log mention into a judged claim.
- **Fix direction**: delete the phantom entry from T003's `files:` and re-land T003 so its file equals its landing commit again, then add the guard that would have caught it: `plan-lint` refuses a `files:` entry that does not exist in the tree at plan time, so the mistake fails before approval rather than at ship.

This gap is closed by the patch it produced: `.project/review/PATCH-FINDINGS.md` carries it as P001, the contract is
corrected, and the task is re-landed, so `gate:fix-record` and `plan-lint` pass at c7641b88.
