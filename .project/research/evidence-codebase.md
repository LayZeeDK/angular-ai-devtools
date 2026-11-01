# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-01 — via verify sidecar `gsd-path-verify/inspect-codebase` at `a133a506d2971496c38723d1e53223f3db6b61bb` (clean, matches the recorded baseline).
Checks run:
- `git status --short` → no output (clean); `git rev-parse HEAD` → `a133a506d2971496c38723d1e53223f3db6b61bb`; branch `gsd-path-verify/inspect-codebase`.
- `node --version` → v24.22.0.
- `node --experimental-strip-types --test tests/docs-alignment.test.mjs` → 5 tests, 5 pass.
- `node --experimental-strip-types --test tests/held-out/stale-view-{write-regex,version-gate,ordering,fixture-graph,dedup,fact-list-escaping}.test.mjs` → 11 tests, 11 pass.
- `node --experimental-strip-types --test tests/held-out/{e1-zero-defects-recorded,e5-unverifiable-recorded,e6-portal-dependency,e7-archive-order,e8-fixtures-retained,e10-spec-present}.test.mjs` → 22 tests, 2 pass (E7, E8), 20 fail.
- `node --experimental-strip-types --test tests/held-out/{chrome-stable-nano,chrome-beta-nano,chrome-beta-gemma4,edge-phi4mini}-panel.test.mjs tests/held-out/stale-view-worker-supersession.test.mjs` → 20 tests, 4 pass (worker), 16 fail.
- `node --experimental-strip-types --test tests/held-out/e12-clean-worktree.test.mjs` → 3 tests, 0 pass.
- `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` → **not run** (see Blocked areas).

## Map

- **Stack**: TypeScript `6.0.3` (exact pin), Angular `~22.1.0` runtime and build (`@angular/build`, `@angular/cli`, `@angular/compiler-cli`), Nx `23.3.0` (`@nx/angular ^23.3.0`), `vitest ^4.0.8` + `jsdom ^27.1.0` for app specs, `@playwright/test ^1.37.0`, `@types/node ^26.6.5`. Root package is `"private": true`, `"type": "module"`. Extension is Manifest V3, `"version": "0.3.0"`, permissions `scripting/activeTab/storage`, host permission `<all_urls>`. Host runtime measured: Node v24.22.0. Sources: `package.json`, `extension/manifest.json:2-13`.
- **Entry points**: extension — `extension/manifest.json` registers `background.js` (module service worker), `relay.js` (content script, ISOLATED, `<all_urls>`, `document_idle`), `agent-main.js` (content script, `world: "MAIN"`), and `devtools_page: devtools.html`; `extension/devtools.js` creates the "Angular AI" panel at `panel/index.html`. App — `apps/angular-ai-devtools/src/main.ts` → `bootstrapApplication(App, appConfig)`; routes in `app.routes.ts:10-17`: `''` → N1, `signal-provenance` → N2, `di-doctor` → N3, `error-explainer` → N4, `stale-view` → N24, `interop` → N25. Nx targets on `angular-ai-devtools`: `build`, `build-extension` (writes `extension/panel`, `baseHref /panel/`, depends on `generate-error-digest`), `generate-error-digest`, `serve`, `test`, `serve-static`. Sources: `extension/manifest.json:14-31`, `apps/angular-ai-devtools/project.json:8-134`.
- **Architecture**: deterministic capture runs in the inspected page. `agent-main.js` wraps `ng.ɵsetProfiler`, records microtask-delimited change-detection cycles plus `ng.ɵgetSignalGraph` snapshots, and dispatches them as `angular-ai:*` window `CustomEvent`s; `relay.js` forwards them to `chrome.runtime`; `background.js` re-broadcasts with `tabId`; the DevTools panel (the built Angular app) subscribes through `ExtensionMessageService`. Every explainer follows one shape: pure TypeScript computes a short fact list, the panel's own `LanguageModel` (`extension-prompt.service.ts`) explains it after an explicit click, and no page data goes anywhere else. The pure modules in `src/main-world/` and `src/panel/` are consumed three ways — imported by the app through deep relative paths (`../../../../src/main-world/...`), imported by `node:*` tests via `--experimental-strip-types`, and mirrored by hand into `extension/agent-main.js`. Sources: `extension/agent-main.js:1-30,583-632`, `extension/background.js`, `apps/angular-ai-devtools/src/app/extension-message.service.ts:3-4`.
- **Conventions**: standalone components only, no NgModule anywhere; components carry inline `template:` strings and inline `styles:` arrays (no separate `.html` for feature components); members are `protected readonly`, state is `signal()`/`computed()`, templates use `@if`/`@for`; every element a check asserts on carries `data-testid`. Pure logic modules are DI-free and DOM-free, with `// Pure, unit-testable` headers. Node tests use `node:test` + `node:assert/strict`; app specs use vitest globals (`tsconfig.spec.json` `types: ["vitest/globals"]`). Error handling is defensive: page-side code wraps every hook in `try {} catch {}` with `/* never throw */`. Commits use a fixed GSD Path vocabulary — `state:`, `inspect:`, `define:`, `plan:`, `build:`, `T0NN: <task>`, `integrate:`, `ship:` — not conventional-commits types, and no model name ever appears. Sources: `apps/angular-ai-devtools/src/app/n1-update-cause.component.ts:1-40`, `src/main-world/error-capture.ts:1-12`, `git log --oneline -30`.
- **Maturity**: six explainer routes exist and are wired; three test layers exist (node:test 18 files in `scripts/` + 4 in `extension/` + 28 per skills tree; vitest 11 `*.spec.ts` under `apps/`; Playwright 1 root spec). One whole layer — `tests/` (23 tracked files) — is wired into no npm script, and it fails at this head (see Finding). `e2e/provenance.spec.ts` is in no runner either. 16 milestones are archived under `.project/archive/001-…` through `016-orchestration-autonomy`; `.project/STATE.md` binds M017 `verification-coverage` at phase `inspect`.
- **Recent activity**: the last 30 commits are all dated 2026-11-01 and cluster on the orchestration harness, not the product: `.project/STATE.md`/`ROADMAP.md`, `AGENTS.md`, `scripts/user-scope-autonomy.mjs`, `scripts/run-user-scope-tests.mjs`, `.project/model-policy.json`. Notable subjects: `build: pin paid model policy per role` (395d1c7), `T001: Add user-scope autonomy conformance suite` (6256a08), `state: bind M017 verification-coverage and record its standing grant` (a133a50). The newest product-source commits are M014's interop work. Sources: `git log --format="%ad %s" --date=short -60`.

## Finding: `npm run check` type-checks three files, one of them outside the repository

- **Claim**: the root `tsconfig.json` `include` array has exactly three entries — two absolute `C:/Users/<user>/.commandcode/scripts/install-pstack-opencode*.mjs` paths and the in-repo `scripts/opencode-pstack-plugin.ts`. `check` is `node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills`, and both skills configs only glob `control-*/scripts/**/*.mjs` and `verify-*/checks/**/*.mjs`. Nothing in `check` compiles `apps/`, `src/`, `extension/` or the other 23 files in `scripts/`.
- **Source**: `tsconfig.json:1-11`; `package.json:5-6`; `.commandcode/skills/tsconfig.json:4`.
- **Confidence**: high.
- **Why it matters here**: a plan that treats the project Verify as "the TypeScript gate" will pass a type regression in `apps/` or `src/`. Those trees are only compiled by `@angular/build` during `build`/`build-extension` (`apps/angular-ai-devtools/project.json:29-50,79-90`) and by the Nx unit-test target, so `src/main-world/*` and `src/panel/*` are type-checked only where the app happens to import them.

## Finding: `npm test` is not hermetic — it runs test files out of the user home directory

- **Claim**: `test` = `node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills && npm run test:app`. `run-user-scope-tests.mjs` resolves its scan directory to `join(homedir(), '.commandcode', 'scripts')` when no argument or env override is given, exits 1 when it finds no `*.test.mjs`, and on this host that directory exists with 11 files, 2 of them `*.test.mjs` (`install-gsd-path-command-code.test.mjs`, `install-pstack-opencode.test.mjs`).
- **Source**: `package.json:8`; `scripts/run-user-scope-tests.mjs:44-45,72-75`; `Test-Path $env:USERPROFILE\.commandcode\scripts` → True, count 2.
- **Confidence**: high.
- **Why it matters here**: the default suite depends on machine state outside the checkout. A verify sidecar, a second machine or any CI would fail this step for reasons unrelated to the change, and a green `npm test` on this host says nothing about the repo alone.

## Finding: `tests/` (23 tracked files) is executed by no script at all

- **Claim**: no npm script, Nx target or Playwright config names `tests/held-out/**` or `tests/docs-alignment.test.mjs`. Grepping the whole tree outside `.project/archive` for `tests/held-out`, `tests/**` or `docs-alignment.test` returns zero matches. The root `playwright.config.mts` sets `testDir: 'tests/browser'` only, so the single `*.spec.ts` there is reachable; the 22 `*.test.mjs` are not.
- **Source**: `package.json:6-11`; `playwright.config.mts:6`; grep for `tests/held-out|tests/\*\*|docs-alignment\.test` → "No matches found".
- **Confidence**: high.
- **Why it matters here**: 22 test files read as a maintained suite in any directory listing, and none of them gates anything. Effort spent making them pass would buy no gate coverage.

## Finding: nine of the `tests/` files fail at this head on `.project` paths that no longer exist

- **Claim**: measured at `a133a50` — `tests/held-out/e12-clean-worktree.test.mjs` 0/3 pass; `{e1,e5,e6,e7,e8,e10}` 2/22 pass (only E7 archive-ancestry and E8 fixture-retention); `{chrome-stable-nano,chrome-beta-nano,chrome-beta-gemma4,edge-phi4mini}-panel` 0/16 pass; `stale-view-worker-supersession` 4/4 pass; the six `stale-view-*` logic files 11/11 pass; `tests/docs-alignment.test.mjs` 5/5 pass. Every failure is `ENOENT` or `AssertionError` against `.project/review/rounds/*.md`, `.project/review/specs/m00*.md` or `.project/tasks/`; `Test-Path .project/review` → False and `Test-Path .project/tasks` → False, and those directories exist only inside `.project/archive/009-consolidation-hardening/`.
- **Source**: commands and counts in the header; `tests/held-out/e12-clean-worktree.test.mjs:20,35,42`; `tests/held-out/e5-unverifiable-recorded.test.mjs:34`; `tests/held-out/e1-zero-defects-recorded.test.mjs:7`.
- **Confidence**: high.
- **Why it matters here**: these files encode M009's on-disk layout, so they cannot be repaired by fixing a test — the artifacts they name were archived. Two disjoint groups live under one directory: 15 genuinely passing logic tests and 7 files that can never pass again.

## Finding: two Playwright specs are byte-identical and one copy is outside every runner

- **Claim**: `e2e/provenance.spec.ts` and `apps/angular-ai-devtools-e2e/src/signal-provenance.spec.ts` are 245 lines each with identical content (both SHA-256 prefix `1fb976c5316d2d58`). The root config's `testDir` is `tests/browser`; the Nx e2e preset in `apps/angular-ai-devtools-e2e/playwright.config.mts:29` uses `testDir: './src'`. `apps/angular-ai-devtools-e2e/project.json` declares `"targets": {}` and relies on the `@nx/playwright/plugin` inference in `nx.json:27-33`.
- **Source**: `node -e` SHA-256 over both paths; `playwright.config.mts:6`; `apps/angular-ai-devtools-e2e/playwright.config.mts:29`; `apps/angular-ai-devtools-e2e/project.json:10`; `nx.json:27-33`.
- **Confidence**: high.
- **Why it matters here**: a planner editing the browser test will find two identical files and no signal about which one runs; the answer is the `apps/` copy, and only via `nx run angular-ai-devtools-e2e:e2e`, which no npm script invokes.

## Finding: `src/panel/` carries an earlier panel implementation that nothing imports

- **Claim**: `src/panel/chain.ts`, `src/panel/anti-patterns.ts`, `src/panel/provenance.component.ts` and `src/panel/extension-prompt.service.ts` are imported by zero files in the tree; the only textual references are `scratchpad/analysis_result.txt`. The live equivalents are `apps/angular-ai-devtools/src/app/update-cause-chain.ts`, `anti-pattern-detector.ts` and `extension-prompt.service.ts`. By contrast `src/panel/error-explainer-view.ts`, `di-explain.ts`, `di-path-display.ts` and `di-diff-display.ts` are imported (by `error-explainer.component.ts:4`, `scripts/di-explain.test.mjs:3`, `scripts/di-path-display.test.mjs:3`, `scripts/di-diff-display.test.mjs:3`).
- **Source**: grep for `panel/chain|panel/anti-patterns|panel/provenance\.component|panel/extension-prompt` and for `src/panel/…` across the tree excluding `.project/archive` and `node_modules`.
- **Confidence**: high.
- **Why it matters here**: `src/panel/` looks like "the panel layer" from its name, and half of it is dead. A planner told to change the chain view or the prompt service can edit the wrong twin and see every check stay green.

## Finding: `src/main-world/provenance-tracer.ts` is exercised only by a test that no script runs

- **Claim**: the only importer of `src/main-world/provenance-tracer.ts` is `src/main-world/provenance-tracer.test.ts:3`. That file is not matched by `scripts/**/*.test.mjs` or `extension/**/*.test.mjs`, and `apps/angular-ai-devtools/tsconfig.app.json` excludes `src/**/*.test.ts`. The live N2 path is a second, independent algorithm in `apps/angular-ai-devtools/src/app/signal-provenance.ts`, imported by `signal-provenance.service.ts`.
- **Source**: grep for `provenance-tracer`; `tsconfig.app.json:6-9`; `package.json:8`; `apps/angular-ai-devtools/src/app/signal-provenance.ts:1-4`.
- **Confidence**: high.
- **Why it matters here**: N2 "signal provenance" has two tracers with different traversal rules (BFS over edges in `provenance-tracer.ts`; producer/self/consumer ordering in `signal-provenance.ts`), and only the app copy is reachable from a gate.

## Finding: `extension/panel.html` and `extension/panel.js` are orphaned vanilla-JS files

- **Claim**: `extension/manifest.json` registers `background.js`, `relay.js`, `agent-main.js` and `devtools_page: devtools.html`, and never names `panel.html` or `panel.js`. `extension/devtools.js:2-6` opens `panel/index.html`, which is the Angular build output written by the `build-extension` target (`baseHref: /panel/`, `outputPath.base: extension/panel`). Nothing outside `research/` and `.project/archive` references `panel.html` or `panel.js`.
- **Source**: `extension/manifest.json:14-31`; `extension/devtools.js:1-9`; `apps/angular-ai-devtools/project.json:52-92`; grep for `panel\.html|panel\.js`.
- **Confidence**: high.
- **Why it matters here**: two files named "panel" exist and only one is shipped. `.gitignore` also ignores `extension/panel/*` except `index.html`/`favicon.ico`, so the built panel is untracked while the vanilla leftovers are tracked.

## Finding: `extension/*.js` is hand-written source with no build step, and it duplicates `src/` logic

- **Claim**: no npm script or Nx target compiles, bundles or copies `extension/*.js`; `build-extension` only writes `extension/panel/`. `extension/agent-main.js` (653 lines) is a plain-JS IIFE that re-implements logic which also exists as tested TypeScript: `captureErrorPayload` (`agent-main.js:636-659`) versus `captureError`/`resolveOwningComponent`/`RingBuffer` in `src/main-world/error-capture.ts`; the window `CustomEvent` dispatch contract in `relay.js` is mirrored by hand. `interop.service.ts:2-4` imports `interop-keep-list.ts` for the same classifier that `agent-main.js` does not use.
- **Source**: `apps/angular-ai-devtools/project.json:8-134` (targets list); `extension/agent-main.js:1-30` and `:634-659`; `src/main-world/error-capture.ts:1-12`.
- **Confidence**: high.
- **Why it matters here**: any change to a shared rule must be made twice, in two languages, and only one copy has unit tests. A planner cannot assume "one source of truth" for the page-side logic.

## Finding: `interop.service.ts` silently substitutes no-op stubs when an import fails

- **Claim**: the module opens with `// @ts-ignore` over `const _keepModule: any = await import('../../../../src/main-world/interop-keep-list.ts').catch(() => null)`, then three guarded dynamic imports (`@angular/core`, `./extension-prompt.service`, `./n1-update-cause.service`). If `@angular/core` throws, `Injectable`/`inject`/`signal`/`effect` become local fallbacks and `signal(v)` returns `{ set() {}, update() {} }` with no read. The file also exports 32 `export` statements for a handful of functions and declares an unused `import type { Injectable as InjectableType }`.
- **Source**: `apps/angular-ai-devtools/src/app/interop.service.ts:1-16` (fallbacks at `:6-11`); export count measured by regex over the tree.
- **Confidence**: high (code read); medium on runtime effect (not exercised live).
- **Why it matters here**: a broken import path in this file produces a service that renders the panel's "no interop findings" empty state instead of an error, and neither `build` nor `check` would report it.

## Finding: an alias-export convention inflates several modules

- **Claim**: export-statement counts measured across `apps/`, `src/`, `scripts/`, `extension/`, `tests/`: `src/main-world/stale-view-scan.ts` 34, `apps/angular-ai-devtools/src/app/interop.service.ts` 32, `src/main-world/error-capture.ts` 26, `scripts/sidecar-deps-bridge.mjs` 20 (plus a 20-key `export default`), `apps/angular-ai-devtools/src/app/update-cause-chain.ts` 13. The pattern is many names bound to one implementation, e.g. `ERROR_CAPTURE.ts` exports `NO_OWN_COMPONENT`, `NO_OWN_COMPONENT_MESSAGE`, `NO_OWNING_COMPONENT` for the same string, and `interop.service.ts` exports `sliceInterop`, `buildInteropSlices`, `buildSlices`, `getInteropSlices`, `interopSlices`, `sliceInteropGraph` for one function.
- **Source**: regex count over `export (const|function|class|interface|type) ` per file; `src/main-world/error-capture.ts:17-19,225-260`; `apps/angular-ai-devtools/src/app/interop.service.ts:190-200`.
- **Confidence**: high.
- **Why it matters here**: reviewers cannot distinguish deliberate public API from speculative aliasing, and a "rename the export" task has up to six call sites per function.

## Finding: `resolveOwningComponent` contains an accessor name that no Angular export can match

- **Claim**: `src/main-world/error-capture.ts` resolves the owning-component getter from `ng.getOwningComponent`, then `ng["\u0152getOwningComponent"]` (U+0152 LATIN CAPITAL LIGATURE OE), then `ng.ɵgetOwningComponent` (U+0275). The middle branch names a symbol Angular does not publish, so it is unreachable.
- **Source**: `src/main-world/error-capture.ts:40-55`.
- **Confidence**: medium — read from source only; no runtime probe of `window.ng` was made in this read-only pass.
- **Why it matters here**: the file's own comment claims it accepts "the Angular-style ɵ-prefixed accessor if present"; the mojibake branch will be counted as coverage that does not exist.

## Finding: `CHARTER.md` still declares a free-route-only model policy while `.project/model-policy.json` pins paid models

- **Claim**: `.project/CHARTER.md:124-131` states "Model policy: free routes only" and names `reflection/beam:free` at high effort for the ten tool-loop roles. `.project/model-policy.json` pins `deepseek/deepseek-v4.1-flash` for ten roles and `z-ai/glm-5.3-flash` for `reviewer`, `skeptic` and `review_panel`. `.project/STATE.md` logs (2026-11-01) an owner-approved paid rung for M016 T001, commit `395d1c7` is titled `build: pin paid model policy per role`, and CHARTER's append-only `Corrections` section ends at 2026-10-30 with no entry recording the switch.
- **Source**: `.project/CHARTER.md:124-147,170-209`; `.project/model-policy.json:1-54`; `.project/STATE.md` log lines for 2026-11-01; `git log --oneline` (`395d1c7`).
- **Confidence**: high that the two artifacts disagree; medium on which one binds.
- **Why it matters here**: the charter is what `define` treats as enduring program intent, so a planner reading it will budget free routes that the dispatch table no longer uses.

## Finding: the repository has no CI configuration

- **Claim**: the root contains no `.github/`, no `azure-pipelines.yml`, no `.gitlab-ci.yml`, no `Jenkinsfile` and no CI-oriented script; the only top-level entries are the 15 directories and 10 files listed in the Map. Every gate is a local npm script or Nx target, and `AGENTS.md` documents sidecar-specific workarounds (the `node_modules` junction) rather than a CI job.
- **Source**: `Get-ChildItem -Force` on the root; `package.json:4-11`; `AGENTS.md` "Verify sidecar dependencies".
- **Confidence**: high.
- **Why it matters here**: "green" means green on this Windows host with a populated `~/.commandcode`, so no plan can rely on a remote check having run.

## Finding: two skill trees exist, and byte-equality is enforced for two of the eight mirrored skills

- **Claim**: `.commandcode/skills/` holds 18 skill folders, `.claude/skills/` holds 8. `scripts/skills-mirror.test.mjs:35` loops only over `['control-ai-browsers', 'verify-ai-browsers']`, and `AGENTS.md` states the other six `.claude` folders are older copies, not kept in step. The 10 `nx-*` folders under `.commandcode/skills/` are third-party installs recorded in `.commandcode/.nx-skills-manifest.json` with `repoPath: D:/projects/github/nrwl/nx-ai-agents-config` and `src` paths outside this checkout.
- **Source**: directory listings of both skill trees; `scripts/skills-mirror.test.mjs:35-46`; `AGENTS.md` "Browsers and on-device models"; `.commandcode/.nx-skills-manifest.json`.
- **Confidence**: high.
- **Why it matters here**: a change to `control-angular-devtools`, `verify-angular-devtools`, `control-pangular-inspector`, `verify-pangular-inspector`, `control-angular-dev-app` or `control-vitest-browser-angular` lands in one tree only, and `tests/docs-alignment.test.mjs` nevertheless asserts against both copies of two of them.

## Finding: every skill test executes twice, once per tree

- **Claim**: `test:skills` runs `node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"`. Both trees hold 28 `*.test.mjs` files, so 28 suites run twice; the mirror test asserts byte equality for only the two skills above, so the second run is duplicated work for those and genuinely independent coverage for the other six.
- **Source**: `package.json:9`; file counts per tree (28 and 28).
- **Confidence**: high.
- **Why it matters here**: suite size and runtime are roughly double what the file count implies, which matters for any timing-sensitive gate.

## Finding: host-specific absolute paths are committed inside the repo and its tests

- **Claim**: `.commandcode/skills/control-ai-browsers/scripts/control.test.mjs:175` contains the literal `D:\projects\sandbox\angular-ai-devtools\extension`, and the same file (plus its `.claude` byte copy) hard-codes drive letters `C:`/`D:` and `--user-data-dir` forms throughout (`:72,244-256,393-416`). `tsconfig.json:6-7` lists `C:/Users/LarsGyrupBrinkNielse/.commandcode/scripts/...` as absolute includes. `extension-config.json:4` hard-codes `D:/projects/sandbox/angular-ai-devtools/extension`.
- **Source**: those files, as cited per line.
- **Confidence**: high.
- **Why it matters here**: the skill tests are portable only in the sense that they assert on strings; anything that resolves those paths at runtime works on this host and nowhere else, and the primary checkout path is baked into a tracked config file.

## Finding: browser verification depends on shared, host-level profile state that the repo expects to find in a sibling checkout

- **Claim**: `.commandcode/skills/control-ai-browsers/SKILL.md:9` documents `--user-data-dir` under `.commandcode\worktrees\.browsers\<name>` of the primary checkout on D:, `.gitignore` lists `.browsers/` and six `tmp/{control,verify,maintain}-*` directories, and `AGENTS.md` forbids starting a profile outside `control-ai-browsers up`. `extension-config.json` launches the extension from the absolute primary path.
- **Source**: `.commandcode/skills/control-ai-browsers/SKILL.md:3-9,72`; `.gitignore:1-20`; `AGENTS.md` "Browsers and on-device models"; `extension-config.json`.
- **Confidence**: high.
- **Why it matters here**: no verification of a panel claim is possible from this sidecar without mutating host-level browser state, so claims that need a live panel must be planned as tasks that run in the primary checkout, not in an inspection or research phase.

## Apparent intent

- The repository is two products in one checkout: an MV3 Angular DevTools extension whose six explainers all ship, and a local GSD Path orchestration harness (`scripts/`, `.project/`, `.commandcode/skills/`, `.claude/skills/`) that is growing faster than the extension. — based on the last 30 commits touching only harness files, `.project/ROADMAP.md:649-694` (M017 `verification-coverage`), and 16 archived milestones whose products are already routed in `app.routes.ts:10-17`.
- The current focus appears to be making verification trustworthy rather than adding features. — based on `CHARTER.md` success criteria 1-5 all being about proof (`lars-verify` verdicts, four model pairs, docs-audit cleanliness), M017's goal wording ("cannot dispatch on a broken helper, an unverifiable claim, or an exhausted route without a named check failing first"), and 2026-11-01 commits such as `T001: Add user-scope autonomy conformance suite`.
- `tests/` looks like a vestige of one consolidation milestone rather than a maintained layer. — based on 9 of its files failing on `.project/review/**` and `.project/tasks/**` paths that only exist inside `.project/archive/009-consolidation-hardening/`, and on no script naming it.
- The intended single source of truth for page-side logic appears to be the TypeScript in `src/main-world/` and `src/panel/`, with `extension/*.js` as a hand-maintained runtime copy. — based on the `// Pure, unit-testable` headers, the unit tests that import those `.ts` files directly, the app importing them by deep relative path, and `agent-main.js` re-implementing the same rules in plain JS (inference; the direction is not stated anywhere).
- `src/panel/` may be a retired first panel implementation kept for reference. — based on four of its eight modules having zero importers while their live twins sit in `apps/angular-ai-devtools/src/app/` (inference).

## Open questions for define

- Is `tests/` (23 files) meant to stay and be re-pointed at the current `.project` layout, be rewritten against artifacts that still exist, or be retired? Nine files cannot pass at any head after M009 archived.
- Is `e2e/provenance.spec.ts` a leftover after the spec moved to `apps/angular-ai-devtools-e2e/src/`, or is the `apps/` copy the leftover? They are byte-identical today.
- Should `npm test` keep depending on `~/.commandcode/scripts`, or must the user-scope suite move behind a separate, opt-in script?
- Which artifact binds when `CHARTER.md` ("free routes only") and `.project/model-policy.json` (paid DeepSeek and GLM pins) disagree, and should the charter carry a Corrections entry for the 2026-11-01 paid switch?
- Are `src/panel/{chain,anti-patterns,provenance.component,extension-prompt.service}.ts` and `src/main-world/provenance-tracer.ts` intended to be deleted, or re-adopted?
- Should `extension/agent-main.js` gain a build step from `src/main-world/`, or stay a hand-maintained duplicate?
- Is a Playwright run (root `tests/browser` or the Nx e2e project) part of any gate the project wants, given that no npm script invokes either?

## Blocked areas

- `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` — **not run**. The sidecar ships without `node_modules` and `scripts/ensure-sidecar-deps.mjs` creates a directory junction in the sidecar; creating that path is outside the single-file write scope this task was given. Recorded as `unverifiable` here; run them from the primary checkout or a purpose-made verify sidecar.
- Full root `node:test` sweep (`scripts/**/*.test.mjs` + `extension/**/*.test.mjs`) — attempted, no verdict: the command exceeded the 30 000 ms shell limit with no summary captured. Needs a longer budget than this task allows.
- `tests/held-out/{e3-zero-skipped,e4-idempotent-checks,e11-rerun-stable}.test.mjs` — **not run**: each spawns `npm test` / `npm run check`, which cannot run in this sidecar for the reason above.
- Live browser and on-device-model behavior (Prompt API availability, panel rendering, four model pairs) — **not attempted**. `AGENTS.md` and `.commandcode/skills/control-ai-browsers/SKILL.md` require `control-ai-browsers up` against shared profiles under the primary checkout, and this is a read-only inspection phase.
- `.project/archive/**` — excluded by the brief, so all archived milestone artifacts were read only where a reachable file cited them by path.
- `.commandcode/taste/` and `.claude/` skill bundles beyond import/grep traces — excluded by rule (taste) and by the brief (installed bundles). Incidental grep hits inside `.commandcode/taste/` were not read.
- `.commandcode/skills/nx-*` (10 folders) — inspected only via `.nx-skills-manifest.json`; they are third-party installs from `D:/projects/github/nrwl/nx-ai-agents-config`, not this project's source.
- `spikes/ng222-app` and `spikes/ng222-ssr` internals — not read in depth; only `package.json`/`angular.json`/`vitest-*.mts` presence was noted. Fixture behavior is covered by `tests/held-out/stale-view-*`, which pass.
- No `taste` tool was called and `.commandcode/taste/` was not edited, per the task constraints.
