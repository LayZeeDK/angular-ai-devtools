---
id: T001
title: Implement MAIN-world provenance tracer with per-component graph aggregation
wave: 1
deps: []
status: done
agent: build_T001
base: f9aa7a2202ddf6511340723e3d8c89913dd1e5c1
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
---

# T001 — Implement MAIN-world provenance tracer with per-component graph aggregation

## Context

N2 traces reactive provenance through `ng.ɵgetSignalGraph`. Per SYNTHESIS, reuse N1's mapping (instance → host element → NodeInjector → `ng.ɵgetSignalGraph(injector)`; owning component is the `template` node whose `debuggableFn === instance.constructor`), aggregate per-component subgraphs by global node id, and resolve edges to node ids at serialization. Component enumeration uses `ng.getRootComponents` / `getOwningComponent` / `getComponent` plus host/injector utils — never `angular:di_graph` or `getViewContainerRef()` (Prohibition N3). A missing `template` node means the graph was destroyed (VCR / `di_graph`) and must be reported as "graph unavailable", never "no anti-patterns found" (SYNTHESIS graph-unavailable decision). Edges are per-graph indices in Angular's output; resolve them to global node ids during serialization so downstream code never handles raw indices.

## Approach

- Extend `extension/agent-main.js` `captureGraph`/`serializeGraph` to: enumerate components via `ng` utils (not di_graph), capture one `getSignalGraph` per component injector, and serialize nodes with their global string `id` plus edges resolved from indices to node ids. Keep the existing microtask-delimited cycle and epoch diff.
- Feature-detect every `ng.*` entry point (`typeof ... === 'function'`); if `ɵgetSignalGraph` is absent, report "not supported" with reason and do not trace.
- When the `template` node is absent for a component, mark that check's graph as unavailable (distinct from empty findings) rather than dropping it silently.
- Forbid `ViewContainerRef`, `getViewContainerRef`, `di_graph`, `devtoolstooldiscovery` in this file; add static assertions in `extension/agent-main.test.mjs`.
- Preserve profiler event order; no name-based tie-break (E6 applies to traversal but serialization must not reorder nodes).
- Treat labels as data: serialize `label` as a string or null, never invoke `debuggableFn`.

## Interface contract

- None

## Intent coverage

- SC1

## Acceptance criteria

1. `agent-main.js` captures one `ng.ɵgetSignalGraph` per enumerated component injector and serializes edges resolved to global node ids (no raw indices reach the panel).
2. A component whose graph lacks a `template` node is marked `unavailable: true` in its serialized graph, distinct from an empty node list.
3. Missing `ng.ɵgetSignalGraph` yields "not supported" with a reason and no tracing.
4. No forbidden token (`ViewContainerRef`, `getViewContainerRef`, `di_graph`, `devtoolstooldiscovery`) appears in `agent-main.js`.
5. `extension/agent-main.test.mjs` asserts id-resolved edges, the unavailable flag, and forbidden-token absence.

## Verify

```bash
npm run check && node --test extension/agent-main.test.mjs
```

Heavy: no

## Log

- created by planner
- implemented T001: resolved edges to global node ids in serializeGraph, added unavailable flag for missing template node, feature-detected ng.ɵgetSignalGraph in tryInstall. Updated tests: id-resolved edges, unavailable flag, not-supported state. Verify: npm run check (pass) + node --test (18 pass, 0 fail).
