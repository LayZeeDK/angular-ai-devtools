# Research Handoff

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — skipped → none — the question asks for measured numbers in this repository, not background on Angular or on AI DevTools.
- `stack` — skipped → none — no library or API choice is in play; the open item is two numeric caps.
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — a wrong chunk size and a Summarizer that summarises the tool declaration instead of the result are the two quiet failures M019 must design against.
- `similar` — skipped → none — no external product's chunking strategy informs these numbers; they are properties of the models this repository already runs.
- `spike-limits` — dispatched → `.project/research/evidence-spike-limits.md` — S7, S14, S15 and S19 are the spikes that set the chunk size and the prompt cap.

## Question assignments

- `` [RESEARCH] What chunk size and prompt cap do S7, S14, S15 and S19 actually measure, and does any of them change the 3.6 caps? `` → `pitfalls`, `spike-limits`
