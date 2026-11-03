# Research Handoff

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — skipped → none — no domain question: the prior art for tiered opt-in inspection is settled in `research/14-ai-devtools-prior-art.md` and the design note, and no question asks about it again.
- `stack` — skipped → none — no stack question: the stack is fixed by the charter (Angular 22.2, TypeScript 6.0, Nx 23); M021 adds a package but no new technology, and the package layout questions are the plan's, not research's.
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — brownfield: writing one global entry, proving dev-build tree-shaking, and refusing without falling back to page inspection are the three failure modes this milestone can ship wrong, and the mapped codebase already shows where each one lands.
- `similar` — skipped → none — no comparable-product question: the fixture set is in-repo and the roadmap already names the vetted surface.
- `facade` — dispatched → `.project/research/evidence-facade.md` — custom: the one open question is empirical about this checkout — whether S16's verdict, recorded against an exported provider, carries over to a package that exports a facade at the table entry.

## Question assignments

- `` [RESEARCH] Does the S16 verdict recorded against an exported provider carry over to a package that exports a facade at the table entry, or does the lookup need measuring again? `` → `pitfalls`, `facade`
