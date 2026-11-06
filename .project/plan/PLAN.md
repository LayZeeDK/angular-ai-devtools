# Plan — M035 onpush-readiness

Milestone: onpush-readiness
Branch: gsd-path/M035

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — what the metadata actually exposes, and the join

Goal: The research settled that `ɵcmp` carries `onPush` and not `changeDetection`, that signal inputs are
distinguishable while signal outputs are not, and that no field records OnPush safety. It also found the panel's
existing read fails open. T001 re-measures the fields on the version the panel ships and gives the fixture a real
OnPush subject; T002 builds the join, corrects the fail-open default, and answers `cannot-tell` where a blocker would
be a guess.

Review depth: full

T001 and T002. One measurement recording and one OnPush fixture component, then a pure join over a fact list with
three distinct absence states.

## Wave 2 — the surface and the recordings

Goal: T003 renders the strategy and the readiness facts and registers itself in the panel demo, declaring every
route-table pin the new route stales. T004 re-records what the change stales and runs the project gate.

Review depth: full

T003 and T004. The panel shows the facts and the cannot-tell state and is reachable from the demo's loader map; every
recording the change staled is re-measured from a cleared output path.

### T001 — Measure the metadata on the shipped version, and give the fixture an OnPush subject

- Deps: none
- Files: `spikes/ng222-app/src/app/onpush-ready-page.ts`, `spikes/ng222-app/src/app/onpush-ready.ts`, `spikes/ng222-app/src/app/app.routes.ts`, `scripts/onpush-metadata-capture.test.mjs`, `research/raw/m035-onpush-metadata.json`, `scripts/router-config-capture.test.mjs`, `research/raw/m030-router-config.json`, `scripts/router-diagnostic-capture.test.mjs`, `research/raw/m033-router-diagnostic.json`, `scripts/after-render-fixture.test.mjs`
- Acceptance: the recording states, with the command and its output, which of `onPush`, `signals`, `standalone`, `inputs` and `inputConfig` are present on the component def at the version the panel ships, and what each of the fixture's two components reports; a component declared with `ChangeDetectionStrategy.OnPush` exists in the fixture and reports `onPush` true while an existing default component reports false; a capture writes nothing unless `M035_CAPTURE=1`; and every route-table recording this new route stales is re-measured.
- Verify: `node --experimental-strip-types --test "scripts/onpush-metadata-capture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/after-render-fixture.test.mjs"`

### T002 — Join the strategy and the readiness facts

- Deps: T001
- Files: `extension/onpush-readiness.js`, `scripts/onpush-readiness.test.mjs`
- Acceptance: a component whose `onPush` is false produces a finding naming the component, the strategy it runs under and each readiness fact the fact list carries, and naming no blocker; an unreadable strategy produces `cannot-tell` with reason `strategy-unreadable` — never `onpush`, correcting the fail-open default at `extension/agent-main.js:660-671`; a component already on OnPush produces `cannot-tell` with reason `already-onpush`; a fact list carrying no signal-input evidence carries no input claim; a mutant that reports a blocker, and a mutant that returns `onpush` for an unreadable read, each redden by name; the module reads no clock, console or DOM.
- Verify: `node --experimental-strip-types --test "scripts/onpush-readiness.test.mjs"`

### T003 — Panel surface for the readiness finding

- Deps: T002
- Files: `apps/angular-ai-devtools/src/app/panel-onpush.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `scripts/panel-onpush.test.mjs`, `scripts/panel-routes.test.mjs`, `scripts/router-diagnostic.test.mjs`
- Acceptance: the surface renders the component, the strategy and the readiness facts from a short fact list, and the cannot-tell state with its reason and no blocker; a fact list carrying a blocker, a verdict or an element renders none of them; the route is registered with `data.surface` and reachable from the demo's loader map, and the surfaces-versus-loaders check names it when the loader is removed; every route-table pin this route stales is re-cut to the measured count.
- Verify: `node --experimental-strip-types --test "scripts/panel-onpush.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs" && npx tsc -p apps/angular-ai-devtools/tsconfig.check.json`

### T004 — Re-record everything the fixture change stales

- Deps: T003
- Files: `.commandcode/skills/control-angular-dev-app/features/.proven.json`, `.commandcode/skills/control-angular-devtools/features/.proven.json`, `research/raw/m022-ng-context.json`, `research/raw/companion-dev-build.json`, `research/raw/m035-verdict-claims.json`, `scripts/fixture-proof-fresh.test.mjs`, `scripts/ng-context-dev-build.test.mjs`, `scripts/overlay-verdict-claims.test.mjs`, `scripts/facade-dev-build.test.mjs`
- Acceptance: both control-skill feature manifests name both new fixture files; both development-build recordings are re-measured with the output path cleared first, and each says so; `m035-verdict-claims.json` quotes every intent criterion in full; no value is tolerance-adjusted; `npx prettier --check` passes on every file this task touched; `npm run check` and `npm test` pass at the head.
- Verify: `node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"`

## Wave 3 — correct the three findings the panel verified

Goal: the unreadable case says nothing, the recording's prose agrees with its own fields, and the demo shows the name the
page reports.

Review depth: full

### T005 — Correct the three findings the wave-2 panel verified

- Deps: none
- Files: `extension/agent-main.js`, `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`,
  `research/raw/m022-ng-context.json`, `scripts/recording-consistency.test.mjs`,
  `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`,
  `extension/agent-main.test.mjs`, `extension/page-footprint.test.mjs`,
  `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`,
  `apps/angular-ai-devtools/src/app/companion.spec.ts`
- Acceptance: `changeDetectionFor` returns null when the read does not happen and the update-cause chain does not treat
  null as eager; the m022 note mentions no count its own fields contradict; the demo names `_DeclaredDefault`; the gate
  passes and its row is recorded.
- Verify: `node --experimental-strip-types --test "scripts/recording-consistency.test.mjs" && npx nx run angular-ai-devtools:test --skip-nx-cache && npm run check`

## Wave 4 — make the gate measure instead of remember

Goal: the initial record stops asserting a strategy nobody read, the field's type admits the wire, the consistency test
states its real scope, and `npm test` executes the app suite every time instead of replaying it.

Review depth: full

### T006 — Make the gate measure instead of remember

- Deps: none
- Files: `extension/agent-main.js`, `extension/agent-main.test.mjs`,
  `apps/angular-ai-devtools/src/app/update-cause-chain.ts`,
  `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`,
  `scripts/recording-consistency.test.mjs`, `nx.json`
- Acceptance: the initial record carries `changeDetection: null` and restoring `'onpush'` reddens a named test; the field
  type admits `null`; the consistency header states what it does not check; two consecutive `npm test` runs report the same
  pass blocks without clearing anything, so the held-out E3 suite passes twice.
- Verify: `node --experimental-strip-types --test "extension/agent-main.test.mjs" && npx nx run angular-ai-devtools:test --skip-nx-cache && npm run check`

## Held-out checks

| Edge | Task | Test |
|---|---|---|
| E1 | T002 | scripts/onpush-readiness.test.mjs |
| E2 | T002 | scripts/onpush-readiness.test.mjs |
| E3 | T002 | scripts/onpush-readiness.test.mjs |
| E4 | T003 | scripts/panel-onpush.test.mjs |

## Intent coverage

| Criterion | Task | Criterion |
|---|---|---|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC5 | T004 | AC4 |
| SC1 | T005 | AC1 |
| SC5 | T005 | AC4 |
| SC1 | T006 | AC1 |
| SC5 | T006 | AC4 |

## Prohibitions

| Prohibition | Task | Criterion |
|---|---|---|
| N1 | T002 | SC1 |
| N2 | T002 | SC3 |
| N3 | T002 | SC3 |
| N4 | T003 | SC4 |
| N5 | T002 | SC2 |
| N6 | T004 | SC5 |

## Surface contract

### panel — T003

Entry: the panel route `/onpush`, reachable from the panel demo's loader map like every other surface.

States: loading before a fact list arrives; success with the component, the strategy and the readiness facts; cannot-tell with its reason and no blocker; error when the fact could not be read.

Walkthrough:

1. The panel is opened and a component on default change detection is supplied; the surface shows the component and the strategy it runs under.
2. Each readiness fact the fact list carries is shown as a read value; a fact the list does not carry is absent from the pane.
3. A component already on OnPush shows this surface's cannot-tell text and its reason, with no facts and no blocker.
4. A fact list carrying a blocker, a verdict or an element renders the component and the strategy and none of those three.

Criteria: SC4
