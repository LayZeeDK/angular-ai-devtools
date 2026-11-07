---
id: T007
title: Bridge the fixture install in a verify sidecar
wave: 5
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/ensure-sidecar-deps.mjs
  - scripts/sidecar-deps-bridge.test.mjs
  - scripts/facade-dev-build.test.mjs
---

# T007 — Bridge the fixture install in a verify sidecar

## Context

`prepare-final` failed at the project Verify with three `facade-dev-build` cases red and one message repeated:

`the development-build proof cannot run: the fixture install is absent (spikes/ng222-app/node_modules); run npm --prefix spikes/ng222-app ci --include=dev`

The suite is right to fail rather than skip, and the cause is a gap in the bridging script rather than in the suite.
`scripts/ensure-sidecar-deps.mjs:33` calls `bridge(cwd, primary)`, which links only the worktree's own
`node_modules` (`scripts/sidecar-deps-bridge.mjs:129-175`). The fixture has a **second, nested install** at
`spikes/ng222-app/node_modules`, which no sidecar receives, so every suite that measures the fixture's own dependency graph
fails inside a verify sidecar while passing in the primary checkout.

That is why the gate is red at a head where the same command is green in the primary: nothing in the product is wrong.

## Approach

After bridging the worktree root, bridge the fixture install the same way when the primary has one and the sidecar does not,
reusing `bridge()` unchanged so the same idempotence, same-target and refuse-a-real-directory guarantees apply. Fail soft when
the primary has no fixture install, because a checkout that never installed the fixture must keep working.

## Interface contract

`resourceLifecycle(fact)` returns `{ state: "finding" | "cannot-tell", resource?, status?, params?, reason? }`, where
`reason` is one of `no-resource`, `labels-unreadable`, `params-unavailable`, `status-unavailable`. T003 consumes the same
shape; both tasks must carry this line unchanged.

## Files

- `scripts/ensure-sidecar-deps.mjs`
- `scripts/sidecar-deps-bridge.test.mjs`
- `scripts/facade-dev-build.test.mjs`

## Acceptance criteria

1. held-out E1: a sidecar without a fixture install gets one bridged to the primary's when the primary has one, and a second run reuses it rather than failing (held-out E1)
2. held-out E2: a primary without a fixture install is left alone, and the script still exits 0 (held-out E2)
3. the bridge refuses to overwrite a real directory at the fixture path, as it does for the root
4. `facade-dev-build` passes in a sidecar whose fixture install was bridged, and still fails by name when it was not

## Verify

```bash
node --experimental-strip-types --test "scripts/sidecar-deps-bridge.test.mjs" && node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs"
```

## Intent coverage

- SC6 — the project Verify can pass in the verify sidecar that the pipeline actually uses

## Log

- dispatched
