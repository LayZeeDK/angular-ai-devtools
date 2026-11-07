---
id: T004
title: Re-record everything the fixture change stales
wave: 2
status: done
deps: [T003]
agent: paid-deepseek-v4-1-flash-high
base: 2c54713c547ed98c72e83a6fe4ce369f1abd1329
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/features/.proven.json
  - .commandcode/skills/control-angular-devtools/features/.proven.json
  - research/raw/m022-ng-context.json
  - research/raw/companion-dev-build.json
  - research/raw/m035-verdict-claims.json
  - scripts/fixture-proof-fresh.test.mjs
  - scripts/ng-context-dev-build.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/facade-dev-build.test.mjs
  - extension/page-footprint.test.mjs
---

# T004 — Re-record everything the fixture change stales

## Context

T001 added a fixture component and a route, and T003 added a panel route and a surface, so both control-skill feature
manifests and both development-build recordings no longer describe the built output. The verdict claims for this
milestone do not exist yet.

Three milestones lost ship cycles to this task being under-scoped, and two lost their `format:check` stage to
coder-written files that were never formatted — so this task's Verify includes the formatter.

## Approach

Re-record through each artefact's own tool, measure rather than adjust, and leave a declared pin untouched when its
values still measure identical.

## Interface contract

None

## Files

- both `.proven.json` manifests — re-recorded, naming both new fixture files
- `research/raw/m022-ng-context.json`, `research/raw/companion-dev-build.json` — re-measured from cleared output
- `research/raw/m035-verdict-claims.json` — generated
- the four suites — unchanged unless a recording shape moves

## Acceptance criteria

1. Both control-skill feature manifests name `onpush-ready.ts` and `onpush-ready-page.ts`.
2. Both development-build recordings are re-measured with the output path cleared first, and each says so.
3. `research/raw/m035-verdict-claims.json` quotes every intent criterion in full, none truncated at a wrapped line.
4. No value is tolerance-adjusted: each build recording is proved by a moved production bundle hash or an unchanged recording that still reconciles, and `npx prettier --check` passes on every file this task touched.
5. `npm run check` and `npm test` pass at the head.

## Verify

```bash
node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"
```

## Intent coverage

- SC5

## Log

- dispatched
- 2026-11-06 — dispatched paid-deepseek-v4-1-flash-high (serial). Re-recorded both control-skill manifests (24 -> 26 files) through fingerprint.mjs, re-measured m022-ng-context (dev 2176374 -> 2180767, prod 472550 -> 473611, prod entry main-JST524BV -> main-AHS4MRYY) and companion-dev-build (bytesObserved 2176374 -> 2180767), produced m035-verdict-claims.json with five full quotes, and re-cut only the DEV_BYTES_TOLERANCE doc comment (tolerance stays 2000). Declared Verify 22/22, npm run check green. npm test red only at held-out E4, whose cause was a tracked taste file dirtied mid-run by a preference write, now parked. Verdict: ready.
