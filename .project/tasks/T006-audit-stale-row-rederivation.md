---
id: T006
title: Re-derive the audit rows for the documents the corrections changed
wave: 4
deps: [T003, T005]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T006 — Re-derive the audit rows for the documents the corrections changed

## Context

T005 corrected sixteen documents, which is exactly the state M013's final gap review caught: an
audit row quoting a sentence its corrected document no longer makes. A claim row is a quotation of
what a document says, so a correction retires the old claim and creates a new one, and the audit's
gate binds every non-verified claim to exactly one queue row — so the claim table, the queue, the
Summary and each `## User rulings` binding move together or not at all. This task owns that pass and
nothing else, which keeps the audit with a single editing owner at the milestone's most error-prone
step.

## Approach

- Work from the diff T005 landed: for each declared document, list the sentence it no longer makes
  and the sentence it makes now, and treat each as one item. A corrected claim's row is replaced, not
  edited in place, when its claim text changes — the gate binds a queue row to a document and claim
  text, so a stale row quoting the retired sentence cannot survive.
- Re-derive, do not transcribe. For every corrected claim, read the document and the file or command
  T005 cited, then write the verdict that evidence proves and the evidence cell naming the corrected
  sentence and the case in scripts/docs-correction.test.mjs that asserts it. A correction the
  evidence does not prove stays `stale` and says what is still owed.
- Remove every queue row whose claim is now `verified`; keep every surviving row's number; keep the
  two numbers T003 issued for the split row; issue no number above the highest one T003 issued unless
  a claim genuinely changed identity, and if one did, say why in the Log. Numbers bind to items and
  are never reused.
- Recompute the Summary from the body rather than by arithmetic, and keep the descriptive list
  unchanged.
- Gate discipline, exactly as T003: gate once with `--prior-audit` pointing at the audit as it stands
  at this task's layer base while the verdicts, tallies, queue and numbering are in place and every
  `Planned` value is still what the base holds, proving the prefix property; then again without
  `--prior-audit` after setting `planned` to the task ids that closed or corrected each row, which
  runs the full validation. Append any new `## User rulings` row, never insert or reorder one.
- N4: must not drain a row by ruling it `accept-drift`, `planned: n/a` or `fix-doc` without the
  owner's words recorded verbatim. Quote the recorded grant verbatim in every new ruling row, add no
  disposition the milestone's intent corrections do not carry, and never touch the taste tree.
- N3: must not weaken, skip or delete an audit row, gate, check or Verify command to reach green. A
  row that cannot be settled stays `unverifiable` or `stale` with its settling command named — that is
  the milestone's outcome, not a failure.
- A row may not quote a sentence its document no longer makes: after the pass, read every remaining
  row whose document T005 touched against the document itself, one at a time. That comparison is the
  whole point of this task.
- Edit only `.project/research/DOCS-AUDIT.md`; no document, skill, script or `.project/archive` path
  moves here, and no scratch file is left in the repository root.

## Interface contract

- Every corrected claim is one sentence stating the fact the document now asserts, and beside it the path or command that proves the fact at this head with the date it was read.
- A re-derived audit row quotes the corrected sentence of its document verbatim and cites the case that asserts it, whose citable identity is the repository path of the test file, then `::`, then the exact case title.

## Intent coverage

- SC2

## Acceptance criteria

1. Every claim row whose document T005 corrected is re-derived: its claim text is a sentence the document now makes, its verdict is what that document plus its cited evidence proves, and its evidence names both the corrected sentence and the test case that asserts it.
2. No row remains that quotes a sentence its document no longer makes, checked document by document against the files T005 changed.
3. Every queue row whose claim became `verified` leaves `## Remediation queue`; every persisting row keeps its number; the numbers T003 issued are preserved; no retired number is reused; and a number is issued only for a claim whose identity genuinely changed, with the reason recorded in the Log.
4. The queue binds each non-verified claim exactly once and its numbers are unique and strictly increasing.
5. The Summary tallies equal the claim-row tallies the gate computes and the descriptive list is unchanged.
6. `## User rulings` keeps every prior row in order, holds every `Planned` value the layer base held until the final pass, and sets `planned` to the task id that closed or corrected each row this milestone finished.
7. `check_docs_audit.py` exits 0 over the audit at this head, the gate run with `--prior-audit` over the base file passes for every column the pass did not charter, and only the declared file changed.

## Verify

```bash
python -B "$HOME/.commandcode/skills/gsd-path/scripts/check_docs_audit.py" --repo . --primary "D:/projects/sandbox/angular-ai-devtools" --audit .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- 2026-11-01 — created by planner
