# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-02
Audited HEAD: 44e4f9b5aa5d0ce6223fbc0a8b5b7e763fd756ca
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 619 |
| stale | 14 |
| aspirational | 5 |
| unverifiable | 128 |
| descriptive docs (no testable claims) | 2 |

Claim rows audited: 766 across 142 documents; with the 2 descriptive documents, the 144 frozen inventory paths.

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | structure | verified | .claude/skills/control-ai-browsers/instances.json:67-199 - the registry lists exactly five entries: chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano |
| "the instance's registry port (9333, 9334, 9335, 9337, 9338)" | config | verified | .claude/skills/control-ai-browsers/instances.json:70,101,135,173,201 - the port fields are 9333, 9334, 9335, 9337, 9338 |
| "`9600 + 10 * slot + index`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:449 - return slot === 0 ? mainPort : 9600 + 10 * slot + index |
| "the counter fixture of control-angular-dev-app in the main checkout" with default port 4222 | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:130 - BENCH_APP is name bench app, port 4222, kind external, reason counter fixture in the main checkout |
| "playwright-cli not found on PATH" | integration | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1152 - the missing-CLI branch returns code 127 with exactly that string |
| "`edge-dev-aion` therefore launches with `--disable-component-update`" | config | verified | .claude/skills/control-ai-browsers/instances.json:148-150 - the edge-dev-aion args array holds --disable-component-update |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .claude/skills/control-ai-browsers/instances.json:70,101,135,173,201 - the five registry port fields match the five names in that order |
| "`C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2998-3009 - that file is the CLI, with a COMMANDS map of up, attach, detach, doctor, flags, model, run, panel, down, info |
| "four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`" | structure | verified | features/di-doctor.md, error-explainer.md, extension-panel.md, health-check.md, instances.md, interop.md, model-lifecycle.md, probes.md, signal-provenance.md, stale-view.md - each has exactly those four H2s in that order |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`) before `up`" | command | verified | apps/angular-ai-devtools/project.json:52-62 - the angular-ai-devtools project has a build-extension target whose outputPath base is extension/panel |
| "their state files belong to the primary checkout (`.commandcode/worktrees/` there)" | structure | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:118-120 - ARTIFACT_ROOT is join(PRIMARY, .commandcode, worktrees); TMP and PROFILES resolve from it |
| "The five instances run, started by `C up`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2999 - up is the first COMMANDS entry and cmdUp starts the instance |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`)" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 - chrome.runtime.sendMessage with type angular-ai:di-query, componentName and elementTag |
| "receives `angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:16-17 - the handler matches type angular-ai:di-graph and stores msg.resolutionPath, typed DiResolutionPath imported from src/main-world/di-path-tracer |
| "`apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | apps/angular-ai-devtools/src/app - all three files are present and n3-di-doctor.component.ts:6 imports diffDiPaths from ./di-diff-display |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs and di-doctor.test.mjs exist in that checks directory |
| "with a path view and a diff view" | feature | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:23,62 - a Diff tab button bound to view.set(diff) and a view signal defaulting to path |
| "the Diff tab needs at least two resolution paths to compare" | feature | verified | apps/angular-ai-devtools/src/app/n3-di-doctor.component.ts:37-43 - the diff block renders only when diffResult() is set, and di-diff-display.ts exports diffDiPaths over a pair of paths |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "captures `NG0xxx` and uncaught console errors" | feature | verified | src/main-world/error-capture.ts:3-4,36 - extracts an NG0xxx code from a thrown or uncaught error with the regex NG0 followed by three or more digits |
| "maps each to its owning component through `ng.getOwningComponent`" | feature | verified | src/main-world/error-capture.ts:43-53 - resolveOwningComponent calls ng.getOwningComponent, with the legacy property spellings as fallbacks |
| "a digest of the official `angular.dev/errors` documentation bundled at extension build time" | feature | verified | apps/angular-ai-devtools/project.json:93-96 - the generate-error-digest target runs node scripts/generate-error-digest.mjs, and error-explainer.component.ts:7 imports extension/error-digest.json |
| "`C panel` " driving with `--feature=error-explainer` | command | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs:74 - runs control panel with --url and --feature=error-explainer; control.mjs:2301 forwards opts.feature to drivePanel and panel.mjs:239 selects the error flow |
| "the driver injects a captured `NG0100` error" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs:97 - the claim fails unless the panel reported code NG0100 |
| "message types `angular-ai:error-capture` / `angular-ai:error-explain`" | integration | stale | apps/angular-ai-devtools/src/app/extension-message.service.ts:77 - handles angular-ai:error-capture only; no angular-ai:error-explain string exists anywhere in apps/, src/, extension/, scripts/ or tests/, and the explain step is panel-local via src/panel/error-explainer-view.ts (error-explainer.component.ts:4,42-46) |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Every instance loads the repository's unpacked Angular AI DevTools extension at launch: the primary checkout's `extension/` (registry `extension`)" | config | verified | .claude/skills/control-ai-browsers/instances.json:68-225 - all five instance entries carry extension: extension, the folder the extension build writes |
| "`--remote-debugging-pipe --enable-unsafe-extension-debugging`, calls CDP `Extensions.loadUnpacked`" | integration | verified | .claude/skills/control-ai-browsers/scripts/pipe-keeper.mjs:3-4,90 - starts the browser with --remote-debugging-pipe, sends Extensions.loadUnpacked and holds the pipe until the browser exits |
| "`onShowPanel` takes that key" | integration | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:51-57,227 - the key is the clientObjects key that starts with extension-panel-, passed to Extensions.extensionServer.onShowPanel |
| "writes `extension/panel/` (`main.js`, `styles.css` and `index.html`" | structure | verified | apps/angular-ai-devtools/project.json:52-76 - the build-extension target outputs to extension/panel with baseHref /panel/ |
| "With `--json` the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps`" | config | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:160 - the run object is initialised with ngVersion, extensionId, answer, error, status, answerMs and steps, and control.mjs returns it under --json |
| "It runs `panel` and the state claim on every instance" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:11,51 - usage is the script with --evidence and --url, and check() drives panel plus instanceState per named instance |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Prompt API reports `available`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2549 - doctor gates on avail.LanguageModel and reports the check skipped when LanguageModel is not available |
| "Doctor skips the page canaries when the model is not `available`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2549 - the skip line names the availability value and tells the reader to run model download |
| "the webmcp check passes only when `document.modelContext` is an object" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1439 - the webmcp check passes when typeof document.modelContext is object |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | status | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1372 - the probe records documentModelContext and navigatorModelContext separately, so a build with only one of them is visible |
| "Edge Dev 157.0.4329 requires `callId` on `LanguageModelToolSuccess`; the canary sends `callID` and `callId`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:1427-1430 - the comment names the Edge build, and LanguageModelToolSuccess is built with callID and callId |
| "Nineteen check lines" for `C doctor` � the count is asserted nowhere in the scripts | status | unverifiable | .claude/skills/control-ai-browsers/scripts/control.mjs:2015-2019 - the doctor only formats each check as OK, WARN, SKIP or ERROR and has no total; a live doctor run would settle the count |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a separate browser process with its own profile" | structure | verified | .claude/skills/control-ai-browsers/instances.json:2 - profilesRoot is .browsers, resolved against the primary checkout at control.mjs:118-120 and used per instance at control.mjs:536 |
| "`C flags edge-dev-aion`. `[OK]` with the nine Aion features" | config | verified | .claude/skills/control-ai-browsers/instances.json:133-150 - the edge-dev-aion features array holds exactly nine entries, ending with msEdgeLLMOnDeviceModelMuffinToolUseWorkaround and msEdgeLLMOnDeviceModelPrerelease |
| "`C up edge-dev-aion --backend=cpu` exits 2 before anything starts" | status | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:523 - refuse names the instance and says forcing CPU on Edge deletes the installed model, measured twice |
| "The script finds instance processes only by `--user-data-dir`" | feature | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:536,660 - the launch line sets --user-data-dir=inst.dir and the process match compares that folder, so an everyday Edge process is never picked |
| "One line per instance (five)" | structure | verified | .claude/skills/control-ai-browsers/instances.json:67-199 - the registry holds exactly five instance entries |
| "An entry's `args` are switches, bare or `--name=value`, that `up` adds after the common ones" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:536,806 - the launched command line appends switchesOf(inst) after the user-data-dir, remote-debugging-port and enable-features entries, and drift compares them by name |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node), `interop-limit` (the cannot-name statement), `interop-inferred` (the attribution wording)" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19-25 - data-testid values interop-slice, interop-node, interop-limit and interop-inferred are all rendered, with explain at :26, ai-answer at :33 and empty-state at :16 |
| "`apps/angular-ai-devtools/src/app/interop.component.ts`; message types `angular-ai:interop`" | integration | stale | the component exists, but no angular-ai:interop message type does: the only angular-ai types in apps/angular-ai-devtools/src and src are di-graph, di-query, error-capture, record and state, and interop.service.ts sends no chrome.runtime message |
| "Zero interop nodes renders an explicit empty state ("no interop nodes")" | status | stale | apps/angular-ai-devtools/src/app/interop.component.ts:16 - the empty state renders "no interop findings", not "no interop nodes" |
| "the driver routes the panel to `interop`" | command | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:241 - isInterop is feature === interop, and control.mjs:2301 passes opts.feature through to drivePanel |
| "The check asserts that the instance serves the extension at the check's own checkout path" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:75,148,152 - a mismatch is could-not-run naming the loaded folder, and the usage documents --extension for a sidecar |
| "the check exits 0 on `edge-dev-aion` with `nodes: 1`" | status | unverifiable | .project/build/verify/interop/ does not exist in this checkout; the run's own evidence JSON named in the doc is what would settle it — Settling check: `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` — the check writes the run JSON in .project/build/verify/interop/. |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The model folders in the profile" - OptGuideOnDeviceModel for Nano, OptGuideManifestModel for Gemma 4, EdgeLLMOnDeviceModel for Aion and Phi-4-mini | config | verified | .claude/skills/control-ai-browsers/instances.json:91,125,163,191,222 - the model.folders patterns match that per-instance split |
| "`model clear` refuses a running instance" | status | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2846-2848 - refuse tells the reader to run down first and that files are never deleted under a running browser |
| "free space minus the model's `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .claude/skills/control-ai-browsers/instances.json:16,26 minFreeMib 22528 on both Chrome entries and :41,60 minFreeMib 20480 on both Edge entries, against downloadMib at :96,130,168,196,227 |
| "the folder `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion` of the primary checkout" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:901-905 - the pin folder is join(TMP, pins, name) and TMP is the primary checkout's .commandcode/worktrees/tmp/control-ai-browsers |
| "`model download` refuses (exit 2)" on an instance launched with `--disable-component-update` | status | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2745-2746 - modelDownload refuses before any page step, saying Check for update starts no download on that instance |
| "Forcing CPU on Edge uninstalls the model; `up --backend=cpu` is refused on Edge instances" | status | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:523 - refuse reports that forcing CPU on Edge deletes the installed model, measured twice |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`" | structure | verified | spikes/probes/probe10.js:7-8,15-16 - the probe registers the get_component_count and get_component_inputs tools and logs each call |
| "`bench.js` hard-codes it" | config | verified | spikes/probes/bench.js:4 - page.goto to http://localhost:4222/, the counter fixture port |
| "so `bench` runs from the main checkout only" | status | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2920 - cmdBench refuses with that reason, naming the hard-coded 4222 |
| "`results[i]` holds the serving model, `backend`, `performanceClass`, `cpuBefore` and `cpuAfter`" | config | verified | .claude/skills/control-ai-browsers/scripts/control.mjs:2904-2912 - the BenchRecord typedef carries model, backend, performanceClass, cpuBefore, cpuAfter and result |
| "`bench.js` has a 120 s per-prompt timeout" | config | verified | spikes/probes/bench.js:11 - PROMPT_TIMEOUT_MS = 120000 |
| "Summarise with `node spikes/probes/bench-summary.mjs`" | structure | verified | spikes/probes/bench-summary.mjs exists in the same folder as bench.js and bench-all.sh |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`)" | integration | verified | extension/agent-main.test.mjs:179-358 asserts the angular-ai:record messages that agent emits; src/main-world/provenance-tracer.ts:8-17 is the MAIN-world tracer over the signal graph |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:65 - the branch matches msg.type angular-ai:record with a cycle and stores the facts |
| "The chain lists producer/consumer/self steps with kind, label and position" | feature | verified | apps/angular-ai-devtools/src/app/signal-provenance.ts:14,110-115 - each step carries kind, label, direction and position, and n2-signal-provenance.component.ts:41 renders the position |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs and its signal-provenance.test.mjs exist in that checks folder |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends the hedged wording "the template may show a stale value", the field name and the owning component" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21-23 - data-testid hedged renders that exact sentence, field-name renders f.field and owning-component renders f.component |
| "With zero findings the panel renders an explicit empty state ("no stale-view findings")" | status | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:17 - data-testid empty-state renders no stale-view findings |
| "`apps/angular-ai-devtools/src/app/stale-view.component.ts`; message types `angular-ai:stale-view`" | integration | stale | the component exists, but no angular-ai:stale-view message type does: the only angular-ai types in apps/angular-ai-devtools/src and src are di-graph, di-query, error-capture, record and state, and the scan runs in the panel through stale-view-scan.ts |
| "the driver routes the panel to `stale-view`" | command | verified | .claude/skills/control-ai-browsers/scripts/panel.mjs:240 - isStale is feature === stale-view, and control.mjs:2301 forwards opts.feature |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:82,90,100 - slot 0 gives 4222/4223/4200, every other slot 4300/4400/4500 + slot |
| "`control.mjs:69` keeps it at 3000" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 - `const PORTAL_API_PORT = 3000;` |
| "override it with `--dir <path>` or `CONTROL_NG_PORTAL_DIR`" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:67,97 - PORTAL_DEFAULT_DIR and `process.env[CONTROL_NG_PORTAL_DIR] falling back to PORTAL_DEFAULT_DIR` |
| "`spikes/ng222-app`, Angular 22.2.2" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json - installed core version is 22.2.2 |
| "the two routes `src/app/app.routes.ts:5-8` declares, `/stale-view` and `/stale-view-deferred`" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:6,7 - `path: stale-view` and `path: stale-view-deferred` |
| "`npm test` at the repository root runs them" | command | verified | package.json - `test:skills` runs `node --experimental-strip-types --test .claude/skills/**/*.test.mjs` |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh page state: `count` 3, `double` 6, cart 1 item" | status | verified | spikes/ng222-app/src/app/counter.ts:17,18,5 - `count = signal(3)`, `double = computed(() => this.count() * 2)`, CartService items `[apple]` |
| "Take `<session>`, `<url>` and `<evidenceDir>` from `node $S info`" | command | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:1029 - the launch state holds `url`, `session`, `evidenceDir`; the script exists at the documented path |
| "four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-dev-app`, `Gotchas`" | structure | verified | the six feature files in .claude/skills/control-angular-dev-app/features/ each carry those four H2 headings in that order (Select-String ^## ) |
| "[Counter](./counter.md) ... [Portal complaints and customers](./portal-complaints-customers.md)" | structure | verified | all six linked files exist: counter.md, ssr.md, portal-navigation.md, portal-contracts.md, portal-claims.md, portal-complaints-customers.md |
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | config | verified | portal checkout apps/insurance-portal/src/assets/feature-flags.manifest.json exists and is read by the portal shell for sidebar and canMatch guards |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button" | status | verified | spikes/ng222-app/src/app/app.ts:9 passes `title=Clicks`; counter.ts:11,12 template prints `{{ title() }}: {{ count() }} (double {{ double() }}, cart {{ cart.items().length }})` and the Increment button |
| "an injected `CartService.items` signal and an effect that copies `count` into `lastLogged`" | feature | verified | spikes/ng222-app/src/app/counter.ts:5 `items = signal([apple])`, :19 `cart = inject(CartService)`, :23 `effect(() => this.lastLogged.set(this.count()))` |
| "`counter-cd` the component is OnPush by default (no `changeDetection` declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:8-14 - the @Component metadata declares only selector and template, no changeDetection |
| "`/stale-view` and `/stale-view-deferred` (`src/app/app.routes.ts:5-8`)" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 - routes array with `path: stale-view` and `path: stale-view-deferred` |
| "the effect writes `lastLogged` on every change (deliberate anti-pattern fixture)" | feature | verified | spikes/ng222-app/src/app/counter.ts:22-23 - constructor effect writes the `lastLogged` signal |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`claim-list` table with columns Claim number, Damage Type, Date, Policynumber, Customer; 5 rows measured" | status | verified | portal checkout apps/api/src/uuids.ts:9 - `claim_uuids = [...Array(5).keys()]`, so the API seeds 5 claims |
| "`/claim/create` shows the heading `Complaint Create`: an app bug" | status | verified | portal libs/claim/feature-create/src/lib/create.component.ts:39 - `<ng-journal-header title=Complaint Create />` on the claim create page |
| "Deep links `/claim/list`, `/claim/create`, `/claim/<id>/details`" | structure | verified | portal libs/claim/routes/src/lib/routes.ts - child paths `list`, `create`, `:id/details`, each behind featureFlagGuard(claim-list/claim-create/claim-details) |
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | portal apps/api/src/claim/claim.controller.ts - `@Controller(claims)` with @Get, @Get(:id) and @Post; port 3000 fixed by .claude/skills/control-angular-dev-app/scripts/control.mjs:69 |
| "the customer as a link to `/customer/<id>/details`" | structure | verified | portal libs/customer/routes/src/lib/routes.ts - child path `:id/details` behind featureFlagGuard(customer-details) |
| "`Select damage type` and `Select contract` (under the label Policynumber) dropdowns" | config | unverifiable | needs the claim form template text at run time; portal libs/claim/ui/src/lib/claim-form.component.ts would settle the labels — Settling check: `control.mjs up --target portal` — the portal clone's claim-form template renders in a driven run. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | status | verified | portal checkout apps/api/src/uuids.ts:3 - `customer_uuids = [...Array(30).keys()]`, so 30 customers are seeded |
| "`complaint-list` columns Type, Customer, Date, Description; 2 seeded rows" | status | verified | portal checkout apps/api/src/uuids.ts:10 - `complaint_uuids = [...Array(2).keys()]`, so 2 complaints are seeded |
| "`Select type` (CustomerService, Sales, Payments)" | config | verified | portal libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts - enum ComplaintTypeDto has CustomerService, Sales, Payments |
| "Save sends `POST /api/complaints` (201)" | integration | verified | portal apps/api/src/complaint/complaint.controller.ts - `@Controller(complaints)` with @Post (Nest returns 201) and @Get(:id) |
| "Deep links `/complaint/list`, `/complaint/create`, `/customer/list`, `/customer/<id>/details`" | structure | verified | portal libs/complaint/routes/src/lib/routes.ts (list, create, :id/details) and libs/customer/routes/src/lib/routes.ts (list, :id/details) |
| "contract details also link to the customer details page" | structure | unverifiable | needs the contract details template; portal libs/contract/feature-details/src/lib/details.component.ts would settle whether the customer name is rendered as a routerLink — Settling check: `control.mjs up --target portal` — the portal clone's contract details template renders in a driven run. |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`contract-list` table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email; 20 rows after a fresh API start" | status | verified | portal checkout apps/api/src/uuids.ts:6 - `contract_uuids = [...Array(20).keys()]`; libs/contract/feature-list/src/lib/list.component.ts:34 `<th>Policynumber</th>` |
| "`contract-edit` `Edit` opens `/contract/<id>/edit`, heading `Contract Edit`" | structure | verified | portal libs/contract/routes/src/lib/routes.ts child path `:id/edit`; libs/contract/feature-edit/src/lib/edit.component.ts:51 `<ng-journal-header title=Contract Edit />` |
| "then sends `PUT /api/contracts` and returns to details with the new value" | integration | verified | portal apps/api/src/contract/contract.controller.ts - `@Controller(contracts)` with @Put beside @Get, @Get(:id), @Post |
| "Save sends `POST /api/contracts` (201) and opens the new contract details" | integration | verified | portal apps/api/src/contract/contract.controller.ts @Post; libs/contract/feature-create/src/lib/create.component.ts:46 renders `Contract Create` and posts the form value |
| "`withComponentInputBinding` passes the route `id`" | config | verified | portal apps/insurance-portal/src/app/app.config.ts:24 - `withComponentInputBinding()` in the router providers |
| "`contract-create` `/contract/create`: Status chip `Pending`" | config | verified | portal libs/contract/models/src/lib/dtos/contract-status.model.ts - enum ContractStatusDto Pending/Active/Inactive; libs/contract/ui/src/lib/contract-status-chip.component.ts:4 maps Pending to the pending chip style |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`/` redirects to `/home`, which shows four tiles linking to the domain lists" | structure | verified | portal checkout apps/insurance-portal/src/app/app.routes.ts:5-9 - path empty with `pathMatch: full` and `redirectTo: home`, then the home component |
| "Domain routes load lazily, guarded by feature flags" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts - `loadChildren` for contract, claim, complaint, customer; every domain libs/*/routes/src/lib/routes.ts child carries `canMatch: [featureFlagGuard(...)]` |
| "unknown URLs show Page Not Found" | structure | verified | portal apps/insurance-portal/src/app/app.routes.ts - `path: **` loads PageNotFoundComponent; apps/insurance-portal/src/app/page-not-found.component.ts:7-8 holds `Page Not Found` and `Sorry, but the page you were trying to view does not exist.` |
| "a sidebar grouped by domain (General, Contract, Claim, Complaint, Customer)" | structure | verified | portal apps/insurance-portal/src/app/sidebar.component.ts:78 - `domain: General` beside the other domain configs, General special-cased at :48,53,106 |
| "`CONTRACT`, through the `capitalize` pipe, which calls `toUpperCase`" | feature | verified | portal libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:11 - `return value.toUpperCase();` under `name: capitalize` |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`?mismatch=1` (structural hydration mismatch, NG0500)" | feature | verified | spikes/ng222-ssr/src/app/mismatch.ts:14-15 - on the server with mode 1 it inserts a `div` before the template `p` via Renderer2 |
| "`?mismatch=text` (different text on server and client, no error)" | feature | verified | spikes/ng222-ssr/src/app/mismatch.ts:9 - template renders `server text` on the server and `client text` in the browser when mode is text |
| "`ssr-render-modes` `/` is `ssr`, `/prerender` is `ssg`, `/client` is the bare shell with `<body ngcm>`" | structure | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - RenderMode.Server for path empty, RenderMode.Prerender for prerender, RenderMode.Client for client |
| "`ok` is `true` when all six checks pass" | structure | verified | .claude/skills/control-angular-dev-app/scripts/ssr-check.js:75-82 - six checks: server-html-ngh, server-html-transfer-state, dev-build-after-hydration, hydration-counters, no-mismatch-on-default-route, expected-mismatch-detected |
| "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | status | unverifiable | runtime counters only; ssr-check.js:57 reports them but the values need `node $S up --target ssr` plus a live ssr-check.js run — Settling check: `control.mjs up --target ssr` — the counters are read from a live dev-mode page. |
| "Run the spike probes `spikes/probes/ssr-event-replay.js` and `spikes/probes/ssr-render-modes.js`" | command | verified | both probe files exist under spikes/probes/ in the repository |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:89 - `const EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh;` |
| "Chrome for Testing 156.0.8078.4, revision 1248, read 2026-11-01 from `node_modules/playwright-core/browsers.json`" | config | verified | node_modules/playwright-core/browsers.json - chromium entry has revision 1248 and browserVersion 156.0.8078.4 |
| "session `ngdt`, CDP port 9420 and worktree CDP port `9420 + slot` (9421-9499)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:273,274,311 - MAIN_CDP_PORT 9420, comment 9421-9499 for worktree slots, SESSION ngdt for the main flow |
| "a `--browser` outside `test\|chrome\|chrome-beta\|edge\|edge-dev` ... exits 2" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:112 - BROWSER_VALUES lists exactly test, chrome, chrome-beta, edge, edge-dev |
| "Measured: 22.2.2 for the Angular version DevTools shows" | status | verified | spikes/ng222-app/node_modules/@angular/core/package.json - installed version 22.2.2, the value `[ng-version]` carries |
| "never use the playwright-cli sessions `cb`, `ed`, `ai-cb`, `ai-ed`, `ng-dev`" | config | unverifiable | needs the control-ai-browsers session list; .commandcode/skills/control-ai-browsers/scripts/control.mjs would settle which sessions that skill owns |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at `spikes/ng222-app` (Angular 22.2.2)" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json - installed version 22.2.2 |
| "Panel: `control.mjs panel ...` and `coexist` (raw CDP into `chrome-extension://<id>/index.html`)" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:794 - `isPanel = (t) => t.url === chrome-extension://${EXT_ID}/index.html` |
| "Test harness: `node $S install`, `node $S up --app-url=<app url>`, `node $S doctor` exits 0" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs - cmdInstall (:1006), the up state records appUrl (:1216), doctor checks; usage lists install, uninstall, status, up, doctor, attach, info, down, panel, coexist |
| "Desktop session available (the harness is headed)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1192 - the playwright-cli config sets `headless: false` |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1172 - `join(TMP, evidence, evidenceStamp(...))`; .gitignore:7 ignores tmp/control-angular-devtools/ |
| "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`)" | feature | unverifiable | that file is Angular DevTools frontend source, not vendored in this repository; a live `panel show` on the counter fixture would settle it — Settling check: `control.mjs panel` — the live panel's Router Tree tab is the only local reader. |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:891 defines the property on window; :905 reads `window.__NG_DEVTOOLS_CONNECTED__ === true` as the flag marker |
| "Angular version from `[ng-version]`" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1332 - `document.querySelector([ng-version])?.getAttribute(ng-version)` |
| "`attach` exits 1 because it requires `isDebugMode`" | status | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1349 - attached requires `d.isAngular && d.isDebugMode && r.backendInstalled && r.backendReady` |
| "Detection result: `isAngular`, `isDebugMode` (development build), `isIvy`, `isSupportedAngularVersion` (major 12+ or 0)" | feature | unverifiable | the detect-angular message is produced by the extension bundle, not vendored here; a live `node $S attach` prints the five booleans — Settling check: `control.mjs attach` — a live attach prints the five detection booleans. |
| "Expected (measured on the counter fixture): `flag true (set at ~50 ms)` ... `backendReady at ~950 ms`" | status | unverifiable | timing measurements need a live harness run (`node $S up --app-url=...` then `node $S attach`) — Settling check: `control.mjs attach` — the timings come from a live attach run. |
| "the popup shows `production.html`" | feature | unverifiable | extension UI asset, not in this repository; the extension package under tmp/control-angular-devtools/extension/<version>/ would settle it — Settling check: `tmp/control-angular-devtools/extension/1.22.0/manifest.json` — the popup asset ships inside that packaged extension. |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:89 - `const EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh;` |
| "Store page: `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:91 - STORE_URL builds exactly that URL from EXT_ID |
| "polls the profile every 2 s until the extension appears (default 180 s)" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1019,1024 - log names `${opts.timeout ?? 180} s`, poll interval `2000` ms |
| "End state: test: `doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | status | stale | tmp/control-angular-devtools/extension/ holds only the folder `1.22.0` (written 2026-10-19), not 1.22.1; a live `node $S install` then `doctor` settles whether Edge Dev now ships 1.22.1 |
| "`node $S uninstall --browser=chrome-beta` opens the store page, polls for Remove from Chrome" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1079,1084 - logs opening STORE_URL and polls the profile every 2000 ms up to the 180 s timeout |
| "`node $S status --browser=chrome-beta` ... read only, any branded browser" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:112 - BROWSER_VALUES test, chrome, chrome-beta, edge, edge-dev; status reads the profile settings only (:959-962) |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.setProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:134,144 - `const profilerCallbacks = []` and setProfiler pushes the callback |
| "`ng.setProfiler(null)` clears every subscriber, DevTools included" | feature | verified | spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:150-155 - the null branch sets `profilerCallbacks.length = 0` |
| "remove your own with the function `setProfiler(cb)` returns" | feature | verified | same file :150-152 - returns `() => removeProfiler(profiler)`, which splices that one callback out |
| "DevTools subscriber cannot be listed from the page (the list is module-private)" | feature | verified | same file :134 - profilerCallbacks is a module-scope const, not exported; types/core.d.ts:8776 declares only `ng.setProfiler(profiler \| null)` |
| "`node $S coexist`" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs - `coexist` command with `--component`, `--click` and `--di-graph` flags; it screenshots signal-graph before and after (:1497) |
| "Expected (measured): `own subscribers ...; DevTools recorded 2 change detection cycles`" | status | unverifiable | counters need a live `node $S coexist` run against the counter fixture — Settling check: `control.mjs coexist` — the profiler counters come from a live run. |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "F12 -> Angular tab -> Components -> click `app-counter` -> Show Signal Graph" | command | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:849-853 - panelSignalGraph opens the Components tab, selects the named component and fails when it is absent from the tree |
| "Signal graph nodes (kind, label, value) and edges." | structure | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:830 - the pane reader maps `ng-signal-graph-pane .node-cont` elements to their label and value |
| "Agreement with `ng.getSignalGraph(ng.getInjector(host))`, which the pane's backend calls." | feature | verified | spikes/ng222-app/node_modules/@angular/core/fesm2022/core.mjs:2290 - the dev-mode global exposes `getSignalGraph(injector)` over the same signal graph |
| "`--di-graph` runs Angular's `angular:di_graph` tool" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1501-1507 - dispatches `devtoolstooldiscovery` and executes the tool named `angular:di_graph` |
| "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`, `ng.getSignalGraph` `effect, signal:count`." | status | unverifiable | a measured pane read; `node $S panel signal-graph --component=app-counter` then `node $S coexist --di-graph` on the counter fixture would settle it — Settling check: `control.mjs coexist` — the pane read and the ng.getSignalGraph read come from a driven run. |
| "`.node-cont.kind-*` are DevTools 1.22.0 class names; re-read them from the live panel after an update." | config | unverifiable | the class names live in the DevTools bundle under tmp/control-angular-devtools/extension/1.22.0/bundle, which was not grepped; the live panel shows them — Settling check: `control.mjs panel` — the live panel renders the kind classes. |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "@pangular-inspector/devtools, pinned 0.0.7" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:73 — PINNED = '0.0.7' |
| "control.mjs:74 defaults to 9999" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 — DEFAULT_PORT = 9999 with the proxy-pins-it comment |
| "playwright-cli session `pangular-9999`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — session: `pangular-${p}`, p = 9999 |
| "none of the eight action tools (`highlight`, `navigate`, ...)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:76 — ACTION_TOOLS holds exactly those eight names |
| "the overlay import after bootstrap, guarded by ... ngDevMode" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1326 — doctor passes overlay-import only when overlayImport && devGuard |
| "npm test at the repository root runs them and npm run check type-checks" | command | verified | package.json:10-11 — test:skills runs .claude/skills/**/*.test.mjs, check:skills runs tsc -p .claude/skills/tsconfig.json |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-pangular-inspector/scripts/control.mjs`" | structure | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1574 — the script's own usage line names install/check/remove/up/doctor/info/down/tools/call/resource/scan/components |
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — the state records session `pangular-${p}` and evidenceDir |
| "App: `node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | config | unverifiable | .claude/skills/control-angular-dev-app/scripts/control.mjs:69,100 — the API is fixed 3000, but 4507 is a slot-derived port (4200 at slot 0, else 4500+slot); one `info --target portal --json` settles it |
| "four H2s in this order: Sub-features, How to get to it (user POV), Driving it with control-pangular-inspector, Gotchas" | structure | verified | features/setup.md:6,14,19,36 — the four H2s in that order in a sibling feature file |
| "Full sweep: Setup, Live inspection, Navigation, Source scan, Panel UI" | structure | verified | features/ directory holds setup.md, live-inspection.md, navigation.md, source-scan.md, panel.md and no other feature file |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — mcpUrl = `http://localhost:${p}/__mcp` |
| "`list-pages` shows the tab's page id, URL and the inspectors that report" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1422,1432 — doctor calls the list-pages tool and matches the page id |
| "`list-components` on versions after 0.0.7" | status | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1445 — comment: list-components when the server has it (unreleased after 0.0.7) |
| "`node $S components --depth 3`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:643 — componentOutline(tree, filter, depth) drops nodes at or below depth |
| "`inspect-providers` ... by selector or by `token`" | feature | unverifiable | only the selector form is exercised in this repository (verify-pangular-inspector/checks/live-reads.mjs); the token lookup lives in the pinned 0.0.7 server, one `call inspect-providers` with a token settles it |
| "the answer starts `No signal graph for <selector>`" | status | unverifiable | that message is produced by the pinned 0.0.7 server in the portal checkout's node_modules, outside this repository; one live `inspect-signals` settles it — Settling check: `control.mjs call` — one `call inspect-signals` prints the message. |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S call inspect-route`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1279 — `call` resolves any tool name from tools/list and fails 2 only for an unknown one |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | config | unverifiable | the default lives in the pinned 0.0.7 server schema, not in this repository (control.mjs:1276 passes --args through unchanged); one call without limit settles it |
| "The sidebar entries are `div`s with `routerLink`" | feature | unverifiable | the portal templates are in the external checkout (control-angular-dev-app/scripts/control.mjs:67); a snapshot of the sidebar settles it — Settling check: the portal clone — no command in this checkout reaches the portal templates, so a read of that clone is the external artifact. |
| "the first navigation before the overlay connected shows no details" | status | unverifiable | overlay behaviour of the pinned package in the portal checkout; one drive with a fresh page settles it — Settling check: `control.mjs up --target portal` — overlay behaviour needs a driven portal page. |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | config | unverifiable | .claude/skills/control-angular-dev-app/scripts/control.mjs:100,700 — the portal app port is slot-derived (4200 at slot 0, else 4500+slot) and it proxies /__pangular; 4507 needs `info --target portal` |
| "`playwright-cli -s=pangular-9999 goto`" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — the session is named pangular-<port> |
| "the eight tab names, `LIVE`, `Angular 22.2.2`, and `Agent` then `Read-only`" | feature | unverifiable | the dashboard HTML ships in @pangular-inspector/devtools 0.0.7 inside the portal checkout's node_modules; one panel load settles it — Settling check: `control.mjs up` — one driven panel load renders the tab names. |
| "A code expires after 5 minutes" | status | unverifiable | the one-time code is minted and expired by the standalone server; control.mjs:1378 only reads it from pangular.log |
| "`find` with `Toggle Pangular` on the app page finds the button" | feature | unverifiable | the overlay button's accessible name comes from the pinned package bundle; one snapshot of the app page settles it — Settling check: `control.mjs up` — the overlay button renders only on a driven app page. |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup.check`: six read-only facts, one line each" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:590-595 — six add() calls: declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target; pass `--project`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:810 — fail(2, 'no Nx application with an @angular/build:dev-server serve target under ... (pass --dir, --project)') |
| "The `main.ts` edit needs the form `bootstrapApplication(...).catch(`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:465,927 — the regex /bootstrapApplication\(([^)]*)\)(\s*)\.catch\(/ and its exit-2 fallback |
| "`remove` ... exits 0 only when `git status --porcelain` and `git diff HEAD` are empty" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1002 — exit 0 only when left.length === 0 && !diff, with gitStatus/gitDiffStat in the JSON |
| "`install` refuses SSR and Vite mounts (exit 2)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:433,439,885 — detects src/server.ts and vite.config.*, then fails 2 for the non-standalone mount |
| "`check` there exits 0 where the worktree carries it with no install (measured)" | status | unverifiable | the portal checkout is outside this repository (control-angular-dev-app/scripts/control.mjs:67); one `node $S check` there settles it |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scan <tool>`, which starts that server, calls one tool and stops it" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1493 — spawns the package bin with 'mcp', '--root', root, '--read-only' as a stdio server |
| "`--root` picks the folder to scan" | command | verified | same call site, control.mjs:1493 — the root is passed as `--root` to the stdio server, and :1539 echoes it in the result |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1540 — save into path.join(SCRATCH, 'scan') |
| "`npx pangular mcp --root <dir>` in an MCP client config (stdio)" | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1493 — the `mcp` subcommand with `--root` is the same server the script speaks to |
| "the stdio list of `get-routes`, `get-components`, ... `analog-*` tools" | feature | unverifiable | the tool names come from the installed package's stdio server, printed at run time (control.mjs:1531); no file in this repository lists them |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the per-model instance (default `chrome-beta-gemma4`)" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:101 — DEFAULT_INSTANCE = 'chrome-beta-gemma4' |
| "vitest \| derived \| 51315" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:99 — MAIN_VITEST_PORT = 51315 |
| "bundled-cdp \| derived \| 9350" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:100 — MAIN_BUNDLED_CDP_PORT = 9350 |
| "the playwright-cli session is `control-vitest-<flowId>-<Vitest port>`" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:899 — session: `control-vitest-${flowId}-${vitestPort}` |
| "`--timeout <s>` (default 180)" | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:174 — Number(flagIn(args, 'timeout') ?? 180) * 1000 |
| "`--hold <ms>` sets `VITE_COUNTER_HOLD_MS`" | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:586 — env['VITE_COUNTER_HOLD_MS'] = String(state.hold) |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "four H2s in order: Sub-features, How to get to it (user POV), Driving it with control-vitest-browser-angular, Gotchas" | structure | verified | features/held-counter.md:8,19,23,43 — the four H2s in that order in a sibling feature file |
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to ['pear', 'plum'])" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:61,70 — setup({cartItems:['pear','plum']}) and the expectation `Clicks: ${next} (double ${next*2}, cart 2)` |
| "`mounted-component` passes only while the hold test runs (90 s from `RUN`)" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1146 — mounted-component warns with no [ng-version] host, so only a hold keeps one mounted |
| "`node $S up --extension s1-vitest --hold 90000`" | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:927 — `--extension s1-vitest` writes the generated variant; :586 sets the hold |
| "the tab titled Vitest Browser Runner" | feature | unverifiable | the title is rendered by Vitest's browser runner at run time; no repository file sets it, one tab-list settles it — Settling check: `control.mjs up` — the Vitest tab title renders only in a driven run. |
| "`S` is `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`" | structure | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1271 — the usage line names up, doctor, info and down |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed \| 2 skipped (4) without flags" | status | unverifiable | a run prints that line; the spec has 2 unconditional tests and 2 `it.runIf` tests (spikes/ng222-app/src/app/counter.spec.ts:39,56), so one `node $S up` settles it — Settling check: `control.mjs up` — the run prints the tests line. |
| "a test that fails on purpose because it reads the DOM in the same task as the click" | feature | verified | counter.spec.ts:37-39 — the comment plus `it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1')` |
| "an Increment click moves 'Clicks: 3 (double 6, cart 1)' to 'Clicks: 4 (double 8, cart 1)'" | feature | verified | counter.spec.ts:23,25,27 — the two toHaveTextContent assertions around incrementButton.click() |
| "a `CartService` override shows 'cart 2'" | feature | verified | counter.spec.ts:30,32,34 — setup({cartItems:['pear','plum']}) then 'Clicks: 3 (double 6, cart 2)' |
| "`npm test` in `spikes/ng222-app` runs the default `headless` configuration once" | command | verified | spikes/ng222-app/angular.json:73,85 — a headless configuration and defaultConfiguration headless |
| "`--filter` ... `up --hold <ms> --filter keeps the counter mounted` runs it alone (1 passed \| 3 skipped (4))" | feature | unverifiable | needs one run; the hold test is gated at counter.spec.ts:56 and the probe runner filters by that name (spikes/probes/vitest-attach.mjs:99) |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its content scripts inject into the Vitest tab and the tester iframe" | feature | verified | spikes/probes/vitest-lib.mjs:22-23 — matches http://127.0.0.1/* and http://localhost/* with all_frames: true, one script in the MAIN world |
| "`spikes/s1-extension` was retired in M009" | status | verified | spikes/s1-extension does not exist (Test-Path false); .project/archive/001-run-unrun-spikes holds the archived plan, research and review folders |
| "`ext-content-script` ... (`doctor` `extension-content-script`)" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1153 — add('extension-content-script', ...) on the isolated world in the tester iframe |
| "`ext-loaded` the extension's service worker target exists" | feature | verified | control.mjs:1166,1168 — extension-loaded reads the service worker url and prints skip without --extension |
| "`LanguageModel.availability()` ... `unavailable` in bundled mode" | status | unverifiable | needs one bundled run in Chrome for Testing; only the attach-mode model check is readable as code (control.mjs doctor language-model) |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "renders `Counter` ... with `CartService` overridden to ['pear', 'plum']" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:61 — setup({ cartItems: ['pear', 'plum'] }) inside the hold test |
| "keeps it mounted, clicks Increment once halfway, and checks that the count rose by one" | feature | verified | counter.spec.ts:62,65,70 — wait holdMs/2, incrementButton.click(), expect `Clicks: ${next}` with next = before+1 |
| "The runner starts its own `ng test` and needs no run from this skill" | feature | verified | spikes/probes/vitest-attach.mjs:99 — spawns node_modules/@angular/cli/bin/ng.js test -c <config> --watch=false --filter 'keeps the counter mounted' |
| "`<app-counter>` does not exist under TestBed; select `[ng-version]`" | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1146 — doctor looks for a [ng-version] host, never app-counter |
| "`ng.ɵgetInjectorProviders` throws on the null injector ..." | status | unverifiable | an Angular run-time behaviour at the end of the resolution path; nothing in this repository asserts it, one probe run in the frame settles it — Settling check: `control.mjs up` — a held run reads the injector providers in the frame. |
| "`Run spikes/probes/vitest-iframe-probe.js` in the frame" | command | verified | spikes/probes/vitest-iframe-probe.js exists beside vitest-lib.mjs, which control.mjs imports (control.mjs:96) |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C=.commandcode/skills/control-ai-browsers/scripts/control.mjs`" | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs exists, and this SKILL.md is byte-identical in both trees (blob 981068c4), matching its byte-copy status |
| "checks/state.mjs ... checks/interop.mjs" | structure | verified | .claude/skills/verify-ai-browsers/checks/ holds state, model-init, extension-panel, signal-provenance, di-doctor, error-explainer, stale-view and interop .mjs, each with a .test.mjs |
| "`edge-phi4mini`" | config | verified | .claude/skills/control-ai-browsers/instances.json — the registry lists chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano |
| "`npx nx run angular-ai-devtools:build-extension`" | command | verified | apps/angular-ai-devtools/project.json — targets are build, build-extension, generate-error-digest, serve, test, serve-static |
| "`check-teardown.mjs {runDir}/steps/teardown-<n>.out`" | command | unverifiable | no check-teardown script in the repository (glob finds none) or in %USERPROFILE%\.commandcode\skills\lars-verify (references plus scripts/verdict.mjs); one lars-verify run settles where it comes from |
| "for lars-verify to turn into a verdict" | integration | verified | %USERPROFILE%\.commandcode\skills\lars-verify\references\contract.md and scripts\verdict.mjs exist |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`extension-enabled` ... `attached` ... `coexist`" | structure | verified | .claude/skills/verify-angular-devtools/checks/ holds extension-enabled.mjs, attached.mjs and coexist.mjs, each with a node:test file |
| "the profiler part (two `ng.ɵsetProfiler` subscribers count while DevTools records ...)" | feature | verified | .claude/skills/verify-angular-devtools/checks/coexist.mjs:3-5 — the header comment states the profiler part, the connected flag and the signal-graph agreement |
| "With `--di-graph` it runs `angular:di_graph` last and records whether the template node is lost, without judging it" | feature | verified | checks/coexist.mjs:66,91-97 — forwards ['coexist', '--di-graph'] and parses the boolean flag only |
| "One harness per checkout: `up` refuses while a state file exists" | feature | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1136 — refuse('state file exists at ...; run "down" first') |
| "The harness is headed; it opens a window on Lars's desktop" | config | verified | .claude/skills/control-angular-devtools/scripts/control.mjs:1192 — launch option headless: false |
| "`D=.claude/skills/control-angular-devtools/scripts/control.mjs`" | structure | verified | that path exists and is byte-identical to the maintained .commandcode copy; the .claude SKILL.md differs from .commandcode/skills/verify-angular-devtools/SKILL.md only in its path prefix — duplicate-tree drift |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup`, `live-reads`, `read-only`" | structure | verified | .claude/skills/verify-pangular-inspector/checks/ holds setup.mjs, live-reads.mjs and read-only.mjs, each with a .test.mjs |
| "`call navigate` without `--confirm` is refused (exit 2 with its `refused: navigate ... --confirm` reason)" | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:373 — refused: <tool> acts on the app; pass --confirm to run it (and start with up --allow-actions) |
| "`control.mjs` refuses before it sends anything, so this half proves the client's refusal" | feature | verified | control.mjs:373,382 — the refusal is returned while building the call, before the JSON-RPC POST helper at :382 runs |
| "artifacts `{up.evidenceDir}/contract-list.png` and `live-reads.json`" | structure | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:11,150 — Writes: contract-list.png, doctor.json, live-reads.json |
| "`tools-list.json` and `navigate-refused.json` for `read-only`" | structure | verified | checks/read-only.mjs:9,54,61 — writes tools-list.json and navigate-refused.json |
| "The setup steps need ports 3000 and 9999 free (both fixed)" | config | verified | .claude/skills/control-angular-dev-app/scripts/control.mjs:69 — PORTAL_API_PORT = 3000; .claude/skills/control-angular-dev-app/scripts/control.mjs:701 — PANGULAR_PORT = 9999 |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each pstack SKILL.md names its defaults in a Models section" | structure | verified | C:/Users/LarsGyrupBrinkNielse/.commandcode/skills/how/SKILL.md:14 - names a role line in pstack-models.md and a default in [Models](#models) |
| "set reasoningEffort in their frontmatter and do not pin a model" | config | verified | C:/Users/LarsGyrupBrinkNielse/.commandcode/agents/effort-high.md:2-5 - reasoningEffort: high with no model key |
| "A model may carry a reasoning effort" | config | verified | C:/Users/LarsGyrupBrinkNielse/.commandcode/agents/effort-high.md:3 - dispatched in place of general-purpose when a pstack role override names @high |
| "means the parent model, so omit model" | feature | verified | C:/Users/LarsGyrupBrinkNielse/.commandcode/skills/arena/SKILL.md:31 - an auto or inherit-parent entry means the parent model, so omit model for it |
| "Command Code has no SessionStart hook; the session hook line here is inert" | status | verified | C:/Users/LarsGyrupBrinkNielse/.commandcode/skills/setup-pstack/SKILL.md:14 - The session hook line is inert on Command Code |
| "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | config | unverifiable | C:/Users/LarsGyrupBrinkNielse/.commandcode/agents/ lists free-laguna-s-2-1.md, free-beam-*.md and free-glyph-cluster-*.md but has free-ling-3-1-flash-* instead of a minimax entry; model availability is not in the repo, settle with a Command Code model listing — Settling check: the Command Code model listing — no command in this checkout reaches model availability, so that listing is the external artifact. |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `up` tries the next slot, `9600 + 10 * slot + index` | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:449 - slotPort() returns `9600 + 10 * slot + index` for a non-zero slot |
| `edge-dev-aion` therefore launches with `--disable-component-update` | config | verified | .commandcode/skills/control-ai-browsers/instances.json - instances.edge-dev-aion.args holds exactly that switch; the four other instances have no `args` |
| page commands fail with `playwright-cli not found on PATH` | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1152 - returns code 127 with the text `playwright-cli not found on PATH` |
| `fingerprint.mjs check` prints `fresh`, `stale`, `unproven` or `external` per feature | command | verified | .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs:14,50 - status union is fresh/stale/unproven/external and the exit codes are 0 for all fresh or external, 1 for one stale or unproven |
| `scripts/proctree.mjs` ... `processTable`, `snapshot`, `merge`, `stop`, `matches`, `describe` | structure | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:12 - imports exactly those six names from ./proctree.mjs |
| `spikes/probes/bench.js:4` hard-codes it | config | verified | spikes/probes/bench.js:4 - the script navigates to http://localhost:4222/ before anything else |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs` | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3024 - that file is the CLI whose usage line lists instances, up, attach, detach, doctor, flags, model, run, panel, down, bench, info |
| The panel is built (`npx nx run angular-ai-devtools:build-extension`) | command | verified | apps/angular-ai-devtools/project.json - a build-extension target exists and writes base extension/panel |
| Its session is `ai-<instance>-<port>` | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:463,471 - sessionOf() returns ai-name-port, on the registry port too |
| Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338 | config | verified | .commandcode/skills/control-ai-browsers/instances.json - the five instances carry ports 9333, 9334, 9335, 9337, 9338 for exactly those models |
| A worktree or a GSD Path sidecar reaches the same running instances on the same ports | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:108 - the primary checkout is found through `git rev-parse --path-format=absolute --git-common-dir`, so every checkout resolves the same profiles and state |
| then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas` | structure | verified | .commandcode/skills/control-ai-browsers/features/*.md - all ten feature files carry exactly those four H2 headings in that order |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the panel sends `angular-ai:di-query` (`componentName`, `elementTag`) | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 - sends { type: angular-ai:di-query, componentName, elementTag } over chrome.runtime |
| receives `angular-ai:di-graph` with a `DiResolutionPath` | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:17 - accepts m.type angular-ai:di-graph with m.resolutionPath; the type is imported from src/main-world/di-path-tracer |
| Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts` | structure | verified | apps/angular-ai-devtools/src/app/ - all three files exist and di-diff-display.ts:34 exports diffDiPaths(pathA, pathB) |
| Open the panel on the instance with `C panel <name> --url=http://localhost:4222/` | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2295 - `panel` refuses without --url and names the counter fixture as the example |
| The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs` | structure | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs - the check exists next to di-doctor.test.mjs in the sibling verify-ai-browsers skill |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| maps each to its owning component through `ng.getOwningComponent` | feature | verified | src/main-world/error-capture.ts:43 - calls ng.getOwningComponent(target) when it is a function and reports no owning component otherwise |
| a digest of the official `angular.dev/errors` documentation bundled at extension build time | config | verified | apps/angular-ai-devtools/project.json - the generate-error-digest target runs `node scripts/generate-error-digest.mjs` |
| message types `angular-ai:error-capture` | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:77 - branches on msg.type angular-ai:error-capture |
| `angular-ai:error-explain` | integration | unverifiable | no occurrence of the string angular-ai:error-explain under apps/angular-ai-devtools/src, src/main-world or extension; finding the panel code that sends it would settle the row — Settling check: `git cat-file -p HEAD:apps/angular-ai-devtools/src/app/extension-message.service.ts` — the message service is where a runtime type would be handled. |
| `--feature=error-explainer` | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17 - the drivePanel feature union names error-explainer among version, stale-view and interop |
| The proof across every pair is `verify-ai-browsers/checks/error-explainer.mjs` | structure | verified | .commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs - the check exists beside error-explainer.test.mjs |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the primary checkout extension/ (registry `extension`) | config | verified | .commandcode/skills/control-ai-browsers/instances.json - all five instances set extension: extension, so `up` loads the repository folder |
| `up` then turns developer mode on (Edge Dev 157 disables unpacked extensions without it) | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1334-1344 - DEVELOPER_MODE sets inDeveloperMode true through chrome.developerPrivate, with that Edge Dev 157 comment |
| calls CDP `Extensions.loadUnpacked`, and holds the pipe until the browser exits | feature | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:3-5,90 - launches with --remote-debugging-pipe, sends Extensions.loadUnpacked, keeps the pipe open until the browser exits |
| It logs `[OK] <name> panel answered in <ms> ms (Angular ~22.1.0, extension <id>): <answer>` | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2302 - the OK line is built as `name panel answered in answerMs ms (Angular ngVersion, extension extensionId): answer` |
| With `--json` the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps` | config | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:160 - the run object declares exactly those fields plus the feature-specific ones |
| `up` refuses while the instance runs with another folder | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:287-291 - an instance already running with another configuration is refused with `run down name first` |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Exit 0 and nineteen check lines (`extension` among them) | status | stale | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2437-2570 - a healthy run adds eighteen checks for an instance without `pin`; model.pin (2506, 2512) runs only when the registry entry has `pin`, which chrome-beta-gemma4 does not, so that instance prints eighteen lines |
| reads `availability()` for LanguageModel (plain and with tool use), Summarizer, Writer, Rewriter, Proofreader, LanguageDetector and Translator en- to-da | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1369-1371 - the availability probe checks Proofreader, LanguageDetector and Translator(en- to-da); the same probe covers LanguageModel, Summarizer, Writer and Rewriter |
| Doctor skips the page canaries when the model is not `available` | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2547-2550 - when LanguageModel is not available the four page canaries are recorded as skipped (pass null) with the reason |
| `Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok` | config | verified | extension/manifest.json:2-4 - name Angular AI DevTools, version 0.3.0; .commandcode/skills/control-ai-browsers/scripts/control.mjs:587 names that same extension id |
| `navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext` | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1372,1439 - the probe reports typeof document.modelContext and typeof navigator.modelContext, and canary.webmcp passes only when typeof document.modelContext is object |
| `model.broker` fails with a `mismatch` field ... and a `fix` naming the pin restore | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2527 - the model.broker detail carries `mismatch` or `in-flight` plus a `fix` from pinHint() |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| its own profile under `.browsers/<name>` | config | verified | .commandcode/skills/control-ai-browsers/instances.json - profilesRoot is .browsers and each instance directory is built from it plus the instance name |
| One line per instance (five) | structure | verified | .commandcode/skills/control-ai-browsers/instances.json - the instances object holds five entries: chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano |
| `C flags edge-dev-aion`. `[OK]` with the nine Aion features | config | verified | .commandcode/skills/control-ai-browsers/instances.json - instances.edge-dev-aion.features lists nine feature names, which is what the flags check compares the version page against |
| `C up edge-dev-aion --backend=cpu` exits 2 before anything starts | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:519-523 - an unknown backend refuses, and an Edge instance refuses --backend=cpu before the launch path runs |
| `--backend=cpu` on Edge is refused: forcing CPU deleted the installed model twice | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:523 - the refusal text is `refuses --backend=cpu: forcing CPU on Edge deletes the installed model (measured twice)` |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node), `interop-limit` (the cannot-name statement), `interop-inferred` (the attribution wording) | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19-25 - the template carries data-testid interop-slice, interop-limit, interop-node and interop-inferred |
| the `spikes/ng222-app` fixture at `/stale-view`, or the deferred `/stale-view-deferred` route | structure | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 - the router declares path stale-view with StaleViewFixture and path stale-view-deferred with StaleViewDeferredFixture |
| pass `--extension <absolute path of the checkout the instance runs>` | command | verified | .commandcode/skills/verify-ai-browsers/checks/interop.mjs:58,73-75 - check() takes an `extension` option defaulting to this checkout and reports couldNotRun when the instance serves a different path |
| Implementation: `apps/angular-ai-devtools/src/app/interop.component.ts` | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts - the component file exists and holds the interop template and its test ids |
| message types `angular-ai:interop` | integration | unverifiable | no occurrence of the string angular-ai:interop under apps/angular-ai-devtools/src, src/main-world or extension; the panel code that posts it would settle the row — Settling check: `git cat-file -p HEAD:apps/angular-ai-devtools/src/app/extension-message.service.ts` — the message service is where a runtime type would be handled. |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB) | config | verified | .commandcode/skills/control-ai-browsers/instances.json - browsers.chrome-beta.minFreeMib and chrome-stable are 22528, edge-dev and edge-stable are 20480, and each model carries a downloadMib |
| `model clear` refuses a running instance | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2846-2847 - refuses when instanceProcesses is non-empty: run `down` first, files are never deleted under a running browser |
| copies a healthy instance model components (registry `pin` roots) | config | verified | .commandcode/skills/control-ai-browsers/instances.json - instances.edge-dev-aion.pin lists EdgeLLMOnDeviceModel, EdgeLLMRuntime and EdgeOptimizationGuideModelsManifest |
| `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion` | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:901,905 - pinDir() is tmp/control-ai-browsers/pins/<name> under the primary checkout worktrees root |
| `OptGuideOnDeviceModel/<version>` (Nano), `OptGuideManifestModel/<hash>/<version>` (Gemma 4), `EdgeLLMOnDeviceModel/<version>` (Aion, Phi-4-mini) | config | verified | .commandcode/skills/control-ai-browsers/instances.json - model.folders gives exactly those three shapes, per instance |
| First and second create, `contextWindow` 9,216 | config | verified | .commandcode/skills/control-ai-browsers/instances.json - chrome-beta-nano model.contextWindow is 9216, the value doctor compares in control.mjs:2560 |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the ng222-app counter fixture serves `http://localhost:4222` (`bench.js` hard-codes it) | config | verified | spikes/probes/bench.js:4 - the probe navigates to http://localhost:4222/ and then waits for the app-counter element |
| `result.log` lists `get_component_count` and `get_component_inputs` | structure | verified | spikes/probes/probe10.js:7-8,15-16 - those are the two tool names, get_component_count returns count 42 and get_component_inputs returns selector plus inputs |
| `bench.js` has a 120 s per-prompt timeout and returns tool exceptions as tool errors | config | verified | spikes/probes/bench.js:11-12 - PROMPT_TIMEOUT_MS is 120000 and each prompt races that timer |
| Summarise with `node spikes/probes/bench-summary.mjs` | command | verified | spikes/probes/bench-summary.mjs - the summariser script exists beside bench.js in the probes folder |
| `results[i]` holds the serving model, `backend`, `performanceClass`, `cpuBefore` and `cpuAfter` | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2939,2949-2950 - each bench record carries model, backend, requestedBackend, performanceClass, cpuBefore and later cpuAfter |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`) | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:65 - branches on msg.type angular-ai:record and msg.cycle; extension/agent-main.js and src/main-world/provenance-tracer.ts both exist |
| the fact list is the `angular-ai:record` message handled by `ExtensionMessageService` | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:30,65-66 - class ExtensionMessageService routes angular-ai:record to causeService.recordCycle |
| The DevTools panel Signal Provenance tab | structure | verified | apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts - the component exists next to signal-provenance.service.ts and the anti-pattern detector |
| The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs` | structure | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs - the check exists beside signal-provenance.test.mjs |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The panel sends the hedged wording `the template may show a stale value` | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 - the hedged span carries that exact text on data-testid hedged |
| With zero findings the panel renders an explicit empty state (`no stale-view findings`) | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:17 - the empty-state element renders exactly `no stale-view findings` on data-testid empty-state |
| `--feature=stale-view` | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17 - stale-view is one of the drivePanel features (version, error-explainer, stale-view, interop) |
| Implementation: `apps/angular-ai-devtools/src/app/stale-view.component.ts` | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts - the component exists and imports StaleViewScanService and StaleViewService (lines 2-3) |
| message types `angular-ai:stale-view` | integration | unverifiable | no occurrence of the string angular-ai:stale-view under apps/angular-ai-devtools/src, src/main-world or extension; the panel service that posts it would settle the row — Settling check: `git cat-file -p HEAD:apps/angular-ai-devtools/src/app/extension-message.service.ts` — the message service is where a runtime type would be handled. |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "keeps it at 3000 because the portal checkout hardcodes http://localhost:3000/api/ at libs/shared/utils/src/lib/injection-tokens.ts:5" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 (const PORTAL_API_PORT = 3000) plus the portal checkout libs/shared/utils/src/lib/injection-tokens.ts:5 (factory returns http://localhost:3000/api/) |
| "counter app, derived, default 4222" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:82 - slot 0 uses 4222, other slots 4300 + slot |
| "SSR app, derived, default 4223" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:90 - slot 0 uses 4223, other slots 4400 + slot |
| "portal app, derived, default 4200" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:100 - slot 0 uses 4200, other slots 4500 + slot |
| "portal pangular, external, 9999" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:701 - PANGULAR_PORT = 9999 |
| "scripts/fingerprint.mjs (a byte copy of lars-create-verification, never edit it here)" | structure | unverifiable | .commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs exists, but no lars-create-verification skill exists under .commandcode/skills/ (listing has 18 dirs, none named so), so the copy cannot be compared |
| "The four portal features are recorded as external" | status | verified | .commandcode/skills/control-angular-dev-app/features/.proven.json - portal-claims, portal-complaints-customers, portal-contracts and portal-navigation each carry an external string naming the ng-journal checkout |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter: Fresh page state: count 3, double 6, cart 1 item" | status | verified | spikes/ng222-app/src/app/counter.ts - count = signal(3), double = computed(count * 2), CartService.items = signal([apple]) so length 1 |
| "Each feature file has an H1, one paragraph of user-visible behaviour, then four H2s in order: Sub-features, How to get to it (user POV), Driving it with control-angular-dev-app, Gotchas" | structure | verified | features/counter.md headings are exactly those four H2s in that order (counter.md is not the audited file) |
| "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json decides whether a sidebar entry and its route exist" | config | verified | portal checkout apps/insurance-portal/src/assets/feature-flags.manifest.json holds 12 boolean ids (claim-list, claim-create, contract-edit, customer-list, ...), all true |
| "Features: Counter, SSR and hydration, Portal navigation, Portal contracts, Portal claims, Portal complaints and customers" | structure | verified | features/ directory holds exactly those six feature files plus README.md and .proven.json |
| "Portal: API on 3000, app on the derived port, 4507 for the default portal folder" | config | unverifiable | 3000 is control.mjs:69; 4507 is a measured slot from a hash of the portal folder, so only a live run of up --target portal would settle it |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The ng222-app page shows one line, Clicks: 3 (double 6, cart 1)" | status | verified | spikes/ng222-app/src/app/counter.ts - count = signal(3), double = computed(() => this.count() * 2), cart.items = signal([apple]) and the paragraph template renders title: count (double double, cart length) |
| "counter-increment raises count by one per click; double follows" | feature | verified | spikes/ng222-app/src/app/counter.ts - button (click)=count.set(count()+1); double is a computed over count |
| "an injected CartService.items signal" | integration | verified | spikes/ng222-app/src/app/counter.ts - CartService (providedIn root) exposes items = signal<string[]>([apple]); Counter injects it as cart |
| "counter-effect the effect writes lastLogged on every change" | feature | verified | spikes/ng222-app/src/app/counter.ts - constructor runs effect(() => this.lastLogged.set(this.count())) |
| "counter-cd the component is OnPush by default (no changeDetection declared)" | config | verified | spikes/ng222-app/src/app/counter.ts - @Component metadata has only selector and template; @angular/core resolves to 22.2.2 (spikes/ng222-app/package-lock.json), where the default is OnPush |
| "the fixtures two other routes, /stale-view and /stale-view-deferred, belong to the stale-view fixtures (src/app/app.routes.ts:5-8)" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 - the routes array holds only stale-view to StaleViewFixture and stale-view-deferred to StaleViewDeferredFixture |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/claims" | integration | verified | claim checkout libs/claim/data-access/src/lib/data-services/claim-data.service.ts:9 (url = BaseUrl + claims) with libs/shared/utils/src/lib/injection-tokens.ts:5 (BaseUrl = http://localhost:3000/api/) |
| "claim-list table with columns Claim number, Damage Type, Date, Policynumber, Customer" | structure | verified | libs/claim/feature-list/src/lib/list.component.ts:23-26 - th Claim number, Damage Type, Policynumber (and the Date, Customer headers around them) |
| "claim-details ... heading Claim Details: Claim Number, Date, Damage Type, Policynumber" | structure | verified | libs/claim/feature-details/src/lib/details.component.ts:29 - header title Complaint Details is not used; :32 Claim Number:, :40 Damage Type:, :47 Policynumber: labels |
| "/claim/create shows the heading Complaint Create: an app bug, measured; report it, do not patch it" | status | verified | portal checkout libs/claim/feature-create/src/lib/create.component.ts:39 - ng-journal-header title is Complaint Create in the claim create component |
| "Select damage type and Select contract (under the label Policynumber) dropdowns" | feature | verified | libs/claim/ui/src/lib/claim-form.component.ts:59 - placeholder Select damage type; :67 label Policynumber over a contract dropdown; :31 Claim Number label |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "complaint-list columns Type, Customer, Date, Description" | structure | verified | portal checkout libs/complaint/feature-list/src/lib/list.component.ts:23-26 - the four th headers in that order |
| "complaint-create /complaint/create, heading Complaint Create" | structure | verified | libs/complaint/feature-create/src/lib/create.component.ts:43 - the header component title is Complaint Create |
| "Select type (CustomerService, Sales, Payments)" | feature | verified | libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:2-4 - enum ComplaintTypeDto holds exactly CustomerService, Sales, Payments |
| "complaint-details row click opens /complaint/id/details, heading Complaint Details, with the customer as a link" | structure | verified | libs/complaint/feature-details/src/lib/details.component.ts:29 - header title Complaint Details |
| "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" | structure | verified | libs/customer/feature-list/src/lib/list.component.ts:23-30 - the eight th headers in that order; the 30-row count is a runtime seed value, not in source |
| "customer-details /customer/id/details, heading Customer Details (name, email, phone, Address block)" | structure | verified | libs/customer/feature-details/src/lib/details.component.ts:18 header title Customer Details, :40 subtitle Address |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email" | structure | verified | portal checkout libs/contract/feature-list/src/lib/list.component.ts:34-39 - the six th headers in that order |
| "contract-details clicking a row opens /contract/id/details with heading Contract Details and an Edit button" | structure | verified | libs/contract/feature-details/src/lib/details.component.ts:41 and :47 - header title Contract Details |
| "contract-edit Edit opens /contract/id/edit, heading Contract Edit" | structure | verified | libs/contract/feature-edit/src/lib/edit.component.ts:51 - header title Contract Edit |
| "contract-create /contract/create: Status chip Pending" | feature | verified | libs/contract/feature-create/src/lib/create.component.ts:46 header Contract Create and :112 status ContractStatusDto.Pending; libs/contract/ui/src/lib/contract-form.component.ts:45 label Pending |
| "Data comes from the API at http://localhost:3000/api/contracts" | integration | verified | libs/contract/data-access/src/lib/data-services/contract-data.service.ts:9 (url = BaseUrl + contracts) with libs/shared/utils/src/lib/injection-tokens.ts:5 |
| "20 rows after a fresh API start" | status | unverifiable | the row count comes from the portal API faker seed at runtime; only a live contract/list read would settle it — Settling check: `control.mjs up --target portal` — the row count comes from a driven portal API. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home, which shows four tiles linking to the domain lists" | structure | verified | portal checkout apps/insurance-portal/src/app/app.routes.ts:7 redirectTo home; app/home.component.ts:15-49 |
| "each home tile is a link to /domain/list" | structure | verified | apps/insurance-portal/src/app/home.component.ts:16,26,37,49 - anchors with routerLink /contract/list, /claim/list, /complaint/list, /customer/list |
| "any unknown path renders Page Not Found" | feature | verified | apps/insurance-portal/src/page-not-found.component.ts:7 - template h1 is Page Not Found |
| "Only the sidebar group headings render upper-case (CONTRACT, through the capitalize pipe)" | config | verified | apps/insurance-portal/src/app/sidebar.component.ts:2,38 - CapitalizePipe applied to config.domain, the entries render from other fields |
| "The header link goes to https://www.ng-journal.com" | feature | verified | apps/insurance-portal/src/app/app.component.ts:20 - href is https://www.ng-journal.com |
| "Domain routes load lazily, guarded by feature flags" | structure | verified | apps/insurance-portal/src/app/app.routes.ts:25 - lazy dynamic import of @ng-journal/complaint/routes; home.component.ts:15,25,35,48 wrap tiles in FeatureFlagDirective |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "six named checks: server-html-ngh, server-html-transfer-state, dev-build-after-hydration, hydration-counters, no-mismatch-on-default-route, expected-mismatch-detected" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:75-80 - exactly those six check ids as the condition lines |
| "?transfer=0 (HTTP transfer cache off for the request)" | config | verified | spikes/ng222-ssr/src/app/data-list.ts:22 - httpResource with transferCache: this.transfer() !== 0 string |
| "a @defer (hydrate on interaction) block holding a Deferred click button" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15 - @defer (hydrate on interaction); deferred.ts:5 renders the Deferred click button |
| "/ is ssr, /prerender is ssg, /client is the bare shell" | structure | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:5-7 - RenderMode.Server on empty path, Prerender on prerender, Client on client |
| "Run the spike probes spikes/probes/ssr-event-replay.js and spikes/probes/ssr-render-modes.js" | command | verified | spikes/probes/ directory holds ssr-event-replay.js and ssr-render-modes.js (next to ssr-defer.js, ssr-hydration.js, ssr-transfer.js) |
| "ngDevMode.hydratedComponents 4, hydratedNodes 40" | status | unverifiable | ssr-check.js:78 only asserts hydratedComponents above 0 and componentsSkippedHydration 0; the exact 4 and 40 come from a live dev-mode page and need a recorded ssr-check.json |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89 - const EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh |
| "session ngdt, CDP port 9420" | config | verified | control.mjs:311 - SESSION is ngdt when the flow id is main; control.mjs:273 - MAIN_CDP_PORT = 9420 |
| "CDP port 9420 + slot (9421-9499, slot 1-79 from a hash of the worktree path)" | config | verified | control.mjs:274 - slot 0 is the main checkout at 9420, a worktree flow id hashes to 9421-9499 |
| "opens the Chrome Web Store page https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh in that browsers profile" | command | verified | control.mjs:91 - STORE_URL built from EXT_ID; control.mjs:1019 logs opening STORE_URL in the chosen browser |
| "polls the profile every 2 s until the extension appears (default 180 s)" | config | verified | control.mjs:1024 - setInterval with 2000 ms and Number(opts.timeout ?? 180) * 1000 |
| "Angular version shown: the ng-version attribute of the first [ng-version] element. Measured: 22.2.2" | status | verified | spikes/ng222-app/package-lock.json - node_modules/@angular/core resolves to 22.2.2, the fixture this is measured on |
| "graph nodes are ng-signal-graph-pane .node-cont.kind-kind with the label and value as text" | feature | verified | control.mjs:830 - the panel read queries ng-signal-graph-pane .node-cont and derives kind from the kind- class |
| "scripts/fingerprint.mjs (a byte copy of lars-create-verification, never edit it here)" | structure | unverifiable | .commandcode/skills/control-angular-devtools/scripts/fingerprint.mjs is present, but no lars-create-verification skill exists under .commandcode/skills/ (18 folders, none named so), so the claimed byte copy cannot be compared |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at spikes/ng222-app (Angular 22.2.2)" | status | verified | spikes/ng222-app/package-lock.json - node_modules/@angular/core resolves to 22.2.2 |
| "One file per feature: H1, one paragraph of user-visible behaviour, then Sub-features, How to get to it (user POV), Driving it with control-angular-devtools, Gotchas" | structure | verified | features/attach.md has exactly those four H2s in that order (attach.md is not the audited file) |
| "Panel: control.mjs panel ... and coexist (raw CDP into chrome-extension://id/index.html)" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:830 - the signal-graph read evaluates against the panel page DOM (ng-signal-graph-pane .node-cont) |
| "[install.md, attach.md, signal-graph.md, profiler.md]" | structure | verified | .commandcode/skills/control-angular-devtools/features/ holds those four feature files, each read in this audit, plus README.md |
| "The panel in branded browsers (press F12, pick the Angular tab) is manual only" | feature | unverifiable | the scripted panel path in control.mjs:830 targets the harness panel target; a branded F12 session is browser UI and no script in the repository reaches it |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | feature | verified | control.mjs:891 - the attach init script defines that property as an accessor recording flagSetAt; :905 reads flag === true |
| "attach reloads the page to catch messages from the start" | feature | verified | control.mjs:899 - page.reload() after the probe is installed, :900 then waits for the backendReady topic |
| "Angular version from [ng-version]" | feature | verified | control.mjs:911 - ngVersion read via document.querySelector([ng-version]).getAttribute(ng-version) |
| "attach exits 1 because it requires isDebugMode" | status | verified | control.mjs:1349 - the pass condition ANDs r.flag, d.isAngular, d.isDebugMode, backendInstalled and backendReady, so a production build fails it |
| "Detection result: isAngular, isDebugMode (development build), isIvy, isSupportedAngularVersion (major 12+ or 0)" | feature | unverifiable | the topics come from the extension bundle (shell-browser/src/app/...), absent from this repository (Test-Path shell-browser is False); control.mjs:68 only typedefs isAngular and isDebugMode |
| "backendInstalled true; backendReady at ~950 ms; Angular 22.2.2" | status | unverifiable | a measured timing; control.mjs:900 waits up to 20 s for backendReady rather than asserting 950 ms, so only an attach run on the fixture would settle it |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | control.mjs:89 - const EXT_ID; control.mjs:1036 reads the installed copy under Extensions/EXT_ID |
| "Store page: https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh" | command | verified | control.mjs:91 - STORE_URL = https://chromewebstore.google.com/detail/ + EXT_ID, opened at :1019 |
| "opens the store page, polls for the click every 2 s (default 180 s)" | config | verified | control.mjs:1024 - setInterval(..., 2000) bounded by Number(opts.timeout ?? 180) * 1000 |
| "the profiles Extensions/id/version_0 folder" | structure | verified | control.mjs:1036 - srcRoot = join(userData, opts.profile ?? Default, Extensions, EXT_ID); the version folder is read from the <version>_0 name |
| "--profile P picks the profile read and also passes --profile-directory=P to the window it opens" | feature | verified | control.mjs:980 - spawn(browser exe, [--profile-directory=P, url]); :1036 reads the same profile |
| "node $S install, node $S status --browser=chrome-beta, node $S uninstall" | command | verified | control.mjs:1601 - COMMANDS maps install, uninstall, status, up, doctor, attach, panel, coexist, info and down |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through ng.setProfiler, which keeps a list of subscribers in Angular 22" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:144 - function setProfiler(profiler); :12535 registers the devToolsProfiler and keeps its remove function |
| "remove your own with the function setProfiler(cb) returns" | feature | verified | _debug_node-chunk.mjs:12535 - const removeProfiler = setProfiler(devToolsProfiler); _debug_node-chunk.mjs:12563 exports only the function as setProfiler |
| "DevTools subscriber cannot be listed from the page (the list is module-private)" | feature | verified | _debug_node-chunk.mjs:12563-12564 - only setProfiler and getSignalGraph are exported on the ng object, no subscriber accessor |
| "node $S coexist" | command | verified | control.mjs:1601 - COMMANDS maps coexist to cmdCoexist; control.mjs:1598 documents the usage line |
| "coexist adds two setProfiler subscribers, clicks the app, removes one with its returned function" | feature | verified | control.mjs:1463 - two setProfiler calls stored as __ngdtRemoveA and __ngdtRemoveB; :1465 removes A and reads the counts |
| "own subscribers bothOn a 16 b 16; afterRemoveA a 16 b 32; DevTools recorded 2 change detection cycles" | status | unverifiable | a measured run result; nothing in the repository records those counters, so only a live coexist run would settle it — Settling check: `control.mjs coexist` — the counters come from a live coexist run. |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Agreement with ng.getSignalGraph(ng.getInjector(host)), which the panes backend calls" | feature | verified | node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12326 - function getSignalGraph(injector), :12564 exported as getSignalGraph, :12329 requires a NodeInjector or R3Injector |
| "Expected on the fixture before: template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect" | status | verified | spikes/ng222-app/src/app/counter.ts - title input, count signal, double computed, injected CartService.items signal and one effect: the six nodes the pane shows |
| "node $S panel signal-graph --component=app-counter" | command | verified | control.mjs:18 - the Opts typedef declares component; control.mjs:1601 maps panel to cmdPanel; :830 is the panel signal-graph read |
| "node $S coexist --di-graph" | command | verified | control.mjs:111 - BOOL_FLAGS includes di-graph; control.mjs:1598 usage line reads coexist [--component app-counter] [--click ...] [--di-graph] |
| ".node-cont.kind-* are DevTools 1.22.0 class names; re-read them from the live panel after an update" | config | unverifiable | the class names come from the extension bundle (shell-browser is absent, Test-Path False); control.mjs:830 just reads whatever kind- classes the panel renders |
| "Other kinds the counter lacks: linked-signal, child-signal-prop, resource, unknown" | feature | unverifiable | the kind vocabulary is defined in the DevTools panel bundle, which is not in this repository; only a live panel read on an app with those nodes would settle it — Settling check: `control.mjs panel` — the kind vocabulary renders only in a live panel. |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The app folder defaults to the Insurance Portal worktree" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:75 - PORTAL_DEFAULT_DIR is D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools |
| "The state file is per port (`tmp/control-pangular-inspector/state/pangular-<port>.json`)" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:71,1009 - STATE_DIR is tmp/control-pangular-inspector/state and statePath returns pangular-<port>.json |
| "none of the eight action tools" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 - ACTION_TOOLS holds highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api |
| "a POST without `Origin` gets 403" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1344 - mcp-origin-guard passes only when the POST answers httpStatus 403 |
| "The MCP client is plain JSON-RPC over `node:http`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:6 - import http from node:http; :1074 sets mcpUrl to http://localhost:<port>/__mcp |
| "With `--read-only`, 0.0.7 lists 46 tools" | status | unverifiable | needs a live read-only devtools server; `node $S tools` against one would settle the count, no file in this checkout records it — Settling check: `control.mjs tools` — tools lists the server's tool names. |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-pangular-inspector/scripts/control.mjs`" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1574 - that path exists and its usage line names the commands the recipes call |
| "`D` is `.commandcode/skills/control-angular-dev-app/scripts/control.mjs`" | structure | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs exists and SKILL.md Launch starts the portal app through it |
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - the state holds session pangular-<port> and evidenceDir |
| "Action tools (`navigate`, `fill-form`, `form-action`, `highlight`, ...) need `up --allow-actions` and `call ... --confirm`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:373 refuses an action tool without --confirm; :1061 passes --read-only unless allow-actions |
| "then four H2s in this order" | structure | verified | .commandcode/skills/control-pangular-inspector/features/setup.md - H1, Sub-features, How to get to it (user POV), Driving it with control-pangular-inspector (Preconditions first), Gotchas, in that order |
| "the overlay reports about 250 ms after change detection" | status | unverifiable | a live-run timing; no file in this checkout records it, only a driven overlay on the portal would settle it — Settling check: `control.mjs up --target portal` — the overlay timing needs a driven portal page. |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - mcpUrl is http://localhost:<port>/__mcp for the standalone port |
| "node $S components --depth 3 --out list-components.json" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1450,1462 - components reads the depth flag and forwards it; :1221 refuses an --out outside the evidence dir |
| "`window.__pangularPageId`" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1417 - the overlay-page-id check reads window.__pangularPageId from the page |
| "the component outline (`components`; `list-components` on versions after 0.0.7)" | status | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1472 - components falls back to componentOutline of the component-tree resource |
| "Instance ids (`cgg06-4`) change with every page load" | status | unverifiable | needs two live page loads of the portal; no file in this checkout records instance id churn — Settling check: `control.mjs call` — two `call list-pages` reads show the instance id churn. |
| "`inspect-providers` lookup path, by selector or by `token`" | integration | unverifiable | the tool arguments belong to the external @pangular-inspector/devtools package, which this checkout does not pin, so no local line names them — Settling check: `control.mjs call` — `call inspect-providers` with a token settles the argument form. |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Explain: `node $S call explain-navigation --args" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1574 - call takes --args <json> and --out <file> |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | config | unverifiable | the default lives in the external @pangular-inspector/devtools tool schema; a live call with no limit would settle it, no local file records it — Settling check: `control.mjs call` — one `call explain-navigation` with no limit prints the default. |
| "`list-routes` (12 routes, measured) and `node $S call lint-routes`" | status | unverifiable | measured against the portal app, which lives outside this checkout; a live call would settle the count and the info finding — Settling check: `control.mjs call` — `call list-routes` against the portal prints the route count. |
| "`nav.route`: `inspect-route`, the current URL, document title and active route tree" | integration | unverifiable | tool names and fields come from the external devtools package; nothing in this checkout enumerates them — Settling check: `control.mjs call` — `call inspect-route` prints the nav.route fields. |
| "`started by` appears only when the click came less than 2 s before the navigation" | status | unverifiable | a threshold in the external overlay code; a driven navigation would settle it, no local file records it — Settling check: `control.mjs call` — a driven click then `call inspect-route` shows the started-by window. |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:595 - proxy-target passes only when /__pangular maps to http://localhost:<port> |
| "`playwright-cli -s=pangular-9999 goto http://localhost:4507/__pangular/`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - the recorded session is pangular-<port>, so pangular-9999 on the default port |
| "the doctor has answered the one-time-code prompt in this session" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1378 - the auth-code check answers the overlay prompt with the newest code from the server log |
| "Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP" | status | unverifiable | the panel markup ships in the external devtools package; a rendered dashboard would settle the tab list — Settling check: `control.mjs up` — one driven dashboard load renders the tab list. |
| "A code expires after 5 minutes" | status | unverifiable | an overlay constant in the external package; the server log and a second load would settle it, no local file records it — Settling check: `control.mjs call` — the code's expiry is read from pangular.log after a call. |
| "The dashboard source counts are 0 in this Nx workspace" | status | unverifiable | it describes the portal app, which lives outside this checkout; its panel would settle it — Settling check: `control.mjs components` — components prints the source counts the dashboard shows. |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:73 - PINNED is 0.0.7; :590 fails a declaration that is not exactly that |
| "`setup.check`: six read-only facts, one line each" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:590-595 - check adds declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target, six in all |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:402 - findApp takes the first project.json whose serve executor is @angular/build:dev-server |
| "`changed` lists `package.json`, `package-lock.json`" | status | unverifiable | the remaining paths are files of the portal checkout outside this repository; a run of node $S install --json would settle the list — Settling check: `control.mjs install` — install --json prints the changed file list. |
| "the lockfile with insertions only (457 lines measured)" | status | unverifiable | a measurement of the portal checkout from an earlier run; no lockfile in this repository holds it — Settling check: `control.mjs install` — install --json prints the lockfile insertion count. |
| "`remove` refuses when files it does not manage are changed" | feature | unverifiable | the refusal path needs a dirty app checkout outside this repository; a run of node $S remove --json there would settle it — Settling check: `control.mjs remove` — remove on a dirty checkout prints the refusal. |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scan <tool>`, which starts that server, calls one tool and stops it" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1493 - spawns bin.mjs mcp --root <root> --read-only on stdio and calls the one tool |
| "`npx pangular mcp --root <dir>` in an MCP client config (stdio)" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1493 - the script runs the same package bin with mcp --root and keeps the stdio pipes |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1540 - save is called with evidenceDir path.join(SCRATCH, scan), and SCRATCH is tmp/control-pangular-inspector (:70) |
| "`get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`" | status | unverifiable | the stdio tool list comes from the external devtools package; node $S scan nope against an install prints it, no local file lists it — Settling check: `control.mjs scan` — scan starts the stdio server and prints its tool list. |
| "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`" | structure | unverifiable | the walking code lives in the external package; a scan of the portal at its root and at apps/insurance-portal would settle it — Settling check: `control.mjs scan` — a scan at the portal root shows which sourceRoots it reads. |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest `51400 + slot`, bundled CDP `9500 + slot`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:113,116 - vitest is 51400 + slot (51315 at slot 0) and bundled CDP is 9500 + slot (9350 at slot 0) |
| "the per-model instance (default `chrome-beta-gemma4`)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:101 - DEFAULT_INSTANCE is chrome-beta-gemma4 |
| "The playwright-cli session is `control-vitest-<flowId>-<Vitest port>`" | integration | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:899 - session is built as control-vitest-<flowId>-<vitestPort> |
| "`--timeout <s>` (default 180)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:174 - the timeout flag falls back to 180 and is multiplied by 1000 |
| "`--bundled` runs `-c extension` (`vitest-extension.config.mts`) instead" | config | verified | spikes/ng222-app/angular.json - the extension configuration sets runnerConfig to vitest-extension.config.mts |
| "Chrome 137+ branded builds ignore `--load-extension`" | status | unverifiable | a browser behaviour recorded in research 11 and 17; no file in this checkout tests it — Settling check: `control.mjs doctor` — doctor reports the loaded-extension state per instance. |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)`" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:34 - the overridden CartService test asserts that exact text; :61 sets the same override in the hold test |
| "`node $S up --extension s1-vitest --hold 90000`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:927,1271 - --extension s1-vitest writes the S1 variant and up accepts --hold |
| "or from a `RERUN` after a touch" | status | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:509 - the ready regex accepts DEV, RUN or RERUN |
| "Attach the session: `playwright-cli attach --cdp=<cdpUrl> --session=<session>`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:899 - the state carries cdpUrl http://127.0.0.1:<cdp> and the session name |
| "The Vitest UI (`ui: false` in both runner configs)" | config | verified | spikes/ng222-app/vitest-attach.config.mts and spikes/ng222-app/vitest-extension.config.mts - both set browser.ui: false |
| "[Counter tests](./counter-tests.md)" | structure | verified | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md, held-counter.md and extension-in-tester.md all exist beside this index |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Tests 2 passed \| 2 skipped (4) without flags" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:20,30 - two plain it blocks always run; :39,56 are it.runIf gates, so 4 tests with 2 skipped |
| "an Increment click moves Clicks: 3 (double 6, cart 1) to Clicks: 4 (double 8, cart 1)" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23,27 - those two exact expectations in the Increment test |
| "with `VITE_COUNTER_TIMING_DEMO=1` one test fails" | config | verified | spikes/ng222-app/src/app/counter.spec.ts:37-39 - it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO equal 1) with the comment that it fails on purpose |
| "`node $S down`, then `node $S up --timing-demo`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1271 - up accepts --timing-demo and down is a documented command |
| "`npm test` in `spikes/ng222-app` runs the default `headless` configuration once" | command | verified | spikes/ng222-app/package.json - test is ng test; spikes/ng222-app/angular.json sets defaultConfiguration headless (ChromiumHeadless) with no watch |
| "A held run summary appears only after the hold ends" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:62-71 - the test waits holdMs/2, clicks, asserts, then waits holdMs/2 more before it can resolve |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --extension s1-vitest --hold 90000`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:927 - --extension s1-vitest writes the S1 Vitest variant into the evidence dir extension/ folder |
| "`spikes/s1-extension` was retired in M009" | status | verified | spikes/s1-extension does not exist, while .project/archive/001-run-unrun-spikes does, so the archived notes are where the doc says |
| "keyed `content_isolated\|frame\|/`, `content_main\|frame\|/`" | status | unverifiable | the storage keys are written by the extension at run time; a driven extension run with chrome.storage.local read would settle them — Settling check: `control.mjs doctor` — doctor reads the injected content-script state on a driven run. |
| "`node spikes/probes/vitest-attach.mjs --route attach --cdp-port <port> --label <label>`" | structure | verified | spikes/probes/vitest-attach.mjs and its shared spikes/probes/vitest-lib.mjs both exist, and research/raw exists for its output |
| "In attach mode `down` uninstalls the extension" | feature | unverifiable | needs a live attach run with a loaded extension; the notes it quotes come from a run, not from a file in this checkout — Settling check: `control.mjs down` — an attach-mode down followed by doctor shows the uninstall. |
| "`LanguageModel.availability()` is `available` in the tester iframe" | status | unverifiable | a browser model state; research/17-vitest-browser-runtime.md records it but only a live instance settles it — Settling check: `control.mjs doctor` — doctor reads LanguageModel.availability in the tester iframe. |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--hold <ms>`, the hold test renders `Counter` in the tester iframe with `CartService` overridden" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:56-61 - the test runs only when VITE_COUNTER_HOLD_MS is above 0 and sets cartItems pear, plum |
| "It keeps it mounted, clicks Increment once halfway, and checks that the count rose by one" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:62-70 - waits holdMs/2, reads the count, clicks once and expects count + 1 |
| "the page shows Clicks: 3 (double 6, cart 2) and an Increment button" | status | verified | spikes/ng222-app/src/app/counter.spec.ts:34,61 - the overridden cart renders cart 2 from a count of 3, and the spec clicks incrementButton |
| "`spikes/probes/vitest-iframe-probe.js`" | structure | verified | spikes/probes/vitest-iframe-probe.js exists beside spikes/probes/vitest-attach.mjs |
| "every `ng.*` read works on the host `<div id=rootN ng-version=22.2.2>`" | status | unverifiable | the host markup comes from TestBed at run time; only a driven hold run reports the div id and version — Settling check: `control.mjs up` — a held run prints the TestBed host div id and version. |
| "`ng.getInjectorProviders` throws on the null injector at the end of the resolution path" | status | unverifiable | a behaviour of the Angular global inside the tester iframe; no file in this checkout asserts it — Settling check: `control.mjs up` — the injector throw surfaces only in a held frame. |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Root `package.json` should have `private: true` to prevent accidental publish" | config | verified | package.json:3 - the root manifest sets private true |
| "`package-lock.json`" | config | verified | package-lock.json is the only lockfile at the repository root (Get-ChildItem finds no pnpm-lock.yaml, yarn.lock or bun.lock), so the npm branch is the one that applies here |
| "npm install @org/ui --workspace @org/app" | command | unverifiable | the root package.json declares no workspaces field and no npm run was made; a workspace install would settle the syntax |
| "Symlinks appear in `<consumer>/node_modules/@org/<package>`" | structure | unverifiable | no linked workspace packages exist in this checkout, so no such symlink can be inspected — Settling check: `git cat-file -p HEAD:package.json` — no workspaces field, so no linked symlink exists. |
| "pnpm: no hoisting (strict isolation, prevents phantom deps)" | status | unverifiable | a claim about pnpm behaviour; this repository has no pnpm-lock.yaml, so nothing here exercises it — Settling check: `git cat-file -p HEAD:package.json` — the manifest records npm, not pnpm. |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "note: this repository `nx.json` contains neither" | config | verified | nx.json - the file holds analytics, targetDefaults, plugins and generators only, with no nxCloudId and no nxCloudAccessToken |
| "`--max-cycles`" | config | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:123 - --max-cycles defaults to 10 when the flag is absent |
| "`ci-poll-decide.mjs` (deterministic script)" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs exists and prints one JSON line (action, code, message, noProgressCount, envRerunCount) |
| "circuit breaker (5 polls)" | status | stale | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208 - the breaker fires at noProgressCount above or equal 13, and :323 words it as 13 consecutive polls |
| "Run `ci-state-update.mjs gate` before local fix attempts" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:10,38-40 - the gate subcommand takes --gate-type local-fix |
| "`--timeout`" | config | unverifiable | the 120 minute default belongs to the orchestrator prompt; ci-poll-decide.mjs:48 falls back to 0 minutes when --timeout is not passed, so no local file fixes 120 |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `ci-state-update.mjs gate --gate-type local-fix`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:38-40 - the gate subcommand branches on gateType local-fix |
| "Run `ci-state-update.mjs gate --gate-type env-rerun`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:57-58 - the gate subcommand branches on gateType env-rerun and the env-rerun-count flag |
| "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | command | unverifiable | nx-cloud is not installed in this checkout and no file here mentions APPLIED_LOCALLY or shortLink, so the state name cannot be checked locally — Settling check: `git cat-file -p HEAD:package.json` — no nx-cloud dependency, so the state name is prose only. |
| "`git commit --allow-empty -m` with ci: rerun after rejecting throttled fixes" | command | unverifiable | the message exists only in this skill prose; no script under monitor-ci/scripts emits it — Settling check: `git cat-file -p HEAD:.commandcode/skills/monitor-ci/references/fix-flows.md` — the message exists only in that prose. |
| "otherwise `npx nx`" | config | verified | package.json - test:app runs npx nx run angular-ai-devtools:test, and only package-lock.json sits at the root, so this repository takes the npx nx branch |
| "Spawn FETCH_HEAVY subagent for `selfHealingSkipMessage`" | integration | unverifiable | subagent types and MCP field sets live in the Nx Cloud MCP server; nothing in this checkout defines FETCH_HEAVY or selfHealingSkipMessage — Settling check: `git cat-file -p HEAD:.commandcode/skills/monitor-ci/references/fix-flows.md` — the message exists only in that prose. |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "npx nx-cloud api, the read-only Nx Cloud Public API command" | command | unverifiable | node_modules/nx/dist/src/command-line/nx-commands.js:59-93 - installed nx 23.3.0 registers no api command and node_modules/nx-cloud is absent, so the CLI cannot be inspected here; the nx-cloud package source would settle it — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "use `nx-cloud-cache-investigator`" for cache causes | integration | verified | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md:2 - the named sibling skill is installed next to this one under .commandcode/skills |
| "references/extraction-and-calculation.md" as the next read for multi-range extraction | structure | verified | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md:1 - the relative link resolves inside the skill directory |
| "with `-i` or `NX_VERBOSE_LOGGING`" extra stderr records | config | unverifiable | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:170 - NX_VERBOSE_LOGGING is a real Nx variable, but the extra response and log records come from the absent nx-cloud client — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "`--page-size` (which sets `limit`, max 500)" | command | unverifiable | no nx-cloud client under node_modules; `npx nx-cloud api --describe` output would name the server limit — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the skill links `references/extraction-and-calculation.md` at `SKILL.md:165`" | structure | verified | git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/SKILL.md - line 165 carries the Markdown link [references/extraction-and-calculation.md](references/extraction-and-calculation.md) |
| "npx nx-cloud api task-stats -f dateAfter=... -f percentiles=50 --pages 3 -o" | command | unverifiable | active npm tree has no nx-cloud package (node_modules/nx-cloud absent) and nx-commands.js registers no api command; `npx nx-cloud api --describe task-stats` would confirm the filter names — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "A non-null `nextCursor` means the range is incomplete" | status | unverifiable | the wrapped list shape is defined only by the absent nx-cloud client; one live list response would settle it — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | command | unverifiable | node_modules/.bin has no nx-cloud binary; the nx-cloud package manifest would name the subcommand — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | status | unverifiable | needs the nx-cloud CLI source or an ndjson response; nothing in this repo produces either — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "Nx Cloud log and report assets are compressed binary payloads" | status | unverifiable | no Nx Cloud asset exists for this workspace (nx.json has no nxCloudId); a downloaded -o asset would settle the format |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 - the required skill is installed in the same .commandcode/skills tree |
| "read [references/artifact-integrity.md](references/artifact-integrity.md) before you inspect an archive" | structure | verified | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md:1 - the relative link resolves inside the skill directory |
| "Query the exact target with the workspace-local Nx command: nx show project ... --json" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:87 declares the project subcommand and :17 the --json option; node_modules/nx/schemas/project-schema.json:41,48,65,137 declare executor, outputs, inputs and cache as target properties |
| "A target `cache` field controls Nx replay" | feature | verified | node_modules/nx/schemas/project-schema.json:137 declares cache on a target and nx.json:5-7 sets targetDefaults.build.cache true for this workspace |
| "If `cacheEnabled: false`, that run did not use the Nx task cache" | status | unverifiable | no Nx Cloud run record exists for this workspace (nx.json has no nxCloudId, node_modules/nx-cloud absent); one api run record would settle it |
| "Arrange one same-session wake only when a known task is non-terminal" | status | unverifiable | procedural retry policy with no repo artifact; an api 409 not_terminal response would be the test — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the skill links `references/artifact-integrity.md` at `SKILL.md:126`" | structure | verified | git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/SKILL.md - line 126 carries the Markdown link [references/artifact-integrity.md](references/artifact-integrity.md) |
| "Download the exact task-row artifact link with `npx nx-cloud api <link> -o <private-file>.tar.gz`" | command | unverifiable | node_modules/nx-cloud is absent and nx-commands.js:59-93 registers no api command; the nx-cloud CLI source would settle the download behaviour — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`" | command | unverifiable | node_modules/.bin contains no nx-cloud binary; the nx-cloud package manifest would name the subcommand — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "Byte-identical malformed downloads across retries support a persistent bad cache object" | feature | unverifiable | needs a real Nx Cloud artifact download; this workspace has no cloud connection to produce one — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "The API cannot identify an upload path, writer, storage event, or service mutation" | status | unverifiable | requires the live API schema (`npx nx-cloud api --describe`); no nx-cloud client is installed here — Settling check: a live Nx Cloud response — no command in this checkout reaches the live API schema, so that response is the external artifact. |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the skill links `references/log-and-report-assets.md` at `SKILL.md:78`" | structure | verified | git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/SKILL.md - line 78 carries the Markdown link [references/log-and-report-assets.md](references/log-and-report-assets.md) |
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | config | unverifiable | no Nx Cloud task row or asset schema in this repo; a task-list JSON row would name the asset types — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "Download the exact row-provided link with `npx nx-cloud api <link> -o <private-file>.tar.gz`" | command | unverifiable | nx-cloud client missing (node_modules/nx-cloud absent, no api command in nx-commands.js:59-93) — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "A downloaded asset proves only that it resolves now. A 404 does not prove that it never existed" | status | unverifiable | requires a live asset download; nx.json records no Nx Cloud workspace, so no asset URL exists to test |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Requires the `nx-cloud-api` skill for all Nx Cloud reads" | integration | verified | .commandcode/skills/nx-cloud-api/SKILL.md:2 - the required skill is installed in the same .commandcode/skills tree |
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | command | unverifiable | needs `npx nx-cloud api --describe cipes`; no nx-cloud client exists under node_modules — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "the public API has no separate workflow routes" | integration | unverifiable | requires the live operation list from --list-operations, which the absent nx-cloud client would print — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| "inspect `CODEOWNERS` and project ownership metadata at the recorded commit" | structure | unverifiable | no CODEOWNERS or .github/CODEOWNERS exists in this checkout and no recorded failed-run commit is supplied; either would settle it — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Always use `--no-interactive`" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:31-33 - an interactive option whose false value disables interactive input prompts |
| "npx nx g @nx/react:library --help" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:7 - command is generate <generator> [_..], so a generator id plus extra flags is accepted |
| "read directly from `node_modules/<plugin>/generators.json`" | structure | verified | node_modules/@nx/angular/generators.json exists in this workspace, so the documented lookup path resolves for an installed plugin |
| "`nx format:write`" | command | verified | node_modules/nx/dist/src/command-line/format/command-object.js:17 - command format:write, described as overwrite un-formatted files |
| "`nx run-many -t build,lint,test,typecheck`" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:91 registers run-many and yargs-utils/shared-options.js:360 gives targets the -t alias |
| "The `link-workspace-packages` skill can help" | integration | verified | .commandcode/skills/link-workspace-packages exists in the same skills tree as this skill |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx import` brings code from a source repository or folder into the current workspace, preserving commit history" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:79 registers the import command; import/command-object.js:12 declares import [sourceRepository] [destinationDirectory] |
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs and follow-up questions" | command | verified | node_modules/nx/package.json:3 - installed nx is 23.3.0, and import/command-object.js:37 declares the interactive option that drives those follow-up questions |
| "Whole repo (`nx import <source> imported --source=.`)" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:26 - a source option with the source alias is declared |
| "After import, run `nx sync --yes`" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:93 registers the sync command |
| "Available references: `references/ESLINT.md` ... `references/VITE.md`" | structure | verified | all six cited files exist under .commandcode/skills/nx-import/references/ (ESLINT, GRADLE, JEST, NEXT, TURBOREPO, VITE) |
| "Pin ESLint to v9 (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | config | stale | node_modules/@nx/eslint/package.json:76 - peerDependencies declares eslint `^9.0.0 \|\| ^10.0.0`, so v10 is supported; this workspace resolves eslint 10.13.0 |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project" | integration | unverifiable | @nx/eslint 23.3.0 is installed but nx.json:25-31 registers only @nx/playwright/plugin and no eslint.config.* exists at the root; an inferred lint target listing would settle it |
| "Plugin options ... set during `nx add @nx/eslint` ... options: { targetName: eslint:lint }" | config | verified | nx.json:27-29 uses exactly that plugins[].options.targetName shape for @nx/playwright/plugin, and add/command-object.js:22 shows nx add runs the package init generator |
| "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`" | feature | unverifiable | requires an import run; import/command-object.js declares no ESLint-specific option — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-import/references/ESLINT.md` — the doc is the only local source; an import run would settle the offer. |
| "`typescript-eslint@7.x` declares peerDependencies: { eslint: ^8.56.0 }" | config | unverifiable | node_modules/typescript-eslint is absent and no v7 manifest exists here; the published package would settle it — Settling check: `git cat-file -p HEAD:package-lock.json` — no typescript-eslint v7 entry, so the published manifest is the only source. |
| "Pin ESLint to v9 (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | config | stale | node_modules/@nx/eslint/package.json:76 - peer range is `^9.0.0 \|\| ^10.0.0`, and node_modules/eslint/package.json holds 10.13.0, so v10 is supported rather than broken |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | integration | unverifiable | node_modules/@nx/gradle is absent and package.json lists no @nx/gradle devDependency; the plugin source would settle the wrapper expectation |
| "If `@nx/gradle` is installed, run `nx show projects`" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:38 - the projects subcommand is registered |
| "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper`" | structure | unverifiable | this workspace has no Gradle files at all (no gradlew, gradlew.bat or gradle/), so nothing here confirms the expected layout — Settling check: `git cat-file -p HEAD:package.json` — no Gradle files exist, so nothing local confirms the layout. |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project" | integration | unverifiable | node_modules/@nx/jest is absent, nx.json registers no jest plugin, and the workspace has zero jest.config.* files |
| "`npx nx add @nx/jest` ... Registers `@nx/jest/plugin` in `nx.json`" | command | verified | node_modules/nx/dist/src/command-line/add/command-object.js:7 and :22 - add <packageSpecifier> installs the package and runs its init generator |
| "Both `@nx/jest/plugin` and `@nx/vite/plugin` (which infers Vitest targets) coexist without conflicts" | integration | unverifiable | neither plugin is registered in nx.json; this workspace runs vitest through the @angular/build:unit-test target (nx.json:16-19, package.json:33) |
| "`ciTargetName`: `test-ci` ... creates `test-ci--src/lib/foo.spec.ts` targets" | config | unverifiable | needs the @nx/jest plugin source, which is not installed here — Settling check: `git cat-file -p HEAD:nx.json` — no jest plugin, so the ciTargetName shape has no local instance. |
| "Jest vs Vitest coexistence" across config files | integration | unverifiable | this workspace generates vitest-angular tests via nx.json:34-36 and has no Jest config; a mixed workspace would be needed |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | integration | unverifiable | node_modules/@nx/next is absent, nx.json registers only @nx/playwright/plugin, and both workspace projects are Angular (apps/angular-ai-devtools, apps/angular-ai-devtools-e2e) |
| "No separate typecheck target - Next.js runs TypeScript checking as part of `next build`" | feature | unverifiable | requires the @nx/next plugin source or a Next.js project; neither exists in this workspace — Settling check: `git cat-file -p HEAD:nx.json` — no @nx/next plugin is registered. |
| "`nx reset && nx sync --yes && nx run-many -t typecheck,build,test,lint`" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:89, :91 and :93 register reset, run-many and sync; yargs-utils/shared-options.js:360 gives -t the targets alias |
| "`@nx/next:init` rewrites all npm scripts (Whole-Repo Import)" | feature | unverifiable | needs an import run with @nx/next installed; no generator or script of that name exists here — Settling check: `git cat-file -p HEAD:package.json` — no @nx/next dependency is listed. |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The migration replaces Turborepo task orchestration with Nx targets" | feature | verified | package.json:12 runs the app suite as `npx nx run angular-ai-devtools:test`, nx.json:2-23 defines the cached targets, and no turbo.json exists at the root |
| "Run workspace validation (`nx run-many -t build lint test typecheck`)" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:91 registers run-many; yargs-utils/shared-options.js:360 gives -t the targets alias |
| "If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs` that projects extend" | structure | verified | neither file exists at the root; tsconfig.json:1 is a standalone check config, so this workspace sits in the documented no-root-config branch |
| "Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`" | config | verified | package.json devDependencies list neither turbo nor eslint-plugin-turbo, and no turbo.json exists, so the cleanup list is empty here |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | config | unverifiable | node_modules/@nx/vite is absent and nx.json registers no vite plugin; the plugin source would name the default |
| "Shared Vite deps (both frameworks): `vite`, `vitest`, `jsdom`, `@types/node`, `typescript` (dev)" | config | verified | package.json:30-33 declares @types/node ^26.6.5, jsdom ^27.1.0, typescript 6.0.3 and vitest ^4.0.8; vite itself is not a declared dependency |
| "`nx sync --yes && nx reset && nx run-many -t typecheck,build,test,lint`" | command | verified | node_modules/nx/dist/src/command-line/nx-commands.js:89, :91 and :93 register reset, run-many and sync |
| "React Router 7 outputs to `build/` (not `dist/`)" | feature | unverifiable | no React Router project exists in this workspace; a react-router build would settle it — Settling check: `git cat-file -p HEAD:package.json` — no react-router dependency, so no build output can be inspected. |
| "Vite 6 to 7: Typecheck fails (`Plugin<any>` type mismatch)" | status | unverifiable | needs the @nx/vite plugin source or an upgrade run; it is not installed here — Settling check: `git cat-file -p HEAD:package-lock.json` — the lock records the installed Vite range, not the 6-to-7 upgrade. |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | node_modules/nx/dist/src/command-line/list/command-object.js:6 - command list [plugin] lists installed plugins and their capabilities |
| "Install plugins `npx nx add <plugin>`. Example: `npx nx add @nx/react`." | command | verified | node_modules/nx/dist/src/command-line/add/command-object.js:7 declares add <packageSpecifier> and :22 gives the add @nx/react example verbatim |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx run <project>:<task>`" | command | verified | node_modules/nx/dist/src/command-line/run/command-object.js:9 - command is run [project][:target][:configuration]; package.json:12 uses npx nx run angular-ai-devtools:test and apps/angular-ai-devtools/project.json:2 and :113 define that project and test target |
| "`nx show project <projectname> --json` ... contains a `targets` section" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:87 registers the project subcommand and :17 the --json option |
| "`--parallel` to control the number of parallel processes (default is 3)" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:65 - max parallel processes, default is 3 |
| "`--skipNxCache` - rerun tasks even when results are cached" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:109-110 - skipNxCache reruns tasks even when results are available in the cache |
| "`nx affected -t test --base=main --head=HEAD`" and "`--files=...`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:192 (files), :210 (base), :215 (head) |
| "Look at the package.json or lockfile to determine which package manager is in use" | config | verified | package-lock.json is the only lockfile in the workspace root; there is no pnpm-lock.yaml or yarn.lock, so the package manager is npm |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| read the AFFECTED reference for affected projects | structure | verified | .commandcode/skills/nx-workspace/references/AFFECTED.md:1-27 — file present with the affected commands |
| full project schema at node_modules/nx/schemas/project-schema.json | config | verified | node_modules/nx/schemas/project-schema.json — present in the installed tree (Test-Path true) |
| Key nx.json sections: targetDefaults, namedInputs, plugins | config | stale | nx.json:2,3,25,33 — top-level keys are analytics, targetDefaults, plugins, generators; namedInputs is absent |
| Do NOT read project.json directly - it only contains partial configuration | feature | verified | nx.json:25-32 — @nx/playwright/plugin infers the e2e target (targetName e2e), so apps/angular-ai-devtools/project.json is not the resolved config |
| nx show projects --withTarget e2e | command | verified | nx.json:27-30 — plugin option targetName e2e defines that target for the workspace |
| nx sync then nx reset if sync does not fix stale cache | command | unverifiable | no nx invocation is allowed in this audit; a captured run of nx sync exit code would settle it — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-workspace/SKILL.md` — the doc is the only local source; a captured sync run would settle the exit code. |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Affected with explicit base nx show projects --affected --base=main | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:20 — nx declares .implies(base, affected), so base is an affected-family option |
| Affected between two commits --base=abc123 --head=def456 | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:21 — .implies(head, affected) |
| Affected by uncommitted changes --uncommitted | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:18 — .implies(uncommitted, affected) |
| Affected by untracked files --untracked | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:17 — .implies(untracked, affected) |
| Affected excluding e2e projects --exclude=*-e2e | command | unverifiable | no nx invocation allowed in this audit; the exclude option is not in node_modules/nx/dist/src/command-line/graph/command-object.js:13-21, so a captured nx show projects --affected run would settle it — Settling check: `git cat-file -p HEAD:.commandcode/skills/nx-workspace/references/AFFECTED.md` — the doc is the only local source; a captured affected run would settle the exclude option. |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| doctor exits 0, flags exits 0, model info finds the registry model manifest on disk, Broker State serves that model | feature | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:2-7 — the check header states that claim and the features it covers |
| Each check exits 0 pass, 1 claim failed, 2 could not run | status | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:11 — Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run |
| instances.json is the registry both skills read | integration | verified | .commandcode/skills/control-ai-browsers/instances.json:67-230 — five instances declared (chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano) |
| Edge Dev with Aion-1.1-Instruct | config | verified | .commandcode/skills/control-ai-browsers/instances.json:133-169 — edge-dev-aion, model name Aion-1.1-Instruct, contextWindow 7168, downloadMib 1248 |
| setup npx nx run angular-ai-devtools:build-extension | command | verified | apps/angular-ai-devtools/project.json:52 — build-extension target defined |
| model download --timeout-min defaults to 45 minutes | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:244 — positiveFlag(timeout-min, timeoutMin, 45) |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| extension-enabled: the copy is loaded ENABLED and its service worker runs | feature | verified | .commandcode/skills/verify-angular-devtools/checks/extension-enabled.mjs:2 — claim header cites control-angular-devtools doctor extension line |
| attached: connected flag set, detectAngular reports Angular in debug mode, backend installed and ready | feature | verified | .commandcode/skills/verify-angular-devtools/checks/attached.mjs:2 — claim header states the attach facts |
| With --di-graph it runs angular:di_graph last and records whether the template node is lost | feature | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:5,9,10 — header documents --di-graph last on that page and the usage line |
| Each check exits 0 pass, 1 claim failed, 2 could not run | status | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:12 — Exit 0 pass; 1 with Error: CLAIM; 2 when it could not run |
| condition runs the check script with --out {up.evidenceDir} and passes --di-graph for coexist | command | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:66 — control([coexist, --di-graph]); :94 usage coexist.mjs --out dir [--di-graph] |
| feature file and sub-feature in control-angular-devtools/features/ | structure | verified | .commandcode/skills/control-angular-devtools/features/ — attach.md, install.md, profiler.md, signal-graph.md and README.md present |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| exact pin 0.0.7 declared and installed | config | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:3 — header names the exact pin 0.0.7 among the setup facts the check reads |
| setup: dev-guarded overlay import, proxy and its serve option | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:2-4 — claim header lists the same setup facts |
| A click on the sidebar CONTRACT > List reaches /contract/list with the table filled | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:2 — claim header states that navigation and the MCP answers |
| tools/list offers no action tool, and call navigate without --confirm is refused (exit 2) | feature | verified | .commandcode/skills/verify-pangular-inspector/checks/read-only.mjs:2 — claim header states the read-only facts |
| Each check exits 0 pass, 1 claim failed, 2 could not run | status | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:9 — Exit 0 pass; 1 with Error: CLAIM; 2 when it could not run |
| The setup steps need ports 3000 and 9999 free (both fixed) | config | unverifiable | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 — DEFAULT_PORT = 9999 is fixed, but port 3000 lives in the portal checkout outside this repository; that portal proxy.conf.json would settle it |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "node:test suites are named *.node.test.ts and run with node --experimental-strip-types --test" | feature | verified | package.json:10 - test script runs node --experimental-strip-types --test; apps/angular-ai-devtools/src/app/interop-slice.node.test.ts and interop-attribution.node.test.ts are the matching suites |
| "the Angular unit-test builder is pinned to include only **/*.spec.ts" | config | verified | apps/angular-ai-devtools/project.json:117-121 - test target include is **/*.spec.ts and exclude is **/*.node.test.ts |
| "tsconfig.spec.json excludes src/**/*.node.test.ts" | config | verified | apps/angular-ai-devtools/tsconfig.spec.json:14 - src/**/*.node.test.ts in exclude |
| "only angular-new-app should remain explicit-only (disable-model-invocation: true)" | config | verified | C:/Users/LarsGyrupBrinkNielse/.commandcode/skills/angular-new-app/SKILL.md:9 - disable-model-invocation: true present; C:/Users/LarsGyrupBrinkNielse/.commandcode/skills/angular-developer/SKILL.md:1-8 - frontmatter has no such flag |
| "Features should be Angular-only with no third-party packages" | config | verified | package.json:35-44 - runtime dependencies are only @angular/*, rxjs and tslib; vitest sits in devDependencies at package.json:33, types-only via apps/angular-ai-devtools/tsconfig.spec.json:6 |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "neither word may appear in DevTools code, UI or runtime text" | status | verified | grep for blessed and ordained over apps/ and extension/ returns no hits; matches sit only in .commandcode/taste and docs/ files |
| "provideAiDevTools() not provideAiDevtools()" | feature | aspirational | package.json:1-40 - no exports field and no provider symbol; grep over apps/ and extension/ finds neither name, so the casing rule governs an API not yet written |
| "His rulings should be recorded verbatim in design docs, dated" | status | verified | docs/feature-proposals.md:1073-1076 - dated (2026-10-12) verbatim ruling quotes, each followed by a Claude note marking the inference |
| "Claims in research and design files are expected to be labelled with how they were established" | status | verified | docs/feature-proposals.md:873 - closes with the [inferred design] label; docs/feature-proposals.md:337 - [measured for the schema, n=1; the colon untested] |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Built-in AI (Prompt API) calls are panel-local by design" | integration | verified | extension/ - no LanguageModel hit in any extension script; apps/angular-ai-devtools/src/app/extension-prompt.service.ts:38 reads globalThis.LanguageModel in the panel |
| "The MAIN-world script is limited to reading the page" | structure | verified | extension/agent-main.js:4-6 - runs in the inspected page MAIN world to read window.ng and ng signal graph, dispatching a window CustomEvent |
| "must not mutate the inspected app" | feature | verified | extension/agent-main.test.mjs:117-120 - asserts agent-main.js contains neither getViewContainerRef nor di_graph |
| "A Worker must not call LanguageDetector or Translator itself" | feature | verified | grep for LanguageDetector and Translator over apps/angular-ai-devtools/src and extension/ returns no hits, so no Worker calls either |
| "Removing panel/** from web_accessible_resources is conditional" | config | verified | extension/manifest.json:1-37 - the manifest has no web_accessible_resources key, so panel/** is not exposed |
| "Companion-package naming: provideAiDevTools() with per-package secondary entry points" | structure | aspirational | package.json:35-44 - no companion package dependency and no exports map; no provideAiNgrxDevTools symbol under apps/ or extension/ |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Keep browser profiles and downloaded AI models for all browsers" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:117-120 - PROFILES resolves under the primary checkout on D: (.commandcode/worktrees plus instances.json:2 profilesRoot .browsers) |
| "start AI browser instances only through control-ai-browsers up, which adds the Edge sign-in and sync switches" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:31-32 - --disable-sync plus the msImplicitSignin feature list; scripts/pipe-keeper.mjs:38-40 refuses an Edge launch without both |
| "Never kills all node.exe processes at once" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.test.mjs:527 - asserts the skill scripts contain no taskkill, process.kill or Stop-Process |
| "global npm packages/node_modules live under D:\packages\npm-global" | config | verified | D:/packages/npm-global exists and holds 18 entries (Get-ChildItem listing) |
| "verify with nx test angular-ai-devtools" | command | verified | .project/archive/019-context-and-jobs/tasks/T003-worker-read-path.md:48 - recorded run npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/worker-read.service.spec.ts |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Generated build artifacts (e.g. hashed JS/CSS outputs under extension/panel/) should be gitignored" | config | verified | .gitignore:33-35 - extension/panel/* ignored with only index.html and favicon.ico re-included; git ls-files extension/panel lists exactly those two |
| "shared project settings stay committed in .commandcode/settings.json" | config | verified | .gitignore:18 ignores .commandcode/settings.local.json; git ls-files tracks .commandcode/settings.json only |
| "Keep spikes/ and research/ in the repository; do not archive them" | structure | verified | git ls-files counts 105 tracked files under spikes/ and 96 under research/ |
| "Gitignore .playwright-cli/ and scrub any .playwright-cli/ files from Git history" | config | verified | .gitignore:1 - .playwright-cli/ ignored; git ls-files .playwright-cli returns 0 paths |
| "the finish-inspect gate (--expected-head, --inspection, --mapper-reviewed)" | command | verified | C:/Users/LarsGyrupBrinkNielse/.commandcode/skills/gsd-path-inspect/SKILL.md:70-72 - finish-inspect takes those three flags plus the repo root |
| "AFK mode runs with a 4-agent cap" | status | unverifiable | no agent-cap setting in the repo; the cap is user-scope, so settle with the AFK section of C:/Users/LarsGyrupBrinkNielse/.commandcode/AGENTS.md — Settling check: `git cat-file -p HEAD:.commandcode/taste/workflow/taste.md` — the cap is recorded only in that taste line. |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| TypeScript is pinned to 6.0.x | config | verified | package.json:32 — typescript 6.0.3 |
| Checks: npm run check (type check, root and skills) and npm test (node:test, root and skills) | command | verified | package.json:7,10 — check runs tsc, check:skills and check:panel; test runs node --test over scripts and extension tests plus test:skills and test:app |
| Nx CLI entry for this install: node_modules/nx/dist/bin/nx.js (Nx 23) | config | verified | node_modules/nx/dist/bin/nx.js present and node_modules/nx/package.json version 23.3.0 |
| The automatic bridge (scripts/sidecar-deps-bridge.mjs) creates and removes the junction | feature | verified | scripts/ensure-sidecar-deps.mjs:4 — import { bridge } from ./sidecar-deps-bridge.mjs, and package.json:7 runs ensure-sidecar-deps.mjs in check |
| toSignal(this.subject) at line 14 and an unlabelled effect whose body calls subject.error(...) at line 22 | feature | verified | spikes/ng222-app/src/app/stale-view-fixture.ts:14,22 — toSignal(this.subject) at 14 and this.subject.error(new Error(interop)) at 22 |
| byte copies of control-ai-browsers and verify-ai-browsers; the other .claude/skills folders are older copies | structure | verified | fc /b .claude/skills/verify-ai-browsers/SKILL.md vs .commandcode copy reports no differences, while .claude/skills/verify-angular-devtools/SKILL.md differs from its .commandcode file at byte 0x925 — the drift the rule warns about |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| All eight skills (control- and verify- for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed | structure | verified | .commandcode/skills — control-ai-browsers, control-angular-dev-app, control-angular-devtools, control-pangular-inspector, verify-ai-browsers, verify-angular-devtools, verify-pangular-inspector plus control-vitest-browser-angular make eight |
| Lars rulings, verbatim: docs/feature-proposals.md section 8, Rulings from Lars | structure | verified | docs/feature-proposals.md:1001 — section 8, and :1042 — heading Rulings from Lars (2026-10-11 to 2026-10-12) |
| Spike S1: its table is in research/ | structure | verified | research/s1-results/ — the spike result folder is present |
| The lars-create-control-skill contract (references/generated-skill.md) | structure | unverifiable | references/generated-skill.md is absent from the checkout and from ~/.commandcode/references; the lars-create-control-skill skill folder would settle where the contract lives — Settling check: `git cat-file -p HEAD:docs/afk-run-2026-10-12.md` — the run log is the only local record of where the contract lives. |
| Briefs: .audit/maintain-brief.md, .audit/ai-browsers-rework.md | structure | unverifiable | neither .audit path exists at base 44e4f9b5 (never committed or removed); git log of .audit would settle it — Settling check: `git cat-file -e HEAD:.audit/maintain-brief.md` — an existence read at HEAD settles whether the briefs were ever committed. |
| Tree clean: git status shows nothing but ignored paths | status | unverifiable | a snapshot of 2026-10-12 that no later tree state can confirm; the run log itself is the only record — Settling check: `git cat-file -p HEAD:docs/afk-run-2026-10-12.md` — the run log is the only record of that tree state. |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| TS1-TS12: each spike is the smallest run that settles one unknown | structure | verified | docs/design/tutor.md:641-654 — the spike table carries rows TS1 through TS12 |
| Availability answered 2026-10-19 without flags (research/20) | feature | verified | research/20-built-in-ai-without-flags.md — present, the file the row cites |
| T1-T12: tutor features beyond the initial sketch | structure | verified | docs/design/tutor.md:559-636 — headings T1, T2, T5, T3, T6, T4, T8, T7, T9, T10, T11 and T12 under section 9 |
| All tutor state is in chrome.storage.local, written by the panel | feature | aspirational | no tutor: key or tutor module exists in apps/, extension/ or libs/ at base 44e4f9b5, so the storage design has no implementation to check it against |
| /contract/list (47 components, repeated classes) | config | unverifiable | the Insurance Portal checkout lives outside this repository (D:\projects\github\LayZeeDK\...); counting its components would settle it — Settling check: `control.mjs up --target portal` — the portal clone must serve /contract/list before its components can be counted. |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| 4. Features: new capabilities (main priority) - N1 to N37 | structure | verified | docs/feature-proposals.md:548 section 4 and :552 the N1 heading; every id N1 through N37 occurs in the file |
| 7. Spikes - S1 to S23 | structure | verified | docs/feature-proposals.md:962 section 7; every id S1 through S23 occurs in the file |
| 8. Rulings from Lars is the binding record | structure | verified | docs/feature-proposals.md:1001 section 8 and :1042 the Rulings from Lars (2026-10-11 to 2026-10-12) heading |
| The project publishes a companion npm package ... globalThis.ngAiDevTools = { ... } | feature | aspirational | the key is only in the proposals text; no ngAiDevTools or provideAiDevTools symbol exists in apps/, extension/ or libs/ at base 44e4f9b5 |
| The primary entry point provideAiDevTools() adds version and rule tables | integration | aspirational | no companion package source in the checkout; the packages/ or libs/ entry that would implement it is absent |
| Supported apps are zoneless, standalone Angular 22.2 dev builds | config | verified | .project/CHARTER.md:63 — supported apps are zoneless, standalone Angular 22.2 dev builds; spikes/ng222-app/package.json:16 has @angular/core ^22.2.0 |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the eleventh, the LanguageDetector/Translator worker crash, is at docs/filing-ledger.md:230 | structure | verified | docs/filing-ledger.md:230 — heading 11 on that line; headings 1 and 2 sit at docs/filing-ledger.md:5 and :47 |
| the in-page AI tool angular:di_graph | feature | verified | node_modules/@angular/core/fesm2022/core.mjs:2093-2094 — const diGraphTool = { name: angular:di_graph |
| @pangular-inspector/devtools 0.0.7 (npm) | config | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:3 — the same exact pin 0.0.7 that the setup check reads from the portal |
| @angular/core 22.2.2 (fresh ng new, dev server, zoneless default) | config | verified | spikes/ng222-app/package.json:16 — @angular/core ^22.2.0 in the spike app the draft names |
| the probe results are in research/05-spikes.md | structure | verified | research/05-spikes.md — present in the repository |
| skill in .claude/skills/verify-angular-devtools/ | structure | verified | .claude/skills/verify-angular-devtools/SKILL.md exists, but it is an older copy: fc /b against the .commandcode file differs from byte 0x925 |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the veto at CHARTER.md:65 is lifted | config | verified | .project/CHARTER.md:65 — No Tier 2 (app opt-in globalThis export) features in this program, the line the ruling lifts |
| The panel is already an Angular application (projectType: application, build-extension to extension/panel, baseHref: /panel/) | config | verified | apps/angular-ai-devtools/project.json:4 projectType application; :52 build-extension; :58 extension/panel; :76 baseHref /panel/ |
| Initial-bundle budget is a hard 520 KB | config | verified | apps/angular-ai-devtools/project.json:82 — maximumWarning 520kb inside the build-extension budgets at :79 |
| the way M001-M017 was actually grown (17 entries, never one dispatch) | status | verified | .project/archive — seventeen milestone archives from 001-run-unrun-spikes to 017-verification-coverage |
| Milestone: ROADMAP.md entry M###, never renumbered, ids never restart | structure | verified | .project/archive — ids 001 to 019 present once each, the series continuing at 019-context-and-jobs |
| Generation: at most 12 entries, fully specified | config | unverifiable | a planning rule with no machine check in this repository; the milestone count in .project/ROADMAP.md for the open generation would settle it — Settling check: `git cat-file -p HEAD:plans/angular-ai-devtools-program-backlog.md` — the planning rule is prose; its milestone rows are what could settle the count. |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338 | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — the same five names and ports in the registry |
| The browser instance registry is .claude/skills/control-ai-browsers/instances.json | integration | verified | fc /b .claude/skills/control-ai-browsers/instances.json vs the .commandcode copy reports no differences, so that path is the same registry |
| Deliverable: docs/feature-proposals.md, about 1,100 lines (1110 measured 2026-10-31) | structure | verified | docs/feature-proposals.md — 1110 lines in this checkout |
| the eleventh, the LanguageDetector/Translator worker crash, is at docs/filing-ledger.md:230 | structure | verified | docs/filing-ledger.md:230 — heading 11, Chromium (Blink>AI) LanguageDetector.availability / Translator.availability in a dedicated worker crashes the renderer |
| spikes/probes/: bench.js, regrade.mjs, arg-repair-replay.mjs | structure | verified | spikes/probes/ — all three files present |
| spikes/s1-extension: the test extension (retired in M009) | status | verified | spikes/s1-extension — absent from the checkout, matching the retirement; the archived notes sit under .project/archive/001-run-unrun-spikes |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| M018 instrument-core shipped and is archived at .project/archive/018-instrument-core | status | verified | .project/archive/018-instrument-core — the milestone archive directory is present |
| The next milestone, M019 context-and-jobs, is prepared to plan/done on gsd-path/M019 and is ready for build | status | stale | .project/archive/019-context-and-jobs — M019 is already archived (shipped), so it is not waiting for build |
| Frozen inventory: 143 documents | status | stale | C:\Users\LARSGY~1\AppData\Local\Temp\m020-inventory.txt — the frozen inventory at base 44e4f9b5 lists 144 .md paths, not 143 |
| Panel initial-bundle budget is 520 KB (project.json, build-extension) | config | verified | apps/angular-ai-devtools/project.json:82 — maximumWarning 520kb under the budgets of the build-extension target at line 79 |
| isolation.py isolate-verify requires --repo --base --name, and --base must be a full 40-character SHA | command | unverifiable | isolation.py sits in user scope (~/.commandcode/skills/gsd-path/scripts), outside this repository; its argv parsing or a rejected short-SHA run would settle it — Settling check: `git cat-file -p HEAD:plans/gsd-path-handoff-M018.md` — the handoff is the only local record; the user-scope isolation.py argv parsing would settle it. |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| spawnSync timeout: 600000 at .commandcode/skills/verify-ai-browsers/checks/state.mjs:253 | config | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:253 — timeout: 600000 |
| timeoutMs 1800000 for the extension-panel step and 900000 for state | config | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:49 — timeoutMs 1800000; SKILL.md:71 — 900000 was enough for four |
| chrome-stable-nano (Gemini Nano), chrome-beta-gemma4 (Gemma 4), edge-phi4mini (Phi-4-mini) and edge-dev-aion (Aion-1.1-Instruct) | config | verified | .commandcode/skills/control-ai-browsers/instances.json:67-198 — the four instance keys with model names v3Nano, gemma4-2b-it, Phi-4-mini-instruct and Aion-1.1-Instruct |
| chrome-beta-nano serves the same v3Nano model as chrome-stable-nano, so it is not part of the verified set | config | verified | .commandcode/skills/control-ai-browsers/instances.json:90,221 — both instances declare model name v3Nano with downloadMib 4073 |
| Ports 9333-9338 belong to the shared instances | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — ports 9333, 9334, 9335, 9337, 9338 assigned; 9336 is unassigned inside the quoted range |
| Check that port 9992 is free | config | unverifiable | no 9992 reference in .commandcode/skills or scripts (a recursive sweep of .commandcode found only browser-profile noise); a playwright-cli session port listing would settle it — Settling check: `control.mjs info` — the session port list shows whether 9992 is in use. |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Aion ships as three components: EdgeOptimizationGuideModelsManifest, EdgeLLMOnDeviceModel, EdgeLLMRuntime | config | verified | .commandcode/skills/control-ai-browsers/instances.json:151-155 — the edge-dev-aion pin lists exactly those three components |
| doctor model.contextWindow 7168 | config | verified | .commandcode/skills/control-ai-browsers/instances.json:166 — edge-dev-aion model contextWindow 7168 |
| Still Aion-1.1-Instruct (its manifest.json) | config | verified | .commandcode/skills/control-ai-browsers/instances.json:162 — model name Aion-1.1-Instruct |
| The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1 | config | verified | AGENTS.md:42-44 — the same three pin versions recorded with the Edge Dev 158.0.4357.0 measurement |
| copy .commandcode/worktrees/.browsers/edge-dev-aion of the primary checkout | structure | verified | .commandcode/worktrees/.browsers/edge-dev-aion — the profile folder exists under the checkout (Test-Path true) |
| .claude/skills/ holds a byte-identical copy of it | structure | verified | fc /b .claude/skills/control-ai-browsers/features/model-lifecycle.md vs the .commandcode file reports no differences |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Probe scripts: `spikes/probes/probe5.js` / `spikes/probes/probe6.js`" | structure | verified | spikes/probes/probe5.js:1 - probe5.js and probe6.js are present as the tracked Aion tool-call probes |
| "ep-trials.sh sets the provider list in Aion genai_config.json with set-genai-provider.mjs" | command | verified | spikes/probes/ep-trials.sh:14 - loops providers webgpu qnn cpu and rewrites the genai_config.json path with set-genai-provider.mjs |
| "CPU (empty provider list) create() 4,623 ms, first answer 14,507 ms" | status | verified | research/ep-trials/cpu.json:1 - createMs 4623 and promptMs 14507 match the table row |
| "the rule is now: tool names are lowercase (snake_case recommended for readability)" | feature | verified | docs/feature-proposals.md:197 - carries that rule as the S11 answer |
| "`.browsers/edge-dev-phi4mini` port 9336" | config | stale | .commandcode/skills/control-ai-browsers/instances.json:173 - the Phi-4-mini instance port is 9337, not 9336 |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "WebMCP is now `document.modelContext` (not `navigator`)" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1439 - the WebMCP canary passes only when typeof document.modelContext is object |
| "in the browsers the member is spelled callID; callId throws Required member is undefined" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1424 - tool-call handling reads c.callID first and only then falls back to c.callId |
| "Enabling it turns on AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:106-108 - the Gemma 4 instance enables exactly those three features |
| "Edge Dev 157 manifest names Aion-1.1-Instruct" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:162 - the edge-dev-aion model entry is named Aion-1.1-Instruct |
| "Angular ships `provideExperimentalWebMcpTools`" | feature | unverifiable | no @angular/core sources are installed in this checkout; settle by reading the Angular release notes or node_modules/@angular/core — Settling check: the Angular release notes — no command in this checkout reaches the Angular package, so that artifact is what settles it. |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`NgZone` with `useClass: NoopNgZone` and the `Zoneless enabled` token with `useValue: true`, measured on the insurance portal, which loads zone.js" | status | verified | research/raw/zone-mode-portal.json:1 - zoneGlobal true plus environment-injector records with NgZone useClass NoopNgZone and InjectionToken Zoneless enabled useValue true |
| "`?getSignalGraph`" is the internal (Tier 1) name | feature | verified | extension/agent-main.js:74 - the page agent probes ng.?getSignalGraph first and falls back to the unprefixed name |
| "`getDirectiveMetadata` ... `{inputs, outputs}` plus `encapsulation`, `changeDetection` for components" | feature | verified | extension/agent-main.js:264 - the agent calls ng.getDirectiveMetadata (or its ? form) to read directive metadata |
| "`getOwningComponent`" resolves the component whose view contains the node | feature | verified | extension/agent-main.js:290 - used as the final fallback when resolving an instance from an element |
| "local clone `D:\projects\github\angular\angular` on branch `22.2.x`" | structure | verified | git -C D:\projects\github\angular\angular rev-parse --abbrev-ref HEAD prints 22.2.x |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Local clone: `D:\projects\github\pangular-inspector\devtools`, last commit `76c09d0`" | structure | verified | git -C D:\projects\github\pangular-inspector\devtools log -1 --format=%h prints 76c09d0 |
| "package `@pangular-inspector/devtools` 0.0.7" | config | verified | D:\projects\github\pangular-inspector\devtools\packages\devtools\package.json:3 - version is 0.0.7 |
| "the event is a plain DOM event any MAIN-world script can dispatch" (`devtoolstooldiscovery`) | feature | verified | spikes/probes/s2.js:34 - the S2 probe builds new CustomEvent(devtoolstooldiscovery) in the page main world |
| "see `docs/feature-proposals.md` 3.2" for the tool registry and naming rules | structure | verified | docs/feature-proposals.md:313 - section 3.2 is One tool registry, four sources |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Local clones used: `D:\projects\github\ngrx\platform` (NgRx 22.0.0, `modules/store/package.json`)" | config | verified | D:\projects\github\ngrx\platform\modules\store\package.json:3 - version is 22.0.0 |
| "`D:\projects\github\analogjs\analog` (`@analogjs/platform` 2.8.0)" | config | verified | D:\projects\github\analogjs\analog\packages\platform\package.json:3 - version is 2.8.0 |
| "STATE_SOURCE is Symbol(STATE_SOURCE) when ngDevMode is truthy (line 14-16, empty description otherwise)" | feature | verified | D:\projects\github\ngrx\platform\modules\signals\src\state-source.ts:14-16 - Symbol(ngDevMode ? STATE_SOURCE : empty string) |
| "See `docs/feature-proposals.md` 6.4" for the Analog identification rules | structure | verified | docs/feature-proposals.md:944 - section 6.4 is Analog.js |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "A component `app-counter` (`src/app/counter.ts`) has `title = input()`, `count = signal(3)`, `double = computed(count * 2)`" | structure | verified | spikes/ng222-app/src/app/counter.ts:16-18 - title input, count = signal(3), double = computed(() => this.count() * 2) |
| "Walked root component `?getInjectorResolutionPath`: 5 injectors (app-counter element, app-root element, environment, platform, null)" | status | verified | research/raw/s16-meta-lookup.json:9-16 - injectorPath lists the element, environment and platform injectors in that order |
| "A draft upstream report is in `docs/filing-ledger.md`" for the ViewContainerRef finding | status | verified | docs/filing-ledger.md:11 - records serializeInjector calling injector.get(record.token, null, {optional: true, self: true}) and ViewContainerRef creating a view container at the host |
| "now `signal_dependencies {id, signal}` in `docs/feature-proposals.md` 3.4" | feature | verified | docs/feature-proposals.md:421 - proposes the signal_dependencies tool in section 3.4 |
| "chrome-beta-nano (port 9333) ... chrome-beta-gemma4 (port 9334) ... edge-dev-aion (port 9335) ... edge-phi4mini (port 9337)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70-173 - the registry ports are 9333, 9334, 9335 and 9337 |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Source: `D:\projects\github\angular\skills`, branch `main`, commit `747c3c2`" | structure | verified | git -C D:\projects\github\angular\skills log -1 --format=%h prints 747c3c2 |
| "whole reference corpus is 135,754 bytes (measured, `wc -c`) ... 2 skills, 37 reference files" | structure | verified | D:\projects\github\angular\skills\angular-developer\references - 37 files totalling 135,754 bytes |
| "`track` required (l.79)" in `components.md` | feature | verified | D:\projects\github\angular\skills\angular-developer\references\components.md:79 - the track expression is required for performance and DOM reuse |
| "`@default never` (l.104)" in `components.md` | feature | verified | D:\projects\github\angular\skills\angular-developer\references\components.md:104 - recommends @default never for exhaustive union checking |
| "`ng mcp` tools: `get_best_practices`, `onpush_zoneless_migration`, `search_documentation`, `list_projects`, `ai_tutor` (l.9-15)" | feature | verified | D:\projects\github\angular\skills\angular-developer\references\mcp.md:9-15 - the table lists exactly those five tools |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "genai_config.json says type qwen3, 28 layers, hidden size 2048, context_length 32768" | config | verified | C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\Edge Dev\User Data\EdgeLLMOnDeviceModel\2026.10.2.1\genai_config.json - type qwen3, num_hidden_layers 28, hidden_size 2048, context_length 32768 |
| "spikes/probes/tool-name-matrix.js (five variants including empty properties with a snake_case name)" | command | verified | spikes/probes/tool-name-matrix.js:10-15 - the variants array holds exactly those five tool-name and schema combinations |
| "getComponentCount and Get_component_count failed with kErrorUnknown; getcomponentcount returned a tool call" | status | verified | research/raw/tool-name-matrix-gemma4-gpu.json:1 - only the two names with an uppercase letter report kErrorUnknown |
| "7,168 (Aion) to 9,216 (Gemma 4, Nano) tokens" context budget | config | verified | .commandcode/skills/control-ai-browsers/SKILL.md:22 - the chrome-beta-nano instance row records a 9,216 contextWindow |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a Zone.js app lists a NoopNgZone record first and a useFactory record last, so the last NgZone record decides" | status | verified | research/raw/zone-mode-portal-zonejs.json:1 - two NgZone token records in order, NoopNgZone first and useFactory last |
| "source says @experimental 22.0 (packages/core/src/resource/debounce.ts:32)" against the site saying stable | feature | verified | D:\projects\github\angular\angular\packages\core\src\resource\debounce.ts:32 - the docblock reads @experimental 22.0 |
| "Tiers are the ones in docs/feature-proposals.md section 2.2" | structure | verified | docs/feature-proposals.md:205 - section 2.2 is Data tiers |
| "on the portal most Signal Forms nodes carry library labels (status, errors, pending)" | status | verified | research/raw/tosignal-node-portal.json:1 - 20 contracts and a node list labelled with library names such as action, invalid and toSignal.source |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The device is unable to create a session to run the model. Please check the result of availability() first." raised as NotSupportedError | status | verified | research/raw/matrix-nano.json:1 - the toolTypesOnly variant records availability available with create ERR NotSupportedError and that message |
| "availability() returns available for the same options" while create fails | status | verified | research/raw/matrix-nano.json:1 - same variant reports availability available although create errors |
| "Measured behaviour: `05-spikes.md`, section Root cause hunt (Chrome Beta 156.0.8078.17, Nano profile serving `v3Nano`)" | structure | verified | research/05-spikes.md:125 - the Root cause hunt section exists at that line under that title |
| "--enable-features=AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:106-108 - the Gemma 4 instance enables exactly those three features |
| "The message is `kExceptionMessageUnableToCreateSession` in exception_helpers.cc#L68-L70" | feature | unverifiable | the Chromium source at tag 156.0.8078.17 is not vendored in this checkout; settle by fetching third_party/blink/renderer/modules/ai/exception_helpers.cc at that tag — Settling check: the Chromium source checkout at tag 156.0.8078.17 — no command in this checkout reaches it, so that artifact is what settles the message. |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "profilesRoot: .browsers" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:2 - profilesRoot is .browsers |
| "the instance is edge-phi4mini" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:171 - instance key edge-phi4mini is defined |
| "the file was overwritten by the second benchmark round (it now holds the CPU run, native 1/15, fallback 0/15)" | status | verified | research/raw/bench/nano.json:1 - modes.native.runPasses 1/15, modes.fallback.runPasses 0/15 |
| "spikes/probes/bench/nano.json and spikes/probes/bench.js:62" | structure | unverifiable | spikes/probes/bench.js exists, spikes/probes/bench/nano.json does not (Test-Path false); only research/raw/bench/nano.json holds the figures |
| "Chrome and Edge both ship llguidance, a grammar-constrained decoder" | feature | unverifiable | no llguidance source in this checkout; needs the Chromium and Edge build reads cited in research/07 (B2, B3) — Settling check: the recorded Chromium and Edge build reads — no command in this checkout reaches them, so that artifact is what settles it. |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Extension: spikes/s1-extension/ (retired in M009; evidence and archived notes live under .project/archive/001-run-unrun-spikes/)" | status | verified | spikes/s1-extension is absent from the checkout; .project/archive/001-run-unrun-spikes/ exists with MANIFEST.md, research/ and tasks/ |
| "It writes research/s1-results/<browser>-<model>.json" | structure | verified | research/s1-results/ holds chrome-fresh.json, edge-fresh.json, chrome-gemma4.json, edge-aion.json |
| "Chrome Beta 156.0.8078.17 on port 9341, Edge Dev 157.0.4322.0 on port 9342" | config | verified | research/s1-results/chrome-fresh.json:1 version Chrome/156.0.8078.17 port 9341; research/s1-results/edge-fresh.json:1 version Edg/157.0.4322.0 port 9342 |
| "The devtools_page is blocked by Permissions Policy" | feature | verified | research/s1-results/chrome-fresh.json:1 devtools_page permissionsPolicyAllowsLanguageModel false, availability unavailable; same in edge-fresh.json |
| "the test page was http://localhost:<p>/s1-test" | status | verified | research/s1-results/chrome-fresh.json:1 content_isolated href http://localhost:52564/s1-test, mode launch |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spike main.js:n = spikes/ng222-app/dist/ng222-app/browser/main.js line n in this repo" | structure | unverifiable | that path is absent in the checkout and in the sidecar (Test-Path false); the bundle would have to be rebuilt to count its 968 ngDevMode references — Settling check: `npx nx run angular-ai-devtools:build` — the bundle has to be rebuilt before its ngDevMode lines can be counted. |
| "rg -c @deprecated A/goldens/public-api: core 23, common 44" | config | verified | D:\projects\github\angular\angular\goldens\public-api\core\index.api.md and common\index.api.md - 23 and 44 @deprecated matches; clone on branch 22.2.x at 5db6fc4453 |
| "N10 flags it when detected" | feature | verified | docs/feature-proposals.md:57-58 - Reactive and template-driven forms and decorator @Input() fields are listed as flagged by N10 |
| "docs/feature-proposals.md N24 flags a plain field written in a subscribe callback" | feature | verified | docs/feature-proposals.md:97 - N24 row: finds the plain field written in a subscribe callback in a zoneless app |
| "the panel shows a notice instead of answering, as it already does for Zone.js apps" | feature | verified | docs/feature-proposals.md:53 - a Zone.js app gets a not-supported notice in the panel instead of a chat |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "zone.js polyfill in a zoneless app, apps/insurance-portal/project.json:18" | config | verified | D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools\apps\insurance-portal\project.json:18 - polyfills is [zone.js] |
| "The three forms now use Signal Forms (@angular/forms/signals) in commits 754aa1e (claim), 66e8ad6 (contract) and 92053b9 (complaint)" | status | verified | git log in that clone - all three commits exist, subjects refactor(claim), refactor(contract) and refactor(complaint) migrate the form to Signal Forms |
| "The Reactive Forms search above now finds nothing (exit 1)" | status | verified | recursive search for ReactiveFormsModule under that clone libs on branch claude/ai-devtools-spike at cc9ce25 returns 0 files |
| "@angular/forms/signals appears in 6 files" | config | verified | a forms/signals import search over the clone libs returns exactly 6 files |
| "Two optimus-ui incompatibilities are drafted in docs/filing-ledger.md (6 and 7), not filed" | status | verified | docs/filing-ledger.md:154,184 - items 6 and 7 are the optimus-ui Signal Forms findings |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Source: local clone D:\projects\github\angular\angular at 5db6fc4453 (2026-09-25, branch 22.2.x)" | structure | verified | git -C D:\projects\github\angular\angular rev-parse reports branch 22.2.x and HEAD 5db6fc4453 |
| "Playwright MCP README omits browser_webmcp_list and browser_webmcp_call, which its source defines" | feature | verified | D:\projects\github\microsoft\playwright\packages\playwright-core\src\tools\backend\webmcp.ts:269,293 define both names; that clone README.md has 0 matches for browser_webmcp |
| "these are not added to docs/filing-ledger.md" | status | stale | docs/filing-ledger.md:200,210,220 - items 8, 9 and 10 are exactly these three observations, so they were filed after this note was written |
| "Already covered (N12 find_components)" | feature | verified | docs/feature-proposals.md:388 - find_components returns short ids (c3) for component targeting |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "One component signal graph on the portal /claim/create (ng-journal-create): 107 nodes, 171 edges" | structure | verified | research/raw/tosignal-node-portal.json:1 - decoded graph has 107 nodes, 171 edges and a template node labelled ng-journal-create |
| "toSignal.source (value array(20), reads toSignal.state)" | feature | verified | research/raw/tosignal-node-portal.json:1 - node labelled toSignal.source carries value array(20) |
| "Research: research/raw/tosignal-node-portal.json records the counts" | config | verified | research/raw/tosignal-node-portal.json:1 - the file is a 28,518-byte JSON graph holding nodes, edges and contracts=20 |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Routes (app.routes.server.ts): / RenderMode.Server, /prerender RenderMode.Prerender, /client RenderMode.Client" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:4-6 - path empty is Server, prerender is Prerender, client is Client |
| "provideClientHydration() with no features, provideHttpClient(withFetch()), withComponentInputBinding()" | config | verified | spikes/ng222-ssr/src/app/app.config.ts:11-13 - provideRouter(routes, withComponentInputBinding()), provideHttpClient(withFetch()), bare provideClientHydration() |
| "app.get(/api/items) in src/server.ts, logging each hit with its user agent" | feature | verified | spikes/ng222-ssr/src/server.ts:18-19 - express route /api/items logs [api] GET /api/items with ua= from the user-agent header |
| "@defer (hydrate on interaction) { <app-deferred/> } with a Deferred click button" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15 - the template block is @defer (hydrate on interaction) |
| "DataList (httpResource on /api/items)" | feature | verified | spikes/ng222-ssr/src/app/data-list.ts:22 - items is httpResource with url /api/items and transferCache |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "vitest 5.0.3, @vitest/browser 5.0.3, @vitest/browser-playwright 5.0.3, playwright 1.63.0, vitest-browser-angular 0.5.1" | config | verified | spikes/ng222-app/package.json:27-33 - the five devDependencies carry exactly those pinned versions |
| "angular.json test: options runnerConfig: true; configurations headless (default, browsers: [ChromiumHeadless]), attach (vitest-attach.config.mts) and extension (vitest-extension.config.mts)" | config | verified | spikes/ng222-app/angular.json:70-82 - runnerConfig true, headless lists ChromiumHeadless, attach and extension name those two config files |
| "the config sets it from a plugin, only on the project Angular builds, from VITEST_BROWSER_PORT (default 51315)" | config | verified | spikes/ng222-app/vitest-base.config.mts:7,18 - browserPort from VITEST_BROWSER_PORT with fallback 51315, returned as test.api with strictPort |
| "Tests, src/app/counter.spec.ts, using render from vitest-browser-angular" | structure | verified | spikes/ng222-app/src/app/counter.spec.ts:3,12 - imports render from vitest-browser-angular and renders Counter with inputs and providers |
| "Runner: Angular own @angular/build:unit-test builder" | config | verified | spikes/ng222-app/angular.json:68 - the test target builder is @angular/build:unit-test |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The correct feature flags (not msBrowserSignin)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:32,51 - Edge browserArgs use --disable-features=msImplicitSignin,msProfileSignIn,msOneAuthWAM,msForceBrowserSignIn; msBrowserSignin appears nowhere |
| "--disable-sync is redundant with SyncDisabled=1 policy but harmless" | command | verified | .commandcode/skills/control-ai-browsers/instances.json:31,50 - both Edge instances pass --disable-sync in browserArgs |
| "For a single ad-hoc launch with no persistence/account, use --guest or --bwsi" | command | unverifiable | no --guest or --bwsi switch in this repo (grep of control.mjs and instances.json finds none); needs an Edge launch to confirm behaviour |
| "apply the policies via the Windows Registry (HKCU or HKLM) under SOFTWARE\Policies\Microsoft\Edge" | config | unverifiable | registry state is outside the repository; .commandcode/skills/control-ai-browsers/SKILL.md:306-308 only describes the switches, so a registry read is needed to settle it — Settling check: an exported registry key set — no command in this checkout reaches the Windows registry, so that artifact is what settles it. |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Per context: typeof LanguageModel, availability(), create(), one prompt" | config | verified | research/raw/19-languagemodel-contexts.json - the probe field records exactly those four steps and results cover panel, panelWorker, devtoolsPage and serviceWorker |
| "Each browser-model pair ran in its control-ai-browsers instance" | status | verified | research/raw/19-languagemodel-contexts.json - results hold the five pairs chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano |
| "Section 3.1 of docs/feature-proposals.md already places the session in the DevTools panel or side panel page (spike S1, research/11)" | feature | verified | docs/feature-proposals.md:285 - section 3.1 Extension contexts gives the DevTools panel / side panel the chat UI, model session and tool loop |
| "ExtensionPromptService now calls LanguageModel in the panel itself" | feature | verified | apps/angular-ai-devtools/src/app/extension-prompt.service.ts:37-38 - languageModel() returns globalThis.LanguageModel and the service drives it from the panel |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the two Edge profiles were launched with control-ai-browsers up <name> --no-ai-features, which keeps only the Edge sign-in and sync switches" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2072-2074 - --no-ai-features sets features to an empty list while every other switch stays |
| "Raw results: raw/20-built-in-ai-without-flags.json under workers" | structure | verified | research/raw/20-built-in-ai-without-flags.json - 15,499 bytes with top-level keys measuredAt, setup, results and workers |
| "Filing draft: docs/filing-ledger.md item 11" | status | verified | docs/filing-ledger.md:230 - item 11 is LanguageDetector.availability() or Translator.availability() in a dedicated worker crashing the renderer |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using Angular CLI version 22.2.2" | config | verified | spikes/ng222-app/package.json:25 - @angular/cli is ^22.2.2 |
| "To execute unit tests with the Vitest test runner, use: ng test" | command | verified | spikes/ng222-app/package.json:9,32 - scripts.test is ng test and devDependencies pin vitest 5.0.3 with @vitest/browser 5.0.3 |
| "open your browser and navigate to http://localhost:4200/" | config | verified | spikes/ng222-app/angular.json:55-56 uses @angular/build:dev-server with no port option; node_modules/@angular/build/src/builders/dev-server/schema.json gives port default 4200 |
| "This will compile your project and store the build artifacts in the dist/ directory" | config | verified | spikes/ng222-app/angular.json build options set no outputPath, so the CLI default dist/ng222-app applies |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This fixture was generated with --skip-tests and tracks no *.spec.ts" | structure | verified | spikes/ng222-ssr/angular.json:15-34 - every @schematics/angular generator sets skipTests true; a recursive *.spec.ts search outside node_modules returns 0 files |
| "so it has no unit tests to run" | status | verified | 0 files match *.spec.ts anywhere under spikes/ng222-ssr with node_modules excluded |
| "This project was generated using Angular CLI version 22.2.2" | config | verified | spikes/ng222-ssr/package.json:29 - @angular/cli is ^22.2.2 |
| "open your browser and navigate to http://localhost:4200/" | config | verified | spikes/ng222-ssr/angular.json:88-89 uses @angular/build:dev-server with no port option; dev-server schema.json gives port default 4200 |

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

| 308 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `node_modules/@nx/eslint/package.json:76` declares `eslint: ^9.0.0 \|\| ^10.0.0` and the workspace resolves eslint 10.13.0, so the doc's \"ESLint 10 breaks @nx/eslint\" pin is wrong; the code is authoritative. | no |
| 329 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": no `angular-ai:error-explain` string exists in apps/, src/, extension/, scripts/ or tests/; the explain step is panel-local (`src/panel/error-explainer-view.ts`), so the doc names a message type that was never built. | no |
| 331 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the only `angular-ai:*` types in the sources are di-graph, di-query, error-capture, record and state; `interop.service.ts` sends no runtime message, so the doc's `angular-ai:interop` type does not exist. | no |
| 332 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `interop.component.ts:16` renders \"no interop findings\", not \"no interop nodes\"; the doc quotes text the component does not render. | no |
| 334 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": no `angular-ai:stale-view` message type exists; the scan runs in the panel through `stale-view-scan.ts`, so the doc names a channel that was never built. | no |
| 343 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the only extension copy on disk is `tmp/control-angular-devtools/extension/1.22.0` (manifest version 1.22.0), so the doc's 1.22.1 end state is not reproducible from this repository; the recorded copy is authoritative. | no |
| 366 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `control.mjs:2437-2570` adds 18 checks on the healthy path for an instance with no pin and never totals them, so \"nineteen check lines\" is a count the script does not produce. | no |
| 405 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `.commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:208,323` fires the breaker at 13 consecutive polls, so the doc's \"5 polls\" contradicts the shipped script. | no |
| 430 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": same evidence as queue row 308: `@nx/eslint` declares `^9.0.0 \|\| ^10.0.0` and the workspace runs eslint 10.13.0, so v9 is not a requirement. | no |
| 445 | accept-drift | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": the skill documents the general Nx `nx.json` schema, not this workspace's file, which carries only analytics, targetDefaults, plugins and generators; the row is tolerated and no edit is planned. | n/a (accept-drift) |
| 461 | accept-drift | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `plans/gsd-path-handoff-M018.md` is a dated handoff snapshot describing the state before M019 built; a point-in-time record is not a contract, so the row is tolerated. | n/a (accept-drift) |
| 462 | accept-drift | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": same dated handoff: its 143-document inventory was correct when written and the frozen inventory is now 144; a snapshot is not a live count. | n/a (accept-drift) |
| 465 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `.commandcode/skills/control-ai-browsers/instances.json:173` gives `edge-dev-phi4mini` port 9337 and `bench-all.sh` agrees, so the research note's 9336 is stale. | no |
| 471 | fix-doc | Delegated under the recorded grant "complete the next milestone end-to-end without a human-in-the-loop, with full milestone decision authority": `docs/filing-ledger.md:200,210,220` (items 8, 9 and 10) are exactly the three observations the note says were never filed, so the status claim is stale. | no |
| 99 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 100 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 284 | .commandcode/pstack-models.md | "Free models available: poolside/laguna-s-2.1-free, reflection/beam:free, minimax/minimax-m3.1-flash:free, stealth/glyph-cluster:free" | unverifiable | fix-doc | Record the exemption: no command in this checkout reaches model availability — the Command Code model listing is the external artifact that settles it. |
| 308 | .commandcode/skills/nx-import/references/ESLINT.md | "Pin ESLint to v9 (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 313 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `vite:typecheck`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` and `git cat-file -p HEAD:package-lock.json` — neither records @nx/vite, so the default can only come from the plugin package. |
| 329 | .claude/skills/control-ai-browsers/features/error-explainer.md | "message types `angular-ai:error-capture` / `angular-ai:error-explain`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 330 | .claude/skills/control-ai-browsers/features/health-check.md | "Nineteen check lines" for `C doctor` � the count is asserted nowhere in the scripts | unverifiable | fix-doc | Settle it with `control.mjs doctor` on the counter instance — a live run prints the check lines and no script totals them. |
| 331 | .claude/skills/control-ai-browsers/features/interop.md | "`apps/angular-ai-devtools/src/app/interop.component.ts`; message types `angular-ai:interop`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 332 | .claude/skills/control-ai-browsers/features/interop.md | "Zero interop nodes renders an explicit empty state ("no interop nodes")" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 333 | .claude/skills/control-ai-browsers/features/interop.md | "the check exits 0 on `edge-dev-aion` with `nodes: 1`" | unverifiable | fix-doc | Settle it with `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` on edge-dev-aion — the check writes the run JSON the doc quotes. |
| 334 | .claude/skills/control-ai-browsers/features/stale-view.md | "`apps/angular-ai-devtools/src/app/stale-view.component.ts`; message types `angular-ai:stale-view`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 335 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "`Select damage type` and `Select contract` (under the label Policynumber) dropdowns" | unverifiable | fix-doc | Settle it with `control.mjs up --target portal` — the claim-form labels render only in a driven portal run. |
| 336 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "contract details also link to the customer details page" | unverifiable | fix-doc | Settle it with `control.mjs up --target portal` — the contract details template renders only in a driven portal run. |
| 337 | .claude/skills/control-angular-dev-app/features/ssr.md | "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | unverifiable | fix-doc | Settle it with `control.mjs up --target ssr` — the hydrated counters are read from a live dev-mode page. |
| 338 | .claude/skills/control-angular-devtools/SKILL.md | "never use the playwright-cli sessions `cb`, `ed`, `ai-cb`, `ai-ed`, `ng-dev`" | unverifiable | fix-doc | Settle it with `control.mjs info` on the sibling control-ai-browsers skill — it prints the session that skill owns. |
| 339 | .claude/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`)" | unverifiable | fix-doc | Settle it with `control.mjs panel` on the counter fixture — the scripted panel path is the only local reader of the Router Tree tab. |
| 340 | .claude/skills/control-angular-devtools/features/attach.md | "Detection result: `isAngular`, `isDebugMode` (development build), `isIvy`, `isSupportedAngularVersion` (major 12+ or 0)" | unverifiable | fix-doc | Settle it with `control.mjs attach` — a live attach prints the detection booleans. |
| 341 | .claude/skills/control-angular-devtools/features/attach.md | "Expected (measured on the counter fixture): `flag true (set at ~50 ms)` ... `backendReady at ~950 ms`" | unverifiable | fix-doc | Settle it with `control.mjs attach` — the timings come from a live attach run. |
| 342 | .claude/skills/control-angular-devtools/features/attach.md | "the popup shows `production.html`" | unverifiable | fix-doc | Settle it with `tmp/control-angular-devtools/extension/1.22.0/manifest.json` — the popup asset ships inside that packaged extension. |
| 343 | .claude/skills/control-angular-devtools/features/install.md | "End state: test: `doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 344 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected (measured): `own subscribers ...; DevTools recorded 2 change detection cycles`" | unverifiable | fix-doc | Settle it with `control.mjs coexist` — the profiler counters come from a live coexist run. |
| 345 | .claude/skills/control-angular-devtools/features/signal-graph.md | "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`, `ng.getSignalGraph` `effect, signal:count`." | unverifiable | fix-doc | Settle it with `control.mjs coexist` — the pane read and the ng.getSignalGraph read come from a driven panel plus coexist run. |
| 346 | .claude/skills/control-angular-devtools/features/signal-graph.md | "`.node-cont.kind-*` are DevTools 1.22.0 class names; re-read them from the live panel after an update." | unverifiable | fix-doc | Settle it with `control.mjs panel` — the live panel renders the kind classes. |
| 347 | .claude/skills/control-pangular-inspector/features/README.md | "App: `node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | unverifiable | fix-doc | Settle it with `control.mjs info` — `info --target portal --json` prints the derived port. |
| 348 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "`inspect-providers` ... by selector or by `token`" | unverifiable | fix-doc | Settle it with `control.mjs call` — one `call inspect-providers` with a token settles the token form. |
| 349 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "the answer starts `No signal graph for <selector>`" | unverifiable | fix-doc | Settle it with `control.mjs call` — one `call inspect-signals` prints the answer the doc quotes. |
| 350 | .claude/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | Settle it with `control.mjs call` — one `call explain-navigation` with no limit prints the default. |
| 351 | .claude/skills/control-pangular-inspector/features/navigation.md | "The sidebar entries are `div`s with `routerLink`" | unverifiable | fix-doc | Record the exemption: no command in this checkout reaches the portal templates — the portal clone is the external artifact that settles it. |
| 352 | .claude/skills/control-pangular-inspector/features/navigation.md | "the first navigation before the overlay connected shows no details" | unverifiable | fix-doc | Settle it with `control.mjs up --target portal` — the overlay behaviour needs a driven portal page. |
| 353 | .claude/skills/control-pangular-inspector/features/panel.md | "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | unverifiable | fix-doc | Settle it with `control.mjs info` — `info --target portal --json` prints the derived port the claim names. |
| 354 | .claude/skills/control-pangular-inspector/features/panel.md | "the eight tab names, `LIVE`, `Angular 22.2.2`, and `Agent` then `Read-only`" | unverifiable | fix-doc | Settle it with `control.mjs up` — one driven panel load renders the tab names. |
| 355 | .claude/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes" | unverifiable | fix-doc | Settle it with `control.mjs call` — the code is minted by a call and read from pangular.log. |
| 356 | .claude/skills/control-pangular-inspector/features/panel.md | "`find` with `Toggle Pangular` on the app page finds the button" | unverifiable | fix-doc | Settle it with `control.mjs up` — the overlay button renders only on a driven app page. |
| 357 | .claude/skills/control-pangular-inspector/features/setup.md | "`check` there exits 0 where the worktree carries it with no install (measured)" | unverifiable | fix-doc | Settle it with `control.mjs check` in the portal clone — the exit code is what the claim records. |
| 358 | .claude/skills/control-pangular-inspector/features/source-scan.md | "the stdio list of `get-routes`, `get-components`, ... `analog-*` tools" | unverifiable | fix-doc | Settle it with `control.mjs scan` — scan starts the server and prints the stdio tool list. |
| 359 | .claude/skills/control-vitest-browser-angular/features/README.md | "the tab titled Vitest Browser Runner" | unverifiable | fix-doc | Settle it with `control.mjs up` — the Vitest tab title renders only in a driven run. |
| 360 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "Tests 2 passed \| 2 skipped (4) without flags" | unverifiable | fix-doc | Settle it with `control.mjs up` — the run prints the tests line. |
| 361 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "`--filter` ... `up --hold <ms> --filter keeps the counter mounted` runs it alone (1 passed \| 3 skipped (4))" | unverifiable | fix-doc | Settle it with `control.mjs up` — the filtered hold run prints the counts. |
| 362 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`LanguageModel.availability()` ... `unavailable` in bundled mode" | unverifiable | fix-doc | Settle it with `control.mjs doctor` — doctor reads LanguageModel.availability per mode. |
| 363 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "`ng.ɵgetInjectorProviders` throws on the null injector ..." | unverifiable | fix-doc | Settle it with `control.mjs up` — a held run reads the injector providers in the frame. |
| 364 | .claude/skills/verify-ai-browsers/SKILL.md | "`check-teardown.mjs {runDir}/steps/teardown-<n>.out`" | unverifiable | fix-doc | Settle it with `~/.commandcode/skills/lars-verify/scripts/verdict.mjs` — the verdict script is the consumer that names the teardown files. |
| 365 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | `angular-ai:error-explain` | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:apps/angular-ai-devtools/src/app/extension-message.service.ts` — the message service is where a runtime type would be handled. |
| 366 | .commandcode/skills/control-ai-browsers/features/health-check.md | Exit 0 and nineteen check lines (`extension` among them) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 367 | .commandcode/skills/control-ai-browsers/features/interop.md | message types `angular-ai:interop` | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:apps/angular-ai-devtools/src/app/extension-message.service.ts` — the message service is where a runtime type would be handled. |
| 368 | .commandcode/skills/control-ai-browsers/features/stale-view.md | message types `angular-ai:stale-view` | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:apps/angular-ai-devtools/src/app/extension-message.service.ts` — the message service is where a runtime type would be handled. |
| 369 | .commandcode/skills/control-angular-dev-app/SKILL.md | "scripts/fingerprint.mjs (a byte copy of lars-create-verification, never edit it here)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/control-angular-dev-app/scripts/fingerprint.mjs` — the copy's own header names the skill it was copied from. |
| 370 | .commandcode/skills/control-angular-dev-app/features/README.md | "Portal: API on 3000, app on the derived port, 4507 for the default portal folder" | unverifiable | fix-doc | Settle it with `control.mjs info` — `info --target portal --json` prints the derived port. |
| 371 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "20 rows after a fresh API start" | unverifiable | fix-doc | Settle it with `control.mjs up --target portal` — the row count comes from a driven portal API. |
| 372 | .commandcode/skills/control-angular-dev-app/features/ssr.md | "ngDevMode.hydratedComponents 4, hydratedNodes 40" | unverifiable | fix-doc | Settle it with `control.mjs up --target ssr` — the counters need a live dev-mode page. |
| 373 | .commandcode/skills/control-angular-devtools/SKILL.md | "scripts/fingerprint.mjs (a byte copy of lars-create-verification, never edit it here)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/control-angular-devtools/scripts/fingerprint.mjs` — the copy's own header names the skill it was copied from. |
| 374 | .commandcode/skills/control-angular-devtools/features/README.md | "The panel in branded browsers (press F12, pick the Angular tab) is manual only" | unverifiable | fix-doc | Settle it with `control.mjs panel` — the scripted panel path is the only local reader, so the branded F12 path stays manual. |
| 375 | .commandcode/skills/control-angular-devtools/features/attach.md | "Detection result: isAngular, isDebugMode (development build), isIvy, isSupportedAngularVersion (major 12+ or 0)" | unverifiable | fix-doc | Settle it with `control.mjs attach` — a live attach prints the detection fields. |
| 376 | .commandcode/skills/control-angular-devtools/features/attach.md | "backendInstalled true; backendReady at ~950 ms; Angular 22.2.2" | unverifiable | fix-doc | Settle it with `control.mjs attach` — the timings come from a live attach run. |
| 377 | .commandcode/skills/control-angular-devtools/features/profiler.md | "own subscribers bothOn a 16 b 16; afterRemoveA a 16 b 32; DevTools recorded 2 change detection cycles" | unverifiable | fix-doc | Settle it with `control.mjs coexist` — the counters come from a live coexist run. |
| 378 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | ".node-cont.kind-* are DevTools 1.22.0 class names; re-read them from the live panel after an update" | unverifiable | fix-doc | Settle it with `control.mjs panel` — the live panel renders the kind classes. |
| 379 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Other kinds the counter lacks: linked-signal, child-signal-prop, resource, unknown" | unverifiable | fix-doc | Settle it with `control.mjs panel` — the kind vocabulary renders only in a live panel. |
| 380 | .commandcode/skills/control-pangular-inspector/SKILL.md | "With `--read-only`, 0.0.7 lists 46 tools" | unverifiable | fix-doc | Settle it with `control.mjs tools` — tools lists the server's tool names. |
| 381 | .commandcode/skills/control-pangular-inspector/features/README.md | "the overlay reports about 250 ms after change detection" | unverifiable | fix-doc | Settle it with `control.mjs up --target portal` — the overlay timing needs a driven portal page. |
| 382 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids (`cgg06-4`) change with every page load" | unverifiable | fix-doc | Settle it with `control.mjs call` — two `call list-pages` reads show the instance id churn. |
| 383 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "`inspect-providers` lookup path, by selector or by `token`" | unverifiable | fix-doc | Settle it with `control.mjs call` — `call inspect-providers` with a token settles the argument form. |
| 384 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | Settle it with `control.mjs call` — one `call explain-navigation` with no limit prints the default. |
| 385 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`list-routes` (12 routes, measured) and `node $S call lint-routes`" | unverifiable | fix-doc | Settle it with `control.mjs call` — `call list-routes` against the portal prints the route count. |
| 386 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`nav.route`: `inspect-route`, the current URL, document title and active route tree" | unverifiable | fix-doc | Settle it with `control.mjs call` — `call inspect-route` prints the nav.route fields. |
| 387 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`started by` appears only when the click came less than 2 s before the navigation" | unverifiable | fix-doc | Settle it with `control.mjs call` — a driven click then `call inspect-route` shows the started-by window. |
| 388 | .commandcode/skills/control-pangular-inspector/features/panel.md | "Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR & HTTP" | unverifiable | fix-doc | Settle it with `control.mjs up` — one driven dashboard load renders the tab list. |
| 389 | .commandcode/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes" | unverifiable | fix-doc | Settle it with `control.mjs call` — the code's expiry is read from pangular.log after a call. |
| 390 | .commandcode/skills/control-pangular-inspector/features/panel.md | "The dashboard source counts are 0 in this Nx workspace" | unverifiable | fix-doc | Settle it with `control.mjs components` — components prints the source counts the dashboard shows. |
| 391 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`changed` lists `package.json`, `package-lock.json`" | unverifiable | fix-doc | Settle it with `control.mjs install` — install --json prints the changed file list. |
| 392 | .commandcode/skills/control-pangular-inspector/features/setup.md | "the lockfile with insertions only (457 lines measured)" | unverifiable | fix-doc | Settle it with `control.mjs install` — install --json prints the lockfile insertion count. |
| 393 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`remove` refuses when files it does not manage are changed" | unverifiable | fix-doc | Settle it with `control.mjs remove` — remove on a dirty checkout prints the refusal. |
| 394 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "`get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`" | unverifiable | fix-doc | Settle it with `control.mjs scan` — scan starts the stdio server and prints its tool list. |
| 395 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`" | unverifiable | fix-doc | Settle it with `control.mjs scan` — a scan at the portal root shows which sourceRoots it reads. |
| 396 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "Chrome 137+ branded builds ignore `--load-extension`" | unverifiable | fix-doc | Settle it with `control.mjs doctor` — doctor reports the loaded-extension state per instance. |
| 397 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "keyed `content_isolated\|frame\|/`, `content_main\|frame\|/`" | unverifiable | fix-doc | Settle it with `control.mjs doctor` — doctor reads the injected content-script state on a driven run. |
| 398 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "In attach mode `down` uninstalls the extension" | unverifiable | fix-doc | Settle it with `control.mjs down` — an attach-mode down followed by doctor shows the uninstall. |
| 399 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`LanguageModel.availability()` is `available` in the tester iframe" | unverifiable | fix-doc | Settle it with `control.mjs doctor` — doctor reads LanguageModel.availability in the tester iframe. |
| 400 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "every `ng.*` read works on the host `<div id=rootN ng-version=22.2.2>`" | unverifiable | fix-doc | Settle it with `control.mjs up` — a held run prints the TestBed host div id and version. |
| 401 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "`ng.getInjectorProviders` throws on the null injector at the end of the resolution path" | unverifiable | fix-doc | Settle it with `control.mjs up` — the injector throw surfaces only in a held frame. |
| 402 | .commandcode/skills/link-workspace-packages/SKILL.md | "npm install @org/ui --workspace @org/app" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — the root manifest declares no workspaces field. |
| 403 | .commandcode/skills/link-workspace-packages/SKILL.md | "Symlinks appear in `<consumer>/node_modules/@org/<package>`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — no workspaces field, so no linked symlink exists to inspect. |
| 404 | .commandcode/skills/link-workspace-packages/SKILL.md | "pnpm: no hoisting (strict isolation, prevents phantom deps)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — the manifest records npm, not pnpm. |
| 405 | .commandcode/skills/monitor-ci/SKILL.md | "circuit breaker (5 polls)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 406 | .commandcode/skills/monitor-ci/SKILL.md | "`--timeout`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs` — the script falls back to 0 minutes, so the 120 default lives only in the prompt. |
| 407 | .commandcode/skills/monitor-ci/references/fix-flows.md | "`nx-cloud apply-locally <shortLink>` (sets state to `APPLIED_LOCALLY`)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — no nx-cloud dependency, so the state name is prose only. |
| 408 | .commandcode/skills/monitor-ci/references/fix-flows.md | "`git commit --allow-empty -m` with ci: rerun after rejecting throttled fixes" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/monitor-ci/references/fix-flows.md` — the message exists only in that prose. |
| 409 | .commandcode/skills/monitor-ci/references/fix-flows.md | "Spawn FETCH_HEAVY subagent for `selfHealingSkipMessage`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/monitor-ci/references/fix-flows.md` — the message exists only in that prose. |
| 410 | .commandcode/skills/nx-cloud-api/SKILL.md | "npx nx-cloud api, the read-only Nx Cloud Public API command" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 411 | .commandcode/skills/nx-cloud-api/SKILL.md | "with `-i` or `NX_VERBOSE_LOGGING`" extra stderr records | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 412 | .commandcode/skills/nx-cloud-api/SKILL.md | "`--page-size` (which sets `limit`, max 500)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 413 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "npx nx-cloud api task-stats -f dateAfter=... -f percentiles=50 --pages 3 -o" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 414 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "A non-null `nextCursor` means the range is incomplete" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 415 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 416 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 417 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Nx Cloud log and report assets are compressed binary payloads" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 418 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "If `cacheEnabled: false`, that run did not use the Nx task cache" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 419 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "Arrange one same-session wake only when a known task is non-terminal" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 420 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Download the exact task-row artifact link with `npx nx-cloud api <link> -o <private-file>.tar.gz`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 421 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "If the artifact is encrypted, decrypt a copy with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 422 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Byte-identical malformed downloads across retries support a persistent bad cache object" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 423 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "The API cannot identify an upload path, writer, storage event, or service mutation" | unverifiable | fix-doc | Record the exemption: no command in this checkout reaches the live Nx Cloud API schema — a live Nx Cloud response is the external artifact that settles it. |
| 424 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 425 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Download the exact row-provided link with `npx nx-cloud api <link> -o <private-file>.tar.gz`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 426 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "A downloaded asset proves only that it resolves now. A 404 does not prove that it never existed" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 427 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 428 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "the public API has no separate workflow routes" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 429 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "inspect `CODEOWNERS` and project ownership metadata at the recorded commit" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md` and `node_modules/nx/package.json` — the doc is the claim's only source and the installed Nx package records no nx-cloud client. |
| 430 | .commandcode/skills/nx-import/SKILL.md | "Pin ESLint to v9 (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 431 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:nx.json` — the workspace registers only @nx/playwright/plugin, so no lint inference exists here. |
| 432 | .commandcode/skills/nx-import/references/ESLINT.md | "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-import/references/ESLINT.md` — the doc is the only local source; an import run would settle the offer. |
| 433 | .commandcode/skills/nx-import/references/ESLINT.md | "`typescript-eslint@7.x` declares peerDependencies: { eslint: ^8.56.0 }" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package-lock.json` — no typescript-eslint v7 entry, so the published manifest is the only source. |
| 434 | .commandcode/skills/nx-import/references/GRADLE.md | "The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — no @nx/gradle dependency is listed. |
| 435 | .commandcode/skills/nx-import/references/GRADLE.md | "files like `gradlew`, `gradlew.bat`, and `gradle/wrapper`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — no Gradle files exist, so nothing local confirms the layout. |
| 436 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:nx.json` — no jest plugin is registered. |
| 437 | .commandcode/skills/nx-import/references/JEST.md | "Both `@nx/jest/plugin` and `@nx/vite/plugin` (which infers Vitest targets) coexist without conflicts" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:nx.json` — neither plugin is registered; vitest runs through the Angular unit-test target. |
| 438 | .commandcode/skills/nx-import/references/JEST.md | "`ciTargetName`: `test-ci` ... creates `test-ci--src/lib/foo.spec.ts` targets" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:nx.json` — no jest plugin, so the ciTargetName shape has no local instance. |
| 439 | .commandcode/skills/nx-import/references/JEST.md | "Jest vs Vitest coexistence" across config files | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:nx.json` — no jest plugin is registered to coexist. |
| 440 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:nx.json` — only @nx/playwright/plugin is registered. |
| 441 | .commandcode/skills/nx-import/references/NEXT.md | "No separate typecheck target - Next.js runs TypeScript checking as part of `next build`" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:nx.json` — no @nx/next plugin is registered. |
| 442 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next:init` rewrites all npm scripts (Whole-Repo Import)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — no @nx/next dependency is listed. |
| 443 | .commandcode/skills/nx-import/references/VITE.md | "React Router 7 outputs to `build/` (not `dist/`)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package.json` — no react-router dependency, so no build output can be inspected. |
| 444 | .commandcode/skills/nx-import/references/VITE.md | "Vite 6 to 7: Typecheck fails (`Plugin<any>` type mismatch)" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:package-lock.json` — the lock records the installed Vite range, not the 6-to-7 upgrade. |
| 445 | .commandcode/skills/nx-workspace/SKILL.md | Key nx.json sections: targetDefaults, namedInputs, plugins | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 446 | .commandcode/skills/nx-workspace/SKILL.md | nx sync then nx reset if sync does not fix stale cache | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-workspace/SKILL.md` — the doc is the only local source; a captured sync run would settle the exit code. |
| 447 | .commandcode/skills/nx-workspace/references/AFFECTED.md | Affected excluding e2e projects --exclude=*-e2e | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/skills/nx-workspace/references/AFFECTED.md` — the doc is the only local source; a captured affected run would settle the exclude option. |
| 448 | .commandcode/skills/verify-pangular-inspector/SKILL.md | The setup steps need ports 3000 and 9999 free (both fixed) | unverifiable | fix-doc | Settle it with `control.mjs doctor` — doctor reports the fixed ports it needs. |
| 449 | .commandcode/taste/communication/taste.md | "provideAiDevTools() not provideAiDevtools()" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 450 | .commandcode/taste/design/taste.md | "Companion-package naming: provideAiDevTools() with per-package secondary entry points" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 451 | .commandcode/taste/workflow/taste.md | "AFK mode runs with a 4-agent cap" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:.commandcode/taste/workflow/taste.md` — the cap is recorded only in that taste line, with no setting in this checkout. |
| 452 | docs/afk-run-2026-10-12.md | The lars-create-control-skill contract (references/generated-skill.md) | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:docs/afk-run-2026-10-12.md` — the run log is the only local record of where the contract lives. |
| 453 | docs/afk-run-2026-10-12.md | Briefs: .audit/maintain-brief.md, .audit/ai-browsers-rework.md | unverifiable | fix-doc | Settle it with `git cat-file -e HEAD:.audit/maintain-brief.md` — an existence read at HEAD settles whether the briefs were ever committed. |
| 454 | docs/afk-run-2026-10-12.md | Tree clean: git status shows nothing but ignored paths | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:docs/afk-run-2026-10-12.md` — the run log is the only record of that tree state. |
| 456 | docs/design/tutor.md | All tutor state is in chrome.storage.local, written by the panel | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 457 | docs/design/tutor.md | /contract/list (47 components, repeated classes) | unverifiable | fix-doc | Settle it with `control.mjs up --target portal` — the portal clone must serve /contract/list before its components can be counted. |
| 458 | docs/feature-proposals.md | The project publishes a companion npm package ... globalThis.ngAiDevTools = { ... } | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 459 | docs/feature-proposals.md | The primary entry point provideAiDevTools() adds version and rule tables | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 460 | plans/angular-ai-devtools-program-backlog.md | Generation: at most 12 entries, fully specified | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:plans/angular-ai-devtools-program-backlog.md` — the planning rule is prose; its milestone rows are what could settle the count. |
| 461 | plans/gsd-path-handoff-M018.md | The next milestone, M019 context-and-jobs, is prepared to plan/done on gsd-path/M019 and is ready for build | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 462 | plans/gsd-path-handoff-M018.md | Frozen inventory: 143 documents | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 463 | plans/gsd-path-handoff-M018.md | isolation.py isolate-verify requires --repo --base --name, and --base must be a full 40-character SHA | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:plans/gsd-path-handoff-M018.md` — the handoff is the only local record; the user-scope isolation.py argv parsing would settle it. |
| 464 | references/ai-browsers-verification.md | Check that port 9992 is free | unverifiable | fix-doc | Settle it with `control.mjs info` — the session port list shows whether 9992 is in use. |
| 465 | research/00-browser-probe.md | "`.browsers/edge-dev-phi4mini` port 9336" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 466 | research/01-built-in-ai-apis.md | "Angular ships `provideExperimentalWebMcpTools`" | unverifiable | fix-doc | Record the exemption: no command in this checkout reaches the Angular package — the Angular release notes are the external artifact that settles it. |
| 467 | research/09-nano-tool-session-error.md | "The message is `kExceptionMessageUnableToCreateSession` in exception_helpers.cc#L68-L70" | unverifiable | fix-doc | Record the exemption: no command in this checkout reaches the Chromium source at tag 156.0.8078.17 — that source checkout is the external artifact that settles it. |
| 468 | research/10-model-capabilities.md | "spikes/probes/bench/nano.json and spikes/probes/bench.js:62" | unverifiable | fix-doc | Settle it with `git cat-file -p HEAD:research/raw/bench/nano.json` — that file holds the figures; the cited spikes/probes/bench/nano.json does not exist. |
| 469 | research/10-model-capabilities.md | "Chrome and Edge both ship llguidance, a grammar-constrained decoder" | unverifiable | fix-doc | Record the exemption: no command in this checkout reaches the Chromium and Edge builds — the recorded build reads are the external artifact that settles it. |
| 470 | research/12-legacy-vs-modern-angular.md | "spike main.js:n = spikes/ng222-app/dist/ng222-app/browser/main.js line n in this repo" | unverifiable | fix-doc | Settle it with `npx nx run angular-ai-devtools:build` — the bundle has to be rebuilt before its ngDevMode lines can be counted. |
| 471 | research/14-ai-devtools-prior-art.md | "these are not added to docs/filing-ledger.md" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 472 | research/18-edge-prevent-auto-signin.md | "For a single ad-hoc launch with no persistence/account, use --guest or --bwsi" | unverifiable | fix-doc | Settle it with `control.mjs up` — a launch with the switch on a throwaway profile shows whether the account stays signed out. |
| 473 | research/18-edge-prevent-auto-signin.md | "apply the policies via the Windows Registry (HKCU or HKLM) under SOFTWARE\Policies\Microsoft\Edge" | unverifiable | fix-doc | Record the exemption: no command in this checkout reaches the Windows registry — an exported registry key set is the external artifact that settles it. |
