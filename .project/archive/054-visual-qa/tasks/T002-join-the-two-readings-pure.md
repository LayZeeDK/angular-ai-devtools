---
id: T002
title: Join the computed and baseline readings pure
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 2c6065ca41a52037a877acf0364138558d5e580f
worktree: null
task_branch: null
files:
  - extension/visual-qa.js
  - scripts/visual-qa-style.test.mjs
  - research/raw/m054-style-read.json
---

# T002 — Join the computed and baseline readings pure

## Context

T001's recording (`research/raw/m054-style-read.json`) declares the property list and carries the
live readings; the join turns that answer into the one record a surface can render — rows with both
side labels, or one of three named absences — and invents nothing. It is pure so node-side mutants
can reddens every way the report could lie, and so the surface (T003) renders it without restating
its rules as a computation.

## Approach

Build `extension/visual-qa.js`: a pure join `styleReport(measurement)` on
`globalThis.angularAiVisualQa`, taking T001's measurement answer — the located document, the element
asked for, the per-property readings — and returning `{ state, element, rows, reason }`, where
`state` is `measured`, `no-such-element`, `no-document` or `no-baseline`.

A `measured` row names the property exactly as the measurement wrote it — never folded, trimmed or
matched as a prefix (E1) — and carries each value verbatim under its own side label: a computed
reading the browser serialised differently from the stylesheet's declaration is not normalised into
the declaration's spelling to make a row match (E2), and a stylesheet declaration is never labelled
as the computed reading (N2). The absences are three and distinct (E3): a document the reading
reached that renders no element under the requested name answers `no-such-element` naming the
reading that located the document beside the absence — never `no-reachable-document` (E4, held
out); a document the panel cannot read answers `no-document`; a measured property the stylesheet
declares nothing for answers `no-baseline` naming the property. An absence never renders as a row
of matching readings (N3), no value is filled from a source the measurement did not produce (N4),
and a run that measured nothing answers no rows on a second run either (E5). The join touches no
DOM, calls no `getComputedStyle`, dispatches no message, performs no network call and imports
nothing at runtime.

`scripts/visual-qa-style.test.mjs` pins the module, then mutates, each mutant with its own anchor
assertion: a property hidden from the report, one value printed for both sides, a stylesheet
declaration labelled as the computed reading, an absence rendered as a row of matching readings, a
wrong absence named (`no-reachable-document` for a reached document among them), placeholder values
for a measurement that did not run, a name folded/trimmed/prefix-matched, a value normalised into
the declaration's spelling, and a join that refuses every input — a surface that always refuses is
not a surface. Purity is asserted with `document`, `fetch` and `Date` armed as traps. This task
owns held-out E4.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact. The file changes only through
`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

  - extension/visual-qa.js
  - scripts/visual-qa-style.test.mjs

## Acceptance criteria

1. `measured` renders one row per declared property, the row naming the property as the measurement
   wrote it and carrying both readings verbatim under their own side labels; a mutant that hides a
   measured property, prints one value for both sides, or labels a stylesheet declaration as the
   computed reading reddens.
2. A mutant that folds, trims or prefix-matches a property name, or normalises a computed value
   into the declaration's spelling, reddens.
3. The three absences are distinct states, each naming which absence holds: a mutant that renders
   an absence as a row of matching readings or names a wrong absence reddens.
4. A run that measured nothing answers no rows, and a mutant that renders rows or placeholder
   values for a measurement that did not run reddens; a join that refuses every input reddens.
5. Held-out E4: a document the reading reached that renders no element under the requested name
   answers `no-such-element`, naming the reading that located the document beside the absence —
   never `no-reachable-document` — and the same suite asserts the no-document case, so one absence
   cannot collapse into the other.

## Verify

```bash
node --test scripts/visual-qa-style.test.mjs && npx prettier --check extension/visual-qa.js scripts/visual-qa-style.test.mjs
```

## Log

- pending.
- Landed paths: `extension/visual-qa.js`, `scripts/visual-qa-style.test.mjs`, `research/raw/m054-style-read.json` — each is read from this tree, ready.
