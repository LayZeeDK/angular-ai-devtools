---
id: T007
title: Record the autonomy-gaps analysis and run the project Verify at the milestone head
wave: 5
deps: [T001, T002, T004, T006]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - docs/autonomy-gaps.md
  - scripts/autonomy-gaps.test.mjs
  - .project/research/DOCS-AUDIT.md
---

# T007 — Record the autonomy-gaps analysis and run the project Verify at the milestone head

## Context

The owner's instruction asks for two things at once: ship the milestone through the GSD Path userflow,
and analyse what would have let it run without a human — improving user-scope rules, GSD Path itself
and the user-owned scripts — then implement the changes and verify them where possible. The
repository-side half of that analysis is this task's deliverable, and its audience is the next
milestone's orchestrator, who has no memory of this run. It must be honest by construction: a run that
did not happen may not read as one that did, a static token pin may not be presented as a behavioural
verification, and a user-scope edit may not be described as part of this checkout's history. The same
task closes the last documentation hole — a new Markdown file under `docs/` is outside the docs audit's
derived inventory until the audit lists it — and runs the project Verify at the milestone head.

## Approach

- Write `docs/autonomy-gaps.md` from this run's own record: the four helper defects, the dispatch
  document families, the audit's undecidable rows, and any seam that degraded (a pin that became a
  contract probe because no static token pair was nameable). One `## Gap — ` section per gap this
  milestone actually met, no speculative gaps, no gap the milestone did not touch.
- Each section carries five fields and nothing else invented: `Met:` what stopped the run and at
  which point, quoting the helper's own output or the absolute path it named; `User-scope change:` the
  absolute file under the user-scope tree, the behaviour before and after, and the explicit statement
  that the edit was made outside this checkout; `Pin:` the repository assertion that fails without the
  change, named by file, rule id and exact case title; `Verified:` the command actually executed with
  its exit status and an output tail, or the literal `not-run` with the reason; `Remaining:` what
  still needs a human and what a later milestone would have to build to remove it.
- Take every `Pin:` identity from the landed test files, never from memory: read the case titles in
  scripts/user-scope-autonomy.test.mjs and scripts/docs-audit-disposition.test.mjs and copy them
  exactly. A cited title that does not exist is a defect, and the shape test below fails on it.
- Take every `Verified:` line from a command you ran in this task. Re-run the pin you cite rather than
  trusting a Log entry; record the exit status and a few lines of output. Where the user-scope fix
  could not be probed at all, write `not-run` and say why — "where possible" is what licenses that
  field.
- Close the document with a section stating what it does not prove: no run is claimed that did not
  happen, no static half of a pin is presented as a behavioural verification, no user-scope change is
  claimed to be in this repository's history, and no model name, work address or domain appears
  anywhere in the file.
- Inventory: `check_docs_audit.py` derives its frozen inventory from tracked and untracked Markdown,
  so `docs/autonomy-gaps.md` must be listed under `## Descriptive docs` with its scope reason — it
  narrates one run and the pins that guard it rather than asserting repository behaviour — and the
  Summary's descriptive tally moves by one. Issue no queue number and invent no claim row for it.
- Write `scripts/autonomy-gaps.test.mjs` to hold the shape: the scope note and closing section exist,
  every `## Gap — ` section carries the five fields with non-empty values, every `Pin:` names a test
  file that exists and a case title that file contains, every `Verified:` either carries an exit
  status or reads `not-run` with a reason, the file names no model slug, work address or domain, and
  the audit lists the document as descriptive with the tally agreeing.
- Then run the project Verify at the milestone head — `npm run check`, `npm test` and
  `npx nx run angular-ai-devtools:build-extension` — in that order, and record each exit status and an
  output tail in the Log. A non-zero exit blocks this task; do not report success over a red command
  and do not narrow a command to make it pass.
- N3: must not weaken, skip or delete an existing check, test, audit row or Verify command to reach
  green — including narrowing the project Verify itself.
- Timing and side effects: the project Verify is the heaviest command in the milestone and must not
  run beside another heavy Verify.
- Runtime state: read-only apart from the three declared files — no browser, no instance, no portal
  run, no scratch file left in the repository root. The archive tree and the parked taste rows are
  read-only in this task; a taste preference is never a document this milestone writes.

## Interface contract

None

<!-- The pin identities this task cites are fixed by the owning tasks' own Acceptance criteria and by
     PLAN.md `## Held-out checks`; nothing else crosses this seam, so no shared shape is duplicated
     here. -->

## Intent coverage

- SC3

## Acceptance criteria

1. `docs/autonomy-gaps.md` carries a scope note and one `## Gap — ` section per gap this milestone actually met, and every section carries `Met:`, `User-scope change:`, `Pin:`, `Verified:` and `Remaining:` with non-empty values.
2. Every `User-scope change:` field names the absolute file under the user-scope tree, the behaviour before and after, and states explicitly that the edit was made outside this checkout.
3. Every `Pin:` field names a test file that exists, a rule id and the exact case title that file contains, and every named case passes at this head.
4. Every `Verified:` field carries a command with its exit status and an output tail, or the literal `not-run` with the reason; no run is described that did not happen.
5. The closing section states what the document does not prove, and the file contains no model name, work address or domain.
6. `.project/research/DOCS-AUDIT.md` lists `docs/autonomy-gaps.md` under `## Descriptive docs` with its scope reason and the Summary's descriptive tally incremented by exactly one, so `check_docs_audit.py` still exits 0 at this head.
7. The project Verify runs at the milestone head: `npm run check`, `npm test` and `npx nx run angular-ai-devtools:build-extension` each exit 0, and a non-zero exit blocks the task with its output tail recorded in the Log.
8. `scripts/autonomy-gaps.test.mjs` pins items 1, 2, 4, 5 and 6 and is green at this head.

## Verify

```bash
node --experimental-strip-types --test scripts/autonomy-gaps.test.mjs scripts/docs-audit-disposition.test.mjs && npm run check && npm test && npx nx run angular-ai-devtools:build-extension
```

Heavy: yes

## Log

- 2026-11-01 — created by planner
