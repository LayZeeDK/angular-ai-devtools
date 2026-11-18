---
id: T003
title: Render the story states and pin the route and loader they add
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-interaction-story.ts
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
---

# T003 — Render the story states and pin the route and loader they add

## Context

T002 produces the narration. This task renders it: a surface at route `interaction-story` that shows
the steps in the measured order, each naming its stream and quoting its event, and reports
`cannot-tell` with its reason when the streams are empty or share no order.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-interaction-story.ts` rendering `steps` and `cannot-tell`,
its route, its `interaction-story` key in `panel-demo.ts` `LOADERS`, and update every suite that
enumerates the route table. Prove the loader-key mutant reddens naming the surface, then restore it.

## Intent coverage

- SC1
- SC2

## Interface contract

`interactionStory(record)` receives the page record and returns `{ state, steps, cannotTell, reason }`.
`state` is one of `steps`, `cannot-tell`; `steps` is an array of `{ stream, at, fields }` in the
measured order, where `fields` are the event's own recorded values and never a paraphrase; `at` is the
comparable field when one was measured, and `null` otherwise. `cannotTell` names what was missing — an
empty stream, all streams empty, or streams that share no order — and `reason` is a member of a closed
set exported by the module. No other file implements this function, and no caller reads the page.

## Files

  - apps/angular-ai-devtools/src/app/panel-interaction-story.ts
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

## Acceptance criteria

1. The route renders `steps` and `cannot-tell`, and every suite that enumerates the route table names it.
2. Removing the loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and writes only what the narration states.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-interaction-story.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs scripts/component-search.test.mjs scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs
```

## Log

- pending.
