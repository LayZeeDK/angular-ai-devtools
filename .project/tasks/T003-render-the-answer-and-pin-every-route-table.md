---
id: T003
title: Render the answer and pin every route table
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-teardown-leak.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - extension/copy-digest.json
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/panel-copy.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/component-search.test.mjs
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - research/raw/m059-surface.json
---

# T003 — Render the answer and pin every route table

## Goal

The panel surface that renders T002's answer, its demo loader, its digest rows, and every suite that
enumerates those tables — added in one task, because five earlier milestones each lost a gate cycle to a
pin declared in a later task (plan D3).

## Context

The panel carries 28 surfaces at this head (`PANEL_SURFACES`). Each surface has a route, a `LOADERS` key,
a `FACTS` key and digest rows, and the suites that enumerate them are `app.spec.ts`,
`page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`
and `scripts/panel-copy.test.mjs`. The pane renders only what T002 returns: the code, the message body and
the two named absences.

## Approach

`panel-teardown-leak.ts` renders four states and nothing inferred: `finding` shows the code and the body
and, only when the join filled it, the owner; `absent` names the code it searched for and the count it
read; `cannot-tell` names the reason the record states; `empty` states that no record was read. Both
absences render as their own lines. Then the route, the loader key, the facts key, the digest rows and the
five enumerating suites move together, and `research/raw/m059-surface.json` records the surface's name,
route, loader key, states and sentences.

## Interface contract

T002 publishes `teardownLeak(records)` with the shape T002 states. T003 publishes the route
`teardown-leak` in `PANEL_SURFACES` through the shared `loadPanelDemo` closure, the `LOADERS` key
`'teardown-leak'`, the exported `teardownLeakPanel`, the pane's sentences in `extension/copy-digest.json`
with its hash re-derived, and the surface record `research/raw/m059-surface.json` whose `route`,
`loaderKey`, `states` and `sentences` fields T004's claims record cites.

## Intent coverage

- SC1
- SC3
- SC6

## Acceptance criteria

1. SC1: the pane renders `finding` with the code and body, and renders `owner-not-in-the-message` beside
   the code when the join returned no owner; a mutant that hides the code reddens.
2. SC3: the pane renders the release-then-diagnostic sequence as two statements and never joins them into
   a cause; a mutant that renders "the subscription leaked" reddens.
3. SC6: nothing in this task writes to the inspected page — no page global, no DOM node, no listener — and
   the panel is the only surface that changed; a mutant that registers a page-side hook reddens.
4. The route table, `LOADERS`, `FACTS`, the digest and all five enumerating suites move in this commit;
   `scripts/panel-routes.test.mjs` fails naming the surface when a `LOADERS` key is missing.
5. `research/raw/m059-surface.json` states the surface's route, loader key, states and sentences, and its
   numbers match the tree at this head.

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/panel-copy.test.mjs scripts/after-render-fixture.test.mjs && npx prettier --check apps/angular-ai-devtools/src/app/panel-teardown-leak.ts apps/angular-ai-devtools/src/app/app.routes.ts extension/copy-digest.json research/raw/m059-surface.json && npm run check
```

## Log

- pending.
