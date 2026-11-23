# INTENT — M062 outlet-explainer

Lane: standard · Milestone: outlet-explainer (M062) · Branch: gsd-path/M062
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why routed content appeared in the wrong outlet, or in none, naming the outlet name the route asked
for, the name the router state matched, and the route path — or states the absence the state cannot fill. It answers
from observables the agent records and never guesses a name from the rendered tree.

## Verification target

The Insurance Portal first, on a route that declares a named outlet. The fixture (`spikes/ng222-app`) is the fallback
only where the portal carries no such route, and a verdict that uses it must name the route tried and the artefact the
portal lacks.

## Corrections

- C1 2026-11-22: the roadmap calls "the outlet mapping in the router state and the outlet names declared in the component tree" the observable. Measured at `2ece0b80` and again at this head, `grep -ri "\boutlet\b" extension/` returns **0** matches; no record carries an outlet **name**, and the nearest value is `componentName: 'RouterOutlet'` in the demo record, which names a component. So the first task measures and records the outlet name the router state carries; the join is written after that record exists, never against a name inferred from the DOM.
- C2 2026-11-22: the roadmap's risk — an unnamed outlet and one explicitly named `primary` are the same outlet — is not hypothetical: no record distinguishes them either. A naive name comparison would therefore report a mismatch that does not exist, so the join must treat an absent requested name and `primary` as the same outlet and say so, rather than compare two strings that were never both recorded.
- C3 2026-11-22: the router record M033 reads carries the configured path set and the unmatched segment only. The outlet name is a new field on a new record, not a wider reading of that one, so a criterion that says "from the observables the agent already holds" is false for this milestone and is replaced below.

## Success criteria

1. A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the
   name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the
   red says which name moved.
2. An outlet the router state does not carry reports `cannot-tell` with the reason the name is missing, and the answer
   never names the nearest outlet in the rendered tree; a mutant that falls back to a DOM-derived name reddens it.
3. The outlet name is read from a record this milestone writes, with no new page-side instrumentation and no second
   read of the inspected page; the record's shape and the join's inputs are the same list, asserted in one place.
4. The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its
   copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | empty | criterion SC1 | A route with no outlet declared asks for `primary`, and the answer names `primary` rather than reporting an absence. |
| E2 | SC1 | ordering | criterion SC1 | Two outlets declared on one route name both, in declaration order, and never collapse to the last one read. |
| E3 | SC2 | boundary | criterion SC2 | An outlet named only in the template and never in the route config is reported as absent from the state, never as the template's name. |
| E4 | SC2 | encoding | criterion SC2 | An outlet name the record truncates is reported truncated, never completed from the rendered tree. |
| E5 | SC3 | boundary | criterion SC3 | The task's Verify asserts the outlet record is the only source of a name; a second read reddens it. |
| E6 | SC4 | boundary | criterion SC4 | The route table, the loader map and the copy record move together; a mutant that adds the surface without a loader reddens naming the key. |
| E7 | SC1 | precision | criterion SC1 | An outlet the state carries but the route never reached is not reported as a mismatch; a mutant that reports it reddens. |
| E8 | SC4 | precision | criterion SC4 | No answer names a fix, a schematic, a cause or an identity it was not given; a mutant that adds a remedy reddens. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | infer an outlet name from the rendered tree or from the component name | criterion SC1 | Grounded in C1; a name is a recorded field or it is absent. |
| N2 | SC2 | read the inspected page's DOM, a control or a value it renders | criterion SC2 | Panel-only; the page is read through the agent's records. |
| N3 | SC3 | add page-side instrumentation, a second tap or a second outlet read | criterion SC3 | One read, asserted by the task's own suite. |
| N4 | SC4 | name a remedy, a schematic, a modern-Angular pattern or an identity the record did not carry | criterion SC4 | The answer states what it was given. |
| N5 | SC4 | adopt an `angular/components` or Angular Material surface in the panel | criterion SC4 | A10/A11: those families are the subject this entry explains, not a dependency of the panel. |

## Constraints

- Everything happens in the existing panel application and the extension's content script; no new page-side
  instrumentation, no new dependency and no second tap (AR-3, AR-6).
- The join is a pure function of the records it is given; the surface renders its object and nothing else.
- Every suite that reads `research/raw/` and derives a shape — record-shapes censuses, the claims census, the
  byte-consistency scan, the gate records — must be declared at plan time, and both gate records are re-derived as the
  last commit before the final review.
- The project verify builds before it measures, and the build is uncacheable: `node scripts/ensure-sidecar-deps.mjs &&
  npx nx run angular-ai-devtools:build-extension && npm run check && npm test`, with no `--skip-nx-cache` and no
  `NX_DAEMON` workaround (`nx.json` and `scripts/nx-config-policy.test.mjs` hold that policy).
