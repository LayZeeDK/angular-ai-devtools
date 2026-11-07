# Inspection delta — M036 resource-lifecycle

Measured 2026-11-07 against the audit in force: `.project/research/DOCS-AUDIT.md` at `c9451b1` (144 documents, 533
claims). This records what moved since that base; it does **not** claim that any changed code was audited.

## Audited documents

| Measure | Result |
|---|---|
| `docs/` files changed | **0** |
| `references/` files changed | **0** |
| Audited planning records changed | **2** — `AGENTS.md`, `plans/angular-ai-devtools-program-backlog.md` |

The audited corpus has not moved. Every claim the audit makes about `docs/` still describes the documents it names, and the
two planning records that did change carry rulings (A12–A20) rather than claims about code.

## Non-audit paths changed

145 paths changed since `c9451b1`, by area:

| Area | Count |
|---|---|
| `.project/` (bookkeeping, archives, plans, reviews) | 81 |
| `scripts/` | 20 |
| `research/` | 12 |
| `apps/` | 11 |
| `spikes/` | 8 |
| `extension/` | 6 |
| `.commandcode/` (skill manifests, taste) | 4 |
| `AGENTS.md`, `plans/` (audited) | 2 |

## What this delta does not settle

The changed code above was **not** audited by this measurement; it was verified by the milestones that changed it —
M034's legacy explainer, M035's readiness explainer, and the tooling work recorded in
`~/.commandcode/references/gsd-path-autonomy-findings.md`. Re-auditing that code is the audit's decision to make, not this
record's.

## Consequence for M036

M036 may start its definition against the audit in force without a re-audit step: the documents it would consult are
unchanged, and the corpus it would contradict is the same one M035 measured against.
