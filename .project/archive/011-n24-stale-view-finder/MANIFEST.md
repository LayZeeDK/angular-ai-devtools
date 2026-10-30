# Archive — 011-n24-stale-view-finder

Milestone: n24-stale-view-finder
Shipped: 2026-10-30
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 12 done / 12 total  Review cycles used: 1/1/1/1/1
Carried forward: 9 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the counter app's `stale-view` route in `spikes/ng222-app`, a plain field written in a subscribe callback is flagged with "the template may show a stale value" in the DevTools panel. | met | .project/review/wave-2.cycle1.md`; `.project/review/wave-4.cycle1.md`; `.commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`; `extension/agent-main.js`; `src/main-world/stale-view-scan.ts`; `spikes/ng222-app/src/app/stale-view-fixture.ts`; `tests/held-out/stale-view-version-gate.test.mjs`; `tests/held-out/stale-view-write-regex.test.mjs`; `tests/held-out/stale-view-ordering.test.mjs`; `tests/held-out/stale-view-dedup.test.mjs |
| The finding is produced from `ng.ɵgetSignalGraph` plus the `debuggableFn` source scan without new page-side instrumentation. | met | .project/review/wave-2.cycle1.md`; `extension/agent-main.js`; `src/main-world/stale-view-scan.ts |
| The per-page scan runs in a worker. | met | .project/review/wave-2.cycle1.md`; `extension/stale-view-worker.js`; `apps/angular-ai-devtools/src/app/stale-view-scan.service.ts`; `tests/held-out/stale-view-worker-supersession.test.mjs |
| The panel explains the finding using the panel-local Prompt API, sending only a short fact list. | met | .project/review/wave-3.cycle1.md`; `apps/angular-ai-devtools/src/app/stale-view.component.ts`; `apps/angular-ai-devtools/src/app/stale-view.service.ts`; `apps/angular-ai-devtools/src/app/extension-prompt.service.ts`; `tests/held-out/stale-view-fact-list-escaping.test.mjs |
| `lars-verify` verdict of `verified` for the stale-view claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct. | met | .commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`; `.project/review/wave-4.cycle1.md`; `.project/tasks/T006-stale-view-verification.md |
| Where meaningful, the stale-view finding is also verified on the insurance-portal fixture, and the claim records that external dependency. | met | .commandcode/worktrees/tmp/verify-ai-browsers/evidence/stale-view-run3/stale-view.json`; `.project/review/wave-4.cycle1.md`; `.project/tasks/T006-stale-view-verification.md |

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
- review/FINAL.md
- review/PATCH-FINDINGS.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-repair-m010-ledger.md
- tasks/T002-doc-fix-alignment.md
- tasks/T003-stale-view-agent-scan.md
- tasks/T004-stale-view-scan-worker.md
- tasks/T005-stale-view-panel.md
- tasks/T006-stale-view-verification.md
- tasks/T007-fix-extension-build-types.md
- tasks/T008-panel-driver-stale-view.md
- tasks/T009-counter-stale-view-route.md
- tasks/T010-stale-view-fixture-finding.md
- tasks/T011-panel-driver-stale-view-types.md
- tasks/T012-stale-view-check-types.md

## Notes

- none
