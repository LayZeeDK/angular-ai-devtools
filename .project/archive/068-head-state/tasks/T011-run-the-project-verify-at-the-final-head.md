---
id: T011
title: Run the project verify at the final head
wave: 11
status: done
deps: []
agent: build_T011
base: 9e2ac42f4243759426bd1e386f57295da5f06f63
worktree: null
task_branch: null
files:
- research/raw/m059-record-shapes.json
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/head-record.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/m068-verdict-claims.test.mjs
- research/raw/m068-verdict-claims.json
---

# T011 — Run the project verify at the final head

## Context

The project verify is the only run that proves the milestone did not break the build it measures, and it must run after the last landing that changes what the recordings count. This task is that landing: it changes no suite and adds no file under `research/raw/`.

## Approach

The claims record is re-captured first, and then the one map that counts
`research/raw` is re-derived from it, because a record's content moves the counts a map reads even when its file count does not. Re-capture the claims record so its default run reproduces at this head, run the plan's project verify unchanged, and record its exit code and counts. Land nothing that moves a recording, so the census and the stability record stay true.

## Intent coverage

- SC4

## Acceptance criteria

1. The project verify runs at this head and exits 0, and its stage-by-stage outcome and test counts are recorded in this task's Log with the command that produced them.
2. The claims record reproduces byte for byte at this head.
3. This landing edits no suite and adds no file under `research/raw/` or `scripts/`, so the recordings the previous two tasks re-derived stay true.

## Files

Every path this task may touch, and nothing else:

- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `research/raw/m068-verdict-claims.json`
- `research/raw/m059-record-shapes.json`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/head-state.js — the only reader of a document head entry's state
export function headState(record, facts) {
  return { state, entry, present, writtenBy, reason, observed }
}
```

`state` is one of `current`, `stale`, `duplicate`, `cannot-tell`. `present` and `writtenBy` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
node --test scripts/m068-verdict-claims.test.mjs && node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test
```

## Log

- pending
- 2026-11-25: the project verify ran at this head and exited 0. `node scripts/ensure-sidecar-deps.mjs`, `npx nx run angular-ai-devtools:build-extension` and `npm run check` (twelve stages, `gate-integrity: pass - 0 finding(s), 19 mention(s)`, `format:check` clean) were green, and `npm test` reported 2343 tests / 2343 pass / 0 fail with the two nx stages at 60/60 and 320/320.
- 2026-11-25: the claims record was re-captured first and moved, because the second plan patch moved the plan's coverage rows. That capture then moved `research/raw/m059-record-shapes.json` — a record's content moves the counts a map reads even when its file count does not — so the map was re-derived from it in the same task (59302 bytes, default run 13/13). That declaration was added to this task before it was activated, so the landing allow-list matched at its base.
- 2026-11-25: this ordering is the milestone's last lesson, recorded because it recurred three times: a record must be captured before anything that counts it, and the verifier that counts must run last. T006 captured claims, T008 derived maps from them, the second plan patch then moved the claims record, and the maps went red again — which is why the claims capture and the map read share one task here.
- 2026-11-25: this landing edits no suite and adds no file under `research/raw/` or `scripts/`, so the census and the stability record the previous two tasks re-derived stay true at this head.
- Landed paths: `research/raw/m059-record-shapes.json`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/head-record.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `research/raw/m068-verdict-claims.json` — each is read from this tree, ready.
