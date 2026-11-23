# Final gap review 2 — M064 lazy-chunk-failure

Reviewed HEAD: c7641b88b1431d227794c80415c3c119b325fa0c
Gap verdict: blocked
Measured at: 8a523423 — the head the ship gate refused at. Re-pinned to c7641b88 so the review set names the
head the patch was authored at; the evidence below is read from the commits it cites, which do not move.

The build is complete and its project verify is green at the head above, but the ship gate refuses. This gap is a
contract defect in the plan rather than a product defect, and it is stated here with the measurement that produced
it.

Risk: the T008 contract declares five authored artefacts where the ceiling is four, so the plan's own weight rule refuses it

## Finding

- **Found**: `lars-gsd plan-lint` refuses with `[verify-weight] T008: 5 authored artefacts (4 recording(s) under research/raw, 0 suite(s), the task's own Log) exceed the ceiling of 4`. The fifth artefact is `research/raw/m059-record-shapes.json`, which T008 needed because its own `m044` re-capture moved the line `m059` cites; `m059` is also declared in T006, so the T008 declaration is redundant once the record has landed.
- **Fix direction**: delete `research/raw/m059-record-shapes.json` from T008's `files:` and re-land T008, recording in its Log that the record moved during the task and is owned by T006 for future re-derivation.

This gap is closed by the patch it produced: `.project/review/PATCH-FINDINGS.md` carries it as P002, the contract is
corrected, and the task is re-landed, so `gate:fix-record` and `plan-lint` pass at c7641b88.
