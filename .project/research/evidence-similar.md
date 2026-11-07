# Evidence — similar

Dimension: similar
Questions assigned: Does the panel's existing signal-graph record already carry the resource labels, making this a join rather than a new read?

## Finding: the closest shipped explainer reads a value and a judgement separately

- **Claim**: the two explainers shipped either side of this one (`legacy-structure` for M034, `onpush-readiness` for M035) keep a value that was read apart from a judgement nobody can make, and answer `cannot-tell` with a reason rather than inventing the judgement. M036's resource explainer has the same shape: the state is read, the cause inside the loader is not.
- **Source**: `extension/onpush-readiness.js:58-75` (four states, `cannot-tell` with a reason); `extension/legacy-structure.js` (finding only when the structure is sourced); `.project/archive/035-onpush-readiness/review/wave-3.cycle1.md` (the same shape reviewed and accepted).
- **Confidence**: high
- **Why it matters here**: the module contract, the four-state surface and the mutant discipline are already established in this milestone's neighbours, so M036 inherits a shape rather than inventing one.

## Finding: the signal-graph feature records a graph, not a resource state machine

- **Claim**: the existing capture is a node list with `kind`, `label`, `value` and `fn`, produced from `debugName`s; it has no notion of resource status, so a resource explainer cannot reuse it as a data source without adding the resource-specific fields.
- **Source**: `research/raw/tosignal-node-portal.json` (first node `{"kind":"template","label":"ng-journal-create","value":"undefined","fn":null}`); `_debug_node-chunk.mjs:12252` (labels from `consumer.debugName`).
- **Confidence**: high
- **Why it matters here**: it fixes the boundary between "the graph already tells us" and "the graph tells us the label but not the state" — the milestone's read is the labelled resource signals, not the graph's node list.

## Assigned questions — answers

- Does the panel's existing signal-graph record already carry the resource labels, making this a join rather than a new read? → No; the graph records node identity but no resource status, so the resource fields must be read from the labelled signals themselves.

## Dead ends

- Reusing the M035 join unchanged was considered and rejected: a strategy is a single value on a component def, whereas a resource is a state machine with params, request and error, and conflating the two shapes would lose the idle-by-design distinction.
