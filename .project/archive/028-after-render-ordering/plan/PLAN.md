# Plan — M028 after-render-ordering

Milestone: after-render-ordering
Branch: gsd-path/M028

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the fixture subject and the finding

Goal: The fixture has no `afterNextRender` read at all, so SC1's subject must be created: T001 adds a component that reads `offsetWidth` in an after-render hook and registers its route. T002 then orders the profiler after-render events around that read, from the list the page agent already records, and returns the `cannot-tell` state when the list carries no event for it.

Review depth: full

T001 and T002. The fixture gains a component whose `afterNextRender` reads `offsetWidth` before layout, with its route,
and the finding is computed from the profiler after-render events the page agent already records.

## Wave 2 — the surface and the recordings

Goal: T003 renders the ordered chain and the absence state on the panel, adding no prose the chain does not support. T004 then re-records what the fixture change invalidated — both control-skill feature manifests, the ng-context dev-build recording, and the M028 verdict record — proving each by reverting it.

Review depth: full

T003 and T004. The panel renders the ordered chain and the "cannot tell" state; then every recording the fixture change
invalidated is re-recorded with a mutant.

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/after-render-ordering.test.mjs |
| E2 | T002 | scripts/after-render-ordering.test.mjs |
| E3 | T002 | scripts/after-render-ordering.test.mjs |
| E4 | T003 | scripts/panel-after-render.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T002 | AC2 |
| SC4 | T003 | AC1 |
| SC5 | T004 | AC1 |

## Surface contract

### panel — T003

Criteria: SC4
Entry: open the panel, select the after-render finding produced for the fixture route added in T001; the same surface
is reachable from the tool group's after-render row.
States: empty shows an explicit "cannot tell" state naming that the profiler list carried no after-render event for
the read, never a layout attribution; loading shows the chain being assembled; error shows the `unknown` state naming
the unreadable event and saying the finding has no ordering for it; success shows the read, its phase and the ordered
events around it, taken from the chain with no added prose.
Walkthrough:
1. Load the fixture's after-render route, open the panel, and confirm the finding names the read and the phase it ran in.
2. Confirm the ordered chain matches the profiler events the page agent recorded, in emission order, with no prose the chain does not support.
3. Point the surface at a read with no after-render event and confirm it shows the cannot-tell state naming that absence, rather than attributing the zero width to layout.
4. Confirm the panel adds no DOM to the inspected page.
