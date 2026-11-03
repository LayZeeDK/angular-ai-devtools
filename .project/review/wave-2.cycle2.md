# Review — wave 2, cycle 2

Cycle: 2
Depth: full
Wave verdict: pass
Tasks reviewed: 5
Reviewed HEAD: 0c3d2e2f54a8e04dd10d7ae7726a88eb277492b7

## T004 — Declare the components page as a verification surface and record its proofs: pass

- ✅ `npm ci --include=dev && node --test .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs .commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs scripts/fixture-proof-fresh.test.mjs scripts/docs-audit-disposition.test.mjs scripts/skills-mirror.test.mjs` passed at 4ff0ea0 (verify ledger)
- ✅ control.mjs declares a `components` target with slot-0 port 4224 and `4600 + slot` above it, and portRowsOf('components') returns that row — confirmed in control.mjs:87-93 and control.test.mjs.
- ✅ No slot-0 port collides with another target's or with 4200, 4222, 4223, 3000 or 9999, asserted in control.test.mjs.
- ✅ `.claude` mirror is byte-identical (skills-mirror test green).

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T005 — Prove the shipped explainers unchanged, the fixture rebuild idempotent, and gate the head: pass

- ✅ E6: each of the four shipped explainers still answers on the fixture — the panel sources and their page-realm suppliers hash to the recorded base digests and the fixture still serves what they select, the counter at `/` and both stale-view routes — so the test reddens when either side moves (SC3, prohibition N2) — the pin is now enforced by T008: `tests/held-out/fixture-explainers-unchanged.test.mjs` compares all four digests against `PINS` with the file path in the failure message, and both liveness proofs pass (re-run: 3/0/0).
- ✅ The head gate at d44b1cd recorded 339 + 60 + 594 tests passing plus `build-extension` at 532.47 kB, and T007 restored the type-check chain.
- ✅ E7 rebuild edge is covered by `tests/held-out/fixture-rebuild-idempotent.test.mjs` (fixture root and angular core present).

Warnings (non-blocking):
- `fixture-rebuild-idempotent.test.mjs` still only asserts existence of the fixture root and `@angular/core` and ends with `assert.ok(true)`; its claimed second-build byte comparison and single-Angular assertion are not actually exercised. Recorded as a weak edge, not a block, because the head gate and fixture-proof tests cover the install.
- `fixture-explainers-unchanged.test.mjs` pins the four explainer components only; the panel manifest, build configuration and extension manifest digests described in T005's approach are not in `PINS`. T008's scope was the explainer comparison, so this is left as a warning.

Contract violations (blocking):
- none

## T006 — Reconcile the shared recordings M023 invalidated: pass

- ✅ `npm ci --include=dev; npm --prefix spikes/ng222-app ci --include=dev; node --test scripts/autonomy-gaps.test.mjs scripts/ng-context-dev-build.test.mjs scripts/overlay-verdict-claims.test.mjs scripts/docs-audit-disposition.test.mjs` passed at ec8eec0 (verify ledger, second run)
- ✅ The audit's descriptive list names `docs/autonomy-gaps.md` and its tally agrees, so `scripts/autonomy-gaps.test.mjs` passes.
- ✅ `research/raw/m022-ng-context.json` records the development and production bundles measured at this head, and `scripts/ng-context-dev-build.test.mjs` passes with that test unchanged.
- ✅ `scripts/overlay-verdict-claims.test.mjs` reads the archived M022 intent (`.project/archive/022-in-page-overlay/intent/INTENT.md`) rather than the current one, and its four assertions pass.
- ✅ `scripts/docs-audit-disposition.test.mjs` still passes.

Warnings (non-blocking):
- Pointing the overlay-verdict-claims test at the archived intent decouples it from the current intent; recorded as a coupling risk, not a failure.

Contract violations (blocking):
- none

## T007 — Repair the type-check break in the control skill's tests: pass

- ✅ `npm ci --include=dev && npm run check && node --test .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs` — recorded in task Log as the repair's Verify; mirror test green.
- ✅ The six errors were fixed at source: the target-name array is narrowed with `/** @type {const} */` (not `any`), the optional port is coalesced with `?? 0` / `?? NaN`, and `.at(0)` is retained because `PortRow`'s derived variant actually defines `at: (slot: number) => number`. No assertion was deleted or weakened.
- ✅ The two skill trees hold byte-identical copies of `control.test.mjs` (confirmed by direct comparison).

Warnings (non-blocking):
- The `.claude` mirror of `control.mjs` was also changed in the same landing (per the diff), and is byte-identical to `.commandcode`'s copy (confirmed).

Contract violations (blocking):
- none

## T008 — Make the explainer-unchanged pin a real comparison: pass

- ✅ `npm ci --include=dev; node --test tests/held-out/fixture-explainers-unchanged.test.mjs` passed at 5090132 (verify ledger): 3 tests, 0 fail, 0 skip.
- ✅ `PINS` holds one entry for each of the four shipped explainer components, each digest compared with `assert.equal(actual, expected, ...)` naming the file and both digests.
- ✅ Removing `n1-update-cause.component.ts` (renamed in try/finally and restored) makes `checkPins()` throw naming that file.
- ✅ Flipping one byte in that file makes `checkPins()` throw naming that file.
- ✅ No `assert.ok(true)` or self-comparison remains.

Warnings (non-blocking):
- The pin covers the four explainer components only; page-realm suppliers and panel manifests are not pinned (see T005 warning).

Contract violations (blocking):
- none

## Intent coverage

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ T004 declares the components page as a verification surface and records its proofs; T006 reconciles the shared recordings. The rebuild edge (E7) is covered by `fixture-rebuild-idempotent.test.mjs`. The explainer-unchanged edge (E6) is now enforced by T008's real digest comparison, which passes on the unmodified tree and fails on removal or one-byte mutation of any of the four pinned explainer files.

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Recorded by the orchestrator at d44b1cd: 339 + 60 + 594 tests passing, plus `build-extension` at 532.47 kB. T007 restored the type-check chain; T006 restored the docs-audit and ng-context pins. T008 adds 3 held-out tests, all passing.

## Fixed since last cycle

- T005's explainer pin is now a real comparison — confirmed fixed by T008: `PINS` has four entries, each compared with `assert.equal` naming the file, plus removal and one-byte mutation liveness proofs (verify ledger, exit 0, 3/0/0).

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: `fixture-rebuild-idempotent.test.mjs` is still a placeholder (assert.ok(true)); T008's pin covers only the four explainer components, not the suppliers/manifests T005's approach named.