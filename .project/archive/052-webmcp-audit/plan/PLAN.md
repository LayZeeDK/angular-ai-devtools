# PLAN — M052 webmcp-audit

Milestone: webmcp-audit · Branch: gsd-path/M052 · Baseline: b10bffb6

## Config

Project verify: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`

The build leads because `scripts/panel-bundle-budget.test.mjs` refuses an output older than the newest
source: without a fresh build every project verify would compare a stale artifact, which would read as a
defect this milestone did not make. `--skip-nx-cache` because a cached replay restores its recorded output
without refreshing the timestamp that assertion reads.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Corrections

1. The milestone reports a tool list, not API presence, which is already a canary (`control.mjs:1953`).
2. "Whether each tool can be called" is out of scope: it needs a model turn and mutates the page.

- C3 2026-11-19: T003 measured `getTools()` in a live Chrome Beta 159 instance (`research/raw/m052-webmcp-observation.json`): it answers a Promise that resolves to `[]` on a page declaring no tools, not an array. `readTools` judges the synchronous return, so the measured API lands in `cannot-tell`/`unreadable-list`. The reader stays pure and synchronous; the page-world caller awaits and hands the resolved array in. Wiring that await is carried as a residual of this milestone, recorded here rather than silently widening T002 or T003 after they landed.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC2 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC1 | T003 | AC1 |
| SC2 | T003 | AC2 |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/webmcp-audit.test.mjs |

E4 is held-out: a page whose tool list is readable but whose tool descriptions are absent must render
each tool with its name and no invented description, and the same suite asserts the fully-described
case, so "the list rendered" cannot collapse into "the descriptions were invented".

## Surface contract

### panel — T003

Entry: the panel route `webmcp`, rendered through the `webmcp` key in `panel-demo.ts` `LOADERS` and the
`PANEL_SURFACES` entry in `app.routes.ts`, lazy through the shared `loadPanelDemo` closure.

States: `tools` — one block per declared tool, in the reading's own order: the position the block holds,
the name the API reported, and the description only where the descriptor carried one, with no line at
all where it did not; `empty` — the API answered a list and the list held no tool, stated in its own
sentence with no tool block beside it and no reason; `cannot-tell` — the reading's `reason` echoed
verbatim, its `code` and its `detail` on their own labelled lines and a named absence in place of
either one the reason does not carry, with no tool block, no count and no empty-list sentence offered
in its place.

Walkthrough:
1. Open the panel at route `webmcp` with a reading that names tools; the surface renders one block per
   declared tool with the name the API reported and the description it reported where it carried one.
2. Open a reading whose descriptors carry no description; each tool still renders with its name and no
   invented description line (E4).
3. Open a reading whose state is `empty`; the surface states the empty list in its own sentence, with
   no tool block beside it and no reason line.
4. Open a reading whose state is `cannot-tell`; the surface states the reason's `code` and `detail`
   verbatim and renders no tool block, no count and no empty-list sentence in its place.

Criteria: SC1, SC2

## Wave 1 — measure what the WebMCP API exposes to a page

Goal: the milestone rests on what the page's model context actually exposes, measured rather than
assumed from the roadmap sentence.

Review depth: full

T001 reads the canary and the browser fixtures to establish, without inventing, what
`document.modelContext` exposes: a registration function, a readable tool list, or neither. It records
the shape as a recording in `research/raw/m052-webmcp-api.json` with citations to the lines that
establish it, and pins the recording with `scripts/webmcp-api.test.mjs`, which parses it and re-checks
each citation. Verify: `node --test scripts/webmcp-api.test.mjs && npx prettier --check
scripts/webmcp-api.test.mjs`.

## Wave 2 — read the tool list, or refuse

Goal: a pure reading of the measured exposure names each declared tool with its own fields and refuses,
naming the absence, what the API does not expose.

Review depth: full

T002 builds `extension/webmcp-audit.js`: a pure function `readTools(source)` returning
`{ state, tools, reason }` where `state` is `tools`, `empty` or `cannot-tell`. `empty` is only for an
API that exposes a list which is empty; an API with no list is `cannot-tell` naming the absence. No
DOM, no network, no registration. `scripts/webmcp-audit.test.mjs` pins the untouched module, then
mutates four ways: a DOM-derived name, an empty list rendered as "none declared", a refusal collapsed
into an empty list, and a re-registration used to observe. This task owns held-out E4. Verify:
`node --test scripts/webmcp-audit.test.mjs && npx prettier --check extension/webmcp-audit.js
scripts/webmcp-audit.test.mjs`.

## Wave 3 — render the three states and pin the route

Goal: the states render on a panel surface and every suite that enumerates the route table names the
route before it is asked, not after a landing refuses.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-webmcp.ts`, rendering each tool with the name and
description the API reports and `empty` distinct from `cannot-tell`, plus a `LOADERS` key and a
`PANEL_SURFACES` entry. It declares the route table in `apps/angular-ai-devtools/src/app/app.routes.ts`,
the loader in `apps/angular-ai-devtools/src/app/panel-demo.ts`, the four app specs
(`app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`,
`panel-demo.spec.ts`), the route-table suites (`scripts/panel-routes.test.mjs`,
`scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`,
`scripts/gate-integrity-default-tasks.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`)
and `extension/panel/index.html` before starting. Its verify runs the build, then the whole suite —
whose first leg reads `research/raw/m052-verdict-claims.json`, so the task declares that recording
without editing it — then discards the rebuilt `extension/panel/index.html` and prettier-checks the new
surface.

## Wave 4 — record the surface, capture the claims and run the project verify

Goal: the surface is recorded, the claims record and every recording this milestone stales are
re-derived with their own capture commands, and the project verify runs at the head that ships.

Review depth: full

T004 appends the Log after the last recording byte, records the route, the loader key and each state
with the report field it reads into `research/raw/m052-surface.json`, captures
`research/raw/m052-verdict-claims.json` with its own capture command, re-derives the recordings the
milestone stales (`research/raw/m048-surface-copy.json`, `research/raw/m048-surface.json`,
`research/raw/m049-surface.json`, `research/raw/m050-surface.json`, `research/raw/m051-surface.json`,
`research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json`,
`extension/copy-digest.json`), and runs the project verify. It declares every suite that enumerates a
table or pins a recording it re-derives — `scripts/copy-check.test.mjs`,
`scripts/navigation-blocking.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`,
`scripts/gate-stability-record.test.mjs`, `scripts/held-out-corpus.test.mjs`,
`scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`,
`scripts/console-panel-record.test.mjs`, `scripts/console-panel-render.test.mjs`,
`scripts/error-boundary-capture.test.mjs`, `scripts/stability-capture.test.mjs` and
`apps/angular-ai-devtools/src/app/panel-demo.spec.ts` — here rather than discovering them by refusal.
