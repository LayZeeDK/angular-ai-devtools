# Archive — 057-tutor-signals

Milestone: tutor-signals
Shipped: 2026-11-21
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 10 done / 10 total  Review cycles used: 1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| An answer for a signals question names the effect node the record carries by the label the graph gives it and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its position in the node array, or omits a producer an edge records, reddens the same criterion. | met | .project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `research/raw/m057-surface.json:10-15,26-51,331` (the surface record's own measurement); `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md`, `wave-5.cycle1.md |
| Where the record carries no ordering between a write and the render, the answer states that ordering as a named absence — no write record, no order — beside the effect and its upstream nodes, and names no write, no owner and no cause; a mutant that renders the absence as causation (the write, then the render), a mutant that reads an order out of an edge's direction, and a mutant that renders a write the record does not carry each redden. | met | .project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `research/raw/m057-record-shapes.json:506-566` (the absence, measured); `research/raw/m057-verdict-claims.json:6-7,29-35,46-51` (SC2's held-out edges assigned to `scripts/tutor-signals.test.mjs`); `research/raw/m057-surface.json:331,715-753`; `.project/review/wave-2.cycle1.md`, `wave-5.cycle1.md |
| A page whose signal graph the agent could not read reports cannot-tell naming the graph and nothing else — no effect, no label, no read (`extension/render-phase.js:310-312`) — and the absences stay distinct: a page whose record carries no render/effect entry, and a readable graph that holds no effect node (`extension/render-phase.js:317-319`), each report their own named absence; a mutant that reports an unreadable graph as a page with no effects, and a mutant that folds the three absences into one blank or empty answer, redden. | met | .project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `scripts/tutor-signals.test.mjs:691-809` (the seven absence cases); `research/raw/m057-surface.json:331` (each state with the answer field it reads); `.project/review/wave-2.cycle1.md`, `wave-4.cycle1.md`, `wave-5.cycle1.md |
| No claim cites a node the record does not contain: every node index the answer renders is one the recorded graph's own `nodes` array carries, and a producer end or effect reference the graph cannot place is named as unplaced rather than numbered, dropped or resolved to the nearest node; a mutant that renders an index past the graph's last node, and a mutant that drops a producer the graph does not carry, redden. | met | .project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `scripts/tutor-signals.test.mjs:606-683` (every index held to the graph's own nodes); `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-5.cycle1.md |
| The answer is produced from the two records the agent already captures — the serialized graph (`extension/agent-main.js:912`, carried per check at `:1070`) and the render/effect join (`extension/render-phase.js:304`) — with no new page-side instrumentation, no second profiler tap (`.project/ROADMAP.md:1085`), and nothing the record does not hold: no DOM, no clock, no console, no page global (`extension/render-phase.js:21-26`), and no field the reader ignores (`extension/render-phase.js:33-35`); a mutant that reads a live page value, starts its own profiler tap, or answers from a field the record does not carry reddens. | met | .project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `research/raw/m057-record-shapes.json:9-13,764-767` (the two records, and the field the serializer does not write); `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-5.cycle1.md |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-T005.log
- build/verify-T006.log
- build/verify-T007.log
- build/verify-T008.log
- build/verify-T009.log
- build/verify-T010.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/PATCH-FINDINGS.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-what-the-two-records-carry-and-what-no-record-carries.md
- tasks/T002-answer-from-the-two-records-purely.md
- tasks/T003-capture-the-one-graph-no-record-holds.md
- tasks/T004-render-the-answer-and-land-the-route.md
- tasks/T005-pin-the-route-table-and-the-loader-map.md
- tasks/T006-teach-both-record-inventories-this-milestones-pair.md
- tasks/T007-record-the-surface-and-re-measure-the-copy.md
- tasks/T008-re-derive-the-gate-shapes-the-landing-staled.md
- tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md
- tasks/T010-recapture-the-stability-record-at-the-shipping-head.md

## Notes

- none
