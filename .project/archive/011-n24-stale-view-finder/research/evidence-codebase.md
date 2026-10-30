# Evidence — codebase

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-30
Checks run: static inspection only (no npm/build/test commands run). Searched manifests (package.json, nx.json, apps/*/project.json), source entries (apps/angular-ai-devtools/src/main.ts), extension manifest (extension/manifest.json), CI/workflow files (no .github directory; no *.yml/*.yaml at repo root outside .playwright-cli), and git log --oneline -20.

## Map

- **Stack**: Angular ~22.1.0 (common/compiler/core/forms/platform-browser/router), Nx 23.3.0 (@nx/angular, @nx/devkit, @nx/js, @nx/playwright, @nx/web), TypeScript 6.0.3, Node types ^26.6.5, Vitest ^4.0.8, Playwright ^1.37.0, RxJS ~7.8.0, jsdom ^27.1.0. ESM ("type": "module"). package.json at repo root is the single workspace manifest; no separate app package.json.
- **Entry points**: apps/angular-ai-devtools/src/main.ts bootstraps App with appConfig (browser global error listeners + router). Nx targets in apps/angular-ai-devtools/project.json: build (browser entry apps/.../src/main.ts), build-extension (same entry, output extension/panel, baseHref /panel/, depends on generate-error-digest), serve, test (@angular/build:unit-test), serve-static. Extension entry: extension/manifest.json MV3 service worker background.js, content scripts relay.js (isolated world) and agent-main.js (MAIN world), devtools page devtools.html -> devtools.js creates panel at panel/index.html. Tooling entry: scripts/generate-error-digest.mjs (invoked by generate-error-digest target); scripts/ensure-sidecar-deps.mjs (invoked by npm run check). No CI workflow files found at repo root or under .github (searched).
- **Architecture**: Single Angular application (routes: empty -> N1UpdateCauseComponent, signal-provenance -> N2SignalProvenanceComponent, di-doctor -> N3DiDoctorComponent, error-explainer -> ErrorExplainerComponent) plus an MV3 Chrome extension. The extension panel is the same Angular app built into extension/panel/. MAIN-world agent-main.js records change-detection cycles via Angular's profiler (ng.ɵsetProfiler) and signal graph (ng.ɵgetSignalGraph), dispatches CustomEvents captured by isolated-world relay.js and forwarded to the service worker background.js. Supporting services in apps/.../src/app: signal-provenance, di-doctor, extension-message, extension-prompt, update-cause-chain, anti-pattern-detector. Scripts provide digest generation, sidecar dependency bridging, and test orchestration.
- **Conventions**: Component/service files named by feature with n1-/n2-/n3- prefixes and co-located *.spec.ts. Services suffixed .service.ts; display helpers *-display.ts. TypeScript strict via tsc project references (tsconfig.json, .claude/skills tsconfig*.json, .commandcode/skills tsconfig*.json). Commit messages use conventional prefixes observed in git log: chore(taste):, docs:, integrate:, ship:, build:, T0xx:. Tests split: root scripts/**/*.test.mjs and extension/**/*.test.mjs via node:test, plus .claude/.commandcode skills tests, plus Nx app test (npm run test:app).
- **Maturity**: Angular app has 7 spec files under apps/.../src/app (anti-pattern-detector, app, di-path-display, extension-message.service, extension-prompt.service, n1-update-cause.component, n3-di-doctor.component, signal-provenance.service, plus signal-provenance.spec and update-cause-chain.spec). Extension has *.test.mjs for background, agent-main, error-digest, relay. Held-out verification tests live under tests/held-out/ (e1-e12, browser-specific panel tests). Playwright e2e under e2e/provenance.spec.ts and tests/browser/di-regression.spec.ts. npm run check = type check root + skills; npm test = node:test scripts/skills + user-scope tests + app tests. No deploy/publish targets observed in manifests.
- **Recent activity**: Last commits cluster on N4 error-explainer (T009-T012), sidecar dependency bridge (ensure-sidecar-deps.mjs, sidecar-deps-bridge.mjs), verification portal rule, and taste records. Git HEAD at scan: 79c8455. Recent work touched .project/STATE.md, docs/feature-proposals.md, .commandcode/taste/*, control-ai-browsers skill, and extension error capture.

## Finding: Extension panel reuses the Angular application entry

- **Claim**: The extension panel is built from the same Angular entry (apps/angular-ai-devtools/src/main.ts) as the standalone app, with baseHref /panel/ and output extension/panel.
- **Source**: apps/angular-ai-devtools/project.json targets build and build-extension (browser: apps/.../src/main.ts; build-extension outputPath base extension/panel, baseHref /panel/).
- **Confidence**: high
- **Why it matters here**: A single Angular codebase serves both surfaces; changes to routes/components affect the extension panel too.

## Finding: agent-main requires zoneless Angular 22

- **Claim**: agent-main.js announces unsupported and stops when the page uses ZoneNgZone; it only supports NoopNgZone (zoneless) Angular 22.
- **Source**: extension/agent-main.js functions detectZone and tryInstall (zone === "zone" branch calls announceState(false, "Zone.js change detection is not supported; use zoneless Angular 22")).
- **Confidence**: high
- **Why it matters here**: The extension cannot profile zone-based Angular apps; this is a hard runtime constraint, not a config option.

## Finding: build-extension depends on digest generation

- **Claim**: The extension build target declares dependsOn: ["generate-error-digest"], which runs node scripts/generate-error-digest.mjs; scripts/generate-error-digest.mjs is 101,987 bytes.
- **Source**: apps/angular-ai-devtools/project.json target build-extension; scripts/generate-error-digest.mjs file size 101987 bytes; extension/error-digest.json exists.
- **Confidence**: high
- **Why it matters here**: Extension builds cannot be reproduced without running the digest generator; the committed extension/error-digest.json and large generator are part of the build chain.

## Finding: no CI workflow files present

- **Claim**: No .github directory and no *.yml/*.yaml workflow files (excluding .playwright-cli) were found at the repo root.
- **Source**: directory listing of repo root (no .github); search for *.yml/*.yaml outside .playwright-cli returned none.
- **Confidence**: high
- **Why it matters here**: CI execution cannot be inferred from repository files; any CI behavior is unverifiable from static evidence.

## Finding: held-out verification tests are part of the test tree

- **Claim**: tests/held-out/ contains 16 *.test.mjs files (e1-e12 plus browser-specific panel tests) that are discovered by npm test via scripts/run-user-scope-tests.mjs.
- **Source**: tests/held-out/ file listing; package.json script test includes node scripts/run-user-scope-tests.mjs.
- **Confidence**: medium
- **Why it matters here**: Verification gating lives in the test tree, not in CI config; exact discovery rules are in run-user-scope-tests.mjs (not fully inspected here).

## Apparent intent

- The project is becoming an on-device AI devtools for Angular: an MV3 extension (Chrome Prompt API) that records change-detection causality, signal provenance, DI resolution, and error explanation for Angular 22 zoneless apps — based on extension/agent-main.js, routes N1-N4, and docs/feature-proposals.md.

## Open questions for define

- Does the extension support any Angular version other than 22.x (profiler enum values are hard-coded for 22.x in agent-main.js)?
- Is extension/panel/ committed build output expected to be regenerated on every change, or treated as a committed artifact?
- What is the intended distribution mechanism (Chrome Web Store vs. unpacked) given no publish targets in manifests?

## Blocked areas

- Runtime behavior (tests, type check, builds) not executed per read-only/static-evidence rule; recorded as unverifiable. Browser verification requires the control-ai-browsers skill and installed browser profiles (outside this inspection scope).
- .project/archive excluded per brief; archived milestone evidence not inspected.
