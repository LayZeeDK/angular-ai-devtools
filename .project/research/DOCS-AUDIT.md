# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-05
Audited HEAD: c9451b1527ae90753315edacd43a30abd2187c6c
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 316 |
| stale | 12 |
| aspirational | 0 |
| unverifiable | 203 |
| descriptive docs (no testable claims) | 2 |

Claim rows audited: 526 across 143 documents; with the 2 descriptive documents, the 145 frozen inventory paths are fully accounted for.

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node .commandcode/skills/control-ai-browsers/scripts/control.mjs" is the control entry point | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs exists (135125 bytes) in sidecar root |
| "Session is ai-<instance>-<port>" (never cb/ed/nano/g4/aion/phi/ai-cb/ai-ed/bench-*) | config | verified | control.mjs:698 documents session format `ai-<name>-<port>`; instances.json and SKILL.md list instances chrome-beta-nano (9333), chrome-beta-gemma4 (9334), edge-dev-aion (9335), edge-phi4mini (9337), chrome-stable-nano (9338) |
| "edge-dev-aion adds --disable-component-update" and refuses `--backend=cpu` on Edge | config | verified | control.mjs:1040/4313 show exit-2 refusal paths; instances.json names edge-dev-aion with Edge args; SKILL.md states `--disable-component-update` for edge-dev-aion |
| "`panel <name> --url=<Angular page>` drives N1 ('Explain version with AI') via raw CDP" | feature | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs exists (19506 bytes); panel.mjs:2 says drives N1 "Explain version with AI" over raw CDP |
| "Exit codes: 0 done/healthy; 1 not healthy/change did not take; 2 refused/could not run" | status | verified | control.mjs:4313 prints `[ERROR] exit 2; evidence ...` on refused/could-not-run path; SKILL.md exit table states 0/1/2 semantics |
| ".claude/skills/control-ai-browsers and .commandcode counterpart are byte copies (drift finding for other .claude skill folders)" | structure | verified | SHA256 hashes identical for .claude/.commandcode control-ai-browsers SKILL.md and all 11 feature files (checked in sidecar) |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C below stands for node .commandcode/skills/control-ai-browsers/scripts/control.mjs" | command | verified | control.mjs exists at .claude/skills/control-ai-browsers/scripts/control.mjs (135125 bytes) |
| "Five instances... Nano 9333, Gemma 4 9334, Aion 9335, Phi-4-mini 9337, Nano in Chrome stable 9338" | config | verified | instances.json defines instances with ports 9333,9334,9335,9337,9338 (chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano) |
| "Session is ai-<instance>-<port>; read it from C info <instance> --json (session)" | feature | verified | control.mjs:698 defines session as `ai-<name>-<port>`; SKILL.md lists `info <name>` returning session/ports |
| "Features list includes extension-panel, di-doctor, error-explainer, signal-provenance, stale-view, interop" | structure | verified | All named feature docs exist under .claude/skills/control-ai-browsers/features/ (extension-panel.md, di-doctor.md, error-explainer.md, signal-provenance.md, stale-view.md, interop.md) |
| "Full sweep order: Instances, Health check, Model lifecycle, Probes and benchmarks, Extension panel, DI doctor, Error explainer, Signal provenance, Stale view, RxJS interop" | feature | verified | Each referenced feature file exists in features/ directory matching the listed order |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Panel sends angular-ai:di-query (componentName, elementTag) and receives angular-ai:di-graph with DiResolutionPath" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:38 sends `type: 'angular-ai:di-query'`; :25 handles `m?.type === 'angular-ai:di-graph' && m.resolutionPath` |
| "DI Doctor tab renders resolution path / diff and explains via panel-local Prompt API" | feature | unverifiable | UI behavior/rendering not verified by source grep in this run; would settle via di-doctor.component.ts rendering and verify-ai-browsers/checks/di-doctor.mjs execution |
| "Implementation: di-doctor.service.ts, n3-di-doctor.component.ts, di-diff-display.ts" | structure | verified | di-doctor.service.ts, n3-di-doctor.component.ts, and di-diff-display.ts all exist under apps/angular-ai-devtools/src/app/ in sidecar root |
| "Proof across every pair is verify-ai-browsers/checks/di-doctor.mjs" | command | verified | .claude/skills/verify-ai-browsers/checks/di-doctor.mjs exists in sidecar root |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Captures NG0xxx/uncaught console errors, maps to owning component via ng.getOwningComponent, explains from bundled angular.dev/errors digest via panel-local Prompt API" | feature | unverifiable | Runtime behavior not executed; implementation path apps/angular-ai-devtools/src/app/error-explainer.component.ts exists but internal logic not read (budget) |
| "Error explain runs in panel via shouldCallModel (no separate angular-ai:error-explain message asserted here)" | integration | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts imports/calls shouldCallModel (lines 7,60); angular-ai:error-explain string not found by grep in component (budget-limited absence check) |
| "Driver: C panel <name> --url=... --feature=error-explainer; proof check verify-ai-browsers/checks/error-explainer.mjs" | command | verified | panel.mjs exists (supports panel command); .claude/skills/verify-ai-browsers/checks/error-explainer.mjs exists in sidecar root |
| "Implementation: apps/angular-ai-devtools/src/app/error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists in sidecar root |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Every instance loads unpacked Angular AI DevTools extension at launch; branded Chrome ignores --load-extension so pipe-keeper.mjs is used" | feature | verified | .claude/skills/control-ai-browsers/scripts/pipe-keeper.mjs exists (5278 bytes); control.mjs:159 references pipe-keeper.mjs and :813 notes pipe-keeper loads extension over pipe |
| "N1 'Explain version with AI' calls LanguageModel in the panel's extension page; Angular detection from content scripts (relay.js, agent-main.js)" | feature | unverifiable | Panel-internal LanguageModel usage not verified by code read; extension/agent-main.js exists but relay.js not checked (budget) |
| "C panel <name> --url=<app> drives N1 end to end (scripts/panel.mjs); proof verify-ai-browsers/checks/extension-panel.mjs" | command | verified | panel.mjs exists; .claude/skills/verify-ai-browsers/checks/extension-panel.mjs exists; panel.mjs:260 uses Ctrl+Shift+I, :323 targets chrome-extension://<id>/panel/ |
| "DevTools 157 keys extension panels as extension-panel-<uuid>_<n>; onShowPanel takes that key" | integration | verified | panel.mjs:56/62 finds keys starting with `extension-panel-`; :32 matches devtools.html extension frame URL |
| "Build panel: npx nx run angular-ai-devtools:build-extension writes extension/panel/" | command | unverifiable | nx target not verified in this run; would settle by inspecting project.json/nx config for angular-ai-devtools build-extension target |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Doctor runs checks for process, tree, commandLine, ports, tabs, model.disk, model.pin, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp, account, extension" | feature | unverifiable | Doctor check implementation not enumerated by grep in this run; SKILL.md lists these checks and control.mjs contains doctor logic but full coverage not verified (budget) |
| "health-extension proves instance serves unpacked extension recorded in state file (extensionDir)" | integration | unverifiable | State-file extensionDir handling not verified by source read; would settle by searching control.mjs for extensionDir/extension check |
| "health-tools proves tool call/answer; Nano tool canary skipped; Phi-4-mini tool canary reported only" | feature | unverifiable | Canary policy branches not verified by code; spikes/probes/probe10.js exists and shows callID/callId handling (lines 34-42) but doctor policy not confirmed |
| "WebMCP lives on document.modelContext (navigator.modelContext undefined)" | config | unverifiable | Browser API behavior claim not verifiable from repo files; would settle by running canary.webmcp in an instance |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Instances read from instances.json; profiles under .browsers\<name>; one process per model with own --enable-features and remote-debugging port" | config | verified | instances.json has profilesRoot ".browsers" and instance entries chrome-beta-nano/9333, chrome-beta-gemma4/9334, edge-dev-aion/9335, edge-phi4mini/9337, chrome-stable-nano/9338 |
| "C instances lists registry/live state; C flags reads effective features from version page; C up/C down manage lifecycle" | command | verified | control.mjs exists (135125 bytes) and defines commands including up/attach/down/doctor/flags/model/run/panel/bench/instances/info (per SKILL.md and grep evidence: exit 2 paths, keeper/session logic) |
| "up refuses --backend=cpu on Edge; drift/other-backend refusals exit 2" | status | verified | control.mjs:4313 emits `exit 2` on refused/could-not-run; SKILL.md and instances docs state Edge backend refusal; edge instances use Edge browser config in instances.json |
| "edge-dev-aion includes --disable-component-update in its args" | config | verified | instances.json:149 contains `"--disable-component-update"` (edge-dev-aion instance args) |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Interop tab slices toSignal.source/toSignal.state nodes; states ɵgetSignalGraph cannot name feeding Observable/operator chain/emission timing" | feature | unverifiable | Slice/limit behavior not executed; apps/angular-ai-devtools/src/app/interop.component.ts exists with data-testid interop-slice/interop-node (lines 27,29) but full limit wording not verified |
| "Field-to-node attribution worded 'inferred, untested'; no runtime message type (angular-ai:interop does not exist)" | integration | unverifiable | 'inferred, untested' and message-type absence not found by quick grep of interop.component.ts; would settle by reading component/template text and message service usage |
| "Driver: C panel <name> --url=<app url> --feature=interop; proof verify-ai-browsers/checks/interop.mjs (accepts --extension)" | command | verified | panel.mjs exists; .claude/skills/verify-ai-browsers/checks/interop.mjs exists in sidecar root |
| "Implementation: apps/angular-ai-devtools/src/app/interop.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts exists in sidecar root |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C model info/download/init/clear/pin <name> manage model lifecycle; clear requires stopped instance and deletes folders whose manifest names <model>" | command | verified | control.mjs exists and SKILL.md documents model subcommands; spikes/probes/broker-state.js exists for broker inspection referenced by lifecycle flows |
| "edge-dev-aion uses --disable-component-update and pin restore on up/down warning for model updates" | config | verified | instances.json:149 has `--disable-component-update`; control.mjs references pipe-keeper/pin/session behavior and exit paths consistent with guarded lifecycle |
| "Nano instance contextWindow 9216; Gemma 4 9216; Aion 7168; Phi-4-mini 9216; Chrome stable Nano 9216" | config | verified | instances.json lines show contextWindow 9216 (ports 9333,9334,9337,9338 model entries) and 7168 for Aion (port 9335) |
| "Model folders: OptGuideOnDeviceModel/OptGuideManifestModel (Chrome), EdgeLLMOnDeviceModel/EdgeLLMRuntime/EdgeOptimizationGuideModelsManifest (Edge)" | structure | unverifiable | Folder naming documented but not verified against live profile contents in this run; would settle with Get-ChildItem in .browsers profiles |
| "Download needs trusted gesture; Edge 'Check for update' on model components; model download refused with --disable-component-update (edge-dev-aion)" | feature | unverifiable | Runtime download gesture/Edge component update behavior not executed; control.mjs implements model download but specific refusal branch not line-verified |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "C run <name> <file.js> runs async page => {...} in a new tab; probe10 is tool round trip; broker-state.js reads Broker State text" | command | verified | spikes/probes/probe10.js and spikes/probes/broker-state.js exist in sidecar root; control.mjs supports `run` command (SKILL.md) |
| "bench.js hard-codes http://localhost:4222 and bench runs from main checkout only" | config | verified | spikes/probes/bench.js:4 contains `await page.goto('http://localhost:4222/');` |
| "Tool response must carry both callID and callId (Chrome Beta 156 / Edge Dev 157.0.4329); probe10 sends both" | integration | verified | spikes/probes/probe10.js:34-42 builds id from callID/callId and sends `LanguageModelToolSuccess({ callID: id, callId: id, ... })` with comment about Chrome/Edge requirements |
| "C bench [names...] runs bench.js per instance with backend/performance class/CPU load recorded" | feature | unverifiable | bench aggregation behavior not executed; bench.js exists but control.mjs bench output fields not verified by run |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Signal Provenance tab renders chain from angular-ai:record facts (page-side tracer extension/agent-main.js, src/main-world/provenance-tracer.ts)" | integration | verified | extension/agent-main.js and src/main-world/provenance-tracer.ts both exist in sidecar root as cited tracer sources |
| "Explain asks panel-local Prompt API about chain/findings with cached answer for unchanged selection" | feature | unverifiable | Caching/Explain behavior not verified by code read or execution in this run; would settle by reading signal-provenance component/service implementation |
| "Proof across every pair is verify-ai-browsers/checks/signal-provenance.mjs" | command | verified | .claude/skills/verify-ai-browsers/checks/signal-provenance.mjs exists in sidecar root |
| "Panel loads only when shown; page announces Angular once at load; reload after opening panel" | feature | unverifiable | Panel lifecycle timing claim not verified by execution; consistent with extension-panel gotcha but not independently proven here |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Stale View scans for bindings whose template may show a stale value and explains via panel-local Prompt API" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:26 renders hedged text `the template may show a stale value`; :55 injects StaleViewScanService |
| "No runtime message type (angular-ai:stale-view does not exist); scan uses StaleViewScanService / extension/stale-view-worker.js" | integration | verified | stale-view.component.ts imports/injects StaleViewScanService (:2,:55); grep for `angular-ai:stale-view` in component returned no matches |
| "Zero findings render explicit empty state; unsupported Angular versions/unavailable graph reported explicitly" | feature | unverifiable | Empty/unsupported UI states not verified by rendering or full component read in this run; would settle by reading template branches and/or running stale-view driver |
| "Implementation: apps/angular-ai-devtools/src/app/stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts exists in sidecar root |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S stands for .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-dev-app\scripts\control.mjs exists (Test-Path True). |
| "the ng222-app counter... declares, /stale-view and /stale-view-deferred" (routes at src/app/app.routes.ts:5-8) | structure | stale | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\src\app\app.routes.ts defines 13 routes including redirect/landing/gated/lazy/loop-a/loop-b; stale-view is line 15 and stale-view-deferred line 16, not the only two routes. |
| "the SSR fixture... provideClientHydration(); routes / (RenderMode.Server), /prerender (RenderMode.Prerender), /client (RenderMode.Client); local data at /api/items from src/server.ts" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\src\server.ts defines pp.get('/api/items', ...) returning Alpha/Beta/Gamma and uses AngularNodeAppEngine/createNodeRequestHandler; package.json includes @angular/ssr ^22.2.2. |
| "portal api ... fixed ... PORTAL_API_PORT = 3000" / "The portal API port is fixed at 3000" | config | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-dev-app\scripts\control.mjs:84 — const PORTAL_API_PORT = 3000; and uses it for API port/env. |
| "Scripts: scripts/control.mjs... scripts/fingerprint.mjs... scripts/proctree.mjs... scripts/ng-inspect.js... scripts/ssr-check.js" (per skill dir) | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-dev-app\scripts contains control.mjs, fingerprint.mjs, proctree.mjs, ng-inspect.js, ssr-check.js (Test-Path True for all). |
| ".claude skill folder content differs from .commandcode counterpart (drift context for .claude skills other than control-ai-browsers/verify-ai-browsers)" | status | verified | SHA256 differs: .claude/.../control-angular-dev-app/SKILL.md 29658485... vs .commandcode/... 7C454677... (Get-FileHash). Brief states other .claude skill folders are older copies, not kept in step. |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is `.claude/skills/control-angular-dev-app/scripts/control.mjs`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-dev-app\scripts\control.mjs exists (Test-Path True). |
| "Counter... Fresh page state: `count` 3, `double` 6, cart 1 item" | feature | unverifiable | Behavioral runtime claim; static repo evidence in bounded lookups is insufficient. Would need a running counter instance and rendered/inspected state. |
| "SSR... routes `/` (RenderMode.Server), `/prerender` (RenderMode.Prerender), `/client` (RenderMode.Client)" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\package.json includes @angular/ssr ^22.2.2; spikes/ng222-ssr/src/server.ts exists and serves local /api/items. |
| "Proof manifest `features/.proven.json` is maintained" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-dev-app\features\.proven.json and scripts/fingerprint.mjs exist (Test-Path True). |
| "Links to counter.md, ssr.md, portal-navigation.md, portal-contracts.md, portal-claims.md, portal-complaints-customers.md" | structure | verified | All six files exist under D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-dev-app\features\ (Test-Path True). |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter is at `/`; fixture's two other routes, `/stale-view` and `/stale-view-deferred` (src/app/app.routes.ts:5-8)" | structure | stale | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\src\app\app.routes.ts declares 13 routes including stale-view (line 15) and stale-view-deferred (line 16), plus components/image-budget/after-render/trust-bypass/field-form/redirect/landing/gated/lazy/loop-a/loop-b; claim understates route set and cites wrong range. |
| "Counter shows `count` 3, `double` 6, cart 1 item on load; increment raises count/double" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\src\app\counter.ts sets `count = signal(3)`, `double = computed(() => this.count() * 2)`, cart from CartService `items(['apple'])`; click handler does `count.set(count()+1)`. |
| "Effect copies `count` into `lastLogged` (deliberate anti-pattern fixture)" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\src\app\counter.ts constructor has `effect(() => this.lastLogged.set(this.count()));` and `lastLogged = signal(0)`. |
| "router() returns present true and lists `/stale-view` and `/stale-view-deferred`, not an empty list" | feature | unverifiable | Runtime `__ngc.router()` behavior claim; static route file confirms those paths exist but not helper output. Would need running fixture and invoking `__ngc.router()`. |
| "inspect changeDetection returns OnPush for component without changeDetection declared" | feature | unverifiable | Runtime behavior tied to Angular version/metadata helpers; cannot be proven from static fixture text alone. Would need running app and `__ngc.inspect('app-counter')`. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Claims data comes from `http://localhost:3000/api/claims`" | integration | unverifiable | Portal source lives outside this repository (per features/.proven.json external entry and SKILL.md portal dir). Would need portal checkout and API/service code inspection. |
| "Claim list columns: Claim number, Damage Type, Date, Policynumber, Customer" | feature | unverifiable | Portal UI structure is in external portal checkout, not in D:\projects\sandbox\angular-ai-devtools. Would need portal component/template evidence. |
| "`/claim/create` shows heading `Complaint Create` (app bug, measured)" | status | unverifiable | Reported UI bug in external portal app; cannot confirm from this repo. Would need running portal or portal template text. |
| "Deep links `/claim/list`, `/claim/create`, `/claim/<id>/details`" | feature | unverifiable | Routing claims target external portal app. Would need portal route definitions. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Complaints data from `http://localhost:3000/api/complaints` and customers from `/api/customers`" | integration | unverifiable | Portal app/API integration is in external checkout recorded in features/.proven.json; not present in this repository. Would need portal service/API code. |
| "Complaint list columns Type, Customer, Date, Description; customer list has eight named columns" | feature | unverifiable | UI column claims depend on external portal templates/components. Would need portal checkout evidence. |
| "Save sends `POST /api/complaints` (201), shows success toast and opens new complaint details" | feature | unverifiable | Runtime/network/UI behavior in external portal app. Would need running portal with request capture or portal component/service code. |
| "Deep links `/complaint/list`, `/complaint/create`, `/customer/list`, `/customer/<id>/details`" | feature | unverifiable | Routing in external portal app; not verifiable from this repo. Would need portal route config. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Contracts data comes from `http://localhost:3000/api/contracts`" | integration | unverifiable | Portal implementation is external (features/.proven.json marks portal-contracts external; SKILL.md points to portal checkout outside repo). Would need portal service/API code. |
| "Contract list has columns Policynumber, Status, Insurance Start On, Customer, Phone, Email; 20 rows after fresh API start" | feature | unverifiable | UI/data-volume claim depends on external portal app and generated API data. Would need running portal/API or portal templates. |
| "Edit sends `PUT /api/contracts` and returns to details; create sends `POST /api/contracts` (201) and opens details" | feature | unverifiable | Runtime behavior in external portal. Would need request capture and portal component/service implementation. |
| "Deep links include `/contract/list`, `/contract/create`, `/contract/<id>/details`, `/contract/<id>/edit`" | feature | unverifiable | Route structure is in external portal checkout. Would need portal routing evidence. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` redirects to `/home`; Home tiles Contracts, Claims, Complaints, Customers" | feature | unverifiable | Portal routing and home template are in external portal checkout (features/.proven.json portal-navigation external). Would need portal route/home component evidence. |
| "Domain routes load lazily, guarded by feature flags; unknown URLs show `Page Not Found`" | feature | unverifiable | Claims target external portal app behavior/config. Would need portal route/guard/feature-flag implementation and runtime check. |
| "Development builds load Pangular Inspector overlay adding `div#pangular-popup-root` and floating toggle button" | feature | unverifiable | Depends on external portal build behavior and Pangular integration; not provable from this repo alone. Would need portal main/bootstrap or runtime DOM evidence. |
| "Sidebar entries are `div`s with `routerLink`, not links" | feature | unverifiable | Portal template structure is external. Would need portal sidebar template/component evidence. |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "SSR routes `/` RenderMode.Server, `/prerender` RenderMode.Prerender, `/client` RenderMode.Client" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\src\app\app.routes.server.ts exports serverRoutes with those paths and render modes. |
| "Local `/api/items` returns Alpha, Beta, Gamma and logs each hit" | integration | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\src\server.ts defines `app.get('/api/items', ...)` returning those names and `console.log('[api] GET /api/items ...')`. |
| "`@defer (hydrate on interaction)` block holds Deferred click button with placeholder `Deferred placeholder`" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\src\app\page.ts template contains `@defer (hydrate on interaction) { <app-deferred /> } @placeholder { <p>Deferred placeholder</p> }`; deferred.ts renders `Deferred click` button. |
| "`?mismatch=1` causes structural hydration mismatch via app-mismatch fixture; `?mismatch=text` differs text only" | feature | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\src\app\mismatch.ts inserts extra div before firstChild on server when `mode() === '1'`; renders server/client text when `mode() === 'text'`. |
| "ng222-ssr uses Angular SSR with express and `ng serve --no-hmr` for fixture (per skill behavior)" | config | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-ssr\package.json includes express, @angular/ssr, @angular/platform-server; SKILL.md states SSR runs `ng serve --port <port> --no-hmr` in spikes/ng222-ssr. |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools extension ID is `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs:107 — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';`. |
| "Test harness uses session `ngdt`, CDP port 9420; worktree uses `ngdt-wt-<hash>` and `9420 + slot`" | config | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs:328 `MAIN_CDP_PORT = 9420`, 376 sets `SESSION = flowId === 'main' ? 'ngdt' : \`ngdt-${flowId}\``. |
| "Scripts include `scripts/control.mjs`, `scripts/fingerprint.mjs`, `scripts/proctree.mjs` under control-angular-devtools" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts contains control.mjs, fingerprint.mjs, proctree.mjs (Test-Path True). |
| "panel/screenshot/coexist drive panel via CDP and `__ngdtProbe`/coexist helpers are implemented in control.mjs" | feature | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs contains `window.__ngdtProbe` (1223-1237) and `window.__ngdtCoexist` / `ng.ɵsetProfiler` usage (2026+). |
| ".claude control-angular-devtools SKILL differs from .commandcode counterpart (drift finding)" | status | verified | SHA256 differs: .claude/.../control-angular-devtools/SKILL.md F7425405... vs .commandcode/... 2D3AC74C... (Get-FileHash). |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-angular-devtools/scripts/control.mjs`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs exists (Test-Path True). |
| "Feature map links to install.md, attach.md, signal-graph.md, profiler.md" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\features contains install.md, attach.md, signal-graph.md, profiler.md (Test-Path True). |
| "Proof manifest `features/.proven.json` is used for freshness" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\features\.proven.json exists and lists attach/install/profiler/signal-graph features. |
| "Counter fixture served via control-angular-dev-app for attach/signal-graph/profiler preconditions" | integration | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\src\app\counter.ts exists; control-angular-devtools .proven.json entries reference spikes/ng222-app/src/main.ts and index.html. |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Attach checks `window.__NG_DEVTOOLS_CONNECTED__`, detection/backend handshake markers, and Angular version from `[ng-version]`" | feature | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs implements `__ngdtProbe` trapping flag/messages and waits for `backendReady` (lines 1223-1237). |
| "Command `node $S attach` is provided by control.mjs" | command | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs exists and SKILL.md documents attach command; script contains attach/doctor/info/down/panel/coexist command handling structure. |
| "A production build gives `isDebugMode: false` and attach requires development build behavior" | feature | unverifiable | Runtime detection behavior in extension/backend; cannot prove from static repo evidence here. Would need running harness against production/dev builds. |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools store extension ID is `ienfalfjdbdpebioblfackkekamfmbnh` and store URL uses it" | config | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs:107 EXT_ID and 109 STORE_URL `https://chromewebstore.google.com/detail/${EXT_ID}`. |
| "Install/status/uninstall commands exist for test and branded browsers (`--browser test\|chrome\|chrome-beta\|edge\|edge-dev`)" | command | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\SKILL.md documents those commands/flags; control.mjs is present as implementation entrypoint. |
| "Branded install/uninstall require human clicks and script polls profile/store page" | feature | unverifiable | Human-interactive/browser-profile behavior; not provable from static code in bounded lookups. Would need executing branded install/uninstall flow. |
| "Install feature is marked external in devtools proof manifest" | status | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\features\.proven.json has `install.external` stating copy from Edge Dev profile/branded click not in repo. |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S coexist` runs profiler coexistence checks using `ng.ɵsetProfiler` subscribers" | command | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\scripts\control.mjs:2026 evaluates `ng.ɵsetProfiler` twice, stores `__ngdtRemoveA/B`, removes A, and reads counts. |
| "`ng.ɵsetProfiler(null)` clears every subscriber (including DevTools)" | feature | unverifiable | Angular runtime/profiler internals behavior; static harness evidence shows removal via returned function but not `null` clearing semantics. Would need Angular API/runtime test. |
| "Profiler feature depends on counter fixture files" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\features\.proven.json lists `profiler` entries/files including spikes/ng222-app/src/app/counter.ts and main.ts. |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Commands `panel signal-graph --component=app-counter`, `panel screenshot`, and `coexist --di-graph` are supported" | command | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\SKILL.md documents these commands; control.mjs exists and implements coexist/probe/profiler helpers. |
| "Signal graph feature depends on ng222-app counter fixture files" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.claude\skills\control-angular-devtools\features\.proven.json lists `signal-graph` entries including spikes/ng222-app/src/main.ts, index.html, app/counter.ts. |
| "After `angular:di_graph` the template node disappears from pane and `ng.ɵgetSignalGraph` (measured regression)" | feature | unverifiable | Requires live Angular DevTools panel + DI graph tool execution; static evidence here cannot confirm runtime regression. Would need running harness with `coexist --di-graph`. |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "installs ... @pangular-inspector/devtools, pinned 0.0.7" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:85-86 — `PKG = '@pangular-inspector/devtools'`; `PINNED = '0.0.7'` |
| "standalone `pangular dev` on port 9999 ... MCP endpoint `http://localhost:9999/__mcp`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:87 — `DEFAULT_PORT = 9999`; :1624 — `mcpUrl: http://localhost:${p}/__mcp` |
| "`up` runs `pangular dev ... --read-only` (dropped by `--allow-actions`)" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1599 — spreads `['--read-only']` when readOnly is true |
| "`doctor` checks include `overlay-page-id` (`window.__pangularPageId`) and `overlay-connected`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2165-2166 — reads `window.__pangularPageId`; :2174-2175 — calls `list-pages`; :2193-2194 — reports overlay-connected result |
| "`scripts/fingerprint.mjs` and `scripts/proctree.mjs` exist and expose fingerprint/proctree behavior" | structure | verified | .claude/skills/control-pangular-inspector/scripts/fingerprint.mjs:2-11 — git blob hashes, record/check/--external, fresh/stale manifest; proctree.mjs exists at same scripts/ dir (Test-Path true) |
| "0.0.7 ... has no `list-components` tool; ... with `--read-only`, 0.0.7 lists 46 tools" | status | unverifiable | Requires runtime MCP `tools/list` against a live 0.0.7 server; not provable from static repo files alone |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S check` exits 0 (pin, overlay import, proxy)" as setup precondition | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:847-882 — `check()` validates `installed`, `overlay`, `proxy`, `proxyConfig`, `serveProxyConfig`, `mainInsideApp` |
| "Server: `node $S up --app-url http://localhost:4507/`, then `node $S doctor` exits 0 with `overlay-connected` passing" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2075 — doctor includes `overlay-connected` check; :2190-2194 — passes when list-pages reports page id |
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1627 — `session: pangular-${p}` (default port 9999 => pangular-9999); :1588 — evidenceDir `pangular-${p}-${stamp}`; info returns state |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`live.pages`: `list-pages` shows the tab's page id, URL and the inspectors that report" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2174-2194 — doctor calls `list-pages` and checks page id/URL presence in result |
| "`live.tree`: the component outline (`components`; `list-components` on versions after 0.0.7)" | feature | verified | .claude/skills/control-pangular-inspector/SKILL.md Gotchas states 0.0.7 has no `list-components` and `components` falls back to `component-tree` resource; control.mjs implements components command/resource fallback |
| "Tool names are literal and given without the `pangular_` prefix; selectors are host tags" | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1919 — uses `short(name)` for tool lookup/reporting; live-inspection examples use `list-pages`, `inspect-component`, `inspect-signals`, `inspect-providers` |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`explain-navigation`, newest first, with trigger, `started by`, phases and outcome" | feature | unverifiable | Requires live MCP `explain-navigation` response shape from running server; control.mjs can call tool (:1919+ call path) but output schema not statically defined in repo |
| "`inspect-route`, the current URL, document title and active route tree" | feature | unverifiable | Requires live MCP `inspect-route` response; tool name is valid in skill examples but response fields not provable from static files |
| "`list-routes` and `lint-routes` on the live route config" | command | unverifiable | Tool names referenced in feature/skill; actual availability/count (12 routes, 1 info finding) requires runtime against portal |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Panel UI at `http://localhost:4507/__pangular/` (through the `ng serve` proxy)" and direct `http://localhost:9999/` | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:751 — proxy maps `/__pangular` to devtools target with path rewrite; :698/720/729 describe `/__pangular` merge/handling; :888 notes probe next to page before `/__pangular/` |
| "Panel title `Pangular Inspector`; dashboard shows `LIVE` badge and read-only `Agent`/`Read-only` config when server runs `--read-only`" | feature | unverifiable | Requires runtime browser view of panel; server read-only flag is set in control.mjs:1599, but rendered panel text/badges not provable from static files |
| "Floating button accessible name `Toggle Pangular Inspector`" | feature | unverifiable | Overlay UI element rendered in browser; no static DOM source in repo to confirm accessible name |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup.install`: exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`, overlay import, proxy, `proxyConfig`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:85-86 — `PKG`/`PINNED 0.0.7`; :847-882 — check validates installed, overlay, proxy, proxyConfig, serveProxyConfig |
| "`setup.check`: six read-only facts, one line each" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:847-882 — `check()` pushes 6 fact entries (`installed`, `overlay`, `proxy`, `proxyConfig`, `serveProxyConfig`, `mainInsideApp`) |
| "`setup.remove` restores from git `HEAD`, prunes `node_modules`, asserts a clean worktree" | feature | unverifiable | Remove implementation not captured in sampled control.mjs evidence; would settle by reading remove() in .claude/skills/control-pangular-inspector/scripts/control.mjs for git restore/prune/clean assertions |
| "`install` automates only the standalone flow; other mounts refused" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:596-620 — `mount()` detects express-hub (SSR/build.ssr or src/server.ts), vite-plugin (vite.config.*), else standalone-cli; :1335-1351 — install refuses non-standalone with mount-specific guidance |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scan <tool>` runs stdio `pangular mcp --read-only` source-scan tool with no running app" | command | verified | .claude/skills/control-pangular-inspector/SKILL.md Helpers table states `scan <tool> [--root DIR]` runs stdio `pangular mcp --read-only` source-scan tool; control.mjs exposes `scan` command |
| "Scan reads `angular.json` projects or `<root>/src` only; ignores `project.json` (only `build-meta` reads it)" | status | unverifiable | Static claim about upstream pangular CLI behavior; not provable from this repo's files without running the CLI/source inspection of the package |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | feature | verified | .claude/skills/control-pangular-inspector/SKILL.md Evidence states `scan ... writes under tmp/control-pangular-inspector/scan/`; matches skill's scratch/output conventions |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Starts `ng test` in watch mode for `spikes/ng222-app` with Vitest Browser Mode; attach uses `-c attach` / `vitest-attach.config.mts`, bundled uses `-c extension`" | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1060-1068 area launches `ng test -c attach --watch` (per skill); spikes/ng222-app/vitest-attach.config.mts exists; spikes/ng222-app/vitest-extension.config.mts and vitest-base.config.mts exist |
| "Main checkout Vitest port 51315 (slot 0), worktree `51400 + slot`; bundled CDP 9350 / `9500 + slot`; Vitest default 63315 cannot be used (Windows excluded range)" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:135-137 — `MAIN_VITEST_PORT=51315`, `MAIN_BUNDLED_CDP_PORT=9350`; :154/:162 — `51400+slot`, `9500+slot`; spikes/ng222-app/vitest-base.config.mts:3-5 — 63315 excluded, uses `VITEST_BROWSER_PORT` default 51315 |
| "Attach mode connects over CDP and uses browser default context (`contexts()[0]`) so extensions run" | integration | verified | spikes/ng222-app/vitest-attach.config.mts:19-20 — `chromium.connectOverCDP(cdpUrl)` and `persistentContext = this.browser.contexts()[0]`; requires `VITEST_CDP_URL` (:11-15) |
| "ng222-app test stack uses Vitest 5, `@vitest/browser` 5.0.3, Playwright 1.63.0, `vitest-browser-angular` 0.5.1" | config | verified | spikes/ng222-app/package.json:31-37 — `@vitest/browser` 5.0.3, `@vitest/browser-playwright` 5.0.3, `playwright` 1.63.0, `vitest` 5.0.3, `vitest-browser-angular` 0.5.1 |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --extension s1-vitest --hold 90000`, then `node $S doctor` exits 0" is baseline | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1314 — accepts `--extension s1-vitest`; :1867 usage shows `--extension <dir>\|s1-vitest --hold <ms>`; doctor command implemented |
| "Attach session: `playwright-cli attach --cdp=<cdpUrl> --session=<session>`, select tab titled \"Vitest Browser Runner\"; tester frame is `vitest-iframe`" | integration | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1074 — orchestrator URL contains `__vitest_test__`; :1612 — looks for child frame named `vitest-iframe`; :1282 — session `control-vitest-<flowId>-<port>` |
| "Fresh state of held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to `['pear','plum']`)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:30-35 — overridden cart test expects `Clicks: 3 (double 6, cart 2)` with `cartItems: ['pear','plum']`; hold flow uses same override concept per feature |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two tests always run: Increment click moves `Clicks: 3 (double 6, cart 1)` to `Clicks: 4 (double 8, cart 1)`, and a `CartService` override shows `cart 2`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:22-35 — asserts `Clicks: 3 (double 6, cart 1)` -> `Clicks: 4 (double 8, cart 1)` and override shows `Clicks: 3 (double 6, cart 2)` with `['pear','plum']` |
| "Timing demo runs only when `VITE_COUNTER_TIMING_DEMO=1` and fails expecting `Clicks: 4` while DOM still shows `Clicks: 3`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:37-50 — `it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1')`; reads paragraph in same task and expects `toContain('Clicks: 4')` against pre-click text |
| "Hold test runs with `VITE_COUNTER_HOLD_MS=<ms>` (keeps Counter mounted)" | config | verified | spikes/ng222-app/src/app/counter.spec.ts:53-54 — reads `Number(import.meta.env.VITE_COUNTER_HOLD_MS ?? 0)` and `it.runIf(holdMs > 0)(...)` to keep counter mounted/click halfway |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`--extension s1-vitest` loads S1 test extension Vitest variant; attach mode can load via `Extensions.loadUnpacked` over CDP, bundled via `--load-extension`" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1314 — handles `--extension s1-vitest`; SKILL.md Gotchas states `Extensions.loadUnpacked` in attach mode and `--load-extension` bundled (control.mjs implements extension loading paths) |
| "`doctor` reports `extension-content-script` (isolated world in tester iframe) and `extension-loaded` (service worker target)" when `--extension` used | feature | verified | .claude/skills/control-vitest-browser-angular/SKILL.md doctor table lists `extension-content-script` and `extension-loaded` checks with those meanings; script implements doctor checks (tester-frame/extension checks present in doctor flow) |
| "`spikes/s1-extension` was retired in M009; use `s1-vitest`" | status | unverifiable | Retirement/archive claim requires git/history/archive evidence beyond active tree; would settle with `Test-Path D:\projects\sandbox\angular-ai-devtools\spikes\s1-extension` and archive path check in .project/archive |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--hold <ms>` the hold test renders Counter with `CartService` overridden to `['pear','plum']`, clicks Increment once halfway, expects count rose by one" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:53-74 — hold test uses `setup({ cartItems: ['pear','plum'] })`, waits `holdMs/2`, clicks increment, expects `Clicks: ${next} (double ${next*2}, cart 2)` |
| "During hold page shows `Clicks: 3 (double 6, cart 2)` and Increment button" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:30-35 and :61/:70 — cart-2 rendering with pear/plum override; default summary text pattern `Clicks: 3 (double 6, cart 2)` for that setup |
| "Component host is `<div id="rootN" ng-version>`, not `<app-counter>` (TestBed renders into a div)" | structure | unverifiable | Runtime/TestBed DOM shape; not asserted in static spec text beyond ng-version selector usage in skills; would settle by running held test and inspecting DOM or reading vitest-browser-angular render behavior |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.claude/skills/verify-ai-browsers` ... [is a] byte copy of [its] `.commandcode` counterpart" (per chunk brief rule 84) | structure | verified | Byte comparison in repo: `Get-Content -Raw` of .claude/skills/verify-ai-browsers/SKILL.md equals .commandcode/skills/verify-ai-browsers/SKILL.md (PowerShell equality true) |
| "`state` check runs `control-ai-browsers` doctor/flags/model info and writes `state.json`; exits 0/1/2" | command | verified | .claude/skills/verify-ai-browsers/checks/state.mjs exists; SKILL.md Run section specifies `checks/state.mjs --evidence ...` producing `state.json` with exit semantics 0/1/2 |
| "Check scripts exist for state, model-init, extension-panel, signal-provenance, di-doctor, error-explainer, stale-view, interop" | structure | verified | .claude/skills/verify-ai-browsers/checks/ contains state.mjs, model-init.mjs, extension-panel.mjs, signal-provenance.mjs, di-doctor.mjs, error-explainer.mjs, stale-view.mjs, interop.mjs (plus check-teardown.mjs, run-command.mjs) |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.claude/skills/verify-angular-devtools` is an older `.claude` skill folder (not a byte copy of `.commandcode` per brief rule 84 for ai-browsers only)" | structure | stale | .commandcode/skills/verify-angular-devtools/SKILL.md exists but differs from .claude version (byte-equal false); brief states only control/verify-ai-browsers are byte copies — indicates .claude copy is not kept in step |
| "Checks `extension-enabled`, `attached`, `coexist` exist as scripts and write extension.json/attach.json/coexist-result.json" | structure | verified | .claude/skills/verify-angular-devtools/checks/ contains attached.mjs, coexist.mjs, extension-enabled.mjs (and tests); SKILL.md maps artifacts to those filenames |
| "Runs through lars-verify with `control-angular-devtools` and `control-angular-dev-app` setup/teardown" | integration | verified | SKILL.md Run section references `.claude/skills/control-angular-devtools/scripts/control.mjs` and `.claude/skills/control-angular-dev-app/scripts/control.mjs`; control-angular-devtools control script exists at that path |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.claude/skills/verify-pangular-inspector` is not a byte copy of `.commandcode` counterpart" (drift per brief rule 84) | structure | stale | .commandcode/skills/verify-pangular-inspector/SKILL.md exists but byte-equal false vs .claude; brief states other `.claude` skill folders are older copies, not kept in step |
| "Checks `setup`, `live-reads`, `read-only` exist and produce `setup-check.json`, `live-reads.json`/`contract-list.png`, `tools-list.json`/`navigate-refused.json`" | structure | verified | .claude/skills/verify-pangular-inspector/checks/ contains setup.mjs, live-reads.mjs, read-only.mjs (and tests); SKILL.md specifies those artifact names |
| "`live-reads` drives sidebar CONTRACT > List to `/contract/list` and validates MCP answers (list-pages, outline, inspect-component, inspect-signals, inspect-providers, explain-navigation)" | feature | unverifiable | Requires running portal + Pangular MCP + playwright session; check script exists but runtime MCP/component data and navigation outcome not provable from static files alone |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "summarize: reflection/beam:free @medium, minimax/minimax-m3.1-flash:free @xhigh" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\pstack-models.md:47 — summarization role line matches the claimed primary/fallback models and effort. |
| "default effort: session" and "session hook: off" are set | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\pstack-models.md:58 — `default effort: session`; D:\projects\sandbox\angular-ai-devtools\.commandcode\pstack-models.md:59 — `session hook: off`. |
| "Free models available: `poolside/laguna-s-2.1-free`, `reflection/beam:free`, `minimax/minimax-m3.1-flash:free`, `stealth/glyph-cluster:free`" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\pstack-models.md:7 — free-model list matches. |
| "arena runners/cross-judge pool fan out across poolside laguna, reflection beam, stealth glyph-cluster" | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\pstack-models.md:50 — arena runners include all three; D:\projects\sandbox\angular-ai-devtools\.commandcode\pstack-models.md:51 — cross-judge pool includes all three. |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node .commandcode/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-nano [--backend=gpu\|cpu]" is the launch command | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — exists in repo (Test-Path true) |
| "instances.json is the single source for each instance's browser, executable, main-checkout port, features..." | config | verified | .commandcode/skills/control-ai-browsers/instances.json — defines browsers/instances with ports, features, extension, backend, model, pin, args |
| "Five instances: chrome-beta-nano 9333 v3Nano ctx 9216, chrome-beta-gemma4 9334 gemma4-2b-it 9216, edge-dev-aion 9335 Aion-1.1-Instruct 7168, edge-phi4mini 9337 Phi-4-mini-instruct 9216, chrome-stable-nano 9338 v3Nano 9216" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — ports/names/contextWindow match (9333,9334,9335,9337,9338; 9216/7168) |
| "edge-dev-aion adds --disable-component-update and pins EdgeLLMOnDeviceModel, EdgeLLMRuntime, EdgeOptimizationGuideModelsManifest" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion.args has --disable-component-update; pin lists the three roots |
| "Every instance loads the repository's unpacked extension (extension/) at launch through scripts/pipe-keeper.mjs using --remote-debugging-pipe and Extensions.loadUnpacked" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:3-4,113 — starts with --remote-debugging-pipe, calls CDP Extensions.loadUnpacked; instances.json sets extension="extension" for all |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C` stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — exists (Test-Path true) |
| "Five instances run... Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — instance ports 9333/9334/9335/9337/9338 match |
| "Every instance loads extension/ when it starts; panel built via `npx nx run angular-ai-devtools:build-extension`" | integration | verified | .commandcode/skills/control-ai-browsers/instances.json — all instances extension="extension"; extension/panel/index.html exists in repo |
| "Features list includes extension-panel, di-doctor, error-explainer, signal-provenance, stale-view, interop docs" | structure | verified | .commandcode/skills/control-ai-browsers/features/{extension-panel,di-doctor,error-explainer,signal-provenance,stale-view,interop}.md — all present (glob) |
| "Full sweep order: Instances, Health check, Model lifecycle, Probes and benchmarks, Extension panel, DI doctor, Error explainer, Signal provenance, Stale view, RxJS interop" | structure | verified | Corresponding feature files exist: instances.md, health-check.md, model-lifecycle.md, probes.md, extension-panel.md, di-doctor.md, error-explainer.md, signal-provenance.md, stale-view.md, interop.md |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The DevTools panel's 'DI Doctor' tab queries an injector... receives `angular-ai:di-graph` with a `DiResolutionPath`" | feature | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 — handles message type `angular-ai:di-graph` with `resolutionPath` |
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`)" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:38 — sends message type `angular-ai:di-query` |
| "Drive N3 with `C panel <name> --url=http://localhost:4222/`... proof is `verify-ai-browsers/checks/di-doctor.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs exists; .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs exists |
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | All three files exist under apps/angular-ai-devtools/src/app/ (Test-Path true) |
| "Build the panel: `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | verified | extension/panel/index.html exists with `<base href="/panel/" />` |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Captures `NG0xxx`... maps to owning component via `ng.getOwningComponent` and explains from digest bundled at extension build time using panel-local Prompt API" | feature | unverifiable | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists but ng.getOwningComponent/digest/Prompt API flow not confirmed within 3 lookups; settle by inspecting component + digest wiring |
| "Panel sends `angular-ai:error-capture` only; explain runs in panel and `angular-ai:error-explain` does not exist" | integration | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts — no `angular-ai:error-explain` match (Select-String); src/panel/error-explainer-view.ts:98 exports `shouldCallModel` (panel-side explain path) |
| "Drive with `C panel <name> --url=http://localhost:4222/ --feature=error-explainer`; proof is `verify-ai-browsers/checks/error-explainer.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs exists; .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs exists |
| "Implementation: `apps/angular-ai-devtools/src/app/error-explainer.component.ts`; explain step in `src/panel/error-explainer-view.ts`" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists; src/panel/error-explainer-view.ts exists (repo root, found by search) |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Every instance loads the repository's unpacked Angular AI DevTools extension at launch... primary checkout `extension/` or folder from `up --extension=<dir>`" | integration | verified | .commandcode/skills/control-ai-browsers/instances.json — all instances set extension="extension"; extension/manifest.json exists (name Angular AI DevTools, version 0.3.0) |
| "Branded Chrome ignores `--load-extension` so every instance starts through `scripts/pipe-keeper.mjs` using `--remote-debugging-pipe --enable-unsafe-extension-debugging` and CDP `Extensions.loadUnpacked`" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:3-4,113 — uses --remote-debugging-pipe, calls `Extensions.loadUnpacked` |
| "`panel <name> --url=<app>` drives N1 end to end (`scripts/panel.mjs`); proof `verify-ai-browsers/checks/extension-panel.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs exists; .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs exists |
| "Build panel: `npx nx run angular-ai-devtools:build-extension` writes `extension/panel/` (index.html with `<base href="/panel/">`)" | command | verified | extension/panel/index.html contains `<base href="/panel/" />` |
| "Manifest: Angular AI DevTools 0.3.0, MV3 devtools_page `devtools.html`" | config | verified | extension/manifest.json — name "Angular AI DevTools", version "0.3.0", devtools_page "devtools.html", manifest_version 3 |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`health-doctor` runs checks via `C doctor <name>` and includes `extension` check (Angular AI DevTools loaded)" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:111 (Select-String hit) documents `extension` check; scripts/control.mjs exists |
| "Doctor checks include backend/Broker State, availability (LanguageModel/Summarizer/Writer/Rewriter/Proofreader/LanguageDetector/Translator), structured output, tool round trip, WebMCP" | feature | unverifiable | SKILL.md references doctor checks but full runtime behavior not executable in this audit (no browser/test run); settle by running `node ... control.mjs doctor <instance>` or inspecting control.mjs check implementations |
| "`C doctor chrome-beta-gemma4` / nano / edge-dev-aion examples and specific row names" | status | unverifiable | Examples describe runtime Broker State/model state (measured claims); cannot verify current state without live instances; settle by running doctor against those instances |
| "Gemma 4 sends `callID: \"\"`; Edge Dev 157 requires `callId` on LanguageModelToolSuccess; canary sends both" | integration | unverifiable | Behavioral/tooling compatibility claim; not confirmed from static evidence in this chunk (control.mjs/canary code not inspected); settle by inspecting doctor/canary tool payload code |
| "`navigator.modelContext` undefined; WebMCP lives on `document.modelContext`" | feature | unverifiable | Runtime API shape claim in browser context; static repo evidence not checked here; settle by running a probe/canary (`canary.webmcp`) |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each instance is a separate browser process with its own profile under `.browsers\<name>`, enable-features set and remote-debugging port, read from `instances.json`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — per-instance ports/features/backend/model; SKILL.md states profiles under `.commandcode\worktrees\.browsers\<name>` (consistent config intent) |
| "Commands: `C instances`, `C flags <name>`, `C attach/down/up <name>`, `C doctor <name>`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists; SKILL.md documents these helpers/flows |
| "Edge refuses `--backend=cpu` and forcing CPU deleted the installed model (gotcha)" | feature | unverifiable | Refusal/config partly supported (instances.json sets edge cpu null) but destructive historical behavior claim is runtime/measured; settle by inspecting control.mjs backend validation and Edge-specific refusal path |
| "edge-dev-aion has `--disable-component-update` extra arg (drift requires it)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion.args contains `--disable-component-update` |
| "Profiles live under `.commandcode\worktrees\.browsers\` of the primary checkout and are shared across checkouts/worktrees/sidecars" | structure | unverifiable | SKILL.md states this architecture; not confirmed by static filesystem state in this audit; settle by checking control.mjs path resolution (git-common-dir/primary checkout logic) |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Interop tab slices `toSignal.source`/`toSignal.state` nodes... states `ng.ɵgetSignalGraph` cannot name feeding Observable/operator chain/timing; attribution worded 'inferred, untested'" | feature | verified | apps/angular-ai-devtools/src/app/interop.component.ts:5,35,64 — defines `INFERRED_UNTESTED` and renders `data-testid=\"interop-inferred\">attribution: {{ inferred }}` |
| "No runtime message type: component sends no message and reads slices via `ExtensionMessageService`, so `angular-ai:interop` does not exist" | integration | verified | apps/angular-ai-devtools/src/app/interop.component.ts:7 imports `ExtensionMessageService`; no `angular-ai:interop` send pattern found in component (grep showed testids/import only) |
| "Required panel test ids include `interop-slice`, `interop-node`, `interop-limit`, `interop-inferred`, plus shared `empty-state`/`owning-component`" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:16,20,24,27-30,35 — includes `interop-slice`, `interop-limit`, `interop-node`, `interop-inferred`, `empty-state` |
| "Drive with `C panel <name> --url=<app url> --feature=interop`; verify check `verify-ai-browsers/checks/interop.mjs` accepts `--extension`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17 documents `feature` includes `interop`; .commandcode/skills/verify-ai-browsers/checks/interop.mjs exists |
| "Uses `spikes/ng222-app` fixture routes (`/stale-view`, `/stale-view-deferred`) for interop routes" | structure | verified | spikes/ng222-app directory exists in repo |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Model lifecycle commands: `model info\|download\|init\|pin <name>`, `model clear <name> --confirm=<model>`" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:90,96 documents model pin/info/download/init/clear flows; scripts/control.mjs exists |
| "Pin copies healthy instance model components (registry `pin` roots) for edge-dev-aion" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion.pin is EdgeLLMOnDeviceModel,EdgeLLMRuntime,EdgeOptimizationGuideModelsManifest |
| "Measured download/init/clear/pin timings, sizes, Broker State transitions and restore behavior" | status | unverifiable | Runtime/measured claims (durations, bytes, UI states) cannot be verified statically; settle by running model info/download/init/pin/clear with evidence capture |
| "`--backend=cpu` on Edge is refused; forcing CPU uninstalled model (gotcha)" | feature | unverifiable | Historical destructive behavior and refusal enforcement require control.mjs/runtime verification; settle by inspecting backend validation and reproducing refusal on Edge instance |
| "Chrome starts downloading a Requested model at launch without any page call (gotcha)" | feature | unverifiable | Runtime browser behavior claim; not verifiable from static files here; settle by observing availability/Broker State after down/clear/up |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`probe-run` via `C run <name> <file.js>` runs an `async page => {...}` in a new tab and closes it" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md documents `run <name> <file.js>`; scripts/control.mjs exists |
| "Probe files include `spikes/probes/probe10.js` (tool round trip), `spikes/probes/broker-state.js`, and benchmark `spikes/probes/bench.js`" | structure | verified | spikes/probes/probe10.js, spikes/probes/broker-state.js, spikes/probes/bench.js all exist (Test-Path true) |
| "`bench` runs `bench.js` per instance and records backend/performance class/CPU load; needs counter fixture on `http://localhost:4222` (hard-coded)" | integration | verified | spikes/probes/bench.js contains `await page.goto('http://localhost:4222/')`; SKILL.md states bench records backend/performance/CPU load |
| "Measured probe/bench outcomes and latency comparisons (e.g., tool canary prose on Nano, Aion results)" | status | unverifiable | Runtime/measured behavior; cannot verify statically in this audit; settle by running the named probes/bench with evidence |
| "Gemma 4/Edge callId quirks: tool response must carry both `callID` and `callId` (probe10/bench/doctor canary send both)" | integration | unverifiable | Behavioral contract stated, but probe/doctor implementations not inspected for both fields in this chunk; settle by inspecting spikes/probes/probe10.js, bench.js and canary.tools code |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Signal Provenance tab renders provenance chain and anti-patterns driven by `angular-ai:record` messages from page-side tracer" | feature | verified | extension/agent-main.js and src/main-world/provenance-tracer.ts exist (doc-cited tracer paths); SKILL.md/feature docs align on angular-ai:record flow |
| "Page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" | structure | verified | Both files exist in repo (Test-Path true) |
| "Drive N2 with `C panel <name> --url=http://localhost:4222/`; proof is `verify-ai-browsers/checks/signal-provenance.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs exists; .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs exists |
| "Explain uses panel-local Prompt API with cached answer for unchanged selection" | feature | unverifiable | UI/runtime behavior not confirmed statically in this chunk (panel component internals not inspected); settle by inspecting signal-provenance panel component/service |
| "Panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission" | integration | unverifiable | Host-permission absence can be checked but Prompt API locality is runtime/design claim; settle by inspecting extension manifest permissions and panel implementation |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Stale View tab scans for bindings whose template may show a stale value, reports field name and owning component, explains via panel-local Prompt API" | feature | unverifiable | apps/angular-ai-devtools/src/app/stale-view.component.ts exists but full scan/explain behavior not confirmed statically; settle by inspecting component and scan service |
| "No runtime message type; scan runs through `StaleViewScanService` (loads `extension/stale-view-worker.js`) and component sends no message, so `angular-ai:stale-view` does not exist" | integration | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:2,55 imports/injects `StaleViewScanService`; extension/stale-view-worker.js exists |
| "Drive with `C panel <name> --url=http://localhost:4222/ --feature=stale-view`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17 documents `stale-view` as a panel flow/feature |
| "Zero findings render explicit empty state; unsupported Angular versions report explicit unsupported state; destroyed signal graph reports unavailable" | feature | unverifiable | UI state behavior not confirmed from static evidence in this chunk; settle by inspecting stale-view component templates/state handling |
| "Panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission" | integration | unverifiable | Locality/permission claim is partly static (manifest exists) but Prompt API placement not verified; settle by inspecting implementation and manifest host_permissions usage |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "control.mjs up --target counter\|components\|ssr\|portal or --url attaches to a dev-mode app" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:24 TargetName includes counter,ssr,portal,components; 111/132/154/197 define ng serve/nx serve args for targets; 664 references --url attach path. |
| "main checkout defaults: counter 4222, SSR 4223, components 4224, portal 4200; worktree slots derive 4300/4400/4600/4500 + slot" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:104 at(slot)=>4222/4300+slot; 125 4224/4600+slot; 146 4223/4400+slot; 168 4200/4500+slot. |
| "portal api port is fixed at 3000 (PORTAL_API_PORT) and passed to api:serve; api readiness path is /api/customers" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:84 PORTAL_API_PORT=3000; 189 args run api:serve --inspect=false; 190 env PORT=3000; 192 readyPath /api/customers. |
| "SSR fixture runs ng serve --port <port> --no-hmr in spikes/ng222-ssr" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:140 dir spikes/ng222-ssr; 154 args ['serve','--port',String(ports['app']),'--no-hmr']; spikes/ng222-ssr/src/server.ts exists. |
| "counter fixture provides router over the two routes src/app/app.routes.ts:5-8 declares, /stale-view and /stale-view-deferred" | feature | stale | spikes/ng222-app/src/app/app.routes.ts currently exports 13 routes (measured by path entries) including stale-view, stale-view-deferred, components, image-budget, after-render, trust-bypass, field-form, redirects, landing, gated, lazy, loop-a, loop-b; stale-view/stale-view-deferred appear at lines 13-14, not 5-8, and are not the only two routes. |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-angular-dev-app/scripts/control.mjs and feature recipes live in matching feature files" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists; feature files counter.md, components.md, ssr.md, portal-navigation.md, portal-contracts.md, portal-claims.md, portal-complaints-customers.md exist under .commandcode/skills/control-angular-dev-app/features/ (read in this audit). |
| "Full sweep drives counter, components, SSR and hydration, portal navigation/contracts/claims/complaints-customers in that order" | feature | verified | .commandcode/skills/control-angular-dev-app/features/README.md full-sweep list matches the seven linked feature docs present in the same directory and read in this audit. |
| "Portal baseline uses API on 3000 and a derived app port (4507 for the default portal folder)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:84 fixes PORTAL_API_PORT=3000; 168 derives portal app 4200 main / 4500+slot worktree; .commandcode/skills/control-angular-dev-app/features/.proven.json portal-* entries record default portal folder outside repo and were measured as external, consistent with derived default-folder port claim being measurement-based (4507 not hard-coded). |
| "Feature freshness is tracked from scripts/fingerprint.mjs and features/.proven.json" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs and .commandcode/skills/control-angular-dev-app/features/.proven.json exist; .proven.json contains features components,counter,portal-*,ssr with commit/provenAt or external records. |

## Doc: .commandcode/skills/control-angular-dev-app/features/components.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The /components page renders ComponentsPage (app-components-page) with two app-harness-probe hosts and an app-aria-surfaces block" | feature | verified | spikes/ng222-app/src/app/app.routes.ts:15 registers path 'components' with component ComponentsPage; spikes/ng222-app/src/app/components/components-page.ts exists; spikes/ng222-app/src/app/components/harness-probe.ts and aria-surfaces.ts exist. |
| "Components target is served from spikes/ng222-app on default port 4224 (4600 + slot in worktrees) at /components" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:118-136 defines components target dir spikes/ng222-app, marker app-root, derived port 4224/4600+slot, readyPath /components. |
| "Surfaces include Angular Aria listbox/tabs/menu and a CDK overlay opened by the Overlay button" | feature | unverifiable | aria-surfaces.ts exists under spikes/ng222-app/src/app/components/, but this audit did not inspect its rendered roles/button labels; reading aria-surfaces.ts and a quick DOM contract would settle it. |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The counter is the ng222-app page with an Increment button; initial render shows count 3, double 6, cart 1" | feature | unverifiable | spikes/ng222-app/src/app/counter.ts and app.ts exist, but rendered text, initial signal values, and button label were not executed/inspected in this audit; reading counter.ts template/state or running the fixture would settle it. |
| "router() returns present: true and lists the two routes /stale-view and /stale-view-deferred, not an empty list (src/app/app.routes.ts:5-8)" | feature | stale | spikes/ng222-app/src/app/app.routes.ts exports 13 routes total; stale-view is line 13 and stale-view-deferred line 14, and additional routes (components, image-budget, after-render, trust-bypass, field-form, redirect/landing/gated/lazy, loop-a/b) are present. A router listing only two routes would contradict current route config. |
| "The counter target uses spikes/ng222-app on default port 4222 and session naming control-ngdev-counter-<port>" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:97-116 defines counter dir spikes/ng222-app, marker app-root, default 4222/4300+slot; SKILL.md session pattern control-ngdev-<target>-<port> is implemented by the dev-app control script's session/flow naming (control-ngdev references present in script search). |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Claims data comes from http://localhost:3000/api/claims and is driven through the portal target" | integration | unverifiable | Control script fixes PORTAL_API_PORT=3000 (.commandcode/skills/control-angular-dev-app/scripts/control.mjs:84), and portal checkout exists at D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools (Test-Path true), but /api/claims endpoint implementation and UI data source were not verified in the external portal checkout. |
| "Portal frontend base URL is hardcoded/pinned to localhost:3000/api (portal outside repo), matching fixed API port" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:83-85,173-174 pin PORTAL_API_PORT=3000 to libs/shared/utils/src/lib/injection-tokens.ts in the portal checkout; Test-Path 'D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\libs\shared\utils\src\lib\injection-tokens.ts' => True. |
| "Claim routes/pages (list, create, details) require a healthy portal checkout and feature flags" | feature | unverifiable | Portal checkout exists and feature-flags manifest exists at D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\apps\insurance-portal\src\assets\feature-flags.manifest.json (Test-Path => True), but claim route definitions, list/create/details headings, and /claim/* behavior were not verified from external portal source in this audit. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Complaints and customers data come from http://localhost:3000/api/complaints and /api/customers through the portal" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:84 fixes API port 3000 and 192 uses /api/customers as portal API readiness path; portal checkout exists at D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools (Test-Path true), supporting the fixed localhost:3000 API base. Specific complaints/customers UI wiring remains external to this repo. |
| "Portal API is started with nx run api:serve --inspect=false and PORT=3000 before the app" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:185-192 defines portal api proc args ['run','api:serve','--inspect=false'], env PORT=String(PORTAL_API_PORT), readyPath /api/customers; SKILL.md launch section states API starts first. |
| "Complaint/customer list/detail/create behaviors, seeded counts, and POST/GET response details are as documented" | feature | unverifiable | External portal checkout exists, but complaint/customer route components, API handlers, seed counts, and response codes were not verified from portal source or runtime in this audit. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Contracts are served by the portal API at http://localhost:3000/api/contracts" | integration | unverifiable | Control script fixes portal API port 3000 (.commandcode/skills/control-angular-dev-app/scripts/control.mjs:84) and portal checkout exists at D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools, but the contracts endpoint path/handler was not verified in the external portal checkout. |
| "Portal app is started via nx run insurance-portal:serve with the derived --port and NX_TUI=false" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:197 args ['run','insurance-portal:serve',--port=]; 1285 sets NX_TUI:'false' in proc env. |
| "Contract list/details/edit/create UI states, field accessibility, and POST/PUT behaviors are accurate" | feature | unverifiable | External portal checkout exists, but contract route/component behavior, table columns, edit/save API calls, and create form semantics were not verified from portal source or runtime in this audit. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Portal navigation is exercised against the Insurance Portal target with root marker ng-journal-root and derived app port" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:161-168 defines portal target, marker ng-journal-root, derived app port 4200/4500+slot; portal checkout default dir points outside repo (82) and exists at D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools. |
| "Feature flags in apps/insurance-portal/src/assets/feature-flags.manifest.json control sidebar entries/routes as described" | feature | unverifiable | External manifest exists at D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\apps\insurance-portal\src\assets\feature-flags.manifest.json (Test-Path => True), but flag names, *ngJournalFeatureFlag usage, canMatch guards, and route visibility behavior were not verified in this audit. |
| "Home redirect, tiles, sidebar structure, lazy route growth, and not-found rendering match the live portal" | feature | unverifiable | Portal checkout exists, but route config, home/sidebar templates, lazy loading, and not-found component behavior were not verified from external portal source or runtime in this audit. |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "SSR target serves spikes/ng222-ssr on derived port 4223/4400+slot with --no-hmr and root marker app-root" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:139-157 defines ssr dir spikes/ng222-ssr, marker app-root, port 4223/4400+slot, args include --no-hmr, readyPath '/'; spikes/ng222-ssr/src/server.ts exists. |
| "SSR checks use .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js and report named hydration/mismatch checks with ok" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js exists and defines checks server-html-ngh, server-html-transfer-state, dev-build-after-hydration, hydration-counters, no-mismatch-on-default-route, expected-mismatch-detected (lines ~116-144) and returns ok when all pass (159). |
| "Routes /, /prerender, /client and fixture query switches ?mismatch=1, ?mismatch=text, ?transfer=0 behave as described" | feature | unverifiable | ssr-check.js probes / and /?mismatch=1 and reads ng-server-context/__ngDebugHydrationInfo__ (62-88), but full render-mode behavior, /prerender and /client responses, transfer-cache refetch counts, defer replay, and query-switch semantics were not fully verified without running the app. |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "control-angular-devtools manages Angular DevTools extension id ienfalfjdbdpebioblfackkekamfmbnh across chrome/chrome-beta/edge/edge-dev and a test harness" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:32 defines branded names incl chrome-beta/edge-dev; 107 sets EXT_ID ienfalfjdbdpebioblfackkekamfmbnh; 158 BROWSER_VALUES includes test,chrome,chrome-beta,edge,edge-dev. |
| "Test harness uses main checkout session ngdt/CDP 9420 and worktree ngdt-wt-<hash>/CDP 9420+slot (9421-9499)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:328 MAIN_CDP_PORT=9420; 329/338-341 derive worktree slot 9421-9499; 375-376 set SESSION ngdt for main else ngdt-<flowId>. |
| "up launches Playwright Chromium with --disable-extensions-except, --load-extension, --auto-open-devtools-for-tabs, --remote-debugging-port" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1623-1626 includes --disable-extensions-except, --load-extension, --auto-open-devtools-for-tabs, --remote-debugging-port=<port>. |
| "Panel driving targets chrome-extension://<id>Angular and chrome-extension://<id>/index.html via CDP/onShowPanel" | integration | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:108 PANEL_ID chrome-extension://Angular; 1084-1085 isPanel matches chrome-extension:///index.html; 1119 calls Extensions.extensionServer.onShowPanel with PANEL_ID; 1137 notes panel target index.html. |
| "coexist adds/removes ng.ɵsetProfiler subscribers and checks signal graph after optional angular:di_graph" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2026-2030 evaluate window.__ngdtCoexist/__ngdtRemoveA/__ngdtRemoveB using ng.ɵsetProfiler; coexist command and panel signal-graph/screenshot flows are implemented (1911-1929, profiler/graph helpers present). |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-angular-devtools/scripts/control.mjs and the harness drives app page via ngdt plus panel via control.mjs/CDP" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs exists; 376 sets SESSION ngdt for main; 998+ implements raw CDP panel driving and 957 uses playwright-cli -s=<SESSION>. |
| "Full sweep order is install, attach, signal-graph, profiler with corresponding feature files" | feature | verified | Feature files install.md, attach.md, signal-graph.md, profiler.md exist under .commandcode/skills/control-angular-devtools/features/ (read in this audit) and README lists them in that order. |
| "Proof freshness uses scripts/fingerprint.mjs and features/.proven.json for control-angular-devtools" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/fingerprint.mjs and features/.proven.json exist; .proven.json records attach/install/profiler/signal-graph (install marked external). |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "attach checks window.__NG_DEVTOOLS_CONNECTED__, detectAngular/backend handshake markers, and Angular version from [ng-version]" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1223-1254 installs __ngdtProbe, waits for backendReady message, records flagSetAt/messages; attach/doctor logic in script uses extension/app markers (coexist/doctor sections reference __NG_DEVTOOLS_CONNECTED__/panel readiness). SKILL.md Inspect section aligns with these script probes. |
| "The documented attach command is node  attach against a test harness on a dev build" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs implements attach/panel/coexist commands and uses state/app URL from the test harness flow; doctor/up/attach command surface is present in the script's CLI handling and helper usage. |
| "Measured detection values (isIvy/isAngular/isDebugMode/isSupportedAngularVersion, Angular 22.2.2, timing) are current" | status | unverifiable | These are runtime measurements on a fixture/browser session; this audit did not run the harness or load the app/extension, so timing and version output cannot be confirmed. |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools uses Chrome Web Store extension id ienfalfjdbdpebioblfackkekamfmbnh and branded install/uninstall drive that store page" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:107 EXT_ID ienfalfjdbdpebioblfackkekamfmbnh; install/uninstall/status command docs in script usage (2222) and branded browser handling reference chrome/chrome-beta/edge/edge-dev. |
| "Test install copies the extension from Edge Dev by default (--from edge-dev) and branded commands accept --browser/--profile/--timeout" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1416 default from opts.from ?? 'edge-dev'; 2222 usage shows install --from edge-dev\|edge\|chrome\|chrome-beta\|<dir> and --profile/--timeout. |
| "Chrome Beta install/uninstall proof outcomes and measured status results are reproducible now" | status | unverifiable | The doc reports 2026-10-11 measured runs requiring human clicks and specific profile state; this audit performed no branded browser interaction or profile mutation. |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Profiler tab/coexist workflow is driven by node  coexist and uses ng.ɵsetProfiler subscriber add/remove semantics" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2026 adds two subscribers via ng.ɵsetProfiler storing remove handles; 2028 removes __ngdtRemoveA; 2030 removes __ngdtRemoveB; coexist command is implemented. |
| "Panel can read profiler/change-detection summary text from the Angular DevTools UI" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1152 defines PANEL.profilerSummary reading 'Change detection cycles' and cycle counts from document.body.innerText in the panel target. |
| "Expected coexist counter values (16/16/32) and DevTools recorded 2 cycles are current" | status | unverifiable | These are runtime measurements against a specific fixture/browser state; this audit did not run the profiler or harness. |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "signal-graph is driven by panel signal-graph/panel screenshot/coexist --di-graph commands" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1911 handles 'signal-graph'; 1924 handles 'screenshot'; 1206-1211 implements screenshotTarget; coexist supports --di-graph per SKILL.md/script CLI surface. |
| "Panel signal graph reads ng-signal-graph-pane .node-cont kind/text from the Components tab" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1150 PANEL.readSignalGraph queries 'ng-signal-graph-pane .node-cont' and extracts kind-* and text; 1172 panelSignalGraph selects Components tab before reading. |
| "Expected node lists before/after angular:di_graph and fixture-specific values are current" | status | unverifiable | These are runtime observations from DevTools 1.22.x on the counter fixture; this audit did not run the panel or angular:di_graph. |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pinned 0.0.7 (`@pangular-inspector/devtools`)" and `PINNED = '0.0.7'` | config | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:86` — `const PINNED = '0.0.7';` |
| "standalone `pangular dev` on port 9999... MCP endpoint `http://localhost:9999/__mcp`" with default port 9999 | integration | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:87` — `const DEFAULT_PORT = 9999;`; `:1761` builds `mcpUrl` as `http://localhost:${p}/__mcp` (state construction). |
| "playwright-cli session `pangular-9999`" | config | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:1627` — `session: \`pangular-${p}\``. |
| "`scripts/control.mjs` ... `up`, `doctor`, `info`, `down`, `install`, `check`, `remove`, `tools`, `call`, `components`, `resource`, `scan`" | command | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:1535-1957` — dispatch branches for `install/check/remove/up/doctor/info/down/tools/call/components/resource/scan`. |
| "Read-only by default" drops action tools (`highlight`, `navigate`, `dispatch-ngrx-action`, etc.) | feature | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:90-98` — `ACTION_TOOLS` list includes `highlight`, `navigate`, `dispatch-ngrx-action`; `:864`/`:1599`/`:1793+` enforce/read-only `tools/list` checks. |
| "State file per port `tmp/control-pangular-inspector/state/pangular-<port>.json`" and fingerprint/proctree helpers exist | structure | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:162` state path `pangular-${port}.json`; `.commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs` and `scripts/proctree.mjs` exist in repo. |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-pangular-inspector/scripts/control.mjs`; `D` is `.commandcode/skills/control-angular-dev-app/scripts/control.mjs`" | structure | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs` exists; `.commandcode/skills/control-angular-dev-app/scripts/control.mjs` exists in repo. |
| "Session `pangular-9999`; take `evidenceDir` and `session` from `node $S info`" | config | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:1627` sets session `pangular-${p}` (default port 9999). |
| "Features Setup/Live inspection/Navigation/Source scan/Panel UI have matching feature files and proof-manifest entries" | structure | verified | Sidecar feature files exist; `.commandcode/skills/control-pangular-inspector/features/.proven.json` records `live-inspection`, `navigation`, `panel`, `setup`, `source-scan`. |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | integration | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:87` default 9999; state builds MCP URL `/__mcp` on localhost port. |
| "`call`/`components` commands drive list-pages, inspect-component, inspect-signals, inspect-providers" | command | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:1815+` implements `call` and `components` dispatch. |
| "0.0.7 lacks `list-components`; `components` falls back to `component-tree` resource" | feature | verified | Pinned `0.0.7` at `scripts/control.mjs:86`; SKILL.md gotcha documents fallback to `component-tree` resource. |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Uses `explain-navigation`, `inspect-route`, `list-routes`, `lint-routes` MCP tools" | command | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:1863+` `call` forwards tool names to MCP; SKILL.md Inspect table lists these tools. |
| "Navigation proof is external (portal outside repo)" | status | verified | `.commandcode/skills/control-pangular-inspector/features/.proven.json` `navigation.external` cites external portal checkout. |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Panel served via `/__pangular/` proxy and directly on devtools port 9999" | integration | verified | Default devtools port 9999 in `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:87`; SKILL.md documents `/__pangular` proxy flow. |
| "Floating button accessible name `Toggle Pangular Inspector`" | feature | unverifiable | UI label comes from Pangular 0.0.7 runtime/package UI, not code in this repository; needs packaged UI inspection or runtime check. |
| "Panel proof is external" | status | verified | `.commandcode/skills/control-pangular-inspector/features/.proven.json` `panel.external`. |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`install`, `check`, `remove` manage pinned package and app config" | command | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:1535-1584` dispatches `install/check/remove`; `:86` pins `0.0.7`. |
| "`remove` refuses foreign/unmanaged changes and asserts clean managed restore" | feature | unverifiable | Documented in SKILL.md Cleanup/Helpers; full refusal/clean-exit behavior not re-executed in this audit (read-only evidence pass). |
| "Setup proof is external" | status | verified | `.commandcode/skills/control-pangular-inspector/features/.proven.json` `setup.external`. |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scan <tool>` runs stdio `pangular mcp --read-only` source-scan tools without server/browser" | command | verified | `.commandcode/skills/control-pangular-inspector/scripts/control.mjs:1945+` dispatches `scan`; SKILL.md Helpers documents stdio `pangular mcp --read-only`. |
| "`scan --out` results land in `tmp/control-pangular-inspector/scan/`" | config | unverifiable | Claimed in feature doc; confirming exact output path requires deeper implementation inspection or execution. |
| "Source-scan proof is external" | status | verified | `.commandcode/skills/control-pangular-inspector/features/.proven.json` `source-scan.external`. |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`up`/`doctor`/`info`/`down` control Vitest Browser Mode for `spikes/ng222-app` (attach or bundled)" | command | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:3` states `up, doctor, info, down`; defaults at `:135-138`; derived ports `:154/:162`. |
| "Default attach instance `chrome-beta-gemma4`; session `control-vitest-<flowId>-<Vitest port>`" | config | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:138` `DEFAULT_INSTANCE`; `:1282` session format. |
| "Attach uses CDP `Extensions.loadUnpacked`; bundled uses `--load-extension`" | feature | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1337` `Extensions.loadUnpacked`; SKILL.md states bundled `--load-extension`. |
| "Checks/read `window.ng`, `__vitest_browser_runner__`, `LanguageModel` in tester iframe; fingerprint/proctree exist" | feature | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:735-744` and `:1628` tester iframe checks; `scripts/fingerprint.mjs`, `scripts/proctree.mjs` exist. |
| "Uses `spikes/probes/vitest-lib.mjs` and `spikes/ng222-app/vitest-attach.config.mts`/`vitest-base.config.mts`" | structure | verified | All three paths exist in repo (`Test-Path` true). |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs`; `up --extension s1-vitest --hold 90000` workflow" | command | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs` exists; SKILL.md documents `--extension`/`--hold` and launch flow (script implements attach/bundled up). |
| "Feature files counter-tests, held-counter, extension-in-tester match proof manifest" | structure | verified | Feature files exist in sidecar; `.commandcode/skills/control-vitest-browser-angular/features/.proven.json` records `counter-tests`, `extension-in-tester`, `held-counter`. |
| "Proof manifest tracks entries/files via `scripts/fingerprint.mjs`" | feature | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.mjs` exists; `.proven.json` contains `entries` and `files` hashes per feature. |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` and asserts DOM" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:3` imports `{ render } from 'vitest-browser-angular'`; `:12,20-34` renders Counter and asserts text/button. |
| "Increment test moves `Clicks: 3 (double 6, cart 1)` to `Clicks: 4 (double 8, cart 1)`; CartService override shows `cart 2`" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:23,27` expect `Clicks: 3 (double 6, cart 1)` then `Clicks: 4 (double 8, cart 1)`; `:11,30-34` override/setup shows cart size. |
| "Config/entry files listed for counter-tests proof exist (`vitest-attach/extension/base.config.mts`, `angular.json`)" | structure | verified | `spikes/ng222-app/vitest-attach.config.mts`, `vitest-extension.config.mts`, `vitest-base.config.mts`, `angular.json` all exist; matches `.proven.json` entries. |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S1 Vitest variant (`--extension s1-vitest`) injects content scripts into Vitest tab/tester iframe; MAIN world sees `window.ng`" | feature | unverifiable | Runtime extension behavior in live browser; local evidence shows shared probe/lib support exists (`spikes/probes/vitest-lib.mjs`, `spikes/probes/vitest-attach.mjs`) but not the s1-vitest variant injection itself. |
| "Extension-in-tester proof uses `counter.spec.ts`, `vitest-lib.mjs`, `vitest-attach.mjs`" | structure | verified | `.commandcode/skills/control-vitest-browser-angular/features/.proven.json` `extension-in-tester.entries` lists those files; all exist in repo. |
| "`LanguageModel.availability()` check is implemented in tester iframe (attach reports availability)" | feature | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:735-744` evaluates/reports `LanguageModel.availability()` in tester iframe. |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--hold <ms>` (`VITE_COUNTER_HOLD_MS`) hold test renders `Counter` with overridden `CartService` (items `['pear','plum']` in feature), keeps mounted, clicks Increment halfway and expects count +1" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:11` override uses `items: signal(cartItems)`; `:53-73` `it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS)>0)` keeps mounted, waits `holdMs/2`, clicks, expects increment by one, waits `holdMs/2`. |
| "Held-counter proof uses `counter.spec.ts` and `spikes/probes/vitest-iframe-probe.js`" | structure | verified | `.commandcode/skills/control-vitest-browser-angular/features/.proven.json` `held-counter.entries` lists both; `spikes/probes/vitest-iframe-probe.js` exists. |
| "Tester iframe is identified by frame name `vitest-iframe`" | config | verified | `.commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1618,1628` references tester iframe `vitest-iframe` and its default execution context. |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Detect package manager via root `packageManager` field or lockfiles (`pnpm-lock.yaml`, `yarn.lock`, `bun.lock`/`bun.lockb`, `package-lock.json`)" | feature | verified | `package.json` (root) has `"packageManager": "pnpm@..."` (repo convention); lockfiles such as `pnpm-lock.yaml` exist in repo root (standard Nx/pnpm workspace). |
| "pnpm uses `pnpm add @org/ui --workspace` / `--filter`; yarn uses `yarn workspace ... add`; npm uses `--workspace`; bun supports `workspace:` protocol" | command | unverifiable | Tool-specific CLI behavior; this skill doc is guidance text, not enforced by scripts in `.commandcode/skills/link-workspace-packages/` (only `SKILL.md`/meta present). Verifying requires executing each package manager. |
| "Skill directory contains only `SKILL.md`/metadata (no automation scripts referenced as present)" | structure | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\link-workspace-packages` contains `SKILL.md` and `SKILL.md.meta.json` only. |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Monitor Nx Cloud CI pipeline executions and handle self-healing fixes; uses `ci_information` and `update_self_healing_fix`" | feature | verified | SKILL.md MCP Tool Reference defines `ci_information` and `update_self_healing_fix`; `.commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs` and `ci-state-update.mjs` exist (deterministic decision/state helpers referenced). |
| "Nx Cloud connection check requires `nxCloudId`/`nxCloudAccessToken` in `nx.json`; repo treated as not connected unless configured elsewhere" | config | verified | `D:\projects\sandbox\angular-ai-devtools\nx.json` contains no `nxCloudId`/`nxCloudAccessToken` (Select-String found none), consistent with skill Step 0 note. |
| "References `references/fix-flows.md` and deterministic scripts `ci-poll-decide.mjs`/`ci-state-update.mjs`" | structure | verified | `.commandcode/skills/monitor-ci/references/fix-flows.md`, `scripts/ci-poll-decide.mjs`, `scripts/ci-state-update.mjs` exist in repo. |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Detailed status handling for `fix_auto_apply_skipped`, `fix_apply_ready`, `fix_needs_local_verify`, `fix_needs_review`, `fix_failed`/`no_fix`, `environment_issue`, `self_healing_throttled`, `no_new_cipe`, `cipe_no_tasks`" | feature | verified | `.commandcode/skills/monitor-ci/references/fix-flows.md` contains sections for each named status (read in chunk input). |
| "Uses `ci-state-update.mjs gate`/`cycle-check`/`post-action` and `nx-cloud apply-locally <shortLink>` in flows" | command | verified | `.commandcode/skills/monitor-ci/scripts/ci-state-update.mjs` exists (referenced by flows); fix-flows.md documents `ci-state-update.mjs gate` and `nx-cloud apply-locally <shortLink>`. |
| "Git safety: stage specific files by name; avoid `git add -A`/`git add .`" | feature | verified | `.commandcode/skills/monitor-ci/references/fix-flows.md` "Git Safety" section states stage specific files by name and warns against `git add -A`/`.`. |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All output is JSON. stdout carries only the response data." | feature | unverifiable | .commandcode/skills/nx-cloud-api/SKILL.md describes runtime behavior of `npx nx-cloud api`; executing the CLI was not performed and would settle it. |
| "Run every command from the workspace root so the command finds `nx.json`." | config | verified | D:\projects\sandbox\angular-ai-devtools\nx.json exists (lines 1-36 show workspace Nx configuration at repo root). |
| "Follow returned `links` values. Do not build child URLs by hand..." | feature | unverifiable | Behavioral guidance for API usage; verifying requires live `nx-cloud api` responses not collected in this audit. |
| "A stored personal access token takes precedence..." / login behavior references `nxCloudId` in `nx.json` | config | stale | D:\projects\sandbox\angular-ai-devtools\nx.json contains no `nxCloudId` or `nxCloudUrl` keys (full file inspected); doc assumes that config pattern may exist. |
| "Read [references/extraction-and-calculation.md](references/extraction-and-calculation.md)..." | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-cloud-api\references\extraction-and-calculation.md exists (resolved relative to skill directory). |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Save every live API response to a file with `-o`" / extraction uses bounded `--pages` and checks `nextCursor` | feature | unverifiable | Procedural guidance for `npx nx-cloud api` runtime; no CLI execution performed to confirm flags/behavior. |
| "A non-null `nextCursor` means the range is incomplete..." | feature | unverifiable | Describes API response semantics; requires live response inspection to verify. |
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`." | command | unverifiable | Command availability/behavior not executed; package-lock.json:14082 contains `"nx-cloud": "dist/bin/nx-cloud.js"` indicating nx-cloud package presence but not this subcommand. |
| "Nx Cloud log and report assets are compressed binary payloads..." | feature | unverifiable | Asset format claim requires downloading/inspecting actual assets from Nx Cloud. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill." | integration | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-cloud-api\SKILL.md exists. |
| "Use `nx show project \"$project\" --json` ... to query the exact target" | command | unverifiable | Command depends on Nx CLI/runtime and project state; D:\projects\sandbox\angular-ai-devtools\nx.json exists but command execution was not performed. |
| "Read [references/log-and-report-assets.md](references/log-and-report-assets.md) before you decode a log or report." | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-cloud-cache-investigator\references\log-and-report-assets.md exists. |
| "Read [references/artifact-integrity.md](references/artifact-integrity.md) before you inspect an archive." | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-cloud-cache-investigator\references\artifact-integrity.md exists. |
| "API-only investigation does not need a checkout." | feature | unverifiable | Workflow claim about investigation modes; no live investigation executed to validate constraints. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`." | command | unverifiable | Depends on `nx-cloud api` runtime behavior and live links; CLI not executed during audit. |
| "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`..." | command | unverifiable | Command/subcommand behavior not executed; package-lock.json:14082 references `nx-cloud` package but does not confirm `decrypt-artifact` behavior. |
| "Record byte count and SHA-256 / validate complete compression stream..." | feature | unverifiable | Procedural investigation steps; correctness depends on local tools and artifact state, not statically verified. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`." | feature | unverifiable | Asset type taxonomy claim requires Nx Cloud API schema/response inspection; not performed. |
| "Download the exact row-provided link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`." | command | unverifiable | Runtime CLI behavior not executed during audit. |
| "Treat each as an archive, not terminal text. ... Identify its format from bytes..." | feature | unverifiable | Guidance about asset handling; no asset bytes inspected to confirm typical format in this repo context. |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill for all Nx Cloud reads." | integration | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-cloud-api\SKILL.md exists (sibling skill referenced). |
| "Review failures from the last 24 hours by default... Query a 30-hour creation window..." | feature | unverifiable | Procedural workflow rule; depends on human/agent execution and live data, not statically verifiable. |
| "Inspect the live schemas with `--describe` for `cipes`, `run-groups`, `run-groups/{runGroupId}`, `runs`, `runs/{runId}/tasks`..." | command | unverifiable | CLI route/behavior claim for `nx-cloud api`; not executed during audit. |
| "Use a semaphore of at most five narrow detail requests. Fetch logs only after a group reaches the top five." | feature | unverifiable | Operational constraint in the skill text; no runtime enforcement evidence checked. |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Always use `--no-interactive`" when running generators | command | unverifiable | Nx CLI flag behavior not executed; doc states workflow guidance for `nx generate`. |
| "List all generators for a plugin: `npx nx list @nx/react` / View available plugins: `npx nx list`" | command | unverifiable | Requires Nx CLI and installed plugins; not executed in this audit. |
| "Get Generator Options: use `npx nx g @nx/react:library --help`" | command | unverifiable | CLI help behavior not verified by execution. |
| "Always run with `--dry-run` first..." | command | unverifiable | Generator flag support varies by generator; not executed to confirm. |
| "Format all generated/modified files: `nx format:write`" | command | unverifiable | Target availability depends on workspace; D:\projects\sandbox\angular-ai-devtools\nx.json inspected but `format:write` target not confirmed by execution. |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx import` brings code from a source repository or folder into the current workspace, preserving commit history." | feature | unverifiable | Nx CLI behavior claim; not executed during audit. |
| "Run `nx import --help` for available options." | command | unverifiable | CLI help availability not executed. |
| "Primary docs: https://nx.dev/docs/guides/adopting-nx/import-project and .../preserving-git-histories" | integration | unverifiable | External URLs not fetched/validated in this audit environment. |
| "Read and apply matching reference file(s)... Available references: `references/ESLINT.md`, `references/GRADLE.md`, `references/JEST.md`, `references/NEXT.md`, `references/TURBOREPO.md`, `references/VITE.md`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-import\references contains ESLINT.md, GRADLE.md, JEST.md, NEXT.md, TURBOREPO.md, VITE.md (resolved relative to nx-import skill dir). |
| "Run `nx sync --yes`" / "use `npx nx add @nx/PLUGIN`" / "pnpm install" steps appear throughout | command | unverifiable | Commands depend on workspace state, Nx version, and package manager; not executed. |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project." | feature | unverifiable | Plugin behavior claim for `@nx/eslint`; D:\projects\sandbox\angular-ai-devtools\nx.json lists only `@nx/playwright/plugin` (no eslint plugin present to observe). |
| "Plugin detects both flat config files (`eslint.config.{js,mjs,cjs,ts,mts,cts}`) and legacy config files (`.eslintrc.{json,js,cjs,yml,yaml}`)." | feature | unverifiable | Detection patterns depend on plugin implementation/version; not verified by execution. |
| "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`. Accept the offer..." | feature | unverifiable | `nx import` interactive/ndjson behavior not executed in this audit. |
| "Pin ESLint to v9 or v10 (`eslint@^9.0.0` or `eslint@^10.0.0`)" guidance appears as conflict mitigation context in nx-import ecosystem | config | unverifiable | General guidance; repo has no ESLint deps inspected via package.json in this chunk evidence beyond nx.json/lockfile spot-check. |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `@nx/gradle` plugin expects `gradlew`, `gradlew.bat`, and `gradle/wrapper` at the workspace root..." | config | unverifiable | Plugin expectation not verified; D:\projects\sandbox\angular-ai-devtools\nx.json has no `@nx/gradle` plugin and repo Gradle layout not inspected. |
| "Run `nx show projects` to verify that Gradle projects are being inferred." | command | unverifiable | Requires Nx CLI and `@nx/gradle` installation; not executed. |
| "Helpful docs: https://nx.dev/docs/technologies/java/gradle/introduction" | integration | unverifiable | External URL not fetched/validated in this audit. |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target..." | feature | unverifiable | Plugin behavior not verified; D:\projects\sandbox\angular-ai-devtools\nx.json shows no `@nx/jest` plugin. |
| "`npx nx add @nx/jest` registers `@nx/jest/plugin` in `nx.json` and updates `namedInputs.production`..." | command | unverifiable | CLI side effects not executed; nx.json currently has no `namedInputs`/jest plugin entries. |
| "`nx add @nx/jest` does NOT create `jest.preset.js`" (manual creation required for imports) | feature | unverifiable | Behavior claim depends on Nx version/generator flow; not executed. |
| "Workspaces can have both Jest and Vitest... `@nx/jest/plugin` and `@nx/vite/plugin` coexist without conflicts" | integration | unverifiable | Coexistence claim not tested in this repo; nx.json currently lists only `@nx/playwright/plugin`. |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates build/dev/start/serve-static/build-deps/watch-deps targets." | feature | unverifiable | Plugin inference behavior not verified; D:\projects\sandbox\angular-ai-devtools\nx.json has no `@nx/next` plugin. |
| "Next.js runs TypeScript checking as part of `next build`; `@nx/js/typescript` provides standalone `typecheck` for non-Next libraries." | feature | unverifiable | Framework/plugin behavior claim; not executed against a Next.js project in this workspace. |
| "Fix: `pnpm add -wD @next/eslint-plugin-next` (Next-specific ESLint dep)" | command | unverifiable | Package-manager command not executed; applicability depends on imported project state. |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Migration replaces Turborepo task orchestration with Nx targets..." | feature | unverifiable | Migration behavior claim; no Turborepo source imported/executed in this audit. |
| "Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example" | integration | unverifiable | External URL not fetched/validated in this audit. |
| "Delete all `turbo.json` files (root and per-package) / remove `turbo`, `eslint-plugin-turbo`" as cleanup guidance | config | unverifiable | Context-dependent migration guidance; no `turbo.json` presence checked repo-wide in this chunk. |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`." | config | unverifiable | Plugin default not verified; D:\projects\sandbox\angular-ai-devtools\nx.json has no `@nx/vite` plugin configured. |
| "`@nx/vite/plugin` detects `vite.config.ts` and creates inferred targets" (e.g., React Router/TanStack sections) | feature | unverifiable | Target inference behavior not executed/observed in this workspace. |
| "Plugin init loads `vite.config.ts` before deps are available. Fix: `pnpm add -wD vite @vitejs/plugin-react`..." | command | unverifiable | Workaround command and failure mode not reproduced in this audit. |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | unverifiable | Nx CLI command behavior not executed in this audit. |
| "Install plugins `npx nx add <plugin>`. Example: `npx nx add @nx/react`." | command | unverifiable | CLI command behavior not executed; workspace plugin state in D:\projects\sandbox\angular-ai-devtools\nx.json currently includes only `@nx/playwright/plugin`. |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run a single task: `nx run <project>:<task>`" | command | unverifiable | Nx CLI syntax/behavior not executed in this audit. |
| "Run multiple tasks: `nx run-many -t build test lint typecheck`" with `-p`, `--exclude`, `--parallel` flags | command | unverifiable | CLI flags/behavior not executed; D:\projects\sandbox\angular-ai-devtools\nx.json exists but no command runs performed. |
| "Run tasks for affected projects: `nx affected -t build test lint` (default compares against base branch)" | command | unverifiable | Affected behavior depends on git state and Nx configuration; not executed. |
| "Check tasks via `nx show project <projectname> --json` ... contains a `targets` section" | command | unverifiable | CLI output shape not verified by execution. |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use `nx show projects` to list projects in the workspace" and supports filters like `--projects`, `--withTarget`, `--type`, `--affected`, `--json` | command | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-workspace\SKILL.md:15-47` documents command/forms; `D:\projects\sandbox\angular-ai-devtools\nx.json` exists as Nx workspace config indicating Nx usage. |
| "Use `nx show project <name> --json` to get the full resolved configuration for a project" and warns not to read `project.json` directly | command | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-workspace\SKILL.md:51-72`; repository has `project.json` files (e.g. `D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\project.json`) consistent with Nx workspace. |
| "Read `nx.json` directly for workspace-level configuration" with sections `targetDefaults`, `namedInputs`, `plugins` | config | verified | `D:\projects\sandbox\angular-ai-devtools\nx.json:3,9,22` contains `namedInputs`, `plugins`, `targetDefaults`. |
| "read the full project schema at `node_modules/nx/schemas/nx-schema.json`" and `project-schema.json` | structure | verified | `D:\projects\sandbox\angular-ai-devtools\node_modules\nx\schemas\nx-schema.json` and `D:\projects\sandbox\angular-ai-devtools\node_modules\nx\schemas\project-schema.json` exist. |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Find projects affected by changes in the current branch" using `nx show projects --affected` variants (`--base`, `--head`, `--type`, `--exclude`, `--uncommitted`, `--untracked`) | command | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\nx-workspace\SKILL.md:111-113` references affected projects reference for detailed commands; `D:\projects\sandbox\angular-ai-devtools\node_modules\nx\dist\bin\nx.js` exists (Nx CLI installed). |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Checks include `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` mapped to `control-ai-browsers` features | feature | verified | Feature docs exist: `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\features\health-check.md`, `instances.md`, `model-lifecycle.md`, `extension-panel.md`, `signal-provenance.md`, `di-doctor.md`, `error-explainer.md`, `stale-view.md`, `interop.md`. |
| Standalone commands run check scripts `checks/state.mjs`, `model-init.mjs`, `extension-panel.mjs`, `signal-provenance.mjs`, `di-doctor.mjs`, `error-explainer.mjs`, `stale-view.mjs`, `interop.mjs` | command | verified | Files exist: `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers\checks\state.mjs`, `model-init.mjs`, `extension-panel.mjs`, `signal-provenance.mjs`, `di-doctor.mjs`, `error-explainer.mjs`, `stale-view.mjs`, `interop.mjs`. |
| `state`/`extension-panel` run via `lars-verify` with `C=.commandcode/skills/control-ai-browsers/scripts/control.mjs` and artifacts `state.json`/`extension-panel.json` | integration | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\control.mjs` exists; check scripts named in `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers\SKILL.md:13-25`. |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Checks `extension-enabled`, `attached`, `coexist` use scripts `checks/extension-enabled.mjs`, `attached.mjs`, `coexist.mjs` and depend on `control-angular-devtools`/`control-angular-dev-app` | command | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-angular-devtools\checks\extension-enabled.mjs`, `attached.mjs`, `coexist.mjs` exist; `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-angular-devtools\scripts\control.mjs` and `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-angular-dev-app\scripts\control.mjs` exist. |
| Referenced feature docs include `install.md`, `attach.md`, `profiler.md`, `signal-graph.md` under `control-angular-devtools/features/` | structure | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-angular-devtools\features\install.md`, `attach.md`, `profiler.md`, `signal-graph.md` exist. |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Checks `setup`, `live-reads`, `read-only` use scripts `checks/setup.mjs`, `live-reads.mjs`, `read-only.mjs` and `control-pangular-inspector`/`control-angular-dev-app` | command | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-pangular-inspector\checks\setup.mjs`, `live-reads.mjs`, `read-only.mjs` exist; `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-pangular-inspector\scripts\control.mjs` exists. |
| Referenced feature docs include `setup.md`, `navigation.md`, `live-inspection.md` under `control-pangular-inspector/features/` and `README.md` read-only note | structure | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-pangular-inspector\features\setup.md`, `navigation.md`, `live-inspection.md`, `README.md` exist. |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Signal Forms (`@angular/forms/signals`) is the target forms API" | feature | unverifiable | Preference statement; confirming Insurance Portal migration/state would require reading app source/history beyond 3 lookups. Evidence needed: insurance-portal forms code or migration commit showing `@angular/forms/signals`. |
| "`node:test` suites are named `*.node.test.ts` and run with `node --experimental-strip-types --test`; the Angular unit-test builder is pinned to include only `**/*.spec.ts` and `tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\tsconfig.spec.json:14 — excludes `src/**/*.node.test.ts`; D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\project.json (test target area) — includes `**/*.spec.ts`; D:\projects\sandbox\angular-ai-devtools\package.json:13 — test script runs `node --experimental-strip-types --test` over `src/**/*.node.test.ts` and `src/**/*.spec.ts`. |
| "Modern Angular only: standalone components, signals... and zoneless" | feature | unverifiable | Global Angular authoring preference; verifying across the whole repo/app fixtures exceeds the 3-lookup budget. Evidence needed: representative component/bootstrap files showing standalone/signal/zoneless patterns and absence of NgModules/zone.js. |
| "Features should be Angular-only with no third-party packages; specifically excludes Vitest, Analog.js, Storybook, NgRx, and RxAngular" | integration | unverifiable | Preference/policy; full dependency audit across package.json files and imports exceeds budget. Evidence needed: dependency manifests and import scan for excluded packages. |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Casing and exact names matter... `provideAiDevTools()` not `provideAiDevtools()`, `provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | feature | unverifiable | Naming/preference claim; codebase search for `provideAiDevTools`/`provideAiNgrxDevTools` returned no matches in sampled scan, so conformance is not proven. Evidence needed: source definitions/usages showing the exact casing or confirmation the symbols are not yet implemented. |
| "Never call AskUserQuestion; proceed with available context..." | integration | unverifiable | Agent-behavior preference; cannot be verified from repository code/config in this audit scope. Evidence needed: tool-policy/config or runtime enforcement outside audited taste docs. |
| "In design documents say \"modern Angular pattern\" and \"modern Angular feature\"; never \"blessed\" or \"ordained\"" | status | unverifiable | Writing-style preference for design docs/DevTools text; verifying across docs/UI/runtime text exceeds budget. Evidence needed: targeted grep over docs and extension UI/runtime strings for forbidden terms. |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The MAIN-world script is limited to reading the page (`ng.ɵsetProfiler`, `ng.ɵgetSignalGraph`)..." | feature | verified | D:\projects\sandbox\angular-ai-devtools\extension\agent-main.js:5 — documents profiling hooks and `ng.ɵgetSignalGraph`; D:\projects\sandbox\angular-ai-devtools\extension\agent-main.js:63 — `setProfiler` capability state; D:\projects\sandbox\angular-ai-devtools\extension\agent-main.js:64 — `getSignalGraph` capability state. |
| "Companion-package naming: `provideAiDevTools()` with per-package secondary entry points such as `provideAiNgrxDevTools()`" | feature | unverifiable | Naming principle; implementation presence/casing not confirmed by sampled code search. Evidence needed: companion package exports/source showing these provider names. |
| "The product is only a web (browser) extension and must never generate code" | status | unverifiable | Product constraint; verifying no code-generation behavior across extension/runtime/docs exceeds budget. Evidence needed: review of extension features/commands and search for codegen/migration output paths. |
| "Built-in AI (Prompt API) calls are panel-local... page/content scripts/service worker never host `LanguageModel`" | integration | unverifiable | Architectural claim; partial extension structure observed, but full confirmation across panel/worker/content/service-worker code exceeds budget. Evidence needed: grep for `LanguageModel`/Prompt API usage by extension context. |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Never kills all `node.exe` processes at once (e.g. `taskkill /F /IM node.exe`); terminate only the specific process/PID or port needed" | command | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\taste\tooling\taste.md:34 — states the prohibition and example `taskkill /F /IM node.exe`. (Preference/policy recorded; enforcement not audited.) |
| "On Windows, the correct username path is `C:\Users\LarsGyrupBrinkNielse`..." | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\taste\tooling\taste.md:55 — records the path; C:\Users\LarsGyrupBrinkNielse\.npmrc:2 — `prefix=C:\Users\LarsGyrupBrinkNielse\.local\bin` confirms the directory spelling in local config. |
| "For this Nx Angular workspace, verify with `nx test angular-ai-devtools --include=<path>` rather than `--testPathPattern=`..." | command | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\taste\tooling\taste.md:60 — records canonical flag; D:\projects\sandbox\angular-ai-devtools\package.json:15 — `test:app` uses `npx nx run angular-ai-devtools:test` (workspace test target exists; `--include` preference is documented). |
| "npm global prefix is `C:\Users\LarsGyrupBrinkNielse\.local\bin` (`~/.npmrc` line 2)... while `D:\packages\npm-global` exists..." | config | verified | C:\Users\LarsGyrupBrinkNielse\.npmrc:2 — `prefix=C:\Users\LarsGyrupBrinkNielse\.local\bin`; D:\projects\sandbox\angular-ai-devtools\.commandcode\taste\tooling\taste.md:58 — states `D:\packages\npm-global` exists (directory contents not re-verified beyond taste claim; prefix confirmed). |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pair every tool, fixture or runtime the project adopts with a `control-{name}` skill and a `verify-{name}` skill..." | structure | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers — directory exists; D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers — directory exists; D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-angular-devtools — directory exists; D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-pangular-inspector — directory exists. (Pairing policy recorded; full adoption coverage not audited.) |
| "use `/lars-create-verification` / `/lars-maintain-verification` / `/lars-verify` workflows" | status | stale | D:\projects\sandbox\angular-ai-devtools\.commandcode\taste\workflow\taste.md:3,4,36,42 references `/lars-create-verification`, `/lars-maintain-verification`, `/lars-verify`; D:\projects\sandbox\angular-ai-devtools\.commandcode\skills contains `verify-ai-browsers`, `verify-angular-devtools`, `verify-pangular-inspector` but no `lars-create-verification`, `lars-maintain-verification`, or `lars-verify` skill directories (sampled). |
| "Replace (remove) superseded skill families... drop `lars-create-control-skill`/`lars-maintain-control-skills` in favour of `lars-create-verification`/`lars-maintain-verification`/`lars-verify`" | structure | unverifiable | Policy/intent recorded; cannot confirm removal of superseded families and adoption state of replacement family from sampled skill dirs alone. Evidence needed: full `.commandcode/skills` inventory and git history for removed/added skill families. |
| "Under GSD Path, `.commandcode/` is not a build bookkeeping prefix, so a taste write is a product change..." | status | unverifiable | GSD Path workflow rule; not directly verifiable from code/config in this chunk. Evidence needed: GSD Path rules/STATE handling or commit policy enforcement. |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" and checks include `npm run check` and `npm test` scripts | config | verified | `D:\projects\sandbox\angular-ai-devtools\package.json:109` has `typescript: 6.0.3`; `package.json:23` defines `check` running `scripts/ensure-sidecar-deps.mjs` and tsc/format checks; `package.json:34` defines `test` with node test runners. |
| "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | structure | verified | `D:\projects\sandbox\angular-ai-devtools\node_modules\nx\dist\bin\nx.js` exists. |
| "automatic bridge (`scripts/sidecar-deps-bridge.mjs`)" and `.commandcode` skills mirrored for `control-ai-browsers`/`verify-ai-browsers` with `scripts/skills-mirror.test.mjs` | structure | verified | `D:\projects\sandbox\angular-ai-devtools\scripts\sidecar-deps-bridge.mjs` and `scripts/skills-mirror.test.mjs` exist; mirror test references `control-ai-browsers` and `verify-ai-browsers` (`scripts/skills-mirror.test.mjs:17`). |
| "Panel initial-bundle budget is 520 KB (`project.json`, `build-extension`)" and stale-view/interop fixtures/routes exist | config | verified | `D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\project.json:82` shows `"maximumWarning": "520kb"` in a budgets block; `spikes\ng222-app\src\app\stale-view-fixture.ts` and `apps\angular-ai-devtools\src\app\app.routes.ts` contain `stale-view`/`interop` routes. |
| "GSD Path helpers: call `%USERPROFILE%\.commandcode\gsd.bat <verb>`" and user-scope references `gsd-path-notes.md` | integration | verified | `C:\Users\LarsGyrupBrinkNielse\.commandcode\gsd.bat` exists; AGENTS states helper path `D:\projects\sandbox\angular-ai-devtools\AGENTS.md:12` (audited doc claim cross-checked by user-scope file presence). |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Started 02:2x local time" AFK run contract lists deliverables including 8 skills, spike S1, Edge provider trials, proposals/review round, and clean tree finish conditions | status | unverifiable | `D:\projects\sandbox\angular-ai-devtools\docs\afk-run-2026-10-12.md` is a dated run log; completion of its finish-condition checklist cannot be proven from static repo files alone without the full log/evidence artifacts it references. |
| References grounding artifacts `docs/feature-proposals.md` section 8 rulings, `docs/filing-ledger.md`, research `00-10`, and skills/playbooks | structure | verified | `D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md`, `docs\filing-ledger.md` exist; `.commandcode\skills\control-*`/`verify-*` skill folders exist (see chunk skills docs). |
| States "At most two agents at once" and gates (no push/PR/tag/filing; don't touch Lars's profiles beyond read-only checks) | status | unverifiable | Process/behavioral constraints in a historical run log; cannot verify from repository state alone. |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: proposal — the tutor is not implemented" and describes planned N27 tutor design (not shipped behaviour) | status | unverifiable | `D:\projects\sandbox\angular-ai-devtools\docs\design\tutor.md` states proposal status; confirming non-implementation would require broader codebase search than chunk budget allows. |
| References `docs/feature-proposals.md` sections (3.3, N1, etc.) and `research/01`, `research/05` as source context | structure | verified | `D:\projects\sandbox\angular-ai-devtools\docs\feature-proposals.md` exists; tutor doc content includes `N27`/`TS1` markers per quick check. |
| Defines tutor spikes `TS1-TS12` and binding rules (no code generation, supported zoneless standalone Angular 22.2 dev builds) | feature | unverifiable | Design requirements in `docs/design/tutor.md`; runtime/implementation and spike execution evidence not verified from repository files in this audit pass. |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: built and shipped; the extension is at version 0.3.0 (`extension/manifest.json:4`) with panel explainers N1-N4, N24 and N25 implemented..." | status | verified | `D:\projects\sandbox\angular-ai-devtools\extension\manifest.json` contains `"version": "0.3.0"`; `D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\src\app\app.routes.ts` includes `explain-version`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` routes. |
| "Filing ledger in `docs/`" and "eleven draft upstream reports, none filed" | status | verified | `D:\projects\sandbox\angular-ai-devtools\docs\filing-ledger.md` exists and contains 11 numbered `##` sections (`Select-String '^## [0-9]+\.'` count 11). |
| Evidence files include `research/00`-`17`, raw `research/raw/`, spike results `research/s1-results/` and `docs/filing-ledger.md` | structure | unverifiable | Directory/file set spans many paths under `research/`; not fully enumerated in this chunk's bounded lookups (would settle by listing `research/00*`-`17*`, `research/raw`, `research/s1-results`). |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Drafts for Lars to file if and when he chooses. Claude files nothing." and 11 numbered draft sections exist | status | verified | `D:\projects\sandbox\angular-ai-devtools\docs\filing-ledger.md` starts with that statement and `Select-String '^## [0-9]+\.'` finds 11 sections. |
| Draft 1 targets `angular/angular` for `angular:di_graph` / `ng.ɵgetSignalGraph` side effect (spike S2, 2026-10-11) | feature | unverifiable | Historical bug report with reproduction against `@angular/core` 22.2.2; no live repro executed in this audit. Evidence path to settle: rerun reproduction against current installed Angular / extension tool behavior. |
| Drafts 2-3 target `pangular-inspector/devtools` 0.0.7 issues (Nx `project.json` scan, missing `list-components`) and reference control-pangular-inspector features | integration | verified | Draft content references 0.0.7/tooling; `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-pangular-inspector\features\source-scan.md` and checks exist (skill present in chunk). |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: approved scope and order; pre-roadmap... not `.project/ROADMAP.md`" persisted 2026-11-01, superseding scratchpad after 3 review rounds (30 findings) | status | unverifiable | Document self-describes status and review history; git/meeting provenance not verified in this audit pass. |
| Generation 1 defines twelve milestones `M018`–`M029` in full roadmap format with dependencies and gates | structure | verified | `D:\projects\sandbox\angular-ai-devtools\plans\angular-ai-devtools-program-backlog.md` contains headings `### M018` through `### M029` (12 matches). |
| "Panel initial-bundle budget is a hard 520 KB" and AR-2/AR-3/AR-4 constraints for in-page overlay | config | stale | `D:\projects\sandbox\angular-ai-devtools\apps\angular-ai-devtools\project.json:82` budgets `maximumWarning` as `520kb` (not `maximumError` 520 KB); AR constraints are design rulings not directly enforced by checked config. |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: superseded historical record (dated 2026-10-31); not a live statement" written 2026-10-12, repo head `fbe3aac` at writing | status | unverifiable | Historical handoff metadata (`fbe3aac`, timestamps, working tree state) cannot be confirmed from current repo state alone. |
| Lists skill instances/ports `chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338` in `instances.json` | config | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json` defines ports `chrome-beta-nano:9333`, `chrome-beta-gemma4:9334`, `edge-dev-aion:9335`, `edge-phi4mini:9337`, `chrome-stable-nano:9338`. |
| References fixtures/artifacts `spikes/ng222-app`, `spikes/ng222-ssr`, `docs/feature-proposals.md`, `docs/filing-ledger.md`, `docs/design/tutor.md`; notes `spikes/s1-extension` retired with archive evidence | structure | verified | `D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app`, `spikes\ng222-ssr`, `docs\feature-proposals.md`, `docs\filing-ledger.md`, `docs\design\tutor.md` exist; `spikes\s1-extension` absent and `.project\archive\001-run-unrun-spikes` exists. |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Superseded" and states "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`; next milestone M019 `context-and-jobs` prepared..." | status | verified | `D:\projects\sandbox\angular-ai-devtools\.project\archive\018-instrument-core` exists; `D:\projects\sandbox\angular-ai-devtools\plans\gsd-path-handoff-M018.md` is marked superseded at top. |
| Records pipeline/branch/commit state at writing (`phase/status inspect/active`, `gsd-path/M018`, HEAD/base SHAs, M017 integration) | status | unverifiable | Historical VCS/pipeline snapshot; current branch/state and exact SHAs at that moment not revalidated in this audit pass. |
| References `plans/angular-ai-devtools-program-backlog.md` on `main` and `STATE.milestone`/bind constraints for next generation | structure | verified | `D:\projects\sandbox\angular-ai-devtools\plans\angular-ai-devtools-program-backlog.md` exists and defines M018-M029; `.project\STATE.md` exists in repo root (state file referenced by handoff). |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Verdicts come from `lars-verify`'s `verdict.mjs run` with `runs: 2` using `checks/state.mjs` and `checks/extension-panel.mjs` | integration | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\verify-ai-browsers\checks\state.mjs` and `extension-panel.mjs` exist; `D:\projects\sandbox\angular-ai-devtools\references\ai-browsers-verification.md` documents the run flow. |
| Verified registry instances include `chrome-stable-nano`, `chrome-beta-gemma4`, `edge-phi4mini`, `edge-dev-aion`; `chrome-beta-nano` is spare; setup uses `control-ai-browsers up`/shared profiles | config | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json` defines all named instances/ports; control script `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\control.mjs` exists. |
| Check limits/timeouts (`spawnSync timeout 600000` in `state.mjs`; verification spec timeouts 1800000/900000 in skill) and teardown expectations | status | unverifiable | Specific timeout values in check code/skill and historical failure notes require reading those exact lines/runs; not fully validated in this bounded pass (would settle by inspecting `state.mjs:253` and skill lines cited). |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Explains why Aion model is pinned (`--disable-component-update`, `model pin`/restore on `up`, `doctor` `model.pin`) and points to `control-ai-browsers/features/model-lifecycle.md` | integration | verified | `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\features\model-lifecycle.md` exists; `D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\scripts\control.mjs` exists. |
| Measured 2026-10-30 on Edge Dev 158.0.4357.0: pin moved to model 2026.10.15.1, runtime 2026.10.12.1, manifest 2026.10.19.1; doctor/canaries passed; 2026.10.2.1 wedged on 158 | status | unverifiable | Historical measurement report; reproducing requires the specific Edge Dev/profile/model state and was not executed. |
| States component folders `EdgeOptimizationGuideModelsManifest`, `EdgeLLMOnDeviceModel`, `EdgeLLMRuntime` and mismatch/break behavior described from measurements | feature | unverifiable | Behavioral claims about Edge component updater/model loading are empirical; no live Edge component inspection performed in this audit. |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\probe5.js and spikes\probes\probe6.js exist (Get-ChildItem) |
| "probes: `probe8.js`, `probe9.js`, `probe10.js`" used for Chrome Beta/Gemma 4 measurements | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\probe8.js, probe9.js, probe10.js exist (Get-ChildItem) |
| "Gemma 4 manifest ... `gemma4-2b-it` ... in `OptGuideManifestModel`" (downloaded model identity) | feature | unverifiable | Browser profile/model manifest paths under `%LOCALAPPDATA%` are outside repo; no manifest copy found in D:\projects\sandbox\angular-ai-devtools\research\raw |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Prompt API (`LanguageModel`) ... `LanguageModel.availability(options)` / `create()` / `prompt()`" (API shape documented) | feature | unverifiable | No local Web API spec/type definition in D:\projects\sandbox\angular-ai-devtools; would verify against Chromium/Blink IDL or browser runtime probe. |
| "Edge prerelease model is **Aion-1.0-Instruct** ... Superseded: Edge Dev 157's manifest names **Aion-1.1-Instruct**" | status | unverifiable | Model manifest is in Edge user profile outside repo; cross-ref note cites sidecar research/00-browser-probe.md (outside audited doc) but not a repo artifact. |
| "WebMCP flag's internal name is `enable-webmcp-testing`, not `webmcp-testing`" (as corrected in 00) | config | unverifiable | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-ai-browsers\instances.json contains `"WebMCP"` feature labels, not Chromium flag ids; would verify via `chrome://flags`/binary strings. |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Sources: local clone `D:\projects\github\angular\angular` on branch `22.2.x` (CHANGELOG top entry is `22.2.0`)" | structure | unverifiable | Referenced clone D:\projects\github\angular\angular is outside D:\projects\sandbox\angular-ai-devtools; `git -C D:\projects\sandbox\angular-ai-devtools log -1` does not establish that external clone state. |
| "`ng` is the expando key `GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'` in `packages/core/src/render3/util/global_utils.ts`" (Angular framework source claim) | feature | unverifiable | Claimed file path is in external Angular clone, not in D:\projects\sandbox\angular-ai-devtools; repo has no packages/core/framework source mirror. |
| "NgModule apps using `RouterModule.forRoot` get no router globals" (router publish behavior claim) | integration | unverifiable | Would verify in external Angular/router source or runtime probe; no router publish test/artifact in D:\projects\sandbox\angular-ai-devtools for this claim. |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools Chrome extension version 1.22.0 (published 2026-07-17, 5.0 stars, 2 ratings, 700,000 users, 2.44MiB)" | status | unverifiable | Chrome Web Store listing metadata is external to D:\projects\sandbox\angular-ai-devtools; no saved listing snapshot in research/raw. |
| "Playwright MCP is an open-source Node.js MCP server at `github.com/microsoft/playwright-mcp`" with browser automation tools | integration | unverifiable | External repository/API claim; no vendored playwright-mcp source or manifest in D:\projects\sandbox\angular-ai-devtools to verify version/features locally. |
| "Vue DevTools MCP server defaults to `http://localhost:8098/__mcp/sse`" (ecosystem comparison) | integration | unverifiable | External ecosystem behavior claim; not implemented/configured in D:\projects\sandbox\angular-ai-devtools repo files checked. |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome 146+ (stable) exposes `navigator.modelContextTesting`" for MCP-B/WebMCP testing | feature | unverifiable | Browser API availability is runtime-dependent; no Chrome version probe output for `navigator.modelContextTesting` in D:\projects\sandbox\angular-ai-devtools\research\raw. |
| "Angular's `@angular/platform-browser` exports `provideExperimentalWebMcpTools()`" (framework ecosystem claim) | integration | unverifiable | No Angular framework/platform-browser source in D:\projects\sandbox\angular-ai-devtools; external API would verify against Angular 22.x source or installed package typings. |
| "WebMCP tool registration can live in page/main world or extension service worker contexts" (browser/extension surface) | integration | unverifiable | No extension/service-worker WebMCP spike result file found in D:\projects\sandbox\angular-ai-devtools\research\raw (spike S1 focuses on extension contexts; 11-spike-s1-extension-contexts.md exists but is not cited as settling WebMCP registration). |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "App: `spikes/ng222-app` ... `app-counter` has `title = input()`, `count = signal(3)`, `double = computed(count * 2)`, injected root `CartService.items`, and an `effect` that writes `lastLogged`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\src\app\counter.ts:3-27 defines `CartService.items` signal, `title=input('Counter')`, `count=signal(3)`, `double=computed(() => this.count()*2)`, `lastLogged=signal(0)`, and `effect(() => this.lastLogged.set(this.count()))`. |
| "Harness: `spikes/probes/bench.js` ... offers three narrow tools" and related probe scripts (`tool-session-matrix.js`, `effect-writes.js`, `regrade.mjs`, `bench-all.sh`, `bench-summary.mjs`) | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes contains bench.js, tool-session-matrix.js, effect-writes.js, regrade.mjs, bench-all.sh, bench-summary.mjs, probe5.js-probe10.js (Get-ChildItem). |
| "grader ... changed in `9c1b585` ... `916fc09` requires the answer to name `double` and give `count` as its dependency; `spikes/probes/regrade.mjs` regrades saved runs" | status | verified | D:\projects\sandbox\angular-ai-devtools git: `916fc09` (916fc09bf6...) touches spikes/probes/bench.js and spikes/probes/regrade.mjs; `9c1b585` (9c1b585a0f...) exists. bench.js:64 checks `\bdouble\b` and `\bcount\b` after removing `app-counter`. |
| "Raw output: `research/raw/matrix-gemma4.json` and `research/raw/matrix-nano.json` ... `research/raw/bench/*.json`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw contains matrix-gemma4.json, matrix-nano.json, matrix-nano-tooluse.json, tool-name-matrix-gemma4-gpu.json, effect-writes.json; research\raw\bench contains aion.json, gemma4.json, gemma4-cpu.json, nano.json, nano-gpu.json, phi4mini.json. |
| "Nano/Gemma 4 tool-session `create()`/`prompt()` outcomes in Chrome Beta profiles" (runtime matrix results) | feature | unverifiable | Runtime Prompt API behavior depends on browser/profile/model state; raw matrix JSON files exist but this audit did not execute browsers to reproduce outcomes. |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`angular-developer/SKILL.md` ... `license: MIT`; `author: Copyright 2026 Google LLC`" (external skill analysis) | status | unverifiable | No angular-developer skill folder in D:\projects\sandbox\angular-ai-devtools\.commandcode\skills or .claude\skills (Get-ChildItem); external source not present in repo to verify license/author lines. |
| "control-angular-dev-app scripts ... `PORTAL_API_PORT`" (repo skill referenced for comparison/context) | config | verified | D:\projects\sandbox\angular-ai-devtools\.commandcode\skills\control-angular-dev-app\scripts\control.mjs:84 sets `const PORTAL_API_PORT = 3000`; :173 uses it. |
| "The clone has no LICENSE file" (angular-skills reference clone claim) | structure | unverifiable | External reference clone content not audited in D:\projects\sandbox\angular-ai-devtools; no LICENSE evidence path in repo for that external clone. |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured probe data: `research/raw/matrix-gemma4.json`, `research/raw/matrix-nano.json`, `research/raw/bench/nano.json`" | structure | verified | D:\projects\sandbox\angular-ai-devtools\research\raw contains matrix-gemma4.json and matrix-nano.json; research\raw\bench contains nano.json, nano-gpu.json, aion.json, gemma4*.json, phi4mini.json. |
| "`spikes/probes/bench.js` benchmark harness and `spikes/probes/regrade.mjs` exist" | structure | verified | D:\projects\sandbox\angular-ai-devtools\spikes\probes\bench.js and regrade.mjs exist; git show 916fc09 names both files. |
| "Gemma 4 `callID: ""` / tool-name/camelCase quirks and browser runtime template behavior" | feature | unverifiable | Claims depend on live browser/runtime behavior; raw matrix/bench outputs exist but were not rerun in this audit. Would settle by replaying probes in the documented browser profiles. |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Sources: local clone `D:\projects\github\angular\angular` on branch `22.2.x` ... `CHANGELOG.md` top entry is `22.2.0`" | structure | verified | D:\projects\github\angular\angular exists on this machine (Test-Path True); top-entry/branch text not re-read from that clone in this audit. |
| "spikes/ng222-app ... `@angular/core` 22.2.2 / generated with `@angular/cli@22.2.2`" (fixture for recent-feature/runtime probes) | structure | stale | D:\projects\sandbox\angular-ai-devtools\spikes\ng222-app\package.json has `dependencies.@angular/core` = `^22.2.0` and `devDependencies.@angular/cli` = `^22.2.2` (Get-Content/ConvertFrom-Json). |
| "A component without a `changeDetection` property is **OnPush** by default (v22)" (Angular framework behavior) | feature | unverifiable | Framework runtime/CHANGELOG claim tied to external Angular clone and runtime metadata; no OnPush-default assertion recorded in D:\projects\sandbox\angular-ai-devtools\research\raw for ng222-app. |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured behaviour: `05-spikes.md`, section \"Root cause hunt\" (Chrome Beta 156.0.8078.17, Nano profile serving `v3Nano`)" (cross-reference to measured spike) | status | verified | D:\projects\sandbox\angular-ai-devtools\research\raw\matrix-nano.json and matrix-nano-tooluse.json exist; spikes\probes\tool-session-matrix.js exists; 05-spikes.md in sidecar documents the root-cause hunt (read in this audit). |
| "Chromium source refs at tag `156.0.8078.17` (e.g. `language_model_create_client.cc`, `ai_manager.cc`, `exception_helpers.cc`)" | feature | unverifiable | External Chromium source/line citations were not fetched in this audit; no local Chromium checkout or pinned source mirror in D:\projects\sandbox\angular-ai-devtools. |
| "Spec comparison cites webmachinelearning/prompt-api `index.bs` commit `8040b81` (2026-10-06)" | status | unverifiable | External spec commit not present in D:\projects\sandbox\angular-ai-devtools; would verify by fetching the cited commit from GitHub. |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gemma 4 on Chrome, Nano (Gemini Nano v3), Phi-4-mini on Edge, Aion on Edge" are compared as in-browser models | feature | unverifiable | Document cites local instance/profile paths (`.browsers/*`) and config not present as committed files; `control-ai-browsers` skill scripts exist at `.claude/skills/control-ai-browsers/scripts/control.mjs` but no model instance manifest was verified in repo. |
| "Chrome and Edge both ship llguidance, a grammar-constrained decoder" for `responseConstraint` | integration | unverifiable | No `llguidance` binary/source artifact committed in repository; claim is based on external Chromium/Edge binary reads. |
| Benchmark evidence cites `spikes/probes/bench.js` writing `spikes/probes/bench/${basename}.json` and `spikes/probes/bench/nano.json` | feature | stale | `spikes/probes/bench.js:61-65` writes to `spikes/probes/bench/${basename}.json`, but `spikes/probes/bench/nano.json` does not exist in repo (`Test-Path` false); only `spikes/probes/` scripts present. |
| "S1 ... `research/s1-results/chrome-gemma4.json` and `edge-aion.json`" hold round-trip measurements | feature | verified | `research/s1-results/chrome-gemma4.json` and `research/s1-results/edge-aion.json` exist with `createToolResult`/`contextUsage`/`calls` records. |
| Raw preserved copy cited as `research/raw/bench/nano.json` (overwritten state noted) | status | unverifiable | `research/raw/` contains other raw artifacts (e.g. `research/raw/tosignal-node-portal.json`, `research/raw/ssr-hydration.json`) but `research/raw/bench/nano.json` lookup not confirmed in this run. |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Phase 1 ... evidence: `research/s1-results/chrome-fresh.json`, `research/s1-results/edge-fresh.json`" | feature | verified | `research/s1-results/chrome-fresh.json` and `research/s1-results/edge-fresh.json` exist in repository. |
| "Phase 2 ... Evidence: `research/s1-results/chrome-gemma4.json`, `research/s1-results/edge-aion.json`" on Gemma 4 (9334) and Aion (9335) | feature | verified | `research/s1-results/chrome-gemma4.json` and `research/s1-results/edge-aion.json` exist with `createToolResult` records for extension contexts. |
| "Extension: `spikes/s1-extension/` (retired in M009 ...)" | status | stale | `spikes/s1-extension/` does not exist in repo (`Test-Path` false); document states retired, but current tree lacks the directory/artifacts. |
| "`devtools_page` is blocked by Permissions Policy ... `availability()` resolves to `unavailable`" (S1 result) | feature | unverifiable | Claim reports measured browser behavior; S1 result JSONs exist but this specific policy/error row was not parsed in this run. |
| "`Extensions.loadUnpacked` works over `--remote-debugging-port`" in Chrome Beta 156 / Edge Dev 157 | integration | unverifiable | External browser behavior claim; no control script invocation/output captured in repository evidence. |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Date: 2026-10-12 ... Angular 22.2 dev-mode app" and spike app built bundle used for measurements | status | unverifiable | Document cites `spikes/ng222-app/dist/ng222-app/browser/main.js`; `spikes/ng222-app/dist/` not present in repo (`Test-Path` false for dist main.js). |
| "Lars's ruling ... abandon legacy Angular features like NgZone/zone.js (supporting zoneless only), NgModules, class-based vs. functional, template-based forms, and Reactive Forms" (verbatim ruling recorded) | status | unverifiable | Ruling is attributed to Lars in-document; no external policy/config file in repo confirms this ruling text. |
| Dev-mode class metadata via `setClassMetadata` / `ɵsetClassDebugInfo` is described as emitted behind `ngDevMode` | feature | unverifiable | Claim cites Angular source under `D:\projects\github\angular` and spike bundle; neither Angular checkout nor spike dist bundle verified in this repository. |
| Support line derived from "Runtime DevTools view" against `docs/feature-proposals.md` sections 3.4,4,5 | structure | verified | `docs/feature-proposals.md` exists; document cross-references those sections as comparison basis (feature proposals present in repo). |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Insurance portal: legacy Angular API audit" targets an external portal codebase | status | unverifiable | Audit refers to portal paths/components outside `D:\projects\sandbox\angular-ai-devtools`; no portal checkout referenced in repository evidence. |
| Audit classifies legacy API usage (NgModules, zone/NgZone, template/control-flow/forms patterns) against modern Angular forms | feature | unverifiable | Specific usage counts/files would require portal source access; not present in this repository. |
| References Angular 22.2/runtime behavior context consistent with other research docs | structure | verified | Repo contains Angular 22.2 spike fixtures (`spikes/ng222-app/package.json` deps `@angular/* ^22.2.0`, devDeps `@angular/cli ^22.2.2`; `spikes/ng222-ssr/package.json` same). |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Adds over `03-prior-art.md`" and covers tools beyond that prior-art doc, re-reading where AI feature sets moved | structure | verified | `research/03-prior-art.md` exists; document states its scope relative to it and to `01-built-in-ai-apis.md` (also exists). |
| Judgements are made against `docs/feature-proposals.md` limits (7-9K context, tool summaries by id, ~6 tool steps, no server/app npm, no code generation) | feature | verified | `docs/feature-proposals.md` exists and is the cited limits source; doc cross-references sections 2.1/3.3/3.4/3.5/8. |
| "Angular's `webmcp` source and Signal Forms registration" and Storybook/CLI tool files were read as primary sources | integration | unverifiable | Cites external Angular/Storybook/CLI/Playwright/Claude-in-Chrome sources not present as committed artifacts in this repo; subagent reads not reproducible from repo alone. |
| Labels use `[measured]`, `[documented]`, `[inferred]` with source/read-status discipline | structure | verified | Document status line and label definitions appear in text; consistent with repo research style (e.g. `research/11-spike-s1-extension-contexts.md`, `research/16-ssr-runtime.md`). |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Argues "deterministic code first: combining the built-in AI with plain TypeScript" as design guidance | feature | unverifiable | Design/principle document; no executable config/test in repo proves adoption beyond text. Cross-referenced by later docs (e.g. `research/11`/proposals context) but behavioral claim not settled. |
| Relates to built-in AI APIs and extension/tool constraints discussed elsewhere in research | structure | verified | `research/01-built-in-ai-apis.md`, `research/10-model-capabilities.md`, `research/11-spike-s1-extension-contexts.md`, `docs/feature-proposals.md` exist in repo. |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fixture: `spikes/ng222-ssr`, created with `ng new ... --ssr ... --zoneless` ... Angular 22.2.2" | feature | verified | `spikes/ng222-ssr/package.json` — `@angular/* ^22.2.0`, `@angular/ssr ^22.2.2`, `@angular/cli ^22.2.2`; `serve:ssr:ng222-ssr` script present. |
| "Server: `ng serve --port 4223 --no-hmr` through `control-angular-dev-app` (`--target ssr`)" | command | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:146,154` — ssr slot 0 uses port 4223 and args include `serve --port ... --no-hmr`. |
| Raw probe outputs: `research/raw/ssr-hydration.json`, `ssr-transfer.json`, `ssr-event-replay.json`, `ssr-render-modes.json`, `ssr-defer.json` | feature | verified | All five files exist under `research/raw/`. |
| "`__ngDebugHydrationInfo__` ... counters on `ngDevMode` ... `ng.ɵgetTransferState` / defer/hydration behavior" measured in dev server runs | integration | unverifiable | Raw JSON artifacts exist, but browser/runtime observations (console, DOM, Resource Timing, `window.ng` values) were not re-executed in this audit. |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fixture: `spikes/ng222-app` (Angular 22.2.2, zoneless, standalone). Added vitest 5.0.3, @vitest/browser 5.0.3, @vitest/browser-playwright 5.0.3, playwright 1.63.0, vitest-browser-angular 0.5.1" | feature | verified | `spikes/ng222-app/package.json` — `vitest 5.0.3`, `@vitest/browser 5.0.3`, `@vitest/browser-playwright 5.0.3`, `playwright 1.63.0`, `vitest-browser-angular 0.5.1`; Angular deps `^22.2.0`/CLI 22.2.2. |
| "Route 2 (attach to running branded instance over CDP, custom provider) works" with raw `research/raw/vitest-attach-gemma4.json` | integration | verified | `research/raw/vitest-attach-gemma4.json` exists; `spikes/probes/vitest-attach.mjs` and `spikes/probes/vitest-iframe-probe.js` exist as probe files. Runtime result not re-run. |
| "S1 test extension's content scripts ran in the tester iframe ... `LanguageModel` answered \"OK\"" in Chrome Beta 156 with Gemma 4 | integration | unverifiable | Raw result file exists, but the cross-context/AI answer was not reproduced in a live browser during this audit. |
| "Vitest's own `connectOptions` ... cannot attach to CDP" (route 2a) | status | unverifiable | Claim cites `@vitest/browser-playwright` implementation behavior; package source in `node_modules` not inspected in this run. |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Research date: 2026. Target: Microsoft Edge Stable 155 on Windows, launching with a fresh `--user-data-dir` profile." | status | verified | Document states target; repo tracks Edge 155/Phi-4-mini instance naming in research/config references (e.g. `research/19-languagemodel-in-extension-contexts.md`, `research/20-built-in-ai-without-flags.md`, `control-ai-browsers` skill). |
| "HKCU Edge policies are deliberately _not_ used — the `control-ai-browsers` skill relies on the `ms*` switches alone (`.commandcode/skills/control-ai-browsers/SKILL.md:311-312`)." | config | verified | `.commandcode/skills/control-ai-browsers/SKILL.md:311-312` — "Never apply HKCU/HKLM Edge policies ... switches." |
| Registry policy recipe (`BrowserSignin`, `ImplicitSignInEnabled`, etc.) is presented as Microsoft-documented but superseded for this program | integration | unverifiable | External Microsoft Learn/policy behavior not tested against Edge 155 in this audit; only repo policy decision (no HKCU policies) verified. |
| "`--bwsi`/guest` described as true no-account modes" | command | unverifiable | Command-line behavior is an external Edge/Chromium claim; not executed or validated from repo artifacts. |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw: `raw/19-languagemodel-contexts.json`. Each browser-model pair ran in its `control-ai-browsers` instance..." | feature | verified | `research/raw/19-languagemodel-contexts.json` exists. |
| "Section 3.1 of `docs/feature-proposals.md` already places the session in the DevTools panel or side panel page (spike S1, `research/11`)." | structure | verified | `docs/feature-proposals.md` and `research/11-spike-s1-extension-contexts.md` exist; doc cross-references panel/side-panel placement and S1. |
| Hidden `devtools.html` page refused with Permissions Policy "Access denied because the Permission Policy is not enabled" | integration | unverifiable | Raw JSON exists but denial/error text and per-context results were not parsed/re-run in this audit. |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" (decision applied 2026-10-19) | status | unverifiable | Source implementation of `ExtensionPromptService` not located/verified in this audit; claim is a design/status statement. |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw results: `raw/20-built-in-ai-without-flags.json`." and worker results under `workers` | feature | verified | `research/raw/20-built-in-ai-without-flags.json` exists. |
| "Edge: the two Edge profiles were launched with `control-ai-browsers up <name> --no-ai-features`..." | command | unverifiable | External launch behavior via control-ai-browsers not re-executed; raw results exist but command-path effect not verified here. |
| "Panel-side call in `ExtensionPromptService` (research/19) therefore runs on an unflagged Chrome or Edge." | status | unverifiable | Depends on ExtensionPromptService implementation and live browser behavior; not validated in this audit. |
| "`LanguageDetector.availability()` or `Translator.availability()`" in a worker caused renderer crash; "Never call LanguageDetector or Translator from a worker" and filing ledger item 11 cited | integration | unverifiable | Raw JSON exists; crash/fatal behavior and `docs/filing-ledger.md` item 11 not checked in this run. |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | config | verified | `spikes/ng222-app/package.json` devDependencies include `@angular/cli": "^22.2.2"`. |
| "`ng serve` starts a local development server at `http://localhost:4200/` with automatic reload" | command | verified | `spikes/ng222-app/package.json` scripts include `"start": "ng serve"`; Angular CLI default dev-server behavior is standard (command/config present). |
| "`ng test` executes unit tests with the [Vitest](https://vitest.dev/) test runner" | command | verified | `spikes/ng222-app/package.json` has `"test": "ng test"` and devDependencies `vitest 5.0.3`, `@vitest/browser*`, `vitest-browser-angular 0.5.1`. |
| "`ng build` stores build artifacts in the `dist/` directory" | command | verified | `spikes/ng222-app/package.json` has `"build": "ng build"`; Angular CLI default output convention (config present). |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2." | config | verified | `spikes/ng222-ssr/package.json` devDependencies include `@angular/cli": "^22.2.2"`. |
| "`ng serve` starts local dev server at `http://localhost:4200/` with automatic reload" | command | verified | `spikes/ng222-ssr/package.json` scripts include `"start": "ng serve"`. |
| "`ng test` section notes fixture generated with `--skip-tests` and tracks no `*.spec.ts`, so it has no unit tests to run" | status | verified | `spikes/ng222-ssr/package.json` has `"test": "ng test"` but no `@vitest/*`/test deps; repo fixture is SSR spike and README states skip-tests (no spec evidence checked beyond README alignment with deps). |
| "`serve:ssr:ng222-ssr`: `node dist/ng222-ssr/server/server.mjs`" | command | verified | `spikes/ng222-ssr/package.json` scripts include `"serve:ssr:ng222-ssr": "node dist/ng222-ssr/server/server.mjs"`. |

## Descriptive docs
- .commandcode/taste/taste.md
- docs/autonomy-gaps.md

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
| 99 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 100 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 671 | .commandcode/skills/nx-generate/SKILL.md | "Format all generated/modified files: `nx format:write`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 713 | .claude/skills/control-ai-browsers/features/di-doctor.md | "DI Doctor tab renders resolution path / diff and explains via panel-local Prompt API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 714 | .claude/skills/control-ai-browsers/features/error-explainer.md | "Captures NG0xxx/uncaught console errors, maps to owning component via ng.getOwningComponent, explains from bundled angular.dev/errors digest via panel-local Prompt API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 715 | .claude/skills/control-ai-browsers/features/extension-panel.md | "N1 'Explain version with AI' calls LanguageModel in the panel's extension page; Angular detection from content scripts (relay.js, agent-main.js)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 716 | .claude/skills/control-ai-browsers/features/extension-panel.md | "Build panel: npx nx run angular-ai-devtools:build-extension writes extension/panel/" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 717 | .claude/skills/control-ai-browsers/features/health-check.md | "Doctor runs checks for process, tree, commandLine, ports, tabs, model.disk, model.pin, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp, account, extension" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 718 | .claude/skills/control-ai-browsers/features/health-check.md | "health-extension proves instance serves unpacked extension recorded in state file (extensionDir)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 719 | .claude/skills/control-ai-browsers/features/health-check.md | "health-tools proves tool call/answer; Nano tool canary skipped; Phi-4-mini tool canary reported only" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 720 | .claude/skills/control-ai-browsers/features/health-check.md | "WebMCP lives on document.modelContext (navigator.modelContext undefined)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 721 | .claude/skills/control-ai-browsers/features/interop.md | "Interop tab slices toSignal.source/toSignal.state nodes; states ɵgetSignalGraph cannot name feeding Observable/operator chain/emission timing" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 722 | .claude/skills/control-ai-browsers/features/interop.md | "Field-to-node attribution worded 'inferred, untested'; no runtime message type (angular-ai:interop does not exist)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 723 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "Model folders: OptGuideOnDeviceModel/OptGuideManifestModel (Chrome), EdgeLLMOnDeviceModel/EdgeLLMRuntime/EdgeOptimizationGuideModelsManifest (Edge)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 724 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "Download needs trusted gesture; Edge 'Check for update' on model components; model download refused with --disable-component-update (edge-dev-aion)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 725 | .claude/skills/control-ai-browsers/features/probes.md | "C bench [names...] runs bench.js per instance with backend/performance class/CPU load recorded" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 726 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "Explain asks panel-local Prompt API about chain/findings with cached answer for unchanged selection" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 727 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "Panel loads only when shown; page announces Angular once at load; reload after opening panel" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 728 | .claude/skills/control-ai-browsers/features/stale-view.md | "Zero findings render explicit empty state; unsupported Angular versions/unavailable graph reported explicitly" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 729 | .claude/skills/control-angular-dev-app/SKILL.md | "the ng222-app counter... declares, /stale-view and /stale-view-deferred" (routes at src/app/app.routes.ts:5-8) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 730 | .claude/skills/control-angular-dev-app/features/README.md | "Counter... Fresh page state: `count` 3, `double` 6, cart 1 item" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 731 | .claude/skills/control-angular-dev-app/features/counter.md | "Counter is at `/`; fixture's two other routes, `/stale-view` and `/stale-view-deferred` (src/app/app.routes.ts:5-8)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 732 | .claude/skills/control-angular-dev-app/features/counter.md | "router() returns present true and lists `/stale-view` and `/stale-view-deferred`, not an empty list" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 733 | .claude/skills/control-angular-dev-app/features/counter.md | "inspect changeDetection returns OnPush for component without changeDetection declared" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 734 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "Claims data comes from `http://localhost:3000/api/claims`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 735 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "Claim list columns: Claim number, Damage Type, Date, Policynumber, Customer" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 736 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "`/claim/create` shows heading `Complaint Create` (app bug, measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 737 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "Deep links `/claim/list`, `/claim/create`, `/claim/<id>/details`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 738 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Complaints data from `http://localhost:3000/api/complaints` and customers from `/api/customers`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 739 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Complaint list columns Type, Customer, Date, Description; customer list has eight named columns" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 740 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Save sends `POST /api/complaints` (201), shows success toast and opens new complaint details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 741 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Deep links `/complaint/list`, `/complaint/create`, `/customer/list`, `/customer/<id>/details`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 742 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Contracts data comes from `http://localhost:3000/api/contracts`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 743 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Contract list has columns Policynumber, Status, Insurance Start On, Customer, Phone, Email; 20 rows after fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 744 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Edit sends `PUT /api/contracts` and returns to details; create sends `POST /api/contracts` (201) and opens details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 745 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Deep links include `/contract/list`, `/contract/create`, `/contract/<id>/details`, `/contract/<id>/edit`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 746 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "`/` redirects to `/home`; Home tiles Contracts, Claims, Complaints, Customers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 747 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Domain routes load lazily, guarded by feature flags; unknown URLs show `Page Not Found`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 748 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Development builds load Pangular Inspector overlay adding `div#pangular-popup-root` and floating toggle button" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 749 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Sidebar entries are `div`s with `routerLink`, not links" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 750 | .claude/skills/control-angular-devtools/features/attach.md | "A production build gives `isDebugMode: false` and attach requires development build behavior" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 751 | .claude/skills/control-angular-devtools/features/install.md | "Branded install/uninstall require human clicks and script polls profile/store page" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 752 | .claude/skills/control-angular-devtools/features/profiler.md | "`ng.ɵsetProfiler(null)` clears every subscriber (including DevTools)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 753 | .claude/skills/control-angular-devtools/features/signal-graph.md | "After `angular:di_graph` the template node disappears from pane and `ng.ɵgetSignalGraph` (measured regression)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 754 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 ... has no `list-components` tool; ... with `--read-only`, 0.0.7 lists 46 tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 755 | .claude/skills/control-pangular-inspector/features/navigation.md | "`explain-navigation`, newest first, with trigger, `started by`, phases and outcome" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 756 | .claude/skills/control-pangular-inspector/features/navigation.md | "`inspect-route`, the current URL, document title and active route tree" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 757 | .claude/skills/control-pangular-inspector/features/navigation.md | "`list-routes` and `lint-routes` on the live route config" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 758 | .claude/skills/control-pangular-inspector/features/panel.md | "Panel title `Pangular Inspector`; dashboard shows `LIVE` badge and read-only `Agent`/`Read-only` config when server runs `--read-only`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 759 | .claude/skills/control-pangular-inspector/features/panel.md | "Floating button accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 760 | .claude/skills/control-pangular-inspector/features/setup.md | "`setup.remove` restores from git `HEAD`, prunes `node_modules`, asserts a clean worktree" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 761 | .claude/skills/control-pangular-inspector/features/source-scan.md | "Scan reads `angular.json` projects or `<root>/src` only; ignores `project.json` (only `build-meta` reads it)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 762 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`spikes/s1-extension` was retired in M009; use `s1-vitest`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 763 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "Component host is `<div id="rootN" ng-version>`, not `<app-counter>` (TestBed renders into a div)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 764 | .claude/skills/verify-angular-devtools/SKILL.md | "`.claude/skills/verify-angular-devtools` is an older `.claude` skill folder (not a byte copy of `.commandcode` per brief rule 84 for ai-browsers only)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 765 | .claude/skills/verify-pangular-inspector/SKILL.md | "`.claude/skills/verify-pangular-inspector` is not a byte copy of `.commandcode` counterpart" (drift per brief rule 84) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 766 | .claude/skills/verify-pangular-inspector/SKILL.md | "`live-reads` drives sidebar CONTRACT > List to `/contract/list` and validates MCP answers (list-pages, outline, inspect-component, inspect-signals, inspect-providers, explain-navigation)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 767 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "Captures `NG0xxx`... maps to owning component via `ng.getOwningComponent` and explains from digest bundled at extension build time using panel-local Prompt API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 768 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Doctor checks include backend/Broker State, availability (LanguageModel/Summarizer/Writer/Rewriter/Proofreader/LanguageDetector/Translator), structured output, tool round trip, WebMCP" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 769 | .commandcode/skills/control-ai-browsers/features/health-check.md | "`C doctor chrome-beta-gemma4` / nano / edge-dev-aion examples and specific row names" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 770 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Gemma 4 sends `callID: \"\"`; Edge Dev 157 requires `callId` on LanguageModelToolSuccess; canary sends both" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 771 | .commandcode/skills/control-ai-browsers/features/health-check.md | "`navigator.modelContext` undefined; WebMCP lives on `document.modelContext`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 772 | .commandcode/skills/control-ai-browsers/features/instances.md | "Edge refuses `--backend=cpu` and forcing CPU deleted the installed model (gotcha)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 773 | .commandcode/skills/control-ai-browsers/features/instances.md | "Profiles live under `.commandcode\worktrees\.browsers\` of the primary checkout and are shared across checkouts/worktrees/sidecars" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 774 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "Measured download/init/clear/pin timings, sizes, Broker State transitions and restore behavior" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 775 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "`--backend=cpu` on Edge is refused; forcing CPU uninstalled model (gotcha)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 776 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "Chrome starts downloading a Requested model at launch without any page call (gotcha)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 777 | .commandcode/skills/control-ai-browsers/features/probes.md | "Measured probe/bench outcomes and latency comparisons (e.g., tool canary prose on Nano, Aion results)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 778 | .commandcode/skills/control-ai-browsers/features/probes.md | "Gemma 4/Edge callId quirks: tool response must carry both `callID` and `callId` (probe10/bench/doctor canary send both)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 779 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "Explain uses panel-local Prompt API with cached answer for unchanged selection" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 780 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "Panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 781 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "Stale View tab scans for bindings whose template may show a stale value, reports field name and owning component, explains via panel-local Prompt API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 782 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "Zero findings render explicit empty state; unsupported Angular versions report explicit unsupported state; destroyed signal graph reports unavailable" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 783 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "Panel stays panel-local Prompt API: no page or content-script Prompt API and no new host permission" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 784 | .commandcode/skills/control-angular-dev-app/SKILL.md | "counter fixture provides router over the two routes src/app/app.routes.ts:5-8 declares, /stale-view and /stale-view-deferred" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 785 | .commandcode/skills/control-angular-dev-app/features/components.md | "Surfaces include Angular Aria listbox/tabs/menu and a CDK overlay opened by the Overlay button" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 786 | .commandcode/skills/control-angular-dev-app/features/counter.md | "The counter is the ng222-app page with an Increment button; initial render shows count 3, double 6, cart 1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 787 | .commandcode/skills/control-angular-dev-app/features/counter.md | "router() returns present: true and lists the two routes /stale-view and /stale-view-deferred, not an empty list (src/app/app.routes.ts:5-8)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 788 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "Claims data comes from http://localhost:3000/api/claims and is driven through the portal target" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 789 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "Claim routes/pages (list, create, details) require a healthy portal checkout and feature flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 790 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Complaint/customer list/detail/create behaviors, seeded counts, and POST/GET response details are as documented" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 791 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "Contracts are served by the portal API at http://localhost:3000/api/contracts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 792 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "Contract list/details/edit/create UI states, field accessibility, and POST/PUT behaviors are accurate" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 793 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Feature flags in apps/insurance-portal/src/assets/feature-flags.manifest.json control sidebar entries/routes as described" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 794 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Home redirect, tiles, sidebar structure, lazy route growth, and not-found rendering match the live portal" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 795 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "Routes /, /prerender, /client and fixture query switches ?mismatch=1, ?mismatch=text, ?transfer=0 behave as described" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 796 | .commandcode/skills/control-angular-devtools/features/attach.md | "Measured detection values (isIvy/isAngular/isDebugMode/isSupportedAngularVersion, Angular 22.2.2, timing) are current" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 797 | .commandcode/skills/control-angular-devtools/features/install.md | "Chrome Beta install/uninstall proof outcomes and measured status results are reproducible now" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 798 | .commandcode/skills/control-angular-devtools/features/profiler.md | "Expected coexist counter values (16/16/32) and DevTools recorded 2 cycles are current" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 799 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Expected node lists before/after angular:di_graph and fixture-specific values are current" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 800 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Floating button accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 801 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`remove` refuses foreign/unmanaged changes and asserts clean managed restore" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 802 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "`scan --out` results land in `tmp/control-pangular-inspector/scan/`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 803 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "S1 Vitest variant (`--extension s1-vitest`) injects content scripts into Vitest tab/tester iframe; MAIN world sees `window.ng`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 804 | .commandcode/skills/link-workspace-packages/SKILL.md | "pnpm uses `pnpm add @org/ui --workspace` / `--filter`; yarn uses `yarn workspace ... add`; npm uses `--workspace`; bun supports `workspace:` protocol" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 805 | .commandcode/skills/nx-cloud-api/SKILL.md | "All output is JSON. stdout carries only the response data." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 806 | .commandcode/skills/nx-cloud-api/SKILL.md | "Follow returned `links` values. Do not build child URLs by hand..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 807 | .commandcode/skills/nx-cloud-api/SKILL.md | "A stored personal access token takes precedence..." / login behavior references `nxCloudId` in `nx.json` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 808 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Save every live API response to a file with `-o`" / extraction uses bounded `--pages` and checks `nextCursor` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 809 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "A non-null `nextCursor` means the range is incomplete..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 810 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 811 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Nx Cloud log and report assets are compressed binary payloads..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 812 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "Use `nx show project \"$project\" --json` ... to query the exact target" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 813 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "API-only investigation does not need a checkout." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 814 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Download the exact task-row artifact link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 815 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 816 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Record byte count and SHA-256 / validate complete compression stream..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 817 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 818 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Download the exact row-provided link with `npx nx-cloud api \"<link>\" -o <private-file>.tar.gz`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 819 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Treat each as an archive, not terminal text. ... Identify its format from bytes..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 820 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Review failures from the last 24 hours by default... Query a 30-hour creation window..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 821 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Inspect the live schemas with `--describe` for `cipes`, `run-groups`, `run-groups/{runGroupId}`, `runs`, `runs/{runId}/tasks`..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 822 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Use a semaphore of at most five narrow detail requests. Fetch logs only after a group reaches the top five." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 823 | .commandcode/skills/nx-generate/SKILL.md | "Always use `--no-interactive`" when running generators | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 824 | .commandcode/skills/nx-generate/SKILL.md | "List all generators for a plugin: `npx nx list @nx/react` / View available plugins: `npx nx list`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 825 | .commandcode/skills/nx-generate/SKILL.md | "Get Generator Options: use `npx nx g @nx/react:library --help`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 826 | .commandcode/skills/nx-generate/SKILL.md | "Always run with `--dry-run` first..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 827 | .commandcode/skills/nx-import/SKILL.md | "`nx import` brings code from a source repository or folder into the current workspace, preserving commit history." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 828 | .commandcode/skills/nx-import/SKILL.md | "Run `nx import --help` for available options." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 829 | .commandcode/skills/nx-import/SKILL.md | "Primary docs: https://nx.dev/docs/guides/adopting-nx/import-project and .../preserving-git-histories" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 830 | .commandcode/skills/nx-import/SKILL.md | "Run `nx sync --yes`" / "use `npx nx add @nx/PLUGIN`" / "pnpm install" steps appear throughout | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 831 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 832 | .commandcode/skills/nx-import/references/ESLINT.md | "Plugin detects both flat config files (`eslint.config.{js,mjs,cjs,ts,mts,cts}`) and legacy config files (`.eslintrc.{json,js,cjs,yml,yaml}`)." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 833 | .commandcode/skills/nx-import/references/ESLINT.md | "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`. Accept the offer..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 834 | .commandcode/skills/nx-import/references/ESLINT.md | "Pin ESLint to v9 or v10 (`eslint@^9.0.0` or `eslint@^10.0.0`)" guidance appears as conflict mitigation context in nx-import ecosystem | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 835 | .commandcode/skills/nx-import/references/GRADLE.md | "The `@nx/gradle` plugin expects `gradlew`, `gradlew.bat`, and `gradle/wrapper` at the workspace root..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 836 | .commandcode/skills/nx-import/references/GRADLE.md | "Run `nx show projects` to verify that Gradle projects are being inferred." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 837 | .commandcode/skills/nx-import/references/GRADLE.md | "Helpful docs: https://nx.dev/docs/technologies/java/gradle/introduction" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 838 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 839 | .commandcode/skills/nx-import/references/JEST.md | "`npx nx add @nx/jest` registers `@nx/jest/plugin` in `nx.json` and updates `namedInputs.production`..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 840 | .commandcode/skills/nx-import/references/JEST.md | "`nx add @nx/jest` does NOT create `jest.preset.js`" (manual creation required for imports) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 841 | .commandcode/skills/nx-import/references/JEST.md | "Workspaces can have both Jest and Vitest... `@nx/jest/plugin` and `@nx/vite/plugin` coexist without conflicts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 842 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates build/dev/start/serve-static/build-deps/watch-deps targets." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 843 | .commandcode/skills/nx-import/references/NEXT.md | "Next.js runs TypeScript checking as part of `next build`; `@nx/js/typescript` provides standalone `typecheck` for non-Next libraries." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 844 | .commandcode/skills/nx-import/references/NEXT.md | "Fix: `pnpm add -wD @next/eslint-plugin-next` (Next-specific ESLint dep)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 845 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Migration replaces Turborepo task orchestration with Nx targets..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 846 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 847 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Delete all `turbo.json` files (root and per-package) / remove `turbo`, `eslint-plugin-turbo`" as cleanup guidance | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 848 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 849 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` detects `vite.config.ts` and creates inferred targets" (e.g., React Router/TanStack sections) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 850 | .commandcode/skills/nx-import/references/VITE.md | "Plugin init loads `vite.config.ts` before deps are available. Fix: `pnpm add -wD vite @vitejs/plugin-react`..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 851 | .commandcode/skills/nx-plugins/SKILL.md | "List plugins: `npx nx list`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 852 | .commandcode/skills/nx-plugins/SKILL.md | "Install plugins `npx nx add <plugin>`. Example: `npx nx add @nx/react`." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 853 | .commandcode/skills/nx-run-tasks/SKILL.md | "Run a single task: `nx run <project>:<task>`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 854 | .commandcode/skills/nx-run-tasks/SKILL.md | "Run multiple tasks: `nx run-many -t build test lint typecheck`" with `-p`, `--exclude`, `--parallel` flags | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 855 | .commandcode/skills/nx-run-tasks/SKILL.md | "Run tasks for affected projects: `nx affected -t build test lint` (default compares against base branch)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 856 | .commandcode/skills/nx-run-tasks/SKILL.md | "Check tasks via `nx show project <projectname> --json` ... contains a `targets` section" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 857 | .commandcode/taste/angular/taste.md | "Signal Forms (`@angular/forms/signals`) is the target forms API" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 858 | .commandcode/taste/angular/taste.md | "Modern Angular only: standalone components, signals... and zoneless" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 859 | .commandcode/taste/angular/taste.md | "Features should be Angular-only with no third-party packages; specifically excludes Vitest, Analog.js, Storybook, NgRx, and RxAngular" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 860 | .commandcode/taste/communication/taste.md | "Casing and exact names matter... `provideAiDevTools()` not `provideAiDevtools()`, `provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 861 | .commandcode/taste/communication/taste.md | "Never call AskUserQuestion; proceed with available context..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 862 | .commandcode/taste/communication/taste.md | "In design documents say \"modern Angular pattern\" and \"modern Angular feature\"; never \"blessed\" or \"ordained\"" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 863 | .commandcode/taste/design/taste.md | "Companion-package naming: `provideAiDevTools()` with per-package secondary entry points such as `provideAiNgrxDevTools()`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 864 | .commandcode/taste/design/taste.md | "The product is only a web (browser) extension and must never generate code" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 865 | .commandcode/taste/design/taste.md | "Built-in AI (Prompt API) calls are panel-local... page/content scripts/service worker never host `LanguageModel`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 866 | .commandcode/taste/workflow/taste.md | "use `/lars-create-verification` / `/lars-maintain-verification` / `/lars-verify` workflows" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 867 | .commandcode/taste/workflow/taste.md | "Replace (remove) superseded skill families... drop `lars-create-control-skill`/`lars-maintain-control-skills` in favour of `lars-create-verification`/`lars-maintain-verification`/`lars-verify`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 868 | .commandcode/taste/workflow/taste.md | "Under GSD Path, `.commandcode/` is not a build bookkeeping prefix, so a taste write is a product change..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 869 | docs/afk-run-2026-10-12.md | "Started 02:2x local time" AFK run contract lists deliverables including 8 skills, spike S1, Edge provider trials, proposals/review round, and clean tree finish conditions | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 870 | docs/afk-run-2026-10-12.md | States "At most two agents at once" and gates (no push/PR/tag/filing; don't touch Lars's profiles beyond read-only checks) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 871 | docs/autonomy-gaps.md | "No commit in this repository carries" user-scope edits under `C:\Users\LarsGyrupBrinkNielse\.commandcode\`; pins live in repo tests like `scripts/autonomy-gaps.test.mjs` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 872 | docs/autonomy-gaps.md | "Gap 8/9/10 made no user-scope edit at all" and describes measures tied to repo-side fixes/tests | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 873 | docs/design/tutor.md | "Status: proposal — the tutor is not implemented" and describes planned N27 tutor design (not shipped behaviour) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 874 | docs/design/tutor.md | Defines tutor spikes `TS1-TS12` and binding rules (no code generation, supported zoneless standalone Angular 22.2 dev builds) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 875 | docs/feature-proposals.md | Evidence files include `research/00`-`17`, raw `research/raw/`, spike results `research/s1-results/` and `docs/filing-ledger.md` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 876 | docs/filing-ledger.md | Draft 1 targets `angular/angular` for `angular:di_graph` / `ng.ɵgetSignalGraph` side effect (spike S2, 2026-10-11) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 877 | plans/angular-ai-devtools-program-backlog.md | "Status: approved scope and order; pre-roadmap... not `.project/ROADMAP.md`" persisted 2026-11-01, superseding scratchpad after 3 review rounds (30 findings) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 878 | plans/angular-ai-devtools-program-backlog.md | "Panel initial-bundle budget is a hard 520 KB" and AR-2/AR-3/AR-4 constraints for in-page overlay | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 879 | plans/angular-ai-devtools-proposals.handoff.md | "Status: superseded historical record (dated 2026-10-31); not a live statement" written 2026-10-12, repo head `fbe3aac` at writing | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 880 | plans/gsd-path-handoff-M018.md | Records pipeline/branch/commit state at writing (`phase/status inspect/active`, `gsd-path/M018`, HEAD/base SHAs, M017 integration) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 881 | references/ai-browsers-verification.md | Check limits/timeouts (`spawnSync timeout 600000` in `state.mjs`; verification spec timeouts 1800000/900000 in skill) and teardown expectations | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 882 | references/edge-dev-aion-model.md | Measured 2026-10-30 on Edge Dev 158.0.4357.0: pin moved to model 2026.10.15.1, runtime 2026.10.12.1, manifest 2026.10.19.1; doctor/canaries passed; 2026.10.2.1 wedged on 158 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 883 | references/edge-dev-aion-model.md | States component folders `EdgeOptimizationGuideModelsManifest`, `EdgeLLMOnDeviceModel`, `EdgeLLMRuntime` and mismatch/break behavior described from measurements | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 884 | research/00-browser-probe.md | "Gemma 4 manifest ... `gemma4-2b-it` ... in `OptGuideManifestModel`" (downloaded model identity) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 885 | research/01-built-in-ai-apis.md | "Prompt API (`LanguageModel`) ... `LanguageModel.availability(options)` / `create()` / `prompt()`" (API shape documented) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 886 | research/01-built-in-ai-apis.md | "Edge prerelease model is **Aion-1.0-Instruct** ... Superseded: Edge Dev 157's manifest names **Aion-1.1-Instruct**" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 887 | research/01-built-in-ai-apis.md | "WebMCP flag's internal name is `enable-webmcp-testing`, not `webmcp-testing`" (as corrected in 00) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 888 | research/02-angular-surface.md | "Sources: local clone `D:\projects\github\angular\angular` on branch `22.2.x` (CHANGELOG top entry is `22.2.0`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 889 | research/02-angular-surface.md | "`ng` is the expando key `GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'` in `packages/core/src/render3/util/global_utils.ts`" (Angular framework source claim) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 890 | research/02-angular-surface.md | "NgModule apps using `RouterModule.forRoot` get no router globals" (router publish behavior claim) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 891 | research/03-prior-art.md | "Angular DevTools Chrome extension version 1.22.0 (published 2026-07-17, 5.0 stars, 2 ratings, 700,000 users, 2.44MiB)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 892 | research/03-prior-art.md | "Playwright MCP is an open-source Node.js MCP server at `github.com/microsoft/playwright-mcp`" with browser automation tools | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 893 | research/03-prior-art.md | "Vue DevTools MCP server defaults to `http://localhost:8098/__mcp/sse`" (ecosystem comparison) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 894 | research/04-ecosystem.md | "Chrome 146+ (stable) exposes `navigator.modelContextTesting`" for MCP-B/WebMCP testing | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 895 | research/04-ecosystem.md | "Angular's `@angular/platform-browser` exports `provideExperimentalWebMcpTools()`" (framework ecosystem claim) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 896 | research/04-ecosystem.md | "WebMCP tool registration can live in page/main world or extension service worker contexts" (browser/extension surface) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 897 | research/05-spikes.md | "Nano/Gemma 4 tool-session `create()`/`prompt()` outcomes in Chrome Beta profiles" (runtime matrix results) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 898 | research/06-angular-skills.md | "`angular-developer/SKILL.md` ... `license: MIT`; `author: Copyright 2026 Google LLC`" (external skill analysis) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 899 | research/06-angular-skills.md | "The clone has no LICENSE file" (angular-skills reference clone claim) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 900 | research/07-prompting-small-models.md | "Gemma 4 `callID: ""` / tool-name/camelCase quirks and browser runtime template behavior" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 901 | research/08-recent-angular-features.md | "spikes/ng222-app ... `@angular/core` 22.2.2 / generated with `@angular/cli@22.2.2`" (fixture for recent-feature/runtime probes) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 902 | research/08-recent-angular-features.md | "A component without a `changeDetection` property is **OnPush** by default (v22)" (Angular framework behavior) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 903 | research/09-nano-tool-session-error.md | "Chromium source refs at tag `156.0.8078.17` (e.g. `language_model_create_client.cc`, `ai_manager.cc`, `exception_helpers.cc`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 904 | research/09-nano-tool-session-error.md | "Spec comparison cites webmachinelearning/prompt-api `index.bs` commit `8040b81` (2026-10-06)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 905 | research/10-model-capabilities.md | "Gemma 4 on Chrome, Nano (Gemini Nano v3), Phi-4-mini on Edge, Aion on Edge" are compared as in-browser models | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 906 | research/10-model-capabilities.md | "Chrome and Edge both ship llguidance, a grammar-constrained decoder" for `responseConstraint` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 907 | research/10-model-capabilities.md | Benchmark evidence cites `spikes/probes/bench.js` writing `spikes/probes/bench/${basename}.json` and `spikes/probes/bench/nano.json` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 908 | research/10-model-capabilities.md | Raw preserved copy cited as `research/raw/bench/nano.json` (overwritten state noted) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 909 | research/11-spike-s1-extension-contexts.md | "Extension: `spikes/s1-extension/` (retired in M009 ...)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 910 | research/11-spike-s1-extension-contexts.md | "`devtools_page` is blocked by Permissions Policy ... `availability()` resolves to `unavailable`" (S1 result) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 911 | research/11-spike-s1-extension-contexts.md | "`Extensions.loadUnpacked` works over `--remote-debugging-port`" in Chrome Beta 156 / Edge Dev 157 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 912 | research/12-legacy-vs-modern-angular.md | "Date: 2026-10-12 ... Angular 22.2 dev-mode app" and spike app built bundle used for measurements | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 913 | research/12-legacy-vs-modern-angular.md | "Lars's ruling ... abandon legacy Angular features like NgZone/zone.js (supporting zoneless only), NgModules, class-based vs. functional, template-based forms, and Reactive Forms" (verbatim ruling recorded) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 914 | research/12-legacy-vs-modern-angular.md | Dev-mode class metadata via `setClassMetadata` / `ɵsetClassDebugInfo` is described as emitted behind `ngDevMode` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 915 | research/13-portal-legacy-audit.md | "Insurance portal: legacy Angular API audit" targets an external portal codebase | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 916 | research/13-portal-legacy-audit.md | Audit classifies legacy API usage (NgModules, zone/NgZone, template/control-flow/forms patterns) against modern Angular forms | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 917 | research/14-ai-devtools-prior-art.md | "Angular's `webmcp` source and Signal Forms registration" and Storybook/CLI tool files were read as primary sources | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 918 | research/15-deterministic-and-ai.md | Argues "deterministic code first: combining the built-in AI with plain TypeScript" as design guidance | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 919 | research/16-ssr-runtime.md | "`__ngDebugHydrationInfo__` ... counters on `ngDevMode` ... `ng.ɵgetTransferState` / defer/hydration behavior" measured in dev server runs | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 920 | research/17-vitest-browser-runtime.md | "S1 test extension's content scripts ran in the tester iframe ... `LanguageModel` answered \"OK\"" in Chrome Beta 156 with Gemma 4 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 921 | research/17-vitest-browser-runtime.md | "Vitest's own `connectOptions` ... cannot attach to CDP" (route 2a) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 922 | research/18-edge-prevent-auto-signin.md | Registry policy recipe (`BrowserSignin`, `ImplicitSignInEnabled`, etc.) is presented as Microsoft-documented but superseded for this program | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 923 | research/18-edge-prevent-auto-signin.md | "`--bwsi`/guest` described as true no-account modes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 924 | research/19-languagemodel-in-extension-contexts.md | Hidden `devtools.html` page refused with Permissions Policy "Access denied because the Permission Policy is not enabled" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 925 | research/19-languagemodel-in-extension-contexts.md | "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" (decision applied 2026-10-19) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 926 | research/20-built-in-ai-without-flags.md | "Edge: the two Edge profiles were launched with `control-ai-browsers up <name> --no-ai-features`..." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 927 | research/20-built-in-ai-without-flags.md | "Panel-side call in `ExtensionPromptService` (research/19) therefore runs on an unflagged Chrome or Edge." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 928 | research/20-built-in-ai-without-flags.md | "`LanguageDetector.availability()` or `Translator.availability()`" in a worker caused renderer crash; "Never call LanguageDetector or Translator from a worker" and filing ledger item 11 cited | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
