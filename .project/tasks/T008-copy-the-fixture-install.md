---
id: T008
title: Copy the fixture install into a verify sidecar
wave: 6
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/ensure-sidecar-deps.mjs
---

# T008 — Copy the fixture install into a verify sidecar

## Context

T007 bridged `spikes/ng222-app/node_modules` with `bridge()`, which creates a **junction**. In a verify sidecar that makes
every path below the fixture resolve into the **primary** checkout, while the suite's own `createRequire` against the
sidecar's fixture root resolves into the sidecar. Three assertions compare those two roots and fail:

```
measured through the junction: D:/projects/.../packages/ai-devtools-companion
measured from the sidecar:     C:/Users/.../verify/project-verify/packages/...
```

Both values are correct; they describe different roots. The recordings are innocent - they already store
`../../packages/ai-devtools-companion`. The defect is the junction, and it is mine: T007 introduced it.

The fixture's dependency resolution is itself under test (`preserveSymlinks` is the whole subject of `facade-dev-build`), so
a bridge that makes two roots look like one answers the question the suite is asking.

## Approach

Copy the fixture install into the sidecar with `cpSync(..., { recursive: true, dereference: false })` so the fixture's own
relative symlink survives as a symlink and resolves inside the sidecar. Guard it: only when the primary has the install and
the sidecar does not, and never over an existing directory.

## Interface contract

## Files

- `scripts/ensure-sidecar-deps.mjs`

## Acceptance criteria

1. held-out E1: a sidecar without a fixture install receives a copy whose entries are real files, and the fixture's own relative symlink is preserved (held-out E1)
2. held-out E2: a primary without a fixture install is left alone and the script exits 0 (held-out E2)
3. an existing fixture install in the sidecar is never overwritten
4. the project Verify's peer-resolution assertions pass in a sidecar

## Verify

```bash
node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs" && node --experimental-strip-types --test "scripts/ng-context-dev-build.test.mjs" && npx prettier --check scripts/ensure-sidecar-deps.mjs
```

## Intent coverage

- SC6 — the project Verify passes in the sidecar the pipeline uses

## Log

- dispatched
