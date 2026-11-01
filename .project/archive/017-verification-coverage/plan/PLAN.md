# Plan — Angular AI DevTools (M017 verification-coverage)

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3   <!-- review→fix→re-review loops per wave before escalating -->
- wave_budget: none      <!-- no wall-clock, token or cost cap on a wave -->
- review_panel: off      <!-- copied from INTENT.md; the installer family patch has not landed -->
- finding_skeptics: off  <!-- copied from INTENT.md -->

## Wave 1 — risk burn-down

Goal: Prove that a regressed installed helper goes red by name in one run. The four defects M016
met become pins that name the absolute file and the rule id, inside the timing budget the suite
already spends, and the two fixture seams no pin can be written without (the serial-retry token
pair, and a synthetic `.project` tree that `plan-lint` and `check_handoffs` accept) are measured
before any pin depends on them. If this wave fails, the milestone's first success criterion has no
falsifiable form and nothing later is worth building.
Review depth: full

## Wave 2 — the dispatch-document pin set

Goal: Extend the same suite to the dispatch documents the owner named — the orchestrator prompt's
paid-route table, the paid model plan, the subagent brief contract, the task and reviewer
templates, and the worked example a brief must carry — so a reverted route table or a dropped
template section fails a named pin instead of costing an operator a workaround. Same files, same
rule shape as wave 1: a named token or a parsed helper field, never a paragraph's wording.
Review depth: full

## Wave 3 — docs-audit disposition of the decidable rows

Goal: Drain every docs-audit row this repository's shipped commands can decide. Seven rows are
re-derived at this head, the 65 rows that keep `unverifiable` gain the literal command that
settles them, row 64 is split and renumbered, and the summary tallies, queue numbers and
`## User rulings` bindings are re-cut together, so `check_docs_audit.py` still exits 0 and the queue
becomes workable by an agent. The row-disposition rules E5, E6 and E7 are then pinned by a test
that fails when a later edit loses them.
Review depth: full

## Wave 4 — stale document corrections and their audit rows

Goal: Correct the stale claims the audit rules `fix-doc`, in the tree the decision names, and then
re-derive their audit rows so no row quotes a sentence its corrected document no longer makes —
the cross-wave defect M013's final gap review caught. Every corrected claim cites what proves it at
this head, and the two skills trees stay byte-identical.
Review depth: verify-only

## Wave 5 — the autonomy analysis and the milestone-head gate

Goal: Record the owner-directed analysis of why a milestone still needs a human in
`docs/autonomy-gaps.md`, where the next milestone's orchestrator reads it; close the docs-audit
inventory over that new document; and run the project Verify at the milestone head so a red
command cannot pass as done. This is the last task and it cannot report success over a non-zero
exit.
Review depth: full

## Intent coverage

<!-- One row per acceptance item. Every SCn is covered, and each row's task owns that SCn. -->

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T001 | AC2 |
| SC1 | T001 | AC3 |
| SC1 | T001 | AC4 |
| SC1 | T001 | AC5 |
| SC1 | T001 | AC6 |
| SC1 | T001 | AC7 |
| SC1 | T001 | AC8 |
| SC1 | T002 | AC1 |
| SC1 | T002 | AC2 |
| SC1 | T002 | AC3 |
| SC1 | T002 | AC4 |
| SC1 | T002 | AC5 |
| SC1 | T002 | AC6 |
| SC1 | T002 | AC7 |
| SC2 | T003 | AC1 |
| SC2 | T003 | AC2 |
| SC2 | T003 | AC3 |
| SC2 | T003 | AC4 |
| SC2 | T003 | AC5 |
| SC2 | T003 | AC6 |
| SC2 | T003 | AC7 |
| SC2 | T003 | AC8 |
| SC2 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC2 | T004 | AC3 |
| SC2 | T004 | AC4 |
| SC2 | T004 | AC5 |
| SC2 | T004 | AC6 |
| SC2 | T006 | AC1 |
| SC2 | T006 | AC2 |
| SC2 | T006 | AC3 |
| SC2 | T006 | AC4 |
| SC2 | T006 | AC5 |
| SC2 | T006 | AC6 |
| SC3 | T005 | AC1 |
| SC3 | T005 | AC2 |
| SC3 | T005 | AC3 |
| SC3 | T005 | AC4 |
| SC3 | T005 | AC5 |
| SC3 | T005 | AC6 |
| SC3 | T005 | AC7 |
| SC3 | T005 | AC8 |
| SC3 | T007 | AC7 |
| SC3 | T007 | AC8 |

## Held-out checks

<!-- E4 and E8 are dismissed in INTENT.md and are deliberately absent. Each row names a node:test
     case the owning task writes with exactly that title. -->

| Edge | Task | Test |
|------|------|------|
| E1 | T001 | scripts/user-scope-autonomy.test.mjs::E1 helper pin: a removed token fails naming the absolute file and the rule id, and a reworded copy passes |
| E2 | T001 | scripts/user-scope-autonomy.test.mjs::E2 helper pin: an absent install or helper dir fails naming the resolved absolute path |
| E3 | T001 | scripts/user-scope-autonomy.test.mjs::E3 helper pin: two runs agree and write nothing into the checkout |
| E5 | T004 | scripts/docs-audit-disposition.test.mjs::E5 an audit with zero unverifiable rows is a pass |
| E6 | T004 | scripts/docs-audit-disposition.test.mjs::E6 queue numbers stay unique, increasing and bound to their items |
| E7 | T004 | scripts/docs-audit-disposition.test.mjs::E7 every remaining row names a shipped command, never a prose verb |

## Dependency notes

**T001 → T002 (files and data).** Both tasks change `scripts/user-scope-autonomy.mjs` and
`scripts/user-scope-autonomy.test.mjs`; T002 extends the pin table and the entry point T001
creates, so the second task would overwrite the first without the edge. A reviewer sees it as one
`HELPER_PINS` table plus one `BRIEF_PINS` table in the same module and one `check()` that runs both.
The wave split is the brief's shape: the four helper defects are the plan-invalidating risk and
belong in wave 1, the dispatch documents in wave 2.

**Wave 3 carries two tasks instead of one.** The brief's wave 3 is one deliverable, but the gate
requires each held-out edge's `Test` cell to name a test file listed in the owning task's `files`,
and `.project/research/DOCS-AUDIT.md` is not a test. T003 therefore owns the audit edit and T004
owns the E5/E6/E7 pins over it; T004 declares the audit file because its test reads and mutates
copies of it, which also makes T003's gate run a precondition of T004 landing. Splitting also keeps
each run inside the eight-acceptance ceiling: the audit edit alone rewrites 79 rows and two tallies.

**T003 → T005 (data).** T005 corrects exactly the documents whose rows T003 re-classifies or keeps
`fix-doc` at the head; landing the corrections against an audit that still calls them `unverifiable`
would move the same row twice in two incompatible directions.

**T003, T005 → T006 (files and data).** T006 is the only task that re-derives the stale rows after
the corrections land, so the audit has one editing owner at a time. It depends on T003 for the
numbering (row 64 retired, 99 and 100 issued) and on T005 for the corrected sentences its claim
text must quote. The wave-4 split exists because M013's recorded lesson is that a final gap review,
not a spot check, caught an audit row quoting a sentence its document no longer made: the
re-derivation is a deliverable of its own and gets its own gate.

**T001, T002, T004, T006 → T007 (data and landed effect).** T007's `Pin:` fields cite the case
titles T001 and T002 land and its Verify runs T004's pins; it edits the audit after T006 so the
inventory it closes over stays consistent. The split of the brief's wave 5 (analysis plus the
project Verify) from the audit's final re-derivation keeps one task under the eight-acceptance
ceiling and leaves the last task able to prove a green head.

**Why T007 also touches the audit.** `check_docs_audit.py` derives its frozen inventory from
`git ls-files --cached --others --exclude-standard`, so a new Markdown file under `docs/` is
uncovered until the audit lists it. `docs/autonomy-gaps.md` narrates one run and its pins rather
than asserting repository behaviour, so it is listed under `## Descriptive docs` with its scope
reason and the Summary's descriptive tally moves by one; no queue number is issued and no claim row
is invented for it.

**Project verify is copied by no task.** Only T007 owns SC3, whose text names the three commands;
its Verify runs them chained after its own test rather than as a bare copy, so a red sub-command
still fails the task.

**Contract sharing.** T001 and T002 carry the same `## Interface contract` body — the issue shape,
the pin-row shape and a pin's citable identity — because T002 extends the table T001 lands in the
same module. T007 consumes only that identity, which each owning task's Acceptance criteria state and
this plan's `## Held-out checks` table records, so its contract stays `None` rather than repeating
two shapes it never uses.

**The `## User rulings` `planned` column.** The audit's gate requires every prior row, including its
`Planned` value, to be an exact ordered prefix of the current table when `--prior-audit` is passed,
while the section's own prose says the plan sets `planned` to the task id that does the work. Each
audit-editing task therefore gates twice: once with `--prior-audit` against the file at its own
layer base while the verdict, tally, queue and numbering edits are in place and `planned` is still
`no` (proving the prefix property holds), then again without `--prior-audit` after the `planned`
cells move (the full validation: tallies, queue binding, strictly increasing numbers, formats). New
`## User rulings` rows are appended, never inserted, so the prefix property is preserved by
construction.
