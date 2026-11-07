---
id: T004
title: Re-record everything the fixture change stales
wave: 2
status: in-progress
deps: [T003]
agent: paid-deepseek-v4-1-flash-high
base: 478b0b3a3af629e2837343153d3087392b83acc6
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/features/.proven.json
  - .commandcode/skills/control-angular-devtools/features/.proven.json
  - research/raw/m022-ng-context.json
  - research/raw/companion-dev-build.json
  - research/raw/m036-verdict-claims.json
  - scripts/fixture-proof-fresh.test.mjs
  - scripts/ng-context-dev-build.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/recording-consistency.test.mjs
  - scripts/facade-dev-build.test.mjs
  - extension/page-footprint.test.mjs
---

# T004 — Re-record everything the fixture change stales

## Context

T001 adds two fixture files and a route; T003 adds a panel surface and its route. Both control-skill feature manifests and
both development-build recordings now describe an older build, and this milestone's verdict claims do not exist yet.

## Approach

Re-record each artefact through its own tool, clearing the output path first for the build recordings; produce the verdict
claims by quoting the intent in full; re-cut only the pins a measurement proves wrong; then run the project gate.

## Interface contract

None

## Files

- Both `.proven.json` manifests — re-recorded through their feature's own `fingerprint.mjs record`.
- `research/raw/m022-ng-context.json`, `research/raw/companion-dev-build.json` — re-measured with the path cleared first.
- `research/raw/m036-verdict-claims.json` — new, one full quote per criterion.
- The three suites that read them.

## Acceptance criteria

1. Both manifests name the new fixture files, and their `check` reports them fresh.
2. Both build recordings state their command, that the output path was cleared, and the byte counts they measured; the two
   agree with each other.
3. `research/raw/m036-verdict-claims.json` quotes all six criteria in full, none truncated, verified character for
   character by `scripts/overlay-verdict-claims.test.mjs`.
4. held-out E6: `npm run check` and `npm test` pass at the head, and the gate row is recorded through `gsd verify-final`.

## Verify

```bash
node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"
```

## Intent coverage

- SC6

## Log

- dispatched
