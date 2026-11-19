# PLAN — M051 what-changed

## Config

Project verify: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`

The build leads because `scripts/panel-bundle-budget.test.mjs` refuses an output older than the newest
source, and `--skip-nx-cache` because a cached replay restores its recorded output without refreshing the
timestamp that assertion reads. This is the shape M050 landed and the row in `AGENTS.md` now pairs with it.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Success criteria

| Criterion | Wave | Task |
|-----------|------|------|
| SC1 | 1, 2, 3 | T001, T002, T003 |
| SC2 | 1, 2, 3 | T001, T002, T003 |
| SC3 | 1, 2 | T001, T002 |

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T002 | AC2 |
| SC1 | T003 | AC1 |
| SC2 | T003 | AC1 |
| SC1 | T004 | AC1 |

## Prohibitions

| Prohibition | Task | Enforcement |
|-------------|------|-------------|
| N1 | T002, T003 | a finding quotes the two snapshots' own field values, and the mutant that invents a change reddens |
| N2 | T002, T003 | a pair with no binding field renders cannot-tell naming it, proven by that state |
| N3 | T002 | the comparison is pure over the two records, asserted by never reading a file or a clock |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/what-changed.test.mjs |

E4 is held-out: one field differing must render exactly one finding, and the same suite asserts the
identical-pair case, so "one change" cannot collapse into "no comparison".

## Surface contract

### panel — T003

Entry: the panel route `what-changed`, rendered through the `what-changed` key in `panel-demo.ts` `LOADERS`.

States: `changes` — each differing field named with its before and after, and the pair's binding field;
`unchanged` — the two snapshots agree on every compared field, with the count compared; `cannot-tell` —
no field binds the two snapshots to one page, or a snapshot is absent, with the reason stated verbatim.

Walkthrough:
1. Open the panel at route `what-changed`; the surface names each field that differs.
2. Open a pair that agrees field by field; the surface states unchanged and how many fields it compared.
3. Open a pair with no binding field; the surface states `cannot-tell` naming the absence.
4. Open one snapshot alone; the surface states `cannot-tell` rather than an empty finding list.

Criteria: SC1, SC2

## Wave 1 — measure what a recorded snapshot carries and what binds two of them

Goal: the comparison rests on fields the record actually publishes, and the intent's correction is either
confirmed or replaced by a second measured one.

Review depth: full

T001 reads the recorders and records, at `path:line`, which structure the record publishes that could stand
for a snapshot of a page, which field could bind two of them to one page, whether any such field is stable
across two records, and what the record states about fields it does not carry. It answers the intent's open
question as a measurement and pins the record with one suite. Build nothing else.

## Wave 2 — compare the pair, or refuse

Goal: a pure comparison reports the fields that differ, and refuses a pair it cannot bind.

Review depth: full

T002 builds `extension/what-changed.js`: a pure function from two snapshots to
`{ state, changes, compared, reason }`, diffing only the fields the record states, never a third source. The
suite pins the untouched module, then mutates four ways: a differing field reported as equal, an equal field
reported as a change, an unbound pair compared as one page, and an invented before or after.

## Wave 3 — render the states and pin the route

Goal: the states render and every route-table suite names the route.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-what-changed.ts`, its route and loader key, and updates
every suite that enumerates the route table — `app.spec.ts`, `page-picker.component.spec.ts`,
`chat-entry.component.spec.ts`, `panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`,
`scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`,
`scripts/gate-integrity-default-tasks.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`.

## Wave 4 — record the surface and run the project verify

Goal: the surface is recorded and the project verify runs at the head that ships.

Review depth: full

T004 records the route, the loader key and each state with the report field it reads; re-measures the copy
record and digest so the new surface's sentences are explained; captures `research/raw/m051-verdict-claims.json`;
re-derives both gate recordings; and runs `npm test` — the whole suite — before the project verify.

## Corrections

**Correction 2 (ruled at `7b054ee6`; the intent's approved text still says "two recorded snapshots of the
same page", so this section is where the binding is decided while that sentence stands).** T001 measured that
the record publishes no page snapshot at two moments — two publication sites only, `agent-main.js:1059` per
frame and `:1432` per install — and that no field binds two records to one page: `identity.bindingField:
null`, `claimants: 0`, with `tabId` present only in the transport (`background.js:23`) and zero page
readers in `agent-main.js`. Evidence: `research/raw/m051-snapshots.json`.

The pair is therefore bound by **the panel's own inspected tab**, not by a field of the record, and the
surface must say so: a reader sees that the binding is the panel's and that the record carries no page
identity. A pair the panel cannot bind to one tab reports `cannot-tell`. Rewriting the intent's SC1 wording
is owed as a define-phase step; this milestone does not pretend the sentence was already corrected.