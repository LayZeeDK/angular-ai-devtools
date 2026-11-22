---
id: T001
title: Measure the provider record and the formatter the page carries
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/locale-correctness-shapes.test.mjs
  - research/raw/m061-record-shapes.json
---

# T001 — Measure the provider record and the formatter the page carries

## Goal

Capture what the injector walk actually states for a page that provides a non-default `LOCALE_ID` — the token name, the provider kind and the import path — and whether any record names a formatter at all, into one record that is also the census map, pinned by its own suite.

## Context

C1 says the provider entry is the observable; C4 says the value is discarded at `agent-main.js:1182-1185`. R2 says no record names a formatter today. This task measures all three claims rather than repeating them, and its record becomes the census map the record-shapes census reads.

## Approach

Read `extension/agent-main.js:1149-1223` and reduce the provider entries a fixture with a non-default `LOCALE_ID` produces; search every record under `research/raw/` for a formatter field. Write `research/raw/m061-record-shapes.json` with `records[]`, `inventory.outsideTheMap`, `producer` and `absence` sections, then pin it with `scripts/locale-correctness-shapes.test.mjs`.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. SC1: the record names the `LOCALE_ID` provider entry as the tree derives it — token, kind, import path — and reports the value as `locale-value-not-recorded`, proved by a mutant that matches the entry by position and reddens by name.
2. SC3: the record counts the injector walk as the only provider read and states that no second read was added; a mutant that adds a read reddens.

## Verify

```bash
node --test scripts/locale-correctness-shapes.test.mjs && npx prettier --check scripts/locale-correctness-shapes.test.mjs research/raw/m061-record-shapes.json
```

## Log

- pending.
