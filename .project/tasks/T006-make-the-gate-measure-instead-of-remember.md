---
id: T006
title: Make the gate measure instead of remember
wave: 4
status: in-progress
deps: []
agent: paid-deepseek-v4-1-flash-high
base: 88433d23ed91614c41dd2d19ba1c8e237df796ff
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
  - apps/angular-ai-devtools/src/app/update-cause-chain.ts
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - scripts/recording-consistency.test.mjs
  - nx.json
---

# T006 — Make the gate measure instead of remember

## Context

The wave-3 panel returned no blocking findings but four advisories, each verified by the adjudicator
(`.project/review/wave-3.cycle1.md`):

1. `extension/agent-main.js:1273` hardcodes `changeDetection: 'onpush'` in `dispatchInitialRecord` — a strategy asserted
   without any metadata read, one function below the `return null` correction T005 made for exactly this reason.
2. `apps/angular-ai-devtools/src/app/update-cause-chain.ts:13` types the field `changeDetection?: number | string`, so the
   type excludes the `null` the wire now legitimately carries.
3. `scripts/recording-consistency.test.mjs`'s header claims it stops prose drift generally; it stops `N bytes`-shaped byte
   counts in `research/raw/*.json` only.
4. `nx.json` declares `"cache": true` for `@angular/build:unit-test`, so `npm test` can replay app-test results.
   `tests/held-out/e3-zero-skipped.test.mjs:20-21` counts `ℹ pass` blocks, so a warm cache reddens a gate over a green tree.

Advisory 4 is the one that matters beyond this milestone: a verification gate that replays remembered results is not a
gate. Advisory 1 is the milestone's own thesis refusing to be applied consistently.

## Approach

Make the initial record say what was read rather than the best case; let the type admit the wire; make the header state
its real scope; and stop the unit-test target replaying cached results so `npm test` measures every time it runs.

## Interface contract

None

## Files

- `extension/agent-main.js` — the initial record's `changeDetection` becomes `null`, matching `changeDetectionFor`'s
  unread answer.
- `extension/agent-main.test.mjs` — a case pinning `null` in the initial record, and one showing the old value reddens it.
- `apps/angular-ai-devtools/src/app/update-cause-chain.ts` — the field's type admits `null`.
- `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts` — a case proving a `null` strategy still yields
  `no signal cause` rather than an eager claim.
- `scripts/recording-consistency.test.mjs` — the header states its scope: `N bytes` counts in `research/raw/*.json`, and
  what is outside it.
- `nx.json` — `@angular/build:unit-test` no longer caches.

## Acceptance criteria

1. Held-out E2: the initial record carries `changeDetection: null`, and restoring `'onpush'` reddens a named test.
2. `update-cause-chain.ts`'s field type includes `null`, and `npm run check` stays green.
3. The consistency test's header names what it does not check.
4. `npm test` executes the app suite on every run: after `npm test` populates the cache, a second `npm test` reports the
   same `ℹ pass` blocks as the first, and `tests/held-out/e3-zero-skipped.test.mjs` passes twice in a row without clearing
   anything.

## Verify

```bash
node --experimental-strip-types --test "extension/agent-main.test.mjs" && npx nx run angular-ai-devtools:test --skip-nx-cache && npm run check
```

## Intent coverage

- SC1
- SC5

## Log

- dispatched
