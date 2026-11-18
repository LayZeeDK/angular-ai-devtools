---
id: T004
title: Record the surface and run the project verify
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m049-surface.json
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

# T004 — Record the surface and run the project verify

## Context

The surface exists and its states are pinned. This task records it, keeps the copy check honest about
the surface it now has to explain, and runs the project verify at the head that ships.

## Approach

Three things in order. First, re-measure `research/raw/m048-surface-copy.json` over the surfaces now on
disk, including `panel-interaction-story.ts`, and author its sentences into `extension/copy-digest.json`
from the source — never from a rendered string, because a digest authored from the render agrees with
the render by construction. Keep the copy suite's counts derived from the record. Second, record the
`interaction-story` route, loader key and each state with the report field it reads into
`research/raw/m049-surface.json`. Third, re-derive both gate recordings and run the project verify.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m049-surface.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs

## Acceptance criteria

1. The copy record covers every surface on disk including the new one, and the digest explains every sentence it records, with `scripts/copy-check.test.mjs` green at counts derived from the record.
2. The recording names the route, the loader key and each state with the report field it reads, and every name in it exists at this head.
3. Both gate recordings are re-derived at this head and `scripts/gate-integrity.test.mjs` is green unarmed afterwards.
4. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/copy-check.test.mjs && node --test scripts/gate-integrity.test.mjs && npm run check && npm test && npx prettier --check research/raw/m049-surface.json
```

## Log

- pending.
