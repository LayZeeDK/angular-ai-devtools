# SYNTHESIS — gsd-path/M067 (decide)

The roadmap entry lists no open questions and the owner took no decision in this phase, so this record carries what
was measured before the plan and what the planner is told. It is not the milestone's ship-time synthesis.

## Settled

- Nothing in this repository reads a form field's hosted control before this milestone: `grep -rn 'form-field|FormField'`
  over `extension/*.js` and `apps/angular-ai-devtools/src/app/*.ts` returns no match.
- `package.json` declares neither `@angular/material` nor `@angular/cdk`, so there is no binder to read.
- The portal's own forms are PrimeNG controls (`p-datepicker`, `p-select`) per `research/raw/m066-schema-record.json`.
- `extension/field-state.js` already produces the field identity this milestone must not derive a second time.

## Decisions

### D1 — the expected control is a named absence, not a defect

- **Decision**: the join answers `cannot-tell` naming the missing expectation, and never infers a control from a label.
- **Runner-up**: inferring the expected control from the label or the element, which would name a control no reading took.
- **Evidence**: no artefact in this checkout states a field's expected control; M066's page reading carries ten per-field keys and none of them is one.
- **Confidence**: high

### D2 — the shape map that drifted twice gained a writer

- **Decision**: `research/raw/m055-record-shapes.json` is written by an armed capture that derives, refuses a non-fixed-point candidate, and writes only on its arm.
- **Runner-up**: re-deriving it by hand at each rebind, which is what let it drift at M066 and again at this milestone.
- **Evidence**: M066's own archive recorded "the same drift will recur at the next rebind", and it did.
- **Confidence**: high

### D3 — one assertion owns a missing reason row

- **Decision**: a suite with no `SUITE_DIFF_REASONS` row reddens one assertion that prints the `Object.assign` block to paste.
- **Runner-up**: the throw inside the shared derivation, which reddened nine assertions and named neither the row nor the fix.
- **Evidence**: measured in this milestone, one throw killed four derived sections and produced nine collateral failures.
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: none.
- **Walking skeleton**: record (T004) → join (T005) → surface (T006) is the shortest path to one end-to-end answer.
- **Pitfalls → tasks**: a second field identity is the defect M033, M064 and M066 each paid for, so T005's identity is asserted against `extension/field-state.js` rather than reproduced; a recording with no armed capture drifts at every rebind, which is T010.

## User rulings

None this phase, or each ruling quoted with the instruction that granted it.

## Still unknown

- Whether the portal will declare a control library whose fields name their expected control; until it does, the honest answer is the absence this milestone reports.
