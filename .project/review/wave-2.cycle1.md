# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: beb69b97acad146fcb96bcc1cf6e0b7bb2e9b481

## T002 — Answer from the two records, purely: pass

- ✅ The join is one pure function over the two records, and every field it renders is read from them:
  `tutorSignals(records)` returns the eight fields in every state
  (`extension/tutor-signals.js:486-497`), the effect is `{ label, index, namedBy }` built from the
  node's own fields (`:387-393`), the label is spelled as the graph spells it with the empty string a
  spelling and not a missing value (`:224-229`), and the reads are the producer ends of the effect's
  consumer edges in the order the edges appear — no sort, no set, no de-duplication
  (`:395-416`), with an unplaceable producer named in `unplaced` rather than read (`:408-412`).
  Every claim carries the artefact path and line that states it, taken as arguments and never
  composed (`:432-441`, the claim assembly at `:453-482`); the graph-side claims cite the record's own
  `path` and `line` and the entry-side claims cite `extension/render-phase.js:18` and `:336`
  (`:176-178`).
- ✅ The ordering is the named absence in exactly one construction site, so no branch can vary it:
  `ORDERING_ABSENCE = 'no-write-record-no-order'` (`extension/tutor-signals.js:153`) flows through
  `orderingState()` (`:445-447`) into every answer (`:493`), and the suite pins the count of that
  construction to one (`scripts/tutor-signals.test.mjs:507-511`). The absence is not a finding: no
  field of the answer carries a write, an owner or a cause — the pin answers five states and refuses
  the words `preceded`, `owner` and `cause` anywhere beside the effect
  (`scripts/tutor-signals.test.mjs:442-503`).
- ✅ The load-bearing mutants exist and redden naming their defects, each against a pin that is green
  on the unmutated bytes first (`scripts/tutor-signals.test.mjs:1430-1441`): the battery carries 13
  defects (`:1214-1383`), among them an answer with no artefact path (`:1215-1222`), the effect named
  by its position in the nodes array (`:1224-1233`, the fixture putting the effect at index 5 in the
  fourth slot so a position-based answer renders 3 where the record states 5), a producer an edge
  records that the answer omits (`:1235-1244`), an index past the graph's last node rendered as a
  node (`:1246-1258`), an unplaceable producer dropped (`:1260-1267`), the absence rendered as
  causation (`:1269-1277`), an order read out of an edge's direction (`:1279-1287`), a write the
  record does not carry (`:1289-1297`), the three absences folded into one blank answer
  (`:1299-1312`), an unreadable graph reported as a page with no effects (`:1314-1333`), an answer
  that changes when the fact gains a field the reader ignores (`:1335-1343`), a second answer that
  differs from the first (`:1345-1358`), and the recorded change-detection message joined into the
  effect finding as its cause (`:1360-1381`). Every one reddens its pin with a message matching its
  defect (`scripts/tutor-signals.test.mjs:1442-1454`).
- ✅ Purity is proved, not promised: the join runs in a bare `node:vm` context with nothing in it
  (`scripts/tutor-signals.test.mjs:141-152`), the module's bytes are scanned for every reach a pure
  join must not have — no import, no filesystem, no clock, no page global, and no namespace of
  another join (`:1059-1084`) — the join spells no record path at all, so the graph record's path is
  read from the record and never composed (`:1088-1092`), and the fields it reads and ignores are
  held to T001's recording rather than restated (`:1100-1119`).
- ✅ Held-out E7 and E8 are owned: E7 — an edge is `{ consumer, producer }` and nothing else, so a
  write is not representable in one and no causal claim can be read from a direction — is the
  ordering pin above plus the two direction-and-causation mutants
  (`scripts/tutor-signals.test.mjs:1269-1287`); E8 — the effect finding and a recorded
  change-detection message stay two findings in the recorded order, the message a claim of its own
  after the effect, never joined — is pinned with the message claim's position after the effect
  claim, its three values and no fourth field, and its own artefact citation
  (`scripts/tutor-signals.test.mjs:520-581`), with the join-into-cause mutant reddening
  (`:1360-1381`).
- ✅ The real-record leg answers over a record on disk with the honest reading of the index it lacks
  (PLAN C8): `research/raw/m039-render-phase.json`'s `/effect/fromRecording` carries `kind` and
  `label` on every node and no `index` anywhere, measured in the suite before it is answered
  (`scripts/tutor-signals.test.mjs:945-966`), and the join answers `answered` with the effect's empty
  label, `index: null`, the reference named in `unplaced` as `{ end: 'effect', value: '' }` and no
  read claimed — refusing both the position (5) and the serializer's `id` (`"6"`) as an index, pinned
  by the refusal of `"index":5` in the rendered answer (`:968-1023`). The header states why this leg
  does not read the graph T003 pins (`scripts/tutor-signals.test.mjs:29-36`).
- ✅ Observed at the reviewed head: the suite's own census output reports the answered fixture —
  `effect label "" at index 5 in the fourth slot of a 4-node fixture, 3 reads in edge order (title,
  count, count), 3 claims` (`scripts/tutor-signals.test.mjs:1154-1156`), the ordering on every state
  (`:1173-1175`), and the three absence sentences distinct (`:1475-1477`). The landing verify is
  recorded in `.project/build/verify-T002.log`.

## Intent coverage

### SC1 — An answer for a signals question names the effect node the record carries by the label the graph gives it and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its position in the node array, or omits a producer an edge records, reddens the same criterion.: pass

- ✅ Covered by T002: the effect is named from the node's own `label` and `index` fields
  (`extension/tutor-signals.js:387-393`), the reads from the edges' own producer ends in edge order
  (`:401-416`), and every claim carries the artefact path handed to the claim builder, which takes
  the path as an argument so no claim can be built without one
  (`scripts/tutor-signals.test.mjs:363-367`, the no-artefact-path mutant at `:1215-1222`). The
  position mutant and the omitted-producer mutant redden the same criterion's pin
  (`scripts/tutor-signals.test.mjs:1224-1244`), and the read order is held to the edge order
  including a repeated producer (`:386-399`).

### SC2 — Where the record carries no ordering between a write and the render, the answer states that ordering as a named absence — no write record, no order — beside the effect and its upstream nodes, and names no write, no owner and no cause; a mutant that renders the absence as causation (the write, then the render), a mutant that reads an order out of an edge's direction, and a mutant that renders a write the record does not carry each redden.: pass

- ✅ Covered by T002: the ordering is `{ state: 'absent', absence: 'no-write-record-no-order' }` on
  every answer including the three absences, built in one place
  (`extension/tutor-signals.js:445-449`, `:493`), the answer carries the contract's eight fields and
  nothing else so no write field can be smuggled in
  (`scripts/tutor-signals.test.mjs:467-471`, the write-recorded mutant at `:1289-1297`), and the
  causation, edge-direction and message-joined mutants each redden naming their defect
  (`scripts/tutor-signals.test.mjs:1269-1287`, `:1360-1381`).

### SC3 — A page whose signal graph the agent could not read reports cannot-tell naming the graph and nothing else — no effect, no label, no read (`extension/render-phase.js:310-312`) — and the absences stay distinct: a page whose record carries no render/effect entry, and a readable graph that holds no effect node (`extension/render-phase.js:317-319`), each report their own named absence; a mutant that reports an unreadable graph as a page with no effects, and a mutant that folds the three absences into one blank or empty answer, redden.: pass

- ✅ Covered by T002: the three absences are decided in the contract's order — the graph record, then
  the entry, then the effect node — each answering before the next is asked
  (`extension/tutor-signals.js:589-635`), each with its own sentence naming which absence holds
  (`:541-584`), held by seven cases with distinct states and distinct sentences
  (`scripts/tutor-signals.test.mjs:691-809`), an unreadable graph never described as a graph with no
  effects and rendering the ordering claim and no graph claim (`:789-802`), and the fold and
  unreadable-as-no-effects mutants each reddening
  (`scripts/tutor-signals.test.mjs:1299-1333`).

### SC4 — No claim cites a node the record does not contain: every node index the answer renders is one the recorded graph's own `nodes` array carries, and a producer end or effect reference the graph cannot place is named as unplaced rather than numbered, dropped or resolved to the nearest node; a mutant that renders an index past the graph's last node, and a mutant that drops a producer the graph does not carry, redden.: pass

- ✅ Covered by T002: every read index is held to the graph's own `nodes` array
  (`scripts/tutor-signals.test.mjs:606-614`), a producer end past the last index contributes no read
  and is named in `unplaced` by end and value (`:627-683`), an effect reference the graph cannot
  place is named unplaced rather than numbered (`:640-669`), a producer end on an edge the graph does
  not record is never read from a node the graph merely happens to hold (`:671-683`), and the
  render-as-node and dropped mutants redden (`scripts/tutor-signals.test.mjs:1246-1267`).

### SC5 — The answer is produced from the two records the agent already captures — the serialized graph (`extension/agent-main.js:912`, carried per check at `:1070`) and the render/effect join (`extension/render-phase.js:304`) — with no new page-side instrumentation, no second profiler tap (`.project/ROADMAP.md:1085`), and nothing the record does not hold: no DOM, no clock, no console, no page global (`extension/render-phase.js:21-26`), and no field the reader ignores (`extension/render-phase.js:33-35`); a mutant that reads a live page value, starts its own profiler tap, or answers from a field the record does not carry reddens.: pass

- ✅ Covered by T002: the join takes the two records and nothing else — anything else on `records` is
  ignored (`extension/tutor-signals.js:586-591`) — runs in a bare vm context with no page global in
  it (`scripts/tutor-signals.test.mjs:141-152`), holds no reach a page, a clock or a network would
  need (`:1059-1084`), and reads no field the recording declares ignored: a fact carrying `id`,
  `epoch`, `value`, `debuggableFn` or a cause changes nothing the answer reports, and the byte scan
  refuses `node.<field>` and `.cause` in the module
  (`scripts/tutor-signals.test.mjs:816-855`, the ignored-field-read mutant at `:1335-1343`). The
  second answer over the same records is byte-identical
  (`scripts/tutor-signals.test.mjs:862-877`).
