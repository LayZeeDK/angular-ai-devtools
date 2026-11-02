# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — skipped → none — the one open question is empirical about this repository's fixtures; prior art and terminology for Angular feature detection are already settled in `research/03-prior-art.md` and `research/14-ai-devtools-prior-art.md` and no question asks about them.
- `stack` — skipped → none — no stack question; the stack is fixed by CHARTER (Angular 22.2 inspected / ~22.1 panel, TypeScript 6.0, Nx 23) and this milestone adds no dependency.
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — brownfield: the fingerprint's failure modes (over-claim, silent version fallback, missing dev-mode surface) must be checked against the code that already exists, which is what the mapped codebase makes answerable.
- `similar` — skipped → none — no comparable-product question; the fixtures are in-repo and the roadmap already names the vetted surface.
- `fingerprint` — dispatched → `.project/research/evidence-fingerprint.md` — custom dimension: the question is which of the eight announced bits the fixtures at this head can actually distinguish, which needs the fixture and Angular debug-surface evidence rather than a general answer.

## Question assignments

- `` [RESEARCH] Which feature fingerprints `app_facts` can distinguish on the fixtures at this head, and which need a per-feature probe instead? `` → `pitfalls`, `fingerprint`
