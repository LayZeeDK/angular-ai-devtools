---
id: T004
title: The corpus runs with no project directory
wave: 2
deps: [T003]
status: in-progress
agent: build_T004
base: 47e1a38959de64ab953d872c6f6f5a34c0620c9d
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - tests/held-out/e7-archive-order.test.mjs
  - scripts/held-out-corpus.mjs
  - scripts/held-out-corpus.test.mjs
---

# T004 — The corpus runs with no project directory

## Context

The wave-1 review found the criterion violated by a suite the measurement missed.
`tests/held-out/e7-archive-order.test.mjs` reads `.project/archive/001-run-unrun-spikes`, so with `.project/`
moved aside it exits 1 with `E7: archive path missing`. SC3 says no suite under `tests/held-out/` reads any path
under `.project/`, and prohibitions N1 repeats it.

T003 proved the *script* runs without `.project/`; nothing yet proves the *corpus* does. That is the gap: the
script's proof used fixture roots, and the real corpus was never run in the state the ship flow creates.

## Approach

1. Re-home E7's claim so the suite carries what it needs: the archive-order fact becomes data the suite owns
   (as an earlier milestone re-homed a declaration into its suite), with the archived path recorded as provenance rather than read.
2. Add a corpus-level proof: run `scripts/held-out-corpus.mjs` over the real `tests/held-out/` with `.project/`
   moved aside, and assert exit 0. Restore in a `finally`.
3. Keep every existing T003 assertion.

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. `node scripts/held-out-corpus.mjs` exits 0 with `.project/` moved aside and restored afterwards, demonstrated by running it.
2. `tests/held-out/e7-archive-order.test.mjs` reads no path under `.project/`, and still asserts its ordering claim from data it carries.
3. The corpus-level proof reddens when `.project/` is present and a suite reads it — prove by temporarily reintroducing such a read, capture the failure, restore.
4. Acceptance is held-out E3: the corpus runs with no project directory present.

## Verify

```bash
npm ci --include=dev; node --test scripts/held-out-corpus.test.mjs
```

## Log

- opened by orchestrator after the wave-1 review blocked SC3 on `e7-archive-order`
