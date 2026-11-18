---
id: T002
title: Explain the declared strings against a digest and report what it cannot
wave: 2
status: done
deps: [T001]
agent: build_T002
base: d6abae60ce4b855885077b3a85d1176a6d6813ee
worktree: null
task_branch: null
files:
  - extension/copy-digest.json
  - extension/copy-check.js
  - scripts/copy-check.test.mjs
  - research/raw/m048-surface-copy.json
---

# T002 — Explain the declared strings against a digest and report what it cannot

## Context

T001 records the copy each surface declares. This task authors the digest of sanctioned strings and
the pure join that explains one against the other, reporting every string the digest does not
explain rather than passing it as clean. A missing digest or a surface with no strings is
`cannot-tell` with a reason from a closed set, never a clean result.

## Approach

Author `extension/copy-digest.json` from T001's measured list: one entry per sanctioned string, each
carrying the surface that renders it. Build `extension/copy-check.js` exporting
`copyCheck(surfaces, digest)`, returning `{state, unexplained, checked, reason}`. Extend
`scripts/copy-check.test.mjs`: pin the untouched module first, then mutate it four ways — a digest
entry removed, a match by similarity rather than by text, an invented row, and a missing digest
reported as clean. Each mutant must redden with the defect named by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`copyCheck(surfaces, digest)` receives a surfaces record (the shape T001 measured) and a digest
object, and returns `{ state, unexplained, checked, reason }`. `state` is one of `clean`,
`unexplained`, `cannot-tell`; `unexplained` is an array of `{ string, surface }`; `checked` is the
number of strings compared; `reason` is present only when `state` is `cannot-tell` and is one of a
closed set. No other file implements this function, and no caller reads the page to decide what the
copy says.

## Files

  - extension/copy-digest.json
  - extension/copy-check.js
  - scripts/copy-check.test.mjs
  - research/raw/m048-surface-copy.json

## Acceptance criteria

1. `copyCheck` returns `clean` when every declared string has a digest entry, `unexplained` naming each string the digest lacks with its surface, and `cannot-tell` with a closed reason when either side is missing.
2. Held-out E4: a surface with strings but no digest yields `cannot-tell`, and the same suite asserts the `unexplained` case beside it, so "nothing to compare" cannot collapse into "nothing wrong".
3. The suite pins the untouched module, and each of the four mutants reddens naming the defect by string.
4. Checking the same record and digest twice returns identical rows in identical order.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npx prettier --check extension/copy-check.js extension/copy-digest.json scripts/copy-check.test.mjs
```

## Log

- pending.
- Authored `extension/copy-digest.json` from T001's record and nothing else: 113 rows, one per sentence
  `research/raw/m048-surface-copy.json` carries — the 79 `sentence-in-registry`/`sentence-from-constant`
  entries plus the 34 inline entries of kind `sentence`. Each row is `{ surface, key, text }`: the
  surface id the record gives, the key the sentence is declared under, and `null` for the 34 inline
  sentences, which are declared under no key at all. 18,558 bytes against the record's 118,599, so it
  is a digest of the sanctioned strings and not the corpus: no citations, no `lineText`, no notes.
- Authored `extension/copy-check.js` as a classic extension script publishing
  `globalThis.angularAiCopyCheck` (the shape `console-join.js` uses), exporting `copyCheck(surfaces,
  digest) -> { state, unexplained, checked, reason }` plus `explainedTexts`, the closed `STATES` and
  `REASONS` lists, the scope boundary `SCOPE`, and the not-digested decision `NOT_DIGESTED` /
  `NOT_DIGESTED_REASONS`. The match is membership by `===` in the set of the digest's own texts: no
  trim, no case fold, no apostrophe normalisation, no prefix/substring/similarity, per N1.
- `REASONS` is `['no-surfaces', 'no-digest', 'surface-declares-nothing']`, ordered by what the
  comparison runs out of, frozen, exported for the surface in T003 to render verbatim. An entry-less
  digest is the same answer as an absent one (`no-digest`): nothing to compare is never clean.
- Scope decision recorded as data in the module and pinned by count: `SCOPE` reads the declared
  sentence kinds and inline `sentence`, and reads past `label-from-constant`,
  `word-from-constant`, `fragment-from-constant`, inline `label` and inline `word` — 79 + 34 read,
  3 + 8 + 111 + 7 = 129 read past, which are exactly T001's `counts`. Those literals are the prefix a
  line is built from and the value substituted into it, never a string a surface renders whole.
- `panel-sanitizer.ts:180` pluraliser recorded as data, not as a comment: `NOT_DIGESTED` carries
  `{ surface: 'sanitizer', text: "${count} ${noun}${count === 1 ? '' : 's'}", reason:
  'composed-at-render' }`, the reason is one of the frozen `NOT_DIGESTED_REASONS`, and the suite
  asserts the record really carries that string, that the digest holds no row for it, that the join
  reports no row for it, and that T001's note calls :180 a pluraliser.
- Against the shipped record the join answers `cannot-tell` (`surface-declares-nothing`) with 113
  sentences compared and 0 unexplained, because `panel-context.ts` renders no copy: the record's own
  answer is not clean and cannot be, and the 18 copy-bearing surfaces are clean one by one (9, 11, 7,
  15, 14, 6, 6, 2, 7, 2, 3, 3, 3, 3, 3, 6, 11, 2 sentences). So the digest explains all 113 sentences
  T001 recorded and leaves none unexplained; what it does not explain is the 129 labels and value
  words the scope reads past and the pluraliser it records.
- Extended `scripts/copy-check.test.mjs`: T001's ten tests untouched, plus twelve join tests.
  Held-out E4 is one test that asserts both halves — a surface with strings and no digest (undefined,
  null, `{}`, `{entries: []}`, an entry with no text) answers `cannot-tell`/`no-digest` with
  `checked: 0`, and the same surface beside a digest that lacks one of its strings answers
  `unexplained` naming that string and its surface. E6 asserted: the same record and digest twice
  answer byte-identical rows in record order, and neither input is written.
- Four mutants, each armed as one anchor/replacement on the module's bytes in memory (the checkout is
  never written), each pin green on the untouched module first, each failure naming the defect by
  string — printed by the suite:
  - `digest-entry-dropped` → `every sentence the copy-bearing surfaces declare is in the digest, and
    the answer is "unexplained" naming "listed: the record names these components, and every row below
    is one the record carries" (components) as unexplained`;
  - `similarity-match` → `a sentence is explained by the digest's own text and never by similarity,
    and this near-miss was explained: "filtered: the typed text kept the rows below, and the count
    states how many rows match" (components)`;
  - `invented-row` → `an invented row is not an explanation, and this module explains "cannot tell: no
    panel copy can be named", which no surface in the record renders`;
  - `missing-digest-reported-clean` → `a surface with strings and no digest reports cannot-tell with
    the reason "no-digest", because nobody compared the strings; this reported "clean"`.
- Verify: `node --test scripts/copy-check.test.mjs` → 22 tests, 22 pass, 0 fail (T001's ten plus
  twelve), then `npx prettier --check` on the three files → "All matched files use Prettier code
  style!". `npx tsc -p extension/tsconfig.json` also ran clean, so the new extension file does not
  redden `npm run check:extension`; `scripts/component-search.test.mjs` and
  `extension/manifest.test.mjs` still pass beside it (22/22). Nothing committed.
- Fixed the record-level precedence. `copyCheck` now decides the record in the contract's order: a
  missing or entry-less digest is `cannot-tell`/`no-digest` before anything is compared; zero strings
  compared is `cannot-tell`/`surface-declares-nothing`; any string the digest does not explain is
  `unexplained`; otherwise `clean`. The per-surface decision is one function, `surfaceRow`, and the
  record's answer is read off those rows — `checked` is their sum, `unexplained` their concatenation
  in record order, `state` the first case that holds — so a surface that renders no copy is a row and
  never the record's verdict. No field was added: the answer is still `{state, unexplained, checked,
  reason}` and `reason` still only on `cannot-tell`. `no-surfaces` stays in the closed `REASONS` set
  as the name for a caller that handed over no record at all; the order answers that case as
  `surface-declares-nothing` (zero strings compared), so the word is no longer returned by any
  answer, and the comment beside `REASONS` says so. That is the one place I would raise a
  reservation rather than a defect: step 2 makes an empty record and a record of one copy-less
  surface the same answer, which retires a published reason. Implemented as written, since T003
  renders this contract.
- Against the shipped record and digest the answer is now `clean`, `checked: 113`,
  `unexplained: []`, no reason; `context` is still `cannot-tell`/`surface-declares-nothing` in its
  own row (checked 0). Per-surface rows now: components 9, console 11, console-read 7, stability 15,
  error-boundary 14, fields 6, navigation 6, performance 2, render-phase 7, linked-state 2, lint 3,
  router 3, resource 3, onpush 3, legacy 3, redirect 6, sanitizer 11, panel-demo 2 sentences, all
  clean; context cannot-tell.
- Suite: 26 tests (was 22). Two record-level tests changed. The record test now asserts
  `clean`/113/`[]`/no reason and reads `context`'s row beside it (`cannot-tell`,
  `surface-declares-nothing`, 0). E6 now asserts the stale-digest record is `unexplained` — the rows
  still asserted byte-identical in record order — rather than `cannot-tell`. Four precedence pins
  added: (1) the whole record with `undefined`, `null`, `{}` or `{entries: []}` as the digest is
  `cannot-tell`/`no-digest` with `checked: 0`, so the copy-less surface does not steal the reason;
  (2) zero strings compared — only `context`, `[]`, and no surface list at all — is
  `cannot-tell`/`surface-declares-nothing` with `checked: 0` and `unexplained: []`; (3) dropping
  `state-listed` from the digest on the whole record is `unexplained` naming exactly
  `[{string, surface: 'components'}]`, with `context` still in the record and `checked: 113`; (4) the
  fully explained record is `clean` with 113 compared, and the rows are checked one by one — the 18
  copy-bearing rows `clean`, `context`'s row `cannot-tell`/`surface-declares-nothing`/0 — with the
  record's `checked` asserted equal to its rows' sum and its `unexplained` equal to their
  concatenation.
- Mutants: all four kept, with their `defect` and `names` strings, and all four still red:
  `digest-entry-dropped` → `unexplained` naming `listed: the record names these components…`;
  `similarity-match` → `how many rows match` explained; `invented-row` → `cannot tell: no panel copy
  can be named`; `missing-digest-reported-clean` → `no-digest`. The precedence moved one anchor: the
  comparison moved into `surfaceRow` one level out of the record loop, so `similarity-match` now
  anchors on `      if (!explained.has(text))` (six spaces, not eight). The other three anchors are
  byte-identical to before.
- `extension/copy-digest.json` unchanged: the record-level answer now explains all 113 sentences
  with 0 unexplained, so the precedence exposed no error in it.
- Verify: `node --test scripts/copy-check.test.mjs` → 26 tests, 26 pass, 0 fail, then
  `npx prettier --check` on the three files → "All matched files use Prettier code style!".
  `npx tsc -p extension/tsconfig.json` also ran clean. Nothing committed.
- Landed paths: `extension/copy-digest.json`, `extension/copy-check.js`, `scripts/copy-check.test.mjs`, `research/raw/m048-surface-copy.json` — each is read from this tree, ready.

- **The record-level state is decided by precedence, ruled mid-task.** The join first answered
  the whole record `cannot-tell`/`surface-declares-nothing` whenever any surface rendered no copy,
  which made `clean` unreachable for every page because `panel-context.ts` renders none — a state
  that no input can produce is not a state. The order is now: a missing digest is
  `cannot-tell`/`no-digest`; zero strings compared is `cannot-tell`/`surface-declares-nothing`; any
  unexplained string is `unexplained`; otherwise `clean`. An absent surface keeps `cannot-tell` in
  its own row and does not decide the record, so the measured record answers `clean` with 113
  checked while `context`'s row still states its absence. `no-surfaces` was removed from the closed
  reason set: precedence makes it unreachable. This supersedes the contract sentence in the body
  above, which could not be edited after activation.
