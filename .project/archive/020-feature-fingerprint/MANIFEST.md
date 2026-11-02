# Archive — 020-feature-fingerprint

Milestone: feature-fingerprint
Shipped: 2026-11-02
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 8 done / 8 total  Review cycles used: 1/1/1
Carried forward: 33 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The context chip names the features detected for the inspected app, including the features it does not have. | met | apps/angular-ai-devtools/src/app/feature-fingerprint.ts:99-108,114,139-146; apps/angular-ai-devtools/src/app/chat-entry.component.ts:117-124; apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:201-251; tests/held-out/feature-fingerprint-chip.test.mjs:53,94,107,131,238-247; .project/review/wave-2.cycle1.md (T004, T006); .project/review/wave-3.cycle1.md |
| A tool group whose `[ng-version]` gate fails is absent from the chat's group list, not present and empty. | met | apps/angular-ai-devtools/src/app/tool-groups.ts:161-192,210-262,349; apps/angular-ai-devtools/src/app/chat-entry.component.ts:70-82; apps/angular-ai-devtools/src/app/tool-groups.spec.ts:120,305-322; tests/held-out/tool-group-gates.test.mjs:81,99,128,165,183,194,205; .project/review/wave-2.cycle1.md (T005, T006) |
| A non-Angular page produces a named refusal rather than a chip claiming features. | met | apps/angular-ai-devtools/src/app/feature-fingerprint.ts:71,77-86,114-128; apps/angular-ai-devtools/src/app/chat-entry.component.ts:63-68,135-142,179; apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:284-339; tests/held-out/feature-fingerprint-chip.test.mjs:180-258; .project/review/PATCH-FINDINGS.md (P001); .project/review/wave-3.cycle1.md; .project/review/final-gap-3.md |
| `npm run check` and `npm test` pass at the head, and the panel stays inside the 520 KB initial-bundle budget. | met | .project/build/verify-ledger.jsonl (entry for commit b16ecf1ab396376af610f6a0d0ebc2e6cd7323b8, exit_code 0); .project/review/final-gap-1.md; .project/review/final-gap-4.md; scripts/panel-bundle-budget.test.mjs:65 |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-fingerprint.md
- research/evidence-pitfalls.md
- review/FINAL.md
- review/PATCH-FINDINGS.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/final-gap-4.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- tasks/T001-docs-audit-base-repair.md
- tasks/T002-replay-state-and-version.md
- tasks/T003-lazy-route-headroom.md
- tasks/T004-facts-adapter-and-chip.md
- tasks/T005-tool-group-projection.md
- tasks/T006-chat-entry-point.md
- tasks/T007-budget-head-measurement.md
- tasks/T008-replay-outcome-waiting-state.md

## Notes

- none
