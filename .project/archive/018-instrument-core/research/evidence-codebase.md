# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-01 — re-inspection at HEAD `3fb21f14db4325eb3568ac56e46697e42522e6c5` (branch `gsd-path/M018`, primary working tree clean). Re-verifies the archive-017 map taken at `a133a50`; 17 of its 18 findings re-confirmed, 1 changed, 0 dropped, plus 12 new findings for programme 1.
Checks run (all in the verify sidecar `…\verify\m018-inspect-codebase`, a worktree of the same `3fb21f1`, clean apart from the untracked inspection brief):
- `git rev-parse HEAD` → `3fb21f14…`; `git status --short` (main worktree) → no output.
- `git log --oneline a133a50..HEAD` → 28 commits; `git diff --stat a133a50..HEAD` → 55 files, 9057 insertions, 37 deletions, **no file under `apps/`, `src/` or `extension/`** (product source unchanged since the previous map).
- `node --experimental-strip-types --test tests/docs-alignment.test.mjs` → 5 tests, 5 pass.
- `node --experimental-strip-types --test tests/held-out/{e1,e5,e6,e7,e8,e10,e12}*.test.mjs` → 25 tests, **2 pass, 23 fail** (only E7 archive-ancestry and E8 fixture-retention).
- `node --experimental-strip-types --test tests/held-out/{chrome-stable-nano,chrome-beta-nano,chrome-beta-gemma4,edge-phi4mini}-panel.test.mjs` → 16 tests, **0 pass, 16 fail**.
- `node --experimental-strip-types --test tests/held-out/stale-view-{write-regex,version-gate,ordering,fixture-graph,dedup,fact-list-escaping}.test.mjs tests/held-out/stale-view-worker-supersession.test.mjs` → 15 tests, 15 pass.
- `node --experimental-strip-types --test "extension/**/*.test.mjs"` → 38 tests, 38 pass.
- `node --experimental-strip-types --test scripts/{autonomy-gaps,user-scope-autonomy,docs-correction,npm-test-guard,run-user-scope-tests,docs-audit-disposition}.test.mjs` plus the other 14 `scripts/*.test.mjs` files run individually → **107 tests, 106 pass, 1 fail** (`scripts/docs-audit-disposition.test.mjs` E6, see Finding).
- `node scripts/run-user-scope-tests.mjs` → 60 tests, 60 pass (reads `~/.commandcode/scripts`).
- Not run: `npm run check`, `npm test` as a whole, `npx nx run angular-ai-devtools:build-extension`, `npm run test:skills`, `npm run test:app` — the sidecar ships without `node_modules` (see Blocked areas).

## Map

- **Stack**: unchanged from the previous map and re-read this pass. TypeScript `6.0.3` exact, Angular `~22.1.0` runtime and build (`@angular/build`, `@angular/cli`, `@angular/compiler-cli`), Nx `23.3.0`, `vitest ^4.0.8` + `jsdom ^27.1.0`, `@playwright/test ^1.37.0`, `@types/node ^26.6.5`; root package `"private": true`, `"type": "module"` (`package.json:13-43`). Extension is Manifest V3 `"version": "0.3.0"`, permissions `scripting/activeTab/storage`, host permission `<all_urls>` (`extension/manifest.json:2-13`). Node measured on this host: v24.22.0.
- **Entry points**: extension contexts are declared in `extension/manifest.json:14-31` — `background.js` (module service worker), `relay.js` (content script, ISOLATED, `<all_urls>`, `run_at: document_idle`), `agent-main.js` (content script, `world: "MAIN"`, `run_at: document_idle`), `devtools_page: devtools.html`; `extension/devtools.js:2-6` creates the "Angular AI" panel at `panel/index.html`. App — `apps/angular-ai-devtools/src/main.ts` (the browser entry named at `project.json:17,65`) → `bootstrapApplication(App, appConfig)` (`app.config.ts:5-10`); six routes in `app.routes.ts:9-16`: `''` N1, `signal-provenance` N2, `di-doctor` N3, `error-explainer` N4, `stale-view` N24, `interop` N25. Nx targets `angular-ai-devtools`: `build`, `build-extension`, `generate-error-digest`, `serve`, `test`, `serve-static` (`apps/angular-ai-devtools/project.json:8-134`).
- **Architecture**: deterministic capture in the inspected page; `agent-main.js` wraps `ng.ɵsetProfiler` and `ng.ɵgetSignalGraph`, dispatches `angular-ai:*` window `CustomEvent`s, `relay.js` forwards them to `chrome.runtime`, `background.js` re-broadcasts with `tabId`, and the DevTools panel (the built Angular app) subscribes through `ExtensionMessageService` (`relay.js:6-24`; `background.js:8-34`; `extension-message.service.ts:34-78`). The panel's own `LanguageModel` explains a fact list after an explicit click (`extension-prompt.service.ts:33-39,86-123`). Pure modules in `src/main-world/` and `src/panel/` are consumed by the app through deep relative paths, by `node:*` tests via `--experimental-strip-types`, and mirrored by hand inside `extension/agent-main.js`.
- **Conventions**: standalone components only, no NgModule; inline `template:`/`styles:`, `protected readonly` members, `signal()`/`computed()`, `@if`/`@for`, `data-testid` on every asserted element (e.g. `n3-di-doctor.component.ts:11-20,58-61`). Pure logic modules are DI-free and DOM-free. Node tests use `node:test` + `node:assert/strict`; app specs are vitest. Page-side code wraps every hook in `try {} catch {}` (`/* never throw */`, `agent-main.js:580`). Commits use the GSD Path vocabulary (`state:`, `inspect:`, `build:`, `T0NN:`, `integrate:`, `ship:`), never a model name (`git log --oneline a133a50..HEAD`).
- **Maturity**: six explainer routes wired and shipped; three test layers exist — `node:test` 20 files in `scripts/`, 4 in `extension/`, 28 in each skill tree (counted this pass), 10 vitest `*.spec.ts` under `apps/angular-ai-devtools/src` plus 1 Playwright spec in `apps/angular-ai-devtools-e2e/src`, 1 more in `tests/browser`. `tests/` (22 `*.test.mjs`) is still wired into no script and 10 of its files cannot pass (Finding). M017 shipped: `scripts/user-scope-autonomy.mjs` + `.test.mjs` (18 tests measured), `scripts/autonomy-gaps.test.mjs` (15 tests), `scripts/docs-correction.test.mjs`, `scripts/docs-audit-disposition.test.mjs`, `docs/autonomy-gaps.md` (10 gap sections). The brief's "nineteen autonomy-gap cases" matches neither count: measured 18 in `user-scope-autonomy.test.mjs` and 15 in `autonomy-gaps.test.mjs`.
- **Recent activity**: the 28 commits since `a133a50` are M017's seven tasks plus the programme-1 paperwork — `docs/`, `plans/`, `.project/`, `AGENTS.md`, `references/`, and the four new `scripts/*.test.mjs`. `.project/STATE.md` (:337-338) shows `phase: inspect`, `milestone: null`, branch `gsd-path/M018`; `.project/ROADMAP.md` does not carry M018 yet, so generation 1 exists only in `plans/angular-ai-devtools-program-backlog.md:83-181`.

## Finding: no tool-registry, context-budget, worker-job or overlay code exists in the product source (new work, not a gap in the map)

- **Claim**: searching `apps/`, `src/` and `extension/agent-main.js` for `toolRegistry|ToolRegistry|registerTool|tool-registry|contextBudget|ContextBudget|attachShadow|elementFromPoint|MutationObserver` returns zero matches in all three trees. There is no declaration record, no backing record, no `kind`/`host`/`outcome`/`publish` vocabulary, no chunker, no ring buffer for prompt context, no background-job machinery and no in-page overlay host anywhere in the shipped code.
- **Source**: grep over `apps/` → "No matches found"; over `src/` → "No matches found"; over `extension/agent-main.js` → "No matches found" (this pass). The only `MutationObserver` in shipped code is `relay.js:51-62`.
- **Confidence**: high.
- **Why it matters here**: M018, M019 and M022 are greenfield inside an existing product. A planner must budget the envelope itself, not an extension of something; and any plan that says "wire the existing registry" is describing a file that does not exist.

## Finding: the panel has no working way to ask the inspected page for anything

- **Claim**: the only panel-initiated request in the product is `angular-ai:di-query`. `DiDoctorService.queryDi()` sends it with `chrome.runtime.sendMessage` (`di-doctor.service.ts:23-26`); `background.js` handles only `angular-ai:record`, `angular-ai:state`, `angular-ai:di-graph`, `angular-ai:error-capture`, `host:capability`, `host:pick` and `angular-detected` (`background.js:8-34`), so the message is dropped; `relay.js` registers listeners for page→extension events only and never forwards anything into the page (`relay.js:6-24`); the page-side handler exists and is bound to the window (`agent-main.js:14,436,630-632`). Separately, **nothing calls `queryDi`** — grep for `queryDi` finds only its own definition, and `n3-di-doctor.component.ts:16,65-80` reads paths that the page pushed, never requests them.
- **Source**: files and lines as cited; grep for `queryDi` over `apps/angular-ai-devtools/src/app` → definition only.
- **Confidence**: high that the transport is absent; medium that N3's live verdicts therefore rest on pushed `di-graph` events only (the archive-009 panel runs are not readable from this pass).
- **Why it matters here**: M018's registry has a `host: page` dimension and read tools such as `find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata` and `getComponent` (`plans/angular-ai-devtools-program-backlog.md:90-91`). Every one of those is a panel→page **request**, and today the product has no request channel at all — only a one-way event firehose. This is the largest single build item behind M018 that the roadmap entry does not name.

## Finding: `host:capability` / `host:pick` is a dead stub that answers the asker, not the panel

- **Claim**: `background.js` stores a capability per tab on `host:capability` (`:16-20`) and answers `host:pick` by replying to the *sender* with the map entry for `sender.tab?.id` (`:22-26`). No code in the repository ever sends `host:capability` (grep over the tree outside `node_modules`/`.project` finds only `background.js:16`, `background.test.mjs:46-50` and the panel's read-only branch at `extension-message.service.ts:52-56`). A panel message has no `sender.tab`, so the reply is `{ context: null, reason: 'no host registered' }`; and `background.test.mjs:46-50` pins that `host:pick` must not be re-broadcast.
- **Source**: `background.js:16-26`; `extension-message.service.ts:52-56`; `extension/background.test.mjs:46-50`; greps as cited.
- **Confidence**: high.
- **Why it matters here**: the envelope needs an `extension-API` host and an async-handle outcome. The nearest precedent is a stub whose request/response direction is inverted and whose producer never exists; copying its shape would make an unanswerable tool look implemented.

## Finding: `relay.js` already adds DOM to the inspected page and observes with no host-subtree exclusion

- **Claim**: on Angular detection, `relay.js` creates a `div#angular-ai-devtools-marker` and appends it to `document.body` with a fixed-position style (`relay.js:34-38`). It also installs a `MutationObserver` on `document.documentElement` with `{ childList: true, subtree: true }` (`relay.js:51-54,59-62`), which observes the tool's own marker and every other node, with no exclusion of any tool host. `relay.test.mjs:25-27` supplies mocks for exactly these calls, so the injection is exercised, never asserted against.
- **Source**: `extension/relay.js:34-38,48-64`; `extension/relay.test.mjs:25-27`.
- **Confidence**: high (code read).
- **Why it matters here**: AR-2/AR-3 make the overlay the *only* DOM the tool adds to a page and AR-4 requires every owned `MutationObserver` to exclude the tool host subtree (`CHARTER.md:250-255`). Both constraints are already violated by shipped code, and AR-4 is a correctness dependency for N7, FOR-1 and CF-1 (`plans/angular-ai-devtools-program-backlog.md:131-132`). M022 must remove this marker and this observer, not only add a new overlay.

## Finding: `agent-main.js` runs at `document_idle` although its own comment and AR-4 require `document_start`

- **Claim**: the manifest registers `agent-main.js` with `"run_at": "document_idle"` and `"world": "MAIN"` (`extension/manifest.json:24-29`), while the file's N4 section is headed "error capture hooks at document_start (console.error, window.onerror, unhandledrejection)" (`agent-main.js:634-635`). AR-4 requires the overlay host to attach once at `document_start` (`CHARTER.md:254-255`), and M022's scope repeats it (`plans/angular-ai-devtools-program-backlog.md:125-127`).
- **Source**: `extension/manifest.json:22,27`; `extension/agent-main.js:634-635,665-681`; `CHARTER.md:254-255`.
- **Confidence**: high that the two disagree; medium on the runtime size of the miss (errors thrown before idle are not hooked).
- **Why it matters here**: M022 cannot attach at `document_start` without changing the manifest's `run_at`, and changing it moves N4's hook point for every existing explainer. That is a shared-code change the M022 entry does not mention.

## Finding: the panel's initial bundle is ~507 KiB of the 520 KiB budget, and the error digest rides in `main.js`

- **Claim**: the `build-extension` output present in the tree (dated 2026-11-01 13:49) is `main.js` 188 579 B, `chunk-DweK769i.js` 326 974 B, `chunk-DkSKihzw.js` 645 B, `chunk-C9Uts9mc.js` 2 600 B, `chunk-D682qpVD.js` 17 920 B, `styles.css` 0 B. `extension/panel/index.html:12` loads `main.js` and modulepreloads the three chunks, i.e. 518 798 B ≈ 506.6 KiB eager — about 13.7 KiB (2.6 %) below the `520kb` initial warning set at `project.json:79-84` (error ceiling 1 MB). `extension/error-digest.json` is 61 577 B with 64 entries and is imported statically by `error-explainer.component.ts:7`, so it is inside `main.js` on every route, not only `/error-explainer`.
- **Source**: `dir extension\panel` sizes and timestamps; `extension/panel/index.html:12`; `apps/angular-ai-devtools/project.json:76,79-90`; `apps/angular-ai-devtools/src/app/error-explainer.component.ts:7`; `node -e` over `extension/error-digest.json`.
- **Confidence**: high on the file sizes; medium on the accounting (that the builder counts modulepreloaded chunks as "initial" is inference — the build emitted no warning in this artifact).
- **Why it matters here**: AR-1 makes 520 KB binding and M023 adds `@angular/aria`, `@angular/cdk` and `@angular/material` to the *fixture*, not the panel (`plans/angular-ai-devtools-program-backlog.md:134-145`), but any programme-1 panel work starts with ~3 % headroom. A plan that assumes "the budget is fine" is guessing.

## Finding: `npm test` is red at HEAD — the project Verify fails on two unaudited plan documents

- **Claim**: `scripts/docs-audit-disposition.test.mjs` E6 ("queue numbers stay unique, increasing and bound to their items") fails at `3fb21f1`. The assertion compares the document inventory the gate derives from the checkout with the documents the head audit covers, and reports two extra: `plans/angular-ai-devtools-program-backlog.md` and `plans/gsd-path-handoff-M018.md`. Because `test` chains with `&&` from `"scripts/**/*.test.mjs"` forward, every later stage never runs, so `npm test` fails as a whole.
- **Source**: `node --experimental-strip-types --test scripts/docs-audit-disposition.test.mjs` → 3 tests, 2 pass, 1 fail (assertion text quoted in the transcript); `scripts/docs-audit-disposition.test.mjs:536-545`; `package.json:9`.
- **Confidence**: high (measured).
- **Why it matters here**: CHARTER success criterion 3 requires `npm test` to pass at every ship (`CHARTER.md:157-158`), and M018 starts from a red gate that no M018 task causes. The fix is a docs artifact (the audit must cover the two new plans), which means the re-inspection's docs half owns it; a build plan must not assume a green baseline.

## Finding: the charter records A1-A8, not A9, and A6 contradicts the Constraints paragraph it should amend

- **Claim**: `CHARTER.md` `## Corrections` carries A1 (`:225-227`), A2 (`:228-231`), A3 (`:232-233`), A4 (`:234-237`), A5 (`:238-239`), A6 (`:240-241`), A7 (`:242-243`) and A8 (`:244-245`), then the delivery ruling and the programme-1 scope. Grep for `A9` in `CHARTER.md` returns no match, while `plans/angular-ai-devtools-program-backlog.md:25` records A9 ("all tiers permitted; modern APIs only; `@angular/animations` deprecated and out"). Separately, A6 permits tool calling in the core loop (`CHARTER.md:240-241`) while `## Constraints` still states "deterministic code computes the facts; the panel-local Prompt API explains a short fact list (no tool calling in the core loop)" (`CHARTER.md:92-94`), exactly the superseded-text pattern that the 2026-11-01 Corrections entry used for the model policy.
- **Source**: `CHARTER.md:92-94,225-245`; grep for `A9|animations` in `CHARTER.md` → "No matches found"; `plans/angular-ai-devtools-program-backlog.md:25,29-43`.
- **Confidence**: high.
- **Why it matters here**: `define` treats the charter as enduring intent and the roadmap gate checks the charter↔milestone bijection against it (`plans/angular-ai-devtools-program-backlog.md:68-70`). A planner reading Constraints:92-94 will design M018 without tool calling, which is the milestone's whole subject; and the missing A9 is the ruling that keeps `@angular/animations` out of the ANI family.

## Finding: the page-side app-facts probe already exists and the panel throws its payload away

- **Claim**: `agent-main.js` computes an app-facts capability record — `setProfiler`, `getSignalGraph`, `getHostElement`, `getInjector`, `getDirectiveMetadata`, `getInjectorResolutionPath`, `getInjectorMetadata`, `getInjectorProviders` (`agent-main.js:61-82`) — plus `zoneMode` (`:84-115`), and publishes them as `angular-ai:state` with `{supported, reason, zoneMode, features}` (`:117-124`). The panel's `ExtensionMessage` interface declares none of `features` or `zoneMode` (`extension-message.service.ts:6-23`) and the state branch reads only `supported`/`reason` (`:59-64`).
- **Source**: files and lines as cited.
- **Confidence**: high.
- **Why it matters here**: M018's first scope item is "a tool registry with an app-facts support check" (`CHARTER.md:269-270`). Half of that check is already measured on the page and is dropped at the wire boundary; the plan should extend the message contract rather than author a second probe, and the repo's `[ng-version]` detection (`relay.js:28`) is a third, weaker source.

## Finding: a worker boundary already exists for N24, as unbuilt plain JS tested only from the unscripted `tests/` tree

- **Claim**: `extension/stale-view-worker.js` is a dedicated worker that receives `{token, graph}` and returns `{token, findings}`; the panel starts it through `chrome.runtime.getURL('stale-view-worker.js')` with a `../stale-view-worker.js` fallback for the served app (`stale-view-scan.service.ts:23-40`), tokens each scan and discards superseded results (`:42-60`). It is hand-written JS with no build step, referenced by no Nx target, and its only behavioural tests live in `tests/held-out/stale-view-worker-supersession.test.mjs:6-17` — a file no script runs.
- **Source**: `extension/stale-view-worker.js`; `apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:23-60`; `tests/held-out/stale-view-worker-supersession.test.mjs:6-17`; `apps/angular-ai-devtools/project.json:8-134`.
- **Confidence**: high.
- **Why it matters here**: M019's "worker boundary" is not greenfield — there is a working precedent with a token/supersession pattern worth reusing — but the precedent is untested by any gate, so "reuse the worker pattern" and "the worker pattern is proven" are different claims.

## Finding: the prompt service has no tool-calling surface

- **Claim**: `ExtensionPromptService` types the API as `LanguageModelApi { availability(); create() }` and the session as `LanguageModelSession { prompt(input: string); destroy() }`; it creates a session, prompts once and destroys it in `finally` (`extension-prompt.service.ts:17-25,99-113`). No tool definitions, no `tools`/`initialPrompts`, no multi-turn session, no `LanguageModelToolSuccess`/`LanguageModelToolError` reference exists anywhere in `apps/` or `src/`.
- **Source**: `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:17-25,86-114`; grep for `LanguageModel` under `apps/` → the six hits in that file and its spec only.
- **Confidence**: high.
- **Why it matters here**: A6 admits tool calling (`CHARTER.md:240-241`) and M018 builds the registry that feeds it. The panel's model plumbing must grow a tool loop; that work is named by no roadmap entry between M018 and M019.

## Finding: the page agent publishes a forgeable global API into the inspected page

- **Claim**: `agent-main.js` assigns `globalThis.__ngRecorder = api` with `start`, `tryInstall`, `onEvent`, `closeCycle`, `reset`, `handleDiQuery` and the event-name constants (`agent-main.js:607-629`). Any script on the page can read it, call it, or replace it, and the window `CustomEvent` channel it dispatches on is equally open.
- **Source**: `extension/agent-main.js:607-632`; `relay.js:1-24`.
- **Confidence**: high (code read).
- **Why it matters here**: A1 lifted the Tier-2 veto and M018/M021 add app-installed instrumentation (`CHARTER.md:225-227`, `plans/angular-ai-devtools-program-backlog.md:113-120`), so the registry will have to decide which facts are trusted from a page-controlled channel. The existing precedent trusts the page completely; that choice should be explicit before the envelope is fixed.

## Finding: `npm run check` type-checks three files, one of them outside the repository

- **Claim (carried, still true)**: the root `tsconfig.json` `include` has exactly three entries — two absolute `C:/Users/<user>/.commandcode/scripts/install-pstack-opencode*.mjs` paths and `scripts/opencode-pstack-plugin.ts`. `check` is `node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills`, and `check:skills` compiles four skills configs. Nothing in `check` compiles `apps/`, `src/`, `extension/`, or the other 19 `scripts/*.mjs` files.
- **Source**: `tsconfig.json:5-9,10-23`; `package.json:7-8`.
- **Confidence**: high.
- **Why it matters here**: unchanged and still the reason M024 exists (`plans/angular-ai-devtools-program-backlog.md:147-154`). A plan that treats the project Verify as "the TypeScript gate" passes a type regression in the panel or the extension.

## Finding: `npm test` is not hermetic — it runs tests from the user home, and M017 widened that

- **Claim (carried, strengthened)**: `test` runs `"scripts/**/*.test.mjs" "extension/**/*.test.mjs"`, then `node scripts/run-user-scope-tests.mjs` (which resolves `join(homedir(), '.commandcode', 'scripts')` when no argument or env override is given and exits 1 when it finds no match), then the two skills trees and `test:app`. The M017 suite makes this worse: `scripts/autonomy-gaps.test.mjs` and `scripts/user-scope-autonomy.test.mjs` read the *installed* rules — the measured run printed `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` and `…\.commandcode\references\gsd-path-autonomy-playbook.md` as its inputs — and `user-scope-autonomy.mjs:4-15` derives every rules path from the parent of the resolved user-scope scripts dir.
- **Source**: `package.json:9-11`; `scripts/run-user-scope-tests.mjs:29-46,70-73`; `scripts/user-scope-autonomy.mjs:4-15`; measured output of `node --test scripts/autonomy-gaps.test.mjs` and `node scripts/run-user-scope-tests.mjs` (60 tests, 60 pass) in this session.
- **Confidence**: high.
- **Why it matters here**: the second and third `npm test` stages depend on machine state outside the checkout, and the newest suite is now among them. A verify sidecar, a second machine or CI fails or passes these for reasons unrelated to the change; a green local `npm test` proves the host, not the repo.

## Finding: `tests/` (22 tracked `*.test.mjs`) is executed by no script at all

- **Claim (carried, still true)**: no npm script, Nx target or Playwright config names `tests/held-out/**` or `tests/docs-alignment.test.mjs`; grep for `held-out|docs-alignment` outside `.project`/`node_modules` hits only skill documents and two test names inside `scripts/user-scope-autonomy.test.mjs`. The root `playwright.config.mts:6` sets `testDir: 'tests/browser'`, so the one spec there is reachable and the 22 `*.test.mjs` are not.
- **Source**: `package.json:6-11`; `playwright.config.mts:6`; greps as cited; `tests/` listing (1 + 21 files).
- **Confidence**: high.
- **Why it matters here**: unchanged. Fifteen of those files pass today and gate nothing.

## Finding: ten of the `tests/` files fail at this head on `.project` paths that no longer exist

- **Claim (carried, re-measured)**: at `3fb21f1`, `tests/held-out/{e1,e5,e6,e7,e8,e10,e12}` = 25 tests, **2 pass** (E7 archive ancestry, E8 fixture retention); the four `*-panel` files = 16 tests, **0 pass**; the six `stale-view-*` logic files plus `stale-view-worker-supersession` = 15 tests, **15 pass**; `tests/docs-alignment.test.mjs` = 5 tests, **5 pass**. Every failure is `ENOENT`/`AssertionError` against `.project/review/rounds/*.md`, `.project/review/specs/m0*.md` or `.project/tasks/`, none of which exist at the repo root — they live only inside `.project/archive/009-consolidation-hardening/`.
- **Source**: the three commands and counts in the header; e.g. the E1 failure names `.project\review\rounds\round-2.md` and the E12 failure names `.project\tasks`.
- **Confidence**: high.
- **Why it matters here**: unchanged: two disjoint groups live under one directory — 15 logic tests that pass and 10 files that can never pass again. Effort spent making the second group green buys nothing.

## Finding: two Playwright specs are byte-identical and one copy is outside every runner

- **Claim (carried, still true)**: `e2e/provenance.spec.ts` and `apps/angular-ai-devtools-e2e/src/signal-provenance.spec.ts` are 8 876 bytes each with SHA-256 prefix `1fb976c5316d2d58`. The root config's `testDir` is `tests/browser`; the Nx e2e project's preset uses `testDir: './src'` (`apps/angular-ai-devtools-e2e/playwright.config.mts:25`), its `project.json:10` declares `"targets": {}` and relies on the `@nx/playwright/plugin` inference in `nx.json:25-32`. That config also declares `chromium`, `firefox` and `webkit` projects, although the product is a Chromium MV3 extension.
- **Source**: `node -e` SHA-256 over both paths; `playwright.config.mts:6`; `apps/angular-ai-devtools-e2e/playwright.config.mts:25,40-54`; `apps/angular-ai-devtools-e2e/project.json:10`; `nx.json:25-32`.
- **Confidence**: high.
- **Why it matters here**: unchanged, plus the firefox/webkit projects mean `nx run angular-ai-devtools-e2e:e2e` would try browsers this product does not support — relevant if M024 or a later gate ever wires Playwright in.

## Finding: `src/panel/` still carries an earlier panel implementation that nothing imports

- **Claim (carried, still true)**: `src/panel/{chain,anti-patterns,provenance.component,extension-prompt.service}.ts` are imported by zero files; the only textual references are `scratchpad/analysis_result.txt:24-30`. The live equivalents sit in `apps/angular-ai-devtools/src/app/` (`update-cause-chain.ts`, `anti-pattern-detector.ts`, `extension-prompt.service.ts`). `src/panel/{error-explainer-view,di-explain,di-path-display,di-diff-display}.ts` are imported and used.
- **Source**: grep for `panel/chain|panel/anti-patterns|panel/provenance\.component|panel/extension-prompt` outside `.project`/`node_modules`; `src/panel/` listing; `error-explainer.component.ts:4`; `scripts/di-*.test.mjs:3`.
- **Confidence**: high.
- **Why it matters here**: unchanged: half of `src/panel/` is dead and its live twins have the same names. M018/M019 panel work can edit the wrong twin with every check green.

## Finding: `src/main-world/provenance-tracer.ts` is exercised only by a test no script runs — while two skill documents call it the live page-side tracer

- **Claim (carried, extended)**: the only importer of `provenance-tracer.ts` is `src/main-world/provenance-tracer.test.ts:3`, which is matched by no npm glob and excluded from `tsconfig.app.json:8-11`. The live N2 algorithm is `apps/angular-ai-devtools/src/app/signal-provenance.ts`, imported by `signal-provenance.service.ts`. Both copies of `control-ai-browsers/features/signal-provenance.md` (`:5,32`) state that "the page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`".
- **Source**: grep for `provenance-tracer`; `apps/angular-ai-devtools/tsconfig.app.json:8-11`; `apps/angular-ai-devtools/src/app/signal-provenance.ts`; `.commandcode/skills/control-ai-browsers/features/signal-provenance.md:5,32`.
- **Confidence**: high on the import graph; medium on how the skill's sentence should be read.
- **Why it matters here**: N2 has two tracers with different traversal rules and only the app copy is reachable from a gate; the docs assertion is a separate (docs-audit) matter, but a planner must not treat `provenance-tracer.ts` as live code.

## Finding: `extension/panel.html` and `extension/panel.js` remain orphaned vanilla-JS files

- **Claim (carried, still true)**: the manifest names `background.js`, `relay.js`, `agent-main.js` and `devtools_page: devtools.html` only (`extension/manifest.json:14-31`); `extension/devtools.js:2-6` opens `panel/index.html`; `extension/panel.html:13` still loads `panel.js`, and nothing outside research/archive references either. `.gitignore:33-35` ignores `extension/panel/*` except `index.html` and `favicon.ico`, so the built panel is untracked while the vanilla leftovers are tracked.
- **Source**: files and lines as cited; grep for `panel\.html|panel\.js`.
- **Confidence**: high.
- **Why it matters here**: unchanged. Two files named "panel" exist and only one is shipped.

## Finding: `extension/*.js` is hand-written source with no build step and duplicates `src/` logic

- **Claim (carried, still true)**: no npm script or Nx target compiles, bundles or copies `extension/*.js`; `build-extension` writes only `extension/panel/` (`apps/angular-ai-devtools/project.json:52-92`). `agent-main.js` (685 lines) re-implements logic that also exists as tested TypeScript — `captureErrorPayload` (`:636-663`) versus `captureError`/`resolveOwningComponent` in `src/main-world/error-capture.ts:33-70` — and the window-event contract in `relay.js:6-24` is mirrored by hand.
- **Source**: `apps/angular-ai-devtools/project.json:8-134`; `extension/agent-main.js:607-685`; `src/main-world/error-capture.ts:33-70`.
- **Confidence**: high.
- **Why it matters here**: unchanged: any shared rule is written twice in two languages and only one copy has unit tests.

## Finding: `interop.service.ts` still silently substitutes no-op stubs when an import fails

- **Claim (carried, still true)**: the module opens with `// @ts-ignore` over `await import('../../../../src/main-world/interop-keep-list.ts').catch(() => null)` and then guards three more dynamic imports; if `@angular/core` throws, `signal(v)` becomes `{ set() {}, update() {} }` and `inject` returns null. `ExtensionPromptService` and `UpdateCauseService` are likewise `null` on failure (`:21-25`).
- **Source**: `apps/angular-ai-devtools/src/app/interop.service.ts:1-25`.
- **Confidence**: high (code read); medium on runtime effect (not exercised live).
- **Why it matters here**: unchanged: a broken import path renders the "no interop findings" empty state and neither `build` nor `check` reports it.

## Finding: the alias-export convention still inflates several modules

- **Claim (carried, re-measured)**: leading-`export` counts at this head: `src/main-world/stale-view-scan.ts` 35, `apps/angular-ai-devtools/src/app/interop.service.ts` 32, `src/main-world/error-capture.ts` 27. The pattern is many names bound to one implementation — `error-capture.ts:18-20` exports `NO_OWN_COMPONENT`, `NO_OWN_COMPONENT_MESSAGE` and `NO_OWNING_COMPONENT` for one string; `interop.service.ts:27-29` does the same for the limitation sentence.
- **Source**: `findstr /r /c:"^export " | find /c` over the three files; `src/main-world/error-capture.ts:18-24`; `apps/angular-ai-devtools/src/app/interop.service.ts:27-29`.
- **Confidence**: high.
- **Why it matters here**: unchanged: reviewers cannot tell deliberate public API from speculative aliasing, and a rename has several call sites per function.

## Finding: `resolveOwningComponent` still contains an accessor name that no Angular export can match

- **Claim (carried, still true)**: `resolveOwningComponent` tries `ng.getOwningComponent`, then `ng["\u0152getOwningComponent"]` (U+0152 LATIN CAPITAL LIGATURE OE), then `ng.ɵgetOwningComponent` (U+0275). The middle branch names a symbol Angular does not publish, so it is unreachable, while the comment below it claims the code accepts "the Angular-style ɵ-prefixed accessor".
- **Source**: `src/main-world/error-capture.ts:40-55` (branch at `:45-46`, comment at `:49`).
- **Confidence**: medium — source read only; no runtime probe of `window.ng` was made in this read-only pass.
- **Why it matters here**: unchanged: the branch reads as coverage that does not exist, and M018's `getComponent`/`getDirectiveMetadata` wrappers will face the same `ng` accessor ambiguity.

## Finding: the charter now records the paid model policy — the previous map's contradiction is closed (changed since `a133a50`)

- **Claim (carried, CHANGED)**: the previous map recorded `CHARTER.md` declaring "free routes only" while `.project/model-policy.json` pinned paid models. `CHARTER.md:212-220` now records the 2026-11-01 correction (paid DeepSeek V4.1 Flash for the tool-loop roles, GLM-5.3 Flash for `reviewer`/`skeptic`/`review_panel`), `:166-169` marks the open question `[RESOLVED 2026-11-01]`, and `.project/model-policy.json:2-51` matches that table for all twelve roles. The Constraints paragraph at `:124-131` still reads "free routes only" — correctly, because the charter is amended only under Corrections.
- **Source**: `CHARTER.md:124-131,166-169,212-220`; `.project/model-policy.json:1-52`.
- **Confidence**: high.
- **Why it matters here**: a planner must read the Corrections section, not only Constraints, or it will budget free routes the dispatch table no longer uses. The same pattern now applies to A6 (Finding above).

## Finding: the repository still has no CI configuration

- **Claim (carried, still true)**: the root contains no `.github/` directory (the `dir .github` probe exits 1) and no `azure-pipelines.yml`, `.gitlab-ci.yml` or `Jenkinsfile`; every gate is a local npm script or Nx target.
- **Source**: `dir /b` on the repo root (33 entries, none CI-related); `package.json:6-11`.
- **Confidence**: high.
- **Why it matters here**: unchanged: "green" means green on this Windows host with a populated `~/.commandcode`.

## Finding: two skill trees exist and byte-equality is enforced for two of the eight mirrored skills

- **Claim (carried, still true)**: `.commandcode/skills/` holds 18 folders, `.claude/skills/` holds 8 (counted this pass). `scripts/skills-mirror.test.mjs:45-52` loops over `['control-ai-browsers', 'verify-ai-browsers']` only, and `AGENTS.md:38-41` states the other six `.claude` folders are older copies.
- **Source**: folder counts; `scripts/skills-mirror.test.mjs:45-52`; `AGENTS.md:38-41`.
- **Confidence**: high.
- **Why it matters here**: unchanged: a change to `control-angular-devtools`, `verify-angular-devtools`, `control-pangular-inspector`, `verify-pangular-inspector`, `control-angular-dev-app` or `control-vitest-browser-angular` lands in one tree only.

## Finding: every skill test executes twice, once per tree

- **Claim (carried, still true)**: `test:skills` runs `".claude/skills/**/*.test.mjs"` and `".commandcode/skills/**/*.test.mjs"`; both trees hold 28 `*.test.mjs` files (counted this pass), so 28 suites run twice.
- **Source**: `package.json:10`; file counts 28/28.
- **Confidence**: high.
- **Why it matters here**: unchanged: suite size and runtime are roughly double the file count, which matters to any timing-sensitive gate.

## Finding: host-specific absolute paths are still committed inside the repo and its tests

- **Claim (carried, still true)**: `tsconfig.json:6-7` lists `C:/Users/LarsGyrupBrinkNielse/.commandcode/scripts/…` as absolute `include` entries; `extension-config.json:4` hard-codes `--load-extension=D:/projects/sandbox/angular-ai-devtools/extension`; `.commandcode/skills/control-ai-browsers/scripts/control.test.mjs:175` (and its `.claude` byte copy) contains `'D:\\projects\\sandbox\\angular-ai-devtools\\extension'`.
- **Source**: those files, per line.
- **Confidence**: high.
- **Why it matters here**: unchanged: the primary checkout path is baked into a tracked config, and `npm run check` reads two files that exist only on this host.

## Finding: browser verification still depends on shared, host-level profile state

- **Claim (carried, still true)**: `AGENTS.md:26-37` requires every browser instance to be driven through `control-ai-browsers` in a per-instance profile under the primary checkout's `.commandcode/worktrees/.browsers/`, forbids starting a profile by hand, and requires `build-extension` before `up`. `.gitignore:11,19` ignores `.browsers/` and `.commandcode/worktrees/`; `extension-config.json:4` launches the extension from the absolute primary path.
- **Source**: `AGENTS.md:26-37`; `.gitignore:11,19`; `extension-config.json:4`.
- **Confidence**: high.
- **Why it matters here**: unchanged: no panel claim can be verified from an inspection or a sidecar; claims that need a live panel must be planned as tasks that run in the primary checkout.

## Apparent intent

- The repository is now two products in one checkout, and the second one is growing deliberately: the extension (six shipped explainers) and the GSD Path harness plus the programme-1 backlog for a much larger tool-registry instrument. — based on the 28 commits since `a133a50` touching only harness, docs and plans; `plans/angular-ai-devtools-program-backlog.md:47-74` (one root, six programmes, generations of ≤12); and `CHARTER.md:265-286` admitting programme 1's scope.
- The programme's first milestone is an envelope, not a feature: M018 fixes the registry vocabulary before any explainer uses it, and the backlog says so in one line ("a wrong envelope is expensive everywhere"). — based on `plans/angular-ai-devtools-program-backlog.md:83-96` and `CHARTER.md:269-270`.
- The intended architecture is panel-owned AI with page-side facts, and the current two-way gap (no request channel, a forgeable page global, a dead `host:pick`) is what M018 will have to close — based on `CHARTER.md:92-94` as amended by A6, `extension-prompt.service.ts:17-25`, `background.js:16-26` and `agent-main.js:607-632` (inference).
- The in-page overlay is meant to replace, not supplement, the existing DOM footprint: AR-2/AR-3 describe "the only DOM the tool adds", which today is a green banner in `relay.js:34-38`. — based on `CHARTER.md:250-255` plus the relay code (inference).
- The team treats the docs audit as the enforcement surface for documentation truth and `npm test` as the gate that runs it, so the current E6 failure is a docs-side blocker on a code milestone. — based on `scripts/docs-audit-disposition.test.mjs:536-545`, `package.json:9` and `CHARTER.md:161-162` (inference).

## Open questions for define

- Is `tests/` (22 files) meant to stay and be re-pointed at the current `.project` layout, be rewritten against artifacts that still exist, or be retired? Ten files cannot pass at any head after M009 archived.
- Is `e2e/provenance.spec.ts` a leftover after the spec moved to `apps/angular-ai-devtools-e2e/src/`, or the reverse? They are byte-identical today, and the Nx config also declares firefox and webkit projects.
- Should `npm test` keep depending on `~/.commandcode` (now including the M017 rules pins), or must the user-scope stages move behind a separate, opt-in script before programme 1 relies on a green gate?
- Does M018 own building the panel→page request channel (the missing `angular-ai:di-query` transport), or is that a separate task? M018's read tools cannot work without it.
- Should the page host of the registry address the page through `globalThis.__ngRecorder` and the window `CustomEvent` channel as they stand, or does the envelope need a hardened transport that a page script cannot forge?
- Should `relay.js`'s marker div (`#angular-ai-devtools-marker`) be removed now, before M022, given AR-3 makes the overlay the only DOM the tool adds?
- Does M022 change `agent-main.js`'s `run_at` to `document_start`, and does that move N4's error hooks for every shipped explainer?
- Is the 520 KB initial budget allowed to be exceeded or must `@angular/material`/`cdk`/`aria` be lazily loaded, given the measured ~507 KiB baseline and the error digest already inside `main.js`?
- Should `CHARTER.md` gain a Corrections entry for A9, and one superseding the "no tool calling in the core loop" sentence now that A6 permits it?
- Are `src/panel/{chain,anti-patterns,provenance.component,extension-prompt.service}.ts` and `src/main-world/provenance-tracer.ts` intended to be deleted, or re-adopted? The skill docs already cite `provenance-tracer.ts` as live.
- Should `extension/agent-main.js` gain a build step from `src/main-world/`, or stay a hand-maintained duplicate?
- Is a Playwright run part of any gate the project wants, given that no npm script invokes either config?

## Blocked areas

- `npm run check`, `npm test` (as a whole), `npx nx run angular-ai-devtools:build-extension`, `npm run test:app`, `npm run test:skills` — **not run**. The sidecar ships without `node_modules` and `scripts/ensure-sidecar-deps.mjs` would create a junction inside it; creating that path is outside the single-file write scope this task was given. Stage 1 and stage 2 of `npm test` were reproduced by invoking their commands directly (107 tests / 1 fail, and 60 tests / 0 fail).
- `npm run test:skills` (56 suites over two trees) — **not run**; only `scripts/skills-mirror.test.mjs` was exercised (inside the 42-test batch, passing).
- Live browser and on-device-model behaviour (Prompt API availability, panel rendering, four model pairs, the DI query path on a real DevTools panel) — **not attempted**: `AGENTS.md:26-37` requires `control-ai-browsers` against shared profiles under the primary checkout, and this is a read-only inspection phase. The `di-query` finding is therefore a code-graph result, not a live failure.
- `.project/archive/**` — not read in this pass, except where a reachable file cited an archived path by name.
- `.commandcode/skills/nx-*` (10 third-party folders) — not read; they are installs from `D:/projects/github/nrwl/nx-ai-agents-config`, per `.commandcode/.nx-skills-manifest.json` in the previous map.
- `spikes/ng222-app` and `spikes/ng222-ssr` internals — not read in depth; fixture behaviour is covered indirectly by the 15 passing `stale-view-*` tests.
- `scratchpad/` — noted only: `scratchpad/analysis_result.txt` is tracked and is the sole textual reference to four dead `src/panel/` modules.
- Brief defect to report upward: the brief names the role file `~/.commandcode/skills/gsd-path/references/role-inspector.md`, which does not exist (the `references/` folder holds `codebase-mapper.md` and 22 others). This inspection followed `references/codebase-mapper.md` as the role file.
