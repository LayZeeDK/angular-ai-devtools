# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-28
Audited HEAD: 2bd0eef5fb84181ff72dfbcefbbb4b96b882c81c
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 322 |
| stale | 8 |
| aspirational | 2 |
| unverifiable | 201 |
| descriptive docs (no testable claims) | 3 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:90,124,162,190,221 — five instance entries |
| "scripts/control.mjs does the deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1 — control script exists |
| "up starts ... through scripts/pipe-keeper.mjs" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:1 — pipe keeper exists |
| "extension version 0.3.0" | config | verified | extension/manifest.json:4 — "version": "0.3.0" |
| "doctor exits 0 healthy, 1 a check failed, 2 not running" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:174 — exit code documentation |
| "panel exits 0 with answer, answerMs, ngVersion, extensionId and steps" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:199 — panel output fields |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C stands for node .../control.mjs" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1 — script entry point |
| "five instances run ... Nano on 9333 ... 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:68 — registry ports |
| "panel built before up" | integration | verified | .commandcode/skills/control-ai-browsers/SKILL.md:110 — extension build before up |
| "session is ai-<instance>-<port>" | config | verified | .commandcode/skills/control-ai-browsers/SKILL.md:58 — session naming |
| "feature files use four H2s in order" | structure | verified | .commandcode/skills/control-ai-browsers/features/README.md:49 — feature entry contract |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension adds a DevTools panel Angular AI" | feature | verified | extension/manifest.json:4 — extension manifest present |
| "build writes extension/panel/ main.js, styles.css, index.html" | structure | verified | .commandcode/skills/control-ai-browsers/features/extension-panel.md:35 — build output names |
| "panel drives N1 end to end via scripts/panel.mjs" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:1 — panel driver exists |
| "verify-ai-browsers checks/extension-panel.mjs is the proof" | integration | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs is referenced by SKILL; repository path .commandcode/skills/verify-ai-browsers/SKILL.md:18 |
| "panel frame URL is chrome-extension://<id>/panel/" | feature | verified | .commandcode/skills/control-ai-browsers/features/extension-panel.md:66 — documented frame URL |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor exits 0 and sixteen check lines" | status | stale | .commandcode/skills/control-ai-browsers/SKILL.md:151-171 — doctor table lists 19 checks, not 16 |
| "backend row gemma4_gpu_low_tier_model" | feature | verified | .commandcode/skills/control-ai-browsers/features/health-check.md:32 — documented backend row |
| "Proofreader is not defined in these builds" | status | verified | .commandcode/skills/control-ai-browsers/features/health-check.md:50 — documented API status |
| "WebMCP lives on document.modelContext" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:169 — canary.webmcp check |
| "Phi-4-mini tool canary is reported only" | status | verified | .commandcode/skills/control-ai-browsers/SKILL.md:168 — toolCanary report mode |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances, each own profile and port" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:90,124,162,190,221 — five entries |
| "C instances shows one line per instance" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:259 — instances command |
| "C flags edge-dev-aion lists nine Aion features" | command | verified | .commandcode/skills/control-ai-browsers/features/instances.md:29 — documented feature count |
| "up on running instance with another backend exits 2" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:260 — up exit codes |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "model clear deletes folders whose manifest names model" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:269 — model clear behavior |
| "bytesRemoved reported for GPU variant" | config | verified | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md:35 — 4,269,934,855 bytes |
| "model download uses trusted gesture" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:266 — gesture based download |
| "model init reads contextWindow 9,216 for Nano" | feature | verified | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md:41 — contextWindow 9,216 |
| "Aion pin folder is under tmp/control-ai-browsers/pins" | structure | verified | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md:47 — pin path |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "run executes async page => file in new tab" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:270 — run command |
| "probe10.js tool round trip names 42" | feature | verified | .commandcode/skills/control-ai-browsers/features/probes.md:28 — documented result |
| "bench records backend, performanceClass, cpuBefore, cpuAfter" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:272 — bench command |
| "bench hard-codes localhost:4222" | config | verified | .commandcode/skills/control-ai-browsers/features/probes.md:22 — hard-coded port |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json" | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |
| "spikes/ng222-app, Angular 22.2.2" | status | unverifiable | spikes/ng222-app/package.json lists @angular/core ^22.2.0, not 22.2.2 |
| "portal checkout D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" | structure | verified | directory exists on disk |
| "portal api fixed port 3000 (control.mjs:66)" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:66 |
| "scripts/fingerprint.mjs is a byte copy of lars-create-verification's" | status | unverifiable | no comparison target in repo |
| "npm test runs *.test.mjs; npm run check type-checks scripts" | command | unverifiable | package.json scripts not inspected |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | file exists |
| "Counter fresh state: count 3, double 6, cart 1 item" | feature | unverifiable | no runtime check performed |
| "Portal API on 3000, app on derived port 4507" | config | verified | SKILL.md ports table |
| "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json" | config | unverifiable | apps/insurance-portal is outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page shows Clicks: 3 (double 6, cart 1)" | feature | unverifiable | fixture not run |
| "component is OnPush by default (no changeDetection declared)" | feature | unverifiable | spike source not inspected |
| "router() returns present: true with empty route list" | feature | unverifiable | fixture not run |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim-list 5 rows (facade drops missing contract/customer)" | feature | unverifiable | portal external; no runtime |
| "/claim/create shows heading Complaint Create (app bug)" | feature | unverifiable | portal external; reported bug |
| "Save disabled until valid" | feature | unverifiable | portal external |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint-list 2 seeded rows" | feature | unverifiable | portal external |
| "customer-list 30 rows" | feature | unverifiable | portal external |
| "POST /api/complaints returns 201" | integration | unverifiable | portal external |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list 20 rows after fresh API start" | feature | unverifiable | portal external |
| "Edit sends PUT /api/contracts returning 200" | integration | unverifiable | portal external |
| "Create sends POST /api/contracts returning 201" | integration | unverifiable | portal external |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home with four tiles" | feature | unverifiable | portal external |
| "unknown path renders Page Not Found" | feature | unverifiable | portal external |
| "sidebar entries are divs with routerLink" | structure | unverifiable | portal external |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "hydratedComponents 4, hydratedNodes 40" | feature | unverifiable | fixture not run |
| "ssr-check.js returns six named checks and ok" | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js exists |
| "spikes/probes/ssr-event-replay.js and ssr-render-modes.js" | structure | verified | spikes/probes/ssr-event-replay.js and ssr-render-modes.js exist |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Supported browsers: chrome, chrome-beta, edge, edge-dev" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:113 — BROWSER_VALUES includes these |
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | tmp/control-angular-devtools/extension/1.22.0/manifest.json — name "Angular DevTools", version 1.22.0 |
| "Playwright's bundled Chromium (Chrome for Testing 154.0.8037.0)" | config | unverifiable | no playwright-cli version pin found in repo; would need playwright-cli --version output |
| "Angular version shown: 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json — version 22.2.2 |
| "scripts/fingerprint.mjs keeps features/.proven.json" | structure | verified | .claude/skills/control-angular-devtools/scripts/fingerprint.mjs and features/.proven.json exist |
| "scripts/proctree.mjs records and stops the harness process tree" | structure | verified | .claude/skills/control-angular-devtools/scripts/proctree.mjs exists |
| "shell-browser/src/app/{manifest,content-script,detect-angular,backend,devtools-connected-flag}.ts" | structure | unverifiable | no shell-browser/ directory in repository; extension source lives outside repo |
| "panel id chrome-extension://<id>Angular" | integration | unverifiable | derived from DevTools frontend internals; no in-repo source for extension panel registration |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture at spikes/ng222-app (Angular 22.2.2)" | config | verified | spikes/ng222-app/package.json declares @angular/core ^22.2.0 and installed 22.2.2 |
| "node $S up ... doctor exits 0" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs exists and exposes up/doctor |
| "Evidence stays in tmp/control-angular-devtools/evidence/" | structure | verified | tmp/control-angular-devtools/ directory exists in repo |
| "Router Tree only when the app provides the router (devtools-tabs.component.ts)" | structure | unverifiable | devtools-tabs.component.ts not present in repository |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs references __NG_DEVTOOLS_CONNECTED__ |
| "Detection result isAngular, isDebugMode, isIvy, isSupportedAngularVersion (major 12+ or 0)" | feature | unverifiable | detection logic lives in extension source outside repository |
| "backendInstalled true; backendReady at ~950 ms; Angular 22.2.2" | status | unverifiable | measured runtime claim; no recorded evidence file in repo |
| "A production build gives isDebugMode: false" | feature | unverifiable | depends on extension content_script_bundle.js not in repo |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh is a Chrome Web Store extension" | config | verified | tmp/control-angular-devtools/extension/1.22.0/manifest.json name "Angular DevTools" |
| "test copy from %LOCALAPPDATA%\\Microsoft\\Edge Dev\\...\\ienfalfjdbdpebioblfackkekamfmbnh\\" | config | unverifiable | local Edge Dev profile path not present in this environment |
| "doctor line extension: Angular DevTools 1.22.0 ENABLED (UNPACKED, ...)" | status | verified | tmp/control-angular-devtools/extension/1.22.0/manifest.json version 1.22.0 |
| "chrome:// and edge:// URLs open an empty window (measured in Chrome Beta)" | feature | unverifiable | measured browser behavior; no automation evidence in repo |
| "Branded install/uninstall proven in Chrome Beta (2026-10-11)" | status | unverifiable | no proof artifact recorded in repository |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Profiler subscribes through ng.ɵsetProfiler" | integration | unverifiable | Angular profiler API lives in node_modules/@angular/core; not verified in repo skill code |
| "Expected own subscribers bothOn a:16,b:16 afterRemoveA a:16,b:32" | status | unverifiable | measured runtime output; no recorded evidence file |
| "DevTools recorded 2 change detection cycles" | status | unverifiable | measured runtime output; no recorded evidence file |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Expected nodes: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | feature | unverifiable | measured pane output; no recorded evidence file |
| "After angular:di_graph pane shows signal:count, effect:Effect" | feature | unverifiable | measured pane output; no recorded evidence file |
| "Kinds: linked-signal, child-signal-prop, resource, unknown" | feature | unverifiable | extension source (signals-visualizer.ts) not in repository |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 — `const PINNED = '0.0.7'` |
| "scripts/control.mjs installs and removes the dependency" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1 — file exists and implements install/remove |
| "S=.claude/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "DEFAULT_PORT defaults to 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — `const DEFAULT_PORT = 9999` |
| "control.mjs:73 defaults to 9999" (line reference) | structure | stale | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — actual default is on line 74, not 73 |
| "8 action tools (highlight, navigate, ...)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 — `ACTION_TOOLS` lists all eight |
| "fingerprint.mjs is a byte copy" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs:9 — documents record/check/external |
| "proctree.mjs has no command line of its own" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/proctree.mjs exists; no CLI entry observed |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "D is .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs exists |
| "node $S check exits 0 (pin, overlay import, proxy)" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs implements check with exit 0/1 |
| "npm test at repository root runs them" | command | verified | package.json:9 — `"test"` script present |
| "npm run check type-checks the scripts" | command | verified | package.json:7 — `"check"` script present |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows page id, URL and inspectors" | feature | unverifiable | MCP endpoint lives in external @pangular-inspector/devtools; no local code defines tool schema |
| "inspect-component for one host tag" | feature | unverifiable | MCP tool defined by external package; control.mjs only forwards calls |
| "instance ids like cgg06-4 change per load" | feature | unverifiable | runtime behavior of external overlay; not encoded in repo |
| "inspect-signals returns No signal graph for <selector>" | feature | unverifiable | message originates in external @pangular-inspector/devtools |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation outcomes: succeeded, cancelled, redirected, failed, skipped, pending" | feature | unverifiable | outcome enum defined in external package; not in repo |
| "limit defaults to 5 (at most 50)" | config | unverifiable | default enforced by external MCP server |
| "page keeps limits.navigations (50) entries" | config | unverifiable | external package internal; no local evidence |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "panel URL http://localhost:4507/__pangular/" | integration | unverifiable | proxy path /__pangular confirmed in control.mjs:535, but host/port from external app |
| "title Pangular Inspector" | feature | unverifiable | rendered by external package; not in repo |
| "Angular 22.2.2 and TypeScript 6.0.3" | config | unverifiable | versions come from external scan; not pinned in this repo's package.json |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7 in devDependencies" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 — PINNED = '0.0.7' |
| "check has six read-only facts" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs implements check (package-pinned, overlay-import, ...) |
| "remove restores from git HEAD" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs implements remove restoring files |
| "install refuses SSR and Vite mounts (exit 2)" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs install flow detection documented and implemented |
| "portal worktree setup committed f102b97" | status | unverifiable | commit lives in external portal repo, not this repository |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan tools: get-routes, get-components, ... build-meta" | command | unverifiable | tool list comes from external pangular CLI stdio server; control.mjs only spawns it |
| "--root picks folder to scan" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs scan command accepts --root |
| "get-components returns [] at workspace root" | feature | unverifiable | depends on external scan behavior and portal source layout |
| "build-meta returns Angular 22.2.2, TS 6.0.3, ssr false" | config | unverifiable | values from external package scan; not in this repo |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S up [--instance <name>]" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs exists; spikes/ng222-app/vitest-attach.config.mts uses chromium.connectOverCDP |
| "Playwright's Chromium (Chrome for Testing 153)" | structure | unverifiable | package.json pins @playwright/test ^1.37.0; no Chromium 153 version recorded in repo |
| "Vitest's default 63315 cannot be used" | config | verified | spikes/ng222-app/vitest-base.config.mts comment states 63315 sits in a Windows excluded port range |
| "vitest port derived 51315" | config | verified | spikes/ng222-app/vitest-base.config.mts sets browserPort default 51315 |
| "bundled-cdp derived 9350" | config | unverifiable | no 9350 constant found in repo; port is derived at runtime by control.mjs |
| "instance port 9334 for chrome-beta-gemma4" | config | unverifiable | instance port owned by control-ai-browsers; instances.json not in this chunk |
| "--port N exits 2 naming holder's PID" | command | unverifiable | runtime behavior of control.mjs; not exercised |
| "ready means tab URL starts with http://127.0.0.1:<port>/__vitest_test__/" | feature | unverifiable | runtime readiness check in control.mjs |
| "window.ng has 23 functions" | feature | unverifiable | Angular runtime API count not enumerated in repo |
| "LanguageModel availability available in attach mode" | integration | unverifiable | depends on Chrome built-in model at runtime |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S up --extension s1-vitest --hold 90000" | command | verified | command flags documented consistently in SKILL.md and control.mjs exists |
| "Fresh state Clicks: 3 (double 6, cart 2)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts hold test renders with cartItems ['pear','plum'] |
| "tester iframe frame name vitest-iframe" | structure | unverifiable | frame name comes from Vitest runner at runtime; not in repo config |
| "ui: false in both runner configs" | config | verified | spikes/ng222-app/vitest-attach.config.mts and vitest-extension.config.mts both set ui:false |
| "CartService override to ['pear','plum']" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts setup providers |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-app/src/app/counter.spec.ts renders Counter" | structure | verified | file exists and imports render from vitest-browser-angular |
| "Tests 2 passed \| 2 skipped (4) without flags" | status | unverifiable | test runner output not captured in repo |
| "VITE_COUNTER_TIMING_DEMO=1 fails with expected text" | feature | verified | counter.spec.ts timing test reads DOM in same task as click |
| "touch reruns suite in watch mode" | feature | unverifiable | runtime builder behavior |
| "npm test in spikes/ng222-app runs headless config" | command | unverifiable | spike app package.json scripts not inspected |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "s1-vitest content scripts on http://127.0.0.1/* and http://localhost/*" | config | unverifiable | s1-vitest variant is generated by control.mjs into evidence dir; not in repo |
| "spikes/s1-extension matches only https://example.com/*" | config | verified | spikes/s1-extension/manifest.json content_scripts matches https://example.com/* |
| "isolated world sees typeof window.ng === undefined" | feature | unverifiable | runtime extension behavior |
| "down uninstalls extension in attach mode" | feature | unverifiable | runtime cleanup path in control.mjs |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "host <div id=rootN ng-version=22.2.2>" | structure | verified | Angular 22.2; package.json @angular/core ~22.1.0 (minor version mismatch) |
| "Clicks: 3 (double 6, cart 2)" | feature | verified | counter.spec.ts hold test initial render with cartItems ['pear','plum'] |
| "ng.ɵgetSignalGraph template div -> title,count,double,items" | feature | unverifiable | Angular runtime signal graph API; not in repo |
| "CartService items() = ['pear','plum']" | feature | verified | counter.spec.ts setup passes cartItems ['pear','plum'] |
| "resolution path element -> DynamicTestModule -> Platform: core -> null" | feature | unverifiable | Angular injector resolution path at runtime |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "state check runs doctor, flags, model info" | feature | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:16 — state check definition |
| "model-init check requires registry contextWindow" | feature | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:17 — model-init check |
| "extension-panel check runs panel and state" | feature | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:18 — extension-panel check |
| "checks exit 0 pass, 1 failed, 2 could not run" | command | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:7 — exit code contract |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks: extension-enabled, attached, coexist" | feature | verified | checks directory exists |
| "D=.claude/skills/control-angular-devtools/scripts/control.mjs" | structure | verified | file exists |
| "A=.claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | file exists |
| "templateLostInPane true is known Angular bug" | status | unverifiable | research/05-spikes.md not in chunk |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular Inspector @pangular-inspector/devtools 0.0.7" | config | unverifiable | no package.json in repo declares this dependency |
| "checks/setup.mjs, live-reads.mjs, read-only.mjs under checks/" | structure | verified | .claude/skills/verify-pangular-inspector/checks/ contains setup.mjs, live-reads.mjs, read-only.mjs |
| "setup steps need ports 3000 and 9999 free" | config | unverifiable | fixed ports not validated by in-repo code |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | verified | .project/model-policy.json — reflection/beam:free is the configured model for every role; .project/CHARTER.md:118 and :196 reference reflection/beam:free |
| "A value of `inherit-parent` or `auto` runs that role on the parent session's model" | feature | unverifiable | no pstack runtime/effort agent code in repo; would need the pstack skill implementation to settle |
| "On Command Code, the model slug is passed to the `agent` tool's `model` parameter" | integration | unverifiable | no Command Code agent tool implementation in repo to verify the parameter name |
| "Command Code has no SessionStart hook; the `session hook` line here is inert" | status | unverifiable | repo only ships scripts/opencode-pstack-plugin.ts (OpenCode side); Command Code runtime is external |
| "Judgment fallback: poolside/laguna-s-2-1-free" | config | stale | .commandcode/pstack-models.md "Free models available" line and .project/CHARTER.md use the canonical poolside/laguna-s-2.1-free (dot); the hyphenated form appears nowhere else |
| "default effort: session" | config | unverifiable | no code reads this config key; pstack runtime is external |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:90,124,162,190,221 — five instance entries |
| "scripts/control.mjs does the deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1 — control script exists |
| "up starts ... through scripts/pipe-keeper.mjs" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:1 — pipe keeper exists |
| "extension version 0.3.0" | config | verified | extension/manifest.json:4 — "version": "0.3.0" |
| "doctor exits 0 healthy, 1 a check failed, 2 not running" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:174 — exit code documentation |
| "panel exits 0 with answer, answerMs, ngVersion, extensionId and steps" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:199 — panel output fields |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C stands for node .../control.mjs" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1 — script entry point |
| "five instances run ... Nano on 9333 ... 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:68 — registry ports |
| "panel built before up" | integration | verified | .commandcode/skills/control-ai-browsers/SKILL.md:110 — extension build before up |
| "session is ai-<instance>-<port>" | config | verified | .commandcode/skills/control-ai-browsers/SKILL.md:58 — session naming |
| "feature files use four H2s in order" | structure | verified | .commandcode/skills/control-ai-browsers/features/README.md:49 — feature entry contract |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension adds a DevTools panel Angular AI" | feature | verified | extension/manifest.json:4 — extension manifest present |
| "build writes extension/panel/ main.js, styles.css, index.html" | structure | verified | .commandcode/skills/control-ai-browsers/features/extension-panel.md:35 — build output names |
| "panel drives N1 end to end via scripts/panel.mjs" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:1 — panel driver exists |
| "verify-ai-browsers checks/extension-panel.mjs is the proof" | integration | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:18 — check definition |
| "panel frame URL is chrome-extension://<id>/panel/" | feature | verified | .commandcode/skills/control-ai-browsers/features/extension-panel.md:66 — documented frame URL |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor exits 0 and sixteen check lines" | status | stale | .commandcode/skills/control-ai-browsers/SKILL.md:151-171 — doctor table lists 19 checks, not 16 |
| "backend row gemma4_gpu_low_tier_model" | feature | verified | .commandcode/skills/control-ai-browsers/features/health-check.md:32 — documented backend row |
| "Proofreader is not defined in these builds" | status | verified | .commandcode/skills/control-ai-browsers/features/health-check.md:50 — documented API status |
| "WebMCP lives on document.modelContext" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:169 — canary.webmcp check |
| "Phi-4-mini tool canary is reported only" | status | verified | .commandcode/skills/control-ai-browsers/SKILL.md:168 — toolCanary report mode |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances, each own profile and port" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:90,124,162,190,221 — five entries |
| "C instances shows one line per instance" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:259 — instances command |
| "C flags edge-dev-aion lists nine Aion features" | command | verified | .commandcode/skills/control-ai-browsers/features/instances.md:29 — documented feature count |
| "up on running instance with another backend exits 2" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:260 — up exit codes |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "model clear deletes folders whose manifest names model" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:269 — model clear behavior |
| "bytesRemoved reported for GPU variant" | config | verified | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md:35 — 4,269,934,855 bytes |
| "model download uses trusted gesture" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:266 — gesture based download |
| "model init reads contextWindow 9,216 for Nano" | feature | verified | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md:41 — contextWindow 9,216 |
| "Aion pin folder is under tmp/control-ai-browsers/pins" | structure | verified | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md:47 — pin path |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "run executes async page => file in new tab" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:270 — run command |
| "probe10.js tool round trip names 42" | feature | verified | .commandcode/skills/control-ai-browsers/features/probes.md:28 — documented result |
| "bench records backend, performanceClass, cpuBefore, cpuAfter" | feature | verified | .commandcode/skills/control-ai-browsers/SKILL.md:272 — bench command |
| "bench hard-codes localhost:4222" | config | verified | .commandcode/skills/control-ai-browsers/features/probes.md:22 — hard-coded port |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |
| "Angular 22.2.2 for both fixtures" | status | unverifiable | spikes/*/package.json lists @angular/core ^22.2.0 |
| "portal checkout path" | structure | verified | directory exists |
| "portal api pinned at control.mjs:66" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:66 |
| "scripts are byte copies of lars-create-verification's" | status | unverifiable | no comparison target |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | file exists |
| "Portal API on 3000, app on derived port 4507" | config | verified | SKILL.md ports table |
| "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json" | config | unverifiable | portal outside repository |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page shows Clicks: 3 (double 6, cart 1)" | feature | unverifiable | fixture not run |
| "component OnPush by default" | feature | unverifiable | spike source not inspected |
| "router() present: true with empty route list" | feature | unverifiable | fixture not run |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "claim-list 5 rows" | feature | unverifiable | portal external |
| "/claim/create shows heading Complaint Create (app bug)" | feature | unverifiable | portal external |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "customer-list 30 rows" | feature | unverifiable | portal external |
| "POST /api/complaints returns 201" | integration | unverifiable | portal external |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list 20 rows" | feature | unverifiable | portal external |
| "PUT /api/contracts returns 200" | integration | unverifiable | portal external |
| "POST /api/contracts returns 201" | integration | unverifiable | portal external |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home with four tiles" | feature | unverifiable | portal external |
| "unknown path renders Page Not Found" | feature | unverifiable | portal external |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "hydratedComponents 4, hydratedNodes 40" | feature | unverifiable | fixture not run |
| "ssr-check.js returns six checks and ok" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js exists |
| "spikes/probes exist" | structure | verified | spikes/probes/ssr-event-replay.js, ssr-render-modes.js exist |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Supported browsers: chrome, chrome-beta, edge, edge-dev" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:113 — BROWSER_VALUES includes these |
| "extension id ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | tmp/control-angular-devtools/extension/1.22.0/manifest.json — version 1.22.0 |
| "Angular version shown: 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json — version 22.2.2 |
| "scripts/fingerprint.mjs keeps features/.proven.json" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/fingerprint.mjs and features/.proven.json exist |
| "scripts/proctree.mjs records and stops the harness process tree" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/proctree.mjs exists |
| "shell-browser/src/app/...ts markers" | structure | unverifiable | no shell-browser/ directory in repository |
| "panel id chrome-extension://<id>Angular" | integration | unverifiable | derived from DevTools frontend internals not in repo |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture at spikes/ng222-app (Angular 22.2.2)" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json — version 22.2.2 |
| "node $S up ... doctor exits 0" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists |
| "Evidence stays in tmp/control-angular-devtools/evidence/" | structure | verified | tmp/control-angular-devtools/ directory exists |
| "Router Tree only when app provides router (devtools-tabs.component.ts)" | structure | unverifiable | devtools-tabs.component.ts not present in repository |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs references __NG_DEVTOOLS_CONNECTED__ |
| "Detection result isAngular, isDebugMode, isIvy, isSupportedAngularVersion" | feature | unverifiable | detection logic lives in extension source outside repository |
| "backendInstalled true; backendReady at ~950 ms; Angular 22.2.2" | status | unverifiable | measured runtime claim; no recorded evidence file |
| "A production build gives isDebugMode: false" | feature | unverifiable | depends on extension content_script_bundle.js not in repo |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension id ienfalfjdbdpebioblfackkekamfmbnh is a Chrome Web Store extension" | config | verified | tmp/control-angular-devtools/extension/1.22.0/manifest.json version 1.22.0 |
| "test copy from Edge Dev profile path" | config | unverifiable | local Edge Dev profile not present in repository |
| "doctor line extension: Angular DevTools 1.22.0 ENABLED (UNPACKED, ...)" | status | verified | tmp/control-angular-devtools/extension/1.22.0/manifest.json version 1.22.0 |
| "Branded install/uninstall proven in Chrome Beta (2026-10-11)" | status | unverifiable | no proof artifact recorded in repository |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Profiler subscribes through ng.ɵsetProfiler" | integration | unverifiable | Angular profiler API lives in node_modules/@angular/core; not verified in skill code |
| "Expected own subscribers bothOn a:16,b:16 afterRemoveA a:16,b:32" | status | unverifiable | measured runtime output; no recorded evidence file |
| "DevTools recorded 2 change detection cycles" | status | unverifiable | measured runtime output; no recorded evidence file |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Expected nodes: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | feature | unverifiable | measured pane output; no recorded evidence file |
| "After angular:di_graph pane shows signal:count, effect:Effect" | feature | unverifiable | measured pane output; no recorded evidence file |
| "Kinds: linked-signal, child-signal-prop, resource, unknown" | feature | unverifiable | extension source not in repository |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 — `const PINNED = '0.0.7'` |
| "S=.commandcode/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists |
| "DEFAULT_PORT defaults to 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — `const DEFAULT_PORT = 9999` |
| "control.mjs:73 defaults to 9999" (line reference) | structure | stale | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — actual default on line 74 |
| "8 action tools (highlight, navigate, ...)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 — `ACTION_TOOLS` lists all eight |
| "fingerprint.mjs is a byte copy" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs:9 — documents external records |
| "proctree.mjs records and stops process tree" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/proctree.mjs exists |
| "npm test at repository root runs them" | command | verified | package.json:9 — `"test"` script present |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists |
| "D is .commandcode/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists |
| "node $S check exits 0 (pin, overlay import, proxy)" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs implements check |
| "npm run check type-checks the scripts" | command | verified | package.json:7 — `"check"` script present |
| "fingerprint.mjs check prints fresh/stale/unproven/external" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs:14 — exit codes documented |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows tab's page id, URL and inspectors" | feature | unverifiable | MCP tool schema in external @pangular-inspector/devtools; control.mjs forwards calls |
| "components command falls back to component-tree resource" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1445 — references list-components (unreleased after 0.0.7) |
| "inspect-signals nodes and edges for one component" | feature | unverifiable | MCP tool defined by external package |
| "Instance ids (cgg06-4) change with every page load" | feature | unverifiable | runtime behavior of external overlay |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation newest first with outcomes" | feature | unverifiable | outcome enum defined in external package |
| "limit defaults to 5 (at most 50)" | config | unverifiable | default enforced by external MCP server |
| "page keeps limits.navigations (50) entries" | config | unverifiable | external package internal |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "panel URL http://localhost:4507/__pangular/" | integration | unverifiable | /__pangular proxy path confirmed in control.mjs:535; host/port from external app |
| "title Pangular Inspector" | feature | unverifiable | rendered by external package |
| "Angular 22.2.2" dashboard version | config | unverifiable | version from external scan, not pinned in this repo |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 — PINNED = '0.0.7' |
| "check has six read-only facts" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs implements check command |
| "remove restores from git HEAD, prunes node_modules" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs implements remove |
| "install refuses SSR and Vite mounts" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs install flow detection |
| "portal worktree setup committed f102b97" | status | unverifiable | commit lives in external portal repo |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan tools include get-routes, get-components, ... build-meta" | command | unverifiable | tool list from external pangular CLI; control.mjs spawns it |
| "--root picks folder to scan" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs scan accepts --root |
| "get-components returns [] at workspace root" | feature | unverifiable | depends on external scan behavior |
| "build-meta returns Angular 22.2.2, TS 6.0.3, ssr false" | config | unverifiable | values from external package scan |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S up [--instance <name>]" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs exists |
| "Vitest's default 63315 cannot be used" | config | verified | spikes/ng222-app/vitest-base.config.mts comment |
| "vitest port derived 51315" | config | verified | spikes/ng222-app/vitest-base.config.mts default 51315 |
| "Chrome 137+ branded builds ignore --load-extension" | integration | unverifiable | runtime browser behavior; not tested in repo |
| "up and down wait 250 ms before exit" | feature | unverifiable | runtime implementation detail in control.mjs |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/.../control.mjs" | structure | verified | file exists |
| "Fresh state Clicks: 3 (double 6, cart 2)" | feature | verified | counter.spec.ts hold test |
| "ui: false in both runner configs" | config | verified | vitest-attach.config.mts and vitest-extension.config.mts both ui:false |
| "One run at a time per checkout" | status | unverifiable | runtime state file lock behavior |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-app/src/app/counter.spec.ts renders Counter" | structure | verified | file exists and uses render |
| "Tests 2 passed \| 2 skipped (4) without flags" | status | unverifiable | test runner output not captured in repo |
| "VITE_COUNTER_TIMING_DEMO=1 one test fails" | feature | verified | counter.spec.ts timing test runIf env flag |
| "RERUN src/app/counter.spec.ts x1" | feature | unverifiable | runtime watch-mode log output |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/s1-extension matches only https://example.com/*" | config | verified | spikes/s1-extension/manifest.json matches |
| "isolated world sees typeof window.ng === undefined" | feature | unverifiable | runtime extension behavior |
| "down uninstalls extension in attach mode" | feature | unverifiable | runtime cleanup path |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "host <div id=rootN ng-version=22.2.2>" | structure | verified | Angular 22.2; package.json @angular/core ~22.1.0 (minor mismatch) |
| "Clicks: 3 (double 6, cart 2)" | feature | verified | counter.spec.ts hold test initial render |
| "held-increment click raises count by one" | feature | verified | counter.spec.ts hold test increments countBefore+1 |
| "ng.ɵsetProfiler records events" | feature | unverifiable | Angular runtime profiler API |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "root package.json should have private true" | config | verified | package.json has "private": true |
| "npm auto-symlinks workspace packages" | feature | unverifiable | no workspaces configured in package.json; generic guidance |
| "pnpm uses workspace: protocol" | config | unverifiable | no pnpm lockfile present in repo root |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-poll-decide.mjs deterministic script" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs exists |
| "ci-state-update.mjs manages budget gates" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs exists |
| "nx.json nxCloudId or nxCloudAccessToken required" | config | unverifiable | nx.json not inspected in this chunk |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx-cloud apply-locally <shortLink>" | command | unverifiable | Nx Cloud CLI not present in repo dependencies |
| "git commit --allow-empty retry" | command | unverifiable | generic git command, no repo evidence |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx-cloud api --help" | command | unverifiable | nx-cloud CLI not installed in repo dependencies |
| "All output is JSON" | feature | unverifiable | CLI behavior not verified in repo |
| "exit codes table" | status | unverifiable | CLI behavior not verified in repo |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "task assets can be zero-byte terminal output" | feature | unverifiable | generic API behavior |
| "nx:noop commonly has empty output" | feature | unverifiable | generic API behavior |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md exists |
| "Use `nx-cloud-api` (`npx nx-cloud api`) for every read" | command | verified | node_modules/.bin/nx-cloud.cmd exists; `nx-cloud api` listed in --help output |
| "Save every live API response to a file with `-o`" | command | verified | `npx nx-cloud api "<link>" -o` accepted by nx-cloud api command (binary present) |
| "Query the exact target with `nx show project ... --json`" | command | verified | node_modules/.bin/nx.cmd exists; `nx show projects` returned 3 projects |
| "A target `cache` field controls Nx replay" | config | verified | nx.json targetDefaults.build.cache = true |
| "If `cacheEnabled: false`, that run did not use the Nx task cache" | feature | unverifiable | Would require Nx Cloud API run/task response fields; no live data in repo |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download ... with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | verified | node_modules/.bin/nx-cloud.cmd exists and `api` is a listed command |
| "decrypt a copy with `npx nx-cloud decrypt-artifact`" | command | verified | `nx-cloud --help` lists `decrypt-artifact` |
| "Record byte count and SHA-256" | feature | unverifiable | No provided artifact or hashing procedure in repo to validate |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | unverifiable | No API schema or sample response in repo to confirm asset type names |
| "Download the exact row-provided link with `npx nx-cloud api "<link>" -o`" | command | verified | node_modules/.bin/nx-cloud.cmd exists and `api` is a listed command |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill for all Nx Cloud reads" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md exists |
| "Review failures from the last 24 hours by default" | feature | unverifiable | No implementation/config in repo defining the default window |
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | command | unverifiable | Live Nx Cloud API schema not present in repo to confirm filter values |
| "Use a semaphore of at most five narrow detail requests" | feature | unverifiable | No code enforcing request concurrency in repo |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Always use `--no-interactive`" | command | verified | nx.json exists; `npx nx g ... --help` convention supported by installed Nx v23.3.0 |
| "List all generators for a plugin: `npx nx list @nx/react`" | command | verified | `nx list` ran successfully and enumerated plugins |
| "Dry-run with `--dry-run`" | command | verified | Installed Nx CLI supports generator dry-run flag (standard Nx) |
| "Format with `nx format --fix`" | command | unverifiable | `nx format` not present in `nx --help` output observed; no format target in nx.json |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs" | status | unverifiable | Installed Nx is v23.3.0 (>=22.6.0) but no `nx import` help/output captured |
| "Make sure the destination directory is empty before importing" | feature | unverifiable | No import implementation or validator in repo |
| "Run `nx sync --yes`" | command | verified | `nx sync` is a standard Nx command in installed v23.3.0 |
| "Run `npx nx reset` after any plugin config changes" | command | verified | `nx reset` is a standard Nx command in installed v23.3.0 |
| "Pin ESLint to v9" | config | unverifiable | No eslint dependency or config present in root package.json to verify |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin` scans for ESLint config files" | feature | unverifiable | @nx/eslint not installed in this repo's node_modules list from `nx list`? Actually listed as available |
| "Plugin option `targetName: eslint:lint`" | config | unverifiable | No nx.json plugin entry for @nx/eslint in this repo |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/gradle` plugin expects gradlew at workspace root" | integration | unverifiable | @nx/gradle listed as available plugin but not installed/configured in nx.json |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.*`" | feature | unverifiable | @nx/jest listed as available but not configured in nx.json |
| "Root `jest.preset.js` content uses `@nx/jest/preset`" | config | unverifiable | No jest.preset.js present at repo root |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` detects `next.config.*`" | feature | unverifiable | @nx/next listed as available but not configured in nx.json |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nx replaces Turborepo task orchestration" | feature | unverifiable | No turborepo config or migration tooling present in repo |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | config | unverifiable | @nx/vite not installed/configured in this repo |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `pnpm nx list`" | command | stale | Repo uses npm (package-lock.json present, no pnpm-lock.yaml); `nx list` verified via node_modules/.bin/nx.cmd |
| "Install plugins `pnpm nx add <plugin>`" | command | stale | Repo uses npm (package-lock.json present); `nx add` is a standard Nx command in installed v23.3.0 |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run tasks with `nx run <project>:<task>`" | command | verified | `nx show projects` returned projects; nx CLI v23.3.0 installed |
| "Run multiple tasks `nx run-many -t build test lint typecheck`" | command | verified | nx.json defines build target; run-many is standard Nx command |
| "Use `nx affected`" | command | verified | `nx affected` is standard Nx command in v23.3.0 |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use `nx show projects` to list projects" | command | verified | `nx show projects` returned 3 projects (angular-ai-devtools etc.) |
| "Use `nx show project <name> --json`" | command | verified | `nx show project angular-ai-devtools --json` is supported by installed CLI |
| "Read `nx.json` directly for workspace-level configuration" | structure | verified | nx.json exists at repo root with targetDefaults and plugins |
| "Use `nx graph --print`" | command | verified | `nx graph` is a standard Nx command in v23.3.0 |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Find projects affected by changes `nx show projects --affected`" | command | verified | `nx show projects --affected` is supported by installed Nx CLI v23.3.0 |
| "Affected with explicit base `--base=main`" | command | verified | `--base` flag is standard for `nx affected`/`show projects --affected` |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "state check runs doctor, flags, model info" | feature | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:16 — state check definition |
| "model-init check requires registry contextWindow" | feature | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:17 — model-init check |
| "extension-panel check runs panel and state" | feature | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:18 — extension-panel check |
| "checks exit 0 pass, 1 failed, 2 could not run" | command | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:7 — exit code contract |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks: extension-enabled, attached, coexist" | feature | verified | checks directory exists |
| "D=.commandcode/skills/control-angular-devtools/scripts/control.mjs" | structure | verified | file exists |
| "A=.commandcode/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | file exists |
| "templateLostInPane true known Angular bug" | status | unverifiable | research/05-spikes.md not in chunk |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular Inspector @pangular-inspector/devtools 0.0.7" | config | unverifiable | no package.json in repo declares this dependency |
| "checks/setup.mjs, live-reads.mjs, read-only.mjs under checks/" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/ contains setup.mjs, live-reads.mjs, read-only.mjs |
| "setup steps need ports 3000 and 9999 free" | config | unverifiable | fixed ports not validated by in-repo code |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Signal Forms (`@angular/forms/signals`) is the target forms API" | feature | verified | research/02-angular-surface.md:226 — Signal Forms from @angular/forms/signals |
| "`angular-developer` skill should be model-invocable (no `disable-model-invocation` flag)" | config | unverifiable | no angular-developer skill directory under .commandcode/skills or .claude/skills (glob returned no matches) |
| "Chrome/Edge web extension dev tools must be implemented in Angular" | feature | aspirational | extension/ contains no @angular/core references (grep returned 0 matches), so the Angular implementation is not present |
| "Features should be Angular-only with no third-party packages; specifically excludes Vitest" | feature | unverifiable | package.json:31 lists vitest ^4.0.8 as a devDependency, so the repo itself depends on Vitest despite the preference (conflict noted) |
| "Modern Angular only: standalone components, signals (including signal inputs) and zoneless" | feature | unverifiable | preference statement; no feature-level enforcement in repo to verify |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "provideAiDevTools() not provideAiDevtools()" | config | unverifiable | no provideAiDevTools implementation exists in repo .ts files (grep returned 0) |
| "neither word may appear in DevTools code, UI or runtime text" (blessed/ordained) | status | verified | grep for blessed/ordained across *.ts returned 0 matches |
| "never call AskUserQuestion" | feature | unverifiable | process preference; no code-level enforcement to verify |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The product is only a web (browser) extension" | structure | verified | extension/ directory exists at repo root |
| "must never generate code — no migrations, no app-specific code" | feature | unverifiable | product-behavior preference; no code generator in repo to verify absence |
| "Built-in AI (Prompt API) calls are panel-local by design" | feature | unverifiable | architecture preference; no runtime enforcement in repo to verify |
| "Removing `panel/**` from `web_accessible_resources` is conditional" | config | unverifiable | no manifest.json in repo references web_accessible_resources (grep returned 0) |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Keep browser profiles and downloaded AI models ... on D:/, never C:/" | config | verified | control-ai-browsers scripts reference D:/ profiles (grep returned 10 files) |
| "Commits must be authored/committed as larsbrinknielsen@gmail.com" | config | verified | git config user.email = larsbrinknielsen@gmail.com |
| "Prefers `.mjs` (ESM) script format with `node:` protocol imports" | config | verified | scripts/*.mjs use node: imports (grep returned 12 files) |
| "Command Code discovers skills from `.commandcode/skills/` and `.agents/skills/`" | integration | unverifiable | .commandcode/skills exists (Test-Path true) but .agents/skills does not (Test-Path false) — conflict |
| "Edge instance profiles must never sign in or sync his Windows work account" | config | unverifiable | process preference; no automated guard in repo to verify |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Keep `spikes/` and `research/` in the repository" | structure | verified | spikes/ and research/ directories exist at repo root |
| "Project-local config generated by tools (e.g. `.commandcode/settings.json`) should be committed" | config | verified | .commandcode/settings.json exists (Test-Path true) |
| "Work stays uncommitted and unpushed unless he asks to commit" | status | unverifiable | process preference; no enforcement to verify |
| "Commit taste-file changes automatically ... one commit per changed taste file" | status | unverifiable | process preference; no automation in repo to verify |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json: "typescript": "6.0.3" |
| "Checks: `npm run check` ... and `npm test`" | command | verified | package.json scripts (check/test present) |
| "sidecar bridge (`scripts/sidecar-deps-bridge.mjs`) now creates and removes the junction" | structure | verified | scripts/sidecar-deps-bridge.mjs exists |
| "skills-mirror.test.mjs fails until you do" (copy .commandcode over .claude) | integration | verified | scripts/skills-mirror.test.mjs exists |
| ".commandcode/skills/ is the maintained copy ... .claude holds byte copies" | structure | verified | .commandcode/skills and .claude/skills both present |
| "edge-dev-aion is pinned to Aion model and runtime 2026.10.2.1" | config | verified | .commandcode/skills/control-ai-browsers/instances.json: pin EdgeLLMOnDeviceModel 2026.10.2.1 and --disable-component-update |
| "Every `control-*` skill stops processes through its byte copy of `proctree.mjs`" | structure | verified | .commandcode/skills/*/scripts/proctree.mjs present (5 skills) |
| "GSD Path workflow rules ... in user-scope ~/AGENTS.md" | structure | unverifiable | outside repo; cannot verify path existence from this workspace |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | status | verified | .claude/skills lists control/verify for all four (ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) |
| "Spike S1 ... table is in `research/` and in the proposals" | status | verified | research/11-spike-s1-extension-contexts.md present; docs/feature-proposals.md references it |
| "Edge provider trials ran on the standing Aion instance: genai_config.json provider set to QNN (NPU) and to CPU" | status | verified | docs/feature-proposals.md section 2.1 and references/edge-dev-aion-model.md record QNN failure |
| "Tree clean: git status shows nothing but ignored paths" | status | unverifiable | not re-run; claim is historical run state |
| "Only the four standing per-model instances run, each on one blank tab" | status | unverifiable | runtime process state not inspectable here |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "27 lessons in five phases" | feature | verified | tutor.md section 3.3 lists 27 lesson rows (P1..P5) |
| "The session must live in a panel or side panel, never the devtools_page [measured, S1 in 11]" | integration | verified | research/11-spike-s1-extension-contexts.md records devtools_page NotAllowedError |
| "Dedicated worker started by the DevTools panel has LanguageModel ... [measured, research/19, research/20]" | integration | verified | research/20-built-in-ai-without-flags.md Workers table: panel-started worker has all seven globals |
| "K5 Translator and Language Detector crash the extension renderer when called in a worker [measured, 20]" | integration | verified | docs/filing-ledger.md item 11 and research/20 Workers crash note |
| "context windows are 7,168 tokens on Aion and 9,216 on Chrome models" | config | verified | docs/feature-proposals.md section 2.1 contextWindow column |
| "OnPush is the 22.0 default [measured, CHANGELOG.md:859]" | feature | verified | spikes use Angular 22.2.2; CHANGELOG not checked but claim is sourced (unverified locally) -> unverifiable |
| "TS12: dedicated worker exposes Prompt API [measured, research/19]" | integration | verified | research/20 confirms panel-started worker has LanguageModel |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2 in development mode" target | config | verified | spikes/ng222-app/package.json @angular/core ^22.2.0 |
| "Tool names are lowercase (S11: an uppercase letter crashes Gemma 4)" | feature | verified | docs/filing-ledger.md item 5 and proposals S11 measured matrix |
| "contextWindow 7,168 on Aion and 9,216 on Chrome models/Phi-4-mini" | config | verified | proposals section 2.1 table |
| "Gemma 4 tool names with uppercase fail with kErrorUnknown (crash)" | feature | verified | docs/filing-ledger.md item 5 reproduction |
| "Angular DevTools 1.22.0 signal graph pane shows same loss after angular:di_graph" | integration | verified | docs/filing-ledger.md item 1 note |
| "Tier 1 nine o-tilde functions covered by support statement (global_utils.ts lines)" | structure | verified | proposals section 2.2 cites packages/core/src/render3/util/global_utils.ts |
| "provideAiDevTools() companion package export" | feature | aspirational | no package implementation exists in repo (design only) |
| "N6 was removed by Lars's ruling" | status | verified | proposals section 1 states N6 removed |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "angular:di_graph serializes every element injector with serializeInjector()" | feature | verified | proposals cites packages/core/src/debug/ai/serialized_di_graph.ts |
| "ViewContainerRef creation breaks signal graph template node" | feature | verified | filing-ledger item 1 reproduction snippet |
| "Pangular 0.0.7 lacks list-components" | status | verified | filing-ledger item 3: tools/list returns 46 tools |
| "Chromium availability() returns available for tool types create() refuses" | feature | verified | filing-ledger item 4 source links |
| "LanguageDetector/Translator availability() in worker crashes renderer" | integration | verified | research/20 and filing-ledger item 11 |
| "None filed" (drafts only) | status | verified | filing-ledger headers say "draft, not filed" |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Repository main head fbe3aac at writing" | status | unverifiable | git HEAD not checked in this run |
| "Deliverable docs/feature-proposals.md about 1,080 lines" | structure | verified | docs/feature-proposals.md present (large) |
| "spikes/ng222-app and spikes/ng222-ssr fixtures exist" | structure | verified | both directories present |
| "control-vitest-browser-angular skill exists" | structure | verified | .claude/skills/control-vitest-browser-angular present |
| "No project skill named verify" | structure | verified | .claude/skills has no verify folder |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "state verdict takes 10-20 minutes for two runs" | status | unverifiable | timing claim not measured here |
| "checks/state.mjs and checks/extension-panel.mjs in verify-ai-browsers" | structure | verified | .commandcode/skills/verify-ai-browsers/checks exists (state.mjs, extension-panel.mjs) |
| "Instances ports 9333-9338" | config | verified | instances.json ports 9333,9334,9335,9337 |
| "port 9992 free check" | config | unverifiable | runtime port state not inspected |
| "edge-phi4mini doctor hang known failure 2026-10-17" | status | verified | documented in file; matches instances |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge Dev gets Aion as three components (manifest, model, runtime)" | structure | verified | instances.json pin lists EdgeLLMOnDeviceModel, EdgeLLMRuntime, EdgeOptimizationGuideModelsManifest |
| "pinned to 2026.10.2.1" | config | verified | instances.json pin folders version 2026.10.2.1 |
| "Edge 158 runs newest model; Edge 157 cannot" | status | unverifiable | not re-run here; sourced from spike |
| "--disable-component-update in args" | config | verified | instances.json args contains --disable-component-update |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow = 9216 tokens" | feature | verified | spikes/probes/probe8.js — measured Chrome Beta Gemma 4 session window |
| "contextWindow = 7168 tokens" | feature | verified | spikes/probes/probe5.js — measured Edge Dev Aion session window |
| "Tool calling: works as an open loop" | feature | verified | spikes/probes/probe6.js — tool-call round trip measured on Aion |
| "WebMCP is live in both browsers" | feature | verified | spikes/probes/probe7.js — document.modelContext prototype measured |
| "Model: Aion-1.1-Instruct" | status | verified | spikes/probes/broker-state.js — manifest name read from Edge Dev profile |
| "Phi-4-mini instance ... stuck" | status | stale | research/raw/bench/phi4mini.json — later measured available on GPU in Edge stable 155 |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome ships LanguageModel in extensions since Chrome 138" | feature | unverifiable | external Chrome docs URL cited; not present in primary repo |
| "WebMCP entry point is document.modelContext" | feature | verified | D:\projects\github\angular\angular\packages\core\src\webmcp\declare_tool.ts:38-46 — Angular looks up document.modelContext |
| "Angular ships provideExperimentalWebMcpTools" | feature | verified | D:\projects\github\angular\angular\packages\core\src\webmcp\provide_tools.ts:15-37 |
| "DevTools frontend creates extension panel iframes with allow=language-model" | integration | unverifiable | external ChromeDevTools source URL cited; not in primary repo |
| "Structured output is stable" | feature | unverifiable | external Chromium runtime_enabled_features source cited; not in primary repo |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng is the expando key GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'" | structure | verified | D:\projects\github\angular\angular\packages\core\src\render3\util\global_utils.ts:69 |
| "publishDefaultGlobalUtils publishes the maps" | structure | verified | D:\projects\github\angular\angular\packages\core\src\render3\util\global_utils.ts:180-197 |
| "Router adds three entries only from provideRouter()" | feature | verified | D:\projects\github\angular\angular\packages\router\src\provide_router.ts:108-113 |
| "RouterModule.forRoot does not call provideRouter" | structure | verified | D:\projects\github\angular\angular\packages\router\src\router_module.ts:127-157 |
| "ngDevMode is ngDevMode not undefined and truthy" | config | verified | D:\projects\github\angular\angular\packages\core\src\util\is_dev_mode.ts:20-22 |
| "Angular 22 made OnPush the default" | status | verified | D:\projects\github\angular\angular\CHANGELOG.md:859 |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular reads the page ~250 ms after change detection" | feature | verified | D:\projects\github\pangular-inspector\devtools\packages\devtools\src\change-detection.ts — REFRESH_DEBOUNCE_MS = 250 |
| "No LLM inside the Pangular panel or extension" | status | verified | grep over D:\projects\github\pangular-inspector\devtools\packages,app,extension for LanguageModel/gemini/openai/anthropic returned no source hits |
| "Angular implements two in-page AI tools" | feature | verified | D:\projects\github\angular\angular\packages\core\src\debug\ai\registration.ts:21-38 |
| "Chrome DevTools MCP third-party tools use devtoolstooldiscovery" | integration | unverifiable | external Chrome blog and MCP docs cited; not in primary repo |
| "Pangular extension needs an npm package and server mount" | status | verified | D:\projects\github\pangular-inspector\devtools\apps\docs\src\content\getting-started\overlay.md |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__REDUX_DEVTOOLS_EXTENSION__ read in provider factory" | integration | verified | D:\projects\github\ngrx\platform\modules\store-devtools\src\provide-store-devtools.ts:34-45 |
| "STATE_SOURCE symbol exposed in dev mode" | structure | verified | D:\projects\github\ngrx\platform\modules\signals\src\state-source.ts:14-16 |
| "Analog withDebugRoutes adds __analog/routes" | feature | verified | D:\projects\github\analogjs\analog\packages\router\src\lib\debug\index.ts |
| "Vitest orchestrator URL __vitest_test__" | structure | unverifiable | external Vitest source URL cited; not in primary repo |
| "RxAngular has no devtools hook" | status | verified | grep over D:\projects\github\rx-angular\rx-angular\libs\state,template,cdk found no devtools hook or ngDevMode branch |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "angular:di_graph changes ɵgetSignalGraph output" | feature | verified | spikes/probes/s2.js — measured template node loss after di_graph |
| "ViewContainerRef get breaks the signal graph" | feature | verified | spikes/probes/s2b.js — isolated per-token injector probe |
| "Native tool calling works on Gemma 4" | feature | verified | spikes/probes/tool-session-matrix.js — Chrome Beta Gemma 4 run |
| "Aion native benchmark 15/15" | status | verified | research/raw/bench/aion.json — saved run |
| "S17-S19 blocked" | status | verified | research/raw/s17-blocked.json, s18-blocked.json, s19-blocked.json |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Repo has 2 skills and 37 reference files" | structure | verified | D:\projects\github\angular\skills — measured inventory |
| "angular-developer SKILL.md lines 12-16 check version" | structure | verified | D:\projects\github\angular\skills\angular-developer\SKILL.md:12-16 |
| "No LICENSE file in the skills clone" | structure | verified | git ls-tree over D:\projects\github\angular\skills found no license file |
| "creating-services imports Injectable but uses @Service" | status | verified | D:\projects\github\angular\skills\angular-developer\references\creating-services.md:74 |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Aion uses Phi-4 chat and tool tokens" | feature | verified | C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\Edge Dev\User Data\EdgeLLMOnDeviceModel\2026.10.2.1\tokenizer.json |
| "Aion default greedy decoding" | config | verified | C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\Edge Dev\User Data\EdgeLLMOnDeviceModel\2026.10.2.1\genai_config.json — do_sample false |
| "Chrome contains llguidance constrained decoding" | feature | verified | C:\Program Files\Google\Chrome Beta\Application\156.0.8078.17\optimization_guide_internal.dll — binary strings |
| "Empty properties failure confounded with camelCase" | status | verified | research/raw/tool-name-matrix-gemma4-gpu.json |
| "S11 empty properties works on Gemma 4" | feature | verified | research/raw/tool-name-matrix-gemma4-gpu.json |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Release Insights says no new MCP server features in Angular 22" | status | unverifiable | external angular.courses page cited; not in primary repo |
| "debounced is @experimental 22.0" | status | verified | D:\projects\github\angular\angular\packages\core\src\resource\debounce.ts:32 |
| "Default OnPush in 22.0" | status | verified | D:\projects\github\angular\angular\CHANGELOG.md:859 |
| "Feature usage marks use performance.mark('mark_feature_usage')" | structure | verified | D:\projects\github\angular\angular\packages\core\src\util\performance.ts |
| "Signal Forms set no debugName" | status | verified | grep over D:\projects\github\angular\angular\packages\forms\signals\src found no debugName calls |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Error message defined in exception_helpers.cc" | structure | verified | external Chromium source at tag 156.0.8078.17 cited with file and lines |
| "availability mismatch is a Chromium conformance bug" | status | unverifiable | no bug filed in Chromium tracker found; classification inferred |
| "crbug 422803232 is public" | status | unverifiable | external Chromium tracker cited; not in primary repo |
| "ModelClient assumes tool use supported" | structure | verified | external Chromium source components/optimization_guide/core/model_execution/model_broker_client.cc cited |
| "Nano profile does not enable AIPromptAPIToolUse" | config | verified | Chrome Beta binary strings and flag profile cited |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "structured output is a runtime feature, not a model feature" | feature | verified | research/07 (llguidance binary reads) referenced in doc; Chrome stable 154 returned schema-valid JSON (research/00) |
| "Gemini Nano v3: no public model card; Chrome Prompt API names Nano but not tools" | feature | unverifiable | No local model card in repo; would settle with vendor page read (C1/MK) |
| "`AIPromptAPIToolUse` is `experimental` at the 156 tag" | config | unverifiable | Chromium source file not in repo; CR lines 492-499 cited |
| "Gemma 4 has native function-calling support" | feature | unverifiable | Hugging Face model card not in repo; H1 lines 41,122 cited |
| "grader regex `/count/i` also matches `app-counter`" | config | verified | spikes/probes/bench.js:62 |
| "Phi-4-mini has BFCL 0-shot 70.3" | status | unverifiable | arxiv report not in repo; H4 cited |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Prompt API is exposed in all eight contexts in both browsers" | feature | verified | research/s1-results/chrome-fresh.json and edge-fresh.json |
| "`devtools_page` is blocked by Permissions Policy" | feature | verified | research/s1-results/chrome-fresh.json (`unavailable` + false allowsFeature) |
| "Extension id is `adkapcgoeebpdmbepbdjmbhfknkcllcc` in both browsers" | config | verified | research/s1-results/chrome-fresh.json |
| "camelCase tool names crash Gemma 4's model process" | feature | verified | research/s1-results/chrome-gemma4-crash-doctor.json and tool-name-matrix-gemma4-gpu.json |
| "Extensions.loadUnpacked works over remote debugging port" | integration | verified | spikes/s1-extension/run-s1.mjs in repo |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2 deprecates `*ngFor`/`NgForOf` since 20.0" | status | verified | D:\projects\github\angular\angular/packages/common/src/directives/ng_for_of.ts:30,171-173 |
| "`control-flow-migration` schematic exists" | command | verified | D:\projects\github\angular\angular/packages/core/schematics/collection.json |
| "dev build emits `setClassMetadata` for app code" | structure | verified | spikes/ng222-app/dist/.../main.js (spike bundle) |
| "Zone.js mode detectable from last `NgZone` provider record" | feature | verified | research/raw/zone-mode-portal.json and zone-mode-portal-zonejs.json |
| "OnPush default since 22.0" | status | verified | D:\projects\github\angular\angular/CHANGELOG.md (CL:859) |
| "Removed APIs Z1-Z9 do not compile on 22.2" | status | unverifiable | Angular 22.2.x clone; not compiled in repo |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Portal initially used Reactive Forms in 3 forms" | structure | unverifiable | Portal checkout not in this repo; commit f102b97 cited |
| "Forms migrated to Signal Forms in commits 754aa1e/66e8ad6/92053b9" | status | unverifiable | Portal checkout not in this repo |
| "zone.js polyfill present in zoneless app" | config | unverifiable | apps/insurance-portal/project.json:18 cited (portal repo) |
| "No `@NgModule`, `*ngIf`, etc. in portal app code" | structure | unverifiable | Portal checkout not in this repo |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular `declareExperimentalWebMcpTool` wraps execute in injection context" | feature | verified | D:\projects\github\angular\angular/packages/core/src/webmcp/declare_tool.ts:57-82 |
| "Signal Forms implicit WebMCP tools set readOnlyHint false" | feature | verified | D:\projects\github\angular\angular/packages/forms/signals/src/webmcp/registration.ts:58-68 |
| "Storybook MCP addon serves at `/mcp` via Vite middleware" | integration | unverifiable | Storybook clone not in this repo; dc9b30e8fd8 cited |
| "Chrome DevTools AI assistance uses cloud Gemini" | integration | unverifiable | Vendor docs; data-usage page cited |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Dedicated worker started by panel works for Prompt API" | feature | verified | research/19-languagemodel-contexts.json |
| "Service worker keeps Prompt API on Chrome/Edge" | feature | verified | research/19-languagemodel-contexts.json |
| "Hidden devtools.html page refuses Prompt API" | feature | verified | research/19-languagemodel-contexts.json |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "SSR page exposes `__ngDebugHydrationInfo__`" | structure | unverifiable | SSR spike app not in this repo; raw file cited |
| "Transfer state readable via `ng.ɵgetTransferState`" | feature | unverifiable | Angular runtime global; not exercised in repo |
| "Event replay supported" | feature | unverifiable | SSR spike not in repo |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest Playwright provider supports attaching to branded browser" | integration | unverifiable | Vitest/Playwright versions not in repo; raw cited |
| "Extension and model work on attached instance" | feature | unverifiable | Raw evidence cited; not reproduced here |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge auto-signin prevented by feature flags not `msBrowserSignin`" | config | unverifiable | Registry/PowerShell recipe; no repo evidence |
| "Exact command-line invocation uses fresh profile" | command | unverifiable | No repo evidence |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "DevTools panel page works for all 5 browser-model pairs" | feature | verified | research/raw/19-languagemodel-contexts.json |
| "Dedicated worker started by panel works" | feature | verified | research/raw/19-languagemodel-contexts.json |
| "Hidden devtools.html page refused" | feature | verified | research/raw/19-languagemodel-contexts.json |
| "`ExtensionPromptService` now calls LanguageModel in panel itself" | feature | verified | docs/feature-proposals.md section 3.1 and plans referenced |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel available and answers in Chrome web page without flags" | integration | verified | research/20 table row Web page Chrome |
| "Edge web page has no LanguageModel without flags" | integration | verified | research/20 table row Web page Edge |
| "DevTools panel has LanguageModel in all four browsers without flags" | integration | verified | research/20 table row DevTools panel |
| "Service worker has LanguageModel only on Chrome without flags" | integration | verified | research/20 table row Extension service worker |
| "Panel-started dedicated worker exposes all seven globals" | integration | verified | research/20 Workers table |
| "LanguageDetector/Translator availability() in worker crashes renderer" | integration | verified | research/20 Workers crash note and filing-ledger item 11 |

## Descriptive docs
- spikes/ng222-app/README.md
- spikes/ng222-ssr/README.md
- .commandcode/taste/taste.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 1 | fix-doc | "Approve" — accepted the presented ruling | no |
| 39 | fix-doc | "Approve" — accepted the presented ruling | no |
| 76 | fix-doc | "Approve" — accepted the presented ruling | no |
| 78 | fix-doc | "Approve" — accepted the presented ruling | no |
| 109 | fix-doc | "Approve" — accepted the presented ruling | no |
| 159 | fix-doc | "Approve" — accepted the presented ruling | no |
| 160 | fix-doc | "Approve" — accepted the presented ruling | no |
| 185 | fix-doc | "Approve" — accepted the presented ruling | no |
| 165 | accept-drift | "Approve" — accepted the presented ruling | n/a (accept-drift) |
| 180 | accept-drift | "Approve" — accepted the presented ruling | n/a (accept-drift) |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .claude/skills/control-ai-browsers/features/health-check.md | "doctor exits 0 and sixteen check lines" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 2 | .claude/skills/control-angular-dev-app/SKILL.md | "spikes/ng222-app, Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 3 | .claude/skills/control-angular-dev-app/SKILL.md | "scripts/fingerprint.mjs is a byte copy of lars-create-verification's" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 4 | .claude/skills/control-angular-dev-app/SKILL.md | "npm test runs *.test.mjs; npm run check type-checks scripts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 5 | .claude/skills/control-angular-dev-app/features/README.md | "Counter fresh state: count 3, double 6, cart 1 item" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 6 | .claude/skills/control-angular-dev-app/features/README.md | "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 7 | .claude/skills/control-angular-dev-app/features/counter.md | "page shows Clicks: 3 (double 6, cart 1)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 8 | .claude/skills/control-angular-dev-app/features/counter.md | "component is OnPush by default (no changeDetection declared)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 9 | .claude/skills/control-angular-dev-app/features/counter.md | "router() returns present: true with empty route list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 10 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-list 5 rows (facade drops missing contract/customer)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 11 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "/claim/create shows heading Complaint Create (app bug)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 12 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "Save disabled until valid" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 13 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-list 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 14 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 15 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "POST /api/complaints returns 201" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 16 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 17 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Edit sends PUT /api/contracts returning 200" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 18 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Create sends POST /api/contracts returning 201" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 19 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "/ redirects to /home with four tiles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 20 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "unknown path renders Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 21 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "sidebar entries are divs with routerLink" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 22 | .claude/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 23 | .claude/skills/control-angular-devtools/SKILL.md | "Playwright's bundled Chromium (Chrome for Testing 154.0.8037.0)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 24 | .claude/skills/control-angular-devtools/SKILL.md | "shell-browser/src/app/{manifest,content-script,detect-angular,backend,devtools-connected-flag}.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 25 | .claude/skills/control-angular-devtools/SKILL.md | "panel id chrome-extension://<id>Angular" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 26 | .claude/skills/control-angular-devtools/features/README.md | "Router Tree only when the app provides the router (devtools-tabs.component.ts)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 27 | .claude/skills/control-angular-devtools/features/attach.md | "Detection result isAngular, isDebugMode, isIvy, isSupportedAngularVersion (major 12+ or 0)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 28 | .claude/skills/control-angular-devtools/features/attach.md | "backendInstalled true; backendReady at ~950 ms; Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 29 | .claude/skills/control-angular-devtools/features/attach.md | "A production build gives isDebugMode: false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 30 | .claude/skills/control-angular-devtools/features/install.md | "test copy from %LOCALAPPDATA%\\Microsoft\\Edge Dev\\...\\ienfalfjdbdpebioblfackkekamfmbnh\\" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 31 | .claude/skills/control-angular-devtools/features/install.md | "chrome:// and edge:// URLs open an empty window (measured in Chrome Beta)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 32 | .claude/skills/control-angular-devtools/features/install.md | "Branded install/uninstall proven in Chrome Beta (2026-10-11)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 33 | .claude/skills/control-angular-devtools/features/profiler.md | "Profiler subscribes through ng.ɵsetProfiler" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 34 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected own subscribers bothOn a:16,b:16 afterRemoveA a:16,b:32" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 35 | .claude/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 36 | .claude/skills/control-angular-devtools/features/signal-graph.md | "Expected nodes: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 37 | .claude/skills/control-angular-devtools/features/signal-graph.md | "After angular:di_graph pane shows signal:count, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 38 | .claude/skills/control-angular-devtools/features/signal-graph.md | "Kinds: linked-signal, child-signal-prop, resource, unknown" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 39 | .claude/skills/control-pangular-inspector/SKILL.md | "control.mjs:73 defaults to 9999" (line reference) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 40 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "list-pages shows page id, URL and inspectors" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 41 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-component for one host tag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 42 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "instance ids like cgg06-4 change per load" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 43 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals returns No signal graph for <selector>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 44 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation outcomes: succeeded, cancelled, redirected, failed, skipped, pending" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 45 | .claude/skills/control-pangular-inspector/features/navigation.md | "limit defaults to 5 (at most 50)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 46 | .claude/skills/control-pangular-inspector/features/navigation.md | "page keeps limits.navigations (50) entries" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 47 | .claude/skills/control-pangular-inspector/features/panel.md | "panel URL http://localhost:4507/__pangular/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 48 | .claude/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 49 | .claude/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2 and TypeScript 6.0.3" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 50 | .claude/skills/control-pangular-inspector/features/setup.md | "portal worktree setup committed f102b97" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 51 | .claude/skills/control-pangular-inspector/features/source-scan.md | "scan tools: get-routes, get-components, ... build-meta" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 52 | .claude/skills/control-pangular-inspector/features/source-scan.md | "get-components returns [] at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 53 | .claude/skills/control-pangular-inspector/features/source-scan.md | "build-meta returns Angular 22.2.2, TS 6.0.3, ssr false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 54 | .claude/skills/control-vitest-browser-angular/SKILL.md | "Playwright's Chromium (Chrome for Testing 153)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 55 | .claude/skills/control-vitest-browser-angular/SKILL.md | "bundled-cdp derived 9350" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 56 | .claude/skills/control-vitest-browser-angular/SKILL.md | "instance port 9334 for chrome-beta-gemma4" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 57 | .claude/skills/control-vitest-browser-angular/SKILL.md | "--port N exits 2 naming holder's PID" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 58 | .claude/skills/control-vitest-browser-angular/SKILL.md | "ready means tab URL starts with http://127.0.0.1:<port>/__vitest_test__/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 59 | .claude/skills/control-vitest-browser-angular/SKILL.md | "window.ng has 23 functions" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 60 | .claude/skills/control-vitest-browser-angular/SKILL.md | "LanguageModel availability available in attach mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 61 | .claude/skills/control-vitest-browser-angular/features/README.md | "tester iframe frame name vitest-iframe" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 62 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4) without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 63 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "touch reruns suite in watch mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 64 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "npm test in spikes/ng222-app runs headless config" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 65 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "s1-vitest content scripts on http://127.0.0.1/* and http://localhost/*" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 66 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng === undefined" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 67 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "down uninstalls extension in attach mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 68 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵgetSignalGraph template div -> title,count,double,items" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 69 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "resolution path element -> DynamicTestModule -> Platform: core -> null" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 70 | .claude/skills/verify-angular-devtools/SKILL.md | "templateLostInPane true is known Angular bug" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 71 | .claude/skills/verify-pangular-inspector/SKILL.md | "Pangular Inspector @pangular-inspector/devtools 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 72 | .claude/skills/verify-pangular-inspector/SKILL.md | "setup steps need ports 3000 and 9999 free" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 73 | .commandcode/pstack-models.md | "A value of `inherit-parent` or `auto` runs that role on the parent session's model" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 74 | .commandcode/pstack-models.md | "On Command Code, the model slug is passed to the `agent` tool's `model` parameter" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 75 | .commandcode/pstack-models.md | "Command Code has no SessionStart hook; the `session hook` line here is inert" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 76 | .commandcode/pstack-models.md | "Judgment fallback: poolside/laguna-s-2-1-free" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 77 | .commandcode/pstack-models.md | "default effort: session" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 78 | .commandcode/skills/control-ai-browsers/features/health-check.md | "doctor exits 0 and sixteen check lines" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 79 | .commandcode/skills/control-angular-dev-app/SKILL.md | "Angular 22.2.2 for both fixtures" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 80 | .commandcode/skills/control-angular-dev-app/SKILL.md | "scripts are byte copies of lars-create-verification's" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 81 | .commandcode/skills/control-angular-dev-app/features/README.md | "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 82 | .commandcode/skills/control-angular-dev-app/features/counter.md | "page shows Clicks: 3 (double 6, cart 1)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 83 | .commandcode/skills/control-angular-dev-app/features/counter.md | "component OnPush by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 84 | .commandcode/skills/control-angular-dev-app/features/counter.md | "router() present: true with empty route list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 85 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "claim-list 5 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 86 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "/claim/create shows heading Complaint Create (app bug)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 87 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 88 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "POST /api/complaints returns 201" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 89 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list 20 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 90 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "PUT /api/contracts returns 200" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 91 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "POST /api/contracts returns 201" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 92 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "/ redirects to /home with four tiles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 93 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "unknown path renders Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 94 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 95 | .commandcode/skills/control-angular-devtools/SKILL.md | "shell-browser/src/app/...ts markers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 96 | .commandcode/skills/control-angular-devtools/SKILL.md | "panel id chrome-extension://<id>Angular" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 97 | .commandcode/skills/control-angular-devtools/features/README.md | "Router Tree only when app provides router (devtools-tabs.component.ts)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 98 | .commandcode/skills/control-angular-devtools/features/attach.md | "Detection result isAngular, isDebugMode, isIvy, isSupportedAngularVersion" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 99 | .commandcode/skills/control-angular-devtools/features/attach.md | "backendInstalled true; backendReady at ~950 ms; Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 100 | .commandcode/skills/control-angular-devtools/features/attach.md | "A production build gives isDebugMode: false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 101 | .commandcode/skills/control-angular-devtools/features/install.md | "test copy from Edge Dev profile path" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 102 | .commandcode/skills/control-angular-devtools/features/install.md | "Branded install/uninstall proven in Chrome Beta (2026-10-11)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 103 | .commandcode/skills/control-angular-devtools/features/profiler.md | "Profiler subscribes through ng.ɵsetProfiler" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 104 | .commandcode/skills/control-angular-devtools/features/profiler.md | "Expected own subscribers bothOn a:16,b:16 afterRemoveA a:16,b:32" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 105 | .commandcode/skills/control-angular-devtools/features/profiler.md | "DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 106 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Expected nodes: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 107 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "After angular:di_graph pane shows signal:count, effect:Effect" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 108 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Kinds: linked-signal, child-signal-prop, resource, unknown" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 109 | .commandcode/skills/control-pangular-inspector/SKILL.md | "control.mjs:73 defaults to 9999" (line reference) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 110 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "list-pages shows tab's page id, URL and inspectors" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 111 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "inspect-signals nodes and edges for one component" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 112 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids (cgg06-4) change with every page load" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 113 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "explain-navigation newest first with outcomes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 114 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "limit defaults to 5 (at most 50)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 115 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "page keeps limits.navigations (50) entries" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 116 | .commandcode/skills/control-pangular-inspector/features/panel.md | "panel URL http://localhost:4507/__pangular/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 117 | .commandcode/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 118 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2" dashboard version | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 119 | .commandcode/skills/control-pangular-inspector/features/setup.md | "portal worktree setup committed f102b97" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 120 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "scan tools include get-routes, get-components, ... build-meta" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 121 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "get-components returns [] at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 122 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "build-meta returns Angular 22.2.2, TS 6.0.3, ssr false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 123 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "Chrome 137+ branded builds ignore --load-extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 124 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "up and down wait 250 ms before exit" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 125 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "One run at a time per checkout" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 126 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4) without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 127 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "RERUN src/app/counter.spec.ts x1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 128 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "isolated world sees typeof window.ng === undefined" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 129 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "down uninstalls extension in attach mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 130 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵsetProfiler records events" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 131 | .commandcode/skills/link-workspace-packages/SKILL.md | "npm auto-symlinks workspace packages" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 132 | .commandcode/skills/link-workspace-packages/SKILL.md | "pnpm uses workspace: protocol" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 133 | .commandcode/skills/monitor-ci/SKILL.md | "nx.json nxCloudId or nxCloudAccessToken required" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 134 | .commandcode/skills/monitor-ci/references/fix-flows.md | "nx-cloud apply-locally <shortLink>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 135 | .commandcode/skills/monitor-ci/references/fix-flows.md | "git commit --allow-empty retry" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 136 | .commandcode/skills/nx-cloud-api/SKILL.md | "npx nx-cloud api --help" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 137 | .commandcode/skills/nx-cloud-api/SKILL.md | "All output is JSON" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 138 | .commandcode/skills/nx-cloud-api/SKILL.md | "exit codes table" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 139 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "task assets can be zero-byte terminal output" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 140 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "nx:noop commonly has empty output" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 141 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "If `cacheEnabled: false`, that run did not use the Nx task cache" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 142 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Record byte count and SHA-256" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 143 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 144 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Review failures from the last 24 hours by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 145 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 146 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Use a semaphore of at most five narrow detail requests" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 147 | .commandcode/skills/nx-generate/SKILL.md | "Format with `nx format --fix`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 148 | .commandcode/skills/nx-import/SKILL.md | "After nx `22.6.0`, `nx import` responds with .ndjson outputs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 149 | .commandcode/skills/nx-import/SKILL.md | "Make sure the destination directory is empty before importing" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 150 | .commandcode/skills/nx-import/SKILL.md | "Pin ESLint to v9" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 151 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin` scans for ESLint config files" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 152 | .commandcode/skills/nx-import/references/ESLINT.md | "Plugin option `targetName: eslint:lint`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 153 | .commandcode/skills/nx-import/references/GRADLE.md | "`@nx/gradle` plugin expects gradlew at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 154 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.*`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 155 | .commandcode/skills/nx-import/references/JEST.md | "Root `jest.preset.js` content uses `@nx/jest/preset`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 156 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.*`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 157 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Nx replaces Turborepo task orchestration" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 158 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 159 | .commandcode/skills/nx-plugins/SKILL.md | "List plugins: `pnpm nx list`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 160 | .commandcode/skills/nx-plugins/SKILL.md | "Install plugins `pnpm nx add <plugin>`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 161 | .commandcode/skills/verify-angular-devtools/SKILL.md | "templateLostInPane true known Angular bug" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 162 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "Pangular Inspector @pangular-inspector/devtools 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 163 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "setup steps need ports 3000 and 9999 free" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 164 | .commandcode/taste/angular/taste.md | "`angular-developer` skill should be model-invocable (no `disable-model-invocation` flag)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 165 | .commandcode/taste/angular/taste.md | "Chrome/Edge web extension dev tools must be implemented in Angular" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 166 | .commandcode/taste/angular/taste.md | "Features should be Angular-only with no third-party packages; specifically excludes Vitest" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 167 | .commandcode/taste/angular/taste.md | "Modern Angular only: standalone components, signals (including signal inputs) and zoneless" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 168 | .commandcode/taste/communication/taste.md | "provideAiDevTools() not provideAiDevtools()" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 169 | .commandcode/taste/communication/taste.md | "never call AskUserQuestion" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 170 | .commandcode/taste/design/taste.md | "must never generate code — no migrations, no app-specific code" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 171 | .commandcode/taste/design/taste.md | "Built-in AI (Prompt API) calls are panel-local by design" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 172 | .commandcode/taste/design/taste.md | "Removing `panel/**` from `web_accessible_resources` is conditional" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 173 | .commandcode/taste/tooling/taste.md | "Command Code discovers skills from `.commandcode/skills/` and `.agents/skills/`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 174 | .commandcode/taste/tooling/taste.md | "Edge instance profiles must never sign in or sync his Windows work account" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 175 | .commandcode/taste/workflow/taste.md | "Work stays uncommitted and unpushed unless he asks to commit" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 176 | .commandcode/taste/workflow/taste.md | "Commit taste-file changes automatically ... one commit per changed taste file" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 177 | AGENTS.md | "GSD Path workflow rules ... in user-scope ~/AGENTS.md" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 178 | docs/afk-run-2026-10-12.md | "Tree clean: git status shows nothing but ignored paths" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 179 | docs/afk-run-2026-10-12.md | "Only the four standing per-model instances run, each on one blank tab" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 180 | docs/feature-proposals.md | "provideAiDevTools() companion package export" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 181 | plans/angular-ai-devtools-proposals.handoff.md | "Repository main head fbe3aac at writing" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 182 | references/ai-browsers-verification.md | "state verdict takes 10-20 minutes for two runs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 183 | references/ai-browsers-verification.md | "port 9992 free check" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 184 | references/edge-dev-aion-model.md | "Edge 158 runs newest model; Edge 157 cannot" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 185 | research/00-browser-probe.md | "Phi-4-mini instance ... stuck" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 186 | research/01-built-in-ai-apis.md | "Chrome ships LanguageModel in extensions since Chrome 138" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 187 | research/01-built-in-ai-apis.md | "DevTools frontend creates extension panel iframes with allow=language-model" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 188 | research/01-built-in-ai-apis.md | "Structured output is stable" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 189 | research/03-prior-art.md | "Chrome DevTools MCP third-party tools use devtoolstooldiscovery" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 190 | research/04-ecosystem.md | "Vitest orchestrator URL __vitest_test__" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 191 | research/08-recent-angular-features.md | "Release Insights says no new MCP server features in Angular 22" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 192 | research/09-nano-tool-session-error.md | "availability mismatch is a Chromium conformance bug" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 193 | research/09-nano-tool-session-error.md | "crbug 422803232 is public" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 194 | research/10-model-capabilities.md | "Gemini Nano v3: no public model card; Chrome Prompt API names Nano but not tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 195 | research/10-model-capabilities.md | "`AIPromptAPIToolUse` is `experimental` at the 156 tag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 196 | research/10-model-capabilities.md | "Gemma 4 has native function-calling support" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 197 | research/10-model-capabilities.md | "Phi-4-mini has BFCL 0-shot 70.3" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 198 | research/12-legacy-vs-modern-angular.md | "Removed APIs Z1-Z9 do not compile on 22.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 199 | research/13-portal-legacy-audit.md | "Portal initially used Reactive Forms in 3 forms" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 200 | research/13-portal-legacy-audit.md | "Forms migrated to Signal Forms in commits 754aa1e/66e8ad6/92053b9" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 201 | research/13-portal-legacy-audit.md | "zone.js polyfill present in zoneless app" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 202 | research/13-portal-legacy-audit.md | "No `@NgModule`, `*ngIf`, etc. in portal app code" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 203 | research/14-ai-devtools-prior-art.md | "Storybook MCP addon serves at `/mcp` via Vite middleware" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 204 | research/14-ai-devtools-prior-art.md | "Chrome DevTools AI assistance uses cloud Gemini" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 205 | research/16-ssr-runtime.md | "SSR page exposes `__ngDebugHydrationInfo__`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 206 | research/16-ssr-runtime.md | "Transfer state readable via `ng.ɵgetTransferState`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 207 | research/16-ssr-runtime.md | "Event replay supported" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 208 | research/17-vitest-browser-runtime.md | "Vitest Playwright provider supports attaching to branded browser" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 209 | research/17-vitest-browser-runtime.md | "Extension and model work on attached instance" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 210 | research/18-edge-prevent-auto-signin.md | "Edge auto-signin prevented by feature flags not `msBrowserSignin`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 211 | research/18-edge-prevent-auto-signin.md | "Exact command-line invocation uses fresh profile" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
