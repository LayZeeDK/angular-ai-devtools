---
id: T013
title: Pin the measurements to the commit they were taken at
wave: 8
deps:
  - T010
status: done
agent: build_T013
base: 9505b7c9abe190dcf1ef6fa64b070702cc4f1503
worktree: null
task_branch: null
files:
  - .project/tasks/T001-measure-the-capture-and-the-digest.md
  - .project/tasks/T011-stop-the-tail-suffix-resolution-from-pinning-a-path-that-exists-nowhere.md
  - research/raw/m045-console-shapes.json
---

# T013 — Pin the measurements to the commit they were taken at

## Context

Wave 1's cycle-3 review found the Log's size claim stale for the third time. The entry at
`.project/tasks/T001-measure-the-capture-and-the-digest.md:89` states the shapes record is 33,917 bytes with
the measuring command quoted beside it; re-run at `e1ba31fc` that command prints 35,619, because T010's own
append moved the file. A Log whose number contradicts the command printed next to it is exactly the class
this milestone forbids, and the same entry still says "15 recorded commands" when there are 16.

The pattern is not bad arithmetic: it is a timeless claim about a file that every append changes. Three
corrections have now chased it.

Wave 4's cycle-3 review recorded a smaller mismatch of the same kind: T011's accepted criterion said a
`--tasks` argument that is a directory must be "refused", and what shipped reads the directory instead —
correctly, because refusing directories would refuse the gate's own default `.project/tasks`. The acceptance
wording was wrong, not the code.

## Approach

- - Restate the size as a measurement at a named commit with the command that prints it, so the claim cannot
  go stale when a later append lands; keep the historical values as history, labelled with their commits.
- Correct the command count, and say which command is which rather than only counting them.
- Append the correction; never rewrite an earlier Log line.
- Append a correction to T011's Log recording that its accepted criterion 4 overstated the behaviour: the
  reading is correct, the wording was wrong, and the reason is that the gate's own default is a directory.
- Do not change T011's code: the evidence in wave 4 showed the shipped reading is right and that refusing
  directories would break the gate's default path.

## Acceptance criteria

1. Every size the Log states names the commit it was measured at, and the command beside it prints that number at that commit.
2. The command count is correct and says which command is which.
3. Both corrections are appended; earlier Log lines are byte-identical.
4. T011's Log records that its criterion 4 was mis-worded, that the shipped reading is correct, and why refusing directories would break the gate's default input.
5. No product value changes: the shapes record is declared so its size can be measured, and the changed content is the two Logs.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/recording-consistency.test.mjs && npm run check && npx prettier --check research/raw/m045-console-shapes.json
```

## Log

- Task written at the third repair cycle; not started.
- 2026-11-16 — built at head `628bd800` (branch `gsd-path/M057`), no branch cut and no commit. Two task Logs appended and no product value written; the record `research/raw/m045-console-shapes.json` is declared here so its size can be measured, and it is byte-identical to its blob at `628bd800` (`de0f927a…`).
  - **T001's stale size, restated as a measurement at a named commit.** `T001-measure-the-capture-and-the-digest.md:89` states the deliverable as `33,917 bytes`, which is that record at `9f0603c9` and at no later commit: T010's own `c16` append moved it. The appended entry leaves `:89` byte-identical, names each historical size with the commit it belongs to — `ee4bfbd2` 27,122, `a4a57f9e` 27,783, `9f0603c9` 33,917, `234a3b4c` 35,619 and every commit since — and carries one command that prints all of them: `git cat-file -s <commit>:research/raw/m045-console-shapes.json`, which reads the commit's own tree rather than the worktree, so a later append cannot move a single line of its output. Its measured output at this head, exit 0: `ee4bfbd2: 27122`, `a4a57f9e: 27783`, `9f0603c9: 33917`, `234a3b4c: 35619`, `e1ba31fc: 35619`, `628bd800: 35619` — so the deliverable's size is `35,619 bytes` measured at `628bd800`, and the same command in five years says so.
  - **The command count, corrected and identified.** The same entry says "15 recorded commands (`c1`–`c15`)"; the record's `provenance.commands` holds **16**, all `exitCode: 0`, and the appended entry names which command is which rather than only counting them: `c1` branch and HEAD, `c2` node version, `c3` console-method census, `c4` the `captureErrorPayload` body, `c5` the lines naming the capture's entry points, `c6` the payload keys, `c7` the shipped regex's samples, `c8` the digest's shape, `c9` the code distribution, `c10` the digest's size, `c11` all 64 codes, `c12` the digest's first lines and entry 1's body length, `c13` the `error-capture` occurrences, `c14` the manifest block and its two counts, `c15` the console hook block, `c16` the `dispatch` body. Each was checked by replaying its recorded command string at this head: 15 byte-identical, `c1` differing only in the short HEAD it recorded at capture time.
  - **T011's criterion 4, corrected in place of nothing.** An entry appended to `T011-stop-the-tail-suffix-resolution-from-pinning-a-path-that-exists-nowhere.md` records that AC4's word "refused" overstated the behaviour: what shipped **reads** a directory named with the markdown suffix, names it on the reading line, and exits 0, which is right; refusing directories would refuse the gate's own default input, because `defaultTaskInput` answers `.project/tasks` — a directory — and every `npm run check` in this milestone reads it. Measured at this head with a probe directory named `tasks.md` holding two task files: `fix-record clean - examined 0 claim(s) in 2 task log(s) of …\t013-probe\tasks.md … pass - 0 finding(s), 1 mention(s)`, exit 0. T011's code was not touched.
  - **Both corrections are appends, proven by bytes.** Each Log's pre-edit snapshot is an exact prefix of the file now: T001 `15,389` bytes → `21,745` (6,356 appended), prefix identical; T011 `9,360` bytes → `12,974` (3,614 appended), prefix identical (compared byte for byte by the scratch script that took the snapshots). Earlier Log lines are byte-identical, including `T001…md:89`'s uncorrected sentence and `T011…md:130`'s verdict.
  - **A concurrent writer in this shared worktree, recorded so it is not read as this task's.** The tree was clean when this task began (`git status --porcelain` empty at 04:40Z) and three files outside this task were dirty at the end: `research/raw/m045-console-panel.json` (mtime 04:44:57Z), `scripts/console-panel-record.test.mjs` (04:44:31Z) and `scripts/console-panel-render.test.mjs` (04:47:43Z), plus an untracked `.project/review/`. None of them was opened for writing by this task, whose writes are the three task files named above and nothing else; `research/raw/m045-console-shapes.json` still hashes to its `628bd800` blob (`de0f927a…`) after every run, so the declared record was measured and not written.
  - **Verify, run exactly** — `node --test scripts/recording-consistency.test.mjs && npm run check && npx prettier --check research/raw/m045-console-shapes.json` → **exit 0**, every stage green:
    - `node --test scripts/recording-consistency.test.mjs` — `tests 7`, `suites 0`, `pass 7`, `fail 0`, `cancelled 0`, `skipped 0`, `todo 0`, exit 0. The first test is the one that binds this task's subject: "every byte count a recording states in prose is a byte total the recording records".
    - `npm run check` — exit 0: `verification gate (structure): pass`; `gate-integrity: archive-paths clean - examined 17 live path reference(s) of 184 reference(s) in 146 suite(s), across 6 relocated subtree(s)` and `pass - 0 finding(s)`; `gate-integrity: fix-record clean - examined 103 claim(s) in 15 task log(s) of .project/tasks … against 69 changed path(s) of b8d3341c…628bd800 … pass - 0 finding(s), 114 mention(s)`; `Checking formatting... All matched files use Prettier code style!`.
    - `npx prettier --check research/raw/m045-console-shapes.json` — `Checking formatting...` then `All matched files use Prettier code style!`, exit 0.
    - The fix-record stage reads these Logs, so its reading is the check on them: 103 claims (up from 98 before the appends, the new ones being the declared paths these entries name) and **0 findings**, which is what a Log that names only paths the gate can account for looks like.
ready
