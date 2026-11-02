---
id: T002
title: Create the companion package and prove the facade survives a development build of the fixture
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - packages/ai-devtools-companion/package.json
  - packages/ai-devtools-companion/project.json
  - packages/ai-devtools-companion/tsconfig.json
  - packages/ai-devtools-companion/src/index.ts
  - packages/ai-devtools-companion/src/facade.ts
  - packages/ai-devtools-companion/src/vetted.ts
  - packages/ai-devtools-companion/test/facade.test.mjs
  - scripts/facade-dev-build.test.mjs
  - spikes/ng222-app/src/app/app.config.dev.ts
  - spikes/ng222-app/angular.json
  - spikes/ng222-app/package.json
  - spikes/ng222-app/package-lock.json
  - research/raw/companion-dev-build.json
---

# T002 — Create the companion package and prove the facade survives a development build of the fixture

## Context

This milestone ships a Tier-2 opt-in package: app-visible code in someone else's build whose whole contract with the app is one own string key on `globalThis`. Nothing in the tree knows about one today — `ngAiDevTools` and `provideAiDevTools` occur in no source file, and there is no workspace, no publish configuration and no second Nx project, so the package root, its build target and its lock are net-new plumbing rather than a pattern to copy. Two facts about this builder decide whether the facade can exist at all, and neither has been measured: the application builder passes `pure: ['forwardRef']` to the bundler in **both** configurations, so a table built through a bare `forwardRef(...)` is canonically droppable, while `optimization: false` clears only the minifiers and the `ngDevMode: 'false'` define, so `isDevMode()` stays true in the development configuration; and the fixture is a third build graph whose own install holds Angular 22.2.2 while this checkout's root install holds 22.1.8, so the facade's class objects are the app's classes only if the package resolves its peers inside the fixture's install. `buildOptimizer` does not exist in this builder, and the fixture's `defaultConfiguration` is `production`, so the reflexive `ng build` proves exactly the configuration INTENT.md N5 forbids. This task is the wave-1 measurement that decides whether the milestone's central claim is reachable.

## Approach

- **Layout, recorded here because a new document would break the docs-audit inventory.** One standalone Nx project at `packages/ai-devtools-companion/`, unpublished: `"private": true`, `"type": "module"`, `peerDependencies` for `@angular/core`, `@angular/router` and `@angular/platform-browser` and no `dependencies` at all. It is not an npm workspace member — the root has no `workspaces` field and a symlinked member would resolve `@angular/*` from its real path, which is the root's 22.1.8 and the second-copy failure that reads as "declared, no symbols". Nx infers projects only from `project.json` files, so the new root needs its own; `npx nx show projects` listing it is the check.
- **One global, written from inside the provider call.** `globalThis.ngAiDevTools = facade` is a single property-assignment statement executed by `provideAiDevTools()`, guarded by `isDevMode()`. Never module scope (a side effect at import time is what the bundler is free to reorder), never a `forwardRef`-built table (that is the one identifier this builder marks pure), never through `Object.defineProperty` with extra keys. Keep the writer and the vetted value in separate modules so the writer can be exercised without loading Angular.
- **First write wins.** A second call must return the existing entry unchanged: no throw, no replacement, no second key. A key-count snapshot cannot tell a replacement from a no-op, and a `Symbol.for(...)` key is not an own string key at all, so the test snapshots the own string key names and the own symbol key names separately before and after, and compares the two entries with `Object.is` across a second install.
- **The vetted table is executable code, not data.** `@angular/router`'s `Router` and `@angular/platform-browser`'s `Meta` are imported as real class values so the entry carries class identity, and the table is versioned by the package's own `version` string with the Angular version it was vetted against recorded beside it: `22.2.2`, the copy the identity comparison actually meets in the fixture. No generated JSON: a data file can only carry names, and names are the Tier-1 degradation this package exists to replace.
- **The fixture consumes it as an installed dependency.** One dev-only provider file replaces `spikes/ng222-app/src/app/app.config.ts` through exactly one `fileReplacements` entry in the fixture's `development` configuration, which is also the configuration `ng serve` defaults to. `spikes/ng222-app/src/app/app.config.ts` keeps its bytes and the `production` configuration keeps loading neither. Adding a route is a fixture change that needs an owner ruling; adding this provider file is the mechanism SYNTHESIS.md settled.
- **The peer-resolution question is the measurement, not an assumption.** npm may install a directory `file:` specifier as a symlink rather than a copy, and the builder's `preserveSymlinks` is unset today, so this task measures which of a directory `file:` specifier, a packed tarball, or `preserveSymlinks: true` in the fixture's development configuration actually yields the fixture's own Angular copy — and it proves the answer by resolving `@angular/router` from the installed package inside the fixture's `node_modules` and comparing that path with the fixture root's own resolution and with the root checkout's 22.1.8. A symlink to the package root is acceptable only if the resolution still lands inside the fixture's install.
- **SC4's proof has two halves, and both are recorded.** The build half builds the fixture with `ng build --configuration development` into an output path under the git-ignored `tmp/` tree and searches the emitted unminified browser bundles for the entry name and for the `Router` class the entry carries: a search of the bundle alone is not the proof, but a service run alone cannot show the write survived. The serve half is a recorded observation in `research/raw/companion-dev-build.json` — the shape the repository's other spike readings use — carrying `isDevMode`, the identity comparison, the own-key difference and the per-symbol declared and resolved counts, taken by evaluating in the served page's main world with the extension loaded. `scripts/facade-dev-build.test.mjs` reads that file, so a missing or disagreeing recording fails the task.
- **The identity expressions to record.** `ng.ɵgetRouterInstance() === ng.getInjector(document.querySelector('app-root')).get(globalThis.ngAiDevTools['@angular/router'].Router)` must be `true`; `ng.ɵgetInjectorProviders(injector).some((r) => r.token === globalThis.ngAiDevTools['@angular/platform-browser'].Meta)` is expected `false` on every injector of the path with `injector.get` never called for `Meta`, which is why declared and resolved are counted apart. Feature-detect each `ɵ` function as the extension already does.
- **Blast radius.** The page gains no node, no prompt, toast or confirm, and no global name other than its one entry (AR-3, AR-6, N3, N7). The panel's build graph gains nothing: the package is not imported by any panel module, so the byte-exact pin and `PRE_MILESTONE_INITIAL_KB` are untouched and are not re-measured here.
- **The lock.** `spikes/ng222-app/package-lock.json` grows the new `file:` entry; the root lock and the root `package.json` are not this task's files, and the package is not added to the root's dependency tree.

## Interface contract

- `globalThis.ngAiDevTools` is exactly one own string key written first-write-wins by the package's `provideAiDevTools()` under `isDevMode()`, whose value is `{ version: string, '@angular/platform-browser': { Meta }, '@angular/router': { Router } }`: `version` is the package's own version string, and each symbol value is the class the package imported from that `@angular/*` peer, so the page realm can compare provider records by identity.
- The accepted vocabulary is package version `0.2202.0`, vetted against Angular `22.2.2`, with exactly two symbols this milestone and no others: `@angular/router#Router` and `@angular/platform-browser#Meta`.

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. `packages/ai-devtools-companion/package.json` carries `"private": true`, `"type": "module"`, no `dependencies`, and `@angular/core`, `@angular/router` and `@angular/platform-browser` as `peerDependencies` only; `packages/ai-devtools-companion/project.json` declares a build target that emits its own `dist`, and `npx nx show projects` lists the new project beside `angular-ai-devtools`.
2. The package writes its one global from inside `provideAiDevTools()` under `isDevMode()` as a property assignment — never at module scope and never through `forwardRef` — and a second install leaves the existing entry unchanged, so the two entries are `Object.is`-identical, nothing throws, and the table is a no-op on the second load (E5).
3. E4 — the own string key names of `globalThis` before and after the install differ by exactly the one entry name, and the own symbol key names are unchanged; `packages/ai-devtools-companion/test/facade.test.mjs` fails when the writer adds a second own string key, writes a symbol key, or replaces the object on a second install.
4. The fixture loads the package only through `spikes/ng222-app/src/app/app.config.dev.ts` and exactly one `fileReplacements` entry in the fixture's `development` configuration: `spikes/ng222-app/angular.json` gains no second replacement, `spikes/ng222-app/src/app/app.config.ts` keeps its base bytes, and the `production` and `test` configurations load the provider nowhere.
5. `@angular/router` and `@angular/platform-browser` resolved from the installed package inside the fixture's `node_modules` are the fixture's own 22.2.2 copy — the same files the fixture itself resolves and not the root checkout's 22.1.8 — and `spikes/ng222-app/package.json` declares no new `@angular/*` dependency to reach that.
6. `scripts/facade-dev-build.test.mjs` builds the fixture with `ng build --configuration development` into an output path under the git-ignored `tmp/` tree and asserts the emitted unminified browser bundle contains the entry name `ngAiDevTools` and the `Router` class the entry carries; the command line names the development configuration explicitly and never a bare `ng build`, and no file this task writes names `buildOptimizer` (SC4, N5).
7. `research/raw/companion-dev-build.json` records the served development build — `isDevMode` true, the identity comparison true, an own-key difference of exactly the one entry name, and the declared and resolved counts per symbol — and `scripts/facade-dev-build.test.mjs` fails when the file is absent, when a field disagrees with the build it just made, or when the recording names a non-development configuration.
8. The package's sources contain no DOM API, no `alert`, `confirm` or `prompt`, no `defineProperty` writing a second global, and no `forwardRef`, and the probe's own-key and own-symbol snapshots before and after the install differ only by the one entry name (AR-3, AR-6, N3, N7).

## Verify

```bash
npm ci --include=dev && npm --prefix spikes/ng222-app ci && node --test packages/ai-devtools-companion/test/facade.test.mjs scripts/facade-dev-build.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed: the root install is provisioned, the fixture's own install is
     provisioned from its tracked lock, and the development build the proof
     needs is produced by the test into the git-ignored tmp/ tree. The served
     half of SC4 is the recorded reading in research/raw/companion-dev-build.json,
     which the test reads. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
