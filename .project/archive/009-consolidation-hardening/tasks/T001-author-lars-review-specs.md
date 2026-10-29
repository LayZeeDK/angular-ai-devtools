---
id: T001
title: Author lars-review specifications for M001-M007
wave: 1
deps: []
status: done
agent: build_T001
base: f3d82bb2644903a6e438e5a04ba85b67e9693a23
worktree: null
task_branch: null
files:
  - .project/review/specs/m001.md
  - .project/review/specs/m002.md
  - .project/review/specs/m003.md
  - .project/review/specs/m004.md
  - .project/review/specs/m005.md
  - .project/review/specs/m006.md
  - .project/review/specs/m007.md
  - tests/held-out/e10-spec-present.test.mjs
---

# T001 — Author lars-review specifications for M001-M007

## Context

M009 SC7 requires one `lars-review` specification per shipped milestone M001-M007, each with a frozen base..head range, file scope, focus areas, and acceptance. The frozen ranges are fixed in the milestone facts (M001..M007 `base..head` commits). M002 has no product diff and still needs a spec with a written "no product code" focus (E10). `lars-review` is read-only and needs a clean product worktree (E12).

## Approach

- Write one spec per milestone under `.project/review/specs/`, named by milestone. Each spec opens with its frozen `base..head` SHAs, the files it covers, focus areas, and acceptance. Never write a spec from memory: every range comes from the milestone facts table.
- N7 (SC7): each spec opens with its base..head SHAs and the files it covers.
- E10: M002's spec still gets a frozen range and a written "no product code" focus.
- Do not edit product code. Specs are the only output of this task.
- Held-out E10: a milestone with no product diff still gets a specification; the test asserts all seven spec files exist with a frozen range line.

## Interface contract

None

## Intent coverage

- SC7

## Acceptance criteria

1. Seven spec files exist under `.project/review/specs/` (m001.md through m007.md).
2. Each spec's first section names its frozen `base..head` SHAs exactly as in the milestone facts table.
3. Each spec lists file scope, focus areas, and acceptance criteria.
4. M002's spec states "no product code" in its focus.
5. The held-out E10 test `tests/held-out/e10-spec-present.test.mjs` passes, stating E10's ruling: a milestone with no product diff (M002) still gets a specification with its frozen range and a written "no product code" focus.

## Verify

```bash
node --test tests/held-out/e10-spec-present.test.mjs
```

Heavy: no

## Log

- created by planner
- 2026-10-28 — T001 complete. Wrote 7 specs under .project/review/specs/ and tests/held-out/e10-spec-present.test.mjs. Command: node --test tests/held-out/e10-spec-present.test.mjs → tests 8, pass 8, fail 0, skipped 0, todo 0. ready
- 2026-10-28 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): pass, exit 0; output tail:
  ```
  ✔ m001.md exists with frozen range (1.6312ms)
  ✔ m002.md exists with frozen range (0.2993ms)
  ✔ m003.md exists with frozen range (0.2305ms)
  ✔ m004.md exists with frozen range (0.2245ms)
  ✔ m005.md exists with frozen range (0.9299ms)
  ✔ m006.md exists with frozen range (0.3619ms)
  ✔ m007.md exists with frozen range (0.2141ms)
  ✔ m002 states no product code (0.1964ms)
  ℹ tests 8
  ℹ suites 0
  ℹ pass 8
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 145.3605
  ```
