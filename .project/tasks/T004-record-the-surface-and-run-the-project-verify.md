---
id: T004
title: Record the surface and run the project verify
wave: 4
status: pending
deps:
  - T003
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m051-surface.json
  - research/raw/m051-verdict-claims.json
  - scripts/copy-check.test.mjs
  - extension/error-digest.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m044-gate-shapes.json
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/console-join.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - scripts/legacy-diagnostic-capture.test.mjs
  - scripts/lint-core.test.mjs
  - scripts/lint-observability.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/panel-render-phase.test.mjs
  - scripts/copy-to-agent.test.mjs
  - scripts/router-diagnostic-capture.test.mjs
  - extension/panel/index.html
---

# T004 — Record the surface and run the project verify

## Context

Every shipped surface carries a recorded statement of what it renders and which report field it reads, and
`scripts/copy-check.test.mjs` re-reads every citation in that record. `research/raw/m050-verdict-claims.json`
is the shape M050 captured; this task leaves the same record for `what-changed`.

## Approach

Record the route, the loader key and each of the three states with the report field it reads; re-measure the
copy record and digest so the new surface's sentences are explained; capture the verdict claims record;
re-derive both gate recordings; run the whole suite and the project verify at the head that ships. Nothing
here adds behaviour.

## Interface contract

None

## Files

  - research/raw/m051-surface.json
  - research/raw/m051-verdict-claims.json
  - scripts/copy-check.test.mjs
  - extension/error-digest.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m044-gate-shapes.json
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/console-join.test.mjs
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - extension/panel/index.html

## Acceptance criteria

1. The surface record names the route, the loader key and each state with the field it reads, and `scripts/copy-check.test.mjs` re-reads every citation, reddening when one is made stale.
2. `research/raw/m051-verdict-claims.json` parses and names each claim with the code path that produces it.
3. `npm test` passes at the head, and both gate recordings re-derive rather than being hand-edited.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Intent coverage

- SC1

## Log

- pending.
