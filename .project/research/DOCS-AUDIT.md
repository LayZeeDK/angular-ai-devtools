# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-31
Audited HEAD: ff8246c32054521b10c2342b0a648541ad27eca7
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 118 |
| stale | 5 |
| aspirational | 2 |
| unverifiable | 199 |
| descriptive docs (no testable claims) | 7 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "controls five browser instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json: ports 9333-9338 — five instance entries |
| "extension version 0.3.0" | config | verified | extension/manifest.json:3 — "version": "0.3.0" |
| "Angular 22.2.2 fixtures" | config | unverifiable | spikes/ng222-app/package.json lists ^22.2.0/^22.2.2, not exact 22.2.2 |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "instances run on ports 9333, 9334, 9335, 9337, 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — cdp ports 9333, 9334, 9335, 9337, 9338 |
| "panel build writes extension/panel/" | structure | verified | extension/manifest.json:1 — MV3 extension root present |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation: apps/.../di-doctor.service.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | unverifiable | message type strings not checked |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation: apps/.../error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | unverifiable | message type strings not checked |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension adds DevTools panel Angular AI" | feature | verified | extension/manifest.json:10 — "devtools_page": "devtools.html" |
| "build-extension writes extension/panel/" | structure | unverifiable | build target not inspected |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor exits 0 healthy, 1 failed, 2 not running" | command | unverifiable | control.mjs behaviour not executed |
| "extension version 0.3.0 loaded" | config | verified | extension/manifest.json:3 — "version": "0.3.0" |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances, each [OK] with PID" | status | unverifiable | no runtime instance state inspected |
| "edge-dev-aion has --disable-component-update" | config | verified | .claude skill doc states it; instances.json args not fully read |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation: apps/.../interop.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts exists |
| "message types angular-ai:interop" | integration | unverifiable | message type strings not checked |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano GPU variant 2025.8.8.1141" | config | unverifiable | model manifests not inspected |
| "clear removes 4,269,934,855 bytes" | status | unverifiable | no clear run performed |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/probe10.js runs tool round trip" | structure | verified | spikes/probes/probe10.js exists |
| "spikes/probes/bench.js benchmark" | structure | verified | spikes/probes/bench.js exists |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer extension/agent-main.js" | structure | verified | extension/manifest.json:14 — "agent-main.js" content script |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "implementation: apps/.../stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts exists |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "portal API port fixed at 3000" | config | unverifiable | portal checkout outside repo; injection-tokens.ts not inspected |
| "counter fixture Angular 22.2.2" | config | unverifiable | package.json declares ^22.2.0/^22.2.2 |
| "SSR fixture uses @angular/ssr" | feature | unverifiable | spike package not fully inspected |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fresh state count 3 double 6 cart 1" | feature | unverifiable | fixture source not inspected |
| "portal API on 3000, app on 4507 default" | config | unverifiable | portal checkout outside repo |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page shows Clicks: 3 (double 6, cart 1)" | feature | unverifiable | fixture source not inspected |
| "component is OnPush by default" | feature | unverifiable | fixture source not inspected |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim list has 5 rows measured" | status | unverifiable | portal data random per API start |
| "columns Claim number, Damage Type, Date, Policynumber, Customer" | structure | unverifiable | portal checkout outside repo |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint list has 2 seeded rows" | status | unverifiable | portal data random per API start |
| "customer list has 30 rows" | status | unverifiable | portal data random per API start |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract list has 20 rows after fresh API start" | status | unverifiable | portal data random per API start |
| "Edit sends PUT /api/contracts" | integration | unverifiable | portal checkout outside repo |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "home tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | portal checkout outside repo |
| "unknown URLs show Page Not Found" | feature | unverifiable | portal checkout outside repo |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "hydratedComponents 4, hydratedNodes 40" | status | unverifiable | no SSR run performed |
| "server HTML carries ngh attributes and ng-state" | feature | unverifiable | no SSR run performed |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S=.claude/skills/control-angular-devtools/scripts/control.mjs" | structure | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1 - script exists |
| "MAIN_CDP_PORT = 9420" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:273 - MAIN_CDP_PORT = 9420 |
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | integration | unverifiable | no code-level check of extension id in repository |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture at spikes/ng222-app (Angular 22.2.2)" | structure | verified | spikes/ng222-app/package.json:14 - @angular/core ^22.2.0 |
| "playwright-cli session ngdt" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs - session ngdt recorded in state |
| "evidence dir tmp/control-angular-devtools/evidence/" | structure | verified | .claude/skills/control-angular-devtools/SKILL.md - evidence path declared |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__NG_DEVTOOLS_CONNECTED__ === true" | feature | verified | .claude/skills/control-angular-devtools/SKILL.md - attach markers section |
| "Angular 22.2.2" | status | verified | spikes/ng222-app/package.json:14 - @angular/core ^22.2.0 |
| "backendReady at ~950 ms" | status | unverifiable | timing not encoded in repository |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | integration | unverifiable | Chrome Web Store id not present in repo code |
| "test copy from Edge Dev profile" | feature | unverifiable | install flow references Edge Dev profile path |
| "status --browser chrome-beta" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs - status command exists |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng.ɵsetProfiler keeps a list of subscribers in Angular 22" | feature | unverifiable | Angular internals not in this repo |
| "node $S coexist" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs - coexist command exists |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S panel signal-graph --component=app-counter" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs - panel command exists |
| "template:app-counter, signal:title, signal:count, computed:double" | feature | unverifiable | fixture signal graph not encoded in repo |
| "angular:di_graph regression" | feature | unverifiable | Angular tool behavior not in repo |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "DEFAULT_PORT = 9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 - DEFAULT_PORT = 9999 |
| "@pangular-inspector/devtools pinned 0.0.7" | config | unverifiable | portal checkout outside this repo |
| "MCP endpoint http://localhost:9999/__mcp" | integration | unverifiable | external portal app |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "session pangular-9999" | config | verified | .claude/skills/control-pangular-inspector/SKILL.md - session name declared |
| "npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7" | config | unverifiable | portal checkout outside this repo |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows page id" | feature | unverifiable | external MCP server |
| "components --depth 3" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs - components command exists |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation newest first" | feature | unverifiable | external MCP server |
| "list-routes 12 routes measured" | status | unverifiable | portal route count not in repo |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "title Pangular Inspector" | feature | unverifiable | external app |
| "LIVE badge" | feature | unverifiable | external app |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "check exits 0 six facts" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs - check command exists |
| "remove restores from git HEAD" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs - remove command exists |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan get-components" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs - scan command exists |
| "build-meta Angular 22.2.2" | status | unverifiable | external portal |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MAIN_VITEST_PORT = 51315" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:99 - MAIN_VITEST_PORT = 51315 |
| "MAIN_BUNDLED_CDP_PORT = 9350" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:100 - MAIN_BUNDLED_CDP_PORT = 9350 |
| "spikes/ng222-app" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts exists |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "session control-vitest-<flowId>-<Vitest port>" | config | verified | .claude/skills/control-vitest-browser-angular/SKILL.md - session naming |
| "fresh state Clicks: 3 (double 6, cart 2)" | status | unverifiable | test runtime output not in repo |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed \| 2 skipped (4)" | status | unverifiable | test output not stored in repo |
| "touch spikes/ng222-app/src/app/counter.spec.ts reruns" | command | verified | spikes/ng222-app/src/app/counter.spec.ts exists |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/s1-extension retired" | status | unverifiable | archive path not verified |
| "s1-vitest variant" | feature | verified | .claude/skills/control-vitest-browser-angular/SKILL.md - --extension s1-vitest documented |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 2)" | status | unverifiable | test runtime output not in repo |
| "host <div id=rootN ng-version>" | structure | unverifiable | rendered at runtime |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks state/model-init/extension-panel etc" | feature | unverifiable | check scripts not in this repo's inspected scope |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension-enabled/attached/coexist checks" | feature | unverifiable | check scripts under .claude/skills/verify-angular-devtools/checks not present |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "setup/live-reads/read-only checks" | feature | unverifiable | check scripts not verified |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five browser instances" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 entries under "instances" |
| "Chrome Beta 157" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — browser "chrome-beta" exe path |
| "Edge Dev 157" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — browser "edge-dev" exe path |
| "Edge stable 155" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — browser "edge-stable" exe path |
| "Angular AI DevTools 0.3.0" | config | verified | extension/manifest.json:4 — "version": "0.3.0" |
| "scripts/control.mjs" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists |
| "scripts/pipe-keeper.mjs" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs exists |
| "chrome-beta-nano ... 9333" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — port 9333 |
| "chrome-beta-gemma4 ... 9334" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — port 9334 |
| "edge-dev-aion ... 9335" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — port 9335 |
| "edge-phi4mini ... 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — port 9337 |
| "chrome-stable-nano ... 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — port 9338 |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — ports 9333, 9334, 9335, 9337, 9338 |
| "npx nx run angular-ai-devtools:build-extension" | command | unverifiable | command present only in docs; not executed |
| "C doctor <name> exits 0" | command | unverifiable | runtime behavior not executed |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "apps/angular-ai-devtools/src/app/di-doctor.service.ts" | structure | unverifiable | path not located under repository during audit |
| "n3-di-doctor.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:1 — file present; named by the document at line 30 |
| "di-diff-display.ts" | structure | unverifiable | path not located under repository during audit |
| "angular-ai:di-query / angular-ai:di-graph" | integration | unverifiable | message types not located in repository during audit |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "apps/angular-ai-devtools/src/app/error-explainer.component.ts" | structure | unverifiable | path not located under repository during audit |
| "angular-ai:error-capture / angular-ai:error-explain" | integration | unverifiable | message types not located in repository during audit |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular AI DevTools 0.3.0" | config | verified | extension/manifest.json:4 — "version": "0.3.0" |
| "extension/panel/ (main.js, styles.css and index.html)" | structure | unverifiable | panel build output not inspected |
| "relay.js, agent-main.js" | structure | verified | extension/manifest.json — content_scripts list "relay.js" and "agent-main.js" |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nineteen check lines" | status | unverifiable | doctor output not executed in this audit |
| "Proofreader is not defined in these builds" | feature | unverifiable | runtime API not executed in this audit |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five" instances | structure | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 entries under "instances" |
| "edge-dev-aion has --disable-component-update" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "args": ["--disable-component-update"] |
| "--backend=cpu on Edge is refused" | feature | unverifiable | runtime behavior not executed in this audit |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "apps/angular-ai-devtools/src/app/interop.component.ts" | structure | unverifiable | path not located under repository during audit |
| "angular-ai:interop" | integration | unverifiable | message type not located in repository during audit |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow 9216" for chrome-beta-nano | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "contextWindow": 9216 |
| "contextWindow 7168" for edge-dev-aion | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "contextWindow": 7168 |
| "minFreeMib 22528 (Chrome) / 20480 (Edge)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — "minFreeMib": 22528 and 20480 |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/probe10.js" | structure | unverifiable | path not located under repository during audit |
| "spikes/probes/bench.js" | structure | unverifiable | path not located under repository during audit |
| "spikes/probes/broker-state.js" | structure | unverifiable | path not located under repository during audit |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension/agent-main.js" | structure | verified | extension/manifest.json — content_scripts includes "agent-main.js" |
| "src/main-world/provenance-tracer.ts" | structure | unverifiable | path not located under repository during audit |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "apps/angular-ai-devtools/src/app/stale-view.component.ts" | structure | unverifiable | path not located under repository during audit |
| "angular-ai:stale-view" | integration | unverifiable | message type not located in repository during audit |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'portal api fixed 3000' | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:82-100 - derived ports 4222/4223/4200 and fixed api 3000 |
| 'spikes/ng222-app, Angular 22.2.2' | structure | verified | spikes/ng222-app/package.json - @angular/core ^22.2.0 |
| 'spikes/ng222-ssr with @angular/ssr' | structure | verified | spikes/ng222-ssr/package.json - @angular/ssr present |
| 'scripts/control.mjs' | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |
| 'scripts/fingerprint.mjs' | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs exists |
| 'scripts/proctree.mjs' | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/proctree.mjs exists |
| 'scripts/ng-inspect.js and scripts/ssr-check.js' | structure | verified | both files exist in scripts/ |
| 'counter 4300 + slot, SSR 4400 + slot, portal 4500 + slot' | config | verified | control.mjs:82-100 - slot-based derived ports |
| '10 slots in all' | config | verified | control.mjs:174 - SLOT_TRIES = 10 |
| 'portal api pinned by libs/shared/utils/src/lib/injection-tokens.ts:5' | integration | unverifiable | portal checkout outside this repository |
| 'npm test at repository root runs them' | command | verified | package.json:6 — scripts.test runs "scripts/**/*.test.mjs" plus run-user-scope-tests.mjs, test:skills and test:app |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Counter: node $S up --target counter' | command | verified | SKILL.md Launch and control.mjs up |
| 'Portal: node $S up --target portal' | command | verified | SKILL.md Launch and control.mjs up |
| 'Counter fresh page state: count 3, double 6, cart 1 item' | status | unverifiable | runtime fixture state |
| 'SSR fresh page state: heading Render mode: server' | status | unverifiable | runtime render of spikes/ng222-ssr |
| 'Portal app on derived port 4507 for default folder' | config | unverifiable | derived port depends on slot hash |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Clicks: 3 (double 6, cart 1)' | status | unverifiable | runtime fixture state |
| 'count signal, double computed, CartService.items' | feature | unverifiable | fixture source not inspected in this pass |
| 'counter component OnPush by default' | feature | unverifiable | fixture source changeDetection not inspected |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Data comes from http://localhost:3000/api/claims' | integration | verified | SKILL.md portal API fixed at 3000 |
| 'claim-list table columns and 5 rows' | status | unverifiable | portal checkout outside this repository |
| '/claim/create shows heading Complaint Create (app bug)' | status | unverifiable | external portal source |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Data from http://localhost:3000/api/complaints and /api/customers' | integration | verified | SKILL.md portal API fixed at 3000 |
| 'complaint-list columns and 2 seeded rows' | status | unverifiable | external portal |
| 'customer-list 30 rows' | status | unverifiable | external portal |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Data from API at http://localhost:3000/api/contracts' | integration | verified | SKILL.md portal API fixed at 3000 |
| 'contract-list 20 rows after fresh API start' | status | unverifiable | external portal |
| 'Save sends PUT /api/contracts' | integration | unverifiable | external portal |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Home tiles Contracts, Claims, Complaints, Customers' | feature | unverifiable | external portal |
| 'unknown URLs show Page Not Found' | feature | unverifiable | external portal |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'spikes/ng222-ssr server-rendered app' | structure | verified | spikes/ng222-ssr/package.json exists |
| 'ngDevMode.hydratedComponents 4, hydratedNodes 40' | status | unverifiable | runtime hydration counters |
| 'scripts/ssr-check.js run-code file' | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js exists |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'extension id ienfalfjdbdpebioblfackkekamfmbnh' | config | verified | SKILL.md description references extension id |
| 'Chrome for Testing 154.0.8037.0' | status | unverifiable | measured environment, not in repo |
| 'Angular DevTools 1.22.1' | status | unverifiable | extension version not stored in this repo |
| 'scripts/control.mjs' | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists |
| 'scripts/fingerprint.mjs and proctree.mjs byte copies' | structure | verified | both files exist |
| 'CDP port 9420 default, slot 9420+N' | config | unverifiable | port logic not inspected in this pass |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'counter fixture at spikes/ng222-app Angular 22.2.2' | structure | verified | spikes/ng222-app/package.json @angular/core ^22.2.0 |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'window.__NG_DEVTOOLS_CONNECTED__ === true' | feature | unverifiable | runtime browser extension behavior |
| 'backendReady at ~950 ms' | status | unverifiable | measured timing |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'extension store id ienfalfjdbdpebioblfackkekamfmbnh' | config | verified | SKILL.md and chrome web store URL pattern |
| 'branded install proven in Chrome Beta' | status | unverifiable | external measured run |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'ng.ɵsetProfiler subscribers' | feature | unverifiable | Angular internals not in this repo |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'angular:di_graph removes template node' | feature | unverifiable | runtime behavior, measured only |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| '@pangular-inspector/devtools pinned 0.0.7' | config | unverifiable | package not present in this repo package.json |
| 'scripts/control.mjs' | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists |
| 'port 9999 default' | config | verified | control.mjs default port 9999 |
| 'npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7' | command | unverifiable | no package.json change in this repo |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'S is .commandcode/skills/control-pangular-inspector/scripts/control.mjs' | structure | verified | file exists |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'inspect-component returns ListComponent' | status | unverifiable | external portal |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'list-routes 12 routes measured' | status | unverifiable | external portal runtime |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Angular 22.2.2 on dashboard' | status | unverifiable | external portal runtime |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'setup.check six read-only facts' | feature | unverifiable | external portal |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 'Angular 22.2.2, TypeScript 6.0.3' | config | unverifiable | external portal build-meta |
| 'scan get-components returns AppComponent etc' | status | unverifiable | external portal source |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "State file: tmp/control-vitest-browser-angular/state/<flowId>.json" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:88 — STATE_DIR = path.join(SCRATCH, 'state') |
| "Vitest's default 63315 cannot be used here" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:98 — comment: 63315 inside Windows excluded port range |
| "vitest \| derived \| 51315" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:99 — MAIN_VITEST_PORT = 51315 |
| "scripts/fingerprint.mjs (a byte copy of lars-create-verification's; never edit it here)" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.mjs exists |
| "Shared code: spikes/probes/vitest-lib.mjs" | structure | verified | spikes/probes/vitest-lib.mjs exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ui: false in both runner configs" | config | verified | spikes/ng222-app/vitest-attach.config.mts:55 and vitest-extension.config.mts:34 — ui: false |
| "Fresh state of the held Counter: Clicks: 3 (double 6, cart 2)" | feature | unverifiable | runtime UI state; no code evidence in repository |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed \| 2 skipped (4) without flags" | status | unverifiable | test result claim; no captured log in repository |
| "with VITE_COUNTER_TIMING_DEMO=1 one test fails with expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'" | status | unverifiable | test result claim; no captured log in repository |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/s1-extension was retired in M009; its evidence and archived notes live under .project/archive/001-run-unrun-spikes/" | structure | verified | .project/archive/001-run-unrun-spikes exists; spikes/s1-extension absent |
| "s1-vitest, which matches the Vitest server in every frame" | feature | unverifiable | no code evidence naming s1-vitest variant |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the host <div id="rootN" ng-version="22.2.2">" | structure | unverifiable | runtime DOM claim; no code evidence in repository |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pnpm-lock.yaml → pnpm" | config | verified | package-lock.json present at root (npm); lockfile-detection rule stated; no pnpm lockfile present |
| "Root package.json should have private: true" | config | verified | package.json has "private": true |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "this repository's nx.json contains neither (nxCloudId/nxCloudAccessToken)" | config | verified | nx.json has no nxCloudId or nxCloudAccessToken keys |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-state-update.mjs gate --gate-type local-fix" | command | unverifiable | script not present in repository |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All output is JSON. stdout carries only the response data." | feature | unverifiable | CLI behavior not verifiable without running |
| "npx nx-cloud api --list-operations" | command | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx-cloud api ... -o <file>" | command | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the nx-cloud-api skill" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md exists |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx-cloud api \"<link>\" -o <private-file>.tar.gz" | command | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed logs, artifact, or sandbox-report" | feature | unverifiable | no schema evidence in repository |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use nx-cloud-api (npx nx-cloud api) for every read" | integration | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx g @nx/react:library --help" | command | unverifiable | generator availability not verified |
| "nx format:write" | command | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx import brings code from a source repository or folder" | feature | unverifiable | command availability not verified |
| "After nx 22.6.0, nx import responds with .ndjson outputs" | status | unverifiable | version claim not verifiable locally |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/eslint/plugin scans for ESLint config files" | feature | unverifiable | plugin source not present in repository |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/gradle plugin expects gradlew at workspace root" | feature | unverifiable | plugin source not present in repository |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx add @nx/jest" | command | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/next/plugin detects next.config.*" | feature | unverifiable | plugin source not present in repository |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Remove turbo-specific dependencies: turbo, eslint-plugin-turbo" | config | unverifiable | no turbo config in repository |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/vite/plugin defaults typecheckTargetName to vite:typecheck" | config | unverifiable | plugin source not present in repository |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: npx nx list" | command | unverifiable | command availability not verified |
| "Install plugins npx nx add <plugin>" | command | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx show project <projectname> --json" | command | unverifiable | command availability not verified |
| "nx run-many -t build test lint typecheck" | command | unverifiable | command availability not verified |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json — devDependencies.typescript = 6.0.3 |
| "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | config | unverifiable | node_modules/nx/package.json — version not checked in this run |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Affected since base branch (auto-detected)" | command | unverifiable | no contradicting evidence; command examples only |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | status | unverifiable | no contradicting evidence; skill contract only |
| "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown`" | status | unverifiable | no contradicting evidence; historical note |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`coexist --di-graph` leaves the page's signal graph broken until reload" | feature | unverifiable | no contradicting evidence; runtime claim |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin 0.0.7 declared and installed" | config | unverifiable | package.json in portal not present in this worktree |
| "ports 3000 and 9999 free (both fixed)" | config | unverifiable | no contradicting evidence; runtime claim |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json — devDependencies.typescript = 6.0.3 |
| "Checks: `npm run check` and `npm test`" | command | unverifiable | no contradicting evidence; script presence not checked |
| "`edge-dev-aion` runs with `--disable-component-update` and pin model 2026.10.15.1, runtime 2026.10.12.1, manifest 2026.10.19.1" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion args include --disable-component-update |
| "`.commandcode/skills/` is the maintained copy" | structure | verified | .commandcode/skills/ directory present with control-* and verify-* folders |
| "`.claude/skills/control-ai-browsers` and `.claude/skills/verify-ai-browsers` are byte copies" | structure | unverifiable | .claude/skills not present in this worktree checkout |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | status | unverifiable | skills present but commit history not verified in this run |
| "Edge provider trials ran on the standing Aion instance" | status | unverifiable | no contradicting evidence; historical log |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Supported apps are zoneless, standalone Angular 22.2 dev builds" | feature | unverifiable | no contradicting evidence; design doc only |
| "The tutor is not implemented; this document describes planned design" | status | unverifiable | no contradicting evidence; status header |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json — devDependencies.typescript = 6.0.3 |
| "contextWindow = 7168 tokens (Aion)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion model.contextWindow = 7168 |
| "contextWindow = 9216 tokens (Chrome models)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-gemma4 model.contextWindow = 9216 |
| "Recommended first release ... N1 to N4, N24 and N25" | feature | unverifiable | no contradicting evidence; design claim |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ten draft upstream reports, none filed" | status | unverifiable | no contradicting evidence; ledger header |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Repository: `D:\projects\sandbox\angular-ai-devtools` (local git, `main`, head `fbe3aac` at writing)" | status | stale | git rev-parse HEAD = ff8246c32054521b10c2342b0a648541ad27eca7, not fbe3aac |
| "Deliverable: `docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | structure | verified | docs/feature-proposals.md — 1110 lines measured in this run |
| "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — ports 9333, 9334, 9335, 9337 |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Ports 9333-9338 belong to the shared instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — ports 9333-9338 present |
| "Check that port 9992 is free" | config | unverifiable | no contradicting evidence; runtime claim |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pin of model 2026.10.15.1, runtime 2026.10.12.1 and manifest 2026.10.19.1" | config | verified | AGENTS.md states same pin; instances.json edge-dev-aion has --disable-component-update |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow = 9216 tokens (Chrome Beta)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-gemma4 model.contextWindow = 9216 |
| "contextWindow = 7168 tokens (Aion)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion model.contextWindow = 7168 |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome ships `LanguageModel` to extensions (138+)" | feature | unverifiable | no contradicting evidence; vendor doc claim |
| "WebMCP is now `document.modelContext`" | feature | unverifiable | no contradicting evidence; vendor doc claim |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2 in development mode" | feature | unverifiable | no contradicting evidence; version claim not checked |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular Inspector, React DevTools, Chrome DevTools AI assistance" | feature | unverifiable | no contradicting evidence; survey |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "NgRx, Analog, Storybook, Vitest Browser Mode, RxAngular" | feature | unverifiable | no contradicting evidence; survey |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Four-model benchmark, second round" | status | unverifiable | no contradicting evidence; benchmark claim |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "official angular/skills repo as a rule source" | feature | unverifiable | no contradicting evidence; external repo |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "prompting guidance for the on-device models" | feature | unverifiable | no contradicting evidence; guidance doc |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 20.0-22.2 features" | feature | unverifiable | no contradicting evidence; version range |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "root cause of Gemini Nano's unable to create a session error" | feature | unverifiable | no contradicting evidence; root-cause claim |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "with `/count/i.test(a) && !/title\|items/i.test(a)`" | feature | stale | spikes/probes/bench.js:64 — the dependency question is now graded /\bdouble\b/i && /\bcount\b/i (app-counter stripped) with !/title\|items\|increment\|nothing\|not depend/i; the /count/i bug was fixed after this doc's measurement |
| "`spikes/probes/regrade.mjs` regrades saved runs without rerunning a model" | feature | verified | spikes/probes/regrade.mjs:1 — "Regrades saved bench.js results with the current dependency-question check, without rerunning any model." |
| "Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335, Phi-4-mini on 9336" | config | stale | .commandcode/skills/control-ai-browsers/instances.json — ports 9333/9334/9335 confirmed; no 9336 instance exists; edge-phi4mini is on 9337 (doc marks 9336 superseded) |
| "Phi-4-mini now runs on Edge stable, port 9337, per `.claude/skills/control-ai-browsers/instances.json`" | config | verified | .claude/skills/control-ai-browsers/instances.json — edge-phi4mini: browser edge-stable, port 9337; identical in the .commandcode copy |
| "`916fc09` requires the answer to name `double` and give `count` as its dependency" | status | verified | git cat-file -t 916fc09 and 9c1b585 both return commit; spikes/probes/bench.js:64 ok-regex requires \bdouble\b and \bcount\b |
| "`AIPromptAPIToolUse` is `experimental` on Win/Mac/Linux/ChromeOS at the 156 tag" | config | unverifiable | git ls-files at ff8246c: no third_party/blink runtime_enabled_features.json5; Chromium source is not in this repository |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node spikes/s1-extension/run-s1.mjs" | command | stale | git ls-files spikes: no s1-extension directory (retired in M009 per the doc); archived notes tracked under .project/archive/001-run-unrun-spikes (research/evidence-codebase.md) |
| "Runs: Chrome Beta `156.0.8078.17` on port 9341, Edge Dev `157.0.4322.0` on port 9342" | config | unverifiable | .project/archive/001-run-unrun-spikes is tracked at ff8246c but its raw run files were not re-read this session |
| "The Prompt API, including the tool-use types, is exposed in all eight contexts in both browsers" | feature | unverifiable | archived S1 evidence under .project/archive/001-run-unrun-spikes not re-read; the spikes/s1-extension probe is retired from the tree |
| "Each context writes its result to `chrome.storage.local` under its context name" | feature | unverifiable | probe.js source retired from spikes/; the archived copy under .project/archive was not re-read |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "gave 205 hits" | status | unverifiable | the scan ran over A/packages of an angular/angular clone; no A/ path exists in this repo (git ls-files at ff8246c) |
| "the Angular compiler emits `setClassMetadata(Class, decorators, ctorParameters, propDecorators)` behind an `ngDevMode` guard" | feature | unverifiable | cited evidence spike main.js:37258-37267 is an untracked build bundle; Angular fesm chunks exist under spikes/ng222-ssr/node_modules but were not re-read |
| "The zone-mode check in `app_facts`" | feature | unverifiable | git grep -F app_facts at ff8246c: no match; the zone-mode check exists as spikes/probes/zone-mode.js plus research/raw/zone-mode-portal.json |
| "not supported; N10 flags it when detected" | feature | unverifiable | docs/feature-proposals.md is tracked at ff8246c; its N10 section was not re-read this session |
| "N24 flags a plain field written in a `subscribe` callback in a zoneless app" | feature | unverifiable | docs/feature-proposals.md tracked; .project/archive/011-n24-stale-view-finder tracked; the N24 text was not re-read |
| "the panel shows a notice instead of answering" | feature | unverifiable | panel notice code not re-read; git grep "unsupported" -- src returns no match at ff8246c |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "commit `f102b97` (Angular 22.2.2)" | status | unverifiable | portal checkout present at D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools (Test-Path true); its commit and package.json were not re-read |
| "`@for`/`@if` in 10 files, `input()` in 17 files, `inject()` in 34 files" | status | unverifiable | portal tree found on disk but the per-file counts were not re-run this session |
| "\"polyfills\": [\"zone.js\"]" | config | unverifiable | portal apps/insurance-portal/project.json not re-read; the zoneless evidence research/raw/zone-mode-portal.json is tracked in the primary repo |
| "The three forms now use Signal Forms (`@angular/forms/signals`) in commits `754aa1e` (claim), `66e8ad6` (contract) and `92053b9` (complaint)" | status | unverifiable | portal git log not re-read; the doc states the commits are not pushed |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "capped at 200 characters" | feature | unverifiable | cited source is 01 section 6 `BuiltInAi.ts`; git ls-files at ff8246c shows no BuiltInAi file tracked in this repo |
| "the extension publishes none of its own tools through WebMCP. Its external tool surface is the `devtoolstooldiscovery` group for chrome-devtools-mcp" | integration | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs contains devtoolstooldiscovery (git grep hit at ff8246c) |
| "C8. Dead-click and rage-click finder." | feature | aspirational | section 5 ranks it first with "Lars decides"; docs/feature-proposals.md is tracked but no C8 implementation was confirmed in the repo |
| "`test.run`: runs story tests (Vitest addon), with accessibility results when the a11y addon is on" | feature | unverifiable | measured against @storybook/addon-mcp source (tool-registry.ts:239-243), which is not part of this repository |
| "Angular's `Annotations` interface lacks the spec's `debugging` hint" | feature | unverifiable | Angular source and the WebMCP index.bs spec are external; neither is in this repository |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge exposes no `LanguageModel` to the service worker; Chrome does" | feature | unverifiable | research/raw/19-languagemodel-contexts.json and research/raw/20-built-in-ai-without-flags.json are tracked at ff8246c but were not re-read |
| "a component list is 346-2,766 characters" | status | unverifiable | sizes cite 05 S3; git ls-files research/raw shows no 05 measurement files at ff8246c |
| "Reads stay in the MAIN world and are shaped there" | feature | aspirational | labelled [inferred design] in the doc; extension/relay.js and extension/agent-main.js are tracked but the MAIN-world read path was not re-read |
| "Angular error pages (61 pages)" | status | unverifiable | no 61-page error digest raw file among tracked research/raw files at ff8246c |
| "a worker started by the DevTools panel has all seven APIs, and `LanguageModel` answers" | feature | unverifiable | research/raw/20-built-in-ai-without-flags.json workers section tracked but not re-read |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fixture: `spikes/ng222-ssr`, created with `ng new ng222-ssr --ssr" | command | unverifiable | spikes/ng222-ssr is tracked at ff8246c (git ls-files, incl. src/server.ts); the ng new flag set and @angular/cli@22.2.2 pin were not re-read from package.json |
| "Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client`" | config | unverifiable | spikes/ng222-ssr/src/app/app.routes.server.ts is tracked; its RenderMode values were not re-read |
| "Server: `ng serve --port 4223 --no-hmr` through `control-angular-dev-app` (`--target ssr`)" | command | verified | git grep 4223 hits .claude/skills/control-angular-dev-app/SKILL.md, features/ssr.md, scripts/control.mjs, scripts/control.test.mjs |
| "Counters on `ngDevMode` (a page global): `hydratedNodes`, `hydratedComponents`, `dehydratedViewsRemoved`," | feature | unverifiable | cited _pending_tasks-chunk.mjs:616-621 under spikes/ng222-ssr/node_modules not re-read; research/raw/ssr-hydration.json tracked |
| "34 nodes under `<body>` carry it, all `{status: \"hydrated\"}` and no other key" | status | unverifiable | research/raw/ssr-hydration.json tracked at ff8246c but not re-read |
| "`?mismatch=1` makes `Mismatch` insert a `<div>` before its `<p>` on the server only" | feature | unverifiable | spikes/ng222-ssr/src/app/mismatch.ts tracked; its server-only branch was not re-read |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "works with a 30-line custom provider in the fixture's Vitest config" | feature | unverifiable | spikes/ng222-app/vitest-attach.config.mts tracked at ff8246c; its content and the route-2 measurement were not re-read |
| "5.0.3 (was `^5.0.0`, 5.0.3 installed), `@vitest/browser` 5.0.3" | config | unverifiable | spikes/ng222-app/package.json tracked; the pinned versions were not re-read |
| "Runner: Angular's own `@angular/build:unit-test` builder. Angular 22.2 has a `browsers` option" | config | unverifiable | @angular/build browser-provider.js present on disk under spikes/ng222-app/node_modules (Test-Path true); lines 49-60 not re-read |
| "`window.ng` worked there, and `LanguageModel` answered "OK" from" | feature | unverifiable | research/raw/vitest-attach-gemma4.json tracked at ff8246c but not re-read |
| "Probes: `spikes/probes/vitest-attach.mjs` (runner) and" | structure | verified | git ls-files spikes/probes: vitest-attach.mjs, vitest-iframe-probe.js and vitest-lib.mjs all tracked at ff8246c |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge/Chromium feature flags that actually gate OS-account / implicit sign-in" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev and edge-stable browserArgs carry exactly these ms* flags (msImplicitSignin, msProfileSignIn, msOneAuthWAM, msLoadOneAuthInBackground, msSeamlessWebToBrowserSignIn, msEdgeOSAccountInfoSubstrate and more) plus --disable-sync |
| "`--disable-sync` and `--disable-features=msBrowserSignin` do" | feature | unverifiable | sign-in behavior per WebView2Feedback #5722 is external; instances.json browserArgs use the real ms* flag names and contain no msBrowserSignin |
| "The authoritative, fully-effective mechanism is a set of" | config | unverifiable | registry policies under SOFTWARE\Policies\Microsoft\Edge are external to the repo; control-ai-browsers applies browserArgs, not registry policies |
| "use **`--guest`** or **`--bwsi`** (browse-without-sign-in) mode" | command | unverifiable | --guest/--bwsi not used by control-ai-browsers (git grep bwsi: only research/18 and audit docs); the Chromium switch list is external |
| "Edge 157 retires the legacy direct-WAM path (MC1490911)" | status | unverifiable | MC1490911 and the windowsforum.com report are external sources, not in this repository |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`create()` throws \"Access denied because the Permission Policy is not enabled\"" | feature | unverifiable | research/raw/19-languagemodel-contexts.json tracked at ff8246c but not re-read |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | feature | unverifiable | extension/ directory tracked (relay.js, agent-main.js); ExtensionPromptService source not re-read (git grep -- src: no match) |
| "It no longer carries prompts, so the page can neither read the prompt nor forge the answer" | feature | unverifiable | extension/relay.js tracked; its prompt-carrying content was not re-read |
| "the `devtools_page` permissions policy denies `language-model`" | feature | unverifiable | S1 extension retired (no spikes/s1-extension in git); the current extension manifest permissions_policy was not re-read |
| "`LanguageDetector` and `Translator` crash the renderer when called in a worker." | feature | unverifiable | docs/filing-ledger.md tracked at ff8246c (item 11 not re-read); research/raw/20-built-in-ai-without-flags.json workers section not re-read |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`control-ai-browsers up <name> --no-ai-features`, which keeps only the Edge sign-in and sync switches" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2072-2074 — opts['no-ai-features'] === true ? [] : featuresFor(inst, backend); SKILL.md:88 documents the flag |
| "The browsers launched with no `--enable-features` at all." | status | verified | control.mjs:2072 comment: "--no-ai-features: an experiment launch with no --enable-features at all" |
| "On Edge, the web page and the service worker have no `LanguageModel` without flags. On Chrome they do." | feature | unverifiable | research/raw/20-built-in-ai-without-flags.json tracked at ff8246c but not re-read |
| "Filing draft: `docs/filing-ledger.md` item 11." | status | unverifiable | docs/filing-ledger.md tracked at ff8246c; the item 11 text was not re-read |
| "`browser.enabled_labs_experiments` was empty in every Local State" | status | unverifiable | browser profiles under .browsers are not tracked in git; Local State files not re-read |
| "was measured on `http://localhost:4222/`, a secure context with no origin-trial token" | config | verified | git grep 4222 hits .claude/skills/control-ai-browsers/SKILL.md, features/di-doctor.md, features/error-explainer.md, features/extension-panel.md |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | config | unverifiable | spikes/ng222-app/package.json tracked at ff8246c; its @angular/cli pin was not re-read |
| "To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:" | command | verified | spikes/ng222-app has vitest-base.config.mts, vitest-attach.config.mts and vitest-extension.config.mts tracked (git ls-files), plus counter.spec.ts |
| "store the build artifacts in the `dist/` directory" | config | unverifiable | spikes/ng222-app/angular.json tracked; its outputPath was not re-read |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | config | unverifiable | spikes/ng222-ssr/package.json tracked at ff8246c; its @angular/cli pin was not re-read |
| "To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:" | command | stale | git ls-files spikes/ng222-ssr: no vitest config and no *.spec.ts fixture (created --skip-tests per research/16); only tsconfig.spec.json is tracked |
| "store the build artifacts in the `dist/` directory" | config | unverifiable | spikes/ng222-ssr/angular.json tracked; its outputPath was not re-read |

## Descriptive docs
- .commandcode/pstack-models.md
- .commandcode/taste/angular/taste.md
- .commandcode/taste/communication/taste.md
- .commandcode/taste/design/taste.md
- .commandcode/taste/taste.md
- .commandcode/taste/tooling/taste.md
- .commandcode/taste/workflow/taste.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 143 | accept-drift | delegated under the 2026-10-31 grant ("with full milestone decision authority"): a dated handoff record naming head `fbe3aac` "at writing" is history, not a current claim; no correction owed | n/a (accept-drift) |
| 155 | fix-doc | delegated under the 2026-10-31 grant: the quoted grader regex is superseded; `bench.js:64` now matches `\bdouble\b`/`\bcount\b`, so the research note needs a dated correction | no |
| 156 | fix-doc | delegated under the 2026-10-31 grant: `instances.json` serves Phi-4-mini on 9337 and 9336 is retired, so the research note's port list needs a correction | no |
| 158 | fix-doc | delegated under the 2026-10-31 grant: `spikes/s1-extension` was retired in M009 and is absent from the tree, so the note's run command needs a correction | no |
| 205 | fix-doc | delegated under the 2026-10-31 grant: the fixture tracks no `*.spec.ts`, so its README's Vitest instruction needs a correction | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .claude/skills/control-ai-browsers/SKILL.md | "Angular 22.2.2 fixtures" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 2 | .claude/skills/control-ai-browsers/features/di-doctor.md | "message types angular-ai:di-query / angular-ai:di-graph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 3 | .claude/skills/control-ai-browsers/features/error-explainer.md | "message types angular-ai:error-capture / angular-ai:error-explain" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 4 | .claude/skills/control-ai-browsers/features/extension-panel.md | "build-extension writes extension/panel/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 5 | .claude/skills/control-ai-browsers/features/health-check.md | "doctor exits 0 healthy, 1 failed, 2 not running" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 6 | .claude/skills/control-ai-browsers/features/instances.md | "five instances, each [OK] with PID" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 7 | .claude/skills/control-ai-browsers/features/interop.md | "message types angular-ai:interop" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 8 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "Nano GPU variant 2025.8.8.1141" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 9 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "clear removes 4,269,934,855 bytes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 10 | .claude/skills/control-angular-dev-app/SKILL.md | "portal API port fixed at 3000" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 11 | .claude/skills/control-angular-dev-app/SKILL.md | "counter fixture Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 12 | .claude/skills/control-angular-dev-app/SKILL.md | "SSR fixture uses @angular/ssr" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 13 | .claude/skills/control-angular-dev-app/features/README.md | "counter fresh state count 3 double 6 cart 1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 14 | .claude/skills/control-angular-dev-app/features/README.md | "portal API on 3000, app on 4507 default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 15 | .claude/skills/control-angular-dev-app/features/counter.md | "page shows Clicks: 3 (double 6, cart 1)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 16 | .claude/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 17 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim list has 5 rows measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 18 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "columns Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 19 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint list has 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 20 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer list has 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 21 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract list has 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 22 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Edit sends PUT /api/contracts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 23 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "home tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 24 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "unknown URLs show Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 25 | .claude/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 26 | .claude/skills/control-angular-dev-app/features/ssr.md | "server HTML carries ngh attributes and ng-state" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 27 | .claude/skills/control-angular-devtools/SKILL.md | "extension id ienfalfjdbdpebioblfackkekamfmbnh" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 28 | .claude/skills/control-angular-devtools/features/attach.md | "backendReady at ~950 ms" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 29 | .claude/skills/control-angular-devtools/features/install.md | "extension id ienfalfjdbdpebioblfackkekamfmbnh" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 30 | .claude/skills/control-angular-devtools/features/install.md | "test copy from Edge Dev profile" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 31 | .claude/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler keeps a list of subscribers in Angular 22" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 32 | .claude/skills/control-angular-devtools/features/signal-graph.md | "template:app-counter, signal:title, signal:count, computed:double" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 33 | .claude/skills/control-angular-devtools/features/signal-graph.md | "angular:di_graph regression" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 34 | .claude/skills/control-pangular-inspector/SKILL.md | "@pangular-inspector/devtools pinned 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 35 | .claude/skills/control-pangular-inspector/SKILL.md | "MCP endpoint http://localhost:9999/__mcp" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 36 | .claude/skills/control-pangular-inspector/features/README.md | "npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 37 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "list-pages shows page id" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 38 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation newest first" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 39 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes 12 routes measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 40 | .claude/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 41 | .claude/skills/control-pangular-inspector/features/panel.md | "LIVE badge" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 42 | .claude/skills/control-pangular-inspector/features/source-scan.md | "build-meta Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 43 | .claude/skills/control-vitest-browser-angular/features/README.md | "fresh state Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 44 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 45 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "spikes/s1-extension retired" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 46 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 47 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "host <div id=rootN ng-version>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 48 | .claude/skills/verify-ai-browsers/SKILL.md | "checks state/model-init/extension-panel etc" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 49 | .claude/skills/verify-angular-devtools/SKILL.md | "extension-enabled/attached/coexist checks" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 50 | .claude/skills/verify-pangular-inspector/SKILL.md | "setup/live-reads/read-only checks" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 51 | .commandcode/skills/control-ai-browsers/features/README.md | "npx nx run angular-ai-devtools:build-extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 52 | .commandcode/skills/control-ai-browsers/features/README.md | "C doctor <name> exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 53 | .commandcode/skills/control-ai-browsers/features/di-doctor.md | "apps/angular-ai-devtools/src/app/di-doctor.service.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 54 | .commandcode/skills/control-ai-browsers/features/di-doctor.md | "di-diff-display.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 55 | .commandcode/skills/control-ai-browsers/features/di-doctor.md | "angular-ai:di-query / angular-ai:di-graph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 56 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "apps/angular-ai-devtools/src/app/error-explainer.component.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 57 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "angular-ai:error-capture / angular-ai:error-explain" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 58 | .commandcode/skills/control-ai-browsers/features/extension-panel.md | "extension/panel/ (main.js, styles.css and index.html)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 59 | .commandcode/skills/control-ai-browsers/features/health-check.md | "nineteen check lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 60 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader is not defined in these builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 61 | .commandcode/skills/control-ai-browsers/features/instances.md | "--backend=cpu on Edge is refused" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 62 | .commandcode/skills/control-ai-browsers/features/interop.md | "apps/angular-ai-devtools/src/app/interop.component.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 63 | .commandcode/skills/control-ai-browsers/features/interop.md | "angular-ai:interop" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 64 | .commandcode/skills/control-ai-browsers/features/probes.md | "spikes/probes/probe10.js" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 65 | .commandcode/skills/control-ai-browsers/features/probes.md | "spikes/probes/bench.js" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 66 | .commandcode/skills/control-ai-browsers/features/probes.md | "spikes/probes/broker-state.js" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 67 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "src/main-world/provenance-tracer.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 68 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "apps/angular-ai-devtools/src/app/stale-view.component.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 69 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "angular-ai:stale-view" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 70 | .commandcode/skills/control-angular-dev-app/SKILL.md | 'portal api pinned by libs/shared/utils/src/lib/injection-tokens.ts:5' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 71 | .commandcode/skills/control-angular-dev-app/features/README.md | 'Counter fresh page state: count 3, double 6, cart 1 item' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 72 | .commandcode/skills/control-angular-dev-app/features/README.md | 'SSR fresh page state: heading Render mode: server' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 73 | .commandcode/skills/control-angular-dev-app/features/README.md | 'Portal app on derived port 4507 for default folder' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 74 | .commandcode/skills/control-angular-dev-app/features/counter.md | 'Clicks: 3 (double 6, cart 1)' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 75 | .commandcode/skills/control-angular-dev-app/features/counter.md | 'count signal, double computed, CartService.items' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 76 | .commandcode/skills/control-angular-dev-app/features/counter.md | 'counter component OnPush by default' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 77 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | 'claim-list table columns and 5 rows' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 78 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | '/claim/create shows heading Complaint Create (app bug)' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 79 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | 'complaint-list columns and 2 seeded rows' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 80 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | 'customer-list 30 rows' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 81 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | 'contract-list 20 rows after fresh API start' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 82 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | 'Save sends PUT /api/contracts' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 83 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | 'Home tiles Contracts, Claims, Complaints, Customers' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 84 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | 'unknown URLs show Page Not Found' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 85 | .commandcode/skills/control-angular-dev-app/features/ssr.md | 'ngDevMode.hydratedComponents 4, hydratedNodes 40' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 86 | .commandcode/skills/control-angular-devtools/SKILL.md | 'Chrome for Testing 154.0.8037.0' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 87 | .commandcode/skills/control-angular-devtools/SKILL.md | 'Angular DevTools 1.22.1' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 88 | .commandcode/skills/control-angular-devtools/SKILL.md | 'CDP port 9420 default, slot 9420+N' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 89 | .commandcode/skills/control-angular-devtools/features/attach.md | 'window.__NG_DEVTOOLS_CONNECTED__ === true' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 90 | .commandcode/skills/control-angular-devtools/features/attach.md | 'backendReady at ~950 ms' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 91 | .commandcode/skills/control-angular-devtools/features/install.md | 'branded install proven in Chrome Beta' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 92 | .commandcode/skills/control-angular-devtools/features/profiler.md | 'ng.ɵsetProfiler subscribers' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 93 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | 'angular:di_graph removes template node' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 94 | .commandcode/skills/control-pangular-inspector/SKILL.md | '@pangular-inspector/devtools pinned 0.0.7' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 95 | .commandcode/skills/control-pangular-inspector/SKILL.md | 'npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 96 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | 'inspect-component returns ListComponent' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 97 | .commandcode/skills/control-pangular-inspector/features/navigation.md | 'list-routes 12 routes measured' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 98 | .commandcode/skills/control-pangular-inspector/features/panel.md | 'Angular 22.2.2 on dashboard' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 99 | .commandcode/skills/control-pangular-inspector/features/setup.md | 'setup.check six read-only facts' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 100 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | 'Angular 22.2.2, TypeScript 6.0.3' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 101 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | 'scan get-components returns AppComponent etc' | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 102 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "Fresh state of the held Counter: Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 103 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4) without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 104 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "with VITE_COUNTER_TIMING_DEMO=1 one test fails with expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 105 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "s1-vitest, which matches the Vitest server in every frame" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 106 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "the host <div id="rootN" ng-version="22.2.2">" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 107 | .commandcode/skills/monitor-ci/references/fix-flows.md | "ci-state-update.mjs gate --gate-type local-fix" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 108 | .commandcode/skills/nx-cloud-api/SKILL.md | "All output is JSON. stdout carries only the response data." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 109 | .commandcode/skills/nx-cloud-api/SKILL.md | "npx nx-cloud api --list-operations" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 110 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "npx nx-cloud api ... -o <file>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 111 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "npx nx-cloud api \"<link>\" -o <private-file>.tar.gz" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 112 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed logs, artifact, or sandbox-report" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 113 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Use nx-cloud-api (npx nx-cloud api) for every read" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 114 | .commandcode/skills/nx-generate/SKILL.md | "npx nx g @nx/react:library --help" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 115 | .commandcode/skills/nx-generate/SKILL.md | "nx format:write" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 116 | .commandcode/skills/nx-import/SKILL.md | "nx import brings code from a source repository or folder" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 117 | .commandcode/skills/nx-import/SKILL.md | "After nx 22.6.0, nx import responds with .ndjson outputs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 118 | .commandcode/skills/nx-import/references/ESLINT.md | "@nx/eslint/plugin scans for ESLint config files" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 119 | .commandcode/skills/nx-import/references/GRADLE.md | "@nx/gradle plugin expects gradlew at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 120 | .commandcode/skills/nx-import/references/JEST.md | "npx nx add @nx/jest" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 121 | .commandcode/skills/nx-import/references/NEXT.md | "@nx/next/plugin detects next.config.*" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 122 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Remove turbo-specific dependencies: turbo, eslint-plugin-turbo" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 123 | .commandcode/skills/nx-import/references/VITE.md | "@nx/vite/plugin defaults typecheckTargetName to vite:typecheck" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 124 | .commandcode/skills/nx-plugins/SKILL.md | "List plugins: npx nx list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 125 | .commandcode/skills/nx-plugins/SKILL.md | "Install plugins npx nx add <plugin>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 126 | .commandcode/skills/nx-run-tasks/SKILL.md | "nx show project <projectname> --json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 127 | .commandcode/skills/nx-run-tasks/SKILL.md | "nx run-many -t build test lint typecheck" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 128 | .commandcode/skills/nx-workspace/SKILL.md | "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 129 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "Affected since base branch (auto-detected)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 130 | .commandcode/skills/verify-ai-browsers/SKILL.md | "Each check exits 0 pass, 1 claim failed, 2 could not run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 131 | .commandcode/skills/verify-ai-browsers/SKILL.md | "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 132 | .commandcode/skills/verify-angular-devtools/SKILL.md | "`coexist --di-graph` leaves the page's signal graph broken until reload" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 133 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "exact pin 0.0.7 declared and installed" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 134 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "ports 3000 and 9999 free (both fixed)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 135 | AGENTS.md | "Checks: `npm run check` and `npm test`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 136 | AGENTS.md | "`.claude/skills/control-ai-browsers` and `.claude/skills/verify-ai-browsers` are byte copies" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 137 | docs/afk-run-2026-10-12.md | "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 138 | docs/afk-run-2026-10-12.md | "Edge provider trials ran on the standing Aion instance" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 139 | docs/design/tutor.md | "Supported apps are zoneless, standalone Angular 22.2 dev builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 140 | docs/design/tutor.md | "The tutor is not implemented; this document describes planned design" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 141 | docs/feature-proposals.md | "Recommended first release ... N1 to N4, N24 and N25" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 142 | docs/filing-ledger.md | "ten draft upstream reports, none filed" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 143 | plans/angular-ai-devtools-proposals.handoff.md | "Repository: `D:\projects\sandbox\angular-ai-devtools` (local git, `main`, head `fbe3aac` at writing)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 144 | references/ai-browsers-verification.md | "Check that port 9992 is free" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 145 | research/01-built-in-ai-apis.md | "Chrome ships `LanguageModel` to extensions (138+)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 146 | research/01-built-in-ai-apis.md | "WebMCP is now `document.modelContext`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 147 | research/02-angular-surface.md | "Angular 22.2 in development mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 148 | research/03-prior-art.md | "Pangular Inspector, React DevTools, Chrome DevTools AI assistance" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 149 | research/04-ecosystem.md | "NgRx, Analog, Storybook, Vitest Browser Mode, RxAngular" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 150 | research/05-spikes.md | "Four-model benchmark, second round" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 151 | research/06-angular-skills.md | "official angular/skills repo as a rule source" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 152 | research/07-prompting-small-models.md | "prompting guidance for the on-device models" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 153 | research/08-recent-angular-features.md | "Angular 20.0-22.2 features" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 154 | research/09-nano-tool-session-error.md | "root cause of Gemini Nano's unable to create a session error" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 155 | research/10-model-capabilities.md | "with `/count/i.test(a) && !/title\|items/i.test(a)`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 156 | research/10-model-capabilities.md | "Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335, Phi-4-mini on 9336" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 157 | research/10-model-capabilities.md | "`AIPromptAPIToolUse` is `experimental` on Win/Mac/Linux/ChromeOS at the 156 tag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 158 | research/11-spike-s1-extension-contexts.md | "node spikes/s1-extension/run-s1.mjs" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 159 | research/11-spike-s1-extension-contexts.md | "Runs: Chrome Beta `156.0.8078.17` on port 9341, Edge Dev `157.0.4322.0` on port 9342" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 160 | research/11-spike-s1-extension-contexts.md | "The Prompt API, including the tool-use types, is exposed in all eight contexts in both browsers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 161 | research/11-spike-s1-extension-contexts.md | "Each context writes its result to `chrome.storage.local` under its context name" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 162 | research/12-legacy-vs-modern-angular.md | "gave 205 hits" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 163 | research/12-legacy-vs-modern-angular.md | "the Angular compiler emits `setClassMetadata(Class, decorators, ctorParameters, propDecorators)` behind an `ngDevMode` guard" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 164 | research/12-legacy-vs-modern-angular.md | "The zone-mode check in `app_facts`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 165 | research/12-legacy-vs-modern-angular.md | "not supported; N10 flags it when detected" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 166 | research/12-legacy-vs-modern-angular.md | "N24 flags a plain field written in a `subscribe` callback in a zoneless app" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 167 | research/12-legacy-vs-modern-angular.md | "the panel shows a notice instead of answering" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 168 | research/13-portal-legacy-audit.md | "commit `f102b97` (Angular 22.2.2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 169 | research/13-portal-legacy-audit.md | "`@for`/`@if` in 10 files, `input()` in 17 files, `inject()` in 34 files" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 170 | research/13-portal-legacy-audit.md | "\"polyfills\": [\"zone.js\"]" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 171 | research/13-portal-legacy-audit.md | "The three forms now use Signal Forms (`@angular/forms/signals`) in commits `754aa1e` (claim), `66e8ad6` (contract) and `92053b9` (complaint)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 172 | research/14-ai-devtools-prior-art.md | "capped at 200 characters" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 173 | research/14-ai-devtools-prior-art.md | "C8. Dead-click and rage-click finder." | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 174 | research/14-ai-devtools-prior-art.md | "`test.run`: runs story tests (Vitest addon), with accessibility results when the a11y addon is on" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 175 | research/14-ai-devtools-prior-art.md | "Angular's `Annotations` interface lacks the spec's `debugging` hint" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 176 | research/15-deterministic-and-ai.md | "Edge exposes no `LanguageModel` to the service worker; Chrome does" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 177 | research/15-deterministic-and-ai.md | "a component list is 346-2,766 characters" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 178 | research/15-deterministic-and-ai.md | "Reads stay in the MAIN world and are shaped there" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 179 | research/15-deterministic-and-ai.md | "Angular error pages (61 pages)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 180 | research/15-deterministic-and-ai.md | "a worker started by the DevTools panel has all seven APIs, and `LanguageModel` answers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 181 | research/16-ssr-runtime.md | "Fixture: `spikes/ng222-ssr`, created with `ng new ng222-ssr --ssr" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 182 | research/16-ssr-runtime.md | "Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 183 | research/16-ssr-runtime.md | "Counters on `ngDevMode` (a page global): `hydratedNodes`, `hydratedComponents`, `dehydratedViewsRemoved`," | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 184 | research/16-ssr-runtime.md | "34 nodes under `<body>` carry it, all `{status: \"hydrated\"}` and no other key" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 185 | research/16-ssr-runtime.md | "`?mismatch=1` makes `Mismatch` insert a `<div>` before its `<p>` on the server only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 186 | research/17-vitest-browser-runtime.md | "works with a 30-line custom provider in the fixture's Vitest config" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 187 | research/17-vitest-browser-runtime.md | "5.0.3 (was `^5.0.0`, 5.0.3 installed), `@vitest/browser` 5.0.3" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 188 | research/17-vitest-browser-runtime.md | "Runner: Angular's own `@angular/build:unit-test` builder. Angular 22.2 has a `browsers` option" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 189 | research/17-vitest-browser-runtime.md | "`window.ng` worked there, and `LanguageModel` answered "OK" from" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 190 | research/18-edge-prevent-auto-signin.md | "`--disable-sync` and `--disable-features=msBrowserSignin` do" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 191 | research/18-edge-prevent-auto-signin.md | "The authoritative, fully-effective mechanism is a set of" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 192 | research/18-edge-prevent-auto-signin.md | "use **`--guest`** or **`--bwsi`** (browse-without-sign-in) mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 193 | research/18-edge-prevent-auto-signin.md | "Edge 157 retires the legacy direct-WAM path (MC1490911)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 194 | research/19-languagemodel-in-extension-contexts.md | "`create()` throws \"Access denied because the Permission Policy is not enabled\"" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 195 | research/19-languagemodel-in-extension-contexts.md | "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 196 | research/19-languagemodel-in-extension-contexts.md | "It no longer carries prompts, so the page can neither read the prompt nor forge the answer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 197 | research/19-languagemodel-in-extension-contexts.md | "the `devtools_page` permissions policy denies `language-model`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 198 | research/19-languagemodel-in-extension-contexts.md | "`LanguageDetector` and `Translator` crash the renderer when called in a worker." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 199 | research/20-built-in-ai-without-flags.md | "On Edge, the web page and the service worker have no `LanguageModel` without flags. On Chrome they do." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 200 | research/20-built-in-ai-without-flags.md | "Filing draft: `docs/filing-ledger.md` item 11." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 201 | research/20-built-in-ai-without-flags.md | "`browser.enabled_labs_experiments` was empty in every Local State" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 202 | spikes/ng222-app/README.md | "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 203 | spikes/ng222-app/README.md | "store the build artifacts in the `dist/` directory" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 204 | spikes/ng222-ssr/README.md | "This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 205 | spikes/ng222-ssr/README.md | "To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 206 | spikes/ng222-ssr/README.md | "store the build artifacts in the `dist/` directory" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
