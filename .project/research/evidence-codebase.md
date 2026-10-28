# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-28
Checks run: `npm run check` in verify sidecar (after `node scripts/sidecar-deps-bridge.mjs <sidecar> D:\projects\sandbox\angular-ai-devtools`) → exit 0 (tsc root + skills). `npm test` in verify sidecar → 522 pass, 0 fail. `git log --oneline` → 469 commits; HEAD 94181b2.

## Map

- **Stack**: TypeScript 6.0.3 (pinned, package.json), Angular ~22.1.0 (common/core/forms/platform-browser/router/compiler), @angular/build/cli/devkit ~22.1.0, Nx 23.3.0 (@nx/angular/devkit/js/playwright/web), RxJS ~7.8.0, Playwright ^1.37.0, Vitest ^4.0.8, Node types ^26.6.5, jsdom ^27.1.0. Root package is `type: module`, private. Primary runtime target is an MV3 browser extension plus an Angular app used as the extension panel.
- **Entry points**: Angular app entry `apps/angular-ai-devtools/src/main.ts` built by Nx target `angular-ai-devtools:build`; extension panel is the same bundle emitted to `extension/panel` via `build-extension` (project.json). Extension service worker `extension/background.js`; content scripts `extension/relay.js` and `extension/agent-main.js` (MAIN world) from manifest.json. DevTools page `extension/devtools.html`. Root `src/main-world/*` tracers injected into inspected pages; `src/panel/*` components render in the panel. Scripts under `scripts/` are Node .mjs/.ts utilities, not part of the app.
- **Architecture**: Nx workspace with one Angular application (`apps/angular-ai-devtools`) whose build output is reused as the extension panel. A Chrome MV3 extension (`extension/`) hosts background relay, content scripts, and a DevTools panel. Main-world tracers (`src/main-world/di-lookup.ts`, `di-path-tracer.ts`, `provenance-tracer.ts`) run in the page's MAIN world and communicate with panel components (`src/panel/*`) and Angular app components (`apps/.../src/app/*`) through message services. Unit tests are colocated in the Angular app (`*.spec.ts`) plus `scripts/**/*.test.mjs` and `extension/**/*.test.mjs`; browser/e2e tests live under `tests/browser` and `e2e`.
- **Conventions**: Commit messages follow `type(scope): summary` (git log; examples `fix(scripts): ...`, `build(scripts): ...`, `chore(taste): ...`). TypeScript strict with `noEmit` for root config. Tests use `node:test` for scripts/extension and Angular/Vitest for app. Skill trees are mirrored: `.commandcode/skills/` is maintained and `.claude/skills/` holds byte copies; `scripts/skills-mirror.test.mjs` enforces parity. Nx caching enabled for build/unit-test.
- **Maturity**: `npm run check` and `npm test` both pass in the sidecar (522 tests). Extension manifest declares version 0.3.0. Large `spikes/` tree (ng222-app, ng222-ssr, s1-extension, probes) contains experimental code not referenced by the main build. `.project/` tracks a long-running GSD pipeline with archived milestones M001–M007.
- **Recent activity**: 469 commits total. Last 20 commits cluster in `.project/` (54 file touches), `scripts/` (11), `apps/` (8), `.commandcode/` (5), `src/` (5), `extension/` (3). Current branch `gsd-path/M008`, inspect phase; latest commit `94181b2 chore(taste): record the lean-orchestrator rule`.

## Finding: Verify sidecars ship without node_modules and require a dependency bridge

- **Claim**: A fresh verify sidecar has no `node_modules`; `npm run check` fails with TS2688 until `scripts/sidecar-deps-bridge.mjs` creates a junction to the primary worktree's `node_modules`.
- **Source**: AGENTS.md lines 12-21; `scripts/sidecar-deps-bridge.mjs` (doBridge/doUnlink); observed by running the bridge then `npm run check` (exit 0).
- **Confidence**: high
- **Why it matters here**: Any inspection or build check in a sidecar must use the bridge; assuming `npm ci` in the sidecar would create a separate install and violate the read-only sidecar constraint.

## Finding: Root TypeScript config type-checks only the pstack installer, not all scripts

- **Claim**: `tsconfig.json` includes only `scripts/install-pstack-opencode.mjs`, its test, and `scripts/opencode-pstack-plugin.ts`; other `scripts/*.mjs` are plain unannotated JavaScript and are not type-checked by the root project.
- **Source**: `tsconfig.json` lines 5-9 (comment + include).
- **Confidence**: high
- **Why it matters here**: Type-safety claims about the installer/utility scripts are narrower than the file list suggests; `npm run check:skills` covers the skill trees separately.

## Finding: The Angular app is reused as the extension panel bundle

- **Claim**: Nx defines `build-extension` with `outputPath.base = extension/panel` and the same browser entry `apps/angular-ai-devtools/src/main.ts`, so the Angular app is emitted directly into the extension directory.
- **Source**: `apps/angular-ai-devtools/project.json` lines 52-89.
- **Confidence**: high
- **Why it matters here**: Changes to the Angular app affect both the standalone app and the in-extension DevTools panel; there is one build artifact serving two surfaces.

## Finding: Extension manifest declares a MAIN-world content script for Prompt API access

- **Claim**: `extension/manifest.json` (v0.3.0, MV3) registers `agent-main.js` with `"world": "MAIN"` and `relay.js` as a content script, with permissions `scripting`, `activeTab`, `storage`, and `<all_urls>` host permission; the background service worker is a simple relay.
- **Source**: `extension/manifest.json` lines 1-37; `extension/background.js` (comment "Prompt API runs in the page's MAIN world via agent-main.js").
- **Confidence**: high
- **Why it matters here**: The extension's AI capability depends on the page context's Prompt API; static inspection cannot confirm runtime availability, which requires a browser instance.

## Finding: Main-world tracers and panel components are split across two source roots

- **Claim**: Tracer logic lives under `src/main-world/` (`di-lookup.ts`, `di-path-tracer.ts`, `provenance-tracer.ts`) while panel rendering lives under `src/panel/` and Angular components under `apps/angular-ai-devtools/src/app/`, bridged by `extension-message.service.ts` / `extension-prompt.service.ts`.
- **Source**: directory listing of `src/` and `apps/angular-ai-devtools/src/app/`; files `extension-message.service.ts`, `extension-prompt.service.ts`.
- **Confidence**: high
- **Why it matters here**: A change to message contracts must touch both roots and the services; there is no single shared package between them.

## Finding: Skill trees are duplicated and parity-tested

- **Claim**: Both `.claude/skills/` and `.commandcode/skills/` exist; AGENTS.md states `.commandcode/skills/` is maintained and `.claude/skills/` holds byte copies, enforced by `scripts/skills-mirror.test.mjs` (part of `npm test`).
- **Source**: AGENTS.md lines 37-40; `scripts/skills-mirror.test.mjs`; passing test run (522/522).
- **Confidence**: high
- **Why it matters here**: Editing a skill in only one tree fails `npm test`; edits must be mirrored.

## Finding: Experimental spike trees are large and not wired into the main build

- **Claim**: `spikes/` contains standalone Angular apps (`ng222-app`, `ng222-ssr`), an `s1-extension` experiment, and ~60 probe scripts; none appear in `nx.json` plugins or the root `package.json` scripts.
- **Source**: directory listing of `spikes/`; `nx.json` (plugins only `@nx/playwright/plugin`); `package.json` scripts.
- **Confidence**: medium
- **Why it matters here**: Spike code may contain useful prior art but is not built/tested by the standard checks; reusing it requires separate verification.

## Finding: Test suite is green at the audited revision

- **Claim**: `npm test` in the sidecar completed with 522 tests passed, 0 failed, 0 skipped.
- **Source**: command `npm test` run in sidecar on 2026-10-28 (output tail: "tests 522 ... pass 522 ... fail 0").
- **Confidence**: high
- **Why it matters here**: Establishes a known-good baseline for the audited commit before any milestone work.

## Apparent intent

- The project appears to be evolving from a single Angular devtools panel into a broader Angular AI DevTools extension with multiple "N" features (N1 update-cause, N2 signal provenance, N3 DI doctor) plus a DI diff/explain capability — based on `apps/.../src/app/n1-*.ts`, `n2-*.ts`, `n3-*.ts`, `di-diff-display.ts`, `di-explain.ts`, `di-path-display.ts`.
- The repo also functions as a skill/installer distribution hub for agent CLIs (scripts/install-*-command-code.mjs) and a GSD Path project-management workspace — based on `scripts/install-*.mjs` and `.project/` milestones.
- Open questions: whether the standalone Angular app target is still needed alongside the extension panel, and whether spike code is intended to be promoted or retired.

## Open questions for define

- Are the `spikes/` experiments (ng222-app, ng222-ssr, s1-extension) slated for promotion into the main app or for retirement?
- Is the standalone `angular-ai-devtools` build target (non-extension) still a supported surface, or is the extension panel the only intended delivery?
- What is the intended ownership boundary between `.claude/skills/` byte copies and `.commandcode/skills/` maintained copies when both are edited in the same milestone?

## Blocked areas

- Browser/runtime behavior of the extension (Prompt API availability, panel rendering, content-script injection) was not exercised; requires an extension build plus browser instances, which would write outside the sidecar. Static evidence only.
- The `spikes/` probe scripts were not executed; their runtime dependencies and outputs are unverified.
- `.commandcode/skills/` and `.claude/skills/` trees were not individually audited for content; only their mirror parity test result is recorded.