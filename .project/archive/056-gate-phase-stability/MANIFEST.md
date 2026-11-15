# Archive — 056-gate-phase-stability

Milestone: gate-phase-stability
Shipped: 2026-11-15
Final verdict: all criteria met; project verify passed
Waves: 7  Tasks: 7 done / 7 total  Review cycles used: 1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| `npm run gate:fix-record` exits 0 on a tree whose `.project/tasks` is empty because its milestone archived, examining that milestone's archived task logs and printing how many it examined. | met | scripts/gate-integrity-default-tasks.test.mjs |
| A tree with no task file in either the live or the archived directory still refuses with `nothing-examined`, so the repair does not trade the refusal away for a green stage. | met | scripts/gate-stability-record.test.mjs |
| `node --test scripts/gate-integrity.test.mjs` passes at a head where this milestone's own ship commit exists, and the committed recording's bytes are unchanged by that run. | met | scripts/gate-integrity.test.mjs |
| The stage derives a range for a milestone whose numerically previous id is unshipped, naming the base it used, instead of stopping with "names no ship commit for M055". | met | scripts/navigation-blocking.test.mjs |
| A mutant that reverts the archived-task branch, a mutant that makes the recording's range unconditional, and a mutant that restores the numeric-predecessor rule each redden a test that names the defect. | met | package.json |

## Contents

- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-e24fb26b643ff91da72fa7390c79e498e000eacd/review/VERIFICATION.json
- plan/build-recovery-e24fb26b643ff91da72fa7390c79e498e000eacd/review/wave-1.cycle1.md
- plan/build-recovery-e24fb26b643ff91da72fa7390c79e498e000eacd/review/wave-2.cycle1.md
- plan/build-recovery-e24fb26b643ff91da72fa7390c79e498e000eacd/review/wave-3.cycle1.md
- plan/build-recovery-e24fb26b643ff91da72fa7390c79e498e000eacd/review/wave-4.cycle1.md
- plan/build-recovery-e24fb26b643ff91da72fa7390c79e498e000eacd/review/wave-5.cycle1.md
- plan/build-recovery-e24fb26b643ff91da72fa7390c79e498e000eacd/review/wave-6.cycle1.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- tasks/T001-reproduce-the-three-red-assertions-and-publish-one-record.md
- tasks/T002-read-the-archived-tasks-when-the-live-directory-is-empty.md
- tasks/T003-hold-the-recording-to-a-range-that-does-not-move-when-the-ship-commit-appears.md
- tasks/T004-re-capture-the-milestone-record-its-own-repairs-invalidated.md
- tasks/T005-derive-the-claims-record-path-from-the-milestone-it-describes.md
- tasks/T006-hold-the-record-to-a-range-its-own-commit-cannot-move.md
- tasks/T007-answer-for-the-milestone-it-was-asked-about-and-prove-what-it-proves.md

## Notes

- The project verify is taken in a verify sidecar that now builds the app and the extension and
  formats the generated `extension/panel/index.html` before running; without those artefacts five
  suites failed for reasons that said nothing about the branch.
- A recorded verification is reused for the same commit and command. Drop the entry from
  `build/verify-ledger.jsonl` (keyed `commit`) before a rerun, or the rerun measures nothing.
- This milestone's state was written to `ship/done`, a state the transition table does not contain;
  it was repaired to `ship/active` and `record-shipment` then performed its own legal move.
