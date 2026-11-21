# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 05c2f02240a2bbb8131e6bbbe15ca35b45e78cf3

## T001 — Measure what the two records carry and what no record carries: pass

- ✅ The recording exists with `path:line` citations that carry each cited line's own trimmed text and
  are re-resolved by searching the cited file for that exact text, never by trusting the typed
  number: the discipline is stated in the recording's own `method` metadata
  (`research/raw/m057-record-shapes.json:6`) and enforced twice by the suite — the text-equality leg
  that reddens a citation which slid off its line
  (`scripts/tutor-signals-shapes.test.mjs:199-214`) and the search leg that reddens a citation whose
  quoted line the file now carries at a different number
  (`scripts/tutor-signals-shapes.test.mjs:215-228`). The diff builds nothing else — `git show
  05c2f022 --stat` touches only the task file, the recording and its suite.
- ✅ The field map declares, per side, exactly what an answer may read, and the suite holds the join
  to it: the graph side is `serializeGraph` and the one per-check carry, both cited
  (`research/raw/m057-record-shapes.json:9-13`, the suite's assertion at
  `scripts/tutor-signals-shapes.test.mjs:111-117`); a node is read for `index`, `kind` and `label`
  with `id`, `epoch`, `value` and `debuggableFn` declared ignored
  (`scripts/tutor-signals-shapes.test.mjs:118-132`); an edge is its two ends and nothing else
  (`:133-145`); and the serializer's own output is measured as the absence it is — `nodeFieldsNotWritten`
  is `['index']` while `nodeFieldsWritten` includes `id`, cited as the literal `id: String(n.id),`
  (`scripts/tutor-signals-shapes.test.mjs:146-157`).
- ✅ The first negative — the intent's C1 — is stated as a measurement with its command, its counts
  and its five matches, not as prose: `writeRecord` claims `no write record, no order`, `holds: true`,
  58 files scanned, and every one of its five `writes:` matches is a sanitizer binding's documented
  field, a test title, or a `matchDirectWrites:` identifier
  (`research/raw/m057-record-shapes.json:506-553`, conclusion at `:552`). The suite re-derives the
  scan over `extension/` on every run and holds the found matches to the stated ones, asserting the
  four hard needles (`writeRecord`, `write_record`, `writeLog`, `writeOrder`) match nowhere
  (`scripts/tutor-signals-shapes.test.mjs:257-301`), and the edge-key union over every graph-bearing
  record under `research/raw/` carries no order-ish key at all
  (`research/raw/m057-record-shapes.json:554-566`, re-derived at
  `scripts/tutor-signals-shapes.test.mjs:302-352`), so the ordering is a named absence and not a
  capture this milestone could add (`:353-361`).
- ✅ The second negative is the refutation that retargeted the plan (C8), recorded as a measurement
  that does not hold rather than as a quiet rewrite: `effectNodeInARecord` carries the plan's premise
  verbatim, `holds: false`, 16 objects with `kind: "effect"` across six records and 10 of them inside
  a `nodes` array (`research/raw/m057-record-shapes.json:567-583`, the per-node table at `:584-696`),
  exactly one record holds an effect node in the recorded shape —
  `m039-render-phase.json/effect/freshRead`, 6 nodes all with `index`, the effect at index 5 with the
  empty label, one consumer edge 5 → 2 (`:706-717`, the detail at `:718-735`) — and the existing join
  is run in a bare `node:vm` context over that record, its answer recorded field for field
  (`:736-763`, re-run at `scripts/tutor-signals-shapes.test.mjs:504-539`). What no record carries
  instead is named: an `index` in the serializer's own output
  (`research/raw/m057-record-shapes.json:764-767`), and the three refuted premises are stated as
  refuted with premise and measured value (`:770-785`, held by
  `scripts/tutor-signals-shapes.test.mjs:430-477` and `:549-561`).
- ✅ Nothing was built: `builtNothing.built` is empty and the description says so
  (`research/raw/m057-record-shapes.json:806-809`), held by the suite
  (`scripts/tutor-signals-shapes.test.mjs:562-568`), and the landing verify is recorded in
  `.project/build/verify-T001.log`.
- ⚠ Declared limit, not a defect: the recording's `base` is the plan baseline `e5feffb8`
  (`research/raw/m057-record-shapes.json:5`) — the head T001 measured at, not this reviewed head. The
  suite resolves every citation at the head it runs on, so a later wave that moves a cited line
  reddens T001's suite and owns the repair; T009 does exactly that for the two counted values the
  later waves staled (58 files, 142 JSON files), reviewed in wave 5.

## Intent coverage

### SC1 — An answer for a signals question names the effect node the record carries by the label the graph gives it and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its position in the node array, or omits a producer an edge records, reddens the same criterion.: pass

- ✅ Covered by T001: the fields an answer may name are the recording's own declared map — `index`,
  `kind`, `label` per node and the two ends per edge, each with the citation whose line states it
  (`research/raw/m057-record-shapes.json:9-13`, held as a set by
  `scripts/tutor-signals-shapes.test.mjs:118-145`), so a wave that names a field the recording does
  not declare reddens here rather than in a later wave. The one record that carries those fields for
  an effect node is measured, named and counted
  (`research/raw/m057-record-shapes.json:706-735`), and the join that will read it is proved to
  answer from it without authoring anything (`:736-763`). Nothing downstream names a field the
  recording does not declare: T002's `READS` and `IGNORED` are held to this recording's map at
  `scripts/tutor-signals.test.mjs:1100-1119` (reviewed in wave 2).
- ✅ The static read declares what it did not do — no page opened, no build run, no browser started —
  so the recording cannot be mistaken for a live capture
  (`research/raw/m057-record-shapes.json:6`).

### SC2 — Where the record carries no ordering between a write and the render, the answer states that ordering as a named absence — no write record, no order — beside the effect and its upstream nodes, and names no write, no owner and no cause; a mutant that renders the absence as causation (the write, then the render), a mutant that reads an order out of an edge's direction, and a mutant that renders a write the record does not carry each redden.: pass

- ✅ Covered by T001: the negative measurement that decides the design is stated and pinned, not
  asserted — no write record exists anywhere in `extension/` with every match quoted and none of them
  a record of a write (`research/raw/m057-record-shapes.json:506-553`), no edge carries a field to
  order a write in (`:554-566`), and the conclusion names the absence as the answer's vocabulary:
  "the ordering is a named absence and not a capture this milestone could add"
  (`research/raw/m057-record-shapes.json:565`, held at
  `scripts/tutor-signals-shapes.test.mjs:353-361`). Both halves are re-derived over the tree on every
  suite run (`scripts/tutor-signals-shapes.test.mjs:257-352`), so a write record that appears later
  reddens the measurement instead of silently curing the absence.
