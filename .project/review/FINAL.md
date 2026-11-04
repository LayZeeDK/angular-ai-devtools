# Final Review — M023 fixture-components

Reviewed HEAD: dba2de80cf8e06a8755f20f7a23984cdc6f48d5a
Overall verdict: pass

<!-- Evidence reuse: the project Verify passed at this head (exit 0). Two gap reviewers ran in isolated
     sidecars; the intent lens found every criterion satisfied and no new high gap, the risk lens found one
     high programme-level defect outside this milestone's criteria. Eight repair waves preceded this review,
     each closing what the previous one found. Verdicts below are read from the suites, and every named
     mutant was run by a reviewer rather than taken from a Log. -->

## Success criteria

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.

- **Verdict**: met
- **Check**: E1 now renders: T020 mounts the fixture's own element as the root, offers the caller's child nodes to each `<ng-content>` slot, and asserts the rendered markers — inclusion (each root renders the one caller marker, before its own list) and exclusion (the page's third marker stays outside every root). `<ng-content select=".none">` fails 2 of 6, naming 0 markers projected. E2 reads attribute **bindings** as well as literals: `[attr.data-slot]="'one'"` against `"'two'"` fails with `(prohibition N1)`, while `aria-label` on one host — outside the declared match set — stays green, and the `id` exclusion is asserted from T002's pinned declaration rather than assumed. E3 drives a predicate to its named no-match. E4 observes a real click changing the rendered count 0→1→2; a no-op `advance()` reddens it.
- **Observed**: the four criterion-named mutants were applied by a reviewer in the wave-8 review and again in this round's intent read; all four redden and all restore green.
- **Reference**: `tests/held-out/fixture-harness-root-boundary.test.mjs`; `fixture-harness-ambiguity.test.mjs`; `fixture-harness-predicate.test.mjs`; `fixture-harness-action.test.mjs`; `.project/review/wave-8.cycle1.md`; `.project/review/final-gap-1.md`
- **Finding**: one carried caveat, accepted rather than hidden: T020's mount is a hand-rolled jsdom simulation of Angular's projection semantics, so E1's rendered half rests on the 2026-11-03 ruling and the browser proof, not on a real Angular run. The ruling carries its re-derivation condition. The risk lens separately found that the exclusion clause's mutant is not reachable — the assertion re-applies the predicate that defined its own input — so exclusion is carried by the mount's construction rather than by a failing case; recorded below.
- **Fix direction**: re-derive E1 against a real mount when the harness milestone provides one, and give the exclusion clause a reachable mutant.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.

- **Verdict**: met
- **Check**: a per-attribute mutant reddens exactly one rule and leaves its siblings green. Order is asserted for real: reversing the fixture's on-disk `@for` reddens both the order suite and the rule `listbox-option-order`. `menu-trigger-controls` resolves `aria-controls` to the element the trigger controls, naming both ids when they differ — the any-id defect T015 was opened for.
- **Observed**: five rules, each with a mutant that reddens it; the reviewer ran the reversal rather than reading the Log.
- **Reference**: `tests/held-out/aria-rules.mjs`; `fixture-aria-order.test.mjs`; `fixture-aria-rule-mutation.test.mjs`; `.project/review/wave-5.cycle1.md`
- **Finding**: two carried warnings — the rules live only in the held-out corpus with no product home and a two-valued removal loop, and the attribute-reading rules still read parsed source, which is latent while the fixture's attributes are static.
- **Fix direction**: give the rules a product home when N23 ships; record the source-reading scope as a ruling if it is to stand.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.

- **Verdict**: met
- **Check**: T016 serves the built entry on an ephemeral loopback port and byte-compares what is fetched across two cycles, with the install-set measured **between** the cycles; a duplicate package left by the first build reddens at that measurement. T017 asks each of the four explainers a pinned question through the panel's own route table and asserts the answer; deleting the `di-doctor` route reddens it, naming the explainer that can no longer be reached. The hash pins remain as N2's anti-tamper guard.
- **Observed**: both halves observe something a user could observe — a document served, an answer given.
- **Reference**: `tests/held-out/fixture-rebuild-idempotent.test.mjs`; `tests/held-out/fixture-explainers-unchanged.test.mjs`; `.project/review/wave-5.cycle1.md`
- **Finding**: the "serves" half is a static server inside the test, and nothing starts the `components` target; a fresh clone cannot run E7 until the companion `dist` is built, where it fails as `TS2307` — a product-shaped error for an artefact gap.
- **Fix direction**: have E7 provision what it needs or fail with a named cause; start the real target when the harness milestone owns it.

### SC4 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: the project Verify at this head exits 0. Three earlier attempts failed on control-skill tests that depended on their environment — a slot hashed from a checkout path, then a port probe blind because `netstat` exposes only the host table. T018 derived the slot; T019 replaced the probe with a loopback bind; T022 made it three-valued across both legs. 196 tests across five skills, 196 pass.
- **Observed**: green, with all three failures recorded rather than smoothed.
- **Reference**: `.project/build/verify-ledger.jsonl`; `.project/review/wave-6.cycle1.md`, `wave-7.cycle1.md`, `wave-8.cycle1.md`
- **Finding**: none against the criterion.
- **Fix direction**: none

## Gaps carried into the record

The risk lens found one **high** defect that is not this milestone's criterion failure but is serious: **ten of the thirty-two held-out suites are red at this head and no npm script reaches `tests/held-out`.** `e1`, `e5`, `e6`, `e10`, `e11`, `e12` and the four panel suites read `.project/review/rounds/` and `.project/review/specs/`, which do not exist and were never in git, so 39 assertions fail on `ENOENT`. Five of them also resolve `verdict.json` through `--git-common-dir`, i.e. in the primary checkout rather than the reviewed HEAD, and one bakes an absolute host path into a committed assertion. The consequence is that the corpus has never had a green baseline, the gate cannot see it, and a reader would mistake it for coverage. This does not fail any M023 criterion; it is carried as the first task of the next milestone.

Also carried: the version skew recorded but unasserted; E6's pins with no re-pin owner and three in-place product mutations; `expandControlFlow` handling only `@for`, so `@if (false)` keeps an empty listbox green; `jsdom` as an undeclared prerequisite of six suites; and the action suite's provenance comment being false about the workspace's Angular version.

## The shape of this milestone

Eight repair waves. The first found eight suites that could not fail; each later wave closed what its reviewer proved by mutant. Three of the last four waves were opened by a reviewer naming the single change that would leave a check green — `<ng-content select=".none">`, `[attr.data-slot]`, `LOOPBACKS = ['127.0.0.1']` — and each was closed by making that change redden. The two instruments that did the most work were the mutant and the honest receipt.
