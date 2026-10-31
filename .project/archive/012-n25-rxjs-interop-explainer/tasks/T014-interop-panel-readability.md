---
id: T014
title: Give the interop panel readable structure
wave: 3
deps: [T004, T012]
status: done
agent: build_T014
base: 352572adae099a270b47d0110ad54d4150ef1105
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/interop.component.ts
  - extension/panel/index.html
---

# T014 — Give the interop panel readable structure

## Context

Read on screen 2026-10-31 against chrome-stable-nano: the panel shows one blob,
`Cannot name the feeding Observable, the operator chain, or emission timing.cmp:_StaleViewFixtureapp-stale-view-fixtureinferred, untested`.
Every field in a slice is an inline `<span>` inside one `<div>`, so the limit sentence, the node
id, the source label and the attribution run together with no separator and no label. The check
passes because it reads each test id individually, so this defect is invisible to it.

## Approach

Keep every existing `data-testid` and the element type that carries it, and give each field its
own block with a visible label, so the panel reads as a list rather than a sentence fragment.
Join producer and consumer ids with a comma and a space. Do not change what is displayed, only
its structure.

## Interface contract

- None

## Intent coverage

- SC2

## Acceptance criteria

1. Each slice renders the limit, the node id, the source label, the producers, the consumers and the attribution in separate labelled blocks, so the rendered text contains whitespace between them.
2. Every existing `data-testid` value still exists: `interop-slice`, `interop-limit`, `interop-node`, `source-node`, `producer`, `consumer`, `interop-inferred`, `explain`.
3. `node --experimental-strip-types --test apps/angular-ai-devtools/src/app/interop-slice.spec.ts apps/angular-ai-devtools/src/app/interop-attribution.spec.ts` stays green.

## Verify

```bash
node --experimental-strip-types --test apps/angular-ai-devtools/src/app/interop-slice.spec.ts apps/angular-ai-devtools/src/app/interop-attribution.spec.ts && npm run check && npx nx run angular-ai-devtools:build-extension && echo retained apps/angular-ai-devtools/src/app/interop.component.ts
```

Heavy: none
Held-out: none

## Log

- pending
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T014): pass, exit 0; output tail:
  ```
  [37mOutput location: C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T014\extension\panel
  [39m
  
  [2m[32m[39m[22m
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mbuild-extension[22m for project angular-ai-devtools and [1m1[22m task it depends on[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 2 tasks.[22m
  
    Run duration:      349ms
    Cache:             1/2 hit (50%)
    Critical path:     297ms (2 tasks)
    Recoverable time:  <1ms
  retained apps/angular-ai-devtools/src/app/interop.component.ts
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```
- 2026-10-31 — orchestrator regression Verify of T004 (isolate gsd-path-task/T014): pass, exit 0; output tail:
  ```
  [39m[22m
  [37mOutput location: C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T014\extension\panel
  [39m
  
  [2m[32m[39m[22m
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mbuild-extension[22m for project angular-ai-devtools and [1m1[22m task it depends on[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 2 tasks.[22m
  
    Run duration:      226ms
    Cache:             1/2 hit (50%)
    Critical path:     179ms (2 tasks)
    Recoverable time:  <1ms
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```
