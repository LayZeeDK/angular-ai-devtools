# Review — wave 10, cycle 1

Cycle: 1
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T015 — Report a case-folded match as the digest carries it: fail

Landing commit `85208150` (`git show --stat`: six files, +715/−28 — the task file, `panel-console.ts`,
`console-join.js`, `m045-console-shapes.json`, `console-join.test.mjs`, `console-panel-render.test.mjs`;
`research/raw/m045-console-panel.json` is declared and does not appear, because it did not move).

- ✅ yes — **the fold is in the product and answers E6's case, measured through the module.** I evaluated
  `extension/console-join.js` against the shipped digest rather than reading the diff alone:
  `consoleJoin([{code:'ng01002',message:'ng01002: Missing control value for the input'}], digest)` answered
  `{"state":"joined","findings":[{"text":"ng01002: Missing control value for the input","code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}]}`
  — the digest's own `code` and `title`, the message's spelling beside them. The absence half is the same
  call with `ng04002`: `{"text":"ng04002: Cannot match any routes.","code":"ng04002","reason":"no-digest-entry"}`,
  named by the code the message carried. Both are commands `c17`/`c18` of the record, and
  `node -e "…r.provenance.commands.find(x=>x.id===id)…"` prints those two strings verbatim from
  `research/raw/m045-console-shapes.json`. The match is the only place case is folded
  (`extension/console-join.js:152-181`), and `foldedMatch` requires the two spellings to differ *and* fold
  together, so an exact match carries no `carriedCode`.
- ✅ yes — **the records this task declares are the ones it says.** `85208150`'s
  `research/raw/m045-console-shapes.json` hashes to
  `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091` at 39,284 B (sha256 over
  `git show 85208150:…`), and its `caseFoldedMatch` block carries `from`, `matched`, `unmatched`, `rules`
  and `supersedesNote`. `research/raw/m045-console-panel.json` is
  `6db9417934a7ffffbf2c2ce41f672013e4b25fcc6c7ad298d7e6cd71ad30d11f` at 15,495 B at `b7e3a739`,
  at `85208150` and at `315a6095` — byte-identical across the landing, which is the pin the gate records
  (`fix-record pins - 1 declared path(s) byte-identical … declared and not judged as a change`).
- ✅ yes — **the verify is green at this head.** `node --test scripts/console-join.test.mjs
  scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs` → `ℹ tests 86`,
  `ℹ suites 12`, `ℹ pass 86`, `ℹ fail 0`, `ℹ cancelled 0`, `ℹ skipped 0`, exit 0; `npm run check` → exit 0
  with `verification gate (structure): pass`, `gate-integrity: pass - 0 finding(s)` twice and
  `All matched files use Prettier code style!`; `npx prettier --check extension scripts research/raw` →
  `Checking formatting... / All matched files use Prettier code style!`, exit 0. The ledger records this
  task's own command as `pass` at `21d59c13`.
- ❌ no — **the pane's case-difference sentence states a title the row does not carry.** The sentence is
  `case-difference: the message carried ng01002 and the digest carries NG01002, so this finding carries the
  digest's own spelling and title` (`apps/angular-ai-devtools/src/app/panel-console.ts:213`, rendered at
  `:393-394` guarded only by `carriedCode !== code`). The join itself produces a folded finding with **no**
  title — `extension/console-join.js:224-232`, the `if (entry)` branch with `folded` true, answered
  `{"state":"joined","findings":[{"text":"ng01002: Missing control value for the input","code":"NG01002","carriedCode":"ng01002"}]}`
  for `digest = {entries:[{code:'NG01002'}]}` — and the pane renders both sentences for it, one above the
  other, contradicting each other:
  `no-title: the digest carries the code this message carried and states no title for it, so no title is rendered`
  then `case-difference: the message carried ng01002 and the digest carries NG01002, so this finding
  carries the digest's own spelling and title`. The second asserts "the digest's own … title" on a row that
  carries none, which is a surface stating more than its input carries. Reproduced with:
  `node -e "…consolePanel({state:'joined',findings:[{text:'ng01002: Missing control value for the input',code:'NG01002',carriedCode:'ng01002'}]})"`
  → the five lines above. It is unreachable from the *shipped* digest alone (all 64 entries carry a string
  title: `entries: 64, without a string title: 0`), but `consoleJoin(diagnostics, digest)` and
  `consolePanel(answer)` are the declared interface and both accept it, and **no pin sees it**: the render
  suite's folded probe is titled (`a code the digest matched only by folding case`) and its titleless probe
  is unfolded (`a finding the digest carries no title for`), the record's `case-folded-match` case carries
  `title: Missing Control Value`, and the whole tree is green on it — 86/86, 78/78, `npm run check` exit 0.
  The same guard admits a second over-claim: an answer whose `carriedCode` does not fold to its `code`
  (`{code:'NG0100', title:'x', carriedCode:'NG04002'}`) renders
  `case-difference: the message carried NG04002 and the digest carries NG0100, so this finding carries the
  digest's own spelling and title`, a *case* difference between two codes that are not two spellings of one
  name — the very claim `extension/console-join.js:30-35` says the fold is narrow enough to prevent.
- Note — the sentence's two spellings *are* supported: `carriedCode` and `code` are the finding's own
  fields, and the AC1 half ("names the case difference") holds; what fails is the "and title" clause. The
  `caseFoldedMatchText` builder was later folded into `PANE_SENTENCES` by T019 without changing its text,
  so the defect survives the registry rewrite.

## Intent coverage

### SC2 — A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture.: pass

- ✅ yes — the criterion's two halves are both measured. A diagnostic whose code the digest carries is
  reported with that entry's title: `consoleJoin([{code:'ng01002',…}], digest)` →
  `"code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"`, where `Missing Control Value`
  is read out of `extension/error-digest.json` and not invented. The join is proven against the shipped
  digest rather than a fixture: `scripts/console-join.test.mjs` loads `extension/error-digest.json` (its
  provenance group's `agrees with T001 on the digest, on the missing code and on the folded code` reads the
  shipped file and the recorded answers back), and the 39/39 pass at this head includes it. The failure
  recorded above is in the pane's *sentence* for the titleless degenerate case, not in what the join reports
  for a code the digest carries, so SC2's own claim stands.
