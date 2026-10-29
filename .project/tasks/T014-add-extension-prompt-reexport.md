---
id: T014
title: Add missing src/panel extension-prompt.service re-export
wave: 5
deps: []
status: done
agent: build_T014
base: eec3c0f8f90259aed91e9b63e91bb2920fce0772
worktree: null
task_branch: null
files:
  - src/panel/extension-prompt.service.ts
---

# T014 — Add missing src/panel extension-prompt.service re-export

## Context

M006 F2 (blocking): `src/panel/extension-prompt.service.ts` is cited (m006 spec lists `src/panel/* (..., extension-prompt.service)`) but absent. Remedy: add `src/panel/extension-prompt.service.ts` re-export or drop the citation wherever it is made. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix.

## Approach

- Add `src/panel/extension-prompt.service.ts` that re-exports the existing `ExtensionPromptService` (and `ChainResultLike`) from `apps/angular-ai-devtools/src/app/extension-prompt.service.ts`, so the cited path resolves.
- Alternatively, if a re-export is not viable, drop the citation in the spec; prefer the re-export to keep imports stable.
- No behavior change; re-export only.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `src/panel/extension-prompt.service.ts` exists and re-exports `ExtensionPromptService` (and `ChainResultLike` if applicable).
2. Imports resolving to `src/panel/extension-prompt.service` type-check and run.
3. No public behavior change.

## Verify

```bash
npm ci && npm run check && node -e "const fs=require('fs');if(!fs.existsSync(process.argv[1])){console.error('missing '+process.argv[1]);process.exit(1);}" src/panel/extension-prompt.service.ts
```

Heavy: no

## Log

- created by planner
- implemented: added src/panel/extension-prompt.service.ts re-exporting ExtensionPromptService and ChainResultLike from apps/angular-ai-devtools/src/app/extension-prompt.service.ts; Verify: npm ci && npm run check && file exists — pass
- 2026-10-29 — orchestrator Verify (isolate gsd-path-task/T014): pass, exit 0; output tail:
  ```
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
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
