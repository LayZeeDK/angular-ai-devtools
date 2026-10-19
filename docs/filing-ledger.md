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

## 5. Chromium (on-device model, Gemma 4): a tool name with an uppercase letter fails with `kErrorUnknown`, a model-process crash for camelCase

Status: draft, not filed. Found 2026-10-12 in spike S1 phase 2 (`research/11-spike-s1-extension-contexts.md`, "Finding: camelCase tool names crash Gemma 4's model process").

**Versions:** Chrome Beta 156.0.8078.17 on Windows 11 arm64, model `gemma4-2b-it` (GPU low tier), launched with `AIPromptAPIToolUse`, `OnDeviceModelConversationBackend`, `AIApiFoundationalModel:model_version/v4` and `OptimizationGuideManifestBroker` (00, "Per-model instances").

**What happens:** a tool session whose tool name contains an uppercase letter (`getComponentCount` or `Get_component_count`, one required parameter) fails on the first `prompt()` with `UnknownError: An unknown error occurred: kErrorUnknown`. The identical tool named `get_component_count` or `getcomponentcount` returns a tool call. For camelCase the failure was measured to be a model-process crash (11); that the `Get_component_count` failure was a crash too is inferred (same error on the same instance). Each such crash counts toward Chrome's limit: after three in a row, `availability()` reads `unavailable` and `create()` throws `NotSupportedError: The model process crashed too many times for this version.` for at least a minute (crash limit and backoff in `on_device_model_access_controller.cc` and `optimization_guide_features.h`, read at tag 156.0.8078.17, 11).

**Reproduction** in a page tab on the Gemma 4 instance, one fresh session per variant, run 70 s apart so Chrome's crash backoff cannot affect a later variant (the S11 matrix, `spikes/probes/tool-name-matrix.js`, run 2026-10-12):

```js
const withParam = { type: 'object', properties: { scope: { type: 'string', enum: ['page'] } }, required: ['scope'] };
const noParam = { type: 'object', properties: {} };
const run = async (name, inputSchema) => (await LanguageModel.create({
  expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
  tools: [{ name, description: 'Returns how many Angular components are on the page.', inputSchema }],
})).prompt('How many Angular components are on the page? Use the tool.');
await run('get_component_count', withParam); // tool call get_component_count({"scope":"page"})
await run('get_component_count', noParam);   // tool call get_component_count({})
await run('getComponentCount', withParam);   // UnknownError: An unknown error occurred: kErrorUnknown
await run('getcomponentcount', withParam);   // tool call getcomponentcount({"scope":"page"})
await run('Get_component_count', withParam); // UnknownError: An unknown error occurred: kErrorUnknown
```

The snippet restates the matrix's calls; the script adds the 70 s wait, a 120 s timeout and `destroy()` per session.

**Trigger:** an uppercase letter in the tool name fails, at the start (`Get_component_count`) or inside (`getComponentCount`); missing underscores and an empty `properties` schema do not **[measured, n=1 per variant; inferred that it generalises]**. Earlier, a controlled pair (`get_component_count` against `getComponentCount`) showed the same split (11). A doctor run right after the matrix passed every canary, so two crashes alone did not disable the model, as Chrome's count predicts **[measured]**. Not run: other models, the CPU backend, names with digits or other punctuation.

**Expected:** any valid tool name either works or is rejected with a clear error at `create()`; a tool name never crashes the model process or counts toward disabling the model.

**Existing reports:** not searched (unchecked).

**Evidence:** `research/raw/tool-name-matrix-gemma4-gpu.json` (the five-variant matrix), `research/s1-results/chrome-gemma4-tool-name-pair.json` (the earlier pair) and `research/s1-results/chrome-gemma4-crash-doctor.json` (the disabled state). (For Lars only: these are local paths; in the filed issue, describe the runs in words.)

## 6. openng-org/optimus-ui: `pTextarea` throws under Signal Forms `[formField]` because it subscribes to `NgControl.valueChanges`

Status: draft, not filed. Found 2026-10-12 while migrating the Insurance Portal's forms to Signal Forms.

**Versions:** `@openng/optimus-ui` 2.0.2, `@angular/forms` 22.2.2 (`@angular/forms/signals`), Windows 11 arm64, Chromium via playwright-cli.

**What happens:** `Textarea.onInit` (`fesm2022/openng-optimus-ui-textarea.mjs`) runs `this.ngControl.valueChanges.subscribe(...)` whenever an `NgControl` is injected on its host. The Signal Forms `FormField` directive provides `NgControl` as an `InteropNgControl`, which implements `value`, `valid`, `errors`, `dirty` and similar getters but has no `valueChanges` (`packages/forms/signals/src/controls/interop_ng_control.ts` on 22.2.x). The page logs `TypeError: Cannot read properties of undefined (reading 'subscribe') at Textarea.onInit` and the textarea never initializes. `pInputText` only reads `ngControl?.value` and works.

**Reproduction:**

```ts
import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { TextareaModule } from '@openng/optimus-ui/textarea';

@Component({
  imports: [FormField, TextareaModule],
  template: `<textarea pTextarea [formField]="f.text"></textarea>`,
})
export class Repro {
  readonly f = form(signal({ text: '' }), (p) => required(p.text));
}
```

**Expected:** `pTextarea` works under `[formField]`, for example by guarding the subscription (`this.ngControl.valueChanges?.subscribe`) or by updating its state from the `input` event alone.

**Existing reports:** not searched (unchecked).

**Evidence:** measured in the portal; the console log is in `tmp/control-angular-dev-app/portal-4775-2026-10-12T07-18-44-815Z/` (gitignored). (For Lars only: local path; in the filed issue, use the snippet.)

## 7. openng-org/optimus-ui (and possibly angular/angular): `BaseInput` controls fail the `[formField]` type-check and turn red before they are touched

Status: draft, not filed. Found 2026-10-12 while migrating the Insurance Portal's forms to Signal Forms.

**Versions:** `@openng/optimus-ui` 2.0.2, `@angular/forms` and `@angular/compiler-cli` 22.2.2, strict templates.

**What happens, part 1 (types):** `BaseInput`, which `Select` and `DatePicker` extend, declares inputs `pattern: string | null | undefined` and `min`, `max: number | null | undefined`. For a `[formField]` host, the template type-checker binds the field's `pattern()` (`readonly RegExp[]`) and `min()`/`max()` (`NonNullable<TValue> | undefined`) to inputs of those names (`expandBoundAttributesForField` in `packages/compiler/src/typecheck/ops/signal_forms.ts`). `<p-select [formField]="f.choice" />` and `<p-datepicker [formField]="f.date" />` therefore fail with `TS2322: Type 'readonly RegExp[]' is not assignable to type 'string'` and `Type 'Date | undefined' is not assignable to type 'number | null | undefined'`, whatever the field's value type. The portal works around it with `[formField]="$any(f.choice)"`.

**What happens, part 2 (styling):** at runtime `FormField` writes every name in `CONTROL_BINDING_NAMES`, including `invalid`, to matching directive inputs (`cvaControlCreate` in `packages/forms/signals/src/directive/control_cva.ts`). Optimus maps its `invalid` input to the `p-invalid` class, which Aura styles with the invalid border colour. A required control is red on first render. Under reactive forms the theme rule was `.ng-invalid.ng-dirty`, so it turned red only after the user changed it.

**Expected:** a control library written for `ControlValueAccessor` either works with Signal Forms' metadata bindings (types that accept them, or inputs named differently) or documents the combination; Angular could also skip metadata bindings whose types do not match on CVA hosts, where no value type is checked anyway. Which project should change is a judgement call (inferred).

**Existing reports:** not searched (unchecked).

**Evidence:** build output and screenshot `claim-01-empty.png` in `tmp/control-angular-dev-app/portal-4775-2026-10-12T07-18-44-815Z/` (gitignored); the portal commits `754aa1e`, `66e8ad6`, `92053b9` on `claude/ai-devtools-spike` carry the `$any` workaround. (For Lars only: local paths; in the filed issue, describe them in words.)

## 8. angular/angular: the WebMCP `Annotations` interface lacks the spec's `debugging` hint

Status: draft, not filed. Found 2026-10-12 in the prior-art survey (`research/14-ai-devtools-prior-art.md`, sections 3.1 and 6).

**What happens:** the WebMCP spec draft (`webmachinelearning/webmcp` `index.bs` at `d0e4e0e`) defines `ToolAnnotations` with `readOnlyHint`, `untrustedContentHint`, `consequentialHint` and `debugging`, all defaulting to `false`. Angular 22.2's WebMCP `Annotations` interface has no `debugging` member, so an Angular app cannot mark a tool as a debugging tool through Angular's API **[measured in both sources, research/14 section 3.1]**.

**Expected:** Angular's `Annotations` mirrors the spec's `ToolAnnotations`, or documents why `debugging` is left out.

**Evidence:** research/14 section 3.1 (spec IDL and Angular source lines). Re-check both at their current heads before filing.

## 9. Chrome developer docs: the WebMCP secure-tools page cites `requestUserInteraction()`, which the spec draft does not contain

Status: draft, not filed. Found 2026-10-12 (`research/14`, sections 3.1 and 6).

**What happens:** Chrome's WebMCP secure-tools page says the spec draft has `requestUserInteraction()` on a `ModelContextClient`. `index.bs` at `d0e4e0e` contains neither name **[measured for `index.bs`; the Chrome page is documented, read through a fetch]**.

**Expected:** the page and the spec draft agree, or the page says the API is proposed, not specified.

**Evidence:** research/14 section 3.1. Re-check the page and the spec's current head before filing; the spec may have moved.

## 10. microsoft/playwright-mcp: the README omits `browser_webmcp_list` and `browser_webmcp_call`

Status: draft, not filed. Found 2026-10-12 (`research/14`, sections 1.18 and 6).

**What happens:** Playwright's source defines `browser_webmcp_list` and `browser_webmcp_call` (capability `core`, on by default, turned off with `--no-webmcp`), and every snapshot response lists the page's WebMCP tools. The Playwright MCP README's tool list does not include them **[measured for the source; documented for the README]**.

**Expected:** the README lists both tools and the `--no-webmcp` flag.

**Evidence:** research/14 section 1.18 (`webmcp.ts` strings). Re-check the README at its current head before filing.

## 11. Chromium (Blink>AI): `LanguageDetector.availability()` or `Translator.availability()` in a dedicated worker crashes the renderer

Status: draft, not filed. Found 2026-10-19 in the no-flags worker spike (`research/20-built-in-ai-without-flags.md`, Workers; raw results in `research/raw/20-built-in-ai-without-flags.json`, `workers`).

**Versions:** Chrome 156.0.8078.35 and Chrome Beta 157.0.8103.6 (Gemini Nano, Gemma 4), Edge 155.0.4283.62 and Edge Dev 157.0.4329.0, Windows 11 arm64. MV3 extension, unpacked.

**What happens:** a dedicated worker started from an extension page (the DevTools panel, or a `chrome-extension://` tab) calls `LanguageDetector.availability()` or `Translator.availability({ sourceLanguage: 'en', targetLanguage: 'da' })`. The promise never settles, the extension renderer crashes (the panel shows the sad-face frame, and the profile's `Crashpad/reports` gains one report per call), and every frame and worker of that renderer stops answering CDP. Measured in all five browser-model pairs without feature flags, and with the AI flags on in Chrome Beta and Edge 155. In the same worker, `availability()` of `LanguageModel`, `Summarizer`, `Writer`, `Rewriter` and `Proofreader` answers in under 20 ms, and the same two calls in the page or the panel window answer normally.

**Reproduction** (extension page script; `w.js` is in the extension):

```js
// w.js
onmessage = async () => postMessage(await LanguageDetector.availability());
// extension page
const w = new Worker('/w.js');
w.onmessage = (e) => console.log(e.data);
w.postMessage('go'); // no reply; the renderer crashes
```

The minimal snippet restates the spike's worker file without the other probes; it was not run in this exact form (inferred).

**Expected:** a value from `availability()`, or `undefined` globals when the APIs are not exposed in workers. A crash in any case is a bug.

**Not checked:** a worker started by a web page (not an extension), and the crash stacks: the Crashpad reports are minidumps in the instance profiles and were not symbolized. Check the tracker for an existing report before filing.
