---
id: T011
title: Run the project verify at the final head
wave: 11
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/head-record.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/m068-verdict-claims.test.mjs
- research/raw/m068-verdict-claims.json
---

# T011 — Run the project verify at the final head

## Context

The project verify is the only run that proves the milestone did not break the build it measures, and it must run after the last landing that changes what the recordings count. This task is that landing: it changes no suite and adds no file under `research/raw/`.

## Approach

Re-capture the claims record so its default run reproduces at this head, run the plan's project verify unchanged, and record its exit code and counts. Land nothing that moves a recording, so the census and the stability record stay true.

## Intent coverage

- SC4

## Acceptance criteria

1. The project verify runs at this head and exits 0, and its stage-by-stage outcome and test counts are recorded in this task's Log with the command that produced them.
2. The claims record reproduces byte for byte at this head.
3. This landing edits no suite and adds no file under `research/raw/` or `scripts/`, so the recordings the previous two tasks re-derived stay true.

## Files

Every path this task may touch, and nothing else:

- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `research/raw/m068-verdict-claims.json`

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
node --test scripts/m068-verdict-claims.test.mjs && node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test
```

## Log

- pending
