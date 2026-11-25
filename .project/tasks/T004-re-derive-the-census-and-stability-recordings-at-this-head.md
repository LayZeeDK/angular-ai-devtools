---
id: T004
title: Re-derive the census and stability recordings at this head
wave: 4
status: done
deps: []
agent: build_T004
base: 616645517c222fbd9b26ef0a174468496e195679
worktree: null
task_branch: null
files:
- research/raw/m044-gate-shapes.json
- research/raw/m056-gate-stability.json
- scripts/gate-integrity.test.mjs
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
---

# T004 — Re-derive the census and stability recordings at this head

## Context

Two recordings count the tree: the census counts the suites and the diffs, and the stability record pins the range. Both go stale the moment a landing moves what they count, and M067 measured four of them drifting in a single milestone.

## Approach

Re-derive each at this head through the arm its own suite documents, default-run each afterwards, and leave both byte-identical on a second armed pass. Capture last so the head does not move between the capture and the landing.

## Intent coverage

- SC4

## Acceptance criteria

1. Both recordings are re-derived at this head and their default runs report zero failures.
2. A second armed run of each writes nothing, and a default run writes nothing.
3. Every value that moved is named with what moved it, and no value moved that the tree does not explain.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m044-gate-shapes.json`
- `research/raw/m056-gate-stability.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/gate-stability-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/head-state.js — the only reader of a document head entry's state
export function headState(record, facts) {
  return { state, entry, present, writtenBy, reason, observed }
}
```

`state` is one of `current`, `stale`, `duplicate`, `cannot-tell`. `present` and `writtenBy` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs
```

## Log

- pending
- 2026-11-25: the census recording was re-derived by its own arm and moved one value the tree explains: `archiveReferences.filesExamined` 378 to 382 and `suitesExamined` 196 to 197, from the suite and record this milestone added. Default run 40 tests / 40 pass.
- 2026-11-25: the stability record was re-derived by its own arm at this head (6567 bytes, sha256 `74c40074…`) and its default run is 8/8.
- 2026-11-25: both were captured last, so the head did not move between the capture and the landing, and a default run of each writes nothing.
- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs` — each is read from this tree, ready.
