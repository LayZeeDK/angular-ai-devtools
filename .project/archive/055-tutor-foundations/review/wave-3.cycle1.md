# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: aa90dcd0b344d0a7bdd3b1a4d7ae87f5fd772030

## T003 — Render the answer surface and pin the route: pass

- ✅ T003/AC1 — the surface renders `answered` from the record's own fields, spelled as the record
  spells them (E1, E2), and renders nothing the record does not state (N1, N3, N4): the pane is the
  display half only — "it reads no record, stats no file, asks no question of a page, dispatches no
  message, reaches no inspected window … and imports nothing at runtime, so the join's own rules
  are never restated here as a computation"
  (`apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts:19-22`). Each rendered line is the
  answer's own field under its own label, skipped where the join left it empty — "Nothing is filled
  in beside a field the join left empty" (`panel-tutor-foundations.ts:51-54`); `artefactLines`
  renders one line per path the answer's own `artefactPaths` carries, in order, each spelled exactly
  as it arrived (`panel-tutor-foundations.ts:262-274`), so no path is re-rooted, normalised or
  shortened, and no template `reason`, `artefact` or `reading` field is read anywhere in the module.
- ✅ The five states render as five distinct renderings, each in its own sentence: the pane's own
  sentences live in one registry, `PANE_SENTENCES` — the five state sentences plus the pane's own
  `no-tutor-answer` absence (`panel-tutor-foundations.ts:129-160`) — and the missing-artefact
  sentence names the record and the missing path beside the absence
  (`panel-tutor-foundations.ts:151-154`). The one field whose meaning moves with the state is
  labelled apart: a path the reader reported present prints under `artefact`, a path it reported
  absent under `missing-artefact` — "A single label would let a missing path read as a present one
  beside the absence that names it (N3)"
  (`panel-tutor-foundations.ts:65-68`, the switch at `:301-304`). The lookup of a state word is an
  own-property one, so an `Object.prototype` collision renders as the bare word and borrows no
  field (`panel-tutor-foundations.ts:293-299`).
- ✅ T003/AC2 — the absences never fold, and the pane is not blank: a state word the pane was not
  written for renders as the word it was given and nothing else, borrowing no field
  (`panel-tutor-foundations.ts:296-299`), an answer that is no answer renders the named
  `no-tutor-answer` absence rather than an empty pane (`panel-tutor-foundations.ts:230-233`,
  `:156-159`), and the spec renders the demo for the three absence states node-side through the
  shipped join with a real reader — unmatched question, the M023 row whose record states no path,
  and the unreadable-records case each held to their own rendering
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5393-5550` at this commit).
- ✅ T003/AC3 — the route, the loader key and the sample fact exist, and the sample is the shipped
  join's own answer, not a literal nobody re-derives (PLAN C1): `PANEL_SURFACES` carries the
  `tutor-foundations` entry between `visual-qa` and `webmcp-rehearsal`, paid for out of the
  paragraph above it so no line the surface records cite moves
  (`apps/angular-ai-devtools/src/app/app.routes.ts:83`, the paragraph's own account at `:18`);
  `LOADERS` carries the lazy key (`apps/angular-ai-devtools/src/app/panel-demo.ts:64` at this
  commit); and `FACTS['tutor-foundations']` is documented as not written by hand —
  `panel-demo.spec.ts` "re-reads that record, evaluates the shipped index and the shipped join,
  answers the question with a reader built from the files this build read, and holds this fact to
  that answer field for field — so a fact that drifted from the record, the join or the tree
  reddens there rather than shipping"
  (`apps/angular-ai-devtools/src/app/panel-demo.ts:779-793`, the fact at `:794-803`; the
  field-for-field pin `expect(FACTS['tutor-foundations']).toEqual(answer)` at
  `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5407-5446` at this commit, with the reader
  built over the real records at `:5390`).
- ✅ The route-table suites were declared before starting and are held, not merely green:
  `scripts/panel-routes.test.mjs` pins the new surface in its table and proves its own teeth — a
  mutant that removes the route must change `app.routes.ts` and fail naming the missing surface
  (`scripts/panel-routes.test.mjs:579-592` at this commit), and a mutant that removes the
  `tutor-foundations` loader key must change `panel-demo.ts` and fail naming the missing surface
  (`scripts/panel-routes.test.mjs:1144-1167` at this commit). `app.spec.ts` asserts the route loads
  lazily and carries `data.surface === 'tutor-foundations'`
  (`apps/angular-ai-devtools/src/app/app.spec.ts:331-343` at this commit).
- ✅ `scripts/gate-integrity.test.mjs` is edited only to append the two declared reason rows waves 1
  and 2 added, never to loosen a check: the new block is appended after the last line the M044
  recording pins in the file — "a row added above one of those pinned references would stale it" —
  and each row is a reading of its own diff rather than a bare name admitted to the allow-list
  (`scripts/gate-integrity.test.mjs:5683-5693` at this commit), with the M055 rows restating the
  measured counts they pin (12 of 34, 44 claims, the 22 records in four shapes, all 44 paths
  resolving, E4's input constructed).
- ✅ The copy-digest gap is recorded, not papered over: the pane's own sentences are not entered in
  `extension/copy-digest.json`, which this task does not own, and the gap is recorded in the module
  header and in the task Log for T004, which re-measures the copy record over every surface on disk
  (`panel-tutor-foundations.ts:77-79`). T004's Log records the digest moving 181 rows for 189
  sentences to 187 for 195, with `panel-demo.ts`'s copy-check fact moved with the count and the
  file declared in T004's `files:` this time (`.project/tasks/T004-…md:201-210`).
- ✅ The build artifact is the build's own output: the commit's only `extension/panel/index.html`
  change is the built `modulepreload` chunk order
  (`extension/panel/index.html:12` in the diff), and T004's later verify reproduces the shipped
  bytes exactly (sha256 `b840cad0…`, `git status` clean for the artifact —
  `.project/tasks/T004-…md:513-517`).
- ✅ Observed at the reviewed head (re-run at `2feba85e1111f`, which carries these route-table and
  pane files unchanged since this commit): `node --experimental-strip-types --test
  scripts/panel-routes.test.mjs scripts/component-search.test.mjs` — tests 20, pass 20, fail 0.
  `panel-demo.spec.ts` holds the `FACTS` entry field-for-field to the join re-run over the real
  records in the landing's app-suite half (31 files, 358 tests, all pass —
  `.project/tasks/T004-…md:209-210`), and the project verify is recorded passing in
  `.project/build/verify-ledger.jsonl` (result `pass` at `9c490812`, T004's record-bearing commit).
- ⚠ Declared limit, not a defect: `apps/angular-ai-devtools/src/app/panel-demo.ts`'s copy-check
  fact reads `checked: 189` at this commit (`apps/angular-ai-devtools/src/app/panel-demo.ts:450`)
  because the digest does not yet carry this surface's sentences — the gap this task declared and
  T004 closed (`checked: 195` at the reviewed head, same file). The two-milestone split is the
  ownership the plan states, not a stale fact at the head that ships.

## Intent coverage

### SC1 — The panel, for a question whose answer a record contains, names the artefact file, the milestone the record belongs to and the criterion the artefact answers, each of the three read from the record's own fields — the milestone from the record's `milestone` field, the criterion from its criterion field, the file from its artefact-path field — and none of the three composed from a filename, a path convention or the record's prose fields; a mutant that assembles an answer by file naming or copies the derivation's prose as the answer reddens.: pass

- ✅ Covered by T003: the pane renders the join's own six fields under their own labels and skips
  what the join left null or empty (`panel-tutor-foundations.ts:51-54`, the line builders at
  `:236-280`), the sample fact is the shipped join's own answer re-derived node-side with a real
  reader on every test run (`panel-demo.ts:779-803`, the pin at
  `panel-demo.spec.ts:5407-5446`), and no prose field is rendered anywhere in the module.

### SC2 — A question no record answers is reported as unanswered, naming which absence holds — no criterion in any readable record matches the question, a matched criterion names no artefact path, or the records cannot be read — and that state is rendered as its own, distinct from an answer whose named artefact file is absent where the record says it lives, which names the record and the missing path beside the absence; a mutant that renders an unanswered question as an answer, or a missing artefact as unanswered, reddens.: pass

- ✅ Covered by T003: the five state sentences are enumerated once in `PANE_SENTENCES`
  (`panel-tutor-foundations.ts:129-160`), the missing-artefact sentence names the record and the
  missing path (`:151-154`), and the spec drives the unmatched, no-artefact-named and
  records-unreadable cases through the shipped join with a real reader
  (`panel-demo.spec.ts:5487-5550`), each held to its own rendering.

### SC3 — Nothing is cited that a record does not contain: every artefact path the panel renders is one the named record states and a file that exists where the record says it lives at the time the answer is served — inside the milestone's archive (`.project/archive/05*/`) when the record names archived evidence, at the repo-root path the record names otherwise — and every criterion id rendered appears among the named record's own criterion fields; a mutant that renders a path no record states, a file that is not there, or a criterion id the record does not carry reddens.: pass

- ✅ Covered by T003: `artefactLines` renders each path as it arrived (`:262-274`), the
  missing/present label split keeps a missing path from reading as present
  (`:65-68`, `:301-304`), and the sample's three fields are the record's own
  (`M054` / `SC1` / `scripts/visual-qa-style-read.test.mjs`, held field-for-field by the spec pin).

## Held-out edges

None assigned to T003; E4 is held out to T002's suite and its rendering here is exercised through
the join's constructed-input state in the spec, not re-pinned.
