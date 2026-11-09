---
id: T006
title: Hold the panel's initial bundle inside the recorded baseline with one shared lazy loader
wave: 5
deps:
  - T004
status: done
agent: commandcode-coder
base: 4180de0c02437adff901ac08e68172199a4003c3
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - extension/panel/index.html
---

# T006 — Hold the panel's initial bundle inside the recorded baseline with one shared lazy loader

## Context

M041's T004 registered the `/navigation` surface and the project gate went red on a criterion this
repository has held since M020: the panel's built initial total may not exceed the 535,440-byte
baseline recorded before that milestone, and the constant is never raised to reach green. Two
suites take the same measurement from the build output, and both fail with the same sentence at
this head:

    extension/panel: initial total 535.62 kB exceeds the pre-milestone baseline of 535.44 kB by
    0.18 kB; INTENT says this milestone must not make the initial bundle worse. Eager files:
    chunk-B8BF8DsE.js 326561 B, …, chunk-FCeS4p_v.js 88104 B, main.js 101640 B, styles.css 1955 B

raised by the `assertWithinBaseline` call inside the test at `scripts/panel-bundle-budget.test.mjs:441`
(its call is at `:454`, its message at `:254-259`) and by the same call inside the test at
`scripts/image-budget.test.mjs:92` (its call is at `:98`). A fresh
`npx nx run angular-ai-devtools:build-extension` at this head prints `Initial total 535.62 kB` and
reproduces both failures; the total before M041's route landed was 535.44 kB.

The cause is the registration, not the surface. `apps/angular-ai-devtools/src/app/panel-navigation.ts`
sits behind the lazy boundary the earlier surfaces use: the built chunk that carries it is not
referenced from the built `extension/panel/index.html`, and it is reached only through the demo
module's own loader map. What the registration adds to the eager graph is one entry in `appRoutes`,
and that table already carried twelve entries whose `loadComponent` is the *same* closure —
`() => import('./panel-demo').then((m) => m.PanelDemoComponent)`. The built main.js carries thirteen
copies of that 77-byte closure, and the thirteenth is what put the total over the baseline by 183
bytes.

So the honest repair is to give the duplicated bytes back, not to widen the criterion: one shared
lazy loader, defined once and referenced by every panel-demo surface's route. Each route keeps its
path, its position in the table and its `data.surface` — the shape six suites read does not change —
and one dynamic import of the demo module stays the only reference to it, so nothing the
lazy boundary protects becomes eager. `panel-navigation.ts` and `panel-demo.ts` are not edited at
all. A wide table of near-identical closures is also exactly the shape that made the thirteenth
entry invisible, so collapsing it is the repair the next surface benefits from as well.

Two mechanical facts belong to this task because it builds. `extension/panel/index.html` is tracked
and the build rewrites it (critical CSS inlined, stylesheet link deferred), so the artifact is
restored with `git checkout -- extension/panel/index.html` after the measurement and never committed
— the same handling M039's stylesheet task recorded, and the reason the command sits inside this
task's Verify. And `extension/panel/*` is otherwise git-ignored, so the built output is measured in
the working tree and T005, which runs the project gate with no build present, must say which of the
two budget suites skipped rather than count a skip as a measurement.

## Approach

One shared loader, every route pointing at it, then proof that the total moved and nothing else did.

- Above `appRoutes`, declare the loader the twelve entries were already duplicating:
  `const loadPanelDemo = () => import('./panel-demo').then((m) => m.PanelDemoComponent);`. It is a
  function value referenced by thirteen route objects, so the bundler emits it once; that is the
  whole of the saving, and it is measured rather than argued.
- Replace each panel-demo route's inline closure with `loadComponent: loadPanelDemo` and touch
  nothing else in those entries: the `data: { surface }` object, the order of the table and the five
  eager explainer components stay exactly as they are. The `lint`, `router`, `legacy`, `onpush`,
  `resource`, `linked-state`, `render-phase`, `performance` and `navigation` surfaces are all in the
  same table, so a repair that only touched the new entry would save nothing.
- Keep the lazy boundary single and provable: `import('./panel-demo')` appears once in the file, and
  no surface module is imported eagerly. The route-table suite's exclusion — the demo never calls a
  surface function directly — is still true and is asserted rather than assumed.
- Re-cut the one pin whose subject is the loader text. `scripts/panel-routes.test.mjs` E1 currently
  requires each surface's block to contain `PanelDemoComponent` as text, which a shared identifier
  no longer does; it becomes a pin that follows the identifier to its single definition and asserts
  that the definition resolves `PanelDemoComponent` through a dynamic import. That is the same
  property (a route installs a component and names its own surface) proven one level down, and it is
  strictly stronger: a second definition, a component-less loader and a route pointed at a surface
  function each redden it by name.
- Prove the measurement twice, in the same command: the suites run over the built output after the
  build, and the same two suites are recorded over the pre-repair table — the failure quoted above
  is that reading — so the green half cannot be a skip. `PRE_MILESTONE_INITIAL_KB`,
  `EXPECTED_INITIAL_BUDGET`, `assertWithinBaseline` and the build's own 520kb/1mb budget are not
  edited; the repair is in the graph the number measures.
- Restore the tracked build artifact after the measurement, so the landing carries no rebuilt HTML
  and `npm run check`'s format sweep sees the committed bytes.

## Interface contract

None.

## Intent coverage

- SC6

## Acceptance criteria

1. The panel's route table keeps every surface, its order, its `data.surface` and its five eager explainer routes, and the change to it is the loader extraction alone: one shared lazy loader defined once above the table and referenced by all thirteen panel-demo routes, with no other line of those entries altered.
2. The lazy boundary is unchanged and still single: `import('./panel-demo')` appears once in `app.routes.ts`, the only route-level reference to the demo module is that dynamic import, no surface module is imported eagerly, and `panel-navigation.ts` and `panel-demo.ts` are byte-identical to their landed state.
3. With the repaired table, `npx nx run angular-ai-devtools:build-extension` followed by the two measurement suites yields an initial total at or below 535.44 kB — the suites pass unmodified, and `PRE_MILESTONE_INITIAL_KB`, `EXPECTED_INITIAL_BUDGET`, `assertWithinBaseline` and the `build-extension` budget block in the panel's project file are byte-identical to their landed state.
4. The green half is a measurement and not a skip: the Log quotes the total the build printed and the suites' own printed measurement, and quotes the pre-repair reading that failed (`initial total 535.62 kB exceeds the pre-milestone baseline of 535.44 kB by 0.18 kB`) as the same command's earlier run over the same output directory.
5. `scripts/panel-routes.test.mjs` E1 is re-cut to follow the shared loader with its failing assertion quoted — each surface's block names its own surface and its `loadComponent` is the one shared identifier, that identifier is defined exactly once as `import('./panel-demo')` and resolves `PanelDemoComponent`, and a mutant that points one route at a surface function, an `as any` component or a second definition reddens it naming the defect by string.
6. Every other route-table pin passes unmodified and is named in the Log as run: the app suite's ordered path list and its per-surface laziness assertions, the chat-entry suite's two ordered lists and its panel-surface loop, the picker's lazy list, the demo spec's route, loader key and sample fact, and the held-out explainer suite that compiles the panel's whole route graph.
7. The tracked build artifact is restored after the measurement — the landing diff carries no rebuilt `extension/panel/index.html` — and `npm run check` passes with the committed bytes, the restored artifact and the formatted sources.

## Verify

```bash
node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check scripts/panel-routes.test.mjs && npx nx run angular-ai-devtools:build-extension && node --experimental-strip-types --test "scripts/panel-bundle-budget.test.mjs" "scripts/image-budget.test.mjs" "scripts/panel-routes.test.mjs" && npx nx run angular-ai-devtools:test && git checkout -- extension/panel/index.html && npm run check
```

## Log

- pending
- T006 collapsed the thirteen panel-demo route closures into one shared lazy loader — `const loadPanelDemo = () => import('./panel-demo').then((m) => m.PanelDemoComponent)` declared once above `appRoutes` and referenced as `loadComponent: loadPanelDemo` by every panel-demo route — and the change to the table is that extraction alone: every path, its position in the table and its `data: { surface }` value is unchanged, the five eager explainer routes and the interop/chat/picker/image-budget routes are untouched, `import('./panel-demo')` appears once in the file, and `panel-navigation.ts` and `panel-demo.ts` were not edited at all (both absent from the landing diff). Measured, not argued: `npx nx run angular-ai-devtools:build-extension` printed `Initial total 535.62 kB` before the repair, where `panel-bundle-budget.test.mjs:441` and `image-budget.test.mjs:92` failed with `extension/panel: initial total 535.62 kB exceeds the pre-milestone baseline of 535.44 kB by 0.18 kB; INTENT says this milestone must not make the initial bundle worse. Eager files: chunk-B8BF8DsE.js 326561 B, …, main.js 101640 B, styles.css 1955 B` (535,623 B summed from the built index; the built main.js carried thirteen copies of the 77-byte `()=>import('./chunk-Bv6fUBh3.js').then(e=>e.PanelDemoComponent)`), and after it the same build printed `Initial total 534.93 kB`, the same two suites print `measured initial total 534.93 kB (534933 B over 9 eager files) against the 535.44 kB baseline` (`image-budget` adds `margin 0.51 kB`), and the built main.js carries one copy of that closure referenced by all thirteen routes: main.js 101,640 B -> 100,950 B, initial total 535,623 B -> 534,933 B, 0.51 kB inside the recorded baseline. The lazy boundary is unchanged and still single — the demo chunk `chunk-Bv6fUBh3.js` (6,060 B) is still listed under Lazy chunk files and is still not referenced from the built `extension/panel/index.html` — so nothing the boundary protects became eager and the saving is the duplicated closure bytes alone. `scripts/panel-routes.test.mjs` E1 was re-cut to follow the loader text to its single definition, the same property (a route installs a component, never a surface function) proven one level down: `assertSurfaceRoutes` keeps the per-entry half for each named surface (the route exists, it installs through `loadComponent:` rather than an `as any` surface function, and it names its own surface in route data) and now covers `lint` and `router` as well, which the list had never held — a narrowing, not a widening — and `assertOneSharedLoader` holds the loader's half (defined exactly once with `const`, resolving `PanelDemoComponent` through `import('./panel-demo')`, that dynamic import appearing exactly once, and all 13 panel-demo routes installing it). Red-then-green on the real file, not only in-process: with `loadComponent: loadPanelDemo,` dropped from the linked-state route the suite fails `AssertionError: route linked-state must install a component through loadComponent: path: 'linked-state',`; with the navigation route left on its own closure it fails `AssertionError: import('./panel-demo') must appear exactly once, in the shared loader; the table carries 2 copies of that dynamic import, so the same closure is duplicated once per route, …` while the per-surface half stays green for that mutant (asserted by `assert.doesNotThrow` inside E1 as well); the file restored byte-identically and E1 green again. Mutants inside E1, each red with the defect named by string: a route left on its own closure (the duplication sentence above), a surface dropped from the shared loader (`route linked-state must install a component through loadComponent`), a route pointed at a surface function (`route navigation must not install a surface function as a component`, naming `as any`), a surface without its route (`route navigation must exist`), a second definition of the loader (`must be defined exactly once above the route table`), a component-less loader (`must import the demo module dynamically`), and a route that stops naming its surface (`route performance must name its surface in route data`). Every other route-table pin passes unmodified and was run: `app.spec.ts` (the ordered path list and its per-surface lazy/`data.surface` assertions), `chat-entry.component.spec.ts` (two ordered lists and the panel-surface loop), `page-picker.component.spec.ts` (the lazy list), `panel-demo.spec.ts` (route, loader key and sample fact), and `tests/held-out/fixture-explainers-unchanged.test.mjs` (compiles the panel's whole route graph); `scripts/after-render-fixture.test.mjs` pins the fixture's own table, was not touched, and is byte-identical in this landing. No criterion was widened: `PRE_MILESTONE_INITIAL_KB` (535.44), `EXPECTED_INITIAL_BUDGET` (520kb/1mb), `assertWithinBaseline` and the `build-extension` budget block in the panel's `project.json` are byte-identical to their landed state — the repair is in the graph the number measures. `extension/panel/index.html` is rewritten by the build and restored with `git checkout -- extension/panel/index.html` after the measurement, so the landing carries no rebuilt HTML and `format:check` sees the committed bytes. The task's Verify command passed verbatim at base 4180de0: `node --check` on both edited files, the build, `node --experimental-strip-types --test` over the two budget suites and the route-table suite (22 pass, 0 fail), `npx nx run angular-ai-devtools:test` (345 pass in 31 files), the index restored, and `npm run check` through every stage including the verification gate and `prettier --check .`. ready
