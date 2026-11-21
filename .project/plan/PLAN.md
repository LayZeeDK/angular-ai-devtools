# PLAN — M059 teardown-leak

Milestone: teardown-leak · Branch: gsd-path/M059 · Baseline: 23736c46471a613db1bf5a2cf9e62a454a8fbbc1

## Config

Project verify: `npx nx run ai-devtools-companion:build --skip-nx-cache && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html`

The build leads for the reason M054 through M058 stated: `scripts/panel-bundle-budget.test.mjs` refuses an
output older than the newest source, and this milestone edits the route table and the loader map the
artifact is built from, so a stale output is exactly what it would hit. The companion build leads too:
the verify's `npm test` leg runs `scripts/ng-context-dev-build.test.mjs`, whose first measurement builds
`ai-devtools-companion` itself. `npm run check` and `npm test` are two separate commands on two separate
legs, never one token, and the trailing `git checkout` discards the working-tree diff of a build artifact.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Decisions recorded at plan time

These are owner decisions. They are recorded here to be executed, not re-litigated.

- D1 — four tasks in the proven shape: T001 measures what the console record and the digest actually
  state, and whether a post-teardown write is producible at all; T002 is the pure join; T003 is the panel
  surface, the demo loader and the route pins; T004 re-derives the recordings and runs the project
  verify. Every task's `files:` stays minimal and disjoint from its siblings' except where a pin closure
  forces a shared declaration, and a file declared only because a suite pins it is the M057 C4 class —
  declared, not edited.
- D2 — the approved INTENT's Edge coverage marks no edge `held-out` (every disposition reads
  `criterion SCn`), and `gsd plan-lint` refuses a `## Held-out checks` table row for an edge the intent
  does not so mark, so the rows are recorded as prose below; each names a test the owning task really
  creates.
- D3 — `apps/angular-ai-devtools/src/app/app.routes.ts` and every suite that enumerates a route table are
  declared by the task that touches a route table: `app.spec.ts`, `page-picker.component.spec.ts`,
  `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs` and `scripts/panel-copy.test.mjs`.
  Five earlier milestones each lost a gate cycle to this omission, and M058 lost two.
- D4 — every task's `## Verify` runs the task's own tests, `npx prettier --check` over each file the task
  touches, and the project typecheck `npm run check`. No task defers the typecheck to the next task.
- D5 — every recording this change re-derives is named with its capture command. A test may read a
  recording; only an explicit armed run (`M059_CAPTURE=1 node --test …`, or the record's own
  `M044_CAPTURE` / `M056_CAPTURE` flag) writes one. New records are named `research/raw/m059-*.json`.
- D6 — C1 governs the plan: no task, criterion or check requires a subscription, effect or timer
  identity, because no record carries one (`handleRecord` 0/38 extension modules, 0 across
  `research/raw/*.json`). The observable is the console's own code `NG0205`
  (`extension/error-digest.json`), and the two absences are states, never inferences.
- D7 — the milestone adds no page-side instrumentation of any kind. Nothing patches `setTimeout`, wraps
  `subscribe` or hooks `effect`; the console subscription the agent already holds is the reading, and a
  diff that adds a second tap is a prohibition breach, not an optimisation.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |
| SC5 | T002 | AC5 |
| SC6 | T001 | AC3 |
| SC1 | T001 | AC2 |
| SC1 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC6 | T003 | AC3 |
| SC5 | T004 | AC1 |
| SC5 | T005 | AC1 |
| SC6 | T004 | AC2 |

The ordering is load-bearing and not aesthetic. `scripts/navigation-blocking.test.mjs` resolves an
in-scope edge to the suite the *first* coverage row of its criterion names, and refuses a criterion whose
edges resolve to two different suites. Every criterion's first row names T002 except SC6, whose first row
names T001: SC1 through SC5 resolve to `scripts/teardown-leak.test.mjs`, and SC6's one edge resolves to
`scripts/teardown-leak-shapes.test.mjs`.

## Held-out checks

D2's rows, recorded as prose because the approved INTENT marks no edge `held-out`:

- **E2** — T002 — `scripts/teardown-leak.test.mjs` — test title `held-out E2: a record with no NG0205 is
  a named absence, not "no leak found"`. Ruling (SC1): the answer states the code it looked for and the
  count it read, never a clean bill of health.
- **E5** — T002 — `scripts/teardown-leak.test.mjs` — test title `held-out E5: the two absences stay two
  states`. Ruling (SC3): a message with a code, no owner and no handle record renders
  `owner-not-in-the-message` and `handle-record-not-held` separately, never joined.
- **E9** — T001 — `scripts/teardown-leak-shapes.test.mjs` — test title `held-out E9: the record is
  read-only and no capture runs on a default run`. Ruling (SC1): a second answer over the same record
  names the same code, message and absences.

Each named test is created by the named task with exactly that title, the task's Verify runs the file that
carries it, and the task's acceptance criteria state the edge id and this ruling.

## Surface contract

### panel — T003

T003 adds one surface and touches every table that enumerates surfaces:

- `apps/angular-ai-devtools/src/app/panel-teardown-leak.ts` — the pane component, exporting
  `teardownLeakPanel`, four states (`finding`, `absent`, `cannot-tell`, `empty`), rendering only the code,
  the message body and the named absences the join returns.
- `apps/angular-ai-devtools/src/app/app.routes.ts` — one entry appended to `PANEL_SURFACES` and one route
  in `appRoutes`, surface key `'teardown-leak'`.
- `apps/angular-ai-devtools/src/app/panel-demo.ts` — one `LOADERS` key `'teardown-leak'` and one `FACTS`
  key beside it.
- `extension/copy-digest.json` — the pane's sentences, added by the digest's own set.
- Pins that enumerate those tables: `app.spec.ts`, `page-picker.component.spec.ts`,
  `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs`.

## Risks

- R1 — **A post-teardown write may not be producible at all.** No capture in this repository has ever
  recorded `NG0205`; the only two occurrences are the digest's enumeration
  (`research/raw/m045-console-shapes.json:192`, `:561`). T001 measures producibility first, and if the
  portal and the fixture cannot produce the diagnostic, the milestone ships the absence-only answer and
  records that as its finding rather than fabricating a diagnostic.
- R2 — **A fixture that leaks deliberately is a fixture change.** `spikes/ng222-app` carries
  `src/app/stale-view-fixture.ts` under an owner ruling; a second such fixture needs a ruling of the same
  kind, so T001 does not add one.
- R3 — **The digest pin moves when the surface's sentences are added.** `scripts/panel-copy.test.mjs`
  hashes the digest; adding rows without re-deriving the hash reddens. T003 owns both halves.
- R4 — **The census moves when a record lands.** `research/raw/m044-gate-shapes.json` and
  `research/raw/m056-gate-stability.json` derive their counts from the tree and from task Logs, so T004
  re-derives both and the census after the last landing, not before.

## Wave 1 — measure what the console record and the digest state

Goal: establish, by measurement, what the agent's console record carries for a post-teardown write and
whether the diagnostic is producible at all. Nothing is answered yet.

T001 owns `research/raw/m059-record-shapes.json` and `scripts/teardown-leak-shapes.test.mjs`. It measures:
the digest entry for `NG0205` (code, title, body); the console record's own shape as M032 and M045
captured it (which fields a message carries, whether a stack survives); whether the portal or the
existing fixture can be driven to emit `NG0205`, and if not, the exact reason with the portal route tried;
and the absent handle record, stated as an absence with its counts.

Review depth: full

## Wave 2 — answer from the record, purely

Goal: the join. `extension/teardown-leak.js` exports `teardownLeak(records)`, a pure function of the
console record, returning one object in every state — `{ state, code, message, owner, absences, claims,
detail }` — where `owner` is filled only from a field the record carries and `absences` names
`owner-not-in-the-message` and `handle-record-not-held`. `scripts/teardown-leak.test.mjs` pins the pure
behaviour and the two held-out rows E2 and E5.

Review depth: full

## Wave 3 — render the answer and pin the route tables

Goal: the surface, the loader, the digest rows and every pin that enumerates those tables, in one task,
because five prior milestones lost a cycle to a pin declared in a later task.

Review depth: full

## Wave 4 — the records, and the project verify

Goal: re-derive the surface record, the verdict-claims record, both gate records and the census with
their own armed commands, then run the project verify at the settled head.

Review depth: full

## Wave 5 — re-derive the gate records

Goal: the two records the ship gate reads, re-derived from the tree that ships, stability last because its
count follows the task Logs this milestone writes.

Review depth: full
