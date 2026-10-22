# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-10-19
Checks run: `npm run check` → exit 0 (tsc root + skills); `npm test` → 516/516 pass (node:test); `npx nx test angular-ai-devtools --skip-nx-cache` → 3 files, 10 tests pass; `npx nx run angular-ai-devtools:build-extension --skip-nx-cache` → success

## Map

- **Stack**: TypeScript 6.0.3 (pinned), Angular ~22.1.0, Nx 23.3.0, Vitest 4.x, Node test runner; Chrome MV3 extension (background service worker + content scripts). Node >=? not pinned in manifest; uses ESM (`"type": "module"`).
- **Entry points**: Angular app `apps/angular-ai-devtools/src/main.ts` → `App` component → route `''` → `N1UpdateCauseComponent`; extension entry `extension/devtools.html` → `devtools.js` creates "Angular AI" panel at `panel/index.html`; service worker `extension/background.js`.
- **Architecture**: Nx monorepo with one Angular app whose production build is also emitted as the extension panel (`build-extension` outputs to `extension/panel`). MV3 messaging: page MAIN-world `agent-main.js` announces Prompt API capability via custom events → isolated-world `relay.js` → `chrome.runtime` → `background.js` → DevTools panel; `ExtensionMessageService` in panel filters by `inspectedTabId`. Prompt API session is created inside the panel (`ExtensionPromptService`), not the page.
- **Conventions**: strict TS (`noUncheckedIndexedAccess`), standalone Angular components, signals for state, `inject()` DI, kebab-case file names, node:test for scripts, spec files co-located (`*.spec.ts`). Commits use conventional prefixes (`feat:`, `fix:`, `chore:`).
- **Maturity**: root type check and 516 script tests pass; Angular unit tests (10) pass; extension builds. Feature surface is narrow: one panel feature ("why did this update?" recorder) plus AI explain of Angular version. Many `spikes/` and `research/` artifacts; `.project/archive/` contains prior GSD runs.
- **Recent activity**: last commits cluster on extension messaging (`keep only the inspected tab's Angular detection`), DevTools panel Prompt API call, and control-ai-browsers hardening (2026-10).

## Finding: Dead `content.js` is not wired into the manifest

- **Claim**: `extension/content.js` defines an isolated-world bridge (`window.__ANGULAR_AI_PROMPT_API__`) and Angular marker injection, but `manifest.json` content_scripts list only `relay.js` and `agent-main.js`; `content.js` is never loaded.
- **Source**: `extension/manifest.json:18-30` vs `extension/content.js:1-64`
- **Confidence**: high
- **Why it matters here**: A planner/reader may assume `content.js` is part of the live extension; it is scaffolding/leftover. Only `relay.js` performs isolated-world bridging and Angular detection in production.

## Finding: `relay.js` and `content.js` duplicate Angular detection

- **Claim**: Both `relay.js` (lines 49-87) and `content.js` (lines 44-64) inject the same `#angular-ai-devtools-marker` and send `angular-detected`; in the live path only `relay.js` runs, so detection logic is duplicated and one copy is unreachable.
- **Source**: `extension/relay.js:49-87`, `extension/content.js:44-64`
- **Confidence**: high
- **Why it matters here**: Changes to detection must be made in `relay.js` to affect runtime; editing `content.js` has no effect.

## Finding: Prompt API session lives in the DevTools panel, not the inspected page

- **Claim**: `ExtensionPromptService` calls `globalThis.LanguageModel` directly inside the panel context; the page never receives the prompt or answer. This is intentional and documented (docs/feature-proposals.md §3.1, research/19).
- **Source**: `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:31-33`, `extension-prompt.service.ts:75-103`
- **Confidence**: high
- **Why it matters here**: Do not move Prompt API calls to content scripts/page; the security model depends on panel isolation.

## Finding: Panel filters detection by inspected tab id

- **Claim**: `ExtensionMessageService` drops messages whose `tabId` differs from `chrome.devtools.inspectedWindow.tabId`; background relays every tab's detection to every panel.
- **Source**: `apps/angular-ai-devtools/src/app/extension-message.service.ts:27-31`
- **Confidence**: high
- **Why it matters here**: Multi-tab inspection correctness relies on this filter; removing it causes cross-tab leakage.

## Finding: Extension panel build output is gitignored except shell files

- **Claim**: `.gitignore` ignores `extension/panel/*` except `index.html` and `favicon.ico`; the Angular bundle must be regenerated via `build-extension` before loading the extension.
- **Source**: `.gitignore:34-36`, `apps/angular-ai-devtools/project.json:52-89`
- **Confidence**: high
- **Why it matters here**: A fresh checkout's extension panel is only the shell; `npx nx run angular-ai-devtools:build-extension` is required before `up`.

## Finding: Sidecar verify worktrees ship without `node_modules`

- **Claim**: Verify sidecars have no `node_modules`; `scripts/sidecar-deps-bridge.mjs` junctions them to the primary worktree. AGENTS documents this.
- **Source**: `AGENTS.md:12-21`, `scripts/sidecar-deps-bridge.mjs:87-115`
- **Confidence**: high
- **Why it matters here**: Running checks in a sidecar requires bridging first; forgetting it yields TS2688.

## Finding: Two content-script worlds coexist (`relay.js` isolated + `agent-main.js` MAIN)

- **Claim**: `relay.js` runs in the isolated world and bridges to `agent-main.js` in the MAIN world via `CustomEvent('angular-ai:llm:*')`. As of the 2026-10-19 ruling, Prompt API runs in the DevTools panel (or a Worker the panel starts), NOT in the page/content scripts/service worker; `agent-main.js` keeps only page-reading (`ng.ɵsetProfiler`, `ng.ɵgetSignalGraph`) and forwards shaped facts. The prompt half of the bridge (LanguageModel code in agent-main.js, PROMPT_API_REQUEST forwarding/request() in relay.js, PROMPT_API_REQUEST stub in background.js) is slated for removal in milestone N1.
- **Source**: `extension/manifest.json:18-30`, `extension/relay.js:1-43`, `extension/agent-main.js:1-67`, `docs/feature-proposals.md` §N1/§3.7
- **Confidence**: high
- **Why it matters here**: Panel-local Prompt API is a design rule (no LanguageModel in page/content/SW); a page could read/forge the exchange and Edge exposes no LanguageModel there without flags. Relay forwards shaped facts only.

## Finding: `content.js` defines `__ANGULAR_AI_PROMPT_API__` that is never consumed

- **Claim**: `content.js` exposes `window.__ANGULAR_AI_PROMPT_API__` with `analyze`/`checkAvailability`, but nothing in the repo references that global; the live path uses `relay.js` + `agent-main.js`.
- **Source**: `extension/content.js:16-42`; grep for `__ANGULAR_AI_PROMPT_API__` only in `content.js`
- **Confidence**: high
- **Why it matters here**: Another half-built/legacy surface; not part of runtime contract.

## Apparent intent

- The project is becoming an on-device-AI Angular DevTools extension: deterministic "why did this update?" change-detection causality recorder (feature N1, NOT yet built — `UpdateCauseService.record()` has no callers) plus an LLM explanation of the detected Angular version, all running locally via the browser Prompt API in the DevTools panel. Evidence: `N1UpdateCauseComponent`, `ExtensionPromptService`, extension messaging, research/19 context matrix, docs/feature-proposals.md §N1.
- Skills/installer scripts (`scripts/install-*.mjs`) and control/verify skills suggest the repo doubles as a distribution mechanism for agent skills; not just the Angular app.

## Open questions for define

- Is `content.js` intended to be revived as an alternative bridge or should it be deleted? → **Resolved 2026-10-19: delete** (never loaded; relay.js does detection).
- Should the panel's Prompt API ever call through to the page's `agent-main.js` bridge, or remain panel-local by design? → **Resolved 2026-10-19: panel-local by design** (docs/feature-proposals.md §3.7).
- Are the `spikes/` and `research/` artifacts meant to stay in-repo, or be archived? → **Resolved 2026-10-19: keep** (fixtures + cited evidence base).

## Blocked areas

- Browser/Prompt API runtime verification not run here (requires shared browser instances; out of scope for this mapper). Static + unit + type checks only.
- E2E Playwright suite not executed (not part of `npm test`; requires browser).<|end|><|start|>write_file to=assistant<|channel|>analysis<|message|>Now teardown bridge? The role says run commands only in sidecar; bridge created. Should we remove junction before finishing? AGENTS says junction must be removed before retiring sidecar. The parent owns retirement. But we created junction; maybe should remove to leave clean. However if we remove, sidecar node_modules gone; artifact already written. Better remove bridge to avoid stale junction? The brief says use only sidecar for commands; not necessarily remove. AGENTS says remove before retiring sidecar. Parent retires. But to be safe, remove junction now.<|end|><|start|>Assistant to=powershell<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
node "C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\inspect-codebase\scripts\sidecar-deps-bridge.mjs" "C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\inspect-codebase" --unlink