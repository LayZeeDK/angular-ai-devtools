---
id: T003
title: Extend stale-view-fixture.ts with toSignal and subject.error effect
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/stale-view-fixture.ts
---

# T003 — Extend stale-view-fixture.ts with toSignal and subject.error effect

## Context

SC1 is witnessed on the counter fixture's dev-only route. The existing `stale-view-fixture.ts` already carries the N24 stale-view finding (a plain field written inside `subscribe`). Extend it so a `toSignal` source/state node and an unlabelled effect whose `debuggableFn` contains `subject.error` both exist on the same served page, while keeping the existing subscribe block intact so the N24 finding still fires.

## Approach

- Import `toSignal` from `@angular/core/rxjs-interop`, plus `effect` and `inject` as needed, and `Subject` (already imported).
- Add `signal = toSignal(this.updates)` (or equivalent field) so a `toSignal.source`/`toSignal.state` node exists.
- Add an `effect(() => { this.updates.error(new Error('interop')); })` in the constructor so an unlabelled effect whose `debuggableFn` source contains `subject.error` exists.
- Retain the existing `this.updates.subscribe((next) => { this.value = next; })` block unchanged so the N24 stale-view finding stays intact.
- Do not change any other fixture file or route; the verify check drives a single served URL.
- Do not modify insurance-portal source.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. The fixture imports `toSignal` and declares a `toSignal(this.updates)` field.
2. The fixture's constructor contains an effect calling `this.updates.error(...)`.
3. The existing `this.updates.subscribe(...)` block and `value` field remain, so the N24 stale-view finding still fires on the same route.
4. No other fixture or route file is changed; the insurance portal is untouched.

## Verify

```bash
npm run check && node -e "require('fs').readFileSync(process.argv[1])" spikes/ng222-app/src/app/stale-view-fixture.ts
```

Heavy: no

## Log

- pending