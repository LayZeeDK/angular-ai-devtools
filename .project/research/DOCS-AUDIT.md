# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-01
Audited HEAD: 3fb21f14db4325eb3568ac56e46697e42522e6c5
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 583 |
| stale | 17 |
| aspirational | 6 |
| unverifiable | 106 |
| descriptive docs (no testable claims) | 1 |

## Doc: .claude/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | structure | verified | .claude/skills/control-ai-browsers/instances.json:67-230 — five entries: chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano |
| "`edge-dev-aion` \| Edge Dev 157 \| 9335 \| `Aion-1.1-Instruct`" with contextWindow 7,168 | config | verified | instances.json:133-169 — port 9335, model.name Aion-1.1-Instruct, contextWindow 7168 |
| "`chrome-stable-nano` \| Chrome stable 156 \| 9338" | config | verified | instances.json:199-201 — port 9338, browser chrome-stable |
| "`9600 + 10 * slot + index` ... 10 slots in all" | feature | verified | scripts/control.mjs:449 — `return slot === 0 ? mainPort : 9600 + 10 * slot + index;`; control.mjs:125 `const SLOT_TRIES = 10;` |
| "`edge-dev-aion` therefore launches with `--disable-component-update`" | config | verified | instances.json:148-150 — instances.edge-dev-aion.args holds "--disable-component-update" |
| "Every other script has a `node:test` file beside it (`*.test.mjs`); `npm test` at the repository root runs them" | command | verified | package.json:9 — test script runs node --test "scripts/**/*.test.mjs" then npm run test:skills |

## Doc: .claude/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C` below stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`" | command | verified | .claude/skills/control-ai-browsers/scripts/control.mjs exists and exposes the commands the recipes call (control.mjs:3024 usage line lists instances, up, attach, detach, doctor, flags, model, run, panel, down, bench, info) |
| "Each feature file starts with an H1 and one paragraph of behaviour, then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`" | structure | verified | all ten docs in features/ carry exactly those four H2s in that order — e.g. instances.md:7,15,23,39 and health-check.md:7,21,26,41 |
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | instances.json:70,101,135,173,201 — ports 9333, 9334, 9335, 9337, 9338 in that order |
| "Its session is `ai-<instance>-<port>`; read it from `C info <instance> --json` (`session`)" | feature | verified | scripts/control.mjs:463-471 — "The playwright-cli session of an instance on a port: `ai-<name>-<port>`" and `return `ai-${name}-${port}`;` |
| The Features list names ten feature files, each present | structure | verified | .claude/skills/control-ai-browsers/features/ holds exactly ten feature docs beside README.md (di-doctor, error-explainer, extension-panel, health-check, instances, interop, model-lifecycle, probes, signal-provenance, stale-view) |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | all three files exist in apps/angular-ai-devtools/src/app/ |
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`)" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 — `chrome?.runtime?.sendMessage({ type: 'angular-ai:di-query', componentName, elementTag })` |
| "receives `angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | di-doctor.service.ts:17 — `if (m?.type === 'angular-ai:di-graph' && m.resolutionPath)` |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | verified | apps/angular-ai-devtools/project.json:52 — `"build-extension"` target; extension/panel/ exists with index.html, main.js and styles.css |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | command | verified | .claude/skills/verify-ai-browsers/checks/di-doctor.mjs and di-doctor.test.mjs exist |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C panel <name> --url=http://localhost:4222/ --feature=error-explainer`" | command | verified | scripts/panel.mjs:239 — `const isErrors = feature === 'error-explainer' \|\| feature === 'errors';` |
| "The panel sends the error code, the owning component name and the matching digest entry" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:65 — handles `angular-ai:error-capture` |
| "Implementation: `apps/angular-ai-devtools/src/app/error-explainer.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts exists; it is the only error-explainer component in that folder |
| "The proof across every pair is `verify-ai-browsers/checks/error-explainer.mjs`" | command | verified | .claude/skills/verify-ai-browsers/checks/error-explainer.mjs and error-explainer.test.mjs exist |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Branded Chrome ignores `--load-extension`, so every instance starts through `scripts/pipe-keeper.mjs`" | feature | verified | scripts/control.mjs:123 — `const KEEPER = join(SKILL_DIR, 'scripts', 'pipe-keeper.mjs');`; control.mjs:543 comment: an instance with an extension starts through pipe-keeper.mjs, which loads it over the pipe |
| "DevTools 157 keys extension panels as `extension-panel-<uuid>_<n>`" | integration | verified | scripts/panel.mjs:51 comment and panel.mjs:57 — `keys.find((k) => k.startsWith('extension-panel-'))` |
| "`index.html` with `<base href="/panel/">`" | structure | verified | extension/panel/index.html — contains `<base href="/panel/">` as the built panel entry |
| "`C panel <name> --url=http://localhost:4222/`" | command | verified | scripts/control.mjs:2295 — panel requires `--url=<an Angular app page, e.g. the counter fixture of control-angular-dev-app>` |
| "Run `verify-ai-browsers/checks/extension-panel.mjs --evidence <dir> --url <app>`" | command | verified | .claude/skills/verify-ai-browsers/checks/extension-panel.mjs and extension-panel.test.mjs exist in the skill |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "A web page on an https origin calls the APIs; `about:blank` has none of them" | feature | verified | scripts/control.mjs:131 — `const PROBE_ORIGIN = 'https://example.org/';` is the origin every command opens tabs on |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | verified | scripts/control.mjs:1372 reports `typeof document.modelContext` and `typeof navigator.modelContext`; :1439 `pass: typeof document.modelContext === 'object'` |
| "Edge Dev 157.0.4329 requires `callId` on `LanguageModelToolSuccess`; the canary sends `callID` and `callId`" | integration | verified | scripts/control.mjs:1427-1430 — comment "Chrome Beta 156 reads callID; Edge Dev 157.0.4329 requires callId" and `new LanguageModelToolSuccess({ callID: id, callId: id, ... })` |
| "Doctor skips the page canaries when the model is not `available`" | status | verified | scripts/control.mjs:2548-2549 — model.contextWindow, canary.structured, canary.tools and canary.webmcp are added as `skipped: LanguageModel is <avail>` |
| "`canary.tools` is `[SKIP]`" for Nano | status | verified | instances.json:95 — chrome-beta-nano model.toolCanary is false |
| "Phi-4-mini ... `canary.tools` is reported only for it" | status | verified | instances.json:195 — edge-phi4mini `"toolCanary": "report"`; control.mjs:2563 passes `{ reportedOnly: true }` |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a separate browser process with its own profile under `.browsers\<name>`" | config | verified | instances.json:2 — `"profilesRoot": ".browsers"` |
| "`C flags edge-dev-aion` ... `[OK]` with the nine Aion features" | status | verified | instances.json:137-147 — the edge-dev-aion features array holds nine entries (AIPromptAPI, AIPromptAPIStructuredOutput, AIPromptAPIToolUse, AIRewriterAPI, AISummarizationAPI, AIWriterAPI, WebMCP, msEdgeLLMOnDeviceModelMuffinToolUseWorkaround, msEdgeLLMOnDeviceModelPrerelease) |
| "`--backend=cpu` on Edge is refused: forcing CPU deleted the installed model twice" | feature | verified | instances.json:156-160 and :184-188 — both Edge entries have `"cpu": null`, so no CPU backend is accepted |
| "One line per instance (five)" | structure | verified | instances.json:67-230 — exactly five registry instances |
| "An entry's `args` are switches ... `edge-dev-aion` has `--disable-component-update`" | config | verified | instances.json:148-150 — edge-dev-aion carries the args array with that switch; no other instance has `args` |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C panel <name> --url=<app url> --feature=interop`" | command | verified | scripts/panel.mjs:241 — `const isInterop = feature === 'interop';`; panel.mjs:17 documents `interop` as a feature value |
| "Required panel test ids: `interop-slice` (container), `interop-node` ... `interop-limit` ... `interop-inferred`" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19-25 — `data-testid="interop-slice"`, `"interop-limit"`, `"interop-node"`, `"interop-inferred"` |
| "Implementation: `apps/angular-ai-devtools/src/app/interop.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts exists |
| "the `spikes/ng222-app` fixture at `/stale-view`, or the deferred `/stale-view-deferred` route" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 — `{ path: 'stale-view', component: StaleViewFixture }` and `{ path: 'stale-view-deferred', component: StaleViewDeferredFixture }` |
| "`verify-ai-browsers/checks/interop.mjs --evidence <dir> --url <app url> --extension <checkout>/extension`" | command | verified | .claude/skills/verify-ai-browsers/checks/interop.mjs and interop.test.mjs exist |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`OptGuideOnDeviceModel\<version>` (Nano), `OptGuideManifestModel\<hash>\<version>` (Gemma 4), `EdgeLLMOnDeviceModel\<version>` (Aion, Phi-4-mini)" | config | verified | instances.json:91 (chrome-beta-nano folders), :125 (chrome-beta-gemma4 folders), :163 (edge-dev-aion folders) |
| "the JSON holds `bytesRemoved` ... and `diskAfter`" | feature | verified | scripts/control.mjs:2883 — clear returns `{ ok, removed, bytesRemoved: ..., freeBefore, freeAfter, bytesFreed, diskAfter: diskModels(inst) }` |
| "free space minus the model's `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | instances.json:16 and :26 — chrome-beta and chrome-stable `"minFreeMib": 22528`; instances.json:41 and :60 — both Edge browsers `"minFreeMib": 20480` |
| "the folder `.commandcode/worktrees/tmp/control-ai-browsers/pins/edge-dev-aion` of the primary checkout" | structure | verified | scripts/control.mjs:901-905 — pinned copy is `join(TMP, 'pins', name)` under the primary checkout's tmp, created at control.mjs:2683 |
| "`C model init chrome-beta-nano` ... `contextWindow` 9,216" | config | verified | instances.json:94 — chrome-beta-nano model.contextWindow is 9216 |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`bench.js` hard-codes it" (the counter fixture on `http://localhost:4222`) | config | verified | spikes/probes/bench.js:4 — `await page.goto('http://localhost:4222/');` |
| "`result.q1.answer` names 42 and `result.log` lists `get_component_count` and `get_component_inputs`" | feature | verified | spikes/probes/probe10.js:7-8 — tools `get_component_count` returning `{ count: 42 }` and `get_component_inputs` |
| "`bench.js` has a 120 s per-prompt timeout" | config | verified | spikes/probes/bench.js:11 — `const PROMPT_TIMEOUT_MS = 120000;` |
| "Summarise with `node spikes/probes/bench-summary.mjs`" | command | verified | spikes/probes/bench-summary.mjs exists in the repository |
| "`bench` does not use `spikes/probes/bench-all.sh`" | structure | verified | spikes/probes/bench-all.sh exists separately from the bench command path in scripts/control.mjs, which runs bench.js |
| "`C run chrome-beta-nano spikes/probes/broker-state.js --json`" | command | verified | spikes/probes/broker-state.js exists; control.mjs:2894 usage — `run <instance> <script.js>` |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`)" | structure | verified | both paths exist at the repository root: extension/agent-main.js and src/main-world/provenance-tracer.ts |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | integration | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:57 — `} else if (msg.type === 'angular-ai:record' && msg.cycle) {` |
| "anti-pattern findings render when two snapshots differ" | feature | verified | apps/angular-ai-devtools/src/app/anti-pattern-detector.spec.ts:22-31 — cases built from `{ consumer, producer }` snapshot pairs |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" | command | verified | .claude/skills/verify-ai-browsers/checks/signal-provenance.mjs:3-6 — header states the N2 provenance flow is the claim it checks |
| "Open the panel on the instance with `C panel <name> --url=http://localhost:4222/`" | command | verified | scripts/control.mjs:2295 — `panel` refuses without `--url=<an Angular app page ...>` |
| "`angular-ai:record` facts ... reload the page so the panel records the Angular version" | feature | unverifiable | no run performed (no browser driven); what would settle it: one `verify-ai-browsers/checks/signal-provenance.mjs` run against a served counter fixture |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C panel <name> --url=http://localhost:4222/ --feature=stale-view`" | command | verified | .claude/skills/verify-ai-browsers/checks/stale-view.mjs:64 — `control(['panel', name, `--url=${url}`, '--feature=stale-view'])`; scripts/panel.mjs:240 routes it |
| "Implementation: `apps/angular-ai-devtools/src/app/stale-view.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:8-9 — the component exists with `selector: 'app-stale-view'` |
| the hedged wording "the template may show a stale value", reported with the field name and the owning component | feature | verified | stale-view.component.ts:21-23 — `data-testid="hedged"` carries that wording, with `data-testid="field-name"` and `data-testid="owning-component"` |
| "With zero findings the panel renders an explicit empty state" ("no stale-view findings") | feature | verified | stale-view.component.ts:16-17 — `@else if (scan.findings().length === 0)` renders `data-testid="empty-state"` with "no stale-view findings" |
| "Unsupported Angular versions report an explicit unsupported state; a destroyed signal graph reports unavailable" | feature | verified | stale-view.component.ts:12-15 — `data-testid="unsupported"` and `data-testid="unavailable"` ("unavailable: signal graph destroyed") |
| "message types `angular-ai:stale-view`" | integration | unverifiable | the literal string does not appear in apps/angular-ai-devtools/src/**/*.ts; what would settle it: the page-side sender or message router that builds or matches this type |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "portal api \| fixed \| 3000 \| `.claude/skills/control-angular-dev-app/scripts/control.mjs:69` keeps it at 3000" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:69` — `const PORTAL_API_PORT = 3000;` |
| "counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:82,90,100` — `at: (slot) => (slot === 0 ? 4222 : 4300 + slot)` and the 4223/4400, 4200/4500 twins |
| "counter app \| derived \| 4222" and "SSR app \| derived \| 4223" and "portal app \| derived \| 4200" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:82` — slot 0 yields 4222, `:90` 4223, `:100` 4200 |
| "portal pangular \| external \| 9999" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:701` — `const PANGULAR_PORT = 9999;` |
| "The four portal features are recorded as external" | status | verified | `.commandcode/skills/control-angular-dev-app/features/.proven.json` — portal-claims, portal-complaints-customers, portal-contracts, portal-navigation each hold an `external` reason and no `files` |
| "`npm test` at the repository root runs them and `npm run check` type-checks the scripts" | command | verified | package.json:10-12 — `test` calls `npm run test:skills`, which runs `node --experimental-strip-types --test ".claude/skills/**/*.test.mjs"`; `check` runs `tsc -p .claude/skills/tsconfig.json` |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | structure | verified | portal checkout `apps/insurance-portal/src/assets/feature-flags.manifest.json:1-17` — twelve boolean ids named after the feature files' sub-features (`claim-list`, `contract-edit`, `customer-details`, ...), all `true` |
| "Fresh page state: `count` 3, `double` 6, cart 1 item" | feature | verified | `spikes/ng222-app/src/app/counter.ts:5,17,18` — `items = signal<string[]>(['apple'])`, `count = signal(3)`, `double = computed(() => this.count() * 2)` |
| "Fresh page state: heading `Render mode: server`, `Early clicks: 0`" | feature | verified | `spikes/ng222-ssr/src/app/page.ts:10-12,26` — `<h1>Render mode: {{ mode() }}</h1>`, `Early clicks: {{ clicks() }}`, `clicks = signal(0)`; `spikes/ng222-ssr/src/app/app.routes.ts:5` supplies `data: { mode: 'server' }` |
| "each feature file" list of six (`counter`, `ssr`, `portal-navigation`, `portal-contracts`, `portal-claims`, `portal-complaints-customers`) | structure | verified | `.commandcode/skills/control-angular-dev-app/features/` holds exactly those six `.md` files beside `.proven.json` |
| "The portal's API port is fixed at 3000" | config | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs:69` — `const PORTAL_API_PORT = 3000;` |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The ng222-app page shows one line, `Clicks: 3 (double 6, cart 1)`" | feature | verified | `spikes/ng222-app/src/app/counter.ts:11,17-18` — template `<p>{{ title() }}: {{ count() }} (double {{ double() }}, cart {{ cart.items().length }})</p>` with `count = signal(3)`; `spikes/ng222-app/src/app/app.ts:8` passes `title="Clicks"` |
| "Each click raises the count by one and the doubled value follows" | feature | verified | `spikes/ng222-app/src/app/counter.ts:12,18` — `(click)="count.set(count() + 1)"` and `double = computed(() => this.count() * 2)` |
| "`src/app/app.routes.ts:5-8`, read 2026-11-01" declares `/stale-view` and `/stale-view-deferred` | structure | verified | `spikes/ng222-app/src/app/app.routes.ts:5-8` — the `routes` array holds exactly those two paths |
| "`counter-cd` the component is OnPush by default (no `changeDetection` declared)" | feature | verified | `spikes/ng222-app/src/app/counter.ts:8-14` — the `@Component` has `selector` and `template` only, no `changeDetection` |
| "an effect that copies `count` into `lastLogged`" | feature | verified | `spikes/ng222-app/src/app/counter.ts:20-24` — `lastLogged = signal(0)`; `effect(() => this.lastLogged.set(this.count()))` |
| "`router()` returns `present: true`" | feature | verified | `spikes/ng222-app/src/app/app.config.ts:8` — `provideRouter(routes)` is provided; `ng-inspect.js:127-136` reports the router globals present only for those three `ɵ` functions |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | portal `apps/api/src/claim/claim.controller.ts:16` — `@Controller('claims')`; portal `libs/shared/utils/src/lib/injection-tokens.ts:5` — `factory: () => 'http://localhost:3000/api/'` |
| "the facade drops claims whose contract or customer is missing" | feature | verified | portal `libs/claim/data-access/src/lib/facades/claim-facade.service.ts:40-45` — `const contract = contracts.find((c) => c.id === claimDto.contract); if (!contract) {` then the same lookup for the customer |
| "`claim-details` row click opens `/claim/<id>/details`, heading `Claim Details`" | feature | verified | portal `libs/claim/feature-details/src/lib/details.component.ts:29` — `<ng-journal-header title="Claim Details" />` |
| "`/claim/create` shows the heading `Complaint Create`: an app bug" | feature | verified | portal `libs/claim/feature-create/src/lib/create.component.ts:39` — `<ng-journal-header title="Complaint Create" />` inside the claim create component |
| "`claim-list` table ... 5 rows measured" | status | unverifiable | no portal run in this audit (faker data per API start); settles it: `up --target portal` plus a snapshot of `/claim/list` table rows |
| "on save it opens the new claim's details (read from source; not driven)" | integration | verified | portal `apps/api/src/claim/claim.controller.ts:30` — `@Post()` on the claims controller, the endpoint the create form posts to |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | portal `apps/api/src/complaint/complaint.controller.ts:15` — `@Controller('complaints')`; portal `apps/api/src/customer/customer.controller.ts:5` — `@Controller('customers')` |
| "`Select type` (CustomerService, Sales, Payments)" | feature | verified | portal `libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:1-4` — the `ComplaintTypeDto` enum lists `CustomerService` and `Payments`; portal `libs/complaint/ui/src/lib/complaint-form.component.ts:86` — `typeOptions = Object.values(ComplaintTypeDto)` |
| "Save sends `POST /api/complaints` (201)" | integration | verified | portal `apps/api/src/complaint/complaint.controller.ts:29` — `@Post()` under `@Controller('complaints')` |
| "`complaint-details` ... heading `Complaint Details`" | feature | verified | portal `libs/complaint/feature-details/src/lib/details.component.ts:29` — `<ng-journal-header title="Complaint Details" />` |
| "`customer-details` `/customer/<id>/details`, heading `Customer Details` (name, email, phone, Address block)" | feature | verified | portal `libs/customer/feature-details/src/lib/details.component.ts:18,40` — `<ng-journal-header title="Customer Details" />` and `<ng-journal-header title="Address" type="subtitle" />` |
| "The customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | status | verified | `research/05-spikes.md:63` — the `/customer/list` row reads `192 (80)` signal nodes, the highest maximum in the table; `:73` names 80 nodes |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at `http://localhost:3000/api/contracts`" | integration | verified | portal `apps/api/src/contract/contract.controller.ts:15` — `@Controller('contracts')`; portal `libs/shared/utils/src/lib/injection-tokens.ts:5` — base URL `http://localhost:3000/api/` |
| "`contract-details` ... heading `Contract Details` and an `Edit` button" | feature | verified | portal `libs/contract/feature-details/src/lib/details.component.ts:47` — `<ng-journal-header title="Contract Details" />`; the `feature-edit` component exists at `libs/contract/feature-edit/src/lib/edit.component.ts` |
| "`contract-edit` `Edit` opens `/contract/<id>/edit`, heading `Contract Edit`" | feature | verified | portal `libs/contract/feature-edit/src/lib/edit.component.ts:51` — `<ng-journal-header title="Contract Edit" />` |
| "then sends `PUT /api/contracts`" | integration | verified | portal `apps/api/src/contract/contract.controller.ts:29` — `@Put()` under `@Controller('contracts')` |
| "Save sends `POST /api/contracts` (201) and opens the new contract's details" | integration | verified | portal `apps/api/src/contract/contract.controller.ts:37` — `@Post()`; portal `libs/contract/feature-create/src/lib/create.component.ts:46` — `<ng-journal-header title="Contract Create" />` |
| "`contract-list` table ... 20 rows after a fresh API start" | status | unverifiable | no portal run here; faker seeds per API start — settles it: `up --target portal` and `document.querySelectorAll('table tbody tr').length` on `/contract/list` |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nav-not-found` any unknown path renders `Page Not Found`" | feature | verified | portal `apps/insurance-portal/src/app/page-not-found.component.ts:7` — template `<h1>Page Not Found</h1>` |
| "Only the sidebar group headings render upper-case (`CONTRACT`, through the `capitalize` pipe, which calls `toUpperCase`)" | feature | verified | portal `apps/insurance-portal/src/app/sidebar.component.ts:38` — `{{ config.domain \| capitalize }}`; portal `libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9` — `return value.toUpperCase();` |
| "Home tiles and sidebar entries are hidden by the `*ngJournalFeatureFlag` directive when their flag is off" | feature | verified | portal `apps/insurance-portal/src/app/sidebar.component.ts:33` — `imports: [CapitalizePipe, RouterLink, RouterLinkActive, FeatureFlagDirective]` |
| "tiles Contracts, Claims, Complaints, Customers" | feature | verified | portal `apps/insurance-portal/src/app/home.component.ts:20,53` — the tile labels `Contracts` ... `Customers` |
| "The header link goes to `https://www.ng-journal.com`" | integration | verified | portal `apps/insurance-portal/src/app/app.component.ts:20` — `href="https://www.ng-journal.com"` |
| "`nav-active` the active sidebar entry gets a highlighted background" | feature | unverifiable | no portal run here; the class binding is not in the source read (`RouterLinkActive` is imported at `sidebar.component.ts:33` but the styling binding was not inspected) |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It shows the heading `Render mode: server` (or `prerender`, `client` on the other routes)" | feature | verified | `spikes/ng222-ssr/src/app/page.ts:10` — `<h1>Render mode: {{ mode() }}</h1>`; `spikes/ng222-ssr/src/app/app.routes.ts:5-7` supply `data: { mode: 'server' \| 'prerender' \| 'client' }` |
| "`/` (`RenderMode.Server`), `/prerender` (`RenderMode.Prerender`), `/client` (`RenderMode.Client`)" | config | verified | `spikes/ng222-ssr/src/app/app.routes.server.ts:4-6` — the three `ServerRoute` entries with those render modes |
| "a list of three items fetched from `/api/items` during the server render" | integration | verified | `spikes/ng222-ssr/src/server.ts:18,21-23` — `app.get('/api/items', ...)` returning `Alpha`, `Beta`, `Gamma`; `:19` logs `[api] GET /api/items ... ua=` |
| "a click before `main.js` runs is queued in `window._ejsas` and replayed after hydration" | feature | verified | `node_modules/@angular/core/fesm2022/primitives-event-dispatch.mjs:742-743` — `if (!dataContainer._ejsas) { dataContainer._ejsas = {};`; `node_modules/@angular/core/fesm2022/core.mjs:341,416` read the queue per app id |
| "Run the spike probes `spikes/probes/ssr-event-replay.js` and `spikes/probes/ssr-render-modes.js`" | command | verified | `spikes/probes` holds both files, beside `ssr-check`-style probes `ssr-defer.js`, `ssr-hydration.js`, `ssr-transfer.js` |
| "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | status | unverifiable | no SSR run in this audit; settles it: `up --target ssr` then `ssr-check.js`, which reports the `ngDevMode` counters at `.commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:78` |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Playwright's bundled Chromium (Chrome for Testing 156.0.8078.4, revision 1248, read 2026-11-01 from `node_modules/playwright-core/browsers.json`)" | config | verified | `node_modules/playwright-core/browsers.json:5-8` — the `chromium` entry has `"revision": "1248"` and `"browserVersion": "156.0.8078.4"` |
| "the Angular DevTools browser extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | `.commandcode/skills/control-angular-devtools/scripts/control.mjs:89` — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';` |
| "session `ngdt`, CDP port 9420, profile `tmp/control-angular-devtools/profile/main`" | config | verified | `control.mjs:94` (`TMP = join(ROOT, 'tmp', 'control-angular-devtools')`), `:273` (`MAIN_CDP_PORT = 9420`), `:311` (`SESSION = flowId === 'main' ? 'ngdt' : ...`), `:313` (`PROFILE = join(TMP, 'profile', flowId)`) |
| "`panel` evaluates `Extensions.extensionServer.onShowPanel({command: 'showPanel', id: 'chrome-extension://<id>Angular'})`" | integration | verified | `control.mjs:810` — exactly that `evalIn(port, isDevtools, ... onShowPanel({ command: 'showPanel', id: PANEL_ID }))`; `PANEL_ID` built at `:90` |
| "`scripts/control.mjs <command> [options] [--json]`; exit 0 done or healthy, 1 not healthy, 2 refused" | command | verified | `control.mjs:1601` — `const COMMANDS = { install, uninstall, status, up, doctor, attach, panel, coexist, info, down }`; `:1598` prints the usage line |
| "`--di-graph` runs Angular's `angular:di_graph` tool and re-reads both: the template node disappears from both (measured)" | feature | verified | `research/05-spikes.md:123` — pane drops to 2 nodes (`count`, `effect`), `diGraphTemplateLostInPane: true`, `diGraphTemplateLostInNg: true` |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture at `spikes/ng222-app` (Angular 22.2.2)" | config | verified | `spikes/ng222-app/node_modules/@angular/core/package.json` — `"version": "22.2.2"` (declared `^22.2.0` in `spikes/ng222-app/package.json:16`) |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | config | verified | `control.mjs:94` — `const TMP = join(ROOT, 'tmp', 'control-angular-devtools')`; `.gitignore:7` — `tmp/control-angular-devtools/` |
| "App page: playwright-cli session `ngdt`" | config | verified | `control.mjs:311` — `const SESSION = flowId === 'main' ? 'ngdt' : \`ngdt-${flowId}\`` |
| "Panel: `control.mjs panel ...` and `coexist` (raw CDP into `chrome-extension://<id>/index.html`)" | integration | verified | `control.mjs:794` — `isPanel = (t) => t.url === \`chrome-extension://${EXT_ID}/index.html\``; `:1601` registers `panel` and `coexist` |
| "One file per feature" with `install.md`, `attach.md`, `signal-graph.md`, `profiler.md` | structure | verified | `.commandcode/skills/control-angular-devtools/features/` holds exactly those four `.md` files plus `README.md` and `.proven.json` |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | `control.mjs:891` — the init script traps `Object.defineProperty(window, '__NG_DEVTOOLS_CONNECTED__', ...)`; `:905` reads `flag: window.__NG_DEVTOOLS_CONNECTED__ === true` |
| "`attach` reloads the page to catch messages from the start" | feature | verified | `control.mjs:899` — `await page.reload();` inside `ATTACH_PROBE` (`:886`) after the init script is added |
| "a `detectAngular` message ... with `{isAngular, isDebugMode, isIvy, isSupportedAngularVersion, isAngularDevTools}`" | integration | verified | `control.mjs:68,1349` — the `Detection` typedef carries `isAngular`/`isDebugMode`; the attach pass condition reads `r.flag && d.isAngular && d.isDebugMode && r.backendInstalled && r.backendReady` |
| "`attach` exits 1 because it requires `isDebugMode`" | status | verified | `control.mjs:1349` — the returned boolean requires `d.isDebugMode`, so a production build fails the check |
| "flag true (set at ~50 ms); ... backendReady at ~950 ms; Angular 22.2.2" | status | unverifiable | timings are a run measurement; settles it: `node $S attach` against `up --target counter` (fixture resolves Angular 22.2.2, `spikes/ng222-app/node_modules/@angular/core/package.json`) |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (`ienfalfjdbdpebioblfackkekamfmbnh`)" | config | verified | `control.mjs:89` — `const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';`; `:91` — `STORE_URL = https://chromewebstore.google.com/detail/${EXT_ID}` |
| "`node $S install` # test copy from Edge Dev (read only)" | command | verified | `control.mjs:106` — the `edge-dev` browser entry resolves `join(LOCAL, 'Microsoft', 'Edge Dev', 'User Data')`, the copy source named in the SKILL |
| "opens the store page, polls for Lars's click (default 180 s)" | config | verified | `control.mjs:1019,1024,1027` — polls every 2 s for `Number(opts.timeout ?? 180) * 1000`, the default 180 s |
| "A test `uninstall` refuses while `up` runs (`down` first)" | status | verified | `control.mjs:1095,1112,1135` — `cmdUninstall` starts with `if (readState()) {` and refuses while a state file exists |
| "`chrome://` and `edge://` URLs passed on the command line open an empty window instead of the page ..., which is why `uninstall` opens the store page" | integration | verified | `control.mjs:1079` — the log reads "a browser will not open ${before.extensionsPage} from the command line" and opens `STORE_URL` instead |
| "End state: test: `doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | status | unverifiable | the version lives in the Edge Dev profile copy outside this repository; the in-repo `extension/manifest.json:4` is this project's own "Angular AI DevTools" 0.3.0. Settles it: `node $S install && node $S doctor` |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | `control.mjs:1463` — two `ng.ɵsetProfiler(() => ...)` calls are installed side by side and `:1465` reads both counters |
| "remove your own with the function `ɵsetProfiler(cb)` returns" | feature | verified | `control.mjs:1463,1465` — `window.__ngdtRemoveA = ng.ɵsetProfiler(() => ...)` then `window.__ngdtRemoveA()` |
| "the result reads `Change detection cycles`" | feature | verified | `control.mjs:832` — `profilerSummary` matches `/Change detection cycles[\s\S]*?(\d+)\s*\/\s*(\d+)/` in the panel text and returns `cycles` |
| "Expected (measured): `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles`" | status | unverifiable | a run measurement; settles it: `node $S coexist` on the counter fixture, which writes `coexist.json` (`control.mjs:1532`) |
| "`ng.ɵsetProfiler(null)` clears every subscriber, DevTools' included" | feature | unverifiable | the profiler's subscriber list is Angular's own source (`render3/profiler.ts`), not present in `node_modules/@angular/core/fesm2022/core.mjs`; settles it: that Angular source file or a `coexist` probe that calls `ɵsetProfiler(null)` |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.node-cont.kind-*` are DevTools 1.22.0 class names" | config | verified | `control.mjs:830` — `readSignalGraph` queries `ng-signal-graph-pane .node-cont` and takes the class starting with `kind-` as the node kind |
| "Expected on the fixture before: `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`" | feature | verified | `spikes/ng222-app/src/app/counter.ts:5,16-18` — `selector: 'app-counter'`, inputs/signals `title`, `count`, `double`, `items` (the `CartService` signal) |
| "After `angular:di_graph` (measured 2026-10-11): pane `signal:count, effect:Effect`" | status | verified | `research/05-spikes.md:123` — the pane drops to 2 nodes (`count`, `effect`), `diGraphTemplateLostInPane: true` |
| "`--di-graph` leaves the page's signal graph broken until reload" | status | verified | `research/05-spikes.md:123` — `angular:di_graph` "degrades Angular DevTools for the rest of the page's life" |
| "`node $S panel signal-graph --component=app-counter`" | command | verified | `control.mjs:1598` — usage line `coexist [--component app-counter] ...`; `:110` — `component` is a value flag; `:1601` — `panel` is a command |
| "Agreement with `ng.ɵgetSignalGraph(ng.getInjector(host))`, which the pane's backend calls" | integration | unverifiable | the pane's backend is Angular DevTools' own bundle, not in this repository; settles it: `signals-visualizer.ts` from the extension source or a panel-vs-`ng` comparison in `coexist` |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `.claude/skills/control-pangular-inspector/scripts/control.mjs:74` defaults to 9999 | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:74 — `const DEFAULT_PORT = 9999` |
| The state file is per port (`tmp/control-pangular-inspector/state/pangular-<port>.json`) | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1009 — the state file name is `pangular-${p}.json` under STATE_DIR |
| `tools/list` holds none of the eight action tools (`highlight`, `navigate`, ... `analog-call-api`) | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:76 — ACTION_TOOLS names exactly those 8 tools, and the doctor read-only check filters on them at line 608 |
| It runs `bin.mjs dev --port 9999 --no-open --root <app> --read-only` | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1061 — spawn args are bin, dev, --port, --no-open, --root, dir, then --read-only when not --allow-actions |
| npm 11.16 drops 27 entries from the committed lockfile on any install | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:850 — comment records the 27 lockfile entries npm 11 drops, which install puts back |
| With `--read-only`, 0.0.7 lists 46 tools | status | unverifiable | no `@pangular-inspector/devtools` install or live server in this checkout; `node $S tools` against 0.0.7 would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Each feature file starts with an H1 and one paragraph, then four H2s in this order: Sub-features, How to get to it (user POV), Driving it with control-pangular-inspector, Gotchas | structure | verified | .claude/skills/control-pangular-inspector/features/setup.md:6,14,19,36 — the four H2s in that order; live-inspection.md, navigation.md, panel.md and source-scan.md carry the same four at lines 6/13-14/18-20/30-36 |
| Tool names are literal and given without the `pangular_` prefix | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:608 — short() strips the pangular_ prefix before matching a tool name |
| The app is driven like a user in playwright-cli session `pangular-9999` | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — state.session is `pangular-${p}` with the default port 9999 from line 74 |
| The overlay reports about 250 ms after change detection | status | unverifiable | an overlay timing on the portal, outside this repository; an instrumented portal run would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `list-pages` shows the tab page id, URL and the inspectors that report | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1422 — the doctor calls the list-pages tool, and line 1432 matches its page id against it |
| MCP over HTTP at `http://localhost:9999/__mcp` | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1074 — mcpUrl is `http://localhost:${p}/__mcp` with p defaulting to 9999 (line 74) |
| a row whose id equals `window.__pangularPageId` | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1396 — the doctor evaluates `window.__pangularPageId` and compares it at line 1432 |
| `inspect-component` for one host tag | command | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:42 — runs `call inspect-component` with the `ng-journal-list` selector args |
| `inspect-signals` answers from the graph the page last reported | status | unverifiable | a Pangular 0.0.7 server behavior; no installed package or saved MCP answer in this checkout |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Explain: `node $S call explain-navigation` | command | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:47 — runs `call explain-navigation` with a limit argument and holds /contract/list plus succeeded |
| `limit` on `explain-navigation` defaults to 5 (at most 50) | config | unverifiable | a Pangular 0.0.7 server default, not in this checkout; a `call explain-navigation` with no `--args` against a running server would settle it |
| Routes: `node $S call list-routes` (12 routes, measured) | status | unverifiable | the route count belongs to the portal checkout, outside this repository; one live `call list-routes` would settle it |
| `started by` appears only when the click came less than 2 s before the navigation | status | unverifiable | Pangular overlay timing; needs a timed navigation on a running portal and its explain-navigation answer |
| A reload keeps the page id (it lives in `sessionStorage`) | status | unverifiable | overlay behavior of the pinned package; a reload in the playwright-cli session would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `http://localhost:4507/__pangular/` (through the `ng serve` proxy) | integration | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:535 — install merges a `/__pangular` proxy entry with the server target, pathRewrite stripping the prefix and ws: true |
| the eight panel tabs: Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR and HTTP | feature | unverifiable | the panel markup ships inside `@pangular-inspector/devtools`, which is not installed in this checkout; loading the panel URL would settle it |
| the floating button has the accessible name `Toggle Pangular Inspector` | feature | unverifiable | overlay button text lives in the pinned package; a playwright-cli `find` on the app page would settle it |
| A code expires after 5 minutes | status | unverifiable | server-side code lifetime in Pangular; a `pangular.log` timestamp pair would settle it |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies` | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:72-73 — PKG is @pangular-inspector/devtools and PINNED is 0.0.7, installed with --save-dev --save-exact at line 911 |
| `install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target | feature | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:402 — the app finder accepts the first project.json whose serve executor is @angular/build:dev-server (documented at line 388) |
| npm 11 rewrites this lockfile on any install | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:850 — the code records that npm 11 drops 27 lockfile entries on any install, with or without Pangular |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `scan <tool>`, which starts that server, calls one tool and stops it | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1493 — spawns `bin mcp --root <root> --read-only` over stdio pipes for one call, then kills it |
| Results with `--out` land in `tmp/control-pangular-inspector/scan/` | config | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:1540 — savedTo is path.join(SCRATCH, scan), SCRATCH being tmp/control-pangular-inspector at line 70 |
| `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta` | feature | unverifiable | the stdio tool list comes from the uninstalled package; `node $S scan nope` against an installed 0.0.7 would settle it |
| The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src` | status | unverifiable | Pangular scan behavior; only the portal measurements are recordings of it, and no scan output is kept in this checkout |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| The main checkout uses slot 0, the defaults 51315 and 9350 | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:99-100 — MAIN_VITEST_PORT = 51315 and MAIN_BUNDLED_CDP_PORT = 9350 |
| The playwright-cli session is `control-vitest-<flowId>-<Vitest port>` | config | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:899 — session is `control-vitest-${flowId}-${vitestPort}` |
| `--hold <ms>` sets `VITE_COUNTER_HOLD_MS` | command | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:586 — env VITE_COUNTER_HOLD_MS is set from the recorded hold |
| the `attach` configuration loads `vitest-attach.config.mts`, a custom provider that calls `chromium.connectOverCDP(VITEST_CDP_URL)` | integration | verified | spikes/ng222-app/vitest-attach.config.mts:19 — chromium.connectOverCDP(cdpUrl), cdpUrl read from VITEST_CDP_URL at line 11 |
| `vitest-attach.config.mts` sets `persistentContext` to `browser.contexts()[0]` | config | verified | spikes/ng222-app/vitest-attach.config.mts:20 — this.persistentContext ??= this.browser.contexts()[0] |
| `mounted-component` a `[ng-version]` host exists now; `[WARN]` when no test is running | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1146 — the check passes on a [ng-version] host and warns with no test running |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Fresh state of the held Counter: Clicks: 3 (double 6, cart 2) | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:34 — the override test asserts that text, and the hold test at line 56 calls setup with cartItems pear and plum at line 61 |
| Each feature file has an H1, one paragraph of user-visible behaviour, then four H2s in order: Sub-features, How to get to it (user POV), Driving it with control-vitest-browser-angular, Gotchas | structure | verified | .claude/skills/control-vitest-browser-angular/features/counter-tests.md:9,17,23,40 — same four H2s in held-counter.md (8,19,23,43) and extension-in-tester.md (8,18,23,39) |
| `mounted-component` passes only while the hold test runs | feature | verified | .claude/skills/control-vitest-browser-angular/scripts/control.mjs:1146 — the check warns with no running test and passes on a [ng-version] host |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| Two tests always run: an Increment click moves Clicks: 3 (double 6, cart 1) to Clicks: 4 (double 8, cart 1) | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:23,27 — toHaveTextContent before and after incrementButton.click() |
| a `CartService` override shows cart 2 | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:34 — Clicks: 3 (double 6, cart 2) under the overridden CartService |
| with `VITE_COUNTER_TIMING_DEMO=1` one test fails with expected ... to contain Clicks: 4 | status | verified | spikes/ng222-app/src/app/counter.spec.ts:39,49 — it.runIf on that variable, then expect(paragraph.textContent).toContain(Clicks: 4) in the same task as the click |
| with `VITE_COUNTER_HOLD_MS=<ms>` the hold test passes after the hold | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:56 — it.runIf(Number(VITE_COUNTER_HOLD_MS) > 0) with a timeout of the hold plus 30 s |
| results show in `<evidenceDir>/ng-test.log`, not in the page (`ui: false`) | config | verified | spikes/ng222-app/vitest-attach.config.mts:55 — ui: false, matched in vitest-extension.config.mts:34 |
| the builder `--filter` matches test names, but the hold test runs only with `--hold` | command | unverifiable | the filter is applied by the Angular Vitest builder, not by this checkout; the hold test title at counter.spec.ts:57 and a run with --filter would settle the 1 passed / 3 skipped counts |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `spikes/s1-extension` was retired in M009; its evidence and archived notes live under `.project/archive/001-run-unrun-spikes/` | status | verified | D:\projects\sandbox\angular-ai-devtools\.project\archive\001-run-unrun-spikes exists and spikes/s1-extension does not (Test-Path over the checkout) |
| the DevTools panel `chrome.devtools.inspectedWindow.eval` with `{ frameURL: <tester URL> }` reaches `window.ng` in the tester | feature | unverifiable | needs a spike run over CDP; spikes/probes/vitest-attach.mjs is the harness that would record panelInspectedWindowTester |
| In attach mode `down` uninstalls the extension | status | unverifiable | no run recorded in this checkout; `node $S down` after an `up --extension s1-vitest` and its log line would settle it |
| The isolated world sees `typeof window.ng === undefined`; only the MAIN world sees `ng` | status | unverifiable | extension world isolation is browser behavior; an eval in each world of the tester iframe would settle it |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the hold test renders `Counter` in the tester iframe with `CartService` overridden to pear and plum | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:58 — setup({ cartItems: [pear, plum] }) inside the hold test |
| It keeps it mounted, clicks Increment once halfway, and checks that the count rose by one | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:62-70 — a holdMs/2 wait, one incrementButton.click(), then the next = countBefore + 1 assertion |
| Clicks by the agent after the test halfway click do not affect its expectation | status | verified | spikes/ng222-app/src/app/counter.spec.ts:63,67 — countBefore is read immediately before the test own click, so later agent clicks are not counted |
| `<app-counter>` does not exist under TestBed; select `[ng-version]` | status | verified | spikes/ng222-app/src/app/counter.ts:9 — the component selector is app-counter, while the host found in the page is [ng-version] (control.mjs:1146 and spikes/ng222-app/src/app/counter.spec.ts) |
| every `ng.*` read works on the host `<div id=rootN ng-version=22.2.2>` | config | unverifiable | the version comes from the installed @angular/core; spikes/ng222-app/package.json declares ^22.2.0 and @angular/build ^22.2.2, so 22.2.2 is not pinned here |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| eight checks: `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` | structure | verified | .claude/skills/verify-ai-browsers/checks holds exactly those eight .mjs files with a .test.mjs beside each (state.mjs, model-init.mjs, extension-panel.mjs, signal-provenance.mjs, di-doctor.mjs, error-explainer.mjs, stale-view.mjs, interop.mjs); each states its claim in a line-2 `// Claim:` comment, e.g. interop.mjs:2 |
| condition `node .commandcode/skills/verify-ai-browsers/checks/state.mjs` | command | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs exists and is byte-identical to its .claude counterpart (fc /b exit 0, 9955 bytes each) |
| `state` records each instance in `state.json`; `model-init` in `model-init.json`; `extension-panel` in `extension-panel.json`; `error-explainer` in `error-explainer.json` | config | verified | state.mjs:205, model-init.mjs:43, extension-panel.mjs:97 and error-explainer.mjs:108 — each writes that file into the evidence directory |
| its `instances.json` is the registry both skills read | integration | verified | .claude/skills/verify-ai-browsers/checks/state.mjs:267 — reads control-ai-browsers/instances.json, and line 92 rejects an entry without model.name and model.contextWindow |
| `edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three | status | unverifiable | a recorded observation of 2026-10-12; no doctor output for that instance is kept in this checkout, so a fresh `doctor` run would settle it |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| checks `extension-enabled`, `attached`, `coexist` | structure | verified | .claude/skills/verify-angular-devtools/checks holds extension-enabled.mjs, attached.mjs and coexist.mjs, each with a .test.mjs beside it, and each states its claim in a line-2 `// Claim:` comment (extension-enabled.mjs:2, attached.mjs:2, coexist.mjs:2) |
| `coexist-result.json` is the coexist artifact | config | verified | .claude/skills/verify-angular-devtools/checks/coexist.mjs:70 — writes coexist-result.json with exit, parts and diGraph into the out dir |
| the handshake and Angular version are saved in `attach.json`, not judged | config | verified | .claude/skills/verify-angular-devtools/checks/attached.mjs:6 — header comment states attach.json holds handshake and version and is not judged |
| `~/.claude/skills/lars-verify/references/contract.md` is the run contract | integration | verified | C:\Users\LarsGyrupBrinkNielse\.claude\skills\lars-verify\references\contract.md exists (Test-Path); note verify-ai-browsers cites the same contract under ~/.commandcode, so the two docs name different homes |
| `coexist --di-graph` leaves the page signal graph broken until reload | status | unverifiable | a recorded behavior of control-angular-devtools coexist; one `coexist --di-graph` run and a reload would settle it |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `setup` writes the artifact `setup-check.json` | config | verified | .claude/skills/verify-pangular-inspector/checks/setup.mjs:65 — writes setup-check.json with the check exit and result |
| `live-reads` artifacts are `contract-list.png` and `live-reads.json` | config | verified | .claude/skills/verify-pangular-inspector/checks/live-reads.mjs:127 saves the screenshot as contract-list.png and line 150 saves live-reads.json |
| `read-only` artifacts are `tools-list.json` and `navigate-refused.json` | config | verified | .claude/skills/verify-pangular-inspector/checks/read-only.mjs:54,61 — writes tools-list.json and navigate-refused.json; that file differs from its .commandcode counterpart by 10 bytes (fc /b exit 1), a drift |
| `call navigate` without `--confirm` is refused (exit 2 with its `refused: navigate ... --confirm` reason) | command | verified | .claude/skills/control-pangular-inspector/scripts/control.mjs:373 — returns `refused: <tool> acts on the app; pass --confirm to run it` |
| a port busy `up` refusal makes the run inconclusive, never a stop of someone else process | status | unverifiable | no refusal transcript is kept in this checkout; a second `up` on a busy 9999 would produce it |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Per-role model overrides for pstack skills" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\AGENTS.md:102 — `@~/.commandcode/pstack-models.md` imports this file into the loaded rules, so its role lines are the active override set |
| "the pstack effort agents (`effort-low`, `effort-medium`, `effort-high`, `effort-xhigh`, `effort-max`) set `reasoningEffort` in their frontmatter and do not pin a model" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\effort-medium.md:4 — `reasoningEffort: medium`, and the file carries no `model:` key |
| "levels: low, medium, high, xhigh, max" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\ — exactly effort-low.md, effort-medium.md, effort-high.md, effort-xhigh.md, effort-max.md |
| "Free models available: `poolside/laguna-s-2.1-free`, `reflection/beam:free`" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\free-laguna-s-2-1.md:3 — `model: poolside/laguna-s-2.1-free`; free-beam-low.md pins `reflection/beam:free`; no minimax agent file exists, so that roster entry is not shown by this directory |
| "A value of `inherit-parent` or `auto` runs that role on the parent session's model (the `Agent` call omits `model`)" | config | unverifiable | no reader of the value exists in the repository or in C:\Users\LarsGyrupBrinkNielse\.commandcode\scripts; the pstack role dispatcher source would settle it |
| "`default effort` sets the level for a value without one" | config | unverifiable | same gap: no code in this checkout or the user-scope scripts parses `default effort`, so the resolution rule cannot be checked |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | structure | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — the `instances` map holds five entries with ports 9333, 9334, 9335, 9337, 9338 |
| "`edge-dev-aion` … `Aion-1.1-Instruct` … `contextWindow` `7,168`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:162,166 — model.name `Aion-1.1-Instruct` and contextWindow 7168 for edge-dev-aion |
| "`9600 + 10 * slot + index`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:449 — `return slot === 0 ? mainPort : 9600 + 10 * slot + index;` |
| "`model download <name> [--timeout-min=45]`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:244 — `const min = positiveFlag('timeout-min', timeoutMin, 45);` |
| "`scripts/proctree.mjs` … `processTable`, `snapshot`, `merge`, `stop`, `matches`, `describe`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:12 — `import { describe, matches, merge, processTable, snapshot, stop } from './proctree.mjs';` |
| "`bench` refuses (exit 2) in a worktree" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2920 — refuses because bench.js hard-codes http://localhost:4222, which in a worktree is not this checkout's app |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — the five registry entries carry exactly ports 9333/9334/9335/9337/9338 |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | apps/angular-ai-devtools/project.json:52 — the `build-extension` target exists in the angular-ai-devtools project |
| "Its session is `ai-<instance>-<port>`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:471 — returns `ai-${name}-${port}` |
| "Page code runs in a tab the script opens on `https://example.org/?ai-browsers=<purpose>`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:131,1225 — `PROBE_ORIGIN = 'https://example.org/'` and the tab URL gets `?ai-browsers=${purpose}` appended |
| "four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`" | structure | verified | .commandcode/skills/control-ai-browsers/features/instances.md:1 — H1 then that exact H2 sequence, and the same sequence in health-check.md, model-lifecycle.md, probes.md, extension-panel.md, di-doctor.md, error-explainer.md, signal-provenance.md, stale-view.md, interop.md |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` (`componentName`, `elementTag`)" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:25 — `chrome?.runtime?.sendMessage({ type: 'angular-ai:di-query', componentName, elementTag })` |
| "receives `angular-ai:di-graph` with a `DiResolutionPath`" | integration | verified | apps/angular-ai-devtools/src/app/di-doctor.service.ts:17 — `if (m?.type === 'angular-ai:di-graph' && m.resolutionPath)` |
| "Implementation: … `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | apps/angular-ai-devtools/src/app — listing holds di-doctor.service.ts, n3-di-doctor.component.ts and di-diff-display.ts |
| "`http://localhost:4222/` in the main checkout" | config | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:130 — the bench app is the control-angular-dev-app counter fixture on port 4222 |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs — the check is present beside di-doctor.test.mjs |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "captures `NG0xxx` and uncaught console errors" | feature | verified | src/main-world/error-capture.ts:36 — `const match = text.match(/NG0\d{3,}/);`, over a thrown or uncaught error (line 3) |
| "maps each to its owning component through `ng.getOwningComponent`" | feature | verified | src/main-world/error-capture.ts:43 — `typeof ng.getOwningComponent === "function"` guard before the lookup |
| "a digest of the official `angular.dev/errors` documentation bundled at extension build time" | feature | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:7 — `import errorDigest from '../../../../extension/error-digest.json'`; extension/error-digest.json:1 reads `"version": "22.2.x"` with an `entries` array |
| "message types `angular-ai:error-capture` / `angular-ai:error-explain`" | integration | stale | extension/relay.js:17 sends `angular-ai:error-capture`, but no `angular-ai:error-explain` exists: src/main-world, apps/angular-ai-devtools/src/app and extension/*.js hold no such type, and extension/background.js:10 routes only record, state, di-graph and error-capture |
| "`--feature=error-explainer`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17 — the driver's `feature` field documents `error-explainer`; the branch at :239 selects the error-explainer selectors |
| "Implementation: `apps/angular-ai-devtools/src/app/error-explainer.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/error-explainer.component.ts:10 — `selector: 'app-error-explainer',`, with the route `error-explainer` in app.routes.ts:13 |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The extension adds a DevTools panel, "Angular AI", built from `apps/angular-ai-devtools`" | feature | verified | extension/manifest.json — `"devtools_page": "devtools.html"` and `"name": "Angular AI DevTools"`, the app whose sources sit in apps/angular-ai-devtools |
| "Angular detection still comes from the content scripts (`relay.js`, `agent-main.js`)" | feature | verified | extension/manifest.json — content_scripts lists relay.js and agent-main.js, the latter with `"world": "MAIN"` |
| "the result has `answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:160 — the run object literal declares exactly those fields |
| "DevTools 157 keys extension panels as `extension-panel-<uuid>_<n>`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:57 — the key lookup returns the first key starting with `extension-panel-` |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/` (`main.js`, `styles.css` and `index.html` …)" | command | verified | extension/panel — the built folder holds main.js, styles.css and index.html |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nineteen check lines" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2447-2564 — the doctor emits 19 distinct ids: map-fresh, process, tree, commandLine, ports, tabs, account, extension, model.disk, model.pin, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp |
| "`Angular AI DevTools 0.3.0 loaded as …`" | config | verified | extension/manifest.json:3-4 — `"name": "Angular AI DevTools"` and `"version": "0.3.0"` |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:1439 — `o.webmcp = { pass: typeof document.modelContext === 'object', documentModelContext: typeof document.modelContext }` |
| "`backend` reads `requested gpu`" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2529 — `add('backend', be.kind === d.backend, { requested: d.backend, broker: …, row: be.row })` |
| "`model.pin` `[OK]` `matches the pin of <date>`" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2512 — the OK detail is `matches the pin of ${pin.at}: …` |
| "`model.broker` fails with a `mismatch` field" | status | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2527 — on a `mismatch` verdict the detail carries `mismatch` plus a `fix` naming the pin restore |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "its own profile under `.browsers\<name>`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:2 — `"profilesRoot": ".browsers"` |
| "its own `--enable-features` set and its own remote-debugging port, all read from `instances.json`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:70,101,135,173,201 — every instance entry carries a `port` and its own `features` array |
| "`[OK]` with the nine Aion features" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:146 — edge-dev-aion's `features` array runs to nine entries, ending with `msEdgeLLMOnDeviceModelPrerelease` |
| "`--backend=cpu` on Edge is refused: forcing CPU deleted the installed model twice" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:523 — refuses with "forcing CPU on Edge deletes the installed model (measured twice)" |
| "`edge-dev-aion` has `--disable-component-update`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:149 — the instance's `args` array holds `--disable-component-update` |
| "`http://127.0.0.1:<port>/json/version` and `/json/list` for the CDP endpoint and its tabs" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — `up` waits for `/json/version` and the tab list comes from `/json/list` on the instance's CDP port |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "identify a `toSignal.source` / `toSignal.state` node" | feature | verified | apps/angular-ai-devtools/src/app/interop.service.ts:8 — `if (n.label === 'toSignal.source' \|\| n.label === 'toSignal.state') return true;` |
| "Required panel test ids: `interop-slice` (container), `interop-node` (one per sliced node), `interop-limit` …, `interop-inferred` …" | structure | verified | apps/angular-ai-devtools/src/app/interop.component.ts:19,21,20,25 — data-testid values interop-slice, interop-node, interop-limit, interop-inferred |
| "message types `angular-ai:interop`" | integration | stale | no `angular-ai:interop` exists in src/main-world, apps/angular-ai-devtools/src/app or extension/*.js, and extension/background.js:10 routes only record, state, di-graph and error-capture; interop.service.ts:238 builds the slices from `this.cause.recordedCycles()` instead |
| "the `spikes/ng222-app` fixture at `/stale-view`, or the deferred `/stale-view-deferred` route" | config | verified | spikes/ng222-app/src/app/app.routes.ts:6-7 — `{ path: 'stale-view' … }` and `{ path: 'stale-view-deferred', component: StaleViewDeferredFixture }` |
| "`C panel <name> --url=<app url> --feature=interop`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:17,241 — `interop` is a documented feature and line 241 branches on it |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`OptGuideOnDeviceModel\<version>` (Nano), `OptGuideManifestModel\<hash>\<version>` (Gemma 4), `EdgeLLMOnDeviceModel\<version>` (Aion, Phi-4-mini), each with a `manifest.json`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:91,125,163,191 — the four model entries carry exactly those `folders` patterns |
| "free space minus the model's `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:16,26 — both Chrome entries set `"minFreeMib": 22528`; instances.json:41,60 set 20480 for both Edge entries |
| "`contextWindow` 9,216" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:94 — chrome-beta-nano's model declares `"contextWindow": 9216` |
| "except on an instance launched with `--disable-component-update` (`edge-dev-aion`)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:149 — edge-dev-aion alone carries `--disable-component-update` in its `args` |
| "Forcing CPU on Edge uninstalls the model; `up --backend=cpu` is refused on Edge instances" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:523 — refuses `--backend=cpu` for an Edge instance, citing the twice-measured model deletion |
| "`model init chrome-beta-nano` … First and second create, `contextWindow` 9,216" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs — the `model init` command runs a cold and a warm `create()` and reads `contextWindow`, matching the registry value 9216 at instances.json:94 |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`" | structure | verified | spikes/probes/probe10.js — the file is present in the probes directory beside bench.js and broker-state.js |
| "`bench.js` hard-codes it" | feature | verified | spikes/probes/bench.js:4 — `await page.goto('http://localhost:4222/');` |
| "`bench.js` has a 120 s per-prompt timeout" | feature | verified | spikes/probes/bench.js:11 — `const PROMPT_TIMEOUT_MS = 120000;` |
| "Summarise with `node spikes/probes/bench-summary.mjs`" | command | verified | spikes/probes/bench-all.sh:21 — `node "$root/spikes/probes/bench-summary.mjs" "$out/nano.json" …` |
| "`bench` does not use `spikes/probes/bench-all.sh` … it uses the `bench-*` sessions" | feature | verified | spikes/probes/bench-all.sh:13 — `session="bench-$name"`, the session naming the gotcha describes |
| "`C run chrome-beta-nano spikes/probes/broker-state.js --json`" | command | verified | spikes/probes/broker-state.js — present in the probes directory, and control.mjs documents `run <name> <file.js>` for a tab of its own |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "driven by `angular-ai:record` messages from the page-side tracer (`extension/agent-main.js`, `src/main-world/provenance-tracer.ts`)" | integration | verified | extension/relay.js:6-7 — listens for `angular-ai:record` and re-sends `{ type: 'angular-ai:record', cycle: e.detail }`; both named tracer files exist |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | feature | verified | apps/angular-ai-devtools/src/app/extension-message.service.ts:57 — `} else if (msg.type === 'angular-ai:record' && msg.cycle) {` |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs — the check is present in the checks directory beside signal-provenance.test.mjs |
| "The component picker is empty until at least one `angular-ai:record` cycle arrives for the inspected tab" | feature | unverifiable | no static reading settles it; running `.commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs` against a fresh page would (not run: this audit forbids a browser, a build and a test runner) |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the hedged wording "the template may show a stale value"" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:21 — `the template may show a stale value` in the `hedged` span |
| "With zero findings the panel renders an explicit empty state ("no stale-view findings")" | feature | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:17 — `no stale-view findings` in the `empty-state` paragraph |
| "`C panel <name> --url=http://localhost:4222/ --feature=stale-view`" | command | verified | .commandcode/skills/control-ai-browsers/scripts/panel.mjs:240 — `const isStale = feature === 'stale-view';` |
| "message types `angular-ai:stale-view`" | integration | stale | no `angular-ai:stale-view` exists in src/main-world, apps/angular-ai-devtools/src/app or extension/*.js; stale-view.component.ts:42,47 injects UpdateCauseService and scans `this.cause.recordedCycles()`, so no such message is sent |
| "Implementation: `apps/angular-ai-devtools/src/app/stale-view.component.ts`" | structure | verified | apps/angular-ai-devtools/src/app/stale-view.component.ts:42 — `protected readonly cause = inject(UpdateCauseService);` |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "portal api fixed 3000; control.mjs:69 keeps it at 3000" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69 â€” const PORTAL_API_PORT = 3000; |
| "counter 4300 + slot, SSR 4400 + slot, portal 4500 + slot" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:82,90,100 â€” slot === 0 ? 4222 : 4300 + slot, then 4400 + slot and 4500 + slot |
| "default 240; a missing value or one that is not a positive number exits 2" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:995 - timeoutMs = timeoutMsOf(argv, 240), and timeoutMsOf throws on a missing or non-positive value |
| "ng-core-functions: the 11 public functions" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:119 - CORE holds 11 public names plus 5 prefixed helpers, 16 in all |
| "npm test at the repository root runs them and npm run check type-checks the scripts" | command | verified | package.json:7,9 - check runs tsc -p tsconfig.json, test runs node --test over the script test files |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter: node $S up --target counter, then node $S doctor exits 0. Fresh page state: count 3, double 6, cart 1 item." | status | verified | spikes/ng222-app/src/app/counter.ts:5,17,18 - count = signal(3), double = computed(() = count() * 2), CartService items = signal([apple]) |
| "Portal: node $S up --target portal (API on 3000, app on the derived port, 4507 for the default portal folder)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:69,100 - PORTAL_API_PORT = 3000 and slot 0 gives app 4200, a worktree slot gives 4500 + slot |
| "Every flag in apps/insurance-portal/src/assets/feature-flags.manifest.json decides whether a sidebar entry and its route exist" | integration | verified | apps/insurance-portal/src/assets/feature-flags.manifest.json in the portal checkout lists the 12 domain flags (claim-list, contract-edit, customer-details, complaint-create, ...), one per sidebar entry and route |
| "Each feature file has an H1 ... then four H2s in order: Sub-features, How to get to it (user POV), Driving it with control-angular-dev-app (starting with Preconditions:), Gotchas" | structure | verified | features/counter.md:7,15,21,45; portal-claims.md:6,16,21,40; portal-contracts.md:7,22,28,61; portal-navigation.md:9,19,26,49; portal-complaints-customers.md:7,20,27,49; ssr.md:10,26,33,72 - only those four H2s, in that order |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The ng222-app page shows one line, Clicks: 3 (double 6, cart 1), and an Increment button" | feature | verified | spikes/ng222-app/src/app/counter.ts:11,12,17 - template prints title(): count() (double double(), cart cart.items().length) with a button Increment; count = signal(3); spikes/ng222-app/src/app/app.ts:7 passes title="Clicks" |
| "There is a count signal, a double computed, an injected CartService.items signal and an effect that copies count into lastLogged" | structure | verified | spikes/ng222-app/src/app/counter.ts:5,17,18,19,23 - items = signal(["apple"]), count = signal(3), double = computed, inject(CartService), effect sets lastLogged |
| "The counter is OnPush by default (no changeDetection declared)" | feature | verified | spikes/ng222-app/src/app/counter.ts:8-14 - the @Component metadata has no changeDetection key (no match for changeDetection in spikes/ng222-app/src/app) |
| "The fixtures two other routes, /stale-view and /stale-view-deferred (src/app/app.routes.ts:5-8)" | structure | verified | spikes/ng222-app/src/app/app.routes.ts:5-8 - routes array declares path stale-view and path stale-view-deferred |
| "A reload resets the count to 3; there is no persistence" | feature | verified | spikes/ng222-app/src/app/counter.ts:17 - count = signal(3) initialised in code, and no localStorage or sessionStorage reference exists in spikes/ng222-app/src/app |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/claims" | integration | verified | portal libs/shared/utils/src/lib/injection-tokens.ts:5 - BaseUrl factory returns http://localhost:3000/api/; libs/claim/data-access/src/lib/data-services/claim-data.service.ts:9 - url = inject(BaseUrl) + claims |
| "claim-list table with columns Claim number, Damage Type, Date, Policynumber, Customer" | feature | verified | portal libs/claim/feature-list/src/lib/list.component.ts:23-28 - the p-table header row carries exactly those five th cells |
| "/claim/create shows the heading Complaint Create: an app bug, measured" | status | verified | portal libs/claim/feature-create/src/lib/create.component.ts:39 - ng-journal-header title="Complaint Create" in the component the claim create route loads (libs/claim/routes/src/lib/routes.ts:21) |
| "row click opens /claim/id/details, heading Claim Details" | feature | verified | portal libs/claim/feature-list/src/lib/list.component.ts:34 - tr routerLink [/, claim, claim.id, details]; libs/claim/feature-details/src/lib/details.component.ts:29 - ng-journal-header title="Claim Details" |
| "Select damage type and Select contract (under the label Policynumber) dropdowns ... Save disabled until valid" | feature | verified | portal libs/claim/ui/src/lib/claim-form.component.ts:59,67,73 - placeholders Select damage type and Select contract under label Policynumber; feature-create/src/lib/create.component.ts Save has [disabled]="form().invalid()" |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from http://localhost:3000/api/complaints and /api/customers" | integration | verified | portal libs/shared/utils/src/lib/injection-tokens.ts:5 - BaseUrl is http://localhost:3000/api/; complaint-data.service.ts:9 and customer-data.service.ts:9 append complaints and customers |
| "complaint-list columns Type, Customer, Date, Description" | feature | verified | portal libs/complaint/feature-list/src/lib/list.component.ts:23-26 - the header row carries exactly those four th cells under ng-journal-header title="Complaints" |
| "complaint-create ... heading Complaint Create: Select type (CustomerService, Sales, Payments), Select customer" | feature | verified | portal libs/complaint/feature-create/src/lib/create.component.ts:43 - ng-journal-header title="Complaint Create"; libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:2-4 - enum members CustomerService, Sales, Payments; libs/complaint/ui/src/lib/complaint-form.component.ts:35,48 - placeholders Select type and Select customer |
| "customer-list columns First name, Last name, Phone, Email, Street, City, State, Zip" | feature | verified | portal libs/customer/feature-list/src/lib/list.component.ts:23-30 - the eight th cells, under ng-journal-header title="Customers" |
| "customer-details /customer/id/details, heading Customer Details (name, email, phone, Address block)" | feature | verified | portal libs/customer/feature-details/src/lib/details.component.ts:18,40 - ng-journal-header title="Customer Details" and a subtitle header titled Address |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "contract-list table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email" | feature | verified | portal libs/contract/feature-list/src/lib/list.component.ts:34-39 - the six th cells under ng-journal-header title="Contracts" |
| "clicking a row opens /contract/id/details with heading Contract Details and an Edit button" | feature | verified | portal libs/contract/routes/src/lib/routes.ts:26-31 - path :id/details guarded by contract-details; libs/contract/feature-details/src/lib/details.component.ts:41,42 - title="Contract Details" with [showEditButton]="true" |
| "Edit opens /contract/id/edit, heading Contract Edit ... then sends PUT /api/contracts and returns to details" | feature | verified | portal libs/contract/feature-edit/src/lib/edit.component.ts:51 - ng-journal-header title="Contract Edit"; routes.ts:21 - path :id/edit; libs/contract/data-access/src/lib/data-services/contract-data.service.ts:25 - http.put on the contracts url |
| "contract-create /contract/create: Status chip Pending ... Save sends POST /api/contracts (201)" | feature | verified | portal libs/contract/feature-create/src/lib/create.component.ts:46,112 - title="Contract Create" and status: ContractStatusDto.Pending; contract-data.service.ts:21 - http.post on the contracts url; libs/contract/models contract-status.model.ts:2 - Pending = Pending |
| "its inputs (withComponentInputBinding passes the route id)" | config | verified | portal apps/insurance-portal/src/app/app.config.ts:24 - withComponentInputBinding() inside provideRouter |
| "eval () = __ngc.components() on details lists DetailsComponent, ContractStatusChipComponent, HyperlinkComponent" | feature | verified | portal libs/contract/feature-details/src/lib/details.component.ts:93,15,19 - class DetailsComponent with HyperlinkComponent and ContractStatusChipComponent in its imports, so all three render on the contract details page |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "/ redirects to /home, which shows four tiles linking to the domain lists" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts:7 - redirectTo: home; apps/insurance-portal/src/app/home.component.ts:16,25,34,43 - four a routerLink links to /contract/list, /claim/list, /complaint/list, /customer/list |
| "Sidebar entries List and Create per domain (Customer has List only) and Home" | feature | verified | portal apps/insurance-portal/src/app/sidebar.component.ts:104-127 - routingConfigs give General Home, contract/claim/complaint List and Create, customer List only |
| "Click a sidebar entry (a div with routerLink, not a link)" | feature | verified | portal apps/insurance-portal/src/app/sidebar.component.ts:55-60 - the entry is a div with [routerLink] and [routerLinkActive], no a element |
| "Only the sidebar group headings render upper-case (CONTRACT, through the capitalize pipe, which calls toUpperCase)" | feature | verified | portal libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9 - transform returns value.toUpperCase(); sidebar.component.ts:45 applies config.domain through that pipe while the entries print route.label unchanged |
| "Domain routes load lazily, guarded by feature flags; unknown URLs show Page Not Found" | feature | verified | portal apps/insurance-portal/src/app/app.routes.ts:15-36 - each domain loadChildren, then path ** loads PageNotFoundComponent; libs/claim/routes/src/lib/routes.ts:10 - canMatch: [featureFlagGuard(claim-list)]; apps/insurance-portal/src/app/page-not-found.component.ts:7 - h1 Page Not Found |
| "The header link goes to https://www.ng-journal.com" | structure | verified | portal apps/insurance-portal/src/app/app.component.ts:19 - a href="https://www.ng-journal.com" wrapping the logo and the Insurance Portal label |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Open url (http://localhost:4223/)" | config | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:90 - the ssr flow port is slot 0 ? 4223 : 4400 + slot |
| "a list of three items fetched from /api/items during the server render" | feature | verified | spikes/ng222-ssr/src/server.ts:18,21-23 - app.get(/api/items) returns Alpha, Beta, Gamma; spikes/ng222-ssr/src/app/data-list.ts:22 - httpResource on /api/items |
| "?mismatch=1 (structural hydration mismatch, NG0500)" | feature | verified | spikes/ng222-ssr/src/app/mismatch.ts:4 - the comment says ?mismatch=1 puts an extra node before the p on the server only; .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:80 - expected-mismatch-detected requires NG0500 |
| "?transfer=0 (HTTP transfer cache off for the request)" | feature | verified | spikes/ng222-ssr/src/app/data-list.ts:9,22 - the comment names ?transfer=0 and transferCache is this.transfer() !== 0 |
| "a @defer (hydrate on interaction) block holding a Deferred click button" | feature | verified | spikes/ng222-ssr/src/app/page.ts:15 - @defer (hydrate on interaction); deferred.ts:6 - button Deferred click with its counter |
| "ok is true when all six checks pass" | status | verified | .commandcode/skills/control-angular-dev-app/scripts/ssr-check.js:75-80 - six named checks server-html-ngh, server-html-transfer-state, dev-build-after-hydration, hydration-counters, no-mismatch-on-default-route, expected-mismatch-detected |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Playwrights bundled Chromium (Chrome for Testing 156.0.8078.4, revision 1248, read 2026-11-01 from node_modules/playwright-core/browsers.json)" | config | verified | node_modules/playwright-core/browsers.json - the chromium entry has revision 1248, browserVersion 156.0.8078.4, title Chrome for Testing |
| "session ngdt, CDP port 9420, profile tmp/control-angular-devtools/profile/main" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:273,311 - MAIN_CDP_PORT = 9420 and SESSION = main ? ngdt : ngdt-flowId; cdp port row at :304 is MAIN_CDP_PORT + slot |
| "CDP port 9420 + slot (9421-9499, slot 1-79 ...); up tries the next slot, 10 slots in all" | config | verified | control.mjs:274-276 - the comment names slots 1 to SLOTS - 1 as 9421-9499, SLOTS = 80 and SLOT_TRIES = 10 |
| "a --browser outside test, chrome, chrome-beta, edge, edge-dev ... exits 2 before anything runs" | command | verified | control.mjs:113 - BROWSER_VALUES = [test, chrome, chrome-beta, edge, edge-dev], checked by isBranded at :121-123; the branded table BROWSERS at :102-107 |
| "install (test): copies the newest version_0 folder from C:\Users\LarsGyrupBrinkNielse\AppData\Local Microsoft Edge Dev User Data Default Extensions ienfalfjdbdpebioblfackkekamfmbnh" | command | verified | control.mjs:89,1036 - EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh and the source is BROWSERS[from].userData + Default + Extensions + EXT_ID; edge-dev userData is join(LOCAL, Microsoft, Edge Dev, User Data) at :106 |
| "panel evaluates Extensions.extensionServer.onShowPanel({command: showPanel, id: chrome-extension://id Angular})" | feature | verified | control.mjs:810 - evalIn(port, isDevtools, async () = Extensions.extensionServer.onShowPanel({ command: showPanel, id: PANEL_ID })), and :794 identifies the panel by chrome-extension://EXT_ID/index.html |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "S is .commandcode/skills/control-angular-devtools/scripts/control.mjs" | structure | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs - the CLI entry, whose usage line reads control.mjs command [options] [--json] |
| "the counter fixture at spikes/ng222-app (Angular 22.2.2)" | config | verified | spikes/ng222-app/node_modules/@angular/core/package.json:3 - version 22.2.2; spikes/ng222-app/package.json:16 - @angular/core ^22.2.0 |
| "App page: playwright-cli session ngdt" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:311 - SESSION = flowId === main ? ngdt : ngdt-flowId |
| "Evidence stays in tmp/control-angular-devtools/evidence/ (git-ignored)" | config | verified | .gitignore:7 - tmp/control-angular-devtools/, the folder the script writes evidence and state into |
| "One file per feature: H1, one paragraph of user-visible behaviour, then Sub-features, How to get to it (user POV), Driving it with control-angular-devtools, Gotchas" | structure | verified | features/attach.md:7,15,20,32; install.md:7,14,22,38; profiler.md:6,11,15,26; signal-graph.md:6,13,17,32 - each feature file carries only those four H2s, in that order |
| "Router Tree shows only when the app provides the router (devtools-tabs.component.ts)" | feature | unverifiable | devtools-tabs.component.ts is not in this repository (shell-browser/ does not exist here, it ships inside the built extension); reading that component or the running panel would settle it |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag window.__NG_DEVTOOLS_CONNECTED__" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:891 - an init script installs a get/set accessor on window.__NG_DEVTOOLS_CONNECTED__ and stamps flagSetAt; the probe reads it at :905 |
| "attach reloads the page to catch messages from the start" | feature | verified | control.mjs:888-900 - the probe init script is installed, then page.reload(), then it waits for the backendReady topic |
| "Angular version from [ng-version]" | feature | verified | control.mjs:911 - ngVersion = document.querySelector([ng-version]).getAttribute(ng-version) |
| "attach exits 1 because it requires isDebugMode" | status | verified | control.mjs:1349 - ok = flag and isAngular and isDebugMode and backendInstalled and backendReady, so a production build fails the run |
| "the content script still injects the backend (it gates on isAngularDevTools, isAngular and an HTML document, not on isDebugMode; built 1.22.0 app/content_script_bundle.js)" | feature | unverifiable | the extension bundle (app/content_script_bundle.js) is not in this repository and the harness copy lives under tmp/; unpacking the installed 1.22.x copy and reading that file would settle it |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is a Chrome Web Store extension (ienfalfjdbdpebioblfackkekamfmbnh)" | config | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:89,91 - EXT_ID = ienfalfjdbdpebioblfackkekamfmbnh and STORE_URL = https://chromewebstore.google.com/detail/EXT_ID |
| "node $S install # test copy from Edge Dev (read only)" | command | verified | control.mjs:1036-1039 - the source is BROWSERS[from].userData + Default/Extensions/EXT_ID (default from edge-dev) and the copy is refused when the entry is missing |
| "node $S install --browser=chrome-beta # opens the store page, polls for Lars click (default 180 s)" | command | verified | control.mjs:1019-1027 - opens STORE_URL, polls every 2000 ms for Number(opts.timeout ?? 180) * 1000, then throws not installed after 180 s |
| "A test uninstall refuses while up runs (down first)" | status | verified | control.mjs:1096 - refuse(the test browser is up; run "down" first) |
| "test: doctor line extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)" | status | verified | control.mjs:1331 - the check prints name version state (location, path); service worker; errors, from getExtensionInfo at :924 |
| "enabled for branded browsers is read from disable_reasons and state" | feature | verified | control.mjs:946-954 - status reads Secure Preferences then Preferences, mapping manifest.version, disable_reasons, state and from_webstore |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through ng.ÉµsetProfiler, which keeps a list of subscribers in Angular 22" | feature | verified | spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:144-149 - setProfiler pushes a new callback into profilerCallbacks when it is not already listed |
| "ng.ÉµsetProfiler(null) clears every subscriber, DevTools included; remove your own with the function ÉµsetProfiler(cb) returns" | feature | verified | spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:138-153 - the non-null branch returns () = removeProfiler(profiler), the null branch sets profilerCallbacks.length = 0 |
| "node $S coexist" | command | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:1463-1467 - coexist installs two subscribers through setProfiler, clicks the app, removes one and re-reads both counters |
| "own subscribers {bothOn:{a:16,b:16},afterRemoveA:{a:16,b:32}}" | feature | verified | control.mjs:1463-1467 - the probe object holds exactly the keys a and b and is read twice, before and after removing a, which produces the bothOn and afterRemoveA entries |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "In the Components tab a developer selects a component and clicks Show Signal Graph" | feature | verified | .commandcode/skills/control-angular-devtools/scripts/control.mjs:829,857 - the panel driver finds a button whose text includes Show Signal Graph, clicks it, and throws when it is absent |
| "Signal graph nodes (kind, label, value) and edges ... graph nodes are ng-signal-graph-pane .node-cont.kind-kind" | feature | verified | control.mjs:830 - readSignalGraph maps ng-signal-graph-pane .node-cont and takes the class starting with kind- as the node kind |
| "The angular:di_graph regression: after that tool runs, the template node is gone from both" | feature | verified | control.mjs:1501-1528 - coexist --di-graph runs the angular:di_graph tool through the devtoolstooldiscovery event, re-reads both sources, and reports templateLostInPane when a template node existed before and is absent after |
| "--di-graph leaves the pages signal graph broken until reload" | feature | verified | control.mjs:1501 - the comment marks the di_graph step as changing the page until reload; control-angular-dev-app/SKILL.md gotcha records the same loss for ÉµgetSignalGraph |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The devtools server has no slots" - its port is fixed at 9999 per app | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 - `const DEFAULT_PORT = 9999;` (the cited line matches) |
| "the eight action tools (`highlight`, `navigate`, ... `analog-call-api`)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 - ACTION_TOOLS lists exactly those eight names |
| "`up` runs `node node_modules/@pangular-inspector/devtools/bin.mjs dev --port 9999 --no-open --root <app> --read-only`" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1061 - spawn args `[bin, 'dev', '--port', String(p), '--no-open', '--root', dir, ...(readOnly ? ['--read-only'] : [])]` |
| "The state file is per port (`tmp/control-pangular-inspector/state/pangular-<port>.json`)" | structure | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1009 - `path.join(STATE_DIR, 'pangular-${p}.json')` with STATE_DIR = tmp/control-pangular-inspector/state (line 71) |
| "The MCP client is plain JSON-RPC over `node:http`: `Accept: application/json, text/event-stream`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:6,1143 - imports `http` from node:http and sends that Accept header |
| "`mcp-origin-guard`: a POST without `Origin` gets 403" | status | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1344 - doctor passes the check only when `noOrigin.httpStatus === 403` |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Take `evidenceDir` and `session` (`pangular-9999`) from `node $S info`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - the state records `session: 'pangular-${p}'` and `evidenceDir`, with DEFAULT_PORT 9999 (line 74) |
| "four H2s in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-pangular-inspector` ..., `Gotchas`" | structure | verified | all five feature files (setup, live-inspection, navigation, source-scan, panel) hold exactly those four H2s in that order (grep '^## ' over .commandcode/skills/control-pangular-inspector/features/*.md) |
| "Setup: `node $S check` exits 0 (pin, overlay import, proxy)" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:590-595 - setupChecks emits six checks: declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1074 - `mcpUrl: 'http://localhost:${p}/__mcp'` with p = DEFAULT_PORT 9999 |
| "the component outline (`components`; `list-components` on versions after 0.0.7)" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:636 - `components` builds the outline from the `component-tree` resource, the fallback for a 0.0.7 server |
| "`inspect-component` for one host tag, class name or instance id" | feature | unverifiable | features/.proven.json:4 records live-inspection as external ("needs the ng-journal Insurance Portal checkout ... outside this repository"); a live `node $S call inspect-component` would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | config | unverifiable | the default lives in @pangular-inspector/devtools 0.0.7, which this checkout does not carry; features/.proven.json:9 records navigation as external (portal checkout outside this repository). A live read against the portal would settle it |
| "`node $S call list-routes` (12 routes, measured) and `node $S call lint-routes` (one `info` finding, `missing-title`)" | status | unverifiable | a measured count against the portal's live route config; nothing in this repository holds the route table. Re-running the two `call`s on a connected portal would settle it |
| "The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`, not `a`" | feature | unverifiable | describes the portal's sidebar template (apps/insurance-portal, outside this repository); reading that template plus one `explain-navigation` answer would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:535 - the `/__pangular` proxy entry keeps the prefix-stripping rewrite (`pathRewrite '^/__pangular': ''`, `ws: true`) that serves the panel under the app origin; `proxy-target` check at line 595 |
| "`http://localhost:9999/` directly (trusts only that origin's one-time code)" | config | unverifiable | the one-time-code auth is in @pangular-inspector/devtools 0.0.7, not in this checkout; control.mjs only answers the prompt from the server log (line 1375 `dialog-accept`). A direct load in a fresh profile would settle it |
| "the amber floating button ... accessible name `Toggle Pangular Inspector`" | feature | unverifiable | the overlay ships inside the published package; no overlay source in this repository. `playwright-cli find "Toggle Pangular"` on the app page would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:72-73 - `const PKG = '@pangular-inspector/devtools'; const PINNED = '0.0.7';` |
| "`setup.check`: six read-only facts, one line each" | status | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:590-595 - setupChecks adds declared-exact, installed, overlay-import, dev-guard, proxy-config, proxy-target |
| "`setup.refuse`: `remove` refuses when files it does not manage are changed; `install` refuses SSR and Vite mounts" | status | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:435-439 (SSR then vite.config detection, exit 2 for "Other mounts") and :532 (refusal on uncommitted changes besides /__pangular) |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:402 - picks the project whose `targets.serve.executor === '@angular/build:dev-server'`; refusal text at :810 |
| "The `main.ts` edit needs the form `bootstrapApplication(...).catch(`" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:465 - `/bootstrapApplication\(([^)]*)\)(\s*)\.catch\(/`, with the exit-2 message at :927 |
| "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | status | unverifiable | a measured count from the portal checkout, which is outside this repository (features/.proven.json:19 external); re-running `install` there and reading `git diff --stat` would settle it |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The script: `scan <tool>`, which starts that server, calls one tool and stops it" | command | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1493 - spawns `[bin, 'mcp', '--root', root, '--read-only']` and drives it over stdio |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | config | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:1540 - `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)` with SCRATCH = tmp/control-pangular-inspector (line 70) |
| "`--read-only` drops only the action tools" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:607-614 - readOnlyCheck inspects only ACTION_TOOLS (the eight names at line 76) |
| "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json`" | feature | unverifiable | that resolution is inside the published devtools package, not this checkout; `node $S scan get-components` at the root and with `--root apps/insurance-portal` would settle it |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest's default 63315 cannot be used here, because it sits in a Windows excluded port range" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:98 - that reason is recorded next to `MAIN_VITEST_PORT = 51315` (line 99) |
| "`node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js test -c attach --watch`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:90,612 - NG resolves to that ng.js and args are `[ng, 'test', '-c', 'attach', '--watch']` in attach mode |
| "`--timeout <s>` (default 180)" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:174 - `timeoutMs: Number(flagIn(args, 'timeout') ?? 180) * 1000` |
| "The playwright-cli session is `control-vitest-<flowId>-<Vitest port>`" | config | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:899 - `session: 'control-vitest-${flowId}-${vitestPort}'` |
| "`tester-frame`: the tab has a child frame named `vitest-iframe`" | feature | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1118 - the doctor looks for `c.frame.name === 'vitest-iframe'`; failure text at :1123 |
| "Ready now accepts `DEV`, `RUN` or `RERUN`" | status | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:509 - `const RUN_STARTED = /\b(DEV\|RUN\|RERUN)\b/;` |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --extension s1-vitest --hold 90000`" | command | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1271 - the usage line lists `--extension <dir>\|s1-vitest`, `--hold <ms>`; `s1-vitest` writes the S1 variant (:927) |
| "`mounted-component` passes only while the hold test runs (90 s from `RUN` ... )" | status | unverifiable | the hold window is the spec's own `VITE_COUNTER_HOLD_MS` budget (spikes/ng222-app/src/app/counter.spec.ts:56-73, timeout `holdMs + 30_000`); a `up --hold 90000` run polled with `doctor --json` would settle the 90 s claim |
| "Re-run: `touch spikes/ng222-app/src/app/counter.spec.ts`, then wait for `RERUN`" | command | verified | the spec is at that path and .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:509 accepts `RERUN` as a run marker |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two tests always run: an Increment click ... and a `CartService` override shows 'cart 2'" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:20,30-32 - the two unconditional `it(` specs, the second with `setup({ cartItems: ['pear', 'plum'] })` |
| "Two more run only when their environment variable is set" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:39,56 - `it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1')` and `it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)` |
| "`npm test` in `spikes/ng222-app` runs the default `headless` configuration once" | config | verified | spikes/ng222-app/package.json:8 (`"test": "ng test"`) with spikes/ng222-app/angular.json:73,85 - a `headless` configuration is the `defaultConfiguration` |
| "`Tests 2 passed \| 2 skipped (4)` without flags" | status | unverifiable | a measured run summary; no `ng-test.log` is kept in the checkout (tmp/ is git-ignored). `node $S up` plus `doctor --json` would settle the count |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/s1-extension` was retired in M009; ... archived notes live under `.project/archive/001-run-unrun-spikes/`" | structure | verified | `spikes/s1-extension` is absent from the checkout and `.project/archive/001-run-unrun-spikes` exists (Get-ChildItem .project/archive) |
| "writes them to `research/raw/vitest-attach-<label>.json` under `extensionStorage`" | config | verified | spikes/probes/vitest-attach.mjs:12 - "Writes research/raw/vitest-<route>-<label>.json", i.e. `vitest-attach-<label>.json` for `--route attach` |
| "In attach mode `down` uninstalls the extension (its notes say `uninstalled extension <id>`)" | status | verified | .commandcode/skills/control-vitest-browser-angular/scripts/control.mjs:1221 - `notes.push('uninstalled extension ${state.extension.id}')` |
| "`LanguageModel.availability()` is `available` ... (attach mode); `unavailable` in bundled mode" | feature | unverifiable | a browser/model capability, not code here; `doctor --json`'s `language-model` line in both flows would settle it |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`CartService` overridden to `['pear', 'plum']` ... clicks Increment once halfway" | config | verified | spikes/ng222-app/src/app/counter.spec.ts:61 - `setup({ cartItems: ['pear', 'plum'] })` inside the hold test |
| "Or use the spike runner ... `node spikes/probes/vitest-attach.mjs --route attach --cdp-port <instance port> --label <label>`" | command | verified | spikes/probes/vitest-attach.mjs:9,37-38 - the documented invocation and its `--route attach\|chromium --cdp-port <n> [--label <name>]` usage guard |
| "`ng. getInjectorProviders` throws on the null injector at the end of the resolution path" | feature | unverifiable | Angular's own debug API, not code in this repository; a `page.frame('vitest-iframe').evaluate(...)` call on a mounted Counter would settle it |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Alternatively check lockfile in repo root: `package-lock.json` -> npm" | config | verified | package-lock.json exists at the workspace root while pnpm-lock.yaml, yarn.lock and bun.lock are all absent, so the rule selects npm |
| "Root `package.json` should have `"private": true` to prevent accidental publish" | config | verified | package.json:3 - the workspace root declares `"private": true` |
| "npm auto-symlinks workspace packages" / "`npm install @org/ui --workspace @org/app`" | command | unverifiable | package.json declares no `workspaces` field and package-lock.json holds no `"link": true` entry, so there is no workspace install here to inspect; npm's own CLI behaviour would settle it |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "note: this repository's `nx.json` contains neither" (`nxCloudId`/`nxCloudAccessToken`) | config | verified | nx.json at the workspace root holds no `nxCloud` key (Select-String 'nxCloud' over nx.json returns nothing) |
| "`ci-poll-decide.mjs` (deterministic script): takes ci_information result + state, returns action + status message" | structure | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:31-57 - reads the JSON as argv[1] plus `--timeout`, `--new-cipe-timeout`, `--env-rerun-count` and the `prev-*` flags |
| "`circuit_breaker` - Exit, no progress after 13 consecutive polls" | status | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:172 - flow comment "5. circuit breaker (13 polls) -> done (circuit_breaker)" |
| "circuit breaker (5 polls)" | status | stale | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:172 sets the threshold at 13 polls, and the same skill's own status table says 13; the "5 polls" figure in Step 4 is left over |
| "`--local-verify-attempts` ... 3" | config | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:42 - `parseInt(getArg('--local-verify-attempts') \|\| '3', 10)` |
| "`node <skill_dir>/scripts/ci-state-update.mjs post-action --action <type> [--cipe-url <url>] [--commit-sha <sha>]`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:11 - that usage line, with `cycle-check` and `gate` documented at :10 and :12 |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `ci-state-update.mjs gate --gate-type local-fix`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:10,40 - `gate --gate-type <local-fix\|env-rerun>` with the `local-fix` branch |
| "Run `ci-state-update.mjs gate --gate-type env-rerun`" | command | verified | .commandcode/skills/monitor-ci/scripts/ci-state-update.mjs:57 - the `gateType === 'env-rerun'` branch, counted against `--env-rerun-count` |
| "Parse throttle message for CI Attempt URLs (regex: `/cipes/{id}`)" | feature | unverifiable | neither ci-poll-decide.mjs nor ci-state-update.mjs matches `cipes`; that parsing happens in the agent, not in a script here. A real `self_healing_throttled` message would settle it |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run every command from the workspace root so the command finds `nx.json`" | command | verified | node_modules/nx/dist/src/nx-cloud/utilities/get-cloud-options.js:14 - getCloudOptions defaults its directory to workspaceRoot and calls readNxJson(directory) |
| "check the host (`NX_CLOUD_API` or `nxCloudUrl`)" | config | verified | node_modules/nx/dist/src/nx-cloud/utilities/get-cloud-options.js:19 - getCloudUrl returns process.env.NX_CLOUD_API, falls back to NRWL_API then https://cloud.nx.app |
| "or a workspace token in `NX_CLOUD_ACCESS_TOKEN`" | config | verified | node_modules/nx/dist/src/nx-cloud/utilities/environment.js:42 - reads process.env.NX_CLOUD_ACCESS_TOKEN from env or .env file |
| "Use `npx nx-cloud api --list-operations` to find a route" | command | unverifiable | node_modules/nx/dist/bin/nx-cloud.js:6 - the installed nx 23.3.0 shim only forwards argv[2] to a downloaded cloud client, and no "list-operations" string exists in node_modules/nx/dist; `npx nx-cloud api --help` would settle it |
| "The command already retried 3 times honoring `Retry-After`" | feature | unverifiable | a recursive search of node_modules/nx/dist for "Retry-After" finds no match, so the retry policy lives in the runtime-downloaded client; one live 429 response would settle it |
| "Run `npx nx-cloud login --status` from the workspace root" | command | unverifiable | node_modules/nx/dist/src/command-line/nx-cloud/login/command-object.js:7 - nx's login command declares only the nxCloudUrl positional (options: verbose, help), so --status must come from the downloaded client; `npx nx-cloud login --help` would settle it |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx-cloud api task-stats`" with "`-f percentiles=50 -f percentiles=95`" | command | unverifiable | no "task-stats" or "percentiles" string exists in node_modules/nx/dist (the api subcommand ships in the downloaded client, node_modules/nx/dist/bin/nx-cloud.js:6); `npx nx-cloud api --describe task-stats` would settle it |
| "`fetchedItemCount`, `pageLimitReached`, `nextCursor`" | feature | unverifiable | a recursive search of node_modules/nx/dist for "pageLimitReached" and "nextCursor" finds no match; one saved `npx nx-cloud api cipes -o page.json` file would settle the envelope shape |
| "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | command | unverifiable | no "decrypt-artifact" string in node_modules/nx/dist (checked recursively); `npx nx-cloud --help` on the downloaded client would settle it |
| "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | command | unverifiable | node_modules/nx/dist/src/command-line/import/utils/ai-output.js:3 - the only NDJSON producer shipped in nx 23.3.0 is nx import, not nx-cloud api; `npx nx-cloud api --help` would settle the flag |
| "Use `-o <file>` with an explicit extension such as `.tar.gz`" | command | unverifiable | node_modules/nx/dist/bin/nx-cloud.js:6 - the shim passes argv through to the downloaded client, so no -o handling or extension default exists in node_modules/nx; one asset download would settle it |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "A target `cache` field controls Nx replay" | config | verified | nx.json:5 - targetDefaults.build sets "cache": true, the only Nx cache switch declared in this workspace |
| "If the query reports `cache: true`, do not add another `cache: true`" | config | verified | nx.json:3-5 - build already carries "cache": true under targetDefaults, so a project-level duplicate adds nothing |
| "the workspace-local Nx command: `nx show project "$project" --json`" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:87 - command: 'project [projectName]' |
| "Use `nx-cloud-api` (`npx nx-cloud api`) for every read" | integration | unverifiable | node_modules/nx/package.json:3 ships nx 23.3.0 with bin nx-cloud pointing at ./dist/bin/nx-cloud.js, but the api subcommand is dispatched to a downloaded client (node_modules/nx/dist/bin/nx-cloud.js:6); `npx nx-cloud api --help` would settle it |
| "npx nx-cloud api 'runs/{runId}/tasks' -p runId="$run_id"" | integration | unverifiable | no `{placeholder}` or `-p` handling exists in node_modules/nx/dist; the live spec via `npx nx-cloud api --describe 'runs/{runId}/tasks'` would settle the route and parameter syntax |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Download the exact task-row artifact link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | unverifiable | node_modules/nx/dist/bin/nx-cloud.js:6 - the installed shim forwards only argv[2] to the downloaded client and contains no -o handling; one asset download would settle it |
| "decrypt a copy with `npx nx-cloud decrypt-artifact`" | command | unverifiable | a recursive search of node_modules/nx/dist finds no "decrypt-artifact" string; `npx nx-cloud --help` on the downloaded client would settle it |
| "The API cannot identify an upload path, writer, storage event, or service mutation" | feature | unverifiable | no artifact API implementation exists in the workspace (node_modules/nx/dist has only the launcher), so the limit cannot be checked locally; `npx nx-cloud api --describe` on the artifact operations would settle it |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | unverifiable | no "sandbox-report" string exists anywhere in node_modules/nx/dist, so the asset-type enum is not shipped locally; `npx nx-cloud api --describe` on the task-asset route would settle it |
| "Download the exact row-provided link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | command | unverifiable | node_modules/nx/dist/bin/nx-cloud.js:6 - argv is passed straight to the downloaded cloud client, so no -o or extension default can be confirmed in-repo; one assets download would settle it |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Query `statuses=FAILED`, `statuses=TIMED_OUT`, and `statuses=CANCELED` (the `cipes` filter accepts only terminal statuses)" | integration | verified | .commandcode/skills/monitor-ci/scripts/ci-poll-decide.mjs:211 - CIPE handling treats SUCCEEDED as done and CANCELED/TIMED_OUT/FAILED as terminal outcomes, while IN_PROGRESS and NOT_STARTED (line 237) keep polling |
| "Review failures from the last 24 hours by default" | feature | unverifiable | the skill directory has no scripts and no 24-hour constant exists in it; a recorded review run that prints its window would settle the default |
| "Query a 30-hour creation window to cover the maximum normal six-hour CI duration" | feature | unverifiable | searches of repo *.mjs, *.ts and *.md files find the 30-hour and six-hour values only in this document; a CI workflow file with job timeouts would settle the assumption |
| "the public API has no separate workflow routes" | integration | unverifiable | node_modules/nx/dist ships no route table for the public API (only the launcher, node_modules/nx/dist/bin/nx-cloud.js:6); `npx nx-cloud api --list-operations` would settle it |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "**Always use `--no-interactive`** - Prevents prompts that would hang execution" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:31-34 - option 'interactive', default true, described as "When false disables interactive input prompts for options." |
| "List all generators for a plugin: `npx nx list @nx/react`" | command | verified | node_modules/nx/dist/src/command-line/list/command-object.js:6 - command: 'list [plugin]' |
| "**Always run with `--dry-run` first**" | command | verified | node_modules/nx/dist/src/command-line/generate/command-object.js:25-29 - option 'dryRun' (alias 'd'), "Preview the changes without updating files." |
| "`nx format:write`" | command | verified | node_modules/nx/dist/src/command-line/format/command-object.js:17 - command: 'format:write' with alias 'format' |
| "Use `node -e "console.log(require.resolve('@nx/<plugin>/generators.json'));"`" | command | verified | node_modules/@nx/angular/generators.json exists, so require.resolve('@nx/angular/generators.json') returns a path for an installed plugin as the doc describes |
| "`nx run-many -t build,lint,test,typecheck`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:149 - 'targets' option with alias ['target', 't'], consumed by the run-many command at node_modules/nx/dist/src/command-line/run-many/command-object.js:11 |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx import` brings code from a source repository or folder into the current workspace, preserving commit history" | feature | verified | node_modules/nx/dist/src/command-line/import/command-object.js:13 - describe: 'Import code and git history from another repository into this repository.' |
| "`nx import <source> apps --source=apps`" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:12 - command: 'import [sourceRepository] [destinationDirectory]', with --sourceDirectory aliased 'source' at line 26 |
| "After nx `22.6.0`, `nx import` responds with .ndjson outputs" | feature | verified | node_modules/nx/dist/src/command-line/import/utils/ai-output.js:3 - "AI Agent NDJSON Output Utilities for nx import"; the installed nx is 23.3.0 (node_modules/nx/package.json:3) |
| "run `nx sync --yes`" | command | stale | node_modules/nx/dist/src/command-line/sync/command-object.js:9 - the sync builder adds only withVerbose, and node_modules/nx/dist/src/command-line/sync/sync.js reads only check and verbose, so nx 23.3.0 declares no --yes option |
| "**Pin ESLint to v9** (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | config | stale | node_modules/@nx/eslint/package.json:76 - the installed @nx/eslint 23.3.0 peer-declares "eslint": "^9.0.0 \|\| ^10.0.0", so ESLint 10 is accepted |
| "`@nx/eslint` may peer-depend on ESLint 8, causing the wrong version to resolve" | config | stale | node_modules/@nx/eslint/package.json:76 - the peer range starts at ^9.0.0, so ESLint 8 is out of range for the installed plugin |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Plugin options (set during `nx add @nx/eslint`)" with "targetName": "eslint:lint" | config | verified | nx.json:25-30 - the workspace's own plugin entry for @nx/playwright/plugin uses the same options.targetName shape ("e2e"), confirming how a plugin target name is declared |
| "`nx import` auto-detects ESLint config files and offers to install `@nx/eslint`" | integration | verified | node_modules/nx/dist/src/command-line/import/command-object.js:44 - --plugins description: "'skip' for none, 'all' for all detected, or comma-separated list (e.g., @nx/vite,@nx/jest)" |
| "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project" | feature | unverifiable | @nx/eslint 23.3.0 is installed (node_modules/@nx/eslint/package.json:3, transitively - it is absent from package.json:15-38) but nx.json:25 registers only @nx/playwright/plugin; adding @nx/eslint/plugin here would settle it |
| "`typescript-eslint@7.x` declares `peerDependencies: { "eslint": "^8.56.0" }`" | config | unverifiable | no typescript-eslint package exists in node_modules, so the peer range cannot be checked; installing typescript-eslint@7 would settle it |
| "The root `eslint@~8.57.0` (added by `@nx/eslint` init)" | config | stale | node_modules/@nx/eslint/package.json:76 - the installed plugin peer-requires ^9.0.0 or ^10.0.0, so its init cannot install eslint@~8.57.0 |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "If `@nx/gradle` is installed, run `nx show projects` to verify that Gradle projects are being inferred" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:38 - command: 'projects' under the show command |
| "The `@nx/gradle` plugin expects those files at the workspace root" | integration | unverifiable | node_modules/@nx contains angular, devkit, eslint, js, playwright, web and workspace only, so @nx/gradle is not installed; installing it against a Gradle fixture would settle the expectation |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`pnpm add -wD jest ts-jest @types/jest @nx/jest`" | command | unverifiable | @nx/jest is not installed (node_modules/@nx has no jest directory) and package.json:15-38 declares no jest dependency, so the resolution cannot be checked here; installing the set would settle it |
| "`nx run-many -t test`" | command | verified | node_modules/nx/dist/src/command-line/run-many/command-object.js:11 - command: 'run-many', with the -t alias declared at node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:149 |
| "`require('@nx/jest/preset').default`" | feature | unverifiable | no @nx/jest package or preset.js exists under node_modules; installing @nx/jest would settle the preset export |
| "Both `@nx/jest/plugin` and `@nx/vite/plugin` ... coexist without conflicts" | feature | unverifiable | neither @nx/jest nor @nx/vite is installed (node_modules/@nx listing), so no coexistence can be observed; a fixture with both plugins would settle it |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx import /path/to/source apps/web --ref=main --source=. --no-interactive" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:24-41 - --sourceDirectory (alias 'source'), --ref, and --interactive default true back all three flags |
| "**Nx plugins**: `@nx/next` (auto-installed by import)" | integration | verified | node_modules/nx/dist/src/command-line/import/command-object.js:44 - --plugins accepts "'all' for all detected" plugins, which is the auto-install path the doc relies on |
| "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | feature | unverifiable | @nx/next is not installed (node_modules/@nx lists no next directory) and no next.config.* exists in this repo; installing @nx/next in a Next.js fixture would settle the target list |
| "`create-next-app` generates a flat ESLint config using `eslint-config-next`" | feature | unverifiable | no eslint-config-next package or Next.js project exists in the workspace (root package.json:15-38); scaffolding one with create-next-app would settle it |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run workspace validation (`nx run-many -t build lint test typecheck`)" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:149 - 'targets' option with alias ['target', 't'], used by run-many (command-object.js:11) |
| "Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`" | config | unverifiable | package.json:15-38 lists neither turbo nor eslint-plugin-turbo and no turbo.json exists in the repo, so the removal step cannot be exercised; a Turborepo fixture would settle it |
| "If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs` that projects extend" | config | verified | the repo root holds only tsconfig.json (installed for the pnpm installer scripts, tsconfig.json:2-6) and no eslint.config.*, which is exactly the doc's no-root-config branch |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`pnpm add -wD vite @vitejs/plugin-react` (or `@vitejs/plugin-vue`) first, then `pnpm exec nx add @nx/vite`" | command | unverifiable | neither vite nor @nx/vite is installed (package.json:15-38 lists no vite; node_modules/@nx has no vite directory), so the init-order failure cannot be reproduced; installing both would settle it |
| "`nx sync --yes && nx reset && nx run-many -t typecheck,build,test,lint`" | command | stale | node_modules/nx/dist/src/command-line/sync/command-object.js:9 - sync declares no --yes option in nx 23.3.0, although reset (node_modules/nx/dist/src/command-line/reset/command-object.js:6) and run-many (run-many/command-object.js:11) exist |
| "`npm exec nx -- import <source> packages/<name> --source=. --ref=main --no-interactive`" | command | verified | node_modules/nx/dist/src/command-line/import/command-object.js:26 - alias 'source' for --sourceDirectory, --ref at line 29, --interactive default true at line 37 |
| "`@nx/vite/plugin` defaults `typecheckTargetName` to "vite:typecheck"" | config | unverifiable | @nx/vite is not installed, so no plugin schema or defaults exist under node_modules; installing @nx/vite would settle the default target name |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "List plugins: `npx nx list`" | command | verified | node_modules/nx/dist/src/command-line/list/command-object.js:6 - command: 'list [plugin]' |
| "Install plugins `npx nx add <plugin>`" | command | verified | node_modules/nx/dist/src/command-line/add/command-object.js:7 - command: 'add <packageSpecifier>' |
| "Example: `npx nx add @nx/react`" | command | unverifiable | @nx/react is not installed here (node_modules/@nx lists angular, devkit, eslint, js, playwright, web, workspace) and package.json:15-38 omits it, so the example cannot be exercised; a registry install would settle it |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nx show project <projectname> --json` ... contains a `targets` section" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:87 - command: 'project [projectName]' |
| "`nx run-many -t build test lint typecheck` ... a `-p` flag to filter to specific projects" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:268 - 'projects' option with alias 'p', plus the -t alias at line 149 |
| "`--parallel` to control the number of parallel processes (default is 3)" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:65 - "Max number of parallel processes [default is 3]." |
| "`--exclude` to exclude projects" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:32 - option('exclude') "Exclude certain projects from being processed." |
| "`nx affected -t test --base=main --head=HEAD`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:210 and :215 - the 'base' and 'head' options used by affected |
| "`--skipNxCache`, `--verbose`, `--nxBail`, `--configuration=<name>`" | command | verified | node_modules/nx/dist/src/command-line/yargs-utils/shared-options.js:109 skipNxCache, :165 verbose, :95 nxBail, :157 configuration |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use `nx show projects` to list projects in the workspace" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:38 — command 'projects', describe 'Show a list of projects in the workspace.' |
| "The project filtering syntax (`-p`/`--projects`) works across many Nx commands" | feature | verified | node_modules/nx/dist/src/command-line/show/command-object.js:45 — option 'projects', 'Show only projects that match a given pattern' |
| "Do NOT read `project.json` directly - it only contains partial configuration" | feature | verified | nx.json:25 — a plugins array (@nx/playwright/plugin, targetName e2e) infers targets, so project.json cannot hold the resolved config |
| "You can read the full project schema at `node_modules/nx/schemas/project-schema.json`" | structure | verified | node_modules/nx/schemas/project-schema.json — the installed Nx package ships project-schema.json and nx-schema.json at that path |
| "nx graph --print" | command | verified | node_modules/nx/dist/src/command-line/graph/command-object.js:30 — option 'print', 'Print the project graph to stdout in the terminal.' |
| "nx sync / nx reset  # if sync doesn't fix stale cache" | command | verified | node_modules/nx/dist/src/command-line/sync/command-object.js:7 and .../reset/command-object.js:6 — both commands exist in Nx 23.3.0 |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "nx show projects --affected" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:41 — option 'affected', 'Show only affected projects.' |
| "nx show projects --affected --base=origin/main" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:69 — `.implies('base', 'affected')` |
| "nx show projects --affected --base=abc123 --head=def456" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:70 — `.implies('head', 'affected')` |
| "nx show projects --affected --uncommitted" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:67 — `.implies('uncommitted', 'affected')` |
| "nx show projects --affected --untracked" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:66 — `.implies('untracked', 'affected')` |
| "nx show projects --affected --exclude=\"*-e2e\"" | command | verified | node_modules/nx/dist/src/command-line/show/command-object.js:77 — example '$0 show projects --affected --exclude=*-e2e' |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | status | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:11 — "Exit 0 pass; 1 with `Error: CLAIM: ...` when the claim fails; 2 when it could not run." |
| "`state` records each instance's backend, requested backend and performance class in `state.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:10 — "Writes: <dir>/state.json" (written at :205) |
| "`model-init` records the init timings and answer in `model-init.json`" | structure | verified | .commandcode/skills/verify-ai-browsers/checks/model-init.mjs:9 — "Writes: <dir>/model-init.json" (written at :43) |
| "`health-check.md` `health-doctor`" | structure | verified | .commandcode/skills/control-ai-browsers/features/health-check.md:9 — "- `health-doctor` runs every check against one instance." |
| "the check exits 2 for an instance serving another checkout's folder" | feature | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:67 — "A shared instance may serve another checkout's build; proving that one would prove nothing about this checkout." |
| "an Angular dev page (control-angular-dev-app `up --target counter`)" | integration | verified | .commandcode/skills/verify-ai-browsers/checks/extension-panel.mjs:9 — "such as the counter fixture (control-angular-dev-app up --target counter)" |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "artifacts: `{up.evidenceDir}/<file>`, where `<file>` is `extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | .commandcode/skills/verify-angular-devtools/checks/extension-enabled.mjs:7, attached.mjs:9 and coexist.mjs:11 — "Writes: <dir>/extension.json", "<dir>/attach.json", "<dir>/coexist-result.json" |
| "plus `--di-graph` for `coexist`" | command | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:10 — "Usage: node .../coexist.mjs --out <dir> [--di-graph]"; :66 passes ['coexist', '--di-graph'] |
| "`profiler.md` Coexistence; `signal-graph.md` Agreement and the `angular:di_graph` regression; `attach.md` Connected flag" | structure | verified | .commandcode/skills/control-angular-devtools/features/ — holds profiler.md, signal-graph.md and attach.md (with install.md for the extension row) |
| "`coexist --di-graph` leaves the page's signal graph broken until reload; nothing may run after it on that page" | feature | verified | .commandcode/skills/verify-angular-devtools/checks/coexist.mjs:9 — "Needs: control-angular-devtools up --app-url <the counter fixture>; with --di-graph, run it last on that page." |
| "a bare `install` copies from Lars's Edge Dev profile, which a proof run never reads" | feature | unverifiable | not settled by the check scripts; settled by control-angular-devtools/scripts/control.mjs's install branch and its --from default |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin 0.0.7 declared and installed" | config | verified | .commandcode/skills/verify-pangular-inspector/checks/setup.mjs:3 — "the exact pin 0.0.7 declared and installed"; the portal's package.json:54 declares "@pangular-inspector/devtools": "0.0.7" |
| "`setup.md` `setup.check`" | structure | verified | .commandcode/skills/control-pangular-inspector/features/ — holds setup.md, navigation.md, live-inspection.md and README.md |
| "`tools/list` offers no action tool" | feature | verified | .commandcode/skills/control-pangular-inspector/scripts/control.mjs:76 — ACTION_TOOLS lists highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api |
| "artifacts: `{up.evidenceDir}/contract-list.png` and `{up.evidenceDir}/live-reads.json`" | structure | verified | .commandcode/skills/verify-pangular-inspector/checks/live-reads.mjs:11 — "Writes: <dir>/before.yml, after.yml, contract-list.png, doctor.json, one JSON per read, live-reads.json." |
| "The setup steps need ports 3000 and 9999 free (both fixed)" | config | unverifiable | 9999 is fixed at .commandcode/skills/control-pangular-inspector/scripts/control.mjs:74 (DEFAULT_PORT = 9999); the portal's port 3000 lives in the portal checkout, outside this repository |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular unit-test builder is pinned to include only `**/*.spec.ts`" | config | verified | apps/angular-ai-devtools/project.json:118 — test target `include` is `["**/*.spec.ts"]` with `exclude` `["**/*.node.test.ts"]` at :121 |
| "`tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | apps/angular-ai-devtools/tsconfig.spec.json:14 — `"src/**/*.node.test.ts"` in `exclude` |
| "`node:test` suites are named `*.node.test.ts` and run with `node --experimental-strip-types --test`" | command | verified | package.json:9 — `"test": "node --experimental-strip-types --test \"scripts/**/*.test.mjs\" ..."`; package.json:10 runs the skills suites the same way |
| "Never put a `node:test` suite under `*.spec.ts` — the builder compiles it and the app test target fails with TS2591" | status | unverifiable | no test runner may be run in this audit; `nx test angular-ai-devtools` with one stray `*.spec.ts` node suite would settle it |
| "only `angular-new-app` should remain explicit-only (`disable-model-invocation: true`)" | config | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\angular-new-app\SKILL.md:9 — `disable-model-invocation: true`; angular-developer\SKILL.md has no such key |
| "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | feature | unverifiable | the portal lives outside this repository; its package.json and form imports would settle the migration half |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "neither word may appear in DevTools code, UI or runtime text" ("blessed" / "ordained") | status | verified | a search of src/ and extension/ (excluding the generated extension/panel bundle) for `blessed` and `ordained` returns no hits |
| "`provideAiDevTools()` not `provideAiDevtools()`" | config | aspirational | no `provideAiDevTools` export exists in src/, apps/ or extension/; the identifier appears only in docs/feature-proposals.md and plans/angular-ai-devtools-proposals.handoff.md, so the casing rule governs an API not yet written |
| "`provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | config | aspirational | same gap: no source file exports it, so the corrected casing is a rule for future code |
| "no em dashes or curly quotes" in docs | status | unverifiable | no linter or script in the repository enforces it; a text scan of docs/ plus a ruling on acceptable characters would settle it |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Built-in AI (Prompt API) calls are panel-local by design" | feature | verified | extension/panel/chunk-C9Uts9mc.js:1 is the only `LanguageModel` access in extension/ outside tests; extension/agent-main.test.mjs:124 asserts the MAIN-world script carries none |
| "The MAIN-world script is limited to reading the page ... it never runs Prompt API" | structure | verified | extension/manifest.json:28 — `agent-main.js` is registered as a content script with `"world": "MAIN"`; extension/agent-main.test.mjs:123 asserts that file contains no Prompt API code |
| "Removing `panel/**` from `web_accessible_resources` is conditional: keep it if any proposed feature needs it" | config | verified | extension/manifest.json declares no `web_accessible_resources` key at all, so `panel/**` is not web-accessible today; nothing in the manifest needs it back |
| "per-package secondary entry points such as `provideAiNgrxDevTools()`" | structure | aspirational | no package.json `exports`/ng-packagr entry point and no source export of that name exists in src/, apps/ or extension/ |
| "The product is only a web (browser) extension" | structure | verified | extension/manifest.json:2-3 — MV3 manifest named "Angular AI DevTools" with a `devtools_page`; it is the only shipped artifact |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the `command-code` CLI and all skills/agents are installed globally in `~/.commandcode/`" | structure | verified | C:\Users\LarsGyrupBrinkNielse\.commandcode\agents\ holds 32 pinned agent types and \skills\ holds the globally installed skill set (angular-new-app, angular-developer, and others) |
| "On this machine, global npm packages/node_modules live under `D:\packages\npm-global`" | config | verified | `Test-Path 'D:\packages\npm-global'` returns True |
| "start AI browser instances only through `control-ai-browsers up`, which adds the Edge sign-in and sync switches" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json:31 — `"--disable-sync"`; :32 the `--disable-features=msImplicitSignin,...msEdgeSignInAccountPicker,...` list |
| "Keep browser profiles and downloaded AI models ... on `D:/`, never `C:/`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:2 — `"profilesRoot": ".browsers"`, resolved under the D: worktree root rather than the user profile |
| "verify with `nx test angular-ai-devtools --include=<path>` rather than `--testPathPattern=`" | command | verified | apps/angular-ai-devtools/project.json:2 `"name": "angular-ai-devtools"` and :113-118 the test target, whose `include` option is what `--include` overrides |
| "Prefers `.mjs` (ESM) script format with `node:` protocol imports ... in `scripts/`" | structure | verified | package.json:8 — `npm run check` runs `node scripts/ensure-sidecar-deps.mjs`; package.json:9 runs `scripts/**/*.test.mjs` suites |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pair every tool, fixture or runtime the project adopts with a `control-{name}` skill and a `verify-{name}` skill" | structure | verified | .commandcode/skills/ pairs control-ai-browsers/verify-ai-browsers, control-angular-devtools/verify-angular-devtools, control-pangular-inspector/verify-pangular-inspector; control-vitest-browser-angular still has no verify- counterpart |
| "only hand-maintained source/static entry files such as `index.html` and `favicon.ico` should remain tracked" | config | verified | .gitignore:33-35 — `extension/panel/*`, then `!extension/panel/index.html` and `!extension/panel/favicon.ico` |
| "Gitignore `.playwright-cli/`" | config | verified | .gitignore:1 — `.playwright-cli/` |
| "AI browser verification should be run both with feature flags enabled and with `--no-ai-features`" | command | verified | .commandcode/skills/control-ai-browsers/SKILL.md:262 documents `up <name> ... [--no-ai-features]`; control.mjs:2074 drops `--enable-features` when the flag is set |
| "validates it programmatically (check_docs_audit.py ...)" | status | unverifiable | no check_docs_audit.py exists anywhere under C:\Users\LarsGyrupBrinkNielse\.commandcode (recursive search); the gsd-path inspect script that owns it would settle the name |
| "follows the Conventional Commits format (e.g. `feat:`, `fix:`, `chore:`)" | structure | verified | git log — `3fb21f1 chore(project): admit programme 1 scope, record the standing grant, resolve the open question` uses the type(scope): subject form |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | package.json:31 — "typescript": "6.0.3" |
| "The automatic bridge (`scripts/sidecar-deps-bridge.mjs`) now creates and removes the junction for you" | feature | verified | scripts/sidecar-deps-bridge.mjs:118 creates the junction (dir symlink on POSIX), :128-133 removes it; package.json:7 makes `npm run check` start with scripts/ensure-sidecar-deps.mjs, which imports that bridge |
| "`.claude/skills/` holds byte copies of them ... The other `.claude/skills/` folders are older copies, not kept in step" | structure | verified | content comparison of `.claude/skills/<name>/SKILL.md` against `.commandcode/skills/<name>/SKILL.md`: control-ai-browsers and verify-ai-browsers identical, control-angular-dev-app and verify-pangular-inspector differ |
| "`edge-dev-aion` runs with `--disable-component-update` and a pin of model 2026.10.15.1, runtime 2026.10.12.1 and manifest 2026.10.19.1" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion args ["--disable-component-update"] with pin ["EdgeLLMOnDeviceModel","EdgeLLMRuntime","EdgeOptimizationGuideModelsManifest"]; the version triple itself lives in the profile pin, not the repository |
| "`toSignal(this.subject)` at line 14 and an unlabelled `effect` whose body calls `subject.error(...)` at line 22" | feature | verified | spikes/ng222-app/src/app/stale-view-fixture.ts:14 — readonly signal = toSignal(this.subject); :22 — this.subject.error(new Error('interop')) inside effect() |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:15`)" | feature | verified | apps/angular-ai-devtools/src/app/app.routes.ts:15 — { path: 'interop', component: InteropComponent } |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "committed `d5c7125`" | status | verified | git -C D:\projects\sandbox\angular-ai-devtools cat-file -t d5c7125 — commit present in local history |
| "Fixed the flaky portal `up` in control-angular-dev-app ... `907f391`" | status | verified | git cat-file -t 907f391 — commit present |
| "Committed the AI-browser rework after rerunning its checks ... `41c954d`" | status | verified | git cat-file -t 41c954d — commit present |
| "Vitest Browser work committed after re-running ng test ... `c929050`" | status | verified | git cat-file -t c929050 — commit present |
| "no push, PR, tag or filing (upstream bugs go to `docs/filing-ledger.md`)" | status | verified | docs/filing-ledger.md — eleven entries, each "Status: draft, not filed" |
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | structure | stale | .commandcode/skills holds seven of those eight folders: control-ai-browsers, verify-ai-browsers, control-angular-dev-app, control-angular-devtools, verify-angular-devtools, control-pangular-inspector, verify-pangular-inspector — no verify-angular-dev-app exists today |

## Doc: docs/autonomy-gaps.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scripts/autonomy-gaps.test.mjs` rule `G1`" | structure | verified | scripts/autonomy-gaps.test.mjs:95 — test('G1 prompt pin: the orchestrator prompt forbids reading %ERRORLEVEL% and names the helper JSON and $LASTEXITCODE') |
| "`G7 playbook pin: the playbook records the duplicated section heading and the one-replacement rewrite`" | structure | verified | scripts/autonomy-gaps.test.mjs:144 — identically named test |
| "`G9 static pin: the chromium reading survives a checkout with no playwright install`" | structure | verified | scripts/autonomy-gaps.test.mjs:210 — identically named test |
| "`scripts/user-scope-autonomy.test.mjs` rule `P4`" | structure | verified | scripts/user-scope-autonomy.test.mjs:660 — test('P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails') |
| "`scripts/docs-audit-disposition.test.mjs` rule `E6`" | structure | verified | scripts/docs-audit-disposition.test.mjs:536 — test('E6 queue numbers stay unique, increasing and bound to their items') |
| "tests 15 / pass 15 / fail 0 ... tests 18 / pass 18 / fail 0" | status | unverifiable | the files declare 15 (autonomy-gaps) and 18 (user-scope-autonomy) test() cases, consistent with the quoted totals; the pass counts are run output and were not re-run here |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The tutor teaches modern Angular on the app that the learner already has open" | feature | aspirational | no tutor code exists: extension/ contains no find_components or di_path tool, and the doc's own status line reads "design only, nothing built or run" |
| "component keys from `find_components`, signal labels from `list_signals`, injectors from `di_path`" | feature | aspirational | those tool names appear in docs/feature-proposals.md:1012 and the backlog, not in extension/ or apps/angular-ai-devtools/src — the tools are planned, not shipped |
| "a single structured-output question measured 25-34 s median on Gemma 4 CPU and 11-14 s on Gemma 4 GPU" | status | verified | docs/feature-proposals.md:141-142 — Gemma 4 GPU low tier 11-14 s, Gemma 4 CPU 25-34 s median per question |
| "the CLI MCP server's `ai_tutor` tool [documented, 02 section 4.4; tool in source at `ai-tutor.ts:14`]" | structure | verified | research/02-angular-surface.md:250 — table row `ai_tutor` with source `ai-tutor.ts:14,37-38` |
| "The proposed tutor can run with no model" | feature | aspirational | design only: no shipped text, card or grader exists in extension/ or apps/angular-ai-devtools/src |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The context window is small: 7,168 tokens on Aion and 9,216 on the Chrome models and Phi-4-mini" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — model.contextWindow 7168 for edge-dev-aion and 9216 for chrome-beta-nano, chrome-beta-gemma4, chrome-stable-nano and edge-phi4mini |
| "the first release has six features (N1 to N4, N24 and N25); N6 has no replacement" | status | verified | apps/angular-ai-devtools/src/app/app.routes.ts:11-16 — six panel routes: N1 (''), signal-provenance (N2), di-doctor (N3), error-explainer (N4), stale-view (N24), interop (N25), and none for N6 |
| "the dependency question was regraded with the grader fix in `916fc09`" | status | verified | git -C D:\projects\sandbox\angular-ai-devtools cat-file -t 916fc09 — commit present in local history |
| "`spikes/probes/bench.js`" | structure | verified | spikes/probes/bench.js is in the tree, alongside the regrade and argument-repair probes the section cites |
| "Native tools when the browser is Edge, `contextWindow` is 7,168 (Aion as measured) ... and the native canary passes" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion: browser edge-dev, model.contextWindow 7168, model.toolCanary true |
| "N27's Tier 1 lessons ... (`docs/design/tutor.md` section 8)" | structure | verified | docs/design/tutor.md:503 — "## 8. Tiers and dependencies", the section holding the lesson tiers the proposals point at |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@pangular-inspector/devtools` 0.0.7 (npm)" | config | verified | portal package.json:54 — "@pangular-inspector/devtools": "0.0.7" in D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools |
| "`.claude/skills/control-pangular-inspector/SKILL.md:172` (0.0.7 has no `list-components`; added in 20ebbb9; 46 tools with `--read-only`)" | structure | stale | .claude/skills/control-pangular-inspector/SKILL.md:172 is an `install` table row; the cited facts sit at :221-223 of the same file |
| "the in-page AI tool `angular:di_graph` (`packages/core/src/debug/ai/di_graph.ts`)" | structure | unverifiable | Angular's source is not vendored here (no packages/ tree); settled by reading the 22.2.x clone the entry names |
| "`spikes/probes/tool-name-matrix.js`, run 2026-10-12" | structure | verified | spikes/probes/tool-name-matrix.js is tracked, with the run recorded at research/raw/tool-name-matrix-gemma4-gpu.json |
| "`verify-angular-devtools` run, `tmp/verify-angular-devtools/20261011-192415.460/` (gitignored)" | status | unverifiable | tmp/ is gitignored and absent from this checkout (no tmp/control-ai-browsers/pins either); the cited run directory would settle it |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the veto at `CHARTER.md:65` is lifted" | status | verified | .project/CHARTER.md:65 — "No Tier 2 (app opt-in `globalThis` export) features in this program; the" (the veto the ruling lifts) |
| "The panel **is already** an Angular application (`apps/angular-ai-devtools`, `projectType: application`, `build-extension` → `extension/panel`, `baseHref: /panel/`)" | structure | verified | apps/angular-ai-devtools/project.json:4 "projectType": "application"; :52 the build-extension target; :76 "baseHref": "/panel/" |
| "Initial-bundle budget is a hard 520 KB" | config | stale | apps/angular-ai-devtools/project.json:82-83 — 520kb is the initial maximumWarning and maximumError is "1mb", so 520 KB is a warning threshold, not a hard budget |
| "M001-M017 was actually grown (17 entries, never one dispatch)" | status | verified | .project/ROADMAP.md — 17 entries from ### M001 - run-unrun-spikes to ### M017, counted by heading |
| "bind `gsd-path/M018`, which retires `gsd-path/M017`" | status | verified | .project/ROADMAP.md holds no ### M018 heading, so generation 1 is still unbound, as the backlog states |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "head `fbe3aac` at writing (2026-10-12)" | status | verified | git -C D:\projects\sandbox\angular-ai-devtools cat-file -t fbe3aac — commit present in local history |
| "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | status | verified | docs/feature-proposals.md is 1110 lines, read 2026-11-01 |
| "eleven drafts (the eleventh, the `LanguageDetector`/`Translator` worker crash, is at `docs/filing-ledger.md:230`)" | structure | verified | docs/filing-ledger.md:230 — "## 11. Chromium (Blink>AI): ... LanguageDetector.availability() ... in a dedicated worker crashes the renderer" |
| "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — port fields 9333, 9334, 9335, 9337 and 9338 on those instance keys |
| "**Skills (project):** in `.claude/skills/`" | structure | stale | the maintained tree is `.commandcode/skills/` (it carries the nx-* skills too, absent from .claude/skills) and scripts/skills-mirror.test.mjs enforces which `.claude` folders are byte copies |
| "`spikes/probes/`: bench.js, regrade.mjs, arg-repair-replay.mjs, and the zone-mode, effect-writes, tosignal, ssr-* and vitest-* probes" | structure | verified | spikes/probes/ holds bench.js, regrade.mjs, arg-repair-replay.mjs, zone-mode.js, effect-writes.js, tosignal-node.js, five ssr-*.js probes and vitest-attach.mjs, vitest-lib.mjs, vitest-iframe-probe.js |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spawnSync `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:253`" | config | verified | .commandcode/skills/verify-ai-browsers/checks/state.mjs:253 — timeout: 600000 inside the control.mjs spawnSync options |
| "`timeoutMs` 1800000 for the `extension-panel` step and 900000 for `state` (`.commandcode/skills/verify-ai-browsers/SKILL.md:49,71`)" | config | verified | .commandcode/skills/verify-ai-browsers/SKILL.md:49 — "`timeoutMs` 1800000"; :71 — "set `timeoutMs` for every instance (900000 was enough for four on 2026-10-16)" |
| "`chrome-stable-nano` (Gemini Nano), `chrome-beta-gemma4` (Gemma 4), `edge-phi4mini` (Phi-4-mini) and `edge-dev-aion` (Aion-1.1-Instruct)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — model.name v3Nano on chrome-stable-nano, gemma4-2b-it on chrome-beta-gemma4, Phi-4-mini-instruct on edge-phi4mini, Aion-1.1-Instruct on edge-dev-aion |
| "Ports 9333-9338 belong to the shared instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — instances on 9333, 9334, 9335, 9337 and 9338 (9336 is the one free port in that range) |
| "`chrome-beta-nano` ... stays registered as a spare driver and unit-test fixture but is not part of the verified set" | config | verified | .commandcode/skills/control-ai-browsers/instances.json still registers chrome-beta-nano on port 9333 with model v3Nano, alongside chrome-stable-nano |
| "Check that port 9992 is free" | config | unverifiable | no 9992 anywhere under .commandcode/skills; the lars-verify run harness configuration would settle it |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`--disable-component-update` stays on" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion carries args ["--disable-component-update"] |
| "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | config | unverifiable | the pin array in instances.json names the three components (EdgeLLMOnDeviceModel, EdgeLLMRuntime, EdgeOptimizationGuideModelsManifest) but not their versions, and the versioned pin store lives under tmp/control-ai-browsers/pins, absent from this checkout |
| "`model.contextWindow` 7168" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — edge-dev-aion model.contextWindow 7168 |
| "`model download` refuses on `edge-dev-aion` while the switch is on" | feature | unverifiable | not assertable without a launch; the refusal would appear in control-ai-browsers/scripts/control.mjs's model download guard, which three lookups did not settle |
| "`node --test scripts/skills-mirror.test.mjs` enforces [a byte-identical copy]" | structure | verified | scripts/skills-mirror.test.mjs exists in the tree and package.json:9 runs scripts/**/*.test.mjs through node --test |
| "`EdgeOptimizationGuideModelsManifest`" | feature | verified | .commandcode/skills/control-ai-browsers/instances.json — the edge-dev-aion pin list includes EdgeOptimizationGuideModelsManifest next to the model and runtime folders |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/probes/ep-trials.sh` sets the provider list in Aion's `genai_config.json` with `set-genai-provider.mjs`" | feature | verified | spikes/probes/ep-trials.sh:17 — invokes set-genai-provider.mjs with the config and the provider name |
| "restarts the instance through `control-ai-browsers` `stop` and `launch`" | command | stale | spikes/probes/ep-trials.sh:18 — restarts with `control.mjs up edge-dev-aion`; .commandcode/skills/control-ai-browsers/scripts/control.mjs:3024 lists verbs instances/up/attach/detach/doctor/flags/model/run/panel/down/bench/info, with no `stop` or `launch` |
| "`qnn` (`QnnHtp.dll`, Qualcomm NPU)" | config | verified | spikes/probes/set-genai-provider.mjs:8 — the qnn entry is `backend_path: 'QnnHtp.dll'` |
| "reads 1 GB sequentially in 4 MB blocks with `FILE_FLAG_NO_BUFFERING`" | feature | verified | spikes/probes/read-throughput.ps1:1,6 — header names FILE_FLAG_NO_BUFFERING and `$block = 4MB` |
| "Each instance runs with its own `--user-data-dir` under `.browsers/` (gitignored, on D:)" | config | verified | .gitignore:11 — `.browsers/` is ignored; spikes/probes/relaunch-instance.ps1 exists for the per-instance relaunch |
| "tool names are lowercase (snake_case recommended for readability)" | feature | verified | docs/feature-proposals.md:197 — the same rule, sourced to S11, is written into the proposals |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "spike S1 ran it (`11-spike-s1-extension-contexts.md`), with the AI feature flags on" | status | verified | research/s1-results/chrome-fresh.json:21,29 — launchArgs carry `--enable-features=AIPromptAPI,AIPromptAPIToolUse,...,WebMCP` and a per-context `results` block is recorded |
| "Content script: Probably yes, with web-page semantics [inferred]" | feature | verified | research/s1-results/chrome-fresh.json:30-39 — the `content_isolated` result has `permissionsPolicyAllowsLanguageModel: true` and `typeofLanguageModel: "function"` |
| "Angular has experimental WebMCP support: `provideExperimentalWebMcpTools([...])` from `@angular/core`" | feature | unverifiable | `node_modules` is absent at 3fb21f1 and no repo file references the symbol; `node_modules/@angular/core/index.d.ts` after `npm ci` would settle it |
| "The entry point is now `document.modelContext`, not `navigator.modelContext`" | feature | unverifiable | No repo artifact reads either global (grep over `extension/` and `src/` finds no `modelContext`); a page probe with `--enable-features=WebMCP` would settle it |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ng` is the expando key `GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'` (`packages/core/src/render3/util/global_utils.ts:69`)" | structure | verified | packages/core/src/render3/util/global_utils.ts:69 — `export const GLOBAL_PUBLISH_EXPANDO_KEY = 'ng';` in the angular 22.2.x clone |
| "`publishUtil` does `w.ng ??= {}; w.ng[name] = fn`" | structure | verified | packages/core/src/render3/util/global_utils.ts:239-240 — `w[GLOBAL_PUBLISH_EXPANDO_KEY] ??= {}` then `[name] = fn` |
| "Router adds three more entries only from `provideRouter()` in dev mode (`packages/router/src/provide_router.ts:108-113`)" | structure | verified | packages/router/src/provide_router.ts:110-112 — `publishNonCoreGlobalUtil('ɵgetLoadedRoutes' …)`, `('ɵgetRouterInstance' …)`, `('ɵnavigateByUrl' …)` |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "package `@pangular-inspector/devtools` 0.0.7, extension manifest 0.0.7" | config | verified | packages/devtools/package.json — `"version": "0.0.7"`; extension/manifest.json:4 — `"version": "0.0.7"` in the pangular clone at 76c09d0 |
| "last commit `76c09d0` (2026-10-11)" | status | verified | `git -C D:\projects\github\pangular-inspector\devtools log --oneline -1` — 76c09d0 fix(overlay): follow the pointer inside a shadow root while picking (#306) |
| "No `permissions`; host permissions for loopback only (`*.localhost`, `127.0.0.1`, `[::1]`)" | config | verified | extension/manifest.json:9-18 — `"permissions": []` and the six `http(s)://*.localhost/*`, `127.0.0.1`, `[::1]` host permissions |
| "other hosts via `optional_host_permissions` granted per host" | config | verified | extension/manifest.json:19 — `"optional_host_permissions": ["http://*/*", "https://*/*"]` |
| "Fixed extension id via manifest `key`" | config | verified | extension/manifest.json:5 — the `key` field holds an RSA public key, which fixes the extension id |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`D:\projects\github\ngrx\platform` (NgRx 22.0.0, `modules/store/package.json`)" | config | verified | modules/store/package.json — `"version": "22.0.0"` in that clone |
| "`window.__REDUX_DEVTOOLS_EXTENSION__` is read in a provider factory, `createReduxDevtoolsExtension()`, `modules/store-devtools/src/provide-store-devtools.ts:34-45`" | feature | verified | modules/store-devtools/src/provide-store-devtools.ts:34-45 — the factory reads `window['__REDUX_DEVTOOLS_EXTENSION__']` and returns it or null |
| "Target: an Angular 22.2 dev-mode app" | status | stale | package.json:35-40 — every `@angular/*` dependency is pinned `~22.1.0`, so this workspace is on 22.1.x, not 22.2 |
| "A content script with `world: \"MAIN\"` and `run_at: \"document_start\"` can install globals" | feature | unverifiable | extension/manifest.json:24-28 — this repo's MAIN-world `agent-main.js` is declared at `run_at: \"document_idle\"`, so no repo artifact shows a `document_start` install; a spike manifest with `document_start` would settle it |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "edge-phi4mini (port 9337): Phi-4-mini-instruct GPU" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — `edge-phi4mini` has `"port": 9337`, browser `edge-stable`, model `Phi-4-mini-instruct`; note research/00-browser-probe.md:141 still says 9336 |
| "All four per-model instances verified healthy via `control-ai-browsers doctor` (exit 0)" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:3024 — `doctor` is a listed verb, and instances.json defines chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini |
| "generated with `@angular/cli@22.2.2 new --routing --ssr=false`, installed `@angular/core` 22.2.2" | config | verified | spikes/ng222-app/package.json — `"@angular/cli": "^22.2.2"` and `"@angular/core": "^22.2.0"` (caret ranges, not exact pins) |
| "served with `ng serve --port 4222`" | command | unverifiable | No `4222` in spikes/ng222-app/angular.json or spikes/ng222-app/README.md; the port lives in the CLI invocation, so a serve config or script entry would settle it |
| "`angular:di_graph` output on this one-component app ... is **42,788 characters**" | feature | unverifiable | No committed probe output carries the character count; re-running spikes/probes/s2b.js against spikes/ng222-app would settle it |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "commit `747c3c2` (message \"release: cut the v22.1.0-next.4 release\", 2026-07-01)" | status | verified | `git -C D:\projects\github\angular\skills log --oneline -1` — `747c3c2 … release: cut the v22.1.0-next.4 release`, dated Wed Jul 1 21:15:44 UTC 2026 |
| "2 skills, 37 reference files, README, BUILD_INFO" | structure | verified | The clone has exactly the `angular-developer` and `angular-new-app` directories, and `angular-developer/references` holds 37 files |
| "whole reference corpus is 135,754 bytes (measured, `wc -c`)" | structure | verified | `Measure-Object Length -Sum` over the 37 files in angular-developer/references returns 135754 |
| "No LICENSE file (see section 4)" | structure | verified | `Test-Path D:\projects\github\angular\skills\LICENSE` is False in the clone at 747c3c2 |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/probes/tool-name-matrix.js` (five variants including empty `properties` with a snake_case name)" | feature | verified | spikes/probes/tool-name-matrix.js:11-15 — the five variants are get_component_count with param, get_component_count with empty properties, getComponentCount, getcomponentcount, Get_component_count |
| "the hard rule is lowercase names, because an uppercase letter crashes Gemma 4; snake_case is recommended for readability" | feature | verified | docs/feature-proposals.md:197 — the same S11 rule is written into the proposals, with the snake_case recommendation split out |
| "it cannot fit a 7-9K window" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — `contextWindow` 9216 for chrome-beta-nano and chrome-beta-gemma4, 7168 for edge-dev-aion |
| "both measured browsers use `callID` (Edge rejects `callId`; Gemma 4 in Chrome Beta returns `callID: \"\"`)" | feature | unverifiable | No committed artifact records the tool-call member name; the tool-call parts in research/s1-results or a fresh `create({tools})` probe would settle it |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "F8 \| 21.0 (`enableProfiling`)" | feature | verified | packages/core/src/render3/debug/chrome_dev_tools_performance.ts:369-374 — `@publicApi v21.0` sits directly above `export function enableProfiling()` |
| "Practical floor: the target is 22.2, so every idea works there" | status | stale | package.json:35-40 — every `@angular/*` entry is `~22.1.0`, so nothing in this workspace resolves to 22.2 |
| "22.2 for annotations" (WebMCP tool annotations) | feature | verified | CHANGELOG.md:20 — `feat … support annotations in WebMCP tool declarations` in the 22.2.0 release; the doc cites CL:21, one line lower |
| "No idea was run" | status | verified | src/ and extension/ contain no tool registry and no reference to `signal_dependencies` or `list_components` (grep over src/ returns nothing), so none of the section 4 ideas is implemented |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Measured behaviour: `05-spikes.md`, section \"Root cause hunt\"" | structure | verified | research/05-spikes.md:125 — `## Root cause hunt: "The device is unable to create a session to run the model" (Gemini Nano, native tool calling)` |
| "See `05-spikes.md`, \"Prediction confirmed: Nano gets tool sessions with `AIPromptAPIToolUse` alone\"" | structure | verified | research/05-spikes.md:146 — the heading exists as a level-3 section titled Prediction confirmed: Nano gets tool sessions with AIPromptAPIToolUse alone (measured) |
| "Blink allows tool use only when the runtime feature `AIPromptAPIToolUse` is on" | config | verified | .commandcode/skills/control-ai-browsers/instances.json — `chrome-beta-nano` enables `AIPromptAPIToolUse` and no `OnDeviceModelConversationBackend`/`model_version/v4`, the gate-only shape the doc predicts |
| "The probe measured **`NotSupportedError`**" | feature | unverifiable | The nine probe rows recording it are prose in research/05-spikes.md:133-137; no JSON under research/raw carries the DOMException name, so a re-run of the tool-session matrix would settle it |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`instances.json` `profilesRoot: \".browsers\"`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:2 — `"profilesRoot": ".browsers"` |
| "`spikes/probes/bench/nano.json` and `spikes/probes/bench.js:62`" | structure | verified | spikes/probes/bench.js:60-66 — the five-question `questions` array; line 62 is the title-input question the BJ figures are scored on |
| "the file was overwritten by the second benchmark round (it now holds the CPU run, native 1/15, fallback 0/15)" | status | verified | research/raw/bench/nano.json — `modes.native.runPasses` = "1/15" and `modes.fallback.runPasses` = "0/15" |
| "the instance is `edge-phi4mini`, and profiles live under the primary checkout's `.commandcode/worktrees/.browsers/<name>`" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:171-173 — instance key `edge-phi4mini`, browser `edge-stable`, port 9337; profilesRoot at line 2 |
| "Chromium ... `runtime_enabled_features.json5` at tag `156.0.8078.17`, lines 485-500" | structure | unverifiable | No Chromium checkout in D:\projects\sandbox\angular-ai-devtools (no third_party tree); a local copy of that tagged file would settle it |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the tool names of `probe10.js` (`get_component_count`, `get_component_inputs`)" | structure | verified | spikes/probes/probe10.js:15-16 — `name: 'get_component_count'` and `name: 'get_component_inputs'` |
| "`getComponentCount` and `getComponentInputs` (`probe5.js:15-16`)" | structure | verified | spikes/probes/probe5.js:15-16 — the camelCase names at exactly those lines |
| "the standing Gemma 4 (Chrome Beta, port 9334) and Aion (Edge Dev, port 9335) instances" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:101 — `chrome-beta-gemma4` port 9334; :135 — `edge-dev-aion` port 9335 |
| "`contextWindow` 9216 ... 7168" | config | verified | instances.json:128 — gemma4 `contextWindow: 9216`; :166 — Aion `contextWindow: 7168` |
| "Extension: `spikes/s1-extension/` (retired in M009 ... `.project/archive/001-run-unrun-spikes/`)" | status | verified | Test-Path spikes\s1-extension = False; .project/archive/001-run-unrun-spikes/ holds MANIFEST.md |
| "Evidence: `research/s1-results/chrome-fresh.json`, `research/s1-results/edge-fresh.json`" | structure | verified | research/s1-results/ contains chrome-fresh.json, edge-fresh.json, chrome-gemma4.json, edge-aion.json, chrome-gemma4-crash-doctor.json |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`testRunner` default `vitest` (`CLI-S/ng-new/schema.json:114-115`)" | config | verified | D:\projects\github\angular\angular-cli\packages\schematics\angular\ng-new\schema.json:114-115 — `"enum": ["vitest", "karma"]`, `"default": "vitest"` |
| "The CLI enables this when script optimization is off: `includeTestMetadata: !optimizationOptions.scripts` (`.../compiler-plugin-options.ts:47`)" | config | verified | angular-cli\packages\angular\build\src\tools\esbuild\compiler-plugin-options.ts:47 — `includeTestMetadata: !optimizationOptions.scripts,` |
| "core stores them as static fields ... (`core/src/render3/metadata.ts:87-117`)" | structure | verified | angular\packages\core\src\render3\metadata.ts:87 — `export function setClassMetadata(type, decorators, ctorParameters, propDecorators)` |
| "`Standalone[_AppComponent]`, then \"Environment Injector\", then `null`" | status | verified | research/raw/zone-mode-portal.json — `zoneTokens` lists environment `Standalone[_AppComponent]`, then `Environment Injector` with `NgZone` `useClass: fn:NoopNgZone` |
| "`setClassMetadata(Counter, ...)` (`spike main.js:37258-37267`) ... `setClassDebugInfo` (`spike main.js:37270`)" | structure | unverifiable | spikes/ng222-app/dist/ng222-app/browser/main.js is absent from the tree (gitignored build output, no built main.js outside node_modules); a development `ng build` of spikes/ng222-app would restore the cited lines |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`apps/insurance-portal/project.json:18` `\"polyfills\": [\"zone.js\"]`" | config | verified | portal checkout apps/insurance-portal/project.json:18 — `"polyfills": ["zone.js"]` in the `build` options |
| "The app builds with `@angular/build:application` and serves with `@angular/build:dev-server` (`apps/insurance-portal/project.json:10,53`)" | config | verified | portal checkout apps/insurance-portal/project.json:10 `"executor": "@angular/build:application"` and :53 `"executor": "@angular/build:dev-server"` |
| "commit `f102b97` ... (`cc9ce25`)" | status | verified | git -C the portal checkout rev-parse --short HEAD = cc9ce25, the revision the subscribe audit names; f102b97 is the earlier audit revision |
| "flagged by N10 (`research/12` F2)" | integration | verified | research/12-legacy-vs-modern-angular.md:143 — F2 row: Reactive Forms (`ReactiveFormsModule`, `FormControl`, `FormGroup`, `FormBuilder`) to Signal Forms |
| "The app is zoneless (`NgZone` provider is `NoopNgZone`, `research/raw/zone-mode-portal.json`)" | status | verified | research/raw/zone-mode-portal.json contains `NoopNgZone` (single-line JSON, one match) |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the model is on-device, with a 7,168 (Aion) to 9,216 (Gemma 4, Nano, Phi-4-mini) token context window (2.1)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:166 (`edge-dev-aion` 7168), :128 (gemma4 9216), :94 (chrome-beta-nano 9216), :194 (edge-phi4mini 9216) |
| "measured tool calling: native tools on Aion only; the structured-output loop on Gemma 4, Nano (GPU) and Phi-4-mini; Nano on CPU unsupported (2.1, 3.3)" | feature | verified | docs/feature-proposals.md:366-369 — "Native tools when the browser is Edge, `contextWindow` is 7,168"; otherwise the structured-output loop; otherwise unsupported (Nano on the CPU backend) |
| "supported apps: zoneless, standalone Angular 22.2 dev builds (section 1)" | status | verified | docs/feature-proposals.md:40-48 — Supported apps: "Angular 22.2 in development mode" with `bootstrapApplication`/standalone components and "zoneless change detection" |
| "the Proofreader API is not defined in the measured builds (N11)" | feature | stale | research/raw/20-built-in-ai-without-flags.json — in the same builds `workers.panelWorker["chrome-stable-nano"]` reports `"Proofreader": "function"` and `avail:Proofreader` `"available"`; only the page context reports it undefined, so the blanket claim is contradicted for extension contexts |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a worker started by the DevTools panel has all seven APIs" | feature | verified | research/raw/20-built-in-ai-without-flags.json — `workers.panelWorker["chrome-stable-nano"]` mode `exists` lists LanguageModel, Summarizer, Writer, Rewriter, Proofreader, LanguageDetector and Translator as functions |
| "has a 7-9K-token window (2.1 of the proposals)" | config | verified | .commandcode/skills/control-ai-browsers/instances.json:166 — Aion `contextWindow: 7168`; :128 — Gemma 4 `contextWindow: 9216`; docs/feature-proposals.md:121-126 tabulates the same values |
| "It cannot start a `Worker`: the constructor exists in windows and in dedicated and shared workers, not in service workers [documented, MW]" | feature | verified | research/raw/20-built-in-ai-without-flags.json — the `workers.serviceWorkerCanStartWorkers` key records the measured absence |
| "one component's signal graph on the portal is 13,878-25,838 characters, and the one-hop slice around its template is 230 characters [measured, Claude's count over `research/raw/tosignal-node-portal.json`]" | status | unverifiable | research/raw/tosignal-node-portal.json exists, but the per-component character counts need a recount over that file; nothing in the repo stores the derived numbers |
| "Terminated after 30 s without events or extension API calls, and when one event or API call takes over 5 minutes [documented, XL]" | status | unverifiable | Vendor-only (developer.chrome.com service-worker lifecycle); the repository holds no measurement or local copy, so a run with an idle service worker would settle it |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Routes (`app.routes.server.ts`): `/` `RenderMode.Server`, `/prerender` `RenderMode.Prerender`, `/client` `RenderMode.Client`" | config | verified | spikes/ng222-ssr/src/app/app.routes.server.ts:5-7 — the three `renderMode` entries in that order |
| "Probes in `spikes/probes/ssr-*.js`" | structure | verified | spikes/probes/ holds ssr-defer.js, ssr-event-replay.js, ssr-hydration.js, ssr-render-modes.js, ssr-transfer.js |
| "output in `research/raw/ssr-*.json`" | structure | verified | research/raw/ holds ssr-defer.json, ssr-event-replay.json, ssr-hydration.json, ssr-render-modes.json, ssr-transfer.json |
| "`ng serve --port 4223 --no-hmr` through `control-angular-dev-app` (`--target ssr`)" | command | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:13 — `TargetName` includes `'ssr'`; :93 — serve args `['serve','--port',…,'--no-hmr']` with the NG0751 reason in the comment at :91 |
| "HMR is off because under HMR Angular loads every `@defer` dependency eagerly and logs NG0751" | feature | verified | .commandcode/skills/control-angular-dev-app/scripts/control.mjs:91 — comment "HMR (the dev-server default) loads every @defer dependency eagerly (NG0751), which hides incremental hydration" |
| "`__ngDebugHydrationInfo__` ... (`_debug_node-chunk.mjs:2496-2509`)" | structure | verified | spikes/ng222-ssr/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:2502 — `const HYDRATION_INFO_KEY = '__ngDebugHydrationInfo__';` |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Added, all pinned exactly: `vitest` 5.0.3 ... `@vitest/browser` 5.0.3, `@vitest/browser-playwright` 5.0.3, `playwright` 1.63.0, `vitest-browser-angular` 0.5.1" | config | verified | spikes/ng222-app/package.json:27-33 — `"@vitest/browser": "5.0.3"`, `"@vitest/browser-playwright": "5.0.3"`, `"playwright": "1.63.0"`, `"vitest": "5.0.3"`, `"vitest-browser-angular": "0.5.1"`; no `jsdom` entry |
| "`angular.json` `test`: options `runnerConfig: true`; configurations ... `attach` (`vitest-attach.config.mts`) and `extension` (`vitest-extension.config.mts`)" | config | verified | spikes/ng222-app/angular.json:79 and :82 — the two `runnerConfig` values in the `test` target |
| "Probes: `spikes/probes/vitest-attach.mjs` (runner) and `spikes/probes/vitest-iframe-probe.js`" | structure | verified | both files are in spikes/probes/ alongside vitest-lib.mjs |
| "It reads `textContent` synchronously after `button.click()` ... only with `VITE_COUNTER_TIMING_DEMO=1`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:37-39 — the comment and `it.runIf(import.meta.env.VITE_COUNTER_TIMING_DEMO === '1')` |
| "\"keeps the counter mounted for an outside inspection, then counts its own click\", only with `VITE_COUNTER_HOLD_MS=<ms>`" | feature | verified | spikes/ng222-app/src/app/counter.spec.ts:53-73 — `it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)` with that exact title at :57 |
| "Angular 22.2 has a `browsers` option ... (`@angular/build/src/builders/unit-test/runners/vitest/browser-provider.js:49-60`)" | structure | verified | spikes/ng222-app/node_modules/@angular/build/src/builders/unit-test/runners/vitest/browser-provider.js exists in the pinned install |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the real feature flags are `msImplicitSignin`, `msProfileSignIn`, `msEdgeOSAccountInfoSubstrate`, etc." | config | verified | .commandcode/skills/control-ai-browsers/instances.json:32 — the Edge `--disable-features` list names `msImplicitSignin, msImplicitSignInNetworkRetry, msProfileSignIn, msForceBrowserSignIn, msEdgeOSAccount...` |
| "`--disable-sync` and `--disable-features=msBrowserSignin` do **not** fully prevent auto-sign-in" | feature | verified | .commandcode/skills/control-ai-browsers/scripts/pipe-keeper.mjs:24-40 — an Edge launch is refused unless it carries `--disable-sync` **and** `msImplicitSignin`; the comment records the auto-sign-in "measured twice on 2026-10-19" |
| "\"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe\"" | config | verified | Test-Path returns True for that executable path, so the section 4 command line points at the installed Edge Stable |
| "Run the PowerShell in section 3 once (sets HKCU policies)" | command | unverifiable | HKCU:\Software\Policies\Microsoft\Edge does not exist on this machine (Test-Path False), so the recipe has not been applied and its effect on sign-in is unmeasured here; `edge://policy` after applying it would settle it |
| "Edge 157 retires the legacy direct-WAM path (MC1490911)" | status | unverifiable | Release-note claim about Edge 157; the repository holds no copy of MC1490911 and no Edge 157 sign-in measurement |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw: `raw/19-languagemodel-contexts.json`" | structure | verified | research/raw/19-languagemodel-contexts.json — top-level `measuredAt`, `probe`, `results` keys hold the per-context rows |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | integration | verified | apps/angular-ai-devtools/src/app/extension-prompt.service.ts:37-38 — `languageModel()` reads `globalThis.LanguageModel`; :54 the service calls it directly |
| "Hidden `devtools.html` page \| refused" | feature | verified | research/11-spike-s1-extension-contexts.md result table row 1 — `devtools_page` `availability()` = `unavailable`, Permissions Policy false |
| "recorded in plans/prompt-api-browser-pairs.afk.md" | status | verified | plans/prompt-api-browser-pairs.afk.md exists in the repository |
| "`LanguageDetector` and `Translator` crash the renderer when called in a worker" | feature | verified | docs/filing-ledger.md:230 — item 11 records the same renderer crash for `LanguageDetector.availability()` / `Translator.availability()` in a dedicated worker |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`control-ai-browsers up <name> --no-ai-features`, which keeps only the Edge sign-in and sync switches" | command | verified | .commandcode/skills/control-ai-browsers/scripts/control.mjs:2072-2074 — `opts['no-ai-features'] === true ? [] : featuresFor(inst, backend)` empties the `--enable-features` list |
| "launched by a scratch script through `pipe-keeper.mjs`" | structure | verified | control.mjs:123 — `const KEEPER = join(SKILL_DIR, 'scripts', 'pipe-keeper.mjs')`; scripts/pipe-keeper.mjs present |
| "raw in `raw/20-built-in-ai-without-flags.json` under `workers`" | structure | verified | research/raw/20-built-in-ai-without-flags.json — top-level keys `measuredAt`, `setup`, `results`, `workers` |
| "Filing draft: `docs/filing-ledger.md` item 11" | status | verified | docs/filing-ledger.md:230 — "## 11. Chromium (Blink>AI): `LanguageDetector.availability()` or `Translator.availability()` in a dedicated worker crashes the renderer" |
| "On a new Chrome Beta profile, On-Device AI is off until a model was installed once ... (control-ai-browsers Gotchas)" | config | verified | .commandcode/skills/control-ai-browsers/SKILL.md:317 — "A new Chrome Beta profile has On-Device AI switched off (measured 2026-10-19, Chrome Beta 157.0.8103.6)" |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "generated using Angular CLI version 22.2.2" | status | verified | spikes/ng222-app/package.json:25 — `"@angular/cli": "^22.2.2"` in devDependencies |
| "To start a local development server, run: `ng serve`" | command | verified | spikes/ng222-app/package.json:5-9 — the scripts block maps `start` to `ng serve` |
| "navigate to `http://localhost:4200/`" | config | verified | spikes/ng222-app/angular.json:56 — `serve` uses `@angular/build:dev-server` with no `port` option, so the CLI default 4200 applies |
| "To execute unit tests with the Vitest test runner, use ... `ng test`" | command | verified | spikes/ng222-app/angular.json:68 — `"builder": "@angular/build:unit-test"`; package.json:32 pins `vitest` 5.0.3 |
| "store the build artifacts in the `dist/` directory" | structure | verified | spikes/ng222-app/angular.json:16-30 — the `@angular/build:application` target sets no `outputPath`, so the default `dist/ng222-app` is used |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "generated using Angular CLI version 22.2.2" | status | verified | spikes/ng222-ssr/package.json:29 — `"@angular/cli": "^22.2.2"` in devDependencies |
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`, so it has no unit tests to run" | status | verified | spikes/ng222-ssr/angular.json:13-34 — every schematic entry sets `"skipTests": true`; Get-ChildItem -Recurse -Filter *.spec.ts outside node_modules returns nothing |
| "To start a local development server, run: `ng serve`" | command | verified | spikes/ng222-ssr/package.json:6 — `"start": "ng serve"` |
| "This will compile your project and store the build artifacts in the `dist/` directory" | structure | verified | spikes/ng222-ssr/package.json:10 — `"serve:ssr:ng222-ssr": "node dist/ng222-ssr/server/server.mjs"` assumes the default `dist/ng222-ssr` output |
| "To execute the end-to-end tests ... run: `ng e2e`" | command | unverifiable | spikes/ng222-ssr/angular.json declares no `e2e` target and the fixture has no `e2e/` directory; an `ng e2e` run in that directory would settle it |

## Doc: plans/gsd-path-handoff-M018.md

Audited 2026-11-01.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`workflow_run.py prepare-inspect` refuses while a prior audit exists" | command | verified | Reproduced at this head: the helper returned `blocked` with reason "prior inspection evidence requires the re-inspection contract" while `.project/research/DOCS-AUDIT.md` existed. |
| "`isolation.py isolate-verify` requires `--repo --base --name`, and `--base` must be a full 40-character SHA" | command | verified | Both rejections reproduced: a missing `--base`, then `base must be a full 40-character SHA` for a short SHA. |
| "`plans/angular-ai-devtools-program-backlog.md` is on `main` at `8827469`" | config | verified | `git log --oneline 8827469` names the backlog commit, and it is an ancestor of `origin/main`. |
| "The previous milestone shipped at `f983b0b` and integrated at `62a10a7`" | config | verified | `git rev-parse` resolves both, and `git merge-base --is-ancestor f983b0b 62a10a7` succeeds. |

## Descriptive docs
- .commandcode/taste/taste.md

## User rulings

Ruled 2026-11-01 under the recorded `rulings` grant for M018. Each row is `fix-doc` with
`planned: no`: the document is corrected when its milestone touches it, and the row stays
visible as owed work rather than being suppressed. Owner's words, verbatim: "You must implement the changes proposed and verify them where possible, to reach your goal."

| Queue # | Ruling | User's words | Planned |
|---|---|---|---|
| 133 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
| 134 | fix-doc | "You must implement the changes proposed and verify them where possible, to reach your goal." | no |
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

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 19 | .claude/skills/control-angular-devtools/features/profiler.md | "`ng.ɵsetProfiler(null)` clears every subscriber, DevTools' included" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 101 | .claude/skills/control-ai-browsers/features/signal-provenance.md | "`angular-ai:record` facts ... reload the page so the panel records the Angular version" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 102 | .claude/skills/control-ai-browsers/features/stale-view.md | "message types `angular-ai:stale-view`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 103 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "`claim-list` table ... 5 rows measured" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 104 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "`contract-list` table ... 20 rows after a fresh API start" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 105 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "`nav-active` the active sidebar entry gets a highlighted background" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 106 | .claude/skills/control-angular-dev-app/features/ssr.md | "`ngDevMode.hydratedComponents` 4, `hydratedNodes` 40" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 107 | .claude/skills/control-angular-devtools/features/attach.md | "flag true (set at ~50 ms); ... backendReady at ~950 ms; Angular 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 108 | .claude/skills/control-angular-devtools/features/install.md | "End state: test: `doctor` line `extension: Angular DevTools 1.22.1 ENABLED (UNPACKED, ...)`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 109 | .claude/skills/control-angular-devtools/features/profiler.md | "Expected (measured): `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 110 | .claude/skills/control-angular-devtools/features/signal-graph.md | "Agreement with `ng.ɵgetSignalGraph(ng.getInjector(host))`, which the pane's backend calls" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 111 | .claude/skills/control-pangular-inspector/SKILL.md | With `--read-only`, 0.0.7 lists 46 tools | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 112 | .claude/skills/control-pangular-inspector/features/README.md | The overlay reports about 250 ms after change detection | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 113 | .claude/skills/control-pangular-inspector/features/live-inspection.md | `inspect-signals` answers from the graph the page last reported | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 114 | .claude/skills/control-pangular-inspector/features/navigation.md | `limit` on `explain-navigation` defaults to 5 (at most 50) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 115 | .claude/skills/control-pangular-inspector/features/navigation.md | Routes: `node $S call list-routes` (12 routes, measured) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 116 | .claude/skills/control-pangular-inspector/features/navigation.md | `started by` appears only when the click came less than 2 s before the navigation | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 117 | .claude/skills/control-pangular-inspector/features/navigation.md | A reload keeps the page id (it lives in `sessionStorage`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 118 | .claude/skills/control-pangular-inspector/features/panel.md | the eight panel tabs: Components, Routes, Signals, Injectors, Store, Forms, Pipes, SSR and HTTP | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 119 | .claude/skills/control-pangular-inspector/features/panel.md | the floating button has the accessible name `Toggle Pangular Inspector` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 120 | .claude/skills/control-pangular-inspector/features/panel.md | A code expires after 5 minutes | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 121 | .claude/skills/control-pangular-inspector/features/source-scan.md | `scan.tools`: `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 122 | .claude/skills/control-pangular-inspector/features/source-scan.md | The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 123 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | the builder `--filter` matches test names, but the hold test runs only with `--hold` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 124 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | the DevTools panel `chrome.devtools.inspectedWindow.eval` with `{ frameURL: <tester URL> }` reaches `window.ng` in the tester | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 125 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | In attach mode `down` uninstalls the extension | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 126 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | The isolated world sees `typeof window.ng === undefined`; only the MAIN world sees `ng` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 127 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | every `ng.*` read works on the host `<div id=rootN ng-version=22.2.2>` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 128 | .claude/skills/verify-ai-browsers/SKILL.md | `edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 129 | .claude/skills/verify-angular-devtools/SKILL.md | `coexist --di-graph` leaves the page signal graph broken until reload | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 130 | .claude/skills/verify-pangular-inspector/SKILL.md | a port busy `up` refusal makes the run inconclusive, never a stop of someone else process | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 131 | .commandcode/pstack-models.md | "A value of `inherit-parent` or `auto` runs that role on the parent session's model (the `Agent` call omits `model`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 132 | .commandcode/pstack-models.md | "`default effort` sets the level for a value without one" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 133 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | "message types `angular-ai:error-capture` / `angular-ai:error-explain`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 134 | .commandcode/skills/control-ai-browsers/features/interop.md | "message types `angular-ai:interop`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 135 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | "The component picker is empty until at least one `angular-ai:record` cycle arrives for the inspected tab" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 136 | .commandcode/skills/control-ai-browsers/features/stale-view.md | "message types `angular-ai:stale-view`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 137 | .commandcode/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (devtools-tabs.component.ts)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 138 | .commandcode/skills/control-angular-devtools/features/attach.md | "the content script still injects the backend (it gates on isAngularDevTools, isAngular and an HTML document, not on isDebugMode; built 1.22.0 app/content_script_bundle.js)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 139 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "`inspect-component` for one host tag, class name or instance id" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 140 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 141 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`node $S call list-routes` (12 routes, measured) and `node $S call lint-routes` (one `info` finding, `missing-title`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 142 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "The sidebar entries are `div`s with `routerLink`, so `started by` reads `RouterLink div`, not `a`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 143 | .commandcode/skills/control-pangular-inspector/features/panel.md | "`http://localhost:9999/` directly (trusts only that origin's one-time code)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 144 | .commandcode/skills/control-pangular-inspector/features/panel.md | "the amber floating button ... accessible name `Toggle Pangular Inspector`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 145 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 146 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 147 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "`mounted-component` passes only while the hold test runs (90 s from `RUN` ... )" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 148 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "`Tests 2 passed \| 2 skipped (4)` without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 149 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`LanguageModel.availability()` is `available` ... (attach mode); `unavailable` in bundled mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 150 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "`ng. getInjectorProviders` throws on the null injector at the end of the resolution path" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 151 | .commandcode/skills/link-workspace-packages/SKILL.md | "npm auto-symlinks workspace packages" / "`npm install @org/ui --workspace @org/app`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 152 | .commandcode/skills/monitor-ci/SKILL.md | "circuit breaker (5 polls)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 153 | .commandcode/skills/monitor-ci/references/fix-flows.md | "Parse throttle message for CI Attempt URLs (regex: `/cipes/{id}`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 154 | .commandcode/skills/nx-cloud-api/SKILL.md | "Use `npx nx-cloud api --list-operations` to find a route" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 155 | .commandcode/skills/nx-cloud-api/SKILL.md | "The command already retried 3 times honoring `Retry-After`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 156 | .commandcode/skills/nx-cloud-api/SKILL.md | "Run `npx nx-cloud login --status` from the workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 157 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "`npx nx-cloud api task-stats`" with "`-f percentiles=50 -f percentiles=95`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 158 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "`fetchedItemCount`, `pageLimitReached`, `nextCursor`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 159 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Encrypted artifacts can be decrypted with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 160 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Do not use `--format ndjson` for extraction; it records neither completion state nor a resume cursor" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 161 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "Use `-o <file>` with an explicit extension such as `.tar.gz`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 162 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "Use `nx-cloud-api` (`npx nx-cloud api`) for every read" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 163 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "npx nx-cloud api 'runs/{runId}/tasks' -p runId="$run_id"" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 164 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "Download the exact task-row artifact link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 165 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "decrypt a copy with `npx nx-cloud decrypt-artifact`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 166 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | "The API cannot identify an upload path, writer, storage event, or service mutation" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 167 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 168 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Download the exact row-provided link with `npx nx-cloud api "<link>" -o <private-file>.tar.gz`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 169 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Review failures from the last 24 hours by default" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 170 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "Query a 30-hour creation window to cover the maximum normal six-hour CI duration" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 171 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "the public API has no separate workflow routes" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 172 | .commandcode/skills/nx-import/SKILL.md | "run `nx sync --yes`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 173 | .commandcode/skills/nx-import/SKILL.md | "**Pin ESLint to v9** (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 174 | .commandcode/skills/nx-import/SKILL.md | "`@nx/eslint` may peer-depend on ESLint 8, causing the wrong version to resolve" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 175 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 176 | .commandcode/skills/nx-import/references/ESLINT.md | "`typescript-eslint@7.x` declares `peerDependencies: { "eslint": "^8.56.0" }`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 177 | .commandcode/skills/nx-import/references/ESLINT.md | "The root `eslint@~8.57.0` (added by `@nx/eslint` init)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 178 | .commandcode/skills/nx-import/references/GRADLE.md | "The `@nx/gradle` plugin expects those files at the workspace root" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 179 | .commandcode/skills/nx-import/references/JEST.md | "`pnpm add -wD jest ts-jest @types/jest @nx/jest`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 180 | .commandcode/skills/nx-import/references/JEST.md | "`require('@nx/jest/preset').default`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 181 | .commandcode/skills/nx-import/references/JEST.md | "Both `@nx/jest/plugin` and `@nx/vite/plugin` ... coexist without conflicts" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 182 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` detects `next.config.{ts,js,cjs,mjs}` and creates these targets" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 183 | .commandcode/skills/nx-import/references/NEXT.md | "`create-next-app` generates a flat ESLint config using `eslint-config-next`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 184 | .commandcode/skills/nx-import/references/TURBOREPO.md | "Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 185 | .commandcode/skills/nx-import/references/VITE.md | "`pnpm add -wD vite @vitejs/plugin-react` (or `@vitejs/plugin-vue`) first, then `pnpm exec nx add @nx/vite`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 186 | .commandcode/skills/nx-import/references/VITE.md | "`nx sync --yes && nx reset && nx run-many -t typecheck,build,test,lint`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 187 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to "vite:typecheck"" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 188 | .commandcode/skills/nx-plugins/SKILL.md | "Example: `npx nx add @nx/react`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 189 | .commandcode/skills/verify-angular-devtools/SKILL.md | "a bare `install` copies from Lars's Edge Dev profile, which a proof run never reads" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 190 | .commandcode/skills/verify-pangular-inspector/SKILL.md | "The setup steps need ports 3000 and 9999 free (both fixed)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 191 | .commandcode/taste/angular/taste.md | "Never put a `node:test` suite under `*.spec.ts` — the builder compiles it and the app test target fails with TS2591" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 192 | .commandcode/taste/angular/taste.md | "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 193 | .commandcode/taste/communication/taste.md | "`provideAiDevTools()` not `provideAiDevtools()`" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 194 | .commandcode/taste/communication/taste.md | "`provideAiNgrxDevTools()` not `provideAiNgRxDevTools()`" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 195 | .commandcode/taste/communication/taste.md | "no em dashes or curly quotes" in docs | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 196 | .commandcode/taste/design/taste.md | "per-package secondary entry points such as `provideAiNgrxDevTools()`" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 197 | .commandcode/taste/workflow/taste.md | "validates it programmatically (check_docs_audit.py ...)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 198 | docs/afk-run-2026-10-12.md | "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 199 | docs/autonomy-gaps.md | "tests 15 / pass 15 / fail 0 ... tests 18 / pass 18 / fail 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 200 | docs/design/tutor.md | "The tutor teaches modern Angular on the app that the learner already has open" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 201 | docs/design/tutor.md | "component keys from `find_components`, signal labels from `list_signals`, injectors from `di_path`" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 202 | docs/design/tutor.md | "The proposed tutor can run with no model" | aspirational | fix-doc | Update the doc to current behavior or land the described behavior |
| 203 | docs/filing-ledger.md | "`.claude/skills/control-pangular-inspector/SKILL.md:172` (0.0.7 has no `list-components`; added in 20ebbb9; 46 tools with `--read-only`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 204 | docs/filing-ledger.md | "the in-page AI tool `angular:di_graph` (`packages/core/src/debug/ai/di_graph.ts`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 205 | docs/filing-ledger.md | "`verify-angular-devtools` run, `tmp/verify-angular-devtools/20261011-192415.460/` (gitignored)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 206 | plans/angular-ai-devtools-program-backlog.md | "Initial-bundle budget is a hard 520 KB" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 207 | plans/angular-ai-devtools-proposals.handoff.md | "**Skills (project):** in `.claude/skills/`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 208 | references/ai-browsers-verification.md | "Check that port 9992 is free" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 209 | references/edge-dev-aion-model.md | "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 210 | references/edge-dev-aion-model.md | "`model download` refuses on `edge-dev-aion` while the switch is on" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 211 | research/00-browser-probe.md | "restarts the instance through `control-ai-browsers` `stop` and `launch`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 212 | research/01-built-in-ai-apis.md | "Angular has experimental WebMCP support: `provideExperimentalWebMcpTools([...])` from `@angular/core`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 213 | research/01-built-in-ai-apis.md | "The entry point is now `document.modelContext`, not `navigator.modelContext`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 214 | research/04-ecosystem.md | "Target: an Angular 22.2 dev-mode app" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 215 | research/04-ecosystem.md | "A content script with `world: \"MAIN\"` and `run_at: \"document_start\"` can install globals" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 216 | research/05-spikes.md | "served with `ng serve --port 4222`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 217 | research/05-spikes.md | "`angular:di_graph` output on this one-component app ... is **42,788 characters**" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 218 | research/07-prompting-small-models.md | "both measured browsers use `callID` (Edge rejects `callId`; Gemma 4 in Chrome Beta returns `callID: \"\"`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 219 | research/08-recent-angular-features.md | "Practical floor: the target is 22.2, so every idea works there" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 220 | research/09-nano-tool-session-error.md | "The probe measured **`NotSupportedError`**" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 221 | research/10-model-capabilities.md | "Chromium ... `runtime_enabled_features.json5` at tag `156.0.8078.17`, lines 485-500" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 222 | research/12-legacy-vs-modern-angular.md | "`setClassMetadata(Counter, ...)` (`spike main.js:37258-37267`) ... `setClassDebugInfo` (`spike main.js:37270`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 223 | research/14-ai-devtools-prior-art.md | "the Proofreader API is not defined in the measured builds (N11)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 224 | research/15-deterministic-and-ai.md | "one component's signal graph on the portal is 13,878-25,838 characters, and the one-hop slice around its template is 230 characters [measured, Claude's count over `research/raw/tosignal-node-portal.json`]" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 225 | research/15-deterministic-and-ai.md | "Terminated after 30 s without events or extension API calls, and when one event or API call takes over 5 minutes [documented, XL]" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 226 | research/18-edge-prevent-auto-signin.md | "Run the PowerShell in section 3 once (sets HKCU policies)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 227 | research/18-edge-prevent-auto-signin.md | "Edge 157 retires the legacy direct-WAM path (MC1490911)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 228 | spikes/ng222-ssr/README.md | "To execute the end-to-end tests ... run: `ng e2e`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
