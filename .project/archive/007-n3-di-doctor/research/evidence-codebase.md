# Evidence — codebase

Repo root: D:/projects/sandbox/angular-ai-devtools
Scanned: 2026-10-27
Checks run: static inspection only (no npm/build per sidecar rule); git log --oneline -15.

## Map

- **Stack**: Angular 22.1 (core/common/compiler/forms/platform-browser/router), RxJS 7.8, TypeScript 6.0.3; Nx 23.3 (angular/js/web/playwright/devkit); Angular CLI/devkit ~22.1; Playwright ^1.37; Vitest ^4.0.8; Node (types ^26.6.5). Package is private, ESM ("type": "module"). No angular.json present; Nx drives projects.
- **Entry points**: Extension (MV3) — extension/manifest.json → background.js service worker, relay.js content script, agent-main.js MAIN-world agent, devtools.html/panel. Apps — apps/angular-ai-devtools (Angular app) + apps/angular-ai-devtools-e2e (Playwright). src/main-world and src/panel (source compiled into extension). e2e/provenance.spec.ts.
- **Architecture**: Monorepo-ish sandbox: Angular app under test + MV3 Chrome extension that injects a MAIN-world agent (agent-main) and a relay content script bridging to a DevTools panel; provenance tracing / signal provenance (M006). Nx caches builds; extension loaded unpacked from extension/.
- **Conventions**: tsc strict with noUncheckedIndexedAccess; node:test for scripts; skills mirror test between .claude and .commandcode. Commits follow "build: ...", "attest: Txxx — ...", "ship: Mxxx".
- **Maturity**: M006 complete (signal-provenance). Extension v0.3.0. Tests: node:test scripts + skills. Sidecar bridge handles node_modules junctions. Some legacy sidecars need manual junction.
- **Recent activity**: Last 15 commits all M006 (signal-provenance): T001 provenance tracer MAIN-world, T002 chain traversal, T003 anti-pattern detector, T004 panel UI, T005 browser test counter fixture, T006 regression gate, wave reviews, completion.

## Finding: No angular.json; Nx is the project driver

- **Claim**: There is no angular.json at repo root; projects are defined under apps/ and driven by Nx.
- **Source**: repo root listing (no angular.json); nx.json present.
- **Confidence**: high
- **Why it matters here**: Build commands use `npx nx run angular-ai-devtools:build-extension`, not `ng build`.

## Finding: Extension is shipped pre-built in extension/

- **Claim**: extension/ contains compiled artifacts (agent-main.js, panel.js, relay.js, background.js, devtools.js) loaded directly by Chrome; source lives in src/.
- **Source**: extension/manifest.json; extension/agent-main.js etc.
- **Confidence**: high
- **Why it matters here**: Edits to src/ require rebuilding into extension/ before testing.

## Finding: M006 just completed

- **Claim**: Most recent milestone M006 (signal-provenance) completed; git history shows T001–T006 attest commits plus wave reviews.
- **Source**: git log --oneline -15.
- **Confidence**: high
- **Why it matters here**: M007 inspect phase follows immediately; baseline is post-M006.

## Finding: Verify sidecar unavailable

- **Claim**: No faithful verify sidecar revision supplied; runtime checks (npm test, tsc) not run.
- **Source**: brief states "Verify sidecar: NOT AVAILABLE".
- **Confidence**: high
- **Why it matters here**: Test-pass claims unverifiable; rely on static evidence.

## Apparent intent

- Project becoming an Angular devtools extension with on-device Prompt API (AI) for provenance/signal analysis — based on manifest description and M006 signal-provenance work.

## Open questions for define

- What is the M007 milestone scope? (not stated in repo)
- Is extension/ checked in built output expected to be regenerated?

## Blocked areas

- npm test / tsc — sidecar unavailable (unverifiable)
- .gsd-path sidecar — not available; no writes attempted