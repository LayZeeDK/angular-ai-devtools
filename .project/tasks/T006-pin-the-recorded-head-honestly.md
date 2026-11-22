---
id: T006
title: Pin the recorded head honestly
wave: 6
status: pending
deps: [T005]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/error-routing-shapes.test.mjs
  - research/raw/m060-record-shapes.json
  - scripts/copy-check.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/error-routing.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T006 — Pin the recorded head honestly

## Goal

The shapes record pins `head: 32b384b0`, the commit its armed capture ran at. The suite asserts that head equals
`git rev-parse HEAD`, so the record is stale the moment the next commit lands — two assertions redden at the ship
head although every measured section is byte-identical. The pin becomes honest: the recorded head must be a commit
this checkout can reach, not the head itself.

## Context

An armed capture cannot pin a future commit. `git merge-base --is-ancestor 32b384b0 HEAD` exits 0 at the ship head,
so the record is truthful and only the comparison rule is wrong. M059 met the same class and its suite accepts an
ancestor; this task adopts that shape and keeps the stricter property intact: the record must still agree with
itself (`commands[0].output === head`), and a head that is not reachable must still redden.

## Approach

Two assertion blocks in `scripts/error-routing-shapes.test.mjs`: the byte-identity check serialises with the
record's own head rather than `gitHead()`, and the head assertion resolves the sha with
`git rev-parse --verify <head>^{commit}` and requires `git merge-base --is-ancestor <head> HEAD` to exit 0. A mutant
supplies a real sha from another branch and must redden by name. The record itself is not edited.

## Interface contract

T001 publishes the record-shapes record: its records section lists the artefacts it measured and its inventory names the records outside the map with a why that cites the task; its producer section names the global error listener and the boundary entries with their limits; its absence section names phase-not-recorded with its counts. T002 publishes errorRouting(records) on globalThis.angularAiErrorRouting, taking { errors, boundaries, handler } and returning { state, message, code, owner, phase, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route error-routing in PANEL_SURFACES, the LOADERS key error-routing, the exported errorRoutingPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree, with the quotes and ruling sections the navigation census derives. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC1
- SC5

## Acceptance criteria

1. SC1: the record's head is accepted when it is an ancestor of HEAD and refused when it is not, proved by a mutant carrying a real sha from another branch that reddens naming the reachability rule.
2. SC5: the record still agrees with itself — `commands[0].output` equals `head` — and that assertion is untouched.
3. The record's bytes are unchanged: this task edits the suite only.

## Verify

```bash
node --test scripts/error-routing-shapes.test.mjs && npx prettier --check scripts/error-routing-shapes.test.mjs && npm run check
```

## Log

- pending.
