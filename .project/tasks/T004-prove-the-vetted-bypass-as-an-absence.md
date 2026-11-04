---
id: T004
title: Prove the vetted bypass as an absence
wave: 2
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/trust-bypass-page.ts
  - extension/sanitizer-triage.js
  - scripts/sanitizer-bypass.test.mjs
---

# T004 — Prove the vetted bypass as an absence

## Context

A `bypassSecurityTrust*` path suppresses the warning entirely, so 'deliberate' cannot be read from the
warning's content. It is proved by the warning not appearing where a bypass was used.

## Approach

Add a third binding to the page that calls `bypassSecurityTrustHtml`, and prove the pair: the stripped binding
warns where the bypass binding does not, from the same capture path. Report the bypass as `deliberate` and the
absence of both as neither clean nor stripped (N3).

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/trust-bypass-page.ts`
- `extension/sanitizer-triage.js`
- `scripts/sanitizer-bypass.test.mjs`

## Acceptance criteria

1. The bypass binding produces no warning while the stripped binding on the same page does, in one capture.
2. The module reports the bypass as `deliberate`, and reports a page with neither signal as neither state.
3. Mutants redden: reporting the bypass as `stripped`, and reporting a page with no warning as clean.

## Verify

```bash
npm ci --include=dev; node --test scripts/sanitizer-bypass.test.mjs
```

## Intent coverage

- SC3

## Log

- dispatched
