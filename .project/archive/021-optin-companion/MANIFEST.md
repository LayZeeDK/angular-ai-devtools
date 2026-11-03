# Archive — 021-optin-companion

Milestone: optin-companion
Shipped: 2026-11-03
Final verdict: all criteria met; project verify passed
Waves: 2  Tasks: 6 done / 6 total  Review cycles used: 2/1
Carried forward: 33 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| An app that installs the package is detected, and the panel names the extra surface it exposes. | met | extension/agent-main.js:133-146,145,167-172,190-241,277-333,346-388; extension/agent-main.test.mjs (sandbox tests quoted above); extension/relay.js:26-38; extension/background.js:30-50; apps/angular-ai-devtools/src/app/extension-message.service.ts:57,134,184-215; apps/angular-ai-devtools/src/app/panel-context.ts:62-97,106-138; apps/angular-ai-devtools/src/app/companion.ts:160-215; apps/angular-ai-devtools/src/app/chat-entry.component.ts:78-104; tests/held-out/companion-surface.test.mjs; tests/held-out/feature-fingerprint-chip.test.mjs; .project/plan/PLAN.md:33-51 (Surface contract); .project/review/wave-2.cycle1.md (T004, T005); .project/review/final-gap-2.md; .project/review/final-gap-3.md |
| An app without the package is refused with a named reason rather than an empty result. | met | extension/agent-main.js:181,190-241,320-388; apps/angular-ai-devtools/src/app/companion.ts:127-142,151,154-217; apps/angular-ai-devtools/src/app/panel-context.ts:106-138; apps/angular-ai-devtools/src/app/chat-entry.component.ts:78-104,164-208; tests/held-out/companion-surface.test.mjs:87-264; tests/held-out/feature-fingerprint-chip.test.mjs:279-374; apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts (E3/AC5); .project/plan/PLAN.md:40-43; .project/review/wave-2.cycle1.md; .project/review/final-gap-3.md |
| The package adds nothing to `globalThis` beyond its table entry. | met | packages/ai-devtools-companion/test/facade.test.mjs; packages/ai-devtools-companion/src/facade.ts; packages/ai-devtools-companion/src/index.ts; scripts/facade-dev-build.test.mjs:582-656; research/raw/companion-dev-build.json; .project/build/verify-ledger.jsonl (entries for 6724919 and ac400a7); .project/review/wave-1.cycle2.md (T002 AC2/AC3, T006); .project/LESSONS.md (021-optin-companion lines 1-2) |
| The facade survives a development build's tree-shaking, proven on the fixture rather than on `buildOptimizer`. | met | scripts/facade-dev-build.test.mjs (requirePrerequisite at :305-307, AC5/AC6/AC7 and N5 tests); research/raw/companion-dev-build.json; spikes/ng222-app/angular.json (preserveSymlinks in the development configuration); .project/build/verify-ledger.jsonl (project Verify entry for 4991ea62, exit 0); .project/review/wave-1.cycle2.md (T002 AC5/AC6/AC7, T006); .project/review/final-gap-1.md |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl (project Verify entry for 4991ea62e78b4f9cefa0f0c3a10dfcc820bd52a9, exit_code 0); scripts/panel-typecheck-scope.test.mjs (CHECK_STAGES, deep-equality refusals); .project/review/final-gap-1.md; .project/review/wave-1.cycle2.md (T001, T003, T006); .project/review/final-gap-3.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-facade.md
- research/evidence-pitfalls.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/wave-1.cycle1.md
- review/wave-1.cycle2.md
- review/wave-2.cycle1.md
- tasks/T001-docs-audit-repair.md
- tasks/T002-companion-package-and-facade-proof.md
- tasks/T003-companion-typecheck-repin.md
- tasks/T004-page-realm-companion-detection.md
- tasks/T005-panel-companion-surface.md
- tasks/T006-fail-not-skip-on-missing-fixture-install.md

## Notes

- none
