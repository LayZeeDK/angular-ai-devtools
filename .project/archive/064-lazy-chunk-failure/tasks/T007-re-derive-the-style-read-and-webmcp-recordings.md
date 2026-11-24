---
id: T007
title: Re-derive the style-read and webmcp recordings
wave: 7
status: done
deps: [T006]
agent: build_T007
base: 1b330d51e0492258b9fc44f56f19db9a8842dc40
worktree: null
task_branch: null
files:
  - scripts/visual-qa-style-read.test.mjs
  - scripts/webmcp-api.test.mjs
  - research/raw/m054-style-read.json
  - research/raw/m052-webmcp-api.json
  - scripts/gate-integrity.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/visual-qa-style.test.mjs
  - scripts/webmcp-audit.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/guard-verdict-claims.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/guard-record-shapes.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - research/raw/m064-verdict-claims.json
  - scripts/chunk-failure-claims.test.mjs
---

# T007 — Re-derive the style-read and webmcp recordings

## Goal

Correct the two recordings that quote `extension/manifest.json`, which task one of this milestone changed.

## Context

Six suites census `research/raw/`, so six recordings can move and each is declared in the task that re-derives it. Declaring only the records a task pins is what cost M063 three dispatch rounds.

## Approach

Run each suite, re-derive what its record pins from the tree the suite derives, and correct a field only where the tree moved it. Never widen a pin to make a suite pass.

## Interface contract

Each record is that suite's own canonical serialisation of what the tree measures, written by its own armed writer where one exists and corrected field by field where it does not.

## Acceptance criteria

1. SC1: both suites are green and every citation in both records resolves at this head.
2. SC1: neither record is widened to make a suite pass.

## Intent coverage

- SC1

## Verify

```bash
node --test scripts/visual-qa-style-read.test.mjs scripts/webmcp-api.test.mjs
```

## Log

- pending.
- The task assumed both records would move. They did not: xtension/manifest.json is unchanged since 958d15f8, so all 187 citations across m054 and m052 already sit on the same lines as at the M063 ship commit. Nothing in either record or either suite was rewritten, which is the correct outcome for a re-derivation task and the opposite of a blanket re-capture.
- scripts/tutor-answer.test.mjs needed the fix instead: its self-held list is an exact set, and T004 made a third verdict-claims record self-held. One path and one sentence moved; the assertion is still an exact three-element set rather than a count or a floor.
- Both default runs were shown to be reads by hashing the record between two consecutive runs.
- The sixteen remaining reds in the two claims suites were reproduced with this task's patch reverted, so they are not this task's: they belong to the gate re-capture T008 owns.

- Landed paths: `scripts/visual-qa-style-read.test.mjs`, `scripts/webmcp-api.test.mjs`, `research/raw/m054-style-read.json`, `research/raw/m052-webmcp-api.json`, `scripts/gate-integrity.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/visual-qa-style.test.mjs`, `scripts/webmcp-audit.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `research/raw/m064-verdict-claims.json`, `scripts/chunk-failure-claims.test.mjs` — each is read from this tree, ready.
