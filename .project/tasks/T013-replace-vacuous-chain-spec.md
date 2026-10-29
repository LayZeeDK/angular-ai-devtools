---
id: T013
title: Replace vacuous E2E chain assertion with real chain assertions
wave: 5
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/e2e/chain.spec.ts
---

# T013 — Replace vacuous E2E chain assertion with real chain assertions

## Context

M004 F3 (blocking): `spikes/ng222-app/e2e/chain.spec.ts:12` asserts only `expect(true).toBe(true)`. Remedy: replace with assertions that drive the real `click -> count -> double -> app-counter template` chain. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. N1 (SC2): do not make the suite green by deleting, skipping, or weakening a test.

## Approach

- Replace the placeholder assertion with assertions that drive the real chain `click -> count -> double -> app-counter template` through the panel/fixture.
- Keep the spec non-vacuous; do not weaken or skip tests (N1).
- No production code change; fixture test only.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `spikes/ng222-app/e2e/chain.spec.ts` no longer contains `expect(true).toBe(true)`.
2. The spec asserts the real `click -> count -> double -> app-counter template` chain.
3. The spec runs and passes under the project's E2E command.

## Verify

```bash
npm ci && node -e "const s=require('fs').readFileSync(process.argv[1],'utf8');if(/expect[(]true[)]\.toBe[(]true[)]/.test(s)){console.error('placeholder assertion is still present');process.exit(1);}if(!/click/.test(s)){console.error('the click step is not driven');process.exit(1);}if(!/chain/i.test(s)){console.error('the chain expectation is missing');process.exit(1);}" spikes/ng222-app/e2e/chain.spec.ts
```

Heavy: no

## Log

- created by planner