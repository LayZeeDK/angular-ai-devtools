---
id: T016
title: Fix agent-main provider-record field reads
wave: 5
deps: []
status: pending
agent: null
base: null
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