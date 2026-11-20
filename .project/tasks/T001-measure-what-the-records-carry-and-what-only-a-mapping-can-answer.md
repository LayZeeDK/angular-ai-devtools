---
id: T001
title: Measure what the records carry and what only a mapping can answer
wave: 1
status: done
deps: []
agent: build_T001
base: b450c28b3a4497e5e6cba106a6c8618981ffca87
worktree: null
task_branch: null
files:
  - research/raw/m055-record-shapes.json
  - scripts/tutor-record-shapes.test.mjs
---

# T001 — Measure what the records carry and what only a mapping can answer

## Context

The milestone's claim is a traceability claim: an answer names the artefact a record names. C2
measured which fields identify a criterion, a recording and a file in
`research/raw/m054-verdict-claims.json`, and which do not in `research/raw/m054-surface.json`;
this task re-measures that over every verdict-claims record present and records it as the field map
every later wave reads — because a wave that names a field the records do not carry is building on
prose, and the template-prose trap (C3) is exactly a field that looks like an answer and is not.

## Approach

Measure statically and record `research/raw/m055-record-shapes.json` with `path:line` citations
carrying each cited line's own trimmed text, every citation re-resolved by searching its file for
the exact line it quotes rather than by trusting a typed number.

**The three-side field map**, measured over `research/raw/m052-verdict-claims.json`,
`research/raw/m053-verdict-claims.json` and `research/raw/m054-verdict-claims.json`: the milestone
is named by the record's `milestone` field; a criterion is named by `claims[].criterion` with its
full text at `claims[].criterionText`; a file is named by `claims[].artefactPath`, with the suites
at `evidence.suites[].path` and the recordings at `evidence.recordings` and `capture.records`. The
recording declares this map, and nothing downstream names a field it does not declare.

**The negative measurement that decides the design** (C2): no record field carries end-user
question vocabulary mapped to a criterion — the surface records' `question` field (for example
`research/raw/m054-surface.json:6`) records the recording question of the surface itself, not a
user question — so the question-to-criterion side is the one authored mapping this milestone owns,
and the criterion-to-artefact side is answerable from the records alone.

**The C3 trap, recorded as a ruling and not a repair**: the derivation's `reason`, `artefact` and
`reading` fields are one template shared across milestones (word for word between M053's and M054's
records), and its `proves` commands cite a suite the recorded milestone never ran — recorded as
never-rendered, not fixed; repairing the derivation is not this milestone's scope.

`scripts/tutor-record-shapes.test.mjs` parses the recording and re-checks each citation at this
head. Nothing is built: no index, no join, no surface, no route, no recording beyond the shape
record.

## Intent coverage

- SC1
- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact. The file changes only through
`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

  - research/raw/m055-record-shapes.json
  - scripts/tutor-record-shapes.test.mjs

## Acceptance criteria

1. `research/raw/m055-record-shapes.json` exists with `path:line` citations carrying each cited
   line's own trimmed text, every citation re-resolved by searching its file for the exact line it
   quotes, and `scripts/tutor-record-shapes.test.mjs` parses the recording and re-checks each
   citation at this head.
2. The recording states, for each of the three answer sides, which record field names it — the
   milestone from the record's `milestone` field, the criterion from `claims[].criterion` with its
   full text at `claims[].criterionText`, the file from `claims[].artefactPath` with the suites at
   `evidence.suites[].path` and the recordings at `evidence.recordings` and `capture.records` —
   measured over every verdict-claims record present, and no later wave names a field the recording
   does not declare (SC1).
3. The recording states the negative measurement that decides the design: no record field carries
   end-user question vocabulary mapped to a criterion, so the question-to-criterion side is the one
   authored mapping this milestone owns (SC2); and it states that the derivation's `reason`,
   `artefact` and `reading` fields are one template shared across milestones, recorded as
   never-rendered rather than repaired (C3).
4. Nothing is built: no index, no join, no surface, no route, no recording beyond the shape record.

## Verify

```bash
node --experimental-strip-types --test scripts/tutor-record-shapes.test.mjs && npx prettier --check scripts/tutor-record-shapes.test.mjs
```

## Log

- pending.
- Landed paths: `research/raw/m055-record-shapes.json`, `scripts/tutor-record-shapes.test.mjs` — each is read from this tree, ready.
