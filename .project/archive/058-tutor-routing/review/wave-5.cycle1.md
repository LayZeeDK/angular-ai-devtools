# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 47dc90bcce907aab88c117556cb7791f4fd38866

## T010 — Pin the build-output count and re-derive the gate records: pass

- ✅ The landing is the pin and the re-derivation, and nothing else: `git show --stat 47dc90bc` reads
  3 files — `.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md |
  10 +++++++---` (the `status`/`agent`/`base` fields and the four Log lines),
  `research/raw/m044-gate-shapes.json | 8 ++++----` and `scripts/tutor-signals-shapes.test.mjs |
  13 +++++++---`, closing at `3 files changed, 21 insertions(+), 10 deletions(-)`. No product source,
  no other record and no byte of `extension/` is in the commit. The Log's "Landed paths" names a
  third record, `research/raw/m056-gate-stability.json`, which the commit does not carry — measured
  below as GAP 3.
- ✅ The pin is a real pin, not self-consistency, and the code says so. The two sides of the new
  assertion come from independent sources. The recorded side is read from the committed measurement
  T009 wrote at `5b710326`: `const stated = RECORDING.negativeMeasurements.writeRecord;`
  (`scripts/tutor-signals-shapes.test.mjs:274`) over `"filesExcludedAsBuildOutput": 50,`
  (`research/raw/m057-record-shapes.json:512`) — a static JSON artefact that cannot move when the
  tree rebuilds. The walked side is derived live at run time:
  `const walked = walkDir('extension');` / `const authored = walked.filter((f) =>
  !f.startsWith(BUILD_OUTPUT));` / `const buildOutput = walked.filter((f) =>
  f.startsWith(BUILD_OUTPUT));` (`scripts/tutor-signals-shapes.test.mjs:260-262`), a `readdirSync`
  recursion over the filesystem with `BUILD_OUTPUT = 'extension/panel/'` (`:71`). A panel rebuild
  that adds or removes an output file moves only the walk side and reddens
  (`:281-285`), naming the value and both numbers in the message (`:284`). The two numbers match the
  tree at this head, measured, not trusted: `extension/` holds 109 files on disk,
  `extension/panel/` holds 50, `extension/` minus `extension/panel/` holds 59 — and the record's
  own scan description (`research/raw/m057-record-shapes.json:510`, "recursive, case-insensitive
  scan of extension/ (extension/panel/ excluded)") is the same walk filtered the other way, so the
  Approach's "walk `extension/panel/` the way the record's own scan does"
  (`.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:41-42`) holds.
  The direction was proved with a mutant: over a doctored copy of the tree and records with the
  recorded value changed 50 → 51 (nothing in this repository written — the copy lived in the review
  scratchpad), `node --test` reports `ℹ fail 1` with
  `AssertionError [ERR_ASSERTION]: negativeMeasurements.writeRecord.filesExcludedAsBuildOutput is 51
  but the extension/panel/ build output this tree carries is 50 file(s): the panel rebuild moved the
  count the recording excludes` — AC1's "reddens naming the value and both counts"
  (`.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:69-70`),
  observed.
- ✅ The pin adds a constraint the suite did not have, and the gap it closes is the one the reviews
  named. Before this landing the suite pinned only `authored.length` against
  `stated.filesScanned` (`scripts/tutor-signals-shapes.test.mjs:276-280`, kept unchanged), so the
  tree could grow any number of files under `extension/panel/` without reddening — the state wave-6
  recorded: "no suite asserts that value … the next panel rebuild that changes the build-output file
  count drifts the recording silently again, reddening nothing"
  (`.project/review/wave-6.cycle1.md:153`, closing sentence), and wave-8's GAP 2: "no suite asserts
  the value … the suite … names `filesExcludedAsBuildOutput` nowhere"
  (`.project/review/wave-8.cycle1.md:107`). The new assertion pins the split point, and the two
  assertions together pin the walk's total at 109, so wave-6 GAP 1 and wave-8 GAP 2 are closed by
  code, not by prose.
- ⚠ Declared limit, measured and recorded as GAP 2 — the pin faces the working tree, not the
  repository. Of the 50 counted files, 48 are gitignored (`.gitignore:33-35` — `extension/panel/*`
  with only `!extension/panel/index.html` and `!extension/panel/favicon.ico` excepted); git tracks
  61 files under `extension/`, 2 of them under `extension/panel/`, and 59 authored files on disk
  against the tracked 61 − 2. So the walk side is untracked build state a clean clone does not
  carry: at a fresh clone the walk measures 0 against the record's 50 and the suite reddens until
  the panel is built. That is the only direction a pin on build output can face, and it converts
  drift from silent to loud — but it is a coupling worth stating, and it is recorded as GAP 2.
- ✅ AC2's re-derivations, as far as a read-only review can carry them. `research/raw/
  m044-gate-shapes.json` at this head reads `"addedLines": 575` (`:2771`, was 568) and
  `"addedAssertionLines": 84` (`:2773`, was 83) for `scripts/tutor-signals-shapes.test.mjs` —
  exactly the one added assertion — with `"removedLines": 0` (`:2772`), and the totals read
  `"addedAssertionLines": 4985` (`:2905`, was 4984), again exactly +1; the armed run is stamped
  `"at": "2026-11-21T22:31:58.800Z"` (`:2998`), two hours after the previous stamp, and the file's
  sha256 prefix is `ad1e21bb…` (`ad1e21bbeec7dc63…`), matching the Log's recorded hash
  (`.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:86`). The
  armed commands themselves were not re-run by this review — they rewrite the records they measure,
  and this review writes nothing outside `.project/review/` — so AC2's "idempotent on a second run"
  is taken from the Log, not re-proven; the m056 leg is carried instead by its read-back suite,
  green at this head (run below).
- ✅ AC3 holds — nothing loosened, no count lowered. The suite diff is 13 lines: two comment lines
  (`scripts/tutor-signals-shapes.test.mjs:23-24`), a three-line refactor of the walk that splits
  `authored` out of the old single `filter` (`:260-262`), and the five-line assertion (`:281-285`).
  The pre-existing `filesScanned` pin keeps its number (59) and its message (`:276-280`), no
  assertion was removed or weakened anywhere in the diff, and the re-derived record agrees:
  `addedAssertionLines` moved 83 → 84 for this suite and 4984 → 4985 in total, with
  `removedAssertionLines: 0` and `droppedAssertionLines: 0` (`research/raw/m044-gate-shapes.json:2773-2775`).
- ✅ The suites are green at the reviewed head, and the touched files are prettier-clean:
  `node --test scripts/tutor-signals-shapes.test.mjs` reports `ℹ tests 21 / ℹ pass 21 / ℹ fail 0`
  with the pin's test printed `✔ no write record exists anywhere in extension/`;
  `node --test scripts/gate-stability-record.test.mjs` reports `ℹ tests 8 / ℹ pass 8 / ℹ fail 0`
  (the m056 record read back against this head); `npx prettier --check
  scripts/tutor-signals-shapes.test.mjs research/raw/m044-gate-shapes.json
  research/raw/m056-gate-stability.json` prints `All matched files use Prettier code style!`.
- ⚠ plan-lint gained one warning naming this wave's task: `[contract-mismatch] T010 contract: ##
  Interface contract is not shared byte-for-byte with any other task; share the exact text when a
  shape is exchanged`. The task exchanges no shape — it owns no criterion, its `## Intent coverage`
  reads `- None` (`:63-65`), and its `## Interface contract` (`:47-61`) restates the surfaces T001,
  T002 and T003 publish rather than declaring a new exchange — so the warning is the lint firing on
  a section a non-exchanging task arguably need not carry in unique wording. Recorded as a finding,
  severity low; the six `path-not-declared` warnings in the same run are pre-existing at every
  prior review's head and none names wave 5.
- Files the wave touched, read or not read, with the diff covered:
  `scripts/tutor-signals-shapes.test.mjs` — read (whole file, 575 lines), 100%, the 13-line landing
  diff covered line by line and executed (21/21 plus the doctored-copy red);
  `.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md` — read (whole
  file, 86 lines; diff 7+/3-), 100%; `research/raw/m044-gate-shapes.json` — part read (the diff's
  two hunks at `:2768-2778` and `:2900-2906`, excerpts at `:2995-3000`), ≈0.5% of 3000 lines read
  line-by-line, 100% of the 8-line landing diff covered and all four moved values re-read at this
  head; `research/raw/m056-gate-stability.json` — part read (`:1-60` of 115), named in the Log's
  landed paths, not in the commit (GAP 3), its consistency carried by the 8/8 read-back suite;
  cited but untouched by the commit: `research/raw/m057-record-shapes.json` (read at `:510-512`),
  `.gitignore` (read at `:28-37`). Also read: `.project/plan/PLAN.md` (`## Wave 5`, `:349-357`, and
  a full-file search for `T010`), `.project/review/wave-4.cycle1.md` (grammar template),
  `.project/review/wave-6.cycle1.md` (GAP 1), `.project/review/wave-8.cycle1.md` (GAP 2), and the
  prior text of this file. Not read: no file the commit touches was left wholly unread.

## Intent coverage

T010 owns no criterion and advances no SCn section here: the task's own section reads `- None`
(`.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:63-65`), the
plan's `## Intent coverage` table names no row for it — a full-file search of
`.project/plan/PLAN.md` for `T010` finds one hit, the wave-5 Goal paragraph's withdrawn-task
sentence at `:353` — and the task says the omission is the statement: "It owns no acceptance
criterion of its own, and the plan's `## Intent coverage` names no row for it"
(`.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:35-36`). What
the task advances is the closure of two review-recorded gaps (wave-6 GAP 1, wave-8 GAP 2), not a
criterion line, so no `### SCn` heading appears under this section: there is no criterion to quote.

#### GAP 1 — the plan still describes T010 as the withdrawn contiguity placeholder, and the plan commit that replaced it never edited the paragraph: `.project/plan/PLAN.md:351-355` reads "it carries one withdrawn task (`T010`) because `build_state.py` refuses a `## Wave` heading with no task file — the same check that refuses renumbering five landed task files down by one", wording that landed at `ad744ebe` for `.project/tasks/T010-wave-5-contiguity-placeholder.md`; the plan commit `b1e44837` ("plan: wave 5 carries T010, which pins the build-output count") deleted that placeholder file, added the real task file and bumped `.project/review/FINAL.md`'s Reviewed HEAD, and touched no line of `PLAN.md` — measured: `git show b1e44837 --stat` reads exactly 3 files, `PLAN.md` not among them. T010 is `status: done` (`.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:5`) and landed at `47dc90bc`: a reader meets a plan paragraph that says withdrawn and a task that shipped.
Risk: low — the wave-5 task list the tools measure is derived from the task files, not the prose
(`lars-gsd.bat plan-lint` counts `tasks: 10  waves: 1, 2, 3, 4, 5, 6, 7, 8` with `0 blockers` at
this head), the paragraph's contiguity reasoning still explains why wave 5 exists, and no suite
reads the sentence — the residue is one stale sentence in a plan paragraph, a one-line edit for
whenever the plan is next touched.

#### GAP 2 — the pin's walked side is untracked working-tree state, so the assertion holds the record to the local panel build rather than to any commit. Measured at this head: `.gitignore:33-35` ignores `extension/panel/*` excepting only `!extension/panel/index.html` and `!extension/panel/favicon.ico`, so 48 of the 50 counted files are untracked (git tracks 61 files under `extension/`, 2 under `extension/panel/`); a fresh clone of `47dc90bc` walks 0 build-output files against the record's 50 and reddens until the panel is built. This is the wave-8 GAP 2 characterization now armed rather than resolved — that gap called the value "a claim about a working tree at verify time, recorded beside values that are claims about the repository" (`.project/review/wave-8.cycle1.md:107`) — and the assertion does not change what the claim is about; it attaches the detector wave-6 GAP 1 said was missing.
Risk: low — the failure direction is the safe one: a rebuild that moves the count reddens loudly
(the mutant run above), a clean clone reddens loudly rather than passing wrongly, the suite's other
20 tests read only tracked sources and records and are unaffected, and re-deriving the record after
a legitimate output-shape change is exactly the designed response the task's Goal states
(`.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:24-28`).

#### GAP 3 — the Log's "Landed paths" names three records where the landing commit carries two: `.project/tasks/T010-pin-the-build-output-count-and-re-derive-the-gate-records.md:83` reads "Landed paths: `scripts/tutor-signals-shapes.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`", but the commit touches 3 files — the task file, the suite and `m044-gate-shapes.json` (`git show --stat 47dc90bc`) — and `git diff ea9bae02 47dc90bc -- research/raw/m056-gate-stability.json` is empty, the file's last landing commit remaining `5b710326`. The Log's own last line discloses the no-op — "re-derived last and reported nothing moved at that moment" (`:86`) — so this is the word "landed" overstating a re-derivation that moved no byte, not a false count: the record at this head is what the tree derives (the `gate-stability-record` read-back suite, 8/8 above).
Risk: low — no reader is misled about content, the disclosure sits two lines below the claim, and
the empty diff is itself the evidence that the re-derivation was run and found nothing to write.
