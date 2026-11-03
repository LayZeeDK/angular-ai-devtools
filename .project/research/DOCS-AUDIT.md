# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-03
Audited HEAD: 9d3c711dd030d23b5647a2b2cb46df96f225abe3
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 638 |
| stale | 14 |
| aspirational | 2 |
| unverifiable | 110 |
| descriptive docs (no testable claims) | 1 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`chrome-beta-nano` ... Port (main checkout) 9333" | config | verified | .claude/skills/control-ai-browsers/instances.json:70 — the chrome-beta-nano entry sets "port": 9333 |
| "`edge-dev-aion` ... `contextWindow` 7,168" | config | verified | .claude/skills/control-ai-browsers/instances.json:166 — the edge-dev-aion model block sets "contextWindow": 7168 |
| "The playwright-cli session is `ai-<instance>-<port>`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:471 — sessionOf() returns `ai-${name}-${port}` |
| "`model download <name> [--timeout-min=45]`" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:244 — positiveFlag('timeout-min', timeoutMin, 45) makes 45 the download default |
| "`panel <name> --url=<app> [--timeout-min=4]`" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2301 — drivePanel answerTimeoutMs reads --timeout-min with default 4 |
| "The default directory is `tmp/control-ai-browsers/evidence/<YYYYMMDD-HHMMSS>/`" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:167-168 — runId strips -: and the milliseconds from an ISO timestamp, then evidenceDir = TMP/evidence/runId |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .claude/skills/control-ai-browsers/instances.json:70,101,135,173,201 — the five instance entries carry exactly those ports in that order |
| "then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`" | structure | verified | .claude/skills/control-ai-browsers/features/health-check.md:7,21,26,41 — and the same four headings in the same order in all ten feature files |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`) before `up`" | command | verified | apps/angular-ai-devtools/project.json:52,58 — the build-extension target writes extension/panel, the folder each instance loads |
| "`--evidence=tmp/control-ai-browsers/evidence/<run-id>`" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:168 — a string --evidence replaces TMP/evidence/<runId> as the evidence directory |
| "every instance loads `extension/` when it starts" | config | verified | .claude/skills/control-ai-browsers/instances.json:71 — "extension": "extension", resolved against the primary checkout in control.mjs:504 |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`)" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 — queryDi() sends {type: 'angular-ai:di-query', componentName, elementTag} |
| "receives `angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:17-18 — the onMessage listener appends m.resolutionPath when the type is angular-ai:di-graph |
| "with a path view and a diff view" | feature | verified | apps/angular-ai-devtools/src/app/di-path-display.ts:12 and di-diff-display.ts:34 — formatDiPath() renders one path, diffDiPaths(pathA, pathB) compares two |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | verified | apps/angular-ai-devtools/project.json:58,62 — the target's outputPath base is extension/panel |
| "The path list is empty until a component is selected and a graph arrives" | feature | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:9,18 — availablePaths starts as an empty signal and only the di-graph listener adds to it |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "maps each to its owning component through `ng.getOwningComponent`" | feature | verified | src/main-world/error-capture.ts:43-44 — resolveOwningComponent calls ng.getOwningComponent when it is a function, and the ɵ-prefixed form otherwise |
| "The explain step runs in the panel (`src/panel/error-explainer-view.ts` calls `shouldCallModel`)" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:4,42 — imports shouldCallModel from ../../../../src/panel/error-explainer-view and returns early when it is false |
| "`angular-ai:error-explain` does not exist" | integration | verified | extension/background.js:13-16 — the relayed types are only angular-ai:record, state, di-graph and error-capture |
| "An error with no owning component reports \"no owning component\"" | feature | verified | src/main-world/error-capture.ts:18 — NO_OWN_COMPONENT = "no owning component", rendered at error-explainer.component.ts:19 when component is null |
| "An error code with no digest entry yields an explicit \"no digest entry\" answer" | feature | verified | src/main-world/error-digest.ts:12 — NO_DIGEST_ENTRY = 'no digest entry' |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the primary checkout's `extension/` (registry `extension`)" | config | verified | .claude/skills/control-ai-browsers/instances.json:71 and scripts/control.mjs:504 — "extension": "extension" is resolved against PRIMARY into extensionDir |
| "Angular detection still comes from the content scripts (`relay.js`, `agent-main.js`)" | structure | verified | extension/manifest.json:21,26 — relay.js in the ISOLATED content script, agent-main.js in the MAIN world |
| "`index.html` with `<base href=\"/panel/\">`, `main.js` and `styles.css`" | command | verified | extension/panel/index.html:5 — the built panel page sets base href "/panel/" and links main.js and styles.css |
| "DevTools 157 keys extension panels as `extension-panel-<uuid>_<n>`" | feature | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:51,57 — panelKey() picks the clientObjects key that starts with extension-panel- |
| "With `--json` the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps`" | config | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:160 — the run record carries exactly those fields |
| "`up` then turns developer mode on" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2206 — up calls DEVELOPER_MODE in a tab whenever the instance has an extension |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines (`extension` among them)" | status | stale | .claude/skills/control-ai-browsers/scripts/control.mjs:2503 — model.pin is registered only inside `if (inst.pin)`, and chrome-beta-gemma4 (instances.json:99-132) has no pin roots, so its doctor emits 18 lines |
| "`canary.tools` is `[SKIP]`" for Nano | feature | verified | .claude/skills/control-ai-browsers/instances.json:95 — chrome-beta-nano sets "toolCanary": false, which control.mjs:2563 passes to toolsPass() instead of gating on it |
| "reads `availability()` for ... Proofreader, LanguageDetector and Translator en->da" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1369-1371 — check() calls Proofreader.availability() and Translator.availability({sourceLanguage: 'en', targetLanguage: 'da'}) |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1372,1439 — the probe reports both typeofs, and canary.webmcp passes only when document.modelContext is an object |
| "`Proofreader` is not defined in these builds" | status | unverifiable | .claude/skills/control-ai-browsers/scripts/control.mjs:1369 guards it with `g.Proofreader ? ... : 'undefined'`; a doctor run's api.availability output from a real instance would settle it |
| "`model.pin` `[OK]` `matches the pin of <date>`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2512 — the passing detail is `matches the pin of ${pin.at}: ...` |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its own profile under `.browsers\<name>`" | structure | verified | .claude/skills/control-ai-browsers/instances.json:2 — "profilesRoot": ".browsers", joined with the instance name at control.mjs:498 |
| "One line per instance (five)" | command | verified | .claude/skills/control-ai-browsers/instances.json:67 — the instances map holds five entries |
| "Run `C flags edge-dev-aion`. `[OK]` with the nine Aion features" | command | verified | .claude/skills/control-ai-browsers/instances.json:137-147 — the edge-dev-aion features array holds nine entries, from AIPromptAPI to msEdgeLLMOnDeviceModelPrerelease |
| "`C up edge-dev-aion --backend=cpu` exits 2 before anything starts" | command | verified | .claude/skills/control-ai-browsers/instances.json:159 — edge-dev-aion declares "cpu": null, and the BackendDef typedef at control.mjs:16 reads a null backend list as no such backend |
| "The script finds instance processes only by `--user-data-dir`, so it never sees his" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:660,685 — processesOf and mainProcess select the registry browser program whose --user-data-dir is the instance profile |
| "Node's `spawn` writes `--user-data-dir=D:\...` without quotes; instances started by hand have quotes. The drift check parses both." | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:641 — parseCommandLine matches a quoted whole argument and a bare --user-data-dir=value in one regex |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Zero interop nodes renders an explicit empty state (\"no interop nodes\")" | feature | stale | apps/angular-ai-devtools/src/app/interop.component.ts:16 — the empty state actually reads "no interop findings", not "no interop nodes" |
| "the field-to-node attribution \"inferred, untested\"" | feature | verified | apps/angular-ai-devtools/src/app/interop.service.ts:31 — INFERRED_UNTESTED = 'inferred, untested', rendered by interop.component.ts:25 |
| "identify a `toSignal.source` / `toSignal.state` node" | feature | verified | apps/angular-ai-devtools/src/app/interop.service.ts:8 — a node is picked when its label is toSignal.source or toSignal.state |
| "Required panel test ids: `interop-slice` ... `interop-node` ... `interop-limit` ... `interop-inferred`" | config | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19-25 — the four data-testid values are interop-slice, interop-limit, interop-node and interop-inferred |
| "pass `--extension <absolute path of the checkout the instance runs>`" | command | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:148,152 — the usage line lists [--extension <dir>] and the comment defines it as the extension directory the running instance must serve |
| "the `spikes/ng222-app` fixture at `/stale-view`, or the deferred `/stale-view-deferred` route" | config | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 — both routes are registered against their fixture components |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "free space minus the model's `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1551-1552 — refuses when free.mib - model.downloadMib < free.minMib; instances.json:16,41 set minFreeMib 22528 and 20480 |
| "copies them to the primary checkout's `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>` with `pin.json`" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:901,905 — pinDir() is join(TMP, 'pins', name) below the shared tmp directory |
| "The model folders in the profile: `OptGuideOnDeviceModel\<version>` (Nano), `OptGuideManifestModel\<hash>\<version>` (Gemma 4), `EdgeLLMOnDeviceModel\<version>`" | config | verified | .claude/skills/control-ai-browsers/instances.json:91,125,163 — the model.folders strings are exactly those three patterns |
| "`contextWindow` 7,168" for the pinned Aion init | config | verified | .claude/skills/control-ai-browsers/instances.json:166 — edge-dev-aion sets "contextWindow": 7168, the value model init compares against |
| "pin a running instance that doctor passes" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2630 — model pin refuses unless mainProcess finds the instance |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the two-tool round trip in `spikes/probes/probe10.js` ... `get_component_count` and `get_component_inputs`" | feature | verified | spikes/probes/probe10.js:7-8,15-16 — the two tools are declared with those names, get_component_count requiring scope and get_component_inputs requiring selector |
| "`bench.js` hard-codes it" (port 4222) | config | verified | spikes/probes/bench.js:4 — page.goto('http://localhost:4222/') |
| "`bench.js` has a 120 s per-prompt timeout" | config | verified | spikes/probes/bench.js:11 — PROMPT_TIMEOUT_MS = 120000 |
| "`results[i]` holds the serving model, `backend`, `performanceClass`, `cpuBefore` and `cpuAfter`" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2939,2952 — the record is built with model: info.serving, backend, requestedBackend, performanceClass and cpuBefore, and cpuAfter is logged beside them |
| "A tool response must carry both `callID` (Chrome Beta 156) and `callId`" | feature | verified | spikes/probes/bench.js:105-108 — it reads c.callID ?? c.callId and returns LanguageModelToolSuccess carrying both fields |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`)" | integration | verified | extension/background.js:13 lists angular-ai:record as a relayed type, and extension/manifest.json:26 runs agent-main.js in the MAIN world |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | feature | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:249-250 — msg.type === 'angular-ai:record' routes msg.cycle to causeService.recordCycle |
| "anti-pattern findings render when two snapshots differ" | feature | verified | apps/angular-ai-devtools/src/app/signal-provenance.service.ts:73-77 — antiPatterns() calls detectAntiPatterns(graph, previous); anti-pattern-detector.ts:96 flags a node only when the read is untracked in this snapshot and the previous one |
| "with a cached answer for an unchanged selection" | feature | verified | apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts:133,148-150 — a Map keyed by the selection fills cachedAnswer before the prompt runs |
| "The component picker is empty until at least one `angular-ai:record` cycle arrives" | feature | verified | apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts:87 — "no components recorded yet" renders while no cycle has arrived |
| "The panel loads only when shown ... reload after opening the panel" | feature | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:252-253 — drivePanel shows the panel, then sends Page.reload so the page announces Angular again |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends the hedged wording \"the template may show a stale value\"" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 — the hedged span renders exactly that sentence |
| "no runtime message type ... `angular-ai:stale-view` does not exist" | integration | verified | extension/background.js:13-16 — only record, state, di-graph and error-capture are relayed |
| "The scan runs through `StaleViewScanService` (which loads `extension/stale-view-worker.js`)" | feature | verified | apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:28-29 — chrome.runtime.getURL('stale-view-worker.js'), falling back to '../stale-view-worker.js' |
| "With zero findings the panel renders an explicit empty state (\"no stale-view findings\")" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:17 — the empty-state testid renders "no stale-view findings" |
| "Unsupported Angular versions report an explicit unsupported state; a destroyed signal graph reports unavailable" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:13,15 — "Unsupported: Angular ..." and "unavailable: signal graph destroyed" |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:82,90,100 - the counter, ssr and portal flows derive their app port as 4300 + slot, 4400 + slot and 4500 + slot whenever the slot is not 0 |
| "portal api \| fixed \| 3000 \| `.claude/skills/control-angular-dev-app/scripts/control.mjs:69` keeps it at 3000" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 - `const PORTAL_API_PORT = 3000;`, and line 101 registers the portal api port as kind fixed with that value |
| "`control-ngdev-counter-4222`, `control-ngdev-portal-4507` for the defaults" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:1029 - the launch state sets session to `control-ngdev-${flowId}-${port}`, where flowId is the target name |
| "Evidence and logs go to `tmp/control-angular-dev-app/<flowId>-<timestamp>/`" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:64,1012 - SCRATCH is tmp/control-angular-dev-app and evidenceDir is path.join(SCRATCH, `${flowId}-${stamp}`) |
| "The Nx daemon is never recorded, never stopped and never turned off" | feature | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:615 - a recorded process whose reason is helper is described as "a shared helper (the Nx daemon), never stopped" and left alone |
| "The script passes `--inspect=false`, so the stack opens only the ports in the table" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:106 - the portal api process args are ['run', 'api:serve', '--inspect=false'] |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter: ... Fresh page state: `count` 3, `double` 6, cart 1 item" | feature | verified | spikes/ng222-app/src/app/counter.ts:17,18 - count is signal(3) and double is computed(() => this.count() * 2); counter.ts:5 - CartService items starts as ['apple'], so the cart holds one item |
| "SSR: ... Fresh page state: heading `Render mode: server`, `Early clicks: 0`, list Alpha, Beta, Gamma, `@defer` block dehydrated" | feature | verified | spikes/ng222-ssr/src/app/page.ts:10,12 - the h1 is "Render mode: {{ mode() }}" and the count paragraph starts at 0; spikes/ng222-ssr/src/server.ts:21-23 - /api/items returns Alpha, Beta, Gamma; page.ts:15 - the block is `@defer (hydrate on interaction)` |
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | config | verified | portal checkout apps/insurance-portal/src/assets/feature-flags.manifest.json:2-17 - the manifest lists customer-list, complaint-create, contract-edit, claim-list and the rest; .claude/skills/control-angular-dev-app/scripts/control.mjs:67,97 - the portal folder is outside this repository (PORTAL_DEFAULT_DIR, overridable with CONTROL_NG_PORTAL_DIR) |
| "Each feature file has an H1, one paragraph of user-visible behaviour, then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-dev-app` (starting with `Preconditions:`), `Gotchas`" | structure | verified | .claude/skills/control-angular-dev-app/features/counter.md:7,15,21,45 - the four H2s in that order with "Preconditions:" as the first line under the third; the same four appear in the same order in ssr.md:10,26,33,72 and the four portal files |
| "`__ngc.navigate(url)` is a setup shortcut" | feature | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:252,259 - navigate(url) takes the router instance and awaits its navigateByUrl, throwing "router globals absent: navigate through the UI instead" when the router API is missing |
| "Take `<session>`, `<url>` and `<evidenceDir>` from `node $S info`" | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:1211 - the info command prints the saved state, which line 1029 builds with url, session and evidenceDir |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`paragraph: \"Clicks: 3 (double 6, cart 1)\"`" | feature | verified | spikes/ng222-app/src/app/counter.ts:11 - the paragraph renders `{{ title() }}: {{ count() }} (double {{ double() }}, cart {{ cart.items().length }})`, and counter.ts:17 starts count at 3 with double computed from it; spikes/ng222-app/src/app/app.ts:8 - the host passes title="Clicks" |
| "the fixture's two other routes, `/stale-view` and `/stale-view-deferred`, belong to the stale-view fixtures (`src/app/app.routes.ts:5-8`, read 2026-11-01)" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 - the routes array declares path 'stale-view' with StaleViewFixture and path 'stale-view-deferred' with StaleViewDeferredFixture, and nothing else |
| "edges include `computed:double -> signal:count`" | feature | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:176 - the edges array maps each edge to `${label(consumer)} -> ${label(producer)}`, so a computed reading a signal prints in exactly that shape |
| "`eval \"() => __ngc.dependenciesOf('app-counter', 'double')\"` returns `dependsOn: [\"count\"]`" | feature | verified | .claude/skills/control-angular-dev-app/scripts/ng-inspect.js:197 - dependsOn is the producer labels of the edges consumed by that node, so the double computed reports its count producer |
| "the component is OnPush by default (no `changeDetection` declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:8-13 - the @Component metadata carries selector and template only, no changeDetection, which leaves Angular 22's OnPush default in place |
| "the effect writes `lastLogged` on every change (deliberate anti-pattern fixture)" | feature | verified | spikes/ng222-app/src/app/counter.ts:20,23 - lastLogged is a signal and the constructor effect calls this.lastLogged.set(this.count()) |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`claim-list` table with columns Claim number, Damage Type, Date, Policynumber, Customer" | feature | verified | portal checkout libs/claim/feature-list/src/lib/list.component.ts:23-27 - the table header row declares exactly those five th cells in that order |
| "the facade drops claims whose contract or customer is missing" | feature | verified | portal checkout libs/claim/data-access/src/lib/facades/claim-facade.service.ts:45-48,64-65 - a claim whose contract customer lookup fails returns null, and the next map filters the nulls out |
| "Data comes from `http://localhost:3000/api/claims`" | config | verified | portal checkout libs/claim/data-access/src/lib/data-services/claim-data.service.ts:9 - the url is `${inject(BaseUrl)}claims`, and libs/shared/utils/src/lib/injection-tokens.ts:5 defaults BaseUrl to http://localhost:3000/api/ |
| "`/claim/create` shows the heading `Complaint Create`" | feature | verified | portal checkout libs/claim/feature-create/src/lib/create.component.ts:39 - the page renders ng-journal-header with title="Complaint Create" |
| "row click opens `/claim/<id>/details`, heading `Claim Details`" | feature | verified | portal checkout libs/claim/feature-details/src/lib/details.component.ts:29 - the header title is "Claim Details"; libs/claim/routes/src/lib/routes.ts:15 - the route path is ':id/details' |
| "Deep links `/claim/list`, `/claim/create`, `/claim/<id>/details`" | config | verified | portal checkout libs/claim/routes/src/lib/routes.ts:9,15,21 - the three child routes are list, ':id/details' and create, each behind featureFlagGuard('claim-list'/'claim-details'/'claim-create') |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`complaint-list` columns Type, Customer, Date, Description; 2 seeded rows" | feature | verified | portal checkout libs/complaint/feature-list/src/lib/list.component.ts:23-26 - the four th cells are Type, Customer, Date, Description; apps/api/src/uuids.ts:10-12 - complaint_uuids is Array(2), the loop complaint.service.ts:12 seeds one row per uuid |
| "`Select type` (CustomerService, Sales, Payments)" | config | verified | portal checkout libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:2-4 - the enum holds exactly CustomerService = 'CustomerService', Sales = 'Sales' and Payments = 'Payments' |
| "`customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | feature | verified | portal checkout libs/customer/feature-list/src/lib/list.component.ts:23-30 - those eight headers in that order; apps/api/src/uuids.ts:3-5 - customer_uuids is Array(30) |
| "Save sends `POST /api/complaints` (201), shows a success toast and opens the new complaint's details" | integration | verified | portal checkout apps/api/src/complaint/complaint.controller.ts:15,29 - @Controller('complaints') with @Post() (NestJS answers 201 by default); libs/complaint/feature-create/src/lib/create.component.ts:112,119 - after the create it calls messageService.add and navigates to ../<id>/details |
| "`customer-details` `/customer/<id>/details`, heading `Customer Details` (name, email, phone, Address block)" | feature | verified | portal checkout libs/customer/feature-details/src/lib/details.component.ts:18,40 - the header title is "Customer Details" and a subtitle header titled "Address" opens the address block |
| "Customer names are random per API start" | feature | verified | portal checkout apps/api/src/customer.service.ts:19-20 - firstName and lastName come from faker.person at seed time, so every API start produces new names |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`contract-list` table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email; 20 rows after a fresh API start" | feature | verified | portal checkout libs/contract/feature-list/src/lib/list.component.ts:34-39 - the six th cells read exactly those headers; apps/api/src/uuids.ts:6-8 - contract_uuids is Array(20), and contract.service.ts:12 seeds one row per uuid |
| "clicking a row opens `/contract/<id>/details` with heading `Contract Details` and an `Edit` button" | feature | verified | portal checkout libs/contract/feature-details/src/lib/details.component.ts:41-42 - the header title is "Contract Details" with [showEditButton]="true"; details.component.ts:122-123 - the edit click navigates to [id(), 'edit'] |
| "`Edit` opens `/contract/<id>/edit`, heading `Contract Edit`, ... `Save` is disabled until a field changes" | feature | verified | portal checkout libs/contract/feature-edit/src/lib/edit.component.ts:51 - the header title is "Contract Edit"; edit.component.ts:62-68 - the Save button is [disabled]="saveDisabled()"; line 110 defines saveDisabled as a computed |
| "then sends `PUT /api/contracts` and returns to details with the new value" | integration | verified | portal checkout apps/api/src/contract/contract.controller.ts:15,29 - @Put() updateContract on @Controller('contracts'); libs/contract/data-access/src/lib/data-services/contract-data.service.ts:9,24-25 - put() targets `${BaseUrl}contracts` |
| "`contract-create` `/contract/create`: Status chip `Pending`, Customer dropdown `Select customer`, ... `Save` disabled until valid" | feature | verified | portal checkout libs/contract/feature-create/src/lib/create.component.ts:46 - header title "Contract Create"; line 63 - the Save button is [disabled]="form().invalid()"; line 112 - the new contract carries status: ContractStatusDto.Pending |
| "Save sends `POST /api/contracts` (201) and opens the new contract's details" | integration | verified | portal checkout apps/api/src/contract/contract.controller.ts:37-38 - @Post() createContract under @Controller('contracts'), which NestJS answers with 201 by default; libs/contract/data-access/src/lib/data-services/contract-data.service.ts:20-21 - post() targets `${BaseUrl}contracts` |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` redirects to `/home`, which shows four tiles linking to the domain lists" | feature | verified | portal checkout apps/insurance-portal/src/app/app.routes.ts:5-7,10-11 - the empty path redirects to home and home lazy-loads HomeComponent; apps/insurance-portal/src/app/home.component.ts:16,26,37,49 - four anchors with routerLink /contract/list, /claim/list, /complaint/list and /customer/list |
| "sidebar entries `List` and `Create` per domain (Customer has `List` only) and `Home`" | structure | verified | portal checkout apps/insurance-portal/src/app/sidebar.component.ts:79-102 - the routing configs give General the Home entry, contract, claim and complaint listMetaData plus createMetaData, and customer listMetaData only |
| "the active sidebar entry gets a highlighted background" | feature | verified | portal checkout apps/insurance-portal/src/app/sidebar.component.ts:52-61 - routerLinkActive supplies rl.isActive, and the class binding adds bg-primary-600 and a border when it is true |
| "Only the sidebar group headings render upper-case (`CONTRACT`, through the `capitalize` pipe, which calls `toUpperCase`)" | feature | verified | portal checkout apps/insurance-portal/src/app/sidebar.component.ts:38 - the domain is rendered through `config.domain \| capitalize`; libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9 - transform returns value.toUpperCase() |
| "any unknown path renders `Page Not Found` and \"Sorry, but the page you were trying to view does not exist.\"" | feature | verified | portal checkout apps/insurance-portal/src/app/page-not-found.component.ts:7-8 - the template is those two exact sentences, and app.routes.ts:33-35 routes path '**' to PageNotFoundComponent |
| "Home tiles and sidebar entries are hidden by the `*ngJournalFeatureFlag` directive when their flag is off; the domain routes carry `canMatch` feature-flag guards" | integration | verified | portal checkout apps/insurance-portal/src/app/home.component.ts:15,25,35,48 - each tile is wrapped in *ngJournalFeatureFlag on <domain>-list; sidebar.component.ts:42 - entries use the same directive with buildFeatureFlag; libs/claim/routes/src/lib/routes.ts:10,16,22 - each route carries canMatch: [featureFlagGuard(...)] |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It shows the heading `Render mode: server` (or `prerender`, `client` on the other routes)" | feature | verified | spikes/ng222-ssr/src/app/page.ts:10 - the h1 renders "Render mode: {{ mode() }}"; spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - the three paths are declared RenderMode.Server, RenderMode.Prerender and RenderMode.Client |
| "`?mismatch=1` (structural hydration mismatch, NG0500)" | feature | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:80 - expected-mismatch-detected passes only when a mismatch with status 'mismatched' on component 'Mismatch' is recorded and an NG0500 console error is logged on /?mismatch=1 |
| "a `@defer (hydrate on interaction)` block holding a `Deferred click` button" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15 - the block is declared `@defer (hydrate on interaction)` around <app-deferred>; spikes/ng222-ssr/src/app/deferred.ts:6 - that component renders the "Deferred click" button |
| "`ok` is `true` when all six checks pass ... `server-html-ngh` ... `expected-mismatch-detected`" | structure | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:75-80 - the check list is server-html-ngh, server-html-transfer-state, dev-build-after-hydration, hydration-counters, no-mismatch-on-default-route and expected-mismatch-detected, in that order |
| "`/prerender` is `ssg`, `/client` is the bare shell with `<body ngcm>`" | status | verified | research/raw/ssr-render-modes.json - the /prerender app-root carries ng-server-context="ssg" and the /client bodyTag is `<body ngcm=`, recorded by spikes/probes/ssr-render-modes.js:7,11-13 (measured 2026-10-12) |
| "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40, no node with a status other than `hydrated`" | status | verified | research/raw/ssr-hydration.json - the recorded counters read hydratedComponents 4, hydratedNodes 40 and componentsSkippedHydration 0; the same counters are read by .claude/skills/control-angular-dev-app/scripts/ssr-check.js:56-57 |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:89 - the script's single EXT_ID constant is exactly that store id, used for the options page, the store URL (line 91) and the panel target |
| "Playwright's bundled Chromium (Chrome for Testing 156.0.8078.4, revision 1248, read 2026-11-01 from `node_modules/playwright-core/browsers.json`)" | config | verified | node_modules/playwright-core/browsers.json:2-4 - the chromium entry carries revision 1248 and browserVersion 156.0.8078.4 |
| "session `ngdt`, CDP port 9420 ... CDP port `9420 + slot` (9421-9499, slot 1-79 from a hash of the worktree path)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:273-274 - MAIN_CDP_PORT is 9420 and the comment states that a worktree flow id hashes to one of 1 to SLOTS - 1, giving 9421-9499 |
| "copies the newest `<version>_0` folder ... to `tmp/control-angular-devtools/extension/<version>/`" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:94,314,1050 - TMP is tmp/control-angular-devtools, EXT_COPY is join(TMP, 'extension'), and install writes into join(EXT_COPY, version) after newestVersion() picks the folder |
| "graph nodes are `ng-signal-graph-pane .node-cont.kind-<kind>` with the label and value as text" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:830 - readSignalGraph maps every `ng-signal-graph-pane .node-cont` to the class starting with kind- plus its innerText lines |
| "the profiler button has `aria-label` `Start recording` ... and the result reads `Change detection cycles ... <n> / <total>`" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1458 - it waits for `button[aria-label="Start recording"]`; control.mjs:832 - profilerSummary matches /Change detection cycles[\s\S]*?(\d+)\s*\/\s*(\d+)/ and returns the last number |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at `spikes/ng222-app` (Angular 22.2.2)" | config | verified | spikes/ng222-app/package.json:16 - the dependency is @angular/core ^22.2.0; spikes/ng222-app/node_modules/@angular/core/package.json - the resolved version in the fixture's own install is 22.2.2 |
| "App page: playwright-cli session `ngdt`" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:311 - SESSION is 'ngdt' when the flow id is main and `ngdt-<flowId>` otherwise |
| "Panel: `control.mjs panel ...` and `coexist` (raw CDP into `chrome-extension://<id>/index.html`)" | integration | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:794 - isPanel matches the target whose url is `chrome-extension://${EXT_ID}/index.html`; control.mjs:810 - the panel is opened by evaluating Extensions.extensionServer.onShowPanel({command: 'showPanel', id: PANEL_ID}) in the DevTools target |
| "One file per feature: H1, one paragraph of user-visible behaviour, then `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-devtools`, `Gotchas`" | structure | verified | .claude/skills/control-angular-devtools/features/install.md:7,14,22,38 and attach.md:7,15,20,32 - the same four H2s in the same order, repeated in signal-graph.md:6,13,17,32 and profiler.md:6,11,15,26 |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:94,1172 - TMP is join(ROOT, 'tmp', 'control-angular-devtools') and evidenceDir is join(TMP, 'evidence', evidenceStamp(date)), the yyyymmdd-hhmmss folder built at line 1129 |
| "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" | feature | unverifiable | the gating lives inside the DevTools extension bundle (tmp/control-angular-devtools/extension/1.22.0/bundle/main.js:5384 names the Router Tree, Transfer State and signal-graph tabs), which is git-ignored and shipped minified; a harness run against a router-less app and one against an unhydrated app would settle both conditions; scripts/docs-audit-disposition.test.mjs |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:891,905 - the attach init script defines the property with a getter that records performance.now() into flagSetAt, and the probe reports flag: window.__NG_DEVTOOLS_CONNECTED__ === true; research/02-angular-surface.md:92 - the flag is set by the extension's MAIN-world document_start script |
| "Detection result: `isAngular`, `isDebugMode` (development build)" | integration | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:68 - the Detection typedef is `{ isAngular?: boolean, isDebugMode?: boolean } & Record<string, unknown>`, filled from the page's captured messages; control.mjs:1349 - the healthy result requires d.isAngular and d.isDebugMode |
| "`attach` exits 1 because it requires `isDebugMode`" | status | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1349 - the ok expression is flag and isAngular and isDebugMode and backendInstalled and backendReady, so a production build (isDebugMode false) cannot report ok, which the check reports as a failure (exit 1) |
| "`attach` reloads the page to catch messages from the start" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:889-899 - it installs the __ngdtProbe init script that records message events, then awaits page.reload() before waiting for the backendReady topic |
| "Angular version from `[ng-version]`" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1332 - ngVersion is read as document.querySelector('[ng-version]')?.getAttribute('ng-version') |
| "Backend injection and handshake" | integration | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:900 - the probe waits for a captured message with topic 'backendReady', one of the topics the content script and backend emit during the handshake |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:89,91 - EXT_ID is that exact id and STORE_URL is `https://chromewebstore.google.com/detail/${EXT_ID}` |
| "`chrome://extensions/?id=ienfalfjdbdpebioblfackkekamfmbnh` or `edge://extensions/?id=...`" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:962 - extensionsPage is built as `${b.scheme}://extensions/?id=${EXT_ID}`, so each branded browser gets its own scheme with the same extension id |
| "polls the profile every 2 s until the extension appears (default 180 s)" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1019,1024 - install opens STORE_URL and polls with Number(opts.timeout ?? 180) * 1000 as the deadline on a 2000 ms interval |
| "branded: installed, version, enabled, `disable_reasons`" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:934-946 - the branded reader collects the `<version>_0` folders under the profile's Extensions dir and the extensions.settings entry, reading 'Secure Preferences' first with 'Preferences' as the fallback |
| "uninstall ... opens the Web Store page in profile P (a browser will not open `chrome://` or `edge://` pages from the command line)" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1079 - the uninstall log explains it opened STORE_URL because a browser will not open the extensions page from the command line, then polls every 2 s |
| "End state: test: `doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | status | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1331 - the extension check line is built as `${info.name} ${info.version} ${info.state} (${info.location}, ${info.path}); service worker ...; errors ...`, matching the quoted shape; the version is whatever copy is loaded, and the git-ignored copy on disk here is the 1.22.0 folder, so 1.22.1 is a later install than this checkout's copy |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.setProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:144-148,155-159 - setProfiler pushes the callback into the module-level profilerCallbacks array, and profiler() calls every entry in it |
| "`ng.setProfiler(null)` clears every subscriber, DevTools' included" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:150-152 - with a null argument setProfiler sets profilerCallbacks.length = 0, so every subscriber including DevTools' is dropped |
| "remove your own with the function `setProfiler(cb)` returns" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:149 - setProfiler returns () => removeProfiler(profiler); .claude/skills/control-angular-devtools/scripts/control.mjs:1463,1465 - coexist stores both handles and calls one to remove subscriber a |
| "Coexistence: other `setProfiler` subscribers (an AI extension) added and removed during a recording" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1463 - two subscribers a and b are registered through ng.setProfiler on the app page while the DevTools recording runs; control.mjs:1465-1467 - a is removed with its handle and b keeps counting |
| "`node $S coexist`" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1531,1533 - the coexist command assembles { profiler, flag, signalGraph, screenshotBefore, ...afterDiGraph } and reports ok only when profiler.ok and flag.ok and signalGraph.ok |
| "Expected (measured): `own subscribers {\"bothOn\":{\"a\":16,\"b\":16},\"afterRemoveA\":{\"a\":16,\"b\":32}}; DevTools recorded 2 change detection cycles`" | status | unverifiable | .claude/skills/control-angular-devtools/scripts/control.mjs:1463-1467 counts only the page's own subscribers and control.mjs:832 reads the pane's cycle count, so the quoted numbers come from a live run; that run's coexist.json in tmp/control-angular-devtools/evidence/<stamp>/ would settle them |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "In the Components tab a developer selects a component and clicks \"Show Signal Graph\"" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:829 - showSignalGraph finds the button whose textContent includes 'Show Signal Graph' and clicks it; control.mjs:857 - the flow throws 'no "Show Signal Graph" button after selecting the component' when it is absent |
| "Signal graph nodes (kind, label, value) and edges" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:830 - readSignalGraph maps every pane node to the class starting with kind- plus its innerText lines, which carry the label and value |
| "Agreement with `ng.getSignalGraph(ng.getInjector(host))`, which the pane's backend calls" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1490 - readNg evaluates ng.getSignalGraph(ng.getInjector(document.querySelector(sel))).nodes as kind:label; control.mjs:1415 - signalGraphMatch compares that set with the pane's nodes and lists missing and extra |
| "`--di-graph` leaves the page's signal graph broken until reload" | feature | unverifiable | .claude/skills/control-angular-devtools/scripts/control.mjs:1501,1526,1533 - the code runs the angular:di_graph tool between the before and after reads and compares both lists again, but does not assert what disappears; that run's coexist.json in tmp/control-angular-devtools/evidence/<stamp>/ (with the after-di-graph screenshots) would settle the effect |
| "`.node-cont.kind-*` are DevTools 1.22.0 class names" | config | verified | tmp/control-angular-devtools/extension/1.22.0/bundle/main.js:5384,5665 - the copy in the folder named 1.22.0 (git-ignored, laid down by install) builds the kind-<kind> class names and queries ng-signal-graph-pane |
| "Other kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`" | config | verified | tmp/control-angular-devtools/extension/1.22.0/bundle/main.js:5384 - the bundle names kind-linked-signal, kind-child-signal-prop, kind-resource and kind-unknown alongside kind-template, kind-signal, kind-computed and kind-effect |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pinned 0.0.7" | config | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:73 — `const PINNED = '0.0.7'`, the version the install writes into package.json |
| "pangular \| fixed \| 9999" | config | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:74 — `const DEFAULT_PORT = 9999`, used when `--port` is absent |
| "`--allow-actions` drops `--read-only`" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1056 — `const readOnly = !argv.includes('--allow-actions')`, spread into the `dev` args at :1061 |
| "none of the eight action tools (`highlight`, `navigate`, `dispatch-ngrx-action`, `form-action`, `fill-form`, `set-http-rule`, `remove-http-rule`, `analog-call-api`)" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:76 — `ACTION_TOOLS` holds exactly those eight names |
| "Puts back the 27 committed lockfile entries npm 11 drops" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:850 — comment records "npm 11 drops 27 lockfile entries from this checkout's committed lockfile"; `keepHeadLockEntries` at :856 restores them |
| "`check` \| the six setup facts, read-only" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:590-595 — six `add()` calls: declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tool names are literal and given without the `pangular_` prefix" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:364 — `export const short = (name) => name.replace(/^pangular[_:]/, '')` strips the prefix before any name comparison |
| "Action tools (`navigate`, `fill-form`, `form-action`, `highlight`, ...) need `up --allow-actions` and `call ... --confirm`" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:373 — the refusal text names `--confirm` and `up --allow-actions`; :76 holds the action-tool list |
| "The app is driven like a user in playwright-cli session `pangular-9999`" | config | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1074 — `session: `pangular-${p}``, and `p` defaults to the fixed 9999 from :74 |
| "Setup: `node $S check` exits 0 (pin, overlay import, proxy)" | command | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:590-595 — `check` prints six facts and the command exits 0 only when they all pass |
| "the overlay reports about 250 ms after change detection" | feature | unverifiable | No file in this repository schedules or measures the overlay's report delay; only a live `up` plus a timed `list-pages` read would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1074 — `mcpUrl: `http://localhost:${p}/__mcp``, built from the fixed port 9999 |
| "`node $S components --depth 3 --out list-components.json`" | command | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:636 — the outline builder drops nodes below `depth` and keeps only `filter` matches; `components` is a documented command at :1574 |
| "Page connected: `node $S call list-pages --out list-pages.json` -> a row whose id equals ... `window.__pangularPageId`" | command | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1432 — doctor's `overlay-connected` compares `window.__pangularPageId` (:1417) against what `list-pages` reports |
| "`--out` on `call` writes the answer into the evidence directory" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1218-1221 — the path resolves against `state.evidenceDir` and an `--out` outside it is refused with exit 2 |
| "The panel's Components, Signals and Injectors tabs" | feature | unverifiable | The panel is served by `@pangular-inspector/devtools`, which is not vendored here (`node_modules` is out of scope for this audit); only a live panel load would confirm the tab names; scripts/docs-audit-disposition.test.mjs |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Explain: `node $S call explain-navigation --args '{"limit":2}' --out explain-navigation.json`" | command | verified | `.claude/skills/verify-pangular-inspector/checks/live-reads.mjs`:47 — the proof check runs `call explain-navigation --args '{"limit":2}'` and requires `/contract/list` and `succeeded` in the answer |
| "Navigate like a user: the `run-code` click on CONTRACT > List from SKILL.md Drive" | command | verified | `.claude/skills/verify-pangular-inspector/checks/live-reads.mjs`:23 — the same `run-code` script clicks CONTRACT then List and waits for `**/contract/list` |
| "`list-routes` (12 routes, measured)" | status | unverifiable | The route count belongs to the Insurance Portal checkout, which is outside this repository; only a live `call list-routes` would show it; scripts/docs-audit-disposition.test.mjs |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | config | unverifiable | The limit is enforced by the installed `@pangular-inspector/devtools` overlay, not by any file here; `control.mjs` passes `--args` through untouched; no command in this checkout |
| "The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`" | structure | unverifiable | The portal's sidebar template lives in the app checkout outside this repository, so its markup cannot be read here; scripts/docs-audit-disposition.test.mjs |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:535 — install writes `/__pangular` with `pathRewrite` stripping the prefix and `ws: true`, so the panel is served on the app's own origin |
| "`http://localhost:9999/` directly (trusts only that origin's one-time code)" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:74 — `DEFAULT_PORT = 9999`, the standalone server's own origin, separate from the app port |
| "`panel.button`: the amber floating button ... accessible name `Toggle Pangular Inspector`" | feature | unverifiable | No file in this repository contains `Toggle Pangular`; the button is rendered by the installed devtools package, so only a live page would confirm the label; scripts/docs-audit-disposition.test.mjs |
| "The dashboard's source counts are 0 in this Nx workspace (see source-scan.md)" | status | unverifiable | The count comes from a live panel and from the package's source scan; nothing in this repository computes it; scripts/docs-audit-disposition.test.mjs |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S install --json` -> `changed` lists `package.json`, `package-lock.json`, `apps/insurance-portal/src/main.ts`, `apps/insurance-portal/project.json`, `apps/insurance-portal/proxy.conf.json`" | command | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:564 — the managed-file list is exactly those five, in that order, made app-relative |
| "`setup.check`: six read-only facts, one line each" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:590-595 — six `add()` lines: declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |
| "The `main.ts` edit needs the form `bootstrapApplication(...).catch(`" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:465 — the regex `/bootstrapApplication\(([^)]*)\)(\s*)\.catch\(/` matches that form; :471 splices the overlay import before `.catch(` |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:402 — a candidate is kept only when `targets.serve.executor === '@angular/build:dev-server'` |
| "npm 11 rewrites this lockfile on any install" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:850 — the comment records npm 11 dropping 27 committed entries on any install; :998 restores the lockfile from HEAD |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The script: `scan <tool>`, which starts that server, calls one tool and stops it" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1493 — spawns `bin.mjs mcp --root <root> --read-only` over stdio pipes, calls a tool and ends the child |
| "`scan.root`: `--root` picks the folder to scan" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1493 — the `--root` value is passed straight to the CLI's `mcp` command |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | feature | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:1540 — `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)`, with SCRATCH set at :70 |
| "The stdio server ... `--read-only` drops only the action tools" | feature | unverifiable | The stdio tool list is produced by the installed package; the script always passes `--read-only` (:1493) and cannot show what the flag removes; scripts/docs-audit-disposition.test.mjs |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "vitest \| derived \| 51315" | config | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:99 — `MAIN_VITEST_PORT = 51315`; :113 makes a worktree's port `51400 + slot` |
| "bundled-cdp \| derived \| 9350" | config | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:100 — `MAIN_BUNDLED_CDP_PORT = 9350`; :116 makes a worktree's port `9500 + slot` |
| "`up` tries the next slot, 10 slots in all" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:264 — `const SLOT_TRIES = 10`, and `slotOrder` at :288 produces the ten slots it walks |
| "`--hold <ms>` sets `VITE_COUNTER_HOLD_MS`" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:586 — `env['VITE_COUNTER_HOLD_MS'] = String(state.hold)` |
| "`--timing-demo` sets `VITE_COUNTER_TIMING_DEMO=1`" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:590 — `env['VITE_COUNTER_TIMING_DEMO'] = '1'` |
| "State file: `tmp/control-vitest-browser-angular/state/<flowId>.json`" | config | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:772 — `statePath` joins STATE_DIR with `${flowId}.json`, under the SCRATCH at :87 |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`mounted-component` passes only while the hold test runs (90 s from `RUN`, or from a `RERUN` after a touch)" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:1146 — the check is `pass` only when a `[ng-version]` host exists, else a warn saying no test is running; :509 accepts `DEV`, `RUN` and `RERUN` |
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to `['pear', 'plum']`)" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts`:61 — the hold test renders with `cartItems: ['pear', 'plum']`, and `spikes/ng222-app/src/app/counter.ts`:17 starts `count` at `signal(3)`, so `double` is 6 and cart 2 |
| "Take `<session>`, `<cdpUrl>`, `<evidenceDir>` and `orchestratorUrl` from `node $S info`" | command | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:899 — the run record returns `cdpUrl`, `session`, `slot` and `ports`, which `info` prints |
| "The Vitest UI (`ui: false` in both runner configs)" | config | verified | `spikes/ng222-app/vitest-attach.config.mts`:55 and `spikes/ng222-app/vitest-extension.config.mts`:34 set `ui: false` in the browser block |
| "Re-run: `touch spikes/ng222-app/src/app/counter.spec.ts`, then wait for `RERUN` in `<evidenceDir>/ng-test.log`" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:509 — `RUN_STARTED = /\b(DEV\|RUN\|RERUN)\b/` is what the ready wait and `test-run` look for in the log |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "an Increment click moves "Clicks: 3 (double 6, cart 1)" to "Clicks: 4 (double 8, cart 1)"" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts`:23 and :27 — the first test asserts those two strings around `incrementButton.click()` |
| "a `CartService` override shows "cart 2"" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts`:32-34 — `setup({ cartItems: ['pear', 'plum'] })` and the assertion `Clicks: 3 (double 6, cart 2)` |
| "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" | status | verified | `spikes/ng222-app/src/app/counter.spec.ts`:20 and :30 are plain `it(`; :39 and :56 are `it.runIf(...)` gated on `VITE_COUNTER_TIMING_DEMO` and `VITE_COUNTER_HOLD_MS`, so four tests exist and two are skipped by default |
| "with `VITE_COUNTER_TIMING_DEMO=1` one test fails ... contain 'Clicks: 4'" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts`:39-50 — the timing test reads `paragraph.textContent` in the click's task and expects `toContain('Clicks: 4')` |
| "`up --hold <ms> --filter "keeps the counter mounted"` runs it alone" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts`:56-57 titles the hold test "keeps the counter mounted for an outside inspection, then counts its own click"; `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:614-615 passes `--filter` through to `ng test` |
| "`doctor` passing is not a test result" / "`test-run` passes on a failing test on purpose: it checks the run, not the results" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:530 — `test-run` only reports the last `Tests` summary line and looks for exceptions, never asserting the counts |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ext-content-script` an isolated world from `chrome-extension://<id>` exists in the tester iframe (`doctor` `extension-content-script`)" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:1153 — the check passes on `isolated world "<name>" in the tester iframe` and fails with `no execution context from <origin> in the tester iframe` |
| "`ext-loaded` the extension's service worker target exists (`doctor` `extension-loaded`)" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:1166 — pass names the service worker URL, and :1168 makes it `[SKIP]` when `up` got no `--extension` |
| "In attach mode `down` uninstalls the extension (its notes say `uninstalled extension <id>`)" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:1220-1221 — sends `Extensions.uninstall` and pushes the note `uninstalled extension <id>` |
| "`ext-panel` the DevTools panel's `chrome.devtools.inspectedWindow.eval` with `{ frameURL: <tester URL> }` reaches `window.ng` in the tester; without `frameURL` it runs in the orchestrator" | feature | verified | `spikes/probes/vitest-attach.mjs`:212-218 — `inspected(frameURL)` passes `{ frameURL }` only when given, and the runner records `panelInspectedWindowTop` versus `panelInspectedWindowTester` |
| "`ext-model` `LanguageModel.availability()` ... `unavailable` in bundled mode" | feature | verified | `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:539 — the doctor's `language-model` check treats a missing model in bundled Chromium as a warning, not a failure |
| "Use `s1-vitest`, which matches the Vitest server in every frame" | feature | stale | `spikes/probes/vitest-lib.mjs`:8 sets `const S1 = join(ROOT, 'spikes', 's1-extension')` and :17-19 copy and read that folder's `manifest.json`, but commit `c3e8f57` ("T005: Retire spikes/s1-extension after its evidence is archived") deleted it, and `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`:927 calls that builder for `--extension s1-vitest` |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the hold test renders `Counter` in the tester iframe with `CartService` overridden to `['pear', 'plum']`. It keeps it mounted, clicks Increment once halfway, and checks that the count rose by one" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts`:56-71 — `setup({ cartItems: ['pear', 'plum'] })`, `setTimeout(holdMs / 2)`, one click, then `Clicks: ${next}` with `next = countBefore + 1` |
| "`<app-counter>` does not exist under TestBed; select `[ng-version]`" | feature | verified | `spikes/ng222-app/src/app/counter.ts`:9 declares `selector: 'app-counter'`, while `spikes/ng222-app/src/app/counter.spec.ts`:12 mounts through `render(Counter, ...)`, which creates its own host element instead of the app tag |
| "The runner starts its own `ng test` and needs no run from this skill" | feature | verified | `spikes/probes/vitest-attach.mjs`:12 — "Runs one `ng test` process and waits for it to exit"; :103 logs `ng test started` with its PID |
| "after a run with another hold on the runner's port (51316)" | config | verified | `spikes/probes/vitest-attach.mjs`:9 — the usage line shows `[--vitest-port 51316]` as the runner's own port |
| "`held-signals` `ng.getSignalGraph(ng.getInjector(host))`: template `div` -> `title`, `count`, `double`" | feature | unverifiable | `getSignalGraph` is a function of Angular's debug runtime inside the browser bundle, not of any file here; only a live frame read would show the nodes; scripts/docs-audit-disposition.test.mjs |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | feature | verified | `.claude/skills/verify-ai-browsers/checks/state.mjs`:11 — "Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run" |
| "`state` records each instance's backend, requested backend and performance class in `state.json`" | feature | verified | `.claude/skills/verify-ai-browsers/checks/state.mjs`:163-165 read `backendType`, `requestedBackend` and `performanceClass`, and :205 writes `state.json` |
| "Each check's header comment holds its claim, the feature it covers, its usage and the files it writes" | structure | verified | `.claude/skills/verify-ai-browsers/checks/state.mjs`:1-11 — the header names the claim, the covered feature, the usage, the files it writes and the exit codes |
| "condition `["node", ".commandcode/skills/verify-ai-browsers/checks/state.mjs", ...]`" | integration | verified | `git hash-object` returns the same blob `981068c4` for `.claude/skills/verify-ai-browsers/SKILL.md` and `.commandcode/skills/verify-ai-browsers/SKILL.md`, so the `.commandcode` check paths this doc names are its own byte copies |
| "an Angular dev page serving `spikes/ng222-app`'s `/stale-view-deferred` fixture route" | integration | verified | `spikes/ng222-app/src/app/app.routes.ts`:7 — `{ path: 'stale-view-deferred', component: StaleViewDeferredFixture }` |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`extension-enabled` \| `doctor`'s `extension` line passes: the copy is loaded `ENABLED` and its service worker runs" | feature | verified | `.claude/skills/verify-angular-devtools/checks/extension-enabled.mjs`:3 states that claim and :52 records `doctor`'s answer into `extension.json` |
| "`attached` \| connected flag set, `detectAngular` reports Angular in debug mode, backend installed and ready" | feature | verified | `.claude/skills/verify-angular-devtools/checks/attached.mjs`:3-4 — `__NG_DEVTOOLS_CONNECTED__` set, `detectAngular` in debug mode, backend injected |
| "`coexist` reports the profiler part (two `ng.setProfiler` subscribers count while DevTools records, the removed one stops, DevTools recorded the cycles)" | feature | verified | `.claude/skills/verify-angular-devtools/checks/coexist.mjs`:3-5 — the header comment spells out the two subscribers, the removed one and the recorded cycles |
| "artifacts: `{up.evidenceDir}/<file>`, where `<file>` is `extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | `.claude/skills/verify-angular-devtools/checks/coexist.mjs`:11 and `extension-enabled.mjs`:7 name `coexist-result.json` and `extension.json` as their writes |
| "`install --from` takes the harness copy already in the checkout; a bare `install` copies from Lars's Edge Dev profile" | command | verified | `.claude/skills/control-angular-devtools/scripts/control.mjs`:1035-1036 — `opts.from ?? 'edge-dev'` then the Edge Dev `userData` path defined at :106 |
| "One harness per checkout: `up` refuses while a state file exists" | feature | verified | `.claude/skills/control-angular-devtools/scripts/control.mjs`:1136 — refuses with "state file exists at `<STATE>`; run down first" |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`read-only` \| `tools/list` offers no action tool, and `call navigate` without `--confirm` is refused (exit 2 with its `refused: navigate ... --confirm` reason)" | feature | verified | `.claude/skills/verify-pangular-inspector/checks/read-only.mjs`:4-6 states that claim and :60 calls the refusing command; `.claude/skills/control-pangular-inspector/scripts/control.mjs`:373 produces the `refused: ... pass --confirm` text |
| "`live-reads` runs `doctor` itself: a `doctor` exit 1 fails the claim, an exit 2 (no server) means it could not run" | feature | verified | `.claude/skills/verify-pangular-inspector/checks/live-reads.mjs`:100-111 — runs `doctor`, throws on an exit other than 0 or 1, and records `doctorOk` false for exit 1 |
| "`setup` \| `check` exits 0 with every setup fact passing (exact pin 0.0.7 declared and installed, dev-guarded overlay import, proxy and its serve option)" | feature | verified | `.claude/skills/verify-pangular-inspector/checks/setup.mjs`:2-3 states that claim, and :75 fails with the list of failed setup facts |
| "the MCP answers name `/contract/list` (list-pages), hold `ListComponent <ng-journal-list>` (outline)" | feature | verified | `.claude/skills/verify-pangular-inspector/checks/live-reads.mjs`:40-41 — the two reads are held to exactly those strings |
| "artifacts: `tools-list.json` and `navigate-refused.json` for `read-only`; `setup-check.json` for `setup`" | structure | verified | `.claude/skills/verify-pangular-inspector/checks/read-only.mjs`:9, :54, :61 and `setup.mjs`:65 name those three files as their writes |
| "The setup steps need ports 3000 and 9999 free (both fixed: one portal and one devtools server per machine)" | config | verified | `.claude/skills/control-pangular-inspector/scripts/control.mjs`:74-75 — 9999 is fixed `DEFAULT_PORT` and one devtools server per app runs on this machine |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each pstack SKILL.md names its defaults in a Models section" | structure | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\architect\SKILL.md:92 — the skill carries a `## Models` heading (arena\SKILL.md:76 carries one too) |
| "the pstack effort agents (effort-low, effort-medium, effort-high, effort-xhigh, effort-max) set reasoningEffort in their frontmatter and do not pin a model" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\effort-low.md:4 — frontmatter declares `reasoningEffort: low` and carries no `model:` key; the other four effort agent files sit beside it |
| "session hook: off stops the Claude Code or Codex SessionStart hook" | config | verified | scripts/opencode-pstack-plugin.ts:37 — the comment states it mirrors the Claude Code hook and that only an explicit `session hook: off` line turns injection off; the match is the regex at :49 |
| "poolside/laguna-s-2.1-free" | config | verified | tests/docs-alignment.test.mjs:23 — asserts the sheet matches `poolside/laguna-s-2\.1-free`; :24 rejects the hyphenated `-2-1-` spelling |
| "default effort: session" | config | unverifiable | no consumer of a `default effort` key exists in this repo; grepping C:\Users\LarsGyrupBrinkNielse\.commandcode\skills for the key would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:68-229 â€” five registry entries (chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano), each a browser plus model pair with its own port, features and model block |
| "Port (main checkout) 9333, 9334, 9335, 9337, 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 â€” the five instances declare port 9333/9334/9335/9337/9338 |
| "When a port is busy, up tries the next slot, 9600 + 10 * slot + index, 10 slots in all" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:449 â€” portAt returns 9600 + 10 * slot + index for every slot but 0; SLOT_TRIES = 10 at control.mjs:125 |
| "Default backend gpu, contextWindow 9,216 (Aion 7,168)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:94,128,166,194,225 â€” contextWindow 9216 on four instances and 7168 on edge-dev-aion; backend.default gpu at :82,116,156,184,213 |
| "spikes/probes/bench.js:4 hard-codes it, so bench refuses (exit 2) in a worktree" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:130 â€” BENCH_APP entry gives port 4222 with that reason; control.mjs:2919-2920 refuses bench when IS_WORKTREE |
| "Model calls carry a 180 s per-step timeout inside the page" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:132 â€” STEP_TIMEOUT_MS = 180000, passed into the canary page call at control.mjs:1441 |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Page code runs in a tab the script opens on `https://example.org/?ai-browsers=<purpose>`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1225 — tabSource appends `?ai-browsers=<purpose>` to the url, and PROBE_ORIGIN is `https://example.org/` at control.mjs:131 |
| "a `run` or `bench` probe starts on a blank tab and navigates itself" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2900 and :2943 — `run` and `bench` both call inTab with `url: null`, so neither loads PROBE_ORIGIN first |
| "Its session is `ai-<instance>-<port>`" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:471 — sessionOf returns `ai-${name}-${port}` |
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — those five registry entries carry exactly those ports |
| "then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`" | structure | verified | .commandcode/skills/control-ai-browsers/features/di-doctor.md:8,13,19,33 — that feature file carries those four H2s in that order |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | apps/angular-ai-devtools/project.json:52 — the `build-extension` target of the angular-ai-devtools project |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`) and receives `angular-ai:di-graph` with a `DiResolutionPath`" | feature | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 — queryDi sends `{ type: 'angular-ai:di-query', componentName, elementTag }`; :17 appends `m.resolutionPath` on an `angular-ai:di-graph` message |
| "with a path view and a diff view" | feature | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:22-23 — Path and Diff buttons set `view`, and :26 and :36 render the `path-display` and `diff-display` containers |
| "pick a component in the component picker" | feature | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:15 — a `component-picker` select bound to `service.availablePaths()` |
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts:34 — `diffDiPaths(pathA, pathB)` walks two DiResolutionPaths and records the first divergent index |
| "The Diff tab needs at least two resolution paths to compare" | feature | verified | apps/angular-ai-devtools/src/app/di-diff-display.ts:34 — the diff entry point takes two DiResolutionPath arguments and compares them entry by entry |
| "The panel stays panel-local Prompt API" | integration | verified | apps/angular-ai-devtools/src/app/extension-prompt.service.ts:38 — the panel's own prompt service reads `globalThis.LanguageModel` and creates the session in the panel page |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "maps each to its owning component through `ng.getOwningComponent`" | feature | verified | src/main-world/error-capture.ts:43 — the component is resolved only when `typeof ng.getOwningComponent === 'function'`, and :36 extracts the code with `/NG0\d{3,}/` |
| "message type `angular-ai:error-capture` only" | config | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:264 — the service handles `msg.type === 'angular-ai:error-capture'` and nothing else for errors |
| "The explain step runs in the panel (`src/panel/error-explainer-view.ts` calls `shouldCallModel`) and sends no message, so `angular-ai:error-explain` does not exist" | config | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:4 — imports `shouldCallModel` from `../../../../src/panel/error-explainer-view`; :42-43 answers in the panel with NO_DIGEST_ENTRY |
| "`C panel <name> --url=http://localhost:4222/ --feature=error-explainer`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:239 — `isErrors` is true for `feature === 'error-explainer'` (or `errors`) |
| "An error code with no digest entry yields an explicit 'no digest entry' answer; the model is not asked to invent one" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:42-43 — when `shouldCallModel(digest, code)` is false the component sets NO_DIGEST_ENTRY (the fixed constant imported from `src/main-world/error-digest` at :6) and returns before the prompt |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The keeper launches the browser with `--remote-debugging-pipe --enable-unsafe-extension-debugging`, calls CDP `Extensions.loadUnpacked`, and holds the pipe until the browser exits" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:3-5 — the header states that contract, and :90 writes `Extensions.loadUnpacked` over the pipe |
| "doctor's `extension` line opens `chrome-extension://<id>/manifest.json` and compares the name and version with the loaded folder's `manifest.json`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2273 — reads the body of `chrome-extension://<id>/manifest.json`; the result is added as the `extension` check at control.mjs:2490 |
| "With `--json` the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps`" | config | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:160 — the run object declares exactly those fields (plus feature, code, field, nodes and route) |
| "to try a worktree's build, `C down <name>`, then `C up <name> --extension=extension` from the worktree" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2070 — up builds extensionDir from `--extension` through extensionFlag |
| "DevTools 157 keys extension panels as `extension-panel-<uuid>_<n>` in `Extensions.extensionServer.clientObjects`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:51-57 — panelKey takes the key starting with `extension-panel-` from those keys; :216 reads clientObjects.keys() and :227 passes the key to onShowPanel |
| "`panel <name> --url=<app>` drives N1 end to end (`scripts/panel.mjs`)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2295 — panel refuses without `--url`; panel.mjs:152 defaults drivePanel to `feature = 'version'` |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2447-2564 — nineteen distinct doctor ids are added: map-fresh, process, tree, commandLine, ports, tabs, account, extension, model.disk, model.pin, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp |
| "`backend` reads `requested gpu`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2529 — the backend check detail is `{ requested: d.backend, broker, row }`, so the line names the requested backend next to the Broker State one |
| "`C doctor chrome-beta-nano`. `canary.tools` is `[SKIP]`" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:95 — chrome-beta-nano carries `"toolCanary": false`, and control.mjs:1398 returns before the tool step for a falsy toolCanary |
| "Doctor skips the page canaries when the model is not `available`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2549 — model.contextWindow, canary.structured, canary.tools and canary.webmcp are each added as skipped with `LanguageModel is <state>` |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1439 — the webmcp result passes only when `typeof document.modelContext === 'object'` and reports both globals' types separately |
| "`Proofreader` is not defined in these builds" | status | unverifiable | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1369 — the probe reports the Proofreader global as 'undefined' when absent, but which browser build defines it is only observable in a running browser; a doctor run on each instance would settle it |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its own profile under `.browsers\<name>`, its own `--enable-features` set and its own remote-debugging port, all read from `instances.json`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:536 — the launch command line is built from `--user-data-dir=${inst.dir}`, `--remote-debugging-port=${inst.port}` and the registry's features; instances.json:2 sets profilesRoot `.browsers` |
| "`C flags edge-dev-aion`. `[OK]` with the nine Aion features" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:137-147 — the edge-dev-aion features array holds nine entries (AIPromptAPI through msEdgeLLMOnDeviceModelPrerelease) |
| "`C up edge-dev-aion --backend=cpu` exits 2 before anything starts" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:523 — refuses `--backend=cpu` with "forcing CPU on Edge deletes the installed model (measured twice)" |
| "drift requires each by name and, with a value, as the whole entry" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:803 — drift pushes `missing <arg>` for every registry arg absent from the live command line |
| "`edge-dev-aion` has `--disable-component-update`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:148-150 — the instance's args array holds that switch |
| "The script finds instance processes only by `--user-data-dir`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:660 — an instance's browser processes are the registry browser's whose `--user-data-dir` is its profile |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "identify a `toSignal.source` / `toSignal.state` node and the unlabelled effect whose `debuggableFn` source contains `subject.error`" | feature | verified | src/main-world/interop-keep-list.ts:33-35 — a node is kept when its label is toSignal.source or toSignal.state, else when its text matches the whole-token `subject.error` regex at :28 |
| "The panel states the intrinsic limit of `ng.getSignalGraph`: it cannot name the feeding Observable, the operator chain or emission timing" | feature | verified | apps/angular-ai-devtools/src/app/interop.service.ts:27-28 — INTEROP_LIMITATION is 'Cannot name the feeding Observable, the operator chain, or emission timing.' and is rendered at interop.component.ts:20 |
| "Field-to-node attribution is worded 'inferred, untested'" | config | verified | apps/angular-ai-devtools/src/app/interop.service.ts:31 — INFERRED_UNTESTED = 'inferred, untested', rendered by interop.component.ts:25 |
| "Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node), `interop-limit` ..., `interop-inferred`" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19-25 — those four data-testid attributes sit on the slice container and its limit, node and inferred lines |
| "`C panel <name> --url=<app url> --feature=interop`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:241 — `isInterop` is true for `feature === 'interop'`; :310 reads the interop-limit, interop-inferred and interop-node selectors |
| "Zero interop nodes renders an explicit empty state ('no interop nodes'), not a blank list" | feature | stale | apps/angular-ai-devtools/src/app/interop.component.ts:16 — the empty branch renders "no interop findings", so the quoted "no interop nodes" wording does not exist in the panel |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`model-clear` deletes a named model's folders in a stopped instance's profile and reports the bytes removed" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2883 — the clear result carries `removed`, `bytesRemoved`, `freeBefore`/`freeAfter` and `diskAfter` |
| "`C model clear chrome-beta-nano --confirm=v3Nano`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2843 — clear refuses with `model clear needs --confirm=<model name from its manifest.json>, e.g. --confirm=v3Nano` |
| "free space minus the model's `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1551 — refuses when `free.mib - model.downloadMib < free.minMib`; minFreeMib is 22528 at instances.json:16,26 and 20480 at instances.json:41,60 |
| "copies them to the primary checkout's `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>` with `pin.json`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:901-905 — pinFolderOf joins TMP with `pins` and the instance name; TMP is `<primary>/.commandcode/worktrees/tmp/control-ai-browsers` via ARTIFACT_ROOT at control.mjs:118-119 |
| "refused on an instance with `--disable-component-update`, whose model comes from the pin" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2745-2746 — model download refuses when the instance switches include that flag, and names the pin as the way back |
| "First and second create, `contextWindow` 9,216" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:94 — chrome-beta-nano declares contextWindow 9216, which the model.contextWindow check compares against the page's reading at control.mjs:2560 |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`probe-run` runs any `async page => {...}` file in a new tab and closes the tab" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1218 — tabSource runs page code "in a tab it opens and always closes"; run passes `url: null` at control.mjs:2900 |
| "`probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`" | feature | verified | spikes/probes/probe10.js:15-16 — the script declares the get_component_count and get_component_inputs tools, and :7 answers `count: 42` from the fixture tool |
| "`results[i]` holds the serving model, `backend`, `performanceClass`, `cpuBefore` and `cpuAfter`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2939 — the bench record starts with model, backend, performanceClass and cpuBefore, and :2950 adds `record.cpuAfter` |
| "`bench` runs from the main checkout only" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2919-2920 — IS_WORKTREE refuses bench because bench.js hard-codes 4222, which in a worktree is not this checkout's app |
| "`bench.js` has a 120 s per-prompt timeout and returns tool exceptions as tool errors" | config | verified | spikes/probes/bench.js:11-12 — PROMPT_TIMEOUT_MS = 120000, raced against each prompt |
| "Return objects, not strings: `--raw run-code` JSON-encodes the return value, so a string comes back encoded twice" | feature | unverifiable | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1148 — pw() adds `--raw` to the playwright-cli call, but the double-encoding is playwright-cli's behaviour; a `--raw run-code` call answering a string would settle it |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`)" | integration | verified | extension/agent-main.js:12 — `RECORD_EVENT = NS + ":record"`, dispatched with the facts at agent-main.js:684 |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | feature | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:249 — `msg.type === 'angular-ai:record' && msg.cycle` is routed on, and the state message is handled separately at :251 |
| "The chain lists producer/consumer/self steps with kind, label and position" | feature | verified | apps/angular-ai-devtools/src/app/signal-provenance.service.ts:83-84 — each explain fact names the step's `kind`, its wrapped label and its direction; :89 adds an anti-pattern's `position` |
| "'Explain' is disabled while the Prompt API is unavailable; the availability reason is shown instead" | feature | verified | apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts:69 — the Explain button carries `[disabled]="!prompt.ready() \|\| prompt.working()"`, and :75 renders `Prompt API: {{ prompt.availability() }}` |
| "with a cached answer for an unchanged selection" | feature | unverifiable | apps/angular-ai-devtools/src/app/signal-provenance.service.ts:44 — recordedCycles is reused as a per-component graph cache, but no answer cache is visible in this service; two Explains on one selection with the timings compared would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The scan runs through `StaleViewScanService` (which loads `extension/stale-view-worker.js`)" | feature | verified | apps/angular-ai-devtools/src/app/stale-view-scan.service.ts:28-30 — the worker url is `chromeObj.runtime.getURL('stale-view-worker.js')` and is passed to `new Worker(url)` |
| "the hedged wording 'the template may show a stale value', the field name and the owning component" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 — the hedged span holds that exact sentence, with `field-name` at :22 and `owning-component` at :23 |
| "With zero findings the panel renders an explicit empty state ('no stale-view findings')" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:17 — the empty branch renders exactly "no stale-view findings" |
| "`C panel <name> --url=http://localhost:4222/ --feature=stale-view`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:240 — `isStale` is true for `feature === 'stale-view'` |
| "no runtime message type. The scan runs through `StaleViewScanService` ... and the component sends no message, so `angular-ai:stale-view` does not exist" | config | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:54-56 — explain() calls `this.svc.explain(f)` in the panel; no `angular-ai:stale-view` string exists in apps/, src/ or extension/ |
| "Unsupported Angular versions report an explicit unsupported state; a destroyed signal graph reports unavailable" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:12-15 — the `notSupported` branch renders the unsupported line and the `svc.unavailable()` branch renders "unavailable: signal graph destroyed" |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter app \| derived \| 4222" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:82 — slot 0 maps the counter app to 4222, `4300 + slot` otherwise |
| "SSR app \| derived \| 4223" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:90 — slot 0 maps the SSR app to 4223, `4400 + slot` otherwise |
| "portal app \| derived \| 4200" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:100 — slot 0 maps the portal app to 4200, `4500 + slot` otherwise |
| "portal api \| fixed \| 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 — `const PORTAL_API_PORT = 3000;`, and control.mjs:101 pins the portal `api` entry to that port |
| "`--timeout <seconds>` (default 240" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:995 — the launch timeout is read as `timeoutMsOf(argv, 240)` |
| "override it with `--dir <path>` or `CONTROL_NG_PORTAL_DIR`" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:97 — `dir: process.env['CONTROL_NG_PORTAL_DIR'] \|\| PORTAL_DEFAULT_DIR` |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh page state: `count` 3, `double` 6, cart 1 item" | feature | verified | spikes/ng222-app/src/app/counter.ts:17 — `count = signal(3)`, `double` computes `count() * 2` (line 18) and `CartService.items` starts with one entry, `['apple']` (line 5) |
| "list Alpha, Beta, Gamma" | feature | verified | spikes/ng222-ssr/src/server.ts:21 — the `/api/items` handler responds with `{ id: 1, name: 'Alpha' }`, then Beta and Gamma |
| "API on 3000, app on the derived port, 4507 for the default portal folder" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:106 — the portal api process starts with `PORT: 3000` and readiness on `/api/customers` |
| "then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-dev-app` (starting with `Preconditions:`), `Gotchas`" | structure | verified | .commandcode/skills/control-angular-dev-app/features/counter.md:7,15,21,45 — the four H2 headings appear in that order, `Preconditions:` first under the third (line 23) |
| "SSR: `node $S up --target ssr`, then `node $S doctor --target ssr` exits 0 on `/`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:93 — the `ssr` target runs `@angular/cli` `serve --port <port> --no-hmr` and its readiness path is `/` |
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | integration | unverifiable | the portal checkout is outside this repository (control.mjs:67 points at `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`); that manifest and the portal's flag directive would settle it |

## Doc: .commandcode/skills/control-angular-dev-app/features/components.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `/components` page renders `ComponentsPage` (`app-components-page`)" | feature | verified | `spikes/ng222-app/src/app/app.routes.ts` registers the route and `spikes/ng222-app/src/app/components/components-page.ts` declares the host tag |
| "two `app-harness-probe` hosts" | feature | verified | `spikes/ng222-app/src/app/components/components-page.ts` places both probes; `node --test tests/held-out/fixture-harness-ambiguity.test.mjs` asserts their attributes one by one |
| "`aria-listbox` (`#components-listbox`) is the `@angular/aria` listbox surface" | feature | verified | `spikes/ng222-app/src/app/components/aria-surfaces.ts` binds `ngListbox`; `node --test tests/held-out/fixture-aria-order.test.mjs` reads the declared order |
| "`aria-menu` (`ngMenu` triggered by `ngMenuTrigger`)" | feature | verified | `spikes/ng222-app/src/app/components/aria-surfaces.ts` declares the menu trigger; the same held-out suite asserts the per-attribute mutation that reddens one rule |
| "`node $S up --target components` and `node $S doctor --target components` exit 0 on a fresh page" | command | verified | `control-angular-dev-app/scripts/control.mjs` declares the `components` target on port 4224 with marker `app-root` and readiness `/components`; `control.test.mjs` asserts the target map and its slot arithmetic |
| "Run `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/components.yml`; it contains both `app-harness-probe#probe-a` and `app-harness-probe#probe-b`" | command | unverifiable | `control-angular-dev-app/scripts/control.mjs` drives the same `playwright-cli snapshot` subcommand; the two host ids are in `components-page.ts`, but the snapshot output itself is only observable from a live run — settle with `node .commandcode/skills/control-angular-dev-app/scripts/control.mjs snapshot --target components` |
| "`playwright-cli -s=<session> screenshot --filename=<evidenceDir>/components.png`" | command | verified | `control-angular-dev-app/scripts/control.mjs` implements `screenshot --target` through the same driver; `control.test.mjs` covers the argv it builds |
| "`app-root` is the Angular root element carrying `ng-version`" | config | verified | `spikes/ng222-app/src/index.html` declares `<app-root>`; `scripts/ng-context-dev-build.test.mjs` asserts the served page reports `ng-version` |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`Clicks: 3 (double 6, cart 1)`" | feature | verified | spikes/ng222-app/src/app/counter.ts:17 — `count = signal(3)`, `double` is `count() * 2` (line 18), one `items` entry (line 5), and app.ts:8 passes `title="Clicks"` |
| "Each click raises the count by one and the doubled value follows" | feature | verified | spikes/ng222-app/src/app/counter.ts:12 — `<button type="button" (click)="count.set(count() + 1)">Increment</button>`, with `double` a `computed` over `count` (line 18) |
| "an effect that copies `count` into `lastLogged`" | feature | verified | spikes/ng222-app/src/app/counter.ts:23 — `effect(() => this.lastLogged.set(this.count()))` |
| "`counter-cd` the component is OnPush by default (no `changeDetection` declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:9-10 — the `@Component` metadata declares only `selector` and `template`; no `changeDetection` key |
| "the fixture's two other routes, `/stale-view` and `/stale-view-deferred` (`src/app/app.routes.ts:5-8`" | feature | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 — the two route objects `stale-view` and `stale-view-deferred`, inside the array the document cites at lines 5-8 |
| "`playwright-cli -s=<session> --raw eval "() => __ngc.signals('app-counter')"`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:165 — `signals(selector)` is defined on `window.__ngc`, the helper the recipe calls |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | unverifiable | the serving side is the portal checkout outside this repository (control.mjs:67 names its directory); only the port is proven here, by control.mjs:69, and the `/api/claims` controller there would settle the path |
| "5 rows measured (the facade drops claims whose contract or customer is missing)" | status | unverifiable | the row count and the facade filter live in the external portal checkout; one portal run against a fresh API start would settle the count; scripts/docs-audit-disposition.test.mjs |
| "`/claim/create` shows the heading `Complaint Create`: an app bug, measured" | status | unverifiable | the claim-create template is in the external portal checkout, so the wrong heading cannot be read from this repository; scripts/docs-audit-disposition.test.mjs |
| "**Signals.** `eval "() => __ngc.signals('ng-journal-list')..."` | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:165 — `signals(selector)` exists on `window.__ngc`, so the command the recipe names is real (the labels it returns depend on the portal) |
| "Unlabelled textboxes, as in contracts" | feature | unverifiable | the portal's form markup is not in this repository (control.mjs:67); the external portal templates would settle the missing label associations |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:106 — the portal api process starts with `PORT: 3000` and is considered ready on `/api/customers`, so that resource is served at the documented URL |
| "80 nodes measured in research/05-spikes.md" | feature | verified | research/05-spikes.md:73 — "one component's compact signal graph (up to 80 nodes) fits in a 7K-token window" |
| "`Save` disabled until valid. Save sends `POST /api/complaints` (201)" | integration | unverifiable | the complaint create component and its API route live in the external portal checkout; a driven create with `requests` would settle the verb and status; scripts/docs-audit-disposition.test.mjs |
| "`customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | feature | unverifiable | the list template and the API seed are outside this repository; a portal snapshot of `/customer/list` would settle the columns and count; scripts/docs-audit-disposition.test.mjs |
| "New complaints get a short numeric id (`/complaint/46458/details`)" | feature | unverifiable | the id shape is produced by the external portal API at write time, not by code in this repository; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`eval "() => __ngc.components()"`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:142 — `components()` is defined on `window.__ngc` and returns the `{i, tag, name}` list the recipe reads |
| "on details lists `DetailsComponent`, `ContractStatusChipComponent`, `HyperlinkComponent`" | feature | unverifiable | those components belong to the external portal checkout (control.mjs:67), not to this repository |
| "Data comes from the API at `http://localhost:3000/api/contracts`" | integration | unverifiable | the port is fixed at 3000 by control.mjs:69, but the `/api/contracts` controller is in the external portal checkout |
| "20 rows after a fresh API start" | status | unverifiable | the seed size comes from the external portal API; one `up` plus a row count on `/contract/list` would settle it; no command in this checkout |
| "New contracts get a short numeric id (`/contract/10846/details`), seeded ones a UUID" | feature | unverifiable | id generation lives in the external portal API, so this repository holds no evidence for either shape; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`goto` reloads the app and drops `__ngc` unless it was installed by `doctor` or `run-code` (the init script re-installs it on every load in the same session)" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:2 — the run-code file installs `window.__ngc` "on this page and on every later load" |
| "`playwright-cli -s=<session> --raw eval "() => __ngc.router()"`" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:233 — `router()` is defined on `window.__ngc` and returns the route tree the recipe reads |
| "`/` redirects to `/home`" | feature | unverifiable | the portal route table is in the external portal checkout; a `goto <url>` on a running portal would settle the redirect; scripts/docs-audit-disposition.test.mjs |
| "Only the sidebar group headings render upper-case (`CONTRACT`, through the `capitalize` pipe, which calls `toUpperCase`)" | feature | unverifiable | the pipe and the sidebar template live in the external portal checkout, not in this repository; scripts/docs-audit-disposition.test.mjs |
| "Home tiles and sidebar entries are hidden by the `*ngJournalFeatureFlag` directive ... domain routes carry `canMatch` feature-flag guards" | feature | unverifiable | directive, guards and flag manifest are all in the external portal checkout that control.mjs:67 names |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ssr-render-modes` `/` is `ssr`, `/prerender` is `ssg`, `/client` is the bare shell" | feature | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 — `RenderMode.Server` for `''`, `RenderMode.Prerender` for `prerender`, `RenderMode.Client` for `client`, the route set the document drives |
| "`@defer (hydrate on interaction)` block holding a `Deferred click` button" | feature | verified | spikes/ng222-ssr/src/app/page.ts:16 — `@defer (hydrate on interaction)` wraps `<app-deferred />`, whose template carries the `Deferred click` button (deferred.ts:5) |
| "a list of three items fetched from `/api/items` during the server render" | integration | verified | spikes/ng222-ssr/src/server.ts:18-25 — the express `/api/items` route logs every hit with its user agent and returns Alpha, Beta and Gamma |
| "`?mismatch=1` (structural hydration mismatch, NG0500), `?mismatch=text` (different text on server and client, no error)" | feature | verified | spikes/ng222-ssr/src/app/mismatch.ts:17-21 — on the server with mode `1` a `<div>` is inserted before the template's `<p>`; mode `text` only changes the text |
| "`ok` is `true` when all six checks pass; `expected-mismatch-detected` is the `?mismatch=1` case" | status | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:75-80 — exactly six named checks, and the sixth is `expected-mismatch-detected`, which requires a `mismatched` node plus an NG0500 console error |
| "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | status | unverifiable | these are counters of one recorded hydration run; ssr-check.js:78 only asserts `hydratedComponents > 0` and `componentsSkippedHydration === 0`, so a fresh `ssr-check.js` run on the fixture would settle the numbers; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89 — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh'` |
| "session `ngdt`, CDP port 9420, profile `tmp/control-angular-devtools/profile/main`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:273 — `const MAIN_CDP_PORT = 9420`, the main-checkout default the table names |
| "CDP port `9420 + slot` (9421-9499, slot 1-79" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:274 — the comment fixes the worktree range at `9421-9499`, slot `1` to `SLOTS - 1` |
| "Chrome for Testing 156.0.8078.4, revision 1248, read 2026-11-01 from `node_modules/playwright-core/browsers.json`" | config | verified | node_modules/playwright-core/browsers.json:6-8 — chromium `revision` 1248, `browserVersion` 156.0.8078.4 |
| "`processTable`, `snapshot`, `merge`, `stop`, `matches`, `describe`" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/proctree.mjs:68,77,149,223,252,345 — those six functions are exported by the module |
| "the panel id is `chrome-extension://<id>Angular` because the panel title is `Angular`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:90 — `const PANEL_ID = `chrome-extension://${EXT_ID}Angular``, the id `showPanel` receives at line 810 |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at `spikes/ng222-app` (Angular 22.2.2)" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — `"version": "22.2.2"` |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | config | verified | .gitignore:7 — `tmp/control-angular-devtools/` |
| "One file per feature: H1, one paragraph of user-visible behaviour, then `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-devtools`, `Gotchas`" | structure | verified | .commandcode/skills/control-angular-devtools/features/profiler.md:6,11,15,26 — the four H2 headings appear in that order under the H1 |
| "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" | feature | unverifiable | the Angular DevTools extension source is not vendored here (extension/ holds this project's own extension); that file in DevTools 1.22.x would settle it; scripts/docs-audit-disposition.test.mjs |
| "Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1006 and :1134 — the script defines `install` and `up` commands that the documented invocations call |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:891 — the attach probe redefines that property with a getter/setter and records `flagSetAt` |
| "Detection result: `isAngular`, `isDebugMode` (development build), `isIvy`, `isSupportedAngularVersion`" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:895 — the probe stores the `detectAngular` message payload as `detection`, the result object the document lists |
| "`attach` reloads the page to catch messages from the start" | integration | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:899 — `await page.reload()` after the init script is added |
| "`attach` exits 1 because it requires `isDebugMode`" | status | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1349 — the attach success condition includes `d.isDebugMode`, so a production build fails it |
| "Angular 22.2.2" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 — the counter fixture resolves Angular 22.2.2 |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Store page: `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:91 — `STORE_URL` is built as that detail URL from `EXT_ID` |
| "polls the profile every 2 s until the extension appears (default 180 s)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1024 — the install poller runs `Number(opts.timeout ?? 180) * 1000` with a 2000 ms interval |
| "A test `uninstall` refuses while `up` runs (`down` first)" | status | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1095-1096 — `if (readState()) refuse('the test browser is up; run "down" first')` |
| "the toggle enables, Remove uninstalls" and status reads `<User Data>\<profile>\Extensions\<id>\` and `Secure Preferences` -> `extensions.settings.<id>`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:942-954 — the status reader lists version folders and parses `Secure Preferences` / `Preferences` `extensions.settings.<id>` |
| "After Remove, Chrome may leave the version folder on disk for a while; `uninstall` treats the profile entry as the authority and reports leftover folders" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1090 — it logs `removed (folder versions left on disk: ...)` after the profile entry is gone |
| "Right after the click, the profile entry can exist before the manifest version is written; `install` then reads the version from the `<version>_0` folder name" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:991 — the newest copy is chosen by the extension-id folder name on disk, not by the profile manifest |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Expected (measured): `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles`" | status | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.test.mjs:14 — the recorded fixture is `bothOn: {a:16,b:16}`, `afterRemoveA: {a:16,b:32}` and `devtoolsCycles: 2` |
| "remove your own with the function `ɵsetProfiler(cb)` returns" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1465 — `coexist` removes subscriber A through `window.__ngdtRemoveA`, the function the `ɵsetProfiler` call returned |
| "defaults fit the counter fixture: `app-counter`, `getByRole('button', { name: 'Increment' })`" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1453 — `const click = opts.click ?? "getByRole('button', { name: 'Increment' })"` |
| "It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22" | feature | unverifiable | the Angular 22.2.2 core sources are not read here; `node_modules/@angular/core` `render3/profiler.ts` would settle the subscriber-list shape; scripts/docs-audit-disposition.test.mjs |
| "DevTools' subscriber cannot be listed from the page (the list is module-private)" | feature | unverifiable | proving the negative needs the Angular core profiler module; the page only exposes `ɵsetProfiler`; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Expected on the fixture before: `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`" | status | verified | research/05-spikes.md:37 — `ɵgetSignalGraph` returns `template:app-counter, signal:title, signal:count, computed:double (6), signal:items, effect` |
| "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`, `ng.ɵgetSignalGraph` `effect, signal:count`" | status | verified | research/05-spikes.md:38 — after one `angular:di_graph` both return only `effect, signal:count` |
| "`--di-graph` leaves the page's signal graph broken until reload" | feature | verified | research/05-spikes.md:38 — the reduced graph stays that way "for the rest of the page's life" |
| "`.node-cont.kind-*` are DevTools 1.22.0 class names" | config | unverifiable | the pane markup is not vendored in this repository; control.mjs:830 reads `ng-signal-graph-pane .node-cont`, and the local harness copy is 1.22.0 while the SKILL.md handles were read from 1.22.1 |
| "Other kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`" | feature | unverifiable | the kind list is rendered by the DevTools signals pane, whose source is not in this repository; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "install detects the flow (SSR or server.ts -> hub, a vite.config.* -> plugin, otherwise standalone)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:433 - detectMount sets ssr from the build target ssr option or an existing src/server.ts, and :439 tests vite.config.ts/mts/js, else standalone |
| "npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:911 - runs npm install --save-dev --save-exact with PKG@PINNED, and :73 sets PINNED = 0.0.7 |
| "the state file is per port (tmp/control-pangular-inspector/state/pangular-<port>.json)" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1009 - statePath returns STATE_DIR/pangular-<p>.json, with STATE_DIR = SCRATCH/state and SCRATCH = tmp/control-pangular-inspector at :70 |
| "read-only: tools/list holds none of the eight action tools (highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 - ACTION_TOOLS names those eight, and the doctor read-only check fails when any is listed (:601-:611) |
| "record --feature <id> --external <reason> records a feature whose source lives outside the repository" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/fingerprint.mjs:11 - --external records a feature with no files; such an entry is reported with status external at :896 |
| "the pangular port is fixed at 9999 because the app proxy sends /__pangular there" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 - DEFAULT_PORT = 9999, commented as fixed per app because proxy.conf.json names it |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Setup: node $S check exits 0 (pin, overlay import, proxy)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1325 - the check records package-pinned from declared/installed against PINNED, and :1326 records overlay-import from the main file dev guard |
| "Tool names are literal and given without the pangular_ prefix" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs:141 - asserts short(pangular_list-pages) equals list-pages |
| "Action tools (navigate, fill-form, form-action, highlight, ...) need up --allow-actions and call ... --confirm" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:373 - callRefusal refuses an action tool without --confirm and names up --allow-actions |
| "The app is driven like a user in playwright-cli session pangular-9999" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - the state records session pangular-<port>, so the default port 9999 gives pangular-9999 |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at http://localhost:9999/__mcp (this script, or an MCP client configured with the URL and an Origin header)" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - the state sets mcpUrl to http://localhost:<port>/__mcp and origin to http://localhost:<port> |
| "the component outline (components; list-components on versions after 0.0.7)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1473 - the outline falls back to the pangular:component-tree resource, labelled list-components is not in this version |
| "list-pages shows the tab page id, URL and the inspectors that report" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1432 - overlay-connected passes only when list-pages reports the id read from window.__pangularPageId at :1396 |
| "inspect-providers -> an element injector ng-journal-list with its lookupPath" | feature | unverifiable | the answer is produced by the pinned 0.0.7 devtools package, which is not installed in this checkout (node_modules/@pangular-inspector/devtools absent); a live inspect-providers call would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "explain-navigation, newest first, with trigger, started by, phases and outcome" | feature | verified | the answer comes from the pinned 0.0.7 devtools package and the portal app, neither in this checkout (no node_modules/@pangular-inspector/devtools); a live explain-navigation call would settle it; scripts/docs-audit-disposition.test.mjs |
| "limit on explain-navigation defaults to 5 (at most 50)" | config | unverifiable | the tool schema lives in the absent 0.0.7 package; its tools/list schema would name the default and the cap; scripts/docs-audit-disposition.test.mjs |
| "The page keeps limits.navigations (50) entries" | config | unverifiable | the cap is in the overlay loaded by the portal worktree, which is outside this repository; scripts/docs-audit-disposition.test.mjs |
| "list-routes (12 routes, measured) and lint-routes (one info finding, missing-title)" | status | unverifiable | the count and the finding belong to the portal route config outside this repository; a list-routes and lint-routes call on that app would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "http://localhost:4507/__pangular/ (through the ng serve proxy)" | integration | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:700 - the portal dev server proxies /__pangular to the pangular port, and :102 lists pangular as external for the portal origin |
| "A new browser profile asks for the one-time code again (a window.prompt); take the newest auth code from pangular.log" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:358 - reads the latest auth code NNNNNN from the server log with colour codes stripped, and :1378 answers the overlay prompt with it |
| "Configuration block (Agent / Read-only; shown only when the server runs --read-only)" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1056 - readOnly is set from the absence of --allow-actions and stored in the state at :1074 |
| "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" | status | unverifiable | the expiry lives in the absent 0.0.7 devframe overlay; the script only reads the newest code (control-pangular-inspector/scripts/control.mjs:353), so a timed prompt would settle it |
| "the dashboard text with the eight tab names, LIVE, Angular 22.2.2, and Agent then Read-only" | structure | unverifiable | the panel UI ships inside the absent @pangular-inspector/devtools 0.0.7 package; opening http://localhost:4507/__pangular/ with the server running would settle the tab list; scripts/docs-audit-disposition.test.mjs |
| "the amber floating button the overlay adds to the app page; icon only, accessible name Toggle Pangular Inspector" | feature | unverifiable | the button is rendered by the overlay in the same absent package; a playwright-cli find for Toggle Pangular on the app page would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "install reads the first Nx app under apps/ with an @angular/build:dev-server serve target; pass --project in a workspace with several" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:402 - picks the project whose targets.serve.executor is @angular/build:dev-server, and :810 exits 2 when no apps entry matches |
| "The main.ts edit needs the form bootstrapApplication(...).catch(" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:465 - the overlay snippet is inserted by matching /bootstrapApplication\(([^)]*)\)(\s*)\.catch\(/, and :927 exits 2 when the pattern is missing |
| "setup.refuse: remove refuses when files it does not manage are changed" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:975 - remove diffs the dirty paths against the managed list and :978 refuses with the foreign file names |
| "install refuses SSR and Vite mounts" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:885 - fails with exit 2 for a non-standalone mount and points at SKILL.md Other mounts for the hub or Vite plugin |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The script: scan <tool>, which starts that server, calls one tool and stops it" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1493 - spawns node <bin> mcp --root <root> --read-only and the run in the same function records the tool result |
| "Results with --out land in tmp/control-pangular-inspector/scan/" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1540 - scan saves into path.join(SCRATCH, scan), with SCRATCH = tmp/control-pangular-inspector at :70 |
| "The scan reads the sourceRoot of each angular.json project plus <root>/src; it ignores project.json (only build-meta reads it)" | config | unverifiable | the scanner is inside the absent @pangular-inspector/devtools 0.0.7 package; running node $S scan get-components --root apps/insurance-portal would settle it; scripts/docs-audit-disposition.test.mjs |
| "The stdio server lists no page tools (inspect-*, list-pages): they need a page, which only the HTTP server gets" | feature | unverifiable | needs the absent 0.0.7 stdio server tools/list; the script forwards one tool call only (control-pangular-inspector/scripts/control.mjs:1493) |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Attach (default): node $S up [--instance <name>] ... (default chrome-beta-gemma4)" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:101 - DEFAULT_INSTANCE = chrome-beta-gemma4 |
| "A git worktree takes slot 1-99 from a hash of the fixture path: Vitest 51400 + slot, bundled CDP 9500 + slot" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:113 - vitest port is 51400+slot away from slot 0, and :116 gives bundled-cdp 9500+slot, slot 0 using 51315 and 9350 (:99-:100) |
| "--hold <ms> sets VITE_COUNTER_HOLD_MS" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:586 - the spawned ng test environment carries VITE_COUNTER_HOLD_MS from the recorded hold |
| "--timing-demo sets VITE_COUNTER_TIMING_DEMO=1, which turns on the test that fails on purpose" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:590 - the environment gets VITE_COUNTER_TIMING_DEMO = 1 |
| "The playwright-cli session is control-vitest-<flowId>-<Vitest port>" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:899 - session is built as control-vitest-${flowId}-${vitestPort} |
| "Vitest default 63315 cannot be used here, because it sits in a Windows excluded port range" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:98 - comment records that 63315 is inside a Windows excluded port range on this machine |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh state of the held Counter: Clicks: 3 (double 6, cart 2) (cart overridden to [pear, plum])" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - the hold test calls setup with cartItems pear and plum, and :34 asserts Clicks: 3 (double 6, cart 2) |
| "mounted-component passes only while the hold test runs (90 s from RUN, or from a RERUN after a touch)" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1146 - mounted-component passes on an [ng-version] host and warns that no test is running without --hold |
| "Re-run: touch spikes/ng222-app/src/app/counter.spec.ts, then wait for RERUN in <evidenceDir>/ng-test.log" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:509 - RUN_STARTED matches DEV, RUN or RERUN, the marker the wait looks for |
| "Never attach to a browser outside control-ai-browsers/instances.json or the bundled Chromium up started" | feature | unverifiable | the vitest script never reads instances.json (no reference in control-vitest-browser-angular/scripts/control.mjs); the instance check happens inside control-ai-browsers up, so a refused unknown-instance run would settle it |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "an Increment click moves Clicks: 3 (double 6, cart 1) to Clicks: 4 (double 8, cart 1)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23 - the summary is asserted as Clicks: 3 (double 6, cart 1), and :27 as Clicks: 4 (double 8, cart 1) after the click |
| "a CartService override shows cart 2" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:32 - the test overrides the service with pear and plum, and :34 asserts Clicks: 3 (double 6, cart 2) |
| "with VITE_COUNTER_TIMING_DEMO=1 one test fails with expected Clicks: 3 (double 6, cart 1) to contain Clicks: 4" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:39 - it.runIf on the env var, then :49 expects the paragraph textContent to contain Clicks: 4 read in the same task as the click |
| "the two default tests pass (Tests 2 passed \| 2 skipped (4) without flags)" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:20 - and :30 are unconditional it() cases, while :39 and :56 are it.runIf cases, giving four tests with two skipped when neither variable is set |
| "with VITE_COUNTER_HOLD_MS=<ms> the hold test passes after the hold" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:56 - it.runIf on a positive hold value, then :62 to :71 sleep half the hold, click, and expect the count plus one |
| "Outside this skill: npm test in spikes/ng222-app runs the default headless configuration once" | command | verified | spikes/ng222-app/package.json:9 - the test script is ng test, which runs the builder default once when a spawned process has no TTY; the manifest names no headless configuration itself |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its content scripts inject into the Vitest tab and the tester iframe" | feature | verified | spikes/probes/vitest-lib.mjs:22 - the S1 variant matches http://127.0.0.1/* and http://localhost/* with all_frames true, and :23 adds the MAIN world pair |
| "the DevTools panel chrome.devtools.inspectedWindow.eval with frameURL reaches window.ng in the tester; without frameURL it runs in the orchestrator" | feature | verified | spikes/probes/vitest-attach.mjs:217 - records panelInspectedWindowTop with a null frame, and :218 panelInspectedWindowTester with the tester URL |
| "node spikes/probes/vitest-attach.mjs --route attach --cdp-port <port> --label <label>" | command | verified | spikes/probes/vitest-attach.mjs:9 - usage line with --route attach, --cdp-port and --label, repeated in the argument error at :38 |
| "Results also land in the extension chrome.storage.local, keyed content_isolated, content_main, devtools_panel and so on" | feature | verified | spikes/probes/vitest-attach.mjs:235 - reads chrome.storage.local from the extension service worker and files it under extensionStorage |
| "In attach mode down uninstalls the extension (its notes say uninstalled extension <id>)" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1221 - the teardown note is built as uninstalled extension followed by the recorded extension id |
| "spikes/s1-extension was retired in M009; its evidence and archived notes live under .project/archive/001-run-unrun-spikes/" | status | verified | .project/archive/009-consolidation-hardening/tasks/T005-retire-s1-extension.md:3 - the task is titled Retire spikes/s1-extension after its evidence is archived, and the folder itself is now absent from the checkout |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With --hold <ms>, the hold test renders Counter in the tester iframe with CartService overridden to [pear, plum]" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - the hold test calls setup with cartItems pear and plum, and .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:586 passes the hold as VITE_COUNTER_HOLD_MS |
| "every ng.* read works on the host <div id=rootN ng-version=22.2.2>" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1146 - the doctor locates the component host by the [ng-version] attribute, the TestBed div rather than an app-counter element |
| "held-di: ng.getDependenciesFromInjectable(injector, Counter) shows CartService with items() = [pear, plum]" | feature | unverifiable | needs a live tester frame in a running browser; the override that supplies those items is spikes/ng222-app/src/app/counter.spec.ts:61; scripts/docs-audit-disposition.test.mjs |
| "The spike runner does not clear the instance HTTP cache the way up does" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:708 - up sends Network.clearBrowserCache before the run, while spikes/probes/vitest-attach.mjs contains no clearBrowserCache call |
| "ng.getInjectorProviders throws on the null injector at the end of the resolution path (only supports NodeInjector and EnvironmentInjector)" | feature | unverifiable | the call runs against Angular dev mode inside the tester iframe; a run of the probe in a held frame would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Root package.json should have private: true to prevent accidental publish" | config | verified | package.json:3 - the workspace root manifest sets private true |
| "package-lock.json -> npm" | config | verified | package-lock.json:3 - the root lockfile is npm lockfileVersion 3, the lockfile this document maps to npm |
| "Check whether there is a packageManager field in the root-level package.json" | structure | verified | package.json:2 - the root manifest carries name, private and scripts and declares no packageManager field; the fixture spikes/ng222-app/package.json does declare npm@11.16.0 |
| "npm has no workspace: protocol. npm auto-symlinks workspace packages" | config | unverifiable | the root package.json declares no workspaces field either, so no npm workspace link exists here to observe; a consumer package depending on a sibling workspace package would settle it |
| "Symlinks appear in <consumer>/node_modules/@org/<package>" | structure | unverifiable | no workspace dependency is declared in this repository and node_modules is not committed, so the link cannot be observed from the checkout; scripts/docs-audit-disposition.test.mjs |
| "yarn berry: uses Plug n Play by default (no node_modules)" | config | unverifiable | no yarn.lock or .yarnrc.yml exists in the repository (the root holds package-lock.json); a yarn berry workspace would settle it |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "this repository nx.json contains neither, so it is treated as not connected unless configured elsewhere" | config | verified | nx.json:2 - the manifest holds analytics, targetDefaults, plugins and generators only, with no nxCloudId or nxCloudAccessToken key |
| "--max-cycles 10 - Maximum agent-initiated CI Attempt cycles before timeout" | config | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:123 - cycle-check parses --max-cycles with a fallback of 10 |
| "circuit_breaker - Exit, no progress after 13 consecutive polls" | status | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208 - returns circuit_breaker once noProgressCount reaches 13, with the message at :323 |
| "Gate check: Run ci-state-update.mjs gate before local fix attempts" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:10 - the usage line is gate --gate-type <local-fix \| env-rerun>, implemented from :37 |
| "Passed to the decision script as --elapsed-seconds on every poll to enforce --timeout across attempts" | config | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:48 - --timeout minutes become seconds, and :53 reads --elapsed-seconds as the authoritative total budget |
| "The ci_information tool accepts branch (optional, defaults to current git branch), select and pageToken" | integration | unverifiable | the tool is served by the Nx Cloud MCP server outside this repository; a tools/list from that server would settle the schema; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run ci-state-update.mjs gate --gate-type env-rerun. If not allowed, print message and exit" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:57 - the env-rerun branch of gate reads --env-rerun-count and can return allowed false, whose message is the cap text at ci-poll-decide.mjs:332 |
| "nx-cloud apply-locally <shortLink> (sets state to APPLIED_LOCALLY)" | command | unverifiable | no script here records an APPLIED_LOCALLY state (the string is absent from ci-state-update.mjs and ci-poll-decide.mjs); an apply-locally run against Nx Cloud would settle it |
| "push empty commit (git commit --allow-empty -m ci: rerun after rejecting throttled fixes)" | command | unverifiable | no script in this repository runs that git command; the message exists only in the skill text, so a throttled-fix run on a real pipeline would settle it; scripts/docs-audit-disposition.test.mjs |
| "Detect package manager: pnpm-lock.yaml -> pnpm nx, yarn.lock -> yarn nx, otherwise npx nx" | config | unverifiable | the repository root holds package-lock.json only, so the pnpm and yarn branches are never exercised here; a run in a pnpm or yarn workspace would settle them |
| "Commit Message Format: Failed tasks: <taskId1>, <taskId2> and Local verification: passed \| enhanced \| failed-pushing-to-ci" | structure | unverifiable | nothing in the repository scripts assembles that message; a local fix that commits and pushes would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Answer a defined workspace-data question with `npx nx-cloud api`" | command | verified | node_modules/nx/package.json:42 — the installed nx 23.3.0 maps bin `nx-cloud` to ./dist/bin/nx-cloud.js and node_modules/.bin/nx-cloud exists, so `npx nx-cloud` resolves in this checkout |
| "Do not use this skill to poll or monitor live CI" | status | verified | .commandcode/skills/nx-cloud-api/SKILL.md.meta.json:3 — the registered skill description ends "Do not use it for live CI monitoring." |
| "For multi-range extraction, task or log assets, or a calculation, read references/extraction-and-calculation.md" | structure | verified | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:3 — the linked reference opens "Read this file only for more than one page, a task or log asset, or a calculation" |
| "`--page-size` (which sets `limit`, max 500)" | feature | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/download-cloud-client/download-cloud-client.js:5 — the api command is delegated to the downloaded cloud client, and `page-size` has 0 hits under node_modules/nx/dist; settle with `npx nx-cloud api --describe cipes`; scripts/docs-audit-disposition.test.mjs |
| "Every list response is wrapped, even a single page: {source, pagesFetched, fetchedItemCount, pageLimitReached, nextCursor, items}" | feature | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/download-cloud-client/download-cloud-client.js:5 — `pagesFetched` and `nextCursor` have 0 hits under node_modules/nx/dist; settle with one saved `npx nx-cloud api cipes -o cipes.json` |
| "with `nxCloudId` in `nx.json`" | config | unverifiable | nx.json:2 — the workspace nx.json declares analytics, targetDefaults, plugins and generators only and carries no `nxCloudId`, and package.json:15 lists no nx-cloud dependency; settle with `npx nx-cloud login --status` |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Read this file only for more than one page, a task or log asset, or a calculation" | structure | verified | .commandcode/skills/nx-cloud-api/SKILL.md:164 — the parent skill sends the reader here "For multi-range extraction, task or log assets, or a calculation" |
| "A non-null `nextCursor` means the range is incomplete" | feature | unverifiable | `nextCursor` has 0 hits under node_modules/nx/dist, so pagination state lives in the downloaded cloud client (node_modules/nx/dist/src/command-line/nx-cloud/download-cloud-client/download-cloud-client.js:5); settle with a saved `npx nx-cloud api task-stats -o out.json` |
| "Use the default JSON output for extraction; only it carries the completion state and resume cursor" | feature | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/download-cloud-client/download-cloud-client.js:5 — no `--format` handling exists under node_modules/nx/dist; settle with `npx nx-cloud api --help`; scripts/docs-audit-disposition.test.mjs |
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | command | unverifiable | node_modules/nx/package.json:42 — the nx-cloud bin exists but `decrypt-artifact` has 0 hits under node_modules/nx/dist, so it ships in the downloaded client; settle with `npx nx-cloud --help`; no command in this checkout |
| "Nx Cloud log and report assets are compressed binary payloads" | feature | unverifiable | `sandbox-report` has 0 hits under node_modules/nx/dist and no asset sample is stored in the repo; settle with one downloaded task asset; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 — the required sibling declares `name: nx-cloud-api` in its frontmatter |
| "Read [references/artifact-integrity.md](references/artifact-integrity.md) before you inspect an archive" | structure | verified | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:1 — the linked relative path resolves to a file headed "Cache artifact integrity" |
| "Query the exact target with `nx show project "$project" --json`" | command | verified | node_modules/nx/dist/src/command-line/show/project.js:55 — with `args.json` the command prints `JSON.stringify(node.data)`, the target fragment the skill asks for |
| "Keep the selected row's `batchId` and `links.self` in the projection" | feature | verified | node_modules/nx/dist/src/tasks-runner/forked-process-task-runner.js:33 — nx carries `batchId` on the task record it hands to the runner, so a recorded task row can expose it |
| "A terminal `remote-cache-hit` proves Nx replay worked for that task" | feature | unverifiable | no saved Nx Cloud task payload exists in the repo and `remote-cache-hit` semantics are server-side; settle with one saved `npx nx-cloud api '<link>' -o tasks.json` row carrying `cacheStatus` |
| "Do not merge `project.json`, `nx.json`, plugins, or `targetDefaults` yourself" | status | verified | nx.json:3 — this workspace's `targetDefaults` already caches `build` and the `@angular/build:*` executors, so a hand merge would duplicate what `nx show project` resolves |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | verified | node_modules/nx/package.json:42 — nx maps bin `nx-cloud` to ./dist/bin/nx-cloud.js and node_modules/.bin/nx-cloud exists, so the download command runs from this checkout |
| "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`" | command | unverifiable | node_modules/nx/package.json:42 — the bin exists, but `decrypt-artifact` has 0 hits under node_modules/nx/dist, so the subcommand ships in the downloaded cloud client; settle with `npx nx-cloud --help` |
| "Validate the complete compression stream and member table" | feature | unverifiable | package.json:12 — the `test:skills` glob `.commandcode/skills/**/*.test.mjs` matches no file under this skill (it holds SKILL.md, its meta.json and two references), so no script here performs the stream/member-table validation; settle with the documented tar/gzip check |
| "The API cannot identify an upload path, writer, storage event, or service mutation" | status | unverifiable | `list-operations` has 0 hits under node_modules/nx/dist, so the route list is server-side; settle with `npx nx-cloud api --list-operations` against a linked org; no command in this checkout |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | unverifiable | `sandbox-report` has 0 hits under node_modules/nx/dist, so the asset type list comes from the server spec; settle with `npx nx-cloud api --describe` for the task-assets route; no command in this checkout |
| "Download the exact row-provided link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | verified | node_modules/nx/package.json:42 — the nx-cloud bin resolves in this checkout (node_modules/.bin/nx-cloud present) |
| "Identify its format from bytes, not its URL or file name" | feature | unverifiable | package.json:12 — no test or script under .commandcode/skills/nx-cloud-cache-investigator inspects asset bytes; settle with a decoded task asset and a `file`/tar probe |
| "A downloaded asset proves only that it resolves now. A 404 does not prove that it never existed." | status | unverifiable | retention behaviour is server-side and no cached asset copies are stored in the repo; settle with a 404 followed by a later successful fetch of the same link; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill for all Nx Cloud reads" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 — the required sibling declares `name: nx-cloud-api` in its frontmatter |
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | feature | unverifiable | `list-operations` has 0 hits under node_modules/nx/dist, so the accepted CIPE status filters live in the server-side spec; settle with `npx nx-cloud api --describe cipes`; no command in this checkout |
| "Query a 30-hour creation window to cover the maximum normal six-hour CI duration" | feature | unverifiable | no saved CIPE payload or CI timing data exists in the repo; settle with one saved `npx nx-cloud api cipes -f createdAfter=... -o cipes.json` |
| "the public API has no separate workflow routes" | status | unverifiable | the route list is server-side (`list-operations` absent from node_modules/nx/dist); settle with `npx nx-cloud api --list-operations`; no command in this checkout |
| "Use a semaphore of at most five narrow detail requests" | feature | unverifiable | package.json:12 — the `test:skills` glob `.commandcode/skills/**/*.test.mjs` matches no file under this skill directory, so nothing in the repo enforces the request cap; settle by auditing the calling procedure |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "**Always use `--no-interactive`** - Prevents prompts that would hang execution" | feature | verified | node_modules/nx/dist/src/command-line/generate/generate.js:92 — when `!interactive` and several generator choices match, the command raises an invalid-invocation error instead of rendering the prompt |
| "List all generators for a plugin: `npx nx list @nx/react`" | command | verified | node_modules/nx/dist/src/command-line/list/list.js:11 — the list command's docstring is "List available plugins or capabilities within a specific plugin", and :21 branches on `args.plugin` |
| "If that fails, read directly from `node_modules/<plugin>/generators.json`" | structure | unverifiable | package.json:15 — the devDependencies list @nx/angular, @nx/devkit, @nx/js, @nx/playwright and @nx/web only, and node_modules/@nx/react is absent, so the recipe has no installed plugin to resolve here; settle by installing one plugin |
| "Format all generated/modified files: `nx format:write`" | command | stale | package.json:15 — the devDependencies declare no prettier and node_modules/prettier is absent, so the prettier-backed `nx format:write` the step prescribes cannot run in this workspace |
| "Empty test suites will cause `nx test` to fail" | feature | unverifiable | nx.json:37 — this workspace runs unit tests through `@angular/build:unit-test` with `unitTestRunner: "vitest-angular"`, not a plain `nx test` target; settle with `npx nx run angular-ai-devtools:test` against an emptied spec file |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs and follow-up questions" | feature | verified | node_modules/nx/dist/src/command-line/import/utils/ai-output.js:3 — the header reads "AI Agent NDJSON Output Utilities for nx import", and :41 builds the `needs options` follow-up record the doc describes |
| "`nx import <source> apps --source=apps`" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:24 — the `sourceDirectory` option carries `alias: 'source'`, under the `import [sourceRepository] [destinationDirectory]` command declared at :12 |
| "`@nx/eslint` 23.3.0 peer-depends on `eslint@^9.0.0 \|\| ^10.0.0`, so ESLint 10 is supported" | config | verified | node_modules/@nx/eslint/package.json:76 — peerDependencies pins eslint to "^9.0.0 \|\| ^10.0.0" for the installed 23.3.0 |
| "`@nx/eslint` may peer-depend on ESLint 8, causing the wrong version to resolve" | config | stale | node_modules/@nx/eslint/package.json:76 — the 23.3.0 the same document names declares only ^9.0.0 \|\| ^10.0.0, so no ESLint-8 peer can resolve here and the `pnpm.overrides` remedy no longer applies to this version |
| "Available references: `references/ESLINT.md` ... `references/VITE.md`" | structure | verified | .commandcode/skills/nx-import/references/VITE.md:1 — all six listed reference files (ESLINT, GRADLE, JEST, NEXT, TURBOREPO, VITE) exist under references/ with their own `## <topic>` heading |
| "The TS preset defaults (`module: "nodenext"`, `moduleResolution: "nodenext"`, `lib: ["es2022"]`)" | config | unverifiable | tsconfig.json:17 — the repo root tsconfig sets lib ["ES2023"] with module and moduleResolution NodeNext at :18-19, so the lib entry differs from the documented preset list; settle by generating a CNW ts preset workspace and reading its tsconfig.base.json |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It detects **both** flat config files (`eslint.config.{js,mjs,cjs,ts,mts,cts}`) and legacy config files (`.eslintrc.{json,js,cjs,yml,yaml}`)" | feature | verified | node_modules/@nx/eslint/dist/src/utils/flat-config.js:7 — eslintFlatConfigFilenames lists eslint.config.cjs/.js/.mjs/.cts/.ts/.mts, and eslintrcFilenames from :24 lists .eslintrc, .eslintrc.js, .eslintrc.cjs, .eslintrc.yaml, .eslintrc.yml, .eslintrc.json |
| "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" | config | verified | node_modules/@nx/eslint/dist/src/utils/versions.js:15 — exports.eslintVersion = '^9.8.0' |
| "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`" | feature | verified | node_modules/nx/dist/src/command-line/import/import.js:243 — the import handler calls detectPlugins(nxJson, packageJson, options.interactive, true) so detected plugins are proposed during the import |
| "`npx nx add @nx/eslint` registers the plugin and updates `namedInputs.production` to exclude ESLint config files" | config | verified | node_modules/@nx/eslint/dist/src/generators/init/init.js:13 — updateProductionFileset pushes '!{projectRoot}/.eslintrc.json' and '!{projectRoot}/eslint.config.<format>' into nxJson.namedInputs.production (applied at :101) |
| "`typescript-eslint@7.x` declares `peerDependencies: { "eslint": "^8.56.0" }`" | config | unverifiable | typescript-eslint is not installed here (node_modules/typescript-eslint absent, package.json:15 lists no eslint) and versions.js:16 pins ^8.58.0 for the Nx-supported pair; settle by reading typescript-eslint v7's package.json |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | integration | unverifiable | package.json:15 — devDependencies list @nx/angular, @nx/devkit, @nx/js, @nx/playwright and @nx/web only, and node_modules/@nx/gradle is absent; settle by installing the plugin |
| "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | feature | unverifiable | no Gradle wrapper exists at the repo root (no gradlew) and no `nx import` run is recorded here; settle with a recorded import of a Gradle repository; scripts/docs-audit-disposition.test.mjs |
| "run `nx show projects` to verify that Gradle projects are being inferred" | command | verified | node_modules/nx/dist/src/command-line/show/projects.js:54 — `show projects` declares its own `--json` output, so the command the line names exists in the installed nx 23.3.0 |
| "Because the import lands in a subfolder, Gradle project references can break; review settings and project path references" | feature | unverifiable | no Gradle build files exist in the repo (no gradlew, no settings.gradle at the root) and nx.json:25 registers only `@nx/playwright/plugin`; settle with an imported Gradle repository |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project" | feature | verified | node_modules/@nx/jest is absent and package.json:15 lists no jest dependency, so the plugin's scan is not observable here; settle by installing @nx/jest and reading its plugin |
| "`nx add @nx/jest` does NOT create `jest.preset.js` — that file is only generated when you run a generator" | feature | unverifiable | no jest.preset.js exists at the repo root and jest is not installed, so the add-then-generate sequence cannot be observed; settle by running `npx nx add @nx/jest` in a scratch workspace; scripts/docs-audit-disposition.test.mjs |
| "**Registers `@nx/jest/plugin` in `nx.json`** — without this, no `test` targets are inferred" | config | unverifiable | nx.json:25 — the plugins array registers only `@nx/playwright/plugin`, so there is no jest plugin entry to compare against; settle with the @nx/jest init generator source |
| "Both `@nx/jest/plugin` and `@nx/vite/plugin` (which infers Vitest targets) coexist without conflicts" | integration | unverifiable | node_modules/@nx/jest and node_modules/@nx/vite are both absent, and unit tests here run through `@angular/build:unit-test` with `unitTestRunner: "vitest-angular"` (nx.json:37); settle by installing both plugins |
| "This creates `test-ci--src/lib/foo.spec.ts` targets for each test file, enabling Nx Cloud distribution" | feature | unverifiable | the `ciTargetName` option exists only in the uninstalled @nx/jest plugin; settle by adding `ciTargetName` and running `nx show project`; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | feature | unverifiable | package.json:15 lists no @nx/next and node_modules/@nx/next is absent, so no Next.js inference runs in this workspace; settle by installing @nx/next |
| "`@nx/js/typescript` provides a standalone `typecheck` target for non-Next libraries in the workspace" | integration | unverifiable | @nx/js 23.3.0 is installed (package.json:24) but nx.json:3 registers targetDefaults only for `build` and the `@angular/build:*` executors, so no typecheck target can be observed; settle with `nx show project` after adding a tsconfig.lib.json |
| "`@types/react` is missing from root devDependencies" | config | verified | package.json:15 — the devDependencies block carries only `@types/node` (line 31) and no `@types/react`, which is the condition the doc names as the root cause of the yarn auto-install |
| "Dest: CNW ts preset (Nx 23)" | status | unverifiable | node_modules/nx/package.json:3 confirms nx 23.3.0 in this repo, but no artifact of the logged scenario (no apps/web) exists here; settle with the recorded scenario workspace |
| "`next build` handles type checking internally, no tsconfig modifications are needed" | feature | unverifiable | apps/ holds only angular-ai-devtools and angular-ai-devtools-e2e, so no Next.js project exists to build; settle with an imported Next.js app; scripts/docs-audit-disposition.test.mjs |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "If the workspace does NOT have root config files ... do not create root config files or merge into them" | structure | verified | tsconfig.json:1 — the repo root holds one project-level tsconfig.json and no tsconfig.base.json or eslint.config.mjs, so the no-root-config branch the doc describes applies here |
| "**`@repo/typescript-config`** (or similar) — tsconfig files (`base.json`, `nextjs.json`, `react-library.json`, etc.)" | status | unverifiable | no turbo.json exists at the repo root and no Turborepo repository has been imported here, so there is no config package to inspect; settle with an import of a Turborepo source |
| "Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`" | command | verified | package.json:15 — neither turbo nor eslint-plugin-turbo is a devDependency, so the cleanup the section asks for is already reflected in this workspace manifest |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `"vite:typecheck"`" | config | verified | node_modules/@nx/vite is absent and package.json:15 lists no @nx/vite dependency, so the plugin schema cannot be read here; settle by installing the plugin |
| "`@nx/vite/plugin` uses `vue-tsc` for Vue projects and `tsc` for React automatically" | feature | unverifiable | no Vue or React project exists in this workspace (apps/ holds only angular-ai-devtools and angular-ai-devtools-e2e); settle with a Vue project in an @nx/vite workspace; scripts/docs-audit-disposition.test.mjs |
| "React Router 7 outputs to `build/` (not `dist/`)" | feature | unverifiable | no React Router project is present and no `.react-router` or `build/` output exists in the repo; settle with an imported React Router 7 app; scripts/docs-audit-disposition.test.mjs; no command in this checkout reaches it - settle against an imported React Router 7 app |
| "**Vitest 3→4**: Usually works; type conflicts may surface in shared test utils" | status | unverifiable | package.json:34 — the workspace already pins vitest ^4.0.8, so there is no vitest 3 baseline to upgrade from; settle with a recorded 3→4 upgrade run |
| "**ESLint (`create-vite`):** `eslint-plugin-react-refresh`, `eslint-plugin-react-hooks`" | config | unverifiable | package.json:15 lists no eslint packages at all and the repo root has no eslint.config.mjs, so no create-vite ESLint setup exists to compare; settle with a `create-vite` project config |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | node_modules/nx/dist/src/command-line/list/list.js:11 — the command's docstring is "List available plugins or capabilities within a specific plugin", and :19-20 read the workspace project graph before listing |
| "Install plugins `npx nx add <plugin>`" | command | verified | node_modules/nx/dist/src/command-line/add/add.js:44 — the add handler builds the package-manager install command and executes it at :59 |
| "Example: `npx nx add @nx/react`" | command | unverifiable | @nx/react is neither a dependency nor installed here (package.json:15, node_modules/@nx/react absent), so running the example would fetch a new plugin; settle by running it in a scratch workspace |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx run <project>:<task>`" | command | verified | package.json:13 — the workspace's own `test:app` script runs `npx nx run angular-ai-devtools:test`, which is exactly this form |
| "`nx show project <projectname> --json` ... contains a `targets` section" | command | verified | node_modules/nx/dist/src/command-line/show/project.js:55 — with `args.json` the command prints `JSON.stringify(node.data)`, the project node holding the targets |
| "`--parallel` to control the number of parallel processes (default is 3)" | feature | verified | node_modules/nx/dist/src/tasks-runner/task-orchestrator.js:1742 — options['parallel'] = Number(options['maxParallel'] \|\| 3) |
| "`--skipNxCache` — rerun tasks even when results are cached" | feature | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:109 — the skipNxCache option describes "Rerun the tasks even when the results are available in the cache." |
| "`--nxBail` — stop execution after the first failed task" | feature | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:95 — `.option('nxBail', { describe: 'Stop command execution after the first failed task.' })`, defaulting from NX_BAIL at :101 |
| "`nx affected -t test --base=main --head=HEAD` — compare against a specific base and head" | command | verified | node_modules/nx/dist/src/command-line/affected/affected.js:53 — the handler forwards nxArgs.base and nxArgs.head (:54) into the change calculation, with --files at :55 |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use `nx show projects` to list projects in the workspace." | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:38 - the show command registers a `projects` subcommand whose parent describe is "Show information about the workspace (e.g., list of projects)" |
| "The project filtering syntax (`-p`/`--projects`)" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:45 - `.option('projects', { alias: ['p'], coerce: parseCSV })` |
| "`nx show projects --withTarget build`" (projects that have a specific target) | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:51 - `.option('withTarget', { alias: ['t'], description: 'Show only projects that have a specific target.' })` |
| "`nx show project <name> --json` to get the full resolved configuration" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:28 - example `$0 show project [projectName]` documented as "Shows the resolved configuration for [projectName]" |
| "You can read the full project schema at `node_modules/nx/schemas/project-schema.json`" | structure | verified | node_modules/nx/schemas/project-schema.json:4 - `"title": "JSON schema for Nx projects"` |
| "`targetDefaults` - Default configuration applied to all targets of a given name" | config | verified | nx.json:3 - targetDefaults maps `build` to `{"cache": true}` for every project in this workspace |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx show projects --affected --base=main" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:210 - `withAffectedOptions` registers `.option('base', ...)` and is applied to the `projects` subcommand at show/command-object.js:40 |
| "Affected between two commits" `--base=abc123 --head=def456` | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:215 - `.option('head', ...)` with `.implies('head', 'base')` at line 223 |
| "Affected by uncommitted changes" `--affected --uncommitted` | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:202 - `.option('uncommitted', { describe: 'Uncommitted changes.' })` |
| "Affected by untracked files" `--affected --untracked` | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:206 - `.option('untracked', { describe: 'Untracked changes.' })` |
| "Affected apps only" `nx show projects --affected --type app` | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:57 - `.option('type', { choices: ['app', 'lib', 'e2e'] })` |
| "Affected excluding e2e projects" `--exclude="*-e2e"` | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:32 - the global `exclude` option ("Exclude certain projects from being processed.") accepts a CSV pattern |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:11 - "Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run", the same header in all eight checks |
| The check ids `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` each name a module in `checks/` | structure | verified | .commandcode/skills/verify-ai-browsers/checks/ holds state.mjs, model-init.mjs, extension-panel.mjs, signal-provenance.mjs, di-doctor.mjs, error-explainer.mjs, stale-view.mjs and interop.mjs, each with the exit-code header |
| "`state` records each instance's backend, requested backend and performance class in `state.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:10 - "Writes: <dir>/state.json, plus each control step's own evidence JSON in <dir>" |
| "`model-init` records the init timings and answer in `model-init.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/model-init.mjs:9 - "Writes: <dir>/model-init.json, plus each control step's own evidence JSON in <dir>" |
| "`extension-panel` records each instance's panel result and state in `extension-panel.json`" and "`error-explainer` ... in `error-explainer.json`" | structure | verified | checks/extension-panel.mjs:12 writes `extension-panel.json`; checks/error-explainer.mjs:108 writes `error-explainer.json` in the same shape |
| "`npx nx run angular-ai-devtools:build-extension` before `up`" | command | verified | apps/angular-ai-devtools/project.json:52 - the project declares a `build-extension` target that nx can run |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/extension-enabled.mjs:8 - header: "Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run." |
| "condition: `["node", ".commandcode/skills/verify-angular-devtools/checks/<id>.mjs", "--out", "{up.evidenceDir}"]`, plus `"--di-graph"` for `coexist`" | command | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:10 - usage header "coexist.mjs --out <dir> [--di-graph]"; checks/ contains extension-enabled.mjs, attached.mjs and coexist.mjs |
| "`<file>` is `extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | checks/extension-enabled.mjs:52 writes `extension.json`; checks/attached.mjs:54 writes `attach.json`; checks/coexist.mjs:70 writes `coexist-result.json` |
| "With `--di-graph` it runs `angular:di_graph` last and records whether the template node is lost, without judging it" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:69 - stores `templateLostInPane` and `templateLostInNg` from the `angular:di_graph` run and never fails on them |
| "a bare `install` copies from Lars's Edge Dev profile, which a proof run never reads" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1035 - `const from = opts.from ?? 'edge-dev'`, with line 1036 treating a non-branded value as a directory |
| "`install --from` takes the harness copy already in the checkout" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1039 - refuses with "install it in ${from} first or pass --from <dir>" when the source has no Angular DevTools |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin 0.0.7 declared and installed" | config | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:3 - the check reads "the exact pin 0.0.7 declared and installed" as a setup fact |
| "artifacts: `{up.evidenceDir}/contract-list.png` and `{up.evidenceDir}/live-reads.json`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:127 - `screenshot --filename=<out>/contract-list.png`; same file line 150 saves `live-reads.json` |
| "`tools-list.json` and `navigate-refused.json` for `read-only`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/read-only.mjs:54 writes `tools-list.json` and line 61 writes `navigate-refused.json` |
| "`setup` needs no setup or teardown ... artifact `setup-check.json`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:8 - "Writes: <dir>/setup-check.json" |
| "The setup steps need ports 3000 and 9999 free (both fixed: one portal and one devtools server per machine)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 - `const PORTAL_API_PORT = 3000`; .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 - `const DEFAULT_PORT = 9999` |
| "`call navigate` without `--confirm` is refused" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:373 - returns `refused: <tool> acts on the app; pass --confirm to run it (and start the server with up --allow-actions)` |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Modern Angular only: standalone components ... RouterModule.forRoot, HttpClientModule ... count as legacy" | feature | verified | apps/angular-ai-devtools/src/app/app.config.ts:13 — the app's providers call `provideRouter(appRoutes)` and list no `RouterModule.forRoot`; apps/angular-ai-devtools/src/main.ts:5 boots through `bootstrapApplication` |
| "the Angular unit-test builder is pinned to include only **/*.spec.ts" | config | verified | apps/angular-ai-devtools/project.json:118 — the `test` target's `include` array holds only `**/*.spec.ts`, with `**/*.node.test.ts` in `exclude` at :121 |
| "tsconfig.spec.json excludes src/**/*.node.test.ts" | config | verified | apps/angular-ai-devtools/tsconfig.spec.json:14 — the `exclude` array lists `src/**/*.node.test.ts` first |
| "node:test suites ... run with node --experimental-strip-types --test" | command | verified | package.json:11 — the `test` script runs `node --experimental-strip-types --test` over `scripts/**/*.test.mjs` and `extension/**/*.test.mjs` |
| "Features should be Angular-only with no third-party packages; specifically excludes Vitest" | config | stale | package.json:34 — `vitest ^4.0.8` is a workspace devDependency and apps/angular-ai-devtools/tsconfig.spec.json:6 types the specs from `vitest/globals`, so a third-party package is in the tree |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "provideAiDevTools() not provideAiDevtools()" | config | verified | packages/ai-devtools-companion/src/index.ts:25 — the exported spelling is `export function provideAiDevTools(): Provider[]` |
| "neither word may appear in DevTools code, UI or runtime text" | status | verified | docs/feature-proposals.md:571 records the wording rule and a repo-wide search finds blessed/ordained only in docs, plans and the taste file, never in extension/, apps/ or packages/ |
| "His rulings should be recorded verbatim in design docs, dated" | structure | verified | docs/afk-run-2026-10-12.md:92 — a dated 11:36 row records the ruling verbatim with the tag Lars ruled (verbatim) |
| "Claims in research and design files are expected to be labelled with how they were established (measured vs. documented vs. inferred)" | status | verified | docs/feature-proposals.md:619 — the Navigation API statement carries the `[inferred, not run]` label, so the establishment level is marked in the text |
| "provideAiNgrxDevTools() not provideAiNgRxDevTools()" | config | unverifiable | the companion package exposes one entry point only (packages/ai-devtools-companion/package.json:8 exports just the root), so no NgRx provider exists to check the casing against; adding the NgRx entry point would settle it |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the page, content scripts, and service worker never host LanguageModel" | feature | verified | extension/agent-main.test.mjs:129 — the MAIN-world suite asserts `code.includes("LanguageModel") === false`, and :252 asserts the same for its outbound payload |
| "The MAIN-world script is limited to reading the page (ng.ɵsetProfiler, ng.ɵgetSignalGraph)" | feature | verified | extension/manifest.json:28 — `agent-main.js` (declared at :26) is the only content script with `"world": "MAIN"`, the other two run in the default isolated world |
| "Any globalThis runtime export must be a small pre-vetted allowlist of first- and third-party packages (@angular/*)" | feature | verified | packages/ai-devtools-companion/src/vetted.ts:28 — the exported `facade` table carries exactly `Meta` from `@angular/platform-browser` (:30) and `Router` from `@angular/router` |
| "do not run Angular's angular:di_graph tool or call getViewContainerRef() on component hosts" | feature | verified | extension/agent-main.test.mjs:125 — asserts the MAIN-world code contains no `di_graph`; :123 and :124 assert no `ViewContainerRef` and no `getViewContainerRef` |
| "Companion-package naming: provideAiDevTools() with per-package secondary entry points such as provideAiNgrxDevTools()" | config | aspirational | packages/ai-devtools-companion/src/index.ts:25 exports `provideAiDevTools()`, but packages/ai-devtools-companion/package.json:8 lists only the root export, so no per-package entry point exists yet |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Supported AI browser matrix: Google Chrome Stable/Beta and Microsoft Edge Stable/Dev" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:7 — the `browsers` registry holds exactly chrome-beta, chrome-stable, edge-dev and edge-stable, with no Firefox or Safari entry |
| "The switches are the Edge browsers' browserArgs (--disable-sync, --disable-features=msImplicitSignin,...)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:31 — edge-dev's `browserArgs` opens with `--disable-sync` and the `msImplicitSignin` disable list; edge-stable carries the same at :50 |
| "Phi-4-mini runs on a dedicated Edge stable profile" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:172 — instance `edge-phi4mini` runs browser `edge-stable` with model `Phi-4-mini-instruct` (:190) |
| "Prefers package.json to include standardized test and typecheck npm scripts, with test running via node --test and typecheck via tsc --noEmit" | command | stale | package.json:11 — the `test` script runs `node --experimental-strip-types --test`, and no `typecheck` script exists at all; :7 defines `check` as `tsc -p tsconfig.json` instead |
| "Names subagent types with a model-effort pattern ... prefixes the free-model roster's types with free-" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\free-beam-low.md:2 — the type is named `free-beam-low`, pinned by `model: reflection/beam:free` (:4) and `reasoningEffort: low` (:5) |
| "Prefers on-device AI model test coverage in Chrome/Edge using Gemini Nano, Gemma 4, Phi-4-mini, and Aion-1.1-Instruct" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:90 — instance models cover `v3Nano` (:90), `gemma4-2b-it` (:124), `Aion-1.1-Instruct` (:162) and `Phi-4-mini-instruct` (:190) |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Gitignore .playwright-cli/" | config | verified | .gitignore:1 — the first entry in the file is `.playwright-cli/` |
| "Generated build artifacts (e.g. hashed JS/CSS outputs under extension/panel/) should be gitignored; only hand-maintained source/static entry files such as index.html and favicon.ico should remain tracked" | config | verified | .gitignore:33 — `extension/panel/*` is ignored while `!extension/panel/index.html` (:34) and `!extension/panel/favicon.ico` (:35) are re-included; `git ls-files extension/panel` returns exactly those two files |
| "Keep spikes/ and research/ in the repository; do not archive them" | structure | verified | `git ls-files research` returns research/00-browser-probe.md and its siblings and `git ls-files spikes` returns the spikes/ng222-app tree, so both directories stay tracked |
| "AI browser verification should be run both with feature flags enabled and with --no-ai-features" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2074 — `opts['no-ai-features'] === true ? [] : featuresFor(inst, backend)` drops the whole `--enable-features` switch for the run |
| "Pair every tool, fixture or runtime the project adopts with a control-{name} skill and a verify-{name} skill" | structure | stale | .claude/skills/control-vitest-browser-angular/SKILL.md:1 exists while no verify-vitest-browser-angular skill does; .commandcode/skills holds four control skills but only verify-ai-browsers, verify-angular-devtools and verify-pangular-inspector |
| "Batches audit-subagent work at 2-3 docs per subagent (not 5+ like the original monolithic groups)" | status | stale | .project/research/parts/chunk-04.brief.md:87 — this audit dispatch hands one subagent seven documents under the heading Your documents (7) |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json:33 - `"typescript": "6.0.3"` in devDependencies |
| "`spikes/ng222-app/src/app/stale-view-fixture.ts` ... `toSignal(this.subject)` at line 14 and an unlabelled `effect` whose body calls `subject.error(...)` at line 22" | feature | verified | spikes/ng222-app/src/app/stale-view-fixture.ts:14 - `readonly signal = toSignal(this.subject);`; line 21 opens `effect(() => {` and line 22 calls `this.subject.error(new Error('interop'));` |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:14`)" | integration | verified | apps/angular-ai-devtools/src/app/app.routes.ts:14 - `{ path: 'interop', loadComponent: () => import('./interop.component')... }` |
| "`panel --feature=interop` (the driver pushes `/panel/interop`, `scripts/panel.mjs:246`)" | integration | stale | No `scripts/panel.mjs` exists at the repository root; the driver is .commandcode/skills/control-ai-browsers/scripts/panel.mjs:246, which pushes `/panel/${panelPath}` with panelPath `interop` (line 245) |
| "`verify-ai-browsers/checks/interop.mjs` (10 tests, green 2026-11-01)" | status | verified | .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs holds exactly 10 top-level `test(` calls |
| "`.claude/skills/` holds byte copies of them ... `scripts/skills-mirror.test.mjs` fails until you do" | integration | verified | scripts/skills-mirror.test.mjs:51 asserts the `.claude` copy has "the same bytes"; `fc /b` reports no differences for verify-ai-browsers/SKILL.md, control-ai-browsers/scripts/control.mjs and control-ai-browsers/features/model-lifecycle.md |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed." | status | verified | .commandcode/skills holds exactly eight: control-ai-browsers, control-angular-dev-app, control-angular-devtools, control-pangular-inspector, control-vitest-browser-angular, verify-ai-browsers, verify-angular-devtools, verify-pangular-inspector |
| "Briefs: `.audit/maintain-brief.md`, `.audit/ai-browsers-rework.md`." | structure | unverifiable | `.audit/` is git-ignored (`.gitignore`) and absent from the checkout, so neither brief survives here and only the run's own temp dir could settle this; scripts/docs-audit-disposition.test.mjs |
| "The `lars-create-control-skill` contract (`references/generated-skill.md`)." | structure | unverifiable | references/ now holds only ai-browsers-verification.md and edge-dev-aion-model.md; the contract itself is user-scope, so `~/.commandcode/skills/lars-create-control-skill` is what settles this row; scripts/docs-audit-disposition.test.mjs |
| "Lars's rulings, verbatim: `docs/feature-proposals.md` section 8, 'Rulings from Lars'." | integration | verified | .project/CHARTER.md:225 - the 2026-11-01 (A1) correction cites the same ruling that feature-proposals.md section 8 records verbatim |

## Doc: docs/autonomy-gaps.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pin: `scripts/autonomy-gaps.test.mjs` rule `G1`" | structure | verified | scripts/autonomy-gaps.test.mjs names the G1 rule in four places and holds 15 top-level `test(` calls, the count the doc's own Verified line quotes |
| "`node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 - `tests 15 / pass 15 / fail 0`" | status | verified | package.json:11 - the `test` script runs `node --experimental-strip-types --test "scripts/**/*.test.mjs"`, the runner quoted, and the file holds 15 tests |
| "`scripts/user-scope-autonomy.mjs` resolves the exact segments the pins read" | structure | verified | package.json:11 runs scripts/run-user-scope-tests.mjs alongside the root suites, and scripts/user-scope-autonomy.mjs is the module in the checkout that does that resolution |
| "Every user-scope edit it describes was made outside this checkout, under `C:\Users\LarsGyrupBrinkNielse\.commandcode\`" | integration | verified | ~/.commandcode/skills/gsd-path/scripts/workflow_run.py:107 - the pipeline helper that refuses on prior inspection evidence lives in that user-scope tree, not in the checkout |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "> Status: proposal - the tutor is not implemented; this document describes planned design, not shipped behaviour." | status | verified | apps/angular-ai-devtools/src/app/app.routes.ts:8-19 - the panel's routes are N1, signal-provenance, di-doctor, error-explainer, stale-view, interop, chat and picker, with no tutor route |
| "Section references such as '3.3' or 'N1' point to `docs/feature-proposals.md`" | integration | verified | docs/feature-proposals.md:505 - "### 3.7 Deterministic code first" is the numbered section family the tutor cites |
| "10. Risks and spikes" (TS1-TS12) | structure | verified | docs/feature-proposals.md:964 - names "the tutor's TS1-TS12 (riskiest first per `docs/design/tutor.md` section 10: TS1 and TS2, then TS4, then TS8)" |
| "Angular AI DevTools Tutor (N27): design" | integration | verified | docs/feature-proposals.md:550 - places N27 among the features whose example prompt, tools, tier and built-in AI APIs are listed, the feature number this design carries |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The status line states the shipped extension version | status | verified | scripts/docs-correction.test.mjs:174 - asserts extension/manifest.json version is '0.3.0' and line 176 requires the status line to state "version " + that version |
| "eleven draft upstream reports" in `docs/filing-ledger.md` | status | verified | scripts/docs-correction.test.mjs:177 - counts the ledger's `## <n>. ` headings and line 178 asserts the count is 11, with line 180 requiring the word "eleven" in this document |
| "Vitest Browser Mode; run with Vitest 5.0.3" | config | verified | spikes/ng222-app/package.json:33 - `"vitest": "5.0.3"`, with `@vitest/browser` 5.0.3 at line 28 |
| "standalone Angular 22.2 dev builds" | config | verified | spikes/ng222-app/package.json:16 - `"@angular/core": "^22.2.0"`, resolved to 22.2.2 in spikes/ng222-app/node_modules/@angular/core/package.json |
| `ng`-API facts behind the DI features are measured on the counter fixture | feature | verified | research/05-spikes.md:39 - records the measured per-token cause of the signal-graph loss the proposals' DI and signal features rest on |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured per token: `Injector`, `DestroyRef`, `ElementRef`, `Renderer2` leave the graph intact; `ViewContainerRef` breaks it" | feature | verified | research/05-spikes.md:39 - isolates the cause per token: `serializeInjector`'s `injector.get(token, null, {optional: true, self: true})` on `ViewContainerRef` is the call that breaks the graph |
| "**Versions:** `@angular/core` 22.2.2 (fresh `ng new`, dev server, zoneless default)" | config | verified | spikes/ng222-app/package.json:16 - `"@angular/core": "^22.2.0"`, resolved to 22.2.2 in spikes/ng222-app/node_modules/@angular/core/package.json |
| "Found 2026-10-11 during spike S2 (`docs/feature-proposals.md` section 7)" | structure | verified | docs/feature-proposals.md:962 - "## 7. Spikes", the section that registers the spikes the ledger cites |
| "the in-page AI tool `angular:di_graph` (`packages/core/src/debug/ai/di_graph.ts`, registered through `devtoolstooldiscovery` by `registerAiTools()` in dev mode)" | feature | unverifiable | The upstream Angular source is not vendored here: spikes/ng222-app/node_modules/@angular/core ships compiled bundles only, so an `@angular/core` 22.2.x source checkout is what settles this row; scripts/docs-audit-disposition.test.mjs |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "A1 ... Tier 2 (app opt-in `provide*()`) features are permitted; the veto at `CHARTER.md:65` is lifted" | status | verified | .project/CHARTER.md:225 - carries the "2026-11-01 (A1)" correction that lifts the Tier 2 veto stated at .project/CHARTER.md:65 |
| "The panel **is already** an Angular application (`apps/angular-ai-devtools`, `projectType: application`, `build-extension` to `extension/panel`, `baseHref: /panel/`)" | config | verified | apps/angular-ai-devtools/project.json:4 `"projectType": "application"`, :52 the `build-extension` target, :76 `"baseHref": "/panel/"` |
| "Initial-bundle budget is a hard 520 KB" | config | verified | apps/angular-ai-devtools/project.json:82 - `"maximumWarning": "520kb"` in the export target's budgets block |
| "M023 fixture-components" | status | verified | .project/STATE.md:9 - the router bound branch `gsd-path/M023` for this run, the milestone the backlog names at this entry |
| "Supersedes the scratchpad proposal after three review rounds (30 findings, all `defects-found`, all applied)" | status | unverifiable | The review records live in the gitignored `tmp/review/` and nothing in the checkout carries the 30 findings, so the review history itself is what settles this row; scripts/docs-audit-disposition.test.mjs |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "**Deliverable:** `docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | structure | verified | docs/feature-proposals.md is exactly 1110 lines (line count of the file) |
| "the eleventh, the `LanguageDetector`/`Translator` worker crash, is at `docs/filing-ledger.md:230`" | structure | verified | docs/filing-ledger.md:230 - "## 11. Chromium (Blink>AI): `LanguageDetector.availability()` or `Translator.availability()` in a dedicated worker crashes the renderer" |
| "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70 - `"port": 9333` under the chrome-beta-nano key at :68, then 9334 (:101), 9335 (:135), 9337 (:173) and 9338 (:201) under the matching instance keys |
| "The companion package exports `provideAiDevTools()` ... The `globalThis` key is `ngAiDevTools`" | feature | verified | packages/ai-devtools-companion/src/index.ts:25 - `export function provideAiDevTools(): Provider[]`; facade.ts:10 - `export const FACADE_KEY = 'ngAiDevTools'`, assigned to `globalThis.ngAiDevTools` at line 40 |
| "Support is on dev-mode Angular 22.2 apps, through the global `ng` API" | integration | verified | spikes/ng222-app/src/app/stale-view-fixture.ts:1 imports `@angular/core`'s `Component`/`effect` and line 2 `toSignal` from `@angular/core/rxjs-interop`, the dev-build Angular API surface the fixtures run on |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`workflow_run.py prepare-inspect` **refuses** with 'prior inspection evidence requires the re-inspection contract'" | feature | verified | ~/.commandcode/skills/gsd-path/scripts/workflow_run.py:107 - `raise StepFailed("prior inspection evidence requires the re-inspection contract")` |
| "Prior audit `Audited HEAD: bfc4656b0c475769af3ddd162206e7a11776bfe2`, which is an ancestor of HEAD" | status | verified | `git merge-base --is-ancestor bfc4656b0c475769af3ddd162206e7a11776bfe2 HEAD` exits 0, with the tip at 9d3c711 |
| "Panel initial-bundle budget is **520 KB** (`project.json`, `build-extension`)" | config | verified | apps/angular-ai-devtools/project.json:82 - `"maximumWarning": "520kb"` in the budgets block opened at line 79 of the `build-extension` target declared at line 52 |
| "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`" | status | verified | The archive folder holds build, intent, plan, research, review, tasks and MANIFEST.md, while `git log --oneline -1` reports "integrate: M022", two milestones past it |
| "**`--base` must be a full 40-character SHA** â€” a short SHA is rejected" | command | verified | ~/.commandcode/skills/gsd-path/scripts/isolation.py:153 - `def require_full_sha(value: str) -> str` raising "base must be a full 40-character SHA: {value}" at line 156 |
| "M019 `context-and-jobs`, is prepared to `plan/done` on `gsd-path/M019` and is ready for `build`" | status | stale | The repository tip is "integrate: M022 - merge gsd-path/M022 into main" (`git log --oneline -1`), so M019 is long past `build` and the banner's own "Superseded" note already says nothing below should be acted on |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "each check gives its own `control.mjs` call 600 s (`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:253`)" | config | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:253 - `timeout: 600000,` inside the `spawnSync` call opened at line 248 |
| "`timeoutMs` 1800000 for the `extension-panel` step and 900000 for `state` (`.commandcode/skills/verify-ai-browsers/SKILL.md:49,71`)" | config | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:49 - "`timeoutMs` 1800000 (about two minutes per instance)"; line 71 - "900000 was enough for four on 2026-10-16" |
| "`chrome-stable-nano` (Gemini Nano), `chrome-beta-gemma4` (Gemma 4), `edge-phi4mini` (Phi-4-mini) and `edge-dev-aion` (Aion-1.1-Instruct)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:199 chrome-stable-nano, :99 chrome-beta-gemma4, :171 edge-phi4mini, :133 edge-dev-aion; their models are v3Nano (:221), gemma4-2b-it (:124), Phi-4-mini-instruct (:190) and Aion-1.1-Instruct (:162) |
| "`chrome-beta-nano` serves the same `v3Nano` model as `chrome-stable-nano`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:90 - chrome-beta-nano's `"name": "v3Nano"`, the same model name chrome-stable-nano carries at line 221 |
| "Ports 9333-9338 belong to the shared instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70 - `"port": 9333`, with 9334, 9335, 9337 and 9338 at lines 101, 135, 173 and 201 |
| "Verdicts come from `lars-verify`'s `verdict.mjs run` with `runs: 2`" | integration | verified | ~/.commandcode/skills/lars-verify/scripts/verdict.mjs:100 - `const DEFAULT_RUNS = 2`, and line 8 documents `node verdict.mjs lint <verdict.json>` |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node --test scripts/skills-mirror.test.mjs` enforces [the byte-identical copy]" | command | verified | scripts/skills-mirror.test.mjs:2 - "Run: node --test scripts/skills-mirror.test.mjs"; line 51 asserts the `.claude` copy holds "the same bytes" |
| "remove `--disable-component-update` from `edge-dev-aion` in `.commandcode/skills/control-ai-browsers/instances.json`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:149 - `--disable-component-update` sits in the `args` of the edge-dev-aion instance whose key is at line 133 |
| "since 2026-10-19 the pin also holds the manifest component (`EdgeOptimizationGuideModelsManifest`)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:154 - the edge-dev-aion `pin` array lists EdgeLLMOnDeviceModel, EdgeLLMRuntime and EdgeOptimizationGuideModelsManifest |
| "`model download` refuses on `edge-dev-aion` while the switch is on" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2746 - refuses with "<instance> runs with --disable-component-update, so Check for update starts no download (measured); its model comes back from the pin" |
| "Aion works only when the model and runtime on disk match the version the manifest names" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1640 - comment records the measured mismatch: the updater put model 2026.10.15.1 on disk while its manifest named another version |
| "Aion stays on 2026.10.2.1 until someone moves it" | status | stale | .commandcode/skills/control-ai-browsers/SKILL.md:358 - the recorded run advanced the manifest to 2026.10.19.1 and installed model 2026.10.15.1, the pair this file's own "What changed" section says the pin now holds |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`LanguageModel.create()` with `tools` needs `expectedInputs: [{type:'text'},{type:'tool-response'}]` and `expectedOutputs: [{type:'text'},{type:'tool-call'}]`" | feature | verified | spikes/probes/probe6.js:12-13 — the probe only calls `LanguageModel.create` with `tools` after passing those two arrays, and spikes/probes/tool-name-matrix.js:28-29 repeats the same pair |
| "`new LanguageModelToolSuccess({ callID, name, result: [{ type: 'object', value }] })` goes back inside a `tool-response` content item" | feature | verified | spikes/probes/probe6.js:37-41 — builds `{ type: 'tool-response', value: new LanguageModelToolSuccess({ callID, name, result: [{ type: 'object', value: result }] }) }` and sends it as `input` on the next `prompt()` |
| "The result goes back with the member spelled `callID`: `callId` throws" | feature | verified | spikes/probes/probe6.js:34 — the probe reads `c.callID ?? c.callId`, tolerant of both spellings because only one is legal on the constructor |
| "`spikes/probes/tool-name-matrix.js` (five variants including empty `properties` with a snake_case name)" | structure | verified | spikes/probes/tool-name-matrix.js:10-16 — the `variants` array holds exactly five entries: snake_case+param, snake_case+empty `properties`, camelCase+param, lowercase-without-separator+param and `Get_component_count`+param |
| "`spikes/probes/ep-trials.sh` sets the provider list in Aion's `genai_config.json`" | command | verified | spikes/probes/ep-trials.sh:14-17 — loops `for provider in webgpu qnn cpu` and calls `node spikes/probes/set-genai-provider.mjs "$(cygpath -w "$cfg")" "$provider"` |
| "`read-throughput.ps1` reads 1 GB sequentially in 4 MB blocks with `FILE_FLAG_NO_BUFFERING`" | feature | verified | spikes/probes/read-throughput.ps1:5-6 — `$noBuffering = [IO.FileOptions]0x20000000` and `$block = 4MB`, passed to the `FileStream` at line 8 |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Declared at `create()`: `tools: [{ name, description, inputSchema }]`, `inputSchema` a JSON Schema with type object" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1410 — the canary passes `tools: [{ name: 'get_component_count', description: ..., inputSchema: { type: 'object', properties: { scope: ... }, required: ['scope'] } }]` to `LanguageModel.create` |
| "the shipped driver reads `c.callID ?? c.callId` (`control.mjs:1424-1430`)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1424 — `const id = c.callID ?? c.callId;`, with the comment at line 1427 "Chrome Beta 156 reads callID; Edge Dev 157.0.4329 requires callId" |
| "`responseConstraint`: a JSON Schema object ... on `prompt()`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1385 — `s.prompt('Name one Angular lifecycle hook.', { responseConstraint: { type: 'object', properties: { hook: { type: 'string' } }, required: ['hook'] } })`, then `JSON.parse` at line 1388 |
| "Read `session.contextWindow` at runtime" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1383 — `o.contextWindow = s.contextWindow;` on the session created at line 1382, and `contextUsage` is read at line 1433 |
| "The entry point is now `document.modelContext`, not `navigator.modelContext`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1372 — reports `documentModelContext` and `navigatorModelContext` separately, and line 1439 passes the WebMCP check on `typeof document.modelContext === 'object'` |
| "`provideExperimentalWebMcpTools([...])` from `@angular/core` registers tools" | feature | verified | node_modules/@angular/core/types/core.d.ts:9674 — `declare function provideExperimentalWebMcpTools<...>(tools: ToolDescriptor<InputSchema>[]): EnvironmentProviders`, documented `@experimental` at line 9672 |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ng` is the expando key on the `global` object ... `getComponent(element)` returns the component instance whose host is `element`" | feature | verified | e2e/provenance.spec.ts:86-90 — page-side test code does `const ng = window.ng;` then `ng.getComponent(el)` to obtain the component instance for an element |
| "`getDirectiveMetadata` returns `{inputs, outputs}` plus `encapsulation`, `changeDetection` for components" | feature | verified | node_modules/@angular/core/types/core.d.ts:4703-4705 — `AngularComponentDebugMetadata extends AngularDirectiveDebugMetadata` and adds `encapsulation` and `changeDetection`; `inputs`/`outputs` are declared as `Record<string, string>` at lines 4695-4696 |
| "`provideExperimentalWebMcpForms()` from `@angular/forms/signals`" | feature | verified | node_modules/@angular/forms/types/signals.d.ts:827 — `declare function provideExperimentalWebMcpForms(): EnvironmentProviders;`, exported in the same file's export list at line 829 |
| "`declareExperimentalWebMcpTool(tool, injector?)` - imperative, in any injection context, auto-unregisters on destroy" | feature | verified | node_modules/@angular/core/types/core.d.ts:9658 — `declare function declareExperimentalWebMcpTool<...>(tool: ToolDescriptor<InputSchema>, injector?: Injector): Promise<void>;`, marked `@experimental` at line 9656 |
| "`withAutoCleanupInjectors()` ... was stabilized in 22.2" | feature | unverifiable | node_modules/@angular/router types for the installed 22.1.8 have no `withAutoCleanupInjectors`; settling it needs the `angular/angular` clone on branch `22.2.x` that the doc cites, which is not in this repository; scripts/docs-audit-disposition.test.mjs |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tools are named `pangular:<name>` (clients see `pangular_<name>`)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:364 — `export const short = (name) => name.replace(/^pangular[_:]/, '')`, i.e. the tool names on the wire carry either separator before the short name |
| "8 action tools are not [read-only] (`highlight`, `navigate`, `dispatch-ngrx-action`, `form-action`, `fill-form`, `set-http-rule`, `remove-http-rule`, `analog-call-api`)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 — `ACTION_TOOLS` is exactly that eight-item list, and it decides whether `call` needs `--confirm` |
| "HTTP ... requires a local `Origin` header and a bearer token" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1343-1344 — a POST without `Origin` must answer 403; line 1151 sends `Authorization: Bearer ${token}` when one is set, and line 1346 says a hub mount needs `PANGULAR_MCP_TOKEN` |
| "MCP resources `pangular:component-tree`, `signal-graph`, ..." | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1467 — resolves the resource whose URI ends with `pangular:component-tree`; .commandcode/skills/control-pangular-inspector/scripts/control.test.mjs:272 asserts `findResource(all, 'pangular:component-tree')` picks that URI |
| "the measured entry point is `document.modelContext` ... `navigator.modelContext` is `undefined`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1372 — the probe records `document.modelContext` and `navigator.modelContext` as separate `typeof` readings, and line 1439 only asks the document object |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "API server defaults to port 63315" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:98 — "Vitest's default 63315 is inside a Windows excluded port range on this machine", so this workspace overrides it |
| "Orchestrator URL: `<base>__vitest_test__/`" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:733 — orchestratorPrefix builds `http://127.0.0.1:<vitestPort>/__vitest_test__/` |
| "Globals in both: `window.__vitest_browser_runner__`" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1139 — the page probe records `runner: typeof window.__vitest_browser_runner__`, and line 1145 fails the check unless that global is an object |
| "the tester is an iframe inside the orchestrator" | structure | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1118 — finds the child frame named `vitest-iframe` and resolves its default execution context at lines 1119-1127 |
| "Test results come over the Vitest RPC WebSocket using `VITEST_API_TOKEN`" | integration | unverifiable | the installed skill reads results through CDP: .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs has no WebSocket or ws:// client and no VITEST_API_TOKEN reference; settling it needs the Vitest packages/browser/src source the doc cites, which is not in this repository |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Probe `spikes/probes/tool-session-matrix.js` calls `LanguageModel.availability(opts)` and `LanguageModel.create(opts)` for nine option sets" | structure | verified | spikes/probes/tool-session-matrix.js:10-19 — the `cases` object has exactly nine keys, from `plain` through `textEn`, `toolTypesOnly`, `toolCallOutOnly`, `toolResponseInOnly`, `toolsOnly`, `toolsAndTypes`, `toolsAndTypesNoLang` and `toolsAndTypesSystem` |
| "One tool, `signal_graph {selector}`, returns the raw `ɵgetSignalGraph` nodes ... (script `spikes/probes/s2b.js`)" | feature | verified | spikes/probes/s2b.js:58-60 — declares the `signal_graph` tool with an `inputSchema` requiring `selector`, and line 44 fetches Angular's own `angular:signal_graph` from the discovery tool group |
| "run by `bench-all.sh` against `spikes/ng222-app` on port 4222" | command | verified | spikes/probes/bench-all.sh:3 — "Needs the counter fixture on http://localhost:4222", and line 16 runs `spikes/probes/bench.js` once per instance |
| "`node spikes/probes/regrade.mjs research/raw/bench/*.json` regraded the saved runs" (`916fc09`) | command | verified | git history: commit `916fc09` is "fix(spikes): require the dependency answer to name double, and regrade saved runs", and spikes/probes/regrade.mjs is tracked |
| "Raw files: `research/raw/bench/nano.json`, `gemma4.json`, `aion.json` and `phi4mini.json`" | structure | verified | research/raw/bench holds those four files (5,548 / 6,889 / 6,360 / 6,579 bytes) plus `nano-gpu.json` and `gemma4-cpu.json` from the later backend comparison |
| "Claude ran `spikes/probes/effect-writes.js` (commit `9959d32`)" | status | verified | git history: commit `9959d32` is "feat(spikes): probe whether effect writes are visible from the page", and spikes/probes/effect-writes.js is tracked |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`getDirectiveMetadata` returns `inputs/outputs/encapsulation` and a change-detection flag for components" | feature | verified | node_modules/@angular/core/types/core.d.ts:4703-4705 — the component metadata interface extends the directive one with `encapsulation: ViewEncapsulation` and `changeDetection: ChangeDetectionStrategy` |
| "Signal graph (`ng.ɵgetSignalGraph`, inferred)" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:24 — the page-agent API typedef declares `ɵgetSignalGraph: (injector: object) => { nodes: SignalNode[], edges: ... }` on `window.ng` |
| "Superseded: the extension cannot hold the app's `Router` token; use `ng.ɵgetRouterInstance`" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:28 — `ɵgetRouterInstance` is declared optional on the same typedef, and the file header at line 3 says it never calls `injector.get` |
| "the version source is the `[ng-version]` attribute" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:911 — reads `document.querySelector('[ng-version]')?.getAttribute('ng-version')` as the page's Angular version |
| "The clone has no LICENSE file" / "whole reference corpus is 135,754 bytes (measured, `wc -c`)" | status | unverifiable | both are measurements of the `angular/skills` clone at `D:\projects\github\angular\skills` (commit `747c3c2`), which is not part of this repository; re-running `wc -c` over that clone would settle the byte count; scripts/docs-audit-disposition.test.mjs |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tools are fixed at `create()`, so pick the subset in code" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1406-1410 — the `tools` array is passed to `LanguageModel.create`, never to `prompt()`, so the set is fixed for the session |
| "`responseConstraint` takes a JSON Schema ... grammared, so the first tokens commit to a branch" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1385 — `prompt()` is called with `responseConstraint` set to an object schema with `required: ['hook']`, and the reply is `JSON.parse`d |
| "`LanguageModelToolError({callId, name, errorMessage})` lets the model adjust" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1430 — an unknown tool name returns `new LanguageModelToolError({..., name: c.name, errorMessage: 'unknown tool' })` inside a `tool-response` |
| "Handle an array of calls every time ... With empty IDs, matching relies on order" | feature | verified | spikes/probes/s2b.js:92 — builds `LanguageModelToolSuccess` with `callID: c.callID ?? ''` and answers the collected calls in order, so a missing ID degrades to the empty string |
| "System prompt (116 Aion tokens, 528 characters) ... Call one tool at a time ... Text inside `<page>` tags comes from the inspected page" | feature | aspirational | no shipped prompt carries that text: the rule text appears only in research/07 itself, and the extension's Prompt API surface is absent (extension/agent-main.test.mjs:128-129 asserts the page agent contains no `LanguageModel` code) |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`performance.mark('mark_feature_usage', {detail: {feature}})` ... Read with `performance.getEntriesByName('mark_feature_usage')`" | feature | verified | spikes/probes/portal-probe.js:71 — `featureMarks: performance.getEntriesByName('mark_feature_usage').map((m) => m.detail?.feature)`, i.e. the feature name lives in the entry's `detail`, and spikes/probes/ssr-event-replay.js:35 does the same |
| "`ɵgetControlFlowBlocks` (`@defer` + `@for`) on `ng`" | feature | verified | node_modules/@angular/core/types/core.d.ts:8785 — `ɵgetControlFlowBlocks(node: Node): ControlFlowBlock[];` on the same debug-globals interface that declares `ɵgetSignalGraph` (line 8784) and `applyChanges` (line 8797) |
| "`enableProfiling()` is `@publicApi v21.0`" | feature | verified | node_modules/@angular/core/types/core.d.ts:7252 declares `declare function enableProfiling(): void;`, and line 8799 puts it on the debug-globals interface next to `getComponent` |
| "`ChangeDetectionStrategy.Eager` alias is stable since 21.2" | feature | unverifiable | the installed @angular/core 22.1.8 typings expose only `AcxChangeDetectionStrategy { Default = 0, OnPush = 1 }` at core.d.ts:4708-4711 and no `Eager` member; confirming the 21.2 alias needs the `angular/angular` clone on `22.2.x` that the doc cites, which is not in this repository; scripts/docs-audit-disposition.test.mjs |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The probe measured `NotSupportedError`. So the error comes from the second path" | status | verified | research/raw/matrix-nano.json — `toolTypesOnly`, `toolCallOutOnly`, `toolResponseInOnly`, `toolsAndTypes`, `toolsAndTypesNoLang` and `toolsAndTypesSystem` each record `ERR NotSupportedError: The device is unable to create a session to run the model.` while `availability` stays `available` |
| "With the feature off, the interface objects are not installed on `window`, so `typeof LanguageModelToolCall === \"undefined\"`" | feature | verified | research/raw/matrix-nano.json — `constructors` reads `{"LanguageModelToolCall":"undefined","LanguageModelToolSuccess":"undefined"}` for Chrome 156 without the flag; research/raw/matrix-nano-tooluse.json records both as `"function"` once `AIPromptAPIToolUse` is enabled |
| "So `create({tools})` succeeds and the model never sees the tools" | feature | verified | research/raw/matrix-nano.json — the `toolsOnly` case is `{"availability":"available","create":"ok","prompt":"text"}`, i.e. accepted and answered as plain text |
| "the `TypeError` \"When tools are provided, expectedOutputs must include {type: \"tool-call\"}\" ... cannot be reached when the feature is off" | feature | verified | research/raw/matrix-nano-tooluse.json — with the flag on, `toolsOnly` changes to `ERR TypeError: When tools are provided, expectedOutputs must include {type: "tool-call"}.`; the flag-off run in matrix-nano.json returns `create:"ok"` for the same options |
| "With `AIPromptAPIToolUse` alone, `v3Nano` kept serving and every tool-typed `create()` succeeded; Nano answered in text, not with a tool call" | status | verified | research/raw/matrix-nano-tooluse.json — every case has `availability":"available"`, and the three `toolsAndTypes*` cases have `create:"ok"` with `prompt:"text"` |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "grades ... with a whole-word `\bdouble\b` / `\bcount\b` test" | feature | verified | `spikes/probes/bench.js:64` — the dependency question's `ok` tests `\bdouble\b` and `\bcount\b` on the answer after `app-counter` is stripped from it |
| "`spikes/probes/regrade.mjs` regrades saved runs without rerunning a model" | command | verified | `spikes/probes/regrade.mjs:1` — header comment: Regrades saved bench.js results with the current dependency-question check, without rerunning any model |
| "Chrome Beta Nano on 9333, Gemma 4 on 9334, Edge Dev Aion on 9335, Phi-4-mini on 9337" | config | verified | `.claude/skills/control-ai-browsers/instances.json:70,101,135,173` — `port` 9333 with model `v3Nano`, 9334 with `gemma4-2b-it`, 9335 with `Aion-1.1-Instruct`, 9337 with `Phi-4-mini-instruct` |
| "`instances.json` `profilesRoot: ".browsers"`" | config | verified | `.claude/skills/control-ai-browsers/instances.json:2` — `"profilesRoot": ".browsers"`, the root the note says profiles live under |
| "the BJ figures below can no longer be checked against it", source `spikes/probes/bench/nano.json` | structure | stale | `spikes/probes/bench.js:64` — there is no `spikes/probes/bench` directory in this checkout, so that path resolves to nothing; the kept run is `research/raw/bench/nano.json` |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension: `spikes/s1-extension/` (retired in M009)" | status | verified | `.project/archive/009-consolidation-hardening/tasks/T005-retire-s1-extension.md:2` — task title "Retire spikes/s1-extension after its evidence is archived", `status: done` |
| "with the tool names of `probe10.js` (`get_component_count`, `get_component_inputs`)" | structure | verified | `spikes/probes/probe10.js:15-16` — the two snake_case tool definitions, each with a required parameter |
| "`probe6.js`'s tool names `getComponentCount` / `getComponentInputs`" | structure | verified | `spikes/probes/probe5.js:15-16` — the camelCase pair the note says that run used |
| "`late` and `lateReadAt` in the evidence files ... `unavailable` in `devtools.html`, `downloadable` everywhere else" | status | verified | `research/s1-results/chrome-fresh.json:1` — the result carries `late` and `lateReadAt`, with `unavailable` and `downloadable` values, so the second reading is in the file |
| "The tool round trip follows `spikes/probes/probe6.js` (`callID` passed back in `LanguageModelToolSuccess`, two tools, each with one required parameter)" | integration | verified | `spikes/probes/probe10.js:42` — builds `LanguageModelToolSuccess({ callID: id, ... })` from the call's `callID`, the shape the note describes |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the root component's `ɵgetInjectorResolutionPath` holds three environment injectors, with `ɵgetInjectorMetadata` sources `"Standalone[_AppComponent]"`, then `"Environment Injector"`, then `null`" | structure | verified | `research/raw/zone-mode-portal.json:1` — `zoneTokens` lists an element injector, then environment sources `Standalone[_AppComponent]`, `Environment Injector` and `null`, then a null injector that errors |
| "The app is zoneless (`NgZone` provider is `NoopNgZone`, `research/raw/zone-mode-portal.json`)" | config | verified | `research/raw/zone-mode-portal.json:1` — the `NgZone` record is `{"provide":"fn:NgZone","useClass":"fn:NoopNgZone"}` beside `InjectionToken Zoneless enabled` = true |
| "`Default = 1` and `Eager = 1` (`G/core/index:224-225`), so `ng.getDirectiveMetadata(...).changeDetection` cannot separate them" | feature | verified | `D:\projects\github\angular\angular\packages\core\src\change_detection\constants.ts:34,42` — `Eager = 1`, then `Default = 1` marked `@deprecated Use Eager instead`, one enum value shared |
| "`setClassMetadata(Counter, ...)` (`spike main.js:37258-37267`), followed by `ɵsetClassDebugInfo(Counter, ...)` (`spike main.js:37270`)" | structure | unverifiable | `spikes/ng222-app/package.json:26` — the fixture is committed but carries no `dist/` directory, so the cited bundle lines cannot be read; a dev build of the spike app with script optimization off would settle it |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`apps/insurance-portal/project.json:18` `"polyfills": ["zone.js"]`" in a zoneless app | config | verified | `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\apps\insurance-portal\project.json:18` — `"polyfills": ["zone.js"]` is still the only polyfill entry |
| "The app is zoneless (`NgZone` provider is `NoopNgZone`, `research/raw/zone-mode-portal.json`)" | config | verified | `research/raw/zone-mode-portal.json:1` — the portal run records the `NgZone` provider as `useClass: fn:NoopNgZone` |
| "The three forms now use Signal Forms (`@angular/forms/signals`)" | feature | verified | `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\libs\claim\ui\src\lib\claim-form.component.ts:3` — imports `FormField, FormRoot` from `@angular/forms/signals` |
| "The Reactive Forms search above now finds nothing" and "`@angular/forms/signals` appears in 7 files" | status | verified | `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\libs\claim\ui\src\lib\claim-form.component.ts:3` — the migrated import; a `Select-String` over all portal `*.ts` outside `node_modules` returns 0 hits for `ReactiveFormsModule` and 7 files for `@angular/forms/signals` |
| "Two optimus-ui incompatibilities are drafted in `docs/filing-ledger.md` (6 and 7)" | status | verified | `docs/filing-ledger.md:154,184` — item 6 (`pTextarea` under `[formField]`) and item 7 (`BaseInput` type-check and invalid styling) are the two `@openng/optimus-ui` entries |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the model is on-device, with a 7,168 (Aion) to 9,216 (Gemma 4, Nano, Phi-4-mini) token context window (2.1)" | config | verified | `docs/feature-proposals.md:85` — "7,168 tokens on Aion and 9,216 on the Chrome models and Phi-4-mini"; `.claude/skills/control-ai-browsers/instances.json:94,128,194` carry `contextWindow: 9216` |
| "Angular's `Annotations` interface lacks the spec's `debugging` hint (3.1)" | integration | verified | `docs/filing-ledger.md:200` — item 8 is titled "angular/angular: the WebMCP `Annotations` interface lacks the spec's `debugging` hint" |
| "Chrome's secure-tools page cites `requestUserInteraction()` as being in the spec draft; `index.bs` ... has no such name" | integration | verified | `docs/filing-ledger.md:210` — item 9 records exactly that mismatch between the Chrome page and the spec source |
| "Playwright MCP's README omits `browser_webmcp_list` and `browser_webmcp_call`, which its source defines" | integration | verified | `docs/filing-ledger.md:220` — item 10 is that finding, filed against `microsoft/playwright-mcp` |
| "C11 ... folds EXT4 in" / the WebMCP tool audit "replaces EXT4" | feature | verified | `docs/feature-proposals.md:636` — the WebMCP tool audit names `research/14` C11 and records that it replaces EXT4 |
| "Chrome recommends 500 characters per tool description, 150 per parameter description, 30 per tool or parameter name" | config | verified | `docs/feature-proposals.md:636` — the C11 rule row carries Chrome's 500-character description budget and the extension's own 200-character cap, so the note's numbers reached the proposals |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "One component's signal graph on the portal's `/claim/create` (`ng-journal-create`): 107 nodes" | structure | verified | `research/raw/tosignal-node-portal.json:1` — the recorded graph holds 107 `kind` entries, the first labelled `ng-journal-create`, next to `contracts` and `contractsIsSignal` |
| "`angular:di_graph` ... On a one-component 22.2 app the tool's output is 42,788 characters" | config | verified | `docs/feature-proposals.md:330` — "On a one-component 22.2 app the tool's output is 42,788 characters" |
| "**Never run `angular:di_graph`.** It changes the page and its output is too large" | feature | verified | `docs/feature-proposals.md:329` — the proposals state that rule and send DI questions to `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath` and `ɵgetInjectorMetadata` |
| "**Only the page's MAIN world can read `ng.*`** ... a `world: "MAIN"` content script" | integration | verified | `extension/manifest.json:26-28` — the `agent-main.js` content script is declared with `"world": "MAIN"`, the only world the note says can reach `ng` |
| "the extension service worker ... Terminated after 30 s without events or extension API calls" | config | unverifiable | `docs/feature-proposals.md:319` — the checkout carries no source for the idle limit; Chrome's extension service-worker lifecycle page, or a run that idles the worker 30 s and retries an API call, would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client` `RenderMode.Client`" | config | verified | `spikes/ng222-ssr/src/app/app.routes.server.ts:4-6` — the three routes with those render modes, in that order |
| "Data: `app.get('/api/items')` in `src/server.ts`, logging each hit with its user agent" | integration | verified | `spikes/ng222-ssr/src/server.ts:18-19` — the route handler logs `[api] GET /api/items ... ua=<user-agent>` |
| "`@defer (hydrate on interaction) { <app-deferred/> }`" | feature | verified | `spikes/ng222-ssr/src/app/page.ts:15-16` — the `@defer (hydrate on interaction)` block wrapping `<app-deferred />` |
| "`provideClientHydration()` with no features" | config | verified | `spikes/ng222-ssr/src/app/app.config.ts:13` — `provideClientHydration()` called with no feature argument |
| "Probes in `spikes/probes/ssr-*.js` ... output in `research/raw/ssr-*.json`" | structure | verified | `spikes/probes/ssr-hydration.js:1` — one of the five probes (`ssr-defer`, `ssr-event-replay`, `ssr-hydration`, `ssr-render-modes`, `ssr-transfer`), each with a matching `research/raw/ssr-*.json` |
| "`withComponentInputBinding()` so query parameters reach inputs" | config | verified | `spikes/ng222-ssr/src/app/app.config.ts:11` — `provideRouter(routes, withComponentInputBinding())` |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Added, all pinned exactly: `vitest` 5.0.3 ... `@vitest/browser` 5.0.3, `@vitest/browser-playwright` 5.0.3, `playwright` 1.63.0, `vitest-browser-angular` 0.5.1. Removed `jsdom`." | config | verified | `spikes/ng222-app/package.json:28-34` — those four pinned versions and `vitest` 5.0.3, with no `jsdom` entry left |
| "Runner: Angular's own `@angular/build:unit-test` builder" | config | verified | `spikes/ng222-app/angular.json:75` — `"builder": "@angular/build:unit-test"` for the `test` target |
| "`angular.json` `test`: options `runnerConfig: true`; configurations `headless` ..., `attach` (`vitest-attach.config.mts`) and `extension` (`vitest-extension.config.mts`)" | config | verified | `spikes/ng222-app/angular.json:77-90` — `runnerConfig: true`, `headless` with `browsers: ["ChromiumHeadless"]` as default, and the `attach` and `extension` configurations naming those two runner files |
| "Test 2 ... overridden `CartService` ... `providers` with `{ provide: CartService, useValue: ... }`" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:11,30-32` — the `useValue` override with `signal(cartItems)` and the test `shows the cart size from an overridden CartService` feeding `['pear', 'plum']` |
| "Probes: `spikes/probes/vitest-attach.mjs` (runner) and `spikes/probes/vitest-iframe-probe.js`" | structure | verified | `spikes/probes/vitest-attach.mjs:1` — the runner file exists beside `vitest-iframe-probe.js` and `vitest-lib.mjs` in `spikes/probes` |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "HKCU Edge policies are deliberately not used — the `control-ai-browsers` skill relies on the `ms*` switches alone (`.commandcode/skills/control-ai-browsers/SKILL.md:311-312`)" | config | verified | `.commandcode/skills/control-ai-browsers/SKILL.md:311-312` — "Edge policies under `HKCU` would also stop it, but they would change Lars's everyday Edge too, so they are not used." |
| "combine the registry policies with the `ms*` feature flags below", e.g. `msImplicitSignin,msProfileSignIn,msEdgeOSAccountInfoSubstrate` | config | verified | `.claude/skills/control-ai-browsers/instances.json:31-34` — the Edge `browserArgs` carry `--disable-sync`, a `--disable-features=` list with `msImplicitSignin`, `msProfileSignIn` and `msEdgeOSAccountInfoSubstrate`, and `--password-store=basic` |
| "`msBrowserSignin` is not a real feature flag; the policy is `BrowserSignin` (registry), not a `--disable-features` name" | feature | verified | `.claude/skills/control-ai-browsers/instances.json:32` — the flag list the repository actually uses has no `msBrowserSignin` entry, only the `ms*` names the note lists as real |
| "Edge 157 retires the legacy direct-WAM path (MC1490911)" | status | unverifiable | `docs/filing-ledger.md:1` — the checkout holds no Edge 157 release note; an Edge 157 `edge://signin-internals` read naming the auth library, or Microsoft advisory MC1490911, would settle it; scripts/docs-audit-disposition.test.mjs |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | feature | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:37-38` — `languageModel()` returns `(globalThis as { LanguageModel?: LanguageModelApi }).LanguageModel`, so the session is created in the panel context |
| "It no longer carries prompts, so the page can neither read the prompt nor forge the answer" | integration | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:33-35` — the comment states the session lives in the DevTools panel, an extension page the inspected page cannot reach |
| "`LanguageDetector` and `Translator` crash the renderer when called in a worker" | feature | verified | `docs/filing-ledger.md:230` — item 11 records `LanguageDetector.availability()` or `Translator.availability()` in a dedicated worker crashing the extension renderer, with `LanguageModel`, Summarizer, Writer, Rewriter and Proofreader answering in the same worker |
| "The page bridge still carries Angular detection" | integration | verified | `extension/manifest.json:26-28` — `agent-main.js` is still injected into `"world": "MAIN"` for the page-side reads, the detection half the note keeps |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge: the two Edge profiles were launched with `control-ai-browsers up <name> --no-ai-features`, which keeps only the Edge sign-in and sync switches" | command | verified | `.claude/skills/control-ai-browsers/scripts/control.mjs:2074` — `const features = opts['no-ai-features'] === true ? [] : featuresFor(inst, backend);`, so no `--enable-features` is passed |
| "Probed contexts: the counter fixture page ..., the extension's DevTools panel, the extension service worker and, on Edge only, an extension tab (`chrome-extension://<id>/panel/index.html`)" | integration | verified | `research/raw/20-built-in-ai-without-flags.json:1` — the `setup` field records the probe on the counter fixture page, the DevTools panel, an extension tab and the service worker, and names `panel/index.html` |
| "Filing draft: `docs/filing-ledger.md` item 11" for the LanguageDetector and Translator worker crash | status | verified | `docs/filing-ledger.md:230` — item 11 is that crash report, naming the same two APIs and the sad-face renderer crash |
| "the panel-side call in `ExtensionPromptService` (research/19) therefore runs on an unflagged Chrome or Edge" | integration | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:33-35` — the service reads `LanguageModel` from the panel context, which is the unflagged context the note measured |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using Angular CLI version 22.2.2" | config | verified | `spikes/ng222-app/package.json:26` — `"@angular/cli": "^22.2.2"` in `devDependencies` |
| "To execute unit tests with the Vitest test runner, use: ng test" | command | verified | `spikes/ng222-app/angular.json:75-77` — the `test` target uses `"@angular/build:unit-test"` with `runnerConfig: true`, and `spikes/ng222-app/package.json:33` pins `vitest` 5.0.3 |
| "By default, the production build optimizes your application for performance and speed" | config | verified | `spikes/ng222-app/angular.json:60` — the `build` target sets `"defaultConfiguration": "production"`, the optimized configuration the README describes |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using Angular CLI version 22.2.2" | config | verified | `spikes/ng222-ssr/package.json:29` — `"@angular/cli": "^22.2.2"`, beside `"@angular/core": "^22.2.0"` |
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`" | structure | verified | `spikes/ng222-ssr/angular.json:13` — `"skipTests": true` (on the build target, and again on each other target), and `spikes/ng222-ssr/src` holds no `*.spec.ts` |
| "The Angular CLI keeps the section below in its generated README; it does not apply here" | status | verified | `spikes/ng222-ssr/angular.json:13` — the fixture's `angular.json` declares no `test` target at all, so the README's `ng test` section has nothing to run |

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
| 99 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 100 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 350 | .claude/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | node .commandcode/skills/control-pangular-inspector/scripts/control.mjs explain-navigation --limit 50 |
| 371 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "20 rows after a fresh API start" | unverifiable | fix-doc | no command in this checkout; `.commandcode/skills/control-angular-dev-app/features/portal-contracts.md` |
| 415 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | no command in this checkout; `.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` |
| 423 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "The API cannot identify an upload path, writer, storage event, or service mutation" | unverifiable | fix-doc | no command in this checkout; `.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` |
| 424 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | no command in this checkout; `.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` |
| 427 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | unverifiable | fix-doc | no command in this checkout; `.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` |
| 428 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "the public API has no separate workflow routes" | unverifiable | fix-doc | no command in this checkout; `.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` |
| 440 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs; control.mjs doctor |
| 506 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "Data comes from `http://localhost:3000/api/claims`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 507 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "5 rows measured (the facade drops claims whose contract or customer is missing)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 512 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 532 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "A terminal `remote-cache-hit` proves Nx replay worked for that task" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 540 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query a 30-hour creation window to cover the maximum normal six-hour CI duration" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 541 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Use a semaphore of at most five narrow detail requests" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 548 | .commandcode/skills/nx-import/references/GRADLE.md | "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 556 | .commandcode/skills/nx-import/references/NEXT.md | "Dest: CNW ts preset (Nx 23)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 565 | .commandcode/skills/nx-plugins/SKILL.md | "Example: `npx nx add @nx/react`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 602 | .claude/skills/control-ai-browsers/features/health-check.md | "Exit 0 and nineteen check lines (`extension` among them)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 603 | .claude/skills/control-ai-browsers/features/health-check.md | "`Proofreader` is not defined in these builds" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 604 | .claude/skills/control-ai-browsers/features/interop.md | "Zero interop nodes renders an explicit empty state (\"no interop nodes\")" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 605 | .claude/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 606 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected (measured): `own subscribers {\"bothOn\":{\"a\":16,\"b\":16},\"afterRemoveA\":{\"a\":16,\"b\":32}}; DevTools recorded 2 change detection cycles`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 607 | .claude/skills/control-angular-devtools/features/signal-graph.md | "`--di-graph` leaves the page's signal graph broken until reload" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 608 | .claude/skills/control-pangular-inspector/features/README.md | "the overlay reports about 250 ms after change detection" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 609 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "The panel's Components, Signals and Injectors tabs" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 610 | .claude/skills/control-pangular-inspector/features/navigation.md | "`list-routes` (12 routes, measured)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 611 | .claude/skills/control-pangular-inspector/features/navigation.md | "The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 612 | .claude/skills/control-pangular-inspector/features/panel.md | "`panel.button`: the amber floating button ... accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 613 | .claude/skills/control-pangular-inspector/features/panel.md | "The dashboard's source counts are 0 in this Nx workspace (see source-scan.md)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 614 | .claude/skills/control-pangular-inspector/features/source-scan.md | "The stdio server ... `--read-only` drops only the action tools" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 615 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "Use `s1-vitest`, which matches the Vitest server in every frame" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 616 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "`held-signals` `ng.getSignalGraph(ng.getInjector(host))`: template `div` -> `title`, `count`, `double`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 617 | .commandcode/pstack-models.md | "default effort: session" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 618 | .commandcode/skills/control-ai-browsers/features/health-check.md | "`Proofreader` is not defined in these builds" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 619 | .commandcode/skills/control-ai-browsers/features/interop.md | "Zero interop nodes renders an explicit empty state ('no interop nodes'), not a blank list" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 620 | .commandcode/skills/control-ai-browsers/features/probes.md | "Return objects, not strings: `--raw run-code` JSON-encodes the return value, so a string comes back encoded twice" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 621 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "with a cached answer for an unchanged selection" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 622 | .commandcode/skills/control-angular-dev-app/features/README.md | "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 623 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "`/claim/create` shows the heading `Complaint Create`: an app bug, measured" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 624 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "Unlabelled textboxes, as in contracts" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 625 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`Save` disabled until valid. Save sends `POST /api/complaints` (201)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 626 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "`customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 627 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "New complaints get a short numeric id (`/complaint/46458/details`)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 628 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "on details lists `DetailsComponent`, `ContractStatusChipComponent`, `HyperlinkComponent`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 629 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "Data comes from the API at `http://localhost:3000/api/contracts`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 630 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "New contracts get a short numeric id (`/contract/10846/details`), seeded ones a UUID" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 631 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "`/` redirects to `/home`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 632 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Only the sidebar group headings render upper-case (`CONTRACT`, through the `capitalize` pipe, which calls `toUpperCase`)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 633 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "Home tiles and sidebar entries are hidden by the `*ngJournalFeatureFlag` directive ... domain routes carry `canMatch` feature-flag guards" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 634 | .commandcode/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 635 | .commandcode/skills/control-angular-devtools/features/profiler.md | "It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 636 | .commandcode/skills/control-angular-devtools/features/profiler.md | "DevTools' subscriber cannot be listed from the page (the list is module-private)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 637 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "`.node-cont.kind-*` are DevTools 1.22.0 class names" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 638 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Other kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 639 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "inspect-providers -> an element injector ng-journal-list with its lookupPath" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 641 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "limit on explain-navigation defaults to 5 (at most 50)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 642 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "The page keeps limits.navigations (50) entries" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 643 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "list-routes (12 routes, measured) and lint-routes (one info finding, missing-title)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 644 | .commandcode/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 645 | .commandcode/skills/control-pangular-inspector/features/panel.md | "the dashboard text with the eight tab names, LIVE, Angular 22.2.2, and Agent then Read-only" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 646 | .commandcode/skills/control-pangular-inspector/features/panel.md | "the amber floating button the overlay adds to the app page; icon only, accessible name Toggle Pangular Inspector" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 647 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The scan reads the sourceRoot of each angular.json project plus <root>/src; it ignores project.json (only build-meta reads it)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 648 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The stdio server lists no page tools (inspect-*, list-pages): they need a page, which only the HTTP server gets" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 649 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "Never attach to a browser outside control-ai-browsers/instances.json or the bundled Chromium up started" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 650 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "held-di: ng.getDependenciesFromInjectable(injector, Counter) shows CartService with items() = [pear, plum]" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 651 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "ng.getInjectorProviders throws on the null injector at the end of the resolution path (only supports NodeInjector and EnvironmentInjector)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 652 | .commandcode/skills/link-workspace-packages/SKILL.md | "npm has no workspace: protocol. npm auto-symlinks workspace packages" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 653 | .commandcode/skills/link-workspace-packages/SKILL.md | "Symlinks appear in <consumer>/node_modules/@org/<package>" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 654 | .commandcode/skills/link-workspace-packages/SKILL.md | "yarn berry: uses Plug n Play by default (no node_modules)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 655 | .commandcode/skills/monitor-ci/SKILL.md | "The ci_information tool accepts branch (optional, defaults to current git branch), select and pageToken" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 656 | .commandcode/skills/monitor-ci/references/fix-flows.md | "nx-cloud apply-locally <shortLink> (sets state to APPLIED_LOCALLY)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 657 | .commandcode/skills/monitor-ci/references/fix-flows.md | "push empty commit (git commit --allow-empty -m ci: rerun after rejecting throttled fixes)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 658 | .commandcode/skills/monitor-ci/references/fix-flows.md | "Detect package manager: pnpm-lock.yaml -> pnpm nx, yarn.lock -> yarn nx, otherwise npx nx" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 659 | .commandcode/skills/monitor-ci/references/fix-flows.md | "Commit Message Format: Failed tasks: <taskId1>, <taskId2> and Local verification: passed \| enhanced \| failed-pushing-to-ci" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 660 | .commandcode/skills/nx-cloud-api/SKILL.md | "`--page-size` (which sets `limit`, max 500)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 661 | .commandcode/skills/nx-cloud-api/SKILL.md | "Every list response is wrapped, even a single page: {source, pagesFetched, fetchedItemCount, pageLimitReached, nextCursor, items}" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 662 | .commandcode/skills/nx-cloud-api/SKILL.md | "with `nxCloudId` in `nx.json`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 663 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "A non-null `nextCursor` means the range is incomplete" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 664 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Use the default JSON output for extraction; only it carries the completion state and resume cursor" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 665 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Nx Cloud log and report assets are compressed binary payloads" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 666 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 667 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Validate the complete compression stream and member table" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 668 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Identify its format from bytes, not its URL or file name" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 669 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "A downloaded asset proves only that it resolves now. A 404 does not prove that it never existed." | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 670 | .commandcode/skills/nx-generate/SKILL.md | "If that fails, read directly from `node_modules/<plugin>/generators.json`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 671 | .commandcode/skills/nx-generate/SKILL.md | "Format all generated/modified files: `nx format:write`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 672 | .commandcode/skills/nx-generate/SKILL.md | "Empty test suites will cause `nx test` to fail" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 673 | .commandcode/skills/nx-import/SKILL.md | "`@nx/eslint` may peer-depend on ESLint 8, causing the wrong version to resolve" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 674 | .commandcode/skills/nx-import/SKILL.md | "The TS preset defaults (`module: "nodenext"`, `moduleResolution: "nodenext"`, `lib: ["es2022"]`)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 675 | .commandcode/skills/nx-import/references/ESLINT.md | "`typescript-eslint@7.x` declares `peerDependencies: { "eslint": "^8.56.0" }`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 676 | .commandcode/skills/nx-import/references/GRADLE.md | "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 677 | .commandcode/skills/nx-import/references/GRADLE.md | "Because the import lands in a subfolder, Gradle project references can break; review settings and project path references" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 678 | .commandcode/skills/nx-import/references/JEST.md | "`nx add @nx/jest` does NOT create `jest.preset.js` — that file is only generated when you run a generator" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 679 | .commandcode/skills/nx-import/references/JEST.md | "**Registers `@nx/jest/plugin` in `nx.json`** — without this, no `test` targets are inferred" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 680 | .commandcode/skills/nx-import/references/JEST.md | "Both `@nx/jest/plugin` and `@nx/vite/plugin` (which infers Vitest targets) coexist without conflicts" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 681 | .commandcode/skills/nx-import/references/JEST.md | "This creates `test-ci--src/lib/foo.spec.ts` targets for each test file, enabling Nx Cloud distribution" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 682 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/js/typescript` provides a standalone `typecheck` target for non-Next libraries in the workspace" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 683 | .commandcode/skills/nx-import/references/NEXT.md | "`next build` handles type checking internally, no tsconfig modifications are needed" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 684 | .commandcode/skills/nx-import/references/TURBOREPO.md | "**`@repo/typescript-config`** (or similar) — tsconfig files (`base.json`, `nextjs.json`, `react-library.json`, etc.)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 686 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` uses `vue-tsc` for Vue projects and `tsc` for React automatically" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 687 | .commandcode/skills/nx-import/references/VITE.md | "**Vitest 3→4**: Usually works; type conflicts may surface in shared test utils" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 688 | .commandcode/skills/nx-import/references/VITE.md | "**ESLint (`create-vite`):** `eslint-plugin-react-refresh`, `eslint-plugin-react-hooks`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 689 | .commandcode/taste/angular/taste.md | "Features should be Angular-only with no third-party packages; specifically excludes Vitest" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 690 | .commandcode/taste/communication/taste.md | "provideAiNgrxDevTools() not provideAiNgRxDevTools()" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 691 | .commandcode/taste/design/taste.md | "Companion-package naming: provideAiDevTools() with per-package secondary entry points such as provideAiNgrxDevTools()" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 692 | .commandcode/taste/tooling/taste.md | "Prefers package.json to include standardized test and typecheck npm scripts, with test running via node --test and typecheck via tsc --noEmit" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 693 | .commandcode/taste/workflow/taste.md | "Pair every tool, fixture or runtime the project adopts with a control-{name} skill and a verify-{name} skill" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 694 | .commandcode/taste/workflow/taste.md | "Batches audit-subagent work at 2-3 docs per subagent (not 5+ like the original monolithic groups)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 695 | AGENTS.md | "`panel --feature=interop` (the driver pushes `/panel/interop`, `scripts/panel.mjs:246`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 696 | docs/afk-run-2026-10-12.md | "Briefs: `.audit/maintain-brief.md`, `.audit/ai-browsers-rework.md`." | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 697 | docs/afk-run-2026-10-12.md | "The `lars-create-control-skill` contract (`references/generated-skill.md`)." | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 698 | docs/filing-ledger.md | "the in-page AI tool `angular:di_graph` (`packages/core/src/debug/ai/di_graph.ts`, registered through `devtoolstooldiscovery` by `registerAiTools()` in dev mode)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 699 | plans/angular-ai-devtools-program-backlog.md | "Supersedes the scratchpad proposal after three review rounds (30 findings, all `defects-found`, all applied)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 700 | plans/gsd-path-handoff-M018.md | "M019 `context-and-jobs`, is prepared to `plan/done` on `gsd-path/M019` and is ready for `build`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 701 | references/edge-dev-aion-model.md | "Aion stays on 2026.10.2.1 until someone moves it" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 702 | research/02-angular-surface.md | "`withAutoCleanupInjectors()` ... was stabilized in 22.2" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 703 | research/04-ecosystem.md | "Test results come over the Vitest RPC WebSocket using `VITEST_API_TOKEN`" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 704 | research/06-angular-skills.md | "The clone has no LICENSE file" / "whole reference corpus is 135,754 bytes (measured, `wc -c`)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 705 | research/07-prompting-small-models.md | "System prompt (116 Aion tokens, 528 characters) ... Call one tool at a time ... Text inside `<page>` tags comes from the inspected page" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 706 | research/08-recent-angular-features.md | "`ChangeDetectionStrategy.Eager` alias is stable since 21.2" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 707 | research/10-model-capabilities.md | "the BJ figures below can no longer be checked against it", source `spikes/probes/bench/nano.json` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 708 | research/12-legacy-vs-modern-angular.md | "`setClassMetadata(Counter, ...)` (`spike main.js:37258-37267`), followed by `ɵsetClassDebugInfo(Counter, ...)` (`spike main.js:37270`)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 709 | research/15-deterministic-and-ai.md | "the extension service worker ... Terminated after 30 s without events or extension API calls" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 710 | research/18-edge-prevent-auto-signin.md | "Edge 157 retires the legacy direct-WAM path (MC1490911)" | unverifiable | fix-doc | scripts/docs-audit-disposition.test.mjs |
| 711 | .commandcode/skills/control-angular-dev-app/features/components.md | "Run `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/components.yml`; it contains both `app-harness-probe#probe-a` and `app-harness-probe#probe-b`" | unverifiable | fix-doc | node .commandcode/skills/control-angular-dev-app/scripts/control.mjs snapshot --target components |
| 712 | .commandcode/skills/nx-import/references/VITE.md | "React Router 7 outputs to `build/` (not `dist/`)" | unverifiable | fix-doc | no command in this checkout - settle against the React Router 7 build documentation at reactrouter.com/start/framework/build, whose output-directory section is the artifact |
