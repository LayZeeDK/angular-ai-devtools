---
id: T003
title: Remove vacuous regression spec and land non-vacuous regression gate
wave: 2
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/regression.spec.ts
  - tests/held-out/e3-zero-skipped.test.mjs
  - tests/held-out/e4-idempotent-checks.test.mjs
---

# T003 — Remove vacuous regression spec and land non-vacuous regression gate

## Context

`src/regression.spec.ts` contains a single vacuous test (`expect(true).toBe(true)`). INTENT.md Corrections (2026-10-28) require removing it rather than repairing it. SC2 requires `npm run check` and `npm test` to pass with zero skipped and zero todo tests and the skills-mirror parity test to pass. E3: zero skipped/todo tests; E4: running `npm run check` and `npm test` twice yields the same pass counts and leaves tracked files unchanged.

## Approach

- Delete `src/regression.spec.ts`; do not replace it with another vacuous placeholder. Removal is recorded with the accepted reason (Correction 2026-10-28).
- N1 (SC2): do not make the suite green by deleting, skipping, or weakening a test. The only removal is the vacuous placeholder named in the Correction, with its reason recorded in the Log.
- Add held-out tests `tests/held-out/e3-zero-skipped.test.mjs` (asserts `npm test` reports 0 skipped and 0 todo) and `tests/held-out/e4-idempotent-checks.test.mjs` (asserts two consecutive `npm run check` + `npm test` runs yield identical pass counts and no tracked-file changes).
- Verify the full project gate passes in a fresh sidecar.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `src/regression.spec.ts` is deleted and no reference to it remains.
2. `npm run check` exits 0 and `npm test` passes with 0 skipped and 0 todo.
3. The skills-mirror parity test passes.
4. The held-out E3 test proves `npm test` reports 0 skipped and 0 todo, and the held-out E4 test proves two consecutive `npm run check` + `npm test` runs yield the same pass counts and leave tracked files unchanged.
5. Two consecutive full runs leave tracked files unchanged (E4).

## Verify

```bash
npm ci && npm test && node --test tests/held-out/e3-zero-skipped.test.mjs tests/held-out/e4-idempotent-checks.test.mjs
```

Heavy: yes

## Log

- created by planner