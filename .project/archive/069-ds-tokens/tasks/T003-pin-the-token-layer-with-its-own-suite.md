---
id: T003
title: Pin the token layer with its own suite
wave: 3
status: done
deps: []
agent: build_T003
base: 79499c6b4bd0f4085d31b81baf267b907cc533f2
worktree: null
task_branch: null
files:
- scripts/token-baseline.test.mjs
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
- scripts/ds-tokens.test.mjs
- scripts/gate-integrity.test.mjs
---

# T003 — Pin the token layer with its own suite

## Context

A token layer with no suite of its own is a convention, not a contract: the values could drift back into literals, a token could be declared twice, or a second stylesheet could appear and nothing would notice.

## Approach

One read-only suite reading the stylesheet as text: every token the rules read is declared exactly once, the block precedes its readers, no colour, spacing, type or duration literal is declared outside the block, and the block is the only one holding tokens.

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. A literal declared outside the token block reddens naming the selector, the property and the line; a literal inside a comment or inside the block does not.
2. A token declared twice under one name reddens naming both, while two names for one value are not a duplicate.
3. The token block precedes every rule that reads it, and a mutant that moves a rule above the block reddens naming the rule; the suite carries its `SUITE_DIFF_REASONS` row in the same task.

## Files

Every path this task may touch, and nothing else:

- `scripts/token-baseline.test.mjs`
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
- `scripts/ds-tokens.test.mjs`
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
node --test scripts/ds-tokens.test.mjs
```

## Log

- pending
- 2026-11-25: `scripts/ds-tokens.test.mjs` pins the token layer as text, where `token-baseline` pins what the sheet renders: 57 tokens in one block, 63 of 66 declarations reading one, 54 distinct tokens read, 3 unread, 21 of 24 rules reading a token. Verify 21/21.
- 2026-11-25: two exemption lists, each non-vacuous in both directions. Three literals stay literal because each is the anchor of a `panel-styles` mutant — M5's state colour, M7's dark body background, M8's font family — and each exemption must match exactly one declaration, carry its anchor in that suite, and name its mutant. A fourth literal reddens naming selector, property, family and line; an exemption that stops matching reddens as stale; an unused exemption reddens, so the list cannot quietly grow. Three motion restatements are exempt from the duplicate rule for the same reason.
- 2026-11-25: eleven assertions, nine mutants, each planted on an in-memory copy of the untouched sheet and each pinned green first. Two negative results are recorded rather than hidden: giving two tokens one value correctly reddens nothing (it is not a duplicate), and a literal inside a comment correctly reddens nothing while the comment reading names it.
- 2026-11-25: `npm run check` exit 0, and the census re-read with this suite's row in place reports `+1537/-0, assertions +90/-0 (0 re-cut, 0 dropped)`.
- 2026-11-25: `research/raw/m044-gate-shapes.json` is red at this base and was red before this task: the record states `suiteDiff.examined: 229` where the tree derives 231 after T001's, T002's and this suite. It is not in this contract and is re-derived by T004.
- Landed paths: `scripts/token-baseline.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/head-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/ds-tokens.test.mjs`, `scripts/gate-integrity.test.mjs` — each is read from this tree, ready.
