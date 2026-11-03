# Archive — 022-in-page-overlay

Milestone: in-page-overlay
Shipped: 2026-11-03
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 10 done / 10 total  Review cycles used: 1/1/1
Carried forward: 33 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The box tracks a picked element through scroll, zoom and a CSS transform, and the label names the element and its component. | met | extension/overlay-geometry.js; extension/overlay-geometry.test.mjs (E1, E2, E3 and their mutants); extension/overlay.js (five inputs, one dirty flag, one frame loop); extension/overlay.test.mjs (hover, lock, closed-root and style-write pins); research/raw/m022-pick-hop.json; research/raw/m022-hit-test.json; .project/plan/PLAN.md:37-52 (Surface contract); .project/review/wave-2.cycle1.md (T008); .project/review/wave-1.cycle1.md (T002) |
| Picking an element resolves to its owning component in the panel, including an element inside a component's view rather than at its host. | met | extension/agent-main.js:819-940; extension/agent-main.test.mjs:1155-1380 (E4, E5); extension/background.js:70-92; extension/relay.js:37-64; extension-message.service.ts:200-237,293-309; page-picker.component.ts:118-152,183-198; page-picker.component.spec.ts (18 tests); extension-message.service.spec.ts:379-511; scripts/ng-context-dev-build.test.mjs + research/raw/m022-ng-context.json (the T001 measurement behind the `no-dev-api` ruling); .project/review/final-gap-2.md; .project/review/wave-2.cycle1.md (T006, T007); .project/review/wave-3.cycle1.md (T009) |
| No `MutationObserver` owned by the tool observes the host subtree, asserted by a test that fails when the exclusion is removed. | met | extension/observer-filter.js:16-54; extension/observer-filter.test.mjs:151-205; extension/relay.js:68-83; extension/relay.test.mjs:94-116,216-270; extension/overlay.js:63-76; extension/overlay.test.mjs (SC3, E6); .project/review/wave-1.cycle1.md (T004); .project/review/wave-2.cycle1.md (T005); .project/research/SYNTHESIS.md decision 2 (the corrected SC3 shape) |
| The host is inserted exactly once per page load, asserted across a re-injection attempt. | met | extension/overlay.js:14-61; extension/overlay.test.mjs:375-418; extension/page-footprint.test.mjs:505-573; extension/relay.test.mjs:391-408; extension/manifest.json:18-34; extension/manifest.test.mjs:42-90; research/raw/m022-pick-hop.json; .project/review/wave-1.cycle1.md (T004); .project/review/wave-2.cycle1.md (T005); .project/review/wave-3.cycle1.md (T010) |
| The inspected page carries no Angular of the tool's own: the `ɵsetProfiler` list and the feature fingerprint read the same with and without the overlay installed. | met | extension/page-footprint.test.mjs:23-30,326-352,505-573; research/raw/m022-page-footprint.json; extension/overlay.test.mjs (source pins); .project/review/wave-3.cycle1.md (T010) |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl (entry for 649a400a47e82e3215c6c3500b57643ec398532c, exit 0); .project/review/final-gap-1.md; .project/tasks/T010-page-footprint-and-gates.md (Log); .project/review/wave-3.cycle1.md (T010) |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-exclusion.md
- research/evidence-pitfalls.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/final-gap-3.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- tasks/T001-ng-context-dev-build-probe.md
- tasks/T002-hit-test-probe.md
- tasks/T003-verdict-claim-list.md
- tasks/T004-observer-exclusion-and-marker-retirement.md
- tasks/T005-overlay-host-and-manifest-declaration.md
- tasks/T006-page-realm-resolution.md
- tasks/T007-picker-transport.md
- tasks/T008-overlay-rect-picker-and-lock.md
- tasks/T009-panel-picker-surface.md
- tasks/T010-page-footprint-and-gates.md

## Notes

- none
