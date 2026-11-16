# Review — wave 12, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T019 — Make the pane's own sentences an enumerated registry: pass

Landing commit `1e84c498` (`git show --stat`: five files, +1490/−137 —
`apps/angular-ai-devtools/src/app/panel-console.ts` +231/−, `research/raw/m045-console-panel.json` +67,
`scripts/console-panel-record.test.mjs` +425, `scripts/console-panel-render.test.mjs` +800, and this task's
file).

- ✅ yes — **the registry is one list in the module and the surface renders from it and from nothing else.**
  `apps/angular-ai-devtools/src/app/panel-console.ts:156-217` is `PANE_SENTENCES`, ten entries with the ids
  `state-joined`, `state-captured-nothing`, `state-no-diagnostics`, `no-console-answer`, `no-finding`,
  `no-code`, `no-title`, `unreadable-finding`, `no-digest-entry` (slot `{code}`) and `case-difference`
  (slots `{carriedCode}`, `{digestCode}`); every exported sentence is derived from it
  (`STATE_TEXTS = stateTexts()`, `NO_ANSWER_TEXT = sentenceText('no-console-answer')`, …, `:257-312`), and
  the only sentences left in the module's own body are the five labelled facts of the answer
  (`state:`, `code:`, `title:`, `reason:`, `text:` at `:383`, `:385`, `:399`, `:401`, `:415`). A hole cannot
  reach a line: `sentenceText` throws on an unknown id and on a slot left unfilled (`:240-254`).
- ✅ yes — **a rendered pane-written line outside the registry reddens, and the failure names the line.**
  Armed by writing one literal into the shipped module —
  `lines.push('no-diagnostics: the capture reflects the page\'s silence');` immediately after
  `lines.push(sentence);` — `node --test scripts/console-panel-render.test.mjs` exited **1** at `tests 40,
  pass 34, fail 6`, with
  `renders-from-the-registry: the pane writes the sentence labelled "no-diagnostics" in its own body (…), and every sentence the pane writes for itself is …`
  raised from `pinOnlyTheRegistryWritesSentences` (`scripts/console-panel-render.test.mjs:1614`), and with
  the output pin's own `renders-from-the-registry` message naming the rendered line in the sibling arms. The
  module was restored from the bytes read and hashes back to
  `ec28dfcbfba0d227bed0b7314c1552b301d2c4bc5fcdf090cd376263407ba5c4` (21,901 B) —
  `restored equal: true`, and the same value the Log states.
- ✅ yes — **the four review evasions and the digest-silence regression are settled by the enumeration and the
  test says which mechanism settles them.** Registering an entry that claims the page —
  `text: 'no-diagnostics: the page logged nothing, so nothing was reported'` — reddens both suites with
  `absence-statement: the no-diagnostics surface line 1 (no-diagnostics) says what was read and what it means
  for the panel, and never what the page did — it names the page ("page") outside a denial` (exit 1 at
  `tests 78, pass 55, fail 23` in my armed run, restored to `ec28dfcb…`). AC5's wording is settled as
  *impossible to render*, not as *refused by the rule*, and the pin measures both halves rather than
  asserting the settlement: `pinTheDigestSilenceSentenceIsSettled`
  (`scripts/console-panel-render.test.mjs:1737-1770`) first asserts
  `absenceBreaches(absenceBody(line), absenceRule())` is `[]` for
  `no-diagnostics: the digest states the page's silence` — i.e. the matcher passes it — then shows the
  literal refused by `pinNoRenderedLineIsOutsideTheRegistry` naming the line and the registered form refused
  by `pinTheRegistryIsTheRecords` naming the record's copy. `pinTheReviewEvasionsAreRefused` (`:1663`) does
  the same for each of the four evasions, and `pinThePhraseListMissedNothing` (`:2478`) keeps the two
  controls refused.
- ✅ yes — **the record carries the registry and the two copies are one, read both ways.** I loaded
  `apps/angular-ai-devtools/src/app/panel-console.ts` and `research/raw/m045-console-panel.json` and compared
  id + text + slots + state: `pane entries: 10, record entries: 10`, `sets identical (id+text+slots+state):
  true`, with no pane-only and no record-only id. The record's copy is pinned from both sides —
  `pinTheRegistryIsTheRecords` in the render suite (`:1302-1338`, also asserting each copy carries exactly
  `id`/`slots`/`state`/`text`) and `pinTheSentenceRegistryIsThePanes` in the record suite — so an armed
  re-capture cannot bless a sentence the pane does not write.
- ✅ yes — **the Verify is green at this head.** `node --test scripts/console-panel-render.test.mjs
  scripts/console-panel-record.test.mjs` → `ℹ tests 78`, `ℹ suites 10`, `ℹ pass 78`, `ℹ fail 0`,
  `ℹ cancelled 0`, `ℹ skipped 0`, exit 0 (78 rather than the Log's 76 because T021 and T022 added theirs
  after it); `npm run check:panel` → `tsc -p apps/angular-ai-devtools/tsconfig.check.json` with no
  diagnostic; `npx prettier --check apps/angular-ai-devtools/src/app scripts research/raw` →
  `Checking formatting...` / `All matched files use Prettier code style!`, exit 0. The record's worktree blob
  equals HEAD's, so the default run reads it and writes nothing.
- Note — the registry now owns one clause that T019 did not write: `state-captured-nothing`'s opening, "a
  capture was read and carried no diagnostic". `git show 1e84c498 -- …/panel-console.ts` moves that sentence
  into the registry verbatim (`-    'captured-nothing: a capture was read …'` /
  `+    text: 'captured-nothing: a capture was read …'`), it restates the join's own contract for the state
  rather than inventing a fact, and the same sentence carries the caveat that a failed capture also emits
  nothing. Recorded here because the registry is now the only place the wording lives, not as a defect this
  task introduced.

## Intent coverage

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: pass

- ✅ yes — for every sentence the pane writes. All ten registry entries and the five labelled facts are read
  by the E7 rules, and none of the ten names a cause, an element, a remedy or the framework: the state
  sentences state what the capture held or that none was handed over, the six absences name the missing
  field, and `case-difference` states two spellings of one code. The surface renders no line the answer did
  not carry and no sentence outside the registry on any branch a reachable answer takes — measured, not read
  off the comment: a literal beside the registry reddens naming the line, a registered sentence claiming the
  page reddens under the absence rule over the registry's own text, and a digest-silence sentence can be
  neither rendered nor registered without a deliberate edit to two files that both suites refuse until the
  record carries it. The exemption is the answer's own words (`code`, `title`, `text`, `reason`,
  `carriedCode`), which is what lets the digest's `NG0910` title say "element" while the pane may not — and
  the wave-10 record above measures the one place where a pane sentence can still outrun its input (the
  case-difference clause "and title"), which is T015's sentence and not one T019 authorises.
