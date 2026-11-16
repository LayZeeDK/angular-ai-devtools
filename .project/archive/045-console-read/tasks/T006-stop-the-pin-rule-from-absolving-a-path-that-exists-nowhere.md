---
id: T006
title: Stop the pin rule from absolving a path that exists nowhere
wave: 6
deps:
  - T005
status: done
agent: build_T006
base: 19c199c317436e6f8197046d02423621f89a4068
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T006 — Stop the pin rule from absolving a path that exists nowhere

## Context

Wave 4's review proved the pin branch disarms the exists-nowhere refusal for the two path
shapes tasks actually declare. `isPinnable` (`scripts/gate-integrity.mjs:209-215`) tests a declared path by
*spelling* — `SUITE_PATH`, `RECORDING_PATH` or `existsSync` — and the pin branch (`:1545-1550`) accepts two
absences as equal (`:1295-1297`). A task declaring a suite-shaped name and a recording-shaped name, both carried by no commit and no tree,
printed as `pin … not judged as a change`, while only a declaration shaped like neither was refused. The rule's
own text (`:96-98`) demands the opposite, and the shipped tests cannot see it: AC7 pins a recording the tree
carries (`scripts/gate-integrity.test.mjs:3295`) and the default-tasks fixture's absent case is deliberately
not suite-shaped (`scripts/gate-integrity-default-tasks.test.mjs:80`).

Two smaller defects in the same reading. The declaration match strips a leading a dot-slash prefix (`:1509`) but the range
match does not (`:1536-1538`), so a Log naming that path with a leading dot-slash is refused
claim-absent-from-the-range while the bare spelling passes. And `rangeEnds` promises null for a range it
cannot split (`:1256-1259`) yet returns `{ base: 'a', head: '.b' }` for a three-dot range (`:1264-1271`), so a
three-dot range is read one way by the pin and another by `nameStatus`. Separately (pre-existing), --tasks
pointing at a single markdown file crashes with ENOTDIR: fromPath calls readdirSync (line 1351)
before testing whether the argument ends in the markdown suffix (line 1352).

## Approach

- - Require existence, not spelling: a path is pinnable only when some commit in the range or the tree
  carries it. Two absences are equal only for a path that exists somewhere; a declared path that exists
  nowhere is a claim and a finding, whatever its shape.
- Normalise the token once, before both the declaration test and the range test, so the dot-slash spelling and the bare spelling read
  identically in the pin branch and the claim branch.
- Make `rangeEnds` refuse a range it cannot split exactly as its docstring says, so a three-dot range is
  reported rather than guessed; do not silently reinterpret it.
- Read the single-file --tasks argument before any directory listing.
- Add a test per defect that reddens naming it: an absent suite-shaped path refused, an absent
  recording-shaped path refused, dot-slash and bare spellings agreeing, a three-dot range refusing with its form
  named, and a single-file --tasks reading one file. Mutants for the first two.

## Acceptance criteria

1. A declared path carried by no commit and no tree is refused as a claim, proven for a suite-shaped and a recording-shaped name, with the message naming the path and the range.
2. A Log naming a path with a leading dot-slash and one naming it bare produce the same verdict at the same head, proven by running both.
3. A three-dot range is refused with the range form named rather than read as a two-dot range; the refusal does not guess a head.
4. --tasks given a single markdown file reads that file's task and exits 0; a directory still reads every task file.
5. The two behaviour changes are each armed by a mutant that reddens naming its defect, and the armed re-capture of `research/raw/m044-gate-shapes.json` leaves it byte-identical on an unarmed run.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.


## Intent coverage

- None

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs && npm run check
```

## Log

- Task written at the repair cycle; not started.
- 2026-11-16 - built at head 19c199c3 (branch gsd-path/M057), base c98d6ee6. No branch cut, no commit:
  the three declared files are the only files written.
- Defect 1, the pin rule absolved a path that exists nowhere. `isPinnable` (`scripts/gate-integrity.mjs:235`)
  no longer tests a spelling: `:243` asks this tree, and `:246-249` ask the blob at each end of the range, so a
  path is pinnable only when some commit in the range or the tree carries it; a declared path nobody carries
  stays a claim and a finding. The spelling rule survives only as the mutant `fix-record-pin-by-spelling`
  (`:236-242`). The rule was measured over M035's range
  (99054909bd019afd578172200a07b64194e6489e..eb24d1e2deca1deed7992e46a965bb314864b6a1) with
  `scripts/absent-probe-suite.test.mjs` and `research/raw/m999-absent-recording.json`: each is now 1 claim,
  0 pins, 1 finding `claim-absent-from-the-range` naming the range; under the mutant each is 1 pin and 0
  findings, which is the review's live evidence reproduced.
- A Log that names a suite by its bare basename now pins the file its own `files:` list spells
  (`scripts/gate-integrity.mjs:1606`, `judged` at `:1626`, used at `:1648`). Without that resolution the
  gate's own run over `.project/tasks` refused: M045's T002 log names
  `gate-integrity-default-tasks.test.mjs` where its front matter spells `scripts/...`, and the existence
  rule would have read that basename as a root-relative path that exists nowhere. Measured:
  `node scripts/gate-integrity.mjs --check fix-record` = `fix-record clean - examined 82 claim(s) ... 0
  finding(s), 74 mention(s)`, pins 2 (that suite and `scripts/recording-consistency.test.mjs`).
- Defect 2, the normalisation asymmetry. The token is normalised once (`scripts/gate-integrity.mjs:1598`)
  before the declaration test (`:1606`) and the range test (`:1599`), so a `./`-prefixed spelling and a bare
  one read identically in the pin branch and the claim branch. Measured over M044's range
  (d94502d174aff31b0b1ebbab200d5e47939dec39..53f93bb555ef1805934442b90976dcc807b1bda1) on
  `research/raw/m044-gate-shapes.json`: bare = `{ok:true, claimsExamined:1, pinsExamined:0,
  inTheRange:[true], findings:[]}` and `./`-prefixed = the same object; under the mutant
  `fix-record-token-unnormalised` (`:1599`) the prefixed form reads `inTheRange:[false]` with one
  `claim-absent-from-the-range` finding, which is the asymmetry the review measured.
- Defect 3, `rangeEnds` guessed on a range it cannot split. `scripts/gate-integrity.mjs:1304` now refuses
  any split that is not exactly two parts (`:1306`) and any head that opens with a dot or base that closes
  with one (`:1312`), and `checkFixRecord` refuses the range up front (`:1534`) naming the form through
  `rangeForm` (`:1323`): measured, `d94502d174aff31b0b1ebbab200d5e47939dec39...53f93bb555ef1805934442b90976dcc807b1bda1`
  is refused with `the range "..." is a three-dot range (\`base...head\`), and the pin reading compares a
  path's blob at exactly two commits, so this check refuses rather than splitting it into a base and a head
  that no commit carries`, examined 0, and the two-dot pair over the same task stays clean.
- Defect 4, a single markdown `--tasks` argument crashed with ENOTDIR. `scripts/gate-integrity.mjs:1412`
  now tests the markdown suffix before `:1418` lists a directory, so one file is read as that file.
  Measured: `--tasks <tmp>/T912.md` exits 0 with `tasksExamined` 1 and the task the argument named, and
  `--tasks <tmp>` still reads both files it holds.
- Five tests appended to `scripts/gate-integrity.test.mjs` (after the last line the record pins, naming no
  dot-project path), one per defect: `:4703` (suite-shaped absent), `:4779` (recording-shaped absent),
  `:4845` (dot-slash vs bare), `:4904` (three-dot range), `:4970` (single-file `--tasks`).
- Mutants, armed and restored. Arming the suite-shaped test with `MUTANTS.fixRecordPin` reddened with
  `AssertionError: a suite-shaped path that exists nowhere is not a pin: the pin rule must not absolve a
  path that exists nowhere, and it pinned ["scripts/absent-probe-suite.test.mjs"]`; the recording-shaped
  test reddened with the same sentence naming `research/raw/m999-absent-recording.json`; arming the
  dot-slash test with `MUTANTS.fixRecordToken` reddened with `a Log naming ./research/raw/m044-gate-shapes.json
  and one naming research/raw/m044-gate-shapes.json must produce the same verdict at
  d94502d17...2b90976dcc807b1bda1 ...`. Each restore was verified byte for byte:
  sha256 c861dd4fb3cb24ec89ce358d2f8dd44ff9439591c2709636ff5f768213b54f88 (189527 bytes) before arming and
  after restoring, three times.
- `research/raw/m044-gate-shapes.json` re-armed with `set "M044_CAPTURE=1"&& node
  --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`: the capture reported `nothing moved,
  nothing written` and wrote 108668 bytes at sha256
  e51be7818e890491785d7f9f2ac5dcae02c45927daed9c0dbd3683e0cbfed3d0; the unarmed run then left it
  byte-identical at the same sha256 e51be7818e890491785d7f9f2ac5dcae02c45927daed9c0dbd3683e0cbfed3d0 (the
  suite's own E6 pin prints both hashes). The record moved three times while this task ran
  (aa74f81d -> b8eca2ff -> 69fe75e5 -> e51be781) because wave 6's sibling tasks were editing
  `scripts/console-join.test.mjs`, `scripts/console-panel-record.test.mjs`,
  `scripts/console-panel-render.test.mjs` and the app spec files in this same working tree: each armed run
  re-read the whole tree, so its suite-diff line counts and its test-declaration count follow whatever those
  files held at that moment. My own arm is in the record and stays there: this suite's row is now
  `A scripts/gate-integrity.test.mjs: +5042/-0, assertions +296/-0` and `wholeTree.declarations.tests` is
  2466 (2461 + the five added tests).
- Verify, run exactly: `node --check scripts/gate-integrity.mjs && node --test
  scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs && npm run check` - exit 0;
  `node --check` silent, 44 tests / 44 pass / 0 fail, and `npm run check` green through
  `skill-lint: 26 SKILL.md files, no findings`, `skills-registered: 18 project skill(s)`, both tsc panel
  checks, `gate-integrity: pass - 0 finding(s)` (archive-paths), `gate-integrity: fix-record clean -
  examined 82 claim(s) ... 0 finding(s), 74 mention(s)` and `All matched files use Prettier code style!`.
  Two earlier attempts of the same command failed on files this task does not own, while those siblings were
  mid-edit - `suiteDiff.differing[7].addedLines: 1240 -> 1239` for `scripts/console-panel-render.test.mjs`,
  and `apps/angular-ai-devtools/src/app/app.routes.ts(182,16): error TS2304: Cannot find name
  'PanelDemoComponent'` - both green on the next save without any change here.
- `npx prettier --check scripts/gate-integrity.mjs scripts/gate-integrity.test.mjs
  research/raw/m044-gate-shapes.json` = `All matched files use Prettier code style!`.
- Final sha256: `scripts/gate-integrity.mjs` adf9860aaf73974b8b55ed7de50321c7601b709fc81e1135653831056a763bc2
  (95871 bytes), `scripts/gate-integrity.test.mjs`
  c861dd4fb3cb24ec89ce358d2f8dd44ff9439591c2709636ff5f768213b54f88 (189527 bytes),
  `research/raw/m044-gate-shapes.json`
  e51be7818e890491785d7f9f2ac5dcae02c45927daed9c0dbd3683e0cbfed3d0 (108668 bytes). No file outside the
  three declared ones was written.
- The fix-record stage re-run after this Log landed still reports `fix-record clean` with 0 finding(s) and
  the same two pins (its claim and mention counts grew by this Log's own tokens); `npm run check` was green
  with it in place.
ready
