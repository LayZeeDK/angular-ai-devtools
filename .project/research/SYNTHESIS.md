# SYNTHESIS — M062 outlet-explainer (decide)

The roadmap entry lists no open questions and the owner took no decision in this phase, so this record carries what was
measured before the plan and what the planner is told. It is not the milestone's ship-time synthesis.

## Settled

- No record in this tree carries an outlet name. `grep -ri "\boutlet\b" extension/` returns 0 matches, and the nearest
  value is `componentName: 'RouterOutlet'` in the demo record, which names a component.
- The router record M033 joins against carries the configured path set and the unmatched segment only, so it cannot
  answer an outlet question.
- An unnamed outlet and one explicitly named `primary` are the same outlet, so a record may legitimately show `primary`
  for a route that declares no outlet.

## Decisions

- The milestone adds the outlet name to a record it writes, rather than widening the router record or deriving a name
  from the rendered tree. The join's inputs are that record and the route path.
- An outlet the state does not carry is `cannot-tell` with the reason, never the nearest outlet in the DOM.

## For the planner

- **Wave-1 blockers**: none — T001 records the outlet name; nothing it needs is missing.
- **Walking skeleton**: T001 records the requested and matched outlet names and the route path; T002 joins them into the
  four states; T003 renders the object and moves the route-table and copy pins in the same task; T004 records the
  claims census; T005 and T006 re-derive the records this milestone writes and the two gate records.
- **Pitfalls → tasks**: a claims record whose shape a census derives → T004; gate records staled by the last landing →
  T006; a capture that moves a line another record pins → the last task that touches a suite.

## User rulings

- None

## Still unknown

- Whether the portal serves a route that declares a named outlet. The fixture's root template carries `<router-outlet />`,
  so it is the recorded fallback, and a verdict there must name the route tried and the artefact the portal lacks.
