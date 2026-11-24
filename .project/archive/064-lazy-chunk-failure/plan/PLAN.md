# PLAN — M064 lazy-chunk-failure

Milestone: M064 — lazy-chunk-failure · Branch: gsd-path/M064 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 2

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

Seven waves, seven tasks. T001 writes the failure record, T002 is the pure join, T003 is the panel surface with every pin
moved in the same commit, T004 the claims record, T005 the portal capture, T006 the six censused recordings, T007 the
project verify.

Two amendments this plan carries from M063. Every recording *any* suite censuses is declared in both tasks that run it,
not only the records a task pins, because M063's plan declared only what it pinned and needed three dispatch rounds.
And the verify runs detached and restores `extension/panel/index.html` afterwards, because the build rewrites it with a
non-deterministic modulepreload order and the held-out leg alone takes 23 minutes.

## Waves

## Wave 1 — T001: record the import failures the router produces
Goal: Write the observable: one record per dynamic-import attempt, carrying the specifier, the route path, the response status and the content hash when there is one — or the fact that the request never completed.
Review depth: full

## Wave 2 — T002: join the record into four states, purely
Goal: Join the failure record into the four states, with no read of the page, no second network read and no attribution the record does not carry.
Review depth: full

## Wave 3 — T003: render the answer and pin every route table
Goal: Render exactly the join's object in one new panel surface, and move every list that enumerates the surface in the same task.
Review depth: full

## Wave 4 — T004: write the verdict claims the census derives
Goal: Record the intent's five-column edge table as a claims record whose citations the census can check.
Review depth: full

## Wave 5 — T005: measure the failure on the portal, and record what it showed
Goal: Take the verdict on the Insurance Portal, and record the route tried, what the page showed and why a fixture was or was not needed.
Review depth: full

## Wave 6 — T006: re-derive the navigation and teardown recordings
Goal: Re-derive `m057` and `m059`, the two recordings whose pins this milestone moves, and leave both green.
Review depth: full

## Wave 7 — T007: re-derive the style-read and webmcp recordings
Goal: Correct the two recordings that quote `extension/manifest.json`, which task one of this milestone changed.
Review depth: full

## Wave 8 — T008: re-derive the gate record, then run the project verify
Goal: Derive the two gate records in the order the gate requires, then run the project verify until it reaches its last leg.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC3 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC4 | T003 | AC1 |
| SC1 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC4 | T004 | AC3 |
| SC1 | T005 | AC1 |
| SC2 | T005 | AC2 |
| SC1 | T006 | AC1 |
| SC1 | T007 | AC1 |
| SC1 | T008 | AC1 |
| SC4 | T008 | AC2 |

## Held-out checks

- E1 → T002 → `scripts/chunk-failure.test.mjs`
- E2 → T002 → `scripts/chunk-failure.test.mjs`
- E3 → T002 → `scripts/chunk-failure.test.mjs`
- E4 → T002 → `scripts/chunk-failure.test.mjs`
- E5 → T001 → `scripts/import-failure.test.mjs`
- E6 → T003 → `scripts/panel-routes.test.mjs`
- E7 → T002 → `scripts/chunk-failure.test.mjs`
- E8 → T003 → `scripts/chunk-failure-copy.test.mjs`

## Surface contract

### panel — T003

Criteria: SC4

Entry: the panel route `chunk-failure`, rendered through the `chunk-failure` key in `panel-demo.ts` `LOADERS`, its sample
in `FACTS`, and the `PANEL_SURFACES` entry in `app.routes.ts` that the shared `loadPanelDemo` closure installs lazily.

States: `missing-import` — the answer names the import specifier, the owning route path and the response status, and
nothing else; `never-completed` — the request produced no response, rendered as that absence with its reason and never as
a 404 or a version drift (E3, N1); `resolved` — the import loaded, rendered as a success rather than an empty failure
(E1); `cannot-tell` — the record does not state what the answer asked, naming the reason it states and no cause. A hash
the record truncates is rendered truncated (E4), and both failures of one navigation are rendered in router order (E2).

One new surface, `apps/angular-ai-devtools/src/app/panel-chunk-failure.ts`, renders exactly those fields: no remedy, no
cause, no version drift (N4). The route table, `app.spec.ts`, `scripts/panel-routes.test.mjs` and
`scripts/after-render-fixture.test.mjs` move in the same task, because each of them enumerates the surface.

Walkthrough:

1. The panel loads the surface through its `chunk-failure` loader key and renders whichever state the join returned.
2. Each state renders the specifier, the route path and the status line, or the named absence that replaces it, and never
   a value read from the page.
3. A navigation with two failed imports renders both rows in router order, and a request with no response renders the
   never-completed absence with its reason.
4. Nothing on the surface offers a remedy, a cause, a schematic or a version drift, because the record carries none.

