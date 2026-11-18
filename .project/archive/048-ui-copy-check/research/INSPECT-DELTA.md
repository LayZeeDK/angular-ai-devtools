# M048 ui-copy-check — inspection delta

Measured delta against the audit frozen at `337047455bae67f5e05ccf25ecd0909b0c9bf448`.

## Gate

`check_docs_audit.py --repo .` exits 0 at this head: coverage equals the derived inventory, 525
claims over 111 documents plus one descriptive, and the carried rulings are intact.

## Changed since the audit head

197 paths changed. Seven are audited documents, and every one was edited or created by M046's
`fix-doc` corrections, each held by the suite that reads the corrected artefact:
`.commandcode/skills/monitor-ci/SKILL.md`, `AGENTS.md`,
`plans/angular-ai-devtools-program-backlog.md`, `references/ai-browsers-verification.md`,
`references/edge-dev-aion-model.md`, `research/spikes/capability-dependency-matrix.md`, and the new
`.commandcode/taste/workflow/taste.md`. The remaining 190 are `.project/` bookkeeping, M047's new
surface and recordings, `research/raw/`, `scripts/`, `apps/` and `tests/`.

## What this delta does not claim

It does not claim any changed code was audited as documentation, and it does not claim a document
outside those seven was re-read. M048's own research happens in its define and plan phases against
the code.

## Consequence for the plan

The roadmap's premise — that the panel can compare a page's rendered strings against its own digest
— names two things this repository must actually hold before anything can be joined: the record of
rendered text, and the digest it is compared to. M048's first task must measure whether both exist
as observables, as M047's T001 did for the component tree.
