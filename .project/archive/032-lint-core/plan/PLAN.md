# Plan — M032 lint-core

Milestone: lint-core
Branch: gsd-path/M032

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — what the page can actually observe

Goal: The intent's correction says NG8xxx diagnostics are compile-time and the tool reads a running page, so the
first task is a measurement, not an implementation. T001 records which NG-coded diagnostics a development build of
the fixture emits into the browser console, what each message says, and whether it names an element or component. T002
builds the read against that recording.

Review depth: full

T001 and T002. A recording of what reaches the console, and a pure join from a captured message to a construct, with
an honest absence state.

## Wave 2 — the surface and the recordings

Goal: T003 renders the construct, the code when the digest carries one, and the "cannot tell" state. T004 re-records
everything the fixture change stales: both control-skill feature manifests, both development-build recordings, the
panel route pin and the milestone's verdict claims.

Review depth: full

T003 and T004. The panel shows the construct and the absence state; every recording the change staled is re-recorded
from a cleared output path and proved by reverting one recorded value.

## Wave 3 — the demo registration

Goal: T005 makes the surface reachable. T003 installed the route, but the demo owns the loader map and has no `lint` key, so the page renders the demo's error branch. The same gap was fixed by hand for four earlier surfaces, so this wave adds the check that generalises instead of patching one key.

Review depth: verify-only

### T005 — Register the lint surface in the panel demo

- Deps: T003
- Files: `apps/angular-ai-devtools/src/app/panel-demo.ts`, `scripts/panel-routes.test.mjs`
- Approach: add the `lint` loader and a sample fact list, and compare every `data.surface` in
  `app.routes.ts` against the demo's `LOADERS` keys so a surface without a loader fails a check
  instead of rendering the demo's error branch.
- Acceptance: AC1 a real state renders; AC2 E4 the surfaces-versus-loaders check; AC3 a mutant that
  drops the `lint` key reddens naming `lint`; AC4 the route pins stay green.

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/lint-core.test.mjs |
| E2 | T002 | scripts/lint-core.test.mjs |
| E3 | T002 | scripts/lint-core.test.mjs |
| E4 | T003 | scripts/panel-lint.test.mjs |

## Intent coverage
| SC4 | T005 | AC2 |

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC5 | T004 | AC4 |

## Prohibitions

| Prohibition | Task | Enforcement |
|---|---|---|
| N1 | T002 | reads the console messages the agent already captures; no compiler patch, no build subscription |
| N2 | T001 | records what the message states, never a cause it does not |
| N3 | T002 | a diagnostic the page cannot supply yields "cannot tell"; no construct is matched by proximity |
| N4 | T003 | the surface renders the fact list and the absence state only |
| N5 | T004 | the gate runs at the head, unweakened; no recording is widened or skipped |

## Surface contract

### panel — T003

Entry: the panel surface at `/panel/lint`, rendering from a fact list.

States: `loading`, `finding` (construct, code, message), `cannot-tell` (reason only), `error` (reason carried, not
rendered as a cause).

Walkthrough:
1. A captured message whose code the digest carries renders the construct, the code and the message, and names no
   cause the message does not state.
2. A captured message whose code the digest does not carry renders "cannot tell" with its reason, and no construct.
3. An empty fact list renders the loading state, never an empty table that reads as "nothing was wrong".

Criteria: SC4

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`
