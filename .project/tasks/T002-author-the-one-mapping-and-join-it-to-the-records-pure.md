---
id: T002
title: Author the one mapping and join it to the records pure
wave: 2
status: done
deps: [T001]
agent: build_T002
base: ee89e9cf996c8c60615956a67d246477588bb941
worktree: null
task_branch: null
files:
  - extension/tutor-index.js
  - extension/tutor-foundations.js
  - scripts/tutor-answer.test.mjs
  - research/raw/m055-record-shapes.json
---

# T002 — Author the one mapping and join it to the records pure

## Context

T001's recording (`research/raw/m055-record-shapes.json`) declares the field map and the negative
measurement: the criterion-to-artefact side is answerable from the records' own fields, the
question-to-criterion side is not, so exactly one authored mapping is in scope (C2). The join is
pure so node-side mutants can redden every way the answer could lie, and so the surface (T003)
renders it without restating its rules as a computation. N5 is the load-bearing prohibition here: a
mapping that hard-codes an artefact path while claiming to be derived is the failure this milestone
exists to prevent, and no suite may pass it.

## Approach

Author `extension/tutor-index.js` on `globalThis.angularAiTutorIndex`: the one authored mapping this
milestone owns — rows of exactly the question text, the criterion id and the milestone, each
criterion id one the named record's own `claims[].criterion` fields carry, asserted against the
records on disk by the suite at authoring time and on every run. Nothing else in a row (N5): no
artefact path, no value, no answer text, no prose.

Build `extension/tutor-foundations.js`: the pure join `tutorAnswer(question, sources)` on
`globalThis.angularAiTutorFoundations`, taking the question, the index, the parsed records and an
injected `sources.exists(path)` reader, and returning `{ state, question, milestone, criterion,
artefactPaths, detail }`, where `state` is `answered`, `no-matching-criterion`,
`no-artefact-named`, `records-unreadable` or `missing-artefact`, and `detail` is the join's own
sentence about which absence holds — never a record field. An `answered` result reads the milestone
from the record's `milestone` field, the criterion from its `claims[].criterion` and the artefact
path from its `claims[].artefactPath` — never from the template `reason`, `artefact` or `reading`
fields (N1) — and never composes any of the three from a filename, a path convention or the
record's prose. The three absences are distinct (E3, N2): no criterion in any readable record
matches the question answers `no-matching-criterion`; a matched criterion whose claim names no
artefact path answers `no-artefact-named`; the records cannot be read answers
`records-unreadable`. Presence of every rendered path is read through the injected reader at answer
time, never baked into the index, the join or a build step: a path that is not present where the
record says it lives answers `missing-artefact` naming the record and the missing path — never
`no-matching-criterion` (E4, held out). A second answer names the same artefact, milestone and
criterion (E5). The join imports nothing at runtime, touches no filesystem, dispatches no message,
performs no network call and holds no clock.

`scripts/tutor-answer.test.mjs` pins both modules, then mutates, each mutant with its own anchor
assertion: an index row carrying an artefact path, a value or an answer text (the suite also reads
the index file and refuses any path-shaped string inside it, N5); an answer assembled from the
template prose, or by file naming or path convention; **the load-bearing mutant — a join that
replaces a record's `artefactPath` with a hard-coded constant and still answers, right milestone,
right criterion, a path the record does not state, against fixtures whose paths the constant cannot
match**; an unanswered question rendered as an answer with content; the absences folded into one
blank state; a missing artefact rendered as unanswered; a join that ignores the reader and answers
from a bake; a criterion id the record does not carry (N4); a path re-rooted, normalised or
shortened; and a join that refuses every question — a surface that always refuses is not a surface.
The fixtures pattern the real shape (`milestone`, `claims[].criterion`, `claims[].artefactPath`)
and include the E1 pair — one claim whose `artefactPath` names a recording (`research/raw/…`) and
one whose names a suite (`scripts/…test.mjs`), rendered through the same read, both answers carrying
the same three fields — and the E2 fixture, one criterion whose record states more than one
artefact path, each rendered exactly as the record spells it. A real-records leg re-derives an
answer over the verdict-claims records on disk with a real reader, so presence is re-checked at
answer time on every run. This task owns held-out E4.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact. The file changes only through
`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

  - extension/tutor-index.js
  - extension/tutor-foundations.js
  - scripts/tutor-answer.test.mjs
  - research/raw/m055-record-shapes.json

## Acceptance criteria

1. `extension/tutor-index.js` holds the one authored mapping: rows of exactly the question text,
   the criterion id and the milestone, every criterion id one the named record's own
   `claims[].criterion` fields carry, asserted against the records on disk; a mutant whose row
   carries an artefact path, a value or an answer text reddens, and the suite refuses any
   path-shaped string inside the index (N5).
2. The pure join answers from the records' own fields at answer time — the milestone from the
   record's `milestone` field, the criterion from its `claims[].criterion`, the artefact path from
   its `claims[].artefactPath` — never from the template `reason`, `artefact` or `reading` fields
   (N1); a mutant that assembles the answer from prose, or composes any of the three from a
   filename, a path convention or the record's prose, reddens.
3. The load-bearing mutant (N5): a join that replaces a record's `artefactPath` with a hard-coded
   constant and still answers — right milestone, right criterion, a path the record does not state —
   reddens; the fixtures carry paths the constant cannot match and the assertion demands the
   rendered path equal the record's own field.
4. The three absences are distinct states, each naming which absence holds (E3, N2); a mutant that
   renders an unanswered question as an answer with content, folds the absences into one blank
   state, or refuses every question reddens.
5. Held-out E4: presence of every rendered path is read through the injected reader at answer time,
   never baked; a file that is not present where the record says it lives answers
   `missing-artefact` naming the record and the missing path — never `no-matching-criterion` — and
   a join that ignores the reader and answers from a bake reddens; a second answer names the same
   artefact, milestone and criterion (E5).
6. E1: a claim whose `artefactPath` names a recording and one whose names a suite render through
   the same read, both answers carrying the same three fields; E2: a criterion whose record states
   more than one artefact path renders each path exactly as the record spells it, never re-rooted,
   normalised or shortened; a mutant that renders a criterion id the record does not carry reddens
   (N4).

## Verify

```bash
node --test scripts/tutor-answer.test.mjs && npx prettier --check extension/tutor-index.js extension/tutor-foundations.js scripts/tutor-answer.test.mjs
```

## Log

- pending.
- Landed paths: `extension/tutor-index.js`, `extension/tutor-foundations.js`, `scripts/tutor-answer.test.mjs`, `research/raw/m055-record-shapes.json` — each is read from this tree, ready.
