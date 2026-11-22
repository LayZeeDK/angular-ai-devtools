# SYNTHESIS — M060 error-routing (decide)

The roadmap entry lists no open questions and no decisions, so this record carries what was measured before the
plan and the rulings the plan made from it. It is not a milestone synthesis; the ship-time one replaces it.

## Measured

- The resolved `ErrorHandler` is already hooked and its arrivals already recorded (`extension/agent-main.js:1904-1944`).
- The global `error` and `unhandledrejection` listeners already exist and reduce an arrival to
  `{ text, code, component }` (`extension/agent-main.js:2550-2561`, `:2495-2517`).
- No record in this tree states the phase an uncaught error was thrown in.

## Ruled

- D1 — the join reads only those records; it re-resolves nothing and installs no listener.
- D2 — four states, exhaustive: `uncaught-with-handler`, `reached-handler`, `no-handler-provided`, `cannot-tell`.
- D3 — the phase is a named absence, never a derivation.
- D4 — T001's record doubles as the census map.
- D5 — T004's claims record carries `quotes` and `ruling`.
- D6 — the task that edits a suite re-derives both gate records and lands last.

## Not decided here

Deployment, dependency and surface-beyond-panel questions are out of this entry's scope (`Scope: out`).
