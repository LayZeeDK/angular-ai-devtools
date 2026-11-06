# Plan — M034 lint-legacy

Milestone: lint-legacy
Branch: gsd-path/M034

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — what the page actually says about a legacy construct

Goal: The intent's correction says the compile-time legacy lint does not run here and the digest carries no `NG81xx`
entry, leaving `NG6100 NgModule.id` as the only runtime legacy code the digest knows. Whether that code reaches the
page at all, and whether its message names the module or the element, is unmeasured. T001 records it; T002 builds the
join against that recording.

Review depth: full

T001 and T002. A recording of which legacy diagnostics reach the console, and a pure join from a captured legacy
diagnostic to the construct it names, with an honest absence state.

## Wave 2 — the surface and the recordings

Goal: T003 renders the construct, the code and the modern equivalent only when the digest's entry states one, and
registers itself in the panel demo in the same task. T004 re-records everything the fixture change stales: both
control-skill feature manifests, both development-build recordings, the router-configuration recording and the
milestone's verdict claims.

Review depth: full

T003 and T004. The panel shows the construct and the absence state and is reachable from the demo's loader map;
every recording the change staled is re-measured from a cleared output path.

### T001 — Measure what the page says about a legacy construct

- Deps: none
- Files: `spikes/ng222-app/src/app/legacy-module-page.ts`, `spikes/ng222-app/src/app/legacy-module.ts`,
  `spikes/ng222-app/src/app/app.routes.ts`, `scripts/legacy-diagnostic-capture.test.mjs`,
  `research/raw/m034-legacy-diagnostic.json`, `scripts/router-config-capture.test.mjs`,
  `research/raw/m030-router-config.json`, `scripts/after-render-fixture.test.mjs`
- Acceptance: the recording states, with the command it ran and that command's output, whether any legacy-construct
  diagnostic reaches a development build's console; for each one it records the code, the message text, and whether
  the message names a module or an element; it records the digest entry for each code found, so the modern-equivalent
  question is answered from data rather than assumed; a capture writes nothing unless `M034_CAPTURE=1`; and both
  recordings that pin the fixture's route table — the router configuration and the route-table count — are re-measured
  because this task adds a route.
- Verify: `node --experimental-strip-types --test "scripts/legacy-diagnostic-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"`

### T002 — Join a legacy diagnostic to its construct

- Deps: T001
- Files: `extension/legacy-diagnostic.js`, `scripts/legacy-diagnostic.test.mjs`
- Acceptance: a captured diagnostic carrying a code the digest knows and naming a construct produces a finding naming
  that construct and the code, and the modern equivalent only when the digest's own entry states one; a code the digest
  does not carry produces `cannot-tell` with reason `code-not-in-digest` and no equivalent; a message naming no construct
  produces `cannot-tell` with reason `message-names-no-construct`; the finding states whether an equivalent was sourced;
  the module reads no clock, console or DOM; two mutants redden by name, one naming an unsourced equivalent and one
  dropping the construct.
- Verify: `node --experimental-strip-types --test "scripts/legacy-diagnostic.test.mjs"`

### T003 — Panel surface for the legacy finding

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-legacy.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`,
  `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`,
  `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`,
  `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `scripts/panel-legacy.test.mjs`,
  `scripts/panel-routes.test.mjs`
- Acceptance: the surface renders the construct, the code and the modern equivalent from a short fact list, and the
  cannot-tell state with its reason and no equivalent; a fact list carrying a remedy, a deprecation verdict or an element
  renders none of them; the route is registered in the demo's loader map with a sample fact, and the surfaces-versus-
  loaders check names it; every route-table pin this route stales is re-cut; a mutant that renders an unsourced
  equivalent reddens by name.
- Verify: `node --experimental-strip-types --test "scripts/panel-legacy.test.mjs" "scripts/panel-routes.test.mjs" && npx tsc -p apps/angular-ai-devtools/tsconfig.check.json`

### T004 — Re-record everything the fixture change stales

- Deps: T003
- Files: `.commandcode/skills/control-angular-dev-app/features/.proven.json`,
  `.commandcode/skills/control-angular-devtools/features/.proven.json`, `research/raw/m022-ng-context.json`,
  `research/raw/companion-dev-build.json`, `research/raw/m034-verdict-claims.json`,
  `scripts/fixture-proof-fresh.test.mjs`, `scripts/ng-context-dev-build.test.mjs`,
  `scripts/overlay-verdict-claims.test.mjs`
- Acceptance: both control-skill feature manifests are re-recorded through `fingerprint.mjs` and name both new fixture
  files; `m022-ng-context.json` and `companion-dev-build.json` are re-measured with the output path cleared first, and
  each says so; `m034-verdict-claims.json` quotes each intent criterion in full, none truncated; no value is
  tolerance-adjusted — a moved production bundle hash is the proof a recording was measured; and `npm run check` and
  `npm test` pass at the head.
- Verify: `node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"`

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/legacy-diagnostic.test.mjs |
| E2 | T002 | scripts/legacy-diagnostic.test.mjs |
| E3 | T002 | scripts/legacy-diagnostic.test.mjs |
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

States: loading before a fact list arrives; success with the construct, the code and the modern equivalent when the digest states one; cannot-tell with its reason and no equivalent; error when the fact could not be read.

Walkthrough:

1. The panel is opened and a captured legacy diagnostic is supplied; the surface shows the construct the message named and the code it carried.
2. When the digest entry states a modern equivalent, the surface shows it after the construct; when it does not, the surface shows the construct and states that no equivalent is recorded.
3. A diagnostic carrying an unknown code shows this surface's cannot-tell text and its reason, with no construct and no equivalent.
4. A fact list carrying a remedy, a deprecation verdict or an element renders the construct and the code and none of those three.

Criteria: SC4
