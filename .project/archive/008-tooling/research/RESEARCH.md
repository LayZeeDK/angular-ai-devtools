# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/CHARTER.md`

## Dispatch

- `domain` — skipped → none — the domain is settled by `docs/feature-proposals.md` and `research/00` to `research/20`; no unsettled domain question remains.
- `stack` — dispatched → `.project/research/evidence-stack.md` — the charter's only research question is API viability for N24 and N25 on the mapped Angular 22.1/22.2 surface.
- `pitfalls` — skipped → none — no research question is assigned; failure modes are recorded in `docs/feature-proposals.md` section 9 and `research/09`, and the program adds none that the map has not already recorded.
- `similar` — skipped → none — prior art is settled in `docs/feature-proposals.md` section 3 and `research/14`.
- `capability-map` — dispatched → `.project/research/evidence-capability-map.md` — program scope needs what exists versus what must be built for N4, N24, N25 and the tooling item.
- `domain-decomposition` — dispatched → `.project/research/evidence-domain-decomposition.md` — program scope needs capability boundaries, ordering and shared instrumentation for the roadmap.

## Question assignments

- `` [RESEARCH] Which N24 and N25 detections are provable from `ng.ɵgetSignalGraph` and the source-text write scan on the counter fixture, and which need new instrumentation? `` → `stack`, `capability-map`, `domain-decomposition`
