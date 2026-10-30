---
id: T001
title: Add optional `value` field to serialised graph nodes and TS interfaces
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - apps/angular-ai-devtools/src/app/update-cause-chain.ts
  - src/main-world/provenance-tracer.ts
---

# T001 — Add optional `value` field to serialised graph nodes and TS interfaces

## Context

Field-to-node attribution for the RxJS interop explainer needs a value per node, and `serializeGraph` emits none today, while `GraphNode` and `SignalGraphNode` have none. The fix is additive and optional so N1/N2/N3/N4/N24 consumers keep compiling and ignore the extra field. The value is a type/length/primitive summary, not a raw object, for cross-browser stability.

## Approach

- In `extension/agent-main.js`, `serializeGraph` (around the node push at lines 329-336) add an optional `value` field summarising the node's value (primitive value, or type+length for arrays/objects). Keep it optional; do not break serialisation when a value cannot be read.
- In `apps/angular-ai-devtools/src/app/update-cause-chain.ts`, add `value?: unknown` (or a summary type) to `GraphNode`, additive and optional.
- In `src/main-world/provenance-tracer.ts`, add `value?: unknown` to `SignalGraphNode`, additive and optional.
- Do not alter N1/N2/N3/N4/N24 consumers; they ignore the field.
- Prove `npm run check` still passes and the existing provenance tests still pass.

## Interface contract

- `GraphNode.value?: unknown` (optional) in `apps/angular-ai-devtools/src/app/update-cause-chain.ts`.
- `SignalGraphNode.value?: unknown` (optional) in `src/main-world/provenance-tracer.ts`.
- Serialised node in `extension/agent-main.js` gains `value` (optional, primitive/type-length summary).
- Export `isInteropNode(node: { label?: string | null; debuggableFn?: unknown; debuggableFnSource?: string | null }): boolean` from the keep-list module that T002 adds under the main-world source tree.
- Export `keepInteropNodes(nodes)` (or equivalent) returning the kept subset in input order.
- Route path `interop` (full `/panel/interop` under base href `/panel/`).
- Identical optional field name `value` on all three; consumers treat absence as "no value".

## Intent coverage

- None

## Acceptance criteria

1. `serializeGraph` emits a `value` field on every node when a value can be read, and omits/best-efforts it otherwise; serialisation never throws.
2. `GraphNode` and `SignalGraphNode` compile with the new optional `value` field.
3. N1/N2/N3/N4/N24 consumers still type-check and their tests still pass.
4. `npm run check` passes.

## Verify

```bash
node --check extension/agent-main.js && npm run check
```

Heavy: no

## Log

- pending