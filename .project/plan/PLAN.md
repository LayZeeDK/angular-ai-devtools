# Plan — M030 redirect-chain

Milestone: redirect-chain
Branch: gsd-path/M030

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the subject and the walk

Goal: The fixture has no redirect, guard or lazy route, so SC1's subject must be created before anything can be walked. T001 adds the routes and records what `Router.config` actually yields through `ng.getInjector` — the measurement that decides whether the walk in T002 is possible at all. T002 then walks that configuration: following `redirectTo`, stopping at a lazy boundary, reporting a gated entry as gated, and naming the repeated route when the walk revisits one.

Review depth: full

T001 and T002. A fixture with a redirect, a gated route, a lazy route and a cycle, and a pure walk over the configuration
it produces, with a cycle guard and no claim about what a guard decided.

## Wave 2 — the surface and the recordings

Goal: T003 renders the walked chain and marks the first route that changed the destination, beside the cycle, gated and cannot-tell states. T004 re-records everything the new routes invalidate: both control-skill feature manifests, the panel's route-list pin, the dev-build recording, and the M030 verdict claims.

Review depth: full

T003 and T004. The panel shows the chain and its marked change; every recording the fixture change staled is re-recorded
through its own tooling and proved by reverting one field.

## Wave 3 — the two recordings that disagree

Goal: The ship Verify found `facade-dev-build` and `ng-context-dev-build` recording the same development build with different bundle lists. T005 rebuilds both from cleared output paths and either reconciles the lists or records why they differ.

Review depth: full

T005. Both development-build recordings are re-measured from clean output, and the two suites that read them both pass.

## Wave 4 — the suite that rewrites its own recording

Goal: The ship Verify's E4 edge found `npm test` mutating a tracked artifact: T001's capture rewrites `research/raw/m030-router-config.json` on every run, changing its `capturedAt`. T006 makes the suite read-only by default and keeps the capture behind an explicit opt-in, so a normal run leaves the tree untouched.

Review depth: full

T006. The capture suite reads by default and captures only on request, and two consecutive runs leave the tree clean.

## Wave 5 — the capture suites must be re-runnable

Goal: E4 runs the whole suite nested, and the capture suites bind fixed port defaults, so a server that outlives its suite makes the next nested run collide. T007 makes each suite choose a free port at run time and prove in a `finally` that the port is free before it ends, so a suite can run twice back to back and beside another suite.

Review depth: full

T007. Both capture suites bind a free port, tear down their server in a `finally`, and pass when run twice in a row.

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/redirect-chain.test.mjs |
| E2 | T002 | scripts/redirect-chain.test.mjs |
| E3 | T002 | scripts/redirect-chain.test.mjs |
| E4 | T003 | scripts/panel-redirect.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC5 | T004 | AC4 |
| SC5 | T005 | AC3 |
| SC5 | T006 | AC3 |
| SC5 | T007 | AC3 |

## Prohibitions

| Prohibition | Task | Enforcement |
|---|---|---|
| N1 | T002 | reads `Router.config` once through the injector hook; no router subscribe, no patch, no second instrumentation |
| N2 | T002 | a gated entry is reported as gated; no guard decision, no stated reason for a redirect |
| N3 | T001 | a lazy boundary ends the walk; nothing describes what the unloaded chunk declares |
| N4 | T003 | the surface renders the chain and the marked change only |
| N5 | T004 | the gate runs at the head, unweakened |
| N5 | T005 | each build is measured from a cleared output path; leftovers are never recorded as build output |
| N5 | T006 | a default test run never writes to a tracked file |
| N5 | T007 | no case is skipped or hung to reach green; a suite that cannot re-run is a defect, not a flake |

## Surface contract

### panel — T003

Criteria: SC4
Entry: open the panel, select the redirect finding produced for the fixture route added in T001; the same surface is
reachable from the tool group's router row.
States: empty shows an explicit "cannot tell" state naming that the router configuration could not be read; loading shows
the chain being walked rather than an empty list; error shows that the walk stopped at a lazy boundary, naming the route
where it stopped; success shows each route the walk entered in declaration order with the first route that changed the
destination marked. No state names what a guard decided or why a redirect happened.
Walkthrough:
1. Load the fixture's redirecting route, open the panel, and confirm the chain names each entered route in order and the destination.
2. Confirm the first route that changed the destination is marked, and only that one.
3. Point the surface at a configuration whose walk revisits a route and confirm it shows the cycle state naming the repeated route.
4. Confirm a gated route is shown as gated, with no statement about what its guard decided.
5. Confirm the surface adds no DOM to the inspected page.

## Dependencies

- T002 depends on T001's recording: the walk is built against what `Router.config` actually yields, not against an assumed shape.
- T003 depends on T002: the surface renders what the walk produces.
- T004 depends on T001 and T003: the new routes and the new panel route are what stale the recordings.
