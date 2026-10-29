# Archive — 009-consolidation-hardening

Milestone: consolidation-hardening
Shipped: 2026-10-29
Final verdict: all criteria met; project verify passed
Waves: 6  Tasks: 21 done / 21 total  Review cycles used: 1/1/1/1/1/1
Carried forward: 8 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Every defect found by the hardening review is fixed or explicitly accepted with a written reason. | met | .project/review/wave-6.cycle1.md` (T017), `.project/review/rounds/round-3.md`, commits `6cd1f28`, `f8ee069`, `93bd1f7`, `fb1b224`, `b58d1b8`, `d6ffef7`. |
| `npm run check` and `npm test` pass with no skipped tests, and the skills-mirror parity test passes. | met | .project/review/wave-6.cycle1.md` (T003/T008/T017), verify-ledger.jsonl lines 24-26, `.project/review/wave-2.cycle1.md` (T003). |
| The N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs, each with a `lars-verify` verdict of `verified`. | met | .project/review/rounds/panel-verification.md` (under build-recovery-3bbfba8a...), `.project/plan/build-recovery-3bbfba8a.../review/rounds/panel-chrome-stable-nano.md`, `.project/plan/build-recovery-3bbfba8a.../review/rounds/panel-edge-dev-aion.md`, INTENT.md `## Corrections` (2026-10-29), `.project/review/wave-6.cycle1.md` (T007/T018-T021). |
| Where meaningful, the same claims are also verified on the insurance-portal fixture, and the claim records that external dependency. | met | .project/review/rounds/panel-verification.md` (Insurance portal section), `.project/review/wave-6.cycle1.md` (T007). |
| Unused spike trees are retired only after their evidence is archived, with no in-repo reference left broken. | met | .project/review/wave-2.cycle1.md` (T005), commits `a24cedb6...`, `c3e8f576...`. |
| No new feature and no public behavior change is introduced. | met | .project/review/wave-5.cycle1.md`, `.project/review/wave-3.cycle1.md` (T006), commit `d6ffef7`. |
| Each of M001-M007 has a `lars-review` specification with a frozen range, file scope, focus areas, and acceptance. | met | .project/review/wave-1.cycle1.md` (T001), commit `f890e6c95eab3fde7407985cced9f0ee6427ec57`. |
| Multiple `lars-review` rounds ran over those specifications; every verified blocking finding is fixed or explicitly deferred with a written reason, and the checks pass after the fixes. | met | .project/review/wave-6.cycle1.md` (T017), `.project/review/rounds/round-1.md`, `round-2.md`, `round-3.md`, commit `a2e285f`. |

## Contents

- build/recovery-t007/e5-unverifiable-recorded.test.mjs
- build/recovery-t007/e6-portal-dependency.test.mjs
- build/recovery-t007/panel-verification.md
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/rounds/round-1.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/rounds/round-2.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/specs/m001.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/specs/m002.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/specs/m003.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/specs/m004.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/specs/m005.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/specs/m006.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/specs/m007.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/wave-1.cycle1.md
- plan/build-recovery-04d1b73711b6d70a0197d73083dbd9a9d6e3986f/review/wave-2.cycle1.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/rounds/panel-chrome-beta-gemma4.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/rounds/panel-chrome-beta-nano.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/rounds/panel-chrome-stable-nano.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/rounds/panel-edge-dev-aion.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/rounds/panel-edge-phi4mini.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/rounds/panel-verification.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/wave-1.cycle1.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/wave-2.cycle1.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/wave-3.cycle1.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/wave-4.cycle1.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/wave-5.cycle1.md
- plan/build-recovery-3bbfba8a1e608b57bfb163dad999fb15fbacdbdd/review/wave-6.cycle1.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/rounds/round-1.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/rounds/round-2.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/rounds/round-3.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/wave-1.cycle1.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/wave-2.cycle1.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/wave-3.cycle1.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/wave-4.cycle1.md
- plan/build-recovery-98e831cd86f9ee4f94d3247f016309242beb30c6/review/wave-5.cycle1.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- tasks/T001-author-lars-review-specs.md
- tasks/T002-first-review-round.md
- tasks/T003-regression-gate.md
- tasks/T004-fix-stale-docs.md
- tasks/T005-retire-s1-extension.md
- tasks/T006-final-rereview.md
- tasks/T007-panel-verification.md
- tasks/T008-author-ai-browser-coverage.md
- tasks/T009-correct-s16-meta-verdict.md
- tasks/T010-fix-sidecar-deps-bridge-junction-gates.md
- tasks/T011-bridge-main-world-state-event.md
- tasks/T012-align-state-message-contract.md
- tasks/T013-replace-vacuous-chain-spec.md
- tasks/T014-add-extension-prompt-reexport.md
- tasks/T015-fix-provenance-tracer-edge-shape.md
- tasks/T016-fix-agent-main-provider-record.md
- tasks/T017-rereview-after-patch-wave.md
- tasks/T018-panel-chrome-beta-nano.md
- tasks/T019-panel-chrome-beta-gemma4.md
- tasks/T020-panel-edge-dev-aion.md
- tasks/T021-panel-edge-phi4mini.md

## Notes

- none
