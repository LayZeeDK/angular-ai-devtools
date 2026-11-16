---
id: T019
title: Make the pane's own sentences an enumerated registry
wave: 12
deps:
  - T015
status: done
agent: build_T019
base: ca94fc82f39ec1b92d4248d94639d414b394504b
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-console.ts
  - scripts/console-panel-render.test.mjs
  - scripts/console-panel-record.test.mjs
  - research/raw/m045-console-panel.json
---

# T019 — Make the pane's own sentences an enumerated registry

## Context

Wave 3's cycle-4 review attacked the absence-statement rule and four sentences evaded it, each blessed into the
recording by an armed capture and then read back green:

- `the capture reflects the page's silence` — the possessive escapes the page-word list, and the verb is decided by `capture`
- `no diagnostic was reported` — the participle reads as a read action
- `this is never a claim that the page was silent, and it rendered nothing` — the pronoun stands because `rendered` is a pane verb
- `the capture was not empty before the page ran clean` — any earlier denial is taken to govern the page word

The controls `no diagnostic was emitted` and `nothing was emitted` are still refused, so the rule is not dead — it
is a closed subject/verb list decided by the first matching token, not a property of meaning. It also lost
something the older lexicon had: `the digest states the page's silence`, where `silence` is the object of a read
verb, is now unpoliced.

Three successive repairs to this classifier have each opened the hole the next review found. The bet that a
sentence classifier can be made sound by patching is the thing to stop making.

## Approach

- Enumerate: every sentence the pane writes for itself becomes an entry in one registry in
  `apps/angular-ai-devtools/src/app/panel-console.ts` — the state sentences, the named absences, the
  case-difference sentence — each with an id and its exact text.
- The pane renders from the registry and from nothing else: a pane-written line must be a labelled fact drawn
  from the answer, or an entry of the registry. Anything else is refused.
- The tests pin the registry against the rendered output in both directions: every registry entry is reachable
  and rendered where it belongs, and no rendered pane-written line is outside the registry. A new sentence then
  requires a deliberate edit that a reviewer sees, rather than a wording that slips past a matcher.
- Keep the absence rule as a secondary check over the registry's own text, so a registry entry that claims what
  the page did still reddens; do not rely on it to catch wording it has not seen.
- Carry the registry into the record's contract, so the recording cannot bless a sentence the pane does not
  write.

## Acceptance criteria

1. Every pane-written sentence comes from one registry in the module, and a rendered pane-written line that is not a registry entry reddens a test naming the line.
2. Each of the four evasions from the review is refused by construction: it cannot be rendered without adding a registry entry, and adding one reddens the registry pins until the record carries it too.
3. The two controls the review found still refused, and the twelve shipped sentences that must pass, still pass.
4. The registry's ids and texts are carried in the record's contract, and the record suite fails when the pane's registry and the record's copy disagree in either direction.
5. `the digest states the page's silence` — the regression the classifier introduced — is refused or is impossible to render, and the test says which.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC5

## Verify

```bash
node --test scripts/console-panel-render.test.mjs scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check apps/angular-ai-devtools/src/app scripts research/raw
```

## Log

- Task written at the fifth repair cycle; not started.
- **The registry.** `apps/angular-ai-devtools/src/app/panel-console.ts` now enumerates every sentence it
  writes for itself in one exported `PANE_SENTENCES`: ten entries, each `{ id, text, slots, state }`,
  with the line's label read off the entry's own text rather than kept in a second field. The ids are
  `state-joined`, `state-captured-nothing`, `state-no-diagnostics`, `no-console-answer`, `no-finding`,
  `no-code`, `no-title`, `unreadable-finding`, `no-digest-entry` (slot `{code}`) and `case-difference`
  (slots `{carriedCode}`, `{digestCode}`). `STATE_TEXTS`, `NO_ANSWER_TEXT`, `NO_FINDING_TEXT`,
  `NO_CODE_TEXT`, `NO_TITLE_TEXT`, `UNREADABLE_FINDING_TEXT`, `noDigestEntryText()` and
  `caseFoldedMatchText()` are now derived from it, and `consolePanel`/`findingLines` render those and
  nothing else: the only sentences in the module's own body are the five labelled facts of the answer
  (`state:`, `code:`, `title:`, `text:`, `reason:`). A `sentenceText(id, values)` renders one entry with
  its slots and throws on an unknown id or an unfilled slot, so a hole can never reach a line.
- **The pins, both directions** (`scripts/console-panel-render.test.mjs`, all called from existing
  `it(...)` bodies — no declaration was added, so the 17 tests / 3 groups `m057-verdict-claims.json`
  states are unchanged): `pinTheRegistryIsWellFormed` (one entry per id, a labelled text, every slot a
  hole the text states, the three state sentences keyed to the join's three states in its order),
  `pinEveryRegistryEntryRenders` (each entry's filled text is rendered by an answer in `PANE_ANSWERS`,
  a state sentence only on its own state's surface), `pinNoRenderedLineIsOutsideTheRegistry` (every
  rendered pane-written line is a labelled fact the answer carried or an entry of the registry, the
  failure naming the line), `pinOnlyTheRegistryWritesSentences` (reads the module's source with its
  comments and the registry block cut out: any other string opening a `label: ` line reddens naming the
  label, so a registry sentence copied into the body is caught even where the rendered-output pin would
  accept it), and `pinTheRegistryIsTheRecords` (the record's `contract.sentenceRegistry`, both ways).
  `pinNoModuleSentenceClaimsSilence` was rewritten to iterate the registry, so the absence rule is now
  a secondary check over the registry's own text — it bites on an entry no answer renders, which is the
  case the surface pins cannot see.
- **The record carries the registry.** `research/raw/m045-console-panel.json` gained
  `contract.sentenceRegistry` (67 added lines; no case, finding or rendered line moved) and the record
  suite holds it with `pinTheSentenceRegistryIsThePanes` — the same shape as `contract.lineLabels`: an
  entry the pane states and the record lacks, an entry the record carries and the pane does not write,
  and an entry whose `text` / `slots` / `state` moved on one side all redden naming the entry and the
  field — plus `pinRecordedLinesAreRegistrySentences`, which holds the recording's own bytes (every
  pane-written recorded line is a stated fact or a registry entry with its slots filled from the
  recorded findings).
- **The four evasions, refused by construction, measured not claimed.** `pinTheReviewEvasionsAreRefused`
  takes each of the review's four sentences and measures both halves on a mutant copy: (a) rendered as a
  literal beside the state sentence, `pinNoRenderedLineIsOutsideTheRegistry` reddens naming the line
  (`renders-from-the-registry: the "joined" surface rendered the line "no-diagnostics: the capture
  reflects the page's silence" …`) and the source pin reddens naming the label; (b) registered as the
  `no-diagnostics` text, the record's copy reddens (`sentence-registry: the record's copy of
  "state-no-diagnostics" states the text "no-diagnostics: no capture was handed to the join at all, so
  no capture was read", and the pane states "no-diagnostics: the capture reflects the page's silence" …`).
  Each of the four now: `the capture reflects the page's silence` — cannot be rendered without an entry,
  and an entry reddens until the record carries it; `no diagnostic was reported` — same; `this is never a
  claim that the page was silent, and it rendered nothing` — same; `the capture was not empty before the
  page ran clean` — same. The rule's reach is measured beside each (`absenceBreaches` returns none of the
  four), so the test says the enumeration refuses them and the matcher does not. The record suite refuses
  all four on its own side, and refuses a *blessed* recorded surface carrying one of them
  (`renders-from-the-registry: no-diagnostics surface line 1 is "…", and that line is neither a labelled
  fact the recorded answer states nor one of the sentences the record's contract.sentenceRegistry
  carries`).
- **`the digest states the page's silence` is settled as *impossible to render*, not as refused by the
  rule**, and `pinTheDigestSilenceSentenceIsSettled` says so in words and measures it: the absence rule
  passes it (`digest` is both a read subject and a read action, `page's` is not a word the rule carries —
  asserted as an empty breach list, so a later widening reddens the settlement), a literal render is
  refused naming the line, and registering it is refused by the record's copy. So it needs a deliberate
  change to two files and cannot slip past a matcher. The two controls the review found still refused
  (`no diagnostic was emitted`, `nothing was emitted`) are now asserted refused in
  `pinThePhraseListMissedNothing`, and the twelve shipped sentences still pass
  (`pinShippedAbsenceSentencesPass`).
- **Mutants armed, restored, hashed.** The suite's own mutants are anchored edits of a copy in the run's
  temp directory; twelve of the existing ones were re-anchored onto the registry's text lines
  (`no-code-as-count`, the three `captured-nothing` ones, `joined-page-had-nothing-to-say`, the four
  `no-diagnostics` ones, `no-console-answer-claims-silence`, `case-difference-dropped`, and the record
  suite's `remedy-spelled-fix`), and two new ones were added: `sentence-inlined-beside-the-registry`
  (`renders-from-the-registry: the pane writes the sentence labelled "joined" in its own body …`) and
  `registry-entry-claims-the-page` (`absence-statement: the a-sentence-nothing-renders sentence … it names
  the page ("page") outside a denial; it rendered "the page logged nothing, so nothing was reported"`).
  Every one of the 23 render mutants and 3 record mutants reddens by name on a green run. Probes against
  the real files, each restored from the bytes read, sha256 equal before and after:
  `apps/…/panel-console.ts` `ec28dfcb…` → inline the joined sentence (`ac7a5d02…`, render exit 1, 23 pass /
  16 fail), an entry claiming the page (`1e489834…`, exit 1, 33/6), the possessive evasion rendered
  (`7b50a218…`, exit 1, 33/6), the pronoun evasion registered (`6c1932b3…`, record exit 1, 31/6), an entry
  the record lacks (`ff02af02…`, exit 1, 35/2), the digest sentence registered (`a8ed32e5…`, exit 1,
  31/6) — all restored to `ec28dfcb…`; `research/raw/m045-console-panel.json` `fb962d70…` → the possessive
  evasion written into the recorded case (`63587327…`, record exit 1, 35 pass / 2 fail, naming the line),
  and into both the case and the registry's copy as an armed re-capture would (`a29e6704…`, exit 1,
  33/4, `sentence-registry: the record's copy of "state-no-diagnostics" states the text "no-diagnostics:
  the capture reflects the page's silence", and the pane states …`) — both restored to `fb962d70…`.
- **The recording is idempotent in both directions.** Armed once, `research/raw/m045-console-panel.json`
  moved `f02f277c…` → `fb962d70…` (15,520 B → 17,962 B) on the one added `contract.sentenceRegistry`
  block; a second armed run wrote no byte (`fb962d70…` before and after, 36 pass / 1 skipped), and a
  default run reads it (76 pass, 0 skipped).
- **Verify (`## Verify`, run exactly):** `node --test scripts/console-panel-render.test.mjs
  scripts/console-panel-record.test.mjs && npm run check:panel && npx prettier --check
  apps/angular-ai-devtools/src/app scripts research/raw` → exit 0; `ℹ tests 76` / `ℹ suites 10` /
  `ℹ pass 76` / `ℹ fail 0` / `ℹ cancelled 0` / `ℹ skipped 0`; `npm run check:panel` printed only its own
  notices (`tsc -p apps/angular-ai-devtools/tsconfig.check.json`, no diagnostic); `Checking formatting...`
  then `All matched files use Prettier code style!`.
- Files touched: `apps/angular-ai-devtools/src/app/panel-console.ts`
  `ec28dfcbfba0d227bed0b7314c1552b301d2c4bc5fcdf090cd376263407ba5c4` (21,901 B);
  `scripts/console-panel-render.test.mjs`
  `445f309fb6500b3ff54e2635398d0bef804efff2061c080b85fe660eb95ba0f8` (117,534 B);
  `scripts/console-panel-record.test.mjs`
  `f7ca4e582399ff5cc0c73e25c35c3fbdfa8d40079c91a13e950d07740349fef0` (129,611 B);
  `research/raw/m045-console-panel.json`
  `fb962d704d0b3d94f292bd590486b9638373ee21894e2fea2da90ccc30c6023a` (17,962 B) — the four the task
  declares, and no other file; no branch was created and nothing was committed.
- Verdict: ready.
