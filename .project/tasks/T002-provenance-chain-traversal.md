---
id: T002
title: Implement provenance chain traversal and unit tests
wave: 1
deps: [T001]
status: pending
agent: null
base: null
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
