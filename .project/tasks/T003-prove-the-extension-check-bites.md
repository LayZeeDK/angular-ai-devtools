---
id: T003
title: Prove the extension check bites
wave: 1
deps: [T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/extension-typecheck.test.mjs
---

# T003 — Prove the extension check bites

## Context

T001 and T002 make the check green. A check that cannot fail is the defect this
programme spent M023 repairing, so the check itself needs a proof.

## Approach

1. Add `scripts/extension-typecheck.test.mjs` driving `tsc -p extension/tsconfig.json` in a temporary
   copy of the tree.
2. Prove a wrong property in an authored source exits non-zero and names that file.
3. Prove an error placed inside `extension/panel/` leaves the check green — the exclusion is the generated
   directory and nothing wider.
4. Prove a directory with no JavaScript reports no errors rather than failing to start.
5. Assert the config's `strict` is `false` and its header states the gap.

## Interface contract

None

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. A wrong property in an extension source reddens the check and names the file (held-out E1).
2. An error inside `extension/panel/` leaves it green (held-out E2).
3. The config's `strict` is `false` and the header records why (held-out E4, SC4).
4. An empty directory reports no errors rather than failing (held-out E3).
5. Each behaviour has a mutant that reddens it, with the failure text in the Log.

## Verify

```bash
npm ci --include=dev; node --test scripts/extension-typecheck.test.mjs
```

## Log

- opened by orchestrator in wave 1
