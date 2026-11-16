# Review — wave 11, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T016 — Make the counts a measurement at a commit too: pass

Landing commit `315a6095` (`git show --stat`: two files, +153/−3 — `.project/tasks/T001-…md` by 95 inserted
lines and this task file). It wrote no product path and no byte of the record.

- ✅ yes — **the count command the Log carries reproduces its quoted block line for line.** I took the
  `node -e` command at `.project/tasks/T001-measure-the-capture-and-the-digest.md:145` out of the file and
  ran it verbatim at this head. Its eight lines are `ee4bfbd2: 13 commands (c1-c13), all exit 0: true,
  bytes 27122`, `a4a57f9e: 13 commands (c1-c13), … bytes 27783`, `9f0603c9: 15 commands (c1-c15), …
  bytes 33917`, `234a3b4c: 16 commands (c1-c16), … bytes 35619`, `e1ba31fc: 16 commands (c1-c16), …
  bytes 35619`, `628bd800: 16 commands (c1-c16), … bytes 35619`, `85208150: 18 commands (c1-c18), …
  bytes 39284`, `686c6124: 18 commands (c1-c18), … bytes 39284` — identical to the block at `:148-155`. The
  command reads each commit with `git show <commit>:<path>` and never the worktree, so each line is a
  measurement of the commit it names and a later append cannot move it.
- ✅ yes — **the two commands added after the last correction are named, and the naming is measured.** The
  per-parent command at `:165`, run verbatim, prints `a4a57f9e added: none`, `9f0603c9 added: c14,c15`,
  `234a3b4c added: c16`, `85208150 added: c17,c18` — the four lines at `:168-171`. `c17` and `c18`'s own
  recorded outputs, printed from the record by the command at `:175`, are
  `c17 exit 0: {"state":"joined","findings":[{"text":"ng01002: Missing control value for the input","code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}]}`
  and `c18 exit 0: {"state":"joined","findings":[{"text":"ng04002: Cannot match any routes.","code":"ng04002","reason":"no-digest-entry"}]}`,
  byte-identical to `:178-179`.
- ✅ yes — **the `9e95f740` attribution is corrected to a commit that carries the record, proven by exit
  codes.** `git cat-file -s 9e95f740:research/raw/m045-console-shapes.json` answers `fatal: path
  'research/raw/m045-console-shapes.json' exists on disk, but not in '9e95f740'` and exits **128**;
  `git cat-file -s ee4bfbd2:research/raw/m045-console-shapes.json` prints `27122` and exits **0**;
  `git rev-parse ee4bfbd2^` prints `9e95f740c5481f38178c39b50406877da2977f84`, so the commit the commands
  ran at is the parent of the first commit that carried the file, not a commit a size can be read at.
  `git log --format="%h %s" -- research/raw/m045-console-shapes.json` prints five commits and begins at
  `ee4bfbd2`, so no earlier commit is a candidate. The sizes the Log states are the same readings:
  35,619 at `628bd800`, 39,284 at `686c6124`.
- ✅ yes — **each correction is an append, proven over a fixed byte range.** The prefix-hash command at
  `:227`, run verbatim, prints
  `sha256 of .project/tasks/T001-measure-the-capture-and-the-digest.md at 686c6124: 3a9792be234799741d99fc2b35ab539d67ef4c03f7589b14bfe9e69680623aa1 (21745 bytes)`,
  the same digest for `the first 21745 bytes of this file`, and `identical: true`. Both digests cover the
  whole file `686c6124` carried, so every earlier Log byte is present and unchanged.
- ✅ yes — **the record was measured, not written, and the worktree-hash sentence was restated to name its
  commit.** `315a6095:research/raw/m045-console-shapes.json` is the blob
  `9b6f9e70593723004331b6bc25e97bc725f853a9` at 39,284 B — the same blob `686c6124` carries and the same
  blob `git hash-object research/raw/m045-console-shapes.json` prints for this worktree. The `628bd800`
  blob the Log distinguishes it from is `de0f927ab2dce1d722a1dbada2dd00d116d4feef`, 35,619 B. This task's
  Verify, run as fenced: `node -e "…console.log('bytes: '+b.length)"` → `bytes: 39284`; `npm run check` →
  exit 0 with `verification gate (structure): pass`, `gate-integrity: pass - 0 finding(s)`, and
  `gate-integrity: pass - 0 finding(s), 145 mention(s)` at this head; `npx prettier --check
  research/raw/m045-console-shapes.json` → `Checking formatting...` / `All matched files use Prettier code
  style!`, exit 0.
- ⚠️ Advisory — **the one number this task did not convert is the replay count, and it is the same defect
  one list over.** `:184`'s recorded command `require`s the record from the worktree and replays it at the
  live HEAD, so `:190`'s "**17 identical, `c2`–`c18`**" is a count of a list the next append grows, not a
  measurement at a commit: run verbatim at this head it already prints
  `replayed 18 recorded commands at head: 17 identical, differ: c1` with
  `c1 recorded: ["gsd-path/M057","9e95f740"] now: ["gsd-path/M057","cd319fa9"]`, where the quoted block at
  `:188` reads `now: ["gsd-path/M057","686c6124"]`. T016's own acceptance criteria are scoped to "the
  record's commands", and the replay count is not one of those, so this is outside its contract — but the
  wave's goal ("no number in the Log is a fact about a file that grows") is met for the command list and not
  for the replay list at this landing. `:162`'s closing "**The count at this head is 18, `c1`–`c18`.**" is
  the second reading of the same shape: a present-tense count whose only anchor is a deictic. A later task
  withdrew every derived count in this Log and replaced it with the command that prints it
  (`.project/tasks/T001-…md:236-259`), which is where this class is settled; at `315a6095` it was not.

## T017 — Hold the record's label vocabulary to the pane: pass

Landing commit `33fa8c7b` (`git show --stat`: three files, +482/−7 — this task's file,
`research/raw/m045-console-panel.json` +1, `scripts/console-panel-record.test.mjs` +405).

- ✅ yes — **the record's list is the pane's fifteen, and the record's own diff is the one inserted line it
  claims.** `git show 33fa8c7b -- research/raw/m045-console-panel.json` is a single `+"case-difference",`
  between `"no-digest-entry"` and `"no-finding"`, and nothing else. `contract.lineLabels` reads
  `["state","code","title","reason","text","no-code","no-title","no-digest-entry","case-difference",
  "no-finding","no-console-answer","unreadable-finding","joined","captured-nothing","no-diagnostics"]` — 15,
  each once.
- ✅ yes — **the pane side really needs the three readings the pin documents.** My own independent reading of
  `apps/angular-ai-devtools/src/app/panel-console.ts` collected 14 labels: `code, reason, text, title` from
  the literal `lines.push(`label: …`)` pushes and `captured-nothing, case-difference, joined, no-code,
  no-console-answer, no-diagnostics, no-digest-entry, no-finding, no-title, unreadable-finding` from the
  registry texts. The fifteenth, `state`, is pushed as an array element (`const lines: string[] =
  [`state: ${state}`]`), which no literal push pattern sees — so it is supplied only by the rendered-output
  reading, exactly as `scripts/console-panel-record.test.mjs:1576-1595` says: "needs three readings because
  no single one covers the pane". With that reading the pane and the record are 15 = 15 and the set
  difference is empty in both directions.
- ✅ yes — **both drift directions are live, measured and then proven inside the suite.** Written to a copy,
  an added `lines.push(`cause: the message states one`)` makes the pane-only set `["cause"]`; renaming
  `reason:` to `because:` makes it `["because"]` with the record-only set `["reason"]`; appending `"cause"`
  to the record's list alone makes the record-only set `["cause"]`. The suite arms the same pin in memory
  from both sides — `console-panel-record.test.mjs:2681` against a mutated module and `:2695` against a
  mutated contract — and both run green in the 38/38 pass, so neither direction passes vacuously. The
  vocabulary is not widened to bless a sentence: the pin also refuses a label that is one of
  `contract.prohibitedWording` (`:1810-1816`).
- ✅ yes — **the record moved on one armed run and reads back unchanged unarmed.** sha256 over
  `git show <commit>:research/raw/m045-console-panel.json`: `6db9417934a7ffffbf2c2ce41f672013e4b25fcc6c7ad298d7e6cd71ad30d11f`
  (15,495 B) at `315a6095` → `f02f277c278fbc752c74e111cdfa0ddbc5cfdc88ff1276f1f8c02b9ea3aac291` (15,520 B)
  at `33fa8c7b`, both the values and both the sizes the Log states. This task's Verify at this head:
  `node --test scripts/console-panel-record.test.mjs` → `ℹ tests 38`, `ℹ suites 7`, `ℹ pass 38`, `ℹ fail 0`,
  `ℹ cancelled 0`, `ℹ skipped 0`, exit 0, and `git hash-object` on the record equals the blob HEAD carries,
  so the unarmed run writes nothing.
- ⚠️ Advisory — **one sentence of this Log is now false at this head, and a later task made it false.**
  "No recorded case renders the `case-difference` sentence and a test asserts that absence"
  (`.project/tasks/T017-…md:119-120`) was true at `33fa8c7b`, because the record's finding shape carried no
  `carriedCode`. `research/raw/m045-console-panel.json` now carries a six-case record whose
  `case-folded-match` case renders
  `case-difference: the message carried ng01002 and the digest carries NG01002, so this finding carries the
  digest's own spelling and title`, and `scripts/console-panel-record.test.mjs:2553-2554` now asserts the
  record **must** render that label ("the record must render \"case-difference\" from a recorded case, or …").
  The change is T023's (wave 16) and not this wave's, but it is the same ageing this milestone keeps
  repairing: a Log sentence about a record that later grew.

## T018 — Pin the fold's exactness behaviourally: pass

Landing commit `209da9e7` (`git show --stat`: three files, +584/−8 — this task's file,
`extension/console-join.js` 21 lines, `scripts/console-join.test.mjs` +461).

- ✅ yes — **the fold is ASCII-only in the product, and the reason is written where the rule is.** Measured
  on the shipped module: `from = 'NG0\u212A00'` (KELVIN SIGN for the `K`) is an absence named by the code the
  message carried, while `ng0k00` folds to `NG0K00` with `carriedCode: 'ng0k00'` — the two halves the pin
  asserts. The rule is the code, not a comment:
  `extension/console-join.js:141-143` — `function foldedSpan(code) {` / `  return code.replace(/[A-Z]/g,
  (letter) => letter.toLowerCase());` / `}` — with the header at `:30-35` stating why `toLowerCase()` is
  refused ("U+212A KELVIN SIGN lowercases to `k` … two codes that differ by character identity").
- ✅ yes — **each wrong rule I armed reddened a behavioural test that names it, and the module came back
  byte-identical.** Three mutants written into `extension/console-join.js` by a runner that restores the
  pristine bytes in a `finally` block (module sha256 `4e97f48e12a0195dae4b7f5d913371e2a559fb80f01c3e9ec1288a9b805099cd`
  before and after, `restored equal: true`), each run against `node --test scripts/console-join.test.mjs`:
  `foldedSpan(entry.code) === folded` → `.startsWith(folded)` gave exit 1 at `tests 39, pass 30, fail 9`;
  `.includes(folded)` gave exit 1 at `tests 39, pass 29, fail 10`; `.trim() === folded` and
  `.trim() === folded.trim()` each gave exit 1 at `tests 39, pass 30, fail 9`. The failure messages are the
  ones the Log quotes, verbatim:
  `the fold is equality and never a prefix: ng010 is a proper prefix of NG0100, and the join must not borrow
  that entry's title`,
  `the fold is equality and never a trim: a digest entry whose code is padded with whitespace is not the
  entry NG0100 names, and trimming the entry must not make it one`. I also armed `foldedSpan` back to
  `code.toLowerCase()`: exit 1 at `tests 39, pass 36, fail 3`, with
  `fold-beyond-ascii reddens naming "non-ASCII"` among them.
- ✅ yes — **the two properties the review found unpinned are stated rather than left silent.** The
  case-collapse tie-break is `pinStatesTheCaseCollapseIsDeliberate` (`scripts/console-join.test.mjs:909`),
  called from the shared test body at `:1232`, and its input is measured rather than assumed: the provenance
  test asserts the shipped digest holds 64 codes, 64 distinct folded forms, each `/^[A-Z0-9]+$/`, so the
  collapse is unreachable in the shipped data and the test says so. The carried-side trim is
  `pinCarriedTrimIsIndistinguishable` (`:1029`, called at `:1349`), whose message is the honest one —
  "this cannot be distinguished at this head: codeOf trims the carried code before the fold reads it, so
  trimming it again inside the fold changes no answer for any input the join can receive" — which is what
  the task's Approach asked for instead of a property the code does not have.
- ✅ yes — **the Verify is green at this head.** `node --test scripts/console-join.test.mjs` → `ℹ tests 39`,
  `ℹ suites 9`, `ℹ pass 39`, `ℹ fail 0`, `ℹ cancelled 0`, `ℹ skipped 0`, exit 0 (39 rather than the Log's 36
  because T021 and T022 added theirs after it). `npm run check` → exit 0; `npx prettier --check extension
  scripts` → `All matched files use Prettier code style!`. Nothing was taken from the receipt: the six
  mutants are the suite's own `MUTATIONS` loop, and the four reds quoted above are mine.

## Intent coverage
