# Archive — 014-interop-proof

Milestone: interop-proof
Shipped: 2026-11-01
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 4 done / 4 total  Review cycles used: 1/1/1/1
Carried forward: 4 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| `verify-ai-browsers/checks/interop.mjs` exits 0 on a named instance, proving a sliced node set with at least one node, the three stated limits, the "inferred, untested" attribution and a non-empty answer, and its evidence file is committed. | met | .project/build/verify/interop/verdict.json`; `.project/build/verify/interop/interop.json`; `.commandcode/skills/verify-ai-browsers/checks/interop.mjs`; `.commandcode/skills/verify-ai-browsers/checks/interop.test.mjs |
| The claim's recorded source is `spikes/ng222-app`'s `stale-view` fixture, named in the milestone intent, and every note that says the portal is required is corrected. | met | .commandcode/skills/control-ai-browsers/features/interop.md`; `AGENTS.md`; `.project/intent/INTENT.md |
| `features/.proven.json` records the interop feature as proven at the shipped head, and the fingerprint check reports it fresh. | met | .commandcode/skills/control-ai-browsers/features/.proven.json`; `.project/review/final-gap-2.md |
| The project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`) passes at the shipped head and the skills mirror test is green. | met | .project/review/final-gap-1.md`; `.project/review/wave-4.cycle1.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- build/verify/interop/edge-dev-aion-doctor-1793497036045.json
- build/verify/interop/edge-dev-aion-flags-1793497041182.json
- build/verify/interop/edge-dev-aion-info-1793497005747.json
- build/verify/interop/edge-dev-aion-info-1793497011775.json
- build/verify/interop/edge-dev-aion-model-info-1793497045979.json
- build/verify/interop/edge-dev-aion-panel-1793497019415.json
- build/verify/interop/interop.json
- build/verify/interop/interop.spec.json
- build/verify/interop/verdict.json
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-pitfalls.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- tasks/T001-deferred-stale-view-fixture-route.md
- tasks/T002-interop-check-alignment.md
- tasks/T003-proven-and-doc-corrections.md
- tasks/T004-project-verify-and-skills-mirror.md

## Notes

- none
