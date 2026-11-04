# Archive — 025-panel-verify-breadth

Milestone: panel-verify-breadth
Shipped: 2026-11-04
Final verdict: all criteria met; project verify passed
Waves: 2  Tasks: 4 done / 4 total  Review cycles used: 1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| `npm run check` type-checks every authored file under `extension/`, with the generated `extension/panel/` bundle output excluded and the exclusion stated where the config lives. | met | scripts/panel-typecheck-scope.test.mjs` (7 tests), T001/T004 Log. |
| That check reports zero errors, and every non-global defect the probe found — fourteen, not the thirteen estimated in the plan — is fixed at source rather than suppressed. | met | T002 Log; the gap panel's independent grep. |
| A deliberately wrong property introduced into an extension source makes `npm run check` exit non-zero; an error placed inside `extension/panel/` does not, because that directory is generated. | met | scripts/extension-typecheck-scope.test.mjs` — 5 tests, 9 mutants. |
| The strict-mode gap is recorded: the check runs at `strict: false`, and the reason (hand-written JS with implicit-any throughout) is stated in the config header. | met | T003 AC4; `extension/tsconfig.json` lines 1–20. |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- tasks/T001-the-extension-gets-a-type-check-that-runs.md
- tasks/T002-fix-the-thirteen-real-defects.md
- tasks/T003-prove-the-extension-check-bites.md
- tasks/T004-the-check-chain-and-the-recording-the-gate-needs.md

## Notes

- none
