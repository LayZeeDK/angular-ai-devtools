---
id: T003
title: Implement reactive anti-pattern detector (four rules)
wave: 1
deps: [T001]
status: done
agent: build_t003
base: 2b4a34e7fdac2040eb5d00a9d4c789f8529849b3
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/anti-pattern-detector.ts
  - apps/angular-ai-devtools/src/app/anti-pattern-detector.spec.ts
---

# T003 — Implement reactive anti-pattern detector (four rules)

## Context

Detect four structural anti-patterns from the signal graph (SYNTHESIS anti-pattern catalogue): (1) untracked read in an effect — an `effect`/`afterRenderEffectPhase` node whose traversal shows a read that produced no consumer→producer edge; (2) untracked write — a `signal` whose epoch advances but has no consumer edge to the effect that wrote it; (3) computed with side effects — a `computed` node that is also a producer of a write (out-edge to a `signal`) or otherwise violates purity; (4) write-after-read in the same effect — a cycle edge `effect → signal` (write) where the same effect also has an incoming `signal → effect` edge (read). Classification uses node kind + edge indices only; never invoke `debuggableFn` (Prohibition N1/N6). Missing cleanup is excluded (not graph-detectable). False-positive mitigation: require a missing edge to persist across two snapshots before flagging an untracked read (SYNTHESIS false-positive mitigation). Graph-unavailable (missing `template` node) yields a distinct "graph unavailable" result, never "no anti-patterns found" (SYNTHESIS graph-unavailable decision). Each finding carries node labels and graph positions (Prohibition N6). A node appearing in multiple chains is reported once per chain (edge E7).

## Approach

- Add a pure, unit-testable detector in `anti-pattern-detector.ts` that takes the current graph (T001 shape) plus an optional previous graph snapshot and returns `{ graphUnavailable, findings }`.
- Implement the four rules structurally (kind + edge relation + epochs); never read or invoke `debuggableFn`.
- Require two-snapshot persistence for untracked-read flagging: a missing edge must be absent in both the current and previous snapshot before it is reported.
- When `graph.unavailable` is true, return `graphUnavailable: true` with an empty findings list (distinct result).
- When no findings, the caller (panel) shows "no anti-patterns found" plus the chain (edge E4); the detector simply returns an empty list.
- Unit tests on recorded graph fixtures assert each of the four rules fires with evidence, the two-snapshot mitigation suppresses a first-snapshot false positive, and graph-unavailable is distinct.

## Interface contract

- None

## Intent coverage

- SC3
- SC5

## Acceptance criteria

1. At least three of the four rules fire on the counter fixture's recorded graph with node labels and positions (SC3).
2. Each finding includes `nodeId`, `nodeLabel`, `position`, and `evidence`.
3. A missing edge present only in the first snapshot does not produce an untracked-read finding (two-snapshot mitigation).
4. An unavailable graph returns `graphUnavailable: true` with an empty findings list (distinct from "no anti-patterns found").
5. No `debuggableFn` invocation or source scanning occurs in the detector.
6. Unit tests in `anti-pattern-detector.spec.ts` cover rules, mitigation, and graph-unavailable.

## Verify

```bash
npx nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/anti-pattern-detector.spec.ts
```

Heavy: no

## Log

- created by planner
- implemented T003: pure `detectAntiPatterns(graph, previous?)` returning `{ graphUnavailable, findings }`; each finding carries `rule`, `nodeId`, `nodeLabel`, `position` (index in the graph's node order) and an `evidence` string with related node kinds, labels and positions. Rules from kind + edges + epochs only (debuggableFn never read). An edge whose consumer is a `signal` is treated as a write by its producer, since a signal cannot read. Rule 1 (untracked read) needs an effect with no read edge in both snapshots; no previous snapshot means no finding. Rule 2 (untracked write) needs the signal's epoch to advance against the previous snapshot. Graph unavailable = null graph, `unavailable: true`, or no `template` node. Caveat for T005: Angular's `getSignalGraph` emits read edges only, so rules 2-4 fire only where write edges reach the graph; the spec's counter fixture seeds them, and the live counter fixture alone shows no write edges. Verify: `npx nx test angular-ai-devtools --skip-nx-cache --include=.../anti-pattern-detector.spec.ts` pass (6/6), with a temporary node_modules junction to the primary checkout (AGENTS.md sidecar procedure), removed afterwards; `npm run check` pass.
- 2026-10-23 — orchestrator Verify (isolate gsd-path-task/T003): fail, exit 1; output tail:
  ```
  npm notice run npx
  npm notice run nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/anti-pattern-detector.spec.ts
  
  [7m[1m[31m NX [39m[22m[27m  [31mCould not find Nx modules at "C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T003".[39m
  
  Have you run [1m[37mnpm/yarn install[39m[22m?
  ```
- 2026-10-23 — orchestrator Verify (isolate gsd-path-task/T003): pass, exit 0; output tail:
  ```
  [37mApplication bundle generation complete. [1.344 seconds] - 2026-10-23T10:26:30.119Z
  [39m
  [1m[30m[46m RUN [49m[39m[22m [36mv4.1.12 [39m[90mC:/Users/LarsGyrupBrinkNielse/.gsd-path/projects/d10fb97cec6c7ac7/8919d4cefeb4a7e5/task/T003[39m
   [32m✓[39m [30m[46m angular-ai-devtools [49m[39m apps/angular-ai-devtools/src/app/anti-pattern-detector.spec.ts [2m([22m[2m6 tests[22m[2m)[22m[32m 5[2mms[22m[39m
  [2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
  [2m      Tests [22m [1m[32m6 passed[39m[22m[90m (6)[39m
  [2m   Start at [22m 12:26:47
  [2m   Duration [22m 962ms[2m (transform 37ms, setup 198ms, import 12ms, tests 5ms, environment 555ms)[22m
  
  [2m[32m[39m[22m
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      21.4s
    Cache:             Skipped (--skip-nx-cache)
    Critical path:     21.4s (1 task)
    Recoverable time:  <1ms
  npm notice run npx
  npm notice run nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/anti-pattern-detector.spec.ts
  ```
