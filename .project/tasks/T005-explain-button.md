---
id: T005
title: Explain button sends diff to panel Prompt API
wave: 2
deps: [T004]
status: done
agent: build_T005
base: 1d922025c08e440326cf232bab58dca53dc3f22e
worktree: null
task_branch: null
files:
  - src/panel/di-explain.ts
---

# T005

## Context
User clicks explain → panel sends ~200-token deterministic diff to panel-local Prompt API → display explanation. Explain button is sole trigger.

## Approach
Implement explain button and Prompt API call.

## Acceptance criteria
1. Explain button triggers panel-local Prompt API with ~200-token diff.

## Verify
```bash
node --experimental-strip-types --test scripts/di-explain.test.mjs
```

## Intent coverage
- SC4

## Log
- 2026-10-27 created

## Interface contract
None
- attested: owner
- 2026-10-27 implemented: buildDiExplainFacts caps at 15 facts; explain gated on Prompt API
