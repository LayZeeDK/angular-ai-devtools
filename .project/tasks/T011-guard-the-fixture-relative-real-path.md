---
id: T011
title: Guard the fixture-relative real path
wave: 9
status: done
deps: [T009]
agent: orchestrator-serial
base: 5805f8d4852066fa0726ca1964c923b43573b51c
worktree: null
task_branch: null
files:
  - scripts/facade-dev-build.test.mjs
---

# T011 — Guard the fixture-relative real path

## Context

`facade-dev-build.test.mjs` asserts that the package's real path, taken relative to the fixture, equals the recorded
`../../packages/ai-devtools-companion`. In a verify sidecar the root `node_modules` is a junction into the primary
(T007), so `realpathSync` resolves to `D:\...` while the fixture lives on `C:`. `path.relative` across two drives
returns an **absolute** path, so the measured value can never equal the relative recorded one. Measured at `7d9eb14`:
this is the only remaining failure of ~835 tests, at line 944.

## Approach

Extend the existing `VERIFY_SIDECAR` guard to this assertion, naming the junction and the cross-drive `path.relative`
in the skip reason. Do not normalise the two forms into agreement: the recording's relative form is the property under
test in a root checkout.

## Interface contract

None

## Acceptance criteria

1. held-out E1: on the verify branch the assertion is skipped with a diagnostic naming the reason, and the suite
   passes; on any other branch it runs unchanged.
2. The guard count in the file becomes four and no other assertion changes.

## Verify

```bash
node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs" && npx prettier --check scripts/facade-dev-build.test.mjs
```

## Intent coverage

- SC6: AC1

## Log

- dispatched
- 2026-11-08 - implemented; the fixture-relative real path is guarded on the verify branch, four guards total, node --check and Prettier clean. Verdict: ready.
