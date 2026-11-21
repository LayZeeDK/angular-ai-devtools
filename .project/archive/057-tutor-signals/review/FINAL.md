# Final Review — M057 tutor-signals

Reviewed HEAD: 613ac83dd4d7be85e98fe45550188799f1bb1e2b

Overall verdict: pass

## What this milestone set out to do

The panel answers why a signal-driven template re-rendered, or failed to, by naming the effect node
the recorded signal graph carries, the label the graph gives it and the upstream nodes its edges
state — or by stating a named absence — so the answer names what the evidence supports rather than a
plausible rule. The panel is the only surface: nothing is asked of the inspected page.

The roadmap's premise that the agent already captures a write record was measured against
`extension/` and does not hold (INTENT C1, measured in `research/raw/m057-record-shapes.json:506-566`),
so the criteria this milestone ships are the question the evidence supports: an answer read from the
serialized graph and the render/effect join alone, or a named absence. The roadmap's second premise —
that no record under `research/raw/` carries an effect node in the indexed shape — was refuted by the
same measurement (INTENT C8): 16 objects carry `kind: "effect"` across six records, 10 of them inside
a `nodes` array, and exactly one record holds an effect node in the recorded shape,
`research/raw/m039-render-phase.json`'s `/effect/freshRead`, which T003 reads. `serializeGraph`
writes `id: String(n.id)` and resolves each edge end to a node id, never an `index`
(`research/raw/m057-record-shapes.json:764-767`), which is why the graph is read from a record that
holds one rather than captured anew.

## Tasks and waves

| wave | task | last landing | what it established |
|---|---|---|---|
| 1 | T001 | `05c2f022` | measured the two records' field maps and the one ABSENCE (no write record, no order), then refuted the plan's own premise (C8) |
| 2 | T002 | `beb69b97` | `extension/tutor-signals.js`: one pure join answering `answered` plus three named absences, the ordering absence built at one site, thirteen named mutants |
| 3 | T003 | `cdb0b18d` | the graph record the answer comes from, read and pinned; the capture leg deleted because the serializer writes `id`, never `index` |
| 4 | T004 | `1bfa7ef6` | the panel pane and the `tutor-signals` route, loader key and sample fact held field-for-field to the shipped join |
| 4 | T005 | `2eedd685` | the route table and loader map pins, with both mutants carried in the file |
| 5 | T006 | `7f003333` | both record inventories read this milestone's map beside M055's, by one code path |
| 5 | T007 | `1426a081` | the surface record and the copy re-measure: 195 to 201 sentences, a 193-row digest |
| 5 | T008 | `53c6a77a` | the gate's oracle record re-derived, idempotent |
| 5 | T009 | `cbca600c` | the two gate tests re-pointed at a derived unshipped predecessor, the stability record and the verdict claims re-derived, the project verify last |
| 5 | T010 | `5a57cd21` | the stability record re-captured at the shipping head, armed, idempotent, no value typed by hand |

Each row's landing is the last commit on this branch whose subject names that task, since four tasks
landed more than one commit through the milestone's patch cycles.

## Success criteria

### SC1 — An answer for a signals question names the effect node the record carries by the label the graph gives it and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its position in the node array, or omits a producer an edge records, reddens the same criterion.

- **Surface**: panel
- **Check**: `npm run check && npm test` at the reviewed head — recorded pass in `.project/build/verify-ledger.jsonl` at `613ac83dd4d7be85e98fe45550188799f1bb1e2b` — which carries `scripts/tutor-signals.test.mjs` and `scripts/tutor-signals-graph.test.mjs`; the pane walked through the shipped route per the PLAN Surface contract walkthrough below, as reviewed in `.project/review/wave-4.cycle1.md`
- **Observed**: pass. The answer names the effect node the record carries by the label the graph gives it and by its own `index`: the empty label prints as an `effect.label:` line directly above `effect.index: 5`, and the index is the node's own, never its array position — the pin hands the join the record's six nodes reversed, the effect now at position 0, and the answer still names index 5 (`extension/tutor-signals.js:387-393`; `scripts/tutor-signals-graph.test.mjs:633-660`). The upstream node the graph's one edge states is named by that node's own `index` 2 and the label the graph gives it, `count`, and every field is read from the record's own `nodes` and `allEdges` in edge order, with no sort and no de-duplication (`extension/tutor-signals.js:395-416`). Each claim carries the artefact path of the record that states it — three claims, each citing `research/raw/m039-render-phase.json:399` and `extension/render-phase.js:18`, taken as arguments so no claim can be built without one (`research/raw/m057-surface.json:10-15`; `scripts/tutor-signals.test.mjs:363-367`). The criterion's three mutants redden by name against a pin green on the unmutated bytes first: an answer with no artefact path, the effect named by its position in the node array (the fixture puts the effect at index 5 in the fourth slot, so a position-based answer renders 3 where the record states 5), and a producer an edge records that the answer omits (`scripts/tutor-signals.test.mjs:1215-1244`, `:1442-1454`). E1, E2, E6 and E10 render through the same read: the empty and the labelled effect take one path with no branch on the label, an index mints no identity, the portal-versus-fixture rule names the route and the artefact, and a second answer is byte-identical (`extension/tutor-signals.js:224-229`; `scripts/tutor-signals.test.mjs:520-581`, `:862-877`; `research/raw/m057-surface.json:331`).
- **Reference**: `.project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `research/raw/m057-surface.json:10-15,26-51,331` (the surface record's own measurement); `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-4.cycle1.md`, `wave-5.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC2 — Where the record carries no ordering between a write and the render, the answer states that ordering as a named absence — no write record, no order — beside the effect and its upstream nodes, and names no write, no owner and no cause; a mutant that renders the absence as causation (the write, then the render), a mutant that reads an order out of an edge's direction, and a mutant that renders a write the record does not carry each redden.

- **Surface**: panel
- **Check**: `npm run check && npm test` at the reviewed head — recorded pass in `.project/build/verify-ledger.jsonl` at `613ac83dd4d7be85e98fe45550188799f1bb1e2b` — which carries `scripts/tutor-signals.test.mjs` (the suite PLAN.md's Held-out checks table assigns E7 and E8 to) and `scripts/tutor-signals-graph.test.mjs`
- **Observed**: pass. The ordering is the named absence `no-write-record-no-order`, built at exactly one construction site and flowed into every answer including the three absences, and the answer carries the contract's fields and nothing else, so no write, no owner and no cause can be smuggled in (`extension/tutor-signals.js:153`, `:445-449`, `:493`; `scripts/tutor-signals.test.mjs:467-471`, `:507-511`). E7 holds — an edge is `{ consumer, producer }` and nothing else, so a write is not representable in one and no causal claim can be read out of a direction: no edge in the record carries a field to order a write in, re-derived over the tree on every run, and the causation and edge-direction mutants each redden naming their defect (`research/raw/m057-record-shapes.json:554-566`; `scripts/tutor-signals.test.mjs:1269-1287`, `:353-361`). E8 holds — the effect finding and a recorded change-detection message stay two findings in the recorded order, the message a claim of its own after the effect with its three values, no fourth field and its own citation, so the second is never read as the first one's cause; the join-into-cause mutant reddens (`scripts/tutor-signals.test.mjs:520-581`, `:1360-1381`). The write-recorded mutant — an answer carrying a write the record does not hold — reddens, and the pin refuses the words `preceded`, `owner` and `cause` anywhere beside the effect (`scripts/tutor-signals.test.mjs:442-503`, `:1289-1297`). The absence is the answer at the head that ships, not a cure deferred to a capture: the write-record scan over `extension/` finds no write record at all — 58 files scanned, the four hard needles matching nowhere, and each of the five `writes:` matches a sanitizer binding's documented field, a test title or a `matchDirectWrites:` identifier — re-derived on every suite run (`research/raw/m057-record-shapes.json:506-566`; `scripts/tutor-signals.test.mjs:257-352`).
- **Reference**: `.project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `research/raw/m057-record-shapes.json:506-566` (the absence, measured); `research/raw/m057-verdict-claims.json:6-7,29-35,46-51` (SC2's held-out edges assigned to `scripts/tutor-signals.test.mjs`); `research/raw/m057-surface.json:331,715-753`; `.project/review/wave-2.cycle1.md`, `wave-5.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC3 — A page whose signal graph the agent could not read reports cannot-tell naming the graph and nothing else — no effect, no label, no read (`extension/render-phase.js:310-312`) — and the absences stay distinct: a page whose record carries no render/effect entry, and a readable graph that holds no effect node (`extension/render-phase.js:317-319`), each report their own named absence; a mutant that reports an unreadable graph as a page with no effects, and a mutant that folds the three absences into one blank or empty answer, redden.

- **Surface**: panel
- **Check**: `npm run check && npm test` at the reviewed head — recorded pass in `.project/build/verify-ledger.jsonl` at `613ac83dd4d7be85e98fe45550188799f1bb1e2b` — which carries `scripts/tutor-signals.test.mjs` and the app suite that drives the pane's states, `panel-demo.spec.ts`; the three absences walked through the shipped pane per the PLAN Surface contract walkthrough below, as reviewed in `.project/review/wave-4.cycle1.md`
- **Observed**: pass. An unreadable graph reports cannot-tell naming the graph and nothing else — no effect, no label and no read beside it, never a page with no effects and never an empty finding — and the three absences are decided in the contract's stated order, the graph record then the entry then the effect node, each answering before the next is asked (`extension/render-phase.js:310-312`, `:317-319`; `extension/tutor-signals.js:541-584`, `:589-635`). Each renders in its own registered sentence: the pane's sentences are enumerated once and every other line is a field of the answer under its own path, held to those two tables by the spec, so a fold cannot be written without reddening (`apps/angular-ai-devtools/src/app/panel-tutor-signals.ts:132-148`, `:173-204`; `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5921-5933`). Seven cases hold distinct states and distinct sentences, with both criterion mutants reddening: an unreadable graph reported as a page with no effects, and the three absences folded into one blank answer (`scripts/tutor-signals.test.mjs:691-809`, `:1299-1333`); the walkthrough's steps 3 to 5 drive the same three states through the join with the real record (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5935-5967`). The fourth state, an answer nobody handed over, is the pane's own named absence and not a synonym for any of the three (`apps/angular-ai-devtools/src/app/panel-tutor-signals.ts:199-203`).
- **Reference**: `.project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `scripts/tutor-signals.test.mjs:691-809` (the seven absence cases); `research/raw/m057-surface.json:331` (each state with the answer field it reads); `.project/review/wave-2.cycle1.md`, `wave-4.cycle1.md`, `wave-5.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC4 — No claim cites a node the record does not contain: every node index the answer renders is one the recorded graph's own `nodes` array carries, and a producer end or effect reference the graph cannot place is named as unplaced rather than numbered, dropped or resolved to the nearest node; a mutant that renders an index past the graph's last node, and a mutant that drops a producer the graph does not carry, redden.

- **Surface**: panel
- **Check**: `npm run check && npm test` at the reviewed head — recorded pass in `.project/build/verify-ledger.jsonl` at `613ac83dd4d7be85e98fe45550188799f1bb1e2b` — which carries `scripts/tutor-signals.test.mjs` and `scripts/tutor-signals-graph.test.mjs`
- **Observed**: pass. Every read index is held to the recorded graph's own `nodes` array, and a producer end past the graph's last index contributes no read and is named in `unplaced` by end and value rather than numbered — never rendered as a node and never silently dropped (`scripts/tutor-signals.test.mjs:606-683`). An effect reference the graph cannot place is named unplaced rather than numbered, and a producer end on an edge the graph does not record is never read from a node the graph merely happens to hold (`:640-683`). The two criterion mutants redden: an index past the graph's last node rendered as a node, and a producer the graph does not carry dropped instead of named (`:1246-1267`). The real-record leg answers the honest reading of an index the record lacks — `research/raw/m039-render-phase.json`'s `/effect/fromRecording` carries `kind` and `label` on every node and no `index` anywhere, measured in the suite before it is answered, so the answer names the reference in `unplaced` and claims no read, refusing both the array position and the serializer's `id` as an index (`scripts/tutor-signals.test.mjs:945-1023`).
- **Reference**: `.project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `scripts/tutor-signals.test.mjs:606-683` (every index held to the graph's own nodes); `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-5.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

### SC5 — The answer is produced from the two records the agent already captures — the serialized graph (`extension/agent-main.js:912`, carried per check at `:1070`) and the render/effect join (`extension/render-phase.js:304`) — with no new page-side instrumentation, no second profiler tap (`.project/ROADMAP.md:1085`), and nothing the record does not hold: no DOM, no clock, no console, no page global (`extension/render-phase.js:21-26`), and no field the reader ignores (`extension/render-phase.js:33-35`); a mutant that reads a live page value, starts its own profiler tap, or answers from a field the record does not carry reddens.

- **Surface**: panel
- **Check**: `npm run check && npm test` at the reviewed head — recorded pass in `.project/build/verify-ledger.jsonl` at `613ac83dd4d7be85e98fe45550188799f1bb1e2b` — which carries `scripts/tutor-signals.test.mjs`, `scripts/tutor-signals-graph.test.mjs` and the two record inventories' suites
- **Observed**: pass. The answer is produced from the two records the agent already captures: the join takes the graph record and the render/effect entry and ignores anything else handed to it, runs in a bare `node:vm` context with no page global in it, and its bytes hold no reach a page, a clock or a network would need (`extension/tutor-signals.js:586-591`; `scripts/tutor-signals.test.mjs:141-152`, `:1059-1084`). It reads no field the reader ignores — a fact carrying `id`, `epoch`, `value`, `debuggableFn` or a cause changes nothing the answer reports, and the byte scan refuses `node.<field>` and `.cause` in the module (`scripts/tutor-signals.test.mjs:816-855`; the ignored-field-read mutant reddening at `:1335-1343`). No instrumentation was added and none was taken: T003's leg is deleted and enforced rather than narrated — no child process, no browser driver, no fetch in the suite's bytes, and the record a capture would have written exists nowhere under `research/raw/` — because `serializeGraph` writes `id`, never `index`, so a fresh capture would reproduce the missing-index defect instead of curing it (`scripts/tutor-signals-graph.test.mjs:679-692`; `research/raw/m057-record-shapes.json:764-767`). The one record re-captured at this head is the gate's own stability record, re-derived through the command its suite names and idempotent on a second armed run, not a page-side read (`research/raw/m056-gate-stability.json:30-33,87`; `.project/build/verify-T010.log`).
- **Reference**: `.project/build/verify-ledger.jsonl` — project verify pass at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`; `research/raw/m057-record-shapes.json:9-13,764-767` (the two records, and the field the serializer does not write); `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`, `wave-5.cycle1.md`
- **Verdict**: met
- **Finding**: none
- **Fix direction**: none

## Surface contract walkthrough — panel (PLAN.md `## Surface contract`)

Performed through the shipped pane (`apps/angular-ai-devtools/src/app/panel-tutor-signals.ts`) and the
shipped join (`extension/tutor-signals.js`) over the record T003 pins —
`research/raw/m039-render-phase.json`'s `/effect/freshRead` — with the demo fact the route serves held
field-for-field to the join's own answer by `panel-demo.spec.ts` inside the passing project verify
(`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5700-5777`, `:5856-5857`). The plumbing of the
walkthrough is recorded in `.project/review/wave-4.cycle1.md`:

1. **The demo question**, opened at route `tutor-signals`: the surface names the effect node by the
   label the graph gives it — the empty label, printed as an empty `effect.label:` line directly above
   `effect.index: 5` — then the upstream node its one edge states (index 2, the node the graph labels
   `count`), then the sentence that says the record carries no ordering; the label is never minted
   from the index, a position, a call site or a source string (SC1, E1, E2).
2. **The absence beside the effect**: the surface states `no-write-record-no-order` as its own named
   absence and names no write, no owner and no cause anywhere in the answer (SC2, E7, E8).
3. **The graph taken away from the fact**: `graph-unreadable` in its own sentence, with no effect, no
   label and no read beside it, never as a page with no effects (SC3, E3).
4. **A graph and no render/effect entry**: `no-render-entry`, distinct from the graph absence and from
   the empty-effect absence (SC3, E4).
5. **A readable graph holding no node of kind `effect`**: `no-effect-node`, the third absence, in its
   own sentence; and the reference no node can place named under `unplaced` by end and value
   (SC3, SC4, E4, E5).

## Project verify

- **Command**: `npx nx run ai-devtools-companion:build --skip-nx-cache && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html`
- **Result**: pass (exit 0) at the reviewed commit, run in the verify sidecar by
  `workflow_run.py prepare-final` (`build_state.py verify-landed` green first, `lean_verification.py`
  after it).
- **Recorded at**: `613ac83dd4d7be85e98fe45550188799f1bb1e2b` in
  `.project/build/verify-ledger.jsonl` — `result: pass`, `recorded_at: 2026-11-21T10:14:04+00:00`,
  exact stdout and stderr in the entry; `.project/review/final-gap-1.md` is that entry's own rendered
  view, `Gap verdict: pass`, generated at this head.

## Ship gate

- **Command**: `npm run gate:verification:ship`
- **Result** (verbatim — the receipt's findings as the gate prints them):

```
  [OK  ] check-loads:di-doctor
  [OK  ] check-tested:di-doctor: tests 6, pass 6, fail 0
  [OK  ] check-loads:error-explainer
  [OK  ] check-tested:error-explainer: tests 6, pass 6, fail 0
  [OK  ] check-loads:extension-panel
  [OK  ] check-tested:extension-panel: tests 6, pass 6, fail 0
  [OK  ] check-loads:interop
  [OK  ] check-tested:interop: tests 10, pass 10, fail 0
  [OK  ] check-loads:model-init
  [OK  ] check-tested:model-init: tests 6, pass 6, fail 0
  [OK  ] check-loads:signal-provenance
  [OK  ] check-tested:signal-provenance: tests 6, pass 6, fail 0
  [OK  ] check-loads:stale-view
  [OK  ] check-tested:stale-view: tests 6, pass 6, fail 0
  [OK  ] check-loads:state
  [OK  ] check-tested:state: tests 12, pass 12, fail 0
  [OK  ] check-loads:attached
  [OK  ] check-tested:attached: tests 4, pass 4, fail 0
  [OK  ] check-loads:coexist
  [OK  ] check-tested:coexist: tests 6, pass 6, fail 0
  [OK  ] check-loads:extension-enabled
  [OK  ] check-tested:extension-enabled: tests 7, pass 7, fail 0
  [OK  ] check-loads:live-reads
  [OK  ] check-tested:live-reads: tests 10, pass 10, fail 0
  [OK  ] check-loads:read-only
  [OK  ] check-tested:read-only: tests 6, pass 6, fail 0
  [OK  ] check-loads:setup
  [OK  ] check-tested:setup: tests 8, pass 8, fail 0
  [OK  ] contract:control-ai-browsers: contract checks pass
  [OK  ] contract:control-angular-dev-app: contract checks pass
  [OK  ] contract:control-angular-devtools: contract checks pass
  [OK  ] contract:control-pangular-inspector: contract checks pass
  [OK  ] contract:control-vitest-browser-angular: contract checks pass
  [OK  ] scripts-in-step: 3 copies in step
  [OK  ] verdict:di-doctor: newest is verified at 2026-11-07T22:04:27.489Z
  [OK  ] verdict:error-explainer: newest is verified at 2026-11-07T22:08:54.908Z
  [OK  ] verdict:extension-panel: newest is verified at 2026-11-07T20:50:15.439Z
  [OK  ] verdict:interop: newest is verified at 2026-11-07T21:12:15.375Z
  [OK  ] verdict:model-init: newest is verified at 2026-11-07T21:25:39.619Z
  [OK  ] verdict:signal-provenance: newest is verified at 2026-11-07T22:11:15.953Z
  [OK  ] verdict:stale-view: newest is verified at 2026-11-07T22:13:41.343Z
  [OK  ] verdict:state: newest is verified at 2026-11-07T20:38:45.575Z
  [OK  ] verdict:attached: newest is verified at 2026-11-07T20:57:57.711Z
  [OK  ] verdict:coexist: newest is verified at 2026-11-07T21:15:27.751Z
  [OK  ] verdict:extension-enabled: newest is verified at 2026-11-07T20:59:50.938Z
  [OK  ] verdict:live-reads: newest is verified at 2026-11-07T20:55:24.995Z
  [OK  ] verdict:read-only: newest is verified at 2026-11-07T20:54:08.367Z
  [OK  ] verdict:setup: newest is verified at 2026-11-07T20:52:06.147Z
  .project\review\VERIFICATION.json
  verification gate (ship): pass
```

- **Receipt**: `.project/review/VERIFICATION.json` — `mode: ship`, `pass: true`, `blockers: []`,
  written by the gate at this head. It is not re-run here: the recorded receipt is what the gate said,
  and re-running it would only restate the same tree.

## Residuals and declared limits the ship carries

- **The write record the roadmap's scope names does not exist and is not invented.** No criterion, task
  or check depends on it; the ordering is the answer's named absence instead (INTENT C1, C2;
  `research/raw/m057-record-shapes.json:506-566`).
- **The portal's labelled effect has no `index` in any record on disk.** The portal's record carries
  `Resource.loadEffect`, produced by the linkedSignal `Resource.extRequest`, with no node `index`, so
  the read that names an index is proved on `m039-render-phase.json`'s `/effect/freshRead` and the
  portal route tried is named where a verdict reaches a fixture (INTENT C3, E6;
  `research/raw/m057-record-shapes.json:567-583`).
- **`serializeGraph` still writes no `index`.** A future live capture cannot feed this read until the
  serializer changes; that is out of this milestone's scope and is recorded as the reason a record
  rather than a capture is read (`research/raw/m057-record-shapes.json:764-767`).
- **The verify ledger carries no row for T001–T009.** `gsd land`'s clean step deletes the ledger row
  it has just written, so `.project/build/verify-ledger.jsonl` reaches this head with T010's own rows
  and the project verify's row at `613ac83dd4d7be85e98fe45550188799f1bb1e2b`, and with no per-task row
  for the nine earlier tasks; each of those tasks' Verify is evidenced by its own recorded output in
  `.project/build/verify-T00N.log`, and by the wave review that read it. The repair belongs to `gsd
  land`, not to any task here (measured in `.project/review/wave-5.cycle1.md`, the T009 entry).
- **Wave 5's review was rewritten at the head that ships.** The wave-5 cycle-1 record committed at
  `bd6a1ff4` judged four of the wave's five tasks at `53c6a77a`, before wave 5's P001 patch task T010
  landed, so it no longer covered the wave's task set. It was deleted and replaced by
  `.project/archive/057-tutor-signals/review/wave-5.cycle1.md`, which judges all five tasks at
  `613ac83d` and states the replacement in its own header. A wave's cycles must be contiguous and a
  passing cycle followed by a later one is refused, so one record at the shipping head is the only
  shape that does not leave two contradictory verdicts for one wave.

## Provenance

- Each criterion's Check is the project verify recorded at the reviewed head — `npm run check` and
  `npm test` exit 0 at `613ac83dd4d7be85e98fe45550188799f1bb1e2b` — plus the wave review that walked
  the panel surface for SC1 and SC3.
- The gap review is `.project/review/final-gap-1.md` (project Verify, pass, Risk 1 of 1), generated
  from the ledger entry by `workflow_run.py prepare-final` at the reviewed head.
- Wave reviews: `.project/review/wave-1.cycle1.md` … `wave-5.cycle1.md`, all `Wave verdict: pass`,
  each at its own wave's landing; `gsd review-check` reports every review artifact valid at this head.
- The stability record is only ever valid at the head that ships: T010 re-captured
  `research/raw/m056-gate-stability.json` as the last byte written to it, armed and idempotent, with
  `capture.head` left at `5290d939` and `capture.at` preserved
  (`research/raw/m056-gate-stability.json:30-33,87,113`).
