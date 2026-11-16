---
id: T012
title: Restore the word the list dropped
wave: 8
deps:
  - T009
status: done
agent: build_T012
base: 933c23d65d0e2b09096dec27fe231d9adbe58ef0
worktree: null
task_branch: null
files:
  - scripts/console-panel-record.test.mjs
  - scripts/console-panel-render.test.mjs
  - research/raw/m045-console-panel.json
---

# T012 — Restore the word the list dropped

## Context

Wave 5's cycle-3 review failed T009 for following its brief too literally. The brief said to drop words
"subsumed by a more general one", and `fix` was dropped because `remedy` is more general. They are not the
same word in a sentence. A pane whose own joined sentence reads "..., and to fix this, edit the binding" is
blessed by an armed re-capture and then passes both suites — 27 of 27 and 32 of 32 — with a remedy sentence
sitting in the recording. At `2fa589b9` the same line was refused.

The fix is in the list, not in the matching: word-boundary matching is what clears "prefix", and it never
required deleting `fix`. The same question applies to every other word the list carries, so the repair
should re-examine them rather than restore one and leave the rest unexamined.

## Approach

- - Restore `fix` as a prohibited word, matched whole, so "prefix" and "affix" pass and "to fix this" does
  not.
- Re-examine the remaining entries the same way: for each, ask whether a pane could state the thing in a
  word the list does not carry, and either add the word or record why the list is sufficient.
- Prove both directions: a pane-written "to fix this, edit the binding" reddens naming the line, and a
  pane-written "an account of the prefix is not given" passes.
- Keep the exemption for carried values intact, and re-confirm that emptying it still reddens.

## Acceptance criteria

1. A pane-written sentence containing the word "fix" reddens a pin that names the state, the line and the word.
2. A pane-written sentence containing "prefix" or "account" passes, so the matching is by word and not by substring.
3. Every remaining prohibited word is either shown to catch a demonstrably bad sentence, or replaced by one that does, and the reasoning is recorded in the task Log.
4. The carried-value exemption still holds: a recorded digest title and captured text may contain those words and pass, and emptying the exemption reddens a named test.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs && npx prettier --check scripts research/raw
```

## Log

- Task written at the third repair cycle; not started.
- Head and scope. Work done at `628bd800` (branch `gsd-path/M057`), no branch created and no commit made. The three declared files are the only product files edited; this Log is appended as the brief instructs. `git status --porcelain` also names `.project/tasks/T001-…md`, `.project/tasks/T011-…md`, `.project/tasks/T013-…md` and untracked `.project/review/VERIFICATION.json`; none is this task's work — they appeared in the shared worktree while this task ran.
- The review read. `.project/review/wave-5.cycle3.md` is absent at that path; the cycle-3 review is `.project/plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-5.cycle3.md`, and it was read there. Its construction: the pane's own `joined` sentence changed to `…, and to fix this, edit the binding`, armed into the recording (`a1d98cec…` → `a2644677…`), then read green by both suites (27/27 and 32/32).
- Fix 1, `fix` restored and matched whole. `PROHIBITED_WORDING` (`scripts/console-panel-record.test.mjs:142-159`) carries `fix`, and `contract.prohibitedWording` (`research/raw/m045-console-panel.json:38-55`) carries it. `prohibitedPattern` (`:700`) is unchanged: `\b` + the entry + `\b`, with the entry's own inflections (`wordForms`, `:683`), so `\bfix\b` fires on "to fix this" and not on "prefix" or "affix". The rationale that `fix` was "subsumed by" `remedy` and dropped is deleted (`:132-141`); no entry is dropped on a subsumption argument now.
- Fix 2, the re-examination, one entry at a time. Each entry is proved in the new table test (`:1454`) through the real pin, not just the regex; each row names the substitute a pane could write and what was done with it.
  - `cause` — bad: `the cause is the write`. `because` and `due to` were already carried; `since` was added (causal connective); `reason` cannot be added because it is the join's carried field and one of `contract.lineLabels` (the pin refuses a word that is also a label); `as`/`for` were not added because they are polysemous connectives and would refuse legitimate prose.
  - `because` — bad: `the page was silent because nothing was captured`. `since` added; `as` skipped as above; `due to` carried.
  - `due to` — bad: `the binding was skipped due to the write`. `because` carried, `since` added; the phrase is matched as a phrase.
  - `since` (added) — bad: `the page was silent since nothing was captured`; this is the causal connective the two older words did not carry.
  - `element` — bad: `the element was not found`. `component` was already carried; `DOM` and `node` were added; `tag` was not added because it names markup, not the element reference the digest and the capture record.
  - `component` — bad: `the component was not rendered`; it is the capture's payload key and an element reference; `element` is carried beside it.
  - `DOM` (added) — bad: `the DOM was not updated`.
  - `node` (added) — bad: `the node was not found`.
  - `remedy` — bad: `the remedy is to hand it one`. `fix` was restored, `solution` and `repair` were added; `workaround`/`resolve`/`correct` were not added — the first is jargon, the last two are polysemous verbs ("the correct title") and would refuse correct prose, while the plain remedy nouns are carried.
  - `fix` (restored) — bad: `to fix this, edit the binding`; this is the review's own sentence and SC5's own word.
  - `solution` (added) — bad: `the solution is to edit the binding`.
  - `repair` (added) — bad: `to repair this, edit the binding`.
  - `angular` — bad: `angular reported nothing`. `framework` was added as the plain attribution a pane could use instead; `ng` was not added because it is not a word of a sentence (a code begins with `NG` and is a carried value).
  - `framework` (added) — bad: `the framework reported nothing`.
  - `count` — bad: `one count of the findings`. `number` was added; the count defect is also held independently by `pinNamesTheAbsenceByCode` (`:537`), which refuses `\b\d+\s+(code|codes|entry|entries|finding|findings)\b` in the absence sentence whatever noun is used, so `tally`/`amount` were not added.
  - `number` (added) — bad: `the number of findings is one`.
  - Verdict of the examination: eight words added (`fix`, `since`, `dom`, `node`, `solution`, `repair`, `framework`, `number`), the original eight kept and each shown to refuse a bad sentence; the eight added words are in the table too, so the list is 16 entries and every one has a demonstrated bad sentence.
- Both directions, constructed sentences.
  - "to fix this" reddens naming state, line and word. With the recording's `no-diagnostics` `surface.lines[1]` (and `surface.text`) changed in place to `no-diagnostics: no capture was handed to the join at all, so no capture was read, and to fix this, edit the binding` (sha256 `3e28c538ea9c3342c39d2a09b08d9a7268d48ada2f054b3d20bd29cee68817f3`), the unarmed record suite exits 1, `pass 28 / fail 2`, and the vocabulary test fails with: `AssertionError [ERR_ASSERTION]: recorded-vocabulary: no-diagnostics surface line 1 is policed as the pane's own "no-diagnostics" line and carries "fix", and the contract states that the pane renders no "fix"; it records "no-diagnostics: no capture was handed to the join at all, so no capture was read, and to fix this, edit the binding" (matched the word "fix" as a whole word)`. Restored from the byte-for-byte backup to `f311a458…`.
  - "an account of the prefix is not given" passes. The same pin accepts `no-diagnostics: no capture was handed to the join at all, so an account of the prefix is not given` in the test `a word the pane writes itself reddens, …` and in `a pane-written remedy spelled "fix" reddens, and "prefix" and "affix" pass` (`:1396`); `prohibitedPattern('fix')` is false on "the prefix" and "the affix", true on "to fix this". The render pin passes the same sentence and reddens on the "to fix this" one.
- Fix 3, the render suite's half. `pinNoCauseElementRemedy` (`scripts/console-panel-render.test.mjs:422`) now carries `['remedy', /\bfix\b/i]` (`:440`) beside its two phrases. The constructed surface reddens with `no-cause-element-remedy: the no-diagnostics surface must render no remedy — none of its own lines names one; it rendered ["state: no-diagnostics","no-diagnostics: no capture was handed to the join at all, and to fix this, edit the binding"] (matched /\bfix\b/i)`, while the prefix sentence passes (`pane-written "fix" probe:` in the suite's log). A new mutant `remedy-spelled-fix` (`:1252`) rewrites the pane's own joined sentence to `…, and to fix this, edit the binding`, `exhibits` proves the sentence is there, and the pin reddens with `no-cause-element-remedy: the joined surface must render no remedy — none of its own lines names one; it rendered [… "joined: … and to fix this, edit the binding" …] (matched /\bfix\b/i)`. The suite is `33 pass / 0 fail`; its `it(`/`describe(` declaration counts are still 17/3, which the record suite's claims pin re-counts green.
- Fix 4, the exemption still holds. The recorded `digest-title-and-captured-wording` case still passes (`title: Unsafe bindings on an element`, `text: … because …`), and the same test empties the exemption in memory and reddens on exactly those bytes: `exemption removed reddens: recorded-vocabulary: digest-title-and-captured-wording surface line 3 is policed as the pane's own "title" line and carries "element", and the contract states that the pane renders no "element"; it records "title: Unsafe bindings on an element" (matched the word "element" as a whole word)`. The pinned test is `the digest’s own title and a captured "because" pass, and the exemption is what lets them` (`:1166`).
- Mutants, each with the file restored and hashed. The record suite now carries three pane-source mutants; `remedy-spelled-fix` (`:973`) reddens with the `carries "fix"` message quoted above, and `absence-as-count` / `captured-nothing-as-empty-list` still redden with their names. The record's in-place `fix`-line probe (`3e28c538…`) and the record-list probe (`fix` removed from `contract.prohibitedWording`, sha256 `8d6ba1021ca58869de585989d7d3022eb2820fa6b3b55c2225f9993373ec0bc1`, unarmed exit 1, `pass 26 / fail 4`, `AssertionError [ERR_ASSERTION]: the contract must carry "fix": a pane can state a remedy without spelling "remedy"`) both restored to `f311a458…` from the backup, verified by sha256. The test files themselves were never mutated in place; their mutants are temp-directory copies (`loadMutant`).
- Idempotency. At `628bd800`, before this task's write, the recording was `a1d98cecf2f7f21407bf33ea7dc7e0214443c22717dd70ea2c6de3ccf2c3f1f6`, 11501 B. One armed run (`set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs`, exit 0, `pass 29 / fail 0 / skipped 1`) wrote `f311a458995288e5cbcd964a3756cedb63097304643b553d498c83d9924d9e2b`, 11625 B; a second armed run wrote no byte (same sha256, `pass 29 / fail 0 / skipped 1`), and the armed run at the final tree still writes no byte. Every unarmed run read the file byte-identically (sha256 before and after each run `f311a458…`, `pass 30 / fail 0`).
- What moved in the record: `contract.prohibitedWording` only — eight entries added, none removed (`git diff -- research/raw/m045-console-panel.json` shows no other line). Every case, finding and rendered line is unchanged, so the repair rewrote no evidence. The record moved once, on the armed run that added the list entries.
- Verify, run exactly as the fenced line: `node --test scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs && npx prettier --check scripts research/raw` → `ℹ tests 63`, `ℹ suites 8`, `ℹ pass 63`, `ℹ fail 0`, `ℹ skipped 0`; `Checking formatting...` / `All matched files use Prettier code style!`; exit 0.
- Hashes at the final tree: `scripts/console-panel-record.test.mjs` `86c894d062a8cb2523c3e1666e51bc326c600701c03ca0c087c6793d6d6a2d92` (67703 B); `scripts/console-panel-render.test.mjs` `8f83d3624831bed276411c496dd975116d17a8a9334cab299c728d6ee2e22509` (58437 B); `research/raw/m045-console-panel.json` `f311a458995288e5cbcd964a3756cedb63097304643b553d498c83d9924d9e2b` (11625 B). Each was read and hashed before the task, and the recording was hashed before and after every mutant and restore.
- Files touched outside the three declared ones: none, except this task's Log, which the brief instructs to append. No branch and no commit.
- Verdict: the list carries `fix` again and matches it whole; every entry is examined and either added or shown to refuse a demonstrated bad sentence; "to fix this" reddens naming the state, the line and the word while "an account of the prefix is not given" passes; the carried-value exemption still holds and emptying it reddens a named test; the recording is idempotent; the fenced Verify exits 0.
ready
