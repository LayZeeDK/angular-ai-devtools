# Inspect delta — Generation 3

Generation 2's audit is still the authority and was **not** re-run. This record
states what changed since it, so the next milestone's define step reads a
measured delta rather than an assumption that the world stood still.

## Audit in force

- Artifact: `.project/research/DOCS-AUDIT.md`, 281 352 bytes, 79 distinct `.md`
  paths named in its findings.
- Audited HEAD: `c9451b1527ae90753315edacd43a30abd2187c6c` (2026-11-05).
- Current inspect HEAD: `.project/archive/043-stability-explainer` shipped at
  `d94502d1`.

## Measured delta, `c9451b15..d94502d1`

```
changed paths since the audit base            518
  of which audited `.md` documents              9
  of which not named in the audit             511
```

The nine audited documents that changed:

```
.project/ROADMAP.md                              (bookkeeping, not a doc finding)
.project/research/DOCS-AUDIT.md                  (the artifact itself)
plans/angular-ai-devtools-program-backlog.md     (A10, A11 rulings and the generations)
research/spikes/README.md
research/spikes/capability-dependency-matrix.md
research/spikes/s11-answer.md
research/spikes/s12-answer.md
research/spikes/s13-answer.md
```

Seven of those are reviewed documentation; two are this pipeline's own
bookkeeping. Nothing in the audit's 34 unverifiable rows was resolved or
invalidated by a change to the document that carries it.

## What this record does not claim

- It does not claim the repository's **code** was audited. Only documentation
  was; the code-path evidence the milestones rely on is produced per milestone
  by that milestone's own measurement task.
- It does not claim the 511 untouched paths need no inspection. It claims only
  that the audit's findings about them still rest on the commit they were made
  against.
- It does not re-derive the audit. Re-running it costs eleven chunks over 145
  documents; the delta is what changed, and it is seven documents.

## Why a delta rather than a re-audit

Generation 2 shipped twelve milestones whose own tasks measured their own
surfaces; the audit's role is to say which claims the documentation makes about
the code, and that corpus moved by seven files in nine years of milestones. A
re-audit would re-prove what is already recorded, so the honest form is this
delta plus the per-milestone measurement discipline every task already carries.
