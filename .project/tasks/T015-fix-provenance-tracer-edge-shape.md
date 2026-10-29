---
id: T015
title: Build provenance adjacency from consumer/producer edges
wave: 5
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/main-world/provenance-tracer.ts
  - src/main-world/provenance-tracer.test.ts
---

# T015 — Build provenance adjacency from consumer/producer edges

## Context

M006 F3 (blocking): `src/main-world/provenance-tracer.ts:32` only follows `from`/`to` edges while the extension serializes `{consumer, producer}`. Remedy: build adjacency from those. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix.

## Approach

- Update `src/main-world/provenance-tracer.ts` to build adjacency from `consumer`/`producer` edges (the serialized shape), instead of `from`/`to`.
- Keep handling of any legacy `from`/`to` shape only if present in tests; the canonical shape is `{consumer, producer}`.
- No change to the tracer's public API.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `provenance-tracer.ts` builds adjacency from `consumer`/`producer` edges.
2. No reliance on `from`/`to` for the canonical serialized shape.
3. Type check and tracer tests pass.

## Verify

```bash
npm ci && npm run check && node --test src/main-world/provenance-tracer.test.ts
```

Heavy: no

## Log

- created by planner