---
id: T016
title: Split node:test suites from the Angular unit-test pattern
wave: 4
deps: [T004, T012]
status: done
agent: build_T016
base: b055aef863733de92f7a98af6ac00d7a409e02e3
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/project.json
  - apps/angular-ai-devtools/tsconfig.spec.json
  - apps/angular-ai-devtools/src/app/interop-slice.spec.ts
  - apps/angular-ai-devtools/src/app/interop-attribution.spec.ts
  - apps/angular-ai-devtools/src/app/interop-slice.node.test.ts
  - apps/angular-ai-devtools/src/app/interop-attribution.node.test.ts
---

# T016 — Split node:test suites from the Angular unit-test pattern

## Context

The project Verify fails at the reviewed head: `npm test` runs `nx run angular-ai-devtools:test`,
whose builder scans `src/**/*.spec.ts` and compiles each match into the test bundle. T004 and T012
added two `node:test` suites under that pattern, so the bundle cannot resolve `node:test` and
`node:assert/strict` (TS2591) and the run exits 1. Measured 2026-10-31. No task Verify ran
`npm test`, which is why the failure surfaced only at ship.

## Approach

Give each runner its own pattern. Rustle the two suites to `*.node.test.ts`, pin the unit-test
builder to `**/*.spec.ts`, and exclude `src/**/*.node.test.ts` from the test compilation unit. The
node suites keep running through `node --experimental-strip-types --test`, which is how T004 and
T012 verify them.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `npx nx run angular-ai-devtools:test` collects only `*.spec.ts` and exits 0.
2. `node --experimental-strip-types --test apps/angular-ai-devtools/src/app/interop-slice.node.test.ts apps/angular-ai-devtools/src/app/interop-attribution.node.test.ts` stays green.
3. The project Verify `npm run check && npm test && npx nx run angular-ai-devtools:build-extension` exits 0.

## Verify

```bash
npm run check && npm test && npx nx run angular-ai-devtools:build-extension && echo retained apps/angular-ai-devtools/project.json
```

Heavy: none
Held-out: none

## Log

- pending
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T016): pass, exit 0; output tail:
  ```
  
    Run duration:      813ms
    Cache:             1/2 hit (50%)
    Critical path:     767ms (2 tasks)
    Recoverable time:  <1ms
  retained apps/angular-ai-devtools/project.json
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
- 2026-10-31 — orchestrator regression Verify of T004, T012 (isolate gsd-path-task/T016): fail, exit 1; output tail:
  ```
  Could not find 'apps/angular-ai-devtools/src/app/interop-slice.spec.ts, apps/angular-ai-devtools/src/app/interop-attribution.spec.ts'
  ```
