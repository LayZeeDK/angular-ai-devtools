# Research Handoff

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — skipped → none — the interop vocabulary (`toSignal.source`, `toSignal.state`, unlabelled effect) is already fixed by the N2/N24 implementations and the brownfield map; no domain question is open.
- `stack` — skipped → none — the stack is pinned by the charter (TypeScript 6.0.x, Angular ~22.1 workspace, MV3 extension); no stack choice is open.
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — both open questions ask which detection path is reliable and what fails when it is not.
- `similar` — dispatched → `.project/research/evidence-similar.md` — Angular's own devtools and `ɵ` APIs are the closest comparable implementation for exposing `toSignal` nodes.

## Question assignments

- ``[RESEARCH] Whether the interop keep-list classifier can be recognised by label or by `debuggableFn` source.`` → `pitfalls`, `similar`
- `` [RESEARCH] Which N25 detections beyond the measured direct cases need new instrumentation. `` → `pitfalls`
