# Evidence — domain

Dimension: domain
Questions assigned: Which reactive anti-patterns are detectable from the signal graph alone and how to classify them.; How to map signal graph nodes to components for the provenance chain.

## Finding: Signal graph exposes producer/consumer edges sufficient for provenance

- **Claim**: `ng.ɵgetSignalGraph` returns nodes with kind/label plus dependency edges, enabling deterministic producer->consumer chain traversal without executing component logic.
- **Source**: `.project/research/evidence-codebase.md` (Angular ~22.1 signal graph usage)
- **Confidence**: high
- **Why it matters here**: satisfies SC1/SC2 provenance tracing without page mutation.

## Finding: Anti-patterns detectable from graph shape

- **Claim**: At least three reactive anti-patterns (untracked dependency, circular dependency, over-broad computed) are classifiable from node kinds/edge counts alone.
- **Source**: `.project/intent/INTENT.md` scope and Risks
- **Confidence**: medium
- **Why it matters here**: satisfies SC3 minimum three patterns.

## Assigned questions — answers

- Which reactive anti-patterns are detectable from the signal graph alone and how to classify them. → Three patterns: untracked dependency, circular dependency, over-broad computed; classify by node kind + edge direction.
- How to map signal graph nodes to components for the provenance chain. → Reuse N1 component mapping via node labels; fallback to node id when no component label.

## Dead ends

- Value inspection — prohibited by N1; not used.
