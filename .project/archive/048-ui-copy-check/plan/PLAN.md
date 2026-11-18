# PLAN — M048 ui-copy-check

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
| N1 | T002 | a string is explained only by the digest's own text, and the mutant that removes an entry reddens |
| N2 | T002, T003 | a missing digest or missing strings renders `cannot-tell`, proven by that state |
| N3 | T002 | the `cannot-tell` reason vocabulary is a closed set, and an invented cause is a red test |
| N4 | T003 | the surface adds no DOM to an inspected page; every control lives in the panel |
| N5 | T001 | the strings come from the surfaces' declared copy, and a mutant that re-reads the page reddens |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/copy-check.test.mjs |

E4 is held-out: "no digest to compare" and "nothing wrong" must be distinguishable, and that is the
whole of SC2's second half. One test asserts both states from the same surface record.

## Surface contract

### panel — T003

Entry: the panel route `copy-check`, rendered through the `copy-check` key in `panel-demo.ts`
`LOADERS`.

States: `clean` — every declared string is explained by the digest; `unexplained` — the report names
each string the digest does not explain, with the surface that renders it; `cannot-tell` — there are
no strings or no digest, and the reason is stated verbatim.

The surface writes its own sentences: it never names a cause, element, remedy or rule identity that
the report does not state.

Walkthrough:
1. Open the panel at route `copy-check`; the surface states that every declared string is explained.
2. Open a record whose digest lacks one entry; the surface names that string and the surface it came from.
3. Open a record with no strings; the surface states `cannot-tell` with its reason rather than a clean result.
4. Open a record with strings but no digest; the surface states `cannot-tell` naming the missing digest.

Criteria: SC1, SC2

## Wave 1 — measure the copy each surface declares

Goal: the observable is measured before any join exists, so the criteria rest on what the panel
actually declares rather than on the roadmap's sentence.

Review depth: full

T001 reads every `panel-*.ts` surface and records, at `path:line`, where each declares the sentences
it renders, which surfaces declare none, and where a sentence is interpolated inline instead of
declared. The record goes to `research/raw/m048-surface-copy.json` and is pinned by a suite that
reddens when a citation slides off its line.

## Wave 2 — explain the strings against a digest

Goal: a pure join explains every declared string against the digest's own text, and reports what it
cannot explain rather than passing it as clean.

Review depth: full

T002 authors `extension/copy-digest.json` and builds `extension/copy-check.js`: a pure join from
(surface record, digest) to `{state, unexplained, checked, reason}` with `state` in `clean`,
`unexplained`, `cannot-tell`. The suite pins the untouched module, then mutates it four ways: an
entry removed from the digest, a string matched by similarity rather than text, an invented row, and
a missing digest reported as clean.

## Wave 3 — render the three states and pin the route

Goal: the three states render, and the route, loader key and every route-table suite are declared
with them.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-copy-check.ts`, its `copy-check` route and loader
key, and updates `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`,
`panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/gate-integrity.test.mjs`,
`scripts/gate-integrity-default-tasks.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs`.

## Wave 4 — record the surface and run the project verify

Goal: the surface is recorded and the project verify runs at the head that ships.

Review depth: full

T004 records the surface with `path:line` citations, re-derives the recordings the verify staleness
requires, and runs `npm run check && npm test` at the head it lands on.
