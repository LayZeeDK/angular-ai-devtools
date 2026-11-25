---
id: T009
title: Re-derive the census after the last suite edit
wave: 9
status: done
deps: []
agent: build_T009
base: fa3f28071c22c5b3568664a334dce726437be452
worktree: null
task_branch: null
files:
- scripts/tutor-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- research/raw/m044-gate-shapes.json
- scripts/gate-integrity.test.mjs
- scripts/gate-stability-record.test.mjs
- research/raw/m068-verdict-claims.json
---
# T009 — Re-derive the census after the last suite edit

## Context

The census counts the diff of every suite against a pinned commit, so any landing that edits a pinned suite moves it. T007 re-derived it and T008 then edited `scripts/tutor-signals-shapes.test.mjs`, which moved `suiteDiff.differing[67].addedLines` from 576 to 816 and turned four tests red at the project verify. The census therefore has to be captured after the last suite edit in the milestone, not before it.

## Approach

Re-derive the census through its own arm at this head, then default-run it and the suite that reads it. Nothing in this task edits a suite, so the capture holds until the landing.

## Intent coverage

- SC4

## Acceptance criteria

1. The census is re-derived at this head and its default run reports zero failures.
2. Every value that moved is named with what moved it: the suite T008 edited, and the rows it moved.
3. A second armed run writes nothing, and a default run writes nothing.

## Files

Every path this task may touch, and nothing else:

- `scripts/tutor-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `research/raw/m044-gate-shapes.json`
- `scripts/gate-integrity.test.mjs`
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
node --experimental-strip-types --test scripts/gate-integrity.test.mjs
```

## Log

- pending
- 2026-11-25: the census was re-derived by its own arm at this head and moved what T008's edit moved: `archiveReferences.examined` 237 to 238, plus the `suiteDiff` rows for `scripts/tutor-signals-shapes.test.mjs` whose `addedLines` went 576 to 816. Default run 40/40.
- 2026-11-25: this task was re-cut by the second plan patch. It was "run the project verify at the final head" and the verify was red on four census tests, because T008 edited a pinned suite after T007 captured the census. The census now runs after the last suite edit, the stability record after the census, and the project verify in T011.
- 2026-11-25: a second armed run writes nothing and a default run writes nothing.
- Landed paths: `scripts/tutor-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `scripts/head-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `research/raw/m044-gate-shapes.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs`, `research/raw/m068-verdict-claims.json` — each is read from this tree, ready.
