# PLAN — M061 locale-correctness

Milestone: M061 — locale-correctness · Branch: gsd-path/M061 · Baseline: `main` at binding
Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

Six waves, six tasks. T001 measures, T002 is the pure join, T003 the panel surface, T004 the verdict claims, T005
re-derives this milestone’s own records, and T006 re-derives the two gate records and runs the project verify last.
Every census that reads `research/raw/` is declared here, because M059 discovered six of them at the ship gate.

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 2

## Decisions recorded at plan time

- D1 — The join reads only what the injector walk already records; it adds no page read and no second provider
  enumeration (`extension/agent-main.js:1149-1155`, `:1215-1223`). Grounded in C1 and C4.
- D2 — The four states are fixed and exhaustive: `locale-provider-entry`, `locale-token-absent`,
  `formatted-outside-i18n`, `cannot-tell`. Every state carries the object's six fields.
- D3 — The locale value is never derived: the record discards it (`:1182-1185`), so `locale-value-not-recorded` is a
  named absence in every state that names a provider entry, never a value read from the page.
- D4 — The record T001 writes is also the census map: it carries `records[]` and `inventory.outsideTheMap`, so the
  record-shapes census reads it rather than a second file.
- D5 — The claims record T004 writes carries `quotes` and `ruling`, the two sections
  `scripts/navigation-blocking.test.mjs` derives.
- D6 — Both gate records are re-derived as the last commit before the final review, because a recording that derives
  from the tree moves with every later suite edit (measured in M060 T007).

## Waves

## Wave 1 — T001: measure the provider record and the formatter the page carries

Goal: capture what the injector walk actually states for a page that provides a non-default `LOCALE_ID` — the token
name, the provider kind, the import path, and whether a formatter identity is recorded at all — into one record that is
also the census map, and pin the measurement with its own suite.

Review depth: full

## Wave 2 — T002: the pure join

Goal: `locale-correctness.js` returns one object in all four states, with `locale-value-not-recorded` as a named
absence and no derived field, proved by mutants that name their defect.

Review depth: full

## Wave 3 — T003: the panel surface

Goal: render the join's object on a new route, with the loader key, the route table, the digest row count and the copy
record moving in the same task.

Review depth: full

## Wave 4 — T004: the verdict claims

Goal: the claims record with `quotes` and `ruling`, re-derived rather than typed.
Review depth: full

## Wave 5 — T005: re-derive this milestone’s own records

Goal: re-derive the three recordings this milestone’s suites derive — the record-shapes record, the verdict claims, and the teardown record whose count this head moved — with the word scan excluding this milestone’s own module and suite, and the claims quoting the intent character for character after its SC1 and SC2 were restored.
Review depth: full

## Wave 6 — T006: re-derive the gate records and run the project verify

Goal: capture both gate records at the final head, read them back unarmed, then run the project verify, which builds before it measures and uses no cache or daemon workaround. Last for the reason M060 needed a seventh task: a recording that derives from the tree moves with every later suite edit.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |
| SC1 | T001 | AC2 |
| SC3 | T001 | AC3 |
| SC4 | T003 | AC1 |
| SC2 | T003 | AC2 |
| SC1 | T004 | AC1 |
| SC3 | T004 | AC2 |
| SC1 | T005 | AC1 |
| SC3 | T005 | AC2 |
| SC1 | T005 | AC3 |
| SC1 | T006 | AC1 |
| SC4 | T006 | AC2 |

## Held-out checks

- E1 → T002 → `scripts/locale-correctness.test.mjs`
- E2 → T002 → `scripts/locale-correctness.test.mjs`
- E3 → T002 → `scripts/locale-correctness.test.mjs`
- E4 → T002 → `scripts/locale-correctness.test.mjs`
- E5 → T001 → `scripts/locale-correctness-shapes.test.mjs`
- E6 → T003 → `scripts/panel-routes.test.mjs`
- E7 → T002 → `scripts/locale-correctness.test.mjs`
- E8 → T003 → `scripts/panel-routes.test.mjs`

## Surface contract

### panel — T003

Criteria: SC4

Entry: the panel route `locale-correctness`, rendered through the `locale-correctness` key in `panel-demo.ts`
`LOADERS`, its sample in `FACTS`, and the `PANEL_SURFACES` entry in `app.routes.ts` that the shared `loadPanelDemo`
closure installs lazily.

States: `locale-provider-entry` — the answer names the provider entry that carries the `LOCALE_ID` token, its kind and
its import path, every claim carrying the artefact it rests on, and reports `locale-value-not-recorded` (SC1, SC4);
`locale-token-absent` — no provider entry carries the token, rendered as the absence and never as the default locale
the answer assumed (E1); `formatted-outside-i18n` — the record names no formatter, rendered as that absence rather than
the nearest locale (E3); `cannot-tell` — the record does not state what the answer asked, naming the reason it states
and nothing else.

Walkthrough:

1. The panel loads the surface through its loader key and renders whichever state the join returned.
2. Each state renders the provider entry line or the named absence that replaces it, and never a value read from the
   page.
3. No state renders a remedy, a cause, a schematic or an identity the record did not carry.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with
six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of the four names D2 fixes.
`token` is the token name the record carries and is otherwise `null`. `provider` is the kind the record states
(`value`, `factory`, `class`, `existing`, `none`) and is otherwise `null`. `importPath` is filled only from the field
the record carries. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`, and
otherwise carries the absence that explains why. No field is derived from the rendered text, from `navigator.language`,
from a position in the provider list, or from a neighbouring record. The function throws on no input.

## Census declarations

These suites read `research/raw/` and derive a shape, so every task they affect declares them in `files:`:

- `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs` — the claims census.
- `scripts/recording-consistency.test.mjs` — the byte-consistency scan.
- `scripts/navigation-blocking.test.mjs` — the claims record's `quotes` and `ruling`.
- `scripts/locale-correctness-shapes.test.mjs` — this milestone's own record, which is also the map (D4).
- `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs` — the gate records (D6).
- `scripts/panel-routes.test.mjs`, `scripts/panel-copy.test.mjs`, `scripts/copy-check.test.mjs`,
  `scripts/transfer-search.test.mjs` — the surface pins.
