# SYNTHESIS — M060 error-routing (decide)

The roadmap entry lists no open questions and the owner took no decision in this phase, so this record carries what
was measured before the plan and what the planner is told. It is not the milestone's ship-time synthesis.

## Settled

- The resolved `ErrorHandler` is already hooked and its arrivals already recorded (`extension/agent-main.js:1904-1944`).
- The global `error` and `unhandledrejection` listeners already exist and reduce an arrival to
  `{ text, code, component }` (`extension/agent-main.js:2550-2561`, `:2495-2517`).
- No record in this tree states the phase an uncaught error was thrown in.

## Decisions

- None

## For the planner

- Wave-1 blockers: none — T001 measures two records that already exist and needs no new instrumentation.
- Walking skeleton: T001 writes the record and its map, T002 joins the two records into four states, T003 renders
  that object on one new panel route, T004 writes the claims record the navigation census derives, T005 re-derives
  both gate records and runs the project verify.
- Pitfalls → tasks: a claims record whose shape a census derives → T004; gate records staled by the last landing →
  T005; a surface without every enumerating pin → T003; a scope count frozen as an equality → the shapes suite in
  T001.

## User rulings

- None

## Still unknown

- Whether the portal produces an error outside change detection on any of its routes; T002's suite proves the join,
  not the portal, and the attribution half must name the route it tried when a verdict is taken.
