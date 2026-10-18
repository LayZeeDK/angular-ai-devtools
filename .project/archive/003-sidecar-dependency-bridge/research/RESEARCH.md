# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — dispatched → `.project/research/evidence-domain.md` — control-skill check commands and their documentation locations
- `stack` — dispatched → `.project/research/evidence-stack.md` — dependency bridge mechanism (junction/symlink vs workspaces) and migration cost
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — failure modes of junctions, migration, and artifact relocation
- `similar` — dispatched → `.project/research/evidence-similar.md` — comparable tools handling sidecar dependencies and runtime artifacts

## Question assignments

- `` [RESEARCH] Which exact control-skill check commands exist and where are they documented? `` → `domain`
- `` [RESEARCH] Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting? `` → `stack`, `pitfalls`, `similar`