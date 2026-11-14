---
id: T001
title: Measure the three gate shapes and publish one record
wave: 1
deps:
  []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - scripts/gate-integrity.test.mjs
---

# T001 — Measure the three gate shapes and publish one record

## Context

Three shapes decide every later task, and none of them is measured at this head. The archive-path rule needs to tell a test that resolves a live `.project/` path the archive move deletes from a test that deliberately reads an archived path, because M043's resolver does the latter on purpose in `scripts/error-boundary-capture.test.mjs:46` and `scripts/error-boundary-measure.test.mjs:53` — a rule that flagged both would fail every milestone after its own archive. The fix-record rule needs a real range, because a rename appears as a deletion and an addition and a claim naming the new name is true. And the navigation repair needs the recorded stream, because `extension/navigation-narrator.js:459` discards a terminal for a navigation that already ended and only `research/raw/m041-navigation.json` can say whether that shape occurs live.

## Approach

- Enumerate every `.project/` reference in every authored suite under `scripts/`, `extension/` and `apps/`, with file, line and resolved path, and classify each as `archived-by-the-move`, `deliberate-archive-read` or `undecided` with the reason recorded.
- Reproduce the M035 `nx.json` claim against `d94502d1`: record what the range's diff carries for that path and what the tree carries, keeping the two facts separate.
- Read `research/raw/m041-navigation.json` and record every `NavigationSkipped` entry with its id, its url and whether that id carries a start entry.

## Interface contract

The record is `research/raw/m044-gate-shapes.json` and carries one section per measurement: `archiveReferences[]`, `fixRecord`, `skippedNavigations[]`. Every section carries `examined` and `command`, and `examined: 0` is a failure of the measurement rather than a clean result.

## Intent coverage

- SC1
- SC2
- SC4

## Edges

- E1
- E2
- E3
- E4
- E5

## Acceptance criteria

1. held-out E1 and E2 — AC1 every `.project/` reference is enumerated with file, line and resolved path, and each carries a classification and the reason for it — an undecidable reference is recorded as `undecided` and named, never guessed.
2. held-out E4 and E5 — AC2 the M035 claim about `nx.json` is reproduced against `d94502d1`, the recording stating what the range's diff carries for that path, and a rename in the same range is recorded as the pair it produces.
3. held-out E3 — AC3 `research/raw/m041-navigation.json` is read and every `NavigationSkipped` entry is recorded with its id, url and whether that id has a start entry.
4. held-out E3 — AC4 each measurement states the command that produced it and what it examined, with `examined: 0` recorded as a failure rather than a clean result.

## Verify

```bash
node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" && npx prettier --check scripts/gate-integrity.test.mjs research/raw/m044-gate-shapes.json && npm run check
```

## Held-out

None; E1 to E11 are T002's, T003's and T004's and this task must not redden them

## Log

- (no entries yet)