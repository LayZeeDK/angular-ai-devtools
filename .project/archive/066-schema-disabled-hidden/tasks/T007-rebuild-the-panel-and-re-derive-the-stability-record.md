---
id: T007
title: Rebuild the panel and re-derive the stability record
wave: 7
status: done
deps: []
agent: build_T007
base: a90f15748f0135a10b359197f79ffcd3a871461a
worktree: null
task_branch: null
files:
- extension/panel/index.html
- research/raw/m056-gate-stability.json
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity.test.mjs
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
---

# T007 — Rebuild the panel and re-derive the stability record

## Context

`scripts/panel-bundle-budget.test.mjs` refuses a panel build older than the newest source file it reads, and
`extension/panel/index.html` was written before `panel-schema.ts` existed. The stability record then disagrees with the tree,
because it counts sections and mentions this head derives.

## Approach

Rebuild the extension so the measured output is one this milestone produced, then re-derive the stability record with its own
capture command and confirm a second armed run leaves it byte-identical.

## Intent coverage

- SC4

## Acceptance criteria

1. `node --test scripts/panel-bundle-budget.test.mjs` reports zero failures, with the panel build newer than every source file the suite reads.
2. `node --test scripts/gate-stability-record.test.mjs` reports zero failures unarmed after `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs` writes the record, and a second armed run leaves it byte-identical.

## Files

Every path this task may touch, and nothing else:

- `extension/panel/index.html`
- `research/raw/m056-gate-stability.json`
- \scripts/gate-stability-record.test.mjs\n
- \scripts/gate-integrity.test.mjs\n
- \scripts/gate-integrity-default-tasks.test.mjs\n
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
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
// extension/schema-attribution.js — the only reader of a schema attribution
export function schemaAttribution(record, facts) {
  return { state, field, node, input, reason, observed }
}
```

`state` is one of `declared`, `no-node`, `no-record`, `cannot-tell`. `node` and `input` are present only when the record
carries them; `reason` names why the attribution is absent.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension && node --test scripts/panel-bundle-budget.test.mjs scripts/gate-stability-record.test.mjs
```

## Log

- pending

- `npx nx run angular-ai-devtools:build-extension` rebuilt `extension/panel/index.html`, so the output the budget suite
  measures is one this milestone produced rather than a file older than `panel-schema.ts`. `node --test
  scripts/panel-bundle-budget.test.mjs` reports 5 pass, 0 fail.
- `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs` wrote the stability record at this head and the run
  reports 9 pass, 0 fail; the record is read by every default run and written only by that capture.
- Landed paths: `extension/panel/index.html`, `research/raw/m056-gate-stability.json`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs` — each is read from this tree, ready.
