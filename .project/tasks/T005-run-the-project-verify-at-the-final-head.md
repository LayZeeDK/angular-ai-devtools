---
id: T005
title: Run the project verify at the final head
wave: 5
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/m069-verdict-claims.test.mjs
- research/raw/m069-verdict-claims.json
---

# T005 — Run the project verify at the final head

## Context

The project verify is the only run that proves the milestone did not break the build it measures, and it must run from a landing that changes nothing the recordings count. Every milestone that skipped that ordering paid a red verify for it.

## Approach

The census is **per milestone**, which measurement settled after a wrong guess: `scripts/guard-verdict-claims.test.mjs`
refuses at this head rather than writing M069's record — it is M063's census and says so — and the milestones beside it
each own one (`m067-verdict-claims.test.mjs`, `m068-verdict-claims.test.mjs`). So this task writes
`scripts/m069-verdict-claims.test.mjs` on the previous milestone's shape: one claim per intent criterion quoting it
verbatim, one row per edge of the held-out table, the milestone derived from the branch STATE binds so the suite cannot
be captured against another milestone, and `M069_CAPTURE=1` as the only write. Then the record, then the project verify.

## Approach (the earlier draft)

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
M069_CAPTURE=1 node --test scripts/m069-verdict-claims.test.mjs && node --test scripts/m069-verdict-claims.test.mjs && node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test
```

## Log

- pending
