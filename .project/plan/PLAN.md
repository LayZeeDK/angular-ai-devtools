# PLAN — M060 error-routing

Milestone: M060 — error-routing · Branch: gsd-path/M060 · Baseline: `main` at binding
Project verify: `npm run check && npm test && node --test tests/held-out --test-reporter=spec`

Five waves, five tasks. T001 measures, T002 is the pure join, T003 the panel surface, T004 the verdict claims,
T005 the gate records and the project verify. Every census that reads `research/raw/` is declared here, because
M059 discovered six of them at the ship gate.

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 2

## Decisions recorded at plan time

- D1 — The join reads only what M042 and the global listener already record; it re-resolves no handler and installs
  no listener (`extension/agent-main.js:1904-1944`, `:2550-2561`). Grounded in C1 and C2.
- D2 — The four states are fixed and exhaustive: `uncaught-with-handler`, `reached-handler`,
  `no-handler-provided`, `cannot-tell`. Every state carries the object's seven fields.
- D3 — The phase is read from a field or reported as `phase-not-recorded`; nothing derives it.
- D4 — The record T001 writes is also the census map: it carries `records[]` and `inventory.outsideTheMap`, so the
  record-shapes census reads it rather than a second file.
- D5 — The claims record T004 writes carries `quotes` and `ruling`, the two sections
  `scripts/navigation-blocking.test.mjs` derives.
- D6 — The task that edits a suite re-derives the two gate records and lands last (M059: three occurrences).

## Waves

## Wave 1 — T001: measure the two records and the join's shape

Goal: capture what the global listener record, the boundary entries and the injector walk actually state, into one
record that is also the census map, and pin the measurement with its own suite.

Review depth: full

## Wave 2 — T002: the pure join

Goal: `error-routing.js` returns one object in all four states, with the two absences and no derived field, proved
by mutants that name their defect.

Review depth: full

## Wave 3 — T003: the panel surface

Goal: render the join's object on a new route, with the loader key, the route table, the digest row count and the
copy record moving in the same task.

Review depth: full

## Wave 4 — T004: the verdict claims

Goal: the claims record with `quotes` and `ruling`, re-derived rather than typed.
Review depth: full

## Wave 5 — T005: the gate records and the project verify

Goal: re-derive both gate records after every suite edit this milestone makes, then run the project verify.
Review depth: full

## Wave 6 — T006: pin the recorded head honestly

Goal: the shapes record's head must be an ancestor of HEAD rather than HEAD itself, because an armed capture cannot pin a future commit. The byte-identity check serialises with the record's own head; a mutant carrying a real sha from another branch must redden.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |
| SC5 | T002 | AC5 |
| SC6 | T003 | AC1 |
| SC1 | T001 | AC2 |
| SC5 | T001 | AC3 |
| SC6 | T004 | AC1 |
| SC1 | T004 | AC2 |
| SC5 | T005 | AC1 |
| SC6 | T005 | AC2 |
| SC1 | T006 | AC1 |
| SC5 | T006 | AC2 |

## Held-out checks

- E1 → T002 → `scripts/error-routing.test.mjs`
- E2 → T002 → `scripts/error-routing.test.mjs`
- E3 → T002 → `scripts/error-routing.test.mjs`
- E4 → T002 → `scripts/error-routing.test.mjs`
- E5 → T003 → `scripts/panel-routes.test.mjs`
- E6 → T001 → `scripts/error-routing-shapes.test.mjs`
- E7 → T003 → `scripts/panel-routes.test.mjs`
- E8 → T002 → `scripts/error-routing.test.mjs`
- E9 → T003 → `scripts/panel-routes.test.mjs`

## Surface contract

### panel — T003

Criteria: SC6

Entry: the panel route `error-routing`, rendered through the `error-routing` key in `panel-demo.ts` `LOADERS`, its
sample in `FACTS`, and the `PANEL_SURFACES` entry in `app.routes.ts` that the shared `loadPanelDemo` closure installs
lazily.

States: `uncaught-with-handler` — the answer names the error message, the code the message carries and the handler
state, every claim carrying the artefact it rests on (SC6); `reached-handler` — a boundary entry carries the same
text, rendered as that entry and never as an uncaught error (SC6); `no-handler-provided` — no `ErrorHandler`
resolved, rendered as the token the walk looked for and the count it read, never as a handler name (SC6);
`cannot-tell` — the record does not state what the answer asked, naming the reason it states and nothing else.
`phase-not-recorded` and `no-boundary-entry` render as two separate sentences wherever they hold.

Walkthrough:

1. The panel loads the surface through its loader key and renders whichever state the join returned.
2. Each state renders the message, the code, the owner and the phase line, or the named absence that replaces it.
3. No state renders a remedy, a cause, a schematic or an identity the record did not carry.

## Interface contract

`errorRouting(records)` is a pure function of the records it is given. It returns, in every state, one object with
seven fields: `state`, `message`, `code`, `owner`, `phase`, `absences`, `claims`. `state` is one of the four names
D2 fixes. `absences` is an array of the named absences that apply, always including `handle-record-not-held` is not
required here; the two this surface carries are `phase-not-recorded` and `no-boundary-entry`. `owner` is filled only
from a field the record carries and is otherwise `null`. No field is derived from a stack, from an arrival order or
from a neighbouring record. The function throws on no input.

## Census declarations

These suites read `research/raw/` and derive a shape, so every task they affect declares them in `files:`:

- `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs` — the claims census.
- `scripts/recording-consistency.test.mjs` — the byte-consistency scan.
- `scripts/navigation-blocking.test.mjs` — the claims record's `quotes` and `ruling`.
- `scripts/error-routing-shapes.test.mjs` — this milestone's own record, which is also the map (D4).
- `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs` — the gate records (D6).
- `scripts/panel-routes.test.mjs`, `scripts/panel-copy.test.mjs`, `scripts/copy-check.test.mjs`,
  `scripts/transfer-search.test.mjs` — the surface pins.
