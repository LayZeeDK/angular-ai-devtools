# Plan — M033 lint-router

Milestone: lint-router
Branch: gsd-path/M033

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — what the router actually says

Goal: The intent's first correction says the roadmap's "route declaration is flagged" describes a compile-time lint
that no tsconfig here enables, and its second says the digest carries six router codes and not the runtime `NG04002`
family. So the first task is a measurement, not an implementation: T001 records which router diagnostics a development
build of the fixture emits into the browser console, what each message says, and whether it names a configured path.
T002 builds the join against that recording.

Review depth: full

T001 and T002. A recording of what reaches the console, and a pure join from a captured navigation failure to the
configured routes it failed to match, with an honest absence state.

## Wave 2 — the surface and the recordings

Goal: T003 renders the route, the finding and the remedy, and registers itself in the panel demo — the gap that cost
M032 an extra task. T004 re-records everything the fixture change stales: both control-skill feature manifests, both
development-build recordings, M030's router-configuration recording, the panel route pin and the milestone's verdict
claims.

Review depth: full

T003 and T004. The panel shows the route and the absence state and is reachable from the demo's loader map; every
recording the change staled is re-measured from a cleared output path and proved by reverting one recorded value.

### T001 — Measure what the router says on the fixture

- Deps: none
- Files: `spikes/ng222-app/src/app/router-lint-page.ts`, `spikes/ng222-app/src/app/app.routes.ts`,
  `spikes/ng222-app/src/app/router-lint.ts`, `scripts/router-diagnostic-capture.test.mjs`,
  `research/raw/m033-router-diagnostic.json`, `scripts/router-config-capture.test.mjs`,
  `research/raw/m030-router-config.json`
- Acceptance: the recording states, with the command and its output, whether any router diagnostic reaches the page
  console; for each one it records the code, the message text and whether the message names a configured path; it
  records the router configuration read at the same instant so attribution can be decided against it; a capture
  writes nothing unless `M033_CAPTURE=1`; and the router-configuration recording is re-measured because this task
  adds a route to the same fixture.
- Verify: `node --experimental-strip-types --test "scripts/router-diagnostic-capture.test.mjs" "scripts/router-config-capture.test.mjs"`

### T002 — Join a routing failure to the configured routes it failed to match

- Deps: T001
- Files: `extension/router-diagnostic.js`, `scripts/router-diagnostic.test.mjs`
- Acceptance: a message naming a segment that matches no configured path produces a finding naming that segment and
  stating that none of the configured routes matches it, carrying the code the message stated even though the digest
  does not carry it; a segment that does match a configured path produces `cannot-tell` with reason
  `segment-matches-configuration`; a message with no extractable segment produces `cannot-tell` with reason
  `no-url-segment`; the finding states how many configured paths were compared and names no route as the owner; the
  module reads no clock, console or DOM.
- Verify: `node --experimental-strip-types --test "scripts/router-diagnostic.test.mjs"`

### T003 — Panel surface for the router finding

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-router.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`,
  `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`,
  `scripts/panel-router.test.mjs`, `scripts/panel-routes.test.mjs`
- Acceptance: the surface renders the configured route, the finding and the remedy from a short fact list, and the
  cannot-tell state with its reason and no route; a fact list carrying a guard verdict, a resolver outcome or a
  redirect decision renders none of them; the route installs `PanelDemoComponent` and the demo's loader map carries a
  `router` entry, so `/panel/router` renders the surface rather than the demo's error branch.
- Verify: `node --experimental-strip-types --test "scripts/panel-router.test.mjs" "scripts/panel-routes.test.mjs"`

### T004 — Re-record everything the fixture change stales

- Deps: T001, T003
- Files: `.commandcode/skills/control-angular-dev-app/features/.proven.json`,
  `.commandcode/skills/control-angular-devtools/features/.proven.json`,
  `research/raw/companion-dev-build.json`, `research/raw/m022-ng-context.json`,
  `research/raw/m033-verdict-claims.json`, `scripts/facade-dev-build.test.mjs`,
  `scripts/ng-context-dev-build.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`
- Acceptance: both feature manifests are re-recorded with `fingerprint.mjs record` and name the new fixture page; both
  development-build recordings are re-measured from a cleared output path and state that the output was cleared first;
  the milestone's verdict claims are generated by `gsd verdict-record` and quote each criterion in full; no recorded
  value is nudged to fit — a bundle hash that did not move means the build did not change.
- Verify: `node --experimental-strip-types --test "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"`

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T001 | scripts/router-diagnostic-capture.test.mjs |
| E2 | T002 | scripts/router-diagnostic.test.mjs |
| E3 | T002 | scripts/router-diagnostic.test.mjs |
| E4 | T003 | scripts/panel-router.test.mjs |

## Intent coverage

| Criterion | Task | Criterion |
|---|---|---|
| SC1 | T001 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC5 | T004 | AC4 |

## Prohibitions

| Prohibition | Criterion | Must not | Task |
|---|---|---|---|
| N1 | SC2 | add a second page-side instrumentation path, or scrape a build log or CI artefact | T002 |
| N2 | SC3 | name a guard verdict, a resolver outcome or a redirect decision the configuration does not record | T002 |
| N3 | SC3 | attribute a finding to the nearest route, or to the only route when several could match | T002 |
| N4 | SC4 | render a remedy the fact list does not support | T003 |
| N5 | SC5 | weaken a suite, skip a case, or tolerate a red gate to reach green | T004 |
| N6 | SC1 | name a route the configuration does not contain, or a remedy the diagnostic does not support | T001 |

## Surface contract

### panel — T003

Entry: the panel surface at `/panel/router`, rendering from a fact list.

States: `loading`, `finding` (the unmatched segment, the count of configured paths compared, the code the message
stated), `cannot-tell` (reason only), `error` (reason carried, not rendered as a cause).

Walkthrough:
1. A navigation failure whose segment matches no configured path renders the segment, the statement that none of the
   configured routes matches it, and the code, and names no route as the owner.
2. A navigation failure whose segment does match a configured path renders "cannot tell" with its reason, and no claim
   about why the navigation failed.
3. An empty fact list renders the loading state, never an empty table that reads as "no route is at fault".

Criteria: SC4
