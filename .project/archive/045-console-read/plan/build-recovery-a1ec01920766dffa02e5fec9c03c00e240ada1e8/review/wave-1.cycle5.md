# Review — wave 1, cycle 5

Cycle: 5
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 1e84c49861b91f3e223b5655c23a6acbd842bc1b

## T001 — Measure the capture and the digest: fail

- ✅ **The per-commit count is correct, and the command that prints it prints exactly what the Log states.**
  I took the command at `.project/tasks/T001-measure-the-capture-and-the-digest.md:145` out of the file and ran
  it verbatim at this head rather than retyping it. Its eight lines are `ee4bfbd2: 13 commands (c1-c13)`,
  `a4a57f9e: 13 commands (c1-c13)`, `9f0603c9: 15 commands (c1-c15)`, `234a3b4c: 16 commands (c1-c16)`,
  `e1ba31fc: 16 commands (c1-c16)`, `628bd800: 16 commands (c1-c16)`, `85208150: 18 commands (c1-c18)`,
  `686c6124: 18 commands (c1-c18)`, `all exit 0: true` on every line, with byte sizes
  27,122 / 27,783 / 33,917 / 35,619 / 35,619 / 35,619 / 39,284 / 39,284 — identical, line for line, to the
  quoted block at `:148-155`. The command reads each commit's own tree with `git show <commit>:<path>` and never
  the worktree, so the counts are measurements at commits and not present-tense sentences about the record.
  The cycle-4 failure — "16, `c1`–`c16`" against a record holding 18 — is repaired: `:161` names `628bd800` as
  the last commit `:121`'s "16" is true of, `:162` names `85208150` and `686c6124` for 18, and `:159` anchors
  `:52`'s "13" to `ee4bfbd2`. The count at this head is **18, `c1`–`c18`**; the record's blob is unchanged from
  `85208150`'s (`9b6f9e70593723004331b6bc25e97bc725f853a9`, 39,284 bytes), and the worktree's hash-object is
  that same blob, so the numbers describe what is checked in.
- ✅ **`9e95f740` carries no record, and the commit the Log now names does.** `git cat-file -s
  9e95f740:research/raw/m045-console-shapes.json` answers `fatal: path 'research/raw/m045-console-shapes.json'
  exists on disk, but not in '9e95f740'`, exit **128**; the same read at `ee4bfbd2` prints `27122`, exit **0**.
  `git rev-parse ee4bfbd2^` prints `9e95f740c5481f38178c39b50406877da2977f84`, so `9e95f740` is the parent of
  the first carrying commit — the commit the commands ran at, not the commit a size can be read at. The
  record's history is `ee4bfbd2`, `a4a57f9e`, `9f0603c9`, `234a3b4c`, `85208150`, five commits that begin at
  `ee4bfbd2` and never earlier, which is the load-bearing half of the correction. The Log's other stated size
  is held the same way: `extension/error-digest.json` is 61,577 bytes at `9e95f740`, at `628bd800` and at this
  head.
- ✅ **The two commands added after the last correction are named, and their descriptions are their own recorded
  output.** I re-ran the per-parent command at `:165` verbatim: `a4a57f9e added: none`, `9f0603c9 added:
  c14,c15`, `234a3b4c added: c16`, `85208150 added: c17,c18`. I re-ran the block at `:175` verbatim:
  `c17 exit 0: {"state":"joined","findings":[{"text":"ng01002: Missing control value for the input",
  "code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}]}` and `c18 exit 0:
  {"state":"joined","findings":[{"text":"ng04002: Cannot match any routes.","code":"ng04002",
  "reason":"no-digest-entry"}]}` — byte-identical to `:178-179`, so `:181`'s description ("`c17` joins a
  case-folded `ng01002` to the digest's `NG01002`, and `c18` reports `ng04002` as an absence the digest does not
  carry") is what the record shows. `c1`–`c16` are named at `:122`–`:137`, which is where the Log says they
  are; no command in the record is left unnamed at this head.
- ✅ **The corrections are appends, byte-prefix identical, and the Log carries no other edit.** The file is
  21,745 bytes at `5fa81ef7` (T016's base) and at `686c6124` — the same blob, sha256
  `3a9792be234799741d99fc2b35ab539d67ef4c03f7589b14bfe9e69680623aa1` at both — and its first 21,745 bytes are
  an exact byte prefix of the 35,485 it holds at `315a6095` and at this head. Re-running the prefix-hash
  command at `:227` verbatim reproduces its three quoted lines including `identical: true`, and the hash covers
  a fixed range, so a later append cannot move it. The appended 13,740 bytes add no line-control byte: the
  whole file still carries exactly one non-LF control character, `U+000C` at index 9056, zero carriage returns,
  `charAt(9064)` `"\n"` — the state the `:91-99` correction describes. `git show --stat 315a6095` lists two
  task files and no product path, and the record is byte-identical to `85208150`'s blob, so T016 measured the
  record rather than writing it.
- ✅ **The suites the record feeds are green, with their counts, at this head.** `node --test
  scripts/recording-consistency.test.mjs scripts/console-panel-record.test.mjs` → **44 tests, 7 suites, 44
  pass, 0 fail**; `node --test scripts/console-join.test.mjs` → **36 tests, 9 suites, 36 pass, 0 fail**;
  `node --test scripts/console-panel-render.test.mjs` → **39 tests, 3 suites, 39 pass, 0 fail** — 119 pass, 0
  fail across the three runs. `npm run check` is exit **0**, with `verification gate (structure): pass`,
  `archive-paths clean - examined 17 live path reference(s) of 184 reference(s) in 146 suite(s)`,
  `fix-record clean - examined 152 claim(s) in 19 task log(s) of .project/tasks … pass - 0 finding(s), 136
  mention(s)` and `All matched files use Prettier code style!` twice.
- ❌ **The replayed count is still a count of a file that grows: the command that prints it reads the worktree,
  and the next append moves it.** `:182` titles the paragraph "The replayed count, held to the head it was
  replayed at", and `:190` states **17 identical, `c2`–`c18`** in bold. The carried command at `:184` does not
  read `686c6124`'s tree — it does `require('./research/raw/m045-console-shapes.json')` and prints the live
  HEAD — so it has no mechanism to hold the count to that head. Measured: run verbatim at this head it prints
  `replayed 18 recorded commands at head: 17 identical, differ: c1` and
  `c1 recorded: ["gsd-path/M057","9e95f740"] now: ["gsd-path/M057","1e84c498"]`, where the quoted block at
  `:188` reads `now: ["gsd-path/M057","686c6124"]` — the block is not reproducible from the recorded command at
  the reviewed head, in the one line whose value moves with every commit. And the count itself expires: I
  copied the record into the session scratchpad, appended a single `c19` to `provenance.commands`, and ran the
  same logic against the copy — `replayed 19 recorded commands at head: 18 identical, differ: c1`. So the next
  append to the record falsifies "17 identical, `c2`–`c18`" and its quoted first line. This is the defect T013
  removed from the sizes (a worktree read where a commit read is required), one layer down in the same entry:
  next to it, `:145`'s count command and `:213`'s blob command read commits and reproduce anywhere; `:184`'s
  does not.
- ⚠️ Advisory: `:162` states "**The count at this head is 18, `c1`–`c18`.**" — a bold present-tense count of
  `provenance.commands`, whose only qualifier is "this head". It is a correct reading of `686c6124` (the head
  `:143` names) and of this head, and the bullet it closes names its commits, so the number is anchored above
  it. But it is the same shape as the sentence cycle 4 failed: a count of a list every append grows, stated
  without naming the commit in the sentence that states it.
- ⚠️ Advisory: `:163` — "The commands this Log leaves unnamed are `c17` and `c18`" — and `:181` — "**No command
  in the record is unnamed by this Log**" — are completeness claims over a file that grows. Both are true at
  this head (verified above), and both are false the moment a `c19` lands: the unnamed set becomes
  `{c17, c18, c19}` and the universal statement reads as an assurance a reader cannot check. The second is the
  exact assurance that failed in cycle 4, restated without a commit.
- ⚠️ Advisory: `:201` — "The record's whole history is five commits and begins there" — is a count over a
  growing history. It is five now (`git log --format="%h" -- research/raw/m045-console-shapes.json` prints
  five) and becomes six with the next commit that appends to the record. The load-bearing half, "and begins
  there", is carried by the printed log block at `:203-208` and survives; the count does not.

## Adversarial test

Nothing was taken from the receipt. **Against the count:** I extracted the Log's own commands from the file
text and ran them verbatim rather than retyping them, then re-derived the same numbers a second way
(`git show <commit>:<path>` in a fresh node process per commit) and compared against `provenance.commands`
read out of each tree; all eight lines agreed. **Against the attribution:** `9e95f740` was read for the record
by `git cat-file -s` (fatal, exit 128), `ee4bfbd2` was read and printed 27,122 (exit 0), and the parent relation
was measured (`git rev-parse ee4bfbd2^`) rather than assumed; the whole history of the path was listed to check
that no earlier commit is a candidate. **Against the naming:** the per-parent diff of `provenance.commands` was
re-derived for every commit that touched the record, and `c17`/`c18`'s recorded outputs were printed from the
record itself and compared with the quoted block character for character. **Against the append:** the Log was
compared byte for byte against `5fa81ef7`/`686c6124`, against its landing commit and against this head, and the
prefix hash was recomputed over a fixed range; the whole file was scanned for control bytes. **Against the
staleness claim:** I did not accept `:190` because it says "held to the head it was replayed at" — I ran the
carried command at this head (one of its two lines already differs) and then replayed a one-append copy of the
record in the scratchpad, which moved the count from 17 to 18 identical. **Against the suites:** the three runs
and `npm run check` were executed on a tree whose only untracked path is `.project/review/`, before and after
the replays, with no product path modified.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ T016's landing changed no product path and no byte of the record — `git show --stat 315a6095` lists the two
  task files only, and `research/raw/m045-console-shapes.json` is the blob `85208150` carries
  (`9b6f9e70…`, 39,284 bytes). The record still re-derives against this head and the pane still renders one
  finding per diagnostic from its own text and code: 44 pass / 0 fail across recording-consistency and the
  panel record, 36 pass / 0 fail across the join, 39 pass / 0 fail across the render, with the `no-code` and
  `NG04002`/`no-digest-entry` surfaces among them — so neither an invented code nor a count stands in for a
  name. The failure recorded above is provenance prose in a task Log — a count of commands and a completeness
  claim — and not a number the panel or the record reads.

## Environment note

Views are of HEAD `1e84c49861b91f3e223b5655c23a6acbd842bc1b` on `gsd-path/M057`. `git status --porcelain` listed
only the pre-existing untracked `.project/review/` before this review and lists only that plus this file after
it; no product file, branch or commit was touched, and no `.project/` file outside `.project/review/` was
written. `npm run check` ran on that tree and was exit 0, and `git status` was identical afterwards. The plan's
`npm test` half of the project Verify was started and stopped before it produced output, so no claim here rests
on it; the three suites above were run individually and are what the counts come from. The
`c19` simulation lives in the session scratchpad against a copy of the record; the repository's record was read
and never written.

One tree observation, recorded rather than explained: immediately after the `npm test` attempt was stopped,
`git status --porcelain` showed `M research/raw/m045-console-panel.json` for a few seconds — the diff added the
`case-difference: the message carried ng0910 …` line to one recorded case — and the next read, seconds later,
showed the file byte-identical to HEAD again (`558941083ea105780f780b0c43970839519c3cf6`). Whether that was a
dying test child mid-write-then-restore or another writer in this shared worktree, the tree was quiet before and
after this review, both records hash to their HEAD blobs (`9b6f9e70…` shapes, `55894108…` panel), and no
evidence in this review rests on the file during that window.
