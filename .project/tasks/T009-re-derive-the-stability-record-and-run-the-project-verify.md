---
id: T009
title: Re-derive the stability record and run the project verify
wave: 5
status: pending
deps: [T008]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m056-gate-stability.json
  - research/raw/m057-verdict-claims.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - extension/panel/index.html
---

# T009 — Re-derive the stability record and run the project verify

## Context

`research/raw/m056-gate-stability.json` is red at this head before any M057 byte (PLAN C5): measured
at plan time, `node --test scripts/gate-stability-record.test.mjs` is 6 of 8, naming
`archive.detail.plainRun.milestone: "M055" -> "M056"` and a predecessor range that moved when M055's
ship commit landed. It is the last record to derive because one of its values is a function of this
milestone's own task logs — the archive stage counts the mentions those logs carry — so it is written
after the last byte of prose this task appends and nothing is written after it but the verify.
`research/raw/m057-verdict-claims.json` is captured here too — first, before the stability record —
because this task runs the project verify, whose first leg reads it, and because the suites its claim
rows count are the ones the earlier waves landed.

## Approach

Run the two capture commands armed, in this order, reading back what each wrote before running the
next: the deriving suite for `research/raw/m057-verdict-claims.json`, so its claim rows carry the
test counts the landed suites hold; then `scripts/gate-stability-record.test.mjs` behind its own
environment flag for `research/raw/m056-gate-stability.json`. A second armed run of each changes no
byte. Nothing is transcribed by hand: both records are capture-owned, and a hand-written count is what
their suites exist to refuse.

Then run the project verify as the last action and re-derive nothing after it: the build first, so
`extension/panel/index.html` is the build's own output at this head and not an artifact older than the
sources it was built from; then `npm run check`, which carries the type checks, the skills gates, the
two archive stages and the formatting check over the whole tree; then `npm test`, which runs the node
suites, the app's unit tests and the held-out corpus; then the checkout that discards the
working-tree diff of the build artifact, so the head that ships holds the built bytes and no hand edit
of an artifact.

Declare `scripts/gate-stability-record.test.mjs` because it pins the stability record, and the two
gate suites because it is named by them (PLAN C4). Edit none of the three beyond the capture rows the
records need.

## Intent coverage

- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m056-gate-stability.json
- research/raw/m057-verdict-claims.json
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- extension/panel/index.html

## Acceptance criteria

1. The two records this milestone ships state the ordering as the named absence
   `no-write-record-no-order` beside the effect and its upstream nodes and name no write, no owner and
   no cause anywhere, so the absence survives the landing rather than being talked out of it in a
   record, and the project verify is green over a tree that states it (SC2).
2. `research/raw/m057-verdict-claims.json` and `research/raw/m056-gate-stability.json` are re-derived
   by their own capture commands in that order at the landed head, and a second armed run of each
   changes no byte.
3. The project verify — the build, then `npm run check`, then `npm test`, then the checkout of the
   build artifact — passes as the last action of the task, with nothing re-derived after it, and the
   built artifact is the build's own output at this head.

## Verify

```bash
npx prettier --check research/raw/m056-gate-stability.json research/raw/m057-verdict-claims.json && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- pending.
- Landed paths: `research/raw/m056-gate-stability.json`, `research/raw/m057-verdict-claims.json`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
