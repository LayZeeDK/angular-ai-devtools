# Evidence — similar

Dimension: similar
Questions assigned: Which reactive anti-patterns are detectable from the signal graph alone and how to classify them.

## Finding: DevTools signal graph pane is visualization-only

- **Claim**: Existing Angular signal graph pane draws nodes but does not trace provenance or judge patterns, so N2 fills a gap.
- **Source**: `.project/intent/INTENT.md` Problem
- **Confidence**: high
- **Why it matters here**: confirms scope novelty.

## Assigned questions — answers

- Which reactive anti-patterns are detectable from the signal graph alone and how to classify them. → Graph shape enables untracked/circular/over-broad detection; consistent with visualization-only pane.

## Dead ends

- Reusing pane UI directly — not exposed as API.
