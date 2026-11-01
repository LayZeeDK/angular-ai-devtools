# Plan — Angular AI DevTools

<!-- Written by the planner role, repaired by the orchestrator after two gate
     failures (recorded in the STATE Log). Executed wave-by-wave by /gsd-path-build. -->

Project verify: `node --input-type=module -e "import {bridgeSidecarDeps,unlinkSidecarDeps} from 'file:///D:/projects/sandbox/angular-ai-devtools/scripts/sidecar-deps-bridge.mjs';bridgeSidecarDeps('.','D:/projects/sandbox/angular-ai-devtools');try{const {execSync}=await import('node:child_process');execSync('npm run check',{stdio:'inherit'});execSync('npm test',{stdio:'inherit'});execSync('npx nx run angular-ai-devtools:build-extension',{stdio:'inherit'});}finally{unlinkSidecarDeps('.')}"`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — corrections that invalidate nothing else

Goal: Make the `/stale-view` route assertion discriminate against its prefix-sibling in both directions, and replace the stale portal-commit claim with wording that cannot go stale.
Review depth: full

## Wave 2 — prove the interop claim and record the budget

Goal: Prove the interop claim still holds at this head — fingerprint fresh, live check green on a named instance, verdict committed — and settle the panel bundle budget with its measured size recorded so `build-extension` emits no unexplained warning.
Review depth: full

## Wave 3 — regenerate the audit at the shipped head and verify

Goal: Bring the docs audit to the milestone head under the delta rule with zero stale and zero aspirational claims and no M014 `fix-doc` row left `planned: no`, then prove the project Verify and the skills mirror at that head.
Review depth: full

## Surface contract

### DevTools panel — T003

Criteria: SC2

Entry: the extension's DevTools panel, "Interop" tab (N25), opened on a supported on-device instance and driven by `verify-ai-browsers/checks/interop.mjs`.

States:
- empty — the panel renders no slice node; the check must fail, never pass.
- loading — the panel route is mounted before the fixture's error effect runs; the check reports could-not-run, not a pass.
- error — the instance or the app is unreachable; the check exits could-not-run and names the instance.
- success — a `toSignal` slice with at least one node, the three stated limits, the "inferred, untested" attribution, and a non-empty answer.

Walkthrough:
1. Build the extension with `npx nx run angular-ai-devtools:build-extension` and serve `spikes/ng222-app`, whose `/stale-view-deferred` route carries both halves of the claim.
2. Drive a named instance with `node .commandcode/skills/verify-ai-browsers/checks/interop.mjs` and confirm the panel renders the slice and a non-empty answer.
3. Confirm the committed `verdict.json` records the named instance and `verdict: verified`.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1 |
| SC1 | T002 | AC2 |
| SC1 | T002 | AC3 |
| SC1 | T005 | AC1 |
| SC1 | T005 | AC2 |
| SC1 | T005 | AC3 |
| SC1 | T005 | AC4 |
| SC2 | T003 | AC1 |
| SC2 | T003 | AC2 |
| SC2 | T003 | AC3 |
| SC2 | T003 | AC4 |
| SC3 | T001 | AC1 |
| SC3 | T001 | AC2 |
| SC3 | T001 | AC3 |
| SC4 | T004 | AC1 |
| SC4 | T004 | AC2 |
| SC4 | T004 | AC3 |
| SC5 | T005 | AC5 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T005 | .project/research/DOCS-AUDIT.md |
| E3 | T005 | .project/research/DOCS-AUDIT.md |
| E6 | T001 | spikes/ng222-app/src/app/app.routes.test.mjs |

## Dependency notes

- T001 and T002 are wave 1 and independent: T001 edits the fixture route test, T002 edits two skill documents, and the two file sets are disjoint.
- T003 depends on T001 because the live interop drive serves a fixture whose `/stale-view-deferred` route the tightened assertion pins; proving the claim against an unpinned fixture would re-open what T001 closes.
- T004 is independent of T001-T003: it edits only `apps/angular-ai-devtools/project.json`, which no other task declares.
- T005 depends on T001-T004 because it brings the audit to the head those tasks produce: the corrected portal claim (T002), the route-test wording (T001), the interop verdict (T003) and the budget decision (T004) are all claims the regenerated audit must record.
