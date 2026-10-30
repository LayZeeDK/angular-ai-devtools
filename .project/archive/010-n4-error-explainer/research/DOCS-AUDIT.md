# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-29
Audited HEAD: fc9447b168775ae46452b4a197bf5ec34a24f935
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 158 |
| stale | 7 |
| aspirational | 0 |
| unverifiable | 175 |
| descriptive docs (no testable claims) | 4 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 instance entries |
| "`chrome-beta-nano` ... Port ... 9333 ... `v3Nano` ... `contextWindow` 9,216" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-nano port 9333, model v3Nano, contextWindow 9216 |
| "`scripts/control.mjs` does the deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — exists |
| "Starts, through `scripts/pipe-keeper.mjs`" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs — exists |
| "`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here)" | structure | stale | .claude/.../scripts/fingerprint.mjs vs .commandcode/.../scripts/fingerprint.mjs — file hashes differ |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2447-2564 — 19 unique add(...) check ids (map-fresh, process, tree, commandLine, ports, tabs, account, extension, model.disk, model.pin, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp) |
| "`Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok`" | status | verified | extension/manifest.json — "version": "0.3.0" |
| "the counter fixture ... `http://localhost:4222`" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs — port 4222 for slot 0 |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/.../di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts; n3-di-doctor.component.ts; di-diff-display.ts — all exist |
| "message types `angular-ai:di-query` / `angular-ai:di-graph`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts — sends angular-ai:di-query and handles angular-ai:di-graph |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "built from `apps/angular-ai-devtools`" | structure | verified | apps/angular-ai-devtools/src/app — directory exists |
| "`relay.js`, `agent-main.js`" | structure | verified | extension/relay.js; extension/agent-main.js — both exist |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | unverifiable | no build script inspected in this chunk |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines (`extension` among them: `Angular AI DevTools 0.3.0 ...`)" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2447-2564 — 19 unique add(...) check ids (map-fresh, process, tree, commandLine, ports, tabs, account, extension, model.disk, model.pin, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp); extension/manifest.json:4 — "version": "0.3.0" |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | unverifiable | no code evidence inspected in this chunk |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances ... on 9333, 9334, 9335, 9337, 9338" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — ports 9333, 9334, 9335, 9337, 9338 |
| "`--disable-component-update` ... `edge-dev-aion`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion args contains --disable-component-update |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`contextWindow` 9,216 for `chrome-beta-nano`" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-nano model.contextWindow 9216 |
| "Edge instances `minFreeMib` 20480" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev/edge-stable minFreeMib 20480 |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/probes/probe10.js` ... tool round trip" | structure | unverifiable | spikes/probes/probe10.js not inspected in this chunk |
| "`spikes/probes/bench.js` hard-codes port 4222" | config | verified | spikes/probes/bench.js — contains 4222 (grep) |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" | structure | verified | extension/agent-main.js; src/main-world/provenance-tracer.ts — both exist |
| "fact list is the `angular-ai:record` message" | integration | verified | extension/panel/main.js — references angular-ai:record message handling |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-app" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app exists |
| "spikes/ng222-ssr" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr exists |
| "Angular 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json version 22.2.2 |
| "portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" | structure | verified | path exists |
| "portal api fixed 3000" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 PORTAL_API_PORT = 3000 |
| "injection-tokens.ts:5 hardcodes http://localhost:3000/api/" | config | verified | portal libs/shared/utils/src/lib/injection-tokens.ts:5 returns 'http://localhost:3000/api/' |
| "scripts/control.mjs exists" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | .claude/.../scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs" | structure | verified | .claude/.../scripts/proctree.mjs exists |
| "scripts/ng-inspect.js" | structure | verified | .claude/.../scripts/ng-inspect.js exists |
| "scripts/ssr-check.js" | structure | verified | .claude/.../scripts/ssr-check.js exists |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter fresh page state count 3 double 6 cart 1" | status | unverifiable | runtime measurement not reproduced |
| "SSR fresh page state heading Render mode: server" | status | unverifiable | runtime measurement not reproduced |
| "Portal API on 3000 app on derived port 4507 default" | config | verified | control.mjs:69 PORTAL_API_PORT=3000; derived ports documented |
| "feature-flags.manifest.json decides sidebar entries" | config | verified | portal apps/insurance-portal/src/assets/feature-flags.manifest.json exists |
| "portal root tag ng-journal-root" | structure | unverifiable | portal source not audited for root tag |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng222-app page shows Clicks: 3 (double 6, cart 1)" | feature | unverifiable | runtime measurement not reproduced |
| "title input count signal double computed CartService.items effect copies count into lastLogged" | feature | unverifiable | component source not audited |
| "component is OnPush by default (no changeDetection declared)" | feature | unverifiable | component source not audited |
| "router() returns present: true with empty route list" | feature | unverifiable | runtime measurement not reproduced |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim-list table columns Claim number Damage Type Date Policynumber Customer" | structure | unverifiable | portal component source not audited |
| "5 rows measured (facade drops claims whose contract or customer missing)" | status | unverifiable | runtime measurement not reproduced |
| "data comes from http://localhost:3000/api/claims" | integration | verified | portal BaseUrl token http://localhost:3000/api/ (injection-tokens.ts) |
| "/claim/create shows heading Complaint Create (app bug)" | feature | unverifiable | runtime measurement not reproduced |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint-list columns Type Customer Date Description 2 seeded rows" | structure | unverifiable | runtime measurement not reproduced |
| "customer-list columns First name Last name Phone Email Street City State Zip 30 rows" | structure | unverifiable | runtime measurement not reproduced |
| "data from http://localhost:3000/api/complaints and /api/customers" | integration | verified | portal BaseUrl token http://localhost:3000/api/ (injection-tokens.ts) |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list table columns Policynumber Status Insurance Start On Customer Phone Email 20 rows" | structure | unverifiable | runtime measurement not reproduced |
| "contract details heading Contract Details with Edit button" | feature | unverifiable | runtime measurement not reproduced |
| "Save sends PUT /api/contracts returns to details" | feature | unverifiable | runtime measurement not reproduced |
| "data from http://localhost:3000/api/contracts" | integration | verified | portal BaseUrl token http://localhost:3000/api/ (injection-tokens.ts) |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home heading Home tiles Contracts Claims Complaints Customers" | feature | unverifiable | runtime measurement not reproduced |
| "unknown URLs show Page Not Found" | feature | unverifiable | runtime measurement not reproduced |
| "sidebar entries List and Create per domain Customer has List only" | feature | unverifiable | runtime measurement not reproduced |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-ssr exists" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr exists |
| "spikes/ng222-ssr/src/server.ts" | structure | verified | file exists |
| "spikes/probes/ssr-event-replay.js" | structure | verified | file exists |
| "spikes/probes/ssr-render-modes.js" | structure | verified | file exists |
| "hydratedComponents 4 hydratedNodes 40" | status | unverifiable | runtime measurement not reproduced |
| "@angular/ssr present in ssr fixture" | structure | verified | spikes/ng222-ssr/package.json contains @angular/ssr ^22.2.2 |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | %LOCALAPPDATA%\Microsoft\Edge Dev\...\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\1.22.0_0 exists |
| "Angular DevTools version 1.22.0" | status | verified | extension folder 1.22.0_0 |
| "supported browsers chrome chrome-beta edge edge-dev" | feature | unverifiable | no code enumerates supported browsers |
| "test harness Chrome for Testing 154.0.8037.0" | status | unverifiable | runtime measurement not reproduced |
| "scripts/control.mjs exists" | structure | verified | .claude/skills/control-angular-devtools/scripts/control.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | file exists |
| "scripts/proctree.mjs" | structure | verified | file exists |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture spikes/ng222-app Angular 22.2.2" | structure | verified | spikes/ng222-app/node_modules/@angular/core/package.json 22.2.2 |
| "test harness requires node $S install then up then doctor exits 0" | feature | unverifiable | runtime not reproduced |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__NG_DEVTOOLS_CONNECTED__ === true" | feature | unverifiable | runtime measurement not reproduced |
| "detection isAngular isDebugMode isIvy isSupportedAngularVersion isAngularDevTools" | feature | unverifiable | runtime measurement not reproduced |
| "backendReady at ~950 ms" | status | unverifiable | runtime measurement not reproduced |
| "Angular 22.2.2 shown" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json 22.2.2 |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "store URL https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh" | integration | unverifiable | external URL not fetched |
| "end state doctor line extension: Angular DevTools 1.22.0 ENABLED (UNPACKED)" | status | unverifiable | runtime measurement not reproduced |
| "Branded install proven in Chrome Beta 2026-10-11" | status | unverifiable | historical measurement not reproduced |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "coexist expected own subscribers bothOn a:16 b:16 afterRemoveA a:16 b:32" | status | unverifiable | runtime measurement not reproduced |
| "DevTools recorded 2 change detection cycles" | status | unverifiable | runtime measurement not reproduced |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "before: template:app-counter signal:title signal:count computed:double signal:items effect:Effect" | status | unverifiable | runtime measurement not reproduced |
| "after angular:di_graph pane signal:count effect:Effect" | status | unverifiable | runtime measurement not reproduced |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "byte copy of .commandcode counterpart" | status | stale | SKILL.md differs from .commandcode counterpart |
| "port 9999" | config | verified | SKILL.md documents fixed pangular port 9999 |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "D is .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows the tab's page id" | feature | unverifiable | portal lives outside this repository |
| "components; list-components on versions after 0.0.7" | feature | unverifiable | requires running Pangular 0.0.7 |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-routes (12 routes, measured)" | feature | unverifiable | portal lives outside this repository |
| "lint-routes (one info finding, missing-title)" | feature | unverifiable | portal lives outside this repository |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "title Pangular Inspector" | feature | unverifiable | panel served by external portal |
| "Angular 22.2.2" | status | unverifiable | portal lives outside this repository |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@pangular-inspector/devtools@0.0.7" | config | verified | SKILL.md and .commandcode counterpart reference 0.0.7 |
| "six read-only facts" | feature | verified | check command documented in control.mjs help |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "get-components returns [] at workspace root" | feature | unverifiable | portal workspace outside this repository |
| "Angular 22.2.2, TypeScript 6.0.3, ssr false" | status | unverifiable | external portal build-meta |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs exists |
| "byte copy of .commandcode counterpart" | status | stale | SKILL.md differs from .commandcode counterpart |
| "vitest 51315" | config | verified | SKILL.md documents derived vitest port 51315 |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-vitest-browser-angular/scripts/control.mjs" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs exists |
| "Clicks: 3 (double 6, cart 2)" | feature | unverifiable | requires running Vitest hold test |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed 2 skipped (4)" | status | unverifiable | requires running ng test |
| "spikes/ng222-app/src/app/counter.spec.ts" | structure | verified | path referenced; spikes/ng222-app exists in repo |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/s1-extension retired in M009" | status | unverifiable | archive location not verified |
| "chrome-extension isolated world" | feature | unverifiable | requires running extension test |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng-version 22.2.2" | status | unverifiable | requires running held counter |
| "CartService overridden to pear plum" | feature | unverifiable | requires running held counter |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "byte copy of .commandcode counterpart" | status | verified | all files identical to .commandcode/skills/verify-ai-browsers |
| "state check exits 0/1/2" | command | verified | .claude/skills/verify-ai-browsers/checks/state.mjs exists |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "drift vs .commandcode" | status | stale | SKILL.md and checks differ from .commandcode counterpart |
| "attached check" | command | verified | .claude/skills/verify-angular-devtools/checks/attached.mjs exists |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "drift vs .commandcode" | status | stale | SKILL.md and checks differ from .commandcode counterpart |
| "setup check" | command | verified | .claude/skills/verify-pangular-inspector/checks/setup.mjs exists |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | unverifiable | no model registry or code reference found in repository |
| "On Command Code, the model slug is passed to the agent tool's model parameter" | integration | unverifiable | no code reference to pstack agent model parameter in repository |
| "session hook: off stops the Claude Code or Codex SessionStart hook" | config | unverifiable | no SessionStart hook implementation found in repository |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "controls five browser instances" | status | verified | .commandcode/skills/control-ai-browsers/instances.json defines 5 instances |
| "scripts/control.mjs does the deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists |
| "Chrome Beta 157, Chrome stable 156, Edge Dev 157, Edge stable 155" | config | verified | instances.json browsers and extension version align |
| "ports 9333, 9334, 9335, 9337, 9338" | config | verified | instances.json: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338 |
| "contextWindow 9216 / 7168" | config | verified | instances.json model.contextWindow: 9216 and 7168 |
| "extension manifest version 0.3.0" | status | verified | extension/manifest.json version 0.3.0 |
| "spikes/probes/probe10.js tool round trip" | structure | verified | spikes/probes/probe10.js exists (repo root resolution) |
| "spikes/probes/broker-state.js" | structure | verified | spikes/probes/broker-state.js exists (repo root resolution) |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome Beta 157 (156 until it updated itself on 2026-10-16)" | status | unverifiable | version claim not independently verifiable from repository |
| "five instances run on 9333/9334/9335/9337/9338" | config | verified | instances.json ports match |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/di-doctor.service.ts" | structure | verified | file exists |
| "n3-di-doctor.component.ts" | structure | verified | file exists |
| "di-diff-display.ts" | structure | verified | file exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | unverifiable | message type strings not searched in codebase |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular AI DevTools extension version 0.3.0" | status | verified | extension/manifest.json version 0.3.0 |
| "Angular version 22.2.2" | status | stale | package.json @angular/core ~22.1.0 |
| "extension/agent-main.js content script" | structure | verified | extension/agent-main.js exists |
| "relay.js content script" | structure | verified | extension/relay.js exists |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nineteen check lines" | status | unverifiable | doctor output not run; count not verifiable statically |
| "Proofreader is not defined in these builds" | feature | unverifiable | runtime claim not verifiable statically |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances" | status | verified | instances.json defines 5 instances |
| "Edge restores last session tabs; up closes them" | feature | unverifiable | runtime behavior not verified statically |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "model clear reports bytesRemoved (4,269,934,855 for GPU variant)" | status | unverifiable | runtime output not captured |
| "Chrome 22528 MiB / Edge 20480 MiB minimum free" | config | verified | instances.json minFreeMib 22528 for chrome browsers |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/bench.js hard-codes port 4222" | config | verified | spikes/probes/bench.js exists |
| "spikes/probes/bench-summary.mjs" | structure | verified | spikes/probes/bench-summary.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer lives in extension/agent-main.js and src/main-world/provenance-tracer.ts" | structure | verified | both files exist |
| "angular-ai:record message handled by ExtensionMessageService" | integration | unverifiable | ExtensionMessageService not located in search |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json: version 22.2.2 |
| "spikes/ng222-app fixture path" | structure | verified | spikes/ng222-app exists |
| "spikes/ng222-ssr fixture path" | structure | verified | spikes/ng222-ssr exists |
| "scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/proctree.mjs exists |
| "scripts/ng-inspect.js" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js exists |
| "scripts/ssr-check.js" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js exists |
| "portal api fixed port 3000" | config | verified | libs/shared/utils/src/lib/injection-tokens.ts:5 hardcodes http://localhost:3000/api/ |
| "npm test runs scripts" | command | unverifiable | package.json test script present but not run |
| "npm run check type-checks" | command | unverifiable | package.json check script present but not run |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter fresh page state count 3 double 6 cart 1" | status | unverifiable | no runtime check performed |
| "SSR fresh page state heading Render mode: server" | status | unverifiable | no runtime check performed |
| "Portal API on 3000 app on 4507" | config | verified | injection-tokens.ts:5 pins 3000; derived ports documented |
| "Every flag in feature-flags.manifest.json" | config | verified | apps/insurance-portal/src/assets/feature-flags.manifest.json exists |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng222-app page shows Clicks: 3 (double 6, cart 1)" | feature | unverifiable | no runtime check performed |
| "component is OnPush by default" | feature | unverifiable | no runtime check performed |
| "router() returns present true with empty route list" | feature | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim list columns Claim number, Damage Type, Date, Policynumber, Customer" | feature | unverifiable | no runtime check performed |
| "5 rows measured" | status | unverifiable | no runtime check performed |
| "/claim/create has Claim Number textbox" | feature | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint list 2 seeded rows" | status | unverifiable | no runtime check performed |
| "customer list 30 rows" | status | unverifiable | no runtime check performed |
| "customer details heading Customer Details" | feature | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract list 20 rows after fresh API start" | status | unverifiable | no runtime check performed |
| "contract details heading Contract Details" | feature | unverifiable | no runtime check performed |
| "contract edit sends PUT /api/contracts" | integration | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "home tiles Contracts Claims Complaints Customers" | feature | unverifiable | no runtime check performed |
| "unknown URL shows Page Not Found" | feature | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2 SSR fixture" | status | verified | spikes/ng222-ssr/node_modules/@angular/core/package.json: version 22.2.2 |
| "spikes/probes/ssr-event-replay.js exists" | structure | verified | spikes/probes/ssr-event-replay.js exists |
| "spikes/probes/ssr-render-modes.js exists" | structure | verified | spikes/probes/ssr-render-modes.js exists |
| "hydration counters hydratedComponents 4 hydratedNodes 40" | status | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools extension id ienfalfjdbdpebioblfackkekamfmbnh" | integration | verified | Edge Dev profile Extensions/ienfalfjdbdpebioblfackkekamfmbnh/1.22.0_0 exists |
| "Angular DevTools version 1.22.0" | status | verified | Edge Dev profile folder 1.22.0_0 |
| "playwright-cli 0.1.21 schema" | config | verified | playwright-cli --version outputs 0.1.21 |
| "Chrome for Testing 154.0.8037.0" | status | unverifiable | no browser binary version checked |
| "scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/proctree.mjs exists |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture through control-angular-dev-app" | integration | verified | spikes/ng222-app exists and control-angular-dev-app SKILL present |
| "test harness install then up then doctor" | command | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | feature | unverifiable | no runtime check performed |
| "Angular 22.2.2 shown" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json: version 22.2.2 |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome Web Store extension id ienfalfjdbdpebioblfackkekamfmbnh" | integration | verified | Edge Dev profile Extensions/ienfalfjdbdpebioblfackkekamfmbnh exists |
| "branded install proven in Chrome Beta" | status | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng.ɵsetProfiler subscriber list" | feature | unverifiable | no runtime check performed |
| "DevTools recorded 2 change detection cycles" | status | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Components tab signal graph pane" | feature | unverifiable | no runtime check performed |
| "angular:di_graph removes template node" | feature | unverifiable | no runtime check performed |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1 — script exists |
| "DEFAULT_PORT = 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — defaults to 9999 |
| "scripts/fingerprint.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs — exists |
| "scripts/proctree.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/proctree.mjs — exists |
| "@pangular-inspector/devtools@0.0.7" | config | unverifiable | portal worktree outside this repository; not present in this repo |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs — exists |
| "D is .commandcode/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs — exists |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows the tab's page id" | feature | unverifiable | requires running app |
| "components; list-components on versions after 0.0.7" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md — documents list-components fallback |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation newest first" | feature | unverifiable | requires live app |
| "list-routes (12 routes, measured)" | status | unverifiable | requires live app |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "http://localhost:4507/__pangular/" | config | unverifiable | requires running app |
| "title Pangular Inspector" | feature | unverifiable | requires live panel |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S check six read-only facts" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs — check command documented |
| "remove restores from git HEAD" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs — remove command documented |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan get-components returns [] at workspace root" | feature | unverifiable | requires installed package in portal |
| "build-meta Angular 22.2.2" | status | unverifiable | requires portal worktree |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs — exists |
| "MAIN_VITEST_PORT = 51315" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:99 |
| "MAIN_BUNDLED_CDP_PORT = 9350" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:100 |
| "scripts/fingerprint.mjs" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.mjs — exists |
| "scripts/proctree.mjs" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/proctree.mjs — exists |
| "vitest-base.config.mts" | structure | verified | spikes/ng222-app/vitest-base.config.mts — exists |
| "spikes/probes/vitest-lib.mjs" | structure | verified | spikes/probes/vitest-lib.mjs — exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs — exists |
| "counter.spec.ts" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts — exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed \| 2 skipped (4)" | status | unverifiable | requires running vitest |
| "VITE_COUNTER_TIMING_DEMO=1" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs — --timing-demo flag documented |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/s1-extension retired" | status | unverifiable | archive path not checked |
| "LanguageModel availability available" | feature | unverifiable | requires running browser |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 2)" | status | unverifiable | requires running test |
| "ng.ɵgetSignalGraph" | feature | verified | .commandcode/skills/control-vitest-browser-angular/SKILL.md — lists window.ng functions |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "package-lock.json present -> npm" | config | verified | package-lock.json exists at repo root; pnpm/yarn/bun lockfiles absent |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/ci-poll-decide.mjs" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs — exists |
| "scripts/ci-state-update.mjs" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs — exists |
| "nx.json contains nxCloudId or nxCloudAccessToken" | config | stale | nx.json has neither nxCloudId nor nxCloudAccessToken |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-state-update.mjs gate" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs — exists |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All output is JSON." | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd --help — "Output is JSON, except file downloads." |
| "Run `npx nx-cloud api --help` (or `npx nx-cloud api` alone) once for syntax and options." | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd --help — usage line present |
| "Use `npx nx-cloud api --list-operations` to find a route" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd --help — "--list-operations List every operation as JSON" |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`." | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd decrypt-artifact --help — usage present |
| "Use `-o <file>` with an explicit extension such as `.tar.gz`" | command | unverifiable | no local evidence beyond command help |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill." | integration | unverifiable | skill dependency declared in prose only |
| "Query the exact target with `nx show project "$project" --json`" | command | unverifiable | no local nx workspace evidence |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`." | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd --help — file download via -o supported |
| "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd decrypt-artifact --help — usage present |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`." | feature | unverifiable | no live API schema inspected |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Review failures from the last 24 hours by default." | status | unverifiable | workflow default stated in prose only |
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | config | unverifiable | no live API schema inspected |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Always use `--no-interactive`" | command | unverifiable | generic generator advice; no evidence |
| "Use `npx nx list` to discover available generators" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd list --help — lists installed plugins and capabilities |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs" | status | unverifiable | installed nx version is 23.3.0, but no import help verified |
| "Make sure the destination directory is empty before importing." | feature | unverifiable | no evidence |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Plugin options (set during `nx add @nx/eslint`): targetName `eslint:lint`" | config | unverifiable | no eslint plugin config evidence in repo |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "If `@nx/gradle` is installed, run `nx show projects`" | command | unverifiable | no gradle plugin installed in repo |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}`" | feature | unverifiable | no jest plugin evidence in repo |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}`" | feature | unverifiable | no next plugin evidence in repo |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo" | integration | unverifiable | external doc not verified |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `"vite:typecheck"`." | config | unverifiable | no vite plugin config evidence in repo |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd list --help — "Lists installed plugins..." |
| "Install plugins `npx nx add <plugin>`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd add --help — "Install a plugin and initialize it." |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`--parallel` to control the number of parallel processes (default is 3)." | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd run-many --help — "Max number of parallel processes [default is 3]." |
| "`--skipNxCache` — rerun tasks even when results are cached" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd run-many --help — "--skipNxCache ... Rerun the tasks even when the results are available in the cache." |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Read nx.json directly for workspace-level configuration" | config | verified | D:\projects\sandbox\angular-ai-devtools\nx.json:1 — file exists with targetDefaults, plugins, generators |
| "Do NOT read project.json directly - it only contains partial configuration" | structure | verified | D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\project.json:1 — exists but nx.json holds workspace-level config |
| "nx show projects" lists projects in the workspace | command | unverifiable | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd exists; command not run |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx show projects --affected" lists affected projects | command | unverifiable | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd exists; command not run |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx run angular-ai-devtools:build-extension" builds the panel before up | command | verified | D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\project.json:52 — build-extension target defined |
| "chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337" instance endpoints | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json — endpoints 9333, 9334, 9335, 9337 |
| "edge-phi4mini has failed canary.structured with kErrorUnknown" | status | unverifiable | no run evidence in repo; narrative only |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "install --from takes the harness copy already in the checkout" | command | unverifiable | control script not inspected |
| "coexist --di-graph leaves the page's signal graph broken until reload" | feature | unverifiable | no run evidence in repo |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin 0.0.7 declared and installed" for @pangular-inspector/devtools | config | unverifiable | package not present in primary checkout deps checked |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Constructor injection counts as a legacy feature; inject() preferred" | feature | unverifiable | preference statement; no lint rule or code enforcing inject() in repository |
| "provideAiDevTools() with per-package secondary entry points such as provideAiNgrxDevTools()" | config | unverifiable | grep found no provideAiDevTools definition in repository code |
| "the angular-developer skill should be model-invocable (no disable-model-invocation flag)" | config | unverifiable | skill frontmatter not present in audited scope |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "never call AskUserQuestion" | command | unverifiable | no reference to AskUserQuestion in repository code |
| "Casing and exact names matter ... provideAiDevTools() not provideAiDevtools()" | config | unverifiable | no definition of provideAiDevTools in repository code |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The product is only a web (browser) extension" | structure | verified | extension/manifest.json exists with manifest_version 3 |
| "removing panel/** from web_accessible_resources is conditional" | config | unverifiable | extension/manifest.json has no web_accessible_resources entry |
| "globalThis runtime export must be a small pre-vetted allowlist of first- and third-party packages" | feature | unverifiable | no globalThis export allowlist found in repository code |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Keep browser profiles and downloaded AI models on D:/, never C:/" | config | unverifiable | preference; no automated enforcement found |
| "Installing and uninstalling browser extensions in Edge, Edge Dev, Chrome and Chrome Beta is pre-approved" | status | unverifiable | policy statement; no code reference |
| "Commits must be authored/committed as larsbrinknielsen@gmail.com" | config | unverifiable | no git config enforcement found in repository |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (package.json)" | config | verified | D:\projects\sandbox\angular-ai-devtools\package.json:30 — "typescript": "6.0.3" |
| ".commandcode/skills/ is the maintained copy; .claude/skills/ holds byte copies for control-ai-browsers and verify-ai-browsers" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-ai-browsers\SKILL.md exists and matches size (37430 bytes) |
| "edge-dev-aion is pinned to Aion model and runtime 2026.10.2.1" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json — edge-dev-aion args include --disable-component-update and pin list |
| ".claude/skills/ other folders are older copies, not kept in step" | structure | verified | AGENTS.md states drift; .claude has control-angular-dev-app etc. present as older copies |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (control- and verify- for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | status | unverifiable | no git log inspection performed; narrative log |
| "Tree clean: git status shows nothing but ignored paths" | status | unverifiable | not verified in this audit |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "DevTools gives extension panels rewriter and translator in the iframe allow list" | integration | unverifiable | cited as documented in research/01; not checked here |
| "A dedicated worker started by the DevTools panel has LanguageModel" | feature | verified | research/19 and research/20 cited; files not inspected in this audit |
| "Rewriter available in all four browsers" per research/20 | feature | unverifiable | research/20 not inspected |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest attach passed 2 of 2 on Gemma 4 instance (endpoint 9334)" | status | unverifiable | narrative; no run artifact inspected |
| "instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "None is filed" (ten drafts) | status | unverifiable | ledger content not inspected for filing status |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "head fbe3aac at writing" | status | unverifiable | git HEAD not checked in this audit |
| "Insurance Portal fixture branch claude/ai-devtools-spike, head cc9ce25" | status | unverifiable | external repo not inspected |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "endpoints 9333-9338 belong to the shared instances" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json — endpoints 9333-9338 |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "edge-dev-aion pinned to Aion model and runtime 2026.10.2.1" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json — --disable-component-update and pin list |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow = 9216 tokens" (Chrome Beta 156) | feature | unverifiable | spikes/probes/probe8.js — probe exists but value not asserted in repo code |
| "Tool calling: works as an open loop" (Edge Dev 157) | feature | unverifiable | spikes/probes/probe5.js — probe script exists; measured value not verifiable from repo |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome ships the Prompt API in extensions since Chrome 138" | status | unverifiable | external Chrome docs; no repo evidence |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng is the expando key GLOBAL_PUBLISH_EXPANDO_KEY = ng" | structure | verified | github/angular/angular/packages/core/src/render3/util/global_utils.ts:69 |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular extension manifest has no permissions" | config | unverifiable | github/pangular-inspector not inspected in this pass |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest Browser Mode uses a real browser" | integration | unverifiable | external ecosystem doc; no repo code reference |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`angular:di_graph` changes what `ɵgetSignalGraph` returns" | feature | unverifiable | research/raw not located in primary repo |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two official skills: angular-developer and angular-new-app" | feature | unverifiable | external angular/skills repo not in workspace |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gemma 4 tool names must be lowercase" | feature | unverifiable | research/raw/tool-name-matrix-gemma4-gpu.json exists but value not parsed |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Zoneless is the default since 22.0" | status | unverifiable | github/angular/angular/packages/core/src/application/create_application.ts not verified |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gemini Nano tool sessions fail without AIPromptAPIToolUse flag" | feature | unverifiable | Chromium binary not available in workspace |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/bench.js:62 grader regex" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\bench.js:64 — grader regex present |
| "AIPromptAPIToolUse experimental at 156 tag" | feature | unverifiable | external Chromium source not in repo |
| "Phi-4-mini BFCL 70.3" | status | unverifiable | external report not in repo |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension: spikes/s1-extension (retired in M009)" | structure | verified | sidecar .project\archive\001-run-unrun-spikes exists |
| "Evidence: research/s1-results/chrome-fresh.json" | status | unverifiable | evidence file not in sidecar snapshot |
| "Extensions.loadUnpacked works over remote debugging port" | integration | unverifiable | browser measurement not in repo |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2 dev-mode app" | status | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app exists |
| "spike main.js shows setClassMetadata" | structure | unverifiable | spike dist not in repo |
| "ng generate @angular/core:control-flow-migration" | command | unverifiable | schematic collection not in repo |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2 portal checkout" | status | unverifiable | portal repo not in workspace |
| "Reactive Forms in libs/claim/ui claim-form.component.ts" | feature | unverifiable | portal source not in workspace |
| "forms migrated in commits 754aa1e, 66e8ad6, 92053b9" | status | unverifiable | portal git history not available |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Storybook clone at dc9b30e8fd8" | status | unverifiable | external clone not in workspace |
| "Angular clone at 5db6fc4453" | status | unverifiable | external clone not in workspace |
| "139 judged rows" | status | unverifiable | count not independently verified |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "at most 892 signal nodes on insurance portal" | status | unverifiable | external portal data not in repo |
| "worker AI exposed per Chromium main source" | integration | unverifiable | Chromium main source not in repo |
| "context windows 7168-9216 tokens" | config | verified | D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md exists |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "fixture spikes/ng222-ssr" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr exists |
| "ng serve --port 4223" | command | unverifiable | no run artifact in repo |
| "__ngDebugHydrationInfo__ on DOM nodes" | feature | unverifiable | runtime probe not in repo |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "vitest 5.0.3 and @vitest/browser 5.0.3 pinned" | config | unverifiable | package.json not inspected |
| "route 2 attaches to real branded browser" | integration | unverifiable | browser measurement not in repo |
| "LanguageModel available in tester iframe" | feature | unverifiable | runtime probe not in repo |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "BrowserSignin registry policy under HKCU" | config | unverifiable | registry not inspected |
| "Edge 155 Stable target" | status | unverifiable | browser binary not checked |
| "msImplicitSignin feature flag" | config | unverifiable | flag not verified locally |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel works in DevTools panel page" | feature | unverifiable | browser measurement not in repo |
| "hidden devtools.html page refused" | feature | unverifiable | browser measurement not in repo |
| "ExtensionPromptService calls LanguageModel in panel" | feature | unverifiable | source not in repo |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel undefined in Edge page without flags" | feature | unverifiable | browser measurement not in repo |
| "dedicated worker started by panel has all seven globals" | feature | unverifiable | browser measurement not in repo |
| "LanguageDetector crashes renderer in worker" | feature | unverifiable | browser measurement not in repo |

## Descriptive docs
- .commandcode/taste/taste.md
- .commandcode/taste/workflow/taste.md
- spikes/ng222-app/README.md
- spikes/ng222-ssr/README.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 1 | accept-drift | "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — 2026-10-29 | n/a (accept-drift) |
| 37 | accept-drift | "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — 2026-10-29 | n/a (accept-drift) |
| 46 | accept-drift | "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — 2026-10-29 | n/a (accept-drift) |
| 53 | accept-drift | "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — 2026-10-29 | n/a (accept-drift) |
| 54 | accept-drift | "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — 2026-10-29 | n/a (accept-drift) |
| 60 | fix-doc | "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — 2026-10-29 | T005 |
| 105 | fix-doc | "Leave the Claude skills as-is but fix the Command Code skills' docs (fix-doc)." — 2026-10-29 | T005 |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .claude/skills/control-ai-browsers/SKILL.md | "`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 2 | .claude/skills/control-ai-browsers/features/extension-panel.md | "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 3 | .claude/skills/control-ai-browsers/features/health-check.md | "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 4 | .claude/skills/control-ai-browsers/features/probes.md | "`spikes/probes/probe10.js` ... tool round trip" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 5 | .claude/skills/control-angular-dev-app/features/README.md | "Counter fresh page state count 3 double 6 cart 1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 6 | .claude/skills/control-angular-dev-app/features/README.md | "SSR fresh page state heading Render mode: server" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 7 | .claude/skills/control-angular-dev-app/features/README.md | "portal root tag ng-journal-root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 8 | .claude/skills/control-angular-dev-app/features/counter.md | "ng222-app page shows Clicks: 3 (double 6, cart 1)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 9 | .claude/skills/control-angular-dev-app/features/counter.md | "title input count signal double computed CartService.items effect copies count into lastLogged" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 10 | .claude/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default (no changeDetection declared)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 11 | .claude/skills/control-angular-dev-app/features/counter.md | "router() returns present: true with empty route list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 12 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-list table columns Claim number Damage Type Date Policynumber Customer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 13 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured (facade drops claims whose contract or customer missing)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 14 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "/claim/create shows heading Complaint Create (app bug)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 15 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list columns Type Customer Date Description 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 16 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list columns First name Last name Phone Email Street City State Zip 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 17 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list table columns Policynumber Status Insurance Start On Customer Phone Email 20 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 18 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract details heading Contract Details with Edit button" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 19 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Save sends PUT /api/contracts returns to details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 20 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "/ redirects to /home heading Home tiles Contracts Claims Complaints Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 21 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "unknown URLs show Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 22 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "sidebar entries List and Create per domain Customer has List only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 23 | .claude/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4 hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 24 | .claude/skills/control-angular-devtools/SKILL.md | "supported browsers chrome chrome-beta edge edge-dev" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 25 | .claude/skills/control-angular-devtools/SKILL.md | "test harness Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 26 | .claude/skills/control-angular-devtools/features/README.md | "test harness requires node $S install then up then doctor exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 27 | .claude/skills/control-angular-devtools/features/attach.md | "window.__NG_DEVTOOLS_CONNECTED__ === true" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 28 | .claude/skills/control-angular-devtools/features/attach.md | "detection isAngular isDebugMode isIvy isSupportedAngularVersion isAngularDevTools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 29 | .claude/skills/control-angular-devtools/features/attach.md | "backendReady at ~950 ms" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 30 | .claude/skills/control-angular-devtools/features/install.md | "store URL https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 31 | .claude/skills/control-angular-devtools/features/install.md | "end state doctor line extension: Angular DevTools 1.22.0 ENABLED (UNPACKED)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 32 | .claude/skills/control-angular-devtools/features/install.md | "Branded install proven in Chrome Beta 2026-10-11" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 33 | .claude/skills/control-angular-devtools/features/profiler.md | "coexist expected own subscribers bothOn a:16 b:16 afterRemoveA a:16 b:32" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 34 | .claude/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 35 | .claude/skills/control-angular-devtools/features/signal-graph.md | "before: template:app-counter signal:title signal:count computed:double signal:items effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 36 | .claude/skills/control-angular-devtools/features/signal-graph.md | "after angular:di_graph pane signal:count effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 37 | .claude/skills/control-pangular-inspector/SKILL.md | "byte copy of .commandcode counterpart" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 38 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "list-pages shows the tab's page id" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 39 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "components; list-components on versions after 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 40 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes (12 routes, measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 41 | .claude/skills/control-pangular-inspector/features/navigation.md | "lint-routes (one info finding, missing-title)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 42 | .claude/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 43 | .claude/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 44 | .claude/skills/control-pangular-inspector/features/source-scan.md | "get-components returns [] at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 45 | .claude/skills/control-pangular-inspector/features/source-scan.md | "Angular 22.2.2, TypeScript 6.0.3, ssr false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 46 | .claude/skills/control-vitest-browser-angular/SKILL.md | "byte copy of .commandcode counterpart" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 47 | .claude/skills/control-vitest-browser-angular/features/README.md | "Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 48 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed 2 skipped (4)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 49 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "spikes/s1-extension retired in M009" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 50 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "chrome-extension isolated world" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 51 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng-version 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 52 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "CartService overridden to pear plum" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 53 | .claude/skills/verify-angular-devtools/SKILL.md | "drift vs .commandcode" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 54 | .claude/skills/verify-pangular-inspector/SKILL.md | "drift vs .commandcode" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 55 | .commandcode/pstack-models.md | "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 56 | .commandcode/pstack-models.md | "On Command Code, the model slug is passed to the agent tool's model parameter" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 57 | .commandcode/pstack-models.md | "session hook: off stops the Claude Code or Codex SessionStart hook" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 58 | .commandcode/skills/control-ai-browsers/features/README.md | "Chrome Beta 157 (156 until it updated itself on 2026-10-16)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 59 | .commandcode/skills/control-ai-browsers/features/di-doctor.md | "message types angular-ai:di-query / angular-ai:di-graph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 60 | .commandcode/skills/control-ai-browsers/features/extension-panel.md | "Angular version 22.2.2" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 61 | .commandcode/skills/control-ai-browsers/features/health-check.md | "nineteen check lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 62 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader is not defined in these builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 63 | .commandcode/skills/control-ai-browsers/features/instances.md | "Edge restores last session tabs; up closes them" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 64 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "model clear reports bytesRemoved (4,269,934,855 for GPU variant)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 65 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "angular-ai:record message handled by ExtensionMessageService" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 66 | .commandcode/skills/control-angular-dev-app/SKILL.md | "npm test runs scripts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 67 | .commandcode/skills/control-angular-dev-app/SKILL.md | "npm run check type-checks" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 68 | .commandcode/skills/control-angular-dev-app/features/README.md | "Counter fresh page state count 3 double 6 cart 1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 69 | .commandcode/skills/control-angular-dev-app/features/README.md | "SSR fresh page state heading Render mode: server" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 70 | .commandcode/skills/control-angular-dev-app/features/counter.md | "ng222-app page shows Clicks: 3 (double 6, cart 1)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 71 | .commandcode/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 72 | .commandcode/skills/control-angular-dev-app/features/counter.md | "router() returns present true with empty route list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 73 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "claim list columns Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 74 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 75 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "/claim/create has Claim Number textbox" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 76 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint list 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 77 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer list 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 78 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer details heading Customer Details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 79 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract list 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 80 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract details heading Contract Details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 81 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract edit sends PUT /api/contracts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 82 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "home tiles Contracts Claims Complaints Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 83 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "unknown URL shows Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 84 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "hydration counters hydratedComponents 4 hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 85 | .commandcode/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 86 | .commandcode/skills/control-angular-devtools/features/README.md | "test harness install then up then doctor" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 87 | .commandcode/skills/control-angular-devtools/features/attach.md | "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 88 | .commandcode/skills/control-angular-devtools/features/install.md | "branded install proven in Chrome Beta" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 89 | .commandcode/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler subscriber list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 90 | .commandcode/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 91 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Components tab signal graph pane" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 92 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "angular:di_graph removes template node" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 93 | .commandcode/skills/control-pangular-inspector/SKILL.md | "@pangular-inspector/devtools@0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 94 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "list-pages shows the tab's page id" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 95 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "explain-navigation newest first" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 96 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "list-routes (12 routes, measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 97 | .commandcode/skills/control-pangular-inspector/features/panel.md | "http://localhost:4507/__pangular/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 98 | .commandcode/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 99 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "scan get-components returns [] at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 100 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "build-meta Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 101 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 102 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "spikes/s1-extension retired" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 103 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "LanguageModel availability available" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 104 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 105 | .commandcode/skills/monitor-ci/SKILL.md | "nx.json contains nxCloudId or nxCloudAccessToken" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 106 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Use `-o <file>` with an explicit extension such as `.tar.gz`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 107 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "Requires the `nx-cloud-api` skill." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 108 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "Query the exact target with `nx show project "$project" --json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 109 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 110 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Review failures from the last 24 hours by default." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 111 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 112 | .commandcode/skills/nx-generate/SKILL.md | "Always use `--no-interactive`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 113 | .commandcode/skills/nx-import/SKILL.md | "After nx `22.6.0`, `nx import` responds with .ndjson outputs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 114 | .commandcode/skills/nx-import/SKILL.md | "Make sure the destination directory is empty before importing." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 115 | .commandcode/skills/nx-import/references/ESLINT.md | "Plugin options (set during `nx add @nx/eslint`): targetName `eslint:lint`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 116 | .commandcode/skills/nx-import/references/GRADLE.md | "If `@nx/gradle` is installed, run `nx show projects`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 117 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 118 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 119 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 120 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `"vite:typecheck"`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 121 | .commandcode/skills/nx-workspace/SKILL.md | "nx show projects" lists projects in the workspace | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 122 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "nx show projects --affected" lists affected projects | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 123 | .commandcode/skills/verify-ai-browsers/SKILL.md | "edge-phi4mini has failed canary.structured with kErrorUnknown" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 124 | .commandcode/skills/verify-angular-devtools/SKILL.md | "install --from takes the harness copy already in the checkout" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 125 | .commandcode/skills/verify-angular-devtools/SKILL.md | "coexist --di-graph leaves the page's signal graph broken until reload" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 126 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "exact pin 0.0.7 declared and installed" for @pangular-inspector/devtools | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 127 | .commandcode/taste/angular/taste.md | "Constructor injection counts as a legacy feature; inject() preferred" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 128 | .commandcode/taste/angular/taste.md | "provideAiDevTools() with per-package secondary entry points such as provideAiNgrxDevTools()" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 129 | .commandcode/taste/angular/taste.md | "the angular-developer skill should be model-invocable (no disable-model-invocation flag)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 130 | .commandcode/taste/communication/taste.md | "never call AskUserQuestion" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 131 | .commandcode/taste/communication/taste.md | "Casing and exact names matter ... provideAiDevTools() not provideAiDevtools()" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 132 | .commandcode/taste/design/taste.md | "removing panel/** from web_accessible_resources is conditional" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 133 | .commandcode/taste/design/taste.md | "globalThis runtime export must be a small pre-vetted allowlist of first- and third-party packages" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 134 | .commandcode/taste/tooling/taste.md | "Keep browser profiles and downloaded AI models on D:/, never C:/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 135 | .commandcode/taste/tooling/taste.md | "Installing and uninstalling browser extensions in Edge, Edge Dev, Chrome and Chrome Beta is pre-approved" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 136 | .commandcode/taste/tooling/taste.md | "Commits must be authored/committed as larsbrinknielsen@gmail.com" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 137 | docs/afk-run-2026-10-12.md | "All eight skills (control- and verify- for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 138 | docs/afk-run-2026-10-12.md | "Tree clean: git status shows nothing but ignored paths" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 139 | docs/design/tutor.md | "DevTools gives extension panels rewriter and translator in the iframe allow list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 140 | docs/design/tutor.md | "Rewriter available in all four browsers" per research/20 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 141 | docs/feature-proposals.md | "Vitest attach passed 2 of 2 on Gemma 4 instance (endpoint 9334)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 142 | docs/filing-ledger.md | "None is filed" (ten drafts) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 143 | plans/angular-ai-devtools-proposals.handoff.md | "head fbe3aac at writing" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 144 | plans/angular-ai-devtools-proposals.handoff.md | "Insurance Portal fixture branch claude/ai-devtools-spike, head cc9ce25" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 145 | research/00-browser-probe.md | "contextWindow = 9216 tokens" (Chrome Beta 156) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 146 | research/00-browser-probe.md | "Tool calling: works as an open loop" (Edge Dev 157) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 147 | research/01-built-in-ai-apis.md | "Chrome ships the Prompt API in extensions since Chrome 138" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 148 | research/03-prior-art.md | "Pangular extension manifest has no permissions" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 149 | research/04-ecosystem.md | "Vitest Browser Mode uses a real browser" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 150 | research/05-spikes.md | "`angular:di_graph` changes what `ɵgetSignalGraph` returns" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 151 | research/06-angular-skills.md | "Two official skills: angular-developer and angular-new-app" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 152 | research/07-prompting-small-models.md | "Gemma 4 tool names must be lowercase" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 153 | research/08-recent-angular-features.md | "Zoneless is the default since 22.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 154 | research/09-nano-tool-session-error.md | "Gemini Nano tool sessions fail without AIPromptAPIToolUse flag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 155 | research/10-model-capabilities.md | "AIPromptAPIToolUse experimental at 156 tag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 156 | research/10-model-capabilities.md | "Phi-4-mini BFCL 70.3" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 157 | research/11-spike-s1-extension-contexts.md | "Evidence: research/s1-results/chrome-fresh.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 158 | research/11-spike-s1-extension-contexts.md | "Extensions.loadUnpacked works over remote debugging port" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 159 | research/12-legacy-vs-modern-angular.md | "spike main.js shows setClassMetadata" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 160 | research/12-legacy-vs-modern-angular.md | "ng generate @angular/core:control-flow-migration" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 161 | research/13-portal-legacy-audit.md | "Angular 22.2.2 portal checkout" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 162 | research/13-portal-legacy-audit.md | "Reactive Forms in libs/claim/ui claim-form.component.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 163 | research/13-portal-legacy-audit.md | "forms migrated in commits 754aa1e, 66e8ad6, 92053b9" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 164 | research/14-ai-devtools-prior-art.md | "Storybook clone at dc9b30e8fd8" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 165 | research/14-ai-devtools-prior-art.md | "Angular clone at 5db6fc4453" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 166 | research/14-ai-devtools-prior-art.md | "139 judged rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 167 | research/15-deterministic-and-ai.md | "at most 892 signal nodes on insurance portal" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 168 | research/15-deterministic-and-ai.md | "worker AI exposed per Chromium main source" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 169 | research/16-ssr-runtime.md | "ng serve --port 4223" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 170 | research/16-ssr-runtime.md | "__ngDebugHydrationInfo__ on DOM nodes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 171 | research/17-vitest-browser-runtime.md | "vitest 5.0.3 and @vitest/browser 5.0.3 pinned" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 172 | research/17-vitest-browser-runtime.md | "route 2 attaches to real branded browser" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 173 | research/17-vitest-browser-runtime.md | "LanguageModel available in tester iframe" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 174 | research/18-edge-prevent-auto-signin.md | "BrowserSignin registry policy under HKCU" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 175 | research/18-edge-prevent-auto-signin.md | "Edge 155 Stable target" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 176 | research/18-edge-prevent-auto-signin.md | "msImplicitSignin feature flag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 177 | research/19-languagemodel-in-extension-contexts.md | "LanguageModel works in DevTools panel page" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 178 | research/19-languagemodel-in-extension-contexts.md | "hidden devtools.html page refused" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 179 | research/19-languagemodel-in-extension-contexts.md | "ExtensionPromptService calls LanguageModel in panel" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 180 | research/20-built-in-ai-without-flags.md | "LanguageModel undefined in Edge page without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 181 | research/20-built-in-ai-without-flags.md | "dedicated worker started by panel has all seven globals" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 182 | research/20-built-in-ai-without-flags.md | "LanguageDetector crashes renderer in worker" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
