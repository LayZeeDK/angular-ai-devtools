---
id: T002
title: Join the title record into four states, purely
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 218c2ad89af15490a9ecbdcfd026476b79fd76d6
worktree: null
task_branch: null
files:
- extension/title-input.js
- scripts/title-input.test.mjs
---

# T002 — Join the title record into four states, purely

## Context

T001 writes the title record this task joins. The shape is fixed by that
recording: per navigation, a strategy class name, the route's `data`, the titles observed, and the observation start.

The join's four states are the same four M064 used for its own record, so a reader learns one vocabulary rather than
two: `finding`, `agrees`, `cannot-tell` and `no-record`.

## Approach

A pure module, `extension/title-input.js`, exporting `titleInput(record, facts)`:

- `agrees` when the title the document carried equals the title the route implies and a strategy resolved.
- `finding` when the two differ, naming `strategy`, `documentTitle`, `impliedTitle` and `observedWrites`.
- `cannot-tell` with a reason when the difference cannot be attributed: `no-strategy`, `no-implied-title`,
  `observation-started-after-the-write`, `route-binds-nothing`.
- `no-record` when nothing was captured.

It reads nothing from the page, the clock or the console. The answer never names a writer, a cause or a remedy.

## Interface contract

`titleInput(record: object, facts: object) -> { state, strategy?, documentTitle?, impliedTitle?, observedWrites?, reason? }`

## Files

Every path this task may touch, and nothing else:

- `extension/title-input.js`
- `scripts/title-input.test.mjs`

## Acceptance criteria

1. A record whose document title differs from the route's implied title produces a `finding` naming both values
   and the strategy; a mutant that copies the route's title over the document's reddens it by name.
2. A record whose observation started after the last write reports `cannot-tell`/`observation-started-after-the-write`,
   and never promotes the current title to an observed write; a mutant that does reddens it.
3. A record for a route that binds nothing reports `cannot-tell`/`route-binds-nothing` rather than an empty object; the
   module's purity suite passes with `document`, `window` and `performance` undefined.

## Verify

```bash
node --test scripts/title-input.test.mjs && npx prettier --check extension/title-input.js scripts/title-input.test.mjs
```

## Intent coverage

- SC1, SC2, SC3

## Log

- scaffolded

- The join's precedence is `no-strategy → route-binds-nothing → no-implied-title → observation-started-after-the-write`,
  and that order is exported as `REASONS` rather than left implicit: on the portal every `route.titleDeclared` is `null`,
  so deciding `no-implied-title` first would contradict the measured answer that every navigation is `route-binds-nothing`.
- `facts` carries exactly one field, `impliedTitle` — the title a `Resolve<string>` route implies, which the recording
  cannot carry because T001 measured `titleDeclared: null` on every route. The document title is never taken from the
  caller; `author`, `basis`, `at` and `observation` are refused, so a second clock is never consulted and no writer is
  invented.
- A record whose navigations carry no title value at all (empty `titles`, or only blank values) has no token in the
  intent's closed reason set. This task answers `no-record` — nothing about the title was captured — and says so. If a
  fifth reason (`no-title-observed`) is wanted, that is a decision above this task rather than an inference taken here.
- **Defect found outside this task's files, not fixed here:** `scripts/chunk-failure-claims.test.mjs` fails 2 of its 14
  tests at this head. It reads `.project/intent/INTENT.md` and `.project/plan/PLAN.md` as live paths, and M064 archived
  those while M065 wrote new ones, so the suite judges M064's claims against M065's documents. It is declared in T003's
  `files:` (the pinned-file closure) and must be re-pointed at `.project/archive/064-*/` before the project verify can be
  green in T004; it is recorded here rather than repaired inside a task that does not own it.
- Landed paths: `extension/title-input.js`, `scripts/title-input.test.mjs` — each is read from this tree, ready.
