# Evidence — codebase

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-30
Checks run: `npm run check` in verify sidecar (bridge junction to primary node_modules) -> exit 0; `npm test` in verify sidecar -> 546 tests, 546 pass, 0 fail, 0 skipped.

## Map

- **Stack**: TypeScript 6.0.3; Angular ~22.1.0; Nx 23.3.0; @angular/build ~22.1.0; RxJS ~7.8.0; Playwright ^1.37.0; Vitest ^4.0.8; Node types ^26.6.5; ESM (`"type": "module"`). Manifests: package.json, nx.json, tsconfig.json.
- **Entry points**: Angular app bootstrap `apps/angular-ai-devtools/src/main.ts` (bootstrapApplication); MV3 extension service worker `extension/background.js` plus content scripts `extension/relay.js` and `extension/agent-main.js` (MAIN world); DevTools page `extension/devtools.html`/`devtools.js`. Playwright config points testDir `tests/browser` and webServer `nx run angular-ai-devtools:serve`.
- **Architecture**: Nx workspace with one Angular application (`angular-ai-devtools`) served/built by @angular/build. The app has three routes (update-cause, signal-provenance, di-doctor) and acts as a demo host. The MV3 extension records change-detection cycles and signal/DI graphs in the page's MAIN world, relays shaped facts to the DevTools panel, and the panel calls the browser Prompt API locally. Pure tracer logic lives in `src/main-world/*` and is unit-tested on recorded data.
- **Conventions**: Strict TypeScript (`strict`, `noUncheckedIndexedAccess`); node:test runner with `--experimental-strip-types`; tests colocated as `*.test.mjs`/`*.spec.ts`; kebab-case file names; commit subjects use milestone prefixes (`build:`, `ship:`, `fix:`, `inspect:`). Skills mirror between `.commandcode/skills` and `.claude/skills` for two control/verify skills.
- **Maturity**: `npm run check` and `npm test` are green (546 tests). Extension builds via `npx nx run angular-ai-devtools:build-extension` (not run here). Angular app unit specs exist but are not part of `npm test` (see finding). Active milestone M010 (N4 error explainer) has roadmap intent but no implementation code yet.
- **Recent activity**: 556 commits on `main`; latest `fc9447b` records a user-scope GSD scripts taste preference; M009 consolidation-hardening shipped 2026-10-29; M010 `n4-error-explainer` bound 2026-10-30. Prior milestones M001-M009 shipped; M011/M012 pending.

## Finding: Baseline checks pass in a bridged verify sidecar

- **Claim**: Type checking and the full node:test suite pass in a freshly bridged verify sidecar.
- **Source**: command: `cd <sidecar> && npm run check` -> exit 0; `cd <sidecar> && npm test` -> "tests 546, pass 546, fail 0".
- **Confidence**: high
- **Why it matters here**: Confirms the recorded clean baseline; sidecar lacks node_modules and needs the junction bridge.

## Finding: Verify sidecars ship without node_modules

- **Claim**: A verify sidecar has no `node_modules` directory until bridged to the primary worktree.
- **Source**: sidecar node_modules absent before bridge; AGENTS.md lines 13-22.
- **Confidence**: high
- **Why it matters here**: Any command run in a sidecar must use `scripts/sidecar-deps-bridge.mjs` first; forgetting it yields TS2688.

## Finding: npm test does not run Angular app spec files

- **Claim**: `npm test` globs only `scripts/**/*.test.mjs` and `extension/**/*.test.mjs` plus user-scope and skill tests; it does not execute `apps/angular-ai-devtools/src/app/*.spec.ts` even though those specs and an Nx `@angular/build:unit-test` target exist.
- **Source**: package.json:9-10; apps/angular-ai-devtools/project.json:103-108.
- **Confidence**: high
- **Why it matters here**: A green `npm test` does not cover the Angular demo app's unit specs; coverage claims must distinguish the two runners.

## Finding: M010 (N4 error explainer) has no implementation code yet

- **Claim**: Despite M010 being the active milestone, the extension contains no error-capture hooks (no `console.error`/`window.onerror`/`unhandledrejection` handling) and no offline error digest generation.
- **Source**: grep `console\.error|window\.onerror|unhandledrejection` under `extension/` -> no matches; ROADMAP.md M010 scope lines 381-388.
- **Confidence**: high
- **Why it matters here**: The current codebase is still at the M009 shipped state; N4 work is entirely ahead.

## Finding: Prompt API runs only in the DevTools panel

- **Claim**: The MV3 extension keeps the Prompt API out of page/content/service-worker contexts; `background.js` documents that it runs in the page's MAIN world via `agent-main.js` only for profiling, and the panel calls the model locally.
- **Source**: extension/manifest.json:14-30; extension/background.js:2.
- **Confidence**: high
- **Why it matters here**: Any new N4 work must preserve this security boundary (no model calls in content scripts).

## Finding: Extension manifest is MV3 with three content-script entry points

- **Claim**: The extension declares a service worker plus two content scripts (`relay.js` and `agent-main.js` in MAIN world) and a DevTools page, with `<all_urls>` host permissions.
- **Source**: extension/manifest.json:1-37.
- **Confidence**: high
- **Why it matters here**: New page-agent hooks for M010 must be added as content scripts here and respect the MV3 service-worker lifetime model.

## Finding: App exposes three feature routes

- **Claim**: The demo Angular app routes to N1 (update-cause), N2 (signal-provenance), and N3 (di-doctor) components, with update-cause as the default.
- **Source**: apps/angular-ai-devtools/src/app/app.routes.ts:6-9.
- **Confidence**: high
- **Why it matters here**: New N4/N24/N25 features will need a fourth route and component following this pattern.

## Apparent intent

- The project is becoming a DevTools extension for on-device AI explanations of Angular runtime behavior, built incrementally as numbered features (N1-N3 shipped, N4 active, N24/N25 pending) on top of Angular's Tier-0 profiling/signal/DI APIs, with a strong emphasis on reproducible verification across four browser/model pairs.

## Open questions for define

- Should the N4 error explainer add a new app route and panel tab, or extend the existing panel shell?
- Will the offline angular.dev/errors digest be generated at build time via an Nx target, and where will the generator live?
- Are the Angular app specs (`*.spec.ts`) expected to be wired into `npm test`, or only via `nx run angular-ai-devtools:test`?

## Blocked areas

- Extension build (`npx nx run angular-ai-devtools:build-extension`) not run; only `npm run check` and `npm test` executed in the sidecar.
- Browser/model verification (control-ai-browsers) not run; out of scope for this inspect step.
- `apps/angular-ai-devtools` specs not executed (see finding).
