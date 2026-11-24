---
id: T008
title: Capture the milestone verdict claims the gate reads
wave: 8
status: done
deps: []
agent: build_T008
base: fe72ba2581ff00e729b82379b74dd18afc5edb8b
worktree: null
task_branch: null
files:
- research/raw/m067-verdict-claims.json
- scripts/m067-verdict-claims.test.mjs
- scripts/gate-integrity.test.mjs
- research/raw/m044-gate-shapes.json
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
---

# T008 — Capture the milestone verdict claims the gate reads

## Context

`scripts/guard-verdict-claims.test.mjs` requires `research/raw/m067-verdict-claims.json` and reports its absence as
"the list has never been captured". Every milestone in this programme carries one; this one was planned without it,
which is why seven suites are red with a delta of zero.

## Approach

Derive the claim list from this milestone's own artefacts — the intent criteria, the task acceptances and the wave
reviews — write it through an armed capture that is idempotent, and add a reason row for the new suite so the census
does not redden on its first appearance.

## Intent coverage

- SC4

## Acceptance criteria

1. `research/raw/m067-verdict-claims.json` exists, names one claim per intent criterion, and a default run of the capture suite reproduces it byte for byte.
2. An armed run writes only what moved, and a second armed run changes no byte; a default run writes nothing.
3. The new suite carries its `SUITE_DIFF_REASONS` row, and `scripts/gate-integrity.test.mjs` reports zero findings at this head.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m067-verdict-claims.json`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `research/raw/m044-gate-shapes.json`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/field-binder.js — the only reader of a field's hosted control
export function fieldBinder(record, facts) {
  return { state, field, hosted, expected, reason, observed }
}
```

`state` is one of `bound`, `mismatch`, `no-host`, `cannot-tell`. `hosted` and `expected` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
node --test scripts/m067-verdict-claims.test.mjs
```

## Log

- pending
- 2026-11-23: esearch/raw/m067-verdict-claims.json\ now exists — 13 tests / 13 pass, one claim per criterion quoting the intent verbatim, 17 citations over 6 suites. Armed run wrote once and a second armed run moved no byte.
- 2026-11-23: the census re-derived at this head: \M044_CAPTURE=1\ wrote one moved line, the second armed run reported nothing moved, and the default run is 40/40.
- 2026-11-23: three \SUITE_DIFF_REASONS\ rows added — this suite's, and the honest rows for T004's and T005's suites, which had landed without them.
- 2026-11-23: the paste-the-row assertion this milestone's T001 built was broken by T001 itself — \section.unexplained\ where the state is held beside the record — so it threw a TypeError instead of printing the block. Repaired in place; the repaired assertion is what produced the three-row block.
- 2026-11-23: four suites went green from this record alone (guard-verdict-claims 8/8, outlet-verdict-claims 8/8, navigation-blocking 27/27, gate-integrity 40/40). Three remain red for causes outside this contract: no record-shapes map measures \m066-verdict-claims.json\, and \m059-record-shapes.json\ counts a tree that has grown by two records (ecordsSearched\ 165 to 167).
- Landed paths: `research/raw/m067-verdict-claims.json`, `scripts/m067-verdict-claims.test.mjs`, `scripts/gate-integrity.test.mjs`, `research/raw/m044-gate-shapes.json`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs` — each is read from this tree, ready.
