# SYNTHESIS — gsd-path/M068 (decide)

The roadmap entry lists no open questions and the owner took no decision in this phase, so this record carries what was
measured before the plan and what the planner is told. It is not the milestone's ship-time synthesis.

## Settled

- Nothing in this repository read a document head entry before this milestone: `grep -rln 'document.head|document.title'`
  over `extension/*.js` returns no match, so the record this milestone joins is one it writes.
- M065's record (`research/raw/m065-title-record.json`) installed a MutationObserver on `<title>` and `document.head` in
  an isolated world, recorded three reads across three navigations, and states `writesSeen: 0` with "the portal carries
  no title instrumentation of its own and the observer names no writer". A criterion requiring the writer to be read
  directly would therefore be unprovable.
- `extension/field-state.js` and `extension/field-binder.js` already own a field's identity, so a head entry's identity
  must be asserted against a producer rather than derived a second time.

## Decisions

### D1 — the writing navigation is the navigation the record correlates a write with

- **Decision**: the join names a writing navigation only when the record carries one beside the write; a write with no
  navigation beside it answers `cannot-tell`, and no route is inferred from the entry's text or its order in the head.
- **Runner-up**: inferring the route from the entry's position in the head, which would name a route no reading took.
- **Evidence**: M065's record states `writesSeen: 0` for every read and its single `writes` row carries
  `navigationId: null` and `author: null`.
- **Confidence**: high

### D2 — the record states its absences structurally

- **Decision**: a fact the record did not read is recorded as `{ read: false, reason }` rather than omitted or softened,
  and the milestone's claims record carries it under `absence` with what was searched and what was found.
- **Runner-up**: writing a record with only the facts that were read, which would have let the join report a clean head
  it never checked.
- **Evidence**: the duplicate fact cannot be observed by the M065 capture at all — it holds one value per read and no key
  counts entries sharing a name — so `duplicate` is a named absence and the join answers `cannot-tell` for it.
- **Confidence**: high

### D3 — a record must be captured before anything that counts it

- **Decision**: the claims record is captured first, and every recording that counts it is derived after it, with the
  project verify last.
- **Runner-up**: capturing the claims record last, which was the original plan and produced two red project verifies —
  ten tests, then four — because the claims record and a suite edit each moved recordings that nothing after them
  re-derived.
- **Evidence**: `archiveReferences.filesExamined` 382 to 383 after the claims record landed, and
  `suiteDiff.differing[67].addedLines` 576 to 816 after T008 edited a pinned suite.
- **Confidence**: high

## Handed to the planner

- Four tasks in the shape this generation has settled into: measure, join, surface with every pin, then the recordings.
  The plan carries six waves; it grew to eleven because the tail's recordings depend on each other in one direction.
- Every recording this milestone writes is named in `scripts/recordings.json` and every new suite carries its
  `SUITE_DIFF_REASONS` row in the same task that adds it.
- The Insurance Portal is the verification target; the fixture is the fallback only where the portal carries no head
  write, and a verdict that uses it must name the route tried and the artefact the portal lacks.
