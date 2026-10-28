# Evidence — domain-decomposition

Dimension: domain-decomposition
Questions assigned: Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation?

## Finding: N24 stale-view detection rests on a plain field write found only via the `debuggableFn` source scan, not the graph

- **Claim**: `ng.ɵgetSignalGraph` has read edges only and omits a signal that nothing reads, so the N24 case (plain field written in a `subscribe` callback that leaves the template stale) is not visible as a graph node; the only working route is a source-text scan of `debuggableFn` for `.<name>.set(` / `.<name>.update(`, which needs Angular 22.1.3+ and is a heuristic (writes via called methods, writes without `this.`, minified code can be missed).
- **Source**: docs/feature-proposals.md N2 section "How the write rules see writes"; feature-proposals.md section 2.2 Tier 1 note on `ɵgetSignalGraph` in ExternalCoreGlobalUtils.
- **Confidence**: high
- **Why it matters here**: N24 cannot ship on the signal graph alone; it shares the exact same instrumentation as N2's anti-pattern finder, so the two features share one milestone's MAIN-world tracer and one fact-list pipeline, not separate ones.

## Finding: N25 toSignal identification also needs the graph plus the same source scan; the graph alone stops at the Observable

- **Claim**: `toSignal` creates an unlabelled effect node and a `toSignal.source` node in `ng.ɵgetSignalGraph`, but the graph cannot name which interop call made them, so N25 requires reading `debuggableFn` source text (the same scan as N2/N24) to identify the interop call; the graph alone only proves the node exists.
- **Source**: docs/feature-proposals.md N25 (RxJS interop explainer) and N2 "How the write rules see writes"; spikes/probes/tosignal-node.js referenced in feature-proposals.md.
- **Confidence**: medium
- **Why it matters here**: N25's detection is provable only in part from the graph; the interop-call naming depends on the same heuristic scan, so N25 shares the source-scan instrumentation with N2/N24 and is not independently instrumentable.

## Finding: The MAIN-world page agent is shared infrastructure across N4, N24, N25

- **Claim**: The page agent runs in the MAIN world and reads `window.ng`, dispatches `devtoolstooldiscovery`, hooks `console.error`/`window.onerror`/`unhandledrejection`, and installs `ɵsetProfiler` subscribers; N4 (error capture + owning component via `ng.getOwningComponent`), N24/N25 (graph + source scan) and N1 (profiler) all consume this one agent, and the agent must run at `document_start` with no app change.
- **Source**: docs/feature-proposals.md section 3.1 (extension contexts); evidence-codebase.md "Main-world tracers and panel components are split across two source roots".
- **Confidence**: high
- **Why it matters here**: The page agent is a single shared seam; any milestone that needs new page-side reads must extend it, so N4, N24 and N25 cannot be fully parallelized on the instrumentation side even where their panel/UI work is separable.

## Finding: Panel components and prompt/fact-list plumbing are shared across all features

- **Claim**: The DevTools "Angular AI" panel, the model session host, the tool registry with `{name, description, inputSchema, execute}`, the fact-list shaping, the safety/code-shape check and the `lars-verify` harness are shared infrastructure; each feature adds tools and a finding type but reuses the loop, registry and panel.
- **Source**: docs/feature-proposals.md sections 3.2 (one tool registry, four sources), 3.3 (model loop), 3.5 (safety rules); charter program success criteria 1-2.
- **Confidence**: high
- **Why it matters here**: Panel delivery and proof (four-model e2e) are cross-cutting milestones that cannot be attributed to a single feature; the tooling item (installer move + review-panel families) is separable and is explicitly first per charter correction 2026-10-28.

## Finding: Ordering facts provable from code vs. judgment

- **Claim**: Provable edges: N4 needs only Tier 0 (`ng.getOwningComponent`, `console` hooks, offline digest) and needs no signal graph or source scan; N24 and N25 need Tier 1 (`ng.ɵgetSignalGraph`) plus the same source scan; the tooling item (scripts move, review-panel families) has no dependency on any feature. What is judgment, not fact: whether to ship N4 before N24/N25 (charter lists N4 then N24 then N25, but that is a stated priority, not a code dependency), and whether N24 and N25 can share one milestone (they share instrumentation, but their panel findings differ).
- **Source**: docs/feature-proposals.md N4 (Tier 0), N24/N25 (Tier 1); CHARTER.md corrections 2026-10-28 (tooling first, then N4, N24, N25); evidence-codebase.md maturity/stack.
- **Confidence**: high
- **Why it matters here**: Separates code-provable dependency edges from charter-stated priority ordering, so the decider can see which sequencing is forced and which is a policy choice.

## Assigned questions — answers

- Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation? → N24's stale plain-field write is not provable from `ng.ɵgetSignalGraph` alone (read edges only; an unread signal is not a node); it is provable only via the `debuggableFn` source-text scan for `.<name>.set(` / `.<name>.update(`, which is a heuristic needing Angular 22.1.3+ and can miss writes through called methods, writes without `this.`, and minified code — no new instrumentation is strictly required beyond the existing scan, but the scan is itself heuristic and untested for those cases. N25's interop node (`toSignal.source` plus an unlabelled effect) is provable to exist from `ng.ɵgetSignalGraph`, but naming which interop call made it requires the same source-text scan; the graph alone cannot name the call. Neither feature needs new page-side instrumentation beyond the shared MAIN-world page agent plus the existing graph + source scan; the shared pieces are the agent, the graph read, and the scan, while N4 needs none of them (Tier 0 only). Judgment, not fact: whether N24/N25 share one milestone and the exact ship order beyond the charter's stated priority.

## Dead ends

- None recorded; all findings tied to docs/feature-proposals.md and CHARTER.md sources actually read.