---
id: T004
title: Re-capture behind an opt-in switch, rule the claims and close the gate
wave: 4
deps:
  - T002
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/stability-capture.test.mjs
  - research/raw/m043-verdict-claims.json
  - .project/research/SYNTHESIS.md
---

# T004 — Re-capture behind an opt-in switch, rule the claims and close the gate

## Context

The milestone's readings are one recording that four suites read: the measurement suite re-derives it, the join's suite drives its held-out pins from it, the demo suite holds its sample fact to it, and this task's own capture suite adds the half none of them can prove offline. A recording nobody can re-take is an assertion dressed as evidence, so the re-capture is a deliverable rather than a convenience, and it is armed behind an opt-in switch so that a default run stays a read: a suite that rewrote a tracked file on every `npm test` would move the working tree under a reviewer.

Two artefacts the gates read do not exist yet. `scripts/overlay-verdict-claims.test.mjs` resolves its milestone from `.project/STATE.md`'s branch and refuses a missing claim list, so the project gate cannot be green without `research/raw/m043-verdict-claims.json`, and every row of it has to quote the intent character for character because the suite compares the two rather than a copy of them. And the archive's preflight requires a synthesis at `.project/research/SYNTHESIS.md`; this milestone ran no research phase and no decide phase, so the honest synthesis is written at archive time, from artefacts already in the tree, and says exactly that.

This task also carries the milestone's one criterion that no earlier task could prove: two pages in one browser session, each reporting its own state and its own settle reading, with no emission from one page attributed to the other. That difference is a property of two subjects rather than of a pure function, so it belongs in a capture suite — and it is the reading SC6's failure mode is measured against, because a second page's silence can never be the first page's stability.

## Approach

Three deliverables and one gate, in that order.

The re-capture is one armed path. The measurement suite owns the derivation of every section, so an armed run executes that derivation twice and requires the second pass to change no byte; a default run writes nothing, prints the recording's sha256 before and after, asserts they are equal, and names every file an armed run would write. Nothing reported is pinned as a literal: each value is re-derived from the installed chunk, the agent's own source or the fixture's install, so a moved source reddens the derivation that names it instead of a recording that quietly kept the old reading.

The claim list rules each of the six criteria by name, quoting the intent's own sentence, and every row states its ruling and the reason that answers the charter's portal clause — the portal's own stability readings are the subject those reasons name, and no row claims a driver this repository does not have. The quotations are held to the intent rather than to a copy of it: a criterion that is re-worded reddens the row that quoted the old words.

The capture suite holds the two-page half: one browser session, two pages, each page's own `isStable` emission and its own attach reading, and an assertion that no emission from one page is attributed to the other. It runs only when armed, so the default path stays a read with no browser, no server and no port.

Then the gate. `npm run check` and `npm test` are the project's own verify, and they can only be green once every earlier wave has landed, so this task records that reading rather than asserting it, and names every suite in that gate which returned early for a missing build output rather than counting the early return as a measurement. Two mutants redden named assertions naming their defects, so the re-capture and the claim list are shown to be able to fail.

## Interface contract

- Record: the page agent publishes a `stability` section beside its `events`, `routerEvents`, `boundary` and `checks` fields — `{ reachedBy, absence, attachAt, reading, settle, version, coreVersion }` — where `reachedBy` is the token the injector walk resolved or `null`, `absence` is `null` or `no-stability-observable`, `attachAt` is the page's own `performance.now()` at attach, `reading` is `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when it arrived — or `null`, `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`, `version` is the constant the surface works against, and `coreVersion` is what the page reported, `null` where it reported none.
- Answer: `stability(frame)` answers `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` where `state` is `unstable`, `stable`, `cannot-tell` or `idle`, `settle` is `{ state: "settled", at, sinceAttachMs }` or `{ state: "no-settle-observed" }`, each repeat is `{ pair, componentName, passes }` read from the frame's own `events`, and `absences` lists one named absence per unanswered question.
- Pane answer: `stabilityPanel(answer)` answers `{ state, kind, message, lines, text, cells, blocks }` where each cell holds the text of its own state or the empty string, `lines` carries one line per fact the answer carried, and `blocks` carries one block per reading — the state, the settle reading and the repeated work — each holding its own lines.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5
- SC6

## Edges

E11, held-out and in this task's own capture suite.

## Acceptance criteria

1. A default run writes nothing, prints the recording's sha256 before and after and asserts they are equal, and names every file an armed run would write.
2. With `M043_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run at the same head changes no byte.
3. No reported value is pinned as a literal: each is re-derived from the installed chunk, the agent's own source or the fixture's install, and a moved source reddens the derivation that names it.
4. The claim list rules SC1 to SC6, answering each criterion by name and quoting it verbatim from the intent, and every row states its ruling and a reason that answers the charter's portal clause by name, naming its source page, driver, instance and verdict path where a row is required.
5. Held-out E11: two pages in one browser session each report their own state and their own settle reading, and no stability emission from one page is attributed to the other.
6. The project gate is green at the head with the claim list present, and the log names every suite in that gate which returned early for a missing build output rather than counting the early return as a measurement.
7. Two mutants redden named assertions naming their defects.
8. The archive's required synthesis exists at `.project/research/SYNTHESIS.md`, headed as authored at archive time, stating with the record that no research and no decide phase ran, synthesising only artefacts already in the tree and claiming no independent research.

## Verify

```bash
node --check scripts/stability-capture.test.mjs && node --experimental-strip-types --test "scripts/stability-capture.test.mjs" "scripts/stability-measure.test.mjs" "extension/stability-narrator.test.mjs" "scripts/panel-stability.test.mjs" && npx prettier --check scripts/stability-capture.test.mjs research/raw/m043-verdict-claims.json && npm run check && npm test
```

## Held-out

E11 in `scripts/stability-capture.test.mjs`, proven non-vacuously; E1 to E10 remain T002's and T003's and this task must not redden them.

## Log

- pending
