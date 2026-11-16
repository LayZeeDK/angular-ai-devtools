---
id: T007
title: Record the surface and run the project verify
wave: 5
status: pending
deps: [T002, T004, T005, T006]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m046-surface.json
  - scripts/copy-to-agent.test.mjs
---

# T007 — Record the surface and run the project verify

## Context

A milestone ships what it recorded and verified at the head it ships, and the earlier tasks each proved one
piece. This task derives the surface record and runs the project verify last, so a red build cannot reach ship.

## Approach

Derive `research/raw/m046-surface.json` from the shipped tree, pin it, and run the project verify
(`npm run check && npm test`) at the head that ships.

## Intent coverage

- SC1 — AC1, AC2

## Interface contract

None

## Files

  - research/raw/m046-surface.json
  - scripts/copy-to-agent.test.mjs

## Acceptance criteria

- AC1 The record is derived from this tree, and a default run writes no byte.
- AC2 The project verify passes at the head this task lands.

## Verify

```bash
node --test scripts/copy-to-agent.test.mjs
npm run check
npm test
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
