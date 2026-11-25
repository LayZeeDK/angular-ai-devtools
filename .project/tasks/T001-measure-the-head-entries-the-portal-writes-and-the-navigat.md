---
id: T001
title: Measure the head entries the portal writes and the navigations beside them
wave: 1
status: done
deps: []
agent: build_T001
base: c4806647b7490ca6631a9ef7638e1d5895f133b7
worktree: null
task_branch: null
files:
- scripts/head-record.test.mjs
- research/raw/m068-head-record.json
- scripts/recordings.json
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
---

# T001 — Measure the head entries the portal writes and the navigations beside them

## Context

Nothing in this repository reads a document head entry: `grep -rln "document.head|document.title" extension/*.js` returns no match. M065 installed a MutationObserver on `<title>` and `document.head` in an isolated world and stated `writesSeen: 0` with "the observer names no writer", so the record this milestone joins is one it writes, and the writer it can name is the navigation the record correlates a write with.

## Approach

One opt-in capture writes, per head entry, the name it carries, the navigation index it was first seen at, the entry that remained, and the navigation whose page carries it — or states which of those was not read and why. The default run is read-only and asserts the committed record re-derives; only `M068_CAPTURE=1` writes, and the writer derives through the recorded document and refuses a candidate that is not the fixed point of its own pin.

## Intent coverage

- SC3

## Acceptance criteria

1. The record names, for every head entry read, its name, the navigation it was first seen at, the entry that remained and the navigation whose page carries it, or states which of the four was not read and why.
2. The default run writes nothing and fails when the committed record differs from what this head derives; only `M068_CAPTURE=1` writes, and an armed run is idempotent on a second pass.
3. The recording is named in `scripts/recordings.json` with its suite and its arm, and the new suite carries its `SUITE_DIFF_REASONS` row in `scripts/gate-integrity.test.mjs`.

## Files

Every path this task may touch, and nothing else:

- `scripts/head-record.test.mjs`
- `research/raw/m068-head-record.json`
- `scripts/recordings.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
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
// extension/head-state.js — the only reader of a document head entry's state
export function headState(record, facts) {
  return { state, entry, present, writtenBy, reason, observed }
}
```

`state` is one of `current`, `stale`, `duplicate`, `cannot-tell`. `present` and `writtenBy` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
node --test scripts/head-record.test.mjs
```

## Log

- pending
- 2026-11-25: the record reads one head entry, `title`, from M065's own observation, and states the other facts honestly. Identity was read: `title`, from `observation.observedTitleElement` and the mechanism naming the `<title>` element, never from the entry's text — asserted against `extension/title-input.js` run in a bare `node:vm` context. First sight was read: navigation 0 (`/home`). The entry that remained was read: `"Insurance Portal"`, carried by all three settled reads. The page carrying it was read: navigation 2 (`/claim`).
- 2026-11-25: two facts are named absences rather than invented values. `writtenBy` is not read, because `writesSeen` is 0 at every one of the three reads and the record's single write entry is the title the document carried before the observer attached (`observed: false`, `navigationIndex: null`, `author: null`); no navigation is named and no route inferred. `duplicate` is not read, because the record states one title value per read and none of its key paths counts entries sharing a name, so a second `<title>` would be invisible to it.
- 2026-11-25: Verify 17 tests / 17 pass. The armed run wrote the record and a second armed run moved no byte (sha256 `2f14440c...` before and after). A derivation made non-idempotent on purpose was refused with "armed capture refused: the bytes it would write fail this suite's default pin ... Nothing was written", and the file's sha256 was unchanged.
- 2026-11-25: six mutants each redden by name — an invented writing navigation, an invented duplicate, a route the record did not carry, a first sight moved, a second identity, and a name taken from the entry text.
- 2026-11-25: the recording is named in `scripts/recordings.json` with its suite and its arm, and the suite carries its `SUITE_DIFF_REASONS` row in `scripts/gate-integrity.test.mjs`.
- 2026-11-25: two records outside this contract go stale by exactly one file each and are owned elsewhere: `m044-gate-shapes` (`filesExamined` 378 to 379, `suitesExamined` 196 to 197) at T004, and `m059-record-shapes` (`recordsSearched` 167 to 168) at T005.
- Landed paths: `scripts/head-record.test.mjs`, `research/raw/m068-head-record.json`, `scripts/recordings.json`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs` — each is read from this tree, ready.
