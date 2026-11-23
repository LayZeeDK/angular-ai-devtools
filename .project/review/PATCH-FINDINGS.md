# PATCH FINDINGS — M064 lazy-chunk-failure

State: ship/blocked
Reviewed HEAD: 8a523423beffe1c2a1f15e2b57367d3519eaacfe

The final review's gap check found two contract defects in the plan. Neither touches product code: both are `files:`
declarations that the gates refuse, and both are corrected in the contracts and re-landed so each task file equals its
own landing commit again.

### P001 — T003 declares a path that has never existed

- **Source**: `.project/review/final-gap-1.md`
- **Locator**: Risk: the T003 contract declares a path that has never existed, so the gate reads a claim the range cannot carry
- **Evidence**: scripts/gate-integrity.mjs --check fix-record` refuses with `refusal scripts/page-picker.component.spec.mjs at T003 (claim-absent-from-the-range)`, and `git log --all -- scripts/page-picker.component.spec.mjs` returns no commit: the path has never existed in this repository. The file T003 actually changed is `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`. The declaration entered the contract when the `pinned-file` closure was absorbed mechanically, and a declaration is what turns a Log mention into a judged claim.
- **Fix direction**: delete the phantom entry from T003's `files:` and re-land T003 so its file equals its landing commit again, then add the guard that would have caught it: `plan-lint` refuses a `files:` entry that does not exist in the tree at plan time, so the mistake fails before approval rather than at ship.

### P002 — T008 exceeds the artefact ceiling the plan itself enforces

- **Source**: `.project/review/final-gap-2.md`
- **Locator**: Risk: the T008 contract declares five authored artefacts where the ceiling is four, so the plan's own weight rule refuses it
- **Evidence**: lars-gsd plan-lint` refuses with `[verify-weight] T008: 5 authored artefacts (4 recording(s) under research/raw, 0 suite(s), the task's own Log) exceed the ceiling of 4`. The fifth artefact is `research/raw/m059-record-shapes.json`, which T008 needed because its own `m044` re-capture moved the line `m059` cites; `m059` is also declared in T006, so the T008 declaration is redundant once the record has landed.
- **Fix direction**: delete `research/raw/m059-record-shapes.json` from T008's `files:` and re-land T008, recording in its Log that the record moved during the task and is owned by T006 for future re-derivation.
