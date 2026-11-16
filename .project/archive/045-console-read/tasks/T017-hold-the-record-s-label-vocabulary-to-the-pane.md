---
id: T017
title: Hold the record's label vocabulary to the pane
wave: 11
deps:
  - T015
status: done
agent: build_T017
base: 315a60956e1eba2147dd0559e992711a991e8dee
worktree: null
task_branch: null
files:
  - research/raw/m045-console-panel.json
  - scripts/console-panel-record.test.mjs
---

# T017 — Hold the record's label vocabulary to the pane

## Context

Wave 5's cycle-4 review found the record's own vocabulary had drifted from the pane it describes.
`contract.lineLabels` lists fourteen labels; the shipped pane can write fifteen, because `case-difference:` was
added by the later task that reports a folded match. Recording a line with that label reddens the record's own
pin with "is labelled \"case-difference\", which the record's contract does not carry" — the record refuses a
sentence the pane legitimately renders.

The field is a statement about the pane, not about the recorded subset, and nothing holds it to the module,
which is how it drifted. Five labels in it are rendered by no recorded case, so a test that compared it to the
recording would not have caught this either.

## Approach

- - Add the missing label, and any other the pane can write, so the record's vocabulary describes the pane
  rather than a sample of it.
- Hold the field to the module: a test reads the labels the pane can emit and fails when the record's list
  and the pane disagree in either direction, so drift of this kind reddens at the moment it is introduced.
- Keep the recording's own cases honest: a case that renders the folded-match sentence may be added, but only
  if the pane produces it at this head.
- Do not widen the vocabulary to make a bad sentence pass: the list says which labels the pane writes, not
  which words it may use in them.

## Acceptance criteria

1. The record's label vocabulary equals, in both directions, the set of labels the pane can write, and a test fails when either side gains or loses one.
2. Recording a case that renders the case-difference sentence does not redden the record's own pin.
3. The vocabulary still refuses a label the pane cannot write, proven by a mutant.
4. The record remains idempotent: an unarmed run reads it byte-identically, one armed run writes, a second writes nothing.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check scripts research/raw
```

## Log

- Task written at the fourth repair cycle; not started.
- Settled at head `686c6124`. The record's `contract.lineLabels` gained one entry, `case-difference`, and lost
  none: the pane writes all fourteen it already carried (`state`, `code`, `title`, `reason`, `text`, `no-code`,
  `no-title`, `no-digest-entry`, `no-finding`, `no-console-answer`, `unreadable-finding`, `joined`,
  `captured-nothing`, `no-diagnostics`) plus the folded-match label T015 added, so the list is fifteen and
  describes the pane rather than a sample of the recorded cases. `git diff --
  research/raw/m045-console-panel.json` is one inserted line and nothing else — `+"case-difference",` between
  `"no-digest-entry"` and `"no-finding"`; the record moved `6db94179…` (15495 B) →
  `f02f277c278fbc752c74e111cdfa0ddbc5cfdc88ff1276f1f8c02b9ea3aac291` (15520 B) on one armed run.
- **The label sets compared.** Record side: `contract.lineLabels`, read by `JSON.parse` of the recording's own
  bytes at run time. Pane side, read three ways and asserted to be one set: (1) the lines the shipped
  `apps/angular-ai-devtools/src/app/panel-console.ts` renders for the twelve answers in `PANE_PROBES`, chosen so
  every branch the pane can take is taken — no answer, an answer with no state word, the three state sentences, a
  joined answer with no finding, a titled finding, an uncoded message, a code the digest lacks with the join's
  reason, a folded match, a list entry that is not a finding, a titleless finding, an unmodelled reason; (2) the
  sentences the module exports — `STATE_TEXTS` (3), `NO_ANSWER_TEXT`, `NO_FINDING_TEXT`, `NO_CODE_TEXT`,
  `NO_TITLE_TEXT`, `UNREADABLE_FINDING_TEXT`, `noDigestEntryText(code)` and `caseFoldedMatchText(carriedCode,
  code)`, the builders called with the codes the join really produces; (3) every ``lines.push(`label: ...`)`` in
  the module's own source. Both sides name the same fifteen: `captured-nothing, case-difference, code, joined,
  no-code, no-console-answer, no-diagnostics, no-digest-entry, no-finding, no-title, reason, state, text, title,
  unreadable-finding`.
- **The pin, both directions.** `pinTheVocabularyIsThePane` (`scripts/console-panel-record.test.mjs`) fails naming
  what the record omits and what it carries that the pane cannot write, and separately fails if an exported
  sentence or a pushed label is never rendered by a probe, so a label cannot go unread and pass. Three new tests
  in `the record’s label vocabulary is the pane’s, read both ways`: the list equals the pane's set, 15 = 15; a
  `case-difference` line rendered from a real folded answer (`ng01002` joined to the digest's `NG01002`, with
  `carriedCode`) passes the record's vocabulary and absence pins, while the fourteen-label list reddens on that
  same line with `recorded-vocabulary: case-difference surface line 4 is labelled "case-difference", which the
  record's contract does not carry; it records "case-difference: the message carried ng01002 and the digest
  carries NG01002, so this finding carries the digest's own spelling and title"` — finding 4's sentence, now
  failing only on the list it was measured against.
- **Mutant 1, a label added to the pane only — record reddens.** Inside the suite and outside the checkout: the
  pane's source is copied into this run's temp directory with one added ``lines.push(`cause: the message states
  one`)``, and the repaired record's list is held to that copy —
  `label-vocabulary: the pane writes 1 label(s) the record's contract.lineLabels does not carry: "cause" — the
  record states which labels the pane writes, so a label the pane writes and the record omits is drift; the list
  would have to carry "captured-nothing", "case-difference", "cause", "code", …`.
  `apps/angular-ai-devtools/src/app/panel-console.ts` was never written:
  `cd3dcc99ae49903715b17d44ee0f742fc11baa124d3f88a8f390779be5ca2dc4`, 16976 B before and after the probe, so the
  restore is the absence of a write and the sha256 of the file itself verifies it.
- **Mutant 2, a label added to the record only — record reddens.** Written into the recording and restored from
  the bytes parked in the scratchpad: `f02f277c…` (15520 B) →
  `b8276f1d78d6f45d2c734523d528136cdd22a08ae69009a3bf331b51a52272f5` (15535 B, `lineLabels` 16, `cause`
  appended); one unarmed run went `21 pass / 16 fail`, naming the drift and the derivation both —
  `label-vocabulary: the record's contract.lineLabels carries 1 label(s) the pane writes no line for: "cause" — the
  record states which labels the pane writes, so a label it carries and the pane cannot write is drift; the list
  would have to carry … "case-difference", …` and `research/raw/m045-console-panel.json disagrees with this head
  at <record>.contract.lineLabels: 16 entry(ies) -> 15 entry(ies) (re-capture with M045_CAPTURE=1 after naming what
  moved)`; restored to
  `f02f277c278fbc752c74e111cdfa0ddbc5cfdc88ff1276f1f8c02b9ea3aac291` (15520 B), `restored bytes equal the
  pre-mutation bytes: true`.
- **Idempotent in both directions.** Unarmed: `37 pass / 0 fail / 0 skipped`, recording `f02f277c…` before and
  after. Armed: `36 pass / 0 fail / 1 skipped` (the default-run read skips itself) and the same sha256, so it
  writes no byte; a second armed run the same, and the unarmed run after them still `37 pass / 0 fail`.
- **The limits, stated in the test instead of claimed away.** No recorded case renders the `case-difference`
  sentence and a test asserts that absence: the record's finding shape carries no `carriedCode`, so the pane
  cannot re-render that line from the recorded findings and a folded case cannot be recorded without widening that
  shape — T015's field, not this list's — and the label is exercised by the probe above. `no-title` and a `reason`
  the join was not written for are reached by two answers this suite writes itself, because the shipped digest
  states a title for all 64 codes it carries and the join states `no-digest-entry` for every code it lacks; the
  block comment says which reading covers each and that the reading is only these three, so a label the pane
  starts writing from a helper this suite does not call, on a branch no probe reaches, would be invisible to it.
- **Verify**, run exactly as the fence states, exit 0 at each stage: `node --test
  scripts/console-panel-record.test.mjs` → `tests 37 / suites 7 / pass 37 / fail 0 / cancelled 0 / skipped 0`
  (exit 0); `npm run check:panel` → `npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json` with no
  diagnostic (exit 0); `npx prettier --check scripts research/raw` → `Checking formatting...` / `All matched files
  use Prettier code style!` (exit 0).
- Files touched: `research/raw/m045-console-panel.json`
  `f02f277c278fbc752c74e111cdfa0ddbc5cfdc88ff1276f1f8c02b9ea3aac291` (15520 B) and
  `scripts/console-panel-record.test.mjs`
  `123f38f383581378b0d2fd4bc5938daf2de596f3be715e27c12e25d7c7a6c462` (108714 B) — the two this task declares —
  plus this Log, which the brief instructs to append. Read only and unchanged:
  `apps/angular-ai-devtools/src/app/panel-console.ts` `cd3dcc99…` (16976 B),
  `scripts/console-panel-render.test.mjs` `91e66824…` (86400 B), `research/raw/m045-console-shapes.json`
  `4d2b2103…` (39284 B), and `extension/console-join.js`, which carries another task's in-flight edit at this
  head (`da3ba82e…`, 11486 B) and was read, never written, here. No branch and no commit was made.

ready
