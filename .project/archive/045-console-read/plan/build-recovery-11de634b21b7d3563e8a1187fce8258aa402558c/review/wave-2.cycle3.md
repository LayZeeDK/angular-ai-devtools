# Review — wave 2, cycle 3

Cycle: 3
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 1e84c49861b91f3e223b5655c23a6acbd842bc1b

## T002 — Join a captured diagnostic to the digest by code: pass

This cycle's question was whether cycle 2's headline gap is closed: five of six fold mutants survived every
behavioural pin, so the module's claim that "the fold is exact equality after lowercasing, never a prefix, a
substring or a fuzzy rule" was enforced by nothing. T018 (`209da9e7`) is the repair, and at
`1e84c498` the gap is closed for **every fold rule the join can exhibit and a test can observe**, and the
one rule that cannot be observed is stated as unobservable and *measured* to be so rather than claimed.
Four of the five survivors now redden a behavioural pin whose assertion message names the wrong rule it
caught; the fifth (trimming the carried side) is provably a no-op at this head, and the suite says so with
a pin that measures the two answers are identical. The product changed in exactly one place — the fold is
now `[A-Z]` case and nothing else — and the change is correct: an ASCII pair still folds and carries
`carriedCode`, a non-ASCII fold is refused as `no-digest-entry` with no `carriedCode`, and the test
measures that its input distinguishes refusal from acceptance. The case collapse is settled, deliberate in
both code and test, with its unreachability measured. Cycle 2's advisory (f) is the one advisory of ten
that neither T018 nor anything since touched: `carriedCode` is still absent from every `Interface contract`
copy and from the record's `joinContract.finding`, and the join's ` (this message carried no code)` note
still rides inside `text:` at the surface. That is documentation drift over a correct behaviour, so the
verdict is a pass with the advisories below.

### 1. The five surviving fold mutants, rebuilt

Each was applied to the shipped `extension/console-join.js` by a runner that writes the pristine bytes back
in a `finally` block, re-hashes, and then runs the real suite (`node --test scripts/console-join.test.mjs`)
against the armed file, so every failure below is a real assertion in
`scripts/console-join.test.mjs`, not this review's guess. Failures were attributed per test block, which is
what separates a **behavioural** red (an assertion about the join's answer, message quoting the rule) from
the suite's own **anchor** machinery (`mutation anchor not unique:         foldedSpan(entry.code) === folded`).

| Mutant (cycle 2's name) | Armed sha256 / bytes | Suite | Behavioural pin that reddens, and the message naming the rule |
| --- | --- | --- | --- |
| entry is a prefix of the carried code (`foldedSpan(entry.code).startsWith(folded)`) | `dff6557f5b5544e47e7935a6221f73d70b322ca89254e44fa06ad8651981d7ef`, 11,494 B | 36 tests, **27 pass / 9 fail**, exit 1 | `scripts/console-join.test.mjs:962` (AC1/E6, *yields one finding naming the shipped digest title*) and `:1259` (the mutant's own pin, run against the armed module) → `the fold is equality and never a prefix: ng010 is a proper prefix of NG0100, and the join must not borrow that entry's title` |
| entry contains the carried code (`…includes(folded)`) | `b5fc9d31c696e8406cc7e6af510146e5505f3cb7b0cafc3ca77102df3145293a`, 11,492 B | 36 / **26 pass / 10 fail**, exit 1 | `:1259` → `the fold is equality and never a substring: 010 sits inside NG0100, and the join must not borrow that entry's title`. AC1/E6's `:962` reddens on the *prefix* pin first (`ng010` is a substring match too), and AC2's `:1016` reddens on the trim pin (`' ng0100 '.includes('ng0100')`) — collateral, but all three messages are behavioural |
| the entry is trimmed (`…trim() === folded`) | `35627e2f1617c1a574e9ba29a9a7c2976b40070472dad1d01afd669df92af70f`, 11,493 B | 36 / **27 pass / 9 fail**, exit 1 | `:1016` (AC2, *names NG04002 with the reason and no title*) and `:1259` → `the fold is equality and never a trim: a digest entry whose code is padded with whitespace is not the entry NG0100 names, and trimming the entry must not make it one` |
| both sides trimmed (`…trim() === folded.trim()`) | `66db28ec000bf14705f2ef7777152131b880551fe2cc240466e1951196c586a9`, 11,500 B | 36 / **27 pass / 9 fail**, exit 1 | the same two sites, the same trim message — the entry side is what makes it observable, as the mutant's comment says |
| carried side trimmed (`… === folded.trim()`) | `a227e2fb1eb27e21ebbfedceec9b93d96349bb2b0b709ff68a9b9c4c3a019ee7`, 11,493 B | 36 / **33 pass / 3 fail**, exit 1 | **no behavioural red, by design.** All 20 non-mutant tests pass; the three reds are the suite's mutation machinery (`mutation fold-invents-a-match must redden a pin naming "invents"`, and the same for `fold-entry-prefix` / `fold-entry-substring`), because the edit overlaps the other mutants' anchors. See §4 — this is the honest answer the task asked for, not a survivor |

Each mutant's answer was printed beside the shipped answer, so a green pin could not be mistaken for a
correct one:

- `ng010` on the shipped digest: `{"text":"ng010: prefix probe","code":"ng010","reason":"no-digest-entry"}`.
  Under the prefix mutant: `{"code":"ng010","title":"Expression Changed After Checked"}` — a wrong join.
- `010`: shipped → `reason":"no-digest-entry"`; substring mutant → `title":"Expression Changed After Checked"`.
- `NG0100` against a digest stating `" NG0100 "`: shipped → `code":"NG0100","reason":"no-digest-entry"`;
  entry-trim and both-trim mutants → `title":"space-padded entry"`.
- `  ng01002  `: shipped and carried-trim mutant both answer
  `{"code":"NG01002","title":"Missing Control Value","carriedCode":"ng01002"}` — identical.

My rebuilds reproduce T018's recorded armed sha256 values exactly (`dff6557f…`, `b5fc9d31…`,
`35627e2f…`, `66db28ec…`), which independently corroborates the Log's table rather than trusting it. The
two pins T018 added for the properties cycle 2 found *silent* were armed the same way and are behavioural
too:

| Mutant | Armed sha256 | Suite | Behavioural pin, and its message |
| --- | --- | --- | --- |
| folded loop counted backwards (`fold-last-listed`) | `ba0653d6a86c1619a846caf11f332608d7277c5cd5548cd0bc769ee44215405f` | 36 / 33 pass / 3 fail | `:962` and `:1259` → `case-collapse (deliberate): two digest codes differing only in case collapse to the first listed, so the digest spelling reported is NG0100` |
| `foldedSpan` back to `toLowerCase()` (`fold-beyond-ascii`) | `f9867656e1f382745262e6af4979062d35f80433514f7bbebe13840e63937732` | 36 / 33 pass / 3 fail | `:962` and `:1259` → `the fold is refused beyond ASCII case, never made and then reported as a case difference: U+212A KELVIN SIGN is a different character from the ASCII letter K, …` |

The prefix and substring inputs are measured before they are asserted (`:554-558`, `:591-596`): the pin
first proves `ng010` is a *proper* prefix of `NG0100` and that `010` sits inside it without being a prefix,
so a digest change that removed the difference would redden the measurement rather than let the pin pass
for the wrong reason. I re-measured both against the shipped digest: `ng050` is likewise a proper prefix of
`NG0500`, and `010` is contained by `NG0100`, `NG01002` and `NG01055` and is a prefix of none.

### 2. The product change: ASCII folds, everything else is refused

`extension/console-join.js:116-118` is now
`return code.replace(/[A-Z]/g, (letter) => letter.toLowerCase());`, and the header (`:30-35`) states why:
`toLowerCase()` is Unicode-aware, so U+212A KELVIN SIGN would be called a case spelling of `k`, and the
surface would state a *case* difference between two characters that are not a case pair. Measured at this
head, through the module:

- ASCII pair folds and reports the difference: `ng0k00` against an entry coded `NG0K00` →
  `{"text":"ascii case","code":"NG0K00","title":"ASCII-K entry","carriedCode":"ng0k00"}`.
- Exact spelling claims no difference: `NG0K00` → `{"code":"NG0K00","title":"ASCII-K entry"}`, no `carriedCode`.
- Non-ASCII fold is refused as an absence, named by the code the message carried:
  `NG0\u212A00` → `{"text":"kelvin","code":"NG0\u212A00","reason":"no-digest-entry"}` — no `title`, no
  `carriedCode`, no `count`.
- The input really distinguishes the two rules: `'NG0\u212A00'.toLowerCase() === 'ng0k00'` is `true`
  (so a Unicode fold accepts), the module's own fold leaves it as `ng0\u212a00` (so the module refuses), and
  `KELVIN_CARRIED !== 'NG0K00'`. The pin asserts all three (`scripts/console-join.test.mjs:738-743`) and
  then asserts both halves of the behaviour (`:744-779`), including
  `!('carriedCode' in finding)`.

The change is not a regression in any direction I could find: a lowercase digest entry still folds
symmetricly (`ng0100` → exact, no `carriedCode`; `NG0100` and `Ng0100` → `code ng0100` with
`carriedCode`), because `[A-Z]`-only folding leaves a lowercase entry untouched and lowers the carried
spelling. Its one consequence beyond the pin is that an entry whose *own* code contains a non-ASCII letter
can no longer be reached by case folding (`ng0100é` does not join `NG0100É`) — unreachable in the shipped
digest (measured: 0 of 64 codes carry a non-ASCII byte) and consistent with the stated rule, so it is a
consequence rather than a defect.

### 3. The case collapse: settled, deliberated, and measured

Two digest codes differing only in case still collapse to the first listed, and this is now stated in
three places, which is what settles it:

- **The module** (`extension/console-join.js:120-126`): "the entry it did not choose is dropped,
  deliberately and without a line, because the answer has no field for a difference between two entries".
- **The test** (`pinStatesTheCaseCollapseIsDeliberate`, `:674-732`), where every assertion message begins
  `case-collapse (deliberate):` and the pin states the rule from both sides: `Ng0100` → `code NG0100,
  title 'uppercase spelling, listed first', carriedCode 'Ng0100'`; reversing the list moves the answer to
  `code ng0100, title 'lowercase spelling, listed second'` (so it is list order, not a case preference);
  `/listed second/` is refused anywhere in the finding; and an exact spelling of either entry matches
  itself with no `carriedCode`.
- **The unreachability, measured rather than asserted** (`:859-871`): 64 entries, 64 distinct codes, 64
  distinct folded forms, and every code matching `/^[A-Z0-9]+$/`, so no shipped pair can reach the
  tie-break and no shipped code needs a fold wider than ASCII case.

I re-measured all four numbers: 64 / 64 / 64 / true. One precision worth recording: the distinctness check
uses `code.toLowerCase()` (`:861`) while the module's fold is `[A-Z]`-only — the two agree on these codes
*because* the same test asserts `/^[A-Z0-9]+$/`, and the suite already has the exact function
(`foldedLike`, `:143-145`) it could have used. It is sound here; see advisory (l).

### 4. The carried-trim limitation: verified, and it is a proof, not a shrug

The task's claim is that trimming the carried code inside the fold cannot be distinguished at this head,
because `codeOf` trims before the fold reads it (`extension/console-join.js:103-109`, single call site at
`:172`). I checked the claim rather than accepting it, three ways:

1. **The call graph.** `foldedSpan` is reached only from `matchEntry` (`:133`) and `foldedMatch` (`:154`),
   both called with `code` from `codeOf`, and `codeOf` returns `code.trim()` or `null`. The namespace the
   module publishes is `consoleJoin, JOINED, CAPTURED_NOTHING, NO_DIAGNOSTICS, NO_DIGEST_ENTRY` — three
   state constants, the reason constant and the join — so no caller can hand the fold an untrimmed code.
2. **The algebra, over every code point.** `trim()` is idempotent, and `foldedSpan` maps `[A-Z]` to `[a-z]`
   and every other character to itself, so it can neither introduce nor remove an edge character that
   `trim()` would strip. Measured exhaustively: of the 1,114,087 code points that are themselves
   trim-fixed, **zero** satisfy `foldedSpan(c).trim() !== foldedSpan(c)`; the 25 code points `trim()`
   removes (U+0009, U+000A, U+000B, U+000C, U+000D, U+0020, U+00A0, U+1680, U+2000-U+200A, U+2028,
   U+2029, U+202F, U+205F, U+3000, U+FEFF) are all rejected by `codeOf` before the fold sees them.
3. **The answers.** 9,720 receivable probes — nine pad strings on each side (empty, space, two spaces,
   tab, LF, CRLF, NBSP, ideographic space, line separator), so 81 padding combinations, around 20 cores
   (`NG0100`, `ng0100`, `Ng0100`, `NG01002`,
   `ng01002`, `ng010`, `010`, `NG04002`, `ng04002`, the Kelvin code, `NG0K00`, `ng0k00`, `NG0500`, `ng050`,
   a zero-width space, the empty string, a doubled code, an inner-NBSP code, a bare Kelvin sign, `K`)
   against 6 digests (shipped, padded-entry, two-spellings, Kelvin, bare array, `{entries: 5}`) — **0**
   differ between the shipped module and the carried-trim mutant. Inner whitespace does not help either
   (`NG 0100` with a padded digest: identical), because `trim()` never touches the middle of a string.

**So no receivable input can distinguish it**, and the reason is a property of `codeOf` + `foldedSpan`, not
of the shipped digest. The suite's pin is honest about the shape of the claim and better than a comment: it
asserts `deepEqual(probe(trimMutant), probe(api))` over five probes *and* pins the contract's own answer
beside it (`'  ng01002  '` → `carriedCode 'ng01002'`, `'  NG0100  '` → exact match with no `carriedCode`).
Because it is an equality of answers, it becomes a discriminating pin the moment `codeOf` stops trimming —
the limit is dated to this head without being a licence.

One caveat on the mutant's construction, which is fragile but harmless here: `CARRIED_TRIM_MUTATION`'s
anchor (`        foldedSpan(entry.code) === folded`) is a *prefix* of the mutated line, so `mutant()` still
finds exactly one occurrence when the file already carries the mutant and produces `… === folded.trim().trim()`;
that is why the armed run's reds land in other mutants' machinery (`true.trim is not a function`), not in
this pin. See advisory (k).

### 5. The other advisories

Cycle 2's ten, re-checked in order, with what closed and what did not:

- **(a) "Equality and nothing else" was a claim no test enforced — CLOSED for every observable rule.** See
  §1: prefix, substring, entry-trim and both-trim each redden a behavioural pin whose message names the
  rule; carried-trim is provably unobservable and is stated as such (§4).
- **(b) The folded tie-break could mask a difference between two entries — CLOSED as far as a pin can.**
  Deliberate in code and test, tie-break asserted from both sides, unreachability measured (§3).
- **(c) The fold was Unicode `toLowerCase()`, not ASCII case — CLOSED, in the product.** §2.
- **(d) `codeOf` trims, so a whitespace difference is erased rather than stated — open, narrowed.** The
  behaviour is unchanged and now *pinned*: `'  ng01002  '` → `carriedCode "ng01002"`, and the test's own
  message says "the padding the message carried is not part of the spelling, so it is not carried beside
  the digest code" (`:826`). What is still open is the module's prose: `:61-62` still calls `carriedCode`
  "the spelling the message used", which is true of the trimmed spelling only — the same sentence cycle 2
  flagged. Nothing in the module states the trim as part of what `carriedCode` means; the test and
  T018's Log do.
- **(e) A digest that was never handed over is indistinguishable from one that lacks every code — open,
  unchanged.** Probed: `null`, `undefined`, `'nope'` and `{entries: 5}` each answer
  `{"code":"NG0100","reason":"no-digest-entry"}`. The pane therefore states a claim about the digest when
  none was read.
- **(f) The finding's key list has two versions, and the block a reader is pointed at is the stale one —
  OPEN, and this is the one advisory nothing has touched.** The `Interface contract` section of **T002's own
  task file** (`.project/tasks/T002-…:45`) still reads `each finding is { text, code?, title?, reason? }`,
  and so does every later copy of that section (T008, T015, T018 `:50`, T019 `:64` — T018's own Log
  describes a `carriedCode` field its own contract block does not list). The record:
  `research/raw/m045-console-shapes.json`'s `joinContract.finding` is still
  `["text","code?","title?","reason?"]`, reconcilable only through `caseFoldedMatch.supersedesNote`
  ("since T015 a folded match additionally carries carriedCode, and the quote is left as it was written").
  `carriedCode` is otherwise in the record only as measured answer data (`provenance.commands` c17, and
  `caseFoldedMatch.matched`, whose `finding` field is a prose sentence rather than a shape). T017 went the
  other way: `console-panel-record.test.mjs:2386` records in a comment that "the record's finding shape
  carries no `carriedCode`", and pins the consequence — no recorded case renders the `case-difference`
  sentence (`:2389-2397`). So the module, the suite (`:1214`) and the pane allow five keys while every
  contract block and the shapes record allow four.
- **(g) Branches the suite cannot reach — open, unchanged.** Still no test feeds a bare-array digest, a
  digest entry that is `null`, a non-string `title`, or a non-string `code`. I probed all four: bare array
  and `null` entry behave (the `null` is skipped and the later entry found), a non-string title yields
  `{text, code}` with no blank, and a non-string entry code is simply not a folded match.
- **(h) The T002 Log's "one lookup per code" — open, unchanged.** T002's Log still says "The join performs
  one lookup per code"; `matchEntry` is called once per diagnostic (`:177`), so two diagnostics sharing a
  code are two lookups of one entry. Probed: two findings, two lookups.
- **(i) The pane's `no-title:` sentence is ambiguous for a folded match — open, prose debt.**
  `panel-console.ts` (HEAD) `:195` still says "the digest carries the code this message carried" while the
  `code:` line above it prints the digest's spelling. Unreachable in the shipped digest (all 64 titles are
  non-blank strings).
- **(j) "Never throws on a capture" holds for plain data only — open, unchanged.** Probed: a throwing
  `message` getter, a throwing `code` getter and a throwing proxy each make `consoleJoin` throw
  (`boom-message`, `boom-code`, `boom-proxy`), because `textOf`'s `try` covers `String()`, not the property
  read at `:91`, and `codeOf` has no `try` at all. `captureErrorPayload` builds a plain object.

New, and all minor:

- **(k) The carried-trim pin's mutant reuses an anchor that survives its own mutation** (§4, last
  paragraph). Harmless at this head, but it means the armed file's failure list is dominated by other
  mutants' `TypeError`s rather than by this pin's absence of a red. An anchor that cannot match its own
  replacement would make the armed run read as "this pin sees nothing", which is the claim being made.
- **(l) The unreachability of the case collapse is measured with `toLowerCase()`, not the module's fold**
  (`:861`, against `foldedLike` at `:143-145`). Correct here only because the same test asserts every code
  is `/^[A-Z0-9]+$/`; using the module's fold function would make the measurement self-evidently about the
  module's rule rather than a wider one.
- **(m) T018's Log overstates one exit code.** It says the carried-trim mutant, applied to the file,
  "leaves 20 of 20 behavioural tests passing, exit 0". The 20 behavioural tests do pass — but the file-level
  run is **33 pass / 3 fail, exit 1**, and the three reds are the suite's mutation machinery. The clause is
  right about the behavioural count and wrong if read as the run's verdict, which is how a later reader
  would check it.
- **(n) Pin order inside the AC tests masks pins.** `pinRefusesAPrefixRule` is called first in AC1/E6
  (`:992`), so under the substring mutant that test reports the *prefix* message and the substring pin is
  never reached there; substring's own message appears only from the mutant loop's pre-check. Nothing is
  unenforced, but a reader of the failure list alone would think the substring pin never fired.

### 6. The suite, and the restores

`node --test scripts/console-join.test.mjs` at `1e84c498`: **tests 36, suites 9, pass 36, fail 0,
cancelled 0, skipped 0, todo 0**, exit 0 (the duration line varies per run and is not quoted).
`node --check extension/console-join.js` exits 0. The suite's shape is 22 `it(` declarations in 9 `describe`
groups (counted at this head) over 15 mutations plus the structural test, so 36 tests — and
`research/raw/m057-verdict-claims.json` states `tests: 22, groups: 9` for this suite, which is what T018
claimed its pins preserved by being named functions rather than new declarations.

`extension/console-join.js` held
`da3ba82ee5a2f7c227c7ffc76314678ccd5677017c2d01c70659e808c592e6a0` (11,486 B) before the first of the
seven armed runs and after every one of them (`restored sha … equals before: true`, printed per mutant),
and again after the last. `git diff` touches no product file; the join, the suite, the digest and T001's
record each hash to the value `git show HEAD:<path>` produces:

- `extension/console-join.js` `da3ba82ee5a2f7c227c7ffc76314678ccd5677017c2d01c70659e808c592e6a0` (11,486 B)
- `scripts/console-join.test.mjs` `b5d48507cfaee06929907e22a3bb66d5031c0efe84b2acf65071518443813b59` (53,087 B)
- `extension/error-digest.json` `426a5be1f4e344c87e4b70817ac10da3de0f9c8a172325e704b3235953a01c35` (61,577 B)
- `research/raw/m045-console-shapes.json` `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091` (39,284 B)
- `apps/angular-ai-devtools/src/app/panel-console.ts` (HEAD copy)
  `ec28dfcbfba0d227bed0b7314c1552b301d2c4bc5fcdf090cd376263407ba5c4` (21,901 B)

### Adversarial test

Every claim above was attacked rather than read. **Against the headline gap:** the five surviving mutants
were rebuilt from cycle 2's descriptions, two of them twice (once for counts, once for per-test
attribution), and four now redden a pin whose *message* names the rule; I refused to count the fifth as
closed and instead proved it unobservable over 1.11 M code points and 9,720 answers. The two new pins
(last-listed, beyond-ASCII) were armed too, so "T018 added pins" is a measurement, not a quotation of
T018's table — and my armed shas reproduce T018's exactly. **Against the product change:** instead of
reading the diff, the working module was driven with the ASCII pair, the exact spelling and the Kelvin
code, and the Kelvin code was shown to fold onto the entry under `toLowerCase()` and not under the
module's fold; the refusal was checked for the three things it must *not* carry (title, `carriedCode`,
count). **Against the case collapse:** the tie-break was moved by reversing the list, an exact spelling of
each entry was checked, and the shipped digest's unreachability was recounted (64/64/64, all
`/^[A-Z0-9]+$/`). **Against the carried-trim claim:** three independent arguments (call graph, exhaustive
character algebra, 9,720-answer fuzz), and the search for a receivable input that could distinguish it came
back empty, with the reason stated. **Against the advisories:** all ten were re-probed instead of
inherited, and two that cycle 2 could only infer (g, j) were executed. **Against the tree:** the join was
hashed before and after all seven armed runs, and every file this review read was re-hashed against
`git show HEAD:` at the end.

## Intent coverage

### SC1 — The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none.: pass

- ✅ One finding per diagnostic in capture order, never deduped (`:169-207`; the `deduped-findings`
  mutant reddens `two diagnostics sharing a code must yield two findings, in capture order`), the captured
  message carried verbatim (`:184`, `:189`), and a message that carried no code reported as such with no
  `code`, no `title` and no invented code (`invented-code` and `re-extracted-code` both redden naming the
  rule; `null`, `''`, `'   '` and `42` all render `no-code`). Cycle 3 adds nothing here but removes a way
  the *code the message carried* could have been answered for silently: `ng010` and `010` are now proven
  to be absences named by the carried code, not borrowings of another entry's title (§1). Advisory (f) is
  a contract-drift issue about which keys a finding may have, not about this criterion's report.

### SC2 — A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture.: pass

- ✅ Every expected title comes from the shipped file via `shippedTitle` (`scripts/console-join.test.mjs:113-116`),
  the provenance test asserts `version 22.2.x`, 64 entries and 64 unique codes (`:850-871`), and the exact
  match deep-equals `{text, code, title}` while the folded match deep-equals
  `{text, code, title, carriedCode}` (`:968-985`, `:499-508`). E6's rule survives the product change: the
  ASCII fold still joins and carries the message's spelling, and the non-ASCII fold is refused rather than
  reported as a *case* difference (§2), which is the only respect in which this criterion could have been
  satisfied by a false sentence. The record's c17/c18 answers are read back as the join's own output
  (`:910-936`), so a stale record reddens.

### SC3 — A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy.: pass

- ✅ The absence is `{"code":"NG04002","reason":"no-digest-entry"}` with no title and no count
  (`:1016-1031`), the count mutant reddens `a code the digest lacks must be reported by name, never as a
  count`, every finding value is a string (`:1033-1050`), and a padded digest entry is an absence named by
  the carried code rather than a silent match (§1, entry-trim row). The non-ASCII refusal adds a third
  shape of the same rule: a code no fold can reach is `no-digest-entry` named by the code the message
  carried, never a title borrowed across a character difference (§2). Advisory (e) remains the one respect
  in which the sentence can be true of the join and false of the world — an unread digest renders as "the
  digest carries no entry" — and it is unchanged by this cycle.

## Environment note

Views are against HEAD `1e84c49861b91f3e223b5655c23a6acbd842bc1b` on branch `gsd-path/M057`. Another agent
was writing in this worktree while I reviewed: at one read `apps/angular-ai-devtools/src/app/panel-console.ts`
carried an in-flight mutant (`id: 'no-code'` on the `no-title` sentence; an earlier read briefly showed the
`state-joined` sentence with "and to fix this, edit the binding" appended), and at another read
`research/raw/m045-console-panel.json` differed from HEAD (`c19d6818…` in the tree). Both files were back at
HEAD at one read and one line ahead of it at the next, so another agent is cycling mutants through them for
the whole of this review; the hashes I report for them are `git show HEAD:` values, not tree values. **I
wrote none of those bytes** and restored none of them; every pane reference
above is quoted from `git show HEAD:apps/angular-ai-devtools/src/app/panel-console.ts`, not from the working
tree, and the five join-side files I read hash to their HEAD values (§6). The only file this review wrote is
this one, and the only file it mutated — transiently, seven times, with the pristine bytes written back in
a `finally` — is `extension/console-join.js`, which hashes to
`da3ba82ee5a2f7c227c7ffc76314678ccd5677017c2d01c70659e808c592e6a0` (11,486 B) both before and after.
