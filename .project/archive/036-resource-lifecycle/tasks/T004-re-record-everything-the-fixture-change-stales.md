---
id: T004
title: Re-record everything the fixture change stales
wave: 2
status: done
deps: [T003]
agent: paid-deepseek-v4-1-flash-high
base: d722736bf2c766d6d1c5f18c61e6f60ad5db22b7
worktree: null
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
- 2026-11-07 — dispatched paid-deepseek-v4-1-flash-high (serial). Every recording re-emitted and re-read: m022 dev 2180767 -> 2199406 (+18639, new chunk names), production 473611 -> 482597 (+8986, alias lu -> Su), companion bytes matched to 2199406, and both .proven.json closures 26 -> 28 files. DEV_BYTES_TOLERANCE stays 2000; only its doc comment was re-cut. Gate: npm run check exit 0 (7 stages, prettier clean) and npm test exit 0 with 827 + 60 + 628 + 339 scripts/skills/app and 85/85 held-out across 22 suites (7m 7s), reproduced over two full runs. Pins that did not move are listed with why. Flags carried: `gsd verify-final` is broken on this host (the global shim's loader.js is missing), so the quorum row is recorded in words; the served halves were not re-driven and both recordings say so. Verdict: ready.
