# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-02
Audited HEAD: 334ff8e50037c764e093894a0c1a972883e91a75
Alignment mode: no

Claim rows audited: 777 across 142 documents; with the 2 descriptive documents, the 144 frozen inventory paths.

## Summary

| Verdict | Count |
|---------|-------|
| verified | 648 |
| stale | 2 |
| aspirational | 3 |
| unverifiable | 124 |
| descriptive docs (no testable claims) | 2 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:67-229 - the instances map holds five entries: chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano |
| "Port (main checkout)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 - registry ports 9333, 9334, 9335, 9337, 9338 are the table five ports |
| "--user-data-dir under .commandcode\worktrees\.browsers\<name>" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:120 - PROFILES = resolve(ARTIFACT_ROOT, REGISTRY.profilesRoot); instances.json:2 profilesRoot is .browsers; control.mjs:536 passes --user-data-dir from inst.dir |
| "2 refused or could not run, with the reason (unknown instance" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:494 - refuse(names the unknown instance and the known ones), the exit-2 path |
| "spikes/probes/bench.js:4 hard-codes it, so bench refuses (exit 2) in a worktree" | feature | verified | spikes/probes/bench.js:4 - page.goto(http://localhost:4222/) hard-coded; control.mjs:2920 refuses bench outside the main checkout |
| "keeps the proof manifest features/.proven.json" | structure | verified | .commandcode/skills/control-ai-browsers/features/.proven.json present beside scripts/fingerprint.mjs (Test-Path True) |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 - port 9333 chrome-beta-nano, 9334 chrome-beta-gemma4, 9335 edge-dev-aion, 9337 edge-phi4mini, 9338 chrome-stable-nano |
| "npx nx run angular-ai-devtools:build-extension" | command | verified | apps/angular-ai-devtools/project.json:52 - the project declares a build-extension target |
| "The instances, their profiles (with the models) and their state files belong to the primary checkout" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:108 - git rev-parse --git-common-dir resolves the primary checkout; control.mjs:120 puts PROFILES under that root |
| "a tab the script opens on https://example.org/?ai-browsers=<purpose>" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:131 - PROBE_ORIGIN = https://example.org/; control.mjs:1225 appends ai-browsers=<purpose> |
| "--evidence=tmp/control-ai-browsers/evidence/<run-id>" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:168 - evidenceDir defaults to join(TMP, evidence, runId) unless --evidence names a dir |
| "four H2s in order: Sub-features, How to get to it (user POV), Driving it with control-ai-browsers, Gotchas" | structure | unverifiable | No docs lint enforces the H2 contract: grep for Sub-features over *.mjs/*.ts/*.json/*.js in the repo returns no match; a test asserting the four headings would settle it; settling check: `git cat-file -p HEAD:.claude/skills/control-ai-browsers/features/README.md` shows the four H2s; a test asserting them would pin it. |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends angular-ai:di-query (componentName, elementTag)" | feature | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 - chrome.runtime.sendMessage({ type: angular-ai:di-query, componentName, elementTag }) |
| "receives angular-ai:di-graph with a DiResolutionPath" | feature | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:17 - matches m.type === angular-ai:di-graph and m.resolutionPath |
| "Implementation: apps/angular-ai-devtools/src/app/di-doctor.service.ts, n3-di-doctor.component.ts, di-diff-display.ts" | structure | verified | all three files present in apps/angular-ai-devtools/src/app/ (directory listing), beside di-path-display.ts |
| "C panel <name> --url=http://localhost:4222/" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2295 - panel refuses without --url and drives scripts/panel.mjs |
| "The proof across every pair is verify-ai-browsers/checks/di-doctor.mjs" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs exists (directory listing of checks/) |
| "The Diff tab needs at least two resolution paths to compare" | feature | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts:40-58 - the diff walks a and b in parallel and names the divergence index |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "maps each to its owning component through ng.getOwningComponent" | feature | verified | extension/agent-main.js:643-648 - typeof ng.getOwningComponent is function, then ng.getOwningComponent(el) |
| "a digest of the official angular.dev/errors documentation bundled at extension build time" | feature | verified | scripts/generate-error-digest.mjs:31 - writes extension/error-digest.json, which is committed in extension/ and loaded by the panel build |
| "C panel <name> --url=http://localhost:4222/ --feature=error-explainer" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:239 - isErrors = feature === error-explainer; .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs:74 runs panel with --feature=error-explainer |
| "the driver injects a captured NG0100 error" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs:97 - fails unless the captured code is NG0100 |
| "Implementation: apps/angular-ai-devtools/src/app/error-explainer.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists and is routed in app.routes.ts:12 |
| "message type `angular-ai:error-capture` only — the explain step runs in the panel (`shouldCallModel`) and sends no message" | config | verified | .claude/skills/control-ai-browsers/features/error-explainer.md:31-34 - corrected wording; apps/angular-ai-devtools/src/app/error-explainer.component.ts:40-51 calls ExtensionPromptService.explainFacts in-panel and no `angular-ai:error-explain` string exists in src/, apps/ or extension/ |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The keeper launches the browser with --remote-debugging-pipe --enable-unsafe-extension-debugging" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:549 - the extension launch args are --remote-debugging-pipe and --enable-unsafe-extension-debugging; control.mjs:2139 spawns the keeper |
| "calls CDP Extensions.loadUnpacked" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:90 - sends method Extensions.loadUnpacked with the extension path |
| "up then turns developer mode on (Edge Dev 157 disables unpacked extensions without it) and prints the extension id" | feature | verified | control.mjs:2206 - developerMode = inTab(DEVELOPER_MODE); control.mjs:2259 returns { dir, id } for the loaded extension |
| "doctor s extension line opens chrome-extension://<id>/manifest.json and compares the name and version" | feature | verified | control.mjs:2263-2297 extensionCheck compares the served manifest with the folder, registered at control.mjs:2490 as check extension |
| "up refuses while the instance runs with another folder" | feature | verified | control.mjs:2081-2082 - refuse(names the extension the instance runs with) when the state file extensionDir differs |
| "extension/panel/ (main.js, styles.css and index.html with <base href=/panel/>)" | structure | verified | extension/panel/index.html:6 - <base href=/panel/>; extension/panel/ holds main.js and styles.css |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular AI DevTools 0.3.0" | config | verified | extension/manifest.json:3-4 - name is Angular AI DevTools and version is 0.3.0, the name and version doctor compares |
| "Nano. Run C doctor chrome-beta-nano. canary.tools is [SKIP]" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:95 - chrome-beta-nano has toolCanary false, so doctor reports the tool canary as skipped |
| "Doctor skips the page canaries when the model is not available" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2546-2549 - when Availability is not available each canary is added as skipped: LanguageModel is ... |
| "navigator.modelContext is undefined; WebMCP lives on document.modelContext" | feature | verified | control.mjs:1372 - records both typeof document.modelContext and typeof navigator.modelContext; control.mjs:1439 passes only when document.modelContext is an object |
| "Proofreader is not defined in these builds" | feature | verified | control.mjs:1369 - check Proofreader tests g.Proofreader and reports undefined rather than calling availability |
| "the canary sends callID and callId" | feature | verified | control.mjs:1424-1429 - reads c.callID ?? c.callId and builds LanguageModelToolSuccess({ callID: id, callId: id, ... }) |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a separate browser process with its own profile under .browsers\<name>" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:2 - profilesRoot is .browsers; scripts/control.mjs:120 builds PROFILES from that root under the artifact root |
| "the nine Aion features" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:137-147 - edge-dev-aion features array holds nine entries (AIPromptAPI ... msEdgeLLMOnDeviceModelPrerelease) |
| "The drift check parses both" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:640-641 - the regex alternates a quoted --user-data-dir with an unquoted one |
| "edge-dev-aion has --disable-component-update" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:148-150 - args: [--disable-component-update] |
| "json/version and /json/list for the CDP endpoint and its tabs" | feature | verified | scripts/control.mjs:506 - cdp = http://127.0.0.1:<port>; the same scripts poll /json/version and /json/list |
| "C up edge-dev-aion --backend=cpu exits 2 before anything starts" | feature | unverifiable | instances.json:159 gives edge-dev-aion backend.cpu null, but the refusal branch was not located in control.mjs in three lookups; an executed up --backend=cpu transcript would settle it |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Required panel test ids: interop-slice (container), interop-node (one per sliced node), interop-limit (the cannot-name statement)" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19-21 - data-testid interop-slice, interop-limit and interop-node are rendered per slice |
| "the shared explain, ai-answer, empty-state" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:16 empty-state, :26 explain, :33 ai-answer |
| "--feature=interop" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:241 - isInterop = feature === interop, with feature defaulting to version at panel.mjs:152 |
| "no runtime message type: the component reads the slices through `ExtensionMessageService` and sends no message" | config | verified | .claude/skills/control-ai-browsers/features/interop.md:40-42 - corrected wording; apps/angular-ai-devtools/src/app/interop.component.ts:40 reads slices from InteropService, and no `angular-ai:interop` type exists at extension/background.js:10 |
| "use the spikes/ng222-app fixture routes (/stale-view, /stale-view-deferred)" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 - path stale-view and path stale-view-deferred |
| "word the field-to-node attribution inferred, untested" | feature | verified | apps/angular-ai-devtools/src/app/interop.component.ts:2,25 - INFERRED_UNTESTED from interop.service.ts is rendered in the interop-inferred element |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The model folders in the profile: OptGuideOnDeviceModel\<version> (Nano), OptGuideManifestModel\<hash>\<version> (Gemma 4), EdgeLLMOnDeviceModel\<version> (Aion, Phi-4-mini)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:91,125,163 - the model.folders strings are OptGuideOnDeviceModel\<version>, OptGuideManifestModel\<hash>\<version> and EdgeLLMOnDeviceModel\<version> |
| "missing --confirm" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2843 - model clear refuses without --confirm=<model name from its manifest.json> |
| "Downloads need 20,480 MiB free on D: (Broker State)" | config | verified | instances.json:41,60 - both Edge browsers set minFreeMib 20480; the Chrome browsers set 22528 at instances.json:16,26, matching the doc parenthetical |
| "registry pin roots" | config | verified | instances.json:151-155 - edge-dev-aion pin lists EdgeLLMOnDeviceModel, EdgeLLMRuntime and EdgeOptimizationGuideModelsManifest |
| "model download <name> [--timeout-min=45]" | command | verified | control.mjs:238 - model download polls for --timeout-min, default 45 minutes, with the playwright-cli client waiting 5 minutes longer |
| "contextWindow 9,216" | config | verified | instances.json:94,128,194,225 - contextWindow 9216 for chrome-beta-nano, chrome-beta-gemma4, edge-phi4mini and chrome-stable-nano; 7168 for edge-dev-aion at instances.json:166 |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "probe-tools runs the two-tool round trip in spikes/probes/probe10.js" | structure | verified | spikes/probes/probe10.js:7-8,15-16 - the two tools are get_component_count and get_component_inputs |
| "bench.js hard-codes it" | config | verified | spikes/probes/bench.js:4 - await page.goto(http://localhost:4222/) |
| "bench.js has a 120 s per-prompt timeout" | config | verified | spikes/probes/bench.js:11 - const PROMPT_TIMEOUT_MS = 120000 |
| "Summarise with node spikes/probes/bench-summary.mjs" | structure | verified | spikes/probes/bench-summary.mjs exists and is called on the per-instance bench output at spikes/probes/bench-all.sh:21 |
| "A tool response must carry both callID (Chrome Beta 156) and callId" | feature | verified | spikes/probes/probe10.js:34-43 and spikes/probes/bench.js:105-108 send LanguageModelToolSuccess({ callID: id, callId: id, ... }); control.mjs:1424-1429 does the same in doctor |
| "bench does not use spikes/probes/bench-all.sh" | structure | verified | spikes/probes/bench-all.sh:13,16 - it attaches the bench-<name> sessions and pipes bench.js output to a file, recording no backend or load |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by angular-ai:record messages from the page-side tracer (extension/agent-main.js, src/main-world/provenance-tracer.ts)" | feature | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:117-118 - msg.type === angular-ai:record routes msg.cycle to causeService.recordCycle; extension/agent-main.js and src/main-world/provenance-tracer.ts both exist |
| "the fact list is the angular-ai:record message handled by ExtensionMessageService" | feature | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:103,117 - handleMessage of ExtensionMessageService branches on the angular-ai:record type |
| "The proof across every pair is verify-ai-browsers/checks/signal-provenance.mjs" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs exists in the checks directory listing |
| "C panel <name> --url=http://localhost:4222/" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2295 - panel refuses without --url and drives scripts/panel.mjs |
| "anti-pattern findings render when two snapshots differ" | feature | unverifiable | the path src/panel/anti-patterns.ts does not resolve and no snapshot comparison was found in three lookups; naming the source file or a test that pins the two-snapshot behaviour would settle it; settling check: `control.mjs panel --feature=signal-provenance` on two differing snapshots records the finding. |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the hedged wording the template may show a stale value" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 - the hedged span renders the text the template may show a stale value |
| "zero findings the panel renders an explicit empty state (no stale-view findings)" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:17 - the empty-state element renders no stale-view findings |
| "Implementation: apps/angular-ai-devtools/src/app/stale-view.component.ts" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts exists and is routed at apps/angular-ai-devtools/src/app/app.routes.ts:13 |
| "C panel <name> --url=http://localhost:4222/ --feature=stale-view" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:240 - isStale = feature === stale-view, reached from control.mjs panel |
| "no runtime message type: the scan runs through `StaleViewScanService` and the component sends no message" | config | verified | .claude/skills/control-ai-browsers/features/stale-view.md:30-32 - corrected wording; apps/angular-ai-devtools/src/app/stale-view.component.ts:1-3 injects StaleViewScanService and sends nothing, and the worker loads at stale-view-scan.service.ts:28 |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spikes/ng222-app, Angular 22.2.2, zoneless" | config | verified | spikes/ng222-app/package.json:21 - devDependencies pins @angular/cli ^22.2.2 for that fixture |
| "the two routes src/app/app.routes.ts:5-8 declares, /stale-view and /stale-view-deferred" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 - the routes array holds exactly those two paths |
| "portal api ... keeps it at 3000 ... control.mjs:69" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 - PORTAL_API_PORT = 3000 |
| "hardcodes http://localhost:3000/api/ at libs/shared/utils/src/lib/injection-tokens.ts:5" | config | verified | portal checkout libs/shared/utils/src/lib/injection-tokens.ts:5 - the factory returns http://localhost:3000/api/ |
| "SSR runs ng serve --port <port> --no-hmr in spikes/ng222-ssr" | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:93 - the ssr process args add --no-hmr |
| "S stands for .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs is git-tracked and byte-equal to its .commandcode sibling; this SKILL.md copy drifts by 18 path-prefix lines |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh page state: count 3, double 6, cart 1 item" | feature | verified | spikes/ng222-app/src/app/counter.ts:17-18 - count signal(3) and double computed as count x 2; counter.ts:5 - CartService items holds one entry |
| "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json decides whether a sidebar entry and its route exist" | feature | verified | portal apps/insurance-portal/src/app/sidebar.component.ts:33 - the entry is gated by *ngJournalFeatureFlag; libs/contract/routes/src/lib/routes.ts:10 - routes carry canMatch featureFlagGuard |
| "Portal data is random per API start: assert on structure, not on names or ids" | feature | verified | portal apps/api/src/claim/claim.service.ts:15-19 - faker generates claimNumber, contract, date and damageType at API start |
| "__ngc.navigate(url) is a setup shortcut" | feature | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:249-259 - the navigate helper wraps the router navigateByUrl global |
| "four H2s in order: Sub-features, How to get to it (user POV), Driving it with control-angular-dev-app ..., Gotchas" | structure | verified | .claude/skills/control-angular-dev-app/features/counter.md:7,15,21,45 - exactly those four H2 headings in that order |
| "S is .claude/skills/control-angular-dev-app/scripts/control.mjs" | structure | verified | that script exists and is git-tracked; this file is byte-identical to its .commandcode sibling (0 diff lines) |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Clicks: 3 (double 6, cart 1)" | feature | verified | spikes/ng222-app/src/app/app.ts:8 passes title="Clicks"; counter.ts:17-18 - count signal(3), double computed 6; counter.ts:5 - cart items holds one entry |
| "/stale-view and /stale-view-deferred belong to the stale-view fixtures (src/app/app.routes.ts:5-8)" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 - the routes array declares those two paths with StaleViewFixture and StaleViewDeferredFixture |
| "an effect that copies count into lastLogged" | feature | verified | spikes/ng222-app/src/app/counter.ts:23 - effect(() => this.lastLogged.set(this.count())) |
| "the component is OnPush by default (no changeDetection declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:8-14 - the @Component metadata carries no changeDetection field |
| "dependenciesOf(app-counter, double) returns dependsOn: [count]" | feature | verified | counter.ts:18 - double is a computed over count(); .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:183-196 - dependenciesOf reads the edge producers of that label |
| "A reload resets the count to 3; there is no persistence" | feature | verified | counter.ts:17 - count is an in-memory signal; nothing in spikes/ng222-app stores or restores it |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/claims" | integration | verified | portal libs/claim/data-access/src/lib/data-services/claim-data.service.ts:9 - the url is BaseUrl plus claims; libs/shared/utils/src/lib/injection-tokens.ts:5 - BaseUrl is http://localhost:3000/api/ |
| "claim-list table with columns Claim number, Damage Type, Date, Policynumber, Customer" | structure | verified | portal libs/claim/feature-list/src/lib/list.component.ts:23-27 - those five th elements in that order |
| "5 rows measured (the facade drops claims whose contract or customer is missing)" | feature | verified | portal apps/api/src/uuids.ts:9 - claim_uuids builds 5; libs/claim/data-access/src/lib/facades/claim-facade.service.ts:42,47,65 - unresolvable claims map to null and are filtered out |
| "row click opens /claim/<id>/details, heading Claim Details" | structure | verified | portal libs/claim/feature-list/src/lib/list.component.ts:33 - the row routerLink goes to /claim/<id>/details; libs/claim/feature-details/src/lib/details.component.ts:29 - header title Claim Details |
| "/claim/create shows the heading Complaint Create: an app bug" | status | verified | portal libs/claim/feature-create/src/lib/create.component.ts:39 - the claim create component renders ng-journal-header title="Complaint Create" |
| "eval () => __ngc.signals(ng-journal-list).edges" | feature | verified | portal libs/claim/feature-list/src/lib/list.component.ts:16 - the component selector is ng-journal-list; .claude/skills/control-angular-dev-app/scripts/ng-inspect.js - signals() returns nodes and consumer to producer edges |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/complaints and /api/customers" | integration | verified | portal libs/complaint/data-access/src/lib/data-services/complaint-data.service.ts:9 and libs/customer/data-access/src/lib/data-services/customer-data.service.ts:9 - each url is BaseUrl plus its resource; libs/shared/utils/src/lib/injection-tokens.ts:5 - BaseUrl is http://localhost:3000/api/ |
| "complaint-list columns Type, Customer, Date, Description; 2 seeded rows" | structure | verified | portal libs/complaint/feature-list/src/lib/list.component.ts:23-26 - those four th elements; apps/api/src/uuids.ts:10 - complaint_uuids builds 2 |
| "Select type (CustomerService, Sales, Payments)" | config | verified | portal libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:2-4 - the enum holds exactly those three values |
| "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | structure | verified | portal libs/customer/feature-list/src/lib/list.component.ts:23-30 - those eight th elements; apps/api/src/uuids.ts:3 - customer_uuids builds 30 |
| "Save sends POST /api/complaints (201)" | integration | verified | portal libs/complaint/data-access/src/lib/data-services/complaint-data.service.ts:21 - http.post to the complaints url |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at http://localhost:3000/api/contracts" | integration | verified | portal libs/contract/data-access/src/lib/data-services/contract-data.service.ts:9 - the url is BaseUrl plus contracts; libs/shared/utils/src/lib/injection-tokens.ts:5 - BaseUrl is http://localhost:3000/api/ |
| "contract-list table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email; 20 rows after a fresh API start" | structure | verified | portal libs/contract/feature-list/src/lib/list.component.ts:34-39 - those six th elements; apps/api/src/uuids.ts:6 - contract_uuids builds 20 |
| "Edit opens /contract/<id>/edit, heading Contract Edit" | structure | verified | portal libs/contract/feature-edit/src/lib/edit.component.ts:51 - ng-journal-header title="Contract Edit" |
| "then sends PUT /api/contracts" | integration | verified | portal libs/contract/data-access/src/lib/data-services/contract-data.service.ts:25 - http.put to the contracts url |
| "Snapshot shows the `Contract Details` title with a separate `Edit` button" | status | verified | .claude/skills/control-angular-dev-app/features/portal-contracts.md:39 - corrected wording; portal libs/contract/feature-details/src/lib/details.component.ts:41-47 renders the title with a separate Edit button |
| "contract-create: Status chip Pending" | feature | verified | portal libs/contract/feature-create/src/lib/create.component.ts:112 - status: ContractStatusDto.Pending |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home" | structure | verified | portal apps/insurance-portal/src/app/app.routes.ts:5-7 - the empty path with pathMatch full redirects to home |
| "each home tile is a link to /<domain>/list" | structure | verified | apps/insurance-portal/src/app/home.component.ts:16,26,37,49 - four anchors routerLink to /contract/list, /claim/list, /complaint/list and /customer/list |
| "any unknown path renders Page Not Found and Sorry, but the page you were trying to view does not exist." | feature | verified | apps/insurance-portal/src/app/app.routes.ts:33-35 - the ** path loads PageNotFoundComponent; page-not-found.component.ts:7-8 - that h1 and paragraph |
| "the domain routes carry canMatch feature-flag guards" | feature | verified | portal libs/contract/routes/src/lib/routes.ts:10,16,22,28 - canMatch featureFlagGuard on list, create, edit and details |
| "sidebar entries List and Create per domain (Customer has List only) and Home" | structure | verified | apps/insurance-portal/src/app/sidebar.component.ts:78-102 - General Home, then contract, claim and complaint with List and Create, customer with List only |
| "Click a sidebar entry (a div with routerLink, not a link)" | feature | verified | apps/insurance-portal/src/app/sidebar.component.ts:33-45 - a div carries [routerLink], [routerLinkActive] and the label |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Open <url> (http://localhost:4223/)" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:90 - the ssr target serves on 4223 in slot 0 |
| "It shows the heading Render mode: server" | feature | verified | spikes/ng222-ssr/src/app/page.ts:10 - h1 Render mode {{ mode() }}; src/app/app.routes.server.ts:4 - the empty path is RenderMode.Server |
| "a @defer (hydrate on interaction) block holding a Deferred click button" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15-17 - the incrementally hydrated @defer block wrapping app-deferred |
| "/ is ssr, /prerender is ssg, /client is the bare shell with <body ngcm>" | feature | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - RenderMode.Server, Prerender and Client for those three paths |
| "?mismatch=1 (structural hydration mismatch, NG0500)" | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:80 - expected-mismatch-detected needs a mismatched Mismatch node plus an NG0500 console error |
| "ok is true when all six checks pass; expected-mismatch-detected is the ?mismatch=1 case" | command | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:78-80 - hydration-counters and expected-mismatch-detected are named checks that feed ok |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:89 - const EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh |
| "session ngdt, CDP port 9420" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:273 - MAIN_CDP_PORT = 9420; :311 - SESSION is ngdt for the main flow |
| "Playwright bundled Chromium (Chrome for Testing 156.0.8078.4, revision 1248), read 2026-11-01 from node_modules/playwright-core/browsers.json" | config | verified | node_modules/playwright-core/browsers.json - the chrome for testing entry has revision 1248 with browserVersion 156.0.8078.4 |
| "panel evaluates Extensions.extensionServer.onShowPanel({command: showPanel, id: chrome-extension://<id>Angular})" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:810 - that onShowPanel call with PANEL_ID |
| "graph nodes are ng-signal-graph-pane .node-cont.kind-<kind>" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:830 - readSignalGraph selects ng-signal-graph-pane .node-cont and reads the kind- class |
| "S=.claude/skills/control-angular-devtools/scripts/control.mjs" | structure | verified | that script is git-tracked and byte-equal to its .commandcode sibling; only this SKILL.md copy drifts, by 6 path-prefix lines |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at spikes/ng222-app (Angular 22.2.2)" | config | verified | spikes/ng222-app/package.json:21 - devDependencies pins @angular/cli ^22.2.2 |
| "Test harness: node $S install, node $S up --app-url=<app url>, node $S doctor exits 0" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1601 - the COMMANDS table dispatches install, uninstall, status, up, doctor, attach, panel and coexist |
| "Evidence stays in tmp/control-angular-devtools/evidence/ (git-ignored)" | config | verified | control.mjs:94 - TMP is tmp/control-angular-devtools; :1172 - evidenceDir is TMP/evidence/<stamp>; .gitignore:7 - tmp/control-angular-devtools/ |
| "App page: playwright-cli session ngdt; roles and accessible names first" | feature | verified | control.mjs:311 - SESSION is ngdt for the main flow |
| "Router Tree shows only when the app provides the router (devtools-tabs.component.ts); Transfer State only for a hydrated (SSR) app" | feature | unverifiable | the DevTools extension bundle sits outside this repository; read devtools-tabs.component.ts from the installed extension copy to settle it; settling check: `control.mjs doctor` prints the installed DevTools extension path whose `devtools-tabs.component.ts` settles it. |
| "S is .claude/skills/control-angular-devtools/scripts/control.mjs" | structure | verified | the script exists and is git-tracked; this README drifts from its .commandcode sibling by one path-prefix line |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S attach" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1601 - attach is a dispatched COMMANDS entry |
| "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | feature | verified | control.mjs:891 - the init script traps the flag with an accessor and records flagSetAt; :905 - it is read as flag === true |
| "attach exits 1 because it requires isDebugMode" | status | verified | control.mjs:1349 - the pass condition needs flag, isAngular, isDebugMode, backendInstalled and backendReady |
| "Detection result: isAngular, isDebugMode (development build), isIvy, isSupportedAngularVersion (major 12+ or 0)" | feature | unverifiable | the detectAngular payload is produced by the extension MAIN-world script outside this repository; a recorded attach run or the extension copy would settle the field names; settling check: `control.mjs attach` against the counter fixture records the `detectAngular` payload fields. |
| "Expected (measured on the counter fixture): ... Angular 22.2.2" | config | verified | spikes/ng222-app/package.json:21 - the fixture pins @angular/cli ^22.2.2 |
| "the content script still injects the backend (it gates on isAngularDevTools, isAngular and an HTML document, not on isDebugMode; built 1.22.0 app/content_script_bundle.js)" | feature | unverifiable | the extension bundle is outside this repository; read content_script_bundle.js from the installed extension copy to settle it; settling check: `control.mjs doctor` prints the installed extension path whose `content_script_bundle.js` settles it. |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Store page: https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:91 - STORE_URL is chromewebstore.google.com/detail/ plus EXT_ID |
| "polls the profile every 2 s until the extension appears (default 180 s)" | command | verified | control.mjs:1024 - the profile poll runs on a 2000 ms interval with the 180 s default timeout |
| "Extensions page: chrome://extensions/?id=ienfalfjdbdpebioblfackkekamfmbnh or edge://extensions/?id=..." | structure | verified | control.mjs:962 - extensionsPage is the browser scheme plus extensions/?id=EXT_ID |
| "doctor line extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)" | status | verified | control.mjs:1331 - the extension check prints name, version, state, location and path from getExtensionInfo |
| "enabled for branded browsers is read from disable_reasons and state" | feature | verified | control.mjs:960 - enabled needs installed, no disableReasons and state not 0 |
| "--profile P picks the profile read and also passes --profile-directory=P" | config | verified | control.mjs:980 - the spawned browser gets --profile-directory=<profile> |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through ng.setProfiler, which keeps a list of subscribers in Angular 22" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:136 - const profilerCallbacks = []; :144-149 - setProfiler pushes the callback and returns its remover; node_modules/@angular/core/types/core.d.ts:8783 - the exported signature |
| "ng.setProfiler(null) clears every subscriber, DevTools included" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:150-152 - the null branch runs profilerCallbacks.length = 0 and returns a noop remover |
| "remove your own with the function setProfiler(cb) returns" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:149 - return () => removeProfiler(profiler) |
| "node $S coexist" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1601 - coexist is a dispatched COMMANDS entry |
| "Expected (measured): own subscribers bothOn a 16 b 16, afterRemoveA a 16 b 32; DevTools recorded 2 change detection cycles" | status | unverifiable | these counters come from one recorded harness run; the evidence files under tmp/control-angular-devtools/evidence/ would settle the numbers and they are not derivable from source; settling check: `control.mjs coexist` on the counter harness records the subscriber counters and the cycle count. |
| "DevTools subscriber cannot be listed from the page (the list is module-private)" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:136 - profilerCallbacks is a module-scoped const, never exported on ng |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S panel signal-graph --component=app-counter" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1379 - panel dispatches the signal-graph subcommand; :1394 - the accepted subcommands are show, signal-graph and screenshot |
| "Signal graph nodes (kind, label, value) and edges" | feature | verified | control.mjs:830 - readSignalGraph maps each ng-signal-graph-pane .node-cont to its kind- class and its text lines |
| "Agreement with ng.getSignalGraph(ng.getInjector(host)), which the pane backend calls" | feature | verified | control.mjs:1490 - the page read is ng.getSignalGraph(ng.getInjector(document.querySelector(sel))).nodes; :1409 - the two node lists are compared as kind:label |
| "Expected on the fixture before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | status | unverifiable | this is a live-panel reading; only a recorded coexist run under tmp/control-angular-devtools/evidence/ settles it (the labels trace to spikes/ng222-app/src/app/counter.ts:16-21); settling check: `control.mjs coexist` on the counter fixture records the node labels before the action. |
| "After angular:di_graph (measured 2026-10-11): pane signal:count, effect:Effect" | status | unverifiable | the template-node loss is observable only in a live panel run; a recorded coexist --di-graph evidence set would settle it; settling check: `control.mjs coexist` records the pane labels after `angular:di_graph`. |
| ".node-cont.kind-* are DevTools 1.22.0 class names; re-read them from the live panel after an update" | config | unverifiable | the class names live in the extension signals-visualizer.ts outside this repository; read it from the installed extension copy to settle the version attribution; settling check: `control.mjs doctor` prints the extension path whose `signals-visualizer.ts` records the class names. |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@pangular-inspector/devtools` ... pinned 0.0.7" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 - `const PINNED = '0.0.7'` |
| "defaults to 9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 - `DEFAULT_PORT = 9999`, the docs' standalone port |
| "none of the eight action tools (`highlight`, `navigate`, `dispatch-ngrx-action`, `form-action`, `fill-form`, `set-http-rule`, `remove-http-rule`, `analog-call-api`)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:76 - ACTION_TOOLS holds exactly those eight names |
| "the eight action tools need `--confirm`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:373 - refusal text `refused: <tool> acts on the app; pass --confirm` |
| "The state file is per port (`tmp/control-pangular-inspector/state/pangular-<port>.json`)" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:70,1009 - SCRATCH is tmp/control-pangular-inspector; statePath joins `pangular-${p}.json` |
| "With `--read-only`, 0.0.7 lists 46 tools" | status | unverifiable | a `node $S tools` run against a `--read-only` 0.0.7 server would settle the count; no such run is recorded in this repository; settling check: `control.mjs tools` against a `--read-only` 0.0.7 server counts the tools. |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-pangular-inspector/scripts/control.mjs`" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:3 - header names control-pangular-inspector and its commands |
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 - the state carries `session: pangular-<port>` and `evidenceDir` |
| "Action tools (`navigate`, `fill-form`, `form-action`, `highlight`, ...) need `up --allow-actions` and `call ... --confirm`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1056,373 - readOnly = !--allow-actions, and call refuses an action tool without --confirm |
| "Each feature file starts with an H1 and one paragraph of user-visible behavior, then four H2s in this order" | structure | verified | setup.md, live-inspection.md, navigation.md, source-scan.md and panel.md all carry H2s Sub-features, How to get to it (user POV), Driving it with control-pangular-inspector, Gotchas |
| "Setup: `node $S check` exits 0 (pin, overlay import, proxy)" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:583-595 - setupChecks adds declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 - mcpUrl is `http://localhost:${p}/__mcp` on the 9999 default |
| "the component outline (`components`; `list-components` on versions after 0.0.7)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1445 - list-components only when the server has it (unreleased after 0.0.7), else the component-tree resource |
| "`node $S call inspect-signals --args '{"selector":"ng-journal-list"}' --out inspect-signals.json`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1574,1201 - call takes --args and --out, and the answer is saved |
| "Instance ids (`cgg06-4`) change with every page load; re-read the tree before using one" | status | unverifiable | two page loads of the portal page in one session would settle it; the portal checkout is outside this repository; settling check: `control.mjs components` after two page loads records whether the instance ids change. |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S call explain-navigation --args '{"limit":2}' --out explain-navigation.json`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1574 - call passes --args JSON and saves the answer with --out |
| "`node $S call inspect-route --out inspect-route.json`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1201,1279 - call sends tools/call and refuses an unknown tool |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | feature | unverifiable | a live explain-navigation with no limit on the portal would settle it; the default lives in the 0.0.7 package, not here; settling check: `control.mjs call explain-navigation` against a 0.0.7 server records the default and maximum `limit`. |
| "`node $S call list-routes` (12 routes, measured)" | status | unverifiable | a live list-routes against the portal would settle the route count; settling check: `control.mjs call list-routes` against the portal counts the routes. |
| "one `info` finding, `missing-title`" | status | unverifiable | a live lint-routes against the portal would settle the finding; settling check: `control.mjs call lint-routes` against the portal records the findings. |
| "The page keeps `limits.navigations` (50) entries" | config | unverifiable | the 0.0.7 overlay source or a read after more than 50 navigations would settle it; neither is in this repository; settling check: `control.mjs call` past 50 navigations records the retained `limits.navigations` entries. |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:535 - the proxy entry `/__pangular` strips the prefix and sets ws; .claude/skills/control-angular-dev-app/scripts/control.mjs:100 - the portal app port is 4500 + slot |
| "`http://localhost:9999/` directly" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 - the standalone server's fixed default port 9999 |
| "`Angular 22.2.2`, and `Agent` then `Read-only` (measured)" | config | verified | research/13-portal-legacy-audit.md:3 - the portal checkout recorded on Angular 22.2.2 |
| "the eight tab names, `LIVE`" (Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP) | structure | unverifiable | a panel snapshot at http://localhost:4507/__pangular/ would settle the tab list, which is the 0.0.7 package's UI; settling check: `control.mjs snap` on the panel page records the eight tab names. |
| "icon only, accessible name `Toggle Pangular Inspector`" | feature | unverifiable | `playwright-cli -s=pangular-9999 find "Toggle Pangular"` on the portal page would settle it; settling check: `control.mjs snap` on the portal page records the toggle accessible name. |
| "A code expires after 5 minutes" | status | unverifiable | the one-time-code lifetime is in the 0.0.7 package and its log, not in this repository; settling check: `control.mjs call` on the panel one-time-code flow records the code lifetime. |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup.check`: six read-only facts, one line each" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:583-595 - six add() calls: declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |
| "`node $S install --json` -> `changed` lists `package.json`, `package-lock.json`, ..." | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:953 - the install result carries `changed: dirtyPaths(dir)` |
| "The `main.ts` edit needs the form `bootstrapApplication(...).catch(`; anything else exits 2" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:465,927 - the regex requires that form, else exit 2 |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:388-402 - first project.json whose serve executor is @angular/build:dev-server |
| "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | status | unverifiable | a fresh `install` in the portal checkout would settle the line count; that worktree carries the setup uncommitted; settling check: `control.mjs install` in the portal checkout then `git diff --stat` records the lockfile insertions. |
| "npm 11 rewrites this lockfile on any install" | status | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:850 - npm 11 drops 27 committed lockfile entries on any install, and install puts them back |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The script: `scan <tool>`, which starts that server, calls one tool and stops it" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1482-1540 - scan() runs the CLI's stdio MCP server and sends one tools/call |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1540 - saved with evidenceDir SCRATCH/scan |
| "`scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1490 - the scan usage names exactly those tools |
| "`--read-only` drops only the action tools" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:76,607-614 - readOnlyCheck fails when a --read-only list holds an action tool |
| "`build-meta` ... Angular `22.2.2`, ... TypeScript `6.0.3`, `ssr: false` (measured)" | status | unverifiable | a live `node $S scan build-meta` on the portal checkout would settle the versions; settling check: `control.mjs scan build-meta` on the portal checkout records the versions. |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest's default 63315 cannot be used here, because it sits in a Windows excluded port range" | config | verified | spikes/ng222-app/vitest-base.config.mts:3 - the comment states 63315 sits in a Windows excluded port range on this machine |
| "`--port`, passed as `VITEST_BROWSER_PORT` to `vitest-base.config.mts` (`strictPort`)" | config | verified | spikes/ng222-app/vitest-base.config.mts:6,16 - browserPort from VITEST_BROWSER_PORT, then test.api with strictPort true |
| "Vitest `51400 + slot`, bundled CDP `9500 + slot`" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:113,116 - the worktree rows are 51400 + slot and 9500 + slot |
| "The playwright-cli session is `control-vitest-<flowId>-<Vitest port>`" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:899 - session literal `control-vitest-${flowId}-${vitestPort}` |
| "`--hold <ms>` sets `VITE_COUNTER_HOLD_MS`" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:586 - env VITE_COUNTER_HOLD_MS = state.hold |
| "a custom provider that calls `chromium.connectOverCDP(VITEST_CDP_URL)`" | integration | verified | spikes/ng222-app/vitest-attach.config.mts:26,30 - chromium.connectOverCDP(cdpUrl) in CdpAttachProvider |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:3 - header names control-vitest-browser-angular and its commands |
| "Take `<session>`, `<cdpUrl>`, `<evidenceDir>` and `orchestratorUrl` from `node $S info`" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:899,986 - the state holds session, orchestratorUrl, evidenceDir |
| "Each feature file has an H1, one paragraph of user-visible behaviour, then four H2s in order" | structure | verified | counter-tests.md, held-counter.md and extension-in-tester.md carry exactly Sub-features, How to get to it (user POV), Driving it with control-vitest-browser-angular, Gotchas |
| "`mounted-component` passes only while the hold test runs" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1146 - warn `no [ng-version] host now: no test is running` |
| "wait for `RERUN` in `<evidenceDir>/ng-test.log`" | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:509 - RUN_STARTED matches DEV, RUN or RERUN |
| "`ui: false` in both runner configs" | config | verified | spikes/ng222-app/vitest-attach.config.mts:60 and spikes/ng222-app/vitest-extension.config.mts:34 - ui: false in both |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two tests always run ... Two more run only when their environment variable is set" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts:20,30 - plain it(); :39 VITE_COUNTER_TIMING_DEMO and :56 VITE_COUNTER_HOLD_MS guard the other two |
| "an Increment click moves "Clicks: 3 (double 6, cart 1)" to "Clicks: 4 (double 8, cart 1)"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23,27 - the two toHaveTextContent assertions |
| "a `CartService` override shows "cart 2"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:32,34 - CartService overridden with ['pear', 'plum'], text asserted as cart 2 |
| "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" | status | unverifiable | the run's own log settles it: `node $S up`, then doctor's `test-run` summary; no run is recorded in this repository; settling check: `control.mjs up` on the tester then `control.mjs doctor` records the test summary. |
| "`expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'`" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:49 - toContain('Clicks: 4') on the text asserted at :23, so the failure prints that received string |
| "touching a source file reruns the suite in watch mode" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:509 - the ready check accepts a RERUN start |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/s1-extension` was retired in M009" | status | verified | git c3e8f57 "T005: Retire spikes/s1-extension after its evidence is archived"; .project/archive/009-consolidation-hardening/tasks/T005-retire-s1-extension.md |
| "its evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`" | structure | unverifiable | that archive lists MANIFEST, tasks and research files only; an S1 evidence file there would settle the claim; settling check: `git cat-file -p HEAD:.project/archive/001-run-unrun-spikes/` lists the archived notes of that run. |
| "`ext-content-script` an isolated world from `chrome-extension://<id>` exists in the tester iframe" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1153 - extension-content-script checks an isolated world in the tester iframe |
| "`extension-loaded` the extension's service worker target exists" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1166 - pass on a service worker for the extension id |
| "`LanguageModel.availability()` is `available` ... `unavailable` in bundled mode" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:539 - bundled Chromium has no model, so a missing one is a warning |
| "keyed `content_isolated\|frame\|/`, `content_main\|frame\|/`, `devtools_panel`" | structure | unverifiable | the S1 variant's storage keys come from the extension; spikes/probes/vitest-attach.mjs writes them as extensionStorage in research/raw/vitest-attach-<label>.json |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "renders `Counter` in the tester iframe with `CartService` overridden to `['pear', 'plum']`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:56,61 - the hold test's setup({ cartItems: ['pear', 'plum'] }) |
| "the page shows "Clicks: 3 (double 6, cart 2)"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:34 - with pear and plum the cart count renders 2 |
| "`ng.ɵgetSignalGraph(ng.getInjector(host))`: template `div` -> `title`, `count`, `double`" | feature | verified | research/17-vitest-browser-runtime.md:217 - the recorded graph: template div -> title, count, double and the cart's unnamed node |
| "every `ng.*` read works on the host `<div id="rootN" ng-version="22.2.2">`" | feature | verified | research/17-vitest-browser-runtime.md:212 - TestBed renders into that div, not into app-counter |
| "The runner starts its own `ng test` and needs no run from this skill" | feature | verified | spikes/probes/vitest-attach.mjs:99 - spawns ng.js test with --filter "keeps the counter mounted" |
| "`ng.ɵgetInjectorProviders` throws on the null injector at the end of the resolution path" | status | unverifiable | a probe call on the held Counter's resolution path would settle it; no such capture is recorded; settling check: `control.mjs up` on the tester and the probe capture record the `ɵgetInjectorProviders` throw. |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome Beta with Gemini Nano or Gemma 4, Chrome stable with Gemini Nano, Edge Dev with Aion-1.1-Instruct, Edge stable with Phi-4-mini" | config | verified | .claude/skills/control-ai-browsers/instances.json - instances chrome-beta-nano, chrome-beta-gemma4, chrome-stable-nano, edge-dev-aion, edge-phi4mini with those model names |
| "`C=.commandcode/skills/control-ai-browsers/scripts/control.mjs`" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs is present and its control-ai-browsers SKILL.md is a 37819-byte copy in both trees |
| "`node .commandcode/skills/verify-ai-browsers/checks/state.mjs --evidence <dir> [<instance>...]`" | command | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:9 - the usage line is exactly that |
| "`C model download <instance> --timeout-min=45`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:244 - positiveFlag('timeout-min', ..., 45) |
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:11 - the header states those three exit codes |
| "artifact `state.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:10 - Writes <dir>/state.json |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`D=.claude/skills/control-angular-devtools/scripts/control.mjs`" | structure | verified | .claude/skills/control-angular-devtools/scripts/control.mjs exists and its usage line (:1592) names install, up, down and coexist |
| "condition: `["node", ".claude/skills/verify-angular-devtools/checks/<id>.mjs", "--out", "{up.evidenceDir}"]`" | command | verified | .claude/skills/verify-angular-devtools/checks/extension-enabled.mjs, attached.mjs and coexist.mjs exist with that --out usage (:10 in coexist.mjs) |
| "With `--di-graph` it runs `angular:di_graph` last and records whether the template node is lost, without judging it" | feature | verified | .claude/skills/verify-angular-devtools/checks/coexist.mjs:5,9,66 - forwards coexist --di-graph, and :69 returns templateLostInPane as data |
| "`coexist` reports the profiler part (two `ng.ɵsetProfiler` subscribers count while DevTools records ...)" | feature | verified | .claude/skills/verify-angular-devtools/checks/coexist.mjs:5 - its header claim names the profiler part, the connected flag and the signal-graph pane |
| "`install --from` takes the harness copy already in the checkout" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1592 - install accepts [--from edge-dev\|edge\|chrome\|chrome-beta\|<dir>] |
| "`templateLostInPane: true` is the known Angular bug" | status | verified | docs/filing-ledger.md:5 - angular:di_graph creates a ViewContainerRef on each host, after which ng.ɵgetSignalGraph loses the template consumer |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`P=.claude/skills/control-pangular-inspector/scripts/control.mjs`" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs exists and its usage line (:1574) names up, doctor, info and down |
| "artifacts: `{up.evidenceDir}/contract-list.png` and `{up.evidenceDir}/live-reads.json`" | structure | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:11 - writes before.yml, after.yml, contract-list.png, doctor.json, live-reads.json |
| "`tools-list.json` and `navigate-refused.json` for `read-only`" | structure | verified | .claude/skills/verify-pangular-inspector/checks/read-only.mjs:9,54,61 - writes both files |
| "`call navigate` without `--confirm` is refused (exit 2 with its `refused: navigate ... --confirm` reason)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:373 - the refusal is produced before any request is sent |
| "artifact `setup-check.json`" | structure | verified | .claude/skills/verify-pangular-inspector/checks/setup.mjs:8,65 - writes <dir>/setup-check.json |
| "The setup steps need ports 3000 and 9999 free (both fixed)" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:101 - PORTAL_API_PORT 3000 as a fixed pinned port; .claude/skills/control-pangular-inspector/scripts/control.mjs:74 - fixed 9999 |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the pstack effort agents (`effort-low`, ..., `effort-max`) set `reasoningEffort` in their frontmatter and do not pin a model" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\effort-low.md:4 - frontmatter declares `reasoningEffort: low` and carries no `model:` key |
| "levels: low, medium, high, xhigh, max" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\ - one agent per level: effort-low.md, effort-medium.md, effort-high.md, effort-xhigh.md, effort-max.md |
| "reflection/beam:free" listed among free models | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\free-beam-high.md:4 - `model: reflection/beam:free` |
| "poolside/laguna-s-2.1-free" listed among free models | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\free-laguna-s-2-1.md:4 - `model: poolside/laguna-s-2.1-free` |
| "minimax/minimax-m3.1-flash:free" listed among free models | config | unverifiable | no free-minimax agent under C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\ (only free-ling-3-1-flash, free-beam, free-glyph, free-laguna) and no minimax key in C:\Users\LarsGyrupBrinkNielse\.commandcode\config.json; a provider model list would settle it |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:70-201 - five registry entries on ports 9333, 9334, 9335, 9337 and 9338 |
| "The playwright-cli session is `ai-<instance>-<port>`, on the registry port too" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:470-471 - sessionOf returns `ai-${name}-${port}` |
| "`up` tries the next slot, `9600 + 10 * slot + index` ... 10 slots in all" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:441-449 - portAt returns 9600 + 10 * slot + index; SLOT_TRIES = 10 at line 125 |
| "`--backend=cpu` exits 2: forcing CPU on Edge deletes the installed model" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:523 - refuse() names the model deleted by forcing CPU on Edge |
| "Exit 0 healthy, 1 a check failed, 2 the instance is not running or the command could not run" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:133,2041-2043 - EXIT map and exitCode() map refused to 2 and unhealthy to 1 |
| "`Extensions.loadUnpacked` answers only over `--remote-debugging-pipe`" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:549 - pipe and unsafe-extension-debugging switches; pipe-keeper.mjs:90 sends Extensions.loadUnpacked |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | status | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 - the five registry ports, one per instance |
| "the panel is built (`npx nx run angular-ai-devtools:build-extension`) before `up`" | command | verified | apps/angular-ai-devtools/project.json:52-62 - build-extension target with outputPath base extension/panel |
| "Its session is `ai-<instance>-<port>`; read it from `C info <instance> --json` (`session`)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:470-471 and 2971 - sessionOf plus info JSON field session |
| "Each feature file starts with an H1 and one paragraph of behaviour, then four H2s in order" | structure | verified | .commandcode/skills/control-ai-browsers/features/instances.md:1,7,15,23,39 - H1 then Sub-features, How to get to it (user POV), Driving it with control-ai-browsers, Gotchas; same order in all ten feature files |
| "A worktree or a GSD Path sidecar reaches the same running instances on the same ports" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:108-120 - PRIMARY from git rev-parse --git-common-dir, profiles resolved under .browsers |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`) and receives `angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:16-25 - handles angular-ai:di-graph and sends angular-ai:di-query with componentName and elementTag |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs:10,50 - usage over every named instance and one panel call per instance |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | verified | apps/angular-ai-devtools/project.json:52-62 - build-extension outputPath base is extension/panel |
| "`up --target counter` prints the URL (`http://localhost:4222/` in the main checkout)" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:82,961 - counter target and port 4222 in slot 0 |
| "The Diff tab needs at least two resolution paths to compare" | feature | verified | src/panel/di-diff-display.ts:34 - diffDiPaths takes two DiResolutionPath values |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "message type `angular-ai:error-capture` only; `angular-ai:error-explain` has no producer or consumer" | integration | verified | .commandcode/skills/control-ai-browsers/features/error-explainer.md:31-34 - corrected wording; extension/background.js:10 relays only record, state, di-graph and error-capture |
| "The panel sends the error code, the owning component name and the matching digest entry" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:36-46 - resolveDigest(err.code) and buildErrorExplainFacts(err, digest) |
| "a digest of the official `angular.dev/errors` documentation bundled at extension build time" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:7 - imports extension/error-digest.json (61577 bytes on disk) |
| "With zero captured errors the panel renders an explicit empty state" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:13-14 - capturedErrors().length === 0 renders EMPTY_STATE |
| "An error with no owning component reports 'no owning component'" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:5,19 - NO_OWN_COMPONENT rendered in the owning-component cell |
| "An error code with no digest entry yields an explicit 'no digest entry' answer; the model is not asked to invent one" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:42-45 - shouldCallModel false sets NO_DIGEST_ENTRY and returns before the prompt |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Branded Chrome ignores `--load-extension`, so every instance starts through `scripts/pipe-keeper.mjs`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:543-549 - keeper switches added for an instance with an extension; pipe-keeper.mjs:3-4 loads it over the pipe |
| "`panel <name> --url=<app>` drives N1 end to end (`scripts/panel.mjs`)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2294-2301 - cmdPanel calls drivePanel from panel.mjs with the url |
| "With `--json` the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:12-28,160 - the run object declares exactly those fields |
| "DevTools 157 keys extension panels as `extension-panel-<uuid>_<n>`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:51-57 - panelKey returns the key starting with extension-panel- |
| "Angular detection still comes from the content scripts (`relay.js`, `agent-main.js`)" | integration | verified | extension/manifest.json:18-28 - content_scripts entries relay.js and world MAIN agent-main.js |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2447-2564 - nineteen distinct add() check ids; tests/docs-alignment.test.mjs:9-12 asserts the phrase |
| "`Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok from <primary checkout>/extension`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2285 - that format string with the id from extensionId(); extension/manifest.json:3-4 - name and version |
| "`health-webmcp` proves `document.modelContext` is an object" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1439 - pass is typeof document.modelContext === 'object' |
| "`canary.tools` is `[SKIP]` for Nano and reported only for Phi-4-mini" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:95 toolCanary false, :195 report; scripts/control.mjs:2033-2034 - toolsPass returns null for report |
| "`health-extension` proves the instance serves the unpacked extension the state file records (`extensionDir`)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2269-2285 - extensionCheck(inst, inst.extensionDir) compares name and version with the folder manifest |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a separate browser process with its own profile under `.browsers\<name>`" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:2 - profilesRoot is .browsers; scripts/control.mjs:118-120 - PROFILES resolves it under the primary checkout's .commandcode/worktrees |
| "Run `C instances`. One line per instance (five), each `[OK]` with PID, `backend gpu` and `1 tab(s)`; a stopped instance reads `stopped`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2059 - log line carries PID, backend, tab count, else stopped |
| "Run `C flags edge-dev-aion`. `[OK]` with the nine Aion features; exit 1 names any feature missing or not in the registry" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:137-147 - nine features; scripts/control.mjs:2425-2430 computes missing and extra, exit 1 via :2041 |
| "`C up edge-dev-aion --backend=cpu` exits 2 before anything starts" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:519-523 - backend validated and refused before launch |
| "Edge restores the last session's tabs at start; `up` closes them and keeps the blank tab" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2189,2223 - restored tabs closed and logged after readiness |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "no runtime message type; `angular-ai:interop` has no producer or consumer" | integration | verified | .commandcode/skills/control-ai-browsers/features/interop.md:40-42 - corrected wording; extension/background.js:10 relays only record, state, di-graph and error-capture |
| "Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node), `interop-limit` ... `interop-inferred`" | feature | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19-25 - data-testid interop-slice, interop-limit, interop-inferred; scripts/panel.mjs:261 - interop-node selector |
| "pass `--extension <absolute path of the checkout the instance runs>`" | command | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:146-157 - --extension option resolved into targets.extension |
| "the `spikes/ng222-app` fixture at `/stale-view`, or the deferred `/stale-view-deferred` route" | feature | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 - both routes registered |
| "The panel states the intrinsic limit of `ng.getSignalGraph`" | feature | verified | apps/angular-ai-devtools/src/app/interop.service.ts:27 - INTEROP_LIMITATION constant rendered by interop.component.ts:20 |
| "the check exits 0 on `edge-dev-aion` with `nodes: 1`" | status | unverifiable | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:84,115 reads nodes and fails below 1, but no recorded run exists in this checkout; a live verify run would settle it |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`model clear <name> --confirm=<model>`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2843 - usage names --confirm=v3Nano as the example |
| "`model clear` refuses a running instance" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2847 - refuse() when the instance is running, files never deleted under a running browser |
| "the folder `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion` of the primary checkout" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:901-905 - pinDir is TMP/pins/<name>; TMP at :119 under the primary checkout's .commandcode/worktrees/tmp |
| "free space minus the model's `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1551 - free minus downloadMib against minMib; instances.json:16,41 - 22528 and 20480 |
| "`edge-dev-aion` ... launches with `--disable-component-update`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:148-150 - args holds --disable-component-update for edge-dev-aion |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`bench.js` has a 120 s per-prompt timeout" | feature | verified | spikes/probes/bench.js:11-12 - PROMPT_TIMEOUT_MS = 120000 inside a Promise.race |
| "`probe10.js`, `bench.js` and `doctor`'s `canary.tools` send both" | feature | verified | spikes/probes/probe10.js:42, spikes/probes/bench.js:108, .commandcode/skills/control-ai-browsers/scripts/control.mjs:1429 - LanguageModelToolSuccess built with callID and callId |
| "`results[i]` holds the serving model, `backend`, `performanceClass`, `cpuBefore` and `cpuAfter` ... the duration and `result`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2939-2951 - record fields model, backend, performanceClass, cpuBefore, cpuAfter, ms and result |
| "`bench.js` hard-codes it" | config | verified | spikes/probes/bench.js:4 - page.goto('http://localhost:4222/') |
| "Summarise with `node spikes/probes/bench-summary.mjs` on files holding those `result` values" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2960 - summarize names spikes/probes/bench-summary.mjs and results[i].result; the script exists |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`)" | integration | verified | extension/agent-main.js:5-12 - RECORD_EVENT = NS + ':record' dispatched as a window CustomEvent; src/main-world/provenance-tracer.ts present |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | feature | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:117 - handles angular-ai:record with a cycle |
| "The chain lists producer/consumer/self steps with kind, label and position" | feature | verified | apps/angular-ai-devtools/src/app/signal-provenance.ts:6,10-14 - ProvenanceDirection producer/self/consumer and step fields kind, label, position |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs:4 - the check drives the panel flow per named instance |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "no runtime message type; `angular-ai:stale-view` has no producer or consumer" | integration | verified | .commandcode/skills/control-ai-browsers/features/stale-view.md:30-32 - corrected wording; extension/background.js:10 relays only record, state, di-graph and error-capture |
| "the hedged wording 'the template may show a stale value', the field name and the owning component" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 - hedged span with that text; scripts/panel.mjs:261 - field-name and owning-component selectors |
| "With zero findings the panel renders an explicit empty state ('no stale-view findings')" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:17 - empty-state paragraph with that text |
| "`--feature=stale-view`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2301 - passes opts.feature to drivePanel; scripts/panel.mjs:240 - isStale branch for stale-view |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:82,90,100 - each derived port row is 4222, 4223 and 4200 at slot 0 and 4300, 4400, 4500 plus the slot otherwise |
| "PORTAL_API_PORT ... keeps it at 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 - const PORTAL_API_PORT = 3000; the portal token libs/shared/utils/src/lib/injection-tokens.ts:5 returns http://localhost:3000/api/ |
| "the 11 public functions" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:119 - CORE lists getComponent, getContext, getOwningComponent, getRootComponents, getInjector, getDirectives, getDirectiveMetadata, getHostElement, getListeners, applyChanges, isSignal, then getSignalGraph and four getInjector* functions |
| "The script passes `--inspect=false`" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:106 - the api proc args are run, api:serve, --inspect=false |
| "`npm test` at the repository root runs them and `npm run check` type-checks the scripts" | command | verified | package.json:10 - test ends with test:skills, which runs node --test over .commandcode/skills/**/*.test.mjs; package.json:7 - check runs check:skills with tsc -p .commandcode/skills/tsconfig.json |
| "The four portal features are recorded as external" | status | verified | .commandcode/skills/control-angular-dev-app/features/.proven.json - portal-claims, portal-complaints-customers, portal-contracts and portal-navigation each carry an external entry with the same reason |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh page state: `count` 3, `double` 6, cart 1 item" | feature | verified | spikes/ng222-app/src/app/counter.ts:5,17,18 - CartService items starts as ['apple'], count is signal(3), double is computed count * 2 |
| "heading `Render mode: server`" | feature | verified | spikes/ng222-ssr/src/app/page.ts:10 - the h1 renders Render mode: plus mode(); spikes/ng222-ssr/src/app/app.routes.server.ts:4 - the empty path is RenderMode.Server |
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json`" | config | verified | portal apps/insurance-portal/src/assets/feature-flags.manifest.json - 12 flags, every one true; libs/claim/routes/src/lib/routes.ts:9-10 - canMatch featureFlagGuard('claim-list') |
| "Take `<session>`, `<url>` and `<evidenceDir>` from `node $S info`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:1211 - info prints statePath plus the recorded state fields session, url and evidenceDir |
| "Portal: `node $S up --target portal` (API on 3000, app on the derived port)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:100-106 - app is 4200 or 4500 plus slot, api is fixed at PORTAL_API_PORT 3000 with env PORT |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Clicks: 3 (double 6, cart 1)`" | feature | verified | spikes/ng222-app/src/app/counter.ts:11 - the paragraph prints title, count, double and cart items length; spikes/ng222-app/src/app/counter.spec.ts:23 asserts the same string |
| "an injected `CartService.items` signal" | feature | verified | spikes/ng222-app/src/app/counter.ts:5,19 - items = signal<string[]>(['apple']) and cart = inject(CartService) |
| "an effect that copies `count` into `lastLogged`" | feature | verified | spikes/ng222-app/src/app/counter.ts:23 - effect(() => this.lastLogged.set(this.count())) |
| "`/stale-view` and `/stale-view-deferred`" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 - paths stale-view and stale-view-deferred with StaleViewFixture and StaleViewDeferredFixture |
| "The paragraph reads `Clicks: 4 (double 8, cart 1)`" | feature | verified | spikes/ng222-app/src/app/counter.ts:12 - the button sets count + 1, so 4 doubles to 8; spikes/ng222-app/src/app/counter.spec.ts:27 asserts Clicks: 4 (double 8, cart 1) |
| "A reload resets the count to 3" | feature | verified | spikes/ng222-app/src/app/counter.ts:17 - count = signal(3), an in-memory initial value with no storage read |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "table with columns Claim number, Damage Type, Date, Policynumber, Customer" | feature | verified | portal libs/claim/feature-list/src/lib/list.component.ts:32-36 - cells claimNumber, damageType, date, contract.policyNumber, customer |
| "row click opens `/claim/<id>/details`" | feature | verified | portal libs/claim/routes/src/lib/routes.ts:16-20 - child route path :id/details loading the claim feature-details component |
| "heading `Claim Details`" | feature | verified | portal libs/claim/feature-details/src/lib/details.component.ts:29 - ng-journal-header title="Claim Details" |
| "`/claim/create` shows the heading `Complaint Create`" | status | verified | portal libs/claim/feature-create/src/lib/create.component.ts:39 - the template opens with ng-journal-header title="Complaint Create", so the portal bug is still in the source |
| "Data comes from `http://localhost:3000/api/claims`" | integration | unverifiable | a grep of the portal libs for api/claims found no literal path; libs/shared/utils/src/lib/injection-tokens.ts:5 fixes only the base http://localhost:3000/api/ - reading libs/claim/data-access would settle it; settling check: `control.mjs up --target portal` then a requests read records the API path. |
| "5 rows measured (the facade drops claims whose contract or customer is missing)" | status | unverifiable | the count comes from the API's faker data on every start; the portal API seed and the claim facade filter would settle it; settling check: `control.mjs doctor --target portal` after a fresh API start records the claim row count. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`complaint-list` columns Type, Customer, Date, Description" | feature | verified | portal libs/complaint/feature-list/src/lib/list.component.ts:31-34 - cells type, customer?.label, date, description |
| "`complaint-create` `/complaint/create`, heading `Complaint Create`" | feature | verified | portal libs/complaint/feature-create/src/lib/create.component.ts:43 - ng-journal-header title="Complaint Create"; libs/complaint/routes/src/lib/routes.ts:19-25 - child path create |
| "`customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip" | feature | verified | portal libs/customer/feature-list/src/lib/list.component.ts:35-42 - firstName, lastName, phone, email, address.street, address.city, address.state, address.zip |
| "`customer-details` `/customer/<id>/details`, heading `Customer Details`" | feature | verified | portal libs/customer/feature-details/src/lib/details.component.ts:18 - ng-journal-header title="Customer Details" with an Address subtitle; libs/customer/routes/src/lib/routes.ts:15-21 - child path :id/details |
| "Save sends `POST /api/complaints` (201)" | integration | unverifiable | no literal api/complaints string in the portal libs; libs/shared/utils/src/lib/injection-tokens.ts:5 fixes only the http://localhost:3000/api/ base - a playwright-cli requests read on a save would settle it; settling check: `control.mjs up --target portal` then a requests read records the POST path. |
| "`customer-list` ... 30 rows" | status | unverifiable | the count comes from the API's faker data on every start; the portal API seed would settle it; settling check: `control.mjs doctor --target portal` after a fresh API start records the customer row count. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "columns Policynumber, Status, Insurance Start On, Customer, Phone, Email" | feature | verified | portal libs/contract/feature-list/src/lib/list.component.ts:44-54 - policyNumber, status chip, insuranceStartOn date, customer.label, phone, email |
| "clicking a row opens `/contract/<id>/details` with heading `Contract Details`" | feature | verified | portal libs/contract/feature-details/src/lib/details.component.ts:47 - ng-journal-header title="Contract Details"; libs/contract/routes/src/lib/routes.ts:26-31 - child path :id/details |
| "`Edit` opens `/contract/<id>/edit`, heading `Contract Edit`" | feature | verified | portal libs/contract/feature-edit/src/lib/edit.component.ts:51 - ng-journal-header title="Contract Edit"; libs/contract/routes/src/lib/routes.ts:21 - child path :id/edit |
| "`/contract/create`: ... heading `Contract Create`" | feature | verified | portal libs/contract/feature-create/src/lib/create.component.ts:46 - ng-journal-header title="Contract Create"; libs/contract/routes/src/lib/routes.ts:15 - child path create |
| "20 rows after a fresh API start" | status | unverifiable | the count comes from the API's faker data on every start; the portal API seed would settle it; settling check: `control.mjs doctor --target portal` after a fresh API start, then the contract row count. |
| "then sends `PUT /api/contracts`" | integration | unverifiable | no literal api/contracts string in the portal libs; libs/shared/utils/src/lib/injection-tokens.ts:5 fixes only the base URL - a playwright-cli requests read on a save would settle it; settling check: `control.mjs up --target portal` then a requests read records the PUT path. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` redirects to `/home`" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts:4-8 - path '' with pathMatch full and redirectTo home |
| "Domain routes load lazily, guarded by feature flags" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts:14-29 - loadChildren for contract, claim, complaint and customer; libs/claim/routes/src/lib/routes.ts:9-10 - canMatch featureFlagGuard('claim-list') |
| "unknown URLs show Page Not Found" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts:36-40 - path '**' loads ./page-not-found.component PageNotFoundComponent |
| "the init script re-installs it on every load in the same session" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:2 - installs window.__ngc on this page and on every later load |
| "the Pangular Inspector overlay adds a floating ... button" | feature | verified | portal apps/insurance-portal/src/main.ts:8 - returns import('@pangular-inspector/devtools/overlay') |
| "The header link goes to `https://www.ng-journal.com`" | feature | unverifiable | a grep of portal libs/shared/ui for ng-journal.com found nothing; the header component template would settle it; settling check: `control.mjs up --target portal` then the snapshot records the header link. |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` (`RenderMode.Server`), `/prerender` (`RenderMode.Prerender`), `/client` (`RenderMode.Client`)" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - serverRoutes map paths '', prerender and client to those render modes |
| "a list of three items fetched from `/api/items`" | integration | verified | spikes/ng222-ssr/src/server.ts:18-24 - app.get('/api/items') returns Alpha, Beta and Gamma |
| "`@defer (hydrate on interaction)`" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15 - @defer (hydrate on interaction) wraps app-deferred; spikes/ng222-ssr/src/app/deferred.ts:6 - Deferred click button |
| "six named checks and `ok`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:75-80 - check rows including server-html-ngh, no-mismatch-on-default-route and expected-mismatch-detected |
| "`?mismatch=1` (structural hydration mismatch, NG0500)" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:80 - expected-mismatch-detected requires a node with status mismatched and an NG0500 console error on /?mismatch=1 |
| "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | status | unverifiable | the counters are per page load in a live browser; a run of the ssr-check.js probe against the fixture would settle them; settling check: `node --test .commandcode/skills/control-angular-dev-app/scripts/ssr-check.test.mjs` and a live `control.mjs up --target ssr` run record the counters. |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89 - const EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh |
| "Chrome for Testing 156.0.8078.4, revision 1248" | config | verified | node_modules/playwright-core/browsers.json:6-9 - chromium revision 1248, browserVersion 156.0.8078.4, title Chrome for Testing |
| "CDP port 9420 ... 9421-9499, slot 1-79" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:273-276 - MAIN_CDP_PORT 9420, SLOTS 80, SLOT_TRIES 10, so slot 1-79 maps to 9421-9499 |
| "`Extensions.extensionServer.onShowPanel`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:810 - evalIn calls Extensions.extensionServer.onShowPanel with PANEL_ID, built from EXT_ID at control.mjs:90 |
| "the profiler button has `aria-label` `Start recording`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1458 - waits for button[aria-label="Start recording"] in the panel before coexisting |
| "`npm test` at the repository root runs them and `npm run check` type-checks the scripts" | command | verified | package.json:10 - test reaches test:skills over .commandcode/skills/**/*.test.mjs; package.json:7 - check reaches check:skills with tsc -p .commandcode/skills/tsconfig.json |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs`" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:3 - Angular DevTools control script, run with --help; the 65 KB script drives install, up, doctor, panel and coexist |
| "A development build of an Angular app is serving (`window.ng` present)" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1333 - the app check requires page.ngVersion and devBuild and prints window.ng present or absent |
| "Panel: `control.mjs panel ...` and `coexist` (raw CDP into `chrome-extension://<id>/index.html`)" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:810 - onShowPanel for PANEL_ID, then Runtime.evaluate on the panel target; control.mjs:1379-1394 - panel subcommands |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1172 - evidenceDir = join(TMP, evidence, stamp) under tmp/control-angular-devtools; .gitignore:7 - tmp/control-angular-devtools/ |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:891 - an accessor defines window.__NG_DEVTOOLS_CONNECTED__ and records flagSetAt; control.mjs:1334 - the doctor connected-flag line reads it |
| "`attach` reloads the page to catch messages from the start" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:899 - await page.reload() after the init script starts recording message events |
| "Angular 22.2.2" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 - version 22.2.2 |
| "`attach` exits 1 because it requires `isDebugMode`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1349 - attached requires flag, isAngular, isDebugMode, backendInstalled and backendReady together |
| "backendInstalled true; backendReady at ~950 ms" | status | unverifiable | the timings come from a live harness run; node $S attach against the counter fixture would settle them; settling check: `control.mjs attach` against the counter fixture records `backendInstalled` and the `backendReady` timing. |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:91 - const STORE_URL = https://chromewebstore.google.com/detail/ plus EXT_ID |
| "copies the newest `<version>_0` folder from `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:106 - the edge-dev browser row joins LOCAL with Microsoft, Edge Dev and User Data; control.mjs:940-947 - Extensions/<id> folder scan |
| "`--from edge\|chrome\|chrome-beta\|<dir>` picks another source" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:110 - VALUE_FLAGS includes from; control.mjs:1039 - the refuse message offers --from <dir> |
| "`status --browser=chrome-beta` read only, any branded browser" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:940-962 - brandedStatusIn only reads Extensions/<id> and Secure Preferences extensions.settings |
| "`doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | status | unverifiable | the version comes from the extension copy in Edge Dev's profile, outside the repository; node $S install plus doctor on this machine would settle it; settling check: `control.mjs doctor` records the installed extension version line. |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.setProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1463 - adds two ng.setProfiler subscribers to the page and keeps both returned removal functions |
| "remove your own with the function `setProfiler(cb)` returns" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1463 - window.__ngdtRemoveA and __ngdtRemoveB hold the returned functions that coexist calls to unregister one |
| "own subscribers ... DevTools recorded 2 change detection cycles" | status | unverifiable | the counts come from a live node $S coexist run on the harness; nothing in the script fixes the numbers; settling check: `control.mjs coexist` on the harness records the counts. |
| "`ng.setProfiler(null)` clears every subscriber, DevTools' included" | feature | unverifiable | a grep of the devtools control script found no setProfiler(null) call; Angular's render3/profiler.ts in the loaded Angular build would settle it; settling check: `control.mjs coexist` records whether a `setProfiler(null)` clears the DevTools subscriber. |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "graph nodes are `ng-signal-graph-pane .node-cont.kind-<kind>`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:830 - readSignalGraph queries ng-signal-graph-pane .node-cont and reads the kind- class |
| "`node $S panel signal-graph --component=app-counter`" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1379-1394 - the panel command handles the signal-graph subcommand with --component and refuses unknown ones |
| "`--di-graph` leaves the page's signal graph broken until reload" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1501-1517 - the di_graph step executes angular:di_graph and re-reads the pane and ng.getSignalGraph, reporting templateLostInPane |
| "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`" | status | unverifiable | measured panel text from a live run; node $S coexist --di-graph would settle it; settling check: `control.mjs coexist` records the pane labels after `angular:di_graph`. |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@pangular-inspector/devtools`, pinned 0.0.7" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 - `const PINNED = '0.0.7'` |
| "standalone `pangular dev` on port 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 - `DEFAULT_PORT = 9999`, fixed per app because the proxy names it |
| "`tools/list` holds none of the eight action tools" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 - ACTION_TOOLS holds exactly highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api |
| "a POST without `Origin` gets 403" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1344 - mcp-origin-guard passes only when `noOrigin.httpStatus === 403` |
| "`node $S scan <tool>` runs the CLI's stdio MCP server" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1493 - spawns `[bin, 'mcp', '--root', root, '--read-only']` |
| "0.0.7 ... has no `list-components` tool ... `components` falls back to the `component-tree` resource" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1457 - uses the tool when listed, else :1473 reads `pangular:component-tree` |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each feature file starts with an H1 ... then four H2s in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-pangular-inspector`, `Gotchas`" | structure | verified | features/setup.md:1,6,14,19,36 and the same five headings at features/live-inspection.md:1,6,14,20,36, navigation.md:1,6,13,18,32, source-scan.md:1,6,13,18,30, panel.md:1,6,14,20,32 |
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - state carries `session: pangular-<port>` and `evidenceDir` |
| "App: `node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 - PORTAL_API_PORT = 3000; control-angular-dev-app/SKILL.md:40 - portal app derived, measured on 4507 |
| "Server: `node $S up --app-url http://localhost:4507/`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs:105 - the app row is `{ name: 'app', kind: 'external', port: 4507 }` |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`list-pages` shows the tab's page id, URL and the inspectors that report" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1422 - doctor calls `list-pages` and matches the page id (:1432) |
| "the component outline (`components`; `list-components` on versions after 0.0.7)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1445 - `list-components when the server has it (unreleased after 0.0.7)` |
| "`inspect-signals` nodes and edges for one component" | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:43 - calls `inspect-signals`, holds when the answer includes `nodes` |
| "`inspect-providers` lookup path, by selector or by `token`" | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:44 - calls `inspect-providers`, holds when the answer includes `lookupPath` |
| "`inspect-component` for one host tag, class name or instance id" | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:42 - `call inspect-component --args` and holds on `ListComponent` |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`explain-navigation`, newest first, with trigger, `started by`, phases and outcome" | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:47 - `call explain-navigation --args '{"limit":2}'` saved as explain-navigation.json |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | feature | unverifiable | the default lives in the Pangular 0.0.7 server, which is not installed here (`node_modules/@pangular-inspector` is absent); would need `tools/list` from a live server; settling check: `control.mjs call explain-navigation` against a 0.0.7 server records the default and maximum `limit`. |
| "`list-routes` and `lint-routes` on the live route config" | feature | unverifiable | neither name appears in any script here; control.mjs passes tool names through unvalidated, so only a live `tools/list` settles it |
| "`inspect-route`, the current URL, document title and active route tree" | feature | unverifiable | same gap: the tool list comes from the Pangular server, not from this repository; settling check: `control.mjs tools` records `inspect-route` and its payload. |
| "A router link click has trigger `imperative`" | feature | unverifiable | the trigger vocabulary is Pangular's nav-event record; nothing in this repository names it; settling check: `control.mjs call` records the nav-event trigger. |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:514 - `install` merges the `/__pangular` entry into the app proxy; control.test.mjs:105 - app port 4507 |
| "`playwright-cli -s=pangular-9999 goto ...`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - `session: pangular-<port>`, so 9999 gives pangular-9999 |
| "Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP" | structure | unverifiable | the tab bar is Pangular's own panel bundle; the only repo hit for the last tab name is research/03-prior-art.md, which describes a competitor; settling check: `control.mjs snap` on the panel page records the eight tab names. |
| "accessible name `Toggle Pangular Inspector`" | feature | unverifiable | the string appears in no tracked file outside the skill docs; it comes from @pangular-inspector/devtools, absent from this checkout; settling check: `control.mjs snap` on the portal page records the toggle accessible name. |
| "A code expires after 5 minutes" | feature | unverifiable | no file here names an expiry; would need Pangular's auth/token module; settling check: `control.mjs call` on the panel one-time-code flow records the code lifetime. |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup.check`: six read-only facts, one line each" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:590-595 - setupChecks adds declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |
| "`npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:911 - `run('npm', ['install','--save-dev','--save-exact', PKG@PINNED], dir)` |
| "`node $S install --json` -> `changed` lists ..." | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:953 - install output is `{ command: 'install', ..., changed: dirtyPaths(dir) }` |
| "`node $S remove --json` -> exit 0, `gitStatus: []`, `gitDiffStat: ""`" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1002 - remove emits gitStatus and gitDiffStat and exits 1 unless both are empty |
| "exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 - PINNED; :590 - the declared-exact check compares package.json against it |
| "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | status | unverifiable | a measurement in the portal checkout, named in the doc as outside this repository; features/.proven.json marks setup as external |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta`" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1490 - the scan usage line lists exactly those seven stdio tools |
| "`--root` picks the folder to scan" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1493 - `[bin, 'mcp', '--root', root, '--read-only']` |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1540 - `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)` |
| "`node $S scan nope` prints the full stdio list" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1531 - `no source tool <name>; stdio has: ...` |
| "The stdio server lists no page tools (`inspect-*`, `list-pages`)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1482 - the fallback is documented as `source scan tools only` |
| "`build-meta` ... -> Angular `22.2.2`, ... TypeScript `6.0.3`, `ssr: false` (measured)" | status | unverifiable | the measured workspace is the portal checkout, outside this repository, so its package.json cannot be read here; a `scan build-meta` run would settle it |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the per-model instance (default `chrome-beta-gemma4`)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:101 - `const DEFAULT_INSTANCE = 'chrome-beta-gemma4'` |
| "Vitest `51400 + slot`, bundled CDP `9500 + slot`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:99-100 - MAIN_VITEST_PORT = 51315, MAIN_BUNDLED_CDP_PORT = 9350 (slot 0) |
| "The playwright-cli session is `control-vitest-<flowId>-<Vitest port>`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:899 - `session: control-vitest-<flowId>-<vitestPort>` |
| "`--hold <ms>` sets `VITE_COUNTER_HOLD_MS`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:586 - `env['VITE_COUNTER_HOLD_MS'] = String(state.hold)` |
| "`--timing-demo` sets `VITE_COUNTER_TIMING_DEMO=1`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:590 - `env['VITE_COUNTER_TIMING_DEMO'] = '1'` |
| "passed as `VITEST_BROWSER_PORT` to `vitest-base.config.mts` (`strictPort`)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:582 - VITEST_BROWSER_PORT; spikes/ng222-app/vitest-base.config.mts:7,18 - `strictPort: true` |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Take `<session>`, `<cdpUrl>`, `<evidenceDir>` and `orchestratorUrl` from `node $S info`" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:899 - the info record returns vitestPort, cdpUrl, orchestratorPrefix and session |
| "`mounted-component` passes only while the hold test runs" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1146 - warns `no [ng-version] host now: no test is running` |
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to `['pear', 'plum']`)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - the hold test calls setup with cartItems pear/plum, and :34 shows cart 2 for that override |
| "The Vitest UI (`ui: false` in both runner configs)" | config | verified | spikes/ng222-app/vitest-attach.config.mts:55 and vitest-extension.config.mts:34 - `ui: false` in both |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "renders `Counter` with `vitest-browser-angular`'s `render()` and asserts the DOM" | integration | verified | spikes/ng222-app/src/app/counter.spec.ts:3,12 - `import { render } from 'vitest-browser-angular'` then `render(Counter, {...})` |
| "an Increment click moves "Clicks: 3 (double 6, cart 1)" to "Clicks: 4 (double 8, cart 1)"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23,27 - the two toHaveTextContent strings |
| "a `CartService` override shows "cart 2"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:32-34 - setup with cartItems pear/plum, expects `cart 2` |
| "a test that fails on purpose because it reads the DOM in the same task as the click" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:37-49 - `it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1')` then `toContain('Clicks: 4')` |
| "`up --hold <ms> --filter "keeps the counter mounted"` runs it alone" | command | verified | spikes/ng222-app/src/app/counter.spec.ts:57 - the hold test is named `keeps the counter mounted for an outside inspection`; control-vitest-browser-angular/scripts/control.mjs:615 passes `--filter` |
| "`Tests 2 passed \| 2 skipped (4)` without flags" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:20,30 are unconditional while :39,56 are `it.runIf`, so 4 tests exist and 2 are skipped without flags |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/s1-extension` was retired in M009; its evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`" | status | verified | `spikes/s1-extension` is absent from this checkout (Test-Path false) while `.project/archive/001-run-unrun-spikes` exists |
| "`panelInspectedWindowTop` and `panelInspectedWindowTester` in its output" | feature | verified | spikes/probes/vitest-attach.mjs:218 - `evidence.panelInspectedWindowTester = await cdp.evaluate(panel.targetId, inspected(testerUrl))` |
| "the runner's `iframePrompt` ("OK" from Gemma 4 in 10.8 s, research 17)" | feature | verified | spikes/probes/vitest-attach.mjs:226 - `evidence.iframePrompt` reads from the tester context |
| "`node spikes/probes/vitest-attach.mjs --route attach --cdp-port <port> --label <label>`" | command | verified | spikes/probes/vitest-attach.mjs:9 - usage `--route attach --cdp-port 9334 --label gemma4` |
| "writes them to `research/raw/vitest-attach-<label>.json` under `extensionStorage`" | feature | verified | spikes/probes/vitest-attach.mjs:235 - `evidence.extensionStorage = ... 'chrome.storage.local.get(null)'` |
| "keyed `content_isolated`" | feature | verified | spikes/probes/vitest-lib.mjs:34 - `s1Probe('content_isolated')` and the storage key built from it (:36) |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "renders `Counter` in the tester iframe with `CartService` overridden to `['pear', 'plum']`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - the hold test calls `setup({ cartItems: ['pear', 'plum'] })` |
| "clicks Increment once halfway, and checks that the count rose by one" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:62-70 - waits holdMs/2, reads countBefore, expects `countBefore + 1` |
| "every `ng.*` read works on the host `<div id="rootN" ng-version="22.2.2">`" | feature | verified | spikes/ng222-app/package-lock.json - `node_modules/@angular/core` is installed at 22.2.2 |
| "shows `CartService` with `items()`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - the hold test overrides CartService with `['pear', 'plum']`; spikes/probes/vitest-iframe-probe.js:2 - the probe reads the injector and provider records |
| "the Vitest tab ... frame `vitest-iframe`" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1118 - finds the child frame whose `name === 'vitest-iframe'` |
| "`ng.getInjectorProviders` throws on the null injector" | feature | unverifiable | no code here asserts it; a run inside the tester iframe (`getInjectorProviders` on the path end) would settle it; settling check: `control.mjs up` in the tester and the probe capture record the throw. |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Check whether there's a `packageManager` field in the root-level `package.json`. Alternatively check lockfile in repo root: ... `package-lock.json` -> npm" | config | verified | package.json at the repository root declares no `packageManager` field and package-lock.json sits beside it, so the doc's alternative check resolves to npm |
| "Root `package.json` should have `"private": true` to prevent accidental publish" | config | verified | package.json:3 - `"private": true` in the workspace root manifest |
| "`pnpm add @org/ui --workspace`" | command | unverifiable | this workspace has no pnpm/yarn/bun manifest to run it against (single package-lock.json); a pnpm-monorepo checkout would settle it |
| "Symlinks appear in `<consumer>/node_modules/@org/<package>`" | feature | unverifiable | no workspace link exists in this checkout (`node_modules` is not tracked) and the command was not run, per the brief; settling check: `git cat-file -p HEAD:package.json` records that the workspace has no link entry, and the link command prints the symlink path. |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`circuit_breaker` \| Exit, no progress after 13 consecutive polls" | feature | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208 - `if (noProgressCount >= 13) return { action: 'done', code: 'circuit_breaker' }` |
| "`--max-cycles` \| 10" | config | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:123 - the --max-cycles argument defaults to 10 before parseInt |
| "this repository's `nx.json` contains neither" | config | verified | nx.json holds only analytics, targetDefaults, plugins and generators; no nxCloudId or nxCloudAccessToken key |
| "Run `ci-state-update.mjs gate` before local fix attempts" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:10 - `gate --gate-type <local-fix\|env-rerun>` |
| "Pass `--timeout` and `--new-cipe-timeout` in **minutes** ... the script converts to seconds internally" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:21,50 - `parseInt(...) * 60` |
| "`--local-verify-attempts` \| 3" | config | unverifiable | neither script counts it (only the status name `needs_local_verify` at ci-poll-decide.mjs:116); the budget must live in the orchestrator prompt |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `ci-state-update.mjs gate --gate-type local-fix`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:40 - `if (gateType === 'local-fix')` increments the counter and refuses by budget |
| "Run `ci-state-update.mjs gate --gate-type env-rerun`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:57 - `if (gateType === 'env-rerun')` against `--env-rerun-count` |
| "`autoApplySkipReason`" | feature | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:91 - the decision script reads autoApplySkipReason from the ci_information result |
| "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | command | unverifiable | neither `apply-locally` nor `APPLIED_LOCALLY` appears in monitor-ci/scripts; both strings occur only in this skill's own docs (SKILL.md:322, fix-flows.md:74); settling check: `git cat-file -p HEAD:.commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs` records whether apply-locally exists. |
| "regex: `/cipes/{id}`" | feature | unverifiable | the CI Attempt URL shape comes from the Nx Cloud API, not from any file in this repository; settling check: `git cat-file -p HEAD:.commandcode/skills/monitor-ci/references/fix-flows.md` and `node_modules/nx/package.json` record where the route shape comes from. |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Answer a defined workspace-data question with `npx nx-cloud api`" | command | verified | node_modules/nx/package.json:42 -- bin maps nx-cloud to ./dist/bin/nx-cloud.js and node_modules/.bin/nx-cloud is present |
| "Run every command from the workspace root so the command finds `nx.json`" | config | verified | node_modules/nx/dist/src/adapter/compat.js:60 -- nx reads nxCloudUrl from nx.json (nxCloudId at :59) |
| "or a workspace token in `NX_CLOUD_ACCESS_TOKEN`" | config | verified | node_modules/nx/dist/src/nx-cloud/utilities/environment.js:42 -- ACCESS_TOKEN falls back to process.env.NX_CLOUD_ACCESS_TOKEN |
| "check the host (`NX_CLOUD_API` or `nxCloudUrl`)" | config | verified | node_modules/nx/dist/src/nx-cloud/utilities/get-cloud-options.js:19 -- NX_CLOUD_API selects the host, default https://cloud.nx.app |
| "use `nx-cloud-cache-investigator`" | integration | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:2 -- sibling skill declares name: nx-cloud-cache-investigator |
| "Every list response is wrapped, even a single page" | feature | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/download-cloud-client.js -- the api command ships in the downloaded cloud client (0 hits for pagesFetched under node_modules/nx/dist); settle with a saved `npx nx-cloud api cipes -o out.json` |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx-cloud api task-stats -f dateAfter=2026-08-01 -f dateBefore=2026-08-07`" | command | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/download-cloud-client.js -- -f/--pages/-o belong to the downloaded cloud client (0 hits for list-operations under node_modules/nx/dist); settle with `npx nx-cloud api task-stats --help`; settling check: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api task-stats --help` lists the filters. |
| "`--describe` shows them as `returns: file`" | feature | unverifiable | no Nx Cloud API spec in the repo; node_modules/nx/dist holds no api implementation; settle with `npx nx-cloud api --describe <asset operation>` against a linked org; settling check: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api --describe` shows the return shape. |
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | command | unverifiable | 0 hits for decrypt-artifact under node_modules/nx/dist; settle with `npx nx-cloud --help` after the client download; settling check: `node_modules/nx/package.json` maps the `nx-cloud` bin that `npx nx-cloud --help` then runs. |
| "A non-empty gzip payload can contain a valid tar archive whose terminal-output entry is zero bytes" | feature | unverifiable | no recorded Nx Cloud task asset in the workspace (no .tar.gz under the repo) to observe the shape; settling check: no command in this checkout reaches it; the Nx Cloud task asset is a downloaded artifact outside this repository. |
| "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | feature | unverifiable | implementation is in the downloaded cloud client (node_modules/nx/dist/src/command-line/nx-cloud/download-cloud-client.js); settle with one ndjson page from a linked workspace; settling check: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe` records the output format. |
| "`npx nx-cloud api task-stats -o <file>` runs from the workspace root because nx maps the `nx-cloud` bin" | command | verified | node_modules/nx/package.json:42 - bin maps nx-cloud to ./dist/bin/nx-cloud.js and node_modules/.bin/nx-cloud is present, so the reference recipe runs here |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 -- the required skill exists with name: nx-cloud-api |
| "Query the exact target with the workspace-local Nx command" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:87 -- command project [projectName]; node_modules/nx/dist/src/command-line/show/project.js:78 reads node.data.targets |
| "Read [references/log-and-report-assets.md](references/log-and-report-assets.md) before you decode a log or report" | structure | verified | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md -- the linked relative path resolves inside the skill |
| "A terminal `remote-cache-hit` proves Nx replay worked for that task" | feature | unverifiable | no recorded Nx Cloud cache-status payload in the repo; settle with one saved `nx-cloud api` tasks response; settling check: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api tasks -o tasks.json` records the cache status. |
| "record run and task IDs, `batchId`, project, target, configuration" | feature | unverifiable | no Nx Cloud API schema or saved task payload in the repo; settle with `npx nx-cloud api --describe runs/{runId}/tasks` on a linked org; settling check: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api --describe` records the task row fields. |
| "If the API reports `cacheable: false`, Nx replay was not expected for that execution" | feature | unverifiable | field semantics exist only in the cloud API spec; settle with a recorded task row carrying cacheable; settling check: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api tasks -o tasks.json` records a row carrying `cacheable`. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link" | command | verified | node_modules/nx/package.json:42 -- the `npx nx-cloud api` CLI the row names is a real bin (node_modules/.bin/nx-cloud) |
| "decrypt a copy with `npx nx-cloud decrypt-artifact`" | command | unverifiable | 0 hits for decrypt-artifact under node_modules/nx/dist; settle with `npx nx-cloud --help` on a machine holding the downloaded client; settling check: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud --help` lists `decrypt-artifact`. |
| "Record byte count and SHA-256" | feature | unverifiable | no downloaded cache artifact in the workspace (no .tar.gz under the repo) to apply the check to; settling check: no command in this checkout reaches it; the cache artifact is a downloaded binary outside this repository. |
| "Byte-identical malformed downloads across retries support a persistent bad cache object" | feature | unverifiable | needs a recorded failing run-group and its artifact; neither exists in the repo; settling check: no command in this checkout reaches it; the recorded failing run-group and its artifact live outside this repository. |
| "The API cannot identify an upload path, writer, storage event, or service mutation" | status | unverifiable | no Nx Cloud API spec in the repo; settle with `npx nx-cloud api --describe` for the artifact route (node_modules/nx/dist has no spec); settling check: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe` lists the artifact route. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact row-provided link with `npx nx-cloud api`" | command | verified | node_modules/nx/package.json:42 -- nx-cloud bin entry resolves to ./dist/bin/nx-cloud.js (node_modules/.bin/nx-cloud present) |
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | unverifiable | no Nx Cloud API spec in the repo; settle with `npx nx-cloud api --describe` for the task-assets route; settling check: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe` lists the task-assets route. |
| "These assets are compressed binary payloads" | feature | unverifiable | no recorded Nx Cloud log or report asset in the workspace (no .tar.gz under the repo) to confirm the format from bytes; settling check: no command in this checkout reaches it; the log and report assets are downloaded artifacts outside this repository. |
| "A downloaded asset proves only that it resolves now" | status | unverifiable | proxy/retention behavior is server-side; settle with a cached 404 plus a later successful fetch from a linked org; settling check: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api` fetch records a 404 and then a later success. |
| "Treat user-provided decoded content as provided evidence" | status | unverifiable | a provenance rule with no executable check in the repo (no skill script enforces it); settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` records that no skill script enforces it. |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill for all Nx Cloud reads" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 -- the required skill exists with name: nx-cloud-api |
| "Use **nx-cloud-api** (`npx nx-cloud api`) for every read" | command | verified | node_modules/nx/package.json:42 -- nx-cloud bin maps to ./dist/bin/nx-cloud.js and node_modules/.bin/nx-cloud exists |
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | feature | unverifiable | filter names live in the cloud API spec, absent from node_modules/nx/dist; settle with `npx nx-cloud api --describe cipes`; settling check: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe cipes` lists the status filters. |
| "the public API has no separate workflow routes" | status | unverifiable | route list is server-side; 0 hits for list-operations under node_modules/nx/dist; settle with `npx nx-cloud api --list-operations`; settling check: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --list-operations` lists the routes. |
| "Query a 30-hour creation window to cover the maximum normal six-hour CI duration" | feature | unverifiable | the repo has no CI pipeline to measure a run duration (.github/workflows absent); settling check: `git cat-file -p HEAD:package.json` records that the repo ships no CI workflow to time. |
| "Use a semaphore of at most five narrow detail requests" | feature | unverifiable | no skill script in the repo implements a request semaphore; nothing to measure; settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` records that no skill script implements it. |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Always use `--no-interactive`" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:31 -- generate declares the interactive option |
| "List all generators for a plugin: `npx nx list @nx/react`" | command | verified | node_modules/nx/dist/src/command-line/list/command-object.js:6 -- command list [plugin] |
| "`npx nx g @nx/react:library --help`" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:7,9 -- command generate <generator> with alias g |
| "`nx format:write`" | command | verified | node_modules/nx/dist/src/command-line/format/command-object.js:17 -- command format:write |
| "This example is for built-in nx formatting with prettier" | config | verified | node_modules/nx/dist/src/command-line/format/format.js:16,103 -- formatter is prettier (warns to install oxfmt or prettier when absent; this repo declares neither) |
| "The `link-workspace-packages` skill can help add these correctly" | integration | verified | .commandcode/skills/link-workspace-packages/SKILL.md -- the named skill exists in the same skills tree |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs and follow-up questions" | feature | verified | node_modules/nx/dist/src/command-line/import/ai-output.js:3 -- AI Agent NDJSON Output Utilities for nx import; installed nx is 23.3.0 (node_modules/nx/package.json) |
| "Run `nx import --help` for available options" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:12 -- command import [sourceRepository] [destinationDirectory] |
| "After import, run `nx sync --yes`" | command | verified | node_modules/nx/dist/src/command-line/sync/command-object.js:7 -- command sync |
| "`@nx/eslint` 23.3.0 peer-depends on `eslint@^9.0.0 \|\| ^10.0.0`, so ESLint 10 is supported" | config | verified | .commandcode/skills/nx-import/SKILL.md:119 - corrected wording; node_modules/@nx/eslint/package.json:76 - peerDependencies eslint is ^9.0.0 \|\| ^10.0.0 |
| "Available references: `references/ESLINT.md` ... `references/VITE.md`" | structure | verified | .commandcode/skills/nx-import/references/ -- all six named reference files (ESLINT, GRADLE, JEST, NEXT, TURBOREPO, VITE) are present |
| "Import all projects first, then `pnpm install --no-frozen-lockfile`" | feature | unverifiable | the repo is npm-based (package-lock.json present, no pnpm-workspace.yaml) and no import run is recorded; settle with an actual pnpm nx import |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project" | feature | verified | node_modules/@nx/eslint/dist/src/plugins/plugin.js:94 -- createNodes keyed on ESLINT_CONFIG_GLOB_V2; :325 sets targets[options.targetName] |
| "It detects **both** flat config files (`eslint.config.{js,mjs,cjs,ts,mts,cts}`) and legacy config files (`.eslintrc.{json,js,cjs,yml,yaml}`)" | feature | verified | .commandcode/skills/nx-import/references/ESLINT.md:9 - corrected wording; node_modules/@nx/eslint/dist/src/utils/flat-config.js:24-31 lists .eslintrc, .eslintrc.js, .eslintrc.cjs, .eslintrc.yaml, .eslintrc.yml and .eslintrc.json, with no .mjs |
| "Plugin options (set during `nx add @nx/eslint`)" | config | verified | nx.json:27-29 -- an inferred plugin entry is registered as plugin plus options.targetName (targetName e2e for @nx/playwright/plugin), the same shape the doc shows |
| "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" | config | verified | .commandcode/skills/nx-import/references/ESLINT.md:88 - corrected wording; node_modules/@nx/eslint/dist/src/utils/versions.js sets eslintVersion ^9.8.0 |
| "`typescript-eslint@7.x` declares `peerDependencies: { "eslint": ^8.56.0 }`" | config | unverifiable | node_modules/typescript-eslint is absent, so the declared peer range cannot be read; @nx/eslint 23.3.0 itself pins typescriptESLintVersion ^8.58.0 (versions.js); settling check: `node_modules/typescript-eslint/package.json` records the peer range once installed; `@nx/eslint` versions.js pins typescriptESLintVersion ^8.58.0. |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `@nx/gradle` plugin expects those files at the workspace root" | integration | unverifiable | node_modules/@nx contains angular, devkit, eslint, js, playwright, web, workspace only (no gradle), and no gradlew/gradle wrapper exists at the repo root; settle by installing @nx/gradle on a Gradle source; settling check: `node_modules/@nx/gradle/package.json` records the plugin once installed; `git cat-file -p HEAD:package.json` shows it is absent. |
| "If `@nx/gradle` is installed, run `nx show projects`" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:38 -- command projects |
| "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | feature | unverifiable | no Gradle repository is imported in this workspace, so the landed layout cannot be observed; settling check: `git cat-file -p HEAD:package.json` records that no Gradle import has run here. |
| "Because the import lands in a subfolder, Gradle project references can break" | feature | unverifiable | same: no Gradle build in the repo to run against after an import; settling check: `git cat-file -p HEAD:package.json` records that no Gradle build exists here to run against. |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project" | feature | unverifiable | @nx/jest is not installed (node_modules/@nx has no jest) and no jest config exists in the repo; the workspace test target is @angular/build:unit-test (apps/angular-ai-devtools/project.json:114) |
| "`npx nx add @nx/jest`" | command | verified | node_modules/nx/dist/src/command-line/add/command-object.js:7 -- command add <packageSpecifier> |
| "`nx add @nx/jest` does NOT create `jest.preset.js`" | feature | unverifiable | no @nx/jest generator in node_modules/@nx to read, and no jest.preset.js in the repo (Test-Path -> False); settling check: `node_modules/@nx/jest/package.json` records the generator files once installed. |
| "but Nx preset defaults to `jsdom`" | config | unverifiable | no @nx/jest/preset in node_modules/@nx to inspect; settling check: `node_modules/@nx/jest/package.json` records the preset once installed; the repo has no jest config. |
| "`nx run-many -t test`" | command | verified | node_modules/nx/dist/src/command-line/run-many/command-object.js:9 -- command run-many; apps/angular-ai-devtools/project.json:113 defines a test target |
| "Nx rewrites `package.json` scripts during init" | feature | unverifiable | package.json:10-12 -- the test scripts here are hand-written node --test and npx nx run chains; no Nx-rewritten script exists to compare the rewrite against |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `@nx/js/typescript` plugin provides a standalone `typecheck` target" | feature | verified | node_modules/@nx/js/dist/src/plugins/typescript/plugin.js:179-182 -- the plugin treats the config named by options.typecheck.configName (default tsconfig.json) as its typecheck config |
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | feature | unverifiable | @nx/next is not installed (node_modules/@nx has angular, devkit, eslint, js, playwright, web, workspace) and no next.config.* exists at the repo root; settling check: `git cat-file -p HEAD:package.json` records that @nx/next is not a dependency, so `node_modules/@nx/next/package.json` cannot be read here. |
| "`next build` auto-generates `next-env.d.ts` at the project root" | feature | unverifiable | no Next.js project exists in the workspace to observe the generated file; settling check: `git cat-file -p HEAD:package.json` records that no Next.js project exists here. |
| "**Core**: `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@types/node`, `@nx/react`" | config | unverifiable | package.json declares no react or @types/react dependencies and node_modules/@nx has no react package (Angular workspace) |
| "Next.js detects missing `@types/react` during `next build` and tries to install it using `yarn add`" | feature | unverifiable | no Next.js build in the repo and no yarn lockfile (package-lock.json is the only lockfile) |
| "Dest: CNW ts preset (Nx 23)" | status | unverifiable | no iteration artifacts from these runs in the repo (no apps/web, no import logs); settling check: `git cat-file -p HEAD:.commandcode/skills/nx-import/references/NEXT.md` records the destination preset only. |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run workspace validation (`nx run-many -t build lint test typecheck`)" | command | verified | node_modules/nx/dist/src/command-line/run-many/command-object.js:9 -- command run-many; nx.json:3-6 declares a build targetDefault in this workspace |
| "Turborepo monorepos ship with internal workspace packages that share configuration" | feature | unverifiable | the repo is not a Turborepo workspace (no turbo.json anywhere, no @repo/* packages in package.json), so the pattern cannot be observed here |
| "If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs`" | config | unverifiable | this workspace has neither at the root (no tsconfig.base.json, no eslint.config.*); tsconfig.json:19 sets moduleResolution NodeNext instead |
| "Turborepo does not use path aliases, Nx relies on them" | feature | unverifiable | no Turborepo source to compare with; tsconfig.json declares no compilerOptions.paths alias mapping here |
| "Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`" | config | unverifiable | package.json devDependencies declare neither turbo nor eslint-plugin-turbo and no turbo.json exists in the repo, so the removal step has no target here |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName`" | config | unverifiable | @nx/vite is not installed (node_modules/@nx has no vite) and no vite.config.ts exists in the repo, so the default cannot be read; settling check: `node_modules/@nx/vite/package.json` records the plugin default once installed. |
| "`nx sync --yes && nx reset`" | command | verified | node_modules/nx/dist/src/command-line/sync/command-object.js:7 -- command sync; node_modules/nx/dist/src/command-line/reset/command-object.js:3 -- yargsResetCommand |
| "Ensure Vite projects include" | config | unverifiable | no Vite project or tsconfig with vite/client types exists; root tsconfig.json:19 sets moduleResolution NodeNext with only node types |
| "Shared Vite deps (both frameworks): `vite`, `vitest`, `jsdom`, `@types/node`, `typescript` (dev)" | config | unverifiable | package.json:33 declares vitest ^4.0.8 and jsdom as devDependencies, but vite itself is not installed and no Vite project exists |
| "TanStack Start uses Vinxi under the hood, which wraps Vite" | integration | unverifiable | no TanStack Start or Vinxi project in the repo to inspect; settling check: `git cat-file -p HEAD:package.json` records that no TanStack Start project exists here. |
| "React Router 7 outputs to `build/` (not `dist/`)" | feature | unverifiable | no React Router project in the repo to observe an output directory; settling check: `git cat-file -p HEAD:package.json` records that no React Router project exists here. |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | node_modules/nx/dist/src/command-line/list/command-object.js:6 -- command list [plugin] |
| "Install plugins `npx nx add <plugin>`" | command | verified | node_modules/nx/dist/src/command-line/add/command-object.js:7 -- command add <packageSpecifier> |
| "Example: `npx nx add @nx/react`" | integration | unverifiable | @nx/react is absent from node_modules/@nx (angular, devkit, eslint, js, playwright, web, workspace only), so the example plugin is not installed here; settling check: `node_modules/@nx/react/package.json` records the plugin once installed; `git cat-file -p HEAD:package.json` shows it is absent. |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx run <project>:<task>`" | command | verified | package.json:12 -- test:app runs npx nx run angular-ai-devtools:test; node_modules/nx/dist/src/command-line/run/command-object.js:9 -- command run [project][:target][:configuration] |
| "`nx show project <projectname> --json`" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:87 -- command project [projectName]; show/project.js:78 reads node.data.targets |
| "`--parallel` to control the number of parallel processes (default is 3)" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:65 -- option parallel, describe Max number of parallel processes [default is 3] |
| "`--skipNxCache`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:109-110 -- skipNxCache reruns tasks even when results are available in the cache |
| "`--nxBail`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:95-96 -- nxBail stops command execution after the first failed task |
| "`--configuration=<name>`" | config | verified | node_modules/nx/dist/src/command-line/run/command-object.js:9 -- configuration is part of the run target spec; apps/angular-ai-devtools/project.json declares production and development configurations |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx show projects` to list projects" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:26 - example `$0 show projects` registers the command |
| "`nx show projects --withTarget build`" | command | verified | node_modules/nx/dist/src/command-line/show/projects.js:25 - filters on `args.withTarget` |
| "project schema at `node_modules/nx/schemas/project-schema.json`" | structure | verified | node_modules/nx/schemas/project-schema.json - file present in the installed nx 23.3.0 |
| "`targetDefaults` ... `namedInputs` - `plugins`" key nx.json sections | config | verified | node_modules/nx/schemas/nx-schema.json:38 - declares `namedInputs`; nx.json declares targetDefaults, plugins, generators |
| "`nx graph --print`" | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:30 - `option('print', ...)` prints the project graph to stdout |
| "`nx reset`  # if sync doesn't fix stale cache" | command | verified | node_modules/nx/dist/src/command-line/reset/command-object.js:6 - `command: 'reset'`; sync/command-object.js:7 - `command: 'sync'` |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Affected since base branch (auto-detected)" | command | verified | node_modules/nx/dist/src/command-line/show/projects.js:22 - args split with the 'affected' mode |
| "`nx show projects --affected --base=origin/main`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:210 - declares the `base` option |
| "`--head=def456`" | command | verified | node_modules/nx/dist/src/command-line/affected/affected.js:54 - `head: nxArgs.head` |
| "`--uncommitted`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:202 - `option('uncommitted', ...)` |
| "`--untracked`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:206 - `option('untracked', ...)` |
| "`--exclude=\"*-e2e\"`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:32 - `option('exclude', ...)` |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its `instances.json` is the registry both skills read" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:133 - registry entry `edge-dev-aion`; file also names chrome-beta-nano, chrome-beta-gemma4, chrome-stable-nano, edge-phi4mini |
| "`C model download <instance> --timeout-min=45`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:244 - `positiveFlag('timeout-min', timeoutMin, 45)` |
| "`npx nx run angular-ai-devtools:build-extension`" | command | verified | apps/angular-ai-devtools/project.json:52 - defines the `build-extension` target |
| "serving `spikes/ng222-app`'s `/stale-view-deferred` fixture route" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:7 - `{ path: 'stale-view-deferred', component: StaleViewDeferredFixture }` |
| "`state` records each instance's backend ... in `state.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:205 - writes `state.json` |
| "`extension-panel` records ... in `extension-panel.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:97 - writes `extension-panel.json` |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`install --from` takes the harness copy already in the checkout" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1035 - `const from = opts.from ?? 'edge-dev'` |
| "a bare `install` copies from Lars's Edge Dev profile" | feature | verified | control-angular-devtools/scripts/control.mjs:1035-1036 - default `'edge-dev'`, source resolved in that profile's Extensions dir |
| "`coexist.mjs --out <dir> [--di-graph]`" | command | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:10 - usage line with `--out <dir> [--di-graph]` |
| "`templateLostInPane: true` is the known Angular bug" | status | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:69 - records `templateLostInPane` from the control's JSON |
| "`extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | checks/extension-enabled.mjs:7, checks/attached.mjs:9, checks/coexist.mjs:11 - each names its artifact |
| "`APP` standing for the two arguments `\"--target\", \"counter\"`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:13 - `'counter'` is a TargetName |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pangular Inspector (@pangular-inspector/devtools 0.0.7)" | config | verified | portal package.json:54 - `\"@pangular-inspector/devtools\": \"0.0.7\"`; portal dir resolved at control-angular-dev-app/scripts/control.mjs:67 |
| "`inspect-providers` ... a `lookupPath`" | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:44 - expects `lookupPath` in the answer |
| "`tools/list` offers no action tool" | feature | verified | control-pangular-inspector/scripts/control.mjs:367 - an action tool needs `--confirm` |
| "`refused: navigate ... --confirm`" | status | verified | control-pangular-inspector/scripts/control.mjs:373 - refusal text `refused: <tool> acts on the app; pass --confirm` |
| "need ports 3000 and 9999 free (both fixed)" | config | verified | control-pangular-inspector/scripts/control.mjs:74 - `DEFAULT_PORT = 9999`; control-angular-dev-app/scripts/control.mjs:69 - `PORTAL_API_PORT = 3000` |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node:test` suites are named `*.node.test.ts` and run with `node --experimental-strip-types --test`" | command | verified | package.json:10 - test script runs `node --experimental-strip-types --test`; two `*.node.test.ts` files exist in the workspace |
| "the Angular unit-test builder is pinned to include only `**/*.spec.ts` and `tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | apps/angular-ai-devtools/project.json:114-121 - `@angular/build:unit-test` with include `**/*.spec.ts` and exclude `**/*.node.test.ts`; apps/angular-ai-devtools/tsconfig.spec.json:15-18 - exclude list holds `src/**/*.node.test.ts` |
| "the `angular-developer` skill should be model-invocable (no `disable-model-invocation` flag) ... only `angular-new-app` should remain explicit-only (`disable-model-invocation: true`)" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\angular-developer\SKILL.md - frontmatter has no `disable-model-invocation`; C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\angular-new-app\SKILL.md:9 - `disable-model-invocation: true` |
| "specifically excludes Vitest, Analog.js, Storybook, NgRx, and RxAngular" | status | verified | package.json:25-34 - no @ngrx, storybook or analog dependency; vitest is only a devDependency (package.json:33) for test tooling, not a feature dependency |
| "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | feature | unverifiable | no `forms/signals` import under apps/angular-ai-devtools/src and no insurance-portal project in this repository; the portal repository would settle it; settling check: `git cat-file -p HEAD:.commandcode/skills/control-angular-dev-app/features/portal-contracts.md` records the portal forms API; a portal clone settles the migration. |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "say `modern Angular pattern` ... never `blessed` or `ordained` ... neither word may appear in DevTools code, UI or runtime text" | status | verified | docs/feature-proposals.md:571 - records the wording rule; git grep over apps/, extension/ and src/ returns no hit for either word (only the verbatim ruling quotes in docs/afk-run-2026-10-12.md:77-79 and docs/feature-proposals.md) |
| "`provideAiDevTools()` not `provideAiDevtools()`, `provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | config | unverifiable | git grep -n provideAiDevTools over tracked *.ts returns no source hit; the name appears only in .commandcode/taste/*.md and .project/archive docs, so no implementation casing exists to compare. The companion package landing in code would settle it; settling check: `git cat-file -p HEAD:.commandcode/taste/communication/taste.md` records the rule, and the companion package `package.json` will record the export. |
| "Model prompting guides should note the model context window, multimodal/multi-model capabilities ..." | status | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\references\prompting-beam.md:5 - prompting guides state the context window (11 prompting-*.md files in that folder) |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the page, content scripts, and service worker never host `LanguageModel`" | structure | verified | extension\agent-main.js, extension\relay.js and extension\background.js contain no `LanguageModel` reference, while the panel-side apps/angular-ai-devtools/src/app/extension-prompt.service.ts does |
| "The MAIN-world script is limited to reading the page (`ng.setProfiler`, `ng.getSignalGraph`) and sending shaped facts to the panel" | structure | verified | extension\manifest.json:23-27 - agent-main.js is a content script with `world: MAIN`; extension\agent-main.js:73 - probes `ng.setProfiler` for change detection only |
| "do not ... call `getViewContainerRef()` on component hosts" | feature | verified | extension\agent-main.test.mjs:117-119 - test asserts the MAIN-world code contains no getViewContainerRef, ViewContainerRef or di_graph |
| "A Worker must not call `LanguageDetector` or `Translator` itself" | integration | verified | git grep over apps/, extension/ and src/ returns no LanguageDetector or Translator reference, so the constraint holds in code |
| "Removing `panel/**` from `web_accessible_resources` is conditional" | config | verified | extension\manifest.json - the MV3 manifest has no `web_accessible_resources` key at all, so no panel asset is exposed |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "On Windows, the correct username path is `C:\Users\LarsGyrupBrinkNielse` (without the trailing `n`)" | config | verified | Test-Path C:\Users\LarsGyrupBrinkNielse returns True and this sidecar root sits under it; no LarsGyrupBrinkNielsen sibling path is used |
| "the configured npm global prefix is `C:\Users\LarsGyrupBrinkNielse\.local\bin`; `D:\packages\npm-global` exists and is populated" | config | verified | .commandcode/taste/tooling/taste.md:58 - corrected wording; C:\Users\LarsGyrupBrinkNielse\.npmrc:2 - prefix=C:\Users\LarsGyrupBrinkNielse\.local\bin |
| "Command Code mods follow a three-file layout in `~/.commandcode/mods/`: `{name}.ts`, `{name}.config.json`, `{name}.README.md`" | structure | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\mods\ holds auto-retry-rate-limit.ts, auto-retry-rate-limit.config.json and auto-retry-rate-limit.README.md (same trio for auto-compact-context) |
| "Tests for a user-scope Command Code mod must NOT live in `~/.commandcode/mods/`" | structure | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\mod-tests\auto-retry-rate-limit.test.ts exists and mods\ contains no .test.ts file |
| "verify with `nx test angular-ai-devtools --include=` rather than `--testPathPattern=` or `--testFilePattern=`" | command | verified | apps/angular-ai-devtools/project.json:114-119 - the test target is @angular/build:unit-test with an `include` option, so --include maps to a real option |
| "For Nx Angular workspaces, do not use a custom Node script as the serve target; prefer Nx executors (e.g. `@angular/build:dev-server`)" | config | verified | apps/angular-ai-devtools/project.json:100-102 - serve target uses `@angular/build:dev-server` |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "validates it programmatically: disjoint ## Doc: and ## Descriptive docs sections matching the frozen inventory" | command | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\check_docs_audit.py:352-380 - requires Summary, Descriptive docs, User rulings and Remediation queue sections and raises AuditError on a duplicate Descriptive docs entry |
| "Commit taste-file changes ... in their own dedicated commits ... (one commit per changed taste file)" | status | verified | git log -1 --name-only 384ee32 in the repo shows commit chore(taste): record the one-pair-per-model browser rule touching only .commandcode/taste/tooling/taste.md |
| "shared project settings stay committed in `.commandcode/settings.json`, while personal ... config ... goes in a gitignored `.commandcode/settings.local.json`" | config | verified | .gitignore:18 - .commandcode/settings.local.json is ignored; git ls-files .commandcode lists settings.json as tracked |
| "Generated build artifacts (e.g. hashed JS/CSS outputs under `extension/panel/`) should be gitignored; only ... `index.html` and `favicon.ico` should remain tracked" | config | verified | .gitignore:32-35 - extension/panel/* ignored with !extension/panel/index.html and !extension/panel/favicon.ico; git ls-files extension/panel returns exactly those two files |
| "Keep `spikes/` and `research/` in the repository; do not archive them" | structure | verified | git ls-files spikes lists tracked fixtures such as spikes/ng222-app/.editorconfig and git ls-files research lists research/00-browser-probe.md and research/01-built-in-ai-apis.md, so both trees stay tracked at 334ff8e |
| "Prefers atomic, bisect-safe Conventional Commits ... follows the Conventional Commits format (e.g. `feat:`, `fix:`, `chore:`)" | status | verified | git log --oneline -4 shows chore(taste)-prefixed commits, e.g. 384ee32 chore(taste): record the one-pair-per-model browser rule |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json - devDependencies.typescript is `6.0.3` |
| "call `%USERPROFILE%\.commandcode\gsd.bat <verb>` (it runs `scripts/gsd/gsd.ts`)" | structure | verified | ~/.commandcode/gsd.bat:2 - `node "%~dp0scripts\gsd\gsd.ts" %*`; ~/.commandcode/scripts/gsd/gsd.ts exists (repo has no scripts/gsd) |
| "The automatic bridge (`scripts/sidecar-deps-bridge.mjs`)" | feature | verified | scripts/ensure-sidecar-deps.mjs:4 - `import { bridge } from './sidecar-deps-bridge.mjs'`, and `npm run check` runs that wrapper |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:14`)" | status | verified | AGENTS.md:64 - corrected citation; apps/angular-ai-devtools/src/app/app.routes.ts:14 - the interop route, :15 is chat |
| "`toSignal(this.subject)` at line 14 and ... `subject.error(...)` at line 22" | structure | verified | spikes/ng222-app/src/app/stale-view-fixture.ts:14 `readonly signal = toSignal(this.subject);` and :22 `this.subject.error(new Error('interop'));` |
| "`.claude/skills/` holds byte copies of them" | structure | verified | byte comparison: .claude/skills/verify-ai-browsers is byte-identical (17 files) and control-ai-browsers has the same 23 tracked files (docs drifted elsewhere, e.g. .claude/skills/verify-angular-devtools/checks/attached.mjs differs in length) |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`up --target portal` exit 0 twice (18.5 s, 20.5 s)" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:13 - `portal` is a TargetName; :69 PORTAL_API_PORT = 3000 backs the described API-then-app fix |
| "M1 ... getDependenciesFromInjectable calls injector.get first, injector_discovery_utils.ts:61" | structure | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:11926-11930 - `getDependenciesFromInjectable` calls `injector.get(token, ...)` before reading dependencies |
| "the CPU flag is a command-line --enable-features value per instances.json and control.mjs:584" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:536 - builds `--enable-features=` from the registry backend; :794 rejects a feature list matching no backend |
| "Removed .claude/skills/verify" | status | verified | `.claude/skills/verify` is absent from the checkout and from the frozen inventory |
| "saved the probe's raw output to research/raw/effect-writes.json" | structure | verified | research/raw/effect-writes.json exists |
| "Vitest Browser work committed after re-running ng test (exit 0, 2 passed, 2 skipped)" | status | unverifiable | the run's own test output is not in the repo; re-running `npm test` in spikes/ng222-app would settle the 2 passed / 2 skipped counts; settling check: `node --test .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs` plus `control.mjs doctor` after a tester run record the counts. |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "A tab in the extension's DevTools panel ("Angular AI", 3.1), next to the chat" | feature | aspirational | a search of apps/angular-ai-devtools/src, extension/ and src/ finds no `tutor` occurrence; the panel routes are N1, signal-provenance, di-doctor, error-explainer, stale-view, interop and chat (apps/angular-ai-devtools/src/app/app.routes.ts:9-15) |
| "The panel can host model sessions [measured, S1 in 11]" | status | verified | research/11-spike-s1-extension-contexts.md:24 - the DevTools panel row (`chrome.devtools.panels.create`) gets a usable `availability()` |
| "All tutor state is in `chrome.storage.local`, written by the panel" | feature | aspirational | `chrome.storage.local` appears nowhere in extension/, src/ or apps/angular-ai-devtools/src/ (0 hits), so no tutor persistence exists yet |
| "`ai_tutor` tool ... tool in source at `ai-tutor.ts:14`" | structure | unverifiable | the installed @angular/cli ships `src/commands/mcp/tools/ai-tutor.js` plus `resources/ai-tutor.md` and no `.ts` file, so line 14 of the TypeScript source cannot be checked here; settling check: `git cat-file -p HEAD:research/02-angular-surface.md` records the citation; the installed CLI ships `ai-tutor.js`, not a `.ts` file. |
| "K3 uses 3.3's routing rule unchanged: native tools on Edge with a `contextWindow` of 7,168" | config | verified | research/05-spikes.md:90 - Aion-1.1-Instruct on Edge Dev 157 measured at 7,168 |
| "`chrome.devtools.panels.elements.onSelectionChanged` gives the selected element for `locate` exercises" | structure | unverifiable | no use of `onSelectionChanged` anywhere in extension/, src/ or apps/ (0 hits); a built panel that calls it would settle the claim; settling check: `control.mjs panel` on a built panel records whether it calls `onSelectionChanged`. |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured on the SSR fixture `spikes/ng222-ssr` ... whose `Server`, `Prerender` and `Client` routes each render in its declared mode" | structure | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - RenderMode.Server, Prerender and Client; spikes/ng222-ssr/package.json - @angular/core ^22.2.0 |
| "the context window is small: 7,168 tokens on Aion and 9,216 on the Chrome models and Phi-4-mini" | status | verified | research/05-spikes.md:90 (Aion 7,168), :91 (Gemma 4 9,216), :167 (Phi-4-mini 9,216) |
| "Angular 22 already ships two in-page AI tools. Every dev-mode app answers the `devtoolstooldiscovery` DOM event" | feature | verified | node_modules/@angular/core/fesm2022/core.mjs:2311 - dispatches the `devtoolstooldiscovery` event with the registered AI tools |
| "Gemma 4 (Chrome Beta 156) is reliable only through a structured-output loop (13/15 runs on the default GPU low tier" | status | verified | research/05-spikes.md:165 - GPU `gemma4_gpu_low_tier_model` 13/15 fallback, 11-14 s |
| "`spikes/probes/regrade.mjs`" | structure | verified | spikes/probes/regrade.mjs exists and research/05-spikes.md:198 cites its regrade of the Nano figures |
| "N24 Zoneless stale-view finder" and "N25 RxJS interop explainer" in the first release | structure | verified | apps/angular-ai-devtools/src/app/app.routes.ts:13-14 - `stale-view` and `interop` routes load the N24 and N25 components |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`angular:di_graph` AI tool creates a `ViewContainerRef` on every component host, after which `ng.ÉµgetSignalGraph` loses the template consumer" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:69 - records `templateLostInPane`, which the skill calls the known Angular bug |
| "Versions: `@angular/core` 22.2.2" | config | unverifiable | the checkout installs @angular/core 22.1.0 at the root and ^22.2.0 in spikes/ng222-app; the cited 22.2.x branch source is not in the repo; settling check: `node_modules/@angular/core/package.json` records the installed version. |
| "`pangular-inspector/devtools` ... the published 0.0.7 does not have it" | config | verified | portal package.json:54 - `"@pangular-inspector/devtools": "0.0.7"` |
| "`packages/core/src/debug/ai/di_graph.ts`" | structure | unverifiable | installed @angular/core ships only fesm2022 bundles, so the packages/core/src path cannot be inspected here; settling check: `node_modules/@angular/core/package.json` records that only fesm2022 bundles ship. |
| "`result.tools has 46 entries and no list-components`" | status | unverifiable | no captured tools/list response exists under research/raw; a live `control.mjs call tools/list` against 0.0.7 would settle the count |
| "Status: draft, not filed." | status | unverifiable | upstream filing state is external to this repository, and no git record here can show whether an issue was opened; settling check: no command in this checkout reaches it; the upstream tracker's citations settle whether the issue was opened. |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Initial-bundle budget is a hard 520 KB" | config | verified | apps/angular-ai-devtools/project.json:82 - `"maximumWarning": "520kb"` under the build-extension budgets |
| "(`apps/angular-ai-devtools`, `projectType: application`, `build-extension` -> `extension/panel`, `baseHref: /panel/`)" | config | verified | apps/angular-ai-devtools/project.json:4 projectType application; :61 build-extension outputPath; :76 baseHref "/panel/" |
| "the veto at `CHARTER.md:65` is lifted" | status | verified | .project/CHARTER.md:65 - "No Tier 2 (app opt-in `globalThis` export) features in this program" is exactly the veto A1 names |
| "the way M001-M017 was actually grown (17 entries, never one dispatch)" | status | verified | .project/archive holds 001-run-unrun-spikes through 017-verification-coverage, 17 milestone archives |
| "each programme's admission into `Full scope: in` is recorded as a Correction at its boundary" | structure | verified | .project/CHARTER.md:172 - the append-only `## Corrections` section, with AR-1..AR-7 recorded at :246-254 |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | status | stale | docs/feature-proposals.md measures 914 lines, so the cited 1110 no longer describes the file |
| "the eleventh, the `LanguageDetector`/`Translator` worker crash, is at `docs/filing-ledger.md:230`" | structure | verified | docs/filing-ledger.md:230 - "## 11. Chromium (Blink>AI): `LanguageDetector.availability()` or `Translator.availability()` in a dedicated worker crashes the renderer" |
| "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - the five `port` fields are exactly 9333, 9334, 9335, 9337 and 9338 |
| "The browser instance registry is `.claude/skills/control-ai-browsers/instances.json`" | structure | verified | .claude/skills/control-ai-browsers/instances.json exists and carries the same 23 tracked files as its .commandcode counterpart |
| "The companion package exports `provideAiDevTools()`, `provideAiNgrxDevTools()`" | feature | aspirational | no source in the repo declares those exports; the names appear only in .commandcode/taste/communication/taste.md:4 |
| "`control-angular-dev-app` (targets counter, ssr, portal, or `--url`)" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:13 - TargetName is counter, ssr or portal |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`" | status | verified | .project/archive/018-instrument-core/MANIFEST.md, with its intent, plan, tasks and review folders, records the shipped milestone |
| "Panel initial-bundle budget is **520 KB** (`project.json`, `build-extension`)" | config | verified | apps/angular-ai-devtools/project.json:82 - `"maximumWarning": "520kb"` inside the build-extension budgets |
| "branch \| `gsd-path/M018` (bound; `gsd-path/M017` retired locally and on origin)" | status | stale | .project/STATE.md:9 - the bound branch is `gsd-path/M021`; the document's own banner already marks the note superseded |
| "Prior audit `Audited HEAD: bfc4656b0c475769af3ddd162206e7a11776bfe2`, which is an ancestor of HEAD" | status | verified | `git merge-base --is-ancestor bfc4656... HEAD` exits 0, and .project/research/DOCS-AUDIT.md exists |
| "`isolation.py isolate-verify` requires `--repo --base --name`" | command | verified | ~/.commandcode/skills/gsd-path/scripts/isolation.py - the isolate-verify parser marks --repo, --base and --name `required=True` |
| "Frozen inventory: **143 documents**" | status | unverifiable | the M021 frozen inventory holds 144 non-empty paths; the M018 count is not recorded anywhere in the repo; settling check: `git cat-file -p HEAD:plans/gsd-path-handoff-M018.md` records the dated 143, and `node --test scripts/docs-audit-disposition.test.mjs` prints the current inventory. |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:253`" | config | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:253 - `timeout: 600000,` |
| "`timeoutMs` 1800000 for the `extension-panel` step and 900000 for `state`" | config | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:49 - `timeoutMs` 1800000; :71 - 900000 was enough for four |
| "`chrome-beta-nano` serves the same `v3Nano` model as `chrome-stable-nano`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - both registry entries name model `v3Nano` |
| "Ports 9333-9338 belong to the shared instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json - port fields 9333, 9334, 9335, 9337 and 9338 |
| "Check that port 9992 is free." | config | unverifiable | no file under .commandcode/skills names 9992; a live listener check on the host would settle it; settling check: `control.mjs doctor` on the browser instance records which ports are held. |
| "`verdict.mjs lint <verdict.json>` must exit 0" | command | verified | ~/.commandcode/skills/lars-verify/scripts/verdict.mjs exists |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`model pin`, the restore on `up`, doctor's `model.pin` row" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:991 and :1069 - `model pin` messages and the "no pin yet" warning |
| "Edge On-Device Model Manifest \| `EdgeOptimizationGuideModelsManifest\<version>`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:154 - the edge-dev-aion pin list names EdgeOptimizationGuideModelsManifest |
| "`--disable-component-update` stays on" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:149 - args contains `--disable-component-update` |
| "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | config | unverifiable | the pin lives in the browser profile outside the repo, and `tmp/control-ai-browsers/pins` does not exist in this checkout; settling check: no command in this checkout reaches it; the model pin artifact lives in the browser profile outside this repository. |
| "`.claude/skills/` holds a byte-identical copy of it, which `node --test scripts/skills-mirror.test.mjs` enforces" | structure | verified | scripts/skills-mirror.test.mjs exists; .claude/skills/verify-ai-browsers is byte-identical to its .commandcode copy (17 files) |
| "A profile that starts under `--disable-component-update` never receives one." | status | unverifiable | needs a fresh Edge Dev profile and a read of edge://components; not reproducible from the checkout; settling check: `control.mjs doctor` on a fresh Edge Dev profile records the component update state. |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js`" | structure | verified | spikes/probes/probe5.js:5-6 - defines the getComponentCount and getComponentInputs tool impls the probe passes to LanguageModel.create |
| "`probe9.js:18-27` streamed on a `clone()` of the session right after `prompt()`" | feature | verified | spikes/probes/probe9.js:26 - calls (await s.clone()).promptStreaming(...) inside the probe loop, with no tool-response sent |
| "reads 1 GB sequentially in 4 MB blocks with `FILE_FLAG_NO_BUFFERING`" | feature | verified | spikes/probes/read-throughput.ps1:3,6 - $Megabytes = 1024 and $block = 4MB, with $noBuffering = [IO.FileOptions]0x20000000 |
| "Each instance runs with its own `--user-data-dir` under `.browsers/` (gitignored, on D:)" | config | verified | .gitignore:11 - `.browsers/` is an ignored path |
| "`.browsers/chrome-beta-nano` \| 9333 ... `.browsers/edge-dev-aion` \| 9335" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:69-70,100-101,134-135 - chrome-beta-nano CDP 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335 |
| "`.browsers/edge-phi4mini` \| 9337 \| none (base set)" | config | verified | research/00-browser-probe.md:141 - corrected port; .commandcode/skills/control-ai-browsers/instances.json:171-173 - the registry has edge-phi4mini on Edge stable 155 at CDP 9337 |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "When `tools` is given, `expectedOutputs` must include tool-call and `expectedInputs` must include tool-response" | feature | verified | research/raw/matrix-gemma4.json:1 - the toolsOnly case fails with TypeError: When tools are provided, expectedOutputs must include {type: tool-call}, while toolsAndTypes succeeds and prompts a tool-call |
| "`responseConstraint`: a JSON Schema object or a `RegExp`, on `prompt()`/`promptStreaming()`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1385 - prompts with responseConstraint {type: object, properties: {hook: string}, required: [hook]} and parses the JSON answer |
| "Superseded: the spelling is not uniform across builds — Chrome Beta 156 reads `callID` and Edge Dev 157.0.4329 requires `callId`" | feature | verified | research/01-built-in-ai-apis.md:56 - corrected wording; .commandcode/skills/control-ai-browsers/scripts/control.mjs:1424-1430 reads c.callID ?? c.callId |
| "WebMCP is now `document.modelContext` (not `navigator`)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1439 - the WebMCP canary passes on typeof document.modelContext === object, and :1372 probes navigator.modelContext separately |
| "`gemma4-2b-it`, `contextWindow` 9216" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:126-128 - chrome-beta-gemma4 model name gemma4-2b-it with contextWindow 9216 (edge-dev-aion is 7168 at :166) |
| "turning it on also switches the model to v4, the value `#gemma4-for-built-in-ai` sets" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:103-108 - chrome-beta-gemma4 enables AIPromptAPIToolUse together with OnDeviceModelConversationBackend and AIApiFoundationalModel:model_version/v4 |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ng` is the expando key `GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'` (`global_utils.ts:69`)" | structure | verified | D:\projects\github\angular\angular\packages\core\src\render3\util\global_utils.ts:69 - export const GLOBAL_PUBLISH_EXPANDO_KEY = 'ng' |
| "`@if` / `@switch` are not covered - the enum has only `Defer` and `For`" | structure | verified | D:\projects\github\angular\angular\packages\core\src\render3\util\control_flow_types.ts:13-16 - enum ControlFlowBlockType declares only Defer, For; getControlFlowBlocks is at render3/util/control_flow.ts:51 |
| "`getSignalGraph` (`injector: Injector`) => `DebugSignalGraph`, `signal_debug.ts:270-298`" | feature | verified | D:\projects\github\angular\angular\packages\core\src\render3\util\signal_debug.ts:277 - export function getSignalGraph(injector: Injector): DebugSignalGraph |
| "`enableProfiling` ... `@publicApi v21.0` ... `render3/debug/chrome_dev_tools_performance.ts:364-387`" | feature | verified | D:\projects\github\angular\angular\packages\core\src\render3\debug\chrome_dev_tools_performance.ts:370,375 - the @publicApi v21.0 tag sits on enableProfiling() |
| "a component without a `changeDetection` property is OnPush (since 22.0), `render3/definition.ts:352`" | feature | verified | D:\projects\github\angular\angular\packages\core\src\render3\definition.ts:352 - onPush: componentDefinition.changeDetection !== ChangeDetectionStrategy.Eager; CHANGELOG.md:859 states the new OnPush default |
| "CHANGELOG top entry is `22.2.0 (2026-09-23)`, `CHANGELOG.md:1-2`" | status | verified | D:\projects\github\angular\angular\CHANGELOG.md:1-2 - anchor 22.2.0 followed by the heading 22.2.0 (2026-09-23) |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Local clone: `D:\projects\github\pangular-inspector\devtools`, last commit `76c09d0` (2026-10-11)" | status | verified | git -C D:\projects\github\pangular-inspector\devtools log -1 - shows 76c09d0 dated 2026-10-11 (fix(overlay): follow the pointer inside a shadow root while picking (#306)) |
| "package `@pangular-inspector/devtools` 0.0.7, extension manifest 0.0.7" | config | verified | packages/devtools/package.json - name @pangular-inspector/devtools, version 0.0.7; extension/manifest.json - version 0.0.7 |
| "No `permissions`; host permissions for loopback only (`*.localhost`, `127.0.0.1`, `[::1]`), other hosts via `optional_host_permissions`" | config | verified | extension/manifest.json - no permissions key, host_permissions are the three loopback hosts, optional_host_permissions http(s)://*/* |
| "Reads the page ~250 ms after change detection (`REFRESH_DEBOUNCE_MS = 250`)" | config | verified | packages/devtools/src/change-detection.ts:15 - export const REFRESH_DEBOUNCE_MS = 250, used at :119 as options.debounceMs ?? REFRESH_DEBOUNCE_MS |
| "Exposes helper globals for the extension: `window.__pangularComponentOf(el)` (`overlay.ts:662`)" | feature | verified | packages/devtools/src/overlay.ts:662 - window.__pangularComponentOf = componentOf, deleted again at :664 |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Local clones used: `D:\projects\github\ngrx\platform` (NgRx 22.0.0, `modules/store/package.json`)" | config | verified | D:\projects\github\ngrx\platform\modules\store\package.json - version 22.0.0 |
| "`D:\projects\github\analogjs\analog` (`@analogjs/platform` 2.8.0)" | config | verified | D:\projects\github\analogjs\analog\packages\platform\package.json - name @analogjs/platform, version 2.8.0 |
| "`window.__REDUX_DEVTOOLS_EXTENSION__` is read in a provider factory, `createReduxDevtoolsExtension()`, `modules/store-devtools/src/provide-store-devtools.ts:34-45`" | feature | verified | D:\projects\github\ngrx\platform\modules\store-devtools\src\provide-store-devtools.ts:34-35 - createReduxDevtoolsExtension sets extensionKey to __REDUX_DEVTOOLS_EXTENSION__; wired as useFactory at :87 |
| "tokens `StoreDevtools`, `STORE_DEVTOOLS_CONFIG`, `IS_EXTENSION_OR_MONITOR_PRESENT` (`provide-store-devtools.ts:23,76-103`)" | structure | verified | D:\projects\github\ngrx\platform\modules\store-devtools\src\provide-store-devtools.ts:23 - IS_EXTENSION_OR_MONITOR_PRESENT InjectionToken; STORE_DEVTOOLS_CONFIG provider at :90 |
| "install a shim `window.__REDUX_DEVTOOLS_EXTENSION__` at document_start ... world MAIN" | integration | unverifiable | extension\manifest.json:27-28 of this repo declares world MAIN but run_at document_idle, so document_start is not exercised anywhere; a timing spike that logs the shim before the Store provider factory runs would settle it |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All four per-model instances verified healthy via `control-ai-browsers doctor` (exit 0): chrome-beta-nano (port 9333) ... edge-phi4mini (port 9337)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:69-70,90,124,135,162,171-173,190 - four instance entries at CDP 9333/9334/9335/9337 with models v3Nano, gemma4-2b-it, Aion-1.1-Instruct, Phi-4-mini-instruct |
| "A component `app-counter` (`src/app/counter.ts`) has `title = input()`, `count = signal(3)`, `double = computed(count * 2)` ... and an `effect` that writes `lastLogged`" | structure | verified | spikes/ng222-app/src/app/counter.ts:16-23 - exactly those declarations, the effect writing lastLogged.set(this.count()) |
| "The probe (`spikes/probes/portal-probe.js`) ran in Edge Dev ... navigated with `ng.getRouterInstance(...).navigateByUrl`" | feature | verified | spikes/probes/portal-probe.js:6,8 - ng.getRouterInstance(ng.getInjector(...)) then router.navigateByUrl(p) |
| "A draft upstream report is in `docs/filing-ledger.md`" | status | verified | docs/filing-ledger.md:5,11 - entry 1 records angular:di_graph creating a ViewContainerRef on every component host, after which getSignalGraph loses the template consumer |
| "S1 ran; see `11-spike-s1-extension-contexts.md`" | status | verified | research/11-spike-s1-extension-contexts.md:3-5 - Status: done, phase 2 measured on the Gemma 4 (9334) and Aion (9335) instances |
| "now `signal_dependencies {id, signal}` in `docs/feature-proposals.md` 3.4" | structure | verified | docs/feature-proposals.md:384,421 - section 3.4 Core tool set lists signal_dependencies with the {id, signal} input |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "branch `main`, commit `747c3c2` (message release: cut the v22.1.0-next.4 release, 2026-07-01)" | status | verified | git -C D:\projects\github\angular\skills log -1 - shows 747c3c2 2026-07-01 with exactly that subject |
| "Repo shape (measured): 2 skills, 37 reference files, README, BUILD_INFO" | structure | verified | Get-ChildItem D:\projects\github\angular\skills\angular-developer\references - 37 files |
| "whole reference corpus is 135,754 bytes (measured, wc -c)" | config | verified | Measure-Object -Sum Length over the 37 reference files returns 135754 bytes |
| "`components.md` 3422 ... `signal-forms.md` 28079" | config | verified | Get-Item lengths: angular-developer/references/components.md 3422 bytes, signal-forms.md 28079 bytes |
| "`track` required (l.79) ... no `Component` suffix (l.117)" | feature | verified | angular-developer/references/components.md:79 - the track expression is required; :117 - do not add the Component suffix to Component classes |
| "`BUILD_INFO` line 1-2" | structure | verified | D:\projects\github\angular\skills\BUILD_INFO:1-2 - Wed Jul 1 21:15:44 UTC 2026 and the commit b126dc9726789ad5ca3b26e497725e6a05031ed3 that matches the log's full hash |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`get_component_count` ... and `getcomponentcount`, returned tool calls; `getComponentCount` and `Get_component_count` failed with `kErrorUnknown` [measured, n=1 per variant, `research/raw/tool-name-matrix-gemma4-gpu.json`]" | feature | verified | research/raw/tool-name-matrix-gemma4-gpu.json:1 - five entries: get_component_count (both schemas) and getcomponentcount return tool-call, getComponentCount and Get_component_count return ERR UnknownError ... kErrorUnknown |
| "`spikes/probes/tool-name-matrix.js` (five variants including empty `properties` with a snake_case name)" | structure | verified | spikes/probes/tool-name-matrix.js:10-15 - the variants array holds exactly those five labels and names |
| "tool names are lowercase (snake_case recommended for readability), and a tool with nothing to ask may take an empty `properties` schema (`docs/feature-proposals.md` 2.1)" | config | verified | docs/feature-proposals.md:125,188 - records that an uppercase letter in the tool name fails with kErrorUnknown and that an empty properties schema does not fail |
| "`research/raw/bench/gemma4.json`; tool schemas at `spikes/probes/bench.js:56-58`" | structure | verified | spikes/probes/bench.js:56-58 - the three tool schemas (components_find, component_details, signal_info) each with a required parameter; research/raw/bench/gemma4.json is present |
| "Every failing probe behind the empty-`properties` rule also used camelCase names, so the two suspects are confounded" | status | verified | docs/feature-proposals.md:195 - states the empty-schema suspect is cleared for Gemma 4 on the GPU low tier, matching this doc's later resolution |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`debounced`: site says stable in 22; source says `@experimental 22.0` (`packages/core/src/resource/debounce.ts:32`, `packages/core/src/resource/api.ts:316,331`)" | status | verified | D:\projects\github\angular\angular\packages\core\src\resource\debounce.ts:32 and resource\api.ts:316,331 - all three lines carry @experimental 22.0 |
| "`enableProfiling()`: site says experimental in 21; source says `@publicApi v21.0` (`packages/core/src/render3/debug/chrome_dev_tools_performance.ts:370`)" | status | verified | D:\projects\github\angular\angular\packages\core\src\render3\debug\chrome_dev_tools_performance.ts:370 - @publicApi v21.0 on enableProfiling |
| "`CHANGELOG.md` top entry is 22.2.0 (`CL:1-2`)" | status | verified | D:\projects\github\angular\angular\CHANGELOG.md:1-2 - anchor 22.2.0 then the heading 22.2.0 (2026-09-23) |
| "measured on the insurance portal, `research/raw/zone-mode-portal.json`" | status | verified | research/raw/zone-mode-portal.json:1 - zoneGlobal true, zoneCurrent root, zoneTokens listing environment-injector provider records such as ChangeDetectionScheduler, the read the doc describes |
| "Tiers are the ones in `docs/feature-proposals.md` section 2.2: tier 0 = public `ng.*` or DOM or standard browser API ... tier 2 = needs an app change" | structure | verified | docs/feature-proposals.md:205 - section 2.2 Data tiers defines the three tiers by data source |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured behaviour: `05-spikes.md`, section Root cause hunt (Chrome Beta 156.0.8078.17, Nano profile serving `v3Nano`)" | status | verified | research/05-spikes.md:125-127 - the section exists and records the run in Chrome Beta 156.0.8078.17 with raw output in research/raw/matrix-gemma4.json and research/raw/matrix-nano.json |
| "The device is unable to create a session to run the model. Please check the result of availability() first." | feature | verified | research/raw/matrix-nano.json:1 - toolTypesOnly, toolCallOutOnly and toolResponseInOnly return ERR NotSupportedError with exactly that message |
| "A separate Chrome Beta 156 instance (`--user-data-dir=.browsers/chrome-beta-nano`) downloaded only `v3Nano` (4.0 GB)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:89-96 - chrome-beta-nano model v3Nano with downloadMib 4073 and toolCanary false |
| "Gemini Nano, native tool calling ... the device is unable to create a session" | status | verified | .commandcode/skills/control-ai-browsers/instances.json:95,129,167 - chrome-beta-nano declares toolCanary false while chrome-beta-gemma4 and edge-dev-aion declare true |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "profilesRoot: `.browsers`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:2 - "profilesRoot": ".browsers" |
| "Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335, Phi-4-mini on 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173 - the four instance ports are 9333, 9334, 9335, 9337 |
| "`spikes/probes/regrade.mjs` regrades saved runs without rerunning a model" | feature | verified | spikes/probes/regrade.mjs:1 - header says it regrades saved bench.js results without rerunning any model |
| "it now holds the CPU run, native 1/15, fallback 0/15" | status | verified | research/raw/bench/nano.json:1 - native runPasses "1/15", fallback runPasses "0/15" |
| "The dependency grader at `bench.js:64` already requires `\bcount\b` and fails an answer that names no signal" | command | verified | research/10-model-capabilities.md:92 - corrected wording; spikes/probes/bench.js:64 - the whole-word grader |
| "Chromium `runtime_enabled_features.json5` at tag `156.0.8078.17`, lines 485-500" | config | unverifiable | Chromium is not vendored in the repo; would need the tag-156 `third_party/blink` tree to name the feature entry; settling check: `git cat-file -p HEAD:research/10-model-capabilities.md` records the citation to check against the Chromium tag-156 tree. |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension: `spikes/s1-extension/` (retired in M009)" | structure | verified | `git ls-files spikes/s1-extension` returns 0 files; .project/archive/001-run-unrun-spikes exists |
| "Evidence: `research/s1-results/chrome-fresh.json`, `research/s1-results/edge-fresh.json`" | structure | verified | `git ls-files research/s1-results` lists chrome-fresh.json, edge-fresh.json, chrome-gemma4.json, edge-aion.json |
| "camelCase tool names `getComponentCount` / `getComponentInputs` (`probe5.js:15-16`)" | config | verified | spikes/probes/probe5.js:15-16 - both names appear exactly as cited |
| "Doctor then showed the `prompt_api_gemma4` use case as Not Supported and exited 1" | status | verified | research/s1-results/chrome-gemma4-crash-doctor.json:1 - "ok": false, useCase prompt_api_gemma4 state "Not Supported" |
| "tool names are lowercase (snake_case recommended for readability)" | config | verified | docs/feature-proposals.md:197 - same rule recorded for section 2.1 |
| "An uppercase letter in the tool name is what fails" | feature | verified | research/raw/tool-name-matrix-gemma4-gpu.json:1 - getComponentCount returns kErrorUnknown; getcomponentcount and get_component_count return tool calls |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ChangeDetectorRef.checkNoChanges` ... Removed in 22.0 (`CL:861`)" | status | verified | A/CHANGELOG.md:861 - "ChangeDetectorRef.checkNoChanges was removed. In tests use fixture.detectChanges() instead." |
| "`ComponentFactoryResolver`, `ComponentFactory` ... Removed in 22.0 (`CL:863`)" | status | verified | A/CHANGELOG.md:863 - both are no longer available; pass the component class to ViewContainerRef.createComponent |
| "`Standalone[_AppComponent]`, then "Environment Injector", then `null`" | status | verified | research/raw/zone-mode-portal.json - contains "Standalone" and "Environment Injector" for the portal root injector path |
| "`spikes/ng222-app/dist/ng222-app/browser/main.js` ... (unminified, 968 `ngDevMode` references)" | structure | unverifiable | dist output is not in the checkout; would need a dev build of the spike app to count ngDevMode occurrences; settling check: `git cat-file -p HEAD:spikes/ng222-app/project.json` records the build target, and a dev build then a count over `main.js` records the ngDevMode references. |
| "the 22.0.0 section starts at `CLI-CL:149`" | status | unverifiable | the angular-cli clone is outside this repo and was not read for this audit; settling check: `git cat-file -p HEAD:research/12-legacy-vs-modern-angular.md` records the citation whose `CLI-CL:149` line the angular-cli clone carries. |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`apps/insurance-portal/project.json:18` `"polyfills": ["zone.js"]`" | config | verified | portal checkout apps/insurance-portal/project.json:18 - "polyfills": ["zone.js"] |
| "The app builds with `@angular/build:application` ... (`apps/insurance-portal/project.json:10,53`)" | config | verified | portal apps/insurance-portal/project.json:10 - "executor": "@angular/build:application" |
| "The app is zoneless (`NgZone` provider is `NoopNgZone`, `research/raw/zone-mode-portal.json`)" | status | verified | research/raw/zone-mode-portal.json - contains "NoopNgZone" and the Standalone root component |
| "`@angular/forms/signals` appears in 7 files" | status | verified | research/13-portal-legacy-audit.md:43 - corrected count; the portal at cc9ce25 has 7 files importing it, including apps/insurance-portal/src/app/app.config.ts:3 |
| "Karma or Jest config" (listed under Not found) | config | verified | no karma.conf* or jest.config* anywhere in the portal checkout outside node_modules |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the model is on-device, with a 7,168 (Aion) to 9,216 (Gemma 4, Nano, Phi-4-mini) token context window (2.1)" | config | verified | docs/feature-proposals.md:85 - "7,168 tokens on Aion and 9,216 on the Chrome models and Phi-4-mini" |
| "Angular's `Annotations` interface has the first three and not `debugging` (`types.ts:64-84`)" | config | verified | packages/core/src/webmcp/types.ts:64-84 - readOnlyHint, untrustedContentHint, consequentialHint and no debugging |
| "`declareExperimentalWebMcpTool` spreads `...tool` into the registered object (`declare_tool.ts:60-61`)" | feature | verified | packages/core/src/webmcp/declare_tool.ts:60-61 - the wrappedTool literal starts with `...tool` |
| "there is no `destructiveHint` or `idempotentHint`" | config | unverifiable | the WebMCP spec is not vendored here; would need `index.bs` at webmachinelearning/webmcp d0e4e0e; settling check: `git cat-file -p HEAD:research/14-ai-devtools-prior-art.md` records the citation to check against the WebMCP spec at that commit. |
| "139 rows in all" | status | unverifiable | the count came from `count.mjs` in a session scratchpad that is not in the repo; a recount over the judgement tables would settle it; settling check: no command in this checkout reaches it; the count's reproductions live in a session scratchpad outside this repository. |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "has a 7-9K-token window (2.1 of the proposals)" | config | verified | docs/feature-proposals.md:85 - 7,168 on Aion, 9,216 on the Chrome models and Phi-4-mini |
| "One component's signal graph on the portal's `/claim/create` (`ng-journal-create`): 107 nodes, 171 edges" | status | verified | research/raw/tosignal-node-portal.json - nodes array holds 107, edges array holds 171 |
| "strings at most 200 characters, arrays at most 20 with `total`" | config | verified | docs/feature-proposals.md:480 - results are flat objects, page strings capped at 200 characters, arrays with total |
| "`docs/filing-ledger.md` item 11" | status | verified | docs/filing-ledger.md:230 - item 11 records the LanguageDetector and Translator availability crash in a dedicated worker |
| "Terminated after 30 s without events or extension API calls, and when one event or API call takes over 5 minutes" | config | unverifiable | an external Chrome service-worker lifecycle page states this; no local file or fixture carries the limits; settling check: `git cat-file -p HEAD:research/15-deterministic-and-ai.md` records the external citation, and an idle-timer probe from the extension records the limits. |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client` `RenderMode.Client`" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - the three paths with those render modes |
| "Probes in `spikes/probes/ssr-*.js`" | structure | verified | ssr-defer.js, ssr-event-replay.js, ssr-hydration.js, ssr-render-modes.js, ssr-transfer.js |
| "output in `research/raw/ssr-*.json`" | structure | verified | the same five names as .json files exist under research/raw |
| "`provideClientHydration()` with no features" | config | verified | spikes/ng222-ssr/src/app/app.config.ts:14 - provideClientHydration() with no arguments |
| "a 64-hex-character hash, holding the transfer cache entry `{b, h, s, st, u, rt}`" | status | verified | research/raw/ssr-transfer.json - key e050c57f... (64 hex) with fields b,h,s,st,u,rt, u "/api/items", s 200 |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "all pinned exactly: `vitest` 5.0.3 ... `playwright` 1.63.0, `vitest-browser-angular` 0.5.1. Removed `jsdom`" | config | verified | spikes/ng222-app/package.json - vitest, @vitest/browser and @vitest/browser-playwright 5.0.3, playwright 1.63.0, vitest-browser-angular 0.5.1, no jsdom entry |
| "Runner: Angular's own `@angular/build:unit-test` builder ... `angular.json` `test`: options `runnerConfig: true`" | config | verified | spikes/ng222-app/angular.json:68,70 - builder @angular/build:unit-test and runnerConfig true |
| "from `VITEST_BROWSER_PORT` (default 51315)" | config | verified | spikes/ng222-app/vitest-base.config.mts:7 - Number(process.env['VITEST_BROWSER_PORT'] ?? 51315) |
| "Raw files: `research/raw/vitest-attach-gemma4.json` ... `vitest-attach-gemma4-newcontext.json`" | structure | verified | all three raw files exist, plus spikes/probes/vitest-attach.mjs and vitest-iframe-probe.js |
| "`ng test` (default `headless`) 2 passed, 2 skipped, exit 0" | status | unverifiable | a test run would settle it; this audit was barred from running test runners; settling check: `npx nx run angular-ai-devtools:test` records the pass and skip counts. |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Superseded in this program: the `ms*` switches alone are relied on and HKCU Edge policies are deliberately not used" | config | verified | research/18-edge-prevent-auto-signin.md:8 - corrected wording; .commandcode/skills/control-ai-browsers/SKILL.md:311-312 - HKCU Edge policies are deliberately not used, measured 2026-10-19 |
| "`msImplicitSignin`, `msProfileSignIn`, `msEdgeOSAccountInfoSubstrate`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:32 - all three names appear in the Edge --disable-features list |
| "`--disable-sync`" | command | verified | .commandcode/skills/control-ai-browsers/instances.json:31,50 - both Edge instances pass --disable-sync |
| "`--guest` or `--bwsi` (browse-without-sign-in)" | command | unverifiable | no repo script passes either switch; a manual Edge launch with it would settle it; settling check: `control.mjs flags` and a launch transcript record the switch effect. |
| "BrowserSignin is set to REG_DWORD 0 to disable browser sign-in entirely" | config | unverifiable | registry policy state is outside the repo; edge://policy after applying section 3 would settle it; settling check: `control.mjs flags` records the switches the driver passes, and `edge://policy` in a driven instance records the applied policy. |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw: `raw/19-languagemodel-contexts.json`" | structure | verified | research/raw/19-languagemodel-contexts.json exists when resolved against the doc's own directory |
| "Section 3.1 of `docs/feature-proposals.md` already places the session in the DevTools panel or side panel page" | structure | verified | docs/feature-proposals.md:309 - the session lives in the DevTools panel or side panel page, never the devtools_page |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | feature | verified | apps/angular-ai-devtools/src/app/extension-prompt.service.ts:37-38 - reads globalThis.LanguageModel |
| "recorded in plans/prompt-api-browser-pairs.afk.md" | structure | verified | plans/prompt-api-browser-pairs.afk.md exists in the repo |
| "`LanguageDetector` and `Translator` crash the renderer when called in a worker" | status | verified | docs/filing-ledger.md:230 - item 11 records that crash in a dedicated worker |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw results: `raw/20-built-in-ai-without-flags.json`" | structure | verified | research/raw/20-built-in-ai-without-flags.json exists with measuredAt, setup, results and workers keys |
| "`control-ai-browsers up <name> --no-ai-features`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2072,2074 - the option sets the feature list to empty |
| "which keeps only the Edge sign-in and sync switches" | feature | verified | control.mjs:2074 clears --enable-features while instances.json:31-34 keeps --disable-sync and the sign-in switches |
| "`docs/filing-ledger.md` item 11" | status | verified | docs/filing-ledger.md:230 - item 11 records the LanguageDetector and Translator worker crash |
| "the extension service worker cannot start one: `Worker` and `SharedWorker` are undefined" | feature | unverifiable | the doc cites the MDN Worker page; a probe from the extension service worker would settle it; settling check: `control.mjs doctor` drives the extension service worker, where a `typeof Worker` probe records it. |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "generated using [Angular CLI] version 22.2.2" | config | verified | spikes/ng222-app/package.json - devDependency @angular/cli is ^22.2.2 |
| "To execute unit tests with the Vitest test runner, use ... `ng test`" | command | verified | spikes/ng222-app/angular.json:68 - @angular/build:unit-test builder, vitest 5.0.3 pinned, 2 spec files tracked |
| "To start a local development server, run ... `ng serve`" | command | verified | spikes/ng222-app/angular.json:56 - the @angular/build:dev-server target exists |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "generated using [Angular CLI] version 22.2.2" | config | verified | spikes/ng222-ssr/package.json - devDependency @angular/cli is ^22.2.2 |
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`" | structure | verified | `git ls-files spikes/ng222-ssr` returns 0 files matching *.spec.ts |
| "To start a local development server, run ... `ng serve`" | command | verified | spikes/ng222-ssr/angular.json:89 - the @angular/build:dev-server target exists |

## Descriptive docs
- .commandcode/taste/taste.md
- docs/autonomy-gaps.md

## User rulings

| Queue # | Ruling | User's words | Planned |
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
| 99 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 100 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |


## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 350 | .claude/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | Settle it: `control.mjs call explain-navigation` against a 0.0.7 server records the default and maximum `limit` |
| 355 | .claude/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes" | unverifiable | fix-doc | Settle it: `control.mjs call` on the panel one-time-code flow records the code lifetime |
| 371 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "20 rows after a fresh API start" | unverifiable | fix-doc | Settle it: `control.mjs doctor --target portal` after a fresh API start, then the contract row count |
| 384 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | Settle it: `control.mjs call explain-navigation` against a 0.0.7 server records the default and maximum `limit` |
| 388 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP" | unverifiable | fix-doc | Settle it: `control.mjs snap` on the panel page records the eight tab names |
| 389 | .commandcode/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes" | unverifiable | fix-doc | Settle it: `control.mjs call` on the panel one-time-code flow records the code lifetime |
| 403 | .commandcode/skills/link-workspace-packages/SKILL.md | "Symlinks appear in `<consumer>/node_modules/@org/<package>`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that the workspace has no link entry, and the link command prints the symlink path |
| 407 | .commandcode/skills/monitor-ci/references/fix-flows.md | "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs` records whether apply-locally exists |
| 415 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the `nx-cloud` bin that `npx nx-cloud --help` then runs |
| 416 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe` records the output format |
| 422 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Byte-identical malformed downloads across retries support a persistent bad cache object" | unverifiable | fix-doc | No action here — no command in this checkout reaches it; the recorded failing run-group and its artifact live outside this repository |
| 423 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "The API cannot identify an upload path, writer, storage event, or service mutation" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe` lists the artifact route |
| 424 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe` lists the task-assets route |
| 427 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --describe cipes` lists the status filters |
| 428 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "the public API has no separate workflow routes" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api --list-operations` lists the routes |
| 436 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project" | unverifiable | fix-doc | Settle it: `node_modules/@nx/jest/package.json` records the plugin once installed; `git cat-file -p HEAD:package.json` shows it is not a dependency here |
| 440 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that @nx/next is not a dependency, so `node_modules/@nx/next/package.json` cannot be read here |
| 443 | .commandcode/skills/nx-import/references/VITE.md | "React Router 7 outputs to `build/` (not `dist/`)" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that no React Router project exists here |
| 474 | .claude/skills/control-ai-browsers/features/README.md | "four H2s in order: Sub-features, How to get to it (user POV), Driving it with control-ai-browsers, Gotchas" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.claude/skills/control-ai-browsers/features/README.md` shows the four H2s; a test asserting them would pin it |
| 476 | .claude/skills/control-ai-browsers/features/instances.md | "C up edge-dev-aion --backend=cpu exits 2 before anything starts" | unverifiable | fix-doc | Settle it: `control.mjs up --backend=cpu` on `edge-dev-aion` records the exit status before start |
| 478 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "anti-pattern findings render when two snapshots differ" | unverifiable | fix-doc | Settle it: `control.mjs panel --feature=signal-provenance` on two differing snapshots records the finding |
| 481 | .claude/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (devtools-tabs.component.ts); Transfer State only for a hydrated (SSR) app" | unverifiable | fix-doc | Settle it: `control.mjs doctor` prints the installed DevTools extension path whose `devtools-tabs.component.ts` settles it |
| 482 | .claude/skills/control-angular-devtools/features/attach.md | "Detection result: isAngular, isDebugMode (development build), isIvy, isSupportedAngularVersion (major 12+ or 0)" | unverifiable | fix-doc | Settle it: `control.mjs attach` against the counter fixture records the `detectAngular` payload fields |
| 483 | .claude/skills/control-angular-devtools/features/attach.md | "the content script still injects the backend (it gates on isAngularDevTools, isAngular and an HTML document, not on isDebugMode; built 1.22.0 app/content_script_bundle.js)" | unverifiable | fix-doc | Settle it: `control.mjs doctor` prints the installed extension path whose `content_script_bundle.js` settles it |
| 484 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected (measured): own subscribers bothOn a 16 b 16, afterRemoveA a 16 b 32; DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Settle it: `control.mjs coexist` on the counter harness records the subscriber counters and the cycle count |
| 485 | .claude/skills/control-angular-devtools/features/signal-graph.md | "Expected on the fixture before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | unverifiable | fix-doc | Settle it: `control.mjs coexist` on the counter fixture records the node labels before the action |
| 486 | .claude/skills/control-angular-devtools/features/signal-graph.md | "After angular:di_graph (measured 2026-10-11): pane signal:count, effect:Effect" | unverifiable | fix-doc | Settle it: `control.mjs coexist` records the pane labels after `angular:di_graph` |
| 487 | .claude/skills/control-angular-devtools/features/signal-graph.md | ".node-cont.kind-* are DevTools 1.22.0 class names; re-read them from the live panel after an update" | unverifiable | fix-doc | Settle it: `control.mjs doctor` prints the extension path whose `signals-visualizer.ts` records the class names |
| 488 | .claude/skills/control-pangular-inspector/SKILL.md | "With `--read-only`, 0.0.7 lists 46 tools" | unverifiable | fix-doc | Settle it: `control.mjs tools` against a `--read-only` 0.0.7 server counts the tools |
| 489 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids (`cgg06-4`) change with every page load; re-read the tree before using one" | unverifiable | fix-doc | Settle it: `control.mjs components` after two page loads records whether the instance ids change |
| 490 | .claude/skills/control-pangular-inspector/features/navigation.md | "`node $S call list-routes` (12 routes, measured)" | unverifiable | fix-doc | Settle it: `control.mjs call list-routes` against the portal counts the routes |
| 491 | .claude/skills/control-pangular-inspector/features/navigation.md | "one `info` finding, `missing-title`" | unverifiable | fix-doc | Settle it: `control.mjs call lint-routes` against the portal records the findings |
| 492 | .claude/skills/control-pangular-inspector/features/navigation.md | "The page keeps `limits.navigations` (50) entries" | unverifiable | fix-doc | Settle it: `control.mjs call` past 50 navigations records the retained `limits.navigations` entries |
| 493 | .claude/skills/control-pangular-inspector/features/panel.md | "the eight tab names, `LIVE`" (Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP) | unverifiable | fix-doc | Settle it: `control.mjs snap` on the panel page records the eight tab names |
| 494 | .claude/skills/control-pangular-inspector/features/panel.md | "icon only, accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | Settle it: `control.mjs snap` on the portal page records the toggle accessible name |
| 495 | .claude/skills/control-pangular-inspector/features/setup.md | "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | unverifiable | fix-doc | Settle it: `control.mjs install` in the portal checkout then `git diff --stat` records the lockfile insertions |
| 496 | .claude/skills/control-pangular-inspector/features/source-scan.md | "`build-meta` ... Angular `22.2.2`, ... TypeScript `6.0.3`, `ssr: false` (measured)" | unverifiable | fix-doc | Settle it: `control.mjs scan build-meta` on the portal checkout records the versions |
| 497 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" | unverifiable | fix-doc | Settle it: `control.mjs up` on the tester then `control.mjs doctor` records the test summary |
| 498 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "its evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.project/archive/001-run-unrun-spikes/` lists the archived notes of that run |
| 499 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "keyed `content_isolated\|frame\|/`, `content_main\|frame\|/`, `devtools_panel`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:research/raw/vitest-attach-<label>.json` records the keys the probe writes |
| 500 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "`ng.ɵgetInjectorProviders` throws on the null injector at the end of the resolution path" | unverifiable | fix-doc | Settle it: `control.mjs up` on the tester and the probe capture record the `ɵgetInjectorProviders` throw |
| 501 | .commandcode/pstack-models.md | "minimax/minimax-m3.1-flash:free" listed among free models | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/pstack-models.md` and the local `config.json` record which free models exist |
| 504 | .commandcode/skills/control-ai-browsers/features/interop.md | "the check exits 0 on `edge-dev-aion` with `nodes: 1`" | unverifiable | fix-doc | Settle it: `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs` plus a live `control.mjs panel --feature=interop` run record it |
| 506 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "Data comes from `http://localhost:3000/api/claims`" | unverifiable | fix-doc | Settle it: `control.mjs up --target portal` then a requests read records the API path |
| 507 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured (the facade drops claims whose contract or customer is missing)" | unverifiable | fix-doc | Settle it: `control.mjs doctor --target portal` after a fresh API start records the claim row count |
| 508 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Save sends `POST /api/complaints` (201)" | unverifiable | fix-doc | Settle it: `control.mjs up --target portal` then a requests read records the POST path |
| 509 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`customer-list` ... 30 rows" | unverifiable | fix-doc | Settle it: `control.mjs doctor --target portal` after a fresh API start records the customer row count |
| 510 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "then sends `PUT /api/contracts`" | unverifiable | fix-doc | Settle it: `control.mjs up --target portal` then a requests read records the PUT path |
| 511 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "The header link goes to `https://www.ng-journal.com`" | unverifiable | fix-doc | Settle it: `control.mjs up --target portal` then the snapshot records the header link |
| 512 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | unverifiable | fix-doc | Settle it: `node --test .commandcode/skills/control-angular-dev-app/scripts/ssr-check.test.mjs` and a live `control.mjs up --target ssr` run record the counters |
| 513 | .commandcode/skills/control-angular-devtools/features/attach.md | "backendInstalled true; backendReady at ~950 ms" | unverifiable | fix-doc | Settle it: `control.mjs attach` against the counter fixture records `backendInstalled` and the `backendReady` timing |
| 514 | .commandcode/skills/control-angular-devtools/features/install.md | "`doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | unverifiable | fix-doc | Settle it: `control.mjs doctor` records the installed extension version line |
| 515 | .commandcode/skills/control-angular-devtools/features/profiler.md | "own subscribers ... DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Settle it: `control.mjs coexist` on the harness records the counts |
| 516 | .commandcode/skills/control-angular-devtools/features/profiler.md | "`ng.setProfiler(null)` clears every subscriber, DevTools' included" | unverifiable | fix-doc | Settle it: `control.mjs coexist` records whether a `setProfiler(null)` clears the DevTools subscriber |
| 517 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`" | unverifiable | fix-doc | Settle it: `control.mjs coexist` records the pane labels after `angular:di_graph` |
| 518 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`list-routes` and `lint-routes` on the live route config" | unverifiable | fix-doc | Settle it: `control.mjs tools` on the 0.0.7 server records the tool list |
| 519 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`inspect-route`, the current URL, document title and active route tree" | unverifiable | fix-doc | Settle it: `control.mjs tools` records `inspect-route` and its payload |
| 520 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "A router link click has trigger `imperative`" | unverifiable | fix-doc | Settle it: `control.mjs call` records the nav-event trigger |
| 521 | .commandcode/skills/control-pangular-inspector/features/panel.md | "accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | Settle it: `control.mjs snap` on the portal page records the toggle accessible name |
| 522 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | unverifiable | fix-doc | Settle it: `control.mjs install` in the portal checkout records the lockfile insertion count |
| 523 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "`build-meta` ... -> Angular `22.2.2`, ... TypeScript `6.0.3`, `ssr: false` (measured)" | unverifiable | fix-doc | Settle it: `control.mjs scan build-meta` on the portal checkout records the versions |
| 524 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "`ng.getInjectorProviders` throws on the null injector" | unverifiable | fix-doc | Settle it: `control.mjs up` in the tester and the probe capture record the throw |
| 525 | .commandcode/skills/link-workspace-packages/SKILL.md | "`pnpm add @org/ui --workspace`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package-lock.json` records that this workspace is npm-only, so a pnpm monorepo checkout is the check |
| 526 | .commandcode/skills/monitor-ci/SKILL.md | "`--local-verify-attempts` \| 3" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs` records that no script counts the attempts |
| 527 | .commandcode/skills/monitor-ci/references/fix-flows.md | "regex: `/cipes/{id}`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/skills/monitor-ci/references/fix-flows.md` and `node_modules/nx/package.json` record where the route shape comes from |
| 528 | .commandcode/skills/nx-cloud-api/SKILL.md | "Every list response is wrapped, even a single page" | unverifiable | fix-doc | Settle it: `npx nx-cloud api cipes -o out.json` records the response envelope, run through the bin mapped in `node_modules/nx/package.json` |
| 529 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "`npx nx-cloud api task-stats -f dateAfter=2026-08-01 -f dateBefore=2026-08-07`" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the `nx-cloud` bin whose `npx nx-cloud api task-stats --help` lists the filters |
| 530 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "`--describe` shows them as `returns: file`" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api --describe` shows the return shape |
| 531 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "A non-empty gzip payload can contain a valid tar archive whose terminal-output entry is zero bytes" | unverifiable | fix-doc | No action here — no command in this checkout reaches it; the Nx Cloud task asset is a downloaded artifact outside this repository |
| 532 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "A terminal `remote-cache-hit` proves Nx replay worked for that task" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api tasks -o tasks.json` records the cache status |
| 533 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "record run and task IDs, `batchId`, project, target, configuration" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api --describe` records the task row fields |
| 534 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "If the API reports `cacheable: false`, Nx replay was not expected for that execution" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api tasks -o tasks.json` records a row carrying `cacheable` |
| 535 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "decrypt a copy with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud --help` lists `decrypt-artifact` |
| 536 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Record byte count and SHA-256" | unverifiable | fix-doc | No action here — no command in this checkout reaches it; the cache artifact is a downloaded binary outside this repository |
| 537 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "These assets are compressed binary payloads" | unverifiable | fix-doc | No action here — no command in this checkout reaches it; the log and report assets are downloaded artifacts outside this repository |
| 538 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "A downloaded asset proves only that it resolves now" | unverifiable | fix-doc | Settle it: `node_modules/nx/package.json` maps the bin whose `npx nx-cloud api` fetch records a 404 and then a later success |
| 539 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Treat user-provided decoded content as provided evidence" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` records that no skill script enforces it |
| 540 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query a 30-hour creation window to cover the maximum normal six-hour CI duration" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that the repo ships no CI workflow to time |
| 541 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Use a semaphore of at most five narrow detail requests" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` records that no skill script implements it |
| 543 | .commandcode/skills/nx-import/SKILL.md | "Import all projects first, then `pnpm install --no-frozen-lockfile`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package-lock.json` records the npm-only workspace that blocks a pnpm import run |
| 546 | .commandcode/skills/nx-import/references/ESLINT.md | "`typescript-eslint@7.x` declares `peerDependencies: { "eslint": ^8.56.0 }`" | unverifiable | fix-doc | Settle it: `node_modules/typescript-eslint/package.json` records the peer range once installed; `@nx/eslint` versions.js pins typescriptESLintVersion ^8.58.0 |
| 547 | .commandcode/skills/nx-import/references/GRADLE.md | "The `@nx/gradle` plugin expects those files at the workspace root" | unverifiable | fix-doc | Settle it: `node_modules/@nx/gradle/package.json` records the plugin once installed; `git cat-file -p HEAD:package.json` shows it is absent |
| 548 | .commandcode/skills/nx-import/references/GRADLE.md | "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that no Gradle import has run here |
| 549 | .commandcode/skills/nx-import/references/GRADLE.md | "Because the import lands in a subfolder, Gradle project references can break" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that no Gradle build exists here to run against |
| 550 | .commandcode/skills/nx-import/references/JEST.md | "`nx add @nx/jest` does NOT create `jest.preset.js`" | unverifiable | fix-doc | Settle it: `node_modules/@nx/jest/package.json` records the generator files once installed |
| 551 | .commandcode/skills/nx-import/references/JEST.md | "but Nx preset defaults to `jsdom`" | unverifiable | fix-doc | Settle it: `node_modules/@nx/jest/package.json` records the preset once installed; the repo has no jest config |
| 552 | .commandcode/skills/nx-import/references/JEST.md | "Nx rewrites `package.json` scripts during init" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records the hand-written test scripts |
| 553 | .commandcode/skills/nx-import/references/NEXT.md | "`next build` auto-generates `next-env.d.ts` at the project root" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that no Next.js project exists here |
| 554 | .commandcode/skills/nx-import/references/NEXT.md | "**Core**: `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@types/node`, `@nx/react`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that no react dependency exists here |
| 555 | .commandcode/skills/nx-import/references/NEXT.md | "Next.js detects missing `@types/react` during `next build` and tries to install it using `yarn add`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package-lock.json` records the single npm lockfile |
| 556 | .commandcode/skills/nx-import/references/NEXT.md | "Dest: CNW ts preset (Nx 23)" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/skills/nx-import/references/NEXT.md` records the destination preset only |
| 557 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Turborepo monorepos ship with internal workspace packages that share configuration" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that this is not a Turborepo workspace |
| 558 | .commandcode/skills/nx-import/references/TURBOREPO.md | "If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:tsconfig.json` records that neither root config exists here |
| 559 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Turborepo does not use path aliases, Nx relies on them" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:tsconfig.json` records that no `paths` alias is declared |
| 560 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that neither turbo dependency exists |
| 561 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName`" | unverifiable | fix-doc | Settle it: `node_modules/@nx/vite/package.json` records the plugin default once installed |
| 562 | .commandcode/skills/nx-import/references/VITE.md | "Ensure Vite projects include" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:tsconfig.json` records the types actually configured |
| 563 | .commandcode/skills/nx-import/references/VITE.md | "Shared Vite deps (both frameworks): `vite`, `vitest`, `jsdom`, `@types/node`, `typescript` (dev)" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records the shared Vite deps as installed |
| 564 | .commandcode/skills/nx-import/references/VITE.md | "TanStack Start uses Vinxi under the hood, which wraps Vite" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:package.json` records that no TanStack Start project exists here |
| 565 | .commandcode/skills/nx-plugins/SKILL.md | "Example: `npx nx add @nx/react`" | unverifiable | fix-doc | Settle it: `node_modules/@nx/react/package.json` records the plugin once installed; `git cat-file -p HEAD:package.json` shows it is absent |
| 566 | .commandcode/taste/angular/taste.md | "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/skills/control-angular-dev-app/features/portal-contracts.md` records the portal forms API; a portal clone settles the migration |
| 567 | .commandcode/taste/communication/taste.md | "`provideAiDevTools()` not `provideAiDevtools()`, `provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:.commandcode/taste/communication/taste.md` records the rule, and the companion package `package.json` will record the export |
| 570 | docs/afk-run-2026-10-12.md | "Vitest Browser work committed after re-running ng test (exit 0, 2 passed, 2 skipped)" | unverifiable | fix-doc | Settle it: `node --test .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs` plus `control.mjs doctor` after a tester run record the counts |
| 571 | docs/design/tutor.md | "A tab in the extension's DevTools panel ("Angular AI", 3.1), next to the chat" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 572 | docs/design/tutor.md | "All tutor state is in `chrome.storage.local`, written by the panel" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 573 | docs/design/tutor.md | "`ai_tutor` tool ... tool in source at `ai-tutor.ts:14`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:research/02-angular-surface.md` records the citation; the installed CLI ships `ai-tutor.js`, not a `.ts` file |
| 574 | docs/design/tutor.md | "`chrome.devtools.panels.elements.onSelectionChanged` gives the selected element for `locate` exercises" | unverifiable | fix-doc | Settle it: `control.mjs panel` on a built panel records whether it calls `onSelectionChanged` |
| 575 | docs/filing-ledger.md | "Versions: `@angular/core` 22.2.2" | unverifiable | fix-doc | Settle it: `node_modules/@angular/core/package.json` records the installed version |
| 576 | docs/filing-ledger.md | "`packages/core/src/debug/ai/di_graph.ts`" | unverifiable | fix-doc | Settle it: `node_modules/@angular/core/package.json` records that only fesm2022 bundles ship |
| 577 | docs/filing-ledger.md | "`result.tools has 46 entries and no list-components`" | unverifiable | fix-doc | Settle it: `control.mjs call tools/list` against 0.0.7 records the 46 entries and the absent `list-components` |
| 578 | docs/filing-ledger.md | "Status: draft, not filed." | unverifiable | fix-doc | No action here — no command in this checkout reaches it; the upstream tracker's citations settle whether the issue was opened |
| 579 | plans/angular-ai-devtools-proposals.handoff.md | "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 580 | plans/angular-ai-devtools-proposals.handoff.md | "The companion package exports `provideAiDevTools()`, `provideAiNgrxDevTools()`" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 581 | plans/gsd-path-handoff-M018.md | "branch \| `gsd-path/M018` (bound; `gsd-path/M017` retired locally and on origin)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 582 | plans/gsd-path-handoff-M018.md | "Frozen inventory: **143 documents**" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:plans/gsd-path-handoff-M018.md` records the dated 143, and `node --test scripts/docs-audit-disposition.test.mjs` prints the current inventory |
| 583 | references/ai-browsers-verification.md | "Check that port 9992 is free." | unverifiable | fix-doc | Settle it: `control.mjs doctor` on the browser instance records which ports are held |
| 584 | references/edge-dev-aion-model.md | "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | unverifiable | fix-doc | No action here — no command in this checkout reaches it; the model pin artifact lives in the browser profile outside this repository |
| 585 | references/edge-dev-aion-model.md | "A profile that starts under `--disable-component-update` never receives one." | unverifiable | fix-doc | Settle it: `control.mjs doctor` on a fresh Edge Dev profile records the component update state |
| 588 | research/04-ecosystem.md | "install a shim `window.__REDUX_DEVTOOLS_EXTENSION__` at document_start ... world MAIN" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:extension/manifest.json` records `run_at`, and a timing probe records whether the shim precedes the Store factory |
| 590 | research/10-model-capabilities.md | "Chromium `runtime_enabled_features.json5` at tag `156.0.8078.17`, lines 485-500" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:research/10-model-capabilities.md` records the citation to check against the Chromium tag-156 tree |
| 591 | research/12-legacy-vs-modern-angular.md | "`spikes/ng222-app/dist/ng222-app/browser/main.js` ... (unminified, 968 `ngDevMode` references)" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:spikes/ng222-app/project.json` records the build target, and a dev build then a count over `main.js` records the ngDevMode references |
| 592 | research/12-legacy-vs-modern-angular.md | "the 22.0.0 section starts at `CLI-CL:149`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:research/12-legacy-vs-modern-angular.md` records the citation whose `CLI-CL:149` line the angular-cli clone carries |
| 594 | research/14-ai-devtools-prior-art.md | "there is no `destructiveHint` or `idempotentHint`" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:research/14-ai-devtools-prior-art.md` records the citation to check against the WebMCP spec at that commit |
| 595 | research/14-ai-devtools-prior-art.md | "139 rows in all" | unverifiable | fix-doc | No action here — no command in this checkout reaches it; the count's reproductions live in a session scratchpad outside this repository |
| 596 | research/15-deterministic-and-ai.md | "Terminated after 30 s without events or extension API calls, and when one event or API call takes over 5 minutes" | unverifiable | fix-doc | Settle it: `git cat-file -p HEAD:research/15-deterministic-and-ai.md` records the external citation, and an idle-timer probe from the extension records the limits |
| 597 | research/17-vitest-browser-runtime.md | "`ng test` (default `headless`) 2 passed, 2 skipped, exit 0" | unverifiable | fix-doc | Settle it: `npx nx run angular-ai-devtools:test` records the pass and skip counts |
| 599 | research/18-edge-prevent-auto-signin.md | "`--guest` or `--bwsi` (browse-without-sign-in)" | unverifiable | fix-doc | Settle it: `control.mjs flags` and a launch transcript record the switch effect |
| 600 | research/18-edge-prevent-auto-signin.md | "BrowserSignin is set to REG_DWORD 0 to disable browser sign-in entirely" | unverifiable | fix-doc | Settle it: `control.mjs flags` records the switches the driver passes, and `edge://policy` in a driven instance records the applied policy |
| 601 | research/20-built-in-ai-without-flags.md | "the extension service worker cannot start one: `Worker` and `SharedWorker` are undefined" | unverifiable | fix-doc | Settle it: `control.mjs doctor` drives the extension service worker, where a `typeof Worker` probe records it |
