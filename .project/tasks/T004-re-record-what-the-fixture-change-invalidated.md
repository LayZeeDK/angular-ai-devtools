---
id: T004
title: Re-record what the fixture change invalidated
wave: 2
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/features/.proven.json
  - .commandcode/skills/control-angular-devtools/features/.proven.json
  - research/raw/m022-ng-context.json
  - research/raw/m028-verdict-claims.json
  - scripts/fixture-proof-fresh.test.mjs
  - scripts/ng-context-dev-build.test.mjs
  - scripts/overlay-verdict-claims.test.mjs
---

# T004 — Re-record what the fixture change invalidated

## Context

M028 explains why an `afterNextRender` read of `offsetWidth` saw 0, from the ordered profiler after-render
events the page agent already records. The profile exists in the extension; the fixture subject must be
created. See `.project/research/evidence-m028-premise.md`.

## Approach

The fixture change staleed both control-skill feature manifests and the ng-context dev-build recording. Re-record each through its own tooling, never by hand-editing a hash, and generate the M028 verdict recording with `gsd verdict-record`. Reverting any recording must redden its suite.

## Interface contract

None

## Files

- `.commandcode/skills/control-angular-dev-app/features/.proven.json`
- `.commandcode/skills/control-angular-devtools/features/.proven.json`
- `research/raw/m022-ng-context.json`
- `research/raw/m028-verdict-claims.json`
- `scripts/fixture-proof-fresh.test.mjs`
- `scripts/ng-context-dev-build.test.mjs`
- `scripts/overlay-verdict-claims.test.mjs`

## Acceptance criteria

1. Each recording names this head's sources and bytes; reverting any one of them reddens its suite (held-out E5 path is the gate).
2. The dev-build comparison keeps its path-independence bound rather than pinning an exact byte count.
3. `npm run check` and `npm test` pass at the head.

## Verify

```bash
npm ci --include=dev; node --test scripts/fixture-proof-fresh.test.mjs scripts/overlay-verdict-claims.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
