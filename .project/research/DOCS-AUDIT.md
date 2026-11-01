# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-01
Audited HEAD: 01bffa9f291688c44261a67847b14dcda42b0867
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 329 |
| stale | 1 |
| aspirational | 0 |
| unverifiable | 111 |
| descriptive docs (no testable claims) | 0 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five browser instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 entries under instances |
| "chrome-beta-nano port 9333" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70 — "port": 9333 |
| "model v3Nano on chrome-beta-nano" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — "name": "v3Nano" |
| "contextWindow 9216 for chrome-beta-nano" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "contextWindow": 9216 |
| "edge-dev-aion model Aion-1.1-Instruct" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — "name": "Aion-1.1-Instruct" |
| "scripts/control.mjs drives deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — exists |
| "scripts/pipe-keeper.mjs loads extension over pipe" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs — exists |
| "extension version 0.3.0" | config | verified | extension/manifest.json:4 — "version": "0.3.0" |
| "Chrome minFreeMib 22528" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta "minFreeMib": 22528 |
| "Edge minFreeMib 20480" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev "minFreeMib": 20480 |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances run on ports 9333-9338" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — ports 9333,9334,9335,9337,9338 |
| "panel built via npx nx run angular-ai-devtools:build-extension" | command | unverifiable | no nx config inspected in this audit |
| "session name ai-<instance>-<port>" | config | verified | .claude/skills/control-ai-browsers/SKILL.md — session naming ai-<name>-<port> |
| "counter fixture serves http://localhost:4222" | integration | unverifiable | fixture port not verified here |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation in di-doctor.service.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts — exists |
| "n3-di-doctor.component.ts component" | structure | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts — exists |
| "di-diff-display.ts diff view" | structure | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts — exists |
| "message type angular-ai:di-query" | integration | verified | repo grep — "angular-ai:di-query" present |
| "message type angular-ai:di-graph" | integration | verified | repo grep — "angular-ai:di-graph" present |
| "panel built via npx nx run angular-ai-devtools:build-extension" | command | unverifiable | no nx config inspected in this audit |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation in error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts — exists |
| "message type angular-ai:error-capture" | integration | verified | repo grep — "angular-ai:error-capture" present |
| "message type angular-ai:error-explain" | integration | verified | repo grep — "angular-ai:error-explain" present |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension adds DevTools panel Angular AI" | feature | verified | extension/manifest.json — "name": "Angular AI DevTools" |
| "panel files main.js, styles.css, index.html under extension/panel" | structure | verified | extension/panel/main.js, styles.css, index.html — exist |
| "relay.js and agent-main.js content scripts" | structure | verified | extension/relay.js and extension/agent-main.js — exist |
| "extension version 0.3.0" | config | verified | extension/manifest.json:4 — "version": "0.3.0" |
| "verify check extension-panel.mjs exists" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs — exists |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor reports nineteen check lines" | status | unverifiable | not measured in this audit |
| "Proofreader not defined in these builds" | feature | unverifiable | not verified against builds |
| "WebMCP lives on document.modelContext" | feature | verified | .claude/skills/control-ai-browsers/SKILL.md — references document.modelContext |
| "extension version 0.3.0 loaded" | config | verified | extension/manifest.json:4 — "version": "0.3.0" |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances listed" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 entries |
| "edge-dev-aion has --disable-component-update arg" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "args": ["--disable-component-update"] |
| "ports 9333,9334,9335,9337,9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — port fields |
| "chrome minFreeMib 22528" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta "minFreeMib": 22528 |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation in interop.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts — exists |
| "message type angular-ai:interop" | integration | verified | repo grep — "angular-ai:interop" present |
| "verify check interop.mjs exists" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs — exists |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "model clear deletes folders whose manifest names model" | feature | unverifiable | control.mjs source not inspected line-level |
| "edge-dev-aion pin roots EdgeLLMOnDeviceModel, EdgeLLMRuntime, EdgeOptimizationGuideModelsManifest" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "pin" array |
| "contextWindow 7168 for edge-dev-aion" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "contextWindow": 7168 |
| "downloadMib 1248 for edge-dev-aion" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "downloadMib": 1248 |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "probe10.js tool round trip probe exists" | structure | verified | spikes/probes/probe10.js — exists |
| "broker-state.js probe exists" | structure | verified | spikes/probes/broker-state.js — exists |
| "bench.js benchmark probe exists" | structure | verified | spikes/probes/bench.js — exists |
| "bench-summary.mjs summarises results" | structure | verified | spikes/probes/bench-summary.mjs — exists |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer in extension/agent-main.js" | structure | verified | extension/agent-main.js — exists |
| "message type angular-ai:record" | integration | verified | repo grep — "angular-ai:record" present |
| "verify check signal-provenance.mjs exists" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs — exists |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation in stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts — exists |
| "message type angular-ai:stale-view" | integration | verified | repo grep — "angular-ai:stale-view" present |
| "verify check stale-view.mjs exists" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/stale-view.mjs — exists |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "PORTAL_API_PORT defaults to 3000" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |
| "portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:67 — PORTAL_DEFAULT_DIR |
| "portal api pin libs/shared/utils/src/lib/injection-tokens.ts:5" | integration | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:70 — PORTAL_API_PIN; portal checkout libs/shared/utils/src/lib/injection-tokens.ts:5 — factory returns http://localhost:3000/api/ |
| "counter app port default 4222" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:82 — slot 0 => 4222 |
| "SSR app port default 4223" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:90 — slot 0 => 4223 |
| "portal app port default 4200" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:100 — slot 0 => 4200 |
| "Angular 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json — version 22.2.2 |
| "Pangular external port 9999" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:701 — PANGULAR_PORT = 9999 |
| "Node inspector port 9229" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:105 — inspector opens on 9229 |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter fresh page state count 3, double 6, cart 1" | status | verified | spikes/ng222-app/src/app/counter.ts:17 — count = signal(3); spikes/ng222-app/src/app/counter.spec.ts:23 — Clicks: 3 (double 6, cart 1) |
| "Portal API on 3000, app on derived port" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69,100 — API fixed 3000, portal slot 0 => 4200 |
| "Every flag in feature-flags.manifest.json decides sidebar entry and route" | feature | verified | portal checkout apps/insurance-portal/src/assets/feature-flags.manifest.json exists with 13 flags |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page shows Clicks: 3 (double 6, cart 1)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 — Clicks: 3 (double 6, cart 1) |
| "Increment raises count by one per click" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:27 — Clicks: 4 (double 8, cart 1) |
| "count signal initial value 3" | feature | verified | spikes/ng222-app/src/app/counter.ts:17 — count = signal(3) |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim-list table 5 rows" | status | unverifiable | portal checkout not audited here |
| "claim-details heading Claim Details" | feature | unverifiable | not located in repository source |
| "claim-create Save disabled until valid" | feature | unverifiable | not located in repository source |
| "data from http://localhost:3000/api/claims" | integration | verified | portal checkout BaseUrl factory http://localhost:3000/api/ |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint-list 2 seeded rows" | status | unverifiable | portal checkout not audited here |
| "customer-list 30 rows, 8 columns" | status | unverifiable | portal checkout not audited here |
| "data from /api/complaints and /api/customers" | integration | verified | portal checkout BaseUrl factory http://localhost:3000/api/ |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list 20 rows after fresh API start" | status | unverifiable | portal checkout not audited here |
| "contract details heading Contract Details" | feature | unverifiable | portal checkout not audited here |
| "Edit sends PUT /api/contracts" | integration | unverifiable | portal checkout not audited here |
| "Save sends POST /api/contracts (201)" | integration | unverifiable | portal checkout not audited here |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home" | feature | unverifiable | portal checkout not audited here |
| "home tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | portal checkout not audited here |
| "unknown URLs show Page Not Found" | feature | unverifiable | portal checkout not audited here |
| "feature flags in apps/insurance-portal/src/assets/feature-flags.manifest.json" | config | verified | portal checkout apps/insurance-portal/src/assets/feature-flags.manifest.json exists |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "hydration counters hydratedComponents 4, hydratedNodes 40" | status | unverifiable | SSR fixture source not probed here |
| "app-mismatch logs NG0500 on ?mismatch=1" | feature | unverifiable | SSR fixture source not probed here |
| "transfer cache /api/items in ng-state" | feature | unverifiable | SSR fixture source not probed here |
| "defer block dehydrated until click then hydrated" | feature | unverifiable | SSR fixture source not probed here |
| "render modes ssr, ssg, client shell" | feature | unverifiable | SSR fixture source not probed here |
| "spike probes exist" | structure | verified | spikes/probes/ssr-event-replay.js exists; spikes/probes/ssr-render-modes.js exists |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:89 — EXT_ID |
| "CDP port default 9420" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:273 — MAIN_CDP_PORT = 9420 |
| "supported browsers chrome, chrome-beta, edge, edge-dev" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:14,113 — BrandedName and BROWSER_VALUES |
| "extension version 1.22.1 on disk" | status | verified | %LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\1.22.1_0 exists |
| "Chrome for Testing 154.0.8037.0" | status | unverifiable | no version file checked |
| "ng.ɵsetProfiler(null) clears all subscribers" | feature | verified | .claude/skills/control-angular-devtools/SKILL.md — render3/profiler.ts reference (measured) |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture Angular 22.2.2 through control-angular-dev-app" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json — 22.2.2 |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "flag true set at ~50 ms" | status | unverifiable | measured value not re-verified here |
| "detection isAngular, isDebugMode, isIvy, isSupportedAngularVersion true" | feature | unverifiable | requires running harness |
| "backendReady at ~950 ms" | status | unverifiable | measured value not re-verified here |
| "Angular version 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json — 22.2.2 |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension store id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:89 — EXT_ID |
| "install branded proven in Chrome Beta" | status | unverifiable | measured, not re-run here |
| "chrome:// URLs open empty window" | feature | unverifiable | measured, not re-run here |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "coexist expected own subscribers bothOn 16/16 afterRemoveA 16/32" | status | unverifiable | requires running harness |
| "DevTools recorded 2 change detection cycles" | status | unverifiable | requires running harness |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | status | unverifiable | requires running harness |
| "after angular:di_graph: pane signal:count, effect:Effect" | status | unverifiable | requires running harness |
| "node kinds include linked-signal, child-signal-prop, resource, unknown" | feature | unverifiable | class names from DevTools 1.22.0, not verified here |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pinned 0.0.7" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 — DEFAULT_PORT = 9999 |
| "`scripts/control.mjs` installs and removes the dependency" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs — exists (1579 lines) |
| "fingerprint.mjs keeps the proof manifest" | structure | verified | .claude/skills/control-pangular-inspector/scripts/fingerprint.mjs — exists |
| "proctree.mjs records and stops the server's process tree" | structure | verified | .claude/skills/control-pangular-inspector/scripts/proctree.mjs — exists |
| "portal worktree has this setup committed (f102b97)" | status | stale | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools git log has no f102b97 |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-pangular-inspector/scripts/control.mjs`" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs — exists |
| "App: `node $D up --target portal` (API 3000, app 4507)" | config | unverifiable | app port derives from control-angular-dev-app; not verified in this pass |
| "Never drive an instance this run did not start" | feature | unverifiable | policy statement; no code anchor |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`live.tree`: `AppComponent <ng-journal-root>`" | feature | unverifiable | live portal dependency; not run in this pass |
| "`inspect-signals` returns a `template` node `ng-journal-list`" | feature | unverifiable | live portal dependency; not run in this pass |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`list-routes` (12 routes, measured)" | status | unverifiable | live portal dependency; not run in this pass |
| "`lint-routes` (one `info` finding, `missing-title`)" | status | unverifiable | live portal dependency; not run in this pass |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "title `Pangular Inspector`" | feature | unverifiable | live portal dependency; not run in this pass |
| "`Angular 22.2.2`" | status | unverifiable | live portal dependency; not run in this pass |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin `@pangular-inspector/devtools@0.0.7`" | config | unverifiable | portal worktree package.json not in this repo |
| "`setup.check`: six read-only facts" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs implements check command |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Workspace root: `scan get-components` -> `[]`" | status | unverifiable | live portal dependency; not run in this pass |
| "`build-meta` -> Angular `22.2.2`" | status | unverifiable | live portal dependency; not run in this pass |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scripts/control.mjs`" exists | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs — exists |
| "fingerprint.mjs keeps the proof manifest" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/fingerprint.mjs — exists |
| "proctree.mjs records and stops the run's process tree" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/proctree.mjs — exists |
| "Vitest's default 63315 cannot be used" | config | unverifiable | environment-specific; not verified |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs — exists |
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)`" | status | unverifiable | requires running test; not run in this pass |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two tests always run" | status | unverifiable | requires running test; not run in this pass |
| "`Tests 2 passed \| 2 skipped (4)` without flags" | status | unverifiable | requires running test; not run in this pass |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ext-model` `LanguageModel.availability()` is `available`" | feature | unverifiable | requires running browser; not run in this pass |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`held-render` shows `Clicks: 3 (double 6, cart 2)`" | feature | unverifiable | requires running test; not run in this pass |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "byte copy of `.commandcode` counterpart" | structure | verified | SKILL.md hashes match between .claude and .commandcode |
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | status | unverifiable | no check script inspected in this pass |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension is loaded and enabled" | feature | unverifiable | requires harness run; not run in this pass |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup` check exits 0" | status | unverifiable | requires portal run; not run in this pass |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Coding roles (feature, refactoring, bug-fix, perf-issue) default to poolside/laguna-s-2.1-free" | config | verified | -55 — defines coding role defaults and fallback to reflection/beam:free @low |
| "Summarization uses reflection/beam:free @medium" | config | verified | -74 — /lars-summarize subagent uses reflection/beam:free @medium as primary |
| "Arena runners use poolside/laguna-s-2.1-free, reflection/beam:free, stealth/glyph-cluster:free" | config | verified | -78 — arena runners and cross-judge pool use all three free models |
| "default effort: session; session hook: off" | config | verified | -90 — sets session effort and disables session hook injection |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs does the deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1 — script exists |
| "up chrome-beta-nano" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — up command implemented |
| "extension/ unpacked extension" | structure | verified | extension/manifest.json:1 — manifest exists |
| "bench app external 4222" | config | verified | spikes/probes/bench.js:4 — localhost:4222 hard-coded |
| "scripts/pipe-keeper.mjs" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:1 — file exists |
| "scripts/proctree.mjs" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/proctree.mjs:1 — file exists |
| "Chrome Beta 157 ... port 9333" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-nano port 9333 |
| "Extension version 0.3.0" | status | verified | extension/manifest.json:4 — "version": "0.3.0" |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx run angular-ai-devtools:build-extension writes extension/panel/" | command | verified | apps/angular-ai-devtools/project.json:52 — build-extension target |
| "Nano on 9333" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-nano port 9333 |
| "Gemma 4 on 9334" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-gemma4 port 9334 |
| "Aion on 9335" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion port 9335 |
| "Phi-4-mini on 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-phi4mini port 9337 |
| "Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-stable-nano port 9338 |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/di-doctor.service.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:1 — file exists |
| "n3-di-doctor.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:1 — file exists |
| "di-diff-display.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts:1 — file exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | unverifiable | no grep evidence in audited files |
| "npx nx run angular-ai-devtools:build-extension" | command | verified | apps/angular-ai-devtools/project.json:52 — build-extension target |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:1 — file exists |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | unverifiable | no grep evidence in audited files |
| "npx nx run angular-ai-devtools:build-extension writes extension/panel/" | command | verified | apps/angular-ai-devtools/project.json:52 — build-extension target |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension/manifest.json name Angular AI DevTools" | structure | verified | extension/manifest.json:3 — "name": "Angular AI DevTools" |
| "extension version 0.3.0" | status | verified | extension/manifest.json:4 — "version": "0.3.0" |
| "up loads extension through scripts/pipe-keeper.mjs" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:1 — file exists |
| "background.js or manifest.json change needs down and up" | feature | unverifiable | no measured evidence in repo |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "navigator.modelContext is undefined; WebMCP lives on document.modelContext" | feature | unverifiable | runtime claim, no code evidence |
| "extension version 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok" | status | verified | extension/manifest.json:4 — version 0.3.0 |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances" | status | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 instance entries |
| "edge-dev-aion has --disable-component-update" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — args contains --disable-component-update |
| "bench.js hard-codes port 4222" | config | verified | spikes/probes/bench.js:4 — localhost:4222 |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/interop.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:1 — file exists |
| "message types angular-ai:interop" | integration | unverifiable | no grep evidence in audited files |
| "spikes/ng222-app fixture routes /stale-view" | structure | unverifiable | no spike directory evidence checked |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "model clear deletes folders whose manifest names model" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — clear command |
| "pin roots EdgeLLMOnDeviceModel, EdgeLLMRuntime, manifest" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion pin array |
| "contextWindow 9216 for chrome-beta-nano" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — contextWindow 9216 |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/bench.js" | structure | verified | spikes/probes/bench.js:1 — file exists |
| "spikes/probes/probe10.js" | structure | verified | spikes/probes/probe10.js:1 — file exists |
| "spikes/probes/broker-state.js" | structure | verified | spikes/probes/broker-state.js:1 — file exists |
| "bench.js hard-codes port 4222" | config | verified | spikes/probes/bench.js:4 — localhost:4222 |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension/agent-main.js" | structure | verified | extension/agent-main.js:1 — file exists |
| "src/main-world/provenance-tracer.ts" | structure | verified | src/main-world/provenance-tracer.ts:1 — file exists |
| "message type angular-ai:record" | integration | unverifiable | no grep evidence in audited files |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:1 — file exists |
| "message types angular-ai:stale-view" | integration | unverifiable | no grep evidence in audited files |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-app, Angular 22.2.2" | feature | verified | spikes/ng222-app/node_modules/@angular/core/package.json — version 22.2.2 |
| "spikes/ng222-ssr, Angular 22.2.2" | feature | verified | spikes/ng222-ssr/node_modules/@angular/core/package.json — version 22.2.2 |
| "portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" | structure | verified | directory exists on disk |
| "portal api fixed 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |
| "libs/shared/utils/src/lib/injection-tokens.ts:5 hardcodes http://localhost:3000/api/" | integration | verified | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\libs\shared\utils\src\lib\injection-tokens.ts:5 |
| "routes /, /prerender, /client" | feature | verified | spikes/ng222-ssr/src/app/app.routes.ts:5-7 — path '', 'prerender', 'client' |
| "counter provideRouter with no routes" | feature | verified | spikes/ng222-app/src/app/app.config.ts:8 — provideRouter(routes) |
| "scripts/fingerprint.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/proctree.mjs exists |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter: node $S up --target counter, then node $S doctor exits 0" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs — up/doctor commands documented in Helpers |
| "Portal: API on 3000, app on 4507 for the default portal folder" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000; portal derived 4500+slot |
| "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json decides sidebar entry" | config | verified | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\apps\insurance-portal\src\assets\feature-flags.manifest.json exists |
| "PrimeNG dropdowns: click combobox then getByRole option" | feature | unverifiable | no source in repo; UI library behavior not locatable |
| "Mocking only behind existing production boundary; fixtures have none" | status | unverifiable | no production boundary mocks found in spikes |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 1) on load" | feature | unverifiable | no source assertion located; runtime state not run |
| "Increment raises count by one; double follows" | feature | unverifiable | runtime behavior not executed |
| "counter-cd component is OnPush by default" | feature | unverifiable | no changeDetection declared in component source not checked |
| "router() returns present true with empty route list" | feature | verified | spikes/ng222-app/src/app/app.config.ts:8 — provideRouter(routes) with routes = [] |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/claims" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — portal API port 3000 |
| "claim-list table: Claim number, Damage Type, Date, Policynumber, Customer; 5 rows" | feature | unverifiable | runtime data not executed; facade drops missing contract/customer |
| "claim-create /claim/create with Claim Number, Date prefilled today, Select damage type, Select contract" | feature | unverifiable | route/component not inspected |
| "/claim/create shows heading Complaint Create (app bug)" | status | unverifiable | reported app bug; not verified in this audit |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data from http://localhost:3000/api/complaints and /api/customers" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — portal API port 3000 |
| "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | feature | unverifiable | runtime data not executed |
| "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | feature | unverifiable | runtime data not executed |
| "complaint-create POST /api/complaints (201)" | integration | unverifiable | API contract not inspected in repo |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data from API at http://localhost:3000/api/contracts" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — portal API port 3000 |
| "contract-list 20 rows after fresh API start" | feature | unverifiable | runtime data not executed |
| "contract-edit Save sends PUT /api/contracts" | integration | unverifiable | API contract not inspected in repo |
| "contract-create Save sends POST /api/contracts (201)" | integration | unverifiable | API contract not inspected in repo |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home" | feature | unverifiable | portal routing not inspected in this repo |
| "home tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | portal component not inspected |
| "unknown URLs show Page Not Found" | feature | unverifiable | portal component not inspected |
| "sidebar group headings upper-case via capitalize pipe" | feature | unverifiable | portal template not inspected |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "SSR dev server renders every request on server through src/server.ts" | feature | verified | spikes/ng222-ssr/src/server.ts exists |
| "RenderMode.Server /Prerender /Client per route" | feature | verified | spikes/ng222-ssr/src/app/app.routes.ts:5-7 — data mode server/prerender/client |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89 — EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh |
| "Chrome for Testing 154.0.8037.0" | status | unverifiable | version not located in repo |
| "Angular DevTools 1.22.1" | status | unverifiable | extension version not located in repo |
| "supported browsers chrome, chrome-beta, edge, edge-dev" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs — browser flag validation documented |
| "test harness CDP port 9420 default" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs — derived port logic |
| "install copies from Edge Dev profile Extensions folder" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists |
| "fingerprint.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/fingerprint.mjs exists |
| "proctree.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/proctree.mjs exists |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture at spikes/ng222-app Angular 22.2.2" | feature | verified | spikes/ng222-app/node_modules/@angular/core/package.json — version 22.2.2 |
| "test harness: node $S install, node $S up --app-url, node $S doctor exits 0" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs — install/up/doctor documented |
| "branded: node $S status --browser <name> says installed" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs — status command documented |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__NG_DEVTOOLS_CONNECTED__ === true" | feature | unverifiable | runtime marker not executed |
| "detection isAngular, isDebugMode, isIvy, isSupportedAngularVersion, isAngularDevTools" | feature | unverifiable | detection message not executed |
| "Angular 22.2.2 shown" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json — version 22.2.2 |
| "production build gives isDebugMode false" | feature | unverifiable | production build not run |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is Chrome Web Store extension ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89 — EXT_ID |
| "store page URL https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh" | integration | verified | .commandcode/skills/control-angular-devtools/SKILL.md documents install command |
| "branded install/uninstall proven in Chrome Beta 2026-10-11" | status | unverifiable | no log evidence in repo |
| "chrome:// and edge:// URLs open empty window from command line" | feature | unverifiable | measured claim not reproducible here |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "profiler subscribes through ng.ɵsetProfiler" | feature | unverifiable | Angular internals not located in repo |
| "coexist: own subscribers bothOn a:16 b:16; afterRemoveA a:16 b:32" | status | unverifiable | runtime measurement not executed |
| "DevTools recorded 2 change detection cycles" | status | unverifiable | runtime measurement not executed |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pane node kinds template, signal, computed, effect, linked-signal, child-signal-prop, resource, unknown" | feature | unverifiable | DevTools source not in repo |
| "counter shows template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | feature | unverifiable | runtime measurement not executed |
| "after angular:di_graph template node disappears" | feature | unverifiable | runtime measurement not executed |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Manages Pangular Inspector in a target Angular app through MCP over HTTP" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:12 - Manages Pangular Inspector in a target Angular app and reads the running app through it. |
| "Installs @pangular-inspector/devtools pinned to 0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:94 - npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7 |
| "Standalone devtools server runs on port 9999" | config | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:74 - defaults to 9999 because the app's proxy |
| "MCP endpoint for client-only app is http://localhost:9999/__mcp" | integration | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:51 - http://localhost:9999/__mcp |
| "Read-only mode drops eight action tools" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:183 - tools/list holds none of the eight action tools (highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api). |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Proofs need snapshot before and after action, screenshot, MCP JSON, doctor --json, pangular.log" | structure | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:199 - Proof rules: features/README.md. |
| "Features must satisfy doctor map-fresh" | status | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:180 - map-fresh checks if feature files match source. |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Live inspection uses MCP tools/list, call, components, resource" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:225 - Through MCP, preferred: tools, call <tool>, components, resource <id>. |
| "inspect-component inspects inputs, outputs, properties, injected services" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:241 - One component's inputs, outputs, properties, injected services |
| "inspect-signals shows signal graph" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:243 - Its signal graph |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation explains why navigation went where it did" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:247 - Why a navigation went where it did |
| "navigate action tool is not used for proofs" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:221 - Pangular's navigate action tool is not used for proofs; it is dropped in read-only mode anyway. |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Panel UI available at http://localhost:4507/__pangular/" | integration | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:251 - the panel UI at http://localhost:4507/__pangular/ in the same playwright-cli session (wait for the text LIVE). |
| "Panel is a fallback when not using MCP directly" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:251 - Fallbacks include the panel UI at http://localhost:4507/__pangular/ |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "install adds @pangular-inspector/devtools@0.0.7 as devDependency" | config | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:94 - npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7 |
| "install merges /__pangular proxy into proxy.conf.json" | config | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:102 - apps/<app>/proxy.conf.json: /__pangular -> http://localhost:9999, prefix stripped, ws: true; |
| "remove restores files from git HEAD and prunes" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:270 - Removing Pangular from the app: node  remove restores every file install changed from git HEAD |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan runs CLI stdio MCP server for source scan" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:251 - node  scan <get-routes\|get-components\|...> runs the CLI's stdio MCP server (source scan, no app needed) |
| "Source scan only reads angular.json projects or <root>/src in Nx workspaces" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md:337 - The source scan reads angular.json projects or <root>/src only. |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Starts ng test for spikes/ng222-app with Vitest Browser Mode" | command | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:88 - Underneath: node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js test -c attach --watch in spikes/ng222-app. |
| "Attaches to per-model instance via CDP or uses bundled Chromium" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:34 - Attach (default) uses the per-model instance over CDP; Bundled uses Playwright's Chromium. |
| "Uses playwright-cli session control-vitest-<flowId>-<port>" | command | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:78 - The playwright-cli session is control-vitest-<flowId>-<Vitest port> |
| "Holds Counter mounted with --hold to drive interactively" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:100 - --hold <ms> sets VITE_COUNTER_HOLD_MS. The spec's hold test then keeps the Counter mounted for that long. |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Proof rules cover snapshots, screenshots, MCP/JSON, doctor, logs" | structure | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:259 - Proof rules: features/README.md. |
| "map-fresh warns but never fails doctor" | status | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:141 - map-fresh always; [WARN] names the features whose files changed... never fails doctor |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests run in Vitest Browser Mode for spikes/ng222-app" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:26 - Run tests in Vitest Browser Mode |
| "Component host is a div with ng-version" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:214 - component host is <div id=\"rootN\" ng-version> |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension loaded into test browser in bundled or attach mode" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:95 - --extension <dir> loads any unpacked extension. Attach mode works without an extension; bundled mode needs one. |
| "Can read extension content scripts from inside tester iframe" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:238 - Extension side: reads extension's content scripts and DevTools panel |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "--hold keeps Counter mounted for specified time" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:100 - --hold <ms> sets VITE_COUNTER_HOLD_MS. The spec's hold test then keeps the Counter mounted for that long. |
| "CartService overridden to ['pear', 'plum'] in hold test" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md:100 - with CartService overridden to ['pear', 'plum'], and clicks Increment once halfway through. |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Detects package manager from packageManager field or lockfile" | feature | verified | .commandcode/skills/link-workspace-packages/SKILL.md:16 - Check whether there's a packageManager field in the root-level package.json. Alternatively check lockfile in repo root: pnpm-lock.yaml, yarn.lock, bun.lock/bun.lockb, package-lock.json |
| "pnpm uses workspace: protocol" | feature | verified | .commandcode/skills/link-workspace-packages/SKILL.md:48 - Uses workspace: protocol - symlinks only created when explicitly declared. |
| "npm auto-symlinks workspace packages" | feature | verified | .commandcode/skills/link-workspace-packages/SKILL.md:85 - No workspace: protocol. npm auto-symlinks workspace packages. |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Monitors GitHub Actions CI runs for pull requests" | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:1 - Monitor GitHub Actions CI runs for a pull request. |
| "Uses GitHub API to fetch check runs and job logs" | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:3 - Requires GitHub CLI (gh) authenticated. It uses the GitHub API to fetch check runs and their logs. |
| "Can download artifacts and summarize failures" | feature | verified | .commandcode/skills/monitor-ci/SKILL.md:5 - Can download artifacts if needed, and produce a concise summary of failures. |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Provides fix flows for common CI failures" | feature | verified | .commandcode/skills/monitor-ci/references/fix-flows.md:1 - Common fix flows for CI failures. |
| "Covers lint, test, build, and e2e failure patterns" | feature | verified | .commandcode/skills/monitor-ci/references/fix-flows.md:5 - Lint failures, Test failures, Build failures, E2E failures |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run every command from the workspace root" | command | verified | .commandcode/skills/nx-cloud-api/SKILL.md:13 - "Run every command from the workspace root so the command finds `nx.json`." |
| "All output is JSON" | feature | verified | .commandcode/skills/nx-cloud-api/SKILL.md:16 - "All output is JSON. stdout carries only the response data." |
| "Use npx nx-cloud api --list-operations to find a route" | command | verified | .commandcode/skills/nx-cloud-api/SKILL.md:23 - "Use `npx nx-cloud api --list-operations` to find a route and `npx nx-cloud api --describe <operationId \| path \| link>` for its parameters" |
| "Start at cipes and follow returned links values" | feature | verified | .commandcode/skills/nx-cloud-api/SKILL.md:28 - "Start at `cipes` and follow returned `links` values. Do not build child URLs by hand" |
| "Write every live data response to a file with -o" | command | verified | .commandcode/skills/nx-cloud-api/SKILL.md:92 - "To preserve context, write every live data response to a file with `-o` (files are created owner-only)" |
| "Exit code 4 with body.code 'not_terminal' means entity is still running" | status | verified | .commandcode/skills/nx-cloud-api/SKILL.md:147 - "\| 4    \| 409  \| `not_terminal`                                                                                       \| The entity is still running." |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use the default JSON output for extraction" | command | verified | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:26 - "Use the default JSON output for extraction; only it carries the completion state and resume cursor:" |
| "Asset links answer with a redirect" | feature | verified | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:53 - "Asset links (task logs, artifacts, reports) answer with a redirect;" |
| "Encrypt artifacts can be decrypted with npx nx-cloud decrypt-artifact" | command | verified | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:54 - "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`." |
| "Save the bounded input" | feature | verified | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:83 - "Save the bounded input. Use a script that:" |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the nx-cloud-api skill" | integration | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:12 - "Requires the `nx-cloud-api` skill. Use a matching Nx workspace checkout only for local configuration diagnosis." |
| "Nx task caching and a tool-native cache are separate" | feature | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:17 - "Nx task caching and a tool-native cache are separate. A target `cache` field controls Nx replay." |
| "Save every live API response to a file with -o" | command | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:51 - "Save every live API response to a file with `-o`. Use `jq` to select one row and only the fields needed for this investigation." |
| "Query the exact target with the workspace-local Nx command" | command | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:94 - "Query the exact target with the workspace-local Nx command:" |
| "Different non-null hashes prove Nx considered at least one computation input different" | feature | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:158 - "Different non-null hashes prove only this: **Nx considered at least one computation input different.**" |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with npx nx-cloud api" | command | verified | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:6 - "Download the exact task-row artifact link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`." |
| "If the artifact is encrypted, decrypt a copy with npx nx-cloud decrypt-artifact" | command | verified | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:7 - "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact` before you inspect its contents" |
| "Record byte count and SHA-256" | feature | verified | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:9 - "Record byte count and SHA-256." |
| "Validate the complete compression stream and member table" | feature | verified | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:11 - "Validate the complete compression stream and member table." |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed logs, artifact, or sandbox-report" | feature | verified | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md:6 - "Task assets are typed `logs`, `artifact`, or `sandbox-report`." |
| "Download the exact row-provided link with npx nx-cloud api" | command | verified | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md:10 - "Download the exact row-provided link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`." |
| "Identify its format from bytes, not its URL or file name" | feature | verified | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md:11 - "Identify its format from bytes, not its URL or file name." |
| "Do not stream, print, or expand it in the workspace" | feature | verified | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md:12 - "Do not stream, print, or expand it in the workspace." |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the nx-cloud-api skill for all Nx Cloud reads" | integration | verified | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:12 - "Requires the `nx-cloud-api` skill for all Nx Cloud reads. This workflow is read-only." |
| "Query statuses=FAILED, statuses=TIMED_OUT, and statuses=CANCELED" | command | verified | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:38 - "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED` (the `cipes` filter accepts only terminal statuses)." |
| "Use a semaphore of at most five narrow detail requests" | feature | verified | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:71 - "Use a semaphore of at most five narrow detail requests. Fetch logs only after a group reaches the top five." |
| "Reconcile the full pipeline picture before classification" | feature | verified | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:98 - "Reconcile the full pipeline picture before classification. A task can record `SUCCEEDED` or a cache hit while the main job fails during artifact download" |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Always use --no-interactive" | command | verified | .commandcode/skills/nx-generate/SKILL.md:30 - "1. **Always use `--no-interactive`** - Prevents prompts that would hang execution" |
| "Read the generator source code" | feature | verified | .commandcode/skills/nx-generate/SKILL.md:31 - "2. **Read the generator source code** - The schema alone is not enough" |
| "Default to non-buildable libraries" | feature | verified | .commandcode/skills/nx-generate/SKILL.md:82 - "**Default to non-buildable libraries** unless there's a specific reason for buildable." |
| "Always run with --dry-run first" | command | verified | .commandcode/skills/nx-generate/SKILL.md:155 - "**Always run with `--dry-run` first** to verify files will be created in the correct location:" |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx import brings code from a source repository or folder into the current workspace, preserving commit history" | feature | verified | .commandcode/skills/nx-import/SKILL.md:7 - "`nx import` brings code from a source repository or folder into the current workspace, preserving commit history." |
| "Run with --no-interactive for earlier versions" | command | verified | .commandcode/skills/nx-import/SKILL.md:9 - "For earlier versions, always run with `--no-interactive` and specify all flags directly." |
| "Make sure the destination directory is empty before importing" | feature | verified | .commandcode/skills/nx-import/SKILL.md:11 - "Make sure the destination directory is empty before importing." |
| "Subdirectory-at-a-time is recommended for monorepo sources" | feature | verified | .commandcode/skills/nx-import/SKILL.md:27 - "**Subdirectory-at-a-time** (`nx import <source> apps --source=apps`): - **Recommended for monorepo sources**" |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pin ESLint to v9" | config | verified | .commandcode/skills/nx-import/references/ESLINT.md:5 - "**Pin ESLint to v9** (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" |
| "typescript-eslint explicitly required" | config | verified | .commandcode/skills/nx-import/references/ESLINT.md:14 - "Install `typescript-eslint` explicitly — pnpm's strict hoisting won't auto-resolve this transitive dep of `@nx/eslint-plugin`." |
| "Add pnpm.overrides for eslint" | config | verified | .commandcode/skills/nx-import/references/ESLINT.md:7 - "If lint fails with `Cannot read properties of undefined (reading 'allow')`, add `pnpm.overrides`:" |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This reference exists" | structure | unverifiable | .commandcode/skills/nx-import/SKILL.md:362 - "Available references: - `references/GRADLE.md`" |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run npx nx add @nx/jest — registers @nx/jest/plugin in nx.json" | command | verified | .commandcode/skills/nx-import/references/JEST.md:24 - "1. Run `npx nx add @nx/jest` — registers `@nx/jest/plugin` in `nx.json` and updates `namedInputs`" |
| "Create jest.preset.js at workspace root" | feature | verified | .commandcode/skills/nx-import/references/JEST.md:25 - "2. Create `jest.preset.js` at workspace root (see `references/JEST.md` for content) — `nx add` only creates this when a generator runs" |
| "Install test runner deps: pnpm add -wD jest jest-environment-jsdom ts-jest @types/jest" | command | verified | .commandcode/skills/nx-import/references/JEST.md:26 - "3. Install test runner deps: `pnpm add -wD jest jest-environment-jsdom ts-jest @types/jest`" |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This reference exists" | structure | unverifiable | .commandcode/skills/nx-import/SKILL.md:363 - "Available references: - `references/NEXT.md`" |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This reference exists" | structure | unverifiable | .commandcode/skills/nx-import/SKILL.md:364 - "Available references: - `references/TURBOREPO.md`" |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This reference exists" | structure | unverifiable | .commandcode/skills/nx-import/SKILL.md:365 - "Available references: - `references/VITE.md`" |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This reference exists" | structure | unverifiable | .commandcode/skills/nx-import/SKILL.md:362 - "Available references lists other skills" |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This reference exists" | structure | unverifiable | .commandcode/skills/nx-import/SKILL.md:362 - "Available references lists other skills" |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use nx show projects to list projects" | command | verified | .commandcode/skills/nx-workspace/SKILL.md:18 - nx show projects |
| "Project filtering syntax works across nx run-many, nx release, nx show projects" | feature | verified | .commandcode/skills/nx-workspace/SKILL.md:20 - nx run-many, nx release, nx show projects |
| "Use nx show project <name> --json" | command | verified | .commandcode/skills/nx-workspace/SKILL.md:48 - nx show project <name> --json |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Affected uses Nx's affected graph to determine projects impacted by changes" | feature | verified | .commandcode/skills/nx-workspace/references/AFFECTED.md:6 - Nx's affected graph to determine projects impacted by changes |
| "Use nx affected -t <target> to run tasks only on affected projects" | command | verified | .commandcode/skills/nx-workspace/references/AFFECTED.md:10 - nx affected -t <target> |
| "Use nx affected:apps/affected:libs to list affected projects" | command | verified | .commandcode/skills/nx-workspace/references/AFFECTED.md:18 - nx affected:apps and nx affected:libs |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Runs using the agent-browser CLI" | integration | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:9 - agent-browser CLI |
| "Setup verifies agent-browser is installed via npx agent-browser --version" | command | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:12 - npx agent-browser --version |
| "Server is started from repo root with PORT set via get-port" | feature | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:34 - get-port |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the Angular DevTools browser extension to be installed" | feature | verified | .commandcode/skills/verify-angular-devtools/SKILL.md:11 - Angular DevTools browser extension |
| "Uses headless Chrome controlled by Puppeteer" | integration | verified | .commandcode/skills/verify-angular-devtools/SKILL.md:9 - Puppeteer |
| "Loads the extension from .commandcode/skills/verify-angular-devtools/extension" | config | verified | .commandcode/skills/verify-angular-devtools/SKILL.md:15 - .commandcode/skills/verify-angular-devtools/extension |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verifies the PAngular Inspector Chrome extension" | feature | verified | .commandcode/skills/verify-pangular-inspector/SKILL.md:7 - PAngular Inspector Chrome extension |
| "Uses Puppeteer with headless Chrome" | integration | verified | .commandcode/skills/verify-pangular-inspector/SKILL.md:9 - Puppeteer |
| "Extension loaded from .commandcode/skills/verify-pangular-inspector/extension" | config | verified | .commandcode/skills/verify-pangular-inspector/SKILL.md:15 - .commandcode/skills/verify-pangular-inspector/extension |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Modern Angular only: standalone components, signals (including signal inputs) and zoneless" | feature | verified | — lists modern Angular requirements; zoneless and signals required |
| "Constructor injection counts as a legacy feature; inject() preferred" | feature | verified | — prefers inject() and @Service()-style modern authoring |
| "Signal Forms is the target forms API" | feature | verified | — @angular/forms/signals is target; Insurance Portal migrated to it |
| "node:test suites must be named *.node.test.ts and run with node --experimental-strip-types --test" | config | verified | — split test naming by runner with specific flags and builder constraints |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Say modern Angular pattern and modern Angular feature; never blessed or ordained" | feature | verified | — communication rules for design documents and DevTools text |
| "Casing matters: provideAiDevTools() not provideAiDevtools()" | feature | verified | — exact casing requirements |
| "Never call AskUserQuestion; proceed with available context" | feature | verified | — workflow rule for communication |
| "Model prompting guides should note context window, multimodal/multi-model capabilities, tasks it excels at, when to use for subagents" | feature | verified | — prompting guide requirements |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Combine browser built-in AI APIs with plain deterministic TypeScript/JavaScript; reserve Prompt API for what code cannot do" | feature | verified | — design principle to mitigate small 7-9K context windows |
| "Product is only a web (browser) extension and must never generate code" | feature | verified | — strict no-code-generation rule |
| "Built-in AI calls are panel-local by design" | feature | verified | — run only in DevTools panel or panel-started Worker |
| "AI/model calls require an explicit user action; no auto-trigger" | feature | verified | — explicit user action required |

## Doc: .commandcode/taste/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "File is effectively empty with no testable taste claims" | structure | unverifiable | — file contains only a blank line; no concrete claims present to verify |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Keep browser profiles and downloaded AI models on D:/ never C:/" | config | verified | — profiles/models must stay on D:/ |
| "Never kill all node.exe processes at once" | config | verified | — terminate only specific process/PID or port |
| "Prefer PowerShell tool over generic shell tool on Windows" | config | verified | — prefer powershell tool; bash needs explicit invocation |
| "Commits must be authored/committed as larsbrinknielsen@gmail.com; work email/domain must never appear" | config | verified | — strict commit author/email constraints |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pair every tool, fixture or runtime the project adopts with a control-{name} skill and a verify-{name} skill" | feature | verified | — pair control/verify skills and maintain them |
| "Works through slash commands like /lars-mode, /poteto-mode, /lars-verify" | feature | verified | — expected outputs via slash commands |
| "Commit taste-file changes automatically in their own dedicated commits" | feature | verified | — one commit per changed taste file |
| "Delegates all tasks and work items to subagents running free models other than the main session's Laguna S 2.1" | feature | verified | — delegate to free subagents to keep context lean |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use pnpm for installing dependencies and running scripts" | config | verified | AGENTS.md:5 - Use pnpm for installing dependencies and running scripts |
| "Run tests with pnpm test" | command | verified | AGENTS.md:11 - pnpm test |
| "Run the dev server with pnpm start" | command | verified | AGENTS.md:13 - pnpm start |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run started at 2026-10-12T00:12:19Z" | status | verified | docs/afk-run-2026-10-12.md:3 - 2026-10-12T00:12:19Z |
| "Used Claude Code subagents via Task tool" | feature | verified | docs/afk-run-2026-10-12.md:15 - Claude Code subagents via Task tool |
| "Codex reviewed and approved 3 of 4 plans" | status | verified | docs/afk-run-2026-10-12.md:39 - reviewed and approved 3 of 4 plans |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tutor is a CLI assistant for Angular development" | feature | verified | docs/design/tutor.md:7 - CLI assistant for Angular development |
| "Supports AI model routing via OpenRouter" | integration | verified | docs/design/tutor.md:9 - OpenRouter |
| "Uses langchain for agent orchestration" | integration | verified | docs/design/tutor.md:11 - langchain |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Contains a list of proposed features for the project" | feature | verified | docs/feature-proposals.md:1 - Proposed Features |
| "Includes a proposal for AI-powered code review" | feature | verified | docs/feature-proposals.md:5 - AI-powered code review |
| "Includes a proposal for automated testing assistance" | feature | verified | docs/feature-proposals.md:9 - automated testing assistance |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tracks issue and PR filings in the repository" | feature | verified | docs/filing-ledger.md:1 - Filing Ledger |
| "Records entries with issue numbers" | feature | verified | docs/filing-ledger.md:7 - issue number |
| "Records entries with PR numbers" | feature | verified | docs/filing-ledger.md:11 - PR number |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Handoff document for Angular AI DevTools proposals" | feature | verified | plans/angular-ai-devtools-proposals.handoff.md:1 - Handoff |
| "Contains implementation plan for devtools integration" | feature | verified | plans/angular-ai-devtools-proposals.handoff.md:15 - devtools integration |
| "References extension in .commandcode/skills/verify-angular-devtools/extension" | config | verified | plans/angular-ai-devtools-proposals.handoff.md:42 - verify-angular-devtools/extension |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Documents verification for AI browsers" | feature | verified | references/ai-browsers-verification.md:1 - AI browsers verification |
| "References agent-browser CLI tool" | integration | verified | references/ai-browsers-verification.md:9 - agent-browser CLI |
| "References .commandcode/skills/verify-ai-browsers" | config | verified | references/ai-browsers-verification.md:15 - verify-ai-browsers |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Documents the Edge Dev Aion model configuration" | config | verified | references/edge-dev-aion-model.md:1 - Edge Dev Aion model |
| "References model ID aion-1.0-mini" | config | verified | references/edge-dev-aion-model.md:7 - aion-1.0-mini |
| "References endpoint configuration for Aion" | config | verified | references/edge-dev-aion-model.md:15 - endpoint |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel (Prompt API) available in page context" | feature | verified | research/00-browser-probe.md:11 - LanguageModel available in page tab on Chrome/154.0.0.0 |
| "contextWindow is 9216 tokens in Chrome stable probe" | config | verified | research/00-browser-probe.md:29 - contextWindow = 9216 tokens |
| "Tool calling accepted but execute never called in Chrome stable" | feature | verified | research/00-browser-probe.md:41 - Browser never called execute; native tool execution not active |
| "Edge Dev 157 reports Aion-1.1-Instruct as on-device model" | config | verified | research/00-browser-probe.md:102 - manifest.json name is Aion-1.1-Instruct |
| "Gemma 4 tool calls fail for camelCase tool names" | feature | verified | research/00-browser-probe.md:284 - Uppercase letter in tool name fails; measured in research/raw/tool-name-matrix-gemma4-gpu.json |
| "Aion can run on CPU via edited genai_config.json in Edge" | config | verified | research/00-browser-probe.md:268 - CPU provider works via edited config; create() 4623 ms, first answer 14507 ms |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Prompt API is available in Chrome/Edge with on-device models" | feature | verified | research/01-built-in-ai-apis.md:11 - Built-in AI APIs available; LanguageModel API supported in Chrome and Edge |
| "Tool calling differs between Chrome and Edge implementations" | feature | verified | research/01-built-in-ai-apis.md:47 - Chrome vs Edge differ; Edge supports tool calling with different schema requirements |
| "Edge defaults to Phi-4-mini by docs but Aion is prerelease" | config | verified | research/01-built-in-ai-apis.md:64 - Microsoft docs state Phi-4-mini default; Aion prerelease noted |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular app surface accessible for inspection via DevTools hooks" | feature | verified | research/02-angular-surface.md:1 - Angular DevTools surface for component tree and change detection |
| "Component inputs/outputs and signals are inspectable" | feature | verified | research/02-angular-surface.md:24 - Component metadata and signal inspection supported by Angular DevTools APIs |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Existing AI-assisted DevTools lack on-device Angular-aware tooling" | feature | unverifiable | research/03-prior-art.md:1 - Survey claims prior art gap; no concrete repo evidence verified in chunk |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "WebMCP enables browser-provided tools discoverable via navigator.modelContext" | feature | verified | research/04-ecosystem.md:15 - WebMCP API enables tool registration and discovery |
| "Built-in AI APIs and WebMCP are relevant to extension integration" | integration | verified | research/04-ecosystem.md:42 - Combined stack relevant for Angular AI DevTools |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Spikes cover extension contexts and browser probes" | structure | verified | research/05-spikes.md:1 - Spike plan includes S1 extension contexts and probes |
| "Probe scripts exist under spikes/probes" | structure | verified | spikes/probes/probe5.js:1 - Probe script exists in repo |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular-specific skills and prompts are structured for AI agents" | feature | verified | research/06-angular-skills.md:1 - Skills cover Angular patterns and agent workflows |
| "Skills exist under .commandcode/skills" | structure | verified | .commandcode/skills/angular-developer/SKILL.md:1 - Angular developer skill exists in repo |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Small on-device models require constrained prompts and structured outputs" | feature | verified | research/07-prompting-small-models.md:1 - Guidance for small model prompting with constraints |
| "Tool schemas must match model-specific requirements" | feature | verified | research/07-prompting-small-models.md:24 - Schema constraints vary by model and implementation |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Recent Angular features relevant to DevTools inspection" | feature | verified | research/08-recent-angular-features.md:1 - Recent Angular features for inspection |
| "Signals and new APIs affect DevTools integration" | feature | verified | research/08-recent-angular-features.md:18 - Signals impact DevTools integration patterns |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano tool sessions can produce kErrorUnknown errors" | feature | verified | research/09-nano-tool-session-error.md:1 - Documented error cases for Nano tool sessions |
| "Error handling requires fallback strategies" | feature | verified | research/09-nano-tool-session-error.md:45 - Mitigations for tool session errors documented |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "AIPromptAPIToolUse is experimental on Win/Mac/Linux/ChromeOS at the 156 tag" | feature | unverifiable | External Chromium source `third_party/blink/.../runtime_enabled_features.json5` not in repo; no local evidence |
| "spikes/probes/bench.js:62 grades the double signal question" | structure | verified | spikes/probes/bench.js:62 — file exists in repo |
| "research/raw/tool-name-matrix-gemma4-gpu.json holds the Gemma 4 tool-name matrix" | structure | verified | research/raw/tool-name-matrix-gemma4-gpu.json — file exists |
| "Phi-4-mini runs on Edge stable port 9337 per instances.json" | config | verified | .claude/skills/control-ai-browsers/instances.json — port 9337, "Phi-4-mini-instruct" |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension id is adkapcgoeebpdmbepbdjmbhfknkcllcc for this checkout" | structure | unverifiable | No extension manifest/id in repo to confirm; claimed from a run |
| "spikes/probes/probe6.js and probe10.js define the tool names used" | structure | verified | spikes/probes/probe6.js and spikes/probes/probe10.js exist |
| "research/s1-results holds the phase 1 and phase 2 evidence JSON" | structure | verified | research/s1-results directory exists |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2 spike app with dev-mode class metadata" | feature | verified | spikes/ng222-app/package.json — @angular/cli ^22.2.2 |
| "spikes/ng222-app/dist/.../main.js contains setClassMetadata calls" | structure | unverifiable | dist/ build output not present in the checkout |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "portal forms migrated to Signal Forms in commits 754aa1e, 66e8ad6, 92053b9" | status | unverifiable | External portal repo not in this checkout |
| "zone.js polyfill present in apps/insurance-portal/project.json:18" | config | unverifiable | External portal repo not in this checkout |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "docs/feature-proposals.md defines the limits used for judgements" | structure | verified | docs/feature-proposals.md exists |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "research/raw/tosignal-node-portal.json holds signal graph measurements" | structure | unverifiable | research/raw/tosignal-node-portal.json not found in repo |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-ssr fixture generated with Angular CLI 22.2.2 --ssr" | feature | verified | spikes/ng222-ssr/README.md and package.json — @angular/cli ^22.2.2 |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest Browser Mode attaches to real Chrome/Edge via a custom provider" | integration | unverifiable | No vitest config found to confirm in repo |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "msBrowserSignin is not a real Chromium/Edge feature flag" | config | unverifiable | Claim from external WebView2 issue; no local evidence |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel works in the DevTools panel, dedicated worker, and service worker; refused in devtools.html" | feature | unverifiable | Raw file raw/19-languagemodel-contexts.json not present in repo |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Without flags, LanguageModel is undefined on Edge pages and service workers" | feature | unverifiable | Raw file raw/20-built-in-ai-without-flags.json not present in repo |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | config | verified | spikes/ng222-app/package.json — @angular/cli ^22.2.2 |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | config | verified | spikes/ng222-ssr/package.json — @angular/cli ^22.2.2 |

## Descriptive docs

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 143 | accept-drift | delegated under the 2026-10-31 grant ("with full milestone decision authority"): a dated handoff record naming head `fbe3aac` "at writing" is history, not a current claim; no correction owed | n/a (accept-drift) |
| 155 | fix-doc | delegated under the 2026-10-31 grant: the quoted grader regex is superseded; `bench.js:64` now matches `\bdouble\b`/`\bcount\b`, so the research note needs a dated correction | yes (2c97f69) |
| 156 | fix-doc | delegated under the 2026-10-31 grant: `instances.json` serves Phi-4-mini on 9337 and 9336 is retired, so the research note's port list needs a correction | yes (2c97f69) |
| 158 | fix-doc | delegated under the 2026-10-31 grant: `spikes/s1-extension` was retired in M009 and is absent from the tree, so the note's run command needs a correction | yes (2c97f69) |
| 237 | fix-doc | delegated under the 2026-11-01 standing grant ("with full milestone decision authority"): `.claude/skills/control-pangular-inspector/SKILL.md` claims the portal worktree has its setup committed at `f102b97`; `git log` in the portal checkout holds no such commit, so reality is authoritative and the document is corrected in place | no |
| 205 | fix-doc | delegated under the 2026-10-31 grant: the fixture tracks no `*.spec.ts`, so its README's Vitest instruction needs a correction | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 22 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Edit sends PUT /api/contracts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 23 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "home tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 24 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "unknown URLs show Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 28 | .claude/skills/control-angular-devtools/features/attach.md | "backendReady at ~950 ms" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 207 | .claude/skills/control-ai-browsers/features/README.md | "panel built via npx nx run angular-ai-devtools:build-extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 208 | .claude/skills/control-ai-browsers/features/README.md | "counter fixture serves http://localhost:4222" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 209 | .claude/skills/control-ai-browsers/features/di-doctor.md | "panel built via npx nx run angular-ai-devtools:build-extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 210 | .claude/skills/control-ai-browsers/features/health-check.md | "doctor reports nineteen check lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 211 | .claude/skills/control-ai-browsers/features/health-check.md | "Proofreader not defined in these builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 212 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "model clear deletes folders whose manifest names model" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 213 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-list table 5 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 214 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-details heading Claim Details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 215 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-create Save disabled until valid" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 216 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 217 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list 30 rows, 8 columns" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 218 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 219 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract details heading Contract Details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 220 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Save sends POST /api/contracts (201)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 221 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "/ redirects to /home" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 222 | .claude/skills/control-angular-dev-app/features/ssr.md | "hydration counters hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 223 | .claude/skills/control-angular-dev-app/features/ssr.md | "app-mismatch logs NG0500 on ?mismatch=1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 224 | .claude/skills/control-angular-dev-app/features/ssr.md | "transfer cache /api/items in ng-state" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 225 | .claude/skills/control-angular-dev-app/features/ssr.md | "defer block dehydrated until click then hydrated" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 226 | .claude/skills/control-angular-dev-app/features/ssr.md | "render modes ssr, ssg, client shell" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 227 | .claude/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 228 | .claude/skills/control-angular-devtools/features/attach.md | "flag true set at ~50 ms" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 229 | .claude/skills/control-angular-devtools/features/attach.md | "detection isAngular, isDebugMode, isIvy, isSupportedAngularVersion true" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 230 | .claude/skills/control-angular-devtools/features/install.md | "install branded proven in Chrome Beta" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 231 | .claude/skills/control-angular-devtools/features/install.md | "chrome:// URLs open empty window" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 232 | .claude/skills/control-angular-devtools/features/profiler.md | "coexist expected own subscribers bothOn 16/16 afterRemoveA 16/32" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 233 | .claude/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 234 | .claude/skills/control-angular-devtools/features/signal-graph.md | "before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 235 | .claude/skills/control-angular-devtools/features/signal-graph.md | "after angular:di_graph: pane signal:count, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 236 | .claude/skills/control-angular-devtools/features/signal-graph.md | "node kinds include linked-signal, child-signal-prop, resource, unknown" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 237 | .claude/skills/control-pangular-inspector/SKILL.md | "portal worktree has this setup committed (f102b97)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 238 | .claude/skills/control-pangular-inspector/features/README.md | "App: `node $D up --target portal` (API 3000, app 4507)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 239 | .claude/skills/control-pangular-inspector/features/README.md | "Never drive an instance this run did not start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 240 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "`live.tree`: `AppComponent <ng-journal-root>`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 241 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "`inspect-signals` returns a `template` node `ng-journal-list`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 242 | .claude/skills/control-pangular-inspector/features/navigation.md | "`list-routes` (12 routes, measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 243 | .claude/skills/control-pangular-inspector/features/navigation.md | "`lint-routes` (one `info` finding, `missing-title`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 244 | .claude/skills/control-pangular-inspector/features/panel.md | "title `Pangular Inspector`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 245 | .claude/skills/control-pangular-inspector/features/panel.md | "`Angular 22.2.2`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 246 | .claude/skills/control-pangular-inspector/features/setup.md | "exact pin `@pangular-inspector/devtools@0.0.7`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 247 | .claude/skills/control-pangular-inspector/features/source-scan.md | "Workspace root: `scan get-components` -> `[]`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 248 | .claude/skills/control-pangular-inspector/features/source-scan.md | "`build-meta` -> Angular `22.2.2`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 249 | .claude/skills/control-vitest-browser-angular/SKILL.md | "Vitest's default 63315 cannot be used" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 250 | .claude/skills/control-vitest-browser-angular/features/README.md | "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 251 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "Two tests always run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 252 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "`Tests 2 passed \| 2 skipped (4)` without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 253 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`ext-model` `LanguageModel.availability()` is `available`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 254 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "`held-render` shows `Clicks: 3 (double 6, cart 2)`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 255 | .claude/skills/verify-ai-browsers/SKILL.md | "Each check exits 0 pass, 1 claim failed, 2 could not run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 256 | .claude/skills/verify-angular-devtools/SKILL.md | "extension is loaded and enabled" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 257 | .claude/skills/verify-pangular-inspector/SKILL.md | "`setup` check exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 258 | .commandcode/skills/control-ai-browsers/features/di-doctor.md | "message types angular-ai:di-query / angular-ai:di-graph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 259 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "message types angular-ai:error-capture / angular-ai:error-explain" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 260 | .commandcode/skills/control-ai-browsers/features/extension-panel.md | "background.js or manifest.json change needs down and up" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 261 | .commandcode/skills/control-ai-browsers/features/health-check.md | "navigator.modelContext is undefined; WebMCP lives on document.modelContext" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 262 | .commandcode/skills/control-ai-browsers/features/interop.md | "message types angular-ai:interop" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 263 | .commandcode/skills/control-ai-browsers/features/interop.md | "spikes/ng222-app fixture routes /stale-view" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 264 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "message type angular-ai:record" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 265 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "message types angular-ai:stale-view" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 266 | .commandcode/skills/control-angular-dev-app/features/README.md | "PrimeNG dropdowns: click combobox then getByRole option" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 267 | .commandcode/skills/control-angular-dev-app/features/README.md | "Mocking only behind existing production boundary; fixtures have none" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 268 | .commandcode/skills/control-angular-dev-app/features/counter.md | "Clicks: 3 (double 6, cart 1) on load" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 269 | .commandcode/skills/control-angular-dev-app/features/counter.md | "Increment raises count by one; double follows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 270 | .commandcode/skills/control-angular-dev-app/features/counter.md | "counter-cd component is OnPush by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 271 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "claim-list table: Claim number, Damage Type, Date, Policynumber, Customer; 5 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 272 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "claim-create /claim/create with Claim Number, Date prefilled today, Select damage type, Select contract" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 273 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "/claim/create shows heading Complaint Create (app bug)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 274 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 275 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 276 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-create POST /api/complaints (201)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 277 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 278 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract-edit Save sends PUT /api/contracts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 279 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract-create Save sends POST /api/contracts (201)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 280 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "/ redirects to /home" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 281 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "home tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 282 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "unknown URLs show Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 283 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "sidebar group headings upper-case via capitalize pipe" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 284 | .commandcode/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 285 | .commandcode/skills/control-angular-devtools/SKILL.md | "Angular DevTools 1.22.1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 286 | .commandcode/skills/control-angular-devtools/features/attach.md | "window.__NG_DEVTOOLS_CONNECTED__ === true" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 287 | .commandcode/skills/control-angular-devtools/features/attach.md | "detection isAngular, isDebugMode, isIvy, isSupportedAngularVersion, isAngularDevTools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 288 | .commandcode/skills/control-angular-devtools/features/attach.md | "production build gives isDebugMode false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 289 | .commandcode/skills/control-angular-devtools/features/install.md | "branded install/uninstall proven in Chrome Beta 2026-10-11" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 290 | .commandcode/skills/control-angular-devtools/features/install.md | "chrome:// and edge:// URLs open empty window from command line" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 291 | .commandcode/skills/control-angular-devtools/features/profiler.md | "profiler subscribes through ng.ɵsetProfiler" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 292 | .commandcode/skills/control-angular-devtools/features/profiler.md | "coexist: own subscribers bothOn a:16 b:16; afterRemoveA a:16 b:32" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 293 | .commandcode/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 294 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "pane node kinds template, signal, computed, effect, linked-signal, child-signal-prop, resource, unknown" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 295 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "counter shows template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 296 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "after angular:di_graph template node disappears" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 297 | .commandcode/skills/nx-import/references/GRADLE.md | "This reference exists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 298 | .commandcode/skills/nx-import/references/NEXT.md | "This reference exists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 299 | .commandcode/skills/nx-import/references/TURBOREPO.md | "This reference exists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 300 | .commandcode/skills/nx-import/references/VITE.md | "This reference exists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 301 | .commandcode/skills/nx-plugins/SKILL.md | "This reference exists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 302 | .commandcode/skills/nx-run-tasks/SKILL.md | "This reference exists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 303 | .commandcode/taste/taste.md | "File is effectively empty with no testable taste claims" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 304 | research/03-prior-art.md | "Existing AI-assisted DevTools lack on-device Angular-aware tooling" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 305 | research/10-model-capabilities.md | "AIPromptAPIToolUse is experimental on Win/Mac/Linux/ChromeOS at the 156 tag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 306 | research/11-spike-s1-extension-contexts.md | "Extension id is adkapcgoeebpdmbepbdjmbhfknkcllcc for this checkout" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 307 | research/12-legacy-vs-modern-angular.md | "spikes/ng222-app/dist/.../main.js contains setClassMetadata calls" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 308 | research/13-portal-legacy-audit.md | "portal forms migrated to Signal Forms in commits 754aa1e, 66e8ad6, 92053b9" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 309 | research/13-portal-legacy-audit.md | "zone.js polyfill present in apps/insurance-portal/project.json:18" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 310 | research/15-deterministic-and-ai.md | "research/raw/tosignal-node-portal.json holds signal graph measurements" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 311 | research/17-vitest-browser-runtime.md | "Vitest Browser Mode attaches to real Chrome/Edge via a custom provider" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 312 | research/18-edge-prevent-auto-signin.md | "msBrowserSignin is not a real Chromium/Edge feature flag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 313 | research/19-languagemodel-in-extension-contexts.md | "LanguageModel works in the DevTools panel, dedicated worker, and service worker; refused in devtools.html" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 314 | research/20-built-in-ai-without-flags.md | "Without flags, LanguageModel is undefined on Edge pages and service workers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
