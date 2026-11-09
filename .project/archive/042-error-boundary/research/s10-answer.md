# S10 — does an Angular error boundary expose the error it caught to a page-side reader?

Recorded: 2026-11-09
Verdict: **answered — yes, but never through a boundary reader of its own.** A caught error is reachable from the page through exactly two generic Angular surfaces: the `ErrorHandler` instance (patch `onViewError`, which receives the error plus the boundary's component type and a `reset()` function), and `ng.getContext()` on a DOM node inside the rendered `@error` view (which returns `{$error, $reset}`). `window.ng` publishes **no** function that returns a boundary or a caught error — 25 keys, 0 error-shaped — and the panel's existing block reader (`ɵgetControlFlowBlocks`) is blind to `@boundary`. On the milestone's own subject the question is moot: **neither the portal nor the fixture declares a boundary at all**, so an error thrown by a component there is reported to the `ErrorHandler` (measured: one `console.error('ERROR', …)` per change-detection pass) and retained by nothing.

## Question

Does an Angular error boundary expose the error it caught to a page-side reader? M042 `error-boundary` is gated on this: its scope is "which boundary caught the error, and the subtree it replaced", and success criterion 2 is "the finding reports the error the boundary received, never the fallback that replaced it" (`.project/ROADMAP.md:1542`, `:1554`). If a caught error is unreachable without the app cooperating, the milestone is not buildable as written.

Four things were measured, on the zoneless portal and, where the portal offers no safe throw, on the `spikes/ng222-app` fixture:

1. whether the subject declares an Angular error boundary at all;
2. what the installed `@angular/core` (22.2.2, the version the portal and the fixture run) exposes to a page-side reader;
3. what the page actually sees when a component throws;
4. the honest ceiling, with the absences named in this project's vocabulary (`{ state: "cannot-tell", absence: "<name>" }`, the shape `extension/navigation-narrator.js:86-101` uses).

**Citation legend.** `P:` is the portal checkout `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` at `92d46ec` (branch `claude/ai-devtools-spike`); paths after it are relative to that checkout. `C:` is the installed Angular chunk directory `spikes/ng222-app/node_modules/@angular/core/`; `_debug_node-chunk.mjs` and `_pending_tasks-chunk.mjs` there are **byte-identical** to the portal's own install (MD5 `911307b5aecf4c7df5cdf9bcb1c39437` for both copies of `_debug_node-chunk.mjs`), so one set of line numbers holds for both subjects.

## Method

Two skills, no product code, no app edit, nothing built.

```bash
# target 1: the zoneless Insurance Portal, unmodified
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal \
  --dir "D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" --json
# target 2: the fixture, for the throw the portal offers no safe route to
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json
# driver: one throwaway tab per probe, closed by `run`
node .commandcode/skills/control-ai-browsers/scripts/control.mjs run chrome-beta-nano <probe.js> --json
```

Provenance, read on both pages:

```
portal  {"url":"http://localhost:4507/home","rootTag":"NG-JOURNAL-ROOT","ngVersion":"22.2.2","zone":"undefined"}
fixture {"url":"http://localhost:4222/","ngVersion":"22.2.2","zone":"undefined","keys":25}
```

The portal ran at `http://localhost:4507/` (slot 7, API on the fixed `:3000`, state file `tmp/control-angular-dev-app/state/portal.json`, evidence `tmp/control-angular-dev-app/portal-2026-11-09T10-56-21-171Z`); the fixture at `http://localhost:4222/` (evidence `tmp/control-angular-dev-app/counter-2026-11-09T10-59-10-021Z`); the driver was `chrome-beta-nano`, Chrome/158.0.8127.18, CDP 9333.

Three kinds of throw were used — four runs in all — none by editing a source file:

- **portal, no boundary**: `ng.getComponent(document.querySelector('ng-journal-sidebar'))`, then `Object.defineProperty(instance, 'routingConfigs', { get() { throw new Error(…) } })` — a field the sidebar template reads inside its `@for` (`P:apps/insurance-portal/src/app/sidebar.component.ts:35`, `:76`) — then a real click on a sidebar entry so the router and the change-detection scheduler run.
- **fixture, real `@boundary`**: `@angular/compiler` was imported *in the page* through the fixture's own Vite dev server (`/@id/@angular/compiler`, which sets `window.ng.ɵcompilerFacade`, `C:_debug_node-chunk.mjs:999-1003`), and a throwaway JIT component with `@boundary { … } @error { … }` was mounted with `createComponent` into the running app's environment injector. Measured: `core.VERSION.full` `22.2.2`, `facadeOnNg: true`, `defined: true`, `created: true`. This is a measurement device on a scratch tab, not app code: it is the only way to render the block on a subject that declares none, and the tab is closed by `run`. Three variants were mounted: the boundary in the throwing component's own template (§E), the boundary in a parent's template with a throwing child (§E2), and one carrying `@for` + `@defer` + `@boundary` for the block-reader contrast (§F).
- **fixture, global listeners**: `setTimeout(() => { throw … })` and `Promise.reject(…)`, to separate the *global* path (`provideBrowserGlobalErrorListeners()`, which the fixture declares at `spikes/ng222-app/src/app/app.config.ts:6` and the portal does not) from the *change-detection* path.

The probe scripts are session scratch (`…\scratchpad\probe-s10-*.js`), so every call and output this answer rests on is quoted **in this file**. The only file this spike wrote in the repository is this one.

## Commands and output

### A. `window.ng` on the portal — 25 keys, none of them about errors

```json
{"ngKeys":["applyChanges","enableProfiling","getComponent","getContext","getDirectiveMetadata",
"getDirectives","getHostElement","getInjector","getListeners","getOwningComponent","getRootComponents",
"isSignal","toggleWatchSignal","ɵgetComponentInstanceDeepLinkId","ɵgetControlFlowBlocks",
"ɵgetDependenciesFromInjectable","ɵgetInjectorMetadata","ɵgetInjectorProviders","ɵgetInjectorResolutionPath",
"ɵgetLoadedRoutes","ɵgetRouterInstance","ɵgetSignalGraph","ɵgetTransferState","ɵnavigateByUrl","ɵsetProfiler"],
 "ngErrorish":[]}
```

The 22 core-published utilities are the object at `C:_debug_node-chunk.mjs:12907-12932` published under the key `'ng'` (`:12906`, `:12948-12960`); the three router ones (`ɵgetLoadedRoutes`, `ɵgetRouterInstance`, `ɵnavigateByUrl`) are `publishNonCoreGlobalUtil` from `@angular/router`. `ɵgetControlFlowBlocks` and `ɵsetProfiler` are the only two "reader" utilities that see framework internals at all.

### B. The `ErrorHandler` is reachable — and the stock one keeps nothing

```json
{"errorHandlers":[{"injectorIndex":2,"injectorType":"environment","injectorSource":"Environment Injector",
 "tokenName":"ErrorHandler","hasInstance":true,"ctor":"ErrorHandler","ownKeys":["_console"],
 "hasHandleError":"function","hasOnViewError":"undefined"}]}
```

Reached by the S13 route: `ng.getInjector(root)` → `ɵgetInjectorResolutionPath` → the `type === 'environment'` injector → the token named `ErrorHandler` in `ɵgetInjectorProviders` → `.get(token)`. The instance is the stock class at `C:_pending_tasks-chunk.mjs:2693-2698`:

```js
class ErrorHandler {
  _console = console;
  handleError(error) {
    this._console.error('ERROR', error);
  }
}
```

Its own key list is one field, `_console`. It retains **no** record of anything it handled, and on 22.2.2 it has no `onViewError` at all — the type declares it optional (`C:types/_debug_node-chunk.d.ts:3229-3238`).

### C. The portal, an error thrown from a component during change detection

```json
{"handleError":[
  {"name":"Error","message":"S10 spike: thrown from the sidebar template during change detection","ctor":"Error","hasCause":false},
  {"name":"Error","message":"S10 spike: thrown from the sidebar template during change detection","ctor":"Error","hasCause":false}],
 "onViewError":[],
 "onerror":[{"message":"Uncaught TypeError: Invalid value used as weak map key"},
            {"message":"Uncaught TypeError: Invalid value used as weak map key"}],
 "unhandled":[]}
```

```json
{"componentFieldsHoldingError":[],
 "reachable":[{"key":"getComponent","kind":"object","isError":false},
              {"key":"getRootComponents","kind":"object","isError":false}]}
```

The console carried the same error twice, in the stock handler's own words:

```
ERROR Error: S10 spike: thrown from the sidebar template during change detection
    at _SidebarComponent.get [as routingConfigs] (…)
    at SidebarComponent_Template (http://localhost:4507/main.js:224:38)
    at executeTemplate (…/vite/deps/core-UUZGJPf3.js:4361:3)
```

Read: the error **reached the `ErrorHandler` unchanged** (same `Error` instance, no `.cause`, no `details`), it **never reached `window.onerror` or `unhandledrejection`** (the two `onerror` entries are a `TypeError` thrown by our own extension — the last bullet of "What this does not settle"), and **no object reachable from `window.ng` held it** — a scan of every component instance on the page for a field whose value is the thrown `Error` found 0.

That is the code path, not an accident: `detectChangesInView` catches, walks ancestors looking for an `ON_ERROR` hook, and **rethrows when none is found** (`C:_debug_node-chunk.mjs:6279-6317`); without a `@boundary` there is no hook, so the throw leaves `detectChanges`, and the change-detection scheduler's own `catch` hands it to the `ErrorHandler` through `INTERNAL_APPLICATION_ERROR_HANDLER` (`C:_debug_node-chunk.mjs:19628-19640` → `C:_pending_tasks-chunk.mjs:2716-2734`: `injector.get(ErrorHandler).handleError(e)`).

### D. The fixture, global listeners present — the contrast the portal cannot show

```json
{"handleError":[{"name":"Error","message":"S10 spike: raw window error","hasCause":false},
                {"name":"Error","message":"S10 spike: raw unhandled rejection","hasCause":false}]}
```

Both raw browser errors reach the `ErrorHandler` **only because** the fixture declares `provideBrowserGlobalErrorListeners()` (`spikes/ng222-app/src/app/app.config.ts:6`, `:7`; the implementation adds `error` and `unhandledrejection` listeners that forward to `INTERNAL_APPLICATION_ERROR_HANDLER`, `C:_pending_tasks-chunk.mjs:2747-2788`). The portal declares no such provider (`P:apps/insurance-portal/src/app/app.config.ts:23-39`), and no dependency of the portal installs it either — the only mention outside `@angular/core` is a minified-name map, `P:node_modules/@pangular-inspector/devtools/dist/devframe-Ch99-n5S.mjs:3054`. That absence is read from source, not measured on the portal (see "What this does not settle").

Same run, the four `ErrorHandler` calls in order, and what each carried:

```
handleError  Error  "S10 spike: raw window error"          ← global listener
handleError  Error  "S10 spike: raw unhandled rejection"    ← global listener
onViewError  Error  "S10 spike: thrown inside the @boundary primary view"
```

### E. The fixture, a real `@boundary` — the error IS exposed, through two surfaces

```json
{"coreUrl":"…/vite/deps/@angular_core.js?v=ce1c2158",
 "core":{"version":"22.2.2","hasCreateComponent":"function","hasComponent":"function","hasDefineComponent":"function"},
 "facadeOnNg":true,"defined":true,"envFound":true,"created":true,"firstCd":"ok","secondCd":"ok",
 "dom":{"primary":false,"fallback":true,
        "hostText":"caught: S10 spike: thrown inside the @boundary primary view"},
 "context":{"keys":["$error","$reset"],
            "errorMessage":"S10 spike: thrown inside the @boundary primary view",
            "errorCtor":"Error","hasReset":true,"resetSource":"() => boundary.reset()"}}
```

```json
{"onViewError":[{"name":"Error","message":"S10 spike: thrown inside the @boundary primary view",
  "hasCause":false,"declarationType":"S10BoundaryHost","declarationInstance":"S10BoundaryHost",
  "boundaryType":"S10BoundaryHost","hasReset":true,
  "restKeys":["declarationInstance","declarationType","caughtBy","boundary"]}],
 "onerror":[{"message":"Uncaught TypeError: Invalid value used as weak map key"},
            {"message":"Uncaught Error: S10 spike: raw window error"}],
 "unhandled":[{"reason":"S10 spike: raw unhandled rejection"}]}
```

Two independent readers, both measured on the same caught error:

- **`ErrorHandler.onViewError(error, details)`** — `details` is exactly `ErrorDetails` (`C:types/_debug_node-chunk.d.ts:3168-3193`): `declarationType`, `declarationInstance`, `caughtBy`, and `boundary: { type, reset }`. The boundary's identity is a *component type plus a reset function*, nothing more.
- **`ng.getContext(<node inside the @error view>)`** → `{ $error, $reset }`, where `$error` **is** the thrown instance (`errorCtor: "Error"`, exact message) and `$reset` is the boundary's own closure (`"() => boundary.reset()"`, the source of `C:_debug_node-chunk.mjs:15200` and `:15164-15167`).

The mechanism, cited: `ɵɵboundaryCreate` stores an `LBoundary` (which holds `error = null`) in the host view's header slot (`C:_debug_node-chunk.mjs:15158-15173`); `ɵɵboundaryUpdate` builds the `@error` embedded view with the context `{ $error: boundary.error, $reset: () => boundary.reset() }` (`:15197-15201`) and installs the `ON_ERROR` hook that sets `boundary.error = error`, reads `ErrorHandler` out of the view injector and calls `onViewError` **if it exists, else** `handleError` (`:15206-15225`). `@boundary`/`@error` are first-class template blocks in 22.2.2 (`@angular/compiler/fesm2022/compiler.mjs:12609`, `SUPPORTED_BLOCKS`), and `ɵɵgetBoundary` exists only as a template instruction (`C:_debug_node-chunk.mjs:15174-15177`, exported in the `ɵɵ` instruction namespace at `:18602-18604`), **not** on `window.ng`.

### E2. A boundary in an ancestor's template — the throwing component and the boundary are named apart

Same JIT device, a child component that throws and a parent that declares the `@boundary`:

```json
{"seen":[{"message":"S10 spike: child throws, parent declares the boundary",
  "declarationType":"S10Child","declarationInstanceCtor":"S10Child","boundaryType":"S10Parent",
  "caughtBy":"function","keys":["boundary","caughtBy","declarationInstance","declarationType"]}],
 "fallbackRendered":true,"fallbackText":"S10 spike: child throws, parent declares the boundary",
 "contextKeys":["$error","$reset"],
 "contextErrorMessage":"S10 spike: child throws, parent declares the boundary"}
```

So `details.declarationType` is the component **whose template threw** and `details.boundary.type` is the component **that declares the boundary** — two different answers, both present in one record, plus `caughtBy` as a function and `reset()`. This is the record M042's first scope item needs ("which boundary caught the error").

### F. The panel's existing block reader cannot see a boundary

One JIT component carrying a `@for`, a `@defer` **and** a `@boundary`, read with the utility the panel already ships:

```json
{"hostText":"123S10 spike: mixed probe","blockKinds":[null,null],"blockCount":2,
 "boundaryCaught":true,"contextKeys":["$error","$reset"],
 "contextErrorMessage":"S10 spike: mixed probe"}
```

Two blocks were reported for three blocks in the host (`blockKinds` reads a `kind` field the objects do not have; they carry `type`, `C:_debug_node-chunk.mjs:11987` and `:12038`). The two are the `@defer` and the `@for`: `findControlFlowBlocks` is driven by a closed list, `CONTROL_FLOW_BLOCK_FINDERS = [deferBlockFinder, forLoopFinder]` (`C:_debug_node-chunk.mjs:12046`), and `ControlFlowBlockType` has exactly two members, `Defer` and `For` (`:11928-11932`). The boundary — demonstrably rendered, since `getContext` on its `@error` view returned `$error` in the same breath — was reported by nothing.

## The four answers

### 1. Does the portal declare an Angular error boundary? **No — none, in any form.**

| form | occurrences in the portal checkout (apps + libs, `node_modules` excluded) |
| --- | --- |
| `provideBrowserGlobalErrorListeners()` | **0** |
| an `ErrorHandler` subclass (`extends`/`implements`) | **0** |
| a `@Component` with `ngOnDestroy` | **0** |
| a directive catching errors (`@boundary`, `@error`, `handleError` on a class of its own) | **0** |

The whole provider list is `P:apps/insurance-portal/src/app/app.config.ts:23-39`:

```ts
providers: [
  provideZonelessChangeDetection(),                              // :24
  provideRouter(appRoutes, withEnabledBlockingInitialNavigation(), withComponentInputBinding()),  // :25-29
  provideOptimus({ theme: { preset: Aura, … } }),                // :30-32
  provideHttpClient(withInterceptors([apiErrorInterceptor])),    // :33
  provideFeatureFlags(),                                         // :34
  MessageService,                                                // :35
  provideSignalFormsConfig({ classes: { ...NG_STATUS_CLASSES } }),// :38
]
```

No error provider is in it. The three near-misses, each of which is *not* a boundary:

- `P:apps/insurance-portal/src/main.ts:5-13` — `bootstrapApplication(AppComponent, appConfig).then(…).catch((err) => console.error(err))`. A bootstrap-failure catch, not a boundary: it runs once, before any component exists.
- `P:libs/shared/ui-directives/src/lib/button-action.directive.ts:1`, `:11`, `:32` — the only `ErrorHandler` in the checkout, and it only *injects the stock one*: `readonly #errorHandler = inject(ErrorHandler);` … `error: (error: unknown) => this.#errorHandler.handleError(error);`. That is a failed RxJS action forwarded to the default handler; the directive catches nothing itself and keeps nothing.
- `P:libs/shared/data-access/src/lib/api-error.interceptor.ts:5`, `:28` — `catchError(…)` on HTTP requests; an interceptor, not a view boundary.

Measured on the running portal: the `ErrorHandler` resolved from the environment injector is the **stock** class (`ctor: "ErrorHandler"`, `ownKeys: ["_console"]`, `hasOnViewError: "undefined"`), so even the one Angular object that receives errors cannot say which boundary caught one.

Nor does any dependency provide a boundary: a content search for the compiled instruction name over the portal's entire `node_modules` found it only in `@angular/{compiler,core,language-service}` and `@angular-eslint/bundled-angular-compiler` — no app, no library template.

### 2. Does our installed `@angular/core` expose a caught error to a page-side reader? **Not through `window.ng`; yes through the `ErrorHandler` and `getContext`.**

- **`window.ng` offers nothing for a caught error.** 25 keys, none error-shaped (`ngErrorish: []`). The published set is closed (`C:_debug_node-chunk.mjs:12907-12932`): no boundary reader, and `ɵɵgetBoundary` is not in it (`:18602-18604` is the instruction namespace).
- **The `ErrorHandler` is reachable and patchable.** `onViewError` is a public, optional method whose `ErrorDetails` carries the boundary (`C:types/_debug_node-chunk.d.ts:3168-3193`, `:3229-3238`). Because the boundary path reads the handler from the *view* injector on every error (`C:_debug_node-chunk.mjs:15209`, `:15231`) and calls whatever `onViewError` the instance has, defining one on the resolved instance is enough: measured, `hasOnViewError` went from `"undefined"` to receiving the error with `boundaryType` and `hasReset: true`.
- **`ng.getContext` is a published reader that reaches the error after the fact.** Inside a rendered `@error` view the embedded view's context is `{ $error, $reset }` (`C:_debug_node-chunk.mjs:15198-15201`), and `getContext` is one of the 25 published keys. Measured: `keys: ["$error","$reset"]`, the exact `Error`.
- **Everything else is blind.** The profiler has 26 event kinds and none of them is an error (`C:_debug_node-chunk.mjs:33-58`). `ɵgetControlFlowBlocks` enumerates `@defer` and `@for` only (`:11928-11932`, `:12046`). The `ɵ` injector utilities return injectors, providers and metadata, never a view. The retained state itself is `LBoundary.error`, an LView header slot (`:15158-15173`) with no published accessor.
- **Version caveat, measured in this repository.** The portal and the fixture run `@angular/core` **22.2.2**, where the whole `@boundary`/`onViewError` surface exists. This repository's own root install is **22.1.8** (`package.json:52`, `"@angular/core": "~22.1.0"`), and that chunk has **no** boundary machinery and **no** `onViewError` — a content search of its `fesm2022` for `boundaryCreate`, `onViewError`, `LBoundary` matched nothing, and `ErrorDetails` is absent from its `types/`. The extension reads the page's runtime, so the page-side hook is unaffected; a TypeScript type imported from `@angular/core` would be, and any type M042 needs must be declared structurally rather than imported.

### 3. What does the page actually see when a component throws?

Cause a throw where it is safe — the portal has no safe throw of its own and no boundary, so both a portal throw (by instance mutation, no source edit) and a fixture throw inside a real `@boundary` were measured:

| surface | portal, no `@boundary` | fixture, inside a `@boundary` |
| --- | --- | --- |
| `console` | `console.error('ERROR', Error)` twice, verbatim from the stock handler | the same `console.error('ERROR', Error)` — because the patched `onViewError` forwarded to it |
| `window.onerror` | **not delivered** (the two entries are our extension's `TypeError`, see below) | **not delivered** |
| `window.onunhandledrejection` | **not delivered** | **not delivered** |
| `ErrorHandler.handleError` | called, same `Error` instance, **no details** | not called while `onViewError` exists (`C:_debug_node-chunk.mjs:15217-15221` takes one branch or the other) |
| `ErrorHandler.onViewError` | **absent on the instance** — nothing to call | called with the error and `{declarationType, declarationInstance, caughtBy, boundary:{type, reset}}` |
| an object on `window.ng` holding the error | **none** (0 component fields held it; `getComponent`/`getRootComponents` return objects) | `ng.getContext(node in the @error view)` → `{$error, $reset}`; nothing else |
| the DOM | unchanged, view partly refreshed | primary view removed (`dom.primary: false`), `@error` view rendered (`"caught: …"`) |

So: a component throw with no boundary is **reported, never retained**. With a boundary it is **retained on the boundary and exposed through the handler and through the error view's context**, and in neither case does it arrive at `window.onerror` — an error caught by change detection is not an uncaught browser error, and on the portal the `provideBrowserGlobalErrorListeners` route that would put raw errors on the handler is not even installed.

### 4. The honest ceiling

**What an error-boundary surface could report today, without the app cooperating beyond declaring the boundary:**

1. **The error itself** — the instance the component threw (`.name`, `.message`, `.stack`, and `.cause` when the thrown value is not `Error`-like, because `encapsulateBoundaryError` wraps only those: `C:_pending_tasks-chunk.mjs:2699-2715`). Settles M042's success criterion 2.
2. **Which component's template was throwing** — `details.declarationType` / `details.declarationInstance`.
3. **Which component declares the boundary** — `details.boundary.type`, and `details.boundary.reset()` to retry it. Measured apart from the throwing component: a child that throws inside a parent's `@boundary` reported `declarationType: "S10Child"` with `boundaryType: "S10Parent"` (§E2).
4. **That the error was caught at all, and by which of the two mechanisms** — `details.caughtBy` on the `outer catch` path (`C:_debug_node-chunk.mjs:6293-6300`), a different `details` shape on the `@boundary`-construction path (`:15236-15243`). A reader must expect both shapes.
5. **The `@error` view's own account** — `ng.getContext()` on any node inside it gives `$error` and `$reset`; this is the only route that works **after** the fact, on a page whose handler the panel did not reach in time.

**What it cannot:**

- **The subtree the boundary replaced.** `LBoundary` holds `error` and its host LView only (`C:_debug_node-chunk.mjs:15158-15167`); the primary view is removed (`dom.primary: false`) and no record of its nodes survives. M042's scope item "which boundary caught the error, **and the subtree it replaced**" (`:1542`) is only reachable by rendering the boundary's template from the panel's own knowledge of the app — i.e. not from the framework. Name it `no-replaced-subtree`.
- **The failing expression or template line.** `declarationType` is a type, not a location; the `Error.stack` carries the generated frames (measured: `S10BoundaryHost_Primary_1_Template`, `ng:///…js:12:36`) and needs a sourcemap to be honest (which S11/S12 measured as an app-side opt-in this project does not have).
- **Which boundary caught an error that no boundary caught.** Without `@boundary` the error goes straight to `handleError` with no details at all (measured on the portal: `details` undefined). A surface must say so rather than name a wrong boundary — `no-boundary-details`.
- **A boundary it has never seen fire.** The hook is blind until an error occurs: there is no enumeration of boundaries, because `ɵgetControlFlowBlocks` does not report them (§F). A page with a `@boundary` that has not thrown is indistinguishable from one with no boundary at all through `window.ng` alone — `no-error-boundary-in-subject`.
- **Raw browser errors on a subject without the global listeners.** The portal has none, so on it `window.onerror` and `unhandledrejection` have no route to the `ErrorHandler` the panel can hook (fixture, which has the provider: 2 of 2 raw errors reached `handleError`) — `no-global-error-listeners`.
- **The error after the boundary resets or its view is destroyed.** `reset()` sets `error = null` and re-renders (`C:_debug_node-chunk.mjs:15164-15167`), and the `@error` view then disappears, so both readers lose it — `no-retained-error`.
- **Errors in an app that never instantiates the boundary path at all**, which is exactly today's subject: the portal and the fixture both declare no boundary, so M042 has no subject on which its own premise holds — `no-error-boundary-declared`.

**Named absences M042 should carry** (in the project's `cannot-tell` vocabulary, `extension/navigation-narrator.js:86-101`):

| absence | when it is the honest answer | evidence |
| --- | --- | --- |
| `no-error-boundary-declared` | the subject declares no `@boundary` anywhere; nothing can be said about catching | 0 declarations in the portal checkout; 0 `boundaryCreate` outside Angular's own packages |
| `no-error-handler-declared` | the subject declares no `ErrorHandler` of its own **and** the stock one cannot be resolved or patched from the page's injector path, so no hook can be installed | the stock token resolved and accepted the hook on both subjects here, so this is the fallback, not the observed state |
| `no-error-caught` | the hook is installed and no boundary error occurred in the window under inspection | `onViewError: []` when the throw had no boundary (measured on the portal) |
| `no-boundary-details` | an error reached `handleError` without `details`, so no boundary can be named | portal: `handleError` twice, `details` undefined |
| `no-error-view-rendered` | the boundary exists but no `@error` view is in the DOM, so `getContext` has no node to read | `getContext` route needs a rendered `@error` node (measured: `primary: false`, `fallback: true`) |
| `no-replaced-subtree` | the boundary's replaced subtree is asked for; it is recorded nowhere | `LBoundary` holds `error` only |
| `no-retained-error` | the boundary was reset or its view destroyed before the read | `reset()` clears `boundary.error` |
| `no-global-error-listeners` | the subject lacks `provideBrowserGlobalErrorListeners()`, so raw browser errors never reach the handler | fixture (provider present): 2 of 2 raw errors reached `handleError`; portal: provider absent in source (`P:apps/insurance-portal/src/app/app.config.ts:23-39`) and in every dependency |

## Verdict

**answered.** An Angular error boundary in 22.2.2 does expose the error it caught to a page-side reader, but only through surfaces that are *not* boundary readers:

- the `ErrorHandler` instance reachable through `window.ng`'s injector route, once the reader defines `onViewError` on it — this yields the error **and** the boundary's component type plus `reset()`;
- `ng.getContext()` on a node inside the rendered `@error` view, which yields `{$error, $reset}` after the fact.

`window.ng` itself offers nothing: 25 keys, 0 error-shaped, and the panel's own block reader enumerates `@defer` and `@for` only. Nothing exposes the subtree the boundary replaced, and nothing enumerates boundaries ahead of an error.

**For M042:** the milestone is buildable as written for its first two scope items and both of its first two success criteria, through the `ErrorHandler.onViewError` hook plus the `getContext` fallback — the same shape as the `ɵsetProfiler` installation S13 measured, and it needs no application cooperation beyond the app *declaring* a boundary. Its third scope item, "the subtree it replaced", is not buildable from the framework's record and has to be reported as `no-replaced-subtree`. And its premise has no subject in this project today: neither the portal nor the fixture declares a boundary, so the milestone needs either a fixture path that declares one (a `@boundary` in `spikes/ng222-app`, which is a fixture change, not product code) or a documented `no-error-boundary-declared` end state.

## What this settles

- The gate: a caught error is reachable from the page in 22.2.2, with the boundary's identity, through `ErrorHandler.onViewError`, and reachable after the fact through `ng.getContext` on the `@error` view.
- That `window.ng` has no boundary or error surface at all, and that `ɵgetControlFlowBlocks` is not one.
- That the stock `ErrorHandler` (`_console` only, no `onViewError`) both retains nothing and is what the portal runs today.
- That a component throw with no boundary is reported to the handler and reaches neither `window.onerror` nor `unhandledrejection`, on a zoneless page as configured.
- That the boundary's replaced subtree is not recorded anywhere a page can read.
- That a record names the throwing component and the boundary's declaring component apart: `declarationType: "S10Child"` with `boundaryType: "S10Parent"` in one `onViewError` call (§E2).

## What this does not settle

- **The two `details` shapes.** The `@boundary`-construction catch (`C:_debug_node-chunk.mjs:15236-15243`) passes `declarationInstance`/`declarationType` of the *declaring* view, the `detectChangesInView` catch (`:6291-6297`) passes the *throwing* view's plus `caughtBy`. Only the second was measured (`keys: ["boundary","caughtBy","declarationInstance","declarationType"]`, §E2); an error thrown while the boundary's own view is being *created* was not isolated.
- **The `BoundaryError` fell-through path** (`C:_debug_node-chunk.mjs:15256-15261`, `'Unhandled error in @boundary fell through.'`) — read, not measured.
- **That a raw browser error on the *portal* fails to reach its `ErrorHandler`.** The provider's absence is read from the portal's source and its dependency tree; only the fixture's delivery was measured, and the portal run did not throw a raw window error.
- **`reset()`'s observable effect on both readers** — cited from `:15164-15167`, not measured.
- **Whether a *third-party* `ErrorHandler` subclass (one the app provides) can always be patched.** Measured only against the stock instance, which is a plain mutable class instance. A frozen or `Object.seal`ed handler would refuse the hook, and that would be `no-error-handler-reachable` rather than `no-error-handler-declared`.
- **An incidental of our own instrumentation, and a real finding for a later milestone:** while these probes ran, our extension threw `TypeError: Invalid value used as weak map key` at `extension/agent-main.js:1034` (`prevEpochs.set(instance, next)` on a `WeakMap`) — it landed in the app's `ErrorHandler` on the fixture and in `window.onerror` on both subjects, twice per page. The trigger was not investigated here; it is recorded because a reader that throws becomes an error the app's handler receives.

## Teardown

| what | how it was stopped | state |
| --- | --- | --- |
| portal app, `:4507` | `control.mjs down --target portal` | stopped |
| portal API, `:3000` | same `down` (recorded process tree) | stopped |
| fixture `ng222-app`, `:4222` | `control.mjs down --target counter` | stopped |
| `chrome-beta-nano`, CDP `:9333` | `control-ai-browsers/control.mjs down chrome-beta-nano` | stopped |
| `:9334` | never started (no second browser instance) | free |
| probe tabs | each `run` opens and closes its own tab | none left open |
| probe scripts, evidence JSON | session scratch only, nothing in the repository | — |

The portal's Nx daemon is never recorded and never stopped (skill contract, `control-angular-dev-app/SKILL.md:214-215`).
