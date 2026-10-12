# 04 - Ecosystem integrations: NgRx, Analog, Storybook, Vitest Browser Mode, RxAngular

Date: 2026-10-11. Target: an Angular 22.2 dev-mode app, inspected by a Chrome/Edge MV3 extension (content script plus injected main-world script).
Labels: **[measured]** = read in the local clone or fetched source/doc this session; **[inferred]** = reasoned from those reads or prior knowledge, not verified at runtime. Nothing here was run in a browser; every runtime claim is therefore [inferred] unless it quotes source.

Local clones used: `D:\projects\github\ngrx\platform` (NgRx 22.0.0, `modules/store/package.json`), `D:\projects\github\analogjs\analog` (`@analogjs/platform` 2.8.0).

## 0. Shared mechanics (apply to all five tools)

1. **Token lookup problem.** `ng.getInjector(el).get(Token)` needs the token object. An extension has no import access to app bundles, so it cannot name `Store` or `RxStrategyProvider` directly. Options, in order of cost [inferred]:
   - Walk the injector's provider records (Angular DevTools does this through debug APIs such as `getInjectorProviders` / `getInjectorResolutionPath` in `@angular/core`; availability on the `ng` global must be spiked; Answered: see `02-angular-surface.md` sections 1.2 and 2.1, and `05-spikes.md` S2, which lists `ɵgetInjectorProviders` and `ɵgetInjectorResolutionPath` on `window.ng` in 22.2.2) and match tokens by `token.name` / `token._desc` ('Store', 'StoreDevtools', 'RxStrategyProvider'). Works because a dev-mode app is not minified.
   - Match by shape (duck typing): `typeof x.dispatch === 'function' && x.select` for Store.
   - Symbol scan: `Object.getOwnPropertySymbols(instance)` and filter on `description === 'STATE_SOURCE'` (NgRx Signals, see 1.2).
2. **Early injection matters.** A content script with `world: "MAIN"` and `run_at: "document_start"` can install globals (e.g. a fake `__REDUX_DEVTOOLS_EXTENSION__`) before the app reads them. Anything read once in a provider factory needs this.
3. **Dev-mode only.** Everything below is for dev builds. `ngDevMode` gates symbol descriptions (NgRx) and Angular's debug globals.

---

## 1. NgRx (Store, Store Devtools, Signals, Events)

### 1.1 `@ngrx/store` + `@ngrx/store-devtools`

(a) **Detection**
- Primary: `window.__REDUX_DEVTOOLS_EXTENSION__` is read in a provider factory, `createReduxDevtoolsExtension()`, `modules/store-devtools/src/provide-store-devtools.ts:34-45` [measured]. It only runs if the app calls `provideStoreDevtools()`.
- Injector probe: tokens `StoreDevtools`, `STORE_DEVTOOLS_CONFIG`, `IS_EXTENSION_OR_MONITOR_PRESENT` (`provide-store-devtools.ts:23,76-103`) and `Store`, `StateObservable`, `ROOT_STORE_PROVIDER`, `STORE_FEATURES` (`modules/store/src/provide_store.ts`) [measured]. Lookup by name per section 0.
- A connection from the app to our injected shim is itself a detection signal (see (b)).

(b) **Readable with zero app change**
- Only if the app already uses `provideStoreDevtools()` (very common in dev setups): install a **shim `window.__REDUX_DEVTOOLS_EXTENSION__`** at document_start. The factory returns whatever is on `window` at provider time ([measured], line 37-41), then `DevtoolsExtension` calls `.connect(config)`, `connection.init()`, `connection.subscribe(cb)`, and for each action `connection.send(action, state)` or a full lifted state via `devtoolsExtension.send(null, liftedState, config)` (`extension.ts:178-276`) [measured]. The shim receives every action and the full state tree, post `actionSanitizer`/`stateSanitizer` and action filters. It can also push `{type:'DISPATCH', payload:{type:'JUMP_TO_STATE'...}}` back through `subscribe` callbacks to time-travel, commit, reset (message names come from `ExtensionActionTypes` in `extension.ts`; payload shapes [inferred] from the Redux DevTools protocol).
- Caveat: if the real Redux DevTools extension is installed, whichever defines `window.__REDUX_DEVTOOLS_EXTENSION__` first wins; our shim must proxy to the original (forward `connect/send/subscribe`) to coexist [inferred].
- Without devtools provider and without app change: locate `Store` via injector walk and call `store.select(s => s)` / read `StateObservable` once; subscribe to `ActionsSubject` to log actions [inferred]. Gives live state and actions but no history before attach.

(c) **Needs opt-in**: history older than attach time unless shim is installed early; `provideStoreDevtools({maxAge, name, serialize, actionSanitizer})` tuning; action creators registry (`actionCreators` option) for dispatch-from-UI; NgRx `features`.

(d) **Existing devtools**: Redux DevTools extension (protocol above); `@ngrx/store-devtools` is the in-app half. NgRx also has runtime checks (`runtime_checks.ts`, uses `isDevMode`) that throw on state mutation [measured].

(e) **LLM feature ideas**
- "Explain this action trace": feed the last N actions plus state diffs (per action) to the model; ask which reducer/effect likely produced an unexpected value.
- Auto-generate a reducer/selector unit test from a captured action sequence plus before/after states (a recorded trace is a ready test fixture).
- Detect anti-patterns from traces (action storms, actions that don't change state, large serializable state) and propose fixes.
- Natural-language dispatch: "set filter to overdue" -> proposes a concrete `{type, ...payload}` using `actionCreators` or observed action shapes, user confirms, extension dispatches through the shim connection.

### 1.2 `@ngrx/signals` (SignalStore, signalState)

(a) **Detection** [measured, `modules/signals/src/state-source.ts`]
- Every store/state exposes a symbol-keyed property `STATE_SOURCE`, `Symbol('STATE_SOURCE')` when `ngDevMode` is truthy (line 14-16, empty description otherwise). Scan instances for an own symbol with description `STATE_SOURCE`; its value is `{ [key]: WritableSignal }`.
- `signalStore()` classes are normal injectables; found by injector walk (section 0). Instances are also reachable as component properties (`ng.getComponent(el)` then scan fields) [inferred].

(b) **Readable with zero app change**
- Current state: call each signal in `instance[STATE_SOURCE]` (what `getState` does, lines 147-160) [measured]. Reading is side-effect free outside reactive contexts.
- Computed/methods: `withComputed`/`withProps`/`withMethods` members are ordinary own properties on the store; enumerate keys, call signals [inferred].
- Writes: `patchState` requires `isWritableStateSource` (all signals writable, lines 46-53); we can call `signal.set()` directly on the writable signals for "edit state from devtools" [inferred: `patchState` also notifies `watchState` watchers (state-source.ts:79-145 area), so a direct `.set` may skip them; flag that in the UI].
- Change history: `watchState` needs an injector and registers into a module-private `WeakMap` (`STATE_WATCHERS`, line 12) that we cannot reach. Use instead: poll, or run our own `effect()`/`watchState(store, fn, {injector})` -- needs the real functions from the app bundle, so not available. Zero-change alternative is a polling diff of `getState` snapshots on rAF or after each click [inferred].

(c) **Opt-in**: exact action names and glitch-free intermediate states; both need `withDevtools` from the toolkit (below) or app-owned `watchState` hooks.

(d) **Existing**: `@angular-architects/ngrx-toolkit` `withDevtools(name, ...features)` [measured from `libs/ngrx-toolkit/src/lib/devtools/internal/devtools-syncer.service.ts` and the docs page]: connects with `window.__REDUX_DEVTOOLS_EXTENSION__.connect({name: 'NgRx SignalStore', ...})` (line 55, 78-79), sends `connection.send(action, currentState)` (line 112). Options: `withGlitchTracking()`, `withDisabledNameIndices()`, `withMapper(fn)`, `updateState(store,'name',partial)`, `renameDevtoolsName`, `withTrackedReducer` (events). Duplicate names are suffixed `-1`. Docs say it activates only after the user opens the "NgRx Signal Store" tab (docs page; `with-devtools.md`). **The same shim from 1.1 captures this traffic for free** [inferred]: SignalStore apps that use `withDevtools` become inspectable with no further change, with named actions.

(e) **LLM ideas**: "Which store property drives this component?" (match template-bound signals to store keys); suggest `withComputed` to replace recomputed expressions; generate `signalStoreFeature` extractions; flag `patchState` calls that put non-serializable values in state.

### 1.3 `@ngrx/signals/events` (Events plugin)

- Modules: `dispatcher.ts`, `events-service.ts` (`Dispatcher`, `Events`, `EVENTS`, `ReducerEvents`), `event-creator.ts`, `with-reducer.ts`, `with-event-handlers.ts`, `inject-dispatch.ts` (`modules/signals/events/src`) [measured, names only].
- (a) Detect `Dispatcher`/`Events` by injector walk. (b) With zero change we can subscribe to the `Events` stream (an Observable of all dispatched events) once we hold the instance [inferred]: gives a live event log with scope info (`event-scope.ts`). (c) Opt-in: none needed beyond injector access, but pairing with `withTrackedReducer` gives devtools naming. (d) Toolkit `withTrackedReducer` forwards events to Redux DevTools. (e) LLM: an events timeline explained in prose; "who handles this event?" by mapping `withEventHandlers`/`withReducer` registrations.

---

## 2. Analog.js (file routes, content, server routes, Vite dev server)

(a) **Detection** [measured unless marked]
- Dev server is Vite: client modules at `/@vite/client`, `/@id/...`, `/@fs/...` and `/src/...` URLs; script `type=module` tags pointing at `/@vite/client` (Vite behavior, [inferred] from general knowledge).
- Analog Angular HMR endpoint: `/@ng/component?c=<id>` served by `liveReloadPlugin` (`packages/vite-plugin-angular/src/lib/live-reload-plugin.ts:7-60`). A request to this URL pattern in the network log is an Analog/Vite-plugin-angular signal. (Superseded in part 2026-10-12, review round 7: the URL is not specific to Analog. Angular core builds it (`packages/core/src/render3/hmr.ts:67` on 22.2.x) and the Angular CLI's Vite-based dev server answers it (`ANGULAR_COMPONENT_PREFIX = '/@ng/component'`, `angular-cli/packages/angular/build/src/tools/vite/middlewares/component-middleware.ts:12` on 22.0.x) [measured in source]. It and `/@vite/client` show a Vite-based dev server (Angular CLI or Analog); only the `/_analog/` URLs below identify Analog. See `docs/feature-proposals.md` 6.4.)
- Opt-in debug page: `withDebugRoutes()` adds route `__analog/routes` listing route path, source file and Layout/Page (`packages/router/src/lib/debug/index.ts`, `debug.page.ts`); `DEBUG_ROUTES` token (`debug/routes.ts`) is `providedIn: 'root'` and builds from `ANALOG_ROUTE_FILES` + `ANALOG_CONTENT_ROUTE_FILES` [measured]. Because `DEBUG_ROUTES` is a root-provided factory token, an injector lookup by name ('@analogjs/router debug routes') returns the full file-route table with **no app change** [inferred; the token is not exported to us, but name lookup per section 0 applies]. (Review round 3: a root-provided token may have no injector record until something injects it, which `withDebugRoutes()` does, so the lookup may find nothing without it [inferred]; spike S12 in `docs/feature-proposals.md`.) (Answered in part, 2026-10-12: `R3Injector.get` creates the record for a `providedIn` token, and emits the provider-configured event that `ɵgetInjectorProviders` reads, only on the first `get` for that token, `packages/core/src/di/r3_injector.ts:352-358` on 22.2.x [measured in source]; see `docs/feature-proposals.md` 3.4. Whether an Analog app injects `DEBUG_ROUTES` without `withDebugRoutes()` is still not run, S12.)
- Route file convention: `/src/app/pages/*.page.ts`, `[param]`, `[...catchall]`, `(group)` (spec fixtures in `packages/router/src/lib/*.spec.ts`).
- Server endpoints: page server files `*.server.ts` map to `/api/_analog/pages/...` (prefix `/api` when an API dir exists; derivation in `packages/vite-plugin-nitro/src/lib/utils/get-page-handlers.ts:44-65`, text says `/_analog/pages/index`, `users/[id].server.ts -> /_analog/pages/users/:id`, `(auth)/login -> /_analog/pages/-auth-/login`); server functions use the fixed route `/_analog/fn/:id` (NOT `/api` prefixed) (`utils/server-fn-endpoints.ts:13-24`) [measured]. Both are observable as XHR/fetch URLs.
- Client globals: none found for dev inspection. Analog globals found are SSR/streaming only (`__analogPaint`, `__analogReconcileHead`, `__analogFinalize` in `packages/router/server/src/defer-reconcile-runtime.ts`; `__analogSsrDeferCapture` server side) plus test-only `__vitest_zone_patch__` [measured]. SSR streaming markers in HTML: `data-analog-defer`, `data-analog-head`, `data-analog-authoritative` (`packages/router/RFC-streaming-ssr.md`) [measured].
- `ANALOG_QUERIES_KEY = '__analogQueries'` (TanStack query integration, `packages/router/tanstack-query/src/constants.ts`) is a transfer-state key, readable from the `TransferState` script tag in SSR HTML [inferred].

(b) **Readable with zero app change**
- Router config: `ng.getInjector(rootEl).get(Router)` is plain Angular (the Router is public API; the extension can match `Router` by name or via Angular DevTools-style router tree). Analog adds file path per route through `DEBUG_ROUTES` as above [inferred].
- Content files: `ANALOG_CONTENT_ROUTE_FILES` and content tokens (`content-files-token.ts`, `content-files-list-token.ts` in `packages/content/src/lib`) are injector-reachable [inferred].
- Network: server-fn and page-endpoint traffic by URL pattern (chrome.webRequest / devtools network panel API) with no app change [inferred].
- Vite module graph: fetch `/@vite/...` is not an inspector API; module graph is not exposed over HTTP by default [inferred]. The Vite client side hot channel is a WebSocket; can be observed but is private.

(c) **Opt-in**: `withDebugRoutes()` route page (zero-effort to add, but not zero-change); a custom `/__ai-devtools` Vite plugin (dev-only) exposing module graph, compile diagnostics, and server-fn manifest through `configureServer` middleware, as `liveReloadPlugin` does [measured pattern, proposal is ours].

(d) **Existing**: `withDebugRoutes` page; Analog Storybook package (`packages/storybook-angular`, `@analogjs/storybook-angular`, builder `@storybook/builder-vite`, `preset.ts:40`); Analog Vitest package (`packages/vitest-angular`, `browserMode` schematic option with Playwright, `README.md:55-65`) [measured]. No Analog devtools extension found [measured: no hits for `devtools` in router/platform/vite-plugin sources beyond the above]. Local `CLAUDE.md`/`AGENTS.md` exist in the Analog repo but no MCP integration [measured via filename search, rg for 'mcp' returned nothing].

(e) **LLM ideas**: "route doctor" (compare file-route table with the router state, explain why a URL 404s or which layout wraps which page); generate `.page.ts` + `.server.ts` pair from a description of the data; trace a slow page to its server function (`/_analog/fn/:id`) and suggest caching; content-route explorer that answers "where does this markdown render".

---

## 3. Storybook (Angular)

Versions seen in docs fetched this session: Storybook 10.x docs, up to 10.6 on the AI page [measured]; `@storybook/angular` supports Angular >=18 and <23, with `@storybook/angular-vite` for Angular >=21 (docs: get-started/frameworks/angular) [measured].

(a) **Detection**
- Preview iframe: `iframe.html?id=<story-id>&viewMode=story` (and `viewMode=docs`) [inferred from standard Storybook URLs]. Manager UI is the parent page.
- Globals in the preview frame [measured, `code/core/src/preview-api/modules/preview-web/`]: `window.__STORYBOOK_PREVIEW__` (assigned in `PreviewWeb.tsx:19`); `__STORYBOOK_STORY_STORE__` is a proxy over `__STORYBOOK_PREVIEW__.storyStore` (comment in `Preview.tsx:103-105`); addon store singleton at `globalThis.__STORYBOOK_ADDONS_PREVIEW` (`preview-api/modules/addons/main.ts:52`). `__STORYBOOK_ADDONS_CHANNEL__` was NOT found in `next` branch greps of these files, so treat it as [inferred, may have been renamed]. Dev config globals: `CONFIG_TYPE === 'DEVELOPMENT'`, `CHANNEL_OPTIONS` with `wsToken` (`core/src/channels/index.ts:41-45`) [measured].
- Selection state: `__STORYBOOK_PREVIEW__.currentSelection` / `selectionStore` (`PreviewWithSelection.tsx`) holds the active story id [measured names].
- Dev server MCP: `http://localhost:6006/mcp` when `@storybook/addon-mcp` is added (docs `/docs/ai`) [measured]. Manifest: `features.componentsManifest` (default false) generates manifests used by the MCP server; served at `/manifests/components.json` in dev per a third-party source [inferred, one source]; `experimentalDocgenServer` (default false, except true on `@storybook/angular-vite`) switches to a ref-based per-component format (docs: main-config-features) [measured].
- Angular specifics: `applicationConfig` and `moduleMetadata` decorators; stories bootstrap through Angular's normal bootstrap, so in the iframe `ng.getComponent`, `ng.getInjector` work in dev mode [inferred].

(b) **Readable with zero app change** (inside the iframe, main world)
- Story index and current story: `__STORYBOOK_PREVIEW__.storyStore` (index, `loadStory`, args via `storyStore.args`/`userGlobals`) [inferred shape; names measured above]. Args, argTypes, globals, play status.
- The rendered component: `ng.getComponent(document.querySelector(...))` in iframe; inputs/outputs/signals via Angular debug APIs [inferred].
- `index.json` at the Storybook root (standard v7+ endpoint) lists all stories [inferred from general knowledge, high confidence].
- MCP tools (`docs-list`, `docs-show`, `get-storybook-story-instructions`, `test-run`) are available to any MCP client, so our extension need not re-implement them; it can complement them with runtime facts (measured: docs page).

(c) **Opt-in**: `@storybook/addon-mcp` plus `features.componentsManifest`; a custom Storybook decorator or `preview.ts` hook to emit component-to-story coverage; `@storybook/addon-vitest` for in-UI test runs (referenced in Angular page for `angular-vite`).

(d) **Existing**: Storybook MCP addon, component manifest, Controls/Actions/Interactions/Viewport/A11y addons, `@analogjs/storybook-angular` (Vite builder community framework; `@analogjs/storybook-angular` README) [measured], `@storybook/angular-vite` [measured as mentioned only]. Storybook channel is `postMessage` between manager/preview (`channels/postmessage/index.ts`) plus WebSocket server channel in dev [measured].

(e) **LLM ideas**: "story gap finder" (components in the live app with no story; use manifest + `ng.getComponent` walk); generate a story (CSF) from the component currently on screen, using actual runtime inputs as args; story-to-test (see section 4, `composeStories`); a11y or visual regression summaries explained in prose; diff story args vs. production runtime values.

---

## 4. Vitest Browser Mode

Docs observed: vitest.dev/guide/browser (header v5.0.3) [measured]; source `vitest-dev/vitest` `packages/browser/src` (main) [measured].

(a) **Detection** (the extension inspects the *browser page the runner opens*; runner pages are not the user's app)
- Orchestrator URL: `<base>__vitest_test__/` (`projectParent.ts:123-124`); tester iframe URL: `<base><sessionId>/<testFile>` (`projectParent.ts:259`); UI `__vitest__/` (favicon `__vitest__/favicon.svg`, line 125); assets under `/__vitest_browser__/` (`plugin.ts:38`) [measured]. API server defaults to port 63315 (docs) [measured].
- Page titles: "Vitest Browser Runner" (orchestrator.html), "Vitest Browser Tester" (tester.html) [measured].
- Globals in both: `window.__vitest_browser_runner__` = `{ config, viteConfig, type, sessionId, testerId, provider, method, providedContext, cleanups, wrapModule, ... }` and `window.VITEST_API_TOKEN` (`client/public/esm-client-injector.js`) [measured]. In the tester also `__vitest_worker__`, `__vitest_mocker__` (`tester.ts:174`), `__vitest_index__` (`tester.ts:278`) [measured]. Orchestrator DOM: `<div id="vitest-tester">` containing `iframe[data-vitest]` [measured from orchestrator.html CSS].
- Extension note: content scripts must use `all_frames: true` and match `http://localhost:63315/*` plus the Vite dev server port; the tester is an iframe inside the orchestrator [inferred].

(b) **Readable with zero app change**
- Run config: `__vitest_browser_runner__.config` (include patterns, test name filters, root) and `.provider` (playwright/webdriverio/preview), `.sessionId` [measured structure].
- Live DOM of the component under test in the tester iframe; Angular `ng.*` APIs work if the component was rendered in dev mode [inferred].
- Test results come over the Vitest RPC WebSocket using `VITEST_API_TOKEN`; the extension can read the token, so it could attach as a reporter client; this crosses a trust boundary, flag it in design [inferred].

(c) **Opt-in**: Browser Mode must be configured by the project (`test.browser.enabled`, provider, instances). A custom Vitest reporter or `onConsoleLog` hook for structured results to the extension; the dropped-in test file itself (below).

(d) **Existing**: Vitest UI (`@vitest/ui`, `--ui`); Playwright trace/screenshots; `toMatchScreenshot`; `expect.element` locators (`client/tester/expect/*`) [measured]. Angular rendering: `vitest-browser-angular` (community, `vitest-community/vitest-browser-angular`): `render(Component, {inputs, componentProviders, baseElement})` returns `{locator, container, componentClassInstance, routerHarness, router}`; setup via Analog (`@analogjs/vitest-angular/setup-testbed`: `setupTestBed({zoneless:true})`, `browserMode: true` keeps components mounted) or Angular CLI's `@angular/build:unit-test` builder with `@vitest/browser-playwright` (README) [measured]. Analog's own `ng g @analogjs/vitest-angular:setup --browserMode` (`packages/vitest-angular/README.md:55-65`) [measured].
- Storybook link: `composeStories(stories)` / `composeStory(story, meta)` + `setProjectAnnotations([...])` + `beforeAll(annotations.beforeAll)`; `Story.run()` mounts and executes the play function (docs: portable-stories-vitest). The page did not give an Angular-specific import; verify package name for Angular [measured gap].

**How a generated test lands in a repo**: devtools generates `<name>.spec.ts` next to the component using `vitest-browser-angular` `render` with the inputs/providers captured from the live component, then writes via (1) a download of the file, (2) File System Access API directory handle chosen by the user, or (3) a local native-messaging/CLI bridge or MCP server that runs inside the repo and writes files, so an agent applies it [inferred; (3) is the only one that can also run the test]. The test needs the project's existing Vitest browser setup; detect it from `__vitest_browser_runner__` only when a run is open, otherwise from repo files via the bridge.

(e) **LLM ideas**: "capture to test" (snapshot inputs, rendered DOM roles, user interactions recorded in the page -> `render` + `locator` assertions using role/text queries rather than CSS); failure explainer (failed assertion + live DOM + component class source); flaky detector via repeated runs; accessible-name based locator suggestions from the real a11y tree.

---

## 5. RxAngular

Sources: `rx-angular/rx-angular` main (`libs/state`, `libs/cdk`, `libs/template`) [measured via raw GitHub]; `@rx-angular/state` peer dep `@angular/core ^21.0.0` and `@rx-angular/cdk 21.1.1` at the time of fetch, so Angular 22.2 compatibility must be checked before relying on it [measured, compat inferred].

(a) **Detection**
- No window globals, no devtools hook, no `ngDevMode` branches or `console.` calls were found in `state` service, strategy provider, config, or strategies files [measured via regex over those files].
- DOM/template: `*rxLet`, `*rxFor`, `*rxIf` are directives with selectors `[rxLet]` (`libs/template/let/src/lib/let.directive.ts:100`) etc. In dev mode the extension can find them with `ng.getDirectives(el)` and match class names `RxLet`, `RxFor`, `RxIf`; inputs `rxLetStrategy`, `rxLetComplete`, `rxLetError`, `rxLetSuspense`, `rxLetContextTrigger` (lines 135-263) [measured].
- Injector tokens: `RxStrategyProvider` (class, `strategy-provider.service.ts:61`), `RX_RENDER_STRATEGIES_CONFIG` (`config.ts:20`), `RX_ACCUMULATOR_FN`, `RX_STATE_SCHEDULER` (`provide-rx-state-config.ts`) [measured]. RxState instances are component-provided: `RxState<State>` class (`rx-state.service.ts:78`), found as a component/directive field or in the node injector by name.
- Zone config: `window.__zone_symbol__<event>` flags set by `rxZoneConfig` (`zone-configurations/src/lib/zone-config.ts:22-51`) -> detectable global side effects [measured].

(b) **Readable with zero app change**
- RxState current state: public `get()` returns the whole state (`rx-state.service.ts:175-281`) and `$` is the state Observable (line 103) [measured]; the extension calls `get()` on the instance it finds. `select`/`signal` proxies exist (`signal-state-proxy.ts`). Subscribing to `$` records history in our own buffer [inferred; subscription is a read-only observer but keeps the accumulator alive, so detach on pause].
- Render strategies: `RxStrategyProvider` exposes the configured strategy names and the primary one (`RX_NATIVE_STRATEGIES`: `local`, `noop`, `native`; `RX_CONCURRENT_STRATEGIES`: `immediate`, `userBlocking`, `normal`, `low`, `idle`; names in `native-strategies.ts:26-46`, `concurrent-strategies.ts:21-81`) [measured]. Reading `strategyProvider.primaryStrategy` and each directive's `strategy` input shows which blocks render at which priority [inferred property names].
- Which parts of a page are rxLet-rendered: highlight hosts with the directives above [inferred].

(c) **Opt-in**: change-detection/render timing per strategy requires wrapping strategies (`provideRxRenderStrategies` with custom `work`) to emit render events; a dev-only token that registers each `RxState` with a name; none provided by the library [measured: no registry found].

(d) **Existing**: no first-party devtools found in the repo layout for `state`, `template`, `cdk`; eslint plugin (`libs/eslint-plugin`) and schematics only [measured via tree listing]. Docs site rx-angular.io (not fetched; the page returned empty content through WebFetch).

(e) **LLM ideas**: "which render strategy suits this block" (observe update frequency and DOM size; recommend `low`/`idle` vs `immediate`); convert `*ngIf` + `async` pipes to `rxLet`/`rxIf` with suspense templates; RxState to signals migration hints (`RxState` now has `signal`-style proxies); explain unexpected state slices through the connected observable graph (`connect` calls cannot be introspected without app hooks, so use the opt-in registry).

---

## 6. Cross-tool summary

| Tool | Best zero-change signal | State readable without change | Needs opt-in |
|---|---|---|---|
| NgRx Store | `__REDUX_DEVTOOLS_EXTENSION__` shim at document_start; `StoreDevtools` token | all actions plus state (if `provideStoreDevtools` present) | history before attach; devtools provider itself |
| NgRx Signals | own symbol `STATE_SOURCE` (dev) on store instances | full state, computed, methods | named actions (`withDevtools`), glitch states |
| Analog | `/@ng/component?c=` requests, `/_analog/fn/:id`, `/_analog/pages/*` URLs (superseded in part 2026-10-12: `/@ng/component?c=` is served by the Angular CLI dev server too, so only the `/_analog/` URLs identify Analog; section 2) | route table via `DEBUG_ROUTES` token, Router state | `withDebugRoutes()`, custom Vite dev middleware |
| Storybook | `__STORYBOOK_PREVIEW__` in iframe; `/mcp`; `index.json` | story index, current args, rendered component | `addon-mcp`, `componentsManifest` |
| Vitest Browser | `__vitest_browser_runner__`, `/__vitest_test__/`, port 63315 | run config, live DOM in tester iframe | browser mode config, reporter hook |
| RxAngular | `RxLet/RxFor/RxIf` directives, `RxStrategyProvider` token | `RxState.get()`, strategy names | named registry, strategy timing hooks |

Recommended priority for a first build [inferred]: (1) Redux DevTools shim (covers Store and SignalStore-with-toolkit in one mechanism); (2) STATE_SOURCE symbol scan; (3) Storybook iframe globals plus MCP complement; (4) test generation to Vitest browser via a repo bridge; (5) Analog/RxAngular as thin injector-name probes.

Open spikes (nothing here was run): whether `ng.ɵgetInjectorProviders`-style APIs are on the `ng` global in 22.2 (Answered: yes, see `02-angular-surface.md` section 1.2 and `05-spikes.md` S2); whether MV3 `world: "MAIN"` at `document_start` beats the app's provider factory (expected yes); coexistence of the shim with the real Redux DevTools extension; Storybook `__STORYBOOK_ADDONS_CHANNEL__` presence in v10; RxAngular compatibility with Angular 22.
