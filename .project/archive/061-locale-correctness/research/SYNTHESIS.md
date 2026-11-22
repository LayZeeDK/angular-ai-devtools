# SYNTHESIS — M061 locale-correctness

The roadmap entry names one question a reader of a page can answer from the console: whether a formatted value is
produced by a formatter the page's own records do not carry. This record states what was measured before the plan and
what the planner was told. It is not the milestone's ship-time synthesis.

## Settled

- The portal records a locale provider entry and the record carries the shape rather than the value: `FACTS` holds
  `providers.localeEntry` and no field stores the resolved value (`apps/angular-ai-devtools/src/app/panel-demo.ts`).
- Four words can appear in `extension/` and every one of the four is inside a comment. The count is 4 hits, 4 in
  comments, 0 in code, over 3 files (`research/raw/m061-record-shapes.json`).
- No record in this tree states which formatter produced a value, so a value the records carry no field for is the
  observable the milestone can name.

## Decisions

- A formatted value with no `intl` field is reported as `formatted-outside-i18n`, and a locale provider entry whose value
  no field carries is `locale-value-not-recorded`. Neither state names a component, a remedy, or a rule identity.
- `absences` is present in every state, so a reader can tell what the record does not carry without reading the record.

## For the planner

- **Wave-1 blockers**: none — T001 measures records that already exist and adds no instrumentation.
- **Walking skeleton**: T001 writes the shapes record, T002 joins it into four states, T003 renders the object and pins
  the route, T004 records the verdict claims, T005 and T006 re-derive the milestone's records, T007 repairs the cascade
  the gate capture moved and runs the project verify.
- **Pitfalls → tasks**: a claims record whose shape a census derives → T004; gate records staled by the last landing →
  T006; a capture that moves a line another record pins → T007.

## User rulings

- None

## Still unknown

- Whether the portal produces a formatted value outside i18n on any route it serves. T002's suite proves the join, not the
  portal; a verdict taken there must name the route it tried and the artefact the zoneful page lacks.
- Whether a fifth state is needed for a value the record carries but which no formatter produced. Nothing in the tree
  distinguishes those two yet, and inventing a state for it would be a claim rather than a measurement.
