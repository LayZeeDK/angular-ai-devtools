# Review — wave 8, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 5b71032601c15f0a830f365c350c46262b63326b

## T009 — Re-measure the census and run the project verify: pass

- ✅ The census arithmetic is right and is re-derived, not read back: a count of the JSON files
  under `research/raw` at this checkout returns 146, the record excludes itself from its own scan
  (`research/raw/m057-record-shapes.json:572` — `"excludedFromItsOwnScan": "m057-record-shapes.json",`),
  and 146 − 1 = 145 is exactly what the landing wrote
  (`research/raw/m057-record-shapes.json:571` — `"jsonFilesScanned": 145,`). The suite holds the
  equality against its own tree scan on every run
  (`scripts/tutor-signals-shapes.test.mjs:434` — `assert.equal(files.length, stated.jsonFilesScanned);`),
  the count the plan predicted before the wave ran
  (`.project/plan/PLAN.md:470-471` — "T004's capture writes the verdict-claims record, one more
  recording, so the census measures 145 at the head T004 leaves"), and this review's own run of the
  suite is green: `ℹ tests 21 / ℹ pass 21 / ℹ fail 0`. The landing's diff is the two record values
  and nothing else: `git show --stat 5b710326` reads `research/raw/m056-gate-stability.json | 2 +-`,
  `research/raw/m057-record-shapes.json | 4 ++--`,
  `.project/tasks/T009-re-measure-...verify.md | 6 +++---`, `3 files changed, 6 insertions(+), 6
  deletions(-)` — no suite and no source file among them, as AC2 and AC3 demand.
- ✅ `filesExcludedAsBuildOutput: 50` is a real measurement, reproduced in this review: a file walk
  over `extension/` at this checkout counts 109 files in total, 50 under `extension/panel/`, and 59
  under `extension/` excluding `extension/panel/` — the 59 the record states as its scanned authored
  set (`research/raw/m057-record-shapes.json:511` — `"filesScanned": 59,`) and the 50 it states as
  the excluded build output (`:512` — `"filesExcludedAsBuildOutput": 50,`). 59 + 50 = 109 is
  internally consistent and both halves measure true here. What the value is *not* is a measurement
  the shipped head carries or any suite pins — that is GAP 2 below, not a false count.
- ✅ The project verify's own summary lines carry every count the Log states, quoted from
  `.project/build/verify-T009.log` rather than re-run (the verify took ~18 minutes of wall clock and
  this review does not repeat it): the full leg `ℹ tests 1868 / ℹ suites 261 / ℹ pass 1868 / ℹ fail 0`
  (`:3702-3705`), user scope `ℹ tests 60 / ℹ pass 60 / ℹ fail 0` (`:3788-3790`), skills
  `ℹ tests 320 / ℹ pass 320 / ℹ fail 0` (`:4117-4119`), app `Test Files 31 passed (31)` and
  `Tests 360 passed (360)` (`:4167-4168`), held-out
  `held-out corpus: 22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed (12m 49s)` (`:4206`).
  The Log's leg order and build-leg details match too: `Cache: Skipped (--skip-nx-cache)` (`:88`)
  under the build that leads, and the two observed-and-recorded items are real — the Angular warning
  `bundle initial exceeded maximum budget. Budget 520.00 kB was not met by 14.52 kB with a total of
  534.52 kB` (`:4211`) beside the project's own baseline leg
  `measured initial total 534.52 kB (534524 B over 9 eager files) against the 535.44 kB baseline`
  and `margin 0.92 kB` (`:1577`, `:1579`), and the untracked verification artifact
  `.project\review\VERIFICATION.json` the `check` stage writes (`:127`).
- ✅ "Nothing re-derived after it" holds at the byte level. The verify log's header names the head
  it measured — `head: 12cc196cb1b12e94bf2c16f54f35c7f15db42798 at 2026-11-21T22:04:43.853Z`
  (`.project/build/verify-T009.log:1`) — which is the "settle before T009" commit, and its own
  census leg already passed 21/21 (`:23-26`), which asserts 145; so both re-derived values were in
  the working tree the verify measured, and the landing commit `5b710326` (authored 23:04:48) adds
  only the task file's status/base/agent front-matter and Log plus the two record values that were
  already measured. The bytes written after the verify are the task file's own Log — the artefact
  every task writes and the gate's fix-record stage reads as declarations, pinning T009's declared
  paths "declared and byte-identical" (`.project/build/verify-T009.log:143-146`).
- ✅ The stability record's re-derivation is a real gate-measured value, not a free edit: the m056
  diff is one line, the fix-record stage summary
  `"summary": "gate-integrity: pass - 0 finding(s), 11 mention(s)"` →
  `"summary": "gate-integrity: pass - 0 finding(s), 12 mention(s)"`
  (`research/raw/m056-gate-stability.json:33`), and the verify log's own live run of the same stage
  prints the moved value — `gate-integrity: pass - 0 finding(s), 12 mention(s)`
  (`.project/build/verify-T009.log:159`) — the extra mention being T009's own Log line naming
  `VERIFICATION.json` (`:158`).
- ⚠ Declared limit, not a defect: the Log's closing line is headed "Landed paths" and names nine
  paths (`.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md:143`), while the
  commit lands three (`git show --stat 5b710326`). The gate reads that line the way the template
  means it — as declarations of paths this task touches that must stay byte-identical, pinned
  "recorded and not judged as a change" (`.project/build/verify-T009.log:143-146`) — and the same
  line shape exists in the predecessor tasks the gate pins the same way (T006's at
  `:138-141`). The word "Landed" overstates what the commit does; the gate's treatment of the line
  is the load-bearing one and it is correct.
- ⚠ unverified in this review: the project verify itself. Re-running it would spend the ~18 minutes
  the brief forbids spending and would measure the same tree; this review instead re-ran the one leg
  the task exists to green (`node --test scripts/tutor-signals-shapes.test.mjs` — `ℹ pass 21 / ℹ fail
  0`) and quoted the landing log's summary lines leg by leg in the bullet above. What rests on the
  log's word alone is the held-out corpus's 12m 49s and the four big test totals; what this review
  measured independently is the census arithmetic, the build-output counts, the suite's green run
  and the commit's file set.
- Files the wave touched, read or not read, with the diff covered:
  `.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md` — read (whole file, 143
  lines; diff 6+/3−, front-matter only), 100%; `research/raw/m057-record-shapes.json` — read in
  slices (`:505-584`, covering both changed hunks at `:512` and `:571` complete), ~10% of 810 lines
  read, 100% of the diff; `research/raw/m056-gate-stability.json` — read targeted (`:1-66`), ~57% of
  115 lines, 100% of the diff (the one changed line `:33`). Not read: none — the commit touches no
  other file.

## Intent coverage

- None — by the task's own declaration, and the grammar agrees: the plan's `## Intent coverage`
  table names no row for T009 (`.project/plan/PLAN.md:74-85`, the rows end at `SC6 | T004`), and the
  task states the omission as the statement — "This task owns no acceptance criterion of its own —
  it repairs the tree-consistency of a recording earlier waves read and then proves the tree ships
  green — so the plan's `## Intent coverage` table names no row for it"
  (`.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md:46-48`), with its own
  coverage section reading `- None` (`:107`). This review therefore carries no `### SCn` heading:
  the wave owns no criterion to quote, and the task's proof obligation is carried by the evidence
  bullets above — the census re-derived and green, the verify's counts quoted, nothing written after
  the verify.

### GAP 1 — the landing wrote two record values where its own Approach and AC1 declare one. The Approach says "Re-derive exactly one value in `research/raw/m057-record-shapes.json` … Every other value in the recording is measured unchanged at this head and is not written" (`.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md:52-57`), and AC1 says "every other value in the recording is unwritten" (`:119-120`). The commit writes two: `jsonFilesScanned` 144 → 145 and `filesExcludedAsBuildOutput` 49 → 50 (`git show 5b710326 -- research/raw/m057-record-shapes.json`, hunks at `:512` and `:571`), and the Log discloses the second as deliberate — "Two values re-derived from the record's own stated scans … `negativeMeasurements.writeRecord.filesExcludedAsBuildOutput` 49 -> 50 (the panel this head builds carries 50 output files, a count no suite asserts and T006 measured but could not write)" (`:139`).
Risk: medium-low — the second value is measured and correct (GAP 2's evidence), so no record
disagrees with the tree; the contradiction is between the task's declared single-value scope and
what it landed, and the plan's four-artefact ceiling that motivated the single-value framing
(`.project/plan/PLAN.md:473-475`) is not re-litigated here. A later reader trusting AC1's letter
over the Log would expect one changed value and find two.

### GAP 2 — `filesExcludedAsBuildOutput: 50` measures build output the shipped head does not carry and no future run can re-derive from the repo alone. It is a real measurement — this checkout's `extension/panel/` holds exactly 50 files and `extension/` excluding `extension/panel/` holds exactly 59, the stated `filesScanned` (`research/raw/m057-record-shapes.json:511-512`) — but the directory is gitignored (`.gitignore:33-35` — `extension/panel/*` with only `!extension/panel/index.html` and `!extension/panel/favicon.ico` excepted, so 48 of the 50 counted files are untracked), no suite asserts the value (the census suite pins `filesScanned` at `scripts/tutor-signals-shapes.test.mjs:276` and `jsonFilesScanned` at `:434`, and names `filesExcludedAsBuildOutput` nowhere), and a fresh clone of the shipped head measures nothing there without rebuilding first. It is a claim about a working tree at verify time, recorded beside values that are claims about the repository.
Risk: low — the value annotates a negative measurement the suite does pin (`filesScanned` 59, held
by `:276` and green in this review's run), so the drift this number can undergo redden nothing and
misleads nothing the gate reads; but it is the one number in the landing that decays on any rebuild
with no detector attached.

### GAP 3 — the census ownership is positional and ends with the milestone; it solves the drift at this head and merely moves where the drift can happen afterwards. The Approach states the ownership as an ordering fact, not a mechanism: "This task also owns the stability record, and only because it is the last task: two of that record's values are a function of this milestone's own task logs, so its capture has to follow this task's Log rather than precede it. Re-derive it last, with its own armed command, after the Log is written and immediately before the landing — the ordering T004 measured when its first land refused on exactly that drift." (`.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md:59-63`). The drift detector outlives the owner: the suite re-derives the census from the tree on every run (`scripts/tutor-signals-shapes.test.mjs:430-434` — `assert.equal(files.length, stated.jsonFilesScanned);`), so the first recording any later milestone adds under `research/raw/` re-reddens `:434` at its next run, and no M058 task remains to own the repair — the fix then belongs to whichever later wave finds the red. The plan says as much and no more: "The ordering is the repair, never a widened ceiling and never a dropped recording" (`.project/plan/PLAN.md:475`), which holds exactly while the record set stays frozen, and a census that is a function of the record set is not frozen by the milestone's last task.
Risk: low at ship — the shipped head is green with nothing re-derived after it (the verify measured
the re-derived tree, `.project/build/verify-T009.log:1` with the census leg `pass 21` at `:23-26`,
and the landing commit adds no measured value beyond what that tree already carried), so M058
closes consistent; the exposure is the next milestone's first capture, which re-reddens the suite
by design and arrives with no standing owner.
