---
id: T001
title: Land Aria, CDK and Material in the counter fixture and re-pin its frozen build proof
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/package.json
  - spikes/ng222-app/package-lock.json
  - scripts/ng-context-dev-build.test.mjs
  - scripts/facade-dev-build.test.mjs
  - research/raw/m022-ng-context.json
---

# T001 — Land Aria, CDK and Material in the counter fixture and re-pin its frozen build proof

## Context

`spikes/ng222-app` is the verification fixture and its dependency key lists are frozen
verbatim by `scripts/ng-context-dev-build.test.mjs`, which asserts the exact sorted keys of
`dependencies` and `devDependencies` and would go red on the first package added (evidence
finding 1). The same file freezes both build configurations, refuses any `__ngContext__` or
`window.ng` text in the fixture's source, and compares `research/raw/m022-ng-context.json`
whole against the bytes of a development build and a production build it takes itself, so
the recording is not a note beside the pin — it is half of it. `scripts/facade-dev-build.test.mjs`
builds the same fixture twice and proves the development build carries exactly one Angular
copy, which `preserveSymlinks: true` is what makes true (findings 14 and 17), and the
fixture's own `npm ci` must name `--include=dev` because this host exports
`NODE_ENV=production`.

## Approach

- **One exact version line for the three packages.** `@angular/aria`, `@angular/cdk` and
  `@angular/material` are published as `22.2.5`, which is the line the fixture's Angular
  `22.2.x` carries; pin all three at exactly `22.2.5` rather than a caret, because
  `@angular/material` 22.2.5 declares an exact peer on `@angular/cdk` 22.2.5 and a caret
  would let a later install resolve a cdk the peer refuses. They belong in `dependencies`,
  not `devDependencies`: the fixture's built app imports them. `@angular/aria` 22.2.5 needs
  only `tslib` and its peers, and `@angular/material` 22.2.5 declares no peer on
  `@angular/animations`, so no animations package enters the fixture.
- **Regenerate the lockfile, do not hand-edit it.** Install through npm with the fixture as
  the prefix and `--include=dev`, then commit both files together: a manifest without its
  lockfile leaves `npm ci` refusing, and a lockfile without its manifest leaves the pin
  reading a list the install does not produce.
- **Re-pin, never delete.** `scripts/ng-context-dev-build.test.mjs` keeps a named assertion
  for each of the four properties it guarded: the dependency key list, both build
  configurations, the absence of `__ngContext__` and `window.ng` in the fixture's `src/`,
  and its own three artifact paths. Only the dependency list changes, and it changes by
  naming the three packages in the frozen array — the assertion still refuses a fourth.
  Narrowing is not deleting: a property with no assertion left is the defect this file
  exists to prevent, and prohibition N6 binds here as much as on the panel — no check is
  weakened to reach green.
- **Re-take the measurement the pin compares against.** The recording's two `builds` objects
  are compared with `deepEqual` against the build this test just ran, and a new package and
  a new route change the emitted bundle names and bytes, so the two build objects are
  re-recorded from a real run of this file. Its `served` half and its `no-dev-api` ruling
  are evidence of what a page reports and are not re-taken here; they stay as recorded, and
  the differential they assert (the context write present in both configurations, the
  `window.ng` surface in development only) is unchanged by adding packages. Both builds land
  under the git-ignored `tmp/`, and no Markdown file is added beside the recording.
- **The production budgets stay as frozen.** The production configuration keeps its
  `500kB` warning and `1MB` error budget for the initial bundle; raising either to fit the
  new surfaces is the weakening prohibition N6 forbids. If the four-component surface set
  cannot fit the error budget, that is a finding to report — the surface set shrinks in this
  wave — not a budget to edit.
- **Run the one-copy proof, not just the build.** `scripts/facade-dev-build.test.mjs` builds
  the fixture a second time with `preserveSymlinks` off and reads the duplicate-Angular
  signature; because that setting is load-bearing and measured (finding 14), a build that
  succeeds while carrying two Angular copies would make every later class-identity
  comparison behave as a component-identity bug. Both pin files keep their install gates
  and neither may carry a skip: a missing root or fixture install is red and names the
  command that provisions it (finding 17).
- **The fixture is where the packages land.** Nothing is added to the root manifest, to the
  panel's project or to the extension's sources (prohibition N3: the panel's design system is
  a later programme and its versions diverge from the fixture's on purpose).

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. `spikes/ng222-app/package.json` declares `@angular/aria`, `@angular/cdk` and `@angular/material` in `dependencies`, each at exactly `22.2.5`, and `spikes/ng222-app/package-lock.json` resolves one version of each.
2. `scripts/ng-context-dev-build.test.mjs` still asserts all four properties it guarded — the fixture's dependency key list, both build configurations, the absence of `__ngContext__` and `window.ng` in the fixture's source, and its own three artifact paths — and its dependency assertion names the three component packages and refuses any other addition.
3. Both of the fixture's configurations still build through the re-pinned file, with the production configuration unchanged (SC3): budgets `500kB`/`1MB` and `4kB`/`8kB` with `outputHashing: all`.
4. `research/raw/m022-ng-context.json` records the two build objects measured at this head, with its `served` readings and its `no-dev-api` ruling unchanged (SC3).
5. `scripts/facade-dev-build.test.mjs` reports exactly one Angular copy in the fixture's development build with the three packages installed, and its peer pins still resolve to the fixture's own copies.
6. Neither pin can pass by not running: neither file carries a skip directive, and a missing root or fixture install fails with the provisioning command it names.

## Verify

```bash
npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && node --test scripts/ng-context-dev-build.test.mjs scripts/facade-dev-build.test.mjs
```
<!-- Both installs are named because the first file needs the Nx CLI from the root
     install and @angular/cli from the fixture's, and because this host exports
     NODE_ENV=production, which drops devDependencies without --include=dev. The
     two files build the fixture four times between them; nothing else runs here. -->

Heavy: yes

## Log

- 2026-11-03 — created by planner
