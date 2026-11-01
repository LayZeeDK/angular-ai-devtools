# Review — wave 1, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 1

## T001 — Add a deferred-error stale-view fixture route in spikes/ng222-app: pass

- ✅ `spikes/ng222-app/src/app/app.routes.ts` registers the new deferred fixture route in addition to the existing `/stale-view` route. — evidence: app.routes.ts:6-7 shows `{ path: 'stale-view', component: StaleViewFixture }` and `{ path: 'stale-view-deferred', component: StaleViewDeferredFixture }`; commit 5c30b77 stat shows only the three declared files plus the task Log.
- ✅ The new fixture keeps the `subject.error` token inside the effect's debuggable source so `isInteropNode` Rule 2 still matches. — evidence: stale-view-deferred-fixture.ts:23-27 effect body contains `this.subject.error(new Error('interop'))`; interop-keep-list.ts:28 regex `/(?<![A-Za-z0-9_$])subject\.error(?![A-Za-z0-9_$])/` matches the `subject.error` substring of `this.subject.error`.
- ✅ The Subject is not errored before the panel attaches (deferral via a signal, timer, or explicit trigger), so a slice can be captured. — evidence: stale-view-deferred-fixture.ts:16 `readonly trigger = signal(false);` and lines 23-27 `effect(() => { if (this.trigger()) { this.subject.error(...); } });`, so the initial effect run is a no-op; error only fires via `triggerError()` (lines 34-36).
- ✅ `spikes/ng222-app/src/app/app.routes.test.mjs` exists and asserts both routes are present. — evidence: app.routes.test.mjs:11-21; recorded Verify `node --experimental-strip-types --test spikes/ng222-app/src/app/app.routes.test.mjs` → 3 tests, 3 pass, 0 fail (exit 0), per task Log and `.git/gsd-path/dispatch/gsd-path-M014/T001/attempt-1/verify.json`.

Warnings (non-blocking):
- app.routes.test.mjs:19 `/stale-view/` regex also matches the deferred path `stale-view-deferred`; the assertion still disambiguates via `StaleViewFixture` (line 20), so this is a weak-but-passing check rather than a failure. Tightening the regex to `/['"]stale-view['"]/` would make E3-relevant coverage explicit.

Contract violations (blocking):
- none

Edge/prohibition coverage (wave 1):
- E3 (ordering): deferral keeps `subject.error` from running on construction, so the Subject is alive at panel-attach time; the check will report observed state rather than a smoothed slice. Evidence: stale-view-deferred-fixture.ts:16,23-27.
- N2 (no interop component/keep-list behaviour change): interop-keep-list.ts and the interop component are not in commit 5c30b77's changed-file set (stat lists only the task file and the three declared spike files); no portal change, no new panel tab, and the existing `/stale-view` route remains (app.routes.ts:6).

## Intent coverage

- None — T001 owns no INTENT success criterion (`- None` in its Intent coverage). It delivers the dev-only deferred fixture route that the SC1 live proof in wave 2 drives.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: app.routes.test.mjs `/stale-view/` regex is loose (matches the deferred path); consider tightening in a later wave if E3 coverage is wanted.
