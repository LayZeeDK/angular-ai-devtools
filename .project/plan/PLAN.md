# PLAN — M067 formfield-binder

Milestone: M067 — formfield-binder · Branch: gsd-path/M067 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off

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

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC3 | T001 | AC3 |
| SC3 | T002 | AC1 |
| SC4 | T002 | AC2 |
| SC1 | T003 | AC1 |
| SC2 | T003 | AC2 |
| SC3 | T003 | AC3 |

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

Every edge this milestone carries is proved by the suite of the task that owns it, and that task's Verify runs that
suite. Nothing is held out: an edge whose proof sits outside the owning task's Verify would need a row here naming the
edge, the task and the test, and there is none.

## Project verify

`node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test` —
run by the last task to land.
