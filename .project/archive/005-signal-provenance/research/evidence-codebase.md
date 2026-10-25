# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-23
Checks run: `npm run check` (sidecar, bridged node_modules) → exit 0 (tsc root + skills); `npm test` (sidecar) → 522/522 pass (node:test scripts + skills).

## Map

- **Stack**: TypeScript 6.0.3 (`package.json`); Angular ~22.1.0 (core/common/forms/router/compiler); Nx 23.3.0 (angular/devkit/js/web/playwright); @angular/build application builder; Vitest ^4.0.8; Playwright ^1.37.0; jsdom ^27.1.0; Node ESM (`"type": "module"`). No production runtime beyond Angular/RxJS/tslib.
- **Entry points**: App entry `apps/angular-ai-devtools/src/main.ts` (Angular standalone app, routed to `N1UpdateCauseComponent`); extension MV3 `extension/manifest.json` with service worker `background.js`, content scripts `relay.js` (isolated) + `agent-main.js` (MAIN world), devtools page `devtools.html`; devtools panel built from the same Angular app via `build-extension` into `extension/panel` with `baseHref: /panel/`.
- **Architecture**: Nx workspace with one Angular application (`angular-ai-devtools`) plus an e2e project. The Chrome extension injects `agent-main.js` into the inspected page's MAIN world to read `window.ng` profiling hooks, record microtask-delimited change-detection cycles, and dispatch them as `angular-ai:record` CustomEvents; `relay.js` bridges to `chrome.runtime`; `background.js` relays detection to the DevTools panel. The Angular app (served as the DevTools panel) consumes cycle records via `ExtensionMessageService` and renders a change-detection cause chain (`update-cause-chain.ts`), with on-device Prompt API explanations.
- **Conventions**: ESM throughout; scripts use `node:test` (`scripts/**/*.test.mjs`, skills tests); Angular unit tests colocated as `*.spec.ts` under `src/app`; conventional commit subjects (`ship:`, `build:`, `T00X:`, `fix(...)`, `refactor:`); TypeScript pinned exactly to 6.0.3; lint/type gate is `npm run check` (tsc root + four skill tsconfigs).
- **Maturity**: Type check and full test suite green (522 tests). Extension verified in Chrome 156 (Gemini Nano) and Edge 155 (Phi-4-mini) per STATE log. Zoneless Angular 22 only; Zone.js apps explicitly unsupported. Extension version 0.3.0.
- **Recent activity**: Last milestone M004 "nx-angular-workspace" merged into main (2f75000); work clustered on extension recording/relay (029e3ff, 6e16366 dead-code removal), DevTools panel UI (5694ff2), and control/verify skill suites. Current branch `gsd-path/M005`, inspect phase.

## Finding: Extension only supports zoneless Angular 22 apps

- **Claim**: The recorder refuses to install on Zone.js apps and only supports `NoopNgZone` (zoneless) Angular pages; it hard-codes Angular 22.x profiler enum values.
- **Source**: `extension/agent-main.js:18-23` (ProfilerEvent constants comment), `extension/agent-main.js:125-128` (zone refusal), `extension/agent-main.js:78-106` (detectZone).
- **Confidence**: high
- **Why it matters here**: Any plan assuming broad Angular version/zone support is wrong; support matrix is narrow by design.

## Finding: DevTools panel is the same Angular app, built twice

- **Claim**: The Angular application is built both as a standalone app (`build`, output `dist/apps/angular-ai-devtools`) and as the extension panel (`build-extension`, output `extension/panel`, `baseHref: /panel/`, no hashing).
- **Source**: `apps/angular-ai-devtools/project.json:9-44` and `:52-89`.
- **Confidence**: high
- **Why it matters here**: Changes to the app affect both surfaces; panel rebuild (`npx nx run angular-ai-devtools:build-extension`) is required before browser verification per AGENTS.md.

## Finding: On-device Prompt API is optional and gated

- **Claim**: AI explanation features are disabled unless the Prompt API becomes available; the UI checks `prompt.ready()` and shows an availability reason, and two separate AI entry points exist (`explain` for a chain, `explainWithAi` for a version string).
- **Source**: `apps/angular-ai-devtools/src/app/n1-update-cause.component.ts:36-41,128-153`.
- **Confidence**: high
- **Why it matters here**: AI features cannot be assumed available in all browsers; plans must treat Prompt API as capability-gated.

## Finding: Skill mirror is enforced by tests

- **Claim**: `.claude/skills/control-ai-browsers` and `control-verify-ai-browsers` must be byte-identical mirrors of their `.commandcode/skills` counterparts; `npm test` fails otherwise.
- **Source**: `scripts/skills-mirror.test.mjs` (covered by `npm test` output); AGENTS.md lines 37-40.
- **Confidence**: high
- **Why it matters here**: Editing a control skill in only one tree breaks CI; both copies must be updated together.

## Finding: TypeScript version must be exactly 6.0.3

- **Claim**: The project pins TypeScript to 6.0.3 and a stale 7.x install breaks `npm run check` with TS2688; `npm ci` is the recovery.
- **Source**: `package.json:30`; `AGENTS.md` lines 7-9.
- **Confidence**: high
- **Why it matters here**: Environment drift can masquerade as code errors; verify `node_modules/typescript/package.json` before debugging type failures.

## Finding: Verify sidecars have no node_modules

- **Claim**: Verify sidecars ship without `node_modules`; checks require bridging from the primary worktree via `scripts/sidecar-deps-bridge.mjs` (junction on Windows).
- **Source**: `AGENTS.md` lines 12-21; `scripts/sidecar-deps-bridge.mjs`.
- **Confidence**: high
- **Why it matters here**: Running `npm run check`/`npm test` in a sidecar without bridging fails; the bridge must be created and removed per sidecar lifecycle.

## Finding: Recent cleanup removed the prompt bridge and welcome page

- **Claim**: T006 removed the dead prompt bridge, `content.js`, `page-script.js`, and `nx-welcome.ts`, indicating the extension moved to a single MAIN-world recorder plus relay.
- **Source**: git log commit `6e16366` (subject); `extension/` tree (no content.js/page-script.js present).
- **Confidence**: medium
- **Why it matters here**: Older docs/references may still mention removed files; do not plan against them.

## Apparent intent

- The project is becoming a Chrome DevTools panel for Angular change-detection causality ("why did this update?"), combining Angular profiler hooks with on-device AI explanation of the cause chain — based on `extension/agent-main.js`, `update-cause-chain.ts`, and the `N1UpdateCauseComponent` UI.

## Open questions for define

- Is Angular 22.x the only supported target, or is broader version support planned?
- Is Zone.js support intended, or is zoneless a deliberate constraint?
- Is the on-device Prompt API a hard dependency or a progressive enhancement?
- Should the e2e suite (`apps/angular-ai-devtools-e2e`) be part of the verification gate?

## Blocked areas

- E2E tests were not executed in this inspection (Playwright/browser orchestration not run); only their presence is recorded.
- Git history beyond the default branch was not inspected for unmerged work.