# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Which N24 detections beyond the measured direct `this.field =` in subscribe case need new instrumentation?

## Finding: The only measured detection is a direct `this.<field> =`/`.set`/`.update` inside a `subscribe(...)` callback on a non-signal plain field

- **Claim**: N24's measured detection is a regex over the template node's `debuggableFn` source (which holds the whole class source) that finds a direct `this.<field>` assignment or `.set(`/`.update(` inside a `subscribe(...)` callback, confirmed as a non-signal plain field by `ng.isSignal(cmp.<field>) === false`; on the counter fixture the DOM stayed `before` after 1.5 s while the instance held `after`, and an unrelated click then rendered `after`.
- **Source**: `docs/feature-proposals.md:793`; `research/raw/stale-view-counter.json` (`"field":"plain","isSignal":false`, `"domBefore":"before"`, `"instance":"after"`).
- **Confidence**: high
- **Why it matters here**: This is the detection INTENT.md scopes in (SC1/SC2) and the baseline against which every "beyond" candidate must be judged for instrumentation cost.

## Finding: Extending the callback set to `setTimeout`/`Promise`/`queueMicrotask` needs no new instrumentation

- **Claim**: The same stale-view effect occurs for a plain field written in a `setTimeout`, `Promise.then` or `queueMicrotask` callback, and detecting those needs only a broader callback regex over the same `debuggableFn` source — no page-side instrumentation, no new `ng.*` surface.
- **Source**: `docs/feature-proposals.md:797` ("The same write in a `setTimeout` or a `Promise` callback has the same effect, though the regex looks for `subscribe` only"); `research/15-deterministic-and-ai.md` §1.2 (small deterministic work stays in MAIN world).
- **Confidence**: high
- **Why it matters here**: These variants are in-scope-feasible without violating N5 (no new page-side instrumentation), so they are not "instrumentation-gated" detections; they are scope choices, not capability gaps.

## Finding: Object-form `subscribe({next})`, operator chains and whitespace/newlines are regex-refinement, not instrumentation

- **Claim**: Detecting `subscribe({ next: (v) => (this.field = ...) })`, chained forms such as `obs.pipe(...).subscribe(...)`, and arbitrary whitespace/newlines between tokens is a source-text matching refinement; INTENT E3 already requires whole-identifier matching and arbitrary whitespace/newlines between tokens, and no new page-side instrumentation is needed.
- **Source**: `INTENT.md` edge E3 (encoding); `docs/feature-proposals.md:793` (measured `subscribe(() => (this.plain =` form).
- **Confidence**: high
- **Why it matters here**: These are false-negative risks of the heuristic scan (missed writes) that can be closed by regex/AST work in the worker without touching the page agent.

## Finding: Writes through helper methods, other objects and minified code require new instrumentation and are vetoed

- **Claim**: Writes that reach a plain field indirectly — through a helper method (`this.helper()` that sets `this.field`), through another object (`this.state.field = ...` / `obj.field = ...`), or in minified/bundled code — cannot be found by a single regex over one template node's `debuggableFn` and would require call-graph resolution, runtime object/read tracking, or source maps; INTENT explicitly scopes these out and N5 forbids new page-side instrumentation.
- **Source**: `docs/feature-proposals.md:795` ("Limits: writes through a helper method, through another object, or in minified code are not seen"); `INTENT.md` Scope out ("Generalization beyond direct `this.field =` in subscribe (helper methods, other objects, minified code)") and Prohibition N5.
- **Confidence**: high
- **Why it matters here**: These are the detections that genuinely need new instrumentation; under the intent's vetoes they stay out of scope, so the scanner must not claim to cover them and findings must stay hedged.

## Finding: Confirming the template actually reads the field needs template static analysis/runtime read tracking and is vetoed

- **Claim**: Upgrading "the template may show a stale value" to a confirmed stale render requires knowing whether the template reads the field, which is not present in the `debuggableFn` source scan (the template is a separate artifact) and would need template static analysis or runtime read tracking; INTENT N1 and Scope out forbid it.
- **Source**: `INTENT.md` Prohibition N1 ("present an inferred write as a confirmed stale render") and Scope out ("Checking whether the template actually reads the field"); `docs/feature-proposals.md:795` ("Whether the template reads the field is not checked by the regex").
- **Confidence**: high
- **Why it matters here**: The hedged wording is the project's deliberate answer to this instrumentation gap; no amount of source scanning over `debuggableFn` closes it.

## Finding: Source-text boundary detection is an inherent false-positive/false-negative trap of the heuristic

- **Claim**: Matching "inside a subscribe callback" from source text can misfire on `this.field =` inside comments/strings, nested non-subscribe functions, or misidentified callback boundaries, and can miss writes in async functions/generators or implicit returns; these are failure modes of the source-text heuristic over the shared MAIN-world agent, not fixable by more instrumentation within N5, and are mitigated by the hedged finding wording plus E3 whole-identifier matching.
- **Source**: `INTENT.md` edges E3/E5 (whole-identifier; one finding per node+field); `docs/feature-proposals.md:795` (limits); `research/15-deterministic-and-ai.md` §2.2 (labels/source are app-controlled and noisy).
- **Confidence**: medium
- **Why it matters here**: Pitfalls research must record which traps already exist in this mapped codebase (brownfield rule); these are the ones the reviewer should look for in held-out tests.

## Finding: The scan is availability-gated on dev builds 22.1.3+ and on an intact signal graph

- **Claim**: `debuggableFn` on non-computed (template) nodes exists only from Angular 22.1.3 (`N2's 22.1.3 gate`), and if the graph is destroyed (e.g. `ViewContainerRef` injection or `angular:di_graph`) the template node disappears, so the scan must report "graph unavailable"/unsupported rather than "no findings"; production/stripped pages yield no finding.
- **Source**: `docs/feature-proposals.md:788` (N24 has N2's 22.1.3 gate); archived pitfalls evidence `.project/archive/005-signal-provenance/research/evidence-pitfalls.md` (ViewContainerRef/`angular:di_graph` trap, missing template node); `extension/agent-main.js` (serializeGraph marks `unavailable` when no template node).
- **Confidence**: high
- **Why it matters here**: These are reliability failure modes the scan must handle explicitly (INTENT E1, E7) to avoid false negatives that look like "no stale-view findings".

## Assigned questions — answers

- Which N24 detections beyond the measured direct `this.field =` in subscribe case need new instrumentation? → Detections that need new instrumentation (and are therefore vetoed/out of scope under N5): writes through helper methods, writes through other objects, minified-code writes, and confirmation that the template actually reads the field. Detections that do NOT need new instrumentation (regex/scope refinements only): `setTimeout`/`Promise`/`queueMicrotask`/other async callbacks, object-form `subscribe({next})`, operator chains, whitespace/newline token spacing, and whole-identifier enforcement (already required by E3). No detection can be added that requires new page-side instrumentation, per Prohibition N5 and the Scope-out list.

## Dead ends

- Searching for an official "stale view" / "missing change detection" detection API in Angular 22 — none exists; Angular DevTools property view reads the instance and shows the new value with no reason (`docs/feature-proposals.md:796`); the only surface is the heuristic source scan over `debuggableFn`. Recorded so nobody re-treads it.
- Treating a missing template node as "no stale-view findings" — it is a destroyed/unavailable graph (ViewContainerRef/`angular:di_graph`), a distinct result, not an empty finding (archived pitfalls evidence).
- Invoking `debuggableFn` to classify writes — it holds the whole class source (13,878–25,838 chars) and is an arbitrary function; classifying from its `.toString()` text only, never invoking it (archived pitfalls evidence).