# Filing ledger

Drafts for Lars to file if and when he chooses. Claude files nothing.

## 1. angular/angular: `angular:di_graph` AI tool creates a `ViewContainerRef` on every component host, after which `ng.ɵgetSignalGraph` loses the template consumer

Status: draft, not filed. Found 2026-10-11 during spike S2 (`docs/feature-proposals.md` section 7).

**Versions:** `@angular/core` 22.2.2 (fresh `ng new`, dev server, zoneless default), Edge Dev 157 on Windows 11 arm64. Source read on the `22.2.x` branch.

**What happens:** the in-page AI tool `angular:di_graph` (`packages/core/src/debug/ai/di_graph.ts`, registered through `devtoolstooldiscovery` by `registerAiTools()` in dev mode) serializes every element injector with `serializeInjector()`. That function calls `injector.get(record.token, null, {optional: true, self: true})` for every record from `getInjectorProviders()` (`packages/core/src/debug/ai/serialized_di_graph.ts`). On a component host, the records include `ViewContainerRef` and `ChangeDetectorRef`. Getting `ViewContainerRef` creates a view container at the host as a side effect. Afterwards, `ng.ɵgetSignalGraph(ng.getInjector(host))` (and so the `angular:signal_graph` tool) returns only the effects and their producers. The `template` node and the signals that only the template reads (`title`, `double`, `items`) are gone; `count` stays, because the effect also reads it. The app itself keeps rendering and updating.

**Reproduction** (component with `title = input()`, `count = signal(3)`, `double = computed(...)`, an injected service signal and one `effect`), in the browser console of the dev-mode app:

```js
const host = document.querySelector('app-counter');
const inj = ng.getInjector(host);
const nodes = () => ng.ɵgetSignalGraph(ng.getInjector(host)).nodes.map((n) => n.kind + ':' + (n.label || '-')).join(' ');
nodes(); // 'template:app-counter signal:title signal:count computed:double signal:items effect:-'
const vcr = ng.ɵgetInjectorProviders(inj).map((r) => r.token).find((t) => t.name === 'ViewContainerRef');
inj.get(vcr, null, { optional: true, self: true });
nodes(); // 'effect:- signal:count'
```

The same happens after running the tool itself:

```js
let g; const ev = new CustomEvent('devtoolstooldiscovery'); ev.respondWith = (x) => { g = x; }; dispatchEvent(ev);
await g.tools.find((t) => t.name === 'angular:di_graph').execute({});
// signal graph for any component host now lacks its template node
```

Measured per token: `Injector`, `DestroyRef`, `ElementRef`, `Renderer2` leave the graph intact; `ViewContainerRef` breaks it. `ChangeDetectorRef` was not tested on its own.

**Expected:** a read-only debugging tool does not change the view structure, and reading the signal graph works whether or not a `ViewContainerRef` was ever injected at the host. That second point matters on its own: a component whose host has an injected `ViewContainerRef` for real app reasons probably shows the same missing template node (inferred, not tested).

**Possible fixes (inferred):** skip `ViewContainerRef`, `ChangeDetectorRef` (untested, included as another node-injector special token) and other node-injector special tokens in `serializeInjector`, or report them without calling `get`; and make the signal-graph lookup unwrap a view container at the host to reach the component view.

**Related (inferred, not run):** `ng.ɵgetDependenciesFromInjectable` makes the same call, `injector.get(token, null, {self: true, optional: true})`, as its first statement (`packages/core/src/render3/util/injector_discovery_utils.ts:61` on 22.2.x, read in source). So a debugging client that passes it a `ViewContainerRef` token from `ɵgetInjectorProviders` would probably cause the same loss. Angular DevTools passes it only component and directive classes (`component-tree.ts:155-158`), so it does not.

**Evidence:** the two reproduction snippets above are self-contained; the issue text needs nothing else.

(For Lars only, leave out of the filed issue: the spike app is `spikes/ng222-app` and the probe results are in `research/05-spikes.md`, both in this repository.)

**Added 2026-10-11 (measured):** Angular DevTools 1.22.0's signal graph pane shows the same loss. Before `angular:di_graph` it shows 6 nodes for the component; after it, 2 nodes (`count`, `effect`), with no template node. So the tool's side effect reaches users who never call `ɵgetSignalGraph` themselves: anyone who runs Angular's DI tool through chrome-devtools-mcp and then opens Angular DevTools. Evidence: `verify-angular-devtools` run, `tmp/verify-angular-devtools/20261011-192415.460/` (gitignored), skill in `.claude/skills/verify-angular-devtools/`. (For Lars only: these are local paths; in the filed issue, describe the DevTools check in words.)

## 2. pangular-inspector/devtools: the source scan finds nothing in an Nx workspace that uses `project.json` and `libs/`

Status: draft, not filed. Found 2026-10-11 while building `.claude/skills/control-pangular-inspector`.

**Versions:** `@pangular-inspector/devtools` 0.0.7 (npm), source read at clone commit 76c09d0; Nx 23.1.1, Angular 22.2.2, npm 11.16.0, Node 24.18.0, Windows 11 arm64.

**What happens:** `sourceRoots()` (`packages/devtools/src/rpc/source-scan.ts:313`) collects `sourceRoot` / `root/src` from `angular.json` projects, plus `<cwd>/src`. An Nx workspace configures projects in `project.json` files and has no `angular.json`, so the scan sees nothing outside `<cwd>/src`.

**Reproduction** in the ng-journal Insurance Portal (Nx, app in `apps/insurance-portal`, features in `libs/*`), with the package installed:

```bash
npx pangular mcp --root .                      # get-components -> []
npx pangular mcp --root apps/insurance-portal  # get-components -> 4 app-shell components; stderr warns "no angular.json and no package.json that depends on @angular/core"
```

The panel dashboard shows 0 components, routes, signals and providers "discovered in source" while the live tabs work.

**Expected:** read Nx `project.json` files (`sourceRoot`, or `root` + `src`) next to `angular.json`, or accept several `--root` folders.

**Evidence:** `.claude/skills/control-pangular-inspector/features/source-scan.md`; rerun with `node .claude/skills/control-pangular-inspector/scripts/control.mjs scan get-components [--root apps/insurance-portal]`.

## 3. pangular-inspector/devtools: the docs list `list-components`, the published 0.0.7 does not have it

Status: draft, not filed. Found 2026-10-11 while building `.claude/skills/control-pangular-inspector`.

**Versions:** `@pangular-inspector/devtools` 0.0.7 (npm); `list-components` added in clone commit 20ebbb9; Node 24.18.0, Windows 11 arm64.

**What happens:** `apps/docs/src/content/agents/tools.md` documents `list-components`. `tools/list` on `pangular dev --read-only` from the npm 0.0.7 package returns 46 tools without it; the tool was added in 20ebbb9 after the release. A reader of the docs site cannot tell which tools a version has.

**Reproduction** in an Angular app with the package installed (`npm install --save-dev --save-exact @pangular-inspector/devtools@0.0.7`):

```bash
node node_modules/@pangular-inspector/devtools/bin.mjs dev --port 9999 --no-open --root . --read-only
curl -s http://localhost:9999/__mcp -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H 'Origin: http://localhost:9999' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# one SSE "data:" line; result.tools has 46 entries and no list-components
```

The measured run used the skill's client, `node .claude/skills/control-pangular-inspector/scripts/control.mjs tools`, which sends the same JSON-RPC request; the `curl` line is its equivalent and was not run itself (inferred).

**Evidence:** `.claude/skills/control-pangular-inspector/SKILL.md:172` (0.0.7 has no `list-components`; added in 20ebbb9; 46 tools with `--read-only`).

**Expected:** a "since" marker per tool, or docs versioned with the package.

## 4. Chromium (Blink>AI>Prompt): `LanguageModel.availability()` returns `available` for tool types that `create()` then refuses

Status: draft, not filed. Found 2026-10-11 in the root-cause reading of Gemini Nano's "unable to create a session" error (`research/09-nano-tool-session-error.md`, Q3 and Q5; measured behaviour in `research/05-spikes.md`, "Root cause hunt").

**Versions:** Chrome Beta 156.0.8078.17 on Windows 11 arm64, model `v3Nano`. Source read at tag `156.0.8078.17`; the same checks are present on `main` at `157.0.8100.0` with shifted line numbers (09). Spec read at webmachinelearning/prompt-api `index.bs` commit `8040b81`.

**What happens:** with the Blink runtime feature `AIPromptAPIToolUse` off, `LanguageModel.create()` with `expectedInputs` containing `tool-response` and `expectedOutputs` containing `tool-call` rejects with "The device is unable to create a session to run the model. Please check the result of availability() first." `LanguageModel.availability()` with the same options returns `available`.

**Why (source, measured in 09):**
- `LanguageModel::ExecuteAvailability` always sends an empty `tools` vector to the browser (`third_party/blink/renderer/modules/ai/language_model.cc`, L659-L686, L674).
- `AIManager::CanCreateLanguageModel` runs its only tool gate, `!base::FeatureList::IsEnabled(kAIPromptAPIToolUse)`, only when `options->tools` is non-empty (`chrome/browser/ai/ai_manager.cc`, L774-L783), so `availability()` never reaches it. `GetExpectedInputCapabilities` skips `kToolCall`/`kToolResponse` (L244-L268).
- In the spec, `availability()` and `create()` share "compute language model options availability" (`index.bs` L415-L445), which adds a content-type availability for every expected input and output type (L463-L471), and `create()` fails only when that availability is `unavailable` (L322-L324). So the two are meant to agree; 09 reads this as a conformance bug against the spec, not a spec gap.

**Reproduction** in Chrome 156 with `AIPromptAPIToolUse` off and the model available:

```js
const opts = { expectedInputs: [{ type: 'text' }, { type: 'tool-response' }], expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }] };
await LanguageModel.availability(opts); // 'available'
await LanguageModel.create(opts);       // rejects: "The device is unable to create a session to run the model. ..."
```

The snippet restates the probe matrix in 05; it was not run in this exact form (inferred).

**Expected:** `availability()` returns `unavailable` for the tool types when `create()` would refuse them.

**Existing reports:** 09 found none. The Chromium tracker's search needs sign-in, and web search with `site:issues.chromium.org` had no hits. crbug 422803232 ("Implement function calling support in chromium") is related: its TODO in `ModelClient` says per-model tool capability is not implemented yet. Check the tracker again before filing.

**Evidence:** the source links in `research/09-nano-tool-session-error.md` Q3 and Q5 are public and self-contained.

## 5. Chromium (on-device model, Gemma 4): a camelCase tool name crashes the model process on the first prompt

Status: draft, not filed. Found 2026-10-12 in spike S1 phase 2 (`research/11-spike-s1-extension-contexts.md`, "Finding: camelCase tool names crash Gemma 4's model process").

**Versions:** Chrome Beta 156.0.8078.17 on Windows 11 arm64, model `gemma4-2b-it` (GPU low tier), launched with `AIPromptAPIToolUse`, `OnDeviceModelConversationBackend`, `AIApiFoundationalModel:model_version/v4` and `OptimizationGuideManifestBroker` (00, "Per-model instances").

**What happens:** a tool session whose tool is named `getComponentCount` (one required parameter) fails on the first `prompt()` with `UnknownError: An unknown error occurred: kErrorUnknown`. The identical tool named `get_component_count` returns a tool call and a correct answer. Each failure counts as a model-process crash: after three in a row, `availability()` reads `unavailable` and `create()` throws `NotSupportedError: The model process crashed too many times for this version.` for at least a minute (crash limit and backoff in `on_device_model_access_controller.cc` and `optimization_guide_features.h`, read at tag 156.0.8078.17, 11).

**Reproduction** in a page tab on the Gemma 4 instance (measured as a controlled pair):

```js
const tool = (name) => ({ name, description: 'Returns the number of Angular components on the page.', inputSchema: { type: 'object', properties: { scope: { type: 'string' } }, required: ['scope'] } });
const opts = (name) => ({ tools: [tool(name)], expectedInputs: [{ type: 'text' }, { type: 'tool-response' }], expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }] });
await (await LanguageModel.create(opts('get_component_count'))).prompt('How many components are on the page?'); // returns a tool-call part
await (await LanguageModel.create(opts('getComponentCount'))).prompt('How many components are on the page?');   // UnknownError: kErrorUnknown
```

The snippet restates the measured pair in its shape; the description and question text are paraphrased from the probe, not copied (inferred).

**Not separated:** the rename changes case and underscores together, so whether case alone or the missing underscores trigger the crash is not known (11). The controlled test (`spikes/probes/tool-name-matrix.js`, spike S11) has not run. Run it before filing so the report names the trigger.

**Expected:** any valid tool name either works or is rejected with a clear error at `create()`; a tool name never crashes the model process or counts toward disabling the model.

**Existing reports:** not searched (unchecked).

**Evidence:** `research/s1-results/chrome-gemma4-tool-name-pair.json` (the pair) and `research/s1-results/chrome-gemma4-crash-doctor.json` (the disabled state). (For Lars only: these are local paths; in the filed issue, describe the runs in words.)
