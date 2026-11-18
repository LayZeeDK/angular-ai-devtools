---
id: T004
title: Record the surface, capture the claims record and run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m050-surface.json
  - research/raw/m050-verdict-claims.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T004 — Record the surface, capture the claims record and run the project verify

## Context

The surface exists and its states are pinned. This task records it, keeps the copy check honest about
the surface it now explains, captures the verdict-claims recording the project verify reads, and runs
the verify at the head that ships.

## Approach

Four things in order. First, re-measure `research/raw/m048-surface-copy.json` over the surfaces on
disk including `panel-dead-click.ts`, and author its sentences into `extension/copy-digest.json` from
the source — never from a rendered string. Second, record the `dead-click` route, loader key and each
state with the report field it reads into `research/raw/m050-surface.json`. Third, capture
`research/raw/m050-verdict-claims.json` with its own command
(`set "M044_CAPTURE=1"&& node --experimental-strip-types --test scripts/navigation-blocking.test.mjs`),
which eight navigation-blocking tests and two overlay tests read and which no task declared in M047,
M048 or M049. Fourth, re-derive both gate recordings as the last step, then run the project verify.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - research/raw/m050-surface.json
  - research/raw/m050-verdict-claims.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. The copy record covers every surface on disk including the new one, and the digest explains every sentence it records, with `scripts/copy-check.test.mjs` green at counts derived from the record.
2. The recording names the route, the loader key and each state with the report field it reads, and every name in it exists at this head.
3. `research/raw/m050-verdict-claims.json` exists and was written by its capture command, not by hand.
4. Both gate recordings are re-derived at this head and `scripts/gate-integrity.test.mjs` is green unarmed afterwards.
5. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/copy-check.test.mjs && node --test scripts/gate-integrity.test.mjs && node --experimental-strip-types --test scripts/navigation-blocking.test.mjs && npm run check && npm test
```

## Log

- pending.
