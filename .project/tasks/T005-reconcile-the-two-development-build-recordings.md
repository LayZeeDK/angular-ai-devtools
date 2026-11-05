---
id: T005
title: Reconcile the two development-build recordings
wave: 3
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/companion-dev-build.json
  - research/raw/m022-ng-context.json
  - scripts/facade-dev-build.test.mjs
  - scripts/ng-context-dev-build.test.mjs
---

# T005 — Reconcile the two development-build recordings

## Context

The ship Verify failed on `scripts/facade-dev-build.test.mjs`:

```
AssertionError: Expected values to be strictly deep-equal:
-   'chunk-5CQ6O73V.js',
-   'chunk-KDTDSBO7.js',
    'main.js'
```

Two suites record the same fixture's **development** build and now disagree. `facade-dev-build` measures one `main.js`;
T004 wrote `research/raw/m022-ng-context.json` with three bundles (`chunk-5CQ6O73V.js`, `chunk-KDTDSBO7.js`,
`main.js`). Both cannot be right about the same configuration.

The likely cause: T004 built into a reused output directory under the ignored scratch area, so files left by an earlier
build were counted alongside the new one. A recording that captures leftovers is stale the moment it is written, and it is the
mirror image of the defect this milestone was designed to avoid.

## Approach

1. Delete the output directory before each build, then build development **and** production from clean output paths.
2. Re-measure both recordings from those clean builds with each suite's own `analyseBundle`, and state in each recording
   that the output path was cleared first.
3. Make the two recordings agree on the bundle list for the same configuration, or — if they measure genuinely different
   configurations — say in each recording which configuration it measured and why they differ. Write the comparison into
   the recording rather than leaving a reader to discover the disagreement at a gate.

## Interface contract

None

## Files

- `research/raw/companion-dev-build.json`
- `research/raw/m022-ng-context.json`

## Acceptance criteria

1. Each build is made from a cleared output path, and the recording states that it was.
2. The two recordings agree on the development bundle list, or each states the configuration it measured and why they differ.
3. `node --test scripts/facade-dev-build.test.mjs` and `node --test scripts/ng-context-dev-build.test.mjs` both pass.
4. Reverting one recorded bundle name reddens the suite that reads it.

## Verify

```bash
node --test scripts/facade-dev-build.test.mjs scripts/ng-context-dev-build.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
