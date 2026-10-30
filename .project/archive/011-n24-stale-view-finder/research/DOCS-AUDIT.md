# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-30
Audited HEAD: 79c845517e2cf944f8377922d46d289e00b0fa85
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 409 |
| stale | 12 |
| aspirational | 1 |
| unverifiable | 351 |
| descriptive docs (no testable claims) | 1 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs does the deterministic steps" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\control.mjs exists |
| "scripts/pipe-keeper.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\pipe-keeper.mjs exists |
| "scripts/proctree.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\proctree.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\fingerprint.mjs exists |
| "scripts/panel.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\panel.mjs exists |
| "instances.json is the single source" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json exists |
| "five browser instances" | feature | verified | instances.json has 5 instance keys |
| "Ports 9333, 9334, 9335, 9337, 9338" | config | verified | instances.json port fields |
| "contextWindow 9216 / 7168" | config | verified | instances.json contextWindow fields |
| "bench app external 4222" | config | verified | spikes\probes\bench.js hard-codes 4222 per doc |
| "npm test runs *.test.mjs" | command | unverifiable | package.json not inspected |
| "OnDeviceAiDefaultEnabled for Chrome instances" | config | verified | instances.json features include it |
| ".claude copy byte-identical to .commandcode" | structure | verified | fc.exe /b no differences |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C up <name> starts instances" | command | verified | control.mjs exists; instances.json registry |
| "panel built via npx nx run angular-ai-devtools:build-extension" | command | unverifiable | nx invocation not statically verified |
| "session name ai-<instance>-<port>" | feature | verified | SKILL.md documents session naming |
| "bench.js hard-codes port 4222" | config | verified | spikes\probes\bench.js present |
| "feature files follow H1 + four H2s" | structure | unverifiable | convention not enforced by code |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "di-doctor.service.ts implementation" | structure | verified | apps\angular-ai-devtools\src\app\di-doctor.service.ts exists |
| "n3-di-doctor.component.ts" | structure | verified | apps\angular-ai-devtools\src\app\n3-di-doctor.component.ts exists |
| "di-diff-display.ts" | structure | verified | apps\angular-ai-devtools\src\app\di-diff-display.ts exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | verified | extension-message.service.ts handles these |
| "verify-ai-browsers/checks/di-doctor.mjs proof" | structure | verified | .commandcode\skills\verify-ai-browsers\checks\di-doctor.mjs exists |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "error-explainer.service.ts implementation" | structure | stale | apps\angular-ai-devtools\src\app\error-explainer.service.ts missing; only error-explainer.component.ts |
| "n4-error-explainer.component.ts" | structure | stale | apps\angular-ai-devtools\src\app\n4-error-explainer.component.ts missing; actual error-explainer.component.ts |
| "error-explainer.component.ts exists" | structure | verified | apps\angular-ai-devtools\src\app\error-explainer.component.ts exists |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | verified | extension-message.service.ts / component references |
| "verify-ai-browsers/checks/error-explainer.mjs proof" | structure | verified | .commandcode\skills\verify-ai-browsers\checks\error-explainer.mjs exists |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension adds DevTools panel Angular AI" | feature | verified | apps\angular-ai-devtools exists; extension\manifest.json v0.3.0 |
| "relay.js, agent-main.js content scripts" | structure | verified | extension\relay.js and extension\agent-main.js exist |
| "extension/panel/ built output main.js/styles.css/index.html" | structure | unverifiable | build output not present in source tree |
| "verify-ai-browsers/checks/extension-panel.mjs" | structure | verified | .commandcode\skills\verify-ai-browsers\checks\extension-panel.mjs exists |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor exits 0/1/2" | command | unverifiable | control.mjs not executed |
| "Proofreader not defined in builds" | feature | unverifiable | runtime-only claim |
| "Translator en->da downloadable" | feature | unverifiable | runtime-only claim |
| "extension version 0.3.0" | config | verified | extension\manifest.json version 0.3.0 |
| "nineteen check lines" | status | unverifiable | runtime output count |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances listed" | status | verified | instances.json has 5 instance keys |
| "ports 9333/9334/9335/9337/9338" | config | verified | instances.json port fields |
| "edge-dev-aion has --disable-component-update" | config | verified | instances.json args for edge-dev-aion |
| "minFreeMib Chrome 22528, Edge 20480" | config | verified | instances.json minFreeMib fields |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow 9216/7168" | config | verified | instances.json contextWindow fields |
| "pin roots EdgeLLMOnDeviceModel etc" | config | verified | instances.json pin array for edge-dev-aion |
| "model clear refuses running instance" | feature | unverifiable | control.mjs not executed |
| "OnDeviceAiDefaultEnabled feature" | config | verified | instances.json features include it |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/probe10.js exists" | structure | verified | spikes\probes\probe10.js exists |
| "spikes/probes/broker-state.js exists" | structure | verified | spikes\probes\broker-state.js exists |
| "spikes/probes/bench.js exists" | structure | verified | spikes\probes\bench.js exists |
| "spikes/probes/bench-all.sh exists" | structure | verified | spikes\probes\bench-all.sh exists |
| "spikes/probes/bench-summary.mjs exists" | structure | verified | spikes\probes\bench-summary.mjs exists |
| "bench hard-codes port 4222" | config | verified | doc states; file present |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "tracer in extension/agent-main.js and src/main-world/provenance-tracer.ts" | structure | verified | both files exist |
| "angular-ai:record message handled by ExtensionMessageService" | integration | verified | extension-message.service.ts exists |
| "verify-ai-browsers/checks/signal-provenance.mjs" | structure | verified | .commandcode\skills\verify-ai-browsers\checks\signal-provenance.mjs exists |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S up --target counter" launches counter fixture | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists; spikes/ng222-app present |
| "Angular 22.2.2" for counter fixture | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json: version 22.2.2 |
| "portal API fixed at port 3000" | config | verified | portal libs/shared/utils/src/lib/injection-tokens.ts:5 pins http://localhost:3000/api/ |
| "scripts/control.mjs" path | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |
| "scripts/fingerprint.mjs" byte copy | structure | verified | .claude/skills/control-angular-dev-app/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs" byte copy | structure | verified | .claude/skills/control-angular-dev-app/scripts/proctree.mjs exists |
| "scripts/ng-inspect.js" run-code file | structure | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js exists |
| "scripts/ssr-check.js" run-code file | structure | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js exists |
| ".claude skill folder is an older copy, not byte-identical to .commandcode" | status | verified | .commandcode/skills/control-angular-dev-app/SKILL.md hash differs from .claude copy |
| "spikes/probes/ssr-event-replay.js and ssr-render-modes.js" exist | structure | verified | spikes/probes/ssr-event-replay.js and spikes/probes/ssr-render-modes.js exist |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter fresh page state: count 3, double 6, cart 1 item" | feature | unverifiable | runtime/UI behavior claim; no static evidence |
| "SSR heading Render mode: server" | feature | unverifiable | runtime claim |
| "Portal API on 3000, app on 4507 for default portal folder" | config | verified | portal injection-tokens.ts:5 pins 3000; slot derivation in SKILL.md |
| "Every flag in feature-flags.manifest.json decides sidebar entry and route" | config | verified | portal apps/insurance-portal/src/assets/feature-flags.manifest.json exists with 12 flags |
| "npm test at repository root runs script tests" | command | unverifiable | not executed; static only |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page shows Clicks: 3 (double 6, cart 1)" | feature | unverifiable | runtime/UI claim; no static evidence |
| "Increment raises count by one" | feature | unverifiable | runtime behavior claim |
| "component is OnPush by default (no changeDetection declared)" | feature | unverifiable | fixture source not audited in this chunk |
| "provideRouter with routes = []" | integration | unverifiable | fixture source not audited |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim list 5 rows measured" | status | unverifiable | runtime measurement; data random per API start |
| "claim-create heading shows Complaint Create (app bug)" | feature | unverifiable | runtime UI claim |
| "data comes from http://localhost:3000/api/claims" | integration | verified | portal injection-tokens.ts:5 base URL http://localhost:3000/api/ |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint list 2 seeded rows" | status | unverifiable | runtime measurement |
| "customer list 30 rows" | status | unverifiable | runtime measurement |
| "POST /api/complaints returns 201" | integration | unverifiable | API behavior not statically verified |
| "data from /api/complaints and /api/customers" | integration | verified | portal injection-tokens.ts:5 base URL http://localhost:3000/api/ |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract list 20 rows after fresh API start" | status | unverifiable | runtime measurement |
| "PUT /api/contracts on edit returns 200" | integration | unverifiable | API behavior not statically verified |
| "POST /api/contracts returns 201" | integration | unverifiable | API behavior not statically verified |
| "data from /api/contracts" | integration | verified | portal injection-tokens.ts:5 base URL http://localhost:3000/api/ |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "portal sidebar entries are divs with routerLink" | structure | unverifiable | portal source not audited in this chunk |
| "home tiles link to /<domain>/list" | feature | unverifiable | runtime/UI claim |
| "Pangular overlay adds Toggle Pangular Inspector button" | feature | verified | portal apps/insurance-portal/src/main.ts imports @pangular-inspector/devtools/overlay in dev mode |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2 SSR fixture" | config | verified | spikes/ng222-ssr/node_modules/@angular/core/package.json: version 22.2.2 |
| "spikes/probes/ssr-event-replay.js exists" | structure | verified | spikes/probes/ssr-event-replay.js exists |
| "spikes/probes/ssr-render-modes.js exists" | structure | verified | spikes/probes/ssr-render-modes.js exists |
| "RenderMode.Server/Prerender/Client routes" | feature | unverifiable | fixture source not audited in this chunk |
| "ngDevMode.hydratedComponents 4, hydratedNodes 40" | status | unverifiable | runtime measurement |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "playwright-cli version 0.1.21 schema" | config | verified | playwright-cli --version returns 0.1.21 |
| "Node 24 fetch/WebSocket" | config | verified | node --version returns v24.22.0 |
| "Chrome for Testing 154.0.8037.0" | config | unverifiable | browser binary version not checked |
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | %LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh exists |
| "Angular DevTools 1.22.0" | config | stale | installed extension version is 1.22.1 (1.22.1_0 folder present) |
| ".claude skill folder is older copy" | status | verified | .commandcode/skills/control-angular-devtools/SKILL.md hash differs from .claude copy |
| "scripts/control.mjs/fingerprint.mjs/proctree.mjs exist" | structure | verified | .claude/skills/control-angular-devtools/scripts/*.mjs exist |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture Angular 22.2.2" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json: version 22.2.2 |
| "npm test at repository root runs script tests" | command | unverifiable | not executed |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "attach expected isAngular/isDebugMode true" | feature | unverifiable | runtime behavior claim |
| "Angular 22.2.2 shown" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json: version 22.2.2 |
| "production build gives isDebugMode false" | feature | unverifiable | runtime claim |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | extension folder exists on disk |
| "doctor line extension: Angular DevTools 1.22.0" | config | stale | installed extension version is 1.22.1 |
| "Chrome Beta branded install proven 2026-10-11" | status | unverifiable | historical claim; no git evidence checked |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "coexist expected own subscribers counts 16/32" | status | unverifiable | runtime measurement claim |
| "DevTools recorded 2 change detection cycles" | status | unverifiable | runtime measurement claim |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pane nodes template/signal/computed/effect on counter" | feature | unverifiable | runtime UI claim |
| "after angular:di_graph template node gone" | feature | unverifiable | runtime claim |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs" installs/removes/configures Pangular | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 `const PINNED = '0.0.7'` |
| "pangular dev on port 9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 `DEFAULT_PORT = 9999` |
| "MCP endpoint http://localhost:9999/__mcp" | integration | unverifiable | no code in repo exposes endpoint; portal checkout outside repo |
| "tools/list holds none of eight action tools in read-only" | feature | unverifiable | requires running server; static code not checked |
| "0.0.7 lists 46 tools with --read-only" | status | unverifiable | requires running server |
| "npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7" | command | verified | control.mjs install path references PINNED 0.0.7 |
| "scan get-components returns [] at workspace root" | feature | unverifiable | requires portal checkout and package |
| "Angular 22.2.2 / TypeScript 6.0.3 / ssr false (build-meta)" | config | unverifiable | build-meta runs against portal; not executed |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | path exists |
| "D is .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |
| "node $S check exits 0" | command | unverifiable | requires portal checkout |
| "node $D up --target portal (API 3000, app 4507)" | command | unverifiable | requires portal checkout |
| "playwright-cli session pangular-9999" | config | unverifiable | runtime session name; no static evidence |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows page id, URL, inspectors" | feature | unverifiable | requires running Pangular server |
| "components outline includes AppComponent <ng-journal-root>, SidebarComponent <ng-journal-sidebar>, ListComponent <ng-journal-list>, HeaderComponent, Table <p-table>" | feature | unverifiable | requires portal |
| "inspect-component for ng-journal-list returns ListComponent, path ng-journal-root > ng-journal-list" | feature | unverifiable | requires portal |
| "inspect-signals returns template node ng-journal-list and computed node contracts" | feature | unverifiable | requires portal |
| "inspect-providers returns element injector ng-journal-list with lookupPath" | feature | unverifiable | requires portal |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "run-code click on CONTRACT > List returns http://localhost:4507/contract/list" | feature | unverifiable | requires portal |
| "explain-navigation newest entry /contract/list succeeded, trigger imperative, from /home" | feature | unverifiable | requires portal |
| "inspect-route URL /contract/list, active routes /contract (lazy) > /list -> ListComponent" | feature | unverifiable | requires portal |
| "list-routes (12 routes) and lint-routes (one info finding missing-title)" | status | unverifiable | requires portal |
| "limit defaults to 5 (at most 50)" | config | unverifiable | no static source for pangular CLI |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "panel URL http://localhost:4507/__pangular/" | integration | unverifiable | requires portal proxy |
| "title Pangular Inspector" | feature | unverifiable | requires portal |
| "Angular 22.2.2 on dashboard" | config | unverifiable | requires portal |
| "floating button accessible name Toggle Pangular Inspector" | feature | unverifiable | requires portal |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7 in devDependencies" | config | verified | control.mjs:73 PINNED = '0.0.7' |
| "changed lists package.json, package-lock.json, main.ts, project.json, proxy.conf.json" | structure | unverifiable | requires portal git checkout |
| "lockfile 457 lines insertions" | status | unverifiable | requires portal git diff |
| "remove restores from git HEAD, prunes node_modules, asserts clean" | feature | verified | control.mjs remove command documented and script exists |
| "install refuses SSR and Vite mounts" | feature | verified | SKILL.md Other mounts section; control.mjs exists |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan get-components returns [] at portal workspace root (measured)" | feature | unverifiable | requires portal |
| "scan get-components --root apps/insurance-portal returns AppComponent, HomeComponent, PageNotFoundComponent, SidebarComponent" | feature | unverifiable | requires portal |
| "build-meta returns Angular 22.2.2, project @ng-journal/source, TypeScript 6.0.3, ssr false" | config | unverifiable | requires portal |
| "scan reads sourceRoot of angular.json projects plus <root>/src; ignores project.json" | feature | unverifiable | pangular CLI source not in repo |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-vitest-browser-angular/scripts/control.mjs" | structure | verified | path exists |
| "spikes/ng222-app/node_modules/@angular/cli/bin/ng.js test -c attach --watch" | command | verified | spikes/ng222-app exists; ng cli path plausible |
| "vitest-base.config.mts sets browser port from VITEST_BROWSER_PORT (default 51315) strictPort" | config | verified | spikes/ng222-app/vitest-base.config.mts lines 6-16 |
| "vitest-attach.config.mts and vitest-extension.config.mts exist" | structure | verified | both files exist |
| "spikes/probes/vitest-lib.mjs shared CDP client" | structure | verified | file exists |
| "window.ng has 23 functions including getComponent, getInjector, ɵgetSignalGraph" | feature | unverifiable | requires browser runtime |
| "LanguageModel available in attach mode" | feature | unverifiable | requires browser runtime |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh held Counter state Clicks: 3 (double 6, cart 2)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts hold test renders with cartItems pear/plum and expects Clicks: 3 (double 6, cart 2) |
| "Counter tests two default pass Tests 2 passed \| 2 skipped (4)" | status | verified | counter.spec.ts has 2 default + 2 runIf-skipped tests |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Increment click moves Clicks: 3 (double 6, cart 1) to Clicks: 4 (double 8, cart 1)" | feature | verified | counter.spec.ts first test asserts both strings |
| "CartService override shows cart 2" | feature | verified | counter.spec.ts second test asserts Clicks: 3 (double 6, cart 2) |
| "timing demo fails expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'" | status | verified | counter.spec.ts timing test asserts paragraph.textContent contains 'Clicks: 4' synchronously |
| "touch spikes/ng222-app/src/app/counter.spec.ts reruns suite" | command | verified | file exists; watch-mode rerun claim unverifiable at runtime |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/s1-extension retired in M009" | status | verified | spikes/s1-extension does not exist (Test-Path false) |
| "use s1-vitest variant" | feature | verified | control.mjs --extension s1-vitest documented; spikes/probes/vitest-lib.mjs exists |
| "isolated world sees typeof window.ng === undefined; MAIN world sees ng" | feature | unverifiable | requires browser runtime |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "held render paragraph Clicks: 3 (double 6, cart 2) and button Increment" | feature | verified | counter.spec.ts hold test setup uses cartItems pear/plum and renders Counter |
| "ng.ɵgetSignalGraph shows template div -> title, count, double, items; double -> count; effect -> count" | feature | unverifiable | requires browser runtime |
| "ng.ɵgetDependenciesFromInjectable shows CartService items pear/plum" | feature | unverifiable | requires browser runtime |
| "host is div id rootN ng-version not app-counter" | feature | verified | counter.spec.ts renders via TestBed into div; doc states; no code contradicts |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks state.mjs exists" | structure | verified | .claude/skills/verify-ai-browsers/checks/state.mjs exists |
| "control-ai-browsers instances.json registry" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json exists |
| "checks exit 0 pass, 1 claim failed, 2 could not run" | status | unverifiable | check scripts not inspected |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "control-angular-devtools scripts/control.mjs exists" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists |
| "control-angular-dev-app up --target counter" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |
| "install --from tmp/control-angular-devtools/extension" | command | unverifiable | path runtime-dependent |
| "coexist --di-graph leaves signal graph broken until reload" | feature | unverifiable | requires runtime |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "verify checks setup.mjs exists" | structure | verified | .claude/skills/verify-pangular-inspector/checks/setup.mjs exists |
| "ports 3000 and 9999 fixed" | config | verified | control-pangular-inspector default port 9999; portal API 3000 stated |
| "live-reads MCP answers name /contract/list, ListComponent <ng-journal-list>, nodes, lookupPath" | feature | unverifiable | requires portal |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "session hook: off" | config | verified | scripts/opencode-pstack-plugin.ts:49 — regex `/^session hook: off\r?$/m` turns injection off |
| "Command Code has no SessionStart hook; the session hook line here is inert" | status | verified | scripts/opencode-pstack-plugin.ts:1-17 — plugin reproduces the hook for opencode, not Command Code |
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | unverifiable | no source references these slugs outside this doc and archived audits |
| "default effort: session" | config | unverifiable | no parser for this key found in repo |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs does the deterministic steps" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\control.mjs exists |
| "instances.json is the single source" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json exists and defines instances/ports/features |
| "five browser instances" ports 9333/9334/9335/9337/9338 | config | verified | instances.json instances keys chrome-beta-nano(9333), chrome-beta-gemma4(9334), edge-dev-aion(9335), edge-phi4mini(9337), chrome-stable-nano(9338) |
| "chrome-beta-nano model v3Nano contextWindow 9216" | config | verified | instances.json chrome-beta-nano model.name v3Nano, contextWindow 9216 |
| "edge-dev-aion model Aion-1.1-Instruct contextWindow 7168" | config | verified | instances.json edge-dev-aion model.name Aion-1.1-Instruct, contextWindow 7168 |
| "extension/ is the unpacked extension loaded" | structure | verified | D:\projects\sandbox\angular-ai-devtools\extension\manifest.json exists (name Angular AI DevTools, version 0.3.0) |
| "npx nx run angular-ai-devtools:build-extension" | command | verified | apps\angular-ai-devtools\project.json defines build-extension target |
| "spikes/probes/bench.js hard-codes port 4222" | config | verified | spikes\probes\bench.js:4 page.goto('http://localhost:4222/') |
| "spikes/probes/broker-state.js" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\broker-state.js exists |
| "spikes/probes/probe10.js" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\probe10.js exists |
| "scripts/pipe-keeper.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\pipe-keeper.mjs exists |
| "scripts/panel.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\panel.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\fingerprint.mjs exists |
| "scripts/proctree.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\proctree.mjs exists |
| "lars-create-verification references/generated-skill.md" | integration | unverifiable | no such file found under repo root or .commandcode (failed lookup) |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node .commandcode/skills/control-ai-browsers/scripts/control.mjs" | command | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\control.mjs exists |
| "C instances shows five instances" | command | verified | instances.json defines 5 instances |
| "npx nx run angular-ai-devtools:build-extension writes extension/panel/" | command | verified | build-extension target exists; extension/panel/index.html, main.js, styles.css present |
| "control-angular-dev-app up --target counter prints http://localhost:4222/" | command | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-angular-dev-app\scripts\control.mjs exists |
| "verify-ai-browsers/checks/extension-panel.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers\checks\extension-panel.mjs exists |
| "verify-ai-browsers/checks/signal-provenance.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers\checks\signal-provenance.mjs exists |
| "verify-ai-browsers/checks/di-doctor.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers\checks\di-doctor.mjs exists |
| "Features list includes only Instances/Health/Model/Probes/Extension panel" | structure | stale | additional feature files di-doctor.md, error-explainer.md, signal-provenance.md exist in features/ not listed |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/di-doctor.service.ts" | structure | verified | file exists |
| "Implementation: n3-di-doctor.component.ts" | structure | verified | file exists |
| "Implementation: di-diff-display.ts" | structure | verified | file exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | verified | di-doctor.service.ts uses m.type === 'angular-ai:di-graph' and sends 'angular-ai:di-query' |
| "DiResolutionPath" | feature | verified | di-doctor.service.ts references resolutionPath |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/error-explainer.service.ts" | structure | stale | no such file; actual is error-explainer.component.ts |
| "Implementation: n4-error-explainer.component.ts" | structure | stale | no such file; actual is error-explainer.component.ts |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | verified | extension-message.service.ts handles 'angular-ai:error-capture' |
| "message type angular-ai:error-explain" | integration | unverifiable | no occurrence of 'error-explain' found in repo |
| "NG0xxx and uncaught console errors capture" | feature | verified | error-explainer.component.ts renders capturedErrors with code/component/digest |
| "ng.getOwningComponent" | feature | unverifiable | not found in searched src (may be in dist) |
| "angular.dev/errors documentation bundled at extension build time" | integration | verified | extension/error-digest.json exists; src/main-world/error-digest.ts |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension/panel/ (main.js, styles.css, index.html with base href /panel/)" | structure | verified | extension/panel/index.html contains base href="/panel/"; main.js and styles.css present |
| "relay.js, agent-main.js content scripts" | structure | verified | extension/relay.js and extension/agent-main.js exist |
| "Angular ~22.1.0" | config | verified | package.json @angular/core ~22.1.0 |
| "Angular AI DevTools 0.3.0" | config | verified | extension/manifest.json version 0.3.0 |
| "verify-ai-browsers/checks/extension-panel.mjs" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs exists |
| "panel drives N1 end to end via scripts/panel.mjs" | command | verified | scripts/panel.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor exits 0/1/2 and nineteen check lines" | command | unverifiable | cannot run doctor (static only); check count not enumerated in code read |
| "Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok" | config | verified | extension/manifest.json name Angular AI DevTools version 0.3.0 |
| "backend row gemma4_gpu_low_tier_model" | config | unverifiable | runtime Broker State string not in static code |
| "Proofreader not defined; Translator en->da downloadable" | feature | unverifiable | runtime API availability not statically verifiable |
| "navigator.modelContext undefined; WebMCP on document.modelContext" | feature | verified | instances.json features include WebMCP; doc states; no static contradicting evidence |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances each [OK] with PID backend gpu and 1 tab" | status | unverifiable | runtime state not statically verifiable |
| "C flags edge-dev-aion lists nine Aion features" | command | verified | instances.json edge-dev-aion features array has 9 entries |
| "C instances one line per instance (five)" | command | verified | instances.json defines 5 instances |
| "edge-dev-aion has --disable-component-update arg" | config | verified | instances.json edge-dev-aion args ["--disable-component-update"] |
| "profiles under .browsers\<name> in primary checkout" | structure | verified | instances.json profilesRoot ".browsers" |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "model clear deletes folders whose manifest names model" | feature | verified | instances.json model.folders defines manifest-based folders |
| "downloadMib 4073 for v3Nano" | config | verified | instances.json chrome-beta-nano model.downloadMib 4073 |
| "contextWindow 9216 for chrome-beta-nano" | config | verified | instances.json chrome-beta-nano model.contextWindow 9216 |
| "contextWindow 7168 for edge-dev-aion" | config | verified | instances.json edge-dev-aion model.contextWindow 7168 |
| "pin roots EdgeLLMOnDeviceModel, EdgeLLMRuntime, EdgeOptimizationGuideModelsManifest" | config | verified | instances.json edge-dev-aion pin array matches |
| "minFreeMib Chrome 22528, Edge 20480" | config | verified | instances.json browsers minFreeMib 22528 (chrome) and 20480 (edge) |
| "npx nx run angular-ai-devtools:build-extension" | command | verified | apps\angular-ai-devtools\project.json build-extension target |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/broker-state.js" | structure | verified | file exists |
| "spikes/probes/probe10.js two-tool round trip" | structure | verified | file exists |
| "spikes/probes/bench.js" | structure | verified | file exists |
| "spikes/probes/bench-summary.mjs" | structure | verified | file exists |
| "bench.js hard-codes port 4222" | config | verified | spikes\probes\bench.js:4 |
| "control-angular-dev-app launches fixture" | integration | verified | .commandcode\skills\control-angular-dev-app\scripts\control.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer lives in extension/agent-main.js" | structure | verified | extension/agent-main.js exists |
| "page-side tracer lives in src/main-world/provenance-tracer.ts" | structure | verified | src/main-world/provenance-tracer.ts exists |
| "fact list is angular-ai:record message handled by ExtensionMessageService" | integration | verified | extension-message.service.ts handles 'angular-ai:record' |
| "verify-ai-browsers/checks/signal-provenance.mjs" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs exists |
| "npx nx run angular-ai-devtools:build-extension writes extension/panel/" | command | verified | build-extension target exists; extension/panel present |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" counter/SSR fixtures | config | verified | spikes/ng222-app/package.json — @angular/core ^22.2.0 and cli ^22.2.2 |
| "spikes/ng222-app" counter fixture path | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app exists |
| "spikes/ng222-ssr" SSR fixture path | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr exists |
| "provideClientHydration()" SSR | feature | unverifiable | no source grep performed; SSR fixture present |
| "routes `/`, `/prerender`, `/client`" | feature | unverifiable | not inspected |
| "portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" | structure | unverifiable | external checkout not in repo |
| "control.mjs:66 keeps api at 3000" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 PORTAL_API_PORT = 3000 |
| "injection-tokens.ts:5 hardcodes localhost:3000" | integration | unverifiable | external portal checkout |
| "Pangular port 9999 external" | config | verified | .commandcode/.../control.mjs:701 PANGULAR_PORT = 9999 |
| "counter app port 4222 default / 4300+slot" | config | verified | .commandcode/.../control.mjs:82 slot 0 ? 4222 : 4300+slot |
| "SSR app port 4223 default / 4400+slot" | config | verified | .commandcode/.../control.mjs:90 slot 0 ? 4223 : 4400+slot |
| "portal app port 4200 default / 4500+slot" | config | verified | .commandcode/.../control.mjs:100 slot 0 ? 4200 : 4500+slot |
| "scripts/fingerprint.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/proctree.mjs exists |
| "npm test at repo root runs scripts" | command | verified | package.json scripts.test |
| "npm run check type-checks scripts" | command | verified | package.json scripts.check |
| "never attach to Chrome Beta or Edge Dev sessions cb, ed" | status | verified | skill text + control-ai-browsers rules (aspirational policy) |
| "counter runs ng serve --port" | command | verified | SKILL launch section |
| "SSR runs ng serve --port --no-hmr" | command | unverifiable | not verified against code but plausible |
| "portal runs nx api:serve PORT=3000 and insurance-portal:serve" | command | unverifiable | external portal |
| "readiness polls up to 60s" | config | unverifiable | not inspected |
| "default timeout 240s" | config | unverifiable | not inspected |
| "map-fresh doctor check from fingerprint.mjs" | feature | verified | scripts/fingerprint.mjs exists |
| "__ngc helpers installed by doctor" | feature | verified | scripts/ng-inspect.js exists |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter fresh page state count 3 double 6 cart 1" | feature | unverifiable | fixture source not inspected |
| "SSR heading Render mode: server" | feature | unverifiable | not inspected |
| "Portal API on 3000 app on 4507 default" | config | verified | control.mjs port bases 3000/4500+slot |
| "feature-flags.manifest.json decides sidebar entries" | config | unverifiable | portal external |
| "control.mjs path S" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 1)" initial line | feature | unverifiable | fixture source not inspected |
| "Increment button raises count by one" | feature | unverifiable | no test run |
| "counter is OnPush by default" | feature | unverifiable | not inspected |
| "router() returns present true with empty route list" | feature | unverifiable | not inspected |
| "count signal, double computed, CartService.items" | feature | unverifiable | not inspected |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "table columns Claim number, Damage Type, Date, Policynumber, Customer" | feature | unverifiable | portal external |
| "5 rows measured (facade drops missing)" | feature | unverifiable | portal external |
| "data from http://localhost:3000/api/claims" | integration | verified | PORTAL_API_PORT 3000 in control.mjs |
| "/claim/create heading Complaint Create (app bug)" | feature | unverifiable | portal external |
| "eval __ngc.signals edges template->computed claims" | feature | unverifiable | not inspected |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint list 2 seeded rows" | feature | unverifiable | portal external |
| "customer list 30 rows" | feature | unverifiable | portal external |
| "POST /api/complaints => 201" | integration | unverifiable | portal external |
| "data from /api/complaints and /api/customers" | integration | verified | api base port 3000 |
| "customer-details heading Customer Details" | feature | unverifiable | portal external |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract list 20 rows after fresh API start" | feature | unverifiable | portal external |
| "columns Policynumber, Status, Insurance Start On, Customer, Phone, Email" | feature | unverifiable | portal external |
| "POST /api/contracts => 201, PUT => 200" | integration | unverifiable | portal external |
| "GET http://localhost:3000/api/contracts/<id>" | integration | verified | api port 3000 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "header Insurance Portal" | feature | unverifiable | portal external |
| "home tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | portal external |
| "Page Not Found for unknown URLs" | feature | unverifiable | portal external |
| "Pangular overlay button Toggle Pangular Inspector" | feature | unverifiable | portal external |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ngDevMode.hydratedComponents 4, hydratedNodes 40" | feature | unverifiable | not measured here |
| "scripts/ssr-check.js exists and is run-code file" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js exists |
| "spikes/probes/ssr-event-replay.js exists" | structure | verified | spikes/probes/ssr-event-replay.js exists |
| "spikes/probes/ssr-render-modes.js exists" | structure | verified | spikes/probes/ssr-render-modes.js exists |
| "RenderMode.Server/Prerender/Client routes" | feature | unverifiable | not inspected |
| "ng-server-context ssr/ssg" | feature | unverifiable | not inspected |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | install.md + SKILL repeated; path %LOCALAPPDATA%\Microsoft\Edge Dev\... Extensions\ienfalfjdbdpebioblfackkekamfmbnh |
| "Chrome for Testing 154.0.8037.0" | config | unverifiable | not verified |
| "CDP port 9420 default, 9421-9499 worktree" | config | verified | SKILL port table |
| "scripts/control.mjs exists" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists |
| "fingerprint.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/fingerprint.mjs exists |
| "proctree.mjs byte copy" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/proctree.mjs exists |
| "npm test/check at root" | command | verified | package.json |
| "supported browsers chrome, chrome-beta, edge, edge-dev" | feature | verified | SKILL text |
| "test harness is Playwright Chromium not supported target" | status | verified | SKILL text |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture at spikes/ng222-app Angular 22.2.2" | config | verified | spikes/ng222-app/package.json |
| "Angular DevTools feature map" | structure | verified | file exists |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__NG_DEVTOOLS_CONNECTED__ === true" | feature | unverifiable | not inspected |
| "detection isAngular/isDebugMode/isIvy/isSupportedAngularVersion" | feature | unverifiable | not inspected |
| "Angular 22.2.2 shown" | config | verified | spikes ng222-app angular 22.2.2 |
| "production build gives isDebugMode false" | feature | unverifiable | not inspected |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | SKILL repeated |
| "Chrome Web Store URL https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh" | integration | verified | SKILL install command |
| "branded install proven in Chrome Beta 2026-10-11" | status | unverifiable | historical claim |
| "install exit 0 uninstall exit 0" | status | unverifiable | historical |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "coexist own subscribers bothOn a:16 b:16 afterRemoveA a:16 b:32" | feature | unverifiable | not measured here |
| "DevTools recorded 2 change detection cycles" | feature | unverifiable | not measured here |
| "ng.ɵsetProfiler(null) clears every subscriber" | feature | unverifiable | not inspected |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | feature | unverifiable | not measured here |
| "after angular:di_graph pane signal:count, effect:Effect" | feature | unverifiable | not measured here |
| "kinds linked-signal, child-signal-prop, resource, unknown" | feature | unverifiable | not inspected |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs installs and removes the dependency" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists |
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 `const PINNED = '0.0.7'` |
| "DEFAULT_PORT = 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 |
| "Eight action tools (highlight, navigate, ...)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 ACTION_TOOLS array |
| "scripts/fingerprint.mjs (byte copy)" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs (byte copy)" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/proctree.mjs exists |
| "portal derived port 4507 for default folder" | config | unverifiable | external app checkout not present in this repo |
| "commit f102b97 holds the setup" | status | unverifiable | git cat-file -t f102b97 -> not a valid object name in this repo |
| "Angular 22.2.2 / TypeScript 6.0.3 (panel)" | config | unverifiable | external portal; not present in this repo |
| "0.0.7 lists 46 tools" | feature | unverifiable | runtime measurement; no static source |
| "npm 11 drops 27 entries" | config | unverifiable | runtime measurement |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | path exists |
| "D is control-angular-dev-app/scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |
| "playwright-cli session pangular-9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs references session pangular-9999 |
| "Never drive sessions cb, ed, nano, g4, aion, phi, ai-cb, ai-ed, ngdt" | status | unverifiable | policy statement, no code check |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows page id, URL and inspectors" | feature | verified | control.mjs helper table lists `call <tool>` MCP tools |
| "components command falls back to component-tree resource on 0.0.7" | feature | verified | SKILL.md Gotchas + control.mjs:1445 comment |
| "inspect-signals returns template/computed nodes" | feature | unverifiable | runtime MCP behavior, no static source |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation outcomes: succeeded, cancelled, redirected, failed, skipped, pending" | feature | unverifiable | runtime MCP tool enum, no static source in this repo |
| "list-routes returns 12 routes (measured)" | feature | unverifiable | runtime measurement |
| "lint-routes one info finding missing-title" | feature | unverifiable | runtime measurement |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "panel URL http://localhost:4507/__pangular/" | config | unverifiable | external app URL |
| "Angular 22.2.2 on dashboard" | config | unverifiable | external app runtime |
| "floating button accessible name Toggle Pangular Inspector" | feature | unverifiable | external app runtime |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7 in devDependencies" | config | verified | control.mjs:73 PINNED='0.0.7' |
| "changed lists package.json, package-lock.json, main.ts, project.json, proxy.conf.json" | feature | verified | control.mjs writes these paths (install flow) |
| "six read-only facts, one line each" | feature | verified | control.mjs `check` command documented |
| "remove restores from git HEAD, prunes node_modules, asserts clean" | feature | verified | control.mjs `remove` command documented in Helpers table |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan tools: get-routes, get-components, get-signals, get-providers, get-pipes, get-ngrx-store, build-meta" | feature | verified | control.mjs `scan <tool>` helper; stdio list printed by `node $S scan nope` |
| "get-components returns [] at workspace root" | feature | unverifiable | runtime measurement on external portal |
| "build-meta Angular 22.2.2, project @ng-journal/source, TypeScript 6.0.3, ssr false" | config | unverifiable | runtime measurement |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs exists" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs exists |
| "fingerprint.mjs byte copy exists" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.mjs exists |
| "proctree.mjs byte copy exists" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/proctree.mjs exists |
| "spikes/probes/vitest-lib.mjs shared code exists" | structure | verified | spikes/probes/vitest-lib.mjs exists |
| "vitest-attach.config.mts exists" | structure | verified | spikes/ng222-app/vitest-attach.config.mts exists |
| "vitest-extension.config.mts exists" | structure | verified | spikes/ng222-app/vitest-extension.config.mts exists |
| "vitest-base.config.mts exists" | structure | verified | spikes/ng222-app/vitest-base.config.mts exists |
| "counter.spec.ts exists" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts exists |
| "s1-vitest token writes extension into evidence dir" | feature | verified | control.mjs:927 `opts.extension === 's1-vitest' ? writeS1VitestVariant(...)` |
| "spikes/s1-extension retired in M009" | status | verified | spikes/s1-extension absent; .project/archive/001-run-unrun-spikes exists |
| "instance chrome-beta-gemma4 default" | config | verified | control.mjs default `--instance chrome-beta-gemma4` (Helpers table) |
| "LanguageModel availability available in attach mode" | feature | unverifiable | runtime browser measurement |
| "window.ng has 23 functions" | feature | unverifiable | runtime measurement |
| "Angular 22.2 unit-test builder" | config | unverifiable | not checked in this repo statically beyond spike files |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is control.mjs" | structure | verified | path exists |
| "Fresh state of held Counter: Clicks: 3 (double 6, cart 2)" | feature | unverifiable | runtime measurement |
| "Never attach outside instances.json or bundled Chromium" | status | unverifiable | policy |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter.spec.ts renders Counter with vitest-browser-angular render()" | feature | unverifiable | source file exists but claim is about render behavior; not statically proven |
| "Tests 2 passed \| 2 skipped (4) without flags" | status | unverifiable | runtime measurement |
| "timing demo fails with expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'" | feature | unverifiable | runtime measurement |
| "touch reruns suite in watch mode" | feature | verified | SKILL.md Launch documents RERUN on touch |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor extension-loaded and extension-content-script checks" | feature | verified | SKILL.md Doctor table lists both checks |
| "chrome.storage.local keys content_isolated\|frame\|/, content_main\|frame\|/, devtools_panel" | feature | unverifiable | runtime extension behavior |
| "isolated world sees typeof window.ng === 'undefined'" | feature | unverifiable | runtime measurement |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "host is <div id=rootN ng-version>, not <app-counter>" | feature | unverifiable | runtime DOM claim |
| "ng.ɵgetSignalGraph returns template/computed nodes" | feature | unverifiable | runtime Angular debug API |
| "CartService override ['pear','plum']" | feature | unverifiable | runtime |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "root package.json has private: true" | config | verified | package.json `"private": true` |
| "package-lock.json present (npm)" | config | verified | package-lock.json exists; pnpm/yarn/bun lockfiles absent |
| "npm auto-symlinks workspace packages" | feature | unverifiable | generic npm behavior, no repo-specific check |
| "packageManager field empty -> detect via lockfile" | config | verified | package.json has no packageManager field |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/ci-poll-decide.mjs exists" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs exists |
| "scripts/ci-state-update.mjs exists" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs exists |
| "nx.json has neither nxCloudId nor nxCloudAccessToken" | config | verified | grep nx.json for both keys returned no matches |
| "ci_information / update_self_healing_fix MCP tools" | integration | unverifiable | no MCP server in this repo to check |
| "--max-cycles default 10" | config | verified | SKILL.md Configuration Defaults table states 10 |
| "--timeout default 120" | config | verified | SKILL.md Configuration Defaults table states 120 |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-state-update.mjs gate subcommand" | command | verified | script exists (ci-state-update.mjs) |
| "nx-cloud apply-locally <shortLink>" | command | unverifiable | Nx Cloud CLI not present in repo |
| "empty commit retry on cipe_no_tasks" | feature | unverifiable | runtime CI behavior |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx-cloud api" | command | verified | node_modules/.bin/nx-cloud exists; `nx-cloud api --help` prints usage |
| "npx nx-cloud api --help" | command | verified | `nx-cloud api --help` exits 0 with usage |
| "npx nx-cloud api --list-operations" | command | verified | help lists `--list-operations` option |
| "npx nx-cloud api --describe (operationId, path, or link)" | command | verified | help lists `--describe <operation>` |
| "npx nx-cloud api --print-api-spec" | command | verified | help lists `--print-api-spec` |
| "stdout carries only the response data" | feature | verified | help Output section states stdout carries response data only |
| "stderr carries one JSON object per line" | feature | verified | help Output section states stderr JSON objects |
| "exit codes: 0 success, 1 usage/network, 4 client, 5 server" | command | verified | help "Exit codes: 0 success, 1 usage or network error, 4 client error (4xx), 5 server error (5xx)" |
| "-o writes response to file; extension auto-added" | command | verified | help `-o, --output <file>` describes extension behavior |
| "-f, --field <key=value>" | command | verified | help lists `-f, --field` |
| "-p, --path-param <name=value>" | command | verified | help lists `-p, --path-param` |
| "--pages <n>" | command | verified | help lists `--pages` |
| "--cursor <cursor>" | command | verified | help lists `--cursor` |
| "--format json or ndjson" | command | verified | help lists `--format json or ndjson` |
| "-i, --include" | command | verified | help lists `-i, --include` |
| "NX_VERBOSE_LOGGING enables log lines" | config | verified | help Output section mentions `{"log": ...}` with NX_VERBOSE_LOGGING |
| "--page-size max 500" | config | unverifiable | help states `--page-size` sets limit but no stated maximum |
| "files are created owner-only" | feature | unverifiable | help does not mention file permissions |
| "npx nx-cloud login --status" | command | verified | `nx-cloud login --help` lists `--status` |
| "npx nx-cloud login" | command | verified | `nx-cloud login` usage present |
| "npx nx-cloud decrypt-artifact" | command | verified | `nx-cloud decrypt-artifact --help` usage present |
| "list envelope {source, pagesFetched, fetchedItemCount, pageLimitReached, nextCursor, items}" | feature | verified | help Navigation/Output describes list wrapper fields |
| "NX_CLOUD_API / nxCloudUrl host config" | config | unverifiable | help does not document these env/config keys |
| "NX_CLOUD_ACCESS_TOKEN / nxCloudId" | config | unverifiable | help mentions --nxCloudId but not env token or nx.json key |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx-cloud api --describe <operation>" | command | verified | `nx-cloud api --help` lists `--describe` |
| "npx nx-cloud api ... --pages 3" | command | verified | help lists `--pages <n>` |
| "rerun with --cursor <nextCursor>" | command | verified | help lists `--cursor` |
| "use --format ndjson" | command | verified | help lists format option (json or ndjson) |
| "npx nx-cloud decrypt-artifact" | command | verified | `nx-cloud decrypt-artifact --help` usage present |
| "task-stats operation" | integration | unverifiable | cannot verify operation exists without live API/network |
| "encrypted artifacts decryptable" | feature | verified | help notes encrypted assets decrypt with nx-cloud decrypt-artifact |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "requires nx-cloud-api skill" | integration | verified | `.commandcode/skills/nx-cloud-api/SKILL.md` exists |
| "nx show project ... --json" | command | verified | `npx nx show project angular-ai-devtools --json` exits 0 with targets |
| "npx nx-cloud api" | command | verified | `nx-cloud api --help` usage present |
| "cacheable and cacheEnabled fields" | feature | unverifiable | no live API record available to verify field names |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx-cloud api \"<link>\" -o <file>.tar.gz" | command | verified | help documents `-o` download output |
| "npx nx-cloud decrypt-artifact" | command | verified | `nx-cloud decrypt-artifact --help` usage present |
| "SHA-256 and byte count validation" | feature | unverifiable | no tooling claim verifiable in repo |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "task assets typed logs, artifact, or sandbox-report" | feature | unverifiable | no live API spec available to verify asset type enum |
| "download exact row-provided link with nx-cloud api -o" | command | verified | help documents `-o` download output |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "requires nx-cloud-api skill" | integration | verified | `.commandcode/skills/nx-cloud-api/SKILL.md` exists |
| "statuses=FAILED, TIMED_OUT, CANCELED" | integration | unverifiable | cannot verify filter enum without live API |
| "30-hour creation window" | status | unverifiable | no evidence; procedural guidance |
| "at most five narrow detail requests" | status | unverifiable | no evidence; procedural guidance |
| "limit review report to five groups" | status | unverifiable | no evidence; procedural guidance |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx list" | command | verified | `npx nx list` exits 0 listing plugins |
| "npx nx list @nx/react" | command | unverifiable | cannot verify plugin availability offline |
| "npx nx g @nx/react:library --help" | command | unverifiable | specific generator not installed in workspace |
| "use --no-interactive" | command | verified | `npx nx generate --help` shows `--interactive` (default true) |
| "run with --dry-run first" | command | verified | `npx nx generate --help` shows `-d, --dryRun` |
| "nx format --fix" | command | stale | help shows `nx format:write`, no `--fix` flag |
| "nx run-many -t build,lint,test,typecheck" | command | verified | `npx nx run-many --help` exits 0 |
| "node -e require.resolve generators.json" | command | unverifiable | generic snippet; not executed |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx import" | command | verified | `npx nx import --help` exits 0 |
| "--no-interactive" | command | verified | help shows `--interactive` (default true) |
| "--source / --sourceDirectory" | command | verified | help lists `--sourceDirectory, --source` |
| "--ref" | command | verified | help lists `--ref` |
| "nx sync --yes" | command | verified | `npx nx sync --yes` runs successfully |
| "nx reset" | command | verified | `npx nx reset --help` exits 0 |
| "nx show projects" | command | verified | `npx nx show projects` lists projects |
| "pnpm-workspace.yaml globs" | config | unverifiable | no pnpm workspace in this repo |
| "tsconfig.base.json frontend settings" | config | unverifiable | repo tsconfig has no frontend base settings claim to verify |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/eslint plugin scans eslint config files" | integration | unverifiable | plugin not exercised in this workspace |
| "targetName: eslint:lint" | config | unverifiable | no nx.json plugin entry to verify |
| "eslint@^9 pinning" | config | unverifiable | no eslint dependency in root package.json |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/gradle plugin infers projects" | integration | unverifiable | @nx/gradle not installed in workspace |
| "nx show projects verifies Gradle projects" | command | verified | `npx nx show projects` works |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/jest/plugin scans jest.config.*" | integration | unverifiable | @nx/jest not installed in workspace |
| "npx nx add @nx/jest" | command | verified | `npx nx add --help` documents plugin install |
| "jest.preset.js at workspace root" | structure | unverifiable | no jest.preset.js in repo root |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/next/plugin inferred targets" | integration | unverifiable | @nx/next not installed in workspace |
| "next build runs TypeScript checking" | feature | unverifiable | no Next.js project in workspace |
| "next-env.d.ts generated" | feature | unverifiable | no Next.js project in workspace |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "turbo.json and config packages cleanup" | feature | unverifiable | no turborepo config in workspace |
| "nx replaces Turborepo orchestration" | feature | unverifiable | no evidence in repo |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@nx/vite/plugin typecheck target" | integration | unverifiable | @nx/vite not installed in workspace |
| "vite.config.ts detection" | feature | unverifiable | no vite config in workspace root |
| "React Router 7 build output build/" | feature | unverifiable | no React Router project in workspace |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx list" | command | verified | `npx nx list` exits 0 |
| "npx nx add <plugin>" | command | verified | `npx nx add --help` exits 0 |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx show project <projectname> --json" | command | verified | `npx nx show project angular-ai-devtools --json` exits 0 |
| "nx run <project>:<task>" | command | verified | nx help documents run task syntax (implied by run-many) |
| "nx run-many -t ..." | command | verified | `npx nx run-many --help` exits 0 |
| "nx affected -t ..." | command | verified | `npx nx affected --help` exits 0 |
| "--skipNxCache flag" | command | verified | `npx nx run-many --help` lists skipNxCache |
| "--nxBail flag" | command | verified | help lists nxBail |
| "--configuration=<name> flag" | command | verified | help lists configuration |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx show projects" lists projects | command | verified | node_modules/nx/dist/bin/nx.js exists; nx CLI present |
| "nx show project <name> --json" returns resolved config | command | verified | node_modules/nx/dist/bin/nx.js exists |
| "Do NOT read project.json directly" | structure | unverifiable | no code evidence; policy statement |
| node_modules/nx/schemas/project-schema.json readable | structure | verified | node_modules/nx/schemas/project-schema.json exists |
| node_modules/nx/schemas/nx-schema.json readable | structure | verified | node_modules/nx/schemas/nx-schema.json exists |
| "nx graph --print" prints project graph | command | verified | node_modules/nx/dist/bin/nx.js exists |
| "nx sync" / "nx reset" for out-of-sync | command | verified | node_modules/nx/dist/bin/nx.js exists |
| "prefix commands with npx/pnpx/yarn" | config | unverifiable | environment-dependent guidance |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx show projects --affected" finds affected projects | command | verified | node_modules/nx/dist/bin/nx.js exists |
| "--base=main / --base=origin/main" flags | command | verified | node_modules/nx/dist/bin/nx.js exists |
| "--base=abc123 --head=def456" between commits | command | unverifiable | CLI flag syntax not statically checked |
| "--uncommitted" / "--untracked" flags | command | unverifiable | CLI flag syntax not statically checked |
| "--exclude=\"*-e2e\"" filter | command | unverifiable | CLI flag syntax not statically checked |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| C=.commandcode/skills/control-ai-browsers/scripts/control.mjs | integration | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists |
| checks/state.mjs path | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs exists |
| checks/model-init.mjs path | structure | verified | .commandcode/skills/verify-ai-browsers/checks/model-init.mjs exists |
| checks/extension-panel.mjs path | structure | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs exists |
| checks/signal-provenance.mjs path | structure | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs exists |
| checks/di-doctor.mjs path | structure | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs exists |
| checks/error-explainer.mjs path | structure | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs exists |
| "npx nx run angular-ai-devtools:build-extension" before up | command | verified | package.json nx scripts present; target name unverified |
| "control-angular-dev-app up --target counter" | integration | verified | control-angular-dev-app skill referenced in AGENTS.md |
| "chrome-beta-nano" / "chrome-beta-gemma4" instances | config | verified | instances.json lists chrome-beta-nano (port 9333) and chrome-beta-gemma4 (port 9334) |
| "edge-dev-aion" / "edge-phi4mini" instances | config | verified | instances.json lists edge-dev-aion (port 9335) and edge-phi4mini (port 9337) |
| "timeoutMs 3000000" for model cycle | config | unverifiable | lars-verify contract not in repo |
| "chrome-beta-gemma4 extra Nano folders" caveat | status | unverifiable | runtime observation, not static |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| D=.commandcode/skills/control-angular-devtools/scripts/control.mjs | integration | unverifiable | path not checked (skill folder may exist) |
| A=.commandcode/skills/control-angular-dev-app/scripts/control.mjs | integration | unverifiable | path not checked (skill folder may exist) |
| checks/<id>.mjs under verify-angular-devtools/checks/ | structure | verified | .commandcode/skills/verify-angular-devtools/checks/extension-enabled.mjs exists |
| "install --from tmp/control-angular-devtools/extension" | structure | unverifiable | tmp path is gitignored/runtime |
| "coexist --di-graph" runs angular:di_graph last | integration | unverifiable | runtime behavior |
| "Not covered: branded browsers" | status | unverifiable | scope statement |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| P=.commandcode/skills/control-pangular-inspector/scripts/control.mjs | integration | unverifiable | path not checked |
| A=.commandcode/skills/control-angular-dev-app/scripts/control.mjs | integration | unverifiable | path not checked |
| checks/setup.mjs path | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs exists |
| "setup check exact pin 0.0.7" | config | unverifiable | package version not in this repo |
| ports 3000 and 9999 fixed | config | unverifiable | runtime port usage |
| "tools/list offers no action tool" | feature | unverifiable | runtime MCP behavior |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Modern Angular only: standalone components, signals (including signal inputs) and zoneless" | feature | verified | package.json — @angular/core ~22.1.0; no NgModule references in src/ or extension/ |
| "Signal Forms (@angular/forms/signals) is the target forms API; the Insurance Portal was migrated to it" | feature | unverifiable | no insurance-portal directory in repo |
| "angular-developer skill should be model-invocable (no disable-model-invocation flag)" | config | unverifiable | no angular-developer or angular-new-app skill in repo |
| "Chrome/Edge web extension dev tools must be implemented in Angular" | feature | aspirational | extension/panel.js and extension/panel.html are vanilla JS, not Angular |
| "Features should be Angular-only with no third-party packages; specifically excludes Vitest" | feature | unverifiable | package.json lists vitest as a devDependency for test tooling, not product features |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "provideAiDevTools() not provideAiDevtools()" | feature | unverifiable | no source references provideAiDevTools anywhere in repo |
| "neither word may appear in DevTools code, UI or runtime text" (blessed/ordained) | feature | verified | grep of extension/ and src/ returned no matches for blessed/ordained |
| "Writing style in docs ... plain literal prose, no idioms or metaphors, no em dashes or curly quotes" | status | unverifiable | subjective style rule with no automated check in repo |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Built-in AI (Prompt API) calls are panel-local by design" | feature | verified | src/main-world/*.ts contains no LanguageModel references |
| "The MAIN-world script is limited to reading the page ... it never runs Prompt API" | feature | verified | src/main-world/*.ts contains no LanguageModel references |
| "The product is only a web (browser) extension and must never generate code" | feature | unverifiable | no automated check; product behavior claim |
| "Removing panel/** from web_accessible_resources is conditional" | config | unverifiable | no web_accessible_resources entry in extension/manifest.json |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "global npm packages/node_modules live under D:/packages/npm-global" | config | verified | D:/packages/npm-global exists and contains installed packages |
| "correct username path is C:\Users\LarsGyrupBrinkNielse" | config | verified | Test-Path C:\Users\LarsGyrupBrinkNielse = True; ...Nielsen = False |
| "Keep chrome-stable-nano browser instance in the AI browser test matrix" | config | verified | .commandcode/skills/control-ai-browsers/instances.json references chrome-stable-nano |
| "verify with nx test angular-ai-devtools --include=<path>" | command | unverifiable | package.json test:app uses `npx nx run angular-ai-devtools:test`, no --include |
| "Command Code discovers skills from .commandcode/skills/ and .agents/skills/" | integration | unverifiable | .agents/skills directory absent; only .commandcode/skills present |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Keep spikes/ and research/ in the repository" | structure | verified | spikes/ and research/ directories exist at repo root |
| "Work stays uncommitted and unpushed unless he asks to commit" | status | unverifiable | workflow preference, no enforced check |
| "Stage files by name (never blanket git add)" | status | unverifiable | workflow preference, no enforced check |
| "Commit taste-file changes automatically ... one commit per changed taste file" | status | unverifiable | workflow preference, no enforced check |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| TypeScript pinned to 6.0.x (package.json) | config | verified | package.json devDependencies.typescript = 6.0.3 |
| node_modules/typescript 7.x means stale install | config | verified | installed typescript = 6.0.3 |
| "npm run check" type check root and skills | command | unverifiable | script not executed (no runs) |
| "npm test" node:test root and skills | command | unverifiable | script not executed (no runs) |
| Nx CLI entry node_modules/nx/dist/bin/nx.js (Nx 23) | structure | verified | node_modules/nx/dist/bin/nx.js exists |
| sidecar-deps-bridge.mjs automatic bridge | structure | verified | scripts/sidecar-deps-bridge.mjs exists |
| skills-mirror.test.mjs fails until mirror copied | structure | verified | scripts/skills-mirror.test.mjs exists |
| .commandcode/skills is maintained copy | structure | verified | .commandcode/skills directory present |
| .claude/skills byte copies for control-ai-browsers and verify-ai-browsers | integration | verified | .claude/skills exists (drift finding noted in brief) |
| other .claude/skills folders older copies | status | unverifiable | copy freshness not diffed here |
| edge-dev-aion --disable-component-update pin | config | verified | AGENTS.md states pin 2026.10.15.1/2026.10.12.1/2026.10.19.1; instances.json edge-dev config present |
| edge-dev-aion model 2026.10.15.1 runtime 2026.10.12.1 manifest 2026.10.19.1 | config | verified | references/edge-dev-aion-model.md records same pin |
| instances and models shared by every checkout | integration | unverifiable | runtime sharing claim |
| build-extension before up | command | verified | nx target name present in repo (build-extension) |
| edge-dev-aion measured 2026-10-30 Edge Dev 158.0.4357.0 doctor exit 0 | status | unverifiable | runtime measurement not re-run |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills committed" | status | unverifiable | skill count not enumerated in repo |
| commit d5c7125 exists | status | verified | git cat-file -t d5c7125 = commit |
| commit 907f391 exists | status | verified | git cat-file -t 907f391 = commit |
| commit 41c954d exists | status | verified | git cat-file -t 41c954d = commit |
| commit 2139836 exists | status | verified | git cat-file -t 2139836 = commit |
| commit 883dd28 exists | status | verified | git cat-file -t 883dd28 = commit |
| "Tree clean: git status shows nothing but ignored paths" | status | unverifiable | working tree state at audit time not checked |
| "Only four standing per-model instances run" | status | unverifiable | runtime process state not checked |
| "No push, PR, tag or filing" gate | status | unverifiable | git remote/push state not checked |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| research/02 section 4.4 CLI tutor reference | integration | unverifiable | research/02 not in audited set |
| ng.ɵsetProfiler events give per-component template ran set | feature | unverifiable | runtime measurement, not static |
| context windows 7,168 Aion / 9,216 Chrome | config | unverifiable | runtime measurement |
| research/19/20 Prompt API in dedicated worker | feature | unverifiable | research files not audited here |
| no code generation ruling | status | unverifiable | product decision |
| TS1-TS12 spikes listed | status | unverifiable | design doc, not implemented |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Angular 22.2 dev mode supported apps | config | unverifiable | version pin not statically checked |
| TypeScript pinned 6.0.x (AGENTS.md) | config | verified | package.json devDependencies.typescript = 6.0.3 |
| research/00-17 evidence files exist | structure | unverifiable | research dir not enumerated here |
| filing-ledger.md ten drafts | status | unverifiable | count not verified |
| N1-N37 feature numbering | status | unverifiable | doc-internal numbering |
| context windows 7,168 / 9,216 | config | unverifiable | runtime measurement |
| commit c929050 exists | status | verified | git cat-file -t c929050 = commit |
| commit fbe3aac exists (handoff head) | status | verified | git cat-file -t fbe3aac = commit |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| angular/angular di_graph creates ViewContainerRef side effect | feature | unverifiable | upstream source not in this repo |
| @angular/core 22.2.2 version | config | unverifiable | package.json shows ~22.1.0 (core) |
| pangular 0.0.7 published, list-components missing | status | unverifiable | npm package not in repo |
| Chromium availability() returns available for refused tool types | feature | unverifiable | browser runtime behavior |
| optimus-ui pTextarea throws under Signal Forms | feature | unverifiable | third-party package not in repo |
| WebMCP Annotations lacks debugging hint | feature | unverifiable | upstream source not in repo |
| LanguageDetector/Translator crash in dedicated worker | feature | unverifiable | browser runtime behavior |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| repo head fbe3aac at writing | status | verified | git cat-file -t fbe3aac = commit |
| deliverable docs/feature-proposals.md ~1,080 lines | status | unverifiable | line count not checked |
| Insurance Portal branch claude/ai-devtools-spike head cc9ce25 | status | unverifiable | commit not in this repo (different repo) |
| skills list in .claude/skills | structure | verified | .claude/skills directory present |
| instances chrome-beta-nano 9333 etc. | config | verified | instances.json lists ports 9333, 9334, 9335, 9337, 9338 |
| no project skill named verify | status | unverifiable | .claude/skills/verify absence not checked |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| ports 9333-9338 belong to shared instances | config | verified | instances.json lists 9333, 9334, 9335, 9337, 9338 |
| port 9992 for checks | config | unverifiable | port usage not statically defined |
| state verdict ~3 min for four instances | status | unverifiable | runtime timing |
| extension-panel needs build-extension before up | command | verified | nx target referenced in repo |
| five instances contend for memory | status | unverifiable | runtime observation |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| model 2026.10.15.1 / runtime 2026.10.12.1 / manifest 2026.10.19.1 pin | config | verified | AGENTS.md states same pin |
| Edge Dev 158.0.4357.0 measured 2026-10-30 | status | unverifiable | runtime measurement |
| --disable-component-update switch | config | verified | AGENTS.md states edge-dev-aion runs with it |
| model folders EdgeOptimizationGuideModelsManifest etc. | structure | unverifiable | profile folders not inspected |
| 2026.10.2.1 pin could not generate on 158 | status | unverifiable | runtime measurement |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\probe5.js exists; spikes\probes\probe6.js exists |
| "spike S1 measured the extension contexts (`research/11-spike-s1-extension-contexts.md`)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\11-spike-s1-extension-contexts.md exists |
| "spike S7 in `docs/feature-proposals.md`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md exists |
| "S11 ... `research/raw/tool-name-matrix-gemma4-gpu.json`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw\tool-name-matrix-gemma4-gpu.json exists |
| "spikes/probes/tool-name-matrix.js" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\tool-name-matrix.js exists |
| "spikes/probes/ep-trials.sh" sets provider list in Aion's genai_config.json | structure | unverifiable | D:\projects\sandbox\angular-ai-devtools\spikes\probes\ep-trials.sh not found |
| "spikes/probes/read-throughput.ps1" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes exists (file referenced in same doc) |
| "Per-model instances ports 9333-9336" | config | unverifiable | no repo config references these ports (browser runtime only) |
| "`.browsers/` (gitignored, on D:)" | structure | unverifiable | .browsers directory not present in repo (gitignored/runtime) |
| "Edge Dev manifest names `Aion-1.1-Instruct`" | config | unverifiable | external browser profile data not in repo |
| "WebMCP live: `typeof document.modelContext === 'object'`" | feature | unverifiable | browser runtime measurement not reproducible statically |
| "contextWindow = 9216 tokens (Chrome Beta)" | config | unverifiable | browser runtime measurement |
| "contextWindow = 7168 tokens (Aion)" | config | unverifiable | browser runtime measurement |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "research/11-spike-s1-extension-contexts.md" (spike S1) | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\11-spike-s1-extension-contexts.md exists |
| "research/20-built-in-ai-without-flags.md" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\20-built-in-ai-without-flags.md exists |
| "05-spikes.md" (Nano gets tool sessions with AIPromptAPIToolUse alone) | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\05-spikes.md exists |
| "00-browser-probe.md" (Edge Dev 157 results) | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\00-browser-probe.md exists |
| "WebMCP entry point is `document.modelContext`" | feature | verified | 00-browser-probe.md and 02-angular-surface.md corroborate document.modelContext |
| "Angular ships `provideExperimentalWebMcpTools`" | feature | verified | 02-angular-surface.md section 4.3 documents it with source path packages/core/src/webmcp/provide_tools.ts |
| "Chrome ships Prompt API in extensions since Chrome 138" | status | unverifiable | vendor documentation claim, no repo evidence |
| "chrome://flags/#prompt-api-tool-use" enables tool calling | config | unverifiable | browser flag name not statically verifiable in repo |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension's manifest at extension/manifest.json" (MV3) | structure | verified | D:\projects\sandbox\angular-ai-devtools\extension\manifest.json exists |
| "docs/feature-proposals.md" referenced for app_facts | structure | verified | D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md exists |
| "research/raw/zone-mode-portal.json" and zone-mode-portal-zonejs.json | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw exists |
| "spikes/probes/zone-mode.js" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes exists |
| "spikes/ng222-app" measured component CD | structure | unverifiable | path not present in repo (spikes/ng222-app not found) |
| "Angular 22.2.0 (2026-09-23)" CHANGELOG top entry | status | unverifiable | external Angular clone not verified here |
| "withAutoCleanupInjectors stabilized in 22.2" | status | unverifiable | external Angular changelog claim |
| "provideExperimentalWebMcpTools from @angular/core" | feature | verified | documented in same doc with source path packages/core/src/webmcp/provide_tools.ts |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular clone at D:\projects\github\pangular-inspector\devtools" | structure | verified | D:\projects\github\pangular-inspector\devtools exists |
| "Pangular package @pangular-inspector/devtools 0.0.7" | config | unverifiable | package.json in clone not checked |
| "Pangular extension manifest 0.0.7" | config | unverifiable | manifest not checked |
| "React DevTools latest release 8.0.0, 2026-09-08" | status | unverifiable | external release claim |
| "chrome-devtools-mcp third-party tools require 0.25.0+" | config | unverifiable | external tool version claim |
| "Angular CLI MCP tools list (22.0.x source)" | structure | unverifiable | external angular-cli clone not verified here |
| "Pangular MCP tools count 59 + devframe_state_read" | config | unverifiable | external docs count not verified |
| "Pangular uses window.__pangularPageId" | feature | unverifiable | external source not checked |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "NgRx local clone at D:\projects\github\ngrx\platform (NgRx 22.0.0)" | structure | verified | D:\projects\github\ngrx\platform exists |
| "Analog local clone at D:\projects\github\analogjs\analog (@analogjs/platform 2.8.0)" | structure | verified | D:\projects\github\analogjs\analog exists |
| "Vitest API server defaults to port 63315" | config | unverifiable | external Vitest docs claim, not in repo |
| "Angular DevTools uses getInjectorProviders/getInjectorResolutionPath" | feature | verified | 02-angular-surface.md sections 1.2 and 2.1 list these on window.ng |
| "Analog debug routes token DEBUG_ROUTES" | feature | unverifiable | external Analog source not checked |
| "Storybook preview global __STORYBOOK_PREVIEW__" | feature | unverifiable | external Storybook source not checked |
| "RxAngular STATE_SOURCE symbol in dev mode" | feature | unverifiable | external RxAngular source not checked |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/ exists in repo" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes exists |
| "research/raw/ exists in repo" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw exists |
| "docs/feature-proposals.md exists" | structure | verified | D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md exists |
| "probe scripts referenced (probe5.js, probe6.js, probe9.js, probe10.js)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\probe5.js exists; probe6.js exists; probe9.js exists; probe10.js exists |
| "spikes/probes/tool-name-matrix.js" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\tool-name-matrix.js exists |
| "research/raw/tool-name-matrix-gemma4-gpu.json" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw\tool-name-matrix-gemma4-gpu.json exists |
| "Spike S2 dispatches devtoolstooldiscovery from page main world" | feature | unverifiable | browser runtime behavior not statically verifiable |
| "Four-model benchmark context windows 9216/7168" | config | unverifiable | browser runtime measurement |
| "spikes/probes/zone-mode.js" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes exists |
| "research/raw/zone-mode-portal.json" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw exists |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "angular/skills clone at D:\projects\github\angular\skills (commit 747c3c2)" | structure | verified | D:\projects\github\angular\skills exists |
| "Skill references total 135,754 bytes" | config | unverifiable | byte count not rechecked in this audit |
| "angular-developer skill has 37 reference files" | config | unverifiable | file count not rechecked in this audit |
| "ng-devtools-mcp package name (e2e-testing.md)" | structure | unverifiable | external package not in repo |
| "MIT license declared in SKILL.md front matter" | status | unverifiable | external clone license claim not verified |
| "ng.* API names verified against 22.2 source and live 22.2.2 app" | status | verified | 02-angular-surface.md section 1.2 and 05-spikes.md S2 (25 functions) corroborate |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Built on `00-browser-probe.md` and `05-spikes.md`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\00-browser-probe.md exists; research\05-spikes.md exists |
| "Aion model folder `%LOCALAPPDATA%\...\EdgeLLMOnDeviceModel\2026.10.2.1\` (genai_config.json, tokenizer.json)" | structure | unverifiable | external browser profile data not in repo |
| "tokenizer.json vocab_size 200,029; genai_config.json type qwen3, 28 layers, hidden size 2048, context_length 32768" | config | unverifiable | external model file data not in repo |
| "Prompt API tools open loop only (browser does not run tool loop)" | feature | verified | 01-built-in-ai-apis.md and 00-browser-probe.md corroborate open-loop tool calling |
| "Empty `properties` schema fails on Gemma 4 (confounded with camelCase names)" | feature | unverifiable | S11 result superseded; repo has research/raw/tool-name-matrix-gemma4-gpu.json but cause not settled |
| "spikes/probes/tool-name-matrix.js (five variants)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\tool-name-matrix.js exists |
| "docs/feature-proposals.md 2.1 (tool naming rule)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md exists |
| "Chrome DevTools BuiltInAi.ts uses LanguageModel (console insights)" | integration | unverifiable | external devtools-frontend source not in repo |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular clone D:\projects\github\angular\angular (branch 22.2.x)" | structure | verified | D:\projects\github\angular\angular exists |
| "CHANGELOG.md top entry 22.2.0" | status | unverifiable | external Angular clone version not checked here |
| "Feature-usage marks via performance.mark('mark_feature_usage')" | feature | unverifiable | external Angular source claim not verified in this repo |
| "ng.ɵgetControlFlowBlocks does not cover @boundary/ErrorBoundary" | feature | unverifiable | external Angular source claim |
| "resource inner signals labelled Resource#<name>.<part>" | feature | unverifiable | external Angular source claim |
| "Signal Forms set no debugName (rg returns 0 hits)" | status | unverifiable | external Angular source claim |
| "02-angular-surface.md section 1.2 (ng inventory)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\02-angular-surface.md exists |
| "docs/feature-proposals.md section 2.2 (tiers)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md exists |
| "research/raw/tosignal-node-portal.json (Signal Forms nodes carry library labels)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw exists |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured behaviour in 05-spikes.md 'Root cause hunt' (Chrome Beta 156.0.8078.17)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\05-spikes.md exists |
| "Chromium source runtime_enabled_features.json5 AIPromptAPIToolUse experimental" | config | unverifiable | external Chromium source claim not verified in repo |
| "AIPromptAPIToolUse maps to AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4" | config | unverifiable | external binary string claim not verified in repo |
| "Nano profile serves v3Nano and NotSupportedError on tool-typed create()" | status | unverifiable | browser runtime measurement |
| "With AIPromptAPIToolUse alone, v3Nano kept serving and tool-typed create() succeeded" | status | unverifiable | browser runtime measurement |
| "Chrome Prompt API page does not mention tools or function calling" | status | unverifiable | external docs claim |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/bench/nano.json" path | structure | stale | spikes/probes/bench/nano.json does not exist; only research/raw/bench/nano.json exists |
| "spikes/probes/bench.js:62" grades "Which signals does double in app-counter depend on?" with /count/i regex | command | stale | spikes/probes/bench.js:64 now uses fixed regex requiring \bdouble\b and \bcount\b; line number and regex changed in 916fc09 |
| "spikes/probes/regrade.mjs" regrades saved runs | structure | verified | spikes/probes/regrade.mjs exists |
| "Phi-4-mini now runs on Edge stable, port 9337, per .claude/skills/control-ai-browsers/instances.json" | config | verified | .commandcode/skills/control-ai-browsers/instances.json contains port 9337 |
| "Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335" ports | config | verified | .commandcode/skills/control-ai-browsers/instances.json contains ports 9333, 9334, 9335 |
| "spikes/probes/bench/nano-gpu.json" second-round file | structure | unverifiable | .browsers directory absent; cannot confirm file at cited path; research/raw/bench/nano-gpu.json exists |
| "AIPromptAPIToolUse experimental on Win/Mac/Linux/ChromeOS at 156 tag" | feature | unverifiable | Chromium source at tag 156.0.8078.17 not present in repo; no contradicting evidence |
| "research/raw/matrix-nano-tooluse.json" path | structure | unverifiable | file not found in research/raw/ |
| "gemma4-2b-it (Chrome Beta 156, gemma4-for-built-in-ai)" model name | config | unverifiable | no model manifest present in repo to confirm |
| "Aion-1.1-Instruct (Edge Dev 157)" model name | config | unverifiable | no Edge model manifest present in repo |
| "Edge Dev 157.0.4322.0 msedge.dll binary strings" | status | unverifiable | binary not present in repo |
| "Phi-4-mini BFCL 0-shot 70.3" metric | status | unverifiable | external HF model card; no local copy |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/s1-extension/" extension directory | structure | stale | spikes/s1-extension does not exist; doc itself notes retired in M009 under .project/archive/001-run-unrun-spikes |
| "spikes/s1-extension/run-s1.mjs" runner | structure | stale | .project/archive/001-run-unrun-spikes exists; runner retired |
| "research/s1-results/chrome-fresh.json" and "edge-fresh.json" evidence files | structure | verified | research/s1-results directory exists |
| "extension id adkapcgoeebpdmbepbdjmbhfknkcllcc" | config | unverifiable | no extension manifest/installed listing in repo to confirm |
| "Chrome Beta 156.0.8078.17 on port 9341, Edge Dev 157.0.4322.0 on port 9342" | config | unverifiable | instance config uses ports 9333-9338; 9341/9342 not in instances.json |
| "contextWindow 9216 (Gemma 4), 7168 (Aion)" | config | unverifiable | no runtime measurement in repo |
| "Gemma 4 native tool names camelCase crash model process" | feature | unverifiable | raw/tool-name-matrix-gemma4-gpu.json exists but not re-read for crash confirmation |
| "research/raw/tool-name-matrix-gemma4-gpu.json" path | structure | verified | file exists |
| "Extensions.loadUnpacked works over remote-debugging-port" | integration | unverifiable | no test harness in repo |
| "devtools_page blocked by Permissions Policy" | feature | unverifiable | no browser run in repo; consistent with research/19 |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular clone at D:\projects\github\angular\angular branch 22.2.x" | structure | unverifiable | angular repo not in sandbox; cannot verify locally |
| "spikes/ng222-app/dist/ng222-app/browser/main.js" dev bundle | structure | verified | spikes/ng222-app directory exists (dist not checked) |
| "ng generate @angular/core:control-flow-migration schematic" | command | unverifiable | angular-cli clone not in sandbox |
| "angular/skills at commit 747c3c2" | status | unverifiable | skills repo not in sandbox |
| "Lars's ruling 2026-10-12 verbatim quotes" | status | unverifiable | no independent record in repo |
| "68 rows (59 legacy + 9 removed)" count | status | unverifiable | count derived from doc itself; not independently tallied |
| "Default = 1 and Eager = 1 enum value" | config | unverifiable | angular source not in sandbox |
| "provideAnimations sets NgEagerAnimations mark" | feature | unverifiable | angular source not in sandbox |
| "standalone-migration schematic SC:3-5" | command | unverifiable | angular-cli clone not in sandbox |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools branch claude/ai-devtools-spike commit f102b97 Angular 22.2.2" | status | unverifiable | portal checkout not in sandbox |
| "libs/claim/ui/... claim-form.component.ts imports ReactiveFormsModule" | structure | unverifiable | portal checkout not in sandbox |
| "apps/insurance-portal/project.json polyfills zone.js" | config | unverifiable | portal checkout not in sandbox |
| "Forms migrated in commits 754aa1e, 66e8ad6, 92053b9" | status | unverifiable | portal git history not accessible |
| "tmp/control-angular-dev-app/portal-4775-... evidence dir" | structure | unverifiable | tmp dir not in sandbox |
| "@angular/forms/signals appears in 6 files" | config | unverifiable | portal checkout not in sandbox |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Storybook clone D:\projects\github\storybookjs\storybook at dc9b30e8fd8" | structure | unverifiable | storybook repo not in sandbox |
| "Angular clone at 5db6fc4453 branch 22.2.x" | structure | unverifiable | angular repo not in sandbox |
| "declareExperimentalWebMcpTool returns at once under SSR" | feature | unverifiable | angular source not in sandbox |
| "Implicit Signal Forms tools registration.ts" | structure | unverifiable | angular source not in sandbox |
| "docs/feature-proposals.md limits (7,168 to 9,216 token window)" | config | verified | docs/feature-proposals.md exists in repo |
| "N10/N14/N21 numbered features exist in proposals" | feature | verified | docs/feature-proposals.md exists in repo |
| "Claude in Chrome tool definitions loaded in session" | integration | unverifiable | not verifiable from repo |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2 spike app" | config | unverifiable | version claim not verifiable beyond README (README says 22.2.2) |
| "spikes/ng222-app generated with Angular CLI 22.2.2" | config | verified | spikes/ng222-app/README.md states Angular CLI 22.2.2 |
| "spikes/ng222-ssr generated with Angular CLI 22.2.2" | config | verified | spikes/ng222-ssr/README.md states Angular CLI 22.2.2 |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-ssr spike app" | structure | verified | spikes/ng222-ssr directory exists |
| "CommonEngine deprecated, AngularNodeAppEngine/AngularAppEngine modern" | feature | unverifiable | angular source not in sandbox |
| "platform-server XHR deprecated, fetch default" | feature | unverifiable | angular source not in sandbox |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI 22.2.2, Vitest default test runner" | config | verified | spikes/ng222-app/README.md says ng test uses Vitest |
| "ng test command" | command | verified | spikes/ng222-app/README.md documents ng test |
| "ng e2e command" | command | verified | spikes/ng222-app/README.md documents ng e2e |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge Stable 155 on Windows fresh profile" | config | unverifiable | no Edge binary in repo |
| "msImplicitSignin, msProfileSignIn feature flags list" | config | unverifiable | no Edge binary to confirm flag names |
| "HKCU\Software\Policies\Microsoft\Edge registry path" | config | unverifiable | no registry access in sandbox |
| "--bwsi browse-without-sign-in switch" | command | unverifiable | no Edge binary to test |
| "Edge 157 retires legacy WAM sign-in" | status | unverifiable | no Edge binary in repo |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "DevTools panel page LanguageModel works in Chrome Beta 157 Nano/Gemma4, Chrome 156 Nano, Edge Dev 157 Aion, Edge 155 Phi-4-mini" | feature | unverifiable | no browser run in sandbox; consistent with 20 |
| "Hidden devtools.html page refuses LanguageModel" | feature | unverifiable | no browser run in sandbox |
| "ExtensionPromptService calls LanguageModel in panel itself" | feature | unverifiable | source not located in repo |
| "raw/19-languagemodel-contexts.json raw results" | structure | unverifiable | research/raw/19-languagemodel-contexts.json not found |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "raw/20-built-in-ai-without-flags.json raw results" | structure | unverifiable | research/raw/20-built-in-ai-without-flags.json not found |
| "Chrome 156, Chrome Beta 157, Edge 155, Edge Dev 157 instances" | config | unverifiable | no browser run in sandbox |
| "LanguageModel undefined on Edge web page without flags" | feature | unverifiable | no browser run in sandbox |
| "Dedicated worker started by panel has all seven globals" | feature | unverifiable | no browser run in sandbox |
| "LanguageDetector/Translator crash renderer in worker" | feature | unverifiable | no browser run in sandbox |
| "docs/filing-ledger.md item 11 filing draft" | structure | verified | docs/filing-ledger.md exists |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng serve" dev server command | command | verified | spikes/ng222-app/package.json scripts.start = "ng serve" |
| "http://localhost:4200/" dev URL | config | unverifiable | default Angular CLI port; no project config overrides it; not independently verified |
| "ng build" stores artifacts in dist/ | command | verified | spikes/ng222-app/package.json scripts.build = "ng build" |
| "ng test" uses Vitest runner | command | verified | spikes/ng222-app/package.json devDependencies include vitest 5.0.3 |
| "Angular CLI version 22.2.2" | config | verified | spikes/ng222-app/package.json @angular/core ^22.2.0 and README |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng serve" dev server command | command | verified | spikes/ng222-ssr/package.json scripts.start = "ng serve" |
| "http://localhost:4200/" dev URL | config | unverifiable | default Angular CLI port; not independently verified |
| "ng build" stores artifacts in dist/ | command | verified | spikes/ng222-ssr/package.json scripts.build = "ng build" |
| "ng test" uses Vitest runner | command | verified | spikes/ng222-ssr/package.json devDependencies include vitest |
| "Angular CLI version 22.2.2" | config | verified | spikes/ng222-ssr/package.json @angular/core ^22.2.0 |

## Descriptive docs
- .commandcode/taste/taste.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 4 | fix-doc | 2026-10-30: "2: Accept." (error-explainer module name: code is authoritative) | no |
| 5 | fix-doc | 2026-10-30: "2: Accept." (n4-error-explainer component name: code is authoritative) | no |
| 32 | fix-doc | 2026-10-30: "2: Accept." (Angular DevTools version: docs follow the installed 1.22.1) | no |
| 36 | fix-doc | 2026-10-30: "2: Accept." (doctor line extension version: docs follow 1.22.1) | no |
| 82 | fix-doc | 2026-10-30: "2: Accept." (features index: add the three shipped feature docs) | no |
| 83 | fix-doc | 2026-10-30: "2: Accept." (error-explainer implementation path: code is authoritative) | no |
| 84 | fix-doc | 2026-10-30: "2: Accept." (error-explainer component path: code is authoritative) | no |
| 183 | fix-doc | 2026-10-30: "2: Accept." (nx format:write, not nx format --fix) | no |
| 220 | fix-doc | 2026-10-30: "2: Accept." (panel is the built Angular app; the vanilla panel files are legacy output) | no |
| 310 | accept-drift | 2026-10-30: "2: Accept." (dated measurement note records the path as it was) | n/a (accept-drift) |
| 311 | accept-drift | 2026-10-30: "2: Accept." (dated measurement note records the line and regex as they were) | n/a (accept-drift) |
| 319 | accept-drift | 2026-10-30: "2: Accept." (note records the spike tree before its retirement) | n/a (accept-drift) |
| 320 | accept-drift | 2026-10-30: "2: Accept." (note records the runner before its retirement) | n/a (accept-drift) |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .claude/skills/control-ai-browsers/SKILL.md | "npm test runs *.test.mjs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 2 | .claude/skills/control-ai-browsers/features/README.md | "panel built via npx nx run angular-ai-devtools:build-extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 3 | .claude/skills/control-ai-browsers/features/README.md | "feature files follow H1 + four H2s" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 4 | .claude/skills/control-ai-browsers/features/error-explainer.md | "error-explainer.service.ts implementation" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 5 | .claude/skills/control-ai-browsers/features/error-explainer.md | "n4-error-explainer.component.ts" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 6 | .claude/skills/control-ai-browsers/features/extension-panel.md | "extension/panel/ built output main.js/styles.css/index.html" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 7 | .claude/skills/control-ai-browsers/features/health-check.md | "doctor exits 0/1/2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 8 | .claude/skills/control-ai-browsers/features/health-check.md | "Proofreader not defined in builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 9 | .claude/skills/control-ai-browsers/features/health-check.md | "Translator en->da downloadable" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 10 | .claude/skills/control-ai-browsers/features/health-check.md | "nineteen check lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 11 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "model clear refuses running instance" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 12 | .claude/skills/control-angular-dev-app/features/README.md | "Counter fresh page state: count 3, double 6, cart 1 item" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 13 | .claude/skills/control-angular-dev-app/features/README.md | "SSR heading Render mode: server" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 14 | .claude/skills/control-angular-dev-app/features/README.md | "npm test at repository root runs script tests" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 15 | .claude/skills/control-angular-dev-app/features/counter.md | "page shows Clicks: 3 (double 6, cart 1)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 16 | .claude/skills/control-angular-dev-app/features/counter.md | "Increment raises count by one" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 17 | .claude/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default (no changeDetection declared)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 18 | .claude/skills/control-angular-dev-app/features/counter.md | "provideRouter with routes = []" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 19 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim list 5 rows measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 20 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-create heading shows Complaint Create (app bug)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 21 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint list 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 22 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer list 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 23 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "POST /api/complaints returns 201" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 24 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract list 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 25 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "PUT /api/contracts on edit returns 200" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 26 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "POST /api/contracts returns 201" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 27 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "portal sidebar entries are divs with routerLink" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 28 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "home tiles link to /<domain>/list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 29 | .claude/skills/control-angular-dev-app/features/ssr.md | "RenderMode.Server/Prerender/Client routes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 30 | .claude/skills/control-angular-dev-app/features/ssr.md | "ngDevMode.hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 31 | .claude/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 32 | .claude/skills/control-angular-devtools/SKILL.md | "Angular DevTools 1.22.0" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 33 | .claude/skills/control-angular-devtools/features/README.md | "npm test at repository root runs script tests" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 34 | .claude/skills/control-angular-devtools/features/attach.md | "attach expected isAngular/isDebugMode true" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 35 | .claude/skills/control-angular-devtools/features/attach.md | "production build gives isDebugMode false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 36 | .claude/skills/control-angular-devtools/features/install.md | "doctor line extension: Angular DevTools 1.22.0" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 37 | .claude/skills/control-angular-devtools/features/install.md | "Chrome Beta branded install proven 2026-10-11" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 38 | .claude/skills/control-angular-devtools/features/profiler.md | "coexist expected own subscribers counts 16/32" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 39 | .claude/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 40 | .claude/skills/control-angular-devtools/features/signal-graph.md | "pane nodes template/signal/computed/effect on counter" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 41 | .claude/skills/control-angular-devtools/features/signal-graph.md | "after angular:di_graph template node gone" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 42 | .claude/skills/control-pangular-inspector/SKILL.md | "MCP endpoint http://localhost:9999/__mcp" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 43 | .claude/skills/control-pangular-inspector/SKILL.md | "tools/list holds none of eight action tools in read-only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 44 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools with --read-only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 45 | .claude/skills/control-pangular-inspector/SKILL.md | "scan get-components returns [] at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 46 | .claude/skills/control-pangular-inspector/SKILL.md | "Angular 22.2.2 / TypeScript 6.0.3 / ssr false (build-meta)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 47 | .claude/skills/control-pangular-inspector/features/README.md | "node $S check exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 48 | .claude/skills/control-pangular-inspector/features/README.md | "node $D up --target portal (API 3000, app 4507)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 49 | .claude/skills/control-pangular-inspector/features/README.md | "playwright-cli session pangular-9999" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 50 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "list-pages shows page id, URL, inspectors" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 51 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "components outline includes AppComponent <ng-journal-root>, SidebarComponent <ng-journal-sidebar>, ListComponent <ng-journal-list>, HeaderComponent, Table <p-table>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 52 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-component for ng-journal-list returns ListComponent, path ng-journal-root > ng-journal-list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 53 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals returns template node ng-journal-list and computed node contracts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 54 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-providers returns element injector ng-journal-list with lookupPath" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 55 | .claude/skills/control-pangular-inspector/features/navigation.md | "run-code click on CONTRACT > List returns http://localhost:4507/contract/list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 56 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation newest entry /contract/list succeeded, trigger imperative, from /home" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 57 | .claude/skills/control-pangular-inspector/features/navigation.md | "inspect-route URL /contract/list, active routes /contract (lazy) > /list -> ListComponent" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 58 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes (12 routes) and lint-routes (one info finding missing-title)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 59 | .claude/skills/control-pangular-inspector/features/navigation.md | "limit defaults to 5 (at most 50)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 60 | .claude/skills/control-pangular-inspector/features/panel.md | "panel URL http://localhost:4507/__pangular/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 61 | .claude/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 62 | .claude/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2 on dashboard" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 63 | .claude/skills/control-pangular-inspector/features/panel.md | "floating button accessible name Toggle Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 64 | .claude/skills/control-pangular-inspector/features/setup.md | "changed lists package.json, package-lock.json, main.ts, project.json, proxy.conf.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 65 | .claude/skills/control-pangular-inspector/features/setup.md | "lockfile 457 lines insertions" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 66 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan get-components returns [] at portal workspace root (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 67 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan get-components --root apps/insurance-portal returns AppComponent, HomeComponent, PageNotFoundComponent, SidebarComponent" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 68 | .claude/skills/control-pangular-inspector/features/source-scan.md | "build-meta returns Angular 22.2.2, project @ng-journal/source, TypeScript 6.0.3, ssr false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 69 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan reads sourceRoot of angular.json projects plus <root>/src; ignores project.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 70 | .claude/skills/control-vitest-browser-angular/SKILL.md | "window.ng has 23 functions including getComponent, getInjector, ɵgetSignalGraph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 71 | .claude/skills/control-vitest-browser-angular/SKILL.md | "LanguageModel available in attach mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 72 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng === undefined; MAIN world sees ng" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 73 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵgetSignalGraph shows template div -> title, count, double, items; double -> count; effect -> count" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 74 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵgetDependenciesFromInjectable shows CartService items pear/plum" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 75 | .claude/skills/verify-ai-browsers/SKILL.md | "checks exit 0 pass, 1 claim failed, 2 could not run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 76 | .claude/skills/verify-angular-devtools/SKILL.md | "install --from tmp/control-angular-devtools/extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 77 | .claude/skills/verify-angular-devtools/SKILL.md | "coexist --di-graph leaves signal graph broken until reload" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 78 | .claude/skills/verify-pangular-inspector/SKILL.md | "live-reads MCP answers name /contract/list, ListComponent <ng-journal-list>, nodes, lookupPath" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 79 | .commandcode/pstack-models.md | "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 80 | .commandcode/pstack-models.md | "default effort: session" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 81 | .commandcode/skills/control-ai-browsers/SKILL.md | "lars-create-verification references/generated-skill.md" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 82 | .commandcode/skills/control-ai-browsers/features/README.md | "Features list includes only Instances/Health/Model/Probes/Extension panel" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 83 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "Implementation: apps/angular-ai-devtools/src/app/error-explainer.service.ts" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 84 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "Implementation: n4-error-explainer.component.ts" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 85 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "message type angular-ai:error-explain" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 86 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "ng.getOwningComponent" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 87 | .commandcode/skills/control-ai-browsers/features/health-check.md | "doctor exits 0/1/2 and nineteen check lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 88 | .commandcode/skills/control-ai-browsers/features/health-check.md | "backend row gemma4_gpu_low_tier_model" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 89 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader not defined; Translator en->da downloadable" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 90 | .commandcode/skills/control-ai-browsers/features/instances.md | "five instances each [OK] with PID backend gpu and 1 tab" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 91 | .commandcode/skills/control-angular-dev-app/SKILL.md | "provideClientHydration()" SSR | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 92 | .commandcode/skills/control-angular-dev-app/SKILL.md | "routes `/`, `/prerender`, `/client`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 93 | .commandcode/skills/control-angular-dev-app/SKILL.md | "portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 94 | .commandcode/skills/control-angular-dev-app/SKILL.md | "injection-tokens.ts:5 hardcodes localhost:3000" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 95 | .commandcode/skills/control-angular-dev-app/SKILL.md | "SSR runs ng serve --port --no-hmr" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 96 | .commandcode/skills/control-angular-dev-app/SKILL.md | "portal runs nx api:serve PORT=3000 and insurance-portal:serve" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 97 | .commandcode/skills/control-angular-dev-app/SKILL.md | "readiness polls up to 60s" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 98 | .commandcode/skills/control-angular-dev-app/SKILL.md | "default timeout 240s" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 99 | .commandcode/skills/control-angular-dev-app/features/README.md | "Counter fresh page state count 3 double 6 cart 1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 100 | .commandcode/skills/control-angular-dev-app/features/README.md | "SSR heading Render mode: server" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 101 | .commandcode/skills/control-angular-dev-app/features/README.md | "feature-flags.manifest.json decides sidebar entries" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 102 | .commandcode/skills/control-angular-dev-app/features/counter.md | "Clicks: 3 (double 6, cart 1)" initial line | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 103 | .commandcode/skills/control-angular-dev-app/features/counter.md | "Increment button raises count by one" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 104 | .commandcode/skills/control-angular-dev-app/features/counter.md | "counter is OnPush by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 105 | .commandcode/skills/control-angular-dev-app/features/counter.md | "router() returns present true with empty route list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 106 | .commandcode/skills/control-angular-dev-app/features/counter.md | "count signal, double computed, CartService.items" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 107 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "table columns Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 108 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured (facade drops missing)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 109 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "/claim/create heading Complaint Create (app bug)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 110 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "eval __ngc.signals edges template->computed claims" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 111 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint list 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 112 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer list 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 113 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "POST /api/complaints => 201" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 114 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-details heading Customer Details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 115 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract list 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 116 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "columns Policynumber, Status, Insurance Start On, Customer, Phone, Email" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 117 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "POST /api/contracts => 201, PUT => 200" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 118 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "header Insurance Portal" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 119 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "home tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 120 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Page Not Found for unknown URLs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 121 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Pangular overlay button Toggle Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 122 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "ngDevMode.hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 123 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "RenderMode.Server/Prerender/Client routes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 124 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "ng-server-context ssr/ssg" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 125 | .commandcode/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 126 | .commandcode/skills/control-angular-devtools/features/attach.md | "window.__NG_DEVTOOLS_CONNECTED__ === true" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 127 | .commandcode/skills/control-angular-devtools/features/attach.md | "detection isAngular/isDebugMode/isIvy/isSupportedAngularVersion" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 128 | .commandcode/skills/control-angular-devtools/features/attach.md | "production build gives isDebugMode false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 129 | .commandcode/skills/control-angular-devtools/features/install.md | "branded install proven in Chrome Beta 2026-10-11" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 130 | .commandcode/skills/control-angular-devtools/features/install.md | "install exit 0 uninstall exit 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 131 | .commandcode/skills/control-angular-devtools/features/profiler.md | "coexist own subscribers bothOn a:16 b:16 afterRemoveA a:16 b:32" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 132 | .commandcode/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 133 | .commandcode/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler(null) clears every subscriber" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 134 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 135 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "after angular:di_graph pane signal:count, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 136 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "kinds linked-signal, child-signal-prop, resource, unknown" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 137 | .commandcode/skills/control-pangular-inspector/SKILL.md | "portal derived port 4507 for default folder" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 138 | .commandcode/skills/control-pangular-inspector/SKILL.md | "commit f102b97 holds the setup" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 139 | .commandcode/skills/control-pangular-inspector/SKILL.md | "Angular 22.2.2 / TypeScript 6.0.3 (panel)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 140 | .commandcode/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 141 | .commandcode/skills/control-pangular-inspector/SKILL.md | "npm 11 drops 27 entries" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 142 | .commandcode/skills/control-pangular-inspector/features/README.md | "Never drive sessions cb, ed, nano, g4, aion, phi, ai-cb, ai-ed, ngdt" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 143 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals returns template/computed nodes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 144 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "explain-navigation outcomes: succeeded, cancelled, redirected, failed, skipped, pending" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 145 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "list-routes returns 12 routes (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 146 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "lint-routes one info finding missing-title" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 147 | .commandcode/skills/control-pangular-inspector/features/panel.md | "panel URL http://localhost:4507/__pangular/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 148 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2 on dashboard" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 149 | .commandcode/skills/control-pangular-inspector/features/panel.md | "floating button accessible name Toggle Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 150 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "get-components returns [] at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 151 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "build-meta Angular 22.2.2, project @ng-journal/source, TypeScript 6.0.3, ssr false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 152 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "LanguageModel availability available in attach mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 153 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "window.ng has 23 functions" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 154 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "Angular 22.2 unit-test builder" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 155 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "Fresh state of held Counter: Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 156 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "Never attach outside instances.json or bundled Chromium" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 157 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "counter.spec.ts renders Counter with vitest-browser-angular render()" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 158 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4) without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 159 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "timing demo fails with expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 160 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "chrome.storage.local keys content_isolated\|frame\|/, content_main\|frame\|/, devtools_panel" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 161 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng === 'undefined'" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 162 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "host is <div id=rootN ng-version>, not <app-counter>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 163 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵgetSignalGraph returns template/computed nodes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 164 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "CartService override ['pear','plum']" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 165 | .commandcode/skills/link-workspace-packages/SKILL.md | "npm auto-symlinks workspace packages" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 166 | .commandcode/skills/monitor-ci/SKILL.md | "ci_information / update_self_healing_fix MCP tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 167 | .commandcode/skills/monitor-ci/references/fix-flows.md | "nx-cloud apply-locally <shortLink>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 168 | .commandcode/skills/monitor-ci/references/fix-flows.md | "empty commit retry on cipe_no_tasks" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 169 | .commandcode/skills/nx-cloud-api/SKILL.md | "--page-size max 500" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 170 | .commandcode/skills/nx-cloud-api/SKILL.md | "files are created owner-only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 171 | .commandcode/skills/nx-cloud-api/SKILL.md | "NX_CLOUD_API / nxCloudUrl host config" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 172 | .commandcode/skills/nx-cloud-api/SKILL.md | "NX_CLOUD_ACCESS_TOKEN / nxCloudId" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 173 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "task-stats operation" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 174 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "cacheable and cacheEnabled fields" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 175 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "SHA-256 and byte count validation" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 176 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "task assets typed logs, artifact, or sandbox-report" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 177 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "statuses=FAILED, TIMED_OUT, CANCELED" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 178 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "30-hour creation window" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 179 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "at most five narrow detail requests" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 180 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "limit review report to five groups" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 181 | .commandcode/skills/nx-generate/SKILL.md | "npx nx list @nx/react" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 182 | .commandcode/skills/nx-generate/SKILL.md | "npx nx g @nx/react:library --help" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 183 | .commandcode/skills/nx-generate/SKILL.md | "nx format --fix" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 184 | .commandcode/skills/nx-generate/SKILL.md | "node -e require.resolve generators.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 185 | .commandcode/skills/nx-import/SKILL.md | "pnpm-workspace.yaml globs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 186 | .commandcode/skills/nx-import/SKILL.md | "tsconfig.base.json frontend settings" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 187 | .commandcode/skills/nx-import/references/ESLINT.md | "@nx/eslint plugin scans eslint config files" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 188 | .commandcode/skills/nx-import/references/ESLINT.md | "targetName: eslint:lint" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 189 | .commandcode/skills/nx-import/references/ESLINT.md | "eslint@^9 pinning" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 190 | .commandcode/skills/nx-import/references/GRADLE.md | "@nx/gradle plugin infers projects" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 191 | .commandcode/skills/nx-import/references/JEST.md | "@nx/jest/plugin scans jest.config.*" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 192 | .commandcode/skills/nx-import/references/JEST.md | "jest.preset.js at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 193 | .commandcode/skills/nx-import/references/NEXT.md | "@nx/next/plugin inferred targets" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 194 | .commandcode/skills/nx-import/references/NEXT.md | "next build runs TypeScript checking" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 195 | .commandcode/skills/nx-import/references/NEXT.md | "next-env.d.ts generated" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 196 | .commandcode/skills/nx-import/references/TURBOREPO.md | "turbo.json and config packages cleanup" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 197 | .commandcode/skills/nx-import/references/TURBOREPO.md | "nx replaces Turborepo orchestration" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 198 | .commandcode/skills/nx-import/references/VITE.md | "@nx/vite/plugin typecheck target" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 199 | .commandcode/skills/nx-import/references/VITE.md | "vite.config.ts detection" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 200 | .commandcode/skills/nx-import/references/VITE.md | "React Router 7 build output build/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 201 | .commandcode/skills/nx-workspace/SKILL.md | "Do NOT read project.json directly" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 202 | .commandcode/skills/nx-workspace/SKILL.md | "prefix commands with npx/pnpx/yarn" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 203 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "--base=abc123 --head=def456" between commits | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 204 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "--uncommitted" / "--untracked" flags | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 205 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "--exclude=\"*-e2e\"" filter | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 206 | .commandcode/skills/verify-ai-browsers/SKILL.md | "timeoutMs 3000000" for model cycle | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 207 | .commandcode/skills/verify-ai-browsers/SKILL.md | "chrome-beta-gemma4 extra Nano folders" caveat | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 208 | .commandcode/skills/verify-angular-devtools/SKILL.md | D=.commandcode/skills/control-angular-devtools/scripts/control.mjs | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 209 | .commandcode/skills/verify-angular-devtools/SKILL.md | A=.commandcode/skills/control-angular-dev-app/scripts/control.mjs | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 210 | .commandcode/skills/verify-angular-devtools/SKILL.md | "install --from tmp/control-angular-devtools/extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 211 | .commandcode/skills/verify-angular-devtools/SKILL.md | "coexist --di-graph" runs angular:di_graph last | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 212 | .commandcode/skills/verify-angular-devtools/SKILL.md | "Not covered: branded browsers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 213 | .commandcode/skills/verify-pangular-inspector/SKILL.md | P=.commandcode/skills/control-pangular-inspector/scripts/control.mjs | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 214 | .commandcode/skills/verify-pangular-inspector/SKILL.md | A=.commandcode/skills/control-angular-dev-app/scripts/control.mjs | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 215 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "setup check exact pin 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 216 | .commandcode/skills/verify-pangular-inspector/SKILL.md | ports 3000 and 9999 fixed | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 217 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "tools/list offers no action tool" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 218 | .commandcode/taste/angular/taste.md | "Signal Forms (@angular/forms/signals) is the target forms API; the Insurance Portal was migrated to it" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 219 | .commandcode/taste/angular/taste.md | "angular-developer skill should be model-invocable (no disable-model-invocation flag)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 220 | .commandcode/taste/angular/taste.md | "Chrome/Edge web extension dev tools must be implemented in Angular" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 221 | .commandcode/taste/angular/taste.md | "Features should be Angular-only with no third-party packages; specifically excludes Vitest" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 222 | .commandcode/taste/communication/taste.md | "provideAiDevTools() not provideAiDevtools()" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 223 | .commandcode/taste/communication/taste.md | "Writing style in docs ... plain literal prose, no idioms or metaphors, no em dashes or curly quotes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 224 | .commandcode/taste/design/taste.md | "The product is only a web (browser) extension and must never generate code" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 225 | .commandcode/taste/design/taste.md | "Removing panel/** from web_accessible_resources is conditional" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 226 | .commandcode/taste/tooling/taste.md | "verify with nx test angular-ai-devtools --include=<path>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 227 | .commandcode/taste/tooling/taste.md | "Command Code discovers skills from .commandcode/skills/ and .agents/skills/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 228 | .commandcode/taste/workflow/taste.md | "Work stays uncommitted and unpushed unless he asks to commit" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 229 | .commandcode/taste/workflow/taste.md | "Stage files by name (never blanket git add)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 230 | .commandcode/taste/workflow/taste.md | "Commit taste-file changes automatically ... one commit per changed taste file" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 231 | AGENTS.md | "npm run check" type check root and skills | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 232 | AGENTS.md | "npm test" node:test root and skills | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 233 | AGENTS.md | other .claude/skills folders older copies | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 234 | AGENTS.md | instances and models shared by every checkout | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 235 | AGENTS.md | edge-dev-aion measured 2026-10-30 Edge Dev 158.0.4357.0 doctor exit 0 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 236 | docs/afk-run-2026-10-12.md | "All eight skills committed" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 237 | docs/afk-run-2026-10-12.md | "Tree clean: git status shows nothing but ignored paths" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 238 | docs/afk-run-2026-10-12.md | "Only four standing per-model instances run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 239 | docs/afk-run-2026-10-12.md | "No push, PR, tag or filing" gate | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 240 | docs/design/tutor.md | research/02 section 4.4 CLI tutor reference | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 241 | docs/design/tutor.md | ng.ɵsetProfiler events give per-component template ran set | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 242 | docs/design/tutor.md | context windows 7,168 Aion / 9,216 Chrome | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 243 | docs/design/tutor.md | research/19/20 Prompt API in dedicated worker | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 244 | docs/design/tutor.md | no code generation ruling | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 245 | docs/design/tutor.md | TS1-TS12 spikes listed | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 246 | docs/feature-proposals.md | Angular 22.2 dev mode supported apps | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 247 | docs/feature-proposals.md | research/00-17 evidence files exist | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 248 | docs/feature-proposals.md | filing-ledger.md ten drafts | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 249 | docs/feature-proposals.md | N1-N37 feature numbering | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 250 | docs/feature-proposals.md | context windows 7,168 / 9,216 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 251 | docs/filing-ledger.md | angular/angular di_graph creates ViewContainerRef side effect | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 252 | docs/filing-ledger.md | @angular/core 22.2.2 version | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 253 | docs/filing-ledger.md | pangular 0.0.7 published, list-components missing | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 254 | docs/filing-ledger.md | Chromium availability() returns available for refused tool types | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 255 | docs/filing-ledger.md | optimus-ui pTextarea throws under Signal Forms | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 256 | docs/filing-ledger.md | WebMCP Annotations lacks debugging hint | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 257 | docs/filing-ledger.md | LanguageDetector/Translator crash in dedicated worker | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 258 | plans/angular-ai-devtools-proposals.handoff.md | deliverable docs/feature-proposals.md ~1,080 lines | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 259 | plans/angular-ai-devtools-proposals.handoff.md | Insurance Portal branch claude/ai-devtools-spike head cc9ce25 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 260 | plans/angular-ai-devtools-proposals.handoff.md | no project skill named verify | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 261 | references/ai-browsers-verification.md | port 9992 for checks | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 262 | references/ai-browsers-verification.md | state verdict ~3 min for four instances | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 263 | references/ai-browsers-verification.md | five instances contend for memory | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 264 | references/edge-dev-aion-model.md | Edge Dev 158.0.4357.0 measured 2026-10-30 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 265 | references/edge-dev-aion-model.md | model folders EdgeOptimizationGuideModelsManifest etc. | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 266 | references/edge-dev-aion-model.md | 2026.10.2.1 pin could not generate on 158 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 267 | research/00-browser-probe.md | "spikes/probes/ep-trials.sh" sets provider list in Aion's genai_config.json | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 268 | research/00-browser-probe.md | "Per-model instances ports 9333-9336" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 269 | research/00-browser-probe.md | "`.browsers/` (gitignored, on D:)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 270 | research/00-browser-probe.md | "Edge Dev manifest names `Aion-1.1-Instruct`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 271 | research/00-browser-probe.md | "WebMCP live: `typeof document.modelContext === 'object'`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 272 | research/00-browser-probe.md | "contextWindow = 9216 tokens (Chrome Beta)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 273 | research/00-browser-probe.md | "contextWindow = 7168 tokens (Aion)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 274 | research/01-built-in-ai-apis.md | "Chrome ships Prompt API in extensions since Chrome 138" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 275 | research/01-built-in-ai-apis.md | "chrome://flags/#prompt-api-tool-use" enables tool calling | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 276 | research/02-angular-surface.md | "spikes/ng222-app" measured component CD | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 277 | research/02-angular-surface.md | "Angular 22.2.0 (2026-09-23)" CHANGELOG top entry | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 278 | research/02-angular-surface.md | "withAutoCleanupInjectors stabilized in 22.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 279 | research/03-prior-art.md | "Pangular package @pangular-inspector/devtools 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 280 | research/03-prior-art.md | "Pangular extension manifest 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 281 | research/03-prior-art.md | "React DevTools latest release 8.0.0, 2026-09-08" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 282 | research/03-prior-art.md | "chrome-devtools-mcp third-party tools require 0.25.0+" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 283 | research/03-prior-art.md | "Angular CLI MCP tools list (22.0.x source)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 284 | research/03-prior-art.md | "Pangular MCP tools count 59 + devframe_state_read" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 285 | research/03-prior-art.md | "Pangular uses window.__pangularPageId" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 286 | research/04-ecosystem.md | "Vitest API server defaults to port 63315" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 287 | research/04-ecosystem.md | "Analog debug routes token DEBUG_ROUTES" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 288 | research/04-ecosystem.md | "Storybook preview global __STORYBOOK_PREVIEW__" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 289 | research/04-ecosystem.md | "RxAngular STATE_SOURCE symbol in dev mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 290 | research/05-spikes.md | "Spike S2 dispatches devtoolstooldiscovery from page main world" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 291 | research/05-spikes.md | "Four-model benchmark context windows 9216/7168" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 292 | research/06-angular-skills.md | "Skill references total 135,754 bytes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 293 | research/06-angular-skills.md | "angular-developer skill has 37 reference files" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 294 | research/06-angular-skills.md | "ng-devtools-mcp package name (e2e-testing.md)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 295 | research/06-angular-skills.md | "MIT license declared in SKILL.md front matter" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 296 | research/07-prompting-small-models.md | "Aion model folder `%LOCALAPPDATA%\...\EdgeLLMOnDeviceModel\2026.10.2.1\` (genai_config.json, tokenizer.json)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 297 | research/07-prompting-small-models.md | "tokenizer.json vocab_size 200,029; genai_config.json type qwen3, 28 layers, hidden size 2048, context_length 32768" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 298 | research/07-prompting-small-models.md | "Empty `properties` schema fails on Gemma 4 (confounded with camelCase names)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 299 | research/07-prompting-small-models.md | "Chrome DevTools BuiltInAi.ts uses LanguageModel (console insights)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 300 | research/08-recent-angular-features.md | "CHANGELOG.md top entry 22.2.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 301 | research/08-recent-angular-features.md | "Feature-usage marks via performance.mark('mark_feature_usage')" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 302 | research/08-recent-angular-features.md | "ng.ɵgetControlFlowBlocks does not cover @boundary/ErrorBoundary" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 303 | research/08-recent-angular-features.md | "resource inner signals labelled Resource#<name>.<part>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 304 | research/08-recent-angular-features.md | "Signal Forms set no debugName (rg returns 0 hits)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 305 | research/09-nano-tool-session-error.md | "Chromium source runtime_enabled_features.json5 AIPromptAPIToolUse experimental" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 306 | research/09-nano-tool-session-error.md | "AIPromptAPIToolUse maps to AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 307 | research/09-nano-tool-session-error.md | "Nano profile serves v3Nano and NotSupportedError on tool-typed create()" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 308 | research/09-nano-tool-session-error.md | "With AIPromptAPIToolUse alone, v3Nano kept serving and tool-typed create() succeeded" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 309 | research/09-nano-tool-session-error.md | "Chrome Prompt API page does not mention tools or function calling" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 310 | research/10-model-capabilities.md | "spikes/probes/bench/nano.json" path | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 311 | research/10-model-capabilities.md | "spikes/probes/bench.js:62" grades "Which signals does double in app-counter depend on?" with /count/i regex | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 312 | research/10-model-capabilities.md | "spikes/probes/bench/nano-gpu.json" second-round file | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 313 | research/10-model-capabilities.md | "AIPromptAPIToolUse experimental on Win/Mac/Linux/ChromeOS at 156 tag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 314 | research/10-model-capabilities.md | "research/raw/matrix-nano-tooluse.json" path | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 315 | research/10-model-capabilities.md | "gemma4-2b-it (Chrome Beta 156, gemma4-for-built-in-ai)" model name | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 316 | research/10-model-capabilities.md | "Aion-1.1-Instruct (Edge Dev 157)" model name | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 317 | research/10-model-capabilities.md | "Edge Dev 157.0.4322.0 msedge.dll binary strings" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 318 | research/10-model-capabilities.md | "Phi-4-mini BFCL 0-shot 70.3" metric | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 319 | research/11-spike-s1-extension-contexts.md | "spikes/s1-extension/" extension directory | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 320 | research/11-spike-s1-extension-contexts.md | "spikes/s1-extension/run-s1.mjs" runner | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 321 | research/11-spike-s1-extension-contexts.md | "extension id adkapcgoeebpdmbepbdjmbhfknkcllcc" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 322 | research/11-spike-s1-extension-contexts.md | "Chrome Beta 156.0.8078.17 on port 9341, Edge Dev 157.0.4322.0 on port 9342" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 323 | research/11-spike-s1-extension-contexts.md | "contextWindow 9216 (Gemma 4), 7168 (Aion)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 324 | research/11-spike-s1-extension-contexts.md | "Gemma 4 native tool names camelCase crash model process" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 325 | research/11-spike-s1-extension-contexts.md | "Extensions.loadUnpacked works over remote-debugging-port" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 326 | research/11-spike-s1-extension-contexts.md | "devtools_page blocked by Permissions Policy" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 327 | research/12-legacy-vs-modern-angular.md | "Angular clone at D:\projects\github\angular\angular branch 22.2.x" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 328 | research/12-legacy-vs-modern-angular.md | "ng generate @angular/core:control-flow-migration schematic" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 329 | research/12-legacy-vs-modern-angular.md | "angular/skills at commit 747c3c2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 330 | research/12-legacy-vs-modern-angular.md | "Lars's ruling 2026-10-12 verbatim quotes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 331 | research/12-legacy-vs-modern-angular.md | "68 rows (59 legacy + 9 removed)" count | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 332 | research/12-legacy-vs-modern-angular.md | "Default = 1 and Eager = 1 enum value" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 333 | research/12-legacy-vs-modern-angular.md | "provideAnimations sets NgEagerAnimations mark" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 334 | research/12-legacy-vs-modern-angular.md | "standalone-migration schematic SC:3-5" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 335 | research/13-portal-legacy-audit.md | "Checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools branch claude/ai-devtools-spike commit f102b97 Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 336 | research/13-portal-legacy-audit.md | "libs/claim/ui/... claim-form.component.ts imports ReactiveFormsModule" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 337 | research/13-portal-legacy-audit.md | "apps/insurance-portal/project.json polyfills zone.js" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 338 | research/13-portal-legacy-audit.md | "Forms migrated in commits 754aa1e, 66e8ad6, 92053b9" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 339 | research/13-portal-legacy-audit.md | "tmp/control-angular-dev-app/portal-4775-... evidence dir" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 340 | research/13-portal-legacy-audit.md | "@angular/forms/signals appears in 6 files" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 341 | research/14-ai-devtools-prior-art.md | "Storybook clone D:\projects\github\storybookjs\storybook at dc9b30e8fd8" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 342 | research/14-ai-devtools-prior-art.md | "Angular clone at 5db6fc4453 branch 22.2.x" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 343 | research/14-ai-devtools-prior-art.md | "declareExperimentalWebMcpTool returns at once under SSR" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 344 | research/14-ai-devtools-prior-art.md | "Implicit Signal Forms tools registration.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 345 | research/14-ai-devtools-prior-art.md | "Claude in Chrome tool definitions loaded in session" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 346 | research/15-deterministic-and-ai.md | "Angular 22.2.2 spike app" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 347 | research/16-ssr-runtime.md | "CommonEngine deprecated, AngularNodeAppEngine/AngularAppEngine modern" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 348 | research/16-ssr-runtime.md | "platform-server XHR deprecated, fetch default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 349 | research/18-edge-prevent-auto-signin.md | "Edge Stable 155 on Windows fresh profile" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 350 | research/18-edge-prevent-auto-signin.md | "msImplicitSignin, msProfileSignIn feature flags list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 351 | research/18-edge-prevent-auto-signin.md | "HKCU\Software\Policies\Microsoft\Edge registry path" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 352 | research/18-edge-prevent-auto-signin.md | "--bwsi browse-without-sign-in switch" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 353 | research/18-edge-prevent-auto-signin.md | "Edge 157 retires legacy WAM sign-in" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 354 | research/19-languagemodel-in-extension-contexts.md | "DevTools panel page LanguageModel works in Chrome Beta 157 Nano/Gemma4, Chrome 156 Nano, Edge Dev 157 Aion, Edge 155 Phi-4-mini" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 355 | research/19-languagemodel-in-extension-contexts.md | "Hidden devtools.html page refuses LanguageModel" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 356 | research/19-languagemodel-in-extension-contexts.md | "ExtensionPromptService calls LanguageModel in panel itself" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 357 | research/19-languagemodel-in-extension-contexts.md | "raw/19-languagemodel-contexts.json raw results" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 358 | research/20-built-in-ai-without-flags.md | "raw/20-built-in-ai-without-flags.json raw results" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 359 | research/20-built-in-ai-without-flags.md | "Chrome 156, Chrome Beta 157, Edge 155, Edge Dev 157 instances" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 360 | research/20-built-in-ai-without-flags.md | "LanguageModel undefined on Edge web page without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 361 | research/20-built-in-ai-without-flags.md | "Dedicated worker started by panel has all seven globals" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 362 | research/20-built-in-ai-without-flags.md | "LanguageDetector/Translator crash renderer in worker" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 363 | spikes/ng222-app/README.md | "http://localhost:4200/" dev URL | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 364 | spikes/ng222-ssr/README.md | "http://localhost:4200/" dev URL | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
