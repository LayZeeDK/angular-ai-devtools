# Inspect delta — M035 onpush-readiness

Audit in force: `DOCS-AUDIT.md` at `c9451b1`, 144 documents, 533 claims.
Measured 2026-11-06, before planning M035, at the head that shipped M034.

## Audited documents changed since the audit base

Two, both planning records rather than product documentation:

- `AGENTS.md` — the project-scope programme rules added when Generation 2 opened.
- `plans/angular-ai-devtools-program-backlog.md` — rulings A12–A15 and the two
  Generation 4 entries, added this session.

The product documentation corpus under `docs/` and `references/` is **untouched** since the audit base:
`git diff --name-only c9451b1 HEAD -- docs references` returns nothing. So no audited claim about
product behaviour has been invalidated by a documentation edit.

## Non-audit paths changed

103 paths in total, by area: `.project` 55 (bookkeeping: archives 032–034, STATE, ROADMAP, CHARTER,
review and task records), `scripts` 16, `research` 10, `apps` 7, `spikes` 6, `.commandcode` 4,
`extension` 3, plus the two documents above.

These are the changes M032, M033 and M034 made while shipping: one extension module per milestone
(`lint-core`, `router-diagnostic`, `legacy-structure`), their capture suites and recordings, the panel
surfaces and their route registrations, and the fixture pages the captures drive.

## What this delta does not claim

It does not claim the changed code was audited. It records that the audited corpus has not moved, so the
audit in force still describes the documents it names — and it names the two planning documents whose
growth the next planner should read directly.
