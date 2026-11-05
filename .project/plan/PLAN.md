# Plan — M031 cross-field-validation

Milestone: cross-field-validation
Branch: gsd-path/M031

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the subject and the field-state read

Goal: The fixture has no form, so SC1's subject must be created before anything can be read. T001 adds a form with two validatable fields, one cross-field rule and a submit bound to validity, then **measures whether `ng.getComponent` exposes the field tree** and records the shape it finds — the recording that decides whether T002's read is possible at all. T002 reads each field's validity and its own errors, reports the submit state, and yields `cannot-tell` when every field is valid while submit stays disabled.

Review depth: full

T001 and T002. A form with a cross-field rule, and a pure read of its field states with an honest absence state.

## Wave 2 — the surface and the recordings

Goal: T003 renders the field set, each field's state and the submit state, beside the "cannot tell" state. T004 re-records everything the new route and the growing fixture invalidate: both feature manifests, both development-build recordings, the M031 verdict claims, plus the panel route pin.

Review depth: full

T003 and T004. The panel shows the fields and the absence state; every recording the change staled is re-recorded from a
cleared output path and proved by reverting one field.

## Wave 3 — the typecheck the task's Verify missed

Goal: T003 verified with the surface suite alone, so the project's `check:panel` was never run against it and the ship gate found three TS18048 errors on an indexed lookup. T005 guards the lookup and adds the typecheck to the task's own Verify so the gap cannot recur.

Review depth: full

T005. The panel typechecks under `noUncheckedIndexedAccess`, and its task Verify runs that typecheck rather than the suite alone.

## Wave 4 — the recording that only describes one machine

Goal: the final panel found four failures in `ng-context-dev-build` in a checkout whose path differs, because the recording pins literal
chunk hashes and Angular derives those from content that embeds the absolute output path. T006 records the bundle shape and asserts
cross-path stability instead of pinning a directory layout.

Review depth: full

T006. Both development-build recordings describe the bundle's shape, and both suites pass in a checkout whose path differs from the one
that recorded them.

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/field-state.test.mjs |
| E2 | T002 | scripts/field-state.test.mjs |
| E3 | T002 | scripts/field-state.test.mjs |
| E4 | T003 | scripts/panel-fields.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC4 | T005 | AC2 |
| SC5 | T004 | AC4 |
| SC5 | T006 | AC2 |

## Prohibitions

| Prohibition | Task | Enforcement |
|---|---|---|
| N1 | T002 | reads field state through the existing `window.ng` surface; no form patch, no value-change subscription |
| N2 | T002 | names a field's own errors, never the cross-field rule |
| N3 | T001 | the finding never echoes a field's value |
| N4 | T003 | the surface renders the fact list and the absence state only |
| N5 | T004 | the gate runs at the head, unweakened; no recording is widened or skipped |

## Surface contract

### panel — T003

Criteria: SC4
Entry: open the panel, select the field-state finding produced for the fixture route added in T001; the same surface is
reachable from the tool group's forms row.
States: empty shows an explicit "cannot tell" state naming that every field is valid while submit stays disabled, so a rule outside the field states is holding it; loading shows the field set being read rather than an empty list; error shows that the form could not be read, naming that it could not; success shows each field's validity, its own errors and the submit state. No state names the cross-field rule, why a field is invalid, or a field's value.
Walkthrough:
1. Load the fixture's form route, open the panel, and confirm each field's validity and its own errors are shown beside the submit state.
2. Make one field valid while the other stays invalid and confirm the surface names that field's error, not the rule.
3. Make every field valid while submit stays disabled and confirm the cannot-tell state names the rule's existence without naming the rule.
4. Confirm no field's value is rendered.
5. Confirm the panel adds no DOM to the inspected page.

## Dependencies

- T002 depends on T001's recording: the read is built against what `ng.getComponent` actually exposes, not an assumed shape.
- T003 depends on T002: the surface renders what the read produces.
- T004 depends on T001 and T003: the new form route and panel route are what stale the recordings.
