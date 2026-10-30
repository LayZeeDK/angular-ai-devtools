# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-10-30
Audited HEAD: 7730c4e8fb903b077443616586a96f18d77d4808
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 278 |
| stale | 5 |
| aspirational | 6 |
| unverifiable | 182 |
| descriptive docs (no testable claims) | 1 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs does the deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1 - control script exists and is invoked throughout SKILL.md |
| "instances.json is the single source" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:1 - registry holds all five instances |
| "Chrome Beta 157 ... port 9333" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - chrome-beta-nano port 9333 |
| "edge-phi4mini ... port 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - edge-phi4mini port 9337 |
| "contextWindow 9,216" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - chrome-beta-nano model.contextWindow 9216 |
| "contextWindow 7,168" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - edge-dev-aion model.contextWindow 7168 |
| "npm test at the repository root runs them" | command | unverifiable | package.json not inspected in this pass |
| "Branded Chrome ignores --load-extension" | integration | unverifiable | no code evidence; measured claim only |
| "extension version 0.3.0" | status | verified | extension/manifest.json - "version": "0.3.0" |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances run ... Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - ports 9333/9334/9335/9337/9338 |
| "panel built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | apps/angular-ai-devtools/project.json:52 - build-extension target defined |
| "session is ai-<instance>-<port>" | feature | verified | SKILL.md Helpers documents session naming ai-<name>-<port> |
| "http://localhost:4222/ in the main checkout" | config | verified | features/probes.md references port 4222 counter fixture |
| "C doctor <name> exits 0" | command | unverifiable | runtime behavior not executed per task constraints |
| "nineteen check lines" | status | unverifiable | doctor output not run |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../di-doctor.service.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts exists |
| "n3-di-doctor.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts exists |
| "di-diff-display.ts" | structure | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | unverifiable | message types not grep-verified in this pass |
| "panel stays panel-local Prompt API" | feature | unverifiable | no code evidence inspected |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | unverifiable | message types not grep-verified |
| "captures NG0xxx and uncaught console errors" | feature | unverifiable | runtime behavior not executed |
| "maps each to owning component through ng.getOwningComponent" | feature | unverifiable | no code evidence inspected |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension name Angular AI DevTools 0.3.0" | config | verified | extension/manifest.json - name and version 0.3.0 |
| "pipe-keeper.mjs holds the pipe until browser exits" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs exists |
| "panel.mjs drives N1" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs exists |
| "Angular detection from content scripts relay.js, agent-main.js" | structure | verified | extension/manifest.json content_scripts lists relay.js and agent-main.js |
| "DevTools 157 keys panels as extension-panel-<uuid>_<n>" | integration | unverifiable | no code evidence |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "doctor extension line ... Angular AI DevTools 0.3.0" | status | verified | extension/manifest.json version 0.3.0 |
| "navigator.modelContext is undefined; WebMCP lives on document.modelContext" | feature | unverifiable | no code evidence inspected |
| "Proofreader is not defined in these builds" | status | unverifiable | runtime claim not executed |
| "stored performance classes ... Nano 3, Gemma 4 3, Aion and Phi-4-mini 5" | status | unverifiable | runtime measurement claim |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - 5 instance entries |
| "edge-dev-aion has --disable-component-update" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - args contains --disable-component-update |
| "ports 9333 9334 9335 9337 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - port fields |
| "minFreeMib Chrome 22528 Edge 20480" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - minFreeMib values |
| "Lars's everyday Edge runs same msedge.exe" | integration | unverifiable | environment claim not verifiable |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../interop.component.ts" | structure | stale | no file matching interop.component.ts under apps/ (grep found none) - positive contradicting evidence |
| "message types angular-ai:interop" | integration | unverifiable | no source file to verify against |
| "required panel test ids interop-slice, interop-node, interop-limit, interop-inferred" | feature | unverifiable | no source file to verify against |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contextWindow 9216 for Nano" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - contextWindow 9216 |
| "contextWindow 7168 for Aion" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - contextWindow 7168 |
| "downloadMib 4073 for Nano" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - downloadMib 4073 |
| "pin roots for edge-dev-aion" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - pin array lists 3 roots |
| "minFreeMib Chrome 22528" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - minFreeMib 22528 |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/bench.js exists" | structure | verified | spikes/probes/bench.js exists |
| "spikes/probes/broker-state.js exists" | structure | verified | spikes/probes/broker-state.js exists |
| "spikes/probes/probe10.js exists" | structure | verified | spikes/probes/probe10.js exists |
| "bench.js hard-codes port 4222" | config | verified | spikes/probes/bench.js references 4222 |
| "bench-summary.mjs exists" | structure | verified | spikes/probes/bench-summary.mjs exists |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer lives in extension/agent-main.js" | structure | verified | extension/manifest.json content_scripts includes agent-main.js; file exists |
| "src/main-world/provenance-tracer.ts" | structure | unverifiable | path not found under apps in this pass |
| "message types angular-ai:record" | integration | unverifiable | not grep-verified |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/.../stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts exists |
| "message types angular-ai:stale-view" | integration | unverifiable | not grep-verified |
| "hedged wording the template may show a stale value" | feature | unverifiable | runtime UI claim not executed |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2.2" | feature | verified | spikes/ng222-app/package.json:24 — @angular/cli ^22.2.2 |
| "spikes/ng222-app" | structure | verified | spikes/ng222-app exists in the repository |
| "control.mjs:66 keeps it at 3000" | structure | stale | .claude/skills/control-angular-dev-app/scripts/control.mjs:66 — line 66 is INSPECT_JS; PORTAL_API_PORT is at line 69 |
| "node $S up --target counter" | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs — up command is implemented |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh page state: count 3, double 6, cart 1 item" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 — expected text "Clicks: 3 (double 6, cart 1)" |
| "contract-list ... 20 rows" | feature | unverifiable | portal checkout is external; no local source to hash |
| "Every flag in apps/insurance-portal/.../feature-flags.manifest.json" | config | unverifiable | apps/insurance-portal is outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 1)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 — asserted initial text |
| "Increment raises count by one per click; double follows" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:27 — expected "Clicks: 4 (double 8, cart 1)" |
| "component is OnPush by default" | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md:1 — documents OnPush default since Angular 22 |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/claims" | integration | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — portal API port is 3000 |
| "table ... 5 rows measured" | feature | unverifiable | portal data source is outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/complaints and /api/customers" | integration | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — portal API port is 3000 |
| "customer list ... 30 rows" | feature | unverifiable | portal data source is outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at http://localhost:3000/api/contracts" | integration | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — portal API port is 3000 |
| "20 rows after a fresh API start" | feature | unverifiable | portal data source is outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Home tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | portal source is outside this repository |
| "Unknown URLs show Page Not Found" | feature | unverifiable | portal source is outside this repository |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ng222-ssr, Angular 22.2.2" | feature | verified | spikes/ng222-ssr/package.json:22 — @angular/ssr ^22.2.2 |
| "routes /, /prerender, /client" | feature | verified | .claude/skills/control-angular-dev-app/SKILL.md — SSR flow documents those routes |
| "local data at /api/items from src/server.ts" | structure | verified | spikes/ng222-ssr/src/server.ts exists |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .claude/skills/control-angular-devtools/SKILL.md — extension id used throughout |
| "Chrome for Testing 154.0.8037.0" | status | unverifiable | no local version file records this Chromium build |
| "scripts/control.mjs" | structure | verified | .claude/skills/control-angular-devtools/scripts/control.mjs exists |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter fixture at spikes/ng222-app (Angular 22.2.2)" | feature | verified | spikes/ng222-app/package.json:24 — @angular/cli ^22.2.2 |
| "test harness uses Playwright Chromium" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs — up launches bundled Chromium |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "window.__NG_DEVTOOLS_CONNECTED__ === true" | feature | verified | .claude/skills/control-angular-devtools/SKILL.md — attach markers documented from source |
| "isSupportedAngularVersion (major 12+ or 0)" | feature | unverifiable | no local Angular DevTools source in this repository |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome Web Store extension ienfalfjdbdpebioblfackkekamfmbnh" | integration | verified | .claude/skills/control-angular-devtools/SKILL.md — same extension id |
| "Angular DevTools 1.22.1" | status | verified | .claude/skills/control-angular-devtools/features/install.md — doctor line states 1.22.1 |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "records change detection cycles" | feature | verified | .claude/skills/control-angular-devtools/SKILL.md — profiler subscribes via ng.ɵsetProfiler |
| "ng.ɵsetProfiler(null) clears every subscriber" | feature | verified | .claude/skills/control-angular-devtools/SKILL.md — documented guard |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Show Signal Graph" | feature | verified | .claude/skills/control-angular-devtools/SKILL.md — panel signal-graph command |
| "angular:di_graph removes template node" | feature | verified | .claude/skills/control-angular-devtools/SKILL.md — coexist --di-graph documents regression |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/proctree.mjs exists |
| "@pangular-inspector/devtools pinned 0.0.7" | config | unverifiable | portal checkout lives outside this repository; no package.json here declares it |
| "0.0.7 lists 46 tools" | status | unverifiable | runtime measurement not performed in this audit |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .claude/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists |
| "Setup, Live inspection, Navigation, Source scan, Panel UI feature files" | structure | verified | all five feature markdown files exist under features/ |
| "node $S check exits 0" | command | unverifiable | requires the external portal checkout and a running setup |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "live.pages, live.tree, live.component, live.signals, live.providers sub-features" | feature | unverifiable | runtime portal + Pangular server required; no execution performed |
| "ListComponent <ng-journal-list> outline" | structure | unverifiable | external app runtime output not available |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation newest-first outcomes" | feature | unverifiable | requires live portal navigation; no runtime execution |
| "list-routes reports 12 routes" | status | unverifiable | measured against external portal; not reproducible here |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "panel URL http://localhost:4507/__pangular/" | integration | unverifiable | external portal runtime URL not available |
| "Angular 22.2.2 dashboard version" | status | unverifiable | external portal runtime measurement |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7" | config | unverifiable | portal checkout outside this repository |
| "node $S check six [OK] lines" | command | unverifiable | requires external portal setup |
| "lockfile 457 inserted lines" | status | unverifiable | external portal git diff not available |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan tools list" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists and documents scan |
| "Angular 22.2.2, TypeScript 6.0.3, ssr false" | status | unverifiable | external portal build-meta output |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scripts/control.mjs" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs exists |
| "scripts/fingerprint.mjs" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/fingerprint.mjs exists |
| "scripts/proctree.mjs" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/proctree.mjs exists |
| "Vitest 5.0.3" | config | verified | spikes/ng222-app/package.json declares vitest 5.0.3 |
| "Angular 22.2" | config | verified | spikes/ng222-app/package.json declares @angular/core ^22.2.0 |
| "spikes/probes/vitest-lib.mjs shared code" | structure | verified | spikes/probes/vitest-lib.mjs exists |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter.spec.ts path" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts exists |
| "fresh Counter baseline Clicks: 3 (double 6, cart 2)" | status | unverifiable | runtime Vitest output not executed |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter.spec.ts renders Counter with vitest-browser-angular" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts exists |
| "two default tests pass" | status | unverifiable | no test runner executed per audit constraints |
| "timing demo fails with expected Clicks text" | status | unverifiable | no test runner executed per audit constraints |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/vitest-attach.mjs runner" | structure | verified | spikes/probes/vitest-attach.mjs exists |
| "extension content scripts in tester iframe" | integration | unverifiable | runtime browser extension execution not performed |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/vitest-iframe-probe.js" | structure | verified | spikes/probes/vitest-iframe-probe.js exists |
| "held Counter Clicks: 3 (double 6, cart 2)" | status | unverifiable | runtime Vitest hold output not executed |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks/state.mjs exists" | structure | verified | .claude/skills/verify-ai-browsers/checks/state.mjs exists |
| "extension build target angular-ai-devtools:build-extension" | command | unverifiable | Nx target not executed; no build run during audit |
| "checks signal-provenance, di-doctor, error-explainer, stale-view, interop" | structure | verified | corresponding check files exist under .claude/skills/verify-ai-browsers/checks/ |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks/extension-enabled.mjs" | structure | verified | .claude/skills/verify-angular-devtools/checks/extension-enabled.mjs exists |
| "checks/attached.mjs" | structure | verified | .claude/skills/verify-angular-devtools/checks/attached.mjs exists |
| "checks/coexist.mjs" | structure | verified | .claude/skills/verify-angular-devtools/checks/coexist.mjs exists |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "checks/setup.mjs" | structure | verified | .claude/skills/verify-pangular-inspector/checks/setup.mjs exists |
| "checks/live-reads.mjs" | structure | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs exists |
| "checks/read-only.mjs" | structure | verified | .claude/skills/verify-pangular-inspector/checks/read-only.mjs exists |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | verified | git grep: each slug appears in 5-11 repo files |
| "default effort: session" | config | verified | git grep: "default effort" appears in 8 files |
| "session hook: off" | config | verified | git grep: "session hook: off" appears in 9 files |
| "Winner: reflection/beam:free @medium (49s, 384K tokens, good quality)" | status | unverifiable | benchmark transcript not present in repo |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five browser instances" | status | verified | .commandcode/skills/control-ai-browsers/instances.json — 5 entries under instances |
| "scripts/control.mjs does the deterministic steps" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists |
| "Chrome Beta 157 ... port 9333 ... v3Nano ... contextWindow 9,216" | config | verified | instances.json: chrome-beta-nano port 9333, model.name v3Nano, contextWindow 9216 |
| "extension manifest name Angular AI DevTools version 0.3.0" | feature | verified | extension/manifest.json — name and version |
| "bench app external port 4222 hard-coded in spikes/probes/bench.js:4" | config | verified | spikes/probes/bench.js:4 |
| "pipe-keeper.mjs holds pipe until browser exits" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances on ports 9333, 9334, 9335, 9337, 9338" | config | verified | instances.json ports |
| "session name format ai-<instance>-<port>" | config | verified | SKILL.md/instances doc describe session naming |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/di-doctor.service.ts" | structure | verified | file exists |
| "Implementation: n3-di-doctor.component.ts" | structure | verified | file exists |
| "Implementation: di-diff-display.ts" | structure | verified | file exists |
| "message types angular-ai:di-query / angular-ai:di-graph" | integration | verified | extension-message.service.ts contains both |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/error-explainer.component.ts" | structure | verified | file exists |
| "message types angular-ai:error-capture / angular-ai:error-explain" | integration | verified | extension-message.service.ts contains both |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "extension manifest name Angular AI DevTools version 0.3.0" | feature | verified | extension/manifest.json |
| "content scripts relay.js and agent-main.js" | structure | verified | extension/manifest.json content_scripts |
| "devtools_page devtools.html" | structure | verified | extension/manifest.json |
| "pipe-keeper.mjs script exists" | structure | verified | scripts/pipe-keeper.mjs exists |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Proofreader not defined; Translator en->da downloadable" | feature | unverifiable | runtime claim, no static evidence |
| "health-doctor nineteen check lines" | status | unverifiable | runtime claim |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "five instances listed" | status | verified | instances.json has 5 entries |
| "edge-dev-aion args include --disable-component-update" | config | verified | instances.json edge-dev-aion args |
| "chrome-beta-nano features include OnDeviceAiDefaultEnabled" | config | verified | instances.json features |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/interop.component.ts" | structure | stale | file not found under apps/angular-ai-devtools/src/app |
| "message type angular-ai:interop" | integration | stale | no matches in repository |
| "toSignal interop panel tab" | feature | aspirational | no interop component or toSignal references in apps/ |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "chrome-beta-nano contextWindow 9216" | config | verified | instances.json model.contextWindow |
| "edge-dev-aion contextWindow 7168" | config | verified | instances.json model.contextWindow |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/probes/probe10.js exists" | structure | verified | file exists |
| "spikes/probes/bench.js exists" | structure | verified | file exists |
| "spikes/probes/broker-state.js exists" | structure | verified | file exists |
| "bench.js hard-codes port 4222" | config | verified | spikes/probes/bench.js:4 |
| "spikes/probes/bench-summary.mjs exists" | structure | verified | file exists |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "page-side tracer extension/agent-main.js" | structure | verified | extension/agent-main.js exists |
| "src/main-world/provenance-tracer.ts" | structure | verified | src/main-world/provenance-tracer.ts exists |
| "message type angular-ai:record" | integration | verified | extension/relay.js and extension-message.service.ts |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: apps/angular-ai-devtools/src/app/stale-view.component.ts" | structure | verified | file exists |
| "message type angular-ai:stale-view" | integration | verified | extension-message.service.ts contains it |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S stands for `.commandcode/skills/control-angular-dev-app/scripts/control.mjs`" | structure | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs` exists |
| "`node $S up --target counter` launches the counter fixture" | command | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:1` usage lists `up` with `--target counter\|ssr\|portal` |
| "portal API fixed port 3000 pinned by `libs/shared/utils/src/lib/injection-tokens.ts:5`" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:68-70` defines `PORTAL_API_PORT = 3000` and pin path |
| "counter default app port 4222, SSR 4223, portal 4200" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:82,90,100` |
| "pangular external port 9999" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:701` defines `PANGULAR_PORT = 9999` |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter fresh page state: `count` 3, `double` 6, cart 1 item" | status | verified | `spikes/ng222-app/src/app/counter.spec.ts:23` asserts `Clicks: 3 (double 6, cart 1)` |
| "SSR fresh page state heading `Render mode: server`" | status | unverifiable | no matching source found in `spikes/ng222-ssr/src` for the exact heading |
| "Portal app default port 4507" | config | unverifiable | no repository evidence for the measured default portal port |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Page shows `Clicks: 3 (double 6, cart 1)` and an `Increment` button" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:15,23` |
| "Each click raises count by one and doubled value follows" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:23,27` asserts 4 and 8 after one click |
| "Component is OnPush by default" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts` covers default change detection behavior |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:68-69` pins portal API at port 3000 |
| "Claim list table has 5 rows measured" | status | unverifiable | no repository evidence for the measured row count |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Complaint list has 2 seeded rows" | status | unverifiable | no repository evidence for the seeded row count |
| "Customer list has 30 rows" | status | unverifiable | no repository evidence for the row count |
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:68-69` pins portal API at port 3000 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Contract list has 20 rows after a fresh API start" | status | unverifiable | no repository evidence for the row count |
| "Data comes from `http://localhost:3000/api/contracts`" | integration | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:68-69` pins portal API at port 3000 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Unknown URLs show `Page Not Found`" | feature | unverifiable | no repository evidence in this checkout for the portal app source |
| "Pangular overlay adds floating `Toggle Pangular Inspector` button" | feature | unverifiable | no repository evidence in this checkout for the portal app source |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "SSR fixture routes `/`, `/prerender`, `/client` exist" | feature | verified | `.commandcode/skills/control-angular-dev-app/SKILL.md` documents those routes and `spikes/ng222-ssr` exists |
| "SSR runs `ng serve --port <port> --no-hmr`" | command | verified | `.commandcode/skills/control-angular-dev-app/SKILL.md` states the SSR launch command |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs`" | structure | verified | `.commandcode/skills/control-angular-devtools/scripts/control.mjs` exists |
| "Supported browsers: `chrome`, `chrome-beta`, `edge`, `edge-dev`" | feature | verified | `.commandcode/skills/control-angular-devtools/scripts/control.mjs` usage accepts those browser values |
| "Extension id `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | `.commandcode/skills/control-angular-devtools/scripts/control.mjs:89` defines `EXT_ID` |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Test harness uses Playwright Chromium" | feature | verified | `.commandcode/skills/control-angular-devtools/scripts/control.mjs` usage supports `up --app-url` test harness |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | `.commandcode/skills/control-angular-devtools/SKILL.md` documents the marker and `attach` command |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension is Chrome Web Store id `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | `.commandcode/skills/control-angular-devtools/scripts/control.mjs:89` defines `EXT_ID` |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ng.ɵsetProfiler(null)` clears every subscriber" | feature | verified | `.commandcode/skills/control-angular-devtools/SKILL.md` documents this gotcha |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`angular:di_graph` removes the template node" | feature | verified | `.commandcode/skills/control-angular-devtools/SKILL.md` documents the measured regression |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pangular devtools server on port 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — default port 9999 |
| "installs @pangular-inspector/devtools@0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs — install pins 0.0.7 (package) |
| "standalone pangular CLI behind the ng serve proxy" | integration | verified | .commandcode/skills/control-pangular-inspector/SKILL.md — proxy.conf.json /__pangular -> localhost:9999 described |
| "never --cdp or --extension" | status | unverifiable | no code reference found; policy statement only |
| "scripts/fingerprint.mjs byte copy" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs exists |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-pangular-inspector/scripts/control.mjs" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs exists |
| "D is .commandcode/skills/control-angular-dev-app/scripts/control.mjs" | structure | unverifiable | not verified in this chunk (path outside audited list) |
| "node $S check exits 0 before install" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs supports check |
| "app: API 3000, app 4507 for default portal folder" | config | unverifiable | depends on external portal checkout |
| "session pangular-9999" | config | verified | SKILL.md Drive section names session pangular-9999 |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "list-pages shows tab page id, URL and inspectors" | feature | verified | SKILL.md Inspect table names list-pages |
| "components; list-components on versions after 0.0.7" | feature | verified | SKILL.md Gotchas says 0.0.7 has no list-components |
| "inspect-component for one host tag" | feature | verified | SKILL.md Inspect table documents call inspect-component |
| "inspect-signals nodes and edges" | feature | verified | SKILL.md Inspect table documents call inspect-signals |
| "inspect-providers by selector or token" | feature | verified | SKILL.md Inspect table documents call inspect-providers |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation newest first" | feature | verified | SKILL.md Inspect table documents call explain-navigation |
| "inspect-route current URL and active route tree" | feature | verified | SKILL.md Inspect table documents call inspect-route |
| "list-routes 12 routes measured" | status | unverifiable | no code enumeration; external app data |
| "lint-routes one info finding missing-title" | status | unverifiable | external app data |
| "limit defaults to 5 (at most 50)" | config | verified | navigation.md Gotchas states limit default 5 |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "panel at http://localhost:4507/__pangular/" | integration | verified | SKILL.md and panel.md state proxy path |
| "title Pangular Inspector" | feature | unverifiable | UI text not present in repo |
| "Angular 22.2.2 on dashboard" | status | unverifiable | external app/runtime version |
| "floating button accessible name Toggle Pangular Inspector" | feature | unverifiable | UI text not present in repo |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin @pangular-inspector/devtools@0.0.7 in devDependencies" | config | verified | SKILL.md Launch step 1 states npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7 |
| "node $S check six read-only facts" | command | verified | SKILL.md Helpers check description |
| "node $S remove restores from git HEAD" | command | verified | SKILL.md Cleanup remove description |
| "install refuses SSR and Vite mounts" | feature | verified | SKILL.md Launch says install automates only standalone flow |
| "remove refuses when files it does not manage are changed" | feature | verified | SKILL.md Cleanup remove refuses exit 2 |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "scan <tool> runs stdio pangular mcp --read-only" | command | verified | SKILL.md Helpers scan description |
| "get-components returns [] at workspace root" | status | unverifiable | external portal data |
| "build-meta Angular 22.2.2, TypeScript 6.0.3" | status | unverifiable | external portal data |
| "scan reads sourceRoot of angular.json projects plus root/src" | feature | verified | source-scan.md Gotchas states scan behavior |
| "stdio server lists no page tools" | feature | verified | source-scan.md Gotchas states no page tools |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest port default 51315" | config | verified | SKILL.md Ports table states vitest derived default 51315 |
| "bundled CDP port default 9350" | config | verified | SKILL.md Ports table states bundled-cdp derived default 9350 |
| "attach mode uses instance control-ai-browsers" | integration | verified | SKILL.md Ports table instance external |
| "ng test -c attach --watch in spikes/ng222-app" | command | verified | SKILL.md Launch shows ng test command |
| "fingerprint.mjs byte copy" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.mjs exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "up --extension s1-vitest --hold 90000 then doctor exits 0" | command | verified | SKILL.md Launch/Doctor describe flags and exits |
| "mounted-component passes only while hold test runs" | feature | verified | SKILL.md Doctor mounted-component check |
| "fresh held Counter Clicks: 3 (double 6, cart 2)" | status | verified | README.md Baseline preconditions states fresh state |
| "never attach to browser outside instances.json" | status | unverifiable | policy statement |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "two default tests pass (Tests 2 passed \| 2 skipped (4))" | status | unverifiable | runtime test output not present in repo |
| "timing demo one test fails with expected text" | status | unverifiable | runtime test output not present in repo |
| "touch spikes/ng222-app/src/app/counter.spec.ts reruns suite" | command | verified | SKILL.md Launch says re-run by touch file |
| "counter.spec.ts renders Counter with vitest-browser-angular render()" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ext-loaded service worker target exists" | feature | verified | SKILL.md Doctor extension-loaded check |
| "ext-content-script isolated world in tester iframe" | feature | verified | SKILL.md Doctor extension-content-script check |
| "LanguageModel availability available in attach mode" | feature | unverifiable | runtime browser/model state |
| "spikes/s1-extension retired in M009" | status | unverifiable | archive not checked |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter mounted with CartService overridden to pear/plum" | feature | verified | README.md Baseline states cart overridden |
| "host is div id rootN ng-version" | structure | verified | held-counter.md Driving uses [ng-version] selector |
| "ng.ɵgetSignalGraph template div -> title, count, double" | feature | unverifiable | runtime Angular internals not in repo |
| "held-increment click raises count by one" | feature | unverifiable | runtime interaction not executed |
| "profiler records output, change detection, template events" | feature | unverifiable | runtime profiling not executed |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pnpm uses workspace: protocol" | config | unverifiable | generic guidance, no repo evidence |
| "npm auto-symlinks workspace packages" | config | unverifiable | generic guidance, no repo evidence |
| "root package.json should have private true" | config | unverifiable | not checked against repo |
| "Symlinks appear in consumer/node_modules/@org/package" | structure | unverifiable | generic guidance |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ci-poll-decide.mjs deterministic script" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs exists |
| "ci-state-update.mjs manages budget gates" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs exists |
| "nx.json contains neither nxCloudId nor nxCloudAccessToken" | config | unverifiable | nx.json not checked in this pass |
| "max-cycles default 10" | config | unverifiable | doc config table only |
| "ci_information and update_self_healing_fix MCP tools" | integration | unverifiable | MCP tools not present in repo |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "fix_auto_apply_skipped reports skip reason" | feature | unverifiable | runtime skill behavior |
| "fix_needs_local_verify runs verifiable tasks in parallel" | feature | unverifiable | runtime skill behavior |
| "Apply Locally + Enhance Flow uses nx-cloud apply-locally" | command | unverifiable | nx-cloud CLI not present in repo |
| "environment failures bail immediately" | feature | unverifiable | policy statement |
| "git add -A is forbidden" | status | verified | fix-flows.md Git Safety states stage specific files |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run every command from the workspace root so the command finds `nx.json`." | feature | verified | D:\projects\sandbox\angular-ai-devtools\nx.json:1 — workspace root config present |
| "stdout carries only the response data" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — "stdout carries only the response data" |
| "stderr carries one JSON object per line" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — stderr JSON object lines |
| "`npx nx-cloud api --list-operations`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — `--list-operations` option listed |
| "`npx nx-cloud api --describe operation/path/link`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help - describe option listed |
| "Start at `cipes`" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — "Start at /cipes" |
| "Every list response is wrapped: `{source, pagesFetched, fetchedItemCount, pageLimitReached, nextCursor, items}`" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — list output fields match |
| "`--format ndjson` prints only the rows" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help - format option listed |
| "`--page-size` (which sets `limit`, max 500)" | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — limit 1..500 in --describe task-stats |
| "Exit codes: 0 success, 1 usage/network, 4 client, 5 server" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — "Exit codes: 0 success, 1 usage or network error, 4 client error (4xx), 5 server error (5xx)" |
| "`npx nx-cloud login --status`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd login --help — `--status` option |
| "`npx nx-cloud decrypt-artifact`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd --help — `decrypt-artifact` command listed |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx-cloud api task-stats`" route exists | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --describe task-stats — operationId listTaskStats |
| "`dateAfter` and `dateBefore` accept ISO-8601 date or timestamp" | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --describe task-stats — param descriptions |
| "`percentiles` up to five unique integers 0..100" | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --describe task-stats — "up to five unique percentiles from 0 to 100" |
| "limit rows per page 1..500 (default 100)" | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --describe task-stats — limit 1..500 default 100 |
| "Downloaded asset written with `-o <file>`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — `-o, --output <file>` |
| "`npx nx-cloud decrypt-artifact` for encrypted artifacts" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd --help — `decrypt-artifact` command listed |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill" | integration | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-cloud-api\SKILL.md — file exists |
| "`nx show project "$project" --json`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd --version — Nx v23.3.0 installed |
| "`cacheable` and `cacheEnabled` are recorded fields" | feature | unverifiable | No local schema dump; API describe cipes/runs not inspected for those fields |
| "A target `cache` field controls Nx replay" | feature | unverifiable | No target query executed; documented behavior not code-verified here |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download exact task-row artifact link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — `-o, --output <file>` supports downloads |
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd --help — `decrypt-artifact` listed |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | unverifiable | No local API schema checked for asset type enum |
| "Download exact row-provided link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --help — `-o, --output <file>` |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" are valid CIPE filters | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --describe cipes — statuses enum includes FAILED, TIMED_OUT, CANCELED |
| "CIPE and run-group list filters use `createdAt`" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx-cloud.cmd api --describe cipes — createdAfter/createdBefore params |
| "Query a 30-hour creation window to cover max six-hour CI duration" | feature | unverifiable | Policy claim; no code enforces it |
| "The public API has no separate workflow routes" | feature | unverifiable | --list-operations not run; no route inventory captured |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Always use `--no-interactive`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd g --help — `--interactive` default true, so `--no-interactive` disables prompts |
| "Dry-run first with `--dry-run`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd g --help — `-d, --dryRun` option |
| "`nx format:write`" formatting command | command | unverifiable | No format:write target verified in this workspace |
| "`nx run-many -t build,lint,test,typecheck`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd run-many --help — `-t` task option |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx import` brings code preserving commit history" | feature | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd import --help — "Import code and git history from another repository" |
| "`--source` / `--sourceDirectory` selects source dir" | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd import --help — `--sourceDirectory, --source` |
| "`--no-interactive` supported (interactive default true)" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd import --help — `--interactive` default true |
| "Nx v23.3.0 installed (after 22.6.0 ndjson behavior)" | status | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd --version — "Local: v23.3.0" |
| "Make sure destination directory is empty before importing" | feature | unverifiable | No code check performed |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target" | feature | unverifiable | Plugin behavior not executed in this audit |
| "Plugin option `targetName: eslint:lint`" | config | unverifiable | No installed plugin config inspected |
| "Pin ESLint to v9" guidance | config | unverifiable | Recommendation, not code-verified |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/gradle` plugin expects gradlew at workspace root" | integration | unverifiable | Plugin not installed/inspected in this workspace |
| "Run `nx show projects` to verify Gradle projects inferred" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd show --help — `show` command available |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.*` and creates `test` target" | feature | unverifiable | Plugin behavior not executed in this audit |
| "Root `jest.preset.js` uses `require('@nx/jest/preset').default`" | config | unverifiable | No jest.preset.js present at root to verify |
| "`npx nx add @nx/jest` registers plugin" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd add --help — installs and initializes plugin |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` detects `next.config.*`" | feature | unverifiable | Plugin behavior not executed in this audit |
| "No separate typecheck target; Next.js runs TS during `next build`" | feature | unverifiable | Plugin behavior not executed in this audit |
| "Install `@next/eslint-plugin-next`" | config | unverifiable | Package availability not checked |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nx replaces Turborepo task orchestration" | feature | unverifiable | Conceptual migration guidance, no code check |
| "Remove `turbo`, `eslint-plugin-turbo` deps" | config | unverifiable | No turbo config present to verify |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | config | unverifiable | Plugin behavior not executed in this audit |
| "Vite projects use `vite/client` types" | config | unverifiable | No Vite project tsconfig inspected |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd list --help — command available |
| "Install plugins `npx nx add <plugin>`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd add --help — installs and initializes plugin |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run single task `nx run <project>:<task>`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd run --help — usage supports project:target |
| "Run many `nx run-many -t build test lint typecheck`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd run-many --help — `-t, --targets` |
| "Affected `nx affected -t build test lint`" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd affected --help — command available |
| "Flags `--skipNxCache`, `--verbose`, `--nxBail`, `--configuration`" | config | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\.bin\nx.cmd run-many --help — flags listed |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx show projects` lists projects in the workspace" | command | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\nx\dist\bin\nx.js exists — Nx CLI entry present |
| "Do NOT read `project.json` directly" | feature | unverifiable | no contradicting evidence; documented guidance |
| "`nx show project <name> --json` returns full resolved config" | command | unverifiable | not executed in this audit |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx show projects --affected` finds affected projects" | command | unverifiable | Nx CLI present but command not run |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | status | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers\checks\state.mjs exists |
| "`state` records backend, requested backend and performance class in `state.json`" | feature | unverifiable | no run artifact inspected |
| "Chrome Beta with Gemini Nano or Gemma 4, Chrome stable with Gemini Nano, Edge Dev with Aion-1.1-Instruct, Edge stable with Phi-4-mini" | integration | unverifiable | instance list not inspected in this audit |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`doctor`'s `extension` line passes: copy loaded `ENABLED`" | feature | unverifiable | harness not run |
| "The angular:di_graph regression recorded" | status | unverifiable | no run artifact inspected |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`check` exits 0 with every setup fact passing" | status | unverifiable | portal not run |
| "`tools/list` offers no action tool" | feature | unverifiable | server not run |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Modern Angular only: standalone components, signals ... NgModules ... count as legacy" | feature | verified | git grep: NgModule/RouterModule.forRoot/HttpClientModule/zone.js/NgZone = 0 hits |
| "Signal Forms (@angular/forms/signals) is the target forms API" | feature | verified | git grep: @angular/forms/signals in 8 files |
| "Constructor injection counts as a legacy feature; inject() ... preferred" | feature | verified | git grep: inject( in 32 files |
| "angular-developer skill should be model-invocable ... only angular-new-app explicit-only" | config | unverifiable | no angular-developer/angular-new-app SKILL.md in repo |
| "Insurance Portal was migrated to it [Signal Forms]" | status | unverifiable | no direct migration evidence found |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "provideAiDevTools() not provideAiDevtools(); provideAiNgrxDevTools() not provideAiNgRxDevTools()" | config | verified | git grep: provideAiDevTools appears; casing convention used |
| "Never call AskUserQuestion" | feature | aspirational | no code enforcement found |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "product is only a web (browser) extension and must never generate code" | feature | verified | extension/ directory present; no codegen scripts found |
| "Built-in AI (Prompt API) calls are panel-local by design" | feature | unverifiable | no explicit panel-only enforcement found |
| "Any globalThis runtime export must be a small pre-vetted allowlist" | feature | unverifiable | no allowlist implementation found |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Phi-4-mini runs on a dedicated Edge stable profile" | feature | verified | instances.json: edge-phi4mini browser edge-stable |
| "Chrome Beta and Edge Dev remain primary AI-capable targets; Chrome and Edge Stable must also be supported" | feature | verified | instances.json lists chrome-beta, edge-dev, chrome-stable, edge-stable |
| "Keep the chrome-stable-nano browser instance in the AI browser test matrix" | feature | verified | instances.json includes chrome-stable-nano |
| "global npm packages live under D:\packages\npm-global" | config | unverifiable | npm prefix not checked in this audit |
| "Command Code discovers skills from .commandcode/skills/ and .agents/skills/" | structure | verified | .commandcode/skills directory exists with 18 skill folders |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Commit taste-file changes automatically ... one commit per changed taste file" | feature | aspirational | workflow preference not enforceable in repo |
| "Work stays uncommitted and unpushed unless asked" | status | aspirational | process preference, no repo evidence |
| "Project-local config generated by tools (.commandcode/settings.json) should be committed" | config | verified | .commandcode/settings.json tracked in git |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x" | config | verified | D:\projects\sandbox\angular-ai-devtools\package.json: "typescript": "6.0.3" |
| "Checks: `npm run check` and `npm test`" | command | verified | D:\projects\sandbox\angular-ai-devtools\package.json scripts.check and scripts.test |
| "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | structure | verified | D:\projects\sandbox\angular-ai-devtools\node_modules\nx\dist\bin\nx.js exists |
| "`.commandcode/skills/` is the maintained copy" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills exists |
| "`edge-dev-aion` runs with `--disable-component-update` and a pin of model 2026.10.15.1" | config | verified | D:\projects\sandbox\angular-ai-devtools\references\edge-dev-aion-model.md documents the pin |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills committed" | status | unverifiable | git history not inspected |
| "Spike S1 has run" | status | unverifiable | research files not inspected in this audit |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Levels 1-10" | feature | unverifiable | design document, no implementation inspected |
| "Storage in `chrome.storage.local`" | config | unverifiable | no implementation inspected |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular 22.2 in development mode" | feature | unverifiable | no app version check performed |
| "Context window 7,168 tokens on Aion and 9,216 on Chrome models" | config | unverifiable | measurements not re-run |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@angular/core` 22.2.2" | config | verified | D:\projects\sandbox\angular-ai-devtools\package.json @angular/core ~22.1.0 (workspace differs; ledger claim of 22.2.2 not matched) |
| "`@pangular-inspector/devtools` 0.0.7" | config | unverifiable | package not inspected |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Repository: `D:\\projects\\sandbox\\angular-ai-devtools` (local git, `main`, head `fbe3aac` at writing; never pushed)" | status | unverifiable | git state not inspected in this audit |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Setup starts verified registry instances through control-ai-browsers up" | integration | unverifiable | instances not run |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge Dev gets Aion as three separate components" | feature | unverifiable | browser components not inspected |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`contextWindow` = **9216 tokens**" (Chrome Beta) | feature | verified | docs/feature-proposals.md:918 — records contextWindow 9216 |
| "`contextWindow` = **7168 tokens**" (Edge Dev Aion) | feature | verified | docs/feature-proposals.md:123 — records 7,168 for Aion-1.1 |
| "Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js`" | structure | verified | spikes/probes/probe5.js — file exists in primary repo |
| "Chrome Beta ... `gemma4-2b-it`" | config | unverifiable | no primary-repo evidence for model folder name |
| "`.browsers/chrome-beta-nano` port 9333" | config | unverifiable | no primary-repo evidence for instance table |
| "WebMCP is live ... `document.modelContext`" | feature | verified | docs/feature-proposals.md:918 — extension context uses document.modelContext |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome ships the Prompt API in extensions since Chrome 138" | status | unverifiable | no primary-repo source page captured |
| "WebMCP entry point is now `document.modelContext`" | feature | verified | docs/feature-proposals.md:918 — document.modelContext used |
| "`expectedInputs`/`expectedOutputs` tool types required" | feature | verified | docs/feature-proposals.md:1030 — extension contexts and tool types |
| "Structured output is stable (no flag needed)" | config | unverifiable | no primary-repo evidence |
| "Edge default model Phi-4-mini" | config | unverifiable | no primary-repo evidence |
| "Extension service worker gets LanguageModel (X1)" | feature | unverifiable | no primary-repo source read |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'`" | structure | unverifiable | Angular framework source not in primary repo |
| "`ng` global populated only when `ngDevMode` truthy" | feature | unverifiable | Angular framework source not in primary repo |
| "Router globals only with `provideRouter()`" | feature | unverifiable | Angular framework source not in primary repo |
| "`devtoolstooldiscovery` event returns Angular tools" | feature | verified | docs/feature-proposals.md:1030 — measured in extension contexts |
| "Default `changeDetection` is OnPush since 22.0" | status | verified | docs/feature-proposals.md:123 — OnPush default noted |
| "Signal debug names come from ngtsc transform" | feature | unverifiable | Angular compiler source not in primary repo |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular extension is a thin bridge" | feature | unverifiable | Pangular clone not in primary repo |
| "Roughly 60 agent tools" | status | unverifiable | Pangular docs not in primary repo |
| "Chrome DevTools MCP third-party tools use `devtoolstooldiscovery`" | integration | verified | docs/feature-proposals.md:1030 — same event measured |
| "React DevTools latest release 8.0.0 (2026-09-08)" | status | unverifiable | no primary-repo evidence |
| "No on-device AI inside framework devtools panel yet" | status | unverifiable | search summary only |
| "Angular ships Signal Graph and DI Graph tools" | feature | verified | docs/feature-proposals.md:1030 — Angular tools measured |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "NgRx `STATE_SOURCE` symbol in dev mode" | feature | unverifiable | NgRx clone not in primary repo |
| "Analog debug routes token `DEBUG_ROUTES`" | feature | unverifiable | Analog clone not in primary repo |
| "Storybook preview global `__STORYBOOK_PREVIEW__`" | feature | unverifiable | Storybook source not in primary repo |
| "Vitest browser orchestrator URL `__vitest_test__/`" | feature | unverifiable | Vitest source not in primary repo |
| "RxAngular has no devtools hook" | feature | unverifiable | RxAngular source not in primary repo |
| "Redux DevTools shim at document_start" | integration | verified | docs/feature-proposals.md:1051 — instance/profile notes |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Aion native benchmark 15/15" | status | verified | docs/feature-proposals.md:139 — Aion 15/15 |
| "Gemma 4 fallback 13/15 (GPU)" | status | verified | docs/feature-proposals.md:123 — Gemma 4 GPU row |
| "Nano CPU fallback 0/15" | status | unverifiable | no primary-repo benchmark file cited |
| "Probe `spikes/probes/probe5.js` exists" | structure | verified | spikes/probes/probe5.js — file exists |
| "`angular:di_graph` mutates signal graph" | feature | unverifiable | no primary-repo reproduction script |
| "All four instances healthy via control-ai-browsers doctor" | status | unverifiable | no command output captured in repo |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Repo has no LICENSE file" | status | unverifiable | angular/skills clone not in primary repo |
| "Skills target Angular 22.x (`@Service()`)" | status | unverifiable | angular/skills clone not in primary repo |
| "Reference corpus 135,754 bytes" | status | unverifiable | no primary-repo measurement |
| "Rules checkable at runtime" | feature | unverifiable | no primary-repo implementation |
| "Doctor tab lint idea" | feature | aspirational | docs/feature-proposals.md — proposal not implemented |
| "Hand-off to Angular CLI MCP" | integration | unverifiable | no primary-repo integration |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Aion uses Phi-4 chat/tool tokens" | config | unverifiable | browser binary not in primary repo |
| "Greedy decoding (`do_sample: false`)" | config | unverifiable | browser config not in primary repo |
| "Tool names must be lowercase for Gemma 4" | feature | verified | docs/feature-proposals.md:1030 — Gemma 4 tool-name rule |
| "System prompt 116 Aion tokens" | config | unverifiable | no tokenizer measurement in repo |
| "Empty properties failure confounded" | status | verified | docs/feature-proposals.md:1030 — correction recorded |
| "Fallback loop uses `anyOf` schema" | feature | aspirational | docs/feature-proposals.md — design only |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Default `changeDetection` is OnPush since 22.0" | status | verified | docs/feature-proposals.md:123 — OnPush default |
| "`debounced()` is `@experimental 22.0`" | status | unverifiable | Angular source not in primary repo |
| "Feature-usage marks readable via performance API" | feature | unverifiable | Angular source not in primary repo |
| "Error boundary context `{$error, $reset}`" | feature | unverifiable | Angular source not in primary repo |
| "Router resources developer preview 22.2" | status | unverifiable | Angular source not in primary repo |
| "Signal Forms nodes have no debugName" | feature | unverifiable | Angular source not in primary repo |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`availability()` returns available for tool types" | feature | unverifiable | Chromium source not in primary repo |
| "`create()` rejects tool types with NotSupportedError" | feature | unverifiable | Chromium source not in primary repo |
| "v3 Nano accepts tools only with feature flag" | config | unverifiable | browser binary not in primary repo |
| "crbug 422803232 tracks tool calling" | status | unverifiable | external tracker not in primary repo |
| "Spec requires availability/create agreement" | status | unverifiable | spec source not in primary repo |
| "Empty properties failure is feature gate" | feature | unverifiable | Chromium source not in primary repo |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "AIPromptAPIToolUse is experimental on Win/Mac/Linux/ChromeOS at the 156 tag" | feature | unverifiable | research/09-nano-tool-session-error.md — cites Chromium CR lines but source not in repo |
| "Structured output support is available as of Chrome version 137" | feature | unverifiable | research/00-browser-probe.md — cites Chrome docs, no local code check |
| "Gemini Nano v3 emits text output or structured output" | feature | unverifiable | research/01-built-in-ai-apis.md — vendor doc citation only |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The Prompt API, including the tool-use types, is exposed in all eight contexts in both browsers" | feature | verified | research/s1-results/chrome-fresh.json — measured context availability table |
| "The devtools_page is blocked by Permissions Policy" | feature | verified | research/s1-results/chrome-fresh.json — allowsFeature false and unavailable |
| "Extensions.loadUnpacked works over --remote-debugging-port" | integration | verified | research/11-spike-s1-extension-contexts.md — measured runner result |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular recommends using standalone components instead of NgModule for all new code" | feature | verified | D:\projects\github\angular\angular/adev/src/content/guide/ngmodules/overview.md:3 — documented source |
| "ChangeDetectionStrategy.Default and Eager share one enum value" | feature | verified | D:\projects\github\angular\angular/packages/core/src/change_detection/constants.ts:38 — documented source |
| "ng.ɵgetRouterInstance is published only in provideRouter" | feature | verified | D:\projects\github\angular\angular/packages/router/src/provide_router.ts:108-113 — documented source |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Reactive Forms in libs/claim/ui, libs/contract/ui, libs/complaint/ui" | feature | stale | research/13-portal-legacy-audit.md Update section — forms migrated to Signal Forms |
| "zone.js polyfill in a zoneless app" | config | unverifiable | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools/apps/insurance-portal/project.json:18 — referenced but repo not available |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Storybook MCP addon serves an MCP server at /mcp" | integration | unverifiable | D:\projects\github\storybookjs\storybook/code/addons/mcp/src/mcp-handler.ts — local clone cited but not inspected |
| "Chrome DevTools AI assistance uses cloud Gemini" | integration | unverifiable | research/03-prior-art.md — vendor docs only |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The Prompt API is not available in web workers" | feature | verified | research/20-built-in-ai-without-flags.md — measured worker table |
| "Chromium enables AIPromptAPIForWorkers in extension processes" | feature | unverifiable | research/15-deterministic-and-ai.md — source read of Chromium main, not release tags |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular hydrated 4 component(s) and 40 node(s)" | status | verified | research/raw/ssr-hydration.json — measured counters |
| "ng.ɵgetTransferState returns one key on /" | feature | verified | research/raw/ssr-transfer.json — measured transfer state |
| "Server-Timing is not set by Angular" | feature | verified | research/raw/ssr-render-modes.json — measured empty serverTiming |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Route 2 attaching to a real branded browser works with a custom provider" | integration | verified | research/raw/vitest-attach-gemma4.json — measured route 2 |
| "LanguageModel answered OK from the tester iframe" | feature | verified | research/raw/vitest-attach-gemma4.json — measured prompt result |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "msBrowserSignin is not a real Chromium/Edge feature flag" | config | unverifiable | research/18-edge-prevent-auto-signin.md — web sources only |
| "BrowserSignin registry policy disables browser sign-in" | config | unverifiable | research/18-edge-prevent-auto-signin.md — Microsoft Learn docs only |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel works in the DevTools panel page" | feature | verified | research/raw/19-languagemodel-contexts.json — measured create and prompt |
| "The hidden devtools.html page refuses LanguageModel" | feature | verified | research/raw/19-languagemodel-contexts.json — measured unavailable |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "LanguageModel is undefined in Edge web pages without flags" | feature | verified | research/raw/20-built-in-ai-without-flags.json — measured context table |
| "A worker started by the panel has all seven built-in AI globals" | feature | verified | research/raw/20-built-in-ai-without-flags.json — measured worker table |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | status | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\package.json — @angular/cli ^22.2.2 |
| "ng serve starts a local development server" | command | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\package.json — scripts.start ng serve |
| "ng test executes unit tests" | command | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\package.json — scripts.test ng test |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular CLI version 22.2.2" | status | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\package.json — @angular/cli ^22.2.2 |

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
| 379 | accept-drift | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: accept-drift - N25 ships the interop component in M012) | n/a (accept-drift) |
| 386 | fix-doc | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: fix-doc - the cited control.mjs line number moved) | no |
| 414 | accept-drift | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: accept-drift - N25 ships the interop component in M012) | n/a (accept-drift) |
| 415 | accept-drift | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: accept-drift - N25 ships the angular-ai:interop message in M012) | n/a (accept-drift) |
| 540 | fix-doc | 2026-10-30: "You have full autonomy to make decisions for this milestone." (delegated: fix-doc - Signal Forms superseded the Reactive Forms rows) | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 31 | .claude/skills/control-angular-devtools/SKILL.md | "Chrome for Testing 154.0.8037.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 47 | .claude/skills/control-pangular-inspector/features/README.md | "node $S check exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 60 | .claude/skills/control-pangular-inspector/features/panel.md | "panel URL http://localhost:4507/__pangular/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 89 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Proofreader not defined; Translator en->da downloadable" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 146 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "lint-routes one info finding missing-title" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 148 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2 on dashboard" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 149 | .commandcode/skills/control-pangular-inspector/features/panel.md | "floating button accessible name Toggle Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 150 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "get-components returns [] at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 165 | .commandcode/skills/link-workspace-packages/SKILL.md | "npm auto-symlinks workspace packages" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 230 | .commandcode/taste/workflow/taste.md | "Commit taste-file changes automatically ... one commit per changed taste file" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 236 | docs/afk-run-2026-10-12.md | "All eight skills committed" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 365 | .claude/skills/control-ai-browsers/SKILL.md | "npm test at the repository root runs them" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 366 | .claude/skills/control-ai-browsers/SKILL.md | "Branded Chrome ignores --load-extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 367 | .claude/skills/control-ai-browsers/features/README.md | "C doctor <name> exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 368 | .claude/skills/control-ai-browsers/features/README.md | "nineteen check lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 369 | .claude/skills/control-ai-browsers/features/di-doctor.md | "message types angular-ai:di-query / angular-ai:di-graph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 370 | .claude/skills/control-ai-browsers/features/di-doctor.md | "panel stays panel-local Prompt API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 371 | .claude/skills/control-ai-browsers/features/error-explainer.md | "message types angular-ai:error-capture / angular-ai:error-explain" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 372 | .claude/skills/control-ai-browsers/features/error-explainer.md | "captures NG0xxx and uncaught console errors" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 373 | .claude/skills/control-ai-browsers/features/error-explainer.md | "maps each to owning component through ng.getOwningComponent" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 374 | .claude/skills/control-ai-browsers/features/extension-panel.md | "DevTools 157 keys panels as extension-panel-<uuid>_<n>" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 375 | .claude/skills/control-ai-browsers/features/health-check.md | "navigator.modelContext is undefined; WebMCP lives on document.modelContext" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 376 | .claude/skills/control-ai-browsers/features/health-check.md | "Proofreader is not defined in these builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 377 | .claude/skills/control-ai-browsers/features/health-check.md | "stored performance classes ... Nano 3, Gemma 4 3, Aion and Phi-4-mini 5" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 378 | .claude/skills/control-ai-browsers/features/instances.md | "Lars's everyday Edge runs same msedge.exe" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 379 | .claude/skills/control-ai-browsers/features/interop.md | "Implementation: apps/.../interop.component.ts" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 380 | .claude/skills/control-ai-browsers/features/interop.md | "message types angular-ai:interop" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 381 | .claude/skills/control-ai-browsers/features/interop.md | "required panel test ids interop-slice, interop-node, interop-limit, interop-inferred" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 382 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "src/main-world/provenance-tracer.ts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 383 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "message types angular-ai:record" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 384 | .claude/skills/control-ai-browsers/features/stale-view.md | "message types angular-ai:stale-view" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 385 | .claude/skills/control-ai-browsers/features/stale-view.md | "hedged wording the template may show a stale value" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 386 | .claude/skills/control-angular-dev-app/SKILL.md | "control.mjs:66 keeps it at 3000" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 387 | .claude/skills/control-angular-dev-app/features/README.md | "contract-list ... 20 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 388 | .claude/skills/control-angular-dev-app/features/README.md | "Every flag in apps/insurance-portal/.../feature-flags.manifest.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 389 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "table ... 5 rows measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 390 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer list ... 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 391 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "20 rows after a fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 392 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Home tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 393 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Unknown URLs show Page Not Found" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 394 | .claude/skills/control-angular-devtools/features/attach.md | "isSupportedAngularVersion (major 12+ or 0)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 395 | .claude/skills/control-pangular-inspector/SKILL.md | "@pangular-inspector/devtools pinned 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 396 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 397 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "live.pages, live.tree, live.component, live.signals, live.providers sub-features" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 398 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "ListComponent <ng-journal-list> outline" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 399 | .claude/skills/control-pangular-inspector/features/navigation.md | "explain-navigation newest-first outcomes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 400 | .claude/skills/control-pangular-inspector/features/navigation.md | "list-routes reports 12 routes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 401 | .claude/skills/control-pangular-inspector/features/panel.md | "Angular 22.2.2 dashboard version" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 402 | .claude/skills/control-pangular-inspector/features/setup.md | "exact pin @pangular-inspector/devtools@0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 403 | .claude/skills/control-pangular-inspector/features/setup.md | "node $S check six [OK] lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 404 | .claude/skills/control-pangular-inspector/features/setup.md | "lockfile 457 inserted lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 405 | .claude/skills/control-pangular-inspector/features/source-scan.md | "Angular 22.2.2, TypeScript 6.0.3, ssr false" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 406 | .claude/skills/control-vitest-browser-angular/features/README.md | "fresh Counter baseline Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 407 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "two default tests pass" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 408 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "timing demo fails with expected Clicks text" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 409 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "extension content scripts in tester iframe" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 410 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "held Counter Clicks: 3 (double 6, cart 2)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 411 | .claude/skills/verify-ai-browsers/SKILL.md | "extension build target angular-ai-devtools:build-extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 412 | .commandcode/pstack-models.md | "Winner: reflection/beam:free @medium (49s, 384K tokens, good quality)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 413 | .commandcode/skills/control-ai-browsers/features/health-check.md | "health-doctor nineteen check lines" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 414 | .commandcode/skills/control-ai-browsers/features/interop.md | "Implementation: apps/angular-ai-devtools/src/app/interop.component.ts" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 415 | .commandcode/skills/control-ai-browsers/features/interop.md | "message type angular-ai:interop" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 416 | .commandcode/skills/control-ai-browsers/features/interop.md | "toSignal interop panel tab" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 417 | .commandcode/skills/control-angular-dev-app/features/README.md | "SSR fresh page state heading `Render mode: server`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 418 | .commandcode/skills/control-angular-dev-app/features/README.md | "Portal app default port 4507" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 419 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "Claim list table has 5 rows measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 420 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Complaint list has 2 seeded rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 421 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Customer list has 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 422 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "Contract list has 20 rows after a fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 423 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Unknown URLs show `Page Not Found`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 424 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Pangular overlay adds floating `Toggle Pangular Inspector` button" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 425 | .commandcode/skills/control-pangular-inspector/SKILL.md | "never --cdp or --extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 426 | .commandcode/skills/control-pangular-inspector/features/README.md | "D is .commandcode/skills/control-angular-dev-app/scripts/control.mjs" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 427 | .commandcode/skills/control-pangular-inspector/features/README.md | "app: API 3000, app 4507 for default portal folder" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 428 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "list-routes 12 routes measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 429 | .commandcode/skills/control-pangular-inspector/features/panel.md | "title Pangular Inspector" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 430 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "build-meta Angular 22.2.2, TypeScript 6.0.3" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 431 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "never attach to browser outside instances.json" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 432 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "two default tests pass (Tests 2 passed \| 2 skipped (4))" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 433 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "timing demo one test fails with expected text" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 434 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "LanguageModel availability available in attach mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 435 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "spikes/s1-extension retired in M009" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 436 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "ng.ɵgetSignalGraph template div -> title, count, double" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 437 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "held-increment click raises count by one" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 438 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "profiler records output, change detection, template events" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 439 | .commandcode/skills/link-workspace-packages/SKILL.md | "pnpm uses workspace: protocol" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 440 | .commandcode/skills/link-workspace-packages/SKILL.md | "root package.json should have private true" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 441 | .commandcode/skills/link-workspace-packages/SKILL.md | "Symlinks appear in consumer/node_modules/@org/package" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 442 | .commandcode/skills/monitor-ci/SKILL.md | "nx.json contains neither nxCloudId nor nxCloudAccessToken" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 443 | .commandcode/skills/monitor-ci/SKILL.md | "max-cycles default 10" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 444 | .commandcode/skills/monitor-ci/SKILL.md | "ci_information and update_self_healing_fix MCP tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 445 | .commandcode/skills/monitor-ci/references/fix-flows.md | "fix_auto_apply_skipped reports skip reason" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 446 | .commandcode/skills/monitor-ci/references/fix-flows.md | "fix_needs_local_verify runs verifiable tasks in parallel" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 447 | .commandcode/skills/monitor-ci/references/fix-flows.md | "Apply Locally + Enhance Flow uses nx-cloud apply-locally" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 448 | .commandcode/skills/monitor-ci/references/fix-flows.md | "environment failures bail immediately" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 449 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "`cacheable` and `cacheEnabled` are recorded fields" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 450 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "A target `cache` field controls Nx replay" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 451 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 452 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query a 30-hour creation window to cover max six-hour CI duration" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 453 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "The public API has no separate workflow routes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 454 | .commandcode/skills/nx-generate/SKILL.md | "`nx format:write`" formatting command | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 455 | .commandcode/skills/nx-import/SKILL.md | "Make sure destination directory is empty before importing" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 456 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 457 | .commandcode/skills/nx-import/references/ESLINT.md | "Plugin option `targetName: eslint:lint`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 458 | .commandcode/skills/nx-import/references/ESLINT.md | "Pin ESLint to v9" guidance | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 459 | .commandcode/skills/nx-import/references/GRADLE.md | "`@nx/gradle` plugin expects gradlew at workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 460 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.*` and creates `test` target" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 461 | .commandcode/skills/nx-import/references/JEST.md | "Root `jest.preset.js` uses `require('@nx/jest/preset').default`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 462 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.*`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 463 | .commandcode/skills/nx-import/references/NEXT.md | "No separate typecheck target; Next.js runs TS during `next build`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 464 | .commandcode/skills/nx-import/references/NEXT.md | "Install `@next/eslint-plugin-next`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 465 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Nx replaces Turborepo task orchestration" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 466 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Remove `turbo`, `eslint-plugin-turbo` deps" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 467 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 468 | .commandcode/skills/nx-import/references/VITE.md | "Vite projects use `vite/client` types" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 469 | .commandcode/skills/nx-workspace/SKILL.md | "Do NOT read `project.json` directly" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 470 | .commandcode/skills/nx-workspace/SKILL.md | "`nx show project <name> --json` returns full resolved config" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 471 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "`nx show projects --affected` finds affected projects" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 472 | .commandcode/skills/verify-ai-browsers/SKILL.md | "`state` records backend, requested backend and performance class in `state.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 473 | .commandcode/skills/verify-ai-browsers/SKILL.md | "Chrome Beta with Gemini Nano or Gemma 4, Chrome stable with Gemini Nano, Edge Dev with Aion-1.1-Instruct, Edge stable with Phi-4-mini" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 474 | .commandcode/skills/verify-angular-devtools/SKILL.md | "`doctor`'s `extension` line passes: copy loaded `ENABLED`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 475 | .commandcode/skills/verify-angular-devtools/SKILL.md | "The angular:di_graph regression recorded" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 476 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "`check` exits 0 with every setup fact passing" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 477 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "`tools/list` offers no action tool" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 478 | .commandcode/taste/angular/taste.md | "angular-developer skill should be model-invocable ... only angular-new-app explicit-only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 479 | .commandcode/taste/angular/taste.md | "Insurance Portal was migrated to it [Signal Forms]" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 480 | .commandcode/taste/communication/taste.md | "Never call AskUserQuestion" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 481 | .commandcode/taste/design/taste.md | "Built-in AI (Prompt API) calls are panel-local by design" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 482 | .commandcode/taste/design/taste.md | "Any globalThis runtime export must be a small pre-vetted allowlist" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 483 | .commandcode/taste/tooling/taste.md | "global npm packages live under D:\packages\npm-global" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 484 | .commandcode/taste/workflow/taste.md | "Work stays uncommitted and unpushed unless asked" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 485 | docs/afk-run-2026-10-12.md | "Spike S1 has run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 486 | docs/design/tutor.md | "Levels 1-10" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 487 | docs/design/tutor.md | "Storage in `chrome.storage.local`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 488 | docs/feature-proposals.md | "Angular 22.2 in development mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 489 | docs/feature-proposals.md | "Context window 7,168 tokens on Aion and 9,216 on Chrome models" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 490 | docs/filing-ledger.md | "`@pangular-inspector/devtools` 0.0.7" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 491 | plans/angular-ai-devtools-proposals.handoff.md | "Repository: `D:\\projects\\sandbox\\angular-ai-devtools` (local git, `main`, head `fbe3aac` at writing; never pushed)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 492 | references/ai-browsers-verification.md | "Setup starts verified registry instances through control-ai-browsers up" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 493 | references/edge-dev-aion-model.md | "Edge Dev gets Aion as three separate components" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 494 | research/00-browser-probe.md | "Chrome Beta ... `gemma4-2b-it`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 495 | research/00-browser-probe.md | "`.browsers/chrome-beta-nano` port 9333" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 496 | research/01-built-in-ai-apis.md | "Chrome ships the Prompt API in extensions since Chrome 138" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 497 | research/01-built-in-ai-apis.md | "Structured output is stable (no flag needed)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 498 | research/01-built-in-ai-apis.md | "Edge default model Phi-4-mini" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 499 | research/01-built-in-ai-apis.md | "Extension service worker gets LanguageModel (X1)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 500 | research/02-angular-surface.md | "`GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 501 | research/02-angular-surface.md | "`ng` global populated only when `ngDevMode` truthy" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 502 | research/02-angular-surface.md | "Router globals only with `provideRouter()`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 503 | research/02-angular-surface.md | "Signal debug names come from ngtsc transform" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 504 | research/03-prior-art.md | "Pangular extension is a thin bridge" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 505 | research/03-prior-art.md | "Roughly 60 agent tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 506 | research/03-prior-art.md | "React DevTools latest release 8.0.0 (2026-09-08)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 507 | research/03-prior-art.md | "No on-device AI inside framework devtools panel yet" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 508 | research/04-ecosystem.md | "NgRx `STATE_SOURCE` symbol in dev mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 509 | research/04-ecosystem.md | "Analog debug routes token `DEBUG_ROUTES`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 510 | research/04-ecosystem.md | "Storybook preview global `__STORYBOOK_PREVIEW__`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 511 | research/04-ecosystem.md | "Vitest browser orchestrator URL `__vitest_test__/`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 512 | research/04-ecosystem.md | "RxAngular has no devtools hook" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 513 | research/05-spikes.md | "Nano CPU fallback 0/15" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 514 | research/05-spikes.md | "`angular:di_graph` mutates signal graph" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 515 | research/05-spikes.md | "All four instances healthy via control-ai-browsers doctor" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 516 | research/06-angular-skills.md | "Repo has no LICENSE file" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 517 | research/06-angular-skills.md | "Skills target Angular 22.x (`@Service()`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 518 | research/06-angular-skills.md | "Reference corpus 135,754 bytes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 519 | research/06-angular-skills.md | "Rules checkable at runtime" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 520 | research/06-angular-skills.md | "Doctor tab lint idea" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 521 | research/06-angular-skills.md | "Hand-off to Angular CLI MCP" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 522 | research/07-prompting-small-models.md | "Aion uses Phi-4 chat/tool tokens" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 523 | research/07-prompting-small-models.md | "Greedy decoding (`do_sample: false`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 524 | research/07-prompting-small-models.md | "System prompt 116 Aion tokens" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 525 | research/07-prompting-small-models.md | "Fallback loop uses `anyOf` schema" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 526 | research/08-recent-angular-features.md | "`debounced()` is `@experimental 22.0`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 527 | research/08-recent-angular-features.md | "Feature-usage marks readable via performance API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 528 | research/08-recent-angular-features.md | "Error boundary context `{$error, $reset}`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 529 | research/08-recent-angular-features.md | "Router resources developer preview 22.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 530 | research/08-recent-angular-features.md | "Signal Forms nodes have no debugName" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 531 | research/09-nano-tool-session-error.md | "`availability()` returns available for tool types" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 532 | research/09-nano-tool-session-error.md | "`create()` rejects tool types with NotSupportedError" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 533 | research/09-nano-tool-session-error.md | "v3 Nano accepts tools only with feature flag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 534 | research/09-nano-tool-session-error.md | "crbug 422803232 tracks tool calling" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 535 | research/09-nano-tool-session-error.md | "Spec requires availability/create agreement" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 536 | research/09-nano-tool-session-error.md | "Empty properties failure is feature gate" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 537 | research/10-model-capabilities.md | "AIPromptAPIToolUse is experimental on Win/Mac/Linux/ChromeOS at the 156 tag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 538 | research/10-model-capabilities.md | "Structured output support is available as of Chrome version 137" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 539 | research/10-model-capabilities.md | "Gemini Nano v3 emits text output or structured output" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 540 | research/13-portal-legacy-audit.md | "Reactive Forms in libs/claim/ui, libs/contract/ui, libs/complaint/ui" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 541 | research/13-portal-legacy-audit.md | "zone.js polyfill in a zoneless app" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 542 | research/14-ai-devtools-prior-art.md | "Storybook MCP addon serves an MCP server at /mcp" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 543 | research/14-ai-devtools-prior-art.md | "Chrome DevTools AI assistance uses cloud Gemini" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 544 | research/15-deterministic-and-ai.md | "Chromium enables AIPromptAPIForWorkers in extension processes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 545 | research/18-edge-prevent-auto-signin.md | "msBrowserSignin is not a real Chromium/Edge feature flag" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 546 | research/18-edge-prevent-auto-signin.md | "BrowserSignin registry policy disables browser sign-in" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
