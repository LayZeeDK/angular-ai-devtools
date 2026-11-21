# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 5b71032601c15f0a830f365c350c46262b63326b

## T005 — Repair the stale citation in the surface record: pass

- ✅ The landing is the four values and the Log, and nothing else: `git show --stat e1530ab6` reads
  2 files — `.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md | 10 +++++++---`
  (the `status`/`agent`/`base` fields and the four Log lines) and `research/raw/m048-surface.json |
  8 ++++----` — closing at `2 files changed, 11 insertions(+), 7 deletions(-)`. No suite, no product
  source, no `extension/panel/index.html` byte and no other record is in the commit, which is AC3's
  shape before any suite is run.
- ✅ The four corrected values are the lines `apps/angular-ai-devtools/src/app/panel-demo.ts` carries
  at this head, each re-read by this review against the cited file. `loader.sampleFact.lineText`
  (`research/raw/m048-surface.json:113`) quotes `'copy-check': { state: 'clean', unexplained: [],
  checked: 206 },` and `loader.sampleFact.holds` (`:114`) reads `checked: 206`, citing
  `panel-demo.ts:450` — and the file's `:450` reads exactly that line at this head.
  `loader.sampleFactComment[1].lineText` (`:126`) quotes
  `// (`extension/copy-digest.json`): all 206 compared strings are explained, so the record reads`
  and its `.holds` (`:127`) reads `206`, citing `panel-demo.ts:444` — and the file's `:444` reads
  exactly that line. The landing diff moves only those four lines: `git show e1530ab6 --
  research/raw/m048-surface.json` is the two hunks at `:110-115` and `:123-128` and nothing else —
  the count-free first comment entry at `:118-122` (citing `panel-demo.ts:442`, whose line reads
  `// The join's own answer (`extension/copy-check.js`, T002) for T001's measurement` at this head)
  did not move, and neither typed line number changed, so the Approach's claim "the line numbers the
  record already carries are this head's — `:450` and `:444` moved nothing"
  (`.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md:59-60`) held: the suite's
  citation re-read resolves both at their typed numbers (`✔ every cited path and line is the one the
  record read` in the run below).
- ✅ The suite the repair turns green is green at this head, with nothing loosened and no count
  lowered: `node --test scripts/copy-check.test.mjs` reports `ℹ tests 30 / ℹ pass 30 / ℹ fail 0`
  with its pins printed unchanged (`T001 surfaces: 29 surfaces, 172 declared sentences, 34 inline
  sentences, 1 absence`, `T002 digest: 198 rows for 206 sentences (8 repeat(s))`,
  `T001 citations: 550 lines re-read`, `T004 route record: 58 citations re-read`). No assertion was
  loosened and no pin lowered because no suite byte moved in the landing window:
  `git diff 1fa50cd5b6c24f4e9eb613bc3bc3c8f21776a1c6 e1530ab6 -- scripts/copy-check.test.mjs
  scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs` returns empty, so
  the three declared suites stayed R2-class declared-not-edited exactly as the plan and task AC3
  state — the record moved, the suites held it still. The red the repair removes is the one wave 3
  measured at the same citation: `AssertionError [ERR_ASSERTION]: research/raw/m048-surface.json:loader.sampleFact
  quotes the line as "'copy-check': { state: 'clean', unexplained: [], checked: 201 }," and the file
  reads "'copy-check': { state: 'clean', unexplained: [], checked: 206 },"`
  (`.project/review/wave-3.cycle1.md:93-95`).
- ✅ The task Verify ran all three legs green over the pre-commit working tree at head `8b50e92c`
  (`.project/build/verify-T005.log:1` — copy suite `? tests 30 / ? pass 30 / ? fail 0` at `:54-57`,
  `All matched files use Prettier code style!` at `:63`, the `npm run check` gates all `[OK  ]` at
  `:66-93`, no failure line anywhere in the 147-line log), and this review re-ran the prettier leg at
  the reviewed head: `npx prettier --check research/raw/m048-surface.json` prints
  `All matched files use Prettier code style!`.
- ⚠ Declared limit, measured and left — the record's remaining prose still names the pre-M058 counts,
  and leaving it is right for a task scoped to four values. Measured at this head:
  `loader.statement` (`research/raw/m048-surface.json:130`) still reads "The fact it is handed (:450)
  is `{ state: 'clean', unexplained: [], checked: 201 }` — the join's answer over the twenty-eight-
  surface record this head measures and the 193-row digest authored from it"; `states[0].statement`
  (`:268`) and `notCaptured[1]` (`:538`) still say `checked: 195` over the twenty-seven-surface copy
  record; `verdict` (`:543`) still says "The sample fact the demo hands the pane says `checked: 122`,
  one re-measurement behind the 134 the copy record answers at this head"; and `head` (`:7`) is
  `aa90dcd0b344d0a7bdd3b1a4d7ae87f5fd772030` — M048's `T003: Render the answer surface and pin the
  route` commit, not this reviewed head. All five match the Log's disclosure line for line
  (`.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md:136`). The verdict on
  leaving them: correct. The suite reads none of those five fields — the 30/30 run above executed
  over the record exactly as written — the prose is M048's own description of M048's own measurement
  head, which the unmoved `head: aa90dcd0` field discloses to every reader, and the plan bounds T005
  to "writes nothing else in the record" (`.project/plan/PLAN.md:338-341`), so rewording prose no
  test reads would widen the repair beyond the four values the plan approved. Recorded as GAP 1
  below for the later reader, not as a defect of this wave.
- ⚠ unverified in this review: the pre-repair 30/29/1 count at the task's base `1fa50cd5`. This
  review runs read-only at the reviewed head and did not check out the base to re-run the red suite;
  the count is the Log's own measurement ("30/30 at this head, against 30/29/1 before the repair",
  `.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md:135`) beside the Context's
  "red at the base this task starts from (29 pass, 1 fail)" (`:37`), consistent with wave 3's
  measurement of the same red at `1d3aa1d5` (`.project/review/wave-3.cycle1.md:88-100`). Likewise
  `npm run check` was not re-run at the landing commit — its recorded green run is at the pre-commit
  head `8b50e92c`, the same working-tree-before-commit pattern every verify ledger here shows — and
  the prettier leg was re-run here and is green.
- Files the wave touched, read or not read, with the diff covered:
  `.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md` — read (whole file, 137
  lines; diff 7+/3-), 100%; `research/raw/m048-surface.json` — part read (`:108-131` whole; `:7`,
  `:268`, `:538`, `:543` excerpts), ≈4% of 544 lines read line-by-line, 100% of the 8-line landing
  diff covered, and 100% of its 58 citations re-resolved by the green suite run (`T004 route record:
  58 citations re-read`); cited but untouched: `apps/angular-ai-devtools/src/app/panel-demo.ts` —
  read at the four cited lines only (`:442`, `:444`, `:450`); declared and untouched:
  `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs`,
  `scripts/gate-integrity-default-tasks.test.mjs` — not read, proven byte-identical across the
  landing window by the empty `git diff` above, with `copy-check.test.mjs` additionally executed
  (30/30). Also read: `.project/plan/PLAN.md` (`## Intent coverage`, `## Wave 4`),
  `.project/intent/INTENT.md`, `.project/review/wave-1.cycle1.md` (grammar template),
  `.project/review/wave-3.cycle1.md`, `.project/build/verify-T005.log` (147 lines). Not read: no
  file the commit touches was left wholly unread.

## Intent coverage

T005 owns no criterion and advances no SCn section here: the plan's `## Intent coverage` table
(`.project/plan/PLAN.md:72-85`) names no row for T005, the task's own section reads `- None`
(`.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md:102`), and the plan states
the omission is the statement — "it repairs a citation inside a record T002 and T003 read, so it owns
no acceptance criterion and claims none" (`.project/plan/PLAN.md:332-334`). The criteria whose
records the repair touches stay with the tasks that state them: the copy suite that re-reads the
repaired record is 30/30 at this head, so the coverage those tasks shipped is unchanged by wave 4.

#### GAP 1 — the repaired record's prose still names the counts of the head it was written at: `research/raw/m048-surface.json:130` (`loader.statement`) quotes `checked: 201` and calls this the twenty-eight-surface record with a 193-row digest, `:268` (`states[0].statement`) and `:538` (`notCaptured[1]`) still say `checked: 195` over the twenty-seven-surface record, `:543` (`verdict`) still says `checked: 122` against 134, and `:7` (`head`) still names M048's commit `aa90dcd0`. T005's Log records the limit rather than repairing it (`.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md:136`), and this review measured all five as the Log states.
Risk: low — no suite reads any of the five fields (the copy suite's 30/30 run executed over the record exactly as written, and its assertions read the four corrected citation values beside counts it re-derives itself, `T002 digest: 198 rows for 206 sentences`), the prose is an M048 record's description of its own measurement head, which the unmoved `head: aa90dcd0` field discloses to every reader, and the plan bounds T005 to the four cited values ("writes nothing else in the record"), so a repair that reworded the prose would be the widened repair the plan refused. A later task that re-measures this record owns the prose then, under its own authored ceiling.
