# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Interop keep-list needs BOTH rules — label (`toSignal.source`, `toSignal.state`) AND `debuggableFn` source containing `subject.error`; neither alone suffices (pitfalls § "The unlabelled effect has no `toSignal.*` label, so a label-only rule misses it"; similar § "A measured portal capture shows `toSignal.*` labels present and the effect unlabelled with `subject.error` in its source"; INTENT.md Scope: in / E5).
- Field-to-node attribution needs new page-side instrumentation: `serializeGraph` emits no `value` field and `GraphNode` has none, while the measured portal capture records `value` per node (pitfalls § "Field-to-node attribution by value requires serialising node values, which the shipped agent does not do").
- Slicing direct producers/consumers needs no new instrumentation; reuse `ng.ɵgetSignalGraph` edges plus the N2 provenance tracer's edge walk (pitfalls § "Slicing direct producers/consumers needs no new instrumentation").
- Serialised `debuggableFn` collapses to its name; only `debuggableFnSource` (full body) survives the boundary, so the classifier must run on text (pitfalls § "The MAIN-world agent serialises both the node label and the function source, but collapses `debuggableFn` to its name"; § "`debuggableFn` (the function object) does not survive serialisation; only its stringified body does").
- Label rule is grounded in shipped Angular source: `toSignal` stamps `debugName` `toSignal.` + the signal name + `.source`/`.state`, and `label` is populated from `debugName` (similar § "Angular's `toSignal` stamps its nodes with `toSignal.state` / `toSignal.source` labels in dev mode"; § "`DebugSignalGraphNode.label` is populated from the node's `debugName`").
- No installed Angular DevTools signal-graph panel exists to copy; the repo's own agent is the comparable implementation (similar § "No installed Angular DevTools extension in the repo exposes a signal-graph panel").
- `angular:signal_graph` strips `debuggableFn`, so N25 must call `ng.ɵgetSignalGraph` directly (evidence-codebase § "MAIN-world agent depends on Angular dev-mode globals"; similar § "Angular's own AI signal tool deliberately strips `debuggableFn`, so the repo bypasses it").
- No library-internal filter exists in code today; the classifier is greenfield (pitfalls § "Dead ends" — grep `keepList|keep-list|isInternal|library` returned no source matches).
- Portal is no-source for N25: no `Subject`/`subject.error` in portal `libs`/`apps`; SC1 witnessed on the counter fixture's dev-only route only (INTENT.md Scope: out / Risks; CHARTER.md Constraints — portal).
- Panel route must be `/panel/interop` (verify interop check regex `/\/panel\/interop\/?$/`; evidence-codebase § "Interop panel route is not yet shipped").

## Decisions

### Where the interop slice is computed and how the panel gets it

- **Decision**: Compute the keep-list classification and the direct-producer/consumer slice in the panel's TypeScript over the payload the MAIN-world agent already sends; the agent keeps serialising the full graph (nodes + resolved edges + labels + `debuggableFnSource`) as today, and the panel reuses the N2 provenance tracer's edge walk (`src/main-world/provenance-tracer.ts`) to slice each kept node's neighbours. No new worker, no re-fetch.
- **Runner-up**: Start a dedicated worker like N24's `stale-view-worker.js` to run the scan off the main thread; lost because the N24 worker inlines a source-text scan that needs no graph edges or component instances, whereas interop slicing needs the full serialised graph (nodes, edges, and the new value field) plus per-node classification, so a worker would have to re-fetch the entire graph from the page on every run — duplicating what `agent-main.js` already sends — while adding a second inlined copy of the scan algorithm to keep in sync.
- **Evidence**: pitfalls § "The MAIN-world agent serialises both the node label and the function source, but collapses `debuggableFn` to its name"; § "Slicing direct producers/consumers needs no new instrumentation" (`extension/agent-main.js:347-356`; `src/main-world/provenance-tracer.ts:52-75`); evidence-codebase § "Stale-view scan runs in a dedicated, self-contained worker" (`extension/stale-view-worker.js:1-25`); INTENT.md Architecture (deterministic code computes facts; panel-local Prompt API explains).
- **Confidence**: high

### How the serialised node value for attribution is added

- **Decision**: Add an optional `value` field (a type/length/primitive summary, not a raw object) to the serialised node in `extension/agent-main.js` `serializeGraph` and to the `GraphNode` interface in `apps/angular-ai-devtools/src/app/update-cause-chain.ts` (and the provenance tracer's `SignalGraphNode`), additive and optional, so N1/N2/N3/N4/N24 consumers keep compiling and ignore the extra field.
- **Runner-up**: Send values in a separate message; lost because it doubles the cross-world message plumbing and forces every consumer to correlate two payloads, and a partial/missed value message would silently break attribution; a versioned message type was also rejected because it forces a migration of all five existing consumers for a purely additive change.
- **Evidence**: pitfalls § "Field-to-node attribution by value requires serialising node values, which the shipped agent does not do" (`apps/.../update-cause-chain.ts:19-25`; `extension/agent-main.js:329-336`; `research/raw/tosignal-node-portal.json:1`); evidence-codebase § "Panel app is the same Angular app built into extension/panel" (single payload path); INTENT.md Scope: out (no regression of N1/N2/N3/N4/N24).
- **Confidence**: high

### How the explicit keep-list composes with the library-internal filter

- **Decision**: The interop keep-list is its own predicate applied directly to the raw serialised graph: a node is kept iff its `label` is `toSignal.source`/`toSignal.state` OR its `debuggableFnSource` contains a whole-token `subject.error` match. It does not chain onto or assume any pre-existing library-internal filter (none exists in code), and it does not alter N2's own flow; non-matching nodes are simply absent from the interop slice.
- **Runner-up**: Reuse N2's library-internal filter as a first pass then apply the interop rules; lost because no such filter exists in code today (pitfalls dead end: grep returned no source matches), so chaining would depend on an undocumented, unmeasured predicate and could silently drop the very interop nodes N25 exists to explain (INTENT.md Prohibition N3).
- **Evidence**: pitfalls § "Dead ends" (no `keepList`/`isInternal`/`library` source matches); § "A source-text-only rule produces false positives on unrelated nodes whose source mentions the token" (`src/main-world/stale-view-scan.ts:145-148`; INTENT.md Prohibition N3); similar § "A measured portal capture shows `toSignal.*` labels present and the effect unlabelled with `subject.error` in its source"; INTENT.md Success criterion 4 / E5.
- **Confidence**: high

### Panel route and UI shape for `/panel/interop`

- **Decision**: Add an Angular route `interop` (full path `/panel/interop` under the panel's `/panel/` base href) backed by a new panel component that (a) fetches the serialised graph, (b) runs the keep-list + provenance slice, (c) renders one slice entry per source node (never merging equal labels — E2), (d) always shows the limitation wording naming Observable/operator/emission (E3), (e) renders attribution rows as "inferred, untested" listing every candidate when values collide (E4), and (f) exposes an explicit "Explain" action that sends only the short fact list to the panel-local Prompt API.
- **Runner-up**: Reuse the existing provenance panel route with a query param/flag; lost because `verify-ai-browsers`' interop check requires the served route to match `/\/panel\/interop\/?$/` and treats any other route as could-not-run, and overloading the provenance route risks regressing N2's flow (INTENT.md Scope: out — no regression of N2).
- **Evidence**: evidence-codebase § "Interop panel route is not yet shipped" (`AGENTS.md` Verification fixtures, N25); verify interop check `interop.mjs:88` (route regex); INTENT.md Success criteria 1–5; E1–E7 edge rows; Prohibitions N1/N5/N6.
- **Confidence**: high

### Fixture change to `stale-view-fixture.ts`

- **Decision**: Extend `spikes/ng222-app/src/app/stale-view-fixture.ts` (dev-only) by importing `toSignal` (from `@angular/core/rxjs-interop`), `effect` and `inject`, adding a `signal = toSignal(this.updates)` field, and adding an `effect(() => { this.updates.error(new Error('interop')); })` in the constructor, while retaining the existing `this.updates.subscribe((next) => { this.value = next; })` block so the N24 stale-view finding stays intact.
- **Runner-up**: Create a separate interop fixture component/route; lost because the user ruling explicitly extends the existing `stale-view-fixture.ts` so one route carries both the N24 stale-view finding and the N25 interop nodes, and the verify check drives a single served URL (INTENT.md Corrections 2026-10-30; evidence-codebase § "Spikes provide two fixture apps including a dev-only stale-view route").
- **Evidence**: INTENT.md Scope: in (fixture extension) and Corrections (2026-10-30); evidence-codebase § "Spikes provide two fixture apps including a dev-only stale-view route" (`spikes/ng222-app/src/app/stale-view-fixture.ts`); similar § "A measured portal capture shows `toSignal.*` labels present and the effect unlabelled with `subject.error` in its source" (`research/raw/tosignal-node-portal.json`); pitfalls § "The unlabelled effect has no `toSignal.*` label, so a label-only rule misses it".
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: (1) add the optional `value` serialisation in `agent-main.js` and the TS interfaces, then prove N1/N2/N3/N4/N24 consumers still type-check and pass; (2) implement and unit-test the interop keep-list classifier (label rule + whole-token `subject.error` source rule) in both directions (E5); (3) implement the `/panel/interop` route + component and the value-based attribution multi-candidate case (E4); (4) extend `stale-view-fixture.ts` and re-verify the N24 stale-view finding still fires on the same route.
- **Walking skeleton**: agent emits `value` (additive) → panel `/panel/interop` renders a toSignal slice with ≥1 node and the limitation wording and "inferred, untested" attribution on the counter fixture → Explain returns a non-empty answer from one model; then extend to all four models and the held-out E2/E4/E5 tests.
- **Pitfalls → tasks**: anchor `subject.error` to a whole token, not a loose substring, and scope by the two rules only — no third fixture-shaped exception (task: classifier; pitfalls § "A source-text-only rule produces false positives"; Prohibition N3); keep limitation wording present on empty/truncated slices (task: renderer; E3); never drop "inferred, untested" even for a single candidate (task: attribution renderer; Prohibition N6); do not present the unlabelled effect as the feeding Observable (task: explanation prompt wording; Prohibition N5); reuse N24's `nodeText` preference order (`debuggableFnSource` → string `debuggableFn` → `toString`) for the source rule (task: classifier; pitfalls § "N24's stale-view scan is the measured precedent for a source-text rule"); note `node_modules/@angular/core/types` (not `index.d.ts`) for any typing work (similar dead end).

## User rulings

- none — no values call remained after the evidence; all five choices were settled by codebase/evidence constraints.

## Still unknown

- Exact fidelity of the serialised `value` summary (primitive vs type/length for arrays/objects) and its cross-browser stability — plan: wave-1 spike.
- Whether the `subject.error` source rule false-positives on helper-indirected or minified/transformed code on the counter fixture — plan: wave-1 test (E5 pins both directions).
- Whether any portal route can ever produce a `subject.error` effect — recorded as no-source; no verification planned on the portal (INTENT.md Scope: out).