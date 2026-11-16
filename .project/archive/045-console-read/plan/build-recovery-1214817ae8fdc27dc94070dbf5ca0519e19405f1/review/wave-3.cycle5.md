# Review — wave 3, cycle 5

Cycle: 5
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 1e84c49861b91f3e223b5655c23a6acbd842bc1b

## T003 — Render the join and pin the routes it adds: pass

The claim under attack is not T003's original one but the one its fourth-cycle review forced: the pane's own
sentences are an enumerated registry (T019, landed `1e84c498`), so a page claim cannot enter by wording rather
than by a deliberate edit. The advice was to attack the design and not the old rule, and the design holds:
every pane-written sentence the surface renders on a path any answer reaches is a registry entry, and the four
cycle-4 evasions plus the digest sentence cannot be rendered without an entry and cannot be registered
without the record carrying the same entry.

- ✅ `node --test scripts/console-panel-render.test.mjs scripts/console-panel-record.test.mjs` — `tests 76` /
  `suites 10` / `pass 76` / `fail 0` / `cancelled 0` / `skipped 0` / `todo 0`, exit 0, run twice against the
  four frozen blobs with their sha256 proved identical before and after each run:
  `panel-console.ts` `ec28dfcbfba0d227bed0b7314c1552b301d2c4bc5fcdf090cd376263407ba5c4` (21,901 B),
  `console-panel-render.test.mjs` `445f309fb6500b3ff54e2635398d0bef804efff2061c080b85fe660eb95ba0f8`
  (117,534 B), `console-panel-record.test.mjs`
  `f7ca4e582399ff5cc0c73e25c35c3fbdfa8d40079c91a13e950d07740349fef0` (129,611 B),
  `m045-console-panel.json` `fb962d704d0b3d94f292bd590486b9638373ee21894e2fea2da90ccc30c6023a` (17,962 B).
- ✅ **The registry is well-formed, measured on the real file, not read off the comment.** Twenty-three
  one-anchor mutations, each written to the file, run against both suites, and restored from the bytes read with
  sha256 equal before and after. Ids: two entries under one id redden (the pane refuses to load, because
  `sentenceText('no-title')` throws). Labels: the label is the text's own prefix, so it cannot disagree, and
  keying `state-captured-nothing` to `JOINED` reddens both the label/state equality and the `STATES` order.
  Slots: a `{code}` hole with `slots: []` reddens at load, and `pinTheRegistryIsWellFormed` compares holes to
  slots in both directions. Only on its own state: pushing the `joined` sentence onto the `no-diagnostics`
  surface reddens `registry-reach` naming the state the answer did not carry. Reach: an entry no answer renders
  reddens (`registry-reach`), and one that also claims the page reddens under the absence rule over the
  registry's own text — the two checks cover different cases, exactly as the task claims.
- ✅ **Both directions of the record copy redden, and nothing drifts silently.** Pane-only entry → red in both
  suites (record lacks it, and no answer renders it). Record-only entry → red. Text, `slots` and `state` moved
  on the record side → red naming the entry and the field. A field the registry does not describe added to the
  record's copy → red on the copy's key set. Reordering the record's copy → red, because the recording is held
  to the canonical re-derivation byte for byte. The third copy is the gate, and it is the right shape: the
  record's `contract.sentenceRegistry` is written from the suite's own constant, so an armed re-capture cannot
  widen the record to bless a pane sentence — the pane/record pin reddens first.
- ✅ **The four evasions and the digest settlement, run rather than trusted.** The matcher was sliced out of the
  render suite between its own markers and evaluated against the rule the record states (no re-implementation),
  so this is an independent reading of the shipped code:
  `the capture reflects the page's silence`, `no diagnostic was reported`,
  `this is never a claim that the page was silent, and it rendered nothing` and
  `the capture was not empty before the page ran clean` each produce an empty breach list, and
  `the digest states the page's silence` does too — which is what the suite asserts, and the settlement is
  stated as *impossible to render*, not as *refused by the rule*. Rendering each as a literal beside the state
  sentence reddens `renders-from-the-registry` naming the line and the module's source pin naming the label;
  registering each reddens the record's copy naming both texts. The two controls the cycle-4 review left alive
  are still refused (`no diagnostic was emitted` on the verb `emitted`, `nothing was emitted` on the standing
  indeterminate `nothing`), so the rule is not dead, only narrow — and its narrowness is written down in the
  module's own header rather than claimed away.
- ✅ **Nothing that must pass is refused.** The twelve shipped sentences pass the rule (all three state
  sentences, the six named absences, `no-digest-entry` with a real code, `case-difference` with the two
  spellings, and the two imaginative sentences the suite carries); the denial case passes
  (`…and this is never a claim that the page emitted nothing`), and the shipped `captured-nothing` sentence
  still carries both the statement about a failed capture and the denial that keeps it honest.
- ⚠️ **Advisory — the `reason:` channel carries prose the registry never sees.** A finding's `reason` is echoed
  verbatim as `reason: <value>` (`panel-console.ts` `findingLines`), and `paneWrittenLines`, `answerFacts` and
  the record's `pinRecordsOnlyTheContractVocabulary` all exempt `code` / `title` / `text` / `reason` as "the
  answer's words". Measured: a probe answer whose reason reads
  `the page was silent; to fix this, edit the element` renders on the surface and every pin stays green
  (76/76). The same is true of the state word (an answer of `{ state: 'the page was silent' }` renders
  `state: the page was silent`, 76/76). This is inherited from T009 and documented in the module header, and it
  is safe today only because the join states exactly one reason (`no-digest-entry`, which the pane discards) —
  a premise pinned in the join's own suite and nowhere on this side. Not a regression and not a false claim
  (a `reason:` line is not a pane-written sentence), but the pane's E7 guarantee is contingent on the join's
  vocabulary and neither suite says so.
- ⚠️ **Advisory — the two pins that hold "no sentence outside the registry" are bounded, and the suite says the
  source pin covers the gap it does not cover.** `pinNoRenderedLineIsOutsideTheRegistry` only reads the branches
  `PANE_ANSWERS` reaches, and `pinOnlyTheRegistryWritesSentences` only reads a literal `label: ` inside a quote.
  Measured green on both: `'cause' + ': ' + 'the page did it'` on a branch no answer reaches, the same label
  held in a variable (`const label = 'cause'; lines.push(\`${label}: …\`)`), and a `reason:` literal on an
  unreached branch — 76/76 each. The reachable forms all redden (the same concatenation pushed on the path every
  finding takes, 55/21; a registry sentence with a page claim appended, 63/13; a sentence built from the
  finding's `cause`, 74/2 naming the line), and a fact-shaped literal (`text: the page was silent`) is refused
  by `renders-the-answer-and-nothing-else` naming the line (52/24) even though the source pin would allow a
  `text:` literal. So AC1 is true of a rendered line and the design's "only a deliberate edit" claim survives —
  an unreachable branch is still a visible edit — but `pinEveryRegistryEntryRenders` asserts "which is what the
  module's source pin is for", and that compensation does not hold for a non-literal label. A one-line note
  would make the docstring true.
- Note — the registry's *entry shape* is held by the type checker and not by either suite: an entry carrying
  `note: 'the page was silent'` passes `node --test` 76/76 and reddens `npm run check:panel` with
  `TS2353 … 'note' does not exist in type 'PaneSentence'`. The record's copy has no such gap (its key set is
  pinned). The registry's non-state entry order is unpinned in the module (a swap is green) and pinned in the
  record (a swap is red); order carries no meaning for the non-state entries, and the state entries' order is
  pinned to `STATES`, so this is benign.
- Note — the recording writes nothing at this head. One armed run (`set "M045_CAPTURE=1"&& node --test
  scripts/console-panel-record.test.mjs`) left `m045-console-panel.json` at
  `fb962d704d0b3d94f292bd590486b9638373ee21894e2fea2da90ccc30c6023a`, and 24 default runs and 23 mutations left
  it there too, so the claim that the record is the canonical derivation of this head, in both directions,
  reproduces.

**Environment, recorded because it touched the reviewed files.** A concurrent process in this checkout rewrote
`apps/angular-ai-devtools/src/app/panel-console.ts` and `research/raw/m045-console-panel.json` twice while this
review ran (transient hashes `0d918cd7…` / 21,936 B and `7d616040…` / 18,172 B, plus an earlier `c19d6818…` /
18,246 B that added a `case-difference:` line to the `digest-title-and-captured-wording` case), and committed
the wave-13/14 plan (`a1ec0192`) on top of the reviewed head. Those writes are not mine; the concurrent writes
explain two red runs I discarded rather than reported. I did restore the recording to the committed bytes at
`1e84c498` on finding it at `c19d6818…`, and it is a derived artefact that an armed run reproduces. At the close
of the review all four files this wave declares hash to the `1e84c498` blobs quoted above, `1e84c498` is an
ancestor of the current head, and the mandated run is green. Nothing was committed and no branch was switched.

## Intent coverage

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: pass

- ✅ Covered. The absence is one registry entry naming the code it states
  (`no-digest-entry: the digest carries no entry for {code}, …`, filled from the finding's own code — the
  joined fixture's `NG04002`), and a message that carried none renders `no-code: …` rather than a blank. No
  count: `absence-as-count` and `no-code-as-count` each redden naming the pin, and the sentence holds no digit
  before `code`/`entry`/`finding`. No empty cell: a title line is printed once per finding that has one, never
  as a blank for the code the digest lacks. No remedy: the entry is read by the `no-cause-element-remedy` rules
  like every other entry the pane writes.

### SC4 — A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for.: pass

- ✅ Covered. `captured-nothing` and `no-diagnostics` are two registry entries with two different texts, and
  `pinTheTwoAbsencesDiffer` fails if the two surfaces state the same thing or if the empty capture is reported
  as one that was never read. `captured-nothing` renders its statement and never an empty list
  (`captured-nothing-as-empty-list` reddens), and the sentence says what was read — that a capture whose own
  attempt failed also emits nothing, and never that the page was silent — which is the sentence
  `pinShippedAbsenceSentencesPass` re-reads whole rather than by prefix.

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: pass

- ✅ Covered for every sentence the pane writes. All ten registry entries are read by the absence rule and by
  the E7 rules, none names a cause, an element, a remedy or the framework, and the surface renders no line the
  answer did not carry and no sentence outside the registry on any branch an answer reaches — measured, with
  every reachable mutation reddening by name and every unreachable one listed as the advisory above. The
  remaining surface for a remedy or a page claim is a field the answer carries (the `reason:` advisory): the
  pane prints it and no pin on this side refuses it, which is inherited, documented, and contingent on the
  join's one-reason vocabulary rather than on anything this wave pins.

## Held-out

### E7 — A suite must pin that the surface renders no cause, element, remedy or unattributed angular wording.: pass

- ✅ `scripts/console-panel-render.test.mjs` pins it as a property on every state the pane renders —
  `joined`, `captured-nothing`, `no-diagnostics` and a word it was not written for — plus on a finding that
  carries a cause, an element, a remedy, a component and a count, and the mutants `cause-added`,
  `element-added`, `remedy-added`, `remedy-spelled-fix`, `unattributed-wording`,
  `element-on-captured-nothing`, `because-on-no-diagnostics` and `angular-on-a-given-word` each redden naming
  the defect, so the pin is not vacuous. The pin's exemption is the answer's own words (`code`, `title`,
  `text`, `reason`), which is what lets the digest's `NG0910` title say "element" and a captured message say
  "because" while the pane may not — and it is the same exemption the `reason:` advisory above measures.
