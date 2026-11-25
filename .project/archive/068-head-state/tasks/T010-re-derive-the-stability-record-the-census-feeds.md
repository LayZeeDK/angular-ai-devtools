---
id: T010
title: Re-derive the stability record the census feeds
wave: 10
status: done
deps: []
agent: build_T010
base: dac849b35918d30e6a5d480f67dc962605e47200
worktree: null
task_branch: null
files:
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/gate-integrity.test.mjs
- research/raw/m056-gate-stability.json
- scripts/gate-stability-record.test.mjs
---

# T010 — Re-derive the stability record the census feeds

## Context

The stability record pins the exit code each gate suite returns, so it can only be captured after the census it reads is green. Every earlier attempt recorded a red census and had to be re-derived.

## Approach

Re-derive through its own arm at this head, default-run it, and confirm the five sections describe the gates as they now run.

## Intent coverage

- SC4

## Acceptance criteria

1. The stability record is re-derived at this head and its default run reports zero failures.
2. The `fixRecord` section records a green suite, and any value that moved names the census that moved it.
3. A second armed run writes nothing, and a default run writes nothing.

## Files

Every path this task may touch, and nothing else:

- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `research/raw/m056-gate-stability.json`
- `scripts/gate-stability-record.test.mjs`

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
node --test scripts/gate-stability-record.test.mjs
```

## Log

- pending
- 2026-11-25: the stability record was re-derived by its own arm at this head (6568 bytes, sha256 `951cfe2f…`) after the census it reads was green, and its default run is 8/8. The `fixRecord` section now records a suite that exits as it runs, not the red census T008 left behind.
- 2026-11-25: a second armed run writes nothing and a default run writes nothing.
- Landed paths: `scripts/teardown-leak-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/head-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/gate-integrity.test.mjs`, `research/raw/m056-gate-stability.json`, `scripts/gate-stability-record.test.mjs` — each is read from this tree, ready.
