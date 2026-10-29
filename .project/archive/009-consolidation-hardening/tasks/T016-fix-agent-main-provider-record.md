---
id: T016
title: Fix agent-main provider-record field reads
wave: 5
deps: []
status: done
agent: build_T016
base: eec3c0f8f90259aed91e9b63e91bb2920fce0772
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
---

# T016 — Fix agent-main provider-record field reads

## Context

M007 F1-F4 (blocking, one file) `extension/agent-main.js:380-396`: `isViewProvider` read from the non-existent `pr.viewProviders`; token names via `String(pr.token)`; provider kind from the non-existent `providerType`; element-injector identity from the non-existent `meta.name`/`meta.displayName`. Remedies: read `pr.isViewProvider`; derive name via `pr.token?.name ?? pr.token?.toString?.() ?? String(pr.token)`; inspect `pr.provider` to classify kind; use `tagName` for element injectors. M007 F5 (advisory) `importPath` stringified from array of types (same file) and M007 F9 (advisory) viewProviders handling (same file) are included where they share the file. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix. N3 (SC3): panel stays panel-local Prompt API.

## Approach

- Fix all four blocking field reads in `extension/agent-main.js` (lines ~380-396): `isViewProvider` from `pr.isViewProvider`; token name via the fallback chain; kind from `pr.provider`; element-injector identity via `tagName`.
- Also address the advisory F5 (importPath array stringification) and F9 (viewProviders handling) since they share the file, keeping the task deliverable-sized.
- Do not change the DI doctor's public contract beyond correct data; the panel consumes the same shapes.
- Prove the pattern is absent across the codebase where applicable (agent-main.js is the single site).

## Interface contract

None

## Intent coverage

- SC1
- SC6

## Acceptance criteria

1. `isViewProvider` is read from `pr.isViewProvider`, not `pr.viewProviders`.
2. Token name uses `pr.token?.name ?? pr.token?.toString?.() ?? String(pr.token)`.
3. Provider kind is derived from `pr.provider`, not `providerType`.
4. Element-injector identity uses `tagName`.
5. Advisory F5 and F9 are addressed in the same file.
6. Type check and agent-main tests pass.

## Verify

```bash
npm ci && npm run check && node --test extension/agent-main.test.mjs
```

Heavy: no

## Log

- created by planner
- build_T016: fixed provider-record field reads in extension/agent-main.js; tests pass (21/21), npm run check pass
- 2026-10-29 — orchestrator Verify (isolate gsd-path-task/T016): pass, exit 0; output tail:
  ```
  ℹ pass 21
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 219.6394
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
