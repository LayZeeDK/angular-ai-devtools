---
id: T008
title: Run the project Verify and the skills-mirror test
wave: 4
deps: [T007]
status: done
agent: build_T008
base: 6a69bdbfedd060dae49167ceb1ac39e0e78092d6
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
- 2026-10-31 - implementation: ran the project Verify (skills-mirror, check, test, build-extension) twice; both runs exit 0; Verify: node --test scripts/skills-mirror.test.mjs && npm run check && npm test && npx nx run angular-ai-devtools:build-extension -> exit 0
- 2026-10-31 — orchestrator Verify (sidecar gsd-path-verify/task-t008-verify): pass, exit 0; output tail:
  ```
  [2mNx read the output from the cache instead of running the command for 1 out of 2 tasks.[22m
  
    Run duration:      212ms
    Cache:             1/2 hit (50%)
    Critical path:     164ms (2 tasks)
    Recoverable time:  <1ms
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills && npm run test:app
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  npm notice run test:app
  npm notice run npx nx run angular-ai-devtools:test
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```
