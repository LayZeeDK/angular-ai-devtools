---
id: T001
title: Record what the sanitizer warning and the profiler actually contain
wave: 1
status: done
deps: []
agent: build_T001
base: f4fd11d6c93c913611009c43a72cca76573b09bb
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/trust-bypass-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/sanitizer-warning-capture.test.mjs
  - research/raw/m029-sanitizer-warning.json
---

# T001 — Record what the sanitizer warning and the profiler actually contain

## Context

M029 builds PBR-1: what the sanitizer stripped and which binding did it. The measured signal is one
dev-mode console warning naming nothing (`.project/research/m029-sanitizer-evidence.md`), so before any join
is designed the ordering of that warning against the profiler's binding events must be measured.

## Approach

Add a fixture page with two bindings: one whose `[innerHTML]` value the sanitizer strips, and one whose value
is safe. Capture both the console messages and the profiler's binding events with headless Playwright, and
record what each list contains and their relative order. The recording, not this task's prose, decides whether
T002's join is possible.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/trust-bypass-page.ts`
- `spikes/ng222-app/src/app/app.routes.ts`
- `scripts/sanitizer-warning-capture.test.mjs`
- `research/raw/m029-sanitizer-warning.json`

## Acceptance criteria

1. The recording holds both lists from one page load, with the strip warning present and no warning for the safe binding.
2. The recording states each list's ordering, with enough provenance (Chromium version, URL, timestamp) to be re-run.
3. A mutant reddens: removing the unsafe binding from the page leaves no warning in the recording (held-out E3).
4. A second mutant reddens: adding a warning by hand to the captured file breaks the recording's own consistency check.

## Verify

```bash
npm ci --include=dev; node --test scripts/sanitizer-warning-capture.test.mjs
```

## Intent coverage

- SC1

## Log

- dispatched
