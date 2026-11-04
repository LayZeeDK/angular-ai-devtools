---
id: T001
title: The extension gets a type check that runs
wave: 1
deps: []
status: in-progress
agent: build_T001
base: f57a417292b81fcea7932a421db71596fabc8a77
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
