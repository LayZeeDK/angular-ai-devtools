# Evidence — stack

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: stack
Questions assigned: Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation?

## Finding: N24 stale-view detection is already provable on the counter fixture

- **Claim**: On `spikes/ng222-app`, a temporary `timer(300).subscribe(() => (this.plain = 'after'))` with `{{ plain }}` in the template left the DOM showing `before` after 1.5 s while the instance held `after`; an unrelated click then rendered `after`. The regex over the selected component's template node `debuggableFn` found `subscribe(() => (this.plain =` and `ng.isSignal(cmp.plain)` was false.
- **Source**: `docs/feature-proposals.md:793` (citing `research/raw/stale-view-counter.json`, commit `13652e0`)
- **Confidence**: high
- **Why it matters here**: N24's core detection (plain field written in a `subscribe` callback in a zoneless app) is measured, not aspirational, on the retained counter fixture; no new Angular API is required.

## Finding: N24's source-text scan is the same heuristic already measured for N2

- **Claim**: Each effect node keeps `debuggableFn`, whose source text is e.g. `() => this.lastLogged.set(this.count())`; a scan for `.<name>.set(` / `.<name>.update(` found `lastLogged.set`. The scan must read `ng.ɵgetSignalGraph` directly because `angular:signal_graph` strips `debuggableFn`. `debuggableFn` on non-computed nodes exists only from Angular 22.1.3.
- **Source**: `docs/feature-proposals.md:569, 799, 788`
- **Confidence**: high
- **Why it matters here**: N24 reuses the N2 write-scan machinery (already designed and measured on the counter) rather than needing a new tracer; the 22.1.3 gate is shared.

## Finding: N24 limits are real and need new instrumentation beyond the regex

- **Claim**: Writes through a helper method, through another object, or in minified code are not seen by the regex; whether the template actually reads the field is not checked; the finding is therefore worded "the template may show a stale value". Scanning every component on a page runs in a worker.
- **Source**: `docs/feature-proposals.md:795, 798`
- **Confidence**: medium
- **Why it matters here**: The measured detection covers only direct `this.<field> =` inside `subscribe`; generalizing (or accepting the limit) is implementation work, and the per-page scan needs worker placement not yet built.

## Finding: N25 interop node shapes are measured on the portal fixture

- **Claim**: On the portal's `/claim/create`, `toSignal(this.#contracts$)` appears as a `computed` labelled `toSignal.source` (value an array of 20) with producer `signal` labelled `toSignal.state`; the facade's `toObservable` appears as an effect with an empty label whose `debuggableFn` contains `subject.error` and which reads `computed:contracts -> signal:#state`. The interop APIs are public `@publicApi` in 22.2.
- **Source**: `docs/feature-proposals.md:804` (citing `research/raw/tosignal-node-portal.json`, probe `spikes/probes/tosignal-node.js`)
- **Confidence**: high
- **Why it matters here**: N25 can identify interop nodes and their direct producers/consumers from `ng.ɵgetSignalGraph` alone; no app change is needed.

## Finding: N25 cannot cross the Observable boundary and needs instrumentation for field mapping

- **Claim**: No edge crosses the Observable, so N25 cannot say which Observable feeds a `toSignal`, what operator chain sits between a `toObservable` and a `toSignal`, or when the source emits. Labels are the library's, not the component field's name; mapping a node to its field by comparing values is inferred and untested. A one-hop slice around the template holding `toSignal.source` is 230 characters vs 13,878-25,838 for the whole graph.
- **Source**: `docs/feature-proposals.md:806, 809`
- **Confidence**: high
- **Why it matters here**: The "what is this node" half of N25 is provable; the "where does its value come from on the Observable side" half is a hard limit of `ng.ɵgetSignalGraph`, and field-to-node attribution needs a value-comparison heuristic that has not been measured.

## Finding: N25 keeps interop nodes that the N2 library filter drops

- **Claim**: `list_signals` and `signal_trace` drop library-internal nodes (about 100 of 107 nodes on the portal's `ng-journal-create` graph are Signal Forms internals) before building results, but N25's slice keeps `toSignal.*` nodes. Whether a node is library-internal is recognised by label or `debuggableFn` source and was not tested.
- **Source**: `docs/feature-proposals.md:439, 809`
- **Confidence**: medium
- **Why it matters here**: N25 needs an explicit keep-list for interop nodes on top of the existing library-internal filter; that classifier is currently unspecified.

## Finding: N4 has no product implementation today; all three pieces are new work

- **Claim**: No product code under `src/` or `extension/` hooks `window.onerror`, `unhandledrejection` or `console.error`, and no offline `angular.dev/errors` digest ships with the extension. The only owning-component mapping primitive available is the Tier 0 `ng.getOwningComponent`, which exists on the page in dev mode. N4 therefore requires a new page-agent ring buffer with hooks at `document_start`, component mapping via `ng.getOwningComponent`, and a bundled digest.
- **Source**: grep over `D:\projects\sandbox\angular-ai-devtools` for `unhandledrejection|window\.onerror` returned no matches under `src/` or `extension/`; `docs/feature-proposals.md:588-592`
- **Confidence**: high
- **Why it matters here**: N4 is the Tier 0 feature but none of its capture/mapping/digest plumbing exists yet; it is not a matter of wiring existing tools.

## Finding: The offline error digest source is measured and large

- **Claim**: The digest source is the Angular repo's `adev/src/content/reference/errors` on the 22.2.x branch: 61 `NG*.md` pages plus `overview.md` and `BUILD.bazel`, 95,095 bytes total (~24K tokens at 4 chars/token), largest page 4,758 bytes (~1,200 tokens). The repo `LICENSE` is MIT with a Google LLC copyright line. The whole set cannot fit a 7-9K window, so the shipped digest keeps one entry per code cut to at most 150 tokens.
- **Source**: `docs/feature-proposals.md:590`
- **Confidence**: high
- **Why it matters here**: The digest must be built and trimmed at extension build time; no such build step or bundled file exists today.

## Finding: N24 and N25 rest on Tier 1 functions that carry a support statement

- **Claim**: `ng.ɵgetSignalGraph` is one of the nine `ExternalCoreGlobalUtils` functions covered by Angular's "exists in long-lived public versions that DevTools must support" comment; `debuggableFn` is a field of its result, present on non-computed nodes from 22.1.3. N24 additionally needs Tier 0 `ng.getComponent` and `ng.isSignal`.
- **Source**: `docs/feature-proposals.md:217, 799, 810`
- **Confidence**: high
- **Why it matters here**: The detection stack is on the most stable Tier 1 surface available, so the remaining risk is the regex/source-text heuristic, not API removal.

## Assigned questions — answers

- Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation? → N24's stale-view detection is provable: on the counter fixture the template node's `debuggableFn` source contained `subscribe(() => (this.plain =` and `ng.isSignal(cmp.plain)` was false, and the DOM stayed stale for 1.5 s (measured, `docs/feature-proposals.md:793`). N25's interop nodes are provable on the portal fixture: `toSignal.source`/`toSignal.state` labels and an effect whose `debuggableFn` contains `subject.error` (measured, `docs/feature-proposals.md:804`). Both reuse the N2 `.<name>.set(`/`.update(` source-text scan over `ng.ɵgetSignalGraph` (stripped by `angular:signal_graph`), gated on Angular 22.1.3. What needs new instrumentation: (a) N24 generalization beyond direct `this.<field> =` inside `subscribe` (helper methods, other objects, minified code) plus a per-page worker scan and a "template may show a stale value" wording since template-read is unchecked; (b) N25 field-to-node attribution by value comparison (untested) and an explicit keep-list for interop nodes over the library-internal filter (unspecified); (c) N4 entirely — page-agent `window.onerror`/`unhandledrejection`/`console.error` hooks, a ring buffer, `ng.getOwningComponent` mapping, and a build-time-trimmed offline `angular.dev/errors` digest (61 pages, 95,095 bytes → ≤150 tokens per code), none of which exists in `src/` or `extension/` today.

## Dead ends

- Searching product code for console/error capture (`window.onerror`, `unhandledrejection`, `console.error` hooks) — found only docs, skills and spike probes; no implementation exists to reuse.
- Searching for an offline error digest or `angular.dev/errors` bundle in the repo — none present; must be generated at build time.
- `angular:signal_graph` cannot supply `debuggableFn` (it strips it), so any detection relying on source text must bypass it and call `ng.ɵgetSignalGraph` directly.
- Mapping an interop node to its component field by value comparison — inferred, not measured; no spike has validated it.