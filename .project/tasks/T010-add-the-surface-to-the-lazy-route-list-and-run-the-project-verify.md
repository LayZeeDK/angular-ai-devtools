---
id: T010
title: Add the surface to the lazy-route list and run the project verify
wave: 10
status: pending
deps: [T009]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T010 — Add the surface to the lazy-route list and run the project verify

## Goal

Repair the one lazy-route list that never gained the new surface, then run the project verify at this head and record it, so
the milestone can reach the final review with a green ledger.

## Context

T009's verify reached `test:app` for the first time in this milestone — every earlier run stopped at `npm test` leg 1 — and
found one failure that has been latent since T003:

```
apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts:740
expected [ 'interop', 'chat', 'picker', …(34) ] to deeply equal [ 'interop', 'chat', 'picker', …(33) ]
+ "outlet" after "console-read"
```

The same spec's full path list and its loader-map list both gained `outlet` at T003; the lazy-route list
(`loadComponent !== undefined`) did not. That is the only failing test in the whole verify.

## Approach

Add the surface to that list in the position the route table declares it. Then re-capture the stability record — a task Log
that names paths moves its mention count — and run the project verify. If the capture moves a value another record pins,
name it and stop rather than widening anything.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC4

## Acceptance criteria

1. SC4: the lazy-route list names every surface the route table declares, in the same order — a mutant that drops one reddens naming it — and the project verify builds before it measures, exits 0 and is recorded with its command verbatim.

## Verify

```bash
M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node --test scripts/gate-stability-record.test.mjs
```

## Log

- pending.
