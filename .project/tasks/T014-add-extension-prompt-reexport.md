---
id: T014
title: Add missing src/panel extension-prompt.service re-export
wave: 5
deps: []
status: pending
agent: null
base: null
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