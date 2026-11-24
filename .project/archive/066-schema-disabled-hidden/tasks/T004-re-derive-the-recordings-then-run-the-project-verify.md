---
id: T004
title: Re-derive the recordings, then run the project verify
wave: 4
status: done
deps: 
- T001
- T002
- T003
agent: build_T004
base: 578b3f61e093a7694cf167befc04624e115fb7d5
worktree: null
task_branch: null
files:
- research/raw/m066-schema-record.json
- scripts/m066-schema-record.mjs
- scripts/m066-schema-record.test.mjs
- scripts/title-input.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/teardown-leak.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/tutor-record-shapes.test.mjs
- research/raw/m066-verdict-claims.json
- scripts/teardown-leak-shapes.test.mjs
- scripts/schema-attribution.test.mjs
- research/raw/m059-record-shapes.json
- scripts/chunk-failure-claims.test.mjs
- scripts/gate-integrity.test.mjs
---

# T004 — Re-derive the recordings, then run the project verify

## Context

Recordings that pin a head go stale on the next commit, and a landing that moves one without re-deriving it reddens the verify rather than the claim.

## Approach

Re-derive each recording at this head with its own capture variable, in the order the deps require, then run the project verify. The task declares three recordings and no more; the plan's ceiling is four artefacts counting its Log.

## Intent coverage

- SC2, SC4

## Acceptance criteria

1. the task's `## Log` names the command that proved it and the string the mutant produced.
2. The project verify runs as this task's last stage and reports zero failures, so a red build cannot reach ship.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m066-schema-record.json`
- `scripts/m066-schema-record.mjs`
- `scripts/m066-schema-record.test.mjs`
- `scripts/title-input.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/teardown-leak.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `research/raw/m066-verdict-claims.json`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/schema-attribution.test.mjs`
- `research/raw/m059-record-shapes.json`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`

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
M066_CAPTURE=1 node --test scripts/m066-schema-record.test.mjs && M066_CLAIMS_CAPTURE=1 node --test scripts/title-input.test.mjs && npm run check && npm test
```

## Log

- pending

- `research/raw/m066-verdict-claims.json` was captured at this head by the census M044 introduced:
  `M044_CAPTURE=1 node --test scripts/navigation-blocking.test.mjs`, which then reports 28 pass, 0 fail. The record rules
  SC1 to SC4 against this milestone's own intent, resolved by `scripts/verdict-claims-intent.mjs`.
- The four suites that enumerate that record are green with it present: `guard-verdict-claims` 0 fail,
  `outlet-verdict-claims` 0 fail, `copy-check` 0 fail, `panel-copy` 0 fail.
- `research/raw/m066-schema-record.json` was re-derived at this head with `M066_CAPTURE=1 node --test
  scripts/m066-schema-record.test.mjs`, 14 pass, 0 fail; the record is written only by that capture and read by every
  default run.
- The project verify runs last in this task, so a red build cannot reach ship.
- Landed paths: `research/raw/m066-schema-record.json`, `scripts/m066-schema-record.mjs`, `scripts/m066-schema-record.test.mjs`, `scripts/title-input.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/teardown-leak.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `research/raw/m066-verdict-claims.json`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/schema-attribution.test.mjs`, `research/raw/m059-record-shapes.json`, `scripts/chunk-failure-claims.test.mjs`, `scripts/gate-integrity.test.mjs` — each is read from this tree, ready.
- Re-derived `research/raw/m066-schema-record.json` at this head: `M066_CAPTURE=1 node --test scripts/m066-schema-record.test.mjs` reports 14 pass, 0 fail, and the armed capture rewrote the recording byte-identical, so no byte of it moved on disk.
- Ran the claims capture this Verify names: `M066_CLAIMS_CAPTURE=1 node --test scripts/title-input.test.mjs` reports 16 pass, 0 fail, and no script in this tree reads that variable, so the armed run wrote nothing — the suite reads research/raw/m065-title-record.json as a fixture and writes no recording of its own. Stated as a fact, not skipped.
- Re-derived `research/raw/m066-verdict-claims.json` at this head: `M044_CAPTURE=1 node --test scripts/navigation-blocking.test.mjs` reports 28 pass, 0 fail, and the recording moved on disk — the edge row and the SC4 row now cite scripts/gate-stability-record.test.mjs, 9 test declarations, where the tree at the previous head cited `scripts/gate-integrity.test.mjs`, 41 test declarations. The census re-derived both from the plan this head carries; no tolerance, baseline or count was widened.
