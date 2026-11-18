---
id: T003
title: Render the states and pin the route
wave: 3
status: pending
deps:
  - T002
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-what-changed.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - research/raw/m051-verdict-claims.json
  - extension/panel/index.html
---

# T003 — Render the states and pin the route

## Context

T002's judgement exists and nothing renders it. Every panel surface reaches the route table through the
shared `PANEL_SURFACES` list and the one mapped route literal (`app.routes.ts:30-148`), and nine suites
enumerate that table — the shape that made M050's wave 5 fail after landing on four suites.

## Approach

Add the surface component, its `LOADERS` key and its `PANEL_SURFACES` entry, then update every suite that
enumerates the route table. Build, measure the panel's initial total, restore the tracked `index.html`, and
run the whole suite rather than a hand-picked subset.

## Interface contract

None

## Files

  - apps/angular-ai-devtools/src/app/panel-what-changed.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
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

## Acceptance criteria

1. The route renders each of the three states, and the `cannot-tell` state names both that the record carries no page identity and that the binding is the panel's own tab, and `scripts/panel-routes.test.mjs` reddens naming a surface whose loader key is missing.
2. The whole suite passes at the head, with `scripts/component-search.test.mjs` green in the same run — the suite M050's fourth Verify leg omitted.
3. The panel's initial total stays at or below the 535.44 kB baseline, measured from a build this task ran.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm test && git checkout -- extension/panel/index.html && npx prettier --check apps/angular-ai-devtools/src/app/panel-what-changed.ts
```

## Intent coverage

- SC1
- SC2

## Log

- pending.
