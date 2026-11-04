# Research — M023 fixture-components

This record consolidates what the inspect phase gathered for M023. The raw evidence it summarises is
`research/evidence-codebase.md` (the codebase sweep) and `research/DOCS-AUDIT.md` (the documentation audit of
the 144 documents that mention the harness, the Aria rules and the fixture). The decisions taken from it are
`research/SYNTHESIS.md`.

## What the fixture already was

`spikes/ng222-app` is the counter fixture: one route, one component, Angular 22.2.2, a frozen dependency list
asserted verbatim by `scripts/ng-context-dev-build.test.mjs`. It had no harness surface and no design-system
packages, so the roadmap's harness family (HAR-1 to HAR-4) and the menu rules N23 names had nothing to read.

## What the milestone needed to add, and why each piece is required

| Need | Why the intent requires it | Evidence |
|---|---|---|
| A harness target with content outside the component root | HAR-1's root-boundary case (SC1, E1) | `evidence-codebase.md`: no projection boundary existed in the fixture |
| A predicate case that can match nothing | HAR-2's empty case (SC1, E3) | the harness family's own docs describe a named no-match; nothing exercised it |
| Two hosts matching on every attribute the harness reads | HAR-3's ambiguity case (SC1, E2) and prohibition N1 | N1 forbids making the case resolvable, which is the failure mode that passes for the wrong reason |
| An action case with an observable effect | HAR-4 (SC1) and prohibition N7, which forbids asserting implementation state | the harness observes the effect, not the signal |
| A listbox, a menu, tabs and an overlay | N23's rules (SC2, E4, E5) | the rules need a rendered surface to read |
| The four shipped explainers answering unchanged | SC3 and prohibition N2, which puts changing an explainer out of scope | the roadmap: an explainer that moves to meet a fixture proves nothing |
| Two build cycles | E7's idempotency | a second build is the only evidence the pin is stable |

## What the research settled before planning

1. **The component packages are a separate line from the core.** `@angular/aria`, `@angular/cdk` and
   `@angular/material` at 22.2.5 against a 22.2.2 core was judged runtime-compatible by their peer ranges.
   The final review records the skew as a risk rather than a breach; the intent treats a drifted
   component-package line as a product defect, so it stays open.
2. **The fixture's frozen proof had to be narrowed, not deleted.** Freezing the whole dependency list verbatim
   would have failed the moment three packages were added, so the proof names the three packages and refuses a
   fourth, which keeps the pin meaningful.
3. **The design system stays out of the panel.** Prohibition N3 keeps `@angular/*` design-system packages out of
   the panel's dependencies, build configuration and bundle; they belong to the fixture only.
4. **Every edge needs a mutant.** The interaction this programme keeps relearning: a held-out suite that cannot
   fail reports coverage it does not have. Eight such suites reached the final review of this milestone, and
   the review blocked on them.

## Open questions carried out of this research

- Whether the 22.2.5/22.2.2 skew must be reconciled when a matching core is available (`final-gap-1.md`).
- Whether the Aria rules should read the rendered DOM rather than parsed source (`final-gap-2.md`).
