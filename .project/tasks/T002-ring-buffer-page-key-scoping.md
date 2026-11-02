---
id: T002
title: Add the 200-message ring buffer keyed by pageKey
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/message-ring-buffer.ts
  - apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts
---

# T002 — Add the 200-message ring buffer keyed by pageKey

## Context

The panel has no history array or ring buffer today. This task adds an Angular store/service holding up to 200 messages, tagged with pageKey = tabId:navigationId, with a live currentPageKey that updates on navigation. The oldest entry stays readable by position after navigation, but an entry is only served as a current-page fact when its pageKey equals currentPageKey.

## Approach

- Location is the panel (an Angular store/service), not a worker, so it outlives an inspected-page navigation.
- Each entry is tagged with the page it was filled from; the store tracks a live currentPageKey that updates on navigation.
- Eviction is FIFO at capacity 200; stale-key entries are pruned lazily on the next write rather than on navigation.
- An empty buffer and a buffer with exactly one entry answer without inventing a missing neighbour.
- A stale page identity must never answer for the live panel after navigation.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. The buffer holds at most 200 entries and evicts the oldest on overflow (FIFO).
2. After navigation the oldest surviving entry remains readable by position.
3. An entry is served as a current-page fact only when its pageKey equals the live currentPageKey.
4. An empty buffer and a single-entry buffer answer without inventing a missing neighbour.
5. No stale page identity answers for the live panel after navigation.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts
```

Heavy: no

## Log

- created by planner