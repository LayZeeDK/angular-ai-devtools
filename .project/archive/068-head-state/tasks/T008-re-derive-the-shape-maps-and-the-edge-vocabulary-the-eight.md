---
id: T008
title: Re-derive the shape maps and the edge vocabulary the eight edges moved
wave: 8
status: done
deps: []
agent: build_T008
base: fde9b1ebf0e692d2c2ba7fd3f9a1c7d4655199ea
worktree: null
task_branch: null
files:
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-signals.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/teardown-leak.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/gate-integrity.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- research/raw/m057-record-shapes.json
- research/raw/m059-record-shapes.json
- scripts/tutor-signals-shapes.test.mjs
- research/raw/m055-record-shapes.json
---

# T008 — Re-derive the shape maps and the edge vocabulary the eight edges moved

## Context

M068 declares eight edges, so the edge vocabulary the shape maps count moves by eight (38 to 46) and the suite that pins it must move with the map it reads. The claims record also adds one more record and one more suite under the teardown-leak scan. Left alone, all four stay red.

## Approach

Re-derive each map through its own arm, move the vocabulary pin in the reader that holds it by the eight rows the intent declares rather than by whatever the capture produces, and default-run each afterwards.

## Intent coverage

- SC4

## Acceptance criteria

1. Every shape map is re-derived at this head and every default run reports zero failures.
2. The edge vocabulary the reader pins moves by the eight rows M068 declares, and the pin names the intent table it counts.
3. The armed runs are idempotent and no default run writes.

## Files

Every path this task may touch, and nothing else:

- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-signals.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/teardown-leak.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `research/raw/m057-record-shapes.json`
- `research/raw/m059-record-shapes.json`
- `scripts/tutor-signals-shapes.test.mjs`
- `research/raw/m055-record-shapes.json`

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
node --test scripts/tutor-signals-shapes.test.mjs && node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/tutor-record-shapes.test.mjs
```

## Log

- pending
- 2026-11-25: the pin now derives its expected delta from the intent's own `## Edge coverage` table through `intentPathForMilestone`, so the live intent is read while M068 is bound and its archive after ship. It asserts the record's rows are exactly the intent's ids **and** that each of `edge/category/detail/disposition/suite` gained exactly that many against the union with the record removed, naming the intent table in every failure message.
- 2026-11-25: the intent and the capture agreed with nothing to reconcile: 8 rows, `E1` to `E8`, so `edge` 38 to 46 and each row field 32 to 40. A mutant proves the pin can fail — it reddens on a record that drops rows, on one that lands the same row twice, and on a union that moved one row short of the intent's count.
- 2026-11-25: three maps re-derived. `m057` (`edgeKeys` edge 38 to 46, each field 32 to 40, and its conclusion corrected from four carriers to the five it actually counts) 23/23; `m059` (`head` 3b997658 to 3fe51101, `recordsSearched` 168 to 169, `filesSearched` 167 to 168) 13/13; `m055` (head only) 19/19. A final armed run of each printed "nothing moved, nothing written".
- 2026-11-25: `m057` has no armed capture in any suite — its reader states it writes nothing, no suite defines an arm for it, and `scripts/recordings.json` does not list it. Its vocabulary was therefore re-derived by the suite's own union walk, run independently, and the suite then proved the file equals the tree. That absence is recorded rather than described as an armed capture.
- 2026-11-25: two pre-existing observations, measured and untouched because both are outside this contract. `scripts/recordings.json` maps `m055-record-shapes.json` to `scripts/guard-record-shapes.test.mjs` with arm `M055_CAPTURE=1`, but that suite writes `m063-record-shapes.json`; the actual writer of the m055 map is `scripts/tutor-record-shapes.test.mjs`, whose arm was run. No check reddens on the mismatch, which is why it survived.
- Landed paths: `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-signals.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/head-record.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/teardown-leak.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/gate-integrity.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `research/raw/m057-record-shapes.json`, `research/raw/m059-record-shapes.json`, `scripts/tutor-signals-shapes.test.mjs`, `research/raw/m055-record-shapes.json` — each is read from this tree, ready.
