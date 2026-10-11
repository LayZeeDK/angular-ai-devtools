# 05 - Spike results

All results are **measured** unless a line says inferred. Probes ran in Lars's Edge Dev 157 (Aion-1.1-Instruct) and Chrome Beta 156 (Gemma 4 `gemma4-2b-it`). playwright-cli attached over remote debugging, and the scripts ran in the page's main world, the same world a MAIN-world content script gets. This is not an extension context; S1 is still open.

## S2 - Angular's in-page tools and the `ng` global on a real 22.2 app

App: `spikes/ng222-app`, generated with `@angular/cli@22.2.2 new --routing --ssr=false`, installed `@angular/core` 22.2.2, served with `ng serve --port 4222`. A component `app-counter` (`src/app/counter.ts`) has `title = input()`, `count = signal(3)`, `double = computed(count * 2)`, an injected root `CartService.items` signal, and an `effect` that writes `lastLogged`. The effect-writes-signal pattern is there on purpose, as a fixture for the anti-pattern finder (N2).

### Discovery

- `window.ng` has 25 functions: `applyChanges, enableProfiling, getComponent, getContext, getDirectiveMetadata, getDirectives, getHostElement, getInjector, getListeners, getOwningComponent, getRootComponents, isSignal, toggleWatchSignal, ɵgetComponentInstanceDeepLinkId, ɵgetControlFlowBlocks, ɵgetDependenciesFromInjectable, ɵgetInjectorMetadata, ɵgetInjectorProviders, ɵgetInjectorResolutionPath, ɵgetLoadedRoutes, ɵgetRouterInstance, ɵgetSignalGraph, ɵgetTransferState, ɵnavigateByUrl, ɵsetProfiler`. This matches the inventory in `02-angular-surface.md` for a `provideRouter` app.
- Dispatching `new CustomEvent('devtoolstooldiscovery')` with a `respondWith` expando from the main world returns `{name: 'Angular', tools: [angular:di_graph, angular:signal_graph]}` synchronously.
  - `angular:di_graph` has schema `{type: 'object', properties: {}}`. A tool with no parameters breaks Gemma 4 tool prompts (00), so this schema cannot be passed to the Prompt API as is.
  - `angular:signal_graph` has schema `{target: {type: 'object', 'x-mcp-type': 'HTMLElement'}}`. A model cannot produce an element, so the extension must wrap it (selector or component id in, element looked up in the page).
  - The two descriptions are 1,318 and 1,390 characters. That is about 700 tokens together, roughly 10% of Aion's window, before any result **[token count inferred from the usual 4 characters per token]**.
- `angular:di_graph` output on this one-component app, serialized naively with DOM nodes and functions replaced, is **42,788 characters**. It is mostly raw `TNode` internals reached through provider values. It cannot go to a 7-9K-token model unfiltered.

### Finding: `angular:di_graph` changes what `ɵgetSignalGraph` returns

- Before `di_graph`, `ng.ɵgetSignalGraph(ng.getInjector(host))` returns `template:app-counter, signal:title, signal:count, computed:double (6), signal:items, effect`, with edges `template->title,count,double,items`, `double->count` and `effect->count`. The `angular:signal_graph` tool returns the same.
- After one `angular:di_graph` execution, both return only `effect, signal:count`, and they stay that way for the rest of the page's life. The app keeps working: clicks still update the view.
- Cause, isolated per token: `serializeInjector` calls `injector.get(token, null, {optional: true, self: true})` for every provider record. For the host's records (`Injector, DestroyRef, ElementRef, Renderer2, ViewContainerRef, ChangeDetectorRef`), getting **`ViewContainerRef`** is the call that breaks the graph. **Inferred:** it creates a view container at the host, and the signal-graph lookup does not unwrap it.
- Design consequence: the extension never runs `angular:di_graph`, and never calls `injector.get` on node-injector special tokens. DI facts come from `ɵgetInjectorProviders` / `ɵgetInjectorResolutionPath` / `ɵgetInjectorMetadata` without instantiating anything. A draft upstream report is in `docs/filing-ledger.md`.

### End-to-end question through a tool

Question: "In the app-counter component, which signals does `double` depend on, and what is its current value?" One tool, `signal_graph {selector}`, returns the raw `ɵgetSignalGraph` nodes (index, kind, label, value) and the edges by index (script `s2b.js` in the session scratchpad).

| Model | Tool call | Answer | Time | Context used |
|---|---|---|---|---|
| Aion-1.1-Instruct (Edge Dev) | `signal_graph {"selector":"app-counter"}` | value 6, right; dependencies "title, count, items", **wrong**: it read the template's edges as `double`'s | 4.7 s | 452 / 7,168 |
| Gemma 4 2B (Chrome Beta) | `signal_graph {"selector":"app-counter"}` | depends on `count` (3), value 6: **right** | 11.9 s | 765 / 9,216 |

Together with 00's two-tool run, where Gemma 4 misread a value and Aion did not, neither model reads raw structures reliably. **Inferred design rule:** tools answer the narrow question (`signals.dependenciesOf {component, signal}` -> `["count"]`) instead of returning a graph by index for the model to walk.

## S3 (part) - Sizes on a real-world app

App: the ng-journal insurance portal (Nx 23.1.1), in Claude's worktree `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, branch `claude/ai-devtools-spike`. Commit `2d87cd8` updated it from Angular 22.1.3 to 22.2.2 with `nx migrate` and a regenerated lockfile; `nx affected -t lint` passed in the pre-commit hook. The probe (`portal-probe.js` in the session scratchpad) ran in Edge Dev, read `window.ng` on five routes and navigated with `ng.ɵgetRouterInstance(...).navigateByUrl`.

| Route | Components (unique classes) | OnPush | Inputs on hosts | Signal nodes (max per component) | Compact signal graphs, all components | Component list JSON | Element providers | Resolution path length |
|---|---|---|---|---|---|---|---|---|
| `/home` | 9 (6) | 9 | 25 | 116 (34) | 7,802 chars | 488 chars | 57 | 10 |
| `/contract/list` | 47 (9) | 45 | 418 | 892 (60) | 54,597 chars | 2,766 chars | 349 | 12 |
| `/claim/list` | 7 (7) | 5 | 118 | 142 (38) | 9,034 chars | 346 chars | 49 | 11 |
| `/complaint/list` | 7 (7) | 5 | 118 | 136 (38) | 8,623 chars | 346 chars | 49 | 11 |
| `/customer/list` | 7 (7) | 5 | 118 | 192 (80) | 12,515 chars | 346 chars | 49 | 11 |

Other facts:
- About 99-124 environment providers lie on the resolution path of a single component.
- The router config grew from 7 to 23 routes as lazy routes loaded.
- `typeof Zone !== 'undefined'`: this app still loads zone.js.
- `mark_feature_usage` entries: `NgStandalone`, `NgControlFlow`.
- Dev-build class names carry a leading underscore (`_AppComponent`, `_SidebarComponent`), so tools should strip it before showing names to the model.
- The control-flow block count (110-129) was summed per element, so blocks are probably counted more than once. Treat it as rough.

Consequences (inferred from the numbers): one component's compact signal graph (up to 80 nodes) fits in a 7K-token window, but a whole page does not (`/contract/list` is about 14K tokens at 4 characters per token). A component list fits. A provider dump for one component's path (100+ environment providers) does not, which is why `di.lookup(token)` answers one token instead of listing providers.

## S3/S4 - Model benchmark (first round)

Harness: `spikes/probes/bench.js`, summarized with `bench-summary.mjs`. It runs against `spikes/ng222-app` and offers three narrow tools:
- `components_find {query}`
- `component_details {selector}`, which returns change detection, input values and outputs
- `signal_info {selector, signal}`, which returns kind, value and direct dependencies by label

It asks five questions with checkable answers, three runs each, in two modes:
- **native:** the Prompt API's open-loop tool calling.
- **fallback:** `responseConstraint` with `anyOf {tool,args} | {answer}`. Tool results are appended as text with "If this answers the question, reply {"answer": ...} now; otherwise call another tool."

A first Aion run without that follow-up line failed every fallback question by repeating the same call until the step limit. The question "Which change detection strategy?" expects **OnPush**: Angular 22 made OnPush the default (`CHANGELOG.md:859`), and Aion answered OnPush before the harness knew that.

| Model (browser) | contextWindow | native: pass@3 / pass^3 / runs | fallback: pass@3 / pass^3 / runs | Median per question |
|---|---|---|---|---|
| Aion-1.1-Instruct (Edge Dev 157) | 7,168 | 5/5 / 4/5 / 14/15 | 4/5 / 4/5 / 12/15 | 2.2-10.5 s native, 3.2-7.0 s fallback |
| Gemma 4 2B (Chrome Beta 156) | 9,216 | 5/5 / 3/5 / 11/15 | 5/5 / 4/5 / 13/15 | 8.3-11.7 s native, 9.2-13.5 s fallback |

Failures:
- **Aion native:** one `kErrorUnknown` thrown by the browser.
- **Aion fallback:** three of three on "which signals does double depend on": it put the signal name in `selector` (`{"selector":"double","signal":"double"}`).
- **Gemma 4 native:** wrong selectors. It used `app-counter input[type="text"]` for an input, and `app-root` for a signal that lives in `app-counter`.
- **Gemma 4 fallback:** it twice answered "which signals does double depend on" from `component_details`, which has no signal data, instead of calling `signal_info`.

Reading (inferred, 15 runs per cell is a small sample):
- Both models choose tools well. Their errors are in arguments: selectors and signal names.
- Tools that take a component id from a previous `components_find` result, instead of a free-text CSS selector, should remove most failures.
- Aion is 3-4 times faster.

Phi-4-mini (Edge) and Gemini Nano v3 (Chrome stable, native tool calling off there) are not measured yet.

### Update: the `di_graph` side effect also breaks Angular DevTools' signal graph pane (measured)

Measured with the `verify-angular-devtools` skill: Angular DevTools 1.22.0 ran in an isolated Playwright Chromium against `spikes/ng222-app` on 22.2.2, and Claude reran the check on 2026-10-11. Before `angular:di_graph`, the DevTools signal graph pane for `app-counter` shows the same 6 nodes as `ng.ɵgetSignalGraph`. After one `angular:di_graph` execution, the pane drops to 2 nodes (`count`, `effect`) and the template node is gone, matching the `ng` call (`diGraphTemplateLostInPane: true`, `diGraphTemplateLostInNg: true`). So running Angular's own in-page AI DI tool, for example through chrome-devtools-mcp, degrades Angular DevTools for the rest of the page's life.

## Root cause hunt: "The device is unable to create a session to run the model" (Gemini Nano, native tool calling)

Probe `spikes/probes/tool-session-matrix.js` calls `LanguageModel.availability(opts)` and `LanguageModel.create(opts)` for nine option sets. It ran in Chrome Beta 156.0.8078.17 on 2026-10-11 under two flag profiles, switched with `control-ai-browsers model switch`. Raw output was saved to `tmp/matrix-gemma4.json` and `tmp/matrix-nano.json`. All measured.

| Case | Gemma 4 profile (`gemma4-for-built-in-ai` + `prompt-api-tool-use` Enabled) | Nano profile (both Default, serving `v3Nano`) |
|---|---|---|
| `LanguageModelToolCall` / `LanguageModelToolSuccess` | `function` | `undefined` |
| `{}` and text `en` types | available / ok | available / ok |
| tool types only (`tool-response` in, `tool-call` out) | available / ok | available / **NotSupportedError** |
| `tool-call` out only | available / ok | available / **NotSupportedError** |
| `tool-response` in only | available / ok | available / **NotSupportedError** |
| `tools` only | available / **TypeError** "When tools are provided, expectedOutputs must include {type: "tool-call"}" | available / ok, tools ignored, prompt returns text |
| `tools` + tool types (also without `languages`, also with a system prompt) | available / ok, prompt returns a tool call | available / **NotSupportedError** |

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

- **Harness:** `spikes/probes/bench.js` with the corrected grader (`9c1b585`) and a 120 s per-prompt timeout, run by `bench-all.sh` against `spikes/ng222-app` on port 4222. Five questions, three runs each, native tools and the structured-output fallback.
- **Instances:** one per model (`research/00`, "Per-model instances"). Backend comes from Broker State; performance class from `optimization_guide.on_device.performance_class` in the instance's `Local State`.
- **Load:** another heavy Claude session for a different project ran on the machine throughout (Lars, verbatim: "another session is using many resources working on a different project"). Latencies are therefore not comparable across rounds.

| Model | Browser | Backend (perf class) | contextWindow | Native, runs passed | Fallback, runs passed | Median per question |
|---|---|---|---|---|---|---|
| Gemini Nano v3 (2025.8.21.1028) | Chrome Beta 156 | CPU `nano_v3_cpu_model` (2) | 9,216 | 1/15 | 0/15 | 15-22 s native, 34-42 s fallback |
| Gemma 4 2B | Chrome Beta 156 | GPU `gemma4_gpu_low_tier_model` (3) | 9,216 | 8/15 | 13/15 | 11-13 s |
| Aion-1.1-Instruct | Edge Dev 157 | GPU, variant `webgpu-fp16-prerelease` (5) | 7,168 | **15/15** | 11/15 | 3-6 s |
| Phi-4-mini-instruct (2026.8.19.1) | Edge stable 155 | GPU, "highest quality" (5) | 9,216 | 5/15 | 7/15 | 3-6 s |

Failure patterns:
- **Nano on CPU:**
  - Native: it writes `tool_code` blocks with made-up JavaScript as text instead of calling a tool. That matches its lack of documented tool calling (10).
  - Fallback: 15/15 runs failed with "Unexpected end of JSON input", meaning the constrained output came back empty or cut off. Not explained yet. The CPU backend is the prime suspect, since the first round's Nano on GPU low tier in Lars's own profile passed 11/15 (regraded). Inferred.
- **Gemma 4:** wrong selectors (`app-counter input[type="text"]`) and invented signal names (`[ + ]`) in native mode. In the fallback, once, it answered from the wrong tool.
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
- Argument mistakes still dominate the failures, which supports the id-based tool design (3.4) and prompt-kit experiment E1 (`07`).

## Backend comparison: Nano on GPU and Gemma 4 on CPU (2026-10-12, measured)

Same harness and questions as the second round, run while the machine was still under another session's load. Backends were switched as described in `research/00`, "Choosing CPU or GPU per instance".

| Configuration | Backend | Native, runs passed | Fallback, runs passed | Median per question |
|---|---|---|---|---|
| Nano v3 | CPU `nano_v3_cpu_model` | 1/15 | 0/15 | 15-42 s |
| Nano v3 | GPU `nano_v3_gpu_low_tier_model` (2025.8.8.1141) | 3/15 | 13/15 | 2-12 s native, 7-8 s fallback |
| Gemma 4 2B | GPU `gemma4_gpu_low_tier_model` | 8/15 | 13/15 | 11-13 s |
| Gemma 4 2B | CPU (`OnDeviceModelForceCpuBackend`) | 9/15 | **15/15** | 25-34 s |

Readings (inferred unless marked):
- The CPU backend is what broke Nano's structured output: 0/15 on CPU, 13/15 on GPU (measured). On both backends Nano writes `tool_code` text instead of calling tools.
- Gemma 4 on CPU gave the best fallback score of any configuration (15/15), at 2-3 times the GPU latency.
- **Harness defect found and fixed:** a model-invented selector such as `app-counter input:browser...` made `document.querySelector` throw. That failed the whole run (2 of Gemma 4 CPU's native failures) instead of returning a tool error. `bench.js` now wraps every tool call (`runTool`) and returns `{error}`. Runs before this fix count such cases as failures. The tool-error template in the prompt kit (`07` section 6.3) is the matching design rule for the extension.
