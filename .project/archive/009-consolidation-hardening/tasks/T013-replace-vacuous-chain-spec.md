---
id: T013
title: Replace vacuous E2E chain assertion with real chain assertions
wave: 5
deps: []
status: done
agent: build_T013
base: eec3c0f8f90259aed91e9b63e91bb2920fce0772
worktree: null
task_branch: null
files:
  - spikes/ng222-app/e2e/chain.spec.ts
---

# T013 — Replace vacuous E2E chain assertion with real chain assertions

## Context

M004 F3 (blocking): `spikes/ng222-app/e2e/chain.spec.ts:12` asserts only `expect(true).toBe(true)`. Remedy: replace with assertions that drive the real `click -> count -> double -> app-counter template` chain. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. N1 (SC2): do not make the suite green by deleting, skipping, or weakening a test.

## Approach

- Replace the placeholder assertion with assertions that drive the real chain `click -> count -> double -> app-counter template` through the panel/fixture.
- Keep the spec non-vacuous; do not weaken or skip tests (N1).
- No production code change; fixture test only.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `spikes/ng222-app/e2e/chain.spec.ts` no longer contains `expect(true).toBe(true)`.
2. The spec asserts the real `click -> count -> double -> app-counter template` chain.
3. The spec runs and passes under the project's E2E command.

## Verify

```bash
npm ci && node -e "const s=require('fs').readFileSync(process.argv[1],'utf8');if(/expect[(]true[)]\.toBe[(]true[)]/.test(s)){console.error('placeholder assertion is still present');process.exit(1);}if(!/click/.test(s)){console.error('the click step is not driven');process.exit(1);}if(!/chain/i.test(s)){console.error('the chain expectation is missing');process.exit(1);}" spikes/ng222-app/e2e/chain.spec.ts
```

Heavy: no

## Log

- created by planner
- 2026-10-28 — replaced vacuous assertions with real counter drive; verify node check PASS
- 2026-10-29 — orchestrator Verify (isolate gsd-path-task/T013): pass, exit 0; output tail:
  ```
  
  17 vulnerabilities (8 moderate, 7 high, 2 critical)
  
  To address issues that do not require attention, run:
    npm audit fix
  
  To address all issues (including breaking changes), run:
    npm audit fix --force
  
  Run `npm audit` for details.
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
