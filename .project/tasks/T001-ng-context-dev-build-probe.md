---
id: T001
title: Measure dev-only __ngContext__ presence on the fixture, in a development and a production build
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/ng-context-dev-build.test.mjs
  - research/raw/m022-ng-context.json
  - spikes/probes/ng-context.js
---

# T001 — Measure dev-only __ngContext__ presence on the fixture, in a development and a production build

## Context

SYNTHESIS lists `__ngContext__` semantics as `Still unknown`: no evidence file cites a source for "dev-only, set on elements inside a template", the intent asserts it, and E4's vocabulary — a picked element with no `__ngContext__` yields a named `no-dev-context` outcome, distinct from "no component found" — rests on it. The page realm's existing element-to-instance resolution never reads the property: `extension/agent-main.js` resolves through `ng.getOwningComponent` over a fixed element chain, so nothing in shipped code answers this question. What decides the descriptor's honesty is therefore a measurement, not a rule of thumb: the property must be demonstrably present on an element inside a component's template in the fixture's development build, and demonstrably absent from the production output, or T006 must not offer `no-dev-context` with a production-build reason at all.

## Approach

- **Measure the emitted bundles, and the served page.** The proof has two halves and neither may be inferred from the other: build `spikes/ng222-app` with `--configuration development` and with `--configuration production` into git-ignored `tmp/` paths, search the emitted browser bundles for the property write and for the guard around it, and separately record what a served page reports when the page realm reads the property on a real template element.
- **Never a bare `ng build`.** The fixture's default configuration is `production`, so every composed command names its configuration explicitly and the helper refuses a build without one. The fixture carries its own Angular CLI, so the build runs from the fixture's own folder; the fixture install needs `--include=dev` because this host exports `NODE_ENV=production`, which otherwise drops the fixture's devDependencies and leaves no CLI at all. A missing install must fail with the provisioning command in the message, never skip.
- **The served reading comes from the probe driver, not from prose.** `spikes/probes/ng-context.js` is a `control-ai-browsers run` driver (`async page => { … }`) that returns a JSON-able reading: the page's `ng` version, the tag of the element it read, whether `__ngContext__` is present on it, and whether the same page served from the production output answers differently. Take it twice — once against the fixture served on its development configuration, once against a static server over the production output — and write both readings into the recording.
- **The recording is checked against the builds, so it cannot be fabricated.** The test reads `research/raw/m022-ng-context.json` and compares its build half with the bytes it just produced; a stale file, a field that disagrees with the build, or a recording that names no configuration fails. This is the repository's shape for a committed measurement — the development-build proof beside the companion package is the precedent — and it keeps a number out of prose.
- **Do not settle more than the question.** Record only what the property's presence means for the descriptor: a development build can answer `no-dev-context` for an element that carries no Angular context, and a production build lands there for every element. Record, in the same file, what the measurement does not settle (whether a runtime element inside a template carries a context that no build-time search can see), so a later reader does not read a bundle search as a runtime guarantee.
- **Nothing in the tree is written except the two artifacts and the driver.** Build output lands under the git-ignored `tmp/`; no fixture source, configuration or dependency is touched, and no Markdown document is added, because the docs-audit gate derives its frozen inventory from the tracked Markdown tree.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. The development and production builds both run from the fixture's own CLI with the configuration named explicitly, into git-ignored paths, and the test fails — never skips — when the root install or the fixture install is absent, naming the command that provisions it.
2. The development bundle is shown to carry the `__ngContext__` write and the production bundle is shown not to, asserted from the emitted bytes and not from a document or a comment.
3. `research/raw/m022-ng-context.json` records both bundle readings, the Angular version, both build commands, the served readings from `spikes/probes/ng-context.js` on the development page and on the production output, and the ruling the descriptor may draw from them.
4. The test compares the recording's build half with the bytes it measured at the head; a missing recording, a disagreeing field, or a recording that names no configuration fails rather than skipping.
5. The recording names what it does not settle — whether a runtime element inside a component's template carries a dev context that no bundle search can see — and the probe that would settle it, so no later reader treats a build search as a runtime guarantee.
6. `spikes/probes/ng-context.js` is a `control-ai-browsers run` driver shaped `async page => { … }` that touches no page node, writes no page global, and returns only plain data.
7. No fixture source, configuration, lockfile or dependency changes, and no Markdown document is added anywhere in the tree.

## Verify

```bash
npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && node --test scripts/ng-context-dev-build.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The two installs are the fixture's and this checkout's; the
     builds themselves land under the git-ignored tmp/. -->

Heavy: yes

## Log

- 2026-11-03 — created by planner
