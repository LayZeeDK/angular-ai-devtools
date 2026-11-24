---
id: T001
title: Isolate the missing reason row so one assertion fails instead of nine
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
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

# T001 — Isolate the missing reason row so one assertion fails instead of nine

## Context

deriveSuiteDiff throws on a suite that differs from the measurement base with no SUITE_DIFF_REASONS row, and that throw kills derivedSections for every consumer: nine assertions reddened from one missing row, and the armed capture then refused to write because it will not write a record that would fail its own check.

## Approach

Collect the missing rows into the diff section instead of throwing, let the single assertion that owns the diff fail, and have that assertion print the paste-ready Object.assign block naming the suite, what it reads and what it refuses. No other assertion in the run is affected.

## Intent coverage

- SC3

## Acceptance criteria

1. A suite with no reason row reddens exactly one assertion, and that assertion prints the Object.assign block to paste, naming the suite.
2. The four sections that share derivedSections still derive and report when a row is missing; a planted missing row leaves their assertions green.
3. The M066 rows for the two suites this programme added still read as reasons, and no existing row is removed or reworded.

## Files

Every path this task may touch, and nothing else:

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
node --experimental-strip-types --test scripts/gate-integrity.test.mjs
```

## Log

- pending
