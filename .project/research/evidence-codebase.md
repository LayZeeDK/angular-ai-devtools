# Evidence - codebase

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-01
Checks run: static only.


## Map

- **Stack**: TypeScript 6.0.3 (pinned), Angular ~22.1.0, Nx 23.3.0, RxJS ~7.8.0, Node ES modules (type: module). Manifest in package.json. Tests: node:test + vitest-angular (@angular/build:unit-test).

- **Entry points**: main.ts bootstraps App with appConfig (provideRouter, provideBrowserGlobalErrorListeners). Routes: ''->N1UpdateCauseComponent, 'signal-provenance'->N2, 'di-doctor'->N3, 'error-explainer'->ErrorExplainer, 'stale-view'->StaleView, 'interop'->Interop (app.routes.ts). MV3 extension manifest v0.3.0: devtools_page devtools.html, background service_worker background.js (module), content_scripts relay.js (ISOLATED) and agent-main.js (MAIN), permissions scripting/activeTab/storage, host_permissions <all_urls>. build-extension outputs to extension/panel baseHref /panel/. Sources: package.json, nx.json, apps/angular-ai-devtools/project.json, extension/manifest.json, main.ts, app.routes.ts.

- **Architecture**: Nx monorepo (nx.json). Apps: angular-ai-devtools, angular-ai-devtools-e2e. Extension under extension/ built separately via build-extension to extension/panel. Skills: .commandcode/skills/ maintained; .claude/skills/ has byte copies only for control-ai-browsers and verify-ai-browsers (others older). Scripts/ utilities+tests. Spikes/ ng222-app/ng222-ssr/probes. Panel is Angular app with routed feature components; extension uses relay.js + agent-main.js (MAIN world).

- **Conventions**: TS 6.0.x pinned. Node tests --experimental-strip-types (node:test). Skills typechecked via check:skills (separate tsconfigs). Nx generators: Angular app e2e playwright, style css, unitTestRunner vitest-angular. AGENTS.md authoritative for process.

- **Maturity**: Buildable (build/serve/test/build-extension). Extension MV3 present. Skills infra substantial. Tests across scripts/ extension/ skills/ app specs. *.node.test.ts excluded from Angular unit-test target. generate-error-digest dependency of build-extension. Recent commits: M014 integration/ship + M015 prep.

- **Recent activity**: git -C D:\projects\sandbox\angular-ai-devtools log --oneline -5 -> 01bffa9 state: bind next milestone, 2c97f69 docs(gsd): prepare M015 and close M014 deferred items, bf92515 integrate: M014, 8ed92ce ship: M014 — interop-proof, 3210f6f build: complete milestone.


## Finding: Skills tree mirroring is partial by policy
- **Claim**: Only control-ai-browsers and verify-ai-browsers are byte copies between .commandcode/skills/ and .claude/skills/; every other .claude/skills/ folder is an older copy. control-ai-browsers shows 23 files in .claude vs 24 in .commandcode (missing \maintain\last-run.md).
- **Source**: AGENTS.md lines about skills mirroring; Get-ChildItem comparison (command result above).
- **Confidence**: high
- **Why it matters here**: Changes to shared control/verify skills require copying .commandcode over .claude or npm test/check will fail per scripts/skills-mirror.test.mjs.


## Finding: Interop fixture is present and routed
- **Claim**: AGENTS.md states interop claim (N25/M012) is producible from repo; route /interop exists (app.routes.ts:15) and spikes/ng222-app/src/app/stale-view-fixture.ts holds toSignal(this.subject) at line ~14 and unlabelled effect calling subject.error(...) at line ~22 served at /stale-view (and /stale-view-deferred).
- **Source**: apps/angular-ai-devtools/src/app/app.routes.ts:15; AGENTS.md Verification fixtures section.
- **Confidence**: high
- **Why it matters here**: Interop verification prepared (9 tests) and live run owed; route assertion passes if instance runs built panel.


## Finding: Extension is MV3 with MAIN world content script
- **Claim**: extension/manifest.json v0.3.0 defines background service_worker (module), content_scripts relay.js (ISOLATED) and agent-main.js (MAIN world), devtools_page devtools.html, permissions scripting/activeTab/storage, host_permissions <all_urls>. Build target build-extension outputs to extension/panel with baseHref /panel/ and depends on generate-error-digest.
- **Source**: extension/manifest.json; apps/angular-ai-devtools/project.json build-extension target.
- **Confidence**: high
- **Why it matters here**: Panel runs as built Angular app in extension context; MAIN world script allows direct page interaction.


## Finding: Shared browser instances require control-ai-browsers
- **Claim**: AGENTS.md states drive browsers only through control-ai-browsers skill; instances shared across checkouts/worktrees/sidecars under primary checkout's .commandcode/worktrees/.browsers/; launch via control-ai-browsers up only; Edge signs in via browser-level switches; model missing in shared profile is skill bug not env blocker.
- **Source**: AGENTS.md Browsers and on-device models section.
- **Confidence**: high
- **Why it matters here**: Verification that uses browsers must go through skill and cannot rely on local profile state in sidecars.


## Finding: M014/M015 unattended grants recorded in AGENTS.md
- **Claim**: AGENTS.md contains verbatim owner instructions granting full milestone decision authority for M014 and M015 with specific preapprove commands and stop conditions.
- **Source**: AGENTS.md Verification fixtures section (M014 runs unattended, M015 runs unattended).
- **Confidence**: high
- **Why it matters here**: Process constraints for GSD Path runs in this repo are explicitly codified.


## Finding: Verify sidecars need node_modules bridging
- **Claim**: AGENTS.md states verify sidecars ship without node_modules; npm run check fails with TS2688 unless bridged via scripts/sidecar-deps-bridge.mjs (auto) or junction mklink /J. Legacy manual procedure documented.
- **Source**: AGENTS.md Verify sidecar dependencies section.
- **Confidence**: high
- **Why it matters here**: Sidecar-based verification requires dependency bridging or use of provided bridge script.


## Finding: Panel build depends on error digest generation
- **Claim**: build-extension target in apps/angular-ai-devtools/project.json dependsOn ['generate-error-digest'] which runs node scripts/generate-error-digest.mjs.
- **Source**: apps/angular-ai-devtools/project.json build-extension and generate-error-digest targets.
- **Confidence**: high
- **Why it matters here**: Extension build has a pre-step that must succeed.


## Finding: Test layout splits node and Angular tests
- **Claim**: package.json test runs node:test on scripts/**/*.test.mjs and extension/**/*.test.mjs, then node scripts/run-user-scope-tests.mjs, then test:skills, then test:app (nx run angular-ai-devtools:test). Angular unit-test target excludes **/*.node.test.ts.
- **Source**: package.json scripts.test and test, apps/angular-ai-devtools/project.json test target.
- **Confidence**: high
- **Why it matters here**: Different test runners for different areas; node tests run with --experimental-strip-types.


## Apparent intent
- **Inference**: Project appears to be an Angular DevTools-like panel + Chrome MV3 extension for AI-assisted debugging (features: update-cause/N1, signal-provenance/N2, di-doctor/N3, error-explainer, stale-view, interop) with browser automation skills and verification harnesses — based on routes/components, extension manifest, control/verify-ai-browsers skills, and AGENTS.md verification fixtures.


## Open questions for define
- **Question**: Which parts of the panel are production vs experimental? (spikes/ present; some features may be fixtures for verification)
- **Question**: What is the intended relationship between .commandcode/skills (maintained) and .claude/skills (partial copies)?


## Blocked areas
- **area**: Running builds/tests — blocked by instruction (do not run npm/build/test/browser). Static evidence only.

