# Plan — Angular AI DevTools / M014 interop-proof

Project verify: `npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: land the deferred-error fixture route so a sliced node set exists by panel-attach time without changing the interop component or the keep-list rules.
Review depth: full

## Wave 2 — walking skeleton

Goal: align the interop check and its node test with the deferred fixture route so the check drives `/panel/interop` and proves the slice, limits, attribution and answer.
Review depth: full

## Wave 3 — feature completion

Goal: re-record `.proven.json` at the shipped head and correct every note that names the portal as the required source.
Review depth: verify-only

## Wave 4 — polish

Goal: run the project Verify and the skills mirror test.
Review depth: verify-only

## Surface contract

### DevTools panel — T002

Criteria: SC1
Entry: `/panel/interop` route in the built extension panel, opened on a named instance serving this checkout's extension, with the dev app serving the deferred `/stale-view` fixture route.
States: empty state (`no interop findings`) when no slice; otherwise one `.interop-slice` per sliced node showing `limit`, `node`, `source`, `producers`, `consumers`, `attribution: inferred, untested`, plus `Explain` and the rendered `ai-answer`.
Walkthrough:
1. Build the panel with `npx nx run angular-ai-devtools:build-extension`.
2. Serve `spikes/ng222-app` on a named instance and open the panel's Interop tab on `/panel/interop`.
3. Confirm at least one sliced node renders, the three limits (`observable`, `operator`, `emission`) are stated, the attribution reads "inferred, untested", and `Explain` renders a non-empty answer.
4. Confirm an empty slice fails rather than passes (held-out E1).

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1 |
| SC2 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC4 | T004 | AC1 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T002 | .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs |

## Dependency notes

- T002 depends on T001: the deferred fixture route must exist and still contain `subject.error` inside the effect's debuggable source so keep-list Rule 2 matches.
- T003 depends on T002: `.proven.json` is re-recorded only after the check drives the new route and passes.
- T004 depends on T003: the project Verify and mirror test run after all skill/doc edits land.