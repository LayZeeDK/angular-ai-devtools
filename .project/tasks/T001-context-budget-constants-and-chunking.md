---
id: T001
title: Ship provisional context-budget constants and the chunking rule
wave: 1
deps: []
status: pending
agent: null
base: null
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