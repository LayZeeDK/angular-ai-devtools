---
id: T005
title: Pin the route table and the loader map
wave: 4
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/panel-routes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T005 — Pin the route table and the loader map

## Context

T004 lands the `tutor-signals` entry in `PANEL_SURFACES` and its key in the loader map.
`scripts/panel-routes.test.mjs` reads both declarations: the surface list, the shared `loadPanelDemo`
closure and the loader map, and it asserts every named surface has a route, every route has a loader
key, and a removed surface reddens by name. It is the one suite that edits the surface-to-module map,
so it is this task's file and not T004's. Declaring it brings its own pin closure with it (PLAN C4):
`scripts/gate-integrity.test.mjs` names it, and that suite names its default-tasks sibling, so both
are declared here and neither is edited.

## Approach

Edit `scripts/panel-routes.test.mjs` in exactly two places: its surface-to-module map gains the
`tutor-signals` row naming the module and the exported panel symbol the loader imports, and its
removed-surface mutant set gains the same surface, so a dropped `tutor-signals` route reddens by name
instead of passing as a shorter list. No assertion is loosened, no expected count is lowered and
nothing is skipped: the pin this milestone needs is the one the suite already carries, extended to one
more surface.

Run the two route-file suites T004 declares — the component-search suite and the held-out
fixture-explainer pin — in the same `node --test` leg, so the route T004 landed is proven green at the
head this wave leaves rather than one task earlier (PLAN C6). Both exist at the base and are declared
by T004, which owns the route change they pin, so running them here authors nothing and spends none of
this task's four authored units; declaring them again would claim a pin this task does not move.

Assert the three line numbers C3's line-neutral entry rests on — the `appRoutes` declaration, the
`loadComponent: loadPanelDemo,` line and the `data: { surface },` line — because the M048 to M055
surface records quote them and a shift would leave every one of those records citing a line nothing
holds. An assertion is not added to the suite for it; the numbers are read in this task's own
recording of what it verified, in its Log, and the copy suite T007 runs re-reads the three records
that quote them.

Run the fixture-table suite — declared by no task, because its nineteen-route pin is the counter
fixture's own table read from `spikes/ng222-app/src/app/app.routes.ts` at line 11 (PLAN C3), so this
milestone's change cannot move what it asserts, and declaring it would spend one of the four authored
units on a suite the change cannot stale.

Nothing else is touched: no source file, no record, no route.

## Intent coverage

- SC1

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- scripts/panel-routes.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. `scripts/panel-routes.test.mjs` names the `tutor-signals` surface in its surface-to-module map, so
   the route the table declares and the loader key the map serves are pinned by name and the answer
   stays reachable at its route (SC1).
2. Its removed-surface mutant set carries the same surface, so dropping the `tutor-signals` route
   reddens the suite naming it rather than passing as a shorter list, and no assertion is loosened
   and no expected count lowered.
3. The `appRoutes` declaration line and the mapped literal's two lines are the numbers the M048 to
   M055 surface records cite, the fixture-table suite runs green at this head without being
   declared, and the two route-file suites T004 declares are green here at the head this wave
   leaves (PLAN C6).

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs scripts/component-search.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs && npx prettier --check scripts/panel-routes.test.mjs
```

## Log

- pending.
- Landed paths: `scripts/panel-routes.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` — each is read from this tree, ready.
