# Evidence — pitfalls

Dimension: pitfalls
Questions assigned: Does the panel's existing signal-graph record already carry the resource labels, making this a join rather than a new read?

## Finding: the existing graph recording carries no resource labels, so this is a new read

- **Claim**: the captured signal graph holds nodes shaped `{kind, label, value, fn}` and mentions `toSignal`, but contains no `Resource#`, `isLoading` or `extRequest` string anywhere, so the panel cannot join resource state from what it already records.
- **Source**: `research/raw/tosignal-node-portal.json` — a 28,517-character graph capture; its first node is `{"kind":"template","label":"ng-journal-create","value":"undefined","fn":null}`; `Resource#`, `isLoading` and `extRequest` each return `false` when searched in the joined text, while `toSignal` returns `true`.
- **Confidence**: high
- **Why it matters here**: the intent's third open question proposed this might be a join. It is not. The milestone must extend what the page agent collects, which puts SC3's "no new page-side instrumentation" under scrutiny: reading the graph through `ɵgetSignalGraph` is an existing hook, but the resource fields have never been recorded before.

## Finding: the research document attributes the labels to the wrong hook

- **Claim**: `research/08-recent-angular-features.md:170` says the resource nodes are "sampled by the page agent per CD cycle (`ɵsetProfiler`)", but the labels come from `ɵgetSignalGraph`; `ɵsetProfiler` supplies change-detection timing events and no labels.
- **Source**: `_debug_node-chunk.mjs:12563-12564` (both hooks exported), `:12252,12261,12277` (labels read from `debugName`), `:144-159` (`ɵsetProfiler`'s registration and callback shape).
- **Confidence**: high
- **Why it matters here**: an implementer following `research/08` would subscribe to the profiler and find no labels at all — the milestone must read the graph, and the research sentence should be corrected rather than propagated.

## Assigned questions — answers

- Does the panel's existing signal-graph record already carry the resource labels, making this a join rather than a new read? → It does not: the recording has no resource labels, so the milestone is a new read through `ɵgetSignalGraph`.

## Dead ends

- Looking for resource nodes in the existing capture was tried and returned nothing; the capture predates any fixture resource, which is consistent with the domain dimension finding that the fixture has none.
