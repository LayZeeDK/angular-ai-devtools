# INTENT — M065 title-input-binding

Lane: standard · Milestone: title-input-binding (M065) · Branch: gsd-path/M065
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why the document title, or a value bound from the route, did not follow the navigation: it names the
title strategy in effect, the value the route implies, the value the document carries and the last title write the agent
observed — or states the absence it measured. It never names a writer, a cause or a remedy it did not observe.

## Verification target

The Insurance Portal first, on a route whose title is set by the app's `TitleStrategy` and on a route that binds data the
title reads. The fixture (`spikes/ng222-app`) is the fallback only where the portal carries no such route, and a verdict
that uses it must name the route tried and the artefact the portal lacks.

## Corrections

- C1 2026-11-23: measured before writing any criterion — `grep -rn 'document\.title|TitleStrategy|titleStrategy|routerState' extension/*.js` returns no match outside a test helper, so the record carries no title, no strategy and no route-bound value today. A criterion phrased "from the observables the agent already collects" would be false, so this milestone writes the record it reads, exactly as M064's C3 recorded for its own record.
- C2 2026-11-23: the roadmap says "naming the strategy in effect and the last writer", but nothing in the browser names the writer: `TitleStrategy` has no who-wrote-last query and `document.title` is a plain string. The claim is narrowed to what is observable — the strategy class the injector resolves, and the last title write the agent itself observed, with the navigation it followed. A write that happened before the agent attached reports `cannot-tell` with that reason rather than guessing an author.
- C3 2026-11-23: "a value bound from the route did not follow the navigation" is only meaningful if the app binds one. The record therefore carries the activated route's data as the injector exposes it, and an absence when the route binds nothing; whether the portal has such a route is measured in T001, not assumed here.

## Success criteria

1. A route whose title the strategy sets produces a finding that names the strategy class the injector resolved, the
   title the document carries and the title the route implies when they differ; a mutant that reports the strategy from a
   constant reddens it.
2. A title write the agent did not observe before it attached reports `cannot-tell` with its reason, and no answer names
   an author, a cause or a remedy it did not observe; a mutant that infers the writer reddens it.
3. The title observables are read from a record this milestone writes, through the injector the agent already resolves
   and one title observation — no second instrumentation path and no read of the page's rendered title as its own
   evidence; the record's fields and the join's inputs are the same list, asserted in one place.
4. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every
   route-table suite moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | A route whose title already matched reports no finding, rather than a finding with an empty difference that reads as a failure. |
| E2 | SC1 | ordering | criterion SC1 | Two navigations in one capture name the later write as the last one observed, and the earlier stays in the record rather than being overwritten. |
| E3 | SC2 | boundary | criterion SC2 | An agent attached after the last title write reports `cannot-tell` with that reason, and never promotes the document's current title to the last observed write. |
| E4 | SC2 | precision | criterion SC2 | A finding never names the strategy as the writer of a write it did not observe; a mutant that attributes the write to the strategy reddens by name. |
| E5 | SC3 | boundary | criterion SC3 | The task's Verify asserts the record is the only source of a title observation; a second read reddens it. |
| E6 | SC4 | boundary | criterion SC4 | The route table, the loader map, `app.spec.ts`, the chat-entry lists and the fixture's route count move together; a mutant that omits one reddens naming it. |
| E7 | SC3 | boundary | criterion SC3 | A route that binds no data reports the absence, and never an empty object that reads as a bound value. |
| E8 | SC4 | precision | criterion SC4 | No answer names a fix, a schematic, a cause or a strategy the record did not carry; a mutant that adds a remedy reddens it. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | report a title strategy it did not resolve from the injector, or a difference between two titles it did not both read | criterion SC1 | The finding names the class the injector returned and the two values the record carries. |
| N2 | SC2 | name an author, a cause or a remedy for a title write it did not observe | criterion SC2 | Grounded in C2; the answer states what the record carried and when the observation began. |
| N3 | SC3 | read the inspected page's rendered title or its network panel as its own evidence | criterion SC3 | Panel-only; the page is read through the agent's record. |
| N4 | SC3 | add page-side instrumentation, a second tap or a second title observer | criterion SC3 | One observation, asserted by the task's own suite. |
| N5 | SC4 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC4 | The answer states what it was given and nothing more. |
| N6 | SC4 | adopt an `angular/components` or Angular Material surface in the panel | criterion SC4 | A10/A11: those families are the subject this entry answers about, not the surface it renders on. |

## Constraints

- The panel surface is one route, one loader key and one join module; the route table and every suite that enumerates it
  are declared in the task that changes them, with `pinned-file` read as a blocker rather than an advisory.
- A recording is written only by an explicit capture (`M065_CAPTURE=1`) and read by every default run.
- The record's own fields and the join's inputs are one list, asserted once; a second list is the defect M033 and M064
  each paid for.
- Every declared path must exist at the task's base or appear in its landing; `land` refuses the rest.
