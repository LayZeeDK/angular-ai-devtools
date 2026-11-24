---
id: T002
title: Derive the claims capture through the pin its reader holds
wave: 2
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/chunk-failure-claims.test.mjs
- research/raw/m064-verdict-claims.json
- scripts/gate-integrity.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/panel-routes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
---

# T002 — Derive the claims capture through the pin its reader holds

## Context

captureClaims wrote atRecordedDocumentLocations(derived()) with one argument while the default pin holds atRecordedDocumentLocations(derived(), recorded). M065 added the rebasing to the reader and never to the writer, so every armed re-capture after a rebind wrote bytes its own default pin refused, silently.

## Approach

Pass the recorded document into the writer so both call sites derive the same shape, then refuse inside the armed block when the candidate fails the default pin, rather than writing it. The refusal names the pin and says the capture must derive through it.

## Intent coverage

- SC3

## Acceptance criteria

1. An armed run writes exactly the bytes the default pin holds, and a second armed run leaves the record byte-identical.
2. A candidate that would fail the default pin is refused rather than written, and the refusal names the pin.
3. The default run reports zero failures and no assertion is weakened or retuned.

## Files

Every path this task may touch, and nothing else:

- `scripts/chunk-failure-claims.test.mjs`
- `research/raw/m064-verdict-claims.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/panel-routes.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`

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
M064_CAPTURE=1 node --test scripts/chunk-failure-claims.test.mjs && node --test scripts/chunk-failure-claims.test.mjs
```

## Log

- pending
