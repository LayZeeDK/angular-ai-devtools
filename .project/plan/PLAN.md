# Plan — M026 image-budget-audit

<!-- Written by the orchestrator. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the digest carries thirteen real codes

Goal: The roadmap asked for a digest over NG02200 through NG02800; measurement shows no such range exists and the
image set is thirteen codes, NG0913 plus NG2952 through NG2967. T001 generates one entry per measured code at
extension build time with a hard 150-token cap, proven by a counter rather than asserted in prose. T002 strips the
licence and copyright notice before any digest text can reach a prompt, and proves it by putting a licence string in
the source and watching the guard redden. Together they make the digest an artefact a reviewer can count.
Review depth: full

## Wave 2 — the finding path exists on the fixture

Goal: The fixture has no images at all, so COM-1 has nothing to observe. T003 adds one page that uses
NgOptimizedImage in a way that provokes a real runtime warning in dev mode, and proves the finding by removing the
offending attribute and watching it disappear. A page that cannot warn proves nothing, so the test asserts the code
it expects rather than "a warning happened".
Review depth: full

## Wave 3 — the panel explains it and stays inside budget

Goal: T004 renders the finding and its explanation from a short fact list, inside the registry envelope, in wording
that names a binding without becoming a layout recommendation. T005 proves the initial bundle stays inside 520 KB and
that an unknown code reports unknown rather than guessed, then re-runs the gate so a green build cannot hide a
fabricated entry.
Review depth: full

## Surface contract

### panel — T004

Criteria: SC5
Entry: open the panel's feature list and select the image-budget finding produced by the fixture page added in T003; the same surface is reachable from the finding's row in the panel.
States: empty (no image finding recorded) shows an explicit "no image finding" state rather than a blank pane; loading shows the fact list being assembled; error shows the unknown-code state, naming the code and saying the digest has no entry for it; success shows the finding, the code, the binding and the one-line fix taken from the digest entry.
Walkthrough:
1. Start the fixture with `control-angular-dev-app up --target counter`, open the image-budget page, and confirm the panel renders the finding with its code and binding.
2. Select the finding and confirm the explanation comes from the digest entry, not from a model call, and that the fact list is short enough to read.
3. Remove the offending attribute and confirm the surface returns to the empty state rather than showing a stale finding.
4. Introduce a code the digest does not carry and confirm the surface renders the unknown state rather than invented text.
Accessibility: the finding is reachable by keyboard, its code and binding are read as text rather than conveyed by colour, and the unknown state is announced rather than only styled.

## Wave 4 — the set corrected against the clone

Goal: T001's thirteen codes came from grepping bundles. The clone at `v22.1.8` shows the image directive declares
seventeen in its own enum block, plus `NG0913` in core: eighteen. Five codes were missed because their messages use
other wording. T006 adds them, taking each meaning from the clone's enum name and call site rather than from memory,
and regenerates the artefact.
Review depth: full

## Wave 5 — the recordings the fixture change invalidated

Goal: Adding the image-budget page changed `app.routes.ts` and the development bundle, so two control-skill feature
manifests and the ng-context recording stopped matching. T007 re-records them with the skills' own recorder and
re-measures the bundle, changing data rather than assertions, and proves each re-record reddens when reverted.
Review depth: full

## Held-out checks

| Edge | Task | Test |
| --- | --- | --- |
| E1 | T001 | scripts/image-digest.test.mjs |
| E1 | T006 | scripts/image-digest.test.mjs |
| E1 | T007 | scripts/fixture-proof-fresh.test.mjs |
| E2 | T007 | scripts/ng-context-dev-build.test.mjs |
| E2 | T001 | scripts/image-digest.test.mjs |
| E2 | T006 | scripts/image-digest.test.mjs |
| E3 | T003 | scripts/image-finding.test.mjs |
| E4 | T002 | scripts/image-digest.test.mjs |
| E5 | T005 | scripts/image-budget.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
| --- | --- | --- |
| SC1 | T001 | AC1 |
| SC1 | T006 | AC1 |
| SC1 | T007 | AC1 |
| SC2 | T001 | AC2 |
| SC2 | T006 | AC3 |
| SC3 | T003 | AC1 |
| SC4 | T002 | AC1 |
| SC5 | T004 | AC1 |
| SC5 | T005 | AC2 |
| SC5 | T007 | AC3 |

## Waves at a glance

| Wave | Tasks | Theme |
| --- | --- | --- |
| 1 | T001, T002 | the digest and the licence strip |
| 2 | T003 | the fixture page and the finding |
| 3 | T004, T005 | the panel surface and the budget proof |
