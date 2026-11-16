# Review — wave 2, cycle 2

Cycle: 2
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 85208150f3cbff73dbcd77eb9ad18a4bb2552628

## T002 — Refuse to choose an entry the message did not name: Join a captured diagnostic to the digest by code: pass

The frontmatter `title:` is quoted verbatim in the heading above; this cycle's question was whether the
join refuses to choose an entry the message did not name, at `85208150` and not as cycle 1 saw it. It does,
and the three prohibitions are now pinned by mutants that redden naming them (T008 for the first two, T015
for the third). The verdict is a pass with ten advisories, one of which is the same class of gap cycle 1
raised: the fold's "never a prefix, a substring or a fuzzy rule" (`extension/console-join.js:26-27`) is a
claim about equality that no test in the suite can distinguish from a prefix, substring or whitespace
trim — proved by construction in §4 below.

### 1. The contract as the module states it, and every rule a reader must hold

`consoleJoin(diagnostics, digest)` returns `{ state, findings[] }` and nothing else
(`extension/console-join.js:145-198`; the answer has exactly those two keys, `:737` in the suite).

**States, decided by the capture argument alone** (`:146-151`):

- `no-diagnostics` — the argument is not an array (`undefined`, `null`, `{}`, `'NG0100'`): no capture was
  read. `findings` is `[]`.
- `captured-nothing` — `[]`: a capture was read and carried zero events. Not a claim the page was silent,
  because `captureErrorPayload` swallows its own failures (`:2528-2530` of `agent-main.js`, quoted at
  `:35-40`). `findings` is `[]`.
- `joined` — any non-empty array, including `[undefined]` and a sparse `new Array(1)`: one finding per
  element, in capture order, including an unreadable element (probed: both yield one finding reading
  `" (this message carried no code)"`).

**Finding keys** (`:42-57`, `:156-195`): `text` always; `code` unless the message carried none; `title` only
where the digest states a string title for the matched entry; `reason` = `no-digest-entry` only where the
digest holds no entry for the code the message carried; `carriedCode` only where the digest's spelling
differs from the message's because the join matched them by folding case. No `body`, `cause`, `element`,
`remedy`, `component` or `count` key exists to render (`:52-53`; the suite allows exactly those five keys,
`scripts/console-join.test.mjs:755`).

**Rules a reader must hold:**

1. **Two inputs, read narrowly.** From a diagnostic only `code` and `message` (`:81-102`); from a digest entry
   only `code` and `title` (`:114-132`, `:169`). `component` is resolved from the focused element, not the
   call site, and `timestamp` orders nothing this join reports (`:11-13`); `body` is not rendered and 45 of
   the 64 bodies are untrimmed (`:15-16`).
2. **The entry is chosen by the code the capture wrote, never by text.** Exact spelling first (`:117-118`),
   then the same code folded (`:120-130`). The message text is never matched against a title or body (N2),
   and a code is never re-extracted from the text (`:18-20`, `:96-102`).
3. **`codeOf` trims** (`:100-101`): a blank, absent or non-string code is a message that carried none
   (`:94-95`), and a padded code is compared trimmed.
4. **The fold is a comparison and nothing else** (`:104-108`): `foldedSpan` is `toLowerCase()`, applied to
   both sides at `:127`; no code in `carriedCode`, in `code` or in a title is rewritten by it (`:104-105`).
5. **The first folded match wins** (`:120-130`): if the digest carried two spellings of one code, the entry
   it lists first is reported "rather than inventing a third" (`:111-113`).
6. **`foldedMatch` is what makes a difference stateable** (`:134-143`): the two spellings must differ **and**
   fold together, so an exact match carries no `carriedCode` and no difference is claimed, and an entry
   reached any other way cannot be reported as a folded match.
7. **`code` is the digest's spelling wherever an entry matched**, the message's otherwise (`:46-48`); a
   folded finding therefore prints the digest's spelling and puts the message's in `carriedCode` (`:175-180`).
8. **A folded match is a match**: it carries no `reason` (`:169-182`), so `reason` stays reserved for an
   absence (`:50-51`).
9. **The absence is named, never counted or blanked** (N4, `:50-53`, `:194`): the finding carries the code
   the message carried plus `reason: no-digest-entry`, and no `title` — a digest entry with a non-string
   title is a match with no title rather than a blank one (`:184-186`, probed).
10. **A message with no code is reported in `text`**, as the message plus ` (this message carried no code)`
    (`:44-45`, `:66`, `:160-163`) — the one place the join writes into the captured string.
11. **`entriesOf` is tolerant by design** (`:68-76`): a bare array of entries reads as the digest; anything
    else — `null`, a string, `{entries: 5}` — holds no entries, so every finding becomes an absence. There is
    no state for "no digest was read" the way there is for "no capture was read".
12. **No throw on a capture's own data**: a non-string message is converted with `String()` inside a `try`
    (`:87-91`), a `{toString: null}` message yields the empty string (pinned, `:648-658`), and frozen inputs
    are answered (probed). The `try` covers the conversion, not the property reads at `:84` and `:98` — see
    advisory (j).

### 2. The three prohibitions, by construction, each mutant restored

Each mutant was applied to `extension/console-join.js` by a runner that writes the pristine bytes back in a
`finally` block and re-hashes; the module held
`2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c` (10,332 B) **before the first mutant and
after the last**, and `restoredTo` was that same value after every one of the nine. Immediately after the run
`git status --porcelain` listed only the pre-existing untracked `.project/review/VERIFICATION.json` and
`git diff` was empty; a concurrent writer then added files under `.project/` (see the Environment note), and
none of the six product files this review read changed — every one still hashes to the value quoted here.

| Prohibition | Mutant applied | Armed sha256 | Suite | What reddens, and what the mutant actually answers |
| --- | --- | --- | --- | --- |
| Text must never choose an entry | `matchEntry(entries, code)` → `matchEntry` then a `text.includes(candidate.title)` fallback (`:164`) | `36ffb7c8d5d8a80db613a33c85cedc96d0c96a502df9eed9d7f2b82748f18c78` | 30 tests, 27 pass, **3 fail**, exit 1 | `text-fallback reddens naming "message text"`: `a join must never choose a digest entry by matching message text: the message carried NG04002, the digest lacks it, and the absence must be reported by name`. Observed: `NG04002` + text quoting NG0200's title gives `title: "Circular Dependency in DI"` instead of `reason: no-digest-entry`. |
| A code must never be re-extracted from text | `codeOf(diagnostic)` → `codeOf` then `text.match(/NG0\d{3,}/)` when it returned null (`:159`) | `3205ae573e744dd487001ff02f4f553d761aabe79193a3b6e28ec6f732f96904` | 30 tests, 28 pass, **2 fail**, exit 1 | `re-extracted-code reddens naming "re-extract"`: `a join must never re-extract a code from message text: the capture wrote no code, and joining one from the text is a second rule nobody measured`. Observed: `code: null` + text `bootstrap failed after NG0100` gives `code: "NG0100", title: "Expression Changed After Checked"` instead of no code. |
| Folding must never invent a match | `return null;` at the end of `matchEntry` → `return entries[0] \|\| null;` (`:131`) | `af30bad4a598ee80393eea89e0d8742bf60f34bd7f1d94b022f249186cc2ee6d` | 30 tests, 24 pass, **6 fail**, exit 1 | `fold-invents-a-match reddens naming "invents"`: `case-folded-match: folding invents no match — the absence still carries the reason it was not joined`; also `agrees with T001 on the digest…`: `the record's no-entry command must be the answer the join gives at this head`. Observed: `ng04002` gives `title: "Expression Changed After Checked"` instead of `code: "ng04002", reason: "no-digest-entry"`. |

On the shipped module all three hold for adversarial inputs: a message carrying `NG04002` whose text
concatenates **all 64 shipped titles** still answers `{"code":"NG04002","reason":"no-digest-entry"}`; a
message with no code whose text is that same concatenation answers with no code and no title; `null`, `''`
and `'   '` codes with `NG0100` in the text are never given one; `ng04002`, `NG04002` and `ng01003` all stay
`no-digest-entry`, named by the code the message carried.

### 3. The folded match against constructed digests

- **(a) Two distinct digest codes differing only in case.** With `[{NG0100,'UPPER-first'},{ng0100,'lower-second'}]`:
  `Ng0100` → `code NG0100, title UPPER-first, carriedCode Ng0100`; `NG0100` → the upper entry, no
  `carriedCode`; `ng0100` → the lower entry, no `carriedCode`. Reversing the list moves the answer for
  `Ng0100` to `lower-first`. So the fold is decided by **list order** for a spelling that matches neither
  entry, and the entry it did not choose is dropped without a line: a difference between two entries that
  the surface cannot state. The behaviour is the documented tie-break (`:111-113`), and it is unreachable in
  the shipped digest — measured: 64 entries, **64 unique codes, 64 unique folded codes, every code
  uppercase, none padded, none non-ASCII**, all entries `{body,code,title}` with string titles and no blank
  title.
- **(b) A code whose folded form matches a different entry's code.** For ASCII, folded equality *is* case
  equality, so the rule cannot reach a different name — verified by the fact that the shipped digest has no
  two spellings to confuse. Beyond ASCII it can: `NG0\u212A00` (KELVIN SIGN where `K` sits) folds to
  `ng0k00` and matches the entry coded `NG0K00`, answering `{"code":"NG0K00","title":"ASCII-K entry",
  "carriedCode":"NG0\u212A00"}`. The pane then writes *"the message carried NG0K00 and the digest carries
  NG0K00"* — a **case** difference asserted between two codes that differ by character identity, not by
  case. `toLowerCase()` is Unicode-aware, so folding is wider than "case" in the module's own wording
  (`:22-28`). The capture's `/NG0\d{3,}/` yields ASCII only, so no real capture can reach it; see advisory
  (c).
- **(c) An entry whose own code is already lowercase.** With `[{ng0100,'lower entry'}]`: `ng0100` is an exact
  match with no `carriedCode`; `NG0100` folds to `code ng0100, carriedCode NG0100`; `Ng0100` folds to
  `code ng0100, carriedCode Ng0100`. So the rule is symmetric — the digest's own case always wins and the
  message's spelling is carried — and it assumes nothing about the digest being uppercase.
- **A whitespace difference is neither a fold nor a statement.** `codeOf` trims, so `'  ng01002  '` answers
  `{"code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}` — the padding the message
  carried is gone from `carriedCode`, and `'  NG0100  '` answers with no `carriedCode` at all. Measured at
  this head. The contract's sentence "*`carriedCode` the spelling the message used*" (`:54-55`) is therefore
  true of the trimmed spelling only; see advisory (d).

### 4. The suite's counts, and what it would catch about a prefix or a trimming fold

`node --test scripts/console-join.test.mjs` at `85208150`: **tests 30, suites 9, pass 30, fail 0, cancelled
0, skipped 0, todo 0**, 163 ms. The fenced `## Verify` of T002 also holds verbatim: `node --check` exits 0
and `npx prettier --check extension/console-join.js scripts/console-join.test.mjs` reads "All matched files
use Prettier code style!". The record's two folded commands replay byte-identically at this head (c17 →
`{"state":"joined","findings":[{"text":"ng01002: Missing control value for the input","code":"NG01002",
"title":"Missing Control Value","carriedCode":"ng01002"}]}`, c18 → the `ng04002` absence), so the record is
a reading and not a restatement.

Six fold-shape mutants were built on the same line, `foldedSpan(entry.code) === folded` (`:127`), each with
a restored sha256 of `2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c`:

| Mutant | Armed sha256 | Suite | Verdict on the mutant |
| --- | --- | --- | --- |
| entry `startsWith(carried)` | `28c144d05732214d8e5f2ea2af5b4225fe7695995214386e2316e90882b6b40c` | 27 pass / 3 fail | **Survives every behavioural pin.** The three reds are the suite's own mutation loop failing on a vanished anchor (`mutation anchor not unique:         foldedSpan(entry.code) === folded`) — structural, not behavioural: `provenance`, `AC1/E6` and `AC2` all pass. Observable in principle on the shipped digest with a *proper* prefix: `ng010` → `NG0100`'s title and `ng050` → `NG0500`'s title, where the shipped join says `no-digest-entry`. No pin feeds such a code. |
| carried `startsWith(entry)` | `1c036c5ca13eea61d1fe46313eae96e0442be4ffd51d5bc3c7a9971e1d0f1667` | 25 pass / 5 fail | **Caught, behaviourally.** `the record's folded-code command must be the answer the join gives at this head` and `NG01002, not ng01002` both redden, because the shipped digest carries `NG0100 ⊂ NG01002`. Caught by data luck, not by a pin that states equality. |
| entry `includes(carried)` | `589623b7e8a24a1f21cce7bba92ba27f4ed8d726186f254db8d69ec5f7989ac4` | 27 pass / 3 fail | **Survives every behavioural pin** (the three reds are the same vanished anchor). The shipped digest has no code containing another, so the mutant is invisible; a constructed digest shows it (`0100` → `NG01002`'s title). |
| entry `.trim() === carried` | `c7a32cb1c837aa5cb293e27031af4e526a438567a23ff6a94530b6e254e1e75c` | 27 pass / 3 fail | **Survives every behavioural pin.** No digest code is padded, so trimming the entry changes nothing the suite feeds; a digest entry coded `" NG0100 "` is an absence at this head and a match under the mutant. |
| carried `.trim()` on the fold's right side | `e2bc49a09e47c2e6289e9c3f68b3282382fd16bc7fa0e94a5f7ee8624e7228c7` | 29 pass / 1 fail | **Survives every behavioural pin**; the single red is `mutation fold-invents-a-match must redden a pin naming "invents"`, an artefact — the in-memory edit of the already-edited line produces `true.trim()`, whose `TypeError` message does not contain `invents`. |
| both sides `.trim()` | `5e238492af7e03081fe113a77e4f63a95e21ed918304ae542b6027ee5090a91d` | 27 pass / 3 fail | **Survives every behavioural pin**; the three reds are the vanished anchor again. |

The restore value was identical after every mutant, before the fold table and after it
(`2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c`, 10,332 B).

So the honest answer to the question is: **the suite would not catch a fold that matched by prefix (in the
direction that extends a code), by substring, or by trimming whitespace.** It catches one prefix direction
only because `NG0100 ⊂ NG01002` happens to sit in the shipped digest, and it emits no pin whose subject is
"equality and nothing else". A reader who trusts `:26-27` is trusting prose — exactly the shape cycle 1
found for the text rule and T008 then pinned. See advisory (a).

### 5. `carriedCode` at the surface, and what is rendered

`carriedCode` is rendered where it should be: once, as its own labelled sentence, between the title (or the
no-title/no-entry sentence) and the captured text, and only where it differs from `code`
(`apps/angular-ai-devtools/src/app/panel-console.ts:260-261`, sentence at `:164-169`). The folded answer
renders, measured through the pane at this head:

```
state: joined
joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the capture's own order
code: NG01002
title: Missing Control Value
case-difference: the message carried ng01002 and the digest carries NG01002, so this finding carries the digest's own spelling and title
text: ng01002: Missing control value for the input
```

Nothing the join returns goes unrendered. All three states render a word and one sentence
(`panel-console.ts:282-303`); `text`, `code`, `title`, `reason` and `carriedCode` are the five keys
`findingLines` reads (`:241-270`), so an absence and a folded match each reach the row, and a `reason` the
pane was not written for is echoed rather than dropped (`:265-266`). A folded finding whose entry states no
title renders `code:` + `no-title:` + `case-difference:` + `text:` (probed).

One thing is rendered **without being stated as what it is**: the join's own ` (this message carried no
code)` note travels inside `text`, a line the pane documents as "*the captured text verbatim*"
(`panel-console.ts:29`) and as the capture's own word (`:44-45`). The tail of that row is

```
no-code: the captured message carried no code, so this finding carries no code and no title
text: the app failed (this message carried no code)
```

— the pane states the absence once in its own sentence and the join states it again inside a line
attributed to the page. Cycle-1 advisory (c), still open, now visible on the surface.

### Advisories

- **(a) The fold's "equality and nothing else" rule is a claim no test enforces.** Proved by construction in
  §4: prefix (one direction), substring and both trimming directions survive every behavioural pin, and the
  only reds they produce are the suite's anchor-uniqueness check. The shipped module is correct; the rule is
  unpinned, and it now carries the weight T015 gave it (`:26-28`). This is the same shape as the cycle-1
  advisory T008 was created to close, so a repair task should add two pins: a carried code that is a proper
  prefix of an entry's code (`ng010`) and a digest entry whose code is padded (`" NG0100 "`).
- **(b) The folded tie-break can mask a real difference between two entries.** Two distinct digest codes
  differing only in case collapse to the first listed, and the other title is dropped with no line (§3a).
  Documented at `:111-113` and unreachable in the shipped digest (64 unique folded codes, measured), but the
  join reads any array as a digest (`:70-76`), so a caller can produce it and no pin notices.
- **(c) The fold is Unicode `toLowerCase()`, not ASCII case.** `NG0\u212A00` matches the entry `NG0K00` and
  the pane states a *case* difference between two codes that differ by character identity (§3b). Unreachable
  from the capture's ASCII-only `/NG0\d{3,}/`; reachable for any other caller. Either the fold should be
  restricted to the code's own alphabet or the sentence should stop calling the difference "case".
- **(d) `codeOf` trims, so a whitespace difference is silently erased rather than stated.** `'  ng01002  '`
  yields `carriedCode: "ng01002"` and `'  NG0100  '` yields no `carriedCode`, so the contract's "*the
  spelling the message used*" (`:54-55`) is narrower than it reads (§3).
- **(e) A digest that was never handed over is indistinguishable from a digest that lacks every code.**
  `null`, `'nope'` and `{entries: 5}` all answer `no-digest-entry` for every finding (probed), so the pane
  states "*the digest carries no entry for NG0100*" — a claim about the digest — when no digest was read. The
  capture has two states for its two absences; the digest has none.
- **(f) The finding's key list has two versions, and the block a reader is pointed at is the stale one.**
  `research/raw/m045-console-shapes.json`'s `joinContract.finding` is `["text","code?","title?","reason?"]`
  and the `Interface contract` section of T002, T008 and T015 still reads `{ text, code?, title?, reason? }`,
  while the module returns a fifth key and the suite allows it
  (`scripts/console-join.test.mjs:755`). The record does state the addition in
  `caseFoldedMatch.supersedesNote`, so the two versions are reconcilable — but only by reading a second
  block.
- **(g) Cycle-1 advisory (b) persists: branches the suite cannot reach.** No test passes a bare-array digest,
  a digest without `entries`, a digest entry with a non-string `title` or `code`, or a `null` entry
  (`:70-76`, `:117-129`, `:184-192`). All four were probed by hand and behave sensibly; none is pinned.
- **(h) Cycle-1 advisory (d) persists: the T002 Log's "one lookup per code".** `matchEntry` is called once
  per diagnostic inside the loop at `:156` (call at `:164`), so two diagnostics sharing a code are two
  lookups against one entry — not "one lookup per code" (T002 Log, *Not anticipated by the plan*).
- **(i) The pane's `no-title:` sentence becomes ambiguous for a folded match.** Its subject is "the code this
  message carried" (`panel-console.ts:145-146`) while the row above prints the digest's spelling; a folded
  finding on a title-less entry renders `code: NG0100` then "*the digest carries the code this message
  carried*" for a message that carried `ng0100`. Unreachable in the shipped digest — all 64 titles are
  non-blank strings, measured — so this is prose debt, not a rendering defect.
- **(j) "Never throws on a capture" holds for plain data only.** The `try` in `textOf` wraps the conversion,
  not the property reads, so a diagnostic whose `message` or `code` getter throws makes the join throw
  (probed: `THREW Error: boom`), as does a proxy. `captureErrorPayload` builds a plain object, so no real
  capture reaches it.

### Adversarial test

Each claim was attacked rather than read. **Against the prohibitions:** the three mutants were built by hand,
run against the shipped suite, and the join's own answer under each was printed so the defect is observed and
not inferred — text choosing `Circular Dependency in DI` for a message carrying `NG04002`, a code invented
from `bootstrap failed after NG0100`, and `ng04002` borrowing `Expression Changed After Checked`. **Against
the fold:** six shapes (prefix both ways, substring, trim on either side or both) were built to try to make
the suite lie; five of them are invisible to every behavioural pin and the sixth is caught only because the
shipped digest happens to carry `NG0100 ⊂ NG01002` — which is why this is a pin gap and not a break. **Against
the contract:** every state, every key and every absence was fed a hostile input — all 64 titles in one message,
`undefined`, `''`, `'   '` and `42` codes, `[undefined]`, a sparse array, `{toString: null}`, frozen inputs, a
bare-array digest, a title-less entry, `null` entries — and the answers match the contract with the two
exceptions recorded as (e) and (j). **Against the record:** c17 and c18 were replayed verbatim at this head and
are byte-identical, and the record's two folded expectations are read back by the suite itself, so a stale
record reddens. **Against the tree:** every file was hashed before and after; the nine mutants each restored
`extension/console-join.js` to
`2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c` (10,332 B), and `git status --porcelain`
ends with only the pre-existing untracked `.project/review/VERIFICATION.json`.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ One finding per diagnostic, in capture order, never deduped (`:156-195`; the `deduped-findings` mutant
  reddens `two diagnostics sharing a code must yield two findings, in capture order`), and the diagnostic's
  own `text` is carried verbatim except for the no-code note (`:42-45`). No code is invented: the
  `re-extracted-code` and `invented-code` mutants both redden naming the rule, and a message with `null`,
  `''`, `'   '` or `42` as its code renders `no-code` with no code and no title (probed through the pane).
  Advisory (a) of cycle 1 — that invention from text was prose, not a pin — is closed: the re-extraction
  mutant fails at `scripts/console-join.test.mjs:330` naming "re-extract". Advisory (e) does not touch this
  criterion (it is about the digest side), and (f) is a documentation drift, not a behaviour.

### SC2 — A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture.: pass

- ✅ The suite reads the shipped file (`scripts/console-join.test.mjs:25-31`), asserts `version 22.2.x`, 64
  entries and 64 unique codes (`:441-447`), and takes every expected title from `shippedTitle` (`:63-66`), so
  no fixture can drift from the digest. The joined answer deep-equals `{text, code, title}` for an exact
  match (`:543-547`) and, since T015, `{text, code, title, carriedCode}` for a folded one (`:387-396`), with
  the record's c17/c18 answers read back as the join's own output (`:497-511`). Advisory (c) is the fold's
  one wide edge (non-ASCII) and (i) is prose debt in the pane; neither changes the answer for a code the
  capture can produce.

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: pass

- ✅ The absence is `{"code": "NG04002", "reason": "no-digest-entry"}` with no title and no count (`:584-588`),
  the count mutant reddens `a code the digest lacks must be reported by name, never as a count` (`:214`), and
  every finding value is a string (`:594-611`). A message that carried no code renders `no-code:` and no
  blank cell (probed). Folding does not soften this: `ng04002` stays an absence named by the code the message
  carried, under the pin and under the mutant that breaks it (§2, third row). Advisory (e) is the one respect
  in which this statement can be true of the join and false of the world — an unread digest renders as "the
  digest carries no entry" — which is a claim about the digest, and it is why it is filed as an advisory
  rather than a break of what SC3 asks the join to report.

## Environment note

Views were taken against HEAD `85208150f3cbff73dbcd77eb9ad18a4bb2552628` on branch `gsd-path/M057`. The six
product files this review read were hashed at the start and again at the end and are unchanged (values below).
`.project/` was written by another agent while this review ran: between the mutant run and the final status
read, `.project/plan/PLAN.md` gained a "Wave 11" section (+11 lines), and
`.project/tasks/T016-make-the-counts-a-measurement-at-a-commit-too.md` and `.project/review/wave-1.cycle4.md`
appeared — none of them written by this review, which wrote only this file. `git status --porcelain` therefore
ends with `M .project/plan/PLAN.md`, those two untracked files, the pre-existing untracked
`.project/review/VERIFICATION.json`, and `?? .project/review/wave-2.cycle2.md`. `git diff` touched nothing
outside `.project/plan/PLAN.md`; no product file differs from HEAD. Hashes at the end:
`extension/console-join.js` `2294c7eacd82de526be1e478fcf938c3f6962af4b18d99e9bd121f867709687c` (10,332 B) —
the same value T015's Log records; `scripts/console-join.test.mjs`
`de160238b5b7c0725e58fe16c9b200a3f2ea89d0231a904dcdc23e9b4bdd928d` (31,430 B);
`extension/error-digest.json` `426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35` (61,577 B);
`research/raw/m045-console-shapes.json` `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091`
(39,284 B); `apps/angular-ai-devtools/src/app/panel-console.ts`
`cd3dcc99ae49903715b17d44ee0f742fc11baa124d3f88a8f390779be5ca2dc4` (16,976 B);
`scripts/console-panel-render.test.mjs` `91e66824513cd86f11e0be507c11084bbfd2469275b42541cd0f269f75783246`
(86,400 B).
