# PLAN — M050 dead-click

## Config

Project verify: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`

The build leads because `scripts/panel-bundle-budget.test.mjs` now refuses an output older than the
newest source: without a fresh build every project verify would compare a stale artifact, which is the
defect this milestone removed. `--skip-nx-cache` because a cached replay restores its recorded output
without refreshing the timestamp the assertion reads.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Success criteria

| Criterion | Wave | Task |
|-----------|------|------|
| SC1 | 1, 2, 3, 5, 6 | T001, T002, T003, T005, T006 |
| SC2 | 2, 3 | T002, T003 |
| SC3 | 1, 2 | T001, T002 |

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC3 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T002 | AC1 |
| SC1 | T003 | AC1 |
| SC2 | T003 | AC1 |
| SC1 | T004 | AC1 |
| SC1 | T005 | AC1 |
| SC1 | T006 | AC1 |

## Prohibitions

| Prohibition | Task | Enforcement |
|-------------|------|-------------|
| N1 | T002, T003 | a finding quotes the event's fields, and the mutant that names a cause reddens |
| N2 | T002, T003 | an unbounded record renders cannot-tell, proven by that state |
| N3 | T002 | pairing is the record's own fields, and the adjacency mutant reddens |
| N4 | T003 | the surface adds no DOM to an inspected page |
| N5 | T002 | the judgement is pure over the record, asserted by never reading a file or a clock |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/dead-click.test.mjs |

E4 is held-out: one dangling event beside one paired event must render exactly one finding, and the
same suite asserts the all-paired case, so "nothing is dangling" cannot collapse into "nothing was
compared".

## Surface contract

### panel — T003

Entry: the panel route `dead-click`, rendered through the `dead-click` key in `panel-demo.ts`
`LOADERS`.

States: `findings` — each dangling event named with its own fields and the window it was judged over;
`clean` — every chain's consequent arrived within the window, with the counts compared; `cannot-tell`
— the window cannot be bounded, or no event belongs to a measured chain, with the reason stated
verbatim.

Walkthrough:
1. Open the panel at route `dead-click`; the surface renders each dangling event and its window.
2. Open a record where every chain is complete; the surface states it is clean and how many were compared.
3. Open a record with one dangling and one paired event; the surface renders one finding, not two.
4. Open a record whose window cannot be bounded; the surface states `cannot-tell` with its reason.

Criteria: SC1, SC2

## Wave 1 — measure the three consequence chains

Goal: the judgement rests on measured pairings and a measured window, before any code reports a
dangling event.

Review depth: full

T001 reads the recorders and records, at `path:line`, each chain's start marker, its consequent, the
field that pairs them, whether the record distinguishes two open starts of one kind, whether a
dangling start survives into the published record, and what bounds the window. It answers the
intent's open question as a measurement.

## Wave 2 — judge the record, or refuse

Goal: a pure judgement reports an event whose consequent is absent within the measured window, and
refuses to judge what it cannot bound.

Review depth: full

T002 builds `extension/dead-click.js`: a pure function from (record) to
`{ state, findings, considered, reason }`, pairing on the fields T001 measured and never on adjacency.
The suite pins the untouched module, then mutates four ways: a paired event reported as dangling, a
pair matched by adjacency, an unbounded record reported as clean, and an invented cause in a finding.

## Wave 3 — render the states and pin the route

Goal: the states render and every route-table suite names the route.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-dead-click.ts`, its route and loader key, and
updates `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`,
`panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs`.

## Wave 4 — record the surface and run the project verify

Goal: the surface is recorded and the project verify runs at the head that ships.

Review depth: full

T004 records the route, the loader key and each state with the report field it reads; re-measures the
copy record and digest so the new surface's sentences are explained; captures
`research/raw/m050-verdict-claims.json`, which the project verify reads and no task owned in three
consecutive milestones; re-derives both gate recordings; and runs `npm run check && npm test`.

## Wave 5 — give the eager bytes back so the panel bundle fits its baseline

Goal: the panel's initial bundle measures at or below the recorded 535.44 kB baseline at the head that
ships, from a fresh build rather than whatever artifact happens to sit in `extension/panel`.

Review depth: full

T005 repairs what `prepare-final` found: twenty panel surface routes are the same route object with
`path` and `data.surface` holding one string each, so every surface has cost the eager bundle its own
copy of the property names. M041's T006 repaired the identical duplication one layer down, collapsing
thirteen copies of one lazy closure into `loadPanelDemo`; the closure is shared and the objects are not.
T005 declares the surface names once and maps them over a single object literal, keeps every path, its
order and its `data.surface`, builds, and proves the measured total moved under the baseline. The
constant is not raised: the evidence for the failure, and the two measurements that show the gate was
reading a stale build for three milestones, are in `.project/review/BUNDLE-PROBE.md`.

## Wave 6 — re-derive the citation the collapse moved, and stop hand-picking the Verify

Goal: the suite that enumerates the route table is green at the head, and no future task can land with a
red suite because its author listed four suites instead of five.

Review depth: full

Wave 5's review found what T005's Verify could not: `scripts/component-search.test.mjs` holds
`research/raw/m047-names-and-absences.json`'s citation of `app.routes.ts:17` to that line's own text, and
the collapse moved the export to `:113`. T006 re-derives the citation from the tree, checks every other
citation in the record for the same slide, and puts `npm test` — the whole suite — into its Verify. This
is the sixth occurrence of one rule; the durable part of the repair is the Verify, not the line number.


