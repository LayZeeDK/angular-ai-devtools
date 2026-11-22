# SYNTHESIS — M060 error-routing (decide)

The roadmap entry lists no open questions and no decisions taken by the owner, so this record carries what was
measured before the plan and the rulings the plan makes from it. It is not the milestone's ship-time synthesis.

## Settled

- The resolved `ErrorHandler` is already hooked and its arrivals already recorded (`extension/agent-main.js:1904-1944`).
- The global `error` and `unhandledrejection` listeners already exist and reduce an arrival to
  `{ text, code, component }` (`extension/agent-main.js:2550-2561`, `:2495-2517`).
- No record in this tree states the phase an uncaught error was thrown in.

## Decisions

- D1 — the join reads only those records; it re-resolves nothing and installs no listener.
- D2 — four states, exhaustive: `uncaught-with-handler`, `reached-handler`, `no-handler-provided`, `cannot-tell`.
- D3 — the phase is a named absence, never a derivation.
- D4 — T001's record doubles as the census map.
- D5 — T004's claims record carries `quotes` and `ruling`.
- D6 — the task that edits a suite re-derives both gate records and lands last.

## For the planner

Plan five waves: T001 measures the two records and writes the map; T002 the pure join with four states and two
absences; T003 the single panel surface with every enumerating pin in the same commit; T004 the claims record in
the shape `scripts/navigation-blocking.test.mjs` derives; T005 re-derives both gate records and runs the project
verify. Declare every census that reads `research/raw/` at plan time — M059 discovered six of them at the ship gate.

## Not decided here

Deployment, dependency and surface-beyond-panel questions are out of this entry's scope (`Scope: out`).
