---
id: T008
title: Run the project Verify and the skills-mirror test
wave: 4
deps: [T007]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/skills-mirror.test.mjs
---

# T008 — Run the project Verify and the skills-mirror test

## Context

SC4 requires `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` and `scripts/skills-mirror.test.mjs` to pass at the shipped head, including both a cold and a warm Nx cache run (E7). The two `.claude` skill trees must stay byte-identical to their `.commandcode` counterparts where the mirror test applies (N4). No test is skipped, weakened or deleted (N4).

## Approach

- Run the full project Verify in the sidecar and re-confirm on the primary worktree with both a cold and a warm Nx cache.
- Keep the skills-mirror parity green.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` and `node --test scripts/skills-mirror.test.mjs` pass at the shipped head (SC4).
2. Both a cold and a warm Nx cache run of the Verify pass (E7).
3. No test is skipped, weakened or deleted (N4).

## Verify

```bash
node --test scripts/skills-mirror.test.mjs && npm run check && npm test && npx nx run angular-ai-devtools:build-extension
```

Heavy: yes

## Log

- created by planner