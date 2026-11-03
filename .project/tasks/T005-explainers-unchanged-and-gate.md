---
id: T005
title: Prove the shipped explainers unchanged, the fixture rebuild idempotent, and gate the head
wave: 2
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - tests/held-out/fixture-rebuild-idempotent.test.mjs
---

# T005 — Prove the shipped explainers unchanged, the fixture rebuild idempotent, and gate the head

## Context

Three of the four shipped explainers and the counter's own proof all pin the fixture's
route file, and the two stale-view components that produce the stale-view and interop
answers are in no manifest at all (evidence findings 10, 11 and 15), so "the explainers
still answer" is a claim about two moving sides rather than about the panel alone. This task
pins both sides: the panel's explainer sources and their page-realm suppliers against the
digests they carried at the milestone base, and the fixture subjects they select. It also
takes the second install and build cycle that INTENT's rebuild edge asks for, and it runs
the two aggregate gates the fourth success criterion names.

## Approach

- **Pin the answer's two halves, not one.** The explainers derive their findings from
  records the page realm publishes (evidence finding 28), so a digest set over the panel
  alone would stay green while the fixture stopped emitting what the panel reads. Record the
  panel's four explainer modules, the services and record producers they read, and the
  fixture's counter component, both stale-view fixtures and the routes file, then assert
  every one of them against the bytes at the head. Take the digests from the milestone base
  — `git show` at the base commit — and carry them as constants in the test; a constant that
  someone edits instead of fixing the code is the failure mode this repository already
  guards against, so re-read the constants from the test's own source and compare them too.
- **Read the action's effect through the DOM, not the panel's state.** The unchanged claim
  is about what a person sees: the answer text and the subject selectors per explainer are
  unchanged. Do not re-derive an explainer's output in the test and do not read a component
  field; assert the sources and subjects that produce the answer, and let the panel's own
  suite keep asserting the rendering.
- **Change no explainer to suit the fixture.** Prohibition N2 binds here: an explainer that
  moves to meet a fixture proves nothing, and the roadmap puts changing a shipped explainer
  out of scope. If a digest disagrees, the fixture is what is wrong.
- **Take the second cycle for real.** The rebuild test builds the fixture twice into two
  output directories and compares the two emitted entry documents byte for byte, and it
  asserts the component packages are installed once: one version of each of the three in
  the fixture's own install, and a single Angular package at the fixture root with no second
  copy nested under any component package. Content-hashed production output makes the two
  entry documents comparable, and a nested Angular copy is exactly the duplicate-Angular
  signature the fixture already has a proof for, so a second copy here would read as a
  component-identity bug rather than as an install mistake.
- **Neither pin may weaken to reach green.** Prohibition N6 binds harder at the gate than
  anywhere else: `npm run check` and `npm test` run as they ship, the panel's initial
  bundle measurement is taken rather than skipped — which is why the Verify builds the
  extension before the suite — and a red suite is answered by changing the wave 1 surface,
  never the pin.
- **Pin the panel's own shape.** The milestone declares the panel untouched, so pin its
  dependency manifest, its build configuration and the extension's manifest against the base
  digests as well: a later reviewer then sees one test that fails if this milestone bought a
  criterion by changing the panel's packages, its budgets or the extension's declarations
  (prohibition N3).

## Interface contract

- Page: the route path `/components` renders `ComponentsPage`, whose host tag is `app-components-page`, from `spikes/ng222-app/src/app/components/components-page.ts`; the routes `/`, `/stale-view` and `/stale-view-deferred` keep their entries.

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. E6: each of the four shipped explainers still answers on the fixture — the panel sources and their page-realm suppliers hash to the recorded base digests and the fixture still serves what they select, the counter at `/` and both stale-view routes — so the test reddens when either side moves (SC3, prohibition N2).
2. The panel's dependency manifest, its build configuration and the extension's manifest hash to their base digests, so this milestone bought no criterion by touching the panel (SC4, prohibition N3).
3. E7: a second install and a second build leave the same entry served — the two emitted entry documents are identical — with exactly one version of each component package installed and a single Angular package at the fixture root (SC3).
4. `npm run check` passes at the head (SC4).
5. `npm test` passes at the head with the panel's initial-bundle measurement taken rather than skipped (SC4, prohibition N6).

## Verify

```bash
npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run angular-ai-devtools:build-extension && node --test tests/held-out/fixture-explainers-unchanged.test.mjs tests/held-out/fixture-rebuild-idempotent.test.mjs && npm run check && npm test
```
<!-- The extension build comes before the suite because the panel's
     initial-bundle measurement skips itself until the panel is built, and a
     skipped measurement is not a pass. Both installs name --include=dev because
     this host exports NODE_ENV=production; the rebuild test needs the fixture
     install for its second build. -->

Heavy: yes

## Log

- 2026-11-03 — created by planner
