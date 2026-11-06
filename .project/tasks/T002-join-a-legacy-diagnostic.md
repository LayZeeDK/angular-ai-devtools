---
id: T002
title: Join a component's structure to the modern form
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/legacy-structure.js
  - scripts/legacy-structure.test.mjs
  - scripts/legacy-equivalents-capture.test.mjs
  - research/raw/m034-equivalents.json
  - extension/page-footprint.test.mjs
---

# T002 — Join a component's structure to the modern form

## Context

T001 closed the diagnostic route: `NG6100` reaches the dev server's output and never the page console, so there is no
captured diagnostic for a page-side panel to join. The intent's delegated ruling re-scopes this milestone to the legacy
axis the page does show — a component declared in an NgModule rather than standalone — and requires the modern form to be
quoted from a cited table rather than composed.

The temptation this task must resist is the same one every milestone here has policed: writing a plausible modern form
from memory. A migration guide is data, and data that was never fetched is a guess wearing a citation.

## Approach

Read `ɵcmp.standalone` off the selected component's type. When it is false, the finding names the component and states
that it is NgModule-declared, and carries the modern form from `research/raw/m034-equivalents.json` — every entry of
which holds the URL it came from, a verbatim quote, and the instant it was retrieved. When the component is already
standalone, or its metadata cannot be read, the module answers `cannot-tell` with its reason and names no modern form.

## Interface contract

`legacyStructure(fact, equivalents) -> { state: "finding" | "cannot-tell", component?, structure?, modernForm?, source?, reason? }` — pure, no DOM.

## Files

- `extension/legacy-structure.js` — the join
- `scripts/legacy-structure.test.mjs` — its tests and mutants
- `scripts/legacy-equivalents-capture.test.mjs` — the cited table's capture and its shape checks
- `research/raw/m034-equivalents.json` — the recording
- `extension/page-footprint.test.mjs` — the extension footprint pin this task stales

## Acceptance criteria

1. Held-out E1: a selected component whose `ɵcmp.standalone` is false produces a finding naming the component and stating that it is NgModule-declared, with the modern form and its source taken from the equivalents table.
2. A component that is already standalone produces `cannot-tell` with reason `already-standalone`, and names no modern form.
3. Held-out E3: a component whose metadata cannot be read produces `cannot-tell` with reason `metadata-unreadable`, and names neither structure nor form.
4. Held-out E2: with the metadata read removed the module produces no finding; it never infers structure from a component's name, file path or selector.
5. Every equivalents entry carries a URL, a verbatim quote and its retrieval time; a capture writes nothing unless `M034_EQUIV_CAPTURE=1`, and two default runs leave `git status --porcelain` unchanged.
6. A mutant that renders a modern form no entry sources reddens by name, with the unmutated module pinned first.
7. The module reads no clock, no console and no DOM.

## Verify

```bash
node --experimental-strip-types --test "scripts/legacy-structure.test.mjs" "scripts/legacy-equivalents-capture.test.mjs"
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
