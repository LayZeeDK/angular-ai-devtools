# PLAN — M055 tutor-foundations

Milestone: tutor-foundations · Branch: gsd-path/M055 · Baseline: a30208fe

## Config

Project verify: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`

The build leads for the reason M054 stated and the reason still holds:
`scripts/panel-bundle-budget.test.mjs` refuses an output older than the newest source, so a stale
artifact would read as a defect this milestone did not make, and `--skip-nx-cache` because a cached
replay restores its recorded output without refreshing the timestamp that assertion reads.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Corrections

1. **The presence read happens where the filesystem exists, through the join's injected reader —
   never as a bake.** Measured at plan time: the records this milestone reads are repository files
   (`research/raw/m052-verdict-claims.json`, `research/raw/m053-verdict-claims.json`,
   `research/raw/m054-verdict-claims.json`) and the artefact paths they name are repository paths —
   `research/raw/…`, `scripts/…test.mjs`, `.project/archive/05*/…` — that no page route and no
   `chrome-extension://` document can stat. So the read is not baked into the mapping, the surface or
   a build step: the pure join `tutorAnswer(question, sources)` takes the reader as input —
   `sources.exists(path)` — and calls it for every rendered path on every answer (SC3); the join
   imports no `fs`, no `fetch`, no clock, and a false return is the `missing-artefact` state naming
   the record and the path (E4), never `no-matching-criterion`. The callers that hold a filesystem
   supply real readers: the node-side capture commands and `panel-demo.spec.ts` re-derive the pane's
   answer over the real records with a real reader on every test run. The pane itself renders that
   derived answer as its fact — the deviation M054 shipped and T004 recorded (the pane does not stat
   at render time) is stated here, in the Surface contract, and again by T004, not left implicit.
2. **The one mapping is authored, and its row shape is three fields** (C2). Measured at plan time:
   the verdict-claims records carry criterion, artefact path, recordings and milestone as fields but
   no end-user question vocabulary — the `question` field at `research/raw/m054-surface.json:6`
   records the recording question of the surface itself, not a user question, and no `claims[]`
   field matches user wording to a criterion. T002 authors `extension/tutor-index.js`: rows of
   exactly the question text, the criterion id and the milestone, each criterion id one a record on
   disk actually carries, asserted by the suite at authoring time and on every run — nothing else in
   a row: no artefact path, no value, no answer text (N5). The criterion-to-artefact side is never
   in the index; it is read from the records at answer time.
3. **The template prose is quoted, not fixed, and never rendered** (C3). `research/raw/m054-verdict-claims.json:75`
   shares its `reason` text word for word with M053's record, its `artefact` field is prose around
   the path, and its `proves` commands cite a suite the recorded milestone never ran. The join reads
   only the structural fields — `milestone`, `claims[].criterion`, `claims[].artefactPath` — and
   never `reason`, `artefact` or `reading`; whether the derivation itself is repaired is not this
   milestone's scope.

- C4 2026-11-20: T001 measured the field map across every record, not the two sampled in define, and it breaks on two thirds of them. There are 34 verdict-claims records and 9 surface records. `claims[].artefactPath` is carried by **12 of 34** and `evidence.recordings` / `evidence.suites` by 11 of 34, while the 22 records from M022 to M043 carry none of them and use four different shapes instead: M022 a portal-verdict block; M023–M037 four keys with the file named only inside `reason`, and 0 of m023's 4 rows names a file at all; M038–M040 add `criterionCharacters`; M041–M043 carry `artefact` prose plus `proves` as a string. Two further corrections to the intent's reading: the surface records spell `milestone` with a title ("M046 copy-to-agent") while the verdict-claims records use a bare id, and all 44 `artefactPath` values resolve at this head — so E4's dead-path state has no live instance, and the recording says so rather than manufacturing one. Consequence for T002: the join answers from records that carry the fields and reports a record that cannot answer as SC2's third absence, exactly, rather than falling back to prose. The 22 shape-differing records are not a defect of the surface; they are the reason it must name what it cannot read. The authored index stays two facts per row (question text to criterion id and milestone) and must not acquire a third to paper over a record that cannot answer.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC2 |
| SC1 | T002 | AC1, AC2, AC3, AC6 |
| SC1 | T003 | AC1 |
| SC1 | T004 | AC1 |
| SC2 | T001 | AC3 |
| SC2 | T002 | AC4 |
| SC2 | T003 | AC2 |
| SC2 | T004 | AC1 |
| SC3 | T002 | AC5 |
| SC3 | T003 | AC1, AC3 |
| SC3 | T004 | AC2, AC3 |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/tutor-answer.test.mjs |

E4 is held-out: a question whose record names an artefact file that no longer exists where the
record says it lives must answer `missing-artefact`, naming the record and the missing path beside
the absence — never `no-matching-criterion` — and the same suite asserts the three unanswered
absences, so "the file is gone" cannot collapse into "nothing answered here".

## Surface contract

### panel — T003

Entry: the panel route `tutor-foundations`, rendered through the `tutor-foundations` key in
`panel-demo.ts` `LOADERS` and the `PANEL_SURFACES` entry in `app.routes.ts`, lazy through the shared
`loadPanelDemo` closure.

States: `answered` — the answer names the artefact file, the milestone and the criterion, each of
the three read from the named record's own fields (the milestone from `milestone`, the criterion
from `claims[].criterion`, the file from `claims[].artefactPath`), never composed from a filename, a
path convention or the record's prose fields (SC1, N1), every rendered path one the record states
and spelled exactly as the record spells it, never re-rooted, normalised or shortened (E1, E2), and
present where the record says it lives when the answer is served (SC3); `no-matching-criterion`,
`no-artefact-named` and `records-unreadable` — three absences, each in its own sentence, naming
which absence holds, never one blank unanswered state (E3, N2); `missing-artefact` — the named
record's artefact file is not present where the record says it lives, naming the record and the
missing path beside the absence, distinct from every unanswered state (E4, N3); every state stable
on a second run (E5), and no answer renders a criterion id the named record's own criterion fields
do not carry (N4).

Walkthrough:

1. Open the panel at route `tutor-foundations` against the Insurance Portal's inspected tab: the
   surface answers the demo question by naming the artefact file that proves it, the milestone the
   record belongs to and the criterion the artefact answers, each read from the record's own fields,
   the path spelled as the record spells it.
2. Ask (in the panel — no page-side control, N6) a question no row of the authored mapping carries:
   the surface states `no-matching-criterion` and nothing beside it, and the same absence on a
   second run (E5).
3. Point the mapping at a criterion whose claim names no artefact path: the surface states
   `no-artefact-named`, distinct from no-matching-criterion (E3, N2).
4. Take the artefact file a named record states away from where the record says it lives: the
   surface states `missing-artefact`, naming the record and the missing path — never the unanswered
   state (E4, N3).
5. Read the records where they cannot be read: the surface states `records-unreadable`, the third
   absence in its own sentence (E3).

Criteria: SC1, SC2, SC3

## Wave 1 — measure what the records carry and what only a mapping can answer

Goal: the milestone's whole claim is a traceability claim resting on record fields nothing has ever
mapped to a rendered answer, and on a question-to-criterion side nothing in any record carries. The
field map and the negative measurement are both on disk before anything is built on them.

Review depth: full

T001 measures the record shapes statically. **The three-side field map** — for every
`*-verdict-claims` record present, which field names the milestone (the record's `milestone` field),
which names a criterion (`claims[].criterion`, full text `claims[].criterionText`), which names the
artefact file (`claims[].artefactPath`, with the suites at `evidence.suites[].path` and the
recordings at `evidence.recordings` and `capture.records`) — recorded with `path:line` citations
carrying each cited line's own trimmed text, measured over `research/raw/m052-verdict-claims.json`,
`research/raw/m053-verdict-claims.json` and `research/raw/m054-verdict-claims.json`. **The negative
measurement that decides the design** (C2): no record field carries end-user question vocabulary
mapped to a criterion — the surface records' `question` field records the recording question, not a
user question — so the question-to-criterion side is the one authored mapping this milestone owns.
The recording also states the C3 trap as a ruling, not a repair: the derivation's `reason`,
`artefact` and `reading` fields are one template shared across milestones, recorded as
never-rendered. It records `research/raw/m055-record-shapes.json` with citations and instrument
metadata, and `scripts/tutor-record-shapes.test.mjs` parses the recording and re-checks each
citation. Nothing is built: no index, no join, no surface, no route.

## Wave 2 — author the one mapping and join it to the records pure

Goal: the authored index says only which question maps to which criterion of which milestone; the
pure join reads the criterion-to-artefact side from the records' own fields at answer time, checks
presence through an injected reader at answer time, and reddens every way an answer could lie —
above all the hard-coded path that claims to be derived.

Review depth: full

T002 authors `extension/tutor-index.js` and builds `extension/tutor-foundations.js`. The index is
the one authored mapping this milestone owns: rows of exactly the question text, the criterion id
and the milestone — every criterion id a row names is one the named record's own `claims[]`
criterion fields carry, asserted against the records on disk by the suite — and nothing else in a
row (N5): no artefact path, no value, no answer text. The join `tutorAnswer(question, sources)` is
pure: it takes the index, the parsed records and an injected `sources.exists(path)` reader, reads
the milestone from the record's `milestone` field, the criterion from its `claims[].criterion` and
the artefact path from its `claims[].artefactPath` — never from the template `reason`, `artefact`
or `reading` fields (N1) — and returns `{ state, question, milestone, criterion, artefactPaths,
detail }` where `state` is `answered`, `no-matching-criterion`, `no-artefact-named`,
`records-unreadable` or `missing-artefact`. The three absences are distinct (E3, N2); presence of
every rendered path is read through the injected reader at answer time, never baked, and a false
return is `missing-artefact` naming the record and the missing path — never
`no-matching-criterion` (E4, held out); a second answer names the same three fields (E5). The join
imports nothing at runtime, touches no filesystem, dispatches no message and holds no clock.
`scripts/tutor-answer.test.mjs` pins the module, then mutates, each mutant with its own anchor
assertion: an index row carrying a path, a value or an answer text; an answer assembled from the
template prose, or by file naming or path convention; **the load-bearing mutant — a join that
replaces a record's `artefactPath` with a hard-coded constant and still answers, right milestone,
right criterion, a path the record does not state, against fixtures whose paths the constant cannot
match**; an unanswered question rendered as an answer; the absences folded into one blank state; a
missing artefact rendered as unanswered; a join that ignores the reader and answers from a bake; a
criterion id the record does not carry; a path re-rooted, normalised or shortened; and a join that
refuses every question — a surface that always refuses is not a surface. This task owns held-out
E4.

## Wave 3 — render the answer surface and pin the route

Goal: the five states render on a panel surface whose answer is the shipped join's own, and every
suite that enumerates the route table names the route before it is asked, not after a landing
refuses.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts`: the display half. It hands
the join `extension/tutor-foundations.js` the demo question, the index and the records, and renders
its answer: `answered` naming the artefact file, the milestone and the criterion, each read from the
record's own fields, the path spelled exactly as the record spells it (E1, E2); `no-matching-criterion`,
`no-artefact-named`, `records-unreadable` and `missing-artefact` each in its own sentence, the
missing-artefact sentence naming the record and the missing path (E4, N3); no template prose
rendered (N1); every interaction in the panel, none on the inspected page (N6). The demo's
`tutor-foundations` sample fact is the shipped join's own answer for the real records with a real
reader, held field-for-field to `tutorAnswer` re-run node-side by `panel-demo.spec.ts` — the
presence read re-checked on every test run. It also adds a `LOADERS` key and a `FACTS` sample in
`apps/angular-ai-devtools/src/app/panel-demo.ts` and a `PANEL_SURFACES` entry and route in
`apps/angular-ai-devtools/src/app/app.routes.ts`, entered where no line the surface records cite
above the insertion point moves. It updates the four app specs (`app.spec.ts`,
`page-picker.component.spec.ts`, `chat-entry.component.spec.ts`, `panel-demo.spec.ts`) and declares
the route-table suites (`scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`,
`tests/held-out/fixture-explainers-unchanged.test.mjs`) before starting — read for the four, but
`scripts/gate-integrity.test.mjs` is also edited: its suite-diff reason table is an allow-list that
refuses a new suite by name, so the two suites waves 1 and 2 added get their two declared rows here
rather than a landing refusal. The pane's own sentences are not entered in
`extension/copy-digest.json`, which this task does not own; the gap is recorded for T004, which
re-measures the copy record over every surface on disk.

## Wave 4 — record the surface, capture the claims, run the project verify

Goal: the surface is recorded, the portal-first verdict is captured, every recording this milestone
stales is re-derived at the head that ships, and the project verify runs last.

Review depth: full

T004 appends the Log after the last recording byte, records the route, the loader key and each
state with the answer field it reads into `research/raw/m055-surface.json`, and re-cites the surface
records whose `app.routes.ts` and `panel-demo.ts` line numbers the twenty-eighth surface moves —
`research/raw/m054-surface.json`, `research/raw/m053-surface.json`, `research/raw/m052-surface.json`,
`research/raw/m051-surface.json`, `research/raw/m050-surface.json`, `research/raw/m049-surface.json`,
`research/raw/m048-surface.json` and `research/raw/m048-surface-copy.json`. It re-derives
`research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json` and
`extension/copy-digest.json` — authoring the digest rows the new surface's sentences need — and
moves `apps/angular-ai-devtools/src/app/panel-demo.ts`'s copy-check fact with the digest's count,
that file declared in this task's `files:` this time rather than moved outside it (the lesson
M054's T004 recorded). Each re-derivation runs its own capture command, never by hand. It captures
`research/raw/m055-verdict-claims.json` with its own capture command, **Insurance Portal first**:
`control-angular-devapp up --target portal`, the portal route tried named (`/home` first), the panel
route `tutor-foundations` opened against the portal's inspected tab, and the verdict naming the
artefact the portal itself does not render — this repository's records and the files they name; no
route of any page produces a traceability answer about this repository's own gate. A fixture is a
fallback only for the named gap that the portal could not be served, and a verdict that reaches a
fixture without naming both the route tried and the missing artefact does not count as a verdict.
Every recording it re-derives is re-derived with its own capture command at the head it lands —
`capture.head` is HEAD for each — as its last action before landing, because `gsd land`'s pre-flight
refuses a declared recording whose `capture.head` is not HEAD and runs the repo's pre-commit hook
over the paths it will commit, both before the Verify. It declares every suite that enumerates a
table or pins a recording it re-derives here rather than discovering them by refusal
(`panel-demo.spec.ts`, `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs`,
`scripts/gate-integrity-default-tasks.test.mjs`, `scripts/gate-stability-record.test.mjs` —
declared, not edited), and runs the project verify as its last action, re-deriving nothing after it.
