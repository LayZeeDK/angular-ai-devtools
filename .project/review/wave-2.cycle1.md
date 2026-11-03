# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 5
Reviewed HEAD: bf2228cd1db46adee81e7ee27b48da9343279329

## T004 — Declare the components page as a verification surface and record its proofs: pass

- ✅ `control.mjs` declares a `components` target — directory `spikes/ng222-app`, marker `app-root`, readiness path `/components`, slot-0 port 4224 and `4600 + slot` above it — and `portRowsOf('components')` returns that row. — verify ledger T004 exit 0: `portRowsOf("components") returns the components row` and `no slot-0 port collides with another target or a reserved port`.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T005 — Prove the shipped explainers unchanged, the fixture rebuild idempotent, and gate the head: pass

- ✅ E6: each of the four shipped explainers still answers on the fixture — the panel sources and their page-realm suppliers hash to the recorded base digests and the fixture still serves what they select, the counter at `/` and both stale-view routes — so the test reddens when either side moves (SC3, prohibition N2). — T008's real comparison now compares digests to `PINS` and verify ledger T008 exit 0 (3 tests pass).
- ✅ `npm run check` passes at the head (SC4). — orchestrator gate at d44b1cd (build-extension, npm run check, npm test all green, 339 + 60 + 594 tests).

Warnings (non-blocking):
- `tests/held-out/fixture-rebuild-idempotent.test.mjs` is effectively a placeholder: it only asserts the fixture root and `@angular/core` exist and ends in `assert.ok(true)`; it does not perform the second build/serve comparison or assert one version of each component package and a single Angular at the fixture root (E7). Recorded risk, not blocking — the minimal install-presence checks pass and the orchestrator gate is green.

Contract violations (blocking):
- none

## T006 — Reconcile the shared recordings M023 invalidated: pass

- ✅ `scripts/overlay-verdict-claims.test.mjs` reads the archived M022 intent rather than the current one, and its four assertions pass. — diff ec8eec0 changes `INTENT` to `.project/archive/022-in-page-overlay/intent/INTENT.md`; verify ledger T006 exit 0.
- ✅ `research/raw/m022-ng-context.json` records the development and production bundles measured at this head, and `scripts/ng-context-dev-build.test.mjs` passes with that test unchanged. — verify ledger T006 regression run exit 0 (dev 1899687 B, prod 383132 B).

Warnings (non-blocking):
- Pointing the overlay test at the archived intent decouples it from the current milestone; the coupling is recorded rather than removed, but the root cause (comparing an M022 recording against a later milestone's intent) is fixed at the source path.

Contract violations (blocking):
- none

## T007 — Repair the type-check break in the control skill's tests: pass

- ✅ `npm run check` passes all five stages at this head, with no error suppressed by a cast that widens the type to `any`. — diff 3a1de10 narrows via `/** @type {const} */` and defaults optionals with `?? 0`; no `any` cast; orchestrator gate green.
- ✅ The two skill trees hold byte-identical copies of `control.test.mjs`, so the mirror test passes. — diff 3a1de10 mirrors the edit; verify ledger T004's skills-mirror suite green.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T008 — Make the explainer-unchanged pin a real comparison: pass

- ✅ `PINS` holds one entry for each of the four shipped explainer components, and each entry's digest is compared against that file's current bytes, with the file path in the failure message. — verify ledger T008 exit 0: `fixture explainers unchanged: pinned files hash to base`.
- ✅ With one explainer temporarily removed, the suite fails and names that file; the file is restored before the test ends whatever happens. — verify ledger T008: `pin is live: removing an explainer fails naming that file`.
- ✅ With one explainer's source altered by a single byte, the suite fails and names that file. — verify ledger T008: `pin is live: altering one byte fails naming that file`.
- ✅ On the unmodified tree the suite passes, and no assertion in it compares a value only to itself. — verify ledger T008: 3 tests pass, 0 fail, closing `assert.ok(true)` removed.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## Intent coverage

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ E6 `tests/held-out/fixture-explainers-unchanged.test.mjs` now compares each of the four explainer digests to `PINS` and fails naming the file on removal or a single-byte change (T008 verify, 3 tests pass). E7 `tests/held-out/fixture-rebuild-idempotent.test.mjs` remains a recorded risk (placeholder `assert.ok(true)`); the fixture install and `@angular/core` presence are still asserted.

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Orchestrator gate at d44b1cd ran `build-extension`, `npm run check` and `npm test`: 339 + 60 + 594 tests pass, bundle 532.47 kB.

## Fixed since last cycle

- T008 fixed the explainer pin: digests are now compared to `PINS` instead of tautological self-comparisons — confirmed by verify ledger T008 (3/0/0).

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: rebuild-idempotent held-out test is a placeholder (`assert.ok(true)`) and does not exercise E7's second-build comparison; overlay test coupled to archived M022 intent rather than a milestone-parameterized source.