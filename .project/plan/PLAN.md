# Plan — M023 fixture-components

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`
<!-- Run once at ship, in a fresh sidecar checked out at the reviewed commit: no
     node_modules, no fixture install, no companion `dist` and no
     `extension/panel/` exist there. Both installs name `--include=dev` because
     this host exports NODE_ENV=production, which would otherwise drop every
     devDependency. `build-extension` runs before the suite because
     `scripts/panel-bundle-budget.test.mjs` skips its only real measurement
     until the panel is built, and a skipped measurement is not a pass.
     `npm test` drives the fixture's two build proofs, so the fixture install is
     provisioned here and not inside those files. -->

## Config

- max_review_cycles: 3   <!-- review→fix→re-review loops per wave before escalating -->
- wave_budget: none      <!-- no per-wave resource cap -->
- review_panel: off      <!-- copied from INTENT.md: "Review panel: off" -->
- finding_skeptics: off  <!-- copied from INTENT.md: "Finding skeptics: off" -->

## Wave 1 — burn down the plan-invalidating risk and build the specification surface

Goal: Make the fixture able to redden a component claim. T001 lands `@angular/aria`,
`@angular/cdk` and `@angular/material` at one exact version line in `spikes/ng222-app` and
re-pins the proof that freezes that fixture — `scripts/ng-context-dev-build.test.mjs`
asserts the fixture's dependency key lists, both build configurations, the absence of
`__ngContext__` and `window.ng` in its source, and its own artifact paths, and
`research/raw/m022-ng-context.json` is compared whole against the emitted bytes — so this
task is where the plan changes if it can be invalidated: a production build over the
frozen 1 MB error budget, a second Angular copy in the development build, or a facade peer
pin that stops resolving each ends the plan's assumption that the packages fit the fixture
as it stands, and the surface set then shrinks in this wave rather than in build. T002
lands the deliberately ambiguous harness target with content outside the component root, a
predicate case and an action whose effect is rendered text, which is what HAR-1 to HAR-4
and E1 to E3 need before any of them can be right or wrong. T003 lands the overlay, list,
tabs and menu on the packages T001 installs, with the rule set N23 inherits and the one
rule whose attribute removal reddens it, because a surface without its rules is a demo page
rather than a specification. Nothing here touches the panel or the extension: the fixture
and the two skills that declare it are the whole wave.
Review depth: full

## Wave 2 — declare the surface and prove the milestone

Goal: Turn the page the first wave built into a named verification surface and then prove
the head. T004 gives the fixture its own `TARGETS` entry and port, its skill and feature
documentation, its docs-audit row and its recorded proofs, which is the six-registration
cost evidence finding 2 names plus the audit's derived inventory; without it the page is
reachable only by hand and no later check can cite it. T005 proves what the milestone may
not break — that each of the four shipped explainers still answers on the fixture, that a
second install and build leave one entry served and one version of each component package
installed, and that `npm run check` and `npm test` pass at the head with the bundle
measurement taken rather than skipped. If T005 reddens, the wave 1 surface is changed, not
the pin.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC2 |
| SC1 | T002 | AC3 |
| SC1 | T002 | AC4 |
| SC1 | T002 | AC5 |
| SC2 | T003 | AC2 |
| SC2 | T003 | AC3 |
| SC2 | T003 | AC4 |
| SC2 | T003 | AC5 |
| SC3 | T001 | AC3 |
| SC3 | T001 | AC4 |
| SC3 | T002 | AC6 |
| SC3 | T003 | AC7 |
| SC3 | T005 | AC1 |
| SC3 | T005 | AC3 |
| SC4 | T005 | AC2 |
| SC4 | T005 | AC4 |
| SC4 | T005 | AC5 |
| SC4 | T006 | AC1 |
| SC4 | T007 | AC1 |
| SC3 | T008 | AC1 |
| SC1 | T009 | AC1 |
| SC2 | T010 | AC1 |
| SC3 | T011 | AC1 |
| SC4 | T012 | AC1 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T002 | tests/held-out/fixture-harness-root-boundary.test.mjs |
| E2 | T002 | tests/held-out/fixture-harness-ambiguity.test.mjs |
| E3 | T002 | tests/held-out/fixture-harness-predicate.test.mjs |
| E4 | T003 | tests/held-out/fixture-aria-rule-mutation.test.mjs |
| E5 | T003 | tests/held-out/fixture-aria-order.test.mjs |
| E6 | T005 | tests/held-out/fixture-explainers-unchanged.test.mjs |
| E7 | T005 | tests/held-out/fixture-rebuild-idempotent.test.mjs |

## Dependency notes

- **T001 → T003 (the install and the version line).** T003 imports `@angular/aria/listbox`,
  `@angular/aria/tabs`, `@angular/aria/menu`, `@angular/cdk/overlay` and
  `@angular/material/button`; none of them resolves in `spikes/ng222-app` until T001's
  landing adds them to that fixture's own manifest and lockfile. A reviewer sees the three
  packages at `22.2.5` in `spikes/ng222-app/package.json` and sees T003's imports resolve
  through the fixture's install, not the root one. Material's published peer on
  `@angular/cdk` is the exact `22.2.5`, which is why the three are pinned exactly rather
  than by caret: a caret on the cdk would let a later install break the peer.
- **T002 → T003 (the same file).** T002 creates
  `spikes/ng222-app/src/app/components/components-page.ts` and its route; T003 mounts its
  surfaces inside that page, so both declare the file and the pair is ordered instead of
  run beside each other. A reviewer sees one route object in
  `spikes/ng222-app/src/app/app.routes.ts` and one page component whose template holds the
  probe hosts from T002 and the surfaces from T003. T003's Verify also runs T002's four
  harness tests, because the page it edits is what those tests read: a page change that
  moves the root boundary or makes the two hosts distinguishable reddens the landing that
  made it.
- **T003 → T004 (what the declaration describes and hashes).** T004's feature file quotes
  the surfaces' tag and attribute names and its `.proven.json` record hashes the closure of
  `spikes/ng222-app/src/main.ts`, which follows the routes into the two page components, so
  a record taken before T003 would be stale at the moment it landed. The same edge carries
  the profile entry: `fingerprint.mjs record` drops an entry whose feature file is gone and
  reuses the recorded entries, so the new `components` feature is recorded only after its
  feature file exists.
- **T004 → T005 (the audit the gate reads).** T005's Verify runs `npm test`, whose
  `scripts/docs-audit-disposition.test.mjs` derives the Markdown inventory from the tree and
  compares it with `.project/research/DOCS-AUDIT.md`. Landing T005 first would gate a tree
  whose new feature file has no audit section and would pass for the wrong reason; landing
  it after T004 gates the audit T004 wrote.
- **T001 and T002 together → T003, and no fourth edge.** T003 is the only task with two
  dependencies, and both are named above with the data that crosses them: the installed
  packages and the page file. T001 and T002 share no file and run beside each other in wave
  1; the four held-out harness tests, the two Aria tests and the two regression tests each
  belong to the task that lands the surface they judge, so no later task inherits a Verify
  it cannot run.
- **Why two waves and not three.** Wave 1 is the risk and the surface; wave 2 is the
  declaration and the proof. A third wave would add a review cycle over the declaration
  alone, and the declaration cannot precede the surfaces it documents. The chain is
  T001 and T002, then T003, then T004, then T005: four serial landings, not a four-deep
  dependency chain, because T003 fans in from wave 1 rather than queueing behind T002
  alone.
- **What the plan deliberately does not add.** No page-read responder (the ruling records
  that the port exists before its transport), no `@angular/animations`, no Angular SSR, no
  NgModule Material entry point, no panel dependency and no `@angular/cdk/testing` outside
  the A8-licensed harness family. The Aria rules the fixture ships are statements over the
  attributes the fixture's own template writes; the attributes the Aria directives render
  (roles, the active descendant, panel wiring) belong to N23's implementation milestone and
  are named in the feature file's Gotchas rather than asserted here, because asserting them
  would need the rendered DOM and therefore a browser in a Verify.
- **Two servers over one fixture directory.** The `components` target is a second
  `ng serve` over `spikes/ng222-app`, so the two targets share the fixture's `.angular`
  cache; the feature file's preconditions name one target at a time in a checkout, and the
  wave 2 review reads that line rather than discovering a cache race during a proof run.

## Wave 3 — the proof repair

Goal: make the held-out proofs able to fail. The final review of M023 recorded SC1, SC2 and SC3 as `not-met`
because eight suites could not detect the defect they were named for. Each task here replaces one such suite
with an assertion whose named mutant reddens it.

| Task | Repairs |
|---|---|
| T009 | E1, E2, E3, E4 — the four harness-family cases |
| T010 | E5 and the Aria rules reading rendered DOM, not source |
| T011 | E7 — rebuild idempotency |
| T012 | the milestone-coupled verdict-claims test |

Review depth: full
