---
id: T002
title: Walk the configuration with a cycle guard
wave: 1
status: done
deps: [T001]
agent: build_T002
base: 0895a7ffbb837decd0469871b70ca0c43796b543
worktree: null
task_branch: null
files:
  - extension/redirect-chain.js
  - scripts/redirect-chain.test.mjs
---

# T002 — Walk the configuration with a cycle guard

## Context

T001 records the shape `Router.config` actually has when read through the injector. This task builds the walk
against that recording rather than against an assumed array of route objects.

## Approach

Pure module. Given a configuration and a requested path, it walks: follows `redirectTo`, records each entered
route in declaration order, stops at a `loadChildren` boundary, reports a `canActivate` entry as gated without
saying what the guard decided, and names the repeated route when the walk revisits one. It reads the
configuration it is given and adds no reader of its own (N1).

## Interface contract

None

## Files

- `extension/redirect-chain.js`
- `scripts/redirect-chain.test.mjs`

## Acceptance criteria

1. A redirecting configuration yields the entered routes in declaration order, the destination, and the first route that changed it (held-out E1).
2. With the injector read removed, no chain is produced, so nothing else supplied the configuration (held-out E2).
3. A configuration that revisits a route yields a cycle naming the repeated route and stops (held-out E3).
4. Mutants redden: walking past a lazy boundary, naming a guard's decision, and recursing forever on a cycle.

## Verify

```bash
npm ci --include=dev; node --test scripts/redirect-chain.test.mjs
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
- T002 redirect-chain module and tests added; suite 5/5 pass
