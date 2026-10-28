# Archive — 007-n3-di-doctor

Milestone: n3-di-doctor
Shipped: 2026-10-28
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 6 done / 6 total  Review cycles used: 1/1/1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The MAIN-world script computes DI resolution paths for selected components via `ng.ɵgetInjector*` APIs, recording each injector boundary and provider record. | met | src/main-world/di-path-tracer.ts, extension/agent-main.js, T001 landing commit 51df143, verify-ledger pass at HEAD |
| The panel displays the resolution path for a selected component, showing injector boundaries and the provider record for the queried token. | met | src/panel/di-path-display.ts, src/main-world/di-lookup.ts, apps/angular-ai-devtools/src/app/di-path-display.ts, apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts, T002 landing commit 91bd24a, T003 landing commit deb8d4a |
| The panel compares two components' resolution paths and shows where they diverge (the first injector holding a different provider for the token). | met | src/panel/di-diff-display.ts, apps/angular-ai-devtools/src/app/di-diff-display.ts, T004 landing commit b546887 |
| The panel asks the panel-local Prompt API to explain the resolution path or the divergence, sending only a short fact list (no tool calling in the core loop). | met | src/panel/di-explain.ts, apps/angular-ai-devtools/src/app/di-explain.ts, apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts, T005 landing commit 0ab520f |
| Unit tests for DI path computation on recorded data; browser test on `spikes/ng222-app`. | met | tests/browser/di-regression.spec.ts, playwright.config.mts, extension/agent-main.test.mjs, scripts/di-*.test.mjs, T006 landing commit fa4062b, verify-ledger pass at HEAD |
| `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` pass with no regressions to N1 or N2. | met | .project/build/verify-ledger.jsonl entries at 03e47e6aacdbb90c6eb74fe906b08cd716416886, .project/review/final-gap-1.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/PLAN.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-domain.md
- research/evidence-pitfalls.md
- research/evidence-similar.md
- research/evidence-stack.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- tasks/T001-di-path-tracer.md
- tasks/T002-di-lookup.md
- tasks/T003-panel-path-display.md
- tasks/T004-panel-diff-display.md
- tasks/T005-explain-button.md
- tasks/T006-regression-gate.md

## Notes

- none
