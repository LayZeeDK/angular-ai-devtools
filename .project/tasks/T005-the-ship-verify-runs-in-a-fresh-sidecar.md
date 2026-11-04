---
id: T005
title: The ship verify runs in a fresh sidecar
wave: 3
deps: [T004]
status: in-progress
agent: build_T005
base: 018c919cba70a6215ce962de7a6062e76d9382cc
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - .project/plan/PLAN.md
  - scripts/retired-suites.test.mjs
---

# T005 — The ship verify runs in a fresh sidecar

## Context

The project Verify failed at `3b2eacb` for two reasons, both mine:

1. `PLAN.md`'s Project verify is `npm ci --include=dev && npm run check && npm test`. M023's included
   `npm --prefix spikes/ng222-app ci --include=dev`, and without it the fixture-dependent suites fail with
   `the development-build proof cannot run: the fixture install is absent (spikes/ng222-app/node_modules)`.
2. `scripts/retired-suites.test.mjs` scans the repository for retired basenames and exempts `.project/plan`,
   `.project/archive` and `.project/tasks` — but not `.project/review`, whose artifacts legitimately quote the
   work they reviewed. It fails with
   `.project/review/wave-1.cycle1.md: e1-zero-defects-recorded`.

## Approach

1. Add the fixture install to `PLAN.md`'s Project verify line, so a fresh sidecar provisions what the suites
   require rather than failing honestly-but-unhelpfully.
2. Extend the exemption set in `scripts/retired-suites.test.mjs` to `.project/review`, with the reason stated in
   source: a review artifact records what it reviewed, and quoting a retired suite there is the record working.
3. Keep every existing assertion; the walk must still catch a naming outside those prefixes.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. `npm run check && npm test` passes in a sidecar that ran the plan's Project verify from a clean tree, demonstrated by the Verify below.
2. `.project/review` is exempt from the retired-basename walk, with the reason in source, and a naming outside every exempt prefix still reddens it — prove by planting one, capture the failure, restore.
3. Acceptance is held-out E5: a retired suite with no recorded claim is still refused.

## Verify

```bash
npm ci --include=dev; node --test scripts/retired-suites.test.mjs
```

## Log

- opened by orchestrator after the ship Verify failed at `3b2eacb` on the fixture install and the review prefix
- T005: PLAN.md's Project verify now runs npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test with an inline why-comment the helper strips, and scripts/retired-suites.test.mjs exempts .project/review with its reason beside the others; a planted e10-spec-present in scripts/ outside every exempt prefix reddened the walk (scripts/zz-planted-retired-naming-probe.txt: e10-spec-present) and its removal returned 4/4 pass; contract Verify exit 0, npm run check exit 0 - ready
