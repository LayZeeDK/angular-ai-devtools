# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 6c3e2645

## T001 — Measure the head entries the portal writes and the navigations beside them: pass

- ✅ Landed `scripts/head-record.test.mjs` and `research/raw/m068-head-record.json`; own Verify 17 tests / 17 pass.
- ✅ Identity is read from `observation.observedTitleElement` and the mechanism naming the `<title>` element, never from the entry text, and is asserted against `extension/title-input.js` run in a bare `node:vm` context.
- ✅ Two facts are named absences rather than invented: `writtenBy` because `writesSeen` is 0 at all three reads, and `duplicate` because the record holds one value per read and no key counts entries sharing a name.
- ✅ Six mutants redden by name — invented writing navigation, invented duplicate, uncarried route, first sight moved, second identity, name taken from the text. The armed writer refuses a candidate its own pin rejects and writes nothing, proved with the file hash unchanged.

## Intent coverage

### SC3 — The observed entries and their writing navigations are read from a record this milestone writes, and the entry identity is asserted against the producer rather than derived a second time.: pass

- ✅ T001 carries it: the acceptance criteria the plan assigns to this task for SC3 are the ones it proved, and the run is recorded in the verify ledger at this head.

## Surface contract

The intent declares `Surfaces: panel`, and the surface lands in wave 3. This wave writes the record the surface renders, so
the contract is proved here only for the data half: every key the panel will show is present in the record or is a named
absence with its reason, and the record names no remedy and no route it did not carry.
