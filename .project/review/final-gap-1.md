# Gap Review — 1: the Aria, CDK and Material version lines can drift from the fixture's Angular, and a drifted fixture reads as a product defect.

Reviewed HEAD: 98f2410da0c0d71227d2ec4356eb7a1c51c9b46f
Gap verdict: blocked
Risk: the Aria, CDK and Material version lines can drift from the fixture's Angular, and a drifted fixture reads as a product defect.
Waves checked: 1, 2

## Checked evidence

- **Check**: Read INTENT.md, PLAN.md, all eight T00*.md task files and their logs, wave-1.cycle1.md and wave-2.cycle1.md; inspected spikes/ng222-app/package.json and package-lock.json peer ranges; read tests/held-out/fixture-rebuild-idempotent.test.mjs, fixture-explainers-unchanged.test.mjs, fixture-harness-action.test.mjs and harness-probe.ts; ran git log.
- **Observed**: SC1 harness subject exists (harness-probe.ts) with projected content inside root and equal sibling outside, two hosts identical except id, one alpha item and no absent item, advance button with rendered count state. SC2 surfaces and four aria rules present; mutation test isolates removal. SC3/E7 rebuild held-out test is a placeholder (only asserts fixture root and @angular/core exist, ends assert.ok(true)) and never performs the second build/serve comparison or single-version assertion. SC3/E6 explainer pin now real (T008). Component packages pinned at 22.2.5 while fixture Angular core resolves to 22.2.2; peer ranges accept ^22.0.0 so runtime-compatible, but this is a shipped skew against INTENT's "fixture's own Angular version is the reference" constraint. Prohibitions N1-N7: no panel adoption of aria/cdk/material found; no @angular/cdk/testing outside harness family; explainers unchanged (digests pinned).
- **Reference**: spikes/ng222-app/package.json:14-20; spikes/ng222-app/package-lock.json (core 22.2.2, aria/cdk/material 22.2.5 peerDependencies); tests/held-out/fixture-rebuild-idempotent.test.mjs:10-20; spikes/ng222-app/src/app/components/harness-probe.ts:1-22; .project/review/wave-2.cycle1.md:25.

## Finding

- **Found**: E7 (SC3 idempotency) is not actually verified: tests/held-out/fixture-rebuild-idempotent.test.mjs is a placeholder that only checks fixture root and @angular/core presence and ends in assert.ok(true); it never performs the second build/serve comparison or asserts one version of each component package and a single Angular at the fixture root. Also a shipped version skew: @angular/aria/@angular/cdk/@angular/material pinned at 22.2.5 while the fixture's Angular core resolves to 22.2.2; peer ranges make it runtime-compatible, but INTENT treats a drifted component-package line as a product defect and the milestone did not reconcile or report it as a plan defect.
- **Fix direction**: Implement E7 for real in tests/held-out/fixture-rebuild-idempotent.test.mjs (second build into two output dirs, byte-compare entry documents, assert one version of each of aria/cdk/material and a single @angular/core at the fixture root), and either bump the fixture's Angular core to a 22.2.5 line if published or record an explicit delegated ruling that 22.2.5 component packages are the lowest available line against the 22.2.2 core.