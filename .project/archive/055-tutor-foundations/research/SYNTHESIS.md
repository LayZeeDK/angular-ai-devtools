# M055 tutor-foundations — synthesis

Four waves, four tasks, reviewed and landed at `2feba85e1111f9d5b1b3fd0e6d0d79a0a72e56dd`; project
verify and ship gate pass at the reviewed head. This records what the milestone measured, what it
built, and the facts the ship carries — written from the milestone's own records:
`research/raw/m055-record-shapes.json`, `research/raw/m055-surface.json`,
`research/raw/m055-verdict-claims.json`, and the four task logs.

## What the milestone set out to show

The panel answers a question about a shipped feature by naming the recorded artefact that proves
it, so an explanation is traceable to a measurement rather than to prose (INTENT Goal). The
premise that a question can be mapped to _the_ recording that proves a claim was measured against
the archives before the surface was shaped, and three corrections decided the shape (INTENT C1–C3).

## What the measurement decided

- **The archives hold the evidence trail; the recordings live at the repo root (C1).** No archive
  contains a `research/raw/` recording — the 137 recordings sit at repo-root `research/raw/` — so
  the milestone's criteria were written to survive it: an answer names a path a record states,
  present where the record says it lives at answer time, and a file that is gone is the
  `missing-artefact` state, never a dead path rendered and never an invented one.
- **Criterion-to-artefact is answerable from the records alone; question-to-criterion is not (C2,
  PLAN C2).** T001 measured the field map over every verdict-claims record present — 34, not the
  two sampled at plan time — and every surface record: 9 (`research/raw/m055-record-shapes.json:520-580`).
  The `question` field of a surface record is the recording question of the surface itself, never a
  user question: 0 of 9 `question` values names a criterion id and no surface record carries a
  `claims` array (`research/raw/m055-record-shapes.json:6654-6657`). So exactly one authored
  mapping is in scope, and the criterion-to-artefact side is read from the records at answer time.
- **The field map broke on two thirds of the records (PLAN C4, measured at plan time and
  re-measured by T001).** `claims[].artefactPath` is carried by 12 of the 34 verdict-claims records
  and by 44 claims; the 22 records from M022 to M043 carry none of it in four different shapes
  (M022 a portal-verdict block; M023–M037 four keys with the file named only inside `reason`, 0 of
  M023's 4 rows naming a file at all; M038–M040 `criterionCharacters`; M041–M043 `artefact` prose
  plus `proves` as a string). The join therefore answers from the records that carry the fields and
  renders the rest as the absence that names the missing field — `no-artefact-named` is the correct
  answer for them, not a defect. All 44 `artefactPath` values resolve at the measured head
  (`research/raw/m055-record-shapes.json:6661-6687`), so E4's `missing-artefact` state has no live
  instance and is pinned by a constructed input.
- **The derivation's prose is one template, quoted and never rendered (C3).** 38 `reason` rows in
  11 records collapse to one sentence once the criterion id, its text and three interpolated lists
  are substituted; its `proves` commands cite `scripts/navigation-blocking.test.mjs`, which no
  record names in `evidence.suites` (`research/raw/m055-record-shapes.json:6689-6822`). The join
  reads only the structural fields and the derivation is not repaired.

## What was built

- **Wave 1 (T001, `4d39bbbd`)** — `research/raw/m055-record-shapes.json`: the three-side field map
  and the negative measurement, every `path:line` citation carrying the cited line's own trimmed
  text and re-resolved by searching its file for the exact line it quotes (602 citations over 43
  records, 44 artefact paths all resolving). `scripts/tutor-record-shapes.test.mjs` re-reads every
  citation and reddens a slid citation, an invented or hidden field count, and an unmeasured
  record, each by name. Nothing built.
- **Wave 2 (T002, `f5f70284`)** — `extension/tutor-index.js`: the one authored mapping, rows of
  exactly the question text, the criterion id and the milestone, frozen, with the suite refusing
  any path-shaped string in its bytes; and `extension/tutor-foundations.js`: the pure join
  `tutorAnswer(question, sources)` answering `answered`, `no-matching-criterion`,
  `no-artefact-named`, `records-unreadable` or `missing-artefact`, the three absences distinct and
  decided in the contract's order, presence read through the injected `sources.exists(path)` at
  answer time, never baked. Held-out E4 is owned here and pinned by a constructed input, with
  seventeen redden-by-name mutants including the load-bearing one — a join that replaces a record's
  `artefactPath` with a hard-coded constant and still answers.
- **Wave 3 (T003, `aa90dcd0`)** — `apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts`:
  the display half, rendering the five states from an enumerated `PANE_SENTENCES` registry with the
  present/missing artefact labels split so a missing path never reads as present; the
  `tutor-foundations` route and `LOADERS` key entered where no line the surface records cite moves
  (`app.routes.ts:83`), the demo fact held field-for-field to the shipped join re-run over the real
  records by `panel-demo.spec.ts` on every test run, and the route-table suites declared and proved
  by their own mutants.
- **Wave 4 (T004, `2feba85e`, across four passes whose blockers are recorded in the task Log)** —
  `research/raw/m055-surface.json` (the twenty-eighth surface) and
  `research/raw/m055-verdict-claims.json` captured with their own commands; the eight earlier
  surface records re-cited; the `m044`/`m056` gate records re-derived by their own armed commands
  with a second armed run changing no byte; the copy digest re-measured over the new surface
  (181 → 187 rows for 189 → 195 sentences) with `panel-demo.ts`'s copy-check fact moved with the
  count; the two red suites outside the task's first `files:` closed at their cause — the
  `outsideTheMap` subtraction every record-counting suite now shares, and the authored index
  excluded from the M049 recorder census by file with a mutant proving no third file can be
  excused; the `di-doctor` route restored after an interrupted pass removed it; and the project
  verify run as the last action.

## Review findings and their resolution

All four waves passed full review at cycle 1 (`.project/review/wave-1.cycle1.md` …
`wave-4.cycle1.md`), each at its own wave's landing; `gsd build-guard` reports clean. T004's Log
records three passes that returned `blocked` with measured causes — each a suite or record another
task owned — and each closed at its cause with a narrow mutant rather than a loosened pin.

## The facts the ship carries

1. **22 of the 34 verdict-claims records carry no `claims[].artefactPath`**, so the surface renders
   `no-artefact-named` for them, exactly and in its own sentence — the reason the surface must name
   what it cannot read rather than a defect of the surface. The authored index holds two facts per
   row (question text to criterion id and milestone) and must not acquire a third to paper over a
   record that cannot answer; the criterion-to-artefact side is read from the records at answer
   time.
2. **E4's `missing-artefact` state has no live instance**: all 44 `claims[].artefactPath` values
   resolve at the head the map measured, so the state is pinned by a constructed input in
   `scripts/tutor-answer.test.mjs` and the recording says so rather than manufacturing a dead path.
3. **The pane does not stat a file at render time** — the demo fact is the shipped join's own
   answer for the real records with a real reader, re-derived node-side on every test run and held
   field-for-field by `panel-demo.spec.ts` (PLAN C1's stated deviation, stated in the Surface
   contract, the pane header and the T004 Log, not left implicit).

## What this milestone leaves behind

- a measured answer to "which record fields can a traceability answer read, and which side exists
  in no record at all" — the field map every later milestone inherits;
- one authored mapping and one pure join, whose five-state vocabulary the surface renders without
  adding a state of its own;
- a `PANE_SENTENCES`-registered surface whose every own sentence is enumerated; and
- recordings whose every citation is re-read by their own suites, so the next milestone re-measures
  rather than copies.
