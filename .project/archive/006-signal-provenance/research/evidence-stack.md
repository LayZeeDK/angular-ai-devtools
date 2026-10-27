# Evidence — stack

Dimension: stack
Questions assigned: How to map signal graph nodes to components for the provenance chain.; Prompt shape for anti-pattern explanation on small models.

## Finding: Node-to-component mapping reuses N1 labels

- **Claim**: Signal graph node labels already encode component context, so N2 can reuse N1's mapping without new Tier 2 hooks.
- **Source**: `.project/research/evidence-codebase.md`
- **Confidence**: high
- **Why it matters here**: avoids app mutation and keeps Tier 1 only.

## Finding: Short fact-list prompt suits small models

- **Claim**: Prompting with a compact fact list (node kinds/labels/edges) keeps Gemini Nano/Phi-4-mini outputs usable.
- **Source**: `.project/intent/INTENT.md` Risks
- **Confidence**: medium
- **Why it matters here**: satisfies SC4 no-tool-calling constraint.

## Assigned questions — answers

- How to map signal graph nodes to components for the provenance chain. → Reuse N1 label mapping; fallback to node id.
- Prompt shape for anti-pattern explanation on small models. → Send short fact list of node kinds, labels, edge directions; no values.

## Dead ends

- Tool calling in prompt — prohibited.
