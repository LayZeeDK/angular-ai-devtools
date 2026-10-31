---
id: T016
title: Split node:test suites from the Angular unit-test pattern
wave: 4
deps: [T004, T012]
status: pending
agent: null
base: null
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
