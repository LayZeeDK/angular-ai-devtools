# M057 tutor-signals — synthesis

Five waves, ten tasks, reviewed and landed. This records what the milestone measured before anything
was built on it, what the measurements forced the milestone to become, and the one thing that is true
of its evidence only at the head that ships.

## What the milestone set out to show

The roadmap asked for an answer that names the write that preceded a render, and asserted that the
signal graph, the write record and the render record are already captured. The panel is the only
surface: nothing is asked of the inspected page, and every claim an answer makes carries the artefact
path that states it, in M055's answer shape.

## What measurement changed

Two measured results decided the milestone's shape, and both were taken before the surface was built.

**The absence (C1).** A write record does not exist. The scan over `extension/` — 58 files, the four
hard needles `writeRecord`, `write_record`, `writeLog` and `writeOrder` matching nowhere — leaves five
`writes:` matches, and every one of them is a sanitizer binding's documented field, a test title or a
`matchDirectWrites:` identifier (`research/raw/m057-record-shapes.json:506-553`). The consequence was
not a capture to be added but a criterion rewritten: where the record carries no ordering between a
write and a render, the answer states the ordering as the named absence `no-write-record-no-order`
beside the effect and its upstream nodes, and names no write, no owner and no cause (SC2). A graph
edge is `{ consumer, producer }` and nothing else — no field, no value, no moment — so the absence is
structural rather than a capture this milestone declined to add
(`extension/render-phase.js:17-20`, re-derived at `research/raw/m057-record-shapes.json:554-566`).

**The refutation (C8).** The plan was written on a second premise, that no record under `research/raw/`
carries a node of kind `effect`. That premise is false: 16 objects carry `kind: "effect"` across six
records, 10 of them inside a `nodes` array, and exactly one record holds an effect node in the shape
the reader accepts — `research/raw/m039-render-phase.json`'s `/effect/freshRead`, six nodes all
carrying a numeric `index`, the effect at index 5 with the empty label, one consumer edge 5 → 2
(`research/raw/m057-record-shapes.json:567-717`). The plan was retargeted rather than the premise
quietly dropped, the retarget is recorded as a measurement that did not hold, and T003 reads that
record and pins it.

The reason both resolutions hold together is one measured line: `serializeGraph` writes
`id: String(n.id)` and resolves each edge end to a node id, so it never writes an `index`
(`research/raw/m057-record-shapes.json:764-767`). A fresh capture would reproduce the defect that
makes the join unreadable instead of curing it. The graph is therefore read from the record that
carries the indexed shape, and the write record is not simulated into existence.

## Derived rules the ship depends on

**T009's re-point.** The two gate tests this milestone's own branch binding broke no longer pin a
constant: `UNSHIPPED_MILESTONE` is read from `git log --grep=^ship: M` the way the shipped list
already was — `UNSHIPPED_PREDECESSOR` is the lowest id the log records no shipment for, and
`UNSHIPPED_MILESTONE` is that id plus one — and the refusal spellings interpolate the predecessor, so
they name the id the log actually lacks (`scripts/gate-integrity.test.mjs:4525-4545`, `:4580`,
`:4667`, `:4675-4708`). A test that pinned `M058` literally would have gone stale the moment M058
shipped; a test that derives it goes stale only if the derivation is wrong, and forcing
`UNSHIPPED_PREDECESSOR` to a shipped id reddens both tests by name
(`.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:102`).

**The stability record is valid only at the head that ships.** One value the record states is a
function of this milestone's own task logs, so every Log line appended after a capture makes the
record stale — measurably: `archive.detail.plainRun.summary` moved from 87 to 88 mention(s) across
T009's post-capture Log lines and T008's landing. T010 re-captured the record with its own armed
command as the last byte written to it, 6568 bytes, sha256
`57f8332c5f1e35822df253472ed9755bffdaefcd808f313c23ff5206646826a7`, a second armed run changing no
byte, with `capture.head` left at `5290d939` and `capture.at` preserved
(`research/raw/m056-gate-stability.json:30-33,87,113`;
`.project/build/verify-T010.log`). The rule the milestone leaves behind is the one it had to obey: a
capture-owned record is a reading, its staleness names its own re-capture command, and no value in it
may be typed by hand.

## What the reviews found

The wave reviews found no defect in what the code does and three in what the artefacts said. T007's
first Verify exited 1 because `research/raw/m048-surface.json`'s copy of the demo's copy-check fact
quoted `checked: 195` against the 201 the digest now carries — a record outside the task's declared
files, repaired by declaring it and re-deriving rather than by widening the assertion. T006 armed a
tripwire that fired as designed: its record map named no inventory, so the first own-record to land
reddened naming itself, and the repair was the map's own `inventory` block. T008's re-derived bytes
landed in the carry commit T009's checkout made of its dirty work, which both Logs state instead of
smoothing over.

## What this milestone leaves behind

- a panel answer that names the effect node the record carries, the label the graph gives it and the
  upstream nodes its edges state, or one of three distinct named absences;
- the measured fact that no write record exists, held to a re-derived scan rather than a prose claim;
- the rule that a capture-owned record is only ever valid at the head that ships, and that its
  re-capture is a command the record itself names;
- and a gate whose unshipped predecessor is derived from the log, so the milestone binding it cannot
  make it stale.

## Open, recorded, not hidden

`serializeGraph` still writes no `index`, so a live capture cannot feed this read until the serializer
changes — out of this milestone's scope, and recorded as the reason a record rather than a capture is
read. The portal's labelled effect carries no node `index` in any record on disk, so the indexed read
is proved on `m039-render-phase.json`'s `/effect/freshRead` and the portal route tried is named where a
verdict reaches a fixture (INTENT C3, E6). Neither blocks the ship; both are stated in
`.project/review/FINAL.md`.
