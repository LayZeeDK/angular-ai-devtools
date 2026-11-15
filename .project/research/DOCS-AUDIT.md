# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-15
Audited HEAD: 02bba9d28a55e4a639aeac2a17ab36660fbdad4f
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 639 |
| stale | 25 |
| aspirational | 4 |
| unverifiable | 146 |
| descriptive docs (no testable claims) | 1 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "9600 + 10 * slot + index" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:577 - portAt() returns 9600 + 10 * slot + index for every slot above 0 |
| "`edge-dev-aion` ... 9335 ... `Aion-1.1-Instruct` ... 7,168" | config | verified | .claude/skills/control-ai-browsers/instances.json:135,162,166 - port 9335, model name Aion-1.1-Instruct, contextWindow 7168 |
| "`[WARN]` under the browser minimum (Chrome 22 GB, Edge 20 GB)" | config | verified | .claude/skills/control-ai-browsers/instances.json:16,41 - chrome-beta/chrome-stable minFreeMib 22528, edge-dev/edge-stable minFreeMib 20480 |
| "`scripts/fingerprint.mjs` (a byte copy of lars-create-verification's; never edit it here)" | structure | verified | ~/.commandcode/skills/lars-create-verification/scripts/fingerprint.mjs - SHA256 3e677a231468fc4f... identical to the skill's copy |
| "The playwright-cli session is `ai-<instance>-<port>`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:712 - the session builder returns ai-, name and port joined by dashes |
| "canary.tools ... the answer names 42" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1947 - the canary passes on a 42 or forty-two answer, and :1919 registers get_component_count returning 42 |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4 - usage comment names the same invocation; the .claude copy carries the same SHA256 |
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .claude/skills/control-ai-browsers/instances.json:70,101,135,173,201 - the five registry entries carry those port values |
| "Page code runs in a tab the script opens on `https://example.org/?ai-browsers=<purpose>`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1727 - appends ai-browsers=<purpose>; :175 sets PROBE_ORIGIN to https://example.org/ |
| "`--evidence=tmp/control-ai-browsers/evidence/<run-id>`" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:216-219 - evidenceDir defaults to join(TMP, 'evidence', runId), TMP set at :156 |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | apps/angular-ai-devtools/project.json:52 - a build-extension target exists, and instances.json:73 loads "extension" |
| "Chrome Beta 157 ... Chrome stable 156, Edge Dev 157 and Edge stable 155 are installed at the paths in `instances.json`" | config | verified | .claude/skills/control-ai-browsers/instances.json:9,19,29,48 - the four browser exe paths |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` ... and receives `angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:31 - queryDi(componentName, elementTag); :25 listens for angular-ai:di-graph and stores the resolutionPath |
| "a path view and a diff view" | feature | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts:34 - diffDiPaths() returns a DiffResult carrying componentNameA and componentNameB |
| "The path list is empty until a component is selected and a graph arrives" | feature | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:9-10 - availablePaths starts as an empty signal and selectedPath as null |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | verified | apps/angular-ai-devtools/project.json:52 - the build-extension target; extension/panel/index.html:6 - base href is /panel/ |
| "prints the URL (`http://localhost:4222/` in the main checkout)" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:170 - the bench app port is 4222, hard-coded because bench.js cannot derive it |
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:2,6 - imports DiDoctorService and diffDiPaths from exactly those modules |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "maps each to its owning component through `ng.getOwningComponent`" | feature | verified | src/main-world/error-capture.ts:42 - calls ng.getOwningComponent when the page exposes it |
| "captures `NG0xxx` and uncaught console errors" | feature | verified | src/main-world/error-capture.ts:35 - extracts the code with the pattern `/NG0\d{3,}/` from a thrown or uncaught error, per the header comment at :3 |
| "message type `angular-ai:error-capture` only" | integration | verified | grep over apps/angular-ai-devtools/src, src/main-world, src/panel and extension finds 4 occurrences of angular-ai:error-capture and 0 of angular-ai:error-explain |
| "The explain step runs in the panel (`src/panel/error-explainer-view.ts` calls `shouldCallModel`)" | structure | verified | src/panel/error-explainer-view.ts:98 - defines shouldCallModel, which error-explainer.component.ts:60 imports and calls |
| "An error code with no digest entry yields an explicit no-digest-entry answer" | feature | verified | src/main-world/error-digest.ts:12 - NO_DIGEST_ENTRY is the string no digest entry, set into the answer at error-explainer.component.ts:61 |
| "With zero captured errors the panel renders an explicit empty state" | feature | verified | src/panel/error-explainer-view.ts:102-103 - emptyStateText() returns the EMPTY_STATE constant |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the built panel is `main.js`, `styles.css` and `index.html`, whose base href is `/panel/`" | config | verified | extension/panel/index.html:6 - base href is /panel/; extension/panel also holds main.js and styles.css |
| "`up` starts `node scripts/pipe-keeper.mjs`, which launches the browser with `--remote-debugging-pipe --enable-unsafe-extension-debugging`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:160 - KEEPER is scripts/pipe-keeper.mjs; pipe-keeper.mjs:113 - loads the extension with Extensions.loadUnpacked over that pipe |
| "DevTools 157 keys extension panels as `extension-panel-` plus a uuid and an index" | feature | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:56,62 - the comment states that key shape and the finder takes the client object key starting with extension-panel- |
| "the folder comes from the state file (`extensionDir`) and the id from its path" | integration | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:759,772 - extensionDir is resolved from the registry entry and recorded in the state |
| "Angular detection still comes from the content scripts (`relay.js`, `agent-main.js`)" | feature | verified | extension/manifest.json:25,34 - the content_scripts entries list relay.js and agent-main.js |
| "`Extensions.loadUnpacked` answers only over `--remote-debugging-pipe`" | feature | unverifiable | the only repository evidence is the comment at .claude/skills/control-ai-browsers/scripts/pipe-keeper.mjs:3-5; a Chromium source pointer or a measured load without the pipe would settle it |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines" | status | verified | .claude/skills/control-ai-browsers/scripts/control.mjs - all nineteen ids occur in the source: map-fresh, process, tree, commandLine, ports, tabs, model.disk, model.pin, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp, account, extension |
| "`Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok`" | config | verified | extension/manifest.json:3-4 - name Angular AI DevTools, version 0.3.0; the same id is named at control.mjs:907 |
| "`backend` reads `requested gpu`, `GPU (fastest inference)`, row `gemma4_gpu_low_tier_model`" | status | verified | .project/archive/012-n25-rxjs-interop-explainer/plan/evidence/T007/chrome-beta-gemma4-doctor-1793410999525.json - the recorded doctor run carries that model row |
| "Nano: `canary.tools` is `[SKIP]`" | feature | verified | .claude/skills/control-ai-browsers/instances.json:95 - chrome-beta-nano toolCanary is false, and control.mjs:1912 skips the tool canary when it is falsy |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1953 - webmcp passes only when typeof document.modelContext is object; :1886 records both types |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its own profile under `.browsers\<name>`" | config | verified | .claude/skills/control-ai-browsers/instances.json:2 - profilesRoot is .browsers, resolved into PROFILES at control.mjs:157 |
| "Every checkout of the repository, a worktree or a GSD Path sidecar included, uses these profiles" | structure | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:155-157 - ARTIFACT_ROOT is the primary checkout .commandcode/worktrees and PROFILES resolves profilesRoot against it |
| "`[OK]` with the nine Aion features" | config | verified | .claude/skills/control-ai-browsers/instances.json:138-146 - the edge-dev-aion features array holds nine entries |
| "`C up edge-dev-aion --backend=cpu` exits 2 before anything starts" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:792 - refuses --backend=cpu on an Edge instance because forcing CPU deletes the installed model |
| "`edge-dev-aion` has `--disable-component-update`" | config | verified | .claude/skills/control-ai-browsers/instances.json:149 - the args array of the edge-dev-aion entry |
| "One line per instance (five)" | status | verified | .claude/skills/control-ai-browsers/instances.json:70,101,135,173,201 - five registry entries with ports 9333, 9334, 9335, 9337 and 9338 |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node), `interop-limit` (the cannot-name statement), `interop-inferred` (the attribution wording)" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:27-35 - the template carries exactly those four data-testid attributes |
| "it cannot name the feeding Observable, the operator chain or emission timing" | feature | verified | apps/angular-ai-devtools/src/app/interop-slice.node.test.ts:31-33 - asserts INTEROP_LIMITATION matches Observable, operator and emission |
| "Field-to-node attribution is worded `inferred, untested`" | feature | verified | apps/angular-ai-devtools/src/app/interop-attribution.node.test.ts:11 - asserts the wording equals inferred, untested |
| "pass `--extension` the absolute path of the checkout the instance runs" | command | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:67,87-90 - the flag defaults to CHECKOUT_EXTENSION and a mismatch names the --extension remedy |
| "the `spikes/ng222-app` fixture at `/stale-view`, or the deferred `/stale-view-deferred` route" | feature | verified | spikes/ng222-app/src/app/app.routes.ts:19-20 - both routes are declared |
| "Measured result: the check exits 0 on `edge-dev-aion` with `nodes: 1`; verdict `verified` (2/2); evidence `.project/build/verify/interop/`." | status | stale | .project/build/verify/interop does not exist at the base revision; the same run is archived at .project/archive/014-interop-proof/build/verify/interop/interop.json, which records nodes: 1 |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The model folders in the profile: `OptGuideOnDeviceModel` for Nano and `OptGuideManifestModel` for Gemma 4, `EdgeLLMOnDeviceModel` for Aion and Phi-4-mini" | config | verified | .claude/skills/control-ai-browsers/instances.json:91,125,163,191 - the model.folders values of the four model entries |
| "free space minus the model downloadMib must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .claude/skills/control-ai-browsers/instances.json:16,41 - minFreeMib is 22528 for both Chrome browsers and 20480 for both Edge ones; downloadMib at :96,130,168 |
| "`model clear` needs `--confirm` naming the model, e.g. `--confirm=v3Nano`" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:4004 - refuses without a string confirm and names the exact flag example |
| "the JSON holds `bytesRemoved`" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:4057 - bytesRemoved sums the deleted folders bytes into the clear result |
| "the folder `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion` of the primary checkout (1.3 GB, git-ignored)" | structure | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1313-1317 - the pin folder is TMP/pins/name and TMP is .commandcode/worktrees/tmp/control-ai-browsers at :156 |
| "copies a healthy instance model components (registry `pin` roots)" | config | verified | .claude/skills/control-ai-browsers/instances.json:151-154 - edge-dev-aion pin lists EdgeLLMOnDeviceModel, EdgeLLMRuntime and EdgeOptimizationGuideModelsManifest |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`result.q1.answer` names 42 and `result.log` lists `get_component_count` and `get_component_inputs`" | feature | verified | spikes/probes/probe10.js:7-8 - the two tools return count 42 and the inputs; :53 stores the count question in q1 |
| "`bench.js` has a 120 s per-prompt timeout" | config | verified | spikes/probes/bench.js:11 - PROMPT_TIMEOUT_MS = 120000 |
| "`bench.js` hard-codes the port" | config | verified | spikes/probes/bench.js:4 - page.goto to the counter fixture on http://localhost:4222/ |
| "in a worktree `control-angular-dev-app` derives another port and refuses 4222, so `bench` runs from the main checkout only" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:4105 - the bench refusal text states exactly that |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer" | integration | verified | extension/agent-main.js:12 - RECORD_EVENT is NS plus :record, and the file header at :5 names the ng getSignalGraph snapshot |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:269 - the branch matches msg.type angular-ai:record with a cycle |
| "The chain lists producer/consumer/self steps with kind, label and position" | feature | verified | src/main-world/provenance-tracer.ts:8-17 - SignalGraphNode carries id, kind, label, producers and consumers |
| "anti-pattern findings render when two snapshots differ" | feature | verified | apps/angular-ai-devtools/src/app/anti-pattern-detector.ts:1 - a reactive anti-pattern detector for N2, seeded per pattern in anti-pattern-detector.spec.ts:8 |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends the hedged wording `the template may show a stale value`" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:26 - renders that exact string in the finding row |
| "The scan runs through `StaleViewScanService` (which loads `extension/stale-view-worker.js`)" | feature | verified | apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:32-33 - the worker URL is built from the string stale-view-worker.js |
| "no runtime message type ... `angular-ai:stale-view` does not exist" | integration | verified | grep over apps/angular-ai-devtools/src, src/main-world, src/panel and extension finds 0 occurrences of angular-ai:stale-view |
| "With zero findings the panel renders an explicit empty state (`no stale-view findings`)" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 - the empty-state paragraph carries that text and a data-testid |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "control.mjs:69 keeps it at 3000 because the portal checkout hardcodes http://localhost:3000/api/" | config | stale | .claude/skills/control-angular-dev-app/scripts/control.mjs:84 — `const PORTAL_API_PORT = 3000;` is declared on line 84, not 69, and at base revision 02bba9d too; line 69 carries no port assignment |
| "counter app derived 4222, SSR app derived 4223, portal app derived 4200 (4300/4400/4500 + slot)" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:104,146,168 — `slot === 0 ? 4222 : 4300 + slot`, `4223 : 4400 + slot`, `4200 : 4500 + slot` |
| "--timeout <seconds> (default 240)" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:1487 — `timeoutMsOf(argv, 240)` |
| "ssr-check.js ... plus six named checks and ok" | command | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:116-143 — the six names server-html-ngh, server-html-transfer-state, dev-build-after-hydration, hydration-counters, no-mismatch-on-default-route, expected-mismatch-detected; :159 `ok: checks.every((c) => c.status === 'pass')` |
| "Every other script has a node:test file beside it (*.test.mjs); npm test at the repository root runs them" | command | verified | package.json scripts.test — runs `node --experimental-strip-types --test "scripts/**/*.test.mjs"` and then `npm run test:skills`, which globs `.claude/skills/**/*.test.mjs`; control.test.mjs, fingerprint.test.mjs, ng-inspect.test.mjs and ssr-check.test.mjs sit beside their scripts |
| "portal pangular, external, 9999, the portal proxies /__pangular to it" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:1087-1088 — comment "The portal proxies /__pangular to this port (proxy.conf.json)" with `const PANGULAR_PORT = 9999;` |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter: fresh page state, count 3, double 6, cart 1 item" | status | verified | spikes/ng222-app/src/app/counter.ts:17-19 — `signal(3)`, `computed(() => this.count() * 2)`, `inject(CartService)` whose `items` is seeded `['apple']` at counter.ts:5 |
| "SSR: heading Render mode: server, Early clicks: 0, list Alpha, Beta, Gamma, @defer block dehydrated" | status | verified | spikes/ng222-ssr/src/app/page.ts:10-15 — `Render mode: {{ mode() }}`, `Early clicks: {{ clicks() }}`, `@defer (hydrate on interaction)`; spikes/ng222-ssr/src/server.ts:16-24 — /api/items returns Alpha, Beta, Gamma |
| "API on 3000, app on the derived port" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:84 — `const PORTAL_API_PORT = 3000;`; :168 — portal app `slot === 0 ? 4200 : 4500 + slot` |
| "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json decides whether a sidebar entry and its route exist" | structure | stale | the path does not resolve: `apps/` contains only `angular-ai-devtools` and `angular-ai-devtools-e2e`, and .claude/skills/control-angular-dev-app/features/.proven.json records all four portal features as external because the portal checkout lives outside this repository |
| "__ngc.navigate(url) is a setup shortcut" | command | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:379-388 — `async navigate(url)` resolves the router and calls `ng.ɵnavigateByUrl(r, url)` |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The ng222-app page shows one line, Clicks: 3 (double 6, cart 1), and an Increment button" | status | verified | spikes/ng222-app/src/app/app.ts:8 — `<app-counter title="Clicks" />`; spikes/ng222-app/src/app/counter.ts:10-12 — template `{{ title() }}: {{ count() }} (double {{ double() }}, cart {{ cart.items().length }})` plus the Increment button, with `count = signal(3)` at :17 |
| "Behind it sit a title input, a count signal, a double computed, an injected CartService.items signal and an effect that copies count into lastLogged" | feature | verified | spikes/ng222-app/src/app/counter.ts:16-23 — `input('Counter')`, `signal(3)`, `computed(... * 2)`, `inject(CartService)`, `effect(() => this.lastLogged.set(this.count()))` |
| "counter-cd the component is OnPush by default (no changeDetection declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:8-14 — the @Component decorator declares only `selector` and `template`, no changeDetection |
| "the fixture's two other routes, /stale-view and /stale-view-deferred, belong to the stale-view fixtures (src/app/app.routes.ts:5-8)" | structure | stale | spikes/ng222-app/src/app/app.routes.ts:5-8 are five `import` statements; the two routes are declared at :19-20 and the file declares 20 routes, not two |
| "After one click: count 4, double 8" | feature | verified | spikes/ng222-app/src/app/counter.ts:12 — click handler `count.set(count() + 1)`; :17-18 — a seeded 3 becomes 4 and `double = count * 2` becomes 8 |
| "__ngc.signals and dependenciesOf('app-counter', 'double') returns dependsOn: [count]" | command | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:251 — `signals(selector)`; :277 — `dependenciesOf(selector, signalLabel)` returning the direct producers of one label |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/claims" | integration | unverifiable | the claims service lives in the portal checkout outside this repository (.claude/skills/control-angular-dev-app/features/.proven.json records portal-claims as external); only the origin is pinned here, .claude/skills/control-angular-dev-app/scripts/control.mjs:84 `PORTAL_API_PORT = 3000` — reading the portal's claims service would settle the /api/claims path |
| "claim-list table ... 5 rows measured (the facade drops claims whose contract or customer is missing)" | status | unverifiable | no portal source or recorded row count exists in this repository; research/05-spikes.md:62 sizes `/claim/list` only by structure (7 components, 5 OnPush, 142 signal nodes, max 38 per component) |
| "claim-details row click opens /claim/<id>/details, heading Claim Details" | feature | unverifiable | the portal's claim components are outside this repository; research/05-spikes.md:62 records `/claim/list` as a spike probe route, not the details heading |
| "/claim/create shows the heading Complaint Create: an app bug, measured; report it, do not patch it in the map" | status | unverifiable | a search of every research note for "Complaint Create" returns no hit and the portal checkout cannot be read here, so neither the heading nor the bug is on record in this repository |
| "Signals: eval __ngc.signals('ng-journal-list').edges.filter(...) returns template:ng-journal-list -> computed:claims" | command | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:251 — `signals(selector)` returns the host's signal graph including its edges, so the eval the doc prescribes exists |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/customers" | integration | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:192 — portal API readiness probes `readyPath: '/api/customers'`, and :84 pins the API to 3000, so the endpoint and origin the doc names are live on the portal API |
| "Data comes from http://localhost:3000/api/complaints" | integration | unverifiable | the portal checkout is outside this repository (.claude/skills/control-angular-dev-app/features/.proven.json records portal-complaints-customers as external); only the origin is pinned (control.mjs:84) — the portal's complaint service would settle the path |
| "The customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | status | verified | research/05-spikes.md:64 — `/customer/list` row: 192 signal nodes, max 80 per component, the highest per-component figure in the table (34, 60, 38, 38, 80) |
| "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | structure | unverifiable | no portal source in this repository; research/05-spikes.md:64 records only `/customer/list` sizes (7 components, 118 inputs, 49 element providers), no column list or row count |
| "complaint-create ... Save sends POST /api/complaints (201), shows a success toast and opens the new complaint's details" | feature | unverifiable | the portal's complaint form and the API's status code are outside this repository; a recorded `requests` capture would settle it |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at http://localhost:3000/api/contracts" | integration | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:83-84 — "the portal frontend's BaseUrl token hardcodes http://localhost:3000/api/" with `const PORTAL_API_PORT = 3000;`, so the origin in the doc is the pinned one |
| "contract-list table ... 20 rows after a fresh API start" | status | unverifiable | no recorded row count exists here; research/05-spikes.md:61 sizes `/contract/list` by structure only (47 components, 9 unique classes, 892 signal nodes, max 60 per component) |
| "contract-edit ... Save is disabled until a field changes, then sends PUT /api/contracts and returns to details with the new value" | feature | unverifiable | the portal's contract edit component and the PUT are outside this repository (.proven.json records portal-contracts as external); a recorded `requests` capture showing the PUT would settle it |
| "eval __ngc.components() on details lists DetailsComponent, ContractStatusChipComponent, HyperlinkComponent" | command | unverifiable | the class names are portal source outside this repository; research/05-spikes.md:61 counts 9 unique classes on `/contract/list` without naming them |
| "New contracts get a short numeric id (/contract/10846/details), seeded ones a UUID" | status | unverifiable | the API's id generation lives in the portal checkout; nothing in this repository records the id shapes |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "goto reloads the app and drops __ngc unless it was installed by doctor or run-code (the init script re-installs it on every load in the same session)" | command | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:2 — "Installs window.__ngc ... on this page and on every later load"; :395-396 — `page.addInitScript(install)` then `page.evaluate(install)` |
| "/ redirects to /home, which shows four tiles linking to the domain lists" | feature | unverifiable | the portal routing is outside this repository (.claude/skills/control-angular-dev-app/features/.proven.json records portal-navigation as external); research/05-spikes.md:60 lists `/home` only as a spike probe route |
| "Domain routes load lazily, guarded by feature flags" | feature | unverifiable | the manifest the sibling README names, apps/insurance-portal/src/assets/feature-flags.manifest.json, does not exist in this repository (`apps/` holds only angular-ai-devtools and angular-ai-devtools-e2e), and the portal checkout is external |
| "Only the sidebar group headings render upper-case (CONTRACT, through the capitalize pipe, which calls toUpperCase)" | feature | unverifiable | the sidebar component and its pipe live in the portal checkout; no record of the pipe exists in this repository |
| "The header link goes to https://www.ng-journal.com" | feature | unverifiable | the header template is portal source outside this repository; a snapshot of the shell would settle it |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a list of three items fetched from /api/items during the server render" | integration | verified | spikes/ng222-ssr/src/server.ts:16-24 — `app.get('/api/items')` logs `[api] GET /api/items ... ua=` and returns Alpha, Beta, Gamma |
| "ssr-hydration hydration completes in dev mode: ngDevMode.hydratedComponents 4, hydratedNodes 40" | status | verified | research/16-ssr-runtime.md:48 — counter table over hydratedNodes/hydratedComponents; :54 — `hydratedComponents` went from 4 to 5; :76 — `hydratedNodes` drops from 40 to 32 |
| "ssr-mismatch ?mismatch=1 marks app-mismatch as mismatched ... and logs NG0500 (expected failure)" | feature | verified | research/16-ssr-runtime.md:71 — one console error `ERROR RuntimeError: NG0500: During hydration Angular expected ...`; :76 — the mismatch case drops hydratedNodes from 40 to 32 |
| "ssr-render-modes the route modes: / is Server, /prerender is Prerender, /client is Client" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 — `{ path: '', renderMode: RenderMode.Server }`, `prerender` -> `RenderMode.Prerender`, `client` -> `RenderMode.Client` |
| "ssr-defer the @defer block is dehydrated until its button is clicked, then hydrated" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15-18 — `@defer (hydrate on interaction)` around `<app-deferred />` with a `Deferred placeholder` fallback |
| "server-html-ngh, server-html-transfer-state, dev-build-after-hydration, hydration-counters, no-mismatch-on-default-route and expected-mismatch-detected are the six checks ssr-check.js runs" | command | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:116-143 — the six check names in that order, with `ok: checks.every(...)` at :159 |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Supported browsers: chrome, chrome-beta, edge, edge-dev" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:158 — `const BROWSER_VALUES = ['test', 'chrome', 'chrome-beta', 'edge', 'edge-dev'];` |
| "the extension ID ienfalfjdbdpebioblfackkekamfmbnh, and the panel id chrome-extension://<id>Angular because the panel title is Angular" | config | verified | control.mjs:107-108 — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';` and ``const PANEL_ID = `chrome-extension://${EXT_ID}Angular`;`` |
| "Test harness ... session ngdt, CDP port 9420" | config | verified | control.mjs:328 — `const MAIN_CDP_PORT = 9420;` with the slot comment at :329; :376 — `const SESSION = flowId === 'main' ? 'ngdt' : `ngdt-${flowId}`;` |
| "Playwright's bundled Chromium (Chrome for Testing 156.0.8078.4, revision 1248, read from node_modules/playwright-core/browsers.json)" | config | verified | node_modules/playwright-core/browsers.json — chromium entry revision 1248, browserVersion 156.0.8078.4 (chromium-headless-shell shares both) |
| "scripts/proctree.mjs ... processTable, snapshot, merge, stop, matches, describe" | structure | verified | .claude/skills/control-angular-devtools/scripts/proctree.mjs:73 `export function matches`, :87 `describe`, :198 `processTable`, :298 `snapshot`, :336 `merge`, :438 `stop` |
| "panel show \| signal-graph [--component C] \| screenshot [--file F]" | command | verified | control.mjs:2227 — usage line `panel show \| signal-graph [--component app-counter] \| screenshot [--file f.png]`; the `signal-graph` branch at :1911 |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at spikes/ng222-app (Angular 22.2.2)" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json — installed version 22.2.2 in the fixture |
| "App page: playwright-cli session ngdt" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:376 — `const SESSION = flowId === 'main' ? 'ngdt' : ...` |
| "Desktop session available (the harness is headed)" | config | verified | control.mjs:1621 — the playwright-cli config the script writes sets `headless: false` |
| "Evidence stays in tmp/control-angular-devtools/evidence/ (git-ignored)" | structure | verified | .gitignore:7 — `tmp/control-angular-devtools/`; control.mjs:2082 and :2126 write `signal-graph-before.png` and `signal-graph-after-di-graph.png` under the run's evidenceDir |
| "Router Tree shows only when the app provides the router (devtools-tabs.component.ts); Transfer State only for a hydrated (SSR) app" | feature | unverifiable | devtools-tabs.component.ts is Angular DevTools frontend source, not in this repository (no shell-browser or extension source tree here); only the harness's panel driver at control.mjs:1137-1150 is available |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1226 — the probe defines an accessor for `window.__NG_DEVTOOLS_CONNECTED__`; :1240 — `flag: window.__NG_DEVTOOLS_CONNECTED__ === true` |
| "Detection result: isAngular, isDebugMode (development build), isIvy, isSupportedAngularVersion (major 12+ or 0)" | feature | unverifiable | the script only forwards the detectAngular payload and names `isAngular`, `isDebugMode` and `isAngularDevTools` (control.mjs:86, :1229); the extension source that emits `isIvy` and `isSupportedAngularVersion` is not in this repository |
| "attach exits 1 because it requires isDebugMode" | status | verified | control.mjs:1873 — the pass condition gates on `d.isDebugMode &&`, so a production build fails the check |
| "Angular 22.2.2" (expected marker) | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json — the counter fixture has @angular/core 22.2.2, the version the doc reports |
| "the content script still injects the backend (it gates on isAngularDevTools, isAngular and an HTML document, not on isDebugMode; built 1.22.0 app/content_script_bundle.js)" | feature | unverifiable | the Angular DevTools content-script bundle is not in this repository (no extension source tree); the harness only observes the `angular-devtools-content-script-<url>` messages it emits |
| "The toolbar icon and popup are browser UI, not checked by script" | feature | unverifiable | nothing in the harness reads the toolbar or popup; control.mjs records only page messages and the `chrome.developerPrivate` extension info |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:107 — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';` |
| "test install copies the copy from Edge Dev (read only), --from picks another source" | command | verified | control.mjs:2222 — usage `install [--browser test\|chrome\|chrome-beta\|edge\|edge-dev] [--from edge-dev\|edge\|chrome\|chrome-beta\|<dir>]`; :1456 logs `copied Angular DevTools ${version} from ${src} (read only)`; :1428 refuses a missing source |
| "install ... polls for Lars's click (default 180 s)" | config | verified | control.mjs:1390 and :1398 — `opts.timeout ?? 180` both in the message and the poll window (`Number(opts.timeout ?? 180) * 1000`) |
| "chrome:// and edge:// URLs passed on the command line open an empty window instead of the page, which is why uninstall opens the store page" | status | verified | control.mjs:1478 — the uninstall message states a browser will not open `${before.extensionsPage}` from the command line and opens the store page instead |
| "status shows installed true with the version, and the profile's Extensions id version_0 folder" | command | verified | control.mjs:1533 — the status line prints `installed ${s.installed}, version ${s.settings?.version}, enabled ${s.enabled}, disable_reasons ...` |
| "Right after the click the manifest version can be missing; install then reads the version from the version_0 folder name" | status | verified | control.mjs:1410 — `after.settings?.version ?? after.versionsOnDisk.at(-1)?.replace(/_\d+$/, '')`, the folder-name fallback |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S coexist" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:2228 — usage `coexist [--component app-counter] [--click "..."] [--di-graph]` |
| "Coexistence: other ɵsetProfiler subscribers (an AI extension) added and removed during a recording" | feature | verified | control.mjs:2026-2030 — coexist registers two `ng.ɵsetProfiler` subscribers, reads both, then removes A and later B with the function each call returned |
| "It subscribes through ng.ɵsetProfiler, which keeps a list of subscribers in Angular 22" | feature | unverifiable | a search of node_modules/@angular/core/fesm2022/core.mjs and the fixture's copy for `setProfiler` returns no definition here, so the subscriber list cannot be read from this repository; Angular's render3 profiler source would settle it |
| "ng.ɵsetProfiler(null) clears every subscriber, DevTools' included" | feature | unverifiable | no source in this repository shows the null branch; only a live probe (a counters read after calling it) would settle it |
| "Expected (measured): own subscribers bothOn {a:16,b:16}, afterRemoveA {a:16,b:32}; DevTools recorded 2 change detection cycles" | status | unverifiable | these are run measurements; control.mjs:2043 only evaluates `ok: profilerOk(prof, summary?.cycles ?? null)` against whatever the live panel reports, and no recorded output is stored in this repository |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node $S panel signal-graph --component=app-counter" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:2227 — usage `panel show \| signal-graph [--component app-counter] \| screenshot [--file f.png]`; the branch at :1911 |
| "Agreement with ng.ɵgetSignalGraph(ng.getInjector(host)), which the pane's backend calls" | feature | verified | control.mjs:1150 — `readSignalGraph` reads `ng-signal-graph-pane .node-cont` nodes (kind class, text) for comparison against the page-side graph the dev-app helper returns at .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:251 |
| ".node-cont.kind-* are DevTools 1.22.0 class names" | config | verified | control.mjs:1150 — the selector `ng-signal-graph-pane .node-cont` plus `[...n.classList].find((c) => c.startsWith('kind-'))`, so the pane's kind class carries a `kind-` prefix |
| "The angular:di_graph regression: after that tool runs, the template node is gone from both" | feature | unverifiable | research/02-angular-surface.md:104 documents what `angular:di_graph` walks (roots, LViews, element-injector tree) but no note in this repository records the lost template node; control.mjs:2088-2126 only runs the tool and re-reads, so the effect needs a live harness |
| "Other kinds the counter lacks: linked-signal, child-signal-prop, resource, unknown" | structure | unverifiable | the kind vocabulary lives in Angular DevTools' signals-visualizer, which is not in this repository; only the live panel or that bundle would settle it |
| "--di-graph leaves the page's signal graph broken until reload" | feature | unverifiable | control.mjs:2088 runs the `--di-graph` branch and writes signal-graph-after-di-graph.png, but the broken-until-reload state is a measurement recorded only in a live run |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.claude/skills/control-pangular-inspector/scripts/control.mjs:74` defaults to 9999" | config | stale | .claude/skills/control-pangular-inspector/scripts/control.mjs:87 — `const DEFAULT_PORT = 9999;` is on line 87 in the `.claude` copy (line 104 in the `.commandcode` copy), never line 74 |
| "`http://localhost:9999/__mcp`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1624 — `mcpUrl: `http://localhost:${p}/__mcp`` |
| "the eight action tools need `--confirm`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:90-99 — ACTION_TOOLS is highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api; line 520 refuses without --confirm |
| "The state file is per port" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:84 and :1531 — `STATE_DIR` under `tmp/control-pangular-inspector` and `path.join(STATE_DIR, `pangular-${p}.json`)` |
| "`npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:85-86 — `PKG = '@pangular-inspector/devtools'`, `PINNED = '0.0.7'` |
| "With `--read-only`, 0.0.7 lists 46 tools." | status | unverifiable | `node_modules/@pangular-inspector/devtools` is not installed in this checkout (Test-Path false), so no tool list can be counted; the count needs a live `tools` run |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "App: `node $D up --target portal` (API 3000" | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:84 — `const PORTAL_API_PORT = 3000;`; line 1440 — `up needs --target counter\|components\|ssr\|portal` |
| "app 4507 for the default portal folder" | config | unverifiable | .claude/skills/control-angular-dev-app/scripts/control.mjs:168 — app port is `slot === 0 ? 4200 : 4500 + slot` and the slot is a hash of the checkout path, so 7 for a folder outside this repository cannot be re-derived here |
| "`node $S doctor` exits 0 with `overlay-connected` passing" | status | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2075 — `overlay-connected` is a doctor check; :2190 waits for the page id that `list-pages` must report |
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1627 — `session: `pangular-${p}`` with p defaulting to 9999 (:87) |
| "Action tools ... need `up --allow-actions` and `call ... --confirm`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1586 — `readOnly = !argv.includes('--allow-actions')`; :520 refuses an action tool without `--confirm` |
| "then four H2s in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-pangular-inspector` ..., `Gotchas`" | structure | verified | features/setup.md:6, :14, :19, :36 — the four H2s appear in exactly that order |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1624 — `mcpUrl: `http://localhost:${p}/__mcp`` |
| "`components`; `list-components` on versions after 0.0.7" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2247-2255 — reads the `pangular:component-tree` resource and notes `list-components is not in this version` |
| "`node $S components --depth 3 --out list-components.json`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:915 — the component-tree outline drops nodes below `depth` and filters by name |
| "`playwright-cli -s=pangular-9999 --raw eval "() => window.__pangularPageId"`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2134 — probes `typeof window.__pangularPageId === 'string'`; :2165 reads the same global |
| "Instance ids (`cgg06-4`) change with every page load" | status | unverifiable | no page id is recorded in this repository and the portal checkout that produced it is outside it; a second page load with `list-pages` would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S call explain-navigation --args '{"limit":2}'`" | command | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:79 — the check invokes `['call', 'explain-navigation', '--args', '{"limit":2}']` and saves `explain-navigation.json` |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | config | unverifiable | `node_modules/@pangular-inspector/devtools` is not installed here, so the tool schema cannot be read; a live `tools` list or the package's source would settle it |
| "The page keeps `limits.navigations` (50) entries" | config | unverifiable | same missing package; nothing in the repository records that limit |
| "A reload keeps the page id (it lives in `sessionStorage`)" | status | unverifiable | the page is driven in the portal checkout, outside this repository; a reload with `list-pages` before and after would settle it |
| "The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`" | structure | unverifiable | the portal's sidebar template is outside this repository; the JSON recorded by a live `explain-navigation` would settle it |
| "`node $S call list-routes` (12 routes, measured)" | status | unverifiable | the portal's route table is not in this repository; `list-routes` output against the running portal would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:751 — install writes `'/__pangular': { target, pathRewrite: { '^/__pangular': '' }, ws: true }` into the app's proxy file |
| "`http://localhost:9999/` directly (trusts only that origin's one-time code)" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:87 — `DEFAULT_PORT = 9999`; the standalone server is the fixed pangular port |
| "`playwright-cli -s=pangular-9999 goto http://localhost:4507/__pangular/`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1627 — `session: `pangular-${p}`` with p = 9999 |
| "the dashboard text with the eight tab names, `LIVE`, `Angular 22.2.2`, and `Agent` then `Read-only`" | status | unverifiable | the panel markup ships in `@pangular-inspector/devtools`, which is not installed in this checkout (`node_modules/@pangular-inspector/devtools` absent); a panel load would settle it |
| "icon only, accessible name `Toggle Pangular Inspector`" | feature | unverifiable | the overlay is served by the uninstalled package; no copy of that string exists in this repository |
| "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" | status | unverifiable | the one-time-code logic lives in the uninstalled package; the server log would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:85-86 — `PKG` and `PINNED = '0.0.7'`; :1256 reads `manifest.devDependencies?.[PKG]` |
| "`setup.check`: six read-only facts, one line each" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:827-858 — exactly six `add` calls: declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |
| "`node $S install --json` -> `changed` lists ..." | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1441 — install's JSON result carries `changed: dirtyPaths(dir)` |
| "`node $S remove --json` -> exit 0, `gitStatus: []`, `gitDiffStat: ""`" | status | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1520-1521 — remove's result carries `gitStatus` and `gitDiffStat` from the git commands |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target; pass `--project` in a workspace with several" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:542 and :562 — first Nx app when the serve executor is `@angular/build:dev-server`; :1245 refuses and names `--project` |
| "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | status | unverifiable | a measurement against the portal checkout, which is outside this repository; re-running `install` there and reading `git diff --stat` would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The script: `scan ...`, which starts that server, calls one tool and stops it." | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2282 — spawns the package bin with `['mcp', '--root', root, '--read-only']` for the stdio scan |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:2355 — `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)` |
| "`build-meta` for versions: `node $S scan build-meta`" | command | unverifiable | `node_modules/@pangular-inspector/devtools` is not installed here, so the stdio tool list (build-meta, get-routes, explain-render-mode, analog-*) cannot be read; a `scan` run in the portal checkout would settle it |
| "Angular `22.2.2`, project `@ng-journal/source`, TypeScript `6.0.3`, `ssr: false` (measured)" | status | unverifiable | these are the portal's versions, and the portal checkout lives outside this repository; `node $S scan build-meta` there would settle it |
| "it ignores `project.json` (only `build-meta` reads it). An Nx workspace with code in `libs/` is mostly invisible to it." | feature | unverifiable | the scan implementation is in the uninstalled package; the empty `get-components` result at the workspace root would settle it |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest `51400 + slot`, bundled CDP `9500 + slot`" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:152 — `(slot) => (slot === 0 ? MAIN_VITEST_PORT : 51400 + slot)`; :160 — bundled CDP is `9500 + slot` |
| "the per-model instance (default `chrome-beta-gemma4`)" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:136 — `const DEFAULT_INSTANCE = 'chrome-beta-gemma4';`; the instance is in control-ai-browsers' `instances.json:99` |
| "Vitest's default 63315 cannot be used here, because it sits in a Windows excluded port range" | config | verified | spikes/ng222-app/vitest-base.config.mts:3 — comment "Vitest's default browser port 63315 sits in a Windows excluded port range on this machine (Hyper-V)" |
| "`VITEST_BROWSER_PORT` to `vitest-base.config.mts` (`strictPort`)" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:780 sets the env var; vitest-base.config.mts:7 reads it and :18 sets `strictPort: true` |
| "`vitest-attach.config.mts` sets `persistentContext` to `browser.contexts()[0]`" | integration | verified | spikes/ng222-app/vitest-attach.config.mts:19-20 — `chromium.connectOverCDP(cdpUrl)`, then `this.persistentContext ??= this.browser.contexts()[0]` |
| "`window.ng`: 23 functions, including `getComponent`, `getInjector`" | status | verified | research/17-vitest-browser-runtime.md:206 — "`window.ng` exists in the tester iframe with 23 functions" |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to `['pear', 'plum']`)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:34 and :61 — the overridden cart renders `Clicks: 3 (double 6, cart 2)` |
| "`node $S up --hold 90000`, then `node $S doctor` exits 0" | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:786 — `--hold` is passed as `VITE_COUNTER_HOLD_MS`; :258 refuses a hold that is not a positive whole number of ms |
| "then wait for `RERUN`" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs:686` — `const RUN_STARTED = /\b(DEV\|RUN\|RERUN)\b/;` |
| "Never attach to a browser outside `control-ai-browsers/instances.json` or the bundled Chromium `up` started" | integration | verified | .claude/skills/control-ai-browsers/instances.json exists (7022 bytes) and control.mjs:136 takes its default `chrome-beta-gemma4` from that registry |
| "The Vitest UI (`ui: false` in both runner configs)" | config | verified | spikes/ng222-app/vitest-attach.config.mts:55 and vitest-extension.config.mts:34 — `ui: false` in both browser configs |
| "then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-vitest-browser-angular` ..., `Gotchas`" | structure | verified | features/counter-tests.md:9, :17, :23, :40 — the four H2s in exactly that order |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "an Increment click moves "Clicks: 3 (double 6, cart 1)" to "Clicks: 4 (double 8, cart 1)"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 and :27 — the assertion texts before and after `incrementButton.click()` |
| "a `CartService` override shows "cart 2"" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:30-34 — `setup({ cartItems: ['pear', 'plum'] })` expects `cart 2` |
| "a test that fails on purpose because it reads the DOM in the same task as the click" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:37-49 — `it.runIf(VITE_COUNTER_TIMING_DEMO === '1')` reads `paragraph.textContent` right after `button.click()` |
| "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" | status | unverifiable | no test run was made (the brief forbids one); counter.spec.ts has four cases, two of them behind `it.runIf` (:39, :56), so a `doctor` run's `test-run` summary is what would settle the exact line |
| "the hold test that keeps the Counter mounted" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:56-62 — guarded by `Number(VITE_COUNTER_HOLD_MS) > 0`, renders with the pear/plum cart and sleeps `holdMs / 2` |
| "`expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'`" | status | unverifiable | the assertion exists (counter.spec.ts:49) but the wording of the failure is a run artifact no file in this repository records; `ng-test.log` from a `--timing-demo` run would settle it |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --extension extension --hold 90000` (the repository's `extension/`)" | command | verified | `extension/` holds manifest.json, background.js and the panel; control.mjs:794 passes `VITEST_EXTENSION_DIR` from `--extension` |
| "In attach mode `LanguageModel` is `available` in the tester iframe; in bundled mode it is not." | feature | verified | research/17-vitest-browser-runtime.md:144 — `available` in every context including the tester iframe main world; :29 — bundled Chrome for Testing 153 gives `availability()` `unavailable` |
| "In attach mode `down` uninstalls the extension (its notes say `uninstalled extension ...`)" | status | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1772 — `notes.push(`uninstalled extension ${state.extension.id}`)` |
| "In the bundled flow the extension id comes from its service worker target after `up`" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:757-761 (`extensionIdIn(targets)` — first target with a service worker) and :1503 |
| "No test extension with content scripts for the Vitest server exists in the repository" | structure | verified | extension/manifest.json:18-49 — the three content_scripts match `<all_urls>` with no `all_frames`, so they run in top-level pages only, never in the nested tester iframe |
| "The repository's `extension/` does not inject there (measured 2026-11-12)" | status | unverifiable | the measurement needs a live tester iframe and the extension loaded; nothing in the repository records that execution-context check for 2026-11-12 |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`CartService` overridden to `['pear', 'plum']`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:61 — the hold test's `setup({ cartItems: ['pear', 'plum'] })` |
| "It keeps it mounted, clicks Increment once halfway" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:62-65 — sleeps `holdMs / 2`, reads the count, then clicks Increment |
| "checks that the count rose by one" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:67-70 — `next = countBefore + 1`, asserted as `Clicks: ${next} (double ${next * 2}, cart 2)` |
| "every `ng.*` read works on the host" | config | verified | spikes/ng222-app/package-lock.json resolves `node_modules/@angular/core` to 22.2.2, the `ng-version="22.2.2"` the host reports |
| "Run `spikes/probes/vitest-iframe-probe.js` in the frame" | structure | verified | spikes/probes/vitest-iframe-probe.js exists; research/17-vitest-browser-runtime.md:39 — the file is "evaluated in the tester iframe" |
| "In attach mode the `run-code` route recorded only the click's output events (event ids 6 and 7) in two runs on 2026-10-16" | status | unverifiable | a profiler measurement on a live attach-mode run; no artifact in this repository records event ids 6 and 7 for 2026-10-16 |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check's header comment holds its claim, the feature it covers, its usage and the files it writes." | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:1-10 — `Claim:`, `Covers:`, `Needs:`, `Usage:`, `Writes:`, exit codes in the header |
| "`state` records each instance's backend, requested backend and performance class in `state.json`" | status | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:9 — `Writes: <dir>/state.json, plus each control step's own evidence JSON` |
| "the panel built (`npx nx run angular-ai-devtools:build-extension`) before `up`" | command | verified | apps/angular-ai-devtools/project.json:52 — the `build-extension` target the nx command names exists |
| "`model download --timeout-min=45`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:297 — `model download` polls for `--timeout-min` minutes after its click, default 45 |
| "`C=.commandcode/skills/control-ai-browsers/scripts/control.mjs`" | integration | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists, and `.claude/skills/verify-ai-browsers/SKILL.md` is byte-identical to the `.commandcode` copy (15326 bytes each, compared byte for byte), so the `.commandcode` paths resolve from both locations |
| "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three (2026-10-12)" | status | unverifiable | .claude/skills/control-ai-browsers/instances.json:171 registers `edge-phi4mini`, but the 1-in-3 failure is a live doctor measurement; three `doctor` runs on that instance would settle it |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--di-graph` it runs `angular:di_graph` last and records whether the template node is lost, without judging it." | feature | verified | .claude/skills/verify-angular-devtools/checks/coexist.mjs:5-8 and :77 — `deps.control(diGraph ? ['coexist', '--di-graph'] : ['coexist'])`, recording `templateLostInPane` (:86) |
| "`extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | checks/extension-enabled.mjs writes `<dir>/extension.json`, checks/attached.mjs writes `<dir>/attach.json`, checks/coexist.mjs writes `<dir>/coexist-result.json` (their `Writes:` header lines) |
| "`install --from` takes the harness copy already in the checkout" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:2222 — `install [--browser ...] [--from edge-dev\|edge\|chrome\|chrome-beta\|<dir>]`; :1428 refuses when the source has no extension |
| "The harness is headed; it opens a window on Lars's desktop" | status | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1621 — the launch options set `headless: false` |
| "reads Lars's own profile, which proof runs never touch" | status | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:2224 — `status [--browser ...] [--profile Default]` in the HELP text |
| "`templateLostInPane: true` is the known Angular bug (`research/05-spikes.md`)" | status | verified | research/05-spikes.md:36 — "Finding: `angular:di_graph` changes what `ɵgetSignalGraph` returns" |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`call navigate` without `--confirm` is refused (exit 2 with its `refused: navigate ... --confirm` reason)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:520 — `refused: ${short(name)} acts on the app; pass --confirm ...`; :1890 — `fail(2, refusal)` before any request |
| "condition: `["node", ".claude/skills/verify-pangular-inspector/checks/live-reads.mjs", "--session", "{up.session}", "--out", "{up.evidenceDir}"]`" | command | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:10 — `Usage: ... live-reads.mjs --session <playwright-cli session> --out <dir>` |
| "artifacts: `{up.evidenceDir}/contract-list.png` and `{up.evidenceDir}/live-reads.json`" | structure | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:11 — `Writes: <dir>/before.yml, after.yml, contract-list.png, doctor.json, one JSON per read, live-reads.json` |
| "`setup` needs no setup or teardown: condition `["node", ".claude/skills/verify-pangular-inspector/checks/setup.mjs", "--out", "{runDir}"]`, artifact `setup-check.json`" | command | verified | .claude/skills/verify-pangular-inspector/checks/setup.mjs:6-9 — Usage `--out <dir>`, `Writes: <dir>/setup-check.json`, `Needs: nothing running` |
| "The setup steps need ports 3000 and 9999 free (both fixed: one portal and one devtools server per machine)" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:84 — `const PORTAL_API_PORT = 3000;`; .claude/skills/control-pangular-inspector/scripts/control.mjs:87 — `DEFAULT_PORT = 9999` |
| "`check` exits 0 with every setup fact passing (exact pin 0.0.7 declared and installed, dev-guarded overlay import, proxy and its serve option)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:827-858 — the six facts declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target, with `PINNED = '0.0.7'` (:86) |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`session hook: off` stops the Claude Code or Codex SessionStart hook, or the pstack Pi extension, from injecting the poteto-mode mandate; any other value, or no line, leaves it on" | config | verified | scripts/opencode-pstack-plugin.ts:57 — `return !/^session hook: off\r?$/m.test(raw...)`, so only that exact line disables injection, and :52-54 returns true (hook on) when the sheet is missing or unreadable |
| "the pstack effort agents (`effort-low`, `effort-medium`, `effort-high`, `effort-xhigh`, `effort-max`) set `reasoningEffort` in their frontmatter and do not pin a model" | config | unverifiable | A recursive listing of the installed agent tree (`dir /s /b C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\*.md`) returns no `effort-*.md`; the pstack install source under `~/.commandcode/plugins/pstack` would settle whether those agents exist |
| "Free models available: `poolside/laguna-s-2.1-free`" | config | verified | tests/docs-alignment.test.mjs:38-46 — asserts the sheet matches /poolside\/laguna-s-2\.1-free/ and must not use the hyphenated `laguna-s-2-1-free` spelling |
| "`default effort` sets the level for a value without one; `session` keeps the parent session's effort" | config | unverifiable | A grep for `default effort` over scripts/, src/, packages/ and extension/ finds no consumer — only the `session hook` line is parsed (scripts/opencode-pstack-plugin.ts:57); the pstack runner that reads the sheet would settle it |
| "Winner: reflection/beam:free @medium (49s, 384K tokens, good quality — best speed/quality)" | status | unverifiable | No benchmark log in the tree records these timings (the ~2.5MB /lars-summarize transcript named in the sheet is not in the repository); re-running the 15-variant benchmark would settle the numbers |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its own `--user-data-dir` under `.commandcode\worktrees\.browsers\<name>` of the primary checkout" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:155-157 — ARTIFACT_ROOT is <primary>/.commandcode/worktrees and PROFILES resolves instances.json's profilesRoot ".browsers" beneath it |
| "`9600 + 10 * slot + index`" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:576-577 — portAt returns 9600 + 10 * slot + index for slot above 0 |
| "10 slots in all" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:358-363 — slotOrder builds SLOT_TRIES (10) slots, "then the next ones, 10 in all" |
| "`--no-ai-features` drops the whole `--enable-features` switch" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2774-2777 — opts['no-ai-features'] yields an empty feature list, so no --enable-features switch |
| "`<evidence dir>/<instance>-<command>-<ms>.json`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4293-4299 — save() writes `${instance ?? 'all'}-${cmd}-${Date.now()}.json` into evidenceDir |
| "`npm test` at the repository root runs them" | command | verified | package.json:15-16 — test chains `npm run test:skills`, which runs `.commandcode/skills/**/*.test.mjs` |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:101,135,173 — port 9334 for chrome-beta-gemma4, 9335 for edge-dev-aion, 9337 for edge-phi4mini |
| "Its session is `ai-<instance>-<port>`" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:711-712 — sessionOf returns `ai-${name}-${port}` |
| "read it from `C info <instance> --json` (`session`)" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:726,766 — the instance record carries `session: sessionOf(...)` into the JSON |
| "npx nx run angular-ai-devtools:build-extension" | command | verified | apps/angular-ai-devtools/project.json:52 — target build-extension exists |
| "`--evidence=tmp/control-ai-browsers/evidence/<run-id>`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:216-219 — evidenceDir resolves from opts.evidence, default tmp/evidence/<runId> |
| "`https://example.org/?ai-browsers=<purpose>`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:175,1727 — PROBE_ORIGIN https://example.org/ and `?ai-browsers=${purpose}` appended |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`)" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:37-40 — sendMessage({ type: 'angular-ai:di-query', componentName, elementTag }) |
| "receives `angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 — listener accepts 'angular-ai:di-graph' with resolutionPath; interface DiResolutionPath at src/main-world/di-path-tracer.ts:26 |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | config | verified | apps/angular-ai-devtools/project.json:62 — outputPath base "extension/panel" |
| "`http://localhost:4222/` in the main checkout" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:121 — slot 0 maps to port 4222 |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs:2-6 — header claims the di-graph/DiResolutionPath flow and states "Covers: control-ai-browsers features/di-doctor.md" |
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:6 — class DiDoctorService with queryDi; n3-di-doctor.component.ts and di-diff-display.ts sit in the same app folder |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "message type `angular-ai:error-capture` only" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:284 — handles msg.type 'angular-ai:error-capture' |
| "`angular-ai:error-explain` does not exist" | integration | verified | repo-wide search of .ts/.mjs/.js/.json outside node_modules and .git returned no 'angular-ai:error-explain' occurrence |
| "`src/panel/error-explainer-view.ts` calls `shouldCallModel`" | structure | verified | src/panel/error-explainer-view.ts:98 defines shouldCallModel; apps/angular-ai-devtools/src/app/error-explainer.component.ts:60 calls it |
| "maps each to its owning component through `ng.getOwningComponent`" | feature | verified | src/main-world/error-capture.ts:42-44 — ng.getOwningComponent used to name the owning component |
| "bundled at extension build time" | config | verified | apps/angular-ai-devtools/project.json:54-55 — build-extension dependsOn generate-error-digest |
| "`verify-ai-browsers/checks/error-explainer.mjs`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs:2-6 — header claims the captured NG0xxx error with owning component and digest entry, "Covers: control-ai-browsers features/error-explainer.md" |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the primary checkout's `extension/` (registry `extension`)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:71,102,136,174,202 — every instance sets "extension": "extension" |
| "Branded Chrome ignores `--load-extension`, so every instance starts through `scripts/pipe-keeper.mjs`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:818-819 — comment: branded Chrome rejects --load-extension, an instance with an extension starts through pipe-keeper.mjs; KEEPER path at :160 |
| "`panel <name> --url=<app>` drives N1 end to end (`scripts/panel.mjs`)" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:33,3106 — drivePanel imported from './panel.mjs' and documented as `panel <name> --url=<app>` |
| "the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:12-28 — result typedef carries ngVersion, extensionId, answerMs, steps |
| "DevTools 157 keys extension panels as `extension-panel-<uuid>_<n>`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:56-62 — picks the clientObjects key starting with 'extension-panel-' |
| "It runs `panel` and the state claim on every instance" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:2-10 — header: panel feature plus the state claim on every registry instance by default |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular AI DevTools 0.3.0 loaded as" | config | verified | extension/manifest.json:3-4 — "name": "Angular AI DevTools", "version": "0.3.0" |
| "reads `availability()` for ... Proofreader, LanguageDetector and Translator en->da" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1883-1885 — availability checks for Proofreader, LanguageDetector, Translator(en->da) |
| "WebMCP lives on `document.modelContext`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1953 — pass is `typeof document.modelContext === 'object'`; :1886 records both typeof values |
| "`canary.tools` is `[SKIP]`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:95 — chrome-beta-nano toolCanary false; control.mjs:3601 gates canary.tools on inst.model.toolCanary |
| "`Proofreader` is not defined in these builds" | status | unverifiable | control.mjs:1883 guards with `g.Proofreader ?` so its absence is only observable at runtime — one `C doctor <instance>` run printing Proofreader `undefined` would settle it |
| "loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok" | status | unverifiable | the extension id is assigned by the browser at load; extension/manifest.json:1-5 fixes the name and version only, so a `C doctor` line or the chrome://extensions listing would settle it |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its own profile under `.browsers\<name>`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:2 — "profilesRoot": ".browsers"; control.mjs:157 resolves PROFILES from that field |
| "its own `--enable-features` set and its own remote-debugging port, all read from `instances.json`" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:807,810 — --user-data-dir=${inst.dir} and --enable-features built from the registry; ports at instances.json:70,101,135,173,201 |
| "One line per instance (five)" | command | verified | .commandcode/skills/control-ai-browsers/instances.json — five entries under "instances": chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano |
| "`C flags edge-dev-aion`. `[OK]` with the nine Aion features" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:136-151 — edge-dev-aion lists nine feature strings |
| "`C up edge-dev-aion --backend=cpu` exits 2 before anything starts" | command | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion "cpu": null; control.mjs:777 "refuses a backend the registry does not offer" and EXIT.REFUSED = 2 at :177 |
| "finds instance processes only by `--user-data-dir`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:976-978 — drift regex parses --user-data-dir from the running command line |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`toSignal.source` / `toSignal.state` node" | feature | verified | apps/angular-ai-devtools/src/app/interop.service.ts:12 — matches nodes labelled toSignal.source or toSignal.state; src/main-world/interop-keep-list.ts:3 |
| "`interop-slice` (container)" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:27 — data-testid="interop-slice" |
| "`interop-inferred` (the attribution wording)" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:35 — data-testid="interop-inferred" renders the attribution |
| "`apps/angular-ai-devtools/src/app/interop.component.ts`; no runtime message type" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts exists and `angular-ai:interop` appears nowhere: repo-wide search of .ts/.mjs/.js/.json outside node_modules and .git returned no occurrence |
| "`--feature=interop`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17 — the feature option lists `version`, `error-explainer`, `stale-view`, `interop` |
| "`--extension <absolute path of the checkout the instance runs>`" | command | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:61,67 — options accept extension, defaulting to CHECKOUT_EXTENSION |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`--confirm=v3Nano`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4004 — model clear needs --confirm=<model name>, example --confirm=v3Nano |
| "the JSON holds `bytesRemoved` ... and `diskAfter`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4057 — bytesRemoved summed over removed folders; diskAfter at :3967,3990 |
| "`edge-dev-aion` therefore launches with `--disable-component-update`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:149 — edge-dev-aion args carry --disable-component-update |
| "`instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:16,26,41,60 — minFreeMib 22528 for chrome-beta and chrome-stable, 20480 for edge-dev and edge-stable |
| "the folder `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion`" | structure | verified | control.mjs:155-156,1313-1317 — TMP is .commandcode/worktrees/tmp/control-ai-browsers and the pin is join(TMP, 'pins', name) |
| "doctor's `model.pin` reads `matches the pin`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3489 — model.pin reports `matches the pin of <date>` compared over the pin roots |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`" | structure | verified | spikes/probes/probe10.js:7-8,15-16 — tools get_component_count and get_component_inputs |
| "`probe-bench` runs `spikes/probes/bench.js`" | feature | verified | spikes/probes/bench.js:4 — bench drives the ng222 counter at http://localhost:4222/ |
| "`bench.js` hard-codes it" | config | verified | spikes/probes/bench.js:4 — page.goto('http://localhost:4222/') |
| "`bench.js` has a 120 s per-prompt timeout" | config | verified | spikes/probes/bench.js:11 — PROMPT_TIMEOUT_MS = 120000 |
| "`result.q1.answer` names 42" | feature | verified | spikes/probes/probe10.js:7 — get_component_count returns count 42 |
| "`page.context()` is the whole instance profile" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1715-1729 — run-code executes in a tab of the attached instance, so page.context() is the instance profile |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`)" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:269 — handles msg.type 'angular-ai:record' with msg.cycle; both tracer files exist |
| "anti-pattern findings render when two snapshots differ" | feature | verified | apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts:58,272 — service.antiPatterns() rendered from the recorded snapshots |
| "with a cached answer for an unchanged selection" | feature | verified | apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts:261-287 — cachedAnswer signal backed by a Map keyed on the selection |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs:2-6 — header claims the chain from `angular-ai:record` facts and the Explain answer, "Covers: control-ai-browsers features/signal-provenance.md" |
| "The component picker is empty until at least one `angular-ai:record` cycle arrives" | feature | verified | extension-message.service.ts:269 — the record branch only fires on msg.cycle, and n2-signal-provenance.component.ts:58 renders findings from that state |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the template may show a stale value" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:26 — renders that hedged wording |
| "The scan runs through `StaleViewScanService` (which loads `extension/stale-view-worker.js`)" | structure | verified | apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:10,32-33 — class StaleViewScanService resolves 'stale-view-worker.js'; extension/stale-view-worker.js exists |
| "the component sends no message" | integration | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:55 — only injects StaleViewScanService; no chrome.runtime.sendMessage in the file |
| "the component sends no message, so `angular-ai:stale-view` does not exist" | integration | verified | repo-wide search of .ts/.mjs/.js/.json outside node_modules and .git returned no 'angular-ai:stale-view' occurrence |
| "`C panel <name> --url=http://localhost:4222/ --feature=stale-view`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17,345 — the feature option accepts stale-view and routes the panel to it |
| "no stale-view findings" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 — explicit empty state with that text |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:121,163,185 — the three `at: (slot) => ...` port functions return `4300 + slot`, `4400 + slot` and `4500 + slot` for every non-zero slot |
| "The portal API port is fixed at 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101,188-190 — `const PORTAL_API_PORT = 3000`, used by the portal api port row declared `kind: 'fixed'` |
| "The script passes `--inspect=false`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:206 — the portal api process args are `['run', 'api:serve', '--inspect=false']` |
| "`node $S up --target components`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:135-155 — a `components` target serves `spikes/ng222-app` with `readyPath: '/components'` |
| "Evidence and logs go to `tmp/control-angular-dev-app/<flowId>-<timestamp>/`" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:95,1436 — `SCRATCH = tmp/control-angular-dev-app` and `evidenceDir = path.join(SCRATCH, \`${flowId}-${stamp}\`)` |
| "`src/app/app.routes.ts:5-8` declares, `/stale-view` and `/stale-view-deferred`" | structure | stale | spikes/ng222-app/src/app/app.routes.ts:19-20 — the two routes are declared at lines 19-20; lines 5-8 are imports of ImageBudgetPage, AfterRenderPage, TrustBypassPage and FieldFormPage |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh page state: `count` 3, `double` 6, cart 1 item" | status | verified | spikes/ng222-app/src/app/counter.ts:5,17,18 — `items = signal<string[]>(['apple'])`, `count = signal(3)`, `double = computed(() => this.count() * 2)` |
| "app on the derived port, 4507 for the default portal folder" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:185,294-306 — the app port is `4500 + slot` and `slotOf` hashes the folder path; the default portal folder path hashes to slot 7, so 4507 |
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json`" | config | verified | portal checkout apps/insurance-portal/src/assets/feature-flags.manifest.json:1-18 — the manifest lists the 12 per-route flags (customer-list … claim-details), every one `true` |
| "then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-dev-app` (starting with `Preconditions:`), `Gotchas`" | structure | verified | .commandcode/skills/control-angular-dev-app/features/components.md:6,14,20,31 — the four H2s in that order; the same four at counter.md:7,15,21,45 and in all eight feature files |
| "heading `Render mode: server`, `Early clicks: 0`" | feature | verified | spikes/ng222-ssr/src/app/page.ts:10-12 — `<h1>Render mode: {{ mode() }}</h1>`, the `Early click` button and `Early clicks: {{ clicks() }}` |
| "The external link `https://www.ng-journal.com` in the portal header" | integration | verified | portal checkout apps/insurance-portal/src/app/app.component.ts:20 — the header anchor is `href="https://www.ng-journal.com"` |

## Doc: .commandcode/skills/control-angular-dev-app/features/components.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "renders `ComponentsPage` (`app-components-page`) with two `app-harness-probe` hosts" | structure | verified | spikes/ng222-app/src/app/components/components-page.ts:6,9,12 — selector `app-components-page`, hosts `id="probe-a"` and `id="probe-b"` |
| "`aria-listbox` (`#components-listbox`) is the `@angular/aria` listbox surface" | structure | verified | spikes/ng222-app/src/app/components/aria-surfaces.ts:5,26 — `import { Listbox, Option } from '@angular/aria/listbox'` and `<ul id="components-listbox" ngListbox …>` |
| "`aria-menu` (`ngMenu` triggered by `ngMenuTrigger`)" | structure | verified | spikes/ng222-app/src/app/components/aria-surfaces.ts:43,46 — `ngMenuTrigger [menu]="menu"` on the button, `#menu="ngMenu"` on the panel |
| "`cdk-overlay` is the `@angular/cdk` overlay surface opened by the Overlay button" | feature | verified | spikes/ng222-app/src/app/components/aria-surfaces.ts:52,77 — `<button … aria-label="Open overlay">Overlay</button>` and `this.overlay.create({ hasBackdrop: false })` |
| "Open `<url>` (`http://localhost:4224/components`)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:142,152 — the components target's slot-0 port is 4224 and its `readyPath` is `/components` |
| "Two servers share `spikes/ng222-app`'s `.angular` cache with the counter target" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:115,136 — counter and components both declare `dir: … 'spikes', 'ng222-app'`, and `spikes/ng222-app/.angular` exists |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button" | feature | verified | spikes/ng222-app/src/app/app.ts:8 — `<app-counter title="Clicks" />`; counter.ts:11,17 renders `{{ title() }}: {{ count() }} (double {{ double() }}, cart {{ cart.items().length }})` with `count = signal(3)` |
| "Each click raises the count by one and the doubled value follows" | feature | verified | spikes/ng222-app/src/app/counter.ts:12,18 — `(click)="count.set(count() + 1)"` and `double = computed(() => this.count() * 2)` |
| "an injected `CartService.items` signal and an effect that copies `count` into `lastLogged`" | structure | verified | spikes/ng222-app/src/app/counter.ts:5,19,23 — `items = signal<string[]>(['apple'])`, `cart = inject(CartService)`, `effect(() => this.lastLogged.set(this.count()))` |
| "Open `<url>` (`http://localhost:4222/`)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:121 — the counter target's slot-0 port is 4222 |
| "the component is OnPush by default (no `changeDetection` declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:8-14 — the `@Component` metadata carries `selector` and `template` only, no `changeDetection` key |
| "(`src/app/app.routes.ts:5-8`, read 2026-11-01)" | structure | stale | spikes/ng222-app/src/app/app.routes.ts:19-20 — `stale-view` and `stale-view-deferred` are declared at lines 19-20; lines 5-8 are imports (ImageBudgetPage, AfterRenderPage, TrustBypassPage, FieldFormPage) |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | portal checkout libs/shared/utils/src/lib/injection-tokens.ts:5 (BaseUrl factory `'http://localhost:3000/api/'`) and libs/claim/data-access/src/lib/data-services/claim-data.service.ts:9 — `#url = \`${inject(BaseUrl)}claims\`` |
| "`claim-list` table with columns Claim number, Damage Type, Date, Policynumber, Customer" | structure | verified | portal checkout libs/claim/feature-list/src/lib/list.component.ts:20-24 — the five `<th>` cells in that order |
| "row click opens `/claim/<id>/details`, heading `Claim Details`" | feature | verified | portal checkout libs/claim/feature-list/src/lib/list.component.ts:28 — `[routerLink]="['/', 'claim', claim.id, 'details']"`; libs/claim/feature-details/src/lib/details.component.ts:35 — `title="Claim Details"` |
| "Claim Number textbox" | feature | verified | portal checkout libs/claim/ui/src/lib/claim-form.component.ts:33-38 — `<label htmlFor="claimNumber">Claim Number</label>` then `pInputText` `id="claimNumber"` |
| "`Select damage type` and `Select contract` (under the label Policynumber) dropdowns" | feature | verified | portal checkout libs/claim/ui/src/lib/claim-form.component.ts:62,70 — `placeholder="Select damage type"` on the p-select and `<label htmlFor="contract">Policynumber</label>` above the contract picker |
| "`/claim/create` shows the heading `Complaint Create`: an app bug, measured" | feature | verified | portal checkout libs/claim/feature-create/src/lib/create.component.ts:33 — `<ng-journal-header title="Complaint Create" />` in the claim create component |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | portal checkout libs/complaint/data-access/src/lib/data-services/complaint-data.service.ts:9 and libs/customer/data-access/src/lib/data-services/customer-data.service.ts:9 — `\`${inject(BaseUrl)}complaints\`` and `…customers`, BaseUrl `http://localhost:3000/api/` |
| "`complaint-list` columns Type, Customer, Date, Description" | structure | verified | portal checkout libs/complaint/feature-list/src/lib/list.component.ts:20-23 — the four `<th>` cells in that order |
| "`complaint-create` `/complaint/create`, heading `Complaint Create`: `Select type` (CustomerService, Sales, Payments)" | feature | verified | portal checkout libs/complaint/feature-create/src/lib/create.component.ts:37 — `title="Complaint Create"`; libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:2-4 — `CustomerService`, `Sales`, `Payments` |
| "`complaint-details` … heading `Complaint Details`" | feature | verified | portal checkout libs/complaint/feature-details/src/lib/details.component.ts:35 — `<ng-journal-header title="Complaint Details" />` |
| "`customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip" | structure | verified | portal checkout libs/customer/feature-list/src/lib/list.component.ts:20-27 — the eight `<th>` cells in that order |
| "`customer-details` … heading `Customer Details` (name, email, phone, Address block)" | feature | verified | portal checkout libs/customer/feature-details/src/lib/details.component.ts:24,46 — `title="Customer Details"` and a `title="Address"` subtitle header |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at `http://localhost:3000/api/contracts`" | integration | verified | portal checkout libs/shared/utils/src/lib/injection-tokens.ts:5 (BaseUrl `'http://localhost:3000/api/'`) and libs/contract/data-access/src/lib/data-services/contract-data.service.ts:9 — `\`${inject(BaseUrl)}contracts\`` |
| "`contract-list` table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email" | structure | verified | portal checkout libs/contract/feature-list/src/lib/list.component.ts:32-37 — the six `<th>` cells in that order |
| "with heading `Contract Details` and an `Edit` button" | feature | verified | portal checkout libs/contract/feature-details/src/lib/details.component.ts:53 — `<ng-journal-header title="Contract Details" />` |
| "`Edit` opens `/contract/<id>/edit`, heading `Contract Edit`" | feature | verified | portal checkout libs/contract/feature-edit/src/lib/edit.component.ts:42 — `<ng-journal-header title="Contract Edit" />` |
| "then sends `PUT /api/contracts`" | feature | verified | portal checkout libs/contract/data-access/src/lib/data-services/contract-data.service.ts:25 — `this.#http.put<ContractDto>(this.#url, contract)` on the contracts collection URL |
| "Save sends `POST /api/contracts` (201)" | feature | verified | portal checkout libs/contract/data-access/src/lib/data-services/contract-data.service.ts:21 — `this.#http.post<ContractDto>(this.#url, contract)` |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` redirects to `/home`; heading `Home`; tiles Contracts, Claims, Complaints, Customers" | feature | verified | portal checkout apps/insurance-portal/src/app/app.routes.ts:4-11 — `path: ''`, `pathMatch: 'full'`, `redirectTo: 'home'`; home.component.ts:12,16,26,37,49 — `title="Home"` and four `routerLink` tiles to `/<domain>/list` |
| "sidebar entries `List` and `Create` per domain (Customer has `List` only) and `Home`" | feature | verified | portal checkout apps/insurance-portal/src/app/sidebar.component.ts:21,27,83,87-102 — labels `Create`/`List`/`Home`, domains contract/claim/complaint `[listMetaData, createMetaData]`, customer `[listMetaData]` |
| "Only the sidebar group headings render upper-case (`CONTRACT`, through the `capitalize` pipe, which calls `toUpperCase`)" | feature | verified | portal checkout sidebar.component.ts:38 — `{{ config.domain \| capitalize }}`; libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9 — `return value.toUpperCase();` |
| "a `div` with `routerLink`, not a link" | structure | verified | portal checkout apps/insurance-portal/src/app/sidebar.component.ts:46-47 — a `<div [routerLink]="…">`, no anchor |
| "the domain routes carry `canMatch` feature-flag guards" | feature | verified | portal checkout libs/claim/routes/src/lib/routes.ts:10,16,22 — `canMatch: [featureFlagGuard('claim-list')]` and the same for claim-details and claim-create; complaint and contract routes carry their own |
| "any unknown path renders `Page Not Found` and "Sorry, but the page you were trying to view does not exist."" | feature | verified | portal checkout apps/insurance-portal/src/app/page-not-found.component.ts:7-8 — the `<h1>Page Not Found</h1>` and that sentence; reached by the `path: '**'` route at app.routes.ts:33-35 |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`git -C <path> rev-parse HEAD` prints `976752389c22bb563d2278c2d78f423cb2505669`" | status | verified | `git -C D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful rev-parse HEAD` returned 976752389c22bb563d2278c2d78f423cb2505669 |
| "an isolated worktree of the portal repository" | structure | verified | the zoneful path holds a `.git` file (worktree gitfile), not a `.git` directory |
| "the app on its derived port 4509 (slot 9: `4500 + slot`), the API on the fixed 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:185,294-306 — the app port is `4500 + slot` and `slotOf` hashes the folder path, which hashes to slot 9 for the zoneful folder; `PORTAL_API_PORT = 3000` at :101 |
| "`package.json` asks `@angular/core ^20.3.29`" | config | verified | zoneful checkout package.json dependencies `@angular/core` is `^20.3.29`; the installed zoneful `node_modules/@angular/core/package.json` reports version 20.3.35 |
| "`zone.js ^0.16.2` installed" | config | verified | zoneful checkout package.json declares `zone.js` `^0.16.2`; the installed `node_modules/zone.js/package.json` reports 0.16.3 |
| "`apps/insurance-portal/src/app/app.config.ts` names no change-detection provider" | structure | verified | zoneful checkout apps/insurance-portal/src/app/app.config.ts:15-27 — the providers array lists router, animations, PrimeNG, HttpClient, feature flags and MessageService, with no `provideZoneChangeDetection` or `provideZonelessChangeDetection` |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`window.ng` present, `ngDevMode.hydratedComponents` 4, `hydratedNodes` 40, no node with a status other than `hydrated`" | status | verified | tmp/control-angular-dev-app/ssr-2026-10-18T22-48-26-671Z/ssr-check.json — the `hydration-counters` check detail reads `{"hydratedComponents":4,"hydratedNodes":40,"componentsSkippedHydration":0,…}` and `no-mismatch-on-default-route` reports 0 non-hydrated nodes |
| "`?mismatch=1` marks `<app-mismatch>` as `mismatched` with expected and actual DOM and logs NG0500 (expected failure)" | feature | verified | tmp/control-angular-dev-app/ssr-2026-10-18T22-48-26-671Z/ssr-check.json — `expected-mismatch-detected` detail: mismatched on `<app-mismatch>`, `NG0500: During hydration Angular expected <p> but found <div>` |
| "`ok` is `true` when all six checks pass" | status | verified | tmp/control-angular-dev-app/ssr-2026-10-18T22-48-26-671Z/ssr-check.json — `"ok":true` with all six named checks `pass`; .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:116-143 names them `server-html-ngh` … `expected-mismatch-detected` |
| "a `@defer (hydrate on interaction)` block holding a `Deferred click` button" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15-16 — `@defer (hydrate on interaction) { <app-deferred /> }`; deferred.ts:6-7 — the `Deferred click` button and `Deferred clicks:` line |
| "The server log counts every hit as `[api] GET /api/items` with the user agent (`ua=node` for the server render)" | integration | verified | spikes/ng222-ssr/src/server.ts:18-24 — the `/api/items` handler logs `[api] GET /api/items … ua=${req.headers['user-agent']}` and returns Alpha, Beta, Gamma |
| "`ssr-render-modes` `/` is `ssr`, `/prerender` is `ssg`, `/client` is the bare shell with `<body ngcm>`" | feature | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 — `RenderMode.Server` for `''`, `RenderMode.Prerender` for `prerender`, `RenderMode.Client` for `client` |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:108 — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh'` |
| "session `ngdt`, CDP port 9420" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:329,377 — `MAIN_CDP_PORT = 9420` and `SESSION = flowId === 'main' ? 'ngdt' : \`ngdt-${flowId}\`` |
| "CDP port `9420 + slot` (9421-9499, slot 1-79 from a hash of the worktree path)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:329-331 — `MAIN_CDP_PORT = 9420` with `const SLOTS = 80`, so slots 1-79 map to 9421-9499 |
| "copies the newest `<version>_0` folder from `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\`" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:140,1431 — the edge-dev userData is `join(LOCAL, 'Microsoft', 'Edge Dev', 'User Data')` and `--from` defaults to `edge-dev`; that Extensions folder holds `1.22.0_0` and `1.22.1_0` |
| "`up` writes a playwright-cli config (`tmp/control-angular-devtools/state/<flow>.cli.config.json`)" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:113,1610 — `TMP = join(ROOT, 'tmp', 'control-angular-devtools')` and `configPath = join(TMP, 'state', \`${flowId}.cli.config.json\`)` |
| "the profiler button has `aria-label` `Start recording` / `Stop recording`" | feature | verified | tmp/control-angular-devtools/evidence/20261107-210157/coexist-result.json — `profiler.recording` is `["Start recording","Stop recording"]` from the live panel |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at `spikes/ng222-app` (Angular 22.2.2)" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json reports version 22.2.2; .commandcode/skills/control-angular-dev-app/scripts/control.mjs:115 targets `spikes/ng222-app` |
| "App page: playwright-cli session `ngdt`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:377 — the main flow's session is `ngdt` |
| "One file per feature: H1, one paragraph of user-visible behaviour, then `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-devtools`, `Gotchas`" | structure | verified | .commandcode/skills/control-angular-devtools/features/attach.md:7,15,20,32 and install.md:7,14,22,38, profiler.md:6,11,15,26, signal-graph.md:6,13,17,32 — the four H2s in that order in every feature file |
| "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`)" | feature | unverifiable | no `devtools-tabs.component.ts` exists anywhere in this checkout, and `tmp/control-angular-devtools/extension/1.22.0` holds only the unpacked bundle; reading that bundle's tabs component would settle it |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:113 — `TMP = tmp/control-angular-devtools`; the folder holds run subfolders such as tmp/control-angular-devtools/evidence/20261107-210157 |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1241,1255 — the probe redefines `window.__NG_DEVTOOLS_CONNECTED__` with an accessor and the attach read returns `flag: window.__NG_DEVTOOLS_CONNECTED__ === true` |
| "`attach` reloads the page to catch messages from the start" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1249 — `await page.reload();` after the init script is installed |
| "backendInstalled true; backendReady at ~950 ms; Angular 22.2.2" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json reports 22.2.2; .commandcode/skills/control-angular-devtools/scripts/control.mjs:1854,1865 read `[ng-version]` and print it as the Angular version |
| "`attach` exits 1 because it requires `isDebugMode`" | status | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1888 — the attach verdict is gated on `d.isDebugMode && …` |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh`" | integration | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:110 — `STORE_URL = https://chromewebstore.google.com/detail/${EXT_ID}` with EXT_ID `ienfalfjdbdpebioblfackkekamfmbnh` |
| "In the test harness it is a local unpacked copy loaded at launch" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1639 — the harness launch args include `--load-extension=${ext}` |
| "Extensions page: `chrome://extensions/?id=ienfalfjdbdpebioblfackkekamfmbnh` or `edge://extensions/?id=...`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1336 — `extensionsPage: \`${b.scheme}://extensions/?id=${EXT_ID}\`` per browser scheme |
| "`--profile P` picks the profile read and also passes `--profile-directory=P`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1355 — `spawn(BROWSERS[name].exe, [\`--profile-directory=${profile}\`, url], …)` |
| "test: `doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | status | verified | %LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh holds `1.22.0_0` and `1.22.1_0`, so 1.22.1 is the newest copied; the harness copy still on disk under tmp/control-angular-devtools/extension is 1.22.0 |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles`" | status | verified | tmp/control-angular-devtools/evidence/20261107-210157/coexist-result.json — `profiler.subscribers` is `{"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}` and `profiler.devtoolsCycles` is 2 |
| "which keeps a list of subscribers in Angular 22" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2041-2045 — two subscribers are registered, one is removed through the function it returned, and the counts go from 16/16 to 16/32, so each subscriber keeps its own counter |
| "removes one with its returned function" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2041-2045 — `window.__ngdtRemoveA()` is called after the first click and `a` stops at 16 while `b` reaches 32 |
| "`ng.…setProfiler(null)` clears every subscriber, DevTools' included" | feature | unverifiable | no line in this checkout asserts it: the DevTools backend source (`render3/profiler.ts`) is not vendored and no script passes a null argument; a live page where `setProfiler(null)` empties the pane would settle it |
| "F12 -> Angular tab -> Profiler -> record button -> use the app -> stop" | command | verified | tmp/control-angular-devtools/evidence/20261107-210157/coexist-result.json — the driven panel exposed `Start recording` and `Stop recording` and recorded 2 cycles, which is that sequence |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Expected on the fixture before: `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`" | status | verified | tmp/control-angular-devtools/evidence/20261107-210157/coexist-result.json — `signalGraph.pane` lists exactly those six nodes in that order |
| "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`, `ng.…getSignalGraph` `effect, signal:count`" | feature | verified | tmp/control-angular-devtools/evidence/20261107-210157/coexist-result.json — `diGraph.paneAfter` is `["signal:count","effect:Effect"]` and `diGraph.ngAfter` is `["effect:","signal:count"]` |
| "graph nodes are `ng-signal-graph-pane .node-cont.kind-<kind>` with the label and value as text" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1165 — the page-side read selects `'ng-signal-graph-pane .node-cont'` and takes the `kind-*` class as the node kind |
| "`node $S panel signal-graph --component=app-counter`" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1926,2242 — the `panel` subcommands are `show`, `signal-graph`, `screenshot`, with `signal-graph [--component app-counter]` in the usage text |
| "`.node-cont.kind-*` are DevTools 1.22.0 class names" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1165 depends on those classes, and the harness extension copy on disk is tmp/control-angular-devtools/extension/1.22.0 |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "(@pangular-inspector/devtools, pinned 0.0.7)" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:103 - `const PINNED = '0.0.7'`, with PKG `@pangular-inspector/devtools` at :102 |
| "standalone `pangular dev` on port 9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:104 - `const DEFAULT_PORT = 9999`, commented "the docs' standalone port" |
| "`http://localhost:9999/__mcp`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1644 - `mcpUrl: http://localhost:${p}/__mcp` |
| "The state file is per port (`tmp/control-pangular-inspector/state/pangular-<port>.json`)" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:100-101 - SCRATCH is tmp/control-pangular-inspector and STATE_DIR is its state folder; :1548 - `path.join(STATE_DIR, pangular-${p}.json)` |
| "`tools/list` holds none of the eight action tools" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:107-116 - ACTION_TOOLS holds exactly highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api |
| "`--allow-actions` drops `--read-only`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1603 - `const readOnly = !argv.includes('--allow-actions')`; :1616 - `...(readOnly ? ['--read-only'] : [])` passed to `dev` |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "App: `node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101 - `const PORTAL_API_PORT = 3000`; .commandcode/skills/control-angular-dev-app/SKILL.md:34 - "the default portal folder: 4507" |
| "Each feature file starts with an H1 and one paragraph of user-visible behavior, then four H2s in this order" | structure | verified | .commandcode/skills/control-pangular-inspector/features/live-inspection.md:6,14,20,36 - Sub-features, How to get to it (user POV), Driving it with control-pangular-inspector, Gotchas, in that order |
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1605 - evidenceDir is `pangular-<port>-<stamp>` under tmp; :1647 - `session: pangular-${p}` |
| "`node $S doctor` exits 0 with `overlay-connected` passing" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2095 - `overlay-connected` is one of the doctor check names |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`live.tree`: the component outline (`components`; `list-components` on versions after 0.0.7)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2238 - "list-components when the server has it (unreleased after 0.0.7), else the same outline built from the component-tree resource"; :2275 - the resource fallback note |
| "`node $S components --depth 3 --out list-components.json`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2243 - `const depth = Number(str('depth') ?? Infinity)` |
| "MCP over HTTP at `http://localhost:9999/__mcp`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1644 - `mcpUrl: http://localhost:${p}/__mcp` |
| "`live.pages`: `list-pages` shows the tab's page id, URL" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2154 - doctor reads `window.__pangularPageId`; :2185 - it is matched against what `list-pages` reports |
| "Instance ids (`cgg06-4`) change with every page load" | status | unverifiable | needs two live `list-pages` reads in the portal checkout, which is outside this repository; no run was made in this pass |
| "the answer starts `No signal graph for <selector>`" | feature | unverifiable | that text is emitted by @pangular-inspector/devtools 0.0.7 in the portal checkout; this repository holds no copy of the package |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the `run-code` click on CONTRACT > List from SKILL.md Drive" | feature | verified | .commandcode/skills/control-pangular-inspector/SKILL.md - its Drive example holds the playwright-cli run-code click on CONTRACT > List that waits for '**/contract/list' |
| "`node $S call explain-navigation --args '{"limit":2}'`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2453 - usage line offers `call <tool> [--args <json>]`; :1939 - unknown tool names are reported against `tools/list` |
| "`limit` on `explain-navigation` defaults to 5 (at most 50). The page keeps `limits.navigations` (50) entries." | feature | unverifiable | the default and the page's navigation buffer are enforced by the devtools server in the portal checkout; nothing in this repository holds them |
| "12 routes, measured" | status | unverifiable | a count measured against the portal app; no `list-routes` answer is stored in this repository |
| "The sidebar entries are `div`s with `routerLink`" | feature | unverifiable | the portal's sidebar template lives in the portal checkout, outside this repository |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:768 - `'/__pangular': { target, pathRewrite: { '^/__pangular': '' }, ws: true }` is merged into the app's proxy.conf.json |
| "`http://localhost:9999/` directly" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:104 - `const DEFAULT_PORT = 9999` |
| "`panel.tabs`: Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP" | feature | unverifiable | the tab list is rendered by @pangular-inspector/devtools 0.0.7, which is not installed in this repository |
| "A code expires after 5 minutes" | status | unverifiable | the expiry is enforced by the devtools server in the portal checkout; no file in this repository states it |
| "the dashboard text with the eight tab names, `LIVE`, `Angular 22.2.2`, and `Agent` then `Read-only` (measured)" | status | unverifiable | a measured panel snapshot; no snapshot, log or evidence directory is stored in this repository |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:102-103 - PKG `@pangular-inspector/devtools` and `const PINNED = '0.0.7'`; :846-847 - the declared version is compared with PINNED |
| "`install` refuses SSR and Vite mounts" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1355 - refusal text: the script automates only the standalone CLI mount and points to SKILL.md "Other mounts" |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:579 - `j.targets?.['serve']?.executor === '@angular/build:dev-server'` |
| "`remove` restores `HEAD`" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:761 - refusal: "remove restores it from HEAD and would drop them, so commit them first" |
| "`node $S check` -> six `[OK]` lines, exit 0" | command | unverifiable | the check facts are assembled in control.mjs around :846-874, but counting six needs the app's own package.json and proxy file in the portal checkout |
| "The setup is not committed in the portal checkout (its `git log` holds no commit for it)" | status | unverifiable | the portal checkout is outside this repository, so its git log could not be read here |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2296 - the scan usage string names exactly these seven tools |
| "`scan <tool>`, which starts that server, calls one tool and stops it" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2302 - every `scan` call spawns `[bin, 'mcp', '--root', root, '--read-only']` |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2375 - `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)` |
| "`--read-only` drops only the action tools" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:2302 - scan always passes `--read-only`; :107-116 - the action set is ACTION_TOOLS |
| "`node $S scan get-components` -> `[]` in the portal (measured)" | status | unverifiable | a measurement in the portal checkout, outside this repository; no scan output is stored here |
| "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json`" | feature | unverifiable | the scan implementation ships inside @pangular-inspector/devtools 0.0.7 in the portal checkout |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the per-model instance (default `chrome-beta-gemma4`)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:153 - `const DEFAULT_INSTANCE = 'chrome-beta-gemma4'` |
| "Vitest `51400 + slot`, bundled CDP `9500 + slot`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:169,177 - slot 0 keeps 51315 and 9350, other slots get `51400 + slot` and `9500 + slot` |
| "`--hold <ms>` sets `VITE_COUNTER_HOLD_MS`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:803 - `env['VITE_COUNTER_HOLD_MS'] = String(state.hold)` |
| "`--extension <dir>` loads any unpacked extension" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1349 - `cdp.send('Extensions.loadUnpacked', { path: dir })` |
| "`vitest-attach.config.mts` sets `persistentContext` to `browser.contexts()[0]`" | config | verified | spikes/ng222-app/vitest-attach.config.mts:20 - `this.persistentContext ??= this.browser.contexts()[0]` |
| "The playwright-cli session is `control-vitest-<flowId>-<Vitest port>`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1297 - `session: control-vitest-${flowId}-${vitestPort}` |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to `['pear', 'plum']`)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - `setup({ cartItems: ['pear', 'plum'] })`; :34 - that setup asserts "Clicks: 3 (double 6, cart 2)" |
| "The Vitest UI (`ui: false` in both runner configs)" | config | verified | spikes/ng222-app/vitest-attach.config.mts:55 and spikes/ng222-app/vitest-extension.config.mts:34 - each sets `ui: false` |
| "`mounted-component` passes only while the hold test runs" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1677 - the 'mounted-component' check; spikes/ng222-app/src/app/counter.spec.ts:56 - the component is mounted only for the hold test |
| "Never attach to a browser outside `control-ai-browsers/instances.json` or the bundled Chromium `up` started" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:99 - `chrome-beta-gemma4`, the instance the default `up` attaches to, is an entry of that file |
| "wait for `RERUN` in `<evidenceDir>/ng-test.log`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:703 - `const RUN_STARTED = /\b(DEV\|RUN\|RERUN)\b/` |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two more run only when their environment variable is set" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:20,32 - plain `it` blocks; :39,56 - `it.runIf(...)` on VITE_COUNTER_TIMING_DEMO and VITE_COUNTER_HOLD_MS |
| "an Increment click moves "Clicks: 3 (double 6, cart 1)" to "Clicks: 4 (double 8, cart 1)"" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:23,27 - the two `toHaveTextContent` assertions with those exact strings |
| "`tests-timing-demo` with `VITE_COUNTER_TIMING_DEMO=1` one test fails" | config | verified | spikes/ng222-app/src/app/counter.spec.ts:37-49 - the runIf test reads the DOM in the click's own task and expects 'Clicks: 4'; .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:807 - `VITE_COUNTER_TIMING_DEMO` set to '1' |
| "`npm test` in `spikes/ng222-app` runs the default `headless` configuration once" | command | verified | spikes/ng222-app/angular.json:80 - the `headless` configuration; :92 - `"defaultConfiguration": "headless"`; spikes/ng222-app/package.json - `"test": "ng test"` |
| "`Tests 2 passed \| 2 skipped (4)` without flags" | status | unverifiable | needs a Vitest browser run; this pass runs no test runner, and no such run log is stored in the repository |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "An unpacked extension loaded by `up --extension <dir>` runs in the same browser as the tests" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1327-1349 - loaded with `Extensions.loadUnpacked` into the attached instance before `ng test` starts |
| "`ext-loaded` the extension's service worker target exists (`doctor` `extension-loaded`)" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1701 - the 'extension-loaded' check; :778 - extensionIdIn matches the `service_worker` target with a chrome-extension:// URL |
| "In attach mode `down` uninstalls the extension (its notes say `uninstalled extension <id>`)" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1791-1792 - `Extensions.uninstall`, then `notes.push('uninstalled extension <id>')` |
| "in bundled mode it deletes the profile the extension was loaded into" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1821-1831 - `rmSync(state.userDataDir, ...)` with a "profile ... removed" note |
| "The repository's `extension/` does not inject there (measured 2026-11-12" | status | unverifiable | needs a live tester iframe with the unpacked extension loaded; no run in this pass and no supporting evidence stored in the repository |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the hold test renders `Counter` in the tester iframe with `CartService` overridden to `['pear', 'plum']`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - the hold test's `setup({ cartItems: ['pear', 'plum'] })` |
| "clicks Increment once halfway, and checks that the count rose by one" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:62-70 - waits holdMs/2, clicks, asserts `Clicks: ${next} (double ${next * 2}, cart 2)` from the count read before the click |
| "the page shows "Clicks: 3 (double 6, cart 2)"" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:34 - the override test asserts exactly that text |
| "`getDependenciesFromInjectable(injector, Counter)` shows `CartService`" | feature | verified | spikes/probes/vitest-iframe-probe.js:117 - `getDependenciesFromInjectable(injector, cmp.constructor)` is the read the probe makes |
| "`<app-counter>` does not exist under TestBed; select `[ng-version]`" | status | verified | spikes/probes/vitest-iframe-probe.js:16-17 - "TestBed renders the component into a <div id="rootN" ng-version> host, not <app-counter>" |
| "`getInjectorProviders` throws on the null injector at the end of the resolution path" | feature | unverifiable | needs a live tester frame; the probe calls it at :129 but no run was made in this pass |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`package-lock.json` -> npm" | config | verified | package-lock.json is present at the repository root; no pnpm-lock.yaml, yarn.lock or bun.lock exists there (Test-Path on all four) |
| "Root `package.json` should have `"private": true` to prevent accidental publish" | config | verified | package.json:3 - `"private": true` |
| "npm/bun: hoist shared deps to root `node_modules`" | structure | verified | package.json:27-30 - the build deps are declared at the root and resolve from root node_modules (node_modules/@angular/build exists) |
| "`npm install @org/ui --workspace @org/app`" | command | unverifiable | the root package.json declares no `workspaces` field, so this repository has no npm workspace to install into; a workspace using npm workspaces would settle it |
| "yarn berry: uses Plug'n'Play by default (no `node_modules`)" | config | unverifiable | no yarn.lock, .yarnrc.yml or yarn workspace exists in this repository |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the script converts to seconds internally" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:48-50 - `parseInt(getArg('--timeout') \|\| '0', 10) * 60` for `--timeout` and `--new-cipe-timeout` |
| "`circuit_breaker` \| Exit, no progress after 13 consecutive polls" | status | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208 - `if (noProgressCount >= 13) return { action: 'done', code: 'circuit_breaker' }` |
| "circuit breaker (5 polls)" | status | stale | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208,323 - the breaker fires at 13 consecutive polls and its message reads "No progress after 13 consecutive polls"; no 5-poll breaker exists |
| "this repository's `nx.json` contains neither" | config | verified | nx.json - its keys are analytics, targetDefaults, plugins and generators; neither nxCloudId nor nxCloudAccessToken appears |
| "Action types: `fix-auto-applying`, `apply-mcp`, `apply-local-push`, `reject-fix-push`, `local-fix-push`, `env-rerun`, `auto-fix-push`, `empty-commit-push`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:86-93 - the cipeUrl action list and the commitSha action list hold exactly these eight |
| "`--local-verify-attempts` \| 3" | config | unverifiable | the counter is held by the orchestrator loop; ci-state-update.mjs only reads counts passed to it, so no file in this repository sets 3 |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ci-state-update.mjs gate --gate-type local-fix`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:10 - usage `gate --gate-type <local-fix\|env-rerun>`; :40 - `if (gateType === 'local-fix')` |
| "The script returns `verifiableTaskIds` in its output" | feature | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:116 - `return { category: 'needs_local_verify', verifiableTaskIds: verifiable }`; :429-430 - copied onto the result |
| "The script returns `autoApplySkipReason` in its output" | feature | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:262 - `extra: { autoApplySkipReason }`; :431-432 - copied onto the result |
| "Spawn FETCH_HEAVY subagent for `selfHealingSkipMessage`" | feature | unverifiable | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:85 carries `selfHealingSkippedReason`, not the skip message; the message is a ci_information field the subagent fetches, so no script here settles it |
| "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | command | unverifiable | no `apply-locally` invocation and no APPLIED_LOCALLY state in the monitor-ci scripts; settling it needs the nx-cloud CLI and a real CI Attempt |
| "Local verification: passed\|enhanced\|failed-pushing-to-ci" | status | unverifiable | the commit-message template is a convention for the orchestrating agent; no script in this repository validates it |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `npx nx-cloud api --help` (or `npx nx-cloud api` alone) once for syntax and options" | command | verified | package-lock.json:14093 — the nx 23.3.0 package declares the bin `"nx-cloud": "dist/bin/nx-cloud.js"`, which dispatches the subcommand to the downloaded cloud client (node_modules/nx/dist/src/nx-cloud/utilities/client.js:20) |
| "Run every command from the workspace root so the command finds `nx.json`" | config | verified | node_modules/nx/dist/src/nx-cloud/utilities/get-cloud-options.js:14 — `getCloudOptions` calls `readNxJson(directory)` with `workspaceRoot` as the default directory |
| "with `nxCloudId` in `nx.json`" | config | verified | node_modules/nx/schemas/nx-schema.json:832 — the nx.json schema declares `nxCloudId` |
| "check the host (`NX_CLOUD_API` or `nxCloudUrl`)" | config | verified | node_modules/nx/dist/src/nx-cloud/utilities/get-cloud-options.js:19 — `process.env.NX_CLOUD_API \|\| process.env.NRWL_API \|\| https://cloud.nx.app`; node_modules/nx/schemas/nx-schema.json:127 declares `nxCloudUrl` |
| "Run `npx nx-cloud login --status` from the workspace root" | command | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/login/command-object.js:9-16 — the nx-side `login` alias declares only `--verbose` and `--help`, and `--status` lives in the client fetched at runtime (node_modules/nx/dist/src/nx-cloud/utilities/client.js:16); a local `npx nx-cloud login --status` would settle it |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | command | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/ holds only login, logout, connect, fix-ci, record, start-agent, start-ci-run, complete-run, apply-locally and download-cloud-client, and those subcommands are served by the runtime-downloaded client (node_modules/nx/dist/src/nx-cloud/utilities/client.js:16); a local `npx nx-cloud --help` would settle it |
| "`npx nx-cloud api task-stats` with `-f dateAfter=... -f dateBefore=... --pages 3`" | command | unverifiable | the `task-stats` operation and its `dateAfter`/`dateBefore` filters are defined in the Nx Cloud API spec, which is not vendored in this repository — `npx nx-cloud api --describe task-stats` would settle it |
| "Asset links (task logs, artifacts, reports) answer with a redirect; `--describe` shows them as `returns: file`" | feature | unverifiable | no `api` operation schema ships in node_modules/nx (only the dispatch shim at node_modules/nx/dist/src/nx-cloud/utilities/client.js:20) — `npx nx-cloud api --describe <asset operation>` would settle it |
| "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | command | unverifiable | the only ndjson writer in this checkout is the AI-agent output for `nx import`/`init` (node_modules/nx/dist/src/command-line/ai/ai-output.js:3), not an `api` output format — a local `npx nx-cloud api --help` would settle it |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Query the exact target with the workspace-local Nx command" (`nx show project "$project" --json`) | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:28 — example `$0 show project [projectName]`; :19 — the `json` option is "Output JSON." |
| "Nx already includes inherited settings. Do not merge `project.json`, `nx.json`, plugins, or `targetDefaults` yourself" | feature | verified | node_modules/nx/dist/src/command-line/show/command-object.js:28 — `show project` "Shows the resolved configuration for [projectName]", i.e. inheritance is already applied |
| "Use `nx-cloud-api` (`npx nx-cloud api`) for every read" | integration | verified | package-lock.json:14093 — nx 23.3.0 ships the `nx-cloud` bin, which dispatches to the cloud client command table (node_modules/nx/dist/src/nx-cloud/utilities/client.js:21) |
| "A target `cache` field cannot prove Vite or ESLint native-cache state" | status | unverifiable | this workspace configures only `@nx/playwright/plugin` (nx.json:27-29) plus targetDefaults `cache` (nx.json:5), so there is no Vite or ESLint target to compare — a workspace with an `@nx/vite` target whose executor options were inspected would settle it |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | unverifiable | nx 23.3.0 ships only the dispatch shim (package-lock.json:14093; node_modules/nx/dist/src/nx-cloud/utilities/client.js:20) and no `api` command module under node_modules/nx/dist/src/command-line/nx-cloud/ — a local `npx nx-cloud api --help` would settle it |
| "The API cannot identify an upload path, writer, storage event, or service mutation" | feature | unverifiable | would be settled by `npx nx-cloud api --describe` over the artifact operations; the operation schema is not vendored in this repository |
| "Byte-identical malformed downloads across retries support a persistent bad cache object" | feature | unverifiable | no Nx Cloud artifact bytes are stored in this workspace (`node_modules/nx/dist/src/nx-cloud/utilities/client.js:16` fetches the client at runtime) — two downloaded artifacts of a recorded task would settle it |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | unverifiable | the asset-type enum belongs to the Nx Cloud API spec, which is not vendored here (nx ships only the client shim at node_modules/nx/dist/src/nx-cloud/utilities/client.js:16) — `npx nx-cloud api --describe` on the asset routes would settle it |
| "Download the exact row-provided link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | unverifiable | the `api` subcommand's `-o` handling lives in the runtime-downloaded client (node_modules/nx/dist/src/nx-cloud/utilities/client.js:20) — a local `npx nx-cloud api --help` would settle it |
| "A downloaded asset proves only that it resolves now. A 404 does not prove that it never existed." | feature | unverifiable | no asset HTTP handling exists in this checkout — a live 404 against a recorded asset URL and its replacement download would settle it |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED` (the `cipes` filter accepts only terminal statuses)" | feature | unverifiable | the CIPE status enum and the `cipes` filter list live in the Nx Cloud API spec, not in this checkout — `npx nx-cloud api --describe cipes` would settle it |
| "CIPE and run-group list filters use `createdAt`, not failure time" | feature | unverifiable | the same spec is absent from the repository (node_modules/nx/dist/src/nx-cloud/utilities/client.js:16 downloads the client at runtime) — `npx nx-cloud api --describe cipes` and `--describe run-groups` would settle it |
| "Use `--list-operations` to confirm the routes; the public API has no separate workflow routes" | command | unverifiable | the nx CLI registers no workflow route module (node_modules/nx/dist/src/command-line/nx-cloud/ has only login, logout, connect, fix-ci, record, start-agent, start-ci-run, complete-run, apply-locally, download-cloud-client) — `npx nx-cloud api --list-operations` would settle it |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "**Always use `--no-interactive`** - Prevents prompts that would hang execution" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:31-32 — the `interactive` option, "When false disables interactive input prompts for options" |
| "**Always run with `--dry-run` first** to verify files will be created in the correct location" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:25 — `dryRun` option on the `generate <generator> [_..]` command (:7) |
| "List all generators for a plugin: `npx nx list @nx/react`" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:82 — registers `yargsListCommand` (`nx list`) |
| "`nx format:write` — This example is for built-in nx formatting with prettier" | command | verified | node_modules/nx/dist/src/command-line/format/command-object.js:17 — command `format:write`; package.json:46 pins `prettier ^3.9.10` as the workspace formatter |
| "For plugin generators: Use `node -e "console.log(require.resolve('@nx/<plugin>/generators.json'));"`" | command | verified | node_modules/@nx/js/generators.json — the installed `@nx/js` 23.3.0 (package.json:36) ships that manifest, so the resolve target exists |
| "nx run-many -t build,lint,test,typecheck" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:146-149 — the `targets` option aliased `t`, wired into `run-many` (node_modules/nx/dist/src/command-line/run-many/command-object.js:11) |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs and follow-up questions" | feature | verified | node_modules/nx/dist/src/command-line/import/utils/ai-output.js:3 — "AI Agent NDJSON Output Utilities for nx import"; :9-10 build the `NeedsOptions` and `NeedsPluginSelection` follow-up results |
| "`@nx/eslint` 23.3.0 peer-depends on `eslint@^9.0.0 \|\| ^10.0.0`, so ESLint 10 is supported" | config | verified | node_modules/@nx/eslint/package.json:76 — `"eslint": "^9.0.0 \|\| ^10.0.0"`; node_modules/eslint/package.json:3 resolves 10.13.0 |
| "The TS preset defaults (`module: "nodenext"`, `moduleResolution: "nodenext"`) are incompatible with frontend frameworks" | config | verified | tsconfig.json:18-19 — this workspace's root compilerOptions are `module: NodeNext` and `moduleResolution: NodeNext` |
| "the cryptic `Cannot read properties of undefined (reading 'version')` error comes from an ESLint 8 install" | status | verified | node_modules/@nx/eslint/dist/src/utils/versions.js:10 — `minSupportedEslintVersion = '9.0.0'`, so an ESLint 8 install is outside the supported range |
| "Then `npx nx add @nx/eslint` to register the plugin in `nx.json`" | command | verified | node_modules/nx/dist/src/command-line/add/command-object.js:7 — command `add <packageSpecifier>`; registered at node_modules/nx/dist/src/command-line/nx-commands.js:64 |
| "Run `npx nx reset` after any plugin config changes" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:89 — registers `yargsResetCommand` (`nx reset`) |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It detects **both** flat config files (`eslint.config.{js,mjs,cjs,ts,mts,cts}`) and legacy config files (`.eslintrc.{json,js,cjs,yml,yaml}`)" | feature | verified | node_modules/@nx/eslint/dist/src/utils/flat-config.js:6-12 — `eslintFlatConfigFilenames` lists `eslint.config.cjs`, `.js`, `.mjs`, `.cts`, `.ts`, `.mts` |
| "**Root cause**: `@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" | config | verified | node_modules/@nx/eslint/dist/src/utils/versions.js:15 — `eslintVersion = '^9.8.0'` |
| "options: { targetName: 'eslint:lint' }" | config | verified | node_modules/@nx/eslint/dist/src/generators/init/init.js:26 — the init generator writes the `eslint:lint` targetName, which the plugin reads at node_modules/@nx/eslint/dist/src/plugins/plugin.js:330 |
| "it registers the plugin and updates `namedInputs.production` to exclude ESLint config files" | feature | verified | node_modules/@nx/eslint/dist/src/generators/init/init.js:17-18 — pushes `!{projectRoot}/.eslintrc.json` and `!{projectRoot}/eslint.config.${format}` onto the production input set |
| "**Fix**: Upgrade `typescript-eslint` from `^7.0.0` to `^8.0.0`" | config | verified | node_modules/@nx/eslint/dist/src/utils/versions.js:16 — `typescriptESLintVersion = '^8.58.0'` |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | integration | unverifiable | `@nx/gradle` is not installed (node_modules/@nx holds only angular, devkit, eslint, js, playwright, web, workspace) and there is no `gradlew` at the workspace root — installing `@nx/gradle` would settle it |
| "If `@nx/gradle` is installed, run `nx show projects` to verify that Gradle projects are being inferred" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:13 — registers `showProjectsCommand`; :26 — example `$0 show projects` |
| "If you import an entire Gradle repository into a subfolder, files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | feature | unverifiable | the repository has neither `gradlew` nor a `gradle/` directory, so nothing here tests subfolder placement — an `nx import` of a Gradle repository would settle it |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project" | feature | unverifiable | `@nx/jest` is not installed (absent from node_modules/@nx) and the workspace has no jest config or jest dependency, testing with vitest instead (package.json:48) — installing `@nx/jest` 23.3.0 would settle it |
| "`npx nx add @nx/jest` does two things: 1. Registers `@nx/jest/plugin` in `nx.json` 2. Updates `namedInputs.production` to exclude test files" | command | unverifiable | the sibling `@nx/eslint` init does update the production input set (node_modules/@nx/eslint/dist/src/generators/init/init.js:17-18), but no `@nx/jest` generator ships in this checkout — reading `@nx/jest` 23.3.0's init generator would settle it |
| "**Gotcha**: `nx add @nx/jest` does NOT create `jest.preset.js`" | feature | unverifiable | would be settled by running `npx nx add @nx/jest` in a scratch workspace; no `@nx/jest` package or `jest.preset.js` exists here |
| "**Fix Order** ... `nx run-many -t test`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:146-149 — the `targets` option aliased `t`; node_modules/nx/dist/src/command-line/run-many/command-object.js:9 — command `run-many` |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx import /path/to/source apps/web --ref=main --source=. --no-interactive" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:12 — command `import [sourceRepository] [destinationDirectory]`; :26 `source` alias for `sourceDirectory`; :29 `ref`; :37 `interactive` |
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | feature | unverifiable | `@nx/next` is not installed (absent from node_modules/@nx) and no `next.config.*` exists in the workspace — installing `@nx/next` 23.3.0 would settle it |
| "**No separate typecheck target** — Next.js runs TypeScript checking as part of `next build`" | feature | unverifiable | this workspace has no Next.js project (no `next.config.*`, no `@nx/next` in package.json), so no target list can be inspected — `nx show project <app> --json` on a Next.js app would settle it |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run workspace validation (`nx run-many -t build lint test typecheck`) to confirm nothing broke" | command | verified | node_modules/nx/dist/src/command-line/run-many/command-object.js:9 — command `run-many`; node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:146-149 — `targets` aliased `t` |
| "Nx uses `package.json` `"exports"` + pnpm workspace linking instead of tsconfig `"paths"`" | config | verified | packages/ai-devtools-companion/package.json:7 — the workspace package declares `exports`, and tsconfig.json:14-19 declares no `paths` mapping |
| "The migration replaces Turborepo task orchestration with Nx targets" | status | verified | git 6927f70f — this line was rewritten by the correction commit "T003: Correct .commandcode/skills/nx-import/references/TURBOREPO.md (row 465)", whose log in .project/tasks/T003-correct-turborepo-md.md records the verify pass |
| "Delete all `turbo.json` files (root and per-package)" | config | unverifiable | no `turbo.json` exists anywhere in this repository (recursive search returns zero files), so the cleanup step is untested here — an `nx import` of a real Turborepo monorepo would settle it |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `"vite:typecheck"`" | config | unverifiable | `@nx/vite` is not installed (absent from node_modules/@nx) and no `vite.config.*` exists in the workspace — the `@nx/vite` 23.3.0 plugin schema would settle it |
| "`lint: eslint .` → `@nx/eslint/plugin` → `eslint:lint`" | integration | verified | node_modules/@nx/eslint/dist/src/generators/init/init.js:26 — the init generator writes the `eslint:lint` target name, read back by the plugin at node_modules/@nx/eslint/dist/src/plugins/plugin.js:330 |
| "**Vitest 3→4**: Usually works; type conflicts may surface in shared test utils." | config | unverifiable | the workspace already pins `vitest ^4.0.8` (package.json:48) with no Vitest 3 baseline present — a workspace upgraded from Vitest 3 would settle it |
| "Both `@nx/js/typescript` and `@nx/vite/plugin` auto-detect `vue-tsc` when installed — no manual config needed" | feature | unverifiable | there is no Vue project and no `@nx/vite` install in this workspace (package.json:36-48) — importing a Vue project with `vue-tsc` would settle it |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:82 — registers `yargsListCommand` (`nx list`) |
| "Install plugins `npx nx add <plugin>`. Example: `npx nx add @nx/react`." | command | verified | node_modules/nx/dist/src/command-line/add/command-object.js:7 — command `add <packageSpecifier>`, registered at node_modules/nx/dist/src/command-line/nx-commands.js:64 |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "You can check those via `nx show project <projectname> --json` ... It contains a `targets` section" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:28 — example `$0 show project [projectName]`; :19 — `json` option is "Output JSON." |
| "`nx run <project>:<task>`" | command | verified | node_modules/nx/dist/src/command-line/run/command-object.js:9 — command `run [project][:target][:configuration] [_..]` |
| "`--parallel` to control the number of parallel processes (default is 3)" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:64-65 — `parallel` option, "Max number of parallel processes [default is 3]." |
| "`nx affected -t test --base=main --head=HEAD`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:210 — `base` option; :215 — `head` option; `targets`/`t` at :146-149 |
| "`--skipNxCache` — rerun tasks even when results are cached" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:109 — `skipNxCache` option; `nxBail` at :95 |
| "`--configuration=<name>` — use a specific configuration (e.g. `production`)" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:157-160 — `configuration` option with alias `c` |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "You can read the full project schema at `node_modules/nx/schemas/project-schema.json`" | config | verified | node_modules/nx/schemas/project-schema.json — present in the installed Nx 23.3.0 package (node_modules/nx/package.json) |
| "You can read the full project schema at `node_modules/nx/schemas/nx-schema.json`" | config | verified | node_modules/nx/schemas/nx-schema.json — present, and it declares targetDefaults, namedInputs, plugins and generators |
| "`namedInputs` - Reusable input definitions for caching" | config | verified | node_modules/nx/schemas/nx-schema.json:1 — the schema carries the `namedInputs` section the skill lists |
| "Use `nx show projects` to list projects in the workspace" | command | verified | node_modules/nx/dist/src/command-line/show/projects.js:20 — Nx 23.3.0 parses `show projects` arguments in the installed package |
| "`nx show projects --withTarget build`" | command | verified | node_modules/nx/dist/src/command-line/show/projects.js:25 — `args.withTarget` is read by the show-projects command |
| "read the [affected projects reference](references/AFFECTED.md)" | structure | verified | .commandcode/skills/nx-workspace/references/AFFECTED.md — the reference file sits in the skill folder at the linked path |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Affected since base branch (auto-detected)" | command | verified | node_modules/nx/dist/src/command-line/show/projects.js:20 — `show projects` runs through the affected-args parser, so `--affected` is a real option of the installed Nx 23.3.0 |
| "`nx show projects --affected --uncommitted`" | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:18 — the installed Nx declares the `--uncommitted` option |
| "`nx show projects --affected --untracked`" | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:17 — the `--untracked` option is declared |
| "Affected with explicit base ... `--base=origin/main`" | command | unverifiable | the flag was not found in the three installed-nx files read; `node node_modules/nx/dist/bin/nx.js show projects --affected --base=origin/main` would settle it |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its `instances.json` is the registry both skills read" | integration | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:348 — `main(process.argv.slice(2), realDeps, loadRegistry)` loads the control-ai-browsers registry |
| "artifact `extension-panel.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:129 — the check writes `join(evidence, 'extension-panel.json')` |
| "`health-check.md` `health-doctor`" | structure | verified | .commandcode/skills/control-ai-browsers/features/health-check.md:9 — "`health-doctor` runs every check against one instance." |
| "an Angular dev page serving `spikes/ng222-app`'s `/stale-view-deferred` fixture route" | integration | verified | spikes/ng222-app/src/app/app.routes.ts:20 — path `stale-view-deferred` is registered to StaleViewDeferredFixture |
| "A rebuilt panel needs no restart (the browser reads the extension's pages from disk)" | feature | unverifiable | no file in the checkout records that measurement; re-running `checks/extension-panel.mjs --evidence <dir> --url <app>` after a panel rebuild would settle it |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "subscribers count while DevTools records, the removed one stops" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:3 — the check's header comment restates the same profiler part |
| "With `--di-graph` it runs `angular:di_graph` last and records whether the template node is lost" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:86 — `templateLostInPane: field(di, 'templateLostInPane') ?? null` |
| "artifact `{up.evidenceDir}/<file>` ... `coexist-result.json`" | structure | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:90 — the check writes `join(out, 'coexist-result.json')` |
| "`install --from` takes the harness copy already in the checkout" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:2237 — usage line `install [--browser test\|chrome\|chrome-beta\|edge\|edge-dev] [--from edge-dev\|edge\|chrome\|chrome-beta\|<dir>]` |
| "Not covered: the branded browsers (Chrome, Chrome Beta, Edge, Edge Dev)" | status | unverifiable | no control-angular-devtools feature file names a branded-browser install check; `node .commandcode/skills/control-angular-devtools/scripts/control.mjs status --browser chrome` would show whether one exists |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin 0.0.7 declared and installed" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:103 — `const PINNED = '0.0.7';` |
| "The setup steps need ports 3000 and 9999 free" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:104 `DEFAULT_PORT = 9999` and .commandcode/skills/control-angular-dev-app/scripts/control.mjs:101 `PORTAL_API_PORT = 3000` |
| "`call navigate` without `--confirm` is refused" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:537 — the refusal reads `refused: <tool> acts on the app; pass --confirm to run it ...` |
| "artifacts: `{up.evidenceDir}/contract-list.png` and `live-reads.json`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:188 — screenshot written as contract-list.png; the header at :11 names live-reads.json |
| "`tools/list` offers no action tool" | status | unverifiable | needs a live devtools server; `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs tools` after `up` would settle it |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node:test` suites are named `*.node.test.ts`" | config | verified | apps/angular-ai-devtools/src/app/interop-slice.node.test.ts and apps/angular-ai-devtools/src/app/interop-attribution.node.test.ts are the two suites in the app tree, and apps/angular-ai-devtools/project.json:121 excludes that pattern from the unit-test builder |
| "the Angular unit-test builder is pinned to include only `**/*.spec.ts`" | config | verified | apps/angular-ai-devtools/project.json:117-119 — the `test` target (`@angular/build:unit-test`) `include` array holds exactly `**/*.spec.ts` |
| "`tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | apps/angular-ai-devtools/tsconfig.spec.json:14 — the `exclude` array lists `src/**/*.node.test.ts` first (with `src/**/*.node.spec.ts` at :15) |
| "only `angular-new-app` should remain explicit-only (`disable-model-invocation: true`)" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\angular-new-app\SKILL.md:9 — `disable-model-invocation: true`; the `angular-developer` SKILL.md in the same skills tree has no such line (findstr returns no match) |
| "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | feature | unverifiable | No insurance-portal project is in this repository (apps/ holds only angular-ai-devtools and angular-ai-devtools-e2e), and `forms/signals` matches nothing under apps/; the portal clone's form imports would settle the migration half |
| "Never put a `node:test` suite under `*.spec.ts` — the builder compiles it and the app test target fails with TS2591" | status | unverifiable | The preventive config is present (apps/angular-ai-devtools/project.json:121, tsconfig.spec.json:14) but the TS2591 failure itself is a runtime observation; re-adding such a file and running `nx test angular-ai-devtools` would settle it |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "never 'blessed' or 'ordained' — and neither word may appear in DevTools code, UI or runtime text" | status | verified | A grep for `blessed\|ordained` outside .project/ matches only docs/ and plans/ (docs/feature-proposals.md:594 records the wording rule; plans/angular-ai-devtools-proposals.handoff.md:78 repeats it) — no occurrence under apps/, extension/, packages/ or src/ |
| "`provideAiDevTools()` not `provideAiDevtools()`" | config | verified | packages/ai-devtools-companion/src/index.ts:25 — `export function provideAiDevTools(): Provider[]`, and no `provideAiDevtools` spelling exists in the repository |
| "`provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | config | unverifiable | No code exports `provideAiNgrxDevTools` — the only occurrence is a plan (plans/angular-ai-devtools-proposals.handoff.md:81); a shipped NgRx secondary entry point in packages/ai-devtools-companion would settle the casing |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the page, content scripts, and service worker never host `LanguageModel`" | feature | verified | extension/agent-main.test.mjs:162-163 — asserts the MAIN-world script source contains no `LanguageModel`, and :275-289 asserts its messages carry none; extension/manifest.json:34-37 registers agent-main.js as the MAIN-world content script |
| "The MAIN-world script is limited to reading the page (`ng.ɵsetProfiler`, `ng.ɵgetSignalGraph`) and sending shaped facts to the panel" | feature | verified | extension/agent-main.js:87-89 feature-detects `ng.ɵgetSignalGraph`, :534-542 reads the graph and reports `ng.ɵgetSignalGraph not found` instead of writing to the page |
| "do not run Angular's `angular:di_graph` tool or call `getViewContainerRef()` on component hosts (which removes the template node from the signal graph)" | feature | verified | docs/filing-ledger.md:5 — records that the `angular:di_graph` tool creates a `ViewContainerRef` on every component host, after which `ng.ɵgetSignalGraph` loses the template consumer; no di_graph call exists under extension/ or src/ (only spikes/probes/s2b.js:43) |
| "Removing `panel/**` from `web_accessible_resources`" | config | verified | extension/manifest.json:1-57 — the MV3 manifest declares no `web_accessible_resources` key at all, so no `panel/**` entry is exposed |
| "Companion-package naming: `provideAiDevTools()` with per-package secondary entry points" | config | verified | packages/ai-devtools-companion/src/index.ts:25 — the companion package exports `provideAiDevTools()`; its package.json:6 describes it as the opt-in companion entry point |
| "the extension does not publish its own tools as WebMCP" | integration | verified | A case-insensitive grep for `webmcp` finds no match under extension/, src/, apps/ or packages/ — only the control-ai-browsers skill and .project docs mention it |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the configured npm global prefix is `C:\Users\LarsGyrupBrinkNielse\.local\bin` (`~/.npmrc` line 2)" | config | verified | C:\Users\LarsGyrupBrinkNielse\.npmrc:2 — `prefix=C:\Users\LarsGyrupBrinkNielse\.local\bin` |
| "start AI browser instances only through `control-ai-browsers up`, which adds the Edge sign-in and sync switches, never by launching `msedge.exe` or `pipe-keeper.mjs` by hand" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:816 — "the browser's `browserArgs` (on Edge: sign-in and sync ...)"; :838-839 records that Edge signs his Windows work account in when started without those switches |
| "Command Code mods follow a three-file layout in `~/.commandcode/mods/`: `{name}.ts` (source), `{name}.config.json` (config), and `{name}.README.md` (docs)" | structure | verified | A listing of C:\Users\LarsGyrupBrinkNielse\.commandcode\mods shows auto-retry-rate-limit.ts, auto-retry-rate-limit.config.json and auto-retry-rate-limit.README.md side by side (as do the auto-compact-context and taste-scope-auto-promote mods) |
| "Keep mod tests in a separate folder such as `~/.commandcode/mod-tests/`" | structure | verified | The same mods listing holds no `*.test.ts` (only .ts, .config.json and .README.md files), and C:\Users\LarsGyrupBrinkNielse\.commandcode\mod-tests\ exists beside it |
| "Uses `playwright-cli` (the `/playwright-cli` skill) for browser automation and verification" | integration | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\.playwright-cli-manifest.json is installed in the user-scope Command Code config, the install manifest of that skill |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gitignore `.playwright-cli/`" | config | verified | .gitignore:1 — the first line is `.playwright-cli/` |
| "Generated build artifacts (e.g. hashed JS/CSS outputs under `extension/panel/`) should be gitignored; only hand-maintained source/static entry files such as `index.html` and `favicon.ico` should remain tracked" | config | verified | .gitignore:27-30 ignores `extension/panel/*` with `!extension/panel/index.html` and `!extension/panel/favicon.ico`; `git ls-files extension/panel` returns exactly those two files |
| "AI browser verification should be run both with feature flags enabled and with `--no-ai-features` (e.g. `control-ai-browsers up <name> --no-ai-features`)" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2777 — `opts['no-ai-features'] === true ? [] : featuresFor(inst, backend)` drops the whole `--enable-features` switch, and :2774 documents the flag as the without-flags experiment launch |
| "shared project settings stay committed in `.commandcode/settings.json`, while personal/machine-specific config such as permission rules goes in a gitignored `.commandcode/settings.local.json`" | config | verified | .gitignore:20 — `.commandcode/settings.local.json` is ignored; `git ls-files .commandcode/settings.json` lists the shared settings file as tracked |
| "Keep `spikes/` and `research/` in the repository; do not archive them" | structure | verified | `git ls-files spikes research` returns 281 tracked files, so both trees are still versioned in place |
| "validates it programmatically" | command | unverifiable | The `check_docs_audit.py` validator named in the same sentence does not exist in the repository (a `**/check_docs_audit.py` glob returns nothing); the user-scope `~/.commandcode/scripts` tree would settle where it lives |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json — devDependencies.typescript is 6.0.3 |
| "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | config | verified | node_modules/nx/package.json — version 23.3.0, and node_modules/nx/dist/bin/nx.js is present |
| "`npm run gate:verification` (structure) runs inside `npm run check`" | command | verified | package.json — the scripts.check chain includes `npm run gate:verification` |
| "`toSignal(this.subject)` at line 14 and an unlabelled `effect` whose body calls `subject.error(...)` at line 22" | feature | verified | spikes/ng222-app/src/app/stale-view-fixture.ts:14 and :22 — both statements sit on the cited lines |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:14`)" | status | stale | apps/angular-ai-devtools/src/app/app.routes.ts:14 — line 14 is `const loadPanelDemo = () =>`; the `interop` route is declared at :23-27 |
| "after changing one, copy its `.commandcode` folder over the `.claude` one" | status | verified | .commandcode/skills/verify-ai-browsers/SKILL.md and its .claude copy are identical (15,326 bytes each), while .claude/skills/control-pangular-inspector/SKILL.md is 25,403 bytes against 25,586 in .commandcode |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | status | stale | .commandcode/skills/ holds seven of the eight folders; there is no `verify-angular-dev-app` folder in .commandcode/skills or .claude/skills |
| "Lars's rulings, verbatim: `docs/feature-proposals.md` section 8, \"Rulings from Lars\"" | structure | verified | docs/feature-proposals.md:1079 — heading "Rulings from Lars (2026-10-11 to 2026-10-12)" |
| "Research `research/00`-`10`" | structure | verified | research/ — files 00-browser-probe.md through 10-model-capabilities.md are present |
| "Spike S1 has run ... Its table is in `research/`" | status | verified | research/11-spike-s1-extension-contexts.md — present as the S1 record the proposals cite as "(11)" |
| "The `lars-create-control-skill` contract (`references/generated-skill.md`)" | structure | unverifiable | references/generated-skill.md is absent both at the repo root and under docs/; it lives in user scope, and no file in this checkout settles it |

## Doc: docs/autonomy-gaps.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pin: `scripts/autonomy-gaps.test.mjs` rule `G1`" | structure | verified | scripts/autonomy-gaps.test.mjs:145 — `test('G1 prompt pin: the orchestrator prompt forbids reading %ERRORLEVEL% ...')` |
| "rule `G2`" | structure | verified | scripts/autonomy-gaps.test.mjs:153 — `test('G2 prompt pin: the orchestrator prompt names the milestone event ...')` |
| "`tests 15` / `pass 15` / `fail 0`" | status | verified | scripts/autonomy-gaps.test.mjs — fifteen top-level `test(` declarations in the file (the run itself was not repeated here) |
| "`scripts/user-scope-autonomy.mjs` resolves the exact segments the pins read" | structure | verified | scripts/user-scope-autonomy.mjs — present at the named path |
| "Every user-scope edit it describes was made outside this checkout" | integration | unverifiable | the cited prompt path under `%USERPROFILE%\.commandcode\prompts\` is outside the repository; reading that installed prompt would settle each pin |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All tutor state is in `chrome.storage.local`, written by the panel" | feature | aspirational | extension/ and apps/angular-ai-devtools/src hold no `tutor:` storage key, and apps/angular-ai-devtools/src/app/app.routes.ts:17-171 declares no `tutor` route |
| "// key 'tutor:profile'" | feature | aspirational | the interface exists only in this design doc; no file under extension/ or apps/angular-ai-devtools/src defines `tutor:profile` |
| "2-3 options per answer set, chain depth 1, at most 2 wrong options" | feature | aspirational | no level model or option builder exists in extension/ or apps/angular-ai-devtools/src, so the level table describes unbuilt behaviour |
| "26 events, `profiler_types.ts:17-157`" | feature | unverifiable | Angular's `profiler_types.ts` is not in the checkout (node_modules/@angular/core ships compiled output only); reading the 22.2 source tree would settle the event count |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "N24. Zoneless stale-view finder" | feature | verified | .project/archive/011-n24-stale-view-finder — N24's shipped milestone archive |
| "N25. RxJS interop explainer" | feature | verified | .project/archive/012-n25-rxjs-interop-explainer — N25's shipped milestone archive |
| "Angular 22.2 in development mode" | config | verified | spikes/ng222-app/package.json and spikes/ng222-ssr/package.json — both declare `@angular/core` ^22.2.0 |
| "**Done (2026-10-12):** an uppercase letter in the tool name fails" | status | verified | research/raw/tool-name-matrix-gemma4-gpu.json:1 — getComponentCount and Get_component_count record `ERR UnknownError ... kErrorUnknown`; the lowercase variants record tool calls |
| "done with separate profiles under `.browsers/` on D:" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — one profile per model (chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338); .commandcode/worktrees/.browsers exists |
| "N27. Angular AI DevTools Tutor" | feature | aspirational | apps/angular-ai-devtools/src/app/app.routes.ts:17-171 — the panel route table has no tutor surface; only docs/design/tutor.md holds N27 |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.claude/skills/control-pangular-inspector/SKILL.md:172` (0.0.7 has no `list-components`; added in 20ebbb9; 46 tools with `--read-only`)" | status | stale | .claude/skills/control-pangular-inspector/SKILL.md:221,223 — those statements sit at :221-223 ("0.0.7 ... has no `list-components` tool", "lists 46 tools"); line 172 is the `install` row of the command table |
| "the spike app is `spikes/ng222-app` and the probe results are in `research/05-spikes.md`" | structure | verified | spikes/ng222-app and research/05-spikes.md are both present at the named paths |
| "Found 2026-10-19 in the no-flags worker spike (`research/20-built-in-ai-without-flags.md`, `workers`)" | structure | verified | research/20-built-in-ai-without-flags.md and research/raw/20-built-in-ai-without-flags.json are both present |
| "returns 46 tools without it" | status | unverifiable | needs the published 0.0.7 package served; `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs tools` against a live server would settle the count |
| "Nx 23.1.1, Angular 22.2.2, npm 11.16.0, Node 24.18.0" | config | unverifiable | this checkout installs Nx 23.3.0 (node_modules/nx/package.json) and holds no portal lockfile, so the portal's recorded versions cannot be confirmed from this repository |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`projectType: application`, `build-extension` → `extension/panel`, `baseHref: /panel/` ... 520 KB" | config | verified | apps/angular-ai-devtools/project.json:58,62,76,82 — output base `extension/panel`, baseHref `/panel/`, maximumWarning `520kb`, projectType `application` |
| "In-page UI is a named exception: plain DOM, closed Shadow DOM" | feature | verified | extension/overlay.js:61 — `host.attachShadow({ mode: 'closed' })` |
| "Generation 1 — twelve milestones, full ROADMAP entry format" | structure | verified | .project/archive/ — twelve milestone folders, 018-instrument-core through 029-trust-bypass-triage |
| "`tsc` over the panel and extension (M024)" | structure | verified | package.json — scripts.check:panel and scripts.check:extension both run `tsc -p` |
| "`debugger` permission granted" | status | unverifiable | extension/manifest.json — permissions are scripting, activeTab and storage only, so A7 is a policy grant recorded in .project/CHARTER.md rather than a manifest entry; the case this claim gates (M038) is settled only by a CDP trace |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — the five `port` fields match the list exactly |
| "The browser instance registry is `.claude/skills/control-ai-browsers/instances.json`" | structure | verified | .claude/skills/control-ai-browsers/instances.json — present, and string-identical to the .commandcode copy |
| "the eleventh, the `LanguageDetector`/`Translator` worker crash, is at `docs/filing-ledger.md:230`" | structure | stale | docs/filing-ledger.md:265 — the "## 11. Chromium (Blink>AI) ... crashes the renderer" heading sits at line 265; line 230 is a blank line inside item 7 |
| "**Deliverable:** `docs/feature-proposals.md`, about 1,100 lines" | structure | verified | docs/feature-proposals.md — 1,148 lines measured now, still "about 1,100" |
| "`spikes/probes/`: bench.js, regrade.mjs, arg-repair-replay.mjs" | structure | verified | spikes/probes/ — all three named files are present |
| "retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`" | status | verified | .project/archive/001-run-unrun-spikes — present; spikes/s1-extension itself is gone, as the retirement note says |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`" | status | verified | .project/archive/018-instrument-core — present |
| "This note describes the state before M018 shipped" | status | verified | .project/archive/ — 018 through 043 are archived, so the pipeline has long since left the state described |
| "Panel initial-bundle budget is **520 KB** (`project.json`, `build-extension`)" | config | verified | apps/angular-ai-devtools/project.json:82 — `maximumWarning: "520kb"` on the build-extension budget |
| "`workflow_run.py prepare-inspect` **refuses** ... because `.project/research/DOCS-AUDIT.md` exists" | status | verified | .project/research/DOCS-AUDIT.md — present, which is the precondition the note names |
| "Frozen inventory: **143 documents**" | status | unverifiable | .project/research/inspect-inventory.txt now holds 153 entries for the current inspection; the M018 count is not recorded anywhere else in the checkout |
| "`--base` must be a full 40-character SHA" | command | unverifiable | isolation.py is user-scope (~/.commandcode/skills/gsd-path/scripts/), not part of this checkout; reading it would settle the argument rule |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:253`" | config | stale | .commandcode/skills/verify-ai-browsers/checks/state.mjs:321 — the `timeout: 600000` line is at 321; line 253 is `const states = picked.map(...)` |
| "`timeoutMs` 1800000 for the `extension-panel` step" | config | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:49 — "artifact `extension-panel.json`; `timeoutMs` 1800000" |
| "`chrome-beta-nano` serves the same `v3Nano` model as `chrome-stable-nano`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — both entries declare model name `v3Nano` with contextWindow 9216 |
| "Ports 9333-9338 belong to the shared instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — the instance ports are 9333, 9334, 9335, 9337 and 9338 |
| "`verdict.mjs lint <verdict.json>` must exit 0" | command | unverifiable | the lars-verify scripts are not part of this checkout; running `verdict.mjs lint` on a fresh verdict file would settle it |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge Dev gets Aion as three separate components" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — the edge-dev-aion pin lists exactly EdgeLLMOnDeviceModel, EdgeLLMRuntime and EdgeOptimizationGuideModelsManifest |
| "`--disable-component-update` stays on" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion `args` is `["--disable-component-update"]` |
| "`model download` refuses on `edge-dev-aion` while the switch is on" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3854 — the download path branches on `switchesOf(inst).includes('--disable-component-update')` and points at the pin |
| "`.claude/skills/` holds a byte-identical copy of it, which `node --test scripts/skills-mirror.test.mjs` enforces" | structure | verified | control-ai-browsers/features/model-lifecycle.md is 9,764 bytes in both trees and string-identical; scripts/skills-mirror.test.mjs exists |
| "`model.contextWindow` 7168" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion `model.contextWindow` is 7168 |
| "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | config | unverifiable | no `2026.10.19.1` string appears anywhere in the control-ai-browsers skill or instances.json; doctor's `model.pin` row on the running instance would settle it |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js`" | structure | verified | spikes/probes/probe5.js:13 and spikes/probes/probe6.js:13 — both probes call create() with expectedOutputs [{type:'text'},{type:'tool-call'}], so they are tracked tool-calling probes |
| "`.browsers/chrome-beta-nano` — 9333 — `AIPromptAPIToolUse`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:68-75 — instance chrome-beta-nano has "port": 9333 and AIPromptAPIToolUse in its features |
| "Edge Dev 157 results (Aion) ... `contextWindow` = **7168 tokens**" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:161-166 — edge-dev-aion model Aion-1.1-Instruct declares "contextWindow": 7168 |
| "`spikes/probes/ep-trials.sh` sets the provider list in Aion's `genai_config.json` with `set-genai-provider.mjs`" | structure | verified | spikes/probes/ep-trials.sh:7 reads cfg="$model_dir/genai_config.json" and spikes/probes/set-genai-provider.mjs:2 documents usage node set-genai-provider.mjs <genai_config.json> <webgpu / qnn / cpu> |
| "The probe `spikes/probes/read-throughput.ps1` reads 1 GB sequentially in 4 MB blocks with `FILE_FLAG_NO_BUFFERING`" | structure | verified | spikes/probes/read-throughput.ps1:1 — header comment states it reads sequentially with the Windows file cache bypassed (FILE_FLAG_NO_BUFFERING) and prints MB/s |
| "The member is spelled **`callID`**: `callId` throws" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1941-1943 — comment "Chrome Beta 156 reads callID; Edge Dev 157.0.4329 requires callId", and LanguageModelToolSuccess is built with both members |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the shipped driver reads `c.callID ?? c.callId` (`control.mjs:1424-1430`)" | structure | stale | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1421-1428 is the pin-validation refuse() path, not the tool driver; the expression sits at control.mjs:1938, so the cited line range has moved |
| "Angular has experimental WebMCP support: `provideExperimentalWebMcpTools([...])` from `@angular/core`" | integration | verified | node_modules/@angular/core/types/core.d.ts:9674 — declare function provideExperimentalWebMcpTools<const InputSchema extends JsonSchemaForInference>(tools: ToolDescriptor<InputSchema>[]): EnvironmentProviders |
| "`gemma4-2b-it` ... `contextWindow` 9216" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:123-128 — chrome-beta-gemma4 model name gemma4-2b-it with "contextWindow": 9216 |
| "with `--enable-features=AIPromptAPIToolUse` alone, Nano gets tool sessions but answered in text, with no tool call" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:75 and :95 — chrome-beta-nano carries AIPromptAPIToolUse yet sets "toolCanary": false, while the Gemma 4 and Aion instances set it true |
| "Chrome ships the Prompt API in **extensions since Chrome 138**" | status | unverifiable | No repository artifact pins that ship version: extension/manifest.json:1-25 declares no minimum_chrome_version and no aiLanguageModelOriginTrial permission; a Chrome 138 release note or the Chrome extensions docs would settle it |
| "`devtools_page` ... `ExtensionView.ts` creates the panel iframe with allow=\"language-model; summarizer; translator; ...\"" | integration | unverifiable | DevTools frontend source is not vendored here (no devtools-frontend tree in the repo), so the allow list cannot be read locally; reading front_end/panels/common/ExtensionView.ts upstream would settle it |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`enableProfiling` ... Routes Angular profiler + DI profiler events to the Chrome Performance panel (custom tracks)" | feature | verified | node_modules/@angular/core/types/core.d.ts:7252 declares enableProfiling(): void, and :8799 lists it in the published global-utils interface |
| "`ɵgetSignalGraph`: `(injector: Injector) => DebugSignalGraph`" | feature | verified | node_modules/@angular/core/types/core.d.ts:8784 — ɵgetSignalGraph(injector: Injector): DebugSignalGraph |
| "`ɵgetTransferState`: `(injector: Injector) => Record<string, unknown>`" | feature | verified | node_modules/@angular/core/types/core.d.ts:8786 — ɵgetTransferState(injector: Injector): Record<string, unknown> |
| "`ɵgetLoadedRoutes` ... `route._loadedRoutes` (lazy children). Only with `provideRouter`" | feature | verified | node_modules/@angular/core/types/core.d.ts:8737-8739 — the three router globals ɵgetLoadedRoutes, ɵnavigateByUrl and ɵgetRouterInstance are published in the same interface, which is the router-only block |
| "Paths below are relative to ... `D:\projects\github\angular\angular` on branch `22.2.x`" | status | unverifiable | The Angular 22.2 tree is not in this repository: package.json:54 pins "@angular/core": "~22.1.0" (installed 22.1.8) and no 22.2 source is vendored; reading that clone's packages/core/src/render3/util/global_utils.ts would settle the file:line citations |
| "`getComponent` ... Component instance whose host is `element`, else `null`. @publicApi" | feature | verified | node_modules/@angular/core/types/core.d.ts:9676 export list carries getComponent and getContext; the published typings confirm the name is a public core export |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "package `@pangular-inspector/devtools` 0.0.7 ... last commit `76c09d0` (2026-10-11)" | status | verified | docs/filing-ledger.md:63 — "@pangular-inspector/devtools 0.0.7 (npm), source read at clone commit 76c09d0" |
| "Devframe serves it as embedded panel, standalone CLI (`pangular`), static HTML report, MCP server and Chrome DevTools extension" | command | verified | docs/filing-ledger.md:70-71 — npx pangular mcp --root . and npx pangular mcp --root apps/insurance-portal are the recorded CLI invocations |
| "`rg` over `packages/devtools/src` ... lists these Angular APIs: ... `ɵgetSignalGraph`, `ɵgetRouterInstance`, `ɵgetControlFlowBlocks`" | feature | verified | node_modules/@angular/core/types/core.d.ts:8737-8786 — those names are published in the core global-utils interface (ɵgetSignalGraph at :8784, ɵgetControlFlowBlocks at :8785) |
| "Peer range Angular 20+, Node 22+" | config | unverifiable | Neither the clone nor a pangular package manifest is in this repository (no @pangular-inspector entry in package.json); pangular-inspector's introduction.md or the published package.json engines/peerDependencies would settle it |
| "Maintainers Erkam Yaman and Santosh Yadav" | status | unverifiable | No repository file names the maintainers; the pangular README or npm registry metadata would settle it |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Docs observed: vitest.dev/guide/browser (header v5.0.3)" | status | stale | package.json:48 pins "vitest": "^4.0.8" and node_modules/vitest/package.json:4 reads 4.1.12 — the Browser Mode guidance was read from v5 docs, one major ahead of the vitest this workspace runs |
| "`window.__REDUX_DEVTOOLS_EXTENSION__` is read in a provider factory, `createReduxDevtoolsExtension()`, `modules/store-devtools/src/provide-store-devtools.ts:34-45`" | integration | unverifiable | No NgRx package is installed or pinned here (package.json:27-59 lists no @ngrx entry), so the file cannot be read locally; NgRx 22.0.0 modules/store-devtools/src/provide-store-devtools.ts would settle it |
| "the dropped-in test file: `vitest-browser-angular` `render(Component, {inputs, componentProviders, baseElement})`" | integration | unverifiable | vitest-browser-angular is not a dependency of this workspace (package.json:27-49) and node_modules holds no such package; the published package's render signature would settle the option names |
| "`test.browser.enabled`, provider, instances" | config | unverifiable | The installed vitest 4.1.12 is pinned (package.json:48, node_modules/vitest/package.json:4) but its browser provider config types were not read in this audit; node_modules/vitest/browser config typings for 4.1.12 would settle the exact keys |
| "`@rx-angular/state` peer dep `@angular/core ^21.0.0` ... so Angular 22.2 compatibility must be checked" | integration | unverifiable | RxAngular is not a dependency here (package.json:27-59), so the peer range cannot be read locally; @rx-angular/state's published package.json peerDependencies would settle it |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All four per-model instances verified healthy via `control-ai-browsers doctor` (exit 0)" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4238 registers the doctor subcommand, :4268 lists it in the usage string, and :3612 returns { ok, backend, checks } |
| "A component `app-counter` (`src/app/counter.ts`) has `title = input()`, `count = signal(3)`, `double = computed(count * 2)`" | structure | verified | spikes/ng222-app/src/app/counter.ts:16-18 — readonly title = input('Counter'); readonly count = signal(3); readonly double = computed(() => this.count() * 2) |
| "`Router` token present in environment injector (index 2); `ng.ɵgetRouterInstance()` returns instance with url `/`" | status | verified | research/raw/s16-meta-lookup.json:16 records "present in environment injector (index 2); instance url '/'" and :18 the works-with-degradation reason |
| "A draft upstream report is in `docs/filing-ledger.md`" | structure | verified | docs/filing-ledger.md:5 and :11 document the angular:di_graph ViewContainerRef side effect on ng.ɵgetSignalGraph, matching the finding |
| "the probe (`spikes/probes/portal-probe.js`) ran in Edge Dev, read `window.ng` on five routes and navigated with `ng.ɵgetRouterInstance(...).navigateByUrl`" | command | verified | spikes/probes/portal-probe.js:8 — router?.navigateByUrl(p) is the navigation call inside the probe |
| "The two descriptions are 1,318 and 1,390 characters" | feature | unverifiable | Angular's packages/core/src/debug/ai/di_graph.ts is not vendored in this repository; reading that file's tool descriptions (or re-running the discovery dispatch) would settle the two lengths |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the skills target v22.x (`@Service()` decorator, `di-fundamentals.md:16-31`)" | feature | verified | node_modules/@angular/core/types/core.d.ts:1322 — declare const Service: ServiceDecorator, i.e. the @Service decorator the corpus teaches exists in the installed Angular 22.x |
| "`ng mcp` tools: `get_best_practices`, `onpush_zoneless_migration`, `search_documentation`, `list_projects`, `ai_tutor`" | command | unverifiable | Only one of the five is corroborated here — docs/feature-proposals.md:689 names the CLI MCP server's onpush_zoneless_migration tool — and no CLI MCP manifest or `ng mcp` output is recorded; angular/skills references/mcp.md or `ng mcp --help` would settle the list |
| "`angular-aria.md`, 18433 bytes, `@angular/aria` headless directives (accordion, listbox, combobox, menu, tabs, toolbar, tree, grid)" | integration | unverifiable | @angular/aria is not installed in this workspace (absent from node_modules/@angular and from package.json:27-59), so the directive list cannot be read locally; the package's public-api typings would settle it |
| "whole reference corpus is 135,754 bytes (measured, `wc -c`)" | structure | unverifiable | The angular/skills clone is not in this repository, so the corpus size cannot be recounted; `wc -c` over `D:\projects\github\angular\skills` at commit 747c3c2 would settle it |
| "Repo shape (measured): 2 skills, 37 reference files, README, BUILD_INFO" | structure | unverifiable | Same missing clone: no angular-developer or angular-new-app skill tree is tracked here (.commandcode/skills holds nx-*, control-* and verify-* skills only); listing that clone would settle the counts |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The context budget is small and fixed per session: 7,168 (Aion) to 9,216 (Gemma 4, Nano) tokens" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:94 (chrome-beta-nano 9216), :128 (gemma4 9216) and :166 (edge-dev-aion 7168) record exactly those windows |
| "the hard rule is lowercase names, because an uppercase letter crashes Gemma 4; snake_case is recommended for readability" | feature | verified | research/raw/tool-name-matrix-gemma4-gpu.json — get_component_count and getcomponentcount returned tool calls, while getComponentCount and Get_component_count both returned ERR UnknownError kErrorUnknown |
| "**No empty schemas:** a tool that needs no input gets `scope: {type:'string', enum:['page']}`" | feature | stale | research/raw/tool-name-matrix-gemma4-gpu.json — the "snake_case + empty properties" variant returned "tool-call get_component_count({})", so an empty properties schema does not fail on Gemma 4 GPU |
| "Aion has no model card [measured: HF API search for Microsoft \"aion\" returned []]" | status | unverifiable | No Aion model card or Hugging Face snapshot is tracked in this repository; repeating the HF API search or reading the model card would settle it |
| "Chrome's Gemma 4 runtime contains llguidance constrained-decoding code for tool calls (B3)" | feature | unverifiable | The Chrome Beta binary is outside the repository and no tracked artifact records an llguidance string; reading strings from optimization_guide_internal.dll (B3) would settle it |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "**v22**: stable `resource`, `rxResource`, `httpResource`, Signal Forms, Angular Aria, `@Service`, `injectAsync`, `debounced`" | feature | verified | node_modules/@angular/core/types/core.d.ts:1322 (declare const Service: ServiceDecorator), :802 (declare function injectAsync) and :9544 (declare function debounced) carry those v22 APIs in the installed 22.1.8 typings |
| "`resourceFromSnapshots`/`ResourceSnapshot` experimental in 21.2" | feature | verified | node_modules/@angular/core/types/core.d.ts:9553 — declare function resourceFromSnapshots<T>(source: () => ResourceSnapshot<T>): Resource<T> |
| "`ChangeDetectionStrategy.Eager` stable and `Default` deprecated in 21.2" | feature | verified | node_modules/@angular/core/types/core.d.ts:3110 — the checkNoChanges docs name ChangeDetectionStrategy.Eager, so the member exists in the installed typings (stability itself is not visible there) |
| "`/releases/insights/22/mcp` ... 'No new MCP server features were released in Angular 22'" | status | unverifiable | angular.courses is not mirrored in this repository; re-reading that page or the Angular 22 release notes would settle the statement |
| "Angular \"Can I Use\": 226 features with status per version (experimental, developer preview, stable, deprecated, removed)" | status | unverifiable | The site's feature table is not captured anywhere in the repository; re-reading https://www.angular.courses/caniuse?tab=features would settle the count of 226 |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured behaviour: `05-spikes.md`, section \"Root cause hunt\" (Chrome Beta 156.0.8078.17, Nano profile serving `v3Nano`)" | status | stale | research/05-spikes.md:131 holds the "Root cause hunt" section, but the registry has moved on: .commandcode/skills/control-ai-browsers/SKILL.md:22 lists chrome-beta-nano as Chrome Beta 157, and :398 records the class reading 2 on 156 as a past measurement |
| "Every case the probe measured is explained by it: tool types only, `tool-call` out only, `tool-response` in only, and `tools` plus tool types" | feature | verified | spikes/probes/tool-session-matrix.js:12-19 defines exactly those variants — textEn, toolTypesOnly, toolCallOutOnly, toolsAndTypes, toolsAndTypesNoLang, toolsAndTypesSystem |
| "`kPromptAPIToolUseChoices` sets `--enable-features=AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:104-109 lists that same feature trio on the chrome-beta-gemma4 instance |
| "The message is `kExceptionMessageUnableToCreateSession` in `third_party/blink/renderer/modules/ai/exception_helpers.cc#L68-L70`" | feature | unverifiable | Chromium source is not vendored in this repository; fetching exception_helpers.cc at tag 156.0.8078.17 would settle the symbol and the line range |
| "`ModelClient`'s constructor adds `kToolUse` to every model's capabilities without condition" | feature | unverifiable | The cited file, components/optimization_guide/core/model_execution/model_broker_client.cc, is outside this repository and absent from node_modules; reading it at the pinned ref would settle it |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/probes/bench.js:64` grades ... with a whole-word `\bdouble\b` / `\bcount\b` test" | status | verified | spikes/probes/bench.js:64 — the dependency question's ok is `(a) => /\bdouble\b/i.test(a) && /\bcount\b/i.test(a.replace(/app-counter/gi, ''))` |
| "the grader was changed in `9c1b585`" | status | verified | git log 9c1b585a — "fix(spikes): stop the benchmark grader matching app-counter as count" |
| "`916fc09` requires the answer to name `double` and give `count` as its dependency" | status | verified | git log 916fc09b — "fix(spikes): require the dependency answer to name double, and regrade saved runs"; bench.js:64 is that check |
| "`spikes/probes/regrade.mjs` regrades saved runs without rerunning a model" | command | verified | spikes/probes/regrade.mjs:1 — header comment says it regrades saved bench.js results with the current check, without rerunning any model |
| "Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335, Phi-4-mini on 9337" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173 — v3Nano 9333, gemma4-2b-it 9334, Aion-1.1-Instruct 9335, Phi-4-mini-instruct 9337 |
| "05's harness reports 3/5 and 13/15" | status | verified | research/raw/bench/nano-gpu.json — fallback passHatK 3/5 and runPasses 13/15, the pre-regrade figures the doc labels as reported |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome Beta `156.0.8078.17` on port 9341, Edge Dev `157.0.4322.0` on port 9342" | config | verified | research/s1-results/chrome-fresh.json — port 9341, version Chrome/156.0.8078.17; research/s1-results/edge-fresh.json — port 9342, version Edg/157.0.4322.0 |
| "`adkapcgoeebpdmbepbdjmbhfknkcllcc` in both browsers for this checkout" | config | verified | research/s1-results/chrome-fresh.json and research/s1-results/edge-fresh.json — extensionId is adkapcgoeebpdmbepbdjmbhfknkcllcc in both runs |
| "`Extensions.loadUnpacked` works over `--remote-debugging-port`; the pipe is not needed" | feature | verified | research/s1-results/chrome-fresh.json:steps.loadUnpacked — the recorded step text is Extensions.loadUnpacked over --remote-debugging-port, and the run produced an extension id |
| "`probe5.js:15-16` ... `getComponentCount` and `getComponentInputs`" | structure | verified | spikes/probes/probe5.js:15-16 — the tools array declares exactly getComponentCount and getComponentInputs |
| "`create()` throws `NotAllowedError: Access denied because the Permission Policy is not enabled.`" | feature | verified | research/s1-results/chrome-gemma4.json:roundTrips.devtools_page — createWhenUnavailableError carries that text with permissionsPolicyAllowsLanguageModel false |
| "`spikes/s1-extension/` (retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`)" | structure | verified | spikes/s1-extension is absent from the tree, and .project/archive/001-run-unrun-spikes/ holds the archived plan, research and tasks folders |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "unminified, 968 `ngDevMode` references" | status | stale | spikes/ng222-app/dist/ng222-app/browser/main.js — the current build holds 1029 ngDevMode matches on 634 lines (32194 lines total), not 968; the file is git-ignored (spikes/ng222-app/.gitignore:4) and was rewritten 2026-11-06, after the note |
| "`spike main.js:37258-37267`" | structure | stale | spikes/ng222-app/dist/ng222-app/browser/main.js — the file has 32194 lines, so line 37258 does not exist; setClassDebugInfo occurs 15 times in the current build, so the cited line numbers describe a build that is gone |
| "`filePath: "src/app/counter.ts", lineNumber: 15`" | feature | verified | spikes/ng222-app/src/app/counter.ts:15 — `export class Counter` sits on exactly line 15, the line the debug info names |
| "`title` is a signal `input()`" | feature | verified | spikes/ng222-app/src/app/counter.ts:16 — `readonly title = input('Counter')`, so the decorator kind alone cannot tell `@Input` from `input()` |
| "`() => []` for `Counter`, which uses `inject()`" | feature | verified | spikes/ng222-app/src/app/counter.ts:1,19 — `inject` is imported and `CartService` is taken through `inject(CartService)`, so the constructor has no parameters |
| "`Standalone[_AppComponent]`, then "Environment Injector", then `null`" | integration | verified | research/raw/zone-mode-portal.json — zoneGlobal true and the zoneTokens sources are "ref: <Node>", "Standalone[_AppComponent]", "Environment Injector" and null |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The Reactive Forms search above now finds nothing (exit 1)" | status | verified | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools — a search over apps/ and libs/ for ReactiveFormsModule returns 0 hits at branch claude/ai-devtools-spike |
| "`@angular/forms/signals` appears in 7 files" | status | verified | the same portal checkout — exactly 7 files under apps/ and libs/ reference @angular/forms/signals |
| "`apps/insurance-portal/project.json:18` `"polyfills": ["zone.js"]`" | config | stale | the portal's apps/insurance-portal/project.json holds no polyfills key and no zone.js string; a search for either term returns only the two executor lines |
| "The app builds with `@angular/build:application` and serves with `@angular/build:dev-server` (`apps/insurance-portal/project.json:10,53`)" | config | stale | the portal's apps/insurance-portal/project.json:10,52 — @angular/build:application is line 10 and @angular/build:dev-server is line 52; line 53 is defaultConfiguration, not the dev-server executor |
| "The app is zoneless (`NgZone` provider is `NoopNgZone`, `research/raw/zone-mode-portal.json`)" | status | verified | research/raw/zone-mode-portal.json — the recorded zone state names NoopNgZone and sets zoneGlobal true |
| "Two optimus-ui incompatibilities are drafted in `docs/filing-ledger.md` (6 and 7)" | structure | verified | docs/filing-ledger.md:189,219 — sections 6 and 7 are both titled for openng-org/optimus-ui, one on pTextarea under Signal Forms and one on BaseInput type-check |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "21 fit as is, 11 fit if reduced, 45 do not fit, 62 are already covered by the proposals" | status | verified | a recount of the judgement markers in research/14-ai-devtools-prior-art.md gives 22 Fits as is, 12 Fits if reduced, 46 Does not fit and 63 Already covered; removing the one legend line that carries all four markers leaves exactly 21, 11, 45 and 62, total 139 |
| "at a 7,168 (Aion) to 9,216 (Gemma 4, Nano, Phi-4-mini) token context window" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:166 — Aion contextWindow 7168; :94,128,194,225 — 9216 for v3Nano, gemma4-2b-it, Phi-4-mini-instruct and the Chrome stable Nano |
| "local clone `D:\projects\github\angular\angular` at `5db6fc4453` ... branch `22.2.x`" | structure | verified | git -C D:\projects\github\angular\angular rev-parse — HEAD is 5db6fc4453 on branch 22.2.x |
| "local clone `D:\projects\github\angular\angular-cli` at `5584a589a` (2026-07-10, branch `22.0.x`)" | structure | verified | git -C D:\projects\github\angular\angular-cli rev-parse — HEAD is 5584a589a on branch 22.0.x; packages/angular/cli/src/commands/mcp/tools holds ai-tutor.ts, best-practices.ts, doc-search.ts, projects.ts, run-target and devserver/ |
| "`Annotations` (experimental since 22.2): `readOnlyHint`, `untrustedContentHint`, `consequentialHint`, all optional booleans" | structure | verified | packages/core/src/webmcp/types.ts:62-84 in the Angular clone — @experimental 22.2, then interface Annotations with those three optional boolean members and no debugging hint |
| "`declareExperimentalWebMcpTool` returns at once under SSR, reads `document.modelContext ?? navigator.modelContext`, and does nothing unless `registerTool` is a function" | feature | verified | packages/core/src/webmcp/declare_tool.ts:36,40-41,46 — the ngServerMode early return, the document-then-navigator lookup and the typeof registerTool guard against DOM clobbering |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "107 nodes, 171 edges" | structure | verified | research/raw/tosignal-node-portal.json — the double-encoded probe record decodes to a graph with nodes 107 and edges 171 for the /claim/create component |
| "`LanguageDetector.availability()` and `Translator.availability()` crash the extension renderer" | integration | verified | docs/filing-ledger.md:265 — section 11 is titled "Chromium (Blink>AI): LanguageDetector.availability() or Translator.availability() in a dedicated worker crashes the renderer" |
| "`node .claude/skills/control-ai-browsers/scripts/control.mjs attach chrome-beta-gemma4`" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs exists, and .commandcode/skills/control-ai-browsers/instances.json:99 defines the chrome-beta-gemma4 instance the command attaches to |
| "Every `getSignalGraph` node carries `epoch` (02 section 1.2, `debug_signal_graph.ts:68-96`)" | feature | unverifiable | no debug_signal_graph.ts exists under src/main-world or anywhere in the tree, the Angular clone has no packages/core/src/debug/debug_signal_graph.ts, and a repo-wide search for epoch in .ts files hits only the control-angular-dev-app skill's ng-inspect.js; naming the file that now holds the epoch field would settle it |
| "a worker started by the DevTools panel has all seven APIs" | feature | verified | research/raw/20-built-in-ai-without-flags.json — workers.panelWorker's first staged run lists LanguageModel, Summarizer, Writer, Rewriter, Proofreader, LanguageDetector and Translator as functions, and the availability probes answer for each |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "On a clean `/`, 34 nodes under `<body>` carry it, all `{status: "hydrated"}`" | feature | verified | research/raw/ssr-hydration.json — the result for path / has hydrationInfo.byStatus of exactly {hydrated: 34} |
| "Counters on `ngDevMode` (a page global)" | status | verified | research/raw/ssr-hydration.json — the / result records hydratedNodes 40, hydratedComponents 4, dehydratedViewsRemoved 0, dehydratedViewsCleanupRuns 1, componentsSkippedHydration 0, deferBlocksWithIncrementalHydration 1, the values the doc's table prints for / |
| "On `/` it returns one key, a 64-hex-character hash, holding the transfer cache entry `{b, h, s, st, u, rt}`" | feature | verified | research/raw/ssr-transfer.json — the / result's single ngGetTransferState key is a 64-hex hash whose fields are b, h, s, st, u, rt, with u "/api/items", s 200, st "OK" and rt "json" |
| "With `?transfer=0` the entry is absent and getTransferState returns `{}`; on `/client` there is no `ng-state` script and it returns `{}`" | feature | verified | research/raw/ssr-transfer.json — /?transfer=0 records ngGetTransferState {} and /client records ngStateScriptPresent false with ngGetTransferState {} |
| "Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client` `RenderMode.Client`" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 — the three serverRoutes entries declare path '', 'prerender' and 'client' with exactly those render modes |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`vitest` 5.0.3 ... `@vitest/browser` 5.0.3, `@vitest/browser-playwright` 5.0.3, `playwright` 1.63.0, `vitest-browser-angular` 0.5.1" | config | verified | spikes/ng222-app/package.json — devDependencies pin vitest 5.0.3, @vitest/browser 5.0.3, @vitest/browser-playwright 5.0.3, playwright 1.63.0 and vitest-browser-angular 0.5.1 |
| "`angular.json` `test`: options `runnerConfig: true`; configurations `headless` (default, `browsers: ["ChromiumHeadless"]`), `attach` (`vitest-attach.config.mts`) and `extension` (`vitest-extension.config.mts`)" | config | verified | spikes/ng222-app/angular.json — the test target runs @angular/build:unit-test with options.runnerConfig true, defaultConfiguration headless, and both .mts config files exist in the fixture |
| "`window.ng` exists in the tester iframe with 23 functions" | feature | verified | research/raw/vitest-attach-gemma4.json — iframeMount.ngKeys holds exactly 23 entries, from applyChanges and getComponent through toggleWatchSignal and the internal get* helpers |
| "`LanguageModel` answered "OK" from inside the tester iframe" | feature | verified | research/raw/vitest-attach-gemma4.json — iframePrompt records availability available, contextWindow 9216, answer "OK", ms 10771, the 10.8 s the table quotes |
| "`ng.getComponent`: `_Counter` (the build's class name), `count` 3, `double` 6, `title` "Clicks"" | feature | verified | research/raw/vitest-attach-gemma4.json — rootComponents is ["_Counter"] and the component record holds count 3, double 6, title "Clicks", countIsSignal true |
| "Orchestrator: `http://127.0.0.1:<port>/__vitest_test__/?sessionId=<uuid>`" | config | verified | research/raw/vitest-attach-gemma4.json — orchestratorUrl is http://127.0.0.1:51316/__vitest_test__/?sessionId=…, and the iframe target carries iframeId=__vitest_all__ with name vitest-iframe |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the `control-ai-browsers` skill relies on the `ms*` switches alone (`.commandcode/skills/control-ai-browsers/SKILL.md:311-312`)" | config | stale | .commandcode/skills/control-ai-browsers/SKILL.md:311-312 — those lines are the "## Gotchas" heading and the "Measured 2026-10-11/12 unless marked inferred" labels line; the statement that the switches are the Edge browsers' browserArgs sits at :314-316 |
| "the subset `msImplicitSignin,msProfileSignIn,msEdgeOSAccountInfoSubstrate,msPrimaryOSAccountInfoCache,msEdgeOSAccountInfoManagerCache` is what gates implicit profile sign-in" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:32,51 — the Edge --disable-features argument carries all five of those names inside a longer list |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "DevTools panel page \| works, create 4.3 s" | status | verified | research/raw/19-languagemodel-contexts.json — the chrome-beta-nano panel record holds hasLM true, availability available, createMs 4292 and answer "OK.", which is the 4.3 s row |
| "Hidden `devtools.html` page \| refused" | feature | verified | research/raw/19-languagemodel-contexts.json — devtoolsPage records availability unavailable with error "Access denied because the Permission Policy is not enabled." |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | integration | verified | apps/angular-ai-devtools/src/app/extension-prompt.service.ts:38-39,57 — languageModel() returns globalThis.LanguageModel and the service calls it directly, with no runtime messaging or postMessage path in the file |
| "recorded in plans/prompt-api-browser-pairs.afk.md" | structure | verified | plans/prompt-api-browser-pairs.afk.md exists in the repository; the frozen inventory lists only the three other plans files, so this record is newer than the inventory |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`control-ai-browsers up <name> --no-ai-features`, which keeps only the Edge sign-in and sync switches" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2774-2777 — the flag selects an empty --enable-features list, leaving the instance's other browserArgs (the Edge sign-in and sync switches) in place |
| "cannot start one: `Worker` and `SharedWorker` are undefined (Chrome 156)" | feature | verified | research/raw/20-built-in-ai-without-flags.json — workers.serviceWorkerCanStartWorkers records both Worker and SharedWorker as "undefined" for chrome-stable-nano, edge-phi4mini and edge-dev-aion |
| "Chrome 156 (Nano) and Chrome Beta 157 (Nano, Gemma 4) ... Edge 155 (Phi-4-mini) and Edge Dev 157 (Aion)" | config | verified | research/raw/20-built-in-ai-without-flags.json — results holds exactly the five instance keys chrome-beta-nano, chrome-beta-gemma4, chrome-stable-nano, edge-phi4mini and edge-dev-aion |
| "Dedicated worker started by the DevTools panel" | feature | verified | research/raw/20-built-in-ai-without-flags.json — workers.panelWorker's chrome-stable-nano record lists LanguageModel, Summarizer, Writer, Rewriter, Proofreader, LanguageDetector and Translator, and the prompt answers OK |
| "Filing draft: `docs/filing-ledger.md` item 11" | integration | verified | docs/filing-ledger.md:265 — item 11 is the Chromium Blink>AI entry for LanguageDetector.availability() or Translator.availability() in a dedicated worker crashing the renderer |

## Doc: research/spikes/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Six documents written on 2026-11-08 for the owner's question recorded as Q4" | status | verified | research/spikes/ — six answer/analysis files beside this README, committed by 2c0d47d8 ("research: record the S11, S12 and S13 spike answers and the Q1-Q4 queue"), git log -1 --format=%ci = 2026-11-08 23:42:35 +0100 |
| "for the owner's question recorded as Q4 in `plans/angular-ai-devtools-program-backlog.md`" | structure | verified | plans/angular-ai-devtools-program-backlog.md:400 — "### Q4 — spike: sourcemap plus a worker-side AST index, for code insight with no opt-in" |
| "that file is 3,352 bytes here and was 3,353 before `git add`" | status | verified | research/spikes/s11-answer.md is 3352 bytes on disk (Get-ChildItem research/spikes) |
| "this repository carries `* text=auto eol=lf`" | config | verified | .gitattributes:1 — `* text=auto eol=lf`, the only line in the file |
| "the active research directory must list nothing but a byte-identical copy of the archived audit" | status | verified | git ls-tree 02bba9d28a55e4a639aeac2a17ab36660fbdad4f .project/research/ — the single tracked entry is .project/research/DOCS-AUDIT.md (inspect-inventory.txt and parts/ are untracked inspect-run artefacts) |
| "`archive_milestone.py` enforces that (`require_clean_active_root`, 'pending DOCS-AUDIT rulings lack an exact active carry-forward copy')" | feature | unverifiable | no archive_milestone.py anywhere in the tree: git ls-files "*.py" returns only .project/archive/036-resource-lifecycle/plan/t8last.py, and findstr /s for require_clean_active_root over *.py finds nothing; the harness script that owns that guard would settle it |

## Doc: research/spikes/capability-dependency-matrix.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`versionOlderThan(detectedVersion, 22, 1, 3)` -> 'Angular ' + detectedVersion + ' is not supported; requires 22.1.3 or newer'" | config | verified | extension/agent-main.js:511 calls versionOlderThan(detectedVersion, 22, 1, 3) and :516 emits " is not supported; requires 22.1.3 or newer" |
| "`ext/stale-view-worker.js:12` — `const SUPPORTED_MIN = { major: 22, minor: 1, patch: 3 };`" | config | verified | extension/stale-view-worker.js:12 — const SUPPORTED_MIN = { major: 22, minor: 1, patch: 3 }; the comparison runs at :33-38 |
| "'0.2202.0', the companion version both realms accept" | config | verified | extension/agent-main.js:182 COMPANION_ACCEPTED_VERSION = '0.2202.0'; apps/angular-ai-devtools/src/app/companion.ts:114 and packages/ai-devtools-companion/src/vetted.ts:14 hold the same literal |
| "the extension performs no `fetch`/`XMLHttpRequest` at all" | status | verified | findstr /i /c:"fetch(" /c:"XMLHttpRequest" extension\*.js returns no matches across every extension script |
| "one provider, `provideAiDevTools()`, exported from `packages/ai-devtools-companion/src/index.ts:25` and returning an empty provider list on purpose" | feature | verified | packages/ai-devtools-companion/src/index.ts:25 export function provideAiDevTools(): Provider[], :26 if (isDevMode()), :29 return [] — an empty list |
| "`error-digest.json:2`, `NG0950` at `:245`, `NG6100` at `:290`" | structure | verified | extension/error-digest.json:245 "code": "NG0950" and :290 "code": "NG6100" |

## Doc: research/spikes/instrumentation-free-coverage.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`packages/ai-devtools-companion/src` contains three files" | structure | verified | dir packages\ai-devtools-companion\src — facade.ts, index.ts, vetted.ts, and nothing else |
| "The only import of the package anywhere in this repository is the fixture's dev config (`spikes/ng222-app/src/app/app.config.dev.ts:3`)" | integration | verified | spikes/ng222-app/src/app/app.config.dev.ts:3 — import { provideAiDevTools } from 'ai-devtools-companion'; every other findstr hit is a node_modules, dist/ or .angular/cache artefact or the dependency entry at spikes/ng222-app/package.json:23 |
| "`extension/manifest.json:29-38` loads it at `document_idle`" | config | verified | extension/manifest.json:27 and :36 — "run_at": "document_idle" in the content_scripts block that registers :34 agent-main.js |
| "Angular's enum declares 26 values and none names an effect (`extension/render-phase.js:7-14`)" | status | verified | extension/render-phase.js:7-10 — comment records the 26-value ProfilerEvent enum with no value name containing effect; afterRenderEffectPhase is a ReactiveNodeKind, not a profiler event |
| "the code deliberately refuses `injector.get` for the *companion's vetted identity tokens* (`:312-314`)" | feature | verified | extension/agent-main.js:312-314 — "No `injector.get` is ever called with a vetted token, because a lookup would instantiate someone else's class (N4)." |
| "`app/page-reads.ts:14-20` (no transport at all today)" | status | verified | apps/angular-ai-devtools/src/app/page-reads.ts:14 — "**This build has no page-request transport.**", naming angular-ai:di-query as having "no caller and no responder" |

## Doc: research/spikes/s11-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Sourcemaps would not let any shipped feature drop an opt-in requirement, because no shipped gate is a source-location problem" | status | verified | research/spikes/capability-dependency-matrix.md:176 — "Totals: `lift` 0 — `narrow` 0 — `changes nothing` 16"; research/spikes/README.md:27-30 records that a `.project/research/<name>.md` reference in these spikes resolves to `research/spikes/<name>.md` |
| "Nine of the ten `provider` gates are a change-detection arrangement a map cannot observe" | status | verified | research/spikes/capability-dependency-matrix.md:89 — "9 of the 10 `provider: required` rows are the same requirement"; the provider column total of 10 is at :122 |
| "the two console joins cut the stack before reading anything (`extension/lint-core.js:100,124`, `extension/router-diagnostic.js:52,66`)" | feature | verified | extension/lint-core.js:100 const STACK_FRAME = /\n\s+at\s/ and :124 function bodyOf(text); extension/router-diagnostic.js:52 and :66 carry the same regex and bodyOf cut |
| "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" | status | unverifiable | apps/insurance-portal is not in this repository (dir /b apps lists only angular-ai-devtools and angular-ai-devtools-e2e); the portal checkout's apps/insurance-portal/project.json and its dist output would settle it |
| "Recorded: 2026-11-08" | status | verified | git log -1 --format=%ci 2c0d47d8 — 2026-11-08 23:42:35 +0100, the commit that recorded the S11/S12/S13 answers |

## Doc: research/spikes/s12-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "for the sixteen shipped features a map changes nothing (`lift 0 / narrow 0 / changes nothing 16`, `.project/research/capability-dependency-matrix.md` §3)" | status | verified | research/spikes/capability-dependency-matrix.md:176 — "Totals: `lift` 0 — `narrow` 0 — `changes nothing` 16"; research/spikes/README.md:27-30 records the path redirect to research/spikes/ |
| "`template-map-coarse` in the matrix's §4 vocabulary" | structure | verified | research/spikes/capability-dependency-matrix.md:240 — the token row `template-map-coarse` / finding reason, part of the seven-token §4 table |
| "`extension/panel/*` is gitignored except `index.html`" | config | stale | .gitignore:33-35 ignores extension/panel/* but re-includes BOTH index.html (:34) and favicon.ico (:35); git ls-files extension/panel returns extension/panel/favicon.ico as well as extension/panel/index.html |
| "The production configuration of `apps/insurance-portal/project.json` sets `sourceMap` **only** in `development`" | config | unverifiable | apps/insurance-portal does not exist here (dir /b apps lists only angular-ai-devtools and angular-ai-devtools-e2e); the external portal checkout's project.json would settle it, and this repository's own apps/angular-ai-devtools/project.json:48 sets sourceMap: true |
| "panel_js_files=30 panel_js_bytes=624247 maps=0 has_sourceMappingURL=False" | status | unverifiable | the panel output directory is not in the tree (.gitignore:33 ignores extension/panel/*; only index.html and favicon.ico are tracked) and the brief forbids running the build; one build-extension run's output directory would settle it |
| "`npm install web-tree-sitter` -> web-tree-sitter=0.27.2 ... tree-sitter-wasms=0.1.13 (37 grammars, incl. html 18468 B)" | config | unverifiable | no tree-sitter, web-tree-sitter or tree-sitter-wasms entry in package.json or package-lock.json (findstr /i /c:"tree-sitter" over both returns nothing); the npm registry plus one install would settle it |

## Doc: research/spikes/s13-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal --dir ... --json`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:1984 usage "control.mjs <up\|doctor\|info\|down> [--target counter\|ssr\|portal]"; :1472 "up needs --target counter\|components\|ssr\|portal" |
| "`node .commandcode/skills/control-ai-browsers/scripts/control.mjs run chrome-beta-nano <probe.js> --json`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:4074 "usage: run <instance> <script.js>"; :4268 lists run among the control.mjs subcommands |
| "Grammar as shipped: `{ state: 'cannot-tell', reason: '<lower-hyphen-token>' }` (`ext/lint-core.js:86-89`, `ext/onpush-readiness.js:59`, `ext/redirect-chain.js:19`)" | structure | verified | extension/lint-core.js:83 const CANNOT_TELL = 'cannot-tell' with the reason tokens declared at :86-89; extension/onpush-readiness.js:59 and extension/redirect-chain.js:19 return exactly { state: 'cannot-tell', reason: … } |
| "`no-covering-profiler-record` (existing token, `ext/sanitizer-triage.js:109`)" | structure | verified | extension/sanitizer-triage.js:109 — const NO_COVERING_RECORD = 'no-covering-profiler-record' |
| "`extension/agent-main.js:137-159` resolves the zone with `injector.get('NgZone')` (a string) and then `injector.get(globalThis.NgZone)`" | feature | verified | extension/agent-main.js:140 zone = injector.get('NgZone'); :158 falls through to globalThis.Zone, and the 'noop' return sits at :159 |
| "**answered** — 8 streams, 7 reachable with no app cooperation" | status | unverifiable | the survey target is the external portal (D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools) and the probe scripts are session scratch, so the eight-row stream table cannot be re-run from this tree; one control-ai-browsers run on that portal would settle it |

## Doc: research/spikes/sourcemap-future-scope.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Four roadmap entries carry `Status: pending` and are the entire unshipped current generation: `M040 performance-narrator` — `RM:1476`" | status | stale | .project/ROADMAP.md:1476 reads "Status: shipped" (M040 heading at :1470); the same line offsets now read shipped for all four — :1506 (M041), :1537 (M042), :1567 (M043) |
| "Nothing follows `M043` in the roadmap; the file ends at `RM:1589`" | structure | stale | .project/ROADMAP.md:1590 is "### M044 — gate-integrity" and the file is 1993 lines at the base revision (git show 02bba9d:.project/ROADMAP.md) |
| "backlog `M043` is `copy-to-agent` (`BL:222`) while roadmap `M043` is `stability-explainer` (`RM:1561`)" | structure | verified | plans/angular-ai-devtools-program-backlog.md:222 — "M043 copy-to-agent · M044 component-search ·"; .project/ROADMAP.md:1561 — "### M043 — stability-explainer" |
| "MV3 'restricts Wasm to `wasm-unsafe-eval` and the panel already pins its CSP' (`BL:36`)" | status | verified | plans/angular-ai-devtools-program-backlog.md:36 (ruling A20) — "...MV3 restricts Wasm to `wasm-unsafe-eval` and the panel already pins its CSP." |
| "Q4 item 3 (`BL:417-418`): is `web-tree-sitter` plus its TypeScript, HTML and Angular grammars installable and runnable in a module worker" | status | verified | plans/angular-ai-devtools-program-backlog.md:417-418 — "3. Is `web-tree-sitter` plus its TypeScript, HTML and Angular grammars installable and runnable in a module worker in this repository..." |
| "the extension performs **no network read at all** — no `fetch(`, no `XMLHttpRequest`, no `sourceMappingURL` anywhere under `extension/` (`MX:184-187`)" | feature | verified | research/spikes/capability-dependency-matrix.md:184-187 states it, and findstr /i /c:"fetch(" /c:"XMLHttpRequest" extension\*.js returns no matches |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using Angular CLI version 22.2.2" | config | verified | spikes/ng222-app/package.json:29 — "@angular/cli": "^22.2.2"; the build cache directory spikes/ng222-app/.angular/cache/22.2.2/ names the CLI version that actually ran |
| "To execute unit tests with the Vitest test runner, use the following command: `ng test`" | command | verified | spikes/ng222-app/angular.json:75 "builder": "@angular/build:unit-test" with "runnerConfig" at :86; spikes/ng222-app/package.json:9 "test": "ng test" and :36 "vitest": "5.0.3" |
| "This will compile your project and store the build artifacts in the `dist/` directory" | config | verified | spikes/ng222-app/dist/ng222-app/browser/main.js exists on disk, produced by spikes/ng222-app/package.json:7 "build": "ng build" |
| "open your browser and navigate to `http://localhost:4200/`" | command | unverifiable | spikes/ng222-app/angular.json:63 declares @angular/build:dev-server with no explicit port, so 4200 is the Angular CLI default rather than a fact recorded in this repository; one `ng serve` run would settle it |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using Angular CLI version 22.2.2" | config | verified | spikes/ng222-ssr/package.json:29 — "@angular/cli": "^22.2.2" |
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`" | status | verified | git ls-files spikes/ng222-ssr lists no *.spec.ts — the only spec-named path is tsconfig.spec.json, a compiler config |
| "`serve:ssr:ng222-ssr` — node dist/ng222-ssr/server/server.mjs" | command | verified | spikes/ng222-ssr/package.json:10 — "serve:ssr:ng222-ssr": "node dist/ng222-ssr/server/server.mjs"; angular.json:55-56 server: src/main.server.ts with outputMode: server, :61 entry src/server.ts |
| "@angular/ssr ^22.2.2 and express ^5.1.0 in the SSR server's dependencies" | config | verified | spikes/ng222-ssr/package.json:22-23 — "@angular/ssr": "^22.2.2" and "express": "^5.1.0" |
| "Angular CLI does not come with an end-to-end testing framework by default" | status | verified | spikes/ng222-ssr/package.json:27-34 devDependencies carry no e2e runner — no playwright, cypress or protractor |

## Descriptive docs
- .commandcode/taste/taste.md

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
| 930 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the S11/S12/S13 set is audited where it lives — `archive_milestone.py`'s `require_clean_active_root` admits nothing but a byte-identical `.project/research/DOCS-AUDIT.md`, so the six answers and analyses are tracked Markdown under `research/spikes/` and therefore inventoried, and their interior `.project/research/<name>.md` references are read through `research/spikes/README.md`'s move note rather than by editing the documents, which stay byte-identical. | no |
| 99 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 100 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 945 | .claude/skills/control-ai-browsers/features/extension-panel.md | "`Extensions.loadUnpacked` answers only over `--remote-debugging-pipe`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 946 | .claude/skills/control-ai-browsers/features/interop.md | "Measured result: the check exits 0 on `edge-dev-aion` with `nodes: 1`; verdict `verified` (2/2); evidence `.project/build/verify/interop/`." | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 947 | .claude/skills/control-angular-dev-app/SKILL.md | "control.mjs:69 keeps it at 3000 because the portal checkout hardcodes http://localhost:3000/api/" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 948 | .claude/skills/control-angular-dev-app/features/README.md | "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json decides whether a sidebar entry and its route exist" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 949 | .claude/skills/control-angular-dev-app/features/counter.md | "the fixture's two other routes, /stale-view and /stale-view-deferred, belong to the stale-view fixtures (src/app/app.routes.ts:5-8)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 950 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "Data comes from http://localhost:3000/api/claims" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 951 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-list table ... 5 rows measured (the facade drops claims whose contract or customer is missing)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 952 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "claim-details row click opens /claim/<id>/details, heading Claim Details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 953 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "/claim/create shows the heading Complaint Create: an app bug, measured; report it, do not patch it in the map" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 954 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Data comes from http://localhost:3000/api/complaints" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 955 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 956 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "complaint-create ... Save sends POST /api/complaints (201), shows a success toast and opens the new complaint's details" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 957 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-list table ... 20 rows after a fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 958 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "contract-edit ... Save is disabled until a field changes, then sends PUT /api/contracts and returns to details with the new value" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 959 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "eval __ngc.components() on details lists DetailsComponent, ContractStatusChipComponent, HyperlinkComponent" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 960 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "New contracts get a short numeric id (/contract/10846/details), seeded ones a UUID" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 961 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "/ redirects to /home, which shows four tiles linking to the domain lists" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 962 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Domain routes load lazily, guarded by feature flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 963 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Only the sidebar group headings render upper-case (CONTRACT, through the capitalize pipe, which calls toUpperCase)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 964 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "The header link goes to https://www.ng-journal.com" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 965 | .claude/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (devtools-tabs.component.ts); Transfer State only for a hydrated (SSR) app" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 966 | .claude/skills/control-angular-devtools/features/attach.md | "Detection result: isAngular, isDebugMode (development build), isIvy, isSupportedAngularVersion (major 12+ or 0)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 967 | .claude/skills/control-angular-devtools/features/attach.md | "the content script still injects the backend (it gates on isAngularDevTools, isAngular and an HTML document, not on isDebugMode; built 1.22.0 app/content_script_bundle.js)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 968 | .claude/skills/control-angular-devtools/features/attach.md | "The toolbar icon and popup are browser UI, not checked by script" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 969 | .claude/skills/control-angular-devtools/features/profiler.md | "It subscribes through ng.ɵsetProfiler, which keeps a list of subscribers in Angular 22" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 970 | .claude/skills/control-angular-devtools/features/profiler.md | "ng.ɵsetProfiler(null) clears every subscriber, DevTools' included" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 971 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected (measured): own subscribers bothOn {a:16,b:16}, afterRemoveA {a:16,b:32}; DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 972 | .claude/skills/control-angular-devtools/features/signal-graph.md | "The angular:di_graph regression: after that tool runs, the template node is gone from both" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 973 | .claude/skills/control-angular-devtools/features/signal-graph.md | "Other kinds the counter lacks: linked-signal, child-signal-prop, resource, unknown" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 974 | .claude/skills/control-angular-devtools/features/signal-graph.md | "--di-graph leaves the page's signal graph broken until reload" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 975 | .claude/skills/control-pangular-inspector/SKILL.md | "`.claude/skills/control-pangular-inspector/scripts/control.mjs:74` defaults to 9999" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 976 | .claude/skills/control-pangular-inspector/SKILL.md | "With `--read-only`, 0.0.7 lists 46 tools." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 977 | .claude/skills/control-pangular-inspector/features/README.md | "app 4507 for the default portal folder" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 978 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids (`cgg06-4`) change with every page load" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 979 | .claude/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 980 | .claude/skills/control-pangular-inspector/features/navigation.md | "The page keeps `limits.navigations` (50) entries" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 981 | .claude/skills/control-pangular-inspector/features/navigation.md | "A reload keeps the page id (it lives in `sessionStorage`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 982 | .claude/skills/control-pangular-inspector/features/navigation.md | "The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 983 | .claude/skills/control-pangular-inspector/features/navigation.md | "`node $S call list-routes` (12 routes, measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 984 | .claude/skills/control-pangular-inspector/features/panel.md | "the dashboard text with the eight tab names, `LIVE`, `Angular 22.2.2`, and `Agent` then `Read-only`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 985 | .claude/skills/control-pangular-inspector/features/panel.md | "icon only, accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 986 | .claude/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 987 | .claude/skills/control-pangular-inspector/features/setup.md | "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 988 | .claude/skills/control-pangular-inspector/features/source-scan.md | "`build-meta` for versions: `node $S scan build-meta`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 989 | .claude/skills/control-pangular-inspector/features/source-scan.md | "Angular `22.2.2`, project `@ng-journal/source`, TypeScript `6.0.3`, `ssr: false` (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 990 | .claude/skills/control-pangular-inspector/features/source-scan.md | "it ignores `project.json` (only `build-meta` reads it). An Nx workspace with code in `libs/` is mostly invisible to it." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 991 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 992 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "`expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 993 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "The repository's `extension/` does not inject there (measured 2026-11-12)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 994 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "In attach mode the `run-code` route recorded only the click's output events (event ids 6 and 7) in two runs on 2026-10-16" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 995 | .claude/skills/verify-ai-browsers/SKILL.md | "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three (2026-10-12)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 996 | .commandcode/pstack-models.md | "the pstack effort agents (`effort-low`, `effort-medium`, `effort-high`, `effort-xhigh`, `effort-max`) set `reasoningEffort` in their frontmatter and do not pin a model" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 997 | .commandcode/pstack-models.md | "`default effort` sets the level for a value without one; `session` keeps the parent session's effort" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 998 | .commandcode/pstack-models.md | "Winner: reflection/beam:free @medium (49s, 384K tokens, good quality — best speed/quality)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 999 | .commandcode/skills/control-ai-browsers/features/health-check.md | "`Proofreader` is not defined in these builds" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1000 | .commandcode/skills/control-ai-browsers/features/health-check.md | "loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1001 | .commandcode/skills/control-angular-dev-app/SKILL.md | "`src/app/app.routes.ts:5-8` declares, `/stale-view` and `/stale-view-deferred`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1002 | .commandcode/skills/control-angular-dev-app/features/counter.md | "(`src/app/app.routes.ts:5-8`, read 2026-11-01)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1003 | .commandcode/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1004 | .commandcode/skills/control-angular-devtools/features/profiler.md | "`ng.…setProfiler(null)` clears every subscriber, DevTools' included" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1005 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids (`cgg06-4`) change with every page load" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1006 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "the answer starts `No signal graph for <selector>`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1007 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50). The page keeps `limits.navigations` (50) entries." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1008 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "12 routes, measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1009 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "The sidebar entries are `div`s with `routerLink`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1010 | .commandcode/skills/control-pangular-inspector/features/panel.md | "`panel.tabs`: Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1011 | .commandcode/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1012 | .commandcode/skills/control-pangular-inspector/features/panel.md | "the dashboard text with the eight tab names, `LIVE`, `Angular 22.2.2`, and `Agent` then `Read-only` (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1013 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`node $S check` -> six `[OK]` lines, exit 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1014 | .commandcode/skills/control-pangular-inspector/features/setup.md | "The setup is not committed in the portal checkout (its `git log` holds no commit for it)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1015 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "`node $S scan get-components` -> `[]` in the portal (measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1016 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1017 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "`Tests 2 passed \| 2 skipped (4)` without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1018 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "The repository's `extension/` does not inject there (measured 2026-11-12" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1019 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "`getInjectorProviders` throws on the null injector at the end of the resolution path" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1020 | .commandcode/skills/link-workspace-packages/SKILL.md | "`npm install @org/ui --workspace @org/app`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1021 | .commandcode/skills/link-workspace-packages/SKILL.md | "yarn berry: uses Plug'n'Play by default (no `node_modules`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1022 | .commandcode/skills/monitor-ci/SKILL.md | "circuit breaker (5 polls)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1023 | .commandcode/skills/monitor-ci/SKILL.md | "`--local-verify-attempts` \| 3" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1024 | .commandcode/skills/monitor-ci/references/fix-flows.md | "Spawn FETCH_HEAVY subagent for `selfHealingSkipMessage`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1025 | .commandcode/skills/monitor-ci/references/fix-flows.md | "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1026 | .commandcode/skills/monitor-ci/references/fix-flows.md | "Local verification: passed\|enhanced\|failed-pushing-to-ci" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1027 | .commandcode/skills/nx-cloud-api/SKILL.md | "Run `npx nx-cloud login --status` from the workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1028 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1029 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "`npx nx-cloud api task-stats` with `-f dateAfter=... -f dateBefore=... --pages 3`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1030 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Asset links (task logs, artifacts, reports) answer with a redirect; `--describe` shows them as `returns: file`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1031 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1032 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "A target `cache` field cannot prove Vite or ESLint native-cache state" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1033 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Download the exact task-row artifact link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1034 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "The API cannot identify an upload path, writer, storage event, or service mutation" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1035 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Byte-identical malformed downloads across retries support a persistent bad cache object" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1036 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1037 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Download the exact row-provided link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1038 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "A downloaded asset proves only that it resolves now. A 404 does not prove that it never existed." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1039 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED` (the `cipes` filter accepts only terminal statuses)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1040 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "CIPE and run-group list filters use `createdAt`, not failure time" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1041 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Use `--list-operations` to confirm the routes; the public API has no separate workflow routes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1042 | .commandcode/skills/nx-import/references/GRADLE.md | "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1043 | .commandcode/skills/nx-import/references/GRADLE.md | "If you import an entire Gradle repository into a subfolder, files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1044 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1045 | .commandcode/skills/nx-import/references/JEST.md | "`npx nx add @nx/jest` does two things: 1. Registers `@nx/jest/plugin` in `nx.json` 2. Updates `namedInputs.production` to exclude test files" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1046 | .commandcode/skills/nx-import/references/JEST.md | "**Gotcha**: `nx add @nx/jest` does NOT create `jest.preset.js`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1047 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1048 | .commandcode/skills/nx-import/references/NEXT.md | "**No separate typecheck target** — Next.js runs TypeScript checking as part of `next build`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1049 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Delete all `turbo.json` files (root and per-package)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1050 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `"vite:typecheck"`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1051 | .commandcode/skills/nx-import/references/VITE.md | "**Vitest 3→4**: Usually works; type conflicts may surface in shared test utils." | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1052 | .commandcode/skills/nx-import/references/VITE.md | "Both `@nx/js/typescript` and `@nx/vite/plugin` auto-detect `vue-tsc` when installed — no manual config needed" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1053 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "Affected with explicit base ... `--base=origin/main`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1054 | .commandcode/skills/verify-ai-browsers/SKILL.md | "A rebuilt panel needs no restart (the browser reads the extension's pages from disk)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1055 | .commandcode/skills/verify-angular-devtools/SKILL.md | "Not covered: the branded browsers (Chrome, Chrome Beta, Edge, Edge Dev)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1056 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "`tools/list` offers no action tool" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1057 | .commandcode/taste/angular/taste.md | "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1058 | .commandcode/taste/angular/taste.md | "Never put a `node:test` suite under `*.spec.ts` — the builder compiles it and the app test target fails with TS2591" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1059 | .commandcode/taste/communication/taste.md | "`provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1060 | .commandcode/taste/workflow/taste.md | "validates it programmatically" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1061 | AGENTS.md | "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:14`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1062 | docs/afk-run-2026-10-12.md | "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1063 | docs/afk-run-2026-10-12.md | "The `lars-create-control-skill` contract (`references/generated-skill.md`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1064 | docs/autonomy-gaps.md | "Every user-scope edit it describes was made outside this checkout" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1065 | docs/design/tutor.md | "All tutor state is in `chrome.storage.local`, written by the panel" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 1066 | docs/design/tutor.md | "// key 'tutor:profile'" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 1067 | docs/design/tutor.md | "2-3 options per answer set, chain depth 1, at most 2 wrong options" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 1068 | docs/design/tutor.md | "26 events, `profiler_types.ts:17-157`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1069 | docs/feature-proposals.md | "N27. Angular AI DevTools Tutor" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 1070 | docs/filing-ledger.md | "`.claude/skills/control-pangular-inspector/SKILL.md:172` (0.0.7 has no `list-components`; added in 20ebbb9; 46 tools with `--read-only`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1071 | docs/filing-ledger.md | "returns 46 tools without it" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1072 | docs/filing-ledger.md | "Nx 23.1.1, Angular 22.2.2, npm 11.16.0, Node 24.18.0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1073 | plans/angular-ai-devtools-program-backlog.md | "`debugger` permission granted" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1074 | plans/angular-ai-devtools-proposals.handoff.md | "the eleventh, the `LanguageDetector`/`Translator` worker crash, is at `docs/filing-ledger.md:230`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1075 | plans/gsd-path-handoff-M018.md | "Frozen inventory: **143 documents**" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1076 | plans/gsd-path-handoff-M018.md | "`--base` must be a full 40-character SHA" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1077 | references/ai-browsers-verification.md | "`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:253`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1078 | references/ai-browsers-verification.md | "`verdict.mjs lint <verdict.json>` must exit 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1079 | references/edge-dev-aion-model.md | "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1080 | research/01-built-in-ai-apis.md | "the shipped driver reads `c.callID ?? c.callId` (`control.mjs:1424-1430`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1081 | research/01-built-in-ai-apis.md | "Chrome ships the Prompt API in **extensions since Chrome 138**" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1082 | research/01-built-in-ai-apis.md | "`devtools_page` ... `ExtensionView.ts` creates the panel iframe with allow=\"language-model; summarizer; translator; ...\"" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1083 | research/02-angular-surface.md | "Paths below are relative to ... `D:\projects\github\angular\angular` on branch `22.2.x`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1084 | research/03-prior-art.md | "Peer range Angular 20+, Node 22+" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1085 | research/03-prior-art.md | "Maintainers Erkam Yaman and Santosh Yadav" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1086 | research/04-ecosystem.md | "Docs observed: vitest.dev/guide/browser (header v5.0.3)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1087 | research/04-ecosystem.md | "`window.__REDUX_DEVTOOLS_EXTENSION__` is read in a provider factory, `createReduxDevtoolsExtension()`, `modules/store-devtools/src/provide-store-devtools.ts:34-45`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1088 | research/04-ecosystem.md | "the dropped-in test file: `vitest-browser-angular` `render(Component, {inputs, componentProviders, baseElement})`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1089 | research/04-ecosystem.md | "`test.browser.enabled`, provider, instances" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1090 | research/04-ecosystem.md | "`@rx-angular/state` peer dep `@angular/core ^21.0.0` ... so Angular 22.2 compatibility must be checked" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1091 | research/05-spikes.md | "The two descriptions are 1,318 and 1,390 characters" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1092 | research/06-angular-skills.md | "`ng mcp` tools: `get_best_practices`, `onpush_zoneless_migration`, `search_documentation`, `list_projects`, `ai_tutor`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1093 | research/06-angular-skills.md | "`angular-aria.md`, 18433 bytes, `@angular/aria` headless directives (accordion, listbox, combobox, menu, tabs, toolbar, tree, grid)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1094 | research/06-angular-skills.md | "whole reference corpus is 135,754 bytes (measured, `wc -c`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1095 | research/06-angular-skills.md | "Repo shape (measured): 2 skills, 37 reference files, README, BUILD_INFO" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1096 | research/07-prompting-small-models.md | "**No empty schemas:** a tool that needs no input gets `scope: {type:'string', enum:['page']}`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1097 | research/07-prompting-small-models.md | "Aion has no model card [measured: HF API search for Microsoft \"aion\" returned []]" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1098 | research/07-prompting-small-models.md | "Chrome's Gemma 4 runtime contains llguidance constrained-decoding code for tool calls (B3)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1099 | research/08-recent-angular-features.md | "`/releases/insights/22/mcp` ... 'No new MCP server features were released in Angular 22'" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1100 | research/08-recent-angular-features.md | "Angular \"Can I Use\": 226 features with status per version (experimental, developer preview, stable, deprecated, removed)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1101 | research/09-nano-tool-session-error.md | "Measured behaviour: `05-spikes.md`, section \"Root cause hunt\" (Chrome Beta 156.0.8078.17, Nano profile serving `v3Nano`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1102 | research/09-nano-tool-session-error.md | "The message is `kExceptionMessageUnableToCreateSession` in `third_party/blink/renderer/modules/ai/exception_helpers.cc#L68-L70`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1103 | research/09-nano-tool-session-error.md | "`ModelClient`'s constructor adds `kToolUse` to every model's capabilities without condition" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1104 | research/12-legacy-vs-modern-angular.md | "unminified, 968 `ngDevMode` references" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1105 | research/12-legacy-vs-modern-angular.md | "`spike main.js:37258-37267`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1106 | research/13-portal-legacy-audit.md | "`apps/insurance-portal/project.json:18` `"polyfills": ["zone.js"]`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1107 | research/13-portal-legacy-audit.md | "The app builds with `@angular/build:application` and serves with `@angular/build:dev-server` (`apps/insurance-portal/project.json:10,53`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1108 | research/15-deterministic-and-ai.md | "Every `getSignalGraph` node carries `epoch` (02 section 1.2, `debug_signal_graph.ts:68-96`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1109 | research/18-edge-prevent-auto-signin.md | "the `control-ai-browsers` skill relies on the `ms*` switches alone (`.commandcode/skills/control-ai-browsers/SKILL.md:311-312`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1110 | research/spikes/README.md | "`archive_milestone.py` enforces that (`require_clean_active_root`, 'pending DOCS-AUDIT rulings lack an exact active carry-forward copy')" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1111 | research/spikes/s11-answer.md | "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1112 | research/spikes/s12-answer.md | "`extension/panel/*` is gitignored except `index.html`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1113 | research/spikes/s12-answer.md | "The production configuration of `apps/insurance-portal/project.json` sets `sourceMap` **only** in `development`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1114 | research/spikes/s12-answer.md | "panel_js_files=30 panel_js_bytes=624247 maps=0 has_sourceMappingURL=False" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1115 | research/spikes/s12-answer.md | "`npm install web-tree-sitter` -> web-tree-sitter=0.27.2 ... tree-sitter-wasms=0.1.13 (37 grammars, incl. html 18468 B)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1116 | research/spikes/s13-answer.md | "**answered** — 8 streams, 7 reachable with no app cooperation" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1117 | research/spikes/sourcemap-future-scope.md | "Four roadmap entries carry `Status: pending` and are the entire unshipped current generation: `M040 performance-narrator` — `RM:1476`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1118 | research/spikes/sourcemap-future-scope.md | "Nothing follows `M043` in the roadmap; the file ends at `RM:1589`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1119 | spikes/ng222-app/README.md | "open your browser and navigate to `http://localhost:4200/`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
