---
id: T004
title: Re-derive the recordings, then run the project verify
wave: 4
status: done
deps: [T003]
agent: build_T004
base: 2bd5e63da0a423a59ce73934799781a9d7e5d4cb
worktree: null
task_branch: null
files:
- research/raw/m044-gate-shapes.json
- research/raw/m059-record-shapes.json
- research/raw/m056-gate-stability.json
- scripts/gate-integrity.test.mjs
- scripts/gate-stability-record.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/teardown-leak.test.mjs
- research/raw/m065-verdict-claims.json
- scripts/guard-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- extension/title-input.js
- extension/panel/index.html
---

# T004 — Re-derive the recordings, then run the project verify

## Context

Two recordings derive their range from HEAD, so any commit after a capture makes them stale
(`research/raw/m044-gate-shapes.json`, `research/raw/m059-record-shapes.json`). M064 paid for this: the re-derivation
has to be the last commit before a landing, not the first.

The project verify runs `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run
check && npm test`; it is the milestone's own gate and it is run here rather than trusted from an earlier task.

## Approach

Re-derive the two recordings with their own capture commands, then run the project verify until it reaches
its last stage. Nothing else is edited: if the verify fails, the failure is reported rather than papered over.

## Interface contract

None

## Files

Every path this task may touch, and nothing else:

- research/raw/m044-gate-shapes.json
- research/raw/m059-record-shapes.json
- research/raw/m056-gate-stability.json
- scripts/gate-integrity.test.mjs
- scripts/gate-stability-record.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/teardown-leak.test.mjs
- research/raw/m065-verdict-claims.json
- scripts/guard-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- extension/title-input.js
- extension/panel/index.html

## Acceptance criteria

1. `M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs` and
   `M059_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs` rewrite their recordings at this head, and a
   default run of each suite passes against the committed bytes.
2. The project verify passes at this head, and a second run reads the recorded verdict rather than measuring twice.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M059_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test
```

## Intent coverage

- SC2, SC3, SC4

## Log

- scaffolded
- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m059-record-shapes.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/teardown-leak.test.mjs`, `research/raw/m065-verdict-claims.json`, `scripts/guard-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `research/raw/m056-gate-stability.json` — each is read from this tree, ready.

- **Ship-gate blocker, measured:** plan-lint refuses this task with [verify-weight] T004: 5 authored artefacts (4 recording(s) under research/raw, 0 suite(s), the task's own Log) exceed the ceiling of 4. The fourth recording is 
esearch/raw/m056-gate-stability.json, which this task's capture rewrote and therefore declared. The contract cannot both match its landing commit and satisfy the ceiling: the repair is a plan patch that moves one recording's ownership to another task and re-lands this one, which is the shape M064's T008 took. Recorded here rather than resolved by trimming a path after the landing.
