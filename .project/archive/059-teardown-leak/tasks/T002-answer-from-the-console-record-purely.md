---
id: T002
title: Answer from the console record, purely
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 551c999b492ec2a784941af54a36bae9742b4d35
worktree: null
task_branch: null
files:
  - extension/teardown-leak.js
  - scripts/teardown-leak.test.mjs
---

# T002 — Answer from the console record, purely

## Goal

The join that answers why a destroyed component still changes state, as a pure function of the console
record `T001` measured: it names the code, the message body and — only where the record attributes one —
the owner, and it names `owner-not-in-the-message` and `handle-record-not-held` as its own states.

## Context

The record states 64 digest codes including `NG0205`, a console message carrying code, body and count,
and no per-injector handle anywhere. The join therefore cannot name a subscription, and must say so
instead of inferring one. Its shape follows the two lessons the panel's other joins earned: `cannot-tell`
is reserved for a record that does not state the thing, and no field is invented (the M031 `cannot-tell`
remedy and the M032 stack-stripping rule).

## Approach

`extension/teardown-leak.js` exports `teardownLeak(records)` on `globalThis.angularAiTeardownLeak`, taking
`{ console, digest }` and returning `{ state, code, message, owner, absences, claims, detail }` with every
field present in every state. `state` is `finding` when the record carries an `NG0205` message, `absent`
when it carries none, `cannot-tell` when the record does not state what it was asked, and `empty` with no
record at all. `owner` stays `null` unless a field of the message carries it. `absences` lists
`owner-not-in-the-message` and `handle-record-not-held` as separate entries. `claims[]` entries carry
`artefactPath`.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5

## Acceptance criteria

1. SC1: a record carrying `NG0205` yields `state: 'finding'` naming the code and the body; a message with
   no owner field yields `owner: null` and the absence `owner-not-in-the-message`; a mutant that
   suppresses the code match, and a mutant that attributes the message to the last component seen, redden
   naming the defect.
2. SC2: the join reads only its `records` argument and touches no global, no page and no clock; a mutant
   that reads a live page value reddens.
3. SC3: a record that states a released handle before the diagnostic renders the sequence and names no
   handle as the cause; a mutant that renders "leaked subscription" for a released handle reddens.
4. SC4: every answer carries `handle-record-not-held`, and no answer states a subscription, effect or
   timer name; a mutant that renders a handle name reddens — held-out E5 asserts the two absences stay two
   states.
5. SC5: the returned object carries every stated field in every state, and each `claims[]` entry carries
   `artefactPath`; a mutant that drops a field reddens — held-out E2 asserts an empty record is a named
   absence naming the code searched for and the count read, never "no leak found".

## Verify

```bash
node --test scripts/teardown-leak.test.mjs && npx prettier --check extension/teardown-leak.js scripts/teardown-leak.test.mjs && npm run check
```

## Log

- pending.
- Landed paths: `extension/teardown-leak.js`, `scripts/teardown-leak.test.mjs`.
- `teardownLeak(records)` publishes on `globalThis.angularAiTeardownLeak` and returns `{ state, code, message, owner, absences, claims, detail }` in all four states — `finding`, `absent`, `cannot-tell`, `empty` — with all seven fields present in each and `handle-record-not-held` standing in every one of them. Seven `cannot-tell` reasons are named, and `owner` is filled only from a message's own `owner` field, which no shipped capture writes, so a measured record always renders `owner-not-in-the-message` beside the code.
- `scripts/teardown-leak.test.mjs` is 18 tests: one per acceptance criterion, the two held-out rows with the plan's titles, and seven mutant blocks that pin the shipped answer first and then name the defect by string — the code suppression, the last-component attribution, the leaked-subscription rendering for a released handle, a dropped field, a live page read, the two absences folded into one, and the body read from `message` instead of `text`.
- `npm run check` exit 0, every leg green at this head.
- Known drift, named rather than hidden: `scripts/teardown-leak-shapes.test.mjs` (T001's own suite) counts `extension/*.js` and `scripts/*.mjs` on disk and excludes only T001's two files, so this landing moves its `filesSearched` 38 → 39 and 136 → 137 and three of its tests fail. The occurrence counts stay 0, so the milestone's central claim holds; the counts and the derived verdict sentence need a repair task that owns both T001 artefacts, because they sit outside this task's `files:`.
