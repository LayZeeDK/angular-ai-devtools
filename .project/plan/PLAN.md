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

## Held-out checks

| Edge | Task | Test |
| --- | --- | --- |
| E1 | T001 | scripts/image-digest.test.mjs |
| E2 | T001 | scripts/image-digest.test.mjs |
| E3 | T003 | scripts/image-finding.test.mjs |
| E4 | T002 | scripts/image-digest.test.mjs |
| E5 | T005 | scripts/image-budget.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
| --- | --- | --- |
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC3 | T003 | AC1 |
| SC4 | T002 | AC1 |
| SC5 | T004 | AC1 |
| SC5 | T005 | AC2 |

## Waves at a glance

| Wave | Tasks | Theme |
| --- | --- | --- |
| 1 | T001, T002 | the digest and the licence strip |
| 2 | T003 | the fixture page and the finding |
| 3 | T004, T005 | the panel surface and the budget proof |
