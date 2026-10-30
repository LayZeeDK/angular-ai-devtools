# Archive — 010-n4-error-explainer

Milestone: n4-error-explainer
Shipped: 2026-10-30
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 12 done / 12 total  Review cycles used: 2/2/1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its owning component, resolved through `ng.getOwningComponent`. | met | extension/agent-main.js:519-566`; `extension/relay.js:15-18`; `extension/background.js:8-14`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:65-76`; `src/main-world/error-capture.ts:16`; `.commandcode/skills/control-ai-browsers/scripts/panel.mjs:252-281`; `D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\{chrome-stable-nano,chrome-beta-gemma4,edge-phi4mini,edge-dev-aion,insurance-portal-2}\verdict.json |
| The offline error digest is generated at extension build time with one entry per error code and each entry capped at 150 tokens. | met | apps/angular-ai-devtools/project.json:52-99`; `scripts/generate-error-digest.mjs`; `extension/error-digest.json`; `extension/error-digest.test.mjs`; `scripts/error-digest-wiring.test.mjs`; `.project/review/final-gap-3.md |
| The MIT license and Google LLC copyright notice is stripped from every digest entry before any digest text reaches the Prompt API or another built-in AI API. | met | scripts/generate-error-digest.mjs`; `extension/error-digest.json`; `src/main-world/error-digest.ts`; `src/panel/error-explainer-view.ts`; `apps/angular-ai-devtools/src/app/error-explainer.component.ts`; `.project/review/final-gap-3.md |
| The panel explains a captured error using the panel-local Prompt API, sending only a short fact list, and the answer is shown in the panel. | met | apps/angular-ai-devtools/src/app/error-explainer.component.ts`; `src/panel/error-explainer-view.ts`; `src/main-world/error-digest.ts`; `D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\{chrome-stable-nano,chrome-beta-gemma4,edge-phi4mini,edge-dev-aion,insurance-portal-2}\verdict.json |
| `lars-verify` records a verdict of `verified` for the error-explainer claim, with end-to-end coverage on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct. | met | D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\chrome-stable-nano\verdict.json`; `.../chrome-beta-gemma4/verdict.json`; `.../edge-phi4mini/verdict.json`; `.../edge-dev-aion/verdict.json |
| Where meaningful, the error explanation is also verified on the insurance-portal fixture, and the claim records that external dependency. | met | D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\insurance-portal-2\verdict.json`; `.project/review/final-gap-2.md |
| The declared verification gate names and runs both test runners — `npm test` executes the app's `*.spec.ts` suite through the Nx unit-test target as well as the `node:test` suites — and the three Command Code documents that misstate the code (`AGENTS.md`'s Nx command path, `extension-panel.md`'s Angular version, `monitor-ci`'s `nx.json` claim) are corrected. | met | .project/build/verify-ledger.jsonl` (entry 8, commit b0a40e7eeb2d0007684e2a83b28dac6e05b0cb3b, exit_code 0); `.project/review/final-gap-1.md`; `.project/review/wave-3.cycle1.md |

## Contents

- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-89f5fe8b076573341bb05cd58c00e1eb15e1918b/review/wave-1.cycle1.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/wave-1.cycle1.md
- review/wave-1.cycle2.md
- review/wave-2.cycle1.md
- review/wave-2.cycle2.md
- review/wave-3.cycle1.md
- tasks/T001-build-time-error-digest.md
- tasks/T002-error-capture-ring-buffer-owning-component.md
- tasks/T003-panel-error-explainer-ui-prompt-api.md
- tasks/T004-wire-both-test-runners-into-npm-test.md
- tasks/T005-correct-three-command-code-docs.md
- tasks/T006-author-error-explainer-verification-check.md
- tasks/T007-wire-error-digest-into-extension-build.md
- tasks/T008-repair-error-explainer-answer-path.md
- tasks/T009-panel-module-compiles.md
- tasks/T010-genuine-error-explainer-driver.md
- tasks/T011-restore-n4-panel-drive-and-aion-pair.md
- tasks/T012-ng-row-selection.md

## Notes

- none
