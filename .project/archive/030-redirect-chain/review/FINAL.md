# Final Review — M030 redirect-chain

Reviewed HEAD: 2a4f6614095d038b85d157559bceea80b00292d2
Overall verdict: pass

<!-- Both gap lenses passed. Lens 2 made the walk carry the guard's identity and the suite reddened with
`'[fn redirectGuard]'` where `true` was expected, so N2 is enforced rather than asserted. -->

## Success criteria

### SC1 — On the fixture, a route that redirects produces an RTR-1 finding naming the requested path, each route the walk entered, and the destination, in the order the configuration declares them.

- **Verdict**: met
- **Check**: `node --test scripts/redirect-chain.test.mjs` and `node --test scripts/router-config-capture.test.mjs`
- **Observed**: 8 pass and 6 pass, 0 fail, 0 skipped. On the recorded configuration the walk enters the routes in
  declaration order, names the destination, and marks exactly one route as the first to change it; the 12-entry
  capture names `redirectTo`, `canActivate` and `loadChildren` exactly as the fixture declares them
- **Reference**: `extension/redirect-chain.js`; `research/raw/m030-router-config.json`; T001 `0895a7f`, T002 `b68cb56`
- **Finding**: the chain reports what the configuration declares, in the order it declares it, and stops at a lazy
  boundary rather than describing the unloaded chunk (N3).
- **Fix direction**: none

### SC2 — The walk reads `Router.config` through `window.ng`'s injector, with no new page-side instrumentation, no router event subscription and no patch of the router.

- **Verdict**: met
- **Check**: the module's inputs, and the capture's provenance
- **Observed**: the walk reads the configuration it is handed and nothing else; the recording carries the browser
  build, URL, timestamp and the exact commands, and states that the injector resolved on `app-landing-page`
- **Reference**: `scripts/router-config-capture.test.mjs`; N1
- **Finding**: nothing was patched and no router event was subscribed to. The configuration arrives through the same
  `window.ng` injector hook the page agent already reads eight others from.
- **Fix direction**: none

### SC3 — A configuration whose walk revisits a route produces a cycle finding naming the repeated route, rather than walking forever; a route whose entry is gated is reported as gated, without naming what the guard decided.

- **Verdict**: met
- **Check**: the cycle and gated paths, and the lens-2 mutant
- **Observed**: a revisiting configuration yields `cycle` naming the repeated route and stops; a `canActivate` entry
  yields `gated: true`; making the walk carry the guard's identity printed `'[fn redirectGuard]'` where `true` was
  expected and the suite reddened
- **Reference**: `scripts/redirect-chain.test.mjs`; N2
- **Finding**: a gate is reported as presence, never as a decision. The mutant is the milestone's own prohibition,
  enforced by a test rather than stated in prose.
- **Fix direction**: none

### SC4 — The panel renders the walked chain and marks the first route that changed the destination, and shows the cycle and gated states.

- **Verdict**: met
- **Check**: `scripts/panel-redirect.test.mjs` and the route pin
- **Observed**: 9 pass; the `gated` state asserts the rendered text never matches `allowed|denied|decided`; marking
  every change reddens it with `expected 1 marked, got 3`
- **Reference**: `apps/angular-ai-devtools/src/app/panel-redirect.ts`; T003 `f64b771`
- **Finding**: the surface marks the first change and only that one, and names no cause.
- **Fix direction**: none

### SC5 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `workflow_run.py prepare-final`
- **Observed**: exit 0 in 11m04s at `2a4f6614` after four failures — a stale recording, a mutable test artifact, fixed
  capture ports, an unobserved teardown, and an `EPERM` on a locked temp directory
- **Reference**: `.project/build/evidence.json`
- **Finding**: both gates pass at the head. None of the five failures was in the feature; every one was in the
  machinery that certifies it.
- **Fix direction**: none

## Any expected failures

None at the head. Two observations are carried rather than hidden:

**Two skill trees can drift silently.** `scripts/skills-mirror.test.mjs` enforces byte-identical copies for
`control-ai-browsers` and `verify-ai-browsers` only. T009 had to change
`control-pangular-inspector`'s suite in both `.commandcode/skills` and `.claude/skills`, and the wave-7 reviewer
confirmed that removing the change from one copy leaves both suites green — nothing compares them.

**One wave's reviewer could not run its own evidence.** The wave-1 bridged its suites nowhere: it reported T001's
capture failing 2/2 because it never installed the fixture's dependencies, and its artifact still records a pass. The
suite passes (2/2 twice at the head), but that review is not the evidence for it.

## Observations outside the criteria

**Nine tasks, two of them the feature.** T001-T003 build the fixture, the walk and the surface. T004-T009 exist because
the ship gate, run five times, found a different latent defect each time:

1. `companion-dev-build.json` had been stale since M021 (T005 — which refuted my hypothesis that T004 had measured
   leftovers in a reused output directory; a clean build emits the same three bundles).
2. `npm test` rewrote `research/raw/m030-router-config.json` on every run, so the suite was not idempotent (T006).
3. Capture suites bound fixed ports, so the nested E4 run collided with itself (T007).
4. The capture teardown passed with the teardown removed — unenforced, and now asserted (T008).
5. A control-skill temp-directory teardown raised `EPERM` under load; `force` suppresses `ENOENT`, not a held handle
   (T009).

The feature code has not changed since wave 1. That is the milestone's real finding: this repository's verification
layer carried five latent defects that only a full-suite gate exercised twice could surface, and it deserves its own
milestone rather than another run of one-fatal-at-a-time repairs.
