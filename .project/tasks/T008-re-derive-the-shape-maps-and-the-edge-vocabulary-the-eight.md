---
id: T008
title: Re-derive the shape maps and the edge vocabulary the eight edges moved
wave: 8
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-signals.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/teardown-leak.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/gate-integrity.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- research/raw/m057-record-shapes.json
- research/raw/m059-record-shapes.json
- scripts/tutor-signals-shapes.test.mjs
- research/raw/m055-record-shapes.json
---

# T008 — Re-derive the shape maps and the edge vocabulary the eight edges moved

## Context

M068 declares eight edges, so the edge vocabulary the shape maps count moves by eight (38 to 46) and the suite that pins it must move with the map it reads. The claims record also adds one more record and one more suite under the teardown-leak scan. Left alone, all four stay red.

## Approach

Re-derive each map through its own arm, move the vocabulary pin in the reader that holds it by the eight rows the intent declares rather than by whatever the capture produces, and default-run each afterwards.

## Intent coverage

- SC4

## Acceptance criteria

1. Every shape map is re-derived at this head and every default run reports zero failures.
2. The edge vocabulary the reader pins moves by the eight rows M068 declares, and the pin names the intent table it counts.
3. The armed runs are idempotent and no default run writes.

## Files

Every path this task may touch, and nothing else:

- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-signals.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/teardown-leak.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `research/raw/m057-record-shapes.json`
- `research/raw/m059-record-shapes.json`
- `scripts/tutor-signals-shapes.test.mjs`
- `research/raw/m055-record-shapes.json`

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
node --test scripts/tutor-signals-shapes.test.mjs && node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/tutor-record-shapes.test.mjs
```

## Log

- pending
