---
id: T005
title: Run the project verify at the final head
wave: 5
status: in-progress
deps: []
agent: build_T005
base: 917f1fadd0d84023f5a1d8c5535ec6c325ebd961
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
- scripts/m069-verdict-claims.test.mjs
- research/raw/m069-verdict-claims.json
---

# T005 — Run the project verify at the final head

## Context

The project verify is the only run that proves the milestone did not break the build it measures, and it must run from a landing that changes nothing the recordings count. Every milestone that skipped that ordering paid a red verify for it.

## Approach

Capture this milestone's verdict claims, run the plan's project verify unchanged, and record its exit and counts. This landing adds no suite and changes no stylesheet, so the recordings T004 re-derived stay true.

## Intent coverage

- SC4

## Acceptance criteria

1. The record names one claim per intent criterion quoting each verbatim, and one row per edge of the intent's table, with every citation re-resolved at this head.
2. The project verify runs at this head and exits 0, and its stage-by-stage outcome and test counts are recorded in this task's Log with the command that produced them.
3. This landing adds no suite and changes no stylesheet, so the census and the stability record stay true at this head.

## Files

Every path this task may touch, and nothing else:

- `scripts/m069-verdict-claims.test.mjs`
- `research/raw/m069-verdict-claims.json`

## Interface contract

Byte-identical across the tasks that share it:

```css
/* apps/angular-ai-devtools/src/styles.css — one token block, before every rule */
:root {
  --ds-density-*: ...;
  --ds-color-*: ...;
  --ds-type-*: ...;
  --ds-motion-*: ...;
}
```

Every rule that renders a panel value reads a token; the token block precedes the rules that read it.

## Verify

```bash
node --test scripts/m069-verdict-claims.test.mjs && node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test
```

## Log

- pending
