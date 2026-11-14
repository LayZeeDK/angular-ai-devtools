---
id: T004
title: Record the checks' behaviour, rule the claims, and run the project verify
wave: 4
deps:
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m044-verdict-claims.json
  - scripts/gate-integrity.test.mjs
  - scripts/navigation-blocking.test.mjs
---

# T004 — Record the checks' behaviour, rule the claims, and run the project verify

## Context

The recordings are this milestone's evidence rather than its output: each check is driven against the instance that exposed it and against a clean control, and the verdict claims cite what was printed rather than a test name. The whole-tree proof is also SC6's evidence, because a green tree reached by weakening an assertion is the defect the milestone removes.

## Approach

- Drive each check against its measured instance and against a clean control, recording what each printed and the exit status.
- Write `research/raw/m044-verdict-claims.json` citing, per criterion, the artefact that proves it.
- Run `npm run check && npm test` on the milestone's own tree and record the suite count, then diff every suite against `d94502d1` and record the one file that differs.

## Interface contract

The claims file cites one artefact per criterion, each artefact a path plus the reading it carries; a criterion without an artefact fails the task rather than being claimed.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5
- SC6

## Edges

- E10

## Acceptance criteria

1. held-out E10 — AC1 each check is driven against the instance that exposed it and against a clean control, the recording carrying what each printed and the exit status each produced.
2. held-out E10 — AC2 `research/raw/m044-verdict-claims.json` cites per criterion the artefact that proves it, and a criterion without an artefact fails the task.
3. held-out E10 — AC3 `npm run check && npm test` runs green on the milestone's own tree and the suite count is recorded, so a removed test shows as a count drop.
4. held-out E10 — AC4 the only assertion edited in a shipped suite is the navigation pin named in SC6, proven by diffing every suite against `d94502d1` and recording the one file that differs.

## Verify

```bash
node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" "scripts/navigation-blocking.test.mjs" && npx prettier --check scripts/gate-integrity.test.mjs scripts/navigation-blocking.test.mjs research/raw/m044-gate-shapes.json research/raw/m044-verdict-claims.json && npm run check && npm test
```

## Held-out

E10

## Log

- (no entries yet)