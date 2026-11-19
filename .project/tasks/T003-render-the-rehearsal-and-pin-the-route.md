---
id: T003
title: Render the rehearsal surface and pin the route
wave: 3
status: done
deps: [T002]
agent: build_T003
base: 4ff784078f798669639faf2f8af0a0e2792f434d
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts
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
---

# T003 — Render the rehearsal surface and pin the route

## Context

The awaited reading and the rehearsal join exist and refuse what they cannot answer. The surface renders
each of the four states the join answers, and every suite that enumerates the route table must be
declared before starting, not after a landing refuses: five suites enumerate
`apps/angular-ai-devtools/src/app/app.routes.ts` and the loader map, so a new route moves what they
assert — the allow-list lesson that cost M052 two landings and the undeclared route-table suite that
cost five milestones a cycle each. One of the five is also an editor here: `scripts/gate-integrity.test.mjs`'s
suite-diff reason table is an allow-list that refuses a new suite by name, and waves 1 and 2 added two.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts`: a surface rendering the four states —
`rehearsed` naming the tool the model chose by the name the awaited list reported beside the result the
tool returned, `no-model` naming why with no choice and no result, `refused` naming the tool's own
refusal with no result rendered in its place, and `unavailable` echoing the reading's own reason — plus
a `LOADERS` key and a `FACTS` sample in `apps/angular-ai-devtools/src/app/panel-demo.ts` (the join's own
answer for a measured rehearsal, held to the shipped `rehearse` by `panel-demo.spec.ts` field for
field) and a `PANEL_SURFACES` entry and route in `apps/angular-ai-devtools/src/app/app.routes.ts`.
Update `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and
`panel-demo.spec.ts` with the new surface, and declare `scripts/panel-routes.test.mjs`,
`scripts/component-search.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs` — read, not edited — so the route-table
enumerations are owned before they run. Edit `scripts/gate-integrity.test.mjs` only to append the two
declared reason rows its suite-diff table needs for `scripts/webmcp-execute-tool.test.mjs` and
`scripts/webmcp-rehearsal.test.mjs`, never to loosen a check. The pane's own sentences are not entered
in `extension/copy-digest.json`, which this task does not own; the gap is recorded here and in the task
Log for T004, which re-measures the copy record over every surface on disk.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the working-tree
diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact.
The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never
through an edit.

## Files

  - apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts
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

## Acceptance criteria

1. The surface renders a rehearsal that ran as the tool the model chose — named by the name the awaited
   list reported — beside the result the tool returned, carried through as returned and nothing the tool
   did not return; a mutant that renders a choice for a rehearsal that never ran reddens.
2. `no-model`, `refused` and `unavailable` render as three distinct states, each naming why in its own
   sentence with no result beside it; a refusal never renders a result, a paraphrase or an
   empty-rehearsal sentence in its place, and the no-model absence is the same absence on a second run.
3. The route, its `LOADERS` key and `FACTS` sample and its `PANEL_SURFACES` entry exist, and every
   route-table suite — `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
   `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
   `tests/held-out/fixture-explainers-unchanged.test.mjs` — is green at this head.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && node --experimental-strip-types --test scripts/panel-routes.test.mjs scripts/component-search.test.mjs && npx nx run angular-ai-devtools:test --skip-nx-cache && git checkout -- extension/panel/index.html
```

## Log

- pending.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
