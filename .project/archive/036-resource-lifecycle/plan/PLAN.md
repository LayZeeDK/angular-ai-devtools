# Plan — M036 resource-lifecycle

Milestone: M036 resource-lifecycle
Branch: gsd-path/M036
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

Reviews are run as a three-member `lars-review` panel (Beam, Glyph, GLM) rather than through the pipeline's
panel runner, which this host does not configure; `review_panel: off` records that the pipeline step is not in use.

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

## Wave 3 — Widen the statuses and close the echoed identity

Goal: the join names the fifth status the graph reports, and no caller-supplied value reaches a finding unread.

Review depth: full

### T005 — Widen the statuses and close the echoed identity

- Deps: none
- Files: `extension/resource-lifecycle.js`, `scripts/resource-lifecycle.test.mjs`, `research/08-recent-angular-features.md`,
  `scripts/docs-correction.test.mjs`
- Acceptance:
  1. held-out E2: `reloading` produces a finding distinct from `loading`; an identity not beginning `Resource#` yields `cannot-tell` with reason `resource-unnamed` (held-out E2)
  2. `research/08-recent-angular-features.md:137` attributes status to the `.status` nodes, and `:170` names `.status`
  3. the purity assertions hold inside the sandbox, and a module using `Date` or `console` reddens
  4. an unmeasured params read yields `params-unavailable`
- Verify: `node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs" && node --experimental-strip-types --test "scripts/docs-correction.test.mjs"`

## Wave 4 — Accept every name the graph emits

Goal: the identity gate accepts every label `createDebugNameObject` can build, and no reason claims a read failed when it
succeeded.

Review depth: full

One task. T006 closes the three verified findings of the waves 2-3 panel and three stale literals: whitespace-bearing
debug names are accepted, `local` is answered as a set value rather than an unread one, the two recordings name the routed
path, and the pane's reason list reaches five.

### T006 — Accept every name the graph emits

- Deps: none
- Files: `extension/resource-lifecycle.js`, `scripts/resource-lifecycle.test.mjs`,
  `apps/angular-ai-devtools/src/app/panel-resource.ts`, `scripts/panel-resource.test.mjs`,
  `research/raw/m022-ng-context.json`, `research/raw/m036-verdict-claims.json`, `research/raw/m035-onpush-metadata.json`
- Acceptance:
  1. held-out E2: a label whose name contains a space is a finding, and a bare `Resource`, an empty name and an untrimmed value are refused (held-out E2)
  2. held-out E2: `local` produces a finding that says the value was set (held-out E2)
  3. both recordings name `resource-states` and none says `/resource`
  4. the pane's reason list covers five and `resource-unnamed` is rendered through it
  5. the M035 build recording is re-recorded at this head or states its staleness
- Verify: `node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs" && node --experimental-strip-types --test "scripts/panel-resource.test.mjs" && node --experimental-strip-types --test "scripts/recording-consistency.test.mjs"`

## Wave 5 — Bridge the fixture install in a verify sidecar

Goal: the project Verify can pass in the sidecar the pipeline uses, so a green primary is not a red gate.

Review depth: verify-only

One task. T007 extends `scripts/ensure-sidecar-deps.mjs` so the fixture's nested install is bridged like the root one. The
gate failure it fixes is environmental: `facade-dev-build` refuses to run without `spikes/ng222-app/node_modules`, which no
sidecar receives.

### T007 — Bridge the fixture install in a verify sidecar

- Deps: none
- Files: `scripts/ensure-sidecar-deps.mjs`, `scripts/sidecar-deps-bridge.test.mjs`, `scripts/facade-dev-build.test.mjs`
- Acceptance:
  1. held-out E1: a sidecar without a fixture install gets one bridged to the primary's, and a second run reuses it (held-out E1)
  2. held-out E2: a primary without a fixture install is left alone and the script exits 0 (held-out E2)
  3. a real directory at the fixture path is refused, as at the root
  4. `facade-dev-build` passes in a sidecar whose fixture install was bridged
- Verify: `node --experimental-strip-types --test "scripts/sidecar-deps-bridge.test.mjs" && node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs"`

## Wave 6 — Copy the fixture install into a verify sidecar

Goal: the fixture's dependency graph resolves inside the sidecar, so the resolution assertions measure what they claim.

Review depth: verify-only

One task. T008 replaces T007's junction with a copy, because a junction makes the fixture resolve into the primary and the
peer-resolution assertions then compare two different roots.

### T008 — Copy the fixture install into a verify sidecar

- Deps: none
- Files: `scripts/ensure-sidecar-deps.mjs`
- Acceptance:
  1. held-out E1: a sidecar receives a copy whose entries are real files and whose relative symlink survives (held-out E1)
  2. held-out E2: a primary without a fixture install is left alone and the script exits 0 (held-out E2)
  3. an existing fixture install in the sidecar is never overwritten
  4. the peer-resolution assertions pass in a sidecar
- Verify: `node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs" && node --experimental-strip-types --test "scripts/ng-context-dev-build.test.mjs"`

## Wave 7 — Scope the root-copy assertions

Goal: make the project Verify runnable in the sidecar it has always used, without weakening a single assertion.

Review depth: verify-only

`T009` gates the three root-copy assertions on the checkout being a root checkout. Everything else in the suite runs
in both layouts.

- `T009` -- Scope the root-copy assertions to a root checkout
  - Deps: T007, T008
  - Files: `scripts/facade-dev-build.test.mjs`
  - Acceptance: AC1 on the verify branch, AC2 mutant, AC3 unchanged count
  - Verify: `node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs"`

## Wave 8 — Repair the copied fixture links

Goal: make the copied fixture install carry working links, so the sidecar measures the same graph as the root.

Review depth: verify-only

`T010` recreates each copied symlink from the source's own target string.

- `T010` -- Repair the copied fixture links
  - Deps: T008
  - Files: `scripts/ensure-sidecar-deps.mjs`
  - Acceptance: AC1 target string equality, AC2 repair on rerun, AC3 facade passes
  - Verify: `node --experimental-strip-types --test "scripts/ensure-sidecar-deps.test.mjs"`

## Wave 9 — Guard the fixture-relative real path

Goal: close the last sidecar-layout assertion, so the project Verify can pass in isolation.

Review depth: verify-only

- `T011` -- Guard the fixture-relative real path
  - Deps: T009
  - Files: `scripts/facade-dev-build.test.mjs`
  - Acceptance: AC1 skip on the verify branch, AC2 four guards
  - Verify: `node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs"`

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
| SC1 | T005 | AC1 |
| SC1 | T006 | AC1 |
| SC4 | T006 | AC2 |
| SC6 | T007 | AC1 |
| SC6 | T008 | AC4 |
| SC3 | T005 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |
| SC5 | T003 | AC1 |
| SC6 | T004 | AC4 |
| SC6 | T009 | AC1 |
| SC6 | T010 | AC1 |
| SC6 | T011 | AC1 |

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

Entry: the panel route `/resource`, reachable from the panel demo's loader map like every other surface.

States: loading before a fact list arrives; a finding with the resource identity, the state and the params status; cannot-tell
with its reason and nothing else; error when the fact cannot be read at all.

Walkthrough:

1. The panel is opened on the resource fixture page; the surface shows the resource the graph named and the state it reported.
2. The params status is shown beside the state, so idle-by-design reads differently from still loading.
3. A resource whose status could not be read shows this surface's cannot-tell text and its reason, with no resource, no state
   and no cause.

Criteria: SC5
