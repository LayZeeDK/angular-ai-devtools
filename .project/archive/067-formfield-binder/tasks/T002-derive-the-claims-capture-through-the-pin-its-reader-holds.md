---
id: T002
title: Derive the claims capture through the pin its reader holds
wave: 2
status: done
deps: []
agent: build_T002
base: de96a2b768b777fd8033772c56d49b47c429796e
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
- 2026-11-23: measured at this base: captureClaims wrote tRecordedDocumentLocations(derived()) while the default pin holds tRecordedDocumentLocations(derived(), recorded), so after a rebind an armed re-capture emitted bytes its own pin refused, silently.
- 2026-11-23: the writer now reads through the same anchor and refuses to write unless the candidate is the fixed point of the pin; the refusal names the pin and writes nothing. Default run 14 pass / 0 fail, armed run 15 pass / 0 fail.
- Landed paths: `scripts/chunk-failure-claims.test.mjs`, `research/raw/m064-verdict-claims.json`, `scripts/gate-integrity.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/panel-routes.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs` — each is read from this tree, ready.
