# Archive — 036-resource-lifecycle

Milestone: resource-lifecycle
Shipped: 2026-11-07
Final verdict: all criteria met; project verify passed
Waves: 9  Tasks: 11 done / 11 total  Review cycles used: 1/1/1/1/1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a resource whose state is `loading` produces a finding naming the resource, its current state, and the status of its params, and naming no cause that lives inside the loader. | met | extension/resource-lifecycle.js`, `scripts/resource-lifecycle.test.mjs |
| A resource whose params are `IDLE` produces a finding that says it is idle by design rather than still loading, and does not name an error. | met | extension/resource-lifecycle.js`, `spikes/ng222-app/src/app/resource-states.ts |
| The finding is produced from observables the graph already collects — the per-cycle labels — with no new page-side instrumentation, no build-log scraping and no dev-server dependency. | met | extension/resource-lifecycle.js`, `research/raw/m036-resource-graph.json |
| Where the answer would require the loader's own promise or an HTTP outcome the page does not carry, the module reports "cannot tell" with that reason rather than naming a stuck request. | met | extension/resource-lifecycle.js`, `scripts/resource-lifecycle.test.mjs |
| The panel renders the resource, the state and the params status from a short fact list, shows the "cannot tell" state, and invents neither a cause nor a verdict. | met | apps/angular-ai-devtools/src/app/panel-resource.ts`, `scripts/panel-resource.test.mjs |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl`, `research/raw/m022-ng-context.json |

## Contents

- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/t8last.py
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/RESEARCH.md
- research/SYNTHESIS.md
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
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- review/wave-9.cycle1.md
- tasks/T001-measure-the-graph-hook.md
- tasks/T002-join-the-resource-state.md
- tasks/T003-panel-surface-for-the-resource-finding.md
- tasks/T004-re-record-everything-the-fixture-change-stales.md
- tasks/T005-widen-the-statuses.md
- tasks/T006-accept-every-name-the-graph-emits.md
- tasks/T007-bridge-the-fixture-install.md
- tasks/T008-copy-the-fixture-install.md
- tasks/T009-scope-the-root-copy-assertions.md
- tasks/T010-repair-the-copied-fixture-links.md
- tasks/T011-guard-the-fixture-relative-real-path.md

## Notes

- none
