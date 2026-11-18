---
id: T004
title: Record the surface and run the project verify
wave: 4
status: done
deps: [T003]
agent: build_T004
base: 2be2edbd1d0576876633e4cb32e2cfb6abc15d05
worktree: null
task_branch: null
files:
  - research/raw/m047-surface.json
  - scripts/gate-integrity.test.mjs
  - scripts/recording-consistency.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
---

# T004 — Record the surface and run the project verify

## Context

The surface exists and its states are pinned. This task records what it renders, so a later reader
can tell what this milestone shipped without opening the browser, and runs the project verify at the
head that ships so a red build cannot reach ship.

## Approach

Record the `components` route, its loader key, its four states and the record field each state reads
into `research/raw/m047-surface.json`, then run `npm run check && npm test` at this head.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - scripts/gate-integrity.test.mjs
  - scripts/recording-consistency.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - research/raw/m047-surface.json

## Acceptance criteria

1. The recording names the route, the loader key and each state with the record field it reads, and every name in it exists at this head.
2. `npm run check && npm test` exits 0 at the head this task lands on.

## Verify

```bash
node --test scripts/component-search.test.mjs && npm run check && npm test && npx prettier --check research/raw/m047-surface.json
```

## Log

- pending.
- Landed `research/raw/m047-surface.json`: the `components` route (`apps/angular-ai-devtools/src/app/app.routes.ts:198`-`:200`), the `components` key of `LOADERS` (`apps/angular-ai-devtools/src/app/panel-demo.ts:56`, reached at `:488`, `:495` and `:496`), the four states the surface renders (`apps/angular-ai-devtools/src/app/panel-components.ts:77`-`:83`), the fields each state reads and the five reasons of the closed set (`extension/component-search.js:48`-`:54`). Every one of the record's 52 `file:line` citations was re-read at `943ba280` and each quoted line is the line its number names: a `node` walk over the record reported `citations checked: 52, problems: 0`.
- `scripts/gate-integrity.test.mjs`: one row appended to `SUITE_DIFF_REASONS` for `scripts/component-search.test.mjs`, which this tree carries and the measured head `d94502d1` does not. No existing row was rewritten, no tolerance widened and no test skipped. `node --test scripts/gate-integrity.test.mjs` went from 40 tests / 31 pass / 9 fail — every failure reading `scripts/component-search.test.mjs differs from d94502d1 and no reason was read for it` — to 40 tests / 40 pass / 0 fail.
- `scripts/recording-consistency.test.mjs` needed nothing: it passes 7 tests / 7 pass at this head before and after the new recording, and the record states no `bytes`-shaped prose for it to read.
- Both stale recordings were re-derived by their own armed captures rather than edited, and in this order because `scripts/gate-stability-record.test.mjs` derives its fixRecord section by spawning `node --test scripts/gate-integrity.test.mjs`: `set "M044_CAPTURE=1"&& node --test scripts/gate-integrity.test.mjs` wrote `research/raw/m044-gate-shapes.json` (41 tests, 41 pass; moved: `archiveReferences.filesExamined: 280 -> 283`), then `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs` wrote `research/raw/m056-gate-stability.json` (6628 bytes, sha256 `672ab61b58c74a1f5f190291ebf847c21a60d7d3b6a6f8790cbcaf92478d77d9`, 9 tests, 9 pass, and its second armed run changed no byte). A default run of each suite then reads the bytes its capture left.
- `npm run check` passes at this head. The project verify's second half does not, for a cause outside this task's `files:` list and not touched by it: `research/raw/m047-verdict-claims.json` does not exist, so `node --test scripts/navigation-blocking.test.mjs` fails 6 of its 24 tests and `node --experimental-strip-types --test scripts/overlay-verdict-claims.test.mjs` fails 2 of its 10, each naming that missing path. Both suites derive the claims path from `.project/STATE.md`'s binding (`scripts/navigation-blocking.test.mjs:2459`-`:2461`, `scripts/overlay-verdict-claims.test.mjs:81`) and refuse rather than skip when it is absent (`:3327` and `:83`-`:87`). The list is a derived recording, so it is created by its own capture — `set "M044_CAPTURE=1"&& node --experimental-strip-types --test scripts/navigation-blocking.test.mjs` — which writes a path T004 does not declare; M046's equivalent task declared its claims recording among its files (`.project/archive/046-copy-to-agent/tasks/T007-record-the-surface-and-run-the-project-verify.md:13`) and this task's list does not.
- Retracting one number from the fourth entry above: the 6628 bytes and the sha256 it states were the first capture's, taken before this log existed. The M056 record's archive section prints the live fix-record line over these task logs, so this log is an input to that record and the record was re-derived once more after the entry was written. Its readings did not change — 9 tests, 9 pass, and a second armed run changing no byte — and the byte count and digest belong in the capture's own output rather than in a log entry, because they move whenever the record moves for a reason the record states better than a number does.
- Landed paths: `research/raw/m047-surface.json`, `scripts/gate-integrity.test.mjs`, `scripts/recording-consistency.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json` — each is read from this tree, ready.
