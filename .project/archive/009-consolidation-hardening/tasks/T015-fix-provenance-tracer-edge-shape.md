---
id: T015
title: Build provenance adjacency from consumer/producer edges
wave: 5
deps: []
status: done
agent: build_T015
base: eec3c0f8f90259aed91e9b63e91bb2920fce0772
worktree: null
task_branch: null
files:
  - src/main-world/provenance-tracer.ts
  - src/main-world/provenance-tracer.test.ts
---

# T015 — Build provenance adjacency from consumer/producer edges

## Context

M006 F3 (blocking): `src/main-world/provenance-tracer.ts:32` only follows `from`/`to` edges while the extension serializes `{consumer, producer}`. Remedy: build adjacency from those. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix.

## Approach

- Update `src/main-world/provenance-tracer.ts` to build adjacency from `consumer`/`producer` edges (the serialized shape), instead of `from`/`to`.
- Keep handling of any legacy `from`/`to` shape only if present in tests; the canonical shape is `{consumer, producer}`.
- No change to the tracer's public API.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `provenance-tracer.ts` builds adjacency from `consumer`/`producer` edges.
2. No reliance on `from`/`to` for the canonical serialized shape.
3. Type check and tracer tests pass.

## Verify

```bash
npm ci && npm run check && node --test src/main-world/provenance-tracer.test.ts
```

Heavy: no

## Log

- created by planner
- T015 implemented: built adjacency from consumer/producer edges; type check and tracer tests pass
- 2026-10-29 — orchestrator Verify (isolate gsd-path-task/T015): pass, exit 0; output tail:
  ```
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 208.6016
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
