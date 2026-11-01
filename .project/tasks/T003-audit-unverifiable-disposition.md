---
id: T003
title: Dispose of the 79 unverifiable docs-audit rows and re-cut the queue
wave: 3
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T003 — Dispose of the 79 unverifiable docs-audit rows and re-cut the queue

## Context

The docs audit at this head carries 500 claim rows, 79 of them `unverifiable`, and every one of
those 79 states in its evidence what a human would do next — "re-measure", "needs a portal run",
"read the package" — instead of naming the command that settles the row. The research file
.project/research/evidence-audit-verifiability.md classifies all 79: 7 are decidable with files or
commands already in this checkout, 28 need a live or on-device run, 37 need the external portal
checkout, and 7 no command here can ever decide.
The synthesis settled what each class becomes; this task applies it and keeps the gate green, which
means moving a verdict, its queue row, the Summary tally and its `## User rulings` binding together
or not at all. The audit gate is exact: summary tallies must equal body tallies, each queue row must
bind one non-verified claim, queue numbers must be unique and strictly increasing, and no retired
number may be reused.

## Approach

- Read .project/research/evidence-audit-verifiability.md section by section alongside the audit.
  Its row-classification table is the input: it names, per queue number, the class and the settling
  command or path. Do not invent a settling command the research did not name, and do not re-derive
  a row the research puts outside this milestone's reach.
- Re-derive the 7 decidable rows at this head before writing anything (verdicts as the synthesis
  settled them: 20, 33, 65, 66 and 85 become `verified`; 16 and 92 become `stale`), and date every
  reading with the path or command it came from. Two of them are host-dated measurements — the
  Playwright browser metadata (node_modules/playwright-core/browsers.json and the spike copy) and
  the harness extension copy under tmp/control-angular-devtools/extension/ — so cite the file you
  read and the date you read it, and let a later re-read supersede it.
- Split queue 64 into two claim rows inside `## Doc: AGENTS.md`: the test-count half becomes `stale`
  (the shipped suite for that check reports ten tests where the document says nine) and the measured
  `nodes: 1` half stays `unverifiable` with the live run named. Both halves change claim text, so the
  document-and-claim identity changes: retire number 64, leave its `## User rulings` row in place as
  durable memory, and give the two halves new numbers above every prior queue number and every
  `## User rulings` Queue #.
- Rewrite only the Evidence cell and the Suggested action of the 72 rows that keep `unverifiable`, so
  each names a literal command or path this repository ships. The vocabulary the synthesis allows is
  a driver subcommand, a shipped check under the skills trees, an Nx target, a `node --test` file, a
  `git cat-file` read, or a JSON config the checkout carries. A prose verb is not a settling check.
  The 7 undecidable rows keep their verdict and name the external artifact that would settle the
  claim together with the statement that no command in this checkout reaches it.
- The claim-table row is the source of truth; the Summary and the queue follow it. Recompute the
  Summary from the body rather than by arithmetic, and expect the synthesis targets: verified 407,
  stale 22, aspirational 0, unverifiable 72, descriptive 24, claim rows 501 across 117 documents.
  A reading that contradicts a target is a block to report, not a number to adjust.
- Update the header's `Audited` date and `Audited HEAD` to the commit this pass reads.
- N3: must not weaken, skip or delete an audit row, gate, check or Verify command to reach green.
  The reviewer reads the diff for a deleted row, a loosened rule or a dropped queue number that is
  not one of the six this task drains.
- N4: must not drain the queue by ruling a row `accept-drift`, `planned: n/a` or `fix-doc` without
  the owner's words recorded verbatim. Every ruling in this file rests on the recorded grant; quote
  the owner's instruction verbatim in each new `## User rulings` row, quote nothing you cannot point
  at in the milestone's intent corrections, and never touch the taste tree.
- Gate discipline: the audit gate refuses a `## User rulings` table whose prior rows changed,
  including their `Planned` value, when it is given the pre-rewrite file. So gate twice — once with
  `--prior-audit` pointing at the audit as it stands at this task's layer base while the verdict,
  tally, queue and numbering edits are in place and `planned` is still `no`, proving the prefix
  property holds; then without `--prior-audit` after the `planned` cells move, which runs the full
  validation. Append new `## User rulings` rows, never insert or reorder one.
- Edit only `.project/research/DOCS-AUDIT.md`. No document, skill, script or `.project/archive` path
  moves here, and no scratch file is left in the repository root.
- The row-disposition rules this pass establishes are pinned by a later task in this wave, so state
  each rule in the audit's own prose where an agent working the queue will read it: a row that keeps
  `unverifiable` carries its settling command, and a row with no command keeps its verdict and says
  why nothing here reaches it.

## Interface contract

- The settling-check vocabulary a kept `unverifiable` row may name is exactly: a driver subcommand through a `control.mjs` script, a shipped check or test file under either skills tree (a path ending `.mjs`), an `npx nx run` target, a `node --test` invocation, a `git cat-file` read, or a tracked JSON config path.
- A row that no command in this checkout reaches carries the literal phrase `no command in this checkout` plus the external artifact that would settle it, and is the only exemption from the vocabulary above.

## Intent coverage

- SC2

## Acceptance criteria

1. The five rows the synthesis settles as correct (queue 20, 33, 65, 66 and 85) move to `verified`, each with a dated evidence cell naming the file or command that settled it, and each leaves `## Remediation queue`.
2. Queue rows 16 and 92 move from `unverifiable` to `stale`, keep their queue numbers, stay queued with class `fix-doc`, and their evidence carries the dated reading that contradicts the document.
3. Row 64 is split inside `## Doc: AGENTS.md` into a `stale` test-count claim and an `unverifiable` measured-run claim, each queued under a new number above every prior queue number and every `## User rulings` Queue #, with 64 retired and never reused.
4. Every remaining `unverifiable` row keeps its verdict and gains, in both its Evidence cell and its Suggested action, the literal shipped command or path that settles it, taken from that row's classification in `.project/research/evidence-audit-verifiability.md`.
5. The seven undecidable rows (68, 69, 71, 74, 76, 86 and 89) keep `unverifiable` and name the external artifact that would settle the claim plus the statement that no command in this checkout reaches it.
6. Queue numbers are unique and strictly increasing, every persisting row keeps its number, no retired number is reused, and the queue binds each non-verified claim exactly once.
7. The Summary tallies equal the claim-row tallies the gate computes and match the settled targets of 407 verified, 22 stale, 0 aspirational, 72 unverifiable and 501 claim rows across 117 documents, with the descriptive list unchanged at 24; a reading that contradicts a target is reported as a block, never absorbed by adjusting the number.
8. `## User rulings` keeps every prior row and its `Planned` value in order until the final pass, appends one row per newly numbered item quoting the owner's words verbatim, sets `planned` to the owning task id for each row this milestone closes or corrects, and `check_docs_audit.py` exits 0 over the edited audit at this head.

## Verify

```bash
python -B "%USERPROFILE%\.commandcode\skills\gsd-path\scripts\check_docs_audit.py" --repo . --primary "D:/projects/sandbox/angular-ai-devtools" --audit .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- 2026-11-01 — created by planner
