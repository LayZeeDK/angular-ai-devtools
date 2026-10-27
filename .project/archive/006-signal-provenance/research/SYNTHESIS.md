# Synthesis

## Settled

- Zoneless standalone signals with inject() — Angular ~22.1 constraint (INTENT.md Constraints).
- MV3 Chrome extension, panel-only Prompt API — no Prompt API in page/content/SW (INTENT.md Scope: out).
- No worker, no downloadable model flow, no Tier 2 features this milestone (INTENT.md Scope: out).
- Tier 1 (`ng.ɵ*`) allowed, labelled and feature-detected (INTENT.md Constraints).
- Tracing must not mutate app state; no `angular:di_graph` / `getViewContainerRef` (INTENT.md Prohibitions N3).
- Prompt is short fact list, no tool calling, no signal values/page data (INTENT.md Prohibitions N1/N2).
- Prompt API availability gates explain button; deterministic results still render (evidence-pitfalls § Prompt API availability must gate explain button).

## Decisions

### Anti-patterns to detect

- **Decision**: Detect exactly three patterns: untracked dependency, circular dependency, over-broad computed; classify by node kind + edge direction.
- **Runner-up**: Broader heuristic sets (e.g., missing memoization) — lost because not classifiable from graph shape alone with medium confidence.
- **Evidence**: evidence-domain.md § Anti-patterns detectable from graph shape; evidence-similar.md § DevTools signal graph pane is visualization-only
- **Confidence**: medium

### Node-to-component mapping

- **Decision**: Reuse N1 label mapping from signal graph node labels; fallback to node id when no component label.
- **Runner-up**: New Tier 2 hooks — lost because prohibited and unnecessary; labels already encode component context.
- **Evidence**: evidence-stack.md § Node-to-component mapping reuses N1 labels; evidence-domain.md § Signal graph exposes producer/consumer edges sufficient for provenance
- **Confidence**: high

### Prompt shape

- **Decision**: Panel-local Prompt API receives a compact fact list (node kinds, labels, edge directions), no values, no tool calling; explain button is sole trigger.
- **Runner-up**: Richer context / tool-calling prompt — lost because prohibited and unstable on small models.
- **Evidence**: evidence-stack.md § Short fact-list prompt suits small models; evidence-pitfalls.md § Prompt API availability must gate explain button
- **Confidence**: medium

### Tracer implementation approach

- **Decision**: MAIN-world tracer calls `ng.ɵgetSignalGraph`, traverses producer->consumer edges deterministically, returns recorded graph data; no page mutation.
- **Runner-up**: Live re-execution / value inspection — lost because prohibited (N1/N3) and non-deterministic.
- **Evidence**: evidence-domain.md § Signal graph exposes producer/consumer edges sufficient for provenance; evidence-similar.md § DevTools signal graph pane is visualization-only
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: Validate exact `ng.ɵgetSignalGraph` output shape on `spikes/ng222-app`; burn down anti-pattern classification on recorded graph data; verify Prompt API availability reasons across browsers.
- **Walking skeleton**: Tracer returns chain for selected signal on counter fixture -> panel renders single-node chain with "no dependencies" -> explain button disabled with reason when Prompt API unavailable.
- **Pitfalls → tasks**: Prompt API availability -> explain-button task must disable with reason; no auto-explain -> button is sole trigger; no page mutation -> tracer task must be read-only; incomplete chain -> panel task must render all producers/consumers.

## User rulings

- Confirm final set of anti-patterns to detect → Accepted: untracked dependency, circular dependency, over-broad computed.

## Still unknown

- Exact `ng.ɵgetSignalGraph` node/edge schema — plan: wave-1 spike on counter fixture.
- Prompt output quality on Gemini Nano/Phi-4-mini — plan: wave-1 spike with short fact list.