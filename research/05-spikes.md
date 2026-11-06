# 05 - Spike results

All results are **measured** unless a line says inferred. Probes ran in Lars's Edge Dev 157 (Aion-1.1-Instruct) and Chrome Beta 156 (Gemma 4 `gemma4-2b-it`). playwright-cli attached over remote debugging, and the scripts ran in the page's main world, the same world a MAIN-world content script gets. This is not an extension context; S1 is still open. (Answered: S1 ran; see `11-spike-s1-extension-contexts.md`.)

## Instance availability (T002, 2026-10-18)

All four per-model instances verified healthy via `control-ai-browsers doctor` (exit 0):

- chrome-beta-nano (port 9333): v3Nano 2025.8.8.1141 GPU, available, structured canary pass
- chrome-beta-gemma4 (port 9334): gemma4-2b-it GPU, available, structured+tools+webmcp canary pass
- edge-dev-aion (port 9335): Aion-1.1-Instruct GPU, available, structured+tools+webmcp canary pass
- edge-phi4mini (port 9337): Phi-4-mini-instruct GPU, available, structured+webmcp canary pass (tools reported, not required)

No blocked preconditions recorded for model-dependent spikes; all four instances runnable. S4/E-spikes needing branded-browser access remain blocked pending Lars's approval (no branded browser was started).

## S16 - companion-package Meta-class lookup (measured 2026-10-18)

Verdict: **works-with-degradation**. Reason: Meta is absent from all five injectors; identity-only token-name matching cannot resolve a Meta instance. Evidence: `research/raw/s16-meta-lookup.json`.

- Walked root component's `ɵgetInjectorResolutionPath`: 5 injectors (app-counter element, app-root element, environment, platform, null).
- `Meta` token absent from all injectors (expected "provided, not created yet").
- `Router` token present in environment injector (index 2); `ng.ɵgetRouterInstance()` returns instance with url `/`.
- Identity-only token-name matching works; no `injector.get` on ViewContainerRef needed.

App: `spikes/ng222-app`, generated with `@angular/cli@22.2.2 new --routing --ssr=false`, installed `@angular/core` 22.2.2, served with `ng serve --port 4222`. A component `app-counter` (`src/app/counter.ts`) has `title = input()`, `count = signal(3)`, `double = computed(count * 2)`, an injected root `CartService.items` signal, and an `effect` that writes `lastLogged`. The effect-writes-signal pattern is there on purpose, as a fixture for the anti-pattern finder (N2).

### Discovery

- `window.ng` has 25 functions: `applyChanges, enableProfiling, getComponent, getContext, getDirectiveMetadata, getDirectives, getHostElement, getInjector, getListeners, getOwningComponent, getRootComponents, isSignal, toggleWatchSignal, ɵgetComponentInstanceDeepLinkId, ɵgetControlFlowBlocks, ɵgetDependenciesFromInjectable, ɵgetInjectorMetadata, ɵgetInjectorProviders, ɵgetInjectorResolutionPath, ɵgetLoadedRoutes, ɵgetRouterInstance, ɵgetSignalGraph, ɵgetTransferState, ɵnavigateByUrl, ɵsetProfiler`. This matches the inventory in `02-angular-surface.md` for a `provideRouter` app.
- Dispatching `new CustomEvent('devtoolstooldiscovery')` with a `respondWith` expando from the main world returns `{name: 'Angular', tools: [angular:di_graph, angular:signal_graph]}` synchronously.
  - `angular:di_graph` has schema `{type: 'object', properties: {}}`. A tool with no parameters breaks Gemma 4 tool prompts (00), so this schema cannot be passed to the Prompt API as is. [confounded] (Confounded with camelCase names; see Correction at end of 00/07 and research/11. The extension keeps `angular:di_graph` out of the Prompt API anyway, because of its side effect measured below.) (Answered 2026-10-12, S11: an empty `properties` schema with a snake_case name returned a tool call on Gemma 4 GPU **[measured, n=1, `research/raw/tool-name-matrix-gemma4-gpu.json`]**, so the schema alone is not the problem; the side effect still keeps the tool out.)
  - `angular:signal_graph` has schema `{target: {type: 'object', 'x-mcp-type': 'HTMLElement'}}`. A model cannot produce an element, so the extension must wrap it (selector or component id in, element looked up in the page).
  - The two descriptions are 1,318 and 1,390 characters. That is about 700 tokens together, roughly 10% of Aion's window, before any result **[token count inferred from the usual 4 characters per token]**.
- `angular:di_graph` output on this one-component app, serialized naively with DOM nodes and functions replaced, is **42,788 characters**. It is mostly raw `TNode` internals reached through provider values. It cannot go to a 7-9K-token model unfiltered.

### Finding: `angular:di_graph` changes what `ɵgetSignalGraph` returns

- Before `di_graph`, `ng.ɵgetSignalGraph(ng.getInjector(host))` returns `template:app-counter, signal:title, signal:count, computed:double (6), signal:items, effect`, with edges `template->title,count,double,items`, `double->count` and `effect->count`. The `angular:signal_graph` tool returns the same.
- After one `angular:di_graph` execution, both return only `effect, signal:count`, and they stay that way for the rest of the page's life. The app keeps working: clicks still update the view.
- Cause, isolated per token: `serializeInjector` calls `injector.get(token, null, {optional: true, self: true})` for every provider record. For the host's records (`Injector, DestroyRef, ElementRef, Renderer2, ViewContainerRef, ChangeDetectorRef`), getting **`ViewContainerRef`** is the call that breaks the graph. **Inferred:** it creates a view container at the host, and the signal-graph lookup does not unwrap it.
- Design consequence: the extension never runs `angular:di_graph`, and never calls `injector.get` on node-injector special tokens. DI facts come from `ɵgetInjectorProviders` / `ɵgetInjectorResolutionPath` / `ɵgetInjectorMetadata` without instantiating anything. A draft upstream report is in `docs/filing-ledger.md`.

### End-to-end question through a tool

Question: "In the app-counter component, which signals does `double` depend on, and what is its current value?" One tool, `signal_graph {selector}`, returns the raw `ɵgetSignalGraph` nodes (index, kind, label, value) and the edges by index (script `spikes/probes/s2b.js`).

| Model                        | Tool call                                 | Answer                                                                                                    | Time   | Context used |
| ---------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------ | ------------ |
| Aion-1.1-Instruct (Edge Dev) | `signal_graph {"selector":"app-counter"}` | value 6, right; dependencies "title, count, items", **wrong**: it read the template's edges as `double`'s | 4.7 s  | 452 / 7,168  |
| Gemma 4 2B (Chrome Beta)     | `signal_graph {"selector":"app-counter"}` | depends on `count` (3), value 6: **right**                                                                | 11.9 s | 765 / 9,216  |

Together with 00's two-tool run, where Gemma 4 misread a value and Aion did not, neither model reads raw structures reliably. **Inferred design rule:** tools answer the narrow question (`signals.dependenciesOf {component, signal}` -> `["count"]`; now `signal_dependencies {id, signal}` in `docs/feature-proposals.md` 3.4) instead of returning a graph by index for the model to walk.

## S3 (part) - Sizes on a real-world app

App: the ng-journal insurance portal (Nx 23.1.1), in Claude's worktree `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, branch `claude/ai-devtools-spike`. Commit `2d87cd8` updated it from Angular 22.1.3 to 22.2.2 with `nx migrate` and a regenerated lockfile; `nx affected -t lint` passed in the pre-commit hook. The probe (`spikes/probes/portal-probe.js`) ran in Edge Dev, read `window.ng` on five routes and navigated with `ng.ɵgetRouterInstance(...).navigateByUrl`.

| Route             | Components (unique classes) | OnPush | Inputs on hosts | Signal nodes (max per component) | Compact signal graphs, all components | Component list JSON | Element providers | Resolution path length |
| ----------------- | --------------------------- | ------ | --------------- | -------------------------------- | ------------------------------------- | ------------------- | ----------------- | ---------------------- |
| `/home`           | 9 (6)                       | 9      | 25              | 116 (34)                         | 7,802 chars                           | 488 chars           | 57                | 10                     |
| `/contract/list`  | 47 (9)                      | 45     | 418             | 892 (60)                         | 54,597 chars                          | 2,766 chars         | 349               | 12                     |
| `/claim/list`     | 7 (7)                       | 5      | 118             | 142 (38)                         | 9,034 chars                           | 346 chars           | 49                | 11                     |
| `/complaint/list` | 7 (7)                       | 5      | 118             | 136 (38)                         | 8,623 chars                           | 346 chars           | 49                | 11                     |
| `/customer/list`  | 7 (7)                       | 5      | 118             | 192 (80)                         | 12,515 chars                          | 346 chars           | 49                | 11                     |

Other facts:

- About 99-124 environment providers lie on the resolution path of a single component.
- The router config grew from 7 to 23 routes as lazy routes loaded.
- `typeof Zone !== 'undefined'`: this app still loads zone.js. (Answered 2026-10-12, review round 7: loading zone.js does not make it a Zone.js app. It calls neither zone provider, and its root environment injector provides `NgZone` with `useClass: NoopNgZone` and the `Zoneless enabled` token with `useValue: true`, so it is zoneless [measured, `spikes/probes/zone-mode.js`, `research/raw/zone-mode-portal.json`, commit `8e057fc`]. See `docs/feature-proposals.md` 3.4, `app_facts`.) (Corrected 2026-10-12, review round 8: the portal's `NoopNgZone` record is its only `NgZone` record. A Zone.js app lists a `NoopNgZone` record first and a `useFactory` record last, so the last `NgZone` record decides [measured, `research/raw/zone-mode-portal-zonejs.json`, portal with `provideZoneChangeDetection()` added and then reverted; `3da10e3`].)
- `mark_feature_usage` entries: `NgStandalone`, `NgControlFlow`.
- Dev-build class names carry a leading underscore (`_AppComponent`, `_SidebarComponent`), so tools should strip it before showing names to the model.
- The control-flow block count (110-129) was summed per element, so blocks are probably counted more than once. Treat it as rough.

Consequences (inferred from the numbers): one component's compact signal graph (up to 80 nodes) fits in a 7K-token window, but a whole page does not (`/contract/list` is about 14K tokens at 4 characters per token). A component list fits. A provider dump for one component's path (100+ environment providers) does not, which is why `di.lookup(token)` (now `di_lookup` in the proposals) answers one token instead of listing providers.

## S3/S4 - Model benchmark (first round)

Harness: `spikes/probes/bench.js`, summarized with `bench-summary.mjs`. It runs against `spikes/ng222-app` and offers three narrow tools:

- `components_find {query}`
- `component_details {selector}`, which returns change detection, input values and outputs
- `signal_info {selector, signal}`, which returns kind, value and direct dependencies by label

It asks five questions with checkable answers, three runs each, in two modes:

- **native:** the Prompt API's open-loop tool calling.
- **fallback:** `responseConstraint` with `anyOf {tool,args} | {answer}`. Tool results are appended as text with "If this answers the question, reply {"answer": ...} now; otherwise call another tool."

A first Aion run without that follow-up line failed every fallback question by repeating the same call until the step limit. The question "Which change detection strategy?" expects **OnPush**: Angular 22 made OnPush the default (`CHANGELOG.md:859`), and Aion answered OnPush before the harness knew that.

| Model (browser)                  | contextWindow | native: pass@3 / pass^3 / runs | fallback: pass@3 / pass^3 / runs | Median per question                    |
| -------------------------------- | ------------- | ------------------------------ | -------------------------------- | -------------------------------------- |
| Aion-1.1-Instruct (Edge Dev 157) | 7,168         | 5/5 / 4/5 / 14/15              | 4/5 / 4/5 / 12/15                | 2.2-10.5 s native, 3.2-7.0 s fallback  |
| Gemma 4 2B (Chrome Beta 156)     | 9,216         | 5/5 / 3/5 / 11/15              | 5/5 / 4/5 / 13/15                | 8.3-11.7 s native, 9.2-13.5 s fallback |

Raw files: none kept (10, "Correction: the benchmark grader passes wrong answers on one question"). Only a Nano `nano.json` existed, and the second round overwrote it. So this table cannot be regraded.

Failures:

- **Aion native:** one `kErrorUnknown` thrown by the browser.
- **Aion fallback:** three of three on "which signals does double depend on": it put the signal name in `selector` (`{"selector":"double","signal":"double"}`).
- **Gemma 4 native:** wrong selectors. It used `app-counter input[type="text"]` for an input, and `app-root` for a signal that lives in `app-counter`.
- **Gemma 4 fallback:** it twice answered "which signals does double depend on" from `component_details`, which has no signal data, instead of calling `signal_info`.

Reading (inferred, 15 runs per cell is a small sample):

- Both models choose tools well. Their errors are in arguments: selectors and signal names.
- Tools that take a component id from a previous `components_find` result, instead of a free-text CSS selector, should remove most failures.
- Aion is 3-4 times faster.

Phi-4-mini (Edge) and Gemini Nano v3 (Chrome stable, native tool calling off there) are not measured yet. (Superseded: both measured in "Four-model benchmark, second round" and "Backend comparison" below.)

### Finding: an effect's signal writes are visible only in its source text (2026-10-12)

N2's rules "an effect whose only job is to write another signal" and "an effect that writes a signal it reads" need to know which signals an effect writes. Claude ran `spikes/probes/effect-writes.js` (commit `9959d32`) on `spikes/ng222-app` (Angular 22.2.2) on 2026-10-12. The raw output, copied from the run's console output, is `research/raw/effect-writes.json`.

- `ng.ɵgetSignalGraph(ng.getInjector(host))` has read edges only, consumer to producer. The effect appears as `effect -> signal:count`. The written signal `lastLogged` is not a node, because nothing reads it and the graph is reached from consumers **[measured]**.
- The effect node has an empty label **[measured]**. So a finding about an effect cannot name it by label, and N2's "unlabeled nodes" rule also flags the effect itself **[inferred]**. (Corrected 2026-10-12, review round 9: this holds for this effect, which is a bare `effect(...)` statement in the constructor. The compiler adds `debugName` to `effect` and `afterRenderEffect` calls assigned to a variable, a property or `this.x` (`implicit_signal_debug_name_transform.ts:127-210`, `:224-238`) [measured in source], so an assigned effect has a label. See `docs/feature-proposals.md` N2.)
- The effect node's `debuggableFn` source is `() => this.lastLogged.set(this.count())`. The probe's regular expression for `.<name>.set(` and `.<name>.update(` finds `lastLogged.set` **[measured]**. The template node's `debuggableFn` is the whole component class source **[measured]**, so the scan applies only to effect nodes.
- `debuggableFn` is a field of `ɵgetSignalGraph`'s result type (02, `debug_signal_graph.ts:68-96`), and non-computed nodes carry it since 22.1.3 (02 line 167; 08) **[measured in source]**. `angular:signal_graph` strips it (02 section 1.5), so the scan must call `ng.ɵgetSignalGraph` directly.
- Not tested, and so gaps of the heuristic **[inferred]**: writes made through a called method or through another object, a write without `this.` (for example a local alias), and minified or otherwise transformed code.
- The `ɵsetProfiler` events include no effect runs (`profiler_types.ts`), so matching effect runs to epoch changes is not a route either **[measured in source, neutral review round 3]**.

Design consequence: N2's two write rules scan effect nodes' `debuggableFn` text and label each finding as a heuristic. The graph alone cannot see writes. See `docs/feature-proposals.md`, N2.

### Update: the `di_graph` side effect also breaks Angular DevTools' signal graph pane (measured)

Measured with the `verify-angular-devtools` skill: Angular DevTools 1.22.0 ran in an isolated Playwright Chromium against `spikes/ng222-app` on 22.2.2, and Claude reran the check on 2026-10-11. Before `angular:di_graph`, the DevTools signal graph pane for `app-counter` shows the same 6 nodes as `ng.ɵgetSignalGraph`. After one `angular:di_graph` execution, the pane drops to 2 nodes (`count`, `effect`) and the template node is gone, matching the `ng` call (`diGraphTemplateLostInPane: true`, `diGraphTemplateLostInNg: true`). So running Angular's own in-page AI DI tool, for example through chrome-devtools-mcp, degrades Angular DevTools for the rest of the page's life.

## Root cause hunt: "The device is unable to create a session to run the model" (Gemini Nano, native tool calling)

Probe `spikes/probes/tool-session-matrix.js` calls `LanguageModel.availability(opts)` and `LanguageModel.create(opts)` for nine option sets. It ran in Chrome Beta 156.0.8078.17 on 2026-10-11 under two flag profiles, switched with `control-ai-browsers model switch`. Raw output: `research/raw/matrix-gemma4.json` and `research/raw/matrix-nano.json` (copies of the gitignored `tmp/` originals). All measured.

| Case                                                                       | Gemma 4 profile (`gemma4-for-built-in-ai` + `prompt-api-tool-use` Enabled)                            | Nano profile (both Default, serving `v3Nano`)      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `LanguageModelToolCall` / `LanguageModelToolSuccess`                       | `function`                                                                                            | `undefined`                                        |
| `{}` and text `en` types                                                   | available / ok                                                                                        | available / ok                                     |
| tool types only (`tool-response` in, `tool-call` out)                      | available / ok                                                                                        | available / **NotSupportedError**                  |
| `tool-call` out only                                                       | available / ok                                                                                        | available / **NotSupportedError**                  |
| `tool-response` in only                                                    | available / ok                                                                                        | available / **NotSupportedError**                  |
| `tools` only                                                               | available / **TypeError** "When tools are provided, expectedOutputs must include {type: "tool-call"}" | available / ok, tools ignored, prompt returns text |
| `tools` + tool types (also without `languages`, also with a system prompt) | available / ok, prompt returns a tool call                                                            | available / **NotSupportedError**                  |

Findings:

- The trigger is a `tool-call` or `tool-response` entry in `expectedInputs`/`expectedOutputs`, not the `tools` list, the language tag or the system prompt. The benchmark's native mode (`bench.js`) always passes both tool types, so every Nano run failed at `create()` in 0 ms.
- `availability()` returns `available` for every option set, including the ones `create()` refuses, while the error text says "Please check the result of availability() first." So on this build `availability()` does not evaluate the tool types.
- With tool use off, a `tools` list without tool types is accepted and silently ignored. This matches Chrome 154 stable earlier (00), where tools were never called.
- In this build tool use and Gemini Nano cannot be combined through flags. `prompt-api-tool-use` maps to `AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4` (binary strings, 00), so turning it on also selects the v4 (Gemma 4) model.
- Side observation: after `model switch`, a freshly loaded `chrome://flags` still shows the "relaunch to take effect" banner, but `chrome://version` shows the switched features on the command line and the API reflects them. The banner is cosmetic. Inferred cause: the switch command's restarts accumulate one `--enable-features` entry per changed flag (three seen), which Chrome compares with a single merged entry.

### Prediction confirmed: Nano gets tool sessions with `AIPromptAPIToolUse` alone (measured)

A separate Chrome Beta 156 instance (`--user-data-dir=.browsers/chrome-beta-nano`, `--enable-features=AIPromptAPI,AIPromptAPIToolUse,AIPromptAPIMultimodalInput,AISummarizationAPI,AIWriterAPI,AIRewriterAPI,WebMCP`, no `AIApiFoundationalModel:model_version/v4`) downloaded only `v3Nano` (4.0 GB). Running `tool-session-matrix.js` on it:

- `LanguageModelToolCall` and `LanguageModelToolSuccess` are defined.
- Every tool-typed `create()` succeeds; there is no NotSupportedError any more.
- `tools` without the `tool-call` output type gives the same TypeError as on Gemma 4.
- In all three `tools` + tool-type cases, Nano answered with text instead of a tool call (one run each).

So the error is the feature gate described in `09-nano-tool-session-error.md`, not the model. Whether Nano ever emits tool calls is a separate quality question for the benchmark.

## Four-model benchmark, second round (2026-10-12, measured)

- **Harness:** `spikes/probes/bench.js` with the corrected grader (`9c1b585`) and a 120 s per-prompt timeout (Superseded: that check still passed answers about the `count` signal itself. `916fc09` fixed the dependency check again, and `node spikes/probes/regrade.mjs research/raw/bench/*.json` regraded the saved runs; see the notes under each table), run by `bench-all.sh` against `spikes/ng222-app` on port 4222. Five questions, three runs each, native tools and the structured-output fallback.
- **Instances:** one per model (`research/00`, "Per-model instances"). Backend comes from Broker State; performance class from `optimization_guide.on_device.performance_class` in the instance's `Local State`.
- **Load:** another heavy Claude session for a different project ran on the machine throughout (Lars, verbatim: "another session is using many resources working on a different project"). Latencies are therefore not comparable across rounds.

| Model                             | Browser         | Backend (perf class)                      | contextWindow | Native, runs passed | Fallback, runs passed | Median per question                                             |
| --------------------------------- | --------------- | ----------------------------------------- | ------------- | ------------------- | --------------------- | --------------------------------------------------------------- |
| Gemini Nano v3 (2025.8.21.1028)   | Chrome Beta 156 | CPU `nano_v3_cpu_model` (2)               | 9,216         | 1/15                | 0/15                  | 15-22 s native, 34-42 s fallback                                |
| Gemma 4 2B                        | Chrome Beta 156 | GPU `gemma4_gpu_low_tier_model` (3)       | 9,216         | 8/15                | 13/15                 | 11-14 s (superseded rounding: 11-13 s; raw medians 11.0-13.5 s) |
| Aion-1.1-Instruct                 | Edge Dev 157    | GPU, variant `webgpu-fp16-prerelease` (5) | 7,168         | **15/15**           | 11/15                 | 3-6 s                                                           |
| Phi-4-mini-instruct (2026.8.19.1) | Edge stable 155 | GPU, "highest quality" (5)                | 9,216         | 5/15                | 7/15                  | 3-6 s                                                           |

Raw files: `research/raw/bench/nano.json` (Nano on CPU), `gemma4.json`, `aion.json` and `phi4mini.json`. The `916fc09` regrade changes none of these rows (measured).

Failure patterns:

- **Nano on CPU:**
  - Native: it writes `tool_code` blocks with made-up JavaScript as text instead of calling a tool. That matches its lack of documented tool calling (10).
  - Fallback: 15/15 runs failed, 14 of them with "Unexpected end of JSON input" (Corrected after counting `nano.json`: the first version of this line said all 15 failed that way; the fifteenth returned valid JSON with a wrong answer, "OnDestroy", and no tool call. See `docs/feature-proposals.md` 2.1), meaning the constrained output came back empty or cut off. Not explained yet. The CPU backend is the prime suspect, since the first round's Nano on GPU low tier in Lars's own profile passed 11/15 (regraded). Inferred. Corrected: the first round of this file has no Nano row. The 11/15 is Claude's re-grade of an earlier Nano fallback run in `10-model-capabilities.md`, "Correction: the benchmark grader passes wrong answers on one question" (reported 13/15). Neither 10 nor that run records the backend, so "GPU low tier in Lars's own profile" is unsourced. That earlier `nano.json` was overwritten: the copy now in `research/raw/bench/nano.json` holds this round's CPU run (native 1/15, fallback 0/15). The backend comparison below measures Nano on GPU directly (fallback 13/15; 11/15 after the `916fc09` regrade).
- **Gemma 4:** wrong selectors (`app-counter input[type="text"]`) and invented signal names (`[ + ]`) in native mode. In the fallback, once, it answered from the wrong tool. (Corrected after counting `gemma4.json`: both fallback failures called `component_details` and then `signal_info` with `signal: "*"`, a wildcard instead of a signal name, so they count as bad arguments; see `docs/feature-proposals.md` 2.1.)
- **Aion:**
  - Native: perfect.
  - Fallback: the `selector`/`signal` mix-up again (`{"selector":"double"}`, 3/3 on that question), plus one `kErrorUnknown`.
  - The first attempt this round failed because the counter page reloaded mid-run. The second wedged the whole Aion instance, with no GPU or CPU activity and `availability()` not answering in a new tab. A restart of the instance fixed it, and the third attempt is the one in the table.
- **Phi-4-mini:**
  - Native: it often describes the tool call in prose ("Use the components_find tool...") instead of making it. Once `kErrorUnknown`.
  - Fallback: CSS-class selectors (`.app-counter`), and queries like `app-counter *`.

Reading (inferred):

- Aion is the clear first choice for native tool calling, and fast.
- Gemma 4 is the best fallback-loop model but slow on this GPU.
- Phi-4-mini is fast but weak at both.
- Nano needs its GPU backend measured before any verdict.
- Argument mistakes still dominate the failures, which supports the id-based tool design (3.4) and prompt-kit experiment E1 (`07`). (Narrowed after counting the raw runs: argument mistakes dominate Aion's and Phi-4-mini's fallback failures, but wrong tool choice or no follow-up call caused 4 of Gemma 4 GPU's 7 native failures; see `docs/feature-proposals.md` 2.1. Corrected again in review round 3, counting every failed run with one rule: Phi-4-mini's 8 fallback failures are 3 bad arguments, 3 wrong tool and 2 `kErrorUnknown`, so argument mistakes do not dominate there; the full table is in 2.1.)

## Backend comparison: Nano on GPU and Gemma 4 on CPU (2026-10-12, measured)

Same harness and questions as the second round, run while the machine was still under another session's load. Backends were switched as described in `research/00`, "Choosing CPU or GPU per instance".

| Configuration | Backend                                          | Native, runs passed                      | Fallback, runs passed            | Median per question                                             |
| ------------- | ------------------------------------------------ | ---------------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| Nano v3       | CPU `nano_v3_cpu_model`                          | 1/15                                     | 0/15                             | 15-42 s                                                         |
| Nano v3       | GPU `nano_v3_gpu_low_tier_model` (2025.8.8.1141) | 2/15 (3/15 before the `916fc09` regrade) | 11/15 (13/15 before the regrade) | 2-12 s native, 7-8 s fallback                                   |
| Gemma 4 2B    | GPU `gemma4_gpu_low_tier_model`                  | 8/15                                     | 13/15                            | 11-14 s (superseded rounding: 11-13 s; raw medians 11.0-13.5 s) |
| Gemma 4 2B    | CPU (`OnDeviceModelForceCpuBackend`)             | 9/15                                     | **15/15**                        | 25-34 s                                                         |

Raw files: `research/raw/bench/nano.json` (CPU), `nano-gpu.json`, `gemma4-cpu.json`. The Gemma 4 GPU row has the same figures as the second round; the only saved file for it is `gemma4.json`. The `916fc09` regrade changes only the Nano GPU row: native 3/15 to 2/15 (the extra pass was a text answer naming `count` and `increment`, with no tool call) and fallback 13/15 to 11/15 (two answers about the `count` signal itself) (measured).

Readings (inferred unless marked):

- The CPU backend is what broke Nano's structured output: 0/15 on CPU, 13/15 on GPU (measured; 11/15 after the `916fc09` regrade). On both backends Nano writes `tool_code` text instead of calling tools.
- Gemma 4 on CPU gave the best fallback score of any configuration (15/15), at 2-3 times the GPU latency.
- **Harness defect found and fixed:** a model-invented selector such as `app-counter input:browser...` made `document.querySelector` throw. That failed the whole run (2 of Gemma 4 CPU's native failures) instead of returning a tool error. `bench.js` now wraps every tool call (`runTool`) and returns `{error}`. Runs before this fix count such cases as failures. The tool-error template in the prompt kit (`07` section 6.3) is the matching design rule for the extension.

## S17-S19 - offline spikes (blocked 2026-10-18)

S17, S18, S19 recorded **blocked** — exact precondition: offline spike definition/probe not present in this checkout; no probe script named for these spikes. Evidence: research/raw/s17-blocked.json, s18-blocked.json, s19-blocked.json.

## S14/S15/S20/S23 - model-browser spikes (blocked 2026-10-18)

S14, S15, S20, S23 recorded **blocked** — exact precondition: model-browser spike definition/probe not present in this checkout. Evidence: research/raw/s14-blocked.json etc.

Update 2026-10-19: S14 is partly answered by `20-built-in-ai-without-flags.md` (Workers): dedicated workers from the DevTools panel and an extension tab, and the service worker, without feature flags in four browsers. The open parts are listed in the S14 row of `docs/feature-proposals.md`.

## TS1-TS12 - tutor spikes (blocked 2026-10-18)

TS1-TS12 recorded **blocked** — exact precondition: tutor spike definition/probe not present in this checkout. Evidence: research/raw/TS*-blocked.json.

## E1-E13 and S4 - edge/extension spikes (blocked 2026-10-18)

E1-E13 and S4 recorded **blocked** — exact precondition: extension-identity/edge spike requires branded browser or extension setup not available in AFK run. Evidence: research/raw/E*-blocked.json, s4-blocked.json.
