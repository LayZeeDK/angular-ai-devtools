# Final Review — M023 fixture-components

Reviewed HEAD: 98f2410da0c0d71227d2ec4356eb7a1c51c9b46f
Overall verdict: blocked

<!-- Evidence reuse: the project Verify passed at this head (exit 0 at 98f2410…, recorded by
     workflow_run.py prepare-final, which also regenerated .project/review/final-gap-1.md) and was
     not re-run for this review. The build-time head gate was run separately at d44b1cd: 339 + 60 +
     594 tests, build-extension 532.47 kB. Two gap reviewers ran in isolated sidecars at this head;
     both returned `gaps`. The surface walkthrough below is performed over the landed diffs and the
     held-out suites themselves, and states plainly that no browser was driven for this review. -->

## Success criteria

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.

- **Verdict**: not-met
- **Check**: the fixture half is real. `spikes/ng222-app` serves `/components` with two `app-harness-probe` hosts that differ only by `id` (T002, `01a3821`), and the Aria, CDK and Material surfaces landed at `d7036e3` with the fixture's dev bundle re-recorded at 1,899,687 B. What does not hold is the proof half. Gap review 2 read each held-out suite and asked what single change would leave it green; three of the four answered badly. E1 (`fixture-harness-root-boundary.test.mjs`) asserts source text — the presence of `<ng-content` and a count of the string "projected content" — and never renders the boundary, so moving the projection point leaves it green. E2 (`fixture-harness-ambiguity.test.mjs`) never excludes `id` from the attribute set the harness matches on, so adding a distinguishing `id` to one host — precisely prohibition N1 — would resolve the ambiguity with the suite still green. E3 (`fixture-harness-predicate.test.mjs`) never exercises a non-matching predicate reporting a named no-match, so the silent-empty-pass case the edge exists for is unproven.
- **Observed**: T003's per-attribute mutation is genuine and was re-read at this head (a per-attribute mutant reddens exactly one rule over the listbox, tabs and menu surfaces); it covers SC2's rules, not SC1's edges. HAR-3's ambiguity exists in the fixture and is unproven in the tests.
- **Reference**: `spikes/ng222-app/src/app**` (T002, T003); `tests/held-out/fixture-harness-root-boundary.test.mjs`; `tests/held-out/fixture-harness-ambiguity.test.mjs`; `tests/held-out/fixture-harness-predicate.test.mjs`; `tests/held-out/fixture-harness-action.test.mjs`; `.project/review/final-gap-2.md`; `.project/review/wave-1.cycle1.md` (T002, T003)
- **Finding**: E1, E2 and E3 cannot fail for the defect they name. E2 is the sharper one: it is the only guard against N1, and N1 is the prohibition this milestone exists to respect. The action case (E4 in the intent's table, `fixture-harness-action`) asserts `signal()`/`count()` implementation state rather than the observable effect, which N7 forbids.
- **Fix direction**: render each case rather than parse it. E1 asserts the rendered boundary; E2 asserts the match set excludes `id` and reddens when one host gains a distinguishing attribute; E3 drives a non-matching predicate to its named no-match. Each needs a named mutant that reddens it, in the shape T003 already uses.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.

- **Verdict**: not-met
- **Check**: the fixture half holds and the mutation half holds. The surfaces landed (T003, `d7036e3`) and the per-attribute mutant reddens exactly one rule. Where it thins out is that the mutation covers the four declared listbox and menu rules while the tabs and overlay rules stay unguarded, and gap review 2 found the Aria rules evaluate parsed source rather than the rendered DOM, with `listbox-accessible-name` checking presence only. E5 (`fixture-aria-order.test.mjs`) is a tautology: it compares a reversed copy against itself, so it passes for any declared order.
- **Observed**: the "at least one rule that fails when its attribute is removed" clause is satisfied; the ordering edge (E5) is not, and the rules' evaluation over parsed source means a rule can hold while the rendered tree breaks it.
- **Reference**: `spikes/ng222-app/src/app**` (T003); `tests/held-out/fixture-aria-rule-mutation.test.mjs`; `tests/held-out/fixture-aria-order.test.mjs`; `.project/review/final-gap-2.md`; `.project/review/wave-1.cycle1.md` (T003)
- **Finding**: E5 is a tautology and the ordering requirement is therefore unproven; the rules read source, not the DOM, so the surface and the rule can diverge undetected.
- **Fix direction**: E5 asserts DOM order against a reordered mutant of the rendered list. The rules read the rendered tree, or the intent records that source evaluation is the contract and why.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.

- **Verdict**: not-met
- **Check**: the build-and-serve half is proven by the project Verify at this head (exit 0) and by the re-recorded dev bundle. The explainer half is proven only after a repair: T005's original pin computed digests, compared a mutated copy against the original and ended `assert.ok(true)`, never comparing its digests to its table, so deleting an explainer left it green. T008 (`5090132`) replaced it with a real comparison over all four explainer components, naming the file in the failure, with a removal guard that restores in a `finally` and a one-byte mutation guard; its Verify proves both liveness halves. Its coverage is the four explainer components and nothing else, so a changed page-realm supplier or manifest still passes. E7 (`fixture-rebuild-idempotent.test.mjs`) remains a placeholder: existence checks and `assert.ok(true)`, with neither the second-build byte comparison nor the single-component-version assertion it names.
- **Observed**: E6 is now real and live. E7 is not implemented, so "the fixture builds and serves" is proven for one build and unproven for the second, which is the whole of E7.
- **Reference**: `tests/held-out/fixture-explainers-unchanged.test.mjs` (T008); `tests/held-out/fixture-rebuild-idempotent.test.mjs`; `.project/review/final-gap-1.md`; `.project/review/final-gap-2.md`; `.project/tasks/T008-explainer-pin-real-comparison.md`
- **Finding**: E7 is unimplemented behind a passing test — the same defect class as T005's pin, found twice in this milestone in two different files. A green suite that cannot fail is worse than a missing one, because it reports coverage it does not have.
- **Fix direction**: implement E7 as a real second-build comparison with a named mutant, exactly as T008 did for E6. Widen E6 to the supplier and manifest sources the intent's copy names, or record the narrower scope as a ruling.

### SC4 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: the project Verify at this head exits 0 with `npm run check` across its five stages (`ensure-sidecar-deps`, root `tsc`, `check:skills`, `check:panel`, `check:companion`) and `npm test` across the node suites, the user-scope tests, the skills suites and the panel target, plus `build-extension`. At the build head `d44b1cd` the gate was measured directly: 339 pass, 60 pass, 594 pass, `Successfully ran target test`, bundle 532,468 B against its 535,440 B pin. T007 (`3a1de10`) repaired six real type errors the milestone had introduced into the control skill's tests, at source rather than by widening a type, with the `.claude` mirror byte-identical.
- **Observed**: green, wholesale, with nothing carrying a criterion skipped. Prohibition compliance was re-read: no `@angular/aria`, `@angular/cdk` or `@angular/material` reached the panel's dependencies, build configuration or bundle (N3).
- **Reference**: `.project/build/verify-ledger.jsonl`; `build-extension` 532,468 B; `.project/tasks/T007-repair-control-skill-typecheck.md`; `.project/review/wave-2.cycle1.md` (T004, T007)
- **Finding**: none
- **Fix direction**: none

## Gaps carried into the record

Both gap reviewers returned `gaps` at this head. Their findings are the fix directions above, and they are recorded rather than repaired because a repair belongs to a task with a Verify, not to a review artifact. The milestone is blocked on SC1's three unenforceable edges, SC2's tautological ordering test, and SC3's unimplemented idempotency proof.

## What this milestone got right

The fixture is real, the surfaces are real, the mutation that proves an Aria rule bites is real, and the head gate is genuinely green. Two proofs were caught being decorative and one was repaired in-flight (T008). The recurring failure is not the product work; it is that a test which cannot fail was accepted three times before a reviewer read the file instead of the receipt.
