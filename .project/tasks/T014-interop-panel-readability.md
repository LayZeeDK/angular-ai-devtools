---
id: T014
title: Give the interop panel readable structure
wave: 3
deps: [T004, T012]
status: pending
agent: null
base: null
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
