---
id: T009
title: Run the project verify at the final head
wave: 9
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/m068-verdict-claims.test.mjs
- research/raw/m068-verdict-claims.json
---

# T009 — Run the project verify at the final head

## Context

The project verify is the only run that proves the milestone did not break the build it measures, and it must run after the last landing that adds a file. Every earlier attempt was red on recordings the milestone itself moved; this task lands nothing that moves one.

## Approach

Re-capture the claims record so it names the head it is verified at, run the plan's project verify command unchanged, and record its exit code and counts. Land nothing that adds a file, so the recordings T007 and T008 re-derived stay true.

## Intent coverage

- SC4

## Acceptance criteria

1. The project verify runs at this head and exits 0, and its stage-by-stage outcome and test counts are recorded in this task's Log with the command that produced them.
2. The claims record names the head it was verified at and its default run reproduces it byte for byte.
3. This landing adds no file under `research/raw/` or `scripts/`, so the recordings the previous two tasks re-derived stay true.

## Files

Every path this task may touch, and nothing else:

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
