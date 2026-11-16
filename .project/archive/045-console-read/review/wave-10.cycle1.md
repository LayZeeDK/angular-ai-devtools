# Review — wave 10, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: be00283afe1578b5eeb7e9053538e0f90f4094f1

This file replaces `wave-10.cycle1.md`, which failed this wave and is deleted with this write. The
defect that file opened was one sentence: the pane's `case-difference` wording claimed "the digest's own
spelling and title" on a folded row whose digest entry carries no title. T025 (`58690aa4`, five files,
+417/−52) adds a titleless wording and reads the choice off the row; the titled wording is untouched.

## T015 — Report a case-folded match as the digest carries it: pass

- ✅ **The titled folded row still states the title, and its sentence is byte-identical to the one cycle 1
  accepted.** `node -e "…import('file:///D:/projects/sandbox/angular-ai-devtools/apps/angular-ai-devtools/src/app/panel-console.ts').then(m=>{…consolePanel({state:'joined',findings:[{text:'ng01002: Missing control value for the input',code:'NG01002',title:'Missing Control Value',carriedCode:'ng01002'}]})…})"`
  prints five lines:
  ```
  state: joined
  joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture's own order
  code: NG01002
  title: Missing Control Value
  case-difference: the message carried ng01002 and the digest carries NG01002, so this finding carries the digest's own spelling and title
  text: ng01002: Missing control value for the input
  ```
  The sentence is the registry entry at `apps/angular-ai-devtools/src/app/panel-console.ts:233`, and
  `git show 677ac49d:apps/angular-ai-devtools/src/app/panel-console.ts | findstr "case-difference: the
  message carried"` prints the same line —
  `text: "case-difference: the message carried {carriedCode} and the digest carries {digestCode}, so this
  finding carries the digest's own spelling and title"` — so the repair added a wording instead of editing
  the one the titled row renders, and `Missing Control Value` is the shipped digest's own title
  (`extension/error-digest.json`, `NG01002`), not a string this pane invents.
- ✅ **The titleless folded row now claims no title, and the two sentences on that surface agree.** The
  same call with the `title` field dropped prints:
  ```
  state: joined
  joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture's own order
  code: NG01002
  no-title: the digest carries the code this message carried and states no title for it, so no title is rendered
  case-difference-no-title: the message carried ng01002 and the digest carries NG01002, so this finding carries the digest's own spelling and no title is stated for it
  text: ng01002: Missing control value for the input
  ```
  There is no `title:` line and no sentence claiming one: where cycle 1's reproduction printed
  `no-title: …` directly above `case-difference: … title` and the two contradicted each other, both lines
  here say the same thing. The claim is now read off the row rather than assumed —
  `panel-console.ts:441-446` — `if (code !== null && carriedCode !== null && carriedCode !== code)
  lines.push(title === null ? caseFoldedMatchWithoutTitleText(carriedCode, code) : caseFoldedMatchText(carriedCode, code))`
  — and the second wording is its own registry entry, `id: 'case-difference-no-title'` at `:238`, with
  `CASE_DIFFERENCE_NO_TITLE` exported for the suites and the module's contract comment updated to state
  that the title claim holds only where the row carries one.
- ✅ **The new shape is pinned, and the pin reddens on the claim rather than on the branch.**
  `scripts/console-panel-render.test.mjs:3320` adds the mutant `title-claimed-without-a-title`, whose
  anchor is the conditional above and whose replacement is the old, defective line
  `lines.push(caseFoldedMatchText(carriedCode, code));`; the arm builds `titlelessFoldedAnswer()`, asserts
  the mutant really prints a line matching `/\bown spelling and title\b/`, and runs
  `pinFoldedRowWithoutTitleStatesNoTitle` (`:581`, used at `:2299`) against it. The run reports
  `✔ title-claimed-without-a-title reddens naming "states-no-title" (1.8659ms)` and the mutant's own
  diagnostic quotes the defect it reproduces:
  `states-no-title: a folded row the digest carries no title for must claim no title, and the pane claimed
  one on ["case-difference: the message carried ng01002 and the digest carries NG01002, so this finding
  carries the digest's own spelling and title"]`. Both registries carry the new entry, so a future wording
  cannot slip in beside it: the pane's label list grows to 16 (…`case-difference`, `case-difference-no-title`…)
  and `pane sentence registry (11)` lists `case-difference-no-title` beside `case-difference`, with the
  record's `contract.sentenceRegistry` held to it in both directions.
- ✅ **The join half of the task is unchanged, and its two measured answers still hold at this head.** The
  repair touches no line of `extension/console-join.js`, whose blob is `b54f8dec3af99b1beba8b59326d5aa67d1db49ba`
  (14,235 bytes) in the worktree and at `HEAD` alike. Evaluated against the shipped digest,
  `consoleJoin([{code:'ng01002',message:'ng01002: Missing control value for the input'}], digest)` answers
  `{"state":"joined","findings":[{"text":"ng01002: Missing control value for the input","code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}]}`
  and the absence half for `ng04002` answers
  `{"state":"joined","findings":[{"text":"ng04002: Cannot match any routes.","code":"ng04002","reason":"no-digest-entry"}]}`
  — the digest's code and title for the fold, the message's own code named for the absence, which are
  T015's AC1 and AC3 as originally measured.
- ✅ **The verify is green at this head.** T015's first stage,
  `node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs`,
  prints `ℹ tests 87` / `ℹ suites 12` / `ℹ pass 87` / `ℹ fail 0`, exit 0; the two suites the repair edited
  alone print `ℹ tests 38` / `ℹ pass 38` / `ℹ fail 0` (record) and `ℹ tests 41` / `ℹ pass 41` / `ℹ fail 0`
  (render). `npm run check` exits 0 — `verification gate (structure): pass`,
  `gate-integrity: pass - 0 finding(s), 146 mention(s)`, `All matched files use Prettier code style!` — and
  `npx prettier --check extension scripts research/raw` prints `All matched files use Prettier code style!`.
- Note — the record's recorded cases still render only the titled fold: the render run's own diagnostic says
  `the record renders 10 of 16 labels; no recorded case renders: case-difference-no-title, …`, so the new
  wording is pinned by the render suite's derived shape and carried as text in the record's
  `contract.sentenceRegistry`, but no *measured* case in `research/raw/m045-console-panel.json` renders it.
  That is the shape of the record (it holds measured cases), and it is why the pin matters: the sentence is
  held by a suite rather than by a recorded observation.
- Note — one over-claim cycle 1 reported beside the title one is unchanged and is not what T025 was scoped
  to fix: an answer whose `carriedCode` does not fold to its `code` still renders the *case* sentence.
  `consolePanel({state:'joined',findings:[{text:'x',code:'NG0100',title:'x',carriedCode:'NG04002'}]})`
  prints `case-difference: the message carried NG04002 and the digest carries NG0100, so this finding
  carries the digest's own spelling and title`. The join cannot produce that answer — it sets
  `carriedCode` only where the fold matched, and then the two spellings lowercase to one name — and the
  finding shape the interface contract declares is `{ text, code?, title?, reason? }`, so this is a
  hand-built answer outside both. It is recorded here so the next reader does not have to rediscover it;
  it is not the sentence this wave's defect was about, and no pin sees either shape from a join answer.

## Intent coverage

The wave's task declares `- SC2`, so the block below quotes that criterion and the `review-check` grammar
requires exactly one `### SC2` heading here. The other four criteria the milestone owns are not this
wave's to satisfy — the evidence for them sits in waves 1–9 and 11–17 — and their state at this head is
recorded above as non-regression: the join suite, the record suite and the render suite all pass 87, 38
and 41 of their own tests, and the two files this repair changed are `panel-console.ts` and the two
suites that pin it.

### SC2 — A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture.: pass

- ✅ yes — **the criterion's first half is measured through the join, on the shipped digest.** A
  diagnostic carrying `ng01002` is reported as `"code":"NG01002","title":"Missing Control Value"` where
  `Missing Control Value` is read out of `extension/error-digest.json` (`{"code":"NG01002","title":"Missing
  Control Value"}`, 64 entries, `without a string title: 0`), and the pane renders that title on the titled
  row shown above — the sentence that names the fold now claims the title only on the row that carries one.
- ✅ yes — **the criterion's second half is the suite that loads the shipped digest.** T015's verify stage
  `node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs`
  prints `ℹ pass 87` / `ℹ fail 0`, and `scripts/console-join.test.mjs` is the suite that reads
  `extension/error-digest.json` rather than a fixture: the two answers quoted above were produced by
  evaluating the module against that file in this checkout, not against a hand-written digest. The defect
  this cycle closes was in the pane's wording for a titleless entry, and the wording now states exactly
  what the digest carries.
