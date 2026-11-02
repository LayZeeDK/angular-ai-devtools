# Evidence -- codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-02
Base revision: 44e4f9b5aa5d0ce6223fbc0a8b5b7e763fd756ca (`git -C <root> rev-parse HEAD` matches it; `git status --short` shows only `.project/ROADMAP.md` and `.project/STATE.md` modified)

Checks run (read-only, in the verify sidecar at that revision; the sidecar has no `node_modules`):

- `node --experimental-strip-types --test extension/agent-main.test.mjs` -> 21/21 pass, 8 suites
- `node --experimental-strip-types --test tests/held-out/stale-view-version-gate.test.mjs` -> 2/2 pass
- `node --experimental-strip-types --test tests/held-out/stale-view-{dedup,fact-list-escaping,fixture-graph,ordering,write-regex,worker-supersession}.test.mjs` -> 13/13 pass
- `node --experimental-strip-types --test scripts/registry-reach.test.mjs scripts/registry-envelope-pin.test.mjs scripts/panel-bundle-budget.test.mjs` -> 8/8 pass (envelope sha256 `20859b88...0407e` equals the pin; measured initial total 535,440 B)
- `node --experimental-strip-types --test scripts/error-digest-wiring.test.mjs scripts/error-explainer-panel.test.mjs` -> 4/4 pass
- `npm run check`, `npm test`, `npx nx run angular-ai-devtools:test` -> `unverifiable` (sidecar has no `node_modules`; `scripts/ensure-sidecar-deps.mjs` / `sidecar-deps-bridge.mjs` would install or junction dependencies, which the brief forbids)

## Map

- **Stack**: TypeScript 6.0.3 (pinned, `package.json` devDependencies); Angular ~22.1.0 across `@angular/core|common|compiler|forms|platform-browser|router`, with `@angular/build`, `@angular/cli`, `@angular/compiler-cli`, `@angular/language-service` at ~22.1.0; rxjs ~7.8; Nx 23.3.0 with `@nx/angular` ^23.3.0, `@nx/js`, `@nx/web`, `@nx/playwright` 23.3.0; unit tests via the `@angular/build:unit-test` executor with `vitest` ^4.0.8 declared; Playwright ^1.37 for browser specs; `jsdom` ^27.1.0. Shell reports Node v24.22.0. Root package is private, `"type": "module"`, name `angular-ai-devtools-workspace`. The shipped extension is MV3: `extension/manifest.json` `"version": "0.3.0"`, permissions `scripting|activeTab|storage`, `host_permissions: ["<all_urls>"]`.

- **Entry points** (from build targets and source entries, not from a `scripts` block):
  - Panel app: `apps/angular-ai-devtools/src/main.ts` -> `app.ts` (template is only `<router-outlet>`) -> `app.routes.ts:10-17`, six routes: `''`=N1UpdateCause, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop`.
  - `apps/angular-ai-devtools/project.json` targets: `build` (`@angular/build:application` -> `dist/apps/angular-ai-devtools`), `build-extension` (same executor -> `extension/panel`, `baseHref "/panel/"`, `outputHashing "none"`, `dependsOn ["generate-error-digest"]`), `generate-error-digest` (`node scripts/generate-error-digest.mjs`), `serve`, `serve-static` (`@nx/web:file-server`, port 4200), `test` (`@angular/build:unit-test`, include `**/*.spec.ts`, exclude `**/*.node.test.ts`).
  - Web-worker entry: `apps/angular-ai-devtools/src/worker-read.worker.ts` (14,647 B).
  - Extension: `manifest.json` `background.service_worker: background.js` (type module); content scripts `relay.js` (ISOLATED, `document_idle`) and `agent-main.js` (`world: "MAIN"`), both on `<all_urls>`; `devtools_page: devtools.html` -> `devtools.js:2-4` creates a panel named "Angular AI" that loads `panel/index.html`, i.e. the `build-extension` output.
  - Page realm: `extension/agent-main.js` (27,138 B) is the profiler subscriber; it probes `setProfiler` under both the public and the compiler-private name, captures the signal graph, and dispatches `angular-ai:state|record|di-graph|error-capture` custom events (`agent-main.js:13` `STATE_EVENT`).
  - `nx.json` has no `projects` map (inferred projects) and one plugin, `@nx/playwright` with `targetName: e2e`.

- **Architecture**: three realms. (1) MAIN world: `extension/agent-main.js` subscribes to the Angular profiler and answers reads by dispatching custom events. (2) ISOLATED world: `extension/relay.js` forwards those events to `chrome.runtime.sendMessage`, and `background.js` relays each tab's messages to every panel. (3) The Angular panel: `ExtensionMessageService` (`apps/.../extension-message.service.ts`) is the single `chrome.runtime.onMessage` funnel and fans messages into signals (`notSupported`, `notSupportedReason`, `features`, `zoneMode`, `stateReceived`, `capturedErrors`) plus `UpdateCauseService`. Route components render from those signals and from pure modules held beside them (provenance, DI paths, anti-patterns, error digest, context budget, job handles). Since M018 a tool-registry envelope declares tools in `tool-registry/*.ts`; since M019 a worker read path and job layer exist but are not imported by any component (see findings).
- **Conventions** (binding on the planner):
  - One behaviour per module, exported as a pure function plus its types; components hold no logic worth testing (`n1-update-cause.service.ts` is 1,188 B, `di-doctor.service.ts` 1,254 B).
  - Tests live beside the unit: `*.spec.ts` for anything the panel bundles (25 files under `apps/`), `*.test.mjs` (node:test) beside every plain-JS script in `scripts/` (24 files) and `extension/` (5 files). `*.node.test.ts` is deliberately outside the Angular test target and needs `--experimental-strip-types`.
  - Errors are named outcomes, never exceptions: `ToolOutcome` carries `{kind:'error', code, toolId, message}`; `PageResponse` carries `{status:'error', code, message}`; the reasons are long English sentences that name the source of the fact. "cannot tell" and "unsupported" are distinct states by rule.
  - Identifiers: tool ids are snake_case (`find_components`, `app_facts`, `error_digest_lookup`), except where they mirror an Angular API name (`getComponent`, `getDirectiveMetadata`). Constants are SCREAMING_SNAKE with a unit in the name (`CHUNK_TOKEN_CAP`, `RESULT_PAGE_ARRAY_ITEM_CAP`).
  - Commits are `type: subject` with task ids in the subject: `T008: ...`, `build: record T008 landing`, `plan: build plan approved`, `ship: M019 ...`, `integrate: M019 ...`. One landing per task plus a `build: record ...` commit.
  - Every non-obvious file opens with a doc comment that states what it refuses to do; that comment is treated as a specification by the tests.
- **Maturity**: what runs today is the panel shell plus six explainers, the extension's detection/profiler path, and a large pure-module layer. Test shape is 25 Angular specs + 24 script tests + 21 held-out tests + 1 browser spec in each of two harnesses. Six checks were run here and all pass (header). Scaffolding/not-yet-reachable: the tool registry, the M019 job/worker/ring-buffer layer, and the two extra e2e harnesses (findings F1, F9, F14).
- **Recent activity**: the last 30 commits touch `.project/` in 76 files, `apps/` in 18, and one file each in `plans/`, `scripts/`, `research/`, `.commandcode/`. All 8 newest commits are dated 2026-11-02 and belong to M019 ("context-and-jobs": ring buffer, worker read, job handles, summarizer, chunking, bundle-budget pin) plus the `ship:`/`integrate:` pair. M018 immediately before it was the tool-registry envelope. Work is landing in `apps/angular-ai-devtools/src/app/` and in `.project/` bookkeeping, not in `extension/`, `scripts/` or `spikes/`.

## Finding: The tool registry is complete and has no production consumer

- **Claim**: eight tools are declared and provided through `app.config.ts`, yet no non-spec file injects `TOOL_REGISTRY`, reads `registry.tools()` or calls `execute`. There is also no code anywhere that filters declarations on `publish === 'model'`, although `publish` exists precisely for "the model loop filters on `'model'`".
- **Source**: `grep 'TOOL_REGISTRY|\.tools\(\)|publish === .model.'` over `apps/**/*.ts` -> `tool-registry.ts:181` (token), `tool-registry.ts:209` (factory), `app.config.ts:14`, and 10 spec files; no component or service. `apps/angular-ai-devtools/src/app/app.config.ts:10-19` provides the registry plus four tool groups.
- **Confidence**: high.
- **Why it matters here**: any plan that says "add the group to the chat's tool list" is assuming a consumer that does not exist. M020's group filter has no call site to live in yet.

## Finding: `app_facts` is registered but its page channel is never filled in production

- **Claim**: the tool can only answer from `ToolContext.facts`; nothing in production constructs a `ToolContext`, so on every real call `readAppFacts` returns `{kind:'error', code:'host-unavailable'}`.
- **Source**: `tool-registry/app-facts.ts:133` (`appFactsSnapshot`), `:267-276` (`readAppFacts` -> `host-unavailable`), `:306` (declaration), `:320` (`provideAppFactsTool`). `grep 'facts:'` over `apps/**/*.ts` returns only `app-facts.spec.ts:38,111,180` plus unrelated `facts: string[]` locals (`di-explain.ts:11`, `signal-provenance.service.ts:81`, `context-budget.ts:110`).
- **Confidence**: high.
- **Why it matters here**: the module's own docstring (`app-facts.ts:260-265`) says the caller "builds [the facts] from the `angular-ai:state` payload that `ExtensionMessageService` now keeps in its `features` and `zoneMode` signals". The signals exist; the adapter does not. That adapter is the first thing M020 needs and it is missing from every file list.

## Finding: The page's feature bits reach the panel and then stop

- **Claim**: `ExtensionMessageService` stores `features`, `zoneMode` and `stateReceived` (`extension-message.service.ts:37-39`, written at `:68-72`), but no component or service reads `features()` or `zoneMode()`; only `notSupported()`/`notSupportedReason()`/`stateReceived()` are rendered.
- **Source**: `grep 'ext\.(features|zoneMode|notSupported|stateReceived)'` over `apps/**/*.ts` -> every `features()`/`zoneMode()` hit is in `extension-message.service.spec.ts:81,82,95,96`; `notSupported` hits are `interop.component.ts:11`, `stale-view.component.ts:12`, `n2-signal-provenance.component.ts:12`, `n1-update-cause.component.ts:13,53`.
- **Confidence**: high.
- **Why it matters here**: the data a context chip would display is already on the panel side of the wire. The missing half is display and grouping, not detection.

## Finding: There is no tool-group concept, only per-tool axes

- **Claim**: a `ToolDeclaration` carries exactly `id`, `title`, `kind`, `host[]`, `outcome`, `publish`, `input` (`tool-registry.ts:74-84`); there is no `group`, no tags, no grouping helper and no filter function. `grep -i 'group'` over `apps/**/*.ts` returns 0 matches. The only axes a group could be derived from are `ToolKind` (`:41`), `ToolHost` (`:44`) and `ToolPublish` (`:50`).
- **Source**: `tool-registry.ts:41,44,50,74-84`; grep for `group|Group` in `apps/angular-ai-devtools/src/app` -> "No matches found".
- **Confidence**: high.
- **Why it matters here**: "tool groups keyed to a version gate" is net-new vocabulary. It also collides with the envelope pin (next finding): a `group` field on the declaration is an edit to a byte-pinned file.

## Finding: There is no context chip and no panel surface that could stand in for one

- **Claim**: no tracked source file contains the identifier or class `chip`; the six route components render facts lists, cause chains, DI paths, digest entries, worker output and an "unsupported: <reason>" banner, and nothing renders the feature map or the change-detection mode.
- **Source**: `grep -i 'chip'` over the tracked tree -> 14 hits, all in `.project/ROADMAP.md`, `.project/CHARTER.md`, `.project/research/DOCS-AUDIT.md`, `.project/archive/018-instrument-core|019-context-and-jobs/research/DOCS-AUDIT.md`, `plans/angular-ai-devtools-program-backlog.md`, `docs/feature-proposals.md`, `docs/design/tutor.md`, `docs/afk-run-2026-10-12.md`, `research/03-prior-art.md`, `research/08-recent-angular-features.md`, `research/14-ai-devtools-prior-art.md`, and `.claude|.commandcode/skills/control-angular-dev-app/features/portal-contracts.md`. Zero hits under `apps/`, `src/`, `extension/`. Routes: `app.routes.ts:10-17`.
- **Confidence**: high.
- **Why it matters here**: M020 starts from zero UI. There is no header component, no shared status strip, and `app.ts` is a bare `<router-outlet>`, so a chip needs a home chosen, not extended.

## Finding: Version gating exists twice, in two languages, with incompatible semantics, and never reaches the panel

- **Claim**: (a) the page hard-blocks Angular < 22.1.3 by hand-rolled comparison and announces `supported:false`; (b) the panel-side pure module has a second gate that treats an unparseable version as *supported*; (c) the `angular-ai:state` payload carries no version, and `AppFactsSnapshot` has no version field; (d) the version that does arrive (`angular-detected`) is written only into the cause log, with no signal.
- **Source**: `extension/agent-main.js:136-144` (`versionOlderThan`), `:149-152` (`versionOlderThan(detectedVersion, 22, 1, 3)` -> `announceState(false, ...)`); `src/main-world/stale-view-scan.ts:60-72` (`angularVersionGate`, `:65` returns `supported: true, version: v` for unknown) with aliases at `:75-79`; `agent-main.js:117-124` (`announceState` payload = `supported, reason, zoneMode, features`); `tool-registry/app-facts.ts:71-75` (`AppFactsSnapshot` fields); `extension-message.service.ts:58-59` (`angular-detected` -> `causeService.record("Angular", "vX detected")`).
- **Confidence**: high.
- **Why it matters here**: the milestone wants groups gated on version and a chip naming features. There is no panel-visible version, and the two existing gates disagree on the unknown case, so the plan must say which gate it means and where the version comes from.

## Finding: The panel is over its own 520 kB budget and the overshoot is pinned byte-exactly

- **Claim**: the shipped panel measures 535.44 kB against the `build-extension` warning at 520 kB, and a test asserts the measured eager total "does not exceed the 535.44 kB baseline" - one added byte fails it.
- **Source**: `node --experimental-strip-types --test scripts/panel-bundle-budget.test.mjs` -> pass, printed measured total 535,440 B; `scripts/panel-bundle-budget.test.mjs:5` (the panel "measures 535.44 kB"), `:31-32` ("535,440 - 535.44 kB ... a single added byte fails here"), `:65` (`PRE_MILESTONE_INITIAL_KB = 535.44`); budget itself at `apps/angular-ai-devtools/project.json` `build-extension` -> `maximumWarning: "520kb"`.
- **Confidence**: high.
- **Why it matters here**: a chip and a group filter are new bytes with a zero-byte margin. The plan must budget them before designing them, and `lazy` loading competes with the "initial total" definition the test enforces.

## Finding: The registry envelope is SHA-256 pinned, so "add a tool" and "extend a tool declaration" have different costs

- **Claim**: `scripts/registry-envelope-pin.test.mjs` pins `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` at sha256 `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e` and fails on any byte change; the failure message explicitly says the fix is not "update the constant".
- **Source**: run output above (expected == actual); `scripts/registry-envelope-pin.test.mjs:48-56` (`PINNED_ENVELOPE_SHA256`), `:93-99` (failure text).
- **Confidence**: high.
- **Why it matters here**: adding a `group` field to `ToolDeclaration` is a deliberate re-pin of a file whose immutability is itself an acceptance criterion. Grouping as a separate projection module over existing declarations is the cheap path; grouping inside the envelope is a milestone-level decision.

## Finding: M019's jobs, worker and ring buffer are unreachable from the panel

- **Claim**: `message-ring-buffer.ts`, `worker-read.service.ts`, `jobs/job-handles.ts`, `jobs/chunked-fact-list-job.ts`, `jobs/summarize-job.ts` and `context-budget.ts` have no importer outside their own specs and each other; `src/worker-read.worker.ts` is referenced only from `worker-read.service.spec.ts`.
- **Source**: `grep 'chunked-fact-list-job|summarize-job|job-handles|worker-read.service|message-ring-buffer'` over `apps/**/*.ts` -> `.spec.ts` hits plus `summarize-job.ts:40` and `chunked-fact-list-job.ts:32,34` importing `job-handles` and `context-budget`. No component, no service outside the layer.
- **Confidence**: high.
- **Why it matters here**: "the chat already chunks its facts and runs jobs" is false at the call-site level. A chip that advertises a summariser or a chunked read would describe library code the panel never invokes.

## Finding: The extension carries a second, hand-written panel that nothing opens

- **Claim**: `extension/panel.html` + `extension/panel.js` implement a one-line status page listening for `angular-detected`, and no tracked file references `panel.html`; `devtools.js` opens `panel/index.html`.
- **Source**: `extension/devtools.js:2-4`; `extension/panel.html`; `extension/panel.js`; `grep 'panel\.html'` over tracked files -> no reference besides the file itself.
- **Confidence**: high.
- **Why it matters here**: two artifacts answer to the name "panel". A verification step that loads `panel.html` would be testing dead code, and the extensible one only exists after a build.

## Finding: `extension/panel/index.html` is committed while every script it loads is gitignored

- **Claim**: `.gitignore` ignores `extension/panel/*` except `index.html` and `favicon.ico`, so the tracked `index.html` references `chunk-DweK769i.js`, `chunk-DkSKihzw.js`, `chunk-C9Uts9mc.js` and `main.js`, none of which exist in a fresh checkout.
- **Source**: `.gitignore` ("# Extension panel build output (generated by Angular build)" plus the two negations); `git ls-files extension/panel/*` -> exactly `extension/panel/favicon.ico`, `extension/panel/index.html`; on disk the directory holds 7 JS files, the largest 326,974 B.
- **Confidence**: high.
- **Why it matters here**: the extension is not loadable as shipped; `nx run angular-ai-devtools:build-extension` must run first, and that build is exactly what the byte-pinned budget measures. Any browser verification of the chip depends on a build, not on a source edit.

## Finding: The content-script relay injects a visible badge into every inspected page

- **Claim**: `relay.js` appends a fixed-position green `<div id="angular-ai-devtools-marker">` reading "Angular <version> detected" to `document.body` on every page matched by `<all_urls>`.
- **Source**: `extension/relay.js:31-38` (`marker.style.cssText = 'position:fixed;top:0;right:0;background:#4caf50;...;z-index:999999;'`, `document.body.appendChild(marker)`), triggered from `checkAngular()` at `:27-41`.
- **Confidence**: high.
- **Why it matters here**: the tool mutates the page it inspects, at a fixed screen position. Screenshot-based or DOM-snapshot verification of any fixture carries a tool-owned element, and a chip that renders in the panel should not be confused with this badge.

## Finding: The repository has no CI configuration at all

- **Claim**: nothing runs the checks at a boundary; there is no workflow file for any provider.
- **Source**: `git -C <root> ls-files` piped to `Select-String '\.github|\.gitlab|azure-pipelines|Jenkinsfile|\.circleci'` -> no output; recursive `*.yml`/`*.yaml` search over the worktree -> only `.playwright-cli/page-*.yml` (hundreds of Playwright CLI page snapshots, gitignored) and `tmp/control-angular-dev-app/**`, `tmp/control-vitest-browser-angular/**` fixtures. `git ls-files` totals 1,211 files with no CI directory among them.
- **Confidence**: high.
- **Why it matters here**: "the gates hold" means "the gates held on this machine at this commit". The acceptance story for M020 rests on local runs plus the held-out suite, and the sidecar cannot even run `npm run check` without dependency bridging.

## Finding: Browser e2e exists in three places and two of them are not connected

- **Claim**: root `playwright.config.mts` targets `tests/browser` with four branded channel projects and belongs to no nx target; `apps/angular-ai-devtools-e2e/project.json` declares `"targets": {}` and its config targets `./src` with chromium/firefox/webkit; a third browser spec sits in `e2e/provenance.spec.ts`, matched by neither `testDir`.
- **Source**: root `playwright.config.mts` (`testDir: 'tests/browser'`, projects `chrome-stable|chrome-beta|edge-stable|edge-dev`, `webServer` running `nx run angular-ai-devtools:serve`); `apps/angular-ai-devtools-e2e/playwright.config.mts` (`testDir: './src'`, `nxE2EPreset`); `apps/angular-ai-devtools-e2e/project.json` (`"targets": {}`, `implicitDependencies: ["angular-ai-devtools"]`); `nx.json` plugin `@nx/playwright` `targetName: "e2e"`; tracked specs `tests/browser/di-regression.spec.ts` and `e2e/provenance.spec.ts`.
- **Confidence**: high for the file facts; medium for which harness is actually executed (not runnable here).
- **Why it matters here**: "add an e2e" is ambiguous by construction, and the branded-channel harness cannot run in a headless CI-less environment while the nx-preset one can.

## Finding: `hostile-tools.ts` ships six tool declarations that only tests register

- **Claim**: six declarations cover the kind/host/outcome matrix, all `publish: 'internal'`, and they are registered by `hostile-tools.spec.ts` in its own TestBed rather than by `app.config.ts`; the file is source, not test, so any count of `src/` declarations overstates the shipped set.
- **Source**: `tool-registry/hostile-tools.ts:1-12` (the docstring states the intent), `:98,123,154,181,301` (declarations); `hostile-tools.spec.ts:86-96` (`provideTools(...entries)` / `provideToolRegistry()` in a private TestBed).
- **Confidence**: high.
- **Why it matters here**: `src/app/tool-registry/` holds 14 declarations but the panel provides 8 (`find_components`, `inspect_component`, `list_signals`, `getDirectiveMetadata`, `getComponent`, `app_facts`, `panel_environment`, `error_digest_lookup`). Group membership and gating have to be argued over the shipped 8.

## Finding: The held-out suite tests the process, not the product

- **Claim**: of 21 files under `tests/held-out/`, 10 assert milestone-process invariants (zero defects recorded, zero skipped, idempotent checks, `unverifiable` recorded, portal dependency, archive order, fixtures retained, spec present, rerun stable, clean worktree), 4 probe an on-device model through a browser, and 7 are stale-view behaviour tests.
- **Source**: `git ls-files tests/held-out/*` -> `e1-zero-defects-recorded`, `e3-zero-skipped`, `e4-idempotent-checks`, `e5-unverifiable-recorded`, `e6-portal-dependency`, `e7-archive-order`, `e8-fixtures-retained`, `e10-spec-present`, `e11-rerun-stable`, `e12-clean-worktree`; `stale-view-*` x8; `chrome-stable-nano-panel`, `chrome-beta-nano-panel`, `chrome-beta-gemma4-panel`, `edge-phi4mini-panel`. The stale-view files run here pass: `stale-view-version-gate.test.mjs` 2/2 and six others 13/13.
- **Confidence**: high.
- **Why it matters here**: these files encode the project's evidence ritual. A new test for a chip is expected to follow the `eN-<claim>.test.mjs` naming and to assert evidence, not only behaviour.

## Finding: `src/panel/` is a re-export layer, so one module has two import paths

- **Claim**: 7 of the 8 files in `src/panel/` are one-line `export * from '../../apps/angular-ai-devtools/src/app/...'` shims; only `error-explainer-view.ts` holds real code, and the panel imports it through this directory.
- **Source**: first lines of `src/panel/anti-patterns.ts`, `chain.ts`, `di-diff-display.ts`, `di-explain.ts`, `di-path-display.ts`, `extension-prompt.service.ts`, `provenance.component.ts`; `apps/angular-ai-devtools/src/app/error-explainer.component.ts:4` imports `../../../../src/panel/error-explainer-view`; `scripts/di-explain.test.mjs:3` imports `../src/panel/di-explain.ts`.
- **Confidence**: high.
- **Why it matters here**: a module at `apps/.../di-explain.ts` is also reachable as `src/panel/di-explain.ts`; edits and tests cross the two trees, and `apps/angular-ai-devtools/tsconfig.check.json:9,24` exists partly to keep both type-checked.

## Finding: The browser fixture config hardcodes a machine-absolute extension path

- **Claim**: the launch config passes `--load-extension=D:/projects/sandbox/angular-ai-devtools/extension`, an absolute path into the primary checkout.
- **Source**: `extension-config.json:2-5`.
- **Confidence**: high.
- **Why it matters here**: a browser instance started from a sidecar or worktree loads the primary checkout's extension build. Verification of an extension-side change from a sidecar would silently exercise the wrong build.

## Apparent intent

<!-- Inference, clearly flagged - what the project seems to be becoming. -->

- The project builds the *seam* before the *feature*: M018 shipped an envelope with a named error for every failure and no caller, and M019 shipped jobs and a worker with no consumer - based on `tool-registry.ts:1-32`, `app-facts.ts:1-33`, `hostile-tools.ts:1-12`, and findings F1/F9.
- It is becoming a Chrome-extension-first product whose panel is a self-inspection fixture: the panel is served at `/panel/` and speaks only over `chrome.runtime`, and `panel_environment` reports its own route base as evidence - based on `panel-environment.tool.ts:10-14`, `devtools.js`, `build-extension` `baseHref`.
- Evidence discipline is a second deliverable: budgets, envelope hashes and process invariants are pinned as executable tests, and `unverifiable` is a first-class verdict - based on `scripts/panel-bundle-budget.test.mjs:5-32`, `scripts/registry-envelope-pin.test.mjs:48-56,93-99`, `tests/held-out/e5-unverifiable-recorded.test.mjs`.
- The product surface is growing by adding explainers, one route each, not by adding chrome around them: six routes, each 1 component (2.2-7.1 kB) + 1 small service + shared pure modules - based on `app.routes.ts:10-17` and the file sizes under `apps/angular-ai-devtools/src/app/`. A context chip would be the first cross-route affordance, which is why no obvious host for it exists.
- The tool wants to be seen as honest about what it does not know: "not supported", "host unavailable", "no evidence" and "cannot tell" are separate outcomes everywhere, and the code prefers naming a restriction to guessing - based on `agent-main.js:150-166`, `app-facts.ts:15-26`, `panel-environment.tool.ts:20-23`, `.project/ROADMAP.md:810` ("naming a feature the app lacks is worse than naming none").

## Open questions for define

- Which surface is "the chat" whose group list must be filtered? `TOOL_REGISTRY` has no production consumer today (F1), so the filter has no host.
- Where does the version for a group gate come from? The page announces `supported`/`reason` but no version (F: version gating), the panel drops `angular-detected`'s version into a log, and two gates already disagree about an unknown version.
- May a group gate change `tool-registry.ts`, which is sha256-pinned and whose immutability is an acceptance criterion (F: envelope pin), or must grouping be a separate projection over unchanged declarations?
- Is the chip allowed to show a "cannot tell" state, and is that state the same as the existing `notSupported` banner or a distinct one? The page can stay silent forever (`stateReceived()` false).
- Which facts belong on the chip: only the eight `APP_FACT_FEATURES` bits, or also DI-graph, stale-view and error-digest capabilities that have no published bit today (F: feature bits stop at the panel)?
- Given a byte-exact bundle pin, does the chip ship eagerly in the initial bundle or behind a lazy route, and which of the 520 kB / 535.44 kB numbers is the real gate?

## Blocked areas

- `npm run check` and `npm test` - the verify sidecar has the base revision but no `node_modules`, and `scripts/ensure-sidecar-deps.mjs` / `scripts/sidecar-deps-bridge.mjs` would install or junction dependencies, which the brief forbids. Every Angular/vitest spec (25 files under `apps/`) and the skills type-checks are therefore `unverifiable` at this revision; only the plain-Node suites listed in the header were run.
- `npx nx run angular-ai-devtools:test` and `build` / `build-extension` - same reasons, plus a build would rewrite `extension/panel/`, which is on disk in the primary worktree and out of bounds for this task.
- Browser e2e (`playwright.config.mts` -> `tests/browser`, `apps/angular-ai-devtools-e2e`, `e2e/provenance.spec.ts`) - needs a dev server on port 4200 and branded Chrome/Edge channels; not run.
- On-device model probes (`tests/held-out/chrome-stable-nano-panel`, `chrome-beta-nano-panel`, `chrome-beta-gemma4-panel`, `edge-phi4mini-panel`) - need a shared browser instance and a downloaded model; not run.
- Remaining `scripts/*.test.mjs` (19 of 24 files) - several spawn `npm`/`npx` or a dev server, so they are not read-only in effect; not run.
- `.commandcode/skills/` and `.claude/skills/` internals (152 + 110 tracked files) - enumerated by directory (`control-*`, `verify-*`, `link-workspace-packages`, 9 `nx-*` skills) and by `scripts/skills-mirror.test.mjs`'s existence, but their SKILL.md bodies were not read; the brief's focus is the panel code, and a mirror test already enforces byte-equality between the two trees.
- `.project/archive/**` - excluded by the brief. `.project/ROADMAP.md:780-816` was read only to confirm the milestone's stated scope (feature fingerprint, version-gated tool groups, context chip), not as evidence about the code.
- Panel bundle measurement - the 535,440 B figure is quoted from `scripts/panel-bundle-budget.test.mjs`'s passing run over the on-disk build output, not from a build performed here; in the sidecar the JS chunks are absent (they are gitignored, only `index.html` and `favicon.ico` are tracked).
