# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Provenance tracing via `ng.ɵgetSignalGraph` (Tier 1, feature-detected) — satisfies SC1/SC2 without page mutation (settled by INTENT.md Constraints Tier 1 + evidence-domain.md § Finding: Signal graph exposes producer/consumer edges sufficient for provenance).
- Node-to-component mapping reuses N1 label mapping with fallback to node id — avoids new Tier 2 hooks (settled by evidence-stack.md § Finding: Node-to-component mapping reuses N1 labels).
- Prompt sent as short fact list only (node kinds/labels/edges, no values) — (settled by evidence-stack.md § Finding: Short fact-list prompt suits small models + intent Prohibition N1).
- Explain button gated on `LanguageModel.availability()`; disabled with reason when unavailable — (settled by evidence-pitfalls.md § Finding: Prompt API availability must gate explain button + intent Edge coverage E5/E6).
- No tool calling in prompt; no auto-explain on load — (settled by intent Prohibitions N2/N7).

## Decisions

### Provenance chain traversal direction

- **Decision**: Traverse producers -> consumers deterministically from the selected node, including both directions in the rendered chain, via `ng.ɵgetSignalGraph` edges only.
- **Runner-up**: Consumer-only traversal; lost because SC2 requires showing all producers and consumers (intent Prohibition N5).
- **Evidence**: evidence-domain.md § Finding: Signal graph exposes producer/consumer edges sufficient for provenance
- **Confidence**: high

### Anti-pattern detection set (initial)

- **Decision**: Implement three patterns from graph shape: untracked dependency, circular dependency, over-broad computed; classify by node kind + edge direction.
- **Runner-up**: Single "smell" heuristic combining patterns; lost because SC3 requires at least three distinct reported patterns with evidence.
- **Evidence**: evidence-domain.md § Finding: Anti-patterns detectable from graph shape; evidence-similar.md § Finding: DevTools signal graph pane is visualization-only
- **Confidence**: medium

### Prompt shape for anti-pattern explanation

- **Decision**: Send a compact fact list (node kinds, labels, edge directions) to the panel-local Prompt API; no values, no tool calling.
- **Runner-up**: Full graph JSON dump; lost because small models (Gemini Nano/Phi-4-mini) produce unusable output on large inputs (evidence-stack.md § Finding: Short fact-list prompt suits small models).
- **Evidence**: evidence-stack.md § Finding: Short fact-list prompt suits small models; evidence-pitfalls.md § Finding: Prompt API availability must gate explain button
- **Confidence**: medium

## For the planner

- **Wave-1 blockers**: Validate exact `ng.ɵgetSignalGraph` output shape on `spikes/ng222-app` (low/medium confidence on node kinds/labels); confirm the three anti-pattern classifiers against recorded graph data; verify Prompt API availability behavior across four browsers.
- **Walking skeleton**: MAIN-world tracer returns provenance chain for a selected signal on the counter fixture -> panel renders chain + anti-pattern list -> explain button calls panel Prompt API with fact list and shows answer.
- **Pitfalls → tasks**: "no signal graph on page" must render "not supported" with reason, no model call (E1); "signal not found" must render "not found" (E2); single node with no deps must show "no dependencies" (E3); no anti-patterns must show "no anti-patterns found" while still rendering chain (E4); Prompt API unavailable must disable explain with reason (E5/E6); do not mutate app while tracing (Prohibition N3).

## User rulings

- Anti-pattern detection set (NEEDS-USER): accept evidence-recommended three — untracked dependency, circular dependency, over-broad computed (evidence-domain.md § Finding: Anti-patterns detectable from graph shape). Recorded 2026-10-26 under AFK mode (no human); decisive ruling per plan phase.

## Still unknown

- Confirm final set of anti-patterns to detect (untracked dependency, circular dependency, over-broad computed) — NEEDS-USER: values call; evidence leans toward the three listed (evidence-domain.md § Finding: Anti-patterns detectable from graph shape).