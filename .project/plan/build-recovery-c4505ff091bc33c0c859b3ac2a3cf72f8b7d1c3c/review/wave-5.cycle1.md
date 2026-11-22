# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: a7a1e28acae204f781a6ccf30ea80423c22a85dd

## T005 — Re-derive the two gate records and the census: pass

Task landed as `fce943d5` ("T005: Re-derive the two gate records and the census"), whose suite diff is
`research/raw/m044-gate-shapes.json` (+111/−47), `research/raw/m056-gate-stability.json` (+4/−4),
`scripts/gate-integrity.test.mjs` (+4) and the task Log. The review head is five landings past the
record's, so every number below was re-derived here with my own commands rather than read off the
records — the stronger check, and the one that found the staleness in GAP 1.

- ✅ SC5: both gate records are re-derived by their own armed commands, stability last, and each is idempotent on a second armed run: the landing ran `M044_CAPTURE=1 node --experimental-strip-types --test scripts/gate-integrity.test.mjs` and then `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs`, stability last, and the T005 Log records 40 pass / 0 fail default and 41 armed for the first, 8 pass / 0 fail default and 9 armed for the second, with a second armed run changing no byte; the landed census values still re-derive at this review head — the run prints `archiveReferences: 195 reference(s) in 167 suite(s) of 327 listed file(s)`, the recorded 327/167 — while the one divergent field at this head (`suiteDiff.differing[27].addedLines: 2689 -> 2717`) is T007's later edit to `scripts/teardown-leak-shapes.test.mjs`, not this landing (GAP 1).
- ✅ No assertion is loosened and no recorded count is lowered to make a red green: the derived counters in the failing assertion's own dump report `removedAssertionLines: 196, recutAssertionLines: 196, droppedAssertionLines: 0` — every removed line was re-cut by its own suite, none dropped — and the two records' changed census rows move in the tree's direction (`323 -> 327` files, `165 -> 167` suites), never down to clear a red.
- ✅ The moved values are recorded in the Log with the command that produced each: the T005 Log lists `archiveReferences.filesExamined` 323 → 327 and `archiveReferences.suitesExamined` 165 → 167, "all measured after the last T005 landing", beside the armed captures that produced them, and this review re-derived both at this head from the census line quoted above (`167 suite(s) of 327 listed file(s)`).

### The commanded checks, run verbatim at this review head

`node --experimental-strip-types --test scripts/gate-integrity.test.mjs` — **40 tests, 39 pass, 1 fail**:

```
ℹ tests 40
ℹ pass 39
ℹ fail 1
✖ T004: the three new sections are what this head derives, so a default run is a read (4.0374ms)
  AssertionError [ERR_ASSERTION]: suiteDiff in the recording is not what this head derives:
  "suiteDiff.differing[27].addedLines: 2689 -> 2717"
      file: 'scripts/teardown-leak-shapes.test.mjs',
      addedAssertionLines: 109,
  +   addedLines: 2689,
  -   addedLines: 2717,
```

`node --test scripts/gate-stability-record.test.mjs` — **8 tests, 7 pass, 1 fail**:

```
ℹ tests 8
ℹ pass 7
ℹ fail 1
✖ the three sections are what this head derives, so the record cannot drift from the tree (18238.3671ms)
  Error: the recording disagrees with this run's derivation at 2 value(s) (re-capture with M056_CAPTURE=1
  after naming what moved): fixRecord.exitCode: 0 -> 1; verdict: "all 3 measurements pass at this head:
  the fix-record stage held to M044 exits 0 with no refusal, the gate-integrity suite exits 0 with no
  refusal and the fix-record stage on this branch exits 0 with no refusal" -> "1 of the 3 measurements
  does not pass at this head: ... the gate-integrity suite exits 1 with no refusal ..."
```

Both failures have one root cause and it is not T005: T007 later edited
`scripts/teardown-leak-shapes.test.mjs` (+28 lines — 2,690 lines at `fce943d5`, 2,718 at this head,
both counted), the m044 row for that suite still pins the pre-T007 `addedLines: 2689`, and the m056
stability record's pinned `fixRecord.exitCode: 0` inherits the red. The failing deep-equal diff names
exactly one divergent field (`addedLines`), so at T005's own landing head the record row was exact:
2,689 is precisely the diff-added line count of the suite at `fce943d5`. This is wave 7's
re-derivation debt (see GAP 1); it blocks re-shipment of the gate records, not this verdict on T005.

### The substantive question: are the two `SUITE_DIFF_REASONS` entries true readings, or prose to unblock a gate?

**True readings — verified claim by claim against the suites' own code — with one prose figure that is
a prediction rather than a measurement (GAP 2).** The mechanism that forces them is honest: a suite
that differs from the measured baseline `d94502d1` with no entry reddens the derivation
(`scripts/gate-integrity.test.mjs:4012-4016`: "`${file} differs from ${MEASURED_HEAD}` and no reason
was read for it, so recording it would be a guess rather than a reading of the diff"), the added-line
and assertion-line counts in the same rows are derived by `git diff --numstat d94502d1 ...` (`:4495`
test's command string), and T005 appended its two entries in a trailing `Object.assign(SUITE_DIFF_REASONS, …)`
block (`:5645-5649`) so no pinned line number above it moved. The prose explains; the numbers are measured.

**Entry 1 — `scripts/teardown-leak.test.mjs` (`gate-integrity.test.mjs:5646-5647`), "wholly added at
this head … eighteen tests with seven in-memory mutants, each pinning the shipped answer first and
then naming the defect by string, and no shipped assertion was loosened":**

- "wholly added at this head" — true: `git cat-file -e d94502d1:scripts/teardown-leak.test.mjs`
  answers `fatal: path … exists on disk, but not in 'd94502d1…'`; the suite first lands at `9b45eed5`
  (M059 T002), after the baseline.
- "eighteen tests" — true: 18 `test(` declarations, counted programmatically at `fce943d5`; titles run
  from `T002 — the join is a bare-context module with the contract's four states and two absences`
  (`:1`) through `T002 mutant M7 — the body read from `message` instead of `text` reddens the body pin
  (C3)` (`:1406`).
- "seven in-memory mutants" — true: M1–M7 at `:1225, :1265, :1293, :1322, :1349, :1378, :1406`, and the
  suite's own comment states the mechanism: "The mutants change an in-memory copy of the module's
  source, never the file on disk" (`:40`).
- "each pinning the shipped answer first and then naming the defect by string" — true: every mutant
  test asserts `failure !== null, 'the mutant must redden the pin that names it'` and then matches
  `mutation.names` in the failure text (e.g. `:1250-1254`).
- "the code and the body read from the message own text … the owner only from a field the message
  carries … the two absences owner-not-in-the-message and handle-record-not-held kept as two states in
  every answer … the sequence rendered as release-then-diagnostic with no handle named as a cause" —
  each maps to a real pin: M7 pins body-from-`text` (C3), M2 pins owner-not-from-arrival-order (SC1,
  N1), test 7 + held-out E5 + M6 pin the two-state absences, test 6 + M3 pin release-then-diagnostic
  (SC3). Nothing in the entry names a claim the code does not carry.
- "no shipped assertion was loosened" — trivially true of a wholly added suite; the derived row agrees
  (`droppedAssertionLines: 0`).

**Entry 2 — `scripts/teardown-leak-shapes.test.mjs` (`gate-integrity.test.mjs:5648-5649`), "edited here
rather than renamed: M059 T006 added the four artefacts this milestone itself adds to the suite
exclusion list — its own source, the record, extension/teardown-leak.js and
scripts/teardown-leak.test.mjs — because without them a landing elsewhere moved the denominators from
38 modules and 136 suites to 39 and 137, and because a record that merely quotes NG0205 flipped the
derived producible verdict from not-produced to produced with eighteen page hits nobody observed; the
head recorded by the git rev-parse entry is now derived from the capture own head … the thirteen
default assertions and fourteen armed ones are additions to the rule, none removed":**

- "edited here rather than renamed" — true: `git log --follow -- scripts/teardown-leak-shapes.test.mjs`
  is one path across `99afb9ea` → `03e86d55` → `a7a1e28a`.
- the four named artefacts are exactly the landed list
  (`scripts/teardown-leak-shapes.test.mjs:138-143`); but the attribution is loose — T006's diff added
  two of the four (`extension/teardown-leak.js`, `scripts/teardown-leak.test.mjs`); T001 had added the
  suite's own source and the record (GAP 3).
- "from 38 modules and 136 suites to 39 and 137" — true, and I re-derived it from the trees rather
  than trusting it: `git ls-tree -r --name-only` at T001's landing (`99afb9ea`) counts 38 `extension/*.js`
  and 137 `scripts/*.mjs` (measured 38/136 with the one T001 exclusion); at T002's landing
  (`9b45eed5`) 39 and 138 (measured 39/137 pre-T006, since only the suite itself was excluded). The
  numbers are the measured `filesSearched` values, and they moved exactly as the prose says.
- "the head recorded by the git rev-parse entry is now derived from the capture own head" — true:
  T006's diff replaces `commands: COMMANDS` with
  `commands: COMMANDS.map((entry) => entry.command === HEAD_COMMAND ? { ...entry, output: head } : entry)`.
- "thirteen default assertions and fourteen armed ones … none removed" — true: the T006-era tree runs
  13 tests default / 14 armed, and T006's diff removes no test — it rewords one comment, adds the two
  exclusions and the commands mapping.
- "eighteen page hits nobody observed" — **not a measurement** (GAP 2): it is the figure from T006's
  task Context ("20 occurrences instead of 2", `.project/tasks/T006-…md:31`), and no tree state
  produces it — see GAP 2 for the three numbers that are measurable instead.

## Findings

### GAP 1 — The gate records T005 re-derived are stale at this review head, and both commanded checks fail

`m044-gate-shapes.json` pins `addedLines: 2689` for the shape suite; the tree derives 2717 (T007's
+28-line rule rewrite), so `gate-integrity` exits 1 (39/40) and `m056-gate-stability.json`'s pinned
`fixRecord.exitCode: 0` and "all 3 measurements pass" verdict disagree with the run (7/8). Verified
not to be T005's defect: the failing row's deep-equal diff names only `addedLines`, and the suite was
exactly 2,689 diff-added lines at `fce943d5` (2,690 lines counted). The prose entries remain true
readings of what they describe.
Risk: high for the ship gate — every subsequent verify that reads these records fails until
`M044_CAPTURE=1` and `M056_CAPTURE=1` are re-run and the moved value re-explained. Not blocking this
verdict on T005; blocking re-shipment. The repair belongs to wave 7's follow-up, since T007's edit
created the drift.

### GAP 2 — "eighteen page hits nobody observed" is a prediction carried into the reason string, not a number any tree produced

T006's Context predicted the flip as "147 records … 20 occurrences instead of 2" with 18 page hits
(`.project/tasks/T006-repair-the-shape-suite-the-milestones-own-artefacts-moved.md:31`). Measured
states: the surface record as T004 actually landed it quotes `NG0205` on 14 lines, **none** matching
the T006-era enumeration shapes (`git show 4f67e837:research/raw/m059-surface.json`, counted: 14
page-hit-shaped, 0 enumeration-shaped) — so the post-T004/pre-T007 derivation would have read 17
occurrences, 15 `onAPage`; and the fully unexcluded counterfactual at T006's own tree reads 24
occurrences, 3 enumeration-shaped, 21 `onAPage` (survey over `research/raw/*.json` with the T006-era
rule `scripts/teardown-leak-shapes.test.mjs:478-481, :490` of that tree). Eighteen matches none of
these; the mechanism (quotation rendered as page hit) and direction (`not-produced` → `produced`) are
right, the figure is prose. The record that ships this sentence is `m044-gate-shapes.json`'s suiteDiff
row, so a reader could take 18 as measured.
Risk: low — the counts beside the prose are git-derived and correct, and the claim's substance was
soon borne out at 15; reword at the next m044 re-derivation (which GAP 1 forces anyway).

### GAP 3 — The reason string credits T006 with the whole four-file exclusion list; T006 added two of the four

`OWN_ARTEFACTS` held the suite's own source and the record from T001 (`99afb9ea`); T006's diff adds
`extension/teardown-leak.js` and `scripts/teardown-leak.test.mjs`
(`git show 03e86d55 -- scripts/teardown-leak-shapes.test.mjs`). "M059 T006 added the four artefacts …
to the suite exclusion list" overstates the task's own delta, though the four names it lists are
exactly the landed state.
Risk: informational — the list content is right and the task Log states the delta correctly ("The
suite now excludes four … rather than two", T006 Log); no number depends on the attribution.

### Verification of the census claims in the Log

T005's Log states `archiveReferences.filesExamined 323 → 327` and `suitesExamined 165 → 167`; the
re-derived run at this head prints `archiveReferences: 195 reference(s) in 167 suite(s) of 327 listed
file(s)` and `wholeTree: 197 suite(s) of 502 listed file(s)` — the landed values still re-derive
(references have since grown 165-era → 195, which is the tree moving, not the record lying; the
recorded 327/167 are current).

## Intent coverage

### SC5 — The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface.: pass

- ✅ T005 serves SC5 through its enforcement chain, and the chain re-derives: the m044 census is the
  check that would catch a table suite left behind by a surface task (prohibition N5's backstop), and
  this review re-derived its suiteDiff at a head five landings later — every one of the 44 differing
  suites carries a reason (`counts: { differing: 44, edited: 16, added: 28, … droppedAssertionLines: 0 }`
  in the failing assertion's own dump), the two M059 additions carry the true readings judged above,
  and the one red field is T007's later edit, not a missing update.
- ✅ The two new suites T005's entries explain are exactly the suites SC5's table updates added or
  moved: `scripts/teardown-leak.test.mjs` (the join's 18 tests) wholly added, and
  `scripts/teardown-leak-shapes.test.mjs` edited — with the exclusion repair that keeps its
  denominators describing the tree the panel tables were measured against.
- ✅ No assertion was loosened anywhere in T005's landing: the derived counters report
  `removedAssertionLines: 196, recutAssertionLines: 196, droppedAssertionLines: 0` — every removed
  line was re-cut by its own suite, none dropped.

## Commands and their output (verbatim)

### `node --experimental-strip-types --test scripts/gate-integrity.test.mjs`

```
ℹ archiveReferences: 195 reference(s) in 167 suite(s) of 327 listed file(s); {"archived-by-the-move":17,"deliberate-archive-read":29,"undecided":149}
ℹ wholeTree: 197 suite(s) of 502 listed file(s) {"scripts":122,"extension":11,"apps":34,"src":2,"skills":28,"total":197}, 2526 test declaration(s) in 329 group(s)
✖ T004: the three new sections are what this head derives, so a default run is a read (4.0374ms)
  AssertionError [ERR_ASSERTION]: suiteDiff in the recording is not what this head derives: "suiteDiff.differing[27].addedLines: 2689 -> 2717"
ℹ tests 40
ℹ pass 39
ℹ fail 1
```

### `node --test scripts/gate-stability-record.test.mjs`

```
ℹ research/raw/m056-gate-stability.json at load: 6568 bytes, sha256 7ba99fcdc04a60c8eda4a26a169ffca340590d90e8cd5b230146ac1bbca25bf9
✖ the three sections are what this head derives, so the record cannot drift from the tree (18238.3671ms)
  Error: the recording disagrees with this run's derivation at 2 value(s) (re-capture with M056_CAPTURE=1
  after naming what moved): fixRecord.exitCode: 0 -> 1; verdict: "all 3 measurements pass at this head: …"
  -> "1 of the 3 measurements does not pass at this head: … the gate-integrity suite exits 1 …"
ℹ tests 8
ℹ pass 7
ℹ fail 1
```

### Baseline and tree counts (my own commands)

```
$ git cat-file -e d94502d174aff31b0b1ebbab200d5e47939dec39:scripts/teardown-leak.test.mjs
fatal: path 'scripts/teardown-leak.test.mjs' exists on disk, but not in 'd94502d174aff31b0b1ebbab200d5e47939dec39'

$ node <count-scan-globs per commit via git ls-tree -r --name-only>
99afb9ea {"extension.js":38,"scripts.mjs":137,"researchRaw.json":147}
9b45eed5 {"extension.js":39,"scripts.mjs":138,"researchRaw.json":147}
03e86d55 {"extension.js":39,"scripts.mjs":138,"researchRaw.json":147}
fce943d5 {"extension.js":39,"scripts.mjs":138,"researchRaw.json":149}

$ node <count test()/mutant markers in fce943d5:scripts/teardown-leak.test.mjs>
test() declarations: 18
lines mentioning mutant: 43   (M1..M7 blocks at :1225,:1265,:1293,:1322,:1349,:1378,:1406)

$ node <line counts of scripts/teardown-leak-shapes.test.mjs>
at fce943d5: 2690 lines (2689 diff-added)   at HEAD: 2718 lines (2717 diff-added)
```

### NG0205 surveys behind GAP 2 (T006-era rule `/^"output": "/` or `/^"NG0205",$/`)

```
$ node <survey of git show 4f67e837:research/raw/m059-surface.json>
m059-surface-at-4f67.json | NG0205 lines: 14 | enumeration-shaped: 0 | page-hit-shaped: 14

$ node <survey of m059-record-shapes.json at cf5d56ed>
NG0205 lines at cf5d56ed: 22 | enumeration-shaped: 1 | page-hit-shaped: 21

$ node <no-exclusion research/raw scan at the 03e86d55 tree>
occurrences 24 | enumeration 3 | onAPage 21 | records 153 (recursive; 147 top-level)
```

## Files read

| File | Status |
|---|---|
| `.project/tasks/T005-re-derive-the-two-gate-records-and-the-census.md` | read, 100% (68/68 lines) |
| `.project/tasks/T006-repair-the-shape-suite-the-milestones-own-artefacts-moved.md` | read, 100% (80/80 lines; source of the Context figures judged in GAP 2) |
| `.project/intent/INTENT.md` | read, 100% (119/119 lines; SC5 criterion verbatim from `:79-83`) |
| `.project/review/wave-4.cycle1.md`, `wave-5.cycle1.md` (stub), `wave-6.cycle1.md` (stub), `wave-7.cycle1.md` | read, 100% (108, 17, 17, 203 lines; grammar and cross-wave facts) |
| `scripts/gate-integrity.test.mjs` | not read whole (5,726+ lines); `SUITE_DIFF_REASONS` contract and entries at `:3566-3578`, `:4006-4018`, `:5640-5665` read directly, the failing assertion and its full diff read from the run output (~2%) |
| `scripts/teardown-leak-shapes.test.mjs` (HEAD and `fce943d5` blobs) | not read whole (2,718 lines); exclusion block `:128-170`, scan `:422-455`, T006-era NG0205 rule `:458-494`, T007 rule `:478-522` read; line counts taken programmatically (~5%) |
| `scripts/teardown-leak.test.mjs` | not read whole (1,431 lines); 18 test titles and all 43 mutant-mentioning lines read programmatically (~5%) |
| `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json` | not read directly; their pinned values were read out of the two failing assertions' `actual`/`expected` dumps, which is the record content the checks compare (~1%) |
| `research/raw/m059-surface.json` (T004 blob), `research/raw/m059-record-shapes.json` (cf5d56ed blob) | not read whole; NG0205 line surveys only (14 and 22 lines) |
| `scripts/gate-stability-record.test.mjs` | not read; judged through its run output |
