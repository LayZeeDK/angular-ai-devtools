---
id: T002
title: Implement provenance chain traversal and unit tests
wave: 1
deps: [T001]
status: done
agent: build_t002
base: 2b4a34e7fdac2040eb5d00a9d4c789f8529849b3
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/signal-provenance.ts
  - apps/angular-ai-devtools/src/app/signal-provenance.spec.ts
---

# T002 — Implement provenance chain traversal and unit tests

## Context

Given a recorded cycle (T001), compute the provenance chain for a user-selected signal or component: producers → consumers through the signal graph, deterministically. Traversal order follows the profiler's node order (sequential); no name-based tie-break (held-out edge E6). When the selected node has no producers or consumers, the chain shows a single node with "no dependencies" (edge E3). When the graph is unavailable, report "graph unavailable" (distinct from empty). Each node's kind, label, and edge direction must be exposed for the panel (SC2). Prohibition N5: do not omit edges or show an incomplete chain.

## Approach

- Add a pure, unit-testable traversal function in `signal-provenance.ts` that takes a recorded check (with its id-resolved graph) plus a selected node id and returns the provenance result.
- Walk producer/consumer edges from the selected node in graph (node-array) order; preserve profiler node order, no sorting by label or name (E6).
- Distinguish "graph unavailable" (graph.unavailable true) from "no dependencies" (intact graph, selected node has degree 0) from "no signal cause".
- Expose each visited node's id, kind, label, and edge direction (producer/consumer/self) so the panel renders them.
- Unit tests in `signal-provenance.spec.ts` assert traversal on recorded graph data, including single-node-no-deps, graph-unavailable, and profiler-order (E6 held-out).

## Interface contract

- None

## Intent coverage

- SC1
- SC2
- SC5

## Acceptance criteria

1. Traversal follows the profiler's node order (sequential) with no name-based tie-break; the E6 held-out test asserts this on recorded data.
2. A selected node with no producers or consumers yields a single step with `noDependencies: true`.
3. An unavailable graph yields `graphUnavailable: true` and an empty steps list (no false "no dependencies").
4. Every visited node exposes kind, label, and edge direction; no edge is omitted.
5. Unit tests in `signal-provenance.spec.ts` cover the above, including the E6 ordering case.

## Verify

```bash
npx nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/signal-provenance.spec.ts
```

Heavy: no

## Log

- created by planner
- 2026-10-23 coder: added `traceProvenance(check, selectedId?)` in `signal-provenance.ts`. It walks the transitive producers and consumers from the selected node and emits steps grouped producer -> self -> consumer. Within each group, steps keep the recorded node-array order and are never sorted by label (E6). Each step carries id, kind, label, direction and position, and the result returns every resolved edge in the chain. When `selectedId` is omitted, the component's template node is selected. The function distinguishes `graphUnavailable` (graph null or `unavailable: true`, with empty steps) from `noDependencies` (a single self step) and from `notFound` (id absent from an intact graph). Edges whose endpoints do not resolve to a recorded node are skipped. N1's "no signal cause" stays in `update-cause-chain.ts`; this result type does not produce it. `signal-provenance.spec.ts` has 8 tests on counter-shaped recorded data.
- 2026-10-23 coder: Verify `npx nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/signal-provenance.spec.ts` passed: 1 file, 8 tests. Run with node_modules bridged by `scripts/sidecar-deps-bridge.mjs`; the junction was removed afterwards.
- 2026-10-23 — orchestrator Verify (isolate gsd-path-task/T002): pass, exit 0; output tail:
  ```
  [37mApplication bundle generation complete. [1.716 seconds] - 2026-10-23T10:19:07.031Z
  [39m
  [1m[30m[46m RUN [49m[39m[22m [36mv4.1.12 [39m[90mC:/Users/LarsGyrupBrinkNielse/.gsd-path/projects/d10fb97cec6c7ac7/8919d4cefeb4a7e5/task/T002[39m
   [32m✓[39m [30m[46m angular-ai-devtools [49m[39m apps/angular-ai-devtools/src/app/signal-provenance.spec.ts [2m([22m[2m8 tests[22m[2m)[22m[32m 5[2mms[22m[39m
  [2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
  [2m      Tests [22m [1m[32m8 passed[39m[22m[90m (8)[39m
  [2m   Start at [22m 12:19:07
  [2m   Duration [22m 879ms[2m (transform 40ms, setup 233ms, import 14ms, tests 5ms, environment 411ms)[22m
  
  [2m[32m[39m[22m
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      4.5s
    Cache:             Skipped (--skip-nx-cache)
    Critical path:     4.5s (1 task)
    Recoverable time:  <1ms
  npm notice run npx
  npm notice run nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/signal-provenance.spec.ts
  ```
