# Review — wave 5, cycle 4

Cycle: 4
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 85208150f3cbff73dbcd77eb9ad18a4bb2552628

## T004 — Record the surface and run the project verify: fail

- ✅ **The cycle-3 defect is closed, through the real pin and an armed re-capture.** The pane's own
  `joined` sentence changed to `…, and to fix this, edit the binding` (`panel-console.ts` `cd3dcc99…`
  16976 B → `aea40ad0…` 17011 B), one armed run then one unarmed one. The armed run **writes and
  reddens**: `research/raw/m045-console-panel.json` `6db94179…` (15495 B) → `5d6fe249…` (15705 B), 28
  pass / 5 fail, and the failure names the state, the line and the word verbatim:
  `recorded-vocabulary: joined surface line 1 is policed as the pane's own "joined" line and carries "fix", and the contract states that the pane renders no "fix"; it records "joined: … and to fix this, edit the binding" (matched the word "fix" as a whole word)`.
  A second armed run wrote no byte (`5d6fe249…` unchanged). The unarmed run over those blessed bytes is
  26 pass / 8 fail with the same message, and `scripts/console-panel-render.test.mjs` is 22 pass / 15
  fail on the same tree (`no-cause-element-remedy: … (matched /\bfix\b/i)` and
  `absence-statement: … its clause "to fix this" takes "to" as its subject`). Cycle 3 read **27/27 and
  32/32 green** on this probe. `fix` is on the list at `record:48` / `scripts/console-panel-record.test.mjs:163`,
  matched whole, and the docblock's rationale for it (`:143-152`) is the claim the loss made false.
- ✅ **Every word T012 added or restored catches a bad sentence, and none is redundant with its
  siblings.** One bad sentence per word written into the recording's `no-diagnostics` pane line, one
  unarmed run each (32 pass / 2 fail every time, the record byte-identical afterwards): `fix` —
  `and to fix this, edit the binding`; `since` — `and the page was silent since nothing was captured`;
  `dom` — `and the DOM was not updated`; `node` — `and the node was not found`; `solution` — `and the
  solution is to edit the binding`; `repair` — `and to repair this, edit the binding`; `framework` —
  `and the framework reported nothing`; `number` — `and the number of findings is one`. Each reddens
  with `… is policed as the pane's own "no-diagnostics" line and carries "<word>" … (matched the word
  "<word>" as a whole word)`, and **no other entry of the sixteen matches any of those lines** (checked
  against the record's own list with the suite's own pattern builder). A second phrasing per word, in a
  clause the absence property lets through, is caught by the word alone and by nothing else:
  `so the finding carries no fix`, `so no finding is rendered since none was read`, `so the message
  carries no node`, `so the finding carries no solution`, `so the finding carries no repair`,
  `so the state carries no number` — all pass `absenceBreaches` and all redden on the list. The honest
  qualification: `dom` and `framework` are already `pageWords` in `contract.absenceStatement`, so the
  property refuses them anywhere in a clause that is not a denial; their marginal work is the
  denial-led and read-clause positions. They are not duplicated *within* the list, and nothing was
  added without a sentence that needs it — `fix`, `since`, `solution`, `repair`, `number` and `node`
  are load-bearing in ordinary clauses.
- ✅ **The silence property is enforced from the record side, not only in the render suite.** The rule
  and its vocabulary live in `research/raw/m045-console-panel.json`'s `contract.absenceStatement`
  (`:56-237`) as one statement; the record suite applies it to the **recording's own bytes**
  (`pinRecordedAbsenceStatement`, `console-panel-record.test.mjs:1080-1109`, called per case at
  `:1652`), and the render suite reads the same rule from the record (`absenceRule()`,
  `console-panel-render.test.mjs:914-935`), with the matcher block pinned byte-identical in both
  directions. Probed both ways. Writing `no-diagnostics: the page emitted no diagnostic at all, so no
  capture was handed to the join` into the recording — a claim carrying **no prohibited word**, so only
  the property can catch it — the unarmed record suite reddens 32 / 2 with
  `absence-statement: the no-diagnostics surface line 1 (no-diagnostics) says what was read and what it
  means for the panel, and never what the page did — it names the page ("page") outside a denial`, from
  `pinRecordedAbsenceStatement` on the file's bytes (record `6db94179…` → `e060dcf2…` → restored; that
  sha is the same one T014's Log records for the same sentence, which is a nice independent
  corroboration). Weakening the rule in the record (dropping `page` from `pageWords`) reddens **both**
  suites — the record suite three tests (`the record and this suite must state the same absence rule, or
  the pin proves a rule nobody states`) and the render suite one, on its own positive denial — so the
  rule cannot be softened from either side.
- ❌ **The record's label list no longer describes the surface: the pane writes a `case-difference:`
  sentence (`85208150`, T015) that the record's `contract.lineLabels` does not carry, and no recorded
  case carries it either.** `contract.lineLabels` (`record:22-37`) and `LINE_LABELS`
  (`console-panel-record.test.mjs:126-141`) list fourteen labels; the shipped pane can put fifteen on a
  line. Rendering the shipped module over a folded diagnostic gives
  `case-difference: the message carried ng01002 and the digest carries NG01002, so this finding carries
  the digest's own spelling and title` (`panel-console.ts:152-169`, `:260-261`), and `case-difference`
  is the one label the module emits that the record does not state — the whole string
  `case-difference` occurs **nowhere** in `research/raw/m045-console-panel.json`. The list is meant as
  the pane's vocabulary and not as the recorded subset: it already carries five labels no recorded case
  renders (`no-title`, `no-finding`, `no-console-answer`, `unreadable-finding`, `reason`), so it is a
  statement about the surface. Inserting that sentence into the
  `digest-title-and-captured-wording` case and running unarmed proves what it costs:
  `recorded-vocabulary: digest-title-and-captured-wording surface line 4 is labelled "case-difference",
  which the record's contract does not carry` — the record's own pin refuses a line the shipped pane
  legitimately writes, so a folded case can never be recorded without a contract edit, and the sentence
  is recorded in no artefact of this record at all (the render suite pins it; the shapes record carries
  the folded *answer* and not the sentence). Nothing holds `contract.lineLabels` to the labels the
  module can emit — every other contract field describes the join and is pinned to it
  (`contract.states` deepEqual `STATES`, `finding` to `FINDING_FIELDS`), and the one field that
  describes the surface is a constant with no pin, which is how it drifted. The repair is inside this
  task's own declared files: add `case-difference` to `LINE_LABELS` and re-arm, and pin the label set
  against the module's own sentences (`STATE_TEXTS`, `NO_ANSWER_TEXT`, `NO_FINDING_TEXT`, `NO_CODE_TEXT`,
  `NO_TITLE_TEXT`, `UNREADABLE_FINDING_TEXT`, `noDigestEntryText`, `caseFoldedMatchText`, plus `state`,
  and the finding fields) so the next sentence cannot arrive unlisted. Two related but smaller
  inaccuracies in the same direction: `contract.rendered` (`record:21`) says "the pane renders state and
  findings and nothing else" and the pane now writes that sentence of its own (it does match T004's own
  Interface contract word for word, so it is the milestone's phrasing and not this task's invention), and
  the `LINE_LABELS` docblock's "The vocabulary the pane's lines carry" (`:121-125`) is the sentence that
  is now false.
- ⚠️ Residual, carried from cycle 3 and not the defect: the record still does not say **which of the
  `fixture` block's nine values are derived and which are fixture constants.** Derived: `payloadKeys`
  (shapes), `matchedTitle` / `unmatchedTitle` (digest), `digestEntries` (digest),
  `digestCarriesUnmatchedCode` (digest), `captureRegex` (shapes), `unmatchedExtractedByTheCaptureRegex`
  (shapes regex × fixture message). Constants: `matchedCode`, `unmatchedCode`, `caseInputs`,
  `messageTexts`. `capture.reproduces` (`:250`) enumerates the case constants and the contract honestly
  and stops at the cases, so `fixture`'s mix is unstated rather than misstated. The provenance claim
  itself is now true and testable: re-deriving is real and complete for the values it names — a
  hand-edited recorded value (`cases[0].findings[0].text` and its `text:` line) took the record
  `6db94179…` → `7a239c90…` (15503 B), and one armed run put it back byte-identically to `6db94179…`
  (15495 B) — so those values come from the join and the pane, not from the file's own bytes. No
  sentence in the record claims everything is derived (the string "every value" does not occur), there
  is no clock, no commit and no absolute path (`console-panel-record.test.mjs:1550-1591`), and the
  `fix`-loss-shaped gap this cycle was written about — a doc comment asserting something of a word the
  contract no longer carried — has no analogue left in the record's own prose.
- ✅ **Idempotent in both directions, proved three times, restored each time.** Unarmed at the frozen
  head: `6db9417934a7ffffbf2c2ce41f672013e4b25fcc6c7ad298d7e6cd71ad30d11f`, 15495 B before and after
  (34 pass / 0 fail / 0 skipped, exit 0). Armed with nothing moved: 33 pass / 0 fail / 1 skipped (the
  default-run read skips itself, exit 0) and the same sha256 before and after, so it writes no byte.
  Armed runs that *do* write and a second that does not: twice — the `fix` round
  (`6db94179…` → `5d6fe249…`, 15705 B, second armed run unchanged) and the hand-edited value round
  (`7a239c90…` → `6db94179…`, 15495 B, second armed run unchanged).
- Restored, with the sha256 before and after each probe:
  `apps/angular-ai-devtools/src/app/panel-console.ts` `cd3dcc99ae49903715b17d44ee0f742fc11baa124d3f88a8f390779be5ca2dc4`
  16976 B before and after (the probe's copy hashed `aea40ad0…` 17011 B mid-round);
  `research/raw/m045-console-panel.json`
  `6db9417934a7ffffbf2c2ce41f672013e4b25fcc6c7ad298d7e6cd71ad30d11f` 15495 B before and after
  (transiently `5d6fe249…`, `5674344a…`, `e060dcf2…`, `f77a774f…`, `a34c11d1…`, `7dfc63bc…`,
  `7a239c90…`, and two per-word writings, each written back from the bytes in memory and re-hashed).
  `scripts/console-panel-record.test.mjs` `391ace70…` 90493 B and
  `scripts/console-panel-render.test.mjs` `91e66824…` 86400 B were **never mutated** (their mutants are
  temp-directory copies, and the only two files I wrote were the pane and the recording);
  `extension/console-join.js` `2294c7ea…` 10332 B, `extension/error-digest.json` `426a5be1…` 61577 B and
  `research/raw/m045-console-shapes.json` `4d2b2103…` 39284 B were read only. `git diff --stat` is empty
  and `git status --porcelain -uall` lists only untracked review files: no product file, no branch and
  no commit was touched.
- Last commands at the frozen head, unarmed then armed, both green over the restored record:
  `node --test scripts/console-panel-record.test.mjs` → `tests 34 / pass 34 / fail 0 / skipped 0`,
  exit 0, recording sha256 `6db94179…` before and after; `set "M045_CAPTURE=1"&& node --test
  scripts/console-panel-record.test.mjs` → `pass 33 / fail 0 / skipped 1`, exit 0, sha256 unchanged;
  `node --test scripts/console-panel-render.test.mjs` → `pass 37 / fail 0`.

## Intent coverage

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: fail

- ✅ All four words the criterion names are held, on the recording's own bytes and after an armed
  re-capture. `fix` reddens an armed run that writes it (28 / 5, naming state, line and word) and the
  unarmed run over the blessed bytes (26 / 8); `cause`, `element`, `because`, `due to`, `since`,
  `component`, `dom`, `node` and `angular` each redden a demonstrably bad sentence through the same pin,
  and the digest's own `element` title and a captured `because` still pass on the exemption. The one
  hole cycle 3 found — an armed capture blessing "to fix this, edit the binding" into a recording both
  suites then read green — is closed at both ends, and the render suite's remedy phrases now include
  `/\bfix\b/i` as well as the list.
- ❌ The record no longer states the surface it records. A correct sentence the pane writes since
  `85208150` (`case-difference:`) is absent from `contract.lineLabels` and from every recorded case, and
  the record's own vocabulary pin refuses that label on the recording's bytes — so the record's
  description of the surface is incomplete in the one field that describes it, a folded case cannot be
  captured without a contract edit, and no pin holds that field to the module it describes.
- ⚠️ Boundary, stated rather than hidden: the remedy prohibition is still a word list, so a remedy
  phrased in none of the sixteen words passes both suites. `no-diagnostics: no capture was handed to the
  join at all, so the answer tells the reader to retry the request` passes the vocabulary pin and passes
  `absenceBreaches` (the clause's subject is the answer and it states no verb the rule knows), so an
  armed capture would bless it — unlike `the finding suggests a change to the binding` and
  `the reader should reload the tab`, which the property refuses. The criterion's own words are held and
  the list is not claimed to be closed over English; this is the open-set limit T014's property removed
  for the silence rule and did not remove for the remedy rule.
