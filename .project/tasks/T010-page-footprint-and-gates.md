---
id: T010
title: Measure the page footprint with and without the overlay and gate the milestone at the head
wave: 3
deps: [T005, T008, T009]
status: done
agent: build_T010
base: 2c477277bc518b048fdad82e87392e219261fc48
worktree: null
task_branch: null
files:
  - extension/panel/index.html
  - extension/page-footprint.test.mjs
  - research/raw/m022-page-footprint.json
---

# T010 — Measure the page footprint with and without the overlay and gate the milestone at the head

## Context

The overlay is the only programme-1 code an inspected page can observe, so its footprint is a compatibility surface rather than an implementation detail: the tool's own Angular would corrupt the profiler list, the feature fingerprint and the dev-mode counters, and a second subscriber on the single append-only profiler list would corrupt three later features. SC5 is therefore a differential measurement of existing outputs — the `ɵsetProfiler` subscriber list and the published feature record read the same with and without the overlay installed — and it has no new data shape of its own. SC6 is the aggregate gate: `npm run check` and `npm test` at the landed head, which is what makes every earlier task's green a fact rather than a claim.

## Approach

- **Two arms, one page, one comparison.** Boot the same document twice: once with the page-realm recorder script alone, once with the recorder and the overlay script. Read the profiler subscriber list from a stub `ng` whose `ɵsetProfiler` records what subscribes to it, and read the published feature record from what the recorder dispatches. Compare the two arms element by element; a difference is the failure, and the arm that differs must be named in the message.
- **Prove the comparison bites.** The same test must show a red result when the overlay writes a page global, subscribes to the profiler, adds or removes a feature name, or creates a node outside its host subtree. A differential that cannot fail is a restatement of the code, not evidence.
- **Count the tool's elements across a second boot.** After both scripts have booted, boot the overlay a second time in the same document and assert that the document still holds exactly one tool-created element, that the retired marker id resolves to null, and that the closed root cannot be read back — the page-visible half of SC4, in the same harness the differential already uses.
- **Record both arms, and fail on an absent recording.** `research/raw/m022-page-footprint.json` carries the two arms' subscriber counts and feature records, the Angular version the stub reports, the commands, and the tool-element count after the second boot. The test compares the recording with what it measured, so a stale or hand-written file fails instead of being quoted.
- **The aggregate gate is the task's own evidence.** Run `npm run check` and `npm test` at the landed head. A skipped test and a failing test are not distinguishable in a green build, so the task records the run's counts and states that nothing carrying a criterion skipped; do not weaken, skip or retag a check to reach green.
- **Nothing is added to the product here.** This task writes one test and one recording. If the differential finds a real leak — a subscriber, a global, a feature name or an extra node — the repair belongs to the task that caused it, and this task blocks rather than papering over the measurement.

## Interface contract

- None

## Intent coverage

- SC4
- SC5
- SC6

## Acceptance criteria

1. The differential is measured and not asserted in prose: the same page booted with the page-realm recorder alone and with the recorder plus the overlay yields an identical profiler subscriber list and an identical published feature record (SC5).
2. The differential fails when the overlay adds a profiler subscriber, adds or removes a feature name, writes a page global, or creates a node outside its host subtree — each mutation is shown to redden it (SC5).
3. `research/raw/m022-page-footprint.json` records both arms, the Angular version, the commands and the tool-element count, and the test fails — never skips — when the recording is absent or disagrees with the measurement (SC5).
4. A second boot of the overlay in the same document leaves exactly one tool-created element, no marker id, and a closed root that cannot be read back (SC4).
5. `npm run check` passes at the landed head (SC6).
6. `npm test` passes at the landed head with no skipped test carrying a criterion, and the run's counts are recorded (SC6).
7. No product file, fixture file or Markdown document changes; no check, pin or test is weakened, skipped or retagged to reach green, and the extension's own pins are left as they are.

## Verify

```bash
npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npx nx run ai-devtools-companion:build && npm run check && npm test && npx nx run angular-ai-devtools:build-extension && node --test extension/page-footprint.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The two named commands are the criterion this task owns; the
     differential runs last so a leak is reported after the aggregate gate. -->

Heavy: yes

## Log

- 2026-11-03 — created by planner

- **This task owns `extension/panel/index.html`**: it is a tracked build artifact that is stale at the base, so `scripts/panel-bundle-budget.test.mjs` reports the build as incomplete until `build-extension` runs. The gate half of this task runs that build, so the rewritten artifact is this task's to commit; T009 declared it out of its own diff rather than smuggle it in.

- 2026-11-03 — implementation. `extension/page-footprint.test.mjs` (new): two arms over one page shape — each boots `observer-filter.js`, `overlay-geometry.js` and the MAIN-world recorder `agent-main.js`; the `withOverlay` arm boots `overlay.js` between them in the manifest's `document_start` → `document_idle` order, so `overlay.js` is the only variable. The page's `ng` is a stub whose `ɵsetProfiler` records subscribers; four surfaces are compared with a key-order-independent canonicaliser — the `ɵsetProfiler` subscriber list, the `features` object of the `angular-ai:state` the recorder dispatches, the own global names added to `window`, and the element nodes outside the tool's host subtree. A difference fails naming the arm (`withOverlay`) and both readings. Five mutations of `overlay.js` prove the comparison bites (a profiler subscription, a removed feature name, an added feature name, a written page global, a node appended outside the host subtree); each test first asserts the same comparison is green without the mutation. A second boot of `overlay.js` in the same document is asserted to leave exactly one tool-created element, `angular-ai-devtools-marker` null and `host.shadowRoot === null`. `research/raw/m022-page-footprint.json` (new) records both arms (subscriber counts and names, feature record, page globals, page nodes, created element tags), the stub's Angular version, the four commands, the differential and the second-boot count; the test compares it field by field and prints the measured block when a re-record is needed, and an absent recording throws (never skips).
- 2026-11-03 — with/without differential, measured: profiler subscribers 1 / 1 (`subscriber`); feature record identical (8 names: `setProfiler`, `getSignalGraph`, `getHostElement`, `getInjector`, `getDirectiveMetadata` true; `getInjectorResolutionPath`, `getInjectorMetadata`, `getInjectorProviders` false); page globals identical (`__ngRecorder`, `angularAiObserverFilter`, `angularAiOverlayGeometry`); page nodes identical (`html`, `head`, `title`, `body`, `app-root#page`); stub Angular 22.2.2. Second boot: tool elements 1, marker id `null`, closed root readable `false`, nodes created by the second boot 0 (the one created element is the host). The two isolated-world namespaces appear in both arms because jsdom has one realm; that limit and three others are recorded in the recording's `doesNotSettle`.
- 2026-11-03 — `extension/panel/index.html`: rewritten by `npx nx run angular-ai-devtools:build-extension` (Nx restored the 2026-11-03T06:04Z build output), which replaced the stale `chunk-DMDbzNQs.js` preload with the emitted `chunk-GgcPLIi2.js`. No hand edit.
- 2026-11-03 — Verify (repo root, `npm ci --include=dev && npm run check && npm test && node --test extension/page-footprint.test.mjs`): all four stages exit 0. `npm ci --include=dev` exit 0 (npm audit/install-script warnings only). `npm run check` exit 0. `npm test` exit 0 — node suites 337/337, 60/60, 590/590 and the panel's 331 tests over 30 files, each `fail 0`, `skipped 0`, `cancelled 0`; the panel target was served by the Nx cache on the final run, so it was also run with `npx nx run angular-ai-devtools:test --skip-nx-cache` — 331 passed, `Cache: Skipped`. `node --test extension/page-footprint.test.mjs` exit 0 — `tests 12`, `pass 12`, `fail 0`, `skipped 0`, and the measurement line `page-footprint: {"angularVersion":"22.2.2","subscriberCounts":{"withoutOverlay":1,"withOverlay":1},"featureRecordIdentical":true,"identical":true,"toolElementsAfterSecondBoot":1}`.
- 2026-11-03 — bundle numbers with the build present: `panel-bundle-budget: measured initial total 532.47 kB (532468 B over 7 eager files) against the 535.44 kB baseline` — the pin is green and no longer skips. The build itself still prints `WARNING bundle initial exceeded maximum budget. Budget 520.00 kB was not met by 12.47 kB with a total of 532.47 kB`, which is the accepted pre-milestone overage N5 records; the error ceiling (1 mb) is not reached.
- 2026-11-03 — one non-reproducible failure, stated rather than smoothed: the first `npm test` of the Verify failed in `.claude/skills/control-pangular-inspector/scripts/control.test.mjs:54` with `EPERM` while `rmSync`-ing that test's own `%TEMP%\control-pangular-*` directory in an `after` hook — teardown, not an assertion, and no skills file is in this diff. The identical suite passed on the re-run (`590/590`) and had passed on the run before it. No check, pin or test was weakened, skipped or retagged: the suite carries no skip directive, and `skipped 0` in every block is the recorded count.
- 2026-11-03 — not mine, reported instead of left silently broken: the `.proven.json` ledger (wave-1 review, Summary). `extension-panel` still pins the pre-T004 `extension/relay.js` and `extension/manifest.json` blobs, and `observer-filter.js` is not among its 11 entries, so `node .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs check` reports `extension-panel` stale (as it also reports every other feature, including files this milestone never touched). Re-recording needs a feature-map edit — the entry list must gain `extension/observer-filter.js`, `extension/overlay-geometry.js` and `extension/overlay.js` — in both `.commandcode/skills/control-ai-browsers/features/` and its `.claude` byte copy, none of which is in this task's `files`; it belongs to its own task, not to a smuggled edit here.
- 2026-11-03 — ready
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t010-verify): fail, exit 1; output tail:
  ```
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel && npm run check:companion
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run check:companion
  npm notice run tsc -p packages/ai-devtools-companion/tsconfig.json
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills && npm run test:app
  ```

- **The Verify provisions every workspace it drives and builds before the bundle pin.** Measured at T010's first landing attempt: `npm test` runs `scripts/facade-dev-build.test.mjs` and `scripts/ng-context-dev-build.test.mjs`, which now fail — by design, never skip — when the fixture install is absent, and `scripts/panel-bundle-budget.test.mjs` reports the build as incomplete until `build-extension` runs. Both were missing from the original line, so the gate would have measured nothing.
