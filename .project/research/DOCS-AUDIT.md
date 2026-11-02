# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-02
Audited HEAD: 9b08a183c4efe05d5afc08fff8f87f105a63b17b
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 206 |
| stale | 3 |
| aspirational | 0 |
| unverifiable | 98 |
| descriptive docs (no testable claims) | 10 |

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
| "digest of the official `angular.dev/errors` documentation bundled at extension build time" | feature | unverifiable | no digest asset found by name in extension/ or apps/ (search not exhaustive) |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular AI DevTools 0.3.0 loaded as ... from extension" | feature | verified | extension/manifest.json:3-4 — name Angular AI DevTools, version 0.3.0 |
| "Branded Chrome ignores `--load-extension`" | feature | unverifiable | not tested in repo; stated as measured |
| "Extension panel: `panel <name> --url=<app>` drives N1" | feature | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs — file present |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok`" | feature | verified | extension/manifest.json:3-4 — name Angular AI DevTools, version 0.3.0 |
| "`backend` reads `requested gpu`, `GPU (fastest inference)`, row `gemma4_gpu_low_tier_model`" | feature | unverifiable | broker state labels not present in code; measured claim |
| "`Proofreader` is not defined in these builds" | feature | unverifiable | runtime check, not in repo code |

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
| "Measured result: exits 0 on `edge-dev-aion` with `nodes: 1`" | status | unverifiable | runtime measurement; no evidence in repo |

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
| "Chrome Beta Nano runs `probe10.js` without error but answers in prose" | status | unverifiable | runtime observation |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" | structure | verified | extension/agent-main.js and src/main-world/provenance-tracer.ts — files present |
| "fact list is the `angular-ai:record` message" | integration | verified | grep angular-ai:record — found in src/main-world/provenance-tracer.ts |
| "anti-pattern findings render when two snapshots differ" | feature | unverifiable | runtime behaviour, not in code inspected |

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
| "Fresh page state: count 3, double 6, cart 1 item" | status | unverifiable | no inspected source in spikes/ng222-app sets these defaults; would require running the app |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "routes `src/app/app.routes.ts:5-8` declares `/stale-view` and `/stale-view-deferred`" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 — both paths declared |
| "component is OnPush by default (no `changeDetection` declared)" | feature | unverifiable | component source not inspected; Angular 22 defaults OnPush only without changeDetection |
| "each click raises the count by one" | feature | unverifiable | behavior claim requires running the app |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | .claude/.../control.mjs:69 — portal API fixed at 3000 (claims endpoint not verified) |
| "`claim-create` `/claim/create`: heading `Complaint Create` (app bug)" | status | unverifiable | portal checkout is external; not present in this repository |
| "list table has columns Claim number, Damage Type, Date, Policynumber, Customer" | structure | unverifiable | portal checkout external |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | .claude/.../control.mjs:69 — portal API fixed at 3000 |
| "`complaint-list` columns Type, Customer, Date, Description; 2 seeded rows" | structure | unverifiable | portal checkout external |
| "`customer-list` columns ...; 30 rows" | structure | unverifiable | portal checkout external |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at `http://localhost:3000/api/contracts`" | integration | verified | .claude/.../control.mjs:69 — portal API fixed at 3000 |
| "contract-list table ... 20 rows after a fresh API start" | structure | unverifiable | portal checkout external |
| "Edit opens `/contract/<id>/edit`, heading `Contract Edit`" | feature | unverifiable | portal checkout external |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` redirects to `/home`; heading `Home`; tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | portal checkout external |
| "Unknown URLs show `Page Not Found`" | feature | unverifiable | portal checkout external |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng222-ssr, Angular 22.2.2, `@angular/ssr`, zoneless" | status | unverifiable | spikes/ng222-ssr/node_modules/@angular/core/package.json missing (node_modules not installed) |
| "routes `/`, `/prerender`, `/client` with RenderMode.Server/Prerender/Client" | structure | unverifiable | SSR app source not inspected in this pass |
| "`hydratedComponents` 4, `hydratedNodes` 40" | status | unverifiable | requires running SSR fixture |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome for Testing 156.0.8078.4, revision 1248" | status | verified | node_modules/playwright-core/browsers.json — chromium revision 1248, browserVersion 156.0.8078.4 |
| "extension id `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | .claude/skills/control-angular-devtools/SKILL.md references store id; install copies from Edge Dev profile |
| "Angular DevTools 1.22.1" | status | unverifiable | extension version not present in repository; installed copy missing |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2 counter fixture at spikes/ng222-app" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — version 22.2.2 |
| "Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0" | command | unverifiable | requires running harness |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | unverifiable | extension backend source not present in repository |
| "Detection result fields: isAngular, isDebugMode, isIvy, isSupportedAngularVersion" | feature | unverifiable | extension backend source not present in repository |
| "Expected Angular 22.2.2 on counter fixture" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — version 22.2.2 |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id `ienfalfjdbdpebioblfackkekamfmbnh` Chrome Web Store" | integration | verified | .claude/skills/control-angular-devtools/SKILL.md names the id |
| "Branded install proven in Chrome Beta (2026-10-11)" | status | unverifiable | no repository evidence beyond doc |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Profiler subscribes through `ng.ɵsetProfiler`" | integration | unverifiable | Angular profiler source not present in repository |
| "Expected own subscribers bothOn a:16,b:16; afterRemoveA a:16,b:32; DevTools recorded 2 cycles" | status | unverifiable | requires running harness |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Expected before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | status | unverifiable | requires running harness |
| "After `angular:di_graph`: pane `signal:count, effect:Effect`" | status | unverifiable | requires running harness |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 - PINNED = '0.0.7' |
| "standalone pangular dev on port 9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 - DEFAULT_PORT = 9999 |
| "eight action tools (highlight, navigate, ...)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:76 - ACTION_TOOLS has 8 entries |
| "0.0.7 lists 46 tools with --read-only" | status | unverifiable | no runtime measurement in repo; would need a live doctor/tools-list run |

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
| "inspect-component returns ListComponent for ng-journal-list" | feature | unverifiable | runtime MCP claim; no code path to verify statically |
| "inspect-signals returns computed node contracts" | feature | unverifiable | runtime MCP claim; no static evidence |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation reports succeeded trigger imperative" | feature | unverifiable | runtime MCP claim; no static evidence in repo |
| "list-routes returns 12 routes (measured)" | status | unverifiable | measured portal runtime value; not in this repo |
| "lint-routes reports one info finding missing-title" | status | unverifiable | runtime claim; no static evidence |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "dashboard shows Angular 22.2.2" | status | unverifiable | runtime panel claim; no Angular version in this repo config |
| "eight tab names in panel" | feature | unverifiable | runtime panel claim |
| "floating button accessible name Toggle Pangular Inspector" | feature | unverifiable | string appears only in skill docs, not in repo source |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7 in devDependencies" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 - PINNED = '0.0.7' |
| "check command reports six read-only facts" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:961 - command: check |
| "lockfile diff 457 insertions (measured)" | status | unverifiable | measured runtime value; no static evidence |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan command runs stdio MCP source scan" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1539 - command: scan |
| "scan get-components returns [] at workspace root (measured)" | status | unverifiable | runtime measured value; depends on portal checkout |
| "build-meta reports Angular 22.2.2 TypeScript 6.0.3" | status | unverifiable | runtime measured value; not in this repo |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "default instance chrome-beta-gemma4" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:101 - DEFAULT_INSTANCE |
| "main checkout Vitest port 51315" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:99 - MAIN_VITEST_PORT = 51315 |
| "bundled CDP port 9350" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:100 - MAIN_BUNDLED_CDP_PORT = 9350 |
| "window.ng has 23 functions" | status | unverifiable | runtime measured value; no static evidence |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "up command starts the run" | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs exists |
| "held Counter fresh state Clicks: 3 (double 6, cart 2)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:34 - toHaveTextContent |
| "doctor exits 0 healthy" | command | unverifiable | runtime check; not run here |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "two default tests pass (Tests 2 passed \| 2 skipped (4))" | status | unverifiable | runtime measured summary; not in repo |
| "counter.spec.ts has two base it() tests" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts - two it() calls |
| "timing demo fails with expected text" | status | unverifiable | runtime measured assertion text |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "isolated world sees typeof window.ng === undefined" | feature | unverifiable | runtime extension claim; no static evidence |
| "LanguageModel available in attach mode" | feature | unverifiable | runtime measured claim; no static evidence |
| "extension service worker target exists" | feature | unverifiable | runtime doctor check; not run here |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "held Counter renders Clicks: 3 (double 6, cart 2)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:34 - toHaveTextContent |
| "click raises count by one" | feature | unverifiable | runtime drive claim; not exercised here |
| "ng.getSignalGraph returns nodes template/count/double" | feature | unverifiable | runtime Angular debug claim; no static evidence |

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
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | stale | ~/.commandcode/pstack-models.md free-models list instead names inclusionai/ling-3.1-flash-1019:free |
| "pstack effort agents (effort-low..effort-max) set reasoningEffort in frontmatter" | feature | unverifiable | no effort-* agent found under ~/.commandcode/skills or repo |
| "session hook: off ... Command Code has no SessionStart hook; inert" | config | unverifiable | no Command Code hook implementation found to confirm |

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
| "Proofreader is not defined in these builds" | feature | unverifiable | no code reference found in repo; browser-runtime claim |
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
| "message type angular-ai:interop" | integration | unverifiable | not independently located in source |

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
| "message type angular-ai:stale-view" | integration | unverifiable | not independently located in source |
| "hedged wording may show a stale value" | feature | unverifiable | UI string not verified in component source |

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
| "columns Claim number, Damage Type, Date, Policynumber, Customer; 5 rows measured" | structure | unverifiable | portal checkout source not inspected for claim list row count and columns |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "customer-list columns ...; 30 rows" | structure | unverifiable | portal checkout source not inspected for customer list columns and row count |
| "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | structure | unverifiable | portal checkout source not inspected for complaint list |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "snapshot shows heading \"Contract Details Edit\"" | feature | unverifiable | no portal source or run evidence confirms that heading |
| "contract-list ... 20 rows after a fresh API start" | structure | unverifiable | portal checkout source not inspected for contract list row count |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Every flag in apps/.../feature-flags.manifest.json decides whether a sidebar entry and its route exist" | config | unverifiable | manifest exists but its keys and guards were not inspected |
| "Unknown URLs show \"Page Not Found\"" | feature | unverifiable | portal checkout source not inspected for not-found route |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "RenderMode.Server, RenderMode.Prerender, RenderMode.Client" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 — renderMode per route |
| "hydratedComponents 4, hydratedNodes 40" | status | unverifiable | no source or run evidence confirms those counters |

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
| "backendReady at ~950 ms" | status | unverifiable | no run evidence confirms that timing |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools 1.22.1 ENABLED" | status | verified | .../Extensions/.../1.22.1_0/manifest.json:48 — version 1.22.1 |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "own subscribers {\"bothOn\":{\"a\":16,\"b\":16},\"afterRemoveA\":{\"a\":16,\"b\":32}}; DevTools recorded 2 change detection cycles" | status | unverifiable | no run evidence confirms those measured counters |

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
| "title Pangular Inspector" | feature | unverifiable | no browser evidence in repo; URL http://localhost:4507/__pangular/ is app-side proxy |
| "Toggle Pangular Inspector" | feature | unverifiable | accessible name not present in repository code |

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
| "ng-version 22.2.2" | config | unverifiable | no runtime evidence in repo |

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
| "Do not use `--format ndjson` for extraction" | command | unverifiable | node_modules/.bin/nx-cloud --help not executed; would settle flag support |

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
| "Review failures from the last 24 hours by default" | status | unverifiable | no Nx Cloud data queried; would need live cipes query to settle |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use the Nx CLI to discover available generators: `npx nx list`" | command | verified | node_modules/.bin/nx:1 — nx CLI installed in workspace |
| "Always use `--no-interactive`" | command | unverifiable | generator help not executed; flag support not checked |

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
| "If `@nx/gradle` is installed, run `nx show projects`" | integration | unverifiable | node_modules/@nx/gradle not present in this workspace |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.*`" | integration | unverifiable | node_modules/@nx/jest not present in this workspace |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` detects `next.config.*`" | integration | unverifiable | node_modules/@nx/next not present in this workspace |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Since Nx replaces Turborepo, all turbo config files ... become dead code" | feature | unverifiable | no Turborepo source present in this workspace to check |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | config | unverifiable | node_modules/@nx/vite not present in this workspace |

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
| "Signal Forms (@angular/forms/signals) target forms API; Insurance Portal migrated to it" | feature | unverifiable | no insurance-portal app or @angular/forms/signals import in repo |
| "Split test-suite naming by runner: node:test suites *.node.test.ts; builder pinned to **/*.spec.ts" | config | verified | apps/angular-ai-devtools/project.json test include ["**/*.spec.ts"], exclude ["**/*.node.test.ts"]; tsconfig.spec.json excludes src/**/*.node.test.ts |
| "Chrome/Edge web extension dev tools must be implemented in Angular" | feature | verified | extension/panel/main.js + index.html are Angular build output |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Casing matters: provideAiDevTools() not provideAiDevtools()" | feature | unverifiable | no provideAiDevTools/provideAiDevtools symbol anywhere in repo |
| "Neither blessed nor ordained may appear in DevTools code/UI/runtime text" | feature | unverifiable | grep for both terms (excluding node_modules) returned no matches |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The product is only a web (browser) extension" | feature | verified | extension/manifest.json manifest_version 3, devtools_page, content_scripts |
| "MAIN-world script reads page via ng.ɵsetProfiler / ng.ɵgetSignalGraph" | feature | unverifiable | no occurrences of setProfiler/getSignalGraph in repo |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "global npm packages/node_modules live under D:\packages\npm-global" | config | verified | D:\packages\npm-global exists and populated (nx, typescript, playwright-cli) |
| "Supported AI browser matrix: Chrome Stable/Beta and Edge Stable/Dev" | feature | unverifiable | no browser matrix config/test in repo |

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

## Doc: docs/autonomy-gaps.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/autonomy-gaps.test.mjs" | structure | verified | scripts/autonomy-gaps.test.mjs exists |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension is at version 0.3.0 (extension/manifest.json:4)" | status | verified | extension/manifest.json:4 - "version": "0.3.0" |
| "Angular 22.2 application" | status | stale | node_modules/@angular/core/package.json:3 - version 22.1.8 (package.json ~22.1.0) |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
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
| "provideExperimentalWebMcpTools" from @angular/core | feature | unverifiable | no local @angular/core source in workspace; not checked |

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
| "Pangular Inspector" local clone at D:\projects\github\pangular-inspector | structure | unverifiable | clone path not present in workspace |

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
| "Experiment E3 in 07 should add name style as a factor" | feature | unverifiable | no local file references E3 experiment |

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
| "spikes/ng222-app/dist/ng222-app/browser/main.js" | structure | unverifiable | spikes/ng222-app/dist/ng222-app/browser/main.js - not present in checkout |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "libs/claim/ui/src/lib/claim-form.component.ts:3,19" | structure | unverifiable | portal repo not in this workspace |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "docs/feature-proposals.md" | structure | verified | docs/feature-proposals.md - file exists |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes S14 and S15" | status | unverifiable | no spikes/S14 or spikes/S15 directories in repo |

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
| "msBrowserSignin is not a real feature flag" | status | unverifiable | no Edge binary available to check |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension/devtools.html" | structure | verified | extension/devtools.html - file exists |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension service worker" | structure | unverifiable | no service worker file found in extension/ |

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

## User rulings


Ruled 2026-11-02 under the recorded `rulings` grant. Every row below is
`fix-doc`: the document keeps its claim and the audit row records the shipped
check that would settle it. `Planned: no` means the row stays in the alignment
queue and is owed, not drained.

| Queue # | Ruling | User's words | Planned |
|---|---|---|---|
| 284 | fix-doc | "A fresh session should be able to run /gsd-path to complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority." | no |
| 319 | fix-doc | "A fresh session should be able to run /gsd-path to complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority." | no |
| 320 | fix-doc | "A fresh session should be able to run /gsd-path to complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority." | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 169 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Review failures from the last 24 hours by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 229 | .claude/skills/control-ai-browsers/features/README.md | "Chrome Beta 157 (156 until it updated itself on 2026-10-16)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 230 | .claude/skills/control-ai-browsers/features/README.md | "session is `ai-<instance>-<port>`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 231 | .claude/skills/control-ai-browsers/features/error-explainer.md | "digest of the official `angular.dev/errors` documentation bundled at extension build time" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 232 | .claude/skills/control-ai-browsers/features/extension-panel.md | "Branded Chrome ignores `--load-extension`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 233 | .claude/skills/control-ai-browsers/features/health-check.md | "`backend` reads `requested gpu`, `GPU (fastest inference)`, row `gemma4_gpu_low_tier_model`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 234 | .claude/skills/control-ai-browsers/features/health-check.md | "`Proofreader` is not defined in these builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 235 | .claude/skills/control-ai-browsers/features/instances.md | "`C instances` one line per instance (five)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 236 | .claude/skills/control-ai-browsers/features/interop.md | "Measured result: exits 0 on `edge-dev-aion` with `nodes: 1`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 237 | .claude/skills/control-ai-browsers/features/probes.md | "Chrome Beta Nano runs `probe10.js` without error but answers in prose" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 238 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "anti-pattern findings render when two snapshots differ" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 239 | .claude/skills/control-angular-dev-app/features/README.md | "Fresh page state: count 3, double 6, cart 1 item" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 240 | .claude/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default (no `changeDetection` declared)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 241 | .claude/skills/control-angular-dev-app/features/counter.md | "each click raises the count by one" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 242 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "`claim-create` `/claim/create`: heading `Complaint Create` (app bug)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 243 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "list table has columns Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 244 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`complaint-list` columns Type, Customer, Date, Description; 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 245 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`customer-list` columns ...; 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 246 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list table ... 20 rows after a fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 247 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Edit opens `/contract/<id>/edit`, heading `Contract Edit`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 248 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "`/` redirects to `/home`; heading `Home`; tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 249 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Unknown URLs show `Page Not Found`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 250 | .claude/skills/control-angular-dev-app/features/ssr.md | "ng222-ssr, Angular 22.2.2, `@angular/ssr`, zoneless" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 251 | .claude/skills/control-angular-dev-app/features/ssr.md | "routes `/`, `/prerender`, `/client` with RenderMode.Server/Prerender/Client" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 252 | .claude/skills/control-angular-dev-app/features/ssr.md | "`hydratedComponents` 4, `hydratedNodes` 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 253 | .claude/skills/control-angular-devtools/SKILL.md | "Angular DevTools 1.22.1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 254 | .claude/skills/control-angular-devtools/features/README.md | "Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 255 | .claude/skills/control-angular-devtools/features/attach.md | "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 256 | .claude/skills/control-angular-devtools/features/attach.md | "Detection result fields: isAngular, isDebugMode, isIvy, isSupportedAngularVersion" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 257 | .claude/skills/control-angular-devtools/features/install.md | "Branded install proven in Chrome Beta (2026-10-11)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 258 | .claude/skills/control-angular-devtools/features/profiler.md | "Profiler subscribes through `ng.ɵsetProfiler`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 259 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected own subscribers bothOn a:16,b:16; afterRemoveA a:16,b:32; DevTools recorded 2 cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 260 | .claude/skills/control-angular-devtools/features/signal-graph.md | "Expected before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 261 | .claude/skills/control-angular-devtools/features/signal-graph.md | "After `angular:di_graph`: pane `signal:count, effect:Effect`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 262 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools with --read-only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 263 | .claude/skills/control-pangular-inspector/features/README.md | "node $S check exits 0 (pin, overlay import, proxy)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 264 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-component returns ListComponent for ng-journal-list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 265 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals returns computed node contracts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 266 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation reports succeeded trigger imperative" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 267 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes returns 12 routes (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 268 | .claude/skills/control-pangular-inspector/features/navigation.md | "lint-routes reports one info finding missing-title" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 269 | .claude/skills/control-pangular-inspector/features/panel.md | "dashboard shows Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 270 | .claude/skills/control-pangular-inspector/features/panel.md | "eight tab names in panel" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 271 | .claude/skills/control-pangular-inspector/features/panel.md | "floating button accessible name Toggle Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 272 | .claude/skills/control-pangular-inspector/features/setup.md | "lockfile diff 457 insertions (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 273 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan get-components returns [] at workspace root (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 274 | .claude/skills/control-pangular-inspector/features/source-scan.md | "build-meta reports Angular 22.2.2 TypeScript 6.0.3" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 275 | .claude/skills/control-vitest-browser-angular/SKILL.md | "window.ng has 23 functions" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 276 | .claude/skills/control-vitest-browser-angular/features/README.md | "doctor exits 0 healthy" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 277 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "two default tests pass (Tests 2 passed \| 2 skipped (4))" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 278 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "timing demo fails with expected text" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 279 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng === undefined" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 280 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "LanguageModel available in attach mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 281 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "extension service worker target exists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 282 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "click raises count by one" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 283 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng.getSignalGraph returns nodes template/count/double" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 284 | .commandcode/pstack-models.md | "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 285 | .commandcode/pstack-models.md | "pstack effort agents (effort-low..effort-max) set reasoningEffort in frontmatter" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 286 | .commandcode/pstack-models.md | "session hook: off ... Command Code has no SessionStart hook; inert" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 287 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader is not defined in these builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 288 | .commandcode/skills/control-ai-browsers/features/interop.md | "message type angular-ai:interop" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 289 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "message type angular-ai:stale-view" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 290 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "hedged wording may show a stale value" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 291 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "columns Claim number, Damage Type, Date, Policynumber, Customer; 5 rows measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 292 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list columns ...; 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 293 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 294 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "snapshot shows heading \"Contract Details Edit\"" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 295 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list ... 20 rows after a fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 296 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Every flag in apps/.../feature-flags.manifest.json decides whether a sidebar entry and its route exist" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 297 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Unknown URLs show \"Page Not Found\"" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 298 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 299 | .commandcode/skills/control-angular-devtools/features/attach.md | "backendReady at ~950 ms" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 300 | .commandcode/skills/control-angular-devtools/features/profiler.md | "own subscribers {\"bothOn\":{\"a\":16,\"b\":16},\"afterRemoveA\":{\"a\":16,\"b\":32}}; DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 301 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "list-routes (12 routes, measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 302 | .commandcode/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 303 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Toggle Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 304 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 305 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "ng-version 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 306 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Do not use `--format ndjson` for extraction" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 307 | .commandcode/skills/nx-generate/SKILL.md | "Always use `--no-interactive`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 308 | .commandcode/skills/nx-import/references/ESLINT.md | "Pin ESLint to v9 (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 309 | .commandcode/skills/nx-import/references/GRADLE.md | "If `@nx/gradle` is installed, run `nx show projects`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 310 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.*`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 311 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.*`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 312 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Since Nx replaces Turborepo, all turbo config files ... become dead code" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 313 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 314 | .commandcode/taste/angular/taste.md | "Signal Forms (@angular/forms/signals) target forms API; Insurance Portal migrated to it" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 315 | .commandcode/taste/communication/taste.md | "Casing matters: provideAiDevTools() not provideAiDevtools()" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 316 | .commandcode/taste/communication/taste.md | "Neither blessed nor ordained may appear in DevTools code/UI/runtime text" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 317 | .commandcode/taste/design/taste.md | "MAIN-world script reads page via ng.ɵsetProfiler / ng.ɵgetSignalGraph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 318 | .commandcode/taste/tooling/taste.md | "Supported AI browser matrix: Chrome Stable/Beta and Edge Stable/Dev" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 319 | docs/feature-proposals.md | "Angular 22.2 application" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 320 | docs/filing-ledger.md | "@angular/core 22.2.2" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 321 | research/01-built-in-ai-apis.md | "provideExperimentalWebMcpTools" from @angular/core | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 322 | research/03-prior-art.md | "Pangular Inspector" local clone at D:\projects\github\pangular-inspector | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 323 | research/07-prompting-small-models.md | "Experiment E3 in 07 should add name style as a factor" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 324 | research/12-legacy-vs-modern-angular.md | "spikes/ng222-app/dist/ng222-app/browser/main.js" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 325 | research/13-portal-legacy-audit.md | "libs/claim/ui/src/lib/claim-form.component.ts:3,19" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 326 | research/15-deterministic-and-ai.md | "spikes S14 and S15" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 327 | research/18-edge-prevent-auto-signin.md | "msBrowserSignin is not a real feature flag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 328 | research/20-built-in-ai-without-flags.md | "extension service worker" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
