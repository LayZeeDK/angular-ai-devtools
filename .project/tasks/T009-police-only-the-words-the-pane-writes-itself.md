---
id: T009
title: Police only the words the pane writes itself
wave: 7
deps:
  - T007
status: done
agent: build_T009
base: dcd1775be4fdc42c545e609b06d4a62eaf047e7a
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-panel.json
  - .project/tasks/T007-pin-e7-on-every-state-and-name-the-state-the-pane-was-given.md
---

# T009 — Police only the words the pane writes itself

## Context

Wave 5's cycle-2 review failed the repair, and the reason is the mirror of what it fixed: the
recording pin now refuses a *correct* pane. `contract.prohibitedWording` is applied to every recorded line,
so the digest's own titles are policed — and eight of the 64 shipped titles contain one of those words.
`NG0910`'s "Component ID generation collision" is refused with "carries \"component\", and the contract
states that the pane renders no \"component\"", which contradicts SC2 (render the digest's title) and SC5's
own "unattributed" qualifier. Matching is by substring, so `because` is redundant under `cause`, and `fix`
and `count` would fire on "prefix" and "account".

Wave 3's cycle-2 review found the neighbouring hole: the "never that the page was silent" rule is scoped to
`captured-nothing`, so replacing the `no-diagnostics` sentence with a silence claim leaves the render pins
green. That is wave 3's cycle-1 finding one state over.

Residual provenance, from wave 5's cycle-2 review: `cases[].input` and `cases[].why` are fixture constants
while the record's sentence says the cases are derived, and `scripts/console-panel-record.test.mjs:61` still
carries the old "every value … is derived" wording.

## Approach

- - Apply the prohibited words only to lines the pane writes itself — the state sentence and the absence
  sentences. A `title:` value is the digest's word and a `text:` value is the capture's; neither is the
  pane's attribution, so neither is policed by this list.
- Match on word boundaries, and drop the words subsumed by a more general one, so a capture saying
  "because" passes while a pane-written "because" fails.
- Extend the silence rule from `captured-nothing` to every absence state the pane renders.
- Say in the record which values are fixture constants, and correct the stale sentence at
  `scripts/console-panel-record.test.mjs:61` and in the suite header.
- Pin the positive case as tightly as the negative one: a pane that renders `NG0910`'s title and a captured
  message containing "because" must pass, and that must be asserted rather than assumed.

## Acceptance criteria

1. A pane that renders NG0910's digest title and a captured message containing the word "because" passes, proven by running the recording suite against them.
2. A pane-written sentence containing a cause, an element, a remedy or an unattributed angular wording reddens in every absence state, naming the state and the word.
3. A `title:` or `text:` value containing "prefix" or "account" is not refused, so the matching is by word and not by substring.
4. A silence claim in any absence state — not only `captured-nothing` — reddens a pin that names the state.
5. The record states which of its values are fixture constants, and no carried sentence claims everything is derived.
6. Each negative rule is armed by a mutant that reddens naming its defect; the positive case is armed by a mutant that removes the exemption and reddens.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts research/raw
```

## Log

- Task written at the second repair cycle; not started.
- Head and scope. Work done at `516b2450` (branch `gsd-path/M057`), no branch created and no commit made. The five declared files are the only ones edited, plus this Log and the correction appended to T007's Log (both declared, T007's explicitly).
- The defect, restated. `contract.prohibitedWording` was applied to every recorded line with `line.includes(word)`, so it refused a correct pane: eight of the 64 shipped titles carry one of the listed words, and this head's `NG0910` is titled "Unsafe bindings on an element" (note: the review's "Component ID generation collision" is `NG0912`'s title at this head; `NG0910`'s own title states "element"). Substring matching also made `because` redundant under `cause` while `fix` would fire on "prefix" and `count` on "account".
- Fix 1, only the pane's own lines are policed — `scripts/console-panel-record.test.mjs`: `CARRIED_FIELDS = ['text', 'code', 'title', 'reason']` (`:155`) names the four values that are the answer's words (the capture's text and code, the digest's title, the join's reason), and `pinRecordsOnlyTheContractVocabulary` (`:711`) now takes that set as its third parameter and skips a line whose label is in it (`:756`). Every other line — the `state:` line, the three state sentences and the six named absences — is policed. The label rule that refuses a `cause:` line is untouched, so an armed re-capture still cannot bless one.
- Fix 2, words and not substrings — `prohibitedPattern` (`:688`) builds one regular expression per entry: `\b` on both sides, the entry's own inflections matched with it (`wordForms`, `:671`), and a phrase entry (`due to`) matched as a phrase. `escaped` (`:662`) quotes the entry. The list itself (`:138`) keeps `cause`, `because`, `due to`, `element`, `component`, `remedy`, `angular`, `count` and drops `fix`, which `remedy` generalises — a fix is a remedy, and that is the word the record's own `contract.rendered` states. Proof, asserted in the suite (`:1295-1357`): `prohibitedPattern('fix')` does not fire on "the prefix of the message", `prohibitedPattern('count')` does not fire on "an account of the message", `prohibitedPattern('cause')` does not fire on "a message saying because", and each of the three does fire on its own word; `caused by`, `elements` and `due  to` are the word.
- Fix 3, the positive case proven — a new recorded case `digest-title-and-captured-wording` (`research/raw/m045-console-panel.json:193-227`), fixture `TITLED` (`scripts/console-panel-record.test.mjs:205`), and the test at `:1132`. It asserts the shipped digest's own title for `NG0910` states "element" (so the case is not vacuous), that the pane renders that title and the captured "because" verbatim, and that `pinRecordsOnlyTheContractVocabulary` passes on those recorded bytes. The pane's rendering, printed by the run: `["state: joined","joined: the capture held at least one diagnostic, …","code: NG0910","title: Unsafe bindings on an element","text: NG0910: unsanitized HTML was stripped because the binding bypassed the sanitizer"]`.
- The same positive case in the render suite — `scripts/console-panel-render.test.mjs`: `CARRIED_FIELDS` (`:239`) and `paneWrittenLines` (`:242`) split a surface into the answer's fields and the pane's own lines; `pinNoCauseElementRemedy` (`:422`) and `pinNoUnattributedAngularWording` (`:465`) read only the latter, so a `title:` carrying "element" and a `text:` carrying "because" pass. Asserted at `:899-946` on a real join over the shipped digest, and both exemptions then armed: with `carried = []` the same correct pane reddens naming the captured "because", with `carried = ['text']` it reddens naming the digest's "element".
- Fix 4, the silence rule on every absence state — `assertNoSilenceClaim` (`:534`) now says `silence-claim:` instead of `captured-nothing-silence:`, and two pins reach every state: `pinNoAbsenceClaimsSilence` (`:554`) reads every line the pane writes itself on a surface and is called from `pinE7OnEveryState` (`:496`), so `joined`, `captured-nothing`, `no-diagnostics` and a given word are all covered; `pinNoModuleSentenceClaimsSilence` (`:565`) reads the module's nine sentences — the three states and `no-console-answer`, `no-finding`, `no-code`, `no-title`, `unreadable-finding`, `no-digest-entry` — and is called from the E7/SC4 case (`:820`) and the reconciliation case (`:933`). Both new mutants name the sentence they were written in: `no-diagnostics-claims-silence` (`:1304`) and `no-console-answer-claims-silence` (`:1328`). `pinCapturedNothingNeverClaimsSilence` (`:591`) keeps its own two rules (the sentence says what was read; it is read whole, not by its prefix).
- Fix 5, residual provenance — `research/raw/m045-console-panel.json` now says which values are constants: `capture.reproduces` (`:60`) states that every `cases[].input` and every `cases[].why` is a fixture constant, not a value read from the tree, and a new `fixture.caseInputs` (`:77`) says the same in the fixture block. The stale sentence "the sources every value in it is derived from" is gone from `scripts/console-panel-record.test.mjs:76-81`, and the suite header (`:1-20`) and `derive`'s docblock (`:318-327`) say it too. `apps/angular-ai-devtools/src/app/panel-console.ts:38-45` states the same rule for the surface: whose word each line is, and that no sentence the pane writes claims the page was silent.
- Mutants, each quoted from its own run (all in-memory or temp-dir copies, so no checkout file is mutated; see the one in-place probe below):
  - `absence-as-count` → `named-absence: the pane must state the absence in one sentence naming the code the message carried (NG04002) — a count is not a name; it rendered ["no-digest-entry: 1 code the digest does not carry"]`
  - `captured-nothing-as-empty-list` → `captured-nothing: the pane renders that statement, never an empty list; it rendered []`
  - the wave-5 `cause:`-line probe → `recorded-vocabulary: joined surface line 10 is labelled "cause", which the record's contract does not carry; it records "cause: the application modified a bound value during change detection"`
  - a pane-written "because" (new, `:1295`) → `recorded-vocabulary: no-diagnostics surface line 1 is policed as the pane's own "no-diagnostics" line and carries "because", and the contract states that the pane renders no "because"; it records "no-diagnostics: no capture was handed to the join at all because none was made" (matched the word "because" as a whole word)`
  - the exemption removed in the record pin (new) → `recorded-vocabulary: digest-title-and-captured-wording surface line 3 is policed as the pane's own "title" line and carries "element", and the contract states that the pane renders no "element"; it records "title: Unsafe bindings on an element" (matched the word "element" as a whole word)`
  - the exemption removed in the render pin, two arms (new) → `no-cause-element-remedy: the joined surface must render no cause — none of its own lines names one; … (matched /\bbecause\b/i)` and `no-cause-element-remedy: the joined surface must render no element — none of its own lines names one; … (matched /\belement\b/i)`
  - `no-diagnostics-claims-silence` (new) → `silence-claim: the no-diagnostics surface never claims the page was silent — a capture whose own attempt failed emits nothing too, so an absence states what was read and not that the page was silent; it rendered "no-diagnostics: the page was silent, so no capture was handed to the join at all" (claimed "silent")`
  - `no-console-answer-claims-silence` (new) → `silence-claim: the no-console-answer sentence never claims the page was silent … it rendered "no-console-answer: the page logged nothing, so no console join answer was handed over" (claimed "the page logged nothing")`
  - the seventeen mutants the two suites already carried still redden with the messages their `names` patterns require (the render suite's mutant loop now yields 16 cases, the record suite's two), so no existing rule was weakened to make room for these.
- One in-place probe, because the vocabulary pin must bite on a real file and not only in memory: `'no-diagnostics: … so no capture was read'` was edited in `apps/angular-ai-devtools/src/app/panel-console.ts` to append `' because no capture was ever made'` — the render suite failed 11 of 32 at exit 1 (`no-cause-element-remedy: the no-diagnostics surface must render no cause — none of its own lines names one; it rendered ["state: no-diagnostics","no-diagnostics: no capture was handed to the join at all, so no capture was read because no capture was ever made"] (matched /\bbecause\b/i)`) and the record suite failed 2 of 27 at exit 1 (`no-diagnostics: the pane must render the lines the record states; it rendered [… "… because no capture was ever made"]`). Restored: sha256 `36235d2a2b56958144579c3671c42176328b9109086518e002c689b9670a004f`, 13546 B, identical to the pre-mutant value, and both suites green again.
- The recording is byte-stable: `research/raw/m045-console-panel.json` sha256 `a1d98cecf2f7f21407bf33ea7dc7e0214443c22717dd70ea2c6de3ccf2c3f1f6`, 11501 B. An armed run (`set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs`) wrote it once from the new `derive`; a second armed run moved no value (`ℹ pass 26`, `1 skipped`, same sha256), and the unarmed run reads it (`27 pass, 0 fail`).
- What moved in the record, exactly: `contract.prohibitedWording` (nine entries, `fix` dropped, order per the list), `capture.reproduces`, the new `fixture.caseInputs`, and one added case between `shared-code` and `captured-nothing`. Every other recorded byte — every `surface.line` and `surface.text` of the four older cases — is unchanged, so this repair rewrote no rendered evidence.
- Declaration counts: `scripts/console-panel-render.test.mjs` is deliberately still 17 `it(` / 3 `describe(` (32 runtime tests; the mutant loop is one declaration and now yields 16 cases), because `research/raw/m057-verdict-claims.json` records that count and the record suite re-counts it (`cites suites, and the counts it states are the counts those suites carry` is green). `scripts/console-panel-record.test.mjs` is 22 `test(` / 5 `describe(` (27 runtime), up from 20/5 because the positive case and the wording probes are new tests; nothing else counts that suite. The new pins went into existing `it(` bodies wherever they could, so the render suite's count did not move.
- Commands, exit code in brackets:
  - [0] the fenced `## Verify`, run exactly as its one line: `node --test scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts research/raw` → `ℹ tests 59 ℹ pass 59 ℹ fail 0`; `check:panel` printed only its `npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json` header and no diagnostic; prettier printed `Checking formatting...` / `All matched files use Prettier code style!`; `VERIFY_EXIT=0`.
  - [0] `node --test scripts/console-panel-record.test.mjs` unarmed → `27 pass, 0 fail`; [0] `set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs` → `26 pass, 0 fail, 1 skipped` (the default-run byte pin skips itself), twice, the second with no byte written.
  - [0] `node --test scripts/console-panel-render.test.mjs` → `32 pass, 0 fail`.
  - [1] the in-place pane mutant, both suites, quoted above; [1] an earlier run of the fenced Verify whose prettier stage flagged `scripts/gate-integrity.mjs` alone — `[warn] scripts/gate-integrity.mjs` / `Code style issues found in 1 file` — which is T011's in-flight edit in this shared worktree (sha256 `c5e54ef6…` at the time, not this task's file); it was formatted by its own task before the final run above, and the final run is clean.
- Files touched outside the five declared ones: none. `git status --porcelain` also names `.project/tasks/T001-…md`, `.project/tasks/T010-…md`, `research/raw/m045-console-shapes.json`, `research/raw/m056-gate-stability.json` and `scripts/gate-integrity.mjs`; none is this task's work — they appeared in the shared worktree while this task ran (other coders' in-flight edits), and this task's diffs are only its five files plus the two Logs named in the brief.
- Verdict: the prohibited-word list now polices only the lines the pane writes itself, matched as whole words with their own inflections; a pane rendering `NG0910`'s digest title and a captured "because" passes and that is asserted, while a pane-written "because" still reddens naming the state, the line and the word; a silence claim reddens in `no-diagnostics` and in the `no-console-answer` sentence, not only in `captured-nothing`; the record says which of its values are fixture constants; each rule and each exemption is armed by a mutant that reddens naming its defect; and the fenced Verify exits 0.
ready
