# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-16
Audited HEAD: 337047455bae67f5e05ccf25ecd0909b0c9bf448
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 398 |
| stale | 30 |
| aspirational | 1 |
| unverifiable | 100 |
| descriptive docs (no testable claims) | 1 |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "any other value, or no line, leaves it on" | config | verified | scripts/opencode-pstack-plugin.ts:50-57 — hookEnabled() returns true when the sheet is unreadable and turns injection off only on the exact line ^session hook: off$ |
| "Per-role model overrides for pstack skills" | structure | verified | scripts/opencode-pstack-plugin.ts:30 — SHEET_PATH is the opencode config copy of pstack-models.md, read on every model call |
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | unverifiable | grep of AGENTS.md, references/*.md, packages/, apps/ and scripts/ found no file naming these slugs outside the taste docs; the Command Code model roster under ~/.commandcode/ would settle it |
| "stops the Claude Code or Codex SessionStart hook, or the pstack Pi extension" | integration | stale | scripts/opencode-pstack-plugin.ts:9-11,45-57 — the repo ships an opencode plugin that reproduces the SessionStart hook from the same sheet line, so the list of consumers omits opencode |
| "the pstack effort agents (effort-low, effort-medium, effort-high, effort-xhigh, effort-max) set reasoningEffort in their frontmatter" | config | unverifiable | the repository has no .commandcode/agents/ directory and no effort-* agent frontmatter; ~/.commandcode/agents/effort-*.md would settle it |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:68 — the `instances` map holds exactly chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini and chrome-stable-nano |
| "`9600 + 10 * slot + index`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:577 — `return slot === 0 ? mainPort : 9600 + 10 * slot + index`, and control.mjs:162 sets `SLOT_TRIES = 10` |
| "the playwright-cli client waits 5 minutes longer" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:305 — `return { pageMs: min * 60000, clientMs: (min + 5) * 60000 };` |
| "Model calls carry a 180 s per-step timeout inside the page." | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:176 — `const STEP_TIMEOUT_MS = 180000` |
| "a tool round trip calls `get_component_count` and the answer names 42" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1947 — pass needs a call named `get_component_count` and an answer matching the 42-or-forty-two regex on that line |
| "waits up to 60 s for the recorded processes to exit" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3265 — `waitFor(() => !anyAlive(st.tree ?? []), 60000, 1000)` |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:101 — `"port": 9334`; lines 135, 173 and 201 give 9335, 9337 and 9338 for the other three instances |
| "`C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:210 — `const { opts, pos } = parseArgs(process.argv.slice(2));` is the script's CLI entry |
| "Choose a model by choosing its instance." | config | verified | .commandcode/skills/control-ai-browsers/instances.json:90 — each instance entry names exactly one model, `"name": "v3Nano"` here, so the instance is the only model selector |
| "Each feature file starts with an H1 and one paragraph of behaviour, then four H2s in order" | structure | verified | .commandcode/skills/control-ai-browsers/features/di-doctor.md:1 — H1, then exactly four H2s at lines 8, 13, 19 and 33 (Sub-features, How to get to it, Driving it, Gotchas) |
| "Wait on observable state (`availability()`, a resolved `create()`, a Broker State asset `Ready`), never a fixed sleep" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2892 — the launch polls `/json/version` through `waitFor` with a 60 s budget instead of sleeping a fixed time |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | apps/angular-ai-devtools/project.json:52 — the project defines a `build-extension` target |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`)" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:38 — `type: 'angular-ai:di-query',` in the posted message |
| "`angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 — `if (m?.type === 'angular-ai:di-graph' && m.resolutionPath) {` |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | verified | apps/angular-ai-devtools/project.json:58 — the build-extension target writes to `{workspaceRoot}/extension/panel`, with baseHref `/panel/` at line 76 |
| "prints the URL (`http://localhost:4222/` in the main checkout)" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:170 — `port: 4222` for the bench app, whose reason on line 173 names the counter fixture |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs:3 — the check's own claim line states the N3 flow returns `angular-ai:di-graph` with a `DiResolutionPath` |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "maps each to its owning component through `ng.getOwningComponent`" | feature | verified | extension/agent-main.js:2514 — `var instance = ng.getOwningComponent(el);`, with the resolver guarded at line 2505 |
| "message type `angular-ai:error-capture` only" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:284 — `} else if (msg.type === 'angular-ai:error-capture') {` is the only error message the service handles |
| "`angular-ai:error-explain` does not exist" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:284 — the error branch handles only error-capture, and a recursive grep for `angular-ai:error-explain` across apps/angular-ai-devtools/src finds no hit |
| "`src/panel/error-explainer-view.ts` calls `shouldCallModel`" | structure | stale | apps/angular-ai-devtools/src/app/error-explainer.component.ts:60 — `if (!shouldCallModel(digest, err?.code ?? null)) {`; apps/angular-ai-devtools/src holds only the `app` subdirectory, so `src/panel/` does not exist |
| "the driver injects a captured `NG0100` error" | feature | verified | apps/angular-ai-devtools/src/app/panel-demo.spec.ts:38 — names `extension/error-digest.json`'s NG0100 entry as the recorded substitute |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the primary checkout's `extension/` (registry `extension`)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:71 — `"extension": "extension",` in the chrome-beta-nano entry |
| "Branded Chrome ignores `--load-extension`, so every instance starts through `scripts/pipe-keeper.mjs`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:160 — `const KEEPER = join(SKILL_DIR, 'scripts', 'pipe-keeper.mjs');` |
| "compares the name and version with the loaded folder's `manifest.json`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3075 — the tab opens `chrome-extension://` plus the id plus `/manifest.json`; line 3089 compares `got?.name === want.name && got?.version === want.version` |
| "`index.html` with `<base href="/panel/">`" | config | verified | apps/angular-ai-devtools/project.json:76 — `"baseHref": "/panel/"` for the build-extension output rooted at extension/panel (line 58) |
| "Angular detection still comes from the content scripts (`relay.js`, `agent-main.js`)" | integration | verified | extension/manifest.json:25 — the content_scripts js list carries `relay.js`; `agent-main.js` is injected in the MAIN world at line 34 |
| "exits 0 with `answer`, `answerMs`, `ngVersion`, `extensionId`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3131 — the panel line renders `answerMs`, `ngVersion` and `extensionId` from the result |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3356 — the doctor run adds 19 distinct names, `map-fresh` first at line 3356 and `extension` at line 3446; the skip branch at line 3566 re-adds four of the same ids, not new ones |
| "`Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok" | config | verified | extension/manifest.json:4 — `"version": "0.3.0"`, with `"name": "Angular AI DevTools"` on line 3 |
| "`canary.tools` is `[SKIP]`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:95 — `"toolCanary": false` in the chrome-beta-nano model entry |
| "Phi-4-mini answers the tool canary in prose" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:195 — `"toolCanary": "report"` for edge-phi4mini, so control.mjs:2708 returns null instead of gating health |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1953 — the webmcp canary passes on `typeof document.modelContext === 'object'`, recording both readings at line 1886 |
| "Doctor skips the page canaries when the model is not `available`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3565 — when `avail.LanguageModel !== 'available'`, the four page checks are added as skipped |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`[OK]` with the nine Aion features" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:138 — edge-dev-aion's `features` list runs to line 146, which is nine names |
| "`edge-dev-aion` has `--disable-component-update` (see model-lifecycle Gotchas)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:149 — `"--disable-component-update"` in that instance's `args` |
| "`--backend=cpu` on Edge is refused" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:159 — edge-dev-aion's backend map has `"cpu": null`, so no CPU switch exists to launch with |
| "Lars's everyday Edge runs the same `msedge.exe` as `edge-phi4mini`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:48 — edge-stable's exe is `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, and edge-phi4mini is the edge-stable instance (line 172) |
| "The profile folders in `.commandcode\worktrees\.browsers\` of the primary checkout (git-ignored)" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:155 — `const ARTIFACT_ROOT = join(PRIMARY, '.commandcode', 'worktrees');`, with `"profilesRoot": ".browsers"` at instances.json:2 |
| "One line per instance (five)" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:68 — the `instances` map holds five entries, at lines 68, 99, 133, 171 and 199 |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`angular-ai:interop` does not exist" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:284 — the message dispatch handles record, state, error-capture, picker-state and picked only; a recursive grep for `angular-ai:interop` finds no hit |
| "Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node)" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:27 — `data-testid="interop-slice"`, with `interop-node` at line 29 and `interop-limit` / `interop-inferred` at lines 28 and 35 |
| "the deferred `/stale-view-deferred` route that makes the slice capturable" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:20 — `{ path: 'stale-view-deferred', component: StaleViewDeferredFixture }`, beside `stale-view` at line 19 |
| "The check asserts that the instance serves the extension at the check's own checkout path" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:88 — `if (!samePath(loaded, extension)) {` fails with a message naming the `--extension` fix |
| "reads the slice node count" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:111 — `typeof panel.json?.['nodes'] === 'number' ? panel.json['nodes'] : 0` |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:16 — `"minFreeMib": 22528` for chrome-beta, and 20480 at line 41 for edge-dev |
| "The pin holds the manifest component too" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:154 — `"EdgeOptimizationGuideModelsManifest"` is the third entry of edge-dev-aion's `pin` list (lines 151-155) |
| "`contextWindow` 7,168" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:166 — `"contextWindow": 7168` in the edge-dev-aion model entry |
| "`C model clear chrome-beta-nano --confirm=v3Nano`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4002 — clear refuses unless a `confirm` option is a string, and the message on line 4004 names `--confirm=v3Nano` as the example |
| "the folder `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion`" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1317 — `return join(TMP, 'pins', name);`, under the `.commandcode/worktrees` artifact root set at line 155 |
| "free space minus the model's `downloadMib` must stay above the browser minimum" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2075 — `if (free.mib - model.downloadMib < free.minMib) {` refuses the download, naming the shortfall on line 2076 |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`bench.js` hard-codes it" | config | verified | spikes/probes/bench.js:4 — `await page.goto('http://localhost:4222/');` |
| "`bench.js` has a 120 s per-prompt timeout" | feature | verified | spikes/probes/bench.js:11 — `const PROMPT_TIMEOUT_MS = 120000;` |
| "`result.log` lists `get_component_count` and `get_component_inputs`" | feature | verified | spikes/probes/probe10.js:5 — `const o = { log: [] };`, filled by the two tool calls declared at lines 7 and 15 |
| "`performanceClass`, `cpuBefore` and `cpuAfter`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4140 — `cpuBefore: cpuLoad(),`, with `performanceClass: info.performanceClass` on line 4139 |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:269 — `} else if (msg.type === 'angular-ai:record' && msg.cycle) {` |
| "The page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" | structure | verified | src/main-world/provenance-tracer.ts:1 — `// MAIN-world provenance tracer for M006 (signal-provenance).` |
| "anti-pattern findings render when two snapshots differ" | feature | verified | apps/angular-ai-devtools/src/app/anti-pattern-detector.ts:103 — `const prev = previous && !previous.unavailable ? index(previous) : null;`, with the two-consecutive-snapshots finding worded at line 120 |
| "with a cached answer for an unchanged selection" | feature | verified | apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts:277 — `if (this.cache.has(key)) {` reuses the stored answer, which line 287 writes |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The scan runs through `StaleViewScanService` (which loads `extension/stale-view-worker.js`)" | feature | verified | apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:32 — `? chromeObj.runtime.getURL('stale-view-worker.js')`, and extension/stale-view-worker.js is present in extension/ |
| "the template may show a stale value" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:26 — `>the template may show a stale value</span` |
| "`angular-ai:stale-view` does not exist" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:284 — the dispatch has no stale-view branch, and a recursive grep for `angular-ai:stale-view` across apps/angular-ai-devtools/src finds no hit |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scripts/control.mjs:69` keeps it at 3000" | config | stale | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101 — `const PORTAL_API_PORT = 3000;` is the pin; line 69 is a typedef property, `@property {ProcRecord[]} [tree]` |
| "counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:121 — `at: (slot) => (slot === 0 ? 4222 : 4300 + slot)`; lines 163 and 185 give 4400 + slot and 4500 + slot |
| "`--timeout <seconds>` (default 240" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:1519 — `timeoutMs = timeoutMsOf(argv, 240);` |
| "`provideRouter(routes)` over the two routes `src/app/app.routes.ts:5-8` declares" | structure | stale | spikes/ng222-app/src/app/app.routes.ts:19 — the array (lines 18-38) declares twenty routes, `stale-view` and `stale-view-deferred` at lines 19-20; lines 5-8 are imports |
| "The four portal features are recorded as external" | status | verified | .commandcode/skills/control-angular-dev-app/features/.proven.json:87 — `external` names the portal checkout outside this repository, repeated at lines 92, 97 and 102 |
| "`processTable`, `snapshot`, `merge`, `stop`, `describe`" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/proctree.mjs:87 — `export function describe`; :198 processTable, :298 snapshot, :336 merge, :438 stop |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Portal: `node $S up --target portal` (API on 3000, app on the derived port, 4507 for the default portal folder)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101 — `const PORTAL_API_PORT = 3000;`; :185 — portal port `slot === 0 ? 4200 : 4500 + slot`, so 4507 is slot 7 of the folder hash |
| "`__ngc.navigate(url)` is a setup shortcut" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:379 — `async navigate(url) {` wraps `ng.ɵnavigateByUrl` |
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | config | unverifiable | .commandcode/skills/control-angular-dev-app/features/.proven.json:87 — the portal lives in a checkout outside this repository, so that manifest is not here; the portal checkout would settle it |
| "Fresh page state: `count` 3, `double` 6, cart 1 item" | status | verified | spikes/ng222-app/src/app/counter.ts:17 — `count = signal(3)`; :18 `computed(() => this.count() * 2)`; :5 `items = signal<string[]>(['apple'])` |
| "Counter, Components, SSR, Portal navigation, Portal contracts, Portal claims, Portal complaints and customers, Zoneful portal worktree" | structure | verified | .commandcode/skills/control-angular-dev-app/features/.proven.json:4 — the eight feature ids run from `components` (:4) and `counter` (:44) through `portal-claims` (:84), `portal-complaints-customers` (:89), `portal-contracts` (:94), `portal-navigation` (:99), `portal-zoneful-worktree` (:104) to `ssr` (:109) |

## Doc: .commandcode/skills/control-angular-dev-app/features/components.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `/components` page renders `ComponentsPage` (`app-components-page`)" | structure | verified | spikes/ng222-app/src/app/components/components-page.ts:6 — `selector: 'app-components-page'`, routed at spikes/ng222-app/src/app/app.routes.ts:21 |
| "two `app-harness-probe` hosts" | structure | verified | spikes/ng222-app/src/app/components/components-page.ts:9 — `<app-harness-probe id="probe-a" ...>` and :12 the second host `id="probe-b"` |
| "`aria-listbox` (`#components-listbox`) is the `@angular/aria` listbox surface" | feature | verified | spikes/ng222-app/src/app/components/aria-surfaces.ts:26 — `<ul id="components-listbox" ngListbox ... focusMode="activedescendant">`; dependency at spikes/ng222-app/package.json:14 |
| "`aria-tabs` (`ngTabs`) is the tabs surface" | feature | verified | spikes/ng222-app/src/app/components/aria-surfaces.ts:32 — `<div ngTabs>` |
| "`aria-menu` (`ngMenu` triggered by `ngMenuTrigger`) is the menu surface" | feature | verified | spikes/ng222-app/src/app/components/aria-surfaces.ts:43 — `<button matButton ngMenuTrigger [menu]="menu" ...>` and :46 `<div ngMenu #menu="ngMenu" id="components-menu">` |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Clicks: 3 (double 6, cart 1)`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 — `toHaveTextContent('Clicks: 3 (double 6, cart 1)')` |
| "the stale-view fixtures (`src/app/app.routes.ts:5-8`, read 2026-11-01)" | structure | stale | spikes/ng222-app/src/app/app.routes.ts:19 — `stale-view` and `stale-view-deferred` are declared at lines 19-20; lines 5-8 are TypeScript imports |
| "a `count` signal, a `double` computed" | feature | verified | spikes/ng222-app/src/app/counter.ts:17 — `readonly count = signal(3)`; :18 `readonly double = computed(() => this.count() * 2)` |
| "an injected `CartService.items` signal" | feature | verified | spikes/ng222-app/src/app/counter.ts:5 — `readonly items = signal<string[]>(['apple'])`; :19 `inject(CartService)` |
| "an effect that copies `count` into `lastLogged`" | feature | verified | spikes/ng222-app/src/app/counter.ts:23 — `effect(() => this.lastLogged.set(this.count()))` |
| "the component is OnPush by default (no `changeDetection` declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:8 — the `@Component` block (lines 8-14) declares only selector and template; core 22.2.2 installed at spikes/ng222-app/package-lock.json:473 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`claim-list` table with columns Claim number, Damage Type, Date, Policynumber, Customer" | structure | unverifiable | .commandcode/skills/control-angular-dev-app/features/.proven.json:87 — the portal is an external checkout; nothing in this repository defines the claim list, so the portal checkout would settle it |
| "Data comes from `http://localhost:3000/api/claims`" | integration | unverifiable | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101 pins the API port at 3000, but the `/api/claims` route lives in the portal checkout outside this repository |
| "`/claim/create` shows the heading `Complaint Create`: an app bug, measured" | status | unverifiable | no portal source in this repository; the portal checkout named at .proven.json:87 would settle it |
| "`__ngc.signals('ng-journal-list')`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:251 — `signals(selector) {` returns the nodes and the `consumer -> producer` edges |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | structure | unverifiable | .commandcode/skills/control-angular-dev-app/features/.proven.json:92 — external portal checkout; no customer list source is in this repository |
| "the customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | status | stale | research/05-spikes.md:75 — the cited line gives "up to 80 nodes" as a bound "inferred from the numbers" for one component, not a measured count for the customer list |
| "Save sends `POST /api/complaints` (201)" | integration | unverifiable | the API belongs to the external portal; .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101 pins only its port at 3000 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "20 rows after a fresh API start" | structure | unverifiable | .commandcode/skills/control-angular-dev-app/features/.proven.json:97 — portal-contracts is recorded external; the contract list is in the portal checkout, so a live portal API would settle it |
| "then sends `PUT /api/contracts` and returns to details" | integration | unverifiable | the `/api/contracts` route is in the external portal; .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101 pins only the port at 3000 |
| "`node $S doctor --target portal` exits 0" | command | unverifiable | the portal flow is registered at .commandcode/skills/control-angular-dev-app/scripts/control.mjs:185, but the exit code needs a running portal checkout, which is outside this repository |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` redirects to `/home`" | feature | unverifiable | .commandcode/skills/control-angular-dev-app/features/.proven.json:102 — portal-navigation is external; no portal route config exists in this repository |
| "`__ngc.router()`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:347 — `router() {` reads `ng.ɵgetRouterInstance` and returns the current URL with the route tree |
| "the `capitalize` pipe, which calls `toUpperCase`" | feature | unverifiable | a portal library pipe, outside this repository; the portal checkout would settle it |
| "`goto` reloads the app and drops `__ngc` unless it was installed by `doctor` or `run-code`" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:2 — the run-code file installs `window.__ngc` on the page and on every later load |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "prints `976752389c22bb563d2278c2d78f423cb2505669`" | config | verified | .commandcode/skills/control-angular-dev-app/features/.proven.json:106 — the portal-zoneful-worktree entry records commit `976752389c22bb563d2278c2d78f423cb2505669` |
| "the app on its derived port 4509 (slot 9: `4500 + slot`)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:185 — portal port `slot === 0 ? 4200 : 4500 + slot`; .proven.json:107 records port 4509 |
| "Angular 20.3.35 installed (`package.json` asks `@angular/core ^20.3.29`), `zone.js ^0.16.2` installed" | config | verified | .commandcode/skills/control-angular-dev-app/features/.proven.json:107 — the external record lists Angular 20.3.35, zone.js ^0.16.2 and the zone.js polyfills |
| "ticked `applicationRef._tick` 2 times, one scheduled inside `Zone.root` ticked it 0 times" | status | verified | .commandcode/skills/control-angular-dev-app/features/.proven.json:107 — the record states a zone-hosted setTimeout ticked `applicationRef._tick` 2x and `Zone.root` 0x |
| "`--dir` (or `CONTROL_NG_PORTAL_DIR`) is what selects the worktree" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:179 — `dir: process.env['CONTROL_NG_PORTAL_DIR'] \|\| PORTAL_DEFAULT_DIR` |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` is `ssr`, `/prerender` is `ssg`, `/client` is the bare shell with `<body ngcm>`" | structure | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4 — `{ path: '', renderMode: RenderMode.Server }`, :5 Prerender and :6 Client |
| "the server log counts every hit as `[api] GET /api/items` with the user agent" | integration | verified | spikes/ng222-ssr/src/server.ts:18 — `app.get('/api/items', ...)`; :19 logs `[api] GET /api/items ... ua=${req.headers['user-agent'] ?? 'none'}` |
| "`ok` is `true` when all six checks pass" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:116 — the six named checks follow at :116, :121, :126, :131, :137 and :143 |
| "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | status | unverifiable | per-page-load counters; only a live run of .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js against the SSR fixture would settle the numbers |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:108 — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';` |
| "session `ngdt`, CDP port 9420" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:329 — `const MAIN_CDP_PORT = 9420;`; :330 gives a worktree 9421-9499 |
| "`node $S panel show`" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1912 — `async function cmdPanel()`; :1950 names the subcommands `show, signal-graph, screenshot` |
| "`node $S coexist [--di-graph]`" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2019 — `async function cmdCoexist()`; :2102 drives the `angular:di_graph` step |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" | structure | stale | .commandcode/skills/control-angular-devtools/scripts/text.mjs:1 — the directory holds text.mjs with no text.test.mjs beside it, while control.mjs, fingerprint.mjs, ng-inspect.js and ssr-check.js each have one |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at `spikes/ng222-app` (Angular 22.2.2)" | config | verified | spikes/ng222-app/package-lock.json:472 — `node_modules/@angular/core` with `"version": "22.2.2"` at :473 |
| "H1, one paragraph of user-visible behaviour, then `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-devtools`, `Gotchas`" | structure | verified | .commandcode/skills/control-angular-devtools/features/profiler.md:1 — H1 at :1, Sub-features :6, How to get to it :11, Driving it :15, Gotchas :26, the same order as attach.md and install.md |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:113 — `const TMP = join(ROOT, 'tmp', 'control-angular-devtools');`; :1608 joins `evidence` and the stamp |
| "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`)" | structure | unverifiable | no `devtools-tabs.component.ts` exists in this repository; the panel ships with the extension, so the extension source would settle it |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1241 — `Object.defineProperty(window, '__NG_DEVTOOLS_CONNECTED__', { ... })`; :1255 reads it |
| "`attach` exits 1 because it requires `isDebugMode`" | status | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1888 — the attach pass condition includes `d.isDebugMode &&` |
| "`isSupportedAngularVersion` (major 12+ or 0)" | feature | unverifiable | the payload comes from the extension's content script; .commandcode/skills/control-angular-devtools/scripts/control.mjs:87 only names the fields in its `Detection` typedef |
| "Angular 22.2.2" | config | verified | spikes/ng222-app/package-lock.json:473 — `"version": "22.2.2"` for `node_modules/@angular/core` |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Store page: `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:110 — STORE_URL is the chromewebstore.google.com detail URL built from EXT_ID, which is defined at :108 |
| "polls for Lars's click (default 180 s)" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1413 — `Number(opts.timeout ?? 180) * 1000` for the install poll |
| "`--profile P` picks the profile read and also passes `--profile-directory=P` to the window it opens" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1355 — the spawn argument list puts --profile-directory first, then the store URL |
| "`enabled` for branded browsers is read from `disable_reasons` and `state`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1312 — `disableReasons: s.disable_reasons ?? []`; the profile typedef at :71 carries `disable_reasons` and `state` |
| "`chrome://` and `edge://` URLs passed on the command line open an empty window instead of the page" | status | unverifiable | a browser behaviour measured by hand; .commandcode/skills/control-angular-devtools/scripts/control.mjs:1493 records only the workaround message |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2041 — `window.__ngdtRemoveA = ng.ɵsetProfiler(() => ...)` keeps the returned remover |
| "other `ɵsetProfiler` subscribers (an AI extension) added and removed during a recording" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2019 — `async function cmdCoexist()`; :2041 adds the two counters and the remover |
| "`ng.ɵsetProfiler(null)` clears every subscriber, DevTools' included" | status | unverifiable | Angular's `render3/profiler.ts` is not in this repository and no test here asserts the clearing |
| "`own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}`" | status | unverifiable | a recorded capture, not a repository artifact; a fresh `node $S coexist` run would settle it |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "graph nodes are `ng-signal-graph-pane .node-cont`" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1165 — the panel reader selects `ng-signal-graph-pane .node-cont` and takes the `kind-` class from each node |
| "`node $S panel signal-graph --component=app-counter`" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1186 — `async function panelSignalGraph(port, component)` |
| "after that tool runs, the template node is gone from both" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2102 — the `--di-graph` step re-reads the pane at :2119 and compares it with `ng.ɵgetSignalGraph` at :2146 |
| "Expected on the fixture before: `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`" | status | unverifiable | the labels are a live-panel capture; the fixture's own nodes are at spikes/ng222-app/src/app/counter.ts:16-23, but only a `node $S panel show` run settles the pane text |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pinned 0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:103 — `const PINNED = '0.0.7';` |
| "none of the eight action tools" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:107 — ACTION_TOOLS lists exactly highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api |
| "`control.mjs:74` defaults to 9999" | config | stale | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — that line is `@property {string} mcpUrl`; the 9999 default is `const DEFAULT_PORT = 9999` at line 104 |
| "set `CONTROL_PANGULAR_DIR`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1218 — `str('dir') ?? process.env['CONTROL_PANGULAR_DIR'] ?? PORTAL_DEFAULT_DIR` |
| "`state/pangular-<port>.json`" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1548 — returns `path.join(STATE_DIR, ...)` with the port in the name; STATE_DIR is `tmp/control-pangular-inspector/state` from line 101 |
| "`http://localhost:9999/__mcp`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1644 — `mcpUrl: http://localhost:${p}/__mcp` |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-pangular-inspector/scripts/control.mjs`" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists; its `.claude/skills` mirror holds 13 files against 14 here and lacks `scripts/text.mjs`, so the `.commandcode` path is the maintained one (drift) |
| "`node $S check` exits 0 (pin, overlay import, proxy)" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:845 — check facts are declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |
| "`session` (`pangular-9999`)" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1647 — `session: pangular-${p}`, with 9999 the default port from line 104 |
| "four H2s in this order" | structure | verified | .commandcode/skills/control-pangular-inspector/features/setup.md:6 — Sub-features, then How to get to it (user POV) at 14, Driving it at 19, Gotchas at 36, in that order |
| "the overlay reports about 250 ms after change detection" | status | unverifiable | no timing measurement in the repository; a timed snapshot after one action over MCP would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1644 — `mcpUrl: http://localhost:${p}/__mcp` |
| "`list-components` on versions after 0.0.7" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2275 — the fallback message reads `resource pangular:component-tree (list-components is not in this version)`, so 0.0.7 lacks the tool |
| "`node $S components --depth 3`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:932 — the component-tree outline drops nodes below `depth` and honours a filter |
| "`inspect-signals` nodes and edges for one component" | feature | unverifiable | the devtools package is not vendored in this checkout, so its tool list cannot be read; `node $S tools` against a 0.0.7 server would settle it |
| "Instance ids (`cgg06-4`) change with every page load" | status | unverifiable | no page-id artefact in the repository; two `list-pages` reads across a reload would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S call inspect-route`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1939 — `call` resolves any tool name against the server and reports `no tool <name> on <mcpUrl>; available: ...` |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | config | unverifiable | enforced inside the pangular server, not vendored here; a `tools`/`call explain-navigation` probe with and without `limit` would settle it |
| "The sidebar entries are `div`s with `routerLink`" | structure | unverifiable | the Insurance Portal app is outside this repository; control.mjs:105 names it as an external worktree path, so its templates cannot be read |
| "`list-routes` (12 routes, measured)" | status | unverifiable | a count from one live portal session; no artefact in the repository records it |
| "one `info` finding, `missing-title`" | status | unverifiable | same live-session result; a saved `lint-routes` JSON in the evidence directory would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:874 — the check reports `/__pangular -> ${f.proxyTarget}` and line 873 requires that target to be `http://localhost:${port}` |
| "`http://localhost:9999/` directly" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:104 — `const DEFAULT_PORT = 9999`, the standalone server's port |
| "`playwright-cli -s=pangular-9999`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1647 — `session: pangular-${p}`, so the default port 9999 gives that session name |
| "accessible name `Toggle Pangular Inspector`" | feature | unverifiable | the button is rendered by the pangular overlay package, which is not vendored here; `playwright-cli find "Toggle Pangular"` against a live page would settle it |
| "the eight tab names, `LIVE`, `Angular 22.2.2`" | status | unverifiable | the panel reports the portal app's Angular version and tabs; the portal is outside this repository, so a saved dashboard snapshot would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:103 — `const PINNED = '0.0.7';` |
| "`setup.check`: six read-only facts, one line each" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:845 — exactly six add() calls: declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target (through line 875) |
| "`install --json` -> `changed` lists" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1458 — `changed: dirtyPaths(dir)` |
| "The `main.ts` edit needs the form `bootstrapApplication(...).catch(`" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:662 — the pattern is `/bootstrapApplication\(([^)]*)\)(\s*)\.catch\(/`; line 1409 exits when it is absent |
| "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | status | unverifiable | needs the external portal worktree and a live `install`; no artefact in this repository records the line count |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx pangular mcp --root <dir>` in an MCP client config (stdio)" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2302 — the scan spawns `[bin, 'mcp', '--root', root, '--read-only']` |
| "`scan <tool>` [--root DIR]" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2369 — the scan result is registered as `command: 'scan'` |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2375 — `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)`, SCRATCH from line 100 |
| "`get-routes`, `get-components`, `get-signals`" | feature | unverifiable | the stdio tool list is served by @pangular-inspector/devtools, which is not vendored here; `node $S scan nope` prints it |
| "Angular `22.2.2`, project `@ng-journal/source`, TypeScript `6.0.3`" | config | unverifiable | reported for the external portal project; this workspace pins its own typescript 6.0.3 (package.json:47), which is not that app |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the per-model instance (default `chrome-beta-gemma4`)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:153 — `const DEFAULT_INSTANCE = 'chrome-beta-gemma4';` |
| "vitest derived 51315" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:151 — `const MAIN_VITEST_PORT = 51315;`; spikes/ng222-app/vitest-base.config.mts:7 defaults the same way |
| "bundled-cdp derived 9350" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:152 — `const MAIN_BUNDLED_CDP_PORT = 9350;` |
| "`--hold <ms>` sets `VITE_COUNTER_HOLD_MS`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:803 — `env['VITE_COUNTER_HOLD_MS'] = String(state.hold);` |
| "`--timing-demo` sets `VITE_COUNTER_TIMING_DEMO=1`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:807 — `env['VITE_COUNTER_TIMING_DEMO'] = '1';` |
| "`vitest-attach.config.mts` sets `persistentContext` to `browser.contexts()[0]`" | config | verified | spikes/ng222-app/vitest-attach.config.mts:20 — `this.persistentContext ??= this.browser.contexts()[0];`, with connectOverCDP at line 19 |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Take `<session>`, `<cdpUrl>`, `<evidenceDir>` and `orchestratorUrl` from `node $S info`" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1718 — `orchestratorUrl: tab?.url ?? null` is written into the state that `info` prints |
| "`page.frame('vitest-iframe')` for waits and reads" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1627 — the tester frame is matched by `c.frame.name === 'vitest-iframe'` |
| "`ui: false`" | config | verified | spikes/ng222-app/vitest-attach.config.mts:55 — `ui: false,` |
| "`node $S up --hold 90000`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:803 — `env['VITE_COUNTER_HOLD_MS'] = String(state.hold);` |
| "four H2s in order" | structure | verified | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md:9 — Sub-features, How to get to it (user POV) at 17, Driving it at 23, Gotchas at 40 |
| "`playwright-cli attach --cdp=<cdpUrl> --session=<session>`" | command | unverifiable | playwright-cli is an external CLI not vendored here; the repository only produces the CDP URL `info` reports (control.mjs:1415) |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "moves \"Clicks: 3 (double 6, cart 1)\" to \"Clicks: 4 (double 8, cart 1)\"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 — `toHaveTextContent('Clicks: 3 (double 6, cart 1)')`, then the same assertion for `Clicks: 4 (double 8, cart 1)` at line 27 |
| "a `CartService` override shows \"cart 2\"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:30 — the test `shows the cart size from an overridden CartService`, asserting `Clicks: 3 (double 6, cart 2)` at line 34 |
| "with `VITE_COUNTER_TIMING_DEMO=1` one test fails" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:39 — `it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1')`, and line 49 asserts `toContain('Clicks: 4')` on the pre-click DOM |
| "with `VITE_COUNTER_HOLD_MS=<ms>` the hold test passes after the hold" | config | verified | spikes/ng222-app/src/app/counter.spec.ts:56 — `it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)`, timeout is hold + 30 000 ms at line 73 |
| "`Tests 2 passed \| 2 skipped (4)` without flags" | status | unverifiable | needs a run; the spec holds four `it` blocks of which two are `runIf`-gated (counter.spec.ts:39, :56) |
| "`--filter \"keeps the counter mounted\"` runs it alone" | command | verified | spikes/ng222-app/src/app/counter.spec.ts:57 — the test name is `keeps the counter mounted for an outside inspection, then counts its own click`, which that filter matches |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --extension extension` (the repository's `extension/`)" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1349 — `await cdp.send('Extensions.loadUnpacked', { path: dir })`, loading the directory the flag names |
| "In attach mode `down` uninstalls the extension (`Extensions.uninstall`)" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1791 — `await cdp.send('Extensions.uninstall', { id: state.extension.id })` |
| "The repository's `extension/` does not inject there" | status | verified | extension/manifest.json:18 — all three content_scripts match `<all_urls>` but none sets `all_frames`, so they do not run in the nested tester iframe |
| "`LanguageModel.availability()` is `available` in the tester iframe (attach mode)" | feature | unverifiable | a live browser-model probe; no artefact in the repository records the answer |
| "in bundled mode it deletes the profile the extension was loaded into" | feature | unverifiable | the bundled teardown branch was not read in this pass; the `down` code path for `VITEST_USER_DATA_DIR` would settle it |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --hold 90000`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:803 — `env['VITE_COUNTER_HOLD_MS'] = String(state.hold);` |
| "`CartService` overridden to `['pear', 'plum']`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:61 — the hold test calls `setup({ cartItems: ['pear', 'plum'] })` |
| "clicks Increment once halfway" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:62 — waits `holdMs / 2`, then the expectation; line 71 waits the remaining half |
| "`page.frame('vitest-iframe')`" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1627 — the frame is matched by `c.frame.name === 'vitest-iframe'` |
| "Run `spikes/probes/vitest-iframe-probe.js` in the frame" | structure | verified | spikes/probes/vitest-iframe-probe.js — the path resolves from the repository root beside spikes/probes/vitest-lib.mjs, the CDP client SKILL.md names as shared code |
| "a host element whose id is rootN and whose ng-version reads 22.2.2 (the doc prints it as a div tag)" | structure | unverifiable | the attribute is produced in the browser at run time; no record of the mounted DOM is stored in the repository |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`package-lock.json` → npm" | config | verified | package-lock.json is the only lockfile at the repository root, so the fallback detection lands on npm |
| "Root `package.json` should have `\"private\": true`" | config | verified | package.json:3 — `"private": true,` |
| "Check whether there's a `packageManager` field in the root-level `package.json`" | config | verified | package.json:1 — the file declares `name`, `private`, `type`, `description`, `scripts` and deps but no `packageManager`, so the lockfile fallback is the operative path |
| "All package managers support workspaces" | feature | unverifiable | the root package.json declares no `workspaces` field, so the workflow in this document cannot be exercised on this repository; a workspace root would settle it |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "this repository's `nx.json` contains neither" | config | verified | nx.json contains no `nxCloudId` and no `nxCloudAccessToken` — a search for both keys returns nothing |
| "ci-state-update.mjs (deterministic script): manages budget gates, post-action state transitions, and cycle classification" | feature | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:7 — "Three commands: gate, post-action, cycle-check." |
| "`--max-cycles` 10" | config | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:123 — `parseInt(getArg('--max-cycles') \|\| '10', 10)` |
| "circuit breaker (5 polls)" | status | stale | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208 — `if (noProgressCount >= 13) return { action: 'done', code: 'circuit_breaker' };` is 13 polls, not 5, and the same document's table at line 119 also says 13 |
| "`ci-state-update.mjs gate --gate-type local-fix`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:10 — `gate --gate-type <local-fix\|env-rerun> [counter args]` |
| "`{%- if platform == \"claude\" %}`" | structure | stale | .commandcode/skills/monitor-ci/SKILL.md.meta.json:4 declares `"command": true` with an `argument-hint` and no `platform` key, so this copy is installed as-is and its platform conditionals were never evaluated |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The script returns `autoApplySkipReason` in its output" | feature | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:432 — `result.autoApplySkipReason = extra.autoApplySkipReason;` |
| "The script returns `verifiableTaskIds` in its output" | feature | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:430 — `result.verifiableTaskIds = extra.verifiableTaskIds;` |
| "`ci-state-update.mjs gate --gate-type local-fix`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:10 — `gate --gate-type <local-fix\|env-rerun> [counter args]`; `local-fix` handled at line 40 |
| "Run `ci-state-update.mjs gate --gate-type env-rerun`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:57 — `if (gateType === 'env-rerun') {` |
| "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | command | unverifiable | the nx-cloud CLI is not vendored here; ci-state-update.mjs offers only `gate`, `post-action` and `cycle-check` (line 7), so this step cannot be exercised |
| "push empty commit (`git commit --allow-empty -m \"ci: rerun after rejecting throttled fixes\"`)" | command | unverifiable | an agent-side git step no script here performs; the repository's history holds no such commit to point at |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `npx nx-cloud api --help` (or `npx nx-cloud api` alone) once" | command | verified | package-lock.json:14093 — the installed nx package declares the `nx-cloud` bin (`dist/bin/nx-cloud.js`), so `npx nx-cloud` resolves from the workspace root |
| "For cache causes, target settings, inputs, outputs, or a configuration change, use `nx-cloud-cache-investigator`" | integration | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:2 — `name: nx-cloud-cache-investigator`, the skill the sentence points at |
| "read [references/extraction-and-calculation.md](references/extraction-and-calculation.md) first" | integration | verified | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:1 — file present at the resolved path, heading "# Large extraction, assets, and calculations" |
| "Do not use this skill to poll or monitor live CI" | feature | verified | .commandcode/skills/nx-cloud-api/SKILL.md.meta.json:3 — the registration description ends "Do not use it for live CI monitoring." |
| "with `nxCloudId` in `nx.json`" | config | unverifiable | nx.json:1-40 — the workspace nx.json carries no `nxCloudId` or `nxCloudUrl` key, so the auth prerequisite cannot be exercised; `npx nx-cloud login --status` output would settle it |
| "`--page-size` (which sets `limit`, max 500)" | config | unverifiable | package.json:28-49 — no nx-cloud client is a workspace dependency; only `npx nx-cloud api --describe <operation>` documents the limit |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | command | unverifiable | package-lock.json:14091-14093 — only the `nx` and `nx-cloud` bins are recorded and node_modules is absent in the sidecar, so the subcommand list is unreadable; `npx nx-cloud --help` would settle it |
| "Use `-o <file>` with an explicit extension such as `.tar.gz`; the command refuses to write a download to a terminal" | command | unverifiable | no nx-cloud asset download is recorded anywhere in the repo; one `npx nx-cloud api <link> -o out.tar.gz` run would settle it |
| "record each time range, filters, file, exit code, item count, and final `nextCursor` in a manifest" | feature | unverifiable | no extraction manifest or nx-cloud response file exists in the repo; one bounded `task-stats` extraction run would settle it |
| "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | feature | unverifiable | .commandcode/skills/nx-cloud-api/SKILL.md repeats the claim but neither document is corroborated by a run; a JSON-vs-ndjson comparison would settle it |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 — `name: nx-cloud-api`, the skill the dependency names |
| "If the query reports `cache: true`, do not add another `cache: true`" | config | verified | nx.json:4-6 — `targetDefaults.build.cache` is already `true`, so a duplicate per-project `cache` setting is redundant exactly as the document states |
| "Query the exact target with the workspace-local Nx command" | command | verified | package.json:17 — `test:app` is `npx nx run angular-ai-devtools:test`, i.e. Nx is already driven through npx from the workspace |
| "Read [references/artifact-integrity.md](references/artifact-integrity.md) before you inspect an archive" | integration | verified | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:1 — file present at the resolved path, heading "# Cache artifact integrity" |
| "Keep the selected row's `batchId` and `links.self` in the projection" | feature | unverifiable | no `runs/{runId}/tasks` response is stored in the repo; one saved response would settle the field names `batchId` and `links.self` |
| "Read [references/log-and-report-assets.md](references/log-and-report-assets.md) before you decode a log or report" | integration | verified | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md:1 — file present at the resolved path, heading "# Log and report assets" |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`" | command | verified | package-lock.json:14093 — the installed nx 23.3.0 package ships the `nx-cloud` bin, so the documented download command resolves |
| "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`" | command | unverifiable | package-lock.json:14091-14093 — no separate `decrypt-artifact` bin is recorded and node_modules is absent, so the subcommand cannot be confirmed; `npx nx-cloud --help` would settle it |
| "Record byte count and SHA-256" | feature | unverifiable | no script under scripts/ references nx-cloud (repo-wide search finds only docs and the skills manifest), so no integrity check is exercised; a checked-in verification script would settle it |
| "Byte-identical malformed downloads across retries support a persistent bad cache object" | status | unverifiable | no cached artifact or run record exists in the repo to compare; two downloads of the same link with hashes would settle it |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | unverifiable | no nx-cloud asset response or fixture exists in the repo; `npx nx-cloud api --describe <task-asset operation>` would settle the enum |
| "Download the exact row-provided link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`" | command | verified | package-lock.json:14093 — the installed nx package declares the `nx-cloud` bin, so the documented download command resolves in this workspace |
| "A downloaded asset proves only that it resolves now" | feature | unverifiable | nothing in the repo records asset availability over time; a 200-then-404 pair on the same link would settle it |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill for all Nx Cloud reads" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 — `name: nx-cloud-api`, the skill the requirement names |
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED` (the `cipes` filter accepts only terminal statuses)" | command | unverifiable | no API schema copy is checked in; `npx nx-cloud api --describe cipes` would settle the accepted status values |
| "Use a semaphore of at most five narrow detail requests" | feature | unverifiable | no script under scripts/ references nx-cloud (repo-wide search finds only docs and .commandcode/.nx-skills-manifest.json), so the budget is unexercised; a checked-in request-scheduling script would settle it |
| "inspect `CODEOWNERS` and project ownership metadata at the recorded commit" | status | unverifiable | CODEOWNERS is absent at the repository root, so this branch has no subject here; a checkout that contains CODEOWNERS would settle it |
| "the public API has no separate workflow routes" | feature | unverifiable | no `--list-operations` capture exists in the repo; `npx nx-cloud api --list-operations` output would settle it |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This example is for built-in nx formatting with prettier" | config | verified | package.json:19 — the workspace formats with `prettier --write .`, and package.json:46 pins prettier ^3.9.10 with .prettierrc at the root |
| "The `link-workspace-packages` skill can help add these correctly" | integration | verified | .commandcode/skills/link-workspace-packages/SKILL.md:2 — `name: link-workspace-packages`, the skill named in the tip |
| "List all generators for a plugin: `npx nx list @nx/react`" | command | unverifiable | package.json:34 — this workspace depends on @nx/angular ^23.3.0 and has no @nx/react dependency, so the example cannot run here; `npx nx list @nx/angular` would be the resolvable form |
| "Always run with `--dry-run` first" | command | unverifiable | no generator invocation is recorded in the repo; `npx nx g @nx/angular:library --help` would settle which flags that generator supports |
| "Empty test suites will cause `nx test` to fail" | feature | unverifiable | package.json:17 defines a reachable `test` target for the app, but the empty-suite failure is Nx runtime behaviour; running `npx nx run angular-ai-devtools:test` would settle it |
| "nx run-many -t build,lint,test,typecheck" | command | unverifiable | nx.json:25-32 registers only @nx/playwright/plugin, so no lint target is configured here; `npx nx show project angular-ai-devtools --json` would settle which targets exist |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint` 23.3.0 peer-depends on `eslint@^9.0.0 \|\| ^10.0.0`, so ESLint 10 is supported" | config | verified | package-lock.json:6722 and :6737 — @nx/eslint 23.3.0 declares `"eslint": "^9.0.0 \|\| ^10.0.0"` under peerDependencies |
| "For deeper Jest issues (tsconfig.spec.json, Babel transforms, CI atomization, Jest vs Vitest coexistence), see `references/JEST.md`" | integration | verified | .commandcode/skills/nx-import/references/JEST.md:1 — file present at the resolved path, heading "## Jest" |
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs and follow-up questions" | status | unverifiable | package-lock.json:13986 — the workspace runs nx 23.3.0, above the named threshold, but no import run is recorded; `nx import --help` would settle the output format |
| "Nx rewrites `package.json` scripts during init, creating broken commands" | feature | unverifiable | package.json:15-17 — this repo keeps hand-written scripts (`test:app` calls `npx nx run angular-ai-devtools:test`), so no rewrite is visible here; a fresh `nx init` on a non-Nx checkout would settle it |
| "Diff source and dest `package.json` + `nx.json`. Add missing deps, merge relevant `targetDefaults` and `namedInputs`" | feature | unverifiable | nx.json:3-24 — this workspace carries `targetDefaults` but no `namedInputs` block, so half the named keys have no subject here; an actual `nx import` of a source repo would settle it |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project" | feature | unverifiable | nx.json:25-32 registers only @nx/playwright/plugin and no eslint config file exists at the repository root, so the plugin is unexercised; `npx nx show project <name> --json` in an ESLint-equipped workspace would settle it |
| "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`" | feature | unverifiable | no import run is recorded in the repo; an `nx import` of a source that carries eslint config would settle the offer behaviour |
| "`typescript-eslint@7.x` declares `peerDependencies: { \"eslint\": \"^8.56.0\" }`" | config | unverifiable | package-lock.json — no `node_modules/typescript-eslint` entry exists in the lockfile, so the v7 peer range cannot be read here; the registry metadata for typescript-eslint 7 would settle it |
| "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" | config | unverifiable | package-lock.json:6737 — the recorded peer range is `^9.0.0 \|\| ^10.0.0`, which does not pin the version init writes; an `nx add @nx/eslint` run would settle it |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | config | unverifiable | nx.json:25-32 — only @nx/playwright/plugin is registered, so @nx/gradle is not configured and `nx show projects` cannot demonstrate inference here |
| "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | feature | unverifiable | no gradlew and no gradle/wrapper exist at the repository root, and no Gradle import is recorded; an `nx import` of a Gradle source would settle it |
| "If `@nx/gradle` is installed, run `nx show projects` to verify that Gradle projects are being inferred" | command | unverifiable | package.json:28-49 — no @nx/gradle dependency is present, so the verification command has nothing to report; installing it against a Gradle fixture would settle it |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "\"plugin\": \"@nx/jest/plugin\", \"options\": { \"targetName\": \"test\" }" | config | verified | nx.json:26-30 — the workspace registers a plugin in exactly this shape, `@nx/playwright/plugin` with `options.targetName: e2e` |
| "`nx add @nx/jest` does NOT create `jest.preset.js`" | feature | unverifiable | jest.preset.js is absent at the repository root and @nx/jest is not installed (package-lock.json:6735 lists it only as an optional peer of @nx/eslint); an `nx add @nx/jest` run would settle it |
| "Both `@nx/jest/plugin` and `@nx/vite/plugin` (which infers Vitest targets) coexist without conflicts" | feature | unverifiable | nx.json:25-32 registers neither plugin, so coexistence is untested in this workspace; a workspace with both plugin entries would settle it |
| "`pnpm add -wD jest ts-jest @types/jest @nx/jest`" | command | unverifiable | package-lock.json:3 — this workspace resolves with npm (lockfileVersion 3) and lists no jest dependency, so the pnpm form does not apply here; an npm install of the same set would settle the intent |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Dest: CNW ts preset (Nx 23)" | status | verified | package-lock.json:13986 — nx is installed at 23.3.0, matching the Nx 23 destination this iteration scenario logs |
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | feature | unverifiable | package.json:28-49 lists no @nx/next dependency and no next.config.* exists at the root; a Next.js fixture would settle the inferred target list |
| "Both `@nx/next/plugin` and `@nx/vite/plugin` can coexist in `nx.json`" | feature | unverifiable | nx.json:25-32 registers a single plugin entry, so coexistence is untested here; an nx.json carrying both entries would settle it |
| "Next.js detects missing `@types/react` during `next build` and tries to install it using `yarn add`" | feature | unverifiable | no Next.js project or build exists in the repo; a `next build` inside a pnpm workspace would settle it |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`" | config | verified | package.json:28-49 — neither `turbo` nor `eslint-plugin-turbo` is a dependency, and a repo-wide search finds no turbo.json, so the Turborepo-free target state already holds |
| "If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs` that projects extend, merge the config packages into these root configs" | config | unverifiable | tsconfig.base.json and eslint.config.mjs are both absent at the repository root (only a tsconfig.json with no `extends` or `paths`), so this branch has no subject; a Turborepo source imported into a dest with root configs would settle it |
| "Run workspace validation (`nx run-many -t build lint test typecheck`) to confirm nothing broke" | command | unverifiable | nx.json:25-32 configures no lint target and package.json:7-25 runs checks through hand-written npm scripts, so the same command exercises a different set here; `npx nx show project angular-ai-devtools --json` would settle which targets exist |
| "**`@repo/eslint-config`** (or similar) — ESLint config files and all ESLint plugin dependencies" | config | unverifiable | package.json:28-49 contains no `@repo/*` workspace package and the repo has no eslint config to distribute; a Turborepo source would settle the config-as-package pattern |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`" | config | unverifiable | nx.json:25-32 registers no @nx/vite/plugin and package.json:28-49 has no @nx/vite dependency; `npx nx show project <name> --json` in a Vite workspace would settle the default |
| "React Router 7 outputs to `build/` (not `dist/`)" | feature | unverifiable | no react-router dependency or config exists in this Angular workspace (package.json:28-49); a React Router 7 import would settle the output directory |
| "React 18 (source) + React 19 (dest): pnpm may hoist mismatched `react-dom`" | config | unverifiable | package.json:28-49 lists no react or react-dom dependency, so no hoisting mismatch is possible here; a React import plus `pnpm install` would settle it |
| "Some generated Vue ESLint configs omit `vue-eslint-parser`" | feature | unverifiable | no Vue project or ESLint config exists in the repo (package.json:28-49); a Vue import would settle the generated-config shape |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Install plugins `npx nx add <plugin>`. Example: `npx nx add @nx/react`." | command | verified | nx.json:25-32 and package.json:37 — a plugin registered in the `plugins` array beside `@nx/playwright` 23.3.0 in devDependencies is the two-part registration `nx add` performs |
| "List plugins: `npx nx list`" | command | unverifiable | node_modules is absent in the sidecar and no `nx list` output is checked in; running `npx nx list` from the workspace root would settle it |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Look at the package.json or lockfile to determine which package manager is in use" | structure | verified | package-lock.json:3 — an npm lockfile (lockfileVersion 3) sits at the root and no pnpm-workspace.yaml exists, so package.json plus lockfile do identify npm here |
| "`nx run <project>:<task>`" | command | verified | package.json:17 — `test:app` invokes `npx nx run angular-ai-devtools:test`, the exact `<project>:<task>` form |
| "It contains a `targets` section which has information about targets that can be run" | command | unverifiable | no captured `nx show project` output exists in the repo; running it against angular-ai-devtools would settle the `targets` key |
| "`--parallel` to control the number of parallel processes (default is 3)" | config | unverifiable | nx.json carries no parallelism setting; `npx nx run-many --help` would settle the documented default |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`targetDefaults` - Default configuration applied to all targets of a given name" | config | verified | nx.json:3-6 — `targetDefaults.build.cache` is `true`, a default keyed by target name |
| "`plugins` - Nx plugins and their configuration" | config | verified | nx.json:25-31 — a `plugins` array holds `@nx/playwright/plugin` with `options.targetName` `e2e` |
| "returns the full resolved config including inferred targets from plugins" | feature | verified | nx.json:27-29 — the playwright plugin declares `"targetName": "e2e"`, and apps/angular-ai-devtools-e2e/project.json:10 leaves `"targets": {}` empty, so `e2e` can only be inferred |
| "Do NOT read `project.json` directly - it only contains partial configuration" | structure | verified | apps/angular-ai-devtools-e2e/project.json:10 — `"targets": {}` while the `e2e` target comes from the plugin at nx.json:29 |
| "`node_modules/nx/schemas/project-schema.json`" | structure | verified | apps/angular-ai-devtools-e2e/project.json:3 — `"$schema": "../../node_modules/nx/schemas/project-schema.json"` |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx show projects --affected --exclude="*-e2e"`" | command | verified | apps/angular-ai-devtools-e2e/project.json:2 — the workspace's e2e project is named `angular-ai-devtools-e2e`, which the `*-e2e` glob matches |
| "`nx show projects --affected --type app`" | command | verified | apps/angular-ai-devtools-e2e/project.json:4 — `"projectType": "application"` is the field `--type app` selects on |
| "`nx show projects --affected --base=main`" | command | verified | git branch listing in this checkout — both `main` and `remotes/origin/main` exist as base refs for `--base=main` and `--base=origin/main` |
| "Affected between two commits ... `--base=abc123 --head=def456`" | command | verified | git log at HEAD — commits are full 40-hex SHAs (`337047455bae67f5e05ccf25ecd0909b0c9bf448`), the form `--base`/`--head` take |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | status | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:11 — "Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run." |
| "`state` records each instance's backend, requested backend and performance class in `state.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:256 — `deps.write(join(evidence, 'state.json'), JSON.stringify(states, null, 2))` |
| "`model-init` records the init timings and answer in `model-init.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/model-init.mjs:47 — the artifact path is `join(evidence, 'model-init.json')` |
| "`error-explainer` records each instance's panel result and state in `error-explainer.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs:157 — `join(evidence, 'error-explainer.json')` |
| "the check exits 2 for an instance serving another checkout's folder" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:10 — "build makes the check exit 2." |
| "Standalone, against instances started by hand" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:11 — the usage comment takes `--evidence`, `--url` and an optional `--extension`, so each check runs without a verify driver |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check's header comment holds its claim, the feature it covers, its usage and the files it writes" | structure | verified | .commandcode/skills/verify-angular-devtools/checks/extension-enabled.mjs:6-7 — the header gives the usage line and names the file it writes |
| "`extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | .commandcode/skills/verify-angular-devtools/checks/attached.mjs:9 and checks/coexist.mjs:11 — the headers name `attach.json` and `coexist-result.json` as their write targets |
| "With `--di-graph` it runs `angular:di_graph` last and records whether the template node is lost, without judging it" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:77 — `deps.control(diGraph ? ['coexist', '--di-graph'] : ['coexist'])`; :86 stores `templateLostInPane` as data |
| "`coexist --di-graph` leaves the page's signal graph broken until reload" | feature | verified | research/05-spikes.md:129 — after one `angular:di_graph` execution the pane drops to 2 nodes and DevTools stays degraded for the rest of the page's life |
| "`templateLostInPane: true` is the known Angular bug (`research/05-spikes.md`), not a check failure" | status | verified | research/05-spikes.md:129 — measured `diGraphTemplateLostInPane: true` and `diGraphTemplateLostInNg: true` after one `angular:di_graph` run |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin 0.0.7 declared and installed" | config | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:3 — "every setup fact it reads (the exact pin 0.0.7 declared and installed" |
| "`call navigate` without `--confirm` is refused (exit 2 with its `refused: navigate ... --confirm` reason)" | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/read-only.mjs:3-4 — refused by control-pangular-inspector, "exit 2, `refused: navigate ... pass --confirm`" |
| "`read-only.mjs` takes `--out` only" | command | verified | .commandcode/skills/verify-pangular-inspector/checks/read-only.mjs:8 — the usage line names `--out` and no `--session`, unlike live-reads.mjs:10 |
| "artifacts: `{up.evidenceDir}/contract-list.png` and `{up.evidenceDir}/live-reads.json`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:11 — "Writes: before.yml, after.yml, contract-list.png, doctor.json, one JSON per read, live-reads.json." |
| "`setup` needs no setup or teardown ... artifact `setup-check.json`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:8 and :78 — writes `setup-check.json` from one control call, so it starts nothing to tear down |
| "`tools-list.json` and `navigate-refused.json` for `read-only`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/read-only.mjs:9 — "Writes: tools-list.json, navigate-refused.json." |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular unit-test builder is pinned to include only **/*.spec.ts" | config | verified | apps/angular-ai-devtools/project.json:113-119 — the test target runs the @angular/build:unit-test executor with options.include set to exactly **/*.spec.ts |
| "tsconfig.spec.json excludes src/**/*.node.test.ts" | config | verified | apps/angular-ai-devtools/tsconfig.spec.json:13-16 — the exclude array lists src/**/*.node.test.ts and src/**/*.node.spec.ts |
| "node:test suites are named *.node.test.ts and run with node --experimental-strip-types --test" | command | verified | apps/angular-ai-devtools/src/app/interop-slice.node.test.ts:1 — import { test } from 'node:test'; package.json:15 runs node --experimental-strip-types --test over the suites |
| "signals (including signal inputs) and zoneless" | feature | verified | package.json:51-60 — the runtime dependency list carries no zone.js, so nothing loads the zone polyfill the doc counts as legacy |
| "Features should be Angular-only with no third-party packages; specifically excludes Vitest ... and RxAngular" | status | verified | package.json:51-60 — runtime dependencies are only @angular/*, rxjs and tslib; vitest appears only under devDependencies (package.json:48) |
| "Signal Forms (@angular/forms/signals) is the target forms API" | feature | unverifiable | grep of apps/angular-ai-devtools/src for @angular/forms/signals returned no match; the claim is about the Insurance Portal, a repository not present in this tree |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "say modern Angular pattern and modern Angular feature; never blessed or ordained" | feature | verified | docs/feature-proposals.md:594 — records the applied wording rule that design docs, the panel, prompts and code all say modern Angular pattern |
| "neither word may appear in DevTools code, UI or runtime text" | status | verified | grep of extension/, packages/ and apps/angular-ai-devtools/src for blessed and ordained returned no match |
| "provideAiDevTools() not provideAiDevtools()" | feature | verified | packages/ai-devtools-companion/src/index.ts:25 — export function provideAiDevTools(): Provider[] is the shipped spelling |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the page, content scripts, and service worker never host LanguageModel" | integration | verified | apps/angular-ai-devtools/src/app/extension-prompt.service.ts:38-39 — the only LanguageModel access is the panel service reading globalThis.LanguageModel; grep of extension/*.js (background.js, relay.js, agent-main.js, stale-view-worker.js) found none |
| "The MAIN-world script is limited to reading the page (ng.ɵsetProfiler, ng.ɵgetSignalGraph)" | integration | verified | extension/manifest.json:29-38 — agent-main.js is the only content script declared with world MAIN; extension/agent-main.js:84-88 feature-detects ng.setProfiler and ng.getSignalGraph |
| "A Worker must not call LanguageDetector or Translator itself" | integration | verified | grep of extension/ and apps/angular-ai-devtools/src found no LanguageDetector or Translator reference at all, so the worker path (extension/stale-view-worker.js) forwards nothing itself |
| "Removing panel/** from web_accessible_resources is conditional" | config | verified | extension/manifest.json:1-57 — no web_accessible_resources key remains in the manifest; the panel is reached through devtools_page (manifest.json:51) |
| "per-package secondary entry points such as provideAiNgrxDevTools()" | structure | aspirational | packages/ holds only ai-devtools-companion with a single src/index.ts:25 exporting provideAiDevTools; no secondary entry point and no provideAiNgrxDevTools exists yet |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "standardized test and typecheck npm scripts, with test running via node --test and typecheck via tsc --noEmit" | config | stale | package.json:6-26 — test exists (line 15, node --experimental-strip-types --test) but the scripts block has no typecheck entry; type checking runs as tsc -p tsconfig.json inside check (package.json:7) |
| "Prefers .mjs (ESM) script format with node: protocol imports for plain JavaScript Node.js scripts in scripts/" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:5 — import from node:child_process, in a scripts/ directory of .mjs files |
| "prefer Nx executors (e.g. @nx/angular:* or @angular/build:dev-server) instead" | config | verified | apps/angular-ai-devtools/project.json:100-102 — the serve target uses the @angular/build:dev-server executor, not an nx:run-commands node script |
| "verify with nx test angular-ai-devtools --include=<path>" | command | verified | apps/angular-ai-devtools/project.json:117-119 — the test target declares the include option the flag maps to; package.json:17 runs npx nx run angular-ai-devtools:test |
| "start AI browser instances only through control-ai-browsers up, which adds the Edge sign-in and sync switches" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:816 — documents that up adds the registry common switches plus the browser browserArgs, on Edge the sign-in and sync switches |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gitignore .playwright-cli/ and scrub any .playwright-cli/ files from Git history" | config | verified | .gitignore:1 — .playwright-cli/ is ignored, and git ls-files .playwright-cli* returns nothing, so no such file is tracked |
| "shared project settings stay committed in .commandcode/settings.json, while personal/machine-specific config such as permission rules goes in a gitignored .commandcode/settings.local.json" | config | verified | .gitignore:18 ignores .commandcode/settings.local.json, while git ls-files lists .commandcode/settings.json as tracked and settings.local.json as untracked |
| "Pair every tool, fixture or runtime the project adopts with a control-{name} skill and a verify-{name} skill" | structure | stale | .commandcode/skills holds control-angular-dev-app and control-vitest-browser-angular with no verify- counterpart, while verify-ai-browsers, verify-angular-devtools and verify-pangular-inspector do exist |
| "control-ai-browsers up <name> --no-ai-features" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2774-2777 — --no-ai-features resolves the feature list to an empty array for the launch |
| "Keep spikes/ and research/ in the repository; do not archive them" | structure | verified | git ls-files lists research/00-browser-probe.md as tracked and spikes/ is present in the working tree, so neither is archived away |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json:47 — `"typescript": "6.0.3"` under `devDependencies` |
| "Checks: `npm run check` (type check, root and skills) and `npm test` (node:test, root and skills)" | command | verified | package.json:7 — `check` chains `tsc -p tsconfig.json` and `npm run check:skills`; package.json:15 — `test` runs `node --experimental-strip-types --test` |
| "`toSignal(this.subject)` at line 14 and an unlabelled `effect` whose body calls `subject.error(...)` at line 22" | structure | verified | spikes/ng222-app/src/app/stale-view-fixture.ts:14 — `readonly signal = toSignal(this.subject);`; :22 — `this.subject.error(new Error('interop'));` |
| "`.claude/skills/` holds byte copies of them" | structure | verified | byte comparison of the pairs — .commandcode and .claude `verify-ai-browsers/SKILL.md` are both 15326 bytes and identical, `control-ai-browsers/SKILL.md` both 50500 and identical; `verify-angular-devtools/SKILL.md` differs (6309 vs 6284 bytes), the older-copy drift the same rule records |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:14`)" | structure | stale | apps/angular-ai-devtools/src/app/app.routes.ts:14 declares the `loadPanelDemo` arrow function; the `interop` route is declared at :24 as `{ path: 'interop', ... }` |
| "GLM-5.3 Flash for `reviewer`, `skeptic` and `review_panel`" | config | stale | .project/model-policy.json:4-7 — the panel roles are `reviewer_panel_beam`, `reviewer_panel_glyph`, `reviewer_panel_glm` and `gap_review`; no role is named `reviewer`, `skeptic` or `review_panel` |

## Doc: LESSONS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`extension/overlay.js:507` registers `attachInput(window, 'click', onClick, true)`" | integration | verified | extension/overlay.js:507 — `attachInput(window, 'click', onClick, true);`, the one click listener anywhere under extension/, taken through the wrapper at :440 |
| "`attachInput` (`:440`) is the wrapper that calls `addEventListener`" | structure | verified | extension/overlay.js:440 — `function attachInput(target, type, handler, capture) {`, whose body registers at :443 with `target.addEventListener(type, handler, useCapture);` |
| "`onClick` (`:356`) returns unless `armed`, then `preventDefault`s and locks the element" | feature | verified | extension/overlay.js:356 — `function onClick(event) {`, whose first statement at :357 returns while the picker is not armed or an element is already locked, with `event.preventDefault()` at :360 and `lock(element)` at :362 |
| "Corrected in `research/raw/m049-streams.json` at `74d00e63`" | structure | verified | research/raw/m049-streams.json:23 — the correction note names overlay.js at :507, attachInput at :440 and onClick at :356; `git cat-file -t 74d00e63` answers `commit` |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | status | stale | .commandcode/skills holds `control-angular-dev-app` but no `verify-angular-dev-app`; the only verify skills are verify-ai-browsers, verify-angular-devtools and verify-pangular-inspector, seven in total across the four families |
| "upstream bugs go to `docs/filing-ledger.md`" | status | verified | docs/filing-ledger.md:3 — "Drafts for Lars to file if and when he chooses. Claude files nothing."; :7 — "Status: draft, not filed." |
| "added `.audit/` (local briefs and todos) to `.gitignore`" | config | verified | .gitignore:15 — `.audit/` |
| "Research `research/00`-`10`" | structure | verified | research/ holds research/00-browser-probe.md through research/10-model-capabilities.md, eleven files |
| "Lars's rulings, verbatim: `docs/feature-proposals.md` section 8, "Rulings from Lars"" | structure | verified | docs/feature-proposals.md:1038 — `## 8. Decisions for Lars`, the section holding the rulings |
| "Only the four standing per-model instances run, each on one blank tab" | status | unverifiable | the instances run outside the checkout; only `control-ai-browsers instances` on a live machine would settle it, and this audit runs without a browser |

## Doc: docs/autonomy-gaps.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ten stops recorded first-hand in the M017 run" | status | verified | docs/autonomy-gaps.md:21-164 — ten `## Gap —` headings sit between the introduction and the closing "What this document does not prove" section |
| "G1 prompt pin: the orchestrator prompt forbids reading %ERRORLEVEL% and names the helper JSON and $LASTEXITCODE" | structure | verified | scripts/autonomy-gaps.test.mjs:145 — the test carries that exact title, one of nine G-rules at :145-268 |
| "P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails" | structure | verified | scripts/user-scope-autonomy.test.mjs:733 — the test carries that exact title |
| "E6 queue numbers stay unique, increasing and bound to their items" | structure | verified | scripts/docs-audit-disposition.test.mjs:659 — the test carries that exact title |
| "G9 static pin: the chromium reading survives a checkout with no playwright install" | structure | verified | scripts/autonomy-gaps.test.mjs:268 — the test carries that exact title, so the recorded reading is pinned by a rule |
| "a clean verify sidecar carries no `node_modules`" | status | verified | this audit's own sidecar — a `Test-Path` of node_modules at the sidecar root returns False |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "27 lessons follow the five phases of Angular's CLI tutor (`research/02` section 4.4)" | feature | verified | research/02-angular-surface.md:236 — the CLI tutor's "Curriculum has five phases: fundamentals, state and signals, component architecture, advanced features, Signal Forms" |
| "TS5 ... Rewriter and Translator work in the DevTools panel ... Rewriter `available` in all four browsers" | status | verified | research/20-built-in-ai-without-flags.md:43 — the panel-started dedicated-worker row reports Writer and Rewriter `available` in all four browsers |
| "TS12 ... Whether a dedicated Worker from the panel exposes the Prompt API" | status | stale | research/20-built-in-ai-without-flags.md:49 — "A worker started by the panel is the one place besides the panel itself where the Prompt API works without flags in all four browsers", so the tutor still lists as untested a question already answered |
| "Riskiest first: TS1 and TS2 ... then TS4 ... then TS8" | feature | verified | docs/feature-proposals.md:1000 — the same order is restated there: "TS1 and TS2, then TS4, then TS8" |
| "N27 \| Angular AI DevTools Tutor" | structure | verified | docs/feature-proposals.md:747 — the N27 row of the features table carries the same one-line description, and :840 gives N27 its own section |
| "the model rewords shipped text to levels 1-10 and explains the gap between prediction and observation from a fact sheet of about 400 tokens, with no tools" | feature | verified | docs/feature-proposals.md:771 — "The model receives a fact sheet of about 400 tokens per call, with no tools" |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "**Supported apps.** Angular 22.2 in development mode" | config | verified | spikes/ng222-app/package.json:18 — `"@angular/core": "^22.2.0"`; :28 — `"@angular/build": "^22.2.2"` |
| "Chrome Beta with Gemini Nano (9333) and with Gemma 4 (9334), and Edge Dev with Aion (9335)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70, :101, :135 — the three `port` values in that order |
| "Edge stable with Phi-4-mini (9337)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:173 and :190 — `edge-phi4mini` is port 9337 with model `Phi-4-mini-instruct` |
| "The 9337 port is in `.claude/skills/control-ai-browsers/instances.json`; 00's table still lists the retired Edge Dev instance on 9336" | config | verified | the .claude registry exists and carries 9337; the registry's instance ports are 9333, 9334, 9335, 9337 and 9338, so no 9336 instance remains |
| "`spikes/s1-extension` (retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`)" | status | verified | spikes/ holds only ng222-app, ng222-ssr and probes; .project/archive/001-run-unrun-spikes exists |
| "Twelve small spikes, one per question, in `docs/design/tutor.md` section 10" | structure | verified | docs/design/tutor.md:661 — `## 10. Risks and spikes` holds the TS1-TS12 table at :667-678, twelve rows |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`angular:di_graph` AI tool creates a `ViewContainerRef` on every component host, after which `ng.ɵgetSignalGraph` loses the template consumer" | feature | verified | research/05-spikes.md:129 — after one `angular:di_graph` run the pane drops to 2 nodes (`count`, `effect`) and the template node is gone, matching the `ng` call |
| "Found 2026-10-11 during spike S2 (`docs/feature-proposals.md` section 7)" | structure | verified | docs/feature-proposals.md:998 is `## 7. Spikes`; :1005 is the S2 row, which records that the spike "turned up the `di_graph` side effect" |
| "Status: draft, not filed" | status | verified | docs/afk-run-2026-10-12.md:19 — the run's gates hold "no push, PR, tag or filing (upstream bugs go to `docs/filing-ledger.md`)" |
| "Source read on the `22.2.x` branch" | structure | unverifiable | Angular's own source tree is not in this checkout; only a read of the `22.2.x` branch in an Angular checkout would settle it |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Generation 1 — twelve milestones, full ROADMAP entry format" | structure | verified | plans/angular-ai-devtools-program-backlog.md:90 heading, then twelve `###` milestone entries: M018 at :95 through M029 at :200 |
| "one root, programmes, generations" | structure | verified | plans/angular-ai-devtools-program-backlog.md:99 — each milestone entry carries a `Programme:` label (`Programme: core · Batch: 1 · Group: cross-package`), the label form the delivery structure promises |
| "Later generations - backlog, not roadmap entries" | structure | verified | plans/angular-ai-devtools-program-backlog.md:208 heading with generations 2-7 at :212, :220, :229, :263, :275, :284 — six, plus Generation 1 at :90 makes the seven programmes |
| "Of 14 verified checks, the eight AI-browser checks" | structure | verified | .commandcode/skills/verify-ai-browsers/checks holds exactly eight check modules — state, model-init, extension-panel, signal-provenance, di-doctor, error-explainer, stale-view and interop |
| "The bind (`gsd-path/M018`) — blocks every write to `CHARTER.md` and `ROADMAP.md`" | status | stale | .project/STATE.md:4-9 — the milestone is `console-read` (M045) at `phase: shipped`, `status: done`, branch `gsd-path/M045`, so the M018 bind closed long ago |
| "M040 is `build/active` (`gsd-path/M040`, `performance-narrator`)" | status | stale | .project/STATE.md:4-9 — M045 `console-read` is shipped and bound, a later milestone than M040 |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The browser instance registry is `.claude/skills/control-ai-browsers/instances.json`" | structure | verified | that path exists in this checkout, and the maintained .commandcode copy at .commandcode/skills/control-ai-browsers/instances.json:67-229 holds the same five instance entries |
| "chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70, :101, :135, :173, :201 — the five `port` values, in the order the handoff names them |
| "eleven drafts (the eleventh, the `LanguageDetector`/`Translator` worker crash, is at `docs/filing-ledger.md:230`" | structure | stale | docs/filing-ledger.md:230 is a blank line; the eleventh draft heading `## 11.` is at :265, and the ledger's eleven `##` drafts run :5 to :265 |
| "Design doc: `docs/design/tutor.md` (N27, Angular AI DevTools Tutor)" | structure | verified | docs/design/tutor.md:1 — `# Angular AI DevTools Tutor (N27): design` |
| "The companion package exports `provideAiDevTools()`, `provideAiNgrxDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxSignalsDevTools()`" | feature | stale | packages/ai-devtools-companion/src/index.ts:25 — `provideAiDevTools()` is the only provider exported; neither index.ts, facade.ts nor package.json declares an Ngrx, Router or Signals provider |
| "Sections: 1 summary, 2 facts, 3 architecture ... 4 features N1-N37, 5 promptified Angular DevTools, 6 ecosystem ..., 7 spikes S1-S23, 8 decisions plus "Rulings from Lars", 9 not checked" | structure | verified | docs/feature-proposals.md:39, :117, :298, :571, :852, :883, :998, :1038, :1125 — the nine numbered `##` sections in that order |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Panel initial-bundle budget is **520 KB** (`project.json`, `build-extension`)" | config | verified | apps/angular-ai-devtools/project.json:82 — the `build-extension` target's initial budget sets `"maximumWarning": "520kb"` |
| "Generation 1 is twelve milestones in full roadmap format" | structure | verified | plans/angular-ai-devtools-program-backlog.md:90 — the heading names twelve milestones, and M018 at :95 through M029 at :200 are the twelve entries |
| "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`" | status | verified | that archive directory exists in this checkout and holds the milestone's own audit at .project/archive/018-instrument-core/research/DOCS-AUDIT.md |
| "HEAD `b165ae2a6b55c7a135a2d83de9ff58da9080651a`" | status | verified | `git cat-file -t b165ae2a6b55c7a135a2d83de9ff58da9080651a` returns `commit` in this checkout |
| "base after bind `88274697e47c5bfe5ea858e0b07ea7b0fd5e398b`" | status | verified | `git cat-file -t 88274697e47c5bfe5ea858e0b07ea7b0fd5e398b` returns `commit` in this checkout |
| "AR-2: no Angular in the inspected page; the overlay is plain DOM in a closed Shadow DOM" | feature | verified | extension/overlay.js:61 — `host.attachShadow({ mode: 'closed' })`; extension/overlay.test.mjs:1603 asserts exactly one `attachShadow` call site in that file |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`chrome-beta-nano` serves the same `v3Nano` model as `chrome-stable-nano`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:90 and :221 — both registry entries declare `"name": "v3Nano"` |
| "`chrome-beta-gemma4` (Gemma 4)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:124 — the instance's model name is `gemma4-2b-it` |
| "`edge-phi4mini` (Phi-4-mini)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:190 — the instance's model name is `Phi-4-mini-instruct` |
| "Ports 9333-9338 belong to the shared instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70 (`chrome-beta-nano`, 9333) through :201 (`chrome-stable-nano`, 9338) — the registry's instance ports all sit inside that range |
| "`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:253`" | config | stale | .commandcode/skills/verify-ai-browsers/checks/state.mjs:321 — `timeout: 600000` is there; :253 is `const states = picked.map((n) =`, not a spawn option |
| "`timeoutMs` 1800000 for the `extension-panel` step and 900000 for `state` (`...SKILL.md:49,71`)" | config | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:49 — `timeoutMs` 1800000; :72, inside the bullet that opens at :71 — 900000 |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "names the base model to load (`edge_base_model`)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:164 — edge-dev-aion's `asset` is `^edge_base_model$` |
| "`--disable-component-update` stays on, so the updater cannot replace it again" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:148-150 — edge-dev-aion's `args` is exactly `["--disable-component-update"]` |
| "the pin also holds the manifest component (`EdgeOptimizationGuideModelsManifest`)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:151-155 — `pin` lists `EdgeLLMOnDeviceModel`, `EdgeLLMRuntime` and `EdgeOptimizationGuideModelsManifest` |
| "the restore on `up` covers both" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1493 — `up` on a stopped instance with a pin "makes its pinned component roots hold the pinned versions again" |
| "`model pin`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1415 — the corrupt-pin error tells the user to run `model pin` again; :1447 documents the two-rename swap a pin performs |
| "`.claude/skills/` holds a byte-identical copy of it, which `node --test scripts/skills-mirror.test.mjs` enforces" | structure | verified | byte comparison — .commandcode and .claude `control-ai-browsers/SKILL.md` are both 50500 bytes and identical; `scripts/skills-mirror.test.mjs` is present at the cited path |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "read-throughput.ps1 reads 1 GB sequentially in 4 MB blocks with FILE_FLAG_NO_BUFFERING" | feature | verified | spikes/probes/read-throughput.ps1:1 � comment states cache bypass via FILE_FLAG_NO_BUFFERING; line 6 sets $block = 4MB and line 3 defaults [int]$Megabytes = 1024 |
| "With a tool whose schema has at least one required property (get_component_count {scope: string})" | feature | verified | spikes/probes/probe9.js:6 � the tool declares inputSchema properties scope (string) and required: ['scope'] |
| "stored class seeded to 2 with the profile closed (spikes/probes/seed-perf-class.mjs)" | config | verified | spikes/probes/seed-perf-class.mjs:1 � seeds optimization_guide.on_device.performance_class in a closed profile Local State; line 12 writes the class |
| "Chrome Beta 156, added: prompt-api-tool-use@1, gemma4-for-built-in-ai@1, and webmcp-testing@1" | config | verified | spikes/probes/enable-flags.mjs:5-8 � the Chrome Beta Local State target adds exactly those three flag strings |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the shipped driver reads c.callID ?? c.callId (control.mjs:1424-1430)" | structure | stale | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1424 � that line is inside a pin-validation refuse() message; c.callID ?? c.callId is at control.mjs:1938, so the cited line range has drifted |
| "When tools is given, expectedOutputs must include { type: "tool-call" } and expectedInputs must include { type: "tool-response" }" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1879 � the LanguageModelTools health check calls availability with expectedInputs [{type:text},{type:tool-response}] and expectedOutputs [{type:text},{type:tool-call}]; line 1922 uses the same pair for the tool session |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "measured on the insurance portal, which loads zone.js (spikes/probes/zone-mode.js, research/raw/zone-mode-portal.json, commit 8e057fc)" | structure | verified | git -C the sidecar root log -1 8e057fc = fix(skills): read change detection mode from the NgZone provider record; research/raw/zone-mode-portal.json and spikes/probes/zone-mode.js both exist |
| "the last NgZone record decides [measured, research/raw/zone-mode-portal-zonejs.json; 3da10e3]" | structure | verified | git -C the sidecar root cat-file -t 3da10e3 = commit, and research/raw/zone-mode-portal-zonejs.json is present in the tree |
| "ng.getDirectiveMetadata(...) returns changeDetection: 0 (OnPush) for a component that declares none" | feature | unverifiable | spikes/ng222-app/src/app/counter.ts:8-9 declares @Component with only a selector and no changeDetection, but no recorded ng.getDirectiveMetadata output exists outside the doc; a run recording that call would settle it |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "framework core, registered from registerAiTools() on platform creation in dev mode; see 02-angular-surface.md section 1.5" | integration | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2111 � the page-side probe dispatches a CustomEvent('devtoolstooldiscovery') and then runs the tool named 'angular:di_graph', so the tool group and event name are real in this repo |
| "Superseded: the browsers expose WebMCP on document.modelContext; navigator.modelContext is undefined" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1886 � records typeof document.modelContext and typeof navigator.modelContext separately for the WebMCP canary |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Target: an Angular 22.2 dev-mode app" | config | verified | spikes/ng222-app/package.json:18 � the fixture pins @angular/core: ^22.2.0 |
| "API server defaults to port 63315 (docs)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:150 � comment says Vitest's default 63315 is inside a Windows excluded port range on this machine |
| "vitest.dev/guide/browser (header v5.0.3)" | config | verified | spikes/ng222-app/package.json:32-36 � @vitest/browser, @vitest/browser-playwright and vitest are all pinned to 5.0.3, matching the doc version |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "chrome-beta-gemma4 (port 9334): gemma4-2b-it GPU, available" | config | verified | .claude/skills/control-ai-browsers/instances.json:101 � the registry entry for that instance carries port: 9334 |
| "the corrected grader (9c1b585)" | status | verified | git log -1 9c1b585 = fix(spikes): stop the benchmark grader matching app-counter as count |
| "916fc09 fixed the dependency check again" | status | verified | git log -1 916fc09 = fix(spikes): require the dependency answer to name double, and regrade saved runs |
| "Raw files: research/raw/bench/nano.json (Nano on CPU), gemma4.json, aion.json and phi4mini.json" | structure | verified | all four paths exist in the tree: research/raw/bench/nano.json, gemma4.json, aion.json, phi4mini.json |
| "Evidence: research/raw/s16-meta-lookup.json" | structure | verified | research/raw/s16-meta-lookup.json exists in the tree |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "components.md \| 3422" | structure | verified | D:/projects/github/angular/skills/angular-developer/references/components.md is 3422 bytes and its line 79 reads: the "track" expression is required for performance and DOM reuse |
| "resource.md \| 2696" | structure | verified | Get-Item on D:/projects/github/angular/skills/angular-developer/references/resource.md reports Length 2696 |
| "effects.md \| 2777" | structure | verified | Get-Item on D:/projects/github/angular/skills/angular-developer/references/effects.md reports Length 2777 |
| "commit 747c3c2 (message release: cut the v22.1.0-next.4 release, 2026-07-01)" | status | verified | git -C D:/projects/github/angular/skills log -1 747c3c2 = b126dc9 release: cut the v22.1.0-next.4 release |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "one fresh session per variant [measured, n=1 per variant, research/raw/tool-name-matrix-gemma4-gpu.json]" | structure | verified | research/raw/tool-name-matrix-gemma4-gpu.json exists in the tree |
| "tool names are lowercase (snake_case recommended for readability)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1924 � the shipped tool session declares tools: [{ name: "get_component_count", ... }], a lowercase snake_case name, and the round trip at 1938-1944 returns the tool result |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Foreign components use symbols RENDER, ON_DESTROY, CONTENT_ADAPTER, GET_CONTEXT (interface/foreign_component.ts:10-19)" | structure | verified | D:/projects/github/angular/angular/packages/core/src/interface/foreign_component.ts:19 contains GET_CONTEXT, inside the declared symbol block the doc cites |
| "part one of isLoading, value, extRequest, stream, state, status" | feature | verified | extension/linked-state.js:16 � comment names the "Resource.loadEffect" producer and the linkedSignal labelled "Resource.extRequest", matching the Resource dot-part label shape |
| "the mark is set only by the public provideZonelessChangeDetection()" | feature | verified | .commandcode/skills/control-angular-dev-app/SKILL.md:293 � "Neither fixture gets the NgZoneless mark (it is set only inside provideZonelessChangeDetection())" |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The device is unable to create a session to run the model. Please check the result of availability() first." | status | verified | docs/filing-ledger.md:124 � the draft filing quotes the same rejection text on a LanguageModel.create() call with tool types |
| "In Chrome 156, Blink allows tool use only when the runtime feature AIPromptAPIToolUse is on" | feature | verified | docs/feature-proposals.md:392 � states that in Chrome 156 the tool types are gated by the Blink runtime feature AIPromptAPIToolUse, not by the model |
| "With AIPromptAPIToolUse alone, v3Nano kept serving and every tool-typed create() succeeded" | status | verified | research/05-spikes.md:155-160 � the separate Nano instance ran tool-session-matrix.js: every tool-typed create() succeeds and Nano answers in text instead of a tool call |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "grades Which signals does double in app-counter depend on? with a whole-word \bdouble\b / \bcount\b test" | feature | verified | spikes/probes/bench.js:64 - that question's ok() is a function testing /\bdouble\b/i.test(a) and /\bcount\b/i.test(a.replace(/app-counter/gi, '')) plus a negative list, exactly the whole-word form described |
| "Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335, Phi-4-mini on 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173 - chrome-beta-nano port 9333, chrome-beta-gemma4 port 9334, edge-dev-aion port 9335, edge-phi4mini port 9337 |
| "instances.json profilesRoot: .browsers" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:2 - "profilesRoot": ".browsers" at the top of the registry |
| "it now holds the CPU run, native 1/15, fallback 0/15" | status | verified | research/raw/bench/nano.json:1 - the file's native block records runPasses 1/15 (passAtK 1/5) and its fallback block records runPasses 0/15 (passAtK 0/5) |
| "the disk says Aion-1.1-Instruct" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:162 - the edge-dev-aion model name is Aion-1.1-Instruct, not the 1.0 the vendor page still names |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "That earlier Aion run used camelCase tool names, getComponentCount and getComponentInputs (probe5.js:15-16)" | feature | verified | spikes/probes/probe5.js:15-16 - the two LanguageModel tools are named getComponentCount and getComponentInputs |
| "available, contextWindow 9216; called get_component_inputs({selector: app-counter}), answered 3; 7.4 s, contextUsage 511" | feature | verified | research/s1-results/chrome-gemma4.json:169,173 - contextWindow 9216 and contextUsage 511 recorded for the DevTools panel context |
| "Doctor then showed the prompt_api_gemma4 use case as Not Supported and exited 1" | status | verified | research/s1-results/chrome-gemma4-crash-doctor.json:58-59 - the recorded useCase is prompt_api_gemma4 with state Not Supported |
| "get_component_count with a required parameter and with empty properties, and getcomponentcount, returned tool calls; getComponentCount and Get_component_count failed with kErrorUnknown" | feature | verified | research/raw/tool-name-matrix-gemma4-gpu.json:1 - five labelled variants: the two names with an uppercase letter record ERR UnknownError kErrorUnknown, the other three record a tool-call |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "on the standalone portal the root component's injector resolution path holds three environment injectors" | feature | verified | research/raw/zone-mode-portal.json:1 - the zoneTokens array lists environment injectors sourced Standalone[_AppComponent], Environment Injector and null, in that order |
| "the last NgZone record is useFactory instead of NoopNgZone" | feature | verified | research/raw/zone-mode-portal-zonejs.json:1 - one NgZone record is useClass fn:NoopNgZone and a later one on the same injector is useFactory fn:ngZoneFactory |
| "not supported; N10 flags it when detected" | feature | verified | docs/feature-proposals.md:673 - "### N10. Runtime lint, explained" is the proposal the support table hands every differs row to |
| "spike main.js:n = spikes/ng222-app/dist/ng222-app/browser/main.js line n in this repo" | structure | unverifiable | spikes/ng222-app has no dist directory in this sidecar, so the cited bundle line ranges (37258-37267, 37270, 23670-23674, 14555-14557) and the 968 ngDevMode count cannot be re-read here; the built bundle would settle them |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two optimus-ui incompatibilities are drafted in docs/filing-ledger.md (6 and 7), not filed" | status | verified | docs/filing-ledger.md:189 - item 6 is the optimus-ui pTextarea throw under Signal Forms formField; :219 - item 7 is the optimus-ui BaseInput formField type-check failure |
| "The app is zoneless (NgZone provider is NoopNgZone, research/raw/zone-mode-portal.json)" | feature | verified | research/raw/zone-mode-portal.json:1 - the Environment Injector's zoneRecords hold NgZone with useClass fn:NoopNgZone and the Zoneless enabled token useValue true |
| "N15 (Signal Forms doctor) has nothing to inspect on the portal today" | feature | unverifiable | docs/feature-proposals.md:762 defines N15 as reading FormField.state() per field, but the portal checkout the row describes (D:\projects\github\LayZeeDK\...) is not in this sidecar and apps/ holds only angular-ai-devtools, so the absence of Signal Forms on the portal cannot be re-checked here |
| "apps/insurance-portal/project.json:18 polyfills: [zone.js]" | config | unverifiable | this sidecar's apps/ holds only angular-ai-devtools and angular-ai-devtools-e2e, and there is no libs/ tree, so the polyfills entry has no readable source; the portal checkout would settle it |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the model is on-device, with a 7,168 (Aion) to 9,216 (Gemma 4, Nano, Phi-4-mini) token context window (2.1)" | config | verified | docs/feature-proposals.md:90 - "The context window is small: 7,168 tokens on Aion and 9,216 on the Chrome models and Phi-4-mini"; .commandcode/skills/control-ai-browsers/instances.json:166 records edge-dev-aion contextWindow 7168 and :128 chrome-beta-gemma4 contextWindow 9216 |
| "it generates no code of any kind (section 8)" | feature | verified | docs/feature-proposals.md:263 - "No code generated. The extension still generates no code (Lars's ruling 2:, section 8)" |
| "The registered tool names are ai_tutor, get_best_practices, list_projects, search_documentation, onpush_zoneless_migration, devserver.start, devserver.stop, devserver.wait_for_build and run_target, which matches 02 section 4.6" | feature | verified | research/02-angular-surface.md:251,255,257 - the Angular CLI MCP tool table lists ai_tutor, onpush_zoneless_migration and devserver.start / devserver.stop / devserver.wait_for_build with their source files |
| "139 rows in all" | status | unverifiable | the note says the count came from count.mjs in the session scratchpad, and no count.mjs exists in this sidecar; recounting the audited file would not be evidence outside it, so the script would settle it |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "One component's signal graph on the portal's /claim/create (ng-journal-create): 107 nodes, 171 edges" | feature | verified | research/raw/tosignal-node-portal.json:1 - 107 kind entries counted in the recorded graph; docs/feature-proposals.md:762 cites the same 107 nodes from the same file |
| "a worker started by the DevTools panel has all seven APIs" | status | verified | research/raw/20-built-in-ai-without-flags.json:204-207 - the workers block opens with panelWorker, and the doc it records reports all seven globals there |
| "docs/filing-ledger.md item 11" | status | verified | docs/filing-ledger.md:265 - item 11 is the LanguageDetector.availability() or Translator.availability() renderer crash in a dedicated worker |
| "spikes/s1-extension/, retired in M009; evidence and archived notes live under .project/archive/001-run-unrun-spikes/" | structure | verified | spikes/ holds only ng222-app, ng222-ssr and probes - there is no s1-extension directory - while .project/archive/001-run-unrun-spikes does exist |
| "node .claude/skills/control-ai-browsers/scripts/control.mjs attach chrome-beta-gemma4" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs is byte-identical to the .commandcode copy (both 137,286 characters) and that script implements the attach and detach subcommands (control.mjs:3154, control.mjs:3165) |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Routes (app.routes.server.ts): / RenderMode.Server, /prerender RenderMode.Prerender, /client RenderMode.Client" | structure | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - the three serverRoutes entries map path '' to RenderMode.Server, 'prerender' to Prerender and 'client' to Client |
| "Angular 22.2.2, standalone, zoneless, provideClientHydration() with no features, provideHttpClient(withFetch()), withComponentInputBinding()" | config | verified | spikes/ng222-ssr/src/app/app.config.ts:11-13 - provideRouter(routes, withComponentInputBinding()), provideHttpClient(withFetch()) and provideClientHydration() with no arguments |
| "Probes in spikes/probes/ssr-*.js" | structure | verified | spikes/probes holds ssr-hydration.js, ssr-transfer.js, ssr-event-replay.js, ssr-render-modes.js and ssr-defer.js |
| "documented, platform-browser.mjs:355-372" | structure | unverifiable | spikes/ng222-ssr has no node_modules in this sidecar, so the @angular/platform-browser and @angular/core line citations cannot be read; only the re-recorded research/raw/ssr-*.json outputs ship here |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "openBrowser() calls chromium.connectOverCDP(VITEST_CDP_URL) and sets persistentContext = browser.contexts()[0] (the default context)" | feature | verified | spikes/ng222-app/vitest-attach.config.mts:19-20 - openBrowser assigns this.browser = await chromium.connectOverCDP(cdpUrl) then this.persistentContext = this.browser.contexts()[0]; :42 turns prewarm off with prewarm() {} |
| "vitest 5.0.3, @vitest/browser 5.0.3, @vitest/browser-playwright 5.0.3, playwright 1.63.0, vitest-browser-angular 0.5.1" | config | verified | spikes/ng222-app/package.json:31-37 - those five versions are pinned exactly, with no caret range |
| "shows the next count in the same task as the click (fails on purpose), only with VITE_COUNTER_TIMING_DEMO=1" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:37-45 - the test is guarded by it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1') and reads the DOM in the same task as the click |
| "providers with { provide: CartService, useValue: { items: signal(['pear', 'plum']) } }" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:11 - the override provider is exactly that shape, and :32-34 renders with cartItems ['pear', 'plum'] expecting Clicks: 3 (double 6, cart 2) |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the control-ai-browsers skill relies on the ms* switches alone" | config | verified | .commandcode/skills/control-ai-browsers/SKILL.md:317-321 - the sign-in switches are the Edge browsers' browserArgs in instances.json and HKCU Edge policies are explicitly not used; the flags themselves are at instances.json:32 |
| "the real feature flags are msImplicitSignin, msProfileSignIn, msEdgeOSAccountInfoSubstrate" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:32 - the Edge --disable-features value begins msImplicitSignin,msImplicitSignInNetworkRetry,msProfileSignIn,msForceBrowserSignIn and includes msEdgeOSAccountInfoSubstrate later in the same list |
| "msBrowserSignin is not a real Chromium/Edge feature flag - the real policy is BrowserSignin" | config | unverifiable | no browser or registry state is recorded in this sidecar and the policy documentation is external; grep over instances.json and SKILL.md shows only the ms* feature switches, which neither confirms nor refutes the flag claim |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "DevTools panel page: works, create 4.3 s" | feature | verified | research/raw/19-languagemodel-contexts.json:5 - chrome-beta-nano panel hasLM true, availability available, createMs 4292, answer OK; :6 and :9 record 4525 ms and 8127 ms for the other Chrome pairs |
| "Hidden devtools.html page: refused" | feature | verified | research/raw/19-languagemodel-contexts.json:5-9 - every pair's devtoolsPage has availability unavailable with error Access denied because the Permission Policy is not enabled |
| "ExtensionPromptService now calls LanguageModel in the panel itself" | feature | verified | apps/angular-ai-devtools/src/app/extension-prompt.service.ts:38-43 - languageModel() reads (globalThis as { LanguageModel?: LanguageModelApi }).LanguageModel and the class is declared on line 43 |
| "recorded in plans/prompt-api-browser-pairs.afk.md" | structure | unverifiable | plans/ holds only angular-ai-devtools-program-backlog.md, angular-ai-devtools-proposals.handoff.md and gsd-path-handoff-M018.md; that .afk plan file is absent from this sidecar, so the decision record cannot be read |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "control-ai-browsers up --no-ai-features, which keeps only the Edge sign-in and sync switches" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2774-2777 - with --no-ai-features the launch substitutes an empty list for featuresFor(inst, backend); the Edge browserArgs switches are unaffected (instances.json:30-35) |
| "The crash also happens with the AI flags on ... Filing draft: docs/filing-ledger.md item 11" | status | verified | docs/filing-ledger.md:265 - item 11 is the LanguageDetector.availability() or Translator.availability() renderer crash in a dedicated worker, with the reproduction snippet at :277 |
| "on Edge only, an extension tab" | structure | verified | extension/panel/index.html exists as the extension tab document, next to extension/panel.html; research/raw/20-built-in-ai-without-flags.json:500 records the tabWorker block |
| "Dedicated worker started by the DevTools panel: all seven globals exist" | feature | verified | research/raw/20-built-in-ai-without-flags.json:204-207 - the workers block opens with panelWorker, the context the row describes |

## Doc: research/spikes/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Six documents written on 2026-11-08 for the owner's question recorded as **Q4**" | structure | verified | plans/angular-ai-devtools-program-backlog.md:400 — "### Q4 — spike: sourcemap plus a worker-side AST index"; research/spikes holds README.md plus exactly those six files |
| "`s13-answer.md` ... **answered** — 8 streams, 7 reachable with no app cooperation" | status | verified | research/spikes/s13-answer.md:4 — "Verdict: **answered** — 8 streams, 7 reachable with no app cooperation" |
| "that file is 3,352 bytes here and was 3,353 before `git add`" | structure | verified | research/spikes/s11-answer.md — `Get-Item -LiteralPath ... .Length` returns 3352 |
| "this repository carries `* text=auto eol=lf`" | config | verified | .gitattributes:1 — `* text=auto eol=lf` |
| "the six documents were moved from `.project/research/` to `research/spikes/`" | structure | verified | .project/research/ lists only DOCS-AUDIT.md and inspect-inventory.txt; the six named files exist only under research/spikes/ |
| "its prerequisite is an application-side build flag the portal does not set" | status | verified | research/spikes/s12-answer.md:11-12 — "the insight class is real but its prerequisite is an application-side build flag this application does not set" |

## Doc: research/spikes/capability-dependency-matrix.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`versionOlderThan(detectedVersion, 22, 1, 3)`" | feature | verified | extension/agent-main.js:511 — `if (detectedVersion && versionOlderThan(detectedVersion, 22, 1, 3)) {` |
| "`const SUPPORTED_MIN = { major: 22, minor: 1, patch: 3 };`" | config | verified | extension/stale-view-worker.js:12 — the same declaration verbatim |
| "'0.2202.0', the companion version both realms accept" | config | verified | extension/agent-main.js:182 — `var COMPANION_ACCEPTED_VERSION = '0.2202.0';`; packages/ai-devtools-companion/src/vetted.ts:14 — `export const PACKAGE_VERSION = '0.2202.0';` |
| "The extension currently performs **no network read at all**" | feature | verified | extension/*.js — a Select-String for `fetch\(`, `XMLHttpRequest` and `sourceMappingURL` across all 25 files returns 0 matches |
| "`NG0950` at `:245`, `NG6100` at `:290`" | structure | verified | extension/error-digest.json:245 — `"code": "NG0950",`; :290 — `"code": "NG6100",` |
| "portal run rendered **zero rows** — `AGENTS.md:214`" | status | stale | AGENTS.md:226 — "`di-doctor` rendered controls with zero rows"; AGENTS.md:214 is the 23-verdict-spec tally, not the zero-row record |

## Doc: research/spikes/instrumentation-free-coverage.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`extension/manifest.json:29-38` loads it at `document_idle`" | config | verified | extension/manifest.json:36 — `"run_at": "document_idle",`; :37 — `"world": "MAIN"`; :34 — `"agent-main.js"` |
| "The provider returns `[]` on purpose" | feature | verified | packages/ai-devtools-companion/src/index.ts:29 — `return [];` after the `isDevMode()` install at :26-28 |
| "The only import of the package anywhere in this repository is the fixture's dev config (`spikes/ng222-app/src/app/app.config.dev.ts:3`)" | integration | verified | spikes/ng222-app/src/app/app.config.dev.ts:3 — `import { provideAiDevTools } from 'ai-devtools-companion';`; :10 — `provideAiDevTools()` |
| "our own builds' `sourceMap: true` (`apps/angular-ai-devtools/project.json:48`)" | config | verified | apps/angular-ai-devtools/project.json:48 — `"sourceMap": true` |
| "opt-in runtime instrumentation is allowed only via providers (e.g. `provideAiDevTools()`), never via dev-server instrumentation" | config | verified | .commandcode/taste/design/taste.md:19 — the sentence appears in the ruling verbatim |
| "`.project/research/m040-performance-narrator.md:207-215`" | structure | stale | `Test-Path .project/research/m040-performance-narrator.md` returns False; .project/research/ holds only DOCS-AUDIT.md and inspect-inventory.txt, and the milestone is archived at .project/archive/040-performance-narrator/ |

## Doc: research/spikes/s11-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the two console joins cut the stack before reading anything (`extension/lint-core.js:100,124`, `extension/router-diagnostic.js:52,66`)" | feature | verified | extension/lint-core.js:100 — `const STACK_FRAME = /\n\s+at\s/;`, :124 — `function bodyOf(text) {`; extension/router-diagnostic.js:52 and :66 hold the identical pair |
| "`lift` 0 / `narrow` 0 / `changes nothing` 16" | structure | verified | research/spikes/capability-dependency-matrix.md:176 — "**Totals: `lift` 0 — `narrow` 0 — `changes nothing` 16.**" |
| "Measured over the sixteen shipped/repository features in `.project/research/capability-dependency-matrix.md`" | structure | stale | that path does not exist; the matrix is at research/spikes/capability-dependency-matrix.md, since research/spikes/README.md:20-21 records the move and :27-30 the path correction |
| "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" | config | unverifiable | no `apps/insurance-portal` directory exists in this tree; the portal checkout is an external path (AGENTS.md:205). One portal production build would settle it |
| "Nine of the ten `provider` gates are a change-detection arrangement a map cannot observe" | feature | verified | extension/agent-main.js:547 — `if (zone === 'zone') {`; :550 — `'Zone.js change detection is not supported; use zoneless Angular 22'` |
| "The lever that does remove a requirement is the dev-mode injector, measured in S13" | integration | verified | research/spikes/s13-answer.md:4 — the S13 verdict records the injector route as reachable with no app cooperation |

## Doc: research/spikes/s12-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`" | command | verified | apps/angular-ai-devtools/project.json:52 — `"build-extension": {` |
| "`extension/panel/*` is gitignored except `index.html`" | config | stale | .gitignore:33 — `extension/panel/*`; :34 — `!extension/panel/index.html`; :35 — `!extension/panel/favicon.ico`, so two negations exist, not one |
| "`template-map-coarse` in the matrix's §4 vocabulary" | structure | verified | research/spikes/capability-dependency-matrix.md:240 — the `template-map-coarse` row of the token table |
| "Target: `HaasStefan__ng-journal-insurance-portal-ai-devtools` @ `claude/ai-devtools-spike`" | status | unverifiable | that checkout is outside this tree; AGENTS.md:205 names it as an external path, so no git object here can confirm the recorded commit |
| "a production build ships **no map at all** (0 files, 0 bytes)" | config | unverifiable | no `apps/insurance-portal/project.json` in this tree to read the quoted `development.sourceMap` block; one portal production build would settle it |

## Doc: research/spikes/s13-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`injector.get('NgZone')` (a **string**) and then `injector.get(globalThis.NgZone)`" | feature | verified | extension/agent-main.js:140 — `zone = injector.get('NgZone');`; :146 — `zone = injector.get(globalThis.NgZone);`; :153 — `if (name === 'ZoneNgZone'` |
| "Grammar as shipped" (`ext/onpush-readiness.js:59`) | structure | verified | extension/onpush-readiness.js:59 — `return { state: 'cannot-tell', reason: 'strategy-unreadable' };` |
| "`.project/research/m040-performance-narrator.md:211-215`" | structure | stale | `Test-Path` on that path returns False; .project/research/ lists only DOCS-AUDIT.md and the milestone is archived at .project/archive/040-performance-narrator/ |
| "`node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal`" | command | verified | the script exists at that path (`Test-Path` True); AGENTS.md:206 documents `control-angular-dev-app up --target portal` as the way the portal is served |
| "the agent measures the arrangement and refuses when it finds a real `ZoneNgZone` — `extension/agent-main.js:546-553`" | feature | verified | extension/agent-main.js:547 — `if (zone === 'zone') {`; :550 — `'Zone.js change detection is not supported; use zoneless Angular 22'`; :552 — `return 'notsupported';` |

## Doc: research/spikes/sourcemap-future-scope.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Four roadmap entries carry `Status: pending` and are the entire unshipped current generation" | status | stale | .project/ROADMAP.md:1475, :1505, :1536 and :1566 each read `Status: shipped` for M040, M041, M042 and M043 |
| "Nothing follows `M043` in the roadmap; the file ends at `RM:1589`" | structure | stale | .project/ROADMAP.md:1589 is `### M044 — gate-integrity` and the file runs to 1992 lines |
| "`.project/research/capability-dependency-matrix.md`" (the `MX` alias) | structure | stale | .project/research/ holds only DOCS-AUDIT.md and inspect-inventory.txt; the matrix is at research/spikes/capability-dependency-matrix.md |
| "backlog `M043` is `copy-to-agent` (`BL:222`)" | structure | verified | plans/angular-ai-devtools-program-backlog.md:222 — `M043 copy-to-agent · M044 component-search · M045 ui-copy-check ...` |
| "A 520 KB hard initial-bundle ceiling (`RM:732`)" | config | verified | .project/ROADMAP.md:732 — "the budget is a hard 520 KB (AR-1)" |
| "MV3 restricts Wasm to `wasm-unsafe-eval` and the panel already pins its CSP (`BL:36`)" | config | verified | plans/angular-ai-devtools-program-backlog.md:36 — "MV3 restricts Wasm to `wasm-unsafe-eval` and the panel already pins its CSP" |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | config | verified | spikes/ng222-app/package.json:29 — `"@angular/cli": "^22.2.2",` |
| "To execute unit tests with the [Vitest](https://vitest.dev/) test runner" | config | verified | spikes/ng222-app/angular.json:75 — `"builder": "@angular/build:unit-test"`; package.json:36 — `"vitest": "5.0.3"`; spikes/ng222-app/src/app/counter.spec.ts is present |
| "To start a local development server, run" | command | verified | spikes/ng222-app/angular.json:62 — `"serve": {` with `"defaultConfiguration": "development"` at :72 |
| "Angular CLI does not come with an end-to-end testing framework by default" | feature | verified | spikes/ng222-app/angular.json architect holds only build (:16), serve (:62) and test (:74); no `e2e` target appears in the file |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`" | structure | verified | spikes/ng222-ssr/angular.json:13-34 sets `"skipTests": true` on every schematic; a recursive `Get-ChildItem -Filter *.spec.ts` under spikes/ng222-ssr returns no file |
| "The Angular CLI keeps the section below in its generated README; it does not apply here" | structure | verified | spikes/ng222-ssr/angular.json has no `test` architect target, only `build` at :41 and `serve` at :88 |
| "Angular CLI version 22.2.2" | config | verified | spikes/ng222-ssr/package.json:29 — `"@angular/cli": "^22.2.2",` |
| "To start a local development server, run" | command | verified | spikes/ng222-ssr/angular.json:88 — `"serve": {` with `"defaultConfiguration": "development"` at :98 |

## Descriptive docs
- .commandcode/taste/taste.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 64 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 133 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 136 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 152 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 172 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 173 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 174 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 177 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 186 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 198 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 203 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 206 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 207 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 211 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 214 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 219 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 223 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 284 | fix-doc | "A fresh session should be able to run /gsd-path to complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority." | no |
| 319 | fix-doc | "A fresh session should be able to run /gsd-path to complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority." | no |
| 320 | fix-doc | "A fresh session should be able to run /gsd-path to complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority." | no |
| 308 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": node_modules/@nx/eslint/package.json declares an eslint peer range of 9.x or 10.x and the workspace resolves eslint 10.13.0, so the doc's ESLint-10-breaks-@nx-eslint pin is wrong; the code is authoritative. | no |
| 329 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": no `angular-ai:error-explain` string exists in apps/, src/, extension/, scripts/ or tests/; the explain step is panel-local (`src/panel/error-explainer-view.ts`), so the doc names a message type that was never built. | no |
| 331 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the only `angular-ai:*` types in the sources are di-graph, di-query, error-capture, record and state; `interop.service.ts` sends no runtime message, so the doc's `angular-ai:interop` type does not exist. | no |
| 332 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `interop.component.ts:16` renders \"no interop findings\", not \"no interop nodes\"; the doc quotes text the component does not render. | no |
| 334 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": no `angular-ai:stale-view` message type exists; the scan runs in the panel through `stale-view-scan.ts`, so the doc names a channel that was never built. | no |
| 343 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the only extension copy on disk is `tmp/control-angular-devtools/extension/1.22.0` (manifest version 1.22.0), so the doc's 1.22.1 end state is not reproducible from this repository; the recorded copy is authoritative. | no |
| 366 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `control.mjs:2437-2570` adds 18 checks on the healthy path for an instance with no pin and never totals them, so \"nineteen check lines\" is a count the script does not produce. | no |
| 405 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `.commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208,323` fires the breaker at 13 consecutive polls, so the doc's \"5 polls\" contradicts the shipped script. | no |
| 430 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": same evidence as queue row 308 (the peer range admits 9.x or 10.x and the workspace runs eslint 10.13.0), so v9 is not a requirement. | no |
| 445 | accept-drift | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the skill documents the general Nx `nx.json` schema, not this workspace's file, which carries only analytics, targetDefaults, plugins and generators; the row is tolerated and no edit is planned. | n/a (accept-drift) |
| 461 | accept-drift | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `plans/gsd-path-handoff-M018.md` is a dated handoff snapshot describing the state before M019 built; a point-in-time record is not a contract, so the row is tolerated. | n/a (accept-drift) |
| 462 | accept-drift | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": same dated handoff: its 143-document inventory was correct when written and the frozen inventory is now 144; a snapshot is not a live count. | n/a (accept-drift) |
| 465 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `.commandcode/skills/control-ai-browsers/instances.json:173` gives `edge-dev-phi4mini` port 9337 and `bench-all.sh` agrees, so the research note's 9336 is stale. | no |
| 471 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `docs/filing-ledger.md:200,210,220` (items 8, 9 and 10) are exactly the three observations the note says were never filed, so the status claim is stale. | no |
| 475 | fix-doc | Delegated under the grant: the code is authoritative - no producer or consumer of angular-ai:error-explain exists; the explain runs in-panel on ExtensionPromptService. | T001 |
| 477 | fix-doc | Delegated under the grant: interop.component.ts sends no runtime message and no angular-ai:interop type exists in relay or background. | T001 |
| 479 | fix-doc | Delegated under the grant: stale-view.component.ts injects the scan service and sends no message; the relay list has no such type. | T001 |
| 480 | fix-doc | Delegated under the grant: the portal renders a Contract Details title plus a separate Edit button, so no single heading reads Contract Details Edit. | T001 |
| 502 | fix-doc | Delegated under the grant: same evidence as queue row 475 - no angular-ai:error-explain type exists. | T001 |
| 503 | fix-doc | Delegated under the grant: same evidence as queue row 477 - no angular-ai:interop type exists. | T001 |
| 505 | fix-doc | Delegated under the grant: same evidence as queue row 479 - no angular-ai:stale-view type exists. | T001 |
| 542 | fix-doc | Delegated under the grant: node_modules/@nx/eslint peers eslint ^9.0.0 or ^10.0.0, so ESLint 10 is supported. | T001 |
| 544 | fix-doc | Delegated under the grant: @nx/eslint flat-config utils list .eslintrc, .js, .cjs, .yaml, .yml and .json for legacy detection - no .mjs. | T001 |
| 545 | fix-doc | Delegated under the grant: @nx/eslint utils/versions.js sets eslintVersion to ^9.8.0, not ~8.57.0. | T001 |
| 568 | fix-doc | Delegated under the grant: the user .npmrc sets prefix to the .local bin directory, so D:\packages\npm-global is not the npm global prefix. | T001 |
| 569 | fix-doc | Delegated under the grant: app.routes.ts line 14 is interop and line 15 is chat, so the cited line is wrong. | T001 |
| 579 | accept-drift | Delegated under the grant: a dated handoff measurement describes an earlier file state and the note already carries a superseded banner. | n/a (accept-drift) |
| 587 | fix-doc | Delegated under the grant: control.mjs reads c.callID fallback c.callId, so callId does not throw. | T001 |
| 589 | fix-doc | Delegated under the grant: the grader is at spikes/probes/bench.js line 64 and already requires a count boundary. | T001 |
| 593 | fix-doc | Delegated under the grant: the portal checkout at the cited commit has seven files importing @angular/forms/signals. | T001 |
| 598 | fix-doc | Delegated under the grant: the control-ai-browsers skill states registry policies are deliberately not used; the instances switches prevent sign-in. | T001 |
| 581 | accept-drift | Delegated under the grant: a dated handoff note records the branch bound at the time it was written and already carries a superseded banner. | n/a (accept-drift) |
| 586 | fix-doc | Delegated under the grant: instances.json has edge-phi4mini on port 9337 and no 9336 entry, so the probe table's port is wrong. | T001 |
| 602 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the code registers model.pin only for a pinned instance and this one has no pin roots, so it emits eighteen lines | no |
| 604 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the component renders "no interop findings" | no |
| 615 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, spikes/s1-extension was removed at c3e8f57, so the variant builder reads a directory that no longer exists | no |
| 619 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the component renders "no interop findings" | no |
| 671 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, no prettier is installed, so the prettier-backed command cannot run in this workspace | no |
| 673 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, @nx/eslint peers eslint to ^9 or ^10, as the document's own previous line says | no |
| 689 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, vitest is a devDependency and the specs are typed from vitest/globals | no |
| 692 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the scripts are node --experimental-strip-types --test and check; there is no typecheck script | no |
| 693 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, control-vitest-browser-angular has no verify sibling, so the rule states a pair the record does not hold | no |
| 694 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the inspect chunker deliberately audits 10-20 documents per worker; the batch size is tooling, not a rule | no |
| 695 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the driver is .commandcode/skills/control-ai-browsers/scripts/panel.mjs; the line number is right and the path prefix is wrong | no |
| 700 | accept-drift | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, a dated handoff snapshot records the state on its date and is superseded by later milestones | n/a (accept-drift) |
| 701 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the skill records the pin advancing to model 2026.10.15.1 and manifest 2026.10.19.1 | no |
| 707 | fix-doc | Delegated under "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the code is authoritative, the probe file that held the BJ figures no longer exists, so the claim must be marked unverifiable or withdrawn | no |
| 930 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the S11/S12/S13 set is audited where it lives — `archive_milestone.py`'s `require_clean_active_root` admits nothing but a byte-identical `.project/research/DOCS-AUDIT.md`, so the six answers and analyses are tracked Markdown under `research/spikes/` and therefore inventoried, and their interior `.project/research/<name>.md` references are read through `research/spikes/README.md`'s move note rather than by editing the documents, which stay byte-identical. | no |
| 99 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 100 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1003 | .commandcode/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1005 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids (`cgg06-4`) change with every page load" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1009 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "The sidebar entries are `div`s with `routerLink`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1017 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "`Tests 2 passed \| 2 skipped (4)` without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1022 | .commandcode/skills/monitor-ci/SKILL.md | "circuit breaker (5 polls)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1025 | .commandcode/skills/monitor-ci/references/fix-flows.md | "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1028 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1031 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1035 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Byte-identical malformed downloads across retries support a persistent bad cache object" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1036 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1039 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED` (the `cipes` filter accepts only terminal statuses)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1042 | .commandcode/skills/nx-import/references/GRADLE.md | "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1047 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1061 | AGENTS.md | "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:14`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1062 | docs/afk-run-2026-10-12.md | "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1077 | references/ai-browsers-verification.md | "`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:253`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1111 | research/spikes/s11-answer.md | "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1112 | research/spikes/s12-answer.md | "`extension/panel/*` is gitignored except `index.html`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1118 | research/spikes/sourcemap-future-scope.md | "Nothing follows `M043` in the roadmap; the file ends at `RM:1589`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1165 | .commandcode/pstack-models.md | "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1166 | .commandcode/pstack-models.md | "stops the Claude Code or Codex SessionStart hook, or the pstack Pi extension" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1167 | .commandcode/pstack-models.md | "the pstack effort agents (effort-low, effort-medium, effort-high, effort-xhigh, effort-max) set reasoningEffort in their frontmatter" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1168 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "`src/panel/error-explainer-view.ts` calls `shouldCallModel`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1169 | .commandcode/skills/control-angular-dev-app/SKILL.md | "`scripts/control.mjs:69` keeps it at 3000" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1170 | .commandcode/skills/control-angular-dev-app/SKILL.md | "`provideRouter(routes)` over the two routes `src/app/app.routes.ts:5-8` declares" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1171 | .commandcode/skills/control-angular-dev-app/features/README.md | "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1172 | .commandcode/skills/control-angular-dev-app/features/counter.md | "the stale-view fixtures (`src/app/app.routes.ts:5-8`, read 2026-11-01)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1173 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "`claim-list` table with columns Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1174 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "Data comes from `http://localhost:3000/api/claims`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1175 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "`/claim/create` shows the heading `Complaint Create`: an app bug, measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1176 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1177 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "the customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1178 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Save sends `POST /api/complaints` (201)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1179 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "20 rows after a fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1180 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "then sends `PUT /api/contracts` and returns to details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1181 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "`node $S doctor --target portal` exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1182 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "`/` redirects to `/home`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1183 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "the `capitalize` pipe, which calls `toUpperCase`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1184 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1185 | .commandcode/skills/control-angular-devtools/SKILL.md | "Every other script has a `node:test` file beside it (`*.test.mjs`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1186 | .commandcode/skills/control-angular-devtools/features/attach.md | "`isSupportedAngularVersion` (major 12+ or 0)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1187 | .commandcode/skills/control-angular-devtools/features/install.md | "`chrome://` and `edge://` URLs passed on the command line open an empty window instead of the page" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1188 | .commandcode/skills/control-angular-devtools/features/profiler.md | "`ng.ɵsetProfiler(null)` clears every subscriber, DevTools' included" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1189 | .commandcode/skills/control-angular-devtools/features/profiler.md | "`own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1190 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Expected on the fixture before: `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1191 | .commandcode/skills/control-pangular-inspector/SKILL.md | "`control.mjs:74` defaults to 9999" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1192 | .commandcode/skills/control-pangular-inspector/features/README.md | "the overlay reports about 250 ms after change detection" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1193 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "`inspect-signals` nodes and edges for one component" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1194 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1195 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`list-routes` (12 routes, measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1196 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "one `info` finding, `missing-title`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1197 | .commandcode/skills/control-pangular-inspector/features/panel.md | "accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1198 | .commandcode/skills/control-pangular-inspector/features/panel.md | "the eight tab names, `LIVE`, `Angular 22.2.2`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1199 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1200 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "`get-routes`, `get-components`, `get-signals`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1201 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "Angular `22.2.2`, project `@ng-journal/source`, TypeScript `6.0.3`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1202 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "`playwright-cli attach --cdp=<cdpUrl> --session=<session>`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1203 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`LanguageModel.availability()` is `available` in the tester iframe (attach mode)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1204 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "in bundled mode it deletes the profile the extension was loaded into" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1206 | .commandcode/skills/link-workspace-packages/SKILL.md | "All package managers support workspaces" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1207 | .commandcode/skills/monitor-ci/SKILL.md | "`{%- if platform == \"claude\" %}`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1208 | .commandcode/skills/monitor-ci/references/fix-flows.md | "push empty commit (`git commit --allow-empty -m \"ci: rerun after rejecting throttled fixes\"`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1209 | .commandcode/skills/nx-cloud-api/SKILL.md | "with `nxCloudId` in `nx.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1210 | .commandcode/skills/nx-cloud-api/SKILL.md | "`--page-size` (which sets `limit`, max 500)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1211 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Use `-o <file>` with an explicit extension such as `.tar.gz`; the command refuses to write a download to a terminal" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1212 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "record each time range, filters, file, exit code, item count, and final `nextCursor` in a manifest" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1213 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "Keep the selected row's `batchId` and `links.self` in the projection" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1214 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1215 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Record byte count and SHA-256" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1216 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "A downloaded asset proves only that it resolves now" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1217 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Use a semaphore of at most five narrow detail requests" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1218 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "inspect `CODEOWNERS` and project ownership metadata at the recorded commit" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1219 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "the public API has no separate workflow routes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1220 | .commandcode/skills/nx-generate/SKILL.md | "List all generators for a plugin: `npx nx list @nx/react`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1221 | .commandcode/skills/nx-generate/SKILL.md | "Always run with `--dry-run` first" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1222 | .commandcode/skills/nx-generate/SKILL.md | "Empty test suites will cause `nx test` to fail" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1223 | .commandcode/skills/nx-generate/SKILL.md | "nx run-many -t build,lint,test,typecheck" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1224 | .commandcode/skills/nx-import/SKILL.md | "After nx `22.6.0`, `nx import` responds with .ndjson outputs and follow-up questions" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1225 | .commandcode/skills/nx-import/SKILL.md | "Nx rewrites `package.json` scripts during init, creating broken commands" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1226 | .commandcode/skills/nx-import/SKILL.md | "Diff source and dest `package.json` + `nx.json`. Add missing deps, merge relevant `targetDefaults` and `namedInputs`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1227 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1228 | .commandcode/skills/nx-import/references/ESLINT.md | "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1229 | .commandcode/skills/nx-import/references/ESLINT.md | "`typescript-eslint@7.x` declares `peerDependencies: { \"eslint\": \"^8.56.0\" }`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1230 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1231 | .commandcode/skills/nx-import/references/GRADLE.md | "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1232 | .commandcode/skills/nx-import/references/GRADLE.md | "If `@nx/gradle` is installed, run `nx show projects` to verify that Gradle projects are being inferred" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1233 | .commandcode/skills/nx-import/references/JEST.md | "`nx add @nx/jest` does NOT create `jest.preset.js`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1234 | .commandcode/skills/nx-import/references/JEST.md | "Both `@nx/jest/plugin` and `@nx/vite/plugin` (which infers Vitest targets) coexist without conflicts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1235 | .commandcode/skills/nx-import/references/JEST.md | "`pnpm add -wD jest ts-jest @types/jest @nx/jest`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1236 | .commandcode/skills/nx-import/references/NEXT.md | "Both `@nx/next/plugin` and `@nx/vite/plugin` can coexist in `nx.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1237 | .commandcode/skills/nx-import/references/NEXT.md | "Next.js detects missing `@types/react` during `next build` and tries to install it using `yarn add`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1238 | .commandcode/skills/nx-import/references/TURBOREPO.md | "If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs` that projects extend, merge the config packages into these root configs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1239 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Run workspace validation (`nx run-many -t build lint test typecheck`) to confirm nothing broke" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1240 | .commandcode/skills/nx-import/references/TURBOREPO.md | "**`@repo/eslint-config`** (or similar) — ESLint config files and all ESLint plugin dependencies" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1241 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1242 | .commandcode/skills/nx-import/references/VITE.md | "React Router 7 outputs to `build/` (not `dist/`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1243 | .commandcode/skills/nx-import/references/VITE.md | "React 18 (source) + React 19 (dest): pnpm may hoist mismatched `react-dom`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1244 | .commandcode/skills/nx-import/references/VITE.md | "Some generated Vue ESLint configs omit `vue-eslint-parser`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1245 | .commandcode/skills/nx-plugins/SKILL.md | "List plugins: `npx nx list`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1246 | .commandcode/skills/nx-run-tasks/SKILL.md | "It contains a `targets` section which has information about targets that can be run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1247 | .commandcode/skills/nx-run-tasks/SKILL.md | "`--parallel` to control the number of parallel processes (default is 3)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1248 | .commandcode/taste/angular/taste.md | "Signal Forms (@angular/forms/signals) is the target forms API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1249 | .commandcode/taste/design/taste.md | "per-package secondary entry points such as provideAiNgrxDevTools()" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 1250 | .commandcode/taste/tooling/taste.md | "standardized test and typecheck npm scripts, with test running via node --test and typecheck via tsc --noEmit" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1251 | .commandcode/taste/workflow/taste.md | "Pair every tool, fixture or runtime the project adopts with a control-{name} skill and a verify-{name} skill" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1252 | AGENTS.md | "GLM-5.3 Flash for `reviewer`, `skeptic` and `review_panel`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1253 | docs/afk-run-2026-10-12.md | "Only the four standing per-model instances run, each on one blank tab" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1254 | docs/design/tutor.md | "TS12 ... Whether a dedicated Worker from the panel exposes the Prompt API" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1255 | docs/filing-ledger.md | "Source read on the `22.2.x` branch" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1256 | plans/angular-ai-devtools-program-backlog.md | "The bind (`gsd-path/M018`) — blocks every write to `CHARTER.md` and `ROADMAP.md`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1257 | plans/angular-ai-devtools-program-backlog.md | "M040 is `build/active` (`gsd-path/M040`, `performance-narrator`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1258 | plans/angular-ai-devtools-proposals.handoff.md | "eleven drafts (the eleventh, the `LanguageDetector`/`Translator` worker crash, is at `docs/filing-ledger.md:230`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1259 | plans/angular-ai-devtools-proposals.handoff.md | "The companion package exports `provideAiDevTools()`, `provideAiNgrxDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxSignalsDevTools()`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1260 | research/01-built-in-ai-apis.md | "the shipped driver reads c.callID ?? c.callId (control.mjs:1424-1430)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1261 | research/02-angular-surface.md | "ng.getDirectiveMetadata(...) returns changeDetection: 0 (OnPush) for a component that declares none" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1262 | research/12-legacy-vs-modern-angular.md | "spike main.js:n = spikes/ng222-app/dist/ng222-app/browser/main.js line n in this repo" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1263 | research/13-portal-legacy-audit.md | "N15 (Signal Forms doctor) has nothing to inspect on the portal today" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1264 | research/13-portal-legacy-audit.md | "apps/insurance-portal/project.json:18 polyfills: [zone.js]" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1265 | research/14-ai-devtools-prior-art.md | "139 rows in all" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1266 | research/16-ssr-runtime.md | "documented, platform-browser.mjs:355-372" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1267 | research/18-edge-prevent-auto-signin.md | "msBrowserSignin is not a real Chromium/Edge feature flag - the real policy is BrowserSignin" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1268 | research/19-languagemodel-in-extension-contexts.md | "recorded in plans/prompt-api-browser-pairs.afk.md" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1269 | research/spikes/capability-dependency-matrix.md | "portal run rendered **zero rows** — `AGENTS.md:214`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1270 | research/spikes/instrumentation-free-coverage.md | "`.project/research/m040-performance-narrator.md:207-215`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1271 | research/spikes/s11-answer.md | "Measured over the sixteen shipped/repository features in `.project/research/capability-dependency-matrix.md`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1272 | research/spikes/s12-answer.md | "Target: `HaasStefan__ng-journal-insurance-portal-ai-devtools` @ `claude/ai-devtools-spike`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1273 | research/spikes/s12-answer.md | "a production build ships **no map at all** (0 files, 0 bytes)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1274 | research/spikes/s13-answer.md | "`.project/research/m040-performance-narrator.md:211-215`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1275 | research/spikes/sourcemap-future-scope.md | "Four roadmap entries carry `Status: pending` and are the entire unshipped current generation" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1276 | research/spikes/sourcemap-future-scope.md | "`.project/research/capability-dependency-matrix.md`" (the `MX` alias) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1277 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "a host element whose id is rootN and whose ng-version reads 22.2.2 (the doc prints it as a div tag)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
