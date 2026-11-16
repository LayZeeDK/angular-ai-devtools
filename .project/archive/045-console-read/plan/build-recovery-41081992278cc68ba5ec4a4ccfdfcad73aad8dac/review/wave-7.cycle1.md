# Review — wave 7, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T009 — Police only the words the pane writes itself: pass

- ✅ Landing commit `e1ba31fc` (`git show --numstat e1ba31fc`: six files, +539/−72 — the two suites +246/−33
  and +205/−31, the recording +41/−5, the pane +9/−0, the correction to T007's Log +5/−0, and the task file
  +33/−3). The exemption is in the source a checkout carries:
  `scripts/console-panel-record.test.mjs:290` is `const CARRIED_FIELDS = ['text', 'code', 'title', 'reason'];`
  and `scripts/console-panel-render.test.mjs:341` is `const CARRIED_FIELDS = ['code', 'title', 'text',
  'reason'];`, with `paneWrittenLines(surface, carried = CARRIED_FIELDS)` at `:344` splitting a surface into
  the answer's words and the pane's own (`:596` `pinNoCauseElementRemedy(surface, answer, carried =
  CARRIED_FIELDS)`), and the record's pin taking the same set as a parameter
  (`scripts/console-panel-record.test.mjs:1510`, `pinRecordsOnlyTheContractVocabulary`).
- ✅ AC1 — a pane that renders `NG0910`'s digest title and a captured "because" passes, and the run shows the
  title is not vacuous: the record suite prints the case's rendered bytes, `console pane
  digest-title-and-captured-wording: ["state: joined",…,"code: NG0910","title: Unsafe bindings on an
  element","text: NG0910: unsanitized HTML was stripped because the binding bypassed the sanitizer"]`, and
  the test `✔ the digest's own title and a captured "because" pass, and the exemption is what lets them
  (2.1714ms)` holds it.
- ✅ AC2 — a pane-written wording still reddens in every absence state, naming the state and the word, and the
  probe is on the record's own bytes: `pane-written wording probe: recorded-vocabulary: no-diagnostics surface
  line 1 is policed as the pane's own "no-diagnostics" line and carries "because", and the contract states
  that the pane renders no "because"; it records "no-diagnostics: no capture was handed to the join at all
  because none was made" (matched the word "because" as a whole word)`, with the render side reddening per
  state — `no-cause-element-remedy: the no-diagnostics surface must render no remedy … (matched
  /\bremedy\b/i)`, `… (matched /\bbecause\b/i)` and `no-element: the captured-nothing surface must render no
  element … it rendered ["state: captured-nothing",…,"element: <app-root class=\"shell\">"]`.
- ✅ AC3 — the matching is by word and not by substring, asserted positively:
  `✔ a pane-written remedy spelled "fix" reddens, and "prefix" and "affix" pass (0.7398ms)`, over
  `prohibitedPattern` (`scripts/console-panel-record.test.mjs:1487`) built from `wordForms` (`:1470`) with
  `\b` on both sides.
- ✅ AC4 — the silence rule reaches every absence state rather than `captured-nothing` alone. At the reviewed
  HEAD the rule is the property wave 9's T014 shipped, and it is run on each state by name:
  `absence-statement: the no-diagnostics surface …`, `… the captured-nothing surface …`, `… the joined
  surface …` and `… the no-console-answer surface …`, each quoting the offending clause. The rename is a
  strict widening of T009's `silence-claim:` rule, which T007's Log correction records at `:113-116`; the
  claim this task made is true of the tree, one generation later.
- ✅ AC5 — the record states which of its values are fixture constants and no carried sentence claims
  everything is derived: `research/raw/m045-console-panel.json` carries `fixture.caseInputs` ("every
  cases[].input — the diagnostics the fixture hands over, or the absence of a capture — and every
  cases[].why are this suite's own fixture constants, not values read from the tree"), `capture.reproduces`
  says the same for the contract and the prose, and the stale "the sources every value in it is derived from"
  sentence is gone from `scripts/console-panel-record.test.mjs` (no match at this head).
- ✅ AC6 — each rule is armed: `mutant remedy-spelled-fix reddens naming "recorded-vocabulary" (6.3074ms)`,
  `absence-as-count reddens naming "named-absence"`, `captured-nothing-as-empty-list reddens naming
  "captured-nothing"`, and the exemption itself is armed in the other direction — `exemption removed reddens:
  recorded-vocabulary: digest-title-and-captured-wording surface line 3 is policed as the pane's own "title"
  line and carries "element", and the contract states that the pane renders no "element"; it records "title:
  Unsafe bindings on an element" (matched the word "element" as a whole word)`.
- ✅ The declared `Verify` passes at the reviewed HEAD: `node --test scripts/console-panel-record.test.mjs
  scripts/console-panel-render.test.mjs` → `ℹ tests 78`, `ℹ suites 10`, `ℹ pass 78`, `ℹ fail 0`; `npm run
  check:panel` → exit 0 with no diagnostic; `npx prettier --check apps/angular-ai-devtools/src/app scripts
  research/raw` → `All matched files use Prettier code style!`.

## T010 — Correct the control-character count and give every number a command: pass

- ✅ Landing commit `234a3b4c` (`git show --numstat 234a3b4c`: four files, +297/−17 — the shapes record
  +28/−0, the gate-stability record +35/−14, the T001 Log +6/−0, and the task file +228/−3).
- ✅ AC1 — every numeric leaf is a carried command's output, measured at the reviewed HEAD with the rule the
  task states (a leaf under an `exitCode` key is printed by its own run; every other leaf must appear as a
  decimal token in some carried command's `output`): `numericLeaves: 72`, `printedLeaves: 72`,
  `unprintedLeaves: 0`, `unprinted: none`. The record grew from the 70 leaves this task measured because
  T015's `c17` and `c18` were carried afterwards, and both are commands with printed output, so the property
  the task established is the one that still holds at this head rather than a number that went stale.
- ✅ AC2 — a carried command prints the line number the one flagged leaf records, and the record cites it:
  `research/raw/m045-console-shapes.json` `capture.dispatcher` is `{"function":"dispatch","file":
  "extension/agent-main.js","line":1397,"from":"c16", …}`, and `c16`'s recorded output begins
  `1397:   function dispatch(type, detail) {`, from the recorded command `node -e "… const s=A.findIndex(l=>l.includes('function dispatch(type, detail)')); for(let i=s;i<s+20;i++)console.log((i+1)+': '+A[i])"`.
- ✅ AC3 — the corrected count is what the file measures: `.project/tasks/T001-measure-the-capture-and-the-
  digest.md` is LF-only with one control character, `controlChars: [[9056,"c"]]`, `crlf: false`, `loneCR:
  false` (`bytes: 48816`, `chars: 48462` at this head), and the appended entry states it — `:94` "**The
  control-character count corrected: one control character, `U+000C` at index 9056, and this file is LF-only.
  Nothing above is rewritten.**"
- ✅ AC4 — the earlier claim is named as corrected rather than left standing: `:95` reads "That entry states
  that the corrupted verdict sentence carries `U+000C` at character index 9056 **and** `U+000D` at 9064, 'the
  latter is the final line's carriage return'. The first half stands. The second is **corrected here**", and
  the entry is an append — `git show 516b2450:.project/tasks/T001-…md` is a byte-exact prefix of `git show
  234a3b4c:.project/tasks/T001-…md` (`base bytes 12267`, `landing bytes 15389`, `appendOnly true`), which is
  the same pair the task's own Log prints.
- ✅ AC5 — the stability record reads byte-identical on an unarmed run, proven with its sha256:
  `node --test scripts/gate-stability-record.test.mjs` prints `ℹ research/raw/m056-gate-stability.json at
  load: 67100 bytes, sha256 364bb21ed0b9941a448e408f967c8290998df6f155f8971dc3a4b476e93450de` and the same
  sha256 after the run, and its first test is `✔ a default run is a read: the recording hashes the same
  before and after (1.3555ms)` — so the read wrote no byte.
- ⚠️ The declared `Verify` does not exit 0 at the reviewed HEAD on its second leg, and the red value is not
  this task's: `node --test scripts/recording-consistency.test.mjs scripts/gate-stability-record.test.mjs` →
  `ℹ tests 15`, `ℹ pass 14`, `ℹ fail 1`, the failure being `Error: the recording disagrees with this run's
  derivation at 2 value(s) (re-capture with M056_CAPTURE=1 after naming what moved):
  archive.detail.plainRun.summary: "gate-integrity: pass - 0 finding(s), 139 mention(s)" -> "gate-integrity:
  pass - 0 finding(s), 145 mention(s)"; predecessor.summary: … 139 … -> … 145 …`. The suite's own carrier
  line names the cause: `carrier: git log --format=%H 5290d939…..HEAD -- research/raw/m056-gate-stability.json
  names 7 commit(s), newest 3238cd88` — the recording has not moved since T024's re-derivation, while the
  task logs it re-derives from have grown, which is the wave-17 re-derivation class. Both values the failure
  names have since been written into the worktree by a concurrent reviewer's armed capture
  (`git status --porcelain` carries `M research/raw/m056-gate-stability.json`, whose diff is exactly
  `"summary": "… 139 mention(s)"` → `"… 145 mention(s)"` at the three places the failure names; the file is
  now 68,045 bytes at sha256 `09895a473113b3a9fbcfadf491cb35cf24ba3289006a0c5ee2f2760e12cfdbff`, where the run
  above read 67,100 bytes at `364bb21e…`), so the committed recording and the worktree copy differ and my
  measurement is of the committed bytes at the reviewed HEAD. The byte-identity pin T010's AC5 rests on
  passes in the same run. The other two legs are green: `npm run check` → exit 0
  (`gate-integrity: pass - 0 finding(s), 145 mention(s)`, `All matched files use Prettier code style!`) and
  `npx prettier --check research/raw/m045-console-shapes.json research/raw/m056-gate-stability.json` → `All
  matched files use Prettier code style!`.

## T011 — Stop the tail-suffix resolution from pinning a path that exists nowhere: pass

- ✅ Landing commit `dcd1775b` (`git show --numstat dcd1775b`: four files, +796/−76 — `scripts/gate-integrity.mjs`
  +196/−63, `scripts/gate-integrity.test.mjs` +529/−0, the shapes record +10/−10, and the task file +61/−3).
- ✅ AC1 — a spelling that is only a tail of a declaration and exists nowhere is a claim and a finding naming
  the spelling and the range, never a pin: `T011 tail: src/app/panel-console.ts is 1 mention naming it and, in
  claims: log, a finding naming the spelling and
  99054909bd019afd578172200a07b64194e6489e..eb24d1e2deca1deed7992e46a965bb314864b6a1; under
  fix-record-resolve-any-tail it is 1 pin of apps/angular-ai-devtools/src/app/panel-console.ts`
  (`scripts/gate-integrity.test.mjs:5253`). The gate is in the source: `scripts/gate-integrity.mjs:304-323`
  `declarationFor` resolves a tail only through `if (!carries(root, range, token, cache)) return { path:
  null, ambiguous: [] };` (`:321`), and `carries` (`:247-255`) is the same existence test T006 introduced, so
  the resolution cannot lend a spelling the blobs of a file it does not name.
- ✅ AC2 — a bare basename the tree carries still resolves to its declaration, and the mutant that removes the
  resolution reddens: `T011 basename: tsconfig.json resolves to extension/tsconfig.json as 1 pin, 0 mention;
  under fix-record-tail-resolution-off it is 0 pin and a mention of tsconfig.json`
  (`scripts/gate-integrity.test.mjs:5323`), which is the direction that keeps M045's own logs readable.
- ✅ AC3 — two declarations sharing a tail are reported, not chosen: `T011 ambiguity: nx.json tails
  apps/one/nx.json and apps/two/nx.json, so the run reports both and judges the token as itself; under
  fix-record-first-tail-wins it judges apps/one/nx.json and never names apps/two/nx.json`
  (`scripts/gate-integrity.test.mjs:5421`), from `scripts/gate-integrity.mjs:320` `if (tails.length > 1)
  return { path: null, ambiguous: tails };` and the `ambiguous-declaration` finding the run records.
- ✅ AC4 — the `EISDIR` crash is gone and the path is named. Measured at this head:
  `T011 tasks directory: C:\Users\LARSGY~1\AppData\Local\Temp\m044-tasks-directory-fEjaW0\tasks.md read 2 task
  file(s) and the gate named it on exit 0; under tasks-read-directory-as-file the same argument throws EISDIR`
  (`scripts/gate-integrity.test.mjs:5498`). One correction, recorded here so it is not read as a pass: the
  accepted criterion says such an argument is "refused", and the shipped code **reads** it
  (`scripts/gate-integrity.mjs:1490-1500`, `statSync(absolute).isDirectory()`), which is right — the gate's
  own default `--tasks` input is `.project/tasks`, a directory, so refusing directories would refuse
  `npm run check` itself. T013 appends that correction to this task's Log (`:132-136`) and changes no code;
  the behaviour the criterion was written to stop (an `EISDIR` throw) is what was repaired, and it stays
  repaired.
- ✅ AC5 — the resolution cannot move the corpus counts without a red test: `T011 counts: the corpus at
  516b24506336cbcb8937090f94ad13156ff6f346 reads 83 claim(s), 1 pin(s) and 93 mention(s) over
  b8d3341cf8a00e01af0d9cbba3a7cd1e0d226b55..516b24506336cbcb8937090f94ad13156ff6f346; under
  fix-record-resolve-any-tail it reads 91, 2 and 84` (`scripts/gate-integrity.test.mjs:5563`) — the review's
  own pair reproduced, with the count read from a named commit so a later append cannot move it.
- ✅ The mutants are branches in the shipped module, not fixtures beside it: `MUTANTS` at
  `scripts/gate-integrity.mjs:181-191` carries `fixRecordTail: 'fix-record-resolve-any-tail'`,
  `fixRecordTailOff: 'fix-record-tail-resolution-off'`, `fixRecordAmbiguity: 'fix-record-first-tail-wins'`
  and `tasksDirectory: 'tasks-read-directory-as-file'` beside T006's two.
- ⚠️ The declared `Verify` does not exit 0 at the reviewed HEAD for the reason recorded under T006, not for
  anything this task changed: `node --check scripts/gate-integrity.mjs` → exit 0; `node --test
  scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs` → `ℹ tests 49`, `ℹ pass 48`,
  `ℹ fail 1`, the one failure being the E6 derived-record pin whose row is `scripts/console-join.test.mjs`
  (moved by `bed115e3 T022` after `3238cd88 T024`); `npm run check` → exit 0; `npx prettier --check scripts`
  → `All matched files use Prettier code style!`. All five T011 pins are among the 48 that pass.

## Intent coverage

Wave 7 owns no success criterion, and this record states no `### SCn` heading for that reason: T009, T010 and
T011 each declare `Intent coverage: None` in their briefs, so the wave's owned-criteria set is empty and a
heading here would claim a criterion the wave's own contracts do not carry. What the wave holds is inside
criteria two other waves own:

- ✅ yes — **SC5** ("The surface renders only what the capture states: no cause, no element, no fix, and no
  "angular" attribution that the message text does not carry.") is the criterion T009's exemption is written
  inside: the qualifier "that the message text does not carry" is exactly the `title:`/`text:` exemption, and
  the run proves both directions on the same bytes — `title: Unsafe bindings on an element` and a captured
  "because" pass (`✔ the digest's own title and a captured "because" pass, and the exemption is what lets
  them`), while a pane-written "because" reddens (`pane-written wording probe: … carries "because" …`).
  Wave 3's T003 and wave 12's T019 own the criterion.
- ✅ yes — **SC2** ("A diagnostic whose code the digest carries is reported with that entry's title, and the
  join is proven against the shipped `extension/error-digest.json` rather than a fixture.") is what the
  dropped exemption would have refused: measured against the shipped digest at this head, fourteen of the 64
  titles carry one of the sixteen prohibited words as a whole word (`NG0910: Unsafe bindings on an element`,
  `NG0912: Component ID generation collision`, `NG8001: Invalid Element`, `NG8023: Multiple Components Match
  Same Element`, `NG0503: Hydration Unsupported Projection of DOM Nodes`, …), and `NG0910`'s own title states
  "element" (`console pane digest-title-and-captured-wording: [… "title: Unsafe bindings on an element" …]`).
  Wave 2's T002 owns the criterion; this wave only keeps the surface able to report what it requires.
- no — **SC1, SC3 and SC4** are not claimed by this wave. T010 and T011 touch no surface statement and no
  capture: they repair a measurement record and a gate rule, and neither can move what the panel reports. The
  absence statements T009 widened are evidence *about* SC4's two absences, but distinguishing them is T003's
  and wave 3's claim, not this one's.
