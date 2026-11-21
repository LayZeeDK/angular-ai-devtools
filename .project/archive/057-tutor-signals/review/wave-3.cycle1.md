# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: cdb0b18d30fe059a4a1484ec9fbf295c7fe841e1

## T003 — Read the graph record the answer comes from: pass

- ✅ The task performs the read C8 retargeted it to, and the record it reads is stated and pinned, not
  assumed: the suite opens `research/raw/m039-render-phase.json`'s `/effect/freshRead`
  (`scripts/tutor-signals-graph.test.mjs:60-68`), re-resolves the line the record states its graph at
  by reading the file for the one line whose trimmed text is `"freshRead": {` rather than trusting a
  typed number (`:216-221`), and holds the indexed shape to the record's own bytes — six nodes, every
  one carrying a finite numeric `index` in the order 0–5 (`:248-264`); six `allEdges`, every one with
  numeric `consumer`/`producer` ends (`:266-277`); exactly one node of kind `effect`, at index 5,
  with the empty label as a recorded shape (`:279-315`); and its one consumer edge reaching producer
  index 2, the node the graph labels `count` (`:317-355`). A re-derivation of the record reddens here
  rather than in a later wave.
- ✅ The shipped join answers from that record, and the answer is the record's own: `pinAnswerFromRecord`
  hands the join the record's own `nodes` and `allEdges` under the record's path and the line the
  record states (`scripts/tutor-signals-graph.test.mjs:466-550`) and holds the answer to
  `effect { label: '', index: 5, namedBy: 'recorded-edge' }`, one read `{ index: 2, label: 'count' }`,
  `unplaced []`, the ordering absence `no-write-record-no-order`, three claims (`effect`, `read`,
  `ordering`), and a detail that names `research/raw/m039-render-phase.json:399`. The empty label is
  reached by the same read as a labelled one — naming the effect by `label: ''` places the same node
  at the same index with the same read (`:529-544`) — and a second answer over the same records is
  byte-identical (`:545-549`). The index is the node's own, never its position: the pin hands the
  join the record's own six nodes reversed, the effect now at position 0, and the answer still names
  index 5 and reads index 2 (`:633-660`).
- ✅ The capture leg is deleted, and the deletion is enforced rather than narrated: no capture was
  taken because `serializeGraph` writes `id: String(n.id)` (`extension/agent-main.js:958`, pinned by
  T002's suite and cited in this suite's header, `scripts/tutor-signals-graph.test.mjs:8-11`) and
  resolves each edge end to a node id, so a fresh capture reproduces the missing-`index` defect
  instead of curing it, and every field the answer reads is one the record already holds. The suite
  proves the leg is gone three ways: its own import list names node builtins only
  (`scripts/tutor-signals-graph.test.mjs:663-678`), its bytes hold no capture token — no child
  process, no browser driver, no fetch (`:679-686`), and the record a capture would have written,
  `research/raw/m057-signal-graph.json`, exists nowhere under `research/raw/` (`:688-692`). The
  landing diff matches the read: `git show cdb0b18d --stat` touches only the task file and
  `scripts/tutor-signals-graph.test.mjs`.
- ✅ The record's provenance is the capture block's own statement, and the suite invents nothing into
  it: the block's keys are held as a set — command, route, page, element, component, build, instance,
  time — with the record's own values pinned
  (`scripts/tutor-signals-graph.test.mjs:362-458`), `head` is asserted absent from the block and none
  is claimed (`:382-386`), and the graph's own `url`, `element` and `component` are held to the
  block's (`:442-457`). Every claim the answer renders carries the record's own path and the
  re-resolved graph line, and no provenance field the record does not carry — no head, no route, no
  clock — is invented beside them (`:557-625`).
- ✅ The three defects the task names are applied to T002's join in memory and each reddens the pin
  that names it, green on the unmutated join first: the effect named by its position
  (`scripts/tutor-signals-graph.test.mjs:855-865`), a portal read claimed that this task did not
  take — the mutant injecting `route: '/home'`, a page URL and `Resource.loadEffect` into the claims
  (`:867-888`), and a provenance field invented on every claim in the shape of a `head`
  (`:890-903`); the failures name their defects (`:950-976`).
- ✅ No page was opened, and the portal's shape is named rather than claimed: the answer renders none
  of `Resource.loadEffect`, `Resource.extRequest`, `localhost`, `http://` or `/home`
  (`scripts/tutor-signals-graph.test.mjs:701-737`), the record's labels are asserted not to include
  the labelled effect (`:739-745`), the suite names `Resource.loadEffect` in its own words as the
  shape a portal read would offer in place of this record's empty-label effect, citing
  `extension/render-phase.js:13-16` re-resolved at this head (`:746-772`), and the landing verify is
  recorded in `.project/build/verify-T003.log`.

## Intent coverage

### SC1 — An answer for a signals question names the effect node the record carries by the label the graph gives it and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its position in the node array, or omits a producer an edge records, reddens the same criterion.: pass

- ✅ Covered by T003: the answer SC1 asks for is proved from the record rather than assumed — the
  effect at index 5 by the empty label the graph spells, the upstream node at index 2 by the label
  the graph gives it, every claim citing `research/raw/m039-render-phase.json:399` with the line
  re-read from the record's bytes
  (`scripts/tutor-signals-graph.test.mjs:466-550`, `:557-625`), and the position mutant reddening
  with the record's own nodes reordered (`:633-660`, `:855-865`, `:950-976`).

### SC5 — The answer is produced from the two records the agent already captures — the serialized graph (`extension/agent-main.js:912`, carried per check at `:1070`) and the render/effect join (`extension/render-phase.js:304`) — with no new page-side instrumentation, no second profiler tap (`.project/ROADMAP.md:1085`), and nothing the record does not hold: no DOM, no clock, no console, no page global (`extension/render-phase.js:21-26`), and no field the reader ignores (`extension/render-phase.js:33-35`); a mutant that reads a live page value, starts its own profiler tap, or answers from a field the record does not carry reddens.: pass

- ✅ Covered by T003: the task takes no live read at all — no page opened, no profiler tap, no
  `serializeGraph` call, the would-be capture record asserted absent from `research/raw/`
  (`scripts/tutor-signals-graph.test.mjs:663-692`), the join run in a bare vm context whose page
  globals are all `undefined` (`:824-839`), and the portal-read mutant — the one way this task could
  claim a read it did not take — reddening naming it (`:867-888`, `:950-976`). The provenance the
  answer cites is the record's own capture block, pinned rather than restated, with `head` absent
  (`:362-458`).
