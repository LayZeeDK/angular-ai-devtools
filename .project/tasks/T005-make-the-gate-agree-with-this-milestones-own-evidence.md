---
id: T005
title: Make the gate agree with this milestone's own evidence
wave: 4
deps:
  - T003
status: done
agent: build_T005
base: 8b3919db40e1eaaa83be3f1a2485bed8c4b5ce71
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/navigation-blocking.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - research/raw/m057-verdict-claims.json
---

# T005 — Make the gate agree with this milestone's own evidence

## Context

At `3c7bf3a8` the project verify refuses for three reasons, none of which is product logic.

`gate:fix-record` reads every path a task Log mentions as a claim that the milestone range changed. Because
the plan tells coders to declare suites that pin a file they change, T002's Log names
`scripts/recording-consistency.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs`, which T002
declared and left byte-identical. Those two names are read as unsatisfiable claims.

`scripts/navigation-blocking.test.mjs` reads the intent's edge table as six columns and takes the sixth cell
as a suite path, and separately demands that a cited suite's own test titles carry the edge id. The intent
grammar accepts five columns, and the owner has ruled the five-column form authoritative with the
test-to-edge mapping held once, in the plan's `## Held-out checks` table.

a shapes record whose filename never existed records `fixRecord` exiting 0; it exits 1 for the claims above, so the
stability record disagrees with what the head derives.

## Approach

- In `scripts/gate-integrity.mjs`, make a declared path a claim only when the range actually changed it: a
  path the task declares and leaves byte-identical is a pin, and a pin is satisfied by the file being
  unchanged. Do not stop reading undeclared mentions â€” an undeclared path is the defect that rule exists for.
- In `scripts/navigation-blocking.test.mjs`, read the intent's five-column edge table, and take the
  test-to-edge mapping from the plan's `## Held-out checks` (`Edge | Task | Test`) instead of requiring edge
  ids in suite titles. Keep the refusal for a cited suite that does not exist.
- Re-arm `research/raw/m044-gate-shapes.json` and a shapes record whose filename never existed with their own armed
  captures, naming in the Log which values moved and why.
- Update `research/raw/m057-verdict-claims.json` so each claim cites an artifact this head carries, in the
  shape the consuming suites demand after the two changes above.

## Acceptance criteria

1. `npm run check` exits 0 at this head, and `gate:fix-record` reports zero findings while still refusing an
   undeclared path â€” prove the refusal with a temporary undeclared mention that is then removed.
2. `scripts/navigation-blocking.test.mjs` passes against the five-column intent and the plan's held-out
   table, and a mutant that restores the six-column read reddens naming the column count.
3. Both shape records are re-armed and an unarmed run leaves each byte-identical; the Log names every value
   that moved.
4. `npm test` reports no failure attributable to the three causes above, and any remaining failure is named
   as pre-existing with its evidence.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.


## Intent coverage

- None

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs scripts/navigation-blocking.test.mjs && npm run check && npx prettier --check scripts research
```

---
## Log

- Task written at plan approval; not started.
- 2026-11-15 — contract note before the work: the task's `files:` names a shapes record whose filename never existed, which this checkout does not carry and never has (`git log --all -- research/raw/m056-gate-shapes.json` is empty). The stale record Blocker 3 describes — one whose `fixRecord` says exit 0 — is `research/raw/m056-gate-stability.json`; that file's own `capture.command` is `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`, so that is the record re-armed below. No path outside the six declared ones was edited; this task file itself is appended.
- Blocker 1, `scripts/gate-integrity.mjs`: a declared suite or recording (or any declared path the tree carries) the range did not change is a pin, read by comparing `git rev-parse <base>:<path>` with `<head>:<path>`; two absences count as equal, so an uncommitted new suite or recording is a pin. A declared path that exists nowhere stays a claim and is reported. `claims: 'log'` is unchanged, so an undeclared path is still refused there. `checkFixRecord` now returns `pins`/`pinsExamined`, `examined` counts claims plus pins, and the gate prints a `fix-record pins - N ...` line plus one `pin ...` line per pin. The refusal proof: appended `scratch/t005-undeclared-probe.json` to this task's Log, ran `node scripts/gate-integrity.mjs --check fix-record --claims log`, observed `gate-integrity: refusal scratch/t005-undeclared-probe.json at T005 (claim-absent-from-the-range) — ... carries no such path ...`, then removed the line. A plain `--check fix-record` run is clean at this head: `examined 23 claim(s) in 5 task log(s) ... 17 declared path(s) byte-identical ... pass - 0 finding(s), 37 mention(s)`.
- Blocker 1 tests, `scripts/gate-integrity.test.mjs`: added two tests. A declared recording (`research/raw/m031-field-state.json`) that is byte-identical across M035's range is a pin (0 findings, 1 pin; `claims: 'log'` still reports it absent). A declared recording the M044 range changed (`research/raw/m044-gate-shapes.json`) is a claim (1 claim in the range, 0 pins). The existing AC7 run over M044's archived tasks is unchanged (`4 claim(s)`, `7 mention(s)`, 0 absent in declared mode; 11 claims and 4 absent in log mode). The suite is 30 tests unarmed / 31 armed, 0 fail.
- Blocker 2, `scripts/navigation-blocking.test.mjs`: `intentEdges` reads the intent's five-column table (`Edge | Criterion | Category | Disposition | Detail`) and refuses a table whose row count is not five, naming the count it read; `heldOutChecks` reads the plan's `## Held-out checks` (`Edge | Task | Test`); `intentCoverage` plus `suiteAddedByTask` (the suite the task's own `base` does not carry) map an in-scope edge to the suite the plan's task added. The suite-title edge-id demand (`suiteTitles`/`carriesEdge`) is gone; `assertClaimedEdges` still holds each row to naming edge ids, and `assertCitations` still refuses a cited artefact that is not there. New tests prove the live five-column table and `E7 -> scripts/console-panel-render.test.mjs`; a six-column mutant reddens `the intent's edge-coverage table carries 6 column(s); the ruling's grammar is 5 columns ...`; a broken held-out Test reddens naming `scripts/absent-held-out-suite.test.mjs`; prose in an edge list reddens. `node --test scripts/navigation-blocking.test.mjs` -> 24 tests unarmed, 25 armed, 0 fail.
- `research/raw/m057-verdict-claims.json` (new, 16058 bytes, sha256 `095ed69b58068241581ad25500cb3cb788a10883c941267d2b3b756b7db94703`): written by the armed navigation capture (`set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"`), not hand-edited. It rules M057's five criteria, quotes each, and cites `scripts/console-join.test.mjs` for SC1/SC2/SC3 and `scripts/console-panel-render.test.mjs` for SC4/SC5 — suites this head carries and the plan's edge/task mapping assigns. No suite title carries an edge id, and none has to after the ruling. The same armed run printed `armed idempotence: 16058 bytes, sha256 095ed69b... before and after the second run`; a default run printed the same hash before and after.
- `research/raw/m044-gate-shapes.json` re-armed (`set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`): 106193 bytes, sha256 `881ad4a5...` -> 107589 bytes, sha256 `b5fcc81c307b832e9deecf4e47b020239b2cd5d591f0a4f5de27c0f2d374344b`. Values that moved: `archiveReferences.examined` 180 -> 184 and `counts.undecided` 135 -> 139 (the four new references: the two `.project/STATE.md` strings in the new gate-integrity test, the moved `STATE_PATH` line in navigation-blocking, and the new comments there; `sites.path` 9 -> 10, `sites.comment` 64 -> 66, `sites.message` 32 -> 33); `suiteDiff.differing[9]` (`scripts/gate-integrity.test.mjs`) `addedLines` 4492 -> 4652 and `addedAssertionLines` 235 -> 256; `suiteDiff.differing[11]` (`scripts/navigation-blocking.test.mjs`) `addedLines` 1018 -> 1384 and `addedAssertionLines` 61 -> 72; `suiteDiff.counts.addedAssertionLines` 570 -> 602; `wholeTree.declarations.tests` 2436 -> 2441 and `total` 2732 -> 2737; and the volatile `capture.at`. A default run then left 107589 bytes, sha256 `b5fcc81c...`, before and after.
- `research/raw/m056-gate-stability.json` re-armed (`set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`): 6445 bytes, sha256 `e575fbce...` -> 19372 bytes, sha256 `fcd4b90771b60e67480c1a577932a55349528e7575e35756392ef157960be80f`. Values that moved: `archive.detail.plainRun.milestone` M056 -> M057 and `archive.detail.plainRun.summary` / `predecessor.summary` / `predecessor.detail.prints` `0 finding(s), 4 mention(s)` -> `0 finding(s), 37 mention(s)`; `predecessor.detail.milestone` M056 -> M057; `predecessor.detail.lines` 7 -> 64, with the line now deriving `b8d3341c..5290d939` by rule `ship` (M056's ship commit) and examining 17 claims in 5 M057 task logs over 40 changed paths, recording 23 pins and 37 mentions — the live `.project/tasks` holds M057's five logs at this head, so the predecessor section is the stage's own answer for this tree, not M056's old answer. `archive.exitCode`, `fixRecord.exitCode` and `predecessor.exitCode` are all 0, and the `verdict` is unchanged. A default run left 19372 bytes, sha256 `fcd4b907...`, before and after.
- The fenced `## Verify`, run exactly as its one line: `node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs scripts/navigation-blocking.test.mjs && npm run check && npx prettier --check scripts research` -> exit 0. The test leg printed `ℹ tests 54`, `ℹ pass 54`, `ℹ fail 0`; the `npm run check` leg printed the lines quoted below; the last leg printed `Checking formatting...` / `All matched files use Prettier code style!`.
- `npm run check` -> exit 0. Quoted, with no failing line:
  `verification gate (structure): pass`
  `gate-integrity: archive-paths clean - examined 17 live path reference(s) of 184 reference(s) in 145 suite(s), across 6 relocated subtree(s)`
  `gate-integrity: pass - 0 finding(s)`
  `gate-integrity: fix-record clean - examined 23 claim(s) in 5 task log(s) of .project/tasks (logs of M057) against 25 changed path(s) of b8d3341c..18985aff (rule ship: M056's ship commit, b8d3341c (ship: M056 — gate-phase-stability); the head is this tree's HEAD, 18985aff (state(M045): T005 activated for the gate repair); claims: declared)`
  `gate-integrity: fix-record pins - 17 declared path(s) byte-identical across b8d3341c..18985aff, recorded and not judged as changes`
  `gate-integrity: pass - 0 finding(s), 37 mention(s)`
  `Checking formatting...` / `All matched files use Prettier code style!`
- `npm test` -> the main leg printed `ℹ tests 1476`, `ℹ pass 1476`, `ℹ fail 0`; `node scripts/run-user-scope-tests.mjs` printed 60 tests, 60 pass; `test:skills` printed 634 tests, 634 pass; `test:app` printed 348 tests, 348 pass; `test:held-out` passed `tests/held-out/companion-surface.test.mjs` (10/10) and `tests/held-out/e3-zero-skipped.test.mjs` (1/1), then the harness's 10-minute command cap cut the corpus before `e4-idempotent-checks.test.mjs`. No executed leg printed a failing line. The remaining 20 held-out suites (all except e3 and e4) were then run one at a time: 20/20 passed, 0 failed. `e4-idempotent-checks.test.mjs` drives two consecutive `npm run check` + `npm test` cycles; it was still running when the cap was reached and was stopped by hand, so it is named as a pre-existing long-running held-out suite rather than a failure attributable to the three causes. No exit code was obtained from `npm test` because the harness cut it at 600000 ms.
- An earlier `npm test`, taken before the default-tasks fixture was reconciled with the pin rule, exited 1 with one failing line, and the line is quoted here so the repair is visible: `AssertionError [ERR_ASSERTION]: the archived log claims a path the range does not carry, so the default run must refuse: ... | gate-integrity: pass - 0 finding(s), 0 mention(s)` and `0 !== 1` at `scripts/gate-integrity-default-tasks.test.mjs:497`. The fix was the pin rule's final form (a declared path that exists nowhere is not a pin), not an edit to that suite; the suite is now 9/9 pass and the main leg is 1476/1476.
- The edited paths are the five declared files this head actually carries plus `research/raw/m056-gate-stability.json`, which is the record the declared-but-absent a shapes record whose filename never existed names by intent rather than by path (see the contract note above). `git status --porcelain` names `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/navigation-blocking.test.mjs`, the new `research/raw/m057-verdict-claims.json`, and this task file. `.project/review/VERIFICATION.json` is the untracked file `gate:verification` writes on every `npm run check`; no source outside that set was touched.
- Verdict: ready.

ready
