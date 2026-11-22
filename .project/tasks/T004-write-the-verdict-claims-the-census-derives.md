---
id: T004
title: Write the verdict claims the census derives
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m061-verdict-claims.json
  - scripts/navigation-blocking.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
---

# T004 — Write the verdict claims the census derives

## Goal

Write the claims record with the `quotes` and `ruling` sections the navigation census derives, each claim re-derived against the tree.

## Context

D5 fixes the two sections; the census reads them and a missing section reddens. The record cites artefacts by `artefactPath`, and every citation must be re-resolvable by searching the file for the quoted line.

## Approach

Write `research/raw/m061-verdict-claims.json` with one claim per surface sentence and per measured absence, each carrying `artefactPath`, `quote` and `ruling`. Re-run the navigation census and the claims census, fixing the census wiring if the new map changes the outside-the-map count.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. SC1: every claim cites the artefact it rests on and re-derives against the tree; a mutant whose quote no longer matches reddens by claim id.
2. SC3: the claims name no page read and no second provider read; a mutant claiming a DOM read reddens.

## Verify

```bash
node --test scripts/navigation-blocking.test.mjs scripts/tutor-answer.test.mjs && npx prettier --check research/raw/m061-verdict-claims.json
```

## Log

- pending.
