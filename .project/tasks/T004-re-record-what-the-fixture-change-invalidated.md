---
id: T004
title: Re-record what the fixture change invalidated
wave: 2
status: done
deps: [T003]
agent: build_T004
base: b5a66ce7cf9ee4de1cea41f77fbcd8c594044e88
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
- Re-recorded through each artefact's own tooling at b5a66ce7: fingerprint.mjs wrote 5 stale entries (dev-app components/counter, devtools attach/profiler/signal-graph, now naming after-render-page.ts and the new app.routes.ts blob), the m022 builds were re-measured by the suite's own ng build commands (dev 1902757B within the 2000B path-independent bound, prod main-4KL4US2I.js 389645B aliasing __ngContext__ as Mm) and m028-verdict-claims.json generated with gsd verdict-record --apply; mutants: old app.routes.ts hash reddens each manifest suite, production bytes 389015 reddens the ng-context recording check, a paraphrased SC1 reddens the claim list; Verify 21/21, npm run check and npm test green
