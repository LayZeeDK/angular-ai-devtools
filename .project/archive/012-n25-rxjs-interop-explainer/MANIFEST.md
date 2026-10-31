# Archive — 012-n25-rxjs-interop-explainer

Milestone: n25-rxjs-interop-explainer
Shipped: 2026-10-31
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 16 done / 16 total  Review cycles used: 1/1/1/1
Carried forward: 11 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the counter fixture's dev-only interop route, the panel identifies a `toSignal` source/state node and an unlabelled effect whose `debuggableFn` contains `subject.error`, and slices their direct producers/consumers. | met | .project/review/wave-3.cycle1.md`; `.project/plan/evidence/T006/interop.json`; `T007`, `T008`, `T009`; `src/main-world/interop-keep-list.ts`; `apps/angular-ai-devtools/src/app/interop.service.ts`; `spikes/ng222-app/src/app/stale-view-fixture.ts |
| The panel states that it cannot name the feeding Observable, the operator chain, or emission timing. | met | .project/review/wave-3.cycle1.md`; `apps/angular-ai-devtools/src/app/interop.component.ts`; `.project/plan/evidence/T006/interop.json |
| Field-to-node attribution is worded "inferred, untested". | met | .project/review/wave-3.cycle1.md`; `apps/angular-ai-devtools/src/app/interop-attribution.spec.ts`; `.project/plan/evidence/T009/interop.json |
| The interop keep-list keeps `toSignal.*` nodes on top of the existing library-internal filter. | met | .project/review/wave-3.cycle1.md`; `src/main-world/interop-keep-list.ts`; `apps/angular-ai-devtools/src/app/interop-slice.spec.ts |
| The panel explains the slice using the panel-local Prompt API, sending only a short fact list. | met | .project/review/wave-3.cycle1.md`; `.project/plan/evidence/T006/interop.json`; `.project/plan/evidence/T009/interop.json |
| lars-verify verdict of verified for the interop claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct. | met | .project/review/wave-4.cycle1.md`; `.project/plan/CLAIM.md`; `.project/plan/evidence/T006/interop.json`; `T007`; `T008`; `T009 |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/CLAIM.md
- plan/PLAN.md
- plan/evidence/T006/chrome-stable-nano-doctor-1793410135219.json
- plan/evidence/T006/chrome-stable-nano-doctor-1793410206046.json
- plan/evidence/T006/chrome-stable-nano-flags-1793410145250.json
- plan/evidence/T006/chrome-stable-nano-flags-1793410212689.json
- plan/evidence/T006/chrome-stable-nano-info-1793410088849.json
- plan/evidence/T006/chrome-stable-nano-info-1793410180969.json
- plan/evidence/T006/chrome-stable-nano-model-info-1793410152773.json
- plan/evidence/T006/chrome-stable-nano-model-info-1793410218568.json
- plan/evidence/T006/chrome-stable-nano-panel-1793410116751.json
- plan/evidence/T006/chrome-stable-nano-panel-1793410191337.json
- plan/evidence/T006/interop.json
- plan/evidence/T007/chrome-beta-gemma4-doctor-1793410908881.json
- plan/evidence/T007/chrome-beta-gemma4-doctor-1793410999525.json
- plan/evidence/T007/chrome-beta-gemma4-flags-1793410912887.json
- plan/evidence/T007/chrome-beta-gemma4-flags-1793411003999.json
- plan/evidence/T007/chrome-beta-gemma4-info-1793410853441.json
- plan/evidence/T007/chrome-beta-gemma4-info-1793410947018.json
- plan/evidence/T007/chrome-beta-gemma4-model-info-1793410919882.json
- plan/evidence/T007/chrome-beta-gemma4-model-info-1793411009884.json
- plan/evidence/T007/chrome-beta-gemma4-panel-1793410876168.json
- plan/evidence/T007/chrome-beta-gemma4-panel-1793410958048.json
- plan/evidence/T007/interop.json
- plan/evidence/T008/edge-phi4mini-doctor-1793411460303.json
- plan/evidence/T008/edge-phi4mini-doctor-1793411709877.json
- plan/evidence/T008/edge-phi4mini-flags-1793411464807.json
- plan/evidence/T008/edge-phi4mini-flags-1793411714890.json
- plan/evidence/T008/edge-phi4mini-info-1793411388700.json
- plan/evidence/T008/edge-phi4mini-info-1793411671150.json
- plan/evidence/T008/edge-phi4mini-model-info-1793411468833.json
- plan/evidence/T008/edge-phi4mini-model-info-1793411720195.json
- plan/evidence/T008/edge-phi4mini-panel-1793411404638.json
- plan/evidence/T008/edge-phi4mini-panel-1793411682404.json
- plan/evidence/T008/interop.json
- plan/evidence/T009/edge-dev-aion-doctor-1793410475572.json
- plan/evidence/T009/edge-dev-aion-doctor-1793410535398.json
- plan/evidence/T009/edge-dev-aion-flags-1793410480642.json
- plan/evidence/T009/edge-dev-aion-flags-1793410543522.json
- plan/evidence/T009/edge-dev-aion-info-1793410451958.json
- plan/evidence/T009/edge-dev-aion-info-1793410514551.json
- plan/evidence/T009/edge-dev-aion-model-info-1793410485845.json
- plan/evidence/T009/edge-dev-aion-model-info-1793410551849.json
- plan/evidence/T009/edge-dev-aion-panel-1793410460281.json
- plan/evidence/T009/edge-dev-aion-panel-1793410520201.json
- plan/evidence/T009/interop.json
- research/13-portal-legacy-audit.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-pitfalls.md
- research/evidence-similar.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- tasks/T001-interop-value-field.md
- tasks/T002-interop-keep-list-classifier.md
- tasks/T003-interop-fixture-extension.md
- tasks/T004-interop-panel-route.md
- tasks/T005-docs-audit-alignment.md
- tasks/T006-interop-verify-chrome-stable-nano.md
- tasks/T007-interop-verify-chrome-beta-gemma4.md
- tasks/T008-interop-verify-edge-phi4mini.md
- tasks/T009-interop-verify-edge-dev-aion.md
- tasks/T010-interop-verify-assemble-claim.md
- tasks/T011-interop-fixture-subject-token.md
- tasks/T012-interop-panel-graph-wiring.md
- tasks/T013-explicit-extension-check.md
- tasks/T014-interop-panel-readability.md
- tasks/T015-interop-check-types.md
- tasks/T016-test-pattern-split.md

## Notes

- none
