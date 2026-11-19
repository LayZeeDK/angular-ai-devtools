---
id: T003
title: Render the three states and pin the route
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-webmcp.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - extension/panel/index.html
  - research/raw/m052-verdict-claims.json
---

# T003 — Render the three states and pin the route

## Context

The reading exists and refuses what it cannot read. The surface renders each tool with the name the API
reports and the description it reports, and `empty` distinct from `cannot-tell`. Every suite that
enumerates the route table must be declared before starting, not after a landing refuses: four suites
and the held-out fixture pin enumerate `apps/angular-ai-devtools/src/app/app.routes.ts` and the loader
map, so a new route moves what they assert.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-webmcp.ts`: a surface rendering each tool with the name and
description the API reports, `empty` distinct from `cannot-tell`, and a `LOADERS` key in
`apps/angular-ai-devtools/src/app/panel-demo.ts` plus a `PANEL_SURFACES` entry and its route in
`apps/angular-ai-devtools/src/app/app.routes.ts`. Update `app.spec.ts`,
`page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and `panel-demo.spec.ts` with the new
surface, and declare `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs` — read, not edited — so the route-table
enumerations are owned before they run. The verify's `npm test` leg reads
`research/raw/m052-verdict-claims.json`, which this task declares without editing.

## Intent coverage

- SC1
- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the working-tree
diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact.
The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never
through an edit.

## Files

  - apps/angular-ai-devtools/src/app/panel-webmcp.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - extension/panel/index.html
  - research/raw/m052-verdict-claims.json

## Acceptance criteria

1. The surface renders each declared tool with the name the API reports and the description it reports,
   and nothing it does not report; a mutant that renders a tool name from a DOM label reddens.
2. An exposed-but-empty list and an absent list render differently, and the absent case states the
   absence rather than rendering an empty list, an inferred signature or the word "none".
3. The route, its `LOADERS` key and its `PANEL_SURFACES` entry exist, and every route-table suite —
   `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
   `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
   `tests/held-out/fixture-explainers-unchanged.test.mjs` — is green at this head.
4. `npm test` exits 0 at this head, including the first leg that reads
   `research/raw/m052-verdict-claims.json`, which this task declares without editing.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm test && git checkout -- extension/panel/index.html && npx prettier --check apps/angular-ai-devtools/src/app/panel-webmcp.ts
```

## Log

- pending.
