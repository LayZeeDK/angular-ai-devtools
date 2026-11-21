---
id: T005
title: Pin the route table and the loader map
wave: 4
status: done
deps: [T004]
agent: build_T005
base: 1bfa7ef6e48dd31d7c9d887a6cb8f2adb0692a22
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
- 2026-11-21: built at `1bfa7ef6` as `build_T005`. Branch `gsd-path/M056`; `gsd.bat activate --task-file .project/tasks/T005-pin-the-route-table-and-the-loader-map.md` printed `activated T005 at 1bfa7ef6 as build_T005`, and `git rev-parse HEAD` read `1bfa7ef6e48dd31d7c9d887a6cb8f2adb0692a22` before the first edit, so the base and the head are one commit. The taste dirt (`.commandcode/taste/workflow/taste.md`) was parked outside the repository with `gsd.bat taste-park --repo . --dir <scratchpad> --force` before activation and was never staged.
- Before the pin moved the suite read `tests 4`, `pass 3`, `fail 1`: E1 named the surface T004 landed as the one the expected list lacked — `PANEL_SURFACES must carry every surface in the order the table declares them`, the actual list carrying `tutor-signals` between `tutor-foundations` and `webmcp-rehearsal` and the expected list not. After the pin: `tests 4`, `pass 4`, `fail 0`.
- The pin, in `scripts/panel-routes.test.mjs` and nowhere else: the surface list gained `'tutor-signals'` between `'tutor-foundations'` and `'webmcp-rehearsal'` (26 → 27 names), the E2 surface-to-module map gained `'tutor-signals': ['panel-tutor-signals', 'tutorSignalsPanel']` — the module the LOADERS key imports and the symbol the pane exports (`export const tutorSignalsPanel`) — and the E3 negative call list gained `tutorSignalsPanel(` so the demo still calls no surface directly. No assertion was loosened and no expected count lowered: the list grew by one name and the `deepEqual` still pins the whole order.
- Both mutants redden naming the surface, measured by replaying each on the real source and restoring it with `git checkout --`: dropping `'tutor-signals',` from `PANEL_SURFACES` yields `route tutor-signals must exist exactly once in PANEL_SURFACES, so exactly one route answers at its path: [...]`, and dropping `'tutor-signals': () => import('./panel-tutor-signals') as never,` from `panel-demo.ts`'s `LOADERS` yields `every app.routes.ts surface must have a panel-demo LOADERS key; missing: tutor-signals`. The suite carries both as in-file mutants, so the pin proves itself on every run rather than in this bullet.
- No route count needed changing here: the suite enumerates surfaces by name, not by a numeric total, and the two suites that do state `expect(appRoutes).toHaveLength(36)` — `page-picker.component.spec.ts:521` and `panel-demo.spec.ts:2989` — were already moved 35 → 36 by T004's landing commit `f1c602d2`, which is also why the table now holds 36 routes (9 non-panel plus 27 surfaces). Nothing widened, nothing skipped.
- The three line numbers C3's line-neutral entry rests on still hold, read from the file: line 113 `export const appRoutes: Route[] = [`, line 146 `loadComponent: loadPanelDemo,` and line 147 `data: { surface },`. A sweep of every `research/raw` citation that names `apps/angular-ai-devtools/src/app/app.routes.ts` with a line and its text reported `citations 52, unresolved 0`, so every M047–M055 record's citation still reads what it claims.
- Verify, run exactly as the task gives it: `node --test scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs scripts/component-search.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs && npx prettier --check scripts/panel-routes.test.mjs` printed `tests 36`, `pass 36`, `fail 0`, `skipped 0`, then `All matched files use Prettier code style!`, exit 0. Per suite: `scripts/panel-routes.test.mjs` 4/4 (was 3/4), `scripts/after-render-fixture.test.mjs` 6/6, `scripts/component-search.test.mjs` 16/16, `tests/held-out/fixture-explainers-unchanged.test.mjs` 10/10 — the three suites this task runs but does not own were green at the base and stay green at this head, so the route T004 landed is proven green at the head this wave leaves (C6).
- The two declared gate suites are read and edited neither (C4): `scripts/gate-integrity.test.mjs` reports `tests 40`, `pass 29`, `fail 11` at this head, every failure naming `scripts/tutor-signals-graph.test.mjs differs from d94502d1` or the fix-record resolver C5 already records — no failing assertion names a path this task touched — and `scripts/gate-integrity-default-tasks.test.mjs` reports `tests 9`, `pass 9`, `fail 0`. T008 re-derives the record with its own command.
- Verdict: the route table's 36 routes and the LOADERS map are pinned by name, both the dropped-surface and dropped-loader mutants redden naming `tutor-signals`, the three cited line numbers hold with 52 of 52 citations resolved, and the Verify passes exactly as the task states it — ready.
