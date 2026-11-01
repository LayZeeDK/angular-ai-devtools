# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — skipped → none — the milestone changes no product behaviour and adds no terminology; the interop semantics were settled in M012 and are constrained by INTENT scope-out.
- `stack` — skipped → none — the stack is fixed by the charter (TypeScript 6.0.x, Nx 23.3, Angular 22.1 extension workspace) and INTENT adds no stack choice.
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — the milestone's whole risk is a live-verification failure mode: which instance and panel route produce a sliced node set from `/stale-view`, and what the panel reports when the error effect already ran.
- `similar` — skipped → none — no comparable product is in scope; the claim is this repository's own and its verification path is fixed by the existing `verify-ai-browsers` check.

## Question assignments

- `` [RESEARCH] Which instance, and which panel route, produce a sliced node set from `/stale-view`, and what does the panel report when the effect has already run before the panel attaches? `` → `pitfalls`
