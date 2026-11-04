# Archive — 023-fixture-components

Milestone: fixture-components
Shipped: 2026-11-04
Final verdict: all criteria met; project verify passed
Waves: 9  Tasks: 23 done / 23 total  Review cycles used: 1/1/2/1/1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes. | met | .project/review/wave-8.cycle1.md`, `.project/review/wave-9.cycle1.md`, `.project/review/final-gap-1.md |
| The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed. | met | .project/review/wave-4.cycle1.md`, `wave-5.cycle1.md |
| The fixture builds and serves, and the four shipped explainers still answer on it. | met | .project/review/wave-5.cycle1.md |
| `npm run check` and `npm test` pass at the head. | met | .project/build/evidence.json`, `.project/review/wave-9.cycle1.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-3.cycle2.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- review/wave-9.cycle1.md
- tasks/T001-component-packages-and-repin.md
- tasks/T002-harness-target-page.md
- tasks/T003-aria-cdk-material-surfaces.md
- tasks/T004-declare-verification-surface.md
- tasks/T005-explainers-unchanged-and-gate.md
- tasks/T006-reconcile-shared-recordings.md
- tasks/T007-repair-control-skill-typecheck.md
- tasks/T008-explainer-pin-real-comparison.md
- tasks/T009-harness-family-proofs.md
- tasks/T010-aria-rules-read-the-rendered-tree.md
- tasks/T011-rebuild-idempotency-for-real.md
- tasks/T012-verdict-claims-follow-the-milestone.md
- tasks/T013-predicate-and-action-suites-learn-to-fail.md
- tasks/T014-aria-order-compares-the-real-render.md
- tasks/T015-controls-resolves-to-its-element.md
- tasks/T016-the-second-cycle-serves.md
- tasks/T017-an-explainer-answers-on-the-fixture.md
- tasks/T018-derive-the-browser-slot-instead-of-pinning-it.md
- tasks/T019-busyports-must-not-depend-on-netstat.md
- tasks/T020-e1-asserts-what-is-projected.md
- tasks/T021-e2-reads-bindings-not-only-literals.md
- tasks/T022-the-port-probe-answers-for-both-legs.md
- tasks/T023-the-ambiguity-suite-owns-its-declaration.md

## Notes

- none
