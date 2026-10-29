---
id: T005
title: Retire spikes/s1-extension after its evidence is archived
wave: 2
deps: []
status: done
agent: build_T005
base: 4f2ad05b61f750b920901f3d45a1674ed92a8f59
worktree: null
task_branch: null
files:
  - spikes/s1-extension
  - tests/held-out/e7-archive-order.test.mjs
  - tests/held-out/e8-fixtures-retained.test.mjs
  - .gitignore
  - docs/feature-proposals.md
  - plans/angular-ai-devtools-proposals.handoff.md
  - research/11-spike-s1-extension-contexts.md
  - research/15-deterministic-and-ai.md
  - research/17-vitest-browser-runtime.md
  - .commandcode/skills/control-vitest-browser-angular/features/extension-in-tester.md
  - .claude/skills/control-vitest-browser-angular/features/extension-in-tester.md
---

# T005 — Retire spikes/s1-extension after its evidence is archived

## Context

SC5: unused spike trees are retired only after their evidence is archived, with no in-repo reference left broken. E7: a spike tree is retired only in a commit that follows the commit archiving its evidence (archive commit is an ancestor of the retirement commit). E8: `spikes/ng222-app` and `spikes/ng222-ssr` are never retired (charter keeps both as fixtures). Evidence for `spikes/s1-extension` is already archived (archive 001 in git history). N4 (SC5): do not retire a spike tree before its evidence is archived, or leave a broken in-repo reference.

## Approach

- First verify no test, script, or doc references `spikes/s1-extension` (grep sweep); record the result in the Log.
- Retire `spikes/s1-extension` only after confirming the archive commit is an ancestor of the retirement commit (E7).
- Never retire `spikes/ng222-app` or `spikes/ng222-ssr` (E8); keep `spikes/probes`.
- Update any reference that did exist (none expected) so no in-repo reference is left broken.
- Held-out E7 test asserts the archive commit is an ancestor of the retirement commit; E8 test asserts both ng222 fixtures still exist.

## Interface contract

None

## Intent coverage

- SC5

## Acceptance criteria

1. `spikes/s1-extension` is removed.
2. `spikes/ng222-app` and `spikes/ng222-ssr` still exist.
3. No test, script, or doc references `spikes/s1-extension`.
4. The archive commit for its evidence is an ancestor of the retirement commit (E7).
5. The held-out E7 test proves the evidence-archiving commit is an ancestor of the retirement commit, and the held-out E8 test proves `spikes/ng222-app` and `spikes/ng222-ssr` still exist.

## Verify

```bash
node --test tests/held-out/e7-archive-order.test.mjs tests/held-out/e8-fixtures-retained.test.mjs
```

Heavy: no

## Log

- created by planner
- implemented: removed spikes/s1-extension; rewrote references in declared docs; archive commit a24cedb6317481c8bf72b1e98a0f0c76b3119c60 is ancestor of HEAD (verified); grep sweep (excluding .git and .project/archive) shows only .project metadata and tests referencing path; tests 2/2 pass. ready
- 2026-10-28 — orchestrator Verify (isolate gsd-path-task/T005): pass, exit 0; output tail:
  ```
  ✔ E7: archive commit is an ancestor of HEAD and spike tree is gone (182.495ms)
  ✔ E8: ng222 fixtures and probes remain (1.7417ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 335.155
  ```
