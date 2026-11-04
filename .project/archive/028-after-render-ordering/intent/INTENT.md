# Intent — M028 after-render-ordering

Lane: feature
Milestone: after-render-ordering
Branch: gsd-path/M028
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A component whose `afterNextRender` reads `offsetWidth` can see `0` because layout has not produced a box yet, and a
developer reading the number has no way to tell whether the element was genuinely zero-width or whether the read ran
before something moved. The extension already subscribes to Angular's profiler through the page's own
`ɵsetProfiler`, but nothing orders those after-render events or joins them to the read that returned zero.

Measured before planning (`.project/research/evidence-m028-premise.md`): the profiler subscriber exists
(`extension/agent-main.js:417`), and the fixture has **no** `afterNextRender` read anywhere. The capability is present;
the subject must be created.

## Users

A developer inspecting an Angular page with the panel open, who has a `0` from an after-render measurement and needs
the order of events around it rather than a guess about layout.

## Success criteria

1. On the fixture, a component whose `afterNextRender` reads `offsetWidth` before layout produces a COR-1 finding
   naming the read, the phase it ran in, and the after-render events around it.
2. The finding is produced from the ordered profiler after-render events alone, with no new page-side instrumentation.
3. A read with no after-render event in the profiler list produces a "cannot tell" state naming that absence, rather
   than attributing the zero width to layout.
4. The panel renders the ordered chain and its explanation, and shows the "cannot tell" state when the list holds no
   after-render event for the read.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | ordering | held-out | `scripts/after-render-ordering.test.mjs` — the read is joined to the events around it and the chain names the phase |
| E2 | SC2 | boundary | held-out | `scripts/after-render-ordering.test.mjs` — removing the extension's subscriber leaves no finding, so nothing else supplied it |
| E3 | SC3 | empty | held-out | `scripts/after-render-ordering.test.mjs` — an empty event list yields "cannot tell" and never a layout attribution |
| E4 | SC4 | adjacency | held-out | `scripts/panel-after-render.test.mjs` — the surface renders the chain, and the absent-event state when the chain is empty |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC2 | N1: add a second profiler tap, a second append-only list, or any page-side instrumentation | criterion SC2 | COR-1 reads the one `ɵsetProfiler` list the page agent already records; a second source would make the ordering unverifiable |
| N2 | SC3 | N2: attribute a zero width to layout when only the read order was observed | criterion SC3 | the finding may state order, never a cause the observation cannot support |
| N3 | SC1 | N3: generate app code — a finding may name a modern Angular pattern and an official schematic only | criterion SC1 | the panel explains, it does not rewrite the app |
| N4 | SC4 | N4: render an explanation the ordered chain does not support | criterion SC4 | the surface must show the chain and the absence state, not prose about either |
| N5 | SC5 | N5: weaken a suite, skip a case, or tolerate a red gate to reach green | criterion SC5 | the gate is the milestone's floor |

## Scope

In: ordering the profiler after-render events within the single list; the COR-1 evidence (the read, its phase, the
events around it); the panel surface; a named "cannot tell" state.

Out: a second profiler tap or list; attributing zero width to layout; code generation; `@angular/animations`, SSR and
`angular/components`; DOM added to an inspected page (AR-3).

## Risks

- The fixture gains a route, so the panel's route-list pin in `chat-entry.component.spec.ts` and both control-skill
  feature manifests will go stale. The plan declares them rather than discovering them at the ship gate.
- The profiler reports what Angular reports; an after-render event that Angular does not emit cannot be ordered, which
  is why SC3 exists rather than a promise of completeness.

## Open questions

- Does the profiler emit after-render events in a stable order across Angular 22.1.8's dev build? The capture in T002
  settles it, and if it does not, SC3's state is the honest answer rather than an invented order.
