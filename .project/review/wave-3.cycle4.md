# Review — wave 3, cycle 4

Cycle: 4
Depth: full
Wave verdict: pass, with two advisories (the absence rule is grammar-shaped, not a property of meaning; the
record's `lineLabels` is one label short of the surface it records)
Tasks reviewed: 1
Reviewed HEAD: 85208150f3cbff73dbcd77eb9ad18a4bb2552628

## T003 — Render the join and pin the routes it adds: pass, with two advisories

- ✅ Cycle 3's advisory is closed as stated, in both suites and on both sides of the byte snapshot. The three
  wordings the five-pattern lexicon missed now redden naming the state and the phrase:
  `no-diagnostics` → "the page emitted no diagnostic at all, so no capture was handed to the join" gives render
  exit 1, **21 pass / 16 fail**, with `absence-statement: the no-diagnostics sentence says what was read and
  what it means for the panel, and never what the page did — it names the page ("page") outside a denial; it
  rendered "the page emitted no diagnostic at all, so no capture was handed to the join" (claimed "the page
  emitted no diagnostic at all")`; `captured-nothing` → "the page ran clean, so a capture was read and carried
  no diagnostic" gives render exit 1, **19 pass / 18 fail**, naming the `captured-nothing` sentence and
  `(claimed "the page ran clean")`; `joined` → "the capture held at least one diagnostic, and the page had
  nothing else to say" gives render exit 1, **22 pass / 15 fail**, naming the `joined` surface and
  `(claimed "the page had nothing else to say")`. (The extra render failures beside each rule pin are the
  suite's own mutants failing their `mutation anchor` preconditions against the reworded pane — the rule
  failures are the ones quoted.)
- ✅ The record suite now holds the recording's own bytes to the same rule, so a claim cannot be blessed by a
  re-capture. Rewording the recording directly (`research/raw/m045-console-panel.json`) reddens the rule on
  real bytes, naming the state, the line and the phrase: `absence-statement: the no-diagnostics surface line 1
  (no-diagnostics) … (claimed "the page emitted no diagnostic at all")` (**record exit 1, 32 pass / 2 fail**);
  the same for `captured-nothing` line 1 (**31 pass / 3 fail**) and `joined` line 1 (**32 pass / 2 fail**). The
  armed path is closed too: with the pane reworded to the `no-diagnostics` claim, `M045_CAPTURE=1` writes the
  new bytes (`6db94179…` → `e060dcf2…`) and **still fails, 30 pass / 3 fail**, with the failure quoted above;
  the unarmed read at the re-recorded bytes fails again (**31 pass / 3 fail**). This is the sentence that
  escaped everything in cycle 3, including an armed re-capture.
- ✅ The shipped sentences still pass, so the rule is not bought by over-refusal — and the rule's own positives
  are asserted by name, not by omission: `pinShippedAbsenceSentencesPass` reads twelve sentences (the three
  states, the six named absences, the case-difference sentence, and two reworded absences that merely describe
  what was read) and `pinNoModuleSentenceClaimsSilence` reads ten at the source; both green on every run. The
  legitimate emission sentence — "a capture whose own attempt failed also emits nothing" — still passes, as
  does the denials "…and never that the page was silent" and "this is never a claim that the page emitted
  nothing".
- ⚠️ **Advisory 1 — the property is grammatical only to the first matching token, so a page claim in another
  grammatical form still passes, and an armed re-capture blesses it.** The rule as stated is "never what the
  page did, in whatever words"; what is implemented is "no bare `page`/`app`/… token in a clause unless some
  denial word appears earlier in the same clause, and the clause's first read subject and first read action
  must come from a closed list". Four sentences that assert something about the page pass, each measured
  against the shipped matcher and then blessed through the recording:
  (a) **nominalisation with a possessive** — `no-diagnostics: the capture reflects the page's silence` passes,
  because the tokenizer yields `page's` (one token, absent from `pageWords`) and the clause's verb is decided
  by the earlier `capture`; armed re-capture wrote it (`7268b1f7…`) and the unarmed read is **32 pass / 2 fail**,
  the two failures being the suite's own mutant anchors (`remedy-spelled-fix`, `applies every mutation…`), none
  of them naming the sentence. `the page's silence was read` is refused, but only because `page's` is the
  clause's subject — not because the page is named.
  (b) **agentless passive whose participle is a read action** — `no-diagnostics: no diagnostic was reported`
  passes, because `reported` is in `readActions` (the pane reports too), and the implied agent is never read;
  blessed (`50858350…`), unarmed **32 pass / 2 fail**, again only the two anchors. The rule's own prose says an
  indeterminate standing where the page would be is a claim about the page, and a passive with no agent is that
  indeterminate. Controls behave: `no diagnostic was emitted` and `nothing was emitted` are refused.
  (c) **pronoun inheriting the page from the clause before** — `no-diagnostics: this is never a claim that the
  page was silent, and it rendered nothing` passes: the first clause is a lawful denial naming the page, and the
  second reads `it` as an indeterminate that stands because `rendered` is a `paneActions` entry. Blessed
  (`ac3fe44b…`), unarmed **32 pass / 2 fail**, only the two anchors. `it rendered nothing` is exactly the page
  claim in another clause.
  (d) **a denial about the capture governing the page word in a subordinate clause** — `no-diagnostics: the
  capture was not empty before the page ran clean` passes, because `not` appears anywhere before `page` in the
  one clause and the rule does not ask what the denial governs; blessed (`c0bfff9c…`), unarmed **32 pass /
  2 fail**, only the two anchors. `the capture was read after the page had gone quiet` and `…because the page
  ran quiet` are refused, so the subordinator is not the hole — the unscrutinised scope of the denial is.
  (e) the same first-token mechanism lets an embedded claim hide behind a read verb with no denial at all:
  `the capture says nothing was emitted` passes (the first read action is `capture`; the passive is never
  reached), and it is not blessed above only because I did not arm it.
  None of these is the shipped sentence, and none is a regression against cycle 3 (all five reddened under the
  old lexicon too, by different luck). What is new is the claim in T014's Log that the rule is a property and
  not a phrase list: it is a closed list of subjects and verbs, which is better than a list of phrases, but it
  decides a clause by its first matching token and a page word by its first occurrence, so the class of sentence
  the rule cannot see is still open. The honest statement of the reach is: a bare page noun, with no denial
  anywhere before it in the clause, in a clause whose first read token is not a read action.
- ⚠️ **Advisory 2 — the record's `contract.lineLabels` does not carry `case-difference`.** T015 added a fifteenth
  label to the surface (the folded-match sentence) and declared `research/raw/m045-console-panel.json`, but
  re-captured it byte-identically: the record's `contract.lineLabels` still lists the fourteen labels from
  before this wave (`… unreadable-finding, joined, captured-nothing, no-diagnostics`) and no `case-difference`,
  because `LINE_LABELS` in `scripts/console-panel-record.test.mjs` was not extended. Latent rather than failing,
  because no recorded case is a folded diagnostic: `pinRecordsOnlyTheContractVocabulary` asserts
  `labels.includes(label)` for every recorded line, so the first recorded `case-difference: …` line would redden
  as "labelled "case-difference", which the record's contract does not carry". The record therefore no longer
  states the vocabulary of the surface it records, and the record-side E7/SC5 rule never sees the one line this
  wave added.
- ✅ The two repairs did not weaken anything cycle 3 measured, and they touched no route. T014 and T015 change
  only `panel-console.ts`, the two suites, `extension/console-join.js` and the two records (T015's stat names
  six files, none of them `app.routes.ts`, `panel-demo.ts` or a route spec), so T003's twenty-first route and
  its pins are exactly as cycle 3 left them. The sixteen render mutants and eight record mutants still arm,
  redden and restore on a green run; the wording list still carries all sixteen entries; the carried-field
  exemption still lets the digest's "Unsafe bindings on an element" and a captured `because` render while
  emptying it reddens.
- ✅ Both required commands pass at the frozen head. `node --test scripts/console-panel-render.test.mjs
  scripts/console-panel-record.test.mjs` → exit 0, `ℹ tests 71 / ℹ pass 71 / ℹ fail 0 / ℹ skipped 0`
  (37 render tests in 3 suites, 34 record tests in 6 suites). `npm run check:panel` is not re-run here because
  neither repair touches types the command would newly see; cycle 3 measured it clean and no `.ts` type surface
  changed (T014 added docblock lines, T015 added the `carriedCode` read through `nonEmptyString`).

Measurement note. My first pass ran against the shared worktree and was contaminated exactly as cycle 3's was:
`apps/angular-ai-devtools/src/app/panel-console.ts` changed under me between the third and fourth probe
(`cd3dcc99…` → `aea40ad0…`, another session's in-place remedy probe), and the failures collected in that window
describe a pane that exists nowhere at this head. I discarded that pass and re-ran every probe quoted above in a
pristine `git archive 85208150` extraction whose four relevant blobs match the HEAD sha256 values (render suite
`91e66824…`, record suite `391ace70…`, pane `cd3dcc99…`, record `6db94179…`). Every mutation was applied to a
copy, run, and written back from the bytes that were read, with the sha256 printed before and after and equal in
all fourteen cases:

| probe | file | armed sha256 | restored to |
| --- | --- | --- | --- |
| lexicon miss `no-diagnostics` | pane | `375a68d7…` | `cd3dcc99…` |
| lexicon miss `captured-nothing` | pane | `01f453d4…` | `cd3dcc99…` |
| lexicon miss `joined` | pane | `1c2af9ab…` | `cd3dcc99…` |
| possessive nominalisation | pane | `5b1f51a6…` | `cd3dcc99…` |
| pronoun clause | pane | `2445912b…` | `cd3dcc99…` |
| agentless passive | pane | `ad54df0e…` | `cd3dcc99…` |
| denial scope | pane | `09990ff8…` | `cd3dcc99…` |
| case-difference wording dropped | pane | `433fb311…` | `cd3dcc99…` |
| case-difference arguments swapped | pane | `2c1b2dd9…` | `cd3dcc99…` |
| recorded `no-diagnostics` reworded | record | `3e3fb068…` | `6db94179…` |
| recorded `captured-nothing` reworded | record | `e3e9a5be…` | `6db94179…` |
| recorded `joined` reworded | record | `77420ca8…` | `6db94179…` |
| matcher drifted (record suite) | record suite | `cb1a6614…` | `391ace70…` |
| armed captures (`e060dcf2…`, `7268b1f7…`, `ac3fe44b…`, `50858350…`, `c0bfff9c…`) | record | — | `6db94179…` |

The shared worktree is back at HEAD: `git status --porcelain` lists only other sessions' untracked review files
and the pre-existing `.project/review/VERIFICATION.json`, and the pane, both suites and the record hash to their
HEAD values (`cd3dcc99…`, `91e66824…`, `391ace70…`, `6db94179…`). No branch was switched and nothing was
committed.

## Intent coverage

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: pass

- ✅ Both absences are still named by sentence, and neither repair re-worded them: the `no-digest-entry` sentence
  still names `NG04002` and the `no-code` sentence still states that the message carried none, and the count rule
  still reddens on its own mutant (`no-code: a count is not a name …`). The shipped `no-diagnostics` and
  `no-code` sentences pass the new absence rule unchanged.
- ✅ The fourteen labels the record states include both absence labels (`no-code`, `no-digest-entry`), and no
  absence sentence gained a cause, an element or a remedy while T014 replaced the rule or T015 added its
  sentence — the absence rule is applied to the named absences at the source and on the surface, and passes.

### SC4 — A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for.: pass

- ✅ The two absences remain two statements (`two-absences` green; `none.lines.length === 2`; neither text names
  the other's state), and `captured-nothing` is read whole rather than by prefix — a silence claim written into
  it reddens naming the sentence and the phrase.
- ✅ The silence rule now runs over four surfaces (`joined`, `captured-nothing`, `no-diagnostics`, and a word the
  pane was not given) and over every sentence the module states, and it reads the recording's own bytes, so a
  re-capture cannot bless a claim. `no-diagnostics` — the state where the page claim is most tempting — is
  measured reddening in both suites, armed and unarmed.
- ⚠️ The rule's grammar is the advisory above: a page claim expressed as a possessive, an agentless passive, a
  pronoun, or behind a denial that governs something else is still reported as a distinct statement, and an
  armed re-capture blesses each of those four. The shipped sentence is correct; the guard is narrower than its
  prose.

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: pass

- ✅ T015's new sentence states two facts and names no cause, no element and no remedy: `case-difference: the
  message carried ng01002 and the digest carries NG01002, so this finding carries the digest's own spelling and
  title`. It names the message's spelling and the digest's spelling, and says which one the row carries; it
  carries none of the sixteen prohibited words (`cause`, `because`, `due to`, `since`, `element`, `component`,
  `dom`, `node`, `remedy`, `fix`, `solution`, `repair`, `angular`, `framework`, `count`, `number`) and the word
  `angular` appears nowhere in it. It is checked against the same prohibitions as every other line: the folded
  surface is run through `pinNoCauseElementRemedy`, `pinNoUnattributedAngularWording`,
  `pinNoAbsenceClaimsSilence`, `pinRendersTheAnswerAndNothingElse` and `pinCaseDifferenceIsNamed`, and the
  sentence is read by both shipped-sentence pins. Its facts are pinned, not just its shape: swapping the two
  arguments at the call site reddens the render suite (**36 pass / 1 fail**) with `renders-the-answer-and-
  nothing-else: the line "case-difference: the message carried NG01002 and the digest carries ng01002, …" is
  neither a field of the answer nor one of the pane's own named absences`, so the sentence cannot state the two
  spellings the wrong way round.
- ✅ SC5's prohibitions still bite where the pane writes its own words, and are still exemption-scoped: a
  `because` clause in a pane-written absence reddens; the digest's own "Unsafe bindings on an element" and a
  captured "because" render verbatim; emptying the exemption reddens the correct pin; a pane-written cause
  hidden behind a `text:` label reddens the answer-shaped pin instead.
- ⚠️ The record's stated label vocabulary is one short (`case-difference` absent from `contract.lineLabels`), so
  the record-side halves of SC5/E7 never read the one line this wave added. Advisory 2 above.

## Held-out

### E7 — A suite must pin that the surface renders no cause, element, remedy or unattributed angular wording.: pass

- The pins run on every state the pane renders and on the folded surface, each of the four prohibitions still has
  a mutant that reddens by name, and the positive case is armed from both sides (a real digest title carrying
  "element" and a captured "because" must pass, and the exemption that lets them is itself removed in a mutant).
  The rule that polices the pane's claims about the page is now a stated rule read by both suites rather than a
  phrase list, and it reddens naming the state and the phrase for the three wordings cycle 3 found. The held-out
  criterion is met. What the pin does not yet do is see a page claim that keeps a read subject and a read verb in
  place — see Advisory 1 — and it cannot see a `case-difference` line on the recording side — see Advisory 2.
