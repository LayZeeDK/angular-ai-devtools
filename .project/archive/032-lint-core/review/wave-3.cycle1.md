# Review — wave 3, cycle 1

Cycle: 1
Depth: verify-only
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: abfbcded8ad5d31ba151c7e5c464397470a44e3c (current `git rev-parse HEAD` on `gsd-path/M032`; T005 change is commit 519a47d4 `T005: Register the lint surface in the panel demo`, present in branch history)

## T005 — Register the lint surface in the panel demo: pass

- ✅ `node --test scripts/panel-routes.test.mjs` (cwd `D:\projects\sandbox\angular-ai-devtools`, exit code 0): `tests 4, suites 0, pass 4, fail 0, cancelled 0, skipped 0, todo 0, duration_ms 131.0742`. Passing tests include `E4: every declared route surface has a panel-demo LOADERS key` (`2.6754ms`).
- ✅ `node node_modules\nx\dist\bin\nx.js test angular-ai-devtools --skip-nx-cache` (cwd `D:\projects\sandbox\angular-ai-devtools`, exit code 0): `Test Files 30 passed (30), Tests 333 passed (333), Duration 1.74s` (NX reported `Successfully ran target test for project angular-ai-devtools`; run duration `5.3s`, cache skipped).
- ✅ Defect fixed — `/lint` resolves through `PanelDemoComponent`/`LOADERS`, not the `no such surface` branch: `apps/angular-ai-devtools/src/app/app.routes.ts:72-77` declares `path: 'lint'`, `loadComponent: () => import('./panel-demo').then((m) => m.PanelDemoComponent)`, `data: { surface: 'lint' }`. `apps/angular-ai-devtools/src/app/panel-demo.ts` has `lint: () => import('./panel-lint') as never` in `LOADERS` (line 25) and a sample `FACTS.lint` entry (lines 56-66); `ngOnInit` resolves the route `data.surface`/input, looks up `LOADERS[name]`, and only sets state `error`/`lines ['error: no such surface ' + name]` when no loader exists (lines 90-102). With the `lint` loader present, `/lint` renders the loaded surface state/lines.
- ✅ E4 is a real gate, not decoration (`scripts/panel-routes.test.mjs:96-156`): `declaredSurfaces()` extracts every `surface: '...'` from `app.routes.ts`; `loaderKeys()` parses the `LOADERS` block in `panel-demo.ts`; `assertAllSurfacesHaveLoaders()` computes missing surfaces and asserts `deepEqual(missing, [], 'every app.routes.ts surface must have a panel-demo LOADERS key; missing: ' + missing.join(', '))`. The test (a) passes on real files (`assertAllSurfacesHaveLoaders(routesSource, demoSource)`), (b) proves mutation applied by removing the real `lint` LOADERS line and asserting `mutated !== demoSource`, then (c) fails with a message naming `lint` (`String(err.message).includes('lint')`).
- ✅ Independent mutant (my own, on copies/in-memory; no repo files written): added `data: { surface: 'fake-surface' }` to a copy of `app.routes.ts` and ran the same `assertAllSurfacesHaveLoaders` logic against real `panel-demo.ts`. Result: `MUTANT REDDENED`, `name=AssertionError`, message `every app.routes.ts surface must have a panel-demo LOADERS key; missing: fake-surface` (actual included `fake-surface`, expected `[]`). This confirms the gate names the missing surface.
- ✅ `git status --porcelain` after mutant/temp cleanup shows only `?? .project/review/` (the untracked review artifact directory created for this task). No tracked files changed; no stray mutant files remain.

## Intent coverage

### SC4 — The panel renders the construct, the code and its explanation from a short fact list, and shows the "cannot tell" state.: pass

- ✅ Covered by T005 evidence above. `panel-demo.ts` carries a `lint` loader and sample `FACTS.lint` (short fact list) so `/lint` renders a real loaded surface state rather than `error: no such surface lint`; route wiring uses `PanelDemoComponent` + `data.surface='lint'`. The E4 gate in `scripts/panel-routes.test.mjs` verifies declared route surfaces have `LOADERS` keys and reddens naming the missing surface (`lint` in the built-in mutant, `fake-surface` in the independent mutant). Both required suites are green (node:test 4/4 pass, `angular-ai-devtools` nx test 333/333 pass).

## Scope note (plain)

- The E4 check covers **every declared surface** (`every data.surface in app.routes.ts` vs all `LOADERS` keys in `panel-demo.ts`), not only `lint`. Verified by inspection (`declaredSurfaces()` scans all `surface:` entries; `assertAllSurfacesHaveLoaders()` filters all declared surfaces) and by the independent mutant adding a new `fake-surface` declaration, which reddened naming `fake-surface`. Current declared/loader surfaces match: `after-render, fields, lint, redirect, sanitizer`.
