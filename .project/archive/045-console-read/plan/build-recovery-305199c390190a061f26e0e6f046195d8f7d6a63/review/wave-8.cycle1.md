# Review — wave 8, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T012 — Restore the word the list dropped: pass

- ✅ Landing commit `9505b7c9` (`git show --numstat 9505b7c9`: four files, +239/−9 —
  `scripts/console-panel-record.test.mjs` +151/−5, `scripts/console-panel-render.test.mjs` +42/−0,
  `research/raw/m045-console-panel.json` +9/−1, the task file +37/−3). The word is back in the list a
  checkout carries: `research/raw/m045-console-panel.json` `contract.prohibitedWording` is sixteen entries —
  `["cause","because","due to","since","element","component","dom","node","remedy","fix","solution","repair",
  "angular","framework","count","number"]` — read by both suites from the record
  (`scripts/console-panel-record.test.mjs:187` `PROHIBITED_WORDING`, `prohibitedPattern` at `:1487` composed of
  `\b`, the entry, its inflections and `\b`).
- ✅ AC1 — a pane-written sentence containing "fix" reddens a pin that names the state, the line and the word,
  on both sides of the wave. Recorded bytes: `mutant remedy-spelled-fix reddens: recorded-vocabulary:
  no-diagnostics surface line 1 is policed as the pane's own "no-diagnostics" line and carries "fix", and the
  contract states that the pane renders no "fix"; it records "no-diagnostics: no capture was handed to the join
  at all, so no capture was read, and to fix this, edit the binding" (matched the word "fix" as a whole word)`
  (`✔ remedy-spelled-fix reddens naming "recorded-vocabulary" (6.3074ms)`). Rendered surface:
  `no-cause-element-remedy: the no-diagnostics surface must render no remedy — none of its own lines names
  one; it rendered ["state: no-diagnostics","no-diagnostics: no capture was handed to the join at all, and to
  fix this, edit the binding"] (matched /\bfix\b/i)`, which is the review's own sentence reddening at this
  head.
- ✅ AC2 — the matching is by word, so "prefix" and "affix" pass: `✔ a pane-written remedy spelled "fix"
  reddens, and "prefix" and "affix" pass (0.7398ms)` on the record side, and the render pin's own list carries
  `['remedy', /\bfix\b/i]` beside its multi-word phrases (`scripts/console-panel-render.test.mjs:607-617`).
- ✅ AC3 — every entry is shown to catch a demonstrably bad sentence, and the set is the sixteen the task says
  it examined: `✔ every prohibited entry catches a demonstrably bad sentence (2.923ms)`, with the entries
  printed by the same run — `every prohibited entry reddened: cause, because, due to, since, element,
  component, dom, node, remedy, fix, solution, repair, angular, framework, count, number` (the original eight
  kept, `fix` restored, `since`, `dom`, `node`, `solution`, `repair`, `framework` and `number` added), and the
  Log records why for each of the rest (`T012…md:70-86`). The one-word subsumption argument that dropped `fix`
  is gone: the Log states it at `:68` and the list carries both `remedy` and `fix`.
- ✅ AC4 — the carried-value exemption still holds and emptying it still reddens: the recorded case
  `digest-title-and-captured-wording` passes at this head (`console pane digest-title-and-captured-wording:
  [… "title: Unsafe bindings on an element","text: NG0910: unsanitized HTML was stripped because the binding
  bypassed the sanitizer"]`) while `exemption removed reddens: recorded-vocabulary:
  digest-title-and-captured-wording surface line 3 is policed as the pane's own "title" line and carries
  "element" … (matched the word "element" as a whole word)` is asserted in the same test —
  `✔ the digest's own title and a captured "because" pass, and the exemption is what lets them (2.1714ms)`.
- ✅ The declared `Verify` passes at the reviewed HEAD: `node --test scripts/console-panel-record.test.mjs
  scripts/console-panel-render.test.mjs` → `ℹ tests 78`, `ℹ suites 10`, `ℹ pass 78`, `ℹ fail 0`; `npx prettier
  --check scripts research/raw` → `Checking formatting...` / `All matched files use Prettier code style!`. The
  recording was not written by any run in this review: both suites ran unarmed (`✔ a default run reads the
  recording and writes no byte`), and `git status --porcelain` carries no modification under `research/`
  except the gate record a concurrent reviewer re-armed, named under wave 6.

## T013 — Pin the measurements to the commit they were taken at: pass

- ✅ Landing commit `4a4aed36` (`git show --numstat 4a4aed36`: three files, +63/−3 — the T001 Log +41/−0, the
  T011 Log +7/−0, the task file +15/−3 — and no product file. `research/raw/m045-console-shapes.json` is
  declared in the task's `files:` precisely so its size can be measured, and the commit does not carry it,
  which is what AC5 asks for.)
- ✅ AC1 — every size the Log states names the commit it was measured at, and the command beside it prints
  that number at that commit. Re-run at the reviewed HEAD with the command the entry carries
  (`git cat-file -s <commit>:research/raw/m045-console-shapes.json`, which reads a commit's own tree so a later
  append cannot move a line of its output): `ee4bfbd2: 27122`, `a4a57f9e: 27783`, `9f0603c9: 33917`,
  `234a3b4c: 35619`, `e1ba31fc: 35619`, `628bd800: 35619` — every figure the appended entry states, including
  the `35,619 bytes measured at 628bd800` it settles the deliverable at. The same measurement at this head
  gives `cd319fa9: 39284`, so the figure is a fact about a commit and not about the worktree, which is the
  defect the task exists to stop.
- ✅ AC2 — the command count is checked against the record and each command is identified rather than only
  counted: at this head `research/raw/m045-console-shapes.json` `provenance.commands` is
  `c1,c2,…,c18`, all `exitCode: 0`, and the entry names which command is which (`:121-137` for `c1`-`c16`,
  `:163-181` for `c17`/`c18`). The count in T013's own entry is 16 because that is what `628bd800` carried;
  the next commit to append a command falsified it, which is measured and corrected by a later append at
  `:142` ("Three statements above are aged, and one of them is false") and `:162` ("The count at this head is
  18, `c1`–`c18`"). So the counting method is right and the number it produced was a fact about a commit —
  exactly the repair this task made — with the wave-11 task owning the follow-up.
- ✅ AC3 — both corrections are appends, proven by bytes rather than asserted: `git show
  9505b7c9:.project/tasks/T001-measure-the-capture-and-the-digest.md` is a byte-exact prefix of the same file
  at `4a4aed36` (`base bytes 15389`, `landing bytes 21745`, `appendOnly true`), and the T011 Log likewise
  (`base bytes 9360`, `landing bytes 12974`, `appendOnly true`), so every earlier line — including
  `T001…md:89`'s uncorrected sentence and `T011…md:130`'s verdict — is byte-identical.
- ✅ AC4 — T011's Log records that its criterion 4 was mis-worded, that the shipped reading is correct, and
  why refusing directories would break the gate's default input: the appended entry reads at `:133` "What
  criterion 4 said, and what shipped … What shipped **reads** it", at `:135` "An argument refused for being a
  directory would refuse that default, so the fix-record stage would fail on its own corpus and on every clean
  tree", and at `:136` "T011's three declared files are untouched, and the tree is clean against `HEAD` for all
  three". No code was changed: `git show --stat 4a4aed36` carries no `.mjs` file, and the pin the task names
  is visible in the reviewed gate run — `gate-integrity: fix-record clean - examined 167 claim(s) in 24 task
  log(s) of .project/tasks … pass - 0 finding(s), 145 mention(s)`.
- ✅ AC5 — no product value changes: the landing touches only the two Logs and its own task file, and the
  shapes record the task declares is byte-identical to its `628bd800` blob in that commit (the `--stat` has no
  row for it). Measured at the reviewed HEAD, `git status --porcelain` carries no modification under
  `research/raw/m045-console-shapes.json`.
- ✅ The declared `Verify` passes at the reviewed HEAD: `node --test scripts/recording-consistency.test.mjs` →
  `ℹ tests 7`, `ℹ suites 0`, `ℹ pass 7`, `ℹ fail 0`, including the test that binds this task's subject —
  `✔ every byte count a recording states in prose is a byte total the recording records (22.4539ms)`; `npm run
  check` → exit 0, with the fix-record stage reading `examined 167 claim(s) in 24 task log(s) … 0 finding(s),
  145 mention(s)`; `npx prettier --check research/raw/m045-console-shapes.json` → `All matched files use
  Prettier code style!`.

## Intent coverage

Wave 8 owns no success criterion, and this record states no `### SCn` heading for that reason: T012 and T013
each declare `Intent coverage: None` in their briefs, so the wave's owned-criteria set is empty and a heading
here would claim a criterion the wave's own contracts do not carry. What the wave holds is inside one
criterion another wave owns:

- ✅ yes — **SC5** ("The surface renders only what the capture states: no cause, no element, no fix, and no
  "angular" attribution that the message text does not carry.") is the criterion T012's repair restores the
  literal word to: the sentence "…, and to fix this, edit the binding" is blessed by an armed re-capture and
  then refused by name at this head — `recorded-vocabulary: no-diagnostics surface line 1 … carries "fix" …
  (matched the word "fix" as a whole word)` and `no-cause-element-remedy: the no-diagnostics surface must
  render no remedy … (matched /\bfix\b/i)` — while "prefix" and "affix" pass, so the rule is a word and not a
  substring. Wave 3's T003 and wave 12's T019 own the criterion; this wave only restores a word the list
  dropped.
- no — **SC1, SC2, SC3 and SC4** are not claimed by this wave, and T013 cannot reach any of them: it changes
  two task Logs and no product value (its own AC5), so nothing it does can move what the panel reports, what
  the join selects, or how the two absences are told apart.
