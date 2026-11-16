# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: cd319fa9e48749985d63b318ab295ec0220b49a9

## T006 — Stop the pin rule from absolving a path that exists nowhere: pass

- ✅ Landing commit `8851f77e` (`git show --numstat 8851f77e`: `scripts/gate-integrity.mjs` +155/−55,
  `scripts/gate-integrity.test.mjs` +388/−0, `research/raw/m044-gate-shapes.json` +16/−16, the task file
  +87/−3; 646 insertions, 74 deletions). All four repairs are in the source a checkout carries at the
  reviewed HEAD: `scripts/gate-integrity.mjs:277-286` is `function isPinnable(root, range, path, cache,
  mutant = null) { … return carries(root, range, path, cache); }`, `:247-255` is `carries`, which asks the
  tree (`if (existsSync(join(root, path))) return true;`) and then each end of the range
  (`blobAt(root, ends.base, path, cache) !== null || blobAt(root, ends.head, path, cache) !== null`);
  `:1377-1390` is `rangeEnds`, refusing anything but two parts (`if (parts.length !== 2) return null;`) and
  a head that opens on a dot (`if (head.startsWith('.') || base.endsWith('.')) return null;`); `:1623-1635`
  refuses the range before anything is read; `:1689` normalises the token once (`const token =
  named.replace(/^\.\//, '');`) with `:1690` the mutant reading it as written; and `:1483-1500` asks the
  filesystem (`statSync(absolute).isDirectory()`) before listing a directory. The four defects are each
  armed by a named branch in `MUTANTS` (`:181-191`: `fixRecordPin`, `fixRecordToken`, and T011's later
  `fixRecordTail`/`fixRecordTailOff`/`fixRecordAmbiguity`/`tasksDirectory`).
- ✅ AC1, proven for both shapes it names — the suite prints, at the reviewed HEAD,
  `T006 pin: scripts/absent-probe-suite.test.mjs is a claim absent from 99054909bd019afd578172200a07b64194e6489e..eb24d1e2deca1deed7992e46a965bb314864b6a1; under fix-record-pin-by-spelling it is 1 pin and 0 finding`
  and the same sentence for `research/raw/m999-absent-recording.json`
  (`scripts/gate-integrity.test.mjs:4775` and `:4841`), so a suite-shaped and a recording-shaped path that
  no commit and no tree carries are each a claim, and the spelling rule is exactly the mutant that
  absolves them.
- ✅ AC2 — both spellings produce the same verdict at the same head, measured:
  `T006 token: research/raw/m044-gate-shapes.json reads {"ok":true,"claimsExamined":1,"pinsExamined":0,"inTheRange":[true],"findings":[]} bare and {"ok":true,"claimsExamined":1,"pinsExamined":0,"inTheRange":[true],"findings":[]} with a leading ./; under fix-record-token-unnormalised the dot-slash form reads {"ok":false,"claimsExamined":1,"pinsExamined":0,"inTheRange":[false],"findings":["research/raw/m044-gate-shapes.json claim-absent-from-the-range"]}`
  (`scripts/gate-integrity.test.mjs:4898`), which is the asymmetry the task names, reproduced live.
- ✅ AC3 — a three-dot range is refused with its form named rather than guessed:
  `T006 range: d94502d174aff31b0b1ebbab200d5e47939dec39...53f93bb555ef1805934442b90976dcc807b1bda1 is refused - the range "d94502d174aff31b0b1ebbab200d5e47939dec39...53f93bb555ef1805934442b90976dcc807b1bda1" is a three-dot range (`base...head`), and the pin reading compares a path's blob at exactly two commits, so this check refuses rather than splitting it into a base and a head that no commit carries`
  (`scripts/gate-integrity.test.mjs:4967`). No head is guessed: the refusal at `scripts/gate-integrity.mjs:1623`
  returns before `nameStatus` (`:1637`) is reached, and its `reading` says `examined 0 claim(s)`.
- ✅ AC4 — `T006 tasks: one file read 1 task (0), the directory read 2 (0)`
  (`scripts/gate-integrity.test.mjs:5033`): a single markdown argument is read as that file, a directory is
  still read as every task file it holds, and `taskInputs` (`scripts/gate-integrity.mjs:1488-1500`) tests the
  node type rather than the suffix, so the `ENOTDIR` crash is gone from both directions.
- ⚠️ The declared `Verify` does not exit 0 at the reviewed HEAD, and the red leg is not this task's:
  `node --check scripts/gate-integrity.mjs` → exit 0, then `node --test scripts/gate-integrity.test.mjs
  scripts/gate-integrity-default-tasks.test.mjs` → `ℹ tests 49`, `ℹ pass 48`, `ℹ fail 1`, the failure being
  `AssertionError [ERR_ASSERTION]: suiteDiff in the recording is not what this head derives: "suiteDiff.differing[5].addedLines: 1414 -> 1539"`
  (`scripts/gate-integrity.test.mjs`, the E6 derived-record pin). That row is `scripts/console-join.test.mjs`
  in `research/raw/m044-gate-shapes.json`, and `git log --oneline 3238cd88..cd319fa9 -- scripts/console-join.test.mjs`
  names one commit: `bed115e3 T022: Make the join's reasons a closed set` — so the recording was moved by a
  wave-15 task after T024's re-derivation, the staleness class wave 17 owns, and not a value T006's four
  branches produce. The same three rows are what a concurrent reviewer's armed capture has since written
  into the worktree (`git status --porcelain` carries `M research/raw/m044-gate-shapes.json`, whose diff is
  exactly `addedLines 1414 -> 1539`, `3160 -> 3428`, `2920 -> 3204` and `"at": "2026-11-16T12:00:58.195Z"`;
  a re-run over those bytes is `ℹ tests 40`, `ℹ pass 40`, `ℹ fail 0`). The rest of the Verify chain is green
  at this head: `npm run check` → exit 0, `gate-integrity: pass - 0 finding(s), 145 mention(s)`, `All matched
  files use Prettier code style!`.

## T007 — Pin E7 on every state and name the state the pane was given: pass

- ✅ Landing commit `2fa589b9` (`git show --numstat 2fa589b9`: nine files, +717/−101 — the render suite
  +397/−59, the record suite +159/−15, `page-picker.component.spec.ts` +37/−2, `panel-demo.spec.ts` +42/−6,
  `panel-demo.ts` +13/−11, `panel-console.ts` +10/−2, the recording +31/−3, and T003's Log +4/−0, which is the
  correction appended rather than rewritten).
- ✅ AC1 — E7 runs against every state and every failure names the state and the phrase. At the reviewed HEAD
  `scripts/console-panel-render.test.mjs:596-632` is `pinNoCauseElementRemedy(surface, answer, carried =
  CARRIED_FIELDS)` with `` `no-cause-element-remedy: the ${state} surface must render no ${defect} …` ``,
  `:640` is `pinNoUnattributedAngularWording(surface)`, and `:671` is `pinE7OnEveryState(api)`. The run
  prints one reddening per state: `no-element: the captured-nothing surface must render no element — the
  capture records none and the answer carries none; it rendered ["state: captured-nothing",…,"element:
  <app-root class=\"shell\">"]`; `no-cause-element-remedy: the no-diagnostics surface must render no remedy …
  it rendered ["state: no-diagnostics","no-diagnostics: no capture was handed to the join at all, so no
  capture was read, and a remedy is to hand it one"] (matched /\bremedy\b/i)`;
  `no-cause-element-remedy: the no-diagnostics surface must render no cause … because every console hook
  failed to install … (matched /\bbecause\b/i)`; and `no-unattributed-wording: the wedged surface writes no
  wording of its own naming Angular; it rendered "angular: the framework reported this" in ["state:
  wedged","angular: the framework reported this"]`.
- ✅ AC2 — the `captured-nothing` sentence is read whole and a silence claim reddens naming the claim:
  `absence-statement: the captured-nothing surface says what was read and what it means for the panel, and
  never what the page did — it names the page ("page") outside a denial; it rendered "the page was silent, so
  no diagnostic was captured" (claimed "the page was silent")`, with the prefix evasion still reddening as
  `says what was read: the sentence says what was read — the check reads the sentence and not only its
  prefix; it rendered "captured-nothing: "`. The rule that now fires is the property wave 9's T014 expanded
  the five-word lexicon into, so T007's pin survives on a stronger rule than the one it shipped with.
- ✅ AC3 — the state sentence is an own-property read, and a word the pane was not written for renders that
  word alone: `apps/angular-ai-devtools/src/app/panel-console.ts:422-424` is `const sentence =
  Object.hasOwn(STATE_TEXTS, state) ? STATE_TEXTS[state] : undefined; if (sentence === undefined) return
  surface(state, lines);`, commented at `:417-421` with the four prototype keys by name. Armed, it reddens:
  `given-state: a word the pane was not written for — "constructor" — renders that word and nothing else,
  because the state sentence is looked up as an own property; the pane rendered ["state: constructor",null]
  + actual - expected [ 'state: constructor', + [Function: Object] ]`.
- ✅ AC4 — the no-code absence is guarded against a count, not only the digest-miss sentence:
  `no-code: a count is not a name — the sentence states that the capture's message carried no code, never
  how many did; the pane rendered "no-code: 1 captured message carried no code, so this finding carries no
  code and no title"`.
- ✅ AC5 — both route-table suites that did not assert the count now do, and the suite is green at the count
  they pin: `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts:456-483` asserts the ordered
  twenty-five-path table and then `expect(appRoutes).toHaveLength(25);`, and
  `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1823-1850` does the same, each with a comment naming
  the appended-route hole. Measured at the reviewed HEAD: `npx nx run angular-ai-devtools:test
  --skip-nx-cache` → `Test Files 31 passed (31)`, `Tests 348 passed (348)`, with `panel-demo.spec.ts (12
  tests)` and `page-picker.component.spec.ts (18 tests)` green — 348 is the count T003 recorded, so no spec
  was added or dropped to make the new assertions fit.
- ✅ AC6 — the demo prose states the shape its sample carries: `panel-demo.ts:370-383` says the sample is
  "The join's own answer … `{ state, findings[] }`, where each finding is `{ text, code?, title?, reason? }`.
  That is the answer's shape, not the capture's payload shape (`code`, `message`, `component`, `timestamp`
  …)", and T003's Log carries the correction appended (`:114-117`, four added lines, none removed).
- ✅ AC7 — a pane that renders an extra `cause:` line cannot be blessed by an armed re-capture: the record
  suite polices the recorded bytes (`scripts/console-panel-record.test.mjs:1510`,
  `pinRecordsOnlyTheContractVocabulary`, called on the recorded entry), and the run at the reviewed HEAD
  prints both halves — the live probe `recorded-vocabulary probe: joined surface line 10 is labelled
  "cause", which the record's contract does not carry; it records "cause: the application modified a bound
  value during change detection"` and the passing test `✔ applies every mutation to a source that really
  changed, and a recorded cause line reddens even after an armed capture (1.4419ms)`.
- ✅ AC8 — the provenance sentence says what is derived and what is a suite constant:
  `research/raw/m045-console-panel.json` `capture.reproduces` reads "…every cases[].input and every
  cases[].why are this suite's own fixture constants, not values read from the tree, and so are schema,
  milestone, task, title, question, the whole contract and this prose, and contract.states restates the
  join's three state words…", and `fixture.messageTexts` reads "the message texts are exemplars written in
  the capture's payload shape, not strings a capture recorded".
- ✅ The declared `Verify` passes at the reviewed HEAD: `node --test scripts/console-panel-render.test.mjs` →
  `ℹ tests 40`, `ℹ pass 40`, `ℹ fail 0`; `npm run check:panel` → exit 0 with no diagnostic; `npx prettier
  --check apps/angular-ai-devtools/src/app scripts` → `Checking formatting...` / `All matched files use
  Prettier code style!`. `node --test scripts/console-panel-record.test.mjs` (unarmed, a read) → `ℹ tests
  38`, `ℹ pass 38`, `ℹ fail 0`.

## T008 — Correct the measurement record and pin that text cannot choose an entry: pass

- ✅ Landing commit `9f0603c9` (`git show --numstat 9f0603c9`: five files, +283/−21 — the shapes record
  +112/−8, the gate-stability record +49/−8, `scripts/console-join.test.mjs` +77/−2, the T001 Log +6/−0, and
  the task file +39/−3).
- ✅ AC1 — the install time cites the manifest and names the comment it contradicts, and both readings are
  true of the tree: `research/raw/m045-console-shapes.json` `capture.installTime.manifest` is
  `{"file":"extension/manifest.json","line":36,"runAt":"document_idle", …,"from":"c14"}` with
  `codeCommentContradicted` = `{"file":"extension/agent-main.js","line":2493,"says":"// N4: error capture
  hooks at document_start (console.error, window.onerror,","status":"contradicted by
  extension/manifest.json:36 …"}`. Measured directly: `extension/manifest.json:36` is `"run_at":
  "document_idle"` (the entry whose `js` lists `agent-main.js` at `:34`), and `extension/agent-main.js:2493`
  is `// N4: error capture hooks at document_start (console.error, window.onerror,`.
- ✅ AC2 — the blind spot is the sharp one, with the manifest as its evidence: the `notCaptured` entry reads
  "every diagnostic logged before extension/agent-main.js is injected at document_idle — including
  bootstrap-time NG0xxx codes, the errors this milestone exists to join — and, separately, any diagnostic
  logged after the page replaces console.error…", evidenced by `c14`'s `run_at` reading and the contradicted
  comment, and the older vague "logged before the hooks install" entry is gone from the array (ten entries
  at this head, the eighth of them this task's).
- ✅ AC3 — the containment note is the true relation, and the mislabelled field is gone:
  `captureToDigestGap` is `{"codesTheDigestCarries":64,"digestCodesTheCaptureCanExtract":53,
  "digestCodesTheCaptureCannotExtract":11,…}` with the note "the 53 digest codes the capture's
  /NG0\d{3,}/ can extract are a strict subset of the digest's 64 (c9), so 11 digest codes can never arrive
  as a code; the relation does not run the other way — NG04002 is extractable by the capture's regex (c7)
  and absent from all 64 digest entries…"; `capture`'s key list carries no `codesTheCaptureCanName`
  (`file,fileLines,from,eventName,eventNameDeclaredAt,dispatcher,entryPoints,entryPointCount,entryPointsCrossCheck,payload,codeExtraction,componentResolution,consoleMethods,installTime,hop`).
- ✅ AC4 — every number in the record is a carried command's output, measured at the reviewed HEAD with the
  rule the task states (a leaf under an `exitCode` key is printed by its own run, every other leaf must be a
  decimal token in some carried command's `output`): `numericLeaves: 72`, `printedLeaves: 72`,
  `unprintedLeaves: 0`, `unprinted: none`. The record states no size of its own — the only byte figure in it
  is the digest's `61577 bytes`, which `c10` prints.
- ✅ AC5 — the join's "text cannot choose an entry" rule is pinned by the two mutants the review built:
  `✔ text-fallback reddens naming "message text" (1.7152ms)` and `✔ re-extracted-code reddens naming
  "re-extract" (1.5336ms)`, with the assertions at `scripts/console-join.test.mjs:552-560` and `:573-580` and
  the mutants registered at `:163`/`:1067` and `:173`/`:1068`. Both names appear inside the declared
  Verify's own run (below), so the pins are live and not a claim about the source.
- ✅ AC6 — the T001 Log's corrections are append-only and the control characters are accounted for. The
  appended entry at `:91` restates the corrupted verdict sentence, and the count is settled by measurement at
  the reviewed HEAD: `node -e …` over `.project/tasks/T001-measure-the-capture-and-the-digest.md` gives
  `bytes: 48816 chars: 48462`, `crlf: false loneCR: false`, `controlChars: [[9056,"c"]]` — one control
  character, `U+000C` at index 9056, no carriage return anywhere. The half of `:91` that claimed `U+000D` at
  9064 is corrected in an appended entry by wave 7's T010 (`:94-98`), which is the next task's repair of the
  same file and is reviewed there, not here.
- ⚠️ The declared `Verify` passes at the reviewed HEAD for this task's own two legs:
  `node --test scripts/console-join.test.mjs scripts/recording-consistency.test.mjs` → `ℹ tests 46`, `ℹ pass
  46`, `ℹ fail 0` (39 join tests + 7 consistency tests); `npm run check` → exit 0; `npx prettier --check
  research/raw extension scripts` → `All matched files use Prettier code style!`. The stability record this
  task re-armed is now stale for the reason wave 7's T010 records (its derived mention count is 145 where the
  committed recording carries 139), which is the wave-17 re-derivation class and not a value this landing
  wrote; a concurrent reviewer's armed capture has since written that value into the worktree
  (`git status --porcelain` carries `M research/raw/m056-gate-stability.json`, diff `139 mention(s)` →
  `145 mention(s)`), so the measurement above is of the bytes at the reviewed HEAD.

## Intent coverage

Wave 6 owns no success criterion, and this record therefore states no `### SCn` heading: T006, T007 and T008
each declare `Intent coverage: None` in their briefs, so the wave's owned-criteria set is empty and a heading
here would claim a criterion the wave's own contracts do not carry. What the three tasks do carry is
evidence inside criteria other waves own, named with the wave that owns it:

- ✅ yes — **SC2** ("A diagnostic whose code the digest carries is reported with that entry's title, and the
  join is proven against the shipped `extension/error-digest.json` rather than a fixture.") is the criterion
  T008's two pins defend from the other side: N2 forbids choosing an entry by message text, and the two
  mutants that enforce it redden in the reviewed run (`✔ text-fallback reddens naming "message text"`,
  `✔ re-extracted-code reddens naming "re-extract"`) while the join still reads the shipped digest
  (`scripts/console-join.test.mjs:543` `api.consoleJoin([diag(MISSING_CODE, text)], SHIPPED)`). Wave 2's T002
  owns this criterion; this wave only holds its prohibition.
- ✅ yes — **SC5** ("The surface renders only what the capture states: no cause, no element, no fix, and no
  "angular" attribution that the message text does not carry.") is the criterion T007's E7 work is a repair
  of, because the intent's own edge table files E7 under SC5 (`| E7 | SC5 | boundary | held-out | A suite must
  pin that the surface renders no cause, element, remedy or unattributed angular wording. |`). At this head
  the suite runs that pin on `joined`, `captured-nothing`, `no-diagnostics` and a given word, and each
  failure names its state. The criterion is owned and recorded by wave 5's T004 and wave 12's T019 (and wave
  16's T023 holds the field it renders), so what wave 6 supplies here is the E7 pin and not a claim of
  ownership.
- no — **SC1, SC3 and SC4** are not touched by this wave and are not claimed here. T006 changes no capture
  path (SC1/SC3's findings are T002's and T003's), and the one repair in this wave-set that does reach SC3's
  count prohibition is T009's, in wave 7.
