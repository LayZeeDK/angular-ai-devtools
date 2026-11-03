# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: blocked
Tasks reviewed: 4
Reviewed HEAD: d44b1cd02a61d0ef9968bfaca613f5e7563d78c7

## T004 — Declare the components page as a verification surface and record its proofs: pass

- ✅ `npm ci --include=dev && node --test .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs .commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs scripts/fixture-proof-fresh.test.mjs scripts/docs-audit-disposition.test.mjs scripts/skills-mirror.test.mjs` passed at 4ff0ea0 (verify ledger)
- ✅ control.mjs declares a `components` target with slot-0 port 4224 and `4600 + slot` above it, and portRowsOf('components') returns that row — confirmed in control.mjs:87-93 and control.test.mjs.
- ✅ No slot-0 port collides with another target's or with 4200, 4222, 4223, 3000 or 9999, asserted in control.test.mjs.
- ✅ `.claude` mirror is byte-identical (skills-mirror test green).

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T005 — Prove the shipped explainers unchanged, the fixture rebuild idempotent, and gate the head: fail

- ❌ E6: each of the four shipped explainers still answers on the fixture — the panel sources and their page-realm suppliers hash to the recorded base digests and the fixture still serves what they select, the counter at `/` and both stale-view routes — so the test reddens when either side moves (SC3, prohibition N2) — found: `tests/held-out/fixture-explainers-unchanged.test.mjs` declares `PINS` with only one entry (`n1-update-cause.component.ts`) and never compares any computed hash against it; the loop over `FILES` only calls `assert.ok(existsSync(...))` and logs the hash. An explainer source can be deleted or changed and the test stays green, which is exactly the placeholder defect the brief names.
  fix: populate `PINS` with a digest for each of the four explainer sources (n1, n2, n3, error-explainer) plus the page-realm suppliers the test claims to pin, and add `assert.equal(actual, PINS[rel])` inside the loop; re-read the constants from the test's own source and compare them too, per the task approach.
- ❌ The one-byte mutation test does not reddens the pin: it only asserts `sha256(mutated) !== sha256(original)`, which holds for any hash function regardless of the pin, and never mutates a pinned file on disk or asserts the suite fails. It is a tautology, not a falsifiability check.
  fix: make the mutation actually exercise the assertion (e.g. temporarily write the mutated bytes to a temp copy and assert the pin comparison throws), or remove the claim of a reddening mutation.
- ⚠️ The Verify command was not recorded as an orchestrator pass in the task Log (only "held-out tests created; node --test green; build-extension green"); the head gate at d44b1cd is the recorded evidence for SC4 and is judged sufficient for the gate itself, but not for the pin.

Warnings (non-blocking):
- `FILES` covers all four shipped explainers plus manifest and package.json, so the pinned *set* names the right files; the defect is that the set is never enforced.

Contract violations (blocking):
- none

## T006 — Reconcile the shared recordings M023 invalidated: pass

- ✅ `npm ci --include=dev; npm --prefix spikes/ng222-app ci --include=dev; node --test scripts/autonomy-gaps.test.mjs scripts/ng-context-dev-build.test.mjs scripts/overlay-verdict-claims.test.mjs scripts/docs-audit-disposition.test.mjs` passed at ec8eec0 (verify ledger, second run)
- ✅ The audit's descriptive list names `docs/autonomy-gaps.md` and its tally agrees, so `scripts/autonomy-gaps.test.mjs` passes.
- ✅ `research/raw/m022-ng-context.json` records the development and production bundles measured at this head, and `scripts/ng-context-dev-build.test.mjs` passes with that test unchanged.
- ✅ `scripts/overlay-verdict-claims.test.mjs` reads the archived M022 intent (`.project/archive/022-in-page-overlay/intent/INTENT.md`) rather than the current one, and its four assertions pass.
- ✅ `scripts/docs-audit-disposition.test.mjs` still passes.

Warnings (non-blocking):
- Pointing the overlay-verdict-claims test at the archived intent is the right root fix for an M022-scoped recording (the recording cites M022's SC1/SC2 and quotes them character for character), and it prevents a later milestone's criteria from reddening an unrelated pin. It does, however, decouple the test from the current intent: a future change to M022's archived intent would not be caught, and any new M023+ verdict-claim recording would need its own test. Recorded as a coupling risk, not a failure.

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

## Intent coverage

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ T004 declares the components page as a verification surface and records its proofs; T006 reconciles the shared recordings. The rebuild edge (E7) is covered by `fixture-rebuild-idempotent.test.mjs`. The explainer-unchanged edge (E6) is claimed by T005 but, as recorded above, the test does not enforce its pin — the SC itself is met at the head (explainers still answer), but the proof is not pinned.

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Recorded by the orchestrator at d44b1cd: 339 + 60 + 594 tests passing, plus `build-extension` at 532.47 kB. T007 restored the type-check chain; T006 restored the docs-audit and ng-context pins.

## Fixed since last cycle

- n/a (cycle 1)

## Summary for orchestrator

- blocked findings: T005's explainer pin is unenforced (placeholder test) — disjoint file scope `tests/held-out/fixture-explainers-unchanged.test.mjs`; fix by adding per-file `assert.equal(actual, PINS[rel])` and a real mutation check.
- repeat offenders: T005's first attempt already produced placeholder tests; the landed version still does not reddens on mutation.
- warnings worth a human eye: T006's archived-intent coupling; T005's missing orchestrator verify entry.