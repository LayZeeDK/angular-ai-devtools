# Research Handoff

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `domain` — skipped → none — no domain, terminology or prior-art question; the milestone corrects existing documents against code that already exists.
- `stack` — skipped → none — no stack choice; the stack is fixed by the charter and the milestone changes no dependency.
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — the brownfield failure modes that let an audit row stay undecidable: a claim whose only evidence is an external checkout, a command the repository does not ship, and a provenance fingerprint that goes stale when a later edit lands.
- `similar` — skipped → none — no comparable-product question; this is bookkeeping inside one repository.
- `audit-verifiability` — dispatched → `.project/research/evidence-audit-verifiability.md` — custom dimension supplementing `pitfalls`: which of the 111 `unverifiable` rows the commands this repository already ships can now settle, and which need evidence the milestone cannot produce.

## Question assignments

- `` [RESEARCH] Which `unverifiable` M014 audit rows are now decidable with the commands the repository already ships, and which need evidence this milestone cannot produce? `` → `pitfalls`, `audit-verifiability`
