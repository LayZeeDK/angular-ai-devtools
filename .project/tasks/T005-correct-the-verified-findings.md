---
id: T005
title: Correct the three findings the wave-2 panel verified
wave: 3
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - research/raw/m022-ng-context.json
  - scripts/recording-consistency.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - extension/agent-main.test.mjs
  - extension/page-footprint.test.mjs
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/companion.spec.ts
---

# T005 — Correct the three findings the wave-2 panel verified

## Context

The wave-2 panel returned no blocking findings but three advisories, each verified by the adjudicator
(`.project/review/wave-2.cycle1.md`):

1. `extension/agent-main.js:667` and `:672` still answer `onpush` when the component metadata cannot be read, and
   `:916` serialises that answer as `changeDetection`. The consumer `update-cause-chain.ts:136-138` treats only
   `1`/`'eager'`/`'Eager'` as eager, so an unreadable component is silently classified as **not** eager and the eager
   branch is suppressed. Decision D2 claims this fail-open is corrected; it is corrected only in `extension/onpush-readiness.js`.
2. `research/raw/m022-ng-context.json` states `builds.development.bytes` as `2180767` while its own
   `reconciliation.note` still reads "at the same 2176374 bytes". The substance is true; the number is stale prose, which
   is why no test reddened.
3. `apps/angular-ai-devtools/src/app/panel-demo.ts` labels the sample component `DeclaredDefault`, while the recorded
   runtime name is `_DeclaredDefault` (`research/raw/m035-onpush-metadata.json`).

## Approach

Make the unreadable case say nothing rather than the best case; make the recording's prose agree with its own fields;
make the demo show the name the page reports. Add the check that would have caught finding 2 without a reviewer.

## Interface contract

None

## Files

- `extension/agent-main.js` — the two fail-open returns become `null`; nothing else changes.
- `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts` — a case proving `null` is not treated as eager.
- `research/raw/m022-ng-context.json` — the `reconciliation.note` states the measured value its own fields carry.
- `scripts/recording-consistency.test.mjs` — new: every byte count a recording mentions in prose must equal a byte count
  the same recording records.
- `apps/angular-ai-devtools/src/app/panel-demo.ts` — the sample component name matches the recorded runtime name.
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` — new: the demo facts name what the recordings name.

## Acceptance criteria

1. Held-out E2: with the metadata read withheld, `changeDetectionFor` returns `null`, not `onpush`, and the update-cause
   chain does not classify the component as eager — proved by a test that would fail on the old default.
2. `research/raw/m022-ng-context.json` mentions no byte count its own fields contradict; the consistency test fails on the
   current file before the fix and passes after.
3. `panel-demo.ts` names the component `_DeclaredDefault`, matching `research/raw/m035-onpush-metadata.json`.
4. `npm run check` and `npm test` pass at the head, and the gate row is recorded through `gsd verify-final`.

## Verify

```bash
node --experimental-strip-types --test "scripts/recording-consistency.test.mjs" && npx nx run angular-ai-devtools:test --skip-nx-cache && npm run check
```

## Intent coverage

- SC1
- SC5

## Log

- dispatched
