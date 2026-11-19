# Docs Audit
Repo root: D:\projects\sandbox\angular-ai-devtools
Audited: 2026-11-19
Audited HEAD: 2ece0b80ad8b8b78e337077a3592f663e7ab50e7
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 491 |
| stale | 61 |
| aspirational | 0 |
| unverifiable | 200 |
| descriptive docs (no testable claims) | 0 |

## Doc: .commandcode/pstack-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The pstack effort agents (`effort-low`, `effort-medium`, `effort-high`, `effort-xhigh`, `effort-max`) set `reasoningEffort` in their frontmatter" | config | stale | asserted at `pstack-models.md:5`, but no such agent file exists: `%USERPROFILE%\.commandcode\agents` holds only `comment-sicko.md`, `free-crouton-alpha-*.md`, `free-flint-v1-0.md`, `free-glyph-cluster-*.md`, `free-inkling-2-small-*.md`, `paid-*.md`, `poteto-agent.md`, `thermo-nuclear-*-subagent.md`; `%USERPROFILE%\.claude\agents` holds `fable-\|haiku-\|opus-\|sonnet-<level>.md`. One `findstr /s /m /c:"effort-low" *.json *.md` over `~/.commandcode` matches only `pstack-models.md` itself (the config file, not an agent). The effort dial is carried per model instead: `free-glyph-cluster-low.md:2-3` is `model: stealth/glyph-cluster:free` + `reasoningEffort: low`. Caveat: a built-in (non-file) role registry could still supply `effort-*`; nothing on disk does. |
| "Free models available: `poolside/laguna-s-2.1-free`, `reflection/beam:free`, `minimax/minimax-m3.1-flash:free`, `stealth/glyph-cluster:free`" | feature | stale | asserted at `pstack-models.md:7`, but the machine's agent set names `stealth/glyph-cluster:free`, `stealth/crouton-alpha`, `recursive/flint-v1.0:free` and `thinkingmachines/inkling-2-small:free` (`free-*.md:2` in `~/.commandcode/agents`) and names laguna, beam and minimax nowhere; the newer copy of this same file at `%USERPROFILE%\.commandcode\pstack-models.md:3` writes the example as `stealth/glyph-cluster:free @high` and `:9` admits `recursive/flint-v1.0:free`, where the repository copy still names `poolside/laguna-s-2.1-free`. |
| the benchmark table ("winner: `reflection/beam:free` @medium (49s, 384K tokens)", `pstack-models.md:9-17`) | structure | unverifiable | needs the `/lars-summarize` transcript run against a provider; nothing in the tree records those runs. |
| "On Command Code, the model slug is passed to the `agent` tool's `model` parameter" and "Command Code has no SessionStart hook; the `session hook` line here is inert" (`pstack-models.md:5`) | feature | unverifiable | needs a Command Code agent invocation and a session start; not decidable from files. |
| "`session hook: off` stops the Claude Code or Codex SessionStart hook, or the pstack Pi extension, from injecting the poteto-mode mandate" (`pstack-models.md:3`) | feature | unverifiable | needs a session start in one of those hosts. |
| the file's own settings are present and syntactically as described | config | verified | `default effort: session` (`pstack-models.md:58`) and `session hook: off` (`pstack-models.md:59`) are the last two lines, each a `key: value` line the text says can be deleted. |

## Doc: .commandcode/skills/control-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the instance table | structure | verified | ports 9333/9334/9335/9337/9338, model names `v3Nano`/`gemma4-2b-it`/`Aion-1.1-Instruct`/`Phi-4-mini-instruct`/`v3Nano`, `gpu` defaults, `contextWindow` 9,216/9,216/7,168/9,216/9,216 (`SKILL.md:22-27`) — read from `instances.json:70,90,94`, `:101,124,128`, `:135,162,166`, `:173,190,194`, `:201,221,225`, and `backend.default` per entry (see also `npm test` case "instance merges registry, browser and derived fields"). |
| "`up` tries the next slot, `9600 + 10 * slot + index` …, 10 slots in all" (`SKILL.md:44`) | feature | verified | `scripts/control.mjs:577` is `return slot === 0 ? mainPort : 9600 + 10 * slot + index;` with `SLOT_TRIES = 10` (`control.mjs:162`); the test "an instance takes the registry port in slot 0 and 9600 + 10 * slot + index in a fallback slot" passes. |
| `instances.json` is the single source for browser, executable, port, features, `args`, backends, expected model, folder pattern, asset, use case and `pin` (`SKILL.md:28-31`) | config | verified | every listed key is present in `instances.json` (`browsers` block for `exe`/`product`/`browserArgs`/`minFreeMib`, `instances.<name>.{port,features,args,backend,model,pin}`), including `pin` for `edge-dev-aion` (`instances.json:151`). |
| the commands of the Scripts table | command | verified | sixteen rows for twelve distinct commands, `model` expanding to five (`SKILL.md:268-285`) — `COMMANDS` maps `up\|attach\|detach\|doctor\|flags\|model\|run\|panel\|down\|info` (`scripts/control.mjs:4234-4245`) and `instances`/`bench` are dispatched before it (`control.mjs:4253`). |
| "`--target` is not a flag here — this script ignores unknown flags silently" (`SKILL.md:209`) | command | verified | `parseArgs` files any `--name[=value]` into `opts` and never rejects unknown names (`control.mjs:191-208`); `main` validates only `--timeout-min` and `--port` (`control.mjs:4250-4251`). |
| "`npm test` at the repository root runs them and `npm run check` type-checks the scripts" (`SKILL.md:308`) | command | verified | `package.json` `test` → `test:skills` = `node --experimental-strip-types --test ".commandcode/skills/**/*.test.mjs"`, `check` → `check:skills` = `tsc -p .commandcode/skills/tsconfig.json`; ran `node --experimental-strip-types --test ".commandcode/skills/control-ai-browsers/scripts/*.test.mjs"` → `tests 60 / pass 60 / fail 0`. |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" (`SKILL.md:307`) | structure | stale | `scripts/text.mjs` (26 lines, exports `UNPRINTABLE`, `printable`) has no `scripts/text.test.mjs`; the directory holds only `control\|fingerprint\|panel\|pipe-keeper.test.mjs`. (Its `printable` is exercised upstream in `~/.commandcode/skills/lars-create-verification/scripts/fingerprint.test.mjs` and `proof.test.mjs`, which the sentence does not say for `text.mjs`.) |
| the doctor check table (`SKILL.md:157-177`) | structure | verified | `cmdDoctor` emits exactly those ids: `map-fresh, process, tree, commandLine, ports, tabs, account, extension, model.disk, model.pin (pin instances only), model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp` (`control.mjs:3356-3606`). |
| "`canary.tools` … skipped for Nano; reported but not required for Phi-4-mini, registry `toolCanary: "report"`" (`SKILL.md:174`) | config | verified | `instances.json:95` (`chrome-beta-nano`, `toolCanary: false`) and `:195` (`edge-phi4mini`, `"report"`); `toolsPass` returns `null` for `report` and `null` when the canary did not run (`control.mjs:2707-2709`), and `checkMarker(null) === 'SKIP'` (`control.mjs:2688-2690`). |
| "It exits 0 with `answer`, `answerMs`, `ngVersion`, `extensionId` and `steps`, or 1 with `error`; `--timeout-min` (default 4)" (`SKILL.md:205`) | command | verified | the `PanelRun` typedef holds `ok, ngVersion, extensionId, answer, error, status, feature, …, answerMs, steps` (`scripts/panel.mjs:9-29`); `cmdPanel` passes `positiveFlag('timeout-min', …, 4) * 60000` (`control.mjs:3124-3125`). The Scripts row (`SKILL.md:282`) does not mention `--feature`, which `panel` does accept (`control.mjs:3126`, `panel.mjs:345-347`) and the four feature recipes use. |
| a failed extension load "exits 2 and **stops the browser it just started**, removing the state file … When the stop itself failed the message says so and names the `down`" (`SKILL.md:131`) | command | verified | `control.mjs:2982-2992` removes the state file on a clean stop and refuses with `stopping the browser failed too (…); run "down <name>"` otherwise. |
| "`up --json` gives `session` and `evidenceDir` at the top level, also with `alreadyRunning`" (`SKILL.md:111`) | command | verified | the launch result returns `session: st.session, evidenceDir` (`control.mjs:3002-3005`) and the already-running path returns `alreadyRunning: true` with the state (`control.mjs:2806-2808`). |
| the bench app row, "`spikes/probes/bench.js:4` hard-codes it" (`SKILL.md:50`) | feature | verified | `spikes/probes/bench.js:4` is `await page.goto('http://localhost:4222/');`; `BENCH_APP` records port 4222 with that reason (`control.mjs:168-174`). |
| the measured launch/doctor numbers | feature | unverifiable | "1.3-2.2 s, once 28 s (Edge Dev)" readiness, "9680 … fallback 9690", "a run takes 25-50 s", the `chrome-beta-nano` model variants `2025.8.8.1141`/`2025.8.21.1028` (`SKILL.md:101-103`) — need the Chrome/Edge instances on this machine; none of the profiles under `.commandcode/worktrees/.browsers` are asserted here. |
| every Gotcha that records a browser measurement (Edge self sign-in and the sync prompt, the idle `about:blank` tab that blocks `playwright-cli`, Edge model-update drift, `OnDeviceAiDefaultEnabled`, the `callID`/`callId` acceptance per version, the ReFS free-space lag, D: read throughput) | command | unverifiable | needs the live browsers and models. |

## Doc: .commandcode/skills/control-ai-browsers/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the baseline ports and models | config | verified | Nano 9333, Gemma 4 9334, Aion 9335, Phi-4-mini 9337, Nano 9338 (`features/README.md:11`) — `instances.json:70,101,135,173,201`. |
| "The panel is built (`npx nx run angular-ai-devtools:build-extension`) before `up`, because every instance loads `extension/`" (`features/README.md:14`) | command | verified | `apps/angular-ai-devtools/project.json` has a `build-extension` target with `"outputs": ["{workspaceRoot}/extension/panel"]` and `dependsOn: ["generate-error-digest"]`. |
| the browsers are "installed at the paths in `instances.json`" (`features/README.md:9-10`) | config | verified | all four executables exist: `C:\Program Files\Google\Chrome Beta\Application\chrome.exe`, `C:\Program Files\Google\Chrome\Application\chrome.exe`, `C:\Program Files (x86)\Microsoft\Edge Dev\Application\msedge.exe`, `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (`instances.json` `browsers.*.exe`). |
| the feature entry contract | feature | verified | "Each feature file starts with an H1 and one paragraph of behaviour, then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-ai-browsers`, `Gotchas`" (`features/README.md:47-51`) — checked on all ten feature files: exactly one H1 at line 1 and exactly those four H2s in that order in each. |
| the Features list and the ten-step full sweep (`features/README.md:62-88`) | feature | verified | all ten named files exist (`instances, health-check, model-lifecycle, probes, extension-panel, di-doctor, error-explainer, signal-provenance, stale-view, interop.md`). |
| "The five instances run … (`C instances` shows them with no drift)" and "`C doctor <name>` exits 0" (`features/README.md:11-15`) | command | unverifiable | needs the five browser instances running; not started here (read-only audit). |

## Doc: .commandcode/skills/control-ai-browsers/features/di-doctor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/di-doctor.service.ts`, `n3-di-doctor.component.ts`, `di-diff-display.ts`" (`di-doctor.md:30`) | integration | verified | all three exist; `n3-di-doctor.component.ts:6` imports `diffDiPaths` from `./di-diff-display`. |
| the message pair | feature | verified | "sends `angular-ai:di-query` (`componentName`, `elementTag`) and receives `angular-ai:di-graph` with a `DiResolutionPath`" (`di-doctor.md:3-4`) — `queryDi(componentName, elementTag)` sends `{ type: 'angular-ai:di-query', componentName, elementTag }` (`di-doctor.service.ts:31-41`), the listener filters `'angular-ai:di-graph'` + `resolutionPath` (`di-doctor.service.ts:23-27`), and `DiResolutionPath` comes from `src/main-world/di-path-tracer.ts` (`di-doctor.service.ts:2`). |
| "with a path view and a diff view" (`di-doctor.md:3`) and "The Diff tab needs at least two resolution paths to compare" (`di-doctor.md:36`) | structure | verified | `tab-path`/`tab-diff` and the `path-display`/`diff-display` panes (`n3-di-doctor.component.ts:22-42`) with `diffDiPaths(paths[0]!, paths[1]!)` only when two paths exist (`n3-di-doctor.component.ts:78-81`). |
| "The proof across every pair is `verify-ai-browsers/checks/di-doctor.mjs`" (`di-doctor.md:31`) | structure | verified | the file exists. |
| the counter fixture URL `http://localhost:4222/` (`di-doctor.md:25,29`) | integration | verified | the main-checkout counter port (`control-angular-dev-app/scripts/control.mjs:121`). |
| the driven panel interaction (select "DI Doctor", pick a component, read the path/diff, "Explain" answering through the instance's model, the empty-until-selected path list) | structure | unverifiable | needs a browser instance, the built panel and the counter dev server. |

## Doc: .commandcode/skills/control-ai-browsers/features/error-explainer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The explain step runs in the panel (`src/panel/error-explainer-view.ts` calls `shouldCallModel`)" (`error-explainer.md:33`) | structure | verified | `src/panel/error-explainer-view.ts:98` defines `export function shouldCallModel(digest, code)`, used by `apps/angular-ai-devtools/src/app/error-explainer.component.ts`. |
| "message type `angular-ai:error-capture` only … `angular-ai:error-explain` does not exist" (`error-explainer.md:34`) | integration | verified | the background's message list is `angular-ai:record`, `angular-ai:di-graph`, `angular-ai:error-capture` (`extension/background.js:13-16`), the relay forwards `record`, `di-graph`, `error-capture` (`extension/relay.js:14-30`), and a tree-wide search finds `angular-ai:error-explain` only in this document. |
| `C panel <name> --url=http://localhost:4222/ --feature=error-explainer` (`error-explainer.md:28`) | command | verified | `panel` reads `--feature` (`control.mjs:3126`) and `panel.mjs` routes `error-explainer`/`errors` (`panel.mjs:345`); the driver injects `console.error('NG0100: …')` (`panel.mjs:378`). |
| "captures `NG0xxx` and uncaught console errors … maps each to its owning component through `ng.getOwningComponent`"; "An error with no owning component reports \"no owning component\""; the empty state (`error-explainer.md:3-4,39-40`) | integration | verified | `src/main-world/error-capture.ts` matches `/NG0\d{3,}/` (`:35`), resolves through `ng.getOwningComponent`/`ɵgetOwningComponent` (`:42-54`), and holds `NO_OWN_COMPONENT = 'no owning component'` (`:18`) and `EMPTY_STATE = 'No captured errors'` (`:20`). |
| "a digest of the official `angular.dev/errors` documentation bundled at extension build time" (`error-explainer.md:7-8`) | feature | verified | `build-extension` `dependsOn: ["generate-error-digest"]` (`apps/angular-ai-devtools/project.json:55,93-96`) and `extension/error-digest.json` holds `version` `22.2.x` with 64 entries (first codes `NG0100, NG01002, NG01055`). |
| "`verify-ai-browsers/checks/error-explainer.mjs`" (`error-explainer.md:29`) | structure | verified | the file exists. |
| the driven run (the panel showing the injected NG0100, its component, its digest entry, and a non-empty answer) | structure | unverifiable | needs a browser instance plus the panel. |

## Doc: .commandcode/skills/control-ai-browsers/features/extension-panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`npx nx run angular-ai-devtools:build-extension` writes `extension/panel/` (`main.js`, `styles.css` and `index.html` with `<base href="/panel/">`)" (`extension-panel.md:35-36`) | command | verified | the target exists with `baseHref: "/panel/"` and `outputPath.base: extension/panel` (`apps/angular-ai-devtools/project.json`), and `extension/panel/` currently holds `main.js`, `styles.css`, `index.html` with `<base href="/panel/" />` (`extension/panel/index.html:6`). |
| with `--json` the result has "`answer`, `error`, `status`, `answerMs`, `ngVersion`, `extensionId` and `steps`" (`extension-panel.md:44`) | command | verified | all seven are `PanelRun` properties (`scripts/panel.mjs:11-28`). |
| "The older `chrome-extension://<id><title>` id (still used by control-angular-devtools)" (`extension-panel.md:65`) | feature | verified | that skill still builds it: `PANEL_ID = \`chrome-extension://${EXT_ID}Angular\`` (`.commandcode/skills/control-angular-devtools/scripts/control.mjs:109`), asserted in its SKILL.md (`control-angular-devtools/SKILL.md:92,217`). |
| `up <name> --extension=<dir>` and the refusal while the instance runs with another folder (`extension-panel.md:10-15`) | command | verified | `cmdUp` takes `--extension` (`control.mjs:2762-2765`), records `extensionDir`, and `upMismatch` refuses a live instance with another configuration (`control.mjs:338-353`). |
| "The proof across every pair … `verify-ai-browsers/checks/extension-panel.mjs`" (`extension-panel.md:46-48`) and the `extension-panel` sub-feature names (`:12-16`) | structure | verified | `checks/extension-panel.mjs` exists and the `.proven.json` manifest records `extension-panel` (`features/.proven.json`). |
| the measured answer times (12.9 s / 13.6 s / 5.6 s / 3.1 s / 8.4 s, `extension-panel.md:49`), the `Prompt API: ready` line, "Where `LanguageModel` works (measured … in all five pairs, `research/19`)", the `extension-panel-<uuid>_<n>` panel key and the `chrome-extension://<id>/panel/` frame URL | integration | unverifiable | need the live DevTools panel; `research/19-languagemodel-in-extension-contexts.md` exists but records a past run. |

## Doc: .commandcode/skills/control-ai-browsers/features/health-check.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Run `C doctor chrome-beta-gemma4`. Exit 0 and nineteen check lines" | command | stale | asserted at `health-check.md:30`, but `model.pin` is emitted only when the instance has `pin` roots (`control.mjs:3468`), and `chrome-beta-gemma4` has no `pin` key (dump of `instances.json`; only `edge-dev-aion` does, `instances.json:151`). A healthy `chrome-beta-gemma4` therefore prints eighteen check lines (`map-fresh, process, tree, commandLine, ports, tabs, account, extension, model.disk, model.broker, backend, performanceClass, disk.free, api.availability, model.contextWindow, canary.structured, canary.tools, canary.webmcp`), not nineteen. |
| the `extension` line's shape and content | feature | verified | "`Angular AI DevTools 0.3.0 loaded as mgkfgkdgobahfcgkdlokpoehblpbkfok from <primary checkout>/extension`" (`health-check.md:31`) — `extensionCheck` formats ``${want.name} ${want.version} loaded as ${id} from ${dir}`` (`control.mjs:3094`), `extension/manifest.json` is `"name": "Angular AI DevTools", "version": "0.3.0"` (`extension/manifest.json:3-4`), and the id is reproducible: re-running the documented derivation (`sha256` over the UTF-16LE path, first 16 bytes, nibbles as a-p, `control.mjs:905-920`) on `D:\projects\sandbox\angular-ai-devtools\extension` yields `mgkfgkdgobahfcgkdlokpoehblpbkfok`. |
| "`canary.tools` is `[SKIP]`" on `chrome-beta-nano` (`health-check.md:33`) | feature | verified | `instances.json:95` `toolCanary: false` → `toolsPass` returns `tools?.pass ?? null` → `null` → `checkMarker` `SKIP` (`control.mjs:2707`, `:2688`). |
| the Broker State readings and per-instance backend rows (`gemma4_gpu_low_tier_model`, `nano_v3_gpu_low_tier_model`, `edge_base_model_gpu`, "GPU (fastest inference)", "matches the pin of <date>", the `mismatch`/`in-flight` examples, the measured canary times, the stored performance classes) | config | unverifiable | need a running instance and its `chrome://on-device-internals` Broker State; the row names themselves appear only in recorded runs such as `research/00-browser-probe.md:98`. |

## Doc: .commandcode/skills/control-ai-browsers/features/instances.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "One line per instance (five), each `[OK]` with PID, `backend gpu` and `1 tab(s)`; a stopped instance reads `stopped`" (`instances.md:28`) | feature | verified | `cmdInstances` logs ``${name} :${port} ${model.name}: ${PID …, backend …}, ${tabs.length} tab(s)`` and `'stopped'` for the no-process branch (`control.mjs:2749-2752`); the registry has five entries (`instances.json:68,99,133,171,199`). |
| "`C flags edge-dev-aion`. `[OK]` with the nine Aion features" (`instances.md:29`) | command | verified | `edge-dev-aion.features` is a nine-item list (count read from `instances.json` via `node -e`), and `cmdFlags` compares the version page against it (`control.mjs:3307`). |
| "`C up edge-dev-aion --backend=cpu` exits 2 before anything starts" (`instances.md:35`) | command | verified | the registry declares `backend.cpu: null` for both Edge instances (dump of `instances.json`), and the test "featuresFor adds the backend features and refuses a null or unknown backend" passes. |
| the `args` rule and "`edge-dev-aion` has `--disable-component-update`" (`instances.md:47-48`) | structure | verified | `instances.json` `edge-dev-aion.args = ["--disable-component-update"]`; the tests "an instance's own args are launched after the common ones, and drift requires them" and "drift compares an args entry with a value by switch name and whole entry" pass. |
| `attach`/`detach`/`down`/`up`/`instances`/`flags` exist as commands (`instances.md:22-35`) | structure | verified | `control.mjs:4234-4253`. |
| the live `C instances` and `C flags` output (PIDs, "no drift", per-instance feature verdicts) and the down/up backend flip | command | unverifiable | need the running browsers. |

## Doc: .commandcode/skills/control-ai-browsers/features/interop.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Required panel test ids: `interop-slice` …, `interop-limit` …, `interop-inferred` …, plus the shared `explain`, `ai-answer`, `empty-state` and `owning-component`" | structure | stale | asserted at `interop.md:37-39`, but `apps/angular-ai-devtools/src/app/interop.component.ts` carries no `owning-component` test id: its ids are `interop-slice` (`:27`), `interop-limit` (`:28`), `interop-node` (`:29`), `source-node` (`:30`), `producer` (`:33`), `consumer` (`:34`), `interop-inferred` (`:35`), `explain` (`:36`), `empty-state` (`:24`), `ai-answer` (`:45`) plus `unsupported`/`unavailable`/`missing-fact`. `owning-component` exists only in `error-explainer.component.ts:26` and `stale-view.component.ts:29`. |
| "Zero interop nodes renders an explicit empty state (\"no interop nodes\")" | feature | stale | asserted at `interop.md:49`, but the component renders `no interop findings` (`interop.component.ts:24`). |
| "evidence `.project/build/verify/interop/`" | feature | stale | asserted at `interop.md:36`, but `.project/` holds only `archive, research, STATE.md, ROADMAP.md, CHARTER.md, LESSONS.md, model-policy.json` (`dir /b .project`), and there is no `.project/build`. The run's files were archived: `.project/archive/014-interop-proof/build/verify/interop/{verdict.json,interop.json,…}` and `.project/archive/015-program-closeout/build/verify/interop/`. |
| "the check exits 0 on `edge-dev-aion` with `nodes: 1`; verdict `verified` (2/2)" (`interop.md:36`) | command | verified | the archived evidence says exactly that: `"verdict": "verified"` with `"reasons": ["head passed all 2 runs"]` (`.project/archive/014-interop-proof/build/verify/interop/verdict.json:2-5`) and `"nodes": 1` (`.project/archive/014-interop-proof/build/verify/interop/interop.json:12`, repeated in `015-program-closeout/build/verify/interop/interop.json:12`). The verdict vocabulary is lars-verify's: `verified` / `not verified` / `inconclusive` (`~/.commandcode/skills/lars-verify/SKILL.md:64-65,99,118`). |
| the sidecar invocation with `--extension <checkout>/extension` (`interop.md:34-35`) | command | verified | `interop.mjs:216` prints `usage: … [--extension <dir>] [instance...]` and `:221` explains that it names the directory the running instance must serve; the recorded condition argv uses exactly that shape (`.project/archive/014-interop-proof/build/verify/interop/verdict.json:52-59`). The check's own exit vocabulary is 0 pass, 1 `Error: CLAIM: …`, 2 could not run (`verify-ai-browsers/checks/interop.mjs:14`). |
| "Implementation: `apps/angular-ai-devtools/src/app/interop.component.ts`; no runtime message type … `angular-ai:interop` does not exist" (`interop.md:41-42`) | integration | verified | the file exists and the string appears only in this document. |
| "identify a `toSignal.source` / `toSignal.state` node and the unlabelled effect whose `debuggableFn` source contains `subject.error` … word the field-to-node attribution \"inferred, untested\"" (`interop.md:11`) | feature | verified | `interop.service.ts:12` matches `n.label === 'toSignal.source' \|\| n.label === 'toSignal.state'`, `:15-19` reads `debuggableFnSource`/`debuggableFn`, `:65` is `INFERRED_UNTESTED = 'inferred, untested'`; the `subject.error` token rule lives in `src/main-world/interop-keep-list.ts:5` (whole-token match, tested in `interop-keep-list.spec.ts:13-42`), and the fixture emits it at `spikes/ng222-app/src/app/stale-view-fixture.ts:22`. |
| the live run behind those numbers (the panel rendering the slice, the three limits and a non-empty answer) | feature | unverifiable | needs the `edge-dev-aion` instance, its model, and the counter fixture; also unverified is the archived run against today's HEAD (it recorded `b4faa07`). |

## Doc: .commandcode/skills/control-ai-browsers/features/model-lifecycle.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the free-space rule "free space minus the model's `downloadMib` must stay above the browser minimum in `instances.json` (Chrome 22,528 MiB, Edge 20,480 MiB)" (`model-lifecycle.md:97`) | config | verified | `instances.json` has `model.downloadMib` per instance (4073/3127/1248/2391/4073) and `browsers.*.minFreeMib` 22528/20480; the test "downloadRefusal keeps the browser minimum free after the download" passes. |
| "`C model init` … the answer to `Say hi in three words.`" (`model-lifecycle.md:42`) | command | verified | `control.mjs:1965` is `o.answer = await to(s1.prompt('Say hi in three words.'));`. |
| "the JSON holds `bytesRemoved` … and `diskAfter`" (`model-lifecycle.md:35`) | structure | verified | `modelClear` returns `bytesRemoved: victims.reduce(…)` and `diskAfter: diskModels(inst)` (`control.mjs:4057`, `:4061`). |
| the pin folder "`.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>` … with `pin.json`" (`model-lifecycle.md:47`) | config | verified | `TMP = join(ARTIFACT_ROOT, 'tmp', 'control-ai-browsers')` with `ARTIFACT_ROOT = <primary>/.commandcode/worktrees` (`control.mjs:155-156`), `pinFolderOf(name)` (`control.mjs:1316`), `pin.json` written at `control.mjs:3817`. |
| the download gesture and sampling | feature | verified | "logs the gesture (`click` or `Enter`), samples progress every 5 s" (`model-lifecycle.md:37-38`) — `p.click('#ai-browsers-download', { timeout: 5000 }).catch(… gesture = 'Enter' …)` then `await p.waitForTimeout(5000)` in the sampling loop (`control.mjs:3938-3945`). |
| "`model clear` refuses a running instance" (`model-lifecycle.md:70`) and the junction refusal | feature | verified | `modelClear` refuses a live instance and a profile that resolves through a reparse point (`control.mjs:3999` region, `refuse`/`refuseLinked` at `control.mjs:2388`), matching the Scripts row "instance must be stopped, and its profile folder must not resolve through a junction" (`SKILL.md:283`). |
| every recorded size and version | config | unverifiable | `bytesRemoved` 4,269,934,855, 4,072 MiB/2,374 MiB downloads, the 2026.10.2.1 pin triple, "1.3 GB", `contextWindow` 7,168 on the pinned Aion, the `serving v3Nano; backend GPU … class 3` line (`model-lifecycle.md:32`) — need the browser profiles and a model download; the profiles under `.commandcode/worktrees/.browsers` were not exercised. |

## Doc: .commandcode/skills/control-ai-browsers/features/probes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the counter fixture serves `http://localhost:4222` (`bench.js` hard-codes it" (`probes.md:22`) | integration | verified | `spikes/probes/bench.js:4` `await page.goto('http://localhost:4222/');`; `control.mjs:168-174` records the same reason. |
| "`result.q1.answer` names 42 and `result.log` lists `get_component_count` and `get_component_inputs`" (`probes.md:28`) | feature | verified | `spikes/probes/probe10.js` defines both tools (`:7`, `:8`), sets `o.q1 = await ask('How many Angular components are on the page?')` (`:53`) and returns `o` with `log` (`:5`, `:61`); `cmdRun` returns `{ ok: true, result: … }` (`control.mjs:4081-4084`). |
| "`bench.js` has a 120 s per-prompt timeout and returns tool exceptions as tool errors" (`probes.md`, Gotchas) | config | verified | `spikes/probes/bench.js:11` `const PROMPT_TIMEOUT_MS = 120000;`. |
| "`results[i]` holds …, `cpuBefore` and `cpuAfter` (load percent and the five busiest processes)" (`probes.md:31`) | structure | verified | `cpuLoad()` returns `loadPercent` plus `Get-… \| Select-Object -First 5` process rows (`control.mjs:2660-2677`); `BenchRecord` has `cpuBefore`/`cpuAfter` (`control.mjs:4094-4095`), set at `:4140`/`:4155-4156`. |
| "Summarise with `node spikes/probes/bench-summary.mjs`" and "`bench` does not use `spikes/probes/bench-all.sh`" (`probes.md:32`, Gotchas) | structure | verified | both files exist; `cmdBench` runs `bench.js` per instance (`control.mjs:4102-4165`) and never names `bench-all.sh`. |
| the two probe files `spikes/probes/probe10.js` and `spikes/probes/broker-state.js` exist with the documented roles. | structure | verified | `spikes/probes/probe10.js:1-3`, `spikes/probes/broker-state.js` |
| the recorded probe and benchmark results (a `q1.answer` naming 42 on `edge-dev-aion`, the Nano prose answer, latency comparisons) | feature | unverifiable | need a running instance and its model. |

## Doc: .commandcode/skills/control-ai-browsers/features/signal-provenance.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The page-side tracer lives in `extension/agent-main.js` and `src/main-world/provenance-tracer.ts`" (`signal-provenance.md:32`) | structure | verified | both files exist (`provenance-tracer.ts` present at `src/main-world/`). |
| "the fact list is the `angular-ai:record` message handled by `ExtensionMessageService`" (`signal-provenance.md:33`) | integration | verified | `angular-ai:record` is dispatched by the page agent and forwarded by the relay (`extension/relay.js:14-15`) and listed in the background's message list (`extension/background.js:13`); `apps/angular-ai-devtools/src/app/extension-message.service.ts` exists. |
| "The proof across every pair is `verify-ai-browsers/checks/signal-provenance.mjs`" (`signal-provenance.md:31`) | structure | verified | the file exists. |
| the panel behaviour (chain rendering from recorded facts, anti-pattern findings on two differing snapshots, the cached "Explain" answer, "Explain is disabled while the Prompt API is unavailable") | integration | unverifiable | needs a browser instance with the inspected page and panel-local Prompt API. |

## Doc: .commandcode/skills/control-ai-browsers/features/stale-view.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Implementation: `apps/angular-ai-devtools/src/app/stale-view.component.ts` … The scan runs through `StaleViewScanService` (which loads `extension/stale-view-worker.js`)" (`stale-view.md:30-31`) | structure | verified | the component injects `StaleViewScanService` from `./stale-view-scan.service` (`stale-view.component.ts:2,55`), and that service resolves `stale-view-worker.js` via `chrome.runtime.getURL` / `'../stale-view-worker.js'` (`stale-view-scan.service.ts:32-33`); `extension/stale-view-worker.js` exists. |
| "With zero findings the panel renders an explicit empty state (\"no stale-view findings\")" (`stale-view.md:37`) | feature | verified | `stale-view.component.ts:21` `<p class="empty" data-testid="empty-state">no stale-view findings</p>`. |
| `C panel … --feature=stale-view` (`stale-view.md:26`) | command | verified | `panel.mjs:346` routes `stale-view`; `control.mjs:3126` accepts `--feature`. |
| "no runtime message type … so `angular-ai:stale-view` does not exist" (`stale-view.md:31-32`) | integration | verified | a tree-wide search finds that string only in this document. |
| the driven run (findings list, the hedged wording "the template may show a stale value", field name, owning component, "Explain" answer) | structure | unverifiable | needs a browser instance, the panel and an Angular page. |

## Doc: .commandcode/skills/control-angular-dev-app/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`provideRouter(routes)` over the two routes `src/app/app.routes.ts:5-8` declares, `/stale-view` and `/stale-view-deferred` (read 2026-11-01)" | structure | stale | asserted at `SKILL.md:25`, but `spikes/ng222-app/src/app/app.routes.ts` declares twenty routes at `:18-38` (first `{ path: 'stale-view' … }` at `:19`, `stale-view-deferred` at `:20`); lines 5-8 are imports (`ImageBudgetPage`, `AfterRenderPage`, `TrustBypassPage`, `FieldFormPage`). |
| "`.commandcode/skills/control-angular-dev-app/scripts/control.mjs:69` keeps it at 3000" | feature | stale | asserted at `SKILL.md:43`, but `PORTAL_API_PORT = 3000` is at `control.mjs:101`; line 69 is a `@property` line of the `State` typedef. (The companion pin citation, `libs/shared/utils/src/lib/injection-tokens.ts:5`, is correct: that line is `factory: () => 'http://localhost:3000/api/',` in the portal checkout.) |
| the Scripts signature `scripts/control.mjs <command> [--target counter\|ssr\|portal] …` omits a target the script accepts | command | stale | asserted at `SKILL.md:228`, while `up` lists four: `up needs --target counter\|components\|ssr\|portal, or --url <dev-server URL>` (`control.mjs:1472`) and `TARGETS` has a `components` entry (`control.mjs:135-155`); this document's own Components row (`SKILL.md:26`) drives it. |
| the port table | config | verified | counter 4222 (`4300 + slot`), components 4224 (`4600 + slot`), SSR 4223 (`4400 + slot`), portal 4200 (`4500 + slot`), portal api fixed 3000, portal pangular external 9999 (`SKILL.md:37-45`) — `control.mjs:121,142,163,185` (derived `at`), `:101` (`PORTAL_API_PORT`), `:1116` (`PANGULAR_PORT = 9999`); the tests "the ports table keeps every slot of every target apart" and "no slot-0 port collides with another target or a reserved port" pass. |
| "the default portal folder: 4507" (`SKILL.md:31`, and the table row "measured: listened on 4507" at `SKILL.md:42`) | config | verified | recomputing `slotOf(portalDir, true)` over the documented hash (`control.mjs:294-307`) yields slot 7, and `4500 + 7 = 4507`. |
| "`--timeout <seconds>` (default 240; a missing value or one that is not a positive number exits 2)" (`SKILL.md:89`) | command | verified | `timeoutMs = timeoutMsOf(argv, 240)` (`control.mjs:1519`); the test "timeoutMsOf refuses a value that is not a positive number" passes. |
| the session names `control-ngdev-<target>-<port>` and `control-ngdev-url-<port>` (`SKILL.md:126`) | config | verified | `session: \`control-ngdev-${flowId}-${port}\`` on launch (`control.mjs:1577`) and `\`control-ngdev-${flowId}\`` on attach (`control.mjs:1458`), with `flowId` = target or `url-<port>` (`flowIdFor`, tested). |
| "`ng-core-functions`: the 11 public functions plus `ɵgetSignalGraph` and the four `ɵ` injector functions" (`SKILL.md:132`) | feature | verified | `CORE` lists eleven public names (`getComponent … isSignal`) plus `ɵgetSignalGraph`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders`, `ɵgetDependenciesFromInjectable` (`ng-inspect.js:146-163`). |
| the Inspect table (`components`, `inspect`, `signals`, `dependenciesOf`, `injectors`, `providers`, `router`, `navigate`; `changeDetection` `OnPush`/`Eager`) (`SKILL.md:168-180`) | structure | verified | all eight exist on `w.__ngc` (`ng-inspect.js:204,212,251,277,301,330,347,379`) and `changeDetection` maps 0→`OnPush`, 1→`Eager` (`ng-inspect.js:224-229`); the tests "components, inspect state and dependenciesOf read through window.ng" and "inspect, providers and router report what window.ng returns" pass. |
| "`doctor` reads the code from control-pangular-inspector's `pangular.log` (via its state file `pangular-9999.json`)" (`SKILL.md:122`) | structure | verified | `PANGULAR_STATE = <repo>/tmp/control-pangular-inspector/state/pangular-9999.json` (`control.mjs:1116-1122`). |
| the portal process pair | feature | verified | "`run api:serve --inspect=false` with `PORT=3000`, and `run insurance-portal:serve --port=<port>`", readiness "portal API: `/api/customers`" (`SKILL.md:67-79`) — `control.mjs:206-209` (`args: ['run','api:serve','--inspect=false']`, `env: { PORT: '3000' }`, `readyPath: '/api/customers'`); the API's `setGlobalPrefix('api')` makes that path real (`apps/api/src/main.ts:28-29` in the portal checkout). |
| "Nx 23's CLI entry is `node_modules/nx/dist/bin/nx.js`; the script reads it from `package.json` `bin`" (`SKILL.md`, Gotchas) | command | verified | the portal's installed Nx is 23.1.1 with `bin: {"nx":"./dist/bin/nx.js"}` (`node_modules/nx/package.json` in the portal checkout), and `binOf` resolves the bin field (`control.mjs:942-955`). |
| the script list | feature | verified | `scripts/ng-inspect.js` installs `__ngc` and returns the doctor facts, `scripts/ssr-check.js` is the SSR `run-code` file, plus `fingerprint.mjs` and `proctree.mjs` (`SKILL.md:237-256`) — all four exist; `node --experimental-strip-types --test ".commandcode/skills/control-angular-dev-app/scripts/*.test.mjs"` → `tests 51 / pass 51 / fail 0`. |
| "`node $S up --target ssr`, then `node $S doctor --target ssr` exits 0 on `/`" and the SSR fresh-page state in the feature README | command | unverifiable | needs a dev server, and note that on this machine `spikes/ng222-ssr/node_modules` does not exist, so `up --target ssr` would refuse at `control.mjs:1536-1540` ("cannot find the CLI … install dependencies first") until that fixture's dependencies are installed. |
| the measured ready times, "the dev servers listen on `[::1]` only", the Nx-daemon and inspector-port behaviour, the Pangular overlay's console errors and the `ng.*` runtime behaviours | integration | unverifiable | need the running servers and a browser session. |

## Doc: .commandcode/skills/control-angular-dev-app/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Counter: … Fresh page state: `count` 3, `double` 6, cart 1 item" (`features/README.md:10-11`) | feature | verified | `count = signal(3)`, `double = computed(() => this.count() * 2)`, `CartService.items = signal(['apple'])` (`spikes/ng222-app/src/app/counter.ts:5,17-18`). |
| "SSR: … heading `Render mode: server`, `Early clicks: 0`, list Alpha, Beta, Gamma, `@defer` block dehydrated" (`features/README.md:12-13`) | structure | verified | `<h1>Render mode: {{ mode() }}</h1>` and `<p class="clicks">Early clicks: {{ clicks() }}</p>` with `clicks = signal(0)` (`spikes/ng222-ssr/src/app/page.ts:10-12,26`), the `@defer (hydrate on interaction)` block (`page.ts:15`), the `/api/items` list `Alpha, Beta, Gamma` (`src/server.ts:20-24`), and `RenderMode.Server` for `''` (`src/app/app.routes.server.ts:4`). |
| "Portal: … API on 3000, app on the derived port, 4507 for the default portal folder" (`features/README.md:14-15`) | integration | verified | `PORTAL_API_PORT = 3000` (`control.mjs:101`); `slotOf(<portal dir>, true) = 7` → `4500 + 7 = 4507` (hash over the lowercased path, `control.mjs:294-307`). |
| "Every flag in `apps/insurance-portal/src/assets/feature-flags.manifest.json` decides whether a sidebar entry and its route exist" (`features/README.md:16-17`) | config | verified | the file exists in the portal checkout at `apps/insurance-portal/src/assets/feature-flags.manifest.json`, and the portal's list/details templates read flags through `*ngJournalFeatureFlag` (e.g. `libs/contract/feature-details/src/lib/details.component.ts:43-44`). |
| "Each feature file has an H1, one paragraph … then four H2s in order: `Sub-features`, `How to get to it (user POV)`, `Driving it with control-angular-dev-app` (starting with `Preconditions:`), `Gotchas`" (`features/README.md:51-52`) | structure | verified | checked on all five feature files in this chunk: one H1 at line 1, the four H2s in that order, and a `Preconditions:` line under the driving H2 in each. |
| the verdict vocabulary | feature | verified | "the verdict (verified, not verified, or inconclusive) comes from lars-verify" (`features/README.md:40`) — lars-verify defines exactly those three (`~/.commandcode/skills/lars-verify/SKILL.md:64-65,118`). |
| "take `<session>`, `<url>` and `<evidenceDir>` from `node $S info`" (`features/README.md:17`) | feature | verified | `info` prints `{ ok, command: 'info', statePath, ...state }` and the `State` typedef carries `url`, `session`, `evidenceDir` (`control.mjs:1916`, `:54-70`). |
| "`node $S up --target counter`, then `node $S doctor` exits 0" and the same for `--target ssr` and `--target portal` (`features/README.md:10-17`) | command | unverifiable | needs the dev servers and a playwright session; the SSR fixture's dependencies are absent here (see the SKILL.md entry). |
| the enrolment recipes | feature | unverifiable | PrimeNG dropdown/calendar behaviour, `__ngc.navigate`, "Portal data is random per API start", "A failed `doctor` makes the claim inconclusive" — need the running portal and its API. |

## Doc: .commandcode/skills/control-angular-dev-app/features/components.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The `/components` page renders `ComponentsPage` (`app-components-page`) with two `app-harness-probe` hosts and an `app-aria-surfaces` block" (`components.md:3-5`) | feature | verified | `components-page.ts:6` (`selector: 'app-components-page'`), `:9` (`<app-harness-probe id="probe-a">`), `:12` (`probe-b`), `:16` (`<app-aria-surfaces>`). |
| the surface selectors | feature | verified | "`aria-listbox` (`#components-listbox`)", "`aria-tabs` (`ngTabs`)", "`aria-menu` (`ngMenu` triggered by `ngMenuTrigger`)", "`cdk-overlay` … opened by the Overlay button" (`components.md:9-12`) — `aria-surfaces.ts:26` (`<ul id="components-listbox" ngListbox …>`), `:32` (`<div ngTabs>`), `:43` (`ngMenuTrigger … [menu]="menu"`), `:46` (`<div ngMenu …>`), `:52` (`<button … (click)="openOverlay()" …>Overlay</button>`). |
| "each projecting content and exposing an Advance button" (`components.md:8`) | feature | verified | `<ng-content>`, `<button type="button" data-action="advance" …>Advance</button>` (`harness-probe.ts:6,12`). |
| "Open `<url>` (`http://localhost:4224/components`)" (`components.md:16`) | integration | verified | components row is 4224 in slot 0 (`control.mjs:142`) with `readyPath: '/components'` (`control.mjs:152`). |
| "`node $S up --target components` and `node $S doctor --target components` exit 0 on a fresh page", and the snapshot/screenshot contents (`components.md:24-29`) | command | unverifiable | need the dev server and a playwright session. |
| "Two servers share `spikes/ng222-app`'s `.angular` cache with the counter target: one target at a time in a checkout" (`components.md`, Gotchas) | feature | unverifiable | a runtime/environment property; not checkable without starting both. |

## Doc: .commandcode/skills/control-angular-dev-app/features/counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the fixture's two other routes, `/stale-view` and `/stale-view-deferred`, belong to the stale-view fixtures (`src/app/app.routes.ts:5-8`, read 2026-11-01)" | structure | stale | asserted at `counter.md:18`, but `spikes/ng222-app/src/app/app.routes.ts:18-38` declares twenty routes; `:19-20` are the two stale-view routes and `:5-8` are imports. |
| "`router()` … lists the two routes `src/app/app.routes.ts:5-8` declares, `/stale-view` and `/stale-view-deferred`, not an empty list (read 2026-11-01)" | structure | stale | asserted at `counter.md:49`, same contradiction: the loaded route tree is the twenty-entry array at `app.routes.ts:18-38`. |
| the rendered line `Clicks: 3 (double 6, cart 1)` (`counter.md:3,28`) | feature | verified | `app.ts:8` passes `title="Clicks"` and `counter.ts:11` renders `{{ title() }}: {{ count() }} (double {{ double() }}, cart {{ cart.items().length }})` with `count = signal(3)` and a one-item cart (`counter.ts:17`, `:5`). |
| "an effect that copies `count` into `lastLogged`" (`counter.md:5,12`) | feature | verified | `readonly lastLogged = signal(0)` and `effect(() => this.lastLogged.set(this.count()))` (`counter.ts:20-23`). |
| "`counter-cd` the component is OnPush by default (no `changeDetection` declared)" (`counter.md:13`) | config | verified | `@Component({ selector, template })` only (`counter.ts:8-14`); `inspect()` maps `changeDetection === 0` to `OnPush` (`ng-inspect.js:224-229`). |
| "`eval \"() => __ngc.dependenciesOf('app-counter', 'double')\"` returns `dependsOn: [\"count\"]`" (`counter.md:34`) | integration | verified | `dependenciesOf` returns `{ signal, kind, value, dependsOn }` (`ng-inspect.js:289-297`). |
| the snapshot text and the runtime graph readings (`computed:double -> signal:count`, `effect: -> signal:count`, `getListeners(…).map(l => l.name)` → `["click"]`, `title: {signal: "Clicks"}`) | feature | unverifiable | need the counter dev server and a browser session; the label format itself is generated at run time (`ng-inspect.js:254-270`). |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-claims.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/claims`" (`portal-claims.md:4`) | integration | verified | the API serves `@Controller('claims')` under the `api` global prefix (`apps/api/src/claim/claim.controller.ts:16`, `apps/api/src/main.ts:28-29` in the portal checkout). |
| "`claim-list` table with columns Claim number, Damage Type, Date, Policynumber, Customer; 5 rows measured" (`portal-claims.md:8`) | structure | verified | `<th>Claim number\|Damage Type\|Date\|Policynumber\|Customer</th>` (`libs/claim/feature-list/src/lib/list.component.ts:20-24`) and `claim_uuids` is `Array(5)` (`apps/api/src/uuids.ts:9`). |
| "`claim-details` row click opens `/claim/<id>/details`, heading `Claim Details`" (`portal-claims.md:9-10`) | structure | verified | the claim routes declare `:id/details` and the details component's header is `title="Claim Details"` (`libs/claim/feature-details/src/lib/details.component.ts:35`). |
| "`/claim/create` shows the heading `Complaint Create` (app bug …)" (`portal-claims.md:42`) | structure | verified | `libs/claim/feature-create/src/lib/create.component.ts:33` is `<ng-journal-header title="Complaint Create" />`; the complaint create page carries the same title legitimately (`libs/complaint/feature-create/src/lib/create.component.ts:37`). |
| "`claim-create` `/claim/create`: … `Select damage type` and `Select contract` (under the label Policynumber) dropdowns" (`portal-claims.md:12,36`) | feature | verified | the placeholders are in the claim form (`libs/claim/ui/src/lib/claim-form.component.ts:62,77`). |
| the driven list/details/create run and the signal-graph strings (`template:ng-journal-list -> computed:claims`, `computed:claims -> signal:#state`) | feature | unverifiable | need the portal dev server, its API and a browser session. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Data comes from `http://localhost:3000/api/complaints` and `/api/customers`" (`portal-complaints-customers.md:4-5`) | integration | verified | `@Controller('complaints')` and `@Controller('customers')` under the `api` prefix (`apps/api/src/complaint/complaint.controller.ts:15`, `apps/api/src/customer/customer.controller.ts:5`, `apps/api/src/main.ts:28-29`). |
| "`complaint-list` columns Type, Customer, Date, Description; 2 seeded rows" (`portal-complaints-customers.md:8-9`) | feature | verified | the four `<th>` columns are at `libs/complaint/feature-list/src/lib/list.component.ts:20-23` and `complaint_uuids` is `Array(2)` (`apps/api/src/uuids.ts:10-11`). |
| "`complaint-create` `/complaint/create`, heading `Complaint Create`: `Select type` (CustomerService, Sales, Payments) …" (`portal-complaints-customers.md:10-12`) | structure | verified | `title="Complaint Create"` (`libs/complaint/feature-create/src/lib/create.component.ts:37`), placeholder `Select type` (`libs/complaint/ui/src/lib/complaint-form.component.ts:38`) and the enum `CustomerService\|Sales\|Payments` (`libs/complaint/models/src/lib/dtos/complaint-type-dto.model.ts:2-4`). |
| "`complaint-details` … heading `Complaint Details`, with the customer as a link" and "`customer-details` `/customer/<id>/details`, heading `Customer Details`" (`portal-complaints-customers.md:13-17`) | structure | verified | `libs/complaint/feature-details/src/lib/details.component.ts:35` and `libs/customer/feature-details/src/lib/details.component.ts:24`. |
| "`customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows" (`portal-complaints-customers.md:15`) | feature | verified | the eight `<th>` columns are at `libs/customer/feature-list/src/lib/list.component.ts:20-27` and `customer_uuids` is `Array(30)` (`apps/api/src/uuids.ts:3-4`). |
| the driven flows | feature | unverifiable | the option clicks, `Save` opening `/complaint/<id>/details`, `[POST] … => [201] Created`, the success toast, the customer link from contract details, and the "80 nodes measured in research/05-spikes.md" signal-graph size — need the portal dev server, its API and a browser session. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-contracts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`contract-list` table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email; 20 rows after a fresh API start" (`portal-contracts.md:8-9`) | integration | verified | the six `<th>` columns are at `libs/contract/feature-list/src/lib/list.component.ts:32-37` and `contract_uuids` is `Array(20)` (`apps/api/src/uuids.ts:6-7`). |
| "`contract-details` clicking a row opens `/contract/<id>/details` … and an `Edit` button"; "`contract-edit` `Edit` opens `/contract/<id>/edit`, heading `Contract Edit`" (`portal-contracts.md:9-14`) | structure | verified | the contract routes are `list`, `create`, `:id/edit`, `:id/details` (`libs/contract/routes/src/lib/routes.ts:9,15,21,27`); the details header is `title="Contract Details"` with `[showEditButton]="true"` (`libs/contract/feature-details/src/lib/details.component.ts:46-50`) and the edit page is `title="Contract Edit"` (`libs/contract/feature-edit/src/lib/edit.component.ts:42`). |
| "`contract-create` `/contract/create`: … heading `Contract Create`, `combobox \"Select customer\"` …" (`portal-contracts.md:48-51`) | structure | verified | `libs/contract/feature-create/src/lib/create.component.ts:41` is `title="Contract Create"`. |
| "Data comes from the API at `http://localhost:3000/api/contracts`" (`portal-contracts.md:5`) | integration | verified | `@Controller('contracts')` under the `api` prefix (`apps/api/src/contract/contract.controller.ts:15`, `apps/api/src/main.ts:28-29`). |
| "Snapshot shows `heading \"Contract Details Edit\"`" (`portal-contracts.md:39`) | structure | unverifiable | the header's own title is `Contract Details` plus an Edit button (`details.component.ts:46-50`); whether playwright's snapshot renders that heading as `"Contract Details Edit"` needs the running portal. |
| the driven edit/save and create/save flows, `[PUT] … => [200]` / `[POST] … => [201] Created`, the date-picker grid step, the random rows/names and the short numeric ids (`portal-contracts.md:41-58`) | feature | unverifiable | need the portal dev server, its API and a browser session. |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `/` redirects to `/home`, which shows four domain tiles | feature | verified | read the portal checkout: `path: ''` has `redirectTo: 'home'`, `path: 'home'` loads `HomeComponent` (`app.routes.ts:5-12`), and the component renders `<a routerLink="/contract/list">` … Contracts/Claims/Complaints/Customers (`home.component.ts:16-53`) — `portal-navigation.md:4,11` |
| each home tile is a real link to `/<domain>/list` | feature | verified | read `<a routerLink="/contract/list">`, `/claim/list`, `/complaint/list`, `/customer/list` (`home.component.ts:16,26,37,49`) |
| sidebar has `List` and `Create` per domain, `List` only for Customer, plus a `Home` entry | feature | verified | read `routes: [listMetaData, createMetaData]` for contract/claim/complaint and `routes: [listMetaData]` for customer, General → Home (`sidebar.component.ts:76-101`) |
| sidebar entries are a `div` with `routerLink`, not a link | feature | verified | read `<div [routerLink]=… [routerLinkActive]=…>` (`sidebar.component.ts:46-65`) |
| only the group headings are upper-cased, through the `capitalize` pipe, which calls `toUpperCase` | feature | verified | read `{{ config.domain \| capitalize }}` (`sidebar.component.ts:38`) and `return value.toUpperCase();` (`libs/shared/ui-pipes/src/lib/capitalize.pipe.ts:9`) |
| unknown paths render `Page Not Found` and "Sorry, but the page you were trying to view does not exist." | structure | verified | read `<h1>Page Not Found</h1>` / `<p>Sorry, but the page you were trying to view does not exist.</p>` (`page-not-found.component.ts:7-8`) reachable through the `path: '**'` route (`app.routes.ts:32-36`) |
| the domain routes carry `canMatch` feature-flag guards | config | verified | read `canMatch: [featureFlagGuard('contract-list')]` (`libs/contract/routes/src/lib/routes.ts:10,16,22,28`) |
| the contract route list is `/contract/list`, `/contract/create`, `/contract/:id/edit`, `/contract/:id/details` | structure | verified | read `path: 'list' \| 'create' \| ':id/edit' \| ':id/details'` under `path: 'contract'` (`app.routes.ts:13-17`, `libs/contract/routes/src/lib/routes.ts:9,15,21,27`) |
| the header link is `https://www.ng-journal.com` and the shell is `<ng-journal-root>` | integration | verified | read `href="https://www.ng-journal.com"`, `selector: 'ng-journal-root'` (`app.component.ts:9,20`) |
| the recipes use `node $S up --target portal` / `doctor --target portal` | command | verified | the `portal` target and its doctor exit codes exist (`control.mjs:178-220,1898-1910`) |
| `snapshot --filename=home.yml` shows `heading "Home" [level=1]` and the tile/link roles | structure | unverifiable | needs the portal served (API 3000 + app 4507) and a playwright-cli snapshot |
| the sidebar role/name queries (`getByRole('navigation')…filter({hasText:'CLAIM'})`) and the resulting `/claim/create` URL | feature | unverifiable | needs a driven browser session |
| `__ngc.router()` holds the four contract routes after a visit, and `doctor` exits 0 leaving the page on `/home` | command | unverifiable | needs a running app and the skill's own session |
| the last node of a snapshot is the overlay's `button "Toggle Pangular Inspector"` | feature | unverifiable | needs the running page; the button lives in `@pangular-inspector/devtools`, outside this repository |
| "every flag is on" (so the feature-flag fall-through is not driven) | config | unverifiable | needs the running app's flag values |

## Doc: .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the zoneful worktree exists at that path and is an isolated git worktree | structure | verified | read `.git` there is a 151-byte file `gitdir: …/worktrees/HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful`, and `git worktree list` shows it `9767523 (detached HEAD)` — `portal-zoneful-worktree.md:6-9,12-14` |
| the pin `git -C <path> rev-parse HEAD` prints `976752389c22bb563d2278c2d78f423cb2505669` | config | verified | ran `git -C D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful rev-parse HEAD` → `976752389c22bb563d2278c2d78f423cb2505669` |
| Angular 20.3.35 installed while `package.json` asks `@angular/core ^20.3.29` | structure | verified | read `"@angular/core": "^20.3.29"` and `node_modules/@angular/core/package.json` `"version": "20.3.35"` (`package.json:12` in the worktree) |
| `zone.js ^0.16.2` installed | feature | verified | read `"zone.js": "^0.16.2"` and installed `0.16.3` (satisfies the range) (`package.json:28` in the worktree) |
| the build polyfills `["zone.js"]` | feature | verified | read `"polyfills": ["zone.js"],` (`apps/insurance-portal/project.json:16` in the worktree) |
| `apps/insurance-portal/src/app/app.config.ts` names no change-detection provider | config | verified | read the file: no `changeDetection`, `provideZoneChangeDetection` or `provideZonelessChangeDetection` line |
| the derived app port is 4509 (slot 9, `4500 + slot`) | config | verified | ran the script's own hash formula (`slotOf`: sha1 of the lower-cased folder, 1-99) over the worktree path → slot 9 → 4509 (`control.mjs:185,294-304`) |
| the API is on the fixed 3000 | integration | verified | read `PORTAL_API_PORT = 3000` and the `api` port row `kind: 'fixed'` (`control.mjs:101,187-192`) |
| the `change-detection-mode` line reads `zone-based (NgZone provider: NgZone); zone.js loaded; mark_feature_usage: …`, and a `useClass: NoopNgZone` record reads `zoneless` | feature | verified | read `cdMode` (NoopNgZone → `zoneless`, other → `zone-based`) and the doctor's detail string (`control.mjs:624-629,1862-1865`) |
| the last `NgZone` provider record is the app's, which is why the doctor reads the last one | feature | verified | read `records.findLast((r) => r.token?.name === 'NgZone')` and its `useFactory → 'NgZone'` fallback (`ng-inspect.js:128-138`) |
| the record list has `ChangeDetectionScheduler` `useExisting ChangeDetectionSchedulerImpl`, an `NgZone` `useClass fn:NoopNgZone`, then the `NgZone` `useFactory fn:ngZoneFactory` beside `NgZoneChangeDetectionScheduler` and `ZoneStablePendingTask` | feature | verified | read the capture `research/raw/zone-mode-portal-zonejs.json` (environment injector `zoneRecords`), which shows exactly that order |
| `info --json` prints `slot` and `ports` naming the app port as derived and the API as fixed | command | verified | read `info()` spreading the recorded state and the port rows (`control.mjs:1913-1917,181-200`) |
| `--dir` (or `CONTROL_NG_PORTAL_DIR`) selects which checkout is served | structure | verified | read `const dirFlag = flag('dir')` and `dir: process.env['CONTROL_NG_PORTAL_DIR'] \|\| PORTAL_DEFAULT_DIR` (`control.mjs:1477,179,1984`) |
| the `up --target portal --dir <path>` run's own header line `> nx run insurance-portal:serve:development --port=4509` in `<evidenceDir>/app.log` | command | unverifiable | needs the portal started (nothing was started) |
| `doctor` exits 0 and prints the `angular-root` line with 20.3.35 | command | unverifiable | needs the served portal, the API on 3000 and a browser |
| `__ngc.injectors(...)` / `__ngc.providers(..., <i>)` on the running page print that record list | integration | unverifiable | needs a live page (`__ngc` installed by a session) |
| the 2026-11-08 behavioural capture (zone-hosted `setTimeout` ticked `applicationRef._tick` 2×, `Zone.root` 0×) | config | unverifiable | it is recorded in `features/.proven.json`, but re-taking it needs a browser and the app |

## Doc: .commandcode/skills/control-angular-dev-app/features/ssr.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the SSR fixture is served at `http://localhost:4223/` | integration | verified | read the `ssr` target's slot-0 port (`slot === 0 ? 4223 : 4400 + slot`) (`control.mjs:156-165`) |
| `ssr-check.js` lives at `.commandcode/skills/control-angular-dev-app/scripts/ssr-check.js` | structure | verified | the file exists |
| six checks named `server-html-ngh`, `server-html-transfer-state`, `dev-build-after-hydration`, `hydration-counters`, `no-mismatch-on-default-route`, `expected-mismatch-detected`, `ok` true only when all six pass | config | verified | read the results table and `ok: checks.every((c) => c.status === 'pass')` (`ssr-check.js:114-159`) |
| `ssr-check.js` returns `ok: false` without throwing | structure | verified | read the return object; no throw path after the checks (`ssr-check.js:158-163`) |
| `/api/items` is fetched during the server render and the server logs `[api] GET /api/items` with the user agent | integration | verified | read `app.get('/api/items', …)` and `console.log(\`[api] GET /api/items … ua=${req.headers['user-agent']}\`)` (`spikes/ng222-ssr/src/server.ts:18-19`) |
| `?mismatch=1` is a structural mismatch and `?mismatch=text` a text-only one | feature | verified | read the fixture comments and template (`mismatch.ts:3-8`) |
| `?transfer=0` turns the HTTP transfer cache off | feature | verified | read `transferCache: this.transfer() !== '0'` (`data-list.ts:22`) |
| the three routes and their render modes (`/` ssr, `/prerender`, `/client`) with nav links `Server route`/`Prerender route`/`Client route` and a `Render mode: …` heading | structure | verified | read `app.routes.server.ts:4-6` (`Server`/`Prerender`/`Client`), `app.routes.ts:5-7`, `app.html:2-4`, `page.ts:11` |
| the page holds an `Early click` button with its count and a `@defer (hydrate on interaction)` block with a `Deferred click` button | structure | verified | read `<button …>Early click</button>`, `Early clicks: {{ clicks() }}`, `@defer (hydrate on interaction)`, `<button …>Deferred click</button>` (`page.ts:11-21`, `deferred.ts:6-7`) |
| the server HTML carries `ngh` attributes, `<!--nghm-->`, `<script id="ng-state">`, the event-dispatch script and `ng-server-context="ssr"` | feature | unverifiable | needs the SSR app started (`up --target ssr`) and a `page.request.get` |
| hydration counters (`hydratedComponents` 4, `hydratedNodes` 40, no other status) and the `ngh`-attribute removal | feature | unverifiable | needs a browser run of the probe |
| `window._ejsas.ng.q` queues an early click and `Early clicks: 1` after hydration | feature | unverifiable | needs `ssr-event-replay.js` run against a browser |
| the defer block's states (`initial`/`dehydrated` → `complete`/`hydrated`, triggers `["hydrate on interaction", "on idle"]`) and `Deferred clicks: 1` | feature | unverifiable | needs a driven page |
| `/client` is the bare shell with `<body ngcm>` | feature | unverifiable | needs `ssr-render-modes.js` run against the served app |

## Doc: .commandcode/skills/control-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs` and the commands are `install\|uninstall\|status\|up\|doctor\|attach\|panel\|coexist\|info\|down` | structure | verified | read the `COMMANDS` map and `HELP` (`control.mjs:2236-2257`) |
| the extension id is `ienfalfjdbdpebioblfackkekamfmbnh` and the store page is `https://chromewebstore.google.com/detail/<id>` | integration | verified | read `EXT_ID` and `STORE_URL` (`control.mjs:108-110`) |
| supported browsers are `chrome`, `chrome-beta`, `edge`, `edge-dev` plus `test` | feature | verified | read `BROWSER_VALUES` and `BROWSERS` (`control.mjs:122-143,159`) |
| "Chrome for Testing 156.0.8078.4, revision 1248, read from `node_modules/playwright-core/browsers.json`" | structure | verified | read that file: chromium `"revision": "1248"`, `"browserVersion": "156.0.8078.4"` |
| main checkout session `ngdt`, CDP 9420; worktree session `ngdt-wt-<hash>`, CDP `9420 + slot` in 9421-9499 (slot 1-79) | feature | verified | read `flowIdOf` (`wt-<sha1[:6]>`), `SESSION`, `MAIN_CDP_PORT`, `slotOfFlow` (`control.mjs:323-343,377`) |
| `up` tries 10 slots in all | feature | verified | read `SLOT_TRIES = 10` (`control.mjs:332`) |
| profile `tmp/control-angular-devtools/profile/main`, config `tmp/control-angular-devtools/state/<flow>.cli.config.json` | command | verified | read `TMP`, `PROFILE`, `configPath` (`control.mjs:113,379,1610`) |
| the doctor prints `map-fresh`, `process`, `tree`, `ports`, `extension`, `app`, `connected-flag`, `devtools-window` | config | verified | read the doctor (`control.mjs:1789-1872`) |
| `install` copies the newest `<version>_0` folder from `%LOCALAPPDATA%\Microsoft\Edge Dev\User Data\Default\Extensions\ienfalfjdbdpebioblfackkekamfmbnh\` | config | verified | that folder exists with `1.22.0_0` and `1.22.1_0` (newest 1.22.1) |
| the `--config`/`launchOptions` schema is playwright-cli 0.1.21's | command | verified | ran `playwright-cli --version` → `0.1.21` |
| evidence goes to `tmp/control-angular-devtools/evidence/<yyyymmdd-hhmmss>/` | feature | verified | read `evidenceStamp`/`evidenceDir` (`control.mjs:1555-1559,1608`) and the existing folders (`20261107-211420`, `20261112-165527`) |
| the panel is driven with `Extensions.extensionServer.onShowPanel({command:'showPanel', …})` on the `devtools://devtools/bundled/devtools_app.html` target and read with `Runtime.evaluate` | command | verified | read those three call sites (`control.mjs:1097,1134,1087`) |
| `coexist` takes `[--component C] [--click "<locator>"] [--di-graph]` and defaults to `app-counter` / `getByRole('button', { name: 'Increment' })` | structure | verified | read `HELP` and `BOOL_FLAGS` (`control.mjs:157,2243`) |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" | structure | stale | asserted at `SKILL.md:198`, contradicted by `.commandcode/skills/control-angular-devtools/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`) |
| ready "when the CDP port lists the extension's `service_worker` target", measured 2.9-8 s | config | unverifiable | needs the harness started |
| the copy keeps `_metadata/` and loads with 0 manifest errors/warnings; the manifest's `key` keeps the store ID | config | unverifiable | needs loading the unpacked copy in a browser |
| "measured 2026-10-16 in the `verification-skills` worktree (`wt-423ece`, slot 10): a throwaway listener on 9430 moved the run to 9431" | feature | unverifiable | needs a run |
| `--auto-open-devtools-for-tabs` opens the DevTools window on Lars's desktop; the panel handles read from the live panel 1.22.1 (tab names, `.node-name`, `aria-label` `Start recording`) | feature | unverifiable | needs a desktop session and the live panel |
| opening `chrome-extension://<id>/index.html` in a tab fails with `TypeError: Cannot read properties of undefined (reading 'inspectedWindow')`, and `connectOverCDP` lists the extension frames with empty URLs | feature | unverifiable | needs a browser |
| `coexist` passes when the removed subscriber stops counting and DevTools recorded the cycles; `--di-graph` removes the template node from both | feature | unverifiable | needs the harness and the panel |

## Doc: .commandcode/skills/control-angular-devtools/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `S` is `.commandcode/skills/control-angular-devtools/scripts/control.mjs` | structure | verified | the file exists |
| the counter fixture is `spikes/ng222-app` at Angular 22.2.2 | feature | verified | read `spikes/ng222-app/node_modules/@angular/core/package.json` → `"version": "22.2.2"` |
| `control-angular-dev-app up --target counter` serves it and its `info` prints the URL | command | verified | read the `counter` target and `info()` spreading the state (`control-angular-dev-app/scripts/control.mjs:114-134,1913-1917`) |
| the harness commands are `node $S install`, `node $S up --app-url=<url>`, `node $S doctor`, `node $S status --browser <name>` | feature | verified | read `HELP`/`COMMANDS` (`control.mjs:2236-2257`) |
| the app page is driven in session `ngdt` | feature | verified | read `SESSION` (`control.mjs:377`) |
| the harness is headed | feature | verified | read `headless: false` in the launch options (`control.mjs:1636`) |
| evidence stays in `tmp/control-angular-devtools/evidence/`, git-ignored | feature | verified | read `.gitignore:7` (`tmp/control-angular-devtools/`) |
| the feature entry contract (H1, one paragraph, then `Sub-features`, `How to get to it (user POV)`, `Driving it with …`, `Gotchas`) | structure | verified | read the four feature files; each has those four H2s in that order |
| the full-sweep order install → attach → signal-graph → profiler matches the four feature files on disk | structure | verified | read the links and the folder listing |
| "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" | structure | unverifiable | that file is Angular DevTools source, not in this repository |
| "the scripted path uses DevTools frontend internals proven only in the test harness" and the manual-only Web Store confirmations | structure | unverifiable | need a browser and a person |

## Doc: .commandcode/skills/control-angular-devtools/features/attach.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the connected marker is `window.__NG_DEVTOOLS_CONNECTED__` and the doctor reports it as `connected-flag` | config | verified | read the page probe and the check (`control.mjs:1854,1862-1866`) |
| `node $S attach` is a command | command | verified | read `COMMANDS.attach` (`control.mjs:2252`) |
| `attach` requires `isDebugMode` and otherwise exits 1 | command | verified | read `attachOk` returning `!!(r.flag && d.isAngular && d.isDebugMode && r.backendInstalled && r.backendReady)` (`control.mjs:1882-1892`) |
| the measured result `flag true (set at ~50 ms); detection {…}; backendInstalled true; backendReady at ~950 ms; Angular 22.2.2` | config | unverifiable | needs the harness up on the counter fixture |
| `isSupportedAngularVersion` means major 12+ or 0 | feature | unverifiable | that rule lives in the DevTools bundle, not this repository |
| the content script gates on `isAngularDevTools`, `isAngular` and an HTML document, and the popup shows `production.html` (built 1.22.0 `app/content_script_bundle.js`) | structure | unverifiable | that bundle is inside the Edge Dev profile, outside this repository |
| the toolbar icon turns from grey to colour | feature | unverifiable | browser UI |

## Doc: .commandcode/skills/control-angular-devtools/features/install.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the store page is `https://chromewebstore.google.com/detail/ienfalfjdbdpebioblfackkekamfmbnh` | integration | verified | read `STORE_URL` (`control.mjs:110`) |
| the commands and flags are `install [--browser …] [--from …] [--profile P] [--timeout S]`, `uninstall`, `status` | command | verified | read `HELP` (`control.mjs:2237-2239`) |
| a test `uninstall` refuses while `up` runs | feature | verified | read `refuse('the test browser is up; run "down" first')` (`control.mjs:1520`) |
| the end-state doctor line is `extension: Angular DevTools <version> ENABLED (UNPACKED, …)`, and the newest folder in the Edge Dev profile is 1.22.1 | config | verified | read the doctor detail format (`control.mjs:1844-1849`) and the profile folders `1.22.0_0`, `1.22.1_0` |
| branded `status` reads installed state, version and `disable_reasons` from `<User Data>\<profile>\Extensions\<id>` and `Secure Preferences` → `extensions.settings.<id>` | config | verified | read the status reader (`control.mjs:1298-1314,1548`) |
| "Branded install, uninstall and reinstall are proven in Chrome Beta (2026-10-11, measured: install exit 0 …)" | command | unverifiable | needs Lars clicking the store's add/remove confirmations |
| "`chrome://` and `edge://` URLs passed on the command line open an empty window" | command | unverifiable | needs a branded browser |
| the extensions page toggle/Remove behaviour and "the extensions page is the authority" | feature | unverifiable | browser UI |

## Doc: .commandcode/skills/control-angular-devtools/features/profiler.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `node $S coexist` exists and defaults to `app-counter` with `getByRole('button', { name: 'Increment' })` | structure | verified | read `HELP` (`control.mjs:2243`) |
| `ɵsetProfiler` keeps a list of subscribers in Angular 22 and `ɵsetProfiler(null)` clears every one, while `ɵsetProfiler(cb)` returns a remover | feature | verified | read the installed Angular: `const profilerCallbacks = []`, `removeProfiler`, and `profilerCallbacks.length = 0` for `null` (`spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:136-154`) |
| the measured result `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles` | feature | unverifiable | needs the harness up with the panel recording |
| "DevTools' subscriber cannot be listed from the page (the list is module-private)" | feature | unverifiable | needs a live page |

## Doc: .commandcode/skills/control-angular-devtools/features/signal-graph.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `node $S panel signal-graph --component=app-counter` and `node $S panel screenshot` exist | structure | verified | read the panel subcommands (`control.mjs:1926,2242`) |
| the pane's nodes are `ng-signal-graph-pane .node-cont.kind-*` | feature | verified | read the `readSignalGraph` evaluate (`control.mjs:1165`) |
| the expected fixture graph `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`, and after `angular:di_graph` the pane `signal:count, effect:Effect` | feature | unverifiable | needs the live panel |
| the extra kinds `linked-signal`, `child-signal-prop`, `resource`, `unknown` | feature | unverifiable | they come from the extension's `signals-visualizer` source, not this repository (the string `child-signal-prop` appears nowhere in `control.mjs`) |
| "the pane re-reads the graph after change detection; `coexist --di-graph` clicks the app before the second read" | feature | unverifiable | the doc itself marks it inferred; needs a run |

## Doc: .commandcode/skills/control-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the MCP endpoint is `http://localhost:9999/__mcp` | integration | verified | read `mcpUrl: \`http://localhost:${p}/__mcp\`` (`control.mjs:1644`) |
| the portal is the standalone flow, reached through `/__pangular/` with target 9999 | feature | verified | ran `node …/control.mjs check --json` → `"mount": "standalone-cli"`, `proxy-target … "/__pangular -> http://localhost:9999"` |
| the pin is 0.0.7, declared exactly and installed | config | verified | ran `check --json` → `declared-exact … declares 0.0.7 (want exactly 0.0.7)`, `installed … node_modules has 0.0.7`; pin constant at `control.mjs:103` |
| the doctor's checks are `map-fresh`, `package-pinned`, `overlay-import`, `process-alive`, `tree`, `ports`, `mcp-origin-guard`, `mcp-initialize`, `read-only`, `browser-session`, `auth-code`, `dev-build`, `overlay-page-id`, `overlay-connected`, `console-errors` | config | verified | read the doctor body (`control.mjs:2009-2220`) |
| `mcp-origin-guard` passes when a POST without `Origin` gets 403 | feature | verified | read `noOrigin.httpStatus === 403 ? 'pass' : 'fail'` (`control.mjs:2061-2065`) |
| `read-only` passes when none of the eight action tools is listed | feature | verified | read `ACTION_TOOLS` (highlight, navigate, dispatch-ngrx-action, form-action, fill-form, set-http-rule, remove-http-rule, analog-call-api) and `readOnlyCheck` (`control.mjs:107-116,887-901`) |
| the server runs `bin.mjs dev --port 9999 --no-open --root <app> --read-only` through `__serve` | command | verified | read the spawn arguments (`control.mjs:1577-1622`) |
| a busy port refuses with `fixed port pangular 9999 held by PID <p>; pinned by …` | config | verified | read the refusal string (`control.mjs:1680`) |
| the state file is `tmp/control-pangular-inspector/state/pangular-<port>.json`, evidence `pangular-<port>-<timestamp>/` with `pangular.log`, session `pangular-<port>` | config | verified | read those paths (`control.mjs:100,1548,1605-1607,1647`) and the existing folders `pangular-9999-2026-11-13T01-12-39-702Z` |
| every feature is recorded as `external` | feature | verified | ran `fingerprint.mjs check` → five `[OK] … external since faa978feed4f`, exit 0 |
| `components` falls back to the `component-tree` resource when 0.0.7 has no `list-components` | structure | verified | read the fallback with the notice "list-components is not in this version" (`control.mjs:2238-2275`) |
| "`…/scripts/control.mjs:74` defaults to 9999" | feature | stale | asserted at `SKILL.md:42`, contradicted by `control.mjs:74` (a `State` typedef line, `@property {string} mcpUrl`); the default is `const DEFAULT_PORT = 9999` at `control.mjs:104` |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" | structure | stale | asserted at `SKILL.md:206`, contradicted by `.commandcode/skills/control-pangular-inspector/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`) |
| "With `--read-only`, 0.0.7 lists 46 tools" | feature | unverifiable | needs the devtools server started (`node $S tools` needs a live MCP endpoint) |
| "The standalone server listens on `[::1]:9999`; the proxy target `http://localhost:9999` reaches it" | integration | unverifiable | needs the server running and a listener check |
| "npm 11.16 drops 27 entries from the committed lockfile on any install" | feature | unverifiable | needs an `npm install` in the portal (a change to the app) |
| "`process.exit` while a `fetch` keep-alive socket is open crashed Node 24 on Windows … (exit 127)" | feature | unverifiable | needs a repro run |
| the measured ready times (2.2 s for MCP `initialize`, 17-20 s for the portal) | feature | unverifiable | need runs |

## Doc: .commandcode/skills/control-pangular-inspector/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `S` and `D` name the two control scripts | feature | verified | both files exist |
| "`node $S check` exits 0 (pin, overlay import, proxy)" | command | verified | ran `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs check --json` → `"ok": true`, six checks, exit 0 |
| "`node $D up --target portal` (API 3000, app 4507 for the default portal folder)" | command | verified | read the portal target (API `kind: 'fixed'` 3000, app `4500 + slot`) and computed the default portal folder's slot with the script's own hash → slot 7 → 4507 (`control-angular-dev-app/scripts/control.mjs:185-192,294-304`) |
| the session and evidence come from `node $S info`, session `pangular-9999` | feature | verified | read `session: \`pangular-${p}\`` and `info` spreading the state (`control.mjs:1647,2379-2382`) |
| tool names are given without the `pangular_` prefix | feature | verified | read `short()` used on every tool name (`control.mjs:888,1939,2194`) |
| action tools need `call … --confirm` (and `up --allow-actions`) | feature | verified | read `return ACTION_TOOLS.includes(short(name)) && !confirm` (`control.mjs:536`) |
| the feature entry contract (H1 + `Sub-features`, `How to get to it (user POV)`, `Driving it …` starting with `Preconditions:`, `Gotchas`) | structure | verified | read setup, live-inspection, navigation, source-scan, panel; each follows it |
| "the overlay reports about 250 ms after change detection, so read after the end state is visible" | feature | unverifiable | needs a live overlay |
| "Portal data is random per API start: assert on structure … not values" | integration | unverifiable | needs the API and portal running |
| "Setup claims (install, remove) are proven against git … saved next to the command output" | command | unverifiable | needs an install/remove run in the portal |

## Doc: .commandcode/skills/control-pangular-inspector/features/live-inspection.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| MCP over HTTP at `http://localhost:9999/__mcp` | integration | verified | read the state's `mcpUrl` (`control.mjs:1644`) |
| `components` / `list-components` "on versions after 0.0.7" | feature | verified | read the `list-components` lookup and the `component-tree` fallback for 0.0.7 (`control.mjs:2250-2275`) |
| `components --depth 3 --out …` flags exist | structure | verified | read the `components` options (`control.mjs:2279-2296`) |
| `window.__pangularPageId` is the id `list-pages` must show | feature | verified | read the doctor comparing `page.pageId` against the `list-pages` text (`control.mjs:2154,2191-2214`) |
| the tree `AppComponent <ng-journal-root>`, `SidebarComponent <ng-journal-sidebar>`, `ListComponent <ng-journal-list>`, `HeaderComponent`, `Table <p-table>` | structure | unverifiable | partially confirmed statically (`scan get-components --root apps/insurance-portal` returns AppComponent/`ng-journal-root` and SidebarComponent/`ng-journal-sidebar`), but the live tree needs the portal plus the devtools server |
| `inspect-component` → `ListComponent`, path `ng-journal-root > ng-journal-list` | structure | unverifiable | needs a live read |
| `inspect-signals` → a `template` node `ng-journal-list` and a `computed` node `contracts` | feature | unverifiable | needs a live read |
| `inspect-providers` → an element injector `ng-journal-list` with its `lookupPath` | feature | unverifiable | needs a live read |

## Doc: .commandcode/skills/control-pangular-inspector/features/navigation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the drive returns `http://localhost:4507/contract/list` | integration | verified | the app port is 4507 for the default portal folder (computed slot 7 of `4500 + slot`) and `/contract/list` is a real route (`libs/contract/routes/src/lib/routes.ts:9`), though the click itself was not driven (`control-angular-dev-app/scripts/control.mjs:185`) |
| the sidebar filter text `CONTRACT` is upper-cased by the `capitalize` pipe, and the entries are `div`s | feature | verified | read `{{ config.domain \| capitalize }}` and `<div [routerLink]>` (`sidebar.component.ts:38,46`) |
| `explain-navigation` with trigger `imperative`, `from /home`, `started by RouterLink div "List"`, lazy `contract`, `list` | feature | unverifiable | needs the portal, the devtools server and a driven click |
| the outcome vocabulary `succeeded`, `cancelled`, `redirected`, `failed`, `skipped`, `pending` | feature | unverifiable | tool output lives in the package; needs a server |
| `list-routes` "12 routes, measured" and `lint-routes` "one `info` finding, `missing-title`" | structure | unverifiable | needs a live MCP read |
| "`limit` defaults to 5 (at most 50)" and "the page keeps `limits.navigations` (50) entries" | feature | unverifiable | needs the package/live page |
| "a reload keeps the page id (it lives in `sessionStorage`) but starts an empty navigation list"; "`started by` appears only when the click came less than 2 s before" | feature | unverifiable | need a driven page |

## Doc: .commandcode/skills/control-pangular-inspector/features/panel.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the panel is at `http://localhost:4507/__pangular/` through the `ng serve` proxy | command | verified | ran `check --json`: `proxy-config … apps/insurance-portal/proxy.conf.json`, `proxy-target … http://localhost:9999`; the portal's `apps/insurance-portal/proxy.conf.json:2-7` rewrites `^/__pangular` away, and the app port is 4507 |
| the panel session is `pangular-9999` | feature | verified | read `session: \`pangular-${p}\`` (`control.mjs:1647`) |
| `Angular 22.2.2` is the portal's version | config | verified | ran `scan build-meta` → `"angularVersion": "22.2.2"`, and `node_modules/@angular/core` in the portal checkout is 22.2.2 |
| "The dashboard's source counts are 0 in this Nx workspace" | structure | verified | ran `scan get-components` at the workspace root → `[]` |
| the panel title `Pangular Inspector`, the eight tab names, `LIVE`, `Agent`/`Read-only`, and the floating button's accessible name `Toggle Pangular Inspector` | feature | unverifiable | need the panel open in a browser |
| "the doctor has answered the one-time-code prompt in this session" | feature | unverifiable | needs the server and a browser session |
| "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" | feature | unverifiable | needs the running devtools server |

## Doc: .commandcode/skills/control-pangular-inspector/features/setup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `setup.check` is "six read-only facts, one line each" | feature | verified | ran `check --json` → six checks (`declared-exact`, `installed`, `overlay-import`, `dev-guard`, `proxy-config`, `proxy-target`) (`control.mjs:844-875`) |
| "`node $S check` -> six `[OK]` lines, exit 0" | command | verified | ran `node .commandcode/skills/control-pangular-inspector/scripts/control.mjs check` → exit 0, all six `pass` |
| the pin is exact in `devDependencies` | config | verified | ran `check --json` → `declared-exact … declares 0.0.7 (want exactly 0.0.7)` |
| `remove` restores the managed files from git `HEAD`, deletes untracked ones, prunes `node_modules` and is `ok` only when the tree is clean | structure | verified | read `git checkout HEAD --`, `rmSync` for untracked, `npm install`, `ok: left.length === 0 && !diff` (`control.mjs:1492-1531`) |
| "Remove: … `gitStatus: []`, `gitDiffStat: ""`" matches the fields the command prints | command | verified | read `gitStatus: left`, `gitDiffStat: diff` and the exit condition `left.length === 0 && !diff ? 0 : 1` (`control.mjs:1527-1541`) |
| "The setup is not committed in the portal checkout (its `git log` holds no commit for it)" | command | stale | asserted at `setup.md:31`, contradicted by `package.json:53` in that checkout (`"@pangular-inspector/devtools": "0.0.7"`): `git -C <portal> log --oneline -S'@pangular-inspector'` prints `f102b97 build(insurance-portal): add Pangular Inspector for development`, an ancestor of HEAD (`git merge-base --is-ancestor f102b97 HEAD` exit 0) whose stat touches `package.json`, `package-lock.json` (457 insertions), `main.ts`, `project.json`, `proxy.conf.json` |
| "`install --json` -> `changed` lists package.json, package-lock.json, main.ts, project.json, proxy.conf.json`" and "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" as a live run | command | unverifiable | needs an install in a clean worktree (the 457 count does match the committed `f102b97` stat) |
| "`npm exec -- nx run insurance-portal:typecheck` exits 0 with the overlay import" | command | unverifiable | needs an Nx run in the portal |

## Doc: .commandcode/skills/control-pangular-inspector/features/source-scan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Workspace root: `node $S scan get-components` -> `[]`" | structure | verified | ran it → `"text":"[]"`, exit 0 |
| "App root: `node $S scan get-components --root apps/insurance-portal` -> `AppComponent`, `HomeComponent`, `PageNotFoundComponent`, `SidebarComponent`" | feature | verified | ran it → exactly those four, exit 0 |
| that run's stderr warning that the folder "has no `angular.json` … so the source scans find nothing" | structure | verified | ran it → `[pangular] … has no angular.json and no package.json that depends on @angular/core, so the source scans find nothing` |
| "`build-meta` -> Angular `22.2.2`, project `@ng-journal/source`, TypeScript `6.0.3`, `ssr: false`" | feature | verified | ran `node $S scan build-meta` → `{"angularVersion":"22.2.2","projectName":"@ng-journal/source","typescript":"6.0.3","ssr":false,…}` |
| `scan <tool>` starts the stdio server, calls one tool and stops it | feature | verified | ran three `scan` invocations, each exited 0 |
| the stdio tool list holds `get-routes`, `get-components`, `get-signals`, `get-providers`, `get-pipes`, `get-ngrx-store`, `build-meta`, `explain-render-mode`, `lint-pipes`, `explain-pipe` and the `analog-*` tools, and `scan nope` prints it | structure | verified | ran `node $S scan nope` → `no source tool nope; stdio has: get-routes, get-components, get-pipes, get-signals, get-providers, get-ngrx-store, build-meta, explain-render-mode, lint-pipes, explain-pipe, analog-routes, analog-explain-url, analog-server-functions, analog-api-routes, analog-render-modes, analog-prerender-plan, analog-content, analog-lint, devframe_state_read` (exit 2) |
| results with `--out` land in `tmp/control-pangular-inspector/scan/` | feature | verified | read `save({ evidenceDir: path.join(SCRATCH, 'scan') }, result)` (`control.mjs:2375`) |
| "The stdio server lists no page tools (`inspect-*`, `list-pages`)" | feature | unverifiable | needs a `tools/list` against the stdio server (the `scan` command reads only the usage list) |
| "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json` (only `build-meta` reads it)" | structure | unverifiable | needs the CLI's scanning code, which is in the installed package, not this repository |

## Doc: .commandcode/skills/control-vitest-browser-angular/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the default attach instance is `chrome-beta-gemma4` and control-ai-browsers owns its CDP port | config | verified | read `.commandcode/skills/control-ai-browsers/instances.json`: `chrome-beta-gemma4` exists with `"port": 9334` |
| bundled mode uses Playwright's Chromium (Chrome for Testing 153) | feature | verified | read `spikes/ng222-app/node_modules/playwright-core/browsers.json` → chromium `"browserVersion": "153.0.8010.12"` (playwright 1.63.0) |
| main-checkout ports Vitest 51315 and bundled CDP 9350; a worktree takes `51400 + slot` / `9500 + slot`, apart from 9420-9499 | config | verified | read `MAIN_VITEST_PORT`, `MAIN_BUNDLED_CDP_PORT` and the two `at:` formulas (`control.mjs:151-177`) |
| `up` tries 10 slots | feature | verified | read `SLOT_TRIES = 10` (`control.mjs:341`) |
| the session is `control-vitest-<flowId>-<Vitest port>` | config | verified | read `session: \`control-vitest-${flowId}-${vitestPort}\`` (`control.mjs:1297`) |
| underneath it runs `ng test -c attach --watch` (`-c extension` for bundled) through `control.mjs __serve` | command | verified | read `testArgs` (`control.mjs:828-842`) |
| the binary is `spikes/ng222-app/node_modules/@angular/cli/bin/ng.js` | command | verified | the file exists |
| the doctor's checks are `map-fresh`, `process-alive`, `tree`, `ports`, `test-run`, `browser-cdp`, `orchestrator-tab`, `tester-frame`, `dev-build`, `vitest-runner`, `mounted-component`, `language-model`, `extension-loaded` | config | verified | read the doctor body (`control.mjs:1551-1708`) |
| `up` takes `--instance`, `--bundled`, `--extension`, `--hold`, `--timing-demo`, `--filter`, `--port`, `--timeout` (default 180 s) | command | verified | read the usage line and option parsing (`control.mjs:236-237,1874`) |
| the state file is `tmp/control-vitest-browser-angular/state/<flowId>.json` and evidence `<flowId>-<timestamp>/` | structure | verified | read `SCRATCH`, `STATE_DIR`, `evidenceDir` (`control.mjs:117-118,1285`) |
| attach mode loads the extension with `Extensions.loadUnpacked`; bundled mode passes `--load-extension` | feature | verified | read the CDP call (`control.mjs:1349`) and `vitest-extension.config.mts` |
| `vitest-base.config.mts` sets the browser port from a plugin on the project that has `test.name`, because `test.api` at the root would also start the API server on that port | integration | verified | read `VITEST_BROWSER_PORT` default 51315, the `config.test?.browser?.enabled \|\| !config.test.name` guard and the `test: { api: { … strictPort: true } }` return (`vitest-base.config.mts:7,13-18`) |
| `vitest-attach.config.mts` sets `persistentContext` to `browser.contexts()[0]` | config | verified | read `this.persistentContext ??= this.browser.contexts()[0];` (`vitest-attach.config.mts:20`) |
| shared code is `spikes/probes/vitest-lib.mjs` | structure | verified | the file exists |
| "Every other script has a `node:test` file beside it (`*.test.mjs`)" | structure | stale | asserted at `SKILL.md:221`, contradicted by `.commandcode/skills/control-vitest-browser-angular/scripts/text.mjs:1`, which has no `text.test.mjs` beside it (the folder holds only `control.test.mjs` and `fingerprint.test.mjs`) |
| the ready-time measurements (5.2 s, 19.3 s, 9.9 s, 4.4 s, 21.6 s) | feature | unverifiable | need runs |
| "`window.ng`: 23 functions" in the tester iframe | feature | unverifiable | needs a run |
| "`LanguageModel` in attach mode (Gemma 4 answered a prompt from the tester iframe)" | feature | unverifiable | needs the model and a browser |
| "a DevTools panel reaches the tester iframe with `chrome.devtools.inspectedWindow.eval(expr, { frameURL })`" | feature | unverifiable | needs a loaded extension and a DevTools session |
| "Chrome 137+ branded builds ignore `--load-extension`" | feature | unverifiable | needs a branded browser |
| the 250 ms exit wait against the Node-on-Windows fetch assertion (exit 127) | feature | unverifiable | needs a run |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --hold 90000`, then `node $S doctor` exits 0" by exit-code contract | command | verified | read the `up` usage and `--hold` parsing, and the doctor's `0 / 1` return (`control.mjs:1874,236,1712`) |
| `mounted-component` passes only while the hold test runs and `[WARN]`s otherwise | structure | verified | read `page.host ? 'pass' : 'warn'` with "no test is running (start with --hold …)" (`control.mjs:1676-1682`) |
| the held Counter's fresh state is `Clicks: 3 (double 6, cart 2)` with `CartService` overridden to `['pear', 'plum']` | feature | verified | read the spec's hold test (`setup({ cartItems: ['pear', 'plum'] })`) and `count = signal(3)` (`spikes/ng222-app/src/app/counter.spec.ts:61`, `spikes/ng222-app/src/app/counter.ts:26`) |
| never attach to a browser outside `control-ai-browsers/instances.json` | config | verified | that file exists and lists the instances |
| `ui: false` in both runner configs | config | verified | read `ui: false` in `vitest-attach.config.mts` and `vitest-extension.config.mts` |
| the feature entry contract (H1 + the four H2s in order) | structure | verified | read `counter-tests.md` and `extension-in-tester.md`; both follow it |
| a re-run is a `touch` of the spec and a `RERUN` line in `ng-test.log` | feature | verified | an archived run logs `RERUN  src/app/counter.spec.ts x1` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-10-18T22-40-03-915Z/ng-test.log:48`) |
| "The verdict, the baseline in a second worktree and the repeat runs come from /lars-verify" | feature | unverifiable | that is another tool's procedure, not checkable here |
| "one browser instance at a time … a baseline (in its worktree, with its own derived Vitest port) and its change run one after the other" | config | unverifiable | needs runs |
| the `f1e4` snapshot refs and `page.frame('vitest-iframe')` reads | feature | unverifiable | need a driven run |
| "The Angular DevTools extension: not loaded into these browsers" | feature | unverifiable | needs a run to list the profile's extensions |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `counter.spec.ts` renders `Counter` with `vitest-browser-angular`'s `render()` | structure | verified | read `import { render } from 'vitest-browser-angular'` and `await render(Counter, …)` (`counter.spec.ts:3,12`) |
| two tests always run and two more run only when their env var is set | config | verified | read two `it(…)` and two `it.runIf(…)` (`counter.spec.ts:20,30,39,56`) |
| the timing demo fails with `expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'` | feature | verified | an archived timing-demo run logs exactly `AssertionError: expected 'Clicks: 3 (double 6, cart 1)' to contain 'Clicks: 4'` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-10-18T22-40-03-915Z/ng-test.log:20`) |
| the hold test keeps the Counter mounted for `VITE_COUNTER_HOLD_MS` | feature | verified | read `it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)(…, Number(…)+30_000)` (`counter.spec.ts:56-75`) |
| failure screenshots land under `spikes/ng222-app/.vitest/attachments/failure-screenshots/` | feature | verified | the folder exists with `counter.spec.ts/Counter---shows-the-next-count-in-the-same-task-as-the-click--fails-on-purpose-.png` |
| "No run recorded (`node $S info` exits 2 with "no state file")" | command | verified | ran `node …/control.mjs info` → exit 2, `"reason": "no state file in …: nothing was started by this skill (run up first)"` |
| `tests-pass` "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" and "`test-run` reports `last summary: Tests  2 passed \| 2 skipped (4)`" | config | stale | asserted at `counter-tests.md:11,29`, contradicted by the second spec the same builder config picks up: `spikes/ng222-app/src/app/stale-view-fixture.spec.ts:1-4` (`describe('StaleViewFixture'`), which the newest attach-mode run reports as `Tests 2 failed \| 2 passed \| 2 skipped (6)` (`tmp/control-vitest-browser-angular/chrome-beta-gemma4-2026-11-13T01-16-58-757Z/ng-test.log:77`) |
| "`test-run` passes on a failing test on purpose: it checks the run, not the results" as a live observation | feature | unverifiable | the code agrees (`testRunCheck` passes on `RUN_STARTED` without "An exception occurred", `control.mjs:727-745`), but the log evidence needs a run |
| "`up --hold <ms> --filter "keeps the counter mounted"` … without `--hold` the same filter reports `4 skipped (4)`" | feature | unverifiable | needs a run (and the count would now include the second spec) |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`node $S up --extension extension --hold 90000` (the repository's `extension/`)" | command | verified | `extension/` exists with `manifest.json`, and both flags are accepted (`control.mjs:1874`) |
| `ext-loaded` is the doctor's `extension-loaded`, which passes when the extension's service worker target exists | integration | verified | read the check (`control.mjs:1695-1708`) |
| `[SKIP]` without `--extension` | command | verified | read `add('extension-loaded', 'skip', 'no --extension given to up')` (`control.mjs:1708`) |
| in attach mode `down` uninstalls the extension and notes `uninstalled extension <id>` | feature | verified | read `Extensions.uninstall` and `notes.push(\`uninstalled extension ${state.extension.id}\`)` (`control.mjs:1791-1792`) |
| "`LanguageModel` is `available` in the tester iframe (attach mode) and not in bundled mode" | feature | unverifiable | needs Chrome Beta with the model plus a run |
| "The repository's `extension/` does not inject there (measured 2026-11-12: no execution context from its origin in the tester iframe)" | feature | unverifiable | its manifest matches `<all_urls>` (`extension/manifest.json` content_scripts), so only a run can show the absence |

## Doc: .commandcode/skills/control-vitest-browser-angular/features/held-counter.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the hold test renders `Counter` with `CartService` overridden to `['pear', 'plum']`, clicks Increment once halfway and checks the count rose by one | feature | verified | read `spikes/ng222-app/src/app/counter.spec.ts:56-74` (`it.runIf(Number(import.meta.env.VITE_COUNTER_HOLD_MS) > 0)`, `setup({ cartItems: ['pear', 'plum'] })` at `:61`, `await incrementButton.click()` at `:65`) (`held-counter.md:3`) |
| during the hold the page shows `Clicks: 3 (double 6, cart 2)` and an Increment button | feature | verified | read `tmp/control-vitest-browser-angular/held-before.yml:3-4` (`paragraph [ref=f1e3]: "Clicks: 3 (double 6, cart 2)"`, `button "Increment" [ref=f1e4]`) (`held-counter.md:5`, `:31`) |
| `up --hold <ms>` is a real subcommand | command | verified | read `…/control-vitest-browser-angular/scripts/control.mjs:1874` (`usage: control.mjs <up\|doctor\|info\|down> … [--hold <ms>]`), validation at `:268-275`, `VITE_COUNTER_HOLD_MS` set from `--hold` at `:802-803` (`held-counter.md:27`) |
| `doctor` has a `mounted-component` check that explains a missing `[ng-version]` host | config | verified | read `control.mjs:1677-1681` (`held-counter.md:27`) |
| the host carries `ng-version="22.2.2"` | config | verified | read `spikes/ng222-app/node_modules/@angular/core/package.json:3` (`"version": "22.2.2"`) (`held-counter.md:6`) |
| the probe file exists and has the `'mount'`/`'after'` phases | structure | verified | read `spikes/probes/vitest-iframe-probe.js` (5669 bytes; `if (phase === 'after')` at `:19`, profiler install at `:146-155`) (`held-counter.md:37`) |
| `ng.ɵgetSignalGraph`, `ɵgetDependenciesFromInjectable`, `ɵsetProfiler`, `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath` all exist in the installed typings | integration | verified | read `spikes/ng222-app/node_modules/@angular/core/types/core.d.ts` (`?getSignalGraph(injector: Injector): DebugSignalGraph;`, `?setProfiler(profiler: Profiler \| null): () => void;`, etc.) (`held-counter.md:13`, `:15`, `:17`) |
| `ng.ɵgetInjectorProviders` refusal message contains "only supports NodeInjector and EnvironmentInjector" | integration | verified | read `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12312` (`throwError('getInjectorProviders only supports NodeInjector and EnvironmentInjector')`) (`held-counter.md:48`) |
| the tester frame is named `vitest-iframe` | feature | verified | read `spikes/ng222-app/node_modules/@vitest/browser-playwright/dist/index.js` (frame name string present) (`held-counter.md:22`) |
| the signal-graph edge list (`template div -> title, count, double, unnamed items`, `double -> count`, `effect -> count`) | feature | unverifiable | needs a browser run of the probe inside the tester frame |
| the `held-after.json` payload `{"text":"Clicks: 4 (double 8, cart 2)Increment","count":4,"cart":["pear","plum"]}` | structure | unverifiable | needs a live drive; no `held-after.json` exists in the tree |
| the host element id `rootN` and "`<app-counter>` does not exist under TestBed; select `[ng-version]`" | config | unverifiable | needs the running tester frame; the id generator is not in the installed packages I could read |
| the held-di resolution path (`element -> DynamicTestModule -> Platform: core -> null`) | structure | unverifiable | needs a browser evaluate of `ɵgetInjectorResolutionPath` |
| the attach-mode profiler observation (only event ids 6 and 7 in two runs on 2026-10-16 vs 12 events over CDP) | feature | unverifiable | needs an attached browser and a re-run |
| "`doctor` exits 0" | command | unverifiable | needs a browser, a dev server and a running hold |

## Doc: .commandcode/skills/link-workspace-packages/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the package-manager branch the doc tells you to take resolves to npm | feature | verified | read root `package.json` (no `packageManager` field) and the root listing (`package-lock.json` present, no `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `bun.lockb`) (`SKILL.md:12`, `:19`) |
| root `package.json` declares `"private": true` | structure | verified | read `package.json:2` (`SKILL.md:127`) |
| the doc's `package.json` result shapes are npm/pnpm/yarn/bun syntax only, with no claim about this repo's `workspaces` field; root `package.json` has none | structure | verified | `SKILL.md:68-74` |
| `pnpm add @org/ui --workspace` and `pnpm add @org/ui --filter @org/app --workspace` (`SKILL.md:36`, `:39`) | structure | unverifiable | pnpm is installed, but running either writes `package.json`, and the workspace has no `pnpm-workspace.yaml` |
| `npm install @org/ui --workspace @org/app` (`SKILL.md:71`) | command | unverifiable | needs an npm-workspace repo to exercise; this repo has no `workspaces` field, and the command writes |

## Doc: .commandcode/skills/monitor-ci/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "this repository's `nx.json` contains neither" (`nxCloudId`/`nxCloudAccessToken`) | structure | verified | read `nx.json` in full; its only keys are `analytics`, `targetDefaults`, `plugins` (`@nx/playwright/plugin`), `generators` (`SKILL.md:43`) |
| both deterministic scripts exist | structure | verified | read `scripts/ci-poll-decide.mjs` and `scripts/ci-state-update.mjs` under the skill dir (`SKILL.md:57`, `:58`) |
| `ci-poll-decide.mjs` takes `<ci_info_json> <poll_count> <verbosity>` plus the documented flags | structure | verified | read `scripts/ci-poll-decide.mjs:14-19` (usage block) and `:32` (`const verbosity = args[2] \|\| 'medium'`) (`SKILL.md:201-215`) |
| `--timeout`/`--new-cipe-timeout` are passed in minutes and converted to seconds, and `--elapsed-seconds` is the authoritative budget signal | command | verified | read `ci-poll-decide.mjs:21-24`, `:48-53` (`SKILL.md:217`) |
| `ci-state-update.mjs cycle-check --code … --agent-triggered --cycle-count --max-cycles --env-rerun-count` | config | verified | read `scripts/ci-state-update.mjs:12`, `:121-124` (`SKILL.md:298`) |
| the `post-action` action-type list | feature | verified | read `ci-state-update.mjs:86-93` (`fix-auto-applying`, `apply-mcp`, `env-rerun`, `apply-local-push`, `reject-fix-push`, `local-fix-push`, `auto-fix-push`, `empty-commit-push`) (`SKILL.md:290`) |
| `--max-cycles` default 10 | config | verified | read `ci-state-update.mjs:123` (`parseInt(getArg('--max-cycles') \|\| '10', 10)`) (`SKILL.md:26`) |
| circuit breaker fires after 13 consecutive polls | feature | verified | read `ci-poll-decide.mjs:208` (`if (noProgressCount >= 13) … circuit_breaker`) and `:323` (`'No progress after 13 consecutive polls. Stopping.'`) (`SKILL.md:119`) |
| the whole documented status vocabulary exists in the decision script | structure | verified | read `ci-poll-decide.mjs:211-302` and the message table `:326-365` (`ci_success`, `cipe_canceled`, `cipe_timed_out`, `polling_timeout`, `circuit_breaker`, `environment_rerun_cap`, `fix_auto_applying`, `fix_auto_apply_skipped`, `fix_needs_review`, `fix_apply_ready`, `fix_needs_local_verify`, `fix_failed`, `no_fix`, `environment_issue`, `self_healing_throttled`, `no_new_cipe`, `cipe_no_tasks`) (`SKILL.md:112-136`) |
| the context substitutions work | feature | verified | ran `git branch --show-current` → `gsd-path/M052`, `git rev-parse --short HEAD` → `067dc23c`, `git status -sb` first line → `## gsd-path/M052` (`SKILL.md:12-15`) |
| `ci_information` / `update_self_healing_fix` MCP tools and the `ci-monitor-subagent (haiku)` agent | feature | unverifiable | no subagent or MCP definition exists in `.commandcode` (the string `ci-monitor-subagent` appears only in this SKILL.md); needs the Claude Code platform's agent and MCP registration |
| the WAIT/LIGHT/HEAVY field names (`taskFailureSummaries`, `suggestedFixSummary`, `couldAutoApplyTasks`, …) (`SKILL.md:98-102`) | feature | unverifiable | needs a live `ci_information` response; the Nx Cloud Public API spec has no `taskFailureSummaries` field at all |
| the `APPLY` / `REJECT` / `RERUN_ENVIRONMENT_STATE` action vocabulary of `update_self_healing_fix` | feature | unverifiable | needs the MCP tool |

## Doc: .commandcode/skills/monitor-ci/references/fix-flows.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `ci-state-update.mjs gate --gate-type local-fix\|env-rerun` | config | verified | read `scripts/ci-state-update.mjs:10` (usage) and `:38`, `:57` (`gateType === 'env-rerun'`) (`fix-flows.md:33`, `:37`) |
| `nx-cloud apply-locally <shortLink>` is a real command | command | verified | ran `nx-cloud --help`; `apply-locally` is in the command list (`fix-flows.md:74`) |
| the decision script really returns `autoApplySkipReason` and `verifiableTaskIds` | feature | verified | read `ci-poll-decide.mjs:429-432` (`result.verifiableTaskIds = …`, `result.autoApplySkipReason = …`) (`fix-flows.md:5`, `:16`) |
| UPDATE_FIX / FETCH_HEAVY / FETCH_THROTTLE_INFO subagents and their `APPLY`/`REJECT`/`RERUN_ENVIRONMENT_STATE` payloads | feature | unverifiable | needs the platform agent registry and MCP tools |
| `selfHealingSkipMessage` and the `/cipes/{id}` throttle-message parse | feature | unverifiable | needs a live throttled CIPE payload from `ci_information` |

## Doc: .commandcode/skills/nx-cloud-api/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `npx nx-cloud api --help` documents exactly the flags the doc describes (`-f/--field`, `-p/--path-param`, `--pages` default 1, `--page-size`, `--cursor`, `--format json\|ndjson`, `-o/--output`, `-i/--include`, `--nxCloudId`, `--org`) | command | verified | ran `node_modules/.bin/nx-cloud.cmd api --help` |
| `npx nx-cloud api` alone prints the usage block | command | verified | ran it; first line `Usage: npx nx-cloud api <path \| link> [options]` (`SKILL.md:17`) |
| `--print-api-spec` needs no credentials | integration | verified | ran it, exit 0, 315,724 bytes of OpenAPI 3.1 JSON (`SKILL.md:124`) |
| `--list-operations` and `--describe` need no credentials | feature | verified | ran both, exit 0 (`SKILL.md:124`) |
| the list wrapper is `{source, pagesFetched, fetchedItemCount, pageLimitReached, nextCursor, items}` | feature | verified | read the `Output:` section of `nx-cloud api --help` (`SKILL.md:139`) |
| `--page-size` sets `limit`, max 500 | feature | verified | live spec `listCipes` parameter `limit`: "Rows per page, 1..500 (default 100)", `--describe cipes` (`SKILL.md:153`) |
| exit codes `0` / `1` / `4` / `5` | feature | verified | read the help footer ("Exit codes: 0 success, 1 usage or network error, 4 client error (4xx), 5 server error (5xx)") (`SKILL.md:104-122`) |
| exit 1 with a single `{"error":…}` record on stderr for an unconfigured workspace | command | verified | ran `nx-cloud api cipes`; exit 1, one stderr line `{"error":{"type":"network","message":"Unable to authenticate… set the NX_CLOUD_ACCESS_TOKEN environment variable or define an access token in your nx.json."}}` (`SKILL.md:96`, `:115`) |
| `NX_CLOUD_ACCESS_TOKEN` is the workspace-token variable the command names | command | verified | same stderr message (`SKILL.md:115`) |
| 400 `invalid_parameter` for an unknown query parameter | feature | verified | live spec `info.description`: "Repeat a key for list filters … An unknown query param gives 400 `invalid_parameter`" (`SKILL.md:112`) |
| 429 `rate_limit_exceeded` (or empty body) and the four 503 codes `data_api_at_capacity`, `query_deadline_exceeded`, `audit_log_unavailable`, `rate_limit_unavailable` | feature | verified | read the `errors` block of `nx-cloud api --describe cipes` (`SKILL.md:120-121`) |
| `npx nx-cloud login --status` exists | command | verified | ran `nx-cloud login --help`; it lists `--status  Check and report current login status` (`SKILL.md:115`) |
| `npx nx-cloud decrypt-artifact` exists | command | verified | read the `nx-cloud --help` command list (`SKILL.md:106`) |
| full URLs and app links on the configured host resolve | config | verified | `nx-cloud api --help`: "URLs on the configured Nx Cloud host work too, including app links such as https://cloud.nx.app/cipes/<id>" (`SKILL.md:79`) |
| `--format ndjson` prints only the rows | feature | verified | help: "With `--format ndjson`, one item per line and nothing else" (`SKILL.md:159`) |
| "the command already retried 3 times honoring `Retry-After`" (`SKILL.md:120`, `:121`) | command | unverifiable | needs a live 429 or 503 from a credentialed workspace |
| "Unknown query parameters are always rejected" (`SKILL.md:112`) | feature | unverifiable | my uncredentialed `-f bogusParam=1` failed at authentication before parameter validation; needs a credentialed call |
| the literal 404 `not_found` code (`SKILL.md:117`) | feature | unverifiable | the spec states the semantics ("an unknown parent gives 404, never an empty page") but the code string needs a live 404 |
| `-o` files are "created owner-only" (`SKILL.md:88`) | structure | unverifiable | needs a successful data response to inspect mode bits |

## Doc: .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| asset links are `returns: file` | structure | verified | ran `nx-cloud api --list-operations`; `downloadTaskAsset` is `{"operationId":"downloadTaskAsset","returns":"file"}` (`extraction-and-calculation.md:44`) |
| `npx nx-cloud decrypt-artifact` | command | verified | read the `nx-cloud --help` command list (`:47`) |
| `task-stats` accepts `-f dateAfter`, `-f dateBefore`, `-f percentiles` | feature | verified | live spec `listTaskStats` parameters: `projectName, target, isCI, dateAfter, dateBefore, percentiles, limit, cursor, sort` (`:21-27`) |
| completeness is judged by `nextCursor`/`pageLimitReached`, resumable with `--cursor` | feature | verified | `nx-cloud api --help` Navigation and `--pages`/`--cursor` sections (`:30-42`) |
| "the command refuses to write a download to a terminal" (`:46`) | command | unverifiable | needs a live asset download |
| "a non-empty gzip payload can contain a valid tar archive whose terminal-output entry is zero bytes" (`:52-60`) | feature | unverifiable | needs a real task artifact |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `npx nx-cloud api --describe 'runs/{runId}/tasks'` resolves the path template | command | verified | ran it; exit 0, `{"operationId":"listTasks","path":"/nx-cloud/data/v1/runs/{runId}/tasks","returns":"list"}` (`SKILL.md:47`) |
| the `nx show project` + jq fragment returns the documented object | feature | verified | ran `nx.cmd show project angular-ai-devtools --json` through the doc's filter verbatim; output `{"executor":"@angular/build:unit-test","cache":true,"inputs":["default","^default"],"outputs":null,"options":{…},"selectedConfiguration":null}` (`SKILL.md:90-99`) |
| `cache: true` on a target is reported by that query | feature | verified | same output, `"cache": true` (`SKILL.md:105-106`) |
| the task-row projection fields exist | structure | verified | live spec `listTasks` response fields include `items[].id`, `items[].batchId`, `items[].status`, `items[].cacheStatus`, `items[].cacheable`, `items[].hash`, `items[].links` (`SKILL.md:48-54`) |
| "A terminal `remote-cache-hit` proves Nx replay worked" and the six classification outcomes (`SKILL.md:118-160`) | feature | unverifiable | needs a real run/task record from a credentialed workspace |
| the change gate's approval step (step 5, "get explicit approval before an edit") | feature | unverifiable | needs a person |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `npx nx-cloud api "<link>" -o <private-file>.tar.gz` is the documented download form and `-o` is real | command | verified | `nx-cloud api --help` `-o, --output <file>` (`:5-6`) |
| "The API cannot identify an upload path, writer, storage event, or service mutation" | integration | verified | ran `nx-cloud api --list-operations`; no operation for uploads, writers, storage events or mutations exists in the 33 documented routes (`:24`) |
| byte count + SHA-256, compression-stream and member-table validation, "byte-identical malformed downloads across retries" (`:11-23`) | structure | unverifiable | needs real cache artifacts |

## Doc: .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Task assets are typed `logs`, `artifact`, or `sandbox-report`" | feature | verified | live spec `downloadTaskAsset` path parameter `type`: "The asset type: `logs`, `artifact`, or `sandbox-report` (the Ultracache report)." (`:3`) |
| the download form `npx nx-cloud api "<link>" -o <private-file>.tar.gz` | command | verified | `nx-cloud api --help` `-o` (`:6`) |
| "Identify its format from bytes", decoding, and the zero-byte output shape | feature | unverifiable | needs a real log or report asset |

## Doc: .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the `cipes` filter accepts only terminal statuses" | feature | stale | asserted at `.commandcode/skills/nx-cloud-ci-failure-review/SKILL.md:30`, contradicted by the live Public API spec that ships with the audited Nx 23.3.0: `nx-cloud api --describe cipes` returns `statuses` enum `["NOT_STARTED","IN_PROGRESS","SUCCEEDED","FAILED","CANCELED","TIMED_OUT"]` with "Select statuses. Omit to include every CIPE, in-progress ones included" — no in-tree line contradicts it; the spec is served by the installed CLI, not a file in the checkout |
| the three values the doc queries (`FAILED`, `TIMED_OUT`, `CANCELED`) are valid `cipes` statuses | feature | verified | same `--describe cipes` enum (`:29`) |
| the endpoints it names all exist | structure | verified | ran `nx-cloud api --list-operations`: `/cipes`, `/run-groups`, `/run-groups/{runGroupId}`, `/runs`, `/runs/{runId}/tasks`, `/run-groups/{runGroupId}/steps`, `/run-groups/{runGroupId}/instances` (`:35`) |
| "the public API has no separate workflow routes" | integration | verified | the 33 documented paths contain no `workflows` route; workflows surface as `ci/{ciExecutionId}/jobs/{workflowKey}` (`:38`) |
| run-group records carry `criticalErrorMessage` | feature | verified | read the full `--print-api-spec` output; the field name is present (`:81`) |
| both CIPE and run-group lists filter on a `createdAfter`/`createdBefore` window (creation time), not failure time | feature | verified | live spec `listCipes` and `listRunGroups` parameters (`:25`) |
| the 24-hour default, the 30-hour creation window and the "maximum normal six-hour CI duration" (`:24-27`) | config | unverifiable | needs the organization's CI configuration; no CI pipeline definition is in this checkout |
| "a semaphore of at most five narrow detail requests" and "fetch logs only after a group reaches the top five" (`:53`) | feature | unverifiable | needs live task groups |
| the CODEOWNERS ownership step (`:94`) | feature | unverifiable | no `CODEOWNERS` file exists in this checkout (only inside `node_modules/ecdsa-sig-formatter`), so the rule can only report absent evidence |

## Doc: .commandcode/skills/nx-generate/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `npx nx list` lists plugins | command | verified | ran it; prints installed plugins (`@nx/angular`, `@nx/js`, `@nx/playwright`, `@nx/web`, …) (`:31`) |
| `npx nx list @nx/react` is the right form | command | verified | ran it; exit 0 with `@nx/react is not currently installed` (`:30`) |
| `npx nx g <plugin>:<generator> --help` prints the generator's options | command | verified | ran `nx g @nx/angular:library --help`; prints `NX generate @nx/angular:library [directory] [options,...]` and "From: @nx/angular (v23.3.0)" (`:48`) |
| `node -e "console.log(require.resolve('@nx/<plugin>/generators.json'));"` resolves | command | verified | ran it for `@nx/angular` → `…\node_modules\@nx\angular\generators.json` (`:87`) |
| `--no-interactive` and `--dry-run` exist | structure | verified | `nx generate --help`: `--interactive  When false disables interactive input prompts for options. [boolean] [default: true]`, `-d, --dryRun  Preview the changes without updating files.` (`:19`, `:117-120`) |
| `nx format:write` exists and overwrites un-formatted files | structure | verified | ran `nx format --help`; `nx format:write  Overwrite un-formatted files.` (`:152`) |
| `nx run-many -t build,lint,test,typecheck` is a valid command form | command | verified | ran `nx run-many --help` (`-t, --targets … [required]`); note this workspace has only `build`, `build-extension`, `test`, `generate-error-digest`, `serve`, `serve-static` (`nx show project angular-ai-devtools --json`), which the doc already frames as "just an example" (`:161`) |
| the `--directory` placement warning (`--directory=libs` creating `libs/package.json` vs `--directory=libs/my-lib`) (`:96-102`) | structure | unverifiable | needs an `@nx/react` generator run; `@nx/react` is not installed in this workspace |

## Doc: .commandcode/skills/nx-import/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `nx import` exists with the documented positionals and flags | structure | verified | ran `nx import --help`; `nx import [sourceRepository] [destinationDirectory]`, options `--source`, `--ref`, `--depth`, `--interactive [default: true]`, `--plugins`, `--verbose` (`:10`, `:17`, `:23`, `:66`) |
| this workspace is on the "after 22.6.0" side and prompts by default | config | verified | ran `nx --version` → `Local: v23.3.0`; `nx import --help` → `--interactive … [default: true]` (`:9`) |
| `npx nx reset` exists | command | verified | ran `nx reset --help`; "Clears cached Nx artifacts and metadata about the workspace and shuts down the Nx Daemon." (`:80`, `:90`) |
| `npx nx add <plugin>` exists | command | verified | ran `nx add --help`; `nx add <packageSpecifier>` "Install a plugin and initialize it." (`:89`) |
| "`@nx/eslint` 23.3.0 peer-depends on `eslint@^9.0.0 \|\| ^10.0.0`" | feature | verified | ran `npm view @nx/eslint@23.3.0 peerDependencies --json` → `{"eslint":"^9.0.0 \|\| ^10.0.0","@nx/jest":"23.3.0","@zkochan/js-yaml":"0.0.7"}` (`:119`) |
| "`nx import` responds with .ndjson outputs" (`:9`) | feature | unverifiable | needs an actual import from a source repository (a write) |
| `nx sync --yes` (`:80`) | feature | unverifiable | `nx sync --help` lists only `--version` and `--verbose`; proving `--yes` needs to run the sync, which writes workspace files |
| `pnpm add -wD eslint@^9 @nx/eslint-plugin typescript-eslint` (`:111`) | feature | unverifiable | writes `package.json`, and this workspace has no `pnpm-workspace.yaml` |

## Doc: .commandcode/skills/nx-import/references/ESLINT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| plugin options are set in `nx.json` `plugins[].options` (including `targetName`) | structure | verified | this workspace's own `nx.json:20-27` uses that shape for `@nx/playwright/plugin` (`{"plugin": "@nx/playwright/plugin", "options": {"targetName": "e2e"}}`) (`:15-20`) |
| "`@nx/eslint/plugin` … detects both flat config files … and legacy config files" (`:9`) | config | unverifiable | `@nx/eslint` is not installed; needs the plugin |
| "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" (`:88`) | structure | unverifiable | needs an `nx add @nx/eslint` run (a write) |
| the `typescript-eslint@7.x` / eslint 9 peer conflict and its npm overrides fix (`:60-80`) | feature | unverifiable | needs an npm workspace install |

## Doc: .commandcode/skills/nx-import/references/GRADLE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `nx show projects` works for verifying inferred projects | feature | verified | ran it; returns `ai-devtools-companion`, `angular-ai-devtools-e2e`, `angular-ai-devtools`, `angular-ai-devtools-workspace` (`:8`) |
| `@nx/gradle` inferring projects from root `gradlew`/`gradle/wrapper` | feature | unverifiable | `@nx/gradle` is not installed and the checkout has no Gradle files |

## Doc: .commandcode/skills/nx-import/references/JEST.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target" (`:9`) | config | unverifiable | `@nx/jest` is not installed |
| the root `jest.preset.js` content `require('@nx/jest/preset').default` (`:40`) | config | unverifiable | needs `@nx/jest` |
| "`nx add @nx/jest` does NOT create `jest.preset.js`" (`:27-29`) | structure | unverifiable | needs an `nx add` run (a write) |

## Doc: .commandcode/skills/nx-import/references/NEXT.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/next/plugin` … creates these targets: `build`, `dev`, `start`, `serve-static`, `build-deps`/`watch-deps`" (`:5-15`) | feature | unverifiable | `@nx/next` and `next` are not installed |
| "**No separate typecheck target**" for Next.js (`:17`) | feature | unverifiable | needs a Next.js project in the workspace |
| `composePlugins(withNx)` from `@nx/next` (`:23`) | feature | unverifiable | needs `@nx/next` |

## Doc: .commandcode/skills/nx-import/references/TURBOREPO.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `nx run-many -t build lint test typecheck` is a valid workspace-validation command | command | verified | ran `nx run-many --help` (`:52`) |
| the config-as-package merge procedure (`:13-46`) | config | unverifiable | this checkout contains no Turborepo source, `turbo.json`, or `@repo/*` config package, so there is nothing to check the procedure against |

## Doc: .commandcode/skills/nx-import/references/VITE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`" (`:9`) | feature | unverifiable | `@nx/vite` is not installed |
| the `build`/`dev`/`serve`/`preview`/`serve-static` target sets per Vite flavour (`:24-60`, `:120-140`) | feature | unverifiable | needs `@nx/vite` |
| the `resolve.alias`/`__dirname`/`baseUrl` fixes (`:17-22`) | feature | unverifiable | needs a non-Nx Vite source repo |

## Doc: .commandcode/skills/nx-plugins/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `npx nx list` lists plugins | command | verified | ran it; prints "Installed plugins" and "Also available" (`:8`) |
| `npx nx add <plugin>` installs and initializes a plugin | command | verified | ran `nx add --help`; `nx add <packageSpecifier>` "Install a plugin and initialize it." (`:9`) |
| `npx nx add @nx/react` (`:9`) | command | unverifiable | the command exists, but running it installs a package and edits `package.json` |

## Doc: .commandcode/skills/nx-run-tasks/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| `nx show project <projectname> --json` exposes a `targets` section with inferred targets | command | verified | ran it for `angular-ai-devtools`; six targets including the inferred `@angular/build:unit-test` `test` target (`:14`) |
| `nx run <project>:<task>` is the single-task form | feature | verified | ran `nx run --help` (errors "Both project and target have to be specified") and `nx run angular-ai-devtools:test --help` (prints the task's options) (`:20-24`) |
| `-p`, `--exclude`, `--parallel` with default 3 and `--projects=tag:api-*` | integration | verified | ran `nx run-many --help`: `-p, --projects`, `--exclude`, `--parallel … [default is 3]`, and the `tag:` examples (`:30-36`) |
| `nx affected` with `--base`, `--head`, `--files` | structure | verified | ran `nx affected --help`, which documents all three including the `--files=libs/mylib/src/index.ts` example (`:42-49`) |
| `--skipNxCache`, `--nxBail`, `--verbose`, `--configuration` on `run-many` and `affected` | config | verified | ran `nx run-many --help` and `nx affected --help`; both list `-c, --configuration`, `--verbose`, `--nxBail`, `--skipNxCache, --disableNxCache` (`:55-58`) |
| the package-manager hint resolves to npm here | feature | verified | root `package.json` has no `packageManager` field and the lockfile is `package-lock.json` (`:8`) |
| "These flags work with `run` …" (`:55`) | feature | unverifiable | `nx run <project>:<target> --help` prints only task options; proving `--skipNxCache`/`--nxBail`/`--configuration` on `run` requires executing a cached task (a write) |

## Doc: .commandcode/skills/nx-workspace/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Use `nx show projects` to list projects in the workspace." | structure | verified | ran `npx nx show projects --json`, output `["ai-devtools-companion","angular-ai-devtools-e2e","angular-ai-devtools","angular-ai-devtools-workspace"]` (`.commandcode/skills/nx-workspace/SKILL.md:14`) |
| "filters support explicit names, glob patterns, tag references, directories, and negation" with `-p/--projects`, `--withTarget`, `--type`, `--exclude`, `--affected`, `--json` | command | verified | ran `npx nx show projects --help`; it lists `-p, --projects`, `-t, --withTarget`, `--type [app\|lib\|e2e]`, `--exclude`, `--affected`, `--json`, `--uncommitted`, `--untracked`, `--base`, `--head` (`.commandcode/skills/nx-workspace/SKILL.md:16`) |
| "Use `nx show project <name> --json` to get the full resolved configuration … including inferred targets from plugins" | command | verified | `apps/angular-ai-devtools-e2e/project.json:11` is `"targets": {}` while `nx.json:24-31` registers `@nx/playwright/plugin` with `"targetName": "e2e"`, so the `e2e` target exists only by inference (`.commandcode/skills/nx-workspace/SKILL.md:48`) |
| "`targetDefaults` — Default configuration applied to all targets of a given name" and "`plugins` — Nx plugins and their configuration" | config | verified | `nx.json:3-20` holds `targetDefaults` keyed by `build`, `@angular/build:application` and `@angular/build:unit-test`; `nx.json:24-31` holds the plugin array (`.commandcode/skills/nx-workspace/SKILL.md:111`) |
| "You can read the full project schema at `node_modules/nx/schemas/project-schema.json`" (and the `nx-schema.json` sibling at `:88`) | structure | verified | `dir` finds both files under the installed Nx 23.3 (`.commandcode/skills/nx-workspace/SKILL.md:52`) |
| the `jq` pipelines are runnable on this host | feature | verified | `where jq` answers `C:\Users\LarsGyrupBrinkNielse\AppData\Local\Microsoft\WinGet\Links\jq.exe` (`.commandcode/skills/nx-workspace/SKILL.md:143`) |
| "`nx graph --print`" returns the project graph | feature | unverifiable | needs an `nx graph` run; not executed in this audit (`.commandcode/skills/nx-workspace/SKILL.md:227`) |
| "`nx sync`" then "`nx reset` if sync doesn't fix stale cache" | feature | unverifiable | `nx reset` clears the daemon and cache for every later command this session, so it was not run (`.commandcode/skills/nx-workspace/SKILL.md:285-286`) |

## Doc: .commandcode/skills/nx-workspace/references/AFFECTED.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| every listed flag exists | config | verified | ran `npx nx show projects --help`: `--affected`, `--base`, `--head`, `--type`, `--exclude`, `--uncommitted`, `--untracked` are all documented there (`.commandcode/skills/nx-workspace/references/AFFECTED.md:5-27`) |
| `--exclude="*-e2e"` names this workspace's e2e project | structure | verified | `apps/angular-ai-devtools-e2e/project.json:2` is `"name": "angular-ai-devtools-e2e"`, which the glob matches (`.commandcode/skills/nx-workspace/references/AFFECTED.md:17`) |
| `--type app` selects on `projectType` | feature | verified | `apps/angular-ai-devtools-e2e/project.json:4` is `"projectType": "application"` (`.commandcode/skills/nx-workspace/references/AFFECTED.md:14`) |
| `--base=main` and `--base=origin/main` both resolve here | feature | verified | `git branch -a` lists `main` and `remotes/origin/main` (`.commandcode/skills/nx-workspace/references/AFFECTED.md:9-10`) |
| "Affected between two commits … `--base=abc123 --head=def456`" | feature | unverifiable | needs two chosen commits and an affected computation; not run (`.commandcode/skills/nx-workspace/references/AFFECTED.md:12`) |

## Doc: .commandcode/skills/verify-ai-browsers/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Each check exits 0 pass, 1 claim failed, 2 could not run" | command | verified | every one of the eight check headers ends with that exact sentence, e.g. `.commandcode/skills/verify-ai-browsers/checks/state.mjs:11` (`// Exit 0 pass; 1 with \`Error: CLAIM: ...\` when the claim fails; 2 when it could not run.`), and the same line at `error-explainer.mjs:12`, `extension-panel.mjs:13`, `interop.mjs:14`, `stale-view.mjs:11`, `di-doctor.mjs:12`, `signal-provenance.mjs:12`, `model-init.mjs:10` (`.commandcode/skills/verify-ai-browsers/SKILL.md:3`) |
| the eight standalone command lines name real modules | command | verified | `dir` of `.commandcode/skills/verify-ai-browsers/checks` lists exactly `state.mjs`, `model-init.mjs`, `extension-panel.mjs`, `signal-provenance.mjs`, `di-doctor.mjs`, `error-explainer.mjs`, `stale-view.mjs`, `interop.mjs` (plus one `.test.mjs` each) (`.commandcode/skills/verify-ai-browsers/SKILL.md:59-66`) |
| the named artifacts are the ones the checks write | feature | verified | `state.json` (`checks/state.mjs:10`), `model-init.json` (`model-init.mjs:9`), `extension-panel.json` (`extension-panel.mjs:12`), `error-explainer.json` (`error-explainer.mjs:11`) (`.commandcode/skills/verify-ai-browsers/SKILL.md:25-28`, `:38`) |
| `check-teardown.mjs {runDir}/steps/teardown-<n>.out --artifact …` resolves | feature | verified | the script ships at `~/.commandcode/skills/lars-create-verification/scripts/check-teardown.mjs` (`dir` of that skill) (`.commandcode/skills/verify-ai-browsers/SKILL.md:56`) |
| the setup builds the panel with `npx nx run angular-ai-devtools:build-extension` | command | verified | the target is declared at `apps/angular-ai-devtools/project.json:64` (`.commandcode/skills/verify-ai-browsers/SKILL.md:44`) |
| `C model download <instance> --timeout-min=45` is the driver's own default | command | verified | `control.mjs:297` documents "`model download`'s time budgets: the page polls for `--timeout-min` (default 45) minutes after its click" (`.commandcode/skills/verify-ai-browsers/SKILL.md:41`) |
| the extension-panel setup names `control-angular-dev-app up --target counter` and that target exists | command | verified | `control-angular-dev-app/scripts/control.mjs:114` declares `counter:` (`.commandcode/skills/verify-ai-browsers/SKILL.md:18`) |
| the row claims themselves (`state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` each exiting 0 on a named instance) | feature | unverifiable | need running Chrome Beta / Edge Dev / Edge stable instances, a downloaded on-device model, the built panel and a served Angular dev page (`.commandcode/skills/verify-ai-browsers/SKILL.md:6-23`) |
| "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three (2026-10-12)" | feature | unverifiable | needs a live doctor run on that instance (`.commandcode/skills/verify-ai-browsers/SKILL.md:77`) |

## Doc: .commandcode/skills/verify-angular-devtools/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the three checks exist at the named ids | structure | verified | `dir` of `.commandcode/skills/verify-angular-devtools/checks` lists `extension-enabled.mjs`, `attached.mjs`, `coexist.mjs` (each with a `.test.mjs`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:6-8`) |
| "artifacts: `{up.evidenceDir}/<file>`, where `<file>` is `extension.json`, `attach.json` or `coexist-result.json`" | structure | verified | the headers write `<dir>/extension.json` (`checks/extension-enabled.mjs:7`), `<dir>/attach.json` (`checks/attached.mjs:9`) and `<dir>/coexist-result.json` (`checks/coexist.mjs:11`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:39`) |
| "Each check's header comment holds its claim, the feature it covers, its usage and the files it writes" | structure | verified | all three headers carry `// Claim:`, `// Usage:`, `// Writes:` and the exit line (`extension-enabled.mjs:2,6,7,8`; `attached.mjs:2,8,9,10`; `coexist.mjs:2,10,11,12`) (`.commandcode/skills/verify-angular-devtools/SKILL.md:20`) |
| "With `--di-graph`" is an accepted flag of the coexist check | config | verified | `checks/coexist.mjs:10` usage line reads `--out <dir> [--di-graph]` (`.commandcode/skills/verify-angular-devtools/SKILL.md:33`) |
| "`install --from` takes the harness copy already in the checkout" | feature | verified | `control-angular-devtools/scripts/control.mjs:2237` documents `install … [--from edge-dev\|edge\|chrome\|chrome-beta\|<dir>]`, and `:1443` reads "install it in … first or pass --from <dir>" (`.commandcode/skills/verify-angular-devtools/SKILL.md:41`) |
| "The harness is headed; it opens a window on Lars's desktop for about half a minute per run" | feature | unverifiable | needs the Playwright Chromium harness to be launched (`.commandcode/skills/verify-angular-devtools/SKILL.md:52`) |
| "Not covered: the branded browsers … `control.mjs status --browser <name>` reads Lars's own profile" | feature | unverifiable | needs a branded-browser profile read (`.commandcode/skills/verify-angular-devtools/SKILL.md:53`) |

## Doc: .commandcode/skills/verify-pangular-inspector/SKILL.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "exact pin 0.0.7 declared and installed" | config | verified | `control-pangular-inspector/scripts/control.mjs:103` is `const PINNED = '0.0.7';` (`.commandcode/skills/verify-pangular-inspector/SKILL.md:16`) |
| the three checks and their artifacts exist | structure | verified | `setup.mjs` writes `<dir>/setup-check.json` (`checks/setup.mjs:8`), `read-only.mjs` writes `<dir>/tools-list.json, navigate-refused.json` (`checks/read-only.mjs:9`), and `live-reads.mjs` is present and takes `--session` (`checks/live-reads.mjs` usage line) (`.commandcode/skills/verify-pangular-inspector/SKILL.md:38`, `:42`) |
| "`read-only.mjs` takes `--out` only" | structure | verified | `checks/read-only.mjs:8` usage line is `--out <dir>` with no `--session`, unlike `live-reads.mjs` (`.commandcode/skills/verify-pangular-inspector/SKILL.md:32`) |
| "the setup steps need ports 3000 and 9999 free" | config | verified | 3000 is pinned at `control-angular-dev-app/scripts/control.mjs:101` (`const PORTAL_API_PORT = 3000;`) and 9999 at `control-pangular-inspector/scripts/control.mjs:104` (`const DEFAULT_PORT = 9999;`) (`.commandcode/skills/verify-pangular-inspector/SKILL.md:49`) |
| "`tools/list` offers no action tool, and `call navigate` without `--confirm` is refused" | feature | verified | `control.mjs:107` declares `ACTION_TOOLS`, `control.mjs:536` refuses `ACTION_TOOLS.includes(short(name)) && !confirm`, and `control.mjs:2455` exits 2 (`.commandcode/skills/verify-pangular-inspector/SKILL.md:18`) |
| the `live-reads` claim (a sidebar CONTRACT > List click reaches `/contract/list`, and the six MCP reads answer) | feature | unverifiable | needs the Insurance Portal served with Pangular installed, a running devtools server on 9999 and a browser click (`.commandcode/skills/verify-pangular-inspector/SKILL.md:17`) |

## Doc: .commandcode/taste/angular/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the Angular unit-test builder is pinned to include only `**/*.spec.ts`" | structure | verified | `apps/angular-ai-devtools/project.json:117-119` sets the `@angular/build:unit-test` target's `include` to `["**/*.spec.ts"]` (`.commandcode/taste/angular/taste.md:14`) |
| "`tsconfig.spec.json` excludes `src/**/*.node.test.ts`" | config | verified | `apps/angular-ai-devtools/tsconfig.spec.json:13-16` excludes `src/**/*.node.test.ts` and `src/**/*.node.spec.ts` (`.commandcode/taste/angular/taste.md:14`) |
| "`node:test` suites are named `*.node.test.ts` and run with `node --experimental-strip-types --test`" | command | verified | `package.json:15` runs `node --experimental-strip-types --test` over `"src/**/*.test.ts"`, and two such suites exist: `apps/angular-ai-devtools/src/app/interop-slice.node.test.ts` and `interop-attribution.node.test.ts` (`.commandcode/taste/angular/taste.md:14`) |
| "signals … and zoneless" with no legacy runtime | feature | verified | `package.json:51-60` lists only `@angular/*`, `rxjs` and `tslib` as runtime dependencies, with no `zone.js` (`.commandcode/taste/angular/taste.md:3`) |
| "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | integration | unverifiable | a recursive search of this checkout finds no `@angular/forms/signals` reference, and the portal is a separate checkout at `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, so the migration claim needs that tree (`.commandcode/taste/angular/taste.md:5`) |
| "`inject()` and `@Service()`-style modern authoring are preferred" | integration | unverifiable | `@Service` is Angular's own API, which this repository does not vendor in readable form; needs the Angular 22 source or a compile probe (`.commandcode/taste/angular/taste.md:3`) |

## Doc: .commandcode/taste/communication/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`provideAiDevTools()` not `provideAiDevtools()`" | feature | verified | `packages/ai-devtools-companion/src/index.ts:25` declares `export function provideAiDevTools(): Provider[] {` (`.commandcode/taste/communication/taste.md:4`) |
| "neither word may appear in DevTools code, UI or runtime text" (blessed / ordained) | feature | verified | a search of `apps/**`, `extension/**` and `packages/**` for `blessed\|ordained` returns no file (`.commandcode/taste/communication/taste.md:3`) |
| "Never call AskUserQuestion; proceed with available context and escalate through the normal channel instead", plus the writing-style and reporting preferences (`:5-12`) | feature | unverifiable | these are agent-behaviour rules with no artefact to contradict; they need the owner or a live session (`.commandcode/taste/communication/taste.md:11`) |

## Doc: .commandcode/taste/design/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the page, content scripts, and service worker never host `LanguageModel`" | integration | verified | the only `LanguageModel` reference under `extension/` is the built panel bundle `extension/panel/chunk-Di8Zy6Ss.js` (`globalThis.LanguageModel`, panel-side); the hand-written sources (`background.js`, `relay.js`, `agent-main.js`, `stale-view-worker.js`) carry none (`.commandcode/taste/design/taste.md:12`) |
| "The MAIN-world script is limited to reading the page … it never runs Prompt API" | integration | verified | `extension/manifest.json:34` declares `agent-main.js` as the MAIN-world script and that file contains no `LanguageModel` (`.commandcode/taste/design/taste.md:13`) |
| "A Worker must not call `LanguageDetector` or `Translator` itself" | feature | verified | a search of `extension/` and `apps/angular-ai-devtools/src` for both names returns nothing (`.commandcode/taste/design/taste.md:15`) |
| "Removing `panel/**` from `web_accessible_resources` is conditional" | feature | verified | `extension/manifest.json` carries no `web_accessible_resources` key at all; the panel is reached through `"devtools_page": "devtools.html"` (`extension/manifest.json:51`) (`.commandcode/taste/design/taste.md:11`) |
| "per-package secondary entry points such as `provideAiNgrxDevTools()`" | feature | unverifiable | the package exports only `provideAiDevTools()` (`packages/ai-devtools-companion/src/index.ts:25`; `src/` holds `index.ts`, `facade.ts`, `vetted.ts`, no entry-point folders), so whether the sentence is a naming rule or a shipped artifact needs a ruling (`.commandcode/taste/design/taste.md:9`) |
| "Edge exposes no `LanguageModel` there without flags" | feature | unverifiable | needs Edge Dev/Edge stable with and without the AI feature switches (`.commandcode/taste/design/taste.md:12`) |

## Doc: .commandcode/taste/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the file carries no text, so there is nothing to contradict | structure | verified | reading it returns zero bytes; `.project/research/DOCS-AUDIT.md:1107` classifies it the same way ("`.commandcode/taste/taste.md`" under `## Descriptive docs`) (`.commandcode/taste/taste.md:1`) |

## Doc: .commandcode/taste/tooling/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the configured npm global prefix is `C:\Users\LarsGyrupBrinkNielse\.local\bin` (`~/.npmrc` line 2)" | config | verified | ran `npm prefix -g` → `C:\Users\LarsGyrupBrinkNielse\.local\bin`; `~/.npmrc:2` is `prefix=C:\Users\LarsGyrupBrinkNielse\.local\bin` (`.commandcode/taste/tooling/taste.md:60`) |
| "`D:\packages\npm-global` exists and is populated (`@playwright`, `create-nx-workspace`)" | structure | verified | `dir /b D:\packages\npm-global` lists `@playwright` and `create-nx-workspace` beside 16 other entries (`.commandcode/taste/tooling/taste.md:60`) |
| "verify with `nx test angular-ai-devtools --include=<path>`" | structure | verified | the test target declares an `include` option (`apps/angular-ai-devtools/project.json:117-119`), which is what that flag maps to (`.commandcode/taste/tooling/taste.md:62`) |
| "start AI browser instances only through `control-ai-browsers up`, which adds the Edge sign-in and sync switches" | feature | verified | `instances.json:32` is the `--disable-features=msImplicitSignin,…` switch list on both Edge browsers, and `control.mjs:899` refuses a profile that holds an account (`.commandcode/taste/tooling/taste.md:37`) |
| "install-* scripts (and their tests) live user-scope, not in `scripts/`" | feature | verified | `dir` of `scripts/` lists no `install-*` file, and `~/.commandcode/scripts/install-gsd-path-command-code.mjs` exists (`.commandcode/taste/tooling/taste.md:13`) |
| "on Windows 11 ARM64, `shell_command` uses cmd.exe (not Git Bash)" | feature | verified | `echo %PROCESSOR_ARCHITECTURE%` → `ARM64`, and this audit's own shell rejected `Select-Object` as "not recognized as an internal or external command", i.e. cmd.exe (`.commandcode/taste/tooling/taste.md:35`) |
| TypeScript scripts run on Node 22/24 via `node --experimental-strip-types` | command | verified | `node --version` → `v24.22.0`, and `package.json:15` uses exactly that flag (`.commandcode/taste/tooling/taste.md:14`) |
| "when the same model runs on both channels, keep the Stable instance and drop the Beta/Dev one" | feature | unverifiable | the registry still carries both v3Nano instances (`instances.json:68` chrome-beta-nano, `instances.json:199` chrome-stable-nano), so whether the rule is unapplied or unamended needs the owner (`.commandcode/taste/tooling/taste.md:40`) |
| the PowerShell-5.1 comparison operators (`-lt`, `-gt`, …) and the "prefers the PowerShell tool" half of `:35` | feature | unverifiable | needs a PowerShell 5.1 session, which this audit did not open (`.commandcode/taste/tooling/taste.md:35`) |

## Doc: .commandcode/taste/workflow/taste.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pair every tool, fixture or runtime the project adopts with a `control-{name}` skill and a `verify-{name}` skill" | feature | stale | asserted at `.commandcode/taste/workflow/taste.md:3`, contradicted by `.commandcode/skills` (dir listing), which holds `control-angular-dev-app` and `control-vitest-browser-angular` with no `verify-` counterpart while only `verify-ai-browsers`, `verify-angular-devtools` and `verify-pangular-inspector` exist |
| "Gitignore `.playwright-cli/`" | command | verified | `.gitignore:1` is `.playwright-cli/` (`.commandcode/taste/workflow/taste.md:63`) |
| "shared project settings stay committed in `.commandcode/settings.json`, while … `.commandcode/settings.local.json`" is gitignored | config | verified | `git ls-files .commandcode/settings.json` lists it as tracked, `git ls-files .commandcode/settings.local.json` lists nothing, and `.gitignore:18` ignores it (`.commandcode/taste/workflow/taste.md:17`) |
| "Generated build artifacts … under `extension/panel/` should be gitignored; only … `index.html` and `favicon.ico` should remain tracked" | feature | verified | `.gitignore:33-35` is `extension/panel/*`, `!extension/panel/index.html`, `!extension/panel/favicon.ico` (`.commandcode/taste/workflow/taste.md:52`) |
| "Keep `spikes/` and `research/` in the repository" | feature | verified | `spikes/ng222-app`, `spikes/ng222-ssr`, `spikes/probes` and `research/00`…`research/20` are all present (`.commandcode/taste/workflow/taste.md:65`) |
| "the `lars-*` verification skills" exist as installed skills | structure | verified | `dir ~/.commandcode/skills` lists `lars-create-verification`, `lars-maintain-verification`, `lars-review`, `lars-verify` (`.commandcode/taste/workflow/taste.md:4`) |
| "check_docs_audit.py … matching the frozen inventory, consistent summary counts, and a populated remediation queue" exists where the rule points | structure | verified | `~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py` is present (`.commandcode/taste/workflow/taste.md:35`) |
| the commit, gate and delegation practices in the rest of the file (`git commit -F`, stage-by-name, the 4-agent cap, `/pstack:*` commands) | structure | unverifiable | the first are process rules with no artefact, and the `pstack` skill family is not installed beside the `lars-*` ones (`dir ~/.commandcode/skills` shows only `setup-pstack`) (`.commandcode/taste/workflow/taste.md:4`) |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "TypeScript is pinned to 6.0.x (`package.json`)" | structure | verified | `package.json:47` is `"typescript": "6.0.3"` (`AGENTS.md:17`) |
| "`npm run check` (type check, root and skills) and `npm test` (node:test, root and skills)" | command | verified | `package.json:7` and `package.json:15` (`AGENTS.md:18`) |
| "Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23)" | command | verified | the file exists, and `npx nx show projects --json` runs (`AGENTS.md:19`) |
| "call `%USERPROFILE%\.commandcode\gsd.bat <verb>`" | feature | verified | `C:\Users\LarsGyrupBrinkNielse\.commandcode\gsd.bat` exists (`AGENTS.md:20-21`) |
| "The automatic bridge (`scripts/sidecar-deps-bridge.mjs`)" | structure | verified | the script exists, and `package.json:7` invokes its sibling `scripts/ensure-sidecar-deps.mjs` first (`AGENTS.md:18-24`) |
| "`.commandcode/skills/` is the only maintained copy of the `control-*` and `verify-*` skills … there is no second tree to keep in step" | structure | verified | no `.claude` directory exists in this checkout (`AGENTS.md:40-42`) |
| "`toSignal(this.subject)` at line 14 and an unlabelled `effect` whose body calls `subject.error(...)` at line 22" | feature | verified | `spikes/ng222-app/src/app/stale-view-fixture.ts:14` is `readonly signal = toSignal(this.subject);` and `:22` is `this.subject.error(new Error('interop'));` (`AGENTS.md:55-60`) |
| "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:24`)" | structure | stale | asserted at `AGENTS.md:63`, contradicted by `apps/angular-ai-devtools/src/app/app.routes.ts:24`, which is a line inside the `PANEL_SURFACES` comment block; `{ path: 'interop', … }` is declared at `:120` |
| "`verify-ai-browsers/checks/interop.mjs` (10 tests, green 2026-11-01: `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs` reports `tests 10`, `pass 10`)" | command | verified | ran that command: `ℹ tests 10 / ℹ pass 10 / ℹ fail 0` (`AGENTS.md:64-67`) |
| "DeepSeek V4.1 Flash for every tool-loop role … GLM-5.3 Flash for `reviewer`, `skeptic` and `review_panel`" | feature | stale | asserted at `AGENTS.md:82-84`, contradicted by `.project/model-policy.json`, whose tool-loop roles include `inspect_docs`, `docs_audit` and `research` on `free-glyph-cluster-medium` (`:9`, `:10`, `:14`) and `mechanical_repair` on `paid-deepseek-v4-1-flash-low` (`:15`), and whose review roles are `reviewer_panel_beam`, `reviewer_panel_glyph`, `reviewer_panel_glm` and `gap_review` (`:5-7`) — no role named `reviewer`, `skeptic` or `review_panel` |
| "`.project/review/` is tracked; deleting it is a diff, not a loss" | feature | stale | asserted at `AGENTS.md:297`, contradicted by `git ls-files .project/review` (no rows) and by `.project/`, which holds no `review` directory; every tracked review file lives under `.project/archive/<milestone>/review/` |
| "Measured on 2026-11-07: 15 of 23 verdict specs drove the counter fixture on `:4222` and 3 drove the portal" | feature | unverifiable | needs the `.project/build/verify` evidence root of that date, which this checkout does not carry (`AGENTS.md:213`) |

## Doc: LESSONS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`extension/overlay.js:507` registers `attachInput(window, 'click', onClick, true)`" | feature | verified | `findstr /n` on that line returns `507:    attachInput(window, 'click', onClick, true);` (`LESSONS.md:12`) |
| "`attachInput` (`:440`) is the wrapper that calls `addEventListener`" | feature | verified | `extension/overlay.js:440` is `function attachInput(target, type, handler, capture) {` (`LESSONS.md:12-13`) |
| "`onClick` (`:356`) returns unless `armed`" | feature | verified | `extension/overlay.js:356` is `function onClick(event) {` (`LESSONS.md:19`) |
| "Corrected in `research/raw/m049-streams.json` at `74d00e63`" | structure | verified | the file exists and `git cat-file -t 74d00e63` → `commit` (`LESSONS.md:16`) |
| the two archived documents it corrects exist | structure | verified | `.project/archive/049-interaction-story/review/FINAL.md` and `.project/archive/049-interaction-story/research/SYNTHESIS.md` (`LESSONS.md:9-10`) |
| the refuted claim itself ("no file in `extension/` registers a `click`, `pointer*`, `mouse*` or `key*` listener") | structure | unverifiable | falsifying it completely needs an enumeration of every listener registration by target and type; this audit confirmed only the one click listener at `:507` (`LESSONS.md:10-11`) |

## Doc: docs/afk-run-2026-10-12.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | feature | stale | asserted at `docs/afk-run-2026-10-12.md:11`, contradicted by `.commandcode/skills` (dir listing), which holds no `verify-angular-dev-app` and only three `verify-*` skills total (`verify-ai-browsers`, `verify-angular-devtools`, `verify-pangular-inspector`) against five `control-*` |
| "added `.audit/` (local briefs and todos) to `.gitignore`" | feature | verified | `.gitignore:15` is `.audit/` (`docs/afk-run-2026-10-12.md:40`) |
| "Research `research/00`-`10`" | feature | verified | `research/` holds `00-browser-probe.md` through `10-model-capabilities.md` (and `11`-`20`) (`docs/afk-run-2026-10-12.md:29`) |
| "`docs/feature-proposals.md` section 8, \"Rulings from Lars\"" | structure | stale | asserted at `docs/afk-run-2026-10-12.md:27`, contradicted by `docs/feature-proposals.md:1038`, which reads `## 8. Decisions for Lars` |
| "check: `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target portal` exit 0 twice" | command | stale | asserted at `docs/afk-run-2026-10-12.md:42`, contradicted by the tree: there is no `.claude` directory, so that command cannot be run as written |
| "upstream bugs go to `docs/filing-ledger.md`" | feature | verified | the file exists (`docs/filing-ledger.md`) (`docs/afk-run-2026-10-12.md:19`) |
| the cited commits resolve | feature | verified | `git cat-file -t d5c7125` → `commit` (`:40`) and `git cat-file -t 916fc09` → `commit` (`:57`) (`docs/afk-run-2026-10-12.md:40`, `:57`) |
| "Only the four standing per-model instances run, each on one blank tab, plus Lars's everyday Edge, which is untouched" | feature | unverifiable | needs a live look at the running browsers (`docs/afk-run-2026-10-12.md:15`) |

## Doc: docs/autonomy-gaps.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ten stops recorded first-hand in the M017 run" | feature | verified | `docs/autonomy-gaps.md` carries exactly ten `## Gap —` headings, at `:21`, `:37`, `:52`, `:66`, `:80`, `:96`, `:110`, `:128`, `:146` and `:164` (`docs/autonomy-gaps.md:6`) |
| the pin citations name the right file and line | config | verified | `scripts/autonomy-gaps.test.mjs:145` is the `G1 prompt pin` test, `:268` the `G9 static pin` test, `scripts/user-scope-autonomy.test.mjs:733` the `P4 serial-retry pin` test, `scripts/docs-audit-disposition.test.mjs:659` the `E6 queue numbers` test (`docs/autonomy-gaps.md:33`, `:160`, `:176`, `:160`) |
| "`node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs` exit 0 — `ℹ tests 15 / ℹ pass 15 / ℹ fail 0`" | command | verified | ran it: `ℹ tests 15`, `ℹ pass 15`, `ℹ fail 0`, with the G1 and G9 titles printed (`docs/autonomy-gaps.md:34`) |
| "`✔ P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails`" | config | verified | that test passes in today's run of `scripts/user-scope-autonomy.test.mjs` (`docs/autonomy-gaps.md:177`) |
| "`node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` exit 0 — … `ℹ tests 18 / ℹ pass 18 / ℹ fail 0`" | command | verified | asserted at `docs/autonomy-gaps.md:177`, contradicted today by the same command, which exits 1 with `ℹ tests 18 / ℹ pass 13 / ℹ fail 5`: the failing tests are `health: check() on the real resolved install reports no issues`, `E4: removing a rule token fails naming that file…`, `P3 check_handoffs pin…`, `E1 helper pin…` and `D1 dispatch pin…` in `scripts/user-scope-autonomy.test.mjs` |
| "`scripts/docs-correction.test.mjs` resolves the chromium build from the strongest in-repo source" | structure | verified | the file exists — and "the installed gate at `…\gsd-path\scripts\check_docs_audit.py` was read for this analysis and never edited" — that path exists (`docs/autonomy-gaps.md:153`, `:158`) |
| "the recipe already lives at `C:\Users\LarsGyrupBrinkNielse\.commandcode\references\gsd-path-autonomy-playbook.md` §31" | structure | verified | the file exists (`docs/autonomy-gaps.md:172`) |

## Doc: docs/design/tutor.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| sections 1–11 exist, including "8. Tiers and dependencies" and "10. Risks and spikes" | structure | verified | read the headings (`findstr /n "^## " docs/design/tutor.md`; file is 702 lines) (`docs/design/tutor.md:527`, `docs/design/tutor.md:661`). |
| TS1–TS12 are all defined, one table row each | structure | verified | counted the twelve `\| TS<n>` rows in section 10 (`docs/design/tutor.md:667-678`). |
| the answer to "is the Prompt API exposed in a worker the panel starts" cites `research/19` and `research/20`; both files exist | integration | verified | `dir /b research` lists `19-languagemodel-in-extension-contexts.md` and `20-built-in-ai-without-flags.md` (`docs/design/tutor.md:368`). |
| "892 signal nodes, 47 components" on `/contract/list` | feature | unverifiable | needs the Insurance Portal checkout and a browser session (`docs/design/tutor.md:366`). |

## Doc: docs/feature-proposals.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the extension is at version 0.3.0 (`extension/manifest.json:4`)" | config | verified | read the manifest, line 4 is `"version": "0.3.0"` (`docs/feature-proposals.md:3`). |
| the N1–N4/N24/N25 panel routes are cited at `apps/angular-ai-devtools/src/app/app.routes.ts:9-16` | structure | stale | asserted at `docs/feature-proposals.md:3`, contradicted by `apps/angular-ai-devtools/src/app/app.routes.ts:114-118`, where those route entries actually are (lines 9–16 are the lazy `loadPanelDemo` closure). |
| the eleventh filing draft is cited at `docs/filing-ledger.md:230` | feature | stale | asserted at `docs/feature-proposals.md:27`, contradicted by `docs/filing-ledger.md:265`, where the draft 11 heading (`## 11. Chromium (Blink>AI): LanguageDetector…`) is (line 230 sits inside draft 7). |
| section 7 holds 23 spike rows S1–S23 | structure | verified | counted the `\| S<n>` rows between the section 7 and section 8 headings (`docs/feature-proposals.md:998-1026`). |
| features N1–N37 exist with N26 explicitly dropped | structure | verified | heading scan shows N36/N37 at lines 780–781 and "N6 Removed"/"N26 dropped" notes (`docs/feature-proposals.md:635`, `docs/feature-proposals.md:780-781`). |
| the evidence files the tables cite exist | structure | verified | `research/raw/tool-name-matrix-gemma4-gpu.json`, `research/raw/bench/nano.json`, `research/raw/vitest-attach-gemma4.json`, `research/raw/ssr-*.json`, `spikes/probes/bench.js`, `spikes/probes/arg-repair-replay.mjs`, `spikes/probes/probe9.js` all present (`docs/feature-proposals.md:198`, `:203`, `:372`, `:511`, `:778`). |
| the `packages/core/…`, `packages/router/…`, `packages/upgrade/…` line citations are angular/angular source, not this tree | structure | unverifiable | needs the Angular repo (`docs/feature-proposals.md:48`, `:226`, `:413`, `:478`). |

## Doc: docs/filing-ledger.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| eleven drafts, each marked "draft, not filed" | feature | verified | the file has `## 1.` … `## 11.` headings with a `Status: draft, not filed` line under each (`docs/filing-ledger.md:5-288`). |
| the Angular DevTools cross-check evidence points at `.claude/skills/verify-angular-devtools/` | feature | stale | asserted at `docs/filing-ledger.md:57`; the repository has no `.claude` directory (`dir` of the root; `Test-Path` on `.claude` is false) and `~/.claude/skills` has no `verify-angular-devtools`, while the skill exists at `.commandcode/skills/verify-angular-devtools/SKILL.md`. |
| the `list-components` evidence is cited as `.claude/skills/control-pangular-inspector/SKILL.md:172` | feature | stale | asserted at `docs/filing-ledger.md:98`; the file is `.commandcode/skills/control-pangular-inspector/SKILL.md` and the claimed content ("0.0.7 has no `list-components`… 46 tools") is at lines 222 and 224, not 172. |
| draft 5's evidence files exist | structure | verified | `research/raw/tool-name-matrix-gemma4-gpu.json`, `research/s1-results/chrome-gemma4-tool-name-pair.json`, `research/s1-results/chrome-gemma4-crash-doctor.json` (`docs/filing-ledger.md:187`). |
| the S11 matrix probe exists | structure | verified | `spikes/probes/tool-name-matrix.js` is in `dir /b spikes/probes` (`docs/filing-ledger.md:143`). |
| draft 11's evidence exists | structure | verified | `research/20-built-in-ai-without-flags.md` and `research/raw/20-built-in-ai-without-flags.json` (`docs/filing-ledger.md:267`). |
| every upstream claim (Chromium tags/lines, `@pangular-inspector/devtools` 0.0.7 behaviour, `@openng/optimus-ui` 2.0.2 source, playwright-mcp README, the WebMCP spec at `d0e4e0e`) | feature | unverifiable | needs those repositories, packages and issue trackers. |

## Doc: plans/angular-ai-devtools-program-backlog.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| generation 1 is twelve milestones M018–M029 with full entries | feature | verified | heading scan shows `### M018` … `### M029` (`plans/angular-ai-devtools-program-backlog.md:95-200`). |
| the queued items Q1–Q4 and generations 2–7 exist | structure | verified | headings at lines 212–400 (`plans/angular-ai-devtools-program-backlog.md:322`, `:400`). |
| `.project/ROADMAP.md` (cited at line 4) exists | structure | verified | `dir /b .project` lists `ROADMAP.md` (`plans/angular-ai-devtools-program-backlog.md:4`). |
| Q3 refreshes `~/Downloads/angular-ai-devtools-features.*` | feature | unverifiable | a user-profile path outside this workspace (`plans/angular-ai-devtools-program-backlog.md:365`). |

## Doc: plans/angular-ai-devtools-proposals.handoff.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:13`, contradicted by `docs/feature-proposals.md` being 1,148 lines (`find /c /v "" docs\feature-proposals.md`). |
| "**Skills (project):** in `.claude/skills/`" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:35`; there is no `.claude` in the repository (root listing, 27 dirs, none named `.claude`), and the named skills live in `.commandcode/skills/` (`control-ai-browsers`, `control-angular-dev-app`, `control-angular-devtools`, `control-pangular-inspector`, `control-vitest-browser-angular`, `verify-*`). |
| the instance registry is `.claude/skills/control-ai-browsers/instances.json` | config | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:42`, contradicted by `.commandcode/skills/control-ai-browsers/instances.json` (read; ports 9333/9334/9335/9337/9338). |
| the five instance ports named (chrome-beta-nano 9333, chrome-beta-gemma4 9334, edge-dev-aion 9335, edge-phi4mini 9337, chrome-stable-nano 9338) match the registry's `instances` block. | config | verified | `plans/angular-ai-devtools-proposals.handoff.md:42` |
| "`research/00` to `research/17`" as the evidence range | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:18`, contradicted by `research/` also holding `18-edge-prevent-auto-signin.md`, `19-languagemodel-in-extension-contexts.md` and `20-built-in-ai-without-flags.md`. |
| the companion package "exports `provideAiDevTools()`, `provideAiNgrxDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxSignalsDevTools()` and `<scope>/vitest` `cdpAttach()`" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:81`, contradicted by `packages/ai-devtools-companion/package.json` (`exports` has only `"."`) and `packages/ai-devtools-companion/src/index.ts:25` (only `provideAiDevTools`); no file under `packages/**` matches `provideAiNgrxDevTools\|provideAiRouterDevTools\|provideAiNgrxSignalsDevTools\|cdpAttach`. |
| "The `globalThis` key is `ngAiDevTools`" | feature | verified | `packages/ai-devtools-companion/src/facade.ts:10` is `export const FACADE_KEY = 'ngAiDevTools';` (`plans/angular-ai-devtools-proposals.handoff.md:81`). |
| "Review history: `tmp/review/`" and "Lars's original request is verbatim in `tmp/review/lars-request.md`" | feature | stale | asserted at `plans/angular-ai-devtools-proposals.handoff.md:44` and `:10`; `tmp/review` does not exist (`dir /b tmp` lists 30+ other entries, no `review`). |
| the probe and fixture inventory it lists exists | structure | verified | `spikes/probes/bench.js`, `regrade.mjs`, `arg-repair-replay.mjs`, `zone-mode.js`, `effect-writes.js`, `tosignal-node.js`, `ssr-*.js`, `vitest-*`; `spikes/ng222-app`, `spikes/ng222-ssr`, `research/raw/`, `research/s1-results/`, `.project/archive/001-run-unrun-spikes` (`plans/angular-ai-devtools-proposals.handoff.md:30`, `:33`). |

## Doc: plans/gsd-path-handoff-M018.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "M018 `instrument-core` shipped and is archived at `.project/archive/018-instrument-core`" | feature | verified | `dir /b .project\archive` lists `018-instrument-core` (`plans/gsd-path-handoff-M018.md:7`). |
| the banner says M019 "is prepared to `plan/done` on `gsd-path/M019` and is ready for `build`" | structure | stale | asserted at `plans/gsd-path-handoff-M018.md:8`; `git branch -a` has no `gsd-path/M019` (current branch is `gsd-path/M052`) and `.project/archive/019-context-and-jobs` exists, so M019 has shipped. |
| "Frozen inventory: **143 documents** from `check_docs_audit.py --repo <root> --emit-inventory`" | feature | stale | asserted at `plans/gsd-path-handoff-M018.md:52`, contradicted by running that command: `python -B "%USERPROFILE%\.commandcode\skills\gsd-path\scripts\check_docs_audit.py" --repo D:\projects\sandbox\angular-ai-devtools --emit-inventory \| find /c /v ""` → 113. |
| `workflow_run.py prepare-inspect` is said to refuse because `.project/research/DOCS-AUDIT.md` exists | structure | verified | that file exists (`dir /b .project\research` → `DOCS-AUDIT.md`, `INSPECT-DELTA.md`, `parts`), so the stated precondition is real (`plans/gsd-path-handoff-M018.md:50`); the refusal itself was not run (see unverifiable below). |
| `pipeline_state.py`, `isolation.py`, `workflow_run.py` exist at the quoted path under `%USERPROFILE%\.commandcode\skills\gsd-path\scripts`, and `INSPECT.md` has 192 lines, so lines 84–111 exist. | structure | verified | `plans/gsd-path-handoff-M018.md:41`, `:52`, `:57` |
| "`isolation.py isolate-verify` requires `--repo --base --name`, and `--base` must be a full 40-character SHA" | command | verified | `isolation.py:5902-5906` defines `isolate-verify` with required `--base` and `--name`, and `isolation.py:163` raises "base must be a full 40-character SHA" (`plans/gsd-path-handoff-M018.md:57`). |
| "Panel initial-bundle budget is **520 KB** (`project.json`, `build-extension`)" | config | verified | `apps/angular-ai-devtools/project.json` `targets.build-extension.options.budgets[0]` is `maximumWarning: "520kb"` (`plans/gsd-path-handoff-M018.md:67`). |
| "M018's envelope must be validated by **six hostile tools**" | feature | verified | `plans/angular-ai-devtools-program-backlog.md:105` says "six hostile tools pass — one write with confirm, one async handle, one image…" (`plans/gsd-path-handoff-M018.md:73`). |
| the `prepare-inspect` refusal and the `gsd report` / `pipeline_state.py route` readings | structure | unverifiable | needs running the pipeline scripts, which mutates pipeline state (`plans/gsd-path-handoff-M018.md:5`, `:50`). |

## Doc: references/ai-browsers-verification.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "each check gives its own `control.mjs` call 600 s (`spawnSync` `timeout: 600000` at `.commandcode/skills/verify-ai-browsers/checks/state.mjs:321`)" | config | verified | `state.mjs:321` is `timeout: 600000,` (`references/ai-browsers-verification.md:32`). |
| extension-panel `timeoutMs` 1800000 at `SKILL.md:49` | config | verified | `verify-ai-browsers/SKILL.md:49` carries `timeoutMs` 1800000 (`references/ai-browsers-verification.md:34`). |
| the `state` step's 900000 timeout is cited as `SKILL.md:49,71` | config | stale | asserted at `references/ai-browsers-verification.md:34`; line 71 is the Gotchas bullet "`state` takes about a minute per instance…" and the `900000` sits on `.commandcode/skills/verify-ai-browsers/SKILL.md:72`. |
| `checks/state.mjs` and `checks/extension-panel.mjs` exist under `.commandcode/skills/verify-ai-browsers/checks/`, and `~/.commandcode/skills/lars-verify/scripts/verdict.mjs` exists with a `lint` command (`verdict.mjs:1311`). | command | verified | `references/ai-browsers-verification.md:3`, `:47` |
| "`extension-panel` also needs the panel built (`npx nx run angular-ai-devtools:build-extension`)" | command | verified | that target exists in `apps/angular-ai-devtools/project.json` (`references/ai-browsers-verification.md:19`). |
| "Ports 9333-9338 belong to the shared instances" | config | verified | `instances.json` holds exactly 9333, 9334, 9335, 9337, 9338 (`references/ai-browsers-verification.md:42`). |
| "Check that port 9992 is free" / "no listener on 9992" | config | unverifiable | needs the live playwright-cli session listing; no file under `.commandcode/skills` or `scripts/` names 9992 (a recursive sweep of the skills tree and `scripts/` found no hit), so it is host state, not a tree fact (`references/ai-browsers-verification.md:42`, `:48`). |

## Doc: references/edge-dev-aion-model.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the pin documentation it defers to exists | config | verified | `.commandcode/skills/control-ai-browsers/features/model-lifecycle.md` (`references/edge-dev-aion-model.md:4`). |
| the commands it names are real subcommands | command | verified | `model pin`, `model download`, `model init`, `model clear`, `up`, `down`, `doctor`, `instances`, `info` all appear in `.commandcode/skills/control-ai-browsers/SKILL.md:270-285` (`references/edge-dev-aion-model.md:3`, `:45`, `:67`, `:69`). |
| `edge-dev-aion` runs with `--disable-component-update` and pins three roots | structure | verified | `.commandcode/skills/control-ai-browsers/instances.json` gives `args: ["--disable-component-update"]` and `pin: ["EdgeLLMOnDeviceModel","EdgeLLMRuntime","EdgeOptimizationGuideModelsManifest"]` (`references/edge-dev-aion-model.md:80`). |
| "The pin now holds 2026.10.15.1 / 2026.10.12.1 / 2026.10.19.1" | config | verified | `dir /b .commandcode\worktrees\.browsers\edge-dev-aion\EdgeLLMOnDeviceModel` → `2026.10.15.1`; `…\EdgeOptimizationGuideModelsManifest` → `2026.10.19.1` (`references/edge-dev-aion-model.md:49`). |
| "The 2026.10.2.1 folders are still on disk and in `tmp/control-ai-browsers/pins/edge-dev-aion.2026.10.2.1`" | feature | stale | asserted at `references/edge-dev-aion-model.md:51`; neither `tmp/control-ai-browsers/pins` (the repo `tmp` has no `pins` directory) nor `.commandcode/worktrees/tmp/control-ai-browsers/pins` exists, and the skill's `model pin` writes under `.commandcode/worktrees/tmp/control-ai-browsers/pins/<name>` (SKILL.md:278). |
| the Edge component-updater measurements, the per-channel manifest table, the 842-input `model.onnx` reading and the Edge 158 results | config | unverifiable | need Edge Dev/Canary installs and the model binaries (`references/edge-dev-aion-model.md:20`, `:44`, `:91`, `:113`). |

## Doc: research/00-browser-probe.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the probe scripts it names all exist | structure | verified | `spikes/probes/probe5.js`, `probe6.js`, `read-throughput.ps1`, `relaunch-instance.ps1`, `seed-perf-class.mjs`, `set-genai-provider.mjs`, `ep-trials.sh`, `tool-name-matrix.js` (`research/00-browser-probe.md:82`, `:189`, `:230`, `:250`, `:272`, `:281`, `:298`). |
| the per-instance port table matches the registry | config | verified | `.browsers/chrome-beta-nano` 9333, `.browsers/chrome-beta-gemma4` 9334, `.browsers/edge-dev-aion` 9335, `.browsers/edge-phi4mini` 9337 (`research/00-browser-probe.md:138-141` vs `.commandcode/skills/control-ai-browsers/instances.json`). |
| the streaming-quirk citation `probe9.js:18-27` holds | structure | verified | lines 18–27 of `spikes/probes/probe9.js` are the `prompt()` then `promptStreaming()` calls inside try blocks (`research/00-browser-probe.md:105`). |
| the S11 answer it points to exists | structure | verified | `research/raw/tool-name-matrix-gemma4-gpu.json` and `research/11-spike-s1-extension-contexts.md` (`research/00-browser-probe.md:300`, `:114`). |
| the flag-state readings, the C:-vs-D: read speeds (1,464/1,558/1,616 MB/s), the NPU and provider trials, and every per-browser model result | config | unverifiable | need the branded browsers with their models (`research/00-browser-probe.md:40`, `:183`, `:254`). |

## Doc: research/01-built-in-ai-apis.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Chrome ships `LanguageModel` to extensions (138+) and the web (148+)", structured output stable, tool calling experimental | feature | unverifiable | needs a Chrome/Edge run at those versions (`research/01-built-in-ai-apis.md:7`). |
| "In Edge the prerelease model is **Aion-1.0-Instruct** (no source for '1.1')" | feature | unverifiable | needs Microsoft/Edge sources; this repo's own registry records the model as `Aion-1.1-Instruct` (`instances.json`), which is a naming choice, not a vendor source (`research/01-built-in-ai-apis.md:8`). |
| "WebMCP is now `document.modelContext` … origin trial in Chrome 149 and Edge 150" and the extension-context claim in section 3 | structure | unverifiable | need those browsers; the in-repo confirmation is `research/11` (itself browser-measured) (`research/01-built-in-ai-apis.md:10`, `:126`). |

## Doc: research/02-angular-surface.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the probe and raw files it cites exist | structure | verified | `spikes/probes/zone-mode.js`, `research/raw/zone-mode-portal.json`, `research/raw/zone-mode-portal-zonejs.json` (`research/02-angular-surface.md:275`). |
| no local path is claimed broken: every non-existent path in this document is an angular/angular source path (`packages/core/…`, `packages/router/…`, `packages/platform-browser/…`), matched one-for-one against the file's "How `ng` gets populated" section. | structure | verified | `research/02-angular-surface.md:19-24`, `:281`, `:299` |
| the `ng` global inventory, the DevTools call list and the 22.x feature claims | feature | unverifiable | need the Angular 22.2 source tree and a running DevTools session (`research/02-angular-surface.md:28`, `:119`, `:265`). |

## Doc: research/03-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the in-repo path it names exists | structure | verified | `docs/feature-proposals.md` (`research/03-prior-art.md:187`). |
| the Pangular, React DevTools, Chrome DevTools AI, Vue/Nuxt/React Scan/Redux/Svelte/Solid/Million entries and the Chrome DevTools MCP tool list | feature | unverifiable | need those repositories and the installed extensions (`research/03-prior-art.md:13`, `:23`, `:164`, `:218`). |
| the Pangular extension inventory `extension/manifest.json`, `background.js`, `content-script.js`, `detect-angular.js`, `devtools.js`, `panel-bridge.js`, `panel-actions.js` | config | unverifiable | those are Pangular's files, not this repository's (`extension/` here holds `manifest.json`, `background.js`, `devtools.js` and none of the other four), so they need the Pangular checkout (`research/03-prior-art.md:31-34`). |

## Doc: research/04-ecosystem.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the proposals cross-reference exists | structure | verified | `docs/feature-proposals.md` (`research/04-ecosystem.md:78`). |
| the Vitest version it observed (5.0.3) matches the fixture's install | config | verified | `spikes/ng222-app/package.json` devDependency `vitest: 5.0.3`, `@vitest/browser 5.0.3` (`research/04-ecosystem.md:129`). |
| the NgRx, Analog, Storybook and RxAngular internals, and the vitest.dev page header reading | feature | unverifiable | need those packages and that page (`research/04-ecosystem.md:19`, `:73`, `:100`, `:129`). |

## Doc: research/05-spikes.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the S16 evidence and probe scripts exist | structure | verified | `research/raw/s16-meta-lookup.json`, `spikes/probes/s2b.js`, `portal-probe.js`, `zone-mode.js`, `bench.js`, `effect-writes.js`, `tool-session-matrix.js`, `regrade.mjs` (`research/05-spikes.md:18`, `:45`, `:56`, `:70`, `:79`, `:116`, `:133`, `:166`). |
| "S17, S18, S19 recorded **blocked** — … no probe script named for these spikes" | feature | stale | asserted at `research/05-spikes.md:220-222`; S19's probe exists: `spikes/probes/arg-repair-replay.mjs` ("Replays every tool call saved by bench.js through a deterministic validate-and-repair step") with evidence `research/raw/arg-repair-replay.json` (both also cited by `docs/feature-proposals.md:511`). |
| the app it describes is the fixture | feature | verified | `spikes/ng222-app` installs `@angular/core` 22.2.2 (`node -p require('…/@angular/core/package.json').version`) and `spikes/ng222-app/src/app/counter.ts` exists (`research/05-spikes.md:25`). |
| the blocked-spike evidence files exist | structure | verified | `research/raw/s17-blocked.json`, `s18-blocked.json`, `s19-blocked.json`, `s14-blocked.json`, `TS1…TS12-blocked.json`, `E1…E13-blocked.json`, `s4-blocked.json` (`research/05-spikes.md:222`, `:226`, `:232`, `:236`). |
| "served with `ng serve --port 4222`" and every measured count in the benchmark tables | command | unverifiable | need the dev server and the model browsers (`research/05-spikes.md:25`, `:77`, `:164`, `:201`). |

## Doc: research/06-angular-skills.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Skill 1: `angular-developer/SKILL.md` (132 lines)" | feature | stale | asserted at `research/06-angular-skills.md:12`, contradicted by `%USERPROFILE%\.commandcode\skills\angular-developer\SKILL.md` being 147 lines (`find /c /v ""`). |
| "Skill 2: `angular-new-app/SKILL.md` (63 lines)" | feature | verified | that skill's `SKILL.md` is 63 lines (`research/06-angular-skills.md:56`). |
| the rule inventory in section 2 and the feature ideas | structure | unverifiable | they depend on reading the two skills' contents against a dev-mode app (`research/06-angular-skills.md:62`, `:108`). |

## Doc: research/07-prompting-small-models.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "System prompt (116 Aion tokens, 528 characters)" | feature | verified | the quoted block measures exactly 528 characters (extracted the fenced block after the heading; `node -e` length count) (`research/07-prompting-small-models.md:235-247`). |
| the correction's probe and evidence exist | structure | verified | `spikes/probes/tool-name-matrix.js`, `research/raw/tool-name-matrix-gemma4-gpu.json` (`research/07-prompting-small-models.md:361`, `:363`). |
| the measured raw files it cites for the benchmark exist | structure | verified | `research/raw/bench/*.json` (`dir /b research\raw\bench` lists `gemma4.json`, `nano.json`, `nano-gpu.json`) (`research/07-prompting-small-models.md:166`). |
| the per-model prompting guidance, the token counts per model and the tool-calling/structured-output behaviour on each model | feature | unverifiable | need the model browsers (`research/07-prompting-small-models.md:48`, `:127`, `:142`). |

## Doc: research/08-recent-angular-features.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the evidence files exist | structure | verified | `research/raw/m036-resource-graph.json`, `research/raw/zone-mode-portal.json`, `research/raw/zone-mode-portal-zonejs.json`, `research/raw/tosignal-node-portal.json`, and `research/02-angular-surface.md` (`research/08-recent-angular-features.md:130`, `:137`, `:145`, `:247`). |
| the version floor statements match installed versions where they are local | config | verified | the workspace runs `@angular/core` 22.1.8 and the fixture 22.2.2, so the "22.1"/"22.2" sorted rows in the features table stay consistent with this tree (`research/08-recent-angular-features.md:114`). |
| the release notes, the CHANGELOG reads (`CL:1-2`, `CL:370-438`, …) and the GitHub release list | feature | unverifiable | the local changelog is not in this repository and no `@angular/core/CHANGELOG.md` ships in `node_modules` (checked both `node_modules` and the fixture's) (`research/08-recent-angular-features.md:50`, `:52`). |
| the "Newer than the local changelog" rows (22.2.1, 22.2.2, 22.3.0-next.0/next.1) | feature | unverifiable | need the Angular repo at their heads (`research/08-recent-angular-features.md:54`). |

## Doc: research/09-nano-tool-session-error.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the two `research/05-spikes.md` sections it points to exist | structure | verified | "Root cause hunt…" at line 131 and "Prediction confirmed: Nano gets tool sessions with `AIPromptAPIToolUse` alone" at line 153 (`research/09-nano-tool-session-error.md:144`). |
| the `research/10-model-capabilities.md` "Matrix" it points to exists at line 41. | structure | verified | `research/09-nano-tool-session-error.md:144` |
| every Chromium source citation (tag `156.0.8078.17`, `language_model.cc`, `ai_manager.cc`, `runtime_enabled_features.json5`), the spec at commit `8040b81`, crbug 422803232/417817645 and the prompt-api issues | integration | unverifiable | needs those repositories and trackers (`research/09-nano-tool-session-error.md:22`, `:72`, `:89`, `:113`, `:116`). |

## Doc: research/10-model-capabilities.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the model manifest citation `.commandcode/worktrees/.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.21.1028/manifest.json` | config | stale | asserted at `research/10-model-capabilities.md:30`, contradicted by `dir /b .commandcode\worktrees\.browsers\chrome-beta-nano\OptGuideOnDeviceModel` → `2025.8.8.1141` only. |
| "`spikes/probes/bench/nano.json`" as a local file | structure | stale | asserted at `research/10-model-capabilities.md:31`; `spikes/probes/` has `bench.js`, `bench-all.sh`, `bench-summary.mjs` but no `bench/` directory, and `git log --all -- spikes/probes/bench` returns nothing, so the path never existed in this repository. |
| "Copy: `research/raw/bench/nano.json`, but the file was overwritten by the second benchmark round" | structure | verified | `research/raw/bench/nano.json` and `nano-gpu.json` both exist (`research/10-model-capabilities.md:31`). |
| the S11 and S16 evidence exists | structure | verified | `research/raw/matrix-nano-tooluse.json`, `research/raw/tool-name-matrix-gemma4-gpu.json`, `spikes/probes/regrade.mjs` (`research/10-model-capabilities.md:45`, `:88`). |
| the vendor model-card readings (H1/H2/G2/GB/MK/C1/C2 cells), the Hugging Face `tokenizer_config.json` lines and the Aion sample repo's `docs/prompt-guide.md` | config | unverifiable | need those external sources (`research/10-model-capabilities.md:26`, `:46`). |

## Doc: research/11-spike-s1-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`spikes/s1-extension/` (retired in M009; evidence and archived notes live under `.project/archive/001-run-unrun-spikes/`)" | feature | verified | `spikes/` holds only `ng222-app`, `ng222-ssr`, `probes`; `.project/archive/001-run-unrun-spikes` exists (`research/11-spike-s1-extension-contexts.md:11`, `:13`). |
| "`probe5.js` … camelCase tool names, `getComponentCount` and `getComponentInputs` (`probe5.js:15-16`)" | structure | verified | `spikes/probes/probe5.js:15-16` are exactly those two tool declarations (`research/11-spike-s1-extension-contexts.md:75`). |
| the phase-2 evidence files exist | structure | verified | `research/s1-results/chrome-fresh.json`, `edge-fresh.json`, `chrome-gemma4.json`, `edge-aion.json`, `chrome-gemma4-crash-doctor.json`, `chrome-gemma4-tool-name-pair.json`, and `research/raw/tool-name-matrix-gemma4-gpu.json` (`research/11-spike-s1-extension-contexts.md:15`, `:54`, `:80`, `:84`). |
| the standing instances and ports it names match the registry | config | verified | `chrome-beta-gemma4` 9334, `edge-dev-aion` 9335 (`research/11-spike-s1-extension-contexts.md:5`). |
| `probe6.js`/`probe10.js` exist in `spikes/probes/`. | structure | verified | `research/11-spike-s1-extension-contexts.md:11` |
| every context-exposure result, the crash counts and the `NotAllowedError` on `devtools_page` | feature | unverifiable | need the branded browsers with their models (`research/11-spike-s1-extension-contexts.md:73`, `:80`). |

## Doc: research/12-legacy-vs-modern-angular.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "a development build of the 22.2 spike app (unminified, 968 `ngDevMode` references)" | feature | stale | asserted at `research/12-legacy-vs-modern-angular.md:27`, contradicted by `spikes/ng222-app/dist/ng222-app/browser/main.js` now holding 1,029 `ngDevMode` occurrences (`node -e` count over the file), so the bundle was rebuilt after the measurement. |
| "`spike main.js:37258-37267`" and "`spike main.js:37270`" for the `ɵsetClassDebugInfo(Counter, …)` lines | feature | stale | asserted at `research/12-legacy-vs-modern-angular.md:56`, contradicted by `spikes/ng222-app/dist/ng222-app/browser/main.js` being 32,195 lines, so both citations point past EOF. |
| Reading the cited artifact depends on it: the file that `spike main.js` is defined as exists | structure | verified | `spikes/ng222-app/dist/ng222-app/browser/main.js` is present and is the 22.2 fixture build (`research/12-legacy-vs-modern-angular.md:27`). |
| the debug-info payload it quotes holds on the fixture side | structure | verified | `spikes/ng222-app/src/app/counter.ts:15` is `export class Counter {`, matching `filePath: "src/app/counter.ts", lineNumber: 15` (`research/12-legacy-vs-modern-angular.md:56`). |
| the zone-mode evidence it cites exists | structure | verified | `research/raw/zone-mode-portal.json` and `research/raw/zone-mode-portal-zonejs.json` (`research/12-legacy-vs-modern-angular.md:106`, `:120`). |
| the `packages/core/…`, `packages/router/…` and `packages/upgrade/…` line citations | feature | unverifiable | angular/angular source, not this tree (`research/12-legacy-vs-modern-angular.md:11`, `:70`). |

## Doc: research/13-portal-legacy-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the measured evidence directory `tmp/control-angular-dev-app/portal-4775-2026-10-12T07-18-44-815Z/` | structure | stale | asserted at `research/13-portal-legacy-audit.md:43`; `dir /b tmp\control-angular-dev-app` lists ~110 run directories (`counter-*`, `portal-*`, `ssr-*`, `url-4222-*`) and none is that one. |
| the zoneless-mode evidence exists | structure | verified | `research/raw/zone-mode-portal.json` (`research/13-portal-legacy-audit.md:17`). |
| "Two optimus-ui incompatibilities are drafted in `docs/filing-ledger.md` (6 and 7)" | feature | verified | drafts 6 and 7 are at `docs/filing-ledger.md:189` and `docs/filing-ledger.md:219` (`research/13-portal-legacy-audit.md:43`). |
| every portal file:line (`apps/insurance-portal/project.json:18,10,53`, `libs/claim/…`) and the commits `754aa1e`/`66e8ad6`/`92053b9`/`cc9ce25` | structure | unverifiable | the Insurance Portal checkout is outside this workspace (`research/13-portal-legacy-audit.md:9`, `:17`, `:43`). |

## Doc: research/14-ai-devtools-prior-art.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the two in-repo documents it cross-references exist | structure | verified | `docs/feature-proposals.md` (`research/14-ai-devtools-prior-art.md:11`) and `docs/filing-ledger.md` (`:426`). |
| the WebMCP spec at `webmachinelearning/webmcp` `d0e4e0e`, the Chrome WebMCP pages, `GoogleChromeLabs/webmcp-extension` (`extension/content.ts`), playwright-mcp, chrome-devtools-mcp, nuxt-mcp-dev and the Storybook docgen manifest (`docs/definition.ts:359-419`) | config | unverifiable | all external repositories and pages (`research/14-ai-devtools-prior-art.md:79`, `:88`, `:218`, `:234`, `:249`, `:323`). |
| the "measured" labels on Angular's own WebMCP source (`packages/core/src/webmcp/types.ts`, `packages/forms/signals/src/webmcp/registration.ts`) | structure | unverifiable | angular/angular source (`research/14-ai-devtools-prior-art.md:88`, `:90`). |

## Doc: research/15-deterministic-and-ai.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the attach command is written as `node .claude/skills/control-ai-browsers/scripts/control.mjs attach chrome-beta-gemma4` | command | stale | asserted at `research/15-deterministic-and-ai.md:211`; `~/.claude/skills` has no `control-ai-browsers` and the repository has no `.claude`, while the script exists at `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (its table lists `attach <name>`, `SKILL.md:272`). |
| the tuple/evidence file it cites exists | structure | verified | `research/raw/tosignal-node-portal.json` (`research/15-deterministic-and-ai.md:31`). |
| the retired runner is flagged as retired on the same line and the tree agrees | structure | verified | `spikes/s1-extension/` is absent (`spikes/` holds `ng222-app`, `ng222-ssr`, `probes`) and `.project/archive/001-run-unrun-spikes` exists (`research/15-deterministic-and-ai.md:211`). |
| the worker-context probe steps 1–10 and their "done when" criteria | feature | unverifiable | the spike was not run (`research/15-deterministic-and-ai.md:195-230`). |

## Doc: research/16-ssr-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| all five probes it names exist | structure | verified | `spikes/probes/ssr-hydration.js`, `ssr-transfer.js`, `ssr-event-replay.js`, `ssr-render-modes.js`, `ssr-defer.js` (`research/16-ssr-runtime.md:220-224`). |
| all five raw files it names exist | structure | verified | `research/raw/ssr-hydration.json`, `ssr-transfer.json`, `ssr-event-replay.json`, `ssr-render-modes.json`, `ssr-defer.json` (`research/16-ssr-runtime.md:38`, `:55`, `:84`, `:116`, `:143`). |
| the fixture endpoint it describes exists | integration | verified | `spikes/ng222-ssr/src/server.ts` is present, so `app.get('/api/items') in src/server.ts` is a real file claim (`research/16-ssr-runtime.md:22`). |
| the SSR measurements themselves (hydration marks, `ng-server-context`/`ngcm`, Transfer State, the absence of `Server-Timing`, the `@defer` and event-replay results) | feature | unverifiable | need the SSR dev server and a browser (`research/16-ssr-runtime.md:34`, `:187`, `:198`). |

## Doc: research/17-vitest-browser-runtime.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the runner "`spikes/probes/vitest-attach.mjs`", including the two run lines that invoke it | structure | stale | asserted at `research/17-vitest-browser-runtime.md:38`, `:124`, `:172`; `dir /b spikes\probes` lists `vitest-lib.mjs` and `vitest-iframe-probe.js` and no `vitest-attach.mjs`. |
| the second probe and the raw evidence exist | structure | verified | `spikes/probes/vitest-iframe-probe.js`, `research/raw/vitest-attach-gemma4.json`, `vitest-chromium-bundled.json`, `vitest-attach-gemma4-newcontext.json`, `vitest-attach-gemma4-doctor-before.json`/`-after.json` (`research/17-vitest-browser-runtime.md:25-39`). |
| the fixture config and the spec it names exist | config | verified | `spikes/ng222-app/vitest-attach.config.mts`, `spikes/ng222-app/src/app/counter.spec.ts` (`research/17-vitest-browser-runtime.md:61`, `:106`). |
| the attach-route results (content scripts in both worlds of the tester iframe, `LanguageModel` present in the iframe, the new-context failure) | structure | unverifiable | need Chrome Beta with Gemma 4 on the attach route (`research/17-vitest-browser-runtime.md:30`, `:81`). |

## Doc: research/18-edge-prevent-auto-signin.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the skill citation `.commandcode/skills/control-ai-browsers/SKILL.md:311-312` for "the skill relies on the `ms*` switches alone" | feature | stale | asserted at `research/18-edge-prevent-auto-signin.md:8`; line 311 is `## Gotchas` and line 312 is "Measured 2026-10-11/12 unless marked inferred", while the switches are described at `.commandcode/skills/control-ai-browsers/SKILL.md:314-316`. |
| "HKCU Edge policies are deliberately _not_ used" | feature | verified | `reg query "HKCU\Software\Policies\Microsoft\Edge"` returns "ERROR: The system was unable to find the specified registry key or value", so no such policies are applied on this host (`research/18-edge-prevent-auto-signin.md:8`). |
| the `ms*` switch subset it names is what the Edge instances pass | feature | verified | `.commandcode/skills/control-ai-browsers/instances.json` `browsers.edge-dev.browserArgs` contains `msImplicitSignin`, `msImplicitSignInNetworkRetry`, `msProfileSignIn`, `msOneAuthWAM`, `msLoadOneAuthInBackground`, `msSeamlessWebToBrowserSignIn`, `msForceBrowserSignIn`, `msEnableWebToBrowserSignIn`, `msEnableAADWebToBrowserSignIn`, `msEnableProfileAADAccountSSO`, `msEdgeOSAccountInfoSubstrate`, `msPrimaryOSAccountInfoCache`, `msEdgeOSAccountInfoManagerCache`, `msQuickAuthToBrowserSignIn`, `msEdgeSignInAccountPicker`, `msWAMSovereigntySignIn`, `msWAMAdminModeSignIn` (`research/18-edge-prevent-auto-signin.md:49`, `:98`). |
| the Microsoft Learn policy text, WebView2Feedback #5722, the Edge 155/157 auth-library behaviour and the `edge://policy` / `edge://signin-internals` verification steps | feature | unverifiable | need network reads and a live Edge session with those policies applied (`research/18-edge-prevent-auto-signin.md:51`, `:121`, `:129`, `:154`). |

## Doc: research/19-languagemodel-in-extension-contexts.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the raw results file exists | structure | verified | `research/raw/19-languagemodel-contexts.json` (`research/19-languagemodel-in-extension-contexts.md:13`). |
| "`ExtensionPromptService` now calls `LanguageModel` in the panel itself" | feature | verified | `apps/angular-ai-devtools/src/app/extension-prompt.service.ts` exists and every panel explainer imports it (`research/19-languagemodel-in-extension-contexts.md:40`). |
| both cross-references exist | structure | verified | `docs/feature-proposals.md` section 3.1 at line 300, and `plans/prompt-api-browser-pairs.afk.md` (`research/19-languagemodel-in-extension-contexts.md:8`, `:38`). |
| the Chromium document `docs/experiments/prompt-api-for-extension.md` and the five browser-model context rows | integration | unverifiable | the document is in the Chromium tree and the rows need those browsers (`research/19-languagemodel-in-extension-contexts.md:31`, `:18`). |

## Doc: research/20-built-in-ai-without-flags.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the raw results file exists, including the `workers` section it cites | structure | verified | `research/raw/20-built-in-ai-without-flags.json` (`research/20-built-in-ai-without-flags.md:12`, `:38`). |
| `up <name> --no-ai-features` is a real subcommand form | command | verified | `.commandcode/skills/control-ai-browsers/SKILL.md:271` documents `up <name> [--backend=gpu\|cpu] [--extension=<dir>] [--no-ai-features]` (`research/20-built-in-ai-without-flags.md:19`, `:72`). |
| "Filing draft: `docs/filing-ledger.md` item 11" | feature | verified | draft 11 is at `docs/filing-ledger.md:265` (`research/20-built-in-ai-without-flags.md:53`). |
| the per-context availability matrix, the worker runs, the renderer crash and the Crashpad reports | feature | unverifiable | need the four browsers with their models and no flags (`research/20-built-in-ai-without-flags.md:30`, `:44`, `:53`). |

## Doc: research/spikes/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`.project/research/` holds exactly one file — the carry-forward `DOCS-AUDIT.md`" | structure | stale | asserted at `research/spikes/README.md:17`; `dir /b .project\research` lists `DOCS-AUDIT.md`, `INSPECT-DELTA.md` and `parts`. |
| "that file is 3,352 bytes here" for `s11-answer.md` | structure | verified | `research/spikes/s11-answer.md` measures 3,352 bytes (`research/spikes/README.md:24`). |
| the six documents it tabulates all exist at the paths it gives (`s11-answer.md`, `s12-answer.md`, `s13-answer.md`, `capability-dependency-matrix.md`, `instrumentation-free-coverage.md`, `sourcemap-future-scope.md`). | structure | verified | `research/spikes/README.md:7-15` |
| "`research/raw/m040-work-events.json`" exists, and `archive_milestone.py` contains `require_clean_active_root` (`grep`/read of `%USERPROFILE%\.commandcode\skills\gsd-path\scripts\archive_milestone.py`). | command | verified | `research/spikes/README.md:18`, `:21` |
| "The 16-row capability → application-dependency matrix" | feature | verified | §1 of that file has 16 numbered rows (`research/spikes/README.md:12`). |

## Doc: research/spikes/capability-dependency-matrix.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the matrix has 16 rows and the counts table says `Rows 16` per column | structure | verified | counted the `\| <n> \|` rows between `## 1. Matrix` and `## 2. Counts` (`research/spikes/capability-dependency-matrix.md:63-110`). |
| "`.project/research/m040-performance-narrator.md`" | feature | stale | asserted at `research/spikes/capability-dependency-matrix.md:84`; that path does not exist (`dir /b .project\research`), and the file lives at `.project/archive/040-performance-narrator/research/m040-performance-narrator.md`. |
| the abbreviated citation `mw/error-capture.ts:42-54` resolves to `src/main-world/error-capture.ts:42-54`, which is the `ɵgetOwningComponent` alias branch it describes. | feature | verified | `research/spikes/capability-dependency-matrix.md:127` |

## Doc: research/spikes/instrumentation-free-coverage.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "`(.project/research/capability-dependency-matrix.md:74-84)`" | feature | stale | asserted at `research/spikes/instrumentation-free-coverage.md:60`; that path does not exist and the file is `research/spikes/capability-dependency-matrix.md` (whose rows 6–15 are at lines 75–84). |
| "`(.project/research/m040-performance-narrator.md:207-215)`" | feature | stale | asserted at `research/spikes/instrumentation-free-coverage.md:319`; the file is `.project/archive/040-performance-narrator/research/m040-performance-narrator.md`. |
| the code paths it cites all exist | structure | verified | `extension/agent-main.js`, `stale-view-worker.js`, `manifest.json`, `lint-core.js`, `router-diagnostic.js`, `legacy-structure.js`, `field-state.js`, `redirect-chain.js`, `sanitizer-triage.js`, `after-render.js`, `linked-state.js`, `render-phase.js`, `performance-narrator.js`, `packages/ai-devtools-companion/src/index.ts`, `spikes/ng222-app/src/app/app.config.dev.ts` (`research/spikes/instrumentation-free-coverage.md:32-101`). |

## Doc: research/spikes/s11-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "the two console joins cut the stack before reading anything (`extension/lint-core.js:100,124`, `extension/router-diagnostic.js:52,66`)" | feature | verified | `lint-core.js:100` and `router-diagnostic.js:52` are `const STACK_FRAME = /\n\s+at\s/;`, and lines 124/66 are `function bodyOf(text)` (`research/spikes/s11-answer.md:41`). |
| "Measured over the sixteen shipped/repository features in `.project/research/capability-dependency-matrix.md`" | feature | stale | asserted at `research/spikes/s11-answer.md:36`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md`. |
| "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" | structure | unverifiable | needs the portal checkout and its production build (`research/spikes/s11-answer.md:50`). |

## Doc: research/spikes/s12-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "(`lift 0 / narrow 0 / changes nothing 16`, `.project/research/capability-dependency-matrix.md` §3)" | feature | stale | asserted at `research/spikes/s12-answer.md:4`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md` (its §3 is at line 152). |
| the panel file it names exists | structure | verified | `extension/panel/index.html` (`research/spikes/s12-answer.md:449`). |
| the portal build measurements behind the insight-class answer (resolvable `main-*.js.map` with embedded `sourcesContent`, AOT template mapping precision) | feature | unverifiable | need the portal checkout and a build (`research/spikes/s12-answer.md:33`). |

## Doc: research/spikes/s13-answer.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "8 streams, 7 reachable with no app cooperation" | feature | verified | the stream table has 8 numbered rows and the verdict reads "Seven of eight streams are reachable" (`research/spikes/s13-answer.md:100-228`, `:390`). |
| "Rows are the matrix's rows (`.project/research/capability-dependency-matrix.md` §1)" | feature | stale | asserted at `research/spikes/s13-answer.md:315`; that path does not exist; the file is `research/spikes/capability-dependency-matrix.md`. |
| the target section names `tmp/control-angular-dev-app/state/portal.json` | structure | stale | asserted at `research/spikes/s13-answer.md:34`; `tmp/control-angular-dev-app/state/` exists but is empty, and no run directory under `tmp/control-angular-dev-app` holds a `state/portal.json`. |
| the two control scripts it names exist | structure | verified | `.commandcode/skills/control-angular-dev-app/scripts/control.mjs` and `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (`research/spikes/s13-answer.md:18`, `:22`). |

## Doc: research/spikes/sourcemap-future-scope.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| the legend rows `\| \`MX\` \| .project/research/capability-dependency-matrix.md \|` and `\| \`IFC\` \| .project/research/instrumentation-free-coverage.md \|` | feature | stale | asserted at `research/spikes/sourcemap-future-scope.md:24-25`; neither path exists and both files are under `research/spikes/`. |
| the two documents it measures against exist | structure | verified | `.project/ROADMAP.md` and `plans/angular-ai-devtools-program-backlog.md` (`research/spikes/sourcemap-future-scope.md:22-23`). |
| the `bM0xx` milestone ranges it cites are the backlog's generations 3–7 numbering | feature | verified | the backlog has generations 2–7 at lines 212–292, and the file's `bM043`–`bM132` bands are its own labels for them (`research/spikes/sourcemap-future-scope.md:184`, `:231`, `:270`, `:304`). |

## Doc: spikes/ng222-app/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This project was generated using Angular CLI version 22.2.2" | command | verified | `spikes/ng222-app/node_modules/@angular/cli/package.json` reports version 22.2.2 (`spikes/ng222-app/README.md:3`). |
| `ng serve` on `http://localhost:4200/` and `ng test` with Vitest | command | verified | `angular.json` `projects.ng222-app.architect` has `serve` with no port override (CLI default 4200) and `test` with builder `@angular/build:unit-test`, and the fixture installs `vitest 5.0.3` (`spikes/ng222-app/README.md:7-11`, `:39-45`). |
| "For end-to-end (e2e) testing, run: `ng e2e`" | command | stale | asserted at `spikes/ng222-app/README.md:47-52`; `angular.json` `projects.ng222-app.architect` has only `build`, `serve` and `test`, so there is no `e2e` target for that command to run. |

## Doc: spikes/ng222-ssr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "This fixture was generated with `--skip-tests` and tracks no `*.spec.ts`" | structure | verified | a recursive scan of `spikes/ng222-ssr` (skipping `node_modules`/`dist`) returns zero `*.spec.ts`, and `angular.json` has no `test` target (`spikes/ng222-ssr/README.md:41-45`). |
| "For end-to-end (e2e) testing, run: `ng e2e`" | command | stale | asserted at `spikes/ng222-ssr/README.md:47-52`; `angular.json` `projects.ng222-ssr.architect` has `build` and `serve` only. |
| "generated using Angular CLI version 22.2.2" | command | unverifiable | the fixture has no `node_modules` installed (`spikes/ng222-ssr/node_modules` is absent), so the generating CLI cannot be confirmed; `package.json` declares `@angular/cli ^22.2.2` (`spikes/ng222-ssr/README.md:3`). |

## Descriptive docs

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
| 1062 | docs/afk-run-2026-10-12.md | "All eight skills (`control-` and `verify-` for ai-browsers, angular-dev-app, angular-devtools, pangular-inspector) are committed" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1111 | research/spikes/s11-answer.md | "the zoneless portal's production build emits 0 `.map` files and only `development` sets `sourceMap` in `apps/insurance-portal/project.json`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1185 | .commandcode/skills/control-angular-devtools/SKILL.md | "Every other script has a `node:test` file beside it (`*.test.mjs`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1271 | research/spikes/s11-answer.md | "Measured over the sixteen shipped/repository features in `.project/research/capability-dependency-matrix.md`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1278 | .commandcode/pstack-models.md | "The pstack effort agents (`effort-low`, `effort-medium`, `effort-high`, `effort-xhigh`, `effort-max`) set `reasoningEffort` in their frontmatter" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1279 | .commandcode/pstack-models.md | "Free models available: `poolside/laguna-s-2.1-free`, `reflection/beam:free`, `minimax/minimax-m3.1-flash:free`, `stealth/glyph-cluster:free`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1280 | .commandcode/pstack-models.md | the benchmark table ("winner: `reflection/beam:free` @medium (49s, 384K tokens)", `pstack-models.md:9-17`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1281 | .commandcode/pstack-models.md | "On Command Code, the model slug is passed to the `agent` tool's `model` parameter" and "Command Code has no SessionStart hook; the `session hook` line here is inert" (`pstack-models.md:5`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1282 | .commandcode/pstack-models.md | "`session hook: off` stops the Claude Code or Codex SessionStart hook, or the pstack Pi extension, from injecting the poteto-mode mandate" (`pstack-models.md:3`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1283 | .commandcode/skills/control-ai-browsers/SKILL.md | "Every other script has a `node:test` file beside it (`*.test.mjs`)" (`SKILL.md:307`) | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1284 | .commandcode/skills/control-ai-browsers/SKILL.md | the measured launch/doctor numbers | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1285 | .commandcode/skills/control-ai-browsers/SKILL.md | every Gotcha that records a browser measurement (Edge self sign-in and the sync prompt, the idle `about:blank` tab that blocks `playwright-cli`, Edge model-update drift, `OnDeviceAiDefaultEnabled`, the `callID`/`callId` acceptance per version, the ReFS free-space lag, D: read throughput) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1286 | .commandcode/skills/control-ai-browsers/features/README.md | "The five instances run … (`C instances` shows them with no drift)" and "`C doctor <name>` exits 0" (`features/README.md:11-15`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1287 | .commandcode/skills/control-ai-browsers/features/di-doctor.md | the driven panel interaction (select "DI Doctor", pick a component, read the path/diff, "Explain" answering through the instance's model, the empty-until-selected path list) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1288 | .commandcode/skills/control-ai-browsers/features/error-explainer.md | the driven run (the panel showing the injected NG0100, its component, its digest entry, and a non-empty answer) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1289 | .commandcode/skills/control-ai-browsers/features/extension-panel.md | the measured answer times (12.9 s / 13.6 s / 5.6 s / 3.1 s / 8.4 s, `extension-panel.md:49`), the `Prompt API: ready` line, "Where `LanguageModel` works (measured … in all five pairs, `research/19`)", the `extension-panel-<uuid>_<n>` panel key and the `chrome-extension://<id>/panel/` frame URL | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1290 | .commandcode/skills/control-ai-browsers/features/health-check.md | "Run `C doctor chrome-beta-gemma4`. Exit 0 and nineteen check lines" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1291 | .commandcode/skills/control-ai-browsers/features/health-check.md | the Broker State readings and per-instance backend rows (`gemma4_gpu_low_tier_model`, `nano_v3_gpu_low_tier_model`, `edge_base_model_gpu`, "GPU (fastest inference)", "matches the pin of <date>", the `mismatch`/`in-flight` examples, the measured canary times, the stored performance classes) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1292 | .commandcode/skills/control-ai-browsers/features/instances.md | the live `C instances` and `C flags` output (PIDs, "no drift", per-instance feature verdicts) and the down/up backend flip | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1293 | .commandcode/skills/control-ai-browsers/features/interop.md | "Required panel test ids: `interop-slice` …, `interop-limit` …, `interop-inferred` …, plus the shared `explain`, `ai-answer`, `empty-state` and `owning-component`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1294 | .commandcode/skills/control-ai-browsers/features/interop.md | "Zero interop nodes renders an explicit empty state (\"no interop nodes\")" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1295 | .commandcode/skills/control-ai-browsers/features/interop.md | "evidence `.project/build/verify/interop/`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1296 | .commandcode/skills/control-ai-browsers/features/interop.md | the live run behind those numbers (the panel rendering the slice, the three limits and a non-empty answer) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1297 | .commandcode/skills/control-ai-browsers/features/model-lifecycle.md | every recorded size and version | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1298 | .commandcode/skills/control-ai-browsers/features/probes.md | the recorded probe and benchmark results (a `q1.answer` naming 42 on `edge-dev-aion`, the Nano prose answer, latency comparisons) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1299 | .commandcode/skills/control-ai-browsers/features/signal-provenance.md | the panel behaviour (chain rendering from recorded facts, anti-pattern findings on two differing snapshots, the cached "Explain" answer, "Explain is disabled while the Prompt API is unavailable") | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1300 | .commandcode/skills/control-ai-browsers/features/stale-view.md | the driven run (findings list, the hedged wording "the template may show a stale value", field name, owning component, "Explain" answer) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1301 | .commandcode/skills/control-angular-dev-app/SKILL.md | "`provideRouter(routes)` over the two routes `src/app/app.routes.ts:5-8` declares, `/stale-view` and `/stale-view-deferred` (read 2026-11-01)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1302 | .commandcode/skills/control-angular-dev-app/SKILL.md | "`.commandcode/skills/control-angular-dev-app/scripts/control.mjs:69` keeps it at 3000" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1303 | .commandcode/skills/control-angular-dev-app/SKILL.md | the Scripts signature `scripts/control.mjs <command> [--target counter\|ssr\|portal] …` omits a target the script accepts | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1304 | .commandcode/skills/control-angular-dev-app/SKILL.md | "`node $S up --target ssr`, then `node $S doctor --target ssr` exits 0 on `/`" and the SSR fresh-page state in the feature README | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1305 | .commandcode/skills/control-angular-dev-app/SKILL.md | the measured ready times, "the dev servers listen on `[::1]` only", the Nx-daemon and inspector-port behaviour, the Pangular overlay's console errors and the `ng.*` runtime behaviours | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1306 | .commandcode/skills/control-angular-dev-app/features/README.md | "`node $S up --target counter`, then `node $S doctor` exits 0" and the same for `--target ssr` and `--target portal` (`features/README.md:10-17`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1307 | .commandcode/skills/control-angular-dev-app/features/README.md | the enrolment recipes | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1308 | .commandcode/skills/control-angular-dev-app/features/components.md | "`node $S up --target components` and `node $S doctor --target components` exit 0 on a fresh page", and the snapshot/screenshot contents (`components.md:24-29`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1309 | .commandcode/skills/control-angular-dev-app/features/components.md | "Two servers share `spikes/ng222-app`'s `.angular` cache with the counter target: one target at a time in a checkout" (`components.md`, Gotchas) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1310 | .commandcode/skills/control-angular-dev-app/features/counter.md | "the fixture's two other routes, `/stale-view` and `/stale-view-deferred`, belong to the stale-view fixtures (`src/app/app.routes.ts:5-8`, read 2026-11-01)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1311 | .commandcode/skills/control-angular-dev-app/features/counter.md | "`router()` … lists the two routes `src/app/app.routes.ts:5-8` declares, `/stale-view` and `/stale-view-deferred`, not an empty list (read 2026-11-01)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1312 | .commandcode/skills/control-angular-dev-app/features/counter.md | the snapshot text and the runtime graph readings (`computed:double -> signal:count`, `effect: -> signal:count`, `getListeners(…).map(l => l.name)` → `["click"]`, `title: {signal: "Clicks"}`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1313 | .commandcode/skills/control-angular-dev-app/features/portal-claims.md | the driven list/details/create run and the signal-graph strings (`template:ng-journal-list -> computed:claims`, `computed:claims -> signal:#state`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1314 | .commandcode/skills/control-angular-dev-app/features/portal-complaints-customers.md | the driven flows | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1315 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | "Snapshot shows `heading \"Contract Details Edit\"`" (`portal-contracts.md:39`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1316 | .commandcode/skills/control-angular-dev-app/features/portal-contracts.md | the driven edit/save and create/save flows, `[PUT] … => [200]` / `[POST] … => [201] Created`, the date-picker grid step, the random rows/names and the short numeric ids (`portal-contracts.md:41-58`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1317 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | `snapshot --filename=home.yml` shows `heading "Home" [level=1]` and the tile/link roles | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1318 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | the sidebar role/name queries (`getByRole('navigation')…filter({hasText:'CLAIM'})`) and the resulting `/claim/create` URL | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1319 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | `__ngc.router()` holds the four contract routes after a visit, and `doctor` exits 0 leaving the page on `/home` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1320 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | the last node of a snapshot is the overlay's `button "Toggle Pangular Inspector"` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1321 | .commandcode/skills/control-angular-dev-app/features/portal-navigation.md | "every flag is on" (so the feature-flag fall-through is not driven) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1322 | .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md | the `up --target portal --dir <path>` run's own header line `> nx run insurance-portal:serve:development --port=4509` in `<evidenceDir>/app.log` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1323 | .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md | `doctor` exits 0 and prints the `angular-root` line with 20.3.35 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1324 | .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md | `__ngc.injectors(...)` / `__ngc.providers(..., <i>)` on the running page print that record list | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1325 | .commandcode/skills/control-angular-dev-app/features/portal-zoneful-worktree.md | the 2026-11-08 behavioural capture (zone-hosted `setTimeout` ticked `applicationRef._tick` 2×, `Zone.root` 0×) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1326 | .commandcode/skills/control-angular-dev-app/features/ssr.md | the server HTML carries `ngh` attributes, `<!--nghm-->`, `<script id="ng-state">`, the event-dispatch script and `ng-server-context="ssr"` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1327 | .commandcode/skills/control-angular-dev-app/features/ssr.md | hydration counters (`hydratedComponents` 4, `hydratedNodes` 40, no other status) and the `ngh`-attribute removal | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1328 | .commandcode/skills/control-angular-dev-app/features/ssr.md | `window._ejsas.ng.q` queues an early click and `Early clicks: 1` after hydration | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1329 | .commandcode/skills/control-angular-dev-app/features/ssr.md | the defer block's states (`initial`/`dehydrated` → `complete`/`hydrated`, triggers `["hydrate on interaction", "on idle"]`) and `Deferred clicks: 1` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1330 | .commandcode/skills/control-angular-dev-app/features/ssr.md | `/client` is the bare shell with `<body ngcm>` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1331 | .commandcode/skills/control-angular-devtools/SKILL.md | ready "when the CDP port lists the extension's `service_worker` target", measured 2.9-8 s | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1332 | .commandcode/skills/control-angular-devtools/SKILL.md | the copy keeps `_metadata/` and loads with 0 manifest errors/warnings; the manifest's `key` keeps the store ID | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1333 | .commandcode/skills/control-angular-devtools/SKILL.md | "measured 2026-10-16 in the `verification-skills` worktree (`wt-423ece`, slot 10): a throwaway listener on 9430 moved the run to 9431" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1334 | .commandcode/skills/control-angular-devtools/SKILL.md | `--auto-open-devtools-for-tabs` opens the DevTools window on Lars's desktop; the panel handles read from the live panel 1.22.1 (tab names, `.node-name`, `aria-label` `Start recording`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1335 | .commandcode/skills/control-angular-devtools/SKILL.md | opening `chrome-extension://<id>/index.html` in a tab fails with `TypeError: Cannot read properties of undefined (reading 'inspectedWindow')`, and `connectOverCDP` lists the extension frames with empty URLs | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1336 | .commandcode/skills/control-angular-devtools/SKILL.md | `coexist` passes when the removed subscriber stops counting and DevTools recorded the cycles; `--di-graph` removes the template node from both | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1337 | .commandcode/skills/control-angular-devtools/features/README.md | "Router Tree shows only when the app provides the router (`devtools-tabs.component.ts`); Transfer State only for a hydrated (SSR) app" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1338 | .commandcode/skills/control-angular-devtools/features/README.md | "the scripted path uses DevTools frontend internals proven only in the test harness" and the manual-only Web Store confirmations | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1339 | .commandcode/skills/control-angular-devtools/features/attach.md | the measured result `flag true (set at ~50 ms); detection {…}; backendInstalled true; backendReady at ~950 ms; Angular 22.2.2` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1340 | .commandcode/skills/control-angular-devtools/features/attach.md | `isSupportedAngularVersion` means major 12+ or 0 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1341 | .commandcode/skills/control-angular-devtools/features/attach.md | the content script gates on `isAngularDevTools`, `isAngular` and an HTML document, and the popup shows `production.html` (built 1.22.0 `app/content_script_bundle.js`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1342 | .commandcode/skills/control-angular-devtools/features/attach.md | the toolbar icon turns from grey to colour | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1343 | .commandcode/skills/control-angular-devtools/features/install.md | "Branded install, uninstall and reinstall are proven in Chrome Beta (2026-10-11, measured: install exit 0 …)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1344 | .commandcode/skills/control-angular-devtools/features/install.md | "`chrome://` and `edge://` URLs passed on the command line open an empty window" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1345 | .commandcode/skills/control-angular-devtools/features/install.md | the extensions page toggle/Remove behaviour and "the extensions page is the authority" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1346 | .commandcode/skills/control-angular-devtools/features/profiler.md | the measured result `own subscribers {"bothOn":{"a":16,"b":16},"afterRemoveA":{"a":16,"b":32}}; DevTools recorded 2 change detection cycles` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1347 | .commandcode/skills/control-angular-devtools/features/profiler.md | "DevTools' subscriber cannot be listed from the page (the list is module-private)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1348 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | the expected fixture graph `template:app-counter, signal:title, signal:count, computed:double, signal:items, effect:Effect`, and after `angular:di_graph` the pane `signal:count, effect:Effect` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1349 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | the extra kinds `linked-signal`, `child-signal-prop`, `resource`, `unknown` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1350 | .commandcode/skills/control-angular-devtools/features/signal-graph.md | "the pane re-reads the graph after change detection; `coexist --di-graph` clicks the app before the second read" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1351 | .commandcode/skills/control-pangular-inspector/SKILL.md | "`…/scripts/control.mjs:74` defaults to 9999" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1352 | .commandcode/skills/control-pangular-inspector/SKILL.md | "Every other script has a `node:test` file beside it (`*.test.mjs`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1353 | .commandcode/skills/control-pangular-inspector/SKILL.md | "With `--read-only`, 0.0.7 lists 46 tools" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1354 | .commandcode/skills/control-pangular-inspector/SKILL.md | "The standalone server listens on `[::1]:9999`; the proxy target `http://localhost:9999` reaches it" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1355 | .commandcode/skills/control-pangular-inspector/SKILL.md | "npm 11.16 drops 27 entries from the committed lockfile on any install" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1356 | .commandcode/skills/control-pangular-inspector/SKILL.md | "`process.exit` while a `fetch` keep-alive socket is open crashed Node 24 on Windows … (exit 127)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1357 | .commandcode/skills/control-pangular-inspector/SKILL.md | the measured ready times (2.2 s for MCP `initialize`, 17-20 s for the portal) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1358 | .commandcode/skills/control-pangular-inspector/features/README.md | "the overlay reports about 250 ms after change detection, so read after the end state is visible" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1359 | .commandcode/skills/control-pangular-inspector/features/README.md | "Portal data is random per API start: assert on structure … not values" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1360 | .commandcode/skills/control-pangular-inspector/features/README.md | "Setup claims (install, remove) are proven against git … saved next to the command output" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1361 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | the tree `AppComponent <ng-journal-root>`, `SidebarComponent <ng-journal-sidebar>`, `ListComponent <ng-journal-list>`, `HeaderComponent`, `Table <p-table>` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1362 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | `inspect-component` → `ListComponent`, path `ng-journal-root > ng-journal-list` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1363 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | `inspect-signals` → a `template` node `ng-journal-list` and a `computed` node `contracts` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1364 | .commandcode/skills/control-pangular-inspector/features/live-inspection.md | `inspect-providers` → an element injector `ng-journal-list` with its `lookupPath` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1365 | .commandcode/skills/control-pangular-inspector/features/navigation.md | `explain-navigation` with trigger `imperative`, `from /home`, `started by RouterLink div "List"`, lazy `contract`, `list` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1366 | .commandcode/skills/control-pangular-inspector/features/navigation.md | the outcome vocabulary `succeeded`, `cancelled`, `redirected`, `failed`, `skipped`, `pending` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1367 | .commandcode/skills/control-pangular-inspector/features/navigation.md | `list-routes` "12 routes, measured" and `lint-routes` "one `info` finding, `missing-title`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1368 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "`limit` defaults to 5 (at most 50)" and "the page keeps `limits.navigations` (50) entries" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1369 | .commandcode/skills/control-pangular-inspector/features/navigation.md | "a reload keeps the page id (it lives in `sessionStorage`) but starts an empty navigation list"; "`started by` appears only when the click came less than 2 s before" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1370 | .commandcode/skills/control-pangular-inspector/features/panel.md | the panel title `Pangular Inspector`, the eight tab names, `LIVE`, `Agent`/`Read-only`, and the floating button's accessible name `Toggle Pangular Inspector` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1371 | .commandcode/skills/control-pangular-inspector/features/panel.md | "the doctor has answered the one-time-code prompt in this session" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1372 | .commandcode/skills/control-pangular-inspector/features/panel.md | "A code expires after 5 minutes; each untrusted browser that asks gets a new banner" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1373 | .commandcode/skills/control-pangular-inspector/features/setup.md | "The setup is not committed in the portal checkout (its `git log` holds no commit for it)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1374 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`install --json` -> `changed` lists package.json, package-lock.json, main.ts, project.json, proxy.conf.json`" and "`git diff --stat` shows the lockfile with insertions only (457 lines measured)" as a live run | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1375 | .commandcode/skills/control-pangular-inspector/features/setup.md | "`npm exec -- nx run insurance-portal:typecheck` exits 0 with the overlay import" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1376 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The stdio server lists no page tools (`inspect-*`, `list-pages`)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1377 | .commandcode/skills/control-pangular-inspector/features/source-scan.md | "The scan reads the `sourceRoot` of each `angular.json` project plus `<root>/src`; it ignores `project.json` (only `build-meta` reads it)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1378 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "Every other script has a `node:test` file beside it (`*.test.mjs`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1379 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | the ready-time measurements (5.2 s, 19.3 s, 9.9 s, 4.4 s, 21.6 s) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1380 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "`window.ng`: 23 functions" in the tester iframe | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1381 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "`LanguageModel` in attach mode (Gemma 4 answered a prompt from the tester iframe)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1382 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "a DevTools panel reaches the tester iframe with `chrome.devtools.inspectedWindow.eval(expr, { frameURL })`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1383 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | "Chrome 137+ branded builds ignore `--load-extension`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1384 | .commandcode/skills/control-vitest-browser-angular/SKILL.md | the 250 ms exit wait against the Node-on-Windows fetch assertion (exit 127) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1385 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "The verdict, the baseline in a second worktree and the repeat runs come from /lars-verify" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1386 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "one browser instance at a time … a baseline (in its worktree, with its own derived Vitest port) and its change run one after the other" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1387 | .commandcode/skills/control-vitest-browser-angular/features/README.md | the `f1e4` snapshot refs and `page.frame('vitest-iframe')` reads | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1388 | .commandcode/skills/control-vitest-browser-angular/features/README.md | "The Angular DevTools extension: not loaded into these browsers" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1389 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | `tests-pass` "the two default tests pass (`Tests 2 passed \| 2 skipped (4)` without flags)" and "`test-run` reports `last summary: Tests  2 passed \| 2 skipped (4)`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1390 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "`test-run` passes on a failing test on purpose: it checks the run, not the results" as a live observation | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1391 | .commandcode/skills/control-vitest-browser-angular/features/counter-tests.md | "`up --hold <ms> --filter "keeps the counter mounted"` … without `--hold` the same filter reports `4 skipped (4)`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1392 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "`LanguageModel` is `available` in the tester iframe (attach mode) and not in bundled mode" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1393 | .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md | "The repository's `extension/` does not inject there (measured 2026-11-12: no execution context from its origin in the tester iframe)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1394 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | the signal-graph edge list (`template div -> title, count, double, unnamed items`, `double -> count`, `effect -> count`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1395 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | the `held-after.json` payload `{"text":"Clicks: 4 (double 8, cart 2)Increment","count":4,"cart":["pear","plum"]}` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1396 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | the host element id `rootN` and "`<app-counter>` does not exist under TestBed; select `[ng-version]`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1397 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | the held-di resolution path (`element -> DynamicTestModule -> Platform: core -> null`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1398 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | the attach-mode profiler observation (only event ids 6 and 7 in two runs on 2026-10-16 vs 12 events over CDP) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1399 | .commandcode/skills/control-vitest-browser-angular/features/held-counter.md | "`doctor` exits 0" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1400 | .commandcode/skills/link-workspace-packages/SKILL.md | `pnpm add @org/ui --workspace` and `pnpm add @org/ui --filter @org/app --workspace` (`SKILL.md:36`, `:39`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1401 | .commandcode/skills/link-workspace-packages/SKILL.md | `npm install @org/ui --workspace @org/app` (`SKILL.md:71`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1402 | .commandcode/skills/monitor-ci/SKILL.md | `ci_information` / `update_self_healing_fix` MCP tools and the `ci-monitor-subagent (haiku)` agent | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1403 | .commandcode/skills/monitor-ci/SKILL.md | the WAIT/LIGHT/HEAVY field names (`taskFailureSummaries`, `suggestedFixSummary`, `couldAutoApplyTasks`, …) (`SKILL.md:98-102`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1404 | .commandcode/skills/monitor-ci/SKILL.md | the `APPLY` / `REJECT` / `RERUN_ENVIRONMENT_STATE` action vocabulary of `update_self_healing_fix` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1405 | .commandcode/skills/monitor-ci/references/fix-flows.md | UPDATE_FIX / FETCH_HEAVY / FETCH_THROTTLE_INFO subagents and their `APPLY`/`REJECT`/`RERUN_ENVIRONMENT_STATE` payloads | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1406 | .commandcode/skills/monitor-ci/references/fix-flows.md | `selfHealingSkipMessage` and the `/cipes/{id}` throttle-message parse | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1407 | .commandcode/skills/nx-cloud-api/SKILL.md | "the command already retried 3 times honoring `Retry-After`" (`SKILL.md:120`, `:121`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1408 | .commandcode/skills/nx-cloud-api/SKILL.md | "Unknown query parameters are always rejected" (`SKILL.md:112`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1409 | .commandcode/skills/nx-cloud-api/SKILL.md | the literal 404 `not_found` code (`SKILL.md:117`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1410 | .commandcode/skills/nx-cloud-api/SKILL.md | `-o` files are "created owner-only" (`SKILL.md:88`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1411 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "the command refuses to write a download to a terminal" (`:46`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1412 | .commandcode/skills/nx-cloud-api/references/extraction-and-calculation.md | "a non-empty gzip payload can contain a valid tar archive whose terminal-output entry is zero bytes" (`:52-60`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1413 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | "A terminal `remote-cache-hit` proves Nx replay worked" and the six classification outcomes (`SKILL.md:118-160`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1414 | .commandcode/skills/nx-cloud-cache-investigator/SKILL.md | the change gate's approval step (step 5, "get explicit approval before an edit") | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1415 | .commandcode/skills/nx-cloud-cache-investigator/references/artifact-integrity.md | byte count + SHA-256, compression-stream and member-table validation, "byte-identical malformed downloads across retries" (`:11-23`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1416 | .commandcode/skills/nx-cloud-cache-investigator/references/log-and-report-assets.md | "Identify its format from bytes", decoding, and the zero-byte output shape | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1417 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "the `cipes` filter accepts only terminal statuses" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1418 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | the 24-hour default, the 30-hour creation window and the "maximum normal six-hour CI duration" (`:24-27`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1419 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | "a semaphore of at most five narrow detail requests" and "fetch logs only after a group reaches the top five" (`:53`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1420 | .commandcode/skills/nx-cloud-ci-failure-review/SKILL.md | the CODEOWNERS ownership step (`:94`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1421 | .commandcode/skills/nx-generate/SKILL.md | the `--directory` placement warning (`--directory=libs` creating `libs/package.json` vs `--directory=libs/my-lib`) (`:96-102`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1422 | .commandcode/skills/nx-import/SKILL.md | "`nx import` responds with .ndjson outputs" (`:9`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1423 | .commandcode/skills/nx-import/SKILL.md | `nx sync --yes` (`:80`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1424 | .commandcode/skills/nx-import/SKILL.md | `pnpm add -wD eslint@^9 @nx/eslint-plugin typescript-eslint` (`:111`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1425 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint/plugin` … detects both flat config files … and legacy config files" (`:9`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1426 | .commandcode/skills/nx-import/references/ESLINT.md | "`@nx/eslint` init adds `eslint@^9.8.0` at the workspace root" (`:88`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1427 | .commandcode/skills/nx-import/references/ESLINT.md | the `typescript-eslint@7.x` / eslint 9 peer conflict and its npm overrides fix (`:60-80`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1428 | .commandcode/skills/nx-import/references/GRADLE.md | `@nx/gradle` inferring projects from root `gradlew`/`gradle/wrapper` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1429 | .commandcode/skills/nx-import/references/JEST.md | "`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target" (`:9`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1430 | .commandcode/skills/nx-import/references/JEST.md | the root `jest.preset.js` content `require('@nx/jest/preset').default` (`:40`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1431 | .commandcode/skills/nx-import/references/JEST.md | "`nx add @nx/jest` does NOT create `jest.preset.js`" (`:27-29`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1432 | .commandcode/skills/nx-import/references/NEXT.md | "`@nx/next/plugin` … creates these targets: `build`, `dev`, `start`, `serve-static`, `build-deps`/`watch-deps`" (`:5-15`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1433 | .commandcode/skills/nx-import/references/NEXT.md | "**No separate typecheck target**" for Next.js (`:17`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1434 | .commandcode/skills/nx-import/references/NEXT.md | `composePlugins(withNx)` from `@nx/next` (`:23`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1435 | .commandcode/skills/nx-import/references/TURBOREPO.md | the config-as-package merge procedure (`:13-46`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1436 | .commandcode/skills/nx-import/references/VITE.md | "`@nx/vite/plugin` defaults `typecheckTargetName` to `\"vite:typecheck\"`" (`:9`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1437 | .commandcode/skills/nx-import/references/VITE.md | the `build`/`dev`/`serve`/`preview`/`serve-static` target sets per Vite flavour (`:24-60`, `:120-140`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1438 | .commandcode/skills/nx-import/references/VITE.md | the `resolve.alias`/`__dirname`/`baseUrl` fixes (`:17-22`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1439 | .commandcode/skills/nx-plugins/SKILL.md | `npx nx add @nx/react` (`:9`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1440 | .commandcode/skills/nx-run-tasks/SKILL.md | "These flags work with `run` …" (`:55`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1441 | .commandcode/skills/nx-workspace/SKILL.md | "`nx graph --print`" returns the project graph | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1442 | .commandcode/skills/nx-workspace/SKILL.md | "`nx sync`" then "`nx reset` if sync doesn't fix stale cache" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1443 | .commandcode/skills/nx-workspace/references/AFFECTED.md | "Affected between two commits … `--base=abc123 --head=def456`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1444 | .commandcode/skills/verify-ai-browsers/SKILL.md | the row claims themselves (`state`, `model-init`, `extension-panel`, `signal-provenance`, `di-doctor`, `error-explainer`, `stale-view`, `interop` each exiting 0 on a named instance) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1445 | .commandcode/skills/verify-ai-browsers/SKILL.md | "`edge-phi4mini` has failed `canary.structured` with `kErrorUnknown` in one doctor out of three (2026-10-12)" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1446 | .commandcode/skills/verify-angular-devtools/SKILL.md | "The harness is headed; it opens a window on Lars's desktop for about half a minute per run" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1447 | .commandcode/skills/verify-angular-devtools/SKILL.md | "Not covered: the branded browsers … `control.mjs status --browser <name>` reads Lars's own profile" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1448 | .commandcode/skills/verify-pangular-inspector/SKILL.md | the `live-reads` claim (a sidebar CONTRACT > List click reaches `/contract/list`, and the six MCP reads answer) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1449 | .commandcode/taste/angular/taste.md | "Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1450 | .commandcode/taste/angular/taste.md | "`inject()` and `@Service()`-style modern authoring are preferred" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1451 | .commandcode/taste/communication/taste.md | "Never call AskUserQuestion; proceed with available context and escalate through the normal channel instead", plus the writing-style and reporting preferences (`:5-12`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1452 | .commandcode/taste/design/taste.md | "per-package secondary entry points such as `provideAiNgrxDevTools()`" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1453 | .commandcode/taste/design/taste.md | "Edge exposes no `LanguageModel` there without flags" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1454 | .commandcode/taste/tooling/taste.md | "when the same model runs on both channels, keep the Stable instance and drop the Beta/Dev one" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1455 | .commandcode/taste/tooling/taste.md | the PowerShell-5.1 comparison operators (`-lt`, `-gt`, …) and the "prefers the PowerShell tool" half of `:35` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1456 | .commandcode/taste/workflow/taste.md | "Pair every tool, fixture or runtime the project adopts with a `control-{name}` skill and a `verify-{name}` skill" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1457 | .commandcode/taste/workflow/taste.md | the commit, gate and delegation practices in the rest of the file (`git commit -F`, stage-by-name, the 4-agent cap, `/pstack:*` commands) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1468 | AGENTS.md | "The app serves the route (`apps/angular-ai-devtools/src/app/app.routes.ts:24`)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1469 | AGENTS.md | "DeepSeek V4.1 Flash for every tool-loop role … GLM-5.3 Flash for `reviewer`, `skeptic` and `review_panel`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1470 | AGENTS.md | "`.project/review/` is tracked; deleting it is a diff, not a loss" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1471 | AGENTS.md | "Measured on 2026-11-07: 15 of 23 verdict specs drove the counter fixture on `:4222` and 3 drove the portal" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1472 | LESSONS.md | the refuted claim itself ("no file in `extension/` registers a `click`, `pointer*`, `mouse*` or `key*` listener") | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1473 | docs/afk-run-2026-10-12.md | "`docs/feature-proposals.md` section 8, \"Rulings from Lars\"" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1474 | docs/afk-run-2026-10-12.md | "check: `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target portal` exit 0 twice" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1475 | docs/afk-run-2026-10-12.md | "Only the four standing per-model instances run, each on one blank tab, plus Lars's everyday Edge, which is untouched" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1477 | docs/design/tutor.md | "892 signal nodes, 47 components" on `/contract/list` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1478 | docs/feature-proposals.md | the N1–N4/N24/N25 panel routes are cited at `apps/angular-ai-devtools/src/app/app.routes.ts:9-16` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1479 | docs/feature-proposals.md | the eleventh filing draft is cited at `docs/filing-ledger.md:230` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1480 | docs/feature-proposals.md | the `packages/core/…`, `packages/router/…`, `packages/upgrade/…` line citations are angular/angular source, not this tree | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1481 | docs/filing-ledger.md | the Angular DevTools cross-check evidence points at `.claude/skills/verify-angular-devtools/` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1482 | docs/filing-ledger.md | the `list-components` evidence is cited as `.claude/skills/control-pangular-inspector/SKILL.md:172` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1483 | docs/filing-ledger.md | every upstream claim (Chromium tags/lines, `@pangular-inspector/devtools` 0.0.7 behaviour, `@openng/optimus-ui` 2.0.2 source, playwright-mcp README, the WebMCP spec at `d0e4e0e`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1484 | plans/angular-ai-devtools-program-backlog.md | Q3 refreshes `~/Downloads/angular-ai-devtools-features.*` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1485 | plans/angular-ai-devtools-proposals.handoff.md | "`docs/feature-proposals.md`, about 1,100 lines (1110 measured 2026-10-31)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1486 | plans/angular-ai-devtools-proposals.handoff.md | "**Skills (project):** in `.claude/skills/`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1487 | plans/angular-ai-devtools-proposals.handoff.md | the instance registry is `.claude/skills/control-ai-browsers/instances.json` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1488 | plans/angular-ai-devtools-proposals.handoff.md | "`research/00` to `research/17`" as the evidence range | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1489 | plans/angular-ai-devtools-proposals.handoff.md | the companion package "exports `provideAiDevTools()`, `provideAiNgrxDevTools()`, `provideAiRouterDevTools()`, `provideAiNgrxSignalsDevTools()` and `<scope>/vitest` `cdpAttach()`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1490 | plans/angular-ai-devtools-proposals.handoff.md | "Review history: `tmp/review/`" and "Lars's original request is verbatim in `tmp/review/lars-request.md`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1491 | plans/gsd-path-handoff-M018.md | the banner says M019 "is prepared to `plan/done` on `gsd-path/M019` and is ready for `build`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1492 | plans/gsd-path-handoff-M018.md | "Frozen inventory: **143 documents** from `check_docs_audit.py --repo <root> --emit-inventory`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1493 | plans/gsd-path-handoff-M018.md | the `prepare-inspect` refusal and the `gsd report` / `pipeline_state.py route` readings | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1494 | references/ai-browsers-verification.md | the `state` step's 900000 timeout is cited as `SKILL.md:49,71` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1495 | references/ai-browsers-verification.md | "Check that port 9992 is free" / "no listener on 9992" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1496 | references/edge-dev-aion-model.md | "The 2026.10.2.1 folders are still on disk and in `tmp/control-ai-browsers/pins/edge-dev-aion.2026.10.2.1`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1497 | references/edge-dev-aion-model.md | the Edge component-updater measurements, the per-channel manifest table, the 842-input `model.onnx` reading and the Edge 158 results | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1498 | research/00-browser-probe.md | the flag-state readings, the C:-vs-D: read speeds (1,464/1,558/1,616 MB/s), the NPU and provider trials, and every per-browser model result | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1499 | research/01-built-in-ai-apis.md | "Chrome ships `LanguageModel` to extensions (138+) and the web (148+)", structured output stable, tool calling experimental | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1500 | research/01-built-in-ai-apis.md | "In Edge the prerelease model is **Aion-1.0-Instruct** (no source for '1.1')" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1501 | research/01-built-in-ai-apis.md | "WebMCP is now `document.modelContext` … origin trial in Chrome 149 and Edge 150" and the extension-context claim in section 3 | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1502 | research/02-angular-surface.md | the `ng` global inventory, the DevTools call list and the 22.x feature claims | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1503 | research/03-prior-art.md | the Pangular, React DevTools, Chrome DevTools AI, Vue/Nuxt/React Scan/Redux/Svelte/Solid/Million entries and the Chrome DevTools MCP tool list | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1504 | research/03-prior-art.md | the Pangular extension inventory `extension/manifest.json`, `background.js`, `content-script.js`, `detect-angular.js`, `devtools.js`, `panel-bridge.js`, `panel-actions.js` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1505 | research/04-ecosystem.md | the NgRx, Analog, Storybook and RxAngular internals, and the vitest.dev page header reading | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1506 | research/05-spikes.md | "S17, S18, S19 recorded **blocked** — … no probe script named for these spikes" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1507 | research/05-spikes.md | "served with `ng serve --port 4222`" and every measured count in the benchmark tables | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1508 | research/06-angular-skills.md | "Skill 1: `angular-developer/SKILL.md` (132 lines)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1509 | research/06-angular-skills.md | the rule inventory in section 2 and the feature ideas | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1510 | research/07-prompting-small-models.md | the per-model prompting guidance, the token counts per model and the tool-calling/structured-output behaviour on each model | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1511 | research/08-recent-angular-features.md | the release notes, the CHANGELOG reads (`CL:1-2`, `CL:370-438`, …) and the GitHub release list | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1512 | research/08-recent-angular-features.md | the "Newer than the local changelog" rows (22.2.1, 22.2.2, 22.3.0-next.0/next.1) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1513 | research/09-nano-tool-session-error.md | every Chromium source citation (tag `156.0.8078.17`, `language_model.cc`, `ai_manager.cc`, `runtime_enabled_features.json5`), the spec at commit `8040b81`, crbug 422803232/417817645 and the prompt-api issues | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1514 | research/10-model-capabilities.md | the model manifest citation `.commandcode/worktrees/.browsers/chrome-beta-nano/OptGuideOnDeviceModel/2025.8.21.1028/manifest.json` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1515 | research/10-model-capabilities.md | "`spikes/probes/bench/nano.json`" as a local file | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1516 | research/10-model-capabilities.md | the vendor model-card readings (H1/H2/G2/GB/MK/C1/C2 cells), the Hugging Face `tokenizer_config.json` lines and the Aion sample repo's `docs/prompt-guide.md` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1517 | research/11-spike-s1-extension-contexts.md | every context-exposure result, the crash counts and the `NotAllowedError` on `devtools_page` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1518 | research/12-legacy-vs-modern-angular.md | "a development build of the 22.2 spike app (unminified, 968 `ngDevMode` references)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1519 | research/12-legacy-vs-modern-angular.md | "`spike main.js:37258-37267`" and "`spike main.js:37270`" for the `ɵsetClassDebugInfo(Counter, …)` lines | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1520 | research/12-legacy-vs-modern-angular.md | the `packages/core/…`, `packages/router/…` and `packages/upgrade/…` line citations | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1521 | research/13-portal-legacy-audit.md | the measured evidence directory `tmp/control-angular-dev-app/portal-4775-2026-10-12T07-18-44-815Z/` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1522 | research/13-portal-legacy-audit.md | every portal file:line (`apps/insurance-portal/project.json:18,10,53`, `libs/claim/…`) and the commits `754aa1e`/`66e8ad6`/`92053b9`/`cc9ce25` | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1523 | research/14-ai-devtools-prior-art.md | the WebMCP spec at `webmachinelearning/webmcp` `d0e4e0e`, the Chrome WebMCP pages, `GoogleChromeLabs/webmcp-extension` (`extension/content.ts`), playwright-mcp, chrome-devtools-mcp, nuxt-mcp-dev and the Storybook docgen manifest (`docs/definition.ts:359-419`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1524 | research/14-ai-devtools-prior-art.md | the "measured" labels on Angular's own WebMCP source (`packages/core/src/webmcp/types.ts`, `packages/forms/signals/src/webmcp/registration.ts`) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1525 | research/15-deterministic-and-ai.md | the attach command is written as `node .claude/skills/control-ai-browsers/scripts/control.mjs attach chrome-beta-gemma4` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1526 | research/15-deterministic-and-ai.md | the worker-context probe steps 1–10 and their "done when" criteria | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1527 | research/16-ssr-runtime.md | the SSR measurements themselves (hydration marks, `ng-server-context`/`ngcm`, Transfer State, the absence of `Server-Timing`, the `@defer` and event-replay results) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1528 | research/17-vitest-browser-runtime.md | the runner "`spikes/probes/vitest-attach.mjs`", including the two run lines that invoke it | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1529 | research/17-vitest-browser-runtime.md | the attach-route results (content scripts in both worlds of the tester iframe, `LanguageModel` present in the iframe, the new-context failure) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1530 | research/18-edge-prevent-auto-signin.md | the skill citation `.commandcode/skills/control-ai-browsers/SKILL.md:311-312` for "the skill relies on the `ms*` switches alone" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1531 | research/18-edge-prevent-auto-signin.md | the Microsoft Learn policy text, WebView2Feedback #5722, the Edge 155/157 auth-library behaviour and the `edge://policy` / `edge://signin-internals` verification steps | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1532 | research/19-languagemodel-in-extension-contexts.md | the Chromium document `docs/experiments/prompt-api-for-extension.md` and the five browser-model context rows | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1533 | research/20-built-in-ai-without-flags.md | the per-context availability matrix, the worker runs, the renderer crash and the Crashpad reports | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1534 | research/spikes/README.md | "`.project/research/` holds exactly one file — the carry-forward `DOCS-AUDIT.md`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1535 | research/spikes/capability-dependency-matrix.md | "`.project/research/m040-performance-narrator.md`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1536 | research/spikes/instrumentation-free-coverage.md | "`(.project/research/capability-dependency-matrix.md:74-84)`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1537 | research/spikes/instrumentation-free-coverage.md | "`(.project/research/m040-performance-narrator.md:207-215)`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1538 | research/spikes/s12-answer.md | "(`lift 0 / narrow 0 / changes nothing 16`, `.project/research/capability-dependency-matrix.md` §3)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1539 | research/spikes/s12-answer.md | the portal build measurements behind the insight-class answer (resolvable `main-*.js.map` with embedded `sourcesContent`, AOT template mapping precision) | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
| 1540 | research/spikes/s13-answer.md | "Rows are the matrix's rows (`.project/research/capability-dependency-matrix.md` §1)" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1541 | research/spikes/s13-answer.md | the target section names `tmp/control-angular-dev-app/state/portal.json` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1542 | research/spikes/sourcemap-future-scope.md | the legend rows `\| \`MX\` \| .project/research/capability-dependency-matrix.md \|` and `\| \`IFC\` \| .project/research/instrumentation-free-coverage.md \|` | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1543 | spikes/ng222-app/README.md | "For end-to-end (e2e) testing, run: `ng e2e`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1544 | spikes/ng222-ssr/README.md | "For end-to-end (e2e) testing, run: `ng e2e`" | stale | NEEDS-USER | User ruling: decide whether the doc or the code is authoritative, then fix the other side |
| 1545 | spikes/ng222-ssr/README.md | "generated using Angular CLI version 22.2.2" | unverifiable | fix-doc | Add the code-side evidence named in the row, or record the settling check |
