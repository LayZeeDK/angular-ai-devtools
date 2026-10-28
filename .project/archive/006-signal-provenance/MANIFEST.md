# Archive — 006-signal-provenance

Milestone: signal-provenance
Shipped: 2026-10-27
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 6 done / 6 total  Review cycles used: 1/1/1/1/1  Attested: 6
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The MAIN-world script traces the reactive provenance of a selected signal or component through `ng.ɵgetSignalGraph`, computing the dependency chain (producers -> consumers) deterministically. | met | src/main-world/provenance-tracer.ts, T001 landing commit 4417ad1, attested at 9b51140, verify-ledger pass at a59405e |
| The panel displays the provenance chain for a user-selected signal or component, showing each node's kind, label, and edge direction. | met | src/panel/provenance.component.ts, src/panel/chain.ts, T002 landing commit 7a1c33d, T004 landing commit a9cee75, attested at b9ed29c and d90cdab, verify-ledger passes |
| The panel detects at least three reactive anti-patterns and reports them with evidence (node labels and graph positions). | met | src/panel/anti-patterns.ts, T003 landing commit 7a1c33d, attested at b9ed29c3d1ad21b2cc4fa7f07e583e0230d4e03d, verify-ledger pass at 4d452a07b79e6f56834c0286f1f55320cedab2cc |
| The panel asks the panel-local Prompt API to explain the provenance chain and detected anti-patterns, sending only a short fact list (no tool calling). | met | src/panel/provenance.component.ts, src/panel/extension-prompt.service.ts, T004 landing commit a9cee75, attested at d90cdab |
| Unit tests for provenance tracing on recorded graph data; browser test on `spikes/ng222-app`. | met | e2e/provenance.spec.ts, T005 landing commit bf3e641, attested at f169484, verify-ledger pass at d90cdab |
| `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` pass. | met | verify-ledger.jsonl final entry at 2ebff173, final-gap-1.md pass, T006 landing commit 57c9dd8, attested at c977fdf |

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
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-provenance-tracer.md
- tasks/T002-chain-traversal.md
- tasks/T003-anti-pattern-detector.md
- tasks/T004-panel-ui.md
- tasks/T005-browser-test.md
- tasks/T006-regression-gate.md

## Notes

- none
