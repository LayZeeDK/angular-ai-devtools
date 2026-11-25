---
id: T007
title: Re-derive the recordings and run the project verify
wave: 7
status: done
deps: []
agent: build_T007
base: b43f97b7d136d94ecf506bb96c554ebd1ffecabd
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
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- research/raw/m064-verdict-claims.json
- scripts/panel-routes.test.mjs
- scripts/m067-verdict-claims.test.mjs
- research/raw/m067-verdict-claims.json
- research/raw/m057-record-shapes.json
- scripts/tutor-signals-shapes.test.mjs
---

# T007 — Re-derive the recordings and run the project verify

## Context

A recording that counts the tree is stale the moment the final landing moves it, so the last task re-derives both and runs the project verify, which is the only run that can prove the milestone did not break the build it measures.

## Approach

Re-derive each recording at the final head through its manifest row, then run the project verify command and record its exit and its counts in this task's Log.

## Intent coverage

- SC4

## Acceptance criteria

1. Both recordings are re-derived at the final head and their default runs report zero failures.
2. The project verify runs and its exit code and counts are recorded in this task's Log, with the command that produced them.
3. No recording is written by a default run, and the armed runs leave their files byte-identical on a second pass.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m044-gate-shapes.json`
- `research/raw/m056-gate-stability.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/gate-stability-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `research/raw/m067-verdict-claims.json`
- `research/raw/m057-record-shapes.json`
- `scripts/tutor-signals-shapes.test.mjs`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/field-binder.js — the only reader of a field's hosted control
export function fieldBinder(record, facts) {
  return { state, field, hosted, expected, reason, observed }
}
```

`state` is one of `bound`, `mismatch`, `no-host`, `cannot-tell`. `hosted` and `expected` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
M044_CAPTURE=1 node --experimental-strip-types --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && npm run check && npm test
```

## Log

- pending
- 2026-11-23: the census record was re-derived after the coverage repair: the plan now resolves SC1/SC2 to T005 suite \scripts/field-binder.test.mjs\ and SC3 to T004 suite \scripts/field-binder-record.test.mjs\, so the suite table and the last citation of each criterion moved from the gate suite to the suite the plan actually assigns. Armed run wrote once, second armed run moved no byte, default run 13/13.
- 2026-11-23: \m044-gate-shapes\ and \m056-gate-stability\ re-derived and byte-identical to HEAD (\8a796023…\, 8dc35e1…\); both default runs green.
- 2026-11-23: \m057-record-shapes\ carries an edge vocabulary that grew by one record: edge 30 to 38, category/detail/disposition/suite 24 to 32, and the conclusion now names four records including m067. Its pin \scripts/tutor-signals-shapes.test.mjs\ went 21/21.
- 2026-11-23: one failure was a stale build, not a budget overrun: \xtension/panel/index.html\ predated \pp.routes.ts\, so the bundle pin refused it. Rebuilding the panel brought it to 5/5 — the build is part of the project verify for exactly this reason.
- 2026-11-23: project verify run and recorded: pm run check\ exit 0; pm test\ exit 0 with 2290 + 60 + 320 tests, 0 failures.
- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `research/raw/m064-verdict-claims.json`, `scripts/panel-routes.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `research/raw/m067-verdict-claims.json`, `research/raw/m057-record-shapes.json`, `scripts/tutor-signals-shapes.test.mjs` — each is read from this tree, ready.
