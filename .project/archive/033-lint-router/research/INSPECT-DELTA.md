# Inspect delta — M033 lint-router

## Why this is a delta and not a re-audit

`DOCS-AUDIT.md` was assembled for programme 2's opening at `d621a3f` and is current: 144
documents, 533 claims, 205 queue rows, and it passes `check_docs_audit.py`. A full re-audit would
dispatch eleven chunks to re-verify 143 documents that have not changed in the hours since.

Measured instead:

```
audited documents:            144
changed since the audit base:   1
  plans/angular-ai-devtools-program-backlog.md
```

Every other path in `git diff --name-only d621a3f..HEAD` is `.project/` bookkeeping — the M032
archive, `ROADMAP.md`, `STATE.md` — which the audit does not cover and does not claim to.

## The one changed document

`plans/angular-ai-devtools-program-backlog.md` gained the owner's A10 and A11 rulings and a
reordered Generation 4 section. The change is **additive**: new rows in the ruling table and a
generation moved, with no claim about existing milestones altered. The audit's claims about that
document therefore still hold, and none is contradicted.

If a later milestone needs a claim from that document in the reordered region, it reads the
document itself — a plan cites what it read, not what an audit said about it.

## The codebase half

M032 shipped five tasks and 41 new tests; its archive is at `.project/archive/032-lint-core`.
The code this milestone will read — `extension/lint-*.js`, `apps/angular-ai-devtools/src/app/
panel-*.ts` — is present and green at `fa3e8af`. Planning reads the code; this note records that
the documentation side needs no re-audit, not that the code was audited.

## Consequence for the phase

The inspection evidence in force is the audit at `d621a3f` plus this delta. Nothing in the delta
changes a decision M033 would take: its scope is one explainer in the same generation, using the
same digests, surfaces and prohibitions that M032 established.
