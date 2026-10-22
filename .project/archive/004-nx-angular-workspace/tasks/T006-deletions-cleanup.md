---
id: T006
title: Remove dead prompt bridge, content.js, page-script.js, and nx-welcome.ts
wave: 3
deps: [T001, T004]
status: done
agent: free-beam-medium
base: 3dde8ad87bd8d26a478e20653e2f2d8fbf1dd74c
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/relay.js
  - extension/background.js
  - extension/content.js
  - extension/page-script.js
  - apps/angular-ai-devtools/src/app/nx-welcome.ts
---

# T006 — Remove dead prompt bridge, content.js, page-script.js, and nx-welcome.ts

## Context

SC6/N6: remove the dead prompt bridge (`agent-main.js` LanguageModel code, `relay.js` `PROMPT_API_REQUEST` forwarding and `request()`, `background.js` `PROMPT_API_REQUEST` stub), `content.js`, `page-script.js`, and `nx-welcome.ts`, with no file, manifest entry, or import referencing them. `agent-main.js` keeps only its page-reading recorder path (T001). The panel's Prompt API is already panel-local (T003/T004), so the bridge is unused.

## Approach

- Delete `extension/content.js`, `extension/page-script.js`, and `apps/angular-ai-devtools/src/app/nx-welcome.ts`.
- Strip all `LanguageModel`/prompt code from `extension/agent-main.js` (already recorder-only after T001; verify no leftovers).
- Remove `PROMPT_API_REQUEST` handling and `request()` from `extension/relay.js`; keep Angular detection and marker injection.
- Remove the `PROMPT_API_REQUEST` stub from `extension/background.js`; keep host capability and angular-detected relay.
- Verify no manifest entry or import references the removed files; grep for `content.js`, `page-script.js`, `nx-welcome`, `PROMPT_API_REQUEST` returns no references.
- Run `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`, and the extension-panel check.

## Interface contract

None

## Intent coverage

- SC6

## Acceptance criteria

1. `content.js`, `page-script.js`, and `nx-welcome.ts` are deleted.
2. No `LanguageModel` code remains in `agent-main.js`; no `PROMPT_API_REQUEST` handling or `request()` remains in `relay.js`; no `PROMPT_API_REQUEST` stub remains in `background.js`.
3. Grep for `content.js`, `page-script.js`, `nx-welcome`, `PROMPT_API_REQUEST` returns no references (excluding this plan/task text).
4. `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`, and the extension-panel check pass.

## Verify

```bash
npm run check && npm test && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && test ! -f extension/content.js && test ! -f extension/page-script.js && test ! -f apps/angular-ai-devtools/src/app/nx-welcome.ts
```

Heavy: yes
- 2026-10-19 — created by planner

## Log

- 2026-10-19 — created by planner
- 2026-10-21 — orchestrator dispatch: T006 dispatched as free-beam-medium (serial, primary worktree)
- 2026-10-21 — subagent produced: deleted content.js, page-script.js, nx-welcome.ts; stripped prompt bridge from relay.js and background.js; agent-main.js already clean; committed as 1523a7a
- 2026-10-21 — orchestrator Verify: npm run check PASS, npm test PASS (522 tests), npx nx run angular-ai-devtools:build-extension --skip-nx-cache PASS; grep for content.js, page-script.js, nx-welcome, PROMPT_API_REQUEST returns no references
