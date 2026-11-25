---
id: T001
title: Measure the panel values the token layer must re-express
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/token-baseline.test.mjs
- research/raw/m069-token-baseline.json
- scripts/recordings.json
- scripts/gate-integrity.test.mjs
---

# T001 — Measure the panel values the token layer must re-express

## Context

The panel renders through one global stylesheet written in literal values (M039), and `scripts/panel-styles.test.mjs` resolves those values through `window.getComputedStyle` while its mutant anchors match literal declarations. Before any token exists, this milestone needs the exact set of values the panel renders today, so the token layer can be proved to re-express them rather than retune them.

## Approach

One opt-in capture records, per selector and property, the computed value the stylesheet produces today, plus every property the style suite pins. The default run is read-only and fails when the record no longer matches what this head derives; only `M069_CAPTURE=1` writes, and the writer refuses a candidate that is not the fixed point of its own pin.

## Intent coverage

- SC3

## Acceptance criteria

1. The record names every selector and property the stylesheet declares a value for today, with the computed value the stylesheet produces.
2. The default run writes nothing and fails when the record differs from what this head derives; only `M069_CAPTURE=1` writes, and a second armed run moves no byte.
3. The recording is named in `scripts/recordings.json` with its suite and its arm, and the new suite carries its `SUITE_DIFF_REASONS` row in `scripts/gate-integrity.test.mjs`.

## Files

Every path this task may touch, and nothing else:

- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/token-baseline.test.mjs`
- `research/raw/m069-token-baseline.json`
- `scripts/recordings.json`
- `scripts/gate-integrity.test.mjs`

## Interface contract

Byte-identical across the tasks that share it:

```css
/* apps/angular-ai-devtools/src/styles.css — one token block, before every rule */
:root {
  --ds-density-*: ...;
  --ds-color-*: ...;
  --ds-type-*: ...;
  --ds-motion-*: ...;
}
```

Every rule that renders a panel value reads a token; the token block precedes the rules that read it.

## Verify

```bash
node --test scripts/token-baseline.test.mjs
```

## Log

- pending
