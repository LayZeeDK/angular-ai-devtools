# Archive — 005-signal-provenance

Milestone: signal-provenance
Shipped: 2026-10-25
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 6 done / 6 total  Review cycles used: 1/1/1  Attested: 2
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The MAIN-world script traces the reactive provenance of a selected signal or component through `ng.ɵgetSignalGraph`, computing the dependency chain (producers -> consumers) deterministically. | met | extension/agent-main.js, extension/agent-main.test.mjs, T001 landing commit 2b4a34e, review/w1/review.json T001 PASS |
| The panel displays the provenance chain for a user-selected signal or component, showing each node's kind, label, and edge direction. | met | apps/angular-ai-devtools/src/app/signal-provenance.ts, T002 landing commit 6134992, T004 landing commit 3f157dde |
| The panel detects at least three reactive anti-patterns (e.g., untracked signal reads in effects, write-after-read in the same effect, computed with side effects) and reports them with evidence (node labels and graph positions). | met | apps/angular-ai-devtools/src/app/anti-pattern-detector.ts, T003 landing commit e213dc3 |
| The panel asks the panel-local Prompt API to explain the provenance chain and detected anti-patterns, sending only a short fact list (no tool calling). | met | apps/angular-ai-devtools/src/app/extension-prompt.service.ts, T004 landing commit 3f157dde, N1/N2 prohibitions honored |
| Unit tests for provenance tracing on recorded graph data; browser test on `spikes/ng222-app`. | met | apps/angular-ai-devtools/src/app/signal-provenance.spec.ts, apps/angular-ai-devtools-e2e/src/signal-provenance.spec.ts, T002 landing commit 6134992, T005 landing commit 49977ad |
| `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` pass. | met | verify-ledger.jsonl final entry commit 3914a8ca, T006 landing commit 3416529 |

## Contents

- build/evidence.json
- build/review/w1/review.json
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
- tasks/T001-provenance-tracer-mainworld.md
- tasks/T002-provenance-chain-traversal.md
- tasks/T003-anti-pattern-detector.md
- tasks/T004-panel-ui-provenance.md
- tasks/T005-browser-test-counter-fixture.md
- tasks/T006-regression-gate.md

## Notes

- none
