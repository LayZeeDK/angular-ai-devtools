# 02 - Angular 22.2 debugging surface

Sources: local clone `D:\projects\github\angular\angular` on branch `22.2.x` (CHANGELOG top entry is `22.2.0 (2026-09-23)`, `CHANGELOG.md:1-2`). Paths below are relative to that root unless they start with `angular-cli/`, which means `D:\projects\github\angular\angular-cli` (branch `22.0.x`, see section 4.6).

Every claim cites `file:line`. Claims marked **(inferred)** are reasoning from the cited code, not something the code states or a test exercises.

Tier definitions used throughout:

- **Tier 0** - public, non-`ɵ` name on the `ng` global (or another standard browser channel), available in any dev-mode app with no app change.
- **Tier 1** - `ɵ`-prefixed (or otherwise internal) but already present on the page in dev mode with no app change. Version-fragile.
- **Tier 2** - exists in `@angular/*` but is NOT reachable from the page without the app re-exporting it to `globalThis` (or opting in with a provider/call).

---

## 1. The `ng` global inventory at 22.2

### 1.1 How `ng` gets populated

- `ng` is the expando key `GLOBAL_PUBLISH_EXPANDO_KEY = 'ng'` (`packages/core/src/render3/util/global_utils.ts:69`). `publishUtil` does `w.ng ??= {}; w.ng[name] = fn` on the `global` object (`global_utils.ts:230-241`), skipped only under Closure `COMPILED` (`global_utils.ts:231-235`).
- `publishDefaultGlobalUtils()` publishes the `externalCoreGlobalUtils` map and the `internalCoreGlobalUtils` map (`global_utils.ts:180-197`). It first calls `setupFrameworkInjectorProfiler()` in browsers (`global_utils.ts:184-187`), which is what records the DI data that `ɵgetInjectorProviders` / `ɵgetDependenciesFromInjectable` later return (`packages/core/src/render3/debug/framework_injector_profiler.ts:107-110`).
- The application-level wrapper only calls it when `ngDevMode` is truthy: `ngDevMode && _publishDefaultGlobalUtils()` (`packages/core/src/application/application_ref.ts:66-68`).
- It is called from `createPlatform` (`packages/core/src/platform/platform.ts:46`) and `createOrReusePlatformInjector` (`platform.ts:177`), i.e. on every bootstrap path (NgModule and standalone). Both call sites also run `registerAiTools()` in dev mode (`platform.ts:48-50`, `platform.ts:178-180`) - see 1.5.
- Router adds three more entries only from `provideRouter()` in dev mode (`packages/router/src/provide_router.ts:108-113`) via `ɵpublishNonCoreGlobalUtil` (exported at `packages/core/src/core.ts:118`). `RouterModule.forRoot` builds its providers directly from `ROUTER_PROVIDERS` and does not call `provideRouter` or publish anything (`packages/router/src/router_module.ts:127-157`; an `rg` for `publishNonCoreGlobalUtil` across `packages/router/src` hits only `provide_router.ts`). So **NgModule apps using `RouterModule.forRoot` get no router globals** - Angular DevTools then hides its Router Tree tab (section 2).
- `ngDevMode` itself: dev mode is "ngDevMode not undefined and truthy" (`packages/core/src/util/is_dev_mode.ts:20-22`); production builds set it to `false` (`is_dev_mode.ts:38-44`), and a URL containing `ngDevMode=false` also forces it off (`packages/core/src/util/ng_dev_mode.ts:50-52`).

The TypeScript contract lives in three interfaces: `ExternalCoreGlobalUtils` ("any functions which have *ever* been in this set exist in long-lived public Angular versions which DevTools needs to support", `global_utils.ts:99-136`), `InternalCoreGlobalUtils` (the "beta channel" for DevTools, freely breakable, `global_utils.ts:78-97`) and `NonCoreGlobalUtils` (router, `global_utils.ts:72-76`). The union is exported as `FrameworkAgnosticGlobalUtils` (`global_utils.ts:215-217`), which Angular DevTools imports as `ɵFrameworkAgnosticGlobalUtils` (`devtools/projects/ng-devtools-backend/src/lib/shared/ng-debug-api/ng-debug-api.ts:9`).

### 1.2 Inventory table

| Name on `ng` | Signature | Returns / behavior | Tier | Source |
|---|---|---|---|---|
| `getComponent` | `<T>(element: Element) => T \| null` | Component instance whose host is `element`, else `null`. `@publicApi`. | 0 | `discovery_utils.ts:57-71` |
| `getContext` | `<T>(element: Element) => T \| null` | Embedded-view context (e.g. `@for` item context) or owning component. | 0 | `discovery_utils.ts:84-89` |
| `getOwningComponent` | `<T>(elementOrDir: Element \| {}) => T \| null` | Component whose view contains the node; walks up embedded views. | 0 | `discovery_utils.ts:105-115` |
| `getRootComponents` | `(elementOrDir: Element \| {}) => {}[]` | Bootstrapped root component(s) for the node. | 0 | `discovery_utils.ts:127-130` |
| `getInjector` | `(elementOrDir: Element \| {}) => Injector` | A `NodeInjector` for the element/directive; `Injector.NULL` if not Angular. | 0 | `discovery_utils.ts:141-148` |
| `getDirectives` | `(node: Node) => {}[]` | Directive instances on the node (component excluded); copy of internal array. | 0 | `discovery_utils.ts:202-226` |
| `getDirectiveMetadata` | `(instance: any) => AngularComponentDebugMetadata \| AngularDirectiveDebugMetadata \| null` | `{inputs, outputs}` plus `encapsulation`, `changeDetection` for components. Typed union also covers ACX and Wiz frameworks. | 0 | `discovery_utils.ts:229-342` |
| `getHostElement` | `(componentOrDirective: {}) => Element` | Host element. | 0 | `discovery_utils.ts:369-371` |
| `getListeners` | `(element: Element) => Listener[]` | `{name, element, callback, useCapture, type: 'dom' \| 'output'}`; template and host listeners only, not raw `addEventListener`. | 0 | `discovery_utils.ts:392-470` |
| `applyChanges` | `(component: {}) => void` | Marks the view dirty (`NotificationSource.DebugApplyChanges`) and runs synchronous CD from each root. | 0 | `change_detection_utils.ts:26-43` |
| `isSignal` | `(value: unknown) => value is Signal<unknown>` | Signal brand check. | 0 | `global_utils.ts:15,134,168` |
| `enableProfiling` | `() => () => void` | Routes Angular profiler + DI profiler events to the Chrome Performance panel (custom tracks). `@publicApi v21.0`. No-op outside dev mode. | 0 | `render3/debug/chrome_dev_tools_performance.ts:364-387` |
| `toggleWatchSignal` | `(id: string) => void` | Toggles a debug watcher that logs whenever the signal node with that graph id updates. Ids come from `ɵgetSignalGraph`. No `ɵ` prefix, but declared in `InternalCoreGlobalUtils` ("beta channel", breakable without notice). | 1 (internal, unprefixed) | `global_utils.ts:78-97,138-140`; `signal_debug.ts:300-340` |
| `ɵgetSignalGraph` | `(injector: Injector) => DebugSignalGraph` | `{nodes: {kind, id, epoch, label?, value?, debuggableFn?, watched?}[], edges: {consumer, producer}[]}`. For a `NodeInjector` it starts from the template consumer plus effects on that injector; also accepts an `R3Injector` (effects only). | 1 | `signal_debug.ts:270-298`; types `packages/core/primitives/devtools/src/debug_signal_graph.ts:68-96` |
| `ɵgetInjectorResolutionPath` | `(injector: Injector) => Injector[]` | Element-injector chain then environment-injector chain, i.e. the DI lookup path. | 1 | `injector_discovery_utils.ts:542-616` |
| `ɵgetInjectorMetadata` | `(injector) => {type:'element', source: Element} \| {type:'environment', source: string \| null} \| {type:'null', source:null} \| null` | Kind and source of an injector. | 1 | `injector_discovery_utils.ts:502-540` |
| `ɵgetInjectorProviders` | `(injector: Injector) => ProviderRecord[]` | `{token, isViewProvider, provider, importPath?}` per provider; throws for other injector types. | 1 | `injector_discovery_utils.ts:485-500`; `ProviderRecord` at `render3/debug/injector_profiler.ts:129-149` |
| `ɵgetDependenciesFromInjectable` | `<T>(injector, token) => {instance: T, dependencies: Omit<InjectedService,'injectedIn'>[]} \| undefined` | What a constructed token injected and where each dependency resolved. | 1 | `injector_discovery_utils.ts:44-139`; `InjectedService` at `injector_profiler.ts:165-` |
| `ɵsetProfiler` | `(profiler: Profiler \| null) => () => void` | Adds a callback `(event: ProfilerEvent, instance?, eventFn?) => void` invoked before/after templates, lifecycle hooks, outputs, CD, after-render, defer state changes, dynamic component creation, host bindings (26 events). Returns a remover. **Passing `null` clears ALL registered profilers**, including Angular DevTools' and `enableProfiling`'s. | 1 | `render3/profiler.ts:22-44`; events `primitives/devtools/src/profiler_types.ts:17-157` |
| `ɵgetControlFlowBlocks` | `(node: Node) => ControlFlowBlock[]` | `@defer` blocks (`state`, `incrementalHydrationState`, `@loading`/`@placeholder` timings, `hasErrorBlock`, stringified `triggers`, `rootNodes`) and `@for` blocks (`items`, `hasEmptyBlock`, `trackExpression`). **`@if` / `@switch` are not covered** - the enum has only `Defer` and `For`. | 1 | `control_flow.ts:48-60`; types `control_flow_types.ts:13-82` |
| `ɵgetTransferState` | `(injector: Injector) => Record<string, unknown>` | Parsed SSR transfer-state script for the app's `APP_ID`, internal hydration keys stripped. | 1 | `transfer_state_utils.ts:24-39` |
| `ɵgetComponentInstanceDeepLinkId` | `(instance: unknown) => number \| undefined` | Id used in `angular-devtools://` deep links from Performance-panel traces; `undefined` unless profiling is on and `window.__NG_DEVTOOLS_CONNECTED__` is set. | 1 | `chrome_dev_tools_performance.ts:60-121` |
| `ɵgetLoadedRoutes` | `(route: Route) => Route[] \| undefined` | `route._loadedRoutes` (lazy children). Only with `provideRouter`. | 1 | `packages/router/src/router_devtools.ts:13-18`; published `provide_router.ts:110` |
| `ɵgetRouterInstance` | `(injector: Injector) => Router \| null` | `injector.get(Router, null, {optional: true})`. Only with `provideRouter`. | 1 | `router_devtools.ts:20-25`; `provide_router.ts:111` |
| `ɵnavigateByUrl` | `(router: Router, url: string) => Promise<boolean>` | Guarded `router.navigateByUrl`. Only with `provideRouter`. | 1 | `router_devtools.ts:27-36`; `provide_router.ts:112` |
| `profiler` | `AngularProfiler` with `timeChangeDetection({record?})` | Exists only after the app calls `enableDebugTools(componentRef)` from `@angular/platform-browser`. | 2 (app opt-in) | `packages/platform-browser/src/browser/tools/tools.ts:15-42`; `common_tools.ts:22-62`; `exportNgVar` at `dom/util.ts:20-28` |
| `ɵcompilerFacade` | `CompilerFacade` | Present only when `@angular/compiler` (JIT) is loaded. Not a debugging API. | n/a | `packages/compiler/src/jit_compiler_facade.ts:1101`; read at `packages/core/src/compiler/compiler_facade.ts:23-27` |

Notes on the table:

- The 11 non-`ɵ` names in `ExternalCoreGlobalUtils` plus `enableProfiling` are documented `@publicApi` functions (e.g. `discovery_utils.ts:55`, `change_detection_utils.ts:24`, `chrome_dev_tools_performance.ts:370`). The `ɵ` entries carry an explicit warning: "considered *INTERNAL* ... might be changed in any release" (`global_utils.ts:143-147`). Counter-weight: the interface comment says anything ever in `ExternalCoreGlobalUtils` must stay supported by DevTools across versions (`global_utils.ts:99-104`), so in practice these are more stable than ordinary `ɵ` exports **(inferred)**.
- `getSignalGraph`'s docblock says it throws for environment injectors, but the code accepts `R3Injector` and only throws for other types (`signal_debug.ts:270-283`). Trust the code.
- Signal node `label` comes from the node's `debugName` (`signal_debug.ts:140-170`); see 5.3 for where debug names come from.

### 1.3 Needed by tooling but NOT on `ng` (Tier 2: app must re-export)

| Symbol | What it would give | Where it lives |
|---|---|---|
| `getInjectionTokens(element)` | DI tokens available at a node | `discovery_utils.ts:155` (not in `externalCoreGlobalUtils`, `global_utils.ts:142-171`) |
| `getLocalRefs(target)` | Template `#ref` map | `discovery_utils.ts:344` |
| `getRenderedText(component)` | Host `textContent` (trivial to replicate) | `discovery_utils.ts:383-386` |
| `getComponentLView(target)` | Raw `LView`; comment says "Don't export this method to `ng.*`" | `discovery_utils.ts:490-498` |
| `ɵgetLContext` | `LContext` for any node or instance | `packages/core/src/core_render3_private_export.ts:40` |
| `ɵgetDeferBlocks` | Defer-block internals | `packages/core/src/core_private_export.ts:58` |
| `getDebugNode(nativeNode)` | `DebugElement` (properties, listeners, `triggerEventHandler`) | `packages/core/src/debug/debug_node.ts:724` |
| `setInjectorProfiler` | Live DI events (inject, instance created, provider configured, effect created) | `render3/debug/injector_profiler.ts:234-246`; not published - only reachable indirectly through `enableProfiling` |
| Any `ApplicationRef` / `NgZone` / `Router` handle without an injector | App-level tick, stability, router events | Obtainable at Tier 1 via `ng.getInjector(rootEl).get(...)` only if the extension holds the class token, which a third-party bundle does not have **(inferred)** |

Practical consequence **(inferred)**: anything token-based (`injector.get(ApplicationRef)`) cannot be done from an extension, because the extension's copy of `@angular/core` classes are different identities from the app's. `ɵgetRouterInstance` exists precisely to do that lookup inside the app's own bundle (`router_devtools.ts:23-25`).

### 1.4 Debug surfaces outside the `ng` object

| Surface | What it is | Tier | Source |
|---|---|---|---|
| `[ng-version]` attribute | Set on every root component host; value is the framework version. DevTools and Angular's own AI DI tool locate roots with `querySelectorAll('[ng-version]')`. | 0 | `packages/core/src/render3/component_ref.ts:448-451`; `packages/core/src/debug/ai/di_graph.ts:57` |
| `__ngContext__` expando | Present on Angular-managed DOM nodes and instances; holds the `LView` index / `LContext`. | 1 (raw internal) | used by `devtools/.../tree-strategies/ltree.ts:84-86,159`; `shared-utils/src/lib/angular-check.ts:17-20` |
| `__ngDebugHydrationInfo__` expando | Dev-mode only, per hydrated node: `{status: 'hydrated' \| 'skipped'}` or `{status: 'mismatched', expectedNodeDetails, actualNodeDetails}`; mismatch info is attached to the nearest component host. | 1 | `packages/core/src/hydration/utils.ts:294-323,329-390` |
| `ngh` attribute | Still present on a node = not yet hydrated. | 1 | read at `devtools/.../tree-strategies/render-tree.ts:159-161` |
| `window.ngDevMode` counters | When dev mode is on, `ngDevMode` is an object with six hydration counters: `hydratedNodes`, `hydratedComponents`, `dehydratedViewsRemoved`, `dehydratedViewsCleanupRuns`, `componentsSkippedHydration`, `deferBlocksWithIncrementalHydration`. Nothing else. | 1 | `packages/core/src/util/ng_dev_mode.ts:26-60` |
| `performance.mark('mark_feature_usage', {detail: {feature}})` | Angular marks feature usage once per feature (e.g. `'NgZoneless'`, `'Chrome DevTools profiling'`). Readable with `performance.getEntriesByName('mark_feature_usage')` - a standard, non-Angular API. | 0 | `packages/core/src/util/performance.ts:19-25`; callers `zoneless_scheduling_impl.ts:370`, `chrome_dev_tools_performance.ts:376` |
| `window.__NG_DEVTOOLS_CONNECTED__` | Flag an extension sets (MAIN world, `document_start`) to make core emit `angular-devtools://` deep links in Performance traces. Read-side contract owned by core. | 1 | `chrome_dev_tools_performance.ts:72-83,109-121`; set by `devtools/projects/shell-browser/src/app/devtools-connected-flag.ts:9-20` |
| `getAngularTestability`, `getAllAngularTestabilities`, `getAllAngularRootElements`, `frameworkStabilizers` | Testability globals. Only installed when `BrowserModule` is imported or the app calls `provideProtractorTestingSupport()`. **Standalone `bootstrapApplication` does not install them**: it adds only `BROWSER_MODULE_PROVIDERS` (`browser.ts:166-169`), while `TESTABILITY_PROVIDERS` appear only in `provideProtractorTestingSupport` (`browser.ts:196-204`) and the `BrowserModule` decorator (`browser.ts:295-296`). | 0 when present; Tier 2 for standalone apps | `packages/platform-browser/src/browser/testability.ts:20-56` |
| `devtoolstooldiscovery` event | Angular's in-page AI tools (1.5). | 1 | `packages/core/src/debug/ai/registration.ts:21-38` |
| Profiler hook | `ng.ɵsetProfiler` (table above). | 1 | `render3/profiler.ts:34-44` |

### 1.5 Angular's own in-page AI debugging tools (new in 22.0)

This is the most relevant finding for an AI DevTools extension.

- In dev mode, every platform creation calls `registerAiTools()` (`platform.ts:48-50`, `platform.ts:178-180`); the platform's destroy path unregisters (`platform.ts:160`). Added in 22.0.0: "register AI runtime debugging tools" and "implement Angular DI graph in-page AI tool" (`CHANGELOG.md:842`, `CHANGELOG.md:941-945`).
- Mechanism: a `window` listener for the `devtoolstooldiscovery` event that calls `event.respondWith({name: 'Angular', tools: [diGraphTool, signalGraphTool]})` (`packages/core/src/debug/ai/registration.ts:21-38`). Types: `ToolDefinition {name, description, inputSchema, execute}`, `ToolGroup {name, tools}`, `DevtoolsToolDiscoveryEvent extends CustomEvent {respondWith(toolGroup)}`; the docblock says "Event dispatched by Chrome DevTools to discover tools in the page" (`packages/core/primitives/devtools/src/tool_definitions.ts:9-43`).
- Tools shipped:
  - `angular:di_graph` - no input. Finds roots via `[ng-version]`, walks every `LView` to build the element-injector tree (with providers and resolved values, plus `hostElement`) and the environment-injector tree (`packages/core/src/debug/ai/di_graph.ts:22-83`, serialization in `serialized_di_graph.ts`). Throws on unknown injector classes (`di_graph.ts:248-262`).
  - `angular:signal_graph` - input `{target: HTMLElement}` (schema uses `'x-mcp-type': 'HTMLElement'`), returns the `ɵgetSignalGraph` result with `id` and `debuggableFn` stripped (`packages/core/src/debug/ai/signal_graph.ts:14-81`).
- How an extension can use it without any `ɵ` name: the core spec shows the whole protocol - create `new CustomEvent('devtoolstooldiscovery')`, assign a `respondWith` function onto it, `window.dispatchEvent(event)`, and Angular calls `respondWith` synchronously with the tool group (`packages/core/test/debug/ai/registration_spec.ts:27-36`). The returned `execute` functions are then callable directly.
- Constraints **(inferred)**:
  - `respondWith` is an expando on the event object and `execute` returns live objects (DOM elements, values), so dispatch and `execute` must run in the page's MAIN world, not in an isolated content script. Same requirement Angular DevTools already meets for `devtools-connected-flag.ts` (`manifest.chrome.json` content script with `"world": "MAIN"`).
  - Results contain non-serializable values (`hostElement`, provider `value`, signal `value`), so the extension must serialize before crossing to the panel/service worker.
  - Tier: the event name and tool names are not `ɵ`-prefixed, but nothing marks them public API; treat as Tier 1.
- This channel is **not WebMCP**. WebMCP registration goes through `document.modelContext.registerTool` (`packages/core/src/webmcp/declare_tool.ts:38-46,82`) and is only used for app-authored tools (section 4.3). An `rg` for `modelContext` in `packages/` finds only `webmcp/declare_tool.ts` and `webmcp/types.ts` - Angular registers no debugging tools through WebMCP.

---

## 2. What Angular DevTools actually calls (the proven-working subset)

Angular DevTools' page-side code lives in `devtools/projects/ng-devtools-backend/src/lib`. All `ng` access goes through `ngDebugClient()`, which returns `window.ng` as `Partial<GlobalUtils>` and throws a "not in development mode" error if absent (`shared/ng-debug-api/ng-debug-api.ts:14-22`). Every API is feature-detected with `typeof ng[api] === 'function'` (`ng-debug-api.ts:24-30`), which is how one backend supports Angular 12+ (`devtools/projects/shared-utils/src/lib/angular-check.ts:26-33`).

### 2.1 `ng.*` functions called

| `ng` function | Used for | Call site(s) under `ng-devtools-backend/src/lib/` |
|---|---|---|
| `getComponent` | Tree building, Wiz/ACX detection, element lookup | `directive-forest/component-tree/component-tree.ts:119,677,846`; `directive-forest/tree-strategies/render-tree.ts:76,193`; `shared/ng-debug-api/ng-debug-api.ts:61-66,101-106` |
| `getDirectives` | Directives per node | `component-tree.ts:124,850`; `render-tree.ts:49,194` |
| `getDirectiveMetadata` | Inputs/outputs/CD strategy/framework | `component-tree.ts:232`; `render-tree.ts:81,195`; `ng-debug-api.ts:66,106` |
| `getOwningComponent` | Pick component to re-render after editing a directive | `component-tree.ts:760` |
| `getInjector` | Injector for a node | `component-tree.ts:106` |
| `getHostElement` | CD highlight overlay | `profiling/cd-analyzer/highlighting.ts:52` |
| `applyChanges` | Re-render after property edit | `component-tree.ts:760,767` |
| `isSignal` | Unwrap signals in state view | `shared/utils/general.ts:45` |
| `ɵgetInjectorResolutionPath` | Injector tree / resolution path | `component-tree.ts:97-101` |
| `ɵgetInjectorMetadata` | Injector kind/source | `component-tree.ts:91-92` |
| `ɵgetInjectorProviders` | Providers panel | `component-tree.ts:327` |
| `ɵgetDependenciesFromInjectable` | Injected-services panel | `component-tree.ts:336-340` |
| `ɵgetSignalGraph` | Signal graph pane | `client-event-subscribers.ts:311,667` |
| `toggleWatchSignal` | Watch a signal from the graph | `client-event-subscribers.ts:684-686` |
| `ɵgetControlFlowBlocks` | `@defer` / `@for` nodes in the tree | `render-tree.ts:189` |
| `ɵgetTransferState` | Transfer State tab | `client-event-subscribers.ts:629` |
| `ɵsetProfiler` | Native profiler strategy | `profiling/profiler/index.ts:25`; `profiling/profiler/native.ts:39-40` |
| `ɵgetComponentInstanceDeepLinkId` | Map Performance-panel deep links to tree nodes | `client-event-subscribers.ts:464` |
| `ɵgetRouterInstance`, `ɵgetLoadedRoutes`, `ɵnavigateByUrl` | Router Tree tab and "navigate" | `client-event-subscribers.ts:214,445`; `router-tree/router-tree.ts:113` |
| `getComponentForest` (non-Angular frameworks only) | Wiz/ACX tree via the same global | `component-tree.ts:689-690` |

Not called by DevTools, though published: `getContext`, `getListeners`, `getRootComponents`, `enableProfiling` (an `rg` over all of `devtools/projects`, excluding specs, for `enableProfiling|getListeners|getContext|getRootComponents` returns no hits). `getListeners` in particular is an unused Tier 0 capability an AI extension could add **(inferred)**.

Feature gating from the same checks (`shared/ng-debug-api/ng-debug-api.ts:32-111`, aggregated in `supported-apis.ts:24-40`):
- DI tab needs `getInjector` + the four `ɵ` injector functions (`ng-debug-api.ts:33-52`).
- Router needs all three router globals (`ng-debug-api.ts:72-79`) - absent for `RouterModule.forRoot` apps (1.1).
- Profiler is disabled when any root is a Wiz app (`ng-debug-api.ts:55-69`).
- Detection: Angular present = `[ng-version]` exists (`angular-check.ts:22-24,54-60`); dev mode = `typeof ng === 'object'` with `getComponent` or `probe` (`angular-check.ts:13-15,47-52`); hydration = any root has `__ngDebugHydrationInfo__` (`angular-check.ts:62-66`). Handshake emits `ngAvailability {version, devMode, ivy, hydration, supportedApis}` (`client-event-subscribers.ts:364-387`).

### 2.2 What DevTools reaches beyond `ng`

| Internal | Why | Source |
|---|---|---|
| `__ngContext__` + raw `LView`/`TView` indexing (`LTreeStrategy`) | Fallback tree builder when `getComponent`/`getDirectiveMetadata` are missing (old versions). The `ng`-based `RTreeStrategy` is tried first. | `directive-forest/tree-strategies/ltree.ts:50,83-86,159`; order at `tree-strategies/index.ts:13-15`; `render-tree.ts:181-185` |
| `constructor.ɵcmp` / `constructor.ɵdir` | Read component/directive defs directly (property metadata) | `component-tree.ts:276` |
| `ɵcmp` monkey-patching (`PatchingProfiler`) | Profiler fallback when `ɵsetProfiler` is absent | `profiling/profiler/polyfill.ts:30`; selection `profiling/profiler/index.ts:24-29` |
| `route._loadedRoutes`, `router.config`, `router.routerState.root` | Route tree parsing | `router-tree/router-tree.ts:66,76,288-289` |
| `__ngDebugHydrationInfo__`, `ngh` | Hydration status per node | `render-tree.ts:154-179` |
| `Zone.current` | Run backend work outside the Angular zone for zone apps | `shared/utils/general.ts:13-21`; `profiling/capture.ts:374` |
| `ɵProfilerEvent` enum import | Event switch for the profiler | `profiling/profiler/native.ts:9,71-250` |
| `__ngSimpleChanges__` ignore list | Skip internal props when serializing | `shared/state-serializer/state-serializer.ts:23-25` |
| `chrome.debugger` (CDP 1.3) | Signal "breakpoints": sets a breakpoint on a signal node's `debuggableFn` location | `devtools/projects/shell-browser/src/app/breakpoint_manager.ts:9-60,99-150,259`; `"debugger"` permission in `shell-browser/src/manifest/manifest.chrome.json` |
| `chrome.devtools.inspectedWindow.eval` + `inspectedApplication.*` helpers on `globalThis` | `inspect()` a constructor, DOM element, property or signal node in the Sources/Elements panels | `shell-browser/src/app/chrome-application-operations.ts:22-47,128-142`; helpers installed at `chrome-window-extensions.ts:21-69` |

Note that `debuggableFn` (the computation function) on signal graph nodes is what makes breakpoints and "view source" possible; Angular's own AI signal tool deliberately strips it (`packages/core/src/debug/ai/signal_graph.ts:14-17,77`). The 22.1.x line also added `debuggableFn` for non-computed nodes (`CHANGELOG.md:222`).

### 2.3 Extension mechanics (MV3, Chrome)

From `devtools/projects/shell-browser/src/manifest/manifest.chrome.json`: MV3, permissions `scripting`, `activeTab`, `storage`, `debugger`, host `<all_urls>`; a MAIN-world `document_start` script sets `__NG_DEVTOOLS_CONNECTED__`; an isolated `ng_validate` script and `content_script` run at `document_idle`; the backend bundle is a web-accessible resource injected as a `<script src>` (`shell-browser/src/app/content-script.ts:81-82`) so it runs in the page's MAIN world and can touch `window.ng`. Detection polls every second until the backend reports installed (`shell-browser/src/app/detect-angular.ts:27-62`).

---

## 3. Angular DevTools feature baseline

Tabs are `'Components' | 'Profiler' | 'Router Tree' | 'Injector Tree' | 'Transfer State'` (`devtools/projects/ng-devtools/src/lib/devtools-tabs/devtools-tabs.component.ts:40`), shown conditionally (`devtools-tabs.component.ts:91-109`): Profiler if `supportedApis.profiler`; Injector Tree if `supportedApis.dependencyInjection`; Router Tree if `supportedApis.routes` and routes are non-empty; Transfer State if hydration is detected. adev calls Transfer State experimental and undocumented (`adev/src/content/tools/devtools/overview.md:27`).

| Feature | What it does | Backed by | Evidence |
|---|---|---|---|
| Component explorer | Tree of components and directives, search, keyboard nav, comment nodes optional | `getComponent`, `getDirectives`, `getDirectiveMetadata` | `adev/src/content/tools/devtools/component.md:8-20`; settings `show_comment_nodes@components` (`ng-devtools/src/lib/application-providers/settings_versions.ts`, `SettingsDataV2`) |
| Property view and editing | Inputs, outputs, state; edit values incl. writable signals (`.set`), then `applyChanges` | `isSignal`, `applyChanges` | `component.md:33-40`; `ng-devtools-backend/src/lib/directive-forest/property-mutation/property-mutation.ts:79-104`; `component-tree.ts:745-770` |
| Navigate to host node / source | Selects host in Elements, constructor in Sources | `inspectedWindow.eval` + `inspect()` | `component.md:21-32`; `chrome-application-operations.ts:22-27` |
| `$ng0`/`$ng1` console refs | Last selected instances in console | backend `setConsoleReference` | `component.md:41-47`; `client-event-subscribers.ts:38` |
| Inspect element | Hover page to select component | backend `ComponentInspector` | `component.md:48-54`; `client-event-subscribers.ts:389-410` |
| `@defer` blocks in tree | Blocks, `@loading`/`@placeholder`/`@error`, triggers (defer, prefetch, hydrate), timings | `ɵgetControlFlowBlocks` | `component.md:56-62` |
| Hydration status + overlay | Per-component hydrated/skipped/mismatched, error messages, on-page overlay | `__ngDebugHydrationInfo__`, `ngh` | `component.md:64-76`; `client-event-subscribers.ts:48` (`loadHydrationOverlays`); setting `show_hydration_overlays@components` |
| Signal graph pane | Graph of signals/computed/effects for selected component; watch (log) a signal; set CDP breakpoints on a signal's computation; inspect nested signal values | `ɵgetSignalGraph`, `toggleWatchSignal`, `chrome.debugger` | protocol `getSignalGraph`, `toggleWatchSignal`, `getSignalNestedProperties` (`devtools/projects/protocol/src/lib/messages.ts:415-419,474`); `ng-devtools/src/lib/devtools-tabs/directive-explorer/signal-graph-pane/`; `breakpoint_manager.ts` |
| Profiler | Record CD cycles, per-component time, lifecycle hooks, outputs; bar chart, flame graph, tree map; OnPush debugging; import/export recordings | `ɵsetProfiler` (or patching fallback) | `adev/src/content/tools/devtools/profiler.md:18-71`; `profiling/profiler/native.ts` |
| CD highlighting | Flash components as they are checked; optional CD info in explorer | `getHostElement` + profiler | settings `highlight_change_detection@profiling`, `show_cd_in_explorer@components`; `profiling/cd-analyzer/highlighting.ts:52` |
| Performance-panel integration | Angular tracks in Chrome Performance panel, deep links back to DevTools | `enableProfiling`, `ɵgetComponentInstanceDeepLinkId` | setting `performance_track@profiling`; `CHANGELOG.md:399`; `chrome_dev_tools_performance.ts:60-121` |
| Injector Tree | Environment and element injector hierarchy, resolution path, providers per injector, log provider | four `ɵ` injector functions | `adev/src/content/tools/devtools/injectors.md:5-19`; protocol `getInjectorProviders`, `logProvider` (`messages.ts:449-455`) |
| Router Tree | Route tree with path, component, guards, resolvers, data, providers, title, lazy/active/aux flags; navigate to a route | three router `ɵ` globals + `router.config` | `adev/src/content/tools/devtools/router.md:1-30` |
| Transfer State | SSR transfer-state key/values | `ɵgetTransferState` | protocol `getTransferState`/`transferStateData` (`messages.ts:457-458`) |
| Multi-frame support | Pick iframe to inspect | content-script per frame | protocol `contentScriptConnected`, `enableFrameConnection` (`messages.ts:462-465`) |

Full message protocol (the complete set of backend operations) is the `Events` interface at `devtools/projects/protocol/src/lib/messages.ts:400-475`. There is no AI or natural-language feature in Angular DevTools: the `Tab` type and `Events` interface have none, and an `rg -i` over `devtools/projects` (specs excluded) for `gemini|llm|modelContext|devtoolstooldiscovery|openai|anthropic` returns no hits (checked).

---

## 4. Angular AI docs (`adev/src/content/ai/*.md`)

### 4.1 `overview.md` - "Build with AI"

- Positions Angular's templating and signal-based state as a fit for generated content (`overview.md:11-15`).
- Three recommended stacks: Genkit (server-side, model-agnostic, needs a Node server such as Angular SSR), Firebase AI Logic (client-side, secure, no key in bundle), Gemini API (direct) (`overview.md:23-72`).
- Best practices: never ship API keys in client files like `environments.ts`; use a proxy or secrets manager (`overview.md:76-86`); use tool calling with the developer in control of which functions are exposed (`overview.md:88-94`); design for non-determinism with prompt/temperature tuning, human-in-the-loop, schema constraints, graceful degradation and retry on provider outage (`overview.md:96-110`).

### 4.2 `design-patterns.md` - signals and `resource` for AI

- Keep raw input and submitted prompt in two signals; feed only the submitted one to `resource({params})` so the `loader` runs on submit, not per keystroke; read other signals (e.g. `sessionId`) inside the loader without re-triggering (`design-patterns.md:5-39`). Use `httpResource` when the SDK has no client helper (`design-patterns.md:15`).
- Type the resource to the structured LLM output; derive state with `computed` or `linkedSignal`; `linkedSignal`'s access to the previous value builds chat history / appended content (`design-patterns.md:41-64`).
- UX: scope the resource to the consuming component (fewer CD cycles, especially zoneless); SSR + incremental hydration with a placeholder; `isLoading()` for spinners; `reload()` for retry (`design-patterns.md:66-93`).
- Streaming: `resource({stream: async () => signal<ResourceStreamItem<T>>})`, updating the inner signal per chunk; template reads `isLoading()/hasValue()/value()/error()` (`design-patterns.md:95-137`); server side shown as a Genkit streaming flow (`design-patterns.md:139-177`).

Relevance **(inferred)**: AI-heavy apps will hold their interesting state in `resource`/`linkedSignal` nodes, which `ɵgetSignalGraph` exposes with `debugName` labels when compiled by ngtsc (5.3).

### 4.3 `webmcp.md` - WebMCP (detailed)

- What: an emerging standard letting a page expose structured tools to in-browser AI agents (`webmcp.md:3-5`). Angular support is **experimental**, APIs may change outside majors (`webmcp.md:7-9`).
- APIs Angular ships:
  - `provideExperimentalWebMcpTools(tools)` from `@angular/core` - app-level or route-level `EnvironmentProviders`; tools registered on environment init and unregistered when the injector is destroyed; `execute` runs in the injector's injection context so it can `inject()` (`webmcp.md:11-45`; implementation `packages/core/src/webmcp/provide_tools.ts:15-37`).
  - `inputSchema` is JSON Schema; parameter types are inferred from it (`required` removes `undefined`, `additionalProperties: false` narrows) (`webmcp.md:47-97`). Angular does not validate inputs at runtime; validate in `execute` (`webmcp.md:253-255`).
  - Route-scoped tools need `withAutoCleanupInjectors()` or they stay registered after navigation (`webmcp.md:99-137`). That router feature was stabilized in 22.2 (`CHANGELOG.md:40`).
  - `declareExperimentalWebMcpTool(tool, injector?)` - imperative, in any injection context, auto-unregisters on destroy; prefer root services (`webmcp.md:139-163`; `packages/core/src/webmcp/declare_tool.ts:15-92`).
  - Signal Forms: `provideExperimentalWebMcpForms()` from `@angular/forms/signals` plus `form(model, schema, {experimentalWebMcpTool: {name, description}})` generates a tool whose JSON schema is inferred from the model's initial value and `required` validators, connected to validation and the submission action so the agent sees errors; async validators are not run; needs concrete initial values and non-empty arrays (`webmcp.md:165-241`; `packages/forms/signals/src/webmcp/registration.ts:53,157`).
  - Name collisions throw; avoid registering in components rendered more than once (`webmcp.md:247-251`). Testing suggestion: `@mcp-b/webmcp-polyfill` (`webmcp.md:257-259`).
- How registration works in code: `declareExperimentalWebMcpTool` returns early during SSR, then looks up `document.modelContext ?? navigator.modelContext` and silently does nothing if `registerTool` is not a function (`declare_tool.ts:35-46`). It wraps `execute` to run in the injection context with an `AbortSignal` merged from the injector's destroy and the client's signal, and calls `modelContext.registerTool(wrappedTool, {signal})` (`declare_tool.ts:57-91`). The `ModelContext` interface has only `registerTool` (`packages/core/src/webmcp/types.ts:111-123`) - there is no list or call API on the Angular side.
- Types: `ToolDescriptor {name, description, inputSchema, execute, annotations?}`, `Execute(args, client: {signal})`, `Annotations {readOnlyHint?, untrustedContentHint?, consequentialHint?}` (`types.ts:22-108`). Annotations are `@experimental 22.2` (`types.ts:59-62`; `CHANGELOG.md:21`); implicit form tools hard-code `readOnlyHint` and `untrustedContentHint` in 22.2 (`CHANGELOG.md:29`).
- Version: `declareWebMcpTool`/`provideWebMcpTools` landed in 22.0.0 (`CHANGELOG.md:926,940` inside the 22.0.0 section starting `CHANGELOG.md:842`); 22.0.x patches added SSR disable, required descriptions, DOM-clobbering guard (`CHANGELOG.md:679,723,727`). Exported via `export * from './webmcp'` (`packages/core/src/core.ts:134`).
- Relevance to an extension **(inferred)**: because Angular only registers when `document.modelContext.registerTool` exists, an extension that installs its own `document.modelContext` shim in the MAIN world at `document_start` (before bootstrap) would receive every app-authored WebMCP tool, including the generated Signal Forms tools, and could call their `execute`. That gives the extension the app's own semantic actions without app changes - but only for apps that opted in to WebMCP. A shim would conflict with a native browser implementation if one is present.

### 4.4 `ai-tutor.md` - Angular AI Tutor

An interactive tutor delivered through the Angular CLI MCP server (`ai_tutor` tool), launched from an AI editor/CLI by prompting "launch the Angular AI tutor" in a new `ng new` project (`ai-tutor.md:7-15`). It teaches by building a "Smart Recipe Box": concept, example, exercise, then it reads project files to check the work; supports hints, step-by-step mode, experience levels 1-10, skipping and jumping topics, and resumes by analyzing the code (`ai-tutor.md:1-97`). Curriculum has five phases: fundamentals, state and signals, component architecture, advanced features, Signal Forms (`ai-tutor.md:139-181`). It is a coding-agent persona, not a runtime/browser feature.

### 4.5 `agent-skills.md` and `develop-with-ai.md`

- Agent Skills: two official skills, `angular-developer` (code generation and guidance across signals, forms, DI, routing, SSR, a11y, testing, CLI) and `angular-new-app`; installed with `npx skills add https://github.com/angular/skills` (`agent-skills.md:1-24`).
- Develop with AI: a `best-practices.md` system prompt (sourced from `packages/core/resources/best-practices.md`), per-IDE rules files (GEMINI.md, copilot-instructions, Cursor, AGENTS.md, Windsurf), a pointer to the CLI MCP server, and `llms.txt` / `llms-full.txt` (`develop-with-ai.md:1-45`).

None of these docs mention runtime inspection of a running app, the `ng` global, or the `devtoolstooldiscovery` tools **(checked: none of the seven files contains `ng.`, `devtoolstooldiscovery`, or `getSignalGraph`; inferred that this is a gap, not a hidden feature)**.

### 4.6 Angular CLI MCP server (complement, not overlap)

From `mcp-server-setup.md`: run `npx @angular/cli mcp` from the IDE's MCP config (`mcp-server-setup.md:9-61`); flags `--read-only` and `--local-only` (`mcp-server-setup.md:114-125`). Default tools (`mcp-server-setup.md:63-77`), confirmed in source on the local `angular-cli` clone (branch `22.0.x`, not 22.2 - the 22.2 list may differ):

| Tool | Read-only | Local-only | Source (`angular-cli/packages/angular/cli/src/commands/mcp/tools/`) |
|---|---|---|---|
| `ai_tutor` | yes | yes | `ai-tutor.ts:14,37-38` |
| `get_best_practices` | yes | yes | `best-practices.ts:38,56-57` |
| `search_documentation` | yes | no | `doc-search.ts:56,96-97` |
| `list_projects` | yes | yes | `projects.ts:121,141-142` |
| `onpush_zoneless_migration` | yes | yes | `onpush-zoneless-migration/zoneless-migration.ts:24,42-43` |
| `run_target` | no | yes | `run-target/run-target.ts:51,71-72` |
| `devserver.start` / `devserver.stop` / `devserver.wait_for_build` | yes | yes | `devserver/devserver-start.ts:96,122-123`, `devserver-stop.ts:57,72-73`, `devserver-wait-for-build.ts:99,119-120` |

All are stable (`angular-cli/packages/angular/cli/src/commands/mcp/mcp-server.ts:34-46`); `EXPERIMENTAL_TOOLS` is empty (`mcp-server.ts:48-52`). `isReadOnly`/`isLocalOnly` map to MCP `readOnlyHint` / `openWorldHint` annotations (`tools/tool-registry.ts:64-76`).

Gap **(inferred)**: every CLI MCP tool works on the workspace, build, docs or dev-server logs. None inspects the running page (component tree, signal values, DI, router state, CD timing). A browser extension that exposes the `ng` / `devtoolstooldiscovery` surface is the missing runtime half; the two could be paired (CLI MCP for code + build, extension for live state).

---

## 5. Angular 22.x dev-mode features relevant to tooling

### 5.1 In-page AI tools via `devtoolstooldiscovery`

See 1.5. The headline: Angular 22 already ships two AI-oriented runtime tools (`angular:di_graph`, `angular:signal_graph`) in every dev-mode app, discoverable by dispatching one DOM event. An AI DevTools extension can consume these first and fall back to `ng.*` for everything else.

### 5.2 Zoneless is the default

- Both bootstrap paths add `provideZonelessChangeDetectionInternal()` unconditionally (`packages/core/src/application/create_application.ts:65-70`; `packages/core/src/platform/platform_ref.ts:51-56`). Zone-based CD is opt-in through `provideZoneChangeDetection` (`packages/core/src/change_detection/scheduling/ng_zone_scheduling.ts:153`), which sets `ZONELESS_ENABLED` to `false` (`ng_zone_scheduling.ts:84-94`).
- `provideExperimentalZonelessChangeDetection` no longer exists in `packages/core/src` (`rg` returns nothing); the stable `provideZonelessChangeDetection` is `@publicApi 20.2` and warns in dev mode if Zone.js is still loaded (`zoneless_scheduling_impl.ts:360-388`).
- Tooling impact **(inferred)**: `window.Zone` presence is not a reliable "Angular CD" signal; detect mode with `performance.getEntriesByName('mark_feature_usage')` (`'NgZoneless'` mark, `zoneless_scheduling_impl.ts:370`) or by testing for `Zone`. (Superseded 2026-10-12, review round 7: the `NgZoneless` mark is set only inside the public `provideZonelessChangeDetection()`; `provideZonelessChangeDetectionInternal()`, which both bootstrap paths add, sets no mark (`zoneless_scheduling_impl.ts:390-395`) [measured in source]. So an app that is zoneless by default has no mark, and `typeof Zone` says only whether zone.js is loaded. The mode comes from the root environment injector's provider records instead: `NgZone` with `useClass: NoopNgZone` and the `Zoneless enabled` token with `useValue: true`, measured on the insurance portal, which loads zone.js (`spikes/probes/zone-mode.js`, `research/raw/zone-mode-portal.json`, commit `8e057fc`). See `docs/feature-proposals.md` 3.4, `app_facts`.) CD-trigger attribution should come from `ɵsetProfiler` events (`ChangeDetectionStart/End`, `ChangeDetectionSyncStart/End`, `profiler_types.ts:86-104`). `applyChanges` marks dirty with a dedicated `NotificationSource.DebugApplyChanges` (`change_detection_utils.ts:28`).
- `ChangeDetectionStrategy.Default` is deprecated in favor of `Eager` (`packages/core/src/change_detection/constants.ts:30-42`); `getDirectiveMetadata` already reports `Eager` (`discovery_utils.ts:323-325`).
- **Added by the orchestrator after a runtime check:** since 22.0, a component without a `changeDetection` property is **OnPush** ("Component with undefined `changeDetection` property are now `OnPush` by default", `CHANGELOG.md:859`; `render3/definition.ts:352` sets `onPush: changeDetection !== Eager`). Measured on `spikes/ng222-app`: `ng.getDirectiveMetadata(...)` returns `changeDetection: 0` (OnPush) for a component that declares none. So `Eager` now means the author opted out on purpose.

### 5.3 Signal debug names come from the compiler

- ngtsc runs `signalMetadataTransform` as a `before` transform (`packages/compiler-cli/src/ngtsc/core/src/compiler.ts:888`), inserting `debugName: '<property name>'` into calls of 13 functions: `signal`, `computed`, `linkedSignal`, `input`, `model`, `viewChild`, `viewChildren`, `contentChild`, `contentChildren`, `effect`, `afterRenderEffect`, `resource` (core) and `httpResource` (common) (`packages/compiler-cli/src/ngtsc/transform/src/implicit_signal_debug_name_transform.ts:224-238`). The inserted option is wrapped in `ngDevMode ? {...} : {}` so it disappears in production (`implicit_signal_debug_name_transform.ts:45-60`).
- Consequence **(inferred)**: graph `label`s are present only when the code was compiled by the Angular compiler (CLI builds do this); signals created in plain TS outside ngtsc-compiled files, or in third-party libraries compiled differently, may have no label.

### 5.4 Profiling, deep links and DI events

- `enableProfiling()` (public since 21.0) forwards both the render profiler and the DI injector profiler to Chrome's Performance panel (`chrome_dev_tools_performance.ts:364-387`). Deep links `angular-devtools://` appear only when `__NG_DEVTOOLS_CONNECTED__` is set before Angular runs (`chrome_dev_tools_performance.ts:72-83,109-121`; feature in `CHANGELOG.md:399`).
- Both profilers are multi-subscriber arrays (`render3/profiler.ts:11-44`; `injector_profiler.ts:210-246`), so an AI extension can add its own `ɵsetProfiler` callback alongside Angular DevTools. It must never call `ɵsetProfiler(null)`, which clears every subscriber (`render3/profiler.ts:40-42`).
- The DI event stream (`InjectorProfilerEventType.Inject`, `InstanceCreatedByInjector`, `ProviderConfigured`, `EffectCreated`, ... at `injector_profiler.ts:76-110`) is not on `ng`; only `enableProfiling` subscribes to it from outside core (Tier 2 for direct access).

### 5.5 Hydration debugging

- Per-node `__ngDebugHydrationInfo__` with mismatch details (`hydration/utils.ts:294-390`), the `ngh` attribute for not-yet-hydrated nodes, and the six `ngDevMode` hydration counters (`ng_dev_mode.ts:28-35`) are dev-mode only. `ɵgetControlFlowBlocks` reports `incrementalHydrationState` per `@defer` (`control_flow_types.ts:33-34`). `ɵgetTransferState` returns app keys with internal hydration keys removed (`transfer_state_utils.ts:24-39`).

### 5.6 Other 22.x items worth knowing

- 22.2 core adds programmatic `ErrorBoundary` APIs and the language service supports `@boundary` blocks (`CHANGELOG.md:18,33`). No debugging hook for boundaries appears in `global_utils.ts` or `control_flow_types.ts` (the `ControlFlowBlockType` enum is still `Defer | For`, `control_flow_types.ts:13-16`), so error-boundary state is not inspectable via `ng` at 22.2 **(inferred from absence)**.
- 22.2 router exposes router resources in public API and stabilizes `withAutoCleanupInjectors` (`CHANGELOG.md:38-40`); route tools registered via WebMCP depend on the latter (4.3).
- Dev-mode console helpers already exist for signal debugging: `toggleWatchSignal` logs updates via a `DebugWatchNode` held by `WeakRef` so it does not leak (`signal_debug.ts:300-410`).
- A search of `packages/core/src`, `packages/platform-browser/src`, `packages/router/src`, `packages/common/src`, `packages/forms/src` for writes to `global[...]`, `globalThis.*`, `window.*` found only the items already listed (`ng`, `ngDevMode`, testability globals, `ngI18nClosureMode`, event-replay `_ejsa`/`__jsaction_bootstrap`) (`packages/core/src/util/ng_i18n_closure_mode.ts:26`; `packages/core/primitives/event-dispatch/src/bootstrap_global.ts:26,46`; `packages/core/primitives/event-dispatch/contract_binary.ts:11`). There is no other hidden AI or debugging global.

### 5.7 Summary for the extension design

| Need | Best available route at 22.2 | Tier |
|---|---|---|
| Component tree, instances, inputs/outputs, CD strategy | `ng.getComponent/getDirectives/getDirectiveMetadata/getOwningComponent/getHostElement` | 0 |
| Edit state and re-render | Mutate instance or `.set()` a writable signal, then `ng.applyChanges` | 0 |
| Template event listeners | `ng.getListeners` (unused by DevTools) | 0 |
| Feature detection (zoneless, profiling) | `performance.getEntriesByName('mark_feature_usage')` | 0 |
| DI graph for an LLM | `devtoolstooldiscovery` -> `angular:di_graph` | 1 |
| Signal graph for an LLM | `devtoolstooldiscovery` -> `angular:signal_graph`, or `ng.ɵgetSignalGraph` (keeps `id`/`debuggableFn`) | 1 |
| DI per node (providers, resolution path, deps) | four `ɵ` injector functions | 1 |
| CD/lifecycle timing | `ng.ɵsetProfiler` (add only, never `null`) | 1 |
| `@defer` / `@for` state | `ng.ɵgetControlFlowBlocks` | 1 |
| Hydration | `__ngDebugHydrationInfo__`, `ngh`, `ngDevMode` counters | 1 |
| Router | `ng.ɵgetRouterInstance/ɵgetLoadedRoutes/ɵnavigateByUrl` (only `provideRouter` apps) | 1 |
| App-authored semantic actions | WebMCP tools via a `document.modelContext` shim (only apps that opted in) | app opt-in |
| `@if`/`@switch` blocks, error boundaries, local refs, DI event stream, `ApplicationRef` | not exposed | 2 |
