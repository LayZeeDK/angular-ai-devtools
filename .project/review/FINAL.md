# Final Review — M023 fixture-components

Reviewed HEAD: 18f0f37dc0fef56930b7453f8789c682f09e1bb0
Overall verdict: blocked

<!-- Evidence reuse: the project Verify passed at this head (exit 0). The fixture proof pins are fresh.
     Two gap reviewers ran in isolated sidecars at this head; both returned `gaps`, and this round judge the
     seven repair waves rather than the original build. Four of the previous round's gaps are closed by
     repair; three were re-scoped rather than closed, and two new high-severity holes were found in the
     harness proofs. Verdicts below are read from the suites, not from the task Logs. -->

## Success criteria

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.

- **Verdict**: not-met
- **Check**: E1 is green for a projection point that projects nothing — `<ng-content select=".none">` passes all three cases, because they assert the tag, its position and the caller's literal text, never what is projected. E2's `readAttrs` sees only `name="value"` literals, so `[attr.data-slot]` on one host and `'two'` on the other is a live N1 violation the suite cannot see; the same reader reddens on a harmless literal attribute added to one host, so it is both blind and brittle. E3 drives a `matchItems` the suite itself defines. E4 is genuinely behavioural (a no-op `advance()` reddens it), but its only observable is the component's own `{{ count() }}` interpolation, and its header claims the workspace core is the same `signal()` implementation the fixture ships when the workspace is on `~22.1.0` against the fixture's 22.2.2.
- **Observed**: the criterion-named mutants for the two new high gaps were run by a reviewer, not taken from a Log: `select=".none"` passes, and `[attr.data-slot]` passes.
- **Reference**: `tests/held-out/fixture-harness-root-boundary.test.mjs`; `fixture-harness-ambiguity.test.mjs`; `fixture-harness-predicate.test.mjs`; `fixture-harness-action.test.mjs:73-74`; `.project/review/final-gap-1.md`; `.project/review/final-gap-2.md`
- **Finding**: two high-severity holes, both of the shape this milestone keeps finding — the assertion matches a representation of the thing rather than the thing.
- **Fix direction**: E1 must assert what is projected (a marker inside and one outside the root, read from the rendered result), and E2 must read attribute bindings as well as literals while tolerating an attribute the harness does not match on.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.

- **Verdict**: met
- **Check**: the removal half holds — a per-attribute mutant reddens exactly one rule and leaves its siblings green. The order half now bites for real: reversing the fixture's on-disk `@for` iteration reddens both the order suite and the rule `listbox-option-order`, and the reviewer ran that mutant rather than reading the Log. The rule that accepted any id was repaired by T015 and now names the expected and the actual id.
- **Observed**: five rules green, each with a mutant that reddens it; the any-id defect is closed.
- **Reference**: `tests/held-out/aria-rules.mjs`; `fixture-aria-order.test.mjs`; `fixture-aria-rule-mutation.test.mjs`; `.project/review/wave-5.cycle1.md`
- **Finding**: none against the criterion. Two carried warnings: the rules live only in the held-out corpus with nothing linking N23's shipped rules to them, and the attribute rules still read parsed source rather than the rendered tree, which is latent while the fixture's attributes are static.
- **Fix direction**: none for the criterion; record a ruling for the source-reading scope if it is to stand.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.

- **Verdict**: met
- **Check**: T016 made the second cycle actually serve — an ephemeral `127.0.0.1` port, the entry fetched and byte-compared across cycles, the install set measured **between** the cycles rather than beside them, and a duplicate-package mutant reddens at that measurement. T017 asks each of the four explainers a pinned question through the panel's own route table and asserts the answer; deleting the `di-doctor` route reddens it, naming the explainer that can no longer be reached. The hash pins remain as N2's anti-tamper guard.
- **Observed**: both halves now observe behaviour a user could observe: a document served, an answer given.
- **Reference**: `tests/held-out/fixture-rebuild-idempotent.test.mjs`; `tests/held-out/fixture-explainers-unchanged.test.mjs`; `.project/review/wave-5.cycle1.md`
- **Finding**: two carried risks, neither criterion-failing: a fresh clone cannot run E7 until `packages/ai-devtools-companion/dist` is built (it fails as `TS2307`, i.e. as a product defect), and three E6 cases mutate `apps/angular-ai-devtools/src/app/` in place.
- **Fix direction**: make E7 provision what it needs or fail with a named cause; move the in-place mutations to a copy.

### SC4 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: the project Verify at this head exits 0. Three gate attempts preceded it, each failing on a control-skill test that depended on its environment: a slot hashed from a checkout path, then a port probe blind because `netstat` exposes only the host table. T018 derived the slot; T019 replaced the probe with a loopback bind. The suite now passes 150/150 from the primary and from a worktree-shaped copy.
- **Observed**: green, with the three failures that preceded it recorded rather than smoothed.
- **Reference**: `.project/build/verify-ledger.jsonl`; `.project/review/wave-6.cycle1.md`; `wave-7.cycle1.md`
- **Finding**: the probe has a second shape the reviewer measured — only the `127.0.0.1` leg is asserted, so a listener bound only on `::1` reads free, and every non-`EADDRINUSE` bind error is read as "free". A warning against this criterion, since no criterion binds it.
- **Fix direction**: assert both legs, and separate "free" from "cannot tell".

## Gaps carried into the record

Both gap reviewers returned `gaps`. Beyond the two above: the attribute Aria rules read source with no recorded ruling; the `22.2.5`/`22.2.2` skew is recorded but no test pins the component-package line; E6's pins are a tripwire with no owner for a re-pin; and the repaired suites are over-tight in places a legitimate later change reddens (`@if (false)` keeps both order cases green because only `@for` is expanded, `readScope` asserts on an unresolvable `readonly`, a count is pinned in a failure message).

## The shape of this milestone

Seven repair waves, each closing what the previous review found. Four of the previous round's gaps are genuinely closed; three were re-scoped. The reviewers name the pattern precisely: when a gap cannot be fixed in-process, the exit has been a comment, a warning or an open question rather than a recorded ruling — honest documentation, but not closure. The two high findings this round are the same shape as the ones before them: an assertion matching a representation of the thing rather than the thing.
