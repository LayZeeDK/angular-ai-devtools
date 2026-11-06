---
id: T004
title: Re-record everything the fixture change stales
wave: 2
status: done
deps: [T003]
agent: paid-deepseek-v4-1-flash-high
base: 6809f471bee3aeceac263ba5b57cbb79dfe6bc04
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/features/.proven.json
  - .commandcode/skills/control-angular-devtools/features/.proven.json
  - research/raw/m022-ng-context.json
  - research/raw/companion-dev-build.json
  - research/raw/m034-verdict-claims.json
  - scripts/fixture-proof-fresh.test.mjs
  - scripts/ng-context-dev-build.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/facade-dev-build.test.mjs
---

# T004 — Re-record everything the fixture change stales

## Context

T001 added a fixture page and a route, and T003 added a panel surface and a route, so both control-skill feature
manifests and both development-build recordings no longer describe the built output. The verdict claims for this
milestone do not exist yet and the ship gate reads for them.

Three milestones lost ship cycles to exactly this task being under-scoped, and two lost their `format:check` stage to
coder-written files that were never formatted — so this task's Verify includes the formatter.

## Approach

Re-record through each artefact's own tool: `fingerprint.mjs record` for the manifests, a cleared output path for both
build recordings, `gsd verdict-record` for the claims. Measure, never adjust: a moved production bundle hash is the
proof that a build was rebuilt rather than tolerated.

## Interface contract

None

## Files

- both `.proven.json` manifests — re-recorded, naming both new fixture files
- `research/raw/m022-ng-context.json`, `research/raw/companion-dev-build.json` — re-measured from cleared output
- `research/raw/m034-verdict-claims.json` — generated
- the three suites — unchanged unless a recording shape moves

## Acceptance criteria

1. Both control-skill feature manifests name `legacy-module-page.ts` and `legacy-module.ts`.
2. Both development-build recordings are re-measured with the output path cleared first, and each says so.
3. `research/raw/m034-verdict-claims.json` quotes every intent criterion in full — none truncated at a wrapped line.
4. No value is tolerance-adjusted: each build recording is proved by a moved production bundle hash or by an unchanged recording that still reconciles against the other, and `npx prettier --check` passes on every file this task touched.
5. `npm run check` and `npm test` pass at the head.

## Verify

```bash
node --experimental-strip-types --test "scripts/fixture-proof-fresh.test.mjs" "scripts/ng-context-dev-build.test.mjs" "scripts/overlay-verdict-claims.test.mjs"
```

## Intent coverage

- SC5

## Log

- dispatched
- 2026-11-06 — dispatched paid-deepseek-v4-1-flash-high (serial, primary checkout). Re-recorded both control-skill
  manifests through `fingerprint.mjs record` (24 files each, two new fixture entries), re-measured
  `m022-ng-context.json` with each output path cleared first (production bundles renamed, 471795 -> 472550 bytes;
  dev 2173114 -> 2176374) and `companion-dev-build.json` from a cleared path (no pinned value moved). Recorded
  `m034-verdict-claims.json` in the m032/m033 shape, all five criteria quoted in full (235/181/175/175/48 chars).
  Three declared pins (`fixture-proof-fresh`, `overlay-verdict-claims`, `facade-dev-build`) were left untouched
  because every value in them still measures identical. `ng-context-dev-build.test.mjs` changed one doc comment
  (1,907,107 -> 2,176,374 bytes); `DEV_BYTES_TOLERANCE` stayed 2000, not widened. Gate: scripts 60/60, skills 628/628,
  app 333/333, held-out 85/85 (22 suites), `npm run check` green with prettier clean.
  Note: `gsd verdict-record` does not exist on this host (the global gsd shim's loader.js is missing); the claims
  were recorded in the established shape and the provenance is stated in each row rather than claimed.
  Verdict: ready.
