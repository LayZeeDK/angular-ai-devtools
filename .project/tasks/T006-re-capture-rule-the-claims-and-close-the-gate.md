---
id: T006
title: Re-capture behind an opt-in switch, rule the claims and close the gate
wave: 6
deps:
  - T004
  - T005
status: done
agent: coding-subagent
base: d4bffc9eeb68b03f943277f9ca7767a3d0d8cdec
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
- Re-cut `scripts/error-boundary-measure.test.mjs`. The 22-of-29 red was one anchor: `var prev = prevEpochs.get(instance);`, which T002 replaced with `var prev = keyed ? prevEpochs.get(instance) : null;` at `extension/agent-main.js:1025`, so the suite failed on a guard that made SC6 true. It now pins the property and not the sentence. The function that owns the map's write is derived from the write's own line (`readEpochOwner` -> `extension/agent-main.js:1021-1036`, `owns: diffEpochs`, `readsTheMapBeforeWritingIt: true`), and the guard is measured by driving the shipped file: four non-keyed identities (`undefined`, `null`, `number`, `string`) over two passes each with `n0` moved between them, naming nothing in either pass and throwing nothing, and a keyed identity whose second pass still names `["n0"]` and whose third names nothing (`instrument.repair.keyedSkip`). 32 tests, 22 of them held-out mutants.
- The recording was re-captured in its new canonical form and is byte-stable: `M042_CAPTURE=1` twice, sha256 `66fffff961ffa2897b63c8877f249c05a5c1ebd13def29570df00bb4d75ca565` before and after both passes. `instrument.throw` keeps the defect as the base measured it — line 1034, `prevEpochs.set(instance, next)`, the constructor and message now derived from the S10 citation at `.project/research/s10-answer.md:310`, `frameRecordLostAtTheBase: true` — and adds `reproducedAtThisHead: false`, which is measured rather than asserted. `instrument.epochs` is unchanged, `movedOne ["n0"]`, `movedBoth ["n0","n1"]`, `held []`, `firstPass []`, `afterReset []`: E12 and E13's anchor.
- `scripts/error-boundary-capture.test.mjs` is new, opt-in and read-only by default: 14 tests, 8 of them held-out mutants. A default run prints the recording's sha256 before and after (`66ffff…a565` both times), asserts they are equal, names the one file an armed run would write, and spawns nothing; `M042_CAPTURE=1` runs the derivation that owns every section twice and requires the second pass to change no byte, then holds the file to its own canonical serialisation.
- Held-out E10 is driven through the shipped code rather than through a record written by hand: `extension/agent-main.js` booted in this realm against two injectors that differ by exactly one provider record (`GlobalErrorListeners`), `boundaryWalk` answering `declared` on one and `no-global-error-listeners` on the other, and one raw `TypeError` delivered to the `onViewError` hook the agent installed on the declaring subject. The join answers one finding with `route: "handler"`, the raw error's own name and message, no declaring component and no `no-global-error-listeners`; on the subject that declares none it answers no finding, cannot-tell, and `no-global-error-listeners` among its absences. Neither answer reads "no errors occurred".
- `research/raw/m042-verdict-claims.json` rules SC1 to SC6 in six rows, `required: 0` / `notRequired: 6`, and each `criterionText` is parsed out of `.project/intent/INTENT.md` with the overlay suite's own routine rather than retyped: 506 / 572 / 248 / 286 / 489 / 459 characters, 2,560 quoted. `scripts/overlay-verdict-claims.test.mjs` is 10/10 with it present.
- `.project/research/SYNTHESIS.md` is the archive's synthesis, headed as authored at archive time, stating with the record that no research and no decide phase ran (`STATE.md:843-847` runs define -> plan -> build with neither between them) and synthesising only artefacts already in the tree, claiming no independent research.
- Mutants, each naming the defect it represents. Measure suite: `a throw cited on the wrong line` (`throw.line is 1 and the WeakMap key`); `a recording that blames the wrong emission` (`emissions.throwingIds is [3] and the run reddened [] instead`); `a recording that says the defect still reproduces` (`reproducedAtThisHead is true and the driven non-object frame threw 0`); `a repaired frame recorded as lost` (`undefinedInstance.records is 0 and the run measured 1`); `a non-keyed identity that kept an epoch record` (`the delta must be skipped for a non-keyed identity`); `a keyed identity whose delta was emptied` (`the epoch delta must still be read for a keyed identity`); `a repair claimed for a function that does not own the write` (`repair.owns is "serializeCheck"`); plus the earlier `silencing the moved-node list` (`epochs.movedOne is []`), `constant-folding the held list` (`epochs.held is ["n0"]`), `a keyed-by claim of anything but the instance` (`map.kind is "Map"`), the three hook-shape mutants, the quotation-anchor mutant, the three version mutants and the two boundary-count mutants, all unchanged. Capture suite: `a claim row that differs from the intent by one character` (`SC3 does not quote the INTENT criterion character for character`, with the one-character distance asserted before the mutant is used); `a criterion no row rules` (`SC5 is declared by the intent and ruled by no row`); `a row that names no command` (`SC1 must name the command that proves it`); `a recording that drifted from its canonical serialisation` (`the recording drifted from its canonical serialisation at byte 4`); `a declaring subject whose answer carries the absence`; `a subject that declares none answering with a finding`; `a subject whose walk answered the other way`.
- The task's Verify ran verbatim and exited 0. `node --check scripts/error-boundary-capture.test.mjs` silent. The four declared suites `tests 85 / pass 85 / fail 0` (capture 14, measure 32, join and pane 39). `npx prettier --check scripts/error-boundary-capture.test.mjs` "All matched files use Prettier code style!". `npm run check` green, including `gate:verification` with its fourteen `check-tested` rows all `[OK]` and `format:check` clean. `npm test` green in five legs: `node --test` over `scripts/**`, `extension/**` and `src/**` `tests 1304 / suites 202 / pass 1304 / fail 0`; `run-user-scope-tests.mjs` `tests 60 / suites 9 / pass 60 / fail 0`; `test:skills` `tests 628 / pass 628 / fail 0`; `test:app` `Test Files 31 passed, Tests 346 passed` — served from the nx cache (1/1 hit), so those 346 were not re-executed in this run and are reported as the cached result, not as a run this task watched; `test:held-out` `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed (6m 40s)`. ready.
