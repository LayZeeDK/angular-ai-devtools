# Filing ledger

Drafts for Lars to file if and when he chooses. Claude files nothing.

## 1. angular/angular: `angular:di_graph` AI tool creates a `ViewContainerRef` on every component host, after which `ng.ɵgetSignalGraph` loses the template consumer

Status: draft, not filed. Found 2026-10-11 during spike S2 (`docs/feature-proposals.md` section 7).

**Versions:** `@angular/core` 22.2.2 (fresh `ng new`, dev server, zoneless default), Edge Dev 157 on Windows 11 arm64. Source read on the `22.2.x` branch.

**What happens:** the in-page AI tool `angular:di_graph` (`packages/core/src/debug/ai/di_graph.ts`, registered through `devtoolstooldiscovery` by `registerAiTools()` in dev mode) serializes every element injector with `serializeInjector()`. That function calls `injector.get(record.token, null, {optional: true, self: true})` for every record from `getInjectorProviders()` (`packages/core/src/debug/ai/serialized_di_graph.ts`). On a component host, the records include `ViewContainerRef` and `ChangeDetectorRef`. Getting `ViewContainerRef` creates a view container at the host as a side effect. Afterwards, `ng.ɵgetSignalGraph(ng.getInjector(host))` (and so the `angular:signal_graph` tool) returns only the effects and their producers. The `template` node and every signal it reads are gone. The app itself keeps rendering and updating.

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

Measured per token: `Injector`, `DestroyRef`, `ElementRef`, `Renderer2` leave the graph intact; `ViewContainerRef` breaks it.

**Expected:** a read-only debugging tool does not change the view structure, and reading the signal graph works whether or not a `ViewContainerRef` was ever injected at the host. That second point matters on its own: a component whose host has an injected `ViewContainerRef` for real app reasons probably shows the same missing template node (inferred, not tested).

**Possible fixes (inferred):** skip `ViewContainerRef`, `ChangeDetectorRef` and other node-injector special tokens in `serializeInjector`, or report them without calling `get`; and make the signal-graph lookup unwrap a view container at the host to reach the component view.

**Evidence:** spike app `spikes/ng222-app` in `D:\projects\sandbox\angular-ai-devtools`; probe results in `research/05-spikes.md`.
