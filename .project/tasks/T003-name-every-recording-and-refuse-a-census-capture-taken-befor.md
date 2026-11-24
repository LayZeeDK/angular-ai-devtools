---
id: T003
title: Name every recording and refuse a census capture taken before the Log
wave: 3
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/recordings.json
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
- research/raw/m044-gate-shapes.json
---

# T003 — Name every recording and refuse a census capture taken before the Log

## Context

Four recordings went stale in one milestone, and the sharpest case is defined rather than accidental: the gate-integrity census reads the milestone task own ## Log, so a capture taken before the Log is written cannot agree with the verify that follows.

## Approach

One manifest row per recording, naming its suite and its arm, so the knowledge has one owner instead of living in four agents heads. Then refuse an armed census capture when the Log it counts is empty, naming the recording it did not write.

## Intent coverage

- SC3

## Acceptance criteria

1. scripts/recordings.json names every recording the gate-integrity and stability captures write, with the suite and the arm for each.
2. An armed census capture whose milestone Log is empty exits with a refusal naming the recording it did not write, and writes nothing.
3. The default run of each named suite reports zero failures at this head.

## Files

Every path this task may touch, and nothing else:

- `scripts/recordings.json`
- `scripts/gate-integrity.test.mjs`
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
- `research/raw/m044-gate-shapes.json`

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
node --test scripts/gate-integrity.test.mjs && node -e "const r=require('./scripts/recordings.json');if(!Array.isArray(r)||!r.length)process.exit(1)"
```

## Log

- pending
- 2026-11-23: scripts/recordings.json now names the four recordings this programme's captures write — the gate-shapes census, the stability record, the verdict-claims record and the record-shapes census — with the suite and the arm for each, so the knowledge has one owner instead of living in four heads.
- 2026-11-23: the armed census capture refuses when every task it owns carries no Log, because that capture reads the Log it counts and a record written before the Log is born stale. Armed run 41 pass / 0 fail, default run 40 pass / 0 fail.
- Landed paths: `scripts/recordings.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs` — each is read from this tree, ready.
