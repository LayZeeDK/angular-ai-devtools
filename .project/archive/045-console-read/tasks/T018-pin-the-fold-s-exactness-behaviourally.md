---
id: T018
title: Pin the fold's exactness behaviourally
wave: 11
deps:
  - T015
status: done
agent: build_T018
base: 33fa8c7b569273db167450edfc8c1856e80b8eda
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
---

# T018 — Pin the fold's exactness behaviourally

## Context

Wave 2's cycle-2 review found the join's own claim — that a folded match is exact equality after
lowercasing, and is never a prefix, a substring or a fuzzy rule — unenforced. Six fold mutants were built: five
survived every behavioural pin (an entry-prefix rule, a substring rule, trimming the entry, trimming the
carried code, trimming both), and the sixth reddened only because the shipped digest happens to carry `NG0100`
as a prefix of `NG01002`. Their only reds were the suite's anchor-uniqueness check, which is structural.

This is the same shape as the text rule that earlier work had to pin: a rule stated in a comment that no
behavioural test holds.

## Approach

- - Add behavioural pins that fail for a prefix rule, a substring rule and any trimming, using inputs where
  the wrong rule gives a different answer than the right one — chosen from the shipped digest rather than
  invented, and stated in the test so a reader sees why the input distinguishes them.
- Pin the other two properties the review found unpinned: two digest codes differing only in case (which
  currently collapse to the first listed, silently), and a fold that goes beyond ASCII.
- Where the honest answer is "this cannot be distinguished at this head", say so in the test's message rather
  than asserting a property the code does not have.
- Arm each new pin with the mutant it exists to refuse, restore, and verify sha256.

## Acceptance criteria

1. A prefix rule, a substring rule, and a trimming rule each redden a behavioural test that names which wrong rule it caught, chosen so the correct rule gives a different answer.
2. Two digest codes differing only in case are handled as the join's contract says, and a test states that behaviour rather than leaving it silent.
3. A non-ASCII fold is either refused or reported, and the test says which, so the pane cannot assert a case difference between characters that are not a case pair.
4. Every new pin is armed by the mutant it exists to refuse, with the failure message quoted.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-join.test.mjs && npm run check && npx prettier --check extension scripts
```

## Log

- Task written at the fourth repair cycle; not started.
- **Built at head `686c6124`, two files touched and nothing else.** `extension/console-join.js`
  `2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c` (10,332 B) →
  `da3ba82ee5a2f7c227c7ffc76314678ccd5677017c2d01c70659e808c592e6a0` (11,486 B);
  `scripts/console-join.test.mjs`
  `de160238b5b7c0725e58fe16c9b200a3f2ea89d0231a904dcdc23e9b4bdd928d` (31,430 B) →
  `b5d48507cfaee06929907e22a3bb66d5031c0efe84b2acf65071518443813b59` (53,087 B). Nothing else was
  written by this task: `research/raw/m045-console-panel.json` and `scripts/console-panel-record.test.mjs`
  also show as modified in the tree, and both are T017's (they landed while this ran); this task opened
  neither, and `scripts/console-join.test.mjs` lost exactly one line — its header comment — and no
  assertion.
- **The suite's shape is unchanged, so a second milestone's record stays true.** The six pins are named
  functions called from the tests whose subject they share, and the six new mutants go into the existing
  `MUTATIONS` loop: **22 test declarations in 9 groups before and after**, which is what
  `research/raw/m057-verdict-claims.json` states and `scripts/console-panel-record.test.mjs:2690-2708`
  holds to the live files. The suite is 36 tests, up from 30 — all six new ones are in the mutants loop
  — and every one passes.
- **Each wrong rule, the input that distinguishes it, and the failure it produces.** Every mutant was
  applied to the shipped `extension/console-join.js` by a runner that writes the pristine bytes back in
  a `finally` block; the module held
  `da3ba82ee5a2f7c227c7ffc76314678ccd5677017c2d01c70659e808c592e6a0` before the first mutant and after
  all seven, re-hashed after each (`restored identically: true`, `every restored sha equals before:
  true`). Applying a mutant to the file also reddens the suite's own anchor-uniqueness and in-memory
  mutation tests, as it did for wave 2's review; the behavioural reds are the ones below.

  | Wrong rule | Mutant, and its armed sha256 | Input that tells it apart | Failure the pin gives |
  | --- | --- | --- | --- |
  | entry is a prefix of the carried code | `foldedSpan(entry.code).startsWith(folded)` — `dff6557f5b5544e4…` | `ng010` (proper prefix of `NG0100`, listed first, and of `NG01002`); `ng050` likewise for `NG0500` | `the fold is equality and never a prefix: ng010 is a proper prefix of NG0100, and the join must not borrow that entry's title` |
  | entry contains the carried code | `foldedSpan(entry.code).includes(folded)` — `b5fc9d31c696e840…` | `010` — inside `NG0100` and `NG01002`, a prefix of neither | `the fold is equality and never a substring: 010 sits inside NG0100, and the join must not borrow that entry's title` |
  | the entry is trimmed | `foldedSpan(entry.code).trim() === folded` — `35627e2f1617c1a5…` | a digest stating its code as `" NG0100 "` (and `"\tNG0100\n"`), message `NG0100` or `ng0100` | `the fold is equality and never a trim: a digest entry whose code is padded with whitespace is not the entry NG0100 names, and trimming the entry must not make it one` |
  | both sides are trimmed | `foldedSpan(entry.code).trim() === folded.trim()` — `66db28ec000bf147…` | the same padded digest | the same message — the entry side is what makes it observable |
  | the last listed spelling wins | the folded loop counted backwards — `ba0653d6a86c1619…` | digest `[{NG0100,'uppercase spelling, listed first'},{ng0100,'lowercase spelling, listed second'}]`, message `Ng0100` | `case-collapse (deliberate): two digest codes differing only in case collapse to the first listed, so the digest spelling reported is NG0100` |
  | a Unicode fold wider than case | `foldedSpan` back to `code.toLowerCase()` — `f9867656e1f38274…` | `NG0\u212A00` (KELVIN SIGN where the `K` sits) against an entry coded `NG0K00` | `the fold is refused beyond ASCII case, never made and then reported as a case difference: U+212A KELVIN SIGN is a different character from the ASCII letter K, so this non-ASCII code must not borrow the NG0K00 entry and a surface must never state a case difference between characters that are not a case pair` |

  Suite counts under the six: 36 tests, **9 fail** (prefix), **10** (substring), **9** (entry trim),
  **9** (both trim), **3** (last listed), **3** (Unicode) — exit 1 each; on the shipped module
  36 pass, 0 fail, exit 0.
- **Prefix and substring inputs are measured, not asserted.** Each pin first measures that its input
  really distinguishes the rules (`NG0100.toLowerCase().startsWith('ng010')`, `010` inside `NG0100` and
  a prefix of nothing, the padded entry folding to a padded code and not onto the carried one), so a
  digest change that removed the difference would redden the measurement rather than let the pin pass
  for the wrong reason.
- **Case-collapse: the behaviour is kept, made explicit in both code and test.** `matchEntry`'s comment
  now says the entry it did not choose is dropped deliberately and without a line, because the answer
  has no field for a difference between two digest entries; the pin
  `pinStatesTheCaseCollapseIsDeliberate` says the same in every assertion message (`case-collapse
  (deliberate): …`), and asserts the tie-break from both sides: the first listed entry wins, reversing
  the list moves the answer, the dropped title appears nowhere in the finding (`/listed second/` is
  refused), and a message that spells either entry exactly still matches it exactly with no
  `carriedCode`. That it is unreachable in the shipped data is measured rather than claimed: the
  provenance test now asserts 64 codes, 64 distinct folded forms, and every code matching
  `/^[A-Z0-9]+$/`.
- **Non-ASCII fold: refused, and the test says refused.** This is a product change, and the only one:
  `foldedSpan` now folds `[A-Z]` and nothing else (`return code.replace(/[A-Z]/g, (letter) =>
  letter.toLowerCase())`), because `toLowerCase()` is not a case comparison — U+212A lowercases to `k`,
  so the fold would join two codes that differ by character identity and let the pane call that a *case*
  difference. The module's header states it, `matchEntry` is unchanged, and the pin asserts both halves:
  an ASCII case pair still folds (`ng0k00` → `code NG0K00, title 'ASCII-K entry', carriedCode
  'ng0k00'`), and `NG0\u212A00` is an absence named by the code the message carried, with no title and
  no `carriedCode`. The input is measured to distinguish refusal from acceptance
  (`'NG0\u212A00'.toLowerCase() === 'ng0k00'`). Refused rather than reported: a reported difference
  would need a finding field the interface contract does not have.
- **Trimming: the entry side refuses, the carried side cannot be distinguished at this head, and the
  test says which is which.** Nothing trims a digest entry, so `" NG0100 "` is not the entry `NG0100`
  names — an absence at this head, a match under `fold-trims-entry` and `fold-trims-both`, both armed
  above. The carried side is already trimmed by `codeOf` (`extension/console-join.js:107`) before the
  fold reads it, so `foldedSpan(code).trim()` is the same string for every input the join can receive:
  `pinCarriedTrimIsIndistinguishable` builds the `fold-trims-carried` mutant and asserts identical
  answers over five probes (both padded spellings, the folded absence, a blank code, the Kelvin code)
  with the message `this cannot be distinguished at this head: codeOf trims the carried code before the
  fold reads it, so trimming it again inside the fold changes no answer for any input the join can
  receive`. Applied to the file, that mutant leaves **20 of 20 behavioural tests passing, exit 0**; its
  only reds in the full run are the suite's mutation machinery, which re-applies another mutant's anchor
  to an already-trimmed line (`TypeError: true.trim is not a function`). The contract's own answer is
  pinned beside it: `'  ng01002  '` → `{text, code: 'NG01002', title: 'Missing Control Value',
  carriedCode: 'ng01002'}` (the padding is not part of the spelling kept), `'  NG0100  '` → an exact
  match with no `carriedCode`, `'   '` → no code.
- No `body`, `cause`, `element`, `remedy`, `component`, `count` key, no re-extraction from text and no
  text fallback was touched; the new pins only read the answer. `extension/console-join.js`'s diff is
  one expression plus comments.
- **Fenced `## Verify`, run exactly, exit 0** (re-run after this Log was appended, so the counts below
  are the final tree's). `node --test scripts/console-join.test.mjs` prints
  `ℹ tests 36 / ℹ suites 9 / ℹ pass 36 / ℹ fail 0 / ℹ cancelled 0 / ℹ skipped 0 / ℹ todo 0`
  (its duration line varies per run and is not quoted) and every one of the fifteen mutants reports
  `✔ … reddens naming "…"`, including
  `fold-entry-prefix reddens naming "prefix"`, `fold-entry-substring reddens naming "substring"`,
  `fold-trims-entry`/`fold-trims-both reddens naming "trim"`, `fold-last-listed reddens naming
  "case-collapse"` and `fold-beyond-ascii reddens naming "non-ASCII"`. `npm run check` then printed
  `skill-lint: 26 SKILL.md files, no findings`; `skills-registered: 18 project skill(s), the loader
  skips none of them`; seven `[OK  ] check-loads:…` and seven `[OK  ] check-tested:…` skill readings and
  five `[OK  ] contract:…` checks; `scripts-in-step: 3 copies in step`;
  `verification gate (structure): pass`; `gate-integrity: pass - 0 finding(s)` for `archive-paths` and
  `gate-integrity: pass - 0 finding(s), … mention(s)` for `fix-record` (its per-mention list is elided
  here: the count grows with this Log, every entry in it is `recorded and not judged`, and nothing in it
  is a finding); `Checking formatting... All matched files use Prettier code style!` from
  `format:check`. `npx prettier --check extension scripts` then printed
  `Checking formatting... / All matched files use Prettier code style!`. No line failed, so nothing is
  quoted from a failure: the only failures in this task were the seven armed mutants' intentional reds,
  quoted by message above.
- Run beyond the fenced command, because the join changed under them: `node --test
  scripts/console-panel-render.test.mjs` → 37 tests, 37 pass, 0 fail; `node --test
  scripts/console-panel-record.test.mjs` → 37 tests, 37 pass, 0 fail.
- No branch was created and nothing was committed.

ready
