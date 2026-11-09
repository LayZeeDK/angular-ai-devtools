# S13 — Which runtime event streams can the extension subscribe to through the dev-mode injector with ZERO application instrumentation, and what does each add over the console/DOM joins already shipped? Streams surveyed: `Router.events`, `ApplicationRef.isStable`, `NgZone.onStable`/`onMicrotaskEmpty`, change-detection cycle boundaries, `PerformanceObserver` (long tasks, resource timing), signal-graph writes, and two own-built streams. Unit of survey: the stream, not the feature.

Recorded: 2026-11-08
Verdict: **answered** — 8 streams, 7 reachable with no app cooperation, 1 (`NgZone` emitters) measured absent on the zoneless target and **undetermined on a zoneful page**. Zero of the sixteen shipped features drops a required provider, and S13 says why that is a fact about the gate, not about the streams.

## Question

Which runtime event streams can this extension subscribe to **through the dev-mode injector**, with zero application instrumentation, and what does each add over the console/DOM joins already shipped? Per stream: **(a)** the exact call that obtains it from `window.ng`, **(b)** the facts it yields that neither a console message nor a sourcemap/AST index can produce, **(c)** what carrying the subscription costs the app and how it is torn down, **(d)** the attachment-window limit as a named `cannot-tell`, **(e)** the measured result on the zoneless portal. Then: which of the sixteen shipped features gain, and whether any would drop a required provider.

"Zero application instrumentation" here means: no provider, directive, service or resource of ours placed in the app's tree, and no app source changed. `ɵ` symbols, developer-preview APIs and internals are free by the project's own rule (`.project/research/capability-dependency-matrix.md` §0). The only two things done to the app's page were reads through `window.ng`, and — for the one failed navigation the brief asks for — aborting a network request from the *browser* side (CDP/Playwright), never in the app.

## Method

Two commands, no product code, no app edit.

```bash
# the target: the zoneless Insurance Portal, unmodified
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target portal \
  --dir "D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools" --json

# the driver: one throwaway page-probe per question, on a tab `run` closes
node .commandcode/skills/control-ai-browsers/scripts/control.mjs run chrome-beta-nano <probe.js> --json
```

Provenance, measured on the page (probe K):

```
{"url":"http://localhost:4507/home","ngVersion":"22.2.2","rootTag":"ng-journal-root",
 "zoneGlobal":"undefined","ngKeyCount":25,"hasSetProfiler":"function",
 "hasRouterInstance":"function","hasSignalGraph":"function","hasVersionOnNg":false,
 "userAgent":"… Chrome/158.0.0.0 Safari/537.36"}
```

- Target: `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, branch `claude/ai-devtools-spike`, `92d46ec`, `@angular/core` 22.2.2 installed, **no `zone.js`** in `package.json`, `typeof Zone === "undefined"` on the page, `ng-version="22.2.2"`, served at `http://localhost:4507/` (portal state file `tmp/control-angular-dev-app/state/portal.json`, evidence dir `…/portal-2026-11-08T20-15-45-366Z`, API on the fixed `:3000`).
- Driver: `chrome-beta-nano`, Chrome/158.0.8127.18, CDP 9333, artifact-free navigation probes (each `run` opens and closes its own tab).
- Window: dev app ready 20:15:45Z, browser up 20:18:19Z, probes 20:19–20:26Z.
- The probe scripts are session scratch (`commandcode/.../scratchpad/probe-*.js`), so every call and every output that this answer rests on is quoted **in this file**, not linked. This spike wrote exactly one file in the repository, `.project/research/s13-answer.md`; the browser evidence its probes produced was written to a temporary directory under `.project/research/raw/`, copied to session scratch and deleted again (see Teardown §6), so no evidence file of this spike remains in the tree.

`window.ng` on this page carries **25** keys (`probe A`, verbatim):

```
applyChanges enableProfiling getComponent getContext getDirectiveMetadata getDirectives
getHostElement getInjector getListeners getOwningComponent getRootComponents isSignal
toggleWatchSignal ɵgetComponentInstanceDeepLinkId ɵgetControlFlowBlocks
ɵgetDependenciesFromInjectable ɵgetInjectorMetadata ɵgetInjectorProviders
ɵgetInjectorResolutionPath ɵgetLoadedRoutes ɵgetRouterInstance ɵgetSignalGraph
ɵgetTransferState ɵnavigateByUrl ɵsetProfiler
```

There is **no `VERSION`, no `Router`, no `ApplicationRef`, no `NgZone` and no `NgZone`-class token** on the global. Every service below is therefore reached the one way that works everywhere: an injector from `ng.getInjector`, a token from `ɵgetInjectorProviders`, and `.get(token)`.

## (a) The injector route — measured once, used by every row

```js
const ng     = window.ng;
const node   = ng.getInjector(document.querySelector('ng-journal-root'));   // NodeInjector
const path   = ng.ɵgetInjectorResolutionPath(node);                          // 5 injectors
const env    = path.find((i) => {                                            // the APP injector
  const m = ng.ɵgetInjectorMetadata(i);
  return m && m.type === 'environment' && m.source === 'Environment Injector';
});
const tokenOf = (name) => ng.ɵgetInjectorProviders(env)
  .map((r) => (r.token !== undefined ? r.token : r.provider && r.provider.provide))
  .find((t) => t && t.name === name);
const router  = env.get(tokenOf('Router'));          // === ng.ɵgetRouterInstance(env)
const appRef  = env.get(tokenOf('ApplicationRef'));
const zone    = env.get(tokenOf('NgZone'));
```

The path, verbatim (`probe A3`, `perInjector`):

| i | constructor | `ɵgetInjectorMetadata` | provider records | `Router`/`ApplicationRef`/`NgZone` among them |
| - | ----------- | --------------------- | ---------------- | --------------------------------------------- |
| 0 | `NodeInjector` | element `NG-JOURNAL-ROOT` | 6 | no |
| 1 | `R3Injector` | environment `Standalone[_AppComponent]` | 6 | **no** |
| 2 | `R3Injector` | environment `Environment Injector` | **90** | **yes — all three** |
| 3 | `R3Injector` | environment `null` (platform) | 8 | no |
| 4 | `NullInjector` | null | 0 | — (`ASSERTION ERROR: getInjectorProviders only supports NodeInjector and EnvironmentInjector`) |

Two traps this measurement fixes, both of which cost a probe each:

1. **The first environment injector is not the app injector.** `path.find(m => m.type === 'environment')` returns index 1, the *standalone root component's* bootstrap injector, whose 6 records are `CommonModule, SharedModule, BindModule, MotionModule, ToastModule, NgModuleRef` — no `Router`. The app's injector is the **second** environment entry, matched by `source === 'Environment Injector'` (90 records). A reader that takes the first one concludes "Router is not in the injector", which is false.
2. **The token is `record.token`, not `record.provider.provide`.** Provider records are `{token, provider, isViewProvider, importPath}`; for class/existing providers `.provider.provide` is `undefined` while `.token` holds the class. Reading only `.provider.provide` yields 6 named tokens out of 90 records and no `Router` (`probe A`, first attempt). After the fix: **99 distinct token names**, including `Router`, `ApplicationRef`, `NgZone`, `PendingTasks`, `ChangeDetectionScheduler`, `ChangeDetectionSchedulerImpl`.

What the injector answers, verbatim (`probe A3`, `gets`):

```
env[2].get(Router)                -> Router
env[2].get(ApplicationRef)        -> ApplicationRef
env[2].get(NgZone)                -> NoopNgZone
env[2].get(PendingTasks)          -> PendingTasks
node.get(Router)                  -> Router            (NodeInjector falls back to its module injector)
node.get(ApplicationRef)          -> ApplicationRef
platform.get(Router)              -> NG0201: No provider found for `Router`.  (code -201)
platform.get(ApplicationRef)      -> NG0201: No provider found for `ApplicationRef`. (code -201)
```

**`NG0201` is real, but it is the platform injector's answer, not `NgZone`'s.** On this zoneless portal `NgZone` resolves — to `NoopNgZone` — from `env[2]` and from the node injector, because `provideZonelessChangeDetection()` provides `{provide: NgZone, useClass: NoopNgZone}` (`@angular/core/fesm2022/_debug_node-chunk.mjs:19679-19687`, verified in the portal's own install). The brief's expected `NG0201` for `NgZone` was not reproduced by this route; it was reproduced for app-level tokens asked of the platform injector. Recorded as measured, both ways.

## The stream table

`zero-app-cooperation` = reachable with only the calls in (a). `(d)` tokens are proposed in the project's grammar (`{ state: 'cannot-tell', reason: '<lower-hyphen-token>' }`, `ext/lint-core.js:86-89`) and each names an absence and nothing else.

| # | Stream | Obtained by (a) | (b) the fact it alone yields | (c) cost + teardown | (d) `cannot-tell` token | (e) measured on the zoneless portal |
| - | ------ | --------------- | ---------------------------- | ------------------- | ----------------------- | ----------------------------------- |
| 1 | `Router.events` | `env.get(tokenOf('Router')).events.subscribe(…)`; Router also via `ng.ɵgetRouterInstance(env)` | attempted URL + the error **object** of a failed navigation; `urlAfterRedirects`; a lazy load that started and never ended | 1 closure per event; **3–23 events per navigation measured**; `events` is a plain `Subject` (no replay) — `Subscription.unsubscribe()` | `no-navigation-in-window` | reachable, sequence recorded (§ Sequences) |
| 2 | `ApplicationRef.isStable` | `env.get(tokenOf('ApplicationRef')).isStable.subscribe(…)` | whether the app is *still working* after `NavigationEnd`; the settle point of a navigation | emits on every pending-task count change; **2–3 emissions per navigation, 3 per `tick()` measured**; `unsubscribe()` | `stability-before-attach` | reachable, works zoneless (`PendingTasks`-backed) |
| 3 | `NgZone.onStable` / `onMicrotaskEmpty` | `env.get(tokenOf('NgZone'))` then `.onStable.subscribe` / `.onMicrotaskEmpty.subscribe` | zoneful: the macrotask-free settle point per zone turn | zoneful only; `unsubscribe()` | `no-zone-emission` | **`NoopNgZone`: 0 emissions of all three emitters in 600 ms**; zoneful row **undetermined** |
| 4 | Change-detection cycle boundaries | `ng.ɵsetProfiler((event, instance, eventFn) => …)` | CD start/end **and** sync-CD start/end as distinct pairs; `instance` where the site passes one | one synchronous call **per profiler event — 1,670 events for one lazy navigation measured**; the returned function removes *only* that callback | `no-covering-profiler-record` (existing token) | reachable; ids 12/13 and 14/15 measured |
| 5 | `PerformanceObserver` long tasks | `new PerformanceObserver(cb).observe({type:'longtask', buffered:true})` | main-thread blockage the framework never reports, with `startTime`/`duration` | browser-side buffer; `disconnect()` | `longtask-buffer-evicted` | 1 pre-attach entry delivered from the buffer, 1 live; `getEntriesByType('longtask')` stays **0** |
| 6 | `PerformanceObserver` resource timing | `…observe({type:'resource', buffered:true})`, or `performance.getEntriesByType('resource')` | which script/API call a navigation waited on, its duration and transfer size — **including the chunk whose failure produced `NavigationError`** | browser-side 250-entry buffer, shared; `disconnect()` (+ `setResourceTimingBufferSize`) | `resource-buffer-full` | **62 pre-attach entries delivered at attach**; buffer capped at **250**, newest dropped |
| 7 | Own-built: `ApplicationRef.afterTick` | `env.get(tokenOf('ApplicationRef')).afterTick.subscribe(…)` | a tick clock independent of the profiler: "this tick happened at all" vs "this tick had no work" | 1 emission per tick (**2 for 2 ticks measured**), nothing else; `unsubscribe()` | `no-tick-in-window` | reachable, teardown proven |
| 8 | Own-built: sampled signal-graph epochs | `ng.ɵgetSignalGraph(ng.getInjector(host))` on a timer/`rAF` | *change* over time: an epoch that advanced says this producer re-evaluated during that window | **0–0.2 ms per component read**, 4–28 nodes; polling, so it can miss; `clearInterval`/`cancelAnimationFrame` | `between-samples` | reachable, per-component sizes recorded |

Rows 1–4 and 7 are dev-mode-injector streams; 5–6 are platform streams needing no injector at all; 8 is a pull built from a dev-mode read. Nothing in the table needs a provider, a directive or a resource of ours.

### 1. `Router.events` — (a)–(e)

**(a)** `const router = env.get(tokenOf('Router'))` — the class token comes from `ɵgetInjectorProviders(env)`; `ng.ɵgetRouterInstance(env)` returns the same object (`probe A`: `{"ctor":"Router","url":"/home","eventsSubscribe":true}`). No cooperation beyond dev mode.

**(b)** Three facts no console message and no index can produce, all measured:
1. the **attempted URL and the error object** of a failed navigation (`NavigationError(id: 2, url: '/claim/abc/details', error: TypeError: Failed to fetch dynamically imported module: …/src-V2AKDU4J.js)`);
2. `urlAfterRedirects` — the *actual* redirect outcome of one navigation (`url: '/'` → `urlAfterRedirects: '/home'`);
3. a **lazy load that began and never ended** — `RouteConfigLoadStart(path: 'claim')` with no matching `RouteConfigLoadEnd` before the error (measured sequence below). The console for that same navigation carried exactly one line, with no URL and no navigation id: `Failed to load resource: net::ERR_FAILED`.

**(c)** Cost and teardown: one closure invocation per event; measured volumes — **7 events** (redirect), **23 events** (`/contract/list`, first load), **3 events** (failed), **15 events** (wildcard-absorbed URL). `router.events` is a `Subject` (`eventsIsSubject: true`, `eventsHasReplay: false`), it never completes, and it lives as long as the Router, i.e. the page. Teardown is `subscription.unsubscribe()` and nothing else. Proven (see Teardown §1): after unsubscribing the router subscription, a further real navigation to `/complaint/list` appended **0** rows (`nav 45 → 45`) while `router.url` still changed.

**(d)** `no-navigation-in-window` — a navigation that completed before attach leaves no event, because the Subject has no replay. The partial compensation is one field deep and is itself a named absence: `router.lastSuccessfulNavigation` exists and is a **signal** (own keys `["toString","set","update","asReadonly"]`), and calling it after a whole session returned `{id: 1}` — the *last* successful navigation only, never the sequence, never a cancelled or failed one. So a late attach can say `cannot-tell: only-last-navigation` about anything earlier.

**(e)** Measured; see the Sequences section for the four verbatim runs.

### 2. `ApplicationRef.isStable` — (a)–(e)

**(a)** `const appRef = env.get(tokenOf('ApplicationRef')); appRef.isStable.subscribe(v => …)`. `ApplicationRef` has no published global; the token is the enabling call. In the portal's own chunk `isStable` is a getter over `PendingTasksInternal.hasPendingTasksObservable.pipe(map(pending => !pending))` (`@angular/core/fesm2022/_debug_node-chunk.mjs:13221-13223`), which is why it works zoneless.

**(b)** A fact neither console nor index has: **whether the app is still working after the router said the navigation ended.** Measured for `/complaint/create`: `NavigationEnd` at `t=47.0 ms`, `isStable → true` at `t=76.2 ms` — a 29 ms tail that no event in `Router.events` carries. It also fires on non-navigation work (any pending task), so it is the only stream here that is not about routing at all.

**(c)** Every pending-task count change emits. Measured: `[true, false, true]` for a single `appRef.tick()` (3 emissions, two of them in the same millisecond), and **2 emissions per navigation** (`{false at start, true at end}`) in three separate phases. Teardown `unsubscribe()`; proven — after unsubscribe, the teardown navigation produced `stable 7 → 7`.

**(d)** `stability-before-attach` — a hot, non-replaying observable: nothing before attach is recoverable, and `isStable` is not a log. `whenStable()` exists (`typeof appRef.whenStable === 'function'`) and resolves only *forward*, so it cannot answer "was it stable when X happened".

**(e)** Reachable and emitting on the zoneless portal; measured above.

### 3. `NgZone.onStable` / `onMicrotaskEmpty` — (a)–(e), and the `NG0201` correction

**(a)** `const zone = env.get(tokenOf('NgZone'))` → **`NoopNgZone`** on the portal. Then `zone.onStable.subscribe(…)` and `zone.onMicrotaskEmpty.subscribe(…)` both exist as real `EventEmitter`s (`isEventEmitter: true`).

**(b)** On a **zoneful** app this is the macrotask-free settle point per zone turn, and it is the one stream that reports *zone turns* rather than Angular work. On a zoneless app it reports nothing, so the honest fact it yields here is the negative: `NgZone` is not the clock.

**(c)** Cost is per zone turn (zoneful). Teardown `unsubscribe()`.

**(d)** `no-zone-emission` — the token covers both the zoneless case (no emitter ever fires) and a window in which no zone turn settled. It never degrades into "the app was idle".

**(e)** **Measured, and it is not `NG0201`:** with a tick fired between subscribe and read, over 600 ms — `{"ctor":"NoopNgZone","isStableFlag":true,"hasPendingMicrotasks":false,"emissions":{"onStable":0,"onMicrotaskEmpty":0,"onUnstable":0}}`. `NG0201` (code `-201`) was measured where it actually lives: `platform.get(Router)` and `platform.get(ApplicationRef)`. A **zoneful** page is `undetermined` — the portal is zoneless and the fixtures are zoneless, so no zoneful `onStable` emission was measured anywhere in this spike. The upstream claim that a zoneful `ZoneNgZone` emits is not restated as measured.

Note for the agent's own code: `extension/agent-main.js:137-159` resolves the zone with `injector.get('NgZone')` (a **string**) and then `injector.get(globalThis.NgZone)`. On this portal both throw and `detectZone` falls through to `globalThis.Zone` (`:158`) — which is `undefined` — and returns `'noop'`. The answer is right, the route is not: the token route above is the one that actually reads `NoopNgZone`.

### 4. Change-detection cycle boundaries (`ɵsetProfiler` pairs) — (a)–(e)

**(a)** `const remover = ng.ɵsetProfiler((event, instance, eventFn) => …)`. Already used by M040 (`extension/agent-main.js:520-525,555-558`).

**(b)** Cycle boundaries with **distinct pairs** for the tick and its synchronous phase, which is more than the M040 frame records. Ids read from the portal's own chunk (`@angular/core/fesm2022/_debug_node-chunk.mjs:31-59`): `ChangeDetectionStart 12 / ChangeDetectionEnd 13`, `ChangeDetectionSyncStart 14 / ChangeDetectionSyncEnd 15`, `ComponentStart 18 / ComponentEnd 19`, `TemplateUpdate 2/3`, `LifecycleHook 4/5`, `HostBindingsUpdate 24/25`, `DynamicComponent 22/23`. A real navigation produced the nested order `… 12, 14, 15, 13 …` — a sync-CD interval inside a CD interval, which the shipped narrator does not have a row for.

**(c)** The API is an **additive callback list**, not a single slot (`_debug_node-chunk.mjs:136-154`), and each subscriber pays one synchronous call per profiler event. Measured cost: **2 events per idle `tick()`** and **1,670 events for one lazy navigation** (23 router events, one subscriber). Teardown is the returned remover: two subscribers installed (`a`, `b`) both received 2 events on one tick; `removerA()` left `a` at 2 while `b` kept receiving (4 total). That is the coexistence proof for the extension's own agent subscriber too, and it is why **`ɵsetProfiler(null)` must never be called** — it clears every callback (`profilerCallbacks.length = 0`), the extension's included (the AGENTS gotcha). The re-measured per-callback *overhead* was below this probe's resolution (median `tick()` duration `0 ms` with 0, 1 and 20 subscribers; in-callback time rounded to `0 ms` over 30 events), so no µs figure is claimed.

**(d)** `no-covering-profiler-record` — the token already published for `sanitizer-triage` (`extension/sanitizer-triage.js:109`) fits exactly: a cycle that closed before attach leaves no record, and a start recorded with no matching end is not walked backwards onto an earlier start (the rule `performance-narrator.js:289-293` already enforces).

**(e)** Reachable; ids and counts measured above.

### 5. `PerformanceObserver` long tasks — (a)–(e)

**(a)** No injector: `new PerformanceObserver(cb).observe({ type: 'longtask', buffered: true })`. `buffered: true` is accepted on this Chrome (`bufferedOptionResult: "ok"`).

**(b)** A fact the framework never reports and no sourcemap can: **the page's main thread was blocked for 120 ms between these two clock times**, independent of whether Angular was doing anything. Measured both ways: a 120 ms busy loop *before* the observer existed was delivered **1** entry from the buffer at attach; a second one after attach was delivered live (**1**). `performance.getEntriesByType('longtask')` returns **0** throughout — the entries exist for an observer's buffer but are not in the queryable timeline, so an extension that only polls `getEntriesByType` will see nothing at all.

**(c)** Browser-side, shared, no app cost. Teardown `observer.disconnect()`.

**(d)** `longtask-buffer-evicted` — the buffer is bounded and pre-attach entries can be gone; a live observer also cannot see a task that ran while no observer was attached.

**(e)** Reachable and emitting; measured above.

### 6. `PerformanceObserver` resource timing — (a)–(e)

**(a)** `new PerformanceObserver(cb).observe({ type: 'resource', buffered: true })`, or `performance.getEntriesByType('resource')` without any observer.

**(b)** The strongest cross-cutting fact in this survey: **which URL a navigation waited on, how long it took, and which URL failed.** At attach, alone, it handed over the whole page-load history including `main.js`, `styles.css`, `client`, `env.mjs` with `start`, `duration`, `initiatorType` and `transferSize`. On a navigation, it is the only stream that names the chunk behind a `NavigationError` by URL and size.

**(c)** Nothing paid by the app; the buffer is shared and bounded. Measured bound: **250 entries** — after 300 further requests the count stayed at 250, the **oldest kept** (`firstStart 13 ms`, page load) and the **newest dropped**: only **169 of 300** arrived (`firstStart 13`, `lastStart 3245`). `performance.setResourceTimingBufferSize` is present (`function`) and is the only way to keep more. Teardown `disconnect()`.

**(d)** `resource-buffer-full` — an entry that was never recorded (buffer already full, and we did not raise it) cannot be read later; this is distinct from "the resource never loaded".

**(e)** Reachable, with 62 pre-attach entries delivered at attach and the 250-entry cap measured.

### 7. Own-built stream: `ApplicationRef.afterTick` — (a)–(e)

**(a)** `env.get(tokenOf('ApplicationRef')).afterTick.subscribe(…)` — a `Subject` on the instance (`_debug_node-chunk.mjs:13211`, ticked at `:13327`). No provider, no primitive, no new API.

**(b)** A tick clock independent of the profiler: it lets a surface answer "**this tick happened but recorded no work**", which the profiler frame cannot distinguish from "no tick at all". Measured 2 emissions for 2 deliberate ticks.

**(c)** 1 emission per tick, nothing else. Teardown `unsubscribe()`; proven — a third tick after unsubscribe left the count at 2 (`stopped: true`).

**(d)** `no-tick-in-window` — Subject, no replay: a tick before attach is invisible, and `afterTick` gives no ordering against router events that happened earlier.

**(e)** Reachable; measured above.

### 8. Own-built stream: sampled signal-graph epochs — (a)–(e)

**(a)** `ng.ɵgetSignalGraph(ng.getInjector(host))` on an interval or `rAF`. Nothing is installed; it is a pull.

**(b)** *Change over time*, which no snapshot join has: a node whose `epoch` advanced between two reads re-evaluated in that window. Measured node shapes carry `{kind,label,epoch}`. Sizes and costs, measured per component on `/contract/list`:

```
_SidebarComponent            28 nodes / 24 edges  0.2 ms   {template 1, linkedSignal 8, signal 14, effect 3, computed 2}
_ListComponent               16 / 16             0.0 ms   {template 1, computed 6, linkedSignal 2, signal 6, effect 1}
_HeaderComponent              4 /  3             0.0 ms   {template 1, signal 3}
_ContractStatusChipComponent 13 / 12             0.1 ms   {template 1, signal 7, computed 4, effect 1}   (3 instances, same shape)
root component injector       9 /  9
app environment injector      4 /  2             0.1 ms   {effect 2, signal 2}
```

The last row matters: **the app environment injector's graph is 4 nodes** (the app's own `theme`/`csp` signals and two effects). A sampler pointed at the env injector, as the panel's `signals(host)` helper would be if given one injector per app, sees almost nothing; the useful graph is per component.

**(c)** Fully paid by us, not the app: ~0.1 ms per component per sample, i.e. ~6 ms/s per component at 60 Hz by arithmetic from the measured read times. Teardown is `clearInterval`/`cancelAnimationFrame`; there is no subscription to leak but there is a timer to leak, and the project's own history says that is exactly the failure mode (`extension/agent-main.js:419-446` carries a whole `stopCompanionRecheck`/finite-attempts mechanism for one such timer).

**(d)** `between-samples` — a write between two reads is invisible, and a write during a sample is indistinguishable from one just before it. This is the honest limit that keeps a sampled stream from claiming causality.

**(e)** Reachable; sizes and read costs measured above.

## Sequences observed on the zoneless portal (question e)

All sequences are one `run` each, on the portal, with one subscriber of each stream attached. Times are `performance.now()` at receipt, in ms from attach; the `/contract/list` block below is rebased to its own first event (which was recorded at `706.1` ms from attach) so the durations read directly. Ids are `EventType` from the portal's own router chunk (`@angular/router/fesm2022/_router-chunk.mjs:1827-1844`): `0 NavigationStart, 1 NavigationEnd, 2 NavigationCancel, 3 NavigationError, 4 RoutesRecognized, 5 ResolveStart, 6 ResolveEnd, 7 GuardsCheckStart, 8 GuardsCheckEnd, 9 RouteConfigLoadStart, 10 RouteConfigLoadEnd, 11 ChildActivationStart, 12 ChildActivationEnd, 13 ActivationStart, 14 ActivationEnd, 15 Scroll, 16 NavigationSkipped`.

### One navigation, lazy feature, first load — `router.navigateByUrl('/contract/list')`

23 events. `NavigationEnd` 706.1 → 831.9 (125.8 ms), of which `RouteConfigLoadEnd(path: 'list')` alone is 714.1 → 828.6 (114.5 ms) — a number only the stream carries.

```
   0    0 NavigationStart          url '/contract/list'                                    id 3
   0.4  9 RouteConfigLoadStart     path 'contract'
   6.4 10 RouteConfigLoadEnd       path 'contract'
   7.2  4 RoutesRecognized         url '/contract/list'  urlAfterRedirects '/contract/list'  id 3
   7.3  7 GuardsCheckStart         id 3
   7.4 11 ChildActivationStart    path ''
   7.5 13 ActivationStart         path 'contract'
   7.5 11 ChildActivationStart    path 'contract'
   7.5 13 ActivationStart         path ''
   7.5 11 ChildActivationStart    path ''
   7.5 13 ActivationStart         path 'list'
   7.8  8 GuardsCheckEnd           id 3
   7.8  5 ResolveStart             id 3
   8.0  6 ResolveEnd               id 3
   8.0  9 RouteConfigLoadStart     path 'list'
 122.5 10 RouteConfigLoadEnd       path 'list'          ← 114.5 ms lazy child load
 125.7 14 ActivationEnd          path 'list'
 125.7 12 ChildActivationEnd     path ''
 125.7 14 ActivationEnd          path ''
 125.7 12 ChildActivationEnd     path 'contract'
 125.7 14 ActivationEnd          path 'contract'
 125.7 12 ChildActivationEnd     path ''
 125.8  1 NavigationEnd           url '/contract/list'  urlAfterRedirects '/contract/list'  id 3
```

Side streams in the same window: `isStable` `[false @705.9, true @885.2]` — **the `true` arrives 53 ms after `NavigationEnd`**; `afterTick` 2 emissions (`848.7`, `883.7`); `ɵsetProfiler` **1,670** events including `… 12, 14, 18, 2, 3, …, 24, 25, 19, 15, 13` — the CD pair `12/13` with the sync-CD pair `14/15` nested inside it.

### One redirect — `router.navigateByUrl('/')` (root route is `redirectTo: 'home'`)

7 events. **No `NavigationCancel`**: the redirect is folded into one navigation and is visible only through `urlAfterRedirects`.

```
0.8  0 NavigationStart      url '/'                                          id 2
1.2  4 RoutesRecognized     url '/'  urlAfterRedirects '/home'  id 2   (state: Route(''){Route('home','home')})
1.3  7 GuardsCheckStart     url '/'  urlAfterRedirects '/home'   id 2
1.4  8 GuardsCheckEnd       url '/'  urlAfterRedirects '/home'   id 2  shouldActivate: true
1.7 14 ActivationEnd        path 'home'
1.7 12 ChildActivationEnd   path ''
1.8  1 NavigationEnd        url '/'  urlAfterRedirects '/home'   id 2
```

`isStable` `[false @0.7, true @2.1]`; `ɵsetProfiler` **0 events** and `afterTick` **0 emissions** — a redirect onto the page you are already on ticks nothing, which is why a cycle-based story cannot explain it. This is a measured `cannot-tell` case for row 4, not a gap in the probe.

### One cancelled navigation — two navigations in flight (`/customer/list` then `/complaint/list`)

`NavigationCancel` is type **2**, `code 1` = `SupersededByNewNavigation` (`_router-chunk.mjs:1877-1882`), reason measured verbatim:

```
7.9  2 NavigationCancel  id 2  url '/customer/list'  code 1
     reason 'Navigation ID 2 is not equal to the current navigation id 3'
7.9  0 NavigationStart   id 3  url '/complaint/list'
```

The cancelled navigation had already emitted 15 events — `NavigationStart`, `RouteConfigLoadStart/End(customer)`, `RoutesRecognized`, `GuardsCheckStart/End`, three `ChildActivationStart`/`ActivationStart` pairs, `ResolveStart/End` and `RouteConfigLoadStart(list)` — before the cancel; `router.navigateByUrl('/customer/list')` resolved **`false`**, the superseding call resolved `true`. Note that a cancel is not an error: nothing is logged to the console for it, so a console join cannot see a superseded navigation at all.

### One FAILED navigation — a lazy module that could not be fetched

Producing a genuine `NavigationError` on this portal needed one measured detour, recorded because it is part of the answer `(e)`:

1. **No URL fails.** Every unmatched URL is absorbed by the portal's root `**` route: `/claim/no-such-route-xyz`, `/contract/no-such`, `/contract/list/extra`, `/claim/abc/details/extra`, `/customer/123/details/extra`, `/contract/123/edit/x` all emitted `RoutesRecognized` with `state: Route(url:'…', path:'**')` and ended in **`NavigationEnd`** (15, 15, 11, 13, 11, 11 events respectively). There are no guards that reject (the `canMatch` guards return the feature-flag boolean, `libs/shared/data-access/src/lib/feature-flags.guard.ts:6-14`) and no resolvers.
2. **Blocking the dev-server's `@ng/component` hint does not fail the nav** (`blockedCount: 1`, navigation still `NavigationEnd`) — measured twice, for `feature-create` and for `customer/feature-list`.
3. **Aborting the lazy chunk itself does.** With the HTTP cache disabled over CDP (`Network.setCacheDisabled`) and every request aborted after attach, `router.navigateByUrl('/claim/abc/details')` produced the real thing — 3 events:

```
0.9  0 NavigationStart       url '/claim/abc/details'  id 2
1.3  9 RouteConfigLoadStart  path 'claim'                    ← no RouteConfigLoadEnd, ever
5.4  3 NavigationError       url '/claim/abc/details'  id 2
     error = TypeError: Failed to fetch dynamically imported module: http://localhost:4507/src-V2AKDU4J.js
     text  = NavigationError(id: 2, url: '/claim/abc/details', error: TypeError: Failed to fetch dynamically imported module: …)
```

and `router.navigateByUrl` **rejected** with the same `TypeError`; `router.url` stayed `/home`; `lastSuccessfulNavigation()` was still `{id: 1}`; `isStable` `[true @0.4, false @0.6, true @5.6]`; `afterTick` 0 emissions (no tick for a navigation that died at recognition).

**The console, for the same navigation, carried exactly one line** — `{"type":"error","text":"Failed to load resource: net::ERR_FAILED"}` — with **no URL, no navigation id, no phase**. That contrast is the whole case for row 1 and row 6: the stream says *which* URL, *which* navigation, and *where in the pipeline* it died; the console message says none of the three.

## Which of the sixteen shipped features would gain

Rows are the matrix's rows (`.project/research/capability-dependency-matrix.md` §1). "Gain" is stated as the specific new fact, and each is backed by a measurement above.

| # | Feature | Gains from | The specific gain | Drops a required provider? |
| - | ------- | ---------- | ----------------- | -------------------------- |
| 1 | `lint-core` | none | It reads message text only and its input is already captured independently of any stream; a stream adds nothing to a text join. | no (needs none) |
| 2 | `lint-router` | **router.events**, **resource** | Today it joins a *captured console message* plus a handed route list (`ext/router-diagnostic.js:5-6,52,66`). A stream supplies the attempted URL and the error object **without any console message** (measured: the console line had no URL), plus the class a console cannot show — `RouteConfigLoadStart` with no `RouteConfigLoadEnd`, and the failed chunk's own URL/size from resource timing. Wildcard absorption becomes a `finding` ("this URL matched `**`") instead of an absence. | no (needs none) |
| 3 | `lint-legacy` | none | Its fact is `ɵcmp.standalone` (`ext/legacy-structure.js:27`); no stream carries metadata. | no |
| 4 | `field-state` | none | Live form state is handed to it; no runtime stream in this survey carries field validity. | no |
| 5 | `di-doctor` | none (weak: `afterTick`) | Injector reads are already a live read. `afterTick` would only let it re-read on a defined clock instead of on request. | no |
| 6 | `error-explainer` | **router.events** (strongest), **profiler cycles** | It is the surface that most needs row 1: errors that never reach `console.error` — a failed navigation is measured to reach the console only as a URL-less `ERR_FAILED` — become explainable with the attempted URL + the error object. Cycle boundaries add *where in a tick* the error surfaced. Component attribution still needs `getOwningComponent` (`mw/error-capture.ts:39-53`), unchanged. | no (its `provider` is already `no`) |
| 7 | `stale-view` | **sampled graph** (weak) | Its scan is a snapshot of `ɵgetSignalGraph` + `debuggableFnSource`. A sampler adds only "the epoch moved during window X", so a stale view can be dated — at the cost of `between-samples`. | no |
| 8 | `interop` | **sampled graph** (weak) | Same shape: kept nodes are graph nodes by label; a sampler dates when a kept node re-evaluated, nothing more. | no |
| 9 | `redirect-chain` | **router.events** | Today it walks the static config and **stops at `loadChildren`** (`ext/redirect-chain.js:55-58`). Measured, the router resolves past that boundary: `url '/'` → `urlAfterRedirects '/home'`. So a stream turns "the config says redirect" into "this navigation redirected to this URL, in this many ms", and it can finally say *which* hop was taken when several are configured. | no (needs none) |
| 10 | `sanitizer` | **profiler cycles** (already), `resource` (weak) | It already joins a warning's clock time to a profiler window (`ext/sanitizer-triage.js:4,109`); the sync-CD pair `14/15` gives a tighter window than the CD pair alone, which can turn a `no-covering-profiler-record` into a hit. | no |
| 11 | `signal-provenance` | **sampled graph** | Edges are already read; a sampler adds the producer's *epoch movement* during a navigation, i.e. "this consumer was re-evaluated because that producer advanced in this window". | no |
| 12 | `after-render` | **profiler cycles** + **`afterTick`** + **`isStable`** | `afterTick` is a cheaper cycle clock than the profiler (1 emission/tick vs 2+ events/tick, measured) and separates "tick with no after-render event" from "no tick"; `isStable` puts the settle point of all work 29–53 ms after `NavigationEnd` (measured), a boundary no after-render event has. | no |
| 13 | `linked-state` | none (weak: sampled graph) | The finding is two stored values' equality; epochs add a timestamp, not a cause. | no |
| 14 | `render-phase` | **profiler cycles** (sync pair) | Its named absence is that the profiler has no *effect* event (`ext/render-phase.js:107`). The sync-CD pair does not add one, so the absence stands — but `ChangeDetectionSyncStart/End 14/15` do give a phase boundary the current model lacks. | no |
| 15 | `performance-narrator` | **router.events** + **profiler cycles** + **resource** + **longtask** + **isStable** (largest total gain) | `narrate(frame)` reads one profiler frame and has no navigation identity and no wall clock outside profiler receipts (`extension/performance-narrator.js:255-257`). Together the streams give: a navigation bracket (`706.1 → 831.9 ms`), the lazy load that dominated it (`114.5 ms`), the resource that could have caused it (`main.js 34.7 ms`, `client 92.4 ms`, a failed chunk by URL), a long task on the main thread inside the same window, and the settle point after `NavigationEnd`. That is a narrative, not a table of intervals. | no |
| 16 | `companion / opt-in` | none | Its evidence is a global table written by the app's own provider. No stream observes a provider's effect; presence is already detection (`ext/agent-main.js:245-302`). | no — and no stream can replace an explicit opt-in contract |

**Would any feature drop a required provider? No, and the reason is worth stating precisely.**

- 9 of the 10 `provider: required` rows are one requirement: *the app must not run a zoneful `NgZone`* (`ext/agent-main.js:547-553`). That is the agent's **own refusal**, not a limit of any stream in this table: `ApplicationRef.isStable` is `PendingTasks`-backed and zone-agnostic (`_debug_node-chunk.mjs:13221-13223`), `ɵsetProfiler` is zone-agnostic, `Router.events` and `PerformanceObserver` never touch the zone. So a **new** surface built only on rows 1, 2, 5, 6 of this table would not need the zone arrangement at all — measured only on a zoneless page, so the zoneful half is `undetermined`.
- But **none of the 9 drops it today**, because each of those nine also reads something this survey did not find a stream for: the signal graph (`stale-view`, `interop`, `signal-provenance`, `linked-state`, `render-phase`), or profiler records whose *shape* on a zoneful page was never measured (`after-render`, `sanitizer`, `performance-narrator`, `di-doctor`). Dropping the gate for them would need a zoneful measurement, which this spike does not have.
- The 10th `provider` row is row 16's own opt-in (`provideAiDevTools()`, `packages/ai-devtools-companion/src/index.ts:25-29`). No stream replaces it: it is a contract, not an observation.

## `cannot-tell` vocabulary added by this spike

Grammar as shipped: `{ state: 'cannot-tell', reason: '<lower-hyphen-token>' }` (`ext/lint-core.js:86-89`, `ext/onpush-readiness.js:59`, `ext/redirect-chain.js:19`).

| Token | Slot | Producing condition (all must hold) | Never instead |
| ----- | ---- | ----------------------------------- | ------------- |
| `no-navigation-in-window` | router row reason | No `Router.events` event was recorded for the navigation the finding is about, and the stream was attached after that navigation's `NavigationEnd` (or after its error). | "no navigation happened" |
| `only-last-navigation` | router row reason | The reader can name *one* navigation only, from `router.lastSuccessfulNavigation()` — i.e. the question is about an earlier one, or about a cancelled/failed one. | replaying a sequence from one field |
| `stability-before-attach` | stability row reason | The `isStable` subscription was attached after the work in question; the observable has no replay and `whenStable()` resolves forward only. | "the app was stable then" |
| `no-zone-emission` | zone row reason | The subscribed emitters produced no emission in the window **and** the injector's `NgZone` is a `NoopNgZone` (measured `0` for all three emitters) — or, on a zoneful app, no zone turn settled in the window. | "the app was idle" |
| `no-covering-profiler-record` | profiler row reason | *(existing token, `ext/sanitizer-triage.js:109`)* No recorded profiler event covers the moment. | any nearest cycle |
| `longtask-buffer-evicted` | long-task row reason | The long task predates attach and is not in the buffer, or ran while no observer was attached. | "the main thread was free" |
| `resource-buffer-full` | resource row reason | The buffer held 250 entries when the resource in question completed and `setResourceTimingBufferSize` was not raised, so the entry was dropped (measured: 169 of 300 kept). | "the resource never loaded" |
| `no-tick-in-window` | after-tick row reason | `afterTick` recorded no emission for the window the finding claims. | "no change detection ran" |
| `between-samples` | sampled-graph row reason | The write in question falls between two graph reads, so an unchanged epoch proves nothing and a changed epoch cannot be dated more precisely than the bracket. | "the signal did not change" |

Two conditions on the set: every one names one absence and nothing else (no construct, no cause), and the router tokens are per-navigation while the platform tokens are per-load — the same split the shipped grammar already uses (`ext/field-state.js:50` per read vs `ext/sanitizer-triage.js:4-109` per load).

## What I could not measure, and why

1. **`NgZone.onStable` / `onMicrotaskEmpty` on a zoneful page.** The portal is zoneless (`typeof Zone === "undefined"`, no `zone.js` in `package.json`), the counter and SSR fixtures are zoneless, and the zoneful portal worktree is retired (`AGENTS.md:229-247`). Measured instead: `NoopNgZone` resolves and emits nothing. The zoneful row is `undetermined`, and the "zoneful only" claim is **code-read, not measured** here.
2. **A `NavigationError` produced by the app's own routing.** No URL fails on this portal (root `**`), no guard rejects or throws, and no resolver exists. The error was produced by failing a lazy chunk fetch at the network layer with the cache disabled — a real production failure mode, declared because it needed browser-side interference.
3. **`NavigationSkipped` (type 16) and `Scroll` (type 15).** Neither appeared in any run: the portal sets no `onSameUrlNavigation` skip path that was exercised, and no `anchorScrolling`/`scrollPositionRestoration` behaviour was triggered.
4. **The extension's own profiler subscriber, seen directly.** Two of *my* subscribers were proven to coexist and to be removable individually, and the extension is loaded on the instance (`up` reports extension id `mgkfgkdgobahfcgkdlokpoehblpbkfok`), but its `angular-ai:state` event had already fired before my listener attached (`extensionStateEvents: []`), so "the extension is among the subscribers on this page" is `undetermined`, not proven.
5. **A per-callback microsecond cost for `ɵsetProfiler`.** Tick duration was `0 ms` at this probe's resolution with 0, 1 and 20 subscribers; only the event counts (2 per idle tick, 1,670 per lazy navigation) are claimed.
6. **Whether a zoneful page changes the profiler's cycle shape.** Not measured, and it is the one measurement that would let rows 12, 14, 15 narrow their gate.
7. **An incidental uncaught page error.** `"Invalid value used as weak map key"` appeared once during the aborted-request run. It was not attributed to any of our calls and is recorded as seen, not explained.

## Teardown evidence — what was stopped

1. **Every subscription, then a real navigation** (`probe B`, one run): after `unsubscribe()` on `router.events`, `isStable` and `afterTick`, and after calling the remover `ɵsetProfiler` returned, a further `router.navigateByUrl('/complaint/list')` **succeeded** (`navigatedTo: "/complaint/list"`) and appended nothing:

```
before {"nav":45,"ticks":3,"stable":7,"prof":1972}
after  {"nav":45,"ticks":3,"stable":7,"prof":1972}
noneRecorded true
```

2. **Per-subscriber removal, not a global clear** (`probe A3`): `removerA()` stopped subscriber A (`aIdsAfterRemoval` stayed 2) while subscriber B kept receiving (`bIdsTotal 4`). `ɵsetProfiler(null)` was never called — it would have cleared every callback including the extension's (`_debug_node-chunk.mjs:144-153`).
3. **Own-built streams:** `afterTick` unsubscribe proven (`emissions 2`, `totalAfterUnsubscribe 2`, `stopped true`); every `PerformanceObserver` was `disconnect()`ed inside the probe; the two timers a sampler would own were never created (the sampler was priced, not installed).
4. **Browser:** `chrome-beta-nano` was started for this spike only (it was not running; `chrome-beta-gemma4` was left untouched) and has been stopped with `control-ai-browsers down chrome-beta-nano` → state file removed, port 9333 free.
5. **Server:** the portal flow was **already dead** when this spike began (a stale state file from 16:56 with nothing listening). The stale record was torn down, the portal was then served fresh for the spike, and has been stopped with `control-angular-dev-app down --target portal` → API process, dev-server process and the recorded tree stopped, `:4507` and `:3000` released.
6. **No repository writes outside this file.** The browser evidence directory and every probe script live in session scratch; `.project/research/raw/s13` was created by the `--evidence` flag, copied to scratch, and removed. `git status` shows only the untracked `s13-answer.md` from this spike.

## Verdict

**answered**, with one row `undetermined`.

- **Seven of eight streams are reachable with no application cooperation**, all through one injector route that this spike pinned down: `ng.getInjector` → `ɵgetInjectorResolutionPath` → the **second** environment injector (the app's, 90 provider records) → token from `ɵgetInjectorProviders` → `.get(token)`. `Router` has a shorter path (`ɵgetRouterInstance`), and `PerformanceObserver` needs no injector at all.
- **`NgZone` is not a stream on a zoneless app.** It resolves to `NoopNgZone` and emits nothing (`0/0/0`), and it is the platform injector, not `NgZone`, that answers `NG0201` (code `-201`) for app-level tokens.
- **The streams add four classes of fact the shipped joins cannot produce:** (i) the attempted URL plus the error object of a failed navigation, with the phase and the un-ended lazy load — the console for the same event carried one URL-less line; (ii) the *actual* redirect outcome of a navigation, past a `loadChildren` boundary the static walk stops at; (iii) the navigation's wall-clock bracket, its dominant lazy load, the resource that could have caused it and the settle point after it ends; (iv) `afterTick`'s tick clock, which separates "a tick with no work" from "no tick".
- **No feature drops a required provider.** Nine of the ten `provider` requirements are one policy refusal (zoneless), and while nothing in this table *needs* that arrangement, none of the nine can drop it on the evidence available: five still need the signal graph (which was not surveyed as a stream because it has none — only snapshots) and four still need profiler records whose zoneful shape was never measured. The tenth is the companion's own opt-in contract.

## What this settles

- The **runtime-stream class the capability matrix lacked** now has a measured inventory: which streams exist, which are reachable, what each costs, and what each cannot see. Any proposal that needs "navigation-level" or "timing-level" facts can be costed from this table instead of re-spiked.
- The **injector route is settled as code, not folklore**: `ɵgetInjectorProviders(...).token` + the *second* environment injector is the only route that reaches `Router`, `ApplicationRef` and `NgZone` from `window.ng` alone, and it is written down with the two traps that make the naive version return "not found". The extension's own `detectZone` (`extension/agent-main.js:137-159`) does not use it and reaches its answer by fallback.
- **`error-explainer` and `lint-router` have a provider-free path to a new finding class** ("a navigation that failed, with its URL, its phase and its error object"), producible with zero app cooperation — which is the strongest single candidate for the next milestone in this programme.
- The **teardown contract for a stream subscriber** is settled by measurement, not convention: per-subscriber removers, per-subscription `unsubscribe`, `disconnect`, `clearInterval`, and `ɵsetProfiler(null)` named as forbidden.

## What this does not settle

- **Whether a zoneful app behaves as the code says.** The zone gate could narrow for stream-only surfaces, and rows 12/14/15 could too, but that needs one measurement on a zoneful page — which this target cannot produce.
- **Anything about signal-graph *writes* as a stream.** There is no subscription API: `ɵgetSignalGraph` is a snapshot per injector (`4` nodes for the app env injector, `28` for the largest component measured), so "signal-graph writes" exist only as a sampled epoch diff, with `between-samples` as its permanent limit. A true write hook would need either a new `ɵ` global or app cooperation.
- **Whether the console join can be retired anywhere.** This spike shows a stream *beats* the console for navigation failures; it does not show that any shipped join can drop its console input, because `lint-core`, `sanitizer` and `error-explainer` read message *text* that no stream carries.
- **Component attribution for a navigation event.** `Router.events` carries no component identity and the profiler's `ChangeDetection` pair carries none either (`null` instances measured, matching M040); "which component was mounted when this navigation failed" is still a DOM/graph read, not a stream fact.
- **Cost under load.** The volumes here (1,670 profiler events per lazy navigation, 23 router events) are one warm dev build on one machine; no production-build or cold-start figure is claimed.
