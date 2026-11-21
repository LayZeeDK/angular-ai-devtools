# PLAN — M057 tutor-signals

Milestone: tutor-signals · Branch: gsd-path/M056 · Baseline: ad561fb6

## Config

Project verify: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html`

The build leads for the reason M054 and M055 stated, and this milestone sharpens it:
`scripts/panel-bundle-budget.test.mjs` refuses an output older than the newest source, and this
milestone edits the route table and the loader map the artifact is built from, so a stale output is
exactly what it would hit. `--skip-nx-cache` stays because a cached replay restores its recorded
output without refreshing the timestamp that assertion reads, and the `git checkout` discards the
working-tree diff of a file that is a build artifact and never an edit.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Corrections

- C1 2026-11-21: **No record on disk carries an effect node, so the graph the answer names must be
  captured.** Measured at plan time over every `research/raw/*.json`: no file carries a node of kind
  `effect` beside an `index` field, and the closest record, `research/raw/m039-render-phase.json`,
  holds the graph only as the derived reading `effect.fromRecording`, whose nodes carry `kind` and
  `label` and no `index`, and whose edges are `kind:label` strings rather than the two index ends the
  recorded shape holds (`extension/linked-state.js:29`). SC1 requires the answer to name the effect
  node's own `index`, so T003 captures the one graph this milestone reads, Insurance Portal first,
  and every later wave reads that record and no other.
- C2 2026-11-21: **Both inventory suites count records against M055's map and know nothing of this
  milestone's pair.** Measured at plan time: `scripts/tutor-answer.test.mjs` subtracts the paths
  `research/raw/m055-record-shapes.json` names outside its map — M055's own two — and holds the
  remainder against a recorded count; `scripts/tutor-record-shapes.test.mjs` holds the same map in
  both directions. A third record of this milestone's is neither measured by that map nor named
  outside it, so both suites read it as an unmeasured record. T006 makes each milestone's map excuse
  its own records, which is the mechanism M055's own T004 built for its pair, applied where M057 can
  reach it.
- C3 2026-11-21: **The entry is line-neutral, and that is a plan constraint, not a preference.**
  Measured at plan time: `apps/angular-ai-devtools/src/app/app.routes.ts:113` (`appRoutes`), `:146`
  (`loadComponent: loadPanelDemo,`) and `:147` (`data: { surface },`) are cited by the M047 to M055
  surface records, and `scripts/copy-check.test.mjs` re-reads three of those records on every run. A
  surface entry that adds a line to `PANEL_SURFACES` moves all three, and no blank line is free to
  pay with: the list's paragraph ends at `:18` and `:19` closes the comment. So T004 adds the entry
  as one line and pays for it by folding the M028 entry's own comment (`:21`, the one comment above
  the list that no record cites) into the list's paragraph and deleting that line — a sentence
  appended to a comment line costs no line, so the note survives whole while the count stays level.
  Its sample fact is appended after the component rather than inside the `FACTS` literal for the same
  reason. The result: no cited line moves, no record is re-cited, and no suite that re-reads one goes
  red. T005 asserts the three line numbers this rests on. `scripts/after-render-fixture.test.mjs` is
  run by T005 and declared by no task: its nineteen-route pin is the counter fixture's table, read
  from `spikes/ng222-app/src/app/app.routes.ts` at line 11, so the change this wave makes cannot move
  what it asserts.
- C4 2026-11-21: **The authored ceiling and the pinned-file rule cannot both be satisfied for the
  files this milestone must change, and this plan satisfies the pinned-file rule.** Measured at plan
  time by reproducing `lib/plan-lint.ts`'s pin index over this head: `scripts/gate-integrity.test.mjs`
  names almost every source file as a literal, and `scripts/gate-integrity-default-tasks.test.mjs`
  names `scripts/gate-integrity.test.mjs` (`:3601`), so any task that declares a file the gate names
  must declare both gate suites. The route file's own closure is four: `app.spec.ts`,
  `page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and `panel-demo.spec.ts` pin
  `app.routes.ts`, `scripts/component-search.test.mjs` and
  `tests/held-out/fixture-explainers-unchanged.test.mjs` pin it too, the four specs and
  component-search pin the gate suite, and the gate suite pins its default-tasks sibling — 4 counted
  suites plus the Log is 5. The copy record's closure is three suites plus two recordings — 6. The
  stability record's closure is three suites plus two recordings — 6. Four tasks therefore exceed
  four authored artefacts, and no arrangement of tasks avoids it: an undeclared pinned file is a
  plan-lint blocker and an undeclared write is a landing refusal, so the count is what gives. The
  repair is in the counting rule, not this plan: a suite a task declares only because it pins a file
  the task changes — M055's `declared, not edited` class — is not work the task authors, and
  excluding it puts every task here at four or fewer (T004 at 2, T006 at 4, T007 at 4, T009 at 4).
  Until that carve-out exists, `gsd verify-weight` reports the four measured totals above.
- C5 2026-11-21: **Two gate records are red at this head and this milestone repairs them.** Measured
  at plan time: `node --test scripts/gate-integrity.test.mjs` is 37 of 40 with three failures, the
  first of which is `the recording disagrees with this run's derivation … claims[5].resolvesTo: 55
  row(s) -> 56 row(s)` — M056's ship commit now exists, so the fix-record resolver no longer takes
  its fallback; and `node --test scripts/gate-stability-record.test.mjs` is 6 of 8, naming
  `archive.detail.plainRun.milestone: "M055" -> "M056"` and the shifted predecessor range. Both are
  re-derived by their own capture commands in T008 and T009, the stability record last because one
  value it derives is a function of this milestone's own task logs.
- C6 2026-11-21: **T004's Verify carries four heavy steps and the ceiling is three, so one leg moves
  to the task that already runs the same pin.** Measured at plan time: `gsd plan-lint` blocks T004
  with `the Verify performs 4 heavy steps (install, build, suite)` — `npx nx run
  angular-ai-devtools:build-extension --skip-nx-cache`, `npx nx run angular-ai-devtools:test
  --skip-nx-cache`, `node --test` over the two route-file suites, and `npx prettier --check` — and
  `gsd verify-weight` reports `steps=5` with four of them heavy. The build is not the leg that can
  move: it is the leg that *lands* `extension/panel/index.html`, and a setup task placed before the
  route edit would land a bundle carrying no `tutor-signals` surface. The artifact is the product, so
  that arrangement would ship a panel whose route this milestone had just proved somewhere else. The
  leg that moves is the direct-suite leg: `scripts/component-search.test.mjs` and
  `tests/held-out/fixture-explainers-unchanged.test.mjs` run in T005's single `node --test` leg,
  beside the two route-pinning suites it already runs, and T005 depends on T004 — so the route table
  the wave lands is proven green at the head the wave leaves, one task later rather than unrun.
  Nothing is dropped from the milestone: the build, the app suite, the formatting check and the
  artifact restore stay in T004 as its three heavy steps, the two route-file suites still run, and the
  project verify still leads with the build (T009). T004 and T005 stay at 5 and 2 steps, with 3 and 2
  heavy.
- C7 2026-11-21: **T006's brief named a record it must not own, and the plan gate refused it.**
  Measured at approval time: `check_task_briefs.py --base <head>` refuses with `T006: ## Approach names
  a path missing at the layer base: research/raw/m057-surface.json` — that record lands in T007 and
  T006 neither declares nor authors it, so the brief now names it by owner ("the surface record lands
  in T007") rather than by path. The brief still states what both suites must survive; no task,
  acceptance criterion, dependency or record moved.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1 |
| SC2 | T002 | AC3 |
| SC3 | T002 | AC4 |
| SC4 | T002 | AC5 |
| SC5 | T002 | AC6 |
| SC1 | T001 | AC2 |
| SC1 | T003 | AC2 |
| SC1 | T004 | AC1 |
| SC1 | T005 | AC1 |
| SC1 | T006 | AC2 |
| SC1 | T007 | AC1 |
| SC2 | T001 | AC3 |
| SC2 | T009 | AC1 |
| SC3 | T004 | AC2 |
| SC5 | T003 | AC3 |
| SC5 | T006 | AC2 |
| SC5 | T008 | AC1 |

The ordering is load-bearing and not aesthetic. `scripts/navigation-blocking.test.mjs` resolves an
in-scope edge to the suite the *first* coverage row of its criterion names, and refuses a criterion
whose edges resolve to two different suites — the refusal that cost M055's T004 a dispatch. Every
criterion's first row here names T002, whose suite is `scripts/tutor-signals.test.mjs`, so SC1's four
edges, SC3's two, SC4's one and SC5's one all resolve to one suite, and SC2's two held-out edges
resolve through the held-out table below to the same one.

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E7 | T002 | scripts/tutor-signals.test.mjs |
| E8 | T002 | scripts/tutor-signals.test.mjs |

E7 is held-out: an edge is `{ consumer, producer }` and nothing else — no field, no value, no moment
(`extension/render-phase.js:17-20`) — so a write is not representable in one, and the answer states
the ordering as the named absence rather than reading a cause out of a direction. E8 is held-out: the
effect finding and a recorded change-detection message stay two findings in the recorded order and
are never joined (`extension/render-phase.js:49-51`), so the second is never read as the first one's
cause. Both are pinned in one suite because both are SC2's, and one criterion may resolve to one
suite.

## Surface contract

### panel — T004

Entry: the panel route `tutor-signals`, rendered through the `tutor-signals` key in `panel-demo.ts` `LOADERS`, its sample in `FACTS`, and the `PANEL_SURFACES` entry in `app.routes.ts` that the shared `loadPanelDemo` closure installs lazily.

States: `answered` — the answer names the effect node by the label the graph gives it and by its own `index`, names each upstream node the graph's edges state for it by that node's `index` and label, and states the ordering as the named absence `no-write-record-no-order` beside them, every field read from the graph's own `nodes` and `edges` and every claim carrying the artefact path that states it (SC1, SC2); `graph-unreadable`, `no-render-entry` and `no-effect-node` — three absences, each in its own sentence, naming which one holds and never folded into one blank answer (SC3); `no-answer` — the pane was handed no answer at all, which is the fourth sentence and not a synonym for any of the three.

Walkthrough:

1. Open the panel at route `tutor-signals` against the Insurance Portal's inspected tab: the surface answers the demo question by naming the effect node the captured graph carries — its label as the graph spells it, which on the portal is `Resource.loadEffect`, and its own `index` — then the upstream nodes its edges state, each by index and label, then the sentence that says the record carries no ordering.
2. Read the absence beside the effect: the surface states `no-write-record, no order` as its own named absence and names no write, no owner and no cause anywhere in the answer (SC2).
3. Take the captured graph away from the fact and reload: the surface states `graph-unreadable` in its own sentence, with no effect, no label and no read beside it, and never as a page with no effects (SC3).
4. Hand the fact a graph and no render/effect entry: the surface states `no-render-entry`, distinct from the graph absence and from the empty-effect absence (SC3).
5. Hand it a readable graph holding no node of kind `effect`: the surface states `no-effect-node`, the third absence, in its own sentence (SC3).

Criteria: SC1, SC3

## Wave 1 — measure what the two records carry and what no record carries

Goal: the milestone's claim rests on fields two records already hold and on one absence the roadmap's
premise denied. Both are on disk, with citations, before anything is built on them — and the second
negative measurement decides that one graph must be captured rather than read.

Review depth: full

T001 measures the field map statically. **The two records**, with `path:line` citations carrying each
cited line's own trimmed text, every citation re-resolved by searching its file for the exact line it
quotes: the graph as `extension/agent-main.js:912` serializes it and `:1070` carries it per check,
whose node is read for `index`, `kind` and `label` and whose edge is read for its two ends
(`extension/render-phase.js:17-20`), the recorded shape being `{ nodes, edges }`
(`extension/linked-state.js:29`); and the render/effect entry the join answers at
`extension/render-phase.js:304`, whose three absences are published at `:310-312`, `:317-319` and
`:331` and whose two findings never merge (`:336-338`). It records which field names the effect, how
an unlabelled effect is reached (the recorded edge, never an index), and which fields the reader
ignores — `id`, `epoch`, `value`, `debuggableFn` and any cause a later capture might add
(`extension/render-phase.js:31-35`) — so no later wave reads a field the recording does not declare.

**The negative measurement that decides the milestone's shape** (C1): no record on disk carries a
node of kind `effect`, so the graph the surface answers from must be captured. **The second negative
measurement, which is the intent's own C1**: no write record exists anywhere in `extension/` — the
five searches the intent records find a sanitizer binding's `writes` field and a test title, and
nothing else — and an edge has no field to order a write in, so the ordering is a named absence and
not a capture this milestone could add. It records `research/raw/m057-record-shapes.json` with
citations and instrument metadata, and `scripts/tutor-signals-shapes.test.mjs` parses the recording
and re-checks each citation at this head. Nothing is built: no join, no capture, no surface, no route.

## Wave 2 — answer from the two records, purely

Goal: one pure join reads the captured graph and the render/effect entry and returns exactly the
fields the graph states, the absence the record forces, and unplaced for what it cannot place — with
no page, no clock and no field the reader ignores, and a suite that reddens every way the answer
could lie.

Review depth: full

T002 builds `extension/tutor-signals.js` on `globalThis.angularAiTutorSignals`: the pure join
`tutorSignals(records)`, taking the serialized graph and the render/effect entry and returning
`{ state, question, effect, reads, unplaced, ordering, claims, detail }` — where `state` is
`answered`, `graph-unreadable`, `no-render-entry` or `no-effect-node`; `effect` is
`{ label, index, namedBy }` read from the node the record's own subject names; `reads` is the
upstream nodes its consumer edges state, each as `{ index, label }` in the order the edges appear;
`unplaced` names every producer end or effect reference the graph cannot place, by end and value,
instead of numbering, dropping or resolving it to the nearest node; `ordering` is always
`{ state: 'absent', absence: 'no-write-record-no-order' }`; and `claims` carries one entry per
rendered claim with the artefact path that states it, in M055's answer shape. The three absences are
distinct states, each naming which one holds, and an unreadable graph is never a page with no
effects. The join imports nothing at runtime, touches no filesystem, dispatches no message, holds no
clock and reads no page global: a bare `node:vm` context with nothing in it is enough to run it,
which the suite proves. `scripts/tutor-signals.test.mjs` pins the module and then mutates, each
mutant with its own anchor assertion: an answer with no artefact path; an effect named by its
position in the node array; a producer an edge records that the answer omits; an index past the
graph's last node; a producer the graph does not carry that is numbered or dropped instead of
unplaced; the absence rendered as causation; an order read out of an edge's direction; a write the
record does not carry; the three absences folded into one blank answer; an unreadable graph reported
as a page with no effects; an answer that changes when the fact gains `id`, `epoch`, `value`, `debuggableFn`
or a cause; and an answer that changes on a second read of the same fact. This task owns held-out E7
and E8.

## Wave 3 — capture the one graph no record holds

Goal: the graph the surface answers from is a record, captured portal-first with the route tried and
the artefact the portal lacks named, and captured without one new page-side instrument.

Review depth: full

T003 captures `research/raw/m057-signal-graph.json` with its own command,
`scripts/tutor-signals-capture.test.mjs`, armed by its own environment flag: the serialized graph the
agent already produces (`extension/agent-main.js:912`, `:1070`), read on the Insurance Portal first
(`control-angular-dev-app up --target portal`), the portal route tried named (`/home` first), and —
because the portal's record carries one labelled effect, `Resource.loadEffect`, whose producer is the
`linkedSignal` labelled `Resource.extRequest`, while the empty-label shape is the fixture's
(`extension/render-phase.js:13-16`) — a verdict that reaches the counter fixture names `/home`, the
labelled effect the portal's record carries and the empty-label effect node the portal lacks. The
capture adds no instrumentation: it calls the read the agent already performs and writes what it
returned, and the suite asserts the profiler taps and page-side listeners the capture path carries
are the ones it already had (SC5).

## Wave 4 — render the answer and pin the route table

Goal: the four states render on a panel surface whose answer is the shipped join's own over the
captured record, and the two suites that read the route table and the loader map own the change
before they are asked, not after a landing refuses.

Review depth: full

T004 adds `apps/angular-ai-devtools/src/app/panel-tutor-signals.ts`: the display half, handed the
join's answer and rendering it — `answered` naming the effect by its label and its own `index`, then
each upstream node by index and label, then the named absence; `graph-unreadable`, `no-render-entry`
and `no-effect-node` each in its own sentence, distinct; no field composed that the answer does not
carry, and no sentence outside a `PANE_SENTENCES` registry. The demo's `tutor-signals` sample fact in
`apps/angular-ai-devtools/src/app/panel-demo.ts` is the shipped join's own answer over
`research/raw/m057-signal-graph.json`, held field-for-field to `tutorSignals` re-run node-side by
`panel-demo.spec.ts` on every test run. It adds the `LOADERS` key and the `PANEL_SURFACES` entry
line-neutral (C3), updates the four app specs, and declares `scripts/component-search.test.mjs`,
`tests/held-out/fixture-explainers-unchanged.test.mjs`, `scripts/gate-integrity.test.mjs` and
`scripts/gate-integrity-default-tasks.test.mjs` — the four suites the route file's pin closure
reaches (C4) — before starting. It lands a freshly built `extension/panel/index.html`; its Verify keeps
the build, the app suite, the formatting check and the artifact restore as its three heavy steps, and
the two route-file suites it declares run in T005 (C6).

T005 edits `scripts/panel-routes.test.mjs`: its surface-to-module map gains the `tutor-signals` row
and its removed-surface mutant gains the surface, so a dropped route reddens by name. It asserts the
three line numbers C3's line-neutral entry rests on, runs `scripts/after-render-fixture.test.mjs`
without declaring it (C3), runs the two route-file suites T004 declares in the same `node --test` leg
so the route is proven green at the head this wave leaves (C6), and declares the two gate suites its
own file's closure reaches.

## Wave 5 — the records, the gate and the project verify

Goal: every record this milestone's surface moves is re-derived with its own command at the head that
ships, the two inventories that count records excuse this milestone's own pair, the two gate records
that are red at this head are repaired, and the project verify runs last.

Review depth: full

T006 captures `research/raw/m057-verdict-claims.json` with its own command and edits the two
inventory suites (C2) so that each milestone's map excuses its own records: both read M057's map
beside M055's, and the named-outside set stays a recording's statement rather than a suite's filter.
A record neither map names still reddens, and each suite pins the subtraction to the exact paths the
two maps name.

T007 records `research/raw/m057-surface.json` — the route, the loader key, each state with the answer
field it reads, and the absence it states — and re-measures the copy: it re-derives
`research/raw/m048-surface-copy.json` over every surface on disk, authors the digest rows the new
pane's sentences need in `extension/copy-digest.json`, and moves `panel-demo.ts`'s copy-check fact
with the digest's count, that file and its three pinning specs declared here. Each re-derivation runs
its own capture command, never by hand.

T008 re-derives `research/raw/m044-gate-shapes.json` with its own command, so the gate's oracle table
and the archive references are this head's; the record is idempotent on a second armed run.

T009 re-derives `research/raw/m056-gate-stability.json` and `research/raw/m057-verdict-claims.json`
with their own commands — the stability record last, because one value it derives is a function of
this milestone's own task logs — then runs the project verify as the last action, re-deriving nothing
after it: the build first, then `npm run check`, then `npm test`, then the checkout that discards the
working-tree diff of a build artifact.
