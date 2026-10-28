# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Stack — TypeScript 6.0.x, Nx 23.3, Angular ~22.1, MV3 extension, zoneless standalone signals (intent Constraints; evidence-codebase.md §Stack)
- Prompt API location — panel only; no Prompt API in page, content scripts, or service worker (intent Scope out / Prohibition N1)
- Scope exclusions — no worker, no downloadable-model flow, no new Tier 2 features in this milestone (intent Scope out)
- Tracer forbidden APIs — must not use `angular:di_graph` or `getViewContainerRef()`; reuse N1 mapping (intent Prohibition N3; evidence-domain.md §Component mapping is already solved by N1)
- Component→graph mapping — reuse N1: instance → host element → NodeInjector → `ng.ɵgetSignalGraph(injector)`; owning component is the `template` node whose `debuggableFn === instance.constructor` (evidence-domain.md §Component mapping; evidence-stack.md §N1's per-component capture can be inverted)
- Component enumeration — `ng.getRootComponents` / `getOwningComponent` / `getComponent` + host/injector utils, no di_graph (evidence-stack.md §Component enumeration is available via ng global utils)
- Node identity — global string `id` across graphs; edges are per-graph indices resolved to node ids at serialization (evidence-stack.md §Node ids are globally unique; §Serialization currently drops id-level edge resolution)
- Graph scope — one `getSignalGraph` call per component; aggregate per-component subgraphs by global node id (evidence-stack.md §getSignalGraph is scoped to one injector)
- Provenance traversal order — profiler node order (sequential); no name-based tie-break (intent Edge E6)
- Anti-pattern reporting granularity — one report per chain, not deduplicated across selections (intent Edge E7)
- Prompt API gating — availability-gated; disabled with reason when unavailable (intent Edges E5/E8; evidence-codebase.md §On-device Prompt API is optional and gated)
- Empty graph (no signal graph) — panel shows "not supported" with reason; no tracing, no model call (intent Edge E1)
- Signal/component not found — "not found"; no model call (intent Edge E2)
- Single node with no deps — chain shows single node with "no dependencies" (intent Edge E3)
- No anti-patterns detected — show "no anti-patterns found" plus the provenance chain (intent Edge E4)
- Regression gate — `npm run check`, `npm test`, `build-extension` pass with no N1 breakage (intent Edges E9/N4)
- Anti-pattern evidence — each reported anti-pattern carries node labels and graph positions (intent Prohibition N6)

## Decisions

### Anti-pattern catalogue

- **Decision**: Detect four structural anti-patterns: (1) untracked read in an effect, (2) untracked write, (3) computed with side effects, (4) write-after-read in the same effect. "Missing cleanup" is excluded — not detectable from `ReactiveNodeKind`/edges.
- **Runner-up**: missing cleanup (and other source-level heuristics) — `DebugSignalGraphNode` carries no purity/write/cleanup metadata, so graph-only detection is impossible; deferred to a separate heuristic or dropped.
- **Evidence**: evidence-pitfalls.md § "Anti-patterns detectable from the graph alone fall into four structural classes"; evidence-domain.md § "Not detectable from the graph alone"
- **Confidence**: medium

### Prompt shape for anti-pattern explanation

- **Decision**: Reuse `buildFactsPrompt` shape: fact list of node kind + label + edge direction + anti-pattern name; `##`-delimited sections; 2-3 sentence answer cap; labels capped at 200 chars and wrapped in `"page"`; output constrained via `responseConstraint` (JSON Schema); temperature ~0.2; no tool calling, no signal values, no page data.
- **Runner-up**: free-text explanation — less parseable on Gemini Nano; structured constraint preferred for reliability.
- **Evidence**: evidence-pitfalls.md § "The existing prompt kit already defines the right shape"; evidence-similar.md § "Chrome Prompt API supports structured output via responseConstraint"; evidence-similar.md § "Gemini Nano prompt-design guidance favors concise, delimited, example-driven, short-output prompts"
- **Confidence**: high

### Graph-unavailable handling

- **Decision**: Emit a distinct "graph unavailable for this component" result when the `template` node is missing (ViewContainerRef / `angular:di_graph` destruction); never report "no anti-patterns found" in that case.
- **Runner-up**: treat missing template as an empty finding — produces false negatives and false positives (epoch-diff evidence is gone with the template node).
- **Evidence**: evidence-pitfalls.md § "The signal graph is a *live, mutation-sensitive* structure"; evidence-pitfalls.md § "the recorder must be able to report 'graph unavailable'"
- **Confidence**: high

### False-positive mitigation (lazy evaluation and debuggableFn)

- **Decision**: Require a missing edge to persist across two snapshots before flagging an untracked read; never invoke `debuggableFn`; classify from node kind + edge indices only.
- **Runner-up**: single-snapshot classification — fires incorrectly on lazily unevaluated computeds whose edges appear only after first read.
- **Evidence**: evidence-pitfalls.md § "False positives are likely from graph incompleteness and from reading `debuggableFn` as if it were trusted source"
- **Confidence**: medium

## For the planner

- **Wave-1 blockers**: (a) validate the four anti-pattern rules on `spikes/ng222-app` counter fixture and confirm ≥3 fire with evidence; (b) verify lazy-evaluation false-positive mitigation (two-snapshot persistence) does not mask real findings; (c) confirm epoch-diff stale-consumer detection works with recorded graph snapshots via existing `diffEpochs` logic; (d) confirm component enumeration + per-component aggregation on the counter fixture without `di_graph`/`getViewContainerRef`.
- **Walking skeleton**: enumerate components via `ng` utils → capture per-component graph → invert into node-id→component map resolving edges to ids → build producer/consumer chain for one selected signal → render chain (kind, label, edge direction) in panel → run four anti-pattern rules → display findings with node labels/positions → explain via panel Prompt API fact list (disabled with reason when unavailable).
- **Pitfalls → tasks**: (1) graph destruction (VCR/`di_graph`) → detector emits "graph unavailable", not empty; (2) lazy/unevaluated computeds → two-snapshot persistence before flagging; (3) `debuggableFn` unsafe → classify from kind+edges only, never invoke; (4) noisy/adversarial labels → structural classification first, labels only as capped/wrapped evidence strings; (5) single root-injector call misses nested components → enumerate per component; (6) edges are indices not ids → resolve to ids at serialization; (7) graph changes between snapshots → findings carry snapshot context; (8) Prompt API unavailable → deterministic results still render, explain button disabled with reason.

## User rulings

- Confirm final set of anti-patterns to detect → four structurally-detectable patterns: untracked read, untracked write, computed side effects, write-after-read; "missing cleanup" excluded as not graph-detectable (AFK resolution of NEEDS-USER item).

## Still unknown

- Angular version support beyond 22.x — plan: accept risk (zoneless 22.x is the stated matrix)
- Zone.js support — plan: accept risk (deliberate constraint; zoneless only)
- Whether E2E suite (`apps/angular-ai-devtools-e2e`) is part of the verification gate — plan: wave-1 spike
- Whether to also ship domain's structural rules (cycles, dead state, stale consumer) alongside the four confirmed patterns — plan: wave-1 spike
- Exact prompt token budget headroom on Aion (7,168) vs Chrome (9,216) for the anti-pattern fact list — plan: wave-1 spike

