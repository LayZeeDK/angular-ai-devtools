# Research Handoff

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — skipped → none — no domain question: the overlay's geometry vocabulary (rect, viewport, DPR, transform) is settled by the platform and by `research/02-angular-surface.md`, and this milestone asks nothing new about it.
- `stack` — skipped → none — no stack question: the overlay is plain DOM with no new dependency, and AR-2 forbids a framework runtime in the page.
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — brownfield: the question's first half is an inventory of the observers the tool already owns, which is code archaeology in this checkout rather than a web search.
- `similar` — skipped → none — no comparable-product question: the shape of a closed-shadow overlay is not what is being asked, and the programme's prior art for in-page overlays is recorded in `research/03-prior-art.md`.
- `exclusion` — dispatched → `.project/research/evidence-exclusion.md` — custom: which of those observers would actually see a host subtree, what a closed shadow root hides from them, and which sites are in this generation's scope, is an AR-4 blast-radius question rather than a survey.

## Question assignments

- `` [RESEARCH] Which `MutationObserver` call sites the tool owns today would observe a host subtree if the exclusion were dropped, and which of them are in this generation's scope? `` → `pitfalls`, `exclusion`
