---
id: T004
title: Prove the vetted bypass as an absence
wave: 2
status: done
deps: [T002]
agent: build_T004
base: 027e28671ea48898569b3d779358f9051434770f
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/trust-bypass-page.ts
  - extension/sanitizer-triage.js
  - scripts/sanitizer-bypass.test.mjs
  - research/raw/m029-sanitizer-bypass.json
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
- pair captured in one page load: 2 sanitizer warnings for unsafe@1,unsafe@2 and none for bypassed@1/2 (bypassSecurityTrustHtml carries the byte-identical value and writes it whole, script retained); fourth state deliberate -> {state:deliberate,binding:bypassSecurityTrustHtml,contrast:{binding:unsafe,writeVersion:1,bypassWriteVersion:1,warnings:2}} beside the load's stripped/cannot-tell findings, and the same bindings with no warning stay none (neither clean nor deliberate); 3 mutants redden (bypass-as-stripped, no-warning-as-clean, deliberate-without-a-bypass); node --test scripts/sanitizer-bypass.test.mjs 10/10 pass after npm ci --include=dev; contract defect: files: declares no path under research/raw, so the recording lives in the run (M029_BYPASS_RECORD=<path> writes it) and research/raw/m029-sanitizer-bypass.json was deliberately not written
