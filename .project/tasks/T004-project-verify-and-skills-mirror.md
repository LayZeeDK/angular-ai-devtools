---
id: T004
title: Run project Verify and the skills mirror test
wave: 4
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/skills-mirror.test.mjs
---

# T004 — Run project Verify and the skills mirror test

## Context

SC4 requires `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` to pass at the shipped head and the skills mirror test to be green. The mirror test compares `.commandcode/skills/` and `.claude/skills/` for `control-ai-browsers` and `verify-ai-browsers` (E6, N4). This is the final gate before ship.

## Approach

- Run the full project Verify in a fresh sidecar with no `node_modules` so dependencies are provisioned by the command itself.
- Run the skills mirror test to confirm the two trees are byte-identical.
- Do not edit product code in this wave; if a failure appears, route it back to the owning task rather than patching here.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` all pass at the shipped head (SC4).
2. `scripts/skills-mirror.test.mjs` passes, confirming the two skills trees are byte-identical (SC4, E6, N4).

## Verify

```bash
npm run check && npm test && npx nx run angular-ai-devtools:build-extension && node --experimental-strip-types --test scripts/skills-mirror.test.mjs
```

Heavy: yes

## Log

- created by planner