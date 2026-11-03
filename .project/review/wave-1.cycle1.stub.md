# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: b2eaa67d2eab80b117a0547af20e8b9156bef3a0

## T001 — Land Aria, CDK and Material in the counter fixture and re-pin its frozen build proof: pass

- ✅ `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && node --test scripts/ng-context-dev-build.test.mjs scripts/facade-dev-build.test.mjs` passed at 0a24a562 (verify ledger)

## T002 — Add the deliberately ambiguous harness target page to the counter fixture: pass

- ✅ `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm --prefix spikes/ng222-app run build -- --configuration development --output-path ../../tmp/m023-t002-dev && node --test spikes/ng222-app/src/app/app.routes.test.mjs tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs` passed at 01a3821e (verify ledger)

## T003 — Add the overlay, listbox, tabs and menu surfaces with the Aria rules they must satisfy: pass

- ✅ `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm --prefix spikes/ng222-app run build -- --configuration development --output-path ../../tmp/m023-t003-dev && node --test tests/held-out/fixture-aria-rule-mutation.test.mjs tests/held-out/fixture-aria-order.test.mjs tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs` passed at d7036e33 (verify ledger)

## Intent coverage

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.