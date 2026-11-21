---
id: T001
title: Measure what the console record and the digest state
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m059-record-shapes.json
  - scripts/teardown-leak-shapes.test.mjs
---

# T001 — Measure what the console record and the digest state

## Goal

Establish, by measurement, what the agent's console record carries for a post-teardown write and whether
`NG0205` is producible at all on the portal or the existing fixture — so that T002 answers from a record
whose shape is stated rather than assumed, and so that a diagnostic which cannot be produced is recorded
as an absence rather than fabricated.

## Context

`research/raw/m045-console-shapes.json:192` and `:561` enumerate the digest's 64 codes including
`NG0205`, and no capture in `research/raw/` has ever produced it on a page. `extension/error-digest.json`
carries the entry `{"code": "NG0205", "title": "Injector has already been destroyed"}`. The console join
the panel already reads keeps code, body-with-stack-stripped and count (`extension/lint-core.js`,
`extension/console-join.js`). The handle record the roadmap's sentence names does not exist: `handleRecord`
and `postDestroy` occur zero times across `extension/*.js`, `scripts/*.mjs` and `research/raw/*.json`.

## Approach

1. Record the digest entry verbatim, with its hash and the file it sits in.
2. Record the console record's message shape from the captures already in `research/raw/` — which fields a
   message carries, whether the stack survives the join, and what identifies its source.
3. Drive the portal and, separately, `spikes/ng222-app`, and record whether a component that touches its
   injector after teardown emits `NG0205`. Record the portal route tried and, if nothing is produced, the
   exact observable that is missing. Do not add a fixture: a second leaking fixture is a fixture change
   that needs its own owner ruling (plan R2).
4. Record the absence counts: `handleRecord`/`postDestroy` in `extension/`, in `scripts/`, and in
   `research/raw/`; the two `.unsubscribe(` sites and whose they are.

The capture is armed (`M059_CAPTURE=1`); a default run reads the record and writes nothing.

## Interface contract

T001 publishes `research/raw/m059-record-shapes.json`, whose `digest` section names the `NG0205` entry
verbatim with the digest's hash, whose `message` section names the fields a console message carries after
the join (`code`, `body`, `count`, and whether a source or owner field exists), whose `producible` section
states whether a post-teardown touch emitted the diagnostic on the portal or on the fixture with the
route tried and the reason when it did not, and whose `absences` section states the handle record's
absence with its counts. T002's join may read only those fields; T003's pane renders only what the join
returns; T004's claims record cites `artefactPath` into this record.

## Intent coverage

- SC1
- SC6

## Acceptance criteria

1. The record exists and states, with a command and its output, each of: the digest entry, the message
   shape, producibility, and the absence counts.
2. The record names the code `NG0205` and the message body it would see, and names no subscription, effect
   or timer (plan D6).
3. The record states the reading is the agent's existing console subscription, with no new page-side
   instrumentation and no second tap, and satisfies held-out E9: a second default run writes no byte.
4. The produce-or-not measurement names the portal route tried and the observable that is missing when
   nothing was produced.

## Verify

```bash
node --test scripts/teardown-leak-shapes.test.mjs && npx prettier --check scripts/teardown-leak-shapes.test.mjs research/raw/m059-record-shapes.json && npm run check
```

## Log

- pending.
