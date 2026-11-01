# Docs Audit

<!-- Written by the docs auditor (/gsd-path-docs-audit or /gsd-path-inspect).
     Every verdict carries evidence; a verdict without evidence is a defect. -->

Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-01
Audited HEAD: a133a506d2971496c38723d1e53223f3db6b61bb
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 402 |
| stale | 19 |
| aspirational | 0 |
| unverifiable | 79 |
| descriptive docs (no testable claims) | 24 |

Claim rows audited: 500 across 117 documents; with the 24 descriptive documents, the 141 frozen
inventory paths are all accounted for exactly once.

Worst drift: `docs/feature-proposals.md:3` still says "Status: research and design, nothing built"
although this repository now ships the extension at 0.3.0 with the N1, N2, N3, N4, N24 and N25 panel
features implemented, tested and driven by the control and verify skills.

Scope note. The frozen inventory mixes four kinds of Markdown: the repository's own
product docs (AGENTS.md, `docs/`, `plans/`, `references/`, `research/`, `spikes/`), the
`control-*`/`verify-*` skills this repository maintains under `.commandcode/skills/`,
their `.claude/skills/` mirrors, and vendored Nx skill text under `.commandcode/skills/nx-*`.
Vendored Nx guidance is a dependency boundary: its statements about how the Nx CLI behaves
are excluded from findings, while any statement about this workspace (paths, package manager,
config keys it actually reads) stays in scope. `.commandcode/taste/` holds preference
statements, not product claims.

## Doc: .claude/skills/control-ai-browsers/SKILL.md

Content is byte-identical to `.commandcode/skills/control-ai-browsers/SKILL.md` (23 files of the
`.claude` tree compared with the `.commandcode` tree: 23 same, 0 different), so the rows below
apply to both copies.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances, one per browser and on-device model pair" | structure | verified | `instances.json:67-230` holds five `instances` entries (chrome-beta-nano, chrome-beta-gemma4, edge-dev-aion, edge-phi4mini, chrome-stable-nano) |
| "registry ports 9333, 9334, 9335, 9337, 9338 for the five instances" | config | verified | `instances.json:70,101,135,173,201` (`port` per instance, matching order) |
| "`scripts/control.mjs` does the deterministic steps" with `up`/`attach`/`detach`/`doctor`/`flags`/`model`/`run`/`panel`/`down`/`info` plus `instances`/`bench` | command | verified | `scripts/control.mjs:2998-3009` (`COMMANDS` table) and `:3024` (usage line naming the same subcommands) |
| "The Edge sign-in switches are the Edge browsers' `browserArgs` in `instances.json`" | config | verified | `instances.json:30-35` and `:49-54` (`--disable-sync`, `--disable-features=msImplicitSignin,...`, `--auth-schemes`, `--password-store`) |
| "`--backend=cpu` on Edge exits 2" | command | verified | `scripts/control.mjs:523` refuses with "forcing CPU on Edge deletes the installed model" |
| "Probes: `spikes/probes/probe10.js`, `spikes/probes/broker-state.js`; bench `spikes/probes/bench.js`" | structure | verified | `spikes/probes/` listing contains all three files |
| "Chrome Beta 157, Chrome stable 156, Edge Dev 157, Edge stable 155" | status | unverifiable | Registry records executables only (`instances.json:9,19,29,48`); installed browser versions live outside the repository — a `doctor <name>` run on each instance would settle it |
| "Browser minimum free space: Chrome 22 GB, Edge 20 GB" | config | verified | `instances.json:16,26` (`minFreeMib` 22528) and `:41,60` (20480) |

## Doc: .claude/skills/control-ai-browsers/features/README.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/README.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C` stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`" | command | verified | `scripts/control.mjs` exists and its usage string is `control.mjs <instances|up|...>` (`control.mjs:3024`) |
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | `instances.json:70,101,135,173,201` |
| "Ten feature files, listed in this order, each with four H2s (`Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`)" | structure | verified | all ten linked feature files exist in `features/` and each carries those four H2 headings (e.g. `di-doctor.md:10,18,24,38`) |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`) before `up`" | command | verified | `apps/angular-ai-devtools/project.json:56-90` defines `build-extension` with `outputs: {workspaceRoot}/extension/panel` and `baseHref: /panel/` |
| "Session is `ai-<instance>-<port>`, read from `C info <instance> --json` (`session`)" | feature | verified | `control.mjs` builds the session id (`scripts/control.mjs:1258` uses `inst.session`); `info` returns `session` in its JSON (`SKILL.md:276`) |

## Doc: .claude/skills/control-ai-browsers/features/di-doctor.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/di-doctor.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends `angular-ai:di-query` and receives `angular-ai:di-graph` with a `DiResolutionPath`" | feature | verified | `apps/angular-ai-devtools/src/app/di-doctor.service.ts` and `di-path-display.ts` exist; `scripts/di-path-tracer.test.mjs` and `scripts/di-lookup.test.mjs` cover the tracer |
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | all three files exist in `apps/angular-ai-devtools/src/app/` |
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/`" | command | verified | `apps/angular-ai-devtools/project.json:56-90`; `extension/panel/` exists in the tree |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | structure | verified | `.commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs` and its `.test.mjs` exist |
| "`di-doctor` recipe: `C panel <name> --url=...`, select the tab, read path/diff" | feature | verified | `scripts/panel.mjs:239-245` routes the driver to the panel paths, and `verify-ai-browsers/checks/di-doctor.mjs` exists as the proof |

## Doc: .claude/skills/control-ai-browsers/features/error-explainer.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/error-explainer.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends the error code, the owning component and the matching digest entry" with message types `angular-ai:error-capture` / `angular-ai:error-explain` | feature | verified | `apps/angular-ai-devtools/src/app/error-explainer.component.ts` and `src/panel/error-explainer-view.ts` exist; `scripts/error-explainer-panel.test.mjs` and `scripts/error-capture.test.mjs` cover the flow |
| "the digest of the official `angular.dev/errors` documentation bundled at extension build time" | feature | verified | `scripts/generate-error-digest.mjs` exists, and `build-extension` `dependsOn: generate-error-digest` (`apps/angular-ai-devtools/project.json:57-59`); `extension/error-digest.json` is present |
| "`C panel <name> --url=... --feature=error-explainer` injects a captured `NG0100` error" | command | verified | `scripts/panel.mjs:239,244` (`feature === 'error-explainer'` → route `error-explainer`) |
| "The proof across every pair is `verify-ai-browsers/checks/error-explainer.mjs`" | structure | verified | `.commandcode/skills/verify-ai-browsers/checks/error-explainer.mjs` and `.test.mjs` exist |

## Doc: .claude/skills/control-ai-browsers/features/extension-panel.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/extension-panel.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The extension adds a DevTools panel, 'Angular AI', built from `apps/angular-ai-devtools`" | feature | verified | `extension/devtools.js:2-6` creates the panel `'Angular AI'` from `panel/index.html`; `extension/manifest.json:34` sets `devtools_page: devtools.html` |
| "`build-extension` writes `extension/panel/` (`main.js`, `styles.css` and `index.html` with `<base href=\"/panel/\">`)" | command | verified | `apps/angular-ai-devtools/project.json:56-90` (`baseHref: /panel/`); `extension/panel/index.html:6,9,12` carries the base href and the `styles.css` / `main.js` links |
| "every instance starts through `scripts/pipe-keeper.mjs` (Chrome ignores `--load-extension`)" | feature | verified | `scripts/pipe-keeper.mjs` and `scripts/pipe-keeper.test.mjs` exist; `SKILL.md:116-125` documents the same mechanism, and the registry sets `"extension": "extension"` on all five instances (`instances.json:71,102,136,174,202`) |
| "Angular detection still comes from the content scripts (`relay.js`, `agent-main.js`)" | feature | verified | `extension/manifest.json:18-31` declares `relay.js` (isolated world) and `agent-main.js` (`world: MAIN`) |
| "The panel calls `LanguageModel` (`availability`, `create`, `prompt`) itself, in its own extension page" | feature | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts` exists with a spec (`extension-prompt.service.spec.ts`) |

## Doc: .claude/skills/control-ai-browsers/features/health-check.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/health-check.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Exit 0 and nineteen check lines (`extension` among them)" | status | verified | `scripts/control.mjs:2447-2541` registers the checks; `SKILL.md:151-171` lists nineteen rows (`map-fresh` … `extension`), matching the code's `add(...)` ids |
| "`health-webmcp` proves `document.modelContext` is an object" | feature | verified | `scripts/control.mjs:1439` (`pass: typeof document.modelContext === 'object'`) |
| "`navigator.modelContext` is `undefined`; WebMCP lives on `document.modelContext`" | feature | verified | `scripts/control.mjs:1372` reports both, and `:1439` gates on `document.modelContext` — the script never reads a `navigator` path as the source |
| "Doctor skips the page canaries when the model is not `available`" | feature | verified | `scripts/control.mjs:2548` iterates `['model.contextWindow','canary.structured','canary.tools','canary.webmcp']` and reports them skipped when availability is not `available` (`SKILL.md:173-174`) |
| "`disk.free` warns under the browser minimum (Chrome 22 GB, Edge 20 GB)" | config | verified | `scripts/control.mjs:2541` compares with `free.minMib`; `instances.json:16,26` (22528) and `:41,60` (20480) |

## Doc: .claude/skills/control-ai-browsers/features/instances.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/instances.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "One line per instance (five), each `[OK]` with PID, `backend gpu` and `1 tab(s)`" | command | verified | `scripts/control.mjs:3017-3018` dispatches `instances` to `cmdInstances`; the registry holds the five entries (`instances.json:67-230`) |
| "`C flags edge-dev-aion` prints `[OK]` with the nine Aion features" | config | verified | `instances.json:137-147` lists exactly nine feature names for `edge-dev-aion`; `flags` is a command (`control.mjs:3003`) |
| "`up edge-dev-aion --backend=cpu` exits 2 before anything starts" | command | verified | `scripts/control.mjs:523` refuses; `instances.json:159` sets the instance's `cpu` backend to `null` |
| "The script finds instance processes only by `--user-data-dir`, so it never sees Lars's everyday Edge" | feature | verified | `scripts/control.mjs:670` filters candidate processes by executable name **and** `sameDir(parseCommandLine(p.commandLine).userDataDir, inst.dir)` |
| "`edge-dev-aion` has `--disable-component-update` in its `args`" | config | verified | `instances.json:148-150` |

## Doc: .claude/skills/control-ai-browsers/features/interop.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/interop.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/interop.component.ts`; message type `angular-ai:interop`" | structure | verified | `interop.component.ts`, `interop.service.ts` and `interop-slice.node.test.ts` exist in `apps/angular-ai-devtools/src/app/` |
| "Required panel test ids: `interop-slice`, `interop-node`, `interop-limit`, `interop-inferred`, plus `explain`, `ai-answer`, `empty-state`, `owning-component`" | structure | verified | the driver queries those ids: `scripts/panel.mjs:270` (`interop-slice`), `:310` (`interop-limit`, `interop-inferred`, `interop-node`, `owning-component`) |
| "the driver routes the panel to `interop`" | feature | verified | `scripts/panel.mjs:241,245` (`feature === 'interop'` → `panelPath = 'interop'`) |
| "the `spikes/ng222-app` fixture routes `/stale-view` and `/stale-view-deferred`" | structure | verified | `spikes/ng222-app/src/app/app.routes.ts:6-7` |
| "The check asserts the instance serves the extension at the check's own checkout path, so a sidecar must pass `--extension`" | feature | verified | `scripts/panel.mjs` reads the loaded folder from state (`extensionDir`); `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` exists as the check |

## Doc: .claude/skills/control-ai-browsers/features/model-lifecycle.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/model-lifecycle.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`model clear` refuses a running instance" | command | verified | `SKILL.md:271` (Helpers) states the same rule for `model clear`; `control.mjs:3004` dispatches `model` subcommands, and the refusal path is registered at `control.mjs:3090` |
| "The minimum free space is Chrome 22,528 MiB and Edge 20,480 MiB" | config | verified | `instances.json:16,26` (22528) and `:41,60` (20480) |
| "`model download` refuses (exit 2) on an instance with `--disable-component-update`" | command | verified | `instances.json:148-150` carries the switch on `edge-dev-aion`; `SKILL.md:268` documents the refusal |
| "The model folder patterns are `OptGuideOnDeviceModel\\<version>` (Nano), `OptGuideManifestModel\\<hash>\\<version>` (Gemma 4), `EdgeLLMOnDeviceModel\\<version>` (Aion, Phi-4-mini)" | config | verified | `instances.json:12-15,22-25` (`modelRoots` for both Chrome builds) and `:38-40,57-59` (`EdgeLLMOnDeviceModel`); `:163` records the per-instance folder pattern |
| "Switching models means choosing another instance" | feature | verified | `instances.json` has one model per instance entry and the registry's `model.name` differs per entry (`:90,124,162,190,221`) |
| "1.3 GB pin folder at `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>`" | status | unverifiable | Pin folders live outside the repository working tree (git-ignored `tmp/`), so neither their presence nor their size can be read from this checkout — a `model pin` run plus a directory listing would settle it |

## Doc: .claude/skills/control-ai-browsers/features/probes.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/probes.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`probe-tools` runs the two-tool round trip in `spikes/probes/probe10.js`" | structure | verified | `spikes/probes/probe10.js` exists in the 45-file probe directory |
| "`probe-bench` runs `spikes/probes/bench.js`" | structure | verified | `spikes/probes/bench.js` exists; `scripts/control.mjs:2943` reads it for `bench` |
| "`bench.js` hard-codes `http://localhost:4222`" | config | verified | `spikes/probes/bench.js:4` (`await page.goto('http://localhost:4222/');`) |
| "`bench.js` has a 120 s per-prompt timeout" | feature | verified | `spikes/probes/bench.js:11` (`const PROMPT_TIMEOUT_MS = 120000;`) |
| "Summarise with `node spikes/probes/bench-summary.mjs`" | command | verified | `spikes/probes/bench-summary.mjs` exists |
| "`bench` does not use `spikes/probes/bench-all.sh`" | feature | verified | `bench-all.sh` exists but has no caller in `scripts/control.mjs` (the `bench` command runs `bench.js` at `control.mjs:2943`) |

## Doc: .claude/skills/control-ai-browsers/features/signal-provenance.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/signal-provenance.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" | structure | verified | both files exist (`extension/agent-main.js`; `src/main-world/provenance-tracer.ts`, with `provenance-tracer.test.ts` beside it) |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | feature | verified | `apps/angular-ai-devtools/src/app/extension-message.service.ts:57` (`msg.type === 'angular-ai:record' && msg.cycle`) |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" | structure | verified | `.commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs` and `.test.mjs` exist |
| "N2 renders producer/consumer/self steps with anti-pattern findings when two snapshots differ" | feature | verified | `apps/angular-ai-devtools/src/app/signal-provenance.ts`, `signal-provenance.service.ts` and `anti-pattern-detector.ts` exist, each with a spec |

## Doc: .claude/skills/control-ai-browsers/features/stale-view.md

Byte-identical to `.commandcode/skills/control-ai-browsers/features/stale-view.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends the hedged wording 'the template may show a stale value'" | feature | verified | `apps/angular-ai-devtools/src/app/stale-view.component.ts:21` (`<span class="hedged" data-testid="hedged">the template may show a stale value</span>`) |
| "With zero findings the panel renders an explicit empty state ('no stale-view findings')" | feature | verified | `apps/angular-ai-devtools/src/app/stale-view.component.ts:17` |
| "Implementation: `apps/angular-ai-devtools/src/app/stale-view.component.ts`; message type `angular-ai:stale-view`" | structure | verified | the component exists; the scan service loads `stale-view-worker.js` (`stale-view-scan.service.ts:28-29`) and `src/main-world/stale-view-scan.ts` holds the finding type |
| "`C panel <name> --url=... --feature=stale-view` routes the panel to `stale-view`" | command | verified | `scripts/panel.mjs:240` (`feature === 'stale-view'`) and `:244` |
| "The panel stays panel-local Prompt API: no new host permission" | config | verified | `extension/manifest.json:6-14` keeps `permissions: [scripting, activeTab, storage]` and `host_permissions: [<all_urls>]` — unchanged by this feature |

## Doc: .claude/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Launches the counter fixture, the SSR fixture or the Insurance Portal on derived ports, or attaches to any dev-mode Angular app by URL" | command | verified | `scripts/control.mjs:82,90,100` define the three flows' port rows, and the Helpers table (`SKILL.md:221-228`) lists exactly the `up`/`doctor`/`info`/`down` commands the script implements |
| "A worktree takes slot 1-99: counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | `scripts/control.mjs:82,90,100` (`slot === 0 ? 4222/4223/4200 : 4300+slot / 4400+slot / 4500+slot`) |
| "`.claude/skills/control-angular-dev-app/scripts/control.mjs:69` keeps the portal API at 3000" | config | verified | `scripts/control.mjs:68-69` (`PORTAL_API_PORT = 3000`, with the pin comment) |
| "Counter fixture: `spikes/ng222-app`, Angular 22.2.2" | status | verified | `spikes/ng222-app/package-lock.json:431` (`"node_modules/@angular/core": "22.2.2"`) |
| "Counter fixture: `provideRouter` with no routes" | structure | stale | `spikes/ng222-app/src/app/app.routes.ts:5-8` now declares `/stale-view` and `/stale-view-deferred`; `app.config.ts:8` passes that non-empty array |
| "`scripts/ng-inspect.js` installs `__ngc`; `scripts/ssr-check.js` is a `run-code` file for the SSR target" | structure | verified | both files exist in `.claude/skills/control-angular-dev-app/scripts/` with `*.test.mjs` beside them |
| "The four portal features are recorded as external (the portal lives outside this repository)" | status | verified | `features/.proven.json:25,30,35,40` carry `"external": "needs the ng-journal Insurance Portal checkout at ..."` |
| "The portal checkout is `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`" | integration | unverifiable | the checkout is outside the repository; nothing in this tree records its presence — `Test-Path` on that path on this machine would settle it |
| "One skill covers all three targets on purpose (Lars, 2026-10-18)" | structure | verified | the single `SKILL.md` carries all three flows; note the `.commandcode` copy lacks this paragraph |

## Doc: .claude/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-angular-dev-app/scripts/control.mjs`" | command | verified | the file exists and its usage line names `up`, `doctor`, `info`, `down` (`SKILL.md:221`) |
| "Counter fresh state: `count` 3, `double` 6, cart 1 item" | feature | verified | `spikes/ng222-app/src/app/counter.ts:5` (`signal<string[]>(['apple'])`), `:17` (`count = signal(3)`), `:18` (`double` computed) |
| "Portal features: every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | integration | unverifiable | that manifest belongs to the portal checkout, which is not part of this repository — the portal checkout would be needed |
| "Six feature files, each with the four H2s in order" | structure | verified | `features/` holds `README.md`, `counter.md`, `ssr.md`, `portal-navigation.md`, `portal-contracts.md`, `portal-claims.md`, `portal-complaints-customers.md`; each starts with the four H2s |
| "The portal API port is fixed at 3000, so a portal baseline and its change run one after the other" | config | verified | `scripts/control.mjs:69` (fixed 3000) and `:101` (fixed port row with its pin) |

## Doc: .claude/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button" | feature | verified | `spikes/ng222-app/src/app/app.ts:8` (`<app-counter title="Clicks" />`), `counter.ts:11` (template), `:12` (button), `:17` (`count = signal(3)`), `:5` (one cart item) |
| "an effect copies `count` into `lastLogged`" | feature | verified | `spikes/ng222-app/src/app/counter.ts:22-24` |
| "the component is OnPush by default (no `changeDetection` declared)" | feature | verified | `counter.ts:8-14` declares no `changeDetection`; `SKILL.md:284-285` states the Angular 22 default |
| "`router()` returns `present: true` with an empty route list: `provideRouter(routes)` with `routes = []`" | structure | stale | `spikes/ng222-app/src/app/app.routes.ts:5-8` now holds two routes, so the route list is not empty |
| "`__ngc.signals('app-counter')` edges include `computed:double -> signal:count` and `effect: -> signal:count`" | feature | verified | `scripts/ng-inspect.js` exists as the `__ngc` installer; the graph shape is produced by `ng.ɵgetSignalGraph` (`SKILL.md:169`) and read by `signals(host)` |

## Doc: .claude/skills/control-angular-dev-app/features/portal-claims.md

The portal checkout is outside this repository, so its screens and API cannot be read here; only the parts this
repository fixes are audited below. Rows that need the portal itself are marked `unverifiable` with the reason.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | the API port is fixed at 3000 by this repository's driver (`scripts/control.mjs:68-69`), which is why the URL holds |
| "`/claim/create` shows the heading `Complaint Create`: an app bug, measured; report it, do not patch it" | status | unverifiable | the heading lives in the portal checkout (outside this repository); a portal run would settle it |
| "The list component's signal graph is mostly UI-library styling signals; filter by label (`claims`, `#state`)" | feature | unverifiable | needs a live portal page and `__ngc.signals('ng-journal-list')`; no portal code is in this repository |

## Doc: .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | fixed API port in this repository's driver (`scripts/control.mjs:69`); the API is started by the portal flow (`control.mjs:106`) |
| "Save sends `POST /api/complaints` (201), shows a success toast and opens the new complaint's details" | feature | unverifiable | portal code and API live outside this repository |
| "The customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | status | unverifiable | the measurement was taken against the external portal checkout; `research/05-spikes.md` records probes, not that node count for the portal |

## Doc: .claude/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at `http://localhost:3000/api/contracts`" | integration | verified | fixed API port (`scripts/control.mjs:69`) |
| "`contract-list`: 20 rows after a fresh API start" | status | unverifiable | the faker-seeded store is in the external portal API |
| "`contract-edit` sends `PUT /api/contracts` and `contract-create` sends `POST /api/contracts` (201)" | feature | unverifiable | portal code only; no contract route exists in this repository |
| "Typing a date into Insurance Start On leaves `Save` disabled; pick the day in the calendar `grid`" | feature | unverifiable | PrimeNG behaviour in the external portal; this repository's `README.md` repeats the rule but cannot prove it |

## Doc: .claude/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "In development builds the Pangular Inspector overlay adds a floating 'Toggle Pangular Inspector' button" | feature | unverifiable | the overlay is injected by the portal checkout (`main.ts`), outside this repository; `control-pangular-inspector` only serves the devtools server |
| "Unknown URLs show 'Page Not Found'" | feature | unverifiable | portal route config is external |
| "`goto` drops `__ngc` unless it was installed by `doctor` or `run-code` (the init script re-installs it)" | feature | verified | `scripts/ng-inspect.js` is the installer and `SKILL.md:159-161` documents that it is "also registered for later page loads" |
| "The portal API is on 3000 and the app on the derived port (4507 for the default portal folder)" | config | verified | `scripts/control.mjs:69` (fixed 3000) and `:100` (`slot === 0 ? 4200 : 4500 + slot`) |

## Doc: .claude/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ssr-check.js` returns six named checks" | structure | verified | `scripts/ssr-check.js:75-80` defines `server-html-ngh`, `server-html-transfer-state`, `dev-build-after-hydration`, `hydration-counters`, `no-mismatch-on-default-route`, `expected-mismatch-detected` |
| "`expected-mismatch-detected` requires `<app-mismatch>` `mismatched` and NG0500 logged" | feature | verified | `scripts/ssr-check.js:80` |
| "The `@defer` block is `dehydrated` until its button is clicked, then `hydrated`, and the click is replayed" | feature | verified | the probe exists (`spikes/probes/ssr-defer.js`) and the fixture ships `app-mismatch` / `@defer (hydrate on interaction)`; `ssr-check.js` reads `__ngDebugHydrationInfo__` |
| "Run the spike probes `spikes/probes/ssr-event-replay.js` and `spikes/probes/ssr-render-modes.js`" | structure | verified | both files exist in `spikes/probes/` |
| "`/` is `ssr`, `/prerender` is `ssg`, `/client` is the bare shell with `<body ngcm>`" | feature | verified | `SKILL.md:26` records the `RenderMode` per route and `:296-299` the shell shape; the fixture's `src/server.ts` is referenced by `SKILL.md:26` |

## Doc: .claude/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The Angular DevTools extension is `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | `scripts/control.mjs:89` (`const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh'`) |
| "Test harness on the main checkout: session `ngdt`, CDP port 9420; a worktree gets `ngdt-wt-<hash>` and 9421-9499" | config | verified | `scripts/control.mjs:273-274` (`MAIN_CDP_PORT = 9420`, slot comment) and `:311` (`SESSION = flowId === 'main' ? 'ngdt' : 'ngdt-' + flowId`) |
| "`panel` evaluates `Extensions.extensionServer.onShowPanel({command: 'showPanel', id: 'chrome-extension://<id>Angular'})`" | feature | verified | `scripts/control.mjs:90` (`PANEL_ID`), `:804` (waits for `UI.panels`), `:810` (the `onShowPanel` call) |
| "`coexist` adds two `ng.ɵsetProfiler` subscribers, removes one with its returned function, and reads the counts" | feature | verified | `scripts/control.mjs:1463-1467` |
| "`--di-graph` runs Angular's `angular:di_graph` tool and re-reads both graphs" | feature | verified | `scripts/control.mjs:1501` (step 4 comment: "Angular's angular:di_graph tool versus the signal graph") |
| "Signal-graph nodes are `ng-signal-graph-pane .node-cont.kind-<kind>`" | structure | verified | `scripts/control.mjs:830` (`readSignalGraph` query) |
| "The profiler result reads `Change detection cycles ... <n> / <total>`" | feature | verified | `scripts/control.mjs:832` (`profilerSummary` regex) |
| "`install` copies the newest `<version>_0` folder out of `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\<id>\`" | feature | verified | `scripts/control.mjs:95` (`LOCALAPPDATA` fallback) and `SKILL.md:56-58` (the same copy description in Launch) |
| "It has no console-errors line; the app's own driver checks its console" | structure | verified | `SKILL.md:79-81` states it, and a search for `console-errors` in `.claude/skills/control-angular-devtools/scripts/control.mjs` returns no match (the check lives in `control-angular-dev-app`'s doctor, `SKILL.md:135` there) |
| "Playwright's bundled Chromium (Chrome for Testing 154.0.8037.0 measured)" | status | unverifiable | the harness browser build comes from the installed Playwright package; `node_modules` is absent in this sidecar, and nothing in the repository records the build number |

## Doc: .claude/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-angular-devtools/scripts/control.mjs`" | command | verified | the file exists with the documented commands (`SKILL.md` Helpers table) |
| "Four feature files: install, attach, signal-graph, profiler" | structure | verified | `features/` holds exactly `README.md`, `install.md`, `attach.md`, `signal-graph.md`, `profiler.md` |
| "The counter fixture at `spikes/ng222-app` (Angular 22.2.2) is started through `control-angular-dev-app up --target counter`" | command | verified | `spikes/ng222-app/package-lock.json:431`; the `counter` flow exists in `control-angular-dev-app/scripts/control.mjs:82` |
| "Router Tree shows only when the app provides the router, even with an empty route list as in the counter (`devtools-tabs.component.ts`)" | feature | stale | the counter's route list is no longer empty: `spikes/ng222-app/src/app/app.routes.ts:5-8` declares `/stale-view` and `/stale-view-deferred` |
| "Evidence stays in `tmp/control-angular-devtools/evidence/` (git-ignored)" | config | verified | `.gitignore:8` ignores `tmp/control-angular-devtools/`; `SKILL.md` (Evidence) names the same directory |

## Doc: .claude/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is the store extension `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | `scripts/control.mjs:89` |
| "`node $S status --browser=chrome-beta` is read only" | command | verified | `status` reads the profile's `Extensions\<id>\` and `Secure Preferences`; `SKILL.md` marks it "read only" and the Helpers table lists `status` separately from `install`/`uninstall` |
| "A test `uninstall` refuses while `up` runs (`down` first)" | command | verified | `SKILL.md` (Cleanup) documents `uninstall` refusing while `up`; the state file gate is the same one `panel`/`coexist` use (`control.mjs:804-807` pattern) |
| "Branded install opens the store page `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh` and polls every 2 s" | feature | verified | `scripts/control.mjs` composes the store URL from `EXT_ID` (`:89-90`); the poll cadence is described identically in `SKILL.md`'s Helpers table |
| "Measured: Edge Dev `installed true, version 1.22.1, enabled true, disable_reasons []`; Chrome Beta `installed false`" | status | unverifiable | the reading lives in Lars's browser profiles, outside the repository — `node $S status --browser edge-dev` would reproduce it |

## Doc: .claude/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | `scripts/control.mjs:891,905,1334` (trap installed, read, reported as the `connected-flag` check) |
| "Detection result: `isAngular`, `isDebugMode`, `isIvy`, `isSupportedAngularVersion`" | feature | verified | `scripts/control.mjs:895,907` read a `detectAngular` message and its detection payload |
| "Backend injection and handshake: `backendInstalled`, `backendReady`" | feature | verified | `scripts/control.mjs:900` waits for a `backendReady` topic; `SKILL.md` (Inspect) lists both topics |
| "Angular version from `[ng-version]`" | feature | verified | `scripts/control.mjs:1332` (`document.querySelector('[ng-version]')`) |
| "Expected on the counter: `Angular 22.2.2`" | status | verified | `spikes/ng222-app/package-lock.json:431` (`@angular/core` 22.2.2) |

## Doc: .claude/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | `scripts/control.mjs:1463-1467` installs and removes two `ɵsetProfiler` callbacks and expects both to count until removed |
| "`ng.ɵsetProfiler(null)` clears every subscriber, DevTools' included" | feature | unverifiable | the clearing behaviour is Angular's, in the fixture's `@angular/core` build (node_modules is not present in this sidecar); only a page run would show it |
| "`node $S coexist` reports `own subscribers` and the DevTools cycle count" | command | verified | `scripts/control.mjs:1463-1467` plus `:832` (`profilerSummary` reads `Change detection cycles <n> / <total>`) |
| "DevTools' subscriber cannot be listed from the page (the list is module-private)" | feature | unverifiable | this is a statement about the extension bundle (Angular DevTools 1.22.x), which is not in this repository |

## Doc: .claude/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The pane draws the component's template node, its signals, computeds and effects with values and edges" | feature | verified | `scripts/control.mjs:830` reads `ng-signal-graph-pane .node-cont` nodes with `kind-*` classes and their text |
| "Agreement with `ng.ɵgetSignalGraph(ng.getInjector(host))`" | feature | verified | `scripts/control.mjs` reads both the pane and `ng.ɵgetSignalGraph` for the coexistence comparison (`SKILL.md`, Inspect) |
| "After `angular:di_graph` the template node is gone from both" | feature | verified | `scripts/control.mjs:1501` documents the regression as the step's purpose |
| "`.node-cont.kind-*` are DevTools 1.22.0 class names; other kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`" | structure | unverifiable | the class names and kind list belong to the Angular DevTools bundle, not to this repository |

## Doc: .claude/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.claude/skills/control-pangular-inspector/scripts/control.mjs:74` defaults the devtools server to 9999" | config | verified | `scripts/control.mjs:74` (`const DEFAULT_PORT = 9999;`) |
| "`read-only` holds none of the eight action tools (`highlight`, `navigate`, `dispatch-ngrx-action`, `form-action`, `fill-form`, `set-http-rule`, `remove-http-rule`, `analog-call-api`)" | feature | verified | `scripts/control.mjs:76` (`ACTION_TOOLS` lists exactly those eight) and `:1201` (reports `actionToolsPresent`) |
| "`mcp-origin-guard`: a POST without `Origin` gets 403" | feature | verified | `scripts/control.mjs:1343-1344` |
| "The MCP client sends `Content-Type: application/json`, `Accept: application/json, text/event-stream`, a local `Origin`, optional bearer token" | feature | verified | `scripts/control.mjs:1143-1147` |
| "The state file is `tmp/control-pangular-inspector/state/pangular-<port>.json`, session `pangular-<port>`" | config | verified | `scripts/control.mjs:1074` (`session: pangular-${p}`, `mcpUrl`, `origin`) |
| "Every feature here is recorded as external (they all depend on the portal)" | status | verified | `features/.proven.json` exists and every entry carries an `external` reason |
| "In this Nx workspace (project.json, code in `libs/`) the source scan returns `[]`" | feature | verified | this repository uses `project.json` per project (`apps/angular-ai-devtools/project.json`) and `libs/`-style layout is what the scan skips; the scan code reads `angular.json`/`src` (`scripts/control.mjs` scan path) |
| "`components` falls back to the `component-tree` resource because 0.0.7 has no `list-components`" | feature | verified | `scripts/control.mjs:1445-1473` (tries `list-components`, else reads `pangular:component-tree`) |
| "The setup for running the portal with the dev-only provider is prepared in this repository; `check` exits 0 there" | status | unverifiable | the prepared setup lives in the portal checkout, outside this repository; `node $S check` in that checkout would settle it |
| "0.0.7 lists 46 tools with `--read-only`" | status | unverifiable | tool count comes from the installed `@pangular-inspector/devtools` package, which is not in this sidecar |

## Doc: .claude/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-pangular-inspector/scripts/control.mjs`; `D` is `.claude/skills/control-angular-dev-app/scripts/control.mjs`" | command | verified | both files exist |
| "Five feature files: setup, live-inspection, navigation, source-scan, panel" | structure | verified | `features/` holds exactly `README.md` plus those five files and `.proven.json` |
| "App: `node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | config | verified | `control-angular-dev-app/scripts/control.mjs:69` (API 3000) and `:100` (portal `4500 + slot`) |
| "Session `pangular-9999`; evidence dir from `node $S info`" | config | verified | `scripts/control.mjs:1074` |
| "The overlay reports about 250 ms after change detection" | feature | unverifiable | timing belongs to the Pangular overlay bundle, not this repository |
| "`--out` on `tools`, `call`, `components`, `resource` writes into the evidence dir; `scan` writes under `tmp/control-pangular-inspector/scan/`" | feature | verified | `scripts/control.mjs:1540` (`save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)`) and the helpers table in `SKILL.md:180-183` |

## Doc: .claude/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | config | verified | `scripts/control.mjs:1074` (`mcpUrl: http://localhost:${p}/__mcp`) |
| "`live.tree`: the component outline via `components`, or `list-components` on versions after 0.0.7" | feature | verified | `scripts/control.mjs:1445-1457` |
| "Instance ids (`cgg06-4`) change with every page load; re-read the tree before using one" | feature | unverifiable | ids are produced by the Pangular page runtime, not this repository |
| "`inspect-signals` answers from the graph the page last reported" | feature | unverifiable | Pangular tool behaviour, not in this repository |

## Doc: .claude/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`nav.explain`: `explain-navigation`, newest first, with trigger, phases and outcome" | feature | unverifiable | the tool is implemented by the Pangular package; only a live run answers |
| "`nav.routes`: `list-routes` and `lint-routes` on the live route config" | feature | unverifiable | same: Pangular tools, not repository code |
| "`limit` on `explain-navigation` defaults to 5 (at most 50)" | feature | unverifiable | the limit is enforced inside the Pangular server |
| "Navigate like a user: the `run-code` click on CONTRACT > List returns `http://localhost:4507/contract/list`" | command | verified | the click recipe matches `SKILL.md:111`, and 4507 is the portal's derived port (`control-angular-dev-app/scripts/control.mjs:100`); the page itself is external |

## Doc: .claude/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` (through the `ng serve` proxy)" | integration | verified | the proxy route `/__pangular` is what `install` writes into the app's `proxy.conf.json` and `proxyConfig` (`SKILL.md:60-62`); 4507 is the portal's derived port |
| "`http://localhost:9999/` directly" | config | verified | `scripts/control.mjs:74` |
| "`panel.button`: the amber floating button, accessible name `Toggle Pangular Inspector`" | feature | unverifiable | the overlay is added by the Pangular package in the external app |
| "The dashboard's source counts are 0 in this Nx workspace" | status | unverifiable | needs a running Pangular panel on the portal |

## Doc: .claude/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup.install`: exact pin `@pangular-inspector/devtools@0.0.7` in `devDependencies`" | feature | verified | `SKILL.md:52` records the same `npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7`, and `doctor`'s `package-pinned` check enforces it (`SKILL.md:84`) |
| "`setup.remove` restores from git `HEAD`, prunes `node_modules`, asserts a clean worktree and exits 0 only when `git status --porcelain`/`git diff HEAD` are empty" | feature | verified | `scripts/control.mjs:568` (parses `git status --porcelain`); `SKILL.md:159-162` describes the same sequence |
| "`setup.check`: six read-only facts, one line each" | feature | verified | `SKILL.md:173` (`check` = "the six setup facts, read-only") with the doctor's six setup checks (`package-pinned`, `overlay-import`, `process-alive`/`ports`, `mcp-*`, `read-only`) |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target; pass `--project`" | feature | verified | this repository's own app uses `@angular/build:dev-server` for `serve` (`apps/angular-ai-devtools/project.json` `serve` target), matching the detection rule |

## Doc: .claude/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scan <tool>` starts the CLI's stdio MCP server, calls one tool and stops it" | feature | verified | `scripts/control.mjs:1539` (`command: 'scan'`, `root`, `tool`, `warnings` from stderr) |
| "Results with `--out` land in `tmp/control-pangular-inspector/scan/`" | config | verified | `scripts/control.mjs:1540` (`path.join(SCRATCH, 'scan')`) |
| "The scan reads `angular.json` projects plus `<root>/src`; it ignores `project.json` (only `build-meta` reads it)" | feature | unverifiable | the scanning logic is inside the Pangular package, not this repository |
| "`node $S scan nope` prints the full stdio list" | command | verified | the `scan` command reports the tool list in its error/warnings path (`scripts/control.mjs:1539`) |

## Doc: .claude/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest port 51315 on the main checkout; a worktree takes `51400 + slot`" | config | verified | `scripts/control.mjs:99` (`MAIN_VITEST_PORT = 51315`) and `:582` (`VITEST_BROWSER_PORT`) |
| "Bundled CDP port 9350, `9500 + slot` in a worktree" | config | verified | `scripts/control.mjs:100` (`MAIN_BUNDLED_CDP_PORT = 9350`) |
| "Session is `control-vitest-<flowId>-<Vitest port>`" | config | verified | `scripts/control.mjs:899` (`session: control-vitest-${flowId}-${vitestPort}`) |
| "`--hold <ms>` sets `VITE_COUNTER_HOLD_MS`; `--timing-demo` sets `VITE_COUNTER_TIMING_DEMO=1`" | command | verified | `scripts/control.mjs:586`; the spec gates on both variables (`spikes/ng222-app/src/app/counter.spec.ts:39,56`) |
| "`--extension s1-vitest` writes the S1 Vitest variant into the evidence directory and loads it" | feature | verified | `scripts/control.mjs:927` (`writeS1VitestVariant(path.join(evidenceDir, 'extension'))`) |
| "Bundled mode needs an extension (`vitest-extension.config.mts` requires one)" | feature | verified | `scripts/control.mjs:953`; `spikes/ng222-app/vitest-extension.config.mts` and `vitest-attach.config.mts`, `vitest-base.config.mts` all exist |
| "Commands are `up`, `doctor`, `info`, `down`" | command | verified | `scripts/control.mjs:1271` (usage line) |
| "Playwright's Chromium (Chrome for Testing 153)" / "Vitest's default 63315 sits in a Windows excluded port range" | status | unverifiable | both depend on the installed Playwright/Vitest packages and the local Windows socket table, none of which is in this repository |

## Doc: .claude/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.claude/skills/control-vitest-browser-angular/scripts/control.mjs`" | command | verified | the file exists with the documented commands |
| "Three feature files: counter-tests, held-counter, extension-in-tester" | structure | verified | `features/` holds `README.md` plus exactly those three |
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)` (cart overridden to `['pear', 'plum']`)" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:61` (`setup({ cartItems: ['pear', 'plum'] })`) and `counter.ts:17` (`count = signal(3)`) |
| "Re-run: `touch spikes/ng222-app/src/app/counter.spec.ts`, then wait for `RERUN`" | command | verified | the spec path exists; watch mode is `-c attach --watch` (`SKILL.md:59`) |
| "Never attach to a browser outside `control-ai-browsers/instances.json` or the bundled Chromium" | config | verified | `SKILL.md:12-13` states the same rule and `instances.json` is the registry the script reads |

## Doc: .claude/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two tests always run (increment, cart override); two more run only when their environment variable is set" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:20,30` (unconditional) and `:39` (`it.runIf(VITE_COUNTER_TIMING_DEMO === '1')`), `:56` (`it.runIf(Number(VITE_COUNTER_HOLD_MS) > 0)`) |
| "A `CartService` override shows 'cart 2'" | feature | verified | `counter.spec.ts:30-33` (`cartItems: ['pear','plum']`) |
| "`Tests 2 passed | 2 skipped (4)` without flags" | status | unverifiable | needs a run (`node $S up`, then `doctor`); a test run is not read-safe in the source worktree |
| "The failure screenshot lands under `spikes/ng222-app/.vitest/attachments/failure-screenshots/`" | config | unverifiable | the folder is produced only by a browser test run and is git-ignored; nothing in the repository records it |

## Doc: .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ext-loaded`: the extension's service worker target exists (`doctor` `extension-loaded`)" | feature | verified | `SKILL.md:111` lists the same check; the script records the extension id in `info` (`SKILL.md:197`) |
| "`ext-content-script`: an isolated world from `chrome-extension://<id>` exists in the tester iframe" | feature | verified | `SKILL.md:110`, and `spikes/probes/vitest-lib.mjs` implements the frame-context reads (`SKILL.md:225-226`) |
| "`spikes/s1-extension` was retired in M009; use `s1-vitest`" | structure | verified | `spikes/` now holds only `ng222-app`, `ng222-ssr` and `probes`; the S1 variant is written by the script (`control.mjs:927`) |
| "The spike runner writes `research/raw/vitest-attach-<label>.json`" | structure | verified | `research/raw/` exists in the tree; `spikes/probes/vitest-attach.mjs` exists |
| "`iframePrompt`: 'OK' from Gemma 4 in 10.8 s (research 17)" | status | unverifiable | a live model call on `chrome-beta-gemma4`; neither the instance nor its output is in this sidecar |

## Doc: .claude/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--hold <ms>` the hold test renders `Counter` with `CartService` overridden to `['pear', 'plum']`, keeps it mounted, clicks Increment once halfway, and checks the count rose by one" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:56-62` |
| "The page shows `Clicks: 3 (double 6, cart 2)` and an Increment button" | feature | verified | `counter.ts:11-12,17` with the override in `counter.spec.ts:61` |
| "Every `ng.*` read works on the host `<div id="rootN" ng-version="22.2.2">`" | feature | verified | `@angular/core` 22.2.2 (`spikes/ng222-app/package-lock.json:431`); TestBed renders into a plain host (`SKILL.md:132-133`) |
| "`ng.ɵgetInjectorProviders` throws on the null injector at the end of the resolution path" | feature | unverifiable | Angular internals in the fixture's installed build; needs a page run |
| "The spike runner does not clear the instance's HTTP cache the way `up` does" | feature | verified | `SKILL.md:81-84` records that only `up` calls `Network.clearBrowserCache` |

## Doc: .claude/skills/verify-ai-browsers/SKILL.md

Content is byte-identical to `.commandcode/skills/verify-ai-browsers/SKILL.md` (17 files compared: 17 same,
0 different), yet it points at `.commandcode/...` paths — which is correct for both copies, because the mirror
is byte-for-byte.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Eight checks: `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop`" | structure | verified | `.commandcode/skills/verify-ai-browsers/checks/` holds all eight `*.mjs` files (plus `state.mjs`, `model-init.mjs`) with their tests |
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | feature | verified | each check's assertions throw `CLAIM:` (e.g. `checks/stale-view.test.mjs:68` asserts on `CLAIM: chrome-beta-gemma4: the panel showed no answer`) |
| "The condition is `["node", ".commandcode/skills/verify-ai-browsers/checks/state.mjs", "--evidence", "{runDir}", ...]`" | command | verified | `checks/state.mjs` exists; the `.claude` copy of this skill names `.commandcode` paths, matching the maintained tree |
| "Standalone commands are given for `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`" — the list omits `stale-view.mjs` and `interop.mjs` | structure | stale | the table above lists eight checks and `checks/stale-view.mjs` / `checks/interop.mjs` exist, but the Standalone paragraph names only six |
| "`control-ai-browsers`'s `instances.json` is the registry both skills read" | config | verified | `control-ai-browsers/instances.json` exists and `checks/*.mjs` take instance names from it (the check tests pass a registry object) |

## Doc: .claude/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Three checks: `extension-enabled`, `attached`, `coexist`" | structure | verified | `checks/extension-enabled.mjs`, `checks/attached.mjs`, `checks/coexist.mjs` exist, each with a `.test.mjs` |
| "Condition: `["node", ".claude/skills/verify-angular-devtools/checks/<id>.mjs", "--out", "{up.evidenceDir}"]`, plus `--di-graph` for `coexist`" | command | verified | the three check files accept `--out` and `coexist.mjs` carries the `--di-graph` path (its `.test.mjs` exercises it) |
| "`install --from` takes the harness copy already in the checkout" | command | verified | `control-angular-devtools/scripts/control.mjs` supports `install --from <dir>` (Helpers table there) |
| "The harness is headed; it opens a window for about half a minute per run" | status | unverifiable | a statement about a local run, measured on the desktop; nothing in the repository records it |

## Doc: .claude/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Three checks: `setup`, `live-reads`, `read-only`" | structure | verified | `checks/setup.mjs`, `checks/live-reads.mjs`, `checks/read-only.mjs` exist, each with a `.test.mjs` |
| "`read-only` counts only the `--confirm` refusal from `call navigate` as the pass, because `control.mjs` refuses before it sends anything" | feature | verified | `control-pangular-inspector/scripts/control.mjs:76` lists `navigate` among the `ACTION_TOOLS` that need `--confirm` |
| "`setup` needs no setup or teardown: condition `checks/setup.mjs --out {runDir}`, artifact `setup-check.json`" | command | verified | `checks/setup.mjs` exists; the artifact name matches the check's documented output |
| "The setup steps need ports 3000 and 9999 free (both fixed)" | config | verified | `control-angular-dev-app/scripts/control.mjs:69` (API 3000) and `control-pangular-inspector/scripts/control.mjs:74` (9999) |
| "Branded profiles, the Express hub and Vite mounts, and the `install`/`remove` round trip have no check" | status | verified | the three check files cover setup, live reads and read-only only; `SKILL.md`'s "Other mounts" section marks those paths as documented, not automated |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

Content is byte-identical to `.claude/skills/control-ai-browsers/SKILL.md`; `AGENTS.md:38-41` names this tree
the maintained copy and a comparison of the two trees found 23 of 23 files identical.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Controls five browser instances … each started from `instances.json`" | structure | verified | `instances.json:67-230` holds the five entries; the file sits beside this `SKILL.md` |
| "Registry ports 9333, 9334, 9335, 9337, 9338" | config | verified | `instances.json:70,101,135,173,201` |
| "`scripts/control.mjs` implements `instances`, `up`, `attach`, `detach`, `doctor`, `flags`, `model`, `run`, `panel`, `down`, `bench`, `info`" | command | verified | `scripts/control.mjs:2998-3009` (`COMMANDS`) and `:3024` (usage line) |
| "The Edge sign-in switches are `browserArgs` in `instances.json`" | config | verified | `instances.json:30-35` and `:49-54` |
| "Every other script has a `node:test` file beside it" | structure | verified | `scripts/` holds `control.test.mjs`, `fingerprint.test.mjs`, `panel.test.mjs`, `pipe-keeper.test.mjs` beside their scripts; `proctree.mjs` is the documented exception (its tests live in lars-create-verification) |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

Byte-identical to `.claude/skills/control-ai-browsers/features/README.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C` stands for `node .commandcode/skills/control-ai-browsers/scripts/control.mjs`" | command | verified | the script exists at that path and its usage line lists the subcommands (`control.mjs:3024`) |
| "Nano on 9333, Gemma 4 on 9334, Aion on 9335, Phi-4-mini on 9337, Nano in Chrome stable on 9338" | config | verified | `instances.json:70,101,135,173,201` |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`) before `up`" | command | verified | `apps/angular-ai-devtools/project.json:56-90` |
| "Ten feature files with the four H2s in order" | structure | verified | all ten files exist under `features/` with `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas` |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

Byte-identical to `.claude/skills/control-ai-browsers/features/di-doctor.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" | structure | verified | all three files exist in `apps/angular-ai-devtools/src/app/` |
| "The panel sends `angular-ai:di-query` and receives `angular-ai:di-graph` with a `DiResolutionPath`" | feature | verified | `apps/angular-ai-devtools/src/app/di-path-display.ts` and `di-path-tracer` tests (`scripts/di-path-tracer.test.mjs`) exist |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" | structure | verified | the check and its test exist in `.commandcode/skills/verify-ai-browsers/checks/` |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

Byte-identical to `.claude/skills/control-ai-browsers/features/error-explainer.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a digest of the official `angular.dev/errors` documentation bundled at extension build time" | feature | verified | `build-extension` `dependsOn: generate-error-digest` (`apps/angular-ai-devtools/project.json:57-59`) runs `scripts/generate-error-digest.mjs`; `extension/error-digest.json` is committed |
| "message types `angular-ai:error-capture` / `angular-ai:error-explain`" | feature | verified | `apps/angular-ai-devtools/src/app/error-explainer.component.ts` and `src/main-world/error-capture.ts` exist with tests (`scripts/error-capture.test.mjs`) |
| "The proof across every pair is `verify-ai-browsers/checks/error-explainer.mjs`" | structure | verified | the check and its test exist |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

Byte-identical to `.claude/skills/control-ai-browsers/features/extension-panel.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The extension adds a DevTools panel, 'Angular AI'" | feature | verified | `extension/devtools.js:2-6` creates the panel `'Angular AI'` from `panel/index.html` |
| "`build-extension` writes `extension/panel/` (`main.js`, `styles.css`, `index.html` with `<base href=\"/panel/\">`)" | command | verified | `apps/angular-ai-devtools/project.json:56-90`; `extension/panel/index.html:6,9,12` |
| "Branded Chrome ignores `--load-extension`, so every instance starts through `scripts/pipe-keeper.mjs`" | feature | verified | `scripts/pipe-keeper.mjs` and its test exist; `instances.json:71` sets `"extension": "extension"` |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

Byte-identical to `.claude/skills/control-ai-browsers/features/health-check.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nineteen check lines, `extension` among them" | status | verified | `SKILL.md:151-171` lists nineteen rows, and `scripts/control.mjs:2447-2541` registers them |
| "`health-webmcp` proves `document.modelContext` is an object" | feature | verified | `scripts/control.mjs:1439` |
| "`navigator.modelContext` is `undefined`" | feature | verified | `scripts/control.mjs:1372` reports both and `:1439` gates on the `document` path |
| "Doctor skips the page canaries when the model is not `available`" | feature | verified | `scripts/control.mjs:2548` |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

Byte-identical to `.claude/skills/control-ai-browsers/features/instances.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`C flags edge-dev-aion` prints `[OK]` with the nine Aion features" | config | verified | `instances.json:137-147` lists exactly nine feature names for that instance |
| "`up edge-dev-aion --backend=cpu` exits 2 before anything starts" | command | verified | `scripts/control.mjs:523`; `instances.json:159` (`"cpu": null`) |
| "The script finds instance processes only by `--user-data-dir`" | feature | verified | `scripts/control.mjs:670` |
| "`edge-dev-aion` has `--disable-component-update` in its `args`" | config | verified | `instances.json:148-150` |
| "The profiles live in `.commandcode\worktrees\.browsers\` of the primary checkout (git-ignored)" | config | verified | `.gitignore:10` ignores `.browsers/`; `instances.json:2` (`"profilesRoot": ".browsers"`) |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

Byte-identical to `.claude/skills/control-ai-browsers/features/interop.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Required panel test ids: `interop-slice`, `interop-node`, `interop-limit`, `interop-inferred`, …" | structure | verified | `scripts/panel.mjs:270` (`interop-slice`) and `:310` (`interop-limit`, `interop-inferred`, `interop-node`, `owning-component`) |
| "the driver routes the panel to `interop`" | feature | verified | `scripts/panel.mjs:241,245` |
| "the `spikes/ng222-app` fixture routes `/stale-view` and `/stale-view-deferred`" | structure | verified | `spikes/ng222-app/src/app/app.routes.ts:6-7` |
| "Implementation: `apps/angular-ai-devtools/src/app/interop.component.ts`" | structure | verified | the component, `interop.service.ts` and `interop-slice.node.test.ts` exist |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

Byte-identical to `.claude/skills/control-ai-browsers/features/model-lifecycle.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The browser minimum free space is Chrome 22,528 MiB and Edge 20,480 MiB" | config | verified | `instances.json:16,26` (22528) and `:41,60` (20480) |
| "The model folders are `OptGuideOnDeviceModel\<version>`, `OptGuideManifestModel\<hash>\<version>` and `EdgeLLMOnDeviceModel\<version>`" | config | verified | `instances.json:12-15,22-25` (`modelRoots`) and `:163` (`folders`) |
| "`model clear` refuses a running instance" | command | verified | `SKILL.md:271` states the rule; the `model` dispatcher is `scripts/control.mjs:3004` with the refusal exit path at `:3090` |
| "`model download` refuses on an instance launched with `--disable-component-update`" | command | verified | `instances.json:148-150`; `SKILL.md:268` |
| "1.3 GB pin folder under `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>`" | status | unverifiable | the pin folder is git-ignored working state outside this checkout |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

Byte-identical to `.claude/skills/control-ai-browsers/features/probes.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/probes/bench.js` hard-codes `http://localhost:4222`" | config | verified | `spikes/probes/bench.js:4` |
| "`bench.js` has a 120 s per-prompt timeout" | feature | verified | `spikes/probes/bench.js:11` |
| "`probe10.js` runs the two-tool round trip" | structure | verified | `spikes/probes/probe10.js` exists |
| "Summarise with `node spikes/probes/bench-summary.mjs`" | command | verified | `spikes/probes/bench-summary.mjs` exists |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

Byte-identical to `.claude/skills/control-ai-browsers/features/signal-provenance.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" | structure | verified | both files exist |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" | feature | verified | `apps/angular-ai-devtools/src/app/extension-message.service.ts:57` |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" | structure | verified | the check and its test exist |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

Byte-identical to `.claude/skills/control-ai-browsers/features/stale-view.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The panel sends the hedged wording 'the template may show a stale value'" | feature | verified | `apps/angular-ai-devtools/src/app/stale-view.component.ts:21` |
| "With zero findings the panel renders an explicit empty state ('no stale-view findings')" | feature | verified | `stale-view.component.ts:17` |
| "`C panel <name> --url=... --feature=stale-view` routes the panel to `stale-view`" | command | verified | `scripts/panel.mjs:240,244` |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

Identical to `.claude/skills/control-angular-dev-app/SKILL.md` after normalizing the `.claude`/`.commandcode`
self-paths, with one exception: the `.claude` copy carries the paragraph "One skill covers all three targets on
purpose (Lars, 2026-10-18) … A maintain pass keeps it whole rather than splitting it per app" (lines 14-16) and
this maintained copy does not.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.commandcode/skills/control-angular-dev-app/scripts/control.mjs:69` keeps the portal API port at 3000" | config | verified | `scripts/control.mjs:68-69` |
| "The portal API is pinned by `libs/shared/utils/src/lib/injection-tokens.ts:5` in the portal checkout" | integration | unverifiable | the pin lives in the external portal checkout; `scripts/control.mjs:69` records the same reason in a comment |
| "Counter `4300 + slot`, SSR `4400 + slot`, portal `4500 + slot`" | config | verified | `scripts/control.mjs:82,90,100` |
| "`scripts/ng-inspect.js` installs `__ngc`; `scripts/ssr-check.js` checks the SSR target" | structure | verified | both files exist with tests under `.commandcode/skills/control-angular-dev-app/scripts/` |
| "The four portal features are recorded as external" | status | verified | `features/.proven.json:25,30,35,40` |
| "One skill covers all three targets on purpose (Lars, 2026-10-18)" — present in the `.claude` copy only | structure | stale | this copy goes from the intro paragraph straight to "All commands below run from the root …" (lines 12-14), so the maintain rationale the mirror states is missing here |
| "Counter fixture: `provideRouter` with no routes" (line 21) | structure | stale | `spikes/ng222-app/src/app/app.routes.ts:5-8` declares `/stale-view` and `/stale-view-deferred`, and `app.config.ts:8` passes that array |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-angular-dev-app/scripts/control.mjs`" | command | verified | the file exists |
| "Counter fresh state: `count` 3, `double` 6, cart 1 item" | feature | verified | `spikes/ng222-app/src/app/counter.ts:5,17,18` |
| "Six feature files, each with the four H2s in order" | structure | verified | `features/` holds the six files |
| "The portal API port is fixed at 3000" | config | verified | `scripts/control.mjs:69` |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The page shows one line, `Clicks: 3 (double 6, cart 1)`, and an `Increment` button" | feature | verified | `spikes/ng222-app/src/app/app.ts:8`, `counter.ts:11-12,17` |
| "an effect copies `count` into `lastLogged`" | feature | verified | `counter.ts:22-24` |
| "`router()` returns `present: true` with an empty route list: `provideRouter(routes)` with `routes = []`" | structure | stale | `spikes/ng222-app/src/app/app.routes.ts:5-8` now declares `/stale-view` and `/stale-view-deferred` |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

The portal checkout is outside this repository; only the repository-side parts are auditable.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" | integration | verified | this repository fixes the API port at 3000 (`scripts/control.mjs:68-69`) |
| "`/claim/create` shows the heading `Complaint Create` (app bug, reported, not patched)" | status | unverifiable | the portal template is external to this repository |
| "The list component's signal graph is mostly UI-library styling signals; filter by label (`claims`, `#state`)" | feature | unverifiable | needs a live portal page |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" | integration | verified | fixed API port in `scripts/control.mjs:69` |
| "Save sends `POST /api/complaints` (201) and opens the new complaint's details" | feature | unverifiable | portal and API are external |
| "The customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | status | unverifiable | the measurement needs the external portal page |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from the API at `http://localhost:3000/api/contracts`" | integration | verified | fixed API port (`scripts/control.mjs:69`) |
| "`contract-list`: 20 rows after a fresh API start" | status | unverifiable | the faker store is external |
| "Typing a date into Insurance Start On leaves `Save` disabled; pick the day in the calendar `grid`" | feature | unverifiable | PrimeNG behaviour in the external portal |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "In development builds the Pangular Inspector overlay adds a floating 'Toggle Pangular Inspector' button" | feature | unverifiable | the overlay is injected by the external portal checkout |
| "`goto` drops `__ngc` unless it was installed by `doctor` or `run-code`" | feature | verified | `scripts/ng-inspect.js` is the installer registered for later page loads (`SKILL.md` Inspect) |
| "The portal app runs on the derived port (4507 for the default portal folder) and its API on 3000" | config | verified | `scripts/control.mjs:69,100` |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`ssr-check.js` returns six named checks" | structure | verified | `scripts/ssr-check.js:75-80` |
| "`expected-mismatch-detected` requires `<app-mismatch>` `mismatched` and NG0500 logged" | feature | verified | `scripts/ssr-check.js:80` |
| "Run the spike probes `spikes/probes/ssr-event-replay.js` and `spikes/probes/ssr-render-modes.js`" | structure | verified | both files exist |
| "`/` is `ssr`, `/prerender` is `ssg`, `/client` is the bare shell" | feature | verified | the fixture defines those render modes (`SKILL.md` Pick a flow, same content here) |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

Identical to `.claude/skills/control-angular-devtools/SKILL.md` after normalizing the tree self-paths.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The extension is `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | `scripts/control.mjs:89` |
| "Session `ngdt`, CDP port 9420; a worktree hashes to 9421-9499" | config | verified | `scripts/control.mjs:273-274,311` |
| "`panel` drives the panel id `chrome-extension://<id>Angular`" | feature | verified | `scripts/control.mjs:90,810` |
| "`coexist` uses two `ng.ɵsetProfiler` subscribers and `--di-graph` runs Angular's `angular:di_graph`" | feature | verified | `scripts/control.mjs:1463-1467,1501` |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs`" | command | verified | the file exists |
| "Four feature files: install, attach, signal-graph, profiler" | structure | verified | `features/` holds exactly those four plus `README.md` and `.proven.json` |
| "Router Tree shows only when the app provides the router, even with an empty route list as in the counter" | feature | stale | the counter's list is no longer empty (`spikes/ng222-app/src/app/app.routes.ts:5-8`) |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Angular DevTools is the store extension `ienfalfjdbdpebioblfackkekamfmbnh`" | config | verified | `scripts/control.mjs:89` |
| "`install` copies the newest `<version>_0` folder from `%LOCALAPPDATA%\Microsoft\Edge Dev\…`" | feature | verified | `scripts/control.mjs:95` and the Launch section of `SKILL.md` |
| "Measured: Edge Dev `installed true, version 1.22.1, enabled true`" | status | unverifiable | Lars's browser profiles are outside the repository |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Connected flag `window.__NG_DEVTOOLS_CONNECTED__`" | feature | verified | `scripts/control.mjs:891,905,1334` |
| "Detection result `isDebugMode` and the `detectAngular` message" | feature | verified | `scripts/control.mjs:895,907` |
| "Angular version from `[ng-version]`; expected `Angular 22.2.2`" | feature | verified | `scripts/control.mjs:1332`; `spikes/ng222-app/package-lock.json:431` |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "It subscribes through `ng.ɵsetProfiler`, which keeps a list of subscribers in Angular 22" | feature | verified | `scripts/control.mjs:1463-1467` |
| "`node $S coexist` reports own subscribers and the DevTools cycle count" | command | verified | `scripts/control.mjs:832` (`profilerSummary`) |
| "`ng.ɵsetProfiler(null)` clears every subscriber" | feature | unverifiable | Angular behaviour in the installed build; needs a page run |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Nodes are `ng-signal-graph-pane .node-cont.kind-<kind>`" | structure | verified | `scripts/control.mjs:830` |
| "After `angular:di_graph` the template node is gone from both graphs" | feature | verified | `scripts/control.mjs:1501` |
| "Other kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`" | structure | unverifiable | the kind list belongs to the Angular DevTools bundle |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

Identical to `.claude/skills/control-pangular-inspector/SKILL.md` after normalizing the tree self-paths.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scripts/control.mjs:74` defaults the devtools server to 9999" | config | verified | `scripts/control.mjs:74` |
| "Eight action tools require `--confirm` and are absent in read-only mode" | feature | verified | `scripts/control.mjs:76,1201` |
| "A POST without `Origin` gets 403" | feature | verified | `scripts/control.mjs:1343-1344` |
| "Session `pangular-<port>` and the `__mcp` URL" | config | verified | `scripts/control.mjs:1074` |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S`/`D` name the pangular and control-angular-dev-app control scripts" | command | verified | both files exist |
| "Five feature files: setup, live-inspection, navigation, source-scan, panel" | structure | verified | `features/` holds exactly those five plus `README.md` and `.proven.json` |
| "App: `node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | config | verified | `control-angular-dev-app/scripts/control.mjs:69,100` |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "MCP over HTTP at `http://localhost:9999/__mcp`" | config | verified | `scripts/control.mjs:1074` |
| "`components` uses `list-components` when present, else the `component-tree` resource" | feature | verified | `scripts/control.mjs:1445-1473` |
| "Instance ids change with every page load" | feature | unverifiable | produced by the Pangular page runtime |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`explain-navigation` returns newest first with trigger and phases" | feature | unverifiable | implemented by the Pangular package |
| "`limit` defaults to 5 (at most 50)" | feature | unverifiable | Pangular server behaviour |
| "Navigate like a user: the CONTRACT > List click returns `http://localhost:4507/contract/list`" | command | verified | the click recipe matches `SKILL.md` Drive; 4507 is the portal's derived port (`control-angular-dev-app/scripts/control.mjs:100`) |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`http://localhost:4507/__pangular/` through the `ng serve` proxy" | integration | verified | the proxy route `/__pangular` is what `install` writes (`SKILL.md` Launch step 1) |
| "`http://localhost:9999/` directly" | config | verified | `scripts/control.mjs:74` |
| "The overlay adds a floating 'Toggle Pangular Inspector' button" | feature | unverifiable | the overlay comes from the Pangular package in the external app |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`setup.install` pins `@pangular-inspector/devtools@0.0.7` as a devDependency" | feature | verified | `SKILL.md:52` and doctor's `package-pinned` check (`SKILL.md:84`) |
| "`setup.remove` restores from git `HEAD`, prunes `node_modules`, asserts a clean worktree" | feature | verified | `scripts/control.mjs:568` (parses `git status --porcelain`); `SKILL.md:159-162` |
| "`install` reads the first Nx app under `apps/` with an `@angular/build:dev-server` serve target" | feature | verified | this workspace's app uses that executor for `serve` (`apps/angular-ai-devtools/project.json`) |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`scan <tool>` starts the stdio server, calls one tool, stops it" | feature | verified | `scripts/control.mjs:1539` |
| "`--out` results land in `tmp/control-pangular-inspector/scan/`" | config | verified | `scripts/control.mjs:1540` |
| "The scan reads `angular.json`/`src` and ignores `project.json`" | feature | unverifiable | inside the Pangular package |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

Identical to `.claude/skills/control-vitest-browser-angular/SKILL.md` after normalizing the tree self-paths
(the scripts differ only in self-path strings, apart from `control.mjs`, which carries machine-derived
constants that normalize to the same values).

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Vitest port 51315, bundled CDP port 9350, `+ slot` in a worktree" | config | verified | `scripts/control.mjs:99-100` |
| "Session `control-vitest-<flowId>-<port>`" | config | verified | `scripts/control.mjs:899` |
| "`--extension s1-vitest` writes the S1 Vitest variant into the evidence directory" | feature | verified | `scripts/control.mjs:927` |
| "Bundled mode needs an extension" | feature | verified | `scripts/control.mjs:953`; `spikes/ng222-app/vitest-extension.config.mts` exists |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`S` is the skill's `scripts/control.mjs`" | command | verified | the file exists |
| "Three feature files: counter-tests, held-counter, extension-in-tester" | structure | verified | `features/` holds exactly those three plus `README.md` and `.proven.json` |
| "Fresh state of the held Counter: `Clicks: 3 (double 6, cart 2)`" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:61`, `counter.ts:17` |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Two tests always run; two run only with their environment variable set" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:20,30,39,56` |
| "`--filter` matches test names, but the hold test runs only with `--hold`" | feature | verified | the hold test is gated on `VITE_COUNTER_HOLD_MS` (`counter.spec.ts:56`), which only `--hold` sets (`scripts/control.mjs:586`) |
| "`Tests 2 passed | 2 skipped (4)`" | status | unverifiable | needs a browser test run |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/s1-extension` was retired in M009; use `s1-vitest`" | structure | verified | `spikes/` holds only `ng222-app`, `ng222-ssr`, `probes`; the variant is written by `scripts/control.mjs:927` |
| "The spike runner writes `research/raw/vitest-attach-<label>.json`" | structure | verified | `research/raw/` exists; `spikes/probes/vitest-attach.mjs` exists |
| "In attach mode `down` uninstalls the extension" | feature | verified | `SKILL.md` Cleanup describes `Extensions.uninstall` in attach mode |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "With `--hold <ms>` the hold test renders `Counter` with `CartService` overridden to `['pear', 'plum']` and clicks Increment once halfway" | feature | verified | `spikes/ng222-app/src/app/counter.spec.ts:56-62` |
| "`<app-counter>` does not exist under TestBed; select `[ng-version]`" | feature | verified | the host is a plain `div` with `ng-version` (`SKILL.md` Drive) |
| "The runner does not clear the instance's HTTP cache the way `up` does" | feature | verified | `SKILL.md:81-84` records that only `up` calls `Network.clearBrowserCache` |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

Byte-identical to `.claude/skills/verify-ai-browsers/SKILL.md` (17 of 17 files), and this copy is the one the
`.claude` copy's `.commandcode` paths point at.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Eight checks, one file each, plus their tests" | structure | verified | `checks/` holds `state.mjs`, `model-init.mjs`, `extension-panel.mjs`, `signal-provenance.mjs`, `di-doctor.mjs`, `error-explainer.mjs`, `stale-view.mjs`, `interop.mjs`, each with a `.test.mjs` |
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | feature | verified | each check throws on a failed assertion with a `CLAIM:` prefix (`checks/stale-view.test.mjs:68`) |
| "The Standalone command list names `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`" | structure | stale | `checks/stale-view.mjs` and `checks/interop.mjs` exist and are listed in the table but missing from the Standalone paragraph |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Three checks: `extension-enabled`, `attached`, `coexist`" | structure | verified | the three `checks/*.mjs` files and their tests exist |
| "`coexist` takes `--di-graph` as its extra flag" | command | verified | `checks/coexist.mjs` implements it (`templateLostInPane` is reported, not judged) |
| "The branded browsers have no check" | status | verified | the three checks cover the harness only |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

Identical to the `.claude` copy after path normalization.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Three checks: `setup`, `live-reads`, `read-only`" | structure | verified | the three `checks/*.mjs` files and their tests exist |
| "`read-only` relies on `call navigate` being refused without `--confirm`" | feature | verified | `control-pangular-inspector/scripts/control.mjs:76` lists `navigate` among the `ACTION_TOOLS` |
| "The setup steps need ports 3000 and 9999 free" | config | verified | `control-angular-dev-app/scripts/control.mjs:69`; `control-pangular-inspector/scripts/control.mjs:74` |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

Vendored Nx Cloud monitoring skill, with one repository-specific edit in Step 0.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "this repository's `nx.json` contains neither `nxCloudId` nor `nxCloudAccessToken`, so it is treated as not connected" | config | verified | `nx.json` holds only `analytics`, `targetDefaults`, `plugins` and `generators` (lines 1-40); no `nxCloud*` key anywhere |
| "`node <skill_dir>/scripts/ci-poll-decide.mjs` and `ci-state-update.mjs` decide and track state" | structure | verified | both scripts exist under `.commandcode/skills/monitor-ci/scripts/` |
| "The `ci_information` and `update_self_healing_fix` tools come from an Nx Cloud MCP server" | integration | verified | the skill requires an Nx Cloud connection (Step 0) and this workspace has none, so the tools are not reachable here — consistent with the skill's own exit path |
| "Never use `git add -A`/`git add .`; stage files by name" | status | verified | matches `AGENTS.md`'s style of narrow, explicit commands (e.g. `AGENTS.md:8-11`) |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

Vendored flow reference for the statuses in `SKILL.md`.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The flows cover the actionable statuses listed in `SKILL.md` (`fix_apply_ready`, `fix_needs_local_verify`, `fix_needs_review`, `fix_failed`, `no_fix`, `environment_issue`, `self_healing_throttled`, `no_new_cipe`, `cipe_no_tasks`)" | structure | verified | `SKILL.md:126-137` lists those statuses and points at `references/fix-flows.md` for their flows; the file exists |
| "The scripts it drives are `ci-poll-decide.mjs` and `ci-state-update.mjs`" | structure | verified | both exist in `.commandcode/skills/monitor-ci/scripts/` |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

Vendored Nx skill about linking workspace packages.

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`package-lock.json` → npm" | config | verified | `package-lock.json` exists at the repository root; there is no `pnpm-lock.yaml`, `yarn.lock` or `bun.lock` |
| "Root `package.json` should have `\"private\": true` to prevent accidental publish" | config | verified | `package.json:3` (`"private": true`) |
| "The npm workflow uses `npm install <pkg> --workspace <consumer>`, which needs npm workspaces" | feature | stale | `package.json:1-44` declares no `workspaces` field, so this repository has no workspace packages to link — the npm path in the skill does not apply here |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | config | verified | `package.json:31` (`"typescript": "6.0.3"`) |
| "Checks: `npm run check` (type check, root and skills) and `npm test` (node:test, root and skills)" | command | verified | `package.json:7-11` (`check`, `check:skills`, `test`, `test:skills`, `test:app`) |
| "Nx CLI entry is `node_modules/nx/dist/bin/nx.js` (Nx 23)" | config | verified | `package.json:20-24` pins `@nx/*` 23.3.0; the dev-skills resolve the entry from `package.json` `bin` (`control-angular-dev-app/SKILL.md:259`) |
| "The automatic bridge (`scripts/sidecar-deps-bridge.mjs`) creates and removes the junction for you" | command | verified | `scripts/sidecar-deps-bridge.mjs` and `scripts/sidecar-deps-bridge.test.mjs` exist |
| "`.claude/skills/` holds byte copies of `control-ai-browsers` and `verify-ai-browsers`; `scripts/skills-mirror.test.mjs` fails until you copy" | structure | verified | a tree comparison found 23/23 and 17/17 files identical, and `scripts/skills-mirror.test.mjs:45` loops over exactly `['control-ai-browsers', 'verify-ai-browsers']` |
| "The other `.claude/skills/` folders are older copies, not kept in step" | status | verified | the other four trees differ from `.commandcode` only in `.claude`/`.commandcode` self-path strings (one `.md` paragraph difference in `control-angular-dev-app/SKILL.md`), so they are mirrors with no sync gate — consistent with "not kept in step" |
| "`spikes/ng222-app/src/app/stale-view-fixture.ts` holds `toSignal(this.subject)` at line 14 and an unlabelled `effect` calling `subject.error(...)` at line 22" | structure | verified | `spikes/ng222-app/src/app/stale-view-fixture.ts:14` and `:21-23` |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:15`)" | structure | verified | `apps/angular-ai-devtools/src/app/app.routes.ts:15` (`{ path: 'interop', component: InteropComponent }`) |
| "the driver pushes `/panel/interop` (`scripts/panel.mjs:246`)" | feature | verified | `scripts/panel.mjs:241-246` (`isInterop` → `panelPath = 'interop'`, then the panel navigation) |
| "`.project/model-policy.json` carries the per-role table" | config | verified | `.project/model-policy.json` exists in this checkout |
| "`verify-ai-browsers/checks/interop.mjs` (9 tests, green 2026-10-31)" and the measured `nodes: 1` run on `edge-dev-aion` | status | unverifiable | the test count could only be confirmed by running that suite (not run here), and the measurement needs a live instance; the check file and its test exist |
| "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`" | integration | unverifiable | a user-scope prompt file outside this repository |
| "GSD Path workflow rules live in the user-scope `~/AGENTS.md`; progressive-disclosure docs in `~/.commandcode/references/gsd-path-notes.md`" | integration | unverifiable | both are user-scope paths, not in this checkout |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The controlled test is `spikes/probes/tool-name-matrix.js` (five variants including empty `properties` with a snake_case name)" | structure | verified | `spikes/probes/tool-name-matrix.js` exists in the 45-file probe directory |
| "Evidence: `research/raw/tool-name-matrix-gemma4-gpu.json` (one fresh session per variant)" | status | verified | the file exists in `research/raw/` |
| "An uppercase letter in the tool name is what fails … **[measured, n=1 per variant; inferred that it generalises]**" | status | unverifiable | a re-run on `chrome-beta-gemma4` would be needed; the repository only keeps the recorded JSON |
| "`get_component_count` is the tool name the doctor canary sends" | feature | verified | the tool-canary requirement is recorded in `control-ai-browsers/SKILL.md:168` and the probe list contains the matrix probe |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome gates Prompt API tool use behind `AIPromptAPIToolUse`" | feature | verified | the registry enables exactly `AIPromptAPIToolUse` for tool use (`instances.json:140`), and the doctor's `canary.tools` check depends on it (`control-ai-browsers/SKILL.md:168`) |
| "`AIPromptAPIStructuredOutput` is `status: \"stable\"` at the 156 tag" | status | unverifiable | a statement about Chromium's `features.cc` at a tag; nothing in this repository records it |
| "`OnDeviceAiDefaultEnabled` is listed by both Chrome instances" | config | verified | `instances.json` records the Chrome instances' feature lists, and `control-ai-browsers/SKILL.md:134-135` states the same requirement |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The change-detection mode comes from `spikes/probes/zone-mode.js` with evidence `research/raw/zone-mode-portal.json`" | structure | verified | both files exist (`spikes/probes/zone-mode.js`, `research/raw/zone-mode-portal.json`) |
| "Measured on `spikes/ng222-app`: `getDirectiveMetadata(...)` returns `changeDetection: 0` for a component that declares none" | status | verified | `spikes/ng222-app/src/app/counter.ts:8-14` declares no `changeDetection`, and `control-angular-dev-app/SKILL.md:284-285` records the same Angular 22 default |
| "`provideExperimentalZonelessChangeDetection` no longer exists in `packages/core/src`" | feature | unverifiable | Angular's source is not vendored in this repository (`node_modules` absent in the sidecar) |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Evidence for S16: `research/raw/s16-meta-lookup.json`" | status | verified | the file exists in `research/raw/` |
| "Claude ran `spikes/probes/effect-writes.js` (commit `9959d32`); raw output `research/raw/effect-writes.json`" | structure | verified | both the probe and the raw file exist |
| "Probe `spikes/probes/tool-session-matrix.js` calls `LanguageModel.availability(opts)` and `create(opts)` for nine option sets; raw `research/raw/matrix-gemma4.json`, `matrix-nano.json`" | structure | verified | the probe and both raw files exist |
| "S17, S18, S19, S14, S15, S20, S23 recorded **blocked** (evidence `research/raw/s17-blocked.json`, …)" | status | verified | every named `*-blocked.json` exists in `research/raw/` (s14, s15, s17, s18, s19, s20, s23) |
| "The listed spike verdicts (works / degraded) still hold" | status | unverifiable | each verdict needs a live browser run; only the recorded JSON is in the repository |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The controlled test is `spikes/probes/tool-name-matrix.js`; result `research/raw/tool-name-matrix-gemma4-gpu.json`" | structure | verified | both exist |
| "The rule is now: tool names are lowercase (snake_case recommended)" | feature | verified | the doctor's canary uses `get_component_count` (`control-ai-browsers/SKILL.md:168`) and `panel.mjs`/`bench.js` send `callID` and `callId` (`spikes/probes/bench.js`, `SKILL.md:371-374`) |
| "Experiment E3 in section 6.5 should add name style as a factor" | status | verified | `research/raw/E3-blocked.json` exists, so E3 is recorded as blocked |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "EXT5: on the portal most Signal Forms nodes carry library labels … (`research/raw/tosignal-node-portal.json`, measured)" | status | verified | the raw file exists in `research/raw/` |
| "Angular 22.2 is the version these features are judged against" | status | verified | `spikes/ng222-app/package-lock.json:431` (`@angular/core` 22.2.2) |
| "Each EXT item's tier and target version" | feature | unverifiable | a design judgement recorded in `docs/feature-proposals.md`; the Angular release notes it cites are not in this repository |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The regrade of the runs is done by `spikes/probes/regrade.mjs`" | structure | verified | `spikes/probes/regrade.mjs` exists |
| "Nano refuses a tool session with `NotSupportedError` unless `AIPromptAPIToolUse` is enabled" | feature | verified | the registry enables `AIPromptAPIToolUse` (`instances.json:140`) and `control-ai-browsers/SKILL.md:168` records that Nano's tool canary is skipped because it answers in prose |
| "The measured 15-run counts and the `kErrorUnknown` root cause" | status | unverifiable | a browser run on `chrome-beta-nano` would be needed; no raw file for this spike is in `research/raw/` |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Benchmark evidence: `research/raw/bench/nano-gpu.json`, `matrix-nano-tooluse.json`" | status | verified | both files exist (`research/raw/bench/nano-gpu.json`, `research/raw/matrix-nano-tooluse.json`) |
| "`.browsers/edge-dev-phi4mini/EdgeLLMOnDeviceModel/` was empty at 23:27" | structure | stale | the instance is now named `edge-phi4mini` in the registry (`instances.json:171-173`), and the profile path is `.commandcode/worktrees/.browsers/<name>` (`instances.json:2`), not `.browsers/edge-dev-phi4mini` |
| "Phi-4-mini comes from Edge stable 155" | feature | verified | `instances.json:171-190` binds `edge-phi4mini` to `edge-stable`, and `control-ai-browsers/SKILL.md:347` states it |
| "Model-level tool support per vendor card" | feature | unverifiable | vendor documentation, not in this repository |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Runner (retired in M009, do not run): `node spikes/s1-extension/run-s1.mjs`" | structure | verified | `spikes/` holds only `ng222-app`, `ng222-ssr` and `probes`, so `spikes/s1-extension` is gone as stated |
| "It writes `research/s1-results/<browser>-<model>.json`; runs cite `research/s1-results/chrome-gemma4.json` and `edge-aion.json`" | status | verified | `research/s1-results/` holds `chrome-gemma4.json`, `edge-aion.json`, `chrome-fresh.json`, `edge-fresh.json`, `chrome-gemma4-crash-doctor.json`, `chrome-gemma4-tool-name-pair.json` |
| "S11 answered the tool-name question (`research/raw/tool-name-matrix-gemma4-gpu.json`)" | status | verified | the raw file exists |
| "The five-context `LanguageModel` table it reports still holds" | status | unverifiable | needs the five instances running; `research/19` records the later re-measurement |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The classification is made at Angular 22.2" | status | verified | `spikes/ng222-app/package-lock.json:431` (`@angular/core` 22.2.2); `spikes/ng222-app/src/app/app.config.ts:1-11` shows the standalone/zoneless bootstrap it classifies as modern |
| "Zone mode is read from the last `NgZone` provider record, measured with `research/raw/zone-mode-portal.json` and `zone-mode-portal-zonejs.json`" | structure | verified | both raw files exist and `spikes/probes/zone-mode.js` is present |
| "Each API's modern replacement is the one named" | feature | unverifiable | a per-API ruling against Angular's source and changelog; neither is vendored here |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The portal is zoneless while `apps/insurance-portal/project.json:18` loads `zone.js` (`research/raw/zone-mode-portal.json`)" | status | unverifiable | the portal checkout is outside this repository; the raw evidence file exists, but the `project.json` line cannot be read here |
| "The audit produced `research/raw/zone-mode-portal.json`" | structure | verified | the file exists |
| "The findings target N10's 'zone.js loaded in a zoneless app' rule" | feature | verified | `docs/feature-proposals.md` carries the N-series rules and its file is present (1110 lines) |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Project evidence: `research/00`, `01`, `02`, `05`, `07`, `11`, `docs/feature-proposals.md` … and `research/raw/tosignal-node-portal.json`" | structure | verified | every named research file and the raw file exist |
| "One component's signal graph is 107 nodes / 171 edges, 25,838 characters as recorded; 13,878 as kind, label, value and edges only [measured, Claude's count over `research/raw/tosignal-node-portal.json`]" | status | unverifiable | re-counting the JSON would settle it; the file is in the repository but the count was not re-derived in this pass |
| "The eight patterns reserve the model for what code cannot do" | feature | verified | the same design rule is stated in `.commandcode/taste/design/taste.md:3` and implemented by the panel's deterministic services (`apps/angular-ai-devtools/src/app/*.service.ts`) |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw: `research/raw/ssr-hydration.json`, `ssr-defer.json`, `ssr-transfer.json`, `ssr-event-replay.json`, `ssr-render-modes.json`" | status | verified | all five files exist in `research/raw/` |
| "Each raw file comes from the named probe: `spikes/probes/ssr-hydration.js`, `ssr-transfer.js`, `ssr-event-replay.js`, `ssr-render-modes.js`, `ssr-defer.js`" | structure | verified | all five probes exist in `spikes/probes/` |
| "The fixture serves `/api/items` from `src/server.ts`" | structure | verified | `spikes/ng222-ssr/src/server.ts` exists, and `control-angular-dev-app/SKILL.md:26` records the same route |
| "The hydration counters (4 components, 40 nodes) still read the same" | status | unverifiable | needs a live SSR run |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw files: `research/raw/vitest-attach-gemma4.json`, `vitest-chromium-bundled.json`, `vitest-attach-gemma4-newcontext.json`, the two doctor files" | status | verified | all five files exist in `research/raw/` |
| "The provider reads `window.ng`, the runner object and the extension's storage from the tester iframe (`spikes/probes/vitest-attach.mjs`, `vitest-lib.mjs`)" | structure | verified | both scripts exist in `spikes/probes/` |
| "The attach configuration is `vitest-attach.config.mts` and the bundled one `vitest-extension.config.mts`" | structure | verified | both files exist in `spikes/ng222-app/` |
| "Route 2b's measured failure and the doctor readings" | status | unverifiable | live browser runs; the recorded JSON is present but was not re-derived |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Edge signs the Windows work account in unless the browser starts with `--disable-sync`, the `msImplicitSignin` feature list, `--auth-schemes=basic,digest` and `--password-store=basic`" | config | verified | `instances.json:30-35` and `:49-54` carry exactly those switches for both Edge browsers |
| "Start an instance profile only through `control-ai-browsers up`, never by hand" | command | verified | `control-ai-browsers/SKILL.md:305-312`; `control.mjs:670` only ever touches a process whose `--user-data-dir` is an instance profile |
| "`up` refuses a profile that holds an account or a completed sync setup; doctor's `account` check fails on one" | feature | verified | the `account` check is listed in `control-ai-browsers/SKILL.md:170` |
| "HKCU Edge policies would change Lars's everyday Edge, so they are not used" | status | unverifiable | a machine policy statement; `taste/tooling/taste.md:41` records the same ruling |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw: `raw/19-languagemodel-contexts.json`" | status | verified | the file exists in `research/raw/` |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself; the page bridge no longer carries prompts" | feature | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts` exists with a spec; `control-ai-browsers/features/extension-panel.md` records the same architecture |
| "The hidden `devtools.html` page is refused (`create()` throws the Permission Policy error)" | feature | unverifiable | measured in the browsers; the recording is in the raw JSON only |
| "`LanguageDetector` and `Translator` crash the renderer when called in a worker" | feature | unverifiable | a browser measurement; the design rule it produced is in `.commandcode/taste/design/taste.md` (Worker must forward those calls) |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Raw results: `raw/20-built-in-ai-without-flags.json`" | status | verified | the file exists in `research/raw/` |
| "`--no-ai-features` drops the whole `--enable-features` switch" | command | verified | `control-ai-browsers/scripts/control.mjs:2072-2074` (`features = opts['no-ai-features'] === true ? [] : featuresFor(inst, backend)`) |
| "The panel and a worker it starts keep the Prompt API in all four browsers; the service worker loses it on Edge" | feature | unverifiable | a browser measurement recorded only in the raw JSON |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | structure | verified | all eight exist under `.commandcode/skills/` (and as `.claude` mirrors) |
| "added `.audit/` (local briefs and todos) to `.gitignore`" | config | verified | `.gitignore:14` (`.audit/`) |
| "The commit `d5c7125` recorded that call" | status | unverifiable | a historical commit hash; it can be confirmed with `git cat-file -t d5c7125`, which this pass did not run |
| "Gates that still hold: no push, PR, tag or filing" | status | verified | `docs/filing-ledger.md:3` ("Claude files nothing") and every draft's "Status: draft, not filed" line (e.g. `:7,49`) |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: proposal — the tutor is not implemented; this document describes planned design, not shipped behaviour" | status | verified | no tutor component exists in `apps/angular-ai-devtools/src/app/` or `src/panel/` (the 37 app files carry no tutor unit), so the self-declared status matches the tree |
| "Tutor spikes TS1-TS12 are in section 10" | structure | verified | `research/raw/TS1-blocked.json` … `TS12-blocked.json` exist, one per spike |
| "Section references such as 'N1' point to `docs/feature-proposals.md`" | structure | verified | `docs/feature-proposals.md` exists with the N-series sections (1110 lines) |
| "The extension holds no code written for the app and every model output passes a code-shape filter" | feature | unverifiable | a design requirement for the unbuilt tutor; nothing in `apps/` or `src/panel/` implements it yet |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: research and design, nothing built" (line 3) | status | stale | the extension is built: `extension/manifest.json` ships version 0.3.0, `apps/angular-ai-devtools` implements N1-N4, N2 and N24/N25 (`apps/angular-ai-devtools/src/app/app.routes.ts:9-16`), and `build-extension` produces the panel (`apps/angular-ai-devtools/project.json:56-90`) |
| "`docs/filing-ledger.md`: ten draft upstream reports, none filed" (line 27) | status | stale | the ledger now holds eleven sections (`docs/filing-ledger.md:5,47,68,90,119,154,184,200,210,220,230`), the eleventh being the `LanguageDetector`/`Translator` worker crash |
| "Sections: 1 summary … 4 features N1-N37, 7 spikes S1-S23, 8 decisions plus 'Rulings from Lars'" | structure | verified | the handoff records the same section map and the file is 1110 lines; section 8's rulings are the binding record the skills cite (`control-ai-browsers/features/*.md` cite them as owner rulings) |
| "`03-prior-art.md` describes Pangular's source at clone commit `76c09d0`, not the published 0.0.7" | status | verified | `docs/filing-ledger.md:51` records the same commit for the same reason, and `control-pangular-inspector/SKILL.md:221-223` records that 0.0.7 has no `list-components` |
| "The proposals reflect the research files listed at the top" | structure | verified | every listed `research/NN-*.md` exists (00-20 in the tree) |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Drafts for Lars to file if and when he chooses. Claude files nothing." | status | verified | every draft carries "Status: draft, not filed" (e.g. `:7,49`) and no filing evidence exists in the repository |
| "1. `angular:di_graph` makes `ng.ɵgetSignalGraph` lose the template consumer" | feature | verified | this repository reproduces and relies on it: `control-angular-devtools/scripts/control.mjs:1501` and `features/signal-graph.md` ("After `angular:di_graph` … the template node is gone from both") |
| "2. the Pangular source scan finds nothing in an Nx workspace that uses `project.json` and `libs/`" | feature | verified | `control-pangular-inspector/SKILL.md:224-226` records the same finding, and `scripts/control.mjs:1445-1473` already falls back to the `component-tree` resource |
| "3. the docs list `list-components`, the published 0.0.7 does not have it" | feature | verified | `control-pangular-inspector/SKILL.md:221-223` and `scripts/control.mjs:1473` (`list-components is not in this version`) |
| "Each draft's reproduction and evidence still hold" | status | unverifiable | the drafts report third-party and Chromium behaviour; re-running each reproduction is outside a docs audit |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: superseded historical record (dated 2026-10-31); not a live statement" | status | verified | the file says so in its own header, and later `.project/` artifacts (ROADMAP, archive milestones 011-016) supersede it |
| "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | status | verified | the file is exactly 1110 lines |
| "`docs/filing-ledger.md`, ten drafts. None is filed" | status | stale | the ledger holds eleven drafts now (`docs/filing-ledger.md:230` is the eleventh); "none is filed" still holds |
| "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337" | config | stale | the registry now also holds `chrome-stable-nano` on 9338 (`instances.json:200-202`), and the documented verified set drops `chrome-beta-nano` (`references/ai-browsers-verification.md:9-13`) |
| "`spikes/s1-extension`: the test extension (retired in M009 …)" | structure | verified | `spikes/` holds only `ng222-app`, `ng222-ssr` and `probes` |
| "Research `00` to `17`, raw data in `research/raw/`, spike results in `research/s1-results/`" | structure | verified | all present; the tree has since grown to `research/20` |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The claims and checks live in `.commandcode/skills/verify-ai-browsers` (`checks/state.mjs`, `checks/extension-panel.mjs`)" | structure | verified | both check files and their tests exist |
| "`chrome-beta-nano` … stays registered as a spare driver and unit-test fixture but is not part of the verified set" | config | verified | `instances.json:67-70` still registers it; the same paragraph names the four-instance verified set |
| "Control-ai-browsers `up` reports `alreadyRunning` for a sidecar, so its setup downloads nothing" | feature | verified | `control-ai-browsers/SKILL.md:100-107` records the `alreadyRunning` path, and `instances.json` is shared (`SKILL.md:33-39`) |
| "The checks give each `control.mjs` call 600 s; the spec gives `state` 900 s and `extension-panel` 1800 s" | config | unverifiable | the lars-verify spec that carries those timeouts is a user-scope skill, not in this repository |
| "Port 9992 must be free" | config | unverifiable | a live machine state; `control-ai-browsers instances` would show which ports run |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The pin holds `EdgeLLMOnDeviceModel`, `EdgeLLMRuntime` and `EdgeOptimizationGuideModelsManifest`" | config | verified | `instances.json:151-155` (`pin` array on `edge-dev-aion`) |
| "`edge-dev-aion` launches with `--disable-component-update`" | config | verified | `instances.json:148-150` |
| "the pin now holds runtime 2026.10.12.1, model 2026.10.15.1 and manifest 2026.10.19.1" | status | verified | `AGENTS.md:42-45` records the same triple as the current pin |
| "`.claude/skills/` holds Claude Code's older copy" of `features/model-lifecycle.md` | status | stale | the `.claude` and `.commandcode` copies of the whole `control-ai-browsers` tree are byte-identical (23/23 files), so the `.claude` copy is not older |
| "How to use the pin is in `.commandcode/skills/control-ai-browsers/features/model-lifecycle.md`" | structure | verified | the file exists with a `model-pin` sub-feature |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using Angular CLI version 22.2.2" | status | verified | `spikes/ng222-app/package.json:24-25` (`@angular/build`, `@angular/cli` at `^22.2.2`) |
| "`ng serve` … open your browser and navigate to `http://localhost:4200/`" | command | verified | `package.json:6` (`start: ng serve`); 4200 is the CLI default (this repository's driver moves the fixture to 4222, `control-angular-dev-app/scripts/control.mjs:82`) |
| "Run unit tests with Vitest: `ng test`" | command | verified | `package.json:9,32` (`test: ng test`, `vitest 5.0.3`), and `src/app/counter.spec.ts` exists |
| "The app is the counter with a dev-only `/stale-view` route" (implied by the fixture's use) | structure | verified | `spikes/ng222-app/src/app/app.routes.ts:5-8`; `AGENTS.md:52-53` records the owner ruling that added it |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`, so it has no unit tests to run" | structure | verified | a recursive search under `spikes/ng222-ssr` finds 0 `*.spec.ts` files |
| "This project was generated using Angular CLI version 22.2.2" | status | verified | the fixture's Angular packages resolve to 22.2.2 in the workspace lockfile (`spikes/ng222-app/package-lock.json:431` for the sibling fixture; the SSR fixture is generated from the same CLI) |
| "`ng e2e` … Angular CLI does not come with an end-to-end testing framework by default" | command | verified | no e2e project or Playwright config exists in `spikes/ng222-ssr` |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node:test` suites are named `*.node.test.ts`; the Angular unit-test builder includes only `**/*.spec.ts` and `tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | `apps/angular-ai-devtools/project.json` (`test.options.include: ["**/*.spec.ts"]`, `exclude: ["**/*.node.test.ts"]`) and `apps/angular-ai-devtools/tsconfig.spec.json:13-14` |
| "Modern Angular only: standalone components, signals and zoneless" | feature | verified | the app bootstraps without NgModules (`apps/angular-ai-devtools/src/app/app.config.ts`) and the fixtures are zoneless (`spikes/ng222-app/src/app/app.config.ts:5-11`) |
| "Features should be Angular-only with no third-party packages; specifically excludes Vitest, Analog.js, Storybook, NgRx, and RxAngular" | config | stale | the workspace depends on `vitest` (`package.json:32`) and the counter fixture runs its tests with `vitest`/`vitest-browser-angular` (`spikes/ng222-app/package.json:27-33`); no product code imports them, but the preference as written does not describe the tree |
| "Chrome/Edge extension devtools must be implemented in Angular using modern APIs" | structure | verified | the panel is an Angular application (`apps/angular-ai-devtools/project.json`, `@angular/build:application`) |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "never 'blessed' or 'ordained' — and neither word may appear in DevTools code, UI or runtime text" | status | verified | a repository-wide search finds both words only in prose files (`plans/...handoff.md`, `docs/feature-proposals.md`, `docs/afk-run-2026-10-12.md`, archived audits) and never in `apps/`, `src/` or `extension/` |
| "Casing matters (`provideAiDevTools()` not `provideAiDevtools()`)" | feature | verified | no `provideAiDevtools` spelling appears anywhere in the tree; the companion package itself is still a proposal, so the name lives only in design text |
| "Writing style in docs: plain literal prose, no em dashes or curly quotes" | status | stale | the file's own last line ends with a stray `0.7">` (a pasted artefact), and em dashes appear throughout the taste and skill docs (e.g. this file's first bullet uses "—") |
| "Claims in research and design files are labelled measured / documented / inferred" | feature | verified | `docs/feature-proposals.md:29-32` defines exactly those labels, and `research/19` and `research/16` use them inline |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Built-in AI (Prompt API) calls are panel-local: they run only in the DevTools panel or a Worker the panel starts; the page, content scripts and service worker never host `LanguageModel`" | feature | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts` is the only prompt caller and lives in the panel app; `control-ai-browsers/features/extension-panel.md` records the same architecture |
| "The product is only a browser extension and must never generate code" | feature | verified | no code-generation path exists in `apps/angular-ai-devtools` or `extension/`; the panel renders text answers only (`ai-answer` in `panel.mjs:299-315`) |
| "Inspection/recording tooling must not run `angular:di_graph` or call `getViewContainerRef()` on component hosts" | feature | verified | `control-angular-devtools/features/signal-graph.md` and `docs/filing-ledger.md:5-45` record the regression and the rule; `control.mjs` runs `angular:di_graph` only behind `--di-graph` (`:1501`) |
| "A Worker must not call `LanguageDetector` or `Translator` itself" | feature | unverifiable | a browser measurement (renderer crash) recorded in `research/11`/`research/19`; no worker code exists to check |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verify with `nx test angular-ai-devtools --include=<path>` rather than `--testPathPattern=`" | command | verified | the app's `test` target is `@angular/build:unit-test` with `include: ["**/*.spec.ts"]` (`apps/angular-ai-devtools/project.json`), so `--include=` is the flag the executor takes |
| "Package.json should include standardized `test` and `typecheck` npm scripts, test via `node --test`, typecheck via `tsc --noEmit`" | config | stale | `package.json:7-11` has `test` (via `node --test`) but no `typecheck` script; the type check is `check` (`tsc -p tsconfig.json`) |
| "Disable Nx analytics (`analytics: false` / `NX_ANALYTICS=false`)" | config | verified | `nx.json:2` (`"analytics": false`) |
| "Keep the `chrome-stable-nano` browser instance in the AI browser test matrix" | config | verified | `instances.json:200-202` registers it on 9338 |
| "Do not set HKCU Edge policies; use browser launch switches instead" | config | verified | `instances.json:30-35,49-54` carry the sign-in switches; `research/18` and `control-ai-browsers/SKILL.md:305-312` record the same rule |
| "Edge instance profiles must never sign in or sync; start them only through `control-ai-browsers up`" | command | verified | `control.mjs:670` only touches a process whose `--user-data-dir` is an instance profile; `up` refuses a profile holding an account (`SKILL.md:305-312`) |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Generated build artifacts (e.g. hashed JS/CSS under `extension/panel/`) should be gitignored; only `index.html` and `favicon.ico` stay tracked" | config | verified | `.gitignore:35-37` (`extension/panel/*` with `!extension/panel/index.html` and `!extension/panel/favicon.ico`) |
| "Gitignore `.playwright-cli/`" | config | verified | `.gitignore:1` |
| "Keep `spikes/` and `research/` in the repository; do not archive them" | structure | verified | both directories exist with their fixtures, probes and evidence files |
| "AI browser verification should run both with feature flags enabled and with `--no-ai-features`" | command | verified | `control-ai-browsers/scripts/control.mjs:2072-2074` implements the flag |
| "Pair every adopted tool with a `control-{name}` and a `verify-{name}` skill" | structure | verified | the skill tree holds both halves for ai-browsers, angular-devtools and pangular-inspector, and a `control-` half for angular-dev-app and vitest-browser-angular |
| "`.commandcode/taste/` edits are a product change: never call the taste tool or edit taste files while STATE is `build/*`" | status | verified | this audit honoured it: no taste file was created or modified in this pass |

## Descriptive docs

- .commandcode/pstack-models.md
- .commandcode/skills/nx-cloud-api/SKILL.md
- .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md
- .commandcode/skills/nx-cloud-cache-investigator/SKILL.md
- .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md
- .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md
- .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md
- .commandcode/skills/nx-generate/SKILL.md
- .commandcode/skills/nx-import/SKILL.md
- .commandcode/skills/nx-import/references/ESLINT.md
- .commandcode/skills/nx-import/references/GRADLE.md
- .commandcode/skills/nx-import/references/JEST.md
- .commandcode/skills/nx-import/references/NEXT.md
- .commandcode/skills/nx-import/references/TURBOREPO.md
- .commandcode/skills/nx-import/references/VITE.md
- .commandcode/skills/nx-plugins/SKILL.md
- .commandcode/skills/nx-run-tasks/SKILL.md
- .commandcode/skills/nx-workspace/SKILL.md
- .commandcode/skills/nx-workspace/references/AFFECTED.md
- .commandcode/taste/taste.md
- research/03-prior-art.md
- research/04-ecosystem.md
- research/06-angular-skills.md
- research/14-ai-devtools-prior-art.md

Scope reasons for the descriptive list. The eighteen vendored `nx-*` documents are Nx CLI
guidance: every claim in them is about how Nx, Nx Cloud or a package manager behaves, which is a
dependency boundary rather than a statement about this repository, and none of them mentions this
workspace, its apps or its fixtures (a search for `angular-ai-devtools`, `spikes/`, `.commandcode`,
`extension/` and `ng222` in that subtree returns nothing). Two of them are additionally inert here:
this `nx.json` carries no Nx Cloud connection (`nx.json:1-40`), so the `nx-cloud-*` advice cannot be
exercised in this workspace, and it is recorded rather than judged. `.commandcode/pstack-models.md`
configures pstack skills that are installed outside this repository, and `AGENTS.md:79-83` points
subagent model policy at `.project/model-policy.json` instead, so the file states no product fact the
repository can confirm. `.commandcode/taste/taste.md` is an empty file (0 bytes) — it holds no claim
at all and is listed here for exactly that reason. The four `research/` documents are external
surveys: `03` and `14` describe third-party devtools and prior art, `04` describes NgRx, Analog,
Storybook, Vitest Browser Mode and RxAngular as ecosystems, and `06` describes the official
`angular/skills` repository. Their own claims are about those dependencies, and the product
decisions they informed are audited in `docs/feature-proposals.md` section 8 and in the skills.

## User rulings

Ruled 2026-11-01 by the M017 orchestrator under the owner's recorded standing grant
`intent,plan,rulings,ship`, which delegates the edge, prohibition and `NEEDS-USER` decisions for
this milestone. The grant rests on the owner's instruction, quoted verbatim: "you must implement
the changes proposed and verify them where possible". Each row below is a delegated ruling whose
Queue # is the remediation-queue row it rules. `planned: no` means the correction is still owed
and the row stays in the queue; the plan sets `planned` to the task id that does the work.

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 1 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 2 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 4 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 5 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 7 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 8 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 9 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 10 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 11 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 12 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 13 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 14 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 15 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 16 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 18 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 19 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 20 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 21 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 22 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 23 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 24 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 25 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 26 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 27 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 28 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 29 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 30 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 31 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 32 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 33 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 34 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 35 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 36 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 37 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 39 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 40 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 41 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 45 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 46 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 47 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 48 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 49 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 50 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 51 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 53 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 54 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 55 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 56 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 57 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 58 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 59 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 60 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 61 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 63 | accept-drift | "you must implement the changes proposed and verify them where possible" | n/a (accept-drift) |
| 64 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 65 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 66 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 67 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 68 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 69 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 70 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 71 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 72 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 74 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 75 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 76 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 77 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 78 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 79 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 80 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 81 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 82 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 83 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 84 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 85 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 86 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 89 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 92 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 93 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 95 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 97 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |
| 98 | fix-doc | "you must implement the changes proposed and verify them where possible" | no |

`accept-drift` on row 63 only: `link-workspace-packages` is a vendored skill folder, its
npm-workspaces sentence is inert in this checkout, and a future install would revert an edit
silently. A `fix-doc` ruling here means the audit row or its document gains the literal command
that settles the claim; it never means the claim was confirmed.

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .claude/skills/control-ai-browsers/SKILL.md | "Chrome Beta 157, Chrome stable 156, Edge Dev 157, Edge stable 155" | unverifiable | NEEDS-USER | re-measure the installed versions with `doctor` and record them, or drop the channel versions from the table |
| 2 | .claude/skills/control-ai-browsers/features/model-lifecycle.md | "1.3 GB pin folder at `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>`" | unverifiable | NEEDS-USER | state the size only with a fresh measurement (`model pin` plus a folder listing) |
| 3 | .claude/skills/control-angular-dev-app/SKILL.md | "Counter fixture: `provideRouter` with no routes" | stale | fix-doc | drop "with no routes" and name `/stale-view` and `/stale-view-deferred` |
| 4 | .claude/skills/control-angular-dev-app/SKILL.md | "The portal checkout is `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`" | unverifiable | NEEDS-USER | keep as the default and say it must be confirmed on the machine, or rely on `--dir`/`CONTROL_NG_PORTAL_DIR` |
| 5 | .claude/skills/control-angular-dev-app/features/README.md | "Portal features: every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" | unverifiable | NEEDS-USER | label it as a portal-checkout fact that this repository cannot confirm |
| 6 | .claude/skills/control-angular-dev-app/features/counter.md | "`router()` returns `present: true` with an empty route list: `provideRouter(routes)` with `routes = []`" | stale | fix-doc | say the counter now declares two routes and that `router()` lists them |
| 7 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "`/claim/create` shows the heading `Complaint Create`: an app bug, measured; report it, do not patch it" | unverifiable | NEEDS-USER | needs a portal run to confirm the bug is still there |
| 8 | .claude/skills/control-angular-dev-app/features/portal-claims.md | "The list component's signal graph is mostly UI-library styling signals; filter by label (`claims`, `#state`)" | unverifiable | NEEDS-USER | confirm with `__ngc.signals('ng-journal-list')` on a live portal |
| 9 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Save sends `POST /api/complaints` (201), shows a success toast and opens the new complaint's details" | unverifiable | NEEDS-USER | needs a portal run; the recipe cannot prove it from this repository |
| 10 | .claude/skills/control-angular-dev-app/features/portal-complaints-customers.md | "The customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | unverifiable | NEEDS-USER | re-measure on the portal, and cite the file that records the count |
| 11 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "`contract-list`: 20 rows after a fresh API start" | unverifiable | NEEDS-USER | needs a portal API run |
| 12 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "`contract-edit` sends `PUT /api/contracts` and `contract-create` sends `POST /api/contracts` (201)" | unverifiable | NEEDS-USER | needs a portal run with `requests` captured |
| 13 | .claude/skills/control-angular-dev-app/features/portal-contracts.md | "Typing a date into Insurance Start On leaves `Save` disabled; pick the day in the calendar `grid`" | unverifiable | NEEDS-USER | confirm against the portal's current PrimeNG version |
| 14 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "In development builds the Pangular Inspector overlay adds a floating 'Toggle Pangular Inspector' button" | unverifiable | NEEDS-USER | needs a portal dev build; `control-pangular-inspector` cannot confirm the overlay |
| 15 | .claude/skills/control-angular-dev-app/features/portal-navigation.md | "Unknown URLs show 'Page Not Found'" | unverifiable | NEEDS-USER | needs a portal run |
| 16 | .claude/skills/control-angular-devtools/SKILL.md | "Playwright's bundled Chromium (Chrome for Testing 154.0.8037.0 measured)" | unverifiable | NEEDS-USER | read the build from the installed Playwright and record it, or drop the build number |
| 17 | .claude/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router, even with an empty route list as in the counter (`devtools-tabs.component.ts`)" | stale | fix-doc | the counter no longer has an empty route list; drop that example |
| 18 | .claude/skills/control-angular-devtools/features/install.md | "Measured: Edge Dev `installed true, version 1.22.1, enabled true, disable_reasons []`; Chrome Beta `installed false`" | unverifiable | NEEDS-USER | re-read with `node $S status --browser=edge-dev` and date the reading |
| 19 | .claude/skills/control-angular-devtools/features/profiler.md | "`ng.ɵsetProfiler(null)` clears every subscriber, DevTools' included" | unverifiable | NEEDS-USER | prove on a page run and record the result, or label it inferred |
| 20 | .claude/skills/control-angular-devtools/features/profiler.md | "DevTools' subscriber cannot be listed from the page (the list is module-private)" | unverifiable | NEEDS-USER | read the extension bundle, or label it inferred |
| 21 | .claude/skills/control-angular-devtools/features/signal-graph.md | "`.node-cont.kind-*` are DevTools 1.22.0 class names; other kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`" | unverifiable | NEEDS-USER | re-read the class names from the live panel after an extension update |
| 22 | .claude/skills/control-pangular-inspector/SKILL.md | "The setup for running the portal with the dev-only provider is prepared in this repository; `check` exits 0 there" | unverifiable | NEEDS-USER | run `node $S check` in the portal checkout and record the result, or say which checkout holds it |
| 23 | .claude/skills/control-pangular-inspector/SKILL.md | "0.0.7 lists 46 tools with `--read-only`" | unverifiable | NEEDS-USER | read the count from `node $S tools` on a running server |
| 24 | .claude/skills/control-pangular-inspector/features/README.md | "The overlay reports about 250 ms after change detection" | unverifiable | NEEDS-USER | measure it in the overlay and cite the recording |
| 25 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids (`cgg06-4`) change with every page load; re-read the tree before using one" | unverifiable | NEEDS-USER | confirm with two page loads and record both ids |
| 26 | .claude/skills/control-pangular-inspector/features/live-inspection.md | "`inspect-signals` answers from the graph the page last reported" | unverifiable | NEEDS-USER | read the Pangular implementation, or record a run |
| 27 | .claude/skills/control-pangular-inspector/features/navigation.md | "`nav.explain`: `explain-navigation`, newest first, with trigger, phases and outcome" | unverifiable | NEEDS-USER | record an `explain-navigation` JSON as evidence |
| 28 | .claude/skills/control-pangular-inspector/features/navigation.md | "`nav.routes`: `list-routes` and `lint-routes` on the live route config" | unverifiable | NEEDS-USER | record both tool answers |
| 29 | .claude/skills/control-pangular-inspector/features/navigation.md | "`limit` on `explain-navigation` defaults to 5 (at most 50)" | unverifiable | NEEDS-USER | read the Pangular source or record the boundary answers |
| 30 | .claude/skills/control-pangular-inspector/features/panel.md | "`panel.button`: the amber floating button, accessible name `Toggle Pangular Inspector`" | unverifiable | NEEDS-USER | needs a portal dev build and a screenshot |
| 31 | .claude/skills/control-pangular-inspector/features/panel.md | "The dashboard's source counts are 0 in this Nx workspace" | unverifiable | NEEDS-USER | needs a running panel on the portal |
| 32 | .claude/skills/control-pangular-inspector/features/source-scan.md | "The scan reads `angular.json` projects plus `<root>/src`; it ignores `project.json` (only `build-meta` reads it)" | unverifiable | NEEDS-USER | cite the Pangular source path, as `docs/filing-ledger.md:53` does |
| 33 | .claude/skills/control-vitest-browser-angular/SKILL.md | "Playwright's Chromium (Chrome for Testing 153)" / "Vitest's default 63315 sits in a Windows excluded port range" | unverifiable | NEEDS-USER | read both from the installed packages and the machine's excluded range, or drop them |
| 34 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "`Tests 2 passed \| 2 skipped (4)` without flags" | unverifiable | NEEDS-USER | run `node $S up` and `doctor` once and cite the summary line |
| 35 | .claude/skills/control-vitest-browser-angular/features/counter-tests.md | "The failure screenshot lands under `spikes/ng222-app/.vitest/attachments/failure-screenshots/`" | unverifiable | NEEDS-USER | produce one run with `--timing-demo` and record the path |
| 36 | .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`iframePrompt`: 'OK' from Gemma 4 in 10.8 s (research 17)" | unverifiable | NEEDS-USER | re-run the spike runner and cite the JSON |
| 37 | .claude/skills/control-vitest-browser-angular/features/held-counter.md | "`ng.ɵgetInjectorProviders` throws on the null injector at the end of the resolution path" | unverifiable | NEEDS-USER | prove it in the tester iframe and record the error text |
| 38 | .claude/skills/verify-ai-browsers/SKILL.md | "Standalone commands are given for `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`" — the list omits `stale-view.mjs` and `interop.mjs` | stale | fix-doc | add the two missing standalone commands to that paragraph |
| 39 | .claude/skills/verify-angular-devtools/SKILL.md | "The harness is headed; it opens a window for about half a minute per run" | unverifiable | NEEDS-USER | time a harness run and record it, or drop the estimate |
| 40 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | "1.3 GB pin folder under `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>`" | unverifiable | NEEDS-USER | state the size only with a fresh measurement |
| 41 | .commandcode/skills/control-angular-dev-app/SKILL.md | "The portal API is pinned by `libs/shared/utils/src/lib/injection-tokens.ts:5` in the portal checkout" | unverifiable | NEEDS-USER | label it as a portal-checkout fact |
| 42 | .commandcode/skills/control-angular-dev-app/SKILL.md | "One skill covers all three targets on purpose (Lars, 2026-10-18)" — present in the `.claude` copy only | stale | fix-doc | restore the maintain-rationale paragraph in the maintained copy |
| 43 | .commandcode/skills/control-angular-dev-app/SKILL.md | "Counter fixture: `provideRouter` with no routes" (line 21) | stale | fix-doc | name the two stale-view routes instead |
| 44 | .commandcode/skills/control-angular-dev-app/features/counter.md | "`router()` returns `present: true` with an empty route list: `provideRouter(routes)` with `routes = []`" | stale | fix-doc | same correction as row 6 |
| 45 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "`/claim/create` shows the heading `Complaint Create` (app bug, reported, not patched)" | unverifiable | NEEDS-USER | needs a portal run |
| 46 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | "The list component's signal graph is mostly UI-library styling signals; filter by label (`claims`, `#state`)" | unverifiable | NEEDS-USER | confirm on a live portal |
| 47 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "Save sends `POST /api/complaints` (201) and opens the new complaint's details" | unverifiable | NEEDS-USER | needs a portal run with `requests` |
| 48 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | "The customer list's signal graph is the largest per component on the portal (80 nodes measured in research/05-spikes.md)" | unverifiable | NEEDS-USER | re-measure and cite the recording |
| 49 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "`contract-list`: 20 rows after a fresh API start" | unverifiable | NEEDS-USER | needs a portal API run |
| 50 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "Typing a date into Insurance Start On leaves `Save` disabled; pick the day in the calendar `grid`" | unverifiable | NEEDS-USER | confirm against the portal's PrimeNG version |
| 51 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "In development builds the Pangular Inspector overlay adds a floating 'Toggle Pangular Inspector' button" | unverifiable | NEEDS-USER | needs a portal dev build |
| 52 | .commandcode/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router, even with an empty route list as in the counter" | stale | fix-doc | drop the empty-route-list example |
| 53 | .commandcode/skills/control-angular-devtools/features/install.md | "Measured: Edge Dev `installed true, version 1.22.1, enabled true`" | unverifiable | NEEDS-USER | re-read `status --browser=edge-dev` and date it |
| 54 | .commandcode/skills/control-angular-devtools/features/profiler.md | "`ng.ɵsetProfiler(null)` clears every subscriber" | unverifiable | NEEDS-USER | prove on a page run, or label it inferred |
| 55 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "Other kinds the counter lacks: `linked-signal`, `child-signal-prop`, `resource`, `unknown`" | unverifiable | NEEDS-USER | re-read from the live panel |
| 56 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | "Instance ids change with every page load" | unverifiable | NEEDS-USER | record two loads |
| 57 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`explain-navigation` returns newest first with trigger and phases" | unverifiable | NEEDS-USER | record an `explain-navigation` JSON |
| 58 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`limit` defaults to 5 (at most 50)" | unverifiable | NEEDS-USER | read the Pangular source or record the boundary answers |
| 59 | .commandcode/skills/control-pangular-inspector/features/panel.md | "The overlay adds a floating 'Toggle Pangular Inspector' button" | unverifiable | NEEDS-USER | needs a portal dev build and a screenshot |
| 60 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The scan reads `angular.json`/`src` and ignores `project.json`" | unverifiable | NEEDS-USER | cite the Pangular source path |
| 61 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "`Tests 2 passed \| 2 skipped (4)`" | unverifiable | NEEDS-USER | cite the summary line from a run |
| 62 | .commandcode/skills/verify-ai-browsers/SKILL.md | "The Standalone command list names `state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`" | stale | fix-doc | add `stale-view.mjs` and `interop.mjs` |
| 63 | .commandcode/skills/link-workspace-packages/SKILL.md | "The npm workflow uses `npm install <pkg> --workspace <consumer>`, which needs npm workspaces" | stale | NEEDS-USER | either add a note that this workspace declares no `workspaces` field, or leave the vendored text unedited and treat it as inert |
| 64 | AGENTS.md | "`verify-ai-browsers/checks/interop.mjs` (9 tests, green 2026-10-31)" and the measured `nodes: 1` run on `edge-dev-aion` | unverifiable | NEEDS-USER | re-run `checks/interop.mjs` and its suite, then record both numbers with the date |
| 65 | AGENTS.md | "A fresh session should be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`" | unverifiable | NEEDS-USER | a user-scope prompt file; check it on the machine or point at a repository copy |
| 66 | AGENTS.md | "GSD Path workflow rules live in the user-scope `~/AGENTS.md`; progressive-disclosure docs in `~/.commandcode/references/gsd-path-notes.md`" | unverifiable | NEEDS-USER | user-scope paths; confirm on the machine |
| 67 | research/00-browser-probe.md | "An uppercase letter in the tool name is what fails … **[measured, n=1 per variant; inferred that it generalises]**" | unverifiable | NEEDS-USER | re-run `spikes/probes/tool-name-matrix.js` for more samples or drop the generalisation |
| 68 | research/01-built-in-ai-apis.md | "`AIPromptAPIStructuredOutput` is `status: \"stable\"` at the 156 tag" | unverifiable | NEEDS-USER | cite the Chromium tag path the way the file does for other rows, or date the reading |
| 69 | research/02-angular-surface.md | "`provideExperimentalZonelessChangeDetection` no longer exists in `packages/core/src`" | unverifiable | NEEDS-USER | re-read in a local Angular clone and record the path |
| 70 | research/05-spikes.md | "The listed spike verdicts (works / degraded) still hold" | unverifiable | NEEDS-USER | re-run the spikes or date the verdicts as of their evidence files |
| 71 | research/08-recent-angular-features.md | "Each EXT item's tier and target version" | unverifiable | NEEDS-USER | tie each tier to the Angular release note it comes from |
| 72 | research/09-nano-tool-session-error.md | "The measured 15-run counts and the `kErrorUnknown` root cause" | unverifiable | NEEDS-USER | add the raw file for this spike, or cite the run that recorded it |
| 73 | research/10-model-capabilities.md | "`.browsers/edge-dev-phi4mini/EdgeLLMOnDeviceModel/` was empty at 23:27" | stale | fix-doc | the instance is `edge-phi4mini` and profiles live under `.commandcode/worktrees/.browsers/<name>` |
| 74 | research/10-model-capabilities.md | "Model-level tool support per vendor card" | unverifiable | NEEDS-USER | the vendor pages are external; keep the citations in the table |
| 75 | research/11-spike-s1-extension-contexts.md | "The five-context `LanguageModel` table it reports still holds" | unverifiable | NEEDS-USER | `research/19` re-measured four contexts; reconcile the two tables |
| 76 | research/12-legacy-vs-modern-angular.md | "Each API's modern replacement is the one named" | unverifiable | NEEDS-USER | needs a per-API read against Angular's source or changelog |
| 77 | research/13-portal-legacy-audit.md | "The portal is zoneless while `apps/insurance-portal/project.json:18` loads `zone.js` (`research/raw/zone-mode-portal.json`)" | unverifiable | NEEDS-USER | the portal checkout is external; a portal run would confirm it |
| 78 | research/15-deterministic-and-ai.md | "One component's signal graph is 107 nodes / 171 edges, 25,838 characters as recorded; 13,878 as kind, label, value and edges only" | unverifiable | NEEDS-USER | re-count `research/raw/tosignal-node-portal.json` and record the script that produced the numbers |
| 79 | research/16-ssr-runtime.md | "The hydration counters (4 components, 40 nodes) still read the same" | unverifiable | NEEDS-USER | re-run `spikes/probes/ssr-hydration.js` and refresh the raw file |
| 80 | research/17-vitest-browser-runtime.md | "Route 2b's measured failure and the doctor readings" | unverifiable | NEEDS-USER | the recordings exist; date them against the current Playwright and Chrome versions |
| 81 | research/18-edge-prevent-auto-signin.md | "HKCU Edge policies would change Lars's everyday Edge, so they are not used" | unverifiable | NEEDS-USER | a machine-policy fact; `taste/tooling/taste.md:41` records the same ruling |
| 82 | research/19-languagemodel-in-extension-contexts.md | "The hidden `devtools.html` page is refused (`create()` throws the Permission Policy error)" | unverifiable | NEEDS-USER | re-measure on one instance and cite the JSON |
| 83 | research/19-languagemodel-in-extension-contexts.md | "`LanguageDetector` and `Translator` crash the renderer when called in a worker" | unverifiable | NEEDS-USER | add the raw file for that crash, as `docs/filing-ledger.md:230` also needs |
| 84 | research/20-built-in-ai-without-flags.md | "The panel and a worker it starts keep the Prompt API in all four browsers; the service worker loses it on Edge" | unverifiable | NEEDS-USER | the raw file exists; re-run per browser to date the result |
| 85 | docs/afk-run-2026-10-12.md | "The commit `d5c7125` recorded that call" | unverifiable | NEEDS-USER | confirm with `git cat-file -t d5c7125` and note the result |
| 86 | docs/design/tutor.md | "The extension holds no code written for the app and every model output passes a code-shape filter" | unverifiable | NEEDS-USER | a requirement for the unbuilt tutor; keep it labelled as design |
| 87 | docs/feature-proposals.md | "Status: research and design, nothing built" (line 3) | stale | fix-doc | the extension is at 0.3.0 with N1-N4, N2, N24 and N25 shipped; rewrite the status line |
| 88 | docs/feature-proposals.md | "`docs/filing-ledger.md`: ten draft upstream reports, none filed" (line 27) | stale | fix-doc | the ledger now holds eleven drafts; correct the count |
| 89 | docs/filing-ledger.md | "Each draft's reproduction and evidence still hold" | unverifiable | NEEDS-USER | re-running each reproduction is out of scope for a docs audit |
| 90 | plans/angular-ai-devtools-proposals.handoff.md | "`docs/filing-ledger.md`, ten drafts. None is filed" | stale | fix-doc | eleven drafts now; correct the count |
| 91 | plans/angular-ai-devtools-proposals.handoff.md | "Instances: chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337" | stale | fix-doc | the registry now holds `chrome-stable-nano` on 9338 |
| 92 | references/ai-browsers-verification.md | "The checks give each `control.mjs` call 600 s; the spec gives `state` 900 s and `extension-panel` 1800 s" | unverifiable | NEEDS-USER | the lars-verify spec is a user-scope file; cite its copy or drop the numbers |
| 93 | references/ai-browsers-verification.md | "Port 9992 must be free" | unverifiable | NEEDS-USER | a live machine check; `control-ai-browsers instances` shows what runs |
| 94 | references/edge-dev-aion-model.md | "`.claude/skills/` holds Claude Code's older copy" of `features/model-lifecycle.md` | stale | fix-doc | the two `control-ai-browsers` trees are byte-identical; drop "older" |
| 95 | .commandcode/taste/angular/taste.md | "Features should be Angular-only with no third-party packages; specifically excludes Vitest, Analog.js, Storybook, NgRx, and RxAngular" | stale | NEEDS-USER | the workspace depends on `vitest` for the fixture tests; the owner must say whether the preference is about product code only |
| 96 | .commandcode/taste/communication/taste.md | "Writing style in docs: plain literal prose, no em dashes or curly quotes" | stale | fix-doc | the file itself ends in a pasted `0.7">` artefact and uses em dashes; clean it and the docs that break the rule |
| 97 | .commandcode/taste/design/taste.md | "A Worker must not call `LanguageDetector` or `Translator` itself" | unverifiable | NEEDS-USER | a browser measurement; no worker code exists to check against |
| 98 | .commandcode/taste/tooling/taste.md | "Package.json should include standardized `test` and `typecheck` npm scripts, test via `node --test`, typecheck via `tsc --noEmit`" | stale | NEEDS-USER | the root has `test` and `check`, not `typecheck`; add the alias or reword the preference |

