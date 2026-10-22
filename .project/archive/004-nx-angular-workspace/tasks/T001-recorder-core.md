---
id: T001
title: Implement MAIN-world change-detection recorder core
wave: 1
deps: []
status: done
agent: ornith
base: 44d0f4683aea12f12b4b21218759f8f53b478e8d
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
---

# T001 — Implement MAIN-world change-detection recorder core

## Context

N1 needs a MAIN-world recorder that captures change-detection cycles without touching the signal graph. Per SYNTHESIS, a component check is `TemplateUpdateStart`/`TemplateUpdateEnd` carrying the component instance; the profiler callback is signed `(event, instance?, eventFn?)`; one cycle is the window opened by the first `TemplateUpdateStart` and closed by a queued microtask. Recording starts when the panel opens on the inspected tab and a page reload resets it. This task delivers that recorder and the feature/zone-mode detection, and keeps Angular DevTools' subscriber intact by using the remover returned by `ng.ɵsetProfiler`.

## Approach

- Rewrite `extension/agent-main.js` to a page-reading recorder only: remove all `LanguageModel`/prompt code (that bridge is deleted in T006). Install one subscriber via `ng.ɵsetProfiler` when `typeof window.ng?.ɵsetProfiler === 'function'`; store and call the returned remover on stop, never `ng.ɵsetProfiler(null)`.
- Buffer `TemplateUpdateStart`/`End` per component instance inside a microtask-delimited cycle; preserve the profiler's event order (no name-based tie-break; E4).
- Detect zone mode from the root injector's `NgZone`: `NoopNgZone` (including a zoneless app that still loads zone.js) is supported; a real `ZoneNgZone` reports "not supported" (E7).
- Feature-detect every `ng.*` entry point (`typeof ... === 'function'`); if `ɵsetProfiler` is absent (production build, non-Angular page), expose "not supported" with the reason and do not record (E7).
- Forbid `ViewContainerRef`, `getViewContainerRef`, `di_graph`, `devtoolstooldiscovery` in this file; add a static test in `extension/agent-main.test.mjs` asserting their absence and the microtask cycle-order rule on recorded data.
- Communicate recorded cycles to the panel over the existing `window` CustomEvent channel as shaped facts only; the prompt and answer never travel this channel (N1).

## Interface contract

- Recorded cycle:
```
{
  cycleId: number,
  startedAt: number,
  trigger: { kind: 'output' | 'unknown', listenerName: string | null },
  checks: Array<{ instance: object, componentName: string, events: number[] }>
}
```
One `checks` entry per `TemplateUpdateStart`/`End` pair in profiler event order; `cycleId` increments per microtask-delimited cycle.

## Intent coverage

- SC1

## Acceptance criteria

1. `agent-main.js` installs exactly one `ng.ɵsetProfiler` subscriber and uses the returned remover on stop; no call to `ng.ɵsetProfiler(null)` anywhere in the file.
2. Cycles are microtask-delimited: the first `TemplateUpdateStart` opens a cycle and a queued microtask closes it; event order is preserved with no name-based tie-break (E4).
3. Zone mode is read from the root injector's `NgZone`, not `typeof Zone`; `NoopNgZone` is supported and a real `ZoneNgZone` yields "not supported".
4. Missing `ng.ɵsetProfiler` yields "not supported" with a reason and no recording.
5. No forbidden token (`ViewContainerRef`, `getViewContainerRef`, `di_graph`, `devtoolstooldiscovery`) appears in `agent-main.js`.
6. `extension/agent-main.test.mjs` asserts the cycle-order rule and the forbidden-token absence.

## Verify

```bash
npm run check && node --test extension/agent-main.test.mjs
```

Heavy: no
- 2026-10-19 — created by planner

## Log

- 2026-10-19 — created by planner
- 2026-10-21 — orchestrator Verify (isolate gsd-path-task/T001): pass, exit 0; output tail:
  ```
      ✔ extracts from a host-binding handler name (0.1518ms)
      ✔ returns null for names without a recognizable shape (0.1335ms)
    ✔ extractTriggerName (formatOutput-style) (0.5406ms)
    ▶ signal-graph capture and epoch diff
      ✔ serializes the graph without signal values and diffs epochs across cycles (14.4672ms)
      ✔ reports a null graph when ɵgetSignalGraph is unavailable (0.5166ms)
    ✔ signal-graph capture and epoch diff (15.1302ms)
  ✔ agent-main.js (recorder) (37.2362ms)
  ℹ tests 15
  ℹ suites 7
  ℹ pass 15
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 161.1826
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
