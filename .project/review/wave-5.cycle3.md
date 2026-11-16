# Review — wave 5, cycle 3

Cycle: 3
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: e1ba31fcc0e5051bbdfe244c5e403d10371d0e9f

## T004 — Record the surface and run the project verify: fail

- ✅ **The cycle-2 defect is closed.** The positive case is now recorded and armed, and it is not vacuous.
  `extension/error-digest.json` carries `NG0910` with the title **"Unsafe bindings on an element"** — that
  title does state a prohibited word, `element` — and `NG0910`'s captured message in the fixture
  (`scripts/console-panel-record.test.mjs:205-211`, message "… was stripped because the binding bypassed the
  sanitizer") states `because`. The pane renders both verbatim
  (`research/raw/m045-console-panel.json:214-226`: `title: Unsafe bindings on an element`, the `text:` line
  with "because") and the vocabulary pin passes on those recorded bytes (`:1132-1174`).
  Correction to my own cycle 2: I attributed "Component ID generation collision" to `NG0910`; at this head
  that is `NG0912`'s title (`NG0910` is the element title above). Both state a prohibited word, so the
  over-reach I reported was real and the eight affected codes I listed were right — only the title/code
  pairing was wrong. I repeated the construction independently: rendering the shipped pane over the shipped
  join for all eight codes whose titles state a prohibited whole word (`NG01354` "NgModel in child
  component cannot reach parent form", `NG0403` "Bootstrapped NgModule doesn't specify which component to
  initialize", `NG05104` "Root element was not found", `NG0910`, `NG0912` "Component ID generation
  collision", `NG0956` "Tracking expression caused re-creation of the DOM structure.", `NG8001` "Invalid
  Element", `NG8023` "Multiple Components Match Same Element"), each with a captured message saying
  "because", the record's own `contract.lineLabels` / `contract.prohibitedWording` applied with a matcher I
  wrote here: 8 of 8 pass with the exemption and 8 of 8 redden naming the `title:` line with it removed. End
  to end through the real pin: swapping the fixture to `NG0912` and re-capturing armed moved the recording
  (`a1d98cec…` 11501 B → `675591c9…` 11513 B) and stayed green 26 pass / 1 skipped, and the
  exemption-removal arm reddened on exactly those bytes:
  `… surface line 3 is policed as the pane's own "title" line and carries "component" … (matched the word "component" as a whole word)`.
- ✅ **The negative still bites, in every word the task names.** A pane-written sentence with one word each —
  `, and the cause is the page`, `, and no element was recorded`, `, and the remedy is to hand it one`,
  `, so angular reported nothing` — pushed into the `no-diagnostics` sentence, one armed re-capture each,
  reddens the unarmed suite in every case naming the state, the line and the word, e.g.
  `recorded-vocabulary: no-diagnostics surface line 1 is policed as the pane's own "no-diagnostics" line and carries "remedy" … it records "no-diagnostics: no capture was handed to the join at all, so no capture was read, and the remedy is to hand it one" (matched the word "remedy" as a whole word)`
  (armed 25 pass / 1 fail after the write, unarmed 26 pass / 1 fail). The mutant that removes the exemption
  reddens too, both in memory (`record:1167-1170`) and in place: `if (carried.includes(label)) continue;` →
  `if (false) continue;` fails 25 pass / 2 fail, both naming
  `carries "element" … it records "title: Unsafe bindings on an element"`. Word-not-substring holds on real
  bytes as well: a recorded pane-written `…, and an account of the prefix is not given` re-captured armed
  and then read unarmed is 27 pass / 0 fail.
- ✅ **The cycle-1 probe still reddens, and harder than in cycle 1.** `cause: the application modified a bound
  value during change detection` pushed into `findingLines` (`panel-console.ts:200-203`), one armed capture,
  then unarmed: the armed run writes the line (`a1d98cec…` → `45a3cb72…`, 11501 → 12425 B, six `cause:` lines
  recorded) and fails 22 pass / 4 fail / 1 skipped; the unarmed run over those blessed bytes fails 23 pass /
  4 fail with
  `recorded-vocabulary: joined surface line 2 is labelled "cause", which the record's contract does not carry; it records "cause: the application modified a bound value during change detection"`.
  Cycle 1 read 24 of 24 green on the same probe. A second armed run writes no byte (`45a3cb72…` unchanged).
- ✅ **The provenance claim now says what it means, and the suite agrees with it.** The recording states it
  twice — `capture.reproduces` (`research/raw/m045-console-panel.json:60`) and `fixture.caseInputs` (`:77`) —
  that every `cases[].input` and every `cases[].why` is a fixture constant, not a value read from the tree,
  and that so are schema, milestone, task, title, question, the whole contract and that prose, and that
  `contract.states` restates the join's three state words. `scripts/console-panel-record.test.mjs:4-12` says
  the same of the same values, and so does the `RECORD_REL` docblock (`:76-81`); the old "the sources every
  value in it is derived from" sentence is gone (the string "every value" does not occur in the file). No
  sentence in either place claims everything is derived.
- ✅ **The record is still idempotent in both directions, proved three ways.** Unarmed:
  `a1d98cecf2f7f21407bf33ea7dc7e0214443c22717dd70ea2c6de3ccf2c3f1f6`, 11501 B before and after
  (27 pass / 0 fail). Armed with nothing moved: 26 pass / 1 skipped (`a default run reads …` skips itself),
  same sha256 before and after, so it writes no byte. An armed run that *does* write and a second that does
  not: twice — the `NG0912` fixture round (`a1d98cec…` → `675591c9…`, 11513 B, second armed run unchanged)
  and the `cause:`-line round (`a1d98cec…` → `45a3cb72…`, 12425 B, second armed run unchanged).
- ❌ **The repair dropped SC5's own word `fix` from the list instead of matching it as a word, and nothing
  catches a pane-written remedy that does not spell "remedy".** The list at `2fa589b9` carried `'fix'` and
  was applied with `line.includes(word)`; this head's list (`record:138-147`,
  `research/raw/m045-console-panel.json:38-47`) drops it on the argument that "a fix is a remedy". It is
  not, as a matcher: a pane that writes "to fix this, edit the binding" states a remedy and carries neither
  `remedy` nor `the fix is` nor `fix it`. Constructed end to end — the pane's own `joined` sentence changed
  to `joined: the capture held at least one diagnostic, and every finding below is one diagnostic in the
  capture's own order, and to fix this, edit the binding` — the armed run blesses it (recording
  `a1d98cec…` → `a2644677…`, 11711 B, 26 pass / 0 fail / 1 skipped), and then the unarmed recording suite is
  **27 pass / 0 fail** and `scripts/console-panel-render.test.mjs` is **32 pass / 0 fail**, with that line
  sitting in `research/raw/m045-console-panel.json`. On the same line, `2fa589b9`'s rule refuses it (a
  substring `fix` match) and this head's list and the render pin's only remedy phrases
  (`\bthe fix is\b`, `\bfix it\b`, `console-panel-render.test.mjs:438-439`) match nothing. So a surface that
  renders a remedy passes every pin that exists for SC5 and N3. Word-boundary matching alone would have
  cleared "prefix" (`fix` is not inside it as a whole word) while keeping the word; the entry was dropped
  rather than fixed. The doc comment repeats the weaker claim — "`fix` never fires on \"prefix\"" (`:32-33`)
  — of a word that is no longer one the contract carries, which is what makes the loss invisible
  (`:1300-1315` exercises `prohibitedPattern('fix')` against a list it is not in).
- ⚠️ Residual, not the defect: the enumeration of constants is not exhaustive — the `sources` path block, the
  `fixture.payloadKeys` / `messageTexts` / `caseInputs` prose are constants too, and `capture.write`'s "an
  armed run re-derives every case" (`:59`) reads wider than the qualified sentence under it. Also narrow:
  the exemption is by label, so a `reason:` or `text:` line is never policed at all; that is the correct
  reading of SC5's "unattributed" qualifier and the render suite makes the same split, so it is stated as a
  boundary and not as a hole.
- Restored, with the sha256 before and after each probe:
  `apps/angular-ai-devtools/src/app/panel-console.ts` `36235d2a2b56958144579c3671c42176328b9109086518e002c689b9670a004f`
  13546 B (mutated copies hashed `4aced127…`, `1e462504…`, `a1129498…`, `3946e9ef…`; restored after every
  round, identical to the value read at load); `research/raw/m045-console-panel.json`
  `a1d98cecf2f7f21407bf33ea7dc7e0214443c22717dd70ea2c6de3ccf2c3f1f6` 11501 B (transiently `675591c9…`,
  `45a3cb72…`, `a2644677…` and five per-round writings, restored each time);
  `scripts/console-panel-record.test.mjs`
  `865891f45733a679b6a5217f55c12e7b78947a9b5246ceb5ac6500a9fbd07e72` 62136 B (the `NG0912` fixture swap and
  the exemption removal, restored); `scripts/console-panel-render.test.mjs` was never mutated
  (`f5c849aa…` 56787 B). `git diff --stat` is empty and `git status --porcelain` lists only untracked
  review files: no product file, no branch and no commit was touched.
- Last commands at the frozen head, unarmed then armed, both green:
  `node --test scripts/console-panel-record.test.mjs` → `tests 27 / pass 27 / fail 0`;
  `set "M045_CAPTURE=1"&& node --test scripts/console-panel-record.test.mjs` → `pass 26 / fail 0 /
  skipped 1`, recording sha256 unchanged; `node --test scripts/console-panel-render.test.mjs` → `pass 32 /
  fail 0`.

## Intent coverage

### SC5 — The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry.: fail

- ✅ The digest's own words are no longer refused. `element` in `NG0910`'s title, `component` in `NG0912`'s,
  `cause` in `NG0956`'s and the captured "because" all render and pass the record's contract, 8 of 8 titles
  and the recorded positive case with it; a pane-written `cause`, `element`, `remedy`, `angular` or
  `because` reddens naming the state, the line and the word, and the `cause:`-line probe that failed cycle 1
  reddens on real bytes after an armed re-capture.
- ❌ The word `fix` is not held. SC5 names it; the record's list drops it and the render pin knows only
  "the fix is" and "fix it", so a pane that writes "…, and to fix this, edit the binding" into its own
  sentence is blessed by an armed capture and read green by both suites (27/27 and 32/32) — a remedy
  rendered, no pin red. At `2fa589b9` the same line was refused. The clause reads as satisfied by the two
  suites only for the phrasings they happen to spell out, which is the shape of gap this task was written to
  close, one word over.
