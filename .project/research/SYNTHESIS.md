# SYNTHESIS — M063 guard-phase (decide)

The roadmap entry lists no open questions and the owner took no decision in this phase, so this record carries what was
measured before the plan and what the planner is told. It is not the milestone's ship-time synthesis.

## Settled

- The narrator already carries a `guards` section and it is a fixed absence: `cannot-tell` with
  `guard-verdict-not-recorded`. It cannot answer the milestone's question.
- The router payloads the agent receives carry `{ route, type }`; no key names a guard, and
  `grep -c "canActivate\|canMatch" extension/agent-main.js` returns 0.
- `canMatch` runs before the route is known, so a phase can be recorded without an owner.

## Decisions

- None

## For the planner

- The guard phase is recorded by a task this milestone writes, and the join reads that record and nothing else.
- A verdict with a phase and no owner is a phase-only finding; it is never attributed to a route that matched later.
- Wave-1 blockers: none. The record reads the navigation the agent already observes, with no new page-side
  instrumentation.
- Walking skeleton: T001 records the ordered verdicts with their phases; T002 joins them into four states; T003 renders
  the object and moves every route-table pin, the app spec and all three lists in the chat-entry spec; T004 records the
  claims census; T005 to T007 re-derive the records and the gate records and run the project verify.
- Pitfalls → tasks: the claims record derives from the plan's coverage table, so it is re-captured in the last wave; a
  task Log that names paths moves the gate's mention count; the project verify must be observed reaching `test:app`, not
  only its first leg.

## User rulings

- None

## Still unknown

- Whether the portal serves a route whose guard cancels after a side effect. The fixture is the recorded fallback, and a
  verdict taken there must name the route tried and the artefact the portal lacks.
