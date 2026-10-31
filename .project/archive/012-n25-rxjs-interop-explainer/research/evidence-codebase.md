# Evidence — codebase

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-30
Checks run: Static inspection only (no npm/npx/build/test). Commands run: Get-Content on AGENTS.md, package.json, nx.json, tsconfig.json, extension-config.json, extension/manifest.json, apps/angular-ai-devtools/project.json, extension/{background,relay,agent-main,devtools,stale-view-worker}.js (first 40 lines); Get-ChildItem on extension, apps, src, spikes, scripts, tests, e2e, .commandcode, .claude; git log --oneline -30; Test-Path on verify sidecar. npm run check and npm test not run (read-only policy). Entry-point searches: manifest.json fields, project.json targets, package.json scripts, apps/.../src/main.ts, extension/panel/index.html; no .github/workflows found at repo root.

## Map

- **Stack**: TypeScript 6.0.3 (pinned); Angular ~22.1.0; Nx 23.3.0; Node ESM (`"type": "module"`); Vitest 4.0.8; Playwright 1.37; `@angular/build` application builder. Root `tsconfig.json` only type-checks 3 files; project app uses `apps/angular-ai-devtools/tsconfig.app.json`.
- **Entry points**: `extension/manifest.json` (MV3): service worker `background.js`; content scripts `relay.js` (isolated) + `agent-main.js` (MAIN world) on `<all_urls>`; devtools page `devtools.html` -> panel `panel/index.html`. Angular app entry `apps/angular-ai-devtools/src/main.ts` (standalone app and `extension/panel` via `build-extension`). Nx targets: build, build-extension (depends on generate-error-digest), serve, test, serve-static; e2e via Playwright plugin. Root scripts: check, test (node:test over scripts/extension + skills + app).
- **Architecture**: MV3 extension with three worlds: service worker relay, isolated-world content bridge, MAIN-world agent reading `window.ng` profiling hooks and dispatching CustomEvents. DevTools panel is an Angular 22 app built into extension/panel communicating via chrome.runtime messages. Dedicated worker `stale-view-worker.js` runs N24 stale-view scan. `src/main-world` and `src/panel` hold TS sources mirrored into extension artifacts. Spikes provide fixture apps.
- **Conventions**: ESM .mjs tests with `node --experimental-strip-types --test`; Angular specs co-located as *.spec.ts; skills mirrored between `.commandcode/skills` (maintained) and `.claude/skills` (byte copies for control/verify skills) with `scripts/skills-mirror.test.mjs`. Commit prefixes: `build:`, `ship:`, `plan:`, `docs:`, `integrate:`, `T0xx:`.
- **Maturity**: App tests via Nx; root test runs node:test for scripts/extension/skills plus app. Sidecar deps bridge auto-creates node_modules junction for type checks. Interop panel route not yet shipped (verify exits 2). Extension panel output is gitignored except index.html/favicon.ico.
- **Recent activity**: Last 30 commits cluster around M011/M012 verification of stale-view (N24) and interop (N25); touches control-ai-browsers, verify-ai-browsers, panel wiring, typing check modules, measured fixture docs.

## Finding: Extension has four distinct execution contexts wired by manifest

- **Claim**: The extension runs code in a service worker, an isolated content script, a MAIN-world content script, and a DevTools panel page, all declared in manifest.json.
- **Source**: extension/manifest.json:17-45
- **Confidence**: high
- **Why it matters here**: A planner must not assume a single bundle; message passing crosses worlds and tab ids gate panel state.

## Finding: Panel app is the same Angular app built into extension/panel

- **Claim**: `build-extension` target outputs the Angular app to `extension/panel` with baseHref `/panel/` and depends on `generate-error-digest`.
- **Source**: apps/angular-ai-devtools/project.json (build-extension target)
- **Confidence**: high
- **Why it matters here**: Panel changes require an Angular build, not editing extension/panel/* (gitignored except index.html/favicon.ico).

## Finding: MAIN-world agent depends on Angular dev-mode globals

- **Claim**: `agent-main.js` reads `window.ng` / `ng.ɵgetSignalGraph` and hard-codes ProfilerEvent enum values for Angular 22.x.
- **Source**: extension/agent-main.js:1-40
- **Confidence**: high
- **Why it matters here**: Breaks on Angular version changes or production builds without dev mode; version gate matters.

## Finding: Stale-view scan runs in a dedicated, self-contained worker

- **Claim**: `extension/stale-view-worker.js` inlines the scan algorithm and gates on Angular >=22.1.3.
- **Source**: extension/stale-view-worker.js:1-25
- **Confidence**: high
- **Why it matters here**: Worker must be kept in sync with any scan algorithm change; two copies exist (worker + source).

## Finding: On-device Prompt API is invoked from the page MAIN world, not extension code

- **Claim**: background.js states the Prompt API runs in the page's MAIN world via agent-main.js; no model download code exists in repo (models are shared browser profiles).
- **Source**: extension/background.js:1-4; AGENTS.md (Browsers and on-device models)
- **Confidence**: high
- **Why it matters here**: Model availability is an environment/profile concern, not a repo build concern; do not treat missing model as repo bug.

## Finding: Spikes provide two fixture apps including a dev-only stale-view route

- **Claim**: `spikes/ng222-app` (counter + `stale-view-fixture.ts`) and `spikes/ng222-ssr` exist; stale-view route is owner-approved fixture.
- **Source**: spikes/ng222-app/src/app/stale-view-fixture.ts; AGENTS.md (Verification fixtures)
- **Confidence**: high
- **Why it matters here**: N24 stale-view claim depends on that fixture; adding routes needs a ruling.

## Finding: Skills are duplicated across .commandcode and .claude with a mirror test

- **Claim**: `.commandcode/skills` is maintained; `.claude/skills` holds byte copies for control/verify skills; `scripts/skills-mirror.test.mjs` fails until copied.
- **Source**: AGENTS.md (Browsers); .commandcode/skills and .claude/skills listings
- **Confidence**: high
- **Why it matters here**: Edits to control/verify skills must be mirrored or tests fail.

## Finding: Interop panel route is not yet shipped

- **Claim**: verify-ai-browsers interop check exits 2 with "the app has no interop panel route yet (served /panel/)" until panel ships /panel/interop.
- **Source**: AGENTS.md (Verification fixtures, N25)
- **Confidence**: high
- **Why it matters here**: Half-built area; N25 SC1 not claimable without ruling on portal source.

## Finding: Root type check scope is narrower than the codebase

- **Claim**: Root `tsconfig.json` includes only the pstack installer and plugin template; most extension/app code is not covered by `tsc -p tsconfig.json`.
- **Source**: tsconfig.json:4-8
- **Confidence**: high
- **Why it matters here**: Type safety for extension/app comes from separate configs; a clean root tsc does not imply full coverage.

## Finding: No CI workflow files at repo root

- **Claim**: Top-level listing shows no `.github` directory; CI evidence not found in scanned tree.
- **Source**: Get-ChildItem root (no .github); grep not run
- **Confidence**: medium
- **Why it matters here**: Entry-point/CI claims rely on manifests and scripts only; CI config may live elsewhere/unread.

## Apparent intent

- The project is becoming an Angular DevTools extension with on-device AI explanations (Prompt API) for change-detection causality, DI graphs, error digests, signal provenance, and stale-view detection — based on extension/agent-main.js, src/panel, apps/angular-ai-devtools components.
- M012 aims at interop verification against a real portal app — based on AGENTS.md N25 and verify-ai-browsers interop check.
- The codebase is heavily verification-driven (control/verify skills, fixtures, measured timings) — based on .commandcode/skills and recent commits.

## Open questions for define

- Should the interop panel route `/panel/interop` be implemented now, or is N25 deferred pending a ruling on portal source changes?
- Is the stale-view worker algorithm intended to stay inlined, or should it import from a shared module?
- Are `.claude/skills` non-control/verify folders still meant to be maintained, or are they legacy copies?

## Blocked areas

- node_modules not inspected for actual installed versions (sidecar has no node_modules; primary has one but version verification skipped to stay static).
- CI configuration not found at repo root; if present in a parent/external location it was not scanned.
- Full source of extension/agent-main.js beyond first 40 lines not read; only header/contract inspected.
