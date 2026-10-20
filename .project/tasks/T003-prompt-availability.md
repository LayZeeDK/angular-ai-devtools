---
id: T003
title: Fix panel Prompt API availability contract
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/extension-prompt.service.ts
  - apps/angular-ai-devtools/src/app/extension-prompt.service.spec.ts
---

# T003 — Fix panel Prompt API availability contract

## Context

Per SYNTHESIS, `downloadable` and `downloading` must count as unavailable in this milestone (no download flow), the raw `availability()` value must be surfaced as the panel's reason string, and `create()` rejection must be an explainable outcome. The brownfield code currently labels `downloadable`/`downloading` as `ready`, which would start a multi-GB download from a click. This task fixes `ExtensionPromptService.checkAvailability()` and the Explain flow, and keeps the session panel-local (no Prompt API in page/content/SW).

## Approach

- In `checkAvailability()`, set `ready` only when availability is exactly `'available'`; treat `'downloadable'`, `'downloading'`, `'unavailable'` and any other value as unavailable, storing the raw value as the reason.
- Handle a `create()` rejection in `explain()` as a normal outcome: set status to `error`/unavailable with the rejection message, keep the deterministic chain visible, and never start a download.
- Do not move Prompt API calls out of the panel document; the session stays panel-local.
- Update `extension-prompt.service.spec.ts` to assert `downloadable`/`downloading` are unavailable and the reason string is surfaced.

## Interface contract

- Availability result:
```
status: 'ready' only when availability === 'available';
availability: string; // raw value from LanguageModel.availability()
```

## Intent coverage

- SC3
- SC5

## Acceptance criteria

1. `checkAvailability()` returns `ready` only for `'available'`; `'downloadable'` and `'downloading'` yield `unavailable` with the raw value as the reason.
2. `explain()` on a `create()` rejection sets an error/unavailable status, surfaces the rejection message, and leaves the chain visible.
3. No Prompt API call occurs in page, content scripts, or service worker.
4. Unit tests assert the downloadable/downloading handling and the create() rejection path.

## Verify

```bash
npx nx test angular-ai-devtools --skip-nx-cache --testPathPattern=apps/angular-ai-devtools/src/app/extension-prompt.service.spec.ts
```

Heavy: no
- 2026-10-19 — created by planner

## Log

- 2026-10-19 — created by planner
