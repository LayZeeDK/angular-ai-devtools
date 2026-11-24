# PLAN — M067 formfield-binder

Milestone: M067 — formfield-binder · Branch: gsd-path/M067 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 3

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

## Waves

## Wave 1 — T001: isolate the missing reason row

Goal: A suite with no `SUITE_DIFF_REASONS` row must redden one assertion that prints the row to paste, not nine
assertions behind a shared derivation that dies before any of them run.
Review depth: full

## Wave 2 — T002: derive the capture through the pin

Goal: The armed writer must emit exactly the bytes the default pin holds, and refuse to write a candidate that would fail
its own pin, so a re-capture can never write silently-wrong bytes again.
Review depth: full

## Wave 3 — T003: name the recordings and refuse a premature census capture

Goal: Give every recording one manifest row naming its suite and its arm, and refuse an armed census capture whose
milestone Log is empty, because that capture reads the Log it counts.
Review depth: full

## Wave 4 — T004: measure what a field hosts

Goal: Write the record this milestone joins, from a page, before any join exists — with the default run read-only.
Review depth: full

## Wave 5 — T005: join the hosted control against the expected one

Goal: One pure join that tells a bound field from a mis-bound one and refuses to name a host it was not given.
Review depth: full

## Wave 6 — T006: one panel surface, every pin moved with it

Goal: Render exactly what the join returns on one route, with the route table, loader map, surface record and ordered pins
in the same landing.
Review depth: full

## Wave 7 — T007: re-derive the recordings and run the project verify

Goal: Re-derive both tree-counting recordings at the final head and prove the milestone did not break the build it
measures.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC3 | T003 | AC3 |
| SC3 | T004 | AC1 |
| SC3 | T004 | AC3 |
| SC1 | T005 | AC1 |
| SC2 | T005 | AC2 |
| SC4 | T006 | AC1 |
| SC4 | T006 | AC2 |
| SC4 | T007 | AC2 |

## Surface contract

### panel — T001

Entry: the panel's `schema` route, reached from the pane picker like every other surface, under
`apps/angular-ai-devtools/src/app/app.routes.ts`.

States: the four attribution states the join returns, rendered as it returns them.

Criteria: SC1, SC2

Walkthrough:

1. Open the `schema` route from the pane picker on a page whose form binds a field.
2. The pane names the state the field tree reports and states that the record carries no schema node for it.
3. Open a record that carries a node: the pane names the node and the input that node read, and nothing else.

## Held-out checks

One row per edge the intent declares, naming the task whose Verify runs the test that proves it.

| Edge | Task | Test |
|---|---|---|
| E1 | T005 | `scripts/field-binder.test.mjs` — bound names no finding |
| E2 | T005 | `scripts/field-binder.test.mjs` — two candidates, one named |
| E3 | T005 | `scripts/field-binder.test.mjs` — a foreign identity is cannot-tell |
| E4 | T005 | `scripts/field-binder.test.mjs` — hidden is not unbound |
| E5 | T006 | `scripts/panel-routes.test.mjs` — the pins move together |
| E6 | T005 | `scripts/field-binder.test.mjs` — one reader of a hosted control |
| E7 | T005 | `scripts/field-binder.test.mjs` — an unread host is an absence |
| E8 | T006 | `scripts/panel-routes.test.mjs` — no answer names a remedy |

A test named here is also named by the task's own suite, so an edge cannot be claimed without a run.

## Project verify

`node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test` —
run by the last task to land.
