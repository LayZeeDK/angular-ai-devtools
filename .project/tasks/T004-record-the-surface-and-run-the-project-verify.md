---
id: T004
title: Record the surface and run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m048-surface.json
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
---

# T004 — Record the surface and run the project verify

## Context

The surface exists and its states are pinned. This task records what it renders, so a later reader
can tell what shipped without opening the browser, and runs the project verify at the head that
ships.

## Approach

Record the `copy-check` route, its loader key, its three states and the report field each state
reads into `research/raw/m048-surface.json`, citing `path:line` for every name. Re-derive both
recordings with their capture commands as the last step before the verify, then run the project
verify at this head.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - research/raw/m048-surface.json
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json

## Acceptance criteria

1. The recording names the route, the loader key and each state with the report field it reads, and every name in it exists at this head.
2. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npm run check && npm test && npx prettier --check research/raw/m048-surface.json
```

## Log

- pending.
