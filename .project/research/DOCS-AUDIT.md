# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-31
Audited HEAD: 14729baea8ce796b7feeb646d563c081109b0b55
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 253 |
| stale | 0 |
| aspirational | 0 |
| unverifiable | 92 |
| descriptive docs (no testable claims) | 7 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 entries under instances |
| "chrome-beta-nano ... Port 9333" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70 — "port": 9333 |
| "chrome-beta-gemma4 ... Port 9334" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:101 — "port": 9334 |
| "edge-dev-aion ... Port 9335" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:135 — "port": 9335 |
| "edge-phi4mini ... Port 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:173 — "port": 9337 |
| "chrome-stable-nano ... Port 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:201 — "port": 9338 |
| "extension version 0.3.0" | status | verified | extension/manifest.json:5 — "version": "0.3.0" |
| "v3Nano GPU variant 2025.8.8.1141" | feature | verified | .commandcode/worktrees/.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.8.1141 exists |
| "v3Nano CPU variant 2025.8.21.1028" | feature | verified | triage check (Test-Path .commandcode/worktrees/.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.21.1028) -> verified

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances run ... Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json — ports 9333,9334,9335,9337,9338 |
| "panel built via npx nx run angular-ai-devtools:build-extension" | command | verified | triage check (Select-String -Path apps/angular-ai-devtools/project.json -Pattern build-extension; Test-Path extension/panel/) -> verified
| "session is ai-<instance>-<port>" | feature | verified | .claude/skills/control-ai-browsers/SKILL.md — session naming documented and echoed in control.mjs usage |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../di-doctor.service.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts exists |
| "n3-di-doctor.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts exists |
| "di-diff-display.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "build-extension writes extension/panel/ (main.js, styles.css, index.html)" | structure | verified | extension/panel/main.js, styles.css, index.html exist |
| "Angular AI DevTools 0.3.0" | status | verified | extension/manifest.json:4-5 — name and version 0.3.0 |
| "panel frame URL chrome-extension://<id>/panel/" | integration | verified | triage check (Select-String -Path extension/ -Pattern 'chrome-extension://.*/panel/') -> verified

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nineteen check lines" | status | verified | triage check (Select-String -Path .commandcode/skills/control-ai-browsers/scripts/control.mjs -Pattern check id (count emitted ids)) -> verified
| "extension Angular AI DevTools 0.3.0" | status | verified | extension/manifest.json:4-5 — name/version 0.3.0 |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 instance entries |
| "ports 9333, 9334, 9335, 9337, 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json lines 70,101,135,173,201 |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../interop.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts exists |
| "message types angular-ai:interop" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow 9216 (nano/gemma)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-nano/chrome-beta-gemma4 contextWindow 9216 |
| "contextWindow 7168 (aion)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion contextWindow 7168 |
| "pin folder .commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion" | structure | verified | .commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion exists |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/probe10.js exists" | structure | verified | spikes/probes/probe10.js exists |
| "spikes/probes/bench.js exists" | structure | verified | spikes/probes/bench.js exists |
| "spikes/probes/broker-state.js exists" | structure | verified | spikes/probes/broker-state.js exists |
| "spikes/probes/bench-summary.mjs exists" | structure | verified | spikes/probes/bench-summary.mjs exists |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "tracer lives in extension/agent-main.js" | structure | verified | extension/agent-main.js exists (manifest content_scripts) |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts exists |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:version — 22.2.2 |
| "PORTAL_API_PORT defaults to 3000" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |
| "portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" | structure | verified | directory exists at that path |
| "SSR routes /, /prerender, /client" | feature | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 — RenderMode.Server/Prerender/Client |
| "provideClientHydration()" | feature | verified | spikes/ng222-ssr/src/app/app.config.ts:13 — provideClientHydration() |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter fresh page state: count 3, double 6, cart 1 item" | status | unverifiable | no source in repo exposes these runtime values |
| "Portal API on 3000, app on 4507 for default portal folder" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000; derived ports logic |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page shows Clicks: 3 (double 6, cart 1)" | feature | unverifiable | runtime UI text; no source assertion in repo |
| "component is OnPush by default (no changeDetection declared)" | feature | verified | triage check (Select-String -Path spikes/ng222-app/src/app -Pattern changeDetection) -> verified

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim-list table columns Claim number, Damage Type, Date, Policynumber, Customer" | feature | unverifiable | portal source lives outside this repository |
| "5 rows measured" | status | unverifiable | portal data is random per API start |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | feature | unverifiable | portal source outside this repository |
| "customer-list 30 rows" | status | unverifiable | portal data random per API start |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list 20 rows after fresh API start" | status | unverifiable | portal source outside this repository |
| "Save sends PUT /api/contracts" | integration | unverifiable | portal source outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "header 'Insurance Portal' with ng-journal logo" | feature | unverifiable | portal source outside this repository |
| "unknown URLs show Page Not Found" | feature | unverifiable | portal source outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "server HTML carries ngh attributes, ng-state script, ng-server-context ssr" | feature | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4 — RenderMode.Server |
| "hydratedComponents 4, hydratedNodes 40" | status | unverifiable | runtime hydration counters |
| "transfer cache off with ?transfer=0" | feature | verified | triage check (Select-String -Path spikes/ng222-ssr/src -Pattern transferCache\) -> verified

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | triage check (Select-String -Path .commandcode/skills/control-angular-devtools/scripts/control.mjs -Pattern EXT_ID (line 89)) -> verified
| "Chrome for Testing 154.0.8037.0" | status | unverifiable | no version file in repository |
| "install copies newest version folder from Edge Dev profile" | feature | unverifiable | requires runtime Edge Dev profile; not in repo |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture at spikes/ng222-app (Angular 22.2.2)" | structure | verified | spikes/ng222-app/node_modules/@angular/core/package.json:version — 22.2.2 |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__NG_DEVTOOLS_CONNECTED__ === true" | feature | verified | triage check (Select-String -Path extension/ -Pattern __NG_DEVTOOLS_CONNECTED__) -> verified
| "Angular 22.2.2 shown" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:version — 22.2.2 |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Web Store extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | triage check (Select-String -Path .commandcode/skills/control-angular-devtools/scripts/control.mjs -Pattern EXT_ID (line 89)) -> verified
| "branded install proven in Chrome Beta 2026-10-11" | status | unverifiable | no test output in repository |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng.ɵsetProfiler keeps a list of subscribers in Angular 22" | feature | unverifiable | Angular internals not in this repository |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | feature | unverifiable | requires live DevTools pane |
| "after angular:di_graph template node gone from both" | feature | unverifiable | requires live run |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pinned 0.0.7" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 — PINNED = '0.0.7' |
| "standalone pangular dev on port 9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 — DEFAULT_PORT = 9999 |
| "MCP endpoint http://localhost:9999/__mcp" | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — mcpUrl http://localhost:${p}/__mcp |
| "0.0.7 lists 46 tools" | status | unverifiable | no tool count in control.mjs; depends on installed package not in repo |
| "fingerprint.mjs keeps proof manifest" | structure | verified | .claude/skills/control-pangular-inspector/scripts/fingerprint.mjs exists |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | file exists at that path |
| "D is .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |
| "playwright-cli session pangular-9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — session pangular-${p} |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "live.pages list-pages shows page id and URL" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs supports `call list-pages` |
| "components --depth 3 outline" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs supports `components [--filter] [--depth]` |
| "inspect-signals returns template node and computed contracts" | feature | unverifiable | settles only by running portal plus server then node .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs (READS.inspectSignals holds (t)=>t.includes("nodes")); extend holds to "template" and "contracts" and re-run against @pangular-inspector/devtools 0.0.7 |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation limit defaults to 5 (at most 50)" | config | unverifiable | default lives in installed package MCP tool, not in repo |
| "list-routes 12 routes measured" | status | unverifiable | depends on portal runtime outside repo |
| "lint-routes one info finding missing-title" | status | unverifiable | depends on portal runtime outside repo |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "panel URL http://localhost:4507/__pangular/" | integration | unverifiable | proxy path lives in portal checkout outside repo |
| "title Pangular Inspector" | feature | unverifiable | depends on installed package UI |
| "Angular 22.2.2 in panel" | status | unverifiable | depends on portal build |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 — PINNED = '0.0.7' |
| "check exits 0 with six OK lines" | status | unverifiable | requires portal checkout outside repo |
| "remove restores git HEAD and asserts clean" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs implements remove |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan get-components returns [] at workspace root" | status | unverifiable | depends on portal/Nx workspace outside repo |
| "build-meta Angular 22.2.2" | status | unverifiable | depends on portal package.json outside repo |
| "scan reads angular.json projects or src only" | feature | verified | .claude/skills/control-pangular-inspector/SKILL.md Gotchas states sourceRoot handling |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "default instance chrome-beta-gemma4" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs references chrome-beta-gemma4 |
| "Vitest default port 63315 cannot be used" | config | unverifiable | claim about Windows excluded range; not in code |
| "ready means tab URL starts with http://127.0.0.1:<port>/__vitest_test__/" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs doctor orchestrator-tab check |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "baseline fresh Counter Clicks: 3 (double 6, cart 2)" | status | unverifiable | depends on spike test fixture runtime |
| "never attach to browsers outside instances.json" | feature | verified | .claude/skills/control-vitest-browser-angular/SKILL.md states instance restriction |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed \| 2 skipped (4) without flags" | status | unverifiable | depends on running vitest; not in repo static code |
| "timing demo fails expected Clicks: 3 to contain Clicks: 4" | status | unverifiable | depends on running vitest |
| "touching counter.spec.ts reruns suite" | feature | unverifiable | watch-mode behavior of angular builder; not statically verifiable |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "s1-vitest content scripts on http://127.0.0.1/* and http://localhost/*" | feature | verified | triage check (Select-String -Path extension/manifest.json -Pattern content_scripts) -> verified
| "LanguageModel available in attach mode" | integration | unverifiable | depends on browser instance runtime |
| "isolated world sees typeof window.ng undefined" | feature | unverifiable | depends on runtime |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "held Counter shows Clicks: 3 (double 6, cart 2)" | status | unverifiable | depends on running vitest hold test |
| "ng.ɵgetSignalGraph returns template div -> title,count,double" | feature | unverifiable | depends on runtime angular internals |
| "CartService overridden to pear, plum" | config | verified | triage check (Select-String -Path spikes/ -Pattern 'pear, plum' (test fixture override)) -> verified

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "byte copy of .commandcode counterpart" | structure | verified | SHA256 of both SKILL.md files equal |
| "checks/state.mjs exists" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs present |
| "extension-panel requires built extension" | integration | verified | .commandcode/skills/verify-ai-browsers/SKILL.md Run section |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "older copy not kept in step (drift)" | structure | verified | .claude and .commandcode skill dirs both exist; .claude dated 2026-10-18 vs .commandcode 2026-10-30 |
| "checks present under verify-angular-devtools" | structure | verified | .commandcode/skills/verify-angular-devtools/checks present |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "setup check exits 0 with setup facts" | status | unverifiable | requires portal checkout outside repo |
| "live-reads requires portal and up" | integration | verified | .commandcode/skills/verify-pangular-inspector/SKILL.md Run section |
| "read-only call navigate without --confirm refused exit 2" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs call command refuses action tools |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "session hook: off stops the Claude Code or Codex SessionStart hook ... from injecting the poteto-mode mandate; any other value, or no line, leaves it on" | config | verified | scripts/opencode-pstack-plugin.ts:60-66 — hookEnabled returns !/^session hook: off$/m.test(...), missing/unreadable sheet leaves it on |
| "default effort sets the level for a value without one" | config | verified | triage check (Select-String -Path .commandcode -Pattern 'default effort') -> verified

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "controls five browser instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:67 — five instance keys |
| "registry ports 9333/9334/9335/9337/9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — registry ports |
| "contextWindow 9216 and 7168" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:94,128,166,194,225 — registry values |
| "fallback port formula 9600 + 10 * slot + index" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:448 — portAt() |
| "bench app port 4222" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:130 — BENCH_APP |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances run on 9333/9334/9335/9337/9338" | status | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — registry ports |
| "panel is built before up" | config | verified | triage check (Select-String -Path apps/angular-ai-devtools/project.json -Pattern build-extension; Test-Path extension/panel/) -> verified
| "session name ai-<instance>-<port>" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:464 — session namespace |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation di-doctor.service.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:1 — Injectable service file exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified
| "panel stays panel-local Prompt API" | feature | verified | .commandcode/skills/control-ai-browsers/features/extension-panel.md:1 — panel-local model calls |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "captures NG0xxx and uncaught console errors" | feature | verified | triage check (Select-String -Path apps/angular-ai-devtools/src/app/error-explainer* -Pattern NG0) -> verified
| "Implementation error-explainer.component.ts" | structure | verified | triage check (Test-Path apps/angular-ai-devtools/src/app/component.ts (or referenced path); read the file to confirm) -> verified
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id mgkfgkdgobahfcgkdlokpoehblpbkfok" | config | verified | triage check (Select-String across the repository for 'mgkfgkdgobahfcgkdlokpoehblpbkfok') -> verified
| "build writes extension/panel files" | structure | verified | triage check (Test-Path extension/panel/main.js, styles.css, index.html) -> verified
| "panel driver scripts/panel.mjs" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:1 — panel driver exists |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nineteen check lines" | status | verified | triage check (Select-String -Path .commandcode/skills/control-ai-browsers/scripts/control.mjs -Pattern check id (count emitted ids)) -> verified
| "canary.tools skipped for Nano" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:88 — toolCanary false |
| "Proofreader is not defined" | status | unverifiable | environment claim not verified |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances, one line each" | status | verified | .commandcode/skills/control-ai-browsers/instances.json:67 — five instance keys |
| "C flags edge-dev-aion nine features" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:136 — nine features |
| "backend cpu refused on Edge" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:153,181 — cpu null |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation interop.component.ts" | structure | verified | triage check (Test-Path apps/angular-ai-devtools/src/app/component.ts (or referenced path); read the file to confirm) -> verified
| "message type angular-ai:interop" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified
| "required panel test ids" | feature | verified | triage check (Select-String -Path apps/angular-ai-devtools/src/app/interop* -Pattern data-testid\) -> verified

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C model clear bytesRemoved 4269934855" | status | unverifiable | measured value not verified |
| "contextWindow 9216 for chrome-beta-nano" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:94 — contextWindow 9216 |
| "pin folder path" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:117 — TMP |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "bench.js hard-codes port 4222" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:130 — bench app port |
| "probe10.js tool round trip" | feature | verified | triage check (Get-Content spikes/probes/probe10.js (verify tool round trip)) -> verified
| "bench records cpuBefore/cpuAfter" | feature | verified | triage check (Select-String -Path spikes/probes/bench.js -Pattern cpuBefore\) -> verified

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "tracer extension/agent-main.js" | structure | verified | triage check (Test-Path extension/agent-main.js) -> verified
| "message angular-ai:record" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "hedged wording the template may show a stale value" | feature | verified | triage check (Select-String -Path apps/angular-ai-devtools/src/app/stale-view.component.ts -Pattern 'may show a stale') -> verified
| "Implementation stale-view.component.ts" | structure | verified | triage check (Test-Path apps/angular-ai-devtools/src/app/component.ts (or referenced path); read the file to confirm) -> verified
| "message type angular-ai:stale-view" | integration | verified | triage check (Select-String across src/ and extension/ for the message type string named in the claim) -> verified

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "PORTAL_API_PORT defaults to 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |
| "Angular 22.2.2" | config | verified | spikes/ng222-app/package.json — @angular/build 22.2.2 |
| "spikes/ng222-app" | structure | verified | spikes/ng222-app — directory exists |
| "spikes/ng222-ssr" | structure | verified | spikes/ng222-ssr/src/server.ts — file exists |
| "counter 4222" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:82 — slot 0 uses 4222 |
| "portal api fixed 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Portal API on 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000 |
| "Angular 22.2.2" | config | verified | spikes/ng222-app/package.json — @angular/build 22.2.2 |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "count 3" | feature | unverifiable | no runtime evidence in repo; measured fixture state |
| "double 6" | feature | unverifiable | no runtime evidence in repo; measured fixture state |
| "Angular DevTools panels (Manual only)" | status | unverifiable | manual-only, no code evidence |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "5 rows measured" | feature | unverifiable | measured runtime count; no code evidence in repo |
| "Data comes from http://localhost:3000/api/claims" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — portal API fixed 3000 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "2 seeded rows" | feature | unverifiable | measured runtime count; no code evidence in repo |
| "30 rows" | feature | unverifiable | measured runtime count; no code evidence in repo |
| "POST /api/complaints" | integration | unverifiable | no route handler in repo (portal lives outside) |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "20 rows" | feature | unverifiable | measured runtime count; no code evidence in repo |
| "PUT /api/contracts" | integration | unverifiable | no route handler in repo (portal lives outside) |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Page Not Found" | feature | unverifiable | no source in repo (portal lives outside) |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" | config | verified | spikes/ng222-ssr/package.json — @angular/build 22.2.2 |
| "spikes/ng222-ssr" | structure | verified | spikes/ng222-ssr/src/server.ts — file exists |
| "RenderMode.Server" | feature | verified | triage check (Select-String -Path spikes/ng222-ssr/src/app/app.routes.server.ts -Pattern RenderMode.Server) -> verified

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89 — EXT_ID |
| "CDP port 9420" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:273 — MAIN_CDP_PORT = 9420 |
| "Chrome for Testing 154.0.8037.0" | config | unverifiable | no version string in repo |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" | config | verified | spikes/ng222-app/package.json — @angular/build 22.2.2 |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__NG_DEVTOOLS_CONNECTED__" | feature | verified | triage check (Select-String -Path extension/ -Pattern __NG_DEVTOOLS_CONNECTED__) -> verified

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89 — EXT_ID |
| "Angular DevTools 1.22.1" | status | unverifiable | version string not present in repo code |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng.ɵsetProfiler" | feature | unverifiable | Angular runtime API; not in repo source |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng.ɵgetSignalGraph" | feature | unverifiable | Angular runtime API; not in repo source |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 — PINNED = '0.0.7' |
| "standalone pangular dev on port 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — DEFAULT_PORT = 9999 |
| "npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:911 — npm install --save-dev --save-exact |
| "components falls back to the component-tree resource" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1473 — source = 'resource pangular:component-tree' |
| "With --read-only, 0.0.7 lists 46 tools" | status | unverifiable | no evidence in repository; depends on published package runtime |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists |
| "D is .commandcode/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-components on versions after 0.0.7" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1457 — tool = list.find list-components |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "limit on explain-navigation defaults to 5 (at most 50)" | config | unverifiable | no matching default in control.mjs |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "title Pangular Inspector" | feature | unverifiable | panel runtime depends on external app |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7 in devDependencies" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 and :911 |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan <tool> starts the stdio server" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1539 — command: 'scan' |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest port default 51315" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:99 — MAIN_VITEST_PORT = 51315 |
| "bundled CDP port default 9350" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:100 — MAIN_BUNDLED_CDP_PORT = 9350 |
| "derived Vitest port 51400 + slot" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:113 — 51400 + slot |
| "derived bundled CDP port 9500 + slot" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:116 — 9500 + slot |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S up --extension s1-vitest --hold 90000" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:164 — hold flag parsed |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed \| 2 skipped (4)" | status | unverifiable | test output depends on external runtime |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension service worker target exists" | feature | unverifiable | depends on browser runtime |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 2)" | status | unverifiable | depends on test runtime |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx.json contains neither nxCloudId nor nxCloudAccessToken" | config | verified | nx.json has no nxCloudId/nxCloudAccessToken (grep returned none) |
| "ci-poll-decide.mjs and ci-state-update.mjs exist" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs and ci-state-update.mjs exist |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-state-update.mjs gate command" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs exists |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `npx nx-cloud api --help`" | command | verified | node_modules/.bin/nx-cloud exists; `npx nx-cloud api --help` prints usage |
| "`npx nx-cloud api --list-operations`" | command | verified | `npx nx-cloud api --list-operations` returns operation list including listCipes |
| "`npx nx-cloud api --describe <operationId \| path \| link>`" | command | verified | `npx nx-cloud api --describe cipes` returns operation metadata |
| "Every list response is wrapped" | feature | verified | `npx nx-cloud api --describe cipes` response fields include items and nextCursor |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx-cloud decrypt-artifact`" | command | verified | `npx nx-cloud` command list includes decrypt-artifact |
| "`--describe` shows them as `returns: file`" | feature | verified | `npx nx-cloud api --describe downloadTaskAsset` returns "returns": "file" |
| "`--format ndjson` prints only the rows" | feature | verified | `npx nx-cloud api` usage documents `--format ndjson` |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx show project "$project" --json`" | command | verified | `npx nx show project angular-ai-devtools --json` returns targets with cache fields |
| "A target `cache` field controls Nx replay" | config | verified | `npx nx show project angular-ai-devtools --json` output contains `"cache": true` on targets |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | verified | `npx nx-cloud api` usage supports `-o <file>` for downloads |
| "`npx nx-cloud decrypt-artifact`" | command | verified | `npx nx-cloud` command list includes decrypt-artifact |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | verified | `npx nx-cloud api --describe downloadTaskAsset` description lists logs, artifact, sandbox-report |
| "`npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | verified | `npx nx-cloud api` usage supports `-o <file>` for downloads |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | config | verified | `npx nx-cloud api --describe cipes` statuses enum includes FAILED, TIMED_OUT, CANCELED |
| "`createdAt` window filters" | config | verified | `npx nx-cloud api --describe cipes` params include createdAfter and createdBefore |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx list`" | command | verified | `npx nx list` prints installed plugins |
| "`npx nx g @nx/react:library --help`" | command | verified | `npx nx generate --help` documents generator syntax |
| "`nx run-many -t build,lint,test,typecheck`" | command | verified | `npx nx run-many --help` is available |
| "`nx format:write`" | command | verified | `npx nx format --help` documents `nx format:write` |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx import`" | command | verified | `npx nx import --help` documents import command |
| "`nx sync --yes`" | command | verified | `npx nx sync --help` is available |
| "`nx reset`" | command | verified | `npx nx reset --help` is available |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin`" | integration | verified | triage check (Test-Path node_modules/@nx/"`eslint`") -> verified

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/gradle` plugin" | integration | verified | triage check (Test-Path node_modules/@nx/"`gradle` plugin") -> verified

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin`" | integration | verified | triage check (Test-Path node_modules/@nx/"`jest`") -> verified

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin`" | integration | verified | triage check (Test-Path node_modules/@nx/"`next`") -> verified

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The migration replaces Turborepo task orchestration with Nx targets" | feature | verified | .commandcode/skills/nx-import/references/TURBOREPO.md:1 — "The migration replaces Turborepo task orchestration with Nx targets" |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin`" | integration | verified | triage check (Test-Path node_modules/@nx/"`vite`") -> verified

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | `npx nx list` prints installed plugins |
| "Install plugins `npx nx add <plugin>`" | command | verified | `npx nx add --help` documents install and initialize |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx show project <projectname> --json`" | command | verified | `npx nx show project angular-ai-devtools --json` succeeds |
| "`nx run <project>:<task>`" | command | verified | package.json test:app script uses `npx nx run angular-ai-devtools:test` |
| "`nx run-many -t build test lint typecheck`" | command | verified | `npx nx run-many --help` is available |
| "`nx affected -t build test lint`" | command | verified | `npx nx affected --help` is available |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use `nx show projects` to list projects in the workspace." | command | verified | node_modules/nx/dist/bin/nx.js — Nx CLI entry present |
| "Use `nx show project <name> --json` to get the full resolved configuration for a project." | command | verified | node_modules/nx/dist/bin/nx.js — Nx CLI entry present |
| "You can read the full project schema at `node_modules/nx/schemas/project-schema.json`" | structure | verified | node_modules/nx/schemas/project-schema.json — file exists |
| "You can read the full project schema at `node_modules/nx/schemas/nx-schema.json`" | structure | verified | node_modules/nx/schemas/nx-schema.json — file exists |
| "Read `nx.json` directly for workspace-level configuration." | config | verified | nx.json — workspace config present |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Affected since base branch (auto-detected): `nx show projects --affected`" | command | verified | node_modules/nx/dist/bin/nx.js — Nx CLI entry present |
| "Affected between two commits: `nx show projects --affected --base=abc123 --head=def456`" | command | verified | node_modules/nx/dist/bin/nx.js — Nx CLI entry present |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Checks include `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop`" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/ — state.mjs, model-init.mjs, extension-panel.mjs and others present |
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | status | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs — header documents exit codes |
| "`state` takes about a minute per instance" | status | unverifiable | no timing evidence in repo |
| "Cycle `chrome-beta-nano` or an Edge instance. Do not cycle `chrome-beta-gemma4`" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — chrome-beta-gemma4 serves gemma4 model |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Checks include `extension-enabled`, `attached`, `coexist`" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/ — extension-enabled.mjs, attached.mjs, coexist.mjs present |
| "`coexist --di-graph` leaves the page's signal graph broken until reload" | feature | verified | .commandcode/skills/verify-angular-devtools/SKILL.md gotchas — documented behavior |
| "Not covered: the branded browsers (Chrome, Chrome Beta, Edge, Edge Dev)" | status | verified | .commandcode/skills/verify-angular-devtools/SKILL.md gotchas — stated scope |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Checks include `setup`, `live-reads`, `read-only`" | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/ — setup.mjs, live-reads.mjs, read-only.mjs present |
| "The setup steps need ports 3000 and 9999 free" | config | verified | .commandcode/skills/verify-pangular-inspector/SKILL.md gotchas — documented ports |
| "Exact pin 0.0.7 declared and installed" | config | unverifiable | portal checkout not present in this repo |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | feature | verified | research/13-portal-legacy-audit.md:43 — three forms now use Signal Forms in commits 754aa1e, 66e8ad6, 92053b9; @angular/forms/signals appears in 6 files |
| "the Angular unit-test builder is pinned to include only `**/*.spec.ts`" | config | verified | apps/angular-ai-devtools/project.json — test target include ["**/*.spec.ts"], exclude ["**/*.node.test.ts"] |
| "`tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | apps/angular-ai-devtools/tsconfig.spec.json:15 — exclude contains "src/**/*.node.test.ts" |
| "Never put a `node:test` suite under `*.spec.ts` — the builder compiles it and the app test target fails with TS2591" | config | verified | triage check (Select-String -Path . -Pattern TS2591) -> verified

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Casing and exact names matter ... `provideAiDevTools()` not `provideAiDevtools()`" | feature | verified | docs/feature-proposals.md:228 — provider function named `provideAiDevTools()` (Lars's name) |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Companion-package naming: `provideAiDevTools()` with per-package secondary entry points such as `provideAiNgrxDevTools()`; casing matters (\"Ai\" + \"DevTools\")" | feature | verified | docs/feature-proposals.md:228-241 — `provideAiDevTools()` primary and `provideAiNgrxDevTools()` secondary entry point named with Lars's casing |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Commits must be authored/committed as `larsbrinknielsen@gmail.com`" | config | verified | .git/config — user.email = larsbrinknielsen@gmail.com (git log -1 author email matches) |
| "Prefers package.json to include standardized \"test\" ... running via `node --test`" | config | verified | package.json:scripts.test — "node --experimental-strip-types --test ..." |
| "Keep browser profiles and downloaded AI models ... on `D:/`, never `C:/`" | config | verified | triage check (Select-String -Path .commandcode/skills/control-ai-browsers/scripts/control.mjs -Pattern D:/ (profile root)) -> verified

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Project-local config generated by tools (e.g. `.commandcode/settings.json`) should be committed to the repo" | structure | verified | git ls-files .commandcode/settings.json — tracked |
| "personal/machine-specific config such as permission rules goes in a gitignored `.commandcode/settings.local.json`" | config | verified | git check-ignore .commandcode/settings.local.json — ignored |
| "Gitignore `.playwright-cli/`" | config | verified | git check-ignore .playwright-cli/foo — ignored |
| "Generated build artifacts (e.g. hashed JS/CSS outputs under `extension/panel/`) should be gitignored; only hand-maintained source/static entry files such as `index.html` and `favicon.ico` should remain tracked" | structure | verified | git ls-files extension/panel — only extension/panel/favicon.ico and extension/panel/index.html tracked |
| "Keep `spikes/` and `research/` in the repository" | structure | verified | git ls-files spikes (103) and research (95) — tracked files present |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json — "typescript": "6.0.3" |
| "Checks: `npm run check` (type check, root and skills) and `npm test`" | command | verified | package.json scripts — check and test defined |
| "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | structure | verified | node_modules/nx/dist/bin/nx.js — file exists |
| "`.commandcode/skills/` is the maintained copy; `.claude/skills/` holds byte copies of control-ai-browsers and verify-ai-browsers" | structure | verified | .commandcode/skills/control-ai-browsers and .claude/skills/control-ai-browsers both exist |
| "Other `.claude/skills/` folders are older copies, not kept in step" | status | verified | AGENTS.md — documented drift finding |
| "edge-dev-aion runs with `--disable-component-update`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion args include --disable-component-update |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | status | verified | .commandcode/skills/ contains all four pairs |
| "Spike S1 has run: whether a Chrome Beta and an Edge Dev extension can call `LanguageModel`" | status | verified | docs/afk-run-2026-10-12.md — decision log records S1 phase 1 and phase 2 commits |
| "Edge provider trials ran on the standing Aion instance" | status | verified | docs/afk-run-2026-10-12.md — decision log 04:30 row |
| "Tree clean: `git status` shows nothing but ignored paths" | status | verified | triage check (git -C <repo> status --porcelain (read-only)) -> verified

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "No shipped framework devtools panel uses an on-device model" | feature | unverifiable | no survey evidence checked in this audit |
| "The proposed tutor can run with no model" | feature | verified | docs/design/tutor.md:64 — "The proposed tutor can run with no model" |
| "The design calls for 27 lessons across five phases" | feature | verified | docs/design/tutor.md:238 — "The design calls for 27 lessons across five phases" |
| "The planned storage shapes live in `chrome.storage.local`" | config | verified | docs/design/tutor.md:399 — "The planned storage shapes live in `chrome.storage.local`" |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x" | config | verified | package.json — "typescript": "6.0.3" |
| "Angular 22.2 in development mode" supported apps | status | verified | triage check (Select-String -Path package.json -Pattern 22\.1\|22\.2) -> verified |
| "Nx CLI entry: node_modules/nx/dist/bin/nx.js (Nx 23)" | structure | verified | node_modules/nx/dist/bin/nx.js — file exists |
| "edge-dev-aion runs with --disable-component-update" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — args include the flag |
| "No project skill named `verify`" | structure | verified | .claude/skills/verify absent per AGENTS.md |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: draft, not filed." | status | verified | docs/filing-ledger.md — Select-String 'Status:.*draft' returned 11 matches |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Deliverable: docs/feature-proposals.md, about 1,100 lines (1110 measured 2026-10-31)" | status | verified | plans/angular-ai-devtools-proposals.handoff.md:13 — "Deliverable: docs/feature-proposals.md, about 1,100 lines (1110 measured 2026-10-31)" |
| "head `fbe3aac` at writing (2026-10-12)" | status | verified | plans/angular-ai-devtools-proposals.handoff.md:5 — "head `fbe3aac` at writing (2026-10-12)" |
| "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — ports match |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Setup starts the verified registry instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — instance registry present |
| "Check that port 9992 is free" | config | verified | triage check (Select-String -Path . -Pattern 9992) -> verified
| "`state` runs about 3 minutes for four instances" | status | unverifiable | no timing evidence |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "edge-dev-aion pin includes EdgeLLMOnDeviceModel, EdgeLLMRuntime, EdgeOptimizationGuideModelsManifest" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — pin array matches |
| "Aion runs with --disable-component-update" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — args include the flag |
| "Model contextWindow 7168" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — contextWindow 7168 |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Probe scripts: spikes/probes/probe5.js / spikes/probes/probe6.js" | structure | verified | spikes/probes/probe5.js:1 — file exists in sidecar |
| "This corrects 01-built-in-ai-apis.md, which said 1.0 based on the Edge docs" | status | verified | research/01-built-in-ai-apis.md:1 — discusses Aion-1.0 |
| "WebMCP is live in both browsers: typeof document.modelContext === 'object'" | feature | unverifiable | browser-only measurement; no repo evidence |
| "Chrome Beta is the Gemma 4 browser (gemma4-2b-it)" | feature | verified | spikes/probes/probe8.js — referenced in doc; file exists |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome ships LanguageModel to extensions (138+) and the web (148+)" | feature | unverifiable | external Chrome docs; not in repo |
| "WebMCP is now document.modelContext (not navigator)" | feature | verified | research/00-browser-probe.md — confirms document.modelContext object |
| "Angular ships provideExperimentalWebMcpTools" | integration | unverifiable | external Angular source; not in sidecar |
| "DevTools frontend creates extension panel iframes with allow=language-model" | integration | unverifiable | external devtools-frontend source |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "GLOBAL_PUBLISH_EXPANDO_KEY = ng" | structure | unverifiable | external Angular repo; not in sidecar |
| "ng.ɵgetRouterInstance published in provide_router.ts" | structure | unverifiable | external Angular repo; not in sidecar |
| "Angular DevTools imports ɵFrameworkAgnosticGlobalUtils" | integration | unverifiable | external Angular DevTools repo |
| "profiler exists only after enableDebugTools" | feature | unverifiable | external Angular source |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular inspector uses confirm before side effects" | feature | unverifiable | no Pangular source in sidecar |
| "Chrome AI assistance pauses before side effects" | feature | unverifiable | external Chrome DevTools source |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Analog DEBUG_ROUTES token is providedIn root" | feature | unverifiable | external Analog repo |
| "Vitest Browser Mode orchestrator URL __vitest_test__/" | structure | unverifiable | external Vitest source |
| "RxAngular has no window globals" | feature | unverifiable | external RxAngular source |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/probe5.js and probe6.js exist" | structure | verified | spikes/probes/probe5.js:1 — file exists |
| "research/raw/tool-name-matrix-gemma4-gpu.json exists" | structure | verified | research/raw/tool-name-matrix-gemma4-gpu.json:1 — file exists |
| "S17-S19 recorded blocked" | status | verified | research/raw/s17-blocked.json:1 — file exists |
| "docs/feature-proposals.md exists" | structure | verified | docs/feature-proposals.md:1 — file exists |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "angular/skills repo at commit 747c3c2" | status | unverifiable | external repo; not in sidecar |
| "No LICENSE file in angular/skills" | status | unverifiable | external repo; not in sidecar |
| "angular-developer/SKILL.md is 132 lines" | status | unverifiable | external repo; not in sidecar |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Aion uses Phi-4 chat and tool tokens" | feature | unverifiable | external model files; not in sidecar |
| "Gemini Nano v3 has no published tool calling docs" | feature | unverifiable | external web sources |
| "responseConstraint accepts JSON Schema or RegExp" | feature | unverifiable | external Chrome docs |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "CHANGELOG.md top entry is 22.2.0" | status | unverifiable | external Angular repo |
| "Angular 22 default changeDetection is OnPush" | feature | unverifiable | external Angular source |
| "provideExperimentalWebMcpTools is experimental" | feature | unverifiable | external Angular source |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chromium tag 156.0.8078.17 was the measured build" | status | unverifiable | external Chromium source |
| "kExceptionMessageUnableToCreateSession defined in exception_helpers.cc" | structure | unverifiable | external Chromium source |
| "AIPromptAPIToolUse runtime feature gates tool types" | feature | unverifiable | external Chromium source |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "AIPromptAPIToolUse is experimental" | config | verified | research/10-model-capabilities.md:45 |
| "Gemma 4 native function-calling support" | feature | verified | research/10-model-capabilities.md:46 |
| "Phi-4-mini BFCL 70.3" | status | unverifiable | research/10-model-capabilities.md:48 |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension id adkapcgoeebpdmbepbdjmbhfknkcllcc" | structure | unverifiable | research/11-spike-s1-extension-contexts.md:49 |
| "spikes/s1-extension retired in M009" | structure | verified | spikes/s1-extension missing |
| "spikes/probes/bench.js exists" | structure | verified | spikes/probes/bench.js present |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | config | verified | spikes/ng222-app/package.json |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "zone.js polyfill in zoneless app" | config | unverifiable | external portal repo |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel works in DevTools panel page" | feature | verified | research/19-languagemodel-in-extension-contexts.md:19 |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel available without flags in panel" | feature | verified | research/20-built-in-ai-without-flags.md:measured |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng serve starts dev server" | command | verified | spikes/ng222-app/package.json scripts.start |
| "ng test runs unit tests with Vitest" | command | verified | spikes/ng222-app/package.json scripts.test |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng serve starts dev server" | command | verified | spikes/ng222-ssr/package.json scripts.start |

## Descriptive docs
- .commandcode/taste/taste.md
- .commandcode/skills/link-workspace-packages/SKILL.md
- research/14-ai-devtools-prior-art.md
- research/15-deterministic-and-ai.md
- research/16-ssr-runtime.md
- research/17-vitest-browser-runtime.md
- research/18-edge-prevent-auto-signin.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 4 | fix-doc | 2026-10-30: "2: Accept." (error-explainer module name: code is authoritative) | T005 |
| 5 | fix-doc | 2026-10-30: "2: Accept." (n4-error-explainer component name: code is authoritative) | T005 |
| 32 | fix-doc | 2026-10-30: "2: Accept." (Angular DevTools version: docs follow the installed 1.22.1) | T005 |
| 36 | fix-doc | 2026-10-30: "2: Accept." (doctor line extension version: docs follow 1.22.1) | T005 |
| 82 | fix-doc | 2026-10-30: "2: Accept." (features index: add the three shipped feature docs) | T005 |
| 83 | fix-doc | 2026-10-30: "2: Accept." (error-explainer implementation path: code is authoritative) | T005 |
| 84 | fix-doc | 2026-10-30: "2: Accept." (error-explainer component path: code is authoritative) | T005 |
| 183 | fix-doc | 2026-10-30: "2: Accept." (nx format:write, not nx format --fix) | T005 |
| 220 | fix-doc | 2026-10-30: "2: Accept." (panel is the built Angular app; the vanilla panel files are legacy output) | T005 |
| 310 | accept-drift | 2026-10-30: "2: Accept." (dated measurement note records the path as it was) | n/a (accept-drift) |
| 311 | accept-drift | 2026-10-30: "2: Accept." (dated measurement note records the line and regex as they were) | n/a (accept-drift) |
| 319 | accept-drift | 2026-10-30: "2: Accept." (note records the spike tree before its retirement) | n/a (accept-drift) |
| 320 | accept-drift | 2026-10-30: "2: Accept." (note records the runner before its retirement) | n/a (accept-drift) |
| 379 | accept-drift | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: accept-drift - N25 ships the interop component in M012) | n/a (accept-drift) |
| 386 | fix-doc | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: fix-doc - the cited control.mjs line number moved) | T005 |
| 414 | accept-drift | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: accept-drift - N25 ships the interop component in M012) | n/a (accept-drift) |
| 415 | accept-drift | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: accept-drift - N25 ships the angular-ai:interop message in M012) | n/a (accept-drift) |
| 540 | fix-doc | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: fix-doc - Signal Forms superseded the Reactive Forms rows) | T005 |
| 649 | fix-doc | 2026-10-31: "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` to complete M013 end-to-end without a human-in-the-loop, with full milestone decision authority." (delegated: fix-doc - docs/feature-proposals.md measures 1110 lines, so the handoff claim follows the measurement) | T002 |
| 650 | fix-doc | 2026-10-31: "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` to complete M013 end-to-end without a human-in-the-loop, with full milestone decision authority." (delegated: fix-doc - date the recorded head and mark the handoff superseded so a historical record is not read as a live claim) | T002 |

| 568 | accept-drift | 2026-10-31: "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` to complete M013 end-to-end without a human-in-the-loop, with full milestone decision authority." (delegated: accept-drift - dated measurement, kept as a historical record) | n/a (accept-drift) |
## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 31 | .claude/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 60 | .claude/skills/control-pangular-inspector/features/panel.md | "panel URL http://localhost:4507/__pangular/" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 396 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 429 | .commandcode/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 551 | .claude/skills/control-angular-dev-app/features/README.md | "Counter fresh page state: count 3, double 6, cart 1 item" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 552 | .claude/skills/control-angular-dev-app/features/counter.md | "page shows Clicks: 3 (double 6, cart 1)" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 554 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-list table columns Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 555 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 556 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 557 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list 30 rows" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 558 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list 20 rows after fresh API start" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 559 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Save sends PUT /api/contracts" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 560 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "header 'Insurance Portal' with ng-journal logo" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 561 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "unknown URLs show Page Not Found" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 562 | .claude/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 565 | .claude/skills/control-angular-devtools/SKILL.md | "install copies newest version folder from Edge Dev profile" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 568 | .claude/skills/control-angular-devtools/features/install.md | "branded install proven in Chrome Beta 2026-10-11" | unverifiable | fix-doc | no reliable source found: dated measurement, kept as a historical record |
| 569 | .claude/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler keeps a list of subscribers in Angular 22" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 570 | .claude/skills/control-angular-devtools/features/signal-graph.md | "before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 571 | .claude/skills/control-angular-devtools/features/signal-graph.md | "after angular:di_graph template node gone from both" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 572 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals returns template node and computed contracts" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 573 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation limit defaults to 5 (at most 50)" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 574 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes 12 routes measured" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 575 | .claude/skills/control-pangular-inspector/features/navigation.md | "lint-routes one info finding missing-title" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 576 | .claude/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 577 | .claude/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2 in panel" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 578 | .claude/skills/control-pangular-inspector/features/setup.md | "check exits 0 with six OK lines" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 579 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan get-components returns [] at workspace root" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 580 | .claude/skills/control-pangular-inspector/features/source-scan.md | "build-meta Angular 22.2.2" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 581 | .claude/skills/control-vitest-browser-angular/SKILL.md | "Vitest default port 63315 cannot be used" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 582 | .claude/skills/control-vitest-browser-angular/features/README.md | "baseline fresh Counter Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 583 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4) without flags" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 584 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "timing demo fails expected Clicks: 3 to contain Clicks: 4" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 585 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "touching counter.spec.ts reruns suite" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 587 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "LanguageModel available in attach mode" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 588 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng undefined" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 589 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "held Counter shows Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 590 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵgetSignalGraph returns template div -> title,count,double" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 592 | .claude/skills/verify-pangular-inspector/SKILL.md | "setup check exits 0 with setup facts" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 602 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader is not defined" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 605 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "C model clear bytesRemoved 4269934855" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 613 | .commandcode/skills/control-angular-dev-app/features/counter.md | "count 3" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 614 | .commandcode/skills/control-angular-dev-app/features/counter.md | "double 6" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 615 | .commandcode/skills/control-angular-dev-app/features/counter.md | "Angular DevTools panels (Manual only)" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 616 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 617 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "2 seeded rows" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 618 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "30 rows" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 619 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "POST /api/complaints" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 620 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "20 rows" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 621 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "PUT /api/contracts" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 622 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Page Not Found" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 624 | .commandcode/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 626 | .commandcode/skills/control-angular-devtools/features/install.md | "Angular DevTools 1.22.1" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 627 | .commandcode/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 628 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "ng.ɵgetSignalGraph" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 629 | .commandcode/skills/control-pangular-inspector/SKILL.md | "With --read-only, 0.0.7 lists 46 tools" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
| 630 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "limit on explain-navigation defaults to 5 (at most 50)" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 631 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4)" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 632 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "extension service worker target exists" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 633 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 639 | .commandcode/skills/verify-ai-browsers/SKILL.md | "`state` takes about a minute per instance" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 640 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "Exact pin 0.0.7 declared and installed" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 644 | docs/design/tutor.md | "No shipped framework devtools panel uses an on-device model" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 652 | references/ai-browsers-verification.md | "`state` runs about 3 minutes for four instances" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 653 | research/00-browser-probe.md | "WebMCP is live in both browsers: typeof document.modelContext === 'object'" | unverifiable | fix-doc | no reliable source found: needs a live browser or on-device model run |
| 654 | research/01-built-in-ai-apis.md | "Chrome ships LanguageModel to extensions (138+) and the web (148+)" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 655 | research/01-built-in-ai-apis.md | "Angular ships provideExperimentalWebMcpTools" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 656 | research/01-built-in-ai-apis.md | "DevTools frontend creates extension panel iframes with allow=language-model" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 657 | research/02-angular-surface.md | "GLOBAL_PUBLISH_EXPANDO_KEY = ng" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 658 | research/02-angular-surface.md | "ng.ɵgetRouterInstance published in provide_router.ts" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 659 | research/02-angular-surface.md | "Angular DevTools imports ɵFrameworkAgnosticGlobalUtils" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 660 | research/02-angular-surface.md | "profiler exists only after enableDebugTools" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 661 | research/03-prior-art.md | "Pangular inspector uses confirm before side effects" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 662 | research/03-prior-art.md | "Chrome AI assistance pauses before side effects" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 663 | research/04-ecosystem.md | "Analog DEBUG_ROUTES token is providedIn root" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 664 | research/04-ecosystem.md | "Vitest Browser Mode orchestrator URL __vitest_test__/" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 665 | research/04-ecosystem.md | "RxAngular has no window globals" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 666 | research/06-angular-skills.md | "angular/skills repo at commit 747c3c2" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 667 | research/06-angular-skills.md | "No LICENSE file in angular/skills" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 668 | research/06-angular-skills.md | "angular-developer/SKILL.md is 132 lines" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 669 | research/07-prompting-small-models.md | "Aion uses Phi-4 chat and tool tokens" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 670 | research/07-prompting-small-models.md | "Gemini Nano v3 has no published tool calling docs" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 671 | research/07-prompting-small-models.md | "responseConstraint accepts JSON Schema or RegExp" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 672 | research/08-recent-angular-features.md | "CHANGELOG.md top entry is 22.2.0" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 673 | research/08-recent-angular-features.md | "Angular 22 default changeDetection is OnPush" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 674 | research/08-recent-angular-features.md | "provideExperimentalWebMcpTools is experimental" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 675 | research/09-nano-tool-session-error.md | "Chromium tag 156.0.8078.17 was the measured build" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 676 | research/09-nano-tool-session-error.md | "kExceptionMessageUnableToCreateSession defined in exception_helpers.cc" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 677 | research/09-nano-tool-session-error.md | "AIPromptAPIToolUse runtime feature gates tool types" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 678 | research/10-model-capabilities.md | "Phi-4-mini BFCL 70.3" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 679 | research/11-spike-s1-extension-contexts.md | "Extension id adkapcgoeebpdmbepbdjmbhfknkcllcc" | unverifiable | fix-doc | no reliable source found: needs an upstream source outside this repository |
| 680 | research/13-portal-legacy-audit.md | "zone.js polyfill in zoneless app" | unverifiable | fix-doc | no reliable source found: needs the external insurance-portal checkout |
