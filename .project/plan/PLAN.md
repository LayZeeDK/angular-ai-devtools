# Plan — M038 linked-state-reset

Milestone: linked-state-reset
Branch: gsd-path/M038
Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — measure the subject and the label

Goal: establish which node label a linked signal carries on this build, and author the two fixture states the criteria need — one matching its source, one differing.

Review depth: full

T001 measures before it authors: one task, because the label decides whether the rest of the milestone is buildable.

### T001 — Measure the linked-signal label and author the fixture states

- Deps: none
- Files: `spikes/ng222-app/src/app/linked-state-page.ts`, `spikes/ng222-app/src/app/app.routes.ts`, `scripts/linked-state-capture.test.mjs`, `research/raw/m038-linked-state.json`, `scripts/after-render-fixture.test.mjs`, `scripts/router-config-capture.test.mjs`, `research/raw/m030-router-config.json`, `scripts/router-diagnostic-capture.test.mjs`, `research/raw/m033-router-diagnostic.json`
- Acceptance: records the node label a linked signal carries at this head, and whether the source is reachable; authors one matching and one differing state; the capture is armed and the default run writes nothing.
- Verify: `node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs" "scripts/after-render-fixture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/router-diagnostic-capture.test.mjs"`

## Wave 2 — the join

Goal: turn the recorded labels into a declared finding, or a refusal with a reason.

Review depth: full

### T002 — Join a linked value to the source it follows

- Deps: T001
- Files: `extension/linked-state.js`, `scripts/linked-state.test.mjs`
- Acceptance: a matching value and a differing value produce distinct findings; an unreadable source produces cannot-tell with a named reason; no finding names a write, an owner or a cause.
- Verify: `node --experimental-strip-types --test "scripts/linked-state.test.mjs"`

## Wave 3 — the surface

Goal: render the four states, and register the route without enumerating them.

Review depth: full

### T003 — Panel surface for the linked-state finding

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-linked-state.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/panel-linked-state.test.mjs`, `scripts/router-diagnostic.test.mjs`
- Acceptance: each state renders its own text; a finding carrying a state the pane was not written for still renders; the route, the loader and every count pin are re-cut.
- Verify: `node --experimental-strip-types --test "scripts/panel-linked-state.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs"`

## Wave 4 — recordings and the gate

Goal: re-measure everything the fixture change stales, then run the project gate.

Review depth: full

### T004 — Re-record what the fixture change stales and run the gate

- Deps: T003
- Files: `.proven.json`, `research/raw/m022-ng-context.json`, `research/raw/companion-dev-build.json`, `.proven.json`, `research/raw/m038-verdict-claims.json`, `scripts/fixture-proof-fresh.test.mjs`, `scripts/ng-context-dev-build.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`
- Acceptance: every moved value is shown old to new; no tolerance widened; the untargeted halves are named as not re-driven; the gate is green at the head.
- Verify: `node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"`

## Wave 5 — re-cut the pin and copy the escaper

Goal: make the project gate green again without touching what it checks — the chain pin follows the chain, and each copied fingerprint keeps the module it imports.

Review depth: full

The two findings are independent repairs to the gate itself, so they share a wave and touch disjoint files: T005 re-cuts the check-chain pin, T006 repairs the four skill tests the pin's failure had masked. Neither task edits `package.json`, widens a tolerance or skips a test.

### T005 — Re-cut the check-chain pin for the verification gate

- Deps: none
- Files: `scripts/panel-typecheck-scope.test.mjs`
- Acceptance: `npm run gate:verification` is named in position between `check:companion` and `format:check`; the assertion, its message and the six red-half cases are unchanged; `package.json` keeps the stage; 7 of 7 at the landing commit and 1 of 7 at base.
- Verify: `node --experimental-strip-types --test "scripts/panel-typecheck-scope.test.mjs"`

### T006 — Copy text.mjs beside every fingerprint copy the tests build

- Deps: none
- Files: `.commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs`, `.commandcode/skills/control-angular-devtools/scripts/fingerprint.test.mjs`, `.commandcode/skills/control-pangular-inspector/scripts/fingerprint.test.mjs`, `.commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.test.mjs`
- Acceptance: each test copies `text.mjs` beside `fingerprint.mjs` in the canonical test's shape; each passes alone; all four fail with `ERR_MODULE_NOT_FOUND` at base; no assertion changed and no test skipped.
- Verify: `node --experimental-strip-types --test ".commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs" ".commandcode/skills/control-angular-devtools/scripts/fingerprint.test.mjs" ".commandcode/skills/control-pangular-inspector/scripts/fingerprint.test.mjs" ".commandcode/skills/control-vitest-browser-angular/scripts/fingerprint.test.mjs"`

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/linked-state.test.mjs |
| E2 | T002 | scripts/linked-state.test.mjs |
| E3 | T002 | scripts/linked-state.test.mjs |
| E4 | T002 | scripts/linked-state.test.mjs |
| E5 | T003 | scripts/panel-linked-state.test.mjs |
| E7 | T002 | scripts/linked-state.test.mjs |

## Intent coverage

| Criterion | Task | Criterion |
|---|---|---|
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T001 | AC1 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |
| SC5 | T003 | AC1 |
| SC6 | T004 | AC4 |
| SC6 | T005 | AC4 |
| SC6 | T006 | AC3 |

## Prohibitions

| Prohibition | Criterion | Task |
|---|---|---|
| N1 | SC1 | T002 |
| N2 | SC2 | T002 |
| N3 | SC3 | T002 |
| N4 | SC4 | T002 |
| N5 | SC5 | T003 |
| N6 | SC6 | T004 |

## Surface contract

The panel is the only surface.

### panel — T003

Entry: the pane receives the join's result for the page's linked signals, rendered from the demo loader.

States: matching, differing, cannot-tell, idle.

Walkthrough:

1. `panelLinkedState(facts)` receives the fact list.
2. The pane renders one line per linked signal with its source and both values.
3. The agreement is stated in words the fact list carries.

Criteria: SC5
