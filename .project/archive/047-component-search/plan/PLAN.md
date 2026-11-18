# PLAN — M047 component-search

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
| SC3 | 2 | T002 |

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC2 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T002 | AC1 |
| SC1 | T003 | AC1 |
| SC2 | T003 | AC1 |
| SC1 | T004 | AC1 |

## Prohibitions

| Prohibition | Task | Enforcement |
|-------------|------|-------------|
| N1 | T002 | a name the record lacks never matches, and the mutant that matches one reddens |
| N2 | T002, T003 | an unreadable source renders `cannot-tell` with its reason, proven by that state |
| N3 | T002 | the `cannot-tell` reason vocabulary is a closed set, and an invented cause is a red test |
| N4 | T003 | the surface adds no DOM to an inspected page; every control lives in the panel |
| N5 | T001 | the list is read from the record, and a mutant that re-reads the DOM reddens the pin |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/component-search.test.mjs |

E4 is held-out: an empty list that is stated must be distinguishable from `cannot-tell`, and that
distinction is the whole of SC2's second half. The test asserts both states from one record so the
pair cannot drift apart.

## Surface contract

### panel — T003

Entry: the panel route `components`, rendered through the `components` key in `panel-demo.ts`
`LOADERS`.

States: `listed` — the record names components and the surface lists them; `filtered` — the typed
text narrows the list and the surface states how many matched; `empty` — the record reports that the
page rendered no components, stated as an empty list; `cannot-tell` — the source could not be read,
with its reason.

The surface writes its own sentences: it never names a cause, element, remedy or rule identity that
the record does not state.

Walkthrough:
1. Open the panel at route `components` with a record naming components; the surface lists them.
2. Type part of a name; the surface states which rows matched and how many.
3. Type text no recorded name contains; the surface states that nothing matched, without inventing a name.
4. Open a record whose source could not be read; the surface states `cannot-tell` with its reason rather than an empty list.

Criteria: SC1, SC2

## Wave 1 — measure what the page agent can name, and what it cannot

Goal: the observable is measured before any join is designed, so the criteria rest on what the panel
can actually read rather than on the roadmap's sentence.

Review depth: full

T001 measures what `extension/agent-main.js` can name per element today — which elements carry
`__ngContext__`, what `ng.getComponent` returns, and whether profiler `componentName` events carry a
name at all — and records the answer with `path:line` evidence in
`research/raw/m047-names-and-absences.json`, including the absence cases it found. Every later task
is held to that record.

## Wave 2 — filter the names the record carries

Goal: a pure filter over the record matches only names the record holds, and an unreadable source is
a stated absence rather than an empty list.

Review depth: full

T002 builds `extension/component-search.js`: a pure join from the record to `{state, rows, matched,
reason}`, where `state` is `listed`, `empty` or `cannot-tell`, and the reason vocabulary is closed.
The suite pins the untouched module, mutates it, and asserts the failure names the defect by string.

## Wave 3 — render the surface and pin the route it adds

Goal: the four states render, and the route, demo loader and route-table pins they add are declared
with them.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-components.ts`, its `components` route, its
`components` key in `panel-demo.ts` `LOADERS`, and every suite that enumerates the route table —
`app.spec.ts`, `page-picker.component.spec.ts`, `panel-demo.spec.ts` and `scripts/panel-routes.test.mjs`.

## Wave 4 — record the surface and run the project verify

Goal: the surface is recorded and the project verify runs at the head that ships, so a red build
cannot reach ship.

Review depth: full

T004 records the surface in `research/raw/m047-surface.json` and runs `npm run check && npm test` at
the head it ships.
