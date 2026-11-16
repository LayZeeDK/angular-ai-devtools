# Review — wave 1, cycle 4

Cycle: 4
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 85208150f3cbff73dbcd77eb9ad18a4bb2552628

## T001 — Measure the capture and the digest: fail

- ✅ **Every size the Log states now names a commit, and the command beside it prints that number there.** I
  pulled the command quoted at `.project/tasks/T001-measure-the-capture-and-the-digest.md:104` out of the file
  and ran it verbatim at this head: `ee4bfbd2: 27122`, `a4a57f9e: 27783`, `9f0603c9: 33917`, `234a3b4c: 35619`,
  `e1ba31fc: 35619`, `628bd800: 35619`, exit 0 — six lines equal to the block at `:107-112` (the only difference
  is the four-space list indent of the markdown block). The attribution is complete against the sizes the Log
  states: 27,122 (`:52`) → `ee4bfbd2`, 27,783 → `a4a57f9e`, 33,917 (`:89`) → `9f0603c9`, 35,619 →
  `234a3b4c`/`e1ba31fc`/`628bd800` (`:115-118`). The Log's other size is held the same way: the digest's
  `61,577 bytes` (`:70`, printed by `c10`) re-runs at `:120`'s command to
  `extension/error-digest.json at 9e95f740: 61577` and `extension/error-digest.json at 628bd800: 61577`, and
  `git cat-file -s 85208150:extension/error-digest.json` still prints `61577`, so it has not moved. The
  cycle-3 size advisory is closed.
- ✅ **The restated size cannot go stale, and the claim that it cannot is itself measured.** `git cat-file -s`
  reads the commit's own tree, so the six lines hold after any append; the record has since grown to
  **39,284 bytes** at this head (blob `9b6f9e70593723004331b6bc25e97bc725f853a9`) and not one of the six lines
  moved. `:119` also names the defect it removed — the in-place command at `:89` reads the worktree — and
  re-running that command at this head prints `bytes: 39284`, exactly the ageing the correction describes.
- ✅ **Both corrections are genuine appends; earlier bytes are identical.** The file at T013's base `9505b7c9`
  is 15,389 bytes and an exact byte prefix of the 21,745 at `4a4aed36` (+6,356 appended, as `:76` states), and
  the head file is byte-identical to the one T013 landed — nothing since has rewritten a byte. T011's Log:
  9,360 → 12,974, prefix identical. `git show --name-status 4a4aed36` lists only the three task files and no
  product path, so `research/raw/m045-console-shapes.json` was measured and not written — its blob at
  `628bd800` is `de0f927ab2dce1d722a1dbada2dd00d116d4feef`, the hash `:119` quotes.
- ✅ **The old claims are marked corrected rather than left contradicting.** `:101` names `:89` and both of its
  statements and says the appended entry is "the correction of record"; `:117` identifies 33,917 as "a correct
  measurement of that commit [`9f0603c9`], and of no later one"; `:99`'s control-character correction still
  holds at this head — one `U+000C` at index 9056, zero carriage returns, `charAt(9064)` `"\n"` — reproduced by
  running `:96`'s command verbatim. The corrupted verdict line at `:85-86` is left in place by append-only and
  is explicitly accounted for, which is the rule.
- ❌ **The command count is wrong at the reviewed head, and it is the one number in T013's correction that was
  not pinned.** `:121` states "The commands: **16**, `c1`–`c16`, each named" and `:138` "15 byte-identical
  outputs, `c2`–`c16`". Measured at `85208150`, `provenance.commands` holds **18**, `c1`–`c18`, all
  `exitCode: 0`: `c17` joins a case-folded `ng01002` to the digest's `NG01002` and `c18` reports `ng04002` as
  an absence, both landed by T015 (`85208150`), which appended two commands to the record and did not touch
  this Log (it is byte-identical to `4a4aed36`). Per commit the count is `ee4bfbd2` 13, `a4a57f9e` 13,
  `9f0603c9` 15, `234a3b4c` 16, `628bd800` 16, `85208150` **18**. Replaying every recorded command string at
  this head gives **17 byte-identical**, `c2`–`c18`; only `c1` differs, in the short HEAD it captured
  (`9e95f740` against `85208150`) — so "16" was true of `628bd800` and of nothing later. The failure is the
  same one the entry was written to end, in the paragraph directly above the one claiming the restated claims
  cannot go stale: the sizes are read from a commit's tree, while the count is a present-tense sentence about
  a file every append changes, and it expired in the next commit that read the record. A reader following
  "which command is which" is left without the two commands T015's own evidence rests on.
- ✅ **No product value moved and the declared suites are green at the head.** T001's record still re-derives:
  `node --test scripts/recording-consistency.test.mjs scripts/console-panel-record.test.mjs` → **41 tests, 6
  suites, 41 pass, 0 fail**; `scripts/console-join.test.mjs` → **30 tests, 9 suites, 30 pass, 0 fail**;
  `scripts/console-panel-render.test.mjs` → **37 tests, 3 suites, 37 pass, 0 fail** — 108 pass, 0 fail across
  the three runs. `npm run check` is exit 0 at this head, including
  `fix-record clean - examined 130 claim(s) in 15 task log(s) of .project/tasks … pass - 0 finding(s)` and
  `All matched files use Prettier code style!`. Both of T013's Log corrections are the only changes T013 made.
- ⚠️ Advisory: the first entry still dates its measurement to head `9e95f740`, where the file does not exist —
  `git cat-file -s 9e95f740:research/raw/m045-console-shapes.json` answers
  `fatal: path 'research/raw/m045-console-shapes.json' exists on disk, but not in '9e95f740'`. The 27,122
  bytes exist at `ee4bfbd2`, which the correction names, so the size is anchored; the head attribution at
  `:51` is left uncorrected and the number cannot be read at the commit it names.
- ⚠️ Advisory: `:119`'s "The worktree is the named commit's bytes and not some later state … both print
  `de0f927a…`" is true of `628bd800` (verified: `git rev-parse 628bd800:research/raw/m045-console-shapes.json`
  prints `de0f927ab2dce1d722a1dbada2dd00d116d4feef`) and false of the head, where the blob is `9b6f9e70…` and
  the file is 39,284 bytes. Dated rather than wrong, but it reads as timeless in the entry that argues for
  timelessness.

## Adversarial test

Every claim was attacked by running it rather than reading it. **Against the sizes:** the pinned command was
extracted from the Log text and executed verbatim, not retyped, and its six lines compared against the quoted
block; each number was then re-measured a second way (`git cat-file -s <commit>:<path>` inside a fresh node
process) and agreed. **Against staleness:** the record's size was measured *after* T015 moved it — head 39,284
bytes, blob `9b6f9e70…` — and the six pinned lines are unchanged, which is the property the entry claims and
the one the old worktree command lacked (re-run at this head it prints `bytes: 39284`). **Against the append:**
the file at T013's base was compared byte for byte with the file at the landing commit and at the head; both
are exact prefixes, and the head file is identical to `4a4aed36`'s, so nothing was rewritten to fit the
correction and nothing later edited it. **Against the count:** I counted `provenance.commands` at every commit
that touched the record (13, 13, 15, 16, 16, **18**) and replayed every command string at this head — 17
identical, `c1` differing only in the short HEAD — so "16" is a correct count of `628bd800` and a wrong count
of the head. **Against "no other number is loose":** every other count and size in the Log was matched to a
carried command — `c3`'s `agent-main.js lines=2568`, `c5`'s 15 lines, `c8`/`c9`'s 64/53/11/45/62 and code
lengths 6–7, `c10`'s 61,577/61,450/326, `c12`'s 965, `:52`'s 13 commands and 10 `notCaptured` entries (both
true at `ee4bfbd2`) — and each replayed byte-identically at this head. **Against the suite claim:** the three
suites and `npm run check` were run on a tree whose only untracked file is review prose, before and after the
replays, with no product path modified.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ The record still derives from the shapes this head carries, not from a capture of an older one:
  "re-derives from the join, the digest and the pane this head carries" and "every byte count a recording
  states in prose is a byte total the recording records" are both green in the 41-test run, and the per-case
  surfaces re-render — the `no-code` case still reads `no-code: the captured message carried no code, so this
  finding carries no code and no title`, with `the app failed (this message carried no code)` as its text.
- ✅ One finding per diagnostic, carrying that diagnostic's own text and code, is pinned in both directions:
  `a code the digest lacks is named, and a count instead would redden` is green (30-test join run, 37-test
  render run), and the `NG04002` case names the carried code with `no-digest-entry` and no title, so neither
  an invented code nor a count stands in for a name. SC1's evidence is intact at `85208150`; the failure
  recorded above is provenance prose in T001's Log — a count of commands — and not a number the panel or the
  record reads.
- ✅ The two commands T015 added are the ones that extend this evidence (`c17` a case-folded `ng01002` joined to
  `NG01002` and `c18` an absence named by the code the message carried), and both replay byte-identically at
  this head — so the gap is that the Log does not name them, not that the record lacks them.

## Environment note

Views are of HEAD `85208150`. `git status --porcelain` listed only the pre-existing untracked
`.project/review/VERIFICATION.json` before this review and lists only that file plus this one after it; no
product file, branch or commit was touched, and no `.project/` file outside `.project/review/` was written.
`npm run check` ran on that tree: verification gate pass, `archive-paths clean - examined 17 live path
reference(s) of 184 reference(s) in 146 suite(s)`, `fix-record clean - examined 130 claim(s) in 15 task log(s)
of .project/tasks … against 73 changed path(s) of b8d3341c…85208150 … pass - 0 finding(s)`, Prettier clean;
`git status` was identical afterwards. All scratch scripts and replay harnesses live in the session
scratchpad, not in the repository.
