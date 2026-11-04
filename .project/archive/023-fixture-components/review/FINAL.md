# Final Review — M023 fixture-components

Reviewed HEAD: 635029fc97aa0132ba140eed66a19a54134f1db7

Overall verdict: pass

## Success criteria

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.

- **Verdict**: met
- **Check**: `node --test tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-action.test.mjs`
- **Observed**: the root boundary asserts the rendered inclusion and exclusion of the caller's content, and a projection point that projects nothing reddens (T020); the predicate suite drives a named no-match (T013); the ambiguity suite reads attribute bindings so a distinguishing `[attr.data-slot]` reddens under N1 while an out-of-set attribute stays green (T021, T023); the action suite dispatches a real click and reads the rendered count (T013).
- **Reference**: `.project/review/wave-8.cycle1.md`, `.project/review/wave-9.cycle1.md`, `.project/review/final-gap-1.md`
- **Finding**: The structural assertion plus the browser check is the evidence for E1's browser leg; the rendered leg is proven by T020.
- **Fix direction**: none — the rendered boundary is asserted and the projection mutant fails.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.

- **Verdict**: met
- **Check**: `node --test tests/held-out/aria-rules.mjs`, `tests/held-out/fixture-aria-rule-mutation.test.mjs`
- **Observed**: five rules with per-attribute reddening mutants; `menu-trigger-controls` resolves the element it controls, so a trigger pointing at the listbox reddens naming both ids (T015); the order rule compares the real rendered iteration (T014).
- **Reference**: `.project/review/wave-4.cycle1.md`, `wave-5.cycle1.md`
- **Finding**: two rules still read the parsed template rather than the rendered tree, recorded as a carried caveat.
- **Fix direction**: read the rendered tree for the remaining two rules in the milestone that owns the harness.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.

- **Verdict**: met
- **Check**: `node --test tests/held-out/fixture-rebuild-idempotent.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `tests/held-out/fixture-explainers-answer.test.mjs`
- **Observed**: two builds each served and fetched on ephemeral ports, the install set measured between the cycles (T016); the four explainers hash to their pins (T008) and each answers a pinned question through the panel's own route table, so deleting a route reddens (T017).
- **Reference**: `.project/review/wave-5.cycle1.md`
- **Finding**: E6's pins have no recorded re-pin owner; recorded as a carried caveat.
- **Fix direction**: record the re-pin owner in the next milestone's brief.

### SC4 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check`; `npm test`
- **Observed**: the project Verify ran at this head and exited 0 (`prepare-final`, `635029fc`); `npm run check` exits 0 and `npm test` reports 60 pass / 0 fail and 594 pass / 0 fail.
- **Reference**: `.project/build/evidence.json`, `.project/review/wave-9.cycle1.md`
- **Finding**: the control-skill suites that failed the first three gate attempts were repaired in T018 and T019 by deriving the slot and replacing the netstat probe.
- **Fix direction**: none.

## Carried gaps

The following are recorded, non-criterion, and owned by the next milestone:

- Ten held-out suites read `.project/review/rounds/` and `.project/review/specs/`, which were never tracked; they are red at every head and no npm script reaches `tests/held-out`. High, carried as the next milestone's first task.
- The `22.2.5` against `22.2.2` version skew is recorded but not asserted.
- `expandControlFlow` handles only `@for`.
- `jsdom` is not declared, so six suites fail opaquely without `node_modules`.
- The action suite's performance comment names the wrong provenance.
- The ambiguity read is start-tags only; a later `attr` block on the same host would not be seen.
- A valueless `aria-labelledby` yields an empty name rather than an error.

T023 closed the final panel's one ship-blocking objection: the ambiguity suite no longer reads `.project/tasks/`, so archiving that directory cannot redden it.
- The ambiguity read is start-tags only; a later `attr` block on the same host would not be seen.
- The aria rules that read the parsed template rather than the rendered tree (A3).
- The action suite's observable effect is the component's own rendered state, so N7 is escaped rather than violated (A6).
