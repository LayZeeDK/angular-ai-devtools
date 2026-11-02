---
id: T003
title: Convert one explainer route to a lazy load and measure the initial-bundle headroom
wave: 1
deps: []
status: done
agent: build_T003
base: f22a2f713efbbf5dd83a4a2534c673a946867e92
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - scripts/panel-bundle-budget.test.mjs
---

# T003 — Convert one explainer route to a lazy load and measure the initial-bundle headroom

## Context

`scripts/panel-bundle-budget.test.mjs` pins the panel's initial total byte-exact at `PRE_MILESTONE_INITIAL_KB = 535.44` — 535,440 B over the five files `extension/panel/index.html` loads eagerly — and `assertWithinBaseline` fails on any positive delta, so a single added byte is a regression. The total is summed from `script src` plus `stylesheet`/`modulepreload` links only, so code in a lazily loaded chunk is outside the measurement while the route-table entry that names it is inside `main.js`. Wave 2 adds exactly such an entry (the `chat` route), and this milestone is forbidden from raising the constant or the `build-extension` budget. So the headroom has to be created before the surface is designed, by making one already-shipped explainer route lazy: it is behaviour-neutral, removes that component and whatever only it imports from the eager graph, and leaves the pin's number untouched.

## Approach

- Pick the explainer whose removal frees the most eager bytes — the measurement decides, not intuition: `n1-update-cause` and `interop` carry the largest components (`n1-update-cause.component.ts` 7.1 kB, `interop.component.ts` 6.0 kB), and a route whose component imports a service nothing else eager uses frees more than the component alone. `error-explainer` and `stale-view` are the alternatives if their eager graphs are larger.
- The change is confined to the route entry: `{ path: 'x', loadComponent: () => import('./x.component').then((m) => m.XComponent) }`. Do not move, rename or restyle a component, and do not touch `app.ts`, which is only a router outlet.
- **The pin is read, never written.** `scripts/panel-bundle-budget.test.mjs` is in `files` because this task's Verify names it; its constant, its assertion and its synthetic fixture stay byte-identical, and so do `apps/angular-ai-devtools/project.json`'s `maximumWarning: "520kb"` / `maximumError: "1mb"`. If no behaviour-neutral conversion exists, stop and report — do not raise either number.
- The measurement is the point of the task, so record it: the Log gets the printed `measured initial total … B` line and the new byte total, which is what wave 2 spends.
- `build-extension` emits into the git-ignored `extension/panel/`; the measurement is skipped there without a build, which is why the Verify builds first.

## Interface contract

- `app.routes.ts` keeps `appRoutes: Route[]` as an in-file literal with the six explainer paths unchanged ('' N1UpdateCauseComponent, `signal-provenance` N2SignalProvenanceComponent, `di-doctor` N3DiDoctorComponent, `error-explainer` ErrorExplainerComponent, `stale-view` StaleViewComponent, `interop` InteropComponent); an entry is `{ path, component }` or `{ path, loadComponent: () => import('./<file>').then((m) => m.<Class>) }`, T003 converts exactly one explainer to `loadComponent`, and T006 appends `{ path: 'chat', loadComponent: () => import('./chat-entry.component').then((m) => m.ChatEntryComponent) }`.

## Intent coverage

- SC4

## Acceptance criteria

1. Exactly one of the six explainer routes is registered with `loadComponent`, its component is no longer imported at the top of `app.routes.ts`, and the six paths and their components are otherwise unchanged.
2. `npx nx run angular-ai-devtools:build-extension` followed by `node --test scripts/panel-bundle-budget.test.mjs` passes and prints a measured initial total strictly below 535,440 B, with `PRE_MILESTONE_INITIAL_KB` still declared once as 535.44 and the `build-extension` budget still `520kb`/`1mb`.
3. The measured headroom is at least 1,000 B, and the Log records the printed byte total and the delta against 535,440 B.
4. `npm run check` passes, so the lazy entry type-checks under the panel's own check config.
5. Only `apps/angular-ai-devtools/src/app/app.routes.ts` changes: `scripts/panel-bundle-budget.test.mjs`, `apps/angular-ai-devtools/project.json` and every component file keep their base bytes.

## Verify

```bash
npm ci --include=dev && npm run check && npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The build is part of the command because the pin's only real
     measurement is skipped when extension/panel/ holds no build output. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
- build_T003: converted the interop route in apps/angular-ai-devtools/src/app/app.routes.ts to loadComponent (the InteropComponent import dropped; the other five routes, all six paths and every component/service/project.json/budget-pin byte unchanged; interop.component.ts 2,279 B + interop.service.ts 11,358 B was the largest exclusively-eager graph of the four candidates, so the measurement picked it). Base measured 535,695 B (already 255 B over the pin); after the conversion the built panel measures 529,544 B over 6 eager files, i.e. -5,896 B against the 535,440 B baseline, 5,896 B of headroom and -6,151 B base-to-head. Verify exit 0: npm ci --include=dev, npm run check, npx nx run angular-ai-devtools:build-extension and node --test scripts/panel-bundle-budget.test.mjs all passed (4/4), printing 'measured initial total 529.54 kB (529544 B over 6 eager files) against the 535.44 kB baseline'. Note: the build regenerates the tracked, un-ignored extension/panel/index.html (one added modulepreload link for chunk-ClDaaW9w.js); restored to base bytes because this task's files list and AC5 allow app.routes.ts only - re-commit it at landing if the tracked artifact should stay in sync, as T012 did.
- ready
- 2026-11-02 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  ℹ todo 0
  ℹ duration_ms 170.0181
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  ```
