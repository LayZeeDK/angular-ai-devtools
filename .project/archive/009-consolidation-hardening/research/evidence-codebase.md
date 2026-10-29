# Evidence — codebase

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-28
Checks run: `tsc -p tsconfig.json` (sidecar, bridged) → exit 0; `npm test` (sidecar) → 522 pass, 0 fail; `npm run check` (sidecar) → exit 0 (root tsc + 4 skill tsconfigs); git log -20 (primary) → HEAD 2bd0eef

## Map

- **Stack**: TypeScript 6.0.3 (package.json devDependencies), Angular ~22.1.0 (core/common/forms/router/compiler-cli/build/devkit/schematics), Nx 23.3.0 (@nx/angular/devkit/js/playwright/web), Vitest ^4.0.8, Playwright ^1.37.0, RxJS ~7.8.0. Node observed v24.22.0, npm 12.2.0. ESM ("type": "module"). No root tsconfig project beyond tsconfig.json.
- **Entry points**: `apps/angular-ai-devtools/src/main.ts` (Angular bootstrapApplication, browser entry named in project.json `build.browser`); `apps/angular-ai-devtools/src/main.ts` reused for `build-extension` (output `extension/panel`); MV3 manifest entry points `extension/background.js` (service_worker), `extension/relay.js` and `extension/agent-main.js` (content_scripts), `extension/devtools.html` (devtools_page). No CI config files found at repo root (glob for .github/.gitlab-ci.yml returned none).
- **Architecture**: Nx Angular application (`apps/angular-ai-devtools`) plus an MV3 DevTools extension (`extension/`). Shared TypeScript lives under `src/` split into `src/panel/*` (panel-side modules) and `src/main-world/*` (page-context tracers). Scripts under `scripts/` provide tooling and tests. Control/verify skills live under `.commandcode/skills/` with byte copies under `.claude/skills/`. Spikes under `spikes/` (4 subtrees). E2E under `apps/angular-ai-devtools-e2e` and `e2e/`. No README present.
- **Conventions**: `npm run check` = root tsc + skill tsconfigs; `npm test` = node:test over scripts + extension + user-scope runner + skill tests. Tests use node:test and vitest. Commits use conventional-ish prefixes (ship/build/plan/chore/fix). Skills mirror parity enforced by `scripts/skills-mirror.test.mjs`.
- **Maturity**: Baseline green at 2bd0eef: 522 tests pass, 0 fail; root + skill type checks pass. Extension is MV3 v0.3.0. Several panel features shipped (N1-N3). M009 active (consolidation-hardening). Pending milestones M010-M012 not yet built. `src/regression.spec.ts` is a vacuous placeholder.
- **Recent activity**: Last 20 commits cluster on M008 tooling (install scripts moved to user scope, review-panel families) and M009 inspection binding; earlier M007 (DI doctor) and M006 (signal provenance). Work has been happening in scripts/skills/tooling recently.

## Finding: Angular app entry point is a single bootstrap file

- **Claim**: The only application entry point is `apps/angular-ai-devtools/src/main.ts`, which calls `bootstrapApplication(App, appConfig)`; both `build` and `build-extension` targets point their `browser` option at this same file.
- **Source**: `apps/angular-ai-devtools/project.json:17,62`; `apps/angular-ai-devtools/src/main.ts:1-7`
- **Confidence**: high
- **Why it matters here**: Any change to bootstrap affects both the standalone app build and the extension panel build.

## Finding: MV3 manifest declares four extension entry scripts

- **Claim**: `extension/manifest.json` (MV3, version 0.3.0) registers `background.js` as the service worker, `relay.js` and `agent-main.js` as content scripts (agent-main in MAIN world), and `devtools.html` as the devtools page.
- **Source**: `extension/manifest.json:2-37`
- **Confidence**: high
- **Why it matters here**: These four files are the extension's runtime surface; renaming or removing any breaks the manifest contract.

## Finding: Extension panel is produced by an Angular build target

- **Claim**: `build-extension` writes to `extension/panel` (base output) with `baseHref` `/panel/` and no output hashing, reusing the Angular app's main.ts and public assets.
- **Source**: `apps/angular-ai-devtools/project.json:52-89`
- **Confidence**: high
- **Why it matters here**: The panel is not a separate project; it shares the app's dependency graph.

## Finding: Test runner spans scripts, extension, and skills

- **Claim**: `npm test` runs `node --experimental-strip-types --test` over `scripts/**/*.test.mjs` and `extension/**/*.test.mjs`, then `scripts/run-user-scope-tests.mjs`, then skill tests under `.claude/skills` and `.commandcode/skills`.
- **Source**: `package.json:9-10`
- **Confidence**: high
- **Why it matters here**: A test file placed outside these globs will not run under `npm test`.

## Finding: Skills mirror parity is a tested invariant

- **Claim**: `.claude/skills/control-ai-browsers` and `verify-ai-browsers` must byte-match their `.commandcode/skills` counterparts; `scripts/skills-mirror.test.mjs` fails otherwise.
- **Source**: `AGENTS.md` (skills-mirror rule); test output in `npm test` (2 parity tests passed)
- **Confidence**: high
- **Why it matters here**: Edits to one tree require copying to the other before checks pass.

## Finding: Sidecar dependency bridge is automated but requires invocation

- **Claim**: Verify sidecars ship without `node_modules`; `scripts/sidecar-deps-bridge.mjs` creates a junction to the primary worktree's `node_modules`. The bridge is not invoked by `npm run check` itself; it must be run (or be already present) for checks to resolve modules.
- **Source**: `scripts/sidecar-deps-bridge.mjs:87-115`; `AGENTS.md` (Verify sidecar dependencies)
- **Confidence**: high
- **Why it matters here**: In this run the bridge was created manually and `npm run check` then passed; a fresh sidecar without the bridge fails with TS2688.

## Finding: No CI configuration present in repo root

- **Claim**: No `.github`, `.gitlab-ci.yml`, or other CI manifest was found at the repository root (glob returned none outside node_modules).
- **Source**: glob `**/.github/**`, `**/*.yml` filtered to root-level (only node_modules matches)
- **Confidence**: medium
- **Why it matters here**: Verification status relies on local commands; there is no observed automated pipeline definition in-repo.

## Finding: Regression spec is vacuous

- **Claim**: `src/regression.spec.ts` contains one test, `describe('M006 regression gate')` with `it('passes')` asserting `expect(true).toBe(true)`.
- **Source**: `src/regression.spec.ts:3-6`
- **Confidence**: high
- **Why it matters here**: This file contributes a passing test without exercising behavior.

## Finding: Four spike subtrees exist

- **Claim**: `spikes/` contains four directories: `ng222-app`, `ng222-ssr`, `probes`, `s1-extension`.
- **Source**: `spikes/` directory listing
- **Confidence**: high
- **Why it matters here**: These are the fixture targets referenced by browser tests; M009 may retire unused ones after evidence archiving.

## Finding: E2E surface is minimal

- **Claim**: `e2e/` holds a single spec `provenance.spec.ts`; `apps/angular-ai-devtools-e2e` is an Nx project with no declared targets (`"targets": {}`).
- **Source**: `e2e/` listing; `apps/angular-ai-devtools-e2e/project.json:10`
- **Confidence**: high
- **Why it matters here**: E2E coverage appears to be driven by Playwright config rather than Nx targets.

## Finding: Tests directory contains only browser tests

- **Claim**: `tests/` contains one subdirectory `browser/` and no top-level test files.
- **Source**: `tests/` listing
- **Confidence**: high
- **Why it matters here**: Browser-level verification lives under `tests/browser/`, separate from unit tests.

## Finding: No README in repository root

- **Claim**: No `README*` file exists at the repository root.
- **Source**: glob `README*` (root) → no matches
- **Confidence**: high
- **Why it matters here**: Onboarding documentation is not present at the root; AGENTS.md is the primary agent-facing doc.

## Apparent intent

- The project is becoming a consolidated, verification-heavy Angular DevTools extension: M009 explicitly hardens M001-M007 without new features, while M010-M012 define further N4/N24/N25 features as pending. — based on `.project/ROADMAP.md` (M009 scope; M010-M012 status pending) and `.project/STATE.md`.
- The tooling investment (sidecar bridge, skills mirror, user-scope test runner) suggests the intended steady state is agent-driven verification in isolated sidecars. — based on `scripts/sidecar-deps-bridge.mjs`, `AGENTS.md`.

## Open questions for define

- Which of the four spike subtrees (`spikes/`) are actually still referenced by tests vs. candidates for retirement under M009?
- Is `src/regression.spec.ts` intended to be replaced with a real gate, or removed?
- Where is the authoritative documentation entry point given no root README?

## Blocked areas

- None observed; all inspected paths were readable. Browser-based extension verification was not run (requires browser instances and is out of scope for this read-only inspect).