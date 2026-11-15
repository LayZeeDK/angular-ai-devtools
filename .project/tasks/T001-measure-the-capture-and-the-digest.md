---
id: T001
title: Measure the capture and the digest
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m045-console-shapes.json
---

# T001 — Measure the capture and the digest

## Context

The join must be written against the shapes the extension actually produces. The roadmap's sentence reads as though every console method is captured; the code wraps `console.error` only, and the digest is `{version, entries}` with `{code, title, body}` per entry. Measure before writing the join.

## Approach

- Read `extension/agent-main.js`'s capture path and record the payload shape it hands to `captureErrorPayload`.
- Read `extension/error-digest.json` and record the entry shape and the code distribution.
- Write `research/raw/m045-console-shapes.json` with both shapes and the commands that produced them.

## Acceptance criteria

1. The record names the capture entry points and the exact payload shape, with file:line for each.
2. The record names the digest's entry fields and counts the codes, quoting the file.
3. The record states what is NOT captured, so no later task assumes a wider observable.
4. Every number in the record comes from a command whose output is in the same file.

## Interface contract

`extension/console-join.js` exports `consoleJoin(diagnostics, digest)` returning `{ state, findings[] }`, where `state` is `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried. The panel renders `state` and `findings` and nothing else, at route `console`, through the `console` key in `panel-demo.ts` `LOADERS`. The recordings are `research/raw/m045-console-shapes.json` (capture and digest shapes) and `research/raw/m045-console-panel.json` (per-case `{ state, findings[] }`).

## Intent coverage

- SC1

## Verify

```bash
node --check extension/agent-main.js && npx prettier --check research/raw/m045-console-shapes.json
```

## Log

- Task written at plan approval; not started.
