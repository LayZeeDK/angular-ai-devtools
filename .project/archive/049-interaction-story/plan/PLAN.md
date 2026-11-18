# PLAN — M049 interaction-story

## Config

Project verify: `npm run check && npm test`

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Success criteria

| Criterion | Wave | Task |
|-----------|------|------|
| SC1 | 1, 2, 3 | T001, T002, T003 |
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

## Prohibitions

| Prohibition | Task | Enforcement |
|-------------|------|-------------|
| N1 | T002, T003 | a step quotes the event's recorded fields, and the mutant that paraphrases reddens |
| N2 | T002, T003 | an empty stream renders `cannot-tell`, proven by that state rather than by review |
| N3 | T002 | the merge is refused when no shared order is measured, asserted by the cannot-tell case |
| N4 | T003 | the surface adds no DOM to an inspected page |
| N5 | T002 | the narration is pure over the record, asserted by never reading a file or the page |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/interaction-story.test.mjs |

E4 is held-out: one empty stream beside two populated ones must render the two and name the empty one,
so "nothing happened anywhere" cannot collapse into "nothing happened here".

## Surface contract

### panel — T003

Entry: the panel route `interaction-story`, rendered through the `interaction-story` key in
`panel-demo.ts` `LOADERS`.

States: `steps` — the sequence in the measured order, each step naming its stream and quoting the
event's fields; `cannot-tell` — the streams are all empty, or they share no order, with the reason
stated verbatim.

Walkthrough:
1. Open the panel at route `interaction-story`; the surface renders the record's steps in order.
2. Open a record whose streams are all empty; the surface states `cannot-tell` with its reason.
3. Open a record with two populated streams and one empty; the surface renders the two and names the third as empty.
4. Open a record whose events carry no comparable order; the surface states `cannot-tell` rather than guessing a sequence.

Criteria: SC1, SC2

## Wave 1 — measure the three recorded streams

Goal: the narration rests on the streams' measured shapes and on whether they can be interleaved
honestly, before any code renders them.

Review depth: full

T001 reads the three emitters and records, at `path:line`, each stream's entry shape, its bound, its
stated order, and whether any two carry a comparable field. It answers the intent's open question —
shared clock or not — as a measurement, and records the answer the plan must then obey.

## Wave 2 — narrate the record as steps, or refuse

Goal: a pure narration turns the record into steps in the measured order, quoting each event, and
refuses to merge what shares no order.

Review depth: full

T002 builds `extension/interaction-story.js`: a pure function from (record) to
`{ state, steps, cannotTell, reason }`, with the order taken from the measurement rather than assumed.
The suite pins the untouched module, then mutates it four ways: a step reordered, a step paraphrased
rather than quoted, an invented step, and an all-empty record reported as an empty story.

## Wave 3 — render the states and pin the route

Goal: the states render and every route-table suite names the route.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-interaction-story.ts`, its route and loader key, and
updates `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`,
`panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs`.

## Wave 4 — record the surface and run the project verify

Goal: the surface is recorded and the project verify runs at the head that ships.

Review depth: full

T004 records the route, the loader key and each state with the report field it reads; re-measures the
copy record and digest so the new surface's sentences are explained (the gap M048's T003 recorded);
re-derives both gate recordings; and runs `npm run check && npm test`.
