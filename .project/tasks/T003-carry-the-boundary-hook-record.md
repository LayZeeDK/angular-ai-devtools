---
id: T003
title: Carry the boundary hook's record beside the profiler and router subscriptions
wave: 3
deps:
  - T002
status: pending
agent: null
base: null
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
