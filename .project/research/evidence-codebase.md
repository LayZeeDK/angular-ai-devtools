# Evidence — codebase

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-01
Checks run: `npm run check` (sidecar, bridged) → exit 0; `node --experimental-strip-types --test "scripts/**/*.test.mjs"` → 59/59 pass; `npm run test:skills` → 588/588 pass; `npx nx run angular-ai-devtools:test` → 46/46 pass; `npx nx run angular-ai-devtools:build-extension` → success (cached).

## Map

- **Stack**: Angular ~22.1.0 (core/common/forms/router/compiler), Nx 23.3.0, TypeScript 6.0.3, Node (ESM, `"type": "module"`), RxJS ~7.8. Vitest ^4.0.8 (Angular unit tests via `@angular/build:unit-test`), Playwright ^1.37 (e2e), jsdom. Manifest-style Angular app under `apps/angular-ai-devtools`; MV3 Chrome/Edge extension under `extension/`.
- **Entry points**: `apps/angular-ai-devtools/src/main.ts` → `bootstrapApplication(App, appConfig)`; routes in `apps/angular-ai-devtools/src/app/app.routes.ts` (`''`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop`). Extension: `extension/manifest.json` (MV3) service worker `background.js`, content scripts `relay.js` + `agent-main.js` (MAIN world), devtools page `devtools.html`, panel `panel.html`. Nx targets in `apps/angular-ai-devtools/project.json` (`build`, `build-extension`, `serve`, `test`).
- **Architecture**: Three-layer. (1) MAIN-world recorder/tracers in `src/main-world/*` (update-cause chain, signal provenance, DI path tracer, error capture, stale-view scan, interop keep-list) read Angular internals (`ng.ɵsetProfiler`, `ng.ɵgetSignalGraph`, `ng.ɵgetInjector*`, `ng.getOwningComponent`). (2) Panel UI in `src/panel/*` + `src/app/*` components renders chains/findings and calls the on-device Prompt API. (3) MV3 extension (`extension/*`: background, relay, agent-main, devtools, panel) bridges page ↔ DevTools panel. Build-time `scripts/generate-error-digest.mjs` produces `extension/error-digest.json` (one entry per code, ≤150 tokens). Per-page scan runs in a worker (stale-view).
- **Conventions**: Scripts use Node's built-in test runner (`node:test`, `*.test.mjs`); Angular tests use `*.spec.ts` via vitest-angular; node tests run with `--experimental-strip-types`. TypeScript strict, `noUncheckedIndexedAccess`. Conventional commits with milestone/task prefixes (`build:`, `ship:`, `T0xx:`, `docs(gsd):`, `chore(taste):`). Two skills trees: `.commandcode/skills/` is maintained; `.claude/skills/` holds byte copies only for `control-ai-browsers` and `verify-ai-browsers` (parity test enforces). AGENTS.md is the rule surface; `.project/` holds GSD state.
- **Maturity**: Baseline green at HEAD ff8246c — `npm run check` 0, scripts 59/59, skills 588/588, Angular unit 46/46, build-extension success. 14 milestones shipped (M001–M013), M014 active. 36 `*.spec.ts`, 101 `*.test.mjs`, 2 `*.node.test.ts`. Single contributor (Lars Gyrup Brink Nielsen), 753 commits in last 30 days.
- **Recent activity**: Last 30 commits cluster in `.project/` (docs audit closure M013: verify ledger, audit rows, tutor corrections) and AGENTS.md; M014 prepared (roadmap + standing grant). Code-level work last touched interop (M012) and stale-view (M011); M014's deliverable is proving interop end-to-end.

## Finding: Verify sidecar has no node_modules; dependency bridge is automatic

- **Claim**: A freshly created verify sidecar runs `npm run check` with zero manual steps because `scripts/ensure-sidecar-deps.mjs` bridges `node_modules` from the primary worktree.
- **Source**: `AGENTS.md` lines 13-22; `scripts/ensure-sidecar-deps.mjs`; run in sidecar → exit 0.
- **Confidence**: high
- **Why it matters here**: Inspectors must not assume a sidecar is broken when `node_modules` is absent; the bridge is expected.

## Finding: Only two skill folders are kept in sync between the two trees

- **Claim**: `.claude/skills/` contains byte copies of only `control-ai-browsers` and `verify-ai-browsers`; all other `.claude/skills/` folders are stale, older copies.
- **Source**: `AGENTS.md` lines 38-41; `scripts/skills-mirror.test.mjs` (588-test run green).
- **Confidence**: high
- **Why it matters here**: Editing a skill in `.commandcode/skills/` does not propagate to `.claude/skills/` except for those two; planners must know which tree is authoritative.

## Finding: Install scripts were relocated out of the repo

- **Claim**: The nine `install-*` scripts and their tests now live under `~/.commandcode/scripts/` (moved in M008); the in-repo `tsconfig.json` references an absolute user path `C:/Users/LarsGyrupBrinkNielse/.commandcode/scripts/...`.
- **Source**: `AGENTS.md` (M008); `tsconfig.json` lines 5-9.
- **Confidence**: high
- **Why it matters here**: The repo is not self-contained for its own type-check inputs; a different user path breaks `npm run check`.

## Finding: The `stale-view` route is a dev-only fixture, not shipped app code

- **Claim**: The `/stale-view` route (N24) lives in `spikes/ng222-app/src/app/stale-view-fixture.ts`, gated as a dev-only fixture by owner ruling 2026-10-30; the main app's route at `apps/.../app.routes.ts:14` is a consumer surface.
- **Source**: `AGENTS.md` lines 51-57; `apps/angular-ai-devtools/src/app/app.routes.ts:14-15`.
- **Confidence**: high
- **Why it matters here**: Treating the fixture as production code would mis-scope changes; N25's interop proof depends on this fixture.

## Finding: N25 interop verification is still open (M014 active)

- **Claim**: M012 shipped the interop explainer but left its live `verify-ai-browsers/checks/interop.mjs` run unproven; M014 (status active) exists specifically to close that debt.
- **Source**: `.project/ROADMAP.md` M012/M014 sections; `AGENTS.md` lines 58-62.
- **Confidence**: high
- **Why it matters here**: Any plan assuming interop is verified would be wrong; it is prepared but not proven.

## Finding: Build-extension emits into `extension/panel` and runs a digest generator first

- **Claim**: `build-extension` depends on `generate-error-digest` (`scripts/generate-error-digest.mjs`) and writes to `extension/panel` with `baseHref /panel/` and no output hashing.
- **Source**: `apps/angular-ai-devtools/project.json` lines 52-92; run succeeded (digest wrote 64 entries).
- **Confidence**: high
- **Why it matters here**: The extension panel is a build artifact, not hand-edited source; `extension/panel/` is generated.

## Finding: Angular unit tests exclude `*.node.test.ts`

- **Claim**: The Nx `test` target includes `**/*.spec.ts` and excludes `**/*.node.test.ts`; the two node-test files (`interop-attribution.node.test.ts`, `interop-slice.node.test.ts`) run only under the root `node --test` glob.
- **Source**: `apps/angular-ai-devtools/project.json` lines 113-124; root `package.json` scripts.test.
- **Confidence**: high
- **Why it matters here**: A test count from `nx test` alone understates coverage; node tests must be run separately.

## Finding: Single-author, milestone-driven repository

- **Claim**: All 753 commits in the last 30 days are by one author (Lars Gyrup Brink Nielsen), organised as 14 GSD milestones with archived evidence.
- **Source**: `git log --format="%an"` grouped; `.project/ROADMAP.md`; `.project/archive/`.
- **Confidence**: high
- **Why it matters here**: Conventions and decisions are one person's; no multi-maintainer review process to rely on.

## Apparent intent

- The project is becoming a Chrome/Edge DevTools extension ("Angular AI DevTools") whose panel uses on-device LLMs (Prompt API) to explain Angular reactivity, DI, errors, stale views, and RxJS interop — inference from `extension/manifest.json`, `src/panel/`, `src/main-world/`, and milestones M004–M012.
- It doubles as a research vehicle: spikes under `spikes/ng222-app` and `spikes/ng222-ssr` plus committed evidence under `research/` — inference from `research/`, `spikes/`, roadmap.
- The toolchain work (sidecars, skills mirror, installers) suggests the repo is also a test bed for GSD Path itself — inference from M002/M003/M008 and `.commandcode/`.

## Open questions for define

- Is interop verification (M014) expected to complete before the next feature milestone, or can new N-features start in parallel?
- Are the stale `.claude/skills/` copies (other than the two mirrored ones) intended to be removed, or kept as legacy?
- Should the absolute user path in `tsconfig.json` be made relative/portable, or is single-host use assumed?
- Which of the 14 milestones' archived evidence should a new contributor read first?

## Blocked areas

- Browser/e2e verification (`tests/browser`, `apps/...-e2e`, `verify-ai-browsers`) — not run; static evidence only, per constraint. Recorded as unverifiable.
- `control-ai-browsers` live instance runs — not attempted (no browser started).
- Docs audit content — handled by the separate docs inspector; not re-derived here.