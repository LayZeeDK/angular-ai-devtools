---
id: T005
title: Collapse the panel surface routes into one factory so the eager bundle fits the baseline
wave: 5
status: pending
deps:
  - T004
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-bundle-budget.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - .project/review/BUNDLE-PROBE.md
  - extension/panel/index.html
---

# T005 — Collapse the panel surface routes into one factory so the eager bundle fits the baseline

## Context

`prepare-final` refused at head `1aab785f`: the panel's initial bundle is 535,465 B against the
535,440 B baseline recorded before this milestone, 25 B over. The gate was green in the primary
checkout for three milestones because it measures whatever build sits in `extension/panel`, which is
git-ignored apart from `index.html`, and the build sets `outputHashing: none` — so a stale build
persists and reads as current. A fresh `npx nx run angular-ai-devtools:build-extension` in the primary
reproduces the failure the sidecar reported. Evidence and both measurements:
`.project/review/BUNDLE-PROBE.md`.

The cause is route-table drift, and two measurements pin it. The stale output the primary measured was
a build of `ddb91a1a` — rebuilt in a separate clone it reproduces `main.js` at exactly 101,084 B, which
is the size the primary held before this session's rebuild. Six route-pinning commits sit between that
build and HEAD (the last three are M048's, M049's and this milestone's surface), and `main.js` grew from
101,084 B to 101,482 B across them: the route table lives in the entry chunk, so a surface's record and
its loader arrow are eager bytes even though its component is lazy. The route *object* is what carried
those bytes: twenty entries under `loadPanelDemo` are the same
`{ path, loadComponent, data: { surface } }` with `path` and `data.surface` holding one string each
(`app.routes.ts:47-236`), so every surface has cost its own copy of the property names and of the
minifier's per-entry renames.

M041's task that held the panel bundle inside its baseline repaired the identical duplication one layer
down, collapsing thirteen copies of one 77-byte lazy closure into a single `loadPanelDemo`; the closure
is shared today (`app.routes.ts:14-15`) and the objects are not.

The honest repair is to give those bytes back, not to raise the constant: declare the surface names
once and map them over one object literal. Every route keeps its path, its order and its
`data.surface`, so the suites that enumerate the table keep reading the same shape, and
`loadPanelDemo` stays the only reference to the demo module so the lazy boundary is untouched.

The same defect has a second half, and this task owns it because the first half is what let it run for
three milestones: `scripts/panel-bundle-budget.test.mjs` measures whatever sits in `extension/panel`
and never checks its age (`:211-241`, `:441-458`), and `npm test` builds nothing, so a nine-day-old
artifact satisfied the gate. A build that is present but older than the newest source it should carry
must fail with a message that says to rebuild, rather than be compared as if it were current.

## Approach

Replace the twenty literal objects with a `PANEL_SURFACES` list and one `map` over a single object
literal, spread into `appRoutes` at the position the literals occupied. Keep the per-surface comments
that carry a claim only if they still sit beside the surface they name; a comment that only repeated
"lazy for the same reason as the surfaces above it" belongs in one place above the list.

Then prove the measurement moved and nothing else did: build, measure, run the project gate, and
restore the tracked artifact the build rewrites with `git checkout -- extension/panel/index.html`. The
freshness assertion goes in the same suite that measures, so the next milestone cannot repeat this: a
present-but-old output names itself as stale instead of being compared.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-bundle-budget.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - .project/review/BUNDLE-PROBE.md
  - extension/panel/index.html

## Acceptance criteria

1. `npx nx run angular-ai-devtools:build-extension` followed by `node --test scripts/panel-bundle-budget.test.mjs scripts/image-budget.test.mjs` passes, and the printed initial total is at or below 535.44 kB; paste both lines.
2. `appRoutes` still exposes every surface route with its own `path` and `data.surface` in its previous order, asserted by a suite that reads the exported table rather than the source text, and the suite reddens when one surface is dropped from `PANEL_SURFACES`.
3. `scripts/panel-bundle-budget.test.mjs` fails with a message naming a stale build when the output present in `extension/panel` is older than the newest source file the panel build reads, and the suite proves both directions: a doctored old `index.html` mtime reddens it, and the freshly built output does not. The absent-output skip stays.
4. The two budget suites and `npm run check` pass at the head, and `extension/panel/index.html` is restored with `git checkout -- extension/panel/index.html` so the working tree carries no build artifact.
5. `npx prettier --check` passes on every file this task edits, with the output pasted.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs scripts/image-budget.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/app.routes.ts scripts/panel-bundle-budget.test.mjs && git checkout -- extension/panel/index.html
```

## Log

- pending.
