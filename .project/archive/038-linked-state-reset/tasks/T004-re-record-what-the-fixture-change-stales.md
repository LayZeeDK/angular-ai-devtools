---
id: T004
title: Re-record what the fixture change stales and run the gate
wave: 4
status: done
deps:
  - T003
agent: paid-deepseek-v4.1-flash-high
base: 74791b978b014f09e125aa0255f710f57d8f22e3
worktree: null
task_branch: null
files:
  - .proven.json
  - research/raw/m022-ng-context.json
  - research/raw/companion-dev-build.json
  - research/raw/m038-verdict-claims.json
  - scripts/fixture-proof-fresh.test.mjs
  - scripts/ng-context-dev-build.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - extension/page-footprint.test.mjs
  - scripts/facade-dev-build.test.mjs
  - scripts/recording-consistency.test.mjs
---

# T004 — Re-record what the fixture change stales and run the gate

## Context

The fixture gained a page and the app gained a surface, so both dev builds and both
closure manifests move. The verdict claims must quote every criterion in full.

## Approach

Re-measure each recording through its own suite rather than editing a number. Where
a value did not move, say so with evidence. Then run the project gate at this head.

## Interface contract

None

## Files

- `.proven.json`
- `research/raw/m022-ng-context.json`
- `research/raw/companion-dev-build.json`
- `research/raw/m038-verdict-claims.json`
- `scripts/fixture-proof-fresh.test.mjs`
- `scripts/ng-context-dev-build.test.mjs`
- `scripts/overlay-verdict-claims.test.mjs`

## Acceptance criteria

1. Every moved value is shown old to new with the command that re-measured it.
2. No tolerance is widened and no assertion relaxed.
3. Each criterion is quoted in full in the verdict claims, with the character count stated.
4. **held-out E6 is dismissed:** the project gate is not a held-out check, and this task runs `npm run check` and `npm test` at the head, recording both exit codes.
5. Any recording that did not move is named, with the evidence that it did not.

## Verify

```bash
node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npm run check && npm test
```

## Intent coverage

- SC6 — AC4

## Log

- dispatched
- `extension/page-footprint.test.mjs`
- `scripts/facade-dev-build.test.mjs`
- `scripts/recording-consistency.test.mjs`
- 2026-11-07 - ready - re-recorded five stale proof records and both build recordings through their own suites; check and test exit 0; no tolerance widened.
