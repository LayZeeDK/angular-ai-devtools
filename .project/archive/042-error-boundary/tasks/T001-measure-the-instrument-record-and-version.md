---
id: T001
title: Measure the instrument's throw, the hook record and the version discriminator
wave: 1
deps: []
status: done
agent: coding-subagent
base: 35ecbb37db448de36c099ce7ee9af77b2615bc86
worktree: null
task_branch: null
files:
  - scripts/error-boundary-measure.test.mjs
  - research/raw/m042-error-boundary.json
---

# T001 — Measure the instrument's throw, the hook record and the version discriminator

## Context

Three readings the plan depends on were taken before this plan existed, and none of them was taken in a way that can be re-run at this head. The first is the shipped agent's own `TypeError` at `extension/agent-main.js:1034`: S10 observed it land in the app's `ErrorHandler` and in the page's error listener twice per page, and deliberately left the trigger uninvestigated. The second is the boundary hook's record: two `details` shapes exist for two catch paths, only the second was measured, and the measurement came from a browser tab that is gone. The third is the version caveat: this repository installs Angular core 22.1.8 while the portal and the fixture run 22.2.2, and nothing has asked whether a page can be made to say which of the two it runs.

Each of the later tasks quotes one of the three. T002's guard needs to know which emission carries a non-object identity and what the epoch record holds, or it cannot tell a repair from a silencing. T003's record shape has to be the shape this commit's core emits, or the reader reads fields nobody writes. T004's version absence has to rest on a measured discriminator, or the surface either invents a version or refuses a page it could have answered. This task therefore measures all three at this head, writes the readings under `research/raw/`, and gives the suite that re-derives them its own pass.

## Approach

One suite, one recording, no product change and no page. The suite derives every claim from the three artefacts that are in this checkout: the shipped agent's own source, the fixture's installed core at 22.2.2, and this repository's own install at 22.1.8. Where a claim can only be a measurement of a page, the recording quotes what S10 measured and names where, and the suite holds the quotation to the source anchor it cites rather than to a memory.

The throw is reproduced deterministically. The agent is evaluated in Node's own realm with `ng`, `CustomEvent`, `dispatchEvent` and `performance` mocked, the way its own suite already boots it, and the profiler subscriber the file installs is then driven with the instance shape the boundary machinery's block views hand it. The reproduction records the error's constructor and message, the emission that produced it, and whether the frame record reached the page's dispatch at all — the last of which is the part S10 did not observe, and the part that decides how much the defect costs.

The epoch record is measured, not described. The suite reads what the map keys by, drives one check whose node epoch moves and one whose epoch holds, and records the exact list each produces. That recording is what makes a repair falsifiable in both directions: a guard that stops the throw by never writing the map, or by answering an empty list, contradicts it.

The hook record and the version discriminator are read from source. For the fixture's install the suite records the call sites, the two `details` object shapes, the error view's context keys and where each is declared; for this repository's install it records the same searches returning nothing, which is the absence the intent's scope turns into an obligation. Then it asks the version question properly: the published debug surface's key list, the resolved handler's own keys and the text of its class, and the injector provider records for the handler token, each read on both installs. Whichever of those a page can answer is the discriminator the surface may use; if none can, the recording says so and the reader declares the version it works against instead of reading it.

Nothing is written unless the run is armed, so `npm test` stays a read, and a missing fixture install fails with the path it wanted rather than skipping.

## Interface contract

- Record: the page agent publishes a boundary section beside its change-detection and router records, each entry `{ route, error: { name, message, cause }, details: { declarationType, declarationInstanceName, caughtBy, boundaryType, boundaryReset }, at }`, where `route` is `hook` or `handler`, every field the record did not carry is `null`, and `cause` is present only where the boundary wrapped a value that is not Error-like.
- Answer: `readErrorBoundary(record)` answers `{ state, absence, findings, absences, version }` where `state` is `caught`, `cannot-tell` or `idle`, `absence` is one of the named absences or `null`, each finding is `{ declaringType, throwingType, caughtBy, reset, errorName, errorMessage, cause, route, replacedSubtree }`, and `absences` lists one named absence per unanswered question.
- Pane answer: `errorBoundaryPanel(answer)` answers `{ state, message, lines, text, cells }` where each cell holds the text of its own state or the empty string, and `lines` carries one line per fact the answer carried.

## Intent coverage

- SC1
- SC6

## Edges

None; the edge dispositions this milestone carries are held by T002, T004 and T006.

## Acceptance criteria

1. The throw is reproduced deterministically inside the suite at this head by driving the shipped agent's own profiler subscriber with the instance shape that provokes it, and the run records the error's constructor and message, the emission that produced it, whether the frame record reached the page's dispatch, and which of the two per-page occurrences the reproduction stands for.
2. The epoch record the repair must preserve is measured at this head: what the map keys by, what each per-check changed-node list contains when a node's epoch moves, what it contains when the epoch holds, and what a reader sees where no record exists — so a repair that deletes, empties or constant-folds that list is contradicted by the recording rather than by a reviewer's opinion.
3. The hook record is re-read at this head from the fixture's installed core at 22.2.2 and from this repository's own install at 22.1.8: the two details shapes and the fields each carries, the error view's own context keys, and the exact absence of the boundary machinery in the 22.1.8 install, each quoted with its own source anchor.
4. The page-observable version discriminator is measured by enumeration rather than assumed — the published debug surface's key list, the resolved handler's own keys and its class source, and the injector provider records for the handler token — on both installs, and the recording states whether a page can report its own core version at all and, where it cannot, what evidence is left.
5. Every claim is re-derived by the suite from the installed chunk, the agent's own source or the fixture's install, or is quoted as the recording's own measurement with its source named, and the run writes nothing unless armed, adds nothing to any page, and fails by naming a missing install rather than skipping.

## Verify

```bash
node --check scripts/error-boundary-measure.test.mjs && node --experimental-strip-types --test "scripts/error-boundary-measure.test.mjs" && npx prettier --check scripts/error-boundary-measure.test.mjs research/raw/m042-error-boundary.json && npm run check
```

## Held-out

None; E12 and E13 are T002's and this task must not redden them.

## Log

- pending
- ready - the throw, the epoch record and the version discriminator are measured at this head: the recording is research/raw/m042-error-boundary.json, the suite is scripts/error-boundary-measure.test.mjs with 29 tests and 16 named mutants, and the Verify ran verbatim and passed. ready
