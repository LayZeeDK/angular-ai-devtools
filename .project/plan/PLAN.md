# Plan — Angular AI DevTools (M009 consolidation-hardening)

Project verify: `npm ci && npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Author the seven `lars-review` specifications against the frozen milestone ranges and run the first review round over M001-M007, producing the findings artifact that all later fix work is planned from. If the product worktree is not clean, `lars-review` stops and the wave blocks.
Review depth: full

## Wave 2 — known fixes and regression gate

Goal: Land the defects already known from INTENT.md and the docs audit (vacuous test removal, stale-doc corrections, spike retirement) and replace the vacuous regression gate with a non-vacuous one, without changing public behavior.
Review depth: full

## Wave 3 — final re-review and verification

Goal: Re-run `lars-review` over the changed ranges after the known fixes, resolve every verified blocking finding (or defer with a written reason), then prove the N1/N2/N3 panel flows on all four supported model pairs and the insurance-portal fixture.
Review depth: full

## Wave 4 — coverage infrastructure

Goal: Author `control-ai-browsers` feature files plus `verify-ai-browsers` checks for signal provenance (N2) and the DI doctor (N3), with byte-mirrored `.claude/skills/` copies, so T007's coverage gap closes and `lars-verify` can produce real verdicts.
Review depth: full

## Wave 5 — blocking findings patch wave

Goal: Fix all 12 verified blocking findings from round-2.md in file-scope batches, without public behavior change, each with a Verify that proves the pattern is absent where applicable.
Review depth: full

## Wave 6 — verification after the fixes

Goal: Re-run panel verification on all four model pairs and the portal with the new coverage and documented budgets, then re-run `lars-review` to dispose every blocking finding and prove E11/E12.
Review depth: full

## Surface contract

### DevTools panel — T007

Criteria: SC3, SC4
Entry: Open the DevTools "Angular AI" panel against `spikes/ng222-app` (and the insurance-portal checkout where meaningful) in each of the four supported browser instances.
States: empty shows no recorded cycles and a prompt to drive the app; loading shows the model generating; error shows `unverifiable` with the reason when a model pair cannot run; success shows the chain/finding and the model answer.
Walkthrough:
1. Build the extension (`npx nx run angular-ai-devtools:build-extension`), serve `spikes/ng222-app`, and open the panel in `chrome-beta-nano`, `chrome-beta-gemma4`, `edge-dev-aion`, `edge-phi4mini`.
2. Drive the N1 flow (click that writes `count`) and confirm the chain `click -> count -> double -> app-counter template`; drive N2 (signal provenance) and N3 (DI doctor) and confirm each answers.
3. Record a `lars-verify` verdict of `verified` per pair and cite each `verdict.json`.
4. Repeat on the insurance-portal checkout where meaningful and record the external dependency in the claim.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T006 | AC1 |
| SC2 | T003 | AC1 |
| SC3 | T007 | AC1 |
| SC4 | T007 | AC2 |
| SC5 | T005 | AC1 |
| SC6 | T006 | AC2 |
| SC7 | T001 | AC1 |
| SC8 | T006 | AC3 |
| SC2 | T008 | AC5 |
| SC1 | T009 | AC1 |
| SC1 | T010 | AC1 |
| SC1 | T011 | AC1 |
| SC6 | T011 | AC2 |
| SC1 | T012 | AC1 |
| SC6 | T012 | AC2 |
| SC1 | T013 | AC2 |
| SC1 | T014 | AC1 |
| SC1 | T015 | AC1 |
| SC1 | T016 | AC1 |
| SC6 | T016 | AC6 |
| SC8 | T017 | AC2 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T006 | tests/held-out/e1-zero-defects-recorded.test.mjs |
| E3 | T003 | tests/held-out/e3-zero-skipped.test.mjs |
| E4 | T003 | tests/held-out/e4-idempotent-checks.test.mjs |
| E5 | T007 | tests/held-out/e5-unverifiable-recorded.test.mjs |
| E6 | T007 | tests/held-out/e6-portal-dependency.test.mjs |
| E7 | T005 | tests/held-out/e7-archive-order.test.mjs |
| E8 | T005 | tests/held-out/e8-fixtures-retained.test.mjs |
| E10 | T001 | tests/held-out/e10-spec-present.test.mjs |
| E11 | T006 | tests/held-out/e11-rerun-stable.test.mjs |
| E12 | T006 | tests/held-out/e12-clean-worktree.test.mjs |

## Dependency notes

- T002 depends on T001: the first review round runs over the authored specifications, so the specs must land first.
- T006 depends on T002, T003, T004, T005: the final re-review runs only after the first round's findings exist and the known fixes have landed (E12: no fix task open while a review round runs).
- T007 depends on T006: panel verification runs after the re-review and its blocker resolution.
- T006 is the round-2 re-review and blocker-disposition task: it re-runs `lars-review` over the changed ranges, records every finding's disposition (fixed in a named patch commit, or deferred with a written reason and acceptor), and owns SC1/SC6/SC8 through that disposition record. It does not fix product code. Actual review-sourced fixes land through plan patch waves appended after wave 3; the patch wave carries its own re-review task so E11's "no new verified blocker after fixes" is proven after the fixes, and that patch task lists T006's files where it re-runs them.
- T008 (wave 4) has no deps: coverage infrastructure lands before panel re-verification.
- T009-T016 (wave 5) are file-disjoint fix tasks; T012 depends on T011 via the shared state-message contract; all others are independent.
- T007 (wave 6) depends on T006, T008, and the panel-touching fix tasks T011, T012, T016.
- T017 (wave 6) depends on every wave-5 fix task (T009-T016) and owns SC8.

