---
id: T003
title: Wire the checks into the gate and repair the ended-navigation terminal
wave: 3
deps:
  - T002
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - package.json
  - scripts/panel-typecheck-scope.test.mjs
  - scripts/gate-integrity.mjs
  - extension/navigation-narrator.js
  - scripts/navigation-blocking.test.mjs
  - research/raw/m041-navigation.json
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - extension/agent-main.test.mjs
  - packages/ai-devtools-companion/test/facade.test.mjs
  - scripts/error-boundary-measure.test.mjs
  - scripts/facade-dev-build.test.mjs
  - scripts/error-boundary-capture.test.mjs
  - scripts/field-state-capture.test.mjs
  - scripts/held-out-nested-run.test.mjs
  - scripts/legacy-diagnostic-capture.test.mjs
  - scripts/linked-state-capture.test.mjs
---

# T003 — Wire the checks into the gate and repair the ended-navigation terminal

## Context

A check that only prints is the defect this milestone removes, so both checks become stages of the project's own verify chain, and the pin that asserts that chain's stages is re-cut in the same change. The repair is narrow: `extension/navigation-narrator.js:459` records a terminal only when the navigation is `OPEN`, and a same-URL `NavigationSkipped` reuses the previous id, so the entry arrives for a navigation that has ended and is discarded. The risk is double-reporting, so the pin carries an ended id, an unknown id and a live navigation whose single terminal must not change.

## Approach

- Add both checks as stages of the verify chain in `package.json` and re-cut `scripts/panel-typecheck-scope.test.mjs` so the stage names and count carry them.
- Record a terminal for an entry addressing an id whose navigation has ended, producing a finding that names the skipped navigation, while a live navigation still produces exactly one terminal.
- Feed the pin from the event list read out of `research/raw/m041-navigation.json`, so a hand-built list cannot satisfy it.

## Interface contract

The gate surfaces `checkArchivePaths({ root, milestone })` and `checkFixRecord({ root, range, tasks })`, each returning `{ examined, findings[] }` where a finding carries `file`, `line`, `claim` and `class`, and `nothing-examined` is a finding rather than a pass. T001's record carries the same shapes as data: `archiveReferences[]`, `fixRecord` and `skippedNavigations[]`, each with `examined` and `command`. The narrator's finding for an ended id carries the navigation id, the url and the word the record uses for the skip, and names no cause, owner or intent the entry does not carry. The claims file cites one artefact per criterion, each artefact a path plus the reading it carries.

## Intent coverage

- SC3
- SC4

## Edges

- E6
- E7
- E8
- E10

## Acceptance criteria

1. held-out E6 — AC1 both checks run as stages of the verify chain and the scope pin carries them, proven by deleting one stage and observing the pin redden naming that stage.
2. held-out E6 — AC2 a red check reaches the gate as a refusal: the gate exits non-zero naming the file on a fixture resolving an archived-then-deleted path, and exits zero on this milestone's own tree.
3. held-out E7 — AC3 an entry addressing an already-ended id produces a finding naming the skipped navigation, and a navigation that ends normally still produces exactly one terminal.
4. held-out E8 and E10 — AC4 the pin reads its event list from `research/raw/m041-navigation.json`, so a mutation reordering the recording reddens it and a list rebuilt in the test cannot satisfy it — both failure strings quoted in the Log.
5. held-out E6 — AC5 `package.json` is pinned by many suites that assert parts of the verify chain, and this task changes it; the full `npm test` runs after the wiring and every suite that reddens on the new stages is re-cut in this task, with the file named in the Log. No suite is skipped and no assertion is widened to accept an unlisted stage.

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --check extension/navigation-narrator.js && node --check scripts/navigation-blocking.test.mjs && node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs" "scripts/gate-integrity.test.mjs" "scripts/panel-typecheck-scope.test.mjs" && npx prettier --check scripts/gate-integrity.mjs extension/navigation-narrator.js scripts/navigation-blocking.test.mjs scripts/panel-typecheck-scope.test.mjs package.json research/raw/m041-navigation.json && npm run check && npm test
```

## Held-out

E6, E7, E8, E10

## Log

- (no entries yet)