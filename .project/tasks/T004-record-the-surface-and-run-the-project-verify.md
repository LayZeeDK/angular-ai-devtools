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
  - research/raw/m047-surface.json
---

# T004 — Record the surface and run the project verify

## Context

The surface exists and its states are pinned. This task records what it renders, so a later reader
can tell what this milestone shipped without opening the browser, and runs the project verify at the
head that ships so a red build cannot reach ship.

## Approach

Record the `components` route, its loader key, its four states and the record field each state reads
into `research/raw/m047-surface.json`, then run `npm run check && npm test` at this head.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - research/raw/m047-surface.json

## Acceptance criteria

1. The recording names the route, the loader key and each state with the record field it reads, and every name in it exists at this head.
2. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/component-search.test.mjs && npm run check && npm test && npx prettier --check research/raw/m047-surface.json
```

## Log

- pending.
