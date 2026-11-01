---
id: T004
title: Pin the docs-audit disposition rules E5, E6 and E7 in a repository test
wave: 3
deps: [T003]
status: done
agent: build_T004
base: 767868e01ceb7a8220b886bf1f81244e88149ec4
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
- 2026-11-01 — wrote `scripts/docs-audit-disposition.test.mjs` (three cases, titled exactly as PLAN.md's
  `## Held-out checks`). The gate resolves through `resolveRulesRoot()` to
  `~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py` and is asserted against, never edited; an
  absent install or script fails naming the absolute path, and no case spawns the installed helper suite.
  E5 builds a zero-disposition audit from a copy of the head audit (every non-verified claim dropped, the
  queue emptied, the Summary retallied) and requires exit 0 with `queue: 0`; the same copy with one
  `unverifiable` claim and an empty queue is refused, so the empty pass is a pass of the same gate. E6
  reads the head audit's numbers (unique, strictly increasing, 64 retired and not reused, 99 and 100
  anchored in `## User rulings`), gates the head audit against a reconstructed pre-re-cut prior, then
  makes three temp-copy mutations fail with the persisting-item, retired-number and above-the-maximum
  refusals, and a pristine copy pass. E7 walks every `unverifiable` row and requires a literal settling
  check in both its Evidence and its Suggested action, requires exactly the seven undecidable rows to
  carry `no command in this checkout` plus their external artifact, and proves the matcher bites when one
  row's action or evidence is restored to `re-measure` / `needs a portal run`. The audit itself needed no
  source fix and is copied into `os.tmpdir()` for every case. Verify: `node --experimental-strip-types
  --test scripts/docs-audit-disposition.test.mjs` → tests 3, pass 3, fail 0 (two consecutive runs, and a
  plain `node --test` run); `git status --porcelain` adds only this test file.
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): fail, exit 1; output tail:
  ```
  ✖ E6 queue numbers stay unique, increasing and bound to their items (65.7139ms)
    AssertionError [ERR_ASSERTION]: the head audit must pass the gate at C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\check_docs_audit.py; output: docs audit validation failed: Repo root does not match --primary (default --repo)
    
    
    1 !== 0
    
        at TestContext.<anonymous> (file:///C:/Users/LarsGyrupBrinkNielse/.gsd-path/projects/d10fb97cec6c7ac7/8919d4cefeb4a7e5/verify/task-t004-verify/scripts/docs-audit-disposition.test.mjs:475:10)
        at Test.runInAsyncScope (node:async_hooks:227:14)
        at Test.run (node:internal/test_runner/test:1402:25)
        at Test.processPendingSubtests (node:internal/test_runner/test:974:18)
        at Test.postRun (node:internal/test_runner/test:1542:19)
        at Test.run (node:internal/test_runner/test:1467:12)
        at async startSubtestAfterBootstrap (node:internal/test_runner/harness:387:3) {
      generatedMessage: false,
      code: 'ERR_ASSERTION',
      actual: 1,
      expected: 0,
      operator: 'strictEqual',
      diff: 'simple'
    }
  ```
- 2026-11-01 — corrective redispatch: the E6 positive half was worktree-bound, not rule-bound. Cause, measured
  rather than assumed: `check_docs_audit.py` resolves its `Repo root:` header against `--primary`, defaulting
  to `--repo` (`validate()`, "Repo root does not match --primary (default --repo)"). The audit declares
  `Repo root: D:\projects\sandbox\angular-ai-devtools`, so `runGate(repoRoot)` passed only where that literal
  path was the checkout running the test — the primary. In the authoritative isolate worktree the same call
  was refused at the header, before the coverage, tally or queue rules were reached. The two other suspects
  were tested and cleared: `--emit-inventory` from the primary and from a clean worktree of base
  `767868e01ceb7a8220b886bf1f81244e88149ec4` produced byte-identical inventories (`fc`: no differences), so
  untracked-but-not-ignored Markdown was not the cause, and no case read installed helpers through the wrong
  root. Fix, in `scripts/docs-audit-disposition.test.mjs` only: parse `declaredRepoRoot` from the head audit
  (pinned to exactly one `Repo root:` line holding an absolute path), and route both real-tree gate calls
  through a `runGateAtHead()` wrapper that passes that declared primary as `--primary` while `--repo` stays
  this checkout — the documented sidecar invocation, so the inventory still derives from the root the gate
  reads. A `gateInventory()` helper runs `--emit-inventory` and asserts the derived set deep-equals the paths
  the audit covers, so coverage is asserted explicitly instead of inferred from an exit code. Scope note: the
  positive half no longer proves the header names the checkout that runs the test — in a sidecar it must not;
  the header's shape still is, and the coverage, tally, queue-number and prior-history rules run unbranched.
  All three mutations, the pre-re-cut prior pass and the pristine pass are untouched. The three held-out case
  titles are unchanged. Verify in the primary: `node --experimental-strip-types --test
  scripts/docs-audit-disposition.test.mjs` → tests 3, pass 3, fail 0. Verify for worktree independence: the
  same file copied into a clean `git worktree add ... 767868e01ceb7a8220b886bf1f81244e88149ec4` (no
  `node_modules`) → tests 3, pass 3, fail 0; worktree removed with `git worktree remove --force`.
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  E6: a persisting row renumbered -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-Ejvbpz\mutation-0
  E6: a retired number reused by a new item -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-Ejvbpz\mutation-1
  E6: a new item at or below the prior maximum -> gate exited 1 over C:\Users\LARSGY~1\AppData\Local\Temp\docs-audit-e6-Ejvbpz\mutation-2
  E6: pristine copy -> gate exited 0
  E7: resolved docs-audit gate at C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\scripts\check_docs_audit.py
  E7: 72 unverifiable row(s) name a settling check; the undecidable rows are ["68","69","71","74","76","86","89"]
  E7: queue row #1 suggested action restored to "re-measure the numbers and record the result" -> 1 issue(s)
  E7: queue row #1 suggested action restored to "needs a portal run before this row can be decided" -> 1 issue(s)
  E7: queue row #1 evidence restored to "needs a portal run before this row can be decided" -> 1 issue(s)
  ✔ E5 an audit with zero unverifiable rows is a pass (170.042ms)
  ✔ E6 queue numbers stay unique, increasing and bound to their items (699.2693ms)
  ✔ E7 every remaining row names a shipped command, never a prose verb (22.2635ms)
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 1043.1693
  ```
