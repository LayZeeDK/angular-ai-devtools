---
id: T004
title: Run project Verify and the skills mirror test
wave: 4
deps: [T003]
status: done
agent: build_T004
base: f0fae2cd7101d2f6e307d943e71fa07213dbd487
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
- 2026-10-31: `npm run check` exit 0 (tsc + check:skills green); `npm test` exit 0 (node tests 590/590 pass; skills 2/2; app 46/46); `npx nx run angular-ai-devtools:build-extension` exit 0 (build success, budget warning only); `node --experimental-strip-types --test scripts/skills-mirror.test.mjs` exit 0 (2/2 pass). RESULT: ready — all four commands exit 0 — node 590/590, skills 2/2, app 46/46, mirror 2/2
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 517.25
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
