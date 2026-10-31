# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-31
Checks run: `node --version` → v24.22.0; `npm run check` → exit 0 (tsc root + 4 skill tsconfigs); `npm test` → exit 0 (root node:test: 588 pass, 0 fail, 0 skipped; skills node:test included; Angular app tests via Nx: 10 files, 46 pass, 0 fail). Nx reported angular-ai-devtools:test cache hit.

## Map

- **Stack**: Angular ~22.1.0 (core/common/forms/router/platform-browser), Angular CLI/build ~22.1.0, Nx 23.3.0, TypeScript 6.0.3 (pinned), Node v24.22.0, RxJS ~7.8.0, Vitest ^4.0.8, Playwright ^1.37.0, jsdom ^27.1.0. MV3 browser extension (manifest_version 3) with on-device Prompt API. Module type ESM ("type": "module").
- **Entry points**: Panel app entry `apps/angular-ai-devtools/src/main.ts` → `bootstrapApplication(App, appConfig)`; Nx build target `angular-ai-devtools:build` (browser entry main.ts) and `build-extension` (outputPath base `extension/panel`, baseHref `/panel/`, depends on `generate-error-digest` running `scripts/generate-error-digest.mjs`). Extension entry points from `extension/manifest.json`: background service worker `background.js` (type module); content scripts `relay.js` (isolated world) and `agent-main.js` (MAIN world); devtools page `devtools.html` → `devtools.js`. Root scripts: `npm run check`, `npm test`, `npm run check:skills`, `npm run test:skills`, `npm run test:app`.
- **Architecture**: Nx monorepo with one Angular application (`apps/angular-ai-devtools`) whose per-feature components/services (N1 update-cause, N2 signal-provenance, N3 DI doctor, error-explainer, stale-view, interop) are routed in `apps/angular-ai-devtools/src/app/app.routes.ts`. Page-side instrumentation lives in `src/main-world/*.ts` (DI lookup/path tracer, error capture/digest, provenance tracer, stale-view scan, interop keep-list) and is injected as `extension/agent-main.js` (MAIN world). `src/panel/*.ts` holds shared panel helpers (anti-patterns, chain, DI diff/explain/path display, error explainer view, extension prompt service, provenance component). `extension/*.js` contains the MV3 background relay, devtools panel glue, and tests. `scripts/*.mjs` are Node helpers/tests; `.commandcode/skills` and `.claude/skills` hold control/verify skills with their own scripts and tests. Spikes `spikes/ng222-app` and `spikes/ng222-ssr` are fixtures; `e2e/` has a Playwright provenance spec.
- **Conventions**: node:test (`node --experimental-strip-types --test`) for `scripts/**/*.test.mjs` and `extension/**/*.test.mjs` plus skill tests; Angular unit tests (Vitest via `@angular/build:unit-test`, `**/*.spec.ts`, excluding `**/*.node.test.ts`) for the app. Strict TS (strict, noUncheckedIndexedAccess, NodeNext for root). Feature components named `n<number>-<slug>.component.ts` with matching `.service.ts`; node-testable app logic extracted into `*.node.test.ts` beside the component. Skills mirrored between `.commandcode/skills` (20) and `.claude/skills` (10 byte copies) with `scripts/skills-mirror.test.mjs` enforcing parity.
- **Maturity**: Typecheck and all tests green at base revision 14729ba. App has 10 spec files / 46 tests. Extension and scripts have node tests (588 total). Interop feature is wired into routes and services but its verification check reports could-not-run until `/panel/interop` is served (per AGENTS.md). Error digest is generated at build time into `extension/`.
- **Recent activity**: Last 15 commits cluster on M012/M013 interop work (`ship: M012`, `T016 test-pattern split`, `T012 interop panel graph wiring`, `T004 interop panel route`, `T014 interop panel readability`) and GSD Path verify ledger/evidence tasks; plus `docs(gsd): record M013` and `chore(taste): node:test vs Angular unit-test pattern split`. Work has been concentrated in `.project/` planning artifacts and interop implementation.

## Finding: Panel app imports main-world source across the package boundary

- **Claim**: `interop.service.ts` dynamically imports `../../../../src/main-world/interop-keep-list.ts` from `apps/angular-ai-devtools/src/app/`, coupling the Angular panel build to a main-world source file outside the app source root.
- **Source**: `apps/angular-ai-devtools/src/app/interop.service.ts:3`
- **Confidence**: high
- **Why it matters here**: A planner assuming app code stays under `apps/angular-ai-devtools/src` would miss this cross-tree dependency; refactors or moves of `src/main-world` break the panel build silently (the import is guarded with `.catch(() => null)`).

## Finding: Interop service redefines Angular primitives to stay node-testable

- **Claim**: `interop.service.ts` dynamically imports `@angular/core` and conditionally falls back to no-op `Injectable`/`inject`/`signal`/`effect` shims, and similarly for `ExtensionPromptService` and `UpdateCauseService`, so the file can be imported by node tests without Angular.
- **Source**: `apps/angular-ai-devtools/src/app/interop.service.ts:14-25`
- **Confidence**: high
- **Why it matters here**: This dual-runtime pattern is the reason `interop-slice.node.test.ts` / `interop-attribution.node.test.ts` exist; changing it affects both test surfaces. It also means type errors here are only caught by `npm run check` (tsc), not by the Angular unit-test runner.

## Finding: Interop node tests live inside app src and are excluded from Angular runner

- **Claim**: Two `*.node.test.ts` files sit under `apps/angular-ai-devtools/src/app/` and are explicitly excluded from the Angular unit-test target (`exclude: ["**/*.node.test.ts"]`), so they run only under the root node:test glob is not included either — they are reached via `scripts/run-user-scope-tests.mjs`/skill paths rather than `npm test`'s app glob.
- **Source**: `apps/angular-ai-devtools/project.json:119-122`; files `apps/angular-ai-devtools/src/app/interop-slice.node.test.ts`, `interop-attribution.node.test.ts`
- **Confidence**: medium
- **Why it matters here**: A coverage or test-count audit that greps `*.spec.ts`/`*.test.mjs` will miss these two files; they are a distinct test pattern the planner must account for.

## Finding: Extension agent-main.js is hand-authored JS, not a build output

- **Claim**: `extension/agent-main.js` is a 653-line hand-written MAIN-world recorder (not generated from `src/main-world/*.ts`), while `src/main-world/*` are TypeScript tracers; there is no visible build step compiling the TS tracers into `extension/`.
- **Source**: `extension/agent-main.js:1-6`; `extension/manifest.json:26-29`; `src/main-world/` (9 .ts files); `apps/.../project.json` (no target emitting agent-main.js)
- **Confidence**: high
- **Why it matters here**: Changes to `src/main-world/*.ts` (e.g. `interop-keep-list.ts`) do not automatically flow into the shipped extension; the panel instead dynamically imports the TS file at runtime. Load-bearing for any "fix the tracer" task.

## Finding: Error digest is generated into extension/ at build time

- **Claim**: `build-extension` target `dependsOn: ["generate-error-digest"]`, which runs `node scripts/generate-error-digest.mjs` and emits into `extension/` (manifest lists no digest file, but `extension/error-digest.json` exists and has its own test `extension/error-digest.test.mjs`).
- **Source**: `apps/angular-ai-devtools/project.json:52-56,93-99`; `extension/error-digest.json`; `extension/error-digest.test.mjs`
- **Confidence**: high
- **Why it matters here**: Editing error explanations requires regenerating the digest; static edits to `extension/error-digest.json` will be overwritten by `npx nx run angular-ai-devtools:build-extension`.

## Finding: Skills exist in two trees with different counts

- **Claim**: `.commandcode/skills` holds 20 skill folders while `.claude/skills` holds 10; `scripts/skills-mirror.test.mjs` enforces byte parity only for the `control-ai-browsers` and `verify-ai-browsers` pair, and `npm test` runs both trees.
- **Source**: directory listing; `AGENTS.md:38-41`; `scripts/skills-mirror.test.mjs`
- **Confidence**: high
- **Why it matters here**: A change to a skill under `.commandcode/skills` is not automatically mirrored to `.claude/skills`; the mirror test fails until copied. Only 10 of 20 skills have a `.claude` copy, so "which copy is authoritative" depends on the skill.

## Finding: Sidecar verification depends on a dependency bridge

- **Claim**: Verify sidecars ship without `node_modules`; `npm run check` invokes `scripts/ensure-sidecar-deps.mjs` (and AGENTS documents `scripts/sidecar-deps-bridge.mjs`) to create/remove a junction to the primary worktree's `node_modules` automatically.
- **Source**: `package.json:7`; `AGENTS.md:13-22`; `scripts/ensure-sidecar-deps.mjs`; `scripts/sidecar-deps-bridge.mjs`
- **Confidence**: high
- **Why it matters here**: Running checks outside the sidecar flow (or in a stale sidecar) fails with TS2688; the bridge is load-bearing for any verification step.

## Finding: Interop route is registered but its verification check stays could-not-run

- **Claim**: `app.routes.ts` registers `{ path: 'interop', component: InteropComponent }`, yet AGENTS.md states `verify-ai-browsers/checks/interop.mjs` exits 2 with "the app has no interop panel route yet (served /panel/)" until the panel ships `/panel/interop`.
- **Source**: `apps/angular-ai-devtools/src/app/app.routes.ts:15`; `AGENTS.md:61-62`
- **Confidence**: medium
- **Why it matters here**: Either the route registration is newer than the doc note or the served build lacks it; the mismatch is a load-bearing open question for the interop claim (N25) and should be reconciled before claiming SC1.

## Finding: App uses Angular 22 standalone bootstrap with no NgModule

- **Claim**: The app bootstraps via `bootstrapApplication(App, appConfig)` in `main.ts` with routing in `app.routes.ts`; no `AppModule`/NgModule appears in `apps/angular-ai-devtools/src`.
- **Source**: `apps/angular-ai-devtools/src/main.ts:1-7`; `apps/angular-ai-devtools/src/app/app.routes.ts:9-16`; glob `apps/angular-ai-devtools/src/app/**/*.module.ts` → no matches
- **Confidence**: high
- **Why it matters here**: Conventions for new features: standalone components + functional providers; do not introduce NgModule-based patterns.

## Finding: Spikes carry a dev-only stale-view fixture route

- **Claim**: `spikes/ng222-app` is an Angular 22.2 fixture app carrying a dev-only `stale-view` route (`src/app/stale-view-fixture.ts`) per an owner ruling dated 2026-10-30, used to make N24's claim producible.
- **Source**: `AGENTS.md:50-53`; `spikes/ng222-app/` (directory present)
- **Confidence**: medium
- **Why it matters here**: Changes to spike fixtures are gated by owner rulings; a planner should not add routes there without the same kind of ruling.

## Apparent intent

- The project is becoming a full Angular devtools panel with on-device LLM explanations (N1 update-cause, N2 signal provenance, N3 DI doctor, error explainer, interop attribution), backed by a MAIN-world recorder capturing microtask-delimited change detection and signal graphs. — based on `apps/.../app.routes.ts`, `src/main-world/*`, `extension/manifest.json`.
- Interop (N25) is mid-flight: route + service + node tests + keep-list exist, but verification still reports could-not-run and AGENTS notes the portal half of the claim has no source. — based on `interop.service.ts`, `interop.component.ts`, AGENTS.md:54-62.
- Verification is being productized as code: `.commandcode/skills` contains `verify-*` checks that drive real browser instances and save evidence JSON. — based on `.commandcode/skills` (20 folders) and `verify-ai-browsers` references.

## Open questions for define

- Is the `/interop` route registration sufficient for `verify-ai-browsers/checks/interop.mjs`, or does the served `/panel/interop` build still need wiring (AGENTS.md says could-not-run)?
- Should `src/main-world/*.ts` tracers be compiled into `extension/agent-main.js`, or remain hand-maintained parallel implementations?
- Which of the two skill trees (`.commandcode` vs `.claude`) is authoritative for the 10 non-mirrored skills?
- Are the two `*.node.test.ts` files under app src intended to be collected by `npm test` at all, or only ad hoc?

## Blocked areas

- `.project/archive`, `dist`, installed GSD Path skill bundles — excluded per brief; not inspected.
- No live browser/instance verification performed (out of scope for codebase map); extension runtime behavior not executed.
- `spikes/ng222-ssr` and `spikes/probes` contents not deeply read; only top-level presence confirmed.