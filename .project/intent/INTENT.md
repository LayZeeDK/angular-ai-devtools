Lane: standard
Milestone: signal-forms-doctor
Branch: gsd-path/M037
Review panel: full
Finding skeptics: 2
Surfaces: panel

# Intent — M037 signal-forms-doctor

## Problem

A developer looks at an invalid form and cannot tell why submit is disabled. The panel already renders each field's
validity and its own errors, and the root's error kind, from M031. What it does not report is the **submit state** and
what explains it: `research/raw/m031-field-state.json` contains zero `disabled` and zero `submit` occurrences.

Spike S9 settled the shape, and it narrows the milestone. A cross-field rule is declared on the form root
(`spikes/ng222-app/src/app/field-form-page.ts:29-31`, `validate(f, ...)`), the resulting error lands on
`root.errors[].kind`, and the fixture's submit button binds `[disabled]="fieldForm().invalid()"`
(`field-form-page.ts:18`). So **the state that explains a disabled submit is the root field's `invalid`**, and a field
error alone never explains it -- a form can be invalid at the root with every field valid, which is exactly the
cross-field case.

## Users

A developer debugging a form that will not submit, and a reviewer checking that the panel does not blur a field's own
error together with a rule that spans fields.

## Success criteria

1. On the fixture, a form whose submit is disabled produces a finding naming the form, the submit state, and the
root field's error kinds when the root carries any -- and naming no rule, element or remedy the fact list does not
carry.
2. A field's own error and a root-level (cross-field) error are reported as different things, in different places,
   with different words; neither is merged into the other.
3. Both are produced from what the page already exposes through `ng.getComponent`, with no new page-side
   instrumentation and no build-output or dev-server dependency.
4. Where the record carries no submit state, the module reports "cannot tell" with that reason rather than inferring
   a disabled submit from field validity.
5. The panel renders the field set, the submit state and the root kind, and renders nothing it was not given.
6. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC4 | empty | held-out | no submit state in the fact yields no finding |
| E2 | SC1 | precision | held-out | a root error kind is named, and no rule text is invented |
| E3 | SC2 | adjacency | held-out | a field error and a root error stay in different fields |
| E4 | SC1 | boundary | held-out | submit enabled with a root error present is reported as enabled |
| E5 | SC5 | encoding | held-out | an unrenderable fact yields cannot-tell, never blank |
| E6 | SC6 | none | dismissed | the project gate |
| E7 | SC3 | boundary | held-out | a fact carrying extra fields changes nothing the join reads |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name a rule, form control or remedy the fact list does not carry | criterion SC1 | the page states states, not intentions |
| N2 | SC2 | merge a field error into the root kind, or the reverse | criterion SC2 | they answer different questions |
| N3 | SC4 | infer a disabled submit from field validity | criterion SC4 | a field-valid, root-invalid form is the normal case here |
| N4 | SC5 | render a state label the join did not produce | criterion SC5 | the pane is a view of the fact, not a second opinion |
| N5 | SC3 | read a build log, subscribe to a new hook, or depend on how the app is served | criterion SC3 | the oracle is the page |
| N6 | SC6 | weaken a pin or widen a tolerance to pass the gate | criterion SC6 | a moved pin is evidence |

## Scope

- In: the submit state and its explanation; root kind rendering; the distinction from a field error; the panel.
- Out: the field set and the root kind themselves (M031 ships them); async or pending rules (S9 did not measure
  them); a field that is independently disabled (the fixture binds only the root).

## Corrections

**2026-11-08 — the roadmap's own sentence overstates the milestone.** The entry says "Build the Signal Forms doctor:
why this form is invalid, field by field and at the root." Measured: M031 already ships the field set, each field's
own errors and the root's error kind (`extension/field-state.js`, `research/raw/m031-field-state.json`). The missing
piece is the **submit state** -- zero occurrences in that recording. The criteria above are written for the additive
milestone, not for a rebuild.

## Risks

- The submit state may be a template binding rather than form state, so it may not be readable from `ng.getComponent`
  at all; criterion 4 and T001 exist to find that out before anything depends on it.
- A form can bind disabled to something else entirely; the module must report what it read, never what it assumes.

## Open questions

- [RESEARCH] Which submit-state shape does the fixture's binding expose through the component instance, if any?
- [RESEARCH] Does the recorded fact tree carry the root field's invalid flag separately from its error kinds?
- [RESEARCH] Can a form be submit-enabled while the root carries an error, and does the fixture produce that case?
