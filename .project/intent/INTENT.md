# Intent — M031 cross-field-validation

Lane: feature
Milestone: cross-field-validation
Branch: gsd-path/M031
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A form whose submit button is disabled gives no account of why. When one field is fixed and submit stays disabled, the
developer cannot tell whether another field is invalid or whether a rule that spans fields is holding it — the browser
shows a disabled button and nothing else. Signal Forms exposes each field's validity and errors, and the fixture's Angular
version ships them, but nothing in the extension reads a form, so the panel has nothing to explain.

Measured before planning (`.project/research/m031-forms-evidence.md`): the fixture contains **no form at all**, and the
page agent captures no field state. `packages/forms/signals` exists at `v22.2.0` and `@angular/forms` is installed, so the
capability is present; the subject must be created and the read must be measured.

## Users

A developer inspecting an Angular page with the panel open, who has fixed the field they thought was wrong and still
cannot submit, and needs to know which field or which rule is holding the button.

## Success criteria

1. On the fixture, a form with two validatable fields and a cross-field rule produces a FRM-1 finding naming each field's
   validity, the field's own errors, and whether submit is disabled.
2. The field state is read through the page agent's existing `window.ng` surface, with no second instrumentation path and
   no patch of the form.
3. A form whose fields are all individually valid while submit stays disabled produces a "cannot tell" state naming that a
   rule outside the field states is holding it, rather than naming a rule the finding cannot see.
4. The panel renders the field set, each field's state and the submit state from a short fact list, and shows the
   "cannot tell" state.
5. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | ordering | held-out | `scripts/field-state.test.mjs` — each field's validity and its own errors, with the submit state |
| E2 | SC2 | boundary | held-out | `scripts/field-state.test.mjs` — with the read removed, no finding is produced |
| E3 | SC3 | empty | held-out | `scripts/field-state.test.mjs` — all fields valid with submit disabled yields "cannot tell", never an invented rule |
| E4 | SC4 | adjacency | held-out | `scripts/panel-fields.test.mjs` — the surface renders the field set and the cannot-tell state |
| E5 | SC5 | boundary | criterion SC5 | the project gate runs at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC2 | N1: patch the form, subscribe to its value changes, or add a second page-side instrumentation path | criterion SC2 | FRM-1 reads the field state the app already computes, through the hook surface the agent already has |
| N2 | SC3 | N2: name the cross-field rule, or state why a field is invalid beyond the error it carries | criterion SC3 | the rule is application code; its verdict arrives as a boolean, so naming it would be inventing a cause |
| N3 | SC1 | N3: reproduce a field's value in the finding beyond the facts the fact list carries | criterion SC1 | the panel explains validity, it does not echo what the user typed |
| N4 | SC4 | N4: render an explanation the fact list does not support | criterion SC4 | the surface shows the facts and the absence state, not prose about either |
| N5 | SC5 | N5: weaken a suite, skip a case, or tolerate a red gate to reach green | criterion SC5 | the gate is the milestone's floor |

## Scope

In: a fixture form with two validatable fields, one cross-field rule and a disabled-bound submit; reading each field's
validity and its own errors; the submit state; the panel surface; a named "cannot tell" state for a form whose validity is
computed outside the field states.

Out: naming the cross-field rule; reproducing field values; `NgModel`, `FormGroup` and every template-driven path; code
generation; `@angular/animations`, SSR and `angular/components`; DOM added to an inspected page (AR-3).

## Corrections

- **The roadmap's premise is half false.** It cites "the Signal Forms field states" as though a form existed; the fixture
  has none, and the page agent reads no form. SC1 is written for a subject this milestone creates, measured at
  `.project/research/m031-forms-evidence.md`.
- **"The cross-field rule that keeps submit disabled" is narrowed.** A field exposes its own validity and errors; a
  cross-field rule is application code whose verdict arrives as a boolean. SC3 therefore reports the case as
  "cannot tell" and N2 forbids naming the rule — the same shape M029 and M030 each enforced with a mutant.

## Risks

- The fixture gains a form, so both control-skill feature manifests, the panel's route pin, the dev-build recordings and
  the verdict claims will all go stale. Every one of them is declared in the plan's recordings task rather than discovered
  at the ship gate — five separate defects of that shape were found in M030.
- Whether a form's field state is reachable through `ng.getComponent` is unmeasured. T001 measures it, and if it is not
  reachable the "cannot tell" state is the honest answer rather than an invented read.

## Open questions

- Does `ng.getComponent` expose a Signal Forms field tree on a routed element? T001 records what it finds; the walk in
  T002 is built against that recording, not against an assumption.
