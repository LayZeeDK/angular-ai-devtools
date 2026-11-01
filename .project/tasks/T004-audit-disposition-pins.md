---
id: T004
title: Pin the docs-audit disposition rules E5, E6 and E7 in a repository test
wave: 3
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/docs-audit-disposition.test.mjs
  - .project/research/DOCS-AUDIT.md
---

# T004 — Pin the docs-audit disposition rules E5, E6 and E7 in a repository test

## Context

T003 re-cut the audit so every remaining `unverifiable` row names a command that settles it, and the
three rules that keep the queue workable are still enforced by nothing: an empty disposition set
must be a pass, queue numbers must stay unique, increasing and bound to their item, and a settling
check must be a literal command rather than a prose verb. The audit gate that enforces the second
rule lives in the installed GSD Path skill, not in this checkout, so the repository's own guard is a
`node:test` file beside the audit. This task writes that file, drives the installed gate over
mutated copies of the audit, and makes the repository fail when a later edit loses any of the three
rules — the pattern `scripts/docs-correction.test.mjs` already uses for document claims.

## Approach

- Resolve the audit gate the same way the conformance suite resolves its helpers: through
  `resolveRulesRoot()` exported by scripts/user-scope-autonomy.mjs, then the gsd-path skill scripts
  directory under that root. When the install or the gate script is absent, fail naming the resolved
  absolute path and exit non-zero — never pass vacuously because a file outside the checkout is
  missing.
- Read `.project/research/DOCS-AUDIT.md` and the gate's own rules before writing an assertion. The
  gate validates the header lines, a Summary whose counts equal the body, one `## Doc:` section per
  inventoried document, a `## Descriptive docs` list disjoint from them, a remediation queue binding
  one classified row per non-verified claim, strictly increasing queue numbers, and a
  `## User rulings` table whose prior rows are an exact ordered prefix.
- E5: a synthetic audit with zero `unverifiable` rows must be a pass, not an error. Build the
  smallest fixture the gate accepts — header, Summary, one `## Doc:` section with verified claims,
  the same documentation listed once, an empty queue and one `## User rulings` row — and pass
  `--inventory` with exactly that fixture's document list so the gate never consults the real tree.
  Assert exit 0 and that the gate reports zero queued rows: the "names its settling check" rule
  applies only to rows that exist.
- E6: over the head audit, assert the positive case first — queue numbers unique and strictly
  increasing, row 64 absent, and the numbers that replaced it above every prior queue number and
  every `## User rulings` Queue #. Then mutate a temp copy three times, each gated with
  `--prior-audit` pointing at the head audit: renumber a persisting row and expect the persisting-item
  refusal, give a new item a retired number and expect the retired-number refusal, and give a new
  item a number at or below the prior maximum and expect the new-item refusal. Assert the exit status
  and one distinguishing substring per refusal, not the whole sentence.
- E7: for every queue row whose verdict is `unverifiable`, its Suggested action must contain at
  least one token from the settling-check vocabulary and must not be only a prose verb, and the seven
  undecidable rows must carry the literal phrase `no command in this checkout` plus the external
  artifact that would settle them. Build the negative case from a temp copy in which one row's action
  is restored to a bare prose verb, and assert the test fails for that row — a matcher that cannot
  fail on the base wording is not a pin.
- Keep fixtures under `os.tmpdir()` and delete them; mutate copies only. Nothing may be written into
  the checkout or the user-scope tree, and two consecutive runs must give the same verdict with
  `git status --porcelain` unchanged.
- The gate script is installed tooling and read-only: assert against it, never edit it. N3 forbids
  weakening or deleting an audit row, gate, check or assertion to reach green.
- N5: no task here edits user-scope tooling; the landing diff may only add this test file and the
  audit edits T003 already made.
- Each gate invocation costs well under a second; a handful per run is the budget. Do not spawn the
  installed helper suite.
- Write nothing outside the two declared files and leave no scratch file in the repository root.

## Interface contract

- The settling-check vocabulary a kept `unverifiable` row may name is exactly: a driver subcommand through a `control.mjs` script, a shipped check or test file under either skills tree (a path ending `.mjs`), an `npx nx run` target, a `node --test` invocation, a `git cat-file` read, or a tracked JSON config path.
- A row that no command in this checkout reaches carries the literal phrase `no command in this checkout` plus the external artifact that would settle it, and is the only exemption from the vocabulary above.

## Intent coverage

- SC2

## Acceptance criteria

1. E5: an audit with zero `unverifiable` rows validates as a pass — the settling-check rule is applied only to rows that exist and the check never requires at least one such row — in a case titled `E5 an audit with zero unverifiable rows is a pass`.
2. E6: over the head audit, queue numbers are unique and strictly increasing, row 64 is retired and not reused, and the numbers that replaced it exceed every prior queue number and `## User rulings` Queue #; three separate mutations of a temp copy make the gate fail with the persisting-item, retired-number and above-the-maximum refusals respectively, in a case titled `E6 queue numbers stay unique, increasing and bound to their items`.
3. E7: every remaining `unverifiable` row's Suggested action names a literal shipped command or path from the fixed vocabulary, a temp copy whose action is restored to a bare prose verb fails for that row, and the seven undecidable rows carry the `no command in this checkout` sentence instead — in a case titled `E7 every remaining row names a shipped command, never a prose verb`.
4. The test resolves the audit gate through the user-scope bridge the conformance suite already uses and, when the install or the gate script is absent, fails naming the resolved absolute path instead of passing.
5. Fixtures live under `os.tmpdir()` only: the test writes nothing into the checkout or the user-scope tree, and two consecutive runs give the same verdict with `git status --porcelain` unchanged.
6. `node --test scripts/docs-audit-disposition.test.mjs` is green at this head and names the resolved gate path in its output.

## Verify

```bash
node --experimental-strip-types --test scripts/docs-audit-disposition.test.mjs
```

Heavy: no

## Log

- 2026-11-01 — created by planner
