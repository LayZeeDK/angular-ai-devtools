---
id: T015
title: Report a case-folded match as the digest carries it
wave: 10
deps:
  - T002
  - T014
status: done
agent: build_T015
base: b7e3a739428eb0f66d2d31a8d27ea5e31cbe595d
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-panel.json
  - research/raw/m045-console-shapes.json
---

# T015 — Report a case-folded match as the digest carries it

## Context

Wave 4's cycle-3 review found the milestone's held-out criterion E6 unmet by any task: the join compares
codes exactly (`entry.code === code` in `extension/console-join.js`), so a diagnostic carrying `ng01002` is
reported as `code: 'ng01002'` with `reason: 'no-digest-entry'`, and neither the join nor the surface names the
case difference. E6 says a diagnostic whose code matches a digest entry only after case folding is reported as
the digest carries it, and the row names the case difference.

Nothing in the milestone owns this. It is a gap in what shipped, not a defect in a repair, and the honest
response is to implement it rather than to rule it out because no task claimed it.

## Approach

- - Fold case for the match only: the digest entry is found by comparing case-insensitively, and the finding
  carries the digest's own `code` and `title`, not the message's spelling.
- Keep the raw spelling available so the surface can name the difference, and render a sentence that states
  the message carried one spelling and the digest carries another — without a cause, an element or a remedy.
- Do not let folding invent a match: a code that folds to nothing in the digest is still
  `no-digest-entry`, named by the code the message carried.
- Record the shapes this changes, and pin the behaviour with tests that redden if the fold is removed.

## Acceptance criteria

1. A diagnostic carrying a code that differs from a digest code only in case is reported with the digest's code and title, and the finding names the case difference.
2. The surface renders that sentence, and renders no cause, element or remedy with it.
3. A code that folds to nothing in the digest is still reported as an absence named by the code the message carried.
4. Removing the fold reddens a test that names E6; removing the case-difference wording reddens a second.
5. The records that describe the join's matching are re-captured, and an unarmed run reads them byte-identically.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC2

## Verify

```bash
node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check extension scripts research/raw
```

## Log

- Task written at the third repair cycle; not started.
- T015 implemented at head b7e3a739428eb0f66d2d31a8d27ea5e31cbe595d, in place, no branch and no
  commit. Wave 4's cycle-3 review measured E6 failing on `ng01002` against the digest's `NG01002`
  ("Missing Control Value"); both halves are now built and both redden under a mutant.

  **The fold, for the match only.** `extension/console-join.js` finds the entry in two passes inside
  `matchEntry`: the exact spelling first, then — only where no entry carried it — a second pass on the
  folded form (`foldedSpan`, which is `toLowerCase()`). `foldedMatch(entry, code)` decides the row: the
  two spellings must differ **and** fold together, so an entry reached any other way can never be
  reported as a folded match. The finding then carries the digest's own `code` and `title`, and
  `carriedCode` holds the spelling the message used — present only where the two differ, so an exact
  match carries no second spelling. `reason` stays reserved for an absence, and a code that folds to
  nothing in the digest is still `no-digest-entry`, named by the code the message carried. Measured
  answers, both recorded as data in `research/raw/m045-console-shapes.json` (commands c17 and c18, run
  at this head):

  ```
  ng01002 -> {"state":"joined","findings":[{"text":"ng01002: Missing control value for the input","code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}]}
  ng04002 -> {"state":"joined","findings":[{"text":"ng04002: Cannot match any routes.","code":"ng04002","reason":"no-digest-entry"}]}
  ```

  **The sentence the pane renders for a case difference** (`panel-console.ts`,
  `caseFoldedMatchText`, labelled `case-difference`, rendered after the code and title lines):

  ```
  case-difference: the message carried ng01002 and the digest carries NG01002, so this finding carries the digest's own spelling and title
  ```

  The whole row, as the suite prints it:
  `["state: joined","joined: the capture held at least one diagnostic, …","code: NG01002","title: Missing Control Value","case-difference: the message carried ng01002 and the digest carries NG01002, so this finding carries the digest's own spelling and title","text: ng01002: Missing control value for the input"]`.
  It is pane prose, so it is held to the rules the suites already state and none was relaxed: it carries
  no cause, element or remedy and no word of the pane's own naming Angular (`pinNoCauseElementRemedy`,
  `pinNoUnattributedAngularWording`), it is a labelled fact (`^[a-z][a-z-]*: `), and
  `assertAbsenceStatement` in both suites passes it — its clauses take `the message`, `the digest` and
  `this finding` as subjects, and states `carried`, `carries` and `carries` as their verbs. It was added
  to `pinNoModuleSentenceClaimsSilence` and `pinShippedAbsenceSentencesPass` so the absence rule reads it
  at the source as well as on the rendered surface, and the folded surface is run through
  `pinRendersTheAnswerAndNothingElse`, `pinNoCauseElementRemedy`, `pinNoUnattributedAngularWording` and
  `pinNoAbsenceClaimsSilence` beside the exact line list.

  **No existing pin was weakened.** `console-join.test.mjs` keeps its 22 test declarations and 9 groups
  and `console-panel-render.test.mjs` its 17 and 3 — the counts `research/raw/m057-verdict-claims.json`
  records, so no file outside this task's six was needed (T014 added 654 lines the same way: pins are
  functions, mutants extend the array, and the new pins are called from existing test bodies). The two
  tests whose names gained E6 are renamed, not removed: `AC1/E6: a message carrying a digest code is
  joined by that code, in the case it spells it` and `AC1/E6: the state and every finding, field for
  field, and nothing else`. `pinNamesTheAbsenceByCode`, `pinNamesTheMissingCode`,
  `pinNeverChoosesByMessageText`, `pinNeverReExtractsACode`, `pinKeepsBothFindings`,
  `pinCapturedNothingStatesIt`, `pinCaseDifferenceIsNamed`'s siblings and every mutant they already
  carried still redden as before. The one list that changed is
  `console-join.test.mjs`'s allowed finding keys, extended by `carriedCode` — the join's own new field —
  and that test now feeds a folded diagnostic as a fourth case, so the allowance is exercised rather
  than idle. The render suite's `ownSentences` gains the difference sentence for a finding that carries
  `carriedCode`, which extends what may be rendered, not what may not.

  **Mutant A — the fold removed** (`foldedSpan(entry.code) === folded` becomes `entry.code === folded`,
  the comparison the module shipped before this task). Armed against `extension/console-join.js`
  (`sha256 2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c`, 10,332 B) the file hashed
  `670915a41b0b01d7f31d34107e0ad786c2afd9839f389eb0f32153c1c2c9ec27` and the suite read
  `ℹ tests 30 / ℹ pass 25 / ℹ fail 5`, with:

  ```
  ✖ agrees with T001 on the digest, on the missing code and on the folded code
    AssertionError [ERR_ASSERTION]: the record’s folded-code command must be the answer the join gives at this head
  ✖ AC1/E6: a message carrying a digest code is joined by that code, in the case it spells it
    ✖ yields one finding naming the shipped digest title
    AssertionError [ERR_ASSERTION]: case-folded-match (E6): a code that matches a digest entry only after folding case must be reported as the digest carries it — NG01002, not ng01002
    ✖ case-fold-removed reddens naming "E6"
    AssertionError [ERR_ASSERTION]: case-folded-match (E6): a code that matches a digest entry only after folding case must be reported as the digest carries it — NG01002, not ng01002
  ```

  The first of those is the record read back: with the fold gone, the answer c17 records is no longer the
  answer the join gives, so the shapes record reddens as a stale measurement rather than drifting.
  Restored from the byte-copy:
  `sha256 2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c` (10,332 B) — the value
  before arming — and the suite read `ℹ tests 30 / ℹ pass 30 / ℹ fail 0`.

  **Mutant B — the case-difference wording removed** (`caseFoldedMatchText` returns
  `case-difference: the finding carries the digest's own code and title`, keeping the line and the
  label and dropping both spellings). Armed against `apps/angular-ai-devtools/src/app/panel-console.ts`
  (`sha256 cd3dcc99ae49903715b17d44ee0f742fc11baa124d3f88a8f390779be5ca2dc4`, 16,976 B) the file hashed
  `2f3c77946dd26a2ee08664a3b63be9a248e269b090ca5f6c637f607246ff093e` and the suite read
  `ℹ tests 37 / ℹ pass 34 / ℹ fail 3`, with:

  ```
  ✖ AC1/E6: the state and every finding, field for field, and nothing else
    AssertionError [ERR_ASSERTION]: case-difference: the sentence must name the spelling the message carried (ng01002), or the difference it states is not the one the row shows; it rendered "case-difference: the finding carries the digest's own code and title"
    ✖ case-difference-dropped reddens naming "case-difference"
    AssertionError [ERR_ASSERTION]: case-difference: the sentence must name the spelling the message carried (ng01002), or the difference it states is not the one the row shows; it rendered "case-difference: the finding carries the digest's own code and title"
  ```

  Restored: `sha256 cd3dcc99ae49903715b17d44ee0f742fc11baa124d3f88a8f390779be5ca2dc4` (16,976 B) — the
  value before arming — and `ℹ tests 37 / ℹ pass 37 / ℹ fail 0`. A third mutant, `fold-invents-a-match`
  (the folded comparison replaced by `true`, so any code matches the first entry), reddens
  `pinFoldingInventsNoMatch` inside the suite's own in-memory mutation loop.

  **The records.** The fold's measurement was recaptured into
  `research/raw/m045-console-shapes.json`: commands c17 and c18 with their output verbatim, a
  `caseFoldedMatch` block naming the digest entry and the two answers, and a correction to the
  `notCaptured` item about lowercase codes — its consequence said "case folding can never rescue it at
  join time", which this task makes false, and it now states what the capture cannot produce and what
  the join does with it. `joinContract` is left exactly as T001's quote, with a note that the finding
  now also carries `carriedCode`. The record hashes to
  `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091` (39,284 B; it was
  `50ef235116bf6624fbbdc1f4e3c99ffde156e8634c850ec07a8c50263308e82b`, 35,619 B) and is byte-identical
  after every run below. The join suite reads the two recorded outputs back and compares them with what
  the join answers at this head, so the record is a reading: a stale one reddens rather than drifts.

  `research/raw/m045-console-panel.json` re-captures to
  `6db9417934a7ffffbf2c2ce41f672013e4b25fcc6c7ad298d7e6cd71ad30d11f` (15,495 B) before an armed run,
  after armed run 1, after armed run 2 and after an unarmed run — the same bytes it carried at this
  head — because its cases are that suite's own constants (`scripts/console-panel-record.test.mjs`, not
  a file this task declares) and none of them is a case-folded diagnostic, so the armed re-capture is
  provably a no-op: `set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs` read
  `ℹ tests 34 / ℹ pass 33 / ℹ fail 0 / ℹ skipped 1` (the skipped test is the default-run read), twice,
  without writing a byte, and the unarmed run read `ℹ tests 34 / ℹ pass 34 / ℹ fail 0`. That is the one
  limit of this Log: the panel record's case list cannot gain a folded case from here, so the fold is
  recorded in the shapes record and pinned by the join and render suites instead.

- The fenced `## Verify` command, run exactly as written at this head with this Log in place, exit 0.
  The command:

  ```bash
  node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs && npm run check && npx prettier --check extension scripts research/raw
  ```

  Its output, verbatim where it reports. The run below is the one repeated after this Log's last line
  was written, so the claim count in the gate line is the count this Log produces — a reading taken
  while the Log was shorter read 118, the same command reading clean:

  ```
  ℹ tests 74
  ℹ suites 12
  ℹ pass 74
  ℹ fail 0
  ℹ skipped 0
  verification gate (structure): pass
  gate-integrity: archive-paths clean - examined 17 live path reference(s) of 184 reference(s) in 146 suite(s), across 6 relocated subtree(s)
  gate-integrity: fix-record clean - examined 130 claim(s) in 15 task log(s) of .project/tasks (logs of M057) against 73 changed path(s) of b8d3341cf8a00e01af0d9cbba3a7cd1e0d226b55..b7e3a739428eb0f66d2d31a8d27ea5e31cbe595d (rule ship: M056's ship commit, b8d3341c (ship: M056 — gate-phase-stability); the head is this tree's HEAD, b7e3a739 (T014: Stop the prohibitions from being a phrase list); claims: declared)
  gate-integrity: fix-record pins - 1 declared path(s) byte-identical across b8d3341cf8a00e01af0d9cbba3a7cd1e0d226b55..b7e3a739428eb0f66d2d31a8d27ea5e31cbe595d, recorded and not judged as changes
  All matched files use Prettier code style!
  All matched files use Prettier code style!
  ```

  The two prettier lines are `npm run check`'s own `format:check` (`prettier --check .`) and the fenced
  command's `prettier --check extension scripts research/raw`; both read clean, as do the TypeScript
  checks `check:panel` and `check:extension`, which compile the two sources this task changed.

- Files touched: exactly the six this task declares — `extension/console-join.js`,
  `scripts/console-join.test.mjs`, `apps/angular-ai-devtools/src/app/panel-console.ts`,
  `scripts/console-panel-render.test.mjs`, `research/raw/m045-console-panel.json` (re-captured, unchanged)
  and `research/raw/m045-console-shapes.json` — plus this task file's own Log. Final `sha256`:
  `extension/console-join.js` `2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c` (10,332 B);
  `scripts/console-join.test.mjs` `de160238b5b7c0725e58fe16c9b200a3f2ea89d0231a904dcdc23e9b4bdd928d`
  (31,430 B); `apps/angular-ai-devtools/src/app/panel-console.ts`
  `cd3dcc99ae49903715b17d44ee0f742fc11baa124d3f88a8f390779be5ca2dc4` (16,976 B);
  `scripts/console-panel-render.test.mjs` `91e66824513cd86f11e0be507c11084bbfd2469275b42541cd0f269f75783246`
  (86,400 B); `research/raw/m045-console-panel.json`
  `6db9417934a7ffffbf2c2ce41f672013e4b25fcc6c7ad298d7e6cd71ad30d11f` (15,495 B);
  `research/raw/m045-console-shapes.json`
  `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091` (39,284 B). No branch was created and
  nothing was committed; `git status --porcelain` lists these six files and the pre-existing untracked
  `.project/review/VERIFICATION.json`, which this task did not write.

ready
