# SYNTHESIS — M064 lazy-chunk-failure (decide)

The roadmap entry lists no open questions and the owner took no decision in this phase, so this record carries what was
measured before the plan and what the planner is told. It is not the milestone's ship-time synthesis.

## Settled

- No import failure is recorded anywhere: `grep -c "chunk" extension/agent-main.js` is 0, and
  `extension/navigation-narrator.js:26` states that the navigation payloads carry `{ route, type }` and no chunk.
- The record's shape is fixed by the roadmap's own risk: a response status and a content hash must both be present
  before a failure can be named, and a request that never completed is `never-completed` with a reason.
- Six suites census `research/raw/`, so six recordings can move; the two gate records are derived last, gate then
  stability, because the stability record derives the gate's exit code.
- The verify rewrites `extension/panel/index.html` and its held-out leg takes 23 minutes, so it runs detached and the
  built file is restored afterwards.

## Decisions

### D1 — the record is written first

- **Decision**: task one writes the failure record, the join reads only that record, and the surface reads only the join object.
- **Runner-up**: tap the network directly in the join. Rejected because it measures a second thing and reads the page's network panel, which the intent forbids.
- **Evidence**: `grep -c "chunk" extension/agent-main.js` is 0, and `extension/navigation-narrator.js:26` states the payloads carry `{ route, type }` and no chunk.
- **Confidence**: high

### D2 — an incomplete request stays incomplete

- **Decision**: a request with no response status is `never-completed` with a reason, and a missing hash is reported missing rather than completed from a filename.
- **Runner-up**: infer a version drift when the status is absent. Rejected because nothing measured it, and the roadmap names that inference as its own risk.
- **Evidence**: the roadmap's Risks line says a replaced chunk and a network failure look the same from the router.
- **Confidence**: high

### D3 — the surface moves every list in one commit

- **Decision**: the route table, the loader map, the app spec, the panel route suite and the fixture route table all move in the surface task.
- **Runner-up**: one task per list. Rejected because each earlier milestone showed the lists are one contract, and splitting them lets one land alone.
- **Evidence**: M032 shipped a surface without the fixture route pin and M033 without the loader key; each cost a gate cycle.
- **Confidence**: high

### D4 — every censused record is declared

- **Decision**: the recording task and the verify task both declare all six records the censuses read.
- **Runner-up**: declare only the records a task pins. Rejected because M063's plan did that and needed three dispatch rounds.
- **Evidence**: six suites read `research/raw/`, and `m044` and `m056` derive each other's exit codes.
- **Confidence**: high

### D5 — no design-system surface in the panel

- **Decision**: no `angular/components` or Angular Material surface enters the panel in this milestone.
- **Runner-up**: adopt the Material table now and dog-food it. Rejected because the design system is generation 4 and the intent's prohibition N5 says so.
- **Evidence**: rulings A10 and A11 in `plans/angular-ai-devtools-program-backlog.md`.
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: none — task one writes the record it needs, and nothing joins against it before it exists.

- **Walking skeleton**: record (T001) → join (T002) → surface (T003), with the claims record, the portal capture and the
recordings after them, and the project verify last.

- **Pitfalls → tasks**: a surface added without one of its five enumerating lists → T003; a failure that names a drift or a
remedy → T002's mutants; a verify that stops in leg 1 → T007, run detached; a recording the milestone moved and the
plan did not declare → T006 and T007, which declare all six.

## User rulings

None this phase. The roadmap entry lists no open questions, the owner took no decision, and every decision above is the
planner's own, recorded with the measurement behind it.

## Still unknown

- Whether the portal carries a route whose lazy chunk can be made to fail without a page-side edit. If it does not, task
  five names the route tried and the artefact the portal lacks before it falls back to the fixture.
