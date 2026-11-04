# Archive — 028-after-render-ordering

Milestone: after-render-ordering
Shipped: 2026-11-04
Final verdict: all criteria met; project verify passed
Waves: 2  Tasks: 4 done / 4 total  Review cycles used: 1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a component whose `afterNextRender` reads `offsetWidth` before layout produces a COR-1 finding naming the read, the phase it ran in, and the after-render events around it. | met | scripts/after-render-fixture.test.mjs`; `spikes/ng222-app/src/app/after-render-page.ts`; T001 `c55790f |
| The finding is produced from the ordered profiler after-render events alone, with no new page-side instrumentation. | met | extension/after-render.js`; `apps/angular-ai-devtools/src/app/after-render.ts`; T002 `d2a48e4`, T003 `b5a66ce |
| A read with no after-render event in the profiler list produces a "cannot tell" state naming that absence, rather than attributing the zero width to layout. | met | extension/after-render.js`; the wave-2 review's rendered-output search |
| The panel renders the ordered chain and its explanation, and shows the "cannot tell" state when the list holds no after-render event for the read. | met | apps/angular-ai-devtools/src/app/after-render.ts`; T003 `b5a66ce |
| `npm run check` and `npm test` pass at the head. | met | .project/build/evidence.json |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-m028-premise.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- tasks/T001-give-the-fixture-an-after-render-read.md
- tasks/T002-order-the-after-render-events-around-the-read.md
- tasks/T003-render-the-ordered-chain-on-the-panel.md
- tasks/T004-re-record-what-the-fixture-change-invalidated.md

## Notes

- none
