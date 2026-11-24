---
id: T010
title: Give the shape map an armed capture
wave: 10
status: done
deps: []
agent: build_T010
base: a53e7707845a3f485bdfb2c4533bf0df7bd07c20
worktree: null
task_branch: null
files:
- research/raw/m055-record-shapes.json
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/navigation-blocking.test.mjs
---

# T010 — Give the shape map an armed capture

## Context

`research/raw/m055-record-shapes.json` has no `capture` field, so nothing writes it: it is re-derived by hand at every
rebind, and it has now drifted twice. M066's own archive recorded that this would happen — "the same drift will recur at
the next rebind" — and it recurred at the next rebind, orphaning `m066-verdict-claims.json` and reddening
`tutor-record-shapes` and `tutor-answer`.

## Approach

Give the map the same writer every other record in this programme has: an armed run that derives the map from the tree,
refuses a candidate that is not the fixed point of its own pin, writes only on its arm, and leaves a default run
read-only and authoritative. Then re-derive the map at this head so the row it lacks lands as a reading rather than a
typed value.

## Intent coverage

- SC4

## Acceptance criteria

1. The armed run writes `research/raw/m055-record-shapes.json` from the tree, and a second armed run changes no byte.
2. A default run writes nothing and fails when the committed map differs from what this head derives, naming the record that moved.
3. The map measures every verdict-claims record the tree holds except those its own reader exempts, and `scripts/tutor-record-shapes.test.mjs` and `scripts/tutor-answer.test.mjs` report zero failures with no assertion retuned.

## Files

Every path this task may touch, and nothing else:

- `research/raw/m055-record-shapes.json`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/navigation-blocking.test.mjs`

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
node --test scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs
```

## Log

- pending
- 2026-11-23: the map now has an armed writer that reuses the suite's own measurements rather than re-implementing the shape. Default run derives and refuses; armed run writes only what moved; a candidate that is not the fixed point of the pin is refused and nothing is written.
- 2026-11-23: written by its armed run and idempotent on the third pass ("nothing moved, nothing written", 300864 bytes). Verify 34 tests / 34 pass, both suites green, and pm run check\ exit 0.
- 2026-11-23: two pins re-derived from the branch movement, not retuned: \['verdict-claims', 35]\ to 36 and the \selfHeld\ entry from m066 to m067, each stating why the census derives a different record after the rebind.
- 2026-11-23: the writer corrected four readings that were stale before this head — claims 156 to 164, milestones 34 to 36, readingField 44 to 52, distinct artefact paths 18 to 21 — each because the previous hand-capture had missed them, which is the drift the writer exists to end.
- 2026-11-23: residual reported, not hidden: the map's author-written sentences still quote old counts, because a writer owns readings and not prose. esearch/raw/m044-gate-shapes.json\ is stale from this change and is owned by T007.
- Landed paths: `research/raw/m055-record-shapes.json`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/navigation-blocking.test.mjs` — each is read from this tree, ready.
