# Plan — M036 resource-lifecycle

Milestone: M036 resource-lifecycle
Branch: gsd-path/M036
Project verify: `npm run check` and `npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: on
- finding_skeptics: off

- Review depth: full on every wave; a three-member panel on the wave that carries the join.
- Route-table pins move in this milestone, so every suite that enumerates the route table is declared up front.
- `research/08-recent-angular-features.md:170` is corrected in T001, because a wrong hook attribution sends the next
  implementer to a callback that carries no labels.
- No coder may weaken a held-out test; a moved value is re-measured, never tolerated.

## Wave 1 — what the graph can prove, and the fixture subjects

Goal: the read is measured on both installed versions before anything depends on it, and the fixture grows one resource per
state the explainer must show, including an idle-by-design resource whose params can produce nothing.

Review depth: full

T001 measures `ɵgetSignalGraph` on both versions, adds the four fixture resources, and corrects the research sentence that
names the wrong hook.

### T001 — Measure the graph hook and give the fixture one resource per state

- Deps: none
- Files: `spikes/ng222-app/src/app/resource-states.ts`, `spikes/ng222-app/src/app/resource-page.ts`,
  `spikes/ng222-app/src/app/app.routes.ts`, `scripts/resource-graph-capture.test.mjs`,
  `research/raw/m036-resource-graph.json`, `research/08-recent-angular-features.md`,
  `scripts/after-render-fixture.test.mjs`, `scripts/router-config-capture.test.mjs`,
  `scripts/router-diagnostic-capture.test.mjs`, `scripts/router-diagnostic.test.mjs`,
  `research/raw/m030-router-config.json`, `research/raw/m033-router-diagnostic.json`
- Acceptance: the recording proves `ɵgetSignalGraph` is present on both installed versions and that a resource produces
  `Resource#<name>.<field>` labels; the fixture has four resources whose states are loading, resolved, errored and
  idle-by-design; every moved route pin is re-cut to its measured value; `research/08` no longer attributes the labels to
  `ɵsetProfiler`.
- Verify: `node --experimental-strip-types --test "scripts/resource-graph-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"`

## Wave 2 — the join, the surface and the recordings

Goal: the join answers the four states from the labelled signals, the surface renders them and nothing else, and every
recording that the new fixture route staled is re-measured.

Review depth: full

T002 builds the join, T003 renders it inside the panel and re-cuts the panel's own pins, T004 re-records and runs the gate.

### T002 — Join the resource state machine to a finding

- Deps: T001
- Files: `extension/resource-lifecycle.js`, `scripts/resource-lifecycle.test.mjs`
- Acceptance: a resource whose status is loading yields a finding naming the `Resource#<name>` identity, the status and the
  params status; an idle-by-design resource says so and names no error; an unreadable or absent resource yields
  `cannot-tell` with a reason; no emitted string names a cause inside the loader.
- Verify: `node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs"`

### T003 — Panel surface for the resource finding

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-resource.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`,
  `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`,
  `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `scripts/panel-resource.test.mjs`,
  `scripts/panel-routes.test.mjs`, `scripts/router-diagnostic.test.mjs`,
  `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- Acceptance: the surface renders the resource, the state and the params status, shows the cannot-tell reason, and renders
  no cause, verdict or error the fact does not carry; every route pin is re-cut to its measured value; the loader mutant
  names the missing surface.
- Verify: `node --experimental-strip-types --test "scripts/panel-resource.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs"`

### T004 — Re-record everything the fixture change stales

- Deps: T003
- Files: `.commandcode/skills/control-angular-dev-app/features/.proven.json`,
  `.commandcode/skills/control-angular-devtools/features/.proven.json`, `research/raw/m022-ng-context.json`,
  `research/raw/companion-dev-build.json`, `research/raw/m036-verdict-claims.json`,
  `scripts/fixture-proof-fresh.test.mjs`, `scripts/ng-context-dev-build.test.mjs`,
  `scripts/overlay-verdict-claims.test.mjs`
- Acceptance: both feature manifests name the new fixture files; both development-build recordings are re-measured with
  their output path cleared first; the verdict claims quote every criterion in full; the project gate passes at the head.
- Verify: `node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"`

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/resource-lifecycle.test.mjs |
| E2 | T002 | scripts/resource-lifecycle.test.mjs |
| E3 | T002 | scripts/resource-lifecycle.test.mjs |
| E4 | T002 | scripts/resource-lifecycle.test.mjs |
| E5 | T003 | scripts/panel-resource.test.mjs |

## Intent coverage

| Criterion | Task | Criterion |
|---|---|---|
| SC3 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |
| SC5 | T003 | AC1 |
| SC6 | T004 | AC4 |

## Prohibitions

| Prohibition | Task | Must not |
|---|---|---|
| N1 | T002 | name a cause that lives inside the loader |
| N2 | T002 | report an idle-by-design resource as loading |
| N3 | T002 | correlate with network timing to infer a stall |
| N4 | T002 | name a stuck request without an observed unresolved state |
| N5 | T003 | render a cause, a verdict or an error the fact does not carry |
| N6 | T004 | weaken a test or widen a tolerance to pass the gate |

## Surface contract

### panel — T003

- Entry: `panelResource(facts)` in `apps/angular-ai-devtools/src/app/panel-resource.ts`, registered as a `data.surface`
  route with a loader in `panel-demo.ts`.
- States: loading, finding, cannot-tell, error — the four the sibling surfaces already use.
- Walkthrough: the loader supplies a fact list from the join's own output; the surface renders `resource`, `state` and
  `params` for a finding, only `reason` for cannot-tell, and nothing it was not handed.
- Criteria: SC5, and the fixture pin that fails when a surface has no fixture.
