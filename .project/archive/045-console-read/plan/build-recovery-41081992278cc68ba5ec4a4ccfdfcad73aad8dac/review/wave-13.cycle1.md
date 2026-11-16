# Review — wave 13, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T021 — Stop the join editing the captured text: pass

Landing commit `21d59c13` (`git show --stat`: five files, +431/−27 — this task's file,
`extension/console-join.js` 16 lines, `research/raw/m045-console-panel.json` 6 lines,
`scripts/console-join.test.mjs` +165, `scripts/console-panel-render.test.mjs` +123;
`research/raw/m045-console-shapes.json` is declared and does not appear, because the change does not reach
it).

- ✅ yes — **`text` is the capture's own string, byte for byte, on every input I could put through the
  module.** I evaluated `extension/console-join.js` against the shipped digest and compared each finding's
  `text` with the message as UTF-8, exactly as the pin does (`Buffer.from(text).equals(Buffer.from(message))`):
  a coded message → `byteIdenticalToInput=true`; `code: null`, message `the app failed` →
  `text="the app failed"`, `true` (the note is gone); a code the digest lacks →
  `text="ng04002: Cannot match any routes."`, `true`; `code: '  NG0100  '`, message
  `  NG0100: état — padded exactly as captured  ` →
  `text="  NG0100: état — padded exactly as captured  "`, `true` (nothing trims the text, while `codeOf`
  does trim the code it compares); a message with no code and padding → `text="  spaced out  "`, `true`; a
  non-string argument → `text="42"`, `true`. The product is the change it claims: the no-code branch is
  `findings.push({ text: text });` (`extension/console-join.js:198-202`), and
  `occurrences of "this message carried no code" in console-join.js: 0`.
- ✅ yes — **the absence is still reported, by the sentence that was always reporting it.** The pane's
  `no-code:` registry entry is present and byte-identical
  (`apps/angular-ai-devtools/src/app/panel-console.ts:187-192`,
  `no-code: the captured message carried no code, so this finding carries no code and no title`), selected
  by the finding having no `code` (`:382`) and never by the words in `text`. So removing the join's
  parenthetical lost nothing the surface shows, and both pins that say so are live:
  `pinTextIsTheCapturedText` (`scripts/console-join.test.mjs:459`) is armed by `text-edited-with-the-note`
  (`:206`) and `text-trimmed` (`:216`), and `pinTheRemovedNoteLosesNothing`
  (`scripts/console-panel-render.test.mjs:1781`) is armed by `no-code-sentence-dropped` (`:2704`); all four
  are in the suites' own `MUTATIONS` loops and pass in the runs below.
- ✅ yes — **the record that moved is the panel record, by the amount the Log states, and the shapes record
  did not move.** sha256 over `git show <commit>:research/raw/m045-console-panel.json`:
  `fb962d704d0b3d94f292bd590486b9638373ee21894e2fea2da90ccc30c6023a` (17,962 B) at `1e84c498` →
  `acc7f43863b24acd5cf072a6cc5b1d2292374ac210b3b2c1ac25a783230fd27b` (17,869 B) at `21d59c13` — both the
  values and both the sizes the Log states. `research/raw/m045-console-shapes.json` is
  `4d2b2103d137e0f023153da7e0bf952b3a9646de4385b99d88feae3827473091` (39,284 B) at `1e84c498`, at
  `21d59c13` and at this head: the recorded join answers `c17`/`c18` are both findings whose messages carry
  a code, so the change genuinely does not reach them, and the declared-but-unchanged path is a pin rather
  than a claim.
- ✅ yes — **the Verify is green at this head.** `node --test scripts/console-join.test.mjs
  scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs` → `ℹ tests 86`,
  `ℹ suites 12`, `ℹ pass 86`, `ℹ fail 0`, `ℹ cancelled 0`, `ℹ skipped 0`, exit 0 (86 rather than the Log's
  85 because T022 added one after it); `npm run check` → exit 0, with `verification gate (structure): pass`,
  `gate-integrity: pass - 0 finding(s)`, `gate-integrity: fix-record clean - examined 167 claim(s) in 24 task
  log(s) … against 115 changed path(s) of b8d3341c…cd319fa9`, `gate-integrity: pass - 0 finding(s), 145
  mention(s)` and both `All matched files use Prettier code style!` lines; `npx prettier --check extension
  scripts research/raw` → `Checking formatting...` / `All matched files use Prettier code style!`, exit 0.
  `npm run check` rewrote `.project/review/VERIFICATION.json`'s `at` timestamp, as the Log warns it does, and
  the working tree's product files were left byte-identical.
- ⚠️ Advisory — **the residue this task recorded is real, and one piece of it is now a false statement in a
  shipped surface.** The Log names three paths outside its five declared files and leaves them alone, which
  is correct — the gate would have refused the edit. Two of them still are what they were: the module's
  docblock at `apps/angular-ai-devtools/src/app/panel-console.ts:32-34` still reads "A message that carried
  no code renders that absence in its own sentence, **and the finding's `text` already says so**", which the
  join now contradicts; and the demo's own fact still carries the removed note
  (`apps/angular-ai-devtools/src/app/panel-demo.ts:397`,
  `{ text: 'the app failed (this message carried no code)' }`) with its prose at `:379` attributing it to the
  join ("the third message carried no code at all, which the join reports in the finding's own text") and its
  spec pinning the note (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1908`,
  `expect(bare?.text).toMatch(/\(this message carried no code\)$/);`). The demo is the data behind the
  `console` route the plan's Surface contract names, so a reader at that route still sees a `text:` the join
  would never produce, beside a sentence saying the join produces it. Nothing in this wave can fix it — the
  paths are undeclared and the Log says so plainly — but it is a documentation and demo-data defect that
  survives the wave, and no pin on the join's side can see it.

## Intent coverage
