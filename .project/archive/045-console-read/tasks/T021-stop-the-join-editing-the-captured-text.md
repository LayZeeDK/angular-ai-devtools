---
id: T021
title: Stop the join editing the captured text
wave: 13
deps:
  - T002
status: done
agent: build_T021
base: 820978f330a28d8718e2a22d83b879bef9fc668c
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-shapes.json
  - research/raw/m045-console-panel.json
---

# T021 — Stop the join editing the captured text

## Context

Wave 2's cycle-3 review recorded, for the third time, that the join appends " (this message carried no
code)" to the diagnostic's own text before the pane renders it as `text:`. The pane's own docblock says `text:`
is the captured text verbatim, and the pane already states the absence in its own `no-code:` sentence, so the
surface says twice what the capture said once and edits a string it claims to quote.

SC1 asks for one finding per diagnostic "naming the diagnostic's own text". A finding whose text is the
capture's text plus the join's sentence does not name the diagnostic's own text.

## Approach

- - Make `text` byte-identical to the diagnostic's own text, for every state and every finding.
- Keep the absence: the pane's `no-code:` sentence is what states it, and the finding's missing `code` is what
  selects that sentence. Removing the join's parenthetical must lose no information the surface shows.
- Pin it: a test asserts `text` equals the input text for a message with no code, one with a code, one whose
  code the digest lacks, and one with surrounding whitespace if `codeOf` trims (say what happens to whitespace).
- Re-capture the records the change stales, and prove an unarmed run reads them byte-identically.
- Record in the task Log that the interface-contract copies in the landed task files omit `carriedCode`, so
  that gap is visible rather than silent; do not edit the landed task bodies, which are append-only.

## Acceptance criteria

1. Every finding's `text` is byte-identical to the text the capture recorded, proven for a message with a code, one without, one whose code the digest lacks, and one with leading or trailing whitespace.
2. The surface still reports a message that carried no code, through its own sentence, and a test shows that removal of the join's note loses nothing.
3. The records that describe the join's answers are re-captured, and an unarmed run reads them byte-identically.
4. The gap the review found — `carriedCode` absent from the interface-contract copies in the landed task files — is recorded in this task's Log as a known documentation gap.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check extension scripts research/raw
```

## Log

- Task written at the sixth repair cycle; not started.
- **Built on the wave-13 head, four of the five declared files written and the fifth left byte-identical
  because the change does not move it.** The tree advanced while this ran: the task was dispatched at
  `e99a389d` and the orchestrator committed two state-only commits (`18b172c3`, `820978f3`) before the
  work landed, so the head is now `820978f3` with this task's edits uncommitted on top. Hashes after
  the work, all measured on the working tree: `extension/console-join.js`
  `d0be49a966eb1bfedac424322935646d232570a2bc8265be158d70de58ba7d6d` (12,121 B);
  `scripts/console-join.test.mjs`
  `6f920ed85b57228ea954c45a3637331df7ca02f205713f9d4a346f3ab0c26ea0` (59,394 B);
  `scripts/console-panel-render.test.mjs`
  `64e0b840bc9b100d2f3d90011316d291406d4669754cd7995db151c71c5dd2db` (123,140 B);
  `research/raw/m045-console-panel.json`
  `acc7f43863b24acd5cf072a6cc5b1d2292374ac210b3b2c1ac25a783230fd27b` (17,869 B);
  `research/raw/m045-console-shapes.json` unchanged at
  `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091` (39,284 B). No other file was
  written: the prescribed `npm run check` rewrites `.project/review/VERIFICATION.json`'s `at`
  timestamp, and that gate artifact was restored byte-identically to HEAD afterwards, so the tree
  carries this task's changes and no incidental one.
- **The product change: `text` is the capture's string and nothing else.** `extension/console-join.js`
  no longer has a `NO_CODE_NOTE`; the no-code branch is `findings.push({ text: text });`, and the
  module's `findings.text` documentation now states that the field is byte for byte the string the
  capture recorded on every finding and in every state, never trimmed, decorated or suffixed, and that
  a message that carried no code is reported by the absence of `code`. The absence was never carried by
  a field of its own, so the note was the join writing a fact into a string the contract calls the
  capture's — and the surface already states it once.
- **Nothing replaced the note, because nothing was lost.** The pane's `no-code:` sentence
  (`NO_CODE_TEXT`) is what states the absence, selected by the finding having no `code`; it already
  rendered before this change and is byte-identical after it. The new pin
  `pinTheRemovedNoteLosesNothing` (in `scripts/console-panel-render.test.mjs`) measures that: it
  reconstructs the answer the join used to give for the same capture (the note in the one finding with
  no code) and asserts the old and new panes differ in exactly the one `text:` line, while the
  `no-code:` sentence is identical; it also asserts that a coded finding whose text contains the
  note-shaped wording gets no `no-code:` sentence at all, so the sentence is selected by the missing
  `code` and never by the words in the text.
- **The four inputs, before and after, measured through the module at HEAD and the working tree.** The
  note only ever applied to a message with no code; the other three were already verbatim before this
  change, and the pin now holds them so a future edit cannot start editing them.

  | Input | `text` before | `text` after |
  | --- | --- | --- |
  | `code: 'NG0100'`, message `NG0100: Expression has changed after it was checked.` | the same string | the same string |
  | `code: null`, message `the app failed` | `the app failed (this message carried no code)` | `the app failed` |
  | `code: 'ng04002'`, message `ng04002: Cannot match any routes.` | the same string | the same string |
  | `code: '  NG0100  '`, message `  NG0100: état — padded exactly as captured  ` | the same string | the same string |

  Each after-value was compared with the input as UTF-8 bytes
  (`Buffer.from(text).equals(Buffer.from(message))` is `true` for all four). The whitespace is deliberate
  and stated: `codeOf` trims the **code** it compares (the padded spelling above joins `NG0100`), and
  nothing trims `text`, so the captured string keeps its leading and trailing spaces, the multi-byte
  `é` and the em dash exactly as recorded. The pin first asserts the padded input really differs from
  its `trim()` and then asserts the finding's `text` equals it, so a trim of the text is observable.
- **Pins, not declarations.** One named pin function in each suite: `pinTextIsTheCapturedText` in
  `scripts/console-join.test.mjs` (the four inputs above) and `pinTheRemovedNoteLosesNothing` in
  `scripts/console-panel-render.test.mjs` (the no-code sentence and the old-answer comparison). Both are
  called from tests whose subject they share, so the declaration counts `research/raw/m057-verdict-claims.json`
  pins are unchanged: `scripts/console-join.test.mjs` still has **22 `it(` declarations in 9 groups**
  and `scripts/console-panel-render.test.mjs` still has **17 in 3 groups** (counted at this head). The
  new mutants go into the existing `MUTATIONS` loops, so the files are 38 and 40 executed tests; both
  green on the shipped tree.
- **Each new pin is armed, and each mutant reddens naming its defect.** The join mutants were applied
  to the shipped `extension/console-join.js` by a runner that writes the pristine bytes back in a
  `finally` block; the file held `d0be49a9…` before the first armed run, was re-hashed armed, and
  `restored sha equals pristine: true` after each.

  | Pin | Mutant | Armed sha256 / bytes | Failure the pin gives |
  | --- | --- | --- | --- |
  | `pinTextIsTheCapturedText` (no-code input) | `findings.push({ text: text });` → the old note appended again | `7bed568892ef33485f795cafa194d4306d4b64ca4b092e7fd82ba0f9124c773a`, 12,157 B | `AssertionError: text is the captured text, verbatim — never trimmed and never given an appended note: for a message that carries no code … the join answered {"text":"the app failed (this message carried no code)"}` |
  | `pinTextIsTheCapturedText` (whitespace input) | `const text = textOf(diagnostic);` → `.trim()` | `737ed86d5dee8df90d09d456542b6a3a7487f4f0096bff708177935d41b50aa3`, 12,128 B | `AssertionError: text is the captured text, verbatim — never trimmed and never given an appended note: for a message with leading and trailing whitespace … the join answered {"text":"NG0100: état — padded exactly as captured","code":"NG0100","title":"Expression Changed After Checked"}` |
  | `pinTheRemovedNoteLosesNothing` | the pane's `no-code:` sentence dropped (`NO_CODE_TEXT` → `''`) | `1431035320967529896be0182056f64874dfa294de1fc7a214cbfb8260ec392b`, 21,891 B, written to the suite's temp dir only | `mutant no-code reddens: the pane states the absence once, in its own no-code sentence; it rendered [] + actual - expected + [] - [ - 'no-code: the captured message carried no code, so this finding carries no code and no title' - ]` |

  The two join mutants were also armed at file level: `scripts/console-join.test.mjs` ran 38 tests,
  31 pass / 7 fail, exit 1 under the note mutant and 34 pass / 4 fail, exit 1 under the trim mutant;
  the behavioural reds are the two quoted above, and the rest are the suite's mutation machinery
  noticing that an anchor it re-applies is already mutated. The pane mutant never touches the checkout:
  `apps/angular-ai-devtools/src/app/panel-console.ts` hashes to
  `ec28dfcbfba0d227bed0b7314c1552b301d2c4bc5fcdf090cd376263407ba5c4` (21,901 B), equal to
  `git show HEAD:` before and after.
- **The records.** `research/raw/m045-console-panel.json` moved once with the change:
  `fb962d704d0b3d94f292bd590486b9638373ee21894e2fea2da90ccc30c6023a` (17,962 B) →
  `acc7f43863b24acd5cf072a6cc5b1d2292374ac210b3b2c1ac25a783230fd27b` (17,869 B), and only the three
  `joined` case spellings of the note moved (finding text, `text:` line, surface text). An unarmed run
  before the re-capture failed naming exactly that:
  `<record>.cases[0].findings[2].text: "the app failed (this message carried no code)" -> "the app failed"`.
  The documented armed command (`set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs`)
  wrote it once (exit 0, 37 tests, 36 pass, 1 skipped — the skip is the armed run's own default-read
  test); a second armed run at the same head wrote no byte (the hash above, unchanged), and the unarmed
  run then read it byte-identically (37 tests, 37 pass, exit 0).
  `research/raw/m045-console-shapes.json` does not stale: its recorded join answers (c17 and c18) are
  both findings whose messages carried a code, so the change does not reach them. Re-running those two
  recorded commands exactly printed strings equal to the record's `output` for each
  (`c17 re-derived === recorded: true`, `c18 re-derived === recorded: true`), and the file's sha256 was
  the same before and after (39,284 B), so re-capturing it wrote nothing. The unarmed `console-join`
  suite reads that record and holds c17/c18 to the join's current answers. The shapes record's
  `joinContract` is a quote of T001's Interface contract and is left as written, per the next bullet.
- **Known documentation gap, recorded rather than silently fixed.** Every `Interface contract` copy in
  the landed task files — T002's own section and T008, T015, T018 and T019 — states
  `{ text, code?, title?, reason? }` and omits `carriedCode`; so does the record's
  `joinContract.finding`, which is reconciled only through `caseFoldedMatch.supersedesNote`. The task
  bodies are append-only and were not edited. Two residues of the old note also sit outside this task's
  five declared files and were therefore left untouched: `apps/angular-ai-devtools/src/app/panel-console.ts:34`
  ("the finding's `text` already says so") and the demo fixture at
  `apps/angular-ai-devtools/src/app/panel-demo.ts:397` with its spec's
  `/\(this message carried no code\)$/` assertion. They are prose and demo data, not the join, and the
  demo's spec still passes because that fixture is the demo's own answer.
- **Fenced `## Verify`, run exactly at this head, exit 0.** A first run of the same command exited 1
  only at `format:check` (`[warn] scripts/console-join.test.mjs`, `[warn] scripts/console-panel-render.test.mjs`,
  `Code style issues found in 2 files`); `npx prettier --write` on those two declared files fixed the
  style, and the re-run below is the one quoted. Real output, eliding only the per-test detail lines
  that the counts summarise:

  ```
  ▶ provenance: the input is the shipped digest and the measured record
    ✔ agrees with T001 on the digest, on the missing code and on the folded code
  ...
    ✔ text-edited-with-the-note reddens naming "verbatim"
    ✔ text-trimmed reddens naming "whitespace"
  ...
    ✔ no-code-sentence-dropped reddens naming "no-code"
  ...
  ℹ tests 85
  ℹ suites 12
  ℹ pass 85
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ...
  [OK  ] contract:control-ai-devtools: contract checks pass
  scripts-in-step: 3 copies in step
  verification gate (structure): pass
  gate-integrity: pass - 0 finding(s)
  gate-integrity: pass - 0 finding(s), 136 mention(s)
  Checking formatting...
  All matched files use Prettier code style!
  Checking formatting...
  All matched files use Prettier code style!
  ```

  The 85 are 38 (join) + 40 (panel render) + 7 (recording consistency); no test failed, so nothing is
  quoted from a failure. The intended failures in this task were the armed mutants' reds, quoted above.
- No branch was created and nothing was committed.

ready
