---
id: T005
title: Re-derive this milestone's own records
wave: 5
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m061-record-shapes.json
  - research/raw/m061-verdict-claims.json
  - research/raw/m059-record-shapes.json
  - scripts/locale-correctness-shapes.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/recording-consistency.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/locale-correctness.test.mjs
  - scripts/panel-copy.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-answer.test.mjs
---

# T005 — Re-derive this milestone's own records

## Goal

Re-derive the three recordings this milestone’s suites derive — the record-shapes record, the verdict claims, and the
teardown record whose count this head moved — so each states what this tree carries, then leave the gate records and the
project verify to T006, which runs last.

## Context

Each recording is measured, never typed: the shapes record's word scan must exclude this milestone's own module and
suite, the claims record's `criterionText` must quote the intent character for character after its SC1 and SC2 were
restored, and the teardown record's `recordsSearched` must equal the count this head carries. The gate records stay
stale until T006 re-derives them at the final head, which is the point of a separate task.

## Approach

Run each capturing suite armed (`M061_CAPTURE=1`, `M044_CAPTURE=1`, `M059_CAPTURE=1`), then re-run each unarmed and
require no differing value. Where a suite refuses because the record predates this milestone, repair the record's own
scan to exclude the milestone's own files — never widen the assertion.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. SC1: this milestone’s own record counts the tree as it stood before this milestone’s modules — the word scan excludes `extension/locale-correctness.js` and the suite itself — so `codeHits` stays 0 while the module that names the locale token exists; a mutant that adds the module back to the scan reddens by name.
2. SC3: the claims record is re-captured after the intent’s SC1 and SC2 were restored, so each `criterionText` still quotes the intent character for character and `criterionCharacters` equals its length; a mutant one character short reddens by criterion id.
3. SC1: the teardown record states the record count this head carries, so its suite is green here rather than counting a tree two records smaller.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/navigation-blocking.test.mjs && M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && M061_CAPTURE=1 node --test scripts/locale-correctness-shapes.test.mjs && node --test scripts/navigation-blocking.test.mjs scripts/teardown-leak-shapes.test.mjs scripts/locale-correctness-shapes.test.mjs && node --test scripts/tutor-record-shapes.test.mjs scripts/recording-consistency.test.mjs && npx prettier --check research/raw/m061-record-shapes.json research/raw/m061-verdict-claims.json research/raw/m059-record-shapes.json
```

## Log

- pending.
