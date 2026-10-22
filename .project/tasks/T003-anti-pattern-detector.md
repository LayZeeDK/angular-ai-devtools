---
id: T003
title: Implement reactive anti-pattern detector (four rules)
wave: 1
deps: [T001]
status: pending
agent: null
base: null
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
