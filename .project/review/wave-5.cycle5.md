# Review — wave 5, cycle 5

Cycle: 5
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 1e84c49861b91f3e223b5655c23a6acbd842bc1b

At the frozen head, byte-identical reachable state: `research/raw/m045-console-panel.json`
`fb962d704d0b3d94f292bd590486b9638373ee21894e2fea2da90ccc30c6023a` (17962 B) and
`apps/angular-ai-devtools/src/app/panel-console.ts`
`ec28dfcbfba0d227bed0b7314c1552b301d2c4bc5fcdf090cd376263407ba5c4` (21901 B). Mid-review the branch
advanced to `a1ec0192` (two planning commits, “waves 13 and 14”); `git diff --name-status
1e84c498..a1ec0192` touches `.project/` only, so every measurement below is a measurement of the
frozen head.

## T004 — Record the surface and run the project verify: fail

- ✅ **The cycle-4 probe is closed, armed and unarmed.** The pane's own `joined` sentence was changed to
  `…, and to fix this, edit the binding` (`panel-console.ts` `ec28dfcb…` → `0d918cd7…`), one armed run
  then one unarmed. The armed run **writes and reddens**: the recording moved `fb962d70…` (17962 B) →
  `7d61604021ef499933171a63fe64036936bb74db11e8f6ed0b232740a59b67d1` (18172 B), 28 pass / 8 fail /
  1 skipped, naming the state, the line and the word —
  `recorded-vocabulary: joined surface line 1 is policed as the pane's own "joined" line and carries "fix", and the contract states that the pane renders no "fix"; it records "joined: … , and to fix this, edit the binding" (matched the word "fix" as a whole word)`.
  A second armed run wrote no byte (`7d616040…` unchanged, 28/8/1). The unarmed run over those blessed
  bytes is 29 pass / 8 fail with the same message, and — new since cycle 4 — the registry pin reddens on
  the same bytes too: `sentence-registry: the record's copy of "state-joined" states the text "… order",
  and the pane states "… order, and to fix this, edit the binding"`. Cycle 3 read this probe green; cycle
  4 caught it only in the word list. `fix` is still on `contract.prohibitedWording` (`record:117`),
  matched whole, and the
  arm that lets the digest's own `element` title and a captured `because` pass is unchanged
  (`recorded-vocabulary: … digest-title-and-captured-wording surface line 3 … carries "element"` when the
  exemption is removed).
- ✅ **The label vocabulary is the pane's, read three ways and failing in both directions.**
  `pinTheVocabularyIsThePane` (`scripts/console-panel-record.test.mjs:1600-1652`) reads the pane as
  (1) the lines the shipped module renders for the twelve answers in `PANE_PROBES` — every branch it can
  take — (2) the sentences it exports (`STATE_TEXTS`, the five `NO_*`/`UNREADABLE` sentences, and
  `noDigestEntryText` / `caseFoldedMatchText` called with the codes the join really produces) and (3)
  every ``lines.push(`label: …`)`` in its own source; (2) and (3) are asserted to lie inside (1), so an
  unread label cannot pass unseen. Green at the head: `pane label vocabulary (15): captured-nothing,
  case-difference, code, joined, no-code, no-console-answer, no-diagnostics, no-digest-entry, no-finding,
  no-title, reason, state, text, title, unreadable-finding`, equal to `contract.lineLabels`, and the
  record's cases render no label outside it (measured from the record's own bytes: 0). Both directions
  are live on the real file: a pane copy in the run's temp directory with one added
  ``lines.push(`cause: …`)`` reddens `label-vocabulary: the pane writes 1 label(s) the record's
  contract.lineLabels does not carry: "cause"`; adding `cause` to the record's list in memory reddens
  `label-vocabulary: the record's contract.lineLabels carries 1 label(s) the pane writes no line for:
  "cause"`. The honest limit is stated at `:1401-1433` and holds: the export reading skips `PANE_SENTENCES`
  (an array of objects, not of strings), so a registry entry whose label no probe renders is caught by the
  registry pin and by the render suite's `registry-reach` pin rather than here — at this head every one of
  the ten entries is rendered by a probe.
- ✅ **The sentence registry is held the same way, and both directions are live.** `PANE_SENTENCES` is ten
  entries (`state-joined`, `state-captured-nothing`, `state-no-diagnostics`, `no-console-answer`,
  `no-finding`, `no-code`, `no-title`, `unreadable-finding`, `no-digest-entry` with `{code}`,
  `case-difference` with `{carriedCode}`/`{digestCode}`), each `{ id, text, slots, state }`, with the
  line's label read off the text so the two cannot disagree. `pinTheSentenceRegistryIsThePanes`
  (`scripts/console-panel-record.test.mjs:1675-1747`) holds the record's copy to the module in both
  directions and field by field, and `pinRecordedLinesAreRegistrySentences`
  (`scripts/console-panel-record.test.mjs:1764-1808`) holds the recording's own bytes: every
  pane-written line must be a labelled fact the recorded answer states or a registry entry with its slots
  filled from the recorded findings. Measured on the shipped tree: a pane copy that gains
  `a-sentence-the-record-lacks` reddens `the pane states 1 sentence(s) the record's contract.sentenceRegistry
  does not carry: "a-sentence-the-record-lacks"`; a record copy that gains `a-sentence-nobody-writes`
  reddens `the record's contract.sentenceRegistry carries 1 sentence(s) the pane does not write`; each of
  wave 3's five evasions registered as the `no-diagnostics` text is refused by name, and a recorded
  surface blessed with one reddens `renders-from-the-registry: … that line is neither a labelled fact the
  recorded answer states nor one of the sentences the record's contract.sentenceRegistry carries`. So a
  recording **cannot** carry a sentence the pane does not write, and pin-wise it **cannot** omit an entry
  the pane does write.
- ❌ **But the record's `contract.finding` omits the field its own registry is filled from, so the
  recording cannot carry the pane's `case-difference` sentence at all.** `contract.finding` is
  `["text","code?","title?","reason?"]` (`record:14-19`); the shipped join returns five fields —
  `console-join.js:49` states `{ text, code?, title?, reason?, carriedCode? }` and `:192`, `:203` push
  it — and the pane reads `raw['carriedCode']` (`panel-console.ts:379`). The record's own
  `contract.sentenceRegistry[9]` names `carriedCode` as a slot, so the contract contradicts itself two
  fields apart, and nothing holds `finding` to the join: the suite compares it to its own literal
  (`scripts/console-panel-record.test.mjs:2056`) and `pinRendersEachRecordedFinding` enforces “no key
  outside `FINDING_FIELDS`” (`scripts/console-panel-record.test.mjs:1230-1235`), which is the shape of a
  constant with no pin — the defect T017 was written to
  close for `lineLabels`, one field over. Measured against the real modules: the join answers
  `[{"text":"ng01002: …","code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}]`; the
  suite's `findingRecord` drops `carriedCode`; the pane's real render of that answer carries
  `case-difference: the message carried ng01002 and the digest carries NG01002, …` and the re-render from
  the recorded findings does not (`lines equal: false`), and the line is not in the `texts` set
  `pinRecordedLinesAreRegistrySentences` builds. Written into the record as an armed re-capture would
  (`c19d6818…`, 18246 B, stable before and after), an unarmed run is 34 pass / 3 fail: `re-derives … at
  <record>.cases[2].surface.lines: 6 entry(ies) -> 5 entry(ies)`, `renders-from-the-registry:
  digest-title-and-captured-wording surface line 4 is "case-difference: …"`, and the T017 test that
  asserts no case carries the line. T017's AC2 — “Recording a case that renders the case-difference
  sentence does not redden the record's own pin” — is therefore false as written at this head: the
  vocabulary pin passes it and T019's pin refuses it. The consequence is that the recording's case-by-case
  answer still omits the one behaviour the milestone added under E6 (`NG01002` folded to `NG01002`), while
  its vocabulary lists the sentence; five of the ten registry entries and six of the fifteen labels are
  rendered by no case, and only `case-difference` is *structurally* unreachable. Both the record's
  Interface-contract sentence (T004/T015/T017/T019 all restate “each finding is `{ text, code?, title?,
  reason? }`”) and the record's own `contract.finding` are stale against `T015`'s shipped field, so the
  repair is either a plan-level Interface-contract update or a record that states the shipped shape and
  records the folded case — but the record is the artefact that must describe the tree, and the tree has
  five fields.
- ⚠️ **The record's self-description: the split is honest where it is stated, and the registry is stated
  nowhere.** Derived from the tree: every `cases[].state`, `cases[].findings` and `cases[].surface.*`, and
  `fixture.payloadKeys` (shapes), `matchedTitle`/`unmatchedTitle`/`digestEntries`/
  `digestCarriesUnmatchedCode` (digest), `captureRegex` (shapes),
  `unmatchedExtractedByTheCaptureRegex` (shapes regex × fixture message). Constants: `schema`,
  `milestone`, `task`, `title`, `question`, the whole `contract`, the capture prose, every
  `cases[].input`/`cases[].why`, `fixture.matchedCode`, `unmatchedCode`, `caseInputs`, `messageTexts`.
  `capture.reproduces` (`record:318`) states that split for the cases and the contract and says
  `contract.states` “restates the join's three state words rather than reading the namespace the join
  publishes”; it never says the `fixture` block's seven derived values are derived (unstated, not
  misstated — the ⚠ carried from cycles 3 and 4). The registry is described **as neither**: no sentence
  in the record names `sentenceRegistry`, whose it is, or that five of its ten entries render in no case;
  `capture.reproduces` folds it into “the whole contract … this suite's own fixture constants”. The
  meaning lives only in the suite (`The record's copy of the module's \`PANE_SENTENCES\``,
  `scripts/console-panel-record.test.mjs:200-212`)
  and in its failure text (“the record states the sentences the pane writes”). A reader of the record
  alone, seeing a ten-entry registry that five cases never render, cannot tell a pane registry from a
  recording-side sample. Two smaller inaccuracies in the same direction: `contract.rendered` (“the pane
  renders state and findings and nothing else”) is true of the prohibitions and false as an inventory —
  it is T004's own Interface contract word for word, and the registry now supplies the inventory it
  lacks; and the record suite's own rationale says “five of its entries are rendered by no recorded case”
  (`scripts/console-panel-record.test.mjs:27-29`, `:1403-1404`) where the record's bytes give six —
  `reason`, `no-title`, `case-difference`, `no-finding`, `no-console-answer`, `unreadable-finding` — a
  count written by T017 (`33fa8c7b`), the task that added the sixth label.
- ✅ **Idempotent in both directions, bracketed by hashes every time.** Unarmed at the frozen head: 37
  tests / 7 suites / 37 pass / 0 fail / 0 skipped, recording `fb962d70…` before and after. Armed with
  nothing moved: 36 pass / 0 fail / 1 skipped and the same sha256, so it writes no byte. Armed with a
  value moved: `fb962d70…` (17962 B) → `7d616040…` (18172 B) on the `fix` probe, unchanged by a second
  armed run; a second moved-value round (`c19d6818…`, 18246 B) likewise. Restored by one armed run at
  the restored pane: `fb962d70…` (17962 B), byte-identical to the head bytes.
- ✅ **The named check, armed and unarmed, green at the frozen head.**
  `node --test scripts/console-panel-record.test.mjs` → `tests 37 / suites 7 / pass 37 / fail 0 /
  cancelled 0 / skipped 0`, exit 0, recording sha256 `fb962d70…` before and after;
  `set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs` → `pass 36 / fail 0 /
  skipped 1`, exit 0, sha256 unchanged. `node --test scripts/console-panel-render.test.mjs` → `tests 39 /
  pass 39 / fail 0`. T004's AC3 (`npm run check && npm test` quoted in the Log) was **not** re-run:
  this checkout is shared with reviewers that are mid-probe on the same product files (see the restore
  note), so a project-wide run cannot be attributed to this head. AC1, AC2 and AC4 were measured directly
  above.
- Restored, with the sha256 before and after each probe.
  `apps/angular-ai-devtools/src/app/panel-console.ts`
  `ec28dfcbfba0d227bed0b7314c1552b301d2c4bc5fcdf090cd376263407ba5c4` (21901 B) before and after
  (transiently `0d918cd7db70e60f55ae3559cdfb42246c801a8a9e99135b4e3d7bcf164113cf` for the one anchored
  edit, written back from the bytes parked in the scratchpad and re-hashed).
  `research/raw/m045-console-panel.json`
  `fb962d704d0b3d94f292bd590486b9638373ee21894e2fea2da90ccc30c6023a` (17962 B) before and after
  (transiently `7d616040…` 18172 B twice and `c19d6818…` 18246 B once, each bracketed and the last
  returned by one armed run). Read only and unchanged throughout:
  `scripts/console-panel-record.test.mjs`
  `f7ca4e582399ff5cc0c73e25c35c3fbdfa8d40079c91a13e950d07740349fef0` (129611 B),
  `scripts/console-panel-render.test.mjs`
  `445f309fb6500b3ff54e2635398d0bef804efff2061c080b85fe660eb95ba0f8` (117534 B),
  `extension/console-join.js`
  `da3ba82ee5a2f7c227c7ffc76314678ccd5677017c2d01c70659e808c592e6a0` (11486 B),
  `extension/error-digest.json`
  `426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35` (61577 B) and
  `research/raw/m045-console-shapes.json`
  `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091` (39284 B). `git status
  --porcelain -uall` carries no modification under `apps/`, `scripts/`, `extension/` or `research/` —
  only this review file, a sibling reviewer’s, and the orchestrator’s own `.project/STATE.md` — and no
  branch was created and nothing was committed. **The probe that
  produced `.project/review/wave-1.cycle5.md` and a `note` field inserted into the record's registry is
  not mine:** the record's registry briefly carried `"note": "the page was silent"` under `no-title` from
  another process, and every measurement above was therefore taken with the pane's and the record's
  sha256 printed immediately before and after the run and only kept where the two matched.

## Intent coverage

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: pass

- ✅ The criterion's four words are held on the surface, on the record's bytes, and after an armed
  re-capture — now by construction rather than by a word list. `fix` reddens an armed run that writes it
  (28 / 8, naming state, line and word) and the unarmed run over the blessed bytes (29 / 8), while the
  digest's own `element` title and a captured `because` still pass on the exemption. `cause`, `because`,
  `due to`, `since`, `element`, `component`, `dom`, `node`, `remedy`, `fix`, `solution`, `repair`,
  `angular`, `framework`, `count` and `number` each catch a demonstrably bad sentence through the same
  pin, matched whole (`prefix`, `affix`, `account` pass), and all sixteen redden one unarmed run each.
  T004's AC2 — the pinned suite reddens when the surface stops reporting an absence by name — holds:
  `absence-as-count` is 28 / 8 with `named-absence: … a count is not a name`, and the recorded
  `captured-nothing` case still says what a failed capture did and still carries its denial.
- ✅ Cycle 4's open-set residual for the remedy rule is closed structurally, measured rather than
  claimed. `no-diagnostics: no capture was handed to the join at all, so the answer tells the reader to
  retry the request` carries none of the sixteen words and returns no breach from the record's own
  absence rule (measured with the record suite's matcher block and
  `contract.absenceStatement`); it cannot reach a surface without an entry in `PANE_SENTENCES`, and an
  entry the record's copy does not carry reddens the record suite by name. So an unseen remedy now costs a
  deliberate edit in two files that a reviewer sees, instead of a re-capture that blesses it — which is
  what the criterion's prohibition needed and the word list could not give.
- ⚠️ The record that evidences this criterion misstates the shape of the finding it describes: its
  `contract.finding` omits `carriedCode`, which the shipped join returns, the surface reads, and the
  record's own `contract.sentenceRegistry` names as a slot — and because of that omission the recording
  carries no `case-difference` case. That is a defect of the record's honesty and not of what the surface
  renders, so it fails T004 above and is recorded here rather than marked against this sentence: the
  surface renders no cause, element, remedy or unattributed wording, and now cannot do so without an
  enumerated, record-visible edit.
