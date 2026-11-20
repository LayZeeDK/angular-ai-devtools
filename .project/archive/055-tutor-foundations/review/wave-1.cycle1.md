# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4d39bbbdf5619ce03a079cb5482b11a31ef4da16

## T001 — Measure what the records carry and what only a mapping can answer: pass

- ✅ T001/AC1 — the recording exists with `path:line` citations that carry each cited line's own
  trimmed text, and every citation is re-resolved by searching its file for the exact line it quotes
  rather than by trusting a typed number: the discipline is declared in the recording's own
  instrument metadata (`research/raw/m055-record-shapes.json:13`) and enforced by
  `resolveCitation`, which searches the quoted file for the trimmed text and reddens when the found
  line differs from the cited one (`scripts/tutor-record-shapes.test.mjs:176-230`); the doctored-
  citation mutant demonstrates the reddening by sliding a citation one line and failing with
  "cites … :7 and searching the file for the quoted line finds it at 6"
  (`scripts/tutor-record-shapes.test.mjs:1512-1538`, mutant output observed at the reviewed head).
  The diff builds nothing else — `git show 4d39bbbd --stat` touches only the task file, the
  recording and its suite.
- ✅ T001/AC2 — the three-side field map is stated per field with counts, measured over every
  verdict-claims record present, not a sample: the map holds `milestone` 34/34 (verdict-claims) and
  9/9 (surface), `criterion` and `criterionText` 34/34 and 0/9, `artefactPath` 12/34 and 0/9,
  `evidence.recordings` 11/34 and `evidence.suites[].path` 11/34
  (`research/raw/m055-record-shapes.json:520-580`), with the tree's own disagreement with the brief's
  expectation recorded rather than hidden — six verdict-claims and five surface records expected,
  34 and 9 found, "so the map is measured over all 43 records rather than over a sample"
  (`research/raw/m055-record-shapes.json:71-74`), and the inventory lists all 34 verdict-claims
  paths (`research/raw/m055-record-shapes.json:17-56`). The suite holds the table to the records on
  both sides — a record present and not measured reddens, a measured record absent reddens
  (`scripts/tutor-record-shapes.test.mjs:1420-1441`), and a claimed field count that this head does
  not measure reddens naming the claim (invented-field mutant, observed: "count is 4 and this head
  measures 0", `scripts/tutor-record-shapes.test.mjs:1540-1571`).
- ✅ T001/AC3 — the negative measurement that decides the design is stated and pinned: "the negative
  is the finding: the milestone has to author one mapping from a question to a criterion id …
  because nothing else in the tree states it" (`research/raw/m055-record-shapes.json:4576`), with
  the per-surface-record reading showing 0 of 9 `question` values names a criterion id and no
  surface record carries a `claims` array at all, each quoted from its own line 6
  (`research/raw/m055-record-shapes.json:4520-4574`), and the observed totals
  "0 question-shaped keys across 34 verdict-claims records; 0 of 9 surface records carry a `claims`
  array" (`research/raw/m055-record-shapes.json:6654-6657`). The suite holds the negative over the
  real tree, not the recording's word: 34 verdict-claims records carry 0 question-shaped keys, and
  the nine surface questions are re-enumerated at run time
  (`scripts/tutor-record-shapes.test.mjs:1480-1493`, observed output listing all nine).
- ✅ T001/AC4 (C3 as a ruling, not a repair) — the trap is recorded as never-rendered and
  never-repaired: "quoted and measured, never rendered and never repaired: the derivation's
  `reason`, `artefact` and `reading` fields are one template shared across milestones … repairing
  it is not this milestone's scope" (`research/raw/m055-record-shapes.json:4578-4584`), and the
  measurement behind the ruling is quantified — 38 rows in 11 records collapse to one template once
  the criterion id, its text and three interpolated lists are substituted, with the placeholder
  normalisation stated (`research/raw/m055-record-shapes.json:4585-4596`), the word-for-word `reason`
  rows quoted per record (`research/raw/m055-record-shapes.json:6689-6752`), and the un-measurable
  residue recorded as unknowns rather than asserted
  (`research/raw/m055-record-shapes.json:6895-6902`). The suite pins the ruling's shape: one
  template, 46 `proves` rows citing `scripts/navigation-blocking.test.mjs` that 0 records name in
  `evidence.suites`, and the 2-required/154-not-required split
  (`scripts/tutor-record-shapes.test.mjs:1494-1511`, observed).
- ✅ The C4 finding is measured with the exact counts the later waves build on: `artefactPath`
  carried by 12 of the 34 with "22 of 34 verdict-claims records carry no artefact-path field; … G1
  names the four shapes the 22 use instead" (`research/raw/m055-record-shapes.json:581-599`), and
  the absence table states the per-record shape each of the 31 uncarrying files uses (observed
  suite output: "artefactPath: absent from 31 record(s), each one stating the shape it uses
  instead", `scripts/tutor-record-shapes.test.mjs:1442-1464`). A1 records that every artefact path
  resolves — "44 of 44 artefact paths resolve and 0 do not; the 2 `verdictPath` values M022 names
  are absent from the tree" (`research/raw/m055-record-shapes.json:6660-6687`) — which is the fact
  that later makes E4's dead-path state constructed rather than live, and the two M022 `verdictPath`
  values are named so they cannot be misread as a live dead path
  (`scripts/tutor-record-shapes.test.mjs:1465-1479`, observed).
- ✅ T004's two records are named outside the map on purpose, not omitted:
  `research/raw/m055-verdict-claims.json` and `research/raw/m055-surface.json` are listed under
  `inventory.outsideTheMap` with a `why` that says "captured by T004, after this map was measured;
  named so a record this milestone adds is outside the map on purpose rather than by omission"
  (`research/raw/m055-record-shapes.json:76-85`), and the suite holds the subtraction to exactly
  those two paths — a present record not named outside reddens naming it (observed: "the map
  measures every surface record present, the records named outside it excepted: the tree holds 11,
  and 2 are named outside the map", `scripts/tutor-record-shapes.test.mjs:484-503`,
  `:1573-1602`).
- ✅ Observed at the reviewed head: `node --experimental-strip-types --test
  scripts/tutor-record-shapes.test.mjs` — tests 26, pass 26, fail 0, 602 citations re-resolved by
  search over 43 records, 44 artefact paths all resolving
  (`scripts/tutor-record-shapes.test.mjs:1403-1419`). The landing verify at the task's own commit is
  recorded in `.project/build/verify-T001.log`.
- ⚠ Declared limit, not a defect: the recording's `head` is the plan baseline
  `b450c28b3a4497e5e6cba106a6c8618981ffca87` (`research/raw/m055-record-shapes.json:7`) — the head
  T001 measured at, not this reviewed head. The suite resolves that head through
  `git rev-parse` and pins it as a commit this checkout carries
  (`scripts/tutor-record-shapes.test.mjs` head test, observed: "head b450c28b is a commit this
  checkout carries"), and the later waves re-derive what moves. This is the field's declared
  ownership, not a slid citation.

## Intent coverage

### SC1 — The panel, for a question whose answer a record contains, names the artefact file, the milestone the record belongs to and the criterion the artefact answers, each of the three read from the record's own fields — the milestone from the record's `milestone` field, the criterion from its criterion field, the file from its artefact-path field — and none of the three composed from a filename, a path convention or the record's prose fields; a mutant that assembles an answer by file naming or copies the derivation's prose as the answer reddens.: pass

- ✅ Covered by T001: the recording states, per side, which field names it and over how many records
  it holds, with the criterion-to-artefact side holding where the field holds
  (`research/raw/m055-record-shapes.json:520-580`) and the per-file table naming, for every record
  that lacks a field, the shape it uses instead (observed suite leg at
  `scripts/tutor-record-shapes.test.mjs:1442-1464`). Nothing downstream names a field the recording
  does not declare: wave 2's join reads exactly `milestone`, `claims[].criterion` and
  `claims[].artefactPath` (`extension/tutor-foundations.js:105-109`, reviewed in wave 2), the same
  three fields this map declares, and nothing else.
- ✅ The static read declares what it did not do — no browser opened, no page read, no build or test
  run — so the recording cannot be mistaken for a live capture
  (`research/raw/m055-record-shapes.json:9`).

### SC2 — A question no record answers is reported as unanswered, naming which absence holds — no criterion in any readable record matches the question, a matched criterion names no artefact path, or the records cannot be read — and that state is rendered as its own, distinct from an answer whose named artefact file is absent where the record says it lives, which names the record and the missing path beside the absence; a mutant that renders an unanswered question as an answer, or a missing artefact as unanswered, reddens.: pass

- ✅ Covered by T001: no record field carries end-user question vocabulary mapped to a criterion, so
  the question-to-criterion side is the one authored mapping this milestone owns
  (`research/raw/m055-record-shapes.json:4576`, observed suite leg at
  `scripts/tutor-record-shapes.test.mjs:1480-1493`). The trap fields are ruled never-rendered
  (`research/raw/m055-record-shapes.json:4578-4584`), which is the prohibition wave 2's join and
  wave 3's pane each hold as mutants rather than prose.

## Held-out edges

None assigned to T001 (`research/raw/m055-verdict-claims.json:29-31` names E4 held out to
`scripts/tutor-answer.test.mjs`, T002's).
