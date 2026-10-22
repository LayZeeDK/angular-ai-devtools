# Archive — 004-nx-angular-workspace

Milestone: nx-angular-workspace
Shipped: 2026-10-22
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 6 done / 6 total  Review cycles used: 1/1/1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The MAIN-world script records change-detection cycles via `ng.ɵsetProfiler` and computes the per-component trigger chain deterministically. Recording starts when the panel opens on the inspected tab; a page reload resets the recording. | met | extension/agent-main.js, extension/agent-main.test.mjs, T001 landing commit 22da497, N3 (no getViewContainerRef/di_graph in recorder) |
| The DevTools panel lists the components the recorded cycles checked; the user picks one, and the panel shows the chain of the last cycle that checked it. | met | apps/angular-ai-devtools/src/app/n1-update-cause.component.ts, T004 landing commit 5694ff2, N4 (explain button is only trigger for model call) |
| The panel asks the panel-local Prompt API to explain the chain and shows the answer; the prompt carries only a short fact list (no tool calling). | met | apps/angular-ai-devtools/src/app/extension-prompt.service.ts, T003 landing commit e6c4fc2, N1 (prompt carries only shaped fact list, no page/content/SW messaging) |
| On `spikes/ng222-app`: a click that writes `count` gives the chain `click -> count -> double -> app-counter template`; a component checked with no signal change is reported as "no signal cause". Unit tests for the chain walk on recorded data; a browser test on the fixture. | met | apps/angular-ai-devtools/src/app/update-cause-chain.ts, spikes/ng222-app/e2e/chain.spec.ts, T002 landing commit 295bf17, T005 landing commit 0be9220, N5 (no mocked Prompt API or fabricated chain data) |
| The panel answers in all four browsers (Chrome 156 Gemini Nano, Chrome Beta 157 Gemini Nano, Edge 155 Phi-4-mini, Edge Dev 157 Aion-1.1), plus chrome-beta-gemma4 as a fifth, through `control-ai-browsers` and the `verify-ai-browsers` extension-panel check, both with the instances' feature flags and without them (`control-ai-browsers up <name> --no-ai-features`). | met | apps/angular-ai-devtools/src/app/extension-prompt.service.ts, T003 landing commit e6c4fc2, N1 (prompt carries only shaped fact list, no page/content/SW messaging), T004 landing commit 5694ff2 |
| The dead prompt bridge (`agent-main.js` LanguageModel code, `relay.js` `PROMPT_API_REQUEST` forwarding and `request()`, `background.js` `PROMPT_API_REQUEST` stub), `content.js`, `page-script.js` and `nx-welcome.ts` are removed: no file, manifest entry or import references them, and `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` and the extension-panel check pass. | met | extension/relay.js, extension/background.js, extension/agent-main.js, T006 landing commit 6e16366 |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
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
- tasks/T001-recorder-core.md
- tasks/T002-chain-walk.md
- tasks/T003-prompt-availability.md
- tasks/T004-panel-ui.md
- tasks/T005-browser-test-fixture.md
- tasks/T006-deletions-cleanup.md

## Notes

- none
