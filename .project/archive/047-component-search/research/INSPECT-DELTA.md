# M047 component-search — inspection delta

This milestone's inspect is a measured delta against the audit frozen at
`337047455bae67f5e05ccf25ecd0909b0c9bf448`, not a re-audit of the repository.

## What the audit gate says at this head

`check_docs_audit.py --repo .` exits 0: the audit's coverage equals the inventory the gate derives,
525 claims across 111 documents plus one descriptive, and the 70 carried rulings are intact. The
audit is therefore current for the tree this milestone starts from.

## What changed since the audit head

169 paths changed, `33704745..HEAD`. They split as:

- **7 audited documents**, each edited by M046's `fix-doc` corrections or created by it:
  `.commandcode/skills/monitor-ci/SKILL.md`, `AGENTS.md`,
  `plans/angular-ai-devtools-program-backlog.md`, `references/ai-browsers-verification.md`,
  `references/edge-dev-aion-model.md`, `research/spikes/capability-dependency-matrix.md`, and the
  new `.commandcode/taste/workflow/taste.md`. Every one is covered by a suite that reads the
  corrected artefact (`scripts/docs-correction.test.mjs`), so their rows are proven rather than
  assumed.
- **111 `.claude/` paths, all deleted by M046's T002**, which is why they no longer appear in the
  inventory the gate derives. A deletion cannot leave a stale claim behind; it removes the claim.
- **44 non-document paths** — `.project/` bookkeeping, `apps/`, `extension/`, `scripts/`,
  `tests/`, `research/`, `package.json`.

## What this delta does not claim

It does not claim the changed code was audited as documentation, and it does not claim any document
outside the seven was re-read. The `component-search` milestone's own research happens in its define
and plan phases against the code, not by retroactively auditing prose.

## Consequence for the plan

The roadmap entry's premise — that a component can be found from what the page shows — is a
code-observable question, so M047's first task must measure the current search behaviour before any
join is designed, as M046's T001 did.
