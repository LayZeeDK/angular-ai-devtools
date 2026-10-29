---
id: T010
title: Classify Windows junctions as links in sidecar-deps-bridge
wave: 5
deps: []
status: done
agent: build_T010
base: bed1ac81090b90418c4c4633b06d367ebda4490c
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
- implemented: routed all link gates through isSymlinkLike; added junction tests; verify passed
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t010-verify): pass, exit 0; output tail:
  ```
  ✔ wrong-target-junction-detected (6.0051ms)
  ✔ junction-removed (3.9866ms)
  ℹ tests 6
  ℹ suites 0
  ℹ pass 6
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 240.7258
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
  ```
