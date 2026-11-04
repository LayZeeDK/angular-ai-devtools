# Archive — 024-proof-corpus-repair

Milestone: proof-corpus-repair
Shipped: 2026-11-04
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 5 done / 5 total  Review cycles used: 2/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A named script runs every suite under `tests/held-out/`, and it is reachable from the project gate so a red suite fails the build. | met | .project/review/wave-1.cycle2.md`, `.project/review/final-gap-1.md |
| Every suite in `tests/held-out/` passes under that script in a fresh checkout with no `.project/` directory present. | met | .project/review/wave-1.cycle2.md`, `wave-2.cycle1.md |
| No suite under `tests/held-out/` reads any path under `.project/`, demonstrated by running the corpus with that directory moved aside. | met | .project/review/wave-2.cycle1.md`, `wave-3.cycle1.md |
| The ten suites that read `.project/review/rounds/` or `.project/review/specs/` are either deleted with their claim recorded, or re-homed so their claim is asserted from data the suite carries. | met | .project/review/wave-1.cycle2.md`, `wave-3.cycle1.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/MEASUREMENT.md
- plan/PLAN.md
- plan/RETIRED-SUITES.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-1.cycle2.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- tasks/T001-remove-the-ten-suites-that-cannot-pass.md
- tasks/T002-the-corpus-gets-a-script-the-gate-reaches.md
- tasks/T003-prove-the-corpus-gate-bites.md
- tasks/T004-the-corpus-runs-with-no-project-directory.md
- tasks/T005-the-ship-verify-runs-in-a-fresh-sidecar.md

## Notes

- none
