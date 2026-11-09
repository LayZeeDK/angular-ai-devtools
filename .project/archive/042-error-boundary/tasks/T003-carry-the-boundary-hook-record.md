---
id: T003
title: Carry the boundary hook's record beside the profiler and router subscriptions
wave: 3
deps:
  - T002
status: done
agent: gsd-path build subagent
base: 92f92fd25bd1d7f6f074eee8c8648d42f8ff5831
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
  - extension/page-footprint.test.mjs
  - scripts/performance-measure.test.mjs
  - scripts/render-phase-measure.test.mjs
  - scripts/performance-capture.test.mjs
  - scripts/render-phase-capture.test.mjs
  - scripts/navigation-measure.test.mjs
  - scripts/navigation-capture.test.mjs
  - apps/angular-ai-devtools/src/app/companion.spec.ts
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - research/raw/m042-error-boundary.json
---

# T003 — Carry the boundary hook's record beside the profiler and router subscriptions

## Context

The one page agent holds a profiler subscription and a router subscription, and it knows nothing about errors at all. A caught boundary error is reachable from the page through exactly two generic surfaces, and neither is a boundary reader: the resolved `ErrorHandler`'s optional `onViewError` method, which receives the error plus the details of the view that threw, and `ng.getContext()` on a node inside the rendered error view, which returns the caught value and the boundary's own reset. `window.ng` offers nothing for a caught error and the panel's existing block reader enumerates defer and for blocks only, so these two surfaces are the whole reach.

The record is what the rest of the milestone reads, which makes its shape a design decision. Three constraints decide it. The hook is installed on the handler instance the app already resolved, so an app that defines its own `onViewError` must keep it. The message boundary is serialized, so an error travels as its own name, message and cause rather than as an instance, and nothing read from the rendered error view may stand in for the error itself. And the intent's scope carries a version obligation: this repository's own core install has no boundary machinery while the targets run one that does, and a page on a core without it must answer a named absence rather than an empty boundary list. T001 measured what a page can actually report about its own core, which is the evidence this record may carry and no more.

## Approach

Add, never alter. The hook is installed where the existing subscriptions are installed, beside the profiler subscription and never inside its callback, and it is removed by the same reset path. The installation is written so that an app-declared `onViewError` is left in place: the record then says so, and the absence it produces is the app's own, not a gap the reader should fill.

One record shape for every arrival. Each entry carries the route the error arrived by — the hook, or a handler delivery that came with no details — the error's own name, message and, only where the boundary wrapped a value that is not Error-like, its cause; and the details fields that record carried, each normalized to plain data. A field the record did not carry is `null` and never borrowed: the two detail shapes exist for two catch paths, only one of them was measured, and the record must be readable from the fields a shape actually carries rather than from a required union.

The version obligation is answered where it can be. The record carries the version the surface can work against as the constant T001 measured, and a `coreVersion` that is `null` when the page reports none, because inventing a version is the one thing the obligation forbids. Where the page's machinery cannot be confirmed, the record says so as its own named absence, and that absence is distinct from the handler that could not be resolved or that refused the hook — three states a reader must be able to tell apart.

Two mutants name the defects this shape invites: a hook installed inside the profiler callback, so the profiler callback's own contract changes, and an installation that overwrites an app-declared `onViewError`.

Six suites read this file's source as their own subject and derive anchors or bounds from its text. The second insertion into the file is where any remaining drift lands, so they are declared here with the same reasons as in T002: each is re-cut with the failing assertion quoted, or is proven unmoved by running it. The held-out pins E12 and E13 belong to T002 and must stay green.

## Interface contract

- Record: the page agent publishes a boundary section beside its change-detection and router records, each entry `{ route, error: { name, message, cause }, details: { declarationType, declarationInstanceName, caughtBy, boundaryType, boundaryReset }, at }`, where `route` is `hook` or `handler`, every field the record did not carry is `null`, and `cause` is present only where the boundary wrapped a value that is not Error-like.
- Answer: `readErrorBoundary(record)` answers `{ state, absence, findings, absences, version }` where `state` is `caught`, `cannot-tell` or `idle`, `absence` is one of the named absences or `null`, each finding is `{ declaringType, throwingType, caughtBy, reset, errorName, errorMessage, cause, route, replacedSubtree }`, and `absences` lists one named absence per unanswered question.
- Pane answer: `errorBoundaryPanel(answer)` answers `{ state, message, lines, text, cells }` where each cell holds the text of its own state or the empty string, and `lines` carries one line per fact the answer carried.

## Intent coverage

- SC2
- SC5

## Edges

None; E12 and E13 are T002's held-out pins and E10 is T006's.

## Acceptance criteria

1. The hook is installed beside the profiler and router subscriptions and never inside either: one definition on the handler the page resolves, removed by the reset path, an app-declared `onViewError` never overwritten, and `ɵsetProfiler(null)` never called.
2. A caught error is recorded as its own name, message and — only where the boundary wrapped a value that is not Error-like — its cause, with no text read from the rendered error view and no instance, element, function or renderer object crossing the message boundary.
3. The record names the route each error arrived by, distinguishing a hook record that carried details from a handler delivery that carried none, and names whether the subject declares the browser global error listeners, so the two outcomes SC5 separates are readable from the record alone.
4. The record reads the two details shapes by the fields each carries, requires no field the other's shape omits, and travels one entry shape so no surface has to know an event number.
5. The record carries the version the surface can work against as the constant T001 measured, the reported core version is `null` where the page reports none, and a page that cannot be confirmed to carry the machinery answers a named absence rather than an empty boundary list.
6. A handler that cannot be resolved, or one that refuses the hook, is recorded as its own named absence and never as an empty caught list.
7. Two mutants redden named assertions naming their defects: one installs the hook inside the profiler callback, and one overwrites an app-declared `onViewError`.
8. Every suite that derives an anchor from this file is re-cut where the added code moves what it asserts, each with the failing assertion quoted, or is proven unmoved by running it, the page footprint bound holds, and the held-out E12 and E13 pins stay green.

## Verify

```bash
node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/performance-measure.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-capture.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-capture.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/performance-measure.test.mjs scripts/render-phase-measure.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts && npm run check
```

## Held-out

None; E12 and E13 are T002's and this task must not redden them.

## Log

- pending
- carried `onViewError`'s record into the page agent beside the existing subscriptions, additively: `extension/agent-main.js` gains one `record.boundary` section between `routerEvents` and `checks` in both the frame record and the initial snapshot, and one hook installed on the `ErrorHandler` instance the page already resolved — reached the measured way, `getInjector` on a host element then `ɵgetInjectorResolutionPath` then the provider record whose `token` names `ErrorHandler`, entry 1 and never entry 0 — from `tryInstall`'s own answer and never from inside the profiler callback. Every arrival one shape, `{ route, error, details, at }`, where `route` is read off the payload (`hook` when it carried `details`, `handler` when it carried none), `error` is the error's own `name` and `message` plus `cause` only where `name` is the `ErrorBoundaryWrappedError` the boundary wraps a non-Error value in, and `details` is the five canonical fields. The two detail shapes are read by the fields each carries and no field the other omits is required: `caughtBy` is the catching view's own `ON_ERROR` function, so the entry keeps the one plain fact it carries — `true` where the payload carried it, `null` on the construction shape and never synthesised from `boundary.type`; `declarationType` (the *throwing* view on the change-detection path) and `boundaryType` (`details.boundary.type`, always the *declaring* view) are recorded apart, so no finding can present the thrower as the boundary; `boundaryReset` records that the boundary offered a reset the message boundary cannot carry. The section's own fields are the install answer and its named absence, the chaining flag, the browser-listener answer, and the version: `version` is T001's constant `22.2.2` and `coreVersion` is whatever the page reports, `null` on both measured installs. Four absences, each named and each distinct: `machinery-unconfirmed` where `typeof ng.toggleWatchSignal !== 'function'` — the single discriminator T001 enumerated — so a page on a core without the machinery answers `cannot-tell` rather than an empty boundary list; `handler-unresolved` where the walk finds no record; `hook-refused` where the assignment does not take; and `no-global-error-listeners` where the same walk finds no record for the token `provideBrowserGlobalErrorListeners()` resolves at bootstrap, a named absence and never a claim that no raw browser error occurred (N5). An app-declared `onViewError` is chained, not replaced: the hook records first inside its own `try`, then calls the app's hook with the same error, the same details and the same `this`, so a recorder can never break the app's handler and an app hook that throws still throws; `chained: true` says so and `reset` puts the app's hook back. `ɵsetProfiler` is still called once and never with `null`, `OutputStart` still sets the trigger, `TemplateUpdateStart` still opens the cycle, and raw arrivals stay unpaired. Anchors held: `prevEpochs.set(instance, next);` is still line 1034, `function closeCycle()` still 1038, `var prevEpochs = new WeakMap();` still 42, `prevEpochs = new WeakMap();` still 1889, and `extension/agent-main.js:1750-1839` is still the router reach — every edit above line 1889 was made line-neutral on purpose, so `research/raw/m039-render-phase.json`, `m040-work-events.json`, `m041-navigation.json` and T001's own recording keep every anchor they carry and none of those four files was touched. One line of the initial-record timer was tightened and one restored comment line freed to keep that neutrality; the boundary section itself is inserted after `reset()`, where nothing is cited.
- `extension/agent-main.test.mjs` gains a T003 block driving the shipped install on the page T001 measured — the discriminator published, the `ErrorHandler` token on resolution path entry 1, and the provider record `provideBrowserGlobalErrorListeners()` leaves behind — with nine pins and five real anchored mutants, each reddening with its defect named by string: M1 gives a payload that lacks `caughtBy` a synthetic one (`caughtBy: hasBoundary ? true : null`) and reddens `/the construction shape does not carry caughtBy, so the record answers null/`; M2 swaps the throwing view and the declaring boundary (the two field reads swapped) and reddens `/the change-detection shape names the view whose template threw/`; M3 answers an absent discriminator as an empty boundary list (`boundaryInstalled = true` in place of the named absence) and reddens `/cannot be confirmed to carry the boundary machinery/`; M4 replaces rather than chains an app-declared hook (`boundaryPriorHook = null;`) and reddens `/an installation that replaced it leaves this empty/`; M5 installs the hook inside the profiler callback (moved from `tryInstall` into the subscriber) and reddens `/the hook must be armed on the handler the page resolved, before any profiler event arrives/`, then proves non-vacuity by arming after the first event. Two T002 pins were re-cut where the added field moved what they assert, each quoted at the assertion: `assertMeasuredFrame` read `['cycleId','startedAt','trigger','zoneMode','events','routerEvents','checks']` and failed with `+ 'boundary'` in `actual`, and the initial-record pin read the same list and failed the same way; both now carry `'boundary'` between `'routerEvents'` and `'checks'`, which is the one position it holds in both records. The five suites that derive anchors from `extension/agent-main.js` — `page-footprint`, `performance-measure`, `render-phase-measure`, `performance-capture`, `render-phase-capture`, `navigation-measure`, `navigation-capture` — moved not at all and were proven so by running them: the page footprint is still `identical: true` with one subscriber per arm and the eight `features` names in order, and every recording still re-derives from this head, `research/raw/m041-navigation.json` still reading its reach at `extension/agent-main.js:1750-1839`.
- The task's Verify passed verbatim at this head, in its own order and `&&`-joined: `node --check` over `extension/agent-main.js` and `extension/agent-main.test.mjs` silent; the eight declared suites reported `tests 241 / pass 241 / fail 0` (226 before this task, 15 new), with held-out E12 and E13 green among them; `npx nx run angular-ai-devtools:test` reported 31 files and 345 tests green; `npx prettier --check` over the six listed files reported `All matched files use Prettier code style!`; `npm run check` exited 0 with `verification gate (structure): pass`, the four tsc projects green and `format:check` clean. Nothing outside the twelve declared files was written, and `research/raw/m042-error-boundary.json` is untouched: T006 owns its re-capture, and every anchor it and the three earlier recordings carry still holds because every edit above line 1889 is line-neutral. ready.
