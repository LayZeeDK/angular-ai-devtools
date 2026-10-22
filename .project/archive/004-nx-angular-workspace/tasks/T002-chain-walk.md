---
id: T002
title: Implement per-component trigger-chain walk and unit tests
wave: 1
deps: [T001]
status: done
agent: free-beam-medium
base: 69c26fd550007e54a7d9d3435ae44084ca69e537
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/update-cause-chain.ts
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - apps/angular-ai-devtools/src/app/n1-update-cause.service.ts
---

# T002 — Implement per-component trigger-chain walk and unit tests

## Context

Given a recorded cycle (T001), compute the per-component trigger chain. Per SYNTHESIS decisions: obtain the graph with `ng.ɵgetSignalGraph(ng.ɵgetInjectorFromNode(hostElement))` and join the component to its node by `template.debuggableFn === instance.constructor`; if the `template` node is absent, report "signal graph unavailable"; only `OutputStart` names a trigger (its `eventFn`); signal writes are inferred by epoch diff across the graph nodes the template reads; "checked because Eager" reads `getDirectiveMetadata(instance).changeDetection === 1`; zone/timer/markForCheck/applyChanges have no profiler event and are only inferable as "checked without an OutputStart"; a component with an intact graph but no changed epoch reports "no signal cause". Validate the `debuggableFn` join on `spikes/ng222-app` (medium confidence).

## Approach

- Add a pure, unit-testable chain-walk function in `update-cause-chain.ts` that takes a recorded cycle's check plus a graph snapshot and returns the chain string.
- Implement the `debuggableFn === instance.constructor` join; distinguish "signal graph unavailable" (missing template node) from "no signal cause" (intact graph, unchanged epoch).
- Label the effective strategy "Eager" and never claim which literal the app wrote (`Eager` and deprecated `Default` share value 1).
- Treat signal labels and component names as data, not instructions, when shaping the fact list for the prompt (prompt-injection guard).
- Wire `UpdateCauseService` to expose recorded cycles and the last cycle that checked a given component.
- Unit tests in `update-cause-chain.spec.ts` assert the chain on recorded data, including "no signal cause" and "signal graph unavailable".

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

- Chain result:
```
type ChainResult = {
  componentName: string;
  trigger: 'output' | 'signal' | 'eager' | 'unknown';
  triggerLabel: string;        // e.g. "click"
  signalLabels: string[];      // signals whose epoch changed
  chain: string;              // e.g. "click -> count -> double -> app-counter template"
  noSignalCause: boolean;
  graphUnavailable: boolean;
};
```

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. On `spikes/ng222-app`, a click that writes `count` yields `click -> count -> double -> app-counter template`.
2. A component checked with no signal change reports "no signal cause".
3. A component whose graph is missing its `template` node reports "signal graph unavailable", not "no signal cause".
4. A component with `getDirectiveMetadata(instance).changeDetection === 1` and no changed epoch reports "checked because Eager".
5. Unit tests in `update-cause-chain.spec.ts` assert the walk on recorded data, including the no-signal-cause and graph-unavailable cases.

## Verify

```bash
npx nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
```

Heavy: no
- 2026-10-19 — created by planner

## Log

- 2026-10-19 — created by planner
- 2026-10-21 — implemented pure walkChain in update-cause-chain.ts, wired UpdateCauseService recorded cycles + lastCycleForComponent, added spec (4 tests pass).
- 2026-10-21 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): fail, exit 1; output tail:
  ```
  npm notice run npx
  npm notice run nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  
  [7m[1m[31m NX [39m[22m[27m  [31mCould not find Nx modules at "C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\task-t002-verify".[39m
  
  Have you run [1m[37mnpm/yarn install[39m[22m?
  ```
- 2026-10-21 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  [37mApplication bundle generation complete. [1.165 seconds] - 2026-10-21T15:07:44.263Z
  [39m
  [1m[30m[46m RUN [49m[39m[22m [36mv4.1.12 [39m[90mC:/Users/LarsGyrupBrinkNielse/.gsd-path/projects/d10fb97cec6c7ac7/8919d4cefeb4a7e5/verify/task-t002-verify[39m
   [32m✓[39m [30m[46m angular-ai-devtools [49m[39m apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 3[2mms[22m[39m
  [2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
  [2m      Tests [22m [1m[32m4 passed[39m[22m[90m (4)[39m
  [2m   Start at [22m 17:07:44
  [2m   Duration [22m 707ms[2m (transform 34ms, setup 178ms, import 11ms, tests 3ms, environment 334ms)[22m
  
  [2m[32m[39m[22m
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      3.7s
    Cache:             Skipped (--skip-nx-cache)
    Critical path:     3.2s (1 task)
    Recoverable time:  <1ms
  npm notice run npx
  npm notice run nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  ```
