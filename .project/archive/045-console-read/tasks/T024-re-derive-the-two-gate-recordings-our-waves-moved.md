---
id: T024
title: Re-derive the two gate recordings our waves moved
wave: 17
deps:
  - T021
status: done
agent: build_T024
base: 82f500c784ab815afb0569588fc527b7b3e537bf
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
---

# T024 — Re-derive the two gate recordings our waves moved

## Context

Re-running every done task's own Verify at this head (the ledger backfill the gate demands) found five
verifies stale, and the chain behind them is one cause. The suite census recorded in
`research/raw/m044-gate-shapes.json` was measured at `5290d939` and this tree now carries sixteen suites that
differ from it — ten edited, six added, one assertion line re-cut with the same call and the same subject, and
zero dropped. Because the census is asserted inside `scripts/gate-integrity.test.mjs`, that suite now exits 1,
which is the `fixRecord.exitCode: 0 -> 1` the stability record pins. The other three stability values are the
same cause seen twice: the fix-record summary's mention count moved 102 -> 139 as T016-T021 appended claims to
their Logs.

None of this is a defect in the code those suites test, and the census's own counts prove nothing was removed:
`droppedAssertionLines: 0`. But a re-capture that does not name what moved would launder exactly the difference
the census exists to force a reader to account for, so the naming is the task, not a formality around it.

## Approach

- Run the census's documented armed command and let it re-derive:
  `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`.
  Do not hand-edit the record.
- Read the re-derived record and account for every differing suite against the wave that changed it: T016
  through T021 added pins to the join, pane and record suites, and T003's registry work edited the pane suite.
  The Log lists the suites with their +N/-N and assertion counts, and names the wave for each.
- Confirm explicitly that the census reports zero dropped assertion lines and one re-cut, and say what the
  re-cut one is. A dropped assertion stops this task: report `blocked` rather than capture over it.
- Only after that suite exits 0 unarmed, run the stability record's armed command:
  `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`.
- Name all four moved values in the Log: the two mention counts 102 -> 139 and why, the exit code 1 -> 0 and
  why, and the verdict, which the suite derives rather than takes typed.
- Prove both records are stable: an unarmed run of each suite writes no byte and exits 0, and a second armed
  run writes nothing.

## Acceptance criteria

1. `node --test scripts/gate-integrity.test.mjs` exits 0 unarmed at this head, with the census re-derived by its documented `M044_CAPTURE=1` command rather than hand-edited.
2. Every differing suite in the re-derived census is accounted for in the Log by the wave that changed it, with its added, edited and re-cut assertion lines stated, and the census itself reports zero dropped assertion lines.
3. `node --test scripts/gate-stability-record.test.mjs` exits 0 unarmed, with all four moved values named in the Log: both mention counts, the exit code, and the derived verdict.
4. Both records are byte-stable: an unarmed run of each writes nothing, and a second armed run of each writes nothing.
5. The task's fenced Verify passes, and no record is edited by hand — each carries the bytes its own armed command wrote.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs && npm run check && npx prettier --check research/raw
```

## Log

- Task written after the ledger backfill found five verifies stale behind one cause; not started.
- T024 — the census re-derived first, then the stability record, then both proved byte-stable. Neither record was
  edited by hand: each carries the bytes its own armed command wrote, and nothing outside the three declared files
  was touched.
- Why this entry names the suites in prose and not in code spans: this task's files: list declares three paths, and
  every backticked path-like token in a task's Log is either a claim (declared) or a mention (undeclared). Naming an
  undeclared suite in a code span would add a mention and move the very count the stability record pins, so the table
  below writes each path plainly and no code span in this entry is a path. Commands sit in indented blocks for the
  same reason.
- Census, by its documented armed command, run verbatim:

      set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"

  It exited 0, 40 tests passing and none failing, and wrote research/raw/m044-gate-shapes.json. At this head the
  unarmed run (node --test scripts/gate-integrity.test.mjs) exited 1 before the capture and exits 0 after it.
- Census counts before the re-derivation (the record as the armed run found it): differing 16, edited 10, added 6,
  removedAssertionLines 1, recutAssertionLines 1, droppedAssertionLines 0, addedAssertionLines 853; 204 suites
  examined of 556 listed files; whole tree 2473 tests and 301 describes (2774). After: the same membership and the
  same removed, re-cut and dropped counts — differing 16, edited 10, added 6, removedAssertionLines 1,
  recutAssertionLines 1, droppedAssertionLines 0 — with addedAssertionLines 853 -> 1095, 204 of 556 unchanged, and
  the whole tree 2482 tests and 303 describes (2785). Nothing was lost: droppedAssertionLines is 0 in the re-derived
  record and in the row the suite derives, which the suite's own T004 AC4 test asserts before a capture is accepted.
- The single re-cut assertion: scripts/navigation-capture.test.mjs, one removed assertion line whose own assertion
  came back with the same call and the same subject, so it is recorded re-cut (1) and dropped (0):

      - assert.notEqual(intentPathForMilestone(ROOT, 'M040'), LIVE_INTENT);
      + assert.notEqual(intentPathForMilestone(ROOT, 'M040'), currentIntent());

  Same assertion, same first subject (the M040 intent path), the right-hand subject now the resolver's answer rather
  than the constant the suite used to spell — M044 T003's repair, in the suite whose reason already records it.
- Every differing suite in the re-derived census, with its moved lines, its assertion lines and the wave that
  changed it (last commit touching the path, read with git log -1 -- the path; the milestone is named where it is
  not M045):

  | suite | lines +/- | assertions +/- (re-cut, dropped) | wave |
  | --- | --- | --- | --- |
  | apps/angular-ai-devtools/src/app/app.spec.ts | +13/-1 | +4/-0 (0, 0) | M045 T003, 6bfaad2b — the ordered route-table pin gained the console surface |
  | apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts | +3/-0 | +0/-0 (0, 0) | M045 T003, 6bfaad2b — both ordered route-table pins gained it |
  | apps/angular-ai-devtools/src/app/page-picker.component.spec.ts | +40/-3 | +3/-0 (0, 0) | M045 T007, 2fa589b9 — the lazy-path list and its pin, on top of M045 T003's route |
  | apps/angular-ai-devtools/src/app/panel-demo.spec.ts | +254/-0 | +31/-0 (0, 0) | M045 T007, 2fa589b9 — the console pin and its rendered lines, on top of M045 T003's route |
  | scripts/autonomy-gaps.test.mjs | +36/-1 | +1/-0 (0, 0) | M044 T003, 98a4c9b8 — the live audit path is resolved at read time instead of opened by name |
  | scripts/console-join.test.mjs | +1414/-0 | +172/-0 (0, 0) | M045 T021, 21d59c13 — added by M045 T002, then T015, T018 and T021 appended pins; recorded 618 lines and 90 assertions |
  | scripts/console-panel-record.test.mjs | +3160/-0 | +202/-0 (0, 0) | M045 T019, 1e84c498 — added by M045 T004, then T009, T012, T014, T017 and T019 appended pins; recorded 1513 lines and 128 assertions |
  | scripts/console-panel-render.test.mjs | +2920/-0 | +188/-0 (0, 0) | M045 T021, 21d59c13 — added by M045 T003, then T009, T012, T014, T015, T019 and T021 appended pins; recorded 1413 lines and 102 assertions |
  | scripts/docs-audit-disposition.test.mjs | +43/-4 | +1/-0 (0, 0) | M044 T003, 98a4c9b8 — the live audit path is resolved at read time instead of bound at load |
  | scripts/gate-integrity-default-tasks.test.mjs | +636/-0 | +41/-0 (0, 0) | M056 T007, 051784e2 — added by M056 T002 (its reason is the record's) |
  | scripts/gate-integrity.test.mjs | +5571/-0 | +341/-0 (0, 0) | M045 T011, dcd1775b — added by M044 T001 to T004 (its reason is the record's) |
  | scripts/gate-stability-record.test.mjs | +1076/-0 | +34/-0 (0, 0) | M056 T007, 051784e2 — added by M056 T001 (its reason is the record's) |
  | scripts/navigation-blocking.test.mjs | +1384/-4 | +72/-0 (0, 0) | M045 T005, bf3d1c04 — the navigation pin SC6 permits to be edited: skipped in the answer key, five fields in E3, E7/E8 pins added |
  | scripts/navigation-capture.test.mjs | +23/-7 | +2/-1 (1, 0) | M044 T003, 98a4c9b8 — the intent path is asked of the resolver; the one re-cut assertion above |
  | scripts/panel-typecheck-scope.test.mjs | +68/-27 | +3/-0 (0, 0) | M044 T003, 98a4c9b8 — the check-chain pin re-cut from six stages to twelve, widened not weakened |
  | scripts/retired-suites.test.mjs | +14/-8 | +0/-0 (0, 0) | M044 T003, 98a4c9b8 — the live record path became a candidate the resolver tests before opening |

  The three console suites are the only rows whose values moved since the record was last written (M045 T011,
  dcd1775b): their line and assertion counts above are the ones this head derives, and the waves after that commit
  that touched each are exactly the ones named in their rows.
- Stability record, by its documented armed command, run verbatim:

      set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs

  It exited 0, 8 tests passing and none failing, and wrote research/raw/m056-gate-stability.json (40129 bytes ->
  67100 bytes: the predecessor section now records the pin and mention lines the stage prints as well as its
  summary). The four moved values, each with why it moved:
  1. archive.detail.plainRun.summary, 102 -> 139 mentions. The plain run is the fix-record stage over this
     milestone's own live task logs, and every backticked path-like token whose task does not declare it in its
     files: list is a mention. The waves after the record's last write appended Log lines carrying such tokens:
     git diff --numstat 234a3b4c..HEAD -- .project/tasks shows T007 and T009 and T011 through T024 each grew, and the
     count rose by 37. The summary is now "gate-integrity: pass - 0 finding(s), 139 mention(s)".
  2. predecessor.summary, the same 102 -> 139 for the same log directory and the same reason: the same stage on this
     branch, held to the commit the record names. Its counts are unchanged at 0 findings and 0 refusal lines, and
     its detail.lines re-derived with it (260 printed lines, 51 claims and 117 pins named in the record).
  3. fixRecord.exitCode, 0 -> 1 at the measured head. That is the census suite: node --test
     scripts/gate-integrity.test.mjs exited 1 because the census it asserts was stale against this head. Re-deriving
     the census above returned it to 0, and 0 is what the re-derived record carries — the order of the two captures
     is why the census had to come first.
  4. verdict. The suite derives the sentence from the three measured exit codes and refusal classes rather than
     typing it, so it followed the exit code: at the stale state it read "1 of the 3 measurements does not pass at
     this head: the fix-record stage held to M044 exits 0 with no refusal, the gate-integrity suite exits 1 with no
     refusal and the fix-record stage on this branch exits 0 with no refusal". With the census green again the
     derived sentence is the recorded one: "all 3 measurements pass at this head: the fix-record stage held to M044
     exits 0 with no refusal, the gate-integrity suite exits 0 with no refusal and the fix-record stage on this
     branch exits 0 with no refusal".
  archive.summary — the run held to M044 — did not move: 7 mentions, 4 claims in 5 task logs over 52 changed paths.
  That is M044's archived task directory, which no wave of this milestone writes.
- Byte-stability of both records, proved by hash before and after each run (both files, every run):

      before the runs: m044-gate-shapes.json   108672 bytes  sha256 496c08cba046a9cd53511e6a31a622097ff70cd33fa4f508b21b58e1deaf6a7f
                       m056-gate-stability.json  67100 bytes  sha256 364bb21ed0b9941a448e408f967c8290998df6f155f8971dc3a4b476e93450de
      unarmed census     node --test scripts/gate-integrity.test.mjs        -> exit 0, pass 40, fail 0; both hashes unchanged
      unarmed stability  node --test scripts/gate-stability-record.test.mjs -> exit 0, pass  8, fail 0; both hashes unchanged
      armed census again (set "M044_CAPTURE=1"&& ...)                        -> exit 0, "armed run: nothing moved, nothing written";
                                                                              idempotence 108672 bytes, sha256 496c08cb...; both hashes unchanged
      armed stability again (set "M056_CAPTURE=1"&& ...)                     -> exit 0, "armed run: nothing moved, nothing written (sha256 364bb21e...)";
                                                                              idempotence 67100 bytes, sha256 364bb21e...; both hashes unchanged
ready
