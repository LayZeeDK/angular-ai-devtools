# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: b2eaa67d2eab80b117a0547af20e8b9156bef3a0

## T001 — Land Aria, CDK and Material in the counter fixture and re-pin its frozen build proof: pass

- ✅ `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && node --test scripts/ng-context-dev-build.test.mjs scripts/facade-dev-build.test.mjs` passed at 0a24a562 (verify ledger)

Warnings (non-blocking):
- Component packages are pinned at 22.2.5 while the fixture's Angular core resolves to 22.2.2; this is a patch skew within the 22.2 line, acceptable because the component packages' peer ranges accept `^22.0.0` and `@angular/material` 22.2.5 declares an exact peer on `@angular/cdk` 22.2.5, but it should be reconciled if a 22.2.5 core is available (INTENT constraint on version alignment).
- The frozen dependency lists were widened to name the three component packages; the exact-key assertion still refuses a fourth, so the pin was re-pinned rather than weakened.

Contract violations (blocking):
- none

## T002 — Add the deliberately ambiguous harness target page to the counter fixture: pass

- ✅ `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm --prefix spikes/ng222-app run build -- --configuration development --output-path ../../tmp/m023-t002-dev && node --test spikes/ng222-app/src/app/app.routes.test.mjs tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs` passed at 01a3821e (verify ledger)

Warnings (non-blocking):
- The two `app-harness-probe` hosts differ only by `id`; `id` is not an attribute the harness matches on and prohibition N1 forbids a distinguishing matched attribute, and E2 asserts the attribute maps key by key, so the ambiguity is real and sufficient for HAR-3.

Contract violations (blocking):
- none

## T003 — Add the overlay, listbox, tabs and menu surfaces with the Aria rules they must satisfy: pass

- ✅ `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm --prefix spikes/ng222-app run build -- --configuration development --output-path ../../tmp/m023-t003-dev && node --test tests/held-out/fixture-aria-rule-mutation.test.mjs tests/held-out/fixture-aria-order.test.mjs tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs` passed at d7036e33 (verify ledger)

Warnings (non-blocking):
- The mutation test removes each rule's attribute from the first matching surface tag and confirms only that rule fails; the per-attribute isolation holds for the four declared rules, so the claimed mutant is real.

Contract violations (blocking):
- none

## Intent coverage

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.: pass
- ✅ T002 adds `/components` with two `app-harness-probe` hosts identical in every matched attribute except `id`, projected content inside and an equal sibling outside the probe root, one `alpha` item and no `absent` item, and a `data-action="advance"` button whose effect is the rendered `data-state="count"` text; held-out E1-E3 tests pass.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.: pass
- ✅ T003 mounts the listbox, tabs, menu and CDK overlay surfaces and `tests/held-out/aria-rules.mjs` declares four rules whose mutation test reddens exactly the removed attribute's rule while siblings stay green.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass
- ✅ T001/T002/T003 development builds passed in their verify runs and the fixture's frozen build proof stayed green; no explainer question, answer or selector was changed.

## Fixed since last cycle
- none

## Summary for orchestrator
- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: component package patch skew (22.2.5 vs core 22.2.2); ambiguity rests on `id` not being a matched attribute; mutation coverage is limited to the four declared listbox/menu rules