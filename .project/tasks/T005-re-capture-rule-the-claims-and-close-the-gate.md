---
id: T005
title: Re-capture behind an opt-in switch, rule the claims and close the gate
wave: 8
deps:
  - T004
  - T006
  - T007
  - T008
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/navigation-capture.test.mjs
  - research/raw/m041-navigation.json
  - research/raw/m041-verdict-claims.json
  - scripts/navigation-measure.test.mjs
  - scripts/navigation-blocking.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - extension/agent-main.test.mjs
  - scripts/panel-navigation.test.mjs
  - .project/research/SYNTHESIS.md
---

# T005 — Re-capture behind an opt-in switch, rule the claims and close the gate

## Context

The milestone's evidence is one committed recording and one committed claim list, and both
are read by suites that run on every default test run. The recording is what the join's
suite and the demo's sample fact pin, so it must be reproducible rather than
hand-maintained; the claim list is what resolves this milestone's criteria against the
portal clause at all, and it fails by construction when absent, because the claim-list
suite resolves the milestone from the bound branch and refuses a missing list rather than
skipping.

T001 showed that the recording's derivable half can be re-derived from the repository at
any head. This task completes that: an armed run re-measures and rewrites every section in
canonical form, an unarmed run writes nothing and says what it would write, and the claim
list rules each success criterion against the portal clause by name and with its own text
quoted.

The target question is answered per criterion rather than once. The portal's zoneless
checkout can produce a navigation and its terminal event, so a criterion whose facts a
portal route produces is portal-backed and says which route produced it; a criterion whose
facts are the panel itself or the project gate is not, and it is ruled not-required with
the reason named rather than with silence. Nothing here restates a measurement the
recording already carries.

This task is the last one in the plan, and it is last for a reason the build measured: its
one outstanding criterion is the project gate, and the gate was red on three defects no task
of the first five owned. The build blocked, the plan was repaired, and the repairs now run
before this task rather than beside it — a route-table repair that returns the panel's
initial bundle inside its recorded baseline (T006), a claims-binding repair that holds each
verdict list to its own milestone's intent (T007), and an audit repair that covers the seven
spike records the derived inventory lists (T008). Only after those land is the commit this
task runs the gate at one where `npm run check` and `npm test` can both be green, so this
task owns the measurement of the gate and nothing of the repairs' contents.

The archive owes one artefact that no earlier task could write, and this task is where it
belongs. `archive_milestone.REQUIRED_ARCHIVE_FILES` requires a research synthesis at the
archive's research/SYNTHESIS.md, and while this milestone is unarchived that path resolves
from the active research tree — so the file is authored here, at the head the gate closes
on, and the archive moves it into the milestone's own research directory. It follows the precedent the previous milestone's archive
records: headed as authored at archive time, stating that no research or decide phase ran for
this milestone and quoting the record that shows it, synthesising only artefacts that already
exist, and claiming no independent research. It is not a research phase in disguise and it
invents no measurement.

## Approach

Two artefacts, one switch and one archive obligation, with the gate behind them.

- `scripts/navigation-capture.test.mjs` owns the switch. Unarmed, it reads nothing it does
  not already have, writes nothing, and prints the exact list of files an armed run would
  write. Armed with `M041_CAPTURE=1`, it re-measures every section the recording carries —
  the event classes and key sets from the installed router, the codes, the reach path from
  the agent's own read, the fixture's guard name — and writes the recording in one
  canonical serialisation, sorted and stable, so a second armed run changes no byte.
- no reported value is pinned as a literal in the suite. Each is derived from the installed
  source or from the agent's own read path, and a moved source reddens the derivation that
  names it rather than leaving a stale number beside a stale sentence. Two suites outside this
  one pin the recording it re-captures — the agent's own suite and the pane suite — so both are
  declared here: if a re-captured value moves what they assert, they are re-cut in this task
  with the failing assertion quoted, and if nothing moves they are run unchanged.
- `research/raw/m041-verdict-claims.json` rules every success criterion. Each row carries
  the criterion's own text quoted from the intent, a ruling, and the reason the ruling
  holds: a portal-backed row names the route that produces its facts, the driver, the
  instance and the verdict path it writes; a not-required row names the artefact that
  carries the claim instead and why no portal route produces those facts. A required row
  that names no driver, no instance or no verdict path is the defect the claim-list suite
  exists to refuse.
- the two mutants are the two failures this shape invites: a claim row that silently drops
  a criterion, and an armed write that is not canonical so a second run moves a byte. Each
  reddens a named assertion and names its defect by string.
- `.project/research/SYNTHESIS.md` is the archive's own artefact, written in the shape the
  previous milestone's archive records. It opens by saying it was authored at archive time
  and that no research and no decide phase ran for this milestone, quoting the record that
  shows it — the `## Log` in `.project/STATE.md` running inspect → define → plan → build with
  no research and no decide entry between the intent's approval and the plan's, and the
  commit history of the research tree. It then synthesises only what already exists: the
  intent and its corrections, the carry-forward audit and the inspect delta, the milestone's
  own research note, the two recordings, the plan, the task files and the wave reviews. Where
  a fact is not in those artefacts it says so rather than supplying one, and no measurement
  appears in it that the recordings do not already carry.

The project gate is run at the head with all of it present, because two of the milestone's
suites read these files on every default run: `npm run check` and `npm test` are the
criterion, and their result is recorded in this task's Log rather than claimed. Two suites in
that gate measure the built panel output and skip, loudly and by their own design, when no
build is present; the Log names which of them measured and which skipped, so a skip is
recorded as a skip rather than counted as a measurement. The measured total belongs to
T006's Log, which builds; this task does not rebuild, because a rebuilt panel index artifact
is tracked and no repair wave owns it.

## Interface contract

- Measurement record: `research/raw/m041-navigation.json` carries `events.classes` (per class, its own recorded key set), `events.codes`, `reach` (the per-entry injector path with the `Router` token's entry index, the metadata source and the provider count), `held`, `warm`, `superseded`, `absences` and `guards`; every time is the page's own `performance.now()` reading at receipt, and every quoted payload keeps the keys the event carried and no others.
- Intent resolver: `intentPathForMilestone(root, milestone)` answers the absolute path of the intent that milestone's verdict claims are held to — the milestone's own intent under `.project/archive/` when it is archived, `.project/intent/INTENT.md` when the bound branch in `.project/STATE.md` names that milestone, and otherwise a raised error whose message names the milestone and every candidate path it tried; the milestone token may be written `M040`, `040` or `40`, and a token naming no milestone is the same refusal.

## Intent coverage

- SC6

## Acceptance criteria

1. An unarmed run writes nothing and names every file it would write.
2. With `M041_CAPTURE=1` every section is re-derived and written in canonical form, and a second armed run changes no byte.
3. No reported value is pinned as a literal: each is re-derived from the installed router's source or the agent's own read path, and a moved source reddens the derivation naming it.
4. The claim list rules every success criterion, answering the portal clause by name and quoting each criterion verbatim, and every required row names its source page, driver, instance and verdict path.
5. The project gate is green at the head with the claim list present: `npm run check` and `npm test` both pass at the landed commit, and the Log names every suite in that gate which skipped for a missing build rather than counting the skip as a measurement.
6. Two mutants redden named assertions naming their defects: one drops a criterion from the claim list, and one makes the armed write non-canonical.
7. The archive's required synthesis exists and claims nothing it did not read: `.project/research/SYNTHESIS.md` is headed as authored at archive time, states with the record that no research phase and no decide phase ran for this milestone, synthesises only artefacts already in the tree — the intent and its corrections, the carry-forward audit, the inspect delta, the milestone's research note, the two recordings, the plan, the task files and the wave reviews — and claims no independent research, so that the archive's required research synthesis resolves from it.

## Verify

```bash
node --check scripts/navigation-capture.test.mjs && node --experimental-strip-types --test "scripts/navigation-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-blocking.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/navigation-capture.test.mjs && npm run check && npm test
```

## Log

- pending
- T005's own half is green and the project gate is red, so the task is recorded blocked rather than landed. The three artefacts the interrupted run left were validated, not re-captured: `node --check scripts/navigation-capture.test.mjs` passes and the suite is complete at 2036 lines and 11 tests, ending in the read-only pin; the unarmed run wrote nothing — `research/raw/m041-navigation.json` sha256 1eb9b8a9078de66512c978df77f67bbede8f499c485200aeffd5b84fec4155bf (85,762 B) and `research/raw/m041-verdict-claims.json` sha256 b176cbac6746a2f91c9819b59781c340901f96b4534016d6c1ab85755fa07067 (16,545 B) before and after the run, printed by the suite and re-hashed outside it, 11 pass 0 fail; the armed path was not re-run and no browser was driven. The claim list rules all six criteria and every `criterionText` is the intent's own text character for character — SC1 460, SC2 265, SC3 278, SC4 462, SC5 399, SC6 48 characters, 1,912 quoted characters in total, re-parsed from `.project/intent/INTENT.md` with the suite's own reader — and `scripts/overlay-verdict-claims.test.mjs` is 10/10. The recording is the canonical serialisation of its own record and its one stale pin was already re-cut by the re-capture: `reach.readFrom` moved from T001's `handleDiQuery` at `extension/agent-main.js:1075-1253` to the widened agent's own `routerTokenFrom` at `extension/agent-main.js:1750-1839` (through the end of `routerSubscribe`, and `ɵgetInjectorMetadata` dropped from the cited calls because the read no longer calls it), with `scripts/navigation-measure.test.mjs` re-cut in step — `agentRouterRead` now spans `function routerTokenFrom(` to the end of `routerSubscribe`; 28 tests pass and the derivation plans nothing to move. The Verify block was run unmodified (336 bytes, exactly as T005 states it, through the batch holding that line): the four suites 63 tests / 12 suites / 63 pass / 0 fail, `npx prettier --check scripts/navigation-capture.test.mjs` "All matched files use Prettier code style!", `npm run check` green through every stage including `gate:verification` and `format:check`, then `npm test` 1,177 tests / 183 suites / 1,172 pass / 5 fail and exit 1. The five failures are outside this task's declared files and none reads an artefact T005 wrote: `scripts/docs-audit-disposition.test.mjs:620` (E6 — the inventory the gate derives carries seven `research/spikes/*.md` documents the head audit does not cover: README, capability-dependency-matrix, instrumentation-free-coverage, s11-answer, s12-answer, s13-answer and sourcemap-future-scope); `scripts/panel-bundle-budget.test.mjs:441` twice and `scripts/image-budget.test.mjs:92` (the panel's eager initial total 535.50 kB against M040's pre-milestone 535.44 kB baseline, and a fresh `npx nx run angular-ai-devtools:build-extension` at this head prints 535.62 kB); and `scripts/performance-capture.test.mjs:1937` (M040's suite holds `research/raw/m040-verdict-claims.json` to the live `.project/intent/INTENT.md`, which is now M041's intent). Independence was measured rather than asserted: with both new artefacts moved aside the same four files fail identically, same lines, 5 failures, and the panel dist the budget test read predated T001. `npm test`'s later legs — `run-user-scope-tests.mjs`, `test:skills`, `test:app` and `test:held-out` — did not run because the first leg failed under `&&`. `gsd land-check --task-id T005` reported BLOCKED before this entry: "undeclared path changed: .commandcode/taste/communication/taste.md" and "appended Log entry records no ready or blocked verdict"; this entry clears the second, and no landing was attempted because the gate must be green first. No assertion was weakened and no pin re-cut to reach green; the gate needs a plan repair covering the docs audit, the panel bundle budget and M040's intent binding. blocked
- 2026-11-09 — plan repair: this task is resequenced to wave 8 with deps T004, T006, T007 and T008, and its files grow by `.project/research/SYNTHESIS.md`. The three defects the gate measured are now three tasks of their own — T006 returns the panel's initial bundle to its recorded baseline by collapsing thirteen identical lazy loaders into one, T007 holds each verdict claim list to its own milestone's intent through one resolver, and T008 audits the seven `research/spikes/` records the derived inventory lists, so the docs-audit gate passes on coverage rather than on an exemption. This task cannot close the gate before them, and no task may depend on a later wave, so it moves to the last wave; its acceptance criteria 1-4 and 6 are unchanged, criterion 5 now records which suites skipped for a missing build instead of counting a skip as a measurement, and the new criterion 7 adds the archive's required research synthesis, authored at this head from artefacts that already exist.
