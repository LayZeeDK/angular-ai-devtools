# INTENT — M066 schema-disabled-hidden

Lane: standard · Milestone: schema-disabled-hidden (M066) · Branch: gsd-path/M066
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a field is disabled or hidden: it names the state the field itself reports, the schema node that
declared it when the record carries one, and the input that node read — or states the absence it measured. It never
infers a state from validity, and never names a schema node it was not given.

## Verification target

The Insurance Portal first, on a form whose field is disabled by its own binding and on one disabled by a schema. The
fixture (`spikes/ng222-app`) is the fallback only where the portal carries no such form, and a verdict that uses it must
name the route tried and the artefact the portal lacks.

## Corrections

- C1 2026-11-23: measured before writing any criterion — `grep -rn 'signalForms|SignalForm|schema(' extension/*.js apps/angular-ai-devtools/src/app/*.ts` returns no match, and `@angular/forms` appears only in the root `package.json`, so nothing in this repository captures a Signal Forms schema today. The roadmaps's "naming the schema node that declared it" is therefore a record this milestone writes, not one it reads.
- C2 2026-11-23: `extension/field-state.js` already reads a field's own `disabled` reading and refuses to infer it from validity (its comment at `:71-73` states exactly that). This milestone extends that reading to the schema layer rather than adding a second field-state path, because two readers of the same fact is the defect M033 and M064 each paid for.
- C3 2026-11-23: a schema node is reachable only through the injector that holds the Signal Forms schema, in the shape M065 measured for `TitleStrategy` — the object is on a holder, not on a public service. Whether the portal has such a schema is measured in T001, not assumed here.

## Success criteria

1. A field whose disabled state a schema node declares produces a finding that names the state, the node and the input that node read; a mutant that reports the node without the input it read reddens it.
2. A field that is disabled by its own binding, with no schema node to name, reports that absence with its reason rather than naming a node the record does not carry; a mutant that infers a schema attribution reddens it.
3. The state and the attribution are read from a record this milestone writes, alongside the reading `extension/field-state.js` already performs — one source of the field's own state, asserted in one place.
4. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer carries no remedy, no cause and no node it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | A field that is enabled reports no finding, rather than a finding with an empty attribution that reads as a failure. |
| E2 | SC1 | ordering | criterion SC1 | Two schema nodes that could declare one state name the nearer node and say so, rather than listing both as the cause. |
| E3 | SC2 | boundary | criterion SC2 | A binding that disables a field with no schema in play reports `cannot-tell` with that reason, and never promotes the binding to a schema node. |
| E4 | SC2 | precision | criterion SC2 | A hidden field is not reported as disabled, and a disabled field is not reported as hidden; a mutant that collapses the two reddens by name. |
| E5 | SC3 | boundary | criterion SC3 | The task's Verify asserts the record is the only source of a schema attribution; a second reader reddens it. |
| E6 | SC4 | boundary | criterion SC4 | The route table, the loader map, the ordered path pins and the surface record move together; a mutant that omits one reddens naming it. |
| E7 | SC3 | boundary | criterion SC3 | A field whose own state was never read reports the absence of that reading, and never a state inferred from validity. |
| E8 | SC4 | precision | criterion SC4 | No answer names a remedy, a schematic, a cause or a node the record did not carry; a mutant that adds a remedy reddens it. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | name a schema node without the input that node read | criterion SC1 | The finding names the node and its input together, or states the absence. |
| N2 | SC2 | infer a state from the field's validity, or a schema attribution from a binding | criterion SC2 | Grounded in C2 and in `extension/field-state.js`'s existing refusal. |
| N3 | SC3 | read the inspected page's DOM or its network panel as its own evidence | criterion SC3 | Panel-only; the page is read through the agent's record. |
| N4 | SC3 | add page-side instrumentation or a second field-state reader | criterion SC3 | One source, asserted by the task's own suite. |
| N5 | SC4 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC4 | The answer states what it was given and nothing more. |
| N6 | SC4 | adopt an `angular/components` or Angular Material surface in the panel | criterion SC4 | A10/A11: those families are the subject this entry answers about, not the surface it renders on. |

## Constraints

- The panel surface is one route, one loader key and one join module; every suite that enumerates the route table is
  declared in the task that changes it, and `pinned-file` is read as a blocker rather than an advisory.
- A recording is written only by an explicit capture (`M066_CAPTURE=1`) and read by every default run.
- The record's own fields and the join's inputs are one list, asserted once.
- Every declared path must exist at the task's base or appear in its landing; `land` refuses the rest.
