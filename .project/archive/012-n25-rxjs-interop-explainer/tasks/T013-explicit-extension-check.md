---
id: T013
title: Let the interop check assert an explicit extension directory
wave: 3
deps: [T005]
status: done
agent: build_T013
base: f22873eed84c65a52e7d374aee90c0af8482ce31
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/checks/interop.mjs
  - .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs
  - .commandcode/skills/control-ai-browsers/features/interop.md
  - .claude/skills/verify-ai-browsers/checks/interop.mjs
  - .claude/skills/verify-ai-browsers/checks/interop.test.mjs
  - .claude/skills/control-ai-browsers/features/interop.md
---

# T013 — Let the interop check assert an explicit extension directory

## Context

`interop.mjs` derives the extension it expects from its own file location
(`CHECKOUT_EXTENSION`), so a run from a GSD Path verify sidecar can never match an instance
started from the primary checkout, and the check reports `could-not-run`. Measured 2026-10-31:
`dispatch_driver.py finish` for T006 failed with exit 2 and that message from
the task-t006 verify sidecar.

## Approach

Expose `--extension <dir>` on the check's CLI and pass it through as `check()`'s existing
`extension` option (which `check()` and its tests already support). Document the flag in the
control feature contract, and keep the `.claude` copy byte-identical, since
the skills mirror test requires it.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `node .commandcode/skills/verify-ai-browsers/checks/interop.mjs --evidence <dir> --url <url> --extension <other dir> <instance>` exits 2 when the instance serves a different extension, and exits 0 when `--extension` names the instance's extension.
2. The check's own tests cover that case and pass.
3. `.claude/skills/verify-ai-browsers/` stays a byte copy of `.commandcode/skills/verify-ai-browsers/`.
4. The control feature contract documents the flag.

## Verify

```bash
node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs && node --test scripts/skills-mirror.test.mjs && echo retained .project/tasks/T013-explicit-extension-check.md
```

Heavy: none
Held-out: none

## Log

- pending
- build_T013: interop.mjs accepts --extension <dir>; 9/9 check tests pass; skills mirror parity holds; the control feature contract documents the flag
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T013): pass, exit 0; output tail:
  ```
  ✔ missingLimitTerms names every limit the panel left out, case-insensitively (0.1515ms)
  ℹ tests 9
  ℹ suites 0
  ℹ pass 9
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 428.3887
  ✔ .claude/skills/control-ai-browsers mirrors .commandcode/skills/control-ai-browsers (11.4288ms)
  ✔ .claude/skills/verify-ai-browsers mirrors .commandcode/skills/verify-ai-browsers (4.0702ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 231.8997
  retained .project/tasks/T013-explicit-extension-check.md
  ```
