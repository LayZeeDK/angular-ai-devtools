# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Scanned: 2026-11-02
Base revision: `334ff8e50037c764e093894a0c1a972883e91a75` (the brief's verify sidecar; `git rev-parse HEAD` matches it and `git status --short` is empty)
Checks run: none. The brief forbids builds, tests and installs, so everything below is read from source at that revision. The only commands executed were read-only: `git rev-parse|log|ls-files|grep`, `node -e` (to sha256 `tool-registry.ts` and to print line anchors), `node -v` -> v24.22.0, and file reads. `npm run check`, `npm test`, `npx nx run angular-ai-devtools:test|build|build-extension` are `unverifiable` here: the sidecar has no `node_modules`, and `scripts/ensure-sidecar-deps.mjs` would install or junction dependencies.

## Map

- **Stack**: TypeScript 6.0.3 pinned (`package.json:32`); Angular `~22.1.0` declared for `@angular/core|common|compiler|forms|platform-browser|router` with `@angular/build|cli|compiler-cli|language-service` at `~22.1.0` (`package.json:15-20,35-44`), resolved to `@angular/core` 22.1.8 in the lock (`package-lock.json:1690`); rxjs `~7.8.0`; Nx 23.3.0 with `@nx/angular`, `@nx/js`, `@nx/web`, `@nx/playwright`, `@nx/devkit` (`package.json:21-25`); unit tests through `@angular/build:unit-test` with `vitest ^4.0.8` declared; `@playwright/test ^1.37`; `jsdom ^27.1.0`. Root package is `private: true`, `"type": "module"`, named `angular-ai-devtools-workspace` (`package.json:2-4`). The shipped extension is MV3, `manifest.json` `"version": "0.3.0"`, permissions `scripting|activeTab|storage`, `host_permissions: ["<all_urls>"]`.

- **Entry points** (taken from build targets and source entries, not from a `scripts` block):
  - Panel app: `apps/angular-ai-devtools/src/main.ts` -> `app.ts` (template is only `<router-outlet>`, `app.html:1`) -> `app.routes.ts:8-16`, seven routes: `''`=N1UpdateCause, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view` (all eager), plus two lazy ones — `interop` (`app.routes.ts:14`) and `chat` (`:15`).
  - `apps/angular-ai-devtools/project.json` targets: `build` (`@angular/build:application` at `:10` into `dist/apps/angular-ai-devtools` at `:16`, budgets 500kb/1mb at `:31-44`); `build-extension` (`:52-92` — same executor at `:53`, `dependsOn ["generate-error-digest"]` at `:54-56`, outputPath base `extension/panel` at `:61-64`, assets from `public/` at `:67-72`, `baseHref "/panel/"` at `:76`, `outputHashing "none"` at `:77`, budget 520kb/1mb at `:79-88`); `generate-error-digest` (`node scripts/generate-error-digest.mjs`, `:93-99`); `serve`; `serve-static` (`@nx/web:file-server`, port 4200, `:127`); `test` (`@angular/build:unit-test` at `:114`, include `**/*.spec.ts`, exclude `**/*.node.test.ts`, `:113-121`).
  - Web-worker entry: `apps/angular-ai-devtools/src/worker-read.worker.ts` (14,647 B), imported by no production module.
  - Extension: `manifest.json` `background.service_worker: background.js` (type module); content scripts `relay.js` (ISOLATED) and `agent-main.js` (`world: "MAIN"`), both on `<all_urls>` at `document_idle`; `devtools_page: devtools.html` -> `devtools.js:2-4` creates the "Angular AI" panel loading `panel/index.html`, i.e. the `build-extension` output.
  - Page realm: `extension/agent-main.js` is the profiler subscriber; it probes `ng.ɵsetProfiler` / `ng.ɵgetSignalGraph` (`:145-183`), dispatches `angular-ai:state|record|di-graph|error-capture`, exposes `globalThis.__ngRecorder` (`:629`) and listens for `angular-ai:di-query` (`:631`).
  - Root scripts that are real entry points: `npm run check` (four-stage chain, `package.json:7-9`) and `npm test` (four stages ending in the Nx unit-test target, `package.json:10-12`).

- **Architecture**: three realms plus one projection layer. (1) MAIN world: `agent-main.js` subscribes to the Angular profiler, computes the page's own app-facts record (`featuresOf`, `detectZone`), and publishes it as `angular-ai:state` (`agent-main.js:117-124`). (2) ISOLATED world: `relay.js` forwards each window event to `chrome.runtime.sendMessage`, latches the last state and version verbatim (`relay.js:7,26-31`), and answers one `angular-ai:replay-request` from that latch (`:34-37`); `background.js` relays each tab's messages to every panel context with a `tabId` stamp and routes `angular-ai:state-request` back to the named tab (`background.js:10-14,30-52`). (3) The Angular panel: `ExtensionMessageService` is the single `chrome.runtime.onMessage` funnel and fans messages into signals (`notSupported`, `features`, `zoneMode`, `stateReceived`, `appVersion`, `replayOutcome`, `capturedErrors` — `extension-message.service.ts:44-59`); `panel-context.ts`'s `buildPanelContext` turns those signals into one `PanelContext` (`:89-121`); `chat-entry.component.ts` is the only production consumer of `TOOL_REGISTRY` (`:111,157-171`) and renders the chip (`feature-fingerprint.ts`) and the permitted group list (`tool-groups.ts`). There is no panel->page request transport: `PAGE_HOST`'s default provider answers `host-unavailable` with one exported sentence (`page-reads.ts:87-111`).

- **Conventions** (binding on the planner):
  - One behaviour per module, exported as a pure function plus its types; components hold no decisions worth testing. M020's three new modules follow it — `panel-context.ts` (7,298 B), `feature-fingerprint.ts` (10,085 B), `tool-groups.ts` (15,400 B) — and each carries a doc comment its tests treat as the specification.
  - **A pure module must load under plain Node**: `tests/held-out/*.test.mjs` import panel `.ts` files directly with `node --experimental-strip-types`, so a value import (of `@angular/core`, of the pinned envelope, of another panel module) breaks the suite. The three M020 modules say so in their headers and use type-only imports to keep it true.
  - Tests live beside the unit: 29 `*.spec.ts` under `apps/` run through Vitest via Nx; 24 `scripts/*.test.mjs` and 4 `extension/*.test.mjs` run under `node --test`; 2 `*.node.test.ts` sit deliberately outside the Angular target; 23 files in `tests/held-out/` are run by hand with `node --experimental-strip-types` and are not in `npm test`.
  - Errors are named outcomes, never exceptions: `ToolOutcome` carries `{kind:'error', code, toolId, message}` (`tool-registry.ts:94-112`), `PageResponse` carries `{status:'error', code, message}` (`page-reads.ts:68-70`), `ToolDeclarationError` exposes `toolId` and `field`. "cannot tell", "unsupported", "awaiting-page", "transport-failed" and "host-unavailable" are distinct states by rule, and every refusal is a full sentence naming the source of the fact.
  - A gate must be observable: each pin proves its own bite with a fixture that fails (green and red halves in `scripts/registry-envelope-pin.test.mjs:107-179`, a temp tree in `scripts/registry-reach.test.mjs:367-465`, a synthetic output tree in `scripts/panel-bundle-budget.test.mjs`, a deliberate type error in `scripts/panel-typecheck-scope.test.mjs`), and a failure message names the file, the value and what the fix is *not*.
  - Identifiers: tool ids are snake_case (`find_components`, `app_facts`, `error_digest_lookup`) except where they mirror an Angular API name (`getComponent`, `getDirectiveMetadata`); constants are SCREAMING_SNAKE with a unit (`CHUNK_TOKEN_CAP`, `PRE_MILESTONE_INITIAL_KB`); provenance strings are `'page-published'`, `'panel'`, `'page-request'`, `'third-party'`.
  - Commits are `type: subject` with the task id in the subject (`T006: ...`, `build: record T006 landing`, `fix: ...`): one landing per task plus a `build: record ...` commit.

- **Maturity**: what runs today is the panel shell plus seven routes, the extension's detection/profiler/error-capture path, eight registered tools, and a large pure-module layer; the registry has one production consumer and `app_facts` now receives a real `facts` record. Test shape: 29 Angular specs, 24 script tests, 4 extension tests, 2 node tests, 23 held-out files (10 process invariants reading `.project/` state, 4 on-device model probes, 7 stale-view behaviour tests, 2 M020 chip/group suites), and 2 tracked browser specs plus two e2e harnesses. Scaffolding or not-yet-reachable: M019's job/worker/ring-buffer layer, `extension/panel.html`+`panel.js`, and the `angular-ai:di-query` listener (findings below). There is no CI of any kind.

- **Recent activity**: the 30 newest commits are all dated 2026-11-02 and belong to M020 (`feature-fingerprint`): T001 docs-audit repair, T002 the state/version replay, T003 a lazy route conversion, T004 `panel-context`+`feature-fingerprint`, T005 `tool-groups`, T006 the lazy chat entry with the chip, T007 the bundle measurement, T008 the replay-outcome repair, then `ship:`/`integrate:`, plus the post-ship fix at the base revision. The 30-commit file distribution is dominated by `.project/` bookkeeping (verify ledger, STATE, ROADMAP, DOCS-AUDIT, reviews), with product work concentrated in six files under `apps/angular-ai-devtools/src/app/` and two held-out suites. Nothing in `extension/`, `scripts/` or `spikes/` changed during M020.
## Finding: There is no machinery for a second, publishable package

- **Claim**: The workspace is one private package with no `workspaces` field, no `.npmrc`, no `publishConfig`, no `release` target and no `nx release` configuration, and Nx infers projects only from `project.json` files under `apps/`, so a second publishable package is net-new build, lock and check plumbing rather than an existing pattern to copy. The lockfile also names a different root package (`angular-ai-devtools`) than `package.json` does (`angular-ai-devtools-workspace`).
- **Source**: `package.json:2-4` (name, `private: true`; the file has no `workspaces` key); `nx.json:1-40` (no `projects` map, one `@nx/playwright` plugin at `:25`, generator defaults only for `@nx/angular:application`); `apps/` holds only `angular-ai-devtools` and `angular-ai-devtools-e2e`, and no `libs/` directory exists; `package-lock.json:2,7` name `angular-ai-devtools`; `git grep 'publishConfig|npm publish|\.npmrc'` over tracked files -> no match outside `.commandcode/` and `.claude/` skill prose.
- **Confidence**: high
- **Why it matters here**: any plan that says "add the package to the workspace" assumes a workspace this repository does not have. The first task is a structural decision (npm workspace vs a standalone Nx project), and the lock/name drift makes "regenerate the lock" part of it.

## Finding: The check chain and the root tsconfig are pinned to exact contents, so a new package's type-check needs an authorised re-pin

- **Claim**: `npm run check` is asserted to be exactly four stages in order and the root `tsconfig.json` is asserted to have exactly three `include` entries, two of them absolute paths outside the checkout; adding a fifth stage (or a package to the root tsconfig) fails `scripts/panel-typecheck-scope.test.mjs` before it can pass.
- **Source**: `package.json:7-9`; `scripts/panel-typecheck-scope.test.mjs:256-266` (deep-equal on the stage list), `:338` (`include.length, 3`), plus the panel config's own include/exclude pinned at `:270-300`; `tsconfig.json:5-16`; `apps/angular-ai-devtools/tsconfig.check.json:34-41`.
- **Confidence**: high
- **Why it matters here**: the type-check surface for a new package cannot be added quietly. The plan must name the re-pin the way the envelope re-pin is named, or the package ships unchecked by `npm run check`.

## Finding: Exactly one build writes into `extension/`, and it also rewrites a tracked data file

- **Claim**: `build-extension` emits the Angular panel into `extension/panel`, copying assets from `apps/angular-ai-devtools/public` only, and through `dependsOn` it runs `generate-error-digest`, which rewrites the tracked `extension/error-digest.json` in place. The extension's own scripts (`background.js`, `relay.js`, `agent-main.js`, `devtools.js`, `stale-view-worker.js`) have no target, no bundler and no copy step: they are hand-written files loaded as they sit.
- **Source**: `apps/angular-ai-devtools/project.json:52-92` (outputPath base `extension/panel` at `:62`, assets at `:66-71`, `dependsOn` at `:53-57`), `:93-98` (`generate-error-digest`); `scripts/generate-error-digest.mjs` (final statements write `outPath` with `fs.writeFileSync`); `git ls-files extension` -> 19 tracked files, 4 of them tests, none generated except `panel/index.html` and `panel/favicon.ico`.
- **Confidence**: high
- **Why it matters here**: a companion package is not something this build copies into the extension; it is something the *app* installs. "Ship the package" and "ship the extension" are two unrelated pipelines, and a plan that expects a package dist under `extension/` is wrong. A build also dirties the worktree by regenerating a tracked file.

## Finding: The tracked panel `index.html` references seven files that are git-ignored

- **Claim**: `extension/panel/index.html` is tracked while `.gitignore` ignores everything else in that directory, and at this head the file loads five `modulepreload` chunks plus `styles.css` and `main.js` — none of which exist in a fresh checkout.
- **Source**: `extension/panel/index.html:9,12`; `.gitignore:33-35`; `git ls-files extension/panel/*` -> `index.html` and `favicon.ico` only.
- **Confidence**: high
- **Why it matters here**: the extension is not loadable as checked out. Every browser verification starts with a build, and any extension-side change to how the page is observed is only visible after `build-extension`.

## Finding: The bundle pin is now a ceiling with headroom, and its own prose describes a build shape the head no longer has

- **Claim**: `PRE_MILESTONE_INITIAL_KB` is 535.44 kB and the comparison is `totalKb <= 535.44`, while the file's header still says the panel's eager set is "the five eager files ... so a single added byte fails here"; the tracked index now lists seven eager references. The head total cannot be measured without a build, so the size of the headroom is unknown.
- **Source**: `scripts/panel-bundle-budget.test.mjs:31-32` (five-files prose, "a single added byte fails here"), `:65` (`PRE_MILESTONE_INITIAL_KB = 535.44`), `:212-220` (`assertWithinBaseline`, `totalKb <= PRE_MILESTONE_INITIAL_KB`); `extension/panel/index.html:9,12`.
- **Confidence**: high
- **Why it matters here**: M020's two lazy routes moved the eager total, so "every new byte is a failure" is no longer the constraint it was at M019, and the stale prose inside the pin is a trap for a reviewer. A plan should measure before it budgets bytes.

## Finding: Nothing in the code knows about an opt-in package, a symbol table, or a negotiation with an installed package

- **Claim**: The names the design uses — `ngAiDevTools`, `provideAiDevTools`, and any "opt-in", "companion" or "symbol table" string — occur zero times under `apps/`, `src/` and `extension/`. The page's only probe is `featuresOf(ng)`, eight `typeof` checks on `ng` and nothing else, and the record it publishes carries exactly `supported`, `reason`, `zoneMode`, `features`. The documented mechanism (`globalThis.ngAiDevTools = { version, '@angular/router': { Router }, ... }`) exists only in `docs/` and one handoff note.
- **Source**: `git grep -i 'opt.?in|companion|symbol.?table|ngAiDevTools|provideAiDevTools'` over tracked files -> `.project/`, `docs/`, `plans/`, `research/`, `.commandcode/taste/` only; `extension/agent-main.js:61-82` (`featuresOf`), `:117-124` (`announceState` payload); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:45-54` (the closed eight-name `APP_FACT_FEATURES`); `docs/feature-proposals.md:227-249` (`:231` the page-global shape), `:257-264` (the pre-vetted list); `plans/angular-ai-devtools-proposals.handoff.md:80`.
- **Confidence**: high
- **Why it matters here**: M021 starts from zero on the page side. There is no detection to extend — only a record shape to extend — and that record is asserted field by field in `extension/agent-main.test.mjs:136-161,362-367`.

## Finding: The page announces once, cannot be asked again, and no request channel to the page exists at all

- **Claim**: The state record is announced only from `tryInstall`, which returns early once `installed` and whose retry interval is cleared on the first success; the relay latches that one payload and the panel's replay is one-shot per panel document, with "deliberately no retry"; and the panel-to-page direction has no transport — `PAGE_HOST`'s default provider is `UNAVAILABLE_PAGE_HOST`, so every read answers `host-unavailable`.
- **Source**: `extension/agent-main.js:145-183` (announcements at `:150,155,160,165,176`; `if (installed) return "installed"` at `:168`), `:583-591` (`start` clears the interval); `extension/relay.js:26-31,34-37`; `extension/background.js:30-52`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:78-101`; `apps/angular-ai-devtools/src/app/page-reads.ts:14-20,87-111`.
- **Confidence**: high
- **Why it matters here**: an opt-in package's marker must be on the page before `document_idle` (or a re-announce trigger must be designed), and any feature that says "ask the page for its symbol table" is asking for a transport this build does not have.

## Finding: A new key on the state payload survives the wire and dies at the panel's typed reader

- **Claim**: The relay latches the payload verbatim and the background re-emits it with a spread, so an extra key reaches the panel; but `ExtensionMessage` declares no index signature and `handleMessage` reads only `supported`, `reason`, `zoneMode` and `features`, and `buildPanelContext` writes exactly three facts keys plus an optional `features`.
- **Source**: `extension/relay.js:29`; `extension/background.js:36-45`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:7-27` (interface), `:103-131` (state branch at `:119`); `apps/angular-ai-devtools/src/app/panel-context.ts:89-121` (`facts` built at `:103`).
- **Confidence**: high
- **Why it matters here**: extending the wire is cheap and extending the panel is not. One new page fact costs three untyped pass-throughs plus a typed one, and the three readers of `PanelContext` (`feature-fingerprint.ts`, `tool-groups.ts`, `app-facts.ts`) each read a different slice of it.

## Finding: `features` is the one extensible facts key, and it is read at three different fidelities

- **Claim**: The wire keeps every boolean entry of the page's `features` map; `tool-groups.requiredFeature` reads any name out of it, so an extra bit could gate a group with no schema change; but `app_facts` truncates the map to the closed eight-name `APP_FACT_FEATURES` tuple, and the chip renders only the names its caller passes — `APP_FACT_FEATURES` again.
- **Source**: `apps/angular-ai-devtools/src/app/extension-message.service.ts:161-172`; `apps/angular-ai-devtools/src/app/tool-groups.ts:234-265` (`features[requiredFeature]`); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:45-54,151-165`; `apps/angular-ai-devtools/src/app/chat-entry.component.ts:122`.
- **Confidence**: high
- **Why it matters here**: an opt-in bit published inside `features` would reach the group gate but neither `app_facts`' result nor the chip. The plan has to say which of the three readers is the intended surface, or grow `APP_FACT_FEATURES` deliberately.

## Finding: `PanelSignals` is a closed seven-field type, so one new page fact ripples through three modules and four fixtures

- **Claim**: `PanelSignals` has seven required fields with no optional member, and `PanelContext.replayOutcome` is required on purpose; the type is constructed in `chat-entry.component.ts`, `chat-entry.component.spec.ts`, `panel-context.spec.ts` and the held-out chip suite. One held-out fixture (`tool-group-gates`) builds a `PanelContext` literal without `replayOutcome`, so the closed shape is not enforced where the suite is plain JavaScript.
- **Source**: `apps/angular-ai-devtools/src/app/panel-context.ts:47-60,75-80`; `apps/angular-ai-devtools/src/app/chat-entry.component.ts:173-185`; `chat-entry.component.spec.ts:79,113`; `panel-context.spec.ts:28`; `tests/held-out/feature-fingerprint-chip.test.mjs:47-60`; `tests/held-out/tool-group-gates.test.mjs:49`.
- **Confidence**: high
- **Why it matters here**: "add a signal for the companion package" is a three-module, four-fixture edit, and the held-out suite will keep passing through it because nothing type-checks those files.

## Finding: Version negotiation exists in four places, with three different answers for a version it cannot read

- **Claim**: The page hard-blocks Angular below 22.1.3 by hand-rolled comparison and treats an unparseable version as not-old; `angularVersionGate` in `src/main-world/stale-view-scan.ts` answers `supported: true` for an unknown version; `tool-groups.ts` requires exactly three numeric parts and withholds every group on an unknown version. The repo also carries three Angular versions at once: `~22.1.0` declared, 22.1.8 installed, `22.2.x` in the error digest and `^22.2.0` in the fixture app.
- **Source**: `extension/agent-main.js:136-152`; `src/main-world/stale-view-scan.ts:53-79` (unknown -> `{ supported: true, version: v }` at `:65`); `apps/angular-ai-devtools/src/app/tool-groups.ts:155,199-231`; `package.json:35-44`; `package-lock.json:1690` (`22.1.8`); `scripts/generate-error-digest.mjs:51` (`version: '22.2.x'`); `spikes/ng222-app/package.json` (`^22.2.0`); `tests/held-out/tool-group-gates.test.mjs:194-203` (already asserts two of the gates disagree).
- **Confidence**: high
- **Why it matters here**: a vetted symbol table is versioned against Angular, and this repository cannot currently say which Angular version it targets. Whichever gate M021 uses, three others keep their own answers.

## Finding: The registry envelope is byte-identical since M018 and still pinned; eight tools ship, and M020 gave the registry its first real consumer

- **Claim**: `tool-registry.ts` still hashes to the pinned `20859b88…0407e` and its last commit is M018's T001. The panel provides exactly eight declarations (five page reads, `app_facts`, `panel_environment`, `error_digest_lookup`), of which `panel_environment` is the only `publish: 'panel'` and so the only one the group projection withholds. `chat-entry.component.ts` is the first non-spec caller of `registry.execute`, and it passes the chip's own facts record as `ToolContext.facts`.
- **Source**: `node -e` sha256 of the file = `20859b889b727679929e7c927cf2abeb3c4920cea190d31a69bb08bac080407e`, pinned at `scripts/registry-envelope-pin.test.mjs:55-56`; `git log -1 -- apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` -> `9f4cb74 T001: Build the tool-registry envelope…`; declarations at `read-tools.ts:192,206,220,234,248`, `app-facts.ts:306-320`, `panel-environment.tool.ts:230-240`, `error-digest.tool.ts:187-195`; `chat-entry.component.ts:111,157-171` with `toolContext` built at `:165`.
- **Confidence**: high
- **Why it matters here**: adding a tool for the companion package is a declaration in a new module, not an envelope edit — but any new *field* on the declaration (a symbol-table version, a package id) is a re-pin of a file whose immutability is an acceptance criterion.

## Finding: The chat route and its chip have no navigation entry point

- **Claim**: The app shell is a bare `<router-outlet>`, no tracked file under `apps/` matches `RouterLink|routerLink`, and both newer routes are lazy, so `/panel/chat` is reachable only by typing it.
- **Source**: `apps/angular-ai-devtools/src/app/app.html:1`; `apps/angular-ai-devtools/src/app/app.routes.ts:14-15`; `git grep 'RouterLink|routerLink' -- 'apps/**/*.ts'` -> no matches.
- **Confidence**: high
- **Why it matters here**: a milestone that adds a surface for the opt-in package is adding a second unreachable route unless it also adds navigation; today the chip is a URL, not something a user finds.

## Finding: The held-out suite is not run by `npm test`, and the three test technologies prove different things

- **Claim**: `npm test` globs `scripts/**/*.test.mjs` and `extension/**/*.test.mjs`, then runs user-scope tests, skill tests and the Nx unit-test target; `tests/held-out/**` appears in no package script and in no tracked script or prop, so its 23 files run only when something invokes them explicitly. The three suites also have different reach: Vitest specs beside the source (29 files) run through the Angular toolchain, `node:test` files beside plain JS (24 + 4) run the shipped `.js` as it is, and the held-out files import panel TypeScript directly, so they are the only suite that fails on an import-graph mistake.
- **Source**: `package.json:10-12`; `apps/angular-ai-devtools/project.json:113-121`; `git grep 'held-out'` over `package.json`, `scripts/*.mjs`, `AGENTS.md` -> no matches; `git ls-files tests/held-out/*` -> 23 files; `tests/held-out/feature-fingerprint-chip.test.mjs:1-14`; `tests/held-out/tool-group-gates.test.mjs:1-25`.
- **Confidence**: high
- **Why it matters here**: "npm test is green" says nothing about the E-criteria a milestone is judged on, so a new package's acceptance suite needs its own runner named in the plan or it becomes evidence nobody executes. Where its tests live also decides what they can prove.

## Finding: Half-built areas remain — M019's job/worker layer, a second hand-written panel, and a DI listener with no sender

- **Claim**: `worker-read.service.ts`, `jobs/job-handles.ts`, `jobs/summarize-job.ts`, `jobs/chunked-fact-list-job.ts`, `message-ring-buffer.ts` and `context-budget.ts` are imported only by their own specs and each other; `extension/panel.html` and `extension/panel.js` implement a status page that nothing references (`devtools.js` opens `panel/index.html`); and `agent-main.js` listens for `angular-ai:di-query` while no tracked file dispatches it.
- **Source**: `git grep` for importers of the six modules -> spec files plus `jobs/chunked-fact-list-job.ts:32,34` and `jobs/summarize-job.ts:40`; `extension/devtools.js:2-4`; `extension/panel.html`; `extension/panel.js`; `extension/agent-main.js:631`; `apps/angular-ai-devtools/src/app/page-reads.ts:16` (the di-query note).
- **Confidence**: high
- **Why it matters here**: a plan that says "the chat already runs jobs" or "the panel can query DI" is describing library code with no call site — and the mirror-image mistake would have M021 advertise a summariser or a token budget the panel never invokes.

## Finding: The nearest precedents for a vetted table are two incompatible hand-rolled shapes

- **Claim**: The only curated vocabularies in the tree are `tool-registry/role-name.ts` (a documented HTML-AAM subset that answers `null` outside it, with no version key) and `extension/error-digest.json` (a generated data table with one free-text `version` string, regenerated by the build). Neither has a schema, a per-Angular-version key, a machine-checked symbol list, or a test that an entry still exists in the package it names.
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/role-name.ts:13-38`; `scripts/generate-error-digest.mjs:51`; `extension/error-digest.test.mjs:12`; `apps/angular-ai-devtools/project.json:93-98`; `apps/angular-ai-devtools/src/app/tool-registry/error-digest.tool.ts:40-70`.
- **Confidence**: high
- **Why it matters here**: "the vetted symbol table" has no template here. Both precedents are hand-maintained and version-blind, and the one generated file carries a single free-text version — so the table's shape, its version key and its verification are decisions, not conventions to follow.

## Finding: Verification loads the primary checkout's extension by an absolute path

- **Claim**: The browser fixture passes `--load-extension=D:/projects/sandbox/angular-ai-devtools/extension`, so an instance started from a worktree or sidecar loads the primary checkout's build.
- **Source**: `extension-config.json:2-5`.
- **Confidence**: high
- **Why it matters here**: any browser evidence for an extension-side or package-side change taken from a sidecar describes a different tree; the run must happen in the primary checkout after `build-extension`.
## Apparent intent

<!-- Inference, clearly flagged — what the project seems to be becoming. -->

- The project builds the *seam* before the *feature*, and then proves the seam is observed: M018 shipped an envelope with no consumer, M019 shipped jobs and a worker with no consumer, and only M020 gave the registry its first caller while adding two pins that make the projection and the chip measurable — based on the envelope hash history (`git log -1 -- tool-registry.ts`), `chat-entry.component.ts:111,157-171`, and `scripts/registry-envelope-pin.test.mjs`, `scripts/registry-reach.test.mjs`.
- The page's own record is treated as the only source of truth, and the panel is forbidden from inferring: five named states (`awaiting-page`, `transport-failed`, `no-angular-root`, `cannot-tell`, `fingerprint`) exist so a chip never renders silence as eight absences — based on `feature-fingerprint.ts:1-60` and `app-facts.ts:9-30`.
- A companion package is intended to be *one page global, read trustlessly*, not a second transport: the design puts a pre-vetted object on `globalThis` and has the extension ignore anything not on its table, which matches a codebase whose only existing page channel is a pushed record — based on `docs/feature-proposals.md:228-249` and the absence of any page-request transport (`page-reads.ts:14-20`).
- The product surface grows one pure module and one route at a time, and has not yet grown chrome: there is no navigation, no header, and two of seven routes are reachable only by URL — based on `app.html:1`, `app.routes.ts:8-16`, and the absence of any `RouterLink`.
- Evidence discipline is a second deliverable, on a par with the feature: budgets, envelope bytes, check breadth and process invariants are executable tests, and a milestone's own acceptance suite lives outside `npm test` as a ritual artefact — based on `scripts/panel-bundle-budget.test.mjs`, `scripts/panel-typecheck-scope.test.mjs`, `tests/held-out/e*-*.test.mjs` and `package.json:10-12`.

## Open questions for define

- Does M021 add npm-workspace plumbing and a `libs/`-style project, or a standalone package with its own build target — and which of the two exact-content pins (`npm run check`'s four stages, the root tsconfig's three entries) is authorised to change?
- Which Angular version does the vetted symbol table target: the declared `~22.1.0` / installed `22.1.8`, the error digest's `22.2.x`, or the fixture app's `^22.2.0`? And is the table keyed by Angular version, by package version, or both?
- Where does the "this app carries the package" bit live: a ninth name inside the existing `features` map (cheap for the group gate, invisible to `app_facts` and the chip unless `APP_FACT_FEATURES` grows), a new top-level field on the state record (touches `ExtensionMessage`, `PanelSignals`, `PanelContext`, `buildPanelContext` and four fixtures), or a separate `angular-ai:*` event?
- Must the package's marker exist before `document_idle`, or does `agent-main.js` gain a re-announce trigger (a new event, an observer, a second `tryInstall`)? Today the announcement is one-shot and the retry loop stops on the first success.
- Is the symbol table shipped as generated data (the `extension/error-digest.json` shape: written by a build target, versioned with one string, imported by the panel) or as executable code in the package with `@angular/*` peer dependencies — and what test proves a vetted symbol still exists in the version it claims?
- Does the panel ever need to *ask* a page for its symbol table (which would require a real `PAGE_HOST` transport, absent in this build), or is the page-global key represented only through the pushed state record and the one replay?
- Since `tests/held-out/**` is not run by `npm test`, which runner and which script does M021's acceptance suite get — and is wiring the held-out suite into `npm test` a permitted change to the test surface?

## Blocked areas

- `npm run check`, `npm test` and every Nx build/test target — the verify sidecar has the base revision but no `node_modules`, and `scripts/ensure-sidecar-deps.mjs` / `scripts/sidecar-deps-bridge.mjs` would install or junction dependencies, which the brief forbids. All 29 Angular specs, the skill type-checks and the root `tsc` stage are therefore `unverifiable` here.
- `build-extension` — it writes into `extension/panel` and rewrites the tracked `extension/error-digest.json`, so running it is a checkout mutation, not a read.
- The measured panel initial total at this head — no build output exists in the sidecar (`extension/panel` holds only the two tracked files), so the 535.44 kB figure is quoted from the pin rather than re-measured; the seven eager references in the tracked index are all that could be observed.
- Browser e2e (`playwright.config.mts` -> `tests/browser`, `apps/angular-ai-devtools-e2e`, `e2e/provenance.spec.ts`) — needs a dev server on port 4200 and branded Chrome/Edge channels; not run.
- The four on-device model probes in `tests/held-out/chrome-*-panel.test.mjs` and `edge-phi4mini-panel.test.mjs` — need a shared browser instance and a downloaded model; not run.
- The remaining `scripts/*.test.mjs` files — several spawn `tsc`, `npm`, `npx` or a Python gate, so running them is not read-only in effect; the brief forbids test runs in any case.
- `.commandcode/skills/` and `.claude/skills/` bodies — enumerated only through the byte-mirror test, the check chain and the browser fixture configs; their SKILL.md bodies were not read, so what a package or doc change would have to update there is unknown.
- The installed GSD docs-audit gate (`~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py`, exercised by `scripts/docs-audit-disposition.test.mjs`) — installed tooling outside the checkout; its rules were not read, so what a new package name or claim would require in the docs audit is unknown.
- `.project/**` — excluded by the brief; `.project/` paths appear in this report only as the output location and through grep hits that quote them, never as evidence about the code.
