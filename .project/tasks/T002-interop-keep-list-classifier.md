---
id: T002
title: Implement interop keep-list classifier (label + subject.error source rules)
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/main-world/interop-keep-list.ts
  - src/main-world/interop-keep-list.spec.ts
---

# T002 — Implement interop keep-list classifier (label + subject.error source rules)

## Context

No library-internal filter exists in code today (grep returned no matches). The interop keep-list is its own predicate applied directly to the raw serialised graph: a node is kept iff its `label` is `toSignal.source`/`toSignal.state` OR its `debuggableFnSource` contains a whole-token `subject.error` match. Neither alone suffices: the unlabelled effect has no `toSignal.*` label, and a label-only rule misses it. `debuggableFn` collapses to its name over the boundary, so the classifier must run on `debuggableFnSource` text. Reuse N24's `nodeText` preference order (`debuggableFnSource` -> string `debuggableFn` -> `toString`) for the source rule.

## Approach

- Create `src/main-world/interop-keep-list.ts` exporting a pure classifier (e.g. `isInteropNode(node)` and/or `keepInteropNodes(graph)`) operating on serialised graph nodes.
- Rule 1: `label` equals `toSignal.source` or `toSignal.state`.
- Rule 2: the node's text (per `nodeText` preference order) contains a whole-token `subject.error` match (anchor on identifier boundaries, not a loose substring, to avoid false positives).
- Apply the two rules only; no third, fixture-shaped exception (Prohibition N3).
- `subject.error` matching must be a whole-token match, not a loose substring.
- Write `src/main-world/interop-keep-list.spec.ts` covering both directions of E5: a node with no label but `debuggableFnSource` containing `subject.error` is kept; a library-internal node matching neither rule is filtered.
- Also cover the label rule and the whole-token boundary (e.g. `subject.errorHandler` must not match).

## Interface contract

- `GraphNode.value?: unknown` (optional) in `apps/angular-ai-devtools/src/app/update-cause-chain.ts`.
- `SignalGraphNode.value?: unknown` (optional) in `src/main-world/provenance-tracer.ts`.
- Serialised node in `extension/agent-main.js` gains `value` (optional, primitive/type-length summary).
- Export `isInteropNode(node: { label?: string | null; debuggableFn?: unknown; debuggableFnSource?: string | null }): boolean` from the keep-list module that T002 adds under the main-world source tree.
- Export `keepInteropNodes(nodes)` (or equivalent) returning the kept subset in input order.
- Route path `interop` (full `/panel/interop` under base href `/panel/`).
- Identical optional field name `value` on all three; consumers treat absence as "no value".

## Intent coverage

- SC4

## Acceptance criteria

1. A node whose label is `toSignal.source` or `toSignal.state` is kept.
2. A node with no label but whose `debuggableFnSource` contains a whole-token `subject.error` is kept (E5 held-out).
3. A library-internal node matching neither rule is filtered (E5 held-out).
4. `subject.error` matching is whole-token; `subject.errorHandler`/`xsubject.error` do not match.
5. No third, fixture-shaped exception exists in the classifier (Prohibition N3).
6. `src/main-world/interop-keep-list.spec.ts` passes under node:test.
7. `npm run check` passes.

## Verify

```bash
node --experimental-strip-types --test src/main-world/interop-keep-list.spec.ts && npm run check
```

Heavy: no

## Log

- pending