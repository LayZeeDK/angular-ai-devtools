---
id: T006
title: Re-capture behind an opt-in switch, rule the claims and close the gate
wave: 6
deps:
  - T004
  - T005
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/error-boundary-capture.test.mjs
  - scripts/error-boundary-measure.test.mjs
  - extension/error-boundary.test.mjs
  - scripts/panel-error-boundary.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - extension/agent-main.test.mjs
  - research/raw/m042-error-boundary.json
  - research/raw/m042-verdict-claims.json
  - .project/research/SYNTHESIS.md
---

# T006 — Re-capture behind an opt-in switch, rule the claims and close the gate

## Context

The milestone's readings are one JSON file that five suites read: the measurement suite re-derives it, the join's suite pins the values it answers with, the pane's suite holds its sample fact to it, the agent's suite holds the record shape to it, and this task's own capture suite adds the half none of them can prove offline. A recording nobody can re-take is an assertion dressed as evidence, so the re-capture is a deliverable rather than a convenience, and it is armed behind an opt-in switch so that a default run stays a read: a suite that rewrites a tracked file on every `npm test` would make the working tree move under a reviewer.

Two artefacts the gates read do not exist yet. The claims suite resolves its milestone from the bound branch and refuses a missing claim list, so the project gate cannot be green without `research/raw/m042-verdict-claims.json`, and every row of it has to quote the intent character for character. And the archive's preflight requires a synthesis at `.project/research/SYNTHESIS.md`; this milestone ran no research phase and no decide phase, so the honest synthesis is written at archive time, from artefacts already in the tree, and says exactly that.

This task also carries the milestone's fifth criterion half that no earlier task could prove: the same raw window error reaching the finding through the handler on a subject that declares the browser global error listeners, and answering the named absence on a subject that declares none. That difference is a property of two subjects, so it belongs in a capture suite rather than in a pure join.

## Approach

Three deliverables and one gate, in that order.

The re-capture is one armed path. Every section of the recording is derived at run time from the artefacts already in the checkout — the two installed core versions, the agent's own source, the fixture's install and the recorded measurements — and written in one canonical form, so a second armed run is byte-identical. Nothing is written at all unless the switch is set, and an unarmed run names every file it would have written, so the difference between a read and a write is visible rather than inferred.

The claim list rules each of the six criteria by name, quoting the intent's own sentence, and every required row names the source page, the driver, the instance and the verdict path it rests on. The quotations are held to the intent rather than to a copy of it: a criterion that is re-worded reddens the row that quoted the old words.

The capture suite holds the SC5 difference: one throw, two subjects — one declaring the browser global error listeners, one declaring none — and the two answers that follow, neither of them rendered as no errors occurred. It is the one place the milestone states that the absence of raw browser errors on a subject without the listeners is not evidence that none occurred.

Then the gate. `npm run check` and `npm test` are the project's own verify, and they can only be green once every earlier wave has landed, so this task records that reading rather than asserting it, and names every suite in that gate which returned early for a missing build output rather than counting the early return as a measurement.

Two mutants redden named assertions naming their defects, so the re-capture and the claim list are shown to be able to fail.

## Interface contract

- Record: the page agent publishes a boundary section beside its change-detection and router records, each entry `{ route, error: { name, message, cause }, details: { declarationType, declarationInstanceName, caughtBy, boundaryType, boundaryReset }, at }`, where `route` is `hook` or `handler`, every field the record did not carry is `null`, and `cause` is present only where the boundary wrapped a value that is not Error-like.
- Answer: `readErrorBoundary(record)` answers `{ state, absence, findings, absences, version }` where `state` is `caught`, `cannot-tell` or `idle`, `absence` is one of the named absences or `null`, each finding is `{ declaringType, throwingType, caughtBy, reset, errorName, errorMessage, cause, route, replacedSubtree }`, and `absences` lists one named absence per unanswered question.
- Pane answer: `errorBoundaryPanel(answer)` answers `{ state, message, lines, text, cells }` where each cell holds the text of its own state or the empty string, and `lines` carries one line per fact the answer carried.

## Intent coverage

- SC5
- SC6

## Edges

E10, held-out and in this task's own capture suite.

## Acceptance criteria

1. A default run writes nothing and names every file it would write.
2. With `M042_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run changes no byte.
3. No reported value is pinned as a literal: each is re-derived from the installed chunk, the agent's own source or the fixture's install, and a moved source reddens the derivation that names it.
4. The claim list rules SC1 to SC6, answering each criterion by name and quoting it verbatim from the intent, and every required row names its source page, driver, instance and verdict path.
5. Held-out E10: the same raw window error is reported through the handler on a subject that declares the browser global error listeners and as `no-global-error-listeners` on the same throw on a subject that declares none, and neither answer is rendered as no errors occurred.
6. The project gate is green at the head with the claim list present, and the log names every suite in that gate which returned early for a missing build output rather than counting the early return as a measurement.
7. Two mutants redden named assertions naming their defects.
8. The archive's required synthesis exists at `.project/research/SYNTHESIS.md`, headed as authored at archive time, stating with the record that no research and no decide phase ran, synthesising only artefacts already in the tree, and claiming no independent research.

## Verify

```bash
node --check scripts/error-boundary-capture.test.mjs && node --experimental-strip-types --test "scripts/error-boundary-capture.test.mjs" "scripts/error-boundary-measure.test.mjs" "extension/error-boundary.test.mjs" "scripts/panel-error-boundary.test.mjs" && npx prettier --check scripts/error-boundary-capture.test.mjs && npm run check && npm test
```

## Held-out

E10 in `scripts/error-boundary-capture.test.mjs`, proven non-vacuously; E12 and E13 remain T002's and this task must not redden them.

## Log

- pending
