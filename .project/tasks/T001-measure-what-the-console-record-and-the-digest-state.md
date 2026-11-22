---
id: T001
title: Measure what the console record and the digest state
wave: 1
status: done
deps: []
agent: build_T001
base: b3477d81797851c058799ac38ac3471c22e00ade
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

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

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
- Landed paths: `research/raw/m059-record-shapes.json`, `scripts/teardown-leak-shapes.test.mjs`.
- The record is `m059-record-shapes/v1`, 45,918 bytes, sha256 `0efe33a7…`, with seven verbatim commands and their outputs. `scripts/teardown-leak-shapes.test.mjs` is 13 tests on a default run and 14 on an armed one, and a default run writes no byte (held-out E9).
- `digest`: the `NG0205` entry is `{"code":"NG0205","title":"Injector has already been destroyed",…}` and `extension/error-digest.json` holds 64 codes / 64 entries at sha256 `426a5be1…`. What the installed build actually prints is derived from `_pending_tasks-chunk.mjs:1414`: `NG0205: Injector has already been destroyed.` — thrown by `Injector.get` on a destroyed injector, i.e. on a lookup, not on a plain write.
- `producible`: `not-produced`. The portal was driven at `/contract/list` (then `/home`, `/contract/list`, `/claim/list`, `/customer/list`, 38 console lines, 0 `NG0205`), and `spikes/ng222-app` at `/stale-view` destroyed by `ng.ɵnavigateByUrl(router,'/')` (4 console lines, all before the destroy, 0 `NG0205`). The missing observable is a page action in which a destroyed component performs a service lookup through its destroyed injector. No probe was run to manufacture the code (D7, R2), and no fixture was added.
- `absences`: `handleRecord` / `postDestroy` / `leakedHandle` are 0 / 0 / 0 across 38 `extension/*.js`, 136 `scripts/*.mjs` and 146 `research/raw/*.json`. `.unsubscribe(` sites are 3, not the 2 the intent's C1 states: `extension/agent-main.js:1858` (`uninstallRouterEvents`) and `:2435` (`uninstallStability`), both the agent's own, plus `scripts/stability-measure.test.mjs:315` (`CURRENCY`, a memoised fixture loader in a suite).
- Two plan assumptions did not hold and are corrected here rather than silently: the digest hash is pinned by `scripts/error-digest-content.test.mjs`'s `PINNED_DIGEST_SHA256`, not by `scripts/panel-copy.test.mjs` (no such file exists at this head), and a joined console message carries `text` with its level in `type`, not `message`.
