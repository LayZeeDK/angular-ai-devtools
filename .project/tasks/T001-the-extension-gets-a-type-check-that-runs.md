---
id: T001
title: The extension gets a type check that runs
wave: 1
deps: []
status: in-progress
agent: build_T001
base: 5d16248335e6c906ce7294e1bfe9b70c2e87952b
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - extension/tsconfig.json
  - package.json
  - package-lock.json
---

# T001 — The extension gets a type check that runs

## Context

`npm run check` covers root, skills, panel and companion. Nothing checks `extension/`, which holds the
content scripts, the overlay, the relay and the picker agent. A probe (`tsc --allowJs --checkJs --strict false`)
reports 33 errors over the sources: 20 `TS2304 Cannot find name 'chrome'` and 13 real ones.

## Approach

1. Add `extension/tsconfig.json`: `allowJs`, `checkJs`, `noEmit`, `strict: false`, target ES2022, bundler
   resolution, and `include: ["**/*.js"]` with `exclude: ["panel/**"]` — the panel bundle is generated, and its
   187 errors measure the bundler, not the source. State the exclusion and the strict gap in the header.
2. Add `@types/chrome` as a devDependency so extension APIs are typed without entering the bundle.
3. Add `check:extension` to `package.json` and chain it into `check`.
4. Run it; the errors must fall to the 13 real ones, each listed in the Log.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `npm run check` runs `check:extension`, which type-checks every authored `.js` under `extension/` and excludes only `panel/**`.
2. After this task the check reports exactly the 13 non-global errors, and the Log lists them by file and code.
3. `extension/panel/**` is excluded with the reason stated in the config, and no authored file is excluded.

## Verify

```bash
npm ci --include=dev; npx tsc -p extension/tsconfig.json
```

## Log

- opened by orchestrator in wave 1
- implemented: `extension/tsconfig.json` (allowJs, checkJs, noEmit, strict:false, target ES2022, module preserve + bundler resolution, `types: ["chrome"]`; include `**/*.js`, exclude `panel/**` only; header states the panel bundle is generated output worth 187 of 220 non-strict errors and that strict:true reports 7308 implicit-any errors), `@types/chrome` ^0.3.7 as devDependency (installed with `--include=dev`, dev:true in the lock), and `check:extension`: `tsc -p extension/tsconfig.json` chained into `check` after `check:companion`; lockfile also picked up npm's root-name sync to `angular-ai-devtools-workspace`
- measured: before 33 errors at extension sources (19 x TS2304 `Cannot find name 'chrome'`, 14 real) + 1 extra line for the lib.dom.d.ts second location of TS2451 = 34 lines, exit 2; after `npm ci --include=dev; npx tsc -p extension/tsconfig.json` 14 errors in 4 files, 15 lines, exit 2 (left unfixed for T002, nothing suppressed; `npm run check` reaches `check:extension` with every earlier stage green and fails only there)
- remaining (14): agent-main.js 933 TS2345, agent-main.js 935 TS2345; panel.js 2 TS2451 `Cannot redeclare block-scoped variable 'status'` (second location node_modules/typescript/lib/lib.dom.d.ts:43618), panel.js 5 TS2339 `textContent` on string; relay.js 12 TS2339 `detail` on Event, 16 TS2339, 21 TS2339, 27 TS2339, 38 TS2339, 45 TS2339; stale-view-worker.js 158 TS2339, 159 TS2339, 160 TS2339, 170 TS2339
- coverage/verify: `tsc --listFilesOnly` includes all 9 authored `extension/*.js` (agent-main, background, devtools, observer-filter, overlay-geometry, overlay, panel, relay, stale-view-worker) and 0 files under `extension/panel/`; verify `npm ci --include=dev; npx tsc -p extension/tsconfig.json` exit 2; note for T002/reviewer: RESEARCH's 20/13 split is off by one in each direction (19 chrome sites, 14 real sites - stale-view-worker.js has 4, not 3) while its 33 total is right, so T002 must fix 14 sites, and `**/*.js` (the brief-pinned include) does not match the authored `.test.mjs` specs that `npm test` runs
- verify: exit 2 expected for T001 (the 14 real defects land in T002); wiring and exclusion proven, changed paths extension/tsconfig.json, package.json, package-lock.json only - ready
