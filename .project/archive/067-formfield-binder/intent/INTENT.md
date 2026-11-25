# INTENT — M067 formfield-binder

Lane: standard · Milestone: formfield-binder (M067) · Branch: gsd-path/M067
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a form field does not host the control its label names: it names the control the field actually hosts,
the field it is bound to, and the control the record expects — or states the absence it measured. It never infers a binding
from a label, and never names a control it was not given.

## Verification target

The Insurance Portal first, on a form whose field hosts a control. The fixture (`spikes/ng222-app`) is the fallback only
where the portal carries no such form, and a verdict that uses it must name the route tried and the artefact the portal
lacks.

## Corrections

- C1 2026-11-23: measured before writing any criterion — `grep -rn 'form-field|FormField' extension/*.js apps/angular-ai-devtools/src/app/*.ts` returns no match, and `package.json` declares neither `@angular/material` nor `@angular/cdk`. Nothing in this repository reads a form field's hosted control today, so "the control the binder resolved" is a record this milestone writes, not one it reads.
- C2 2026-11-23: the portal's own forms are PrimeNG controls (`p-datepicker`, `p-select`) per `research/raw/m066-schema-record.json`, not `mat-form-field`. A criterion that requires a Material binder to exist on the target would be unprovable there, so the milestone states the control a field hosts and the field it is bound to, and treats a missing expected control as a named absence rather than a defect.
- C3 2026-11-23: `extension/field-state.js` already reads a field's own state and T066's join reads a schema attribution from one record. This milestone adds a third reading of the same field objects, and all three must agree about which field is which — a second identity for a field is the defect M033, M064 and M066 each paid for.

## Success criteria

1. A field that hosts a control different from the one its record expects produces a finding naming both the hosted control and the expected one; a mutant that reports only the hosted control reddens it.
2. A field that is not a components field at all — a plain input, or an element with no hosting field — reports that absence with its reason rather than naming a control it was not given; a mutant that infers a host reddens it.
3. The hosted control and the field identity are read from a record this milestone writes, and the field identity is the one `extension/field-state.js` already uses, asserted in one place rather than derived twice.
4. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no control it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | A field that hosts the expected control reports no finding, rather than a finding with an empty comparison. |
| E2 | SC1 | ordering | criterion SC1 | When a field hosts two candidate controls, the one the field's own tree holds is named and the other is not. |
| E3 | SC3 | boundary | criterion SC3 | A field identity that `extension/field-state.js` does not produce is `cannot-tell`, never a second identity derived here. |
| E4 | SC2 | precision | criterion SC2 | A hidden field is not reported as unbound, and an unbound field is not reported as hidden; a mutant that collapses the two reddens by name. |
| E5 | SC4 | boundary | criterion SC4 | The route table, the loader map, the ordered path pins and the surface record move together; a mutant that omits one reddens naming it. |
| E6 | SC3 | boundary | criterion SC3 | The record is the only source of a hosted control; a second reader reddens the task's own suite. |
| E7 | SC2 | boundary | criterion SC2 | A field whose host was never read reports the absence of that reading, and never a control inferred from the label. |
| E8 | SC4 | precision | criterion SC4 | No answer names a remedy, a schematic, a cause or a control the record did not carry; a mutant that adds a remedy reddens it. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | name an expected control without the hosted one | criterion SC1 | Both are named together, or the absence is stated. |
| N2 | SC2 | infer a binding from a label, a placeholder or a CSS class | criterion SC2 | Grounded in C1: nothing in this repository reads a binding today. |
| N3 | SC3 | read the inspected page's DOM or its network panel as its own evidence | criterion SC3 | Panel-only; the page is read through the agent's record. |
| N4 | SC3 | add page-side instrumentation or a second field identity | criterion SC3 | One identity, asserted by the task's own suite. |
| N5 | SC4 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC4 | The answer states what it was given. |
| N6 | SC4 | adopt an `angular/components` or Angular Material surface in the panel | criterion SC4 | A10/A11: those families are the subject this entry explains, not the surface it renders on. |

## Constraints

- The panel surface is one route, one loader key and one join module; every suite that enumerates the route table is
  declared in the task that changes it, and a `pinned-file` warning is read as a blocker.
- A recording is written only by an explicit capture (`M067_CAPTURE=1`) and read by every default run.
- A suite this milestone adds owes the census its `SUITE_DIFF_REASONS` row in the same task.
- Every declared path must exist at the task's base or appear in its landing.
