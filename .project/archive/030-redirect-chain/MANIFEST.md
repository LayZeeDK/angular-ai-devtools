# Archive — 030-redirect-chain

Milestone: redirect-chain
Shipped: 2026-11-05
Final verdict: all criteria met; project verify passed
Waves: 7  Tasks: 9 done / 9 total  Review cycles used: 1/1/1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a route that redirects produces an RTR-1 finding naming the requested path, each route the walk entered, and the destination, in the order the configuration declares them. | met | extension/redirect-chain.js`; `research/raw/m030-router-config.json`; T001 `0895a7f`, T002 `b68cb56 |
| The walk reads `Router.config` through `window.ng`'s injector, with no new page-side instrumentation, no router event subscription and no patch of the router. | met | scripts/router-config-capture.test.mjs`; N1 |
| A configuration whose walk revisits a route produces a cycle finding naming the repeated route, rather than walking forever; a route whose entry is gated is reported as gated, without naming what the guard decided. | met | scripts/redirect-chain.test.mjs`; N2 |
| The panel renders the walked chain and marks the first route that changed the destination, and shows the cycle and gated states. | met | apps/angular-ai-devtools/src/app/panel-redirect.ts`; T003 `f64b771 |
| `npm run check` and `npm test` pass at the head. | met | .project/build/evidence.json |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/m030-router-evidence.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- tasks/T001-give-the-fixture-a-redirect-a-gate-a-lazy-boundary-and-a-cycle.md
- tasks/T002-walk-the-configuration-with-a-cycle-guard.md
- tasks/T003-render-the-walked-chain-and-its-marked-change-on-the-panel.md
- tasks/T004-rerecord-what-the-new-routes-invalidated.md
- tasks/T005-reconcile-the-two-development-build-recordings.md
- tasks/T006-stop-the-capture-suite-rewriting-a-tracked-recording.md
- tasks/T007-bind-a-free-port-and-prove-the-server-is-released.md
- tasks/T008-make-the-capture-teardown-observable.md
- tasks/T009-retry-the-workspace-teardown-on-a-locked-directory.md

## Notes

- none
