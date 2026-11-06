# Plan — M034 lint-legacy

Milestone: lint-legacy
Branch: gsd-path/M034

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — what the page actually shows, and what the modern form is

Goal: T001 landed the measurement that closed the diagnostic route — `NG6100` fires in the dev server's output and never
reaches the page console. Ruling (delegated under the owner's standing instruction, "complete the next milestone
end-to-end without a human-in-the-loop, with full milestone decision authority"): the milestone is re-scoped to the one
legacy axis the page does show, a component declared in an NgModule rather than standalone. Dev-server instrumentation is
excluded by the owner's own ruling — "we support any served Angular application running in Development mode, whether
served statically or via a dev server ... opt-in runtime instrumentation via for example providers but not dev server
instrumentation" — so the subject cannot be the compiler's diagnostic. The modern form must come from a cited table whose every
entry quotes the guidance it cites, captured rather than written from memory. T002 captures that table and builds the
join.

Review depth: full

T001 and T002. One landed recording that closes the diagnostic route, one cited equivalents recording, and a pure join
from a selected component's standalone flag to a finding with an honest absence state.

## Wave 2 — the surface and the recordings

Goal: T003 renders the structure and the modern form, and registers itself in the panel demo in the same task. T004
re-records everything the fixture change stales and runs the project gate.

Review depth: full

T003 and T004. The panel shows the structure and the cannot-tell state and is reachable from the demo's loader map;
every recording the change staled is re-measured from a cleared output path.

### T001 — Measure what the page says about a legacy construct

- Deps: none
- Files: `spikes/ng222-app/src/app/legacy-module-page.ts`, `spikes/ng222-app/src/app/legacy-module.ts`,
  `spikes/ng222-app/src/app/app.routes.ts`, `scripts/legacy-diagnostic-capture.test.mjs`,
  `research/raw/m034-legacy-diagnostic.json`, `scripts/router-config-capture.test.mjs`,
  `research/raw/m030-router-config.json`, `scripts/after-render-fixture.test.mjs`,
  `scripts/router-diagnostic-capture.test.mjs`, `research/raw/m033-router-diagnostic.json`
- Acceptance: met and landed at `00aaf19`; the recording proves `NG6100` reaches the dev server's output and never the
  page console (`console.total: 3`, `withAnNgCode: 0`), and the falsification is recorded in the intent.
- Verify: `node --experimental-strip-types --test "scripts/legacy-diagnostic-capture.test.mjs"`

### T002 — Join a component's structure to the modern form

- Deps: T001
- Files: `extension/legacy-structure.js`, `scripts/legacy-structure.test.mjs`,
  `scripts/legacy-equivalents-capture.test.mjs`, `research/raw/m034-equivalents.json`
- Acceptance: a selected component whose `ɵcmp.standalone` is false produces a finding naming the component and stating
  that it is NgModule-declared, with the modern form taken from the equivalents table; a standalone component produces
  `cannot-tell` with reason `already-standalone`; unreadable metadata produces `cannot-tell` with reason
  `metadata-unreadable`; every equivalents entry carries a URL and a verbatim quote, captured with `M034_EQUIV_CAPTURE=1`
  and stored with its retrieval time, so no equivalent is written from memory; a mutant that renders an unsourced
  equivalent reddens by name; the module reads no clock, console or DOM.
- Verify: `node --experimental-strip-types --test "scripts/legacy-structure.test.mjs" "scripts/legacy-equivalents-capture.test.mjs"`

### T003 — Panel surface for the legacy structure finding

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-legacy.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`,
  `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`,
  `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`,
  `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `scripts/panel-legacy.test.mjs`,
  `scripts/panel-routes.test.mjs`, `scripts/router-diagnostic.test.mjs`
- Acceptance: the surface renders the component, the structure and the modern form from a short fact list, and the
  cannot-tell state with its reason and no equivalent; a fact list carrying a remedy, a severity or an element renders
  none of them; the route is registered in the demo's loader map, and the surfaces-versus-loaders check names it when the
  loader is removed; every route-table pin this route stales is re-cut, including the `15 -> 16` counts in
  `scripts/router-diagnostic.test.mjs`.
- Verify: `node --experimental-strip-types --test "scripts/panel-legacy.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs" && npx tsc -p apps/angular-ai-devtools/tsconfig.check.json`

### T004 — Re-record everything the fixture change stales

- Deps: T003
- Files: `.commandcode/skills/control-angular-dev-app/features/.proven.json`,
  `.commandcode/skills/control-angular-devtools/features/.proven.json`, `research/raw/m022-ng-context.json`,
  `research/raw/companion-dev-build.json`, `research/raw/m034-verdict-claims.json`,
  `scripts/fixture-proof-fresh.test.mjs`, `scripts/ng-context-dev-build.test.mjs`,
  `scripts/overlay-verdict-claims.test.mjs`, `scripts/facade-dev-build.test.mjs`
- Acceptance: both control-skill feature manifests are re-recorded through `fingerprint.mjs` and name both fixture files;
  `m022-ng-context.json` and `companion-dev-build.json` are re-measured with the output path cleared first, and each says
  so; `m034-verdict-claims.json` quotes each intent criterion in full, none truncated; no value is tolerance-adjusted — a
  moved production bundle hash is the proof a recording was measured; `npx prettier --check` passes on every file this
  task touched; and `npm run check` and `npm test` pass at the head.
- Verify: `node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"`

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/legacy-structure.test.mjs |
| E2 | T002 | scripts/legacy-structure.test.mjs |
| E3 | T002 | scripts/legacy-structure.test.mjs |
| E4 | T003 | scripts/panel-legacy.test.mjs |

## Intent coverage

| Criterion | Task | Criterion |
|---|---|---|
| SC1 | T001 | AC1 |
| SC3 | T001 | AC3 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC5 | T004 | AC4 |

## Prohibitions

| Prohibition | Task | Criterion |
|---|---|---|
| N1 | T002 | SC1 |
| N2 | T002 | SC3 |
| N3 | T002 | SC3 |
| N4 | T003 | SC4 |
| N7 | T002 | SC2 |

## Surface contract

### panel — T003

Entry: the panel route `/legacy`, reachable from the panel demo's loader map like every other surface.

States: loading before a fact list arrives; success with the component, the structure and the modern form; cannot-tell with its reason and no equivalent; error when the fact could not be read.

Walkthrough:

1. The panel is opened and a component is supplied; the surface shows the component and states whether it is NgModule-declared.
2. When the structure is legacy, the surface shows the modern form after it, quoted from the cited table.
3. A standalone component shows this surface's cannot-tell text and its reason, with no modern form.
4. A fact list carrying a remedy, a severity or an element renders the component and the structure and none of those three.

Criteria: SC4
