---
id: T010
title: Classify Windows junctions as links in sidecar-deps-bridge
wave: 5
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/sidecar-deps-bridge.mjs
  - scripts/sidecar-deps-bridge.test.mjs
---

# T010 — Classify Windows junctions as links in sidecar-deps-bridge

## Context

M003 F1 (blocking): `scripts/sidecar-deps-bridge.mjs:37` defines `isSymlinkLike` (symlink **or junction**) but every gate calls `.isSymbolicLink()`, so the junctions the module itself creates are misclassified at create/reuse/unlink/verify. Remedy: replace each `.isSymbolicLink()` gate with `isSymlinkLike(st)`. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix.

## Approach

- Replace every `.isSymbolicLink()` gate in `scripts/sidecar-deps-bridge.mjs` with the already-defined `isSymlinkLike(st)` helper, so junctions created by the bridge are classified as links at create/reuse/unlink/verify.
- Prove the pattern is absent across the codebase, not just at the reported line: the Verify runs the module's tests and a grep that fails if `.isSymbolicLink()` remains in the bridge.
- No change to the public contract of the bridge beyond correct classification.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. No `.isSymbolicLink()` gate remains in `scripts/sidecar-deps-bridge.mjs`; all gates use `isSymlinkLike(st)`.
2. The bridge's tests pass and the module still creates/removes the junction correctly.
3. No public behavior change beyond correct classification.

## Verify

```bash
npm ci && node --test scripts/sidecar-deps-bridge.test.mjs && node -e "const s=require('fs').readFileSync('scripts/sidecar-deps-bridge.mjs','utf8');const n=(s.match(/[.]isSymbolicLink[(][)]/g)||[]).length;if(n>0){console.error('.isSymbolicLink() is still used '+n+' time(s); route every gate through isSymlinkLike');process.exit(1);}if(!/isSymlinkLike\s*[(]/.test(s)){console.error('isSymlinkLike is not called');process.exit(1);}"
```

Heavy: no

## Log

- created by planner