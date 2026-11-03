# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-03
Base revision: `867f563e47fcf21dc0468ed44b2417e648a992cd` — the brief's verify sidecar; `git rev-parse HEAD` matches it and `git status --short` is empty.
Checks run: none. The brief forbids builds, tests and installs, and the sidecar has no `node_modules` (`Test-Path node_modules` -> False), so `npm run check`, `npm test` and every Nx target are `unverifiable` here. Only read-only commands ran: `git rev-parse|log|ls-files|status`, `node -v` -> v24.22.0, `Test-Path`, directory listings, file reads, and grep over tracked files.

## Map

- **Stack**: TypeScript 6.0.3 pinned (`package.json:33`); Angular `~22.1.0` for `@angular/core|common|compiler|forms|platform-browser|router` (`package.json:37-42`); Nx 23.3.0 with `@nx/angular|devkit|js|playwright|web` (`package.json:22-26`); Vitest `^4.0.8` for the panel's specs (`package.json:34`) behind the `@angular/build:unit-test` target; `@playwright/test ^1.37` and `jsdom ^27.1` for the rest (`package.json:28,32`). The root package is private and `"type": "module"` (`package.json:2-4`). The shipped extension is MV3 `0.3.0` with permissions `scripting|activeTab|storage` and `host_permissions: ["<all_urls>"]` (`extension/manifest.json:2-13`). The inspected fixture is a separate Angular application on `^22.2.0` with its own lockfile (`spikes/ng222-app/package.json`).

- **Entry points** (taken from build targets and source entries, not guesses):
  - Panel: `apps/angular-ai-devtools/src/main.ts` -> `App` -> one `<router-outlet>` (`app.html:1`) -> seven routes (`app.routes.ts:8-16`): `''`=N1UpdateCause, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view` eager; `interop` and `chat` lazy (`:14-15`).
  - `apps/angular-ai-devtools/project.json` targets: `build` (`:9-51`); `build-extension` (`:52-92` — outputPath base `extension/panel` `:61-64`, browser `main.ts` `:65`, `baseHref "/panel/"` `:76`, `outputHashing "none"` `:77`, budgets 520kb/1mb `:79-90`); `generate-error-digest` (`:93-99`); `serve` (`:100-112`); `test` (`:113-124`); `serve-static` (`:125-134`).
  - Extension: `background.service_worker: background.js`, `type: module` (`manifest.json:14-17`); two content scripts on `<all_urls>` (`:18-30`); `devtools_page: devtools.html` (`:31`) -> `devtools.js:2-4` creates the "Angular AI" panel pointing at `panel/index.html`, which is the `build-extension` output.
  - Page realm: `agent-main.js` runs itself at the end of the file (`:950`) and publishes its API as `globalThis.__ngRecorder` (`:895`); `relay.js` registers its four window listeners and its one runtime listener at load (`:11-38`) and probes for `[ng-version]` (`:42`).
  - Workspace scripts that are real entry points: `npm run check` (four stages, `package.json:7-10`) and `npm test` (`node --test` over `scripts/` and `extension/`, then user-scope and skill suites, then the Nx unit target — `package.json:11-13`).

- **Architecture**: three realms. (1) MAIN world: `agent-main.js` feature-detects Angular's `ɵ` debug functions (`:73-81`), subscribes the profiler (`:436`), groups its events into microtask-delimited cycles (`:488-497,669-685`) and publishes them as window `CustomEvent`s (`:815-823`). (2) ISOLATED world: `relay.js` forwards each of those events to `chrome.runtime.sendMessage` (`:11-31`), latches the last state and version verbatim (`:29,48`), and answers one `angular-ai:replay-request` from the latch (`:34-38`); `background.js` re-broadcasts each tab's messages to every extension context with a `tabId` stamp (`:10-14`) and routes one replay request back through `chrome.tabs.sendMessage` (`:30-52`). (3) The Angular panel: `ExtensionMessageService` is the single `chrome.runtime.onMessage` funnel, fanning payloads into signals (`:74-79,112-154`); `page-reads.ts` declares the five page reads as a port whose default provider answers `host-unavailable`, because no transport exists (`:14-20,87-111`). The panel adds nothing to the inspected page; the extension adds one marker node from the relay (first finding below).

- **Conventions** (binding on the planner):
  - One behaviour per module, exported as a pure function plus its types; a component holds no decision worth testing (`page-reads.ts:113-168`, `di-explain.ts`, `di-path-display.ts`).
  - Errors are named outcomes, never exceptions and never empty results: `PageResponse` carries `{status:'error', code, message}` (`page-reads.ts:61-70`), a refusal is a full sentence naming what could not be asked (`:87-88`), and "cannot tell" is kept distinct from "nothing there" (`extension-message.service.ts:51-59,168-172`).
  - Every pin proves its own bite with a failing half: a temp tree in `scripts/registry-reach.test.mjs:380-430`, a synthetic output tree in `scripts/panel-bundle-budget.test.mjs:174-203`, the comparison itself at `:210-220`. A failure message names the file, the value and what the fix is *not*.
  - Page-world code is hand-written ES5-flavoured IIFE JavaScript — `var`, every `ɵ` function feature-detected, every call inside a `try/catch` that "never throws into the page" (`agent-main.js:8,73-81,483-485,925`) — with no module syntax and no framework.
  - Tests sit beside the unit: 30 `*.spec.ts` under `apps/` (Vitest), 25 `scripts/*.test.mjs` plus 4 `extension/*.test.mjs` under `node:test` booting the shipped `.js` in a `vm` sandbox, 2 `*.node.test.ts` deliberately outside the Angular target, and 24 files in `tests/held-out/` that `npm test` does not run.
  - Commits are `type: subject` with the task id in the subject (`T004: ...`, `build: record T004 landing`, `fix: ...`).

- **Maturity**: what runs is the panel shell with seven routes, the extension's detection/profiler/error-capture path, a marker node in every Angular page, the tool registry's published declarations — five page reads (`read-tools.ts:192,206,220,234,248`) plus `app_facts`, `panel_environment` and `error_digest_lookup` — with one production consumer (`chat-entry.component.ts`), a separate set of `publish: 'internal'` hostile entries that no explainer uses (`tool-registry/hostile-tools.ts:6,105,125,156,183`), and a large pure-module layer. Scaffolding or unreachable: `extension/panel.html` + `extension/panel.js` (a status page nothing opens — `devtools.js:2-4` opens `panel/index.html`); `DiDoctorService.queryDi` (`di-doctor.service.ts:23-26`, no caller); the `PAGE_HOST` port (no transport); the M019 job/worker/ring-buffer layer; and `tests/held-out/`, which no script invokes. No CI configuration exists in the tree.

- **Recent activity**: the three newest commits are all dated 2026-11-03 (`867f563 integrate: M021`, `309fde7 ship: M021`, `4991ea6 build: complete milestone`). The 30 newest belong to M021 (`optin-companion`): T001 docs-audit repair, T002 the companion package and its dev-build proof, T003 the type-check re-pin, T004 page-realm companion detection in `extension/agent-main.js`, T005 the panel's companion surface, T006 fail-not-skip on a missing fixture install. By file, churn is dominated by `.project/` bookkeeping (verify ledger, STATE, ROADMAP, task files), with product work in six files under `apps/angular-ai-devtools/src/app/`, `extension/agent-main.js` and `packages/ai-devtools-companion/`.

## Finding: The tool already adds a DOM node to every Angular page it inspects

- **Claim**: `relay.js` creates a `div`, gives it `id="angular-ai-devtools-marker"`, inline `position:fixed` styling and the text `Angular <version> detected`, and appends it to `document.body` the first time it finds `[ng-version]`. It is light DOM (no shadow root), it is never removed, and no test asserts either its presence or its absence.
- **Source**: `extension/relay.js:50-54` (`createElement` `:50`, `id` `:51`, `textContent` `:52`, `style.cssText` `:53`, `document.body.appendChild(marker)` `:54`), reached from `checkAngular` (`:41-62`) whose probe is `document.querySelector('[ng-version]')` (`:42`); `extension/relay.test.mjs:37-39` stubs `createElement` and `body.appendChild` so this path executes in the unit test, and no assertion mentions the marker.
- **Confidence**: high
- **Why it matters here**: the milestone's acceptance rule is "the overlay is the only DOM the tool adds to an inspected page". Today there is exactly one other node, in the wrong world, outside any shadow root, and with an inline style the page can read. A reviewer or a new check that enumerates tool-owned nodes will find it, and a closed-shadow host cannot be "the only DOM" until this node is accounted for.

## Finding: No content script runs at `document_start`, and nothing pins the manifest

- **Claim**: `document_start` appears in no manifest and no shipped script — both content scripts are declared at `document_idle` — and no repository test reads `extension/manifest.json`, so moving a script to `document_start` or adding a third declaration is an unguarded edit. Neither declaration sets `all_frames` or `match_about_blank`, so both take the platform default and are top-frame-only.
- **Source**: `extension/manifest.json:18-30` (`matches: ["<all_urls>"]` `:20,25`; `run_at: "document_idle"` `:22` and `:27`; `world: "MAIN"` `:28`; no `all_frames`/`match_about_blank` key in either object); grep for `manifest.json|content_scripts` over tracked `*.mjs` finds no repository test that opens the extension manifest (the only hits are model-manifest handling inside `.commandcode/skills/**`); `scripts/error-digest-wiring.test.mjs` pins the project targets and never the manifest.
- **Confidence**: high
- **Why it matters here**: "attached once at `document_start`" is a manifest edit, not a code edit, and it is the only manifest edit in this programme with no test standing in front of it. It also decides what the page sees first: the marker insertion and the `[ng-version]` probe move earlier with the relay if the relay is the file that changes.

## Finding: The overlay cannot live inside `agent-main.js` as things stand — the blast-radius test forbids the tokens it needs

- **Claim**: `agent-main.test.mjs` strips comments from `agent-main.js`'s source and asserts that the file contains no `createElement(`, no `appendChild(`, no `innerHTML`, no `localStorage|sessionStorage`, no `alert|confirm|prompt`, and that the only `globalThis.<name> =` assignment in it is `__ngRecorder`. An overlay that builds a host element in that file fails `npm test` before any reviewer sees it, and `agent-main.js` is currently the only file carrying page-world code.
- **Source**: `extension/agent-main.test.mjs:1000-1012` (the seven patterns), `:1013-1017` (one global write), `:990-998` (added globals `deepEqual ["__ngRecorder"]`), all against `SRC = readFileSync("./agent-main.js")` at `:9`; `extension/agent-main.js:895` (`globalThis.__ngRecorder = api`).
- **Confidence**: high
- **Why it matters here**: the milestone's first structural decision — a new `extension/*.js` file plus a manifest entry, with a second blast-radius pin written for it, versus re-pinning this test — is made by a test, not by the design docs. Whichever is chosen, the pin that currently forbids page DOM stops being true of "the tool" and becomes true only of one file.

## Finding: There is still no panel-to-page request transport, and the DI query path is dead at its first link

- **Claim**: nothing carries a request from the panel into the page. The background handles five message types plus the replay route, none of which asks the page anything; the relay's only `chrome.runtime.onMessage` listener answers `angular-ai:replay-request` and returns `false` for every other type; `DiDoctorService.queryDi` is defined and never called anywhere in the tree; and the page's `angular-ai:di-query` listener has no dispatcher.
- **Source**: `extension/background.js:8-61` (record/state/di-graph/error-capture `:10-14`, `host:capability` `:16-20`, `host:pick` `:22-26`, `state-request` -> `chrome.tabs.sendMessage` `:30-52`, `angular-detected` `:55-60`); `extension/relay.js:34-38` (`return false` at `:35`); `apps/angular-ai-devtools/src/app/di-doctor.service.ts:23-26`; `extension/agent-main.js:897`; `apps/angular-ai-devtools/src/app/page-reads.ts:14-20,87-111`.
- **Confidence**: high
- **Why it matters here**: a picker "driven from the panel" needs a channel that does not exist, so the picker cannot be specified as if it had one. The pieces a transport would ride on are already in two places — a `chrome.tabs.sendMessage` call site (`background.js:36`) and an isolated-world `onMessage` listener (`relay.js:34`) — so the missing part is a message type through the background and a forwarder in the relay, not a new mechanism.

## Finding: The page realm's footprint is more than one global — a patched `console.error`, two window listeners, four event names and three timers

- **Claim**: `agent-main.js` replaces `console.error`, adds `error` and `unhandledrejection` listeners on `globalThis`, dispatches four named `CustomEvent`s on `globalThis`, and runs up to three timers (a 100 ms install poll, a 250 ms companion re-check, a 500 ms initial-record timeout). The blast-radius test pins the added global set and the source-text token list only, so the listeners, the console patch and the event names are unasserted.
- **Source**: `extension/agent-main.js:928-936` (console.error replacement, original preserved and called through), `:938-947` (window `error` and `unhandledrejection`), `:815-823` (`dispatch` on `globalThis`), `:11-16` (the `angular-ai:*` event names), `:850-853` (100 ms `setInterval`), `:351` (250 ms re-check), `:442` (500 ms `setTimeout`); `extension/agent-main.test.mjs:990-1017`.
- **Confidence**: high
- **Why it matters here**: the milestone's subject is precisely "what an inspected page can observe of the tool", and the observable surface is wider than the one global the test protects. A page script can listen for `angular-ai:state` today and read the whole app-facts record.

## Finding: `agent-main.js` says its error hooks run at `document_start`, but the manifest runs them at `document_idle`

- **Claim**: the comment above the error-capture hooks claims `document_start`; the file is declared at `document_idle`, so the `console.error`, `window.onerror` and `unhandledrejection` hooks install at idle time and miss anything the page logs or throws before then. The comment is the only place in the tree that says otherwise.
- **Source**: `extension/agent-main.js:900`; `extension/manifest.json:27`; the hooks are top-level statements at `agent-main.js:928-947`, so they run whenever the content script is injected.
- **Confidence**: high
- **Why it matters here**: moving the page-side script to `document_start` (which the overlay's "attached once at `document_start`" needs) silently widens N4's error-capture window. That is a behaviour change in an existing feature, and it belongs in the plan rather than in a reviewer's diff.

## Finding: Nothing in shipped code measures layout geometry; there is no scroll or resize listener anywhere

- **Claim**: `visualViewport`, `getBoundingClientRect`, `devicePixelRatio` and `elementFromPoint` have zero occurrences under `extension/`, `apps/`, `src/`, `scripts/` and `tests/`; the only matches are prose (`docs/design/tutor.md:468`, `docs/feature-proposals.md:433`, `plans/angular-ai-devtools-program-backlog.md:126`). The panel's own layout has no zoom or ratio handling, and the only `matchMedia` in the tree is a test stub.
- **Source**: repo-wide grep over tracked files for those four tokens and for `addEventListener('scroll'|'resize'`; `tests/browser/di-regression.spec.ts:150` (the only `matchMedia`, a page fixture stub). The nearest existing element lookup is a fixed chain — `document.activeElement || document.querySelector("app-root") || document.body || document.documentElement` (`agent-main.js:911-914`).
- **Confidence**: high
- **Why it matters here**: rect tracking is net-new code with no precedent to copy and no existing listener to hang it on. Every input the milestone names — scroll, zoom, CSS transform, pixel ratio — has to be observed for the first time, and the panel contributes nothing to it.

## Finding: The tool owns exactly one `MutationObserver`, and it is the configuration that would see a host

- **Claim**: the only observer in shipped code is constructed at two sites in `relay.js` (one per branch of the same load path), both observing `document.documentElement` with `{childList: true, subtree: true}`, and both disconnect on the first successful detection. There is no host subtree to exclude today, because the only node the tool inserts is appended once and never observed.
- **Source**: `extension/relay.js:64-80` — `new MutationObserver` at `:67` and `:75`, `observer.observe(document.documentElement, { childList: true, subtree: true })` at `:70` and `:78`, `observer.disconnect()` at `:68` and `:76`; repo-wide grep for `MutationObserver` in shipped code returns only those two sites (the other hits are the test's stub class and prose).
- **Confidence**: high
- **Why it matters here**: "every observer the tool owns excludes the host subtree" has exactly one call site to change, and its config is the one that sees everything under `documentElement`. The exclusion is only meaningful in the window between `document_start` and first detection — after detection this observer is gone.

## Finding: A full-document element walk already runs in the page world on every recorded cycle

- **Claim**: `serializeGraph` augments every cycle record by calling `enumerateComponentNodes`, which runs `document.querySelectorAll("*")` and calls Angular's component getter on every element, discarding classes it has seen. This runs once per check in a cycle, i.e. per component that updated.
- **Source**: `extension/agent-main.js:552-583` (walk `:560`, per-element `getComponent` `:565`, dedupe `:557,568-569`), called from `serializeGraph` at `:622`, which runs inside `serializeCheck` (`:695`) for each check in `closeCycle` (`:680-683`).
- **Confidence**: high
- **Why it matters here**: an overlay node becomes one more element in that walk, and the walk is the precedent for whatever per-element hit-testing the picker adds. It also means "the overlay adds no change-detection work" is a claim about cycles, while a per-cycle, per-component document scan already exists and is invisible to the panel.

## Finding: The panel names a component by its host tag name lowercased, and that is what a picker has to emit

- **Claim**: `componentNameFor` returns `getHostElement(instance).tagName.toLowerCase()` and falls back to the instance's constructor name lowercased; `className` is kept separately as the constructor name; `enumerateComponentNodes` labels the same way. The only element-to-instance resolution in shipped code goes through `ng.getOwningComponent` on a fixed element chain, and `__ngContext__` appears in no code at all.
- **Source**: `extension/agent-main.js:507-517` (tag name `:512`, constructor fallback `:515`), `:519-525` (`classNameFor`), `:572-580` (`label` and `component` from `tagName`), `:554` (getComponent/ɵgetComponent/getOwningComponent feature detection), `:909-917` (`getOwningComponent` over the fixed chain); the consumer that matches on `componentName` is `apps/angular-ai-devtools/src/app/n1-update-cause.component.ts:106-123`.
- **Confidence**: high
- **Why it matters here**: a picked element must resolve to the same identifier the panel already lists, or the selection lands nowhere. The route named by the programme (`__ngContext__`) is not the one the code uses (`getOwningComponent`), and an element that belongs to no component has no name in this vocabulary at all.

## Finding: `component-picker` is already the `data-testid` of three different panel selects

- **Claim**: three routes render `<select data-testid="component-picker">`, each fed by a different source, so the identifier an in-page picker would want is taken and a check that drives it hits whichever route happens to be loaded.
- **Source**: `apps/angular-ai-devtools/src/app/n1-update-cause.component.ts:18`, `apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts:17`, `apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:15`.
- **Confidence**: high
- **Why it matters here**: "the picker needs a panel-visible state for what it cannot see" is a success criterion, and the panel's existing picker vocabulary is a `<select>` in three routes. The new state needs its own name, or a driver cannot tell a hover from a chosen value.

## Finding: No check asserts anything about the DOM the extension puts in a page, though the harness can already read it

- **Claim**: all eight `verify-ai-browsers` claims are about panel text, verdicts and instance state; none evaluates the inspected page for tool-owned nodes. The capability exists: the panel driver polls the inspected page's `[ng-version]`, its `readyState` and dispatches `console.error` into it, and `control-ai-browsers run <name> <file.js>` executes `async page => {}` against a fresh tab.
- **Source**: `.commandcode/skills/control-ai-browsers/scripts/panel.mjs:181` (page `evaluate` of `[ng-version]`), `:255` (page `readyState`), `:257`/`:278` (page `console.error`); `.commandcode/skills/control-ai-browsers/SKILL.md:272` (`run <name> <file.js>`); `.commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:75-95` (the whole check is `panel.json` fields plus `instanceState`).
- **Confidence**: high
- **Why it matters here**: "exactly one host", "attached once across a re-injection" and "no observer sees the host" are assertions nothing in the shipped check set can make today. The gap is a check to write, not a tool to build — and the same page handle is where a rect-tracking claim would have to be measured.

## Finding: The inspected fixture is a separate Angular application served by `ng serve`, and the extension is loaded from the primary checkout

- **Claim**: `spikes/ng222-app` is its own npm project (Angular `^22.2.0`, `@angular/cli ^22.2.2`, its own lockfile) that also installs the workspace companion package by path; it is served by `ng serve` from the fixture folder on a derived port (4222 in the main checkout, `4300 + slot` in a worktree), its index holds a single `<app-root>`, and its own routes are `/stale-view` and `/stale-view-deferred`. The browser fixture loads the extension by an absolute path into the primary checkout.
- **Source**: `spikes/ng222-app/package.json` (dependencies incl. `"ai-devtools-companion": "file:../../packages/ai-devtools-companion"`), `spikes/ng222-app/src/index.html:11`, `spikes/ng222-app/src/app/app.routes.ts:7-10`, `spikes/ng222-app/src/main.ts`; `.commandcode/skills/control-angular-dev-app/SKILL.md:25` (counter flow), `:38` (derived port), `:65` (`ng serve`); `extension-config.json:4` (`--load-extension=D:/projects/sandbox/angular-ai-devtools/extension`).
- **Confidence**: high
- **Why it matters here**: a page-side proof runs against the fixture's own dependency tree, not the workspace's Angular, and each "attached once per page load" proof needs a fresh load of that fixture. A run started from a worktree or sidecar exercises the primary checkout's extension, so an overlay change is only observable after the primary checkout is used.

## Finding: `extension/*.js` is unbundled, untypechecked and tested only by the `node:test` file beside it

- **Claim**: no target builds, copies, bundles or converts the extension's own scripts; they are hand-written IIFEs loaded as they sit. `npm test` runs the four `extension/*.test.mjs` files under `node --test`, and `npm run check`'s four stages cover the root, both skill trees, the panel and the companion package — never `extension/`.
- **Source**: `package.json:7-10` (the check chain), `:11` (the `node --test` globs); `extension/manifest.json:18-30` (files loaded by name); `extension/agent-main.js:8` (the IIFE); `apps/angular-ai-devtools/project.json:52-92` (`build-extension` writes only `extension/panel`).
- **Confidence**: high
- **Why it matters here**: a new page-side module costs no build wiring at all, and gets no type checking either. Its correctness rests entirely on a `node:test` file that mocks the DOM by hand, as both `relay.test.mjs:34-46` and `agent-main.test.mjs:33-49` do, and neither mock can prove anything about real layout or shadow encapsulation.

## Finding: The only size pin is on the panel bundle, so page-world bytes are free and panel-side picker state is not

- **Claim**: the budget pin holds the panel's initial total to a 535.44 kB baseline with a 520 kb warning and a 1 mb error, measured from the eager references in `extension/panel/index.html`; a page-world script is outside that measurement entirely, while any panel UI for the picker is inside it. A build of the panel also rewrites the tracked `extension/error-digest.json` through `dependsOn`.
- **Source**: `scripts/panel-bundle-budget.test.mjs:55` (`520kb`/`1mb`), `:65` (`PRE_MILESTONE_INITIAL_KB = 535.44`), `:181-203` (`measureInitialTotal`), `:226-258` (the policy and the baseline comparison); `apps/angular-ai-devtools/project.json:53-56` (`dependsOn: ["generate-error-digest"]`), `:61-64` (output path), `:93-98` (the target) with `scripts/generate-error-digest.mjs:52` (`fs.writeFileSync(outPath, ...)`, default `extension/error-digest.json` at `:31`).
- **Confidence**: high
- **Why it matters here**: "roughly 400 lines" costs nothing against the budget on the page side and something on the panel side, so the milestone's size story depends on which side of that line each piece lands on. And any browser proof starts with a build that dirties the worktree.

## Finding: The extension is not loadable as checked out, so every browser proof is taken against a build

- **Claim**: `extension/panel/index.html` is tracked while everything else in that directory is git-ignored, and it references seven eager files (five `modulepreload` chunks, `styles.css`, `main.js`) that a fresh checkout does not hold.
- **Source**: `extension/panel/index.html:9,12`; `.gitignore:32-35` (`extension/panel/*` with the two negations); `git ls-files extension/panel` -> `index.html` and `favicon.ico` only; in this sidecar `extension/panel` holds exactly those two files (`index.html` 696 B).
- **Confidence**: high
- **Why it matters here**: a sidecar cannot produce browser evidence for anything panel-side without installing and building; the overlay's own script, by contrast, needs no build to be loaded by a browser. That asymmetry decides where each half of this milestone can be proven.

## Apparent intent

<!-- Inference, clearly flagged — what the project seems to be becoming. -->

- The tool is being built so that every wire boundary answers in words rather than in emptiness — five page-read kinds with two named failures, four named companion states, a three-valued replay outcome — and the overlay will be expected to report "cannot tell" for what it cannot see instead of drawing nothing — based on `page-reads.ts:61-100`, `extension/agent-main.js:176-179`, `extension-message.service.ts:63-67`.
- The page realm is accounted for like a hostile budget: one global, no DOM writes, no observer, no storage, each enforced by source-text assertions rather than by review — based on `extension/agent-main.test.mjs:989-1018` and the AR-3/AR-4 notes at `apps/angular-ai-devtools/src/app/tool-registry/role-name.ts:73-79`. The overlay is the first deliberate withdrawal from that ledger, so the ledger is expected to grow a second entry rather than disappear.
- The panel stays the product and the page becomes a cursor: every control the programme describes (hover, lock, cancel, confirm) is a panel control, and the page is given geometry only — based on `plans/angular-ai-devtools-program-backlog.md:32-36` (AR-2, AR-3, AR-6) and the absence of any page-side input in the shipped code.
- Verification is a deliverable in its own right, and a claim without a check that can fail is treated as unproven — based on `scripts/panel-bundle-budget.test.mjs`, `scripts/registry-reach.test.mjs`, and the eight `verify-ai-browsers/checks/*.mjs` claims. The overlay's claims currently have no such check.
- The in-page surface is written once and copy-pasted from nowhere: there is no shadow-DOM precedent, no geometry precedent and no hit-testing precedent in the tree, so the milestone is starting a new code style beside an existing one rather than extending it — based on the absence of `attachShadow`, `adoptedStyleSheets`, `delegatesFocus`, `elementFromPoint` and `getBoundingClientRect` in all shipped code.

## Open questions for define

- Does the pre-existing marker node in `relay.js` stay, move into the overlay's shadow root, or disappear — and is changing it an authorised behaviour change to a shipped feature with its own unit test?
- Does the overlay arrive as a third content-script declaration at `document_start`, or does `relay.js` itself move to `document_start` (which also moves the marker insertion, the `[ng-version]` probe and the observer's live window)?
- Is `agent-main.test.mjs`'s forbidden-token scan extended to the new page-side file, or is the new file shipped with no blast-radius pin — and if the DOM moves out of `agent-main.js`, what still enforces AR-3 for that file?
- Which message carries picker state, given there is no panel-to-page transport: a new relay-forwarded event (needing a background branch and a relay forwarder), or a page-side poll of a value the panel publishes? And is the dead `queryDi`/`di-query` path wired by the same channel or left dead for good?
- What does a pick report — the `componentName` string the panel already lists (host tag name lowercased), a `className`, or both — and how is a picked element that belongs to no component reported, given the vocabulary has no name for it?
- Are page-side bytes formally exempt from the 520 kB panel budget, and which number does the milestone record when the panel grows a picker surface?
- Does the proof of "one host per load" and "no observer sees the host" run against the served fixture in the primary checkout (requiring `build-extension` and a shared instance), or is a `node:test` sandbox proof accepted for a claim about real layout?

## Blocked areas

- `npm run check`, `npm test` and every Nx target — the sidecar holds the base revision but no `node_modules` (`Test-Path node_modules` -> False), and `scripts/ensure-sidecar-deps.mjs` / `scripts/sidecar-deps-bridge.mjs` would install or junction dependencies, which the brief forbids. All 30 Angular specs, the skill type-checks and the root `tsc` stage are `unverifiable` here.
- `build-extension` — it writes into the git-ignored `extension/panel` and rewrites the tracked `extension/error-digest.json`, so running it mutates the checkout rather than reading it.
- The measured panel initial total at this head — no build output exists in the sidecar, so the 535.44 kB baseline is quoted from the pin rather than re-measured; `measureInitialTotal` would answer `absent` here.
- Browser and e2e runs (`playwright.config.mts` -> `tests/browser`, `e2e/provenance.spec.ts`, `apps/angular-ai-devtools-e2e`) — they need a dev server, a shared browser instance and a built extension; not run.
- The on-device model probes in `tests/held-out/chrome-*-panel.test.mjs` and `edge-phi4mini-panel.test.mjs` — they need a shared instance with a downloaded model; not run.
- `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (123,724 B) — its behaviour is taken from the SKILL.md command table and from `panel.mjs`, not from reading the whole file, so what `run` can evaluate and what it refuses is known only at the level of its documented contract.
- The portal-based fixture path and `control-pangular-inspector` — outside this repository, not inspected.
