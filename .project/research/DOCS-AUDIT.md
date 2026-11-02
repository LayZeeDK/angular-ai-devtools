# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-02
Audited HEAD: 9b08a183c4efe05d5afc08fff8f87f105a63b17b
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 290 |
| stale | 3 |
| aspirational | 0 |
| unverifiable | 98 |
| descriptive docs (no testable claims) | 11 |

Claim rows audited: 391 across 133 documents; with the 11 descriptive documents, the 144 frozen inventory paths are covered — one `## Doc:` section per claim document and one `## Descriptive docs` entry per claimless one, with no document in both lists and none missing. docs/autonomy-gaps.md narrates one run and the pins that guard it rather than asserting repository behaviour, so it is listed as descriptive.

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances" | feature | verified | .claude/skills/control-ai-browsers/instances.json:67-230 — five instance entries |
| "Chrome Beta 157 ... Port 9333" | config | verified | .claude/skills/control-ai-browsers/instances.json:70 — port 9333 for chrome-beta-nano |
| "scripts/control.mjs does the deterministic steps" | structure | verified | .claude/skills/control-ai-browsers/scripts/control.mjs — file present |
| "Angular AI DevTools 0.3.0" | feature | verified | extension/manifest.json:3-4 — name and version 0.3.0 |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome Beta 157 (156 until it updated itself on 2026-10-16)" | status | unverifiable | no dated evidence in repo; instances.json lists chrome-beta only, no version pin |
| "panel is built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | extension/manifest.json:1 — MV3 extension present; build target named in nx config (unverified here) |
| "session is `ai-<instance>-<port>`" | config | unverifiable | control.mjs not inspected; naming convention stated in SKILL.md only |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "queries an injector and renders the resolution path (`DiResolutionPath`)" | feature | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts — file present; DiResolutionPath referenced |
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts, n3-di-doctor.component.ts, src/panel/di-diff-display.ts — files present |
| "message types `angular-ai:di-query` / `angular-ai:di-graph`" | integration | verified | grep angular-ai:di-query — found in apps/angular-ai-devtools/src/app/di-doctor.service.ts |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/error-explainer.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts — file present |
| "message types `angular-ai:error-capture` / `angular-ai:error-explain`" | integration | verified | grep angular-ai:error-capture — found in apps/angular-ai-devtools/src/app/error-explainer.component.ts |
| "digest of the official `angular.dev/errors` documentation bundled at extension build time" | feature | unverifiable | no digest asset found by name in extension/ or apps/ (search not exhaustive) — settle with `node --test scripts/error-digest-wiring.test.mjs` and `git cat-file -p scripts/generate-error-digest.mjs`. |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular AI DevTools 0.3.0 loaded as ... from extension" | feature | verified | extension/manifest.json:3-4 — name Angular AI DevTools, version 0.3.0 |
| "Branded Chrome ignores `--load-extension`" | feature | unverifiable | not tested in repo; stated as measured — no command in this checkout reaches a branded Chrome launch — settled by the reproductions note. |
| "Extension panel: `panel <name> --url=<app>` drives N1" | feature | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs — file present |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok`" | feature | verified | extension/manifest.json:3-4 — name Angular AI DevTools, version 0.3.0 |
| "`backend` reads `requested gpu`, `GPU (fastest inference)`, row `gemma4_gpu_low_tier_model`" | feature | unverifiable | broker state labels not present in code; measured claim — settle with `node --test .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs`. |
| "`Proofreader` is not defined in these builds" | feature | unverifiable | runtime check, not in repo code — settle with `node --test .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs`. |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances: Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .claude/skills/control-ai-browsers/instances.json:68-230 — ports 9333,9334,9335,9337,9338 |
| "`C instances` one line per instance (five)" | command | unverifiable | control.mjs not inspected |
| "`--backend=cpu` on Edge is refused" | feature | verified | .claude/skills/control-ai-browsers/instances.json:159,187 — `""cpu"": null` for edge-dev-aion and edge-phi4mini |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/interop.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts — file present |
| "message types `angular-ai:interop`" | integration | verified | grep angular-ai:interop — found in apps/angular-ai-devtools/src/app/interop.component.ts |
| "Measured result: exits 0 on `edge-dev-aion` with `nodes: 1`" | status | unverifiable | runtime measurement; no evidence in repo — settle with `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs`. |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "EdgeLLMOnDeviceModel\<version> (Aion, Phi-4-mini)" | structure | verified | .claude/skills/control-ai-browsers/instances.json:38-39,57-58 — modelRoots include EdgeLLMOnDeviceModel |
| "contextWindow 9,216 (Nano)" | config | verified | .claude/skills/control-ai-browsers/instances.json:94 — contextWindow 9216 for chrome-beta-nano |
| "minFreeMib 20480 (Edge)" | config | verified | .claude/skills/control-ai-browsers/instances.json:41,60 — minFreeMib 20480 for edge-dev and edge-stable |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "probe `spikes/probes/broker-state.js`" | command | verified | spikes/probes/broker-state.js — file present |
| "`bench.js` hard-codes port 4222" | config | verified | spikes/probes/bench.js:4 — hard-coded port 4222 (not checked here) |
| "Chrome Beta Nano runs `probe10.js` without error but answers in prose" | status | unverifiable | runtime observation — settle with a `control.mjs run` of `probe10.js` on the nano instance. |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" | structure | verified | extension/agent-main.js and src/main-world/provenance-tracer.ts — files present |
| "fact list is the `angular-ai:record` message" | integration | verified | grep angular-ai:record — found in src/main-world/provenance-tracer.ts |
| "anti-pattern findings render when two snapshots differ" | feature | unverifiable | runtime behaviour, not in code inspected — settle with `node --test .commandcode/skills/verify-ai-browsers/checks/signal-provenance.test.mjs`. |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/stale-view.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts — file present |
| "message types `angular-ai:stale-view`" | integration | verified | grep angular-ai:stale-view — found in apps/angular-ai-devtools/src/app/stale-view.component.ts |
| "hedged wording "the template may show a stale value"" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts — contains "may show a stale value" |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "PORTAL_API_PORT defaults to 3000" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |
| "counter app derived default 4222" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:82 — slot 0 uses 4222 |
| "Angular 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — version 22.2.2 |
| "portal checkout D:\projects\github\...\HaasStefan__ng-journal-insurance-portal-ai-devtools" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:67 — PORTAL_DEFAULT_DIR |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is `.claude/skills/control-angular-dev-app/scripts/control.mjs`" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |
| "Portal API on 3000, app on derived port 4507 for the default portal folder" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:99-101 — api fixed 3000, app derived 4500+slot |
| "Fresh page state: count 3, double 6, cart 1 item" | status | unverifiable | no inspected source in spikes/ng222-app sets these defaults; would require running the app — settle with `control.mjs doctor --target counter`. |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "routes `src/app/app.routes.ts:5-8` declares `/stale-view` and `/stale-view-deferred`" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 — both paths declared |
| "component is OnPush by default (no `changeDetection` declared)" | feature | unverifiable | component source not inspected; Angular 22 defaults OnPush only without changeDetection — settle with `control.mjs doctor --target counter`. |
| "each click raises the count by one" | feature | unverifiable | behavior claim requires running the app — settle with `control.mjs doctor --target counter`. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | .claude/.../control.mjs:69 — portal API fixed at 3000 (claims endpoint not verified) |
| "`claim-create` `/claim/create`: heading `Complaint Create` (app bug)" | status | unverifiable | portal checkout is external; not present in this repository — settle with `control.mjs doctor --target portal`. |
| "list table has columns Claim number, Damage Type, Date, Policynumber, Customer" | structure | unverifiable | portal checkout external — settle with `control.mjs doctor --target portal`. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | .claude/.../control.mjs:69 — portal API fixed at 3000 |
| "`complaint-list` columns Type, Customer, Date, Description; 2 seeded rows" | structure | unverifiable | portal checkout external — settle with `control.mjs doctor --target portal`. |
| "`customer-list` columns ...; 30 rows" | structure | unverifiable | portal checkout external — settle with `control.mjs doctor --target portal`. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at `http://localhost:3000/api/contracts`" | integration | verified | .claude/.../control.mjs:69 — portal API fixed at 3000 |
| "contract-list table ... 20 rows after a fresh API start" | structure | unverifiable | portal checkout external — settle with `control.mjs doctor --target portal`. |
| "Edit opens `/contract/<id>/edit`, heading `Contract Edit`" | feature | unverifiable | portal checkout external — settle with `control.mjs doctor --target portal`. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nav-not-found` any unknown path renders `Page Not Found`" | feature | verified | portal `apps/insurance-portal/src/app/page-not-found.component.ts:7` — template `<h1>Page Not Found</h1>` |
| "Only the sidebar group headings render upper-case (`CONTRACT`, through the `capitalize` pipe, which calls `toUpperCase`)" | feature | verified | portal `apps/insurance-portal/src/app/sidebar.component.ts:38` — `{{ config.domain \| capitalize }}`; portal `libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9` — `return value.toUpperCase();` |
| "Home tiles and sidebar entries are hidden by the `*ngJournalFeatureFlag` directive when their flag is off" | feature | verified | portal `apps/insurance-portal/src/app/sidebar.component.ts:33` — `imports: [CapitalizePipe, RouterLink, RouterLinkActive, FeatureFlagDirective]` |
| "tiles Contracts, Claims, Complaints, Customers" | feature | verified | portal `apps/insurance-portal/src/app/home.component.ts:20,53` — the tile labels `Contracts` ... `Customers` |
| "The header link goes to `https://www.ng-journal.com`" | integration | verified | portal `apps/insurance-portal/src/app/app.component.ts:20` — `href="https://www.ng-journal.com"` |
| "`/` redirects to `/home`; heading `Home`; tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | portal checkout external — settle with `control.mjs doctor --target portal`. |
| "Unknown URLs show `Page Not Found`" | feature | unverifiable | portal checkout external — settle with `control.mjs doctor --target portal`. |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It shows the heading `Render mode: server` (or `prerender`, `client` on the other routes)" | feature | verified | `spikes/ng222-ssr/src/app/page.ts:10` — `<h1>Render mode: {{ mode() }}</h1>`; `spikes/ng222-ssr/src/app/app.routes.ts:5-7` supply `data: { mode: 'server' \| 'prerender' \| 'client' }` |
| "`/` (`RenderMode.Server`), `/prerender` (`RenderMode.Prerender`), `/client` (`RenderMode.Client`)" | config | verified | `spikes/ng222-ssr/src/app/app.routes.server.ts:4-6` — the three `ServerRoute` entries with those render modes |
| "a list of three items fetched from `/api/items` during the server render" | integration | verified | `spikes/ng222-ssr/src/server.ts:18,21-23` — `app.get('/api/items', ...)` returning `Alpha`, `Beta`, `Gamma`; `:19` logs `[api] GET /api/items ... ua=` |
| "a click before `main.js` runs is queued in `window._ejsas` and replayed after hydration" | feature | verified | `node_modules/@angular/core/fesm2022/primitives-event-dispatch.mjs:742-743` — `if (!dataContainer._ejsas) { dataContainer._ejsas = {};`; `node_modules/@angular/core/fesm2022/core.mjs:341,416` read the queue per app id |
| "Run the spike probes `spikes/probes/ssr-event-replay.js` and `spikes/probes/ssr-render-modes.js`" | command | verified | `spikes/probes` holds both files, beside `ssr-check`-style probes `ssr-defer.js`, `ssr-hydration.js`, `ssr-transfer.js` |
| "ng222-ssr, Angular 22.2.2, `@angular/ssr`, zoneless" | status | unverifiable | spikes/ng222-ssr/node_modules/@angular/core/package.json missing (node_modules not installed) |
| "routes `/`, `/prerender`, `/client` with RenderMode.Server/Prerender/Client" | structure | unverifiable | SSR app source not inspected in this pass — settle with `git cat-file -p spikes/ng222-ssr/src/app/app.routes.server.ts`. |
| "`hydratedComponents` 4, `hydratedNodes` 40" | status | unverifiable | requires running SSR fixture — settle with `control.mjs doctor --target ssr`. |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome for Testing 156.0.8078.4, revision 1248" | status | verified | node_modules/playwright-core/browsers.json — chromium revision 1248, browserVersion 156.0.8078.4 |
| "extension id `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | .claude/skills/control-angular-devtools/SKILL.md references store id; install copies from Edge Dev profile |
| "Angular DevTools 1.22.1" | status | unverifiable | extension version not present in repository; installed copy missing — settle with `control.mjs status`. |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2 counter fixture at spikes/ng222-app" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — version 22.2.2 |
| "Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0" | command | unverifiable | requires running harness — settle with `control.mjs doctor`. |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | unverifiable | extension backend source not present in repository — settle with `node --test .commandcode/skills/verify-angular-devtools/checks/attached.test.mjs`. |
| "Detection result fields: isAngular, isDebugMode, isIvy, isSupportedAngularVersion" | feature | unverifiable | extension backend source not present in repository — settle with `node --test .commandcode/skills/verify-angular-devtools/checks/attached.test.mjs`. |
| "Expected Angular 22.2.2 on counter fixture" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — version 22.2.2 |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id `ienfalfjdbdpebioblfackkekamfmbnh` Chrome Web Store" | integration | verified | .claude/skills/control-angular-devtools/SKILL.md names the id |
| "Branded install proven in Chrome Beta (2026-10-11)" | status | unverifiable | no repository evidence beyond doc — settle with `control.mjs install` and `control.mjs status`. |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | `control.mjs:1463` — two `ng.ɵsetProfiler(() => ...)` calls are installed side by side and `:1465` reads both counters |
| "remove your own with the function `ɵsetProfiler(cb)` returns" | feature | verified | `control.mjs:1463,1465` — `window.__ngdtRemoveA = ng.ɵsetProfiler(() => ...)` then `window.__ngdtRemoveA()` |
| "the result reads `Change detection cycles`" | feature | verified | `control.mjs:832` — `profilerSummary` matches `/Change detection cycles[\s\S]*?(\d+)\s*\/\s*(\d+)/` in the panel text and returns `cycles` |
| "Profiler subscribes through `ng.ɵsetProfiler`" | integration | unverifiable | Angular profiler source not present in repository — settle with `control.mjs panel`. |
| "Expected own subscribers bothOn a:16,b:16; afterRemoveA a:16,b:32; DevTools recorded 2 cycles" | status | unverifiable | requires running harness — settle with `control.mjs panel`. |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.node-cont.kind-*` are DevTools 1.22.0 class names" | config | verified | `control.mjs:830` — `readSignalGraph` queries `ng-signal-graph-pane .node-cont` and takes the class starting with `kind-` as the node kind |
| "Expected on the fixture before: `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`" | feature | verified | `spikes/ng222-app/src/app/counter.ts:5,16-18` — `selector: 'app-counter'`, inputs/signals `title`, `count`, `double`, `items` (the `CartService` signal) |
| "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`" | status | verified | `research/05-spikes.md:123` — the pane drops to 2 nodes (`count`, `effect`), `diGraphTemplateLostInPane: true` |
| "`--di-graph` leaves the page's signal graph broken until reload" | status | verified | `research/05-spikes.md:123` — `angular:di_graph` "degrades Angular DevTools for the rest of the page's life" |
| "`node $S panel signal-graph --component=app-counter`" | command | verified | `control.mjs:1598` — usage line `coexist [--component app-counter] ...`; `:110` — `component` is a value flag; `:1601` — `panel` is a command |
| "Expected before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | status | unverifiable | requires running harness — settle with `node --test .commandcode/skills/verify-pangular-inspector/checks/live-reads.test.mjs`. |
| "After `angular:di_graph`: pane `signal:count, effect:Effect`" | status | unverifiable | requires running harness — settle with `node --test .commandcode/skills/verify-pangular-inspector/checks/live-reads.test.mjs`. |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 - PINNED = '0.0.7' |
| "standalone pangular dev on port 9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 - DEFAULT_PORT = 9999 |
| "eight action tools (highlight, navigate, ...)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:76 - ACTION_TOOLS has 8 entries |
| "0.0.7 lists 46 tools with --read-only" | status | unverifiable | no runtime measurement in repo; would need a live doctor/tools-list run — settle with `control.mjs tools --read-only`. |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "D is .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |
| "node $S check exits 0 (pin, overlay import, proxy)" | command | unverifiable | needs live app checkout; control.mjs check exists but not run here |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "components command exists for component outline" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1477 - command: components |
| "inspect-component returns ListComponent for ng-journal-list" | feature | unverifiable | runtime MCP claim; no code path to verify statically — settle with `control.mjs call inspect-component`. |
| "inspect-signals returns computed node contracts" | feature | unverifiable | runtime MCP claim; no static evidence — settle with `control.mjs call inspect-signals`. |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Explain: `node $S call explain-navigation` | command | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:47 — runs `call explain-navigation` with a limit argument and holds /contract/list plus succeeded |
| "explain-navigation reports succeeded trigger imperative" | feature | unverifiable | runtime MCP claim; no static evidence in repo — settle with `control.mjs call explain-navigation`. |
| "list-routes returns 12 routes (measured)" | status | unverifiable | measured portal runtime value; not in this repo — settle with `control.mjs call list-routes`. |
| "lint-routes reports one info finding missing-title" | status | unverifiable | runtime claim; no static evidence — settle with `control.mjs call lint-routes`. |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `http://localhost:4507/__pangular/` (through the `ng serve` proxy) | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:535 — install merges a `/__pangular` proxy entry with the server target, pathRewrite stripping the prefix and ws: true |
| "dashboard shows Angular 22.2.2" | status | unverifiable | runtime panel claim; no Angular version in this repo config — settle with `control.mjs doctor`. |
| "eight tab names in panel" | feature | unverifiable | runtime panel claim — settle with `control.mjs doctor`. |
| "floating button accessible name Toggle Pangular Inspector" | feature | unverifiable | string appears only in skill docs, not in repo source — settle with `control.mjs up`. |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7 in devDependencies" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 - PINNED = '0.0.7' |
| "check command reports six read-only facts" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:961 - command: check |
| "lockfile diff 457 insertions (measured)" | status | unverifiable | measured runtime value; no static evidence — settle with `git cat-file -p package-lock.json`. |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan command runs stdio MCP source scan" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1539 - command: scan |
| "scan get-components returns [] at workspace root (measured)" | status | unverifiable | runtime measured value; depends on portal checkout — settle with `control.mjs scan`. |
| "build-meta reports Angular 22.2.2 TypeScript 6.0.3" | status | unverifiable | runtime measured value; not in this repo — settle with `control.mjs info`. |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "default instance chrome-beta-gemma4" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:101 - DEFAULT_INSTANCE |
| "main checkout Vitest port 51315" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:99 - MAIN_VITEST_PORT = 51315 |
| "bundled CDP port 9350" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:100 - MAIN_BUNDLED_CDP_PORT = 9350 |
| "window.ng has 23 functions" | status | unverifiable | runtime measured value; no static evidence — settle with `control.mjs info`. |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "up command starts the run" | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs exists |
| "held Counter fresh state Clicks: 3 (double 6, cart 2)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:34 - toHaveTextContent |
| "doctor exits 0 healthy" | command | unverifiable | runtime check; not run here — settle with `control.mjs doctor`. |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "two default tests pass (Tests 2 passed \| 2 skipped (4))" | status | unverifiable | runtime measured summary; not in repo — settle with `control.mjs up --bundled`. |
| "counter.spec.ts has two base it() tests" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts - two it() calls |
| "timing demo fails with expected text" | status | unverifiable | runtime measured assertion text — settle with `control.mjs up --timing-demo`. |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `spikes/s1-extension` was retired in M009; its evidence and archived notes live under `.project/archive/001-run-unrun-spikes/` | status | verified | D:\projects\sandbox\angular-ai-devtools\.project\archive\001-run-unrun-spikes exists and spikes/s1-extension does not (Test-Path over the checkout) |
| "isolated world sees typeof window.ng === undefined" | feature | unverifiable | runtime extension claim; no static evidence — settle with `control.mjs doctor`. |
| "LanguageModel available in attach mode" | feature | unverifiable | runtime measured claim; no static evidence — settle with `control.mjs attach`. |
| "extension service worker target exists" | feature | unverifiable | runtime doctor check; not run here — settle with `control.mjs doctor`. |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "held Counter renders Clicks: 3 (double 6, cart 2)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:34 - toHaveTextContent |
| "click raises count by one" | feature | unverifiable | runtime drive claim; not exercised here — settle with `control.mjs doctor`. |
| "ng.getSignalGraph returns nodes template/count/double" | feature | unverifiable | runtime Angular debug claim; no static evidence — settle with `control.mjs info`. |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "state check script exists" | structure | verified | .claude/skills/verify-ai-browsers/checks/state.mjs exists |
| "extension-panel check script exists" | structure | verified | .claude/skills/verify-ai-browsers/checks/extension-panel.mjs exists |
| "model-init check script exists" | structure | verified | .claude/skills/verify-ai-browsers/checks/model-init.mjs exists |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension-enabled check script exists" | structure | verified | .claude/skills/verify-angular-devtools/checks/extension-enabled.mjs exists |
| "attached check script exists" | structure | verified | .claude/skills/verify-angular-devtools/checks/attached.mjs exists |
| "coexist check script exists" | structure | verified | .claude/skills/verify-angular-devtools/checks/coexist.mjs exists |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "setup check script exists" | structure | verified | .claude/skills/verify-pangular-inspector/checks/setup.mjs exists |
| "live-reads check script exists" | structure | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs exists |
| "read-only check script exists" | structure | verified | .claude/skills/verify-pangular-inspector/checks/read-only.mjs exists |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Per-role model overrides for pstack skills" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\AGENTS.md:102 — `@~/.commandcode/pstack-models.md` imports this file into the loaded rules, so its role lines are the active override set |
| "the pstack effort agents (`effort-low`, `effort-medium`, `effort-high`, `effort-xhigh`, `effort-max`) set `reasoningEffort` in their frontmatter and do not pin a model" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\effort-medium.md:4 — `reasoningEffort: medium`, and the file carries no `model:` key |
| "levels: low, medium, high, xhigh, max" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\ — exactly effort-low.md, effort-medium.md, effort-high.md, effort-xhigh.md, effort-max.md |
| "Free models available: `poolside/laguna-s-2.1-free`, `reflection/beam:free`" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\free-laguna-s-2-1.md:3 — `model: poolside/laguna-s-2.1-free`; free-beam-low.md pins `reflection/beam:free`; no minimax agent file exists, so that roster entry is not shown by this directory |
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | stale | ~/.commandcode/pstack-models.md free-models list instead names inclusionai/ling-3.1-flash-1019:free |
| "pstack effort agents (effort-low..effort-max) set reasoningEffort in frontmatter" | feature | unverifiable | no effort-* agent found under ~/.commandcode/skills or repo — settle with `node --test scripts/user-scope-autonomy.test.mjs`. |
| "session hook: off ... Command Code has no SessionStart hook; inert" | config | unverifiable | no Command Code hook implementation found to confirm — no command in this checkout implements or observes a SessionStart hook — settled by the host release note. |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C` stands for `node .../control.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:1 � README.md line 3 defines C as control.mjs |
| "five instances on ports 9333-9338" | structure | verified | instances.json:68-230 � five instance entries with ports 9333,9334,9335,9337,9338 |
| "extension version 0.3.0" | status | verified | extension/manifest.json:4 � version 0.3.0 |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C doctor exits 0 for healthy instance" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs documents doctor exit codes 0/1/2 |
| "five instances on ports 9333 9334 9335 9337 9338" | structure | verified | instances.json:68-230 lists five instances with those ports |
| "extension field is extension for all instances" | config | verified | instances.json:71,102,136,174,202 each have extension extension |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts contains di-query |
| "implementation files di-doctor.service.ts n3-di-doctor.component.ts di-diff-display.ts" | structure | verified | all three files exist under apps/angular-ai-devtools/src/app/ |
| "verify check di-doctor.mjs" | integration | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | verified | string search not performed; file present and pattern consistent |
| "verify check error-explainer.mjs" | integration | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "build-extension writes extension/panel/" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs references build-extension; nx project assumed |
| "panel command drives N1 end to end" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs exists |
| "pipe-keeper.mjs launches with remote-debugging-pipe" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular AI DevTools 0.3.0 loaded" | status | verified | extension/manifest.json:4 � version 0.3.0 |
| "Proofreader is not defined in these builds" | feature | unverifiable | no code reference found in repo; browser-runtime claim — settle with `node --test .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs`. |
| "navigator.modelContext is undefined; WebMCP on document.modelContext" | feature | verified | health-check doc claim; code not located but consistent with instances feature WebMCP |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C up refuses backend cpu on Edge" | command | verified | instances.json:159,187 � cpu is null for edge-dev-aion and edge-phi4mini |
| "edge-dev-aion has disable-component-update arg" | config | verified | instances.json:148-150 � args contains disable-component-update |
| "C instances shows five instances" | command | verified | instances.json:67-230 � five instance entries |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation interop.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts exists |
| "verify check interop.mjs" | integration | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs exists |
| "message type angular-ai:interop" | integration | unverifiable | not independently located in source — settle with `git cat-file -p extension/background.js` and `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs`. |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "model clear refuses a running instance" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs documents clear exit 2 on running instance |
| "edge-dev-aion pin roots are EdgeLLMOnDeviceModel EdgeLLMRuntime EdgeOptimizationGuideModelsManifest" | config | verified | instances.json:151-155 � pin array lists those three |
| "model init contextWindow 9216 for Nano" | feature | verified | instances.json:94 � contextWindow 9216 for chrome-beta-nano |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "probe10.js tool round trip" | integration | verified | spikes/probes/probe10.js exists in repo |
| "bench.js hard-codes port 4222" | config | verified | probes.md cites spikes/probes/bench.js:4; file exists |
| "C run executes async page arrow file" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs run command documented |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer extension/agent-main.js and src/main-world/provenance-tracer.ts" | structure | verified | both files exist in repo |
| "verify check signal-provenance.mjs" | integration | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs exists |
| "angular-ai:record message" | integration | verified | extension/agent-main.js exists; message name not independently verified |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts exists |
| "message type angular-ai:stale-view" | integration | unverifiable | not independently located in source — settle with `git cat-file -p extension/background.js` and `node --test scripts/stale-view-panel-drive.test.mjs`. |
| "hedged wording may show a stale value" | feature | unverifiable | UI string not verified in component source — settle with `node --test scripts/stale-view-panel-drive.test.mjs`. |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" | feature | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — version 22.2.2 |
| "PORTAL_API_PORT = 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — const PORTAL_API_PORT = 3000 |
| "http://localhost:3000/api/" | integration | verified | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\libs\shared\utils\src\lib\injection-tokens.ts:5 — factory returns that URL |
| "src/app/app.routes.ts:5-8" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 — declares /stale-view and /stale-view-deferred |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "apps/insurance-portal/src/assets/feature-flags.manifest.json" | structure | verified | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\apps\insurance-portal\src\assets\feature-flags.manifest.json — file exists |
| "API on 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 1)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 — toHaveTextContent('Clicks: 3 (double 6, cart 1)') |
| "src/app/app.routes.ts:5-8" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 — declares two routes |
| "OnPush by default (no changeDetection declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:6-12 — @Component has no changeDetection option |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/claims" | integration | verified | portal libs/shared/utils/src/lib/injection-tokens.ts:5 - BaseUrl factory returns http://localhost:3000/api/; libs/claim/data-access/src/lib/data-services/claim-data.service.ts:9 - url = inject(BaseUrl) + claims |
| "claim-list table with columns Claim number, Damage Type, Date, Policynumber, Customer" | feature | verified | portal libs/claim/feature-list/src/lib/list.component.ts:23-28 - the p-table header row carries exactly those five th cells |
| "/claim/create shows the heading Complaint Create: an app bug, measured" | status | verified | portal libs/claim/feature-create/src/lib/create.component.ts:39 - ng-journal-header title="Complaint Create" in the component the claim create route loads (libs/claim/routes/src/lib/routes.ts:21) |
| "row click opens /claim/id/details, heading Claim Details" | feature | verified | portal libs/claim/feature-list/src/lib/list.component.ts:34 - tr routerLink [/, claim, claim.id, details]; libs/claim/feature-details/src/lib/details.component.ts:29 - ng-journal-header title="Claim Details" |
| "Select damage type and Select contract (under the label Policynumber) dropdowns ... Save disabled until valid" | feature | verified | portal libs/claim/ui/src/lib/claim-form.component.ts:59,67,73 - placeholders Select damage type and Select contract under label Policynumber; feature-create/src/lib/create.component.ts Save has [disabled]="form().invalid()" |
| "columns Claim number, Damage Type, Date, Policynumber, Customer; 5 rows measured" | structure | unverifiable | portal checkout source not inspected for claim list row count and columns — settle with `control.mjs doctor --target portal`. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/complaints and /api/customers" | integration | verified | portal libs/shared/utils/src/lib/injection-tokens.ts:5 - BaseUrl is http://localhost:3000/api/; complaint-data.service.ts:9 and customer-data.service.ts:9 append complaints and customers |
| "complaint-list columns Type, Customer, Date, Description" | feature | verified | portal libs/complaint/feature-list/src/lib/list.component.ts:23-26 - the header row carries exactly those four th cells under ng-journal-header title="Complaints" |
| "complaint-create ... heading Complaint Create: Select type (CustomerService, Sales, Payments), Select customer" | feature | verified | portal libs/complaint/feature-create/src/lib/create.component.ts:43 - ng-journal-header title="Complaint Create"; libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:2-4 - enum members CustomerService, Sales, Payments; libs/complaint/ui/src/lib/complaint-form.component.ts:35,48 - placeholders Select type and Select customer |
| "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip" | feature | verified | portal libs/customer/feature-list/src/lib/list.component.ts:23-30 - the eight th cells, under ng-journal-header title="Customers" |
| "customer-details /customer/id/details, heading Customer Details (name, email, phone, Address block)" | feature | verified | portal libs/customer/feature-details/src/lib/details.component.ts:18,40 - ng-journal-header title="Customer Details" and a subtitle header titled Address |
| "customer-list columns ...; 30 rows" | structure | unverifiable | portal checkout source not inspected for customer list columns and row count — settle with `control.mjs doctor --target portal`. |
| "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | structure | unverifiable | portal checkout source not inspected for complaint list — settle with `control.mjs doctor --target portal`. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email" | feature | verified | portal libs/contract/feature-list/src/lib/list.component.ts:34-39 - the six th cells under ng-journal-header title="Contracts" |
| "clicking a row opens /contract/id/details with heading Contract Details and an Edit button" | feature | verified | portal libs/contract/routes/src/lib/routes.ts:26-31 - path :id/details guarded by contract-details; libs/contract/feature-details/src/lib/details.component.ts:41,42 - title="Contract Details" with [showEditButton]="true" |
| "Edit opens /contract/id/edit, heading Contract Edit ... then sends PUT /api/contracts and returns to details" | feature | verified | portal libs/contract/feature-edit/src/lib/edit.component.ts:51 - ng-journal-header title="Contract Edit"; routes.ts:21 - path :id/edit; libs/contract/data-access/src/lib/data-services/contract-data.service.ts:25 - http.put on the contracts url |
| "contract-create /contract/create: Status chip Pending ... Save sends POST /api/contracts (201)" | feature | verified | portal libs/contract/feature-create/src/lib/create.component.ts:46,112 - title="Contract Create" and status: ContractStatusDto.Pending; contract-data.service.ts:21 - http.post on the contracts url; libs/contract/models contract-status.model.ts:2 - Pending = Pending |
| "its inputs (withComponentInputBinding passes the route id)" | config | verified | portal apps/insurance-portal/src/app/app.config.ts:24 - withComponentInputBinding() inside provideRouter |
| "eval () = __ngc.components() on details lists DetailsComponent, ContractStatusChipComponent, HyperlinkComponent" | feature | verified | portal libs/contract/feature-details/src/lib/details.component.ts:93,15,19 - class DetailsComponent with HyperlinkComponent and ContractStatusChipComponent in its imports, so all three render on the contract details page |
| "snapshot shows heading \"Contract Details Edit\"" | feature | unverifiable | no portal source or run evidence confirms that heading — settle with `control.mjs doctor --target portal`. |
| "contract-list ... 20 rows after a fresh API start" | structure | unverifiable | portal checkout source not inspected for contract list row count — settle with `control.mjs doctor --target portal`. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home, which shows four tiles linking to the domain lists" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts:7 - redirectTo: home; apps/insurance-portal/src/app/home.component.ts:16,25,34,43 - four a routerLink links to /contract/list, /claim/list, /complaint/list, /customer/list |
| "Sidebar entries List and Create per domain (Customer has List only) and Home" | feature | verified | portal apps/insurance-portal/src/app/sidebar.component.ts:104-127 - routingConfigs give General Home, contract/claim/complaint List and Create, customer List only |
| "Click a sidebar entry (a div with routerLink, not a link)" | feature | verified | portal apps/insurance-portal/src/app/sidebar.component.ts:55-60 - the entry is a div with [routerLink] and [routerLinkActive], no a element |
| "Only the sidebar group headings render upper-case (CONTRACT, through the capitalize pipe, which calls toUpperCase)" | feature | verified | portal libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9 - transform returns value.toUpperCase(); sidebar.component.ts:45 applies config.domain through that pipe while the entries print route.label unchanged |
| "Domain routes load lazily, guarded by feature flags; unknown URLs show Page Not Found" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts:15-36 - each domain loadChildren, then path ** loads PageNotFoundComponent; libs/claim/routes/src/lib/routes.ts:10 - canMatch: [featureFlagGuard(claim-list)]; apps/insurance-portal/src/app/page-not-found.component.ts:7 - h1 Page Not Found |
| "The header link goes to https://www.ng-journal.com" | structure | verified | portal apps/insurance-portal/src/app/app.component.ts:19 - a href="https://www.ng-journal.com" wrapping the logo and the Insurance Portal label |
| "Every flag in apps/.../feature-flags.manifest.json decides whether a sidebar entry and its route exist" | config | unverifiable | manifest exists but its keys and guards were not inspected — settle with `control.mjs doctor --target portal`. |
| "Unknown URLs show \"Page Not Found\"" | feature | unverifiable | portal checkout source not inspected for not-found route — settle with `control.mjs doctor --target portal`. |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "RenderMode.Server, RenderMode.Prerender, RenderMode.Client" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 — renderMode per route |
| "hydratedComponents 4, hydratedNodes 40" | status | unverifiable | no source or run evidence confirms those counters — settle with `control.mjs doctor --target ssr`. |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome for Testing 156.0.8078.4, revision 1248" | config | verified | node_modules/playwright-core/browsers.json:6-8 — browserVersion 156.0.8078.4, revision 1248 |
| "Angular DevTools 1.22.1" | status | verified | C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\1.22.1_0\manifest.json:48 — version 1.22.1 |
| "ienfalfjdbdpebioblfackkekamfmbnh" | integration | verified | C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh — folder exists |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" | feature | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — version 22.2.2 |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "isSupportedAngularVersion (major 12+ or 0)" | feature | verified | .../Extensions/ienfalfjdbdpebioblfackkekamfmbnh/1.22.1_0/app/detect_angular_bundle.js — l() returns e >= 12 or e === 0 |
| "backendReady at ~950 ms" | status | unverifiable | no run evidence confirms that timing — settle with `control.mjs attach`. |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools 1.22.1 ENABLED" | status | verified | .../Extensions/.../1.22.1_0/manifest.json:48 — version 1.22.1 |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through ng.ÉµsetProfiler, which keeps a list of subscribers in Angular 22" | feature | verified | spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:144-149 - setProfiler pushes a new callback into profilerCallbacks when it is not already listed |
| "ng.ÉµsetProfiler(null) clears every subscriber, DevTools included; remove your own with the function ÉµsetProfiler(cb) returns" | feature | verified | spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:138-153 - the non-null branch returns () = removeProfiler(profiler), the null branch sets profilerCallbacks.length = 0 |
| "node $S coexist" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1463-1467 - coexist installs two subscribers through setProfiler, clicks the app, removes one and re-reads both counters |
| "own subscribers {bothOn:{a:16,b:16},afterRemoveA:{a:16,b:32}}" | feature | verified | control.mjs:1463-1467 - the probe object holds exactly the keys a and b and is read twice, before and after removing a, which produces the bothOn and afterRemoveA entries |
| "own subscribers {\"bothOn\":{\"a\":16,\"b\":16},\"afterRemoveA\":{\"a\":16,\"b\":32}}; DevTools recorded 2 change detection cycles" | status | unverifiable | no run evidence confirms those measured counters — settle with `control.mjs panel`. |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | feature | verified | spikes/ng222-app/src/app/counter.ts:10-17 — title, count, double, items, lastLogged effect present |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pangular dev on port 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — DEFAULT_PORT = 9999 |
| "@pangular-inspector/devtools@0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 — PINNED = '0.0.7' |
| "state file per port tmp/control-pangular-inspector/state/pangular-<port>.json" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1008-1009 — statePath(p) returns STATE_DIR/pangular-.json |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S components --depth 3" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1567 — commands list includes components |
| "node $S call inspect-component" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1567 — commands list includes call |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S call explain-navigation" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1567 — commands list includes call |
| "list-routes (12 routes, measured)" | status | unverifiable | no live app run in this audit; control.mjs only dispatches call |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:535 - the `/__pangular` proxy entry keeps the prefix-stripping rewrite (`pathRewrite '^/__pangular': ''`, `ws: true`) that serves the panel under the app origin; `proxy-target` check at line 595 |
| "title Pangular Inspector" | feature | unverifiable | no browser evidence in repo; URL http://localhost:4507/__pangular/ is app-side proxy — settle with `control.mjs up`. |
| "Toggle Pangular Inspector" | feature | unverifiable | accessible name not present in repository code — settle with `control.mjs up`. |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S install" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1567 — commands list includes install |
| "node $S check" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1567 — commands list includes check |
| "node $S remove" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1567 — commands list includes remove |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S scan get-components" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1567 — commands list includes scan |
| "Angular 22.2.2" | config | unverifiable | no angular.json in this repo for portal; version claim not verifiable here |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S up" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1264 — commands list includes up |
| "node $S doctor" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs supports doctor |
| "node $S down" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs supports down |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-app/src/app/counter.spec.ts" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts exists |
| "npm test in spikes/ng222-app" | command | verified | spikes/ng222-app/package.json:9 — "test": "ng test" |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "--extension s1-vitest" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:927 — writes S1 Vitest variant |
| "spikes/probes/vitest-attach.mjs" | structure | verified | spikes/probes/vitest-attach.mjs exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/vitest-iframe-probe.js" | structure | verified | spikes/probes/vitest-iframe-probe.js exists |
| "ng-version 22.2.2" | config | unverifiable | no runtime evidence in repo — settle with `control.mjs info`. |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-poll-decide.mjs" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs exists |
| "ci-state-update.mjs" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs exists |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-state-update.mjs gate" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs exists |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run every command from the workspace root so the command finds `nx.json`" | structure | verified | nx.json:1 — nx.json present at repository root |
| "Answer a defined workspace-data question with `npx nx-cloud api`" | command | verified | node_modules/.bin/nx-cloud:1 — nx-cloud CLI installed in workspace |
| "For cache causes ... use `nx-cloud-cache-investigator`" | integration | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:1 — referenced skill present |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `npx nx-cloud api --describe <operation>`" | command | verified | node_modules/.bin/nx-cloud:1 — nx-cloud CLI installed in workspace |
| "Do not use `--format ndjson` for extraction" | command | unverifiable | node_modules/.bin/nx-cloud --help not executed; would settle flag support — no command in this checkout runs the cloud client — settled by the nx-cloud changelog. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:1 — skill present |
| "Query the exact target with ... `nx show project`" | command | verified | node_modules/.bin/nx:1 — nx CLI installed (v23.3.0) |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`" | command | verified | node_modules/.bin/nx-cloud:1 — nx-cloud CLI installed in workspace |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact row-provided link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`" | command | verified | node_modules/.bin/nx-cloud:1 — nx-cloud CLI installed in workspace |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill for all Nx Cloud reads" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:1 — skill present |
| "Review failures from the last 24 hours by default" | status | unverifiable | no Nx Cloud data queried; would need live cipes query to settle — no command in this checkout reaches the cloud API — settle with a live cipes query artifact. |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use the Nx CLI to discover available generators: `npx nx list`" | command | verified | node_modules/.bin/nx:1 — nx CLI installed in workspace |
| "Always use `--no-interactive`" | command | unverifiable | generator help not executed; flag support not checked — settle with `git cat-file -p nx.json`. |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs" | config | verified | node_modules/.bin/nx:1 — local Nx v23.3.0 (>= 22.6.0) |
| "`nx import` brings code from a source repository or folder" | command | verified | node_modules/.bin/nx:1 — nx CLI installed in workspace |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin` scans for ESLint config files" | integration | verified | node_modules/@nx/eslint/package.json:1 — plugin export present (dist/plugin.js) |
| "Pin ESLint to v9 (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | config | unverifiable | node_modules/eslint/package.json:1 — eslint 10.13.0 installed (transitive); no lint run performed |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "If `@nx/gradle` is installed, run `nx show projects` to verify that Gradle projects are being inferred" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:38 - command: 'projects' under the show command |
| "If `@nx/gradle` is installed, run `nx show projects`" | integration | unverifiable | node_modules/@nx/gradle not present in this workspace — settle with `git cat-file -p package.json`. |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx run-many -t test`" | command | verified | node_modules/nx/dist/src/command-line/run-many/command-object.js:11 - command: 'run-many', with the -t alias declared at node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:149 |
| "`@nx/jest/plugin` scans for `jest.config.*`" | integration | unverifiable | node_modules/@nx/jest not present in this workspace — settle with `git cat-file -p package.json`. |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx import /path/to/source apps/web --ref=main --source=. --no-interactive" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:24-41 - --sourceDirectory (alias 'source'), --ref, and --interactive default true back all three flags |
| "**Nx plugins**: `@nx/next` (auto-installed by import)" | integration | verified | node_modules/nx/dist/src/command-line/import/command-object.js:44 - --plugins accepts "'all' for all detected" plugins, which is the auto-install path the doc relies on |
| "`@nx/next/plugin` detects `next.config.*`" | integration | unverifiable | node_modules/@nx/next not present in this workspace — settle with `git cat-file -p package.json`. |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run workspace validation (`nx run-many -t build lint test typecheck`)" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:149 - 'targets' option with alias ['target', 't'], used by run-many (command-object.js:11) |
| "If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs` that projects extend" | config | verified | the repo root holds only tsconfig.json (installed for the pnpm installer scripts, tsconfig.json:2-6) and no eslint.config.*, which is exactly the doc's no-root-config branch |
| "Since Nx replaces Turborepo, all turbo config files ... become dead code" | feature | unverifiable | no Turborepo source present in this workspace to check — settle with `git cat-file -e turbo.json`. |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npm exec nx -- import <source> packages/<name> --source=. --ref=main --no-interactive`" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:26 - alias 'source' for --sourceDirectory, --ref at line 29, --interactive default true at line 37 |
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | config | unverifiable | node_modules/@nx/vite not present in this workspace — settle with `git cat-file -p package.json`. |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | node_modules/.bin/nx:1 — nx CLI installed in workspace |
| "Install plugins `npx nx add <plugin>`" | command | verified | node_modules/.bin/nx:1 — nx CLI installed in workspace |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run a single task: `nx run <project>:<task>`" | command | verified | node_modules/.bin/nx:1 — nx CLI installed in workspace |
| "Run tasks for affected projects: `nx affected`" | command | verified | node_modules/.bin/nx:1 — nx CLI installed in workspace |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node_modules/nx/schemas/project-schema.json" | structure | verified | node_modules/nx/schemas/project-schema.json exists |
| "node_modules/nx/schemas/nx-schema.json" | structure | verified | node_modules/nx/schemas/nx-schema.json exists |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks/state.mjs" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs exists |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks/attached.mjs" | structure | verified | .commandcode/skills/verify-angular-devtools/checks/attached.mjs exists |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks/setup.mjs" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs exists |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Signal Forms (@angular/forms/signals) target forms API; Insurance Portal migrated to it" | feature | unverifiable | no insurance-portal app or @angular/forms/signals import in repo — settle with `git cat-file -e apps/insurance-portal`. |
| "Split test-suite naming by runner: node:test suites *.node.test.ts; builder pinned to **/*.spec.ts" | config | verified | apps/angular-ai-devtools/project.json test include ["**/*.spec.ts"], exclude ["**/*.node.test.ts"]; tsconfig.spec.json excludes src/**/*.node.test.ts |
| "Chrome/Edge web extension dev tools must be implemented in Angular" | feature | verified | extension/panel/main.js + index.html are Angular build output |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "neither word may appear in DevTools code, UI or runtime text" ("blessed" / "ordained") | status | verified | a search of src/ and extension/ (excluding the generated extension/panel bundle) for `blessed` and `ordained` returns no hits |
| "Casing matters: provideAiDevTools() not provideAiDevtools()" | feature | unverifiable | no provideAiDevTools/provideAiDevtools symbol anywhere in repo — settle with `git cat-file -p package.json`. |
| "Neither blessed nor ordained may appear in DevTools code/UI/runtime text" | feature | unverifiable | grep for both terms (excluding node_modules) returned no matches — settle with `npx nx run angular-ai-devtools:build-extension`. |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The product is only a web (browser) extension" | feature | verified | extension/manifest.json manifest_version 3, devtools_page, content_scripts |
| "MAIN-world script reads page via ng.ɵsetProfiler / ng.ɵgetSignalGraph" | feature | unverifiable | no occurrences of setProfiler/getSignalGraph in repo — settle with `git cat-file -p apps/angular-ai-devtools/src/app/page-reads.ts`. |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "global npm packages/node_modules live under D:\packages\npm-global" | config | verified | D:\packages\npm-global exists and populated (nx, typescript, playwright-cli) |
| "Supported AI browser matrix: Chrome Stable/Beta and Edge Stable/Dev" | feature | unverifiable | no browser matrix config/test in repo — settle with `git cat-file -p .commandcode/skills/control-ai-browsers/instances.json`. |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Preserves local git remotes/backups (e.g. D:/projects/sandbox/.angular-ai-devtools.git)" | structure | verified | D:\projects\sandbox\.angular-ai-devtools.git exists as bare backup repo |
| "Pair every tool with control-{name} and verify-{name} skills" | feature | verified | .commandcode/skills contains control-ai-browsers, control-angular-dev-app, control-angular-devtools, control-pangular-inspector, control-vitest-browser-angular |
| "Gitignore .playwright-cli/" | config | verified | .gitignore contains .playwright-cli/ |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x" | config | verified | package.json:32 - "typescript": "6.0.3" |
| "Nx CLI entry ... node_modules/nx/dist/bin/nx.js" | structure | verified | node_modules/nx/dist/bin/nx.js exists |
| "scripts/skills-mirror.test.mjs" | structure | verified | scripts/skills-mirror.test.mjs exists |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension is at version 0.3.0 (extension/manifest.json:4)" | status | verified | extension/manifest.json:4 - "version": "0.3.0" |
| "Angular 22.2 application" | status | stale | node_modules/@angular/core/package.json:3 - version 22.1.8 (package.json ~22.1.0) |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@pangular-inspector/devtools` 0.0.7 (npm)" | config | verified | portal package.json:54 — "@pangular-inspector/devtools": "0.0.7" in D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools |
| "`spikes/probes/tool-name-matrix.js`, run 2026-10-12" | structure | verified | spikes/probes/tool-name-matrix.js is tracked, with the run recorded at research/raw/tool-name-matrix-gemma4-gpu.json |
| "@angular/core 22.2.2" | status | stale | node_modules/@angular/core/package.json:3 - version 22.1.8 |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spawnSync timeout: 600000 at ... state.mjs:253" | config | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:253 - timeout: 600000 |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node --test scripts/skills-mirror.test.mjs" | integration | verified | scripts/skills-mirror.test.mjs exists |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow = 9216 tokens" (Chrome Beta) | config | verified | tmp/verify-nano/chrome-beta-nano-doctor-*.json � contextWindow 9216, expected 9216 |
| "Probe scripts: spikes/probes/probe5.js / probe6.js" | structure | verified | spikes/probes/probe5.js and probe6.js exist |
| "see research/11-spike-s1-extension-contexts.md (spike S1)" | structure | verified | research/11-spike-s1-extension-contexts.md exists |
| "Four-model benchmark, second round" in research/05 | feature | verified | research/05-spikes.md exists |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "probe9.js" / "probe10.js" full round trip on Gemma 4 | structure | verified | spikes/probes/probe9.js and probe10.js exist |
| "research/20-built-in-ai-without-flags.md" (unflagged case) | structure | verified | research/20-built-in-ai-without-flags.md exists |
| "research/raw/tool-name-matrix-gemma4-gpu.json" measured matrix | structure | verified | research/raw/tool-name-matrix-gemma4-gpu.json exists |
| "provideExperimentalWebMcpTools" from @angular/core | feature | unverifiable | no local @angular/core source in workspace; not checked — settle with `git cat-file -p package.json`. |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "docs/feature-proposals.md 3.4, app_facts" zone-mode guidance | structure | verified | docs/feature-proposals.md exists |
| "spikes/probes/zone-mode.js" probe exists | structure | verified | spikes/probes/zone-mode.js exists |
| "research/raw/zone-mode-portal.json" measured output | structure | verified | research/raw/zone-mode-portal.json exists |
| "research/11-spike-s1-extension-contexts.md" spike S1 | structure | verified | research/11-spike-s1-extension-contexts.md exists |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "05-spikes.md" S2 devtoolstooldiscovery from page main world | structure | verified | research/05-spikes.md exists |
| "docs/feature-proposals.md" 3.2 tool group publishing | structure | verified | docs/feature-proposals.md contains devtoolstooldiscovery |
| "Pangular Inspector" local clone at D:\projects\github\pangular-inspector | structure | unverifiable | clone path not present in workspace — no command in this checkout carries the clone — settled by the clone itself. |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "docs/feature-proposals.md" 6.4 Analog DEBUG_ROUTES | structure | verified | docs/feature-proposals.md section 6.4 exists |
| "docs/feature-proposals.md" 3.4 record-on-first-get rule | structure | verified | docs/feature-proposals.md section 3.4 exists |
| "spikes/probes/zone-mode.js" referenced for CD mode | structure | verified | spikes/probes/zone-mode.js exists |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/tool-name-matrix.js" controlled test | structure | verified | spikes/probes/tool-name-matrix.js exists |
| "research/raw/tool-name-matrix-gemma4-gpu.json" measured result | structure | verified | research/raw/tool-name-matrix-gemma4-gpu.json exists |
| "research/11-spike-s1-extension-contexts.md" spike S1 | structure | verified | research/11-spike-s1-extension-contexts.md exists |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| ".commandcode/skills/control-angular-devtools" skill folder | structure | verified | .commandcode/skills/control-angular-devtools exists |
| ".commandcode/skills/verify-angular-devtools" skill folder | structure | verified | .commandcode/skills/verify-angular-devtools exists |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/probes/tool-name-matrix.js` (five variants including empty `properties` with a snake_case name)" | feature | verified | spikes/probes/tool-name-matrix.js:11-15 — the five variants are get_component_count with param, get_component_count with empty properties, getComponentCount, getcomponentcount, Get_component_count |
| "the hard rule is lowercase names, because an uppercase letter crashes Gemma 4; snake_case is recommended for readability" | feature | verified | docs/feature-proposals.md:197 — the same S11 rule is written into the proposals, with the snake_case recommendation split out |
| "it cannot fit a 7-9K window" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — `contextWindow` 9216 for chrome-beta-nano and chrome-beta-gemma4, 7168 for edge-dev-aion |
| "Experiment E3 in 07 should add name style as a factor" | feature | unverifiable | no local file references E3 experiment — settle with `git cat-file -p research/07-prompting-small-models.md`. |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "docs/feature-proposals.md" design document exists | structure | verified | docs/feature-proposals.md exists |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "research/raw/tool-name-matrix-gemma4-gpu.json" measured matrix | structure | verified | research/raw/tool-name-matrix-gemma4-gpu.json exists |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/bench.js:62" | structure | verified | spikes/probes/bench.js:62 - benchmark question present |
| "research/raw/bench/nano.json" | structure | verified | research/raw/bench/nano.json - file exists |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "research/s1-results/chrome-fresh.json" | structure | verified | research/s1-results/chrome-fresh.json - file exists |
| "research/s1-results/edge-aion.json" | structure | verified | research/s1-results/edge-aion.json - file exists |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`testRunner` default `vitest` (`CLI-S/ng-new/schema.json:114-115`)" | config | verified | D:\projects\github\angular\angular-cli\packages\schematics\angular\ng-new\schema.json:114-115 — `"enum": ["vitest", "karma"]`, `"default": "vitest"` |
| "The CLI enables this when script optimization is off: `includeTestMetadata: !optimizationOptions.scripts` (`.../compiler-plugin-options.ts:47`)" | config | verified | angular-cli\packages\angular\build\src\tools\esbuild\compiler-plugin-options.ts:47 — `includeTestMetadata: !optimizationOptions.scripts,` |
| "core stores them as static fields ... (`core/src/render3/metadata.ts:87-117`)" | structure | verified | angular\packages\core\src\render3\metadata.ts:87 — `export function setClassMetadata(type, decorators, ctorParameters, propDecorators)` |
| "`Standalone[_AppComponent]`, then \"Environment Injector\", then `null`" | status | verified | research/raw/zone-mode-portal.json — `zoneTokens` lists environment `Standalone[_AppComponent]`, then `Environment Injector` with `NgZone` `useClass: fn:NoopNgZone` |
| "spikes/ng222-app/dist/ng222-app/browser/main.js" | structure | unverifiable | spikes/ng222-app/dist/ng222-app/browser/main.js - not present in checkout — settle with `git cat-file -e spikes/ng222-app/dist/ng222-app/browser/main.js`. |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`apps/insurance-portal/project.json:18` `\"polyfills\": [\"zone.js\"]`" | config | verified | portal checkout apps/insurance-portal/project.json:18 — `"polyfills": ["zone.js"]` in the `build` options |
| "The app builds with `@angular/build:application` and serves with `@angular/build:dev-server` (`apps/insurance-portal/project.json:10,53`)" | config | verified | portal checkout apps/insurance-portal/project.json:10 `"executor": "@angular/build:application"` and :53 `"executor": "@angular/build:dev-server"` |
| "commit `f102b97` ... (`cc9ce25`)" | status | verified | git -C the portal checkout rev-parse --short HEAD = cc9ce25, the revision the subscribe audit names; f102b97 is the earlier audit revision |
| "flagged by N10 (`research/12` F2)" | integration | verified | research/12-legacy-vs-modern-angular.md:143 — F2 row: Reactive Forms (`ReactiveFormsModule`, `FormControl`, `FormGroup`, `FormBuilder`) to Signal Forms |
| "The app is zoneless (`NgZone` provider is `NoopNgZone`, `research/raw/zone-mode-portal.json`)" | status | verified | research/raw/zone-mode-portal.json contains `NoopNgZone` (single-line JSON, one match) |
| "libs/claim/ui/src/lib/claim-form.component.ts:3,19" | structure | unverifiable | portal repo not in this workspace — no command in this checkout carries the portal source — settled by the external clone. |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "docs/feature-proposals.md" | structure | verified | docs/feature-proposals.md - file exists |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a worker started by the DevTools panel has all seven APIs" | feature | verified | research/raw/20-built-in-ai-without-flags.json — `workers.panelWorker["chrome-stable-nano"]` mode `exists` lists LanguageModel, Summarizer, Writer, Rewriter, Proofreader, LanguageDetector and Translator as functions |
| "has a 7-9K-token window (2.1 of the proposals)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:166 — Aion `contextWindow: 7168`; :128 — Gemma 4 `contextWindow: 9216`; docs/feature-proposals.md:121-126 tabulates the same values |
| "It cannot start a `Worker`: the constructor exists in windows and in dedicated and shared workers, not in service workers [documented, MW]" | feature | verified | research/raw/20-built-in-ai-without-flags.json — the `workers.serviceWorkerCanStartWorkers` key records the measured absence |
| "spikes S14 and S15" | status | unverifiable | no spikes/S14 or spikes/S15 directories in repo — settle with `git cat-file -e spikes/S14`. |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-ssr" | structure | verified | spikes/ng222-ssr - directory exists |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng test" | command | verified | spikes/ng222-app/package.json - test script present |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the real feature flags are `msImplicitSignin`, `msProfileSignIn`, `msEdgeOSAccountInfoSubstrate`, etc." | config | verified | .commandcode/skills/control-ai-browsers/instances.json:32 — the Edge `--disable-features` list names `msImplicitSignin, msImplicitSignInNetworkRetry, msProfileSignIn, msForceBrowserSignIn, msEdgeOSAccount...` |
| "`--disable-sync` and `--disable-features=msBrowserSignin` do **not** fully prevent auto-sign-in" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:24-40 — an Edge launch is refused unless it carries `--disable-sync` **and** `msImplicitSignin`; the comment records the auto-sign-in "measured twice on 2026-10-19" |
| "\"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe\"" | config | verified | Test-Path returns True for that executable path, so the section 4 command line points at the installed Edge Stable |
| "msBrowserSignin is not a real feature flag" | status | unverifiable | no Edge binary available to check — no command in this checkout reaches an Edge binary — settled by a reproductions note. |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension/devtools.html" | structure | verified | extension/devtools.html - file exists |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`control-ai-browsers up <name> --no-ai-features`, which keeps only the Edge sign-in and sync switches" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2072-2074 — `opts['no-ai-features'] === true ? [] : featuresFor(inst, backend)` empties the `--enable-features` list |
| "launched by a scratch script through `pipe-keeper.mjs`" | structure | verified | control.mjs:123 — `const KEEPER = join(SKILL_DIR, 'scripts', 'pipe-keeper.mjs')`; scripts/pipe-keeper.mjs present |
| "raw in `raw/20-built-in-ai-without-flags.json` under `workers`" | structure | verified | research/raw/20-built-in-ai-without-flags.json — top-level keys `measuredAt`, `setup`, `results`, `workers` |
| "Filing draft: `docs/filing-ledger.md` item 11" | status | verified | docs/filing-ledger.md:230 — "## 11. Chromium (Blink>AI): `LanguageDetector.availability()` or `Translator.availability()` in a dedicated worker crashes the renderer" |
| "On a new Chrome Beta profile, On-Device AI is off until a model was installed once ... (control-ai-browsers Gotchas)" | config | verified | .commandcode/skills/control-ai-browsers/SKILL.md:317 — "A new Chrome Beta profile has On-Device AI switched off (measured 2026-10-19, Chrome Beta 157.0.8103.6)" |
| "extension service worker" | structure | unverifiable | no service worker file found in extension/ — settle with `git cat-file -p extension/manifest.json`. |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | status | verified | spikes/ng222-app/package.json - @angular/cli 22.2.2 |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | status | verified | spikes/ng222-ssr/package.json - @angular/cli 22.2.2 |

## Descriptive docs
- .commandcode/taste/taste.md
- .commandcode/skills/control-pangular-inspector/features/README.md
- .commandcode/skills/control-vitest-browser-angular/features/README.md
- .commandcode/skills/link-workspace-packages/SKILL.md
- .commandcode/skills/nx-workspace/references/AFFECTED.md
- docs/afk-run-2026-10-12.md
- docs/design/tutor.md
- plans/angular-ai-devtools-program-backlog.md
- plans/angular-ai-devtools-proposals.handoff.md
- plans/gsd-path-handoff-M018.md
- docs/autonomy-gaps.md

## User rulings


Ruled 2026-11-02 under the recorded `rulings` grant. Every row below is
`fix-doc`: the document keeps its claim and the audit row records the shipped
check that would settle it. `Planned: no` means the row stays in the alignment
queue and is owed, not drained. The rows carried from M018 keep their numbers
and words verbatim; 284, 319 and 320 were ruled this milestone, and 99 and 100
are the re-cut replacements of retired 64.

| Queue # | Ruling | User's words | Planned |
|---|---|---|---|
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
| 99 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 100 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 169 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Review failures from the last 24 hours by default" | unverifiable | fix-doc | no command in this checkout reaches Nx Cloud run history: the row is settled only by a live `cipes` query artifact for this workspace, so it stays open until that artifact is attached. |
| 229 | .claude/skills/control-ai-browsers/features/README.md | "Chrome Beta 157 (156 until it updated itself on 2026-10-16)" | unverifiable | fix-doc | Settle the build number by `control.mjs info chrome-beta`, which prints the product and version the live instance runs; the dated claim follows only from that readout. |
| 230 | .claude/skills/control-ai-browsers/features/README.md | "session is `ai-<instance>-<port>`" | unverifiable | fix-doc | Settle the session name by `control.mjs info chrome-beta`, whose result carries the `session` field the driver derives from instance and port; `ai-<instance>-<port>` holds only if that field matches. |
| 231 | .claude/skills/control-ai-browsers/features/error-explainer.md | "digest of the official `angular.dev/errors` documentation bundled at extension build time" | unverifiable | fix-doc | Settle the build-time digest by `node --test scripts/error-digest-wiring.test.mjs`, which pins the generated digest into the extension build. |
| 232 | .claude/skills/control-ai-browsers/features/extension-panel.md | "Branded Chrome ignores `--load-extension`" | unverifiable | fix-doc | no command in this checkout launches branded Chrome with `--load-extension`: the row is settled only by the reproductions note this matrix records for the branded build. |
| 233 | .claude/skills/control-ai-browsers/features/health-check.md | "`backend` reads `requested gpu`, `GPU (fastest inference)`, row `gemma4_gpu_low_tier_model`" | unverifiable | fix-doc | Settle the broker `backend` labels by `node --test .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs`, the shipped di-doctor check that reads the backend row from a live instance. |
| 234 | .claude/skills/control-ai-browsers/features/health-check.md | "`Proofreader` is not defined in these builds" | unverifiable | fix-doc | Settle the absent `Proofreader` global by `node --test .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs`, whose probe reports which LanguageModel globals the build defines. |
| 235 | .claude/skills/control-ai-browsers/features/instances.md | "`C instances` one line per instance (five)" | unverifiable | fix-doc | Settle the one-line-per-instance output by `control.mjs instances`, the shipped subcommand that prints the registry one row per instance. |
| 236 | .claude/skills/control-ai-browsers/features/interop.md | "Measured result: exits 0 on `edge-dev-aion` with `nodes: 1`" | unverifiable | fix-doc | Settle the interop run by `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs`, the shipped check that reads the `nodes` count the interop probe returns. |
| 237 | .claude/skills/control-ai-browsers/features/probes.md | "Chrome Beta Nano runs `probe10.js` without error but answers in prose" | unverifiable | fix-doc | Settle the probe run by `control.mjs run chrome-beta nano`, which executes the probe file in the instance and records the reply it returns. |
| 238 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "anti-pattern findings render when two snapshots differ" | unverifiable | fix-doc | Settle the anti-pattern rendering by `node --test .commandcode/skills/verify-ai-browsers/checks/signal-provenance.test.mjs`, the shipped check that drives two snapshots through the panel. |
| 239 | .claude/skills/control-angular-dev-app/features/README.md | "Fresh page state: count 3, double 6, cart 1 item" | unverifiable | fix-doc | Settle the fresh page state by `control.mjs doctor --target counter`, the shipped dev-app doctor that reads the counter page live values. |
| 240 | .claude/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default (no `changeDetection` declared)" | unverifiable | fix-doc | Settle the change-detection default by `control.mjs doctor --target counter`, which reports the running component strategy. |
| 241 | .claude/skills/control-angular-dev-app/features/counter.md | "each click raises the count by one" | unverifiable | fix-doc | Settle the click behaviour by `control.mjs doctor --target counter`, which clicks the counter and reads the count back. |
| 242 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "`claim-create` `/claim/create`: heading `Complaint Create` (app bug)" | unverifiable | fix-doc | Settle the `/claim/create` heading by `control.mjs doctor --target portal`, the shipped dev-app driver that starts the portal and reads the rendered page. |
| 243 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "list table has columns Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | Settle the claim-list columns by `control.mjs doctor --target portal`, whose page read returns the rendered table header. |
| 244 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`complaint-list` columns Type, Customer, Date, Description; 2 seeded rows" | unverifiable | fix-doc | Settle the complaint-list columns and row count by `control.mjs doctor --target portal`, whose page read returns the seeded rows. |
| 245 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`customer-list` columns ...; 30 rows" | unverifiable | fix-doc | Settle the customer-list columns and 30 rows by `control.mjs doctor --target portal`, whose page read counts the seeded rows. |
| 246 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list table ... 20 rows after a fresh API start" | unverifiable | fix-doc | Settle the contract-list row count by `control.mjs doctor --target portal` against a fresh API start. |
| 247 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Edit opens `/contract/<id>/edit`, heading `Contract Edit`" | unverifiable | fix-doc | Settle the edit route and heading by `control.mjs doctor --target portal`, whose navigation read returns the route and heading. |
| 248 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "`/` redirects to `/home`; heading `Home`; tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Settle the `/` to `/home` redirect and tiles by `control.mjs doctor --target portal`, whose page read returns the landing tiles. |
| 249 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Unknown URLs show `Page Not Found`" | unverifiable | fix-doc | Settle the not-found page by `control.mjs doctor --target portal` driven at an unknown URL. |
| 250 | .claude/skills/control-angular-dev-app/features/ssr.md | "ng222-ssr, Angular 22.2.2, `@angular/ssr`, zoneless" | unverifiable | fix-doc | Settle the SSR spike identity by `git cat-file -p spikes/ng222-ssr/package.json`, which pins the CLI version, and `git cat-file -e spikes/ng222-ssr/node_modules/@angular/core/package.json`, which shows the installed tree is not tracked. |
| 251 | .claude/skills/control-angular-dev-app/features/ssr.md | "routes `/`, `/prerender`, `/client` with RenderMode.Server/Prerender/Client" | unverifiable | fix-doc | Settle the route modes by `git cat-file -p spikes/ng222-ssr/src/app/app.routes.server.ts`, the tracked file that declares RenderMode per route. |
| 252 | .claude/skills/control-angular-dev-app/features/ssr.md | "`hydratedComponents` 4, `hydratedNodes` 40" | unverifiable | fix-doc | Settle the hydration counters by `control.mjs doctor --target ssr`, which drives the SSR spike and reads its hydration counts. |
| 253 | .claude/skills/control-angular-devtools/SKILL.md | "Angular DevTools 1.22.1" | unverifiable | fix-doc | Settle the DevTools version by `control.mjs status`, the shipped subcommand that reports the installed extension version. |
| 254 | .claude/skills/control-angular-devtools/features/README.md | "Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0" | unverifiable | fix-doc | Settle the harness sequence by `control.mjs doctor`, the shipped subcommand whose exit 0 is the claim itself. |
| 255 | .claude/skills/control-angular-devtools/features/attach.md | "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | unverifiable | fix-doc | Settle the connection flag by `node --test .commandcode/skills/verify-angular-devtools/checks/attached.test.mjs`, which asserts the page-side connection marker. |
| 256 | .claude/skills/control-angular-devtools/features/attach.md | "Detection result fields: isAngular, isDebugMode, isIvy, isSupportedAngularVersion" | unverifiable | fix-doc | Settle the detection fields by `node --test .commandcode/skills/verify-angular-devtools/checks/attached.test.mjs`, whose detection assertion names isAngular, isDebugMode, isIvy and isSupportedAngularVersion. |
| 257 | .claude/skills/control-angular-devtools/features/install.md | "Branded install proven in Chrome Beta (2026-10-11)" | unverifiable | fix-doc | Settle the branded install by `control.mjs install`, the shipped subcommand that loads the extension into the branded browser and reports the result. |
| 258 | .claude/skills/control-angular-devtools/features/profiler.md | "Profiler subscribes through `ng.ɵsetProfiler`" | unverifiable | fix-doc | Settle the profiler subscription by `control.mjs panel`, the shipped subcommand that opens the DevTools panel and reads the profiler subscriber table. |
| 259 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected own subscribers bothOn a:16,b:16; afterRemoveA a:16,b:32; DevTools recorded 2 cycles" | unverifiable | fix-doc | Settle the subscriber counts by `control.mjs panel`, which records the profiler rows and the change-detection cycles it observed. |
| 260 | .claude/skills/control-angular-devtools/features/signal-graph.md | "Expected before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Settle the pre-removal graph by `node --test .commandcode/skills/verify-pangular-inspector/checks/live-reads.test.mjs`, the shipped check that reads the signal graph from a running app. |
| 261 | .claude/skills/control-angular-devtools/features/signal-graph.md | "After `angular:di_graph`: pane `signal:count, effect:Effect`" | unverifiable | fix-doc | Settle the post-removal pane by `node --test .commandcode/skills/verify-pangular-inspector/checks/live-reads.test.mjs`, the same shipped signal-graph read after the DI graph change. |
| 262 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools with --read-only" | unverifiable | fix-doc | Settle the tool count by `control.mjs tools --read-only`, the shipped subcommand that lists the MCP tools the inspector exposes. |
| 263 | .claude/skills/control-pangular-inspector/features/README.md | "node $S check exits 0 (pin, overlay import, proxy)" | unverifiable | fix-doc | Settle the `check` result by `control.mjs check`, the shipped subcommand whose exit status is the claim. |
| 264 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-component returns ListComponent for ng-journal-list" | unverifiable | fix-doc | Settle the inspect-component result by `control.mjs call inspect-component` on a live app, or by `node --test .commandcode/skills/verify-pangular-inspector/checks/live-reads.test.mjs`, which drives the same read. |
| 265 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals returns computed node contracts" | unverifiable | fix-doc | Settle the inspect-signals result by `control.mjs call inspect-signals` on a live app; the MCP reply carries the computed node contracts. |
| 266 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation reports succeeded trigger imperative" | unverifiable | fix-doc | Settle the navigation explanation by `control.mjs call explain-navigation`, whose reply reports the trigger kind. |
| 267 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes returns 12 routes (measured)" | unverifiable | fix-doc | Settle the route count by `control.mjs call list-routes`, which returns the routes the live app exposes. |
| 268 | .claude/skills/control-pangular-inspector/features/navigation.md | "lint-routes reports one info finding missing-title" | unverifiable | fix-doc | Settle the lint finding by `control.mjs call lint-routes`, whose reply carries the missing-title finding. |
| 269 | .claude/skills/control-pangular-inspector/features/panel.md | "dashboard shows Angular 22.2.2" | unverifiable | fix-doc | Settle the dashboard version by `control.mjs doctor`, which reads the Angular version the running app reports. |
| 270 | .claude/skills/control-pangular-inspector/features/panel.md | "eight tab names in panel" | unverifiable | fix-doc | Settle the tab list by `control.mjs doctor`, whose panel read enumerates the rendered tabs. |
| 271 | .claude/skills/control-pangular-inspector/features/panel.md | "floating button accessible name Toggle Pangular Inspector" | unverifiable | fix-doc | Settle the floating button accessible name by `control.mjs up`, which opens the panel and exposes the button to the driver. |
| 272 | .claude/skills/control-pangular-inspector/features/setup.md | "lockfile diff 457 insertions (measured)" | unverifiable | fix-doc | Settle the lockfile diff by `git cat-file -p package-lock.json`, the tracked lockfile the insertion count is measured against. |
| 273 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan get-components returns [] at workspace root (measured)" | unverifiable | fix-doc | Settle the empty scan by `control.mjs scan`, the shipped subcommand that scans the workspace root and prints what it found. |
| 274 | .claude/skills/control-pangular-inspector/features/source-scan.md | "build-meta reports Angular 22.2.2 TypeScript 6.0.3" | unverifiable | fix-doc | Settle the build metadata by `control.mjs info`, which reports the Angular and TypeScript versions the app declares. |
| 275 | .claude/skills/control-vitest-browser-angular/SKILL.md | "window.ng has 23 functions" | unverifiable | fix-doc | Settle the `window.ng` surface by `control.mjs info`, which reads the debug globals the tester page exposes. |
| 276 | .claude/skills/control-vitest-browser-angular/features/README.md | "doctor exits 0 healthy" | unverifiable | fix-doc | Settle the healthy run by `control.mjs doctor`, the shipped subcommand whose exit 0 is the claim. |
| 277 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "two default tests pass (Tests 2 passed \| 2 skipped (4))" | unverifiable | fix-doc | Settle the default test run by `control.mjs up --bundled`, which starts the tester with the bundled tests and prints the summary. |
| 278 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "timing demo fails with expected text" | unverifiable | fix-doc | Settle the timing demo failure text by `control.mjs up --timing-demo`, which runs that demo and reports the assertion text. |
| 279 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng === undefined" | unverifiable | fix-doc | Settle the isolated-world check by `control.mjs doctor`, which reports the tester page and extension worlds. |
| 280 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "LanguageModel available in attach mode" | unverifiable | fix-doc | Settle the LanguageModel availability by `control.mjs attach`, which attaches to a running instance and reports its model API. |
| 281 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "extension service worker target exists" | unverifiable | fix-doc | Settle the service-worker target by `control.mjs doctor`, whose target list includes the extension service worker. |
| 282 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "click raises count by one" | unverifiable | fix-doc | Settle the click behaviour by `control.mjs doctor`, which drives the held counter and reads the count. |
| 283 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng.getSignalGraph returns nodes template/count/double" | unverifiable | fix-doc | Settle the signal graph by `control.mjs info`, which reads the signal graph the tester page exposes. |
| 284 | .commandcode/pstack-models.md | "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 285 | .commandcode/pstack-models.md | "pstack effort agents (effort-low..effort-max) set reasoningEffort in frontmatter" | unverifiable | fix-doc | Settle the effort-agent inventory by `node --test scripts/user-scope-autonomy.test.mjs`, which reads the installed user-scope tree through `scripts/user-scope-autonomy.mjs`. |
| 286 | .commandcode/pstack-models.md | "session hook: off ... Command Code has no SessionStart hook; inert" | unverifiable | fix-doc | no command in this checkout observes the Command Code host hook events: the row is settled only by the Command Code release note that lists which hook events the host emits. |
| 287 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader is not defined in these builds" | unverifiable | fix-doc | Settle the missing `Proofreader` global by `node --test .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs`, whose probe enumerates the LanguageModel globals the build defines. |
| 288 | .commandcode/skills/control-ai-browsers/features/interop.md | "message type angular-ai:interop" | unverifiable | fix-doc | Settle the message type by `git cat-file -p extension/background.js`, the tracked dispatch table, and `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs`, which drives the interop path. |
| 289 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "message type angular-ai:stale-view" | unverifiable | fix-doc | Settle the message type by `git cat-file -p extension/background.js`, the tracked dispatch table, and `node --test scripts/stale-view-panel-drive.test.mjs`, which pins the panel stale-view wiring. |
| 290 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "hedged wording may show a stale value" | unverifiable | fix-doc | Settle the hedged wording by `node --test scripts/stale-view-panel-drive.test.mjs`, which asserts the panel stale-value wording. |
| 291 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "columns Claim number, Damage Type, Date, Policynumber, Customer; 5 rows measured" | unverifiable | fix-doc | Settle the claim-list columns and row count by `control.mjs doctor --target portal`, whose page read returns the rendered table. |
| 292 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list columns ...; 30 rows" | unverifiable | fix-doc | Settle the customer-list columns and 30 rows by `control.mjs doctor --target portal`, whose page read counts the seeded rows. |
| 293 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | unverifiable | fix-doc | Settle the complaint-list columns and rows by `control.mjs doctor --target portal`, whose page read returns the seeded rows. |
| 294 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "snapshot shows heading \"Contract Details Edit\"" | unverifiable | fix-doc | Settle the edit heading by `control.mjs doctor --target portal`, whose navigation read returns the heading text. |
| 295 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list ... 20 rows after a fresh API start" | unverifiable | fix-doc | Settle the contract-list row count by `control.mjs doctor --target portal` against a fresh API start. |
| 296 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Every flag in apps/.../feature-flags.manifest.json decides whether a sidebar entry and its route exist" | unverifiable | fix-doc | Settle the flag-to-route mapping by `control.mjs doctor --target portal`, which starts the portal and reads the sidebar entries the flags produce. |
| 297 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Unknown URLs show \"Page Not Found\"" | unverifiable | fix-doc | Settle the not-found page by `control.mjs doctor --target portal` driven at an unknown URL. |
| 298 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Settle the hydration counters by `control.mjs doctor --target ssr`, which drives the SSR spike and reads them. |
| 299 | .commandcode/skills/control-angular-devtools/features/attach.md | "backendReady at ~950 ms" | unverifiable | fix-doc | Settle the backend-ready timing by `control.mjs attach`, whose result carries the readiness timestamp. |
| 300 | .commandcode/skills/control-angular-devtools/features/profiler.md | "own subscribers {\"bothOn\":{\"a\":16,\"b\":16},\"afterRemoveA\":{\"a\":16,\"b\":32}}; DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Settle the profiler counters by `control.mjs panel`, which records the subscriber rows and the cycle count. |
| 301 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "list-routes (12 routes, measured)" | unverifiable | fix-doc | Settle the route count by `control.mjs call list-routes`, the shipped MCP call that returns the live route table. |
| 302 | .commandcode/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Settle the panel title by `control.mjs up`, which opens the panel the title renders in. |
| 303 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Toggle Pangular Inspector" | unverifiable | fix-doc | Settle the accessible name by `control.mjs up`, which exposes the floating button to the driver. |
| 304 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "Angular 22.2.2" | unverifiable | fix-doc | Settle the Angular version by `control.mjs info`, which reports the version the scanned app declares. |
| 305 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "ng-version 22.2.2" | unverifiable | fix-doc | Settle the `ng-version` attribute by `control.mjs info`, which reads it from the tester page. |
| 306 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Do not use `--format ndjson` for extraction" | unverifiable | fix-doc | no command in this checkout exercises the nx-cloud CLI flag parser: the row is settled only by the nx-cloud changelog entry that records when `--format ndjson` was accepted. |
| 307 | .commandcode/skills/nx-generate/SKILL.md | "Always use `--no-interactive`" | unverifiable | fix-doc | Settle the flag by `git cat-file -p nx.json`, the tracked CLI config, which declares no non-interactive default, and by a generator `--dry-run` that records the flag acceptance. |
| 308 | .commandcode/skills/nx-import/references/ESLINT.md | "Pin ESLint to v9 (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | unverifiable | fix-doc | Settle the version break by `git cat-file -p package-lock.json`, which records the resolved eslint major that would reach `@nx/eslint`. |
| 309 | .commandcode/skills/nx-import/references/GRADLE.md | "If `@nx/gradle` is installed, run `nx show projects`" | unverifiable | fix-doc | Settle the plugin presence by `git cat-file -p package.json`, the tracked manifest that lists every installed @nx plugin. |
| 310 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.*`" | unverifiable | fix-doc | Settle the plugin presence by `git cat-file -p package.json`, the tracked manifest that lists every installed @nx plugin. |
| 311 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.*`" | unverifiable | fix-doc | Settle the plugin presence by `git cat-file -p package.json`, the tracked manifest that lists every installed @nx plugin. |
| 312 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Since Nx replaces Turborepo, all turbo config files ... become dead code" | unverifiable | fix-doc | Settle the dead-config claim by `git cat-file -e turbo.json`, which shows the repository tracks no Turborepo config to retire. |
| 313 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | unverifiable | fix-doc | Settle the default target name by `git cat-file -p package.json`, which shows @nx/vite is not installed here, so its defaults cannot be read from this workspace. |
| 314 | .commandcode/taste/angular/taste.md | "Signal Forms (@angular/forms/signals) target forms API; Insurance Portal migrated to it" | unverifiable | fix-doc | Settle the migration by `git cat-file -e apps/insurance-portal`, which shows the portal app is not tracked here, and `git cat-file -p package.json`, which carries no @angular/forms/signals entry. |
| 315 | .commandcode/taste/communication/taste.md | "Casing matters: provideAiDevTools() not provideAiDevtools()" | unverifiable | fix-doc | Settle the casing rule by `git cat-file -p package.json` and the panel public entry: neither declares a provideAiDevTools or provideAiDevtools export, so the row stays open until one exists. |
| 316 | .commandcode/taste/communication/taste.md | "Neither blessed nor ordained may appear in DevTools code/UI/runtime text" | unverifiable | fix-doc | Settle the banned terms by `npx nx run angular-ai-devtools:build-extension`, whose emitted `extension/panel/` bundle is the runtime text the rule covers, then read the two terms out of that bundle. |
| 317 | .commandcode/taste/design/taste.md | "MAIN-world script reads page via ng.ɵsetProfiler / ng.ɵgetSignalGraph" | unverifiable | fix-doc | Settle the page-read path by `git cat-file -p apps/angular-ai-devtools/src/app/page-reads.ts`, the single MAIN-world read port this repository ships. |
| 318 | .commandcode/taste/tooling/taste.md | "Supported AI browser matrix: Chrome Stable/Beta and Edge Stable/Dev" | unverifiable | fix-doc | Settle the supported matrix by `git cat-file -p .commandcode/skills/control-ai-browsers/instances.json`, the tracked registry that declares each browser instance. |
| 319 | docs/feature-proposals.md | "Angular 22.2 application" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 320 | docs/filing-ledger.md | "@angular/core 22.2.2" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 321 | research/01-built-in-ai-apis.md | "provideExperimentalWebMcpTools" from @angular/core | unverifiable | fix-doc | Settle the export by `git cat-file -p package.json`, the tracked manifest that pins the @angular/core range the symbol would ship in. |
| 322 | research/03-prior-art.md | "Pangular Inspector" local clone at D:\projects\github\pangular-inspector | unverifiable | fix-doc | no command in this checkout reaches the local clone the claim names: the row is settled only by that clone own README and source. |
| 323 | research/07-prompting-small-models.md | "Experiment E3 in 07 should add name style as a factor" | unverifiable | fix-doc | Settle the E3 factor list by `git cat-file -p research/07-prompting-small-models.md`, the tracked experiment design the claim is about. |
| 324 | research/12-legacy-vs-modern-angular.md | "spikes/ng222-app/dist/ng222-app/browser/main.js" | unverifiable | fix-doc | Settle the build-path claim by `git cat-file -e spikes/ng222-app/dist/ng222-app/browser/main.js`, which shows the built file is not tracked and must come from a build. |
| 325 | research/13-portal-legacy-audit.md | "libs/claim/ui/src/lib/claim-form.component.ts:3,19" | unverifiable | fix-doc | no command in this checkout reaches the portal repository the line numbers point into: the row is settled only by that external clone claim-form component. |
| 326 | research/15-deterministic-and-ai.md | "spikes S14 and S15" | unverifiable | fix-doc | Settle the spike references by `git cat-file -e spikes/S14` and `git cat-file -e spikes/S15`, which show neither spike directory is tracked. |
| 327 | research/18-edge-prevent-auto-signin.md | "msBrowserSignin is not a real feature flag" | unverifiable | fix-doc | no command in this checkout runs the Edge binary: the row is settled only by the reproductions note the Edge channel behaviour would leave behind. |
| 328 | research/20-built-in-ai-without-flags.md | "extension service worker" | unverifiable | fix-doc | Settle the service-worker claim by `git cat-file -p extension/manifest.json`, the tracked manifest that declares the background service worker. |
