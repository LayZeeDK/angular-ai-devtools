---
id: T001
title: Ship provisional context-budget constants and the chunking rule
wave: 1
deps: []
status: done
agent: build_T001
base: f8a93e80245d14d724842f389522252adb062a01
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/context-budget.ts
  - apps/angular-ai-devtools/src/app/context-budget.spec.ts
---

# T001 — Ship provisional context-budget constants and the chunking rule

## Context

M019 has no context budget anywhere: the panel keeps its answer as one unbounded string. This task introduces a single module of named constants (the provisional caps from the proposals) plus a chunking rule that keeps a fact list inside them. The caps stay provisional until S15 runs; nothing here raises a cap to make a fixture fit.

## Approach

- One new module exports named constants only: CHUNK_TOKEN_CAP (2000), CHAT_PROMPT_CAP (about 5), REDUCE_TOKEN_CAP (about 5400), plus the 3.6 caps (system prompt about 120 tokens, tool descriptions under about 200 chars, results 200 chars per page string and 20 items per array, error template up to 10 valid values). No other module defines these.
- A pure chunking helper splits a fact list into chunks of at most CHUNK_TOKEN_CAP tokens and reports the chunk count; an oversized list is chunked, never silently truncated.
- No dependency is added; the module imports only from the standard library.
- The panel initial bundle is already 535.44 kB against a 520 kB maximum warning, so this module must not add a dependency that grows it.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. The module exports CHUNK_TOKEN_CAP, CHAT_PROMPT_CAP, REDUCE_TOKEN_CAP and the 3.6 caps as named constants, each with the provisional value.
2. A fact list over the cap is split into multiple chunks, each at most CHUNK_TOKEN_CAP tokens, and the reported chunk count equals the number of chunks produced.
3. No cap is raised to make an oversized fact list fit; the helper never silently truncates.
4. The module imports no third-party dependency.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts
```

Heavy: no

## Log

- created by planner
- Implemented `apps/angular-ai-devtools/src/app/context-budget.ts`: the eight provisional caps (CHUNK_TOKEN_CAP 2000, CHAT_PROMPT_CAP 5, REDUCE_TOKEN_CAP 5400, SYSTEM_PROMPT_TOKEN_CAP 120, TOOL_DESCRIPTION_CHAR_CAP 200, RESULT_PAGE_STRING_CHAR_CAP 200, RESULT_ARRAY_ITEM_CAP 20, ERROR_VALID_VALUES_CAP 10), one documented token approximation (`estimateTokens`: one token per `CHARS_PER_TOKEN` = 4 UTF-16 code units, rounded up, single-sourced so the packing and an assertion cannot disagree) and the pure `chunkFacts` helper. It packs facts greedily and order-preserving — none reordered, shortened or dropped — into chunks whose joined-text estimate stays inside CHUNK_TOKEN_CAP, and returns `{ chunks, chunkCount, chunkTokens }` with `chunkCount === chunks.length`. A single fact that alone exceeds the cap is refused by name (index + estimate, `RangeError`) instead of being split, dropped or fitted by a raised cap. The module has no import statement at all, so no dependency reaches the 535.44 kB initial bundle.
- Semantics read from `.project/research/evidence-pitfalls.md` and `evidence-spike-limits.md`: CHAT_PROMPT_CAP is prompts per chat answer (about five, because the Prompt API evicts the oldest pairs and a chat that fans out loses its question); REDUCE_TOKEN_CAP is the fold step's budget. Every cap stays provisional until S15 runs; none was moved.
- Spec `apps/angular-ai-devtools/src/app/context-budget.spec.ts`: 12 vitest tests — cap values, exact export surface, numbers/functions/plain-frozen surface only, estimate boundaries, empty and under/at/over-cap splitting, `chunkCount === chunks.length` at five list sizes with every chunk inside the cap, fan-out equal to the input list (no truncation, no reordering), oversized-fact refusal with the cap unchanged, purity and frozen results.
- Verify: `npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts` ran and passed, exit code 0, `Tests 12 passed`, `Cache: 0/1 hit` — at the canonical worktree path `C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T001`. The `wt\M019-T001` junction (same directory) cannot run this target: Nx and `@angular/build` resolve the junction to that real path and the vitest setup entry `init-testbed.js` is then looked up under the wrong id (`Cannot find module '/@id/.../init-testbed.js'`); it reproduces on the untouched `anti-pattern-detector.spec.ts`, so it is the junction spelling, not this diff. Panel type check `npx tsc -p apps/angular-ai-devtools/tsconfig.check.json` also exits 0.
- AC4 is a source-level property (no import statement, visible at the top of the module); the spec asserts the runtime half in-process, since the unit-test target runs in a browser context where `node:fs` is unavailable — an `import` of node:fs was tried and removed for that reason.
- ready
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T001): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      36ms
    Cache:             1/1 hit (100%)
    Critical path:     1ms (1 task)
    Recoverable time:  <1ms
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts
  ```
