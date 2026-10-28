# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `stack` — dispatched → `.project/research/evidence-stack.md` — Angular `ng.*` DI tracer API surface: `getInjector`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders` and their measured return shapes, tiers, and the `angular:di_graph` prohibition.
- `domain` — dispatched → `.project/research/evidence-domain.md` — DI resolution paths, which questions are answerable from the tools alone, and known limitations (injection flags, `providedIn: 'any'`, provider dump size).
- `pitfalls` — skipped → none — no model-shape pitfalls to investigate; N3 sends only a ~200-token deterministic diff to the panel-local model (proposals §3.4).
- `similar` — skipped → none — feature-proposals.md §3.3 already documents prior art (Angular DevTools injector tree, Pangular, React DevTools).

## Question assignments

- `` [RESEARCH] Exact shape of `ng.ɵgetInjector*` APIs and what data they return per injector. `` → `stack`
- `` [RESEARCH] Which DI questions are answerable from the tools alone vs. needing additional page-agent data. `` → `domain`
