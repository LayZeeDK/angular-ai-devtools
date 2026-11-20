# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: f5f70284c923726c4ccf3f0a3eefa694acf8fc9b

## T002 — Author the one mapping and join it to the records pure: pass

- ✅ T002/AC1 — the index is the one authored mapping, two facts per row and nothing else (N5): each
  of the ten rows carries exactly `question`, `criterion` and `milestone`, every row frozen and the
  list frozen so a caller cannot assign a third fact or grow the list
  (`extension/tutor-index.js:31-94`), and the refusal is enforced over the file's own bytes, not
  promised — the suite reads the index source and refuses a slash in its code, any
  file-extension-shaped token, and any repository path anywhere in its bytes
  (`scripts/tutor-answer.test.mjs:871-893`), with three row mutants (a path, a value, an answer
  text) each reddening naming N5, and a fourth refusing the path-shaped question text itself
  (mutant output observed: "the index spells no path: its code and its rows carry no slash …
  research/raw/m044-gate-shapes.json (N5)"). Every criterion id is held to the record on disk its
  milestone names at authoring time and on every run
  (`scripts/tutor-answer.test.mjs:871-893`), and a row naming an id no record carries reddens
  naming the record (observed: "M044 carries no SC9 (N4)"). Line 72's question is the row wave 4's
  recorder census must later excuse — see the declared limit below.
- ✅ T002/AC2 — the pure join answers from the records' own fields at answer time and from nothing
  else (N1): `tutorAnswer(question, sources)` reads the milestone from the record's `milestone`
  field, the criterion from its `claims[].criterion` and the path from its
  `claims[].artefactPath` — the three fields named once in `READS`
  (`extension/tutor-foundations.js:105-109`) — and never the template `reason`, `artefact` or
  `reading` fields: `pathsOfClaim` takes only `claim.artefactPath` and a non-string names no path,
  "never a path pulled out of its prose, never one built from its criterion or from the name of the
  file the record sits in" (`extension/tutor-foundations.js:188-193`). The mutants for
  answer-from-prose and path-from-convention redden because the fixtures' prose names a decoy file
  the correct answer must not render (observed: "the record states
  \"research/raw/fixture-recording.json\" and the answer rendered
  [\"research/raw/decoy-template-prose.json\"]", `scripts/tutor-answer.test.mjs:1316-1324`,
  `:1326-1334`). The purity pin holds the module source to no import, no filesystem, no network, no
  DOM, no clock and no prose field (`scripts/tutor-answer.test.mjs:1127-1210`).
- ✅ T002/AC3 — the load-bearing mutant exists and reddens: a join that replaces a record's
  `artefactPath` with a hard-coded constant and still answers — right milestone, right criterion,
  a path the record does not state — fails the verbatim pin because the fixtures carry paths the
  constant cannot match (observed: "the record states \"research/raw/fixture-recording.json\" and
  the answer rendered [\"scripts/copy-check.test.mjs\"]", defect `hard-coded` at
  `scripts/tutor-answer.test.mjs:1211-1219`). Every mutant is run against the shipped file with the
  pin held green on the unmutated bytes first, so a reddening below is the mutation's and not a pin
  that was already red (`scripts/tutor-answer.test.mjs:1570-1598`), and the battery's anchors are
  proved to be one place in the shipped file that really changes
  (`scripts/tutor-answer.test.mjs:1553-1568`).
- ✅ T002/AC4 — the three absences are distinct states with distinct sentences (E3, N2), and an
  unanswered question is never an answer: the join decides them in a stated order — instrument, then
  records, then mapping, then criterion, then field, then presence
  (`extension/tutor-foundations.js:58-62`) — with `no-matching-criterion` at
  `extension/tutor-foundations.js:273-305` (two cases, one state, `detail` says which),
  `no-artefact-named` at `extension/tutor-foundations.js:310-325` naming the missing field and the
  record, and `records-unreadable` at `extension/tutor-foundations.js:240-269` (three cases, one
  state). The folding mutant reddens naming which absence holds (observed: "the absence \"no row of
  the mapping carries the question\" names which absence holds, among the three absences the
  surface renders distinctly", `scripts/tutor-answer.test.mjs:1391-1404`), the unanswered-as-answer
  mutant reddens (observed: "an unanswered question is unanswered, with nothing beside it: the join
  said \"answered\" for a question no row carries", `:1424-1432`), and the always-refuses mutant —
  a join that refuses every question — reddens because a surface that always refuses is not a
  surface (observed: "… and a surface that always refuses is not a surface: the join said
  \"no-matching-criterion\"", `:1311-1320`).
- ✅ T002/AC5 — held-out E4 is owned, and honestly: presence of every rendered path is read through
  the injected reader at answer time, never baked — a strict `true` is the only present
  (`extension/tutor-foundations.js:327-334`) — and a false return is `missing-artefact` naming the
  record and the missing path, never `no-matching-criterion`
  (`extension/tutor-foundations.js:336-355`). The reader-ignored mutant (a join that answers from a
  bake) reddens naming E4's sentence (observed: "the join said \"answered\"", defect `reader` at
  `scripts/tutor-answer.test.mjs:1364-1372`), and the missing-file-as-unanswered mutant reddens the
  other way (observed: "The join said \"no-matching-criterion\"", `:1355-1363`). E4's dead-path
  input is constructed, and the module says so rather than manufacturing a dead path: "E4's
  dead-path state has no live instance: all 44 `artefactPath` values resolve at the head the
  milestone's recording measured. The state is therefore pinned by a constructed input in the suite
  that owns it, and this note says so plainly"
  (`extension/tutor-foundations.js:73-76`; the constructed-input test at
  `scripts/tutor-answer.test.mjs:1020-1049`). This matches T001's A1 finding — 44 of 44 resolve
  (`research/raw/m055-record-shapes.json:6684-6687`, reviewed in wave 1) — and the
  plan's correction 4. E5 is pinned: a second answer names the same artefact, milestone and criterion
  (`scripts/tutor-answer.test.mjs` E5 test; the second-call-differs mutant reddens with "the first
  named [\"research/raw/fixture-recording.json\"] and the second named []").
- ✅ T002/AC6 — E1 and E2 hold: a claim whose `artefactPath` names a recording and one whose names a
  suite render through the same read, both answers carrying the same three fields
  (`scripts/tutor-answer.test.mjs` E1 test), and a criterion whose record states more than one path
  renders each exactly as the record spells it (`extension/tutor-foundations.js:195-229` — every
  claim of the criterion contributes its path in the record's own order), with the
  path-renormalised mutant reddening (observed: "the record states
  [\"research/raw/fixture-recording.json\",\"scripts/fixture-suite.test.mjs\"] and the answer
  rendered [\"./fixture-recording.json\",\"./fixture-suite.test.mjs\"]",
  `scripts/tutor-answer.test.mjs:1336-1344`). A criterion id the record does not carry is refused
  rather than rendered (N4; the criterion-not-carried mutant reddens with "the row named SC2, the
  record carries SC2, and the answer rendered \"SC1\"", `:1373-1381`), and the milestone is the
  record's own field verbatim — both spellings matched on the first token
  (`extension/tutor-foundations.js:133-141`), with the milestone-from-id mutant reddening (observed:
  "the record states \"M046 copy-to-agent\" and the answer rendered \"M046\"",
  `:1382-1390`).
- ✅ The real-records leg answers over the records on disk with a real reader, so presence is
  re-checked on every run: the shipped index is answered row by row over T001's 34 records
  (`scripts/tutor-answer.test.mjs`, "T002 — the shipped index answers over the real records with a
  real reader"), and the C4 pin renders the 12 path-carrying records as answers and the 22 that
  carry none as the absence (observed suite output: "T002 records: 34 verdict-claims records, 44
  claim(s) answered with their own claims[].artefactPath, 22 record(s) rendered as
  no-artefact-named"). The `no-artefact-named` detail never composes a path: "none is composed from
  its prose fields or from its own name" (`extension/tutor-foundations.js:317-324`).
- ✅ Observed at the reviewed head (re-run at `2feba85e1111f`, which carries these three files
  unchanged since this commit): `node --experimental-strip-types --test
  scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs` — tests 26, pass 26, fail 0,
  with the index census "10 row(s), 9 naming a criterion whose record states an artefact path, 1
  naming one whose record states none" — the M023 row the index header declares on purpose
  (`extension/tutor-index.js:18-23`). The landing verify is recorded in
  `.project/build/verify-T002.log`.
- ⚠ Declared limit, not a defect: `extension/tutor-index.js:72`'s authored question contains the
  word "interaction", which M049's recorder census counted until wave 4 excluded the authored index
  by name — a red T002 authored and wave 4 closed, with the exclusion narrow (exactly two readers,
  pinned by mutant) and the reason stated in the census itself ("an authored question is not a
  recording", `scripts/interaction-story.test.mjs:821-836`, reviewed in wave 4). At this commit the
  suite `scripts/interaction-story.test.mjs` is red on that one pin; the defect is T002's
  authorship meeting an older pin's breadth, not a false answer in the join, and it is closed at
  the head the milestone ships.

## Intent coverage

### SC1 — The panel, for a question whose answer a record contains, names the artefact file, the milestone the record belongs to and the criterion the artefact answers, each of the three read from the record's own fields — the milestone from the record's `milestone` field, the criterion from its criterion field, the file from its artefact-path field — and none of the three composed from a filename, a path convention or the record's prose fields; a mutant that assembles an answer by file naming or copies the derivation's prose as the answer reddens.: pass

- ✅ Covered by T002: the three fields are read at answer time from the parsed record a caller hands
  over (`extension/tutor-foundations.js:5-11`, `:105-109`, the answered return at
  `:358-373` echoing the record's own values verbatim), none composed from a filename, a path
  convention or prose (mutants observed above), and the answering record is found by matching the
  row's milestone and criterion against the records' own fields
  (`extension/tutor-foundations.js:200-229`).
- ✅ The index side is the one authored mapping and nothing more: no path, no value, no answer text
  in any row (`extension/tutor-index.js:10-16`, enforced by the suite's byte-level refusal).

### SC2 — A question no record answers is reported as unanswered, naming which absence holds — no criterion in any readable record matches the question, a matched criterion names no artefact path, or the records cannot be read — and that state is rendered as its own, distinct from an answer whose named artefact file is absent where the record says it lives, which names the record and the missing path beside the absence; a mutant that renders an unanswered question as an answer, or a missing artefact as unanswered, reddens.: pass

- ✅ Covered by T002: the five states are enumerated as data (`extension/tutor-foundations.js:88-101`)
  and decided in the contract's order (`:58-62`), each absence with its own sentence and the
  missing-artefact state naming the record and the missing path (`:336-355`); the folding,
  unanswered-as-answer, missing-file-as-unanswered and reader-ignored mutants each redden naming
  their defect (observed above). Held-out E4 belongs to this task and is answered by a constructed
  input because no live instance exists — stated by the module itself
  (`extension/tutor-foundations.js:73-76`).

### SC3 — Nothing is cited that a record does not contain: every artefact path the panel renders is one the named record states and a file that exists where the record says it lives at the time the answer is served — inside the milestone's archive (`.project/archive/05*/`) when the record names archived evidence, at the repo-root path the record names otherwise — and every criterion id rendered appears among the named record's own criterion fields; a mutant that renders a path no record states, a file that is not there, or a criterion id the record does not carry reddens.: pass

- ✅ Covered by T002: every rendered path is the record's own `claims[].artefactPath` verbatim
  (`extension/tutor-foundations.js:185-193`, E2's order at `:195-229`), presence read through the
  injected reader at answer time (`:327-334`), and a mutant rendering a path no record states, a
  normalised path, or a criterion id the record does not carry reddens (observed above). The
  real-records leg re-derives the shipped index's answers over the records on disk on every run, so
  a path that stops resolving reddens the suite rather than the surface rendering from a stale
  bake.
