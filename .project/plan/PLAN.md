# Plan — M037 signal-forms-doctor

Milestone: signal-forms-doctor
Branch: gsd-path/M037
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — Capture the submit state

Goal: make the fact carry the submit state the module has been defaulting.

Review depth: full

`T001` extends the armed capture and re-captures the M031 recording. The module itself is untouched.

- `T001` -- Capture the submit state the fact never carried
  - Deps: none
  - Files: `scripts/field-state-capture.test.mjs`, `research/raw/m031-field-state.json`, `scripts/field-state.test.mjs`
  - Acceptance: AC1 no default guess, AC2 root kind named, AC3 separation kept, AC4 enabled case, AC5 extra fields
  - Verify: `node --experimental-strip-types --test "scripts/field-state.test.mjs"`

## Wave 2 — Supply it to the pane and the recordings

Goal: render the recorded submit state, and re-measure everything the change moves.

Review depth: full

`T002` supplies the demo fact and re-records the artefacts the fixture change stales.

- `T002` -- Supply the submit state to the pane and the recordings
  - Deps: T001
  - Files: `apps/angular-ai-devtools/src/app/panel-demo.ts`, its spec, both closure manifests, `m022`, `companion`
  - Acceptance: AC1 cannot-tell in the pane, AC2 fact equals the recording, AC3 no tolerance widens, AC4 gate
  - Verify: `node --experimental-strip-types --test "apps/angular-ai-devtools/src/app/panel-demo.spec.ts" && npm run check`

## Wave 3 — Render only the reason the pane was given

Goal: stop the fields pane asserting a cause the module did not give.

Review depth: full

`T003` maps the reasons the module can name to their own sentences, and renders a generic sentence for any other.

- `T003` -- Render only the reason the pane was given
  - Deps: T002
  - Files: `apps/angular-ai-devtools/src/app/panel-fields.ts`, `scripts/panel-fields.test.mjs`
  - Acceptance: AC1 root sentence unchanged, AC2 submit reason says submit, AC3 generic for unknown, AC4 non-vacuous
  - Verify: `node --experimental-strip-types --test "scripts/panel-fields.test.mjs"`

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T001 | scripts/field-state.test.mjs |
| E2 | T001 | scripts/field-state.test.mjs |
| E3 | T001 | scripts/field-state.test.mjs |
| E4 | T001 | scripts/field-state.test.mjs |
| E7 | T001 | scripts/field-state.test.mjs |
| E5 | T003 | scripts/panel-fields.test.mjs |
| E5 | T002 | apps/angular-ai-devtools/src/app/panel-demo.spec.ts |

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC2 |
| SC2 | T001 | AC3 |
| SC3 | T001 | AC1 |
| SC4 | T001 | AC1 |
| SC5 | T002 | AC1 |
| SC6 | T002 | AC4 |
| SC5 | T003 | AC2 |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name a rule, control or remedy the fact does not carry | criterion SC1 | the page states states |
| N2 | SC2 | merge a field error into the root kind | criterion SC2 | different questions |
| N3 | SC4 | infer a disabled submit from field validity | criterion SC4 | cross-field case is root-invalid |
| N4 | SC5 | render a state the join did not produce | criterion SC5 | the pane is a view |
| N5 | SC3 | read a build log or depend on how the app is served | criterion SC3 | the oracle is the page |
| N6 | SC6 | widen a tolerance to pass | criterion SC6 | a moved value is evidence |

## Surface contract

### panel — T002

Entry: `fieldState(facts)` from the recording's fact list.

States: fields rendered per key; submit rendered as its state string; root kind rendered when present; the join's
cannot-tell renders with its reason and nothing else.

Walkthrough:

1. Open the pane on the fixture's field page.
2. The field set renders each field's validity and its own errors.
3. The submit state renders beside it.
4. Where the root carries an error kind, it renders separately from the fields.
5. Where the fact is unreadable, the pane says cannot tell and renders no default.

Criteria: SC5
